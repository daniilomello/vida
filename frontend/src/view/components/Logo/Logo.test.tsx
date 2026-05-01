import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Logo from "./index";

describe("Logo", () => {
  it("should render an SVG element", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("should have the Vida title", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("title")).toHaveTextContent("Vida");
  });
});
