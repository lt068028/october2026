// Tests for English Cues functionality across newly expanded Practice pages (1.2, 8.1, 8.3)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => {
        console.error('PAGEERROR:', e.message);
        errors.push(e.message);
    });
    page.on('console', msg => {
        if (msg.type() === 'error') console.error('PAGECONSOLE:', msg.text());
    });

    await page.route('http://local.test/**', route => {
        const urlPath = new URL(route.request().url()).pathname;
        const filePath = path.join(root, urlPath);
        if (!fs.existsSync(filePath)) {
            return route.fulfill({ status: 404, body: '' });
        }
        const content = fs.readFileSync(filePath);
        const contentType = filePath.endsWith('.js')
            ? 'text/javascript'
            : filePath.endsWith('.css')
                ? 'text/css'
                : filePath.endsWith('.json')
                    ? 'application/json'
                    : 'text/html';
        return route.fulfill({ body: content, contentType });
    });

    let checks = 0;

    const targets = [
        {
            file: 'practice1.2.html',
            buttonSelector: '#drill3Container .drill-cue-button',
            drillCueSelector: '#drill1Container .drill-cue-cell',
            englishSample: 'older brother / student',
            panelTitle: 'Drill 3: Practice with English cues'
        },
        {
            file: 'practice8.1.html',
            buttonSelector: '#drill6Container .drill-cue-button',
            drillCueSelector: '#drill1 .drill-cue-cell .p81-cue-words',
            englishSample: 'book',
            panelTitle: 'Drill 6: Practice with English cues'
        },
        {
            file: 'practice8.3.html',
            buttonSelector: '#drill5Container .drill-cue-button',
            drillCueSelector: '#drill1 .drill-cue-cell .p81-cue-words',
            englishSample: 'who / help',
            panelTitle: 'Drill 5: Practice with English cues'
        }
    ];

    for (const target of targets) {
        console.log(`Testing English Cues on ${target.file}...`);

        for (const width of [375, 600, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(`http://local.test/${target.file}`);
            await page.waitForLoadState('domcontentloaded');

            const button = page.locator(target.buttonSelector);
            await button.waitFor({ state: 'attached', timeout: 10000 });

            // 1. Initial state (English cues OFF)
            assert.equal(await button.getAttribute('aria-pressed'), 'false', `${target.file} initial aria-pressed must be false`);
            assert.ok((await button.textContent()).includes('Display English Cues'), `${target.file} initial text`);
            assert.ok(!await button.evaluate(el => el.classList.contains('is-english')), `${target.file} initial class`);
            checks += 3;

            // Panel title verification
            const panel = page.locator(target.buttonSelector).locator('xpath=ancestor::section[contains(@class, "drill-cue-panel")]');
            const title = await panel.locator('.drill-cue-title').textContent();
            assert.equal(title, target.panelTitle, `${target.file} panel title match`);
            checks++;

            // 2. Click to toggle English cues ON
            await button.click();
            await page.waitForTimeout(300);

            assert.equal(await button.getAttribute('aria-pressed'), 'true', `${target.file} active aria-pressed must be true`);
            assert.ok((await button.textContent()).includes('Display Japanese Cues'), `${target.file} active text`);
            assert.ok(await button.evaluate(el => el.classList.contains('is-english')), `${target.file} active class`);
            checks += 3;

            // 3. Verify English cue content is present in drill
            const firstDrillCue = await page.locator(target.drillCueSelector).first().textContent();
            assert.ok(
                firstDrillCue.includes(target.englishSample),
                `${target.file} cue text should contain "${target.englishSample}", got: "${firstDrillCue}"`
            );
            checks++;

            // 4. Click to toggle English cues OFF
            await button.click();
            await page.waitForTimeout(300);

            assert.equal(await button.getAttribute('aria-pressed'), 'false', `${target.file} restored aria-pressed must be false`);
            assert.ok((await button.textContent()).includes('Display English Cues'), `${target.file} restored text`);
            checks += 2;

            // 5. Check no horizontal overflow at this viewport
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 5);
            assert.ok(!overflow, `${target.file} horizontal overflow check at width ${width}px`);
            checks++;
        }
    }

    assert.deepEqual(errors, [], `Unexpected page errors: ${errors.join(', ')}`);
    checks++;

    console.log(`ALL ENGLISH CUES TESTS PASSED (${checks} checks across 3 pages)!`);
    await browser.close();
})().catch(err => {
    console.error(err);
    process.exit(1);
});
