# InFAB Dashboard — Project Status

Top-level log. Read this first — it links out to one doc per module under `docs/`.
Keep this updated after every work session so either developer (or an AI session)
can resume without re-asking what's already been decided.

## What this is

An internal dashboard for tracking project workflow, timelines, financials,
inventory, vendors/procurement, daily logs, assets, and the people-dependency
tree per project. The Admin is the global head: full visibility across every
project, and the only one who can add users (for now — see `docs/admin.md`).

Every entity (project, person, inventory item, vendor, asset, etc.) gets a
unique ID so it stays traceable across modules and reports.

## Stack decisions

- **Frontend/backend**: Next.js (App Router, TypeScript), single full-stack app.
- **Styling**: Tailwind CSS.
- **Database**: Supabase Postgres (free tier), accessed via Prisma ORM.
  Direct DB host is IPv6-only and unreachable from some networks — use the
  **pooler** connection string (`aws-*.pooler.supabase.com`) in `DATABASE_URL`,
  not the direct `db.<ref>.supabase.co` host.
- **Auth**: Supabase Auth. Middleware (`src/middleware.ts`) gates every route
  except `/login` behind a signed-in session. Only the Admin role exists right
  now — anyone signed in is treated as Admin. Other roles are designed for in
  the schema (`UserRole` enum) but not yet enforced.
- **Package manager**: npm.
- **Planned migration**: off Supabase free tier to a dedicated cloud/server
  once the structure is validated — keep the Prisma layer as the DB
  abstraction so this migration doesn't require app-code changes, just a
  connection string swap.
- **Deployment target: NOT Vercel.** Explicitly ruled out. Final hosting is
  either (a) a `.exe` desktop package (Electron/Tauri wrapping the web UI) or
  (b) self-hosted on the user's own server, running the Next.js app in
  standalone/production mode with Node — decision deferred until the app is
  further along. Implication: avoid Vercel-only features (e.g. Vercel-specific
  edge functions, Vercel KV/Blob, `next/og` on edge runtime) so the build stays
  portable to either target. Revisit this note once the exe-vs-server call is
  made and update it here.

## Repo / collaboration

- Repo: https://github.com/Infab-tech/Dashboard.git
- Two developers, single repo, feature branches: `feature/<module-name>` off
  `main`, merged via PR. See `CONTRIBUTING.md`.
- Unique ID **format** (e.g. prefixed codes like `PRJ-0001` vs UUID-only) is
  being decided **per module** as each one is built — not fixed globally.
  Every Prisma model already has a `code String? @unique` column reserved for
  this; the internal `id` is always a UUID primary key regardless.

## Current state (2026-07-30)

Structure-only pass complete for every module except Projects:
- Next.js app scaffolded, Tailwind configured, TypeScript strict.
- Collapsible sidebar (`src/components/layout/Sidebar.tsx`) + app shell
  (`src/components/layout/AppShell.tsx`) with one route per module under
  `src/app/(dashboard)/`.
- Prisma schema (`prisma/schema.prisma`) covers all modules.
- Supabase Auth wired: `/login` page + middleware session gate (also covers
  `/api/*` routes, since the middleware matcher excludes only static assets).
- Most module pages are still placeholders (`PagePlaceholder` component) — no
  real data, no CRUD yet. Projects, Inventory, and Admin (users + financials)
  are the exceptions, see their own docs.

**Projects is now fully wired** — the first non-placeholder module. Prioritized
project list, Excel-driven task tree, Gantt + daily-activity timeline, manual
dependency/delay-reason editing, and PDF export. Full detail in
`docs/projects.md` (and the schema/relationship notes in `docs/workflow.md`
and `docs/timelines.md`). New deps: `exceljs` (Excel import — chosen over
`xlsx`/SheetJS due to unpatched CVEs in the latter), `@react-pdf/renderer`
(PDF export), `recharts` (daily-activity chart only; Gantt bars are hand-rolled).

**Admin now has a Financials tab** — Admin-only (`/admin`), ranks projects by
revenue generated, lists each project's expenses with date/reason, and flags
projects over 50% expenditure-to-revenue in an Alerts section. Entries are
added manually (no Excel import for this one) into the existing
`FinancialEntry` model — no schema change needed. Full detail in
`docs/admin.md` and `docs/financials.md`.

**Schema is now pushed (2026-07-31)** — the `TaskStatus.DELAYED`/`TaskHistoryEvent`/etc.
changes noted above as pending, plus a new `Project.parentId` self-relation
for sub-projects (see below), have been applied to the shared Supabase
instance. `Project.parentId` specifically was added by hand via a targeted
`ALTER TABLE` (not a full `db push`) — see the next note for why.

**⚠️ Active concurrent-write conflict found on `DailyLog` (2026-07-31) —
needs the other dev, not just this doc.** A `db push` run mid-session hit a
hard blocker: the live `DailyLog` table's actual columns
(`assignedTo`, `date`, `projectName`, `remarks`, `serialNo`,
`targetDateOrStatus`, `task`, all with real data — **65 rows**) don't match
`schema.prisma`'s `DailyLog` model (`projectId`/`authorId` required,
`logDate`/`content`) at all, and don't match what's described in
`docs/daily-log.md` either. This exact conflict wasn't present a short time
earlier in the same session (an initial schema diff only flagged unrelated
`Asset`/`User`/`Vendor` columns, not this) — strongly suggesting someone
pushed a real Daily Log implementation straight to the shared DB, live,
while this session was running. **A full `db push` will fail until this is
resolved** — whoever owns that DailyLog work needs to get its shape into
`schema.prisma`/`docs/daily-log.md` on a shared branch before anyone runs
`db push` again. Do not `--force-reset` — real rows are at stake. Because of
this, `Project.parentId` was added with a narrow hand-written
`ALTER TABLE "Project" ADD COLUMN "parentId" ...` + FK (matching the
`ON DELETE/UPDATE CASCADE` convention already used by
`WorkflowTask_parentId_fkey`) instead of a full `db push`, specifically to
avoid touching `DailyLog` at all.

**⚠️ Schema drift found during that push, now reconciled** — the live DB had
columns that were never in this branch's `schema.prisma`: `Asset.description`,
`Asset.modelNumber`, `Asset.quantity`, `User.isActive`,
`Vendor.address`/`place`/`postalCode`/`state`/`gstStatus` — all with real data
(`Vendor`'s address fields had 360 non-null rows each). Someone pushed these
directly to the shared DB (likely from `feature/inventory`/vendor work)
without them landing in `schema.prisma` on `main` or this branch. They've now
been added to `schema.prisma` to match the live DB exactly (verified via
`information_schema.columns`, no data was dropped), but **if you have a local
branch with your own version of these fields, diff it against the current
`schema.prisma` before your next `db push`** — there may still be a mismatch
between what's committed here and what you were expecting.

**Projects gained sub-projects and human-readable codes.** `Project` now has
a `parentId`/`subProjects` self-relation — a sub-project is a full `Project`
row (own status/dates/tasks/financials), just displayed nested under its
parent on `/projects` and in a "Sub-projects" section on `/projects/[id]`,
with a "+ Sub-project" quick-add in both places. Deleting a project cascades
to its sub-projects. Every project also gets an auto-generated `code` now
(e.g. `PT-280&330`, `COC-BIRAC`) — see `docs/projects.md` Decisions for the
exact algorithm. Both close open questions that were previously listed there.

## Not started yet

- Populating real data / CRUD forms for every module except Projects.
- Non-Admin roles and permission enforcement.
- The people-dependency tree UI/logic (schema exists: `Person.managerId`
  self-relation + `PersonProject` join table) — note `src/components/tree/TreeView.tsx`
  (built for the Projects task tree) is intentionally generic and reusable here.
- Migrating off the Supabase free tier.
- Deciding and implementing per-module human-readable ID formats (Projects'
  Excel-imported tasks currently leave `code` null, consistent with this still
  being undecided).

## Module docs

- [docs/projects.md](./projects.md)
- [docs/workflow.md](./workflow.md)
- [docs/timelines.md](./timelines.md)
- [docs/financials.md](./financials.md)
- [docs/inventory.md](./inventory.md)
- [docs/vendors-procurement.md](./vendors-procurement.md)
- [docs/daily-log.md](./daily-log.md)
- [docs/assets.md](./assets.md)
- [docs/people.md](./people.md)
- [docs/admin.md](./admin.md)
