import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { confirmSignup, loginWithPassword, signUp } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";

type Step = "form" | "verify";

export function usePasswordSignup() {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function register() {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      setStep("verify");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    try {
      await confirmSignup(email, code);
      const tokens = await loginWithPassword(email, password);
      await createSession(tokens);
      setAuthenticated();
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("form");
    setCode("");
  }

  return {
    step,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    code,
    setCode,
    loading,
    register,
    verify,
    reset,
  };
}
