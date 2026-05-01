import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: "vida-auth" },
  ),
);
