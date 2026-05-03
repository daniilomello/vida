import { CreditCard } from "lucide-react";
import { Link } from "react-router";
import { useCards } from "@/app/cards/hooks/useCards";
import { Header } from "@/view/components/Header";
import { Button } from "@/view/components/ui/button";

const PREVIEW_LIMIT = 3;

export function Home() {
  const { cards, loading } = useCards("true");
  const preview = cards.slice(0, PREVIEW_LIMIT);
  const hasMore = cards.length > PREVIEW_LIMIT;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 px-4 py-6 space-y-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cards
            </h2>
            <Link to="/cards" className="text-xs font-medium text-primary hover:underline">
              See all
            </Link>
          </div>

          {loading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-[52px] animate-pulse rounded-lg bg-muted/30" />
              ))}
            </div>
          )}

          {!loading && cards.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/30">
                <CreditCard className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No cards yet</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/cards">Add your first card</Link>
              </Button>
            </div>
          )}

          {!loading && cards.length > 0 && (
            <div className="space-y-2">
              {preview.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <CreditCard className="size-4 text-primary" />
                  </div>
                  <span className="flex-1 truncate text-sm font-medium">{card.nickname}</span>
                </div>
              ))}

              {hasMore && (
                <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Link to="/cards">View all {cards.length} cards</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
