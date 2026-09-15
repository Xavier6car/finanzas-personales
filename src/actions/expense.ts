"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export interface ExpenseShareInput {
  userId: string;
  amount: number;
}

export interface ExpenseInput {
  paidById: string;
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  isShared: boolean;
  splitType: "NONE" | "EQUAL" | "CUSTOM";
  customShares?: ExpenseShareInput[];
  paidWithCash?: boolean;
  notes?: string;
  pendingReimbursement?: boolean; // true = marcarlo como pendiente de que te lo devuelvan
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

async function buildShares(input: ExpenseInput): Promise<ExpenseShareInput[] | string> {
  if (!input.isShared) {
    return [{ userId: input.paidById, amount: round2(input.amount) }];
  }

  const users = await prisma.user.findMany({ select: { id: true } });

  if (input.splitType === "EQUAL") {
    if (users.length !== 2) return "Se requieren exactamente 2 usuarios para dividir 50/50.";
    const half = round2(input.amount / 2);
    const other = round2(input.amount - half);
    return [
      { userId: users[0].id, amount: half },
      { userId: users[1].id, amount: other },
    ];
  }

  if (input.splitType === "CUSTOM") {
    const shares = input.customShares ?? [];
    if (shares.length === 0) return "Define cuánto corresponde a cada persona.";
    const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
    if (Math.abs(sum - round2(input.amount)) > 0.01) {
      return `La suma de las participaciones (${sum.toFixed(2)}) debe ser igual al monto total (${input.amount.toFixed(2)}).`;
    }
    if (shares.some((s) => s.amount < 0)) return "Las participaciones no pueden ser negativas.";
    return shares.map((s) => ({ userId: s.userId, amount: round2(s.amount) }));
  }

  return "Selecciona cómo se distribuye el gasto compartido.";
}

function validateBase(input: ExpenseInput): string | null {
  if (!input.paidById) return "Selecciona quién pagó el gasto.";
  if (!input.category) return "Selecciona la categoría del gasto.";
  if (!input.description || input.description.trim().length < 2)
    return "La descripción es obligatoria para identificar el gasto.";
  if (!Number.isFinite(input.amount) || input.amount <= 0)
    return "El monto debe ser un número mayor a 0.";
  if (!input.date) return "Selecciona la fecha del gasto.";
  return null;
}

export async function createExpense(input: ExpenseInput): Promise<ActionResult<{ id: string }>> {
  const baseError = validateBase(input);
  if (baseError) return fail(baseError);

  const shares = await buildShares(input);
  if (typeof shares === "string") return fail(shares);

  const expense = await prisma.expense.create({
    data: {
      paidById: input.paidById,
      category: input.category,
      description: input.description.trim(),
      amount: round2(input.amount),
      date: new Date(input.date + "T00:00:00Z"),
      isShared: input.isShared,
      splitType: input.isShared ? input.splitType : "NONE",
      paidWithCash: !!input.paidWithCash,
      notes: input.notes?.trim() || null,
      reimbursementStatus: input.pendingReimbursement ? "PENDING" : "NONE",
      shares: { create: shares },
    },
  });

  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/historial");
  revalidatePath("/presupuestos");
  revalidatePath("/saldos");
  revalidatePath("/efectivo");
  return ok({ id: expense.id });
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<ActionResult<{ id: string }>> {
  const baseError = validateBase(input);
  if (baseError) return fail(baseError);

  const shares = await buildShares(input);
  if (typeof shares === "string") return fail(shares);

  const existing = await prisma.expense.findUnique({ where: { id }, select: { reimbursementStatus: true } });
  // Si ya se marcó como reembolsado (ya se generó el ingreso), no se puede
  // revertir desde este formulario para no desincronizarlo del ingreso creado.
  const reimbursementStatus =
    existing?.reimbursementStatus === "REIMBURSED"
      ? "REIMBURSED"
      : input.pendingReimbursement
        ? "PENDING"
        : "NONE";

  await prisma.$transaction([
    prisma.expenseShare.deleteMany({ where: { expenseId: id } }),
    prisma.expense.update({
      where: { id },
      data: {
        paidById: input.paidById,
        category: input.category,
        description: input.description.trim(),
        amount: round2(input.amount),
        date: new Date(input.date + "T00:00:00Z"),
        isShared: input.isShared,
        splitType: input.isShared ? input.splitType : "NONE",
        paidWithCash: !!input.paidWithCash,
        notes: input.notes?.trim() || null,
        reimbursementStatus,
        shares: { create: shares },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/historial");
  revalidatePath("/presupuestos");
  revalidatePath("/saldos");
  revalidatePath("/efectivo");
  return ok({ id });
}

/**
 * Marca un gasto "pendiente de reembolso" como reembolsado: crea
 * automáticamente el ingreso correspondiente (mismo monto, mismo usuario que
 * pagó) y deja el gasto enlazado a ese ingreso.
 */
export async function markExpenseReimbursed(
  id: string,
  date?: string, // YYYY-MM-DD; por defecto hoy
): Promise<ActionResult<{ id: string; incomeId: string }>> {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return fail("El gasto no existe.");
  if (expense.reimbursementStatus !== "PENDING")
    return fail("Este gasto no está pendiente de reembolso.");

  const reimbursedDate = date ? new Date(date + "T00:00:00Z") : new Date();

  const income = await prisma.$transaction(async (tx) => {
    const created = await tx.income.create({
      data: {
        userId: expense.paidById,
        type: "Reembolso",
        description: `Reembolso: ${expense.description}`,
        amount: expense.amount,
        date: reimbursedDate,
        notes: `Generado automáticamente al marcar como reembolsado el gasto "${expense.description}".`,
      },
    });
    await tx.expense.update({
      where: { id },
      data: { reimbursementStatus: "REIMBURSED", reimbursedAt: new Date(), reimbursementIncomeId: created.id },
    });
    return created;
  });

  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/ingresos");
  revalidatePath("/historial");
  revalidatePath("/presupuestos");
  revalidatePath("/saldos");
  revalidatePath("/efectivo");
  return ok({ id, incomeId: income.id });
}

export async function deleteExpense(id: string): Promise<ActionResult<{ id: string }>> {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/historial");
  revalidatePath("/presupuestos");
  revalidatePath("/saldos");
  revalidatePath("/efectivo");
  return ok({ id });
}
