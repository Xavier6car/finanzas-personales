"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie, getAppSettings } from "@/lib/auth";

export interface LoginResult {
  ok: boolean;
  needsPin?: boolean;
  error?: string;
}

export async function loginAsUser(userId: string, pin?: string): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  const settings = await getAppSettings();

  if (settings.requirePin && user.pinHash) {
    if (!pin) return { ok: false, needsPin: true };
    const valid = await bcrypt.compare(pin, user.pinHash);
    if (!valid) return { ok: false, needsPin: true, error: "PIN incorrecto." };
  }

  await setSessionCookie(user.id);
  return { ok: true };
}

export async function logout() {
  await clearSessionCookie();
  redirect("/quien-eres");
}

export async function setUserPin(userId: string, pin: string | null) {
  const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
  await prisma.user.update({ where: { id: userId }, data: { pinHash } });
}

export async function setRequirePin(requirePin: boolean) {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { requirePin },
    create: { id: "singleton", requirePin },
  });
}

export async function setSettlementMode(mode: "REEMBOLSO" | "PRESUPUESTO") {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { settlementMode: mode },
    create: { id: "singleton", settlementMode: mode },
  });
}
