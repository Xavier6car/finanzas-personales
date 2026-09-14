"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserPin, setRequirePin, setSettlementMode, logout } from "@/actions/auth";

interface UserOption {
  id: string;
  name: string;
  color: string;
  hasPin: boolean;
}

export function SettingsForm({
  users,
  requirePin,
  settlementMode,
}: {
  users: UserOption[];
  requirePin: boolean;
  settlementMode: "REEMBOLSO" | "PRESUPUESTO";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pins, setPins] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  function savePin(userId: string) {
    const pin = pins[userId];
    if (pin && (pin.length < 4 || pin.length > 6)) {
      setMessage("El PIN debe tener entre 4 y 6 dígitos.");
      return;
    }
    startTransition(async () => {
      await setUserPin(userId, pin || null);
      setPins((p) => ({ ...p, [userId]: "" }));
      setMessage("PIN actualizado.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card p-4">
        <h2 className="mb-1 font-semibold">Seguridad de acceso</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Sin correos ni contraseñas: cada quien entra eligiendo su nombre. Opcionalmente puedes exigir un PIN.
        </p>

        <label className="mb-4 flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
          <span>
            <span className="block text-sm font-semibold">Solicitar PIN al ingresar</span>
            <span className="block text-xs text-[var(--text-muted)]">Solo aplica a usuarios que tengan un PIN configurado.</span>
          </span>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={requirePin}
            onChange={(e) =>
              startTransition(async () => {
                await setRequirePin(e.target.checked);
                router.refresh();
              })
            }
          />
        </label>

        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: u.color }}
              >
                {u.name.charAt(0)}
              </span>
              <span className="w-16 shrink-0 text-sm font-medium">{u.name}</span>
              <input
                inputMode="numeric"
                maxLength={6}
                placeholder={u.hasPin ? "•••• (con PIN)" : "Sin PIN"}
                className="input flex-1"
                value={pins[u.id] ?? ""}
                onChange={(e) => setPins((p) => ({ ...p, [u.id]: e.target.value.replace(/\D/g, "") }))}
              />
              <button className="btn btn-secondary" disabled={pending} onClick={() => savePin(u.id)}>
                Guardar
              </button>
              {u.hasPin && (
                <button
                  className="btn btn-ghost text-xs"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await setUserPin(u.id, null);
                      router.refresh();
                    })
                  }
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
        {message && <p className="mt-3 text-xs text-[var(--text-secondary)]">{message}</p>}
      </section>

      <section className="card p-4">
        <h2 className="mb-1 font-semibold">Gastos compartidos</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Elige cómo quieren manejar los saldos entre ambos.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className={`btn flex-1 ${settlementMode === "REEMBOLSO" ? "btn-primary" : "btn-secondary"}`}
            onClick={() =>
              startTransition(async () => {
                await setSettlementMode("REEMBOLSO");
                router.refresh();
              })
            }
          >
            🤝 Control de reembolsos
          </button>
          <button
            className={`btn flex-1 ${settlementMode === "PRESUPUESTO" ? "btn-primary" : "btn-secondary"}`}
            onClick={() =>
              startTransition(async () => {
                await setSettlementMode("PRESUPUESTO");
                router.refresh();
              })
            }
          >
            📊 Solo control presupuestario
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {settlementMode === "REEMBOLSO"
            ? "En \"Saldos entre nosotros\" verán quién le debe pagar a quién."
            : "En \"Saldos entre nosotros\" solo verán cuánto ha pagado cada quien, sin sugerencias de reembolso."}
        </p>
      </section>

      <section className="card p-4">
        <h2 className="mb-1 font-semibold">Sesión</h2>
        <form action={logout}>
          <button type="submit" className="btn btn-secondary">
            🔁 Cambiar de usuario
          </button>
        </form>
      </section>
    </div>
  );
}
