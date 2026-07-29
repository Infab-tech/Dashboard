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

## Current state (2026-07-29)

Structure-only pass complete:
- Next.js app scaffolded, Tailwind configured, TypeScript strict.
- Collapsible sidebar (`src/components/layout/Sidebar.tsx`) + app shell
  (`src/components/layout/AppShell.tsx`) with one route per module under
  `src/app/(dashboard)/`.
- Prisma schema (`prisma/schema.prisma`) covering all modules, pushed live to
  the Supabase Postgres instance.
- Supabase Auth wired: `/login` page + middleware session gate.
- All module pages are placeholders (`PagePlaceholder` component) — no real
  data, no CRUD yet.

## Not started yet

- Populating real data / CRUD forms per module.
- Non-Admin roles and permission enforcement.
- The people-dependency tree UI/logic (schema exists: `Person.managerId`
  self-relation + `PersonProject` join table).
- Migrating off the Supabase free tier.
- Deciding and implementing per-module human-readable ID formats.

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
