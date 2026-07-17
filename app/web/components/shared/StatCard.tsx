import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title:     string;
  value:     string | number;
  subtitle?: string;
  icon?:     LucideIcon;
  trend?:    "up" | "down" | "neutral";
  color?:    "primary" | "success" | "warning" | "danger";
}

const COLOR_MAP = {
  primary: { bg: "bg-primary-50",  text: "text-primary-600",  icon: "text-primary-500"  },
  success: { bg: "bg-health-50",   text: "text-health-600",   icon: "text-health-500"   },
  warning: { bg: "bg-amber-50",    text: "text-amber-600",    icon: "text-amber-500"    },
  danger:  { bg: "bg-red-50",      text: "text-red-600",      icon: "text-red-500"      },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary" }: StatCardProps) {
  const colors = COLOR_MAP[color];
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("mt-1 text-2xl font-bold font-mono", colors.text)}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2", colors.bg)}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}
