"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({ badge, title, description, footer, children }: AuthShellProps) {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.28),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.16),_transparent_30%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
      <div
        className="absolute left-[-8rem] top-1/4 h-80 w-80 rounded-full bg-[#6C47FF]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute right-[-6rem] bottom-1/4 h-72 w-72 rounded-full bg-[#00D4AA]/12 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-7xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <div className="mb-6 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[rgba(15,15,26,0.8)] px-4 py-2 text-sm text-[var(--color-muted)] backdrop-blur-xl">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] text-white shadow-glow-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              GrantAI onboarding
            </Link>
          </div>

          <Card variant="glass-strong" padding="none" className="overflow-hidden">
            <div className="border-b border-[var(--border-default)] px-6 py-5 sm:px-8 sm:py-6">
              <div className="mb-3">
                <Badge variant="primary" className="px-3 py-1">
                  {badge}
                </Badge>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
                {description}
              </p>
            </div>

            <CardContent className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
              {children}
              {footer && <div className="pt-2">{footer}</div>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}