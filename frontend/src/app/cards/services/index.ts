import type { Card } from "@/app/cards/types";

const API = import.meta.env.VITE_API_BASE_URL ?? "";
const BASE = `${API}/api/v1/cards`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchCards(active: "true" | "false" = "true"): Promise<Card[]> {
  const res = await fetch(`${BASE}?active=${active}`, { credentials: "include" });
  return handleResponse<Card[]>(res);
}

export async function createCard(nickname: string): Promise<Card> {
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return handleResponse<Card>(res);
}

export async function updateCard(id: string, nickname: string): Promise<Card> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return handleResponse<Card>(res);
}

export async function deleteCard(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  }
}

export async function reactivateCard(id: string): Promise<Card> {
  const res = await fetch(`${BASE}/${id}/reactivate`, { method: "PUT", credentials: "include" });
  return handleResponse<Card>(res);
}
