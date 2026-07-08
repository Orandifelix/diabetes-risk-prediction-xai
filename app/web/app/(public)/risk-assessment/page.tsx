"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { PredictionForm } from "@/components/forms/PredictionForm";
import { PredictionResult } from "@/components/prediction/PredictionResult";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { predictSingle } from "@/lib/api";
import type { PredictionResponse } from "@/types";
import { toast } from "sonner";

export default function RiskAssessmentPage() {
  const { data: session } = useSession();
  const [result, setResult]     = useState<PredictionResponse | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (data: Record<string, number>) => {
    setLoading(true);
    try {
      const response = await predictSingle(data);
      setResult(response);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      toast.error(e.message || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Free · No account required
        </span>
        <h1 className="font-display text-3xl font-bold">Diabetes Risk Assessment</h1>
        <p className="mt-2 text-muted-foreground">
          Answer 14 clinical questions to receive your personalised Type 2
          diabetes risk score with an AI explanation.
        </p>
      </div>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      {result ? (
        <div className="space-y-6">
          <PredictionResult
            result={result}
            isAuthenticated={!!session}
          />
          <button
            onClick={() => setResult(null)}
            className="w-full rounded-lg border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            ← Start a new assessment
          </button>
        </div>
      ) : (
        <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
}
