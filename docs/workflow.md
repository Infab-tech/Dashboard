# Workflow

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

`/workflow` page itself is still a placeholder, but `WorkflowTask` is now
fully used by the Projects module (see `docs/projects.md`) — populated via
Excel import, browsed as a tree at `/projects/[id]`. Model additions:

- `status` enum gained `DELAYED` (was TODO/IN_PROGRESS/BLOCKED/DONE).
- `startDate`, `notes`, `percentComplete` (0–100), `delayReason` — direct
  mappings from the Excel columns (`delayReason` is manual-only, see below).
- New self-relation `parentId`/`parent`/`children` ("TaskHierarchy") for
  Task→Subtask nesting — kept **separate** from the pre-existing
  `dependsOnId`/`blockedTasks` ("TaskDependency") self-relation, since nesting
  (subtask-of) and blocking (waiting-on) are different relationships. A task's
  tree position and its dependency chain are independent.

## Decisions

- Task dependency is still modeled as a single `dependsOnId` (one blocker)
  with a reverse `blockedTasks` list — simplest version of a dependency chain,
  unchanged by this pass.
- `dependsOnId` and `delayReason` are **not** populated by Excel import (no
  columns for them) — they're set manually via
  `PATCH /api/projects/[id]/tasks/[taskId]` from the tree detail panel, and
  are wiped on the project's next Excel re-upload (full tree replace has no
  way to know these should survive).
- Neither `dependsOnId` nor `parentId` is scoped to same-project at the schema
  level (pre-existing gap for `dependsOnId`, same now true of `parentId`) —
  the API route validates `dependsOnId` against the project at write time
  instead of a DB constraint.

## Open questions

- Human-readable ID format for tasks — still open; imported tasks leave
  `code` null.
- Does a task need multiple blockers (many-to-many) instead of a single
  `dependsOnId`? Revisit once real workflows are entered.
- The standalone `/workflow` page's own UI/purpose (distinct from the
  per-project tree at `/projects/[id]`) is still undecided.
