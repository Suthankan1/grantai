"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { getCategoryStyle, getScoreBadgeStyle } from "@/lib/interview-helpers";
import type { InterviewQuestionApi, InterviewSessionResponseApi } from "@/lib/api";

interface SessionReviewModalProps {
  selectedPastSession: InterviewSessionResponseApi | null;
  setSelectedPastSession: (session: InterviewSessionResponseApi | null) => void;
}

export function SessionReviewModal({
  selectedPastSession,
  setSelectedPastSession,
}: SessionReviewModalProps) {
  if (!selectedPastSession) return null;

  let pastQuestions: InterviewQuestionApi[] = [];
  let pastAnswers: { [key: number]: string } = {};
  let pastFeedbacks: {
    [key: number]: {
      score: number;
      strengths: string[];
      areas_to_improve: string[];
      suggested_improvements: string[];
      suggested_answer: string;
    };
  } = {};

  try {
    pastQuestions = JSON.parse(selectedPastSession.questionsJson || "[]");
    pastAnswers = JSON.parse(selectedPastSession.answersJson || "{}");
    pastFeedbacks = JSON.parse(selectedPastSession.feedbackJson || "{}");
  } catch {
    // ignore parse errors
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedPastSession(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-4xl glass-strong border border-[var(--border-strong)] rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-default)] flex justify-between items-center bg-primary/5">
          <div>
            <h3 className="text-lg font-bold text-white">Practice Session Review</h3>
            <p className="text-xs text-[var(--color-subtle)]">
              {selectedPastSession.grantTitle} • Average: {selectedPastSession.avgScore.toFixed(1)}/10
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPastSession(null)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="space-y-6">
            {pastQuestions.map((q, idx) => {
              const answer = pastAnswers[idx];
              const fb = pastFeedbacks[idx];

              if (!answer && !fb) return null; // Skip unattempted questions in past session

              return (
                <div
                  key={idx}
                  className="border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] p-5 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3 flex-wrap">
                    <div className="space-y-1">
                      <span
                        className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyle(
                          q.category
                        )}`}
                      >
                        {q.category}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        {idx + 1}. {q.question}
                      </h4>
                    </div>
                    {fb && (
                      <span
                        className={`text-sm font-bold font-display px-3 py-1 rounded-xl border ${getScoreBadgeStyle(
                          fb.score
                        )}`}
                      >
                        Score: {fb.score} / 10
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-subtle)] block">
                      Your Answer:
                    </span>
                    <p className="text-sm text-[var(--color-text)]/85 bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                      {answer || "No response text found."}
                    </p>
                  </div>

                  {fb && (
                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                      <div className="p-4 border border-emerald-500/10 bg-emerald-500/5 rounded-xl space-y-2">
                        <h5 className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                        </h5>
                        <ul className="text-xs text-[var(--color-text)]/80 pl-4 list-disc space-y-1">
                          {fb.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 border border-amber-500/10 bg-amber-500/5 rounded-xl space-y-2">
                        <h5 className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Improvements
                        </h5>
                        <ul className="text-xs text-[var(--color-text)]/80 pl-4 list-disc space-y-1">
                          {fb.areas_to_improve?.map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {fb?.suggested_answer && (
                    <div className="p-4 border border-indigo-500/10 bg-indigo-500/5 rounded-xl space-y-1.5">
                      <h5 className="text-xs uppercase font-bold text-indigo-400 flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5" /> Suggested Answer
                      </h5>
                      <p className="text-xs italic leading-relaxed text-[var(--color-text)]/80">
                        {fb.suggested_answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
