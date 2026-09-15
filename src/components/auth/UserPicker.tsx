"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAsUser } from "@/actions/auth";
import { Icon } from "@/components/ui/Icon";

interface UserOption {
  id: string;
  name: string;
  color: string;
  hasPin: boolean;
}

export function UserPicker({
  users,
  requirePin,
  currentUserId,
}: {
  users: UserOption[];
  requirePin: boolean;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pinFor, setPinFor] = useState<UserOption | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function select(user: UserOption) {
    setError(null);
    if (requirePin && user.hasPin) {
      setPinFor(user);
      setPin("");
      return;
    }
    startTransition(async () => {
      const res = await loginAsUser(user.id);
      if (res.ok) router.push("/");
      else setError(res.error ?? "No se pudo iniciar sesión.");
    });
  }

  function submitPin() {
    if (!pinFor) return;
    startTransition(async () => {
      const res = await loginAsUser(pinFor.id, pin);
      if (res.ok) {
        router.push("/");
      } else {
        setError(res.error ?? "PIN incorrecto.");
        setPin("");
      }
    });
  }

  if (pinFor) {
    return (
      <div className="card p-6">
        <p className="mb-4 text-sm font-semibold">Ingresa el PIN de {pinFor.name}</p>
        <input
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          className="input mb-3 text-center text-2xl tracking-[0.5em]"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submitPin()}
        />
        {error && <p className="mb-3 text-sm text-critical">{error}</p>}
        <div className="flex gap-2">
          <button className="btn btn-secondary flex-1" onClick={() => setPinFor(null)} disabled={pending}>
            Volver
          </button>
          <button className="btn btn-primary flex-1" onClick={submitPin} disabled={pending || pin.length < 4}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => select(user)}
          disabled={pending}
          className="card flex items-center gap-4 p-4 text-left transition hover:shadow-md disabled:opacity-60"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0)}
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{user.name}</span>
            {user.id === currentUserId && (
              <span className="block text-xs text-[var(--text-muted)]">Última sesión en este dispositivo</span>
            )}
          </span>
          {requirePin && user.hasPin && <Icon name="lock" className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />}
        </button>
      ))}
      {error && <p className="text-sm text-critical">{error}</p>}
    </div>
  );
}
