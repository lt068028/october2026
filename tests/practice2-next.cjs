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
 // Practice 2.3 city tasks are covered by practice23-cities.cjs.
 for(const number of ['2.2']){
  const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(mock);
  await p.route('http://next.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'});});
  await p.goto(`http://next.test/practice${number}.html`);
  const personSection=number==='2.2'?'#drill4Container':'#drill2Container';
  check(await p.locator('.p2x-people-picture .p2x-person-name').count(),0,'no visible person names');
  const peopleTargets=p.locator('.p2x-people-picture .p2x-person-target');
  for(let i=0;i<3;i++){await peopleTargets.nth(i).hover();check(await p.locator('.p21-image-tip-host .tooltip-tip').last().textContent(),['メアリー','たけし','ロバート'][i],'person hover is name only');await p.mouse.move(0,0);}

  check(await p.locator('#drill1Container > .info-panel .info-panel-desc').textContent(),'💡Name the item and say its price.','D1 concise instruction');
  check(await p.locator('#drill2Container > .info-panel .info-panel-desc').textContent(),'💡X: Ask the price and answer.','D2 requested instruction');
  check(await p.locator('#drill3Container > .info-panel .info-panel-desc').textContent(),'💡Ask with どの＋noun.','D3 keeps instruction icon');
  check(await p.title(),number==='2.2'?'Practice 2.2: この・その・あの・どの — Demonstrative Adjectives':'Practice 2.3: ここ・そこ・あそこ・どこ',number+' page title');
  check(await p.locator('#scriptModeControl [aria-pressed="true"]').getAttribute('data-value'),'hiragana',number+' hiragana default');
  check(await p.locator('.p21-model-line').count(),6,number+' six example models');
  if(number==='2.2'){
   check(await p.locator('.p2x-example .p2x-photo').first().getAttribute('src'),'assets/practice22-hats.png','hat photo');
   check(await p.locator('.p2x-example .p2x-reach').count(),3,'three proximity regions');
   const colorsA=await p.locator('.p2x-example .p2x-reach').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));
   await p.locator('.p2x-example [data-speaker="B"][data-zone="A"]').click();
   const colorsB=await p.locator('.p2x-example .p2x-reach').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));
   check(colorsA[0],colorsB[1],'near speaker color follows B');check(colorsA[1],colorsB[0],'near listener color follows B');check(colorsA[2],colorsB[2],'far region unchanged');
   await p.evaluate(()=>t.spoken.at(-1).onend?.());
   check(await p.locator('#drill3Container .p21-which-guide .p21-thought-cloud').count(),1,'Only E3 shows the unknown guide');
   check(await p.locator('#drill2Container .recording-table tr').count(),6,'three A-to-B price conversations');
   check(await p.locator('.p2x-price-example h3').count(),0,'redundant Example heading removed');
   check(await p.locator('#drill1Container .recording-table tr').count(),3,'D1 has three statements');
   check(await p.locator('#drill3Container > .p2x-picture .p2x-speaker-guide').count(),0,'D3 has no redundant Who guide');
   check(await p.locator('#drill3Container > .example-box .p2x-speaker-guide').count(),0,'E3 has no redundant Who guide');
   check(await p.locator('.p2x-food-example .p2x-price').allTextContents(),['¥300','¥100','¥200'],'fruit prices updated');
   check(await p.locator('.p2x-food-example .grammar-highlight').allTextContents().then(xs=>xs.some(x=>x==='だ'||x==='の')),false,'fruit noun has no accidental grammar highlighting');

   check(await p.locator('#drill1Container .recording-table tr').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),['B','A','B'],'D1 changes viewpoint on same near item');
   check(await p.locator('#drill1Container .recording-table tr').evaluateAll(es=>es.map(e=>e.dataset.zone)),['A','A','far'],'D1 uses the same near item twice');
   check(await p.locator('#drill1Container .recording-table tr').evaluateAll(es=>es.every(e=>e.textContent.includes('Price'))),true,'D1 does not reveal spoken price in cue');
   check(await p.locator('#drill3Container > .p2x-context-note').count(),0,'D3 has no duplicate instruction paragraph');

   check(await p.locator('#drill3Container .recording-table tr').count(),6,'D3 has three conversations');
   check(await p.locator('#drill3Container .drill-number-cell').allTextContents(),['1','','2','','3',''],'D3 numbered 1 through 3');
   check(await p.locator('#drill3Container .recording-table tr').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),['A','B','A','B','A','B'],'D3 A asks only');
   check(await p.locator('#drill1Container,#drill2Container,#drill3Container').evaluateAll(es=>es.every(e=>e.firstElementChild.matches('.example-box')&&Boolean(e.firstElementChild.nextElementSibling?.matches('.info-panel')))),true,'each Example precedes its Drill');
   check(await p.locator('#drill4Container > .example-box').count(),0,'E4 removed');check(await p.locator('#drill4Container > .info-panel .info-panel-desc').textContent(),'💡Use だれ to ask who someone is.','D4 introduces who in instruction');check(await p.locator('#drill4Container .info-panel-desc strong.grammar-highlight').textContent(),'だれ','who is highlighted');check(await p.locator('#drill4Container > .info-panel .info-panel-title').textContent(),'Drill 4: どの人ですか？だれですか？','D4 title');check(await p.locator('#peopleContainer').count(),0,'old under-review people section removed');check(await p.locator('[data-set-state="choosingSet"] button').allTextContents(),['おにぎり','おべんとう'],'D3 contains only noun-selection topics');
   check(await p.locator('.p2x-price-example button,.p2x-food-example button').evaluateAll(es=>es.every(e=>e.firstChild.textContent==='🔊きく')),true,'no repeated A/B on example buttons');

   check(await p.locator('.p2x-price-example').evaluate(e=>getComputedStyle(e,'::before').content!=='none'),true,'Example2 badge restored');
   check(await p.locator('#drill1Container > .info-panel').evaluate(e=>parseFloat(getComputedStyle(e).marginTop)),24,'shared Example to Drill spacing');
   check(await p.locator('#drill2Container').evaluate(e=>parseFloat(getComputedStyle(e).marginTop)),40,'shared section spacing');
   check(await p.locator('.p2x-example .p2x-price-hint').count(),0,'Example prices need no reading hover');
   for(const [selector,reading]of [['#drill1Container .p2x-price-hint','にせんえん'],['#drill3Container .p2x-price-hint','さんびゃくえん']]) {
    const tag=p.locator(selector).first();await tag.hover();
    check(await p.locator('.p21-image-tip-host .tooltip-tip').last().textContent(),reading,'price hover reading');
    await p.mouse.move(0,0);
   }

   check(await p.locator('.p2x-example .p2x-price').allTextContents(),['¥1,000','¥3,000','¥4,000'],'hat prices match object order');
   check(await p.locator('.p2x-example .p2x-scene-canvas > .p2x-speaker-guide').count(),0,'Who guide removed without moving buttons');
   check(await p.locator('.p2x-example .p2x-audio').count(),3,'three audio pairs inside image');
   check(await p.locator('.p2x-speaker-models .p21-model-group').count(),2,'models grouped by speaker');
   check(await p.locator('.p2x-example .p2x-context-note').count(),0,'removed explanatory paragraph');
   await p.locator('.p2x-example .p21-item-audio button').first().click();
   check(await p.locator('.p2x-example .p2x-person.is-speaking').evaluate(e=>getComputedStyle(e).animationName),'p22-speaker-focus','speaker frame pulses during playback');
   check(await p.evaluate(()=>t.spoken.at(-1).text.includes('千円')&&!t.spoken.at(-1).text.includes('せんえん')),true,'TTS price is kanji with hiragana display');
   await p.evaluate(()=>t.spoken.at(-1).onend?.());
   check(await p.locator('.p2x-example .p2x-person.is-speaking').count(),0,'speaker frame stops with playback');
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
   check(await p.locator('[data-set-state="dialogueSet"]').count(),0,'people speaker switches removed');
   check(await p.locator(personSection+' tr[data-drill-speaker]').evaluateAll(es=>es.map(e=>e.dataset.drillSpeaker)),['A','B','B','A','A','B'],'mixed speaker roles');
   for(let i=0;i<3;i++){
    const q=['その','その','あの'][i]+'人は誰'+(style==='formal'?'ですか':'');
    const r=['この人はたけしさん','この人はメアリーさん','あの人はロバートさん'][i]+end;
    await compare(p.locator(personSection+' .recording-table tr').nth(i*2).locator('.recording-actions button').first(),q,'D4 Q');
    await compare(p.locator(personSection+' .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),r,'D4 response');
   }
   await p.locator('[data-set-state="peopleConversationSet"] button').nth(1).click();
   for(let i=0;i<3;i++){
    const q=['その人はYさんのクラスメート','その人はXさんのクラスメート','Yさんのクラスメートはどの人'][i]+(style==='formal'?'ですか':'');
    const no=style==='casual'?'ううん':'いいえ';
    const r=(i===2?'あの人':no+['この人は私の弟','この人は私の友達'][i])+end;
    await compare(p.locator(personSection+' .recording-table tr').nth(i*2).locator('.recording-actions button').first(),q,'D4 Set2 question');
    await compare(p.locator(personSection+' .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),r,'D4 Set2 correction');
   }
   check(await p.locator(personSection+' .p21-response-lead').allTextContents(),Array(2).fill(style==='casual'?'ううん…':'いいえ…'),'Set2 negative lead');
   await p.locator('[data-set-state="peopleConversationSet"] button').first().click();
   if(number==='2.2') {
    for(const set of [0,1]) {
     await p.locator('#drill1Container .p21-set-switcher button').nth(set).click();
     await p.locator('#drill2Container .p21-set-switcher button').nth(set).click();
     const n=['カバン','時計'][set];
     for(let i=0;i<3;i++) {
      const adj=['この','その','あの'][i],replyAdj=['その','この','あの'][i],amount=(set===0?['二千円','五千円','八千円']:['六千円','九千円','一万円'])[i];
      const statementAdj=['その','この','あの'][i],statementAmount=(set===0?['二千円','二千円','八千円']:['六千円','六千円','一万円'])[i];
      await compare(p.locator('#drill1Container .recording-table tr').nth(i).locator('.recording-actions button').first(),statementAdj+n+'は'+statementAmount+end,'D1 statement');
      await compare(p.locator('#drill2Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),adj+n+'はいくら'+(style==='formal'?'ですか':''),'D1 price Q');
      await compare(p.locator('#drill2Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),replyAdj+n+'は'+amount+end,'D1 price R');
     }
     await p.locator('#drill3Container .p21-set-switcher button').nth(set).click();
     const food=['おにぎり','お弁当'][set],prices=set===0?['三百円','六百円','九百円']:['千円','二千円','三千円'];
     for(let i=0;i<3;i++) {
      const zone=['A','B','far'][i%3],answerer=i<3?'B':'A',adj=zone==='far'?'あの':zone===answerer?'この':'その';
      await compare(p.locator('#drill3Container .recording-table tr').nth(i*2).locator('.recording-actions button').first(),'どの'+food+'が'+prices[i%3]+(style==='formal'?'ですか':''),'D3 food Q');
      await compare(p.locator('#drill3Container .recording-table tr').nth(i*2+1).locator('.recording-actions button').first(),adj+food+end,'D3 food R');
     }
    }
   } else {
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

  }
  await p.locator('#speechStyleControl [data-value="formal"]').click();
  await p.locator('#drill1Container .p21-set-switcher button').first().click();await p.locator('#drill2Container .p21-set-switcher button').first().click();await p.locator('[data-set-state="choosingSet"] button').first().click();
  const judgments=await p.evaluate(number=>{
   isAutoPlay=false;const prefix=number==='2.2'?'p22':'p23';
   const samples=number==='2.2'?[
    ['p22_price_s0_A_0_q','このカバンはいくらですか','このカバンはいくらですか',true],
    ['p22_price_s0_A_0_r','2000円です','そのカバンはにせんえんです',false],
    ['p22_price_s0_A_0_r','そのカバンは2000円です','そのカバンはにせんえんです',true],
    ['p22_price_s0_A_0_r','このカバンは二千円です','そのカバンはにせんえんです',false],
    ['p22_price_s0_A_0_r','そのカバンは3000円です','そのカバンはにせんえんです',false],
    ['p22_food_s0_A_0_q','どのおにぎりが300円ですか','どのおにぎりがさんびゃくえんですか',true],
    ['p22_food_s0_A_0_q','どのおにぎりは300円ですか','どのおにぎりがさんびゃくえんですか',false],
    ['p22_food_s0_A_0_r','そのおにぎりです','そのおにぎりです',true],
    ['p22_food_s0_A_0_r','そのおにぎりが三百円です','そのおにぎりです',true],
    ['p22_food_s0_A_0_r','このおにぎりです','そのおにぎりです',false],
    ['p22_food_s0_A_0_r','そのです','そのおにぎりです',false],
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
  const peopleResults=await p.evaluate(()=>{const key='p22_people_mixed_r_1',v=practice2State.views[key];return ['メアリーさんです','その人はメアリーさんです','この人はメアリーさんです','ロバートさんです'].map(text=>{processResult(text,'メアリーさんです',()=> 'メアリーさんです',v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return practice2State.savedResults[key].isCorrect})});check(peopleResults,[true,false,true,false],'people name and responder perspective');
  await p.locator('#speechStyleControl [data-value="formal"]').click();
  await p.locator('[data-set-state="peopleConversationSet"] button').nth(1).click();
  const classmateAnswers=await p.evaluate(()=>{const key='p22_people_classmate_r_2',v=practice2State.views[key],model='私のクラスメートはあの人です';return ['私のクラスメートはあの人です','あの人です','私のクラスメートはこの人です','いいえ、あの人です','あの人は私の先生です'].map(text=>{processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return practice2State.savedResults[key].isCorrect;});});check(classmateAnswers,[true,true,false,false,false],'classmate selection uses far person without no');
  const relationships=await p.evaluate(()=>{const key='p22_people_relations_r_0',v=practice2State.views[key],model='いいえ、この人は私の弟です';return ['いいえ、この人は私の弟です','いいえ、私の弟です','いいえ、弟です','いいえ、私のクラスメートじゃないです。この人は私の弟です','はい、この人は私の弟です','いいえ、その人は私の弟です','いいえ、この人は私の先生です'].map(text=>{processResult(text,model,()=>model,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);return practice2State.savedResults[key].isCorrect;});});check(relationships,[true,true,true,true,false,false,false],'Set2 accepts natural correction and rejects wrong relation, perspective or yes');
  await p.locator('[data-set-state="peopleConversationSet"] button').first().click();
  await p.locator('[data-set-state="peopleConversationSet"] button').nth(1).click();
  check(await p.evaluate(()=>practice2State.savedResults.p22_people_relations_r_0.rawTranscript),'いいえ、この人は私の先生です','Set2 result survives switching');
  await p.locator('[data-set-state="peopleConversationSet"] button').first().click();
  for(const width of [375,600,1440]){await p.setViewportSize({width,height:1000});check(await p.locator('.p2x-people-picture .p2x-stage').evaluateAll(es=>es.every(e=>{const a=e.getBoundingClientRect();return Math.abs(a.width/a.height-2)<.02&&[...e.querySelectorAll('.p2x-person-name,.p2x-person')].every(n=>{const r=n.getBoundingClientRect();return r.left>=a.left&&r.right<=a.right&&r.top>=a.top&&r.bottom<=a.bottom})})),true,'wide people picture and labels fit '+width);}
  await p.locator('[data-set-state="choosingSet"] button').nth(1).click();await p.locator('[data-set-state="choosingSet"] button').first().click();check(await p.evaluate(()=>practice2State.savedResults.p22_people_mixed_r_1.rawTranscript),'ロバートさんです','people results survive food-topic switching');
  await p.locator('[data-set-state="choosingSet"] button').first().click();
  // Exercise the microphone path, set locking and result restoration with real callbacks.
  await p.locator('#drill1Container .p21-set-switcher button').first().click();
  await p.evaluate(()=>{isAutoPlay=false;const toggle=document.getElementById('toggleRecordMode');if(toggle.checked)toggle.click();t.speaking=true;});
  const first=p.locator('#drill1Container .recording-table tr').first();await first.locator('.recording-actions button').first().click();
  const transcript=await p.evaluate(()=>{const u=t.spoken.at(-1);u.onend?.();return u.text;});
  await first.locator('.recording-actions button').nth(1).click();await p.waitForTimeout(400);
  check(await p.locator('#drill1Container .p21-set-switcher button').first().isDisabled(),true,number+' sets locked in recording');
  check(await first.locator('.p22-person-badge.is-speaking').allTextContents(),['Y'],'outside speaker badge pulses in recording');
  check(await p.locator('#drill1Container > .p2x-picture .p2x-person.is-speaking').allTextContents(),['Y'],'picture speaker pulses with outside badge');
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
   if(number==='2.2')check(await p.locator('.p2x-example .p2x-hat-picture').evaluate(e=>{
    const buttons=[...e.querySelectorAll('.p2x-audio button')].map(b=>b.getBoundingClientRect()),stage=e.querySelector('.p2x-stage').getBoundingClientRect();
    const bounds=e.dataset.audioLayout==='tray'?e.getBoundingClientRect():stage;return buttons.every((a,i)=>a.left>=bounds.left&&a.right<=bounds.right&&a.top>=bounds.top&&a.bottom<=bounds.bottom&&buttons.every((b,j)=>i===j||Math.min(a.right,b.right)<=Math.max(a.left,b.left)||Math.min(a.bottom,b.bottom)<=Math.max(a.top,b.top)));
   }),true,'image buttons fit without overlap '+width+theme+hint);
   if(process.env.NEXT_SCREENSHOT_DIR&&width===1440&&theme==='light'&&hint==='hover'){
    fs.mkdirSync(process.env.NEXT_SCREENSHOT_DIR,{recursive:true});await p.locator('.p2x-example').screenshot({path:path.join(process.env.NEXT_SCREENSHOT_DIR,`practice${number}-example.png`)});await p.locator('#drill2Container > .p2x-picture').screenshot({path:path.join(process.env.NEXT_SCREENSHOT_DIR,`practice${number}-drill2.png`)});
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
