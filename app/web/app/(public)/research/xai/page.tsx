export default function XAIPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14 space-y-16">
      <div className="text-center">
        <span className="mb-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
          Explainable AI
        </span>
        <h1 className="font-display text-4xl font-bold">How We Explain Predictions</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          A prediction without an explanation is just a number. We use SHAP and LIME to
          make every prediction transparent and understandable.
        </p>
      </div>

      {/* Why XAI matters */}
      <section className="rounded-xl border bg-card p-8">
        <h2 className="font-display text-2xl font-bold mb-4">Why Explainability Matters in Healthcare</h2>
        <p className="text-muted-foreground mb-4">
          A machine learning model might achieve 90% accuracy, but if a clinician cannot understand
          why it flagged a patient as high risk, they cannot act on it with confidence. Explainable
          AI bridges this gap — it doesn't just predict, it explains.
        </p>
        <p className="text-muted-foreground">
          In healthcare, explainability also builds patient trust. When a patient is told their BMI
          and physical inactivity are the primary drivers of their elevated risk, that is actionable
          information they can take to their doctor and act on.
        </p>
      </section>

      {/* SHAP */}
      <section>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">
              SHAP
              <span className="ml-2 text-base font-normal text-muted-foreground">
                SHapley Additive exPlanations
              </span>
            </h2>
            <p className="text-muted-foreground mb-4">
              SHAP is grounded in cooperative game theory. It asks: if each feature is a "player"
              in a game, how much does each one contribute to the final prediction?
            </p>
            <p className="text-muted-foreground mb-4">
              For every prediction, SHAP produces a value for each feature. Positive values push the
              prediction toward higher risk; negative values push it toward lower risk. The magnitude
              shows how strongly that feature influenced the outcome.
            </p>
            <div className="space-y-2">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs font-semibold mb-1">Global SHAP</p>
                <p className="text-sm text-muted-foreground">
                  Averaged across all predictions to show which features matter most for the model overall.
                  Glucose and BMI consistently rank highest.
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs font-semibold mb-1">Local SHAP (Waterfall)</p>
                <p className="text-sm text-muted-foreground">
                  For a single patient, shows exactly how each of their 14 features pushed the
                  prediction up or down from the baseline.
                </p>
              </div>
            </div>
          </div>

          {/* SHAP visual example */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-4">
              Example SHAP waterfall — single patient
            </p>
            <div className="space-y-2">
              {[
                { label: "Glucose",           value: +0.42, bar: 80  },
                { label: "BMI",               value: +0.21, bar: 40  },
                { label: "Age",               value: +0.13, bar: 25  },
                { label: "Hypertension",      value: +0.09, bar: 17  },
                { label: "Physical Activity", value: -0.11, bar: 21  },
                { label: "Income Level",      value: -0.06, bar: 11  },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-right text-muted-foreground shrink-0">
                    {f.label}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    {f.value > 0 ? (
                      <div
                        className="h-5 rounded-sm bg-red-400/80 text-white text-xs flex items-center justify-center"
                        style={{ width: `${f.bar}%` }}
                      >
                        +{f.value}
                      </div>
                    ) : (
                      <div
                        className="h-5 rounded-sm bg-health-400/80 text-white text-xs flex items-center justify-center ml-auto"
                        style={{ width: `${f.bar}%` }}
                      >
                        {f.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              🔴 Red = increases risk · 🟢 Green = decreases risk
            </p>
          </div>
        </div>
      </section>

      {/* LIME */}
      <section>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">
              LIME
              <span className="ml-2 text-base font-normal text-muted-foreground">
                Local Interpretable Model-Agnostic Explanations
              </span>
            </h2>
            <p className="text-muted-foreground mb-4">
              LIME works differently from SHAP. For a single prediction, it creates thousands
              of slightly perturbed versions of that patient's data, runs them through the model,
              and fits a simple linear model to approximate the complex model's behaviour locally.
            </p>
            <p className="text-muted-foreground mb-4">
              The result is a ranked list of feature conditions — readable statements like
              <em> "Glucose &gt; 140 increases risk"</em> — that explain this specific prediction
              in plain language.
            </p>
            <p className="text-muted-foreground">
              LIME is model-agnostic, meaning it works with any black-box model. This makes it a
              useful cross-check alongside SHAP.
            </p>
          </div>

          {/* LIME visual example */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-4">
              Example LIME explanation — same patient
            </p>
            <div className="space-y-2.5">
              {[
                { condition: "Glucose > 140",        weight: +0.38, dir: "increases" },
                { condition: "BMI > 30",             weight: +0.19, dir: "increases" },
                { condition: "Age category = 50–54", weight: +0.11, dir: "increases" },
                { condition: "No physical activity", weight: +0.09, dir: "increases" },
                { condition: "Income level ≥ 7",     weight: -0.08, dir: "decreases" },
                { condition: "No kidney disease",    weight: -0.06, dir: "decreases" },
              ].map((f) => (
                <div key={f.condition} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-xs">{f.condition}</span>
                  <span className={`text-xs font-semibold ${f.weight > 0 ? "text-red-500" : "text-health-500"}`}>
                    {f.dir} risk
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Human-readable conditions — not raw feature values.
            </p>
          </div>
        </div>
      </section>

      {/* SHAP vs LIME comparison */}
      <section className="rounded-xl border bg-muted/20 p-6">
        <h2 className="font-display text-xl font-bold mb-4">SHAP vs LIME — When We Use Each</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              method: "SHAP",
              uses: [
                "Global feature importance across all patients",
                "Waterfall plots in prediction results",
                "Batch analytics — population-level insights",
                "PDF report feature attribution table",
              ],
            },
            {
              method: "LIME",
              uses: [
                "Local explanation for individual predictions",
                "Plain-English condition statements",
                "Cross-checking SHAP for consistency",
                "Patient-facing explanations in reports",
              ],
            },
          ].map((m) => (
            <div key={m.method} className="rounded-lg border bg-card p-4">
              <p className="font-semibold mb-2">{m.method}</p>
              <ul className="space-y-1.5">
                {m.uses.map((u, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary-400 shrink-0">→</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
