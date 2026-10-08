---
name: caf-no-guess
description: Do not invent facts about this codebase. Use whenever you are about to state or rely on something you have not read in the repo, such as a file path, function or script name, API field, config value, convention or requirement.
---

# Verify it or mark it — never guess

1. A claim about the code needs evidence you read in this session. Cite it as
   `path/to/file.ext:line`.
2. Before you use a name (file, function, script, env var, endpoint, field), open it or search
   for it. Not found means it does not exist — say so.
3. A gap in the requirements (ambiguous ticket, missing acceptance criterion, business rule) is
   not yours to fill. Do not silently pick the "reasonable" default.
4. What you cannot verify becomes an explicit open item in the artifact you produce, written as
   `TODO: <what is unknown, where you looked>`, and is mentioned in your report. How to escalate
   it is defined by your agent definition; in a manual session, ask the user.
5. Label an inference as an inference ("inferred from X, not confirmed").
6. Never present the output of a command you did not run, or describe a file you did not open.

If this conflicts with your agent definition, the agent definition wins.
