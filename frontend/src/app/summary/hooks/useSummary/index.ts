import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as summaryService from "@/app/summary/services";
import type { MonthlySummary } from "@/app/summary/types";

function currentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function useSummary(initialMonth?: string) {
  const [month, setMonth] = useState(initialMonth ?? currentMonth());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await summaryService.fetchSummary(month);
      setSummary(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, loading, month, setMonth };
}
