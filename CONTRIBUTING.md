# Contributing

Two developers, one repo. Read `docs/PROJECT_STATUS.md` first for overall context.

## Branching

- `main` is always deployable.
- Work happens on `feature/<module-name>` branches, e.g. `feature/inventory`,
  `feature/financials`.
- Open a PR into `main` when a feature is ready to merge; the other dev reviews.
- Avoid both people editing the same module's routes/schema at the same time —
  claim a module by updating its doc under `docs/` before starting.

## Database changes

- Schema lives in `prisma/schema.prisma`. After editing it, run:
  ```bash
  npx prisma db push
  ```
  to sync the change to the shared Supabase instance. Because both devs point
  at the **same** database, coordinate schema changes — pull `main` and re-run
  `db push` before starting new model work to avoid clobbering the other
  person's in-progress fields.

## Environment

- Copy `.env.example` to `.env.local` (Next.js) and `.env` (Prisma CLI reads
  this one, not `.env.local`) and fill in real values from Supabase. Never
  commit either file.

## Project log

- After finishing a chunk of work, update the relevant file in `docs/` (state,
  decisions made, open questions) and `docs/PROJECT_STATUS.md` if it affects
  the whole project. This is what lets either of you, or an AI session, pick
  up work without re-explaining context.
