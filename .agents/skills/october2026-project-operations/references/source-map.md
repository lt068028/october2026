# October2026 — Project Operations Reference Map

This file is a navigation aid for the `october2026-project-operations` Skill. It is not a policy source and does not duplicate project rules.

## Read first

The policy baseline is always the latest GitHub `main`, not an assumed-current local copy:

1. [`AGENTS.md`](https://github.com/lt068028/october2026/blob/main/AGENTS.md) — shared project rules, role boundaries, permissions, and implementation constraints.
2. [`docs/RELAY_WORKFLOW.md`](https://github.com/lt068028/october2026/blob/main/docs/RELAY_WORKFLOW.md) — task assignment, work procedure, GitHub operations, verification, reporting, and specification management.

Verify the latest `main` commit before relying on workspace copies. Read the two policy files from that revision through an authorized GitHub connector/API, or use the workspace copies only after confirming that the workspace HEAD matches the latest `main`.

A task may use a separate approved branch or worktree for its code baseline. Keep that code baseline distinct from the `main` policy baseline. Do not merge, pull, reset, or otherwise change a worktree merely to read policy. Do not use local tools or environments without the permission required by the project rules.

## Read only what the task needs

- [`docs/PROJECT_SPEC.md`](https://github.com/lt068028/october2026/blob/main/docs/PROJECT_SPEC.md) — shared learning functions, recording, transcription, answer evaluation, and instructional requirements.
- [`docs/UI_LAYOUT_SPEC.md`](https://github.com/lt068028/october2026/blob/main/docs/UI_LAYOUT_SPEC.md) — shared interface, layout, responsive behavior, and supported device widths.
- [`tests/README.md`](https://github.com/lt068028/october2026/blob/main/tests/README.md) — test selection, CI coverage, and verification procedure.
- Page-specific specifications — consult the paths listed in the current `AGENTS.md` and the relevant page's actual implementation.
- German learning content — consult [`docs/GERMAN_DRILL_SPEC.md`](https://github.com/lt068028/october2026/blob/main/docs/GERMAN_DRILL_SPEC.md) and [`docs/GERMAN_DEVELOPMENT_GUIDE.md`](https://github.com/lt068028/october2026/blob/main/docs/GERMAN_DEVELOPMENT_GUIDE.md) where relevant.

Do not read every page specification or run every test by default. Select references and checks based on the requested task and its direct impact.

## Source precedence

- Follow the user's latest explicit instruction for the current task, within the user's final decision authority.
- Use current `AGENTS.md` and `docs/RELAY_WORKFLOW.md` from GitHub `main` for project-wide rules and work procedures.
- Use the relevant approved specification for learning and interface requirements.
- Use implementation code to establish what is actually implemented; do not treat implementation alone as approval to change a specification.
- When sources conflict, identify the discrepancy and report it. Do not silently choose one source or rewrite the other to match.
