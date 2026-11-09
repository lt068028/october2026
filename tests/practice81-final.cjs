// Final-page coverage supplement: content, Beyond, hints and pair state contracts.
// Browser speech/microphone APIs are controlled doubles; no acoustic-quality claim.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8'),mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
const master={};const md=fs.readFileSync(path.join(root,'docs/GENKI_KANJI_MASTER.md'),'utf8');
for(const m of md.matchAll(/### 第(\d+)課[^\n]*\n[\s\S]*?\n([一-龯々](?: [一-龯々])+)\n/g))for(const k of m[2].split(' '))master[k]=Number(m[1]);
async function open(browser,hasTouch=false){const page=await browser.newPage({viewport:{width:375,height:1000},hasTouch});page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));await page.addInitScript('('+mock.trim()+')();');
 await page.route('http://final81.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});let s=fs.readFileSync(f,'utf8');if(f.endsWith('practice8.1.js'))s=s.replace(/\}\)\(\);\s*$/,'window.final81={rowsFor,choices,saved,views,render,showResult,keyFor,matchesAnswer,words,comparisonOptionOrder};})();');return r.fulfill({body:s,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});});await page.goto('http://final81.test/practice8.1.html');return page;}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),page=await open(browser);
 eq(Object.keys(master).length,317,'official-verified master parsed');
 eq(await page.locator('.info-panel-title').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());return c.textContent;})),['Drill 1: Nounが、すき↔️Verbのが、すき','Drill 2: Verbのが、すき↔️きらい？','Drill 3: Verbのが、じょうず↔️にがて','Drill 4: Degrees of Intensity','Drill 5: Compare じょうず・とくい・へた・にがて'],'approved titles');
 eq(await page.locator('.info-panel-desc').allTextContents(),['💡Say what you like and what you like doing.','💡Ask and answer about likes and dislikes.','💡Describe what other people are good at or struggle with.','💡Express different degrees of intensity using different actions.','💡Choose the adjective that matches each label. Consider its meaning and how it sounds.'],'approved instructions');
 eq(await page.locator('#drill5 .p81-scenario').allTextContents(),['1. Own ability','2. Own ability','3. Own ability',"4. Others' ability","5. Others' ability","6. Others' ability","7. Others' ability"],'D5 order/category labels');
 eq(await page.evaluate(()=>final81.rowsFor(4).map(rs=>rs[0].comparisonBase)),['comparison-1','comparison-2','comparison-3','comparison-0','comparison-4','comparison-5','comparison-6'],'stable IDs after reordering');
 eq(await page.evaluate(()=>final81.rowsFor(2)[0][0].text),'クラスメートは、ノートを取るのが、上手です。','note-taking row');
 const order=await page.evaluate(()=>[...final81.comparisonOptionOrder]);
 for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
  await page.locator('#scriptModeControl [data-value="'+mode+'"]').click();await page.locator('#hintModeControl [data-value="'+hint+'"]').click();eq(await page.evaluate(()=>[...final81.comparisonOptionOrder]),order,'option order retained');
  const cues=await page.locator('.p81-example-cue .target-word,.prompt-label .target-word').allTextContents();
  eq([...new Set(cues.join('').match(/\p{Script=Han}/gu)||[])].filter(k=>!master[k]||master[k]>8),[],'all visible cue kanji learned by L8');
  const compounds=await page.locator('.p81-compound-word').allTextContents();eq([...new Set(compounds)].sort(),['りょこうする','さんぽする','せんたくする','そうじする','りょうりする'].sort(),'five compound cues');
 }
 await page.locator('#hintModeControl [data-value="hover"]').click();
 eq(await page.locator('#drill5 .p81-nuance-note:not([hidden])').count(),0,'Notice hidden before recording');
 await page.evaluate(()=>{const a=final81,r=a.rowsFor(4)[0][0];a.choices.set(r.id,r.adjective);a.render();const rr=a.rowsFor(4)[0][0],key=a.keyFor(rr);a.saved.set(key,{raw:'',modelText:rr.text,refs:rr.refs,correct:false});a.showResult(key);});
 eq(await page.locator('#drill5 .p81-nuance-note:not([hidden])').count(),0,'text-only state is not recording');
 await page.evaluate(()=>{const a=final81,r=a.rowsFor(4)[0][0],key=a.keyFor(r);a.saved.set(key,{url:'blob:notice-test',raw:'',modelText:r.text,refs:r.refs,correct:false});a.showResult(key);});
 eq(await page.locator('#drill5 .p81-nuance-note:not([hidden])').count(),1,'one recorded pair Notice');eq(await page.locator('#drill5 .p81-nuance-note:not([hidden]) .p81-nuance-note-text').count(),2,'both meanings in one Notice');
 for(const scheme of ['light','dark'])for(const mode of ['kanji','hiragana']){
  await page.emulateMedia({colorScheme:scheme});await page.locator('#scriptModeControl [data-value="'+mode+'"]').click();await page.locator('#unlearnedAccordion').evaluate(e=>e.open=true);
  eq(await page.locator('.unlearned-vocab-group li').count(),6,'Words count');eq(await page.locator('#unlearnedKanjiGroup li').count(),11,'Kanji item count');
  eq(await page.locator('#unlearnedKanjiGroup').isVisible(),mode==='kanji','Kanji visibility');eq(await page.locator('#unlearnedCounts').textContent(),'ことば(6語)'+(mode==='kanji'?' 漢字(14字)':''),'counts match visibility');
  eq(await page.locator('.unlearned-list li').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width>0).every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth+1;})),true,'Beyond items fit without clipping');
  const wordText=await page.locator('.unlearned-vocab-group code').allTextContents();eq(wordText,['バイク','アニメ','ふく','ギター','ひく','りょうり'],'Words both scripts');
  if(mode==='kanji'){
   const entries=await page.locator('#unlearnedKanjiGroup li').evaluateAll(es=>es.map(e=>({styles:[...e.querySelectorAll('code')].map(c=>({color:getComputedStyle(c).color,weight:getComputedStyle(c).fontWeight})),label:e.textContent.match(/【(.*?)】/)[1],phrases:[...e.querySelectorAll('.unlearned-kanji-phrase')].map(p=>({word:p.textContent.split('（')[0],reading:p.textContent.split('（')[1]?.slice(0,-1),html:p.innerHTML}))})));
   for(const entry of entries){eq(entry.styles.every(s=>s.color===(scheme==='light'?'rgb(3, 105, 161)':'rgb(56, 189, 248)')&&s.weight==='700'),true,'Beyond blue/bold');const levels=[];for(const phrase of entry.phrases){const unknown=[...phrase.word].filter(k=>/\p{Script=Han}/u.test(k)&&(!master[k]||master[k]>8));for(const k of unknown){const l=master[k]?'L'+master[k]:'Genki外';if(!levels.includes(l))levels.push(l);}const marked=[...phrase.html.split('（')[0].matchAll(/<code>(.*?)<\/code>/g)].map(m=>m[1]).join('');eq(marked,unknown.join(''),'unlearned characters only '+phrase.word);eq(Boolean(phrase.reading),true,'reading exists '+phrase.word);const expectedReading={'旅行':'りょ','上手':'ず','好き':'す','写真':'しゃしん','姉':'あね','妹':'いもうと','弾く':'ひ','得意':'とくい','散歩':'さんぽ','撮る':'と','苦手':'にがて'};eq([...phrase.html.split('（')[1].matchAll(/<code>(.*?)<\/code>/g)].map(m=>m[1]).join(''),expectedReading[phrase.word],'reading emphasis '+phrase.word);}eq(entry.label,levels.join(' / '),'Kanji lesson matches master');}
  }
 }
 for(const mode of ['kanji','hiragana']){
  await page.locator('#scriptModeControl [data-value="'+mode+'"]').click();
  const phrase=page.locator('#drill1 .p81-example-cue .target-word').filter({hasText:'りょこうする'});await phrase.hover();const tip=phrase.locator('..').locator('.tooltip-tip');eq(await tip.textContent(),'ryokō suru, to travel','whole compound hover');eq(await tip.evaluate(e=>getComputedStyle(e).visibility),'visible','hover visible');
  const rect=await tip.boundingBox();eq(rect.x>=0&&rect.x+rect.width<=375,true,'tooltip fits viewport');
 }
 await page.locator('#unlearnedAccordion').evaluate(e=>e.open=true);await page.waitForFunction(()=>sessionStorage.getItem('p81-unlearned-open')==='true');await page.reload();eq(await page.locator('#unlearnedAccordion').evaluate(e=>e.open),true,'open reload persistence');
 await page.locator('#unlearnedAccordion').evaluate(e=>e.open=false);await page.waitForFunction(()=>sessionStorage.getItem('p81-unlearned-open')==='false');await page.reload();eq(await page.locator('#unlearnedAccordion').evaluate(e=>e.open),false,'closed reload persistence');

 for(const style of ['formal','informal','casual'])for(const mode of ['kanji','hiragana'])for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('#speechStyleControl [data-value="'+style+'"]').click();await page.locator('#scriptModeControl [data-value="'+mode+'"]').click();
  const bounds=await page.locator('.p81-model').evaluateAll(es=>es.flatMap(e=>{let c=document.createRange();c.selectNodeContents(e);return [...c.getClientRects()].filter(r=>r.width).map(r=>[r.left,r.right]);}));
  eq(bounds.every(([l,r])=>l>=-1&&r<=width+1),true,'Example text in viewport '+style+mode+width);
 }
 await page.locator('#speechStyleControl [data-value="casual"]').click();
 eq(await page.evaluate(()=>{const r=final81.rowsFor(3)[1][0];r.pending=false;return [r.text.endsWith('じゃないよ。'),final81.matchesAnswer(r.text.replace('じゃないよ。','じゃない。'),r)];}),[true,true],'Casual negative よ and legacy answer both accepted');
 await page.locator('#speechStyleControl [data-value="formal"]').click();await page.locator('#scriptModeControl [data-value="kanji"]').click();
 await page.locator('#togglePlaybackMode').evaluate(e=>e.checked&&e.click());await page.locator('#toggleRecordMode').evaluate(e=>e.checked&&e.click());
 await page.evaluate(()=>{const a=final81;a.saved.clear();a.choices.set('degree-0','washDish');for(const r of a.rowsFor(4).flat())a.choices.set(r.id,r.adjective);a.render();});
 const records=await page.evaluate(()=>[final81.rowsFor(0)[0][1],final81.rowsFor(1)[0][0],final81.rowsFor(2)[0][0],final81.rowsFor(3)[0][0],final81.rowsFor(4)[0][0]].map(r=>({id:r.id,text:r.text,key:final81.keyFor(r)})));
 for(const r of records){const n=await page.evaluate(()=>t.recognitions.length);await page.locator('[data-row="'+r.id+'"] button').filter({hasText:'🎙️とる'}).click();await page.waitForFunction(n=>t.recognitions.length>n,n);
  await page.evaluate(text=>{const value=[{transcript:text}];value.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[value]});},r.text);await page.locator('.stop-btn-active').click();await page.waitForFunction(key=>final81.saved.has(key),r.key);
  eq(await page.evaluate(key=>{const v=final81.saved.get(key);return [v.raw,v.correct,Boolean(v.url)];},r.key),[r.text,true,true],'actual record/STT/save '+r.id);
 }
 const touch=await open(browser,true);const first=touch.locator('#drill1 .p81-example-cue .tooltip-wrap').first();await first.tap();eq(await first.evaluate(e=>e.classList.contains('tap-tip-open')),true,'touch opens hint');await first.tap();eq(await first.evaluate(e=>e.classList.contains('tap-tip-open')),false,'retap closes hint');await first.tap();await touch.locator('h1').tap();eq(await touch.locator('.tap-tip-open').count(),0,'outside tap closes hint');
 await touch.locator('#drill3 select').first().evaluate(e=>{e.addEventListener('click',ev=>{window.selectPrevented=ev.defaultPrevented;});});await touch.locator('#drill3 select').first().tap();eq(await touch.evaluate(()=>window.selectPrevented),false,'native select click not intercepted');
 eq(page.errors,[],'desktop runtime');eq(touch.errors,[],'touch runtime');await browser.close();console.log('PASS final supplement',checks);
})().catch(e=>{console.error(e.message.slice(0,3500));process.exit(1)});
