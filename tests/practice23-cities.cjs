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
 check(await p.locator('#drill1Container .recording-table tr').count(),3,'three statements per speaker');
 for(const id of [2,3])check(await p.locator('#drill'+id+'Container .recording-table tr').count(),6,'three conversations');
 check(await p.locator('.p23-city-photo').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),true,'city image loaded');
 const ex=p.locator('.p2x-example');const colors=await ex.locator('.p23-city-region').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));
 await ex.locator('[data-speaker="B"][data-zone="A"]').click();check(await ex.locator('.p23-city-region').evaluateAll(es=>es.map(e=>e.dataset.sound)),['そ','こ','あ'],'regions follow speaker');check(await ex.locator('.p23-city-region').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor)),[colors[1],colors[0],colors[2]],'same colors swap');await p.evaluate(()=>t.spoken.at(-1).onend?.());
 const compare=async(button,text)=>{await button.click();check(await p.evaluate(()=>t.spoken.at(-1).text),text,'TTS model');await p.evaluate(()=>t.spoken.at(-1).onend?.());};
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']){
  await p.locator('#speechStyleControl [data-value="'+style+'"]').click();await p.locator('#scriptModeControl [data-value="'+script+'"]').click();const end={formal:'です。',informal:'だ。',casual:'だよ。'}[style],qend=style==='formal'?'ですか？':'？';
  for(const speaker of ['A','B'])for(const[i,city]of ['東京','ロンドン','ニューヨーク'].entries()){
   const zone=['A','B','far'][i],loc=i===2?'あそこ':speaker===zone?'ここ':'そこ';await compare(p.locator('.p2x-example [data-speaker="'+speaker+'"][data-zone="'+zone+'"]'),loc+'は、'+city+end);
  }
  for(const set of [0,1])for(const id of [2,3]){
   await p.locator('#drill'+id+'Container .p21-set-switcher button').nth(set).click();const who=set?'B':'A',other=set?'A':'B';
   for(let i=0;i<3;i++){const zone=['A','B','far'][i],loc=i===2?'あそこ':who===zone?'ここ':'そこ',reply=i===2?'あそこ':other===zone?'ここ':'そこ';await compare(p.locator('#drill'+id+'Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),loc+'は、'+(id===2?'どこ':'今何時')+qend);await compare(p.locator('#drill'+id+'Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),id===2?reply+'は、'+['東京','ロンドン','ニューヨーク'][i]+end:['午後十時','午後一時','午前九時'][i]+end);}
  }
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();
 for(const id of [1,2,3])await p.locator('#drill'+id+'Container .p21-set-switcher button').first().click();
 const judgments=await p.evaluate(()=>{
  isAutoPlay=false;
  const samples=[['p23_city_d2_s0_r_1','ロンドンです','ここはロンドンです',true],['p23_city_d2_s0_r_1','ここはロンドンです','ここはロンドンです',true],['p23_city_d2_s0_r_1','そこはロンドンです','ここはロンドンです',false],['p23_city_d2_s0_r_1','東京です','ここはロンドンです',false],['p23_city_d3_s0_r_1','午後1時です','午後一時です',true],['p23_city_d3_s0_r_1','午後一時です','午後一時です',true],['p23_city_d3_s0_r_1','ここは午後一時です','午後一時です',true],['p23_city_d3_s0_r_1','ロンドンは午後一時です','午後一時です',true],['p23_city_d3_s0_r_1','東京は午後一時です','午後一時です',false],['p23_city_d3_s0_r_1','そこは午後一時です','午後一時です',false],['p23_city_d3_s0_r_1','午後二時です','午後一時です',false]];
  return samples.map(([key,text,model,want])=>{const v=practice2State.views[key];processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return [practice2State.savedResults[key].isCorrect,want,text];});
 });
 for(const [actual,want,text]of judgments)check(actual,want,'answer '+text);
 await p.evaluate(()=>{isAutoPlay=false;const toggle=document.getElementById('toggleRecordMode');if(toggle.checked)toggle.click();t.speaking=true;});
 const first=p.locator('#drill1Container .recording-table tr').first();await first.locator('.recording-actions button').first().click();const transcript=await p.evaluate(()=>{const u=t.spoken.at(-1);u.onend?.();return u.text;});await first.locator('.recording-actions button').nth(1).click();await p.waitForTimeout(400);check(await p.locator('#drill1Container .p21-set-switcher button').last().isDisabled(),true,'record locks sets');
 await p.evaluate(text=>{const r=t.recognitions.at(-1),result=[{transcript:text}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},transcript);await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);check(await first.textContent().then(s=>s.includes('✅')),true,'record recognized');await p.locator('#drill1Container .p21-set-switcher button').last().click();check(await p.locator('#drill1Container .recording-table tr').first().textContent().then(s=>s.includes('✅')),false,'separate speaker results');await p.locator('#drill1Container .p21-set-switcher button').first().click();check(await p.locator('#drill1Container .recording-table tr').first().textContent().then(s=>s.includes('✅')),true,'result restored');
 for(const width of [375,600,900,1440])for(const theme of ['light','dark'])for(const hint of ['off','hover','paren']){
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});await p.locator('#hintModeControl [data-value="'+hint+'"]').click();check(await p.locator('.example-box,.drill-row,.p2x-picture,.settings-row').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)),[],'layout '+width+theme+hint);
 }
 check(errors,[],'no browser errors');await browser.close();console.log('PASS city tasks',count);
})().catch(e=>{console.error(e);process.exit(1)});
