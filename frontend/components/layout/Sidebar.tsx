"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  FileText,
  Kanban,
  Mic,
  Settings,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { authLogout } from "@/lib/api";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Grant Finder", href: "/grants", icon: Search },
  { label: "Tracker", href: "/tracker", icon: Kanban },
  { href: "/letters", label: "My Letters", icon: FileText },
  { label: "Interview Prep", href: "/interview", icon: Mic },
  { label: "Settings", href: "/onboarding", icon: Settings },
];

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      await authLogout();
    } finally {
      logout();
      router.push("/auth/login");
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full overflow-hidden bg-[rgba(8,8,16,0.6)] backdrop-blur-md">
      {/* Brand Logo Header */}
      <div className={cn(
        "flex items-center h-16 px-6 border-b border-[rgba(240,240,255,0.05)] shrink-0",
        isCollapsed ? "justify-center px-0" : "justify-between"
      )}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-display text-[1.1rem] font-semibold tracking-tight text-white">
              Grant<span className="text-[#00D4AA]">AI</span>
            </span>
          )}
        </Link>
        
        {!isCollapsed && onMobileClose === undefined && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex items-center justify-center h-6 w-6 rounded-md border border-[rgba(240,240,255,0.06)] bg-[rgba(240,240,255,0.02)] text-[var(--color-muted)] hover:text-white transition duration-200"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Collapse Trigger for Collapsed State */}
      {isCollapsed && onMobileClose === undefined && (
        <div className="hidden lg:flex justify-center py-2 border-b border-[rgba(240,240,255,0.05)]">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-[rgba(240,240,255,0.06)] bg-[rgba(240,240,255,0.02)] text-[var(--color-muted)] hover:text-white transition duration-200"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 group",
                isActive 
                  ? "text-white shadow-glow-sm" 
                  : "text-[var(--color-muted)] hover:text-white hover:bg-[rgba(240,240,255,0.04)]",
                isCollapsed && "justify-center"
              )}
            >
              {/* Active Background Pill with Gradient and Border Glow */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[rgba(108,71,255,0.25)] to-[rgba(108,71,255,0.08)] border border-[rgba(108,71,255,0.35)] -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon className={cn(
                "h-4.5 w-4.5 shrink-0 transition-colors duration-300",
                isActive ? "text-[#6C47FF]" : "text-[var(--color-muted)] group-hover:text-white"
              )} />

              {!isCollapsed && <span>{item.label}</span>}

              {/* Tooltip for Collapsed Sidebar */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2.5 py-1.5 rounded-md bg-[rgba(15,15,25,0.95)] border border-[rgba(240,240,255,0.08)] text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Block + Sign Out */}
      <div className={cn(
        "p-4 border-t border-[rgba(240,240,255,0.05)] mt-auto shrink-0 flex flex-col gap-3",
        isCollapsed && "items-center"
      )}>
        {/* User Card */}
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center font-semibold text-white shadow-glow-sm border border-[rgba(240,240,255,0.08)]">
            {getInitials(user?.fullName ?? null)}
          </div>
          
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-none mb-1">
                {user?.fullName ?? "Grant Researcher"}
              </p>
              <p className="text-[10px] text-[var(--color-muted)] truncate leading-none">
                {user?.email ?? ""}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400/90 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 w-full",
            isCollapsed && "justify-center px-0 h-10"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (Overlay and Menu Panel) */}
      <div className={cn(
        "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Darkened blur backdrop */}
        <div 
          onClick={onMobileClose} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />
        
        {/* Sliding Menu Panel */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-64 bg-[#080810] border-r border-[rgba(240,240,255,0.06)] transform transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {SidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar Spacer (to maintain layout space) */}
      <aside className={cn(
        "hidden md:block h-screen shrink-0 transition-all duration-300 pointer-events-none invisible",
        isCollapsed ? "w-20" : "w-64"
      )} />

      {/* Desktop Sidebar (Fixed viewport block) */}
      <aside className={cn(
        "hidden md:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 border-r border-[rgba(240,240,255,0.05)] bg-[#080810]/70",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {SidebarContent}
      </aside>
    </>
  );
}
