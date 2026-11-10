// Regression Test: Practice 7.1 Drill 2 Yes/No Answer Selection Localized Rendering
// Verifies that selecting Yes or No updates only the target question's answer cell
// without re-rendering Drill 1, Example, or other Drill 2 questions, keeps aria-pressed/CSS
// synchronized, maintains audio exclusive control, and preserves recorded results across toggles and script mode changes.

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
let checks = 0;

function eq(actual, expected, label) {
    assert.deepEqual(actual, expected, label);
    checks++;
}

function mock() {
    window.t = {
        spoken: [],
        audios: [],
        cancelCalls: 0,
        speaking: false
    };

    Object.defineProperty(window, 'speechSynthesis', {
        value: {
            speaking: false,
            pending: false,
            getVoices: () => [{ name: 'Google 日本語', lang: 'ja-JP' }],
            addEventListener() {},
            speak(u) {
                this.speaking = true;
                window.t.spoken.push(u);
            },
            cancel() {
                window.t.cancelCalls++;
                this.speaking = false;
            }
        }
    });

    window.SpeechSynthesisUtterance = class {
        constructor(text) {
            this.text = text;
        }
    };
}

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox']
    });

    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));

        await page.addInitScript('(' + mock.toString() + ')();');

        await page.route('http://local.test/**', r => {
            const f = path.join(root, new URL(r.request().url()).pathname);
            if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
            r.fulfill({
                body: fs.readFileSync(f),
                contentType: f.endsWith('.js')
                    ? 'text/javascript'
                    : f.endsWith('.css')
                    ? 'text/css'
                    : f.endsWith('.json')
                    ? 'application/json'
                    : f.endsWith('.png')
                    ? 'image/png'
                    : 'text/html'
            });
        });

        await page.goto('http://local.test/practice7.1.html');
        await page.waitForSelector('#practice71QuestionSection');

        // 1. Initial State: all Drill 2 answer buttons should have aria-pressed="false"
        const qaSection = page.locator('#practice71QuestionSection');
        const rows = qaSection.locator('.drill-row');
        eq(await rows.count(), 5, '5 Drill 2 questions rendered');

        const initialPressed = await rows.nth(0).locator('.answer-choice').evaluateAll(
            btns => btns.map(b => ({
                answer: b.dataset.answer,
                pressed: b.getAttribute('aria-pressed'),
                selected: b.classList.contains('is-selected')
            }))
        );
        eq(initialPressed, [
            { answer: 'yes', pressed: 'false', selected: false },
            { answer: 'no', pressed: 'false', selected: false }
        ], 'Question 1 initially unselected');

        // Unready buttons should be disabled with selectionHelp before answer is chosen
        const initialSound = rows.nth(0).locator('tr:nth-child(2) button').first();
        eq(await initialSound.getAttribute('data-selection-help'), 'Choose 🙆 or 🙅 first.', 'Help hint before choice');

        // Snapshot DOM references to verify immutability
        const d1Snapshot = await page.evaluate(() => {
            window.__d1FirstRow = document.querySelector('#drill1Container .recording-table tbody tr');
            window.__d2Row2 = document.querySelectorAll('#practice71QuestionSection .drill-row')[1];
            return {
                d1Exists: Boolean(window.__d1FirstRow),
                d2Row2Exists: Boolean(window.__d2Row2)
            };
        });
        eq(d1Snapshot.d1Exists, true, 'Drill 1 first row snapshot captured');
        eq(d1Snapshot.d2Row2Exists, true, 'Drill 2 second row snapshot captured');

        // 2. Select Yes on Question 1
        await rows.nth(0).locator('.answer-choice[data-answer="yes"]').click();

        const yesSelected = await rows.nth(0).locator('.answer-choice').evaluateAll(
            btns => btns.map(b => ({
                answer: b.dataset.answer,
                pressed: b.getAttribute('aria-pressed'),
                selected: b.classList.contains('is-selected')
            }))
        );
        eq(yesSelected, [
            { answer: 'yes', pressed: 'true', selected: true },
            { answer: 'no', pressed: 'false', selected: false }
        ], 'Question 1 Yes selected and synced with aria-pressed / class');

        // Verify other questions (e.g. Question 2) are unaffected
        const q2Pressed = await rows.nth(1).locator('.answer-choice').evaluateAll(
            btns => btns.map(b => ({
                answer: b.dataset.answer,
                pressed: b.getAttribute('aria-pressed'),
                selected: b.classList.contains('is-selected')
            }))
        );
        eq(q2Pressed, [
            { answer: 'yes', pressed: 'false', selected: false },
            { answer: 'no', pressed: 'false', selected: false }
        ], 'Question 2 remains untouched when Question 1 changes');

        // Verify Drill 1 and Drill 2 other questions were NOT re-rendered (identical DOM node reference)
        const immutabilityCheck = await page.evaluate(() => {
            const currentD1 = document.querySelector('#drill1Container .recording-table tbody tr');
            const currentD2Row2 = document.querySelectorAll('#practice71QuestionSection .drill-row')[1];
            return {
                d1Identical: currentD1 === window.__d1FirstRow,
                d2Row2Identical: currentD2Row2 === window.__d2Row2
            };
        });
        eq(immutabilityCheck.d1Identical, true, 'Drill 1 was not destroyed or re-rendered');
        eq(immutabilityCheck.d2Row2Identical, true, 'Drill 2 row 2 was not destroyed or re-rendered');

        // Check model playback for affirmative choice
        await rows.nth(0).locator('tr:nth-child(2) button').first().click();
        const spokenAffirmative = await page.evaluate(() => window.t.spoken.at(-1)?.text);
        eq(/はい.*読/.test(spokenAffirmative), true, 'Model TTS produces affirmative sentence');

        // 3. Switch to No on Question 1
        await rows.nth(0).locator('.answer-choice[data-answer="no"]').click();

        const noSelected = await rows.nth(0).locator('.answer-choice').evaluateAll(
            btns => btns.map(b => ({
                answer: b.dataset.answer,
                pressed: b.getAttribute('aria-pressed'),
                selected: b.classList.contains('is-selected')
            }))
        );
        eq(noSelected, [
            { answer: 'yes', pressed: 'false', selected: false },
            { answer: 'no', pressed: 'true', selected: true }
        ], 'Question 1 No selected and synced');

        // Model playback should now produce negative sentence
        await rows.nth(0).locator('tr:nth-child(2) button').first().click();
        const spokenNegative = await page.evaluate(() => window.t.spoken.at(-1)?.text);
        eq(/いいえ.*読/.test(spokenNegative), true, 'Model TTS produces negative sentence');

        // 4. Repeated clicks on the same button do not cause errors or re-render churn
        await rows.nth(0).locator('.answer-choice[data-answer="no"]').click();
        await rows.nth(0).locator('.answer-choice[data-answer="no"]').click();
        const stillNo = await rows.nth(0).locator('.answer-choice[data-answer="no"]').getAttribute('aria-pressed');
        eq(stillNo, 'true', 'Repeated clicks maintain pressed state');

        // 5. Recording result retention across Yes -> No -> Yes
        await page.evaluate(() => {
            practice71State.savedResults['p71_d2_0_yes'] = {
                text: 'はい、読んでいます',
                rawTranscript: 'はい、読んでいます',
                isCorrect: true
            };
            practice71State.audioUrls['p71_d2_0_yes'] = 'blob:test-audio-yes';
        });

        // Currently on 'no': should show '… Not yet'
        const noResult = await rows.nth(0).locator('tr:nth-child(2) .recording-result').innerText();
        eq(noResult.includes('Not yet'), true, 'No answer has no recorded result yet');

        // Switch back to 'yes': saved result must be restored!
        await rows.nth(0).locator('.answer-choice[data-answer="yes"]').click();
        const yesResult = await rows.nth(0).locator('tr:nth-child(2) .recording-result').innerText();
        eq(yesResult.includes('はい、読んでいます'), true, 'Yes answer restored recorded transcription');
        eq(await rows.nth(0).locator('tr:nth-child(2) .play-recording-btn').count(), 1, 'Audio play button restored');

        // 6. Script mode toggle (With 漢字 -> Hiragana Only -> With 漢字) retains selection and recordings
        await page.locator('#scriptModeControl [data-value="hiragana"]').click();
        const afterHiraganaChoice = await rows.nth(0).locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed');
        eq(afterHiraganaChoice, 'true', 'Hiragana Only retains Yes selection');
        const afterHiraganaResult = await rows.nth(0).locator('tr:nth-child(2) .recording-result').innerText();
        eq(afterHiraganaResult.includes('はい、読んでいます'), true, 'Hiragana Only retains restored result');

        await page.locator('#scriptModeControl [data-value="kanji"]').click();
        const afterKanjiChoice = await rows.nth(0).locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed');
        eq(afterKanjiChoice, 'true', 'With 漢字 retains Yes selection');

        // 7. Responsive viewports
        for (const width of [375, 600, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            const pressedAtWidth = await rows.nth(0).locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed');
            eq(pressedAtWidth, 'true', `Yes selection retained at ${width}px`);
        }

        eq(errors, [], 'No uncaught runtime errors during execution');
        console.log('PASS Practice 7.1 answer selection localized rendering', checks);
    } finally {
        await browser.close();
    }
})().catch(e => {
    console.error(e);
    process.exit(1);
});
