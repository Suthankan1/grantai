"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Globe, Award, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { countries } from "@/lib/onboarding-constants";

interface University {
  name: string;
  country: string;
  web_pages: string[];
  domains: string[];
  alpha_two_code: string;
}

interface UniversityListProps {
  countryName: string;
  onClear: () => void;
}

const UNIVERSITIES_DATA_URL = "/world_universities_9363_list.json";

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  bolivia: "BO",
  brunei: "BN",
  comoros: "KM",
  "congo (brazzaville)": "CG",
  "congo (kinshasa)": "CD",
  "czech republic": "CZ",
  "guinea-bissau": "GW",
  iran: "IR",
  kiribati: "KI",
  laos: "LA",
  "marshall islands": "MH",
  micronesia: "FM",
  moldova: "MD",
  nauru: "NR",
  "north korea": "KP",
  palau: "PW",
  palestine: "PS",
  russia: "RU",
  "são tomé and príncipe": "ST",
  "south korea": "KR",
  syria: "SY",
  taiwan: "TW",
  tanzania: "TZ",
  "timor-leste": "TL",
  turkey: "TR",
  tuvalu: "TV",
  vanuatu: "VU",
  "vatican city": "VA",
  venezuela: "VE",
  vietnam: "VN",
  "united states of america": "US",
};

type RawUniversityRecord = {
  name: string;
  country_code: string;
  country: string;
  website?: string;
};

function toUniversity(record: RawUniversityRecord): University {
  const website = record.website?.trim() || "";
  let domain = "";

  try {
    if (website) {
      domain = new URL(website).hostname.replace(/^www\./, "");
    }
  } catch {
    domain = website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  }

  return {
    name: record.name,
    country: record.country,
    web_pages: website ? [website] : [],
    domains: domain ? [domain] : [],
    alpha_two_code: record.country_code,
  };
}

function normalizeCountryName(value: string) {
  return value.trim().toLowerCase();
}

function resolveCountryCode(countryName: string) {
  const normalizedName = normalizeCountryName(countryName);
  const exactMatch = countries.find((country) => normalizeCountryName(country.name) === normalizedName);
  if (exactMatch) {
    return exactMatch.code;
  }

  return COUNTRY_CODE_ALIASES[normalizedName] ?? null;
}

export default function UniversityList({ countryName, onClear }: UniversityListProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const itemsPerPage = 9;

  // Retrieve country flag emoji from constants
  const countryFlag = useMemo(() => {
    const found = countries.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    return found ? found.flag : "🌍";
  }, [countryName]);

  useEffect(() => {
    let cancelled = false;
    const countryCode = resolveCountryCode(countryName);

    if (!countryName) {
      setUniversities([]);
      setSearchQuery("");
      setCurrentPage(1);
      setLoading(false);
      setLoadError(null);
      return;
    }

    async function loadUniversities() {
      setLoading(true);
      setLoadError(null);
      setSearchQuery("");
      setCurrentPage(1);

      try {
        const response = await fetch(UNIVERSITIES_DATA_URL);
        if (!response.ok) {
          throw new Error("Failed to load local university dataset.");
        }

        const records = (await response.json()) as RawUniversityRecord[];
        const localUniversities = records
          .filter((record) => {
            if (countryCode) {
              return record.country_code?.toUpperCase() === countryCode;
            }

            return normalizeCountryName(record.country) === normalizeCountryName(countryName);
          })
          .map(toUniversity)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (!cancelled) {
          setUniversities(localUniversities);
        }
      } catch {
        if (!cancelled) {
          setUniversities([]);
          setLoadError("The local university dataset could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUniversities();

    return () => {
      cancelled = true;
    };
  }, [countryName]);

  // Filter universities based on search query
  const filteredUniversities = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return universities;
    return universities.filter(
      (uni) =>
        uni.name.toLowerCase().includes(search) ||
        uni.domains.some((d) => d.toLowerCase().includes(search))
    );
  }, [universities, searchQuery]);

  // Calculate paginated list
  const paginatedUniversities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUniversities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUniversities, currentPage]);

  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate deterministic mock statistics for a university (so they are stable across renders)
  const getMockStats = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const grantsCount = Math.abs((hash % 18) + 3); // between 3 and 20
    const rawFunding = Math.abs((hash % 950) + 50); // between 50k and 1000k
    const avgFunding = `$${rawFunding.toLocaleString()},000`;
    return { grantsCount, avgFunding };
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F1A] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{countryFlag}</span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
              {countryName}
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              {`${universities.length} universities registered`}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[rgba(240,240,255,0.06)] hover:bg-[rgba(240,240,255,0.04)] text-[var(--color-text)] transition duration-200"
        >
          View Global
        </button>
      </div>

      {/* Search box */}
      <div className="relative shrink-0">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-muted)]" />
        <input
          type="text"
          placeholder="Search universities by name or domain..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[rgba(8,8,16,0.5)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] transition-all duration-300 outline-none"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="shimmer border border-[var(--border-default)] rounded-xl p-5 h-[116px] animate-pulse opacity-50"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-red-500/20 bg-red-500/5 rounded-2xl h-full space-y-4">
            <Globe className="h-10 w-10 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-white">Local Data Error</p>
              <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs">
                {loadError}
              </p>
            </div>
          </div>
        ) : filteredUniversities.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center text-center py-16 text-[var(--color-muted)] space-y-3">
            <Globe className="h-10 w-10 stroke-1 text-[var(--color-muted)] opacity-50" />
            <div>
              <p className="text-sm font-semibold text-white">No Universities Found</p>
              <p className="text-xs max-w-xs mt-1">
                We couldn&apos;t find any universities matching &quot;{searchQuery}&quot; in {countryName}.
              </p>
            </div>
          </div>
        ) : (
          // University Grid
          <div className="grid grid-cols-1 gap-4">
            {paginatedUniversities.map((uni) => {
              const { grantsCount, avgFunding } = getMockStats(uni.name);
              const webUrl = uni.web_pages[0] || `http://${uni.domains[0]}`;

              return (
                <div
                  key={uni.name}
                  className="group relative bg-[rgba(8,8,16,0.3)] border border-[var(--border-default)] hover:border-[rgba(108,71,255,0.4)] rounded-xl p-5 hover:bg-[rgba(108,71,255,0.02)] hover:shadow-glow-sm transition-all duration-300"
                >
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00D4AA] transition duration-200 leading-snug line-clamp-2">
                        {uni.name}
                      </h3>
                      {uni.domains[0] && (
                        <p className="text-[11px] text-[var(--color-muted)] font-mono mt-1">
                          {uni.domains[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-[rgba(240,240,255,0.04)] pt-3 mt-1 text-[11px] text-[var(--color-subtle)]">
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-[#6C47FF]" />
                        <span>Active Grants: <strong className="text-white">{grantsCount}</strong></span>
                      </span>
                      <span className="text-[var(--color-muted)]">
                        Avg Funding: <strong className="text-white">{avgFunding}</strong>
                      </span>
                    </div>

                    <a
                      href={webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 flex items-center justify-center h-7 w-7 rounded-lg bg-[rgba(240,240,255,0.03)] group-hover:bg-[#6C47FF] border border-[rgba(240,240,255,0.06)] group-hover:border-transparent text-[var(--color-muted)] group-hover:text-white transition-all duration-300 shadow-sm"
                      title={`Visit ${uni.name} website`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-4 shrink-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[rgba(240,240,255,0.06)] hover:bg-[rgba(240,240,255,0.04)] disabled:opacity-30 disabled:pointer-events-none text-[var(--color-text)] transition duration-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          
          <span className="text-xs text-[var(--color-muted)] font-medium">
            Page <strong className="text-white font-semibold">{currentPage}</strong> of{" "}
            <strong className="text-white font-semibold">{totalPages}</strong>
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[rgba(240,240,255,0.06)] hover:bg-[rgba(240,240,255,0.04)] disabled:opacity-30 disabled:pointer-events-none text-[var(--color-text)] transition duration-200"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
