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

const LOCAL_UNIVERSITY_DIRECTORY: Record<string, University[]> = {
  "United States": [
    {
      name: "Harvard University",
      country: "United States",
      web_pages: ["https://www.harvard.edu"],
      domains: ["harvard.edu"],
      alpha_two_code: "US"
    },
    {
      name: "Massachusetts Institute of Technology (MIT)",
      country: "United States",
      web_pages: ["https://www.mit.edu"],
      domains: ["mit.edu"],
      alpha_two_code: "US"
    },
    {
      name: "Stanford University",
      country: "United States",
      web_pages: ["https://www.stanford.edu"],
      domains: ["stanford.edu"],
      alpha_two_code: "US"
    },
    {
      name: "University of California, Berkeley",
      country: "United States",
      web_pages: ["https://www.berkeley.edu"],
      domains: ["berkeley.edu"],
      alpha_two_code: "US"
    },
    {
      name: "UC San Francisco",
      country: "United States",
      web_pages: ["https://www.ucsf.edu"],
      domains: ["ucsf.edu"],
      alpha_two_code: "US"
    },
    {
      name: "Boston University",
      country: "United States",
      web_pages: ["https://www.bu.edu"],
      domains: ["bu.edu"],
      alpha_two_code: "US"
    }
  ],
  "United Kingdom": [
    {
      name: "Imperial College London",
      country: "United Kingdom",
      web_pages: ["https://www.imperial.ac.uk"],
      domains: ["imperial.ac.uk"],
      alpha_two_code: "GB"
    },
    {
      name: "University College London (UCL)",
      country: "United Kingdom",
      web_pages: ["https://www.ucl.ac.uk"],
      domains: ["ucl.ac.uk"],
      alpha_two_code: "GB"
    },
    {
      name: "King's College London",
      country: "United Kingdom",
      web_pages: ["https://www.kcl.ac.uk"],
      domains: ["kcl.ac.uk"],
      alpha_two_code: "GB"
    },
    {
      name: "University of Oxford",
      country: "United Kingdom",
      web_pages: ["https://www.ox.ac.uk"],
      domains: ["ox.ac.uk"],
      alpha_two_code: "GB"
    },
    {
      name: "University of Cambridge",
      country: "United Kingdom",
      web_pages: ["https://www.cam.ac.uk"],
      domains: ["cam.ac.uk"],
      alpha_two_code: "GB"
    }
  ],
  Japan: [
    {
      name: "University of Tokyo",
      country: "Japan",
      web_pages: ["https://www.u-tokyo.ac.jp"],
      domains: ["u-tokyo.ac.jp"],
      alpha_two_code: "JP"
    },
    {
      name: "Tokyo Institute of Technology",
      country: "Japan",
      web_pages: ["https://www.titech.ac.jp"],
      domains: ["titech.ac.jp"],
      alpha_two_code: "JP"
    },
    {
      name: "Waseda University",
      country: "Japan",
      web_pages: ["https://www.waseda.jp"],
      domains: ["waseda.jp"],
      alpha_two_code: "JP"
    }
  ],
  Germany: [
    {
      name: "Technical University of Munich (TUM)",
      country: "Germany",
      web_pages: ["https://www.tum.de"],
      domains: ["tum.de"],
      alpha_two_code: "DE"
    },
    {
      name: "LMU Munich",
      country: "Germany",
      web_pages: ["https://www.lmu.de"],
      domains: ["lmu.de"],
      alpha_two_code: "DE"
    }
  ],
  Switzerland: [
    {
      name: "ETH Zurich",
      country: "Switzerland",
      web_pages: ["https://ethz.ch"],
      domains: ["ethz.ch"],
      alpha_two_code: "CH"
    },
    {
      name: "University of Zurich",
      country: "Switzerland",
      web_pages: ["https://www.uzh.ch"],
      domains: ["uzh.ch"],
      alpha_two_code: "CH"
    }
  ],
  Singapore: [
    {
      name: "National University of Singapore (NUS)",
      country: "Singapore",
      web_pages: ["https://nus.edu.sg"],
      domains: ["nus.edu.sg"],
      alpha_two_code: "SG"
    },
    {
      name: "Nanyang Technological University (NTU)",
      country: "Singapore",
      web_pages: ["https://www.ntu.edu.sg"],
      domains: ["ntu.edu.sg"],
      alpha_two_code: "SG"
    }
  ],
  Canada: [
    {
      name: "University of Toronto",
      country: "Canada",
      web_pages: ["https://www.utoronto.ca"],
      domains: ["utoronto.ca"],
      alpha_two_code: "CA"
    },
    {
      name: "York University",
      country: "Canada",
      web_pages: ["https://www.yorku.ca"],
      domains: ["yorku.ca"],
      alpha_two_code: "CA"
    },
    {
      name: "Toronto Metropolitan University",
      country: "Canada",
      web_pages: ["https://www.torontomu.ca"],
      domains: ["torontomu.ca"],
      alpha_two_code: "CA"
    }
  ],
  Australia: [
    {
      name: "University of Sydney",
      country: "Australia",
      web_pages: ["https://www.sydney.edu.au"],
      domains: ["sydney.edu.au"],
      alpha_two_code: "AU"
    },
    {
      name: "University of New South Wales (UNSW)",
      country: "Australia",
      web_pages: ["https://www.unsw.edu.au"],
      domains: ["unsw.edu.au"],
      alpha_two_code: "AU"
    },
    {
      name: "University of Technology Sydney (UTS)",
      country: "Australia",
      web_pages: ["https://www.uts.edu.au"],
      domains: ["uts.edu.au"],
      alpha_two_code: "AU"
    }
  ],
  India: [
    {
      name: "Indian Institute of Science (IISc)",
      country: "India",
      web_pages: ["https://iisc.ac.in"],
      domains: ["iisc.ac.in"],
      alpha_two_code: "IN"
    },
    {
      name: "Bangalore University",
      country: "India",
      web_pages: ["https://bangaloreuniversity.ac.in"],
      domains: ["bangaloreuniversity.ac.in"],
      alpha_two_code: "IN"
    }
  ]
}

function getUniversitiesForCountry(countryName: string) {
  const exactMatch = LOCAL_UNIVERSITY_DIRECTORY[countryName];
  if (exactMatch) {
    return exactMatch;
  }

  return Object.entries(LOCAL_UNIVERSITY_DIRECTORY)
    .find(([country]) => country.toLowerCase() === countryName.toLowerCase())?.[1]
    ?? [];
}

export default function UniversityList({ countryName, onClear }: UniversityListProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Retrieve country flag emoji from constants
  const countryFlag = useMemo(() => {
    const found = countries.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    return found ? found.flag : "🌍";
  }, [countryName]);

  useEffect(() => {
    if (!countryName) {
      setUniversities([]);
      setSearchQuery("");
      setCurrentPage(1);
      return;
    }

    const localUniversities = getUniversitiesForCountry(countryName)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    setUniversities(localUniversities);
    setSearchQuery("");
    setCurrentPage(1);
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
        {filteredUniversities.length === 0 ? (
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
