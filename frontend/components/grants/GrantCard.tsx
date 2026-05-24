"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GrantSummaryApi } from "@/lib/api";

const TYPE_STYLES: Record<string, { accent: string; glow: string }> = {
  Scholarship: { accent: "border-l-violet-400", glow: "shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_30px_rgba(139,92,246,0.12)]" },
  "Research Grant": { accent: "border-l-emerald-300", glow: "shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_0_30px_rgba(52,211,153,0.12)]" },
  Fellowship: { accent: "border-l-amber-300", glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_0_30px_rgba(251,191,36,0.12)]" },
};

function countryFlag(countryCode: string | null) {
  if (!countryCode || countryCode.length !== 2) {
    return "◌";
  }

  const upper = countryCode.toUpperCase();
  const codePoints = upper.split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function daysLeft(deadline: string) {
  const end = new Date(deadline);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
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

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={radius} stroke="rgba(240,240,255,0.08)" strokeWidth="5" fill="none" />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke="url(#grant-score-gradient)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="grant-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C47FF" />
            <stop offset="100%" stopColor="#00D4AA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[var(--color-text)]">
        {clamped}%
      </div>
    </div>
  );
}

export function GrantCard({ grant }: { grant: GrantSummaryApi }) {
  const style = TYPE_STYLES[grant.grantType] ?? TYPE_STYLES["Scholarship"];
  const remainingDays = daysLeft(grant.deadline);
  const urgent = remainingDays < 30;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Card
        variant="glass-strong"
        padding="none"
        className={cn(
          "relative h-full overflow-hidden border-l-4 transition-all duration-300",
          style.accent,
          style.glow,
          "hover:border-[var(--border-glow)]"
        )}
      >
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(108,71,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(0,212,170,0.12),transparent_30%)]" />
        <div className="relative flex h-full flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <Badge variant="primary" size="sm" className="uppercase tracking-[0.18em]">
                {grant.grantType}
              </Badge>
              <Link href={`/grants/${grant.id}`} className="block">
                <h3 className="font-display text-[1.25rem] font-semibold leading-tight text-balance text-[var(--color-text)] transition-colors group-hover:text-white">
                  {grant.title}
                </h3>
              </Link>
              <p className="text-sm text-[var(--color-muted)]">{grant.provider}</p>
            </div>

            <ScoreRing score={grant.matchScore} />
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-[var(--color-subtle)]">{grant.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="solid-accent" size="lg">
              {formatAmount(grant.amount, grant.currency)}
            </Badge>
            <Badge variant={urgent ? "destructive" : "warning"} size="lg">
              <CalendarDays className="h-3.5 w-3.5" />
              {urgent ? `${Math.max(0, remainingDays)} days left` : grant.deadline}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-3 py-1">
              <span>{countryFlag(grant.countryCode)}</span>
              {grant.countryName}
            </span>
            <Badge variant="info">{grant.field}</Badge>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00D4AA]" />
              {grant.matchScore}% match
            </span>
            <Link href={`/grants/${grant.id}`} className="inline-flex items-center gap-1 text-[var(--color-text)] transition-colors hover:text-[#00D4AA]">
              View details
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}