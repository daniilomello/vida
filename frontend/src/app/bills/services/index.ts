import type { Bill, CreateBillInput, UpdateBillInput } from "@/app/bills/types";

const API = import.meta.env.VITE_API_BASE_URL ?? "";
const BASE = `${API}/api/v1/bills`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchBills(active: "true" | "false" | "all" = "true"): Promise<Bill[]> {
  const res = await fetch(`${BASE}?active=${active}`, { credentials: "include" });
  return handleResponse<Bill[]>(res);
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Bill>(res);
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<Bill> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Bill>(res);
}

export async function deleteBill(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  }
}

export async function reactivateBill(id: string): Promise<Bill> {
  const res = await fetch(`${BASE}/${id}/reactivate`, { method: "PUT", credentials: "include" });
  return handleResponse<Bill>(res);
}
