# Projects

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/projects` (`src/app/(dashboard)/projects/page.tsx`).
Prisma model: `Project` in `prisma/schema.prisma` — `status` enum
(PLANNED/ONGOING/ON_HOLD/COMPLETED), start/end dates, and relations out to
every other module (tasks, milestones, financials, inventory, procurements,
daily logs, assets, people).

## Decisions

- A project is the central hub every other module hangs off — most models
  have a `projectId` foreign key.

## Open questions

- Human-readable ID format for projects (e.g. `PRJ-0001`) — not yet decided.
- Does a project need sub-projects/phases, or is one flat `Project` row enough?
