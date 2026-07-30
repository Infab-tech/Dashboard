# Projects

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Fully wired, first non-placeholder module in the app:

- `/projects` (`src/app/(dashboard)/projects/page.tsx`) — lists every project,
  grouped Ongoing → On Hold → Planned → Completed, sorted within each group by
  a live-computed priority score (`src/lib/projects/priority-score.ts`).
- `/projects/[id]` (`src/app/(dashboard)/projects/[id]/page.tsx`) — task tree
  (`TaskTree`/`TaskDetailPanel`), Gantt bars + daily-activity strip
  (`GanttChart`/`ActivityStrip`), Excel upload (`UploadTasksForm`), and a
  "Export PDF" link.
- Excel import: `POST /api/projects/[id]/tasks/import` — parses a leveled
  Task/Subtask sheet (`src/lib/projects/excel-import.ts`) and replaces the
  project's entire task tree in one transaction (`apply-import.ts`). Re-upload
  = full replace, not merge — the sheet is the source of truth each time.
- Manual task edits (`delayReason`, `dependsOnId`) via
  `PATCH /api/projects/[id]/tasks/[taskId]` — these are **wiped on the next
  Excel re-upload** since the sheet has no columns for them.
- PDF export: `GET /api/projects/[id]/export`, built with
  `@react-pdf/renderer` (see `docs/workflow.md` and `docs/timelines.md` for the
  schema additions this all depends on).
- Both list/detail pages are `export const dynamic = "force-dynamic"` — data
  changes on every upload/edit, so they're never statically prerendered.

## Decisions

- A project is the central hub every other module hangs off — most models
  have a `projectId` foreign key.
- Priority score (0–100, higher = needs more attention): 40% overdue/near-due
  urgency (tasks + milestones), 35% % of incomplete tasks, 25% end-date
  proximity (90-day ramp). Computed live, not stored — see
  `PRIORITY_WEIGHTS` in `priority-score.ts` to retune.
- `Project.projectLeadId` (→ `Person`) added — the sheet's "Project Lead"
  column is one value per project, so it lives on `Project`, not per-task.
- Excel parsing chose `exceljs` over `xlsx`/SheetJS: the npm `xlsx` package has
  unpatched high-severity CVEs (prototype pollution, ReDoS) and this parses
  user-uploaded files, so it was ruled out despite otherwise being a common
  first choice.

## Open questions

- Human-readable ID format for projects (e.g. `PRJ-0001`) — still not decided;
  imported tasks/projects currently leave `code` null.
- Does a project need sub-projects/phases, or is one flat `Project` row
  enough? (Still open — not needed for the current Task/Subtask-only tree.)
- The uploaded `.xlsx` file itself isn't persisted anywhere (no Supabase
  Storage) — only parsed contents land in the DB. Add file storage later if an
  audit copy of the original sheet is wanted.
