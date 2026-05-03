import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as cardsService from "@/app/cards/services";
import type { Card } from "@/app/cards/types";

export function useCards(activeFilter: "true" | "false") {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cardsService.fetchCards(activeFilter);
      setCards(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(nickname: string): Promise<boolean> {
    try {
      const card = await cardsService.createCard(nickname);
      setCards((prev) => [...prev, card]);
      toast.success("Card added");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add card");
      return false;
    }
  }

  async function update(id: string, nickname: string): Promise<boolean> {
    try {
      const card = await cardsService.updateCard(id, nickname);
      setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
      toast.success("Card updated");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update card");
      return false;
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await cardsService.deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Card deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete card");
    }
  }

  async function reactivate(id: string): Promise<void> {
    try {
      await cardsService.reactivateCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Card reactivated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reactivate card");
    }
  }

  return { cards, loading, create, update, remove, reactivate };
}
