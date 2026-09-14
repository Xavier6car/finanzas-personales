import "server-only";
import { prisma } from "@/lib/prisma";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface CashLedgerEntry {
  id: string;
  kind: "movement" | "expense";
  date: Date;
  description: string;
  amount: number; // ya con signo: positivo suma, negativo resta
}

export interface CashBalance {
  userId: string;
  name: string;
  color: string;
  balance: number;
  ledger: CashLedgerEntry[];
}

/** Calcula el efectivo disponible de cada persona: retiros/ajustes − gastos pagados en efectivo. */
export async function getCashBalances(): Promise<CashBalance[]> {
  const [users, movements, cashExpenses] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.cashMovement.findMany({ orderBy: { date: "desc" } }),
    prisma.expense.findMany({
      where: { paidWithCash: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return users.map((u) => {
    const userMovements = movements.filter((m) => m.userId === u.id);
    const userExpenses = cashExpenses.filter((e) => e.paidById === u.id);

    const ledger: CashLedgerEntry[] = [
      ...userMovements.map((m) => ({
        id: m.id,
        kind: "movement" as const,
        date: m.date,
        description: m.description,
        amount: round2(m.amount),
      })),
      ...userExpenses.map((e) => ({
        id: e.id,
        kind: "expense" as const,
        date: e.date,
        description: e.description,
        amount: round2(-e.amount),
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const balance = round2(ledger.reduce((acc, entry) => acc + entry.amount, 0));

    return { userId: u.id, name: u.name, color: u.color, balance, ledger };
  });
}
