# Inventory

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/inventory`. Prisma model: `InventoryItem` — optional
`Project` link (nullable, since some stock may be unassigned/shared),
`quantity`, `unit`, `location`.

## Decisions

- Project link is optional so inventory can exist in a shared pool before
  being allocated to a specific project.

## Open questions

- Human-readable ID format for inventory items.
- Do items need per-unit tracking (serial numbers) vs. just quantity counts?
- How does inventory relate to procurement — does receiving a
  `ProcurementOrder` auto-create/increment inventory rows?
