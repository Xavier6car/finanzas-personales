"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/actions/auth";
import { Icon, type IconName } from "@/components/ui/Icon";

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/ingresos", label: "Ingresos", icon: "income" },
  { href: "/gastos", label: "Gastos", icon: "expense" },
  { href: "/efectivo", label: "Efectivo", icon: "wallet" },
  { href: "/historial", label: "Historial", icon: "history" },
  { href: "/presupuestos", label: "Presupuestos", icon: "budget" },
  { href: "/metas", label: "Metas de ahorro", icon: "goal" },
  { href: "/saldos", label: "Saldos entre nosotros", icon: "users" },
  { href: "/ajustes", label: "Ajustes", icon: "settings" },
];

const MOBILE_PRIMARY = ["/", "/ingresos", "/gastos", "/historial"];

export function AppShell({
  user,
  otherUser,
  children,
}: {
  user: { id: string; name: string; color: string };
  otherUser: { id: string; name: string; color: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar desktop — fixed (no sticky) para no depender de la altura de sus hermanos en el flex */}
      <aside className="hidden w-64 flex-col overflow-y-auto border-r border-[var(--border)] bg-surface-1 p-4 md:fixed md:inset-y-0 md:left-0 md:flex md:z-20">
        <Brand />
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-brand text-white"
                  : "text-[var(--text-secondary)] hover:bg-surface-2"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <UserSwitcher user={user} otherUser={otherUser} />
      </aside>

      {/* Topbar mobile */}
      <div className="flex flex-1 flex-col md:ml-64">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-surface-1 px-4 py-3 md:hidden">
          <button
            aria-label="Abrir menú"
            className="btn btn-ghost !px-2"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <Brand compact />
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </span>
        </header>

        <main className="flex-1 pb-24 md:pb-8">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">{children}</div>
        </main>
      </div>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface-1 p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Brand />
              <button className="btn btn-ghost !px-2" onClick={() => setDrawerOpen(false)} aria-label="Cerrar">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium ${
                    isActive(item.href) ? "bg-brand text-white" : "text-[var(--text-secondary)] hover:bg-surface-2"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <UserSwitcher user={user} otherUser={otherUser} />
          </div>
        </div>
      )}

      {/* Bottom tab bar mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-[var(--border)] bg-surface-1 md:hidden">
        {NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive(item.href) ? "text-brand" : "text-[var(--text-muted)]"
            }`}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="w-full truncate text-center">{item.label}</span>
          </Link>
        ))}
        <button
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[var(--text-muted)]"
          onClick={() => setDrawerOpen(true)}
        >
          <Icon name="menu" className="h-5 w-5" />
          <span className="w-full truncate text-center">Más</span>
        </button>
      </nav>

      {/* FAB de acceso rápido */}
      <div className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-2 md:bottom-8 md:right-8">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2">
            <button
              className="btn btn-primary shadow-lg"
              onClick={() => {
                setFabOpen(false);
                router.push("/ingresos?nuevo=1");
              }}
            >
              <Icon name="income" className="h-4 w-4" />
              Nuevo ingreso
            </button>
            <button
              className="btn btn-primary shadow-lg"
              onClick={() => {
                setFabOpen(false);
                router.push("/gastos?nuevo=1");
              }}
            >
              <Icon name="expense" className="h-4 w-4" />
              Nuevo gasto
            </button>
          </div>
        )}
        <button
          aria-label="Agregar movimiento"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:opacity-90"
          onClick={() => setFabOpen((v) => !v)}
        >
          <Icon name={fabOpen ? "close" : "plus"} className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
        <Icon name="heart" className="h-4 w-4" />
      </span>
      {!compact && <span className="font-bold">Nosotros Finanzas</span>}
    </div>
  );
}

function UserSwitcher({
  user,
  otherUser,
}: {
  user: { id: string; name: string; color: string };
  otherUser: { id: string; name: string; color: string } | null;
}) {
  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: user.color }}
        >
          {user.name.charAt(0)}
        </span>
        <div>
          <p className="text-sm font-semibold">{user.name}</p>
          {otherUser && <p className="text-xs text-[var(--text-muted)]">con {otherUser.name}</p>}
        </div>
      </div>
      <form action={logout}>
        <button type="submit" className="btn btn-ghost w-full justify-start !px-2 text-sm">
          <Icon name="refresh" className="h-4 w-4" />
          Cambiar de usuario
        </button>
      </form>
    </div>
  );
}
