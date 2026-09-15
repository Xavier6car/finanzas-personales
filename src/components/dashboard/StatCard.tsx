import { Icon, type IconName } from "@/components/ui/Icon";

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "critical";
  icon?: IconName;
}) {
  const toneClass = tone === "good" ? "text-good" : tone === "critical" ? "text-critical" : "text-[var(--text-primary)]";
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}
