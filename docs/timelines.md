# Timelines

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/timelines`. Prisma model: `Milestone` — belongs to a
`Project`, `dueDate` + optional `completedAt`.

## Decisions

- Kept separate from `WorkflowTask` — milestones are project-level checkpoints,
  tasks are the work items underneath them. No formal link between the two yet.

## Open questions

- Human-readable ID format for milestones.
- Should milestones reference specific tasks/deliverables, or stay standalone?
