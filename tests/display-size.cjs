// Practice 1.2 fixed 130%: legacy preference isolation, saved learning state and Display layout.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),key='october2026.practice12.displaySize';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};
 async function open(context,name='practice1.2'){
  const page=await context.newPage();page.setDefaultTimeout(10000);page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.route('http://drill.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html'});
  });
  await page.goto('http://drill.test/'+name+'.html');return page;
 }
 const context=await browser.newContext(),p=await open(context);
 check(await p.locator('#displaySizeControl').count(),0,'size selector removed');
 check(await p.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--practice12-scale').trim()),'1.3','130% is the fixed default');
 const font=await p.locator('#drill1Container .example-button').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
 check(Math.abs(font-14.95*1.3)<.02,true,'learning controls retain former 130% size');
 check(await p.locator('body').innerText().then(t=>t.includes('Ctrl +')),false,'zoom guide remains deferred');
 for(const old of ['100','115','130','999']) {
  await p.evaluate(([key,old])=>localStorage.setItem(key,old),[key,old]);await p.reload();
  check(await p.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--practice12-scale').trim()),'1.3','old saved preference ignored');
 }
 await p.evaluate(()=>{
  const k=Object.keys(practice2State.views)[0];window.sizeTestKey=k;
  practice2State.savedResults[k]={rawTranscript:'私は学生です',modelText:'私は学生です。',expectedText:'私は学生です。',isCorrect:true};
  practice2State.audioUrls[k]=URL.createObjectURL(new Blob(['saved'],{type:'audio/webm'}));
  window.sizeTestSaved=practice2State.savedResults[k];window.sizeTestUrl=practice2State.audioUrls[k];
 });
 await p.locator('#scriptModeControl [data-value="kanji"]').click();
 await p.locator('#speechStyleControl [data-value="casual"]').click();
 check(await p.evaluate(()=>practice2State.savedResults[sizeTestKey]===sizeTestSaved&&practice2State.audioUrls[sizeTestKey]===sizeTestUrl),true,'recording and original result retained across redraw');
 check(await p.locator('.recorded-play-button,.play-recording-btn').count()>0,true,'recording remains playable');
 const other=await open(context,'practice7.1');
 check(await other.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--practice12-scale').trim()),'1.3','130% is applied to other pages');
 await p.bringToFront();
 await p.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
 for(const width of [1440,1100,900,600]) for(const theme of ['light','dark']) {
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
  for(const style of ['formal','informal','casual']) for(const hint of ['off','hover','paren']) for(const script of ['hiragana','kanji']) {
   await p.evaluate(([style,hint,script])=>{
    document.querySelector(`#speechStyleControl [data-value="${style}"]`).click();
    document.querySelector(`#hintModeControl [data-value="${hint}"]`).click();
    document.querySelector(`#scriptModeControl [data-value="${script}"]`).click();
   },[style,hint,script]);
   const overflow=await p.locator('.example-box,.drill-row,.settings-row').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2));
   check(overflow,false,`fixed 130% layout ${width}/${theme}/${style}/${hint}/${script}`);
   check(await p.locator('#drill1Container .example-box .practice12-example-answer').count(),2,'yes/no are complete separate groups');
   for(const section of ['#drill1Container','#drill2Container']) {
    check(await p.locator(section+' .recording-actions').evaluateAll(es=>{const xs=es.map(e=>e.querySelector('button').getBoundingClientRect().x);return Math.max(...xs)-Math.min(...xs)<1.5}),true,`Listen column aligned ${section}/${width}/${theme}/${style}/${hint}/${script}`);
    check(await p.locator(section+' .example-box tr').evaluateAll(rows=>{
     const xs=rows.map(row=>row.querySelector('button').getBoundingClientRect().x);
     const aligned=Math.max(...xs)-Math.min(...xs)<1.5;
     const responses=rows.flatMap(row=>[...row.querySelectorAll('.practice12-example-answer button')]);
     const first=responses[0]?.getBoundingClientRect();
     return aligned&&responses.every(button=>{const r=button.getBoundingClientRect();return Math.abs(r.y-first.y)<10||Math.abs(r.x-first.x)<1.5});
    }),true,`Example primary Listen column aligned ${section}/${width}/${theme}/${style}/${hint}/${script}`);
   }
  }
 }
 for(const width of [1440,1280]) for(const hint of ['hover','paren']) {
  await p.setViewportSize({width,height:900});
  await p.evaluate(hint=>{
   document.querySelector('#speechStyleControl [data-value="formal"]').click();
   document.querySelector('#scriptModeControl [data-value="hiragana"]').click();
   document.querySelector(`#hintModeControl [data-value="${hint}"]`).click();
  },hint);
  check(await p.locator('#drill1Container .example-box tr').first().evaluate(tr=>Math.abs(tr.lastElementChild.getBoundingClientRect().y-tr.children[1].getBoundingClientRect().y)<10),true,`example uses one line when it fits ${width}/${hint}`);
  check(await p.locator('.recording-table tr').first().evaluate(tr=>Math.abs(tr.lastElementChild.getBoundingClientRect().y-tr.children[1].getBoundingClientRect().y)<10),true,`recording controls use one line when they fit ${width}/${hint}`);
 }
 await p.setViewportSize({width:1280,height:900});
 await p.locator('#drill1Container .drill-row').first().locator('.drill-cue-cell button[aria-pressed]').first().click();
 let row=p.locator('#drill1Container .drill-row').first();
 check(await row.locator('.drill-cue-cell button').evaluateAll(es=>es.map(e=>e.firstChild.textContent.trim())),['🙆','🙅'],'only Yes/No remain in the cue group');
 await p.locator('#drill2Container select.custom-select').first().selectOption('せいじ');
 check(await p.locator('#drill2Container .drill-row').first().locator('.recording-actions').last().locator('button').filter({hasText:/^🎙️とる/}).isEnabled(),true,'major selection still enables response recording');
 check(await p.locator('button').evaluateAll(es=>es.filter(b=>/^(👀Text|🕶️Hide)/.test(b.textContent)).length),0,'no Text or Hide controls');
 const box=await p.locator('body').boundingBox();
 check(box.width<=1280&&box.x>=32,true,'agreed width and outer gutters');
 check(p.errors.concat(other.errors),[],'no page errors');
 const denied=await browser.newContext();await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('denied','SecurityError')};Storage.prototype.setItem=()=>{throw new DOMException('denied','SecurityError')}});
 const d=await open(denied);check(await d.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--practice12-scale').trim()),'1.3','fixed size works without localStorage');check(d.errors,[],'storage denial does not break page');
 await browser.close();console.log('PASS fixed display size',checks);
})().catch(e=>{console.error(e);process.exit(1)});
