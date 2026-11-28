# October2026 — Project Operations Reference Map

This file is a navigation aid for the `october2026-project-operations` Skill. It is not a policy source and does not duplicate project rules.

## Read first

Use the following sources according to their responsibilities:

1. **Project Instructions** — project purpose, role definitions, responsibilities, permissions, final decision authority, and approval principles. These instructions are supplied through the active Project/chat context, not through a repository file. Confirm that they are actually available; do not assume the Skill or Agent has loaded them.
2. [`AGENTS.md`](https://github.com/lt068028/october2026/blob/main/AGENTS.md) — repository-specific start-up checks, task-scope safeguards, implementation/editing constraints, and operating-environment rules.
3. [`docs/RELAY_WORKFLOW.md`](https://github.com/lt068028/october2026/blob/main/docs/RELAY_WORKFLOW.md) — detailed work procedures, environment checks, GitHub operations, verification, reporting, interruption, resumption, and specification management.

Verify the latest GitHub `main` commit before relying on workspace copies. Read repository policy files from that revision through an authorized GitHub connector/API, or use workspace copies only after confirming that the workspace HEAD matches the latest `main`.

If Project Instructions are unavailable in the active environment, ask the user to provide the applicable current instructions. Do not infer role assignments, extra permissions, or approval rules from the Skill, Agent configuration, or remembered content.

A task may use a separate approved branch or worktree for its code baseline. Keep that code baseline distinct from the `main` policy baseline. Do not merge, pull, reset, or otherwise change a worktree merely to read policy. Do not use local tools or environments without the permission required by the project rules.

## Read only what the task needs

- [`docs/PROJECT_SPEC.md`](https://github.com/lt068028/october2026/blob/main/docs/PROJECT_SPEC.md) — shared learning functions, recording, transcription, answer evaluation, and instructional requirements.
- [`docs/UI_LAYOUT_SPEC.md`](https://github.com/lt068028/october2026/blob/main/docs/UI_LAYOUT_SPEC.md) — shared interface, layout, responsive behavior, and supported device widths.
- [`tests/README.md`](https://github.com/lt068028/october2026/blob/main/tests/README.md) — test selection, CI coverage, and verification procedure.
- Page-specific specifications — consult the paths listed in the current `AGENTS.md` and the relevant page's actual implementation.
- German learning content — consult [`docs/GERMAN_DRILL_SPEC.md`](https://github.com/lt068028/october2026/blob/main/docs/GERMAN_DRILL_SPEC.md) and [`docs/GERMAN_DEVELOPMENT_GUIDE.md`](https://github.com/lt068028/october2026/blob/main/docs/GERMAN_DEVELOPMENT_GUIDE.md) where relevant.

Do not read every page specification or run every test by default. Select references and checks based on the requested task and its direct impact.

## Source precedence

- Follow the user's latest explicit instruction for the current task.
- Use Project Instructions for project-wide role definitions, responsibilities, permissions, and approval principles.
- Use `AGENTS.md` for repository-specific constraints and `docs/RELAY_WORKFLOW.md` for detailed work procedures.
- Use the relevant approved specification for learning and interface requirements.
- Use implementation code to establish what is actually implemented; do not treat implementation alone as approval to change a specification.
- When sources conflict or their applicable authority is unclear, identify the discrepancy and report it. Do not silently choose one source or rewrite another source to match.
