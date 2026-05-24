export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.error || data?.message || "Request failed.";
    throw new Error(message);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return parseResponse<T>(response);
}

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

export interface CoverLetterGeneratePayload {
  grantId: string;
  tone?: string;
  length?: string;
  emphasis?: string[];
  regenerationStyle?: string;
  customPrompt?: string;
}

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