"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export interface BudgetInput {
  category: string;
  month: string; // YYYY-MM
  amount: number;
  scope: "PERSON" | "SHARED";
  userId?: string | null;
}

function validate(input: BudgetInput): string | null {
  if (!input.category) return "Selecciona una categoría.";
  if (!/^\d{4}-\d{2}$/.test(input.month)) return "Selecciona un mes válido.";
  if (!Number.isFinite(input.amount) || input.amount <= 0) return "El presupuesto debe ser mayor a 0.";
  if (input.scope === "PERSON" && !input.userId) return "Selecciona la persona para este presupuesto.";
  return null;
}

/** Crea o actualiza (upsert manual) evitando el caso de userId nulo en la constraint única de SQLite. */
export async function saveBudget(input: BudgetInput, id?: string): Promise<ActionResult<{ id: string }>> {
  const error = validate(input);
  if (error) return fail(error);

  const userId = input.scope === "SHARED" ? null : input.userId ?? null;

  const existing = await prisma.budget.findFirst({
    where: {
      category: input.category,
      month: input.month,
      scope: input.scope,
      userId,
      NOT: id ? { id } : undefined,
    },
  });
  if (existing) return fail("Ya existe un presupuesto para esta categoría, mes y alcance.");

  const budget = id
    ? await prisma.budget.update({
        where: { id },
        data: { category: input.category, month: input.month, amount: input.amount, scope: input.scope, userId },
      })
    : await prisma.budget.create({
        data: { category: input.category, month: input.month, amount: input.amount, scope: input.scope, userId },
      });

  revalidatePath("/presupuestos");
  return ok({ id: budget.id });
}

export async function deleteBudget(id: string): Promise<ActionResult<{ id: string }>> {
  await prisma.budget.delete({ where: { id } });
  revalidatePath("/presupuestos");
  return ok({ id });
}
