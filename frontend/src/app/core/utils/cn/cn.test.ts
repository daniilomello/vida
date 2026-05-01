import { describe, expect, it } from "vitest";
import { cn } from "./index";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should deduplicate conflicting tailwind classes", () => {
    expect(cn("text-black", "text-white")).toBe("text-white");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "ignored", "included")).toBe("base included");
  });
});
