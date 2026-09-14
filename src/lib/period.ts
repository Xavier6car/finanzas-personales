export type PeriodKey =
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "this-year"
  | "custom";

export interface DateRange {
  start: Date;
  end: Date; // exclusivo (inicio del día siguiente al último día)
}

function startOfMonthUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/** Devuelve el rango [start, end) para un período predefinido, en UTC. */
export function getRangeForPeriod(
  period: PeriodKey,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date(),
): DateRange {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  switch (period) {
    case "this-month":
      return { start: startOfMonthUTC(y, m), end: startOfMonthUTC(y, m + 1) };
    case "last-month":
      return { start: startOfMonthUTC(y, m - 1), end: startOfMonthUTC(y, m) };
    case "last-3-months":
      return { start: startOfMonthUTC(y, m - 2), end: startOfMonthUTC(y, m + 1) };
    case "this-year":
      return { start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y + 1, 0, 1)) };
    case "custom": {
      const start = customStart ? new Date(customStart + "T00:00:00Z") : startOfMonthUTC(y, m);
      const endBase = customEnd ? new Date(customEnd + "T00:00:00Z") : now;
      const end = new Date(endBase.getTime() + 24 * 60 * 60 * 1000); // inclusivo del día final
      return { start, end };
    }
    default:
      return { start: startOfMonthUTC(y, m), end: startOfMonthUTC(y, m + 1) };
  }
}

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  "this-month": "Este mes",
  "last-month": "Mes anterior",
  "last-3-months": "Últimos 3 meses",
  "this-year": "Este año",
  custom: "Rango personalizado",
};

export function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  return toMonthKey(new Date());
}

/** Genera las claves de mes (YYYY-MM) de los últimos n meses, incluyendo el actual, en orden ascendente. */
export function lastNMonthKeys(n: number, now: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(toMonthKey(d));
  }
  return keys;
}
