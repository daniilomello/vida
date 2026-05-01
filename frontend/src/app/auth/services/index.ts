import type { AuthTokens } from "@/app/auth/types";

const API = import.meta.env.VITE_API_BASE_URL ?? "";

export async function createSession(tokens: AuthTokens): Promise<void> {
  const res = await fetch(`${API}/api/v1/auth/session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? "Failed to create session");
  }
}
