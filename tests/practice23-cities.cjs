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
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await browser.newPage();await p.addInitScript(mock);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('http://cities.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':'text/html'});});
 await p.goto('http://cities.test/practice2.3.html');let count=0;const check=(a,b,msg)=>{assert.deepEqual(a,b,msg);count++};
 check(await p.locator('.example-box').count(),1,'one Example introduces both drills');
 check(await p.locator('[data-set-state="cityDrillSet"] button').allTextContents(),['Country','Time','Cities'],'D2 category names omit Set');
 check(await p.locator('.p2x-example .p23-in-scene-audio button').count(),0,'E1 model controls are beside the cues');
 check(await p.locator('.p23-speaking-models .grammar-highlight').allTextContents(),['ここ','どこ','ここ','どこ','あそこ'],'E1 highlights place demonstratives and questions only');
 const visibleTexts=async(selector)=>p.locator(selector).evaluateAll(es=>es.map(e=>{const copy=e.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return copy.textContent.replace(/\s+/g,'');}));
 check(await visibleTexts('.p23-model-intro'),['わたしは、にほんです。','','','','Cさんは、アメリカです。',''],'E1 Japan and C country text stay as standalone introductions');
 check(await visibleTexts('.p23-conversation-models .p23-example-cue'),['ここ／あさ','Bさん／どこ','ここ／よる','Cさん／どこ','あそこ／ゆうがた'],'E1 cue sequence');
 check(await visibleTexts('.p23-model-answer > span:first-child'),['ここは、あさです。','Bさんは、どこですか。','ここは、よるです。','Cさんは、どこですか。','あそこは、ゆうがたです。'],'E1 primary models');
 check(await p.locator('.p23-model-speaker').allTextContents(),['A:','A:','B:','A:','B:',''],'model row roles');
 check(await p.locator('.p23-example-audio button').evaluateAll(es=>es.map(e=>e.dataset.speaker)),['A','A','B','A','B'],'five model clips follow conversation roles');
 check(await p.locator('.p23-unknown-guide .p21-question-sound').textContent(),'ど','unknown-place concept is in E1');
 check(await p.locator('[data-set-state="whereDrillSet"] button').allTextContents(),['People','Item'],'D1 has person and item tasks');
 check(await p.locator('#drill1Container .recording-table tr').count(),6,'D1 starts with three where conversations');
 check(await p.locator('#drill2Container .recording-table tr').count(),3,'former D1 is now D2');
 check(await p.locator('#drill3Container').isHidden(),true,'no duplicate third drill');
 check(await p.locator('.p23-city-photo').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),true,'all scenes load');
 check(await p.locator('.p23-practice-picture .p2x-distance-label').count(),0,'Drills omit concept captions');
 check(await p.locator('.p23-call-example .p23-city-time').count(),0,'E1 uses the scene to show time of day');
 check(await p.locator('.p23-practice-picture .p23-city-region').evaluateAll(es=>es.every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(e).borderTopColor==='rgba(0, 0, 0, 0)')),true,'Drills omit concept colors and frames');
 const compare=async(button,text)=>{await button.click();check(await p.evaluate(()=>t.spoken.at(-1).text),text,'TTS model');await p.evaluate(()=>t.spoken.at(-1).onend?.());};
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']){
  await p.locator('#speechStyleControl [data-value="'+style+'"]').click();await p.locator('#scriptModeControl [data-value="'+script+'"]').click();const end={formal:'です。',informal:'だ。',casual:'だよ。'}[style],qend=style==='formal'?'ですか？':'？';
  const exModels=['ここは、朝'+end,'Bさんは、どこ'+qend,'ここは、夜'+end,'Cさんは、どこ'+qend,'あそこは、夕方'+end];
  for(let i=0;i<5;i++){
   await compare(p.locator('.p2x-example .p23-example-audio button').nth(i),exModels[i]);
   check(await p.locator('.p23-call-example').getAttribute('data-speaker'),['A','A','B','A','B'][i],'picture switches to the current speaker');
  }
  for(const set of [0,1,2]){
   await p.locator('[data-set-state="cityDrillSet"] button').nth(set).click();
   check(await p.locator('#drill2Container .p23-city-time:not(.p23-city-name)').allTextContents(),set===1?['6:00','22:00','13:00']:[],'only Time shows simultaneous standard-time clocks');
   check(await p.locator('#drill2Container .p23-city-name').allTextContents(),set===2?[script==='hiragana'?'おおさか':'大阪','パリ','ロサンゼルス']:[],'only Cities shows city names on the images');
   const hintMeanings=set===0?['Japan','France','United States']:set===1?['6 a.m.; 6:00 (あさろくじ)','10 p.m.; 22:00 (よるじゅうじ)','1 p.m.; 13:00 (ごごいちじ)']:['Osaka','Paris','Los Angeles'];
   check(await p.locator('#drill2Container > .p23-city-picture .p23-city-hint').evaluateAll((es,words)=>es.map((e,i)=>e.getAttribute('aria-label').includes(words[i])),hintMeanings),[true,true,true],'image hints match the selected category');
   const firstHint=p.locator('#drill2Container > .p23-city-picture .p23-city-hint').first();await firstHint.focus();
   check((await p.locator('#'+await firstHint.getAttribute('aria-describedby')).textContent()).includes(hintMeanings[0]),true,'the visible hover tooltip follows the category');
   check(await p.locator('#drill2Container .recording-table tr').evaluateAll(es=>es.every(e=>e.dataset.drillSpeaker==='A')),true,'all D2 roles are A');
   for(let i=0;i<3;i++){
    const loc=['ここ','そこ','あそこ'][i],text=set===0?loc+'は、'+['日本','フランス','アメリカ'][i]+end:set===1?loc+'は、'+['朝六時','夜十時','午後一時'][i]+end:loc+'は、'+['大阪','パリ','ロサンゼルス'][i]+end;
    await compare(p.locator('#drill2Container .recording-table tr').nth(i).locator('.recording-actions button').first(),text);
   }
  }
  for(const set of [0,1]){
   await p.locator('[data-set-state="whereDrillSet"] button').nth(set).click();
   const nouns=set===0?['あなた','あなた','Cさん']:['カバン','本','ノート','ペン'];
   const answers=set===0?['喫茶店','銀行','図書館']:['そこ','ここ','あそこ','ここ'];
   const speakers=set===0?['A','B','B','A','A','B']:Array(4).fill(['A','B']).flat();
   check(await p.locator('#drill1Container .recording-table tr').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),speakers,'C remains a topic, never a speaking role');
   check(await p.locator('#drill1Container .p23-where-item').count(),set===0?0:4,'item sets show four framed objects');
   for(let i=0;i<nouns.length;i++){
    await compare(p.locator('#drill1Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),nouns[i]+'は、どこ'+qend);
    await compare(p.locator('#drill1Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),answers[i]+end);
    if(set)check(await p.locator('.p23-where-item.is-target').getAttribute('data-kind'),['bag','book','notebook','pen'][i],'listen highlights the matching object');
   }
  }
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();
 async function judge(samples){
  const results=await p.evaluate(samples=>{isAutoPlay=false;return samples.map(([key,text,model,want])=>{const v=practice2State.views[key];processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return[practice2State.savedResults[key].isCorrect,want,text];});},samples);
  for(const [actual,want,text]of results)check(actual,want,text);
 }
 await p.locator('[data-set-state="whereDrillSet"] button').first().click();
 await judge([['p23_where_d1_s0_0_r','カフェです','喫茶店です',true],['p23_where_d1_s0_0_r','喫茶店です','喫茶店です',true],['p23_where_d1_s0_0_r','ここは喫茶店です','喫茶店です',true],['p23_where_d1_s0_0_r','私は喫茶店です','喫茶店です',true],['p23_where_d1_s0_0_r','銀行です','喫茶店です',false],['p23_where_d1_s0_2_r','Cさんは図書館です','図書館です',true],['p23_where_d1_s0_2_r','あそこは図書館です','図書館です',true],['p23_where_d1_s0_2_r','ここは図書館です','図書館です',false]]);
 await p.locator('[data-set-state="whereDrillSet"] button').nth(1).click();
 await judge([['p23_where_d1_s1_0_r','そこです','そこです',true],['p23_where_d1_s1_0_r','カバンはそこです','そこです',true],['p23_where_d1_s1_0_r','カバンはここです','そこです',false],['p23_where_d1_s1_1_r','本はここです','ここです',true],['p23_where_d1_s1_1_r','本はそこです','ここです',false],['p23_where_d1_s1_2_r','ノートはあそこです','あそこです',true],['p23_where_d1_s1_2_r','ここです','あそこです',false]]);
 await p.locator('[data-set-state="whereDrillSet"] button').nth(1).click();
 await p.evaluate(()=>{isAutoPlay=false;const toggle=document.getElementById('toggleRecordMode');if(toggle.checked)toggle.click();t.speaking=true;});
 const first=p.locator('#drill1Container .recording-table tr').nth(1);await first.locator('.recording-actions button').first().click();const transcript=await p.evaluate(()=>{const u=t.spoken.at(-1);u.onend?.();return u.text;});await first.locator('.recording-actions button').nth(1).click();await p.waitForTimeout(400);
 check(await p.locator('[data-set-state] button').evaluateAll(es=>es.every(e=>e.disabled)),true,'recording locks task switching');
 await p.evaluate(text=>{const r=t.recognitions.at(-1),result=[{transcript:text}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},transcript);await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);check(await first.textContent().then(s=>s.includes('✅')),true,'where model and row recording share state');
 await p.locator('[data-set-state="whereDrillSet"] button').first().click();
 await p.locator('[data-set-state="whereDrillSet"] button').nth(1).click();
 check(await p.locator('#drill1Container .recording-table tr').nth(1).textContent().then(s=>s.includes('✅')),true,'D1 results survive switching');
 for(const width of [375,600,900,1440])for(const theme of ['light','dark'])for(const hint of ['off','hover','paren']){
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});await p.locator('#hintModeControl [data-value="'+hint+'"]').click();check(await p.locator('.example-box,.drill-row,.p2x-picture,.settings-row').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)),[],'layout '+width+theme+hint);
  check(await p.locator('.p23-city-picture').evaluateAll(es=>es.every(e=>{const r=e.querySelector('img').getBoundingClientRect();return [...e.querySelectorAll('.p21-area-sound')].every(c=>{const q=c.getBoundingClientRect();return q.top>=r.top&&q.bottom<=r.bottom&&q.left>=r.left&&q.right<=r.right})})),true,'distance sounds stay inside the photograph '+width+theme+hint);
  check(await p.locator('.p23-unknown-guide').evaluate(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-stage').getBoundingClientRect();return a.left>=r.left&&a.right<=r.left+r.width/3+1&&a.top>=r.top&&a.bottom<=r.bottom;}),true,'unknown guide stays in A picture '+width+theme+hint);
  check(await p.locator('.p23-conversation-models').evaluate(e=>{const intro=e.querySelector('.p23-model-intro').getBoundingClientRect(),cues=[...e.querySelectorAll('.p21-model-line > .p23-example-cue')].map(x=>x.getBoundingClientRect()),america=e.querySelectorAll('.p23-model-intro')[4].getBoundingClientRect();return intro.bottom<=cues[0].top+1&&america.bottom<=cues[4].top+1&&Math.abs(cues[0].left-cues[4].left)<1;}),true,'Japan introduction and final evening cue start on separate aligned lines');
  check(await p.locator('.p23-conversation-models').evaluate(e=>Math.abs(e.querySelector('.p21-model-line > .p23-example-cue').getBoundingClientRect().width-parseFloat(e.style.getPropertyValue('--p23-example-cue-width')))<1),true,'shared cue width follows content, without surplus space');
  check(await p.locator('.p23-conversation-models .p21-model-line > .p23-example-cue').evaluateAll(es=>es.every(e=>Math.abs(e.getBoundingClientRect().left-es[0].getBoundingClientRect().left)<1)),true,'primary cue starts align');
  check(await p.locator('#drill2Container .p23-city-name').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=r.left&&a.right<=r.right&&e.scrollWidth<=e.clientWidth+1;})),true,'city labels fit inside each image');
  check(await p.locator('.p23-where-item').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=r.left&&a.right<=r.right&&a.top>=r.top&&a.bottom<=r.bottom;})),true,'all framed objects stay inside their facility image');
  check(await p.locator('.p23-in-scene-audio button').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),b=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom})),true,'buttons inside each panel');
 }
 check(errors,[],'no browser errors');await browser.close();console.log('PASS city tasks',count);
})().catch(e=>{console.error(e);process.exit(1)});
