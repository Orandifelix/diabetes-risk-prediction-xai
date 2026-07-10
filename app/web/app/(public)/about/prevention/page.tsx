export default function PreventionPage() {
  const STRATEGIES = [
    {
      category: "Physical Activity",
      color:    "health",
      items: [
        "Aim for 150 minutes of moderate aerobic activity per week (e.g. brisk walking)",
        "Include strength training at least twice a week",
        "Break up long periods of sitting with movement every 30 minutes",
        "Even short 10-minute walks after meals significantly reduce blood glucose spikes",
      ],
    },
    {
      category: "Diet",
      color:    "primary",
      items: [
        "Reduce refined carbohydrates and added sugars",
        "Increase fibre from vegetables, legumes, and wholegrains",
        "Choose healthy fats (avocado, nuts, olive oil) over saturated fats",
        "Control portion sizes — calorie reduction of 500–750 kcal/day aids weight loss",
      ],
    },
    {
      category: "Weight Management",
      color:    "warning",
      items: [
        "Losing 5–7% of body weight reduces progression from prediabetes by over 50%",
        "Even modest weight loss improves insulin sensitivity",
        "Focus on sustainable lifestyle changes rather than crash diets",
      ],
    },
    {
      category: "Screening & Monitoring",
      color:    "danger",
      items: [
        "Get fasting blood glucose or HbA1c tested at least every 3 years from age 35",
        "Screen earlier and more frequently if you have risk factors",
        "Monitor blood pressure and cholesterol regularly",
        "Use risk assessment tools to identify your personal risk profile",
      ],
    },
  ];

  const COLOR_MAP: Record<string, string> = {
    health:  "border-l-health-500",
    primary: "border-l-primary-500",
    warning: "border-l-amber-500",
    danger:  "border-l-red-500",
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8">
        <span className="rounded-full bg-health-100 px-3 py-1 text-xs font-semibold text-health-700">
          Prevention
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">Preventing Type 2 Diabetes</h1>
        <p className="text-muted-foreground mt-2">
          Type 2 diabetes is largely preventable. Research consistently shows that lifestyle
          interventions are more effective than medication for people at high risk.
        </p>
      </div>

      <div className="space-y-6">
        {STRATEGIES.map((s) => (
          <div key={s.category} className={`rounded-xl border bg-card p-5 border-l-4 ${COLOR_MAP[s.color]}`}>
            <h2 className="font-semibold mb-3">{s.category}</h2>
            <ul className="space-y-2">
              {s.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-health-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-primary-50 dark:bg-primary-950/30 border-primary-200 p-5">
        <p className="font-semibold text-primary-700 text-sm mb-2">The evidence is clear</p>
        <p className="text-sm text-primary-600">
          The Diabetes Prevention Program — a landmark US clinical trial — found that lifestyle
          intervention reduced diabetes incidence by 58% over 3 years in high-risk adults.
          The same intervention in adults over 60 reduced incidence by 71%.
        </p>
      </div>
    </div>
  );
}
