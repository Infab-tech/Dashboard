# Admin

Back to [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## State

Placeholder page at `/admin`. Auth: Supabase Auth via `src/middleware.ts` —
any signed-in user currently has full (Admin-equivalent) access; there's no
per-role restriction yet. Prisma model: `User` (`role` enum, currently only
`ADMIN` exists), linked 1:1 to an optional `Person` row for the dependency
tree.

## Decisions

- Admin is the only role built right now, matching the "just Admin for now"
  call — but `UserRole` is an enum specifically so more roles can be added
  without a schema rewrite.
- Users are created directly in the Supabase dashboard (Authentication →
  Users) for now, not through an in-app signup flow — the Admin is meant to
  be the one adding users, and there's no in-app "add user" UI yet.

## Open questions

- Human-readable ID format for users.
- When other roles (Project Manager, Team Member, Vendor viewer — discussed
  but deferred) are built, where does role-based access get enforced: in
  middleware, per-page, or per-query (Prisma) — likely all three, TBD.
- In-app user management UI (so Admin doesn't need the Supabase dashboard).
