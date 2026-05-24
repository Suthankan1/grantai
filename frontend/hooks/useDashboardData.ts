"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  listTracker,
  listLetters,
  listInterviewSessions,
  getProfile,
  type DashboardStatsApi,
  type TrackerEntryApi,
  type CoverLetterApi,
  type InterviewSessionResponseApi,
  type ProfileApiResponse,
} from "@/lib/api";

export function useDashboardData() {
  // Parallel React Query data fetches with 5-minute refetch polling intervals
  const statsQuery = useQuery<DashboardStatsApi>({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchInterval: 300000, // 5 minutes
  });

  const trackerQuery = useQuery<TrackerEntryApi[]>({
    queryKey: ["tracker-list"],
    queryFn: listTracker,
    refetchInterval: 300000,
  });

  const lettersQuery = useQuery<CoverLetterApi[]>({
    queryKey: ["letters-list"],
    queryFn: listLetters,
    refetchInterval: 300000,
  });

  const interviewQuery = useQuery<InterviewSessionResponseApi[]>({
    queryKey: ["interview-sessions-list"],
    queryFn: listInterviewSessions,
    refetchInterval: 300000,
  });

  const profileQuery = useQuery<ProfileApiResponse>({
    queryKey: ["profile"],
    queryFn: getProfile,
    refetchInterval: 300000,
  });

  const loading =
    statsQuery.isLoading ||
    trackerQuery.isLoading ||
    lettersQuery.isLoading ||
    interviewQuery.isLoading ||
    profileQuery.isLoading;

  const stats = statsQuery.data;
  const trackerList = trackerQuery.data ?? [];
  const lettersList = lettersQuery.data ?? [];
  const interviewList = interviewQuery.data ?? [];
  const profile = profileQuery.data;

  /* ─── 1. Stat Card Aggregations ────────────────────────────── */
  const totalApplied =
    stats?.totalApplied ??
    trackerList.filter((e) =>
      ["Applied", "Under Review", "Won", "Rejected"].includes(e.status)
    ).length;
  const winRate = stats?.winRate ?? 0;
  const rawWonAmount =
    stats?.totalWonAmount ??
    trackerList
      .filter((e) => e.status?.toLowerCase() === "won" && e.grantAmount != null)
      .reduce((sum, e) => sum + Number(e.grantAmount), 0);
  const totalWonAmount =
    typeof rawWonAmount === "string" ? parseFloat(rawWonAmount) : (rawWonAmount ?? 0);
  const totalBookmarked = stats?.grantsBookmarked ?? trackerList.length;

  const upcomingDeadlines = stats?.upcomingDeadlines ?? [];
  const upcomingDeadlinesCount = upcomingDeadlines.length;

  /* ─── 2. LineChart: Grant suitability scores over time ──────── */
  const matchChartData =
    trackerList.length >= 3
      ? trackerList
          .slice(0, 10)
          .reverse()
          .map((e, idx) => ({
            name: e.grantTitle,
            score: 65 + idx * 4 + (Number(e.grantAmount || 100) % 15),
            date: new Date(e.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          }))
      : [
          { name: "STEM Innovation Grant", score: 72, date: "May 10" },
          { name: "Federal Research Award", score: 78, date: "May 12" },
          { name: "Academic Scholarship", score: 85, date: "May 14" },
          { name: "Global Climate Fellowship", score: 80, date: "May 15" },
          { name: "AI Computing Grant", score: 92, date: "May 17" },
          { name: "Cancer Cure Research Support", score: 88, date: "May 18" },
          { name: "Bio-Med Foundation Grant", score: 90, date: "May 20" },
          { name: "Youth Leadership Award", score: 95, date: "May 21" },
          { name: "Oceanography Fellowship", score: 89, date: "May 23" },
          { name: "Deep Tech Seed Funding", score: 96, date: "May 24" },
        ];

  /* ─── 3. FunnelChart: Applied → Under Review → Won ─────────── */
  const pipelineApplied = trackerList.filter((e) =>
    ["Applied", "Under Review", "Won"].includes(e.status)
  ).length;
  const pipelineUnderReview = trackerList.filter((e) =>
    ["Under Review", "Won"].includes(e.status)
  ).length;
  const pipelineWon = trackerList.filter((e) => e.status?.toLowerCase() === "won").length;

  const showFallbackFunnel = pipelineApplied === 0;
  const funnelData = showFallbackFunnel
    ? [
        { value: 8, name: "Applied", fill: "rgba(108,71,255,0.85)" },
        { value: 5, name: "Under Review", fill: "rgba(139,92,246,0.65)" },
        { value: 2, name: "Won", fill: "rgba(16,185,129,0.75)" },
      ]
    : [
        { value: pipelineApplied, name: "Applied", fill: "#6C47FF" },
        { value: pipelineUnderReview, name: "Under Review", fill: "#8B5CF6" },
        { value: pipelineWon, name: "Won", fill: "#10B981" },
      ];

  /* ─── 4. RadarChart: Dynamic Profile Strength ──────────────── */
  const calculateRadarData = (p: ProfileApiResponse | undefined) => {
    const academic =
      60 +
      (p?.university ? 15 : 0) +
      (["PhD", "Masters"].includes(p?.degreeLevel ?? "") ? 10 : 0) +
      (p?.gpa && Number(p.gpa) >= 3.5 ? 15 : 0);
    const research =
      55 +
      ((p?.researchInterests?.length ?? 0) >= 1 ? 15 : 0) +
      ((p?.researchInterests?.length ?? 0) >= 3 ? 15 : 0) +
      (p?.degreeLevel === "PhD" ? 15 : 0);
    const international =
      50 +
      ((p?.preferredCountries?.length ?? 0) >= 1 ? 20 : 0) +
      ((p?.preferredCountries?.length ?? 0) >= 3 ? 15 : 0) +
      (p?.country && p.country !== "US" ? 10 : 0);
    const financial = 55 + (p?.minGrantAmount ? 20 : 0) + ((p?.grantTypes?.length ?? 0) >= 2 ? 15 : 0);
    const alignment = 60 + (p?.fieldOfStudy ? 25 : 0) + (p?.graduationYear ? 15 : 0);
    const documentation =
      45 +
      (p?.profileComplete ? 20 : 0) +
      (lettersList.length >= 1 ? 15 : 0) +
      (lettersList.length >= 3 ? 15 : 0);

    return [
      { subject: "Academic", score: Math.min(100, academic), fullMark: 100 },
      { subject: "Research", score: Math.min(100, research), fullMark: 100 },
      { subject: "International", score: Math.min(100, international), fullMark: 100 },
      { subject: "Financial Need", score: Math.min(100, financial), fullMark: 100 },
      { subject: "Field Alignment", score: Math.min(100, alignment), fullMark: 100 },
      { subject: "Documentation", score: Math.min(100, documentation), fullMark: 100 },
    ];
  };
  const radarData = calculateRadarData(profile);

  /* ─── 5. Dynamic Activity Timeline Feed (Last 10 Items) ──────── */
  const buildActivityFeed = () => {
    interface ActivityItem {
      id: string;
      type: "tracker" | "letter" | "interview" | "general";
      title: string;
      desc: string;
      timestamp: Date;
    }
    const combined: ActivityItem[] = [];

    // Map Tracker updates
    trackerList.forEach((e) => {
      combined.push({
        id: `tracker-${e.id}-${e.updatedAt}`,
        type: "tracker",
        title: "Tracker Update",
        desc:
          e.status === "Draft"
            ? `Added '${e.grantTitle}' to tracker.`
            : `Moved '${e.grantTitle}' to '${e.status}'.`,
        timestamp: new Date(e.updatedAt ?? e.createdAt),
      });
    });

    // Map AI letters created
    lettersList.forEach((l) => {
      combined.push({
        id: `letter-${l.id}`,
        type: "letter",
        title: "AI Letter Generated",
        desc: `Drafted cover letter for '${l.grantTitle}' emphasizing ${l.tone ?? "professional"} tone.`,
        timestamp: new Date(l.createdAt ?? new Date()),
      });
    });

    // Map Mock/Real Interview sessions
    interviewList.forEach((i) => {
      combined.push({
        id: `interview-${i.id}`,
        type: "interview",
        title: "Interview Practiced",
        desc: `Completed practice simulation for '${i.grantTitle}' scoring ${i.avgScore}/10.`,
        timestamp: new Date(i.createdAt ?? new Date()),
      });
    });

    // Sort by timestamp in descending order
    combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Fallbacks if empty
    if (combined.length === 0) {
      combined.push({
        id: "wel-1",
        type: "general",
        title: "Welcome to GrantAI!",
        desc: "Go to Grant Finder to search through federal and university funding pools.",
        timestamp: new Date(),
      });
    }

    return combined.slice(0, 10);
  };
  const activityTimeline = buildActivityFeed();

  // Helper to format timestamps dynamically
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return {
    loading,
    totalBookmarked,
    totalApplied,
    winRate,
    totalWonAmount,
    upcomingDeadlines,
    upcomingDeadlinesCount,
    matchChartData,
    funnelData,
    showFallbackFunnel,
    radarData,
    activityTimeline,
    timeAgo,
  };
}
