"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHistory, getBatchHistory, downloadSinglePdf, downloadBatchPdf, downloadBatchCsv } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Download, FileText, File, Loader2 } from "lucide-react";
import { formatDate, formatProbability } from "@/lib/utils";
import type { PredictionHistoryItem, BatchJob, RiskLevel } from "@/types";

export default function ReportsPage() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const { data: predictions, isLoading: predLoading } = useQuery({
    queryKey: ["history-reports"],
    queryFn:  () => getHistory({ page: 1, limit: 20 } as any),
  });

  const { data: batches, isLoading: batchLoading } = useQuery({
    queryKey: ["batch-reports"],
    queryFn:  () => getBatchHistory({ page: 1 }),
  });

  const runDownload = async (key: string, fn: () => Promise<void>) => {
    setDownloadingKey(key);
    try {
      await fn();
    } catch {
      // could surface a toast here
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Download PDF reports and CSV exports for all predictions."
        badge="Reports"
      />

      {/* Single prediction reports */}
      <section>
        <h2 className="text-base font-semibold mb-3">Single Prediction Reports</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          {predLoading ? (
            <div className="p-4"><TableSkeleton rows={4} /></div>
          ) : predictions?.length ? (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk Level</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Top Factor</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {predictions.map((p: PredictionHistoryItem) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{formatProbability(p.probability)}</td>
                    <td className="px-4 py-3"><RiskBadge riskLevel={p.risk_level as RiskLevel} size="sm" /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.top_risk_factor || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => runDownload(`pred-${p.id}`, () => downloadSinglePdf(p.id))}
                        disabled={downloadingKey === `pred-${p.id}`}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60"
                      >
                        {downloadingKey === `pred-${p.id}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No single predictions yet.
            </div>
          )}
        </div>
      </section>

      {/* Batch reports */}
      <section>
        <h2 className="text-base font-semibold mb-3">Batch Prediction Exports</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          {batchLoading ? (
            <div className="p-4"><TableSkeleton rows={3} /></div>
          ) : batches?.length ? (
            <div className="divide-y">
              {batches.map((job: BatchJob) => (
                <div key={job.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{job.filename}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(job.created_at)} · {job.total_rows.toLocaleString()} patients
                      </p>
                    </div>
                    {/* Summary PDF */}
                    <button
                      onClick={() => runDownload(`batch-pdf-${job.id}`, () => downloadBatchPdf(job.id))}
                      disabled={downloadingKey === `batch-pdf-${job.id}`}
                      className="shrink-0 inline-flex items-center gap-1 rounded-md bg-primary-50 border border-primary-200 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors disabled:opacity-60"
                    >
                      {downloadingKey === `batch-pdf-${job.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      Summary PDF
                    </button>
                  </div>

                  {/* CSV downloads by risk */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { filter: "high",     label: `High Risk (${job.high_risk_count})`,     cls: "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"    },
                      { filter: "moderate", label: `Moderate (${job.moderate_risk_count})`,  cls: "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100" },
                      { filter: "low",      label: `Low Risk (${job.low_risk_count})`,       cls: "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" },
                      { filter: "all",      label: `All (${job.total_rows})`,                cls: "text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100" },
                    ].map(({ filter, label, cls }) => (
                      <button
                        key={filter}
                        onClick={() => runDownload(`batch-csv-${job.id}-${filter}`, () => downloadBatchCsv(job.id, filter as any))}
                        disabled={downloadingKey === `batch-csv-${job.id}-${filter}`}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${cls}`}
                      >
                        {downloadingKey === `batch-csv-${job.id}-${filter}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No batch jobs yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
