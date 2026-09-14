"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addContribution } from "@/actions/goal";
import { formatDateInput } from "@/lib/format";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export function ContributionForm({
  goalId,
  users,
  currentUserId,
  onSaved,
}: {
  goalId: string;
  users: UserOption[];
  currentUserId: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState(currentUserId);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addContribution({ goalId, userId, amount, date, note });
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
        <label className="label">¿Quién aporta?</label>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="contribution-amount">
            Monto (USD)
          </label>
          <input
            id="contribution-amount"
            type="number"
            min={0}
            step="0.01"
            className="input"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="contribution-date">
            Fecha
          </label>
          <input id="contribution-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="contribution-note">
          Nota (opcional)
        </label>
        <input id="contribution-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : "Agregar aporte"}
      </button>
    </form>
  );
}
