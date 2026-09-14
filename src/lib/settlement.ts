// Cálculo de saldos entre las dos personas a partir de gastos compartidos.
// Distingue claramente "quién pagó" (Expense.paidById) de "a quién corresponde"
// (ExpenseShare.amount por usuario).

export interface SharedExpenseLike {
  id: string;
  amount: number;
  paidById: string;
  shares: { userId: string; amount: number }[];
}

export interface UserBalance {
  userId: string;
  name: string;
  paid: number; // total que esta persona desembolsó en gastos compartidos
  owed: number; // total que le corresponde asumir de gastos compartidos
  net: number; // paid - owed. Positivo = adelantó dinero por la otra persona.
}

export interface SettlementResult {
  perUser: UserBalance[];
  /** Quién debe pagarle a quién para saldar cuentas, o null si ya está saldado. */
  settlement: { fromUserId: string; fromName: string; toUserId: string; toName: string; amount: number } | null;
}

export function computeSettlement(
  expenses: SharedExpenseLike[],
  users: { id: string; name: string }[],
): SettlementResult {
  const paid: Record<string, number> = {};
  const owed: Record<string, number> = {};
  for (const u of users) {
    paid[u.id] = 0;
    owed[u.id] = 0;
  }

  for (const expense of expenses) {
    paid[expense.paidById] = (paid[expense.paidById] ?? 0) + expense.amount;
    for (const share of expense.shares) {
      owed[share.userId] = (owed[share.userId] ?? 0) + share.amount;
    }
  }

  const perUser: UserBalance[] = users.map((u) => ({
    userId: u.id,
    name: u.name,
    paid: round2(paid[u.id] ?? 0),
    owed: round2(owed[u.id] ?? 0),
    net: round2((paid[u.id] ?? 0) - (owed[u.id] ?? 0)),
  }));

  let settlement: SettlementResult["settlement"] = null;
  if (users.length === 2) {
    const [a, b] = perUser;
    const diff = round2(a.net - b.net) / 2; // monto que b debe transferir a a si diff > 0
    if (Math.abs(diff) >= 0.01) {
      settlement =
        diff > 0
          ? { fromUserId: b.userId, fromName: b.name, toUserId: a.userId, toName: a.name, amount: diff }
          : { fromUserId: a.userId, fromName: a.name, toUserId: b.userId, toName: b.name, amount: -diff };
    }
  }

  return { perUser, settlement };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
