const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(__dirname,'practice21.cjs'),'utf8');
const mock=source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'));
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let count=0;const report=[];
 for(const name of ['practice2.1','practice2.2']){
  const p=await b.newPage();await p.addInitScript('('+mock.trim()+')()');
  await p.route('http://pulse.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'image/png'}):r.fulfill({status:404,body:''});});
  // HTML must retain its document MIME type.
  await p.route('http://pulse.test/*.html',r=>r.fulfill({body:fs.readFileSync(path.join(root,new URL(r.request().url()).pathname)),contentType:'text/html'}));
  await p.goto('http://pulse.test/'+name+'.html');
  const marker='.p21-distance-person.is-speaking, .p2x-person.is-speaking';
  async function verify(who,label){assert.deepEqual(await p.locator(marker).evaluateAll(es=>es.map(e=>e.dataset.person)),[who],label);assert.equal(await p.locator(marker).evaluate(e=>getComputedStyle(e).animationName),name==='practice2.2'?'none':'p23-speaking');assert.equal(await p.locator(marker).evaluate(e=>getComputedStyle(e).outlineColor),name==='practice2.2'?(who==='A'?'rgb(76, 29, 149)':'rgb(7, 89, 133)'):'rgb(230, 0, 18)');count+=3;}
  async function checkCurrent(label){
   const examples=p.locator('.example-box button.example-button');
   for(let i=0;i<await examples.count();i++){
    const button=examples.nth(i);const text=await button.textContent();if(!text.includes('きく'))continue;
    await button.click();const who=await button.evaluate(e=>e.dataset.speaker||e.closest('p')?.querySelector('.p22-person-badge')?.textContent.trim()||e.closest('p')?.querySelector('strong')?.textContent.trim()[0]||e.textContent.trim()[0]);
    // Image audio labels retain A/B in originalHtml while Playing.
    const shown=({X:'A',Y:'B'})[who]||who; const fallback=await button.evaluate(e=>(e.dataset.originalHtml||'').match(/[XY]/)?.[0]);const expected=['A','B'].includes(shown)?shown:({X:'A',Y:'B'})[fallback];
    await verify(expected,label+' Example '+i);await p.evaluate(()=>t.spoken.at(-1).onend?.());assert.equal(await p.locator(marker).count(),0,'Example clears');count++;
   }
   const rows=p.locator('tr[data-drill-speaker]');
   for(let i=0;i<await rows.count();i++){
    const row=rows.nth(i),who=await row.getAttribute('data-drill-speaker');const listen=row.locator('button').filter({hasText:'きく'}).first();await listen.click();await verify(who,label+' row '+i);
    await p.evaluate(()=>t.spoken.at(-1).onend?.());assert.equal(await p.locator(marker).count(),0,'model clears');count++;
   }
   report.push(label+': '+await rows.count()+' rows');
  }
  await checkCurrent(name+' initial');
  const switchers=await p.locator('[data-set-state]').evaluateAll(es=>es.map(e=>({key:e.dataset.setState,n:e.querySelectorAll('button').length})));
  for(const {key,n} of switchers)for(let i=1;i<n;i++){await p.locator(`[data-set-state="${key}"] button`).nth(i).click();await checkCurrent(name+' '+key+'='+i);await p.locator(`[data-set-state="${key}"] button`).first().click();}
  if(name==='practice2.1'){await p.locator('.p21-drill1 > .p21-set-switcher button').nth(1).click();await checkCurrent(name+' D1 Set2');}
  // Every active Q/R row: microphone preparation/recording, then release.
  for(let i=0;i<await p.locator('tr[data-drill-speaker]').count();i++){
   const row=p.locator('tr[data-drill-speaker]').nth(i),who=await row.getAttribute('data-drill-speaker');
   await p.evaluate(()=>{t.defer=true;for(const id of ['togglePlaybackMode','toggleRecordMode']){const e=document.getElementById(id);if(e.checked)e.click();}});
   await row.locator('button').filter({hasText:'とる'}).click();await verify(who,name+' preparing '+i);
   await p.evaluate(()=>t.requests.at(-1)());await p.waitForFunction(()=>Boolean(activeRecognitionSession));await verify(who,name+' recording '+i);
   await row.locator('.stop-button,button').filter({hasText:'⏹️'}).first().click();await p.waitForFunction(()=>!activeRecognitionSession&&!practice2State.startingRow);assert.equal(await p.locator(marker).count(),0,'record clears');count++;
   const replay=row.locator('.play-recording-btn');if(await replay.count()){await replay.click();await verify(who,name+' recorded playback '+i);await p.evaluate(()=>t.audios.at(-1).onended?.());assert.equal(await p.locator(marker).count(),0,'recorded playback clears');count++;}
  }
  const pair=p.locator('tr[data-drill-speaker]');await pair.first().locator('button').filter({hasText:'きく'}).first().click();await p.evaluate(()=>{t.stale=t.spoken.at(-1).onend;});await pair.nth(1).locator('button').filter({hasText:'きく'}).first().click();await p.evaluate(()=>t.stale?.());await verify(await pair.nth(1).getAttribute('data-drill-speaker'),name+' handoff rejects stale end');await p.evaluate(()=>stopAllPlayback());assert.equal(await p.locator(marker).count(),0,'explicit cancellation clears');count++;
  await p.emulateMedia({reducedMotion:'reduce'});const first=p.locator('tr[data-drill-speaker]').first();await first.locator('button').filter({hasText:'きく'}).first().click();assert.equal(await p.locator(marker).evaluate(e=>getComputedStyle(e).animationName),'none');count++;await p.evaluate(()=>t.spoken.at(-1).onend?.());
  await p.close();
 }
 await b.close();console.log(report.join('\n'));console.log('PASS Lesson 2 photo speaker pulse',count);
})().catch(e=>{console.error(e);process.exit(1)});
