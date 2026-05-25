/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SummaryRow } from "./SummaryRow";
import { deadlinePreferences } from "@/lib/onboarding-constants";
import { API_BASE_URL } from "@/lib/api";

// ── Scoring ──────────────────────────────────────────────────────────────────

interface FieldScore {
  key: string;
  label: string;
  pts: number;
  filled: boolean;
}

function computeScore(values: any): { total: number; fields: FieldScore[] } {
  const fields: FieldScore[] = [
    {
      key: "fullName",
      label: "Full name",
      pts: 5,
      filled: Boolean(values.fullName?.trim()),
    },
    {
      key: "country",
      label: "Country",
      pts: 10,
      filled: Boolean(values.country?.trim()),
    },
    {
      key: "university",
      label: "University",
      pts: 10,
      filled: Boolean(values.university?.trim()),
    },
    {
      key: "degreeLevel",
      label: "Degree level",
      pts: 10,
      filled: Boolean(values.degreeLevel?.trim()),
    },
    {
      key: "fieldOfStudy",
      label: "Field of study",
      pts: 15,
      filled: Boolean(values.fieldOfStudy?.trim()),
    },
    {
      key: "gpa",
      label: "GPA",
      pts: 5,
      filled: Boolean(values.gpa && Number(values.gpa) > 0),
    },
    {
      key: "researchInterests",
      label: "Research interests (≥ 2)",
      pts: 15,
      filled: Array.isArray(values.researchInterests) && values.researchInterests.length >= 2,
    },
    {
      key: "grantTypes",
      label: "Grant types (≥ 1)",
      pts: 10,
      filled: Array.isArray(values.grantTypes) && values.grantTypes.length >= 1,
    },
    {
      key: "preferredCountries",
      label: "Preferred countries (≥ 1)",
      pts: 10,
      filled: Array.isArray(values.preferredCountries) && values.preferredCountries.length >= 1,
    },
    {
      key: "minGrantAmount",
      label: "Minimum grant amount",
      pts: 5,
      filled: Boolean(values.minGrantAmount && Number(values.minGrantAmount) > 0),
    },
    {
      key: "deadlinePreference",
      label: "Deadline preference",
      pts: 5,
      filled: Boolean(values.deadlinePreference?.trim()),
    },
  ];

  const total = fields.reduce((acc, f) => acc + (f.filled ? f.pts : 0), 0);
  return { total, fields };
}

// ── Tier config ───────────────────────────────────────────────────────────────

interface Tier {
  label: string;
  ringStart: string;
  ringEnd: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  glowStyle: string;
}

function getTier(score: number): Tier {
  if (score < 40) {
    return {
      label: "Weak",
      ringStart: "#ef4444",
      ringEnd: "#f97316",
      textClass: "text-red-400",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/25",
      glowStyle: "0 0 28px rgba(239,68,68,0.25)",
    };
  }
  if (score <= 70) {
    return {
      label: "Good",
      ringStart: "#f59e0b",
      ringEnd: "#fbbf24",
      textClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/25",
      glowStyle: "0 0 28px rgba(245,158,11,0.25)",
    };
  }
  return {
    label: "Strong",
    ringStart: "#00D4AA",
    ringEnd: "#6C47FF",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/25",
    glowStyle: "0 0 28px rgba(0,212,170,0.25)",
  };
}

// ── SVG circular ring ─────────────────────────────────────────────────────────

function ProfileRing({
  score,
  tier,
}: {
  score: number;
  tier: Tier;
}) {
  const radius = 52;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, score) / 100) * circumference;
  const gradId = "profile-strength-grad";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 136, height: 136 }}
    >
      <svg
        viewBox="0 0 136 136"
        width={136}
        height={136}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="68"
          cy="68"
          r={radius}
          stroke="rgba(240,240,255,0.07)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Filled arc */}
        <motion.circle
          cx="68"
          cy="68"
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(${tier.glowStyle})` }}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.ringStart} />
            <stop offset="100%" stopColor={tier.ringEnd} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <motion.span
          className={`text-3xl font-bold leading-none ${tier.textClass}`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.4, ease: "backOut" }}
        >
          {score}
        </motion.span>
        <span className="text-[11px] font-medium text-[var(--color-muted)] tracking-wider uppercase">
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Recommendation rows ───────────────────────────────────────────────────────

const HIGH_VALUE_THRESHOLD = 10; // pts ≥ this are "high value"

function Recommendations({ fields }: { fields: FieldScore[] }) {
  const missing = fields.filter((f) => !f.filled && f.pts >= HIGH_VALUE_THRESHOLD);

  if (missing.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        Recommended
      </p>
      <ul className="space-y-1.5">
        {missing.map((f) => (
          <motion.li
            key={f.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-sm text-amber-200"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span>
              Add{" "}
              <span className="font-semibold">
                {f.label.replace(/ \(.*\)$/, "")}
              </span>{" "}
              for better matches{" "}
              <span className="text-amber-400/70">(+{f.pts} pts)</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ── Claude tip ────────────────────────────────────────────────────────────────

function ClaudeTip({
  fieldOfStudy,
  researchInterests,
}: {
  fieldOfStudy: string;
  researchInterests: string[];
}) {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const researchInterestsList = researchInterests;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setTip(null);

    fetch("/api/profile-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldOfStudy, researchInterests: researchInterestsList }),
    })
      .then((r) => r.json())
      .then((data: { tip?: string | null; error?: string }) => {
        if (!cancelled) {
          if (data.tip) {
            setTip(data.tip);
          } else {
            setError(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fieldOfStudy, researchInterestsList]);

  if (error) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[rgba(108,71,255,0.25)] bg-[rgba(108,71,255,0.08)] px-4 py-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(108,71,255,0.2)]">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6C47FF]" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-[#6C47FF]" />
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6C47FF]">
          AI Insight
        </p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[var(--color-muted)]"
            >
              Generating personalized insight…
            </motion.p>
          ) : tip ? (
            <motion.p
              key="tip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm leading-relaxed text-[var(--color-subtle)]"
            >
              {tip}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface StepReviewProps {
  values: any;
  submitError: string | null;
}

export function StepReview({ values, submitError }: StepReviewProps) {
  const { total: score, fields } = computeScore(values);
  const tier = getTier(score);

  const getImageUrl = () => {
    const url = values.profilePhotoUrl;
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="space-y-5">
      {/* ── Profile Strength Card ─────────────────────────────────── */}
      <Card
        variant="glass"
        padding="none"
        className={`overflow-hidden border ${tier.borderClass}`}
        style={{ boxShadow: tier.glowStyle }}
      >
        <CardHeader className="border-b border-[var(--border-default)]">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${tier.textClass}`} />
            Profile Strength
          </CardTitle>
          <CardDescription>
            Complete more fields to unlock better grant matches.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            {/* Ring */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <ProfileRing score={score} tier={tier} />
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.35 }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${tier.bgClass} ${tier.borderClass} ${tier.textClass}`}
              >
                {score >= 70 ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                {tier.label}
              </motion.span>
            </div>

            {/* Field breakdown */}
            <div className="w-full space-y-2">
              {fields.map((f, i) => (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`h-2 flex-1 overflow-hidden rounded-full ${
                      f.filled
                        ? "bg-[rgba(240,240,255,0.08)]"
                        : "bg-[rgba(240,240,255,0.04)]"
                    }`}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: f.filled
                          ? `linear-gradient(90deg, ${tier.ringStart}, ${tier.ringEnd})`
                          : "transparent",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: f.filled ? "100%" : "0%" }}
                      transition={{
                        delay: 0.3 + i * 0.04,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                  <span
                    className={`w-[5.5rem] shrink-0 text-right text-[11px] ${
                      f.filled
                        ? "text-[var(--color-subtle)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {f.label.replace(/ \(.*\)$/, "")}
                  </span>
                  <span
                    className={`w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums ${
                      f.filled ? tier.textClass : "text-[var(--color-muted)]"
                    }`}
                  >
                    {f.filled ? `+${f.pts}` : `${f.pts}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-5 space-y-5">
            <Recommendations fields={fields} />

            {/* Claude tip */}
            <ClaudeTip
              fieldOfStudy={values.fieldOfStudy ?? ""}
              researchInterests={values.researchInterests ?? []}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Profile Summary Card ──────────────────────────────────── */}
      <Card variant="glass" padding="none" className="overflow-hidden">
        <CardHeader className="border-b border-[var(--border-default)]">
          <CardTitle>Profile summary</CardTitle>
          <CardDescription>
            Review everything before saving the profile to PostgreSQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 px-6 py-2">
          <SummaryRow label="Full name" value={values.fullName} />
          <SummaryRow label="Email" value={values.email} />
          <SummaryRow
            label="Profile photo"
            value={
              <div className="flex justify-end">
                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[rgba(108,71,255,0.2)] bg-[rgba(108,71,255,0.12)]">
                  <Image
                    src={getImageUrl()}
                    alt="Profile"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
            }
          />
          <SummaryRow label="Country" value={values.country} />
          <SummaryRow label="University" value={values.university} />
          <SummaryRow label="Degree level" value={values.degreeLevel} />
          <SummaryRow label="Field of study" value={values.fieldOfStudy} />
          <SummaryRow label="Graduation year" value={values.graduationYear} />
          <SummaryRow label="GPA" value={Number(values.gpa).toFixed(1)} />
          <SummaryRow
            label="Research interests"
            value={values.researchInterests.join(", ")}
          />
          <SummaryRow label="Grant types" value={values.grantTypes.join(", ")} />
          <SummaryRow
            label="Preferred countries"
            value={values.preferredCountries.join(", ")}
          />
          <SummaryRow
            label="Minimum amount"
            value={`$${Number(values.minGrantAmount).toLocaleString()}`}
          />
          <SummaryRow
            label="Deadline preference"
            value={
              deadlinePreferences.find(
                (item) => item.value === values.deadlinePreference
              )?.label ?? values.deadlinePreference
            }
          />
        </CardContent>
      </Card>

      {submitError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {submitError}
        </div>
      )}
    </div>
  );
}
