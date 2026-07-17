import PageBackLink from "@/components/pagebacklink/PageBackLink";

export default function WhatIsDiabetesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-14 prose prose-slate dark:prose-invert prose-headings:font-display">
      <PageBackLink
  href="/about"
  label="Back to About Diabetes"
/>
      <div className="not-prose mb-8">
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Health Education
        </span>
        <h1 className="font-display text-3xl font-bold mt-3">What is Diabetes?</h1>
        <p className="text-muted-foreground mt-2">
          A clear explanation of how the body regulates glucose and what goes wrong in Type 2 diabetes.
        </p>
      </div>

      <h2>How the Body Regulates Glucose</h2>
      <p>
        Every time you eat, your digestive system breaks carbohydrates down into glucose — a simple sugar
        that your cells use for energy. For glucose to enter your cells, it needs a hormone called
        <strong> insulin</strong>, which is produced by beta cells in your pancreas.
      </p>
      <p>
        Think of insulin as a key and your cell as a locked door. When insulin binds to receptors on your
        cells, it opens a channel that allows glucose to flow in. In a healthy person, blood glucose rises
        after eating, the pancreas releases insulin, glucose enters cells, and blood glucose returns to
        normal levels within a couple of hours.
      </p>

      <h2>What Goes Wrong in Type 2 Diabetes</h2>
      <p>
        In Type 2 diabetes, two problems develop — often together:
      </p>
      <ol>
        <li>
          <strong>Insulin resistance:</strong> Cells in your muscles, fat, and liver stop responding
          properly to insulin. The key no longer fits the lock well. Your pancreas compensates by
          producing more and more insulin to force glucose into cells.
        </li>
        <li>
          <strong>Beta cell exhaustion:</strong> Over years of overworking, the pancreas can no longer
          keep up. Insulin production drops. Without enough insulin, glucose builds up in the bloodstream
          — a state called <strong>hyperglycemia</strong>.
        </li>
      </ol>
      <p>
        Chronically elevated blood glucose damages blood vessels and nerves throughout the body, leading
        to the complications associated with diabetes — kidney disease, vision loss, nerve damage, and
        increased cardiovascular risk.
      </p>

      <h2>Prediabetes — The Warning Stage</h2>
      <p>
        Before Type 2 diabetes fully develops, most people pass through a stage called
        <strong> prediabetes</strong>. Blood glucose is higher than normal but not yet high enough
        to be classified as diabetes. This stage is critical — intervention here can prevent or
        significantly delay full onset.
      </p>
      <p>
        Prediabetes often has no symptoms, which is why screening matters. An estimated 96 million
        adults in the US alone have prediabetes, and more than 80% don't know it.
      </p>

      <h2>Why Early Detection Matters</h2>
      <p>
        Type 2 diabetes develops slowly over years. Catching it early — or catching the risk factors
        before it develops — allows for lifestyle interventions that are far more effective than
        medication after the fact. Research shows that modest weight loss (5–7% of body weight) and
        150 minutes of weekly physical activity can reduce progression from prediabetes to diabetes
        by over 50%.
      </p>
      <p>
        This is precisely why machine learning–based risk screening tools like this one matter:
        they can identify at-risk individuals using routine health data, long before symptoms appear.
      </p>

      <div className="not-prose mt-8 rounded-xl border border-primary-200 bg-primary-50 dark:bg-primary-950/30 p-5">
        <p className="text-sm font-semibold text-primary-700 mb-1">Ready to assess your risk?</p>
        <p className="text-sm text-primary-600 mb-3">
          Answer 14 clinical questions and receive your personalised diabetes risk score with an
          AI explanation of the factors driving it.
        </p>
        <a
          href="/risk-assessment"
          className="inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          Start Risk Assessment →
        </a>
      </div>
    </article>
  );
}
