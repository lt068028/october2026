const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
function mock(){
 window.t={spoken:[],audios:[],tracks:[],recorders:[],recognitions:[],requests:[],defer:false,deny:false,decodeDefer:false,decodes:[],speaking:false};
 Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{name:'Google A',voiceURI:'a',lang:'ja-JP'},{name:'Google B',voiceURI:'b',lang:'ja-JP'}],addEventListener(){},onvoiceschanged:null,speak(u){t.spoken.push(u);this.current=u},cancel(){const u=this.current;this.current=null;u?.onerror?.({error:'canceled'})}}});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise((resolve,reject)=>{const finish=()=>{if(t.deny)return reject(new DOMException('Denied','NotAllowedError'));const track={readyState:'live',stop(){this.readyState='ended'},addEventListener(){}};t.tracks.push(track);resolve({getTracks:()=>[track]})};t.requests.push(finish);if(!t.defer)finish()})}});
 window.NativePitchWorker=window.Worker;
 window.Worker=class{
  constructor(){(t.workers ||= []).push(this)}
  postMessage(){if(t.workerHang)return;queueMicrotask(()=>{if(!this.terminated)this.onmessage?.({data:{frames:[{time:0,f0:180},{time:.02,f0:190}]}})})}
  terminate(){this.terminated=true}
 };
 window.MediaRecorder=class{constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm';t.recorders.push(this)}start(){this.state='recording'}stop(){this.state='inactive';setTimeout(()=>{this.ondataavailable?.({data:new Blob(['recorded'])});this.onstop?.()},0)}};
 window.SpeechRecognition=class{constructor(){t.recognitions.push(this)}start(){}stop(){setTimeout(()=>this.onend?.(),0)}abort(){setTimeout(()=>this.onend?.(),0)}};
 window.Audio=class{constructor(url){this.url=url;t.audios.push(this)}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}};
 window.AudioContext=class{constructor(){this.state='running';this.sampleRate=48000}resume(){return Promise.resolve()}close(){this.state='closed';return Promise.resolve()}createMediaStreamSource(){return{connect(){},disconnect(){}}}createAnalyser(){return{fftSize:2048,getFloatTimeDomainData(a){a.fill(t.speaking?.08:0)},disconnect(){}}}decodeAudioData(){const buffer={sampleRate:48000,numberOfChannels:1,length:48000,getChannelData:()=>new Float32Array(48000)};if(t.decodeDefer)return new Promise(resolve=>t.decodes.push(()=>resolve(buffer)));return Promise.resolve(buffer)}};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(mock);
 await p.route('http://drill.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);return fs.existsSync(file)?r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'}):r.fulfill({status:404,body:''})});
 await p.goto('http://drill.test/practice2.1.html');let count=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 check(await p.locator('#scriptModeControl [data-value="hiragana"]').getAttribute('aria-pressed'),'true','L2 defaults to Hiragana');
 check(await p.evaluate(()=>practice2Normalize('鞄')===practice2Normalize('カバン')),true,'legacy bag ASR remains accepted');
 check(await p.locator('.example-box').count(),1,'Ex1 only');check(await p.locator('.p21-drill1 .drill-row').count(),2,'A and B practice groups');
 check(await p.locator('.p21-item-audio button').count(),6,'six audio buttons near objects');
 check(await p.locator('.p21-photo').evaluateAll(es=>es.every(im=>im.complete&&im.naturalWidth>0)),true,'photo loaded');
 check(await p.locator('.p21-photo-context span').textContent(),'Who is speaking?','speaker guide');
 check(await p.locator('.p21-photo-foreground').count(),3,'only objects restored; hand masking removed');
 check(await p.locator('.p21-model-line').count(),6,'six models below diagram');
 check(await p.locator('.p21-model-group h3 .target-word').allTextContents(),['ほん','かばん','とけい'],'three distinct objects');
 check(await p.locator('.p21-distance-board .p21-distance-person').count(),2,'only two people');
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  check(await p.locator('#drill2Container .drill-cue-cell .target-word').first().textContent(),script==='kanji'?'何':'なに','what follows reference-kanji display');
  if(script==='kanji')check(await p.locator('.p21-model-group h3 .target-word').nth(1).textContent(),'カバン','bag uses katakana in With kanji');
  for(const [object,noun] of [[1,'ほん'],[2,'かばん'],[3,'とけい']])for(const speaker of ['A','B']) {
   await p.locator(`.p21-item-audio button[data-speaker="${speaker}"][data-object="${object}"]`).click();
   const text=await p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
   const pro=object===3?'あれ':(speaker==='A'?object===1:object===2)?'これ':'それ';
   check(text,pro+'は'+noun+(style==='formal'?'です':'だ'),'speaker-relative model');
   check(await p.locator('.p21-current-speaker').textContent(),speaker,'speaker context');
   check(await p.locator('.p21-person-caption').allTextContents(),['A','B'],'person labels remain fixed');
   check(await p.locator('[data-zone="A"] .p21-area-sound').textContent(),speaker==='A'?'こ':'そ','A area sound follows speaker');
   check(await p.locator('[data-zone="B"] .p21-area-sound').textContent(),speaker==='B'?'こ':'そ','B area sound follows speaker');
   check(await p.locator('[data-zone="far"] .p21-area-sound').textContent(),'あ','far sound stable');
   check(await p.locator('.p21-model-line[aria-current="true"]').getAttribute('data-model-speaker'),speaker,'current text identified');
  }
 }
 await p.locator('.p21-item-audio button[data-speaker="A"][data-object="1"]').click();
 await p.evaluate(()=>{t.late21=t.spoken.at(-1).onend;});
 await p.locator('.p21-item-audio button[data-speaker="B"][data-object="1"]').click();
 await p.evaluate(()=>t.late21?.());
 check(await p.locator('.p21-item-audio button[data-speaker="A"][data-object="1"]').isEnabled(),true,'previous audio button restored');
 check(await p.locator('.p21-item-audio button[data-speaker="B"][data-object="1"]').isDisabled(),true,'new audio remains playing after stale callback');
 check(await p.locator('.p21-person-caption').allTextContents(),['A','B'],'person labels remain fixed after stale callback');
 check(await p.locator('.p21-distance-board').getAttribute('data-speaker'),'B','stale audio cannot change perspective');
 const attention=await p.locator('.p21-photo-context').evaluate(el=>{
  const animation=el.getAnimations()[0];
  return {outside:el.parentElement.classList.contains('p21-distance-board'),front:Number(getComputedStyle(el).zIndex)>Number(getComputedStyle(document.querySelector('.p21-distance-areas')).zIndex),highlight:animation.effect.getKeyframes()[1].backgroundColor,duration:animation.effect.getTiming().duration,iterations:animation.effect.getTiming().iterations};
 });
 check(attention,{outside:true,front:true,highlight:'rgb(254, 202, 202)',duration:1200,iterations:Infinity},'speaker guide pulses throughout playback');
 await p.locator('.p21-photo-context').evaluate(el=>{el.getAnimations()[0].currentTime=7200;});
 check(await p.locator('.p21-photo-context').evaluate(el=>el.getAnimations()[0].playState),'running','attention continues beyond three cycles');
 await p.evaluate(()=>t.spoken.at(-1).onend?.());
 check(await p.locator('.p21-photo-context').evaluate(el=>el.getAnimations().length),0,'TTS completion stops attention');
 await p.locator('.p21-item-audio button[data-speaker="B"][data-object="1"]').click();
 check(await p.locator('.p21-photo-context').evaluate(el=>el.getAnimations().length),1,'same speaker restarts attention');
 await p.evaluate(()=>t.spoken.at(-1).onend?.());
 check(await p.locator('.p21-photo-context').evaluate(el=>el.classList.contains('is-emphasized')),true,'speaker remains emphasized after audio');
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.locator('.p21-item-audio button[data-speaker="A"][data-object="1"]').click();
 check(await p.locator('.p21-photo-context').evaluate(el=>{const frames=el.getAnimations()[0].effect.getKeyframes();return frames[0].backgroundColor===frames[1].backgroundColor;}),true,'reduced motion uses static emphasis during playback');
 await p.evaluate(()=>t.spoken.at(-1).onend?.());
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.locator('.p21-item-audio button[data-speaker="A"][data-object="1"]').click();
 await p.evaluate(()=>t.spoken.at(-1).onerror?.({error:'synthesis-failed'}));
 check(await p.locator('.p21-photo-context').evaluate(el=>el.getAnimations().length),0,'TTS failure stops attention');
 await p.locator('.p21-item-audio button[data-speaker="B"][data-object="1"]').click();
 await p.evaluate(()=>stopAllPlayback());
 check(await p.locator('.p21-photo-context').evaluate(el=>el.getAnimations().length),0,'explicit interruption stops attention');
 for(const width of [600,900,1440,1920])for(const theme of ['light','dark']) {
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
  check(await p.locator('.p21-area-caption').evaluateAll(es=>es.every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)')),true,'region labels have no background panels');
  check(await p.locator('.p21-area-description').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)>=18)),true,'region descriptions at least 18px');
  const ratio=await p.locator('.p21-distance-board').evaluate(e=>{const p=e.parentElement,c=getComputedStyle(p);return e.clientWidth/(p.clientWidth-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight));});
  check(Math.abs(ratio-(width>900?.75:1))<.04,true,'75 percent scene, readable narrow fallback');
  check(await p.locator('.p21-item-audio').evaluateAll(es=>es.every(e=>getComputedStyle(e).flexDirection==='column')),true,'A B audio buttons stacked');
  check(await p.locator('.example-box,.p21-distance-board,.p21-distance-area,.p21-model-group').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'no horizontal overflow');
 }
 check(await p.locator('button .custom-tip-box').evaluateAll(es=>es.some(t=>/^Listen/.test(t.textContent))),false,'no routine explanations');

 const nounGroups=[['book','bag','clock']];
 for(const selector of ['.p21-drill1','#drill2Container']) {
  for(const set of [0,1]) {
   await p.locator(selector+' .p21-set-switcher button').nth(set).click();
   const kinds=await p.locator(selector+' .p21-drill-item').evaluateAll(es=>es.map(e=>e.dataset.kind));
   check(kinds.some(k=>['phone','dictionary','wallet'].includes(k)),false,'D1/D2 do not use nouns reserved for D3');nounGroups.push(kinds);
  }
  await p.locator(selector+' .p21-set-switcher button').first().click();
 }
 for(const set of [0,1,2]) {
  await p.locator('#drill3Container .p21-set-switcher button').nth(set).click();
  nounGroups.push(await p.locator('#drill3Container .p21-drill-item').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.kind))]));
 }
 await p.locator('#drill3Container .p21-set-switcher button').first().click();
 check(nounGroups.flat().length,18,'18 assigned nouns');
 check(new Set(nounGroups.flat()).size,18,'no noun reused across examples and drill sets');
 check(await p.locator('.p21-drill1 .recording-table tr').count(),6,'three rows per speaker');
 check(await p.locator('.p21-drill1 .p21-reach,.p21-drill1 .p21-object-number,.p21-drill1 .p21-area-caption').count(),0,'no regions, object numbers or distance answers');
 check(await p.locator('.p21-drill1 .p21-drill-item').count(),3,'three independent item layers');
 check(await p.evaluate(()=>practice2Normalize('Tシャツ')===practice2Normalize('ティーシャツ')),true,'T-shirt recognition forms agree');
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji'])for(const set of [0,1]) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  await p.locator('.p21-drill1 .p21-set-switcher button').nth(set).click();
  const nouns=set===0?['ぺん','しんぶん','ぼうし']:['のーと','えんぴつ','てぃーしゃつ'];
  const rows=p.locator('.p21-drill1 tr');
  for(let i=0;i<6;i++) {
   const speaker=set===0?(i<3?'A':'B'):(i%2?'B':'A'),j=set===0?i%3:Math.floor(i/2),object=set===0?(i<3?j:[1,0,2][j]):j;
   await rows.nth(i).locator('.recording-actions button').first().click();
   const spoken=await p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
   const end=style==='formal'?'です':'だ';
   const expected=set===0?['これ','それ','あれ'][j]+'は'+nouns[object]+end:speaker==='A'?['これ','それ','あれ'][j]+'は'+nouns[[1,2,0][j]]+(style==='formal'?'ですか':''):(style==='casual'?'ううん':'いいえ')+nouns[j]+end;
   check(spoken,expected,'Drill model by set, speaker, style and script');
   check(await p.locator('.p21-drill1 .p21-drill-picture').getAttribute('data-speaker'),speaker,'Drill speaker updates');
  }
 }

 // Set 2 accepts the requested short correction and explicit denial + correction.
 for(const style of ['formal','informal','casual']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  await p.locator('.p21-drill1 .p21-set-switcher button').nth(1).click();
  const results=await p.evaluate(style=>{
   isAutoPlay=false;
   const prefix=style==='casual'?'ううん':'いいえ',end=style==='formal'?'です':style==='casual'?'だよ':'だ';
   return ['ノート','鉛筆','Tシャツ'].flatMap((correct,i)=>{
    const pro=['それ','これ','あれ'][i],wrong=['鉛筆','Tシャツ','ノート'][i],negative=style==='formal'?'じゃないです':style==='casual'?'じゃないよ':'じゃない';
    const short=`${prefix}、${pro}は${correct}${end}。`;
    const samples=[
     [short,true],
     [`${prefix}、${correct}${end}。`,true],
     [`${prefix}、${pro}は${wrong}${negative}。${correct}${end}。`,true],
     [`${prefix}、${wrong}${negative}。${correct}${end}。`,true],
     [`${prefix}、${wrong}${negative}。${pro}は${correct}${end}。`,true],
     [`${prefix}、${['これ','それ','これ'][i]}は${correct}${end}。`,false],
     [`${prefix}、${pro}は${wrong}${end}。`,false],
     [`${prefix}、${pro}は${wrong}${negative}。`,false],
     [`${prefix}、${pro}は${correct}${end}。それはペンです。`,false]
    ];
    const key=`p21_d1_s1_r_${i}`,v=practice2State.views[key];
    return samples.map(([text,want])=>{processResult(text,short,()=>short,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return [practice2State.savedResults[key].isCorrect,want,text]});
   });
  },style);
  for(const [actual,want,text] of results)check(actual,want,style+' response: '+text);
 }

 await p.locator('#speechStyleControl [data-value="formal"]').click();
 const expanded=await p.evaluate(()=>{
  isAutoPlay=false;
  return [
   ['p21_d2_s0_r_0','おにぎりです','おにぎりです',true],
   ['p21_d2_s0_r_0','それはおにぎりです','おにぎりです',true],
   ['p21_d2_s0_r_0','これはおにぎりです','おにぎりです',false],
   ['p21_d2_s0_r_0','それはサンドイッチです','おにぎりです',false],
   ['p21_d3_s0_r_0','それです','それです',true],
   ['p21_d3_s0_r_0','それは私のスマホです','それです',true],
   ['p21_d3_s0_r_0','私のスマホはそれです','それです',true],
   ['p21_d3_s0_r_0','スマホはそれです','それです',true],
   ['p21_d3_s0_r_0','それは私のです','それです',true],
   ['p21_d3_s0_r_0','これは私のスマホです','それです',false],
   ['p21_d3_s0_r_0','それはあなたのスマホです','それです',false],
   ['p21_d3_s0_r_0','スマホです','それです',false]
  ].map(([key,text,model,want])=>{
   const v=practice2State.views[key];
   processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);
   return [practice2State.savedResults[key].isCorrect,want,text];
  });
 });
 for(const [actual,want,text] of expanded)check(actual,want,'expanded dialogue: '+text);
 // Naming questions and color-selected answers use the same perspective rules.
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  for(const set of [0,1]) {
   await p.locator('#drill2Container .p21-set-switcher button').nth(set).click();
   const nouns=set===0?['おにぎり','おべんとう','さんどいっち']:['りんご','やさい','にく'];
   for(let i=0;i<6;i++) {
    await p.locator('#drill2Container tr').nth(i).locator('.recording-actions button').first().click();
    const text=await p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
    const j=Math.floor(i/2),expected=i%2?nouns[j]+(style==='formal'?'です':'だ'):['これ','それ','あれ'][j]+'は'+(style==='formal'?'なんですか':'なに');
    check(text,expected,'D2 naming model');
   }
  }
  for(const set of [0,1,2]) {
   await p.locator('#drill3Container .p21-set-switcher button').nth(set).click();
   check(await p.locator('#drill3Container .p21-drill-item').evaluateAll(es=>new Set(es.map(e=>e.dataset.kind)).size),1,'D3 same noun, three colors');
   for(let i=0;i<4;i++) {
    await p.locator('#drill3Container tr').nth(i).locator('.recording-actions button').first().click();
    const text=await p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
    const target=[[0,1],[1,2],[2,0]][set][Math.floor(i/2)],noun=['すまほ','じしょ','さいふ'][set];
    const expected=i%2?(Math.floor(i/2)===0?['それ','これ','あれ']:['これ','それ','あれ'])[target]+(style==='formal'?'です':'だ'):'あなたの'+noun+'はどれ'+(style==='formal'?'ですか':'');
    check(text,expected,'D3 color cue, B perspective');
   }
  }
 }

 check(await p.locator('#drill2Container .p21-drill-item').evaluateAll(es=>es.every(e=>getComputedStyle(e).filter==='grayscale(1)')),true,'D2 has no color differentiation');
 check(await p.locator('#drill3Container .drill-number-cell').allTextContents(),['1','','2',''],'D3 numbering restarts per noun');
 check(await p.locator('#drill3Container tr').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),['A','B','B','A'],'D3 question roles alternate');
 const guide=await p.locator('.p21-which-guide').boundingBox(),scene=await p.locator('#drill3Container .p21-photo-stage').boundingBox();
 check(guide.x>=scene.x&&guide.y>=scene.y&&guide.x+guide.width<=scene.x+scene.width,true,'do guide inside picture');
 await p.locator('#drill3Container .p21-set-switcher').scrollIntoViewIfNeeded();
 const anchorY=await p.locator('#drill3Container .p21-set-switcher button').first().evaluate(e=>e.getBoundingClientRect().top),url=p.url();
 await p.locator('#drill3Container .p21-set-switcher button').first().click();
 check(Math.abs(await p.locator('#drill3Container .p21-set-switcher button').first().evaluate(e=>e.getBoundingClientRect().top)-anchorY)<3,true,'D3 switching keeps its viewport position');
 check(p.url(),url,'D3 switch does not navigate');
 await p.locator('#drill3Container .p21-drill-item').first().click();check(p.url(),url,'D3 image does not navigate');
 check(await p.locator('.p21-which-guide strong').textContent(),'ど：Asking about the unknown','approved do explanation');
 check(await p.locator('.p21-drill1 .p21-response-lead').count(),3,'No lead after stop');
 check(await p.locator('.p21-drill1 .p21-dialogue-practice .drill-cue-cell').nth(1).textContent().then(s=>!s.includes('＿')),true,'D1 B cue uses no blanks');
 await p.locator('#hintModeControl [data-value="hover"]').click();
 check(await p.locator('.p21-distance-board .p21-image-hint,.p21-drill1 .p21-image-hint').count(),6,'all Example and Drill items have hints');
 check(await p.locator('.p21-model-line .tooltip-wrap').count(),6,'all Example noun occurrences have hints');
 for(const width of [600,1440]) {
  await p.setViewportSize({width,height:1100});
  for(const selector of ['.p21-example-item-hint[data-kind="book"]','.p21-example-item-hint[data-kind="clock"]','.p21-model-line .tooltip-wrap','.p21-drill-item[data-kind="tshirt"]','#drill2Container .drill-cue-cell .tooltip-wrap','#drill3Container .drill-cue-cell .tooltip-wrap']) {
   const anchor=p.locator(selector).first();await anchor.hover();
   const tip=(selector.includes('model-line')||selector.includes('drill-cue-cell'))?anchor.locator('.tooltip-tip'):p.locator('.p21-image-tip-host .tooltip-tip').last();
   check(await tip.isVisible(),true,'visible vocabulary hint '+selector);
   const box=await tip.boundingBox();check(box.x>=10&&box.y>=10&&box.x+box.width<=width-10,true,'hint within viewport');
   check(await tip.evaluate(e=>getComputedStyle(e).fontSize),'20px','vocabulary font 20px');
  }
 }
 await p.locator('#hintModeControl [data-value="off"]').click();
 check(await p.locator('.p21-image-hint,.p21-image-tip-host,.p21-model-line .tooltip-wrap').count(),0,'OFF removes image and model hints');
 await p.locator('#speechStyleControl [data-value="formal"]').click();
 await p.locator('.p21-drill1 .p21-set-switcher button').first().click();
 await p.evaluate(()=>{const mode=document.getElementById('toggleRecordMode');if(mode.checked)mode.click();t.speaking=true;});
 await p.locator('.p21-drill1 tr').first().locator('.recording-actions button').nth(1).click();
 await p.waitForTimeout(400);
 check(await p.locator('.p21-drill1 .p21-set-switcher button').first().isDisabled(),true,'set switch locked during recording');
 await p.evaluate(()=>{const r=t.recognitions.at(-1),result=[{transcript:'これはペンです'}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();});
 await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
 check(await p.evaluate(()=>practice2State.savedResults.p21_d1_s0_A_0?.isCorrect),true,'recording extracted and matched');
 check(await p.locator('.p21-drill1 tr').first().textContent().then(t=>t.includes('✅')),true,'transcript visible in row');
 await p.locator('.p21-drill1 .p21-set-switcher button').nth(1).click();
 check(await p.locator('.p21-drill1 tr').first().textContent().then(t=>t.includes('✅')),false,'sets keep distinct results');
 await p.locator('.p21-drill1 .p21-set-switcher button').first().click();
 check(await p.locator('.p21-drill1 tr').first().textContent().then(t=>t.includes('✅')),true,'result restored on return');
 await p.evaluate(()=>{isAutoPlay=false;const key='p21_d1_s0_B_0',v=practice2State.views[key];processResult('それは新聞です','これは、新聞です。',()=> 'これは、新聞です。',v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);});
 check(await p.evaluate(()=>practice2State.savedResults.p21_d1_s0_B_0.isCorrect),false,'wrong demonstrative rejected');

 async function recordLater(container,row,text) {
  await p.locator(container+' tr').nth(row).locator('.recording-actions button').nth(1).click();
  await p.waitForTimeout(400);
  check(await p.locator('#drill2Container .p21-set-switcher button').first().isDisabled(),true,'recording locks later set switches');
  await p.evaluate(text=>{const r=t.recognitions.at(-1),result=[{transcript:text}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},text);
  await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
 }
 await p.locator('#drill2Container .p21-set-switcher button').first().click();
 await recordLater('#drill2Container',1,'それはおにぎりです');
 check(await p.evaluate(()=>practice2State.savedResults.p21_d2_s0_r_0?.isCorrect),true,'D2 recording matches model');
 await p.locator('#drill2Container .p21-set-switcher button').nth(1).click();
 check(await p.locator('#drill2Container tr').nth(1).textContent().then(t=>t.includes('✅')),false,'D2 sets separated');
 await p.locator('#drill2Container .p21-set-switcher button').first().click();
 check(await p.locator('#drill2Container tr').nth(1).textContent().then(t=>t.includes('✅')),true,'D2 result restored');
 await p.locator('#drill3Container .p21-set-switcher button').first().click();
 await recordLater('#drill3Container',1,'それです');
 check(await p.evaluate(()=>practice2State.savedResults.p21_d3_s0_r_0?.isCorrect),true,'D3 color-selected recording matches B perspective');
 const invalid=await p.evaluate(()=>{
  const key='p21_d3_s0_r_1',v=practice2State.views[key];
  return ['blueです','あれです'].map(text=>{processResult(text,'それです。',()=> 'それです。',v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return practice2State.savedResults[key].isCorrect;});
 });check(invalid,[false,false],'D3 rejects color answers and wrong pronouns');
 for(const width of [600,900,1440,1920]) {
  await p.setViewportSize({width,height:1100});
  check(await p.locator('.p21-drill1,.p21-drill-picture,.p21-speaker-practice').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'Drill fits viewport');
  const ratio=await p.locator('.p21-drill1 .p21-drill-picture').evaluate(e=>e.clientWidth/e.parentElement.clientWidth);
  check(Math.abs(ratio-(width>900?.6:1))<.03,true,'60 percent Drill scene');
 }
 if(process.env.P21_SCREENSHOT_DIR){fs.mkdirSync(process.env.P21_SCREENSHOT_DIR,{recursive:true});for(const width of [600,900,1440,1920]){await p.setViewportSize({width,height:1100});await p.locator('.example-box').screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,`practice21-${width}.png`)});await p.locator('.p21-drill1').screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,`drill21-${width}.png`)});}}
 if(process.env.P21_SCREENSHOT_DIR){await p.setViewportSize({width:1440,height:1100});await p.locator('.p21-drill1 .p21-set-switcher button').nth(1).click();await p.locator('.p21-drill1').screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,'drill21-set2.png')});}
 if(process.env.P21_SCREENSHOT_DIR){for(const width of [600,1440]){await p.setViewportSize({width,height:1100});for(const id of ['drill2Container','drill3Container'])await p.locator('#'+id).screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,`${id}-${width}.png`)});}}
 check(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 2.1 Ex1 and Drills 1-3',count);
})().catch(e=>{console.error(e);process.exit(1)});
