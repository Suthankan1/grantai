from __future__ import annotations

import asyncio
import hashlib
import json
import re
from collections.abc import Iterable
from datetime import datetime
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

import httpx

from app.core.chroma import add_grants
from app.core.embeddings import embed_batch
from app.db import save_grants


GRANTS_GOV_URL = "https://www.grants.gov/grantsws/OppSearch"
OPPORTUNITY_DESK_RSS = "https://opportunitydesk.org/feed/"

SCHOLARSHIP_URLS = [
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/",
    "https://www.fastweb.com/college-scholarships",
    "https://www.bold.org/scholarships/",
    "https://www.niche.com/colleges/scholarships/",
    "https://www.unigo.com/scholarships",
    "https://www.cappex.com/scholarships",
    "https://www.collegedata.com/resources/scholarships",
    "https://www.chegg.com/scholarships",
    "https://www.collegeboard.org/scholarships",
    "https://www.salliemae.com/college-planning/financial-aid/scholarships/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-state/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-major/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-minority/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-activity/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-interest/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-grade-level/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-career/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-demographic/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-sport/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-organization/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-service/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-employer/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-women/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-men/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-veterans/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-parents/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-high-school-seniors/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-undergraduate-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-graduate-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-online-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-international-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-athletes/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-arts-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-stem-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-business-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-engineering-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-nursing-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-medical-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-law-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-teachers/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-education-majors/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-military-families/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-first-generation-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-low-income-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-minority-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-black-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-hispanic-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-asian-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-native-american-students/",
    "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-for-lgbt-students/",
]


class _MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.description = ""
        self._capture_title = False
        self._title_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs):  # type: ignore[override]
        attrs_dict = dict(attrs)
        if tag == "title":
            self._capture_title = True
        if tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            if name == "description" or prop in {"og:description", "twitter:description"}:
                if content and not self.description:
                    self.description = content.strip()

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._capture_title = False
            self.title = "".join(self._title_parts).strip()

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self._title_parts.append(data)


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
    title = str(payload.get("title") or payload.get("name") or payload.get("oppTitle") or payload.get("subject") or "").strip()
    description = str(
        payload.get("description")
        or payload.get("summary")
        or payload.get("content")
        or payload.get("details")
        or ""
    ).strip()
    provider = str(payload.get("provider") or payload.get("organization") or payload.get("agency") or payload.get("source") or "").strip()
    amount = _normalize_amount(payload.get("amount") or payload.get("awardAmount") or payload.get("value"))
    deadline = _normalize_deadline(payload.get("deadline") or payload.get("closingDate") or payload.get("dueDate") or payload.get("date"))
    body = " ".join([title, description, provider, source_url])

    normalized = {
        "id": str(payload.get("id") or payload.get("guid") or payload.get("uuid") or _fallback_identifier(title, source_url)),
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
    return normalized


def _parse_json_payload(text: str) -> list[dict[str, Any]]:
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        return []

    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("opportunities", "results", "data", "items", "records"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
        return [payload]
    return []


def _parse_grants_gov_payload(text: str) -> list[dict[str, Any]]:
    items = _parse_json_payload(text)
    if items:
        return items

    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        return []

    parsed: list[dict[str, Any]] = []
    for node in root.iter():
        entry: dict[str, Any] = {}
        for child in list(node):
            tag = child.tag.split("}")[-1]
            if child.text and child.text.strip():
                entry[tag] = child.text.strip()
        if entry:
            parsed.append(entry)
    return parsed


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


def _parse_html(text: str, source_url: str) -> dict[str, Any]:
    parser = _MetaParser()
    parser.feed(text)
    title = parser.title or source_url
    description = parser.description or re.sub(r"\s+", " ", text)[:500]
    return _normalize_grant(
        {
            "id": _fallback_identifier(title, source_url),
            "title": title,
            "description": description,
            "provider": urlparse(source_url).netloc,
            "type": "Scholarship",
        },
        source_url,
    )


def _dedupe_grants(grants: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for grant in grants:
        grant_id = grant.get("id") or _fallback_identifier(grant.get("title", ""), grant.get("source_url", ""))
        if grant_id in seen:
            continue
        seen.add(grant_id)
        deduped.append(grant)
    return deduped


async def fetch_grants_gov(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    try:
        response = await client.get(GRANTS_GOV_URL)
        response.raise_for_status()
    except httpx.HTTPError:
        return []

    text = response.text
    if "json" in response.headers.get("content-type", "").lower() or text.lstrip().startswith(("[", "{")):
        payloads = _parse_grants_gov_payload(text)
    else:
        payloads = _parse_json_payload(text)

    grants = []
    for payload in payloads[:100]:
        grants.append(_normalize_grant(payload, payload.get("source_url") or GRANTS_GOV_URL))
    return grants


async def fetch_opportunity_desk(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    try:
        response = await client.get(OPPORTUNITY_DESK_RSS)
        response.raise_for_status()
    except httpx.HTTPError:
        return []

    try:
        return _parse_rss(response.text)
    except ET.ParseError:
        return []


async def fetch_scholarship_pages(client: httpx.AsyncClient, urls: list[str]) -> list[dict[str, Any]]:
    semaphore = asyncio.Semaphore(8)

    async def _fetch(url: str) -> dict[str, Any] | None:
        async with semaphore:
            try:
                response = await client.get(url)
                response.raise_for_status()
            except httpx.HTTPError:
                return None
            return _parse_html(response.text, url)

    pages = await asyncio.gather(*(_fetch(url) for url in urls))
    return [page for page in pages if page is not None]


async def scrape_all_sources() -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        grants_gov_task = fetch_grants_gov(client)
        opportunity_task = fetch_opportunity_desk(client)
        scholarship_task = fetch_scholarship_pages(client, SCHOLARSHIP_URLS)
        grants_gov, opportunity_desk, scholarship_pages = await asyncio.gather(
            grants_gov_task,
            opportunity_task,
            scholarship_task,
        )

    normalized = _dedupe_grants([*grants_gov, *opportunity_desk, *scholarship_pages])
    documents = [f"{grant['title']}\n\n{grant.get('description', '')}".strip() for grant in normalized]
    embeddings = embed_batch(documents)
    for grant, embedding in zip(normalized, embeddings, strict=False):
        grant["embedding"] = embedding

    save_grants(normalized)
    add_grants(normalized)
    return normalized
