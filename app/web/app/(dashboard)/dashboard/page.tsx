"use client";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/api";
import { StatCard } from "@/components/shared/StatCard";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Activity, TrendingUp, AlertTriangle, BarChart2 } from "lucide-react";
import { formatProbability, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { RiskLevel } from "@/types";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn:  getDashboardSummary,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your diabetes risk assessments"
        badge="Overview"
      >
        <Link
          href="/dashboard/predict"
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          + New Prediction
        </Link>
      </PageHeader>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Predictions"
            value={data?.total_predictions ?? 0}
            icon={Activity}
            color="primary"
          />
          <StatCard
            title="High Risk Cases"
            value={data?.high_risk_count ?? 0}
            icon={AlertTriangle}
            color="danger"
          />
          <StatCard
            title="Avg Risk Score"
            value={formatProbability(data?.avg_probability ?? 0)}
            icon={TrendingUp}
            color="warning"
          />
          <StatCard
            title="Highest Risk"
            value={formatProbability(data?.highest_risk ?? 0)}
            icon={BarChart2}
            color="danger"
          />
        </div>
      )}

      {/* Recent predictions */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Recent Predictions</h2>
          <Link href="/dashboard/history" className="text-sm text-primary-500 hover:underline">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 rounded bg-muted" />
                <div className="h-6 w-20 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        ) : data?.recent_predictions?.length ? (
          <div className="divide-y">
            {data.recent_predictions.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">Prediction #{p.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatProbability(p.probability)}</span>
                  <RiskBadge riskLevel={p.risk_level as RiskLevel} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No predictions yet.</p>
            <Link href="/dashboard/predict" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
              Make your first prediction →
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/predict", label: "Single Prediction",  desc: "Predict risk for one patient",        color: "primary" },
          { href: "/dashboard/batch",   label: "Batch Prediction",   desc: "Upload CSV for multiple patients",   color: "success" },
          { href: "/dashboard/reports", label: "Download Reports",   desc: "PDF reports for all predictions",    color: "warning" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <p className="font-semibold text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
