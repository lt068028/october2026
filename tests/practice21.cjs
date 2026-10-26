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
 check(await p.locator('.example-box').count(),1,'Ex1 only');check(await p.locator('.drill-row').count(),2,'A and B practice groups');
 check(await p.locator('.p21-item-audio button').count(),6,'six audio buttons near objects');
 check(await p.locator('.p21-photo').evaluateAll(es=>es.every(im=>im.complete&&im.naturalWidth>0)),true,'photo loaded');
 check(await p.locator('.p21-photo-context span').textContent(),'Who is speaking?','speaker guide');
 check(await p.locator('.p21-photo-foreground').count(),3,'only objects restored; hand masking removed');
 check(await p.locator('.p21-model-line').count(),6,'six models below diagram');
 check(await p.locator('.p21-model-group h3 .target-word').allTextContents(),['ほん','かばん','とけい'],'three distinct objects');
 check(await p.locator('.p21-distance-board .p21-distance-person').count(),2,'only two people');
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
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
 await p.evaluate(()=>t.spoken.at(-1).onend?.());
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

 check(await p.locator('.p21-drill1 .recording-table tr').count(),6,'three rows per speaker');
 check(await p.locator('.p21-drill1 .p21-reach,.p21-drill1 .p21-object-number,.p21-drill1 .p21-area-caption').count(),0,'no regions, object numbers or distance answers');
 check(await p.locator('.p21-drill1 .p21-drill-item').count(),3,'three independent item layers');
 check(await p.evaluate(()=>practice2Normalize('Tシャツ')===practice2Normalize('ティーシャツ')),true,'T-shirt recognition forms agree');
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji'])for(const set of [0,1]) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  await p.locator('.p21-set-switcher button').nth(set).click();
  const nouns=set===0?['ぺん','しんぶん','ぼうし']:['のーと','じしょ','てぃーしゃつ'];
  const rows=p.locator('.p21-drill1 tr');
  for(let i=0;i<6;i++) {
   const speaker=set===0?(i<3?'A':'B'):(i%2?'B':'A'),j=set===0?i%3:Math.floor(i/2),object=set===0?(i<3?j:[1,0,2][j]):j;
   await rows.nth(i).locator('.recording-actions button').first().click();
   const spoken=await p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
   const end=style==='formal'?'です':'だ';
   const expected=set===0?['これ','それ','あれ'][j]+'は'+nouns[object]+end:speaker==='A'?['これ','それ','あれ'][j]+'は'+nouns[[1,2,0][j]]+(style==='formal'?'ですか':''):(style==='casual'?'ううん':'いいえ')+['それ','これ','あれ'][j]+'は'+nouns[j]+end;
   check(spoken,expected,'Drill model by set, speaker, style and script');
   check(await p.locator('.p21-drill-picture').getAttribute('data-speaker'),speaker,'Drill speaker updates');
  }
 }

 // Set 2 accepts the requested short correction and explicit denial + correction.
 for(const style of ['formal','informal','casual']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();
  await p.locator('.p21-set-switcher button').nth(1).click();
  const results=await p.evaluate(style=>{
   isAutoPlay=false;
   const prefix=style==='casual'?'ううん':'いいえ',end=style==='formal'?'です':style==='casual'?'だよ':'だ';
   return ['ノート','辞書','Tシャツ'].flatMap((correct,i)=>{
    const pro=['それ','これ','あれ'][i],wrong=['辞書','Tシャツ','ノート'][i],negative=style==='formal'?'じゃないです':style==='casual'?'じゃないよ':'じゃない';
    const short=`${prefix}、${pro}は${correct}${end}。`;
    const samples=[
     [short,true],
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
 await p.locator('#hintModeControl [data-value="hover"]').click();
 check(await p.locator('.p21-image-hint').count(),6,'all Example and Drill items have hints');
 check(await p.locator('.p21-model-line .tooltip-wrap').count(),6,'all Example noun occurrences have hints');
 for(const width of [600,1440]) {
  await p.setViewportSize({width,height:1100});
  for(const selector of ['.p21-example-item-hint[data-kind="book"]','.p21-example-item-hint[data-kind="clock"]','.p21-model-line .tooltip-wrap','.p21-drill-item[data-kind="tshirt"]']) {
   const anchor=p.locator(selector).first();await anchor.hover();
   const tip=selector.includes('model-line')?anchor.locator('.tooltip-tip'):p.locator('.p21-image-tip-host .tooltip-tip').last();
   check(await tip.isVisible(),true,'visible vocabulary hint '+selector);
   const box=await tip.boundingBox();check(box.x>=10&&box.y>=10&&box.x+box.width<=width-10,true,'hint within viewport');
   check(await tip.evaluate(e=>getComputedStyle(e).fontSize),'20px','vocabulary font 20px');
  }
 }
 await p.locator('#hintModeControl [data-value="off"]').click();
 check(await p.locator('.p21-image-hint,.p21-image-tip-host,.p21-model-line .tooltip-wrap').count(),0,'OFF removes image and model hints');
 await p.locator('#speechStyleControl [data-value="formal"]').click();
 await p.locator('.p21-set-switcher button').first().click();
 await p.evaluate(()=>{const mode=document.getElementById('toggleRecordMode');if(mode.checked)mode.click();t.speaking=true;});
 await p.locator('.p21-drill1 tr').first().locator('.recording-actions button').nth(1).click();
 await p.waitForTimeout(400);
 check(await p.locator('.p21-set-switcher button').first().isDisabled(),true,'set switch locked during recording');
 await p.evaluate(()=>{const r=t.recognitions.at(-1),result=[{transcript:'これはペンです'}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();});
 await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
 check(await p.evaluate(()=>practice2State.savedResults.p21_d1_s0_A_0?.isCorrect),true,'recording extracted and matched');
 check(await p.locator('.p21-drill1 tr').first().textContent().then(t=>t.includes('✅')),true,'transcript visible in row');
 await p.locator('.p21-set-switcher button').nth(1).click();
 check(await p.locator('.p21-drill1 tr').first().textContent().then(t=>t.includes('✅')),false,'sets keep distinct results');
 await p.locator('.p21-set-switcher button').first().click();
 check(await p.locator('.p21-drill1 tr').first().textContent().then(t=>t.includes('✅')),true,'result restored on return');
 await p.evaluate(()=>{isAutoPlay=false;const key='p21_d1_s0_B_0',v=practice2State.views[key];processResult('それは新聞です','これは、新聞です。',()=> 'これは、新聞です。',v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);});
 check(await p.evaluate(()=>practice2State.savedResults.p21_d1_s0_B_0.isCorrect),false,'wrong demonstrative rejected');
 for(const width of [600,900,1440,1920]) {
  await p.setViewportSize({width,height:1100});
  check(await p.locator('.p21-drill1,.p21-drill-picture,.p21-speaker-practice').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'Drill fits viewport');
  const ratio=await p.locator('.p21-drill-picture').evaluate(e=>e.clientWidth/e.parentElement.clientWidth);
  check(Math.abs(ratio-(width>900?.6:1))<.03,true,'60 percent Drill scene');
 }
 if(process.env.P21_SCREENSHOT_DIR){fs.mkdirSync(process.env.P21_SCREENSHOT_DIR,{recursive:true});for(const width of [600,900,1440,1920]){await p.setViewportSize({width,height:1100});await p.locator('.example-box').screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,`practice21-${width}.png`)});await p.locator('.p21-drill1').screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,`drill21-${width}.png`)});}}
 if(process.env.P21_SCREENSHOT_DIR){await p.setViewportSize({width:1440,height:1100});await p.locator('.p21-set-switcher button').nth(1).click();await p.locator('.p21-drill1').screenshot({path:path.join(process.env.P21_SCREENSHOT_DIR,'drill21-set2.png')});}
 check(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 2.1 Ex1 and Drill 1',count);
})().catch(e=>{console.error(e);process.exit(1)});
