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
            englishSample: 'older brother/student',
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

            // Check Select English cues in Practice 1.2 Drill 2 and Practice 8.1 Drill 4 before toggle
            if (target.name === 'practice1.2') {
                const majorSelect = page.locator('#drill2Container select.custom-select').first();
                if (await majorSelect.count() > 0) {
                    const placeholder = await majorSelect.locator('option[value=""]').textContent();
                    assert.equal(placeholder, 'Select', 'Practice 1.2 Drill 2 placeholder must be "Select"');
                    const jaText = await majorSelect.locator('option[value="けいざい"]').textContent();
                    assert.ok(jaText.includes('経済') || jaText.includes('けいざい'), 'Option must be Japanese when English cues OFF');
                    await majorSelect.selectOption('けいざい');
                    checks += 2;
                }
                // Verify Practice 1.2 Japanese cue uses halfwidth slash with no space
                const jaCue = await page.locator('#drill1Container .drill-cue-cell').first().textContent();
                assert.ok(jaCue.includes('/'), 'Practice 1.2 Japanese cue must use halfwidth slash');
                assert.ok(!jaCue.includes('／'), 'Practice 1.2 Japanese cue must not use fullwidth slash');
                assert.ok(!/\s\/|\/\s/.test(jaCue), 'Practice 1.2 Japanese cue must not have spaces around slash');
                checks += 3;
            } else if (target.name === 'practice8.1') {
                const actSelect = page.locator('#drill4 select.p81-activity-select').first();
                if (await actSelect.count() > 0) {
                    const placeholder = await actSelect.locator('option[value=""]').textContent();
                    assert.equal(placeholder, 'Select', 'Practice 8.1 Drill 4 placeholder must be "Select"');
                    const jaAct = await actSelect.locator('option[value="washDish"]').textContent();
                    assert.ok(jaAct.includes('洗う') || jaAct.includes('皿'), 'Drill 4 activity option must be Japanese when OFF');
                    await actSelect.selectOption('washDish');
                    checks += 2;
                }
            }

            // 2. Click to toggle English cues ON
            await button.click();
            await page.waitForTimeout(300);

            assert.equal(await button.getAttribute('aria-pressed'), 'true', `${target.name} active aria-pressed must be true`);
            assert.ok((await button.textContent()).includes('Display Japanese Cues'), `${target.name} active text`);
            assert.ok(await button.evaluate(el => el.classList.contains('is-english')), `${target.name} active class`);
            checks += 3;

            // Verify Select English cues when ON
            if (target.name === 'practice1.2') {
                const majorSelect = page.locator('#drill2Container select.custom-select').first();
                if (await majorSelect.count() > 0) {
                    const enText = await majorSelect.locator('option[value="けいざい"]').textContent();
                    assert.equal(enText, 'economics', 'Option must be English (economics) when English cues ON');
                    const val = await majorSelect.inputValue();
                    assert.equal(val, 'けいざい', 'Selected value must be preserved across English cues ON toggle');
                    checks += 2;
                }
                // Verify Practice 1.2 English cue slash is halfwidth with no space
                const p12Cue = await page.locator('#drill1Container .drill-cue-cell').first().textContent();
                assert.ok(p12Cue.includes('older brother/student'), 'Drill 1 cue must use compact slash without spaces: older brother/student');
                assert.ok(!p12Cue.includes('older brother / student'), 'Drill 1 cue must not have spaces around slash');
                checks += 2;
            } else if (target.name === 'practice8.1') {
                const actSelect = page.locator('#drill4 select.p81-activity-select').first();
                if (await actSelect.count() > 0) {
                    const enAct = await actSelect.locator('option[value="washDish"]').textContent();
                    assert.ok(enAct.includes('wash dishes'), 'Drill 4 activity option must be English (wash dishes) when ON');
                    const val = await actSelect.inputValue();
                    assert.equal(val, 'washDish', 'Selected activity must be preserved across English cues ON toggle');
                    checks += 2;
                }
                // Verify Drill 4 degree adverbs inherit semantic colors and clean text when English Cues ON
                const d4Adverbs = await page.locator('#drill4 .p81-degree-target .degree-adverb').evaluateAll(els =>
                    els.map(el => ({
                        text: el.textContent.trim(),
                        isPositive: el.classList.contains('degree-positive'),
                        isNegative: el.classList.contains('degree-negative'),
                        weight: getComputedStyle(el).fontWeight
                    }))
                );
                assert.ok(d4Adverbs.length >= 5, 'Drill 4 must have at least 5 degree adverb elements');
                // zenzen
                assert.equal(d4Adverbs[0].text, 'not at all', 'Item 1 adverb must be "not at all" without parentheses');
                assert.ok(d4Adverbs[0].isNegative, 'Item 1 adverb must have degree-negative class');
                // amari
                assert.equal(d4Adverbs[1].text, 'not very', 'Item 2 adverb must be "not very" without parentheses');
                assert.ok(d4Adverbs[1].isNegative, 'Item 2 adverb must have degree-negative class');
                // chotto
                assert.equal(d4Adverbs[2].text, 'a little', 'Item 3 adverb must be "a little"');
                assert.ok(d4Adverbs[2].isPositive, 'Item 3 adverb must have degree-positive class');
                // maamaa
                assert.equal(d4Adverbs[3].text, 'So-so', 'Item 4 adverb must be "So-so"');
                assert.ok(d4Adverbs[3].isPositive, 'Item 4 adverb must have degree-positive class');
                // sugoku
                assert.equal(d4Adverbs[4].text, 'very; really', 'Item 5 adverb must be "very; really"');
                assert.ok(d4Adverbs[4].isPositive, 'Item 5 adverb must have degree-positive class');
                for (const adv of d4Adverbs) {
                    assert.equal(adv.weight, '700', 'Degree adverbs must be bold (700)');
                }
                checks += 12;
                const d5Cards = page.locator('#drill5 .p81-comparison-card');
                const d5Count = await d5Cards.count();
                assert.ok(d5Count >= 7, 'Drill 5 must have 7 comparison cards');
                const d5Layout = await page.locator('#drill5').evaluate(group => {
                    return [...group.querySelectorAll('.p81-comparison-card')].map(card => {
                        const spacer = card.querySelector('.p81-drill-repeat-spacer');
                        const spacerWidth = spacer ? parseFloat(spacer.style.width) || 0 : 0;
                        const selects = [...card.querySelectorAll('select.p81-select')];
                        const sRects = selects.map(s => {
                            const r = s.getBoundingClientRect();
                            return { left: r.left, top: r.top };
                        });
                        const firstWord = card.querySelector('.p81-cue-words[data-repeat-anchor] .target-word');
                        const sameLine = selects.length === 2 && firstWord && Math.abs(selects[0].getBoundingClientRect().top - firstWord.getBoundingClientRect().top) < 8;
                        return { spacerWidth, sRects, sameLine };
                    });
                });
                for (let i = 0; i < d5Layout.length; i++) {
                    const item = d5Layout[i];
                    assert.ok(item.spacerWidth > 0, `Drill 5 card ${i} spacer must have positive width when English Cues ON`);
                    if (width >= 1440 || item.sameLine) {
                        assert.ok(Math.abs(item.sRects[0].left - item.sRects[1].left) < 1, `Drill 5 card ${i} selects must align horizontally when English Cues ON (width=${width})`);
                    }
                }
                // Verify Drill 5 English cues clean and cook (without "to")
                const d5Cues = await page.locator('#drill5 .p81-comparison-card .p81-cue-words[data-repeat-anchor]').allTextContents();
                assert.ok(d5Cues[2].includes('clean') && !d5Cues[2].includes('to clean'), 'Drill 5 item 3 cue must be "clean" without "to"');
                assert.ok(d5Cues[3].includes('cook') && !d5Cues[3].includes('to cook'), 'Drill 5 item 4 cue must be "cook" without "to"');
                checks += 4;
            }

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

            // Verify Select English cues restored to Japanese when OFF
            if (target.name === 'practice1.2') {
                const majorSelect = page.locator('#drill2Container select.custom-select').first();
                if (await majorSelect.count() > 0) {
                    const jaText = await majorSelect.locator('option[value="けいざい"]').textContent();
                    assert.ok(jaText.includes('経済') || jaText.includes('けいざい'), 'Option must be Japanese when English cues restored');
                    const val = await majorSelect.inputValue();
                    assert.equal(val, 'けいざい', 'Selected value must be preserved across English cues OFF toggle');
                    checks += 2;
                }
                // Verify Practice 1.2 restored Japanese cue uses halfwidth slash with no space
                const jaCueRestored = await page.locator('#drill1Container .drill-cue-cell').first().textContent();
                assert.ok(jaCueRestored.includes('/'), 'Practice 1.2 restored Japanese cue must use halfwidth slash');
                assert.ok(!jaCueRestored.includes('／'), 'Practice 1.2 restored Japanese cue must not use fullwidth slash');
                assert.ok(!/\s\/|\/\s/.test(jaCueRestored), 'Practice 1.2 restored Japanese cue must not have spaces around slash');
                checks += 3;
            } else if (target.name === 'practice8.1') {
                const actSelect = page.locator('#drill4 select.p81-activity-select').first();
                if (await actSelect.count() > 0) {
                    const jaAct = await actSelect.locator('option[value="washDish"]').textContent();
                    assert.ok(jaAct.includes('洗う') || jaAct.includes('皿'), 'Drill 4 activity option must be Japanese when restored');
                    const val = await actSelect.inputValue();
                    assert.equal(val, 'washDish', 'Selected activity must be preserved across English cues OFF toggle');
                    checks += 2;
                }
                // Verify Drill 4 Japanese degree adverbs preserved when OFF
                const d4JaAdverbs = await page.locator('#drill4 .p81-degree-target .degree-adverb').evaluateAll(els =>
                    els.map(el => ({
                        text: el.textContent.trim(),
                        isPositive: el.classList.contains('degree-positive'),
                        isNegative: el.classList.contains('degree-negative')
                    }))
                );
                assert.ok(d4JaAdverbs.length >= 5, 'Drill 4 must retain degree adverbs when OFF');
                assert.ok(d4JaAdverbs[0].isNegative, 'Drill 4 zenzen must be negative when OFF');
                assert.ok(d4JaAdverbs[1].isNegative, 'Drill 4 amari must be negative when OFF');
                assert.ok(d4JaAdverbs[2].isPositive, 'Drill 4 chotto must be positive when OFF');
                checks += 4;
                const d5LayoutOff = await page.locator('#drill5').evaluate(group => {
                    return [...group.querySelectorAll('.p81-comparison-card')].map(card => {
                        const spacer = card.querySelector('.p81-drill-repeat-spacer');
                        const spacerWidth = spacer ? parseFloat(spacer.style.width) || 0 : 0;
                        const selects = [...card.querySelectorAll('select.p81-select')];
                        const sRects = selects.map(s => {
                            const r = s.getBoundingClientRect();
                            return { left: r.left, top: r.top };
                        });
                        const firstWord = card.querySelector('.p81-cue-words[data-repeat-anchor] .target-word');
                        const sameLine = selects.length === 2 && firstWord && Math.abs(selects[0].getBoundingClientRect().top - firstWord.getBoundingClientRect().top) < 8;
                        return { spacerWidth, sRects, sameLine };
                    });
                });
                for (let i = 0; i < d5LayoutOff.length; i++) {
                    const item = d5LayoutOff[i];
                    assert.ok(item.spacerWidth > 0, `Drill 5 card ${i} spacer must have positive width when English Cues OFF`);
                    if (width >= 1440 || item.sameLine) {
                        assert.ok(Math.abs(item.sRects[0].left - item.sRects[1].left) < 1, `Drill 5 card ${i} selects must align horizontally when English Cues OFF (width=${width})`);
                    }
                }
                checks += 2;
            }

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
