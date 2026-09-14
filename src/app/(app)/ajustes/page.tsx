import { prisma } from "@/lib/prisma";
import { getCurrentUser, getAppSettings } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/quien-eres");

  const [users, settings] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getAppSettings(),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Ajustes</h1>
      <SettingsForm
        users={users.map((u) => ({ id: u.id, name: u.name, color: u.color, hasPin: !!u.pinHash }))}
        requirePin={settings.requirePin}
        settlementMode={settings.settlementMode as "REEMBOLSO" | "PRESUPUESTO"}
      />
    </div>
  );
}
