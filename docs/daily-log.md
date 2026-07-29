# Daily Log

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/daily-log`. Prisma model: `DailyLog` — belongs to a
`Project` and an `author` (`User`), `logDate` + free-text `content`.

## Decisions

- Author is a `User` (Supabase-auth-linked), not a `Person` — logs are tied to
  who was signed in when they wrote it, not just any person in the org chart.

## Open questions

- Human-readable ID format for log entries.
- Structured fields (weather, headcount, incidents) vs. free-text `content` —
  revisit once real usage patterns are clear.
