import { useState } from "react";
import { Link } from "react-router";
import { useOtpSignup } from "@/app/auth/hooks/useOtpSignup";
import { usePasswordSignup } from "@/app/auth/hooks/usePasswordSignup";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { AuthLayout } from "@/view/layout/AuthLayout";

type Tab = "password" | "otp";

export function Signup() {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <AuthLayout
      subtitle="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
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
    </AuthLayout>
  );
}

function PasswordSignupForm() {
  const {
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
  } = usePasswordSignup();

  if (step === "verify") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify();
        }}
        className="space-y-4"
      >
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
          onClick={reset}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        register();
      }}
      className="space-y-4"
    >
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
  const { step, email, setEmail, code, setCode, loading, register, verify, reset } = useOtpSignup();

  if (step === "verify") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify();
        }}
        className="space-y-4"
      >
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
          onClick={reset}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        register();
      }}
      className="space-y-4"
    >
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
