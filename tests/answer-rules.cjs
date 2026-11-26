// Text judgment regression. These tests do not claim microphone recognition accuracy.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','practice8.1','practice8.2','composition1','pronunciation2'];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let count=0;const check=(actual,expected,label)=>{assert.equal(actual,expected,label);count++};
 for(const name of pages){
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(){}}});
   window.SpeechSynthesisUtterance=class{};
  });
  await p.route('http://answers.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   let s=fs.readFileSync(file,'utf8');
   if(file.endsWith('practice1.2.js'))s=s.replace('    // 保存時だけ判定する。','    window.answerMatch=(a,b)=>matches(a,b,speechStyle);\n    // 保存時だけ判定する。');
   if(file.endsWith('practice7.3.js')){const i=s.lastIndexOf('})();');s=s.slice(0,i)+`window.answerMatch=(a,b)=>matchesAnswer(a,{hira:hira(b)});window.qaMatch=(a,i=0,kind='yes')=>matchesAnswer(a,qa73Model(qa73.items[i],kind));window.answerRows=()=>[...views.values()].map(v=>v.r);window.answerReading=hira;window.answerExamples=()=>sections.flatMap(s=>s.example||[]).map(r=>model(r));window.conversationMatch=(a,s,i)=>matchesAnswer(a,model(sections[s].items[i][1]));window.conversationModel=(s,i)=>model(sections[s].items[i][1]).hira;`+s.slice(i);}
   if(file.endsWith('practice8.1.js')){const i=s.lastIndexOf('})();');s=s.slice(0,i)+`window.p81Test={matchesAnswer,rowsFor,choices};`+s.slice(i);}
   if(file.endsWith('practice8.2.js')){const i=s.lastIndexOf('})();');s=s.slice(0,i)+`window.p82Test={evaluateAnswer,matchesAnswer,rowsFor,choices};`+s.slice(i);}
   return r.fulfill({body:s,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
  });
  await p.goto('http://answers.test/'+name+'.html');
  for(const style of ['formal','informal','casual']){
   const b=p.locator('#speechStyleControl [data-value="'+style+'"]');if(!await b.count()||await b.isDisabled())continue;await b.click();
   const result=await p.evaluate(({name,style})=>{
    let model,judge;
    if(name==='practice1.1'){model=modelSentence('私','学生',false);judge=matchesSentence;}
    if(name==='practice1.2'){model=style==='formal'?'私は学生です':style==='informal'?'私は学生だ':'私学生だよ';judge=answerMatch;}
    if(name==='practice7.1'){model=practice71Data[0].pastSentence;judge=(a,m)=>DrillAnswer.formAllowed(a)&&practice71Normalize(a)===practice71Normalize(m);}
    if(name==='practice7.2'){model=practice7Data[0].pastSentence;judge=(a,m)=>DrillAnswer.formAllowed(a)&&practice7Normalize(a)===practice7Normalize(m);}
    if(name==='practice7.3'){model=answerRows()[0].text;judge=answerMatch;}
    if(name==='practice8.1'){const r=p81Test.rowsFor(0)[0][0];model=r.text;judge=a=>p81Test.matchesAnswer(a,r);}
    if(name==='practice8.2'){const r=p82Test.rowsFor(0)[0][0];model=r.text;judge=a=>p82Test.matchesAnswer(a,r);}
    if(name==='composition1'){model=compositionState.views[0].item.jaKanji;judge=(a,m)=>compositionBestDiff(a,[m]).cost===0;}
    if(name==='pronunciation2'){model=p2.views[0].item.kanji;judge=(a,m)=>p2BestDiff(a,[m]).correct;}
    const base=model.replace(/[。？?]+$/,'').replace(/(?:よね|よ|ね)$/,'');
    return {suffix:['','よ','ね','よね'].map(end=>judge(base+end,model)),quoted:['よ','ね','よね'].map(end=>judge('「'+base+end+'。」',model)),question:judge(base+'？',model),extra:judge(base+'猫',model),model};
   },{name,style});
   result.suffix.forEach((v,i)=>check(v,true,`${name} ${style} suffix ${i}`));
   result.quoted.forEach((v,i)=>check(v,true,`${name} ${style} quoted suffix ${i}`));
   check(result.question,style!=='formal',`${name} ${style} question mark without ka`);
   check(result.extra,false,`${name} ${style} unrelated word`);
  }
  await p.locator('#speechStyleControl [data-value="formal"]').click();
  if(name==='practice7.1'){
   const v=await p.evaluate(()=>({repeated:practice71Normalize('本本を読んでいます')===practice71Normalize('はい本を読んでいます'),habit:practice71Normalize('映画をいつも見ます')===practice71Normalize('いつも映画を見ます'),missing:practice71Normalize('映画を見ます')===practice71Normalize('いつも映画を見ます')}));
   check(v.repeated,true,'p71 self-correction preserved');check(v.habit,true,'p71 reorder preserved');check(v.missing,false,'p71 Habit time required');
  }
  if(name==='practice7.2'){
   for(const a of ['お父さんは太っています','お父さんが太っています','お父さんお父さんは太っています','太っています'])check(await p.evaluate(a=>practice7Normalize(a)===practice7Normalize('はいお父さんは太っています'),a),true,'p72 allowed subject '+a);
   for(const a of ['お父さんを太っています','お父さんに太っています','お父さんは','はい'])check(await p.evaluate(a=>practice7Normalize(a)===practice7Normalize('はいお父さんは太っています'),a),false,'p72 reject '+a);
   for(const a of ['お兄さんはTシャツを着ています','お兄さんがTシャツを着ています','Tシャツを着ています'])check(await p.evaluate(a=>practice7Normalize(a)===practice7Normalize('はいお兄さんはTシャツを着ています'),a),true,'p72 subject and object '+a);
   check(await p.evaluate(()=>practice7Normalize('お兄さんをTシャツを着ています')===practice7Normalize('はいお兄さんはTシャツを着ています')),false,'p72 subject を rejected without blocking object を');
   for(const a of ['電話番号を覚えています','電話番号は覚えています','家の電話番号を覚えています','家の電話番号は覚えています','覚えています'])check(await p.evaluate(a=>practice7Normalize(a)===practice7Normalize('はい家の電話番号を覚えています'),a),true,'p72 phone object '+a);
   for(const a of ['電話番号が覚えています','家の電話番号が覚えています'])check(await p.evaluate(a=>practice7Normalize(a)===practice7Normalize('はい家の電話番号を覚えています'),a),false,'p72 phone が rejected '+a);
   for(const [m,variants] of [ ['夜十時に寝ました',['夜10時に寝ました','夜１０時に寝ました','夜じゅうじに寝ました']],['漢字を五十個覚えました',['漢字を50個覚えました','漢字を５０個覚えました','漢字をごじゅっこ覚えました','漢字をごじっこ覚えました','漢字をごじゅうこ覚えました']],['三年前に結婚しました',['3年前に結婚しました','３年前に結婚しました','さんねんまえに結婚しました']]]){
    for(const a of variants)check(await p.evaluate(({a,m})=>practice7Normalize(a)===practice7Normalize(m),{a,m}),true,'p72 number '+a);
   }
   check(await p.evaluate(()=>practice7Normalize('夜十一時に寝ました')===practice7Normalize('夜十時に寝ました')),false,'different number rejected');
   check(await p.evaluate(()=>practice7Data.every(v=>!/[0-9]+(?:時|個|年前)/.test(v.pastSentence+v.perfectSentence+v.xKanji+v.yKanji))),true,'p72 model kanji numerals');
  }
  if(name==='practice7.3'){
   for(const style of ['formal','informal','casual']){
    await p.locator('#speechStyleControl [data-value="'+style+'"]').click();
    const ending=style==='formal'?'いました':style==='informal'?'いた':'た';
    for(const time of ['今朝','けさ','今日の朝'])check(await p.evaluate(a=>qaMatch(a),time+'友達に会って'+ending),true,'p73 this morning alias '+style+'/'+time);
    for(const time of ['昨夜','昨晩','さくや','さくばん','昨日の晩'])check(await p.evaluate(a=>qaMatch(a,2),time+'出かけて'+ending),true,'p73 last night alias '+style+'/'+time);
    for(const [time,i,verb]of [['先ほど',4,'電話をかけて'],['昨日のお昼',3,'お風呂に入って']])check(await p.evaluate(({a,i})=>qaMatch(a,i),{a:time+verb+ending,i}),true,'p73 English cue synonym '+time);
    check(await p.evaluate(a=>qaMatch(a),'昨夜友達に会って'+ending),false,'p73 night is not morning');
    check(await p.evaluate(a=>qaMatch(a,2),'今朝出かけて'+ending),false,'p73 morning is not night');
   }
   await p.locator('#speechStyleControl [data-value="formal"]').click();
   for(const a of ['会っていました','はい会っていました','会ってました','友達と会っていました','今日の午前中友達と会っていました','今日の午前中会っていました','今日の午前中今日の午前中会っていました','友達に友達に会っていました','はいはい会っていました'])check(await p.evaluate(a=>qaMatch(a),a),true,'p73 allowed '+a);
   for(const a of ['今日の午後会っていました','昨日の夜会っていました','今日の午前中昨日の夜会っていました','会っていました？','会っていましたか','はい','えーと、はい、'])check(await p.evaluate(a=>qaMatch(a),a),false,'p73 reject '+a);
   for(const [a,expected] of [['会っていませんでした',true],['会ってませんでした',true],['今日の午前中会っていませんでした',true],['昨日の夜会っていませんでした',false],['はい会っていませんでした',false],['いいえ会っていました',false]])check(await p.evaluate(a=>qaMatch(a,0,'no'),a),expected,'p73 negative '+a);
   for(const [i,time,verb] of [[1,'今日の午後','乗っていました'],[2,'昨日の夜','出かけていました'],[3,'昨日の昼','お風呂に入っていました'],[4,'さっき','電話をかけていました']]){
    check(await p.evaluate(({i,verb})=>qaMatch(verb,i),{i,verb}),true,'p73 row '+i+' omitted time');
    check(await p.evaluate(({i,time,verb})=>qaMatch(time+verb,i),{i,time,verb}),true,'p73 row '+i+' matching time');
    check(await p.evaluate(({i,verb})=>qaMatch('今日の午前中'+verb,i),{i,verb}),false,'p73 row '+i+' wrong time');
   }
   check(await p.evaluate(()=>answerMatch('昨日の午前中何をしていました','昨日の午前中何をしていましたか')),false,'formal question requires ka');
   check(await p.evaluate(()=>answerMatch('昨日の午前中何をしていましたか？','昨日の午前中何をしていましたか。')),true,'formal ka question accepted');
   check(await p.evaluate(()=>answerMatch('昨日の朝じゅうじ手紙を書いていました','昨日の朝十時手紙を書いていました')),true,'p73 numeric kana');
   for(const [a,m]of [['昨日の午前十時手紙を書いていました','昨日の朝十時手紙を書いていました'],['昨日の午後八時歌を歌っていました','昨日の夜八時歌を歌っていました'],['昨日の午後九時漢字を覚えていました','昨日の夜九時漢字を覚えていました']])check(await p.evaluate(({a,m})=>answerMatch(a,m),{a,m}),true,'p73 equivalent am/pm time '+a);
   check(await p.evaluate(()=>answerMatch('昨日の午前九時手紙を書いていました','昨日の朝十時手紙を書いていました')),false,'p73 different hour rejected');

   check(await p.evaluate(()=>answerRows().every(r=>!/[0-9]+(?:時|個|年前)/.test(r.text))),true,'p73 model kanji numerals');
   check(await p.evaluate(()=>answerExamples().every(r=>r.marks.every(m=>!/[0-9]+(?:時|個|年前)/.test(m)))),true,'p73 highlighted model tokens also use kanji numerals');
   // Exercise the real recording-result predicate with row time metadata in every style.
   for(const style of ['informal','casual']){
    await p.locator('#speechStyleControl [data-value="'+style+'"]').click();
    const ending=style==='informal'?'いた':'た';
    check(await p.evaluate(a=>qaMatch(a),'会って'+ending),true,'p73 '+style+' time omitted');
    check(await p.evaluate(a=>qaMatch(a),'昨日の夜会って'+ending),false,'p73 '+style+' wrong time');
   }
  }
  if(name==='practice7.1'){
   check(await p.evaluate(()=>practice71Normalize('はい私は今本を読んでいます')===practice71Normalize('はい読んでいます')),true,'p71 full first-person response');
   check(await p.evaluate(()=>practice71Normalize('はいはい本を読んでいます')===practice71Normalize('はい読んでいます')),true,'p71 C4 adjacent response repeat');
   check(await p.evaluate(()=>practice71Normalize('はい読んでます')===practice71Normalize('はい読んでいます')),true,'p71 てます omission accepted');
   check(await p.evaluate(()=>practice71Normalize('いいえ読んでません')===practice71Normalize('いいえ読んでいません')),true,'p71 てません omission accepted');
   check(await p.evaluate(()=>practice71Normalize('えーと、はい、')===practice71Normalize('はい読んでいます')),false,'p71 filler + response word only rejected');
   check(await p.evaluate(()=>practice71Normalize('はい読んでいません')===practice71Normalize('はい読んでいます')),false,'p71 polarity contradiction rejected');
  }
  if(name==='practice7.2'){
   check(await p.evaluate(()=>practice7Normalize('はい私は家の電話番号を覚えています')===practice7Normalize('はい覚えています')),true,'p72 full first-person response');
   check(await p.evaluate(()=>practice7Normalize('はいはい太っています')===practice7Normalize('はいお父さんは太っています')),true,'p72 C4 adjacent response repeat');
   check(await p.evaluate(()=>practice7Normalize('はい太ってます')===practice7Normalize('はいお父さんは太っています')),true,'p72 てます omission accepted');
   check(await p.evaluate(()=>practice7Normalize('いいえ太ってません')===practice7Normalize('いいえお父さんは太っていません')),true,'p72 てません omission accepted');
   check(await p.evaluate(()=>practice7Normalize('えーと、はい、')===practice7Normalize('はいお父さんは太っています')),false,'p72 filler + response word only rejected');
   check(await p.evaluate(()=>practice7Normalize('私を家の電話番号を覚えています')===practice7Normalize('はい覚えています')),false,'p72 self subject を rejected');
   check(await p.evaluate(()=>practice7Normalize('私は太っています')===practice7Normalize('はい太っています')),false,'p72 cannot replace father subject with self');
  }
  if(name==='practice1.2'){
   await p.locator('#speechStyleControl [data-value="formal"]').click();

   // Use the real row callbacks and saved-result predicate, not a synthetic matcher.
   const yes=p.locator('#drill1Container button.answer-choice[data-answer="yes"], #drill1Container button[aria-pressed]').first();
   if(await yes.getAttribute('aria-pressed')!=='true')await yes.click();
   const out=await p.evaluate(()=>{
    isAutoPlay=false;
    const key='p2_drill1_a_0',v=practice2State.views[key];
    const refs=practice2State.replyReferences[key](),full=refs[0],short=refs[1];
    const repeated='はいはい、'+short;
    return [short,full,repeated,full.replace('はい','いいえ'),'はい','えーと、はい、'].map(text=>{
     processResult(text,short,()=>short,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);
     return [text,practice2State.savedResults[key].isCorrect];
    });
   });
   check(JSON.stringify(out),JSON.stringify(out.map((v,i)=>[v[0],i<3])),'p12 short/full/C4 repeat/polarity/response-word-only');
   const select=p.locator('#drill2Container select').first();
   await select.selectOption({index:1});
   const majors=await p.evaluate(()=>{
    const key=Object.keys(practice2State.replyReferences).find(k=>k.startsWith('p2_drill2_'));
    const refs=practice2State.replyReferences[key](),short=refs[0].split('は、').at(-1),v=practice2State.views[key];
    return [short,...refs,'私の専攻は'+short].map(text=>{
     processResult(text,short,()=>short,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);
     return practice2State.savedResults[key].isCorrect;
    });
   });
   check(JSON.stringify(majors),JSON.stringify([true,true,true,false]),'p12 major short/full/partial/wrong owner');
   await p.locator('#speechStyleControl [data-value="casual"]').click();
   check(await p.evaluate(()=>{
    const key='p2_drill1_a_0',v=practice2State.views[key],refs=practice2State.replyReferences[key]();
    processResult(refs[3],refs[1],()=>refs[1],v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);
    return practice2State.savedResults[key].isCorrect;
   }),true,'p12 casual topic particle optional in full response');
  }
  if(name==='practice8.1'){
   await p.locator('#speechStyleControl [data-value="formal"]').click();
   const p81Results=await p.evaluate(()=>{
    p81Test.choices.delete('self-0-response');
    const unselectedRow=p81Test.rowsFor(1)[0][1];
    const unselected=p81Test.matchesAnswer('はい、好きです',unselectedRow);
    p81Test.choices.set('self-0-response','yes');
    const yesRow=p81Test.rowsFor(1)[0][1];
    const yesShort=p81Test.matchesAnswer('はい、好きです',yesRow);
    const yesFull=p81Test.matchesAnswer('はい、コーヒーを飲むのが、好きです',yesRow);
    const yesOmitResp=p81Test.matchesAnswer('好きです',yesRow);
    const yesC4=p81Test.matchesAnswer('はいはい、好きです',yesRow);
    const yesPolarityMismatch=p81Test.matchesAnswer('いいえ、好きじゃないです',yesRow);
    const yesEuphemism=p81Test.matchesAnswer('はい、きらいじゃないです',yesRow)||p81Test.matchesAnswer('きらいじゃないです',yesRow);
    const yesRespOnly=p81Test.matchesAnswer('はい',yesRow)||p81Test.matchesAnswer('はい、',yesRow)||p81Test.matchesAnswer('えーと、はい',yesRow);
    p81Test.choices.set('self-0-response','no');
    const noRow=p81Test.rowsFor(1)[0][1];
    const noShort=p81Test.matchesAnswer('いいえ、好きじゃないです',noRow);
    return {unselected,yesShort,yesFull,yesOmitResp,yesC4,yesPolarityMismatch,yesEuphemism,yesRespOnly,noShort};
   });
   check(p81Results.unselected,false,'p81 unselected rejected');
   check(p81Results.yesShort,true,'p81 affirmative model accepted');
   check(p81Results.yesFull,true,'p81 affirmative full-element accepted');
   check(p81Results.yesOmitResp,true,'p81 affirmative omission accepted');
   check(p81Results.yesC4,true,'p81 C4 adjacent repeat accepted');
   check(p81Results.yesPolarityMismatch,false,'p81 polarity contradiction rejected');
   check(p81Results.yesEuphemism,false,'p81 euphemistic double negative きらいじゃないです rejected');
   check(p81Results.yesRespOnly,false,'p81 response word only (with punctuation/filler) rejected');
   check(p81Results.noShort,true,'p81 negative model accepted');
  }
  if(name==='practice8.2'){
   await p.locator('#speechStyleControl [data-value="formal"]').click();
   const p82Results=await p.evaluate(()=>{
    p82Test.choices.delete('yn-0-a');
    const unselectedRow=p82Test.rowsFor(2)[0][1];
    const unselected=p82Test.evaluateAnswer('はい、します',unselectedRow);
    p82Test.choices.set('yn-0-a','yes');
    const yesRow=p82Test.rowsFor(2)[0][1];
    const yesAccepted=p82Test.evaluateAnswer('はい、します',yesRow);
    const yesFull=p82Test.evaluateAnswer('はい、誕生日に、何か、します',yesRow);
    const yesPolarityMismatch=p82Test.evaluateAnswer('いいえ、何も、しません',yesRow);
    const yesRespOnly=p82Test.evaluateAnswer('はい',yesRow);
    const yesFillerRespOnly=p82Test.evaluateAnswer('えーと、はい、',yesRow);
    const yesMissingPred=p82Test.evaluateAnswer('はい、誕生日に何か',yesRow);
    const yesC4=p82Test.evaluateAnswer('はいはい、誕生日に誕生日にします',yesRow);
    p82Test.choices.set('yn-0-a','no');
    const noRow=p82Test.rowsFor(2)[0][1];
    const noAccepted=p82Test.evaluateAnswer('いいえ、何も、しません',noRow);
    const noPolarityMismatch=p82Test.evaluateAnswer('はい、します',noRow);
    const noRespOnly=p82Test.evaluateAnswer('いいえ',noRow);
    const noFillerRespOnly=p82Test.evaluateAnswer('あの、いいえ。',noRow);
    const noMissingPred=p82Test.evaluateAnswer('いいえ、誕生日に何も',noRow);
    const noC4=p82Test.evaluateAnswer('いいえいいえ、何もしません',noRow);
    return {unselected,yesAccepted,yesFull,yesPolarityMismatch,yesRespOnly,yesFillerRespOnly,yesMissingPred,yesC4,noAccepted,noPolarityMismatch,noRespOnly,noFillerRespOnly,noMissingPred,noC4};
   });
   check(p82Results.unselected,'mismatch','p82 unselected state');
   check(p82Results.yesAccepted,'accepted','p82 affirmative accepted');
   check(p82Results.yesFull,'accepted','p82 affirmative full accepted');
   check(p82Results.yesPolarityMismatch,'mismatch','p82 affirmative polarity contradiction');
   check(p82Results.yesRespOnly,'incomplete','p82 affirmative response word only -> incomplete');
   check(p82Results.yesFillerRespOnly,'incomplete','p82 affirmative filler + punctuation response word only -> incomplete');
   check(p82Results.yesMissingPred,'incomplete','p82 affirmative missing predicate -> incomplete');
   check(p82Results.yesC4,'accepted','p82 affirmative C4 adjacent repeat -> accepted');
   check(p82Results.noAccepted,'accepted','p82 negative accepted');
   check(p82Results.noPolarityMismatch,'mismatch','p82 negative polarity contradiction');
   check(p82Results.noRespOnly,'incomplete','p82 negative response word only -> incomplete');
   check(p82Results.noFillerRespOnly,'incomplete','p82 negative filler + punctuation response word only -> incomplete');
   check(p82Results.noMissingPred,'incomplete','p82 negative missing predicate -> incomplete');
   check(p82Results.noC4,'accepted','p82 negative C4 adjacent repeat -> accepted');
  }
  if(name==='practice7.3'){
   for(const style of ['formal','informal','casual']){
    await p.locator('#speechStyleControl [data-value="'+style+'"]').click();
    const ending=style==='formal'?'いました':style==='informal'?'いた':'た';
    for(const time of ['今朝','けさ','今日の朝'])check(await p.evaluate(a=>qaMatch(a),time+'友達に会って'+ending),true,'p73 this morning alias '+style+'/'+time);
    for(const time of ['昨夜','昨晩','さくや','さくばん','昨日の晩'])check(await p.evaluate(a=>qaMatch(a,2),time+'出かけて'+ending),true,'p73 last night alias '+style+'/'+time);
    for(const [time,i,verb]of [['先ほど',4,'電話をかけて'],['昨日のお昼',3,'お風呂に入って']])check(await p.evaluate(({a,i})=>qaMatch(a,i),{a:time+verb+ending,i}),true,'p73 English cue synonym '+time);
    check(await p.evaluate(a=>qaMatch(a),'昨夜友達に会って'+ending),false,'p73 night is not morning');
    check(await p.evaluate(a=>qaMatch(a,2),'今朝出かけて'+ending),false,'p73 morning is not night');
   }
   await p.locator('#speechStyleControl [data-value="formal"]').click();
   await p.locator('#speechStyleControl [data-value="formal"]').click();
   for(const [text,section,index,want] of [
    ['母を手伝っていました',1,0,true],['昨日の午前中母を手伝っていました',1,0,true],
    ['私は昨日の午前中母を手伝っていました',1,0,true],['昨日の午後母を手伝っていました',1,0,false],
    ['去年まで持っていました',2,0,true],['去年まで車を持っていました',2,0,true],
    ['私は去年まで車を持っていました',2,0,true],['去年まで自転車を持っていました',2,0,false],
    ['去年まで持っています',2,0,false],['持っていました',2,0,false]
   ])check(await p.evaluate(({text,section,index})=>conversationMatch(text,section,index),{text,section,index}),want,'p73 conversation '+text);
   check(await p.evaluate(()=>conversationModel(1,0)),'ははをてつだっていました。','p73 short model');
   for(const style of ['informal','casual']){
    await p.locator('#speechStyleControl [data-value="'+style+'"]').click();
    const end=style==='casual'?'てた':'ていた';
    for(const text of ['去年まで持っ'+end,'去年まで車を持っ'+end,'私は去年まで車を持っ'+end])
     check(await p.evaluate(text=>conversationMatch(text,2,0),text),true,'p73 '+style+' full/short '+text);
   }
  }
  // Symbols are audited, not broadened in this change.
  if(name==='composition1')check(await p.evaluate(()=>compositionBestDiff('天気がいいです【】',['天気がいいです']).cost===0),false,'composition synthetic brackets unchanged');
  if(name==='pronunciation2')check(await p.evaluate(()=>p2BestDiff('天気がいいです【】',['天気がいいです']).correct),true,'p2 brackets already ignored');
  if(name==='practice7.3'){
   check(await p.evaluate(()=>DrillAnswer.collapseAdjacentRepeats('はいはい会っていました')),'はい会っていました','C4 adjacent yes repeat');
   check(await p.evaluate(()=>DrillAnswer.collapseAdjacentRepeats('今日の午前中今日の午前中会っていました')),'今日の午前中会っていました','C4 adjacent time repeat');
   check(await p.evaluate(()=>DrillAnswer.collapseAdjacentRepeats('今日友達と今日会いました')),'今日友達と今日会いました','C4 non-adjacent repeat not collapsed');
   check(await p.evaluate(()=>DrillAnswer.isResponseWordOnly('はい')),true,'response word only: はい');
   check(await p.evaluate(()=>DrillAnswer.isResponseWordOnly('はい、')),true,'response word only: はい、');
   check(await p.evaluate(()=>DrillAnswer.isResponseWordOnly('えーと、いいえ。')),true,'response word only: えーと、いいえ。');
   check(await p.evaluate(()=>DrillAnswer.isResponseWordOnly('はい、会っていました')),false,'response word with predicate is not response-word-only');
   check(await p.evaluate(()=>DrillAnswer.expandYnAlternatives('今日の午前中友達と会っていました',['morning','meet_friend']).includes('今朝友達に会っていました')),true,'common Y/N alternatives expansion');
  }
  assert.deepEqual(errors,[],name+' browser errors');await p.close();
 }
 await browser.close();console.log('PASS answer rules',count);
})().catch(e=>{console.error(e);process.exit(1)});
