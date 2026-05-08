import { handleApiResponse } from "@/app/core/api";
import type { CreateTransactionInput, Transaction } from "@/app/transactions/types";

const API = import.meta.env.VITE_API_BASE_URL ?? "";
const BASE = `${API}/api/v1/transactions`;

export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleApiResponse<Transaction>(res);
}

export async function fetchTransactions(month?: string, paidVia?: string): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  if (paidVia) params.set("paidVia", paidVia);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE}${query}`, { credentials: "include" });
  return handleApiResponse<Transaction[]>(res);
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleApiResponse<void>(res);
}

export async function markBillPaid(id: string): Promise<Transaction> {
  const res = await fetch(`${BASE}/${id}/pay`, {
    method: "PUT",
    credentials: "include",
  });
  return handleApiResponse<Transaction>(res);
}
