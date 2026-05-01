import { useState } from "react";
import { Link } from "react-router";
import { useOtpLogin } from "@/app/auth/hooks/useOtpLogin";
import { usePasswordLogin } from "@/app/auth/hooks/usePasswordLogin";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { AuthLayout } from "@/view/layout/AuthLayout";

type Tab = "password" | "otp";

export function Login() {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <AuthLayout
      subtitle="Sign in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
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

      {tab === "password" ? <PasswordForm /> : <OtpForm />}
    </AuthLayout>
  );
}

function PasswordForm() {
  const { email, setEmail, password, setPassword, loading, submit } = usePasswordLogin();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
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
  const { step, email, setEmail, code, setCode, loading, requestCode, verifyCode, reset } =
    useOtpLogin();

  if (step === "email") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
        className="space-y-4"
      >
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verifyCode();
      }}
      className="space-y-4"
    >
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
        onClick={reset}
        className="w-full text-sm text-muted-foreground hover:text-foreground"
      >
        Use a different email
      </button>
    </form>
  );
}
