"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Check if browser SpeechRecognition is supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Clean up recognition on unmount or when changing question
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [practiceQuestion]);

  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    // If there is an active recognition, stop it first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // Keep track of previously finalized text to support continuous dictation
      let baseText = userAnswer.trim();

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Beautifully append new words in real-time
        let updatedText = baseText;
        if (finalTranscript) {
          if (updatedText) {
            updatedText += " " + finalTranscript.trim();
          } else {
            updatedText = finalTranscript.trim();
          }
          baseText = updatedText; // Update our base text
        }

        const currentDisplay = interimTranscript
          ? (updatedText ? `${updatedText} ${interimTranscript.trim()}` : interimTranscript.trim())
          : updatedText;

        setUserAnswer(currentDisplay);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setRecordingState("done");
        }
      };

      recognition.onend = () => {
        setRecordingState("done");
      };

      recognitionRef.current = recognition;
      recognition.start();
      setRecordingState("recording");
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setRecordingState("done");
  };

  const openPracticeModal = (q: InterviewQuestionApi, idx: number) => {
    setPracticeQuestion({ question: q, index: idx });
    setUserAnswer(sessionAnswers[idx] || "");
    setFeedback(sessionFeedbacks[idx] || null);
    setRecordingState("idle"); // Default to idle
  };

  const closePracticeModal = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
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
    isSpeechSupported,
    startSpeechRecognition,
    stopSpeechRecognition,
  };
}
