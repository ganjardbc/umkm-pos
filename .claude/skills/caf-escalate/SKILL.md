---
name: caf-escalate
description: When and how to stop and hand a task back to a human. Use when verification keeps failing, the task is blocked, the plan no longer matches the code, or a decision is needed that is not yours to make.
---

# Escalate instead of pushing through

Stop and escalate when:

- the same verification still fails after the retry limit in your agent definition (3 when none is
  stated) — count the attempts, and do not retry the same fix;
- the task needs a change outside your scope, or contradicts the requirements, an ADR or a
  documented convention;
- it needs a human decision: product behaviour, security, a data migration or destructive
  operation, a new dependency, credentials;
- a required input is missing or contradicts another one.

How:

- Running as a CAF agent: follow the Retry Logic and Constraints sections of your agent
  definition exactly. They name the report file and the exact status word; this skill never
  changes either. Never end a run with only a question in chat — write the report.
- In a manual session: stop and tell the user.

What the escalation contains: each attempt and its actual error, what is blocking, the specific
decision you need, and the options if you see any.

Leave the working tree as it is. No stubs or disabled tests to make it look green, no commit or
push.

If this conflicts with your agent definition, the agent definition wins.
