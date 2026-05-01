import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Login } from "./index";

vi.mock("@/app/auth/hooks/usePasswordLogin", () => ({
  usePasswordLogin: () => ({
    email: "",
    setEmail: vi.fn(),
    password: "",
    setPassword: vi.fn(),
    loading: false,
    submit: vi.fn(),
  }),
}));

vi.mock("@/app/auth/hooks/useOtpLogin", () => ({
  useOtpLogin: () => ({
    step: "email" as const,
    email: "",
    setEmail: vi.fn(),
    code: "",
    setCode: vi.fn(),
    loading: false,
    requestCode: vi.fn(),
    verifyCode: vi.fn(),
    reset: vi.fn(),
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe("Login", () => {
  it("should render the sign in subtitle", () => {
    renderLogin();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("should render the Password and One-Time Code tabs", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: "Password" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "One-Time Code" })).toBeInTheDocument();
  });

  it("should render the signup link", () => {
    renderLogin();
    expect(screen.getByText("Create one")).toBeInTheDocument();
  });

  it("should render the forgot password link", () => {
    renderLogin();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });
});
