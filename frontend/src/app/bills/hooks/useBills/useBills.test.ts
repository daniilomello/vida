import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as billsService from "@/app/bills/services";
import type { Bill } from "@/app/bills/types";
import { useBills } from "./index";

vi.mock("@/app/bills/services");
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockBill: Bill = {
  id: "bill-1",
  type: "BILL_DEFINITION",
  name: "Internet",
  amount: 100,
  dueDay: 10,
  category: "UTILITIES",
  paidVia: "DEBIT",
  active: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("useBills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(billsService.fetchBills).mockResolvedValue([mockBill]);
  });

  it("should load bills on mount", async () => {
    const { result } = renderHook(() => useBills("true"));

    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.bills).toEqual([mockBill]);
  });

  it("should show error toast when loading fails", async () => {
    const { toast } = await import("sonner");
    vi.mocked(billsService.fetchBills).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useBills("true"));

    await act(async () => {});

    expect(toast.error).toHaveBeenCalledWith("Network error");
    expect(result.current.bills).toEqual([]);
  });

  it("should create a bill and append it to the list", async () => {
    const { toast } = await import("sonner");
    const newBill: Bill = { ...mockBill, id: "bill-2", name: "Rent" };
    vi.mocked(billsService.createBill).mockResolvedValue(newBill);

    const { result } = renderHook(() => useBills("true"));
    await act(async () => {});

    let ok = false;
    await act(async () => {
      ok = await result.current.create({
        name: "Rent",
        amount: 1500,
        dueDay: 1,
        category: "HOUSING",
        paidVia: "DEBIT",
      });
    });

    expect(ok).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Bill added");
    expect(result.current.bills).toContainEqual(newBill);
  });

  it("should show error toast when create fails", async () => {
    const { toast } = await import("sonner");
    vi.mocked(billsService.createBill).mockRejectedValue(new Error("Create failed"));

    const { result } = renderHook(() => useBills("true"));
    await act(async () => {});

    let ok = true;
    await act(async () => {
      ok = await result.current.create({
        name: "Rent",
        amount: 1500,
        dueDay: 1,
        category: "HOUSING",
        paidVia: "DEBIT",
      });
    });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Create failed");
  });

  it("should update a bill in the list", async () => {
    const { toast } = await import("sonner");
    const updatedBill: Bill = { ...mockBill, name: "Fiber Internet" };
    vi.mocked(billsService.updateBill).mockResolvedValue(updatedBill);

    const { result } = renderHook(() => useBills("true"));
    await act(async () => {});

    let ok = false;
    await act(async () => {
      ok = await result.current.update("bill-1", { name: "Fiber Internet" });
    });

    expect(ok).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Bill updated");
    expect(result.current.bills[0].name).toBe("Fiber Internet");
  });

  it("should remove a bill from the list", async () => {
    const { toast } = await import("sonner");
    vi.mocked(billsService.deleteBill).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBills("true"));
    await act(async () => {});

    await act(async () => {
      await result.current.remove("bill-1");
    });

    expect(toast.success).toHaveBeenCalledWith("Bill deleted");
    expect(result.current.bills).toEqual([]);
  });

  it("should reactivate a bill and remove it from the list", async () => {
    const { toast } = await import("sonner");
    vi.mocked(billsService.fetchBills).mockResolvedValue([{ ...mockBill, active: false }]);
    vi.mocked(billsService.reactivateBill).mockResolvedValue({ ...mockBill, active: true });

    const { result } = renderHook(() => useBills("false"));
    await act(async () => {});

    await act(async () => {
      await result.current.reactivate("bill-1");
    });

    expect(toast.success).toHaveBeenCalledWith("Bill reactivated");
    expect(result.current.bills).toEqual([]);
  });
});
