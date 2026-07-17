"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Activity, Upload, BarChart2,
  Clock, FileText, User, Settings, Activity as Logo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_DASHBOARD } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Activity, Upload, BarChart2,
  Clock, FileText, User, Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-card">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
          <Logo className="h-5 w-5 text-white" />
        </div>
        <span className="font-display font-bold text-primary-600">DiabetesRisk</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_DASHBOARD.map((item) => {
          const Icon = ICONS[item.icon] || Activity;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary-600" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <p className="text-xs text-muted-foreground text-center">
          Diabetes Risk Predictor v1.0
        </p>
      </div>
    </aside>
  );
}
