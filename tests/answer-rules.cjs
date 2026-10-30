// Text judgment regression. These tests do not claim microphone recognition accuracy.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','composition1','pronunciation2'];
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
   for(const a of ['会っていました','はい会っていました','今日の午前中会っていました','今日の午前中今日の午前中会っていました','友達に友達に会っていました','はいはい会っていました'])check(await p.evaluate(a=>qaMatch(a),a),true,'p73 allowed '+a);
   for(const a of ['今日の午後会っていました','昨日の夜会っていました','今日の午前中昨日の夜会っていました','会っていました？','会っていましたか','はい'])check(await p.evaluate(a=>qaMatch(a),a),false,'p73 reject '+a);
   for(const [a,expected] of [['会っていませんでした',true],['今日の午前中会っていませんでした',true],['昨日の夜会っていませんでした',false],['はい会っていませんでした',false],['いいえ会っていました',false]])check(await p.evaluate(a=>qaMatch(a,0,'no'),a),expected,'p73 negative '+a);
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
  if(name==='practice7.1')check(await p.evaluate(()=>practice71Normalize('はい私は今本を読んでいます')===practice71Normalize('はい読んでいます')),true,'p71 full first-person response');
  if(name==='practice7.2'){
   check(await p.evaluate(()=>practice7Normalize('はい私は家の電話番号を覚えています')===practice7Normalize('はい覚えています')),true,'p72 full first-person response');
   check(await p.evaluate(()=>practice7Normalize('私を家の電話番号を覚えています')===practice7Normalize('はい覚えています')),false,'p72 self subject を rejected');
   check(await p.evaluate(()=>practice7Normalize('私は太っています')===practice7Normalize('はい太っています')),false,'p72 cannot replace father subject with self');
  }
  if(name==='practice1.2'){
   await p.locator('#speechStyleControl [data-value="formal"]').click();

   // Use the real row callbacks and saved-result predicate, not a synthetic matcher.
   const yes=p.locator('#drill1Container button[aria-pressed]').filter({hasText:'🙆'}).first();
   if(await yes.getAttribute('aria-pressed')!=='true')await yes.click();
   const out=await p.evaluate(()=>{
    isAutoPlay=false;
    const key='p2_drill1_a_0',v=practice2State.views[key];
    const refs=practice2State.replyReferences[key](),full=refs[0],short=refs[1];
    return [short,full,full.replace('はい','いいえ')].map(text=>{
     processResult(text,short,()=>short,v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);
     return [text,practice2State.savedResults[key].isCorrect];
    });
   });
   check(JSON.stringify(out),JSON.stringify(out.map((v,i)=>[v[0],i<2])),'p12 short/full/polarity');
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
  assert.deepEqual(errors,[],name+' browser errors');await p.close();
 }
 await browser.close();console.log('PASS answer rules',count);
})().catch(e=>{console.error(e);process.exit(1)});
