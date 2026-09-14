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
  icon?: string;
}) {
  const toneClass = tone === "good" ? "text-good" : tone === "critical" ? "text-critical" : "text-[var(--text-primary)]";
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold ${toneClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}
