import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CompareClient from "./CompareClient";

function CompareFallback() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <Card variant="glass-strong" className="mx-auto max-w-2xl p-8 text-center">
        <CardTitle>Loading compare view</CardTitle>
        <p className="mt-3 text-sm text-[var(--color-muted)]">Preparing the selected grants for comparison.</p>
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

export default function GrantsComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareClient />
    </Suspense>
  );
}