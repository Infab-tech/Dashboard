import type { FinancialEntry, Project } from "@prisma/client";

/** Fraction of revenue spent past which a project gets flagged in the Alerts section. */
export const ALERT_EXPENSE_RATIO = 0.5;

export interface ProjectFinancialSummary {
  id: string;
  name: string;
  code: string | null;
  totalRevenue: number;
  totalExpense: number;
  /** null when there's no revenue to compare against yet. */
  ratio: number | null;
  isAlert: boolean;
  expenses: FinancialEntry[];
}

export type ProjectWithFinancials = Project & { financials: FinancialEntry[] };

export function summarizeProjectFinancials(project: ProjectWithFinancials): ProjectFinancialSummary {
  let totalRevenue = 0;
  let totalExpense = 0;
  const expenses: FinancialEntry[] = [];

  for (const entry of project.financials) {
    const amount = entry.amount.toNumber();
    if (entry.type === "INCOME") {
      totalRevenue += amount;
    } else {
      totalExpense += amount;
      expenses.push(entry);
    }
  }

  const ratio = totalRevenue > 0 ? totalExpense / totalRevenue : null;
  // With zero revenue on record, any expense at all is already a red flag.
  const isAlert = ratio !== null ? ratio > ALERT_EXPENSE_RATIO : totalExpense > 0;

  return {
    id: project.id,
    name: project.name,
    code: project.code,
    totalRevenue,
    totalExpense,
    ratio,
    isAlert,
    expenses,
  };
}

/** Highest-revenue projects first — these are the ones to prioritize per the Financials tab's ranking. */
export function summarizeAndRankByRevenue(projects: ProjectWithFinancials[]): ProjectFinancialSummary[] {
  return projects
    .map(summarizeProjectFinancials)
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalExpense - a.totalExpense);
}

export function formatMoney(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
