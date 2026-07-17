"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBatchHistory, getBatchAnalytics } from "@/lib/api";
import { BatchAnalyticsDisplay } from "@/components/batch/BatchAnalyticsDisplay";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatDate } from "@/lib/utils";
import { BarChart2, ChevronRight } from "lucide-react";
import type { BatchJob } from "@/types";

export default function AnalyticsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const { data: batches, isLoading: batchLoading } = useQuery({
    queryKey: ["batch-history"],
    queryFn:  () => getBatchHistory({ page: 1 }),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["batch-analytics", selectedJobId],
    queryFn:  () => getBatchAnalytics(selectedJobId!),
    enabled:  !!selectedJobId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Analytics"
        description="View analytics from your batch prediction uploads."
        badge="Analytics"
      />

      {!selectedJobId ? (
        /* Job list */
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a batch job to view its full analytics dashboard.
          </p>
          {batchLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : batches?.length ? (
            <div className="grid gap-3">
              {batches.map((job: BatchJob) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className="flex items-center justify-between rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary-200 transition-all text-left"
                >
                  <div>
                    <p className="font-semibold text-sm">{job.filename}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(job.created_at)} · {job.total_rows.toLocaleString()} patients
                    </p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-red-600 font-medium">🔴 {job.high_risk_count} High</span>
                      <span className="text-amber-600 font-medium">🟡 {job.moderate_risk_count} Moderate</span>
                      <span className="text-green-600 font-medium">🟢 {job.low_risk_count} Low</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card py-16 text-center">
              <BarChart2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No batch jobs yet.</p>
              <a href="/dashboard/batch" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
                Upload your first CSV →
              </a>
            </div>
          )}
        </div>
      ) : (
        /* Analytics display */
        <div className="space-y-4">
          <button
            onClick={() => setSelectedJobId(null)}
            className="text-sm text-primary-500 hover:underline flex items-center gap-1"
          >
            ← Back to batch list
          </button>
          {analyticsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : analytics ? (
            <BatchAnalyticsDisplay analytics={analytics} />
          ) : null}
        </div>
      )}
    </div>
  );
}
