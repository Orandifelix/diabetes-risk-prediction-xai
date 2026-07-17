"use client";
import { useState } from "react";
import { PredictionForm } from "@/components/forms/PredictionForm";
import { PredictionResult } from "@/components/prediction/PredictionResult";
import { PageHeader } from "@/components/shared/PageHeader";
import { predictSingle } from "@/lib/api";
import type { PredictionResponse } from "@/types";
import { toast } from "sonner";

export default function PredictPage() {
  const [result, setResult]     = useState<PredictionResponse | null>(null);
  const [predId, setPredId]     = useState<number | undefined>();
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (data: Record<string, number>) => {
    setLoading(true);
    try {
      const response = await predictSingle(data);
      setResult(response);
      setPredId(response.id);
      toast.success("Prediction complete — saved to history.");
    } catch (e: any) {
      toast.error(e.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Single Prediction"
        description="Enter patient details to predict Type 2 diabetes risk with SHAP explanation."
        badge="Authenticated"
      />

      {result ? (
        <div className="space-y-4">
          <PredictionResult
            result={result}
            predictionId={predId}
            isAuthenticated={true}
          />
          <button
            onClick={() => { setResult(null); setPredId(undefined); }}
            className="w-full rounded-lg border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            ← New prediction
          </button>
        </div>
      ) : (
        <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
}
