"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import type { CategoryTotal } from "@/lib/dashboard-data";

const BLUE = "#2a78d6";

export function CategoryBarChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const chartData = sorted.map((d) => ({ name: `${d.icon} ${d.category}`, amount: d.amount }));
  const height = Math.max(220, chartData.length * 38);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis type="number" tickFormatter={(v) => formatMoneyCompact(v)} stroke="var(--text-muted)" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            width={170}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              return (
                <div className="card px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold">{p.payload.name}</p>
                  <p className="text-[var(--text-secondary)]">{formatMoney(Number(p.value))}</p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="amount"
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            label={{ position: "right", fill: "var(--text-secondary)", fontSize: 12, formatter: (v: unknown) => formatMoney(Number(v)) }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={BLUE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-[var(--text-muted)]">
      Sin gastos en este período.
    </div>
  );
}
