import { Check, CreditCard, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useCards } from "@/app/cards/hooks/useCards";
import { cn } from "@/app/core/utils/cn";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";

type Tab = "active" | "inactive";

export function Cards() {
  const [tab, setTab] = useState<Tab>("active");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const { cards, loading, create, update, remove, reactivate } = useCards(
    tab === "active" ? "true" : "false",
  );

  function handleTabChange(next: Tab) {
    setTab(next);
    setEditingId(null);
    setDeletingId(null);
    setShowAddForm(false);
    setNewNickname("");
  }

  async function handleAdd() {
    if (!newNickname.trim()) return;
    setAddLoading(true);
    const ok = await create(newNickname.trim());
    setAddLoading(false);
    if (ok) {
      setNewNickname("");
      setShowAddForm(false);
    }
  }

  function startEdit(id: string, nickname: string) {
    setEditingId(id);
    setEditValue(nickname);
    setDeletingId(null);
  }

  async function handleSaveEdit(id: string, original: string) {
    if (!editValue.trim() || editValue.trim() === original) {
      setEditingId(null);
      return;
    }
    setEditLoading(true);
    const ok = await update(id, editValue.trim());
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
        title="Cards"
        right={
          tab === "active" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setShowAddForm((v) => !v);
                setNewNickname("");
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
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2">
            <CreditCard className="size-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Card nickname (e.g. Nubank)"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setShowAddForm(false);
                  setNewNickname("");
                }
              }}
              className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            <Button
              size="icon-sm"
              onClick={handleAdd}
              loading={addLoading}
              disabled={!newNickname.trim()}
            >
              <Check />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setShowAddForm(false);
                setNewNickname("");
              }}
            >
              <X />
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[52px] animate-pulse rounded-lg bg-muted/30" />
            ))}
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/30">
              <CreditCard className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {tab === "active" ? "No active cards" : "No inactive cards"}
              </p>
              {tab === "active" && (
                <p className="mt-1 text-xs text-muted-foreground">Tap + to add your first card</p>
              )}
            </div>
          </div>
        )}

        {!loading &&
          cards.map((card) => (
            <div key={card.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {editingId === card.id ? (
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(card.id, card.nickname);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                  <Button
                    size="icon-sm"
                    onClick={() => handleSaveEdit(card.id, card.nickname)}
                    loading={editLoading}
                    disabled={!editValue.trim()}
                  >
                    <Check />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(null)}>
                    <X />
                  </Button>
                </div>
              ) : deletingId === card.id ? (
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <p className="flex-1 truncate text-sm text-muted-foreground">
                    Delete <span className="font-medium text-foreground">"{card.nickname}"</span>?
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(card.id)}
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
                    <CreditCard className="size-4 text-primary" />
                  </div>
                  <span className="flex-1 truncate text-sm font-medium">{card.nickname}</span>
                  {tab === "active" ? (
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEdit(card.id, card.nickname)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setDeletingId(card.id);
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
                      onClick={() => handleReactivate(card.id)}
                      loading={reactivatingId === card.id}
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
