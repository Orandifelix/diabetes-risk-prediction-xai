import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-display font-bold text-primary-600 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500">
                <Activity className="h-4 w-4 text-white" />
              </div>
              DiabetesRisk
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              An end-to-end machine learning platform for Type 2 diabetes risk prediction
              with SHAP and LIME explainability.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Moringa School Capstone · Nairobi · 2026
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary-600">About Diabetes</Link></li>
              <li><Link href="/research" className="hover:text-primary-600">Research</Link></li>
              <li><Link href="/risk-assessment" className="hover:text-primary-600">Risk Assessment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Research</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/research/prior" className="hover:text-primary-600">Prior Research</Link></li>
              <li><Link href="/research/our-research" className="hover:text-primary-600">Our Research</Link></li>
              <li><Link href="/research/xai" className="hover:text-primary-600">XAI Explained</Link></li>
              <li><Link href="/research/model-card" className="hover:text-primary-600">Model Card</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Diabetes Risk Predictor. MIT License.</p>
          <p className="text-center">
            ⚠ For research and educational purposes only. Not a clinical diagnosis tool.
          </p>
          <a
            href="https://github.com/Orandifelix/diabetes-risk-prediction-xai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600"
          >
            GitHub →
          </a>
        </div>
      </div>
    </footer>
  );
}
