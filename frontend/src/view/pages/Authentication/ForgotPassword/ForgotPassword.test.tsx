import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ForgotPassword } from "./index";

vi.mock("@/app/auth/hooks/useForgotPassword", () => ({
  useForgotPassword: () => ({
    step: "email" as const,
    email: "",
    setEmail: vi.fn(),
    code: "",
    setCode: vi.fn(),
    password: "",
    setPassword: vi.fn(),
    loading: false,
    sendCode: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

describe("ForgotPassword", () => {
  it("should render the reset password subtitle", () => {
    renderForgotPassword();
    expect(screen.getByText("Reset your password")).toBeInTheDocument();
  });

  it("should render the email input on the first step", () => {
    renderForgotPassword();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("should render the send reset code button", () => {
    renderForgotPassword();
    expect(screen.getByText("Send reset code")).toBeInTheDocument();
  });

  it("should render the back to sign in link", () => {
    renderForgotPassword();
    expect(screen.getByText("Back to sign in")).toBeInTheDocument();
  });
});
