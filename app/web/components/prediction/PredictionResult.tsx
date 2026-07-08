"use client";
import { motion } from "framer-motion";
import { RiskGauge } from "./RiskGauge";
import { ShapChart } from "./ShapChart";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { CheckCircle, Download, Save, ChevronRight } from "lucide-react";
import type { PredictionResponse } from "@/types";
import { exportSinglePdf } from "@/lib/api";

interface PredictionResultProps {
  result:       PredictionResponse;
  predictionId?: number;
  onSave?:      () => void;
  isAuthenticated: boolean;
}

export function PredictionResult({
  result, predictionId, onSave, isAuthenticated,
}: PredictionResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Gauge + summary */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <RiskGauge
            probability={result.probability}
            riskLevel={result.risk_level}
            size="lg"
          />

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Primary risk factor</p>
              <p className="text-lg font-semibold mt-0.5">{result.top_risk_label}</p>
            </div>

            {/* Recommendation */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {result.recommendation}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {predictionId && (
                <a
                  href={exportSinglePdf(predictionId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              )}
              {!isAuthenticated && (
                <a
                  href="/login"
                  className="flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Sign in to save
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SHAP chart */}
      {result.shap_labels && Object.keys(result.shap_labels).length > 0 && (
        <ShapChart shapLabels={result.shap_labels} />
      )}

      {/* Disclaimer */}
      <DisclaimerBanner />
    </motion.div>
  );
}
