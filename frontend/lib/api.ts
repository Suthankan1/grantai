import { apiRequest, authFetch } from "./api-client";
import type {
  AuthApiResponse,
  ProfileApiResponse,
  GrantSearchParams,
  GrantSearchResponseApi,
  GrantDetailApi,
  CoverLetterApi,
  TrackerEntryApi,
  TrackerCreatePayload,
  TrackerUpdatePayload,
  DashboardStatsApi,
  InterviewQuestionsResponseApi,
  InterviewFeedbackResponseApi,
  InterviewSessionResponseApi,
  CoverLetterGeneratePayload,
} from "./types";

// Re-export all sub-modules for backwards compatibility
export * from "./types";
export * from "./api-client";
export { seedDemoData } from "./demo-data";

// ── Authentication ───────────────────────────────────────────────────────────

export async function authRegister(payload: {
  fullName: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthApiResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function authLogin(payload: { email: string; password: string }) {
  return apiRequest<AuthApiResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function authLogout() {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function authRefresh() {
  return apiRequest<AuthApiResponse>("/api/auth/refresh", {
    method: "POST",
  });
}

export async function authGoogleLogin(idToken: string) {
  return apiRequest<AuthApiResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile() {
  return apiRequest<ProfileApiResponse>("/api/profile", {
    method: "GET",
  });
}

export async function saveProfile(payload: Record<string, unknown>) {
  return apiRequest<ProfileApiResponse>("/api/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ── Grants Search & Details ───────────────────────────────────────────────────

export async function searchGrants(params: GrantSearchParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.field) searchParams.set("field", params.field);
  if (params.country) searchParams.set("country", params.country);
  if (params.type) searchParams.set("type", params.type);
  if (typeof params.minAmount === "number" && Number.isFinite(params.minAmount)) {
    searchParams.set("minAmount", String(params.minAmount));
  }
  if (params.maxDeadline) searchParams.set("maxDeadline", params.maxDeadline);
  if (typeof params.page === "number") searchParams.set("page", String(params.page));
  if (typeof params.size === "number") searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return apiRequest<GrantSearchResponseApi>(`/api/grants/search${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getGrantById(id: string) {
  return apiRequest<GrantDetailApi>(`/api/grants/${id}`, {
    method: "GET",
  });
}

// ── Cover Letters ────────────────────────────────────────────────────────────

export async function getLetterById(id: string) {
  return apiRequest<CoverLetterApi>(`/api/letters/${id}`, {
    method: "GET",
  });
}

export async function listLetters() {
  return apiRequest<CoverLetterApi[]>("/api/letters", {
    method: "GET",
  });
}

export async function updateLetter(id: string, payload: { content?: string; addToTracker?: boolean }) {
  return apiRequest<CoverLetterApi>(`/api/letters/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteLetter(id: string) {
  return apiRequest<void>(`/api/letters/${id}`, { method: "DELETE" });
}

export async function generateLetter(payload: CoverLetterGeneratePayload): Promise<string> {
  const response = await authFetch("/api/letters/generate", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error("Unable to start letter generation.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          continue;
        }

        if (line.startsWith("data:")) {
          const raw = line.slice(5).trim();
          if (!raw) continue;

          if (eventName === "meta") {
            const meta = JSON.parse(raw) as { letterId?: string };
            if (meta.letterId) {
              await reader.cancel();
              return meta.letterId;
            }
          } else if (eventName === "error") {
            const errorData = JSON.parse(raw) as { message?: string };
            throw new Error(errorData.message ?? "Generation failed.");
          }
        }

        if (!line.trim()) {
          eventName = "message";
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  throw new Error("No letter ID returned from meta event.");
}

// ── Application Tracker ───────────────────────────────────────────────────────

export async function listTracker() {
  return apiRequest<TrackerEntryApi[]>("/api/tracker", {
    method: "GET",
  });
}

export async function createTracker(payload: TrackerCreatePayload) {
  return apiRequest<TrackerEntryApi>("/api/tracker", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTracker(id: string, payload: TrackerUpdatePayload) {
  return apiRequest<TrackerEntryApi>(`/api/tracker/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTracker(id: string) {
  return apiRequest<void>(`/api/tracker/${id}`, {
    method: "DELETE",
  });
}

export async function getDashboardStats() {
  return apiRequest<DashboardStatsApi>("/api/tracker/stats", {
    method: "GET",
  });
}

// ── Interview Prep ───────────────────────────────────────────────────────────

export async function getInterviewQuestions(grant: unknown) {
  return apiRequest<InterviewQuestionsResponseApi>("/api/interview/questions", {
    method: "POST",
    body: JSON.stringify({ grant }),
  });
}

export async function getInterviewFeedback(question: string, answer: string, grant: unknown) {
  return apiRequest<InterviewFeedbackResponseApi>("/api/interview/feedback", {
    method: "POST",
    body: JSON.stringify({ question, answer, grant }),
  });
}

export async function listInterviewSessions() {
  return apiRequest<InterviewSessionResponseApi[]>("/api/interview/sessions", {
    method: "GET",
  });
}

export async function saveInterviewSession(payload: {
  grantId: string;
  questionsJson: string;
  answersJson: string;
  feedbackJson: string;
  avgScore: number;
}) {
  return apiRequest<InterviewSessionResponseApi>("/api/interview/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}