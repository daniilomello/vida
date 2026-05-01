import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateOtp, loginWithPassword, verifyOtp } from "@/lib/cognito";
import { createSession } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth.store";

type Tab = "password" | "otp";
type OtpStep = "email" | "code";

export function LoginPage() {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center flex flex-col items-center justify-center">
          <Logo />
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="mb-6 flex border-b border-border">
          {(["password", "otp"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "mr-6 pb-2 text-sm font-medium transition-colors",
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t === "password" ? "Password" : "One-Time Code"}
            </button>
          ))}
        </div>

        {tab === "password" ? <PasswordForm /> : <OtpForm />}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

function PasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Sign in
      </Button>
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

function OtpForm() {
  const [step, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await initiateOtp(email);
      setOtpStep("code");
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

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
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

  if (step === "email") {
    return (
      <form onSubmit={handleRequestCode} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="otp-email">Email</Label>
          <Input
            id="otp-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Send one-time code
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <p className="text-sm text-gray-400">
        Code sent to <span className="font-medium text-foreground">{email}</span>
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="otp-code">6-digit code</Label>
        <Input
          id="otp-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
        />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Verify code
      </Button>
      <button
        type="button"
        onClick={() => {
          setOtpStep("email");
          setCode("");
        }}
        className="w-full text-sm text-muted-foreground hover:text-foreground"
      >
        Use a different email
      </button>
    </form>
  );
}
