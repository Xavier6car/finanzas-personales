import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/nav/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const otherUser = await prisma.user.findFirst({ where: { id: { not: user.id } } });

  return (
    <AppShell
      user={{ id: user.id, name: user.name, color: user.color }}
      otherUser={otherUser ? { id: otherUser.id, name: otherUser.name, color: otherUser.color } : null}
    >
      {children}
    </AppShell>
  );
}
