# People

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/people`. Prisma models:
- `Person` — optionally linked to a `User` (if they log in), self-referencing
  `managerId`/`reports` for the org-chart / dependency tree.
- `PersonProject` — join table for which people are on which projects and in
  what capacity (`roleOnProject`), since the dependency tree is meant to be
  **per project**, not just one global org chart.

## Decisions

- `Person` is separate from `User`: not everyone in the dependency tree needs
  a login (e.g. field staff who never touch the dashboard), but every `User`
  who does log in gets a corresponding `Person` row for the tree.

## Open questions

- Human-readable ID format for people.
- Is the dependency tree strictly hierarchical (one manager) or does it need
  multiple reporting lines per project?
- UI approach for rendering the tree (needs a library or custom component —
  not chosen yet).
