import Link from "next/link";
import { ArrowRight, Heart, AlertTriangle, Shield, TrendingUp, Eye, Activity } from "lucide-react";

const SECTIONS = [
  {
    href:  "/about/what-is-diabetes",
    icon:  Heart,
    title: "What is Diabetes?",
    desc:  "How the body regulates glucose and what goes wrong in Type 2 diabetes.",
    color: "primary",
  },
  {
    href:  "/about/types",
    icon:  Activity,
    title: "Types of Diabetes",
    desc:  "Type 1, Type 2, gestational diabetes, and prediabetes explained.",
    color: "success",
  },
  {
    href:  "/about/risk-factors",
    icon:  AlertTriangle,
    title: "Risk Factors",
    desc:  "Modifiable and non-modifiable factors that increase your risk.",
    color: "warning",
  },
  {
    href:  "/about/symptoms",
    icon:  Eye,
    title: "Symptoms",
    desc:  "Early warning signs and symptoms of Type 2 diabetes.",
    color: "danger",
  },
  {
    href:  "/about/progression",
    icon:  TrendingUp,
    title: "Disease Progression",
    desc:  "From healthy to insulin resistance to T2DM and complications.",
    color: "warning",
  },
  {
    href:  "/about/prevention",
    icon:  Shield,
    title: "Prevention",
    desc:  "Evidence-based lifestyle changes that reduce diabetes risk.",
    color: "success",
  },
];

const COLOR_MAP: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600 dark:bg-primary-950/30",
  success: "bg-health-50 text-health-600 dark:bg-health-950/30",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
  danger:  "bg-red-50 text-red-600 dark:bg-red-950/30",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="text-center mb-12">
        <span className="mb-3 inline-block rounded-full bg-health-100 px-3 py-1 text-xs font-semibold text-health-700">
          Health Education
        </span>
        <h1 className="font-display text-4xl font-bold">About Diabetes</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Understanding Type 2 diabetes — what it is, who is at risk, and how
          early detection and lifestyle changes can prevent or delay onset.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className={`rounded-lg p-2.5 w-fit mb-4 ${COLOR_MAP[s.color]}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold mb-1.5 group-hover:text-primary-600 transition-colors">
              {s.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
            <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
