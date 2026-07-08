export default function TypesPage() {
  const TYPES = [
    {
      type:    "Type 1 Diabetes",
      emoji:   "🔵",
      pct:     "~5–10%",
      onset:   "Usually childhood/young adult",
      cause:   "Autoimmune — the immune system destroys insulin-producing beta cells.",
      management: "Requires insulin therapy for life. Not preventable.",
      highlight: false,
    },
    {
      type:    "Type 2 Diabetes",
      emoji:   "🔴",
      pct:     "~90–95%",
      onset:   "Usually adult (increasingly younger)",
      cause:   "Insulin resistance + beta cell exhaustion, driven by lifestyle and genetics.",
      management: "Lifestyle intervention, oral medication, and sometimes insulin.",
      highlight: true,
    },
    {
      type:    "Prediabetes",
      emoji:   "🟡",
      pct:     "Precursor state",
      onset:   "Any age",
      cause:   "Blood glucose above normal but below the diabetes threshold.",
      management: "Highly reversible with diet and physical activity changes.",
      highlight: false,
    },
    {
      type:    "Gestational Diabetes",
      emoji:   "🟢",
      pct:     "~2–10% of pregnancies",
      onset:   "During pregnancy",
      cause:   "Hormonal changes during pregnancy cause insulin resistance.",
      management: "Diet, exercise, sometimes insulin. Resolves after birth but increases T2D risk.",
      highlight: false,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8">
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Types
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">Types of Diabetes</h1>
        <p className="text-muted-foreground mt-2">
          Diabetes is not a single disease. Understanding the differences between types
          is essential for appropriate prevention and management.
        </p>
      </div>

      <div className="space-y-4">
        {TYPES.map((t) => (
          <div
            key={t.type}
            className={`rounded-xl border bg-card p-5 ${
              t.highlight ? "border-red-200 dark:border-red-800 shadow-sm" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <span>{t.emoji}</span>
                {t.type}
                {t.highlight && (
                  <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    This tool predicts this type
                  </span>
                )}
              </h2>
              <span className="text-xs font-mono text-muted-foreground">{t.pct}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Onset</p>
                <p>{t.onset}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cause</p>
                <p>{t.cause}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Management</p>
                <p>{t.management}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
