# October2026 — Project Operations Reference Map

This file is a navigation aid for the `october2026-project-operations` Skill. It is not a policy source and does not duplicate project rules.

## Read first

From the October2026 repository root, read the current workspace copies of:

1. `AGENTS.md` — shared project rules, role boundaries, permissions, and implementation constraints.
2. `docs/RELAY_WORKFLOW.md` — task assignment, work procedure, GitHub operations, verification, reporting, and specification management.

The latest confirmed GitHub `main` is the canonical source for committed project artifacts. A local or remote workspace may be behind `main`; do not assume it is synchronized. Verify the branch and commit, and state any gap. Do not perform a local sync or change the working tree without the permission required by the project rules.

## Read only what the task needs

- `docs/PROJECT_SPEC.md` — shared learning functions, recording, transcription, answer evaluation, and instructional requirements.
- `docs/UI_LAYOUT_SPEC.md` — shared interface, layout, responsive behavior, and supported device widths.
- `tests/README.md` — test selection, CI coverage, and verification procedure.
- Page-specific specifications — consult the paths listed in `AGENTS.md` and the relevant page's actual implementation.
- German learning content — consult `docs/GERMAN_DRILL_SPEC.md` and `docs/GERMAN_DEVELOPMENT_GUIDE.md` where relevant.

Do not read every page specification or run every test by default. Select references and checks based on the requested task and its direct impact.

## Source precedence

- Follow the user's latest explicit instruction for the current task, within the user's final decision authority.
- Use current `AGENTS.md` and `docs/RELAY_WORKFLOW.md` for project-wide rules and work procedures.
- Use the relevant approved specification for learning and interface requirements.
- Use implementation code to establish what is actually implemented; do not treat implementation alone as approval to change a specification.
- When sources conflict, identify the discrepancy and report it. Do not silently choose one source or rewrite the other to match.
