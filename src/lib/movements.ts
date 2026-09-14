export interface IncomeLike {
  id: string;
  userId: string;
  type: string;
  description: string;
  amount: number;
  date: Date;
  account: string | null;
}

export interface ExpenseLike {
  id: string;
  paidById: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  isShared: boolean;
  splitType: string;
  shares: { userId: string; amount: number }[];
}

export interface Movement {
  id: string;
  kind: "income" | "expense";
  date: Date;
  personId: string;
  category: string;
  description: string;
  amount: number;
  isShared: boolean;
  shares?: { userId: string; amount: number }[];
  source: IncomeLike | ExpenseLike;
}

export function buildMovements(incomes: IncomeLike[], expenses: ExpenseLike[]): Movement[] {
  const incomeMovements: Movement[] = incomes.map((i) => ({
    id: i.id,
    kind: "income",
    date: i.date,
    personId: i.userId,
    category: i.type,
    description: i.description,
    amount: i.amount,
    isShared: false,
    source: i,
  }));

  const expenseMovements: Movement[] = expenses.map((e) => ({
    id: e.id,
    kind: "expense",
    date: e.date,
    personId: e.paidById,
    category: e.category,
    description: e.description,
    amount: e.amount,
    isShared: e.isShared,
    shares: e.shares,
    source: e,
  }));

  return [...incomeMovements, ...expenseMovements];
}
