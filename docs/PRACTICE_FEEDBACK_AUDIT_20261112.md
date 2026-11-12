# Practice Feedback Status — Read-only Audit (2026-11-12)

## Scope and provenance
- Repository: `lt068028/october2026`
- Audited baseline: `075bd5bb724963a1bc98c42a9f926460f836b986` (approved Practice 2.1 Preview).
- Reviewed 11 Practice pages plus Composition 1, Pronunciation 1/2 and Deutsche Übung 1.1 (15 pages).
- Audit is source-level only; no runtime/browser/device verification was performed.
- User confirmed real-device approval of the Practice 2.1 Preview on 2026-11-12, including feedback icon appearance, retry wrapping, red emphasis, and recording/play/stop behavior. This is user acceptance, not a claim that the audit independently retested the device.
- This documentation branch is not a deployment or approval to merge into `main`.

## Confirmed decisions (2026-11-12)
1. Keep the shared `practice2-next.js` for Practice 2.2 and 2.3 during this change. Reconsider splitting only if page-specific divergence makes maintenance harder. Verify both pages after changes.
2. Adopt the common feedback status icon set in Composition 1 and Pronunciation 2, retaining their existing red/blue diff semantics and special explanatory text.
3. Treat Deutsche Übung 1.1's `accepted`, `mismatch`, `undetermined` as the same **display states** as the Japanese pages; differences in labels are not a reason to fork the visual component. Keep its existing evaluator, including its explicit undetermined cases. Do not force Japanese pages into new undetermined judgments.
4. Keep Pronunciation 1 out of correctness-icon migration because it does not score answers.
5. Run syntax and automated tests throughout implementation. Conduct the consolidated 375/600/1440px browser, audio, copy, and real-device verification **after** the all-page Preview is ready.
6. Preserve current Q/A, question mark, other icon, recording, stop, autoplay, script, red/blue diff, answer-selection, and copy behavior.

## Approved Practice 2.1 presentation baseline
- Accepted: Microsoft Fluent Checkmark 24 Filled, 22px, positive semantic color, same-color 1.5px stroke; icon to the left of recognized text with 4px separation.
- Mismatch: Microsoft Fluent Fire 24 Regular, 20px, `Keep going!`; retain red text/gap highlighting. No automatic `Try once more!` extension.
- Undetermined: Lucide Footprints, 22px, tooltip/focus label `Could not be evaluated reliably.`; only for an explicitly established undetermined state.
- Retry message should wrap into available space as approved on Practice 2.1; do not blindly copy page-specific layout rules.
- Existing `feedback-status-icons.js` exposes `FeedbackStatus.resolve(saved)` and `FeedbackStatus.create(status)`; currently only Practice 2.1 HTML loads it.
- `practice2.1.js` implements the retry Fire SVG and wraps/positions the feedback separately.

## Page matrix at audited baseline

| Page | Display at baseline | Stored evaluation | Copy my sentences | Migration note |
|---|---|---|---|---|
| Practice 1.1 | old `✅` / `🔥 Keep going! Try once more!` | `isCorrect` | no | Preserve audio-only and unrecognized paths |
| Practice 1.2 | old `✅` / retry text | `isCorrect` | no | Multiple result render paths |
| Practice 2.1 | approved common accepted/undetermined SVG and Fluent Fire retry | `isCorrect`, `judgment` | no | Reference implementation; do not regress |
| Practice 2.2 | old `✅` / retry text | `isCorrect` | no | Shared `practice2-next.js` |
| Practice 2.3 | old `✅` / retry text | `isCorrect` | no | Shared `practice2-next.js`; test both |
| Practice 7.1 | old `✅` / retry text | `isCorrect` | yes | Copy uses saved STT and visible Q/A views |
| Practice 7.2 | old `✅` / retry text | `isCorrect` | yes | Copy uses selected Q/A option |
| Practice 7.3 | old `✅` / retry text | `correct` | yes | Map-backed result state |
| Practice 8.1 | old `✅` / retry text | `correct` | yes | Separate nuance `feedback` must remain |
| Practice 8.2 | old `✅` / retry text | `correct` | no | `feedback()` currently returns null |
| Practice 8.3 | old `✅` / retry text | `correct` | no | `feedback()` currently returns null |
| Composition 1 | old `✅` / retry text | `isCorrect` | no | Keep red/blue diff and `ga/wa` explanation |
| Pronunciation 1 | no correctness status | none | no | Out of scope for correctness icons |
| Pronunciation 2 | old `✅` / retry text | `isCorrect` | no | Keep red diff and recorded model/reference |
| Deutsche Übung 1.1 | old `✅`, `🔥 Keep going!`, `👣` | `correct`, `judgment` | yes | Use common status display, retain evaluator and existing copy text |

## Source-level findings and risks
- The other ten Practice pages have not loaded `feedback-status-icons.js` at the audited baseline.
- `practice2-next.js` is loaded by both Practice 2.2 and 2.3. Changes are coupled; no split in this iteration.
- Result objects are not uniform: `isCorrect` vs `correct`; the common display adapter must read both without changing the meaning or persistence of either.
- Japanese Practice pages without explicit undetermined evaluation should not fabricate one from short transcripts, STT errors, nonmatches, or missing data. No result status should be rendered for audio-only, unrecognized or not-yet-recorded states where applicable.
- Practice 7.1, 7.2, 7.3, 8.1 copy functions independently assemble plain text with `✅` for accepted and `—` otherwise. Preserve copy semantics and do not copy SVG markup.
- Deutsche Übung 1.1's copy function currently copies raw recorded sentences with cue text, without correctness marks. Do not add marks incidentally.
- Composition 1 uses red and blue diff semantics, including an additional `ga/wa` accepted-answer explanation. Preserve both.
- Practice 8.1 has separate nuance feedback; Practice 8.2 and 8.3 currently return null from their nuance feedback functions. Do not conflate this with correctness status.
- Pronunciation 1 is recording-oriented without answer scoring; do not introduce scoring.
- Common icon licensing and source attribution must be retained, including `assets/licenses/FEEDBACK-STATUS-SOURCES.txt`.
- Approved Q/A role icons and stop-button question indicator are separate UI systems, not feedback status.

## Implementation plan (separate Preview branch; no implementation in this documentation commit)
1. Start from a verified, explicit base commit; protect PR #8/#9, existing Preview branches, and uncommitted Practice 8.2 changes. Do not modify `main` or Production.
2. Generalize common feedback status display for both `isCorrect` and `correct`, and for the existing German `judgment` labels. Do not rewrite evaluators or stored result schemas.
3. Integrate into the ten other Practice pages, maintaining Practice 2.1 as the visual reference. Preserve the shared Practice 2.2/2.3 implementation.
4. Integrate into Composition 1, Pronunciation 2, and Deutsche Übung 1.1; leave Pronunciation 1 correctness UI unchanged.
5. Verify no regression in saved results, rerecording, script mode, Q/A choices, audio-only, red/blue highlights, nuance feedback, and copy output.
6. Run automated tests incrementally; build and deploy an isolated Preview; then verify at 375px, 600px, 1440px and on actual devices, including recording, playback, stop, copy and long-message wrapping.
7. Report commit SHA, Preview URL, test outcomes and any unresolved items. Wait for explicit user approval before merging.

## Source pointers
- `feedback-status-icons.js`, `feedback-status-icons.css`, `practice2.1.js`, `practice2.1.html`
- `practice1.1.js`, `practice1.2.js`, `practice2-next.js`, `practice7.1.js`, `practice7.2.js`, `practice7.3.js`
- `practice8.1.js`, `practice8.2.js`, `practice8.3.js`
- `composition1.js`, `pronunciation1.js`, `pronunciation2.js`, `uebung1.1.js`
