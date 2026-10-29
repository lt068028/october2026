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
 check(await p.locator('.example-box').count(),3,'three examples');
 check(await p.locator('[data-set-state="cityDrillSet"] button').allTextContents(),['Country','Time','Cities'],'D1 category names omit Set');
 check(await p.locator('.p2x-example .p23-in-scene-audio button').count(),0,'E1 model controls are beside the cues');
 check(await p.locator('.p23-speaking-models .grammar-highlight').allTextContents(),['ここ','どこ','ここ','どこ','あそこ'],'E1 highlights place demonstratives and questions only');
 check(await p.locator('.p23-speaking-models .p21-model-line > span:last-child').evaluateAll(es=>es.map(e=>{const copy=e.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return copy.textContent.replace(/\s+/g,'');})),['わたしは、にほんです。ここは、あさです。','Bさんは、どこですか。','わたしは、イギリスです。ここは、よるです。','Cさんは、どこですか。','Cさんは、アメリカです。あそこは、ゆうがたです。'],'E1 displays five conversation lines');
 check(await p.locator('.p23-model-speaker').allTextContents(),['A:','','B:','A:','B:'],'A question continues at the same text column');
 check(await p.locator('.p23-example-audio button').evaluateAll(es=>es.map(e=>e.dataset.speaker)),['A','A','B','A','B'],'model voices follow A/A/B/A/B');
 check(await p.locator('.p23-unknown-guide .p21-question-sound').textContent(),'ど','unknown-place concept is in E1');
 check(await p.locator('#drill1Container > .p2x-picture .p23-in-scene-audio button').count(),0,'D1 has no diagram controls');
 check(await p.locator('#drill1Container .recording-table .recording-actions button').count(),9,'D1 rows contain listen, record and stop');
 for(const id of [2,3])check(await p.locator('#drill'+id+'Container .recording-table tr').count(),6,'three conversations');
 check(await p.locator('.p23-city-photo').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),true,'all scenes load');
 check(await p.locator('.p23-practice-picture .p2x-distance-label').count(),0,'Drills omit concept captions');
 check(await p.locator('.p23-call-example .p23-city-time').count(),0,'E1 uses the scene to show time of day');
 check(await p.locator('#drill2Container .p23-city-time').count()>0,true,'time questions retain their clock cues');
 check(await p.locator('.p23-practice-picture .p23-city-region').evaluateAll(es=>es.every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(e).borderTopColor==='rgba(0, 0, 0, 0)')),true,'Drills omit concept colors and frames');
 const compare=async(button,text)=>{await button.click();check(await p.evaluate(()=>t.spoken.at(-1).text),text,'TTS model');await p.evaluate(()=>t.spoken.at(-1).onend?.());};
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']){
  await p.locator('#speechStyleControl [data-value="'+style+'"]').click();await p.locator('#scriptModeControl [data-value="'+script+'"]').click();const end={formal:'です。',informal:'だ。',casual:'だよ。'}[style],qend=style==='formal'?'ですか？':'？';
  const exModels=['私は、日本'+end+'ここは、朝'+end,'Bさんは、どこ'+qend,'私は、イギリス'+end+'ここは、夜'+end,'Cさんは、どこ'+qend,'Cさんは、アメリカ'+end+'あそこは、夕方'+end];
  for(let i=0;i<5;i++){
   await compare(p.locator('.p2x-example .p23-example-audio button').nth(i),exModels[i]);
   check(await p.locator('.p23-call-example').getAttribute('data-speaker'),['A','A','B','A','B'][i],'picture switches to the current speaker');
  }
  for(const set of [0,1,2]){
   await p.locator('[data-set-state="cityDrillSet"] button').nth(set).click();
   check(await p.locator('#drill1Container .p23-city-time').allTextContents(),set===1?['6:00','22:00','13:00']:[],'only Time shows simultaneous standard-time clocks');
   const hintMeanings=set===0?['Japan','France','United States']:set===1?['morning; 6:00 (ごぜんろくじ)','night; 22:00 (ごごじゅうじ)','afternoon; 13:00 (ごごいちじ)']:['Osaka','Paris','Los Angeles'];
   check(await p.locator('#drill1Container > .p23-city-picture .p23-city-hint').evaluateAll((es,words)=>es.map((e,i)=>e.getAttribute('aria-label').includes(words[i])),hintMeanings),[true,true,true],'image hints match the selected category');
   const firstHint=p.locator('#drill1Container > .p23-city-picture .p23-city-hint').first();await firstHint.focus();
   check((await p.locator('#'+await firstHint.getAttribute('aria-describedby')).textContent()).includes(hintMeanings[0]),true,'the visible hover tooltip follows the category');
   check(await p.locator('#drill1Container .recording-table tr').evaluateAll(es=>es.every(e=>e.dataset.drillSpeaker==='A')),true,'all D1 roles are A');
   for(let i=0;i<3;i++){
    const loc=['ここ','そこ','あそこ'][i],text=set===0?loc+'は、'+['日本','フランス','アメリカ'][i]+end:set===1?loc+'は、'+['朝','夜','昼'][i]+end:loc+'は、'+['大阪','パリ','ロサンゼルス'][i]+end;
    await compare(p.locator('#drill1Container .recording-table tr').nth(i).locator('.recording-actions button').first(),text);
   }
  }
  for(const set of [0,1]){
   await p.locator('#drill2Container .p21-set-switcher button').nth(set).click();const who=set?'B':'A';
   for(let i=0;i<3;i++){const zone=['A','B','far'][i],loc=i===2?'あそこ':who===zone?'ここ':'そこ';await compare(p.locator('#drill2Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),loc+'は、今何時'+qend);await compare(p.locator('#drill2Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),['午前六時','午後十時','午後二時'][i]+end);}
  }
  for(let i=0;i<3;i++){await compare(p.locator('#drill3Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),(i===2?'Cさん':'あなた')+'は、どこ'+qend);await compare(p.locator('#drill3Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),['喫茶店','銀行','図書館'][i]+end);}
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();await p.locator('#drill2Container .p21-set-switcher button').first().click();
 const judgments=await p.evaluate(()=>{isAutoPlay=false;const samples=[['p23_time_d2_s0_r_1','午後10時です','午後十時です',true],['p23_time_d2_s0_r_1','ここは午後十時です','午後十時です',true],['p23_time_d2_s0_r_1','パリは午後十時です','午後十時です',true],['p23_time_d2_s0_r_1','大阪は午後十時です','午後十時です',false],['p23_time_d2_s0_r_1','そこは午後十時です','午後十時です',false],['p23_where_d3_r_0','喫茶店です','喫茶店です',true],['p23_where_d3_r_0','ここは喫茶店です','喫茶店です',true],['p23_where_d3_r_0','私は喫茶店です','喫茶店です',true],['p23_where_d3_r_0','銀行です','喫茶店です',false],['p23_where_d3_r_2','Cさんは図書館です','図書館です',true],['p23_where_d3_r_2','あそこは図書館です','図書館です',true],['p23_where_d3_r_2','ここは図書館です','図書館です',false]];return samples.map(([key,text,model,want])=>{const v=practice2State.views[key];processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return [practice2State.savedResults[key].isCorrect,want,text];});});
 for(const[a,b,text]of judgments)check(a,b,text);
 await p.evaluate(()=>{isAutoPlay=false;const toggle=document.getElementById('toggleRecordMode');if(toggle.checked)toggle.click();t.speaking=true;});
 const first=p.locator('#drill1Container .recording-table tr').first();await first.locator('.recording-actions button').first().click();const transcript=await p.evaluate(()=>{const u=t.spoken.at(-1);u.onend?.();return u.text;});await first.locator('.recording-actions button').nth(1).click();await p.waitForTimeout(400);
 await p.evaluate(text=>{const r=t.recognitions.at(-1),result=[{transcript:text}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},transcript);await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);check(await first.textContent().then(s=>s.includes('✅')),true,'diagram model and row recording share state');
 await p.locator('[data-set-state="cityDrillSet"] button').first().click();
 await p.locator('[data-set-state="cityDrillSet"] button').nth(2).click();
 check(await p.locator('#drill1Container .recording-table tr').first().textContent().then(s=>s.includes('✅')),true,'D1 results survive set switching');
 for(const width of [375,600,900,1440])for(const theme of ['light','dark'])for(const hint of ['off','hover','paren']){
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});await p.locator('#hintModeControl [data-value="'+hint+'"]').click();check(await p.locator('.example-box,.drill-row,.p2x-picture,.settings-row').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)),[],'layout '+width+theme+hint);
  check(await p.locator('.p23-city-picture').evaluateAll(es=>es.every(e=>{const r=e.querySelector('img').getBoundingClientRect();return [...e.querySelectorAll('.p21-area-sound')].every(c=>{const q=c.getBoundingClientRect();return q.top>=r.top&&q.bottom<=r.bottom&&q.left>=r.left&&q.right<=r.right})})),true,'distance sounds stay inside the photograph '+width+theme+hint);
  check(await p.locator('.p23-unknown-guide').evaluate(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-stage').getBoundingClientRect();return a.left>=r.left&&a.right<=r.left+r.width/3+1&&a.top>=r.top&&a.bottom<=r.bottom;}),true,'unknown guide stays in A picture '+width+theme+hint);
  check(await p.locator('.p23-conversation-models .p21-model-line > span:last-child').evaluateAll(es=>es.every(e=>Math.abs(e.getBoundingClientRect().left-es[0].getBoundingClientRect().left)<1)),true,'all five text starts align');
  check(await p.locator('.p23-in-scene-audio button').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),b=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom})),true,'buttons inside each panel');
 }
 check(errors,[],'no browser errors');await browser.close();console.log('PASS city tasks',count);
})().catch(e=>{console.error(e);process.exit(1)});
