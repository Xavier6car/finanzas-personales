import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBudgetProgress } from "@/lib/budget-data";
import { currentMonthKey } from "@/lib/period";
import { BudgetManager } from "@/components/budget/BudgetManager";

export const dynamic = "force-dynamic";

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const sp = await searchParams;
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : currentMonthKey();

  const [users, budgets] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getBudgetProgress(month),
  ]);

  return (
    <BudgetManager users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))} month={month} budgets={budgets} />
  );
}
