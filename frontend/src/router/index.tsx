import { Navigate, Route, Routes } from "react-router";
import { AuthGuard, GuestGuard } from "@/router/authGuard";
import { ForgotPassword } from "@/view/pages/Authentication/ForgotPassword";
import { Login } from "@/view/pages/Authentication/Login";
import { Signup } from "@/view/pages/Authentication/Signup";
import { Cards } from "@/view/pages/Cards";
import { Home } from "@/view/pages/Home";
import { QuickAdd } from "@/view/pages/QuickAdd";

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestGuard>
            <Login />
          </GuestGuard>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestGuard>
            <Signup />
          </GuestGuard>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestGuard>
            <ForgotPassword />
          </GuestGuard>
        }
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        }
      />
      <Route
        path="/cards"
        element={
          <AuthGuard>
            <Cards />
          </AuthGuard>
        }
      />
      <Route
        path="/quick-add"
        element={
          <AuthGuard>
            <QuickAdd />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
