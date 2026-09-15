"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { IncomeForm, type IncomeFormValues } from "@/components/income/IncomeForm";
import { deleteIncome } from "@/actions/income";
import { formatDate, formatDateInput, formatMoney } from "@/lib/format";
import { incomeIcon } from "@/lib/constants";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

interface IncomeRow {
  id: string;
  userId: string;
  type: string;
  description: string;
  amount: number;
  date: Date;
  account: string | null;
}

export function IncomeManager({
  users,
  currentUserId,
  incomes,
}: {
  users: UserOption[];
  currentUserId: string;
  incomes: IncomeRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("nuevo") === "1");
  const [editing, setEditing] = useState<IncomeFormValues | undefined>(undefined);

  function userOf(id: string) {
    return users.find((u) => u.id === id);
  }

  function close() {
    setOpen(false);
    if (searchParams.get("nuevo") === "1") router.replace("/ingresos");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Ingresos</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          + Nuevo ingreso
        </button>
      </div>

      <div className="card overflow-hidden">
        {incomes.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-secondary)]">
            Todavía no hay ingresos registrados.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {incomes.map((income) => {
              const user = userOf(income.userId);
              return (
                <li key={income.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="shrink-0 text-xl" aria-hidden>
                      {incomeIcon(income.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{income.description}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        {income.type} · {formatDate(income.date)}
                        {income.account ? ` · ${income.account}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    {user && (
                      <span
                        className="pill hidden sm:inline-flex"
                        style={{ color: user.color, background: `color-mix(in srgb, ${user.color} 14%, transparent)` }}
                      >
                        {user.name}
                      </span>
                    )}
                    <span className="text-right font-semibold text-good">+{formatMoney(income.amount)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-ghost !px-2 !py-1 text-xs"
                        onClick={() => {
                          setEditing({
                            id: income.id,
                            userId: income.userId,
                            type: income.type,
                            description: income.description,
                            amount: income.amount,
                            date: formatDateInput(income.date),
                            account: income.account ?? "",
                          });
                          setOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <ConfirmButton onConfirm={() => deleteIncome(income.id)} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={close} title={editing ? "Editar ingreso" : "Nuevo ingreso"}>
        <IncomeForm users={users} currentUserId={currentUserId} initial={editing} onSaved={close} />
      </Modal>
    </div>
  );
}
