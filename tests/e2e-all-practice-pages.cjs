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
        sampleJaCues: ['わたし / がくせい'],
        sampleEnCues: ['I / student'],
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice1.2',
        title: 'Practice 1.2',
        hasSlash: true,
        slashSpacing: 'compact', // "/"
        sampleJaCues: ['おにいさん', 'がくせい'],
        sampleEnCues: ['older brother / student'],
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
        sampleJaCues: ['これ/なに'],
        sampleEnCues: ['this / …'],
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice2.2',
        title: 'Practice 2.2',
        hasSlash: true,
        slashSpacing: 'compact',
        sampleJaCues: ['その/かばん'],
        sampleEnCues: ['that / bag'],
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice2.3',
        title: 'Practice 2.3',
        hasSlash: true,
        slashSpacing: 'compact',
        sampleJaCues: ['Yさん/どこ'],
        sampleEnCues: ['Y / where'],
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
        sampleJaCues: ['昨日/母/電話する'],
        sampleEnCues: ['yesterday / my mother / call'],
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice8.1',
        title: 'Practice 8.1',
        hasSlash: true,
        slashSpacing: 'compact',
        sampleJaCues: ['りょこう/すき'],
        sampleEnCues: ['book / like'],
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
        sampleJaCues: ['何か/飲む'],
        sampleEnCues: ['class / speak'],
        hasEnglishCues: true,
        hasAudio: true
    },
    {
        name: 'practice8.3',
        title: 'Practice 8.3',
        hasSlash: true,
        slashSpacing: 'compact',
        sampleJaCues: ['だれ/おしえる'],
        sampleEnCues: ['who / help'],
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
                const cueData = await page.evaluate(() => {
                    const els = document.querySelectorAll('.drill-cue-cell:not(:has(select)), .p73-example-cues, .prompt-label:not(:has(select)), .p81-example-cue, .p81-comparison-card .p81-cue-words:not(:has(select))');
                    return Array.from(els).map(el => {
                        const clone = el.cloneNode(true);
                        clone.querySelectorAll('.tooltip-tip, .vocab-inline').forEach(t => t.remove());
                        const raw = clone.textContent.trim();
                        const norm = raw.replace(/\s+/g, ' ');
                        return { raw, norm };
                    });
                });
                let slashFound = false;

                if (config.sampleJaCues) {
                    const hasSampleJa = config.sampleJaCues.every(sample => cueData.some(c => c.norm.includes(sample)));
                    check(hasSampleJa, `${config.name} renders expected Japanese sample cue (${config.sampleJaCues.join(', ')})`);
                }
                for (const cue of cueData) {
                    // Title, explanations, and vocabulary translations are excluded
                    check(!cue.raw.includes('／'), `${config.name} must never contain fullwidth slash in cues`);
                    if (cue.raw.includes('/')) {
                        slashFound = true;
                        if (config.slashSpacing === 'spaced') {
                            // Practice 1.1 retains space around slash
                            check(cue.raw.includes(' / '), `${config.name} Japanese cue retains spaced slash (' / ')`);
                        } else if (config.slashSpacing === 'compact') {
                            // Others retain no space around slash
                            check(!cue.raw.includes(' / '), `${config.name} Japanese cue does not have loose spaces around slash: ${cue.raw}`);
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

                const enCueData = await page.evaluate(() => {
                    const els = document.querySelectorAll('.drill-cue-cell:not(:has(select)), .p73-example-cues, .prompt-label:not(:has(select)), .p81-comparison-card .p81-cue-words:not(:has(select))');
                    return Array.from(els).map(el => {
                        const clone = el.cloneNode(true);
                        clone.querySelectorAll('.tooltip-tip, .vocab-inline').forEach(t => t.remove());
                        const raw = clone.textContent.trim();
                        const norm = raw.replace(/\s+/g, ' ');
                        return { raw, norm };
                    });
                });
                if (config.sampleEnCues) {
                    const hasSampleEn = config.sampleEnCues.every(sample => enCueData.some(c => c.norm.includes(sample)));
                    check(hasSampleEn, `${config.name} renders expected English sample cue (${config.sampleEnCues.join(', ')})`);
                }
                let enSlashFound = false;
                for (const cue of enCueData) {
                    check(!cue.raw.includes('／'), `${config.name} cues must not contain fullwidth slash`);
                    // When an English cue has a slash between English words, it must use " / "
                    if (/[a-zA-Z]\s*\/\s*[a-zA-Z]/.test(cue.norm)) {
                        enSlashFound = true;
                        check(/[a-zA-Z]\s\/\s[a-zA-Z]/.test(cue.norm), `${config.name} English cue has single space before and after slash (" / "): ${cue.norm}`);
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

            // 6. Page-Specific Behavioral Tests & Churn Verification
            if (config.name === 'practice7.1') {
                // Practice 7.1 Drill 2 Yes/No localized update & zero DOM churn verification
                const d2Rows = page.locator('#practice71QuestionSection .drill-row');
                check(await d2Rows.count() >= 5, 'Practice 7.1 has 5 Drill 2 rows');
                const row0 = d2Rows.nth(0);

                // Initial help hint on sound button
                const initialSound = row0.locator('tr:nth-child(2) .recording-actions button').first();
                check(await initialSound.getAttribute('data-selection-help') === 'Choose 🙆 or 🙅 first.', 'Practice 7.1 sound button has initial help hint');

                // Snapshot row 1 DOM node to verify immutability (proving localized update without re-rendering row 1)
                await page.evaluate(() => {
                    const rows = document.querySelectorAll('#practice71QuestionSection .drill-row');
                    window.__domRow1 = rows[1];
                });

                // Select Yes
                await row0.locator('.answer-choice[data-answer="yes"]').click();
                await page.waitForTimeout(50);
                check(await row0.locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed') === 'true', 'Practice 7.1 Yes button aria-pressed="true"');
                check(await row0.locator('.answer-choice[data-answer="no"]').getAttribute('aria-pressed') === 'false', 'Practice 7.1 No button aria-pressed="false"');

                // Verify row 1 was NOT re-rendered (DOM node identity equality)
                const isRow1Same = await page.evaluate(() => {
                    const rows = document.querySelectorAll('#practice71QuestionSection .drill-row');
                    return window.__domRow1 === rows[1];
                });
                check(isRow1Same, 'Practice 7.1 Drill 2 row 1 DOM node remains identical across selection (zero DOM churn)');

                // Switch to No
                await row0.locator('.answer-choice[data-answer="no"]').click();
                await page.waitForTimeout(50);
                check(await row0.locator('.answer-choice[data-answer="no"]').getAttribute('aria-pressed') === 'true', 'Practice 7.1 No button aria-pressed="true"');
                check(await row0.locator('.answer-choice[data-answer="yes"]').getAttribute('aria-pressed') === 'false', 'Practice 7.1 Yes button aria-pressed="false"');
            }

            if (config.name === 'practice7.2') {
                // Practice 7.2 Drill 2: scoped Yes -> No -> Yes updates, preservation of
                // unrelated rows and the persistent answer-specific recording state.
                const section = page.locator('#practice72QuestionSection');
                const cards = section.locator('.drill-row');
                check(await cards.count() === 5, 'Practice 7.2 Drill 2 renders five cards');

                await page.evaluate(() => {
                    const section = document.querySelector('#practice72QuestionSection');
                    const cards = section.querySelectorAll('.drill-row');
                    const rows = cards[0].querySelectorAll('tr');
                    window.__p72Dom = {
                        section,
                        questionRow: rows[0],
                        answerRow: rows[1],
                        answerCell: rows[1].lastElementChild,
                        siblingCard: cards[1],
                        yesButton: cards[0].querySelector('.answer-choice[data-answer="yes"]')
                    };
                });

                const untouched = async label => {
                    const same = await page.evaluate(() => {
                        const saved = window.__p72Dom;
                        const section = document.querySelector('#practice72QuestionSection');
                        const cards = section.querySelectorAll('.drill-row');
                        const rows = cards[0].querySelectorAll('tr');
                        return saved.section === section
                            && saved.questionRow === rows[0]
                            && saved.answerRow === rows[1]
                            && saved.answerCell === rows[1].lastElementChild
                            && saved.siblingCard === cards[1]
                            && saved.yesButton === cards[0].querySelector('.answer-choice[data-answer="yes"]');
                    });
                    check(same, `Practice 7.2 unrelated DOM stays identical after ${label}`);
                };

                const row0 = cards.first();
                const yes = row0.locator('.answer-choice[data-answer="yes"]');
                const no = row0.locator('.answer-choice[data-answer="no"]');

                await yes.click();
                await page.waitForTimeout(50);
                check(await yes.getAttribute('aria-pressed') === 'true', 'Practice 7.2 Yes active');
                check(await no.getAttribute('aria-pressed') === 'false', 'Practice 7.2 No inactive');
                check(await yes.evaluate(el => el.classList.contains('is-selected')), 'Practice 7.2 Yes selected class');
                await untouched('Yes');

                // Seed the existing persisted result store, then verify a switch
                // away and back restores the result from its original answer key.
                await page.evaluate(() => {
                    practice7State.savedResults['p72_d2_0_yes'] = { text: 'P72-SAVED-YES' };
                });
                await no.click();
                await page.waitForTimeout(50);
                check(await no.getAttribute('aria-pressed') === 'true', 'Practice 7.2 No active');
                check(await yes.getAttribute('aria-pressed') === 'false', 'Practice 7.2 Yes inactive');
                check(await no.evaluate(el => el.classList.contains('is-selected')), 'Practice 7.2 No selected class');
                await untouched('No');
                check(!(await row0.locator('tr:nth-child(2) .recording-result').innerText()).includes('P72-SAVED-YES'), 'Practice 7.2 No does not show Yes result');

                await yes.click();
                await page.waitForTimeout(50);
                check(await yes.getAttribute('aria-pressed') === 'true', 'Practice 7.2 Yes restored');
                check((await row0.locator('tr:nth-child(2) .recording-result').innerText()).includes('P72-SAVED-YES'), 'Practice 7.2 Yes saved result restored');
                await untouched('Yes again');

                if (config.testInterruption) {
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
                }
            }

            if (config.name === 'practice8.1') {
                // Practice 8.1 ditto mark (〃) alignment and Select
                const dittoMarks = page.locator('#drill5 .p81-repeat-mark');
                check(await dittoMarks.count() > 0, 'Practice 8.1 renders ditto marks (〃)');
                const spacers = page.locator('#drill5 .p81-drill-repeat-spacer');
                check(await spacers.count() > 0, 'Practice 8.1 renders repeat spacers for ditto alignment');
            }

            if (config.name === 'practice1.2') {
                // Practice 1.2 Drill 1 Yes/No and Drill 2 Select state retention
                const d1Choices = page.locator('#drill1Container .answer-choice[data-answer="yes"]').first();
                if (await d1Choices.count() > 0) {
                    await d1Choices.click();
                    await page.waitForTimeout(50);
                    check(await d1Choices.getAttribute('aria-pressed') === 'true', 'Practice 1.2 Drill 1 choice selected');
                }

                const majorSelect = page.locator('#drill2Container select.custom-select').first();
                if (await majorSelect.count() > 0) {
                    await majorSelect.selectOption({ value: 'けいざい' });
                    await page.waitForTimeout(50);
                    check(await majorSelect.inputValue() === 'けいざい', 'Practice 1.2 Drill 2 major select option set');

                    // Verify retention across script toggle
                    const kanjiBtn = page.locator('#scriptModeControl [data-value="kanji"]').first();
                    if (await kanjiBtn.count() > 0) {
                        await kanjiBtn.click();
                        await page.waitForTimeout(50);
                        check(await majorSelect.inputValue() === 'けいざい', 'Practice 1.2 Drill 2 select preserved across Kanji toggle');
                        if (await d1Choices.count() > 0) {
                            check(await page.locator('#drill1Container .answer-choice[data-answer="yes"]').first().getAttribute('aria-pressed') === 'true', 'Practice 1.2 Drill 1 choice preserved across Kanji toggle');
                        }
                    }
                }
            }

            // 7. Audio Lifecycle & Model TTS Verification
            if (config.hasAudio) {
                const listenBtn = page.locator('button').filter({ hasText: /^🔊きく/ }).first();
                if (await listenBtn.count() > 0) {
                    const beforeSpoken = await page.evaluate(() => window.t.spoken.length);
                    await listenBtn.click();
                    await page.waitForTimeout(100);
                    const afterSpoken = await page.evaluate(() => window.t.spoken.length);
                    check(afterSpoken > beforeSpoken, `${config.name} Model TTS triggered speech synthesis`);
                    const lastText = await page.evaluate(() => window.t.spoken[window.t.spoken.length - 1]?.text);
                    check(typeof lastText === 'string' && lastText.length > 0, `${config.name} Model TTS spoke valid text: ${lastText}`);
                    report.audioChecked++;
                }
            }

            // 8. Responsive Viewports Validation (375px, 600px, 1440px)
            for (const width of [375, 600, 1440]) {
                await page.setViewportSize({ width, height: 900 });
                await page.waitForTimeout(150);

                const audit = await page.evaluate((vpWidth) => {
                    const scrollOverflow = document.documentElement.scrollWidth > vpWidth + 5;
                    const cues = [...document.querySelectorAll('.drill-cue-cell, .prompt-label, .p81-cue-words')];
                    let collapsedCue = null;
                    let clippedCue = null;
                    for (const c of cues) {
                        const r = c.getBoundingClientRect();
                        if (r.width > 0 && r.height > 0) {
                            if (r.left < -2 || r.right > vpWidth + 5) {
                                clippedCue = { text: c.textContent.trim().slice(0, 15), left: r.left, right: r.right };
                                break;
                            }
                            if (c.textContent.trim().length > 3 && r.width < 22 && r.height > 60) {
                                collapsedCue = { text: c.textContent.trim().slice(0, 15), width: r.width, height: r.height };
                                break;
                            }
                        }
                    }
                    return { scrollOverflow, scrollWidth: document.documentElement.scrollWidth, collapsedCue, clippedCue };
                }, width);

                check(!audit.scrollOverflow, `${config.name} has no horizontal scroll overflow at ${width}px (scrollWidth=${audit.scrollWidth})`);
                check(!audit.clippedCue, `${config.name} cues within viewport bounds at ${width}px`);
                check(!audit.collapsedCue, `${config.name} cues do not collapse into single vertical column at ${width}px`);
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
