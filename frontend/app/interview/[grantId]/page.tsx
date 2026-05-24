"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/layout/MobileHeader";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getGrantById,
  listInterviewSessions,
  type InterviewSessionResponseApi,
} from "@/lib/api";

import { formatAmount } from "@/lib/interview-helpers";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { usePracticeModal } from "@/hooks/usePracticeModal";
import { QuestionAccordion } from "@/components/interview/QuestionAccordion";
import { SessionSaveBar } from "@/components/interview/SessionSaveBar";
import { PracticeModal } from "@/components/interview/PracticeModal";
import { SessionReviewModal } from "@/components/interview/SessionReviewModal";
import { SessionsList } from "@/components/interview/SessionsList";

export default function InterviewPrepPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const params = useParams<{ grantId: string }>();
  const router = useRouter();
  const grantId = params?.grantId;

  // Tabs state
  const [activeTab, setActiveTab] = React.useState<"questions" | "sessions">("questions");

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

  const {
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
  } = useInterviewSession({
    grantId: grantId as string,
    grant,
    setActiveTab,
  });

  const {
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
  } = usePracticeModal({
    grant,
    sessionAnswers,
    sessionFeedbacks,
    setSessionAnswers,
    setSessionFeedbacks,
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Sleek radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />

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
                type="button"
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
                type="button"
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
                <SessionSaveBar
                  answeredCount={Object.keys(sessionFeedbacks).length}
                  totalCount={questions.length}
                  savingSession={savingSession}
                  saveSuccess={saveSuccess}
                  handleSaveSession={handleSaveSession}
                />

                {loadingQuestions && (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-20 shimmer rounded-2xl w-full" />
                    ))}
                  </div>
                )}

                {questionsError && (
                  <Card className="p-8 border-rose-500/30 bg-rose-500/5 text-center">
                    <p className="text-sm text-[var(--color-text)]">{questionsError}</p>
                    <Button className="mt-4" onClick={() => router.refresh()}>
                      Retry Generation
                    </Button>
                  </Card>
                )}

                {!loadingQuestions && !questionsError && (
                  <QuestionAccordion
                    questions={questions}
                    sessionFeedbacks={sessionFeedbacks}
                    openPracticeModal={openPracticeModal}
                  />
                )}
              </div>
            )}

            {/* SESSIONS TAB CONTENT */}
            {activeTab === "sessions" && (
              <SessionsList
                isLoading={sessionsQuery.isLoading}
                sessions={sessionsQuery.data}
                setSelectedPastSession={setSelectedPastSession}
              />
            )}

            {/* PRACTICE MODAL */}
            <AnimatePresence>
              {practiceQuestion && (
                <PracticeModal
                  practiceQuestion={practiceQuestion}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  recordingState={recordingState}
                  setRecordingState={setRecordingState}
                  feedback={feedback}
                  setFeedback={setFeedback}
                  submittingAnswer={submittingAnswer}
                  closePracticeModal={closePracticeModal}
                  handleSubmitAnswer={handleSubmitAnswer}
                />
              )}
            </AnimatePresence>

            {/* PAST SESSION FEEDBACK REVIEW DIALOG */}
            <AnimatePresence>
              {selectedPastSession && (
                <SessionReviewModal
                  selectedPastSession={selectedPastSession}
                  setSelectedPastSession={setSelectedPastSession}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
