"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, CaretRight, Plus, Warning } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { BudgetForm, type BudgetFormValues } from "@/components/budget/BudgetForm";
import { deleteBudget } from "@/actions/budget";
import { categoryIcon } from "@/lib/constants";
import { formatDate, formatMoney, formatMonthLabel, formatPercent } from "@/lib/format";
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
  const [viewing, setViewing] = useState<BudgetProgress | undefined>();

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
            <CaretLeft size={16} weight="bold" />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-semibold capitalize">{formatMonthLabel(month)}</span>
          <button className="btn btn-secondary !px-2" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
            <CaretRight size={16} weight="bold" />
          </button>
          <button
            className="btn btn-primary ml-2"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus size={16} weight="bold" /> Nuevo
          </button>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="card mb-4 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Total asignado vs. gastado del mes</span>
            <span className="font-semibold">
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
              <div
                key={b.id}
                className="card cursor-pointer p-4 transition-colors hover:border-[var(--brand)]"
                role="button"
                tabIndex={0}
                onClick={() => setViewing(b)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setViewing(b);
                  }
                }}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {categoryIcon(b.category)} {b.category}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{person ? person.name : "Conjunto (hogar)"}</p>
                  </div>
                  <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
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
                  <span>
                    {formatMoney(b.spent)} <span className="text-[var(--text-muted)]">de {formatMoney(b.amount)}</span>
                  </span>
                  <span className="font-semibold" style={{ color }}>
                    {formatPercent(b.percent)}
                  </span>
                </div>

                {b.percent >= 100 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-critical">
                    <Warning size={13} weight="bold" /> Presupuesto superado.
                  </p>
                ) : b.percent >= 80 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--warning)" }}>
                    <Warning size={13} weight="bold" /> Cerca del límite ({formatMoney(b.remaining)} disponible).
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

      <Modal
        open={!!viewing}
        onClose={() => setViewing(undefined)}
        title={viewing ? `${categoryIcon(viewing.category)} ${viewing.category}` : ""}
      >
        {viewing && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>{formatMonthLabel(viewing.month)}</span>
              <span className="font-semibold text-[var(--text)]">
                {formatMoney(viewing.spent)} de {formatMoney(viewing.amount)}
              </span>
            </div>

            {viewing.movements.length === 0 ? (
              <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                No hay gastos registrados en esta categoría este mes.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {viewing.movements.map((mv) => (
                  <li
                    key={mv.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{mv.description}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDate(mv.date)} · {mv.paidByName}
                        {mv.isShared ? " · compartido" : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold">{formatMoney(mv.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
