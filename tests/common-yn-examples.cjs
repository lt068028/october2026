// Shared Y/N Example contract, checked against the existing pages and Practice 8.1.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
 const eq=(a,e,label)=>{assert.deepEqual(a,e,label);checks++;};
 for(const name of ['practice1.2','practice7.1','practice7.2','practice7.3','practice8.1']){
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(u){spoken.push(u)}}});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};});
  await p.route('http://yn.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'image/png'});});
  await p.goto('http://yn.test/'+name+'.html');
  for(const style of ['formal','informal','casual']){
   await p.locator('#speechStyleControl [data-value="'+style+'"]').click();
   const boxes=await p.locator('.example-box').evaluateAll(es=>es.filter(e=>['🔊🙆','🔊🙅'].every(label=>[...e.querySelectorAll('button')].some(b=>b.textContent.trim()===label))).map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(t=>t.remove());return c.textContent;}));
   eq(boxes.length>0,true,name+' '+style+' has both Example answers');
   eq(boxes.every(s=>/はい|うん/.test(s)&&/いいえ|ううん/.test(s)&&/じゃない|ません|ない|なかった/.test(s)),true,name+' affirmative and negative models visible');
   for(const label of ['🔊🙆','🔊🙅']){
    const before=await p.locator('.answer-choice').evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed')));
    await p.locator('.example-box button').filter({hasText:label}).first().click();
    const text=await p.evaluate(()=>spoken.at(-1)?.text||'');
    eq(Boolean(text),true,name+' independent playback '+label);
    eq(label==='🔊🙅'?/いいえ|ううん|うんん/.test(text):/はい|うん/.test(text),true,name+' matching answer TTS '+label);
    await p.evaluate(()=>spoken.at(-1).onend?.());
    eq(await p.locator('.answer-choice').evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed'))),before,name+' Example does not select Drill answer');
   }
  }
  eq(errors,[],name+' runtime');await p.close();
 }
 await b.close();console.log('PASS shared Y/N Examples',checks);
})().catch(e=>{console.error(e);process.exit(1);});
