"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export interface IncomeInput {
  userId: string;
  type: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  account?: string;
  notes?: string;
}

function validate(input: IncomeInput): string | null {
  if (!input.userId) return "Selecciona quién recibió el ingreso.";
  if (!input.type) return "Selecciona el tipo de ingreso.";
  if (!input.description || input.description.trim().length < 2)
    return "La descripción es obligatoria.";
  if (!Number.isFinite(input.amount) || input.amount <= 0)
    return "El monto debe ser un número mayor a 0.";
  if (!input.date) return "Selecciona la fecha del ingreso.";
  return null;
}

export async function createIncome(input: IncomeInput): Promise<ActionResult<{ id: string }>> {
  const error = validate(input);
  if (error) return fail(error);

  const income = await prisma.income.create({
    data: {
      userId: input.userId,
      type: input.type,
      description: input.description.trim(),
      amount: input.amount,
      date: new Date(input.date + "T00:00:00Z"),
      account: input.account?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/ingresos");
  revalidatePath("/historial");
  return ok({ id: income.id });
}

export async function updateIncome(id: string, input: IncomeInput): Promise<ActionResult<{ id: string }>> {
  const error = validate(input);
  if (error) return fail(error);

  const income = await prisma.income.update({
    where: { id },
    data: {
      userId: input.userId,
      type: input.type,
      description: input.description.trim(),
      amount: input.amount,
      date: new Date(input.date + "T00:00:00Z"),
      account: input.account?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/ingresos");
  revalidatePath("/historial");
  return ok({ id: income.id });
}

export async function deleteIncome(id: string): Promise<ActionResult<{ id: string }>> {
  await prisma.income.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/ingresos");
  revalidatePath("/historial");
  return ok({ id });
}
