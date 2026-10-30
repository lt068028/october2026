// Models, selection persistence, grammar/pragmatics separation and actual recording path.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const audioSource=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8');
const mock=audioSource.slice(audioSource.indexOf('function mock()'),audioSource.indexOf('(async()=>'));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let checks=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);checks++};
 await page.addInitScript('('+mock.trim()+')();');
 await page.route('http://practice81.test/**',r=>{
  const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
  let source=fs.readFileSync(file);
  if(file.endsWith('practice8.1.js')){
   const s=source.toString(),i=s.lastIndexOf('})();');
   source=s.slice(0,i)+`window.audit81={rowsFor,matchesAnswer,feedback,sentenceFor,makeRow,keyFor,saved,views,choices,showResult,normalize,speechText,sections,set:()=>situationSet};`+s.slice(i);
  }
  return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/png'});
 });
 await page.goto('http://practice81.test/practice8.1.html');
 check(errors,[],'initial render');
 check(await page.locator('.p81-gold').evaluateAll(es=>es.every(e=>e.classList.contains('grammar-highlight'))),true,'gold uses the common class');
 check(/p81-gold[^{}]*\{[^}]*color\s*:/.test(fs.readFileSync(path.join(root,'style.css'),'utf8')),false,'no duplicated page-specific gold color');
 check(await page.locator('.p81-section').count(),5,'five Drills');
 check(await page.locator('.example-box').count(),5,'five preceding Examples');
 check(await page.locator('#drill3 .example-box .p81-gold').allTextContents(),['は','のが','は','のが'],'Example3 topic and nominalizer highlighted');
 check(await page.locator('#drill1 .p81-gold').first().evaluate(e=>getComputedStyle(e).color),'rgb(202, 138, 4)','common light gold');
 check(await page.evaluate(()=>audit81.speechText('ううん、好きじゃない。')),'ううんん、好きじゃない。','No TTS only pronunciation exception');
 check(await page.locator('.info-panel-desc').allTextContents().then(a=>a.every(s=>s.startsWith('💡'))),true,'instructions start with bulb');
 check(await page.locator('#drill1 tr').count(),6,'three paired comparisons');
 check(await page.locator('#drill2 select').count(),0,'fixed preference cues, no preference dropdown');
 check(await page.locator('#drill2 tr').count(),8,'four Question Response pairs');
 check(await page.locator('[data-row="self-0-response"] .recording-actions button').first().isDisabled(),true,'reply listen locked before selection');
 check(await page.locator('[data-row="self-0-response"] .recording-actions button').nth(1).isDisabled(),true,'reply record locked before selection');
 for(let i=0;i<4;i++)await page.locator(`[data-response="self-${i}-response"][data-answer="yes"]`).click();
 check(await page.locator('#drill3 tr').count(),6,'six people');
 check(await page.locator('#drill3 .p81-card select').count(),6,'six ability selectors');
 check(await page.locator('#drill3 .example-box button').count(),2,'two ability Examples');
 check(await page.locator('#drill4 .example-box button').count(),6,'six degree Examples');
 check(await page.locator('#drill4 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['料理を作るのがぜんぜん好きじゃないです。','料理を作るのがあまり好きじゃないです。','料理を作るのがちょっと好きです。','料理を作るのがまあまあ好きです。','料理を作るのがとても好きです。','料理を作るのがすごく好きです。'],'degree Examples compare the same activity');
 check(await page.locator('#drill4 select').count(),6,'six degree rows');
 check(await page.locator('#drill5 tr').count(),5,'target impression opens by default');
 check(await page.locator('#drill5 .p81-target').allTextContents(),['Target: Modest','Target: Confident','Target: Boastful','Target: Rude','Target: Arrogant'],'all five targets visible immediately');
 check(await page.locator('#drill5 .example-box .p81-gold').allTextContents(),['は','のが','は','のが'],'Example5 topic and nominalizer highlighted');
 check(await page.locator('#drill2 .example-box button').allTextContents(),['🔊きく','🔊🙆','🔊🙅'],'question, Yes and No model buttons');
 check(await page.locator('#drill2 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['本を読むのが好きですか。','はい、好きです。','いいえ、好きじゃないです。'],'affirmative and negative models always visible');
 for(const label of ['🔊🙆','🔊🙅']){
  const before=await page.evaluate(()=>t.spoken.length);const selections=await page.locator('#drill2 .answer-choice').evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed')));await page.locator('#drill2 .example-box button').filter({hasText:label}).click();
  check(await page.evaluate(()=>t.spoken.at(-1).text),label==='🔊🙆'?'はい、好きです。':'いいえ、好きじゃないです。','independent response TTS');
  await page.evaluate(()=>t.spoken.at(-1).onend());check(await page.evaluate(()=>t.spoken.length),before+1,'Example playback does not select Drill response');check(await page.locator('#drill2 .answer-choice').evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed'))),selections,'Example leaves Y/N selections unchanged');
 }
 await page.locator('[data-set="compare"]').click();
 check(await page.locator('#drill5 tr').count(),8,'Skill Comfort comparison retained');
 const comparisons=await page.evaluate(()=>audit81.rowsFor(0).map(rs=>rs.map(r=>r.text)));
 check(comparisons,[['本が好きです。','本を読むのが好きです。'],['音楽が好きです。','音楽を聞くのが好きです。'],['写真が好きです。','写真を撮るのが好きです。']],'noun versus action');
 check(await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[0][0];return [a.matchesAnswer('あなたは本を読むのが好きですか',r),a.matchesAnswer('私は本を読むのが好きですか',r)];}),[true,false],'question addresses the listener');
 for(const style of ['formal','informal','casual']) {
  await page.locator('#speechStyleControl [data-value="'+style+'"]').click();
  const outcomes=await page.evaluate(()=>{
   const a=audit81,out=[];
   for(let si=0;si<5;si++)for(const rs of a.rowsFor(si))for(const r of rs){
    out.push([r.id,'model',a.matchesAnswer(r.text,r),a.matchesAnswer(r.hira,r)]);
    out.push([r.id,'unrelated',a.matchesAnswer(r.text.replace(/[。？]$/,'猫。'),r)]);
    if(!r.noun&&!r.short)out.push([r.id,'required nominalizer',a.matchesAnswer(r.text.replace('のが','が'),r)]);
   }
   return out;
  });
  for(const [id,label,...result]of outcomes)for(const value of result)check(value,label==='model',`${style} ${id} ${label}`);
  for(const answer of ['yes','no']){
   for(let i=0;i<4;i++)await page.locator(`[data-response="self-${i}-response"][data-answer="${answer}"]`).click();
   const ys=await page.evaluate(()=>audit81.rowsFor(1).flatMap(rs=>{const r=rs[1];return [audit81.matchesAnswer(r.text,r),audit81.matchesAnswer(r.hira,r)];}));
   for(const yes of ys)check(yes,true,style+' selected '+answer+' response models');
  }
  for(const script of ['hiragana','kanji']){
   await page.locator('#scriptModeControl [data-value="'+script+'"]').click();
   for(const hint of ['off','hover','paren']){
    await page.locator('#hintModeControl [data-value="'+hint+'"]').click();
    check(await page.locator('.p81-card').count(),23,`${style}/${script}/${hint} content retained`);
    check(await page.locator('.example-box .p81-gold').count(),style==='formal'?22:21,'gold structure in all Examples');
   }
  }
 }
 await page.locator('#speechStyleControl [data-value="formal"]').click();await page.locator('#scriptModeControl [data-value="kanji"]').click();await page.locator('#hintModeControl [data-value="hover"]').click();
 await page.locator('[data-response="self-0-response"][data-answer="no"]').click();
 check(await page.evaluate(()=>audit81.rowsFor(1)[0][1].text),'いいえ、好きじゃないです。','short No model');
 const forms=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[0][1];return [a.matchesAnswer('私は本を読むのが好きじゃないです',r),a.matchesAnswer('いいえ、好きじゃないです',r),a.matchesAnswer('はい、好きです',r)];});
 check(forms,[true,true,false],'full or short negative accepted, opposite rejected');
 check(await page.evaluate(()=>audit81.rowsFor(1).map(rs=>rs[0].adjective)),['like','dislike','like','dislike'],'fixed alternating preference cues');
 const order=await page.locator('[data-row="degree-0"] .prompt-label').evaluate(e=>e.textContent);check(order.indexOf('作る')<order.indexOf('とても')&&order.indexOf('とても')<order.lastIndexOf('好き'),true,'verb then adverb dropdown then adjective');
 for(const value of ['good','difficult']){
  await page.locator('[data-choice="people-0"]').selectOption(value);
  const row=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(2)[0][0];return {text:r.text,valid:a.matchesAnswer(r.text,r),other:a.matchesAnswer(r.text.replace(r.adjective==='good'?'上手':'苦手',r.adjective==='good'?'苦手':'上手'),r)};});
  check(row.valid,true,'ability selection accepted');check(row.other,false,'ability selection is required');check(row.text.includes(value==='good'?'上手':'苦手'),true,'ability model follows choice');
 }
 for(const adv of ['zenzen','amari','chotto','maamaa','totemo','sugoku']){
  await page.locator('[data-choice="degree-0"]').selectOption(adv);
  const out=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(3)[0][0];return {text:r.text,valid:a.matchesAnswer(r.text,r),opposite:a.matchesAnswer(r.text.includes('じゃない')?r.text.replace('じゃない',''):r.text.replace('です','じゃないです'),r)};});
  check(out.valid,true,'selected degree accepted '+adv);check(out.opposite,false,'wrong polarity rejected '+adv);check(out.text.includes('じゃない'),['zenzen','amari'].includes(adv),'degree polarity '+adv);
 }
 await page.locator('[data-response="self-3-response"][data-answer="yes"]').click();
 const variants=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[3][1];return a.matchesAnswer('はい、洗濯するのがきらいです',r);});check(variants,true,'する noun full reply variant');
 await page.locator('[data-set="situations"]').click();check(await page.locator('#drill5 tr').count(),5,'five separate situations');
 check(await page.locator('[data-row="situation-0"] .recording-actions button').first().isDisabled(),true,'target expression required');
 for(const [i,value]of ['bad','strong','good','bad','good'].entries())await page.locator(`[data-choice="situation-${i}"]`).selectOption(value);
 const feedback=await page.evaluate(()=>{const a=audit81,out=[];for(const rs of a.rowsFor(4)){const r=rs[0];for(const adjective of ['good','bad','strong','difficult']){const text=a.sentenceFor(r,'formal',true,adjective);out.push({id:r.id,adjective,correct:a.matchesAnswer(text,r),label:a.feedback(r,text)?.label});}}return out;});
 for(const r of feedback)check(r.correct,true,'grammatical alternative remains correct '+r.id+' '+r.adjective);
 check(feedback.find(r=>r.id==='situation-0'&&r.adjective==='bad').label,'Sounds modest. ✓ Matches the target.','modest target');
 check(feedback.find(r=>r.id==='situation-1'&&r.adjective==='strong').label,'Sounds confident. ✓ Matches the target.','confident target');
 check(feedback.find(r=>r.id==='situation-2'&&r.adjective==='good').label,'May sound boastful. ✓ Matches the target.','boastful target');
 check(feedback.find(r=>r.id==='situation-3'&&r.adjective==='bad').label,'May sound rude. ✓ Matches the target.','rude target');
 check(feedback.find(r=>r.id==='situation-4'&&r.adjective==='good').label,'May sound arrogant. ✓ Matches the target.','arrogant target');
 check(await page.evaluate(()=>audit81.rowsFor(4)[4][0].text),'日本語の先生は、日本語が上手です。','expert teacher example');
 // Record and verify zero configured relay gap, saved raw, and selection-specific records.
 await page.locator('label.switch').first().click();
 await page.locator('[data-response="self-0-response"][data-answer="yes"]').click();
 await page.locator('[data-row="self-0-response"] button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length>0);
 await page.evaluate(()=>{t.speaking=true;const result=[{transcript:'  本を読むのが好きです。　'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 check(await page.locator('[data-choice="degree-0"]').isDisabled(),true,'selections lock while recording');
 await page.locator('.stop-btn-active').click();await page.waitForFunction(()=>t.spoken.length>2);
 const zero=await page.evaluate(()=>{const before=t.audios.length;t.spoken.at(-1).onend();return t.audios.length===before+1;});check(zero,true,'same callback relay');
 check(await page.locator('[data-row="self-0-response"] .result-text').textContent().then(t=>t.includes('✅')),true,'actual recognition graded');
 await page.locator('[data-response="self-0-response"][data-answer="no"]').click();check(await page.locator('[data-row="self-0-response"] .result-text').textContent(),'(Not recorded yet)','different choice independent');
 check(await page.evaluate(()=>t.audios.at(-1).paused),true,'selection cancels own relay');
 await page.locator('[data-response="self-0-response"][data-answer="yes"]').click();check(await page.locator('[data-row="self-0-response"] .result-text').textContent().then(t=>t.includes('✅')),true,'return restores recorded result');
 // A saved result must not acquire a social judgment just from redrawing it.
 check(await page.locator('#drill2 .p81-feedback:not([hidden])').count(),0,'no pragmatics outside D5');
 check(await page.evaluate(()=>audit81.saved.get('self-0-response:yes').raw),'  本を読むのが好きです。　','recognition raw whitespace saved');
 await page.locator('[data-row="situation-0"] button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length===2);
 await page.evaluate(()=>{const result=[{transcript:'私は漢字を書くのが上手です。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await page.locator('.stop-btn-active').click();await page.waitForFunction(()=>audit81.saved.has('situation-0:bad'));
 check(await page.locator('[data-row="situation-0"] .result-text').textContent().then(s=>s.includes('✅')),true,'actual grammatical result independent of situation');
 check(await page.locator('[data-row="situation-0"] .p81-feedback').textContent(),'May sound boastful. Try the target: Modest.','actual speech feedback based on spoken adjective');
 await page.locator('#scriptModeControl [data-value="hiragana"]').click();
 check(await page.locator('[data-row="situation-0"] .p81-feedback').textContent(),'May sound boastful. Try the target: Modest.','feedback snapshot survives redraw');
 check(await page.locator('[data-row="situation-0"] .result-text').textContent().then(s=>s.includes('わたしはかんじをかくのがじょうずです')),true,'new vocabulary follows Hiragana display');
 await page.locator('#scriptModeControl [data-value="kanji"]').click();
 
 for(const width of [375,600,900,1440,1920])for(const scheme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:scheme});
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,panels:[...document.querySelectorAll('.example-box')].map(e=>e.nextElementSibling.getBoundingClientRect().top-e.getBoundingClientRect().bottom),colors:[getComputedStyle(document.querySelector('.p81-degree-point.negative')).color,getComputedStyle(document.querySelector('.p81-degree-point.positive')).color]}));
  check(layout.overflow,false,'no page overflow '+width+' '+scheme);check(await page.locator('#drill1 .p81-gold').first().evaluate(e=>getComputedStyle(e).color),scheme==='dark'?'rgb(251, 191, 36)':'rgb(202, 138, 4)','gold follows common theme specification');check(layout.panels.every(g=>Math.abs(g-24)<.5),true,'shared Example spacing');check(layout.colors[0]===layout.colors[1],false,'polarity colors differ');
  if(width===1440){
   const tracks=await page.evaluate(()=>[...document.querySelectorAll('.p81-section')].map(s=>[...s.querySelectorAll('.p81-card .recording-actions')].map(e=>e.getBoundingClientRect().left)));
   for(const xs of tracks)check(Math.max(...xs)-Math.min(...xs)<1,true,'listen column shared by longest cue');
   for(const xs of await page.locator('.example-box').evaluateAll(es=>es.map(e=>[...e.querySelectorAll('button')].map(b=>b.getBoundingClientRect().left))))check(Math.max(...xs)-Math.min(...xs)<1,true,'Example listen columns aligned');
   const baselineDeltas=await page.locator('.p81-example-row').evaluateAll(rows=>rows.map(row=>{const b=row.querySelector('button'),m=row.querySelector('.p81-model');const baseline=e=>{const mark=document.createElement('span');mark.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';e.prepend(mark);const y=mark.getBoundingClientRect().top;mark.remove();return y;};return baseline(b)-baseline(m);}));
   for(const delta of baselineDeltas)check(Math.abs(delta)<.5,true,'Example button and model text baseline align');

   await page.screenshot({path:'/tmp/practice81-'+scheme+'.png',fullPage:true});
   await page.locator('#drill4').screenshot({path:'/tmp/practice81-degree-'+scheme+'.png'});
   await page.locator('#drill5').screenshot({path:'/tmp/practice81-feedback-'+scheme+'.png'});
  }
 }
 const wrong=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(0)[0][1],key=a.keyFor(r),raw='Ａ　３，０００？\n  なにですか';a.saved.set(key,{raw,modelText:r.text,refs:r.refs,correct:false});a.showResult(key);const v=a.views.get(key);return {raw:a.saved.get(key).raw,text:v.result.textContent.replaceAll('＿',''),shown:!v.correction.hidden&&getComputedStyle(v.correction).display!=='none',feedback:!v.feedback.hidden};});
 check(wrong.text,wrong.raw,'actual wrong-answer display preserves original characters');check(wrong.shown,true,'retry message visible');check(wrong.feedback,false,'unrecognized speech receives no social judgment');
 check(errors,[],'no runtime errors');
 await browser.close();console.log('PASS Practice 8.1',checks);
})().catch(e=>{console.error(e);process.exit(1)});
