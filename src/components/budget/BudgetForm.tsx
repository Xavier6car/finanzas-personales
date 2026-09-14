"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBudget, type BudgetInput } from "@/actions/budget";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export interface BudgetFormValues extends BudgetInput {
  id?: string;
}

export function BudgetForm({
  users,
  month,
  initial,
  onSaved,
}: {
  users: UserOption[];
  month: string;
  initial?: BudgetFormValues;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<BudgetFormValues>(
    initial ?? {
      category: EXPENSE_CATEGORIES[0].value,
      month,
      amount: 0,
      scope: "SHARED",
      userId: null,
    },
  );

  function set<K extends keyof BudgetFormValues>(key: K, value: BudgetFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveBudget(values, values.id);
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
        <label className="label" htmlFor="budget-category">
          Categoría
        </label>
        <select id="budget-category" className="input" value={values.category} onChange={(e) => set("category", e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Alcance</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn flex-1 ${values.scope === "SHARED" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => set("scope", "SHARED")}
          >
            Conjunto (hogar)
          </button>
          <button
            type="button"
            className={`btn flex-1 ${values.scope === "PERSON" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => set("scope", "PERSON")}
          >
            Por persona
          </button>
        </div>
      </div>

      {values.scope === "PERSON" && (
        <div>
          <label className="label">Persona</label>
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
                {u.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="budget-amount">
            Monto asignado (USD)
          </label>
          <input
            id="budget-amount"
            type="number"
            min={0}
            step="0.01"
            className="input"
            value={values.amount || ""}
            onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="budget-month">
            Mes
          </label>
          <input
            id="budget-month"
            type="month"
            className="input"
            value={values.month}
            onChange={(e) => set("month", e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : values.id ? "Guardar cambios" : "Crear presupuesto"}
      </button>
    </form>
  );
}
