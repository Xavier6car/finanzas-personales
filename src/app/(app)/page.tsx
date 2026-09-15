import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard-data";
import { getCashBalances } from "@/lib/cash-data";
import { getRangeForPeriod, type PeriodKey } from "@/lib/period";
import { formatMoney, formatPercent } from "@/lib/format";
import { StatCard } from "@/components/dashboard/StatCard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { PersonSelector } from "@/components/dashboard/PersonSelector";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { PersonComparisonChart } from "@/components/dashboard/PersonComparisonChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { SharedVsIndividualBar } from "@/components/dashboard/SharedVsIndividualBar";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const period = (typeof sp.period === "string" ? sp.period : "this-month") as PeriodKey;
  const start = typeof sp.start === "string" ? sp.start : undefined;
  const end = typeof sp.end === "string" ? sp.end : undefined;
  const personParam = typeof sp.person === "string" ? sp.person : "all";

  const range = getRangeForPeriod(period, start, end);
  const [users, data, cashBalances] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getDashboardData(range, personParam === "all" ? undefined : personParam),
    getCashBalances(),
  ]);

  // Si el "person" de la URL no corresponde a ningún usuario real, se trata como "Todos".
  const personId = users.some((u) => u.id === personParam) ? personParam : "all";
  const totalCash =
    personId === "all"
      ? cashBalances.reduce((a, b) => a + b.balance, 0)
      : (cashBalances.find((c) => c.userId === personId)?.balance ?? 0);
  // "Ahorro acumulado" (histórico ingresos-gastos) ya incorpora el efecto del
  // efectivo; se resta aquí para mostrar solo el componente bancario.
  const bankSavings = data.totals.cumulativeSavings - totalCash;
  const totalBalance = bankSavings + totalCash;
  const selectedPerson = data.perPerson[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Resumen financiero</h1>
        <PeriodSelector current={period} start={start} end={end} />
      </div>

      <PersonSelector current={personId} users={users.map((u) => ({ id: u.id, name: u.name, color: u.color }))} />

      {/* KPIs por persona */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {personId === "all" ? (
          <>
            {data.perPerson.map((p) => (
              <StatCard key={p.userId} label={`Ingresos · ${p.name}`} value={formatMoney(p.incomes)} tone="good" icon="💵" />
            ))}
            <StatCard label="Ingresos del hogar" value={formatMoney(data.totals.incomesHousehold)} tone="good" icon="🏡" />

            {data.perPerson.map((p) => (
              <StatCard key={p.userId + "-e"} label={`Gastos · ${p.name}`} value={formatMoney(p.expenses)} tone="critical" icon="🧾" />
            ))}
            <StatCard label="Gastos compartidos" value={formatMoney(data.totals.sharedExpenses)} icon="🤝" />
          </>
        ) : (
          <>
            <StatCard label={`Ingresos · ${selectedPerson?.name}`} value={formatMoney(data.totals.incomesHousehold)} tone="good" icon="💵" />
            <StatCard label={`Gastos · ${selectedPerson?.name}`} value={formatMoney(data.totals.expensesHousehold)} tone="critical" icon="🧾" />
            <StatCard label="Su parte de gastos compartidos" value={formatMoney(data.totals.sharedExpenses)} icon="🤝" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Gastos generales" value={formatMoney(data.totals.expensesHousehold)} icon="📉" />
        <StatCard
          label="Balance del período"
          value={formatMoney(totalBalance)}
          tone={totalBalance >= 0 ? "good" : "critical"}
          icon="⚖️"
        />
        <StatCard label="Ahorro acumulado" value={formatMoney(bankSavings)} icon="🏦" />
        <StatCard label="Efectivo disponible" value={formatMoney(totalCash)} tone={totalCash < 0 ? "critical" : "default"} icon="💰" />
        <StatCard
          label="% de ingresos gastado"
          value={formatPercent(data.totals.percentSpent)}
          tone={data.totals.percentSpent > 90 ? "critical" : "default"}
          icon="📐"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 font-semibold">Gastos por categoría</h2>
          <CategoryBarChart data={data.categoryTotals} />
        </section>

        {personId === "all" && (
          <section className="card p-4">
            <h2 className="mb-3 font-semibold">Ingresos vs. gastos por persona</h2>
            <PersonComparisonChart data={data.perPerson} />
          </section>
        )}

        <section className="card p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Evolución mensual (últimos 6 meses)</h2>
          <MonthlyTrendChart data={data.monthly} />
        </section>

        <section className="card p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Gastos compartidos vs. individuales</h2>
          <SharedVsIndividualBar shared={data.totals.sharedExpenses} individual={data.totals.individualExpenses} />
        </section>
      </div>
    </div>
  );
}
