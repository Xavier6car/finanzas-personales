"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Select } from "@/components/ui/Select";
import { IncomeForm, type IncomeFormValues } from "@/components/income/IncomeForm";
import { deleteIncome } from "@/actions/income";
import { formatDate, formatDateInput, formatMoney, daysAgoInput } from "@/lib/format";
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

const DEFAULT_DAYS = 30;

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

  const [personId, setPersonId] = useState("all");
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState(() => daysAgoInput(DEFAULT_DAYS));
  const [dateEnd, setDateEnd] = useState("");

  function userOf(id: string) {
    return users.find((u) => u.id === id);
  }

  function close() {
    setOpen(false);
    if (searchParams.get("nuevo") === "1") router.replace("/ingresos");
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return incomes.filter((i) => {
      if (personId !== "all" && i.userId !== personId) return false;
      if (dateStart && formatDateInput(i.date) < dateStart) return false;
      if (dateEnd && formatDateInput(i.date) > dateEnd) return false;
      if (term && !i.description.toLowerCase().includes(term) && !i.type.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [incomes, personId, dateStart, dateEnd, search]);

  const totalFiltered = filtered.reduce((a, i) => a + i.amount, 0);
  const hasFilters = personId !== "all" || search || dateEnd || dateStart !== daysAgoInput(DEFAULT_DAYS);

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
              placeholder="Descripción o tipo…"
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
            {filtered.length} ingreso(s) · {formatMoney(totalFiltered)}
          </span>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-secondary)]">
            {incomes.length === 0 ? "Todavía no hay ingresos registrados." : "No hay ingresos con estos filtros."}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((income) => {
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
