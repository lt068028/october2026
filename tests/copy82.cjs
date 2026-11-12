const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'practice8.2.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'practice8.2.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks += 1; };
const eq = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks += 1; };
const count = (text, pattern) => (text.match(pattern) || []).length;

ok(count(js, /const COPY82_HEADERS = \[/g) === 1, 'one stable Copy header definition');
ok(js.includes('Copy my sentences'), 'Copy button label');
ok(count(js, /Copy your drill results to review or share\./g) === 1, 'one Copy helper text');
ok(js.includes('saved.get(keyFor(r))'), 'Copy reads the existing saved recording map');
ok(js.includes("typeof raw !== 'string' || !raw.trim()"), 'blank transcripts are excluded');
ok(js.includes('if (r.pending) return'), 'pending Drill 3 answers are excluded');
ok(js.includes('Boolean(session || preparing)'), 'recording/preparation disables Copy');
ok(css.includes('.practice82-page .p82-copy-area'), 'Practice 8.2-specific Copy CSS exists');
ok(!css.includes('.practice82-page .p81-copy-area'), '8.1 Copy selectors are not reused for 8.2');

const audio = fs.readFileSync(path.join(__dirname, 'audio-relay.cjs'), 'utf8');
const mock = audio.slice(audio.indexOf('function mock()'), audio.indexOf('(async()=>'));

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox']
    });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript('(' + mock.trim() + ')();');
        await page.addInitScript(() => {
            window.copied = [];
            window.denyCopy = false;
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: {
                    writeText: async text => {
                        if (window.denyCopy) throw new Error('Denied');
                        window.copied.push(text);
                    }
                }
            });
        });
        await page.route('http://copy82.test/**', route => {
            const file = path.join(root, new URL(route.request().url()).pathname);
            if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
            return route.fulfill({
                status: 200,
                body: fs.readFileSync(file),
                contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html'
            });
        });
        await page.goto('http://copy82.test/practice8.2.html');
        await page.clock.setFixedTime(new Date('2026-11-12T12:00:00Z'));

        eq(await page.locator('.p82-copy-area').count(), 4, 'exactly four Copy areas');
        eq(await page.locator('.example-box .p82-copy-area').count(), 0, 'Examples have no Copy areas');
        eq(await page.locator('.p82-copy-area').evaluateAll(areas => areas.map(area => ({
            afterLast: area.previousElementSibling?.classList.contains('p81-card'),
            outsideCard: !area.parentElement?.classList.contains('p81-card'),
            rightAligned: getComputedStyle(area).alignItems === 'flex-end'
        }))), [
            { afterLast: true, outsideCard: true, rightAligned: true },
            { afterLast: true, outsideCard: true, rightAligned: true },
            { afterLast: true, outsideCard: true, rightAligned: true },
            { afterLast: true, outsideCard: true, rightAligned: true }
        ], 'Copy areas are outside and after each final card');
        eq(await page.locator('.p82-copy-button').evaluateAll(buttons => buttons.every(button => button.disabled)), true, 'all buttons initially disabled');

        await page.evaluate(() => {
            const s = window.practice82State;
            const row = s.rowsFor(0)[0][0];
            s.saved.set(s.keyFor(row), { raw: '授業で、何か、話しますか。', correct: true, url: 'blob:d1' });
            s.sync();
        });
        eq(await page.locator('#drill1 .p82-copy-button').isEnabled(), true, 'valid raw STT enables Drill 1');
        eq(await page.locator('#drill2 .p82-copy-button').isDisabled(), true, 'other Drills remain disabled');
        await page.locator('#drill1 .p82-copy-button').click();
        eq(await page.evaluate(() => window.copied.at(-1)), 'Practice 8.2 — Drill 1: 何か — Questions — Unspecified item — 2026-11-12\n1. — 授業で、何か、話しますか。', 'exact raw clipboard output');
        ok(!(await page.evaluate(() => window.copied.at(-1))).includes('飲みます'), 'model sentence is excluded');

        await page.evaluate(() => {
            const s = window.practice82State;
            const row = s.rowsFor(0)[1][0];
            s.saved.set(s.keyFor(row), { raw: '   ', correct: true, url: 'blob:blank' });
            s.sync();
        });
        eq(await page.locator('#drill1 .p82-copy-button').isEnabled(), true, 'blank transcript does not erase valid enabled state');

        await page.locator('[data-response="yn-0-a"][data-answer="no"]').click();
        await page.evaluate(() => {
            const s = window.practice82State;
            const rows = s.rowsFor(2)[0];
            s.saved.set(s.keyFor(rows[0]), { raw: '誕生日に、何か、しますか。', correct: true, url: 'blob:q' });
            s.saved.set(s.keyFor(rows[1]), { raw: 'いいえ、何も、しません。', correct: false, url: 'blob:no' });
            s.sync();
        });
        eq(await page.locator('#drill3 .p82-copy-button').isEnabled(), true, 'selected Drill 3 response enables Copy');
        await page.locator('#drill3 .p82-copy-button').click();
        let copied = await page.evaluate(() => window.copied.at(-1));
        ok(copied.includes('A: — いいえ、何も、しません。'), 'selected No response is copied with role and marker');
        await page.locator('[data-response="yn-0-a"][data-answer="yes"]').click();
        await page.evaluate(() => {
            const s = window.practice82State;
            const rows = s.rowsFor(2)[0];
            s.saved.set(s.keyFor(rows[1]), { raw: 'はい、します。', correct: true, url: 'blob:yes' });
            s.sync();
        });
        await page.locator('#drill3 .p82-copy-button').click();
        copied = await page.evaluate(() => window.copied.at(-1));
        ok(copied.includes('A: ✅ はい、します。') && !copied.includes('いいえ、何も、しません。'), 'Yes/No switching excludes stale response');

        for (const selector of [
            '#scriptModeControl [data-value="hiragana"]',
            '#speechStyleControl [data-value="casual"]',
            '#hintModeControl [data-value="off"]'
        ]) {
            await page.locator(selector).click();
            eq(await page.locator('.p82-copy-area').count(), 4, 'settings changes do not duplicate Copy areas');
            eq(await page.locator('#drill1 .p82-copy-button').isEnabled(), true, 'settings changes retain transcript state');
        }

        await page.evaluate(() => { window.denyCopy = true; });
        await page.locator('#drill1 .p82-copy-button').click();
        eq(await page.locator('#drill1 .p82-copy-status').textContent(), 'Could not copy. Please allow clipboard access.', 'clipboard failure feedback');
        ok(!(await page.locator('#drill1 .p82-copy-status').textContent()).includes('Copied!'), 'clipboard failure is not reported as success');

        for (const width of [375, 600, 1440]) {
            for (const scheme of ['light', 'dark']) {
                await page.setViewportSize({ width, height: 1100 });
                await page.emulateMedia({ colorScheme: scheme });
                await page.evaluate(() => new Promise(requestAnimationFrame));
                ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal overflow at ' + width + '/' + scheme);
            }
        }
        eq(errors, [], 'no page errors');
        console.log('PASS Practice 8.2 Copy browser contract', checks);
    } finally {
        await browser.close();
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
