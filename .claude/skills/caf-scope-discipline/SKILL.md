---
name: caf-scope-discipline
description: Keep a change inside the scope of the task. Use for every code or document change in this repo, before editing a file, when tempted to refactor or fix something nearby, or when a task seems to need a file outside the assigned area.
---

# Stay inside the scope

1. Know your scope before the first edit. Running as a CAF agent: the Scope section of your agent
   definition. Otherwise: the files the task names.
2. Touch only what the task needs. No drive-by refactors, renames, reformatting or dependency
   bumps.
3. Something broken or ugly outside the task: write it down as a finding in your output. Do not
   fix it.
4. The task cannot be done without a file outside your scope: stop before editing that file and
   report which file and why. Do not widen the scope yourself.
5. Lockfiles, CI configuration, env and secret files: leave them alone unless the task explicitly
   requires the change.
6. Before you finish, list the files you changed and confirm each one belongs to the task.

If this conflicts with your agent definition, the agent definition wins.
