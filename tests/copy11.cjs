const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const audio = fs.readFileSync(path.join(__dirname, 'audio-relay.cjs'), 'utf8');
const mock = audio.slice(audio.indexOf('function mock()'), audio.indexOf('(async()=>'));

let checks = 0;
function eq(actual, expected, label) {
    assert.deepEqual(actual, expected, label);
    checks++;
}
function ok(val, label) {
    assert.ok(val, label);
    checks++;
}

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox']
    });
    try {
        const context = await browser.newContext({ timezoneId: 'America/Los_Angeles' });
        const page = await context.newPage({ viewport: { width: 1440, height: 1100 } });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));

        await page.addInitScript('(' + mock.trim() + ')();');
        await page.addInitScript(() => {
            window.copied = [];
            window.denyCopy = false;
            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: async (text) => {
                        if (window.denyCopy) throw new Error('Denied');
                        window.copied.push(text);
                    }
                }
            });
        });

        await page.route('**/*', route => {
            const u = new URL(route.request().url());
            if (u.hostname !== 'copy11.test') return route.abort();
            const f = path.join(root, u.pathname);
            return route.fulfill({
                status: fs.existsSync(f) ? 200 : 404,
                body: fs.existsSync(f) ? fs.readFileSync(f) : '',
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });

        await page.goto('http://copy11.test/practice1.1.html');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));

        const copyButtons = page.locator('.p11-copy-button');
        eq(await copyButtons.count(), 3, '3 copy buttons exist (Task 1, Task 2, Task 3)');

        // Task 4 には Copy ボタンが存在しないこと
        const task4Buttons = page.locator('#task4Container .p11-copy-button');
        eq(await task4Buttons.count(), 0, 'No copy button in Task 4');

        // 説明文・ヘルプテキスト
        const helpTexts = await page.locator('.p11-copy-help').allTextContents();
        eq(helpTexts.length, 3, '3 copy help elements');
        helpTexts.forEach((text, i) => {
            eq(text, 'Copy your drill results to review or share.', `help text for Task ${i + 1}`);
        });

        // 初期状態で disabled であること
        for (let i = 0; i < 3; i++) {
            eq(await copyButtons.nth(i).isDisabled(), true, `Task ${i + 1} button disabled initially`);
        }

        // 結果未入力の状態でクリックしてもクリップボードAPIが呼ばれないこと
        await copyButtons.first().click({ force: true });
        const copiedInitial = await page.evaluate(() => window.copied.length);
        eq(copiedInitial, 0, 'No clipboard write when clicked while disabled');

        // 結果を投入
        await page.evaluate(() => {
            practice1State.savedResults['task1_0'] = {
                rawTranscript: 'わたしはがくせいです',
                isCorrect: true,
                audioOnly: false
            };
            practice1State.savedResults['task1_1'] = {
                rawTranscript: 'たけしさんはせんせいです',
                isCorrect: false,
                audioOnly: false
            };
            practice1State.savedResults['task2_1'] = {
                rawTranscript: 'メアリーさんはアメリカじんです',
                isCorrect: true,
                audioOnly: false
            };
            practice1State.savedResults['task3_1'] = {
                rawTranscript: 'やまださんはにほんじんです',
                isCorrect: true,
                audioOnly: false
            };
            // audioOnly行のテスト（除外されるべき）
            practice1State.savedResults['task3_2'] = {
                rawTranscript: 'audio only',
                isCorrect: true,
                audioOnly: true
            };
            renderAll();
        });
        await page.waitForTimeout(100);

        // ボタンが有効化されたか確認
        for (let i = 0; i < 3; i++) {
            eq(await copyButtons.nth(i).isEnabled(), true, `Task ${i + 1} button enabled with results`);
        }

        // アイコン要素が含まれていること
        const iconInfo = await copyButtons.first().evaluate(btn => {
            const svg = btn.querySelector('svg');
            return { hasSvg: Boolean(svg), className: svg?.getAttribute('class') };
        });
        ok(iconInfo.hasSvg, 'Copy button has svg icon');
        ok(iconInfo.className.includes('p11-copy-icon'), 'Copy icon has p11-copy-icon class');

        // Task 1 のコピー実行
        await copyButtons.nth(0).click();
        const copiedTexts = await page.evaluate(() => window.copied);
        eq(copiedTexts.length, 1, '1 text copied');
        const expectedHeader1 = 'Practice 1.1 — Task 1: Basic Sentences — N₁はN₂です — 2026-11-15';
        ok(copiedTexts[0].startsWith(expectedHeader1), 'Task 1 header correct');
        ok(copiedTexts[0].includes('1. ✅ わたしはがくせいです'), 'Task 1 item 1 correct format');
        ok(copiedTexts[0].includes('2. ❌ たけしさんはせんせいです'), 'Task 1 item 2 correct format with cross mark');

        // クリック直後にラベルが Copied になること
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Label changed to Copied');
        eq(await copyButtons.nth(1).locator('span').textContent(), 'Copy my sentences', 'Task 2 label unchanged');

        // 2秒タイマーの検証
        await page.clock.fastForward(1900);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Still Copied at 1.9s');
        await page.clock.fastForward(200);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'Reverted to Copy my sentences at 2.1s');

        // 連続クリックとタイマーリセットの検証
        await copyButtons.nth(0).click();
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Copied again');
        await page.clock.fastForward(1500);
        await copyButtons.nth(0).click();
        await page.clock.fastForward(1000); // 最初のクリックから2.5秒、2回目のクリックから1.0秒
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Still Copied after reset');
        await page.clock.fastForward(1100); // 2回目のクリックから2.1秒
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'Reverted after 2s from second click');

        // Task 2 のコピー実行
        await copyButtons.nth(1).click();
        const copied2 = await page.evaluate(() => window.copied.at(-1));
        const expectedHeader2 = 'Practice 1.1 — Task 2: Selectable Practice — N₁はN₂です — 2026-11-15';
        ok(copied2.startsWith(expectedHeader2), 'Task 2 header correct');
        ok(copied2.includes('1. ✅ メアリーさんはアメリカじんです'), 'Task 2 entry correct');

        // Task 3 のコピー実行（audioOnlyが除外されていること）
        await copyButtons.nth(2).click();
        const copied3 = await page.evaluate(() => window.copied.at(-1));
        const expectedHeader3 = 'Practice 1.1 — Task 3: Free Practice — N₁はN₂です — 2026-11-15';
        ok(copied3.startsWith(expectedHeader3), 'Task 3 header correct');
        ok(copied3.includes('1. ✅ やまださんはにほんじんです'), 'Task 3 entry 1 correct');
        ok(!copied3.includes('audio only'), 'audioOnly row excluded from Task 3');

        // 録音中（busy）に disabled になること
        await page.evaluate(() => {
            practice1State.startingRow = 'task1_0';
            syncRecordingButtons();
        });
        eq(await copyButtons.nth(0).isDisabled(), true, 'Button disabled while recording');
        await page.evaluate(() => {
            practice1State.startingRow = null;
            syncRecordingButtons();
        });
        eq(await copyButtons.nth(0).isEnabled(), true, 'Button re-enabled after recording ends');

        eq(errors.length, 0, 'No page errors');
        console.log(`tests/copy11.cjs passed (${checks} checks)`);
    } finally {
        await browser.close();
    }
})();
