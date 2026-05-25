"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE_GRANTS, useCompareStore } from "@/lib/compare-store";

export function CompareBar() {
  const router = useRouter();
  const selectedGrantIds = useCompareStore((state) => state.selectedGrantIds);
  const clearCompare = useCompareStore((state) => state.clearCompare);

  if (selectedGrantIds.length < 2) {
    return null;
  }

  const comparePath = `/grants/compare?ids=${selectedGrantIds.join(",")}`;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-[rgba(0,212,170,0.22)] bg-[#090910]/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">Compare ({selectedGrantIds.length})</div>
          <div className="text-xs text-[var(--color-muted)]">
            Select up to {MAX_COMPARE_GRANTS} grants to review side-by-side.
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={clearCompare}>
            <X className="h-4 w-4" />
            Clear
          </Button>
          <Button type="button" variant="glow" size="sm" onClick={() => router.push(comparePath)}>
            Compare
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}