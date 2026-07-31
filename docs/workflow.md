# Workflow

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

`/workflow` (`src/app/(dashboard)/workflow/page.tsx`) is now a person-level
dependency flow diagram, segregated per project:

- Left nav lists every project (top-level, with sub-projects indented
  underneath); `?project=<id>` picks which one's diagram is shown.
- `src/lib/workflow/person-dependencies.ts` (`buildPersonDependencyGraph`)
  derives person-to-person edges purely from existing task data — no new
  schema. For each task with both an assignee and a `dependsOn` task that
  itself has an assignee (and the two differ), the task's assignee "depends
  on" the blocking task's assignee to complete that task. Multiple tasks
  between the same pair of people collapse into one edge listing every task,
  instead of one arrow each.
- `src/components/workflow/PersonDependencyDiagram.tsx` renders people as
  circles on a ring (no tree/hierarchy among people the way tasks have, so a
  ring layout was simplest) with curved arrows from dependent → blocker.
  Clicking a person shows who they're waiting on and who's waiting on them,
  with the task title(s) behind each link. Same hand-rolled SVG-curve
  approach as `TaskTreeDiagram.tsx` — the shared bits
  (`circleEdgePath`/`curveDirFor`) were pulled out into
  `src/lib/diagram/svg-edges.ts` so both diagrams use the same math.
- Empty state when a project has no tasks with both an assignee and a
  same-person-differing dependency link yet — as of this pass, that's every
  project, since `WorkflowTask` currently has zero rows in the shared DB
  (very likely cascade-deleted along with old projects during the
  Pressure-Switch/Transducer restructuring in `docs/projects.md`). Re-import
  an Excel sheet and set `dependsOnId` links to see it populate.

`WorkflowTask` itself is fully used by the Projects module (see
`docs/projects.md`) — populated via Excel import, browsed as a tree at
`/projects/[id]`. Model additions:

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
  instead of a DB constraint. This matters for the workflow diagram too:
  since `dependsOnId` isn't schema-enforced to the same project, a task
  could in theory depend on a task in a *different* project — the diagram
  doesn't currently guard against that (it just follows whatever
  `dependsOnId` points to), so a cross-project dependency would silently
  pull a person from another project into this one's diagram as a node.
  Hasn't been observed in practice; revisit if it comes up.
- The standalone `/workflow` page's own UI/purpose **decided**: a per-project
  person-dependency flow diagram (task-derived, see State above) — not the
  per-project task tree (that stays at `/projects/[id]`) and not an org-chart
  view (`Person.managerId` hierarchy is unrelated, not used here).

## Open questions

- Human-readable ID format for tasks — still open; imported tasks leave
  `code` null.
- Does a task need multiple blockers (many-to-many) instead of a single
  `dependsOnId`? Revisit once real workflows are entered.
- Should the dependency diagram also include people who are on the project
  (`PersonProject`) but have no tasks yet, so the full team shows up even
  before work is assigned? Skipped for now since `PersonProject` is barely
  populated in practice — every project detail page mostly shows "No team
  members recorded yet."
