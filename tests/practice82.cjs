// Practice 8.2: actual models, selection prerequisites, lifecycle and layout.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8');
const mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];let count=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);count++};p.on('pageerror',e=>errors.push(e.message));await p.addInitScript('('+mock.trim()+')();');
 await p.route('http://p82.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});let s=fs.readFileSync(f);if(f.endsWith('practice8.2.js')){s=s.toString();const i=s.lastIndexOf('})();');s=s.slice(0,i)+'window.audit82={rowsFor,makeRow,matchesAnswer,sentenceFor,keyFor,saved,views,choices,speechText};'+s.slice(i);}return r.fulfill({body:s,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});});
 await p.goto('http://p82.test/practice8.2.html');eq(errors,[],'initial render');
 eq(await p.locator('h1').textContent(),'Practice 8.2: 何か・何も・何でも','page title');
 eq(await p.locator('.example-box').count(),3,'three Examples');
 for(const [n,rows]of [[1,4],[2,8],[3,6]])eq(await p.locator('#drill'+n+' tr').count(),rows,'Drill '+n+' rows');
 eq(await p.locator('#drill3 .p81-card .p81-cue-words').allTextContents().then(a=>a.filter((_,i)=>i%2===0).map(s=>s.includes('どんな'))),[true,true,true],'all habit questions use どんな');
 const yn=p.locator('[data-row="yn-0-a"]');eq(await yn.locator('.recording-actions button').nth(0).isDisabled(),true,'listen locked');eq(await yn.locator('.recording-actions button').nth(1).isDisabled(),true,'record locked');
 const before=await p.evaluate(()=>t.spoken.length);for(let i=0;i<4;i++)await p.locator(`[data-response="yn-${i}-a"][data-answer="yes"]`).click();eq(await p.evaluate(()=>t.spoken.length),before,'selection does not speak');
 for(const style of ['formal','informal','casual']){
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  for(const answer of ['yes','no']){
   for(let i=0;i<4;i++)await p.locator(`[data-response="yn-${i}-a"][data-answer="${answer}"]`).click();
   const models=await p.evaluate(()=>audit82.rowsFor(1).flat().map(r=>({text:r.text,k:audit82.matchesAnswer(r.text,r),h:audit82.matchesAnswer(r.hira,r),wrong:audit82.matchesAnswer(r.text+'猫',r)})));
   for(const r of models){eq(r.k,true,style+answer+' kanji '+r.text);eq(r.h,true,'kana model');eq(r.wrong,false,'unrelated content rejected');}
  }
  for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
   await p.locator(`#scriptModeControl [data-value="${mode}"]`).click();await p.locator(`#hintModeControl [data-value="${hint}"]`).click();
   eq(await p.locator('tr').count(),18,'all Drills retained');
   eq(await p.locator('.conversation-role-circle').count(),18,'common role circles');
   eq(await p.locator('.info-panel-desc').allTextContents().then(a=>a.every(t=>t.startsWith('💡'))),true,'short bulb instructions');
   for(const result of await p.evaluate(()=>[...audit82.rowsFor(0),...audit82.rowsFor(2)].flat().map(r=>[audit82.matchesAnswer(r.text,r),audit82.matchesAnswer(r.hira,r)])))eq(result,[true,true],'statement and WH models');
  }
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();await p.locator('#scriptModeControl [data-value="kanji"]').click();await p.locator('#hintModeControl [data-value="hover"]').click();
 const checks=await p.evaluate(()=>{const a=audit82,yn=a.rowsFor(1)[0][1],any=a.rowsFor(2)[0][1],s=a.rowsFor(0)[2][0];return [a.matchesAnswer('いいえ、何もしません',yn),a.matchesAnswer('いいえ、しません',yn),a.matchesAnswer('はい、何かします',yn),a.matchesAnswer('何でも',any),a.matchesAnswer('何でもを聞きます',any),a.matchesAnswer('何でもいいです',any),a.matchesAnswer('何かを飲みます',s),a.matchesAnswer('何も飲みません',s),a.rowsFor(0)[0][0].hira.includes('デパート'),a.rowsFor(0)[3][0].hira.includes('ケント')];});eq(checks,[true,false,false,true,false,false,true,false,true,true],'target pronouns, polarity and katakana');
 eq(await p.evaluate(()=>[audit82.matchesAnswer('何でも聴きます',audit82.rowsFor(2)[0][1]),audit82.matchesAnswer('何でも観ます',audit82.rowsFor(2)[2][1]),audit82.matchesAnswer('ケントさんに何か訊きます',audit82.rowsFor(0)[3][0])]),[true,true,true],'registered listening/viewing spellings');
 eq(await p.evaluate(()=>[0,1,2].every(si=>audit82.rowsFor(si).flat().every(r=>!/[\p{Script=Han}]/u.test(r.hira)))),true,'all model readings actually remove kanji');
 eq(await p.evaluate(()=>audit82.matchesAnswer('なにかのみます',audit82.rowsFor(0)[2][0])),true,'original kana recognition matches inflected verb');
 const examples=await p.locator('.example-box button').all();
 for(const [i,b]of examples.entries()){await b.click();eq(await p.evaluate(()=>Boolean(t.spoken.at(-1).text)),true,'Example '+i+' playable');await p.evaluate(()=>t.spoken.at(-1).onend());}
 eq(await p.evaluate(()=>audit82.speechText('ううん、何も食べなかった。')),'ううんん、何も食べなかった。','No pronunciation-only rule');
 await p.locator('label.switch').first().click();
 await yn.locator('button').filter({hasText:'🎙️とる'}).click();await p.waitForFunction(()=>t.recognitions.length===1);
 await p.evaluate(()=>{const result=[{transcript:'  いいえ、何もしません。　'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>audit82.saved.has('yn-0-a:no'));
 eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'recorded No graded');
 eq(await p.evaluate(()=>audit82.saved.get('yn-0-a:no').raw),'  いいえ、何もしません。　','raw STT kept');
 eq(await p.evaluate(()=>{const n=t.audios.length;t.spoken.at(-1).onend();return t.audios.length===n+1}),true,'zero intentional relay gap');
 const next=p.locator('[data-row="any-0-a"]');await next.locator('button').filter({hasText:'🎙️とる'}).click();await p.waitForFunction(()=>t.recognitions.length===2);eq(await p.evaluate(()=>t.audios.at(-1).paused),true,'new recording stops relay');
 await p.evaluate(()=>{const result=[{transcript:'何でも'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>audit82.saved.has('any-0-a:fixed'));
 eq(await next.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'natural short answer accepted');eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'previous recording retained');
 await p.locator('[data-response="yn-0-a"][data-answer="yes"]').click();eq(await yn.locator('.result-text').textContent(),'(Not recorded yet)','Yes independent');await p.locator('[data-response="yn-0-a"][data-answer="no"]').click();eq(await yn.locator('.result-text').textContent().then(t=>t.includes('✅')),true,'No recording restored');
 for(const width of [375,600,900,1440])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:1000});await p.emulateMedia({colorScheme:theme});
  eq(await p.locator('.example-box').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'Example fits '+width+theme);
  eq(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'page fits');
  eq(await p.locator('.example-box').evaluateAll(es=>es.every(e=>{const xs=[...e.querySelectorAll('button')].map(b=>b.getBoundingClientRect().left);return Math.max(...xs)-Math.min(...xs)<1;})),true,'shared Example audio column');
  if(width===1440){await p.locator('#drill1').screenshot({path:'/tmp/practice82-'+theme+'.png'});}
 }
 for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
  await p.locator(`#scriptModeControl [data-value="${mode}"]`).click();await p.locator(`#hintModeControl [data-value="${hint}"]`).click();
  for(const width of [375,600,1440]){await p.setViewportSize({width,height:1000});eq(await p.locator('.example-box').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'all reading/hint layouts '+mode+hint+width);}
  if(mode==='hiragana')eq(await p.locator('.p81-model,.info-panel-desc').evaluateAll(es=>es.every(e=>!/[\p{Script=Han}]/u.test(e.textContent))),true,'hiragana models and instruction terms');
 }
 eq(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 8.2',count);
})().catch(e=>{console.error(e);process.exit(1)});
