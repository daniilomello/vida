import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Signup } from "./index";

vi.mock("@/app/auth/hooks/usePasswordSignup", () => ({
  usePasswordSignup: () => ({
    step: "form" as const,
    email: "",
    setEmail: vi.fn(),
    password: "",
    setPassword: vi.fn(),
    confirm: "",
    setConfirm: vi.fn(),
    code: "",
    setCode: vi.fn(),
    loading: false,
    register: vi.fn(),
    verify: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock("@/app/auth/hooks/useOtpSignup", () => ({
  useOtpSignup: () => ({
    step: "form" as const,
    email: "",
    setEmail: vi.fn(),
    code: "",
    setCode: vi.fn(),
    loading: false,
    register: vi.fn(),
    verify: vi.fn(),
    reset: vi.fn(),
  }),
}));

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>,
  );
}

describe("Signup", () => {
  it("should render the create account subtitle", () => {
    renderSignup();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("should render the Password and One-Time Code tabs", () => {
    renderSignup();
    expect(screen.getByRole("button", { name: "Password" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "One-Time Code" })).toBeInTheDocument();
  });

  it("should render the sign in link", () => {
    renderSignup();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("should render the create account button", () => {
    renderSignup();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });
});
