import { Link } from "react-router";
import { useForgotPassword } from "@/app/auth/hooks/useForgotPassword";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { AuthLayout } from "@/view/layout/AuthLayout";

export function ForgotPassword() {
  const {
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
  } = useForgotPassword();

  return (
    <AuthLayout
      subtitle="Reset your password"
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {step === "email" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
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
          <Button type="submit" className="w-full" loading={loading}>
            Send reset code
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetPassword();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            Reset code sent to <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="code">Reset code</Label>
            <Input
              id="code"
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
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
