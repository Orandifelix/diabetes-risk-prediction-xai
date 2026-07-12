"use client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, FileText } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Activity, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { exportBatchCsv, exportBatchPdf } from "@/lib/api";
import type { BatchAnalytics } from "@/types";
import { formatProbability } from "@/lib/utils";

interface BatchAnalyticsDisplayProps {
  analytics: BatchAnalytics;
}

const RISK_COLORS = {
  "High Risk":     "#EF4444",
  "Moderate Risk": "#F59E0B",
  "Low Risk":      "#10B981",
};

export function BatchAnalyticsDisplay({ analytics }: BatchAnalyticsDisplayProps) {
  const pieData = [
    { name: "High Risk",     value: analytics.high_risk_count,     pct: analytics.high_risk_pct     },
    { name: "Moderate Risk", value: analytics.moderate_risk_count, pct: analytics.moderate_risk_pct },
    { name: "Low Risk",      value: analytics.low_risk_count,      pct: analytics.low_risk_pct      },
  ];

  return (
    <div className="space-y-6">
      {/* Download cards — three risk groups + all */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { filter: "high",     label: "High Risk",     count: analytics.high_risk_count,     color: "danger"  },
          { filter: "moderate", label: "Moderate Risk", count: analytics.moderate_risk_count, color: "warning" },
          { filter: "low",      label: "Low Risk",      count: analytics.low_risk_count,      color: "success" },
          { filter: "all",      label: "All Patients",  count: analytics.total_rows,          color: "primary" },
        ].map(({ filter, label, count, color }) => (
          <a
            key={filter}
            href={exportBatchCsv(analytics.id, filter as any)}
            download
            className={`flex flex-col items-center rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer group`}
          >
            <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary-500 mb-2 transition-colors" />
            <p className="text-lg font-bold font-mono">{count}</p>
            <p className="text-xs text-muted-foreground text-center">{label}</p>
            <span className="mt-2 text-xs text-primary-500 font-medium">↓ CSV</span>
          </a>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Patients"  value={analytics.total_rows}                            icon={Users}         color="primary" />
        <StatCard title="High Risk"       value={`${analytics.high_risk_pct}%`}                   icon={AlertTriangle} color="danger"  />
        <StatCard title="Avg Risk Score"  value={formatProbability(analytics.avg_probability)}    icon={TrendingUp}    color="warning" />
        <StatCard title="Median Score"    value={formatProbability(analytics.median_probability)} icon={Activity}      color="success" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v, n, p) => [`${p.payload.pct}% (${v})`, p.payload.name]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk by age */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Average Risk by Age Group</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.risk_by_age} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="age_group" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Avg Risk"]} />
              <Bar dataKey="avg_probability" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk by BMI */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Average Risk by BMI Range</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.risk_by_bmi} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="bmi_range" tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Avg Risk"]} />
              <Bar dataKey="avg_probability" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top risk factors */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Top Population Risk Factors (Global SHAP)</h3>
          <div className="space-y-3 mt-2">
            {analytics.top_risk_factors.map((f, i) => (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{f.feature}</span>
                    <span className="text-muted-foreground">{f.importance.toFixed(4)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{
                        width: `${(f.importance / analytics.top_risk_factors[0].importance) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF summary download */}
      <div className="flex justify-end">
        <a
          href={exportBatchPdf(analytics.id)}
          download
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <FileText className="h-4 w-4" />
          Download Summary PDF
        </a>
      </div>
    </div>
  );
}
