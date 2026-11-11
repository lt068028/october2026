# FWC — outstanding work register

Updated: 2026-11-11
Scope: consolidated ChatGPT working register, saved to GitHub at a checkpoint.
Branch: `preview/deutsch11-lucide-audio-20261110` (preview only; not merged into `main`).

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
| F | Medium | Transcription text size: 1.2em during recognition and after recording, while "Not yet" remains 0.75em | Preview code pushed; actual display not yet verified | Test both recording states and placeholder, confirm font size stays consistent across state transition. |
| W | Medium | Finalize Example arrow icon | Eight-option switcher on Preview; choice pending | Compare Forward outline/filled, Square Arrow Right outline/inverted, Circle Arrow Right outline/inverted, Move Right, Chevrons Right. Consider Move Right stroke-width and size. Remove comparison UI after choosing final icon. |

Preview URL: https://october2026-git-preview-deutsch11-lucide-audio-20261110-az-c884.vercel.app/uebung1.1.html

## Other outstanding / verify-before-action items

| Type | Item | Status / caution |
| --- | --- | --- |
| C | Practice 7.1: Yes/No rendering delay | Investigation candidate; confirm it still reproduces. |
| C | Practice 8.1 Drill 4: rendering delay | Investigation/verification candidate. |
| C | Practice 8.1 Drill 4/5: real-device checks | Verify prior implementation before classifying as a defect. |
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
