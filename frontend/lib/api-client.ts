// ── Core HTTP Client ──────────────────────────────────────────────────────────
// Base URL, fetch wrapper, and the apiRequest function used by all API modules.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type RequestOptions = RequestInit & {
  auth?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

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
  // If demo mode is active, completely bypass network requests
  if (
    typeof window !== "undefined" &&
    window.localStorage.getItem("grantai-demo-mode") === "true"
  ) {
    // Lazy-load the demo handler to keep this bundle lightweight
    const { handleDemoRequest } = await import("./demo-data");
    // Artificial latency to make demo feel realistic
    await new Promise((resolve) => setTimeout(resolve, 200));
    return handleDemoRequest<T>(path, options);
  }

  const response = await authFetch(path, options);

  return parseResponse<T>(response);
}

function buildFetchInit(options: RequestOptions = {}): RequestInit {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  } else if (headers.get("Content-Type") === "none") {
    headers.delete("Content-Type");
  }

  return {
    credentials: "include",
    ...options,
    headers,
  };
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function authFetch(pathOrUrl: string, options: RequestOptions = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE_URL}${pathOrUrl}`;
  const response = await fetch(url, buildFetchInit(options));
  const shouldRefresh =
    (response.status === 401 || response.status === 403) &&
    !url.includes("/api/auth/refresh") &&
    options.auth !== false;

  if (!shouldRefresh) {
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    return response;
  }

  return fetch(url, buildFetchInit(options));
}
