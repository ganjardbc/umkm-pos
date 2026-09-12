## Review Notes — CAF-LOCAL-notif-scoping-fix
Ticket: CAF-LOCAL-notif-scoping-fix
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit

**Previously BLOCKING finding — resolved, independently re-verified.**

`apps/api/src/main.ts`'s `allowedHeaders` is now `['Content-Type', 'Authorization',
'X-Outlet-Id', 'X-Customer-Session-Token']`, with a comment above it stating this is an
explicit allow-list and that new custom frontend headers must be added here.

I independently re-ran the grep the fix claims (not trusting the report's word for it):

```
grep -rniE "headers\[|headers\.set|setRequestHeader|headers:" apps/web/src apps/landing/src
```

Result — four hits, matching the fix's own accounting exactly:
- `apps/web/src/plugins/axios.ts` → `X-Outlet-Id` (already in the list).
- `apps/web/src/plugins/customer-api.ts` → `x-customer-session-token` (the one previously
  missing, now added).
- `apps/web/src/services/uploads.ts` → only overrides `Content-Type` to `undefined` so the
  browser sets the multipart boundary; no new custom header.
- `apps/landing/src/components/CustomerRegisterSection.vue` → only sets `Content-Type`.

No custom header is missing from the list.

I also independently verified the casing claim rather than accepting it on faith. Read the
installed `cors@2.8.6` package directly
(`node_modules/.pnpm/cors@2.8.6/node_modules/cors/lib/index.js`,
`configureAllowedHeaders`): the package does no header-name comparison/validation of its own —
it simply writes whatever `allowedHeaders` list was configured, verbatim, into the
`Access-Control-Allow-Headers` response header on preflight. The actual accept/reject decision
is made by the **browser**, which compares `Access-Control-Allow-Headers` against the
requested `Access-Control-Request-Headers` case-insensitively per the Fetch/CORS spec (HTTP
header field names are always case-insensitive). So configuring the list as `Train-Case`
(`X-Outlet-Id`, `X-Customer-Session-Token`) while the frontend actually sends
`x-customer-session-token` in lowercase is correctly a style choice only, not a behavioral gap
— confirmed from the library's own source, not just the report's assertion.

This closes the regression: customer-catalog/guest-ordering traffic will no longer fail CORS
preflight.

No other security issues found. The guard, service scoping, migration, schema, and seed were
untouched this round (confirmed by diff — see Scope Check below) and were already reviewed and
approved of on their merits in the previous round.

### Qualitative Review

**New test coverage (non-blocking finding from last round) — resolved, and it's real
coverage, not shape-only assertions.**

Read `apps/api/src/notifications/notifications.service.spec.ts` in full (not just the diff).
The four new tests genuinely assert composed query behavior against the actual implementation,
the same standard I applied to the guard spec last round:

- `findAll`, no `outletId`: asserts the exact `where` object passed to `findMany` and both
  positional `count` calls (`toHaveBeenNthCalledWith`, distinguishing the total-count query
  from the unread-count query) omits `outlet_id` and includes `merchant_id` — this would catch
  a mistake like forgetting to scope the *second* (unread) count query, which is exactly the
  kind of bug the previous round's review flagged as a coverage gap (a typo'd/omitted field in
  one of the two similar-but-not-identical `where` clauses).
  it produces a wrong `is_read` position, etc.
- `findAll`, with `outletId`: same, confirming `outlet_id` is added to both queries.
- `markAllAsRead`: asserts the `updateMany` `where` includes `merchant_id`, with and without
  `outletId`, and asserts the returned `{ updated: count }` shape.

These assert the actual `where`-clause contents (via `toHaveBeenCalledWith`/
`toHaveBeenNthCalledWith` with literal objects), not just "was called" or "was called with an
object" — they would fail if the merchant/outlet scoping logic were subtly wrong. I ran the
suite myself rather than trusting the reported numbers:

```
pnpm --filter umkm-pos-api run test
Test Suites: 21 passed, 21 total
Tests:       238 passed, 238 total
```

Matches the report exactly.

### Scope Check
`git status --porcelain` and `git diff --stat` confirm this round touched only:
- `apps/api/src/main.ts` (11 lines added — the `allowedHeaders` fix + explanatory comment)
- `apps/api/src/notifications/notifications.service.spec.ts` (new `findAll`/`markAllAsRead`
  test blocks)
- `verify-report.md` (report update)

The guard (`outlet-header.guard.ts`), service business logic (`notifications.service.ts`),
schema, migration, and seed are byte-identical to what I reviewed last round — confirmed via
`git diff` showing no changes to them beyond what was already present before this fix round.

### Verdict Rationale
The single blocking finding from the previous round — the CORS `allowedHeaders` regression
that would have broken the customer-catalog session header — is fixed, and I independently
re-derived both halves of the fix (the completeness of the header list, and the correctness of
the case-insensitivity claim) rather than accepting the verify-report's account at face value;
both check out. The non-blocking test-coverage gap is also closed with tests that assert real
query behavior. Fix-round scope was disciplined — only the two files that needed to change,
changed. Full test suite passes (238/238, independently re-run), lint and build are reported
clean and nothing in this round's diff would affect that. No new findings. Approving.

### For Developer
None — ready to proceed.
