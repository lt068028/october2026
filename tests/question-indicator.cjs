// Structural regression tests for Question Indicator in Practice 1.1 and Practice 1.2.
const {chromium} = require('playwright'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..');

(async () => {
    const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
    let checks = 0;
    const check = (a, b, label) => { assert.deepEqual(a, b, label); checks++; };

    const page = await browser.newPage({viewport: {width: 1440, height: 900}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.route('http://qi.test/**', r => {
        const f = path.join(root, new URL(r.request().url()).pathname);
        if (!fs.existsSync(f)) return r.fulfill({status: 404, body: ''});
        r.fulfill({
            body: fs.readFileSync(f),
            contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : 'image/png'
        });
    });

    // 1. Practice 1.1: exactly 0 question indicators
    await page.goto('http://qi.test/practice1.1.html');
    const p11Count = await page.locator('.question-indicator').count();
    check(p11Count, 0, 'Practice 1.1 has 0 question indicators');

    // 2. Practice 1.2: exactly 8 indicators (5 in Drill 1, 3 in Drill 2)
    await page.goto('http://qi.test/practice1.2.html');
    const p12Total = await page.locator('.question-indicator').count();
    check(p12Total, 8, 'Practice 1.2 has exactly 8 question indicators total');

    const d1Count = await page.locator('#drill1Container .question-indicator').count();
    check(d1Count, 5, 'Practice 1.2 Drill 1 has 5 question indicators');

    const d2Count = await page.locator('#drill2Container .question-indicator').count();
    check(d2Count, 3, 'Practice 1.2 Drill 2 has 3 question indicators');

    // No indicators in Examples
    const exampleCount = await page.locator('.example-box .question-indicator').count();
    check(exampleCount, 0, 'No question indicators in Examples');

    // No indicators in Answer rows
    const answerIndicatorCount = await page.locator('tr:has(.drill-number-cell:empty) .question-indicator').count();
    check(answerIndicatorCount, 0, 'No question indicators in answer rows');

    // Each indicator is wrapped with its stop button in .stop-indicator-wrap
    const wrapCount = await page.locator('.stop-indicator-wrap:has(.question-indicator)').count();
    check(wrapCount, 8, 'All 8 indicators are wrapped with stop buttons in .stop-indicator-wrap');

    // Attributes check: noninteractive & 16px
    const attrs = await page.locator('.question-indicator').first().evaluate(el => {
        const svg = el.querySelector('svg');
        const style = window.getComputedStyle(el);
        return {
            ariaHidden: el.getAttribute('aria-hidden'),
            pointerEvents: style.pointerEvents,
            svgWidth: svg?.getAttribute('width'),
            svgHeight: svg?.getAttribute('height')
        };
    });
    check(attrs.ariaHidden, 'true', 'Indicator has aria-hidden=true');
    check(attrs.pointerEvents, 'none', 'Indicator has pointer-events=none');
    check(attrs.svgWidth, '16', 'Indicator SVG width is 16');
    check(attrs.svgHeight, '16', 'Indicator SVG height is 16');

    // 3. Rerendering & settings switching: no duplicates
    for (const script of ['hiragana', 'kanji']) {
        await page.locator(`#scriptModeControl [data-value="${script}"]`).click();
        const count = await page.locator('.question-indicator').count();
        check(count, 8, `Count remains 8 after switching to script=${script}`);
    }

    for (const vocab of ['off', 'hover', 'paren']) {
        await page.locator(`#hintModeControl [data-value="${vocab}"]`).click();
        const count = await page.locator('.question-indicator').count();
        check(count, 8, `Count remains 8 after switching to vocab=${vocab}`);
    }

    // 4. Narrow viewport (375px) check: no overflow, stop button and indicator remain together
    await page.setViewportSize({width: 375, height: 667});
    const layout = await page.locator('.stop-indicator-wrap').first().evaluate(wrap => {
        const btn = wrap.querySelector('button');
        const icon = wrap.querySelector('.question-indicator');
        const btnRect = btn.getBoundingClientRect();
        const iconRect = icon.getBoundingClientRect();
        return {
            sameTop: Math.abs(btnRect.top - iconRect.top) < 15,
            iconRightOfBtn: iconRect.left >= btnRect.right - 1
        };
    });
    check(layout.sameTop, true, 'Stop button and indicator are on the same line at 375px');
    check(layout.iconRightOfBtn, true, 'Indicator is positioned immediately to the right of stop button');

    check(errors, [], 'No runtime errors');
    await browser.close();
    console.log('PASS Question Indicator tests:', checks);
})().catch(e => {
    console.error(e);
    process.exit(1);
});
