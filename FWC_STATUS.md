# FWC — outstanding work register

Updated: 2026-11-11
Scope: consolidated ChatGPT working register, saved to GitHub at a checkpoint.
Branch: `preview/deutsch11-lucide-audio-20261110` (preview only; not merged into `main`).

## Color-coded action/status legend

- 🔵 **調査指示** — investigate only, no code edits. Linked instructions are ready for Codex.
- 🟠 **変更指示** — approved implementation or repair, separate from investigation.
- 🟣 **仕様決定待ち** — design/behavior decision pending; do not implement yet.
- 🟢 **実機確認待ち** — implementation exists; verify in real browser/device before closing.

## Quick action links

| Label | Item | Ready-to-open action |
| --- | --- | --- |
| 🔵 調査指示 | Practice 7.1 Y/N display delay | [調査指示書を開く](FWC_INSTRUCTIONS/investigate-practice71-yn-delay.md) |
| 🔵 調査指示 | Practice 8.1 Drill 4 display delay | [調査指示書を開く](FWC_INSTRUCTIONS/investigate-practice81-drill4-delay.md) |
| 🟣 仕様決定待ち | Deutsch 1.1 arrow — eight variants | [比較Previewを開く](https://october2026-git-preview-deutsch11-lucide-audio-20261110-az-c884.vercel.app/uebung1.1.html) |
| 🟢 実機確認待ち | Deutsch 1.1 transcription sizes | [実機Previewを開く](https://october2026-git-preview-deutsch11-lucide-audio-20261110-az-c884.vercel.app/uebung1.1.html) |
| 🟢 実機確認待ち | Practice 8.1 Drill 4/5 | Verify in browser; investigate if a defect reproduces |

## Definitions
- F = Fix / defect
- W = Wish / enhancement or design decision
- C = Concern / investigation
- Status is not "done" until the change has been verified in the browser/device when applicable.
- Estimates are rough and do not represent measured implementation times.

## Deutsch 1.1 — confirmed current three items

| Type | Priority | Item | Status | Next action |
| --- | --- | --- | --- | --- |
| F | High | Playback stop: Speaker (TTS) and Abspielen (recording playback) show stop but pressing the same button may restart playback instead of stopping it | Unresolved; user reported no improvement on Nov 11 | Investigate click handling and audio session state; try true stop as a new feature; if not reliably achievable, disable the playback button during playback and show not-allowed cursor instead of a misleading stop affordance. Preserve recording, Autostop and Autoplay. |
| F | Medium | Transcription text size: 1.2em during recognition and after recording, while "Not yet" remains 0.75em | 🟢 実機確認待ち — Preview code pushed; actual display not yet verified | Test both recording states and placeholder, confirm font size stays consistent across state transition. |
| W | Medium | Finalize Example arrow icon | 🟣 仕様決定待ち — Eight-option switcher on Preview; choice pending | Compare Forward outline/filled, Square Arrow Right outline/inverted, Circle Arrow Right outline/inverted, Move Right, Chevrons Right. Consider Move Right stroke-width and size. Remove comparison UI after choosing final icon. |

Preview URL: https://october2026-git-preview-deutsch11-lucide-audio-20261110-az-c884.vercel.app/uebung1.1.html

## Other outstanding / verify-before-action items

| Type | Item | Status / caution |
| --- | --- | --- |
| C | Practice 7.1: Yes/No rendering delay | 🔵 調査指示 — [open instructions](FWC_INSTRUCTIONS/investigate-practice71-yn-delay.md); confirm it still reproduces. |
| C | Practice 8.1 Drill 4: rendering delay | 🔵 調査指示 — [open instructions](FWC_INSTRUCTIONS/investigate-practice81-drill4-delay.md); verify cause. |
| C | Practice 8.1 Drill 4/5: real-device checks | 🟢 実機確認待ち — Verify prior implementation before classifying as a defect. |
| F / C | Practice 7.2: audio interruption when recording starts during playback | Previously reported; verify current behavior and expected interruption policy. |
| W | Cross-page Lucide question/answer or question-mark icon rollout | Scope and existing implementation need verification before changing all pages. |
| W | TTS-unavailable environment guidance | Check which pages already have guidance and whether a common behavior is needed. |

## Previously implemented — do not reopen without fresh evidence
- Example speech-line gray dotted separator removal.
- Latin UI font standardization to Lato.
- Practice 2.3 speaker alignment (6px).
- Practice 8.3 question-mark display.
- Other previously deployed visual/layout corrections.

## Workflow
- Keep day-to-day FWC updates in chat.
- Save a checkpoint to GitHub at meaningful milestones or before changing development environments, not on every message.
- Distinguish code committed, deployment succeeded, and actual device verification.
- Do not merge this Preview branch into `main` without explicit approval.
