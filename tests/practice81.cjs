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
   source=s.slice(0,i)+`window.audit81={rowsFor,matchesAnswer,feedback,sentenceFor,makeRow,keyFor,saved,views,choices,showResult,normalize,speechText,sections,comparisons};`+s.slice(i);
  }
  return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/png'});
 });
 await page.goto('http://practice81.test/practice8.1.html');
 check(errors,[],'initial render');
 check(await page.locator('.p81-gold').evaluateAll(es=>es.every(e=>e.classList.contains('grammar-highlight'))),true,'gold uses the common class');
 check(/p81-gold[^{}]*\{[^}]*color\s*:/.test(fs.readFileSync(path.join(root,'style.css'),'utf8')),false,'no duplicated page-specific gold color');
 check(await page.locator('.p81-section').count(),5,'five Drills');
 check(await page.locator('.example-box').count(),5,'five preceding Examples');
 check(await page.locator('.example-box').evaluateAll(es=>es.every(e=>e.classList.contains('example-text-layout'))),true,'Examples use common alignment component');
 check(await page.locator('.p81-kind,.p81-target').evaluateAll(es=>es.every(e=>e.classList.contains('example-label-title'))),true,'ordinary headings use Practice 1 component');
 check(await page.locator('#drill1 .example-box .p81-kind').allTextContents(),['Noun','Verb＋の'],'labels identify the compared forms');
 check(await page.locator('#drill1 .p81-card .p81-kind').count(),0,'Noun and Verb labels are Example-only');
 check(await page.locator('.p81-example-row > button').evaluateAll(es=>es.every(e=>getComputedStyle(e).alignSelf==='auto')),true,'no page-specific vertical alignment override');
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
 check(await page.locator('#drill3 tr').count(),4,'four people');
 check(await page.locator('#drill3 .p81-card select').count(),4,'four ability selectors');
 check(await page.locator('#drill3 .example-box button').count(),2,'two ability Examples');
 check(await page.locator('#drill4 .example-box button').count(),6,'six degree Examples');
 check(await page.locator('#drill4 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['料理を作るのがぜんぜん好きじゃないです。','〃のがあまり好きじゃないです。','〃のがちょっと好きです。','〃のがまぁまぁ好きです。','〃のがとても好きです。','〃のがすごく好きです。'],'degree Examples abbreviate the repeated action with ditto marks while retaining のが');
 check(await page.locator('#drill4 .example-box .p81-example-cue').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['料理／作る／ぜんぜん／好き','〃あまり／好き','〃ちょっと／好き','〃まぁまぁ／好き','〃とても／好き','〃すごく／好き'],'only the first degree cue repeats the common action');
 check(await page.locator('#drill4 .example-box .p81-ditto').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))),Array(5).fill('料理を作る'),'ditto marks retain the omitted meaning for accessibility');
 for(const style of ['formal','informal','casual'])for(const script of ['kanji','hiragana']){
  await page.locator(`#speechStyleControl [data-value="${style}"]`).click();
  await page.locator(`#scriptModeControl [data-value="${script}"]`).click();
  const prefixes=await page.locator('#drill4 .example-box .p81-ditto').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));
  check(prefixes,Array(5).fill(script==='kanji'?'料理を作る':'りょうりをつくる'),'ditto follows the selected script');
  for(let i=0;i<6;i++){
   await page.locator('#drill4 .example-box button').nth(i).click();
   const ending=i<2?(style==='formal'?'じゃないです。':'じゃない。'):(style==='formal'?'です。':style==='casual'?'だよ。':'だ。');
   check(await page.evaluate(()=>t.spoken.at(-1).text),'料理を作るのが'+['ぜんぜん','あまり','ちょっと','まぁまぁ','とても','すごく'][i]+'好き'+ending,'all six abbreviated Examples still speak the full sentence');
   await page.evaluate(()=>t.spoken.at(-1).onend());
  }
 }
 await page.locator('#speechStyleControl [data-value="formal"]').click();
 await page.locator('#scriptModeControl [data-value="kanji"]').click();
 check(await page.locator('#drill4 select').count(),6,'six degree rows');
 check(await page.locator('#drill5 tr').count(),14,'both rows of all seven expression pairs stay visible');
 check(await page.locator('#drill5 .p81-card').evaluateAll(es=>es.every(e=>e.querySelectorAll('tr').length===2)),true,'two fixed rows per situation');
 check(await page.locator('#drill5 [data-set],#drill5 .p81-tabs,#drill5 .p81-target').count(),0,'no set buttons or target tasks');
 check(await page.locator('#drill5 .p81-card select').count(),14,'one adjective quiz per row');
 check(await page.locator('#drill5 .example-box .p81-kind').allTextContents(),['Skillful','Observed'],'one-word meaning labels');
 check(await page.evaluate(()=>{const ex=[...document.querySelectorAll('#drill5 .example-box .p81-model')].map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return audit81.normalize(c.textContent);});return audit81.rowsFor(4).flat().every(r=>!ex.includes(audit81.normalize(r.text)));}),true,'D5 never repeats an Example5 model');
  check(await page.locator('#drill3 .example-box .p81-example-cue').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['妹／写真／撮る／上手','〃／苦手'],'Example3 second cue abbreviates the complete repeated subject and action');
  check(await page.locator('#drill5 .example-box .p81-example-cue').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['姉／ギター／弾く／上手','〃／得意'],'Example5 second cue abbreviates the repeated subject and action');
  check(await page.locator('#drill5 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['姉は、ギターを弾くのが上手です。','〃のが得意です。'],'Example5 second model retains のが after ditto');
  check(await page.locator('#drill3 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['妹は、写真を撮るのが上手です。','〃のが苦手です。'],'Example3 second model retains のが after ditto');

 check(await page.locator('#drill4 .recording-actions button').evaluateAll(es=>es.every(e=>e.disabled&&e.getAttribute('aria-disabled')==='true')),true,'Dr4 listen, record, and stop buttons start locked before activity selection across all 6 rows');
 await page.locator('[data-choice="degree-0"]').selectOption('washDish');
 check(await page.locator('[data-row="degree-0"] .recording-actions button').evaluateAll(es=>es.map(e=>e.disabled)),[false,false,true],'Dr4 selected row unlocks listen and record while stop stays locked');
 check(await page.locator('[data-row="degree-1"] .recording-actions button').evaluateAll(es=>es.map(e=>e.disabled)),[true,true,true],'Dr4 unselected rows remain locked');
 await page.locator('[data-choice="degree-0"]').selectOption('');
 check(await page.locator('[data-row="degree-0"] .recording-actions button').evaluateAll(es=>es.map(e=>e.disabled)),[true,true,true],'Dr4 clearing activity re-locks listen and record');

 check(await page.locator('#drill5 .p81-impression-choice').count(),0,'impression selection replaced by fixed row labels');
 check(await page.locator('#drill5 .recording-actions button').evaluateAll(es=>es.filter(e=>/きく|とる/.test(e.textContent)).every(e=>e.disabled)),true,'model and recording wait for matching adjective');
 check(await page.locator('#drill5 .p81-impression-result:not([hidden])').count(),0,'no impression choice preselected');
 check(await page.locator('#drill5 .example-box .p81-gold').allTextContents(),['は','のが','のが'],'Example5 topic and nominalizer highlighted');
 check(await page.locator('#drill2 .example-box button').allTextContents(),['🔊きく','🔊🙆','🔊🙅'],'question, Yes and No model buttons');
 check(await page.locator('#drill2 .example-box .p81-model').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['テレビを見るのが好きですか。','はい、好きです。','いいえ、好きじゃないです。'],'affirmative and negative models always visible');
 for(const label of ['🔊🙆','🔊🙅']){
  const before=await page.evaluate(()=>t.spoken.length);const selections=await page.locator('#drill2 .answer-choice').evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed')));await page.locator('#drill2 .example-box button').filter({hasText:label}).click();
  check(await page.evaluate(()=>t.spoken.at(-1).text),label==='🔊🙆'?'はい、好きです。':'いいえ、好きじゃないです。','independent response TTS');
  await page.evaluate(()=>t.spoken.at(-1).onend());check(await page.evaluate(()=>t.spoken.length),before+1,'Example playback does not select Drill response');check(await page.locator('#drill2 .answer-choice').evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed'))),selections,'Example leaves Y/N selections unchanged');
 }
 for(const r of await page.evaluate(()=>audit81.rowsFor(4).flat().map(r=>({id:r.id,expected:r.adjective,other:r.options.find(x=>x!==r.adjective)})))){
  const row=page.locator(`[data-row="${r.id}"]`);
  await row.locator('select').selectOption(r.other);
  check(await row.locator('.recording-actions button').first().isDisabled(),true,'mismatched adjective stays locked');
  await row.locator('select').selectOption(r.expected);
  check(await row.locator('.recording-actions button').first().isDisabled(),false,'matching adjective unlocks');
 }
 const comparisons=await page.evaluate(()=>audit81.rowsFor(0).map(rs=>rs.map(r=>r.text)));
 check(comparisons,[['本が好きです。','本を読むのが好きです。'],['音楽が好きです。','音楽を聞くのが好きです。'],['自転車が好きです。','自転車に乗るのが好きです。']],'noun versus action');
 check(await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[0][0];return [a.matchesAnswer('あなたはコーヒーを飲むのが好きですか',r),a.matchesAnswer('私はコーヒーを飲むのが好きですか',r)];}),[true,false],'question addresses the listener');
 for(let i=0;i<6;i++){
  const acts=['washDish','discardThing','useSmartphone','cutHair','carryBag','beginStudy'];
  await page.locator(`[data-choice="degree-${i}"]`).selectOption(acts[i]);
 }
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
    check(await page.locator('.p81-card').count(),24,`${style}/${script}/${hint} content retained`);
    check(await page.locator('#drill4 .example-box .p81-gold').count(),6,'all six degree models show the nominalizer');
   }
  }
 }
 await page.locator('#speechStyleControl [data-value="formal"]').click();await page.locator('#scriptModeControl [data-value="kanji"]').click();await page.locator('#hintModeControl [data-value="hover"]').click();
 await page.locator('[data-response="self-0-response"][data-answer="no"]').click();
 check(await page.evaluate(()=>audit81.rowsFor(1)[0][1].text),'いいえ、好きじゃないです。','short No model');
 const forms=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[0][1];return [a.matchesAnswer('私はコーヒーを飲むのが好きじゃないです',r),a.matchesAnswer('いいえ、好きじゃないです',r),a.matchesAnswer('はい、好きです',r)];});
 check(forms,[true,true,false],'full or short negative accepted, opposite rejected');
 check(await page.evaluate(()=>audit81.rowsFor(1).map(rs=>rs[0].adjective)),['like','dislike','like','dislike'],'fixed alternating preference cues');
 for(const value of ['good','difficult']){
  await page.locator('[data-choice="people-0"]').selectOption(value);
  const row=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(2)[0][0];return {text:r.text,valid:a.matchesAnswer(r.text,r),other:a.matchesAnswer(r.text.replace(r.adjective==='good'?'上手':'苦手',r.adjective==='good'?'苦手':'上手'),r)};});
  check(row.valid,true,'ability selection accepted');check(row.other,false,'ability selection is required');check(row.text.includes(value==='good'?'上手':'苦手'),true,'ability model follows choice');
 }
 for(let i=0;i<6;i++){
  const out=await page.evaluate(idx=>{const a=audit81,r=a.rowsFor(3)[idx][0];return {text:r.text,valid:a.matchesAnswer(r.text,r),opposite:a.matchesAnswer(r.text.includes('じゃない')?r.text.replace('じゃない',''):r.text.replace('です','じゃないです'),r),negative:['zenzen','amari'].includes(r.adverb)};},i);
  check(out.valid,true,'selected degree accepted '+i);check(out.opposite,false,'wrong polarity rejected '+i);check(out.text.includes('じゃない'),out.negative,'degree polarity '+i);
 }
 await page.locator('[data-response="self-1-response"][data-answer="yes"]').click();
 const variants=await page.evaluate(()=>{const a=audit81,r=a.rowsFor(1)[1][1];return a.matchesAnswer('はい、洗濯をするのがきらいです',r);});check(variants,true,'する noun full reply variant');
 const expectedPairs=[['good','strong'],['bad','difficult'],['difficult','bad'],['strong','good'],['good','strong'],['difficult','bad'],['good','strong']];
 check(await page.evaluate(()=>audit81.comparisons.map(r=>r.options)),expectedPairs,'same-situation option pairs');
 check(await page.evaluate(()=>{const a=audit81,d5=a.rowsFor(4);return [d5[0][0].text,d5[3][0].text,a.matchesAnswer('父は料理をするのが上手です。',d5[0][0]),a.matchesAnswer('早く起きるのが苦手です。',d5[2][0]),a.matchesAnswer('英語を話すのが苦手です。',d5[1][1]),a.matchesAnswer('掃除するのが得意です。',d5[3][0])];}),['父は、料理するのが上手です。','私は、掃除するのが得意です。',true,true,true,true],'D5 suru-verbs use no-を model while accepting を, and first-person D5 rows accept omitted 私は');
 for(const [i,pair]of expectedPairs.entries())for(const value of pair){
  const id=`comparison-${i}-${value}`,row=page.locator(`[data-row="${id}"]`);
  const out=await page.evaluate(([i,value])=>{const a=audit81,r=a.rowsFor(4)[i].find(r=>r.adjective===value),other=r.options.find(x=>x!==r.adjective);return {text:r.text,correct:a.matchesAnswer(r.text,r),wrong:a.matchesAnswer(a.sentenceFor(r,'formal',true,other),r),feedback:a.feedback(r,r.text),labels:r.options.map(x=>r.impressionWords[x])};},[i,value]);
  check(out.correct,true,'fixed comparison model accepted');check(out.wrong,false,'other expression belongs to its own row');
  check(await row.locator('.p81-kind').textContent(),out.labels[pair.indexOf(value)],'English impression specifies the row before recording');
  await row.locator('.recording-actions button').first().click();
  check(await page.evaluate(()=>t.spoken.at(-1).text),out.text,'independent full model for each visible row');await page.evaluate(()=>t.spoken.at(-1).onend());
 }
 // Record and verify zero configured relay gap, saved raw, and selection-specific records.
 await page.locator('label.switch').first().click();
 await page.locator('[data-response="self-0-response"][data-answer="yes"]').click();
 const spokenBeforeRecording=await page.evaluate(()=>t.spoken.length);
 await page.locator('[data-row="self-0-response"] button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length>0);
 await page.evaluate(()=>{t.speaking=true;const result=[{transcript:'  コーヒーを飲むのが好きです。　'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 check(await page.locator('[data-choice="degree-0"]').isDisabled(),true,'selections lock while recording');
 await page.locator('.stop-btn-active').click();await page.waitForFunction(n=>t.spoken.length>n,spokenBeforeRecording);
 const zero=await page.evaluate(()=>{const before=t.audios.length;t.spoken.at(-1).onend();return t.audios.length===before+1;});check(zero,true,'same callback relay');
 check(await page.locator('[data-row="self-0-response"] .result-text').textContent().then(t=>t.includes('✅')),true,'actual recognition graded');
 await page.locator('[data-response="self-0-response"][data-answer="no"]').click();check(await page.locator('[data-row="self-0-response"] .result-text').textContent(),'… Not yet','different choice independent');
 check(await page.evaluate(()=>t.audios.at(-1).paused),true,'selection cancels own relay');
 await page.locator('[data-response="self-0-response"][data-answer="yes"]').click();check(await page.locator('[data-row="self-0-response"] .result-text').textContent().then(t=>t.includes('✅')),true,'return restores recorded result');
 // A saved result must not acquire a social judgment just from redrawing it.
 check(await page.locator('#drill2 .p81-feedback:not([hidden])').count(),0,'no pragmatics outside D5');
 check(await page.evaluate(()=>audit81.saved.get('self-0-response:yes').raw),'  コーヒーを飲むのが好きです。　','recognition raw whitespace saved');
 const first=page.locator('[data-row="comparison-3-good"]'),second=page.locator('[data-row="comparison-3-strong"]');
 await first.locator('button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length===2);
 await page.evaluate(()=>{const result=[{transcript:'私は掃除をするのが上手です。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await page.locator('.stop-btn-active').click();await page.waitForFunction(()=>audit81.saved.has('comparison-3-good:good'));
 check(await first.locator('.result-text').textContent().then(s=>s.includes('✅')),true,'first expression recording correct');
 check(await second.locator('.p81-cue-actions .not-recorded-yet').isHidden(),false,'second recording remains independent');
 await second.locator('button').filter({hasText:'🎙️とる'}).click();
 await page.waitForFunction(()=>t.recognitions.length===3);
 check(await first.locator('.result-text').textContent().then(s=>s.includes('✅')),true,'first result stays on screen while recording the second');
 await page.evaluate(()=>{const result=[{transcript:'私は掃除をするのが得意です。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await page.locator('.stop-btn-active').click();await page.waitForFunction(()=>audit81.saved.has('comparison-3-strong:strong'));
 check(await second.locator('.result-text').textContent().then(s=>s.includes('✅')),true,'second expression recording correct');
 check(await first.locator('.result-text').textContent().then(s=>s.includes('上手')&&s.includes('✅')),true,'first recording still visible after second completes');
 check(await page.evaluate(()=>audit81.saved.get('comparison-3-good:good').url!==audit81.saved.get('comparison-3-strong:strong').url),true,'separate audio for both rows');
 check(await second.locator('.result-text').textContent().then(s=>s.includes('✅')),true,'changing impression never regrades the recording');
 await page.locator('#scriptModeControl [data-value="hiragana"]').click();
 check(await first.locator('.result-text').textContent().then(s=>s.includes('わたしはそうじをするのがじょうずです')),true,'first Hiragana recording survives redraw');
 check(await second.locator('.result-text').textContent().then(s=>s.includes('わたしはそうじをするのがとくいです')),true,'second Hiragana recording survives redraw');
 for(const style of ['casual','formal'])await page.locator(`#speechStyleControl [data-value="${style}"]`).click();
 check(await first.locator('.result-text').textContent().then(s=>s.includes('✅')),true,'style changes preserve first recorded judgment');
 check(await second.locator('.result-text').textContent().then(s=>s.includes('✅')),true,'style changes preserve second recorded judgment');
 await page.locator('#scriptModeControl [data-value="kanji"]').click();
 for(const width of [375,600,900,1440,1920])for(const scheme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:scheme});
  const degree=await page.locator('#drill4 .example-box').evaluate(ex=>{
    const xs=[...ex.querySelectorAll('.p81-degree-cue-tail')].map(e=>e.getBoundingClientRect().right);
    const models=[...ex.querySelectorAll('.p81-model')];
    const firstRect=models[0].getBoundingClientRect(),firstNoga=[...models[0].querySelectorAll('.p81-gold')].find(e=>e.textContent==='のが').getBoundingClientRect();
    const emptyCenter=(firstRect.left+firstNoga.left)/2;
    const ditto=models.slice(1).map(m=>{const b=m.querySelector('.p81-ditto').getBoundingClientRect();return Math.abs((b.left+b.right)/2-emptyCenter);});
    const nogaSpread=models.slice(1).map(m=>{const n=[...m.querySelectorAll('.p81-gold')].find(e=>e.textContent==='のが').getBoundingClientRect();return Math.abs(n.left-firstNoga.left);});
    return {spread:Math.max(...xs)-Math.min(...xs),ditto,nogaSpread};
  });
  check(degree.spread<1,true,'degree cue suffixes share the same right edge next to arrow');
  check(degree.ditto.every(x=>x<1),true,'Example4 ditto centered in empty space before のが');
  check(degree.nogaSpread.every(x=>x<1),true,'Example4 のが aligns vertically across all rows');
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,panels:[...document.querySelectorAll('.example-box')].map(e=>e.nextElementSibling.getBoundingClientRect().top-e.getBoundingClientRect().bottom),colors:[getComputedStyle(document.querySelector('.p81-degree-point.degree-negative')).color,getComputedStyle(document.querySelector('.p81-degree-point.degree-positive')).color]}));
  check(layout.overflow,false,'no page overflow '+width+' '+scheme);
  if(width>600){
   const fit=await page.locator('#drill5').evaluate(group=>{
    const cells=[...group.querySelectorAll('.p81-card .prompt-label')];let right=0;
    for(const cell of cells){const walk=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);while(walk.nextNode()){const t=walk.currentNode;if(!t.textContent.trim()||t.parentElement.closest('.tooltip-tip,.custom-tip-box,select,button'))continue;const range=document.createRange();range.selectNodeContents(t);for(const r of range.getClientRects())right=Math.max(right,r.right);}for(const e of cell.querySelectorAll('select,button'))right=Math.max(right,e.getBoundingClientRect().right);}
    const xs=[...group.querySelectorAll('.recording-actions')].map(e=>e.getBoundingClientRect().left);
    return {gap:Math.min(...xs)-right,spread:Math.max(...xs)-Math.min(...xs),single:cells.every(c=>c.querySelector('select').getBoundingClientRect().top-c.querySelector('.p81-kind').getBoundingClientRect().top<20)};
   });
   check(fit.gap>=3.5&&fit.gap<6,true,'D5 listen follows actual wrapped cue with only column gap '+width+'/'+fit.gap);
   check(fit.spread<1,true,'D5 shared listen column after wrapping');
    const dittoCenters=await page.locator('#drill5 .p81-card').evaluateAll(cards=>cards.map(card=>{const first=card.querySelector('.p81-cue-words[data-repeat-anchor]'),mark=card.querySelector('.p81-cue-words[data-repeat-cue] .p81-repeat-mark');const words=[...first.querySelectorAll('.target-word')],a=words[0].getBoundingClientRect(),b=words.at(-1).getBoundingClientRect(),m=mark.getBoundingClientRect();return Math.abs((m.left+m.right-a.left-b.right)/2);}));
    check(dittoCenters.every(x=>x<1),true,'D5 ditto centered over repeated subject and action '+width);
    const d5SelectDeltas=await page.locator('#drill5 .p81-card').evaluateAll(cards=>cards.map(card=>{const selects=[...card.querySelectorAll('select.p81-select')].map(s=>s.getBoundingClientRect().left);return Math.abs(selects[0]-selects[1]);}));
    check(d5SelectDeltas.every(x=>x<1),true,'D5 paired Adj selects align at exact same horizontal position '+width);
    for(const sel of ['#drill3 .example-box','#drill5 .example-box']){
     const modelAlign=await page.locator(sel).evaluate(ex=>{const rows=[...ex.querySelectorAll('.p81-model')],firstRect=rows[0].getBoundingClientRect(),firstNoga=[...rows[0].querySelectorAll('.p81-gold')].find(e=>e.textContent==='のが').getBoundingClientRect(),secondNoga=[...rows[1].querySelectorAll('.p81-gold')].find(e=>e.textContent==='のが').getBoundingClientRect(),mark=rows[1].querySelector('.p81-ditto').getBoundingClientRect();return {centerDelta:Math.abs((mark.left+mark.right)/2-(firstRect.left+firstNoga.left)/2),nogaDelta:Math.abs(secondNoga.left-firstNoga.left)};});
     check(modelAlign.centerDelta<1,true,sel+' model ditto centered in empty space before のが');
     check(modelAlign.nogaDelta<1,true,sel+' model のが aligns horizontally across rows');
    }

   if(width>=1440)check(fit.single,true,'short labels keep default cues on one line');
  }

  const styles=await page.evaluate(()=>({labels:[...document.querySelectorAll('.p81-kind:not(.conversation-role),.p81-target')].map(e=>{const c=getComputedStyle(e);return [c.color,Number(c.fontWeight),c.backgroundColor];}),adverbs:[...document.querySelectorAll('#drill4 .example-box .p81-model .degree-adverb')].map(e=>{const c=getComputedStyle(e);return [c.color,Number(c.fontWeight)];}),negative:getComputedStyle(document.querySelector('.p81-degree-point.degree-negative')).color,positive:getComputedStyle(document.querySelector('.p81-degree-point.degree-positive')).color}));
  check(styles.labels.every(([c,w,b])=>c===(scheme==='dark'?'rgb(253, 224, 71)':'rgb(245, 127, 23)')&&w>=700&&b==='rgba(0, 0, 0, 0)'),true,'ordinary heading defaults, no badge');
  check(styles.adverbs.length,6,'six emphasized model adverbs');
  check(styles.adverbs.every(([c,w],i)=>c===(i<2?styles.negative:styles.positive)&&w>=700),true,'model adverbs share red/blue guide colors and bold weight');check(await page.locator('#drill1 .p81-gold').first().evaluate(e=>getComputedStyle(e).color),scheme==='dark'?'rgb(251, 191, 36)':'rgb(202, 138, 4)','gold follows common theme specification');check(layout.panels.every(g=>Math.abs(g-24)<.5),true,'shared Example spacing');check(layout.colors[0]===layout.colors[1],false,'polarity colors differ');
  if(width===1440){
   const tracks=await page.evaluate(()=>[...document.querySelectorAll('.p81-section')].map(s=>[...s.querySelectorAll('.p81-card .recording-actions')].map(e=>e.getBoundingClientRect().left)));
   for(const xs of tracks)check(Math.max(...xs)-Math.min(...xs)<1,true,'listen column shared by longest cue');
   const comparisonBaselines=await page.locator('#drill5 tr').evaluateAll(rows=>rows.map(row=>{const baseline=e=>{const mark=document.createElement('span');mark.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';e.prepend(mark);const y=mark.getBoundingClientRect().top;mark.remove();return y;};return baseline(row.querySelector('.p81-cue-body'))-baseline(row.querySelector('.recording-actions button'));}));
   for(const delta of comparisonBaselines)check(Math.abs(delta)<.5,true,'comparison cue and listen text share the first baseline');
   for(const xs of await page.locator('.example-box').evaluateAll(es=>es.map(e=>[...e.querySelectorAll('button')].map(b=>b.getBoundingClientRect().left))))check(Math.max(...xs)-Math.min(...xs)<1,true,'Example listen columns aligned');
   const baselineDeltas=await page.locator('.p81-example-row').evaluateAll(rows=>rows.map(row=>{const b=row.querySelector('button'),m=row.querySelector('.p81-model');const baseline=e=>{const mark=document.createElement('span');mark.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';e.prepend(mark);const y=mark.getBoundingClientRect().top;mark.remove();return y;};return baseline(b)-baseline(m.querySelector('.p81-degree-model-prefix')||m);}));
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
