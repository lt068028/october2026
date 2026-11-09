// Tests for English Cues functionality across newly expanded Practice pages (1.2, 8.1, 8.3)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        headless: true,
        args: ['--no-sandbox']
    });

    let checks = 0;

    async function openPage(context, pageName, width) {
        const page = await context.newPage();
        await page.setViewportSize({ width, height: 900 });

        const errors = [];
        page.on('pageerror', e => {
            console.error(`PAGEERROR (${pageName}):`, e.message);
            errors.push(e.message);
        });

        await page.route('http://drill.test/**', route => {
            const file = path.join(root, new URL(route.request().url()).pathname);
            if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
            return route.fulfill({
                body: fs.readFileSync(file),
                contentType: file.endsWith('.js')
                    ? 'text/javascript'
                    : file.endsWith('.css')
                        ? 'text/css'
                        : file.endsWith('.json')
                            ? 'application/json'
                            : 'text/html'
            });
        });

        await page.goto(`http://drill.test/${pageName}.html`);
        page.__errors = errors;
        return page;
    }

    const targets = [
        {
            name: 'practice1.2',
            buttonSelector: '#drill3Container .drill-cue-button',
            drillCueSelector: '#drill1Container .drill-cue-cell',
            englishSample: 'older brother / student',
            panelTitle: 'Drill 3: Practice with English cues'
        },
        {
            name: 'practice8.1',
            buttonSelector: '#drill6Container .drill-cue-button',
            drillCueSelector: '#drill1 .drill-cue-cell .p81-cue-words',
            englishSample: 'book',
            panelTitle: 'Drill 6: Practice with English cues'
        },
        {
            name: 'practice8.3',
            buttonSelector: '#drill5Container .drill-cue-button',
            drillCueSelector: '#drill1 .drill-cue-cell .p81-cue-words',
            englishSample: 'who / help',
            panelTitle: 'Drill 5: Practice with English cues'
        }
    ];

    for (const target of targets) {
        console.log(`Testing English Cues on ${target.name}...`);

        for (const width of [375, 600, 1440]) {
            const context = await browser.newContext();
            const page = await openPage(context, target.name, width);

            const button = page.locator(target.buttonSelector);
            await button.waitFor({ state: 'attached', timeout: 10000 });

            // 1. Initial state (English cues OFF)
            assert.equal(await button.getAttribute('aria-pressed'), 'false', `${target.name} initial aria-pressed must be false`);
            assert.ok((await button.textContent()).includes('Display English Cues'), `${target.name} initial text`);
            assert.ok(!await button.evaluate(el => el.classList.contains('is-english')), `${target.name} initial class`);
            checks += 3;

            // Panel title verification
            const panel = page.locator(target.buttonSelector).locator('xpath=ancestor::section[contains(@class, "drill-cue-panel")]');
            const title = await panel.locator('.drill-cue-title').textContent();
            assert.equal(title, target.panelTitle, `${target.name} panel title match`);
            checks++;

            // 2. Click to toggle English cues ON
            await button.click();
            await page.waitForTimeout(300);

            assert.equal(await button.getAttribute('aria-pressed'), 'true', `${target.name} active aria-pressed must be true`);
            assert.ok((await button.textContent()).includes('Display Japanese Cues'), `${target.name} active text`);
            assert.ok(await button.evaluate(el => el.classList.contains('is-english')), `${target.name} active class`);
            checks += 3;

            // 3. Verify English cue content is present in drill
            const firstDrillCue = await page.locator(target.drillCueSelector).first().textContent();
            assert.ok(
                firstDrillCue.includes(target.englishSample),
                `${target.name} cue text should contain "${target.englishSample}", got: "${firstDrillCue}"`
            );
            checks++;

            // 4. Click to toggle English cues OFF
            await button.click();
            await page.waitForTimeout(300);

            assert.equal(await button.getAttribute('aria-pressed'), 'false', `${target.name} restored aria-pressed must be false`);
            assert.ok((await button.textContent()).includes('Display English Cues'), `${target.name} restored text`);
            checks += 2;

            // 5. Check no horizontal overflow at this viewport
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 5);
            assert.ok(!overflow, `${target.name} horizontal overflow check at width ${width}px`);
            checks++;

            assert.deepEqual(page.__errors, [], `Unexpected page errors on ${target.name}: ${page.__errors.join(', ')}`);
            checks++;

            await context.close();
        }
    }

    console.log(`ALL ENGLISH CUES TESTS PASSED (${checks} checks across 3 pages)!`);
    await browser.close();
})().catch(err => {
    console.error(err);
    process.exit(1);
});
