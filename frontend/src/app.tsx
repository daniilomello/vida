import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { useAuthStore } from "@/store/auth.store";

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors theme="dark" />
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <h1 className="text-2xl font-bold text-white">Vida</h1>
    </main>
  );
}
