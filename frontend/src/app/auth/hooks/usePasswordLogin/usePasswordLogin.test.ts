import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginWithPassword } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";
import { usePasswordLogin } from "./index";

vi.mock("@/app/auth/config/cognito", () => ({ loginWithPassword: vi.fn() }));
vi.mock("@/app/auth/services", () => ({ createSession: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const wrapper = MemoryRouter;

describe("usePasswordLogin", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
    vi.clearAllMocks();
  });

  it("should initialise with empty fields and not loading", () => {
    const { result } = renderHook(() => usePasswordLogin(), { wrapper });
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("should set authenticated and navigate on successful submit", async () => {
    vi.mocked(loginWithPassword).mockResolvedValue({
      accessToken: "a",
      idToken: "b",
      refreshToken: "c",
    });
    vi.mocked(createSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePasswordLogin(), { wrapper });

    act(() => {
      result.current.setEmail("user@example.com");
      result.current.setPassword("secret");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should show error toast on failed submit", async () => {
    const { toast } = await import("sonner");
    vi.mocked(loginWithPassword).mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => usePasswordLogin(), { wrapper });

    await act(async () => {
      await result.current.submit();
    });

    expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("should reset loading to false after submit regardless of outcome", async () => {
    vi.mocked(loginWithPassword).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => usePasswordLogin(), { wrapper });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.loading).toBe(false);
  });
});
