"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryStyle } from "@/lib/interview-helpers";
import type { InterviewQuestionApi } from "@/lib/api";

interface QuestionAccordionProps {
  questions: InterviewQuestionApi[];
  sessionFeedbacks: {
    [key: number]: {
      score: number;
    };
  };
  openPracticeModal: (q: InterviewQuestionApi, idx: number) => void;
}

export function QuestionAccordion({
  questions,
  sessionFeedbacks,
  openPracticeModal,
}: QuestionAccordionProps) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const isExpanded = expandedIndex === idx;
        const answeredFeedback = sessionFeedbacks[idx];

        return (
          <div
            key={idx}
            className="border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="flex items-center justify-between w-full p-5 text-left transition hover:bg-[rgba(240,240,255,0.04)]"
            >
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryStyle(
                      q.category
                    )}`}
                  >
                    {q.category}
                  </span>
                  {answeredFeedback && (
                    <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                      <Check className="h-3 w-3" /> Answered ({answeredFeedback.score}/10)
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold leading-snug text-white">
                  {idx + 1}. {q.question}
                </h3>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-[var(--color-subtle)] transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-5 pt-0 border-t border-[var(--border-default)] bg-[rgba(240,240,255,0.01)] text-sm space-y-4">
                    <p className="text-[var(--color-subtle)] leading-relaxed mt-4">
                      {q.context ||
                        "This prompt evaluates your research design competency, alignment to key program pillars, and capability to successfully manage resources. Focus on demonstrating a clear methodology and structured approach in your response."}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-[var(--color-muted)]">
                        {answeredFeedback
                          ? "Re-practice to refine your feedback score."
                          : "Take your time. Click below to begin speaking/typing."}
                      </span>
                      <Button
                        type="button"
                        onClick={() => openPracticeModal(q, idx)}
                        variant="glow"
                        size="sm"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        {answeredFeedback ? "Practice Again" : "Practice Question"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
