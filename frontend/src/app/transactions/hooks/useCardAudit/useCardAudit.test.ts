import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as transactionsService from "@/app/transactions/services";
import type { Transaction } from "@/app/transactions/types";
import { useCardAudit } from "./index";

vi.mock("@/app/transactions/services", () => ({
  fetchTransactions: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "tx-1",
  type: "EXPENSE",
  amount: 100,
  category: "FOOD",
  paidVia: "CREDIT_CARD#card-1",
  status: "PAID",
  month: "2026-05",
  date: "2026-05-01",
  deleted: false,
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-01T10:00:00Z",
  ...overrides,
});

describe("useCardAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialise with empty transactions and loading true", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    expect(result.current.loading).toBe(true);
    expect(result.current.transactions).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("should call fetchTransactions with correct month and paidVia", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([]);

    renderHook(() => useCardAudit("card-abc", "2026-04"));

    await waitFor(() => {
      expect(transactionsService.fetchTransactions).toHaveBeenCalledWith(
        "2026-04",
        "CREDIT_CARD#card-abc",
      );
    });
  });

  it("should populate transactions on successful fetch", async () => {
    const txs = [
      makeTransaction({ id: "tx-1", amount: 50 }),
      makeTransaction({ id: "tx-2", amount: 75 }),
    ];
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue(txs);

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transactions).toEqual(txs);
  });

  it("should compute total as the sum of all transaction amounts", async () => {
    const txs = [
      makeTransaction({ id: "tx-1", amount: 40 }),
      makeTransaction({ id: "tx-2", amount: 60.5 }),
      makeTransaction({ id: "tx-3", amount: 9.5 }),
    ];
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue(txs);

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(110);
  });

  it("should show error toast on fetch failure", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockRejectedValue(new Error("Network error"));
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Network error");
  });

  it("should show fallback error message when error is not an Error instance", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockRejectedValue("unknown");
    const { toast } = await import("sonner");

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Failed to load transactions");
  });

  it("should refetch when month changes", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setMonth("2026-04");
    });

    await waitFor(() => {
      expect(transactionsService.fetchTransactions).toHaveBeenCalledWith(
        "2026-04",
        "CREDIT_CARD#card-1",
      );
    });
  });

  it("should return total of zero when there are no transactions", async () => {
    vi.mocked(transactionsService.fetchTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useCardAudit("card-1", "2026-05"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(0);
  });
});
