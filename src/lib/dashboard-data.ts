import "server-only";
import { prisma } from "@/lib/prisma";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { lastNMonthKeys, toMonthKey, type DateRange } from "@/lib/period";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface PersonTotals {
  userId: string;
  name: string;
  color: string;
  incomes: number;
  expenses: number;
}

export interface CategoryTotal {
  category: string;
  icon: string;
  amount: number;
}

export interface MonthPoint {
  month: string;
  label: string;
  incomes: number;
  expenses: number;
  savings: number;
}

export interface DashboardData {
  totals: {
    incomesHousehold: number;
    expensesHousehold: number;
    sharedExpenses: number;
    individualExpenses: number;
    balance: number;
    cumulativeSavings: number;
    percentSpent: number;
  };
  perPerson: PersonTotals[];
  categoryTotals: CategoryTotal[];
  monthly: MonthPoint[];
}

export async function getDashboardData(range: DateRange): Promise<DashboardData> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  const [incomes, expenses, allIncomesBefore, allExpensesBefore] = await Promise.all([
    prisma.income.findMany({ where: { date: { gte: range.start, lt: range.end } } }),
    prisma.expense.findMany({
      where: { date: { gte: range.start, lt: range.end } },
      include: { shares: true },
    }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { date: { lt: range.end } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { lt: range.end } } }),
  ]);

  const incomesHousehold = round2(incomes.reduce((a, i) => a + i.amount, 0));
  const expensesHousehold = round2(expenses.reduce((a, e) => a + e.amount, 0));
  const sharedExpenses = round2(expenses.filter((e) => e.isShared).reduce((a, e) => a + e.amount, 0));
  const individualExpenses = round2(expensesHousehold - sharedExpenses);
  const balance = round2(incomesHousehold - expensesHousehold);
  const cumulativeSavings = round2(
    (allIncomesBefore._sum.amount ?? 0) - (allExpensesBefore._sum.amount ?? 0),
  );
  const percentSpent = incomesHousehold > 0 ? round2((expensesHousehold / incomesHousehold) * 100) : 0;

  const perPerson: PersonTotals[] = users.map((u) => {
    const userIncomes = round2(incomes.filter((i) => i.userId === u.id).reduce((a, i) => a + i.amount, 0));
    const userExpenseShare = round2(
      expenses.reduce((acc, e) => acc + (e.shares.find((s) => s.userId === u.id)?.amount ?? 0), 0),
    );
    return { userId: u.id, name: u.name, color: u.color, incomes: userIncomes, expenses: userExpenseShare };
  });

  const byCategory = new Map<string, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  const sortedCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const TOP_N = 7;
  const top = sortedCategories.slice(0, TOP_N);
  const restSum = sortedCategories.slice(TOP_N).reduce((a, [, v]) => a + v, 0);
  const categoryTotals: CategoryTotal[] = top.map(([category, amount]) => ({
    category,
    icon: EXPENSE_CATEGORIES.find((c) => c.value === category)?.icon ?? "•",
    amount: round2(amount),
  }));
  if (restSum > 0) categoryTotals.push({ category: "Otros", icon: "➕", amount: round2(restSum) });

  const monthKeys = lastNMonthKeys(6);
  const rangeStartForMonths = new Date(monthKeys[0] + "-01T00:00:00Z");
  const [monthlyIncomes, monthlyExpenses] = await Promise.all([
    prisma.income.findMany({ where: { date: { gte: rangeStartForMonths } } }),
    prisma.expense.findMany({ where: { date: { gte: rangeStartForMonths } } }),
  ]);
  const monthly: MonthPoint[] = monthKeys.map((key) => {
    const inc = round2(
      monthlyIncomes.filter((i) => toMonthKey(i.date) === key).reduce((a, i) => a + i.amount, 0),
    );
    const exp = round2(
      monthlyExpenses.filter((e) => toMonthKey(e.date) === key).reduce((a, e) => a + e.amount, 0),
    );
    const [y, m] = key.split("-").map(Number);
    const label = new Intl.DateTimeFormat("es-EC", { month: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, 1)),
    );
    return { month: key, label, incomes: inc, expenses: exp, savings: round2(inc - exp) };
  });

  return {
    totals: {
      incomesHousehold,
      expensesHousehold,
      sharedExpenses,
      individualExpenses,
      balance,
      cumulativeSavings,
      percentSpent,
    },
    perPerson,
    categoryTotals,
    monthly,
  };
}
