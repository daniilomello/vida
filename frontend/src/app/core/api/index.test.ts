import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/app/auth/store";
import { handleApiResponse } from "./index";

vi.mock("@/app/auth/store", () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ logout: vi.fn() })),
  },
}));

function makeResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("handleApiResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
  });

  it("should return parsed JSON on a 200 response", async () => {
    const res = makeResponse(200, { id: "abc", nickname: "Nubank" });
    const result = await handleApiResponse<{ id: string; nickname: string }>(res);
    expect(result).toEqual({ id: "abc", nickname: "Nubank" });
  });

  it("should throw with the API error message on a 4xx response", async () => {
    const res = makeResponse(400, { error: { message: "nickname is required" } });
    await expect(handleApiResponse(res)).rejects.toThrow("nickname is required");
  });

  it("should throw a fallback message when error body has no message", async () => {
    const res = makeResponse(500, {});
    await expect(handleApiResponse(res)).rejects.toThrow("Request failed (500)");
  });

  it("should call logout and redirect to /login on 401", async () => {
    const mockLogout = vi.fn();
    vi.mocked(useAuthStore.getState).mockReturnValue({ logout: mockLogout } as never);

    const res = makeResponse(401, { error: { message: "Unauthorized" } });
    await expect(handleApiResponse(res)).rejects.toThrow("Session expired");

    expect(mockLogout).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("/login");
  });

  it("should throw even after 401 redirect so callers can clean up", async () => {
    const res = makeResponse(401, {});
    await expect(handleApiResponse(res)).rejects.toThrow();
  });
});
