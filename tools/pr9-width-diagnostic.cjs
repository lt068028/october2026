const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');

const [, , mainRoot, filledRoot] = process.argv;
const output = process.env.DIAG_OUTPUT || path.resolve('diagnostic-artifacts');
const comparison = [
    ['main', mainRoot, '74817eb3e5dc3ff30ad6769df673450354910d29'],
    ['filled', filledRoot, '01e5e49d5a006a7b29602791fa8e606f121dd706']
];
if (!mainRoot || !filledRoot) throw new Error('Expected main and filled source roots');
fs.mkdirSync(output, {recursive: true});
const testSource = fs.readFileSync(path.resolve(__dirname, '../tests/audio-relay.cjs'), 'utf8');
const mockStart = testSource.indexOf('function mock()');
const mockEnd = testSource.indexOf('(async()=>');
if (mockStart < 0 || mockEnd < 0) throw new Error('Could not extract fixed shared audio mock');
const audioMock = testSource.slice(mockStart, mockEnd);
const widths = {A: [1440, 375, 1440], B: [1440, 600, 375, 1440], C: [375], D: [1440, 375]};
const all = [];
const compact = value => String(value || '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '');

async function settle(page) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
}

async function openPage(browser, root, pageName, width, theme) {
    const page = await browser.newPage({viewport: {width, height: 1100}});
    page.setDefaultTimeout(15000);
    page.errors = [];
    page.on('pageerror', error => page.errors.push(error.message));
    await page.addInitScript(`(${audioMock})();Math.random=()=>.3;`);
    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.hostname !== 'pr9-diag.test') return route.abort();
        const filename = path.join(root, url.pathname);
        const exists = fs.existsSync(filename);
        const ext = path.extname(filename);
        const type = ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'text/html';
        return route.fulfill({status: exists ? 200 : 404, body: exists ? fs.readFileSync(filename) : '', contentType: type});
    });
    await page.goto(`http://pr9-diag.test/${pageName}.html`);
    await page.setViewportSize({width, height: 1100});
    await page.emulateMedia({colorScheme: theme});
    await settle(page);
    return page;
}

async function select(page, id, value) {
    await page.evaluate(({id, value}) => document.querySelector(`#${id} [data-value="${value}"]`)?.click(), {id, value});
    await settle(page);
}

async function setP82State(page, scriptMode) {
    for (const [id, value] of [['scriptModeControl', scriptMode], ['hintModeControl', 'paren'], ['speechStyleControl', 'casual']]) {
        await select(page, id, value);
    }
}

async function createSavedRecording(page) {
    await page.evaluate(() => {
        for (const select of document.querySelectorAll('.recording-table select')) {
            const option = [...select.options].find(item => item.value && !item.disabled);
            if (option) { select.value = option.value; select.dispatchEvent(new Event('change', {bubbles: true})); }
        }
        for (const input of document.querySelectorAll('.recording-table input[type="text"]')) {
            input.value = 'がくせい'; input.dispatchEvent(new Event('input', {bubbles: true}));
        }
        for (const id of ['togglePlaybackMode', 'toggleRecordMode']) {
            const control = document.getElementById(id);
            if (control?.checked) control.click();
        }
        window.t.speaking = true;
        const record = [...document.querySelectorAll('button')].find(button => /^(🎙️|⏺️)とる/.test(button.textContent) && !button.disabled);
        if (!record) throw new Error('No enabled recording button found');
        record.dataset.pr9DiagnosticRecord = 'true';
        record.click();
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => {
        const recognition = window.t.recognitions.at(-1);
        const result = [{transcript: '私は学生です'}]; result.isFinal = true;
        recognition?.onresult?.({resultIndex: 0, results: [result]});
        recognition?.onspeechstart?.();
    });
    const stop = page.locator('.stop-btn-active:not(:disabled)');
    if (!await stop.count()) throw new Error('Recording fixture did not expose an enabled stop button');
    await stop.first().click();
    await page.waitForFunction(() => window.t.recorders.at(-1)?.state === 'inactive', null, {timeout: 5000});
    await page.waitForTimeout(150);
    await page.waitForFunction(() => [...document.querySelectorAll('.recording-result')].some(el=>/▶|play-recording|recorded-play/.test(el.innerHTML)), null, {timeout: 5000});
}

async function measure(page, meta, screenshotPath = null) {
    await settle(page);
    const data = await page.evaluate(() => {
        const iw = innerWidth;
        const properties = ['display','position','boxSizing','width','minWidth','maxWidth','whiteSpace','overflow','overflowX','flex','flexBasis','flexShrink','flexWrap','gridTemplateColumns','gridAutoColumns','margin','padding','transform'];
        const describe = el => {
            const r = el.getBoundingClientRect(), s = getComputedStyle(el);
            const ancestors=[];
            for(let parent=el.parentElement;parent&&ancestors.length<5;parent=parent.parentElement){const pr=parent.getBoundingClientRect(),ps=getComputedStyle(parent);ancestors.push({tag:parent.tagName,id:parent.id,className:typeof parent.className==='string'?parent.className:'',rect:{x:pr.x,y:pr.y,width:pr.width,height:pr.height,right:pr.right,bottom:pr.bottom},scrollWidth:parent.scrollWidth,clientWidth:parent.clientWidth,style:Object.fromEntries(properties.map(p=>[p,ps[p]]))});}
            return {tag: el.tagName, id: el.id, className: typeof el.className === 'string' ? el.className : '', text: (el.innerText || el.textContent || '').trim().slice(0, 100), rect: {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}, scrollWidth:el.scrollWidth, clientWidth:el.clientWidth, style:Object.fromEntries(properties.map(p=>[p,s[p]])),ancestors};
        };
        const candidates = [...document.querySelectorAll('body *')]
            .filter(el => {const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&(r.right>iw+.5||el.scrollWidth>el.clientWidth+2);})
            .map(describe)
            .sort((a,b)=>b.rect.right-a.rect.right)
            .slice(0, 20);
        const resultRows = [...document.querySelectorAll('.recording-result')].map(el=>el.innerHTML);
        return {
            innerWidth: iw, innerHeight, documentScrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            horizontalExcessPx: Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-iw,
            pageFitsThreshold10: document.documentElement.scrollWidth<=iw+10,
            bodyFont: getComputedStyle(document.body).fontFamily,
            recordingResultCount: resultRows.length,
            savedRecordingPresent: resultRows.some(s=>s.includes('play-recording-btn')||s.includes('recorded-play')),
            resultRows: resultRows.slice(0, 3), candidates,
            pageErrors: window.__diagnosticPageErrors || []
        };
    });
    const recordErrors = page.errors || [];
    const entry = {...meta, ...data, pageErrors: recordErrors};
    all.push(entry);
    if (screenshotPath) {
        fs.mkdirSync(path.dirname(screenshotPath), {recursive: true});
        const row = page.locator('tr:has([data-pr9-diagnostic-record])').first();
        if (await row.count()) await row.screenshot({path: screenshotPath});
        else await page.screenshot({path: screenshotPath});
        entry.screenshot = path.relative(output, screenshotPath);
    }
    return entry;
}

async function p82Trial(browser, variant, root, scenario, scriptMode, theme, repeat) {
    const startWidth = scenario === 'C' ? 375 : 1440;
    const page = await openPage(browser, root, 'practice8.2', startWidth, theme);
    await setP82State(page, scriptMode);
    await createSavedRecording(page);
    const route = widths[scenario];
    for (let i=0;i<route.length;i++) {
        const width = route[i];
        await page.setViewportSize({width,height:1100});
        const screenshot = width===375&&repeat===1
            ? path.join(output, variant, 'practice8.2', `${scenario}-${scriptMode}-${theme}-r${repeat}.png`)
            : null;
        const result=await measure(page,{commit:variant,sha:variant==='main'?'74817eb3e5dc3ff30ad6769df673450354910d29':'01e5e49d5a006a7b29602791fa8e606f121dd706',test:'practice8.2/saved-state',scenario,sequenceIndex:i+1,sequence:route,scriptMode,hint:'paren',theme,repeat,recordingTranscript:'私は学生です',savedRecordingRestored:true},screenshot);
        result.passed=result.pageFitsThreshold10;
    }
    await page.close();
}

async function p11Trial(browser, variant, root, hint, theme, repeat) {
    const page=await openPage(browser,root,'practice1.1',1440,theme);
    await page.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
    await select(page,'hintModeControl',hint);
    await page.evaluate(()=>{const result=document.querySelector('.recording-controls .result-text');if(result)result.textContent='認識された長い文の表示を確認します。キューと音声操作の位置を保ったまま、停止ボタンより後の領域で表示します。';});
    const initial=await page.evaluate(()=>{
        const left=document.body.getBoundingClientRect().x;
        return [...document.querySelectorAll('.recording-actions')].map(e=>[...e.querySelectorAll('button')].slice(0,3).map(b=>Math.round((b.getBoundingClientRect().x-left)*100)/100));
    });
    const baselineControlsWidth=await page.locator('.recording-controls').first().evaluate(e=>e.getBoundingClientRect().width).catch(()=>null);
    for(const width of [1440,1442,1600,1920,2080,2560]) {
        await page.setViewportSize({width,height:900});
        const positions=await page.evaluate(()=>{const left=document.body.getBoundingClientRect().x;return [...document.querySelectorAll('.recording-actions')].map(e=>[...e.querySelectorAll('button')].slice(0,3).map(b=>Math.round((b.getBoundingClientRect().x-left)*100)/100));});
        const geometry=await measure(page,{commit:variant,sha:variant==='main'?'74817eb3e5dc3ff30ad6769df673450354910d29':'01e5e49d5a006a7b29602791fa8e606f121dd706',test:'fluid-width/Practice1.1',hint,theme,repeat,width,initialButtonPositions:initial,currentButtonPositions:positions,buttonPositionPass:positions.every((row,i)=>row.every((x,j)=>Math.abs(x-initial[i][j])<2)),baselineControlsWidth},width===1440&&repeat===1?path.join(output,variant,'practice1.1',`${hint}-${theme}-r${repeat}.png`):null);
        geometry.wideOverflowPass=!await page.locator('.example-box,.drill-row,.settings-row,.pitch-card').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2));
    }
    await page.close();
}

(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try {
        const browserVersion=browser.version();
        fs.writeFileSync(path.join(output,'browser.json'),JSON.stringify({browserVersion,node:process.version,playwright:require('playwright/package.json').version},null,2));
        for(const [variant,root] of comparison) {
            for(const scenario of ['A','B','C','D']) for(const scriptMode of ['hiragana','kanji']) for(const theme of ['light','dark']) for(let repeat=1;repeat<=3;repeat++) {
                await p82Trial(browser,variant,root,scenario,scriptMode,theme,repeat);
            }
            for(const hint of ['off','paren']) for(const theme of ['light','dark']) for(let repeat=1;repeat<=3;repeat++) {
                await p11Trial(browser,variant,root,hint,theme,repeat);
            }
        }
    } finally { await browser.close(); }
    fs.mkdirSync(output,{recursive:true});
    fs.writeFileSync(path.join(output,'measurements.json'),JSON.stringify(all,null,2));
    const summary={totalMeasurements:all.length,p82:all.filter(x=>x.test==='practice8.2/saved-state').length,p11:all.filter(x=>x.test==='fluid-width/Practice1.1').length,failedP82:all.filter(x=>x.test==='practice8.2/saved-state'&&!x.passed).length,failedP11Position:all.filter(x=>x.test==='fluid-width/Practice1.1'&&!x.buttonPositionPass).length};
    fs.writeFileSync(path.join(output,'diagnostic-summary.json'),JSON.stringify(summary,null,2));
    console.log(JSON.stringify(summary,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
