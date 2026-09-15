"use client";

import { useState, useTransition } from "react";

export function ConfirmButton({
  onConfirm,
  label = "Eliminar",
  confirmLabel = "¿Seguro?",
  confirmActionLabel = "Sí, eliminar",
  tone = "critical",
}: {
  onConfirm: () => Promise<unknown>;
  label?: string;
  confirmLabel?: string;
  confirmActionLabel?: string;
  tone?: "critical" | "good";
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-[var(--text-secondary)]">{confirmLabel}</span>
        <button
          className={`btn !px-2 !py-1 text-xs ${tone === "critical" ? "btn-danger" : "btn-primary"}`}
          disabled={pending}
          onClick={() => startTransition(async () => { await onConfirm(); })}
        >
          {confirmActionLabel}
        </button>
        <button className="btn btn-ghost !px-2 !py-1 text-xs" onClick={() => setConfirming(false)} disabled={pending}>
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      className={`btn btn-ghost !px-2 !py-1 text-xs ${tone === "critical" ? "text-critical" : "text-good"}`}
      onClick={() => setConfirming(true)}
    >
      {label}
    </button>
  );
}
