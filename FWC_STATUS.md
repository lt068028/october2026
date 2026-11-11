# FWC — current working register

Updated: 2026-11-11. Source of truth for status: latest user confirmation, not older investigation proposals.
Branch: `preview/deutsch11-lucide-audio-20261110`. **This is a tracking-only update; no app code was changed.**

## Status legend (fixed)
- 🔴 **変更指示** — implement or fix after instruction is prepared in chat.
- 🔵 **調査指示** — investigate; instruction text is generated in ChatGPT, **not saved as a GitHub file**.
- ⚪ **実機確認待ち** — implemented, awaiting device check.
- ⚫ **仕様決定待ち** — decision pending; no implementation until selected.

## Active FWC — one line per item

| Type | Target / issue | Next status | Current decision |
| --- | --- | --- | --- |
| F | Deutsch 1.1 Speaker/Abspielen playback stop restarts instead of stopping | 🔵 調査指示 | Still unresolved. Investigate before changing behavior; fallback is disable during playback if reliable stop is impossible. |
| F | Deutsch 1.1 recognized/extracted text appears too small compared with Keep going | 🔴 変更指示 | **Not verified/fixed**; user confirmed still small on device. Recheck CSS and state transitions; do not mark as device-verification-only. |
| W | Deutsch 1.1 choose one of 8 arrow icons | ⚫ 仕様決定待ち | [Open 8-option Preview](https://october2026-git-preview-deutsch11-lucide-audio-20261110-az-c884.vercel.app/uebung1.1.html). |
| F | Deutsch 1.1 no-speech error and Not yet alignment | 🔴 変更指示 | Error text immediately to left of right-aligned Not yet; the pair stays right aligned. Keep extracted text right alignment and existing behavior unchanged. |
| W | Deutsch 1.1 Keep going occupies a new row even when horizontal space is available | ⚫ 仕様決定待ち | Consider placing Keep going left or right of extracted text in the same row when it fits; avoid unnecessary row height, allow narrow-screen wrapping. Confirm precise placement before changing. |
| F/C | Practice 7.2 recording begins while model/recorded audio plays; interruption behavior | 🔵 調査指示 | Previously reported; do not assume fixed or still broken without current verification. |
| W | Question/answer/question-mark icon rollout across pages | ⚫ 仕様決定待ち | Check existing per-page implementation and confirm scope before changes. |
| W | TTS-unavailable environment guidance across pages | 🔵 調査指示 | Audit existing implementation before considering rollout. |
| C | Practice 8.1 Drill 4/5 real-device verification (other than accepted display speed) | ⚪ 実機確認待ち | Only checks still genuinely outstanding; do not reopen display delay. |

## Closed / accepted — do not re-add to active FWC
- **Practice 7.1 Y/N display delay:** user confirmed speed is now acceptable on 2026-11-11. No further investigation or optimization requested.
- **Practice 8.1 Drill 4 display delay:** user confirmed the current speed is acceptable on 2026-11-11. No further investigation or optimization requested.
- Example speech-line gray dotted separator removal, Lato standardization, Practice 2.3 6px alignment, Practice 8.3 question-mark display: previously implemented; reopen only with new evidence.

## Working rules
1. One compact line per active FWC item. Separate active, accepted/closed, and deferred items.
2. User's latest acceptance closes an issue; never resurrect from an old list without fresh evidence.
3. Keep FWC updates in chat; save occasional checkpoints to GitHub.
4. **Do not create GitHub investigation instruction files.** For 🔵 or 🔴 actions, generate a copyable Codex instruction in the chat on request.
5. GitHub instruction files for Practice 7.1 and 8.1 created earlier were deleted from this Preview branch on 2026-11-11.
6. Keep implementation, deployment, and real-device verification statuses distinct.
7. Do not modify `main` or merge without explicit approval.
