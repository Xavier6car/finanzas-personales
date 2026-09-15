import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { computeSettlement, type SharedExpenseLike } from "@/lib/settlement";
import { categoryIcon } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import type { PeriodKey } from "@/lib/period";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

interface ExpenseRow extends SharedExpenseLike {
  category: string;
  description: string;
  date: Date;
}

export function SettlementView({
  users,
  expenses,
  settlementMode,
  period,
  start,
  end,
}: {
  users: UserOption[];
  expenses: ExpenseRow[];
  settlementMode: "REEMBOLSO" | "PRESUPUESTO";
  period: PeriodKey;
  start?: string;
  end?: string;
}) {
  const result = computeSettlement(expenses, users);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Saldos entre nosotros</h1>
        <PeriodSelector current={period} start={start} end={end} />
      </div>

      {settlementMode === "PRESUPUESTO" && (
        <div className="card border-l-4 p-4 text-sm" style={{ borderLeftColor: "var(--brand)" }}>
          <strong>Modo presupuestario activo:</strong> solo se informa cuánto ha pagado cada quien en gastos
          compartidos, sin generar deudas ni sugerir reembolsos. Cámbialo en Ajustes.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.perUser.map((u) => {
          const color = users.find((x) => x.id === u.userId)?.color ?? "var(--brand)";
          return (
            <div key={u.userId} className="card p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <p className="font-semibold">{u.name}</p>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Pagó en compartidos</dt>
                  <dd className="font-medium">{formatMoney(u.paid)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Le corresponde asumir</dt>
                  <dd className="font-medium">{formatMoney(u.owed)}</dd>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-1">
                  <dt className="font-medium">{u.net >= 0 ? "Adelantó" : "Debe"}</dt>
                  <dd className={`font-bold ${u.net >= 0 ? "text-good" : "text-critical"}`}>
                    {formatMoney(Math.abs(u.net))}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {settlementMode === "REEMBOLSO" && (
        <div className="card p-5 text-center">
          {result.settlement ? (
            <p className="text-lg">
              <strong>{result.settlement.fromName}</strong> le debe pagar a <strong>{result.settlement.toName}</strong>{" "}
              <span className="font-bold text-brand">{formatMoney(result.settlement.amount)}</span> para saldar cuentas.
            </p>
          ) : (
            <p className="flex items-center justify-center gap-1.5 text-lg font-medium text-good">
              <CheckCircle size={20} weight="bold" /> Están al día, no hay saldos pendientes.
            </p>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        <h2 className="border-b border-[var(--border)] p-4 font-semibold">Gastos compartidos del período</h2>
        {expenses.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-secondary)]">No hay gastos compartidos en este período.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {expenses.map((e) => {
              const payer = users.find((u) => u.id === e.paidById);
              return (
                <li key={e.id} className="flex items-center gap-3 p-3 text-sm">
                  <span aria-hidden>{categoryIcon(e.category)}</span>
                  <span className="min-w-0 flex-1 truncate">{e.description}</span>
                  <span className="hidden text-xs text-[var(--text-muted)] sm:inline">{formatDate(e.date)}</span>
                  <span className="text-xs text-[var(--text-muted)]">Pagó {payer?.name}</span>
                  <span className="w-20 text-right font-medium">{formatMoney(e.amount)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
