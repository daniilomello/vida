import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as summaryService from "@/app/summary/services";
import type { MonthlySummary } from "@/app/summary/types";
import { useSummary } from "./index";

vi.mock("@/app/summary/services", () => ({
  fetchSummary: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const makeSummary = (overrides: Partial<MonthlySummary> = {}): MonthlySummary => ({
  month: "2026-04",
  totalSpent: 85.8,
  byCategory: [
    { category: "FOOD", total: 45.9 },
    { category: "ENTERTAINMENT", total: 39.9 },
  ],
  byPaymentMethod: [
    { paidVia: "CASH", total: 45.9 },
    { paidVia: "CREDIT_CARD#card-1", total: 39.9, nickname: "Nubank" },
  ],
  ...overrides,
});

describe("useSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialise with loading true and no summary", async () => {
    vi.mocked(summaryService.fetchSummary).mockResolvedValue(makeSummary());

    const { result } = renderHook(() => useSummary("2026-04"));

    expect(result.current.loading).toBe(true);
    expect(result.current.summary).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("should call fetchSummary with the given month", async () => {
    vi.mocked(summaryService.fetchSummary).mockResolvedValue(makeSummary());

    renderHook(() => useSummary("2026-04"));

    await waitFor(() => {
      expect(summaryService.fetchSummary).toHaveBeenCalledWith("2026-04");
    });
  });

  it("should populate summary on successful fetch", async () => {
    const data = makeSummary();
    vi.mocked(summaryService.fetchSummary).mockResolvedValue(data);

    const { result } = renderHook(() => useSummary("2026-04"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual(data);
  });

  it("should refetch when month changes", async () => {
    vi.mocked(summaryService.fetchSummary).mockResolvedValue(makeSummary());

    const { result } = renderHook(() => useSummary("2026-04"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setMonth("2026-03");
    });

    await waitFor(() => {
      expect(summaryService.fetchSummary).toHaveBeenCalledWith("2026-03");
    });
  });

  it("should show error toast on fetch failure", async () => {
    vi.mocked(summaryService.fetchSummary).mockRejectedValue(new Error("Network error"));
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useSummary("2026-04"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Network error");
  });

  it("should show fallback error message when error is not an Error instance", async () => {
    vi.mocked(summaryService.fetchSummary).mockRejectedValue("unknown");
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useSummary("2026-04"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Failed to load summary");
  });

  it("should default to current month when no initialMonth is given", async () => {
    vi.mocked(summaryService.fetchSummary).mockResolvedValue(makeSummary());

    const { result } = renderHook(() => useSummary());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const txCall = vi.mocked(summaryService.fetchSummary).mock.calls[0][0];
    expect(txCall).toMatch(/^\d{4}-\d{2}$/);
  });
});
