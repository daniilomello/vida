import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("text-black", "text-white")).toBe("text-white");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "ignored", "included")).toBe("base included");
  });
});
