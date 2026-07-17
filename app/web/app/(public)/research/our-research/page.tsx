import Image from "next/image";
import Link from "next/link";
import { Github, FileText } from "lucide-react";
import PageBackLink from "@/components/pagebacklink/PageBackLink";

const TEAM = [
  { name: "Stephen Mwaura",  github: "S-Mwaura",      role: "Project Lead · Modeling"          },
  { name: "Angela Masaki",   github: "MoonwaMasaki",   role: "Data Engineering · EDA"           },
  { name: "Diana Byegon",    github: "byegond-beep",   role: "Feature Engineering · Evaluation" },
  { name: "Kevin Kisengu",   github: "K-OK27",         role: "Explainability · XAI"             },
  { name: "Orandi Felix",    github: "Orandifelix",    role: "Documentation · Reporting"        },
];

const PIPELINE = [
  { step: "01", title: "Data Understanding",   desc: "BRFSS survey dataset — 14 clinical features, binary diabetes outcome." },
  { step: "02", title: "EDA",                  desc: "Class distribution, feature correlations, outlier analysis."          },
  { step: "03", title: "Feature Engineering",  desc: "Median imputation, StandardScaler, ordinal encoding."                 },
  { step: "04", title: "Model Training",        desc: "Six classifiers compared: LR, DT, RF, XGBoost, LightGBM, CatBoost." },
  { step: "05", title: "Evaluation",            desc: "Accuracy, F1, ROC-AUC, confusion matrix, 5-fold cross-validation."   },
  { step: "06", title: "Explainability",        desc: "SHAP global importance + LIME patient-level explanations."           },
];

export default function OurResearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
                <PageBackLink
  href="/research"
  label="Back to Research"
/>
      <div className="rounded-2xl border bg-card p-8 mb-12 text-center shadow-sm">
        <h1 className="font-display text-3xl font-bold mb-1">
          Diabetes Risk Prediction Using Machine Learning and Explainable AI
        </h1>
        <p className="text-muted-foreground text-sm mt-2 mb-4">
          {TEAM.map((m) => m.name).join(" · ")}
        </p>
        <p className="text-xs text-muted-foreground mb-5">Moringa School · Nairobi · 2026</p>
        <div className="flex justify-center gap-3">
          <a href="https://github.com/Orandifelix/diabetes-risk-prediction-xai" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <Github className="h-4 w-4" /> View on GitHub
          </a>
          <a href="/reports/final_report.pdf"
            className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
            <FileText className="h-4 w-4" /> Download Report
          </a>
        </div>
      </div>

      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Read the Full Paper</h2>
          <a href="/reports/final_report.pdf" download
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
            <FileText className="h-3.5 w-3.5" /> Download PDF
          </a>
        </div>
        {/* Native browser PDF viewer: gives page thumbnails, page-jump, search,
            and zoom out of the box — avoids a long single-scroll HTML page. */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm" style={{ height: "80vh" }}>
          <object data="/reports/final_report.pdf" type="application/pdf" width="100%" height="100%">
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Your browser can&apos;t preview PDFs inline.{" "}
              <a href="/reports/final_report.pdf" className="text-primary-500 underline ml-1">
                Open the PDF directly
              </a>
              .
            </div>
          </object>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display text-2xl font-bold mb-6">Methodology Pipeline</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PIPELINE.map((p) => (
            <div key={p.step} className="rounded-xl border bg-card p-5">
              <span className="font-mono text-xs text-primary-500 font-bold">{p.step}</span>
              <h3 className="font-semibold mt-1 mb-1.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display text-2xl font-bold mb-6">Authors</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM.map((member) => (
            <a key={member.github} href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:shadow-sm hover:border-primary-200 transition-all">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                {member.name[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
                <p className="text-xs text-primary-500">@{member.github}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
