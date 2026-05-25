"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filter, Search, SlidersHorizontal, X, Menu, Check, ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import { GrantCard } from "@/components/grants/GrantCard";
import { CompareBar } from "@/components/grants/CompareBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchGrants, type GrantSummaryApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const FIELD_OPTIONS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Public Health",
  "Education",
  "Arts",
  "Environmental Science",
  "Data Science",
];

const COUNTRY_OPTIONS = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CD", name: "Congo (Kinshasa)" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];


const TYPE_OPTIONS = ["Scholarship", "Research Grant", "Fellowship"] as const;

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

function useIntersectionObserver(onIntersect: () => void) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        onIntersect();
      }
    }, { rootMargin: "600px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, [onIntersect]);

  return ref;
}

function useWindowWidth() {
  const [width, setWidth] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function formatFilters(values: string[]) {
  return values.join(",");
}

function skeletonCards() {
  return Array.from({ length: 8 }).map((_, index) => (
    <Card key={index} variant="glass-strong" padding="none" className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="h-4 w-24 shimmer rounded-full" />
        <div className="h-7 w-4/5 shimmer rounded-xl" />
        <div className="h-4 w-1/2 shimmer rounded-full" />
        <div className="h-20 w-full shimmer rounded-2xl" />
        <div className="flex gap-2">
          <div className="h-7 w-28 shimmer rounded-full" />
          <div className="h-7 w-24 shimmer rounded-full" />
        </div>
      </CardContent>
    </Card>
  ));
}

function SearchSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9B73FF]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search grants, funders, or keywords"
        inputSize="lg"
        variant="filled"
        className="h-14 rounded-2xl border-[rgba(108,71,255,0.25)] bg-[rgba(240,240,255,0.04)] pl-12 text-base shadow-[0_0_0_1px_rgba(108,71,255,0.08),0_16px_50px_rgba(0,0,0,0.18)]"
      />
    </div>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
        active
          ? "border-[rgba(108,71,255,0.4)] bg-[rgba(108,71,255,0.16)] text-white shadow-glow-sm"
          : "border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] text-[var(--color-muted)] hover:border-[var(--border-strong)] hover:text-[var(--color-text)]"
      )}
    >
      {children}
    </button>
  );
}

interface CountrySearchSelectProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
}

function CountrySearchSelect({ selectedCodes, onChange }: CountrySearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter((country) =>
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleToggle = (code: string) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter((c) => c !== code));
    } else {
      onChange([...selectedCodes, code]);
    }
  };

  return (
    <div className="relative space-y-2 w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-3 py-2.5 text-left text-sm text-[var(--color-text)] hover:border-[var(--border-strong)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
      >
        <span className="flex items-center gap-2 truncate">
          <Globe className="h-4.5 w-4.5 text-[var(--color-muted)] shrink-0" />
          <span className="truncate">
            {selectedCodes.length > 0
              ? `${selectedCodes.length} selected`
              : "Select countries"}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-[var(--color-muted)] transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-2xl border border-[var(--border-strong)] bg-[#0c0c14] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              autoFocus
              variant="filled"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 text-xs bg-[rgba(240,240,255,0.03)] border-[rgba(240,240,255,0.05)] text-white placeholder-[var(--color-muted)]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = selectedCodes.includes(country.code);
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleToggle(country.code)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-[rgba(108,71,255,0.15)] text-white font-medium"
                        : "text-[var(--color-muted)] hover:bg-[rgba(240,240,255,0.04)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <span className="truncate">{country.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] opacity-50 uppercase">{country.code}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#00D4AA]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-2 text-center text-xs text-[var(--color-muted)]">
                No matching countries
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrantsPage() {
  const [query, setQuery] = React.useState("");
  const [fieldFilters, setFieldFilters] = React.useState<string[]>([]);
  const [countryFilters, setCountryFilters] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("Scholarship");
  const [amountFloor, setAmountFloor] = React.useState(25000);
  const [deadline, setDeadline] = React.useState("");

  // Responsiveness and Layout state
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const width = useWindowWidth();
  const columnsCount = width >= 1280 ? 3 : width >= 768 ? 2 : 1;

  const debouncedQuery = useDebouncedValue(query, 300);

  const grantsQuery = useInfiniteQuery({
    queryKey: [
      "grants",
      debouncedQuery,
      fieldFilters.join("|"),
      countryFilters.join("|"),
      typeFilter,
      amountFloor,
      deadline,
    ],
    queryFn: ({ pageParam }) =>
      searchGrants({
        q: debouncedQuery,
        field: formatFilters(fieldFilters),
        country: formatFilters(countryFilters),
        type: typeFilter,
        minAmount: amountFloor,
        maxDeadline: deadline || undefined,
        page: typeof pageParam === "number" ? pageParam : 0,
        size: 12,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    initialPageParam: 0,
  });

  const loadMoreRef = useIntersectionObserver(() => {
    if (grantsQuery.hasNextPage && !grantsQuery.isFetchingNextPage) {
      void grantsQuery.fetchNextPage();
    }
  });

  const grants = React.useMemo(
    () => grantsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [grantsQuery.data]
  );
  const isInitialLoading = grantsQuery.isLoading && grants.length === 0;

  // Chunk grants for virtualization grid
  const chunkedGrants = React.useMemo(() => {
    const chunked: GrantSummaryApi[][] = [];
    for (let i = 0; i < grants.length; i += columnsCount) {
      chunked.push(grants.slice(i, i + columnsCount));
    }
    return chunked;
  }, [grants, columnsCount]);

  const filtersContent = (
    <div className="space-y-6">
      <SearchSection value={query} onChange={setQuery} />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
          <Filter className="h-4 w-4 text-[#00D4AA]" />
          Field
        </div>
        <div className="flex flex-wrap gap-2">
          {FIELD_OPTIONS.map((field) => (
            <FilterChip key={field} active={fieldFilters.includes(field)} onClick={() => setFieldFilters((current) => toggleValue(current, field))}>
              {field}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
          <SlidersHorizontal className="h-4 w-4 text-[#9B73FF]" />
          Country
        </div>
        <CountrySearchSelect
          selectedCodes={countryFilters}
          onChange={setCountryFilters}
        />
        {countryFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {countryFilters.map((code) => {
              const country = COUNTRY_OPTIONS.find((c) => c.code === code);
              if (!country) return null;
              return (
                <Badge
                  key={code}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1 cursor-pointer pr-1.5 py-0.5"
                  onClick={() => setCountryFilters((current) => current.filter((c) => c !== code))}
                >
                  <span>{country.name}</span>
                  <X className="h-3 w-3 hover:text-white" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-[var(--color-text)]">Type</div>
        <div className="grid gap-2">
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-all",
                typeFilter === type
                  ? "border-[rgba(108,71,255,0.45)] bg-[rgba(108,71,255,0.14)] text-white"
                  : "border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <span>{type}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-subtle)]">{type === typeFilter ? "Selected" : "Select"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium text-[var(--color-text)]">Amount floor</div>
        <div className="space-y-2 rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            <span>Minimum amount</span>
            <span>${amountFloor.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={amountFloor}
            onChange={(event) => setAmountFloor(Number(event.target.value))}
            className="w-full accent-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-[var(--color-text)]">Deadline</div>
        <input
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[rgba(108,71,255,0.4)]"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          setQuery("");
          setFieldFilters([]);
          setCountryFilters([]);
          setTypeFilter("Scholarship");
          setAmountFloor(25000);
          setDeadline("");
        }}
      >
        <X className="h-4 w-4" />
        Clear filters
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar navigation component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">

        {/* Sleek radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        {/* Mobile Header with Hamburger and Filter Trigger */}
        <header className="flex h-16 items-center justify-between border-b border-[rgba(240,240,255,0.05)] px-4 bg-[rgba(8,8,16,0.5)] backdrop-blur-md md:hidden shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm">
              <span className="text-[10px] font-bold text-white">G</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">GrantAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,240,255,0.06)] text-[var(--color-muted)] hover:text-white"
              aria-label="Open Filters"
            >
              <Filter className="h-4.5 w-4.5 text-[#00D4AA]" />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,240,255,0.06)] text-[var(--color-muted)] hover:text-white"
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-6 pt-6 lg:flex-row">

            {/* Desktop Filters Panel */}
            <aside className="hidden lg:block w-[280px] shrink-0 sticky top-24 self-start">
              <Card variant="glass-strong" padding="none" className="overflow-hidden">
                <CardHeader className="border-b border-[var(--border-default)] pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Search Grants</CardTitle>
                    <Badge variant="primary">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {filtersContent}
                </CardContent>
              </Card>
            </aside>

            {/* Mobile Filters bottom-sheet */}
            <AnimatePresence>
              {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileFiltersOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 inset-x-0 bg-[#080810] border-t border-[var(--border-strong)] rounded-t-[2rem] p-6 max-h-[85vh] overflow-y-auto z-10"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 mb-6">
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">Search & Filters</h3>
                      <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[rgba(240,240,255,0.05)] hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {filtersContent}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Main results board */}
            <main className="min-w-0 flex-1 pb-10">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-3">
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-tight text-balance"
                  >
                    Grants that feel selected for the room.
                  </motion.h1>
                  <p className="max-w-2xl text-base text-[var(--color-muted)]">
                    Search live opportunities, refine by fit, and move from scan to shortlist with match scores already ranked for you.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <Badge variant="accent">{grants.length.toLocaleString()} results</Badge>
                  <Badge variant="outline">React Query</Badge>
                </div>
              </div>

              {isInitialLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{skeletonCards()}</div>
              ) : grants.length > 0 ? (
                <>
                  {/* Performance check: Virtualize if > 50 results */}
                  {grants.length > 50 ? (
                    <div className="relative">
                      <List
                        itemCount={chunkedGrants.length}
                        itemSize={460}
                        height={750}
                        width="100%"
                        className="no-scrollbar"
                      >
                        {({ index, style }) => {
                          const rowItems = chunkedGrants[index] || [];
                          return (
                            <div
                              style={{
                                ...style,
                                display: 'grid',
                                gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
                                gap: '16px',
                              }}
                            >
                              {rowItems.map((grant) => (
                                <GrantCard key={grant.id} grant={grant} />
                              ))}
                            </div>
                          );
                        }}
                      </List>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {grants.map((grant) => (
                        <GrantCard key={grant.id} grant={grant as GrantSummaryApi} />
                      ))}
                    </div>
                  )}

                  <div ref={loadMoreRef} className="py-8 text-center text-sm text-[var(--color-muted)]">
                    {grantsQuery.isFetchingNextPage ? "Loading more grants..." : grantsQuery.hasNextPage ? "Scroll for more" : "End of results"}
                  </div>
                </>
              ) : (
                <Card variant="glass-strong" className="p-8 text-center">
                  <CardTitle>No matching grants</CardTitle>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">Try loosening the filters or searching for another funding theme.</p>
                </Card>
              )}
            </main>
          </div>
          <CompareBar />
        </section>
      </div>
    </div>
  );
}