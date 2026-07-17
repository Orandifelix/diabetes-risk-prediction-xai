"use client";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { RiskGauge } from "@/components/prediction/RiskGauge";
import { ShapChart } from "@/components/prediction/ShapChart";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { CheckCircle, ArrowLeft } from "lucide-react";
import type { RiskLevel } from "@/types";

// This page receives result via sessionStorage set on the assessment page
export default function ResultsPage() {
  const { data: session } = useSession();

  // In production, result is passed via router state or sessionStorage
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/risk-assessment" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to assessment
      </Link>
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Complete the risk assessment to see your results here.
        </p>
        <Link href="/risk-assessment"
          className="mt-4 inline-block rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
          Start Assessment →
        </Link>
      </div>
    </div>
  );
}
