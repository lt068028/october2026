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
            if (u.hostname !== 'copy81.test') return route.abort();
            const f = path.join(root, u.pathname);
            return route.fulfill({
                status: fs.existsSync(f) ? 200 : 404,
                body: fs.existsSync(f) ? fs.readFileSync(f) : '',
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });

        await page.goto('http://copy81.test/practice8.1.html');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));

        const copyButtons = page.locator('.p81-copy-button');
        eq(await copyButtons.count(), 5, '5 copy buttons exist in Practice 8.1');

        // 7. 独立status通知が表示されない
        eq(await page.locator('.p81-copy-status').count(), 0, 'No .p81-copy-status elements in DOM');

        // 8. 説明文が維持される
        const helpTexts = await page.locator('.p81-copy-help').allTextContents();
        eq(helpTexts.length, 5, '5 copy help elements');
        helpTexts.forEach((text, i) => {
            eq(text, 'Copy your drill results to review or share.', `help text for area ${i}`);
        });

        // 10. コピー対象なしの場合の無効化
        for (let i = 0; i < 5; i++) {
            eq(await copyButtons.nth(i).isDisabled(), true, `Button ${i} disabled initially`);
        }

        // Populate saved results for Drill 1 (si = 0) and Drill 2 (si = 1)
        await page.evaluate(() => {
            const { saved, render } = window.practice81State;
            // Drill 1 entries
            saved.set('compare-0-noun:fixed', { raw: '魚が好きです。', correct: true, refs: [] });
            saved.set('compare-0-action:fixed', { raw: '魚を食べるのが好きです。', correct: false, refs: ['魚を食べるのが好きです。'] });
            // Drill 2 entry
            saved.set('self-0-question:fixed', { raw: 'スポーツが好きですか。', correct: true, refs: [] });
            render();
        });
        await page.waitForTimeout(100);

        eq(await copyButtons.nth(0).isEnabled(), true, 'Drill 1 button enabled with results');
        eq(await copyButtons.nth(1).isEnabled(), true, 'Drill 2 button enabled with results');
        eq(await copyButtons.nth(2).isDisabled(), true, 'Drill 3 button remains disabled');

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
        ok(iconInfo.svgClass.includes('p81-copy-icon'), 'SVG has p81-copy-icon');
        eq(iconInfo.spanText, 'Copy my sentences', 'Initial span label');

        // 1. コピー成功時、クリックしたボタンだけが `Copied` になる
        // 4. 複数ボタンが独立して動作する
        await copyButtons.nth(0).click();
        const labelsAfterClick0 = await copyButtons.evaluateAll(btns =>
            btns.map(b => b.querySelector('span')?.textContent)
        );
        eq(labelsAfterClick0, ['Copied', 'Copy my sentences', 'Copy my sentences', 'Copy my sentences', 'Copy my sentences'], 'Only clicked button becomes Copied');

        // 9. コピー内容・順序・判定マーカーが従来どおりである
        const copiedList = await page.evaluate(() => window.copied);
        eq(copiedList.length, 1, 'One copied entry');
        eq(copiedList[0], 'Practice 8.1 — Drill 1: Nounが、すき ↔ Verbのが、すき — Noun vs. Verb＋の — 2026-11-15\n1. ✅ 魚が好きです。\n1. — 魚を食べるのが好きです。', 'Drill 1 copied text format');

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

        // Click button 1 (Drill 2)
        await copyButtons.nth(1).click();
        eq(await copyButtons.nth(1).locator('span').textContent(), 'Copied', 'Drill 2 button becomes Copied');
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'Drill 1 button unaffected');
        await page.clock.fastForward(2100);
        eq(await copyButtons.nth(1).locator('span').textContent(), 'Copy my sentences', 'Drill 2 button reverts');

        // 6. コピー失敗時には `Copied` にならない
        await page.evaluate(() => { window.denyCopy = true; });
        await copyButtons.nth(0).click();
        eq(await copyButtons.nth(0).locator('span').textContent(), 'Copy my sentences', 'clipboard failure retains button label');

        // 10. 録音中のボタン無効化
        await page.evaluate(() => {
            window.denyCopy = false;
        });
        const rec = page.locator('#drill1 .recording-actions button').nth(1);
        await rec.click();
        eq(await copyButtons.evaluateAll(bs => bs.every(b => b.disabled)), true, 'Copy disabled while preparing/recording');
        await page.locator('#drill1 .recording-actions button').nth(2).click().catch(() => {});
        await page.waitForTimeout(100);

        eq(errors, [], 'no runtime errors');
        console.log('PASS Practice 8.1 Copy contract', checks);
    } finally {
        await browser.close();
    }
})().catch(e => {
    console.error(e);
    process.exitCode = 1;
});
