import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as transactionsService from "@/app/transactions/services";
import type { Transaction } from "@/app/transactions/types";
import { useTransactions } from "./index";

vi.mock("@/app/transactions/services");
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockTransaction: Transaction = {
  id: "txn-1",
  type: "EXPENSE",
  amount: 1500,
  description: "Lunch",
  category: "FOOD",
  paidVia: "nubank",
  status: "PAID",
  month: "2026-05",
  date: "2026-05-01",
  deleted: false,
  createdAt: "2026-05-01T12:00:00Z",
  updatedAt: "2026-05-01T12:00:00Z",
};

describe("useTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load transactions on mount", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([mockTransaction]);

    const { result } = renderHook(() => useTransactions("2026-05"));

    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].id).toBe("txn-1");
  });

  it("should initialise with the provided month", () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useTransactions("2026-03"));
    expect(result.current.month).toBe("2026-03");
  });

  it("should reload transactions when month changes", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([mockTransaction]);

    const { result } = renderHook(() => useTransactions("2026-05"));
    await act(async () => {});

    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([]);
    await act(async () => {
      result.current.setMonth("2026-04");
    });

    expect(transactionsService.fetchTransactions).toHaveBeenCalledWith("2026-04");
    expect(result.current.transactions).toHaveLength(0);
  });

  it("should remove transaction from state and show success toast on remove", async () => {
    const { toast } = await import("sonner");
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([mockTransaction]);
    vi.mocked(transactionsService.deleteTransaction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTransactions("2026-05"));
    await act(async () => {});

    await act(async () => {
      await result.current.remove("txn-1");
    });

    expect(transactionsService.deleteTransaction).toHaveBeenCalledWith("txn-1");
    expect(result.current.transactions).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith("Transaction deleted");
  });

  it("should show error toast when remove fails", async () => {
    const { toast } = await import("sonner");
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([mockTransaction]);
    vi.mocked(transactionsService.deleteTransaction).mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() => useTransactions("2026-05"));
    await act(async () => {});

    await act(async () => {
      await result.current.remove("txn-1");
    });

    expect(toast.error).toHaveBeenCalledWith("Delete failed");
    expect(result.current.transactions).toHaveLength(1);
  });

  it("should show error toast when load fails", async () => {
    const { toast } = await import("sonner");
    vi.mocked(transactionsService.fetchTransactions).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTransactions("2026-05"));
    await act(async () => {});

    expect(toast.error).toHaveBeenCalledWith("Network error");
    expect(result.current.loading).toBe(false);
  });

  it("should update transaction in state and show success toast on markPaid", async () => {
    const { toast } = await import("sonner");
    const paidTransaction: Transaction = { ...mockTransaction, status: "PAID" };
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([
      { ...mockTransaction, status: "UNPAID" },
    ]);
    vi.mocked(transactionsService.markBillPaid).mockResolvedValue(paidTransaction);

    const { result } = renderHook(() => useTransactions("2026-05"));
    await act(async () => {});

    await act(async () => {
      await result.current.markPaid("txn-1");
    });

    expect(transactionsService.markBillPaid).toHaveBeenCalledWith("txn-1");
    expect(result.current.transactions[0].status).toBe("PAID");
    expect(toast.success).toHaveBeenCalledWith("Marked as paid");
  });
});
