export default function RiskFactorsPage() {
  const NON_MODIFIABLE = [
    { factor: "Age",              desc: "Risk increases significantly after 45. The model uses 13 age categories up to 80+." },
    { factor: "Family History",   desc: "Having a parent or sibling with Type 2 diabetes substantially increases your risk." },
    { factor: "Race/Ethnicity",   desc: "Higher prevalence in African American, Hispanic, Native American, and Asian populations." },
    { factor: "Sex",              desc: "Risk patterns differ between males and females, with females at higher risk post-menopause." },
  ];

  const MODIFIABLE = [
    { factor: "BMI / Obesity",        desc: "The single strongest modifiable predictor. BMI over 30 dramatically increases risk." },
    { factor: "Physical Inactivity",  desc: "Less than 150 minutes of moderate activity per week significantly elevates risk." },
    { factor: "Smoking",              desc: "Smokers are 30–40% more likely to develop Type 2 diabetes than non-smokers." },
    { factor: "High Blood Pressure",  desc: "Hypertension and diabetes share metabolic pathways and frequently co-occur." },
    { factor: "High Cholesterol",     desc: "Dyslipidemia is closely associated with insulin resistance and metabolic syndrome." },
    { factor: "Poor General Health",  desc: "Self-reported poor health is a reliable proxy for underlying chronic conditions." },
    { factor: "Income & Education",   desc: "Socioeconomic factors affect access to healthcare, healthy food, and safe exercise." },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Risk Factors
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">What Puts You at Risk?</h1>
        <p className="text-muted-foreground mt-2">
          Diabetes risk factors fall into two categories — those you can change, and those you cannot.
          Understanding both helps focus prevention efforts where they matter most.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <span className="h-6 w-1 rounded-full bg-slate-400 inline-block" />
          Non-Modifiable Risk Factors
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          These cannot be changed, but knowing them helps determine how often you should be screened.
        </p>
        <div className="space-y-3">
          {NON_MODIFIABLE.map((r) => (
            <div key={r.factor} className="rounded-xl border bg-card p-4">
              <p className="font-semibold text-sm">{r.factor}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <span className="h-6 w-1 rounded-full bg-health-500 inline-block" />
          Modifiable Risk Factors
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          These can be changed with lifestyle interventions — and doing so has a direct, measurable
          impact on reducing diabetes risk.
        </p>
        <div className="space-y-3">
          {MODIFIABLE.map((r) => (
            <div key={r.factor} className="rounded-xl border bg-card p-4 border-l-4 border-l-health-400">
              <p className="font-semibold text-sm">{r.factor}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <strong>Note:</strong> All 14 features used by our prediction model are drawn from these
        established risk factors. The model was trained on BRFSS survey data and uses SHAP to
        show which of your specific factors contributed most to your risk score.
      </div>
    </div>
  );
}
