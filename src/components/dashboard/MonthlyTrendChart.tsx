"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import type { MonthPoint } from "@/lib/dashboard-data";

const BLUE = "#2a78d6";
const ORANGE = "#eb6834";
const AQUA = "#1baf7a";

export function MonthlyTrendChart({ data }: { data: MonthPoint[] }) {
  const chartData = data.map((d) => ({ label: d.label, Ingresos: d.incomes, Gastos: d.expenses, Ahorro: d.savings }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={13} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(v) => formatMoneyCompact(v)}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="card px-3 py-2 text-xs shadow-lg">
                  <p className="mb-1 font-semibold capitalize">{String(label)}</p>
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
          <Line type="monotone" dataKey="Ingresos" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Gastos" stroke={ORANGE} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Ahorro" stroke={AQUA} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
