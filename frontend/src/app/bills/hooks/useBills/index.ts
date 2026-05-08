import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as billsService from "@/app/bills/services";
import type { Bill, CreateBillInput, UpdateBillInput } from "@/app/bills/types";

export function useBills(activeFilter: "true" | "false") {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await billsService.fetchBills(activeFilter);
      setBills(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(input: CreateBillInput): Promise<boolean> {
    try {
      const bill = await billsService.createBill(input);
      setBills((prev) => [...prev, bill]);
      toast.success("Bill added");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add bill");
      return false;
    }
  }

  async function update(id: string, input: UpdateBillInput): Promise<boolean> {
    try {
      const bill = await billsService.updateBill(id, input);
      setBills((prev) => prev.map((b) => (b.id === bill.id ? bill : b)));
      toast.success("Bill updated");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update bill");
      return false;
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await billsService.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bill deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete bill");
    }
  }

  async function reactivate(id: string): Promise<void> {
    try {
      await billsService.reactivateBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bill reactivated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reactivate bill");
    }
  }

  return { bills, loading, create, update, remove, reactivate };
}
