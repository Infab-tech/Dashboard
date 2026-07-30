# Admin

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

`/admin` (`src/app/(dashboard)/admin/page.tsx`) is real, not a placeholder —
server-side guarded: redirects to `/login` if signed out, to `/` if the
signed-in `User.role` isn't `ADMIN` (the Sidebar also hides the nav item for
non-admins, but the page itself is the actual gate). Two tabs
(`AdminTabs.tsx`, client-side toggle, both tabs' content still
server-rendered up front):

- **Users** — `CreateUserForm.tsx` / `lib/actions/users.ts`: creates a
  Supabase Auth user (service-role client, `lib/supabase/admin.ts`) + a
  matching Prisma `User` row + a linked `Person` record, with an
  auto-generated `INFAB-<initials>` code.
- **Financials** — `FinancialsPanel.tsx`: every project ranked by total
  revenue generated (highest first — this ranking is separate from the
  urgency-based `priorityScore` used on `/projects`), each showing its
  expense entries with date + reason, plus an **Alerts** section for any
  project whose expenditure has passed 50% of its revenue
  (`ALERT_EXPENSE_RATIO` in `lib/financials/summary.ts`). Revenue/expense
  entries reuse the existing `FinancialEntry` model (no schema change) —
  `type: INCOME` rows sum to revenue, `type: EXPENSE` rows are the listed
  expenses. Entries are added manually only —
  `AddFinancialEntryForm.tsx` / `lib/actions/financials.ts` (reason required
  for expenses, optional for revenue); no Excel import for financials (there
  was one, deliberately removed — manual entry only, by request). Guarded
  server-side by `lib/auth/require-admin.ts` (not just hidden in the UI)
  since financials are meant to be Admin-only.

Prisma model: `User` (`role` enum, currently only `ADMIN` is actually used),
linked 1:1 to an optional `Person` row for the dependency tree.

## Decisions

- Admin is the only role enforced right now, matching the "just Admin for
  now" call — but `UserRole` is an enum specifically so more roles can be
  added without a schema rewrite.
- The financial entry action checks `role === "ADMIN"` at the server-action
  layer via `requireAdmin()`, not just via the page redirect — since this is
  the one module explicitly scoped to Admin-only, it seemed worth not
  relying solely on the UI to hide it. Other existing admin actions (e.g.
  `createUser`) don't yet have this same server-side check — pre-existing
  gap, not touched as part of this pass.
- Financial entry `category` is currently always set to `"General"` from the
  manual form — the schema field exists (kept required, matching
  pre-existing `FinancialEntry.category`) but no UI exposes it yet, since the
  ask was specifically date + reason per expense, not categorization.
- Excel import for financials was built once, then explicitly removed by
  request before ever being committed — manual entry only. If bulk import is
  wanted later, the approach used was additive (append new ledger rows on
  every upload) rather than a full replace like the Projects task import,
  since a financial ledger shouldn't lose history on re-upload.

## Open questions

- Human-readable ID format for users (Financials entries also have no
  human-readable `code` yet).
- When other roles (Project Manager, Team Member, Vendor viewer — discussed
  but deferred) are built, where does role-based access get enforced: in
  middleware, per-page, or per-query (Prisma) — likely all three, TBD.
- In-app user management UI beyond creation (edit/deactivate).
- Should `FinancialEntry.category` become a real dropdown (materials/labor/
  etc.) now that Financials has a UI, instead of the placeholder `"General"`?
- Mixed-currency entries aren't summed correctly (revenue/expense totals
  just add `amount` regardless of `currency`) — fine while everything is
  INR per `docs/financials.md`, revisit if that changes.
