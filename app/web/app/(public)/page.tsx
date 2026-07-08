"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiskGauge } from "@/components/prediction/RiskGauge";
import { ArrowRight, Shield, Brain, BarChart2, Users } from "lucide-react";

const STATS = [
  { value: "537M+", label: "Adults with diabetes globally" },
  { value: "90%",   label: "Are Type 2 diabetes cases"    },
  { value: "85%+",  label: "Model accuracy"               },
  { value: "14",    label: "Clinical risk factors used"   },
];

const FEATURES = [
  {
    icon: Brain,
    title:       "XGBoost Classifier",
    description: "Trained on BRFSS clinical survey data across 14 established risk factors.",
    color:       "primary",
  },
  {
    icon: Shield,
    title:       "SHAP Explainability",
    description: "Every prediction comes with a clear explanation of which factors drove it.",
    color:       "success",
  },
  {
    icon: BarChart2,
    title:       "Batch Analytics",
    description: "Upload a CSV of patients and get population-level risk analytics instantly.",
    color:       "warning",
  },
  {
    icon: Users,
    title:       "Clinician-Friendly",
    description: "Risk broken down by age, BMI, and lifestyle — ready for clinical review.",
    color:       "primary",
  },
];

const COLOR_MAP: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-health-50 text-health-600",
  warning: "bg-amber-50 text-amber-600",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-health-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold text-primary-700">
              Moringa School Capstone · 2026
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
              Know your risk{" "}
              <span className="text-primary-500">before</span> it becomes
              your reality
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              An end-to-end Type 2 diabetes risk prediction platform powered by
              XGBoost and Explainable AI — providing accurate predictions and
              transparent, clinician-friendly explanations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/risk-assessment"
                className="flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
              >
                Check Your Risk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/research/our-research"
                className="flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-muted transition-colors"
              >
                View Research
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-primary-100 blur-3xl opacity-50" />
              <div className="relative rounded-3xl border bg-card p-8 shadow-xl">
                <p className="text-center text-sm text-muted-foreground mb-4 font-medium">
                  Sample Prediction Result
                </p>
                <RiskGauge probability={0.73} riskLevel="High Risk" size="lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A complete ML pipeline from clinical data to explainable predictions
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className={`rounded-lg p-2.5 w-fit mb-4 ${COLOR_MAP[f.color]}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to assess your risk?
          </h2>
          <p className="text-primary-100 mb-8">
            Answer 14 clinical questions and get your personalised diabetes risk
            score with SHAP explanations — no account required.
          </p>
          <Link
            href="/risk-assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-primary-600 hover:bg-primary-50 transition-colors shadow-lg"
          >
            Start Risk Assessment
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
