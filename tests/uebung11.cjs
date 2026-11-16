// Verification script for Deutsche Übung 1.1: nach / in / zum / zur
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'uebung1.1.html');
const jsPath = path.join(root, 'uebung1.1.js');
const cssPath = path.join(root, 'style.css');
const feedbackCssPath = path.join(root, 'feedback-status-icons.css');
const feedbackJsPath = path.join(root, 'feedback-status-icons.js');
const indexPath = path.join(root, 'index.html');

console.log('Testing Deutsche Übung 1.1 static and structural contracts...');

// 1. Check file existence
assert.ok(fs.existsSync(htmlPath), 'uebung1.1.html must exist');
assert.ok(fs.existsSync(jsPath), 'uebung1.1.js must exist');

// 2. Check index.html link
const indexHtml = fs.readFileSync(indexPath, 'utf8');
assert.ok(indexHtml.includes('uebung1.1.html'), 'index.html must link to uebung1.1.html');
assert.ok(indexHtml.includes('Deutsche Übung 1.1'), 'index.html link must mention Deutsche Übung 1.1');

// 3. Check HTML structure
const html = fs.readFileSync(htmlPath, 'utf8');
assert.ok(html.includes('id="germanVarietyControl"'), 'HTML must have germanVarietyControl');
assert.ok(html.includes('data-value="DE"') && html.includes('data-value="AT"') && html.includes('data-value="CH"'), 'Variety control must have DE, AT, CH options');
assert.ok(html.includes('id="toggleRecordMode"'), 'HTML must have Autostop toggle');
assert.ok(html.includes('id="togglePlaybackMode"'), 'HTML must have Autoplay toggle');
assert.ok(html.includes('id="voiceSelect"'), 'HTML must have Voice selector');
assert.ok(html.includes('drill-audio-session.js'), 'HTML must load drill-audio-session.js');
assert.ok(html.includes('uebung1.1.js'), 'HTML must load uebung1.1.js');

// 4. Check CSS additions in style.css
const css = fs.readFileSync(cssPath, 'utf8');
const feedbackCss = fs.readFileSync(feedbackCssPath, 'utf8');
const feedbackJs = fs.readFileSync(feedbackJsPath, 'utf8');
assert.ok(css.includes('.uebung11-page .uebung-copy-area'), 'style.css must have copy-area rules for uebung11');
assert.ok(css.includes('.uebung-supplement-badge'), 'style.css must have supplement badge rules');

// 5. Check JS code contract
const js = fs.readFileSync(jsPath, 'utf8');

// 5.1 Drills data check: 4 drills, each with 1 Ex and 3 Items
const expectedDrillTitles = [
    'Drill 1: nach — Cities & Countries',
    'Drill 2: in — Countries with Articles (Akkusativ)',
    'Drill 3: zum — Masculine & Neuter Destinations',
    'Drill 4: zur — Feminine Destinations'
];
for (const title of expectedDrillTitles) {
    assert.ok(js.includes(title), `JS must define ${title}`);
}

// 5.2 Check Drill 4 Item 3 regional configuration
assert.ok(js.includes('die Schule / gehen'), 'Drill 4 must include die Schule / gehen');
assert.ok(js.includes('Ich gehe zur Schule.'), 'Must include Ich gehe zur Schule.');
assert.ok(js.includes('Ich gehe in die Schule.'), 'Must include Ich gehe in die Schule.');

// 5.3 Check DrillAudio configuration and speech ordering
assert.ok(js.includes('DrillAudio.configure'), 'JS must configure DrillAudio');
assert.ok(js.includes('DrillAudio.getUserMedia'), 'JS must use DrillAudio.getUserMedia');
assert.ok(js.includes('DrillAudio.playRelay'), 'JS must use DrillAudio.playRelay');
assert.ok(js.includes('DrillAudio.speak'), 'JS must speak utterances through DrillAudio.speak');
assert.ok(js.indexOf('u.onend =') < js.indexOf('DrillAudio.speak(u)'), 'u.onend must be assigned before DrillAudio.speak');
assert.ok(js.indexOf('u.onerror =') < js.indexOf('DrillAudio.speak(u)'), 'u.onerror must be assigned before DrillAudio.speak');

// 5.4 Check Copy my sentences
assert.ok(js.includes('Copy my sentences'), 'JS must implement Copy my sentences');
assert.ok(js.includes('Copy your drill results to review or share.'), 'JS must implement helper text');
assert.ok(js.includes('navigator.clipboard.writeText'), 'JS must use clipboard API');

// 5.5 Check Example & Drill UI standardization (Drills 1–4)
assert.ok(js.includes('node("table", "drill-example-table")'), 'All Ex tables must use drill-example-table without recording-table');
assert.ok(!js.includes('example-label-title", "Ex: "'), 'Ex: title must be removed from all examples (Drills 1–4)');
assert.ok(js.includes('tooltip-wrap') && js.includes('target-word'), 'Drills 1–4 cues must use tooltip-wrap with target-word in hover mode');
assert.ok(js.includes('alignDrillCues') && js.includes('alignDrill1Cues'), 'JS must include alignDrillCues and backward-compatible alignDrill1Cues');
assert.ok(css.includes('.uebung11-page :is(#drill1, #drill2, #drill3, #drill4) .example-box .drill-example-table'), 'style.css must have Drills 1–4 Ex grid rules');
assert.ok(css.includes('.uebung11-page :is(#drill1, #drill2, #drill3, #drill4) .drill-row .recording-table'), 'style.css must have Drills 1–4 Dr grid rules');

// 5.6 Check Drill 1–4 Cue non-wrapping and intrinsic measurement contracts
assert.ok(
    css.includes('.uebung11-page :is(#drill1, #drill2, #drill3, #drill4) .drill-row .recording-table .drill-cue-cell') &&
    css.includes('white-space: nowrap !important;'),
    'Drills 1–4 cue cells must enforce white-space: nowrap !important to prevent unwanted wrapping'
);
assert.ok(
    js.includes('copy.querySelectorAll(".tooltip-tip, .custom-tip-box").forEach(t => t.remove());'),
    'alignDrillCues must exclude hidden tooltip text when measuring natural width'
);
assert.ok(
    js.includes('width: "max-content"') && js.includes('whiteSpace: "nowrap"'),
    'alignDrillCues must measure natural unconstrained width using max-content and nowrap'
);

// 6. Check German TTS Diagnostic and Notice Banner contracts
// 6.1 HTML dedicated banner
assert.ok(html.includes('id="germanTtsNotice"'), 'HTML must have dedicated #germanTtsNotice');
assert.ok(html.includes('german-tts-notice-title'), 'HTML must have german-tts-notice-title');
assert.ok(html.includes('german-tts-notice-message'), 'HTML must have german-tts-notice-message');
assert.ok(html.includes('id="germanTtsNoticeClose"'), 'HTML must have #germanTtsNoticeClose');

// 6.2 CSS banner rules
assert.ok(css.includes('.uebung11-page #germanTtsNotice'), 'CSS must define .uebung11-page #germanTtsNotice');
assert.ok(css.includes('.uebung11-page #germanTtsNotice.is-error'), 'CSS must define .is-error state');
assert.ok(css.includes('.uebung11-page .german-tts-notice-close'), 'CSS must define close button');

// 6.3 JS Diagnostic and Notice functions
assert.ok(js.includes('function showGermanTtsNotice'), 'JS must define showGermanTtsNotice');
assert.ok(js.includes('function hideGermanTtsNotice'), 'JS must define hideGermanTtsNotice');
assert.ok(js.includes('function diagnoseTtsStartup'), 'JS must define diagnoseTtsStartup');
assert.ok(js.includes('function cancelActivePlaybackToken'), 'JS must define cancelActivePlaybackToken');

// 6.4 Required Notice Copy
assert.ok(js.includes('German audio is not supported'), 'JS must contain unsupported title');
assert.ok(js.includes('Your browser does not support speech synthesis. Please try a compatible browser.'), 'JS must contain unsupported message');
assert.ok(js.includes('German voice not detected'), 'JS must contain voice not detected title');
assert.ok(js.includes('Your browser could not find a German voice. Model audio may not work on this device. Please check your browser or system speech settings.'), 'JS must contain voice not detected message');
assert.ok(js.includes('German audio could not be played'), 'JS must contain playback error title');
assert.ok(js.includes('German audio did not start'), 'JS must contain start timeout title');
assert.ok(js.includes('The speech service did not respond in time. Please try again or reload the page.'), 'JS must contain start timeout message');
assert.ok(js.includes("Can't hear the audio?"), 'JS must contain inaudible audio title');
assert.ok(js.includes('Check your device volume, mute settings, and audio output. You can also try another German voice.'), 'JS must contain inaudible audio message');

// 6.5 Preservation of voiceRegionNotice and independent notice banner
assert.ok(html.includes('id="voiceRegionNotice"'), 'HTML must keep #voiceRegionNotice');
assert.ok(js.includes('No native') && js.includes('with') && js.includes('tag'), 'JS must preserve existing de-AT region notice format');

// 6.6 Playback diagnostics and watchdog listeners
assert.ok(js.includes('u.addEventListener("start"'), 'JS must listen to utterance start');
assert.ok(js.includes('u.addEventListener("error"'), 'JS must listen to utterance error');
assert.ok(js.includes('u.addEventListener("end"'), 'JS must listen to utterance end');
assert.ok(js.includes('startTimeoutTimer'), 'JS must have start timeout timer');

// 7. 3-Stage Evaluation & Feedback UI Contracts
// 7.1 Structural and feedback text contracts
assert.ok(!js.includes('result-incorrect", " ❌"'), 'Must not render ❌ mark in result');
assert.ok(!js.includes('Try once more!'), 'Must not contain Try once more!');
assert.ok(!js.includes('correction-listen-btn'), 'Must not create duplicate listen button in correction-box');
assert.ok(!js.includes('→ ${val.modelText}'), 'Must not auto-disclose model sentence in correction-box');
assert.ok(js.includes('FeedbackStatus.setMismatch'), 'Must use the approved Fluent mismatch renderer');
assert.ok(js.includes('FeedbackStatus.appendUndetermined'), 'Must use the approved undetermined renderer');
assert.ok(js.includes('FeedbackStatus.appendAccepted'), 'Must use the approved Fluent accepted renderer');
assert.ok(js.includes('module.exports ='), 'Must export modules for testing');

// 7.2 Functional unit tests on 3-stage evaluation engine
const {
    drillsData,
    evaluateGermanAnswer,
    normalizeGerman,
    getItemGrammarSpec
} = require(jsPath);

assert.ok(Array.isArray(drillsData) && drillsData.length === 4, 'drillsData must contain 4 drills');

// Locate test items
const itemGraz = drillsData[0].items[0]; // d1_1: Graz / fahren -> "Ich fahre nach Graz."
const itemItalien = drillsData[0].items[1]; // d1_2: Italien / reisen -> "Ich reise nach Italien."
const itemTuerkei = drillsData[1].items[0]; // d2_1: die Türkei / fliegen -> "Ich fliege in die Türkei."
const itemIrak = drillsData[1].items[2]; // d2_3: der Irak / fliegen -> "Ich fliege in den Irak."
const itemArzt = drillsData[2].items[0]; // d3_1: der Arzt / gehen -> "Ich gehe zum Arzt."
const itemPost = drillsData[3].example; // Ex 4: die Post / gehen -> "Ich gehe zur Post."
const itemSchule = drillsData[3].items[2]; // d4_3: die Schule / gehen -> regional models

console.log('Running 3-stage evaluation engine unit tests...');

// Case 1: Exact model match
const resCase1 = evaluateGermanAnswer("Ich fahre nach Graz.", itemGraz, "DE");
assert.equal(resCase1.judgment, "accepted", "Exact match must be accepted");
assert.equal(resCase1.redPart, null, "Exact match has no redPart");

// Case 2: Registered regional alternative from allowedAnswers
const resCase2 = evaluateGermanAnswer("Ich gehe in die Schule.", itemSchule, "DE");
assert.equal(resCase2.judgment, "accepted", "Allowed regional alternative must be accepted");
assert.ok(resCase2.supplement && resCase2.supplement.includes("zur Schule"), "Should include regional model supplement");

// Case 3: Alternate grammatical subjects
const resCase3a = evaluateGermanAnswer("Wir fahren nach Graz.", itemGraz, "DE");
assert.equal(resCase3a.judgment, "accepted", "Alternate subject 'Wir' must be accepted");
const resCase3b = evaluateGermanAnswer("Sie fliegt in die Türkei.", itemTuerkei, "DE");
assert.equal(resCase3b.judgment, "accepted", "Alternate subject 'Sie' (3sg) must be accepted");
const resCase3c = evaluateGermanAnswer("Er geht zum Arzt.", itemArzt, "DE");
assert.equal(resCase3c.judgment, "accepted", "Alternate subject 'Er' must be accepted");

// Case 4: Inverted word order (OVS)
const resCase4a = evaluateGermanAnswer("Nach Graz fahre ich.", itemGraz, "DE");
assert.equal(resCase4a.judgment, "accepted", "Inverted word order 'Nach Graz fahre ich.' must be accepted");
const resCase4b = evaluateGermanAnswer("In die Türkei fliegen wir.", itemTuerkei, "DE");
assert.equal(resCase4b.judgment, "accepted", "Inverted word order 'In die Türkei fliegen wir.' must be accepted");
const resCase4c = evaluateGermanAnswer("Zum Arzt geht er.", itemArzt, "DE");
assert.equal(resCase4c.judgment, "accepted", "Inverted word order 'Zum Arzt geht er.' must be accepted");

// Case 5: Alternate tenses (Perfekt / Präteritum)
const resCase5a = evaluateGermanAnswer("Ich bin nach Graz gefahren.", itemGraz, "DE");
assert.equal(resCase5a.judgment, "accepted", "Perfekt 'Ich bin nach Graz gefahren.' must be accepted");
const resCase5b = evaluateGermanAnswer("Wir sind nach Graz gefahren.", itemGraz, "DE");
assert.equal(resCase5b.judgment, "accepted", "Perfekt 'Wir sind nach Graz gefahren.' must be accepted");
const resCase5c = evaluateGermanAnswer("Ich fuhr nach Graz.", itemGraz, "DE");
assert.equal(resCase5c.judgment, "accepted", "Präteritum 'Ich fuhr nach Graz.' must be accepted");
const resCase5d = evaluateGermanAnswer("Ich bin zum Arzt gegangen.", itemArzt, "DE");
assert.equal(resCase5d.judgment, "accepted", "Perfekt 'Ich bin zum Arzt gegangen.' must be accepted");

// Case 6: Subject-verb agreement mismatch
const resCase6 = evaluateGermanAnswer("Er fahren nach Graz.", itemGraz, "DE");
assert.equal(resCase6.judgment, "mismatch", "Agreement mismatch must be mismatch");
assert.equal(resCase6.redPart, "fahren", "Mismatched verb form must be flagged as redPart");

// Case 7: Wrong preposition for destination
const resCase7 = evaluateGermanAnswer("Ich fahre zu Graz.", itemGraz, "DE");
assert.equal(resCase7.judgment, "mismatch", "Wrong preposition must be mismatch");
assert.equal(resCase7.redPart, "zu", "Wrong preposition must be flagged as redPart");

// Case 8: Wrong place / cue mismatch
const resCase8 = evaluateGermanAnswer("Ich fahre nach Berlin.", itemGraz, "DE");
assert.equal(resCase8.judgment, "mismatch", "Wrong destination place must be mismatch");
assert.equal(resCase8.redPart, "berlin", "Wrong place must be flagged as redPart");

// Case 9: Wrong verb root
const resCase9 = evaluateGermanAnswer("Ich gehe nach Graz.", itemGraz, "DE");
assert.equal(resCase9.judgment, "mismatch", "Wrong motion verb root must be mismatch");
assert.equal(resCase9.redPart, "gehe", "Wrong verb root must be flagged as redPart");

// Case 10: Unknown / complex sentence structure -> undetermined
const resCase10 = evaluateGermanAnswer("Ich möchte nach Graz fahren.", itemGraz, "DE");
assert.equal(resCase10.judgment, "undetermined", "Complex/modal structure must be undetermined");
assert.equal(resCase10.redPart, null, "Undetermined must have null redPart");

// Case 11: Incomplete speech / short fragments (< 3 words) -> undetermined
const resCase11a = evaluateGermanAnswer("fahre nach", itemGraz, "DE");
assert.equal(resCase11a.judgment, "undetermined", "Short fragment must be undetermined");
const resCase11b = evaluateGermanAnswer("Graz", itemGraz, "DE");
assert.equal(resCase11b.judgment, "undetermined", "Single word fragment must be undetermined");
const resCase11c = evaluateGermanAnswer("nach", itemGraz, "DE");
assert.equal(resCase11c.judgment, "undetermined", "Single preposition must be undetermined");

// 7.3 Responsive style contract verification
assert.ok(css.includes('.uebung11-page'), 'CSS must include .uebung11-page scope');
assert.ok(css.includes('.correction-box'), 'CSS must style .correction-box');
assert.ok(feedbackCss.includes('.feedback-status'), 'Feedback CSS must style shared status renderers');
assert.ok(feedbackCss.includes('.feedback-retry-label'), 'Feedback CSS must style the Fluent retry renderer');
assert.ok(feedbackCss.includes('.feedback-status-undetermined'), 'Feedback CSS must style supported undetermined status');

// 8. Introductory Hover & Status Tooltip Contracts
console.log('Testing Deutsche Übung 1.1 hover and tooltip contracts...');

// 8.1 Autostop & Autoplay multi-line setting tooltips in HTML
assert.ok(html.includes('Recording stops automatically.'), 'Autostop must have Recording stops automatically.');
assert.ok(html.includes('Stop recording manually.'), 'Autostop must have Stop recording manually.');
assert.ok(html.includes('tip-line"><strong>ON:</strong> Recording stops automatically.</span>'), 'Autostop ON must be wrapped in separate line');
assert.ok(html.includes('tip-line"><strong>OFF:</strong> Stop recording manually.</span>'), 'Autostop OFF must be wrapped in separate line');

assert.ok(html.includes('After recording, the model audio and your recording play automatically.'), 'Autoplay must have model + recording play automatically copy');
assert.ok(html.includes('Choose what and when to play.'), 'Autoplay must have Choose what and when to play copy');
assert.ok(html.includes('tip-line"><strong>ON:</strong> After recording, the model audio and your recording play automatically.</span>'), 'Autoplay ON must be wrapped in separate line');
assert.ok(html.includes('tip-line"><strong>OFF:</strong> Choose what and when to play.</span>'), 'Autoplay OFF must be wrapped in separate line');

// 8.2 Basic operation button hovers restricted to Example 1 and Drill 1 Item 1 only
assert.ok(js.includes('Listen to the example.'), 'Must include Listen to the example. for Example 1');
assert.ok(js.includes('drill.number === 1 ? "Listen to the example." : ""'), 'Example tooltip must be restricted to Example 1 only');

assert.ok(js.includes('Listen to the model answer.'), 'Must include Listen to the model answer. for Drill 1 Item 1');
assert.ok(js.includes('Record your answer.'), 'Must include Record your answer. for Drill 1 Item 1');
assert.ok(js.includes('No need to press. Autostop is ON.'), 'Must include No need to press. Autostop is ON.');
assert.ok(js.includes('Stop recording.'), 'Must include Stop recording.');
assert.ok(js.includes('isFirstItemOfDrill1'), 'Must conditionally check first item of Drill 1');
assert.ok(js.includes('updateFirstStopTip'), 'Must dynamically update stop tooltip on Autostop toggle');

// 8.3 Undetermined (👣) tooltip
assert.ok(feedbackJs.includes('Could not be evaluated reliably.'), 'Shared renderer must provide the undetermined tooltip');
assert.ok(feedbackJs.includes("badge.className = 'feedback-status feedback-status-'"), 'Shared renderer must create the undetermined status class');

// 8.4 CSS styling for multi-line and status tooltips
assert.ok(css.includes('.uebung11-page .settings-onoff .custom-tip-box'), 'CSS must format settings tooltips');
assert.ok(css.includes('.uebung11-page .settings-onoff .custom-tip-box .tip-line'), 'CSS must format tip-line blocks');
assert.ok(feedbackCss.includes('.feedback-status-undetermined:hover'), 'Feedback CSS must support the undetermined tooltip interaction');

// 8.5 tooltip-layout.js preserves .uebung11-page introductory tooltips
const tooltipLayoutJs = fs.readFileSync(path.join(root, 'tooltip-layout.js'), 'utf8');
assert.ok(tooltipLayoutJs.includes('.uebung11-page'), 'tooltip-layout.js must preserve .uebung11-page tooltips');

// 8.6 Germanized basic operation button labels
assert.ok(html.includes('↩️ Zurück'), 'HTML must have ↩️ Zurück back link');
assert.ok(!html.includes('もどる'), 'HTML must not have もどる');
assert.ok(js.includes('🔊 Anhören'), 'JS must use 🔊 Anhören for listen buttons');
assert.ok(js.includes('⏺️ Aufnehmen'), 'JS must use ⏺️ Aufnehmen for record button');
assert.ok(!js.includes('🔊きく'), 'JS must not contain 🔊きく');
assert.ok(!js.includes('とる'), 'JS must not contain とる');

console.log('PASS: All structural, contract, 3-stage evaluation, and hover tooltip tests passed successfully.');

// ============================================================================
// 9. Browser E2E: Recording Lifecycle, Limits, Audio Monitoring & Error Handling
// ============================================================================
const { chromium } = require('playwright');

const chromiumPath = process.env.CHROMIUM_PATH ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' :
     path.join(root, '.tools/ms-playwright/chromium-1140/chrome-linux/chrome'));

async function runRecordingLifecycleTests() {
    console.log('Testing Deutsche Übung 1.1 recording lifecycle and limits in browser...');
    const browser = await chromium.launch({
        executablePath: chromiumPath,
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.addInitScript(() => {
            window.t = {
                tracks: [],
                recorders: [],
                recognitions: [],
                contexts: [],
                speaking: false,
                deny: false,
                recordError: false
            };

            Object.defineProperty(navigator, 'mediaDevices', {
                value: {
                    getUserMedia: () => new Promise((resolve, reject) => {
                        if (window.t.deny) return reject(new DOMException('Denied', 'NotAllowedError'));
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
                start() {
                    this.state = 'recording';
                    window.recordingStartTime = Date.now();
                }
                stop() {
                    this.state = 'inactive';
                    setTimeout(() => {
                        this.ondataavailable?.({ data: new Blob(['recorded-audio'], { type: 'audio/webm' }) });
                        this.onstop?.();
                    }, 0);
                }
            };

            window.SpeechRecognition = class {
                constructor() {
                    window.t.recognitions.push(this);
                }
                start() {
                    this.active = true;
                    // Real Chrome dispatches onspeechstart shortly after start even in silence
                    setTimeout(() => {
                        if (this.active) this.onspeechstart?.();
                    }, 50);
                }
                stop() {
                    this.active = false;
                    setTimeout(() => this.onend?.(), 0);
                }
                abort() {
                    this.active = false;
                    setTimeout(() => this.onend?.(), 0);
                }
            };
            window.webkitSpeechRecognition = window.SpeechRecognition;

            window.AudioContext = class {
                constructor() {
                    this.state = 'running';
                    window.t.contexts.push(this);
                }
                resume() { return Promise.resolve(); }
                close() { this.state = 'closed'; return Promise.resolve(); }
                createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
                createAnalyser() {
                    return {
                        fftSize: 2048,
                        getFloatTimeDomainData(arr) {
                            arr.fill(window.t.speaking ? 0.08 : 0);
                        },
                        disconnect() {}
                    };
                }
            };
            window.webkitAudioContext = window.AudioContext;
        });

        await page.route('**/*', route => {
            const u = new URL(route.request().url());
            if (u.hostname !== 'uebung11.test') return route.abort();
            const f = path.join(root, u.pathname);
            return route.fulfill({
                status: fs.existsSync(f) ? 200 : 404,
                body: fs.existsSync(f) ? fs.readFileSync(f) : '',
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });

        await page.goto('http://uebung11.test/uebung1.1.html');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.clock.install();

        const isRecording = () => page.evaluate(() => {
            const rec = window.t.recorders.at(-1);
            return Boolean(rec && rec.state === 'recording');
        });

        const clickRecord = async (isManual = false) => {
            await page.evaluate(manual => {
                const toggle = document.querySelector('#toggleRecordMode');
                if (toggle) {
                    if (manual && toggle.checked) toggle.click();
                    if (!manual && !toggle.checked) toggle.click();
                }
                const playToggle = document.querySelector('#togglePlaybackMode');
                if (playToggle && playToggle.checked) playToggle.click();

                const recBtns = [...document.querySelectorAll('#drillsContainer .recording-actions button')];
                const recBtn = recBtns.find(b => b.textContent.includes('Aufnehmen'));
                if (recBtn) recBtn.click();
            }, isManual);
            for (let i = 0; i < 10; i++) {
                await page.clock.runFor(50);
                if (await page.evaluate(() => window.t.recorders.at(-1)?.state === 'recording')) break;
            }
        };

        const advanceToElapsed = async (targetElapsed) => {
            const currentElapsed = await page.evaluate(() => Date.now() - (window.recordingStartTime || Date.now()));
            const toAdvance = targetElapsed - currentElapsed;
            if (toAdvance > 0) {
                await page.clock.runFor(toAdvance);
            }
        };

        const getStopBtn = () => page.locator('#drillsContainer .recording-actions button[data-stop]').first();
        const getResult = () => page.locator('#drillsContainer .recording-result').first();

        const setSpeaking = val => page.evaluate(v => { window.t.speaking = v; }, val);
        const triggerRecognition = (text) => page.evaluate(t => {
            const rec = window.t.recognitions.at(-1);
            if (rec?.onresult) {
                rec.onresult({
                    resultIndex: 0,
                    results: [[{ transcript: t, isFinal: true }]]
                });
            }
        }, text);

        // --- Scenario 1 & 2: 5秒タイムアウト（4.8秒では継続、5.0秒で停止、発話なしのため音声未保存） ---
        await clickRecord(false);
        assert.ok(await isRecording(), 'Recording started');

        // 4.8秒経過
        await advanceToElapsed(4800);
        assert.ok(await isRecording(), 'Still recording at 4.8s without speech');

        // 5.1秒経過 (合計5.0s以上)
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'Stopped at 5.0s timeout');
        const resText1 = await getResult().textContent();
        assert.ok(resText1.includes('No speech detected within 5 seconds.'), 'Shows 5s timeout message');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'No play button saved when no speech');

        // --- Scenario 3: Autostop ON での発話後連続2秒無音停止 ---
        await clickRecord(false);
        assert.ok(await isRecording(), 'Recording started for Scenario 3');

        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400); // 400ms 音声入力（soundFrames >= 3）
        await setSpeaking(false); // 発話終了、無音開始

        // 1.5秒無音
        await page.clock.runFor(1500);
        assert.ok(await isRecording(), 'Still recording at 1.5s silence');

        // 2.2秒無音 (合計無音時間 >= 2000ms)
        await page.clock.runFor(700);
        assert.ok(!(await isRecording()), 'Auto-stopped after 2.0s silence');

        // --- Scenario 4: 2秒前の音声再開による無音時間リセット ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);

        // 1.5秒無音
        await page.clock.runFor(1500);
        assert.ok(await isRecording(), 'Still recording at 1.5s silence');

        // 再度音声入力（リセット）
        await setSpeaking(true);
        await page.clock.runFor(300);
        await setSpeaking(false);

        // リセット後 1.5秒無音
        await page.clock.runFor(1500);
        assert.ok(await isRecording(), 'Still recording 1.5s after speech resumed');

        // さらに 0.7秒無音（再開後 2.2秒無音）
        await page.clock.runFor(700);
        assert.ok(!(await isRecording()), 'Auto-stopped 2.0s after speech resumed');

        // --- Scenario 5: Autostop OFF (Manual) では発話後2秒無音で停止しない ---
        await clickRecord(true); // Manual
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);

        // 発話後 4秒無音
        await page.clock.runFor(4000);
        assert.ok(await isRecording(), 'Manual mode does NOT auto-stop on silence after speech');

        // 手動停止ボタンで停止
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions button[data-stop]:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'Stopped via stop button in manual mode');

        // --- Scenario 6: 20秒絶対上限（Autostop ON/OFF共通） ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await advanceToElapsed(19700);
        assert.ok(await isRecording(), 'Still recording at 19.7s');

        await advanceToElapsed(20200);
        await page.clock.runFor(100);
        await setSpeaking(false);
        assert.ok(!(await isRecording()), 'Auto-stopped at 20s limit');
        const resText6 = await getResult().textContent();
        assert.ok(resText6.includes('Auto-stopped after 20 seconds.'), 'Shows 20s limit message');

        // --- Scenario 7 & 8: 音声検出あり・STT空 -> No transcription available. かつ 音声保存・再生可能 ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(2200);
        assert.ok(!(await isRecording()), 'Stopped after 2s silence');

        const resText7 = await getResult().textContent();
        assert.ok(resText7.includes('No transcription available.'), 'Shows No transcription available.');
        assert.ok(!resText7.includes('… Not yet'), 'Does not show Not yet');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 1, 'Play button exists when audio recorded with empty STT');

        // --- Scenario 9: 録音エラーと文字起こしエラーの区別 ---
        await clickRecord(false);
        await page.evaluate(() => {
            const rec = window.t.recognitions.at(-1);
            rec?.onerror?.({ error: 'network' });
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'Stopped on recognition error');
        const resText9a = await getResult().textContent();
        assert.ok(resText9a.includes('Recognition error.'), 'Shows Recognition error.');

        // --- Scenario 10: リソース管理（マイクトラック・AudioContext解放） ---
        const tracksAllEnded = await page.evaluate(() => window.t.tracks.every(tr => tr.readyState === 'ended'));
        assert.ok(tracksAllEnded, 'All microphone tracks ended');
        const contextsClosed = await page.evaluate(() => window.t.contexts.every(c => c.state === 'closed'));
        assert.ok(contextsClosed, 'All AudioContext instances closed');

        // --- Scenario 11: 重複停止が発生しないこと ---
        await clickRecord(true);
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions button[data-stop]:not(:disabled)');
            if (stopBtn) {
                stopBtn.click();
                stopBtn.click();
            }
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'Recording stopped cleanly without duplication errors');

        // --- Scenario 12: 既存のドイツ語文字起こし・判定・保存機能の維持 ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Ich fahre nach Graz.');
        await setSpeaking(false);
        await page.clock.runFor(2200);

        const resText12 = await getResult().textContent();
        assert.ok(resText12.includes('Ich fahre nach Graz.'), 'Contains recognized sentence');
        assert.equal(await getResult().locator('.feedback-status-accepted').count(), 1, 'Contains accepted status badge');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 1, 'Play button exists for accepted answer');

        assert.equal(errors.length, 0, 'No uncaught page errors during tests');
        console.log('PASS: All 12 recording lifecycle scenarios passed successfully.');
    } finally {
        await browser.close();
    }
}

runRecordingLifecycleTests().catch(err => {
    console.error('Recording lifecycle test failed:', err);
    process.exit(1);
});
