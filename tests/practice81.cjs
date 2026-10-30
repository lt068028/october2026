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
   source=s.slice(0,i)+`window.audit81={rowsFor,matchesAnswer,feedback,sentenceFor,makeRow,keyFor,saved,views,choices,showResult,normalize,sections,set:()=>situationSet};`+s.slice(i);
  }
  return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/png'});
 });
 await page.goto('http://practice81.test/practice8.1.html');
 check(errors,[],'initial render');
 check(await page.locator('.p81-section').count(),5,'five Drills');
 check(await page.locator('.example-box').count(),5,'five preceding Examples');
 check(await page.locator('.info-panel-desc').allTextContents().then(a=>a.every(s=>s.startsWith('💡'))),true,'instructions start with bulb');
 check(await page.locator('#drill1 tr').count(),6,'three paired comparisons');
 check(await page.locator('#drill2 select').count(),4,'four personal preferences');
 check(await page.locator('#drill3 tr').count(),6,'six people');
 check(await page.locator('#drill4 select').count(),6,'six degree rows');
 check(await page.locator('#drill5 tr').count(),8,'four Skill Comfort pairs');
 const comparisons=await page.evaluate(()=>audit81.rowsFor(0).map(rs=>rs.map(r=>r.text)));
 check(comparisons,[['本が好きです。','本を読むのが好きです。'],['音楽が好きです。','音楽を聞くのが好きです。'],['写真が好きです。','写真を撮るのが好きです。']],'noun versus action');
 for(const style of ['formal','informal','casual']) {
  await page.locator('#speechStyleControl [data-value="'+style+'"]').click();
  const outcomes=await page.evaluate(()=>{
   const a=audit81,out=[];
   for(let si=0;si<5;si++)for(const rs of a.rowsFor(si))for(const r of rs){
    out.push([r.id,'model',a.matchesAnswer(r.text,r),a.matchesAnswer(r.hira,r)]);
    out.push([r.id,'unrelated',a.matchesAnswer(r.text.replace(/[。]$/,'猫。'),r)]);
    if(!r.noun)out.push([r.id,'required nominalizer',a.matchesAnswer(r.text.replace('のが','が'),r)]);
   }
   return out;
  });
  for(const [id,label,...result]of outcomes)for(const value of result)check(value,label==='model',`${style} ${id} ${label}`);
  for(const script of ['hiragana','kanji']){
   await page.locator('#scriptModeControl [data-value="'+script+'"]').click();
   for(const hint of ['off','hover','paren']){
    await page.locator('#hintModeControl [data-value="'+hint+'"]').click();
    check(await page.locator('.p81-card').count(),23,`${style}/${script}/${hint} content retained`);
    check(await page.locator('.example-box .p81-gold').count(),7,'gold structure in all Examples');
   }
  }
 }
 await page.locator('#speechStyleControl [data-value="formal"]').click();await page.locator('#scriptModeControl [data-value="kanji"]').click();await page.locator('#hintModeControl [data-value="hover"]').click();
 const self=page.locator('[data-choice="self-0"]');await self.selectOption('dislike');
 check(await page.evaluate(()=>audit81.rowsFor(1)[0][0].text),'本を読むのがきらいです。','personal choice model');
 const forms=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[0][0];return [a.matchesAnswer('私は本を読むのがきらいです',r),a.matchesAnswer('本がきらいです',r),a.matchesAnswer('本を読むのが好きです',r)];});
 check(forms,[true,false,false],'self omission allowed, action and selected preference required');
 for(const adv of ['zenzen','amari','chotto','maamaa','totemo','sugoku']){
  await page.locator('[data-choice="degree-0"]').selectOption(adv);
  const out=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(3)[0][0];return {text:r.text,valid:a.matchesAnswer(r.text,r),opposite:a.matchesAnswer(r.text.includes('じゃない')?r.text.replace('じゃない',''):r.text.replace('です','じゃないです'),r)};});
  check(out.valid,true,'selected degree accepted '+adv);check(out.opposite,false,'wrong polarity rejected '+adv);check(out.text.includes('じゃない'),['zenzen','amari'].includes(adv),'degree polarity '+adv);
 }
 const variants=await page.evaluate(()=>{const a=audit81;return ['料理','洗濯'].map((s,i)=>{const r=a.rowsFor(1)[i===0?0:3][0];return i===0?a.matchesAnswer('本を読むのがきらいです',r):a.matchesAnswer('洗濯するのがきらいです',r);});});check(variants,[true,true],'する noun variant');
 await page.locator('[data-set="situations"]').click();check(await page.locator('#drill5 tr').count(),5,'five separate situations');
 const feedback=await page.evaluate(()=>{const a=audit81,out=[];for(const rs of a.rowsFor(4)){const r=rs[0];for(const adjective of ['good','bad','strong','difficult']){const text=a.sentenceFor(r,'formal',true,adjective);out.push({id:r.id,adjective,correct:a.matchesAnswer(text,r),label:a.feedback(r,text)?.label});}}return out;});
 for(const r of feedback)check(r.correct,true,'grammatical alternative remains correct '+r.id+' '+r.adjective);
 check(feedback.find(r=>r.id==='situation-1'&&r.adjective==='good').label,'May sound boastful.','self praise');
 check(feedback.find(r=>r.id==='situation-0'&&r.adjective==='bad').label,'May sound too direct.','other direct criticism');
 check(feedback.find(r=>r.id==='situation-1'&&r.adjective==='bad').label,'Sounds modest.','self modest');
 check(feedback.find(r=>r.id==='situation-2'&&r.adjective==='strong').label,'Sounds confident.','self strength');
 // Record and verify zero configured relay gap, saved raw, and selection-specific records.
 await page.locator('label.switch').first().click();
 await page.locator('[data-choice="self-0"]').selectOption('like');
 await page.locator('[data-row="self-0"] button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length>0);
 await page.evaluate(()=>{t.speaking=true;const result=[{transcript:'  本を読むのが好きです。　'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 check(await page.locator('[data-choice="degree-0"]').isDisabled(),true,'selections lock while recording');
 await page.locator('.stop-btn-active').click();await page.waitForFunction(()=>t.spoken.length>0);
 const zero=await page.evaluate(()=>{const before=t.audios.length;t.spoken.at(-1).onend();return t.audios.length===before+1;});check(zero,true,'same callback relay');
 check(await page.locator('[data-row="self-0"] .result-text').textContent().then(t=>t.includes('✅')),true,'actual recognition graded');
 await page.locator('[data-choice="self-0"]').selectOption('dislike');check(await page.locator('[data-row="self-0"] .result-text').textContent(),'(Not recorded yet)','different choice independent');
 check(await page.evaluate(()=>t.audios.at(-1).paused),true,'selection cancels own relay');
 await page.locator('[data-choice="self-0"]').selectOption('like');check(await page.locator('[data-row="self-0"] .result-text').textContent().then(t=>t.includes('✅')),true,'return restores recorded result');
 // A saved result must not acquire a social judgment just from redrawing it.
 check(await page.locator('#drill2 .p81-feedback:not([hidden])').count(),0,'no pragmatics outside D5');
 check(await page.evaluate(()=>audit81.saved.get('self-0:like').raw),'  本を読むのが好きです。　','recognition raw whitespace saved');
 await page.locator('[data-row="situation-1"] button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length===2);
 await page.evaluate(()=>{const result=[{transcript:'私は漢字を書くのが上手です。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await page.locator('.stop-btn-active').click();await page.waitForFunction(()=>audit81.saved.has('situation-1:bad'));
 check(await page.locator('[data-row="situation-1"] .result-text').textContent().then(s=>s.includes('✅')),true,'actual grammatical result independent of situation');
 check(await page.locator('[data-row="situation-1"] .p81-feedback').textContent(),'May sound boastful.','actual speech feedback based on spoken adjective');
 await page.locator('#scriptModeControl [data-value="hiragana"]').click();
 check(await page.locator('[data-row="situation-1"] .p81-feedback').textContent(),'May sound boastful.','feedback snapshot survives redraw');
 check(await page.locator('[data-row="situation-1"] .result-text').textContent().then(s=>s.includes('わたしはかんじをかくのがじょうずです')),true,'new vocabulary follows Hiragana display');
 await page.locator('#scriptModeControl [data-value="kanji"]').click();
 
 for(const width of [375,600,900,1440,1920])for(const scheme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:scheme});
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,panels:[...document.querySelectorAll('.example-box')].map(e=>e.nextElementSibling.getBoundingClientRect().top-e.getBoundingClientRect().bottom),colors:[getComputedStyle(document.querySelector('.p81-degree-point.negative')).color,getComputedStyle(document.querySelector('.p81-degree-point.positive')).color]}));
  check(layout.overflow,false,'no page overflow '+width+' '+scheme);check(layout.panels.every(g=>Math.abs(g-24)<.5),true,'shared Example spacing');check(layout.colors[0]===layout.colors[1],false,'polarity colors differ');
  if(width===1440){
   const tracks=await page.evaluate(()=>[...document.querySelectorAll('.p81-section')].map(s=>[...s.querySelectorAll('.p81-card .recording-actions')].map(e=>e.getBoundingClientRect().left)));
   for(const xs of tracks)check(Math.max(...xs)-Math.min(...xs)<1,true,'listen column shared by longest cue');
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
