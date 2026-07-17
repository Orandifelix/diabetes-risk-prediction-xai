"use client";
import { motion } from "framer-motion";
import { ExternalLink, BookOpen } from "lucide-react";
import { RESEARCH_PAPERS } from "@/lib/constants";
import PageBackLink from "@/components/pagebacklink/PageBackLink";

export default function PriorResearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
                <PageBackLink
  href="/research"
  label="Back to Research"
/>
      <div className="text-center mb-12">
        <span className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          Literature Review
        </span>
        <h1 className="font-display text-4xl font-bold">Prior Research</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          This project builds on a foundation of peer-reviewed research in machine learning,
          explainable AI, and diabetes prediction. Below are the key studies that informed
          our methodology and design decisions.
        </p>
      </div>

      <div className="grid gap-5">
        {RESEARCH_PAPERS.map((paper, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Authors + year */}
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    {paper.authors} · {paper.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base mb-0.5">{paper.title}</h3>
                <p className="text-xs text-muted-foreground italic mb-3">
                  {paper.journal}, {paper.volume}
                </p>

                {/* Key finding */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Key Finding
                  </p>
                  <p className="text-sm">{paper.keyFinding}</p>
                </div>

                {/* Relevance */}
                <div className="rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-800 p-3">
                  <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-0.5">
                    Relevance to our work
                  </p>
                  <p className="text-sm text-primary-800 dark:text-primary-200">{paper.relevance}</p>
                </div>
              </div>

              {/* Link */}
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                Read Paper
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {paper.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
