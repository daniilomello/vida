import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  setAuthenticated: (tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      tokens: null,
      setAuthenticated: (tokens) => set({ isAuthenticated: true, tokens }),
      logout: () => set({ isAuthenticated: false, tokens: null }),
    }),
    { name: "vida-auth" },
  ),
);
