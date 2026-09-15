// Catálogos de la aplicación: tipos de ingreso, categorías de gasto y paleta de colores.
// Paleta validada (accesible / daltonismo-safe) — ver skill de dataviz.

export const CATEGORICAL_COLORS = {
  blue: { light: "#2a78d6", dark: "#3987e5" },
  orange: { light: "#eb6834", dark: "#d95926" },
  aqua: { light: "#1baf7a", dark: "#199e70" },
  yellow: { light: "#eda100", dark: "#c98500" },
  magenta: { light: "#e87ba4", dark: "#d55181" },
  green: { light: "#008300", dark: "#008300" },
  violet: { light: "#4a3aa7", dark: "#9085e9" },
  red: { light: "#e34948", dark: "#e66767" },
} as const;

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

// Colores fijos de persona (identidad estable en toda la app).
export const PERSON_COLOR: Record<string, string> = {
  Xavier: CATEGORICAL_COLORS.blue.light,
  Camila: CATEGORICAL_COLORS.magenta.light,
};
export const PERSON_COLOR_DARK: Record<string, string> = {
  Xavier: CATEGORICAL_COLORS.blue.dark,
  Camila: CATEGORICAL_COLORS.magenta.dark,
};

export const CURRENCY = "USD";

export type IncomeType =
  | "Sueldo"
  | "Honorarios"
  | "Bonificación"
  | "Comisiones"
  | "Ingresos extraordinarios"
  | "Otros";

export const INCOME_TYPES: { value: IncomeType; icon: string }[] = [
  { value: "Sueldo", icon: "💼" },
  { value: "Honorarios", icon: "🧾" },
  { value: "Bonificación", icon: "🎁" },
  { value: "Comisiones", icon: "🤝" },
  { value: "Ingresos extraordinarios", icon: "✨" },
  { value: "Otros", icon: "➕" },
];

export type ExpenseCategory =
  | "Alimentación / Comida"
  | "Entretenimiento"
  | "Movilización / Transporte"
  | "Gasolina"
  | "Servicios básicos"
  | "Vivienda / Alquiler"
  | "Supermercado"
  | "Salud"
  | "Educación"
  | "Compras personales"
  | "Suscripciones"
  | "Viajes"
  | "Deudas / Préstamos"
  | "Mascotas"
  | "Impuestos"
  | "Otros";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; icon: string }[] = [
  { value: "Alimentación / Comida", icon: "🍽️" },
  { value: "Entretenimiento", icon: "🎬" },
  { value: "Movilización / Transporte", icon: "🚌" },
  { value: "Gasolina", icon: "⛽" },
  { value: "Servicios básicos", icon: "💡" },
  { value: "Vivienda / Alquiler", icon: "🏠" },
  { value: "Supermercado", icon: "🛒" },
  { value: "Salud", icon: "🩺" },
  { value: "Educación", icon: "🎓" },
  { value: "Compras personales", icon: "🛍️" },
  { value: "Suscripciones", icon: "📺" },
  { value: "Viajes", icon: "✈️" },
  { value: "Deudas / Préstamos", icon: "💳" },
  { value: "Mascotas", icon: "🐾" },
  { value: "Impuestos", icon: "🏛️" },
  { value: "Otros", icon: "➕" },
];

export function categoryIcon(category: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.icon ?? "•";
}

export function incomeIcon(type: string): string {
  return INCOME_TYPES.find((t) => t.value === type)?.icon ?? "•";
}

export const SPLIT_TYPES = {
  NONE: "NONE",
  EQUAL: "EQUAL",
  CUSTOM: "CUSTOM",
} as const;

export const BUDGET_SCOPE = {
  PERSON: "PERSON",
  SHARED: "SHARED",
} as const;

export const SETTLEMENT_MODE = {
  REEMBOLSO: "REEMBOLSO",
  PRESUPUESTO: "PRESUPUESTO",
} as const;

// Tasas vigentes en Ecuador aplicadas sobre comisiones bancarias
// (ej. comisión por pago con débito en el exterior, retiros, etc.).
export const IVA_RATE = 0.15; // IVA general
export const ISD_RATE = 0.05; // Impuesto a la Salida de Divisas
