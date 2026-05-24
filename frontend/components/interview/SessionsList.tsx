"use client";

import { Calendar, BookOpen, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScoreBadgeStyle } from "@/lib/interview-helpers";
import type { InterviewSessionResponseApi } from "@/lib/api";

interface SessionsListProps {
  isLoading: boolean;
  sessions: InterviewSessionResponseApi[] | undefined;
  setSelectedPastSession: (session: InterviewSessionResponseApi) => void;
}

export function SessionsList({
  isLoading,
  sessions,
  setSelectedPastSession,
}: SessionsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 shimmer rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  if (sessions && sessions.length > 0) {
    return (
      <div className="space-y-4">
        {sessions.map((session) => {
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
      </div>
    );
  }

  return (
    <Card className="p-10 text-center border-[var(--border-default)]">
      <FileText className="h-12 w-12 text-[var(--color-muted)] mx-auto mb-3" />
      <CardTitle className="text-lg">No sessions saved yet</CardTitle>
      <p className="text-sm text-[var(--color-muted)] mt-1 max-w-sm mx-auto">
        Practice questions on the left tab and save your session to build an interview audit trail.
      </p>
    </Card>
  );
}
