"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/ingresos", label: "Ingresos", icon: "💵" },
  { href: "/gastos", label: "Gastos", icon: "🧾" },
  { href: "/historial", label: "Historial", icon: "📜" },
  { href: "/presupuestos", label: "Presupuestos", icon: "📊" },
  { href: "/metas", label: "Metas de ahorro", icon: "🎯" },
  { href: "/saldos", label: "Saldos entre nosotros", icon: "🤝" },
  { href: "/ajustes", label: "Ajustes", icon: "⚙️" },
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
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-surface-1 p-4 md:flex">
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
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <UserSwitcher user={user} otherUser={otherUser} />
      </aside>

      {/* Topbar mobile */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-surface-1 px-4 py-3 md:hidden">
          <button
            aria-label="Abrir menú"
            className="btn btn-ghost !px-2"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="text-xl">☰</span>
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
                ✕
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
                  <span aria-hidden>{item.icon}</span>
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
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive(item.href) ? "text-brand" : "text-[var(--text-muted)]"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
        <button
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[var(--text-muted)]"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="text-lg" aria-hidden>
            ⋯
          </span>
          Más
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
              💵 Nuevo ingreso
            </button>
            <button
              className="btn btn-primary shadow-lg"
              onClick={() => {
                setFabOpen(false);
                router.push("/gastos?nuevo=1");
              }}
            >
              🧾 Nuevo gasto
            </button>
          </div>
        )}
        <button
          aria-label="Agregar movimiento"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lg transition hover:opacity-90"
          onClick={() => setFabOpen((v) => !v)}
        >
          {fabOpen ? "✕" : "+"}
        </button>
      </div>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">💛</span>
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
          🔁 Cambiar de usuario
        </button>
      </form>
    </div>
  );
}
