import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./index";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
  });

  it("should start unauthenticated", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("should set authenticated when setAuthenticated is called", () => {
    useAuthStore.getState().setAuthenticated();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should reset to unauthenticated when logout is called", () => {
    useAuthStore.getState().setAuthenticated();
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
