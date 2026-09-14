import "server-only";
import { prisma } from "@/lib/prisma";
import { toMonthKey } from "@/lib/period";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
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
}

export async function getBudgetProgress(month: string): Promise<BudgetProgress[]> {
  const budgets = await prisma.budget.findMany({ where: { month }, orderBy: { category: "asc" } });

  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: start, lt: end } },
    include: { shares: true },
  });

  return budgets.map((b) => {
    let spent = 0;
    if (b.scope === "SHARED" || !b.userId) {
      spent = expenses.filter((e) => e.category === b.category).reduce((acc, e) => acc + e.amount, 0);
    } else {
      spent = expenses
        .filter((e) => e.category === b.category)
        .reduce((acc, e) => acc + (e.shares.find((s) => s.userId === b.userId)?.amount ?? 0), 0);
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
    };
  });
}

export { toMonthKey };
