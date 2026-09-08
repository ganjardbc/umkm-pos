## Status: SUCCESS

## Ticket
GAN-57: [SECURITY] Endpoint List User Tanpa RBAC Guard

## Agent
caf-backend

## Changes
- `apps/api/src/users/users.controller.ts`: added `@RequirePermission('user.read')` above `findAll()` (GET /users), matching pattern used on `findOne()`.
- `apps/api/src/users/users.controller.spec.ts` (new): unit tests —
  - asserts `PERMISSION_KEY` reflect metadata on `findAll` === `'user.read'`
  - asserts `findAll` delegates to `usersService.findAll` with merchant scope

## Verify Checklist (apps/api)
- [x] `pnpm --filter umkm-pos-api run lint` — pass, no errors.
- [x] `pnpm --filter umkm-pos-api run test` — pass, 16 suites / 189 tests.
- [ ] `pnpm --filter umkm-pos-api run build` — FAILS, but pre-existing and unrelated to this change.

### Build failure — root cause analysis (not caused by this fix)
`apps/api/prisma/schema.prisma` datasource block is corrupted at HEAD (before
any change in this task):
```
datasource db {
}
}
}
}
[487 more lines]
```
No `.env` present (only `.env.example`), and schema has no `url` in the
`datasource` block, so `prisma generate` fails with P1012, leaving
`PrismaService` untyped (missing model properties like `outlets`, `shifts`,
`transactions`, etc.) — 293 TS2339 errors across unrelated services
(`shifts.service.ts`, `stock.service.ts`, etc.), none touching
`users.controller.ts`.

Confirmed by stashing this task's diff and re-running the build on unmodified
HEAD — same 293 errors, same failure. This is a pre-existing repo/environment
issue (broken `schema.prisma` + missing `apps/api/.env`), not introduced or
fixable within scope of this single-file security fix.

## Notes
- No other consumer check needed within backend scope — `apps/web` permission
  set follow-up (if any) is out of scope per requirements.md, flagged as
  separate concern.
- Recommend a follow-up ticket to fix `apps/api/prisma/schema.prisma` datasource
  block and add `.env` so `pnpm --filter umkm-pos-api run build` (and
  `prisma generate`) work in this environment — currently blocks build
  verification for ANY apps/api change, not specific to GAN-57.
