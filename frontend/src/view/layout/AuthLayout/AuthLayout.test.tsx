import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthLayout } from "./index";

describe("AuthLayout", () => {
  it("should render the subtitle", () => {
    render(<AuthLayout subtitle="Sign in to your account">content</AuthLayout>);
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <AuthLayout subtitle="test">
        <div>Child content</div>
      </AuthLayout>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should render footer when provided", () => {
    render(
      <AuthLayout subtitle="test" footer={<span>Footer text</span>}>
        content
      </AuthLayout>,
    );
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });

  it("should not render footer paragraph when footer prop is omitted", () => {
    const { container } = render(<AuthLayout subtitle="test">content</AuthLayout>);
    expect(container.querySelector("p.mt-6")).toBeNull();
  });
});
