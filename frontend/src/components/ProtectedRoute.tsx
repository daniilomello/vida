import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
