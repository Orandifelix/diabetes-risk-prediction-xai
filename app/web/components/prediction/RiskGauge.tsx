"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RISK_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

interface RiskGaugeProps {
  probability: number;
  riskLevel:   RiskLevel;
  size?:       "sm" | "md" | "lg";
  animated?:   boolean;
}

const SIZES = {
  sm: { viewBox: 120, r: 45, cx: 60, cy: 65, strokeW: 8,  fontSize: 16, subSize: 9  },
  md: { viewBox: 200, r: 75, cx: 100, cy: 110, strokeW: 12, fontSize: 24, subSize: 11 },
  lg: { viewBox: 260, r: 100, cx: 130, cy: 145, strokeW: 14, fontSize: 32, subSize: 13 },
};

export function RiskGauge({ probability, riskLevel, size = "md", animated = true }: RiskGaugeProps) {
  const [displayed, setDisplayed] = useState(animated ? 0 : probability);
  const config = RISK_CONFIG[riskLevel];
  const s = SIZES[size];

  // Semicircle: circumference = π * r
  const circumference = Math.PI * s.r;
  const offset = circumference - probability * circumference;

  useEffect(() => {
    if (!animated) return;
    let start: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * probability);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [probability, animated]);

  const displayedOffset = circumference - displayed * circumference;
  const pct = Math.round(probability * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${s.viewBox} ${s.cx + 20}`}
        className={cn(
          size === "sm" && "w-32",
          size === "md" && "w-52",
          size === "lg" && "w-72",
        )}
        aria-label={`Risk gauge showing ${pct}% — ${riskLevel}`}
      >
        {/* Background arc */}
        <path
          d={`M ${s.cx - s.r} ${s.cy} A ${s.r} ${s.r} 0 0 1 ${s.cx + s.r} ${s.cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.strokeW}
          strokeLinecap="round"
          className="text-muted"
        />

        {/* Colored progress arc */}
        <path
          d={`M ${s.cx - s.r} ${s.cy} A ${s.r} ${s.r} 0 0 1 ${s.cx + s.r} ${s.cy}`}
          fill="none"
          stroke={config.color}
          strokeWidth={s.strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={displayedOffset}
          style={{ transition: animated ? "none" : undefined }}
        />

        {/* Pulse dot at tip */}
        {animated && (
          <circle
            cx={s.cx + s.r * Math.cos(Math.PI * (1 - displayed))}
            cy={s.cy - s.r * Math.sin(Math.PI * (1 - displayed))}
            r={s.strokeW / 2}
            fill={config.color}
            className="animate-pulse-ring"
          />
        )}

        {/* Center text */}
        <text
          x={s.cx}
          y={s.cy - 4}
          textAnchor="middle"
          className="font-mono font-bold fill-foreground"
          fontSize={s.fontSize}
        >
          {Math.round(displayed * 100)}%
        </text>
        <text
          x={s.cx}
          y={s.cy + s.subSize + 2}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={s.subSize}
        >
          Risk Score
        </text>

        {/* Min/max labels */}
        <text x={s.cx - s.r + 4} y={s.cy + 16} fontSize={s.subSize - 1} className="fill-muted-foreground">0%</text>
        <text x={s.cx + s.r - 4} y={s.cy + 16} fontSize={s.subSize - 1} textAnchor="end" className="fill-muted-foreground">100%</text>
      </svg>

      {/* Risk label pill */}
      <span
        className="rounded-full px-4 py-1 text-sm font-bold"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        {config.emoji} {riskLevel}
      </span>
    </div>
  );
}
