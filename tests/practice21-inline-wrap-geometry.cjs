// Practice 2.1 gated CI: production result renderer and actual Chromium DOM geometry.
// Audio APIs are mocked using the same harness as practice21-keep-going.cjs.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const harnessSource = fs.readFileSync(path.join(__dirname, 'practice21-keep-going.cjs'), 'utf8');
const harnessPrelude = harnessSource.split('(async () => {')[0];
const {open, settle} = new Function('require', '__dirname',
    harnessPrelude + ';return {open,settle};')(require, __dirname);
const output = process.env.WRAP_OUTPUT || '/tmp/practice21-inline-wrap';
const widths = [280, 320, 375, 430, 600, 850, 1440];
const samples = {
    short: 'あ',
    medium: 'きのう としょかんで にほんごの ほんを よみました。',
    long: 'これは わたしが きのう としょかんで みつけた にほんごの とても おもしろい ほんです。'.repeat(9),
    unbroken: 'LongUnbrokenTranscript'.repeat(32)
};
const report = [];
let checks = 0;
function check(condition, description, data) {
    if (!condition) {
        console.error('GEOMETRY FAIL:', description, JSON.stringify(data));
        assert.ok(condition, description);
    }
    checks++;
}

async function showMismatch(page, raw, kind = 'ordinary') {
    await page.evaluate(({raw, kind}) => {
        const entries = Object.entries(practice2State.views);
        const marked = entries.find(([, view]) =>
            view.resultSpan.closest('.recording-controls')?.querySelector('.question-indicator'));
        const extra = entries.find(([, view]) =>
            view.resultSpan.closest('.recording-controls')?.querySelector('.p21-response-lead'));
        const key = (kind === 'question' ? marked : kind === 'extra' ? extra : null)?.[0] || entries[0][0];
        if (kind === 'question' && !marked) throw Error('Practice 2.1 question indicator fixture is missing');
        if (kind === 'extra' && !extra) throw Error('Practice 2.1 post-Stop action fixture is missing');
        window.inlineWrapKey = key;
        practice2State.savedResults[key] = {rawTranscript: raw, expectedText: 'あ', modelText: 'あ', isCorrect: false};
        renderAll();
    }, {raw, kind});
    await settle(page);
}

async function geometry(page) {
    return page.evaluate(() => {
        const view = practice2State.views[window.inlineWrapKey];
        const transcript = view.resultSpan.querySelector('.p21-recognized-text');
        const fire = view.resultSpan.querySelector('.p21-retry-fire');
        const label = view.corrTextSpan;
        const result = view.resultSpan.closest('.recording-result');
        const controls = result.closest('.recording-controls');
        const actions = controls.querySelector('.recording-actions');
        const stop = view.stopBtn;
        const question = controls.querySelector('.question-indicator');
        const extra = controls.querySelector('.p21-response-lead');
        function rect(element) {
            if (!element) return null;
            const r = element.getBoundingClientRect();
            return {x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height};
        }
        const glyphs = [];
        const walker = document.createTreeWalker(transcript, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            let offset = 0;
            for (const glyph of node.textContent) {
                const end = offset + glyph.length;
                if (glyph.trim()) {
                    const range = document.createRange();
                    range.setStart(node, offset);
                    range.setEnd(node, end);
                    for (const box of range.getClientRects()) {
                        if (box.width && box.height) glyphs.push(rect({getBoundingClientRect: () => box}));
                    }
                }
                offset = end;
            }
        }
        const lines = new Map();
        for (const g of glyphs) {
            const key = Math.round(g.y);
            lines.set(key, Math.max(lines.get(key) || -Infinity, g.right));
        }
        const controlStyle = getComputedStyle(controls);
        const rightPadding = parseFloat(controlStyle.paddingRight) || 0;
        const ctrl = rect(controls), act = rect(actions), t = rect(transcript), f = rect(fire), l = rect(label), r = rect(result);
        const stopRect = rect(stop);
        const stopCenterY = (stopRect.y + stopRect.bottom) / 2;
        const stopRowEnd = Math.max(stopRect.right, ...[...actions.children].map(rect)
            .filter(item => item.width && item.height && item.y <= stopCenterY && item.bottom >= stopCenterY)
            .map(item => item.right));
        const actionItems = [...actions.children].map(rect).filter(item => item.width && item.height);
        const stopInLastActionRow = stopRect.y > act.y + 2 && act.bottom <= stopRect.bottom + 1.5;
        const wholeActionsWidth = Math.max(0, ctrl.right - rightPadding - act.right - 8);
        const lastStopRowWidth = Math.max(0, ctrl.right - rightPadding - stopRowEnd - 8);
        const afterWrappedStop = controls.classList.contains('p21-feedback-after-wrapped-stop');
        const availableWidth = afterWrappedStop ? lastStopRowWidth : wholeActionsWidth;
        const context = document.createElement('canvas').getContext('2d');
        context.font = getComputedStyle(transcript).font;
        const text = transcript.textContent.trimStart();
        const firstTwo = typeof Intl.Segmenter === 'function'
            ? [...new Intl.Segmenter('ja', {granularity:'grapheme'}).segment(text)].slice(0,2).map(p=>p.segment).join('')
            : Array.from(text).slice(0,2).join('');
        const minimumWidth = f.width + 4 + context.measureText(firstTwo).width;
        return {
            viewport: innerWidth, key: window.inlineWrapKey, controls: ctrl,
            actions: act, actionItems, stop: rect(stop), question: rect(question), extra: rect(extra),
            result: r, fire: f, transcript: t, label: l,
            first: glyphs[0] || null, last: glyphs.at(-1) || null,
            glyphs, lines: [...lines].map(([y,right])=>({y,right})),
            availableWidth, minimumWidth,
            wholeActionsWidth, lastStopRowWidth, stopRowEnd, stopInLastActionRow, afterWrappedStop,
            fallback: controls.classList.contains('p21-feedback-fallback'),
            inline: controls.classList.contains('p21-feedback-inline-wrap'),
            oldNextLine: controls.classList.contains('p21-feedback-next-line'),
            labelText: label.textContent.trim(),
            text: transcript.textContent,
            isRightAligned: getComputedStyle(result).textAlign === 'right',
            labelFragments: label.getClientRects().length,
            pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            errors: [...view.resultSpan.querySelectorAll('span')].filter(s => s.getAttribute('style')?.includes('color')).length
        };
    });
}

function validate(data, width, kind) {
    const name = `${width}px/${kind}`;
    check(data.inline && !data.oldNextLine, name + ': uses shrinkable inline mode', data);
    check(data.labelText === 'Keep going!', name + ': unchanged retry message', data);
    check(data.labelFragments === 1, name + ': Keep going! remains a single unbroken unit', data);
    check(data.text === samples[kind] || kind === 'question' || kind === 'extra', name + ': transcript present', data);
    check(data.isRightAligned, name + ': right-aligned result', data);
    check(!data.pageOverflow, name + ': no viewport horizontal overflow', data);
    check(data.fire.width >= 19.5 && data.fire.width <= 20.5, name + ': original 20px Fire', data);
    if (kind === 'question') check(Boolean(data.question), name + ': question indicator retained', data);
    if (kind === 'extra') check(Boolean(data.extra), name + ': post-Stop action retained', data);
    check(data.glyphs.length > 0, name + ': rendered transcript glyphs', data);
    check(Math.abs(data.label.right - data.result.right) < 2.5,
        name + ': final phrase ends at right edge', data);
    const intersects = (a, b) => a.x < b.right - 0.5 && a.right > b.x + 0.5
        && a.y < b.bottom - 0.5 && a.bottom > b.y + 0.5;
    check(data.actionItems.every(item => !intersects(data.label, item)),
        name + ': Keep going! does not overlap any actual button or indicator', data);
    check(data.glyphs.every(g => g.x >= data.result.x - 1 && g.right <= data.result.right + 1),
        name + ': all glyphs inside result region', data);
    const lastActionRight = Math.max(data.stop.right, data.question?.right || 0, data.extra?.right || 0, data.actions.right);
    if (!data.fallback) {
        check(data.availableWidth + 0.6 >= data.minimumWidth,
            name + ': same-row space is usable', data);
        check(data.fire.x >= (data.afterWrappedStop ? data.stopRowEnd : lastActionRight) + 0.5,
            name + ': Fire starts after all controls on the actual Stop row', data);
        check(data.fire.y < data.stop.bottom + 6 && data.fire.bottom > data.stop.y - 6,
            name + ': Fire starts on Stop row', data);
        check(data.first.y < data.fire.bottom + 5 && data.first.bottom > data.fire.y - 5,
            name + ': first transcript glyph shares the Fire row', data);
        if (data.afterWrappedStop) {
            check(data.stopInLastActionRow && data.wholeActionsWidth < data.minimumWidth + 1,
                name + ': wrapped-Stop alignment is used only when full actions row cannot fit', data);
            check(data.result.x >= data.stopRowEnd + 6,
                name + ': result occupies residual width after Stop on the last action row', data);
        }
    } else {
        check(data.wholeActionsWidth < data.minimumWidth + 1
            && (!data.stopInLastActionRow || data.lastStopRowWidth < data.minimumWidth + 1),
            name + ': fallback is justified on EVERY usable action line', data);
        check(data.fire.x >= data.result.x - 1,
            name + ': fallback result remains inside its own right-aligned row', data);
    }
    check(data.first.y <= data.fire.bottom + 5,
        name + ': Fire is not stranded without the first transcript glyph', data);
    if (kind === 'long' || kind === 'unbroken') {
        check(data.lines.length > 1, name + ': long transcript wraps into multiple lines', data);
        // Every transcript line is right-aligned, except a line completed by the
        // atomic Keep going! phrase (whose right edge is asserted separately).
        for (const line of data.lines) {
            const onLabelLine = data.label.y < line.y + 20 && data.label.bottom > line.y;
            if (!onLabelLine) check(Math.abs(line.right - data.result.right) < 3,
                name + ': wrapped transcript line reaches right edge', {line, result:data.result, label:data.label});
        }
    }
}

(async () => {
    fs.mkdirSync(output, {recursive:true});
    const browser = await chromium.launch({
        executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']
    });
    try {
        const page = await open(browser, root);
        for (const width of widths) {
            await page.setViewportSize({width,height:1100});
            for (const [kind, raw] of Object.entries(samples)) {
                await showMismatch(page, raw);
                const data = await geometry(page);
                report.push({width,kind, data});
                validate(data, width, kind);
                console.log('GEOMETRY', JSON.stringify({width,kind, fallback:data.fallback,
                    availableWidth:data.availableWidth, minimumWidth:data.minimumWidth,
                    stop:data.stop, fire:data.fire, first:data.first,
                    result:data.result, label:data.label, lines:data.lines}));
                if ([280,320,375,600,1440].includes(width) && kind === 'long') {
                    await page.screenshot({path:path.join(output, `practice21-${width}.png`), fullPage:true});
                }
            }
        }
        // Question indicators and any post-Stop answer cue use the actual action edge.
        for (const kind of ['question','extra']) {
            await page.setViewportSize({width:375,height:1100});
            if (kind === 'extra') {
                // The post-Stop response lead exists only in Drill 1, Set 2.
                await page.locator('.p21-drill1 .p21-set-switcher button').nth(1).click();
                await settle(page);
            }
            await showMismatch(page, samples.long, kind);
            const data = await geometry(page);
            validate(data, 375, kind);
            report.push({width:375, kind, data});
        }
        // A narrow-to-wide resize must not leave a stale next-line class.
        await page.setViewportSize({width:280,height:1100});
        await showMismatch(page,samples.long);
        await page.setViewportSize({width:1440,height:1100});
        await settle(page);
        validate(await geometry(page), 1440, 'long');
        check(page.errors.length === 0, 'no page runtime errors', page.errors);
        await page.close();
        fs.writeFileSync(path.join(output,'measurements.json'),JSON.stringify({checks,report},null,2));
        console.log(`PASS Practice 2.1 inline wrap geometry: ${checks} assertions / ${report.length} cases`);
    } finally {
        await browser.close();
    }
})().catch(error => {console.error(error);process.exitCode = 1;});
