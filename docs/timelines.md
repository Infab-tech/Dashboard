# Timelines

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

The standalone `/timelines` page and `Milestone` model are still untouched
placeholders. The per-project timeline (Gantt bars + daily-activity strip) now
lives inside `/projects/[id]` instead (see `docs/projects.md`) — it's built
from `WorkflowTask` dates/status plus a new model, not from `Milestone`:

- New `TaskHistoryEvent` model — append-only log of task changes detected on
  each Excel re-import (CREATED/STATUS_CHANGED/COMPLETED/REMOVED), written by
  diffing the old vs. new task tree during import
  (`src/lib/projects/apply-import.ts`). Feeds the `ActivityStrip` chart.
  Not FK'd to a specific `WorkflowTask` row (rows get deleted/recreated on
  every re-upload) — identified by a human-readable `taskTitlePath` instead.
  `occurredOn` is the *import* timestamp, not necessarily the real-world
  change date, since Excel snapshots carry no per-row timestamp — the UI
  labels this "as recorded," not ground truth.
- `DailyLog` (existing, freeform per-project notes) is surfaced alongside
  `TaskHistoryEvent` on the same date axis in `ActivityStrip`, not merged into
  it — distinct concerns (structured status diffs vs. human commentary).
- Gantt bars are hand-rolled (`GanttChart.tsx` + `src/lib/projects/task-tree.ts`
  bounds/position math), not built with a charting library — only the
  activity strip uses `recharts`.

## Decisions

- `Milestone` stays separate from `WorkflowTask` — unchanged by this pass.
- The new per-project timeline intentionally does **not** use `Milestone` at
  all yet; it's purely task-based. Revisit if/when the standalone
  `/timelines` page gets built out.

## Open questions

- Human-readable ID format for milestones.
- Should milestones reference specific tasks/deliverables, or stay standalone?
- Should the eventual `/timelines` page reuse `TaskHistoryEvent`/`ActivityStrip`
  across all projects, or is that pattern specific to a single project's view?
