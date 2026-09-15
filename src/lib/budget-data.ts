import "server-only";
import { prisma } from "@/lib/prisma";
import { toMonthKey } from "@/lib/period";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface BudgetMovement {
  id: string;
  description: string;
  date: string; // ISO
  amount: number; // porción que cuenta para este presupuesto (share si es PERSON, total si es SHARED)
  paidByName: string;
  isShared: boolean;
}

export interface BudgetProgress {
  id: string;
  category: string;
  month: string;
  amount: number;
  scope: "PERSON" | "SHARED";
  userId: string | null;
  spent: number;
  remaining: number;
  percent: number;
  movements: BudgetMovement[];
}

export async function getBudgetProgress(month: string): Promise<BudgetProgress[]> {
  const budgets = await prisma.budget.findMany({ where: { month }, orderBy: { category: "asc" } });

  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: start, lt: end } },
    include: { shares: true, paidBy: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return budgets.map((b) => {
    const categoryExpenses = expenses.filter((e) => e.category === b.category);
    const movements: BudgetMovement[] = [];
    let spent = 0;
    if (b.scope === "SHARED" || !b.userId) {
      for (const e of categoryExpenses) {
        spent += e.amount;
        movements.push({
          id: e.id,
          description: e.description,
          date: e.date.toISOString(),
          amount: round2(e.amount),
          paidByName: e.paidBy.name,
          isShared: e.isShared,
        });
      }
    } else {
      for (const e of categoryExpenses) {
        const share = e.shares.find((s) => s.userId === b.userId)?.amount ?? 0;
        if (share === 0) continue;
        spent += share;
        movements.push({
          id: e.id,
          description: e.description,
          date: e.date.toISOString(),
          amount: round2(share),
          paidByName: e.paidBy.name,
          isShared: e.isShared,
        });
      }
    }
    spent = round2(spent);
    const remaining = round2(b.amount - spent);
    const percent = b.amount > 0 ? round2((spent / b.amount) * 100) : 0;
    return {
      id: b.id,
      category: b.category,
      month: b.month,
      amount: b.amount,
      scope: b.scope as "PERSON" | "SHARED",
      userId: b.userId,
      spent,
      remaining,
      percent,
      movements,
    };
  });
}

export { toMonthKey };
