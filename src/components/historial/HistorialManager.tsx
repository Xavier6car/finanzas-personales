"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { IncomeForm, type IncomeFormValues } from "@/components/income/IncomeForm";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expense/ExpenseForm";
import { deleteIncome } from "@/actions/income";
import { deleteExpense } from "@/actions/expense";
import { buildMovements, type ExpenseLike, type IncomeLike, type Movement } from "@/lib/movements";
import { categoryIcon, incomeIcon, INCOME_TYPES, EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatDate, formatDateInput, formatMoney } from "@/lib/format";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

type MovementFilter = "all" | "income" | "expense";
type SharedFilter = "all" | "shared" | "individual";
type SortField = "date" | "amount";

export function HistorialManager({
  users,
  currentUserId,
  incomes,
  expenses,
}: {
  users: UserOption[];
  currentUserId: string;
  incomes: IncomeLike[];
  expenses: ExpenseLike[];
}) {
  const movements = useMemo(() => buildMovements(incomes, expenses), [incomes, expenses]);

  const [personId, setPersonId] = useState<string>("all");
  const [kind, setKind] = useState<MovementFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [shared, setShared] = useState<SharedFilter>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [editingIncome, setEditingIncome] = useState<IncomeFormValues | undefined>();
  const [editingExpense, setEditingExpense] = useState<ExpenseFormValues | undefined>();

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const m of movements) {
      const d = m.date;
      set.add(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    }
    return [...set].sort().reverse();
  }, [movements]);

  const categoryOptions = useMemo(() => {
    if (kind === "income") return INCOME_TYPES.map((t) => t.value as string);
    if (kind === "expense") return EXPENSE_CATEGORIES.map((c) => c.value as string);
    return [...new Set([...INCOME_TYPES.map((t) => t.value as string), ...EXPENSE_CATEGORIES.map((c) => c.value as string)])];
  }, [kind]);

  const filtered = useMemo(() => {
    let list = movements;
    if (personId !== "all") list = list.filter((m) => m.personId === personId || m.shares?.some((s) => s.userId === personId));
    if (kind !== "all") list = list.filter((m) => m.kind === kind);
    if (category !== "all") list = list.filter((m) => m.category === category);
    if (month !== "all")
      list = list.filter((m) => `${m.date.getUTCFullYear()}-${String(m.date.getUTCMonth() + 1).padStart(2, "0")}` === month);
    if (dateStart) list = list.filter((m) => m.date >= new Date(dateStart + "T00:00:00Z"));
    if (dateEnd) list = list.filter((m) => m.date <= new Date(dateEnd + "T23:59:59Z"));
    if (shared === "shared") list = list.filter((m) => m.isShared);
    if (shared === "individual") list = list.filter((m) => !m.isShared);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.description.toLowerCase().includes(q));
    }

    const sorted = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "amount") return (a.amount - b.amount) * dir;
      return (a.date.getTime() - b.date.getTime()) * dir;
    });
    return sorted;
  }, [movements, personId, kind, category, month, dateStart, dateEnd, shared, search, sortField, sortDir]);

  function userOf(id: string) {
    return users.find((u) => u.id === id);
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function openEdit(m: Movement) {
    if (m.kind === "income") {
      const i = m.source as IncomeLike;
      setEditingIncome({
        id: i.id,
        userId: i.userId,
        type: i.type,
        description: i.description,
        amount: i.amount,
        date: formatDateInput(i.date),
        account: i.account ?? "",
      });
    } else {
      const e = m.source as ExpenseLike;
      setEditingExpense({
        id: e.id,
        paidById: e.paidById,
        category: e.category,
        description: e.description,
        amount: e.amount,
        date: formatDateInput(e.date),
        isShared: e.isShared,
        splitType: e.splitType as "NONE" | "EQUAL" | "CUSTOM",
        customShares: e.shares,
      });
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Historial de movimientos</h1>

      <div className="card mb-4 flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Select label="Persona" value={personId} onChange={setPersonId} options={[["all", "Todas"], ...users.map((u) => [u.id, u.name] as [string, string])]} />
          <Select
            label="Tipo"
            value={kind}
            onChange={(v) => {
              setKind(v as MovementFilter);
              setCategory("all");
            }}
            options={[
              ["all", "Todos"],
              ["income", "Ingresos"],
              ["expense", "Gastos"],
            ]}
          />
          <Select
            label="Categoría"
            value={category}
            onChange={setCategory}
            options={[["all", "Todas"], ...categoryOptions.map((c) => [c, c] as [string, string])]}
          />
          <Select
            label="Mes"
            value={month}
            onChange={setMonth}
            options={[["all", "Todos"], ...months.map((m) => [m, m] as [string, string])]}
          />
          <Select
            label="Compartidos"
            value={shared}
            onChange={(v) => setShared(v as SharedFilter)}
            options={[
              ["all", "Todos"],
              ["shared", "Solo compartidos"],
              ["individual", "Solo individuales"],
            ]}
          />
          <div>
            <label className="label">Buscar</label>
            <input className="input" placeholder="Descripción…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input !w-auto" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input !w-auto" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
          {(dateStart || dateEnd || month !== "all" || category !== "all" || personId !== "all" || kind !== "all" || shared !== "all" || search) && (
            <button
              className="btn btn-ghost !text-xs"
              onClick={() => {
                setPersonId("all");
                setKind("all");
                setCategory("all");
                setMonth("all");
                setDateStart("");
                setDateEnd("");
                setShared("all");
                setSearch("");
              }}
            >
              Limpiar filtros
            </button>
          )}
          <span className="ml-auto text-xs text-[var(--text-muted)]">{filtered.length} movimiento(s)</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[90px_1fr_140px_110px_100px_170px] gap-2 border-b border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] sm:grid">
          <button className="text-left" onClick={() => toggleSort("date")}>
            Fecha {sortField === "date" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <span>Descripción</span>
          <span>Categoría</span>
          <span>Persona</span>
          <button className="text-right" onClick={() => toggleSort("amount")}>
            Monto {sortField === "amount" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <span className="text-right">Acciones</span>
        </div>

        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-secondary)]">No hay movimientos con estos filtros.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((m) => {
              const person = userOf(m.personId);
              return (
                <li
                  key={`${m.kind}-${m.id}`}
                  className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[90px_1fr_140px_110px_100px_170px] sm:items-center sm:gap-2"
                >
                  <span className="text-xs text-[var(--text-muted)] sm:text-sm">{formatDate(m.date)}</span>
                  <span className="min-w-0 truncate font-medium">
                    {m.description}
                    {m.isShared && <span className="pill ml-2">🤝 Compartido</span>}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {m.kind === "income" ? incomeIcon(m.category) : categoryIcon(m.category)} {m.category}
                  </span>
                  <span className="text-sm">
                    {person && (
                      <span
                        className="pill"
                        style={{ color: person.color, background: `color-mix(in srgb, ${person.color} 14%, transparent)` }}
                      >
                        {person.name}
                      </span>
                    )}
                  </span>
                  <span className={`text-right font-semibold sm:text-right ${m.kind === "income" ? "text-good" : "text-critical"}`}>
                    {m.kind === "income" ? "+" : "-"}
                    {formatMoney(m.amount)}
                  </span>
                  <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 whitespace-nowrap">
                    <button className="btn btn-ghost !px-2 !py-1 text-xs" onClick={() => openEdit(m)}>
                      Editar
                    </button>
                    <ConfirmButton onConfirm={() => (m.kind === "income" ? deleteIncome(m.id) : deleteExpense(m.id))} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={!!editingIncome} onClose={() => setEditingIncome(undefined)} title="Editar ingreso">
        {editingIncome && (
          <IncomeForm users={users} currentUserId={currentUserId} initial={editingIncome} onSaved={() => setEditingIncome(undefined)} />
        )}
      </Modal>

      <Modal open={!!editingExpense} onClose={() => setEditingExpense(undefined)} title="Editar gasto">
        {editingExpense && (
          <ExpenseForm users={users} currentUserId={currentUserId} initial={editingExpense} onSaved={() => setEditingExpense(undefined)} />
        )}
      </Modal>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
