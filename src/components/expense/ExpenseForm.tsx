"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense, updateExpense, type ExpenseInput } from "@/actions/expense";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatDateInput, formatMoney } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export interface ExpenseFormValues extends ExpenseInput {
  id?: string;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function ExpenseForm({
  users,
  currentUserId,
  initial,
  cashBalances,
  onSaved,
}: {
  users: UserOption[];
  currentUserId: string;
  initial?: ExpenseFormValues;
  cashBalances?: { userId: string; balance: number }[];
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const otherUsers = users;
  const defaultShares = users.map((u) => ({ userId: u.id, amount: 0 }));

  const [values, setValues] = useState<ExpenseFormValues>(
    initial ?? {
      paidById: currentUserId,
      category: EXPENSE_CATEGORIES[0].value,
      description: "",
      amount: 0,
      date: formatDateInput(new Date()),
      isShared: false,
      splitType: "NONE",
      customShares: defaultShares,
      paidWithCash: false,
      notes: "",
    },
  );

  function set<K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const equalShares = useMemo(() => {
    if (users.length !== 2) return [];
    const half = Math.round((values.amount / 2 + Number.EPSILON) * 100) / 100;
    const other = Math.round((values.amount - half + Number.EPSILON) * 100) / 100;
    return [
      { userId: users[0].id, amount: half },
      { userId: users[1].id, amount: other },
    ];
  }, [users, values.amount]);

  const customSum = useMemo(
    () => (values.customShares ?? []).reduce((acc, s) => acc + (s.amount || 0), 0),
    [values.customShares],
  );
  const customDiff = Math.round((values.amount - customSum + Number.EPSILON) * 100) / 100;

  function setCustomShare(userId: string, amount: number) {
    setValues((v) => ({
      ...v,
      customShares: (v.customShares ?? defaultShares).map((s) => (s.userId === userId ? { ...s, amount } : s)),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: ExpenseInput = {
      ...values,
      splitType: values.isShared ? values.splitType : "NONE",
      customShares: values.isShared && values.splitType === "CUSTOM" ? values.customShares : undefined,
    };

    startTransition(async () => {
      const res = values.id ? await updateExpense(values.id, payload) : await createExpense(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onSaved?.();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="label">¿Quién pagó?</label>
        <div className="flex gap-2">
          {otherUsers.map((u) => (
            <button
              type="button"
              key={u.id}
              onClick={() => set("paidById", u.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-semibold"
              style={{
                borderColor: values.paidById === u.id ? u.color : "var(--border)",
                background: values.paidById === u.id ? `color-mix(in srgb, ${u.color} 14%, transparent)` : "transparent",
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: u.color }} />
              {u.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="expense-category">
          Categoría
        </label>
        <select
          id="expense-category"
          className="input"
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="expense-desc">
          Descripción
        </label>
        <input
          id="expense-desc"
          className="input"
          placeholder="Ej. Cena en restaurante"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="expense-amount">
            Monto total (USD)
          </label>
          <input
            id="expense-amount"
            type="number"
            min={0}
            step="0.01"
            className="input"
            value={values.amount || ""}
            onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="expense-date">
            Fecha
          </label>
          <input
            id="expense-date"
            type="date"
            className="input"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={values.isShared}
          onChange={(e) => {
            const isShared = e.target.checked;
            set("isShared", isShared);
            if (isShared && values.splitType === "NONE") set("splitType", "EQUAL");
          }}
        />
        <span>
          <span className="block text-sm font-semibold">¿Es un gasto compartido?</span>
          <span className="block text-xs text-[var(--text-muted)]">
            Se divide entre Xavier y Camila, sin importar quién pagó.
          </span>
        </span>
      </label>

      {values.isShared && users.length === 2 && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              className={`btn flex-1 ${values.splitType === "EQUAL" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => set("splitType", "EQUAL")}
            >
              Dividir 50/50
            </button>
            <button
              type="button"
              className={`btn flex-1 ${values.splitType === "CUSTOM" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => set("splitType", "CUSTOM")}
            >
              Personalizado
            </button>
          </div>

          {values.splitType === "EQUAL" ? (
            <ul className="space-y-1 text-sm">
              {equalShares.map((s) => (
                <li key={s.userId} className="flex justify-between">
                  <span>{users.find((u) => u.id === s.userId)?.name}</span>
                  <span className="font-semibold">{formatMoney(s.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2">
                  <span className="w-20 text-sm">{u.name}</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input"
                    value={values.customShares?.find((s) => s.userId === u.id)?.amount || ""}
                    onChange={(e) => setCustomShare(u.id, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
              <p className={`text-xs ${Math.abs(customDiff) < 0.01 ? "text-good" : "text-critical"}`}>
                {Math.abs(customDiff) < 0.01
                  ? "✓ La suma coincide con el monto total."
                  : `Diferencia: ${formatMoney(customDiff)} ${customDiff > 0 ? "por asignar" : "de más"}`}
              </p>
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {users.find((u) => u.id === values.paidById)?.name} pagó el total; esta distribución define a quién
            corresponde cada parte.
          </p>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={!!values.paidWithCash}
          onChange={(e) => set("paidWithCash", e.target.checked)}
        />
        <span className="flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Icon name="income" className="h-4 w-4" /> ¿Pagaste con efectivo?
          </span>
          <span className="block text-xs text-[var(--text-muted)]">
            Descuenta el monto del control de efectivo de {users.find((u) => u.id === values.paidById)?.name}.
          </span>
        </span>
      </label>

      {values.paidWithCash &&
        (() => {
          const payerBalance = cashBalances?.find((c) => c.userId === values.paidById)?.balance;
          if (payerBalance === undefined) return null;
          const after = round2(payerBalance - values.amount);
          return (
            <p className={`text-xs ${after < 0 ? "text-critical" : "text-[var(--text-muted)]"}`}>
              Efectivo de {users.find((u) => u.id === values.paidById)?.name}: {formatMoney(payerBalance)} →{" "}
              {formatMoney(after)} después de este gasto
              {after < 0 ? " ⚠️ quedaría en negativo" : ""}
            </p>
          );
        })()}

      <div>
        <label className="label" htmlFor="expense-notes">
          Notas (opcional)
        </label>
        <input
          id="expense-notes"
          className="input"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : values.id ? "Guardar cambios" : "Registrar gasto"}
      </button>
    </form>
  );
}
