"use client";

import { useState, useTransition } from "react";

export function ConfirmButton({
  onConfirm,
  label = "Eliminar",
  confirmLabel = "¿Seguro?",
}: {
  onConfirm: () => Promise<unknown>;
  label?: string;
  confirmLabel?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-[var(--text-secondary)]">{confirmLabel}</span>
        <button
          className="btn btn-danger !px-2 !py-1 text-xs"
          disabled={pending}
          onClick={() => startTransition(async () => { await onConfirm(); })}
        >
          Sí, eliminar
        </button>
        <button className="btn btn-ghost !px-2 !py-1 text-xs" onClick={() => setConfirming(false)} disabled={pending}>
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button className="btn btn-ghost !px-2 !py-1 text-xs text-critical" onClick={() => setConfirming(true)}>
      {label}
    </button>
  );
}
