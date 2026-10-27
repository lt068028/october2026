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
 let count=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 for(const number of ['2.2','2.3']){
  const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(mock);
  await p.route('http://next.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'});});
  await p.goto(`http://next.test/practice${number}.html`);
  check(await p.locator('#scriptModeControl [aria-pressed="true"]').getAttribute('data-value'),'hiragana',number+' hiragana default');
  check(await p.locator('.p21-model-line').count(),6,number+' six example models');
  if(number==='2.2'){
   check(await p.locator('.p2x-example .p2x-photo').getAttribute('src'),'assets/practice22-hats.png','hat photo');
   check(await p.locator('.p2x-example .p2x-price').allTextContents(),['¥1,000','¥3,000','¥4,000'],'hat prices match object order');
   check(await p.locator('.p2x-example .p2x-stage > .p2x-speaker-guide').count(),1,'Who guide inside image');
   check(await p.locator('.p2x-example .p2x-stage > .p2x-audio').count(),3,'three audio pairs inside image');
   check(await p.locator('.p2x-speaker-models .p21-model-group').count(),2,'models grouped by speaker');
   check(await p.locator('.p2x-example .p2x-context-note').count(),0,'removed explanatory paragraph');
   await p.locator('.p2x-example .p21-item-audio button').first().click();
   check(await p.locator('.p2x-example .p2x-speaker-guide').evaluate(e=>e.getAnimations()[0].effect.getTiming().iterations),Infinity,'guide continues during playback');
   await p.evaluate(()=>t.spoken.at(-1).onend?.());
   check(await p.locator('.p2x-example .p2x-speaker-guide').evaluate(e=>e.getAnimations().length),0,'guide stops with playback');
  }
  for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']){
   await p.locator(`#speechStyleControl [data-value="${style}"]`).click();await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
   const end=style==='formal'?'です':style==='casual'?'だよ':'だ';
   const compare=async(locator,expected,label)=>{
    await locator.click();const out=await p.evaluate(expected=>{const u=t.spoken.at(-1);const out=[practice2Normalize(u.text),practice2Normalize(expected)];u.onend?.();return out;},expected);check(out[0],out[1],number+' '+style+'/'+script+' '+label);
   };
   for(const speaker of ['A','B'])for(let i=0;i<3;i++){
    const zone=['A','B','far'][i],loc=i===2?'あそこ':speaker===zone?'ここ':'そこ',adj=i===2?'あの':speaker===zone?'この':'その';
    const model=number==='2.2'?adj+'帽子は'+['千円','三千円','四千円'][i]+end:loc+'は'+['銀行','喫茶店','図書館'][i]+end;
    await compare(p.locator(`.p2x-example .p21-item-audio [data-speaker="${speaker}"][data-zone="${zone}"]`),model,'Example '+speaker+zone);
   }
   for(const set of [0,1]){
    await p.locator('#drill2Container .p21-set-switcher button').nth(set).click();
    const asker=number==='2.2'&&set===1?'B':'A';
    for(let i=0;i<3;i++){
     const adj=i===2?'あの':asker===['A','B','far'][i]?'この':'その';
     const q=number==='2.2'?adj+'人は誰'+(style==='formal'?'ですか':''):['スマホ','財布','辞書','ノート','辞書','財布'][set*3+i]+'はどこ'+(style==='formal'?'ですか':'');
     const r=number==='2.2'?['メアリー','たけし','ロバート'][i]+'さん'+end:['そこ','ここ','あそこ'][i]+end;
     await compare(p.locator('#drill2Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),q,'D2 Q');
     await compare(p.locator('#drill2Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),r,'D2 response');
    }
   }
   for(const set of [0,1,2]){
    await p.locator('#drill3Container .p21-set-switcher button').nth(set).click();
    const noun=['スマホ','辞書','財布'][set],targets=[[0,1],[1,2],[2,0]][set];
    for(let i=0;i<2;i++){
     const answerer=i===0?'B':'A',zone=['A','B','far'][targets[i]],loc=zone==='far'?'あそこ':zone===answerer?'ここ':'そこ',adj=zone==='far'?'あの':zone===answerer?'この':'その';
     const q=(number==='2.2'?'あなたのはどの'+noun:'あなたの'+noun+'はどこ')+(style==='formal'?'ですか':'');
     await compare(p.locator('#drill3Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),q,'D3 Q');
     await compare(p.locator('#drill3Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),(number==='2.2'?adj+noun:loc)+end,'D3 response');
    }
   }
  }
  await p.locator('#speechStyleControl [data-value="formal"]').click();
  await p.locator('#drill2Container .p21-set-switcher button').first().click();await p.locator('#drill3Container .p21-set-switcher button').first().click();
  const judgments=await p.evaluate(number=>{
   isAutoPlay=false;const prefix=number==='2.2'?'p22':'p23';
   const samples=number==='2.2'?[
    [`${prefix}_d1_s0_A_0`,'このスマホは3万円です','このスマホはさんまんえんです',true],
    [`${prefix}_d1_s0_A_0`,'このスマホは30000円です','このスマホはさんまんえんです',true],
    [`${prefix}_d1_s0_A_0`,'このスマホは3000円です','このスマホはさんまんえんです',false],
    [`${prefix}_d2_s0_r_0`,'メアリーさんです','メアリーさんです',true],
    [`${prefix}_d2_s0_r_0`,'メアリーです','メアリーさんです',true],
    [`${prefix}_d3_s0_q_0`,'あなたのスマホはどのスマホですか','あなたのはどのスマホですか',true],
    [`${prefix}_d3_s0_q_0`,'あなたの辞書はどのスマホですか','あなたのはどのスマホですか',false],
    [`${prefix}_d2_s0_r_0`,'その人はメアリーさんです','メアリーさんです',true],
    [`${prefix}_d2_s0_r_0`,'この人はメアリーさんです','メアリーさんです',false],
    [`${prefix}_d3_s0_r_0`,'そのスマホです','そのスマホです',true],
    [`${prefix}_d3_s0_r_0`,'私のスマホはそのスマホです','そのスマホです',true],
    [`${prefix}_d3_s0_r_0`,'そのです','そのスマホです',false],
    [`${prefix}_d3_s0_r_0`,'このスマホです','そのスマホです',false]
   ]:[
    [`${prefix}_d2_s0_r_0`,'そこです','そこです',true],
    [`${prefix}_d2_s0_r_0`,'スマホはそこです','そこです',true],
    [`${prefix}_d2_s0_r_0`,'ここです','そこです',false],
    [`${prefix}_d2_s0_r_0`,'財布はそこです','そこです',false],
    [`${prefix}_d3_s0_r_0`,'私のスマホはそこです','そこです',true],
    [`${prefix}_d3_s0_r_0`,'私のスマホはあそこです','そこです',false]
   ];
   return samples.map(([key,text,model,want])=>{const v=practice2State.views[key];processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return [practice2State.savedResults[key].isCorrect,want,text];});
  },number);
  for(const [actual,want,text]of judgments)check(actual,want,number+' answer '+text);
  // Exercise the microphone path, set locking and result restoration with real callbacks.
  await p.locator('#drill1Container .p21-set-switcher button').first().click();
  await p.evaluate(()=>{isAutoPlay=false;const toggle=document.getElementById('toggleRecordMode');if(toggle.checked)toggle.click();t.speaking=true;});
  const first=p.locator('#drill1Container .recording-table tr').first();await first.locator('.recording-actions button').first().click();
  const transcript=await p.evaluate(()=>{const u=t.spoken.at(-1);u.onend?.();return u.text;});
  await first.locator('.recording-actions button').nth(1).click();await p.waitForTimeout(400);
  check(await p.locator('#drill1Container .p21-set-switcher button').first().isDisabled(),true,number+' sets locked in recording');
  await p.evaluate(text=>{const r=t.recognitions.at(-1),result=[{transcript:text}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},transcript);
  await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
  check(await first.textContent().then(s=>s.includes('✅')),true,number+' actual record and recognition');
  await p.locator('#drill1Container .p21-set-switcher button').nth(1).click();check(await p.locator('#drill1Container .recording-table tr').first().textContent().then(s=>s.includes('✅')),false,number+' distinct set results');
  await p.locator('#drill1Container .p21-set-switcher button').first().click();check(await p.locator('#drill1Container .recording-table tr').first().textContent().then(s=>s.includes('✅')),true,number+' result restored');
  for(const width of [600,900,1440])for(const theme of ['light','dark'])for(const hint of ['off','hover','paren']){
   await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});await p.locator(`#hintModeControl [data-value="${hint}"]`).click();
   const overflow=await p.locator('.example-box,.drill-row,.p2x-picture,.settings-row').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className));check(overflow,[],number+' layout '+width+theme+hint);
   check(await p.locator('.p2x-distance-label').evaluateAll(es=>es.every(el=>{
    const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();
    return a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom+1;
   })),true,number+' distance captions stay visible '+width+theme+hint);
   if(number==='2.2')check(await p.locator('.p2x-hat-picture').evaluate(e=>{
    const buttons=[...e.querySelectorAll('.p2x-audio button')].map(b=>b.getBoundingClientRect()),stage=e.querySelector('.p2x-stage').getBoundingClientRect();
    return buttons.every((a,i)=>a.left>=stage.left&&a.right<=stage.right&&a.top>=stage.top&&a.bottom<=stage.bottom&&buttons.every((b,j)=>i===j||Math.min(a.right,b.right)<=Math.max(a.left,b.left)||Math.min(a.bottom,b.bottom)<=Math.max(a.top,b.top)));
   }),true,'image buttons fit without overlap '+width+theme+hint);
   if(process.env.NEXT_SCREENSHOT_DIR&&width===1440&&theme==='light'&&hint==='hover'){
    fs.mkdirSync(process.env.NEXT_SCREENSHOT_DIR,{recursive:true});await p.locator('.p2x-example').screenshot({path:path.join(process.env.NEXT_SCREENSHOT_DIR,`practice${number}-example.png`)});await p.locator('#drill2Container .p2x-picture').screenshot({path:path.join(process.env.NEXT_SCREENSHOT_DIR,`practice${number}-drill2.png`)});
   }
  }
  await p.locator('#hintModeControl [data-value="hover"]').click();
  for(const selector of ['.p2x-example .p21-image-hint','#drill2Container .p21-image-hint']) {
   const target=p.locator(selector).first();await target.scrollIntoViewIfNeeded();await target.focus();
   const tip=p.locator('.p21-image-tip-host .tooltip-tip').last();
   check(await tip.evaluate(el=>{const r=el.getBoundingClientRect();return getComputedStyle(el).fontSize==='20px'&&r.left>=11&&r.right<=innerWidth-11&&r.top>=11&&r.bottom<=innerHeight-11;}),true,number+' picture vocabulary hint fits viewport');
   await target.evaluate(el=>el.blur());
  }
  await p.locator('#hintModeControl [data-value="off"]').click();
  check(await p.locator('.p21-image-hint,.p21-image-tip-host').count(),0,number+' OFF removes picture hints');
  check(errors,[],number+' browser errors');await p.close();
 }
 await browser.close();console.log('PASS new Lesson 2 pages',count);
})().catch(e=>{console.error(e);process.exit(1)});
