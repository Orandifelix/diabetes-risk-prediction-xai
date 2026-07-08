"use client";
import { useState } from "react";
import { BatchUpload } from "@/components/batch/BatchUpload";
import { BatchAnalyticsDisplay } from "@/components/batch/BatchAnalyticsDisplay";
import { PageHeader } from "@/components/shared/PageHeader";
import { predictBatch, getBatchAnalytics } from "@/lib/api";
import type { BatchAnalytics } from "@/types";
import { toast } from "sonner";

export default function BatchPage() {
  const [analytics, setAnalytics] = useState<BatchAnalytics | null>(null);
  const [isLoading, setLoading]   = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const job      = await predictBatch(file);
      const fullData = await getBatchAnalytics(job.id);
      setAnalytics(fullData);
      toast.success(`Processed ${job.total_rows} patients successfully.`);
    } catch (e: any) {
      toast.error(e.message || "Batch prediction failed.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Prediction"
        description="Upload a CSV file to predict risk for multiple patients at once."
        badge="Batch"
      />

      {analytics ? (
        <div className="space-y-4">
          <BatchAnalyticsDisplay analytics={analytics} />
          <button
            onClick={() => setAnalytics(null)}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            ← Upload another file
          </button>
        </div>
      ) : (
        <div className="max-w-xl">
          <BatchUpload onUpload={handleUpload} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
