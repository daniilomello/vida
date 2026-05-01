import type { ReactNode } from "react";
import Logo from "@/view/components/Logo";

interface AuthLayoutProps {
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Logo />
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </main>
  );
}
