import { ChevronLeft, ChevronRight, CreditCard, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCards } from "@/app/cards/services";
import type { Card } from "@/app/cards/types";
import { cn } from "@/app/core/utils/cn";
import { useCardAudit } from "@/app/transactions/hooks/useCardAudit";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
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

export function CardAudit() {
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  const { transactions, loading, total, month, setMonth } = useCardAudit(selectedCardId);

  useEffect(() => {
    setCardsLoading(true);
    fetchCards("true")
      .then((data) => {
        setCards(data);
        if (data.length > 0) setSelectedCardId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setCardsLoading(false));
  }, []);

  const isCurrentMonth = month === currentMonth();

  const selectClass =
    "h-10 w-full min-w-0 rounded border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showBack title="Card Audit" />

      <div className="space-y-4 px-4 py-4">
        {/* Card selector */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Card</p>
          {cardsLoading ? (
            <div className="h-10 animate-pulse rounded bg-muted/30" />
          ) : cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active cards found.</p>
          ) : (
            <select
              className={selectClass}
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.nickname}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
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

        {/* Running total */}
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Total charged
          </p>
          {loading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-muted/30" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{formatAmount(total)}</p>
          )}
          {!loading && (
            <p className="mt-1 text-xs text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex-1 px-4 pb-6 space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-lg bg-muted/30" />
            ))}
          </div>
        )}

        {!loading && !cardsLoading && cards.length > 0 && transactions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/30">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No transactions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No charges found for this card in {formatMonthLabel(month)}
              </p>
            </div>
          </div>
        )}

        {!loading &&
          transactions.map((tx) => (
            <div key={tx.id} className="rounded-lg border border-border bg-card px-3 py-3">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <CreditCard className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.description ?? tx.category.charAt(0) + tx.category.slice(1).toLowerCase()}
                    </p>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatAmount(tx.amount)}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {tx.category.charAt(0) + tx.category.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        tx.status === "PAID" ? "text-green-500" : "text-yellow-500",
                      )}
                    >
                      {tx.status === "PAID" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
