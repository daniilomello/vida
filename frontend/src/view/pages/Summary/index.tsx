import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { useSummary } from "@/app/summary/hooks/useSummary";
import type { CategoryTotal, PaymentMethodTotal } from "@/app/summary/types";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function prevMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 2, 1);
  return date.toISOString().slice(0, 7);
}

function nextMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m, 1);
  return date.toISOString().slice(0, 7);
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function resolvePaidVia(entry: PaymentMethodTotal): string {
  if (entry.nickname) return entry.nickname;
  if (entry.paidVia === "CASH") return "Cash";
  if (entry.paidVia === "DEBIT") return "Debit";
  return entry.paidVia;
}

export function Summary() {
  const { summary, loading, month, setMonth } = useSummary();

  const isCurrentMonth = month === currentMonth();

  const sortedCategories: CategoryTotal[] = summary
    ? [...summary.byCategory].sort((a, b) => b.total - a.total)
    : [];

  const sortedPayments: PaymentMethodTotal[] = summary
    ? [...summary.byPaymentMethod].sort((a, b) => b.total - a.total)
    : [];

  const maxCategory = sortedCategories[0]?.total ?? 1;
  const maxPayment = sortedPayments[0]?.total ?? 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showBack title="Snapshot" />

      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-lg border-b border-border px-4 py-2">
        <Button variant="ghost" size="icon-sm" onClick={() => setMonth(prevMonth(month))}>
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium">{formatMonthLabel(month)}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMonth(nextMonth(month))}
          disabled={isCurrentMonth}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="flex-1 space-y-4 px-4 py-4">
        {/* Total spent */}
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total spent
          </p>
          {loading ? (
            <div className="h-8 w-36 animate-pulse rounded bg-muted/30" />
          ) : (
            <p className="text-3xl font-bold text-foreground">
              {formatAmount(summary?.totalSpent ?? 0)}
            </p>
          )}
        </div>

        {/* Empty state */}
        {!loading && summary?.totalSpent === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/30">
              <BarChart3 className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No data</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No transactions found for {formatMonthLabel(month)}
              </p>
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {(loading || (summary && summary.totalSpent > 0)) && (
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              By category
            </p>
            <div className="space-y-2 rounded-xl border border-border bg-card px-4 py-3">
              {loading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className="h-9 animate-pulse rounded bg-muted/30" />
                  ))
                : sortedCategories.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatAmount(item.total)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(item.total / maxCategory) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        )}

        {/* Payment method breakdown */}
        {(loading || (summary && summary.totalSpent > 0)) && (
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              By payment method
            </p>
            <div className="space-y-2 rounded-xl border border-border bg-card px-4 py-3">
              {loading
                ? [1, 2].map((i) => (
                    <div key={i} className="h-9 animate-pulse rounded bg-muted/30" />
                  ))
                : sortedPayments.map((item) => (
                    <div key={item.paidVia}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{resolvePaidVia(item)}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatAmount(item.total)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${(item.total / maxPayment) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
