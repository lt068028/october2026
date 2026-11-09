// Regression Test: Practice 7.2 Audio Exclusive Control & Interruption (B1, B2, B3, B4)
// Tests that starting a recording on a new row interrupts previous model TTS and recorded Audio,
// guards against stale autoplay callbacks, and cleanly supports re-recording without data loss.

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
        defer: false,
        deny: false,
        cancelCalls: 0,
        pauseCalls: 0
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
                const finish = () => {
                    if (window.t.deny) return reject(new DOMException('Denied', 'NotAllowedError'));
                    const track = {
                        readyState: 'live',
                        stop() { this.readyState = 'ended'; },
                        addEventListener() {}
                    };
                    window.t.tracks.push(track);
                    resolve({ getTracks: () => [track] });
                };
                window.t.requests.push(finish);
                if (!window.t.defer) finish();
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

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox']
    });

    try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));

        await page.addInitScript('(' + mock.toString() + ')();');

        await page.route('**/*', route => {
            const u = new URL(route.request().url());
            if (u.hostname !== 'p72.test') return route.abort();
            const filePath = path.join(root, u.pathname);
            if (!fs.existsSync(filePath)) return route.fulfill({ status: 404, body: '' });
            const ext = path.extname(filePath);
            const contentType = ext === '.js' ? 'text/javascript'
                : ext === '.css' ? 'text/css'
                : ext === '.html' ? 'text/html'
                : 'text/plain';
            return route.fulfill({
                status: 200,
                body: fs.readFileSync(filePath),
                contentType
            });
        });

        await page.goto('http://p72.test/practice7.2.html');
        await page.waitForTimeout(100);

        const recButtons = page.locator('#drill1List button').filter({ hasText: /^(🎙️|⏺️)とる/ });
        const rec1 = recButtons.nth(0);
        const rec2 = recButtons.nth(1);

        const listenButtons = page.locator('#drill1List button').filter({ hasText: /^🔊きく/ });
        const listen1 = listenButtons.nth(0);

        // Helper: Record on given row and wait for Autoplay model speech to start
        async function recordAndStartAutoplay(recBtn, transcript) {
            await recBtn.click();
            await page.waitForSelector('.stop-btn-active:not(:disabled)', { timeout: 3000 });
            await page.evaluate(text => {
                const r = window.t.recognitions.at(-1);
                const result = [{ transcript: text }];
                result.isFinal = true;
                r?.onresult?.({ resultIndex: 0, results: [result] });
                r?.onspeechstart?.();
            }, transcript);
            const initialSpokenCount = await page.evaluate(() => window.t.spoken.length);
            await page.locator('.stop-btn-active:not(:disabled)').click();
            await page.waitForFunction(prev => window.t.spoken.length > prev, initialSpokenCount, { timeout: 3000 });
        }

        // ====================================================================
        // CASE B1: Interrupt during Model Voice (TTS) by clicking row 2 record
        // ====================================================================
        console.log('Testing B1: Interrupting model audio with row 2 recording...');
        await recordAndStartAutoplay(rec1, 'あさ5時におきました');

        // Confirm Row 1 Autoplay model speech is active
        const b1SpeakingActive = await page.evaluate(() => window.speechSynthesis.speaking && window.t.spoken.length > 0);
        assert.equal(b1SpeakingActive, true, 'Row 1 Autoplay model TTS must be speaking');

        // Click Row 2's record button while Row 1 model audio is playing
        await rec2.click();

        // Verify B1 results:
        // 1. Model TTS must be cancelled
        const b1Cancelled = await page.evaluate(() => window.t.cancelCalls > 0 && window.speechSynthesis.current === null);
        assert.equal(b1Cancelled, true, 'B1: Model audio must be cancelled on row 2 record click');

        // 2. Row 1 listen button must not be stuck in Playing...
        const b1Listen1Text = await listen1.textContent();
        assert.equal(b1Listen1Text.includes('Playing...'), false, 'B1: Row 1 listen button label must be restored');

        // 3. Row 2 recording must start
        await page.waitForSelector('.stop-btn-active:not(:disabled)', { timeout: 3000 });
        const b1Row2Active = await page.evaluate(() => activeRecognitionSession?.rowKey === 'p7_drill_perf_0');
        assert.equal(b1Row2Active, true, 'B1: Row 2 recording session must be active');
        console.log('[B1] PASS: Model audio cancelled and row 2 recording started');

        // Clean up Row 2 active recording before next test
        await page.locator('.stop-btn-active:not(:disabled)').click();
        await page.waitForTimeout(100);

        // ====================================================================
        // CASE B2: Interrupt during Recorded Audio by clicking row 2 record
        // ====================================================================
        console.log('Testing B2: Interrupting recorded audio with row 2 recording...');
        await recordAndStartAutoplay(rec1, 'あさ5時におきました');

        // Advance Autoplay to recorded audio stage by ending model TTS
        await page.evaluate(() => {
            window.t.spoken.at(-1)?.onend?.();
        });
        await page.waitForFunction(() => window.t.audios.length > 0 && !window.t.audios.at(-1).paused, { timeout: 3000 });

        // Confirm Row 1 recorded audio is playing
        const b2AudioPlaying = await page.evaluate(() => !window.t.audios.at(-1).paused);
        assert.equal(b2AudioPlaying, true, 'Row 1 recorded audio must be playing');

        // Click Row 2's record button while Row 1 recorded audio is playing
        await rec2.click();

        // Verify B2 results:
        // 1. Recorded audio must be paused/stopped
        const b2AudioStopped = await page.evaluate(() => window.t.audios.at(-1).paused);
        assert.equal(b2AudioStopped, true, 'B2: Recorded audio must be stopped on row 2 record click');

        // 2. Row 2 recording must start
        await page.waitForSelector('.stop-btn-active:not(:disabled)', { timeout: 3000 });
        const b2Row2Active = await page.evaluate(() => activeRecognitionSession?.rowKey === 'p7_drill_perf_0');
        assert.equal(b2Row2Active, true, 'B2: Row 2 recording session must be active');
        console.log('[B2] PASS: Recorded audio stopped and row 2 recording started');

        // ====================================================================
        // CASE B3: Stale model end callback does not trigger old recorded audio
        // ====================================================================
        console.log('Testing B3: Stale model completion callback after interruption...');
        // Stop current Row 2 recording cleanly
        await page.locator('.stop-btn-active:not(:disabled)').click();
        await page.waitForTimeout(100);

        // Start Row 1 Autoplay model speech again
        await recordAndStartAutoplay(rec1, 'あさ5時におきました');

        // Stash the model utterance onend callback and current audio count
        await page.evaluate(() => {
            window.t.staleModelEnd = window.t.spoken.at(-1).onend;
            window.t.audioCountBeforeB3 = window.t.audios.length;
        });

        // Interrupt by starting Row 2 recording
        await rec2.click();
        await page.waitForSelector('.stop-btn-active:not(:disabled)', { timeout: 3000 });

        // Fire the stale callback now that Row 2 recording is in flight
        await page.evaluate(() => {
            window.t.staleModelEnd?.();
        });
        await page.waitForTimeout(100);

        // Verify B3 results:
        // No new Audio was created or played for Row 1
        const b3NoNewAudio = await page.evaluate(() => window.t.audios.length === window.t.audioCountBeforeB3);
        assert.equal(b3NoNewAudio, true, 'B3: Stale model callback must not start recorded audio for interrupted relay');
        console.log('[B3] PASS: Stale callback safely ignored, no old audio spawned');

        // ====================================================================
        // CASE B4: Re-recording Row 1 succeeds and preserves other rows' data
        // ====================================================================
        console.log('Testing B4: Re-recording row 1 after interruption...');
        // Complete Row 2 recording
        await page.evaluate(() => {
            const r = window.t.recognitions.at(-1);
            const result = [{ transcript: '5時から起きています' }];
            result.isFinal = true;
            r?.onresult?.({ resultIndex: 0, results: [result] });
            r?.onspeechstart?.();
        });
        await page.locator('.stop-btn-active:not(:disabled)').click();
        await page.waitForTimeout(150);

        // Finish Row 2 Autoplay
        await page.evaluate(() => {
            window.t.spoken.at(-1)?.onend?.();
            window.t.audios.at(-1)?.onended?.();
        });
        await page.waitForTimeout(100);

        // Verify Row 2 data is stored
        const row2InitialSaved = await page.evaluate(() => practice7State.savedResults['p7_drill_perf_0']?.rawTranscript);
        assert.equal(row2InitialSaved, '5時から起きています', 'Row 2 data must be saved before returning to Row 1');

        // Return to Row 1 and start recording again
        await rec1.click();
        await page.waitForSelector('.stop-btn-active:not(:disabled)', { timeout: 3000 });

        // Complete Row 1 re-recording with new text
        await page.evaluate(() => {
            const r = window.t.recognitions.at(-1);
            const result = [{ transcript: '朝五時に起きました' }];
            result.isFinal = true;
            r?.onresult?.({ resultIndex: 0, results: [result] });
            r?.onspeechstart?.();
        });
        await page.locator('.stop-btn-active:not(:disabled)').click();
        await page.waitForTimeout(150);

        // Verify B4 results:
        // 1. Row 1 new transcript is saved
        const b4Row1Saved = await page.evaluate(() => practice7State.savedResults['p7_drill_past_0']?.rawTranscript);
        assert.equal(b4Row1Saved, '朝五時に起きました', 'B4: Row 1 new transcript must be saved');

        // 2. Row 2 transcript and audio URL are intact
        const b4Row2Preserved = await page.evaluate(() => ({
            text: practice7State.savedResults['p7_drill_perf_0']?.rawTranscript,
            hasUrl: Boolean(practice7State.audioUrls['p7_drill_perf_0'])
        }));
        assert.equal(b4Row2Preserved.text, '5時から起きています', 'B4: Row 2 transcript must remain intact');
        assert.equal(b4Row2Preserved.hasUrl, true, 'B4: Row 2 audio URL must remain intact');
        console.log('[B4] PASS: Re-recording row 1 succeeded and row 2 data preserved');

        // Final check: No unhandled runtime errors
        assert.deepEqual(errors, [], 'No runtime JavaScript errors during B1-B4');
        console.log('ALL PRACTICE 7.2 AUDIO INTERRUPTION CHECKS (B1, B2, B3, B4) PASSED!');
    } finally {
        await browser.close();
    }
})().catch(err => {
    console.error('PRACTICE 7.2 AUDIO INTERRUPTION TEST FAILED:', err);
    process.exitCode = 1;
});
