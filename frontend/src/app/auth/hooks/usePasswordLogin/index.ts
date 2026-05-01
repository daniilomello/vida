import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { loginWithPassword } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";

export function usePasswordLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function submit() {
    setLoading(true);
    try {
      const tokens = await loginWithPassword(email, password);
      await createSession(tokens);
      setAuthenticated();
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return { email, setEmail, password, setPassword, loading, submit };
}
