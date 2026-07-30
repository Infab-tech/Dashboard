import { prisma } from "@/lib/prisma/client";
import { summarizeAndRankByRevenue, formatMoney, ALERT_EXPENSE_RATIO } from "@/lib/financials/summary";
import { AddFinancialEntryForm } from "./AddFinancialEntryForm";

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Admin-only financials view: projects ranked by revenue generated (highest
 * first — the priority signal for this tab, distinct from the urgency-based
 * priorityScore used on /projects), with an Alerts callout for any project
 * whose expenditure has passed ALERT_EXPENSE_RATIO of its revenue.
 */
export async function FinancialsPanel() {
  const projects = await prisma.project.findMany({
    include: { financials: { orderBy: { entryDate: "desc" } } },
    orderBy: { name: "asc" },
  });

  const summaries = summarizeAndRankByRevenue(projects);
  const alerts = summaries.filter((s) => s.isAlert);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Financials</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Projects ranked by revenue generated, highest first. Expenses are listed per project with date and reason.
        </p>
      </div>

      <AddFinancialEntryForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />

      {alerts.length > 0 && (
        <section className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
            Alerts — expenditure over {Math.round(ALERT_EXPENSE_RATIO * 100)}% of revenue
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {alerts.map((s) => (
              <li key={s.id}>
                <a href={`#financials-${s.id}`} className="font-medium text-red-800 hover:underline dark:text-red-200">
                  {s.name}
                </a>{" "}
                <span className="text-red-700 dark:text-red-300">
                  — spent {formatMoney(s.totalExpense)} of {formatMoney(s.totalRevenue)}
                  {s.ratio !== null ? ` (${Math.round(s.ratio * 100)}%)` : " (no revenue recorded)"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summaries.length === 0 ? (
        <p className="text-sm text-neutral-400">No projects yet.</p>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => (
            <div
              key={s.id}
              id={`financials-${s.id}`}
              className={`rounded-lg border p-4 ${
                s.isAlert
                  ? "border-red-300 dark:border-red-800"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{s.name}</h3>
                  {s.code && <span className="text-xs text-neutral-400">{s.code}</span>}
                  {s.isAlert && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                      Over {Math.round(ALERT_EXPENSE_RATIO * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-right text-sm">
                  <div>
                    <p className="text-xs text-neutral-400">Revenue</p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatMoney(s.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Expenditure</p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatMoney(s.totalExpense)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Expenses
                </p>
                {s.expenses.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-400">No expenses recorded.</p>
                ) : (
                  <ul className="mt-1 divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                    {s.expenses.map((expense) => (
                      <li key={expense.id} className="flex items-center justify-between gap-3 py-1.5">
                        <span className="flex-shrink-0 text-neutral-400">{formatDate(expense.entryDate)}</span>
                        <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                          {expense.description ?? "—"}
                        </span>
                        <span className="flex-shrink-0 font-medium text-neutral-900 dark:text-neutral-100">
                          {formatMoney(expense.amount.toNumber(), expense.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
