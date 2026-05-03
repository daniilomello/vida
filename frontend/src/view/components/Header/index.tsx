import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/app/core/utils/cn";
import Logo from "@/view/components/Logo";
import { Button } from "@/view/components/ui/button";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  className?: string;
}

export function Header({ title, showBack = false, right, className }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3",
        className,
      )}
    >
      {showBack ? (
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
      ) : (
        <Logo width={36} height={36} />
      )}

      {title && <h1 className="flex-1 text-base font-semibold">{title}</h1>}
      {!title && <span className="flex-1" />}

      {right}
    </header>
  );
}
