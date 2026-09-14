import { prisma } from "@/lib/prisma";
import { getCurrentUser, getAppSettings } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRangeForPeriod, type PeriodKey } from "@/lib/period";
import { SettlementView } from "@/components/settlement/SettlementView";

export const dynamic = "force-dynamic";

export default async function SaldosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const sp = await searchParams;
  const period = (typeof sp.period === "string" ? sp.period : "this-month") as PeriodKey;
  const start = typeof sp.start === "string" ? sp.start : undefined;
  const end = typeof sp.end === "string" ? sp.end : undefined;
  const range = getRangeForPeriod(period, start, end);

  const [users, expenses, settings] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({
      where: { isShared: true, date: { gte: range.start, lt: range.end } },
      orderBy: { date: "desc" },
      include: { shares: true },
    }),
    getAppSettings(),
  ]);

  return (
    <SettlementView
      users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))}
      expenses={expenses}
      settlementMode={settings.settlementMode as "REEMBOLSO" | "PRESUPUESTO"}
      period={period}
      start={start}
      end={end}
    />
  );
}
