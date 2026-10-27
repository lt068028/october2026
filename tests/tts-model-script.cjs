// Representative model paths: script display must not change TTS text. No acoustic claim.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 let count=0;
 for(const name of ['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2']) {
  const p=await browser.newPage();
  await p.addInitScript(()=>{
   window.ttsAudit=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(u){ttsAudit.push(u)}}});
  });
  await p.route('http://audit.test/**',r=>{
   const f=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(f))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':'text/html'});
  });
  await p.goto('http://audit.test/'+name+'.html');
  const texts=[];
  for(const mode of ['hiragana','kanji']) {
   await p.evaluate(mode=>document.querySelector(`#scriptModeControl [data-value="${mode}"]`)?.click(),mode);
   const selector=name==='practice2.1'?'.p21-item-audio [data-speaker="A"][data-object="1"]':(name==='practice2.2'||name==='practice2.3')?'.p2x-example [data-speaker="A"][data-zone="A"]':null;
   const button=selector?p.locator(selector).first():p.locator('button').filter({hasText:/^🔊きく/}).first();
   await button.click();texts.push(await p.evaluate(()=>{const u=ttsAudit.at(-1);if(!u)throw Error('No TTS model');const text=u.text;u.onend?.();return text;}));
  }
  assert.equal(texts[0],texts[1],name+' display-independent TTS');count++;
  assert.match(texts[0],/\p{Script=Han}/u,name+' canonical model contains kanji');count++;
  console.log(name+': '+texts[0]);await p.close();
 }
 await browser.close();console.log('PASS TTS model script',count);
})().catch(e=>{console.error(e);process.exit(1)});
