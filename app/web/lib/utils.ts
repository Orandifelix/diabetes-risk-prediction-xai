import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RISK_THRESHOLDS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskLevel(probability: number): "High Risk" | "Moderate Risk" | "Low Risk" {
  if (probability >= RISK_THRESHOLDS.HIGH) return "High Risk";
  if (probability >= RISK_THRESHOLDS.MODERATE) return "Moderate Risk";
  return "Low Risk";
}

export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "High Risk":     return "#EF4444";
    case "Moderate Risk": return "#F59E0B";
    case "Low Risk":      return "#10B981";
    default:              return "#64748B";
  }
}

export function getRiskBgColor(riskLevel: string): string {
  switch (riskLevel) {
    case "High Risk":     return "#FEF2F2";
    case "Moderate Risk": return "#FFFBEB";
    case "Low Risk":      return "#ECFDF5";
    default:              return "#F8FAFC";
  }
}

// Gauge calculation — semicircle (180 degrees)
export function getGaugeOffset(probability: number): number {
  const circumference = 251; // π * 80 (radius)
  return circumference - (probability * circumference);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}
