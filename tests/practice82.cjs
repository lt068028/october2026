// Practice 8.2: current four-Example/four-Drill models, judging and state relay.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8');
const mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];let count=0;
 const eq=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 p.on('pageerror',e=>errors.push(e.message));await p.addInitScript('('+mock.trim()+')();');
 await p.route('http://p82.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});let s=fs.readFileSync(f);if(f.endsWith('practice8.2.js')){s=s.toString();const i=s.lastIndexOf('})();');s=s.slice(0,i)+'window.audit82={rowsFor,makeRow,matchesAnswer,sentenceFor,keyFor,saved,views,choices,speechText,diffTokens,findDiff,render,entriesFor82};'+s.slice(i);}return r.fulfill({body:s,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});});
 await p.goto('http://p82.test/practice8.2.html');
 eq(errors,[],'initial render');eq(await p.locator('h1').textContent(),'Practice 8.2: 何か・何も・何でも','page title');
  eq(await p.locator('#labelAutoRecord .custom-tip-box').innerHTML(),'ON: Stops automatically after 2s of silence.<br>OFF: Uses the stop button.','Autostop hover tooltip breaks before OFF');
  eq(await p.locator('#labelAutoRecord .custom-tip-box').evaluate(el=>getComputedStyle(el).textAlign),'left','Autostop hover tooltip text is left-aligned');
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
 eq(models.d1,['授業で、何か、話します。','学校で、何か、習います。','大学で、何か、教えます。','先生に、何か、聞きます。'],'Drill 1 actual models');
 eq(models.d2.slice(0,4),['何を、読みますか。','何か、読みますか。','何を、書きますか。','何か、書きますか。'],'Drill 2 contrast models');
 eq(models.d3[0],['誕生日に、何か、しますか。','いいえ、何も、しません。'],'Drill 3 question and selected No models');
 eq(models.d4[0],['どんな料理を、作りますか。','何でも、作ります。'],'Drill 4 models');
 const answerChecks=await p.evaluate(()=>{const a=audit82,d1=a.rowsFor(0)[0][0],d2=a.rowsFor(1)[0][0],no=a.rowsFor(2)[0][1],any=a.rowsFor(3)[0][1];return [
  a.matchesAnswer('授業で何か話します',d1),a.matchesAnswer('何か授業で話します',d1),a.matchesAnswer('授業で話します何か',d1),a.matchesAnswer('誕生日に何かしますか',d1),
  a.matchesAnswer('何を読みますか',d2),a.matchesAnswer('何か読みますか',a.rowsFor(1)[0][1]),
  a.matchesAnswer('いいえ、何もします',no),a.matchesAnswer('いいえ、します',no),
  a.matchesAnswer('何でも作ります',any),a.matchesAnswer('何でもを作ります',any),a.matchesAnswer('何でもいいです',any)
 ];});
 eq(answerChecks,[true,true,false,false,true,true,false,false,true,false,false],'accepted and rejected answers');
 for(const style of ['formal','informal','casual']){
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  for(let i=0;i<5;i++)await p.locator(`[data-response="yn-${i}-a"][data-answer="${i%2?'yes':'no'}"]`).click();
  const result=await p.evaluate(()=>[0,1,2,3].flatMap(si=>window.audit82.rowsFor(si).flat()).map(r=>[
   window.audit82.matchesAnswer(r.text,r),window.audit82.matchesAnswer(r.hira,r),window.audit82.matchesAnswer(r.text+'猫',r)
  ]));
  for(const [i,checks]of result.entries())eq(checks,[true,true,false],`${style} model/readings/rejection ${i}`);
 }

 // Casual ending check: statements and replies end with 'よ。', questions end with '？' (never 'よ'), informal statements end with '。'
 await p.locator('#speechStyleControl [data-value="casual"]').click();
 const casualRows=await p.evaluate(()=>({
  d1: window.audit82.rowsFor(0).flat().map(r=>r.text),
  d2: window.audit82.rowsFor(1).flat().map(r=>r.text),
  d3: window.audit82.rowsFor(2).flat().map(r=>r.text),
  d4: window.audit82.rowsFor(3).flat().map(r=>r.text)
 }));
 eq(casualRows.d1.every(t=>t.endsWith('よ。')),true,'Casual Drill 1 statements end with よ。');
 eq(casualRows.d2.every(t=>t.endsWith('？')&&!t.includes('よ')),true,'Casual Drill 2 questions end with ？ without よ');
 eq(casualRows.d3.filter((_,i)=>i%2===0).every(t=>t.endsWith('？')&&!t.includes('よ')),true,'Casual Drill 3 questions end with ？ without よ');
 eq(casualRows.d3.filter((_,i)=>i%2===1).every(t=>t.endsWith('よ。')),true,'Casual Drill 3 replies end with よ。');
 eq(casualRows.d4.filter((_,i)=>i%2===0).every(t=>t.endsWith('？')&&!t.includes('よ')),true,'Casual Drill 4 questions end with ？ without よ');
 eq(casualRows.d4.filter((_,i)=>i%2===1).every(t=>t.endsWith('よ。')),true,'Casual Drill 4 replies end with よ。');

 // Verify TTS spoken text matches 'よ'-bearing text in casual
 const sampleBtn=p.locator('#drill1 .ex-audio-btn').first();
 await sampleBtn.click();
 const spokenCasual=await p.evaluate(()=>t.spoken.at(-1)?.text);
 eq(spokenCasual?.endsWith('よ。'),true,'Casual TTS spoken text ends with よ。');
 await p.evaluate(()=>t.spoken.at(-1).onend());

 // Casual answer acceptance regression tests: with-yo, without-yo, with-yone, but not with-ka
 const d1Item=await p.evaluate(()=>window.audit82.rowsFor(0)[0][0]);
 eq(await p.evaluate((r)=>window.audit82.matchesAnswer('授業で何か話すよ',r),d1Item),true,'Casual accepts answer with よ');
 eq(await p.evaluate((r)=>window.audit82.matchesAnswer('授業で何か話す',r),d1Item),true,'Casual accepts answer without よ');
 eq(await p.evaluate((r)=>window.audit82.matchesAnswer('授業で何か話すよね',r),d1Item),true,'Casual accepts answer with よね');
 eq(await p.evaluate((r)=>window.audit82.matchesAnswer('授業で何か話すね',r),d1Item),true,'Casual accepts answer with ね');
 eq(await p.evaluate((r)=>window.audit82.matchesAnswer('授業で何か話すか',r),d1Item),false,'Casual rejects statement with か');

 // Informal check: statements end with '。' and not 'よ。'
 await p.locator('#speechStyleControl [data-value="informal"]').click();
 const informalD1=await p.evaluate(()=>window.audit82.rowsFor(0).flat().map(r=>r.text));
 eq(informalD1.every(t=>t.endsWith('。')&&!t.endsWith('よ。')),true,'Informal Drill 1 statements end with 。 without よ');
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
 await p.evaluate(() => { t.speaking = true; });
 await yn.locator('.drill-record-btn').click();await p.waitForFunction(()=>t.recognitions.length===1);
 await p.waitForTimeout(350);
 await p.evaluate(()=>{const result=[{transcript:'  いいえ、何も、しません。　'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>audit82.saved.has('yn-0-a:no'));
 eq(await yn.locator('.feedback-status-accepted').count(),1,'recorded D3 No graded');
 eq(await p.evaluate(()=>audit82.saved.get('yn-0-a:no').raw),'  いいえ、何も、しません。　','raw STT retained');
 eq(await p.evaluate(()=>{const n=t.audios.length;t.spoken.at(-1).onend();return t.audios.length===n+1}),true,'zero intentional relay gap');
 const next=p.locator('[data-row="any-0-a"]');await next.locator('.drill-record-btn').click();await p.waitForFunction(()=>t.recognitions.length===2);
 eq(await p.evaluate(()=>t.audios.at(-1).paused),true,'new recording interrupts relay');
 await p.waitForTimeout(350);
 await p.evaluate(()=>{const result=[{transcript:'何でも、作ります。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
 await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>audit82.saved.has('any-0-a:fixed'));
 await p.evaluate(() => { t.speaking = false; });
 eq(await next.locator('.feedback-status-accepted').count(),1,'Drill 4 short model response graded');
 eq(await yn.locator('.feedback-status-accepted').count(),1,'previous D3 recording retained');
 await p.locator('[data-response="yn-0-a"][data-answer="yes"]').click();
 eq(await yn.locator('.feedback-status-accepted').count(),0,'Yes state independent from No');
 await p.locator('[data-response="yn-0-a"][data-answer="no"]').click();
 eq(await yn.locator('.feedback-status-accepted').count(),1,'No result restored after answer switch');
 for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
  await p.locator(`#scriptModeControl [data-value="${mode}"]`).click();await p.locator(`#hintModeControl [data-value="${hint}"]`).click();
  for(const width of [600,1440]){
   await p.setViewportSize({width,height:1000});
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   eq(await p.locator('.example-box').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,`Example fits ${mode}/${hint}/${width}px`);
   eq(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`page fits ${mode}/${hint}/${width}px`);
  }
 }
 await p.locator('#hintModeControl [data-value="hover"]').click();
 await p.waitForTimeout(80);
 for(const width of [600,900,1440])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:1000});await p.emulateMedia({colorScheme:theme});
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  eq(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`page fits ${width}px ${theme}`);
 }
 await p.emulateMedia({colorScheme:'light'});
  // Typography & Computed Font Size Verification (18.2px / 20.8px / 15.6px)
  // 1. Normal STT extracted text: 20.8px
  eq(await p.locator('[data-row="any-0-a"] .result-text').evaluate(el=>getComputedStyle(el).fontSize),'20.8px','Practice 8.2 normal STT text font size is 20.8px');

  // 2. Unrecorded "… Not yet": 15.6px
  eq(await p.locator('[data-row="yn-1-a"] .result-text').evaluate(el=>getComputedStyle(el).fontSize),'15.6px','Practice 8.2 unrecorded Not yet font size is 15.6px');

  // 3. Preparing microphone...: 18.2px
  const prepSize82 = await p.evaluate(() => {
    const v = audit82.views.get('any-1-a:fixed');
    v.result.classList.remove('not-recorded-yet');
    v.result.classList.add('recording-status');
    v.result.textContent = 'Preparing microphone...';
    return getComputedStyle(v.result).fontSize;
  });
  eq(prepSize82, '18.2px', 'Practice 8.2 Preparing microphone... font size is 18.2px');

  // 4. Recording...: 18.2px
  const recSize82 = await p.evaluate(() => {
    const v = audit82.views.get('any-1-a:fixed');
    v.result.textContent = 'Recording...';
    return getComputedStyle(v.result).fontSize;
  });
  eq(recSize82, '18.2px', 'Practice 8.2 Recording... font size is 18.2px');

  // 5. Timeout / Error Notice (.p81-notice): 18.2px
  const noticeSize82 = await p.evaluate(() => {
    const v = audit82.views.get('any-1-a:fixed');
    v.result.classList.remove('recording-status');
    v.result.replaceChildren();
    const note = document.createElement('span');
    note.className = 'p81-notice';
    note.textContent = 'Speech recognition error.';
    v.result.append(note);
    return getComputedStyle(note).fontSize;
  });
  eq(noticeSize82, '18.2px', 'Practice 8.2 .p81-notice font size is 18.2px');

  // 6. Nuance feedback (.p81-feedback): 18.2px
  const feedbackSize82 = await p.evaluate(() => {
    const v = audit82.views.get('any-1-a:fixed');
    v.feedback.textContent = 'Keep going!';
    v.feedback.hidden = false;
    return getComputedStyle(v.feedback).fontSize;
  });
  eq(feedbackSize82, '18.2px', 'Practice 8.2 .p81-feedback font size is 18.2px');

  // 7. Answer correction feedback (.correction-box): 18.2px
  const corrSize82 = await p.evaluate(() => {
    const v = audit82.views.get('any-1-a:fixed');
    v.correction.textContent = 'Correction';
    v.correction.hidden = false;
    return getComputedStyle(v.correction).fontSize;
  });
  eq(corrSize82, '18.2px', 'Practice 8.2 .correction-box font size is 18.2px');

  // Cleanup test row
  await p.evaluate(() => {
    const v = audit82.views.get('any-1-a:fixed');
    v.result.classList.remove('recording-status');
    v.feedback.hidden = true;
    v.correction.hidden = true;
  });

  // 8. Ex <-> Dr mutual exclusion & Drill single playback / stop
  const exBtn = p.locator('.ex-audio-btn').first();
  const drListen = p.locator('#drill1 .drill-listen-btn').first();
  const drRec = p.locator('#drill1 .drill-record-btn').first();
  await exBtn.click();
  eq(await exBtn.evaluate(b => b.classList.contains('is-playing') && !b.disabled), true, 'Ex audio is playing and stoppable');
  eq(await drListen.isDisabled(), true, 'Dr listen disabled during Ex playback');
  eq(await drRec.isDisabled(), true, 'Dr rec disabled during Ex playback');
  await exBtn.click();
  eq(await exBtn.evaluate(b => !b.classList.contains('is-playing')), true, 'Ex audio stops on re-click');
  eq(await drListen.isDisabled(), false, 'Dr listen re-enabled after Ex stop');
  eq(await drRec.isDisabled(), false, 'Dr rec re-enabled after Ex stop');

  await drListen.click();
  eq(await drListen.evaluate(b => b.classList.contains('is-playing') && !b.disabled), true, 'Dr listen shows Stop and is enabled');
  eq(await exBtn.isDisabled(), true, 'Ex audio disabled during Dr listen');
  eq(await p.locator('#drill1 .drill-listen-btn').nth(1).isDisabled(), true, 'Other Dr listen disabled during Dr listen');
  await drListen.click();
  eq(await drListen.evaluate(b => !b.classList.contains('is-playing')), true, 'Dr listen stops on re-click');
  eq(await exBtn.isDisabled(), false, 'Ex audio re-enabled after Dr listen stop');

  // 9. Data preservation on microphone failure (getUserMedia deny)
  await p.evaluate(() => {
    audit82.saved.set('any-1-a:fixed', { url: 'blob:test-keep', raw: 'kept raw', ok: true });
    t.deny = true;
  });
  await drRec.click();
  await p.waitForTimeout(50);
  eq(await p.evaluate(() => audit82.saved.get('any-1-a:fixed')?.raw), 'kept raw', 'Saved data preserved on mic error');
  await p.evaluate(() => {
    audit82.saved.delete('any-1-a:fixed');
    t.deny = false;
  });

  // 10. Drill 2 left question markers (8 rows), separation from Q/A roles, and removal of right .question-indicator
  eq(await p.locator('.question-indicator').count(), 0, 'Practice 8.2 has 0 .question-indicator elements');
  eq(await p.locator('#drill2 .p81-card tr').count(), 8, 'Drill 2 has 8 rows');
  eq(await p.locator('#drill2 .p81-card tr .p82-question-marker').count(), 8, 'Drill 2 has 8 left question markers total');
  eq(await p.locator('#drill2 .p81-card tr').evaluateAll(rows => rows.every(r => r.querySelectorAll('.p82-question-marker').length === 1)), true, 'Each Drill 2 row has exactly 1 left question marker');
  eq(await p.locator('#drill1 .p82-question-marker, #drill3 .p82-question-marker, #drill4 .p82-question-marker').count(), 0, 'Drills 1, 3, 4 have 0 .p82-question-marker elements');
  eq(await p.locator('#drill1 .conversation-role-circle').count(), 0, 'Drill 1 has 0 Q/A role icons');
  eq(await p.locator('#drill2 .conversation-role, #drill2 .conversation-role-circle, #drill2 [aria-label="Question"], #drill2 [aria-label="Answer"]').count(), 0, 'Drill 2 has no Q/A role DOM attributes or role names');
  eq(await p.locator('#drill3 .p81-card .conversation-role-circle[aria-label="Question"]').count(), 5, 'Drill 3 retains 5 Q role icons');
  eq(await p.locator('#drill4 .p81-card .conversation-role-circle[aria-label="Question"]').count(), 3, 'Drill 4 retains 3 Q role icons');
  eq(await p.locator('#drill4 .p81-card .conversation-role-circle[aria-label="Answer"]').count(), 3, 'Drill 4 retains 3 A role icons');

  const markerComparison = await p.evaluate(() => {
    const markerWrap = document.querySelector('#drill2 .p81-card .p82-question-marker');
    const markerIcon = markerWrap?.querySelector('.p82-question-marker-icon');
    const markerSvg = markerIcon?.querySelector('svg');
    const markerPath = markerSvg?.querySelector('path')?.getAttribute('d');
    const cueWords = markerWrap?.parentElement?.querySelector('.p81-cue-words');
    const qaRoleWrap = document.querySelector('#drill3 .p81-card .conversation-role');
    const qaRoleIcon = qaRoleWrap?.querySelector('.conversation-role-icon');
    const qaRoleSvg = qaRoleIcon?.querySelector('svg');
    const qaRolePath = qaRoleSvg?.querySelector('path')?.getAttribute('d');
    const mRect = markerIcon.getBoundingClientRect();
    const cRect = cueWords.getBoundingClientRect();
    const qRect = qaRoleIcon.getBoundingClientRect();
    const mStyle = getComputedStyle(markerWrap);
    const qStyle = getComputedStyle(qaRoleWrap);
    return {
      ariaHidden: markerWrap.getAttribute('aria-hidden'),
      samePath: Boolean(markerPath && markerPath === qaRolePath),
      sameColor: getComputedStyle(markerSvg).color === getComputedStyle(qaRoleSvg).color,
      sameMarginRight: mStyle.marginRight === qStyle.marginRight,
      sameWidth: Math.abs(mRect.width - qRect.width) < 0.5,
      sameHeight: Math.abs(mRect.height - qRect.height) < 0.5,
      leftOfCue: mRect.right <= cRect.left + 1
    };
  });
  eq(markerComparison, {
    ariaHidden: 'true',
    samePath: true,
    sameColor: true,
    sameMarginRight: true,
    sameWidth: true,
    sameHeight: true,
    leftOfCue: true
  }, 'Drill 2 question marker matches Chat Help Filled SVG, color, size, and left-of-cue placement');

  for (const mode of ['hiragana', 'kanji']) {
    await p.locator(`#scriptModeControl [data-value="${mode}"]`).click();
    eq(await p.locator('#drill2 .p81-card tr .p82-question-marker').count(), 8, `Drill 2 retains 8 question markers in scriptMode=${mode}`);
  }
  await p.locator('.drill-cue-button').click();
  eq(await p.locator('#drill2 .p81-card tr .p82-question-marker').count(), 8, 'Drill 2 retains 8 question markers in English cues mode');
  eq(await p.locator('#drill2 .p81-card .p81-cue-words').first().textContent(), 'what / read', 'English cue text unaffected by question marker');
  await p.locator('.drill-cue-button').click();
  eq(await p.locator('#drill2 .p81-card .p81-cue-words').first().evaluate(el => {
    const c = el.cloneNode(true);
    c.querySelectorAll('.tooltip-tip, .custom-tip-box').forEach(x => x.remove());
    return c.textContent;
  }), '何/読む', 'Japanese cue text unaffected by question marker');

  // 11. Grading icons visual parameters, Lucide Footprints SVG, trailing ellipsis, and copy isolation
  const iconAudit = await p.evaluate(async () => {
    const a = audit82;
    const r = a.rowsFor(0)[0][0];
    const key = a.keyFor(r);

    // A. Accepted
    a.saved.set(key, { raw: 'なにかのみます', refs: ['何か飲みます', '何かを飲みます'], status: 'accepted', url: 'blob:test-acc' });
    a.render();
    let row = document.querySelector('tr[data-row="' + r.id + '"]');
    const accSvg = row.querySelector('.feedback-status-accepted svg');
    const accText = row.querySelector('.feedback-accepted-text');
    const accW = Math.round(accSvg.getBoundingClientRect().width);
    const accH = Math.round(accSvg.getBoundingClientRect().height);
    const accTransform = getComputedStyle(accSvg).transform;
    const accGap = Math.round(accText.getBoundingClientRect().left - accSvg.getBoundingClientRect().right);

    // B. Incomplete (standard incomplete string)
    a.saved.set(key, { raw: 'なにかのみま', refs: ['何か飲みます', '何かを飲みます'], status: 'incomplete', url: 'blob:test-inc' });
    a.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const incMark = row.querySelector('.p82-incomplete-mark');
    const incSvg = incMark?.querySelector('.p82-incomplete-svg');
    const incTextNode = Array.from(row.querySelector('.result-text').childNodes).find(n => n.nodeType === 3);
    const incW = Math.round(incSvg.getBoundingClientRect().width);
    const incH = Math.round(incSvg.getBoundingClientRect().height);
    const incTransform = getComputedStyle(incSvg).transform;
    const incAriaHidden = incSvg.getAttribute('aria-hidden');
    const incHasEmoji = incMark.textContent.includes('👣');
    const incKeepCount = row.querySelectorAll('.feedback-retry-label').length;
    const incHasEllipsis = incTextNode?.textContent.endsWith('…');
    const incRawSaved = a.saved.get(key).raw;
    const incCopyEntry = a.entriesFor82(0)[0];

    // C. Incomplete with existing terminal characters (no duplicate ellipsis)
    const terminalTests = ['なにかのみま…', 'なにかのみま...', 'なにかのみます。', 'なにかのみます.'];
    const terminalResults = [];
    for (const raw of terminalTests) {
      a.saved.set(key, { raw, refs: ['何か飲みます'], status: 'incomplete' });
      a.render();
      row = document.querySelector('tr[data-row="' + r.id + '"]');
      const text = Array.from(row.querySelector('.result-text').childNodes).find(n => n.nodeType === 3)?.textContent || '';
      terminalResults.push({
        raw,
        rendered: text,
        noDoubleEllipsis: !text.endsWith('……') && !text.endsWith('...…') && !text.endsWith('。…') && !text.endsWith('.…')
      });
    }

    // D. Mismatch
    a.saved.set(key, { raw: 'ちがうことば', refs: ['何か飲みます'], status: 'mismatch', url: 'blob:test-mis' });
    a.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const misFire = row.querySelector('.feedback-retry-fire');
    const misKeep = row.querySelector('.feedback-retry-label');
    const misW = Math.round(misFire.getBoundingClientRect().width);
    const misH = Math.round(misFire.getBoundingClientRect().height);
    const misTransform = getComputedStyle(misFire).transform;
    const misKeepMargin = getComputedStyle(misKeep).marginLeft;
    const misKeepTransform = getComputedStyle(misKeep).transform;
    const misFireRegular = misFire.getAttribute('fill') === 'currentColor';

    return {
      acc: { w: accW, h: accH, transform: accTransform, gap: accGap },
      inc: {
        w: incW,
        h: incH,
        transform: incTransform,
        ariaHidden: incAriaHidden,
        hasEmoji: incHasEmoji,
        hasKeep: incKeepCount > 0,
        hasEllipsis: incHasEllipsis,
        rawUnchanged: incRawSaved === 'なにかのみま',
        copyClean: !incCopyEntry.endsWith('…')
      },
      terminalResults,
      mis: {
        w: misW,
        h: misH,
        transform: misTransform,
        keepMargin: misKeepMargin,
        keepTransform: misKeepTransform,
        isRegular: misFireRegular
      }
    };
  });

  eq(iconAudit.acc.w, 24, 'Accepted icon width is 24px');
  eq(iconAudit.acc.h, 24, 'Accepted icon height is 24px');
  eq(iconAudit.acc.gap, 2, 'Accepted icon gap is 2px');
  eq(iconAudit.inc.w, 25, 'Incomplete Lucide Footprints width is 25px');
  eq(iconAudit.inc.h, 25, 'Incomplete Lucide Footprints height is 25px');
  eq(iconAudit.inc.transform, 'matrix(1, 0, 0, 1, 0, -0.5)', 'Incomplete Footprints y-offset is -0.5px');
  eq(iconAudit.inc.ariaHidden, 'true', 'Incomplete Footprints SVG has aria-hidden=true');
  eq(iconAudit.inc.hasEmoji, false, 'Incomplete emoji 👣 is replaced');
  eq(iconAudit.inc.hasKeep, false, 'Incomplete does not render Keep going!');
  eq(iconAudit.inc.hasEllipsis, true, 'Incomplete renders trailing ellipsis …');
  eq(iconAudit.inc.rawUnchanged, true, 'Incomplete does not alter raw STT');
  eq(iconAudit.inc.copyClean, true, 'Copy my sentences does not contain trailing ellipsis');
  eq(iconAudit.terminalResults.every(t => t.noDoubleEllipsis), true, 'Incomplete terminal characters avoid duplicate ellipsis');
  eq(iconAudit.mis.w, 24, 'Mismatch Fire width is 24px');
  eq(iconAudit.mis.h, 24, 'Mismatch Fire height is 24px');
  eq(iconAudit.mis.keepMargin, '8px', 'Mismatch Keep going margin-left is 8px');
  eq(iconAudit.mis.keepTransform, 'matrix(1, 0, 0, 1, 0, -1)', 'Mismatch Keep going y-offset is -1px');

  // Verify Light and Dark colors for the 3 icons
  const lightColors = await p.evaluate(() => {
    const a = audit82;
    const r = a.rowsFor(0)[0][0];
    const key = a.keyFor(r);

    a.saved.set(key, { raw: 'なにかのみます', refs: ['何か飲みます'], status: 'accepted' });
    a.render();
    let row = document.querySelector('tr[data-row="' + r.id + '"]');
    const acc = getComputedStyle(row.querySelector('.feedback-status-accepted')).color;

    a.saved.set(key, { raw: 'なにかのみま', refs: ['何か飲みます'], status: 'incomplete' });
    a.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const inc = getComputedStyle(row.querySelector('.p82-incomplete-svg')).color;

    a.saved.set(key, { raw: 'ちがう', refs: ['何か飲みます'], status: 'mismatch' });
    a.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const mis = getComputedStyle(row.querySelector('.feedback-retry-fire')).color;

    return { acc, inc, mis };
  });
  eq(lightColors.acc, 'rgb(22, 163, 74)', 'Light Accepted is #16A34A');
  eq(lightColors.inc, 'rgb(128, 100, 176)', 'Light Incomplete is #8064B0');
  eq(lightColors.mis, 'rgb(180, 119, 50)', 'Light Mismatch is #B47732');

  await p.emulateMedia({ colorScheme: 'dark' });
  const darkColors = await p.evaluate(() => {
    const a = audit82;
    const r = a.rowsFor(0)[0][0];
    const key = a.keyFor(r);

    a.saved.set(key, { raw: 'なにかのみます', refs: ['何か飲みます'], status: 'accepted' });
    a.render();
    let row = document.querySelector('tr[data-row="' + r.id + '"]');
    const acc = getComputedStyle(row.querySelector('.feedback-status-accepted')).color;

    a.saved.set(key, { raw: 'なにかのみま', refs: ['何か飲みます'], status: 'incomplete' });
    a.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const inc = getComputedStyle(row.querySelector('.p82-incomplete-svg')).color;

    a.saved.set(key, { raw: 'ちがう', refs: ['何か飲みます'], status: 'mismatch' });
    a.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const mis = getComputedStyle(row.querySelector('.feedback-retry-fire')).color;

    return { acc, inc, mis };
  });
  eq(darkColors.acc, 'rgb(74, 222, 128)', 'Dark Accepted is #4ADE80');
  eq(darkColors.inc, 'rgb(185, 162, 229)', 'Dark Incomplete is #B9A2E5');
  eq(darkColors.mis, 'rgb(228, 173, 105)', 'Dark Mismatch is #E4AD69');
  await p.emulateMedia({ colorScheme: 'light' });

  // 12. Copy my sentences clipboard output (Accepted ✅ / Incomplete 👣 without … / Mismatch 🔥)
  const copyText = await p.evaluate(async () => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async t => { copied = t; } },
      configurable: true
    });
    const a = audit82;
    const rows = a.rowsFor(0);
    a.saved.clear();
    a.saved.set(a.keyFor(rows[0][0]), { raw: '授業で何か話します', refs: ['授業で何か話します'], status: 'accepted', correct: true });
    a.saved.set(a.keyFor(rows[1][0]), { raw: '学校で何か', refs: ['学校で何か習います'], status: 'incomplete', correct: false });
    a.saved.set(a.keyFor(rows[2][0]), { raw: 'ちがう文', refs: ['大学で何か教えます'], status: 'mismatch', correct: false });
    a.render();
    const copyBtn = document.querySelector('#drill1 .p82-copy-button');
    copyBtn.click();
    await new Promise(r => setTimeout(r, 20));
    return copied;
  });
  const copyLines = copyText.split('\n');
  eq(copyLines.some(l => l.startsWith('1. ✅ 授業で何か話します')), true, 'Copy Accepted starts with ✅');
  eq(copyLines.some(l => l.startsWith('2. 👣 学校で何か') && !l.endsWith('…')), true, 'Copy Incomplete starts with 👣 and has no trailing …');
  eq(copyLines.some(l => l.startsWith('3. 🔥 ちがう文')), true, 'Copy Mismatch starts with 🔥');

  // 13. Recording stop timers (Autostop ON 5s pre-speech stop vs Manual no 5s stop / manual stop / 20s cap)
  const tp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  tp.on('pageerror', e => errors.push(e.message));
  await tp.clock.install();
  await tp.addInitScript('(' + mock.trim() + ')();');
  await tp.route('http://p82.test/**', r => {
    const f = path.join(root, new URL(r.request().url()).pathname);
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    return r.fulfill({ body: fs.readFileSync(f), contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' });
  });
  await tp.goto('http://p82.test/practice8.2.html');

  // A. Autostop ON: stops at 5000ms with "No speech detected within 5 seconds."
  const firstRecBtn = tp.locator('#drill1 .drill-record-btn').first();
  await firstRecBtn.click();
  await tp.clock.runFor(5200);
  const auto5sMsg = await tp.locator('#drill1 .p81-notice').first().textContent();
  eq(auto5sMsg, 'No speech detected within 5 seconds.', 'Autostop ON stops after 5s pre-speech silence');

  // B. Manual (Autostop OFF): continues past 5s, can stop manually, and stops at 20s cap
  await tp.locator('label.switch').first().click(); // switch to Manual
  await firstRecBtn.click();
  await tp.clock.runFor(6000);
  eq(await tp.locator('#drill1 .result-text').first().textContent(), 'Recording...', 'Manual continues recording past 5s silence');
  eq(await tp.locator('#drill1 .p81-notice').count(), 0, 'Manual shows no 5s timeout notice');

  // Manual stop works
  await tp.locator('#drill1 .stop-btn-active').first().click();
  await tp.clock.runFor(100);
  eq(await tp.locator('#drill1 .stop-btn-active').count(), 0, 'Manual stop ends recording');

  // Manual 20s absolute cap
  await firstRecBtn.click();
  await tp.clock.runFor(20200);
  const manual20sMsg = await tp.locator('#drill1 .p81-notice').first().textContent();
  eq(manual20sMsg, 'Auto-stopped after 20 seconds.', 'Manual stops at 20s absolute cap');
  await tp.close();

  // 14. Copy button Fluent Clipboard SVG, playback preservation (TTS & Audio), and recording exclusion
  const copySvgMatch = await p.evaluate(() => {
    const actualPath = document.querySelector('#drill1 .p82-copy-button svg.p82-copy-icon path')?.getAttribute('d');
    const expectedPath = window.FluentIcons?.create('clipboard', 20, 'p82-copy-icon')?.querySelector('path')?.getAttribute('d');
    const attr = document.querySelector('#drill1 .p82-copy-button')?.dataset.keepPlayback;
    return { matches: Boolean(actualPath && expectedPath && actualPath === expectedPath), keepAttr: attr === 'true' };
  });
  eq(copySvgMatch, { matches: true, keepAttr: true }, 'Copy button uses Fluent Clipboard 24 Regular SVG and data-keep-playback=true');

  // TTS playback preservation during Copy
  await p.evaluate(() => {
    t.speaking = true;
    t.cancelCount = 0;
    const origCancel = speechSynthesis.cancel.bind(speechSynthesis);
    speechSynthesis.cancel = () => { t.cancelCount += 1; return origCancel(); };
    window.__copiedDuringTts = '';
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async txt => { window.__copiedDuringTts = txt; } },
      configurable: true
    });
  });
  const idleListenColor = await p.locator('#drill1 .drill-listen-btn').first().evaluate(el => getComputedStyle(el).color);
  await p.locator('#drill1 .drill-listen-btn').first().click();
  await p.locator('#drill1 .p82-copy-button').click();
  const ttsCopyRes = await p.evaluate((expectedBtnColor) => {
    const btn = document.querySelector('#drill1 .drill-listen-btn.is-playing');
    const svg = btn?.querySelector('svg');
    const path = svg?.querySelector('path');
    const btnColor = btn ? getComputedStyle(btn).color : null;
    const svgColor = svg ? getComputedStyle(svg).color : null;
    const pathFill = path ? getComputedStyle(path).fill : null;
    return {
      copied: window.__copiedDuringTts.length > 0,
      cancelCount: t.cancelCount,
      stillPlaying: Boolean(btn),
      stopUsesCurrentColor: Boolean(btn && svg && btnColor === expectedBtnColor && svgColor === expectedBtnColor && pathFill === expectedBtnColor && btnColor !== 'rgb(217, 48, 37)')
    };
  }, idleListenColor);
  eq(ttsCopyRes, { copied: true, cancelCount: 0, stillPlaying: true, stopUsesCurrentColor: true }, 'Copy during TTS playback succeeds without cancelling speechSynthesis and playing Stop inherits currentColor without #d93025');
  await p.evaluate(() => { t.spoken.at(-1)?.onend?.(); });

  // Recorded Audio playback preservation during Copy
  await p.evaluate(() => {
    const a = audit82;
    const r = a.rowsFor(0)[0][0];
    a.saved.set(a.keyFor(r), { raw: '授業で何か話します', url: 'blob:http://p82.test/audio-copy-test', refs: ['授業で何か話します'], status: 'accepted', correct: true });
    a.render();
    window.__copiedDuringAudio = '';
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async txt => { window.__copiedDuringAudio = txt; } },
      configurable: true
    });
  });
  const idlePlayRecColor = await p.locator('#drill1 .play-recording-btn').first().evaluate(el => getComputedStyle(el).color);
  await p.locator('#drill1 .play-recording-btn').first().click();
  await p.locator('#drill1 .p82-copy-button').click();
  const audioCopyRes = await p.evaluate((expectedBtnColor) => {
    const aud = t.audios.at(-1);
    const btn = document.querySelector('#drill1 .play-recording-btn.is-playing');
    const svg = btn?.querySelector('svg');
    const path = svg?.querySelector('path');
    const btnColor = btn ? getComputedStyle(btn).color : null;
    const svgColor = svg ? getComputedStyle(svg).color : null;
    const pathFill = path ? getComputedStyle(path).fill : null;
    return {
      copied: window.__copiedDuringAudio.length > 0,
      paused: aud ? aud.paused : true,
      hasSrc: aud ? Boolean(aud.src) : false,
      stopUsesCurrentColor: Boolean(btn && svg && btnColor === expectedBtnColor && svgColor === expectedBtnColor && pathFill === expectedBtnColor && btnColor !== 'rgb(217, 48, 37)')
    };
  }, idlePlayRecColor);
  eq(audioCopyRes, { copied: true, paused: false, hasSrc: true, stopUsesCurrentColor: true }, 'Copy during recorded Audio playback succeeds and playing Stop inherits currentColor without #d93025');
  await p.evaluate(() => { t.audios.at(-1)?.onended?.(); });

  // Recording exclusion: Copy button is disabled during recording & manual recording Stop keeps #d93025
  await p.evaluate(() => { const cb = document.getElementById('toggleRecordMode'); if (cb.checked) cb.click(); }); // ensure Manual mode
  await p.locator('#drill1 .drill-record-btn').first().click();
  const manualStopRed = await p.evaluate(() => {
    const btn = document.querySelector('#drill1 .drill-record-btn.stop-btn-active');
    const svg = btn?.querySelector('svg');
    return {
      backgroundColor: btn ? getComputedStyle(btn).backgroundColor : null,
      borderColor: btn ? getComputedStyle(btn).borderColor : null,
      btnColor: btn ? getComputedStyle(btn).color : null,
      svgColor: svg ? getComputedStyle(svg).color : null
    };
  });
  eq(manualStopRed, { backgroundColor: 'rgb(217, 48, 37)', borderColor: 'rgb(217, 48, 37)', btnColor: 'rgb(255, 255, 255)', svgColor: 'rgb(255, 255, 255)' }, 'Manual recording Stop button (.stop-btn-active) preserves red background/border and white icon');
  eq(await p.locator('#drill1 .p82-copy-button').isDisabled(), true, 'Copy button is disabled while recording');
  await p.locator('#drill1 .stop-btn-active').first().click();
  await p.evaluate(() => { const cb = document.getElementById('toggleRecordMode'); if (!cb.checked) cb.click(); }); // restore Autostop ON

  // 15. Mismatch reason separation & error-text computed color highlight verification
  const diffAudit = await p.evaluate(() => {
    const a = audit82;
    const probe = document.createElement('span');
    probe.style.color = 'var(--error-text)';
    document.body.append(probe);
    const errorRgb = getComputedStyle(probe).color;
    probe.remove();

    const inspectRow = (rowObj, raw, opts = {}) => {
      const key = a.keyFor(rowObj);
      const status = opts.status || 'mismatch';
      a.saved.set(key, {
        raw,
        refs: rowObj.refs,
        modelText: rowObj.text,
        modelHira: rowObj.hira,
        status,
        ...(opts.omitReason ? {} : { mismatchReason: opts.reason }),
        correct: status === 'accepted'
      });
      a.render();
      const resText = document.querySelector('tr[data-row="' + rowObj.id + '"] .result-text');
      const spans = Array.from(resText.querySelectorAll('span')).filter(s => !s.className && !s.dataset.audioRole);
      const redChars = spans.filter(s => s.textContent !== '＿' && getComputedStyle(s).color === errorRgb).map(s => s.textContent);
      const redGaps = spans.filter(s => s.textContent === '＿' && getComputedStyle(s).color === errorRgb).length;
      return { redChars, redGaps, text: resText.textContent };
    };

    // 1. Statement + extra か (Drill 1 row 0: 授業で何か話します)
    const d1r0 = a.rowsFor(0)[0][0];
    const extraKa = inspectRow(d1r0, '授業で何か話しますか', { reason: 'text' });

    // 2. Question missing か (Drill 2 row 0: 何を読みますか)
    const d2r0 = a.rowsFor(1)[0][0];
    const missingKa = inspectRow(d2r0, '何を読みます', { reason: 'text' });

    // 3. Formal statement + ？ (form mismatch)
    const formQ = inspectRow(d1r0, '授業で何か話します？', { reason: 'form' });

    // 4. pending mismatch (Drill 3 response unselected)
    const d3r0a = a.rowsFor(2)[0][1];
    const pendingRes = inspectRow(d3r0a, 'はい買います', { reason: 'pending' });

    // 5. Drill 4 question & answer mismatch
    const d4q = a.rowsFor(3)[0][0];
    const d4a = a.rowsFor(3)[0][1];
    const d4qRes = inspectRow(d4q, 'どんな料理を食べますか', { reason: 'text' });
    const d4aRes = inspectRow(d4a, '何でも食べます', { reason: 'text' });

    // 6. Accepted with よね/よ/ね, Incomplete, and legacy data without mismatchReason
    const accYo = inspectRow(d1r0, '授業で何か話しますよ', { status: 'accepted' });
    const incRes = inspectRow(d1r0, '授業で何か', { status: 'incomplete' });
    const legacyNoDiff = inspectRow(d1r0, '授業で何か話します', { omitReason: true });

    return { errorRgb, extraKa, missingKa, formQ, pendingRes, d4qRes, d4aRes, accYo, incRes, legacyNoDiff };
  });

  eq(diffAudit.extraKa.redChars, ['か'], 'Extra か in statement is highlighted in --error-text');
  eq(diffAudit.extraKa.redGaps, 0, 'Extra か has no red gap marker');
  eq(diffAudit.missingKa.redChars, [], 'Missing か does not highlight matching chars');
  eq(diffAudit.missingKa.redGaps, 1, 'Missing か renders 1 red ＿ gap marker');
  eq(diffAudit.formQ.redChars, ['？'], 'Formal ？ highlights only ？ in --error-text');
  eq(diffAudit.pendingRes.redChars, [], 'Pending mismatch does not highlight unrelated chars');
  eq(diffAudit.pendingRes.redGaps, 0, 'Pending mismatch has no red gap marker');
  eq(diffAudit.d4qRes.redChars.length > 0, true, 'Drill 4 question mismatch highlights differing chars');
  eq(diffAudit.d4aRes.redChars.length > 0, true, 'Drill 4 answer mismatch highlights differing chars');
  eq(diffAudit.accYo.redChars, [], 'Accepted with よ has no red highlight');
  eq(diffAudit.incRes.redChars, [], 'Incomplete has no red highlight');
  eq(diffAudit.legacyNoDiff.redChars, [], 'Legacy mismatch without mismatchReason and zero diff has no red highlight');

  // Verify Hiragana Only mode preserves diff highlight
  await p.locator('#scriptModeControl [data-value="hiragana"]').click();
  const hiraDiff = await p.evaluate(() => {
    const a = audit82;
    const d1r0 = a.rowsFor(0)[0][0];
    const key = a.keyFor(d1r0);
    a.saved.set(key, { raw: '授業で何か話しますか', refs: d1r0.refs, modelText: d1r0.text, modelHira: d1r0.hira, status: 'mismatch', mismatchReason: 'text', correct: false });
    a.render();
    const probe = document.createElement('span');
    probe.style.color = 'var(--error-text)';
    document.body.append(probe);
    const errorRgb = getComputedStyle(probe).color;
    probe.remove();
    const resText = document.querySelector('tr[data-row="' + d1r0.id + '"] .result-text');
    return Array.from(resText.querySelectorAll('span')).filter(s => !s.className && getComputedStyle(s).color === errorRgb).map(s => s.textContent);
  });
  eq(hiraDiff, ['か'], 'Hiragana Only mode highlights only か in --error-text');
  await p.locator('#scriptModeControl [data-value="kanji"]').click();

  // Unit tests verifying diffTokens token integrity (no truncated trailing character) and findDiff accuracy
  const tokenIntegrity = await p.evaluate(() => {
    const a = audit82;
    const tStatement = a.diffTokens("授業で何か話しますか");
    const tModel = a.diffTokens("授業で、何か、話します。");
    const diffExtraKa = a.findDiff("授業で何か話しますか", "授業で、何か、話します。");
    const tWord = a.diffTokens("靴");
    const tSingleKana = a.diffTokens("か");
    const tYoneEnd = a.diffTokens("話しますよね");
    return {
      statementTokens: tStatement.tokens.map(t => t.c),
      modelTokens: tModel.tokens.map(t => t.c),
      extraKaRedIndices: Array.from(diffExtraKa.red),
      extraKaGapIndices: Array.from(diffExtraKa.gaps),
      wordTokens: tWord.tokens.map(t => t.c),
      singleKanaTokens: tSingleKana.tokens.map(t => t.c),
      yoneEndTokens: tYoneEnd.tokens.map(t => t.c)
    };
  });
  eq(tokenIntegrity.statementTokens.slice(-1), ['か'], 'diffTokens does not truncate trailing か');
  eq(tokenIntegrity.statementTokens.slice(-6, -1), ['は', 'な', 'し', 'ま', 'す'], 'diffTokens preserves full 話します verb kana');
  eq(tokenIntegrity.modelTokens.slice(-5), ['は', 'な', 'し', 'ま', 'す'], 'diffTokens model tokens contain full verb without trailing symbol loss');
  eq(tokenIntegrity.extraKaRedIndices, [9], 'findDiff flags exactly index 9 (trailing か) in red');
  eq(tokenIntegrity.extraKaGapIndices, [], 'findDiff has no gaps for single extra trailing character');
  eq(tokenIntegrity.singleKanaTokens, ['か'], 'diffTokens on single kana unit keeps the kana');
  eq(tokenIntegrity.wordTokens.length > 0, true, 'diffTokens on kanji word produces tokens');
  eq(tokenIntegrity.yoneEndTokens.slice(-5), ['は', 'な', 'し', 'ま', 'す'], 'diffTokens safely strips sentence-ending よね at tokens level');

  // 16. Common UI 4 regions Fluent SVG conversion, optical sizing, path sharing, and disabled cursor (not-allowed removal)
  const fluentUiAudit = await p.evaluate(() => {
    const FI = window.FluentIcons;
    const legacyEmojis = ['↩️', '💡', '🔊', '🐣', '🐤', '👔', '✏️', '💬', '🔎', '🔡', '⏹️', '▶️'];

    const inspectSvg = el => {
      const svg = el?.querySelector('svg');
      const path = svg?.querySelector('path');
      const cs = svg ? getComputedStyle(svg) : null;
      return {
        hasSvg: Boolean(svg),
        viewBox: svg?.getAttribute('viewBox') || null,
        d: path?.getAttribute('d') || null,
        filled: Boolean(svg?.classList.contains('fluent-icon-filled')),
        color: cs ? cs.color : null,
        width: cs ? cs.width : null,
        height: cs ? cs.height : null,
        transform: cs ? cs.transform : null,
        text: el ? el.textContent : ''
      };
    };

    // 1. Back link (.back-link)
    const backEl = document.querySelector('.back-link');
    const back = inspectSvg(backEl);

    // 2. 5 Lightbulb explanations (Drills 1-4 + Drill 5 English cues)
    const descEls = Array.from(document.querySelectorAll('.info-panel-desc'));
    const descs = descEls.map(inspectSvg);

    // 3. Footer Voice label (.voice-select-label) and model audio button (speaker)
    const voiceEl = document.querySelector('.voice-select-label');
    const voice = inspectSvg(voiceEl);
    const modelListenSvg = document.querySelector('.drill-listen-btn svg path');
    const modelSpeakerPath = modelListenSvg?.getAttribute('d') || null;

    // 4. Global settings 9 icon items + Vocabulary OFF (no icon)
    const settingSpecs = [
      { key: 'hiragana', sel: '#scriptModeControl [data-value="hiragana"]', icon: 'translate', vb: '0 0 24 24', w: '24px' },
      { key: 'kanji', sel: '#scriptModeControl [data-value="kanji"]', icon: 'localLanguageGlobe', vb: '0 0 20 20', w: '24px' },
      { key: 'formal', sel: '#speechStyleControl [data-value="formal"]', icon: 'buildingFilled', vb: '0 0 24 24', w: '24px', v: 'filled' },
      { key: 'informal', sel: '#speechStyleControl [data-value="informal"]', icon: 'editLineHorizontal3Filled', vb: '0 0 24 24', w: '24px', v: 'filled' },
      { key: 'casual', sel: '#speechStyleControl [data-value="casual"]', icon: 'homeFilled', vb: '0 0 24 24', w: '24px', v: 'filled' },
      { key: 'hover', sel: '#hintModeControl [data-value="hover"]', icon: 'chatHintHalfFilled', vb: '0 0 24 24', w: '24px', v: 'filled' },
      { key: 'paren', sel: '#hintModeControl [data-value="paren"]', icon: 'editLineHorizontal3Filled', vb: '0 0 24 24', w: '24px', v: 'filled' },
      { key: 'autostop', sel: '#labelAutoRecord', icon: 'micFilled', vb: '0 0 24 24', w: '24px', v: 'filled' },
      { key: 'autoplay', sel: '#labelAutoPlay', icon: 'playCircle', vb: '0 0 24 24', w: '24px', v: 'regular' }
    ];

    const settings = settingSpecs.map(sp => {
      const el = document.querySelector(sp.sel);
      const info = inspectSvg(el);
      const expectedD = FI.create(sp.icon, 20, '', sp.v || 'regular').querySelector('path').getAttribute('d');
      return {
        key: sp.key,
        hasSvg: info.hasSvg,
        filled: info.filled,
        vbMatch: info.viewBox === sp.vb,
        dMatch: Boolean(info.d && info.d === expectedD),
        wMatch: info.width === sp.w && info.height === sp.w,
        noLegacyEmoji: !legacyEmojis.some(em => info.text.includes(em)),
        noEmojiWrapper: !el?.querySelector('.icon-emoji')
      };
    });

    const vocabOffEl = document.querySelector('#hintModeControl [data-value="off"]');
    const vocabOffHasSvg = Boolean(vocabOffEl?.querySelector('svg'));

    // Secondary candidate localLanguageZi registered in FluentIcons
    const ziSvg = FI.create('localLanguageZi', 20);
    const hasLocalLanguageZi = Boolean(ziSvg?.querySelector('path')?.getAttribute('d'));

    // Path checks: Voice === speaker, Autostop === official Mic 24 Filled, Autoplay === Play Circle Hint Half 24 Filled.
    const expectedBackD = FI.create('arrowHookDownLeft', 20).querySelector('path').getAttribute('d');
    const expectedBulbD = FI.create('lightbulbFilled', 20, '', 'filled').querySelector('path').getAttribute('d');
    const expectedSpeakerD = FI.create('speaker', 20).querySelector('path').getAttribute('d');
    const expectedMicD = FI.create('micFilled', 20, '', 'filled').querySelector('path').getAttribute('d');
    const expectedStopD = FI.PATHS.stop;
    const expectedPlayD = FI.create('playCircle', 20, '', 'regular').querySelector('path').getAttribute('d');

    const autostopD = document.querySelector('#labelAutoRecord svg path')?.getAttribute('d');
    const autoplayD = document.querySelector('#labelAutoPlay svg path')?.getAttribute('d');

    // Phase C: colors, amber selection, button height and overlap
    const colorOf = v => { const pr = document.createElement('span'); pr.style.color = v; document.body.append(pr); const c = getComputedStyle(pr).color; pr.remove(); return c; };
    const svgColor = sel => getComputedStyle(document.querySelector(sel + ' svg')).color;
    const amber = 'rgb(251, 191, 36)';
    const segs = Array.from(document.querySelectorAll('.compact-settings .segmented-option'));
    const withIcon = segs.filter(b => b.querySelector('svg'));
    const heightOk = withIcon.every(b => Math.abs(b.getBoundingClientRect().height - 33.8) < 0.6);
    const noOverlap = withIcon.every(b => {
      const svg = b.querySelector('svg').getBoundingClientRect();
      const walker = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
      let ok = true;
      while (walker.nextNode()) {
        const n = walker.currentNode;
        if (!n.textContent.trim() || n.parentElement.closest('.custom-tip-box')) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        const tr = r.getBoundingClientRect();
        if (svg.right > tr.left + 0.5) ok = false;
      }
      return ok;
    });
    const autoLabel = document.querySelector('#labelAutoRecord');
    const autoIconRect = autoLabel?.querySelector('svg')?.getBoundingClientRect();
    const autoTextNode = Array.from(autoLabel?.childNodes || []).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes('Autostop'));
    let autoTextRect = null;
    if (autoTextNode) {
      const start = autoTextNode.textContent.indexOf('Autostop');
      const range = document.createRange();
      range.setStart(autoTextNode, start);
      range.setEnd(autoTextNode, start + 'Autostop'.length);
      autoTextRect = range.getBoundingClientRect();
    }
    const autoLabelRect = autoLabel?.getBoundingClientRect();
    const autoSwitchRect = autoLabel?.parentElement.querySelector('.switch')?.getBoundingClientRect();
    const autostopLabelLayoutOk = Boolean(autoIconRect && autoTextRect && autoLabelRect && autoSwitchRect)
      && Math.abs(autoIconRect.width - 24) < 0.1
      && Math.abs(autoIconRect.height - 24) < 0.1
      && autoIconRect.right <= autoTextRect.left + 0.5
      && autoLabelRect.right <= autoSwitchRect.left + 0.5;
    const selectedAmber = withIcon.filter(b => b.getAttribute('aria-pressed') === 'true').every(b => getComputedStyle(b.querySelector('svg')).color === amber);
    const unselectedNotAmber = withIcon.filter(b => b.getAttribute('aria-pressed') !== 'true').every(b => getComputedStyle(b.querySelector('svg')).color !== amber);
    const phaseC = {
      removedKeys: ['personAccounts','chatMultiple','lightbulb','localLanguageGlobeFilled','textEditStyle'].every(k => !(k in FI.PATHS)),
      preservedSharedKeys: ['playCircle','speaker','play','stop','localLanguageGlobe','chatHintHalf'].every(k => k in FI.PATHS),
      autostopAmber: svgColor('#labelAutoRecord') === amber,
      autoplayAmber: svgColor('#labelAutoPlay') === amber,
      bulbsAmber: descs.every(d => d.color === amber),
      micIconPathMatch: Boolean(autostopD && autostopD === expectedMicD),
      stopKeyPreserved: Boolean(expectedStopD && FI.PATHS.stop === expectedStopD),
      autostopLabelLayoutOk,
      heightOk, noOverlap, selectedAmber, unselectedNotAmber
    };

    // 5. Disabled buttons cursor check (no cursor: not-allowed anywhere)
    audit82.choices.delete('yn-1-a');
    audit82.saved.clear();
    audit82.render();
    const disabledBtns = Array.from(document.querySelectorAll('button:disabled'));
    const disabledCursors = disabledBtns.map(b => ({
      cls: b.className,
      cursor: getComputedStyle(b).cursor
    }));

    return {
      backMatch: back.hasSvg && back.viewBox === '0 0 24 24' && back.d === expectedBackD && back.width === '20px' && !legacyEmojis.some(em => back.text.includes(em)),
      descsCount: descs.length,
      descsMatch: descs.every(d => d.hasSvg && d.viewBox === '0 0 24 24' && d.d === expectedBulbD && d.width === '20px' && d.filled && !legacyEmojis.some(em => d.text.includes(em))),
      voiceMatch: voice.hasSvg && voice.viewBox === '0 0 24 24' && voice.d === expectedSpeakerD && voice.d === modelSpeakerPath && voice.width === '20px' && !legacyEmojis.some(em => voice.text.includes(em)),
      autostopSharesStop: Boolean(autostopD && autostopD === expectedStopD),
      autoplaySharesPlay: Boolean(autoplayD && autoplayD === expectedPlayD),
      settings,
      phaseC,
      vocabOffHasSvg,
      hasLocalLanguageZi,
      disabledCount: disabledCursors.length,
      anyNotAllowed: disabledCursors.some(c => c.cursor === 'not-allowed')
    };
  });

  eq(fluentUiAudit.backMatch, true, 'Back link uses Fluent Arrow Hook Down Left 24 Regular SVG (20px) with no legacy emoji');
  eq(fluentUiAudit.descsCount, 5, 'All 5 instruction blocks (Drills 1-4 and Drill 5 English cues) are present');
  eq(fluentUiAudit.descsMatch, true, 'All 5 instruction blocks use official Fluent Lightbulb 24 Filled SVG (20px) with no 💡 emoji');
  eq(fluentUiAudit.voiceMatch, true, 'Footer Voice label uses Fluent Speaker 2 24 Regular SVG identical to model audio button with no 🔊 emoji');
  eq(fluentUiAudit.settings.find(s => s.key === 'autostop')?.dMatch, true, 'Autostop icon uses exact official Fluent Mic 24 Filled SVG path');
  eq(fluentUiAudit.autoplaySharesPlay, true, 'Auto-Compare icon uses exact Fluent Play Circle 24 Regular SVG path');
  for (const s of fluentUiAudit.settings) {
    eq(s, {
      key: s.key,
      hasSvg: true,
      vbMatch: true,
      dMatch: true,
      wMatch: true,
      noLegacyEmoji: true,
      noEmojiWrapper: true,
      filled: s.key !== 'hiragana' && s.key !== 'kanji' && s.key !== 'autoplay'
    }, `Global setting [${s.key}] renders official Fluent SVG with optical size and no legacy emoji`);
  }
  eq(fluentUiAudit.phaseC, { removedKeys: true, preservedSharedKeys: true, autostopAmber: true, autoplayAmber: true, bulbsAmber: true, micIconPathMatch: true, stopKeyPreserved: true, autostopLabelLayoutOk: true, heightOk: true, noOverlap: true, selectedAmber: true, unselectedNotAmber: true }, 'Mic Filled path, preserved stop key, amber icons, and unchanged layout');
  await p.emulateMedia({ colorScheme: 'dark' });
  const darkAmberAudit = await p.evaluate(() => {
    const amber = 'rgb(251, 191, 36)';
    const bulbs = Array.from(document.querySelectorAll('.info-panel-desc .p82-lightbulb-icon'));
    const color = sel => getComputedStyle(document.querySelector(sel + ' svg')).color;
    const selected = Array.from(document.querySelectorAll('.compact-settings .segmented-option[aria-pressed="true"] svg'));
    return {
      bulbs: bulbs.length === 5 && bulbs.every(el => getComputedStyle(el).color === amber),
      autostop: color('#labelAutoRecord') === amber,
      autoplay: color('#labelAutoPlay') === amber,
      selected: selected.every(el => getComputedStyle(el).color === amber)
    };
  });
  eq(darkAmberAudit, { bulbs: true, autostop: true, autoplay: true, selected: true }, 'Dark theme amber accents are applied to bulbs, switches, and selected icons');
  await p.emulateMedia({ colorScheme: 'light' });
  eq(fluentUiAudit.vocabOffHasSvg, false, 'Vocabulary Display OFF remains text-only without icon');
  eq(fluentUiAudit.hasLocalLanguageZi, true, 'Secondary candidate localLanguageZi (Local Language Zi 24 Regular) is registered in FluentIcons');
  eq(fluentUiAudit.disabledCount > 0, true, 'Disabled buttons exist for cursor audit');
  eq(fluentUiAudit.anyNotAllowed, false, 'No disabled button uses cursor: not-allowed');

  // Global Settings 11 tooltips audit: text-align left, wording, Auto-Compare rename, and <br> check
  const tooltipsAudit = await p.evaluate(() => {
    const tips = [
      { sel: '#scriptModeControl [data-value="hiragana"] .custom-tip-box', text: 'Displays sentences in Hiragana only.', br: false },
      { sel: '#scriptModeControl [data-value="kanji"] .custom-tip-box', text: 'Displays sentences with Kanji and Kana.', br: false },
      { sel: '#speechStyleControl [data-value="formal"] .custom-tip-box', text: 'Polite speech for work or unfamiliar people.', br: false },
      { sel: '#speechStyleControl [data-value="informal"] .custom-tip-box', text: 'Plain forms used in writing.', br: false },
      { sel: '#speechStyleControl [data-value="casual"] .custom-tip-box', text: 'Relaxed speech with family and friends.', br: false },
      { sel: '#hintModeControl [data-value="off"] .custom-tip-box', text: 'Hides vocabulary hints.', br: false },
      { sel: '#hintModeControl [data-value="hover"] .custom-tip-box', text: 'Shows vocabulary hints on hover.', br: false },
      { sel: '#hintModeControl [data-value="display"] .custom-tip-box', text: 'Always shows vocabulary hints.', br: false },
      { sel: '#labelAutoRecord .custom-tip-box', text: 'ON: Stops automatically after 2s of silence.OFF: Uses the stop button.', br: true },
      { sel: '#labelAutoPlay .custom-tip-box', text: 'ON: Auto-plays the model audio and your recording in sequence after recording.OFF: Uses the Play buttons separately.', br: true },
      { sel: '.voice-guide-footer .voice-help-icon .custom-tip-box', text: "If no voices appear, you can add a Japanese voice in your device's Text-to-Speech settings.", br: false }
    ];

    const results = tips.map(t => {
      const el = document.querySelector(t.sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      const textMatch = el.textContent.trim().replace(/\s+/g, ' ') === t.text;
      const hasBr = Boolean(el.querySelector('br'));
      const leftAligned = cs.textAlign === 'left';
      return { found: true, textMatch, brMatch: hasBr === t.br, leftAligned };
    });

    const autoCompareLabel = document.querySelector('#labelAutoPlay')?.textContent.replace(/[\n\r]+/g, ' ').trim().startsWith('Auto-Compare');

    return {
      allFound: results.every(r => r.found),
      allTextMatch: results.every(r => r.textMatch),
      allBrMatch: results.every(r => r.brMatch),
      allLeftAligned: results.every(r => r.leftAligned),
      autoCompareLabel
    };
  });

  eq(tooltipsAudit, {
    allFound: true,
    allTextMatch: true,
    allBrMatch: true,
    allLeftAligned: true,
    autoCompareLabel: true
  }, 'All 11 Global Settings tooltips have left-aligned text, correct wording with -s, br where required, and Auto-Compare label');

  // Verify disabled Copy button opacity (0.55) and Mismatch error color consistency (Light/Dark)
  const copyOpacity = await p.evaluate(() => {
    const btn = document.querySelector('.p82-copy-button:disabled');
    return btn ? getComputedStyle(btn).opacity : null;
  });
  eq(copyOpacity, '0.55', 'Practice 8.2 disabled Copy button opacity must be 0.55');

  const checkP82MismatchColor = async (scheme, expectedColor) => {
    await p.emulateMedia({ colorScheme: scheme });
    const col = await p.evaluate(() => {
      const span = document.createElement('span');
      span.style.color = 'var(--semantic-negative-color, var(--error-text, #be123c))';
      document.body.append(span);
      const c = getComputedStyle(span).color;
      span.remove();
      return c;
    });
    eq(col, expectedColor, `Practice 8.2 mismatch red color in ${scheme} mode matches semantic negative color`);
  };
  await checkP82MismatchColor('light', 'rgb(225, 29, 72)');
  await checkP82MismatchColor('dark', 'rgb(255, 138, 165)');
  await p.emulateMedia({ colorScheme: 'light' });

  // --- Phase 4: Shared Table Contract, Status Color Tokens, Paired Rows AX & Geometry, Low-Volume STT Protection ---
  // A. [data-theme="dark"] status color tokens (--status-accepted/incomplete/mismatch-color)
  await p.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
  const themeDarkTokens = await p.evaluate(() => {
    const a = audit82;
    const r = a.rowsFor(0)[0][0];
    const key = a.keyFor(r);
    a.saved.set(key, { raw: 'なにかのみます', refs: ['何か飲みます'], status: 'accepted' });
    practice82State.render();
    let row = document.querySelector('tr[data-row="' + r.id + '"]');
    const acc = getComputedStyle(row.querySelector('.feedback-status-accepted')).color;
    a.saved.set(key, { raw: 'なにかのみま', refs: ['何か飲みます'], status: 'incomplete' });
    practice82State.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const inc = getComputedStyle(row.querySelector('.p82-incomplete-svg')).color;
    a.saved.set(key, { raw: 'ちがう', refs: ['何か飲みます'], status: 'mismatch' });
    practice82State.render();
    row = document.querySelector('tr[data-row="' + r.id + '"]');
    const mis = getComputedStyle(row.querySelector('.feedback-retry-fire')).color;
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      acc, inc, mis,
      tokAcc: rootStyle.getPropertyValue('--status-accepted-color').trim().toLowerCase(),
      tokInc: rootStyle.getPropertyValue('--status-incomplete-color').trim().toLowerCase(),
      tokMis: rootStyle.getPropertyValue('--status-mismatch-color').trim().toLowerCase()
    };
  });
  eq(themeDarkTokens, {
    acc: 'rgb(74, 222, 128)',
    inc: 'rgb(185, 162, 229)',
    mis: 'rgb(228, 173, 105)',
    tokAcc: '#4ade80',
    tokInc: '#b9a2e5',
    tokMis: '#e4ad69'
  }, 'Phase 4: [data-theme="dark"] status color tokens resolve consistently on P8.2');
  await p.evaluate(() => { document.documentElement.removeAttribute('data-theme'); });

  // B. Valid grid-template-columns, .practice82-page CSS isolation (600px/850px), and Paired Rows (rowspan="2") AX + Geometry
  for (const vpWidth of [600, 850, 1440]) {
    await p.setViewportSize({ width: vpWidth, height: 1000 });
    await p.waitForTimeout(100);
    const tableAudit = await p.evaluate(() => {
      const tables = [...document.querySelectorAll('.p81-card table.recording-table.p81-table')];
      return {
        count: tables.length,
        allGridValid: tables.every(tbl => getComputedStyle(tbl).gridTemplateColumns !== 'none'),
        allStartAligned: tables.every(tbl => getComputedStyle(tbl).alignItems === 'start'),
        allInlineTrackMatch: tables.every(tbl => {
          const layout = tbl.dataset.contentLayout;
          const cols = getComputedStyle(tbl).gridTemplateColumns.trim().split(/\s+/).length;
          return layout === 'inline' ? cols === 3 : (layout === 'stacked' ? cols === 2 : true);
        })
      };
    });
    eq(tableAudit, { count: 19, allGridValid: true, allStartAligned: true, allInlineTrackMatch: true },
      `Phase 4: P8.2 gridTemplateColumns valid, start-aligned, and isolated from 600px/850px at ${vpWidth}px`);
  }

  // Paired Rows AX semantics (`table` -> 2 `row`s -> 3 cells on row 1, 2 cells on row 2, Yes/No ONLY on Drill 3 row 2)
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.waitForTimeout(100);
  for (const [drillSel, expectYnOnRow2] of [['#drill2', false], ['#drill3', true], ['#drill4', false]]) {
    const firstCard = p.locator(`${drillSel} .p81-card`).first();
    const tbl = firstCard.getByRole('table');
    eq(await tbl.count(), 1, `${drillSel} Paired card exposes 1 AX table`);
    const rows = tbl.getByRole('row');
    eq(await rows.count(), 2, `${drillSel} Paired card exposes 2 AX rows`);
    eq(await rows.nth(0).getByRole('cell').count(), 3, `${drillSel} Row 1 exposes 3 AX cells`);
    eq(await rows.nth(1).getByRole('cell').count(), 2, `${drillSel} Row 2 exposes 2 AX cells`);
    eq(await rows.nth(0).getByRole('button', { name: 'モデル音声を聞く' }).count(), 1, `${drillSel} Row 1 listen button accessible`);
    eq(await rows.nth(0).getByRole('button', { name: '音声を録音する' }).count(), 1, `${drillSel} Row 1 record button accessible`);
    eq(await rows.nth(1).getByRole('button', { name: 'モデル音声を聞く' }).count(), 1, `${drillSel} Row 2 listen button accessible`);
    eq(await rows.nth(1).getByRole('button', { name: '音声を録音する' }).count(), 1, `${drillSel} Row 2 record button accessible`);
    eq(await rows.nth(0).getByRole('button', { name: /^(Yes|No|Affirmative response|Negative response)$/ }).count(), 0, `${drillSel} Row 1 has no Yes/No buttons`);
    eq(await rows.nth(1).getByRole('button', { name: /^(Yes|No|Affirmative response|Negative response)$/ }).count(), expectYnOnRow2 ? 2 : 0, `${drillSel} Row 2 Yes/No button count`);
  }

  // Drill 2 longest cue "何か／あらう" must remain on a single line at 600px and 1280px
  for (const vpWidth of [600, 1280]) {
    await p.setViewportSize({ width: vpWidth, height: 1000 });
    await p.waitForTimeout(120);
    const cueLineCheck = await p.evaluate(() => {
      const strip = el => {
        const c = el.cloneNode(true);
        c.querySelectorAll('.tooltip-tip, .custom-tip-box').forEach(x => x.remove());
        return c.textContent.replace(/\s+/g, '');
      };
      const target = [...document.querySelectorAll('#drill2 .p81-card .p81-cue-words')].find(el => strip(el) === '何か/あらう');
      if (!target) return { found: false };
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentElement?.closest('.tooltip-tip, .custom-tip-box') || !n.textContent.trim())
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT
      });
      const yLines = new Set();
      while (walker.nextNode()) {
        const r = document.createRange();
        r.selectNodeContents(walker.currentNode);
        for (const rect of r.getClientRects()) {
          if (rect.width > 0 && rect.height > 0) yLines.add(Math.round(rect.top / 4));
        }
      }
      const box = target.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(target).lineHeight) || 32;
      return { found: true, lineCount: yLines.size, singleLineHeight: box.height <= lh * 1.5 };
    });
    eq(cueLineCheck, { found: true, lineCount: 1, singleLineHeight: true },
      `Drill 2 longest cue "何か／あらう" renders on a single line at ${vpWidth}px`);
  }
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.waitForTimeout(100);

  // Drill 3 item 1 Yes/No tooltips + aria-labels (none on item 2+) & Example 3 Smile/Frown listen tooltips
  const d3TooltipAudit = await p.evaluate(() => {
    const cards = document.querySelectorAll('#drill3 .p81-card');
    const c1Yes = cards[0]?.querySelector('.answer-choice[data-answer="yes"]');
    const c1No = cards[0]?.querySelector('.answer-choice[data-answer="no"]');
    const c2Tips = cards[1] ? cards[1].querySelectorAll('.answer-choice .custom-tip-box').length : -1;
    const exYes = document.querySelector('#drill3 .p81-example .ex-audio-btn[data-answer="yes"]');
    const exNo = document.querySelector('#drill3 .p81-example .ex-audio-btn[data-answer="no"]');
    return {
      c1YesTip: c1Yes?.querySelector('.custom-tip-box')?.textContent || '',
      c1YesAria: c1Yes?.getAttribute('aria-label') || '',
      c1NoTip: c1No?.querySelector('.custom-tip-box')?.textContent || '',
      c1NoAria: c1No?.getAttribute('aria-label') || '',
      c2Tips,
      exYesTip: exYes?.querySelector('.custom-tip-box')?.textContent || '',
      exYesAria: exYes?.getAttribute('aria-label') || '',
      exNoTip: exNo?.querySelector('.custom-tip-box')?.textContent || '',
      exNoAria: exNo?.getAttribute('aria-label') || ''
    };
  });
  eq(d3TooltipAudit, {
    c1YesTip: 'Yes',
    c1YesAria: 'Yes',
    c1NoTip: 'No',
    c1NoAria: 'No',
    c2Tips: 0,
    exYesTip: 'Listen to the affirmative model.',
    exYesAria: 'Listen to the affirmative model.',
    exNoTip: 'Listen to the negative model.',
    exNoAria: 'Listen to negative model.'
  }, 'Practice 8.2 Drill 3 item 1 Yes/No and Example 3 Smile/Frown hover tooltips match spec');

  // Paired Rows visual bounding-box check at 1440px (inline)
  const checkPairedGeometry = async (vpWidth, expectedLayout) => {
    await p.setViewportSize({ width: vpWidth, height: 1000 });
    await p.waitForTimeout(150);
    const geom = await p.evaluate((exp) => {
      const card = document.querySelector('#drill3 .p81-card');
      const tbl = card.querySelector('table.recording-table.p81-table');
      const layout = tbl.dataset.contentLayout;
      const trs = tbl.querySelectorAll('tbody > tr');
      const numRect = trs[0].querySelector('.drill-number-cell').getBoundingClientRect();
      const cue1Rect = trs[0].querySelector('.prompt-label').getBoundingClientRect();
      const ctrl1Rect = trs[0].querySelector('.p81-controls').getBoundingClientRect();
      const cue2Rect = trs[1].querySelector('.prompt-label').getBoundingClientRect();
      const ctrl2Rect = trs[1].querySelector('.p81-controls').getBoundingClientRect();
      return {
        layoutMatches: layout === exp,
        row1NumCueTopOk: Math.abs(numRect.top - cue1Rect.top) <= 6,
        cuesSameLeft: Math.abs(cue1Rect.left - cue2Rect.left) <= 2,
        cuesNoOverlap: cue2Rect.top >= cue1Rect.bottom - 2,
        inlineOk: exp === 'inline'
          ? (cue1Rect.right <= ctrl1Rect.left + 1 && cue2Rect.right <= ctrl2Rect.left + 1)
          : true,
        stackedOk: exp === 'stacked'
          ? (ctrl1Rect.top >= cue1Rect.bottom - 2 &&
             cue2Rect.top >= ctrl1Rect.bottom - 2 &&
             ctrl2Rect.top >= cue2Rect.bottom - 2 &&
             ctrl1Rect.left <= numRect.right + 1)
          : true
      };
    }, expectedLayout);
    eq(geom, {
      layoutMatches: true,
      row1NumCueTopOk: true,
      cuesSameLeft: true,
      cuesNoOverlap: true,
      inlineOk: true,
      stackedOk: true
    }, `Phase 4: Paired Rows visual placement holds in ${expectedLayout} (${vpWidth}px)`);
  };
  await checkPairedGeometry(1440, 'inline');
  await p.setViewportSize({ width: 1440, height: 1000 });

  // C. P8.2 Low-Volume STT Protection (6 scenarios, 5s boundary, empty/late discard, interim/final, s.heard empty STT mismatch, Manual no-5s)
  await p.evaluate(() => {
    const autoRecord = document.getElementById('toggleRecordMode');
    if (autoRecord && !autoRecord.checked) autoRecord.click(); // Autostop ON
    const autoToggle = document.getElementById('togglePlaybackMode');
    if (autoToggle && !autoToggle.checked) autoToggle.click(); // Auto-Compare ON
    t.speaking = false;
  });

  // Scenario 1: Low-volume STT within 5s bypasses 5s timeout, stays open without 7s stop, saves on speech stop, and runs Auto-Compare ON relay
  const s1Row = p.locator('[data-row="any-2-a"]');
  const s1RecStartCount = await p.evaluate(() => t.recognitions.length);
  await s1Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s1RecStartCount);
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    const res = [{ transcript: '大学で何か教えます' }];
    res.isFinal = true;
    t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
  });
  await p.waitForTimeout(4500);
  eq(await p.evaluate(() => t.recorders.at(-1)?.state), 'recording', 'Low-vol STT <=5s keeps recording active past 5s without timeout');
  eq((await s1Row.locator('.result-text').textContent()).includes('No speech detected within 5 seconds.'), false, 'Low-vol STT <=5s shows no 5s timeout notice');
  const s1SpokenBefore = await p.evaluate(() => t.spoken.length);
  await p.evaluate(() => { t.speaking = true; });
  await p.waitForTimeout(450);
  await p.evaluate(() => { t.speaking = false; });
  await p.waitForFunction(() => audit82.saved.has('any-2-a:fixed'), { timeout: 5000 });
  await p.waitForFunction((n) => t.spoken.length > n, s1SpokenBefore);
  eq(await p.evaluate(() => {
    const entry = audit82.saved.get('any-2-a:fixed');
    return { raw: entry?.raw, status: entry?.status };
  }), { raw: '大学で何か教えます', status: 'accepted' }, 'Low-vol STT <=5s saves and grades transcript cleanly');
  eq(await s1Row.locator('.play-recording-btn').count(), 1, 'Low-vol STT <=5s renders own playback button');
  // Complete relay cleanly
  const s1AudioBefore = await p.evaluate(() => t.audios.length);
  await p.evaluate(() => { t.spoken.at(-1).onend?.(); });
  await p.waitForFunction((n) => t.audios.length > n, s1AudioBefore);
  await p.evaluate(() => { t.audios.at(-1).onended?.(); });

  // Scenario 2 & 3: Whitespace-only / empty STT within 5s triggers 5s discard & keeps prior saved; late onresult after discard is ignored
  const s2RecCount = await p.evaluate(() => t.recognitions.length);
  await s1Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s2RecCount);
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    const res = [{ transcript: '   ' }];
    res.isFinal = true;
    t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
  });
  await p.waitForTimeout(4800);
  eq(await p.evaluate(() => t.recorders.at(-1)?.state), 'inactive', 'Empty/whitespace STT triggers 5s autostop');
  eq((await s1Row.locator('.result-text').textContent()).includes('No speech detected within 5 seconds.'), true, 'Empty/whitespace STT shows 5s timeout notice');
  await p.evaluate(() => {
    const res = [{ transcript: 'あとから届いた認識' }];
    res.isFinal = true;
    t.recognitions.at(-1).onresult?.({ resultIndex: 0, results: [res] });
  });
  eq(await p.evaluate(() => audit82.saved.get('any-2-a:fixed')?.raw), '大学で何か教えます', '5s discard preserves previous saved recording and ignores late onresult');

  // Switch to Manual mode & turn off Auto-Compare for manual stop tests (Scenarios 4a, 4b, 5, 6)
  await p.evaluate(() => {
    const autoRecord = document.getElementById('toggleRecordMode');
    if (autoRecord?.checked) autoRecord.click(); // Manual
    const autoToggle = document.getElementById('togglePlaybackMode');
    if (autoToggle?.checked) autoToggle.click(); // Auto-Compare OFF
  });

  // Scenario 4a: Interim-only low-volume STT saved on manual stop
  const s4Row = p.locator('[data-row="any-3-a"]');
  const s4RecCount = await p.evaluate(() => t.recognitions.length);
  await s4Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s4RecCount);
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    const res = [{ transcript: '先生に何か聞きます' }];
    res.isFinal = false;
    t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
  });
  await s4Row.locator('.stop-btn-active').click();
  await p.waitForFunction(() => audit82.saved.has('any-3-a:fixed'));
  eq(await p.evaluate(() => ({
    raw: audit82.saved.get('any-3-a:fixed')?.raw,
    status: audit82.saved.get('any-3-a:fixed')?.status
  })), { raw: '先生に何か聞きます', status: 'accepted' }, 'Interim-only low-vol STT saved on manual stop');

  // Scenario 4b: Trailing isFinal arriving during s.stopping before onend does not duplicate interim
  const s4bRecCount = await p.evaluate(() => t.recognitions.length);
  await s4Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s4bRecCount);
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const rec = t.recognitions.at(-1);
    const interimRes = [{ transcript: '先生に何か聞きます' }];
    interimRes.isFinal = false;
    rec.onresult({ resultIndex: 0, results: [interimRes] });
    rec.stop = () => {
      setTimeout(() => {
        const finalRes = [{ transcript: '先生に何か聞きます' }];
        finalRes.isFinal = true;
        rec.onresult({ resultIndex: 0, results: [finalRes] });
        rec.onend?.();
      }, 60);
    };
  });
  await s4Row.locator('.stop-btn-active').click();
  await p.waitForTimeout(180);
  eq(await p.evaluate(() => audit82.saved.get('any-3-a:fixed')?.raw), '先生に何か聞きます', 'Trailing isFinal during stopping replaces interim without duplication');

  // Scenario 5: s.heard === true with empty STT still saves as mismatch
  await p.evaluate(() => { t.speaking = true; });
  const s5RecCount = await p.evaluate(() => t.recognitions.length);
  await s4Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s5RecCount);
  await p.waitForTimeout(450);
  await s4Row.locator('.stop-btn-active').click();
  await p.waitForTimeout(150);
  eq(await p.evaluate(() => ({
    raw: audit82.saved.get('any-3-a:fixed')?.raw,
    status: audit82.saved.get('any-3-a:fixed')?.status
  })), { raw: '', status: 'mismatch' }, 'Empty STT with s.heard === true saves as mismatch');

  // Scenario 6: Manual mode has NO 5s timeout even with speaking: false and no STT
  await p.evaluate(() => { t.speaking = false; });
  const s6RecCount = await p.evaluate(() => t.recognitions.length);
  await s4Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s6RecCount);
  await p.waitForTimeout(5200);
  eq(await s4Row.locator('.stop-btn-active').count(), 1, 'Manual mode does NOT auto-stop at 5s even without STT or mic volume');
  await s4Row.locator('.stop-btn-active').click();
  await p.waitForTimeout(150);

  // Scenario 6b: Manual mode saves valid Final STT arrived after 5s
  const s6bRecCount = await p.evaluate(() => t.recognitions.length);
  await s4Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s6bRecCount);
  await p.waitForTimeout(5200);
  await p.evaluate(() => {
    const res = [{ transcript: '先生に何か聞きます' }];
    res.isFinal = true;
    t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
  });
  await s4Row.locator('.stop-btn-active').click();
  await p.waitForFunction(() => audit82.saved.get('any-3-a:fixed')?.raw === '先生に何か聞きます');
  eq(await p.evaluate(() => ({
    raw: audit82.saved.get('any-3-a:fixed')?.raw,
    status: audit82.saved.get('any-3-a:fixed')?.status
  })), { raw: '先生に何か聞きます', status: 'accepted' }, 'Manual mode >5s low-vol Final STT saved and graded');

  // Scenario 6c: Manual mode saves valid Interim-only STT arrived after 5s
  const s6cRecCount = await p.evaluate(() => t.recognitions.length);
  await s4Row.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, s6cRecCount);
  await p.waitForTimeout(5200);
  await p.evaluate(() => {
    const res = [{ transcript: '先生に聞きます' }];
    res.isFinal = false;
    t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
  });
  await s4Row.locator('.stop-btn-active').click();
  await p.waitForFunction(() => audit82.saved.get('any-3-a:fixed')?.raw === '先生に聞きます');
  eq(await p.evaluate(() => audit82.saved.get('any-3-a:fixed')?.raw), '先生に聞きます', 'Manual mode >5s low-vol Interim-only STT saved on manual stop');

  await p.evaluate(() => {
    const autoRecord = document.getElementById('toggleRecordMode');
    if (autoRecord && !autoRecord.checked) autoRecord.click(); // restore Autostop ON
  });

  // D. Practice 8.2 25px hysteresis and mixed-group (inline + stacked) track isolation
  await p.setViewportSize({ width: 1280, height: 1000 });
  await p.waitForTimeout(100);
  const d1Hyst = await p.evaluate(() => {
    const intrinsic = (el) => {
      const c = el.cloneNode(true), s = getComputedStyle(el);
      c.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(x => x.remove());
      Object.assign(c.style, { position: 'absolute', visibility: 'hidden', display: s.display.includes('flex') ? 'inline-flex' : 'inline-block', width: 'max-content', minWidth: '0', maxWidth: 'none', whiteSpace: 'nowrap', flexWrap: 'nowrap' });
      el.parentElement.append(c);
      const w = c.getBoundingClientRect().width;
      c.remove();
      return w;
    };
    const sec = document.getElementById('drill1');
    const card = sec.querySelector('.p81-card');
    const tbl = card.querySelector('table.recording-table.p81-table');
    const numW = parseFloat(getComputedStyle(tbl).getPropertyValue('--content-number-width')) || intrinsic(tbl.querySelector('.drill-number-cell'));
    const cueW = intrinsic(tbl.querySelector('.prompt-label'));
    const ctrlTd = tbl.querySelector('.p81-controls');
    const ctrlS = getComputedStyle(ctrlTd);
    const actW = intrinsic(ctrlTd.querySelector('.recording-actions')) + parseFloat(ctrlS.paddingLeft) + parseFloat(ctrlS.paddingRight);
    const needed = numW + cueW + actW + 8;
    const chrome = card.offsetWidth - tbl.clientWidth;
    return { needed, chrome };
  });
  const setDrill1Width = async (w) => {
    await p.evaluate((widthPx) => {
      const sec = document.getElementById('drill1');
      sec.style.width = widthPx ? `${widthPx}px` : '';
    }, w);
    await p.waitForTimeout(120);
  };
  await setDrill1Width(Math.round(d1Hyst.needed + d1Hyst.chrome + 60));
  eq(await p.locator('#drill1 .p81-card table').first().getAttribute('data-content-layout'), 'inline',
    'P8.2 starts inline when available width clears needed width');
  await setDrill1Width(Math.round(d1Hyst.needed + d1Hyst.chrome - 10));
  eq(await p.locator('#drill1 .p81-card table').first().getAttribute('data-content-layout'), 'stacked',
    'P8.2 switches to stacked when cue exceeds room');
  await setDrill1Width(Math.round(d1Hyst.needed + d1Hyst.chrome + 10));
  eq(await p.locator('#drill1 .p81-card table').first().getAttribute('data-content-layout'), 'stacked',
    'P8.2 25px hysteresis keeps stacked inside [needed, needed + 25) band');
  await setDrill1Width(Math.round(d1Hyst.needed + d1Hyst.chrome + 35));
  eq(await p.locator('#drill1 .p81-card table').first().getAttribute('data-content-layout'), 'inline',
    'P8.2 restores inline once available width exceeds needed + 25px');
  await setDrill1Width(null);

  // Mixed group (inline + stacked) --content-cue-width track isolation on Drill 3
  const d3MixInfo = await p.evaluate(() => {
    const intrinsic = (el) => {
      const c = el.cloneNode(true), s = getComputedStyle(el);
      c.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(x => x.remove());
      Object.assign(c.style, { position: 'absolute', visibility: 'hidden', display: s.display.includes('flex') ? 'inline-flex' : 'inline-block', width: 'max-content', minWidth: '0', maxWidth: 'none', whiteSpace: 'nowrap', flexWrap: 'nowrap' });
      el.parentElement.append(c);
      const w = c.getBoundingClientRect().width;
      c.remove();
      return w;
    };
    const cards = [...document.querySelectorAll('#drill3 .p81-card')];
    const stats = cards.map(card => {
      const tbl = card.querySelector('table.recording-table.p81-table');
      const numW = parseFloat(getComputedStyle(tbl).getPropertyValue('--content-number-width')) || 0;
      const cueW = Math.max(...[...tbl.querySelectorAll('.prompt-label')].map(intrinsic));
      const actW = Math.max(...[...tbl.querySelectorAll('.p81-controls')].map(td => {
        const cs = getComputedStyle(td);
        return intrinsic(td.querySelector('.recording-actions')) + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      }));
      return { needed: numW + cueW + actW + 8, cueW, chrome: card.offsetWidth - tbl.clientWidth };
    });
    const sorted = [...stats].sort((a, b) => a.needed - b.needed);
    return { min: sorted[0], max: sorted[sorted.length - 1] };
  });
  const midMixWidth = Math.round(d3MixInfo.min.needed + (d3MixInfo.max.needed - d3MixInfo.min.needed) * 0.5 + d3MixInfo.min.chrome);
  await p.evaluate((w) => { document.getElementById('drill3').style.width = `${w}px`; }, midMixWidth);
  await p.waitForTimeout(120);
  const mixCheck = await p.evaluate(() => {
    const intrinsic = (el) => {
      const c = el.cloneNode(true), s = getComputedStyle(el);
      c.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(x => x.remove());
      Object.assign(c.style, { position: 'absolute', visibility: 'hidden', display: 'inline-block', width: 'max-content', minWidth: '0', maxWidth: 'none', whiteSpace: 'nowrap' });
      el.parentElement.append(c);
      const w = c.getBoundingClientRect().width;
      c.remove();
      return w;
    };
    const tables = [...document.querySelectorAll('#drill3 .p81-card table.recording-table.p81-table')];
    const inlineTbls = tables.filter(t => t.dataset.contentLayout === 'inline');
    const stackedTbls = tables.filter(t => t.dataset.contentLayout === 'stacked');
    const maxInlineCue = Math.max(...inlineTbls.flatMap(t => [...t.querySelectorAll('.prompt-label')].map(intrinsic)));
    const maxStackedCue = Math.max(...stackedTbls.flatMap(t => [...t.querySelectorAll('.prompt-label')].map(intrinsic)));
    const inlineTracks = inlineTbls.map(t => parseFloat(t.style.getPropertyValue('--content-cue-width')));
    return {
      hasInline: inlineTbls.length > 0,
      hasStacked: stackedTbls.length > 0,
      trackMatchesInlineOnly: inlineTracks.every(tr => Math.abs(tr - maxInlineCue) < 1 && tr < maxStackedCue)
    };
  });
  eq(mixCheck, { hasInline: true, hasStacked: true, trackMatchesInlineOnly: true },
    'Mixed inline+stacked group computes --content-cue-width exclusively from inline tables');
  await p.evaluate(() => { document.getElementById('drill3').style.width = ''; });
  await p.waitForTimeout(100);

  // E. Low-volume STT validity boundary (5 patterns: "...", "、。", "   ", "★♪", valid text)
  await p.evaluate(() => {
    const autoRecord = document.getElementById('toggleRecordMode');
    if (autoRecord && !autoRecord.checked) autoRecord.click(); // Autostop ON
    const autoToggle = document.getElementById('togglePlaybackMode');
    if (autoToggle && !autoToggle.checked) autoToggle.click(); // Auto-Compare ON
    t.speaking = false;
  });
  const eRow = p.locator('[data-row="any-1-a"]');
  for (const invalidStt of ['...', '、。', '   ', '★♪']) {
    const recCount = await p.evaluate(() => t.recognitions.length);
    const spokenCount = await p.evaluate(() => t.spoken.length);
    await eRow.locator('.drill-record-btn').click();
    await p.waitForFunction((n) => t.recognitions.length > n, recCount);
    await p.waitForTimeout(400);
    await p.evaluate((txt) => {
      const res = [{ transcript: txt }];
      res.isFinal = true;
      t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
    }, invalidStt);
    await p.waitForTimeout(4900);
    eq(await p.evaluate(() => t.recorders.at(-1)?.state), 'inactive',
      `Invalid low-vol STT ${JSON.stringify(invalidStt)} triggers 5s timeout`);
    eq((await eRow.locator('.result-text').textContent()).includes('No speech detected within 5 seconds.'), true,
      `Invalid low-vol STT ${JSON.stringify(invalidStt)} shows 5s timeout message`);
    eq(await p.evaluate(() => audit82.saved.has('any-1-a:fixed')), false,
      `Invalid low-vol STT ${JSON.stringify(invalidStt)} does not save audio`);
    eq(await eRow.locator('.play-recording-btn').count(), 0,
      `Invalid low-vol STT ${JSON.stringify(invalidStt)} renders no play button`);
    eq(await p.evaluate(() => t.spoken.length), spokenCount,
      `Invalid low-vol STT ${JSON.stringify(invalidStt)} triggers no Auto-Compare relay`);
  }

  const validRecCount = await p.evaluate(() => t.recognitions.length);
  const validSpokenBefore = await p.evaluate(() => t.spoken.length);
  await eRow.locator('.drill-record-btn').click();
  await p.waitForFunction((n) => t.recognitions.length > n, validRecCount);
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const res = [{ transcript: '何か食べます' }];
    res.isFinal = true;
    t.recognitions.at(-1).onresult({ resultIndex: 0, results: [res] });
  });
  await p.waitForTimeout(4900);
  eq(await p.evaluate(() => t.recorders.at(-1)?.state), 'recording', 'Valid Japanese low-vol STT bypasses 5s timeout');
  await p.evaluate(() => { t.speaking = true; });
  await p.waitForTimeout(450);
  await p.evaluate(() => { t.speaking = false; });
  await p.waitForFunction(() => audit82.saved.has('any-1-a:fixed'), { timeout: 5000 });
  await p.waitForFunction((n) => t.spoken.length > n, validSpokenBefore);
  eq(await p.evaluate(() => audit82.saved.get('any-1-a:fixed')?.raw), '何か食べます', 'Valid Japanese low-vol STT saves raw transcript');
  eq(await eRow.locator('.play-recording-btn').count(), 1, 'Valid Japanese low-vol STT renders playback button');
  const eAudioBefore = await p.evaluate(() => t.audios.length);
  await p.evaluate(() => { t.spoken.at(-1).onend?.(); });
  await p.waitForFunction((n) => t.audios.length > n, eAudioBefore);
  await p.evaluate(() => { t.audios.at(-1).onended?.(); });

  // Verify Escape does NOT affect status indicator (.p82-autostop-open / .p82-autoplay-stop) and covers single dismissal & UI priority
  const recBtn = p.locator('#drill1 .drill-record-btn').first();
  await recBtn.click();
  await p.waitForFunction(() => t.recognitions.length > 0);
  const autostopHost = p.locator('.p82-autostop-open').first();
  if (await autostopHost.count() > 0) {
    await p.keyboard.press('Escape');
    eq(await autostopHost.evaluate(e => e.classList.contains('p82-autostop-open')), true, 'Recording autostop host unaffected by Escape');
    eq(await autostopHost.evaluate(e => !e.hasAttribute('data-tip-suppressed')), true, 'Recording autostop host has no data-tip-suppressed');
  }
  const stopBtn = p.locator('.stop-btn-active').first();
  if (await stopBtn.count() > 0) await stopBtn.click();

  // Verify duplicate translation tooltips and grammar spoiler are removed, while Dr1 guidance & optional particle remain
  eq(await p.evaluate(() => {
    const nodes = [...document.querySelectorAll('.p82-concept-english, .p82-model-translation')];
    return nodes.length > 0 && nodes.every(n => !n.classList.contains('custom-tip-wrap') && !n.querySelector('.custom-tip-box') && !n.hasAttribute('title'));
  }), true, 'P8.2 concept labels and model translations have no duplicate tooltip or title attribute');
  eq(await p.evaluate(() => {
    const tips = [...document.querySelectorAll('.tooltip-tip')].map(e => e.textContent);
    return tips.includes('nanimo, nothing') && !tips.some(t => t.includes('with a negative ending'));
  }), true, 'P8.2 nothing vocabulary hint has no grammar spoiler');
  await p.evaluate(() => {
    document.querySelectorAll('[data-tip-suppressed]').forEach(e => e.removeAttribute('data-tip-suppressed'));
  });

  // Verify Drill 3 Y/N click performs local update without rebuilding other drills/examples and clears/switches row state cleanly
  await p.evaluate(() => {
    audit82.choices.delete('yn-0-a');
    audit82.saved.delete('yn-0-a:yes');
    audit82.saved.delete('yn-0-a:no');
    audit82.render();
    window.__ynRefNodes = {
      ex1: document.querySelector('#drill1 .example-box'),
      d1Row: document.querySelector('#drill1 .drill-row'),
      d5Panel: document.querySelector('#drill5Container .drill-cue-panel')
    };
  });
  const ynRow = p.locator('tr[data-row="yn-0-a"]');
  eq(await ynRow.locator('.drill-listen-btn').isDisabled(), true, 'Unselected Y/N row disables listen button');
  await ynRow.locator('button.answer-choice[data-answer="yes"]').click();
  eq(await p.evaluate(() => {
    const r = window.__ynRefNodes;
    return r.ex1 === document.querySelector('#drill1 .example-box')
      && r.d1Row === document.querySelector('#drill1 .drill-row')
      && r.d5Panel === document.querySelector('#drill5Container .drill-cue-panel');
  }), true, 'Y/N click preserves Example, Drill 1, and Drill 5 DOM nodes without full render()');
  await p.evaluate(() => {
    audit82.saved.set('yn-0-a:yes', { raw: 'はい、します', status: 'accepted', correct: true });
    audit82.render();
  });
  eq(await ynRow.locator('.result-text').textContent(), 'はい、します', 'Yes side shows saved STT result');
  await ynRow.locator('button.answer-choice[data-answer="no"]').click();
  eq(await ynRow.locator('button.answer-choice[data-answer="no"]').getAttribute('aria-pressed'), 'true', 'No button becomes pressed');
  eq(await ynRow.locator('.result-text').textContent(), '', 'Switching to unrecorded No clears previous Yes result');
  const noSpokenBefore = await p.evaluate(() => t.spoken.length);
  await ynRow.locator('.drill-listen-btn').click();
  await p.waitForFunction((n) => t.spoken.length > n, noSpokenBefore);
  eq(await p.evaluate(() => t.spoken.at(-1)?.text?.includes('いいえ')), true, 'No side listen button plays No model after local update');
  await p.evaluate(() => { t.spoken.at(-1)?.onend?.(); });
  await ynRow.locator('button.answer-choice[data-answer="yes"]').click();
  eq(await ynRow.locator('.result-text').textContent(), 'はい、します', 'Switching back to Yes restores saved Yes result');

  // Verify Autostop / Auto-Compare ON/OFF text button contract (36x20px fixed, Tab/Space, disabled cursor: default)
  const btnAudit = await p.evaluate(() => {
    const sw = document.querySelector('#toggleRecordMode').closest('label.switch');
    const input = document.getElementById('toggleRecordMode');
    const slider = sw.querySelector('.slider');
    const onText = getComputedStyle(slider, '::before').content;
    const onRect = slider.getBoundingClientRect();
    sw.click();
    const offText = getComputedStyle(slider, '::before').content;
    const offRect = slider.getBoundingClientRect();
    sw.click();
    return {
      onText, offText,
      wOn: Math.round(onRect.width), hOn: Math.round(onRect.height),
      wOff: Math.round(offRect.width), hOff: Math.round(offRect.height),
      checkedAfterRestore: input.checked
    };
  });
  eq(btnAudit, { onText: '"ON"', offText: '"OFF"', wOn: 36, hOn: 20, wOff: 36, hOff: 20, checkedAfterRestore: true }, 'P8.2 Autostop renders fixed 36x20px ON/OFF text button');
  await p.locator('#toggleRecordMode').focus();
  await p.keyboard.press('Space');
  eq(await p.locator('#toggleRecordMode').isChecked(), false, 'P8.2 Space toggles ON/OFF checkbox');
  await p.keyboard.press('Space');
  eq(await p.locator('#toggleRecordMode').isChecked(), true, 'P8.2 Space restores ON');
  await p.locator('#drill1 .drill-listen-btn').first().click();
  const disabledAudit = await p.evaluate(() => {
    const input = document.getElementById('toggleRecordMode');
    const slider = input.closest('label.switch').querySelector('.slider');
    const cs = getComputedStyle(slider);
    return { disabled: input.disabled, cursor: cs.cursor, opacity: cs.opacity };
  });
  eq(disabledAudit.disabled, true, 'P8.2 Autostop disabled during playback');
  eq(disabledAudit.cursor, 'default', 'P8.2 disabled ON/OFF button uses cursor: default');
  eq(parseFloat(disabledAudit.opacity) < 0.7, true, 'P8.2 disabled ON/OFF button dims opacity');
  await p.evaluate(() => { t.spoken.at(-1)?.onend?.(); });

  // Speech filler tolerance (ja 8 words) & transcript preservation
  const jaFillerAudit = await p.evaluate(() => {
    const r = { id: 'q_filler', refs: ['はい、好きです'], yn: true, answer: 'yes', pending: false };
    const rNo = { id: 'q_filler_no', refs: ['いいえ、好きじゃないです'], yn: true, answer: 'no', pending: false };
    return {
      acceptedSingle: evaluateAnswer('えーと、はい、好きです', r),
      acceptedMulti: evaluateAnswer('えーと、あのー、うーん、はい、好きです', r),
      acceptedAll8: ['えーと','えっと','あのう','あのー','うーん','えー','あの','まあ'].every(f => evaluateAnswer(f + '、はい、好きです', r) === 'accepted'),
      eeNotStripped: evaluateAnswer('ええ、好きです', r),
      unPolarityMismatch: evaluateAnswer('うん、好きじゃないです', r),
      unNoPolarityMismatch: evaluateAnswer('うん、好きです', rNo),
      fillerPlusRespIncomplete: evaluateAnswer('あのー、はい', r),
      fillerPlusPartialIncomplete: evaluateAnswer('えーと、はい、好き', r),
    };
  });
  eq(jaFillerAudit.acceptedSingle, 'accepted', 'P8.2 ja filler single accepted');
  eq(jaFillerAudit.acceptedMulti, 'accepted', 'P8.2 ja filler multi accepted');
  eq(jaFillerAudit.acceptedAll8, true, 'P8.2 ja all 8 fillers accepted');
  eq(jaFillerAudit.eeNotStripped, 'mismatch', 'P8.2 ええ is not stripped as えー');
  eq(jaFillerAudit.unPolarityMismatch, 'mismatch', 'P8.2 うん polarity mismatch rejected');
  eq(jaFillerAudit.unNoPolarityMismatch, 'mismatch', 'P8.2 うん on No answer rejected');
  eq(jaFillerAudit.fillerPlusRespIncomplete, 'incomplete', 'P8.2 filler + response word only is incomplete');
  eq(jaFillerAudit.fillerPlusPartialIncomplete, 'incomplete', 'P8.2 filler + partial predicate is incomplete');

  // Autostop OFF matches stop button color; Auto-Compare OFF keeps neutral color
  const offColorAudit = await p.evaluate(() => {
    const rec = document.getElementById('toggleRecordMode');
    const pb = document.getElementById('togglePlaybackMode');
    const wasRec = rec.checked;
    const wasPb = pb.checked;
    rec.checked = false;
    pb.checked = false;
    const recBg = getComputedStyle(rec.nextElementSibling).backgroundColor;
    const pbBg = getComputedStyle(pb.nextElementSibling).backgroundColor;
    const stopBtn = document.querySelector('.drill-record-btn');
    stopBtn.classList.add('stop-btn-active');
    const stopBg = getComputedStyle(stopBtn).backgroundColor;
    stopBtn.classList.remove('stop-btn-active');
    rec.checked = wasRec;
    pb.checked = wasPb;
    return { recBg, pbBg, stopBg };
  });
  eq(offColorAudit.recBg, offColorAudit.stopBg, 'P8.2 Autostop OFF matches stop button background');
  eq(offColorAudit.pbBg !== offColorAudit.stopBg, true, 'P8.2 Auto-Compare OFF keeps neutral background');

 eq(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 8.2',count);
})().catch(e=>{console.error(e);process.exit(1)});
