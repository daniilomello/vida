import { handleApiResponse } from "@/app/core/api";
import type { MonthlySummary } from "@/app/summary/types";

const API = import.meta.env.VITE_API_BASE_URL ?? "";
const BASE = `${API}/api/v1/summary`;

export async function fetchSummary(month?: string): Promise<MonthlySummary> {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE}${query}`, { credentials: "include" });
  return handleApiResponse<MonthlySummary>(res);
}
