// ── Core HTTP Client ──────────────────────────────────────────────────────────
// Base URL, fetch wrapper, and the apiRequest function used by all API modules.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

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
