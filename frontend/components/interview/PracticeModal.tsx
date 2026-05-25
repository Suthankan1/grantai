"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryStyle, getScoreBadgeStyle } from "@/lib/interview-helpers";
import type { InterviewQuestionApi } from "@/lib/api";

interface PracticeModalProps {
  practiceQuestion: {
    question: InterviewQuestionApi;
    index: number;
  } | null;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  recordingState: "idle" | "recording" | "done";
  setRecordingState: (state: "idle" | "recording" | "done") => void;
  feedback: {
    score: number;
    strengths: string[];
    areas_to_improve: string[];
    suggested_improvements: string[];
    suggested_answer: string;
  } | null;
  setFeedback: (fb: {
    score: number;
    strengths: string[];
    areas_to_improve: string[];
    suggested_improvements: string[];
    suggested_answer: string;
  } | null) => void;
  submittingAnswer: boolean;
  closePracticeModal: () => void;
  handleSubmitAnswer: () => void;
  isSpeechSupported: boolean;
  startSpeechRecognition: () => void;
  stopSpeechRecognition: () => void;
}

export function PracticeModal({
  practiceQuestion,
  userAnswer,
  setUserAnswer,
  recordingState,
  setRecordingState,
  feedback,
  setFeedback,
  submittingAnswer,
  closePracticeModal,
  handleSubmitAnswer,
  isSpeechSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
}: PracticeModalProps) {
  // Framer Motion staggered animation configuration
  const feedbackContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const feedbackItemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
  };

  if (!practiceQuestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closePracticeModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-3xl glass-strong border border-[var(--border-strong)] rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[var(--border-default)] flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyle(
                practiceQuestion.question.category
              )}`}
            >
              {practiceQuestion.question.category}
            </span>
            <span className="text-xs text-[var(--color-subtle)]">
              Question {practiceQuestion.index + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={closePracticeModal}
            className="text-gray-400 hover:text-white text-sm"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Question Title */}
          <h3 className="text-xl font-bold leading-snug text-white">
            {practiceQuestion.question.question}
          </h3>

          {/* Audio Recording dictation visualizer */}
          {recordingState === "recording" && (
            <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-3 w-3 rounded-full bg-rose-500 inline-block"
                />
                <span className="text-xs uppercase font-semibold text-rose-400 tracking-wider">
                  PRACTICE VOICE INPUT RECORDING
                </span>
              </div>
              <div className="flex gap-1 h-6 items-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      height: [8, 24, 8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.08,
                    }}
                    className="w-1 bg-rose-500/60 rounded-full"
                  />
                ))}
              </div>
              <p className="text-xs text-[var(--color-muted)] max-w-sm">
                Speech-to-text transcription active. Talk clearly. Click Stop below to review or directly type your answer.
              </p>
              <Button
                type="button"
                variant="glow"
                onClick={stopSpeechRecognition}
                className="bg-rose-500 hover:bg-rose-600 border-none px-4 py-1.5 h-8 text-xs font-semibold"
              >
                <MicOff className="h-3.5 w-3.5 mr-1" />
                Stop Recording
              </Button>
            </div>
          )}

          {recordingState === "done" && (
            <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Audio recording completed! Review and edit the transcript below.</span>
            </div>
          )}

          {/* Answer Input Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-subtle)]">
              Your response
            </label>
            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  if (recordingState === "recording") setRecordingState("done");
                }}
                placeholder="Type your response here..."
                className="w-full h-36 border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] p-4 rounded-xl text-sm leading-relaxed focus:border-primary focus:outline-none transition resize-none pr-8"
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-[var(--color-muted)]">
                {userAnswer.length} / 1000 characters
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center border-t border-[var(--border-default)] pt-4">
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUserAnswer("");
                  setRecordingState("idle");
                  setFeedback(null);
                }}
                disabled={submittingAnswer}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>

              {isSpeechSupported && recordingState === "idle" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startSpeechRecognition}
                  disabled={submittingAnswer}
                  className="border-primary/40 hover:border-primary/80 text-primary hover:text-white"
                >
                  <Mic className="h-3.5 w-3.5 mr-1 text-primary animate-pulse" /> Start Voice Input
                </Button>
              )}
            </div>

            <Button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={submittingAnswer || !userAnswer.trim()}
              variant="glow"
            >
              {submittingAnswer ? "Analyzing..." : "Submit for Feedback"}
            </Button>
          </div>

          {/* FEEDBACK DISPLAY SECTION (STAGGERED ANIMATION) */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                variants={feedbackContainerVariants}
                initial="hidden"
                animate="show"
                className="p-6 border border-[var(--border-default)] bg-[rgba(20,20,35,0.7)] rounded-2xl space-y-6 mt-6"
              >
                {/* Score Section */}
                <motion.div
                  variants={feedbackItemVariants}
                  className="flex items-center justify-between border-b border-[var(--border-default)] pb-4"
                >
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-subtle)]">
                      AI Feedback Score
                    </h4>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Based on precision, relevance, and alignment.
                    </p>
                  </div>
                  <div
                    className={`text-xl font-bold font-display px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${getScoreBadgeStyle(
                      feedback.score || 0
                    )}`}
                  >
                    <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                    {feedback.score || 0} / 10
                  </div>
                </motion.div>

                {/* Strengths Section */}
                <motion.div variants={feedbackItemVariants} className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Strengths
                  </h4>
                  <ul className="space-y-1.5 pl-6 list-disc text-sm text-[var(--color-text)]/90">
                    {feedback.strengths?.map((str, i) => (
                      <li key={i} className="marker:text-emerald-400">
                        {str}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Areas to Improve */}
                <motion.div variants={feedbackItemVariants} className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> Areas to Improve
                  </h4>
                  <ul className="space-y-1.5 pl-6 list-disc text-sm text-[var(--color-text)]/90">
                    {feedback.areas_to_improve?.map((area, i) => (
                      <li key={i} className="marker:text-amber-400">
                        {area}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Suggested Response Paragraph */}
                <motion.div
                  variants={feedbackItemVariants}
                  className="space-y-2 border-t border-[var(--border-default)] pt-4"
                >
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-indigo-400" /> Suggested Answer
                  </h4>
                  <p className="text-sm italic leading-relaxed text-[var(--color-text)]/85 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                    {feedback.suggested_answer}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
