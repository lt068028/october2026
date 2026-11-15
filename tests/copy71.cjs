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
            if (u.hostname !== 'copy71.test') return route.abort();
            const f = path.join(root, u.pathname);
            return route.fulfill({
                status: fs.existsSync(f) ? 200 : 404,
                body: fs.existsSync(f) ? fs.readFileSync(f) : '',
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });

        await page.goto('http://copy71.test/practice7.1.html');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));

        const copyButtons = page.locator('.p71-copy-button');
        eq(await copyButtons.count(), 2, '2 copy buttons exist (main and qa)');

        // 7. 独立status通知が表示されない
        eq(await page.locator('.p71-copy-status').count(), 0, 'No .p71-copy-status elements in DOM');

        // 8. 説明文が維持される
        const helpTexts = await page.locator('.p71-copy-help').allTextContents();
        eq(helpTexts.length, 2, '2 copy help elements');
        helpTexts.forEach((text, i) => {
            eq(text, 'Copy your drill results to review or share.', `help text for area ${i}`);
        });

        // 10. コピー対象なしの場合の無効化
        eq(await copyButtons.nth(0).isDisabled(), true, 'main button disabled initially');
        eq(await copyButtons.nth(1).isDisabled(), true, 'qa button disabled initially');

        // Populate saved results
        await page.evaluate(() => {
            const result = (rawTranscript, isCorrect) => ({
                rawTranscript,
                modelText: 'モデル',
                expectedText: 'モデル',
                isCorrect
            });
            Object.assign(practice71State.savedResults, {
                p7_drill_past_0: result('昨日本を読みました', true),
                p7_drill_perf_0: result('今本を読んでいません', false),
                p71_d2_0_q: result('何をしていますか', true),
                p71_d2_0_yes: result('本を読んでいます', true)
            });
            renderAll();
        });
        await page.waitForTimeout(100);

        eq(await copyButtons.nth(0).isEnabled(), true, 'main button enabled with results');
        eq(await copyButtons.nth(1).isEnabled(), true, 'qa button enabled with results');

        // 2. Clipboardアイコンが維持される
        const iconInfo = await copyButtons.first().evaluate(btn => {
            const svg = btn.querySelector('svg');
            const span = btn.querySelector('span');
            return {
                hasSvg: !!svg,
                svgClass: svg ? svg.className.baseVal || svg.getAttribute('class') : null,
                spanText: span ? span.textContent : null
            };
        });
        ok(iconInfo.hasSvg, 'Clipboard SVG exists in button');
        ok(iconInfo.svgClass.includes('p71-copy-icon'), 'SVG has p71-copy-icon');
        eq(iconInfo.spanText, 'Copy my sentences', 'Initial span label');

        // 1. コピー成功時、クリックしたボタンだけが `Copied` になる
        // 4. 複数ボタンが独立して動作する
        await copyButtons.nth(0).click();
        const labelsAfterClick0 = await copyButtons.evaluateAll(btns =>
            btns.map(b => b.querySelector('span')?.textContent)
        );
        eq(labelsAfterClick0, ['Copied', 'Copy my sentences'], 'Only clicked button becomes Copied');

        // 9. コピー内容・順序・判定マーカーが従来どおりである
        const copiedList = await page.evaluate(() => window.copied);
        eq(copiedList.length, 1, 'One copied entry');
        eq(copiedList[0], 'Practice 7.1 — Drill 1: Compare Habit & Ongoing — いつも～ています／今～ています — 2026-11-15\n1. Habit: ✅ 昨日本を読みました\n1. Ongoing: — 今本を読んでいません', 'main copied text format');

        // 3. 2秒後に元のラベルへ戻る
        await page.clock.fastForward(1000);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'still Copied at 1s');
        await page.clock.fastForward(1100);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'reverts to Copy my sentences at 2.1s');

        // 5. 同じボタンの連続クリックでタイマーが正しくリセットされる
        await copyButtons.nth(0).click();
        await page.clock.fastForward(1000);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'Copied at 1s');
        await copyButtons.nth(0).click(); // Click again
        await page.clock.fastForward(1500);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copied', 'still Copied 1.5s after consecutive click');
        await page.clock.fastForward(600);
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'reverts 2.1s after consecutive click');

        // Select Yes on Question 1
        await page.locator('#practice71QuestionSection .drill-row').first().locator('.answer-choice[data-answer="yes"]').click();

        // Click button 1 (qa)
        await copyButtons.nth(1).click();
        eq(await copyButtons.nth(1).locator('span').textContent(), 'Copied', 'qa button becomes Copied');
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'main button remains unaffected');
        const copiedQA = await page.evaluate(() => window.copied.at(-1));
        eq(copiedQA, 'Practice 7.1 — Drill 2: Ask and answer — 今～ていますか — 2026-11-15\n1. Q: ✅ 何をしていますか\n1. A: ✅ 本を読んでいます', 'qa copied text format');
        await page.clock.fastForward(2100);
        eq(await copyButtons.nth(1).locator('span').textContent(), 'Copy my sentences', 'qa button reverts');

        // 6. コピー失敗時には `Copied` にならない
        await page.evaluate(() => { window.denyCopy = true; });
        await copyButtons.nth(0).click();
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'clipboard failure retains button label');

        // 10. 録音中のボタン無効化
        await page.evaluate(() => {
            window.denyCopy = false;
            practice71State.startingRow = 'p7_drill_past_0';
            practice71SyncRecordingUI();
        });
        await page.waitForTimeout(50);
        eq(await copyButtons.nth(0).isDisabled(), true, 'busy locks main button');
        eq(await copyButtons.nth(1).isDisabled(), true, 'busy locks qa button');

        await page.evaluate(() => {
            practice71State.startingRow = null;
            practice71SyncRecordingUI();
        });
        await page.waitForTimeout(50);
        eq(await copyButtons.nth(0).isEnabled(), true, 'idle unlocks main button');
        eq(await copyButtons.nth(1).isEnabled(), true, 'idle unlocks qa button');

        eq(errors, [], 'no runtime errors');
        console.log('PASS Practice 7.1 Copy contract', checks);
    } finally {
        await browser.close();
    }
})().catch(e => {
    console.error(e);
    process.exitCode = 1;
});
