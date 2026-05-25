from __future__ import annotations

import asyncio
import hashlib
import json
import re
from collections.abc import Iterable
from datetime import datetime
from typing import Any
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

import httpx

from app.core.chroma import add_grants
from app.core.embeddings import embed_batch
from app.db import save_grants


# ── Source URLs ──────────────────────────────────────────────────────────────

# Grants.gov REST search API (no auth required).
# POST with flat JSON body; response: {"data": {"oppHits": [...], ...}}
GRANTS_GOV_URL = "https://api.grants.gov/v1/api/search2"
GRANTS_GOV_BODY: dict[str, Any] = {
    "keyword": "fellowship grant scholarship",
    "oppStatuses": "posted|forecasted",
    "rows": 100,
    "startRecordNum": 0,
}

# Opportunity Desk RSS feed (publicly listed, robots.txt allows crawlers).
OPPORTUNITY_DESK_RSS = "https://opportunitydesk.org/feed/"

# NSF Award Search API – structured JSON, no auth required.
NSF_AWARDS_URL = "https://api.nsf.gov/services/v1/awards.json"
NSF_AWARDS_PARAMS = {"keyword": "fellowship", "printFields": "id,title,abstractText,agency,awardeeName,date,fundsObligatedAmt"}

# World Bank Projects search API – structured JSON, no auth required.
# Returns {"projects": {"<id>": {id, project_name, totalamt, boardapprovaldate, url, project_abstract}, ...}}
WORLD_BANK_URL = "https://search.worldbank.org/api/v2/projects"
WORLD_BANK_PARAMS: dict[str, Any] = {
    "format": "json",
    "fl": "id,project_name,boardapprovaldate,totalamt,pdo,url,project_abstract",
    "rows": 100,
}


# ── Robots.txt helpers ────────────────────────────────────────────────────────

async def _is_allowed(client: httpx.AsyncClient, url: str) -> bool:
    """Return True if the URL is (probably) allowed by robots.txt.

    Only checks ``User-agent: *`` Disallow directives.  Errs on the side of
    allowing when the robots.txt is unreachable or malformed.
    """
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        resp = await client.get(robots_url, timeout=10.0)
        if resp.status_code != 200:
            return True  # no robots.txt → assume allowed
        text = resp.text
    except httpx.HTTPError:
        return True  # unreachable → assume allowed

    path = parsed.path or "/"
    in_star_section = False
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        lower = line.lower()
        if lower.startswith("user-agent:"):
            agent = line.split(":", 1)[1].strip()
            in_star_section = agent == "*"
        elif lower.startswith("disallow:") and in_star_section:
            disallowed = line.split(":", 1)[1].strip()
            if disallowed and path.startswith(disallowed):
                return False
    return True


# ── Shared normalisation helpers ──────────────────────────────────────────────

def _fallback_identifier(*parts: str) -> str:
    seed = "|".join(part.strip().lower() for part in parts if part)
    if not seed:
        return hashlib.sha1(str(datetime.utcnow().timestamp()).encode("utf-8")).hexdigest()[:16]
    return hashlib.sha1(seed.encode("utf-8")).hexdigest()[:16]


def _guess_country(text: str) -> str:
    lowered = text.lower()
    if any(token in lowered for token in ("us", "usa", "united states", "american")):
        return "United States"
    if any(token in lowered for token in ("canada", "canadian")):
        return "Canada"
    if any(token in lowered for token in ("uk", "united kingdom", "britain", "british")):
        return "United Kingdom"
    if any(token in lowered for token in ("global", "international", "worldwide")):
        return "Global"
    return "Unknown"


def _guess_field(text: str) -> str:
    lowered = text.lower()
    field_keywords = {
        "STEM": ["stem", "science", "technology", "engineering", "math", "mathematics", "computer"],
        "Business": ["business", "finance", "management", "entrepreneur"],
        "Healthcare": ["nursing", "medical", "health", "pharmacy", "medicine"],
        "Education": ["education", "teacher", "teaching", "student"],
        "Arts": ["art", "music", "design", "creative", "film"],
        "Law": ["law", "legal", "justice"],
    }
    for label, keywords in field_keywords.items():
        if any(keyword in lowered for keyword in keywords):
            return label
    return "General"


def _normalize_amount(value: Any) -> str:
    if value in (None, ""):
        return ""
    if isinstance(value, (int, float)):
        return f"${value:,.0f}"
    return str(value).strip()


def _normalize_deadline(value: Any) -> str:
    if value in (None, ""):
        return ""
    return str(value).strip()


def _normalize_grant(payload: dict[str, Any], source_url: str) -> dict[str, Any]:
    title = str(
        payload.get("title") or payload.get("name") or payload.get("oppTitle")
        or payload.get("subject") or ""
    ).strip()
    description = str(
        payload.get("description") or payload.get("summary") or payload.get("content")
        or payload.get("details") or payload.get("abstractText") or ""
    ).strip()
    provider = str(
        payload.get("provider") or payload.get("organization") or payload.get("agency")
        or payload.get("awardeeName") or payload.get("source") or ""
    ).strip()
    amount = _normalize_amount(
        payload.get("amount") or payload.get("awardAmount") or payload.get("fundsObligatedAmt") or payload.get("value")
    )
    deadline = _normalize_deadline(
        payload.get("deadline") or payload.get("closingDate") or payload.get("dueDate")
        or payload.get("date") or payload.get("closeDate")
    )
    body = " ".join([title, description, provider, source_url])

    return {
        "id": str(
            payload.get("id") or payload.get("guid") or payload.get("uuid")
            or _fallback_identifier(title, source_url)
        ),
        "title": title or "Untitled opportunity",
        "provider": provider or urlparse(source_url).netloc,
        "description": description or title,
        "amount": amount,
        "deadline": deadline,
        "country": str(payload.get("country") or _guess_country(body)),
        "field": str(payload.get("field") or _guess_field(body)),
        "type": str(payload.get("type") or payload.get("opportunityType") or "Grant").strip() or "Grant",
        "source_url": source_url,
    }


# ── Source-specific parsers ───────────────────────────────────────────────────

def _parse_json_payload(text: str) -> list[dict[str, Any]]:
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        return []

    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("opportunities", "oppHits", "results", "data", "items", "records"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
        return [payload]
    return []


def _parse_rss(text: str) -> list[dict[str, Any]]:
    root = ET.fromstring(text)
    items: list[dict[str, Any]] = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        description = (item.findtext("description") or item.findtext("summary") or "").strip()
        items.append(
            {
                "id": _fallback_identifier(title, link),
                "title": title,
                "provider": "Opportunity Desk",
                "description": description,
                "amount": "",
                "deadline": item.findtext("pubDate") or "",
                "country": _guess_country(f"{title} {description}"),
                "field": _guess_field(f"{title} {description}"),
                "type": "Scholarship",
                "source_url": link or OPPORTUNITY_DESK_RSS,
            }
        )
    return items


# ── Fetch functions ───────────────────────────────────────────────────────────

async def fetch_grants_gov(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    """POST to api.grants.gov/v1/api/search2 with a JSON body.

    Response envelope: {"data": {"oppHits": [{id, title, agency, closeDate, ...}], ...}}
    """
    if not await _is_allowed(client, GRANTS_GOV_URL):
        return []
    try:
        response = await client.post(
            GRANTS_GOV_URL,
            json=GRANTS_GOV_BODY,
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
    except httpx.HTTPError:
        return []

    try:
        envelope = response.json()
    except Exception:
        return []

    opp_hits: list[dict[str, Any]] = (
        (envelope.get("data") or {}).get("oppHits")
        or []
    )
    if not isinstance(opp_hits, list):
        opp_hits = []

    grants: list[dict[str, Any]] = []
    for hit in opp_hits[:100]:
        opp_id = hit.get("id", "")
        link = (
            f"https://www.grants.gov/search-results-detail/{opp_id}"
            if opp_id
            else GRANTS_GOV_URL
        )
        grants.append(
            _normalize_grant(
                {
                    "id": opp_id,
                    "title": hit.get("title", ""),
                    "provider": hit.get("agency", ""),
                    "deadline": hit.get("closeDate", ""),
                    "type": "Grant",
                },
                link,
            )
        )
    return grants


async def fetch_opportunity_desk(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    """Fetch the Opportunity Desk RSS feed."""
    if not await _is_allowed(client, OPPORTUNITY_DESK_RSS):
        return []
    try:
        response = await client.get(OPPORTUNITY_DESK_RSS)
        response.raise_for_status()
    except httpx.HTTPError:
        return []

    try:
        return _parse_rss(response.text)
    except ET.ParseError:
        return []


async def fetch_nsf_awards(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    """Fetch NSF award search results (structured JSON, no auth)."""
    if not await _is_allowed(client, NSF_AWARDS_URL):
        return []
    try:
        response = await client.get(NSF_AWARDS_URL, params=NSF_AWARDS_PARAMS)
        response.raise_for_status()
    except httpx.HTTPError:
        return []

    try:
        data = response.json()
    except json.JSONDecodeError:
        return []

    # NSF JSON: {"response": {"award": [...]}}
    awards = (data.get("response") or {}).get("award") or []
    grants: list[dict[str, Any]] = []
    for award in awards[:100]:
        award_id = award.get("id", "")
        link = f"https://www.nsf.gov/awardsearch/showAward?AWD_ID={award_id}" if award_id else NSF_AWARDS_URL
        grants.append(
            _normalize_grant(
                {
                    "id": award_id,
                    "title": award.get("title", ""),
                    "description": award.get("abstractText", ""),
                    "provider": award.get("agency", "NSF"),
                    "amount": award.get("fundsObligatedAmt", ""),
                    "deadline": award.get("date", ""),
                    "type": "Fellowship/Award",
                },
                link,
            )
        )
    return grants


async def fetch_world_bank_grants(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    """Fetch World Bank project search results (structured JSON, no auth).

    Response envelope: {"projects": {"<id>": {id, project_name, totalamt, ...}, ...}}
    """
    if not await _is_allowed(client, WORLD_BANK_URL):
        return []
    try:
        response = await client.get(WORLD_BANK_URL, params=WORLD_BANK_PARAMS)
        response.raise_for_status()
    except httpx.HTTPError:
        return []

    try:
        envelope = response.json()
    except Exception:
        return []

    projects_raw = envelope.get("projects") or {}
    # The API returns a dict keyed by project ID
    if isinstance(projects_raw, dict):
        project_list = list(projects_raw.values())
    elif isinstance(projects_raw, list):
        project_list = projects_raw
    else:
        project_list = []

    grants: list[dict[str, Any]] = []
    for item in project_list[:100]:
        if not isinstance(item, dict):
            continue
        proj_id = str(item.get("id") or "")
        name = str(item.get("project_name") or "").strip()
        # project_abstract is wrapped in a {"cdata!": "..."} object
        abstract_raw = item.get("project_abstract") or item.get("pdo") or {}
        description = (
            abstract_raw.get("cdata!", "")
            if isinstance(abstract_raw, dict)
            else str(abstract_raw)
        ).strip()
        link = str(item.get("url") or WORLD_BANK_URL)
        grants.append(
            _normalize_grant(
                {
                    "id": proj_id or _fallback_identifier(name, link),
                    "title": name,
                    "description": description,
                    "provider": "World Bank",
                    "amount": str(item.get("totalamt") or ""),
                    "deadline": str(item.get("boardapprovaldate") or ""),
                    "type": "Development Grant",
                    "country": "Global",
                },
                link,
            )
        )
    return grants


# ── Deduplication ─────────────────────────────────────────────────────────────

def _dedupe_grants(grants: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for grant in grants:
        grant_id = grant.get("id") or _fallback_identifier(
            grant.get("title", ""), grant.get("source_url", "")
        )
        if grant_id in seen:
            continue
        seen.add(grant_id)
        deduped.append(grant)
    return deduped


# ── Entry point ───────────────────────────────────────────────────────────────

async def scrape_all_sources() -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        grants_gov, opportunity_desk, nsf_awards, world_bank = await asyncio.gather(
            fetch_grants_gov(client),
            fetch_opportunity_desk(client),
            fetch_nsf_awards(client),
            fetch_world_bank_grants(client),
        )

    normalized = _dedupe_grants([*grants_gov, *opportunity_desk, *nsf_awards, *world_bank])
    documents = [f"{grant['title']}\n\n{grant.get('description', '')}".strip() for grant in normalized]
    embeddings = embed_batch(documents)
    for grant, embedding in zip(normalized, embeddings, strict=False):
        grant["embedding"] = embedding

    save_grants(normalized)
    add_grants(normalized)
    return normalized
