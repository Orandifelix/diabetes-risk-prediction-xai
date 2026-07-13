export default function ModelCardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 space-y-8">
      <div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Model Card
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">Model Card</h1>
        <p className="text-muted-foreground mt-2">
          Transparent documentation of what this model does, who it is for,
          and where it should and should not be used.
        </p>
      </div>

      {[
        {
          title: "Model Details",
          rows: [
            ["Model type",           "XGBoost binary classifier"],
            ["Version",              "1.0.0"],
            ["Trained",              "2026"],
            ["Framework",           "scikit-learn + XGBoost"],
            ["Input features",       "14 BRFSS clinical survey features"],
            ["Output",               "Binary (0 = No diabetes, 1 = Diabetes) + probability"],
            ["Explainability",       "SHAP (TreeExplainer) + LIME (LimeTabularExplainer)"],
          ],
        },
        {
          title: "Intended Use",
          rows: [
            ["Primary use",          "Population-level Type 2 diabetes risk screening"],
            ["Intended users",       "Healthcare researchers, public health practitioners, students"],
            ["Deployment context",   "Research and educational demonstration only"],
            ["Out-of-scope use",     "Clinical diagnosis, individual medical decisions without professional oversight"],
          ],
        },
        {
          title: "Training Data",
          rows: [
            ["Source",               "CDC Behavioral Risk Factor Surveillance System (BRFSS)"],
            ["Features",             "14 demographic, lifestyle, socioeconomic, and clinical variables"],
            ["Target variable",      "Self-reported diabetes diagnosis (binary)"],
            ["Class balance",        "Addressed using SMOTE oversampling on training set"],
            ["Train/test split",     "80% training, 20% held-out test set (stratified)"],
            ["Cross-validation",     "5-fold stratified cross-validation"],
          ],
        },
        {
          title: "Performance",
          rows: [
            ["Accuracy",  "0.7208"],
            ["F1-Score",  "0.4484"],
            ["ROC-AUC",   "0.8297"],
            ["Precision", "0.3123"],
            ["Recall",    "0.7943"],
          ],
        },
        {
          title: "Limitations",
          rows: [
            ["Population",           "Training data over-represents certain demographics (BRFSS survey population)"],
            ["Self-reported data",   "Features are self-reported, introducing potential recall and reporting bias"],
            ["Temporal",             "Model reflects disease patterns at time of training — may drift over time"],
            ["Geography",            "Trained on US survey data; may not generalise to other health systems or populations"],
            ["Diagnosis proxy",      "Target variable is self-reported diagnosis, not laboratory-confirmed"],
          ],
        },
        {
          title: "Ethical Considerations",
          rows: [
            ["Fairness",             "Model includes race/ethnicity and income as features — SHAP analysis should be monitored for disparate impact across groups"],
            ["Transparency",         "All predictions include SHAP explanations; no black-box outputs to end users"],
            ["Not a diagnosis",      "This tool must never be used as a substitute for clinical laboratory testing"],
            ["Data privacy",         "No patient data is stored beyond the session unless the user is authenticated and opts in"],
            ["Accountability",       "Predictions should always be reviewed by a qualified healthcare professional before action is taken"],
          ],
        },
      ].map((section) => (
        <div key={section.title} className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">{section.title}</h2>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {section.rows.map(([key, value]) => (
                <tr key={key} className="hover:bg-muted/10">
                  <td className="px-5 py-3 font-medium text-muted-foreground w-2/5">{key}</td>
                  <td className="px-5 py-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-5">
        <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">
          ⚠ Important Disclaimer
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          This model is developed for research and educational purposes as part of a Moringa School
          capstone project. It is not approved for clinical use. Predictions should never replace
          clinical laboratory testing or professional medical assessment.
        </p>
      </div>
    </div>
  );
}
