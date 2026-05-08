import { ChevronLeft, ChevronRight, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/app/core/utils/cn";
import { useTransactions } from "@/app/transactions/hooks/useTransactions";
import type { Transaction } from "@/app/transactions/types";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  ENTERTAINMENT: "Entertainment",
  HEALTH: "Health",
  HOUSING: "Housing",
  OTHER: "Other",
};

function formatMonthDisplay(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function stepMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const ny = d.getFullYear();
  const nm = String(d.getMonth() + 1).padStart(2, "0");
  return `${ny}-${nm}`;
}

function formatDateHeader(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.date.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(t);
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount / 100,
  );
}

export function Transactions() {
  const { transactions, loading, month, setMonth, remove, markPaid } = useTransactions();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    await remove(id);
    setDeleteLoading(false);
    setDeletingId(null);
  }

  async function handleMarkPaid(id: string) {
    setMarkingPaidId(id);
    await markPaid(id);
    setMarkingPaidId(null);
  }

  const grouped = groupByDate(transactions);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showBack title="Transactions" />

      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <Button variant="ghost" size="icon-sm" onClick={() => setMonth(stepMonth(month, -1))}>
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium">{formatMonthDisplay(month)}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setMonth(stepMonth(month, 1))}>
          <ChevronRight />
        </Button>
      </div>

      <div className="flex-1 space-y-4 px-4 py-4">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-lg bg-muted/30" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && transactions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/30">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No transactions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No transactions found for {formatMonthDisplay(month)}
              </p>
            </div>
          </div>
        )}

        {/* Grouped list */}
        {!loading &&
          grouped.map(([date, txns]) => (
            <div key={date}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formatDateHeader(date)}
              </p>
              <div className="space-y-2">
                {txns.map((t) => (
                  <div
                    key={t.id}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    {deletingId === t.id ? (
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <p className="flex-1 truncate text-sm text-muted-foreground">
                          Delete{" "}
                          <span className="font-medium text-foreground">
                            "{t.description ?? CATEGORY_LABELS[t.category]}"
                          </span>
                          ?
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(t.id)}
                          loading={deleteLoading}
                        >
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 px-3 py-3">
                        {/* Bill payment checkbox */}
                        {t.type === "BILL_PAYMENT" && (
                          <button
                            type="button"
                            aria-label={t.status === "PAID" ? "Paid" : "Mark as paid"}
                            disabled={t.status === "PAID" || markingPaidId === t.id}
                            onClick={() => t.status !== "PAID" && handleMarkPaid(t.id)}
                            className={cn(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              t.status === "PAID"
                                ? "border-green-500 bg-green-500"
                                : "border-muted-foreground hover:border-primary",
                              markingPaidId === t.id && "opacity-50",
                            )}
                          >
                            {t.status === "PAID" && (
                              <svg
                                className="size-3 text-white"
                                fill="none"
                                viewBox="0 0 12 12"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2 6l3 3 5-5"
                                />
                              </svg>
                            )}
                          </button>
                        )}

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {t.description ?? CATEGORY_LABELS[t.category]}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                t.status === "PAID"
                                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                                  : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
                              )}
                            >
                              {t.status}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{CATEGORY_LABELS[t.category]}</span>
                            <span>·</span>
                            <span>{t.paidVia}</span>
                          </div>
                        </div>

                        {/* Amount + delete */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatAmount(t.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeletingId(t.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
