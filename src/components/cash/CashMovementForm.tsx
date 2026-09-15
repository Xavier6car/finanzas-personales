"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "@phosphor-icons/react";
import { createCashMovement } from "@/actions/cash";
import { formatDateInput } from "@/lib/format";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export function CashMovementForm({
  users,
  currentUserId,
  onSaved,
}: {
  users: UserOption[];
  currentUserId: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState(currentUserId);
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatDateInput(new Date()));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const signedAmount = direction === "in" ? Math.abs(amount) : -Math.abs(amount);
      const res = await createCashMovement({ userId, amount: signedAmount, description, date });
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
        <label className="label">¿De quién es este efectivo?</label>
        <div className="flex gap-2">
          {users.map((u) => (
            <button
              type="button"
              key={u.id}
              onClick={() => setUserId(u.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-semibold"
              style={{
                borderColor: userId === u.id ? u.color : "var(--border)",
                background: userId === u.id ? `color-mix(in srgb, ${u.color} 14%, transparent)` : "transparent",
              }}
            >
              {u.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Tipo de movimiento</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn flex-1 ${direction === "in" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setDirection("in")}
          >
            <Plus size={16} weight="bold" /> Retiro (agrega efectivo)
          </button>
          <button
            type="button"
            className={`btn flex-1 ${direction === "out" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setDirection("out")}
          >
            <Minus size={16} weight="bold" /> Ajuste (quita efectivo)
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {direction === "in"
            ? "Ej. sacaste plata del cajero o del banco."
            : "Ej. depositaste el efectivo de vuelta, o el conteo real es menor al registrado."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="cash-amount">
            Monto (USD)
          </label>
          <input
            id="cash-amount"
            type="number"
            min={0}
            step="0.01"
            className="input"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cash-date">
            Fecha
          </label>
          <input id="cash-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="cash-desc">
          Descripción
        </label>
        <input
          id="cash-desc"
          className="input"
          placeholder="Ej. Retiro cajero Produbanco"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : "Registrar movimiento"}
      </button>
    </form>
  );
}
