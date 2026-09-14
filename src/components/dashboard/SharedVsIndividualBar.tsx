import { formatMoney, formatPercent } from "@/lib/format";

const BLUE = "#2a78d6"; // individual
const ORANGE = "#eb6834"; // compartido

export function SharedVsIndividualBar({ shared, individual }: { shared: number; individual: number }) {
  const total = shared + individual;
  const sharedPct = total > 0 ? (shared / total) * 100 : 0;
  const individualPct = 100 - sharedPct;

  if (total === 0) {
    return <div className="flex h-24 items-center justify-center text-sm text-[var(--text-muted)]">Sin gastos en este período.</div>;
  }

  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden rounded-full border border-[var(--border)]" role="img" aria-label={`Individual ${formatPercent(individualPct)}, compartido ${formatPercent(sharedPct)}`}>
        {individualPct > 0 && (
          <div style={{ width: `${individualPct}%`, background: BLUE }} className="h-full" />
        )}
        {sharedPct > 0 && (
          <div style={{ width: `${sharedPct}%`, background: ORANGE }} className="h-full border-l-2 border-[var(--surface-1)]" />
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <Legend color={BLUE} label="Individual" amount={individual} pct={individualPct} />
        <Legend color={ORANGE} label="Compartido" amount={shared} pct={sharedPct} />
      </div>
    </div>
  );
}

function Legend({ color, label, amount, pct }: { color: string; label: string; amount: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-semibold">{formatMoney(amount)}</span>
      <span className="text-xs text-[var(--text-muted)]">({formatPercent(pct)})</span>
    </div>
  );
}
