"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CalendarClock, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/lib/api";
import type { DashboardStatsApi } from "@/lib/types";

type DeadlineItem = DashboardStatsApi["upcomingDeadlines"][number];

const LS_KEY = "grantai-notifications-read";

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids)));
}

function urgencyColor(daysLeft: number) {
  if (daysLeft <= 2) return "text-rose-400";
  if (daysLeft <= 4) return "text-amber-400";
  return "text-yellow-400";
}

function urgencyBg(daysLeft: number) {
  if (daysLeft <= 2) return "bg-rose-500/10 border-rose-500/20";
  if (daysLeft <= 4) return "bg-amber-500/10 border-amber-500/20";
  return "bg-yellow-500/10 border-yellow-500/20";
}

interface NotificationsPanelProps {
  isCollapsed?: boolean;
}

export function NotificationsPanel({ isCollapsed = false }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load read IDs from localStorage on mount
  useEffect(() => {
    setReadIds(getReadIds());
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats()
      .then((stats) => {
        if (cancelled) return;
        const filtered = (stats.upcomingDeadlines ?? []).filter(
          (d) => d.daysLeft <= 7
        );
        setDeadlines(filtered);
      })
      .catch(() => {
        // silently fail – notifications are non-critical
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = deadlines.filter((d) => !readIds.has(d.trackerId)).length;

  const markAllRead = useCallback(() => {
    const next = new Set(readIds);
    deadlines.forEach((d) => next.add(d.trackerId));
    setReadIds(next);
    saveReadIds(next);
  }, [deadlines, readIds]);

  const markOneRead = useCallback(
    (trackerId: string) => {
      const next = new Set(readIds);
      next.add(trackerId);
      setReadIds(next);
      saveReadIds(next);
    },
    [readIds]
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className={cn(
            "relative flex items-center justify-center rounded-xl transition-all duration-200",
            "text-[var(--color-muted)] hover:text-white hover:bg-[rgba(240,240,255,0.06)]",
            isCollapsed ? "h-10 w-10" : "h-10 w-10"
          )}
        >
          <Bell className="h-4.5 w-4.5 shrink-0" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute flex items-center justify-center rounded-full bg-rose-500 text-white font-bold leading-none",
                "text-[9px] min-w-[16px] h-4 px-1",
                "top-0.5 right-0.5 ring-2 ring-[#080810]"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}

          {/* Tooltip for collapsed sidebar */}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2.5 py-1.5 rounded-md bg-[rgba(15,15,25,0.95)] border border-[rgba(240,240,255,0.08)] text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap shadow-xl">
              Notifications
            </div>
          )}
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Slide-in Panel */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed top-0 left-0 bottom-0 z-50 flex flex-col",
                  "w-80 bg-[#0c0c1a] border-r border-[rgba(240,240,255,0.07)]",
                  "shadow-2xl focus:outline-none"
                )}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(240,240,255,0.06)] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-sm font-semibold text-white leading-none">
                        Notifications
                      </Dialog.Title>
                      <Dialog.Description className="text-[10px] text-[var(--color-muted)] mt-0.5">
                        Upcoming grant deadlines
                      </Dialog.Description>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        title="Mark all as read"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-[var(--color-muted)] hover:text-white hover:bg-[rgba(240,240,255,0.06)] transition-all duration-200"
                      >
                        <CheckCheck className="h-3 w-3" />
                        All read
                      </button>
                    )}
                    <Dialog.Close asChild>
                      <button
                        aria-label="Close notifications"
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-[var(--color-muted)] hover:text-white hover:bg-[rgba(240,240,255,0.06)] transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
                  {loading && (
                    <div className="flex flex-col gap-2 mt-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded-xl bg-[rgba(240,240,255,0.03)] animate-pulse"
                        />
                      ))}
                    </div>
                  )}

                  {!loading && deadlines.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                      <div className="h-12 w-12 rounded-full bg-[rgba(108,71,255,0.12)] flex items-center justify-center">
                        <CalendarClock className="h-6 w-6 text-[#6C47FF]" />
                      </div>
                      <p className="text-sm font-medium text-white">All clear!</p>
                      <p className="text-xs text-[var(--color-muted)] max-w-[180px]">
                        No grants due within the next 7 days.
                      </p>
                    </div>
                  )}

                  {!loading &&
                    deadlines.map((item) => {
                      const isRead = readIds.has(item.trackerId);
                      return (
                        <Link
                          key={item.trackerId}
                          href="/tracker"
                          onClick={() => {
                            markOneRead(item.trackerId);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 group",
                            "hover:bg-[rgba(108,71,255,0.08)] hover:border-[rgba(108,71,255,0.25)]",
                            urgencyBg(item.daysLeft),
                            isRead && "opacity-50"
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            <Clock
                              className={cn(
                                "h-4 w-4 transition-colors",
                                urgencyColor(item.daysLeft)
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white leading-snug truncate">
                              📅 {item.grantTitle}
                            </p>
                            <p
                              className={cn(
                                "text-[11px] font-medium mt-0.5",
                                urgencyColor(item.daysLeft)
                              )}
                            >
                              {item.daysLeft === 0
                                ? "Due today!"
                                : item.daysLeft === 1
                                ? "Due tomorrow!"
                                : `Due in ${item.daysLeft} days`}
                            </p>
                            <p className="text-[10px] text-[var(--color-muted)] mt-0.5 truncate">
                              {item.provider}
                            </p>
                          </div>
                          {!isRead && (
                            <div className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0c0c1a]" />
                          )}
                        </Link>
                      );
                    })}
                </div>

                {/* Footer */}
                {deadlines.length > 0 && (
                  <div className="px-4 py-3 border-t border-[rgba(240,240,255,0.05)] shrink-0">
                    <Link
                      href="/tracker"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center w-full py-2 rounded-xl text-xs font-semibold text-[#6C47FF] hover:text-white hover:bg-[rgba(108,71,255,0.15)] border border-[rgba(108,71,255,0.2)] hover:border-[rgba(108,71,255,0.4)] transition-all duration-200"
                    >
                      View all in Tracker →
                    </Link>
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
