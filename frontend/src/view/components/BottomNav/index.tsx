import { BarChart3, FileText, Home, PlusCircle, Receipt } from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/app/core/utils/cn";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/transactions", icon: Receipt, label: "Transactions" },
  { to: "/quick-add", icon: PlusCircle, label: "Add", accent: true },
  { to: "/bills", icon: FileText, label: "Bills" },
  { to: "/summary", icon: BarChart3, label: "Summary" },
];

const HUB_PATHS = ["/", "/transactions", "/quick-add", "/bills", "/summary"];

export function BottomNav() {
  const { pathname } = useLocation();

  if (!HUB_PATHS.includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-stretch border-t border-border bg-background/95 backdrop-blur-sm safe-area-bottom">
      {NAV_ITEMS.map(({ to, icon: Icon, label, accent }) => {
        const isActive = to === "/" ? pathname === "/" : pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("size-5", accent && "size-6")} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
