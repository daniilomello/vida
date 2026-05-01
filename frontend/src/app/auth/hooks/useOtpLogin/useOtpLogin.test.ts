import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiateOtp, verifyOtp } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";
import { useOtpLogin } from "./index";

vi.mock("@/app/auth/config/cognito", () => ({ initiateOtp: vi.fn(), verifyOtp: vi.fn() }));
vi.mock("@/app/auth/services", () => ({ createSession: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const wrapper = MemoryRouter;

describe("useOtpLogin", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
    vi.clearAllMocks();
  });

  it("should start on the email step", () => {
    const { result } = renderHook(() => useOtpLogin(), { wrapper });
    expect(result.current.step).toBe("email");
  });

  it("should advance to code step after requestCode succeeds", async () => {
    vi.mocked(initiateOtp).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOtpLogin(), { wrapper });

    act(() => result.current.setEmail("user@example.com"));

    await act(async () => {
      await result.current.requestCode();
    });

    expect(result.current.step).toBe("code");
  });

  it("should set authenticated after verifyCode succeeds", async () => {
    vi.mocked(verifyOtp).mockResolvedValue({ accessToken: "a", idToken: "b", refreshToken: "c" });
    vi.mocked(createSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOtpLogin(), { wrapper });

    await act(async () => {
      await result.current.verifyCode();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should reset step and code when reset is called", async () => {
    vi.mocked(initiateOtp).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOtpLogin(), { wrapper });

    await act(async () => {
      await result.current.requestCode();
    });

    act(() => {
      result.current.setCode("123456");
      result.current.reset();
    });

    expect(result.current.step).toBe("email");
    expect(result.current.code).toBe("");
  });
});
