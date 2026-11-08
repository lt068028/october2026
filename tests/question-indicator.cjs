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

    // 5. Practice 2.1
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto('http://qi.test/practice2.1.html');
    // Default sets: D1 Set 1 (0), D2 Set 1 (3), D3 Set 1 (2), D4 (0) -> visible: 5
    check(await page.locator('#drill1Container .question-indicator').count(), 0, 'Practice 2.1 D1 Set 1 has 0 indicators');
    check(await page.locator('#drill2Container .question-indicator').count(), 3, 'Practice 2.1 D2 Set 1 has 3 indicators');
    check(await page.locator('#drill3Container .question-indicator').count(), 2, 'Practice 2.1 D3 Set 1 has 2 indicators');
    check(await page.locator('#drill4Container .question-indicator').count(), 0, 'Practice 2.1 D4 English cues panel has 0 indicators');
    check(await page.locator('.example-box .question-indicator').count(), 0, 'Practice 2.1 Examples have 0 indicators');
    check(await page.locator('.question-indicator').count(), 5, 'Practice 2.1 default visible indicators count is 5');

    // Switch D1 to Set 2 (dialogue practice: 3 interrogatives)
    await page.locator('[data-set-state="speakerPracticeSet"] button:nth-child(2)').click();
    check(await page.locator('#drill1Container .question-indicator').count(), 3, 'Practice 2.1 D1 Set 2 has 3 indicators');

    // Switch D2 to Set 2 (3 interrogatives)
    await page.locator('[data-set-state="namingSet"] button:nth-child(2)').click();
    check(await page.locator('#drill2Container .question-indicator').count(), 3, 'Practice 2.1 D2 Set 2 has 3 indicators');

    // Switch D3 to Set 2 (2 interrogatives)
    await page.locator('[data-set-state="choosingSet"] button:nth-child(2)').click();
    check(await page.locator('#drill3Container .question-indicator').count(), 2, 'Practice 2.1 D3 Set 2 has 2 indicators');

    // Wrap check in 2.1
    const p21WrapCount = await page.locator('.stop-indicator-wrap:has(.question-indicator)').count();
    const p21TotalVisible = await page.locator('.question-indicator').count();
    check(p21WrapCount, p21TotalVisible, 'All visible indicators in Practice 2.1 are wrapped with stop buttons');

    // 6. Practice 2.2
    await page.goto('http://qi.test/practice2.2.html');
    // Default sets: D1 (0), D2 (3), D3 (3), D4 (3), D5 (3), English cues panel (0) -> visible: 12
    check(await page.locator('#drill1Container .question-indicator').count(), 0, 'Practice 2.2 D1 Set 1 has 0 indicators');
    check(await page.locator('#drill2Container .question-indicator').count(), 3, 'Practice 2.2 D2 Set 1 has 3 indicators');
    check(await page.locator('#drill3Container .question-indicator').count(), 3, 'Practice 2.2 D3 Set 1 has 3 indicators');
    check(await page.locator('#drill4Container .question-indicator').count(), 3, 'Practice 2.2 D4 Set 1 has 3 indicators');
    check(await page.locator('#drill5Container .question-indicator').count(), 3, 'Practice 2.2 D5 Set 1 has 3 indicators');
    check(await page.locator('.example-box .question-indicator').count(), 0, 'Practice 2.2 Examples have 0 indicators');
    check(await page.locator('.drill-cue-panel .question-indicator').count(), 0, 'Practice 2.2 English cues panel has 0 indicators');
    check(await page.locator('.question-indicator').count(), 12, 'Practice 2.2 default visible indicators count is 12');

    // Switch D1 to Set 2: still 0
    await page.locator('[data-set-state="describeSet"] button:nth-child(2)').click();
    check(await page.locator('#drill1Container .question-indicator').count(), 0, 'Practice 2.2 D1 Set 2 has 0 indicators');

    // Switch D2 to Set 2: 3 indicators
    await page.locator('[data-set-state="priceDialogueSet"] button:nth-child(2)').click();
    check(await page.locator('#drill2Container .question-indicator').count(), 3, 'Practice 2.2 D2 Set 2 has 3 indicators');

    // Switch D3 to Set 2: 3 indicators
    await page.locator('[data-set-state="choosingSet"] button:nth-child(2)').click();
    check(await page.locator('#drill3Container .question-indicator').count(), 3, 'Practice 2.2 D3 Set 2 has 3 indicators');

    // Switch D4 to Set 2: 3 indicators
    await page.locator('[data-set-state="peopleConversationSet"] button:nth-child(2)').click();
    check(await page.locator('#drill4Container .question-indicator').count(), 3, 'Practice 2.2 D4 Set 2 has 3 indicators');

    // Switch D5 to Set 2: 3 indicators
    await page.locator('[data-set-state="umbrellaModeSet"] button:nth-child(2)').click();
    check(await page.locator('#drill5Container .question-indicator').count(), 3, 'Practice 2.2 D5 Set 2 has 3 indicators');

    // Wrap check in 2.2
    const p22WrapCount = await page.locator('.stop-indicator-wrap:has(.question-indicator)').count();
    const p22TotalVisible = await page.locator('.question-indicator').count();
    check(p22WrapCount, p22TotalVisible, 'All visible indicators in Practice 2.2 are wrapped with stop buttons');

    // 7. Practice 2.3
    await page.goto('http://qi.test/practice2.3.html');
    // Default sets: D1 Country (0), D2 People (3), D3 Country (3), D4 (0) -> visible: 6
    check(await page.locator('#drill1Container .question-indicator').count(), 0, 'Practice 2.3 D1 Country has 0 indicators');
    check(await page.locator('#drill2Container .question-indicator').count(), 3, 'Practice 2.3 D2 People has 3 indicators');
    check(await page.locator('#drill3Container .question-indicator').count(), 3, 'Practice 2.3 D3 Country has 3 indicators');
    check(await page.locator('#drill4Container .question-indicator').count(), 0, 'Practice 2.3 D4 English cues panel has 0 indicators');
    check(await page.locator('.example-box .question-indicator').count(), 0, 'Practice 2.3 Examples have 0 indicators');
    check(await page.locator('.question-indicator').count(), 6, 'Practice 2.3 default visible indicators count is 6');

    // Switch D1 to Cities (0) and Time (0)
    await page.locator('[data-set-state="cityDrillSet"] button:nth-child(2)').click();
    check(await page.locator('#drill1Container .question-indicator').count(), 0, 'Practice 2.3 D1 Cities has 0 indicators');
    await page.locator('[data-set-state="cityDrillSet"] button:nth-child(3)').click();
    check(await page.locator('#drill1Container .question-indicator').count(), 0, 'Practice 2.3 D1 Time has 0 indicators');

    // Switch D2 to Item1 (4) and Item2 (4)
    await page.locator('[data-set-state="whereDrillSet"] button:nth-child(2)').click();
    check(await page.locator('#drill2Container .question-indicator').count(), 4, 'Practice 2.3 D2 Item 1 has 4 indicators');
    await page.locator('[data-set-state="whereDrillSet"] button:nth-child(3)').click();
    check(await page.locator('#drill2Container .question-indicator').count(), 4, 'Practice 2.3 D2 Item 2 has 4 indicators');

    // Switch D3 to Cities (3), Time (3), Day (3)
    await page.locator('[data-set-state="cityDialogueSet"] button:nth-child(2)').click();
    check(await page.locator('#drill3Container .question-indicator').count(), 3, 'Practice 2.3 D3 Cities has 3 indicators');
    await page.locator('[data-set-state="cityDialogueSet"] button:nth-child(3)').click();
    check(await page.locator('#drill3Container .question-indicator').count(), 3, 'Practice 2.3 D3 Time has 3 indicators');
    await page.locator('[data-set-state="cityDialogueSet"] button:nth-child(4)').click();
    check(await page.locator('#drill3Container .question-indicator').count(), 3, 'Practice 2.3 D3 Day has 3 indicators');

    // Wrap check in 2.3
    const p23WrapCount = await page.locator('.stop-indicator-wrap:has(.question-indicator)').count();
    const p23TotalVisible = await page.locator('.question-indicator').count();
    check(p23WrapCount, p23TotalVisible, 'All visible indicators in Practice 2.3 are wrapped with stop buttons');

    check(errors, [], 'No runtime errors');
    await browser.close();
    console.log('PASS Question Indicator tests:', checks);
})().catch(e => {
    console.error(e);
    process.exit(1);
});
