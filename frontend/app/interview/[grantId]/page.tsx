"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  CalendarDays,
  FileText,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getGrantById,
  getInterviewQuestions,
  getInterviewFeedback,
  listInterviewSessions,
  saveInterviewSession,
  InterviewQuestionApi,
  InterviewSessionResponseApi
} from "@/lib/api";

function formatAmount(amount: number | string | null, currency: string | null) {
  if (amount === null || amount === undefined || amount === "") {
    return "Funding available";
  }

  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) {
    return `${currency ?? "USD"} funding`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function getCategoryStyle(category: string) {
  switch (category) {
    case "Research Background":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Motivation":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Technical":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "Impact":
      return "bg-pink-500/10 text-pink-400 border-pink-500/20";
    case "Future Plans":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

function getScoreBadgeStyle(score: number) {
  if (score >= 8) {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  } else if (score >= 5) {
    return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  } else {
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
  }
}

export default function InterviewPrepPage() {
  const params = useParams<{ grantId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const grantId = params?.grantId;

  // Tabs state
  const [activeTab, setActiveTab] = React.useState<"questions" | "sessions">("questions");

  // Questions state
  const [questions, setQuestions] = React.useState<InterviewQuestionApi[]>([]);
  const [loadingQuestions, setLoadingQuestions] = React.useState(true);
  const [questionsError, setQuestionsError] = React.useState<string | null>(null);
  const [expandedAccordionIndex, setExpandedAccordionIndex] = React.useState<number | null>(null);

  // Active practice modal state
  const [practiceQuestion, setPracticeQuestion] = React.useState<{ question: InterviewQuestionApi; index: number } | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [recordingState, setRecordingState] = React.useState<"idle" | "recording" | "done">("idle");
  const [feedback, setFeedback] = React.useState<{
    score: number;
    strengths: string[];
    areas_to_improve: string[];
    suggested_improvements: string[];
    suggested_answer: string;
  } | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = React.useState(false);

  // Current session results
  const [sessionAnswers, setSessionAnswers] = React.useState<{ [key: number]: string }>({});
  const [sessionFeedbacks, setSessionFeedbacks] = React.useState<{
    [key: number]: {
      score: number;
      strengths: string[];
      areas_to_improve: string[];
      suggested_improvements: string[];
      suggested_answer: string;
    };
  }>({});
  const [savingSession, setSavingSession] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Past sessions viewer state
  const [selectedPastSession, setSelectedPastSession] = React.useState<InterviewSessionResponseApi | null>(null);

  // Fetch Grant details
  const grantQuery = useQuery({
    queryKey: ["grant", grantId],
    queryFn: () => getGrantById(grantId),
    enabled: !!grantId,
  });

  const grant = grantQuery.data;

  // Fetch Past Sessions
  const sessionsQuery = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: () => listInterviewSessions(),
  });

  // On Load: Call FastAPI questions generator
  React.useEffect(() => {
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
      } catch (err: any) {
        setQuestionsError(err.message || "Failed to generate interview questions. Please try again.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    generateQuestions();
  }, [grant]);

  // Handle simulate speech-to-text dictation
  React.useEffect(() => {
    if (recordingState !== "recording") return;

    const timer = setTimeout(() => {
      setRecordingState("done");
      // Pre-filled simulated text based on the category of the question
      const sampleTranscripts: { [key: string]: string } = {
        "Research Background": "Our research focuses on novel methods to enhance neural net execution efficiency. We plan to utilize advanced compilers and customized sparse kernels to accelerate Transformer runtimes by up to three times on edge hardware, lowering barriers to deployment.",
        "Motivation": "We are driven to solve real-world efficiency challenges in computing. This grant would enable us to scale our efforts, transition our research prototypes into fully audited open-source tools, and directly build community capacity.",
        "Technical": "We plan to implement a secure rust-based compiler layer. By utilizing WebAssembly to isolate untrusted compilation artifacts and strict unit testing, we ensure that execution and security are balanced beautifully.",
        "Impact": "By making our tools fully open source and highly compatible with legacy platforms, we enable academic labs with limited hardware budgets to run cutting-edge inference, fostering democratic AI research worldwide.",
        "Future Plans": "Over the next three years, we aim to expand our framework to support mobile deployment. We are forming partnerships with major universities to run training workshops and establish long-term maintenance of the repository."
      };
      
      const category = practiceQuestion?.question.category || "Motivation";
      setUserAnswer(sampleTranscripts[category] || sampleTranscripts["Motivation"]);
    }, 4500);

    return () => clearTimeout(timer);
  }, [recordingState, practiceQuestion]);

  const openPracticeModal = (q: InterviewQuestionApi, idx: number) => {
    setPracticeQuestion({ question: q, index: idx });
    // If we have answered it already in this session, restore answer and feedback
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
      // Save in current session state
      setSessionAnswers((prev) => ({ ...prev, [practiceQuestion.index]: userAnswer }));
      setSessionFeedbacks((prev) => ({ ...prev, [practiceQuestion.index]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSaveSession = async () => {
    if (Object.keys(sessionFeedbacks).length === 0) return;

    try {
      setSavingSession(true);
      
      // Calculate average score
      const scores = Object.values(sessionFeedbacks).map((f) => f.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      await saveInterviewSession({
        grantId: grantId!,
        questionsJson: JSON.stringify(questions),
        answersJson: JSON.stringify(sessionAnswers),
        feedbackJson: JSON.stringify(sessionFeedbacks),
        avgScore: parseFloat(avgScore.toFixed(2))
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
    show: { y: 0, opacity: 1, transition: { type: "spring" as any, stiffness: 100 } },
  };

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.15),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.1),_transparent_24%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl pb-10 pt-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={`/grants/${grantId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Grant Detail
          </Link>
        </Button>

        {/* Top Grant Context Card */}
        {grantQuery.isLoading ? (
          <div className="h-40 shimmer rounded-[2rem] mb-8" />
        ) : grant ? (
          <Card variant="glass-strong" padding="none" className="overflow-hidden mb-8 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{grant.grantType}</Badge>
                    <Badge variant="accent">{grant.field}</Badge>
                    <Badge variant="outline">{grant.countryName}</Badge>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white">{grant.title}</h1>
                  <p className="text-sm text-[var(--color-muted)]">{grant.provider}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1.5 bg-primary/10 border border-primary/20 px-4 py-3 rounded-2xl">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-subtle)]">Grant Details</span>
                  <span className="text-lg font-bold text-[#00D4AA]">{formatAmount(grant.amount, grant.currency)}</span>
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Deadline: {grant.deadline}
                  </span>
                </div>
              </div>
              <div className="mt-6 border-t border-[var(--border-default)] pt-4">
                <h4 className="text-xs uppercase tracking-widest text-[var(--color-subtle)] mb-1">What they look for / focus:</h4>
                <p className="text-sm text-[var(--color-text)]/85 line-clamp-2">{grant.description}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 text-center mb-8">
            <CardTitle>Grant Not Found</CardTitle>
          </Card>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-[var(--border-default)] gap-6 mb-8">
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-4 text-base font-semibold border-b-2 transition ${
              activeTab === "questions"
                ? "border-primary text-white"
                : "border-transparent text-[var(--color-muted)] hover:text-white"
            }`}
          >
            Practice Questions
          </button>
          <button
            onClick={() => {
              setActiveTab("sessions");
              sessionsQuery.refetch();
            }}
            className={`pb-4 text-base font-semibold border-b-2 transition ${
              activeTab === "sessions"
                ? "border-primary text-white"
                : "border-transparent text-[var(--color-muted)] hover:text-white"
            }`}
          >
            My Sessions
          </button>
        </div>

        {/* QUESTIONS TAB CONTENT */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            {/* Session Save Bar */}
            {Object.keys(sessionFeedbacks).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl"
              >
                <div className="text-sm text-[var(--color-text)]/90 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>
                    You have answered <strong>{Object.keys(sessionFeedbacks).length}</strong> / {questions.length} questions.
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveSession}
                    disabled={savingSession || saveSuccess}
                    variant={saveSuccess ? "accent" : "glow"}
                    size="sm"
                  >
                    {savingSession ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Practice Session"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Questions Loader Skeleton */}
            {loadingQuestions && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 shimmer rounded-2xl w-full" />
                ))}
              </div>
            )}

            {/* Questions Generation Error */}
            {questionsError && (
              <Card className="p-8 border-rose-500/30 bg-rose-500/5 text-center">
                <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
                <p className="text-sm text-[var(--color-text)]">{questionsError}</p>
                <Button className="mt-4" onClick={() => router.refresh()}>
                  Retry Generation
                </Button>
              </Card>
            )}

            {/* Expandable Accordion Questions List */}
            {!loadingQuestions && !questionsError && (
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isExpanded = expandedAccordionIndex === idx;
                  const answeredFeedback = sessionFeedbacks[idx];

                  return (
                    <div
                      key={idx}
                      className="border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedAccordionIndex(isExpanded ? null : idx)}
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
                                <Button onClick={() => openPracticeModal(q, idx)} variant="glow" size="sm">
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
            )}
          </div>
        )}

        {/* SESSIONS TAB CONTENT */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            {sessionsQuery.isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 shimmer rounded-2xl w-full" />
                ))}
              </div>
            ) : sessionsQuery.data && sessionsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {sessionsQuery.data.map((session, sIdx) => {
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
                          <Button size="sm" variant="outline" onClick={() => setSelectedPastSession(session)}>
                            Review feedback
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-10 text-center border-[var(--border-default)]">
                <FileText className="h-12 w-12 text-[var(--color-muted)] mx-auto mb-3" />
                <CardTitle className="text-lg">No sessions saved yet</CardTitle>
                <p className="text-sm text-[var(--color-muted)] mt-1 max-w-sm mx-auto">
                  Practice questions on the left tab and save your session to build an interview audit trail.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* PRACTICE MODAL */}
        <AnimatePresence>
          {practiceQuestion && (
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
                  <button onClick={closePracticeModal} className="text-gray-400 hover:text-white text-sm">
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
                        {[...Array(12)].map((_, i) => (
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
                      <Button variant="glow" onClick={() => setRecordingState("done")} className="bg-rose-500 hover:bg-rose-600 border-none px-4 py-1.5 h-8 text-xs font-semibold">
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
                    <div className="flex gap-2">
                      <Button
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
                    </div>

                    <Button
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
                              feedback.score
                            )}`}
                          >
                            <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                            {feedback.score} / 10
                          </div>
                        </motion.div>

                        {/* Strengths Section */}
                        <motion.div variants={feedbackItemVariants} className="space-y-2">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Strengths
                          </h4>
                          <ul className="space-y-1.5 pl-6 list-disc text-sm text-[var(--color-text)]/90">
                            {feedback.strengths.map((str, i) => (
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
                            {feedback.areas_to_improve.map((area, i) => (
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
          )}
        </AnimatePresence>

        {/* PAST SESSION FEEDBACK REVIEW DIALOG */}
        <AnimatePresence>
          {selectedPastSession && (
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
                  <button onClick={() => setSelectedPastSession(null)} className="text-gray-400 hover:text-white text-sm">
                    Close
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                  {(() => {
                    let pastQuestions: InterviewQuestionApi[] = [];
                    let pastAnswers: { [key: number]: string } = {};
                    let pastFeedbacks: { [key: number]: any } = {};

                    try {
                      pastQuestions = JSON.parse(selectedPastSession.questionsJson || "[]");
                      pastAnswers = JSON.parse(selectedPastSession.answersJson || "{}");
                      pastFeedbacks = JSON.parse(selectedPastSession.feedbackJson || "{}");
                    } catch (e) {
                      console.error(e);
                    }

                    return (
                      <div className="space-y-6">
                        {pastQuestions.map((q, idx) => {
                          const answer = pastAnswers[idx];
                          const fb = pastFeedbacks[idx];

                          if (!answer && !fb) return null; // Skip unattempted questions in past session

                          return (
                            <div key={idx} className="border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] p-5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3 flex-wrap">
                                <div className="space-y-1">
                                  <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyle(q.category)}`}>
                                    {q.category}
                                  </span>
                                  <h4 className="text-base font-bold text-white mt-1">
                                    {idx + 1}. {q.question}
                                  </h4>
                                </div>
                                {fb && (
                                  <span className={`text-sm font-bold font-display px-3 py-1 rounded-xl border ${getScoreBadgeStyle(fb.score)}`}>
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
                                      {fb.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                  </div>

                                  <div className="p-4 border border-amber-500/10 bg-amber-500/5 rounded-xl space-y-2">
                                    <h5 className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1">
                                      <AlertTriangle className="h-3.5 w-3.5" /> Improvements
                                    </h5>
                                    <ul className="text-xs text-[var(--color-text)]/80 pl-4 list-disc space-y-1">
                                      {fb.areas_to_improve?.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
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
                    );
                  })()}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
