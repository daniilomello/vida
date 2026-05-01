import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmSignup, loginWithPassword, signUp, signUpOtp } from "@/lib/cognito";
import { createSession } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth.store";

type Tab = "password" | "otp";
type Step = "form" | "verify" | "login-otp";

export function SignupPage() {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center flex flex-col items-center justify-center">
          <Logo />
          <p className="mt-1 text-sm text-muted-foreground">Create your account</p>
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

        {tab === "password" ? <PasswordSignupForm /> : <OtpSignupForm />}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function PasswordSignupForm() {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
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

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
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

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verification code sent to <span className="font-medium text-foreground">{email}</span>
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="verify-code">6-digit code</Label>
          <Input
            id="verify-code"
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
          Verify and sign in
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setCode("");
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>
    </form>
  );
}

function OtpSignupForm() {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const pw = await signUpOtp(email);
      setTempPassword(pw);
      setStep("verify");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmSignup(email, code);
      const tokens = await loginWithPassword(email, tempPassword);
      await createSession(tokens);
      setAuthenticated();
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verification code sent to <span className="font-medium text-foreground">{email}</span>
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="otp-verify-code">6-digit code</Label>
          <Input
            id="otp-verify-code"
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
          Verify email
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setCode("");
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="otp-signup-email">Email</Label>
        <Input
          id="otp-signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        No password needed — you'll always sign in with a code sent to your email.
      </p>
      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>
    </form>
  );
}
