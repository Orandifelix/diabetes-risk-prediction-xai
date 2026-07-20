import PageBackLink from "@/components/pagebacklink/PageBackLink";

export default function WhatIsDiabetesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-14 prose prose-slate dark:prose-invert prose-headings:font-display">
      <PageBackLink href="/about" label="Back to About Diabetes" />

      {/* Header */}
      <div className="not-prose mb-10">
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Health Education
        </span>
        <h1 className="font-display text-4xl font-bold mt-3 tracking-tight">
          What is Diabetes?
        </h1>
        <p className="text-muted-foreground mt-2 text-lg leading-relaxed">
          Understand how your body regulates blood sugar, what changes occur in
          Type 2 diabetes, and why early detection is essential for preventing
          long‑term complications.
        </p>
      </div>

      {/* 1. How the Body Regulates Blood Glucose */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold border-b border-primary-200 dark:border-primary-700 pb-2 mb-5">
          How the Body Regulates Blood Glucose
        </h2>

        <p className="mb-4">
          Every time you eat, your digestive system breaks carbohydrates into
          <strong> glucose</strong> a simple sugar that serves as your body’s
          primary source of energy. Glucose travels through the bloodstream, but
          it cannot enter most cells on its own. To move from the blood into the
          body’s tissues, it requires a hormone called <strong>insulin</strong>,
          which is produced by specialised beta cells in the pancreas.
        </p>

        <p className="mb-4">
          Think of insulin as a key and your cells as locked doors. When insulin
          attaches to receptors on a cell, it unlocks the door and allows
          glucose to enter, where it is used for energy or stored for later use.
        </p>

        <p className="mb-0">
          In a healthy person, blood glucose rises after a meal; the pancreas
          releases insulin; glucose moves into the cells; and blood sugar
          returns to a normal range within a few hours.
        </p>
      </section>

      {/* 2. What Happens in Type 2 Diabetes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold border-b border-primary-200 dark:border-primary-700 pb-2 mb-5">
          What Happens in Type 2 Diabetes?
        </h2>

        <p className="mb-4">
          Type 2 diabetes develops gradually and is usually caused by two
          related problems that often occur together:
        </p>

        <ol className="list-decimal pl-6 space-y-3 mb-4">
          <li>
            <strong>Insulin resistance.</strong> The body’s muscle, liver, and
            fat cells gradually become less responsive to insulin. Although
            insulin is still present, it no longer works efficiently. To
            compensate, the pancreas produces increasing amounts of insulin in
            an attempt to keep blood glucose under control.
          </li>
          <li>
            <strong>Beta‑cell exhaustion.</strong> After years of producing
            extra insulin, the pancreas begins to lose its ability to keep up
            with the body’s demands. Insulin production falls, causing glucose
            to remain in the bloodstream rather than entering the cells. This
            persistent elevation in blood glucose is known as{" "}
            <strong>hyperglycaemia</strong>.
          </li>
        </ol>

        <p className="mb-0">
          Over time, high blood sugar damages blood vessels and nerves
          throughout the body. This can lead to serious complications,
          including heart disease, stroke, kidney disease, nerve damage,
          vision loss, and poor wound healing if diabetes is not properly
          managed.
        </p>
      </section>

      {/* 3. Prediabetes: The Warning Stage */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold border-b border-primary-200 dark:border-primary-700 pb-2 mb-5">
          Prediabetes: The Warning Stage
        </h2>

        <p className="mb-4">
          Before Type 2 diabetes develops, many people experience a condition
          known as <strong>prediabetes</strong>. During this stage, blood
          glucose levels are higher than normal but not yet high enough to meet
          the clinical criteria for diabetes. Prediabetes serves as an early
          warning sign that the body’s glucose regulation is beginning to fail.
        </p>

        <p className="mb-0">
          One of the biggest challenges is that prediabetes rarely causes
          obvious symptoms. As a result, many people remain unaware they are at
          increased risk until diabetes has already developed. Early screening
          is therefore essential, because lifestyle changes at this stage can
          often prevent or significantly delay the onset of Type 2 diabetes.
        </p>
      </section>

      {/* 4. Why Early Detection Matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold border-b border-primary-200 dark:border-primary-700 pb-2 mb-5">
          Why Early Detection Matters
        </h2>

        <p className="mb-4">
          Type 2 diabetes usually develops slowly over many years. Identifying
          people at risk before symptoms appear creates an opportunity to take
          preventive action while the disease is still reversible or manageable.
        </p>

        <div className="not-prose bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-xl p-5 my-6">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">
            Evidence‑based fact
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-200">
            Losing just <strong>5–7% of body weight</strong> and engaging in at
            least <strong>150 minutes of moderate physical activity</strong> each
            week can reduce the likelihood of progressing from prediabetes to
            Type 2 diabetes by more than half in many individuals.
          </p>
        </div>

        <p className="mb-0">
          This is where machine learning–based risk assessment tools become
          valuable. By analysing routine health information, they can identify
          individuals who may be at increased risk long before symptoms develop.
          Rather than replacing healthcare professionals, these tools support
          earlier screening, encourage healthier lifestyle choices, and help
          users seek timely medical advice when necessary.
        </p>
      </section>

      {/* CTA */}
      <div className="not-prose mt-10 rounded-xl border border-primary-200 bg-primary-50 dark:bg-primary-950/30 p-6">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">
          Ready to assess your risk?
        </p>
        <p className="text-sm text-primary-600 dark:text-primary-200 mb-4">
          Complete a short assessment based on 14 clinical and lifestyle
          factors to receive your personalised diabetes risk score together
          with an AI‑powered explanation of the factors contributing to your
          result.
        </p>
        <a
          href="/risk-assessment"
          className="inline-block rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          Start Risk Assessment →
        </a>
      </div>
    </article>
  );
}