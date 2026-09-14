"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import type { PersonTotals } from "@/lib/dashboard-data";

const BLUE = "#2a78d6";
const ORANGE = "#eb6834";

export function PersonComparisonChart({ data }: { data: PersonTotals[] }) {
  const chartData = data.map((d) => ({ name: d.name, Ingresos: d.incomes, Gastos: d.expenses }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 4 }} barGap={6}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={13} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(v) => formatMoneyCompact(v)}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="card px-3 py-2 text-xs shadow-lg">
                  <p className="mb-1 font-semibold">{String(label)}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey as string} style={{ color: p.color }}>
                      {String(p.dataKey)}: {formatMoney(Number(p.value))}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }} />
          <Bar dataKey="Ingresos" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={48} />
          <Bar dataKey="Gastos" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
