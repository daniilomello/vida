import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/app/auth/store";
import { AuthGuard, GuestGuard } from "./index";

vi.mock("@/app/auth/store", () => ({
  useAuthStore: vi.fn(),
}));

const mockStore = (isAuthenticated: boolean) => {
  vi.mocked(useAuthStore).mockImplementation((selector: Parameters<typeof useAuthStore>[0]) =>
    selector({ isAuthenticated, setAuthenticated: vi.fn(), logout: vi.fn() }),
  );
};

describe("AuthGuard", () => {
  it("should redirect to /login when not authenticated", () => {
    mockStore(false);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard>
                <div>Protected</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should render children when authenticated", () => {
    mockStore(true);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard>
                <div>Protected</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});

describe("GuestGuard", () => {
  it("should redirect to / when authenticated", () => {
    mockStore(true);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div>Login Page</div>
              </GuestGuard>
            }
          />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should render children when not authenticated", () => {
    mockStore(false);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div>Login Page</div>
              </GuestGuard>
            }
          />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
