"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { CashMovementForm } from "@/components/cash/CashMovementForm";
import { deleteCashMovement } from "@/actions/cash";
import { formatDate, formatMoney } from "@/lib/format";
import type { CashBalance } from "@/lib/cash-data";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export function CashManager({
  users,
  currentUserId,
  balances,
}: {
  users: UserOption[];
  currentUserId: string;
  balances: CashBalance[];
}) {
  const [open, setOpen] = useState(false);
  const total = balances.reduce((a, b) => a + b.balance, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Efectivo</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Control de la plata en mano: retiros y lo que se paga en efectivo, aparte del balance general.
          </p>
        </div>
        <button className="btn btn-primary shrink-0" onClick={() => setOpen(true)}>
          + Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Efectivo total del hogar</p>
          <p className={`mt-1.5 text-2xl font-bold ${total < 0 ? "text-critical" : ""}`}>{formatMoney(total)}</p>
        </div>
        {balances.map((b) => (
          <div key={b.userId} className="card p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
              {b.name}
            </p>
            <p className={`mt-1.5 text-2xl font-bold ${b.balance < 0 ? "text-critical" : ""}`}>
              {formatMoney(b.balance)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {balances.map((b) => (
          <div key={b.userId} className="card overflow-hidden">
            <h2 className="border-b border-[var(--border)] p-4 font-semibold">Movimientos de {b.name}</h2>
            {b.ledger.length === 0 ? (
              <p className="p-6 text-center text-sm text-[var(--text-secondary)]">Todavía no hay movimientos.</p>
            ) : (
              <ul className="max-h-96 divide-y divide-[var(--border)] overflow-y-auto scrollbar-thin">
                {b.ledger.map((entry) => (
                  <li key={`${entry.kind}-${entry.id}`} className="flex items-center gap-3 p-3 text-sm">
                    <span aria-hidden>{entry.kind === "expense" ? "🧾" : entry.amount >= 0 ? "➕" : "➖"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{entry.description}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDate(entry.date)}
                        {entry.kind === "expense" ? " · gasto en efectivo" : ""}
                      </p>
                    </div>
                    <span className={`font-semibold ${entry.amount >= 0 ? "text-good" : "text-critical"}`}>
                      {entry.amount >= 0 ? "+" : ""}
                      {formatMoney(entry.amount)}
                    </span>
                    {entry.kind === "movement" && (
                      <ConfirmButton onConfirm={() => deleteCashMovement(entry.id)} label="✕" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo movimiento de efectivo">
        <CashMovementForm users={users} currentUserId={currentUserId} onSaved={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
