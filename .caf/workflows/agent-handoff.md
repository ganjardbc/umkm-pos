# Agent Handoff Format

> Part of this file is auto-generated from the detected agent roster.

Each ticket has its own folder: `.caf/tasks/{TICKET-ID}/`. An agent reads the previous
agent's output from this folder, not from chat/memory.

## Artifact per Agent (based on detected roster)

| Agent | Artifact Output |
|---|---|
| Planner | `requirements.md`, `tasks.md` |
| Architect | `design.md` |
| Frontend | code + `verify-report.md` |
| Backend | code + `verify-report.md` |
| QA | `qa-report.md` |
| Reviewer | `review-notes.md` |
| Documentation | update `docs/` (parallel, non-blocking) |
| PM | `prd.md`, `flow.md` (in `.caf/discovery/{slug}/`, not `.caf/tasks/` — see CAF.md Cluster 1) |
| UX Designer | `flow.md` (in `.caf/discovery/{slug}/`, not `.caf/tasks/` — see CAF.md Cluster 1) |
| Auditor | `audit-report.md` (in `.caf/audits/{DATE}/`, not `.caf/tasks/` — see CAF.md Cluster 4) |

## Format `verify-report.md`

Use the literal word `SUCCESS` on success — not `PASS`/`DONE`/`OK`. If this project uses
caf-orchestrator, it greps this file for `\bSUCCESS\b`; anything else is read as
`NEEDS_HUMAN` and stops the pipeline before QA/Reviewer/PR creation.

```markdown
# Verify Report

Status: SUCCESS | NEEDS_HUMAN

## Checklist
- [ ] lint
- [ ] typecheck
- [ ] test
- [ ] build

## Acceptance Criteria
- AC-1: automated-test — <file>::<test name>
- AC-2: command — <command> | <exit code or output observed>
- AC-3: build-only — <command that passed>; no test exists for this behavior
- AC-4: manual — <steps a human must run, or steps already run>
- AC-5: none — <why>

## Proposed Spec Changes
-

## Notes
TODO: verification result details, errors if any
```

`## Acceptance Criteria`: one line per AC of `requirements.md`, in exactly one of the five forms
above. Name the test; the number of passing tests is never evidence. An AC marked
`Verify: manual` is reported as `manual`, an AC marked `Verify: command:` as `command` with the
result observed, and an area with no test runner as `build-only` or `manual` — not as
`automated-test`.

`## Proposed Spec Changes`: once `requirements.md` says `Status: APPROVED`, never edit it. If
the spec is wrong or impossible to satisfy, write the proposed change here and a human decides.
Write `-` when there is none.

Keep the word the `Status:` line uses for success out of every other line of the report: the
grep above reads the whole file, not only that line.

## Additional Agents (Custom)

No custom agents detected outside the standard CAF roles.
