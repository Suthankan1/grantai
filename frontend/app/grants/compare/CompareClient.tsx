"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compareGrants, getGrantById, getProfile, type GrantDetailApi } from "@/lib/api";
import { useCompareStore } from "@/lib/compare-store";
import { cn } from "@/lib/utils";

type RowLabel = "Title" | "Provider" | "Amount" | "Deadline" | "Field" | "Country" | "Match Score" | "Eligibility";

function parseGrantIds(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function formatAmount(amount: number | string | null, currency: string | null) {
  if (amount === null || amount === undefined || amount === "") {
    return "Funding available";
  }

  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) {
    return `${currency ?? "USD"} funding`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return "Not provided";
  }

  const parsed = new Date(deadline);
  return Number.isNaN(parsed.getTime())
    ? deadline
    : parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function toNumericAmount(amount: number | string | null) {
  if (amount === null || amount === undefined || amount === "") {
    return Number.NEGATIVE_INFINITY;
  }

  const numeric = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(numeric) ? numeric : Number.NEGATIVE_INFINITY;
}

function toDateValue(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
}

function calculateEligibilityScore(eligibility: string | null) {
  if (!eligibility) return Number.POSITIVE_INFINITY;
  return eligibility.length;
}

function compareBestIndex<T>(items: T[], score: (item: T, index: number) => number, higherIsBetter = true) {
  if (items.length === 0) return -1;

  let bestIndex = 0;
  let bestScore = score(items[0], 0);

  for (let index = 1; index < items.length; index += 1) {
    const candidateScore = score(items[index], index);
    const isBetter = higherIsBetter ? candidateScore > bestScore : candidateScore < bestScore;
    if (isBetter) {
      bestIndex = index;
      bestScore = candidateScore;
    }
  }

  return bestIndex;
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const storedGrantIds = useCompareStore((state) => state.selectedGrantIds);
  const grantIds = React.useMemo(() => {
    const fromQuery = parseGrantIds(searchParams.get("ids"));
    return fromQuery.length > 0 ? fromQuery : storedGrantIds.slice(0, 3);
  }, [searchParams, storedGrantIds]);

  const grantsQuery = useQuery({
    queryKey: ["grant-compare-details", grantIds],
    queryFn: async () => {
      const results = await Promise.allSettled(grantIds.map((grantId) => getGrantById(grantId)));
      return results
        .map((result) => (result.status === "fulfilled" ? result.value : null))
        .filter((grant): grant is GrantDetailApi => grant !== null);
    },
    enabled: grantIds.length >= 2,
  });

  const profileQuery = useQuery({
    queryKey: ["compare-profile"],
    queryFn: getProfile,
    retry: false,
  });

  const recommendationQuery = useQuery({
    queryKey: ["grant-compare-recommendation", grantIds, profileQuery.data?.userId ?? "anonymous"],
    queryFn: () =>
      compareGrants({
        profile: (profileQuery.data ?? {}) as Record<string, unknown>,
        grantIds,
      }),
    enabled: grantIds.length >= 2 && grantsQuery.data !== undefined,
  });

  const grants = React.useMemo(() => grantsQuery.data ?? [], [grantsQuery.data]);
  const primaryCount = grantIds.length;

  const rowWinners: Record<RowLabel, number> = React.useMemo(() => {
    const titleIndex = compareBestIndex(grants, (grant) => grant.matchScore, true);
    const providerIndex = compareBestIndex(grants, (grant) => grant.matchScore, true);
    const amountIndex = compareBestIndex(grants, (grant) => toNumericAmount(grant.amount), true);
    const deadlineIndex = compareBestIndex(grants, (grant) => toDateValue(grant.deadline), false);
    const fieldIndex = compareBestIndex(grants, (grant) => grant.matchScore, true);
    const countryIndex = compareBestIndex(
      grants,
      (grant, index) => {
        const profile = profileQuery.data;
        if (profile) {
          const preferredCountries = [...(profile.preferredCountries ?? [])].map((value) => value.toLowerCase());
          const countryMatch = [grant.countryName, grant.countryCode].some((value) =>
            value ? preferredCountries.includes(value.toLowerCase()) : false
          );
          if (countryMatch) {
            return 10_000 + grant.matchScore;
          }
        }

        return grant.matchScore - index;
      },
      true
    );
    const matchScoreIndex = compareBestIndex(grants, (grant) => grant.matchScore, true);
    const eligibilityIndex = compareBestIndex(grants, (grant) => calculateEligibilityScore(grant.eligibility), false);

    return {
      Title: titleIndex,
      Provider: providerIndex,
      Amount: amountIndex,
      Deadline: deadlineIndex,
      Field: fieldIndex,
      Country: countryIndex,
      "Match Score": matchScoreIndex,
      Eligibility: eligibilityIndex,
    };
  }, [grants, profileQuery.data]);

  const comparisonRows: { label: RowLabel; renderValue: (grant: GrantDetailApi) => React.ReactNode }[] = [
    { label: "Title", renderValue: (grant) => grant.title },
    { label: "Provider", renderValue: (grant) => grant.provider },
    { label: "Amount", renderValue: (grant) => formatAmount(grant.amount, grant.currency) },
    { label: "Deadline", renderValue: (grant) => formatDeadline(grant.deadline) },
    { label: "Field", renderValue: (grant) => grant.field },
    { label: "Country", renderValue: (grant) => grant.countryName },
    { label: "Match Score", renderValue: (grant) => `${grant.matchScore}%` },
    { label: "Eligibility", renderValue: (grant) => grant.eligibility ?? "Not provided" },
  ];

  if (grantIds.length < 2) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <Card variant="glass-strong" className="mx-auto max-w-2xl p-8 text-center">
          <CardTitle>Select at least 2 grants</CardTitle>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Add grants to the compare bar from the grants search page, then open this view.
          </p>
          <Button asChild className="mt-6">
            <Link href="/grants">
              <ChevronLeft className="h-4 w-4" />
              Back to grants
            </Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.12),_transparent_25%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-25" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 pt-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/grants">
            <ChevronLeft className="h-4 w-4" />
            Back to grants
          </Link>
        </Button>

        <Card variant="glass-strong" padding="none" className="overflow-hidden">
          <CardHeader className="border-b border-[var(--border-default)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Recommendation</CardTitle>
                <p className="mt-1 text-sm text-[var(--color-muted)]">AI review of the selected grants and your profile fit.</p>
              </div>
              <div className="text-sm text-[var(--color-muted)]">{primaryCount} grants selected</div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {recommendationQuery.isLoading ? (
              <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating recommendation...
              </div>
            ) : recommendationQuery.data?.recommendation ? (
              <p className="text-sm leading-7 text-[var(--color-text)]">{recommendationQuery.data.recommendation}</p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No recommendation was generated.</p>
            )}
          </CardContent>
        </Card>

        <Card variant="glass-strong" padding="none" className="overflow-hidden">
          <CardHeader className="border-b border-[var(--border-default)]">
            <CardTitle>Grant Comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {grantsQuery.isLoading ? (
              <div className="p-6 text-sm text-[var(--color-muted)]">Loading grant details...</div>
            ) : grants.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-muted)]">No grant details could be loaded.</div>
            ) : (
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[rgba(240,240,255,0.04)] text-left text-xs uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                    <th className="sticky left-0 z-10 border-b border-[var(--border-default)] bg-[#0b0b12] px-5 py-4">Criteria</th>
                    {grants.map((grant) => (
                      <th key={grant.id} className="border-b border-[var(--border-default)] px-5 py-4 align-top">
                        <div className="space-y-2 normal-case tracking-normal">
                          <div className="text-sm font-semibold text-[var(--color-text)]">{grant.title}</div>
                          <div className="text-xs text-[var(--color-muted)]">{grant.provider}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(({ label, renderValue }) => (
                    <tr key={label} className="align-top">
                      <td className="sticky left-0 z-10 border-b border-[var(--border-default)] bg-[#0b0b12] px-5 py-4 text-sm font-medium text-[var(--color-text)]">
                        {label}
                      </td>
                      {grants.map((grant, index) => {
                        const bestIndex = rowWinners[label];
                        const isBest = bestIndex === index;

                        return (
                          <td
                            key={`${grant.id}-${label}`}
                            className={cn(
                              "border-b border-[var(--border-default)] px-5 py-4 align-top text-sm leading-6 text-[var(--color-text)]",
                              isBest && "bg-[rgba(0,212,170,0.08)]"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {isBest && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" />}
                              <span>{renderValue(grant)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}