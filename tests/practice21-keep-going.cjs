// Practice 2.1 limited Preview: real DOM geometry and controls; audio APIs are mocked.
const fs = require('fs'), path = require('path'), assert = require('node:assert/strict');
const {createHash} = require('node:crypto'), {chromium} = require('playwright');
const root = path.resolve(__dirname, '..'), baseline = process.env.KEEP_GOING_BASELINE_ROOT;
const output = process.env.KEEP_GOING_OUTPUT || '/tmp/practice21-keep-going';
const audio = fs.readFileSync(path.join(root, 'tests/audio-relay.cjs'), 'utf8');
const mock = audio.slice(audio.indexOf('function mock()'), audio.indexOf('(async()=>'));
const fireHash = '9e03a4d08048e947436f6bdb5bbe016421df9e8c1c12bd1b3fa53ba7cb9eddd3'; // Approved Microsoft Fluent Fire 24 Regular, MIT.
let checks = 0; const measurements = [];
function check(value, expected, label) { assert.deepEqual(value, expected, label); checks++; }
async function settle(p) { await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); }
async function open(browser, dir, page = 'practice2.1') {
    const p = await browser.newPage({viewport: {width: 1440, height: 1000}});
    p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
    await p.addInitScript('(' + mock.trim() + ')();Math.random=()=>.3;');
    await p.route('**/*', r => {
        const u = new URL(r.request().url()); if (u.hostname !== 'keep-going.test') return r.abort();
        const f = path.join(dir, u.pathname), exists = fs.existsSync(f);
        return r.fulfill({status: exists ? 200 : 404, body: exists ? fs.readFileSync(f) : '', contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'text/html'});
    });
    await p.goto('http://keep-going.test/' + page + '.html');
    if (process.env.KEEP_GOING_FONT_FILE) {
        const data = fs.readFileSync(process.env.KEEP_GOING_FONT_FILE).toString('base64');
        await p.addStyleTag({content: `@font-face{font-family:Lato;src:url(data:font/ttf;base64,${data});font-weight:400;}`});
    }
    await p.evaluate(() => document.fonts.ready); await settle(p); return p;
}
async function fixture(p, raw, extra = {}) {
    return p.evaluate(({raw, extra}) => {
        const key = Object.keys(practice2State.views)[0]; window.keepGoingTestKey = key;
        practice2State.savedResults[key] = {rawTranscript: raw, expectedText: 'あ', modelText: 'あ', isCorrect: false, ...extra};
        renderAll(); return key;
    }, {raw, extra});
}
async function roleMarkup(p) { return p.locator('.conversation-role-circle').evaluateAll(es => es.map(e => [e.getAttribute('aria-label'), e.innerHTML])); }
async function inspect(p) {
    await settle(p);
    return p.evaluate(() => {
        const v = practice2State.views[keepGoingTestKey], label = v.corrTextSpan, group = v.resultSpan.parentElement;
        const rect = e => {const r = e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
        const glyphs = [], walker = document.createTreeWalker(v.resultSpan, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const n = walker.currentNode; if (n.parentElement.closest('button,.custom-tip-box,.tooltip-tip')) continue;
            for (let i=0; i<n.length; i++) {if (!n.textContent[i].trim()) continue; const range=document.createRange();range.setStart(n,i);range.setEnd(n,i+1);for (const r of range.getClientRects()) if(r.width&&r.height) glyphs.push({x:r.x,y:r.y,right:r.right,bottom:r.bottom});}
        }
        const svg=label.querySelector('svg'), style=getComputedStyle(label), box=getComputedStyle(v.correctionBox), sg=svg?.getBoundingClientRect();
        const textRange=document.createRange();textRange.selectNodeContents(label.lastChild);const text=textRange.getBoundingClientRect();
        return {raw:practice2State.savedResults[keepGoingTestKey].rawTranscript, stored:JSON.stringify(practice2State.savedResults[keepGoingTestKey]), text:v.resultSpan.innerHTML,
            message:label.textContent, sameGroup:v.correctionBox.parentElement===group, messageFirst:group.firstElementChild===v.correctionBox,
            label:rect(label), group:rect(group), glyphs, gap:glyphs[0]?.x-label.getBoundingClientRect().right,
            internalGap:text.x-(sg?.right||0), svg:svg?{w:sg.width,h:sg.height,hidden:svg.getAttribute('aria-hidden'),path:svg.querySelector('path')?.getAttribute('d'),fill:getComputedStyle(svg.querySelector('path')).fill}:null,
            color:style.color,font:style.fontFamily,nowrap:style.whiteSpace,decorations:[style.borderWidth,style.backgroundColor,style.boxShadow,box.borderWidth,box.backgroundColor,box.boxShadow],
            focusable:label.querySelectorAll('a,button,input,[tabindex]').length, pointerEvents:box.pointerEvents,
            scrollWidth:document.documentElement.scrollWidth,width:innerWidth};
    });
}
(async () => {
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
    fs.mkdirSync(output,{recursive:true});
    try {
        const p=await open(browser,root), before=baseline?await open(browser,baseline):null;
        check(await p.locator('.p21-retry-label').count(),0,'initial page has no retry message');
        for(const width of [375,600,1440]) for(const theme of ['light','dark']) {
            for(const q of [p,before].filter(Boolean)){await q.setViewportSize({width,height:1000});await q.emulateMedia({colorScheme:theme});}
            for(const [kind,raw]of [['short','あ'],['long','あいうえおかきくけこ、これは長い抽出テキストです。'.repeat(5)],['unbroken','LongUnbrokenExtractedText'.repeat(15)],['whitespace','Ａ　３，０００？\n  なにですか']]) {
                await fixture(p,raw); if(before)await fixture(before,raw); const d=await inspect(p), key=`${width}/${theme}/${kind}`;
                check(d.raw,raw,key+' raw STT unchanged');check(d.message,'Keep going!',key+' exact short message');
                check(d.sameGroup&&d.messageFirst,true,key+' message precedes extracted text in the same result region');
                check(d.svg?.hidden,'true',key+' decorative SVG');check([d.svg?.w,d.svg?.h],[20,20],key+' approved 20px icon');
                check(createHash('sha256').update(d.svg?.path||'').digest('hex'),fireHash,key+' approved Fluent Fire Regular path');
                check(d.color,theme==='light'?'rgb(190, 18, 60)':'rgb(254, 205, 211)',key+' existing error text color');check(d.svg?.fill,d.color,key+' icon shares message color');
                check(d.font.includes('Lato'),true,key+' Lato declared');check(d.nowrap,'nowrap',key+' message is atomic');
                check(d.decorations,['0px','rgba(0, 0, 0, 0)','none','0px','rgba(0, 0, 0, 0)','none'],key+' no enclosing decoration');
                check(d.focusable===0&&d.pointerEvents==='none',true,key+' no interaction added');
                const sameLine = Math.min(d.glyphs[0].bottom,d.label.bottom) > Math.max(d.glyphs[0].y,d.label.y);
                if(sameLine) check(Math.abs(d.gap-4)<.6,true,key+' minimal 4px gap');
                else check(d.glyphs[0].y>=d.label.bottom-.5&&d.glyphs[0].y-d.label.bottom<20,true,key+' long word wraps naturally without an empty line');
                check(Math.abs(d.internalGap-4)<.6,true,key+' icon and label gap');
                check(d.glyphs.every(g=>g.x>=d.group.x-.5&&g.right<=d.group.right+.5),true,key+' extracted text fits result region');
                check(d.label.x>=d.group.x-.5&&d.label.right<=d.group.right+.5,true,key+' message fits result region');
                check(d.scrollWidth<=width+1,true,key+' no page overflow');
                check(d.glyphs.every(g=>Math.min(g.right,d.label.right)-Math.max(g.x,d.label.x)<.5||Math.min(g.bottom,d.label.bottom)-Math.max(g.y,d.label.y)<.5),true,key+' message never overlaps extracted text');
                const maxRight=Math.max(d.label.right,...d.glyphs.map(g=>g.right));check(Math.abs(maxRight-d.group.right)<1,true,key+' whole content is right aligned');
                if(kind==='short') {check(d.label.x>d.group.x+1,true,key+' message is not pinned to left edge');check(Math.abs(d.label.y-d.glyphs[0].y)<10,true,key+' short text shares message line');}
                if(kind==='long') check(d.glyphs.some(g=>g.y>d.label.bottom&&g.x<d.label.right-20),true,key+' wrapped lines reclaim message column');
                if(before){const old=await before.evaluate(()=>practice2State.views[keepGoingTestKey].resultSpan.innerHTML);check(d.text,old,key+' extracted display markup unchanged');check(await roleMarkup(p),await roleMarkup(before),key+' Q/A icons unchanged');}
                measurements.push({key,gap:sameLine?d.gap:null,sameLine,internalGap:d.internalGap,group:d.group,label:d.label,lines:new Set(d.glyphs.map(g=>Math.round(g.y))).size,scrollWidth:d.scrollWidth,color:d.color});
                if(['short','long'].includes(kind)&&((width===375&&theme==='dark')||(width===1440&&theme==='light'))) await p.locator('.recording-result:has(.p21-retry-label)').first().screenshot({path:path.join(output,`${kind}-${width}-${theme}.png`)});
            }
        }
        for(const extra of [{isCorrect:true},{isCorrect:false,judgment:'undetermined'},{isCorrect:false,audioOnly:true},{isCorrect:false,unrecognized:true}]) {
            await fixture(p,'あ',extra);check(await p.locator('.p21-retry-label:visible').count(),0,'accepted/undetermined/audio-only result has no retry message '+JSON.stringify(extra));
        }
        await fixture(p,'あ');const saved=await p.evaluate(()=>JSON.stringify(practice2State.savedResults[keepGoingTestKey]));
        for(const [id,value]of [['scriptModeControl','kanji'],['hintModeControl','paren'],['speechStyleControl','casual']]) {await p.locator(`#${id} [data-value="${value}"]`).click();check(await p.evaluate(()=>JSON.stringify(practice2State.savedResults[keepGoingTestKey])),saved,id+' preserves raw result');check(await p.locator('.p21-retry-label:visible').count(),1,id+' paints retry once');}
        for(let i=0;i<2;i++){await p.locator('.drill-cue-button').click();check(await p.evaluate(()=>JSON.stringify(practice2State.savedResults[keepGoingTestKey])),saved,'English Cues preserves result');check(await p.locator('.p21-retry-label:visible').count(),1,'English Cues paints retry once');}
        const sets=p.locator('#drill1Container .p21-set-switcher button');await sets.nth(1).click();await sets.nth(0).click();check(await p.evaluate(()=>JSON.stringify(practice2State.savedResults[keepGoingTestKey])),saved,'set round trip preserves saved result');check(await p.locator('.p21-retry-label:visible').count(),1,'set round trip paints retry once');
        const v=await p.evaluate(()=>{const v=practice2State.views[keepGoingTestKey];v.recordBtn.dataset.keepGoingRecord='true';v.stopBtn.dataset.keepGoingStop='true';return {label:v.corrTextSpan.textContent};});check(v.label,'Keep going!','repainted row remains linked to feedback');
        const row=p.locator('tr:has([data-keep-going-record])');const listen=row.locator('.recording-actions button').first();await listen.click();check(await p.evaluate(()=>Boolean(t.spoken.at(-1)?.text)),true,'model playback works');await p.evaluate(()=>t.spoken.at(-1).onend?.());
        await p.evaluate(()=>{for(const id of ['toggleRecordMode','togglePlaybackMode']){const e=document.getElementById(id);if(e?.checked)e.click();}t.speaking=true;});await p.locator('[data-keep-going-record]').click();await p.waitForFunction(()=>t.recorders.length===1&&t.recorders[0].state==='recording');check(await p.locator('.p21-retry-label:visible').count(),0,'recording hides old feedback');
        await p.evaluate(()=>{const result=[{transcript:'ちがうこたえ'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});t.recognitions.at(-1).onspeechstart?.();});await p.locator('[data-keep-going-stop]').click();await p.waitForFunction(()=>t.recorders[0].state==='inactive'&&Object.values(practice2State.audioUrls).length>0);await settle(p);
        check(await p.evaluate(()=>t.tracks.every(t=>t.readyState==='ended')),true,'stop releases microphone');check(await p.locator('.p21-retry-label:visible').count(),1,'mismatch recording shows retry once');check(await p.evaluate(()=>practice2State.savedResults[keepGoingTestKey].rawTranscript),'ちがうこたえ','recorded raw STT preserved');
        await row.locator('.play-recording-btn').click();check(await p.evaluate(()=>t.audios.at(-1)?.paused),false,'saved recording playback works');await p.evaluate(()=>t.audios.at(-1).onended?.());
        check(p.errors,[],'no page runtime errors');await p.close();await before?.close();
        if(baseline){const a=await open(browser,root,'practice2.2'),b=await open(browser,baseline,'practice2.2');check(await a.locator('body').getAttribute('class'),await b.locator('body').getAttribute('class'),'Practice 2.2 does not opt into Preview');check(await a.locator('.recording-result').evaluateAll(es=>es.map(e=>e.outerHTML)),await b.locator('.recording-result').evaluateAll(es=>es.map(e=>e.outerHTML)),'Practice 2.2 result markup unchanged');await a.close();await b.close();}
    } finally {await browser.close();}
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,failures:0,measurements},null,2));console.log('PASS Practice 2.1 Keep going!',checks);
})().catch(e=>{console.error(e);process.exit(1)});
