import { Check, FileText, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useBills } from "@/app/bills/hooks/useBills";
import type { BillCategory, CreateBillInput } from "@/app/bills/types";
import { useCards } from "@/app/cards/hooks/useCards";
import { cn } from "@/app/core/utils/cn";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";

type Tab = "active" | "inactive";

const CATEGORIES: BillCategory[] = [
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTH",
  "HOUSING",
  "OTHER",
];

const CATEGORY_LABELS: Record<BillCategory, string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  ENTERTAINMENT: "Entertainment",
  HEALTH: "Health",
  HOUSING: "Housing",
  OTHER: "Other",
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

interface BillFormState {
  name: string;
  amount: string;
  dueDay: string;
  category: BillCategory;
  paidVia: string;
}

const EMPTY_FORM: BillFormState = {
  name: "",
  amount: "",
  dueDay: "",
  category: "OTHER",
  paidVia: "CASH",
};

export function Bills() {
  const [tab, setTab] = useState<Tab>("active");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<BillFormState>(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BillFormState>(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const { bills, loading, create, update, remove, reactivate } = useBills(
    tab === "active" ? "true" : "false",
  );

  const { cards } = useCards("true");

  function getPaidViaLabel(paidVia: string): string {
    if (paidVia === "CASH") return "Cash";
    if (paidVia === "DEBIT") return "Debit";
    if (paidVia.startsWith("CREDIT_CARD#")) {
      const cardId = paidVia.replace("CREDIT_CARD#", "");
      const card = cards.find((c) => c.id === cardId);
      return card ? card.nickname : paidVia;
    }
    return paidVia;
  }

  function handleTabChange(next: Tab) {
    setTab(next);
    setEditingId(null);
    setDeletingId(null);
    setShowAddForm(false);
    setAddForm(EMPTY_FORM);
  }

  async function handleAdd() {
    if (!addForm.name.trim() || !addForm.amount || !addForm.dueDay) return;
    const input: CreateBillInput = {
      name: addForm.name.trim(),
      amount: Number(addForm.amount),
      dueDay: Number(addForm.dueDay),
      category: addForm.category,
      paidVia: addForm.paidVia,
    };
    setAddLoading(true);
    const ok = await create(input);
    setAddLoading(false);
    if (ok) {
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
    }
  }

  function startEdit(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    setEditingId(id);
    setEditForm({
      name: bill.name,
      amount: String(bill.amount),
      dueDay: String(bill.dueDay),
      category: bill.category as BillCategory,
      paidVia: bill.paidVia,
    });
    setDeletingId(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.name.trim() || !editForm.amount || !editForm.dueDay) return;
    const input: CreateBillInput = {
      name: editForm.name.trim(),
      amount: Number(editForm.amount),
      dueDay: Number(editForm.dueDay),
      category: editForm.category,
      paidVia: editForm.paidVia,
    };
    setEditLoading(true);
    const ok = await update(id, input);
    setEditLoading(false);
    if (ok) setEditingId(null);
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    await remove(id);
    setDeleteLoading(false);
    setDeletingId(null);
  }

  async function handleReactivate(id: string) {
    setReactivatingId(id);
    await reactivate(id);
    setReactivatingId(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        showBack
        title="Bills"
        right={
          tab === "active" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setShowAddForm((v) => !v);
                setAddForm(EMPTY_FORM);
              }}
            >
              <Plus />
            </Button>
          ) : undefined
        }
      />

      <div className="flex border-b border-border px-4">
        {(["active", "inactive"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={cn(
              "mr-6 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 px-4 py-4">
        {showAddForm && tab === "active" && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Bill name (e.g. Internet)"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-2 pl-6">
              <Input
                type="number"
                placeholder="Amount"
                value={addForm.amount}
                onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))}
                className="h-8 flex-1 text-sm"
              />
              <Input
                type="number"
                placeholder="Due day (1–31)"
                min={1}
                max={31}
                value={addForm.dueDay}
                onChange={(e) => setAddForm((f) => ({ ...f, dueDay: e.target.value }))}
                className="h-8 flex-1 text-sm"
              />
            </div>
            <div className="flex gap-2 pl-6">
              <select
                value={addForm.category}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, category: e.target.value as BillCategory }))
                }
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              <select
                value={addForm.paidVia}
                onChange={(e) => setAddForm((f) => ({ ...f, paidVia: e.target.value }))}
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
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
            <div className="flex justify-end gap-2 pl-6">
              <Button
                size="sm"
                onClick={handleAdd}
                loading={addLoading}
                disabled={!addForm.name.trim() || !addForm.amount || !addForm.dueDay}
              >
                <Check />
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm(EMPTY_FORM);
                }}
              >
                <X />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-lg bg-muted/30" />
            ))}
          </div>
        )}

        {!loading && bills.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/30">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {tab === "active" ? "No active bills" : "No inactive bills"}
              </p>
              {tab === "active" && (
                <p className="mt-1 text-xs text-muted-foreground">Tap + to add your first bill</p>
              )}
            </div>
          </div>
        )}

        {!loading &&
          bills.map((bill) => (
            <div key={bill.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {editingId === bill.id ? (
                <div className="px-3 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex gap-2 pl-6">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={editForm.amount}
                      onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                      className="h-8 flex-1 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Due day (1–31)"
                      min={1}
                      max={31}
                      value={editForm.dueDay}
                      onChange={(e) => setEditForm((f) => ({ ...f, dueDay: e.target.value }))}
                      className="h-8 flex-1 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pl-6">
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, category: e.target.value as BillCategory }))
                      }
                      className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.paidVia}
                      onChange={(e) => setEditForm((f) => ({ ...f, paidVia: e.target.value }))}
                      className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
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
                  <div className="flex justify-end gap-2 pl-6">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(bill.id)}
                      loading={editLoading}
                      disabled={!editForm.name.trim() || !editForm.amount || !editForm.dueDay}
                    >
                      <Check />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : deletingId === bill.id ? (
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <p className="flex-1 truncate text-sm text-muted-foreground">
                    Delete <span className="font-medium text-foreground">"{bill.name}"</span>?
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(bill.id)}
                    loading={deleteLoading}
                  >
                    Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <FileText className="size-4 text-primary" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{bill.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatAmount(bill.amount)} · Due day {bill.dueDay} ·{" "}
                      {getPaidViaLabel(bill.paidVia)}
                    </span>
                  </div>
                  {tab === "active" ? (
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon-sm" onClick={() => startEdit(bill.id)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setDeletingId(bill.id);
                          setEditingId(null);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivate(bill.id)}
                      loading={reactivatingId === bill.id}
                    >
                      <RotateCcw />
                      Reactivate
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
