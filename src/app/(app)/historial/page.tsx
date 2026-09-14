import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCashBalances } from "@/lib/cash-data";
import { HistorialManager } from "@/components/historial/HistorialManager";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const [users, incomes, expenses, cashBalances] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.income.findMany({ orderBy: { date: "desc" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, include: { shares: true } }),
    getCashBalances(),
  ]);

  return (
    <HistorialManager
      users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))}
      currentUserId={user.id}
      incomes={incomes}
      expenses={expenses}
      cashBalances={cashBalances.map((c) => ({ userId: c.userId, balance: c.balance }))}
    />
  );
}
