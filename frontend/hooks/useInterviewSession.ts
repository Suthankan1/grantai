"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getInterviewQuestions,
  saveInterviewSession,
  type InterviewQuestionApi,
} from "@/lib/api";

interface UseInterviewSessionProps {
  grantId: string;
  grant: any;
  setActiveTab: (tab: "questions" | "sessions") => void;
}

export function useInterviewSession({ grantId, grant, setActiveTab }: UseInterviewSessionProps) {
  const queryClient = useQueryClient();

  const [questions, setQuestions] = useState<InterviewQuestionApi[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [sessionAnswers, setSessionAnswers] = useState<{ [key: number]: string }>({});
  const [sessionFeedbacks, setSessionFeedbacks] = useState<{
    [key: number]: {
      score: number;
      strengths: string[];
      areas_to_improve: string[];
      suggested_improvements: string[];
      suggested_answer: string;
    };
  }>({});
  const [savingSession, setSavingSession] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!grant) return;

    const generateQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setQuestionsError(null);
        const res = await getInterviewQuestions(grant);
        if (res?.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        } else {
          throw new Error("No questions returned by generator.");
        }
      } catch (err) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "Failed to generate interview questions. Please try again.";
        setQuestionsError(errMsg);
      } finally {
        setLoadingQuestions(false);
      }
    };

    generateQuestions();
  }, [grant]);

  const handleSaveSession = async () => {
    if (Object.keys(sessionFeedbacks).length === 0) return;

    try {
      setSavingSession(true);

      // Calculate average score
      const scores = Object.values(sessionFeedbacks).map((f) => f.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      await saveInterviewSession({
        grantId,
        questionsJson: JSON.stringify(questions),
        answersJson: JSON.stringify(sessionAnswers),
        feedbackJson: JSON.stringify(sessionFeedbacks),
        avgScore: parseFloat(avgScore.toFixed(2)),
      });

      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["interview-sessions"] });

      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab("sessions");
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSession(false);
    }
  };

  return {
    questions,
    loadingQuestions,
    questionsError,
    sessionAnswers,
    setSessionAnswers,
    sessionFeedbacks,
    setSessionFeedbacks,
    savingSession,
    saveSuccess,
    handleSaveSession,
  };
}
