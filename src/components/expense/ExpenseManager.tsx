"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Select } from "@/components/ui/Select";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expense/ExpenseForm";
import { deleteExpense, markExpenseReimbursed } from "@/actions/expense";
import { formatDate, formatDateInput, formatMoney, daysAgoInput } from "@/lib/format";
import { categoryIcon } from "@/lib/constants";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

interface ExpenseRow {
  id: string;
  paidById: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  isShared: boolean;
  splitType: string;
  paidWithCash: boolean;
  reimbursementStatus: string;
  shares: { userId: string; amount: number }[];
}

const DEFAULT_DAYS = 30;

export function ExpenseManager({
  users,
  currentUserId,
  expenses,
  cashBalances,
}: {
  users: UserOption[];
  currentUserId: string;
  expenses: ExpenseRow[];
  cashBalances?: { userId: string; balance: number }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("nuevo") === "1");
  const [editing, setEditing] = useState<ExpenseFormValues | undefined>(undefined);

  const [personId, setPersonId] = useState("all");
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState(() => daysAgoInput(DEFAULT_DAYS));
  const [dateEnd, setDateEnd] = useState("");

  function userOf(id: string) {
    return users.find((u) => u.id === id);
  }

  function close() {
    setOpen(false);
    if (searchParams.get("nuevo") === "1") router.replace("/gastos");
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (personId !== "all" && e.paidById !== personId) return false;
      if (dateStart && formatDateInput(e.date) < dateStart) return false;
      if (dateEnd && formatDateInput(e.date) > dateEnd) return false;
      if (term && !e.description.toLowerCase().includes(term) && !e.category.toLowerCase().includes(term))
        return false;
      return true;
    });
  }, [expenses, personId, dateStart, dateEnd, search]);

  const totalFiltered = filtered.reduce((a, e) => a + e.amount, 0);
  const hasFilters = personId !== "all" || search || dateEnd || dateStart !== daysAgoInput(DEFAULT_DAYS);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Gastos</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          + Nuevo gasto
        </button>
      </div>

      <div className="card mb-4 flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Select
            label="Persona"
            value={personId}
            onChange={setPersonId}
            options={[["all", "Todas"], ...users.map((u) => [u.id, u.name] as [string, string])]}
          />
          <div>
            <label className="label">Buscar</label>
            <input
              className="input"
              placeholder="Descripción o categoría…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasFilters && (
            <button
              className="btn btn-ghost !text-xs"
              onClick={() => {
                setPersonId("all");
                setSearch("");
                setDateStart(daysAgoInput(DEFAULT_DAYS));
                setDateEnd("");
              }}
            >
              Limpiar filtros (últimos {DEFAULT_DAYS} días)
            </button>
          )}
          {(dateStart || dateEnd) && (
            <button className="btn btn-ghost !text-xs" onClick={() => { setDateStart(""); setDateEnd(""); }}>
              Ver todo el historial
            </button>
          )}
          <span className="ml-auto text-xs text-[var(--text-muted)]">
            {filtered.length} gasto(s) · {formatMoney(totalFiltered)}
          </span>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-secondary)]">
            {expenses.length === 0 ? "Todavía no hay gastos registrados." : "No hay gastos con estos filtros."}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((expense) => {
              const payer = userOf(expense.paidById);
              return (
                <li key={expense.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="shrink-0 text-xl" aria-hidden>
                      {categoryIcon(expense.category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{expense.description}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        {expense.category} · {formatDate(expense.date)} · Pagó {payer?.name}
                      </p>
                      {(expense.isShared || expense.paidWithCash || expense.reimbursementStatus !== "NONE") && (
                        <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-[var(--text-secondary)]">
                          {expense.isShared && <span className="pill">🤝 Compartido</span>}
                          {expense.paidWithCash && <span className="pill">💵 Efectivo</span>}
                          {expense.reimbursementStatus === "PENDING" && (
                            <span className="pill" style={{ color: "var(--warning)" }}>
                              ⏳ Pendiente de reembolso
                            </span>
                          )}
                          {expense.reimbursementStatus === "REIMBURSED" && (
                            <span className="pill text-good">✅ Reembolsado</span>
                          )}
                          {expense.isShared &&
                            expense.shares.map((s) => (
                              <span key={s.userId}>
                                {userOf(s.userId)?.name}: {formatMoney(s.amount)}
                              </span>
                            ))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    {payer && (
                      <span
                        className="pill hidden sm:inline-flex"
                        style={{ color: payer.color, background: `color-mix(in srgb, ${payer.color} 14%, transparent)` }}
                      >
                        {payer.name}
                      </span>
                    )}
                    <span className="text-right font-semibold text-critical">-{formatMoney(expense.amount)}</span>
                    <div className="flex items-center gap-2">
                      {expense.reimbursementStatus === "PENDING" && (
                        <ConfirmButton
                          onConfirm={() => markExpenseReimbursed(expense.id)}
                          label="✅ Reembolsado"
                          confirmLabel="¿Ya te lo devolvieron?"
                          confirmActionLabel="Sí, ya me lo devolvieron"
                          tone="good"
                        />
                      )}
                      <button
                        className="btn btn-ghost !px-2 !py-1 text-xs"
                        onClick={() => {
                          setEditing({
                            id: expense.id,
                            paidById: expense.paidById,
                            category: expense.category,
                            description: expense.description,
                            amount: expense.amount,
                            date: formatDateInput(expense.date),
                            isShared: expense.isShared,
                            splitType: expense.splitType as "NONE" | "EQUAL" | "CUSTOM",
                            customShares: expense.shares,
                            paidWithCash: expense.paidWithCash,
                            pendingReimbursement: expense.reimbursementStatus !== "NONE",
                            reimbursementStatus: expense.reimbursementStatus as "NONE" | "PENDING" | "REIMBURSED",
                          });
                          setOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <ConfirmButton onConfirm={() => deleteExpense(expense.id)} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={close} title={editing ? "Editar gasto" : "Nuevo gasto"}>
        <ExpenseForm
          users={users}
          currentUserId={currentUserId}
          initial={editing}
          cashBalances={cashBalances}
          onSaved={close}
        />
      </Modal>
    </div>
  );
}
