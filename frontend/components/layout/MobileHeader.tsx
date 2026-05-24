"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[rgba(240,240,255,0.05)] px-4 bg-[rgba(8,8,16,0.5)] backdrop-blur-md md:hidden shrink-0">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm">
          <span className="text-[10px] font-bold text-white">G</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">GrantAI</span>
      </Link>
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,240,255,0.06)] text-[var(--color-muted)] hover:text-white"
        aria-label="Open Menu"
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
