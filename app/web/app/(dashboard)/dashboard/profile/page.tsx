"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Activity, Upload, FileText, Clock } from "lucide-react";
import { formatDate, formatProbability } from "@/lib/utils";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn:  getDashboardSummary,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Profile" description="Your account and usage statistics." />

      {/* User card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || ""}
              width={64} height={64}
              className="rounded-full border-2 border-primary-200"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
              {session?.user?.name?.[0] || "U"}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold">{session?.user?.name}</h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-health-50 px-2.5 py-0.5 text-xs font-medium text-health-700">
              Google Account
            </span>
          </div>
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Predictions"
          value={summary?.total_predictions ?? 0}
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="High Risk Flagged"
          value={summary?.high_risk_count ?? 0}
          icon={Activity}
          color="danger"
        />
        <StatCard
          title="Avg Risk Score"
          value={formatProbability(summary?.avg_probability ?? 0)}
          icon={Activity}
          color="warning"
        />
        <StatCard
          title="Highest Risk Seen"
          value={formatProbability(summary?.highest_risk ?? 0)}
          icon={Activity}
          color="danger"
        />
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Recent Activity</h3>
        {summary?.recent_predictions?.length ? (
          <div className="space-y-3">
            {summary.recent_predictions.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(p.created_at)}</span>
                </div>
                <span
                  className="font-mono font-semibold"
                  style={{
                    color: p.risk_level === "High Risk" ? "#EF4444"
                         : p.risk_level === "Moderate Risk" ? "#F59E0B" : "#10B981",
                  }}
                >
                  {formatProbability(p.probability)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
