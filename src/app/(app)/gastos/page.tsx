import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExpenseManager } from "@/components/expense/ExpenseManager";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const [users, expenses] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, include: { shares: true } }),
  ]);

  return (
    <ExpenseManager
      users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))}
      currentUserId={user.id}
      expenses={expenses}
    />
  );
}
