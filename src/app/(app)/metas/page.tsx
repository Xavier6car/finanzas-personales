import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GoalManager } from "@/components/goal/GoalManager";

export const dynamic = "force-dynamic";

export default async function MetasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const [users, goals] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.savingsGoal.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
      include: { contributions: true },
    }),
  ]);

  return (
    <GoalManager
      users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))}
      currentUserId={user.id}
      goals={goals}
    />
  );
}
