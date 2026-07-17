import PageBackLink from "@/components/pagebacklink/PageBackLink";

export default function DatasetPage() {
  const FEATURES = [
    { name: "_BMI5",    label: "BMI",                    type: "Continuous",  desc: "Body mass index (weight/height²)"                              },
    { name: "_AGE80",   label: "Age",                    type: "Ordinal",     desc: "Age category 1–13 (18–24 to 80+)"                             },
    { name: "SEXVAR",   label: "Sex",                    type: "Binary",      desc: "Biological sex (1=Male, 2=Female)"                            },
    { name: "_IMPRACE", label: "Race/Ethnicity",         type: "Nominal",     desc: "Race/ethnicity category 1–6"                                  },
    { name: "GENHLTH",  label: "General Health",         type: "Ordinal",     desc: "Self-rated health 1 (Excellent) to 5 (Poor)"                 },
    { name: "PHYSHLTH", label: "Physical Health Days",   type: "Continuous",  desc: "Days of poor physical health in past 30"                      },
    { name: "SMOKE100", label: "Smoking",                type: "Binary",      desc: "Smoked 100+ cigarettes in lifetime (1=Yes, 2=No)"             },
    { name: "_TOTINDA", label: "Physical Activity",      type: "Binary",      desc: "Any physical activity in past 30 days (1=Yes, 2=No)"          },
    { name: "EDUCA",    label: "Education Level",        type: "Ordinal",     desc: "Highest education level 1–6"                                  },
    { name: "INCOME3",  label: "Income Level",           type: "Ordinal",     desc: "Annual household income 1–11"                                 },
    { name: "_RFHYPE6", label: "Hypertension",           type: "Binary",      desc: "Told have high blood pressure (1=No, 2=Yes)"                 },
    { name: "_RFCHOL3", label: "High Cholesterol",       type: "Binary",      desc: "Told cholesterol is high (1=No, 2=Yes)"                      },
    { name: "CHCKDNY2", label: "Kidney Disease",         type: "Binary",      desc: "Told have kidney disease (1=No, 2=Yes)"                      },
    { name: "_MICHD",   label: "Heart Disease",          type: "Binary",      desc: "Heart disease or heart attack (0=No, 1=Yes)"                 },
  ];

  const TYPE_COLORS: Record<string, string> = {
    Continuous: "bg-primary-50 text-primary-700",
    Ordinal:    "bg-purple-50 text-purple-700",
    Binary:     "bg-health-50 text-health-700",
    Nominal:    "bg-amber-50 text-amber-700",
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14 space-y-8">
      <PageBackLink
  href="/research"
  label="Back to Research"
/>
      <div>
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Dataset
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">Dataset Explorer</h1>
        <p className="text-muted-foreground mt-2">
          The model is trained on the CDC Behavioral Risk Factor Surveillance System (BRFSS) dataset —
          an annual telephone survey collecting health-related data across the US.
        </p>
      </div>

      {/* Dataset metadata */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Source",    value: "CDC BRFSS Survey" },
          { label: "Features",  value: "14 clinical variables" },
          { label: "Target",    value: "Binary diabetes diagnosis" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold font-mono text-primary-600">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Feature table */}
      <div>
        <h2 className="font-semibold mb-4">Feature Reference</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Raw Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Label</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {FEATURES.map((f) => (
                <tr key={f.name} className="hover:bg-muted/10">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.name}</td>
                  <td className="px-4 py-3 font-medium">{f.label}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[f.type]}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ethics */}
      <div className="rounded-xl border bg-muted/20 p-5">
        <h3 className="font-semibold text-sm mb-3">Ethics & Limitations</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary-400 shrink-0">→</span>Data is self-reported — subject to recall and social desirability bias.</li>
          <li className="flex gap-2"><span className="text-primary-400 shrink-0">→</span>BRFSS over-represents certain demographics; model may not generalise equally across all populations.</li>
          <li className="flex gap-2"><span className="text-primary-400 shrink-0">→</span>Diabetes diagnosis in the dataset is self-reported, not laboratory-confirmed.</li>
          <li className="flex gap-2"><span className="text-primary-400 shrink-0">→</span>Socioeconomic features (income, education) are included as legitimate risk factors but require careful interpretation in SHAP analysis.</li>
        </ul>
      </div>
    </div>
  );
}
