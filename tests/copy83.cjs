const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'practice8.3.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'practice8.3.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks += 1; };
const eq = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks += 1; };

ok((js.match(/const COPY83_HEADERS = \[/g) || []).length === 1, 'one stable Copy header definition');
ok(js.includes('entriesFor83'), 'Practice 8.3 collector exists');
ok(js.includes('saved.get(keyFor(r))'), 'Copy reads saved recordings');
ok(js.includes("typeof raw !== 'string' || !raw.trim()"), 'blank transcripts are excluded');
ok(js.includes('Boolean(session || preparing)'), 'recording/preparation disables Copy');
ok(js.includes('FeedbackStatus.clipboardMarker'), 'Copy uses shared feedback marker semantics');
ok(!js.includes("'— '"), 'legacy clipboard dash marker is not used');
ok(css.includes('.practice83-page .p83-copy-area'), 'Practice 8.3-specific CSS exists');
ok(!css.includes('.practice82-page .p83-copy-area'), '8.2 selectors are not reused');

const audio = fs.readFileSync(path.join(__dirname, 'audio-relay.cjs'), 'utf8');
const mock = audio.slice(audio.indexOf('function mock()'), audio.indexOf('(async()=>'));

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript('(' + mock.trim() + ')();');
        await page.addInitScript(() => {
            window.copied = [];
            window.denyCopy = false;
            Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
                writeText: async text => { if (window.denyCopy) throw new Error('Denied'); window.copied.push(text); }
            }});
        });
        await page.route('http://copy83.test/**', route => {
            const file = path.join(root, new URL(route.request().url()).pathname);
            if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
            return route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html' });
        });
        await page.goto('http://copy83.test/practice8.3.html');
        await page.clock.setFixedTime(new Date('2026-11-12T12:00:00Z'));
        eq(await page.evaluate(() => [FeedbackStatus.clipboardMarker({correct:true}), FeedbackStatus.clipboardMarker({correct:false}), FeedbackStatus.clipboardMarker({judgment:'undetermined'})]), ['✅','🔥','👣'], 'shared clipboard marker mapping');

        eq(await page.locator('.p83-copy-area').count(), 4, 'exactly four Copy areas');
        eq(await page.locator('.example-box .p83-copy-area').count(), 0, 'Examples have no Copy areas');
        eq(await page.locator('.p83-copy-area').evaluateAll(areas => areas.map(area => {
            const button = area.querySelector('.p83-copy-button');
            return {
                afterLast: area.previousElementSibling?.classList.contains('p81-card'),
                outsideCard: !area.parentElement?.classList.contains('p81-card'),
                buttonRightAligned: Math.abs(area.getBoundingClientRect().right - button.getBoundingClientRect().right) <= 1
            };
        })), [
            { afterLast: true, outsideCard: true, buttonRightAligned: true },
            { afterLast: true, outsideCard: true, buttonRightAligned: true },
            { afterLast: true, outsideCard: true, buttonRightAligned: true },
            { afterLast: true, outsideCard: true, buttonRightAligned: true }
        ], 'Copy areas are after final cards and right-aligned');
        eq(await page.locator('.p83-copy-button').evaluateAll(bs => bs.every(b => b.disabled)), true, 'initially disabled');

        await page.evaluate(() => {
            const s = window.practice83State;
            const row = s.rowsFor(0)[0][0];
            s.saved.set(s.keyFor(row), { raw: 'だれが、料理しますか。', correct: true, url: 'blob:d1' });
            s.sync();
        });
        eq(await page.locator('#drill1 .p83-copy-button').isEnabled(), true, 'valid raw STT enables only relevant Drill');
        eq(await page.locator('#drill2 .p83-copy-button').isEnabled(), false, 'unrelated Drill remains disabled');
        await page.locator('#drill1 .p83-copy-button').click();
        eq(await page.evaluate(() => window.copied.at(-1)), 'Practice 8.3 — Drill 1: Subject Questions — だれ／何 (Verb) — 2026-11-12\n1. Q: ✅ だれが、料理しますか。', 'raw transcript, date, role, and marker are copied');
        ok(!(await page.evaluate(() => window.copied.at(-1))).match(/<svg|feedback-status|p83-copy-icon/), 'clipboard contains no implementation markup');
        ok(!(await page.evaluate(() => window.copied.at(-1))).includes('料理します。'), 'model answer is excluded');

        await page.evaluate(() => {
            const s = window.practice83State;
            const row = s.rowsFor(0)[1][0];
            s.saved.set(s.keyFor(row), { raw: '   ', correct: true, url: 'blob:blank' });
            s.sync();
        });
        eq(await page.locator('#drill1 .p83-copy-button').isEnabled(), true, 'blank transcript is ignored');

        const before = await page.locator('.p83-copy-area').count();
        await page.locator('#drill1 .p21-set-switcher button').nth(1).click();
        eq(await page.locator('.p83-copy-area').count(), before, 'rerender does not duplicate Copy areas');
        eq(await page.locator('#drill1 .p83-copy-button').isEnabled(), false, 'switching set hides stale recording from other set');

        await page.locator('#drill1 .p21-set-switcher button').first().click();
        eq(await page.locator('.p83-copy-button').count(), 4, 'returning to set preserves one button per Drill');
        await page.evaluate(() => { window.denyCopy = true; });
        await page.locator('#drill1 .p83-copy-button').click();
        eq(await page.locator('#drill1 .p83-copy-status').innerText(), 'Could not copy. Please allow clipboard access.', 'clipboard failure feedback');

        await page.evaluate(() => { window.denyCopy = false; });
        const rec = page.locator('#drill1 .recording-actions button').nth(1);
        await rec.click();
        eq(await page.locator('.p83-copy-button').evaluateAll(bs => bs.every(b => b.disabled)), true, 'Copy disabled while preparing/recording');
        eq(await page.evaluate(() => window.practice83State.busy()), true, 'real recording lifecycle is busy');
        await page.locator('#drill1 .recording-actions button').nth(2).click().catch(() => {});
        await page.waitForTimeout(100);

        for (const width of [375, 600, 1440]) {
            await page.setViewportSize({ width, height: 1100 });
            for (const theme of ['light', 'dark']) {
                await page.emulateMedia({ colorScheme: theme });
                await page.evaluate(() => document.fonts?.ready);
                const diagnostics = await page.evaluate(() => {
                    const viewport = { innerWidth: window.innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth };
                    const nodes = [...document.querySelectorAll('*')].map(element => {
                        const rect = element.getBoundingClientRect();
                        const style = getComputedStyle(element);
                        return {
                            tag: element.tagName, id: element.id, className: String(element.className || ''),
                            left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
                            width: rect.width, height: rect.height,
                            overflowX: style.overflowX, display: style.display, flex: style.flex,
                            gridTemplateColumns: style.gridTemplateColumns, minWidth: style.minWidth,
                            maxWidth: style.maxWidth, whiteSpace: style.whiteSpace
                        };
                    }).filter(node => node.right > window.innerWidth + 0.5 || node.left < -0.5);
                    return { viewport, nodes: nodes.slice(0, 40) };
                });
                if (width === 375 && theme === 'light') {
                    console.log('OVERFLOW_DIAGNOSTICS ' + JSON.stringify(diagnostics));
                    await page.screenshot({ path: 'practice83-375-light-overflow.png', fullPage: true });
                }
                eq(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, width + 'px ' + theme + ' has no horizontal overflow');
            }
        }
        eq(await page.locator('.p83-copy-icon').count(), 4, 'all four clipboard icons are present');
        ok(errors.length === 0, 'no JavaScript page errors');
        console.log('copy83 browser checks passed:', checks);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
