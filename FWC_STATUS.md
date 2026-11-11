# FWC STATUS — Active only
Updated: 2026-11-11. Source of truth: latest explicit user decision. Branch: `preview/deutsch11-lucide-audio-20261110`.

## Workflow
- "作業開始" or "作業開始します" triggers startup reconciliation.
- At startup, display **last 24 hours of instructions, execution results and current status**; ask user to confirm consistency before committing daily register.
- Cross-check active FWC against permanent `FWC_GRADUATED.md`; graduated items must never be revived from old notes. If a new incident occurs, register a distinct new issue with new evidence.
- Once reconciled, update prior-session snapshot and graduated register on GitHub, then show today's one-line-per-item FWC.
- Keep only last ~3 days of transient work notes as active reference; do not rewrite Git history.
- Do not create investigation instruction files on GitHub; generate copyable instructions in chat.
- 🔴 変更指示 / 🔵 調査指示 / ⚫ 仕様決定待ち / ⚪ 実機確認待ち.
- Do not change app code or main without authorization.

## Active FWC

| Type | Issue | State | Decision / next step |
|---|---|---|---|
| W priority 1 | Shared Japanese/German "🔥 Keep going! Try once more!" UI | ⚫ 仕様決定待ち | Remove "Try once more!" wording; redesign positioning, typography, size, spacing and emoji→SVG across Japanese and German; do not assume German-only. |
| F | Deutsch 1.1 speaker / recorded playback stop button fails to stop reliably | 🔵 調査指示 | Unresolved. |
| F/W | Deutsch 1.1 extracted text too small compared with Keep going | ⚫ 仕様決定待ち | Device observation confirmed; decide common UI font/layout, then implement. |
| F/W | Deutsch 1.1 no-speech error and Not yet layout | ⚫ 仕様決定待ち | Proposed/approved: error immediately left of Not yet, both right-aligned; preserve extracted text right alignment. Coordinate with shared layout redesign. |
| W | Deutsch 1.1 arrow icons eight variants | ⚫ 仕様決定待ち | Compare Preview and select. |
| F/C | Deutsch 1.1 recording / playback / Autoplay controls | 🔵 調査指示 | Already registered; consolidate with playback stop issue, do not duplicate. |
| W | Question-mark icon choice: currently implemented only on Practice 2.1 | ⚫ 仕様決定待ち | Compare thinner stroke, MS, Google and previous third candidate on **all pages** before rollout. |
| W | Question-mark icon rollout to all pages except Practice 2.1 | ⚫ 仕様決定待ち | Dependent on icon comparison and decision. No premature rollout. |
| W | Copy my sentences on pages outside Practice 7.1/7.2/7.3 | ⚫ 仕様決定待ち | Check font size first, then decide expansion. |
| C | GitHub Actions 4 groups failed | 🔵 調査指示 | Runs finished (not waiting); investigate failures, don't presume app defects. |
| W | TTS-unavailable environment notice | 🔵 調査指示 | Existing implementation scope uncertain; check without resurrecting graduated issues. |
| C | Practice 8.1 Drill 4/5 remaining checks (not display delay) | ⚪ 実機確認待ち | Only genuinely outstanding checks; latest user says Dr5 Adj/〃 verified, select instability fixed. Narrow or graduate if no residual checks. |

## Already graduated — never reopen from stale records
See `FWC_GRADUATED.md`. In particular Practice 7.1 Y/N delay, Practice 8.1 Dr4 delay and Practice 7.2 audio interruption are closed.
