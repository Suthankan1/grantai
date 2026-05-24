"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const { logout } = useAuthStore();

  useEffect(() => {
    // Check if demo mode is enabled in localStorage
    const checkDemo = () => {
      const demo = window.localStorage.getItem("grantai-demo-mode");
      setIsDemo(demo === "true");
    };

    checkDemo();
    // Poll or listen for storage changes
    window.addEventListener("storage", checkDemo);
    
    // We also check periodically in case of internal transitions
    const interval = setInterval(checkDemo, 1000);

    return () => {
      window.removeEventListener("storage", checkDemo);
      clearInterval(interval);
    };
  }, []);

  const handleExitDemo = () => {
    window.localStorage.removeItem("grantai-demo-mode");
    logout();
    setIsDemo(false);
    window.location.href = "/";
  };

  if (!isDemo) return null;

  return (
    <div className="relative z-[9999] w-full bg-gradient-to-r from-[#6C47FF]/90 via-[#8B5CF6]/90 to-[#00D4AA]/90 text-white backdrop-blur-md px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] shadow-lg animate-fade-in-up">
      <div className="flex items-center gap-2 max-w-[75%]">
        <Sparkles className="h-4 w-4 text-amber-300 animate-pulse shrink-0" />
        <span className="truncate leading-normal">
          <strong>Guided Demo Mode Active:</strong> Simulating a PhD research profile & cover letters client-side. No database or API configuration required.
        </span>
      </div>
      <button
        onClick={handleExitDemo}
        type="button"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 text-white font-semibold text-[11px] uppercase tracking-wider shrink-0"
      >
        <LogOut className="h-3 w-3" />
        Exit Demo
      </button>
    </div>
  );
}
