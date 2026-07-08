import { cn } from "@/lib/utils";
import { RISK_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  size?: "sm" | "md" | "lg";
  showEmoji?: boolean;
}

export function RiskBadge({ riskLevel, size = "md", showEmoji = true }: RiskBadgeProps) {
  const config = RISK_CONFIG[riskLevel];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {riskLevel}
    </span>
  );
}
