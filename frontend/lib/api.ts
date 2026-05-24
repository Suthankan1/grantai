const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

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