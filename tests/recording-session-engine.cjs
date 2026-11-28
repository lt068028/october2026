// tests/recording-session-engine.cjs
// Stage 3: Unified Recording Session Engine (drill-audio-session.js) Contract Tests
// Covers Plan v2 §5.1 Scenarios 1-6:
// 1. Manual mode: no 5s pre-speech stop, no 2.0s silence stop, 20s absolute cap (with/without speech)
// 2. Autostop ON: 5s pre-speech timeout, valid STT 5s protection, filler/late non-protection, 2.0s silence stop
// 3. Null unification when Blob/URL is absent and Auto-Compare (playRelay) coordination
// 4. Independent Recorder/Recognition completion sync and delayed final STT rescue while stopping
// 5. 2500ms fallback timeout protection, resource cleanup, and late event blocking
// 6. Duplicate stop prevention, onend restart & stop race, start failures, audioOnly, and leave()/abort()

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = process.env.DRILL_ROOT || path.resolve(__dirname, '..');
const chromiumPath = process.env.CHROMIUM_PATH ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' :
     path.join(root, '.tools/ms-playwright/chromium-1140/chrome-linux/chrome'));

let totalChecks = 0;
function check(condition, message) {
    assert(condition, message);
    totalChecks++;
}

function injectMock() {
    window.t = {
        spoken: [],
        audios: [],
        tracks: [],
        recorders: [],
        recognitions: [],
        contexts: [],
        speaking: false,
        deny: false,
        emptyChunks: false,
        failCreateObjectURL: false,
        failRecorderStart: false,
        failAudioResume: false,
        failRecognitionRestart: false,
        hangRecorderStop: false,
        hangRecognitionStop: false,
        recorderStopDelayMs: 0,
        recognitionStopDelayMs: 0
    };

    const origCreateObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = blob => {
        if (window.t.failCreateObjectURL) {
            throw new Error('createObjectURL failed');
        }
        return origCreateObjectURL(blob);
    };

    Object.defineProperty(window, 'speechSynthesis', {
        value: {
            getVoices: () => [{ name: 'Google Japanese', voiceURI: 'ja', lang: 'ja-JP' }],
            addEventListener() {},
            onvoiceschanged: null,
            paused: false,
            speaking: false,
            pending: false,
            speak(u) { window.t.spoken.push(u); this.current = u; },
            pause() {},
            resume() {},
            cancel() { this.current = null; }
        }
    });

    window.SpeechSynthesisUtterance = class {
        constructor(text) { this.text = text; }
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
            if (window.t.failRecorderStart) {
                throw new Error('Recorder start failed');
            }
            this.state = 'recording';
        }
        stop() {
            if (window.t.hangRecorderStop) {
                return;
            }
            this.state = 'inactive';
            const delay = window.t.recorderStopDelayMs || 0;
            setTimeout(() => {
                if (!window.t.emptyChunks) {
                    this.ondataavailable?.({ data: new Blob(['recorded-audio'], { type: 'audio/webm' }) });
                } else {
                    this.ondataavailable?.({ data: new Blob([], { type: 'audio/webm' }) });
                }
                this.onstop?.();
            }, delay);
        }
    };

    window.SpeechRecognition = class {
        constructor() {
            this.startCount = 0;
            this.abortCount = 0;
            window.t.recognitions.push(this);
        }
        start() {
            if (this.startCount > 0 && window.t.failRecognitionRestart) {
                throw new Error('Recognition restart failed');
            }
            this.startCount++;
            this.active = true;
        }
        stop() {
            if (window.t.hangRecognitionStop) {
                return;
            }
            this.active = false;
            const delay = window.t.recognitionStopDelayMs || 0;
            setTimeout(() => this.onend?.(), delay);
        }
        abort() {
            this.abortCount++;
            this.active = false;
            if (!window.t.hangRecognitionStop) {
                setTimeout(() => this.onend?.(), 0);
            }
        }
    };
    window.webkitSpeechRecognition = window.SpeechRecognition;

    window.Audio = class {
        constructor(url) {
            this.url = url;
            this.paused = true;
            this.duration = 1.0;
            this.playbackRate = 1.0;
            window.t.audios.push(this);
        }
        addEventListener() {}
        removeEventListener() {}
        play() {
            this.paused = false;
            setTimeout(() => this.onended?.(), 10);
            return Promise.resolve();
        }
        pause() { this.paused = true; }
    };

    window.AudioContext = class {
        constructor() {
            this.state = 'running';
            this.sampleRate = 48000;
            window.t.contexts.push(this);
        }
        resume() {
            if (window.t.failAudioResume) {
                return Promise.reject(new Error('Resume blocked'));
            }
            return Promise.resolve();
        }
        close() {
            this.state = 'closed';
            return Promise.resolve();
        }
        createMediaStreamSource() {
            return { connect() {}, disconnect() {} };
        }
        createAnalyser() {
            return {
                fftSize: 1024,
                getFloatTimeDomainData(arr) {
                    arr.fill(window.t.speaking ? 0.08 : 0);
                },
                disconnect() {}
            };
        }
    };
    window.webkitAudioContext = window.AudioContext;
}

const TEST_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Stage 3 Engine Test</title></head>
<body>
  <header class="main-header"><a href="index.html" class="back-link">Back</a></header>
  <div class="compact-settings">
    <input type="checkbox" id="toggleRecordMode" checked>
    <input type="checkbox" id="togglePlaybackMode">
  </div>
  <div id="row1" class="drill-row">
    <button type="button" data-audio-role="listen" id="listenBtn">🔊きく</button>
    <button type="button" id="recBtn">🎙️とる</button>
    <button type="button" id="stopBtn" class="stop-record-btn" disabled>⏹️</button>
    <div id="resultArea"><button type="button" class="play-recording-btn" id="playOwnBtn">▶️再生</button></div>
  </div>
  <script src="/drill-audio-session.js"></script>
  <script>
    window.fillerExcludedValidStt = text => {
      const cleaned = String(text || '')
        .replace(/^(?:えーと|あのー|うーん)+/g, '')
        .replace(/[\\s、。！？.,!?]/g, '');
      return Boolean(cleaned);
    };
    DrillAudio.configure({
      busy: () => Boolean(DrillAudio.getActiveRecordingSession()),
      stop: () => {},
      cancel: () => {},
      sync: () => {}
    });
  </script>
</body>
</html>`;

async function createTestPage(browser) {
    const page = await browser.newPage();
    page.errors = [];
    page.on('pageerror', err => page.errors.push(err.message));

    await page.addInitScript('(' + injectMock.toString() + ')();');

    await page.route('**', route => {
        const u = new URL(route.request().url());
        if (u.pathname === '/test.html') {
            return route.fulfill({ status: 200, contentType: 'text/html', body: TEST_HTML });
        }
        if (u.pathname === '/drill-audio-session.js') {
            const code = fs.readFileSync(path.join(root, 'drill-audio-session.js'), 'utf8');
            return route.fulfill({ status: 200, contentType: 'text/javascript', body: code });
        }
        return route.fulfill({ status: 200, contentType: 'text/html', body: '' });
    });

    await page.goto('http://drill.test/test.html');
    await page.clock.install();
    return page;
}

(async () => {
    console.log(`Launching Chromium at: ${chromiumPath}`);
    const browser = await chromium.launch({
        executablePath: chromiumPath,
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        // =====================================================================
        // Scenario 1: Manual mode (no 5s stop, no 2s silence stop, 20s limit)
        // =====================================================================
        console.log('=== Scenario 1: Manual Mode (Autostop OFF) ===');
        {
            const page = await createTestPage(browser);

            // 1a. Manual mode without speech or STT -> runs past 5s, stops at 20s
            await page.evaluate(() => {
                window.lastResult = null;
                window.session = DrillAudio.startRecordingSession({
                    key: 'm1',
                    manual: true,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(50);
            check(await page.evaluate(() => window.session.recording), '1a: Manual session is recording');

            await page.clock.runFor(5100);
            check(await page.evaluate(() => window.session.recording && !window.session.finished), '1a: Manual mode continues past 5.1s without speech');

            await page.clock.runFor(14500); // ~19.65s elapsed
            check(await page.evaluate(() => window.session.recording), '1a: Manual mode still recording at 19.65s');

            await page.clock.runFor(500); // >20.0s elapsed
            await page.clock.runFor(50);
            const res1a = await page.evaluate(() => window.lastResult);
            check(Boolean(res1a), '1a: Manual session completed at 20s');
            check(res1a.stopReason === 'limit-20s', '1a: stopReason is limit-20s');
            check(res1a.notice === 'Auto-stopped after 20 seconds.', '1a: 20s notice message');
            check(res1a.discard === true, '1a: Unspoken 20s manual recording is marked discard: true');
            check(res1a.blob === null && res1a.url === null && res1a.hasAudio === false, '1a: Discarded session returns null blob and url');

            // 1b. Manual mode with speech -> silence > 4s does NOT auto-stop -> stops at 20s
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 'm2',
                    manual: true,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(450); // 4 frames > 3 frames -> speechStarted = true
            check(await page.evaluate(() => window.session.speechStarted), '1b: Acoustic speechStarted detected');

            await page.evaluate(() => { window.t.speaking = false; });
            await page.clock.runFor(4500); // 4.5s of silence in Manual mode
            check(await page.evaluate(() => window.session.recording && !window.session.finished), '1b: Manual mode does NOT auto-stop on 4.5s silence after speech');

            await page.clock.runFor(15200); // >20s total
            await page.clock.runFor(50);
            const res1b = await page.evaluate(() => window.lastResult);
            check(res1b.stopReason === 'limit-20s', '1b: Manual with speech stops at 20s limit');
            check(res1b.speechStarted === true && res1b.discard === false, '1b: Spoken manual session is not discarded at 20s');
            check(res1b.hasAudio === true && typeof res1b.url === 'string', '1b: Spoken manual session generates audio URL');

            check(page.errors.length === 0, 'Scenario 1: No page errors');
            await page.close();
        }

        // =====================================================================
        // Scenario 2: Autostop ON (5s pre-speech, valid STT 5s protection, 2s silence)
        // =====================================================================
        console.log('=== Scenario 2: Autostop ON & Valid STT 5s Protection ===');
        {
            const page = await createTestPage(browser);

            // 2a. Autostop ON without speech/STT -> stops at 5.0s
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.speaking = false;
                window.session = DrillAudio.startRecordingSession({
                    key: 'a1',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(4800);
            check(await page.evaluate(() => window.session.recording), '2a: Autostop ON still recording at 4.8s');
            await page.clock.runFor(300);
            await page.clock.runFor(50);
            const res2a = await page.evaluate(() => window.lastResult);
            check(res2a.stopReason === 'timeout-5s', '2a: Autostop ON stops at 5s without speech');
            check(res2a.notice === 'No speech detected within 5 seconds.', '2a: Exact 5s notice');
            check(res2a.discard === true && res2a.url === null, '2a: Discarded with null URL');

            // 2b. Autostop ON with valid STT within 5s (no acoustic speech) -> suppresses 5s stop, keeps speechStarted false
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.speaking = false;
                window.session = DrillAudio.startRecordingSession({
                    key: 'a2',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(1200);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: '図書館で本を借ります' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
            });
            check(await page.evaluate(() => window.session.protectedBy5sStt === true), '2b: protectedBy5sStt is true');
            check(await page.evaluate(() => window.session.speechStarted === false), '2b: speechStarted remains false (not faked by STT)');

            await page.clock.runFor(4500); // 5.7s elapsed
            check(await page.evaluate(() => window.session.recording && !window.session.finished), '2b: Valid STT within 5s suppresses 5s pre-speech timeout');

            await page.evaluate(() => window.session.stop());
            await page.clock.runFor(50);
            const res2b = await page.evaluate(() => window.lastResult);
            check(res2b.hasValidStt === true && res2b.discard === false, '2b: Protected STT session is preserved on stop');
            check(res2b.raw === '図書館で本を借ります', '2b: Raw transcript preserved intact');

            // 2c. Autostop ON with filler-only STT within 5s -> NOT protected, stops at 5.0s
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.speaking = false;
                window.session = DrillAudio.startRecordingSession({
                    key: 'a3',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(1000);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: 'えーと。。。' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
            });
            check(await page.evaluate(() => window.session.protectedBy5sStt === false), '2c: Filler-only STT does not set protectedBy5sStt');
            await page.clock.runFor(4200);
            await page.clock.runFor(50);
            const res2c = await page.evaluate(() => window.lastResult);
            check(res2c.stopReason === 'timeout-5s' && res2c.discard === true, '2c: Filler-only STT stops at 5s timeout and discards');

            // 2d. Autostop ON acoustic speech -> silence reset -> 2.0s continuous silence stops despite STT events
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 'a4',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(400); // speechStarted = true
            await page.evaluate(() => { window.t.speaking = false; });
            await page.clock.runFor(1400); // 1.4s silence
            check(await page.evaluate(() => window.session.recording), '2d: Still recording at 1.4s silence');

            // Sound returns briefly to reset silence timer
            await page.evaluate(() => { window.t.speaking = true; });
            await page.clock.runFor(250);
            await page.evaluate(() => { window.t.speaking = false; });

            await page.clock.runFor(1000); // 1.0s into second silence
            // Recognition event during silence MUST NOT reset acoustic silence timer
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: 'テスト回答' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
            });
            await page.clock.runFor(600); // 1.6s into second silence
            check(await page.evaluate(() => window.session.recording), '2d: Still recording at 1.6s after reset');

            await page.clock.runFor(600); // 2.2s into second silence
            await page.clock.runFor(50);
            const res2d = await page.evaluate(() => window.lastResult);
            check(res2d.stopReason === 'silence-2s' && res2d.discard === false, '2d: Auto-stopped at 2.0s continuous silence');

            check(page.errors.length === 0, 'Scenario 2: No page errors');
            await page.close();
        }

        // =====================================================================
        // Scenario 3: Blob/URL absence (null unification) & Auto-Compare relay
        // =====================================================================
        console.log('=== Scenario 3: Null Unification & Auto-Compare Relay ===');
        {
            const page = await createTestPage(browser);

            // 3a. Valid STT with 0 chunks -> blob: null, url: null, hasAudio: false, discard: false
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.emptyChunks = true;
                window.t.speaking = false;
                window.session = DrillAudio.startRecordingSession({
                    key: 'b1',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(500);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: 'チャンクなし有効認識' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
                window.session.stop();
            });
            await page.clock.runFor(50);
            const res3a = await page.evaluate(() => window.lastResult);
            check(res3a.hasValidStt === true && res3a.discard === false, '3a: Valid STT without chunks is not discarded');
            check(res3a.blob === null && res3a.url === null && res3a.hasAudio === false, '3a: Missing chunks returns strict null for blob and url');

            // 3b. Auto-Compare (playRelay) with url: () => null plays model TTS and skips recorded Audio
            const relayOutcome = await page.evaluate(() => {
                let modelSpoken = false;
                const recBtn = document.getElementById('recBtn');
                const resArea = document.getElementById('resultArea');
                DrillAudio.playRelay({
                    recordButton: recBtn,
                    result: resArea,
                    speak: done => {
                        modelSpoken = true;
                        done();
                    },
                    url: () => window.lastResult.url,
                    keepButtons: true
                });
                return { modelSpoken, audioCount: window.t.audios.length };
            });
            check(relayOutcome.modelSpoken === true, '3b: playRelay executes model TTS even when url is null');
            check(relayOutcome.audioCount === 0, '3b: playRelay skips Audio playback when url is null');

            // 3c. URL.createObjectURL exception -> blob: null, url: null, hasAudio: false
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.emptyChunks = false;
                window.t.failCreateObjectURL = true;
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 'b2',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(400);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: 'URL例外テスト' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
                window.session.stop();
            });
            await page.clock.runFor(50);
            const res3c = await page.evaluate(() => window.lastResult);
            check(res3c.hasValidStt === true && res3c.discard === false, '3c: Valid STT preserved when createObjectURL fails');
            check(res3c.blob === null && res3c.url === null && res3c.hasAudio === false, '3c: createObjectURL failure returns null blob and url');

            check(page.errors.length === 0, 'Scenario 3: No page errors');
            await page.close();
        }

        // =====================================================================
        // Scenario 4: Recorder/Recognition completion sync & delayed STT rescue
        // =====================================================================
        console.log('=== Scenario 4: Independent Completion Sync & Delayed STT ===');
        {
            const page = await createTestPage(browser);

            // 4a. Recorder finishes at 20ms, delayed final STT arrives at 80ms, Recognition finishes at 120ms
            await page.evaluate(() => {
                window.completions = [];
                window.t.recorderStopDelayMs = 20;
                window.t.recognitionStopDelayMs = 120;
                window.t.speaking = false;
                window.session = DrillAudio.startRecordingSession({
                    key: 's1',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.completions.push(res); }
                });
            });
            await page.clock.runFor(100);
            await page.evaluate(() => window.session.stop());

            await page.clock.runFor(40); // Recorder done (20ms), Recognition still pending (120ms)
            check(await page.evaluate(() => window.completions.length === 0 && window.session.recorderSettled && !window.session.recognitionSettled), '4a: Waits for Recognition after Recorder finishes first');

            // Delayed final STT arrives while stopping before recognition.onend
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: '遅延確定テキスト' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
            });

            await page.clock.runFor(100); // Recognition finishes at 120ms
            const comp4a = await page.evaluate(() => window.completions);
            check(comp4a.length === 1, '4a: onComplete called exactly once after both settle');
            check(comp4a[0].raw === '遅延確定テキスト' && comp4a[0].hasValidStt === true && comp4a[0].discard === false, '4a: Delayed final STT while stopping is captured and rescues discard');

            // 4b. Recognition finishes first (20ms), Recorder finishes later (120ms)
            await page.evaluate(() => {
                window.completions = [];
                window.t.recorderStopDelayMs = 120;
                window.t.recognitionStopDelayMs = 20;
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 's2',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.completions.push(res); }
                });
            });
            await page.clock.runFor(400);
            await page.evaluate(() => window.session.stop());
            await page.clock.runFor(40); // Recognition done (20ms), Recorder still pending (120ms)
            check(await page.evaluate(() => window.completions.length === 0 && !window.session.recorderSettled && window.session.recognitionSettled), '4b: Waits for Recorder after Recognition finishes first');

            await page.clock.runFor(100); // Recorder finishes at 120ms
            const comp4b = await page.evaluate(() => window.completions);
            check(comp4b.length === 1 && comp4b[0].hasAudio === true, '4b: Completes once with valid audio after Recorder settles');

            check(page.errors.length === 0, 'Scenario 4: No page errors');
            await page.close();
        }

        // =====================================================================
        // Scenario 5: 2500ms fallback timeout & late event blocking
        // =====================================================================
        console.log('=== Scenario 5: 2500ms Timeout Protection & Late Event Blocking ===');
        {
            const page = await createTestPage(browser);

            // 5a. Recorder hangs on stop -> 2500ms timeout forces finish, drops incomplete audio, keeps valid STT, releases resources
            await page.evaluate(() => {
                window.completions = [];
                window.t.hangRecorderStop = true;
                window.t.hangRecognitionStop = true;
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 't1',
                    manual: false,
                    isValidStt: window.fillerExcludedValidStt,
                    onComplete: res => { window.completions.push(res); }
                });
            });
            await page.clock.runFor(400);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r1 = [{ transcript: '確定部分' }];
                r1.isFinal = true;
                const r2 = [{ transcript: 'と途中部分' }];
                r2.isFinal = false;
                rec.onresult?.({ resultIndex: 0, results: [r1, r2] });
                window.session.stop();
            });

            await page.clock.runFor(2400);
            check(await page.evaluate(() => window.completions.length === 0), '5a: Still waiting at 2400ms before 2500ms fallback timeout');

            await page.clock.runFor(200); // 2600ms > 2500ms
            const state5a = await page.evaluate(() => {
                // Attempt late events after timeout completion
                const rec = window.t.recognitions.at(-1);
                const recorder = window.t.recorders.at(-1);
                const lateRes = [{ transcript: '遅延汚染' }];
                lateRes.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [lateRes] });
                rec.onend?.();
                recorder.ondataavailable?.({ data: new Blob(['late'], { type: 'audio/webm' }) });
                recorder.onstop?.();
                return {
                    count: window.completions.length,
                    result: window.completions[0],
                    tracksEnded: window.t.tracks.every(tr => tr.readyState === 'ended'),
                    contextsClosed: window.t.contexts.every(ctx => ctx.state === 'closed')
                };
            });
            check(state5a.count === 1, '5a: Completed exactly once at 2500ms fallback timeout');
            check(state5a.result.raw === '確定部分と途中部分', '5a: Preserves accumulated raw + interim and blocks late onresult after timeout');
            check(state5a.result.hasValidStt === true && state5a.result.discard === false, '5a: Valid STT is preserved even when recorder times out');
            check(state5a.result.blob === null && state5a.result.url === null && state5a.result.hasAudio === false, '5a: Hung recorder chunks are discarded (null blob/url)');
            check(state5a.tracksEnded && state5a.contextsClosed, '5a: All mic tracks and AudioContexts are released on 2500ms timeout');

            check(page.errors.length === 0, 'Scenario 5: No page errors');
            await page.close();
        }

        // =====================================================================
        // Scenario 6: Duplicate stop, onend restart, start errors, audioOnly, leave()
        // =====================================================================
        console.log('=== Scenario 6: Duplicate Stop, onend Restart, Start Errors, audioOnly, leave() ===');
        {
            const page = await createTestPage(browser);

            // 6a & 6b. onend restart while recording, interim preservation, duplicate stop ignored, no restart after stop
            await page.evaluate(() => {
                window.stopRequests = [];
                window.completions = [];
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 'r1',
                    manual: true,
                    isValidStt: window.fillerExcludedValidStt,
                    onStopRequested: info => window.stopRequests.push(info),
                    onComplete: res => window.completions.push(res)
                });
            });
            await page.clock.runFor(400);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: '前半途中' }];
                r.isFinal = false;
                rec.onresult?.({ resultIndex: 0, results: [r] });
                // Premature onend while recording continues
                rec.onend?.();
            });
            const afterRestart = await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                return {
                    recording: window.session.recording,
                    startCount: rec.startCount,
                    raw: window.session.raw,
                    interim: window.session.interim
                };
            });
            check(afterRestart.recording === true && afterRestart.startCount === 2, '6b: recognition.onend during recording restarts recognition on same instance');
            check(afterRestart.raw === '前半途中' && afterRestart.interim === '', '6b: Pending interim is flushed to raw before onend restart');

            // Duplicate stop calls
            await page.evaluate(() => {
                window.session.stop('First stop notice', false, 'manual');
                window.session.stop('Second stop notice', true, 'rec-error');
            });
            await page.clock.runFor(50);
            const dupCheck = await page.evaluate(() => ({
                stopReqCount: window.stopRequests.length,
                compCount: window.completions.length,
                result: window.completions[0],
                startCount: window.t.recognitions.at(-1).startCount
            }));
            check(dupCheck.stopReqCount === 1 && dupCheck.compCount === 1, '6a: Duplicate stop() calls are ignored');
            check(dupCheck.result.notice === 'First stop notice' && dupCheck.result.stopReason === 'manual', '6a: First stop reason and notice are kept');
            check(dupCheck.startCount === 2, '6b: recognition.onend after stop() does NOT restart recognition');

            // 6c. audioOnly: true skips SpeechRecognition and records audio
            const prevRecCount = await page.evaluate(() => window.t.recognitions.length);
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.speaking = true;
                window.session = DrillAudio.startRecordingSession({
                    key: 'ao1',
                    manual: false,
                    audioOnly: true,
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(400);
            await page.evaluate(() => window.session.stop());
            await page.clock.runFor(50);
            const res6c = await page.evaluate(() => ({
                recCount: window.t.recognitions.length,
                result: window.lastResult
            }));
            check(res6c.recCount === prevRecCount, '6c: audioOnly mode does not create SpeechRecognition');
            check(res6c.result.audioOnly === true && res6c.result.hasValidStt === false && res6c.result.speechStarted === true && res6c.result.hasAudio === true && res6c.result.discard === false, '6c: audioOnly session completes with audio and discard: false');

            // 6d. Start failure: getUserMedia denied & AudioContext.resume() rejected
            await page.evaluate(() => {
                window.lastResult = null;
                window.t.deny = true;
                DrillAudio.startRecordingSession({
                    key: 'err1',
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(50);
            const resDeny = await page.evaluate(() => window.lastResult);
            check(resDeny.stopReason === 'start-error' && resDeny.notice === 'Microphone access denied.' && resDeny.discard === true && resDeny.url === null, '6d: getUserMedia denial returns start-error and discard: true');

            await page.evaluate(() => {
                window.lastResult = null;
                window.t.deny = false;
                window.t.failAudioResume = true;
                DrillAudio.startRecordingSession({
                    key: 'err2',
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(50);
            const resResumeFail = await page.evaluate(() => ({
                result: window.lastResult,
                tracksEnded: window.t.tracks.every(tr => tr.readyState === 'ended')
            }));
            check(resResumeFail.result.stopReason === 'audio-error' && resResumeFail.result.notice === 'Recording error.' && resResumeFail.result.discard === true, '6d: AudioContext.resume() rejection stops safely with audio-error');
            check(resResumeFail.tracksEnded === true, '6d: Mic tracks ended on AudioContext.resume() failure');

            // 6e. Page leave() immediately aborts active recording session without saving
            await page.evaluate(() => {
                window.t.failAudioResume = false;
                window.t.speaking = true;
                window.lastResult = null;
                window.session = DrillAudio.startRecordingSession({
                    key: 'lv1',
                    onComplete: res => { window.lastResult = res; }
                });
            });
            await page.clock.runFor(400);
            await page.evaluate(() => {
                const rec = window.t.recognitions.at(-1);
                const r = [{ transcript: '離脱前テキスト' }];
                r.isFinal = true;
                rec.onresult?.({ resultIndex: 0, results: [r] });
                window.dispatchEvent(new PageTransitionEvent('pagehide'));
            });
            const resLeave = await page.evaluate(() => ({
                result: window.lastResult,
                active: DrillAudio.getActiveRecordingSession(),
                tracksEnded: window.t.tracks.every(tr => tr.readyState === 'ended'),
                contextsClosed: window.t.contexts.every(ctx => ctx.state === 'closed')
            }));
            check(Boolean(resLeave.result), '6e: leave() immediately finalizes without waiting 2500ms');
            check(resLeave.result.stopReason === 'aborted' && resLeave.result.discard === true && resLeave.result.blob === null && resLeave.result.url === null && resLeave.result.raw === '', '6e: leave() returns aborted result with null blob/url and empty raw');
            check(resLeave.active === null && resLeave.tracksEnded && resLeave.contextsClosed, '6e: leave() releases all tracks and contexts immediately');

            check(page.errors.length === 0, 'Scenario 6: No page errors');
            await page.close();
        }

        console.log(`\n========================================`);
        console.log(`ALL STAGE 3 RECORDING ENGINE TESTS PASSED! Total assertions checked: ${totalChecks}`);
        console.log(`========================================\n`);
    } finally {
        await browser.close();
    }
})().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
