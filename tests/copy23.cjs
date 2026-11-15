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
            if (u.hostname !== 'copy23.test') return route.abort();
            const f = path.join(root, u.pathname);
            return route.fulfill({
                status: fs.existsSync(f) ? 200 : 404,
                body: fs.existsSync(f) ? fs.readFileSync(f) : '',
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });

        await page.goto('http://copy23.test/practice2.3.html');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));

        const copyButtons = page.locator('.p23-copy-button');
        eq(await copyButtons.count(), 3, '3 copy buttons exist (Drill 1, Drill 2, Drill 3)');

        // Drill 4 には Copy ボタンが存在しないこと
        const drill4Buttons = page.locator('#drill4Container .p23-copy-button');
        eq(await drill4Buttons.count(), 0, 'No copy button in Drill 4');

        // 説明文・ヘルプテキスト
        const helpTexts = await page.locator('.p23-copy-help').allTextContents();
        eq(helpTexts.length, 3, '3 copy help elements');
        helpTexts.forEach((text, i) => {
            eq(text, 'Copy your drill results to review or share.', `help text for Drill ${i + 1}`);
        });

        // 初期状態で disabled であること
        for (let i = 0; i < 3; i++) {
            eq(await copyButtons.nth(i).isDisabled(), true, `Drill ${i + 1} button disabled initially`);
        }

        // 結果未入力の状態でクリックしてもクリップボードAPIが呼ばれないこと
        await copyButtons.first().click({ force: true });
        const copiedInitial = await page.evaluate(() => window.copied.length);
        eq(copiedInitial, 0, 'No clipboard write when clicked while disabled');

        // 結果を投入
        await page.evaluate(() => {
            practice2State.cityDrillSet = 0; // Drill 1 Set 0
            practice2State.savedResults['p23_describe_s0_0'] = {
                rawTranscript: 'ここは日本です',
                isCorrect: true,
                audioOnly: false
            };
            practice2State.savedResults['p23_describe_s0_1'] = {
                rawTranscript: 'そこはイギリスです',
                isCorrect: false,
                audioOnly: false
            };

            practice2State.whereDrillSet = 0; // Drill 2 Set 0
            practice2State.savedResults['p23_where_d1_s0_0_q'] = {
                rawTranscript: 'Yさんはどこですか',
                isCorrect: true,
                audioOnly: false
            };
            practice2State.savedResults['p23_where_d1_s0_0_r'] = {
                rawTranscript: 'としょかんです',
                isCorrect: true,
                audioOnly: false
            };

            practice2State.cityDialogueSet = 0; // Drill 3 Set 0
            practice2State.savedResults['p23_dialogue_s0_0_q'] = {
                rawTranscript: 'そこはどこですか',
                isCorrect: true,
                audioOnly: false
            };
            practice2State.savedResults['p23_dialogue_s0_0_r'] = {
                rawTranscript: 'フランスです',
                isCorrect: true,
                audioOnly: false
            };

            renderAll();
        });
        await page.waitForTimeout(100);

        // ボタンが有効化されたか確認
        for (let i = 0; i < 3; i++) {
            eq(await copyButtons.nth(i).isEnabled(), true, `Drill ${i + 1} button enabled with results`);
        }

        // アイコン要素が含まれていること
        const iconInfo = await copyButtons.first().evaluate(btn => {
            const svg = btn.querySelector('svg');
            return { hasSvg: Boolean(svg), className: svg?.getAttribute('class') };
        });
        ok(iconInfo.hasSvg, 'Copy button has svg icon');
        ok(iconInfo.className.includes('p23-copy-icon'), 'Copy icon has p23-copy-icon class');

        // Drill 1 のコピー実行
        await copyButtons.nth(0).click();
        const copiedTexts = await page.evaluate(() => window.copied);
        eq(copiedTexts.length, 1, '1 text copied');
        const expectedHeader1 = 'Practice 2.3 — Drill 1: From X’s point of view — ここ・そこ・あそこ・どこ — 2026-11-15';
        ok(copiedTexts[0].startsWith(expectedHeader1), 'Drill 1 header correct');
        ok(copiedTexts[0].includes('1. ✅ ここは日本です'), 'Drill 1 entry 1 correct without speaker prefix');
        ok(copiedTexts[0].includes('2. ❌ そこはイギリスです'), 'Drill 1 entry 2 correct with cross mark');

        // クリック直後にラベルが Copied になること
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Label changed to Copied');
        eq(await copyButtons.nth(1).locator('span').textContent(), 'Copy my sentences', 'Drill 2 label unchanged');

        // 2秒タイマーの検証
        await page.clock.fastForward(1000);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Still Copied at 1.0s');
        await page.clock.fastForward(1100);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'Reverted to Copy my sentences at 2.1s');

        // 連続クリックとタイマーリセットの検証
        await copyButtons.nth(0).click();
        await page.clock.fastForward(1000);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Copied at 1s');
        await copyButtons.nth(0).click();
        await page.clock.fastForward(1500);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Still Copied after reset');
        await page.clock.fastForward(600);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'Reverted after 2s from second click');

        // Drill 2 のコピー実行
        await copyButtons.nth(1).click();
        const copied2 = await page.evaluate(() => window.copied.at(-1));
        const expectedHeader2 = 'Practice 2.3 — Drill 2: Where? — ここ・そこ・あそこ・どこ — 2026-11-15';
        ok(copied2.startsWith(expectedHeader2), 'Drill 2 header correct');
        ok(copied2.includes('1. Q: ✅ Yさんはどこですか'), 'Drill 2 Q entry correct');
        ok(copied2.includes('1. A: ✅ としょかんです'), 'Drill 2 A entry correct');

        // Drill 3 のコピー実行
        await copyButtons.nth(2).click();
        const copied3 = await page.evaluate(() => window.copied.at(-1));
        const expectedHeader3 = 'Practice 2.3 — Drill 3: Ask and answer — ここ・そこ・あそこ・どこ — 2026-11-15';
        ok(copied3.startsWith(expectedHeader3), 'Drill 3 header correct');
        ok(copied3.includes('1. Q: ✅ そこはどこですか'), 'Drill 3 Q entry correct');
        ok(copied3.includes('1. A: ✅ フランスです'), 'Drill 3 A entry correct');

        // 録音中（busy）に disabled になること
        await page.evaluate(() => {
            practice2State.startingRow = 'p23_describe_s0_0';
            practice2SyncRecordingUI();
        });
        eq(await copyButtons.nth(0).isDisabled(), true, 'Button disabled while recording');
        await page.evaluate(() => {
            practice2State.startingRow = null;
            practice2SyncRecordingUI();
        });
        eq(await copyButtons.nth(0).isEnabled(), true, 'Button re-enabled after recording ends');

        eq(errors.length, 0, 'No page errors');
        console.log(`tests/copy23.cjs passed (${checks} checks)`);
    } finally {
        await browser.close();
    }
})();
