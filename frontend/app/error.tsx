"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error("Unhandled runtime error captured in Next.js boundary:", error);
  }, [error]);

  return (
    <div className="relative min-h-[70vh] w-full flex items-center justify-center p-4">
      {/* Sleek radial backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.1),_transparent_40%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
      <div className="absolute inset-0 bg-grid opacity-10 -z-10" aria-hidden="true" />

      <Card variant="glass-strong" className="max-w-md w-full border-[rgba(239,68,68,0.2)] shadow-2xl relative overflow-hidden rounded-3xl">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white">Something went wrong</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center px-6 pb-8">
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            {error.message || "An unexpected error occurred during page compilation. Please reload or contact security support if the issue persists."}
          </p>
          {error.digest && (
            <div className="rounded-xl bg-black/40 border border-[var(--border-default)] p-2.5 font-mono text-[9px] text-slate-500 text-left">
              <span className="font-semibold block text-[10px] text-slate-400 mb-0.5">Digest ID</span>
              {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              onClick={() => reset()}
              variant="default"
              size="sm"
              className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-semibold flex items-center justify-center gap-1.5 h-10 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-[rgba(240,240,255,0.1)] hover:bg-[rgba(240,240,255,0.05)] text-white flex items-center justify-center gap-1.5 h-10 w-full sm:w-auto"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
