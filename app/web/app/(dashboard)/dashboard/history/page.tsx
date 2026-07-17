"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHistory, deleteHistory } from "@/lib/api";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Trash2, Search } from "lucide-react";
import { formatDate, formatProbability } from "@/lib/utils";
import { toast } from "sonner";
import type { PredictionHistoryItem, RiskLevel } from "@/types";

export default function HistoryPage() {
  const [page, setPage]   = useState(1);
  const [filter, setFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["history", page, filter],
    queryFn:  () => getHistory({ page, risk_level: filter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Prediction deleted.");
    },
    onError: () => toast.error("Failed to delete."),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Prediction History" description="All your saved predictions." badge="History" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["", "High Risk", "Moderate Risk", "Low Risk"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary-500 text-white"
                : "border hover:bg-muted"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : predictions?.length ? (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk Score</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk Level</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Top Factor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {predictions.map((p: PredictionHistoryItem) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{formatProbability(p.probability)}</td>
                  <td className="px-4 py-3"><RiskBadge riskLevel={p.risk_level as RiskLevel} size="sm" /></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.top_risk_factor || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.method === "single"
                        ? "bg-primary-50 text-primary-700"
                        : "bg-health-50 text-health-700"
                    }`}>
                      {p.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No predictions found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-lg border px-3 py-1.5 disabled:opacity-40 hover:bg-muted transition-colors"
        >
          ← Previous
        </button>
        <span className="text-muted-foreground">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!predictions?.length || predictions.length < 20}
          className="rounded-lg border px-3 py-1.5 disabled:opacity-40 hover:bg-muted transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
