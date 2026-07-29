# Vendors & Procurement

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/vendors-procurement`. Prisma models: `Vendor` (directory)
and `ProcurementOrder` (belongs to both a `Project` and a `Vendor`, `status`
enum REQUESTED/ORDERED/RECEIVED/CANCELLED).

## Decisions

- Kept vendors and procurement orders as separate models under one module/page
  since a vendor can have many orders across many projects.

## Open questions

- Human-readable ID format for vendors and for procurement orders (likely two
  different prefixes).
- Should `ProcurementOrder.itemsSummary` (currently free text) become
  structured line items referencing `InventoryItem`?
