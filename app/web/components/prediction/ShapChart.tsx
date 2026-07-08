"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";

interface ShapChartProps {
  shapLabels: Record<string, number>;
  title?:     string;
}

export function ShapChart({ shapLabels, title = "Feature Contributions (SHAP)" }: ShapChartProps) {
  const data = Object.entries(shapLabels)
    .map(([feature, value]) => ({ feature, value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 10)
    .reverse(); // bottom-up for readability

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { feature, value } = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
        <p className="font-medium">{feature}</p>
        <p style={{ color: value > 0 ? "#EF4444" : "#10B981" }}>
          {value > 0 ? "↑ Increases" : "↓ Decreases"} risk by{" "}
          <strong>{Math.abs(value).toFixed(4)}</strong>
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Red bars increase diabetes risk · Green bars decrease it
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v.toFixed(3)}
            domain={["auto", "auto"]}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fontSize: 11 }}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#64748B" strokeWidth={1.5} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value > 0 ? "#EF4444" : "#10B981"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
