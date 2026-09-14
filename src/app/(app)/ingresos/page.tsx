import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IncomeManager } from "@/components/income/IncomeManager";

export const dynamic = "force-dynamic";

export default async function IngresosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const [users, incomes] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.income.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <IncomeManager
      users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))}
      currentUserId={user.id}
      incomes={incomes}
    />
  );
}
