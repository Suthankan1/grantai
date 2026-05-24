"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, FileText, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { TrackerEntryApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TrackerCardProps {
  card: TrackerEntryApi;
  onClick: (card: TrackerEntryApi) => void;
}

const TrackerCard = React.memo(function TrackerCard({ card, onClick }: TrackerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: "grab",
  };

  // 1. Deadline Intelligence calculations
  const getDeadlineInfo = (deadlineStr: string) => {
    if (!deadlineStr) return { text: "No deadline", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" };
    
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: "Passed",
        color: "text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        icon: Clock,
      };
    } else if (diffDays === 0) {
      return {
        text: "Due today",
        color: "text-red-400 font-semibold animate-pulse",
        bg: "bg-red-500/15",
        border: "border-red-500/30",
        icon: AlertTriangle,
      };
    } else if (diffDays === 1) {
      return {
        text: "1 day left",
        color: "text-red-400 font-semibold",
        bg: "bg-red-500/15",
        border: "border-red-500/30",
        icon: Clock,
      };
    } else if (diffDays < 7) {
      return {
        text: `${diffDays} days left`,
        color: "text-red-400 font-semibold",
        bg: "bg-red-500/15",
        border: "border-red-500/30",
        icon: Clock,
      };
    } else if (diffDays <= 30) {
      return {
        text: `${diffDays} days left`,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/25",
        icon: Clock,
      };
    } else {
      return {
        text: `${diffDays} days left`,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/25",
        icon: Clock,
      };
    }
  };

  const deadlineInfo = getDeadlineInfo(card.grantDeadline);

  // Formatting amount
  const formatAmount = (amount: string | number | null, currency: string | null) => {
    if (!amount) return "No award amount specified";
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  // Formatting applied date
  const formatAppliedDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Get cover letter badge styling
  const getCoverLetterBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "READY":
      case "SAVED":
        return {
          label: "Letter Ready",
          style: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
          icon: FileText,
        };
      case "GENERATING":
        return {
          label: "Generating AI...",
          style: "bg-purple-500/15 border-purple-500/30 text-purple-400 animate-pulse",
          icon: Sparkles,
        };
      case "FAILED":
        return {
          label: "Generation Failed",
          style: "bg-red-500/10 border-red-500/25 text-red-400",
          icon: AlertTriangle,
        };
      default:
        return null;
    }
  };

  const letterBadge = getCoverLetterBadge(card.coverLetterStatus);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(card)}
      className="group relative flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-4.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(108,71,255,0.4)] hover:bg-[rgba(12,12,28,0.65)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] active:cursor-grabbing"
    >
      {/* Visual Glassmorphism Highlight */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-[rgba(108,71,255,0.03)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Grant Title and Provider */}
      <div>
        <h4 className="line-clamp-2 text-sm font-semibold tracking-wide text-[var(--color-text)] transition-colors group-hover:text-white">
          {card.grantTitle}
        </h4>
        <span className="mt-1 block text-xs text-[var(--color-muted)] font-medium">
          {card.grantProvider}
        </span>
      </div>

      {/* Award Amount */}
      <div className="text-xs font-semibold text-[rgba(240,240,255,0.85)] bg-[rgba(240,240,255,0.03)] border border-[rgba(240,240,255,0.06)] rounded-lg px-2.5 py-1.5 w-fit">
        {formatAmount(card.grantAmount, card.grantCurrency)}
      </div>

      {/* Notes Preview */}
      {card.notes && (
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-muted)] italic border-l-2 border-[var(--border-default)] pl-2">
          {card.notes}
        </p>
      )}

      {/* Badges / Meta row */}
      <div className="mt-1 flex flex-wrap gap-2 items-center justify-between border-t border-[rgba(240,240,255,0.04)] pt-3">
        {/* Deadline Indicator */}
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium border", deadlineInfo.bg, deadlineInfo.border, deadlineInfo.color)}>
          <Clock className="h-3 w-3" />
          {deadlineInfo.text}
        </div>

        {/* Cover Letter status badge */}
        {letterBadge && (
          <div className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border", letterBadge.style)}>
            <letterBadge.icon className="h-3 w-3" />
            {letterBadge.label}
          </div>
        )}
      </div>

      {/* Applied Date (if set) */}
      {card.appliedDate && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
          <Calendar className="h-3 w-3" />
          <span>Applied: {formatAppliedDate(card.appliedDate)}</span>
        </div>
      )}
    </div>
  );
});

export default TrackerCard;
