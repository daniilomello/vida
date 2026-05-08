import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as transactionsService from "@/app/transactions/services";
import type { Transaction } from "@/app/transactions/types";

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function useCardAudit(cardId: string, initialMonth?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<string>(initialMonth ?? currentMonth());

  const load = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    try {
      const data = await transactionsService.fetchTransactions(month, `CREDIT_CARD#${cardId}`);
      setTransactions(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [cardId, month]);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(() => transactions.reduce((sum, tx) => sum + tx.amount, 0), [transactions]);

  return { transactions, loading, total, month, setMonth };
}
