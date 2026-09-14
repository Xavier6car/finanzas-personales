"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export interface CashMovementInput {
  userId: string;
  amount: number; // positivo = entra efectivo, negativo = sale sin ser gasto
  description: string;
  date: string; // YYYY-MM-DD
}

function validate(input: CashMovementInput): string | null {
  if (!input.userId) return "Selecciona a quién le corresponde este efectivo.";
  if (!Number.isFinite(input.amount) || input.amount === 0) return "El monto no puede ser cero.";
  if (!input.description || input.description.trim().length < 2) return "Agrega una descripción breve.";
  if (!input.date) return "Selecciona la fecha.";
  return null;
}

export async function createCashMovement(input: CashMovementInput): Promise<ActionResult<{ id: string }>> {
  const error = validate(input);
  if (error) return fail(error);

  const movement = await prisma.cashMovement.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      description: input.description.trim(),
      date: new Date(input.date + "T00:00:00Z"),
    },
  });

  revalidatePath("/efectivo");
  revalidatePath("/gastos");
  revalidatePath("/");
  return ok({ id: movement.id });
}

export async function deleteCashMovement(id: string): Promise<ActionResult<{ id: string }>> {
  await prisma.cashMovement.delete({ where: { id } });
  revalidatePath("/efectivo");
  revalidatePath("/gastos");
  revalidatePath("/");
  return ok({ id });
}
