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
 check(await p.locator('[data-set-state="cityDrillSet"] button').allTextContents(),['Country','Cities','Time'],'D2 category names omit Set');
 check(await p.locator('.p2x-example .p23-in-scene-audio button').count(),0,'E1 model controls are beside the cues');
 check(await p.locator('.p23-speaking-models .grammar-highlight').allTextContents(),['ここ','どこ','ここ','どこ','あそこ'],'E1 highlights place demonstratives and questions only');
 const visibleTexts=async(selector)=>p.locator(selector).evaluateAll(es=>es.map(e=>{const copy=e.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return copy.textContent.replace(/\s+/g,'');}));
 check(await visibleTexts('.p23-model-intro'),['わたしは、にほんです。','','わたしは、イギリスです。','','','Zさんは、アメリカです。',''],'E1 Japan and C country text stay as standalone introductions');
 check(await visibleTexts('.p23-conversation-models .p23-example-cue'),['ここ／あさ','Yさん／どこ','ここ／よる','Zさん／どこ','あそこ／ゆうがた'],'E1 cue sequence');
 check((await visibleTexts('.p23-model-intro')).filter(Boolean),['わたしは、にほんです。','わたしは、イギリスです。','Zさんは、アメリカです。'],'E1 text-only introductions');
 check(await visibleTexts('.p23-model-answer > span:first-child'),['ここは、あさです。','Yさんは、どこですか。','ここは、よるです。','Zさんは、どこですか。','あそこは、ゆうがたです。'],'E1 primary models');
 check(await p.locator('.p23-model-speaker').allTextContents(),['X','QX','AY','','QX','AY',''],'model row roles');
 check(await p.locator('.p23-example-audio button').evaluateAll(es=>es.map(e=>e.dataset.speaker)),['A','A','B','A','B'],'five model clips follow conversation roles');
 check(await p.locator('.p23-unknown-guide .p21-question-sound').textContent(),'ど','unknown-place concept is in E1');
 check(await p.locator('[data-set-state="whereDrillSet"] button').allTextContents(),['People','Item1','Item2'],'D1 has people, WH and Y/N item tasks');
 check(await p.locator('#drill2Container .recording-table tr').count(),6,'D1 starts with three where conversations');
 check(await p.locator('#drill1Container .recording-table tr').count(),3,'former D1 is now D2');
 check(await p.locator('#drill3Container .recording-table tr').count(),6,'D3 contains three conversations');
 check(await p.locator('[data-set-state="cityDialogueSet"] button').allTextContents(),['Country','Cities','Time','Day'],'D3 adds Day after the D2 topics');
 check(await p.locator('.p23-city-photo').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),true,'all scenes load');
 check(await p.locator('.p23-practice-picture .p2x-distance-label').count(),0,'Drills omit concept captions');
 check(await p.locator('.p23-call-example .p23-city-time').count(),0,'E1 uses the scene to show time of day');
 check(await p.locator('.p23-practice-picture .p23-city-region').evaluateAll(es=>es.every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(e).borderTopColor==='rgba(0, 0, 0, 0)')),true,'Drills omit concept colors and frames');
 const compare=async(button,text)=>{await button.click();check(await p.evaluate(()=>t.spoken.at(-1).text),text.replace(/Xさん/g,'えっくすさん').replace(/Yさん/g,'わいさん').replace(/Zさん/g,'ぜっとさん'),'TTS model');const who=await button.evaluate(e=>e.closest('tr')?.dataset.drillSpeaker||e.dataset.speaker);check(await p.locator('.p23-city-person.is-speaking').allTextContents(),who?[({A:'X',B:'Y',C:'Z'})[who]]:[],'the current speaker flashes for every question, response and model');if(who){check(await p.locator('.p23-city-person.is-speaking').evaluate(e=>e.getAnimations().length>0),true,'speaker marker animates');check(await p.locator('.p23-city-person.is-speaking').evaluate(e=>getComputedStyle(e).outlineColor),'rgb(255, 255, 255)','speaker uses shared white frame');}await p.evaluate(()=>t.spoken.at(-1).onend?.());check(await p.locator('.p23-city-person.is-speaking').count(),0,'speaker marker stops on completion');};

 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']){
  await p.locator('#speechStyleControl [data-value="'+style+'"]').click();await p.locator('#scriptModeControl [data-value="'+script+'"]').click();const end={formal:'です。',informal:'だ。',casual:'だよ。'}[style],qend=style==='formal'?'ですか？':'？';
  const exModels=['ここは、朝'+end,'Yさんは、どこ'+qend,'ここは、夜'+end,'Zさんは、どこ'+qend,'あそこは、夕方'+end];
  for(let i=0;i<5;i++){
   await compare(p.locator('.p2x-example .p23-example-audio button').nth(i),exModels[i]);
   check(await p.locator('.p23-call-example').getAttribute('data-speaker'),['A','A','B','A','B'][i],'picture switches to the current speaker');
  }
  for(const set of [0,1,2]){
   await p.locator('[data-set-state="cityDrillSet"] button').nth(set).click();
   check(await p.locator('#drill1Container .p23-city-time:not(.p23-city-name)').allTextContents(),set===2?['6:00','22:00','13:00']:[],'only Time shows simultaneous standard-time clocks');
   check(await p.locator('#drill1Container .p23-city-name').allTextContents(),set===1?[script==='hiragana'?'おおさか':'大阪','パリ','ロサンゼルス']:[],'only Cities shows city names on the images');
   check(await p.locator('#drill1Container .p23-city-time').evaluateAll(es=>es.every(e=>getComputedStyle(e).backgroundColor==='rgb(23, 43, 70)'&&getComputedStyle(e).color==='rgb(255, 255, 255)')),true,'time and city information share the dark style');
   const hintMeanings=set===0?['Japan','France','United States']:set===2?['6 a.m.','10 p.m.','1 p.m.']:['Osaka','Paris','Los Angeles'];
   check(await p.locator('#drill1Container > .p23-city-picture .p23-city-hint').evaluateAll((es,words)=>es.map((e,i)=>e.getAttribute('aria-label').includes(words[i])),hintMeanings),[true,true,true],'image hints match the selected category');
   const firstHint=p.locator('#drill1Container > .p23-city-picture .p23-city-hint').first();await firstHint.focus();
   check((await p.locator('#'+await firstHint.getAttribute('aria-describedby')).textContent()).includes(hintMeanings[0]),true,'the visible hover tooltip follows the category');
   check(await p.locator('#drill1Container .info-panel-desc').textContent(),'💡You are A. Make each sentence using ここ, そこ, or あそこ.','D1 explicitly requests demonstratives');
   check(await p.locator('#drill1Container .drill-cue-cell strong').count(),0,'D2 cues omit redundant A labels');
   check(await p.locator('#drill1Container .recording-table tr').evaluateAll(es=>es.every(e=>e.dataset.drillSpeaker==='A')),true,'all D2 roles are A');
   for(let i=0;i<3;i++){
    const loc=['ここ','そこ','あそこ'][i],text=set===0?loc+'は、'+['日本','フランス','アメリカ'][i]+end:set===2?loc+'は、'+['朝六時','夜十時','午後一時'][i]+end:loc+'は、'+['大阪','パリ','ロサンゼルス'][i]+end;
    await compare(p.locator('#drill1Container .recording-table tr').nth(i).locator('.recording-actions button').first(),text);
   }
  }
  for(const set of [0,1,2]){
   await p.locator('[data-set-state="whereDrillSet"] button').nth(set).click();
   const nouns=set===0?['Yさん','Xさん','Zさん']:['カバン','本','ノート','ペン'];
   const answers=set===0?['喫茶店','銀行','図書館']:['ここ','あそこ','あそこ','ここ'];
   const speakers=set===0?['A','B','B','A','B','A']:['B','A','B','A','B','A','A','B'];
   check(await p.locator('#drill2Container .recording-table tr').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),speakers,'C remains a topic, never a speaking role');
   check(await p.locator('#drill2Container > .p23-city-picture .p23-city-hint').count(),set===0?3:0,'Item1/2 omit facility image hints');
   const responseCues=await visibleTexts('#drill2Container .recording-table tr:nth-child(2) .drill-cue-cell');
   check(responseCues,set===2?['AXあそこ／ここ','AXそこ／あそこ','AXここ／あそこ','AYあそこ／ここ']:set===0?['AYここ／'+ (script==='hiragana'?'きっさてん':'喫茶店'),'AXここ／'+(script==='hiragana'?'ぎんこう':'銀行'),'AXZさん／'+(script==='hiragana'?'としょかん':'図書館')]:['AX'+(script==='hiragana'?'かばん':'カバン'),'AX'+(script==='hiragana'?'ほん':'本'),'AXノート','AYペン／ここ'],'response cues name the intended subject');
   check(await p.locator('#drill2Container .p23-where-item').count(),set===0?0:4,'item sets show four framed objects');
   if(set===2)check(await p.locator('#drill2Container .p21-response-lead').allTextContents(),Array(4).fill(style==='casual'?'ううん…':'いいえ…'),'negative lead follows Stop');
   for(let i=0;i<nouns.length;i++){
    await compare(p.locator('#drill2Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),nouns[i]+'は、'+(set===2?['あそこ','ここ','そこ','あそこ'][i]:'どこ')+qend);
    await compare(p.locator('#drill2Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),(set===2?(style==='casual'?'ううんん、':'いいえ、')+['あそこ','そこ','ここ','あそこ'][i]+(style==='formal'?'じゃ、ないです。':style==='informal'?'じゃない。':'じゃないよ。'):'')+(set===2?'':(set===0?['ここ','ここ','Zさん'][i]:nouns[i])+(set===1&&i===2?'も、':'は、'))+answers[i]+end);
    if(set)check(await p.locator('.p23-where-item.is-target').getAttribute('data-kind'),['bag','book','notebook','pen'][i],'listen highlights the matching object');
   }
  }
  for(const mode of [0,1,2,3]){
   await p.locator('[data-set-state="cityDialogueSet"] button').nth(mode).click();
   const questions=mode===3?['そこは、何曜日','そこは、何曜日','あそこは、何曜日']:mode===0?['そこは、どこ','そこは、どこ','Zさんは、どこ']:mode===1?['そこは、フランスのどこ','そこは、日本のどこ','Zさんは、アメリカのどこ']:['そこは、何時','そこは、何時','あそこは、何時'];
   const replies=mode===3?['ここは、土曜日','ここは、日曜日','あそこも、土曜日']:mode===0?['ここは、フランス','ここは、日本','Zさんは、アメリカ']:mode===1?['ここは、パリ','ここは、大阪','あそこは、ロサンゼルス']:['ここは、夜十時','ここは、朝六時','あそこは、午後一時'];
   if(mode===1)check(await visibleTexts('#drill3Container .recording-table tr:nth-child(2) .drill-cue-cell'),['AYここ／パリ','AXここ／'+(script==='hiragana'?'おおさか':'大阪'),'AYあそこ／ロサンゼルス'],'Cities cues use only deictic and city');
   if(mode===3){const dayCard=p.locator('#drill3Container .p23-city-time').first();await dayCard.focus();check(await p.locator('#'+await dayCard.getAttribute('aria-describedby')).textContent(),'にちようび','English day card keeps Japanese hover');check(await visibleTexts('#drill3Container .recording-table tr:nth-child(2) .drill-cue-cell'),['AYここ／'+(script==='hiragana'?'どようび':'土曜日'),'AXここ／'+(script==='hiragana'?'にちようび':'日曜日'),'AYあそこ／'+(script==='hiragana'?'どようび':'土曜日')],'Day cues use Japanese weekdays');const dayHint=p.locator('#drill3Container .recording-table tr').nth(1).locator('.tooltip-wrap');await dayHint.dispatchEvent('pointerover');check(await dayHint.locator('.tooltip-tip').textContent(),'doyōbi, Saturday','Day cue retains normal vocabulary hover');check(await visibleTexts('#drill3Container .p23-city-time'),['Sun.','Sat.','Sat.'],'Day labels match local dates');check(await visibleTexts('#drill3Container .recording-table tr:nth-child(1) .drill-cue-cell'),['QXそこ／'+(script==='hiragana'?'なんようび':'何曜日'),'QYそこ／'+(script==='hiragana'?'なんようび':'何曜日'),'QXあそこ／'+(script==='hiragana'?'なんようび':'何曜日')],'Day question cues');}
   const roles=mode===0?['A','B','B','A','B','A']:['A','B','B','A','A','B'];
   check(await p.locator('#drill3Container .recording-table tr').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),roles,'D3 role and place references are consistent');
   for(let i=0;i<3;i++){
    await compare(p.locator('#drill3Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),questions[i]+qend);
    await compare(p.locator('#drill3Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),replies[i]+end);
   }
  }
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();
 async function judge(samples){
  const results=await p.evaluate(samples=>{isAutoPlay=false;return samples.map(([key,text,model,want])=>{const v=practice2State.views[key];processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return[practice2State.savedResults[key].isCorrect,want,text];});},samples);
  for(const [actual,want,text]of results)check(actual,want,text);
 }
 await p.locator('[data-set-state="whereDrillSet"] button').first().click();
 await judge([['p23_where_d1_s0_0_r','カフェです','ここは喫茶店です',true],['p23_where_d1_s0_0_r','喫茶店です','ここは喫茶店です',true],['p23_where_d1_s0_0_r','ここは喫茶店です','ここは喫茶店です',true],['p23_where_d1_s0_0_r','私は喫茶店です','ここは喫茶店です',true],['p23_where_d1_s0_0_r','銀行です','ここは喫茶店です',false],['p23_where_d1_s0_2_r','図書館です','Zさんは図書館です',true],['p23_where_d1_s0_2_r','あそこは図書館です','Zさんは図書館です',true],['p23_where_d1_s0_2_r','ここは図書館です','Zさんは図書館です',false]]);
 await p.locator('[data-set-state="whereDrillSet"] button').nth(1).click();
 await judge([['p23_where_d1_s1_3_r','ペンはここです','ペンはここです',true],['p23_where_d1_s1_3_r','そこです','ペンはここです',false],['p23_where_d1_s1_0_r','ここです','カバンはここです',true],['p23_where_d1_s1_0_r','カバンはここです','カバンはここです',true],['p23_where_d1_s1_0_r','カバンはそこです','カバンはここです',false],['p23_where_d1_s1_1_r','あそこです','本はあそこです',true],['p23_where_d1_s1_1_r','本はここです','本はあそこです',false],['p23_where_d1_s1_2_r','ノートもあそこです','ノートもあそこです',true],['p23_where_d1_s1_2_r','ノートはあそこです','ノートもあそこです',true],['p23_where_d1_s1_2_r','あそこです','ノートもあそこです',true],['p23_where_d1_s1_2_r','ここです','ノートもあそこです',false]]);
 await p.locator('[data-set-state="whereDrillSet"] button').nth(2).click();
 await judge([['p23_where_d1_s2_2_r','ノートもあそこです','いいえ、ここじゃないです。あそこです',true],['p23_where_d1_s2_2_r','いいえ、ここじゃないです。ノートもあそこです','いいえ、ここじゃないです。あそこです',true],['p23_where_d1_s2_0_r','いいえ、あそこじゃないです。カバンはここです','いいえ、あそこじゃないです。ここです',true],['p23_where_d1_s2_0_r','ここです','いいえ、あそこじゃないです。ここです',true],['p23_where_d1_s2_0_r','いいえ、ここです','いいえ、あそこじゃないです。ここです',true],['p23_where_d1_s2_0_r','あそこです','いいえ、あそこじゃないです。ここです',false],['p23_where_d1_s2_0_r','いいえ','いいえ、あそこじゃないです。ここです',false],['p23_where_d1_s2_1_r','いいえ、そこじゃないです。本はあそこです','いいえ、そこじゃないです。あそこです',true],['p23_where_d1_s2_1_r','ここは本です','いいえ、そこじゃないです。あそこです',false]]);
 for(const mode of [0,1,2,3]){
  await p.locator('[data-set-state="cityDialogueSet"] button').nth(mode).click();
  await judge(mode===3?[['p23_dialogue_s3_0_r','土曜日です','ここは土曜日です',true],['p23_dialogue_s3_0_r','日曜日です','ここは土曜日です',false],['p23_dialogue_s3_0_r','そこは土曜日です','ここは土曜日です',false],['p23_dialogue_s3_1_r','にちようびです','ここは日曜日です',true],['p23_dialogue_s3_2_r','あそこも土曜日です','あそこも土曜日です',true],['p23_dialogue_s3_2_r','あそこは土曜日です','あそこも土曜日です',true],['p23_dialogue_s3_2_r','どようびです','あそこも土曜日です',true],['p23_dialogue_s3_2_r','日曜日です','あそこも土曜日です',false]]:mode===0?[
   ['p23_dialogue_s0_0_r','フランスです','ここはフランスです',true],['p23_dialogue_s0_0_r','私はフランスです','ここはフランスです',true],['p23_dialogue_s0_0_r','そこはフランスです','ここはフランスです',false],['p23_dialogue_s0_2_r','アメリカです','Zさんはアメリカです',true],['p23_dialogue_s0_2_r','あそこはアメリカです','Zさんはアメリカです',true]
  ]:mode===1?[
   ['p23_dialogue_s1_0_r','フランスのパリです','ここはパリです',true],['p23_dialogue_s1_0_r','ここはフランスのパリです','ここはパリです',true],['p23_dialogue_s1_0_r','パリです','ここはパリです',true],['p23_dialogue_s1_0_r','ここはパリです','ここはパリです',true],['p23_dialogue_s1_0_r','日本のパリです','ここはパリです',false],['p23_dialogue_s1_2_r','ロサンゼルスです','あそこはロサンゼルスです',true],['p23_dialogue_s1_2_r','Zさんはアメリカのニューヨークです','あそこはロサンゼルスです',false]
  ]:[
   ['p23_dialogue_s2_0_r','夜十時です','ここは夜十時です',true],['p23_dialogue_s2_0_r','10時です','ここは夜十時です',true],['p23_dialogue_s2_0_r','ここは午後10時です','ここは夜十時です',true],['p23_dialogue_s2_0_r','22時です','ここは夜十時です',true],['p23_dialogue_s2_0_r','パリは夜十時です','ここは夜十時です',true],['p23_dialogue_s2_0_r','そこは夜十時です','ここは夜十時です',false],['p23_dialogue_s2_2_r','午後1時です','あそこは午後一時です',true],['p23_dialogue_s2_2_r','13時です','あそこは午後一時です',true],['p23_dialogue_s2_2_r','午前1時です','あそこは午後一時です',false]
  ]);
 }
 await p.locator('[data-set-state="cityDialogueSet"] button').nth(3).click();check(await p.evaluate(()=>practice2State.savedResults.p23_dialogue_s3_2_r.isCorrect),false,'Day results survive switching');
 await p.locator('[data-set-state="cityDialogueSet"] button').first().click();check(await p.locator('#drill3Container .recording-table tr').nth(5).textContent().then(t=>t.includes('✅')),true,'D3 Country results survive topic switching');
 await p.locator('[data-set-state="cityDialogueSet"] button').nth(1).click();check(await p.locator('#drill3Container .recording-table tr').nth(5).textContent().then(t=>t.includes('✅')),false,'D3 topic results stay separate');
 await p.locator('[data-set-state="cityDialogueSet"] button').nth(2).click();
 const questionButton=p.locator('#drill2Container .recording-table tr').first().locator('.recording-actions button').first();const responseButton=p.locator('#drill2Container .recording-table tr').nth(1).locator('.recording-actions button').first();
 await questionButton.click();await p.evaluate(()=>window.oldCityEnd=t.spoken.at(-1).onend);await responseButton.click();await p.evaluate(()=>oldCityEnd?.());check(await p.locator('.p23-city-person.is-speaking').allTextContents(),['X'],'interrupted question does not clear the responder marker');await p.evaluate(()=>t.spoken.at(-1).onend?.());
 await p.evaluate(()=>{isAutoPlay=false;const toggle=document.getElementById('toggleRecordMode');if(toggle.checked)toggle.click();t.speaking=true;});
 for(const rowIndex of [0,1]){
  const row=p.locator('#drill2Container .recording-table tr').nth(rowIndex);await row.locator('.recording-actions button').first().click();const transcript=await p.evaluate(()=>{const u=t.spoken.at(-1);u.onend?.();return u.text;});await row.locator('.recording-actions button').nth(1).click();await p.waitForTimeout(400);
  check(await p.locator('.p23-city-person.is-speaking').allTextContents(),[rowIndex===0?'Y':'X'],'both questioner and responder flash during recording');
  check(await p.locator('[data-set-state] button, .drill-cue-button').evaluateAll(es=>es.every(e=>e.disabled)),true,'recording locks all task switching');
  await p.evaluate(text=>{const r=t.recognitions.at(-1),result=[{transcript:text}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},transcript);await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);check(await row.textContent().then(s=>s.includes('✅')),true,'question and full response recordings are judged');
  check(await p.locator('.p23-city-person.is-speaking').count(),0,'recording completion clears the marker');
 }
 await p.locator('[data-set-state="whereDrillSet"] button').first().click();await p.locator('[data-set-state="whereDrillSet"] button').nth(2).click();
 check(await p.locator('#drill2Container .recording-table tr').nth(1).textContent().then(s=>s.includes('✅')),true,'Item 2 full response results survive switching');
 await p.locator('[data-set-state="whereDrillSet"] button').nth(1).click();check(await p.locator('#drill2Container .recording-table tr').nth(1).textContent().then(s=>s.includes('✅')),false,'Item 1 and Item 2 results stay separate');
 await p.locator('[data-set-state="whereDrillSet"] button').nth(2).click();
 await p.locator('#scriptModeControl [data-value="hiragana"]').click();
 const cueToggle=p.locator('#drill4Container .drill-cue-button');check(await cueToggle.getAttribute('aria-pressed'),'false','D4 starts with Japanese cues');
 await cueToggle.click();check(await p.locator('.drill-cue-button').count(),1,'one English cue toggle');check(await p.locator('.drill-cue-button').getAttribute('aria-pressed'),'true','English cues enabled');
 for(const [mode,expected]of [[0,'France'],[1,'Paris'],[2,'10 p.m.'],[3,'Saturday']]){
  await p.locator('[data-set-state="cityDialogueSet"] button').nth(mode).click();const rows=p.locator('#drill3Container .drill-cue-cell');check((await rows.nth(1).textContent()).includes(expected),true,'D3 English response topic '+mode);check(await rows.evaluateAll(es=>es.every(e=>!/[\u3040-\u30ff\u3400-\u9fff]/.test(e.textContent))),true,'D3 English cues contain no Japanese');
 }
 for(const set of [0,1,2]){await p.locator('[data-set-state="whereDrillSet"] button').nth(set).click();check(await p.locator('#drill2Container .drill-cue-cell').evaluateAll(es=>es.every(e=>!/[\u3040-\u30ff\u3400-\u9fff]/.test(e.textContent))),true,'D2 English cues for each set');}
 await p.locator('[data-set-state="cityDrillSet"] button').nth(1).click();check((await p.locator('#drill1Container .drill-cue-cell').nth(0).textContent()).includes('Osaka'),true,'D1 English cue');
 await compare(p.locator('#drill3Container .recording-table tr').nth(5).locator('.recording-actions button').first(),'あそこも、土曜日です。');
 check(await p.locator('#drill2Container .recording-table tr').nth(1).textContent().then(s=>s.includes('✅')),true,'English toggle preserves Item2 recording result');
 await p.locator('.drill-cue-button').click();check(await p.locator('.drill-cue-button').getAttribute('aria-pressed'),'false','Japanese cues restored');check((await p.locator('#drill3Container .recording-table tr').nth(1).locator('.drill-cue-cell').textContent()).includes('どようび'),true,'Japanese weekday cue restored');
 await p.locator('[data-set-state="cityDrillSet"] button').nth(1).click();
 for(const width of [375,600,900,1440])for(const theme of ['light','dark'])for(const hint of ['off','hover','paren']){
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});await p.locator('#hintModeControl [data-value="'+hint+'"]').click();check(await p.locator('.example-box,.drill-row,.p2x-picture,.settings-row,.drill-cue-panel').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)),[],'layout '+width+theme+hint);
  check(await p.locator('.p23-city-picture').evaluateAll(es=>es.every(e=>{const r=e.querySelector('img').getBoundingClientRect();return [...e.querySelectorAll('.p21-area-sound')].every(c=>{const q=c.getBoundingClientRect();return q.top>=r.top&&q.bottom<=r.bottom&&q.left>=r.left&&q.right<=r.right})})),true,'distance sounds stay inside the photograph '+width+theme+hint);
  check(await p.locator('.p23-unknown-guide').evaluate(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-stage').getBoundingClientRect();return a.left>=r.left&&a.right<=r.left+r.width/3+1&&a.top>=r.top&&a.bottom<=r.bottom;}),true,'unknown guide stays in A picture '+width+theme+hint);
  check(await p.locator('.p23-conversation-models').evaluate(e=>{const intro=e.querySelector('.p23-model-intro').getBoundingClientRect(),cues=[...e.querySelectorAll('.p21-model-line > .p23-example-cue')].map(x=>x.getBoundingClientRect()),america=e.querySelectorAll('.p23-model-intro')[4].getBoundingClientRect();return intro.bottom<=cues[0].top+1&&america.bottom<=cues[4].top+1&&Math.abs(cues[0].left-cues[4].left)<1;}),true,'Japan introduction and final evening cue start on separate aligned lines');
  check(await p.locator('.p23-conversation-models').evaluate(e=>Math.abs(e.querySelector('.p21-model-line > .p23-example-cue').getBoundingClientRect().width-parseFloat(e.style.getPropertyValue('--p23-example-cue-width')))<1),true,'shared cue width follows content, without surplus space');
  check(await p.locator('.p23-conversation-models .p21-model-line > .p23-example-cue').evaluateAll(es=>es.every(e=>Math.abs(e.getBoundingClientRect().left-es[0].getBoundingClientRect().left)<1)),true,'primary cue starts align');
  check(await p.locator('.p23-describe-picture .p23-city-time').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return Math.abs(r.right-a.right-4)<1&&Math.abs(r.bottom-a.bottom-4)<1;})),true,'Time and Cities use the same corner clearance in both drills');
  check(await p.locator('#drill1Container .p23-city-name').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return Math.abs(r.right-a.right-4)<1&&Math.abs(r.bottom-a.bottom-4)<1;})),true,'city labels leave four pixels to the right and bottom frame');
  check(await p.locator('#drill1Container .p23-city-name').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=r.left&&a.right<=r.right&&e.scrollWidth<=e.clientWidth+1;})),true,'city labels fit inside each image');
  check(await p.locator('.p23-where-item').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect(),first=es[0].getBoundingClientRect();return Math.abs(r.right-a.right-4)<1&&a.top>=r.top+3&&Math.abs(a.width-first.width)<1&&Math.abs(a.height-first.height)<1;})),true,'all item cards share a right edge and size');
  check(await p.locator('.p23-where-item').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=r.left&&a.right<=r.right&&a.top>=r.top&&a.bottom<=r.bottom;})),true,'all framed objects stay inside their facility image');
  check(await p.locator('.p23-in-scene-audio button').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),b=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom})),true,'buttons inside each panel');
 }
 await p.locator('[data-set-state="cityDialogueSet"] button').nth(3).click();
 for(const width of [375,600,1440]){await p.setViewportSize({width,height:900});check(await p.locator('#drill3Container .p23-city-time').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect(),r=e.closest('.p23-city-region').getBoundingClientRect();return a.left>=r.left&&a.right<=r.right&&e.scrollWidth<=e.clientWidth+1})),true,'Day labels fit '+width);}
 check(errors,[],'no browser errors');await browser.close();console.log('PASS city tasks',count);
})().catch(e=>{console.error(e);process.exit(1)});
