---
name: october2026-project-operations
description: Use for October2026 tasks involving consultation, read-only analysis, learning content, specifications, implementation, tests, or GitHub work. Load the current project rules and task-relevant references before acting.
---

# October2026 Project Operations

This Skill is a shared workflow entrypoint for the October2026 repository. It is not a second copy of project policy. The current `AGENTS.md` and `docs/RELAY_WORKFLOW.md` remain the authoritative project rules.

## Required procedure

1. Confirm that the active workspace is `lt068028/october2026`. Identify the workspace root, branch, and current commit. Do not assume a local checkout is synchronized with GitHub `main`.
2. Read `references/source-map.md`.
3. Read the current `AGENTS.md` and `docs/RELAY_WORKFLOW.md` from the active workspace. When the task depends on the latest committed state, verify the current GitHub `main` and its relevant files. Distinguish the GitHub state from the workspace state.
4. Read only the additional specifications, code, and test guidance relevant to the task, using the source map and references from `AGENTS.md`.
5. Follow the role and work scope explicitly assigned by the user. Do not change roles because the topic changes. If the assignment is genuinely unclear, ask only for the missing role or permission.
6. Keep consultation, read-only analysis, and implementation distinct. Analysis is read-only. Edit, execute, commit, push, or change settings only when the user's instruction and the current project rules authorize that action. Do not expand the task into adjacent issues.
7. Select verification for the changed and directly affected scope. Distinguish static inspection, automated tests, browser checks, and user real-device acceptance. Never report an unperformed check as complete.
8. Report evidence and outcomes precisely, separating verified facts, interpretation or inference, and unknowns. Name relevant files, commit or branch when available, checks performed, and remaining limitations.

## Important boundaries

- The user retains final authority over learning content, accepted answers, specifications, scope, and priority.
- A Skill activation does not grant additional file, shell, GitHub, or local-environment permissions.
- Do not create task logs, handover documents, tracking registries, branches, or pull requests merely to preserve conversation status. Follow the current project rules.
- F/W/C task-list management belongs to the consultant role in the conversation. This Skill does not make the independent auditor responsible for maintaining or updating F/W/C.
- If the current workspace, GitHub, or a required reference cannot be read, disclose exactly what was unavailable. Do not substitute remembered or historical content and claim it is current.
