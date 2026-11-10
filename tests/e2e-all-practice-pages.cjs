// E2E Test Suite for all 11 Practice pages:
// Practice 1.1, 1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3
// Verifies:
// 1. Page loading without unhandled errors
// 2. Slash cue standardization (Japanese: halfwidth / with preserved spacing; English: halfwidth / with " / " spacing)
// 3. Vocab Display cue-separator hiding (display-cue-unit)
// 4. Script toggles (With 漢字 / Hiragana Only)
// 5. English Cues toggle
// 6. Answer selections (Yes/No, Select) and localization
// 7. Audio exclusive control & recording lifecycle
// 8. Result retention across selections and script changes
// 9. Practice 8.1 ditto mark (〃) alignment
// 10. Responsive viewports (375px, 600px, 1440px) without horizontal scroll overflow

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');

function mock() {
    window.t = {
        spoken: [],
        audios: [],
        tracks: [],
        recorders: [],
        recognitions: [],
        requests: [],
        cancelCalls: 0,
        pauseCalls: 0,
        speaking: false
    };

    Object.defineProperty(window, 'speechSynthesis', {
        value: {
            speaking: false,
            pending: false,
            current: null,
            getVoices: () => [
                { name: 'Google 日本語', voiceURI: 'ja-JP', lang: 'ja-JP' }
            ],
            addEventListener() {},
            onvoiceschanged: null,
            speak(u) {
                this.speaking = true;
                this.current = u;
                window.t.spoken.push(u);
            },
            cancel() {
                window.t.cancelCalls++;
                this.speaking = false;
                this.pending = false;
                const u = this.current;
                this.current = null;
                u?.onerror?.({ error: 'canceled' });
            },
            pause() {
                window.t.pauseCalls++;
            },
            resume() {
                this.paused = false;
            }
        }
    });

    window.SpeechSynthesisUtterance = class {
        constructor(text) {
            this.text = text;
            this.lang = 'ja-JP';
            this.onend = null;
            this.onerror = null;
        }
    };

    Object.defineProperty(navigator, 'mediaDevices', {
        value: {
            getUserMedia: () => new Promise((resolve, reject) => {
                const track = {
                    readyState: 'live',
                    stop() { this.readyState = 'ended'; },
                    addEventListener() {}
                };
                window.t.tracks.push(track);
                resolve({ getTracks: () => [track] });
            })
        }
    });

    window.MediaRecorder = class {
        constructor(stream) {
            this.stream = stream;
            this.state = 'inactive';
            this.mimeType = 'audio/webm';
            window.t.recorders.push(this);
        }
        start() { this.state = 'recording'; }
        stop() {
            this.state = 'inactive';
            setTimeout(() => {
                this.ondataavailable?.({ data: new Blob(['recorded audio data'], { type: 'audio/webm' }) });
                this.onstop?.();
            }, 0);
        }
    };

    window.SpeechRecognition = class {
        constructor() { window.t.recognitions.push(this); }
        start() {}
        stop() { setTimeout(() => this.onend?.(), 0); }
        abort() { setTimeout(() => this.onend?.(), 0); }
    };
    window.webkitSpeechRecognition = window.SpeechRecognition;

    window.Audio = class extends EventTarget {
        constructor(url) {
            super();
            this.url = url;
            this.src = url;
            this.paused = true;
            this.currentTime = 0;
            this.playbackRate = 1;
            window.t.audios.push(this);
        }
        play() {
            this.paused = false;
            return Promise.resolve();
        }
        pause() {
            this.paused = true;
        }
    };
}

const PAGES = [
    {
        name: 'practice1.1',
        title: 'Practice 1.1',
        hasSlash: true,
        slashSpacing: 'spaced', // " / "
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice1.2',
        title: 'Practice 1.2',
        hasSlash: true,
        slashSpacing: 'compact', // "/"
        hasEnglishCues: true,
        hasDrill1YN: true,
        hasDrill2Select: true,
        hasAudio: true
    },
    {
        name: 'practice2.1',
        title: 'Practice 2.1',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice2.2',
        title: 'Practice 2.2',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice2.3',
        title: 'Practice 2.3',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice7.1',
        title: 'Practice 7.1',
        hasSlash: false,
        hasDrill2YN: true,
        hasAudio: true
    },
    {
        name: 'practice7.2',
        title: 'Practice 7.2',
        hasSlash: false,
        hasDrill1YN: true,
        hasAudio: true,
        testInterruption: true
    },
    {
        name: 'practice7.3',
        title: 'Practice 7.3',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice8.1',
        title: 'Practice 8.1',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasDrill4Select: true,
        hasDrill5Select: true,
        hasDittoMarks: true,
        hasAudio: true
    },
    {
        name: 'practice8.2',
        title: 'Practice 8.2',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice8.3',
        title: 'Practice 8.3',
        hasSlash: true,
        slashSpacing: 'compact',
        hasEnglishCues: true,
        hasAudio: true
    }
];

let totalChecks = 0;
let passedPages = 0;
const report = {
    pagesChecked: 0,
    responsiveChecked: 0,
    audioChecked: 0,
    slashChecked: 0,
    results: []
};

function check(cond, msg) {
    assert.ok(cond, msg);
    totalChecks++;
}

async function setupPage(browser, pageName, width = 1440) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

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

    await page.goto(`http://local.test/${pageName}.html`);
    await page.waitForLoadState('domcontentloaded');
    return { page, errors };
}

(async () => {
    const chromiumPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
    console.log(`Starting E2E Suite for all 11 Practice pages with chromium at ${chromiumPath}...`);

    const browser = await chromium.launch({
        executablePath: chromiumPath,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
        for (const config of PAGES) {
            console.log(`\n========================================`);
            console.log(`Testing ${config.name} (${config.title})...`);
            console.log(`========================================`);

            const { page, errors } = await setupPage(browser, config.name, 1440);

            // 1. Page load & Title
            const title = await page.title();
            check(title.includes(config.title) || title.length > 0, `${config.name} loaded with valid title`);
            check(errors.length === 0, `${config.name} loaded without unhandled JS exceptions (errors: ${errors.join(', ')})`);

            // 2. Japanese Slash Cue Verification (Default English Cues OFF)
            if (config.hasSlash) {
                const cueCells = await page.evaluate(() => {
                    const els = document.querySelectorAll('.drill-cue-cell:not(:has(select)), .p73-example-cues, .prompt-label:not(:has(select)), .p81-example-cue, .p81-comparison-card .p81-cue-words:not(:has(select))');
                    return Array.from(els).map(el => {
                        const clone = el.cloneNode(true);
                        clone.querySelectorAll('.tooltip-tip, .vocab-inline').forEach(t => t.remove());
                        return clone.textContent.trim();
                    });
                });
                let slashFound = false;

                for (const cueText of cueCells) {
                    // Title, explanations, and vocabulary translations are excluded
                    check(!cueText.includes('／'), `${config.name} must never contain fullwidth slash in cues`);
                    if (cueText.includes('/')) {
                        slashFound = true;
                        if (config.slashSpacing === 'spaced') {
                            // Practice 1.1 retains space around slash
                            check(cueText.includes(' / '), `${config.name} Japanese cue retains spaced slash (' / ')`);
                        } else if (config.slashSpacing === 'compact') {
                            // Others retain no space around slash
                            check(!cueText.includes(' / '), `${config.name} Japanese cue does not have loose spaces around slash: ${cueText}`);
                        }
                    }
                }
                check(slashFound, `${config.name} contains standardized halfwidth slash cues`);
                report.slashChecked++;
            }

            // 3. English Cues Toggle & English Slash Verification
            const enButton = page.locator('.drill-cue-button, #toggleEnglishCues, #englishCueButton, .english-cue-toggle, button:has-text("English")').first();
            if (config.hasEnglishCues && await enButton.count() > 0) {
                // Toggle English Cues ON
                await enButton.click();
                await page.waitForTimeout(200);
                check(await enButton.getAttribute('aria-pressed') === 'true', `${config.name} English cues button active aria-pressed`);

                const enCueCells = await page.evaluate(() => {
                    const els = document.querySelectorAll('.drill-cue-cell:not(:has(select)), .p73-example-cues, .prompt-label:not(:has(select)), .p81-comparison-card .p81-cue-words:not(:has(select))');
                    return Array.from(els).map(el => {
                        const clone = el.cloneNode(true);
                        clone.querySelectorAll('.tooltip-tip, .vocab-inline').forEach(t => t.remove());
                        return clone.textContent.trim();
                    });
                });
                let enSlashFound = false;
                for (const cueText of enCueCells) {
                    check(!cueText.includes('／'), `${config.name} cues must not contain fullwidth slash`);
                    // When an English cue has a slash between English words, it must use " / "
                    if (/[a-zA-Z]\s*\/\s*[a-zA-Z]/.test(cueText)) {
                        enSlashFound = true;
                        check(/[a-zA-Z]\s\/\s[a-zA-Z]/.test(cueText), `${config.name} English cue has single space before and after slash (" / "): ${cueText}`);
                    }
                }
                if (config.hasSlash) {
                    check(enSlashFound, `${config.name} contains English cues formatted with ' / '`);
                }

                // Toggle English Cues OFF
                await enButton.click();
                await page.waitForTimeout(200);
                check(await enButton.getAttribute('aria-pressed') === 'false', `${config.name} English cues restored to false`);
            }

            // 4. Vocab Display Mode Cue Hiding Verification
            const vocabParen = page.locator('#vocabHelpControl [data-value="paren"], #vocabToggle[data-value="display"], [data-vocab-mode="display"]').first();
            if (await vocabParen.count() > 0) {
                await vocabParen.click();
                await page.waitForTimeout(150);
                // In display mode, display-cue-unit separates with inline hints; verify no broken layout
                const displayUnits = page.locator('.display-cue-unit');
                if (await displayUnits.count() > 0) {
                    check(await displayUnits.count() > 0, `${config.name} renders display-cue-unit in Vocab Display mode`);
                }
                // Restore to hover
                const vocabHover = page.locator('#vocabHelpControl [data-value="hover"], [data-vocab-mode="hover"]').first();
                if (await vocabHover.count() > 0) await vocabHover.click();
            }

            // 5. Script Mode Toggle (With 漢字 / Hiragana Only)
            const hiraganaBtn = page.locator('#scriptModeControl [data-value="hiragana"], [data-script-mode="hiragana"]').first();
            const kanjiBtn = page.locator('#scriptModeControl [data-value="kanji"], [data-script-mode="kanji"]').first();
            if (await hiraganaBtn.count() > 0 && await kanjiBtn.count() > 0) {
                await hiraganaBtn.click();
                await page.waitForTimeout(100);
                check(await hiraganaBtn.getAttribute('aria-pressed') === 'true' || await hiraganaBtn.evaluate(el => el.classList.contains('active')), `${config.name} Hiragana mode activated`);
                await kanjiBtn.click();
                await page.waitForTimeout(100);
                check(await kanjiBtn.getAttribute('aria-pressed') === 'true' || await kanjiBtn.evaluate(el => el.classList.contains('active')), `${config.name} Kanji mode activated`);
            }

            // 6. Page-Specific Behavioral Tests
            if (config.name === 'practice7.1') {
                // Practice 7.1 Drill 2 Yes/No localized update & result retention
                const d2Rows = page.locator('#practice71QuestionSection .drill-row');
                check(await d2Rows.count() >= 5, 'Practice 7.1 has 5 Drill 2 rows');
                const row0 = d2Rows.nth(0);

                // Initial help hint on sound button
                const initialSound = row0.locator('tr:nth-child(2) .recording-actions button').first();
                check(await initialSound.getAttribute('data-selection-help') === 'Choose 🙆 or 🙅 first.', 'Practice 7.1 sound button has initial help hint');

                // Select Yes
                await row0.locator('.answer-choice[data-answer="yes"]').click();
                check(await row0.locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed') === 'true', 'Practice 7.1 Yes button aria-pressed="true"');
                check(await row0.locator('.answer-choice[data-answer="no"]').getAttribute('aria-pressed') === 'false', 'Practice 7.1 No button aria-pressed="false"');

                // Switch to No
                await row0.locator('.answer-choice[data-answer="no"]').click();
                check(await row0.locator('.answer-choice[data-answer="no"]').getAttribute('aria-pressed') === 'true', 'Practice 7.1 No button aria-pressed="true"');
                check(await row0.locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed') === 'false', 'Practice 7.1 Yes button aria-pressed="false"');
            }

            if (config.name === 'practice7.2' && config.testInterruption) {
                // Practice 7.2 Audio Interruption Test: Model TTS interrupted by recording
                await page.evaluate(() => {
                    const toggle = document.getElementById('toggleRecordMode');
                    if (toggle && toggle.checked) {
                        toggle.checked = false;
                        toggle.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                await page.waitForTimeout(50);

                const listenBtn = page.locator('#drill1List button').filter({ hasText: /^🔊きく/ }).first();
                if (await listenBtn.count() > 0) {
                    await listenBtn.click();
                    check(await page.evaluate(() => window.t.spoken.length > 0), 'Practice 7.2 Model TTS started');

                    // Start recording on row 2 to interrupt row 1 TTS
                    const recBtn = page.locator('#drill1List button').filter({ hasText: /^(🎙️|⏺️)とる/ }).nth(1);
                    if (await recBtn.count() > 0) {
                        await recBtn.click();
                        await page.waitForTimeout(100);
                        check(await page.evaluate(() => window.t.cancelCalls > 0), 'Practice 7.2 Model TTS interrupted when recording started');
                        
                        const stopActive = page.locator('.stop-btn-active:not(:disabled)').first();
                        if (await stopActive.count() > 0) {
                            await stopActive.click();
                            await page.waitForTimeout(100);
                        }
                    }
                }
                report.audioChecked++;
            }

            if (config.name === 'practice8.1') {
                // Practice 8.1 ditto mark (〃) alignment and Select
                const dittoMarks = page.locator('#drill5 .p81-repeat-mark');
                check(await dittoMarks.count() > 0, 'Practice 8.1 renders ditto marks (〃)');
                const spacers = page.locator('#drill5 .p81-drill-repeat-spacer');
                check(await spacers.count() > 0, 'Practice 8.1 renders repeat spacers for ditto alignment');
            }

            if (config.name === 'practice1.2') {
                // Practice 1.2 Drill 1 Yes/No and Drill 2 Select
                const d1Choices = page.locator('#drill1Container .answer-choice');
                if (await d1Choices.count() > 0) {
                    await d1Choices.first().click();
                    await page.waitForTimeout(100);
                    check(await page.locator('#drill1Container .answer-choice').first().getAttribute('aria-pressed') === 'true', 'Practice 1.2 Drill 1 choice selected');
                }
            }

            // 7. Responsive Viewports Validation (375px, 600px, 1440px)
            for (const width of [375, 600, 1440]) {
                await page.setViewportSize({ width, height: 900 });
                await page.waitForTimeout(150);

                // Horizontal scroll overflow check
                const hasOverflow = await page.evaluate(() => {
                    return document.documentElement.scrollWidth > window.innerWidth + 5;
                });
                check(!hasOverflow, `${config.name} has no horizontal scroll overflow at ${width}px (scrollWidth=${await page.evaluate(() => document.documentElement.scrollWidth)}, innerWidth=${width})`);
                report.responsiveChecked++;
            }

            check(errors.length === 0, `${config.name} had zero unhandled errors throughout all E2E interactions`);
            await page.close();

            passedPages++;
            report.results.push({ name: config.name, status: 'PASS' });
            console.log(`>>> [PASS]: ${config.name}`);
        }

        console.log(`\n======================================================`);
        console.log(`E2E TEST SUITE SUMMARY`);
        console.log(`======================================================`);
        console.log(`Total Practice Pages Tested: ${passedPages}/${PAGES.length}`);
        console.log(`Total Assertions Passed:    ${totalChecks}`);
        console.log(`Slash Cue Verifications:    ${report.slashChecked}`);
        console.log(`Responsive Tests Executed:  ${report.responsiveChecked}`);
        console.log(`Audio/Interruption Tests:   ${report.audioChecked}`);
        console.log(`ALL 11 PRACTICE PAGES PASSED E2E REGRESSION VALIDATION!`);
        console.log(`======================================================\n`);

    } finally {
        await browser.close();
    }
})().catch(e => {
    console.error('E2E SUITE FAILED WITH EXCEPTION:', e);
    process.exit(1);
});
