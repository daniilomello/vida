import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as transactionsService from "@/app/transactions/services";
import type { Transaction } from "@/app/transactions/types";
import { useCreateTransaction } from "./index";

vi.mock("@/app/transactions/services", () => ({
  createTransaction: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockTransaction: Transaction = {
  id: "tx-1",
  type: "EXPENSE",
  amount: 42.5,
  category: "FOOD",
  paidVia: "CASH",
  status: "PAID",
  month: "2026-05",
  date: "2026-05-05",
  deleted: false,
  createdAt: "2026-05-05T10:00:00Z",
  updatedAt: "2026-05-05T10:00:00Z",
};

describe("useCreateTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialise with loading false", () => {
    const { result } = renderHook(() => useCreateTransaction());
    expect(result.current.loading).toBe(false);
  });

  it("should return true and show success toast on successful submit", async () => {
    vi.mocked(transactionsService.createTransaction).mockResolvedValue(mockTransaction);
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useCreateTransaction());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({
        amount: 42.5,
        category: "FOOD",
        paidVia: "CASH",
      });
    });

    expect(ok).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Expense added");
  });

  it("should return false and show error toast on failed submit", async () => {
    vi.mocked(transactionsService.createTransaction).mockRejectedValue(new Error("Network error"));
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useCreateTransaction());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({
        amount: 10,
        category: "TRANSPORT",
        paidVia: "DEBIT",
      });
    });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Network error");
  });

  it("should show fallback error message when error is not an Error instance", async () => {
    vi.mocked(transactionsService.createTransaction).mockRejectedValue("unknown");
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useCreateTransaction());

    await act(async () => {
      await result.current.submit({
        amount: 5,
        category: "OTHER",
        paidVia: "CASH",
      });
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to add expense");
  });

  it("should reset loading to false after submit regardless of outcome", async () => {
    vi.mocked(transactionsService.createTransaction).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useCreateTransaction());

    await act(async () => {
      await result.current.submit({
        amount: 1,
        category: "HEALTH",
        paidVia: "CASH",
      });
    });

    expect(result.current.loading).toBe(false);
  });

  it("should pass all fields to createTransaction service", async () => {
    vi.mocked(transactionsService.createTransaction).mockResolvedValue(mockTransaction);

    const { result } = renderHook(() => useCreateTransaction());

    await act(async () => {
      await result.current.submit({
        amount: 99.99,
        category: "ENTERTAINMENT",
        paidVia: "card-abc",
        description: "Cinema night",
        date: "2026-05-01",
      });
    });

    expect(transactionsService.createTransaction).toHaveBeenCalledWith({
      amount: 99.99,
      category: "ENTERTAINMENT",
      paidVia: "card-abc",
      description: "Cinema night",
      date: "2026-05-01",
    });
  });
});
