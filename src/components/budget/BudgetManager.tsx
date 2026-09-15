"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { BudgetForm, type BudgetFormValues } from "@/components/budget/BudgetForm";
import { deleteBudget } from "@/actions/budget";
import { categoryIcon } from "@/lib/constants";
import { formatMoney, formatMonthLabel, formatPercent } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import type { BudgetProgress } from "@/lib/budget-data";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export function BudgetManager({
  users,
  month,
  budgets,
}: {
  users: UserOption[];
  month: string;
  budgets: BudgetProgress[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetFormValues | undefined>();

  function changeMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    const next = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    router.push(`/presupuestos?month=${next}`);
  }

  function barColor(percent: number) {
    if (percent >= 100) return "var(--critical)";
    if (percent >= 80) return "var(--warning)";
    return "var(--brand)";
  }

  const totalAssigned = budgets.reduce((a, b) => a + b.amount, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Presupuestos</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary !px-2" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-semibold capitalize">{formatMonthLabel(month)}</span>
          <button className="btn btn-secondary !px-2" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
          <button
            className="btn btn-primary ml-2"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            + Nuevo
          </button>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="card mb-4 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total asignado vs. gastado del mes</span>
            <span className="font-semibold tabular-nums">
              {formatMoney(totalSpent)} / {formatMoney(totalAssigned)}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, totalAssigned > 0 ? (totalSpent / totalAssigned) * 100 : 0)}%`,
                background: barColor(totalAssigned > 0 ? (totalSpent / totalAssigned) * 100 : 0),
              }}
            />
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="card p-6 text-center text-sm text-[var(--text-secondary)]">
          No hay presupuestos definidos para {formatMonthLabel(month)}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const person = users.find((u) => u.id === b.userId);
            const color = barColor(b.percent);
            return (
              <div key={b.id} className="card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {categoryIcon(b.category)} {b.category}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{person ? person.name : "Conjunto (hogar)"}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      className="btn btn-ghost !px-2 !py-1 text-xs"
                      onClick={() => {
                        setEditing({
                          id: b.id,
                          category: b.category,
                          month: b.month,
                          amount: b.amount,
                          scope: b.scope,
                          userId: b.userId,
                        });
                        setOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <ConfirmButton onConfirm={() => deleteBudget(b.id)} />
                  </div>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, b.percent)}%`, background: color }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="tabular-nums">
                    {formatMoney(b.spent)} <span className="text-[var(--text-muted)]">de {formatMoney(b.amount)}</span>
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color }}>
                    {formatPercent(b.percent)}
                  </span>
                </div>

                {b.percent >= 100 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-critical">
                    <Icon name="warning" className="h-3.5 w-3.5" />
                    Presupuesto superado.
                  </p>
                ) : b.percent >= 80 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--warning)" }}>
                    <Icon name="warning" className="h-3.5 w-3.5" />
                    Cerca del límite ({formatMoney(b.remaining)} disponible).
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{formatMoney(b.remaining)} disponible</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar presupuesto" : "Nuevo presupuesto"}>
        <BudgetForm users={users} month={month} initial={editing} onSaved={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
