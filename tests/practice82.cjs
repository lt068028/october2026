// Practice 8.2: current four-Example/four-Drill models, judging and state relay.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8');
const mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];let count=0;
 const eq=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 p.on('pageerror',e=>errors.push(e.message));await p.addInitScript('('+mock.trim()+')();');
 await p.route('http://p82.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});let s=fs.readFileSync(f);if(f.endsWith('practice8.2.js')){s=s.toString();const i=s.lastIndexOf('})();');s=s.slice(0,i)+'window.audit82={rowsFor,makeRow,matchesAnswer,sentenceFor,keyFor,saved,views,choices,speechText};'+s.slice(i);}return r.fulfill({body:s,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});});
 await p.goto('http://p82.test/practice8.2.html');
 eq(errors,[],'initial render');eq(await p.locator('h1').textContent(),'Practice 8.2: 何か・何も・何でも','page title');
 eq(await p.locator('.example-box').count(),4,'four Example groups');
 eq(await p.locator('#drill3 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent})),['お土産に、何か、買いますか。','はい、買います。','いいえ、何も、買いません。'],'Example 3 current-tense souvenir models');
 eq(await p.locator('#unlearnedCounts').textContent(),'ことば(1語) 漢字(3字)','Beyond L8 updated counts');
 eq(await p.locator('.optional-particle-label').textContent(),'を','optional particle is individually marked');
 eq(await p.locator('.optional-particle .tooltip-tip').textContent(),'The particle を is optional and usually omitted after 何か.','optional particle explanation');
 for(const [n,rows]of [[1,4],[2,8],[3,10],[4,6]])eq(await p.locator(`#drill${n} tr`).count(),rows,`Drill ${n} rows`);
 eq(await p.locator('#drill4 .p81-cue-words').allTextContents().then(a=>a.filter((_,i)=>i%2===0).map(s=>s.includes('どんな'))),[true,true,true],'Drill 4 questions use どんな');
 eq(await p.locator('#drill2 .info-panel-title').textContent(),'Drill 2: 何を vs 何か — Questions','Drill 2 title');
 eq(await p.locator('#drill3 .info-panel-title').textContent(),'Drill 3: 何か／何も — Yes/No Questions','Drill 3 title');
 eq(await p.locator('#drill4 .info-panel-title').textContent().then(s=>s.includes('SNEAK PEEK')&&s.includes('何でも')),true,'Drill 4 advanced label');
 const yn=p.locator('[data-row="yn-0-a"]');
 eq(await yn.locator('.recording-actions button').nth(0).isDisabled(),true,'Y/N response listen locked');
 eq(await yn.locator('.recording-actions button').nth(1).isDisabled(),true,'Y/N response record locked');
 const before=await p.evaluate(()=>t.spoken.length);await p.locator('[data-response="yn-0-a"][data-answer="no"]').click();
 eq(await p.evaluate(()=>t.spoken.length),before,'answer selection does not speak');
 const models=await p.evaluate(()=>({
  d1: audit82.rowsFor(0).flat().map(r=>r.text),
  d2: audit82.rowsFor(1).flat().map(r=>r.text),
  d3: audit82.rowsFor(2).map(rs=>rs.map(r=>r.text)),
  d4: audit82.rowsFor(3).map(rs=>rs.map(r=>r.text))
 }));
 eq(models.d1,['授業で、何か、話しますか。','学校で、何か、習いますか。','大学で、何か、教えますか。','先生に、何か、聞きますか。'],'Drill 1 actual models');
 eq(models.d2.slice(0,4),['何を、読みますか。','何か、読みますか。','何を、書きますか。','何か、書きますか。'],'Drill 2 contrast models');
 eq(models.d3[0],['誕生日に、何か、しますか。','いいえ、何も、しません。'],'Drill 3 question and selected No models');
 eq(models.d4[0],['どんな料理を、作りますか。','何でも、作ります。'],'Drill 4 models');
 const answerChecks=await p.evaluate(()=>{const a=audit82,d1=a.rowsFor(0)[0][0],d2=a.rowsFor(1)[0][0],no=a.rowsFor(2)[0][1],any=a.rowsFor(3)[0][1];return [
  a.matchesAnswer('授業で何か話しますか',d1),a.matchesAnswer('誕生日に何かしますか',d1),
  a.matchesAnswer('何を読みますか',d2),a.matchesAnswer('何か読みますか',a.rowsFor(1)[0][1]),
  a.matchesAnswer('いいえ、何もします',no),a.matchesAnswer('いいえ、します',no),
  a.matchesAnswer('何でも作ります',any),a.matchesAnswer('何でもを作ります',any),a.matchesAnswer('何でもいいです',any)
 ];});
 eq(answerChecks,[true,false,true,true,false,false,true,false,false],'accepted and rejected answers');
 for(const style of ['formal','informal','casual']){
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  for(let i=0;i<5;i++)await p.locator(`[data-response="yn-${i}-a"][data-answer="${i%2?'yes':'no'}"]`).click();
  const result=await p.evaluate(()=>[0,1,2,3].flatMap(si=>window.audit82.rowsFor(si).flat()).map(r=>[
   window.audit82.matchesAnswer(r.text,r),window.audit82.matchesAnswer(r.hira,r),window.audit82.matchesAnswer(r.text+'猫',r)
  ]));
  for(const [i,checks]of result.entries())eq(checks,[true,true,false],`${style} model/readings/rejection ${i}`);
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();
 for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
  await p.locator(`#scriptModeControl [data-value="${mode}"]`).click();await p.locator(`#hintModeControl [data-value="${hint}"]`).click();
  eq(await p.locator('tr').count(),28,`${mode}/${hint} all Drill rows retained`);
  if(mode==='hiragana')eq(await p.locator('.p81-model,.info-panel-desc').evaluateAll(es=>es.every(e=>!/\p{Script=Han}/u.test(e.textContent))),true,'Hiragana Only models and instructions');
 }
 await p.locator('#scriptModeControl [data-value="kanji"]').click();await p.locator('#hintModeControl [data-value="hover"]').click();
 const exButtons=await p.locator('.example-box button').all();
 for(const [i,b]of exButtons.entries()){await b.click();eq(await p.evaluate(()=>Boolean(t.spoken.at(-1)?.text)),true,`Example group ${i+1} playable`);await p.evaluate(()=>t.spoken.at(-1).onend());}
 // Record a selected D3 No response, preserve raw STT, then check the next recording stops relay.
 await p.locator('label.switch').first().click();
 await yn.locator('button').filter({hasText:'🎙️とる'}).click();await p.waitForFunction(()=>t.recognitions.length===1);
 await p.evaluate(()=>{const result=[{transcript:'  いいえ、何も、しません。　'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>audit82.saved.has('yn-0-a:no'));
 eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'recorded D3 No graded');
 eq(await p.evaluate(()=>audit82.saved.get('yn-0-a:no').raw),'  いいえ、何も、しません。　','raw STT retained');
 eq(await p.evaluate(()=>{const n=t.audios.length;t.spoken.at(-1).onend();return t.audios.length===n+1}),true,'zero intentional relay gap');
 const next=p.locator('[data-row="any-0-a"]');await next.locator('button').filter({hasText:'🎙️とる'}).click();await p.waitForFunction(()=>t.recognitions.length===2);
 eq(await p.evaluate(()=>t.audios.at(-1).paused),true,'new recording interrupts relay');
 await p.evaluate(()=>{const result=[{transcript:'何でも、作ります。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>audit82.saved.has('any-0-a:fixed'));
 eq(await next.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'Drill 4 short model response graded');
 eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'previous D3 recording retained');
 await p.locator('[data-response="yn-0-a"][data-answer="yes"]').click();
 eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),false,'Yes state independent from No');
 await p.locator('[data-response="yn-0-a"][data-answer="no"]').click();
 eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'No result restored after answer switch');
 for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
  await p.locator(`#scriptModeControl [data-value="${mode}"]`).click();await p.locator(`#hintModeControl [data-value="${hint}"]`).click();
  for(const width of [375,600,1440]){
   await p.setViewportSize({width,height:1000});
   eq(await p.locator('.example-box').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,`Example fits ${mode}/${hint}/${width}px`);
   eq(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`page fits ${mode}/${hint}/${width}px`);
  }
 }
 for(const width of [375,600,900,1440])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:1000});await p.emulateMedia({colorScheme:theme});
  eq(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`page fits ${width}px ${theme}`);
 }
 eq(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 8.2',count);
})().catch(e=>{console.error(e);process.exit(1)});
