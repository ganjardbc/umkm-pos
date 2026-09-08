## Ticket
GAN-57: [SECURITY] Endpoint List User Tanpa RBAC Guard

## Order of Agents
1. caf-backend
2. caf-qa
3. caf-reviewer

## Backend Tasks
- [ ] (apps/api) Add `@RequirePermission('user.read')` decorator to `findAll()` in `apps/api/src/users/users.controller.ts` (above line 51, same pattern as `findOne()`).
- [ ] (apps/api) Check existing unit/e2e tests covering `GET /users` — update/add test asserting 403 without `user.read` permission and 200 with it.
- [ ] (apps/api) Run Verify Checklist for apps/api (lint, test, build) from `caf-backend.md`.

## Notes
- Single-file fix, low risk, high security priority.
- Confirm no other consumer (frontend/apps/web) relies on unauthenticated access to `GET /users` — if `apps/web` caller lacks `user.read` in its role permission set, that's a separate follow-up, not blocking this fix.
