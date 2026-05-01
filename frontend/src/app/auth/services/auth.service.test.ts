import { afterEach, describe, expect, it, vi } from "vitest";
import { createSession } from "./index";

describe("createSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should POST tokens to /api/v1/auth/session", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await createSession({ accessToken: "access", idToken: "id", refreshToken: "refresh" });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/session"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("should throw with server error message on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "Unauthorized" } }), { status: 401 }),
    );

    await expect(
      createSession({ accessToken: "a", idToken: "b", refreshToken: "c" }),
    ).rejects.toThrow("Unauthorized");
  });

  it("should throw fallback message when response body is unparseable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not json", { status: 500 }));

    await expect(
      createSession({ accessToken: "a", idToken: "b", refreshToken: "c" }),
    ).rejects.toThrow("Failed to create session");
  });
});
