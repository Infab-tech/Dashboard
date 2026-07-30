# Financials

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

No standalone `/financials` route — it lives as the **Financials tab inside
`/admin`** instead (Admin-only), see `docs/admin.md` for the full breakdown
(`FinancialsPanel.tsx`, revenue ranking, 50%-expenditure Alerts, manual entry
only — no Excel import). Prisma model: `FinancialEntry` — belongs to a `Project`,
`type` enum (INCOME/EXPENSE), `category` (free text, currently always
`"General"` — no UI exposes it yet), `amount` (Decimal), `currency` (defaults
to `INR`), `entryDate`, `description` (used as the expense's "reason").

## Decisions

- Currency defaults to INR — change if the team works in multiple currencies.
  Revenue/expense totals on the Financials tab just sum `amount` without
  converting by `currency`, so mixed currencies would sum incorrectly today.
- Revenue = sum of `INCOME` entries, expenditure = sum of `EXPENSE` entries,
  computed live per project (not stored) — same pattern as `priorityScore` in
  `lib/projects/priority-score.ts`. See `lib/financials/summary.ts`.
- No Excel import for financials — entries are added one at a time through
  `AddFinancialEntryForm.tsx`. An Excel-import path was built and then
  explicitly removed by request; if it's wanted again, keep it additive
  (append new rows) rather than a full replace like the Projects task import,
  since a financial ledger shouldn't lose history on re-upload.

## Open questions

- Human-readable ID format for financial entries.
- Should `category` become a fixed enum/lookup table (and get exposed in the
  form/sheet) instead of the current placeholder `"General"`?
- Any need for budgets/forecasts vs. just actuals?
- Should the 50%-expenditure alert threshold be configurable per project
  instead of the single fixed `ALERT_EXPENSE_RATIO`?
