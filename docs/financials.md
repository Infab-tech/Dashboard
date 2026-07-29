# Financials

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/financials`. Prisma model: `FinancialEntry` — belongs to
a `Project`, `type` enum (INCOME/EXPENSE), `category` (free text for now),
`amount` (Decimal), `currency` (defaults to `INR`), `entryDate`.

## Decisions

- Currency defaults to INR — change if the team works in multiple currencies.

## Open questions

- Human-readable ID format for financial entries.
- Should `category` become a fixed enum/lookup table instead of free text once
  real categories are known?
- Any need for budgets/forecasts vs. just actuals?
