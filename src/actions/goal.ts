"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export interface GoalInput {
  name: string;
  targetAmount: number;
  targetDate?: string | null;
  icon: string;
}

function validateGoal(input: GoalInput): string | null {
  if (!input.name || input.name.trim().length < 2) return "Ponle un nombre a la meta.";
  if (!Number.isFinite(input.targetAmount) || input.targetAmount <= 0) return "El objetivo debe ser mayor a 0.";
  return null;
}

export async function createGoal(input: GoalInput): Promise<ActionResult<{ id: string }>> {
  const error = validateGoal(input);
  if (error) return fail(error);

  const goal = await prisma.savingsGoal.create({
    data: {
      name: input.name.trim(),
      targetAmount: input.targetAmount,
      targetDate: input.targetDate ? new Date(input.targetDate + "T00:00:00Z") : null,
      icon: input.icon || "🎯",
    },
  });
  revalidatePath("/metas");
  return ok({ id: goal.id });
}

export async function updateGoal(id: string, input: GoalInput): Promise<ActionResult<{ id: string }>> {
  const error = validateGoal(input);
  if (error) return fail(error);

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      name: input.name.trim(),
      targetAmount: input.targetAmount,
      targetDate: input.targetDate ? new Date(input.targetDate + "T00:00:00Z") : null,
      icon: input.icon || "🎯",
    },
  });
  revalidatePath("/metas");
  return ok({ id: goal.id });
}

export async function deleteGoal(id: string): Promise<ActionResult<{ id: string }>> {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/metas");
  return ok({ id });
}

export async function archiveGoal(id: string, archived: boolean): Promise<ActionResult<{ id: string }>> {
  await prisma.savingsGoal.update({ where: { id }, data: { archived } });
  revalidatePath("/metas");
  return ok({ id });
}

export interface ContributionInput {
  goalId: string;
  userId: string;
  amount: number;
  date: string;
  note?: string;
}

export async function addContribution(input: ContributionInput): Promise<ActionResult<{ id: string }>> {
  if (!input.goalId) return fail("Meta inválida.");
  if (!input.userId) return fail("Selecciona quién realizó el aporte.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) return fail("El aporte debe ser mayor a 0.");
  if (!input.date) return fail("Selecciona la fecha del aporte.");

  const contribution = await prisma.goalContribution.create({
    data: {
      goalId: input.goalId,
      userId: input.userId,
      amount: input.amount,
      date: new Date(input.date + "T00:00:00Z"),
      note: input.note?.trim() || null,
    },
  });
  revalidatePath("/metas");
  return ok({ id: contribution.id });
}

export async function deleteContribution(id: string): Promise<ActionResult<{ id: string }>> {
  await prisma.goalContribution.delete({ where: { id } });
  revalidatePath("/metas");
  return ok({ id });
}
