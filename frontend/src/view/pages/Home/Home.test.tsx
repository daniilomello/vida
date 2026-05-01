import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./index";

describe("Home", () => {
  it("should render the app name", () => {
    render(<Home />);
    expect(screen.getByText("Vida")).toBeInTheDocument();
  });
});
