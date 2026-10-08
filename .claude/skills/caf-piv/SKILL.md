---
name: caf-piv
description: Plan-Implement-Verify workflow for manual coding sessions in this repo. Use when the user asks for a code change, bug fix, feature or refactor directly in chat, not through a CAF agent or the caf-orchestrator pipeline.
---

# Plan, implement, verify (manual sessions)

For an interactive session with a human only. CAF agents have their own Working Pattern — do not
apply this in an agent or headless run.

1. PLAN — read first: `CLAUDE.md`, `AGENTS.md`, the code involved, and `.caf/knowledge/` if it
   exists. State the goal, the files you will touch, how you will verify, and your open
   questions. Then stop and wait for the user's go-ahead. A trivial change the user already
   spelled out (a typo, a one-line fix) needs only a one-line plan.
2. IMPLEMENT — only what the plan says. If the plan turns out wrong, go back to PLAN and tell the
   user. Apply the `caf-scope-discipline` and `caf-no-guess` skills.
3. VERIFY — run the commands in the `caf-verify` skill and report the real results. The work is
   not done until verification ran, or you said explicitly what could not be run and why.

Do not commit or push unless the user asks.
