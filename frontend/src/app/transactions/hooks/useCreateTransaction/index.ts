import { useState } from "react";
import { toast } from "sonner";
import * as transactionsService from "@/app/transactions/services";
import type { CreateTransactionInput } from "@/app/transactions/types";

export function useCreateTransaction() {
  const [loading, setLoading] = useState(false);

  async function submit(data: CreateTransactionInput): Promise<boolean> {
    setLoading(true);
    try {
      await transactionsService.createTransaction(data);
      toast.success("Expense added");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, submit };
}
