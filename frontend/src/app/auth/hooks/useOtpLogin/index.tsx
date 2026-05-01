import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { initiateOtp, verifyOtp } from "@/app/auth/config/cognito";
import { createSession } from "@/app/auth/services";
import { useAuthStore } from "@/app/auth/store";

type Step = "email" | "code";

export function useOtpLogin() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function requestCode() {
    setLoading(true);
    try {
      await initiateOtp(email);
      setStep("code");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send code";
      if (msg.includes("No account found")) {
        toast.error("No account found for this email.", {
          description: (
            <span>
              <a href="/signup" className="underline">
                Create an account
              </a>{" "}
              to get started.
            </span>
          ),
          duration: 6000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    try {
      const tokens = await verifyOtp(code);
      await createSession(tokens);
      setAuthenticated();
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("email");
    setCode("");
  }

  return { step, email, setEmail, code, setCode, loading, requestCode, verifyCode, reset };
}
