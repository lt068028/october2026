// tests/f4-recording-limits.cjs
// F4 日本語学習ページの共通録音制限・Autostop統一検証テスト
// ① 発話開始前：5秒（Autostop ON/OFF共通、発話検知で解除）
// ② 発話後：2.0秒連続無音（Autostop ON時のみ、マイク音量監視、2秒未満で復帰時はリセット、Manual時は無音停止なし、recognition.onend代用不可）
// ③ 絶対上限：20秒（ON/OFF、発話有無問わず必ず停止、重複停止なし）
// リソース管理：停止・エラー時のタイマー解除、音量監視終了、AudioContext・マイク解放

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = process.env.DRILL_ROOT || path.resolve(__dirname, '..');
const chromiumPath = process.env.CHROMIUM_PATH ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' :
     path.join(root, '.tools/ms-playwright/chromium-1140/chrome-linux/chrome'));

const pages = (process.env.PRACTICE_PAGES ? process.env.PRACTICE_PAGES.split(',') : [
    'practice1.1',
    'practice1.2',
    'practice2.1',
    'practice2.2',
    'practice2.3',
    'practice7.1',
    'practice7.2',
    'practice7.3',
    'practice8.1',
    'practice8.2',
    'practice8.3',
    'composition1',
    'pronunciation1',
    'pronunciation2'
]);

function injectMock() {
    window.t = {
        spoken: [],
        audios: [],
        tracks: [],
        recorders: [],
        recognitions: [],
        contexts: [],
        speaking: false,
        deny: false
    };

    Object.defineProperty(window, 'speechSynthesis', {
        value: {
            getVoices: () => [{ name: 'Google Japanese', voiceURI: 'ja', lang: 'ja-JP' }],
            addEventListener() {},
            onvoiceschanged: null,
            speak(u) { window.t.spoken.push(u); this.current = u; },
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
            this.state = 'recording';
            window.recordingStartTime = Date.now();
        }
        stop() {
            this.state = 'inactive';
            setTimeout(() => {
                this.ondataavailable?.({ data: new Blob(['recorded'], { type: 'audio/webm' }) });
                this.onstop?.();
            }, 0);
        }
    };

    window.SpeechRecognition = class {
        constructor() {
            window.t.recognitions.push(this);
        }
        start() { this.active = true; }
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

    window.Audio = class {
        constructor(url) {
            this.url = url;
            this.paused = true;
            window.t.audios.push(this);
        }
        play() { this.paused = false; return Promise.resolve(); }
        pause() { this.paused = true; }
    };

    window.AudioContext = class {
        constructor() {
            this.state = 'running';
            this.sampleRate = 48000;
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
                getByteFrequencyData(arr) {
                    arr.fill(window.t.speaking ? 40 : 0);
                },
                disconnect() {}
            };
        }
        decodeAudioData() {
            const buffer = {
                sampleRate: 48000,
                numberOfChannels: 1,
                length: 48000,
                getChannelData: () => new Float32Array(48000)
            };
            return Promise.resolve(buffer);
        }
    };
    window.webkitAudioContext = window.AudioContext;
}

let totalChecks = 0;
function check(condition, message) {
    assert(condition, message);
    totalChecks++;
}

async function createPage(browser, pageName) {
    const page = await browser.newPage();
    page.errors = [];
    page.on('pageerror', err => page.errors.push(err.message));

    await page.addInitScript('(' + injectMock.toString() + ')();');

    await page.route('**', route => {
        const url = route.request().url();
        if (url.includes('fonts.googleapis') || url.includes('fonts.gstatic')) {
            return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        }
        if (url.startsWith('http://drill.test/')) {
            const filePath = path.join(root, new URL(url).pathname);
            if (!fs.existsSync(filePath)) {
                return route.fulfill({ status: 404, body: '' });
            }
            let content = fs.readFileSync(filePath, filePath.endsWith('.js') ? 'utf8' : undefined);
            if (filePath.endsWith('drill-audio-session.js')) {
                content += '\nconst reg=DrillAudio.registerPitch;DrillAudio.registerPitch=(s,f)=>{(window.states ||= []).push(s);reg(s,f)};';
            }
            return route.fulfill({
                body: content,
                contentType: filePath.endsWith('.js') ? 'text/javascript' :
                             filePath.endsWith('.css') ? 'text/css' : 'text/html'
            });
        }
        return route.abort();
    });

    await page.goto('http://drill.test/' + pageName + '.html');
    await page.waitForTimeout(100);

    if (pageName.startsWith('pronunciation')) {
        await page.evaluate(() => {
            window.estimateF0Frames = () => [{ time: 0, f0: 180 }, { time: 0.02, f0: 190 }];
            window.drawPitchCurve = (s, u, m) => { s.drawn = { u, m }; };
            window.drawPitchPlaceholder = s => { s.drawn = { u: null, m: null }; };
        });
    }

    return page;
}

async function isRecordingActive(page) {
    return page.evaluate(() => {
        const rec = window.t.recorders.at(-1);
        return Boolean(rec && rec.state === 'recording');
    });
}

async function hasStopMessage(page, message) {
    return (await page.locator('body').innerText()).includes(message);
}

async function triggerSpeech(page, text = 'こんにちは') {
    await page.evaluate(transcript => {
        window.t.speaking = true;
        const rec = window.t.recognitions.at(-1);
        if (rec) {
            rec.onspeechstart?.();
            const result = [{ transcript }];
            result.isFinal = true;
            rec.onresult?.({ resultIndex: 0, results: [result] });
        }
    }, text);
}

async function setSpeaking(page, speaking) {
    await page.evaluate(s => { window.t.speaking = s; }, speaking);
}

async function clickRecord(page, isManual = false) {
    await page.evaluate(manual => {
        const toggle = document.querySelector('#toggleRecordMode');
        if (toggle) {
            if (manual && toggle.checked) toggle.click();
            if (!manual && !toggle.checked) toggle.click();
        }
        const playToggle = document.querySelector('#togglePlaybackMode');
        if (playToggle && playToggle.checked) playToggle.click();

        if (window.practice71State?.views) {
            const v = Object.values(window.practice71State.views)[0];
            if (v?.recordBtn && !v.recordBtn.disabled) return v.recordBtn.click();
        }
        if (window.practice7State?.views) {
            const v = Object.values(window.practice7State.views)[0];
            if (v?.recordBtn && !v.recordBtn.disabled) return v.recordBtn.click();
        }
        if (typeof views !== 'undefined' && views instanceof Map) {
            const v = [...views.values()][0];
            if (v?.rec && !v.rec.disabled) return v.rec.click();
        }

        const candidates = [...document.querySelectorAll('button')].filter(b =>
            /^(🎙️|⏺️)とる/.test(b.textContent.trim()) && !b.disabled && !b.closest('.selection-help-wrap') && !b.dataset.selectionHelp
        );
        if (candidates.length === 0) throw new Error('No enabled record button found');
        const chosen = candidates.find(b => b.closest('table, tr, td, .practice-row, .card, .drill-row, .drill-item')) || candidates[0];
        chosen.click();
    }, isManual);
    await page.clock.runFor(100);
}

async function advanceToElapsed(page, targetElapsed) {
    const currentElapsed = await page.evaluate(() => Date.now() - window.recordingStartTime);
    const toAdvance = targetElapsed - currentElapsed;
    if (toAdvance > 0) {
        await page.clock.runFor(toAdvance);
    }
}

async function runTestsForPage(browser, pageName) {
    console.log(`\n=== Testing F4 Recording Limits on ${pageName} ===`);

    // -------------------------------------------------------------------------
    // Session 1: Autostop ON
    // Tests: Scenarios 1&2 (5s timeout), Scenario 3 (pre-speech cancel),
    //        Scenarios 4&5 (silence auto-stop), Scenario 6 (silence reset),
    //        Scenario 10 (20s limit), Scenario 12 (onend alone)
    // -------------------------------------------------------------------------
    {
        const page = await createPage(browser, pageName);
        await page.clock.install();

        // --- Scenario 1 & 2: Pre-speech timeout (4.8s keeps, 5.0s stops) ---
        await clickRecord(page, false);
        check(await isRecordingActive(page), `${pageName}: Scenario 1 - Recording active after start`);

        await advanceToElapsed(page, 4800);
        check(await isRecordingActive(page), `${pageName}: Scenario 1 - Still recording at 4.8s without speech`);

        await advanceToElapsed(page, 5100);
        await page.clock.runFor(100);
        check(!(await isRecordingActive(page)), `${pageName}: Scenario 2 - Auto-stopped at 5.0s without speech`);
        check(await hasStopMessage(page, 'No speech detected within 5 seconds.'), `${pageName}: Scenario 2 - Displays exact 5s stop-reason message`);

        const allTracksEnded = await page.evaluate(() => window.t.tracks.every(tr => tr.readyState === 'ended'));
        check(allTracksEnded, `${pageName}: Scenario 2 - Microphone tracks ended on 5s stop`);

        // --- Scenario 3, 4, 5: Speech cancels 5s timeout; 2.0s silence auto-stops ---
        await clickRecord(page, false);
        await advanceToElapsed(page, 1000);
        await triggerSpeech(page, 'テスト発話');
        await setSpeaking(page, true);

        // Advance to 6.0s elapsed: cancels 5s pre-speech timeout
        await advanceToElapsed(page, 6000);
        check(await isRecordingActive(page), `${pageName}: Scenario 3 - Recording NOT stopped by 5s timer once speech started`);

        // Stop speaking at 6.0s; silence begins
        await setSpeaking(page, false);

        // 1.7s silence: still recording
        await page.clock.runFor(1700);
        check(await isRecordingActive(page), `${pageName}: Scenario 4 - Autostop ON: Still recording after 1.7s silence`);

        // Advance to 2.2s continuous silence: auto-stops
        await page.clock.runFor(500);
        await page.clock.runFor(150);
        check(!(await isRecordingActive(page)), `${pageName}: Scenario 5 - Autostop ON: Auto-stopped after 2.0s continuous silence`);

        // --- Scenario 6: Silence interrupted before 2s resets silence timer ---
        await clickRecord(page, false);
        await advanceToElapsed(page, 1000);
        await triggerSpeech(page, 'あー');
        await setSpeaking(page, true);
        await page.clock.runFor(300);
        await setSpeaking(page, false); // Silence 1 begins

        // Silence for 1.4s (< 2.0s)
        await page.clock.runFor(1400);
        check(await isRecordingActive(page), `${pageName}: Scenario 6 - Recording active during silence`);

        // Sound returns for 400ms
        await setSpeaking(page, true);
        await page.clock.runFor(400);

        // Silence 2 begins
        await setSpeaking(page, false);

        // Advance 1.4s into silence 2 (< 2.0s)
        await page.clock.runFor(1400);
        check(await isRecordingActive(page), `${pageName}: Scenario 6 - Silence timer reset by returning sound; still recording at 1.4s`);

        // Advance another 900ms (total 2.3s continuous silence in silence 2)
        await page.clock.runFor(900);
        await page.clock.runFor(150);
        check(!(await isRecordingActive(page)), `${pageName}: Scenario 6 - Auto-stopped after 2.0s of continuous silence after reset`);

        // --- Scenario 10: Autostop ON while speaking continuously stops at 20s ---
        await clickRecord(page, false);
        await triggerSpeech(page, 'ずっと話しています');
        await setSpeaking(page, true);

        await advanceToElapsed(page, 19700);
        check(await isRecordingActive(page), `${pageName}: Scenario 10 - Still recording at 19.7s while speaking`);

        await advanceToElapsed(page, 20200);
        await page.clock.runFor(100);
        check(!(await isRecordingActive(page)), `${pageName}: Scenario 10 - Stopped at 20s absolute upper limit while speaking`);
        check(await hasStopMessage(page, 'Auto-stopped after 20 seconds.'), `${pageName}: Scenario 10 - Displays exact 20s stop-reason message`);

        // --- Scenario 12: Recognition onend alone does NOT stop recording if 2.0s silence has not elapsed ---
        await clickRecord(page, false);
        await advanceToElapsed(page, 1000);
        await triggerSpeech(page, '短い発話');
        await setSpeaking(page, true);

        await advanceToElapsed(page, 1500);
        await page.evaluate(() => { window.t.recognitions.at(-1)?.onend?.(); });
        check(await isRecordingActive(page), `${pageName}: Scenario 12 - Recognition onend alone does NOT stop recording when speech continues`);

        // Stop cleanly
        await setSpeaking(page, false);
        await page.clock.runFor(2500);
        await page.clock.runFor(150);

        check(page.errors.length === 0, `${pageName}: Autostop session - No runtime errors`);
        await page.close();
    }

    // -------------------------------------------------------------------------
    // Session 2: Manual mode
    // Tests: Scenario 8 & 11 (no speech stops at 5s, precedes 20s),
    //        Scenario 7 (no silence stop after speech), Scenario 9 (stops at 20s),
    //        Scenario 13 (stop button click and track cleanup)
    // -------------------------------------------------------------------------
    {
        const page = await createPage(browser, pageName);
        await page.clock.install();

        // --- Scenario 8 & 11: Manual without speech stops at 5.0s, precedes 20s limit ---
        await clickRecord(page, true); // Manual
        await advanceToElapsed(page, 4800);
        check(await isRecordingActive(page), `${pageName}: Scenario 8 - Manual mode still active at 4.8s without speech`);

        await advanceToElapsed(page, 5100);
        await page.clock.runFor(100);
        check(!(await isRecordingActive(page)), `${pageName}: Scenario 8&11 - Manual mode auto-stops at 5.0s without speech (precedes 20s)`);
        check(await hasStopMessage(page, 'No speech detected within 5 seconds.'), `${pageName}: Scenario 8&11 - Displays exact 5s stop-reason message in Manual mode`);

        // --- Scenario 7 & 9: Manual does NOT auto-stop on silence; stops at 20s absolute upper limit ---
        await clickRecord(page, true); // Manual
        await advanceToElapsed(page, 1000);
        await triggerSpeech(page, 'マニュアル発話');
        await setSpeaking(page, true);
        await page.clock.runFor(300); // speak for 300ms
        await setSpeaking(page, false); // silence

        // 4.0s of silence after speech (total > 5s elapsed)
        await page.clock.runFor(4000);
        check(await isRecordingActive(page), `${pageName}: Scenario 7 - Manual mode does NOT auto-stop on silence after speech`);

        // Start speaking again and advance to 20s
        await setSpeaking(page, true);
        await advanceToElapsed(page, 19700);
        check(await isRecordingActive(page), `${pageName}: Scenario 9 - Manual still recording at 19.7s while speaking`);

        await advanceToElapsed(page, 20200);
        await page.clock.runFor(100);
        check(!(await isRecordingActive(page)), `${pageName}: Scenario 9 - Manual stopped at 20s absolute upper limit`);
        check(await hasStopMessage(page, 'Auto-stopped after 20 seconds.'), `${pageName}: Scenario 9 - Displays exact 20s stop-reason message in Manual mode`);

        // --- Scenario 13: Stop button and resource cleanup ---
        await clickRecord(page, true); // Manual
        check(await isRecordingActive(page), `${pageName}: Scenario 13 - Recording active before manual stop`);

        await page.evaluate(() => {
            const stopBtn = document.querySelector('.stop-btn-active:not(:disabled), button.stop-btn:not(:disabled), button:not(:disabled)[aria-label*="Stop"], button:not(:disabled)[title*="Stop"]');
            if (stopBtn) return stopBtn.click();
            if (window.practice71State?.views) {
                const v = Object.values(window.practice71State.views).find(x => x.stopBtn && !x.stopBtn.disabled);
                if (v) return v.stopBtn.click();
            }
            if (window.practice7State?.views) {
                const v = Object.values(window.practice7State.views).find(x => x.stopBtn && !x.stopBtn.disabled);
                if (v) return v.stopBtn.click();
            }
            if (typeof views !== 'undefined' && views instanceof Map) {
                const v = [...views.values()].find(x => x.stop && !x.stop.disabled);
                if (v) return v.stop.click();
            }
            const anyStop = [...document.querySelectorAll('button')].find(b => /^(⏹️|Stop)/.test(b.textContent.trim()) && !b.disabled);
            if (anyStop) anyStop.click();
        });
        await page.clock.runFor(100);

        check(!(await isRecordingActive(page)), `${pageName}: Scenario 13 - Stopped via stop button`);
        const allTracksEnded = await page.evaluate(() => window.t.tracks.every(tr => tr.readyState === 'ended'));
        check(allTracksEnded, `${pageName}: Scenario 13 - All tracks ended after stop button`);

        check(page.errors.length === 0, `${pageName}: Manual session - No runtime errors`);
        await page.close();
    }
}

// Special test for Pronunciation 2 Pitch Lab recording path
async function runPronunciation2PitchLabTest(browser) {
    console.log(`\n=== Testing Pronunciation 2 Pitch Lab Recording Path ===`);
    const page = await createPage(browser, 'pronunciation2');
    await page.clock.install();

    await page.evaluate(() => {
        const toggle = document.querySelector('#toggleRecordMode');
        if (toggle && !toggle.checked) toggle.click(); // Autostop ON
        window.states[0].recordBtn.click();
    });
    await page.clock.runFor(100);

    const isPitchLabRecording = () => page.evaluate(() => {
        const rec = window.t.recorders.at(-1);
        return Boolean(rec && rec.state === 'recording');
    });

    check(await isPitchLabRecording(), `p2 Pitch Lab: Recording active after start`);

    // 4.8s without speech
    await advanceToElapsed(page, 4800);
    check(await isPitchLabRecording(), `p2 Pitch Lab: Still recording at 4.8s without speech`);

    // 5.1s without speech -> auto-stops
    await advanceToElapsed(page, 5100);
    await page.clock.runFor(100);
    check(!(await isPitchLabRecording()), `p2 Pitch Lab: Auto-stopped at 5.0s without speech`);

    await page.close();
}

async function triggerRecognitionOnly(page, transcript = 'テスト') {
    await page.evaluate((text) => {
        const rec = window.t.recognitions[window.t.recognitions.length - 1];
        if (!rec) return;
        rec.onspeechstart?.();
        rec.onresult?.({
            resultIndex: 0,
            results: [{ isFinal: true, 0: { transcript: text } }]
        });
    }, transcript);
}

async function runRecognitionSeparationTests(browser) {
    const targets = [
        '/practice1.1.html', '/practice1.2.html',
        '/practice2.1.html', '/practice2.2.html', '/practice2.3.html',
        '/practice7.1.html', '/practice7.2.html', '/practice7.3.html',
        '/practice8.1.html', '/practice8.2.html', '/practice8.3.html',
        '/composition1.html', '/pronunciation2.html'
    ];
    for (const urlPath of targets) {
        console.log(`\n=== Testing Recognition/Mic Separation on ${urlPath} ===`);
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        await page.addInitScript(mockScript);
        await page.route('http://f4.test/**', r => {
            const u = new URL(r.request().url());
            const f = path.join(rootDir, u.pathname);
            if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
            return r.fulfill({
                body: fs.readFileSync(f),
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });
        await page.goto(`http://f4.test${urlPath}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);

        const recSelector = urlPath.includes('practice8.') || urlPath === '/practice7.3.html'
            ? '.drill-record-btn, .record-btn'
            : '.record-btn';
        const recBtn = page.locator(recSelector).first();

        // 1. 5秒未発話判定の独立性：マイク音量ゼロのまま Recognition イベントのみ発生しても 5秒で停止すること
        await page.evaluate(() => { window.t.speaking = false; });
        await recBtn.click();
        await page.waitForTimeout(1000);
        await triggerRecognitionOnly(page, 'テスト発話');
        await page.waitForTimeout(4500);
        const bodyText5s = await page.locator('body').textContent();
        check(bodyText5s.includes('No speech detected within 5 seconds.'), `${urlPath}: 5s no-speech timeout fires despite Recognition events`);

        // 2. 2秒無音判定の独立性：マイク音量で発話開始 -> 無音化 -> Recognition イベント発生 -> 最後のマイク音量から2秒で停止
        await page.evaluate(() => { window.t.speaking = true; });
        await recBtn.click();
        await page.waitForTimeout(600);
        await page.evaluate(() => { window.t.speaking = false; });
        await page.waitForTimeout(1000);
        await triggerRecognitionOnly(page, '継続認識');
        await page.waitForTimeout(1500);
        const activeCountAfter2s = await page.evaluate(() => window.t.recorders.filter(r => r.state === 'recording').length);
        check(activeCountAfter2s === 0, `${urlPath}: 2s autostop fires despite Recognition events during silence`);

        // 3. AudioContext resume() reject 時に録音が継続しないこと
        await page.evaluate(() => {
            window.AudioContext.prototype.resume = () => Promise.reject(new Error('Resume blocked'));
        });
        await recBtn.click();
        await page.waitForTimeout(300);
        const activeOnResumeFail = await page.evaluate(() => window.t.recorders.filter(r => r.state === 'recording').length);
        check(activeOnResumeFail === 0, `${urlPath}: recording stops safely when AudioContext.resume() rejects`);

        await page.close();
    }
}

(async () => {
    console.log(`Launching Chromium at: ${chromiumPath}`);
    const browser = await chromium.launch({
        executablePath: chromiumPath,
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        for (const p of pages) {
            await runTestsForPage(browser, p);
        }
        await runPronunciation2PitchLabTest(browser);
        await runRecognitionSeparationTests(browser);

        console.log(`\n========================================`);
        console.log(`ALL F4 TESTS PASSED! Total assertions checked: ${totalChecks}`);
        console.log(`========================================\n`);
    } finally {
        await browser.close();
    }
})().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
