# Daily Log

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Fully functional page at `/daily-log`. Prisma model: `DailyLog` — contains structured fields (`date`, `serialNo`, `projectName`, `task`, `assignedTo`, `targetDateOrStatus`, `remarks`) to exactly match the provided Excel/Screenshot format.

## Decisions

- Author tracking is currently optional.
- Projects are logged via a free-text `projectName` field to accommodate shorthand naming (e.g. "CMTI"), with a soft relational link (`projectId`) to the `Project` model if a match is found.
- Assignees (`assignedTo`) are stored as plain text strings to allow for multiple assignees in shorthand like "Chandru / Amos", prioritizing speed of data entry over strict relational mapping.

## Open questions

- Re-evaluate if `assignedTo` should be fully migrated to relational `Person` links in the future if advanced filtering by user is needed.
