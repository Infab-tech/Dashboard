# Projects

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Fully wired, first non-placeholder module in the app:

- `/projects` (`src/app/(dashboard)/projects/page.tsx`) — lists every
  top-level project (`parentId: null`), grouped Ongoing → On Hold → Planned →
  Completed, sorted within each group by start/end date
  (`groupAndSortProjects` in `src/lib/projects/priority-score.ts`; the
  priority-score math still exists and still backs the score shown on the
  detail page and PDF, but no longer drives list order — see Decisions).
  Each card also lists its sub-projects nested underneath, with a
  "+ Sub-project" quick-add and a "Delete" action per project/sub-project.
- `/projects/[id]` (`src/app/(dashboard)/projects/[id]/page.tsx`) — task tree
  (`TaskTree`/`TaskDetailPanel`), Gantt bars + daily-activity strip
  (`GanttChart`/`ActivityStrip`), Excel upload (`UploadTasksForm`), a
  "Sub-projects" section (list + add), and a "Export PDF" link. If the
  project itself is a sub-project, a "↑ Part of {parent}" breadcrumb links
  back up.
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
- Human-readable project ID **decided**: auto-generated from the name in
  `src/lib/projects/generate-code.ts` (`generateProjectCode`), assigned once
  at creation and never recomputed on rename. Three shapes depending on where
  a distinctive abbreviation/number sits in the title: none anywhere →
  initials of every word (`Pressure Switch Parking Brake` → `PSPB`);
  abbreviation leads → abbreviation kept as-is + initials of the rest (`ITC
  Heater` → `ITC-H`); abbreviation trails plain leading words → lead-word
  initials + the abbreviation/number tail, dropping any further plain words
  (`Pressure Transducer 280 & 330 Bar` → `PT-280&330`). Collisions get a
  `-2`, `-3`, ... suffix via `resolveUniqueProjectCode`. All 15 existing
  projects were backfilled against this scheme.
- Sub-projects **decided**: a project can have a `parentId` pointing at
  another `Project` (self-relation `subProjects`/`parent` in the schema). A
  sub-project is a full `Project` row — its own status, dates, code, tasks,
  financials, etc. — just nested for display under its parent instead of
  getting its own top-level slot in the status groups. Deleting a project
  cascades to delete every sub-project underneath it (`onDelete: Cascade` on
  `parentId`). UI only renders one level of nesting today (a sub-project's
  own sub-projects, if any were created directly via the API, won't show up
  nested further) — revisit if deeper phase trees are needed.

## Open questions

- The uploaded `.xlsx` file itself isn't persisted anywhere (no Supabase
  Storage) — only parsed contents land in the DB. Add file storage later if an
  audit copy of the original sheet is wanted.
- Sub-project depth is currently unlimited at the schema level but the UI
  (list page nesting, detail page's Sub-projects section) only surfaces one
  level. Decide whether deeper nesting is ever needed before building for it.
