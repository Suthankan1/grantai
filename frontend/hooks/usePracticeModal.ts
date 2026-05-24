"use client";

import { useEffect, useState } from "react";
import { getInterviewFeedback, type InterviewQuestionApi } from "@/lib/api";

interface UsePracticeModalProps {
  grant: any;
  sessionAnswers: { [key: number]: string };
  sessionFeedbacks: {
    [key: number]: {
      score: number;
      strengths: string[];
      areas_to_improve: string[];
      suggested_improvements: string[];
      suggested_answer: string;
    };
  };
  setSessionAnswers: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
  setSessionFeedbacks: React.Dispatch<
    React.SetStateAction<{
      [key: number]: {
        score: number;
        strengths: string[];
        areas_to_improve: string[];
        suggested_improvements: string[];
        suggested_answer: string;
      };
    }>
  >;
}

export function usePracticeModal({
  grant,
  sessionAnswers,
  sessionFeedbacks,
  setSessionAnswers,
  setSessionFeedbacks,
}: UsePracticeModalProps) {
  const [practiceQuestion, setPracticeQuestion] = useState<{
    question: InterviewQuestionApi;
    index: number;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "done">("idle");
  const [feedback, setFeedback] = useState<{
    score: number;
    strengths: string[];
    areas_to_improve: string[];
    suggested_improvements: string[];
    suggested_answer: string;
  } | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Handle simulate speech-to-text dictation
  useEffect(() => {
    if (recordingState !== "recording") return;

    const timer = setTimeout(() => {
      setRecordingState("done");
      // Pre-filled simulated text based on the category of the question
      const sampleTranscripts: { [key: string]: string } = {
        "Research Background":
          "Our research focuses on novel methods to enhance neural net execution efficiency. We plan to utilize advanced compilers and customized sparse kernels to accelerate Transformer runtimes by up to three times on edge hardware, lowering barriers to deployment.",
        Motivation:
          "We are driven to solve real-world efficiency challenges in computing. This grant would enable us to scale our efforts, transition our research prototypes into fully audited open-source tools, and directly build community capacity.",
        Technical:
          "We plan to implement a secure rust-based compiler layer. By utilizing WebAssembly to isolate untrusted compilation artifacts and strict unit testing, we ensure that execution and security are balanced beautifully.",
        Impact:
          "By making our tools fully open source and highly compatible with legacy platforms, we enable academic labs with limited hardware budgets to run cutting-edge inference, fostering democratic AI research worldwide.",
        "Future Plans":
          "Over the next three years, we aim to expand our framework to support mobile deployment. We are forming partnerships with major universities to run training workshops and establish long-term maintenance of the repository.",
      };

      const category = practiceQuestion?.question.category || "Motivation";
      setUserAnswer(sampleTranscripts[category] || sampleTranscripts["Motivation"]);
    }, 4500);

    return () => clearTimeout(timer);
  }, [recordingState, practiceQuestion]);

  const openPracticeModal = (q: InterviewQuestionApi, idx: number) => {
    setPracticeQuestion({ question: q, index: idx });
    setUserAnswer(sessionAnswers[idx] || "");
    setFeedback(sessionFeedbacks[idx] || null);
    setRecordingState(sessionAnswers[idx] ? "idle" : "recording");
  };

  const closePracticeModal = () => {
    setPracticeQuestion(null);
    setUserAnswer("");
    setFeedback(null);
    setRecordingState("idle");
  };

  const handleSubmitAnswer = async () => {
    if (!practiceQuestion || !userAnswer.trim()) return;

    try {
      setSubmittingAnswer(true);
      const res = await getInterviewFeedback(
        practiceQuestion.question.question,
        userAnswer,
        grant
      );

      setFeedback(res);
      setSessionAnswers((prev) => ({ ...prev, [practiceQuestion.index]: userAnswer }));
      setSessionFeedbacks((prev) => ({ ...prev, [practiceQuestion.index]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return {
    practiceQuestion,
    userAnswer,
    setUserAnswer,
    recordingState,
    setRecordingState,
    feedback,
    setFeedback,
    submittingAnswer,
    openPracticeModal,
    closePracticeModal,
    handleSubmitAnswer,
  };
}
