## Review Notes — GAN-41
Ticket: GAN-41
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
Fix closes the info-disclosure gap correctly. Diff confirmed minimal and exact:
```
- // @RequirePermission('role.read')
+ @RequirePermission('role.read')   (GET /rbac/roles)

- // @RequirePermission('permission.read')
+ @RequirePermission('permission.read')   (GET /rbac/permissions)
```
No new permission codes invented — reuses `role.read`/`permission.read` already
active on sibling `:id` endpoints in same controller, and confirmed present in
seed data assigned to owner/admin roles. `GET /users/:userId/roles` (line 215)
verified untouched — guard still commented there, correctly left out of scope.
No cross-tenant/merchant_id concern (roles/permissions are global entities).

### Qualitative Review
Two-line diff, zero collateral changes to controller logic. `rbac.service.spec.ts`
diff is a no-op (trailing newline only), not a functional change. Lint + 184 tests
pass. Build failure is pre-existing/environmental (corrupted `schema.prisma`
datasource block + missing generated Prisma client) — backend proved this via
`git stash` on unmodified HEAD, so not caused by this diff. Frontend caller flows
(`apps/web` role/permission modules) already gate UI on these exact permission
codes client-side, so no live break expected for owner/admin users; QA confirmed
by code inspection since live HTTP run wasn't possible in this env.

### Verdict Rationale
Change matches ticket scope exactly, reuses proven guard pattern, no scope creep,
tests/lint green, unrelated pre-existing build/env issue correctly identified and
not conflated with this fix. Both verify and QA reports are consistent and thorough.

### For Developer
- No action needed for GAN-41 itself.
- File separate follow-up ticket for `GET /users/:userId/roles` commented guard
  (flagged by both backend and QA).
- File separate infra ticket for `prisma/schema.prisma` corruption + missing
  generated client blocking `build` in this sandbox — unrelated to RBAC, but
  blocks meaningful CI build verification generally.
- Optional (non-blocking): add explicit 403/200 unit test for these two endpoints
  rather than relying solely on sibling-endpoint pattern coverage.
</content>
