"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expense/ExpenseForm";
import { deleteExpense } from "@/actions/expense";
import { formatDate, formatDateInput, formatMoney } from "@/lib/format";
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
  shares: { userId: string; amount: number }[];
}

export function ExpenseManager({
  users,
  currentUserId,
  expenses,
}: {
  users: UserOption[];
  currentUserId: string;
  expenses: ExpenseRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("nuevo") === "1");
  const [editing, setEditing] = useState<ExpenseFormValues | undefined>(undefined);

  function userOf(id: string) {
    return users.find((u) => u.id === id);
  }

  function close() {
    setOpen(false);
    if (searchParams.get("nuevo") === "1") router.replace("/gastos");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
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

      <div className="card overflow-hidden">
        {expenses.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-secondary)]">
            Todavía no hay gastos registrados.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {expenses.map((expense) => {
              const payer = userOf(expense.paidById);
              return (
                <li key={expense.id} className="flex items-center gap-3 p-4">
                  <span className="text-xl" aria-hidden>
                    {categoryIcon(expense.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{expense.description}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {expense.category} · {formatDate(expense.date)} · Pagó {payer?.name}
                    </p>
                    {expense.isShared && (
                      <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-[var(--text-secondary)]">
                        <span className="pill">🤝 Compartido</span>
                        {expense.shares.map((s) => (
                          <span key={s.userId}>
                            {userOf(s.userId)?.name}: {formatMoney(s.amount)}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  {payer && (
                    <span
                      className="pill hidden sm:inline-flex"
                      style={{ color: payer.color, background: `color-mix(in srgb, ${payer.color} 14%, transparent)` }}
                    >
                      {payer.name}
                    </span>
                  )}
                  <span className="w-24 text-right font-semibold text-critical">-{formatMoney(expense.amount)}</span>
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
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
                        });
                        setOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <ConfirmButton onConfirm={() => deleteExpense(expense.id)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={close} title={editing ? "Editar gasto" : "Nuevo gasto"}>
        <ExpenseForm users={users} currentUserId={currentUserId} initial={editing} onSaved={close} />
      </Modal>
    </div>
  );
}
