"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createIncome, updateIncome, type IncomeInput } from "@/actions/income";
import { INCOME_TYPES } from "@/lib/constants";
import { formatDateInput } from "@/lib/format";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export interface IncomeFormValues extends IncomeInput {
  id?: string;
}

export function IncomeForm({
  users,
  currentUserId,
  initial,
  onSaved,
}: {
  users: UserOption[];
  currentUserId: string;
  initial?: IncomeFormValues;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<IncomeFormValues>(
    initial ?? {
      userId: currentUserId,
      type: INCOME_TYPES[0].value,
      description: "",
      amount: 0,
      date: formatDateInput(new Date()),
      account: "",
      notes: "",
    },
  );

  function set<K extends keyof IncomeFormValues>(key: K, value: IncomeFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = values.id
        ? await updateIncome(values.id, values)
        : await createIncome(values);
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
        <label className="label">¿Quién recibió el ingreso?</label>
        <div className="flex gap-2">
          {users.map((u) => (
            <button
              type="button"
              key={u.id}
              onClick={() => set("userId", u.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-semibold"
              style={{
                borderColor: values.userId === u.id ? u.color : "var(--border)",
                background: values.userId === u.id ? `color-mix(in srgb, ${u.color} 14%, transparent)` : "transparent",
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: u.color }} />
              {u.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="income-type">
          Tipo de ingreso
        </label>
        <select
          id="income-type"
          className="input"
          value={values.type}
          onChange={(e) => set("type", e.target.value)}
        >
          {INCOME_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.icon} {t.value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="income-desc">
          Descripción
        </label>
        <input
          id="income-desc"
          className="input"
          placeholder="Ej. Sueldo de septiembre"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="income-amount">
            Monto (USD)
          </label>
          <input
            id="income-amount"
            type="number"
            min={0}
            step="0.01"
            className="input"
            value={values.amount || ""}
            onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="income-date">
            Fecha
          </label>
          <input
            id="income-date"
            type="date"
            className="input"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="income-account">
          Cuenta o medio (opcional)
        </label>
        <input
          id="income-account"
          className="input"
          placeholder="Ej. Cuenta de ahorros, efectivo…"
          value={values.account}
          onChange={(e) => set("account", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : values.id ? "Guardar cambios" : "Registrar ingreso"}
      </button>
    </form>
  );
}
