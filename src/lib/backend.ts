import { supabase } from "@/integrations/supabase/client";

type BackendRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

const baseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/+$/, "");

async function getAuthHeader(auth = true) {
  if (!auth) return null;
  const { data } = await supabase.auth.getSession();
  let token = data.session?.access_token;
  if (!token) {
    const refreshed = await supabase.auth.refreshSession();
    token = refreshed.data.session?.access_token;
  }
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function backendRequest<T>(path: string, options: BackendRequestOptions = {}) {
  const headers = new Headers(options.headers);
  const authHeader = await getAuthHeader(options.auth !== false);
  if (authHeader) {
    for (const [key, value] of Object.entries(authHeader)) headers.set(key, value);
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 12000);
  const response = await fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal ?? controller.signal,
  }).finally(() => {
    globalThis.clearTimeout(timeout);
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data ? String((data as { error?: unknown }).error) : response.statusText;
    throw new Error(message || "Request failed");
  }

  return data;
}
