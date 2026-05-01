import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { confirmForgotPassword, forgotPassword } from "@/app/auth/config/cognito";

type Step = "email" | "reset";

export function useForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function sendCode() {
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setLoading(true);
    try {
      await confirmForgotPassword(email, code, password);
      toast.success("Password reset — sign in with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    loading,
    sendCode,
    resetPassword,
  };
}
