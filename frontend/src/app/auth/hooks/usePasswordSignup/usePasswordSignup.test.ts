import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmSignup, loginWithPassword, signUp } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";
import { usePasswordSignup } from "./index";

vi.mock("@/app/auth/config/cognito", () => ({
  signUp: vi.fn(),
  confirmSignup: vi.fn(),
  loginWithPassword: vi.fn(),
}));
vi.mock("@/app/auth/services", () => ({ createSession: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const wrapper = MemoryRouter;

describe("usePasswordSignup", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
    vi.clearAllMocks();
  });

  it("should start on the form step", () => {
    const { result } = renderHook(() => usePasswordSignup(), { wrapper });
    expect(result.current.step).toBe("form");
  });

  it("should show an error when passwords do not match", async () => {
    const { toast } = await import("sonner");
    const { result } = renderHook(() => usePasswordSignup(), { wrapper });

    act(() => {
      result.current.setPassword("abc");
      result.current.setConfirm("xyz");
    });

    await act(async () => {
      await result.current.register();
    });

    expect(toast.error).toHaveBeenCalledWith("Passwords do not match");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("should advance to verify step after successful register", async () => {
    vi.mocked(signUp).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePasswordSignup(), { wrapper });

    act(() => {
      result.current.setPassword("pass");
      result.current.setConfirm("pass");
    });

    await act(async () => {
      await result.current.register();
    });

    expect(result.current.step).toBe("verify");
  });

  it("should set authenticated after successful verify", async () => {
    vi.mocked(confirmSignup).mockResolvedValue(undefined);
    vi.mocked(loginWithPassword).mockResolvedValue({
      accessToken: "a",
      idToken: "b",
      refreshToken: "c",
    });
    vi.mocked(createSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePasswordSignup(), { wrapper });

    await act(async () => {
      await result.current.verify();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
