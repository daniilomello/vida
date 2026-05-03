import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Home } from "./index";

vi.mock("@/app/cards/hooks/useCards", () => ({
  useCards: () => ({ cards: [], loading: false }),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  it("should render the Logo", () => {
    renderHome();
    expect(screen.getByTitle("Vida")).toBeInTheDocument();
  });

  it("should render the Cards section heading", () => {
    renderHome();
    expect(screen.getByText("Cards")).toBeInTheDocument();
  });

  it("should render the See all link to /cards", () => {
    renderHome();
    const link = screen.getByRole("link", { name: "See all" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/cards");
  });

  it("should render empty state when no cards exist", () => {
    renderHome();
    expect(screen.getByText("No cards yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add your first card" })).toBeInTheDocument();
  });
});
