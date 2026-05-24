"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer
      className="relative py-10 px-4 sm:px-6 lg:px-8 text-center"
      role="contentinfo"
      style={{ borderTop: "1px solid var(--border-default)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6C47FF, #00D4AA)" }}
            aria-hidden="true"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="font-display font-semibold text-sm" style={{ color: "var(--color-text)" }}>
            GrantAI
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          © {new Date().getFullYear()} GrantAI. All rights reserved.
        </p>
        <div className="flex gap-5 text-xs" style={{ color: "var(--color-muted)" }}>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
