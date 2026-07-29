# Workflow

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/workflow`. Prisma model: `WorkflowTask` — belongs to a
`Project`, optional `assignedTo` (a `Person`), self-referencing
`dependsOn`/`blockedTasks` relation for task dependencies, `status` enum
(TODO/IN_PROGRESS/BLOCKED/DONE).

## Decisions

- Task dependency is modeled as a single `dependsOnId` (one blocker) with a
  reverse `blockedTasks` list — simplest version of a dependency chain.

## Open questions

- Human-readable ID format for tasks.
- Does a task need multiple blockers (many-to-many) instead of a single
  `dependsOnId`? Revisit once real workflows are entered.
