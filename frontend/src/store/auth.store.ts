import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setAuthenticated: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
