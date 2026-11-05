// Scoped Practice 8.3 regression: speech styles, TTS input and saved-state preservation.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const audioSource=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8');
const mock=audioSource.slice(audioSource.indexOf('function mock()'),audioSource.indexOf('(async()=>'));
const examplePlainAnswers=['先生が、教える。','りんごが、ある。','本屋の店員が、親切だ。','このRPGが、おもしろい。','２番が、来る。','４ページが、わからない。','スペイン語の本が、ない。','その部屋が、静かだ。','水曜日が、ひまだ。'];
const plainGolden=[
 ['だれが、てつだう？','田中さんが、りょうりする。'],
 ['何が、こうえんにいる？','コイが、泳いでいる。'],
 ['だれが、勉強が得意？','川村さんが、歌うのがきらいだ。'],
 ['何が、楽しい？','英語のクラスが、難しい。'],
 ['どれが、はじまっている？','ダンスのイベントが、おわっている。'],
 ['どこが、作る？','木村さんのチームが、休む。'],
 ['どれが、高い？','妹のペンが、新しい。'],
 ['どこが、ちかい？','駅のトイレが、きれいだ。'],
 ['いつが、いい？','午後が、忙しい。']
];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript('('+mock.trim()+')();');
 await page.route('http://practice83.test/**',route=>{
  const file=path.join(root,new URL(route.request().url()).pathname);
  if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
  let source=fs.readFileSync(file);
  if(file.endsWith('practice8.3.js')){
   const s=source.toString(),i=s.lastIndexOf('})();');
   source=s.slice(0,i)+"window.audit83={\n rowsFor,makeRow,matchesAnswer,keyFor,modelHTML,displayKana,saved,choices,views,showResult,\n getStyle:()=>speechStyle,\n busy:(kind,value)=>{if(kind==='preparing')preparing=value;else session=value?{key:'test-only',manual:true,stopping:false}:null;sync();},\n collect:()=>{\n  const original=[currentD1Set,currentD2Set,currentD3Set,currentD4Set],groups=[];\n  [d1Sets,d2Sets,d3Sets,d4Sets].forEach((sets,di)=>sets.forEach((set,idx)=>{\n   if(di===0)currentD1Set=idx;if(di===1)currentD2Set=idx;if(di===2)currentD3Set=idx;if(di===3)currentD4Set=idx;\n   groups.push(rowsFor(di).flat());\n  }));\n  [currentD1Set,currentD2Set,currentD3Set,currentD4Set]=original;return groups;\n },\n examples:()=>[exSets1,exSets2,exSets3,exSets4].flatMap((sets,si)=>sets.flatMap((s,i)=>[\n  makeRow('ex'+(si+1)+'-'+i+'-q1',{text:s.q1,cueIds:s.c1},{kind:'Q'}),\n  makeRow('ex'+(si+1)+'-'+i+'-q2',{text:s.q2,cueIds:s.c2},{kind:''}),\n  makeRow('ex'+(si+1)+'-'+i+'-a',{text:s.a,accept:s.accept||[],cueIds:s.ca},{kind:'A'})\n ]))\n};"+s.slice(i);
  }
  return route.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
 });
 await page.goto('http://practice83.test/practice8.3.html');
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
 const original=await page.evaluate(()=>audit83.collect().map(g=>g.map(r=>({id:r.id,text:r.text,refs:r.refs}))));
 check(original.flat().length,60,'all sixty Drill rows are covered');
 const savedSnapshot=await page.evaluate(()=>{
  const a=audit83,r=a.rowsFor(0)[0][0],key=a.keyFor(r);
  const value={url:'blob:style-preservation',raw:r.text,modelText:r.text,modelHira:r.hira,refs:[...r.refs],correct:true};
  a.saved.set(key,value);a.choices.set('style-test-choice','retained');a.showResult(key);
  return {key,value};
 });
 for(const mode of ['kanji','hiragana']){
  await page.locator('#scriptModeControl [data-value="'+mode+'"]').click();
  for(const style of ['formal','informal','casual','formal']){
   const previous=await page.evaluate(()=>audit83.getStyle());
   await page.locator('#speechStyleControl [data-value="'+style+'"]').click();
   check(await page.evaluate(()=>audit83.getStyle()),style,'style control updates');
   if(previous!==style)check(await page.evaluate(()=>speechSynthesis.current===null),true,'style change cancels old playback');
   const data=await page.evaluate(()=>{
    const a=audit83,groups=a.collect(),examples=a.examples();
    return {
     groups:groups.map(g=>g.map(r=>({id:r.id,text:r.text,hira:r.hira,refs:r.refs,key:a.keyFor(r),
      correct:a.matchesAnswer(r.text,r),kanaCorrect:a.matchesAnswer(r.hira,r),
      noGa:a.matchesAnswer(r.text.replace('が、','、'),r)}))),
     examples:examples.map(r=>({text:r.text,hira:r.hira,correct:a.matchesAnswer(r.text,r)})),
     visible:[...document.querySelectorAll('.p81-model')].map(e=>e.textContent)
    };
   });
   check(data.groups.map(g=>g.map(r=>r.id)),original.map(g=>g.map(r=>r.id)),'row identities survive all styles');
   check(data.groups.flat().every(r=>r.correct&&r.kanaCorrect),true,'all model and hiragana answers accepted');
   check(data.groups.flat().every(r=>!r.noGa),true,'subject が remains required in full models');
   check(data.examples.every(r=>r.correct),true,'Example references follow current style');
   check(data.visible,data.examples.map(r=>mode==='kanji'?r.text:r.hira),'displayed Examples update with style and script');
   if(style==='formal')check(data.groups.map(g=>g.map(r=>r.text)),original.map(g=>g.map(r=>r.text)),'Formal unchanged');
   else{
    check(data.groups.flat().every(r=>!/(?:ます|ません|です)(?:か)?[。？?]?$/.test(r.text)),true,'no polite endings in plain models');
    check(data.groups.map(g=>[g[0].text,g.at(-1).text]),plainGolden.map(([q,a])=>[q,style==='casual'?a.replace(/。$/,'よ。'):a]),'independent goldens for every Set');
    check(data.examples.filter((r,i)=>i%3===2).map(r=>r.text),examplePlainAnswers.map(text=>style==='casual'?text.replace(/。$/,'よ。'):text),'independent Example answers include existence and negative predicates');
    check(data.groups.flat().every(r=>r.text.endsWith('？')||r.text.endsWith(style==='casual'?'よ。':'。')),true,'Casual よ is declarative-only');
   }
   const variants=await page.evaluate(()=>{
    const a=audit83,g=a.collect(),verb=g[0][0],progressive=g[1].at(-1),na=g[7].at(-1);
    return {
     plainVerb:a.matchesAnswer('だれが、てつだう？',verb),
     writtenQuestion:a.matchesAnswer('だれが、てつだうか。',verb),
     plainNa:a.matchesAnswer('駅のトイレが、きれいだ。',na),
     finalParticle:a.matchesAnswer(na.text.replace(/(?:よ)?。$/,'よね。'),na),
     wrongVerb:a.matchesAnswer('だれが、りょうりする？',verb),
     wrongPolarity:a.matchesAnswer('駅のトイレが、きれいじゃない。',na),
     contracted:a.matchesAnswer('コイが、泳いでるよ。',progressive),
     ongoing:a.matchesAnswer('コイが、泳ぐ。',progressive)
    };
   });
   check(variants.plainVerb,style!=='formal','plain question regression');
   check(variants.writtenQuestion,style!=='formal','plain written question with か');
   check(variants.plainNa,style!=='formal','plain na-adjective answer');
   check(variants.finalParticle,true,'final-particle tolerance');
   check(variants.wrongVerb,false,'different predicate rejected');
   check(variants.wrongPolarity,false,'opposite polarity rejected');
   check(variants.ongoing,false,'progressive is not simple present');
   if(style==='casual')check(variants.contracted,true,'Casual contraction');
   await page.locator('#drill1 .example-box button').first().click();
   check(await page.evaluate(()=>t.spoken.at(-1).text),data.examples[0].text,'Example TTS matches canonical model');
   for(let di=0;di<4;di++)for(let set=0;set<[2,2,2,3][di];set++){
    await page.locator('#drill'+(di+1)+' .p21-set-switcher button').nth(set).click();
    check(await page.evaluate(()=>audit83.getStyle()),style,'Set switch keeps style');
    const expected=await page.evaluate(di=>audit83.rowsFor(di)[0][0].text,di);
    await page.locator('#drill'+(di+1)+' .p81-card .recording-actions button').first().click();
    check(await page.evaluate(()=>t.spoken.at(-1).text),expected,'Drill TTS follows Set and style');
   }
   check(await page.evaluate(key=>JSON.stringify(audit83.saved.get(key)),savedSnapshot.key),JSON.stringify(savedSnapshot.value),'saved snapshot is not regraded or rewritten');
   check(await page.evaluate(()=>audit83.choices.get('style-test-choice')),'retained','answer state retained');
  }
 }
 for(const kind of ['preparing','recording']){
  const current=await page.evaluate(()=>audit83.getStyle());
  await page.evaluate(kind=>audit83.busy(kind,true),kind);
  check(await page.locator('#speechStyleControl button').evaluateAll(bs=>bs.every(b=>b.disabled)),true,'busy locks style buttons');
  await page.evaluate(()=>document.querySelector('#speechStyleControl [data-value="casual"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
  check(await page.evaluate(()=>audit83.getStyle()),current,'busy guard rejects forced style event');
  await page.evaluate(kind=>audit83.busy(kind,false),kind);
 }
 check(errors,[],'no initial or runtime errors');
 await browser.close();console.log('PASS Practice 8.3 speech-style regression',checks);
})().catch(e=>{console.error(e);process.exit(1)});
