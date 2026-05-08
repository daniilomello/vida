import { useEffect, useState } from "react";
import { fetchCards } from "@/app/cards/services";
import type { Card } from "@/app/cards/types";
import { useCreateTransaction } from "@/app/transactions/hooks/useCreateTransaction";
import type { Category } from "@/app/transactions/types";
import { CATEGORIES } from "@/app/transactions/types";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function QuickAdd() {
  const { loading, submit } = useCreateTransaction();
  const [cards, setCards] = useState<Card[]>([]);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("OTHER");
  const [paidVia, setPaidVia] = useState("CASH");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());

  useEffect(() => {
    fetchCards("true")
      .then(setCards)
      .catch(() => {
        // cards load is best-effort; CASH/DEBIT always available
      });
  }, []);

  function resetForm() {
    setAmount("");
    setCategory("OTHER");
    setPaidVia("CASH");
    setDescription("");
    setDate(todayIso());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseFloat(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) return;

    const ok = await submit({
      amount: parsed,
      category,
      paidVia,
      description: description.trim() || undefined,
      date,
    });

    if (ok) resetForm();
  }

  const selectClass =
    "h-12 w-full min-w-0 rounded border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showBack title="Quick Add" />

      <main className="flex-1 px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Paid Via */}
          <div className="space-y-1.5">
            <Label htmlFor="paidVia">Paid Via</Label>
            <select
              id="paidVia"
              className={selectClass}
              value={paidVia}
              onChange={(e) => setPaidVia(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="DEBIT">Debit</option>
              {cards.map((card) => (
                <option key={card.id} value={`CREDIT_CARD#${card.id}`}>
                  {card.nickname}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g. Lunch at work"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" loading={loading} disabled={!amount}>
            Add Expense
          </Button>
        </form>
      </main>
    </div>
  );
}
