"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { GrantCard } from "@/components/grants/GrantCard";
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
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "KE", name: "Kenya" },
  { code: "SG", name: "Singapore" },
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

export default function GrantsPage() {
  const [query, setQuery] = React.useState("");
  const [fieldFilters, setFieldFilters] = React.useState<string[]>([]);
  const [countryFilters, setCountryFilters] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("Scholarship");
  const [amountFloor, setAmountFloor] = React.useState(25000);
  const [deadline, setDeadline] = React.useState("");

  const debouncedQuery = useDebouncedValue(query, 300);

  const grantsQuery = useInfiniteQuery({
    queryKey: [
      "grants",
      debouncedQuery,
      fieldFilters.join("|") ,
      countryFilters.join("|") ,
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

  const grants = grantsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isInitialLoading = grantsQuery.isLoading && grants.length === 0;

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(0,212,170,0.12),_transparent_24%),linear-gradient(180deg,_#05050c_0%,_#080810_55%,_#07070d_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-35" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-6 pt-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-[280px] lg:sticky lg:top-24 lg:self-start">
          <Card variant="glass-strong" padding="none" className="overflow-hidden">
            <CardHeader className="border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Search Grants</CardTitle>
                <Badge variant="primary">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-5">
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
                <div className="flex flex-wrap gap-2">
                  {COUNTRY_OPTIONS.map((country) => {
                    const value = country.code;
                    const active = countryFilters.includes(value);
                    return (
                      <FilterChip key={country.code} active={active} onClick={() => setCountryFilters((current) => toggleValue(current, value))}>
                        {country.name}
                      </FilterChip>
                    );
                  })}
                </div>
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
            </CardContent>
          </Card>
        </aside>

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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {grants.map((grant) => (
                  <GrantCard key={grant.id} grant={grant as GrantSummaryApi} />
                ))}
              </div>

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
    </section>
  );
}