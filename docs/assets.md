# Assets

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/assets`. Prisma model: `Asset` — optional `Project`
link, optional `assignedTo` (`Person`), `status` enum
(IN_USE/IN_STORAGE/UNDER_MAINTENANCE/RETIRED), `purchaseDate`, `value`.

## Decisions

- Distinguished from `InventoryItem`: assets are individually tracked,
  higher-value, assignable items (e.g. equipment); inventory is quantity-based
  stock.

## Open questions

- Human-readable ID format for assets.
- Depreciation tracking needed, or just current `value`?
