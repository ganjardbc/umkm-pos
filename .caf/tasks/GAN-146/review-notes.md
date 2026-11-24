## Review Notes — GAN-146
Ticket: GAN-146
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. Diff only changes a default param value (`apps/api/src/audit-logs/audit-logs.service.ts:39`, `10` -> `20`) and adds one test. Merchant scoping (`merchantId` from `@CurrentUser('merchant_id')` in controller, ADR-001) untouched. No new endpoint, no new query.

### Qualitative Review
- Scope: diff = exactly 2 files (`audit-logs.service.ts` +1/-1, `audit-logs.service.spec.ts` +18/-0). Both are the files allowed by requirements.md section 3. No scope deviation. Controller, DTO, other modules untouched (Scope Out respected).
- Tasks: task 1 (new test) done; task 2 (default 20) done; task 3 (test/lint/build) reported in verify-report.md and validate-report.md; task 4 (grep record) done in verify-report.md. No task not done. (Checkboxes in `tasks.md` still unticked — cosmetic; I did not edit it.)
- Old tests: spec diff has only added lines, none removed. AC-3 holds.
- New test asserts `result.limit` = 20, `result.offset` = 0, and `findMany` called with `take: 20, skip: 0`. Matches task 1.
- Spec integrity: could not be checked. `.caf/tasks/GAN-146/` is untracked (no git history), and `requirements.md` is `Status: DRAFT`, never approved. Not assumed unchanged.
- ADR: no violation. ADR-001 (tenant scoping) unaffected. adr-008..015 are tool/framework choices, none about pagination.
- Note: controller default stays 10 (`audit-logs.controller.ts:35`), so the HTTP endpoint behavior does not change. Service default 20 is now different from the controller default 10 — known, recorded as A-1 in requirements.md, out of scope.

### Verdict Rationale
No blocking finding. Scope clean, all tasks reflected in the diff, AC-1..AC-5 have `automated-test`/`command` evidence and validate-report.md says PASS for each (I did not rerun them). AC-6 is manual evidence, so it is listed below as needs human check, not counted as passed. My own grep for AC-6 agrees with the claim (see below).

### For Developer
ACs needing human check:
- AC-6 (manual): I ran `grep -rn "getAuditLogs" apps` (excluding node_modules/dist/spec). Non-spec hits: `audit-logs.controller.ts:29` (controller method definition), `audit-logs.controller.ts:38` (only caller of the service), `audit-logs.service.ts:36` (definition). The caller passes `limitNum` and `offsetNum` explicitly (`audit-logs.controller.ts:35-36,38-43`). No dependency on service default 10 found. A human should confirm and mark it.
- AC-1..AC-5 are automated/command evidence as claimed. validate-report.md notes the spec's single-file test command was not run because spec is DRAFT; it ran the full API suite instead (24 suites, 260 tests passed).

Proposed Spec Changes (from validate-report.md, raised to human, not applied):
- Set `requirements.md` to `Status: APPROVED` if the validator should run the spec's own `Verify:` commands. Not accepted or applied by reviewer.
- verify-report.md has no `## Proposed Spec Changes` section.

Minor: validate-report.md says exit codes were "inferred from clean completion", not printed. Weak evidence but consistent with verify-report.md.
