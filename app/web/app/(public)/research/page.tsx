import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, Brain, Shield, Database } from "lucide-react";

const SECTIONS = [
  {
    href:  "/research/prior",
    icon:  BookOpen,
    title: "Prior Research",
    desc:  "8 peer-reviewed papers that informed our methodology and design decisions.",
    color: "primary",
    badge: "Literature Review",
  },
  {
    href:  "/research/our-research",
    icon:  FlaskConical,
    title: "Our Research",
    desc:  "Full methodology, pipeline diagrams, EDA figures, evaluation results, and team.",
    color: "success",
    badge: "Capstone Project",
  },
  {
    href:  "/research/xai",
    icon:  Brain,
    title: "XAI Explained",
    desc:  "Interactive guide to SHAP and LIME — how we make every prediction transparent.",
    color: "purple",
    badge: "Explainable AI",
  },
  {
    href:  "/research/model-card",
    icon:  Shield,
    title: "Model Card",
    desc:  "Intended use, limitations, ethical considerations, and performance metrics.",
    color: "warning",
    badge: "Responsible AI",
  },
  {
    href:  "/research/dataset",
    icon:  Database,
    title: "Dataset Explorer",
    desc:  "CDC BRFSS survey data — 14 features, their types, and ethics discussion.",
    color: "success",
    badge: "Data Documentation",
  },
];

const COLOR_MAP: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-health-50 text-health-600",
  purple:  "bg-purple-50 text-purple-600",
  warning: "bg-amber-50 text-amber-600",
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="text-center mb-12">
        <span className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Research
        </span>
        <h1 className="font-display text-4xl font-bold">Research & Methodology</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          From the literature that informed our work to the full technical methodology,
          explainability framework, and responsible AI documentation.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`rounded-lg p-2.5 ${COLOR_MAP[s.color]}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                {s.badge}
              </span>
            </div>
            <h2 className="font-semibold mb-1.5 group-hover:text-primary-600 transition-colors">
              {s.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
            <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
              Explore <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
