"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoal, updateGoal, type GoalInput } from "@/actions/goal";

const ICONS = ["🎯", "✈️", "🚗", "🏠", "💍", "🧯", "🎓", "👶", "🐾", "💻"];

export interface GoalFormValues extends GoalInput {
  id?: string;
}

export function GoalForm({ initial, onSaved }: { initial?: GoalFormValues; onSaved?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<GoalFormValues>(
    initial ?? { name: "", targetAmount: 0, targetDate: "", icon: "🎯" },
  );

  function set<K extends keyof GoalFormValues>(key: K, value: GoalFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = values.id ? await updateGoal(values.id, values) : await createGoal(values);
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
        <label className="label">Ícono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((icon) => (
            <button
              type="button"
              key={icon}
              onClick={() => set("icon", icon)}
              className="flex h-10 w-10 items-center justify-center rounded-full border text-lg"
              style={{ borderColor: values.icon === icon ? "var(--brand)" : "var(--border)" }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="goal-name">
          Nombre de la meta
        </label>
        <input
          id="goal-name"
          className="input"
          placeholder="Ej. Fondo de emergencia"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="goal-amount">
            Objetivo (USD)
          </label>
          <input
            id="goal-amount"
            type="number"
            min={0}
            step="0.01"
            className="input"
            value={values.targetAmount || ""}
            onChange={(e) => set("targetAmount", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="goal-date">
            Fecha objetivo (opcional)
          </label>
          <input
            id="goal-date"
            type="date"
            className="input"
            value={values.targetDate ?? ""}
            onChange={(e) => set("targetDate", e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : values.id ? "Guardar cambios" : "Crear meta"}
      </button>
    </form>
  );
}
