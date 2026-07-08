export default function ProgressionPage() {
  const STAGES = [
    {
      stage:    "Healthy",
      color:    "bg-health-500",
      label:    "Stage 0",
      desc:     "Normal blood glucose. Insulin functions correctly. Lifestyle maintenance sustains this stage.",
      hba1c:    "< 5.7%",
      fasting:  "< 100 mg/dL",
      reversible: "Maintain",
    },
    {
      stage:    "Insulin Resistance",
      color:    "bg-primary-400",
      label:    "Early Stage",
      desc:     "Cells begin resisting insulin. The pancreas compensates by producing more. No symptoms yet.",
      hba1c:    "5.7–6.0%",
      fasting:  "100–110 mg/dL",
      reversible: "Fully reversible",
    },
    {
      stage:    "Prediabetes",
      color:    "bg-amber-500",
      label:    "Warning Stage",
      desc:     "Blood glucose is elevated but not yet diagnostic. High intervention opportunity.",
      hba1c:    "5.7–6.4%",
      fasting:  "100–125 mg/dL",
      reversible: "Largely reversible",
    },
    {
      stage:    "Type 2 Diabetes",
      color:    "bg-orange-500",
      label:    "Diagnosis",
      desc:     "Chronic hyperglycemia. Beta cell function significantly impaired. Medication usually required.",
      hba1c:    "≥ 6.5%",
      fasting:  "≥ 126 mg/dL",
      reversible: "Manageable, some remission possible",
    },
    {
      stage:    "Complications",
      color:    "bg-red-600",
      label:    "Advanced",
      desc:     "Long-term high glucose damages kidneys, eyes, nerves, and blood vessels.",
      hba1c:    "Uncontrolled",
      fasting:  "Chronically elevated",
      reversible: "Partially manageable",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Disease Progression
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">How Diabetes Progresses</h1>
        <p className="text-muted-foreground mt-2">
          Type 2 diabetes develops over years — often decades. Each stage represents a window
          for intervention. Earlier is always better.
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

        <div className="space-y-6">
          {STAGES.map((s, i) => (
            <div key={s.stage} className="flex gap-4 relative">
              {/* Dot */}
              <div className={`h-10 w-10 rounded-full ${s.color} shrink-0 flex items-center justify-center text-white text-xs font-bold z-10`}>
                {i + 1}
              </div>
              {/* Content */}
              <div className="flex-1 rounded-xl border bg-card p-4 -mt-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold">{s.stage}</h2>
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground">HbA1c: </span>
                    <span>{s.hba1c}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Fasting: </span>
                    <span>{s.fasting}</span>
                  </div>
                  <div>
                    <span className={`font-semibold ${i < 3 ? "text-health-600" : "text-amber-600"}`}>
                      {s.reversible}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-health-50 dark:bg-health-950/30 border-health-200 p-5">
        <p className="font-semibold text-health-700 text-sm mb-1">
          The window of opportunity is wide — if you act early
        </p>
        <p className="text-sm text-health-600">
          The first three stages are reversible or manageable with lifestyle changes alone.
          This is why early risk screening — like this platform provides — is so valuable.
        </p>
      </div>
    </div>
  );
}
