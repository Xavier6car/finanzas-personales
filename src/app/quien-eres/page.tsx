import { prisma } from "@/lib/prisma";
import { getAppSettings, getCurrentUser } from "@/lib/auth";
import { UserPicker } from "@/components/auth/UserPicker";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function QuienEresPage() {
  const [users, settings, currentUser] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getAppSettings(),
    getCurrentUser(),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
            <Icon name="heart" className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">¿Quién eres?</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Selecciona tu nombre para entrar a las finanzas de la casa.
          </p>
        </div>

        <UserPicker
          users={users.map((u) => ({ id: u.id, name: u.name, color: u.color, hasPin: !!u.pinHash }))}
          requirePin={settings.requirePin}
          currentUserId={currentUser?.id ?? null}
        />

        <p className="mt-8 text-xs text-[var(--text-muted)]">
          No se solicita correo ni contraseña. Ambos ven la misma información financiera.
        </p>
      </div>
    </main>
  );
}
