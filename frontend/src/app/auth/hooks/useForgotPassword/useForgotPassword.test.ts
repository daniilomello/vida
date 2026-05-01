import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmForgotPassword, forgotPassword } from "@/app/auth/config/cognito";
import { useForgotPassword } from "./index";

vi.mock("@/app/auth/config/cognito", () => ({
  forgotPassword: vi.fn(),
  confirmForgotPassword: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const wrapper = MemoryRouter;

describe("useForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start on the email step", () => {
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    expect(result.current.step).toBe("email");
  });

  it("should advance to reset step after sendCode succeeds", async () => {
    vi.mocked(forgotPassword).mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    act(() => result.current.setEmail("user@example.com"));

    await act(async () => {
      await result.current.sendCode();
    });

    expect(result.current.step).toBe("reset");
  });

  it("should show error toast when sendCode fails", async () => {
    const { toast } = await import("sonner");
    vi.mocked(forgotPassword).mockRejectedValue(new Error("User not found"));

    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    await act(async () => {
      await result.current.sendCode();
    });

    expect(toast.error).toHaveBeenCalledWith("User not found");
    expect(result.current.step).toBe("email");
  });

  it("should show success toast after resetPassword succeeds", async () => {
    const { toast } = await import("sonner");
    vi.mocked(confirmForgotPassword).mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    await act(async () => {
      await result.current.resetPassword();
    });

    expect(toast.success).toHaveBeenCalled();
  });
});
