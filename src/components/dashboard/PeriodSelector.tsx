"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { PERIOD_LABELS, type PeriodKey } from "@/lib/period";

const OPTIONS: PeriodKey[] = ["this-month", "last-month", "last-3-months", "this-year", "custom"];

export function PeriodSelector({ current, start, end }: { current: PeriodKey; start?: string; end?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customStart, setCustomStart] = useState(start ?? "");
  const [customEnd, setCustomEnd] = useState(end ?? "");

  function apply(period: PeriodKey, s?: string, e?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    if (period === "custom") {
      if (s) params.set("start", s);
      if (e) params.set("end", e);
    } else {
      params.delete("start");
      params.delete("end");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => apply(opt, customStart, customEnd)}
          className={`btn ${current === opt ? "btn-primary" : "btn-secondary"} !py-1.5 !text-xs`}
        >
          {PERIOD_LABELS[opt]}
        </button>
      ))}
      {current === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            className="input !w-auto !py-1.5 text-xs"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <span className="text-xs text-[var(--text-muted)]">a</span>
          <input
            type="date"
            className="input !w-auto !py-1.5 text-xs"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
          <button className="btn btn-primary !py-1.5 !text-xs" onClick={() => apply("custom", customStart, customEnd)}>
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
