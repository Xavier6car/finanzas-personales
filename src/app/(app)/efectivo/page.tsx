import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCashBalances } from "@/lib/cash-data";
import { CashManager } from "@/components/cash/CashManager";

export const dynamic = "force-dynamic";

export default async function EfectivoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const [users, balances] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getCashBalances(),
  ]);

  return (
    <CashManager
      users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))}
      currentUserId={user.id}
      balances={balances}
    />
  );
}
