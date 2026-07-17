import PageBackLink from "@/components/pagebacklink/PageBackLink";

export default function SymptomsPage() {
  const SYMPTOMS = [
    { emoji: "💧", title: "Increased Thirst",      desc: "Excess glucose pulls fluid from tissues, making you constantly thirsty."                     },
    { emoji: "🚽", title: "Frequent Urination",     desc: "Your kidneys work overtime to filter excess sugar, producing more urine."                    },
    { emoji: "😴", title: "Fatigue",                desc: "Cells deprived of glucose have less energy, causing persistent tiredness."                   },
    { emoji: "👁",  title: "Blurred Vision",         desc: "High blood sugar causes the lens of the eye to swell, affecting focus."                      },
    { emoji: "🩹", title: "Slow Wound Healing",     desc: "Elevated glucose impairs circulation and immune response, slowing recovery."                  },
    { emoji: "⚖️", title: "Unexplained Weight Loss", desc: "Without glucose entering cells, the body burns fat and muscle for energy."                   },
    { emoji: "🦶", title: "Tingling or Numbness",   desc: "High blood sugar damages nerves (neuropathy), often starting in hands and feet."             },
    { emoji: "🍽", title: "Increased Hunger",       desc: "Cells not receiving glucose signal the brain for more food despite eating."                   },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <PageBackLink
  href="/about"
  label="Back to About Diabetes"
/>
      <div className="mb-8">
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Symptoms
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">Signs and Symptoms</h1>
        <p className="text-muted-foreground mt-2">
          Type 2 diabetes often develops slowly. Many people have it for years without knowing.
          These are the warning signs to watch for.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {SYMPTOMS.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-4 flex gap-3">
            <span className="text-2xl shrink-0">{s.emoji}</span>
            <div>
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-5">
        <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">
          ⚠ Many people have no symptoms at all
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Type 2 diabetes is often discovered during routine blood work. This is why regular
          screening matters — especially if you have risk factors. Do not wait for symptoms
          before getting checked.
        </p>
      </div>
    </div>
  );
}
