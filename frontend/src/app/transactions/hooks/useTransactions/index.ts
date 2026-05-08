import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as transactionsService from "@/app/transactions/services";
import type { Transaction } from "@/app/transactions/types";

function currentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function useTransactions(initialMonth?: string) {
  const [month, setMonth] = useState(initialMonth ?? currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await transactionsService.fetchTransactions(month);
      setTransactions(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string): Promise<void> {
    try {
      await transactionsService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transaction deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete transaction");
    }
  }

  async function markPaid(id: string): Promise<void> {
    try {
      const updated = await transactionsService.markBillPaid(id);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Marked as paid");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as paid");
    }
  }

  return { transactions, loading, month, setMonth, remove, markPaid };
}
