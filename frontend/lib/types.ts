export interface ApiUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  profileComplete: boolean;
}

export interface AuthApiResponse {
  user: ApiUser;
  token: string;
  refreshToken: string;
  message: string;
}

export interface ProfileApiResponse {
  userId: string;
  email: string;
  fullName: string | null;
  country: string | null;
  profilePhotoUrl: string | null;
  university: string | null;
  degreeLevel: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  gpa: string | number | null;
  researchInterests: string[];
  grantTypes: string[];
  preferredCountries: string[];
  minGrantAmount: number | null;
  deadlinePreference: string | null;
  profileComplete: boolean;
}

export interface GrantSummaryApi {
  id: string;
  title: string;
  provider: string;
  grantType: string;
  field: string;
  countryName: string;
  countryCode: string | null;
  amount: number | string | null;
  currency: string | null;
  deadline: string;
  description: string;
  matchScore: number;
  matchReasoning: string;
  sourceUrl: string | null;
}

export interface GrantDetailApi extends GrantSummaryApi {
  eligibility: string | null;
  documentsRequired: string[];
  timeline: string | null;
  applicationUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GrantCompareRequestApi {
  profile: Record<string, unknown>;
  grantIds: string[];
}

export interface GrantCompareResponseApi {
  recommendation: string;
}

export interface GrantSearchResponseApi {
  items: GrantSummaryApi[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface GrantSearchParams {
  q?: string;
  field?: string;
  country?: string;
  type?: string;
  minAmount?: number;
  maxDeadline?: string;
  page?: number;
  size?: number;
}

export interface CoverLetterApi {
  id: string;
  grantId: string;
  grantTitle: string;
  grantProvider: string;
  grantAmount: number | string | null;
  grantCurrency: string | null;
  grantDeadline: string | null;
  grantDescription: string | null;
  tone: string | null;
  length: string | null;
  emphasis: string[];
  regenerationStyle: string | null;
  customPrompt: string | null;
  content: string | null;
  status: string;
  addToTracker: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}



export interface TrackerEntryApi {
  id: string;
  grantId: string;
  grantTitle: string;
  grantProvider: string;
  grantAmount: number | string | null;
  grantCurrency: string | null;
  grantDeadline: string;
  status: string; // "Draft", "Applied", "Under Review", "Won", "Rejected"
  appliedDate: string | null;
  notes: string;
  coverLetterStatus: string;
  coverLetterId: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarked: boolean;
}

export interface TrackerCreatePayload {
  grantId: string;
  status?: string;
  notes?: string;
  appliedDate?: string;
}

export interface TrackerUpdatePayload {
  status?: string;
  notes?: string;
  appliedDate?: string;
}

export interface DashboardStatsApi {
  totalApplied: number;
  winRate: number;
  avgMatchScore: number;
  grantsBookmarked: number;
  totalWonAmount: number | string | null;
  totalAppliedAmount: number | string | null;
  upcomingDeadlines: {
    trackerId: string;
    grantId: string;
    grantTitle: string;
    provider: string;
    deadline: string;
    daysLeft: number;
  }[];
  recentActivities: {
    id: string;
    description: string;
    timeAgo: string;
  }[];
}

export interface InterviewQuestionApi {
  question: string;
  context: string;
  category: string;
}

export interface InterviewQuestionsResponseApi {
  questions: InterviewQuestionApi[];
}

export interface InterviewFeedbackResponseApi {
  score: number;
  strengths: string[];
  areas_to_improve: string[];
  suggested_improvements: string[];
  suggested_answer: string;
}

export interface InterviewSessionResponseApi {
  id: string;
  grantId: string;
  grantTitle: string;
  grantProvider: string;
  questionsJson: string;
  answersJson: string;
  feedbackJson: string;
  avgScore: number;
  createdAt: string;
}

export interface CoverLetterGeneratePayload {
  grantId: string;
  tone?: string;
  length?: string;
  emphasis?: string[];
  customPrompt?: string;
  regenerationStyle?: string;
}

