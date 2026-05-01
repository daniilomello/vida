import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmSignup, loginWithPassword, signUpOtp } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";
import { useOtpSignup } from "./index";

vi.mock("@/app/auth/config/cognito", () => ({
  signUpOtp: vi.fn(),
  confirmSignup: vi.fn(),
  loginWithPassword: vi.fn(),
}));
vi.mock("@/app/auth/services", () => ({ createSession: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const wrapper = MemoryRouter;

describe("useOtpSignup", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
    vi.clearAllMocks();
  });

  it("should start on the form step", () => {
    const { result } = renderHook(() => useOtpSignup(), { wrapper });
    expect(result.current.step).toBe("form");
  });

  it("should advance to verify step after successful register", async () => {
    vi.mocked(signUpOtp).mockResolvedValue("temp-password");

    const { result } = renderHook(() => useOtpSignup(), { wrapper });

    act(() => result.current.setEmail("user@example.com"));

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

    const { result } = renderHook(() => useOtpSignup(), { wrapper });

    await act(async () => {
      await result.current.verify();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should reset step and code when reset is called", async () => {
    vi.mocked(signUpOtp).mockResolvedValue("pw");

    const { result } = renderHook(() => useOtpSignup(), { wrapper });

    await act(async () => {
      await result.current.register();
    });

    act(() => {
      result.current.setCode("123456");
      result.current.reset();
    });

    expect(result.current.step).toBe("form");
    expect(result.current.code).toBe("");
  });
});
