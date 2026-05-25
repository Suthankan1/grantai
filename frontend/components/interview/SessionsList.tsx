"use client";

import { useState } from "react";
import { Calendar, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScoreBadgeStyle } from "@/lib/interview-helpers";
import type { InterviewSessionResponseApi } from "@/lib/api";

interface SessionsListProps {
  isLoading: boolean;
  sessions: InterviewSessionResponseApi[] | undefined;
  setSelectedPastSession: (session: InterviewSessionResponseApi) => void;
  limit?: number;
}

export function SessionsList({
  isLoading,
  sessions,
  setSelectedPastSession,
  limit = 10,
}: SessionsListProps) {
  const [visibleCount, setVisibleCount] = useState(limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 shimmer rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card variant="glass-strong" className="p-10 text-center border-[var(--border-default)] flex flex-col items-center justify-center">
        {/* Custom Premium SVG Illustration */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl w-24 h-24 -z-10" />
          <svg
            className="w-28 h-28 text-[var(--color-muted)] drop-shadow-[0_0_15px_rgba(108,71,255,0.15)]"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer dotted circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-20 animate-[spin_120s_linear_infinite]"
            />
            {/* Inner background shield / document */}
            <path
              d="M38 32C38 29.7909 39.7909 28 42 28H70L82 40V88C82 90.2091 80.2091 92 78 92H42C39.7909 92 38 90.2091 38 88V32Z"
              fill="rgba(240, 240, 255, 0.02)"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-40"
            />
            {/* Folded paper corner */}
            <path d="M70 28V40H82" stroke="currentColor" strokeWidth="2" className="opacity-40" />
            {/* Lines on document */}
            <line x1="46" y1="46" x2="68" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-30" />
            <line x1="46" y1="56" x2="74" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-30" />
            <line x1="46" y1="66" x2="62" y2="66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-30" />
            {/* Floating speech/feedback bubble */}
            <g className="animate-[bounce_3s_ease-in-out_infinite]">
              <path
                d="M74 64C74 58.4772 78.4772 54 84 54H94C99.5228 54 104 58.4772 104 64C104 69.5228 99.5228 74 94 74H88L80 80V74C76.4772 74 74 71.5228 74 64Z"
                fill="url(#illustration-glow)"
                stroke="#00D4AA"
                strokeWidth="1.5"
              />
              {/* Checkmark inside speech bubble */}
              <path
                d="M86 64L88.5 66.5L93.5 61.5"
                stroke="#00D4AA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <linearGradient id="illustration-glow" x1="74" y1="54" x2="104" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00D4AA" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <CardTitle className="text-lg">No sessions saved yet</CardTitle>
        <p className="text-sm text-[var(--color-muted)] mt-2 max-w-sm mx-auto leading-relaxed">
          Practice questions on the left tab and save your session to build an interview audit trail.
        </p>
      </Card>
    );
  }

  const displayedSessions = sessions.slice(0, visibleCount);
  const hasMore = sessions.length > visibleCount;

  return (
    <div className="space-y-4">
      {displayedSessions.map((session) => {
        let questionsList = [];
        let answersMap = {};
        try {
          questionsList = JSON.parse(session.questionsJson || "[]");
          answersMap = JSON.parse(session.answersJson || "{}");
        } catch (e) {
          console.error("Failed to parse JSON for session history", e);
        }

        const attemptedCount = Object.keys(answersMap).length;

        return (
          <Card
            key={session.id}
            variant="glass-strong"
            className="border-[var(--border-default)] hover:border-primary/40 transition duration-300 overflow-hidden"
          >
            <CardContent className="p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-white">{session.grantTitle}</h4>
                <p className="text-xs text-[var(--color-muted)]">{session.grantProvider}</p>
                <div className="flex items-center gap-3 text-xs text-[var(--color-subtle)] mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {attemptedCount} / {questionsList.length} Questions Attempted
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-subtle)] block">
                    Average Score
                  </span>
                  <span
                    className={`text-lg font-bold font-display px-3 py-1 rounded-xl border block mt-1 ${getScoreBadgeStyle(
                      Math.round(session.avgScore)
                    )}`}
                  >
                    {session.avgScore.toFixed(1)} / 10
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPastSession(session)}
                >
                  Review feedback
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + limit)}
            className="border-primary/40 hover:border-primary/85 hover:bg-primary/5 transition duration-300 text-white font-medium"
          >
            Load more sessions
          </Button>
        </div>
      )}
    </div>
  );
}
