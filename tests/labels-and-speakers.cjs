// Learner-facing labels must agree with models without changing perspective IDs.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(__dirname,'practice21.cjs'),'utf8');
const mock=source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
 const check=(a,b,label)=>{assert.deepEqual(a,b,label);checks++};
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.addInitScript('('+mock.trim()+')()');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://names.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'image/png'}):r.fulfill({status:404,body:''});});
 await page.goto('http://names.test/index.html');
 for(const [name,title]of [['practice1.1','Practice 1.1: N₁はN₂です'],['practice1.2','Practice 1.2: N₁はN₂ですか']]){
  check(await page.locator(`a[href="${name}.html"]`).textContent(),title,'Index names the current noun pattern');
 }
 for(const name of ['practice1.1','practice1.2']){
  await page.goto('http://names.test/'+name+'.html');const title=`Practice ${name.slice(8)}: N₁はN₂です${name.endsWith('2')?'か':''}`;
  check((await page.locator('h1').textContent()).trim(),title,'visible noun pattern');check(await page.title(),title,'browser title matches');
 }
 for(const name of ['practice2.1','practice2.2','practice2.3']){
  await page.goto('http://names.test/'+name+'.html');
  async function visibleLabels(){
   const result=await page.evaluate(()=>{
    const c=document.body.cloneNode(true);c.querySelectorAll('script,style,.tooltip-tip,.custom-tip-box').forEach(e=>e.remove());
    const labels=[...document.querySelectorAll('.p21-person-caption,.p21-distance-person,.p2x-person,.p23-city-person')].map(e=>e.textContent.trim());
    return {old:/[ABC]さん|[ABC]\s*·\s*[QA]:|[ABC] is (?:speaking|calling)|[ABC]🔊きく/.test(c.textContent),roles:/Question:|Response:/.test(c.textContent),labels};
   });
   check(result.old,false,name+' no obsolete person names in cues/models/controls');check(result.roles,false,name+' compact role names');
   check(result.labels.length>0&&result.labels.every(s=>['X','Y','Z'].includes(s)),true,name+' all image labels use new names: '+JSON.stringify(result.labels));
  }
  await visibleLabels();
  for(const theme of ['light','dark']){await page.emulateMedia({colorScheme:theme});await page.locator('.example-box').first().screenshot({path:'/tmp/'+name+'-new-names-'+theme+'.png'});}await page.emulateMedia({colorScheme:'light'});
  check(await page.evaluate(()=>['Xさん','Yさん','Zさん'].map(s=>[practice2Normalize(s),practice2Normalize(SpeakerGuide.readNames(s))])),[['えっくすさん','えっくすさん'],['わいさん','わいさん'],['ぜっとさん','ぜっとさん']],name+' written and spoken names compare equally');
  check(await page.evaluate(()=>['Xさん','Yさん','Zさん'].map(s=>practice2SpeechText(s))),['えっくすさん','わいさん','ぜっとさん'],name+' explicit Japanese TTS names');
  check(await page.evaluate(()=>['エックスさん','ワイさん','ゼットさん'].map(s=>practice2Normalize(s))),['えっくすさん','わいさん','ぜっとさん'],name+' STT katakana name readings');
  check(await page.evaluate(()=>['xさん','ｙさん','Ｚさん'].map(s=>practice2Normalize(s))),['えっくすさん','わいさん','ぜっとさん'],name+' STT letter case and fullwidth names');
  check(await page.evaluate(()=>SpeakerGuide.readNames('MaxさんとXYZさん')), 'MaxさんとXYZさん',name+' do not rewrite the last letter of a longer name');
  for(const [oldKey,label]of [['A','X'],['B','Y'],['C','Z']])check(await page.evaluate(k=>SpeakerGuide.name(k),oldKey),label,'stable perspective ID maps to visible name');
  const switchers=await page.locator('[data-set-state]').evaluateAll(es=>es.map(e=>({key:e.dataset.setState,n:e.querySelectorAll('button').length})));
  for(const {key,n}of switchers){for(let i=1;i<n;i++){await page.locator(`[data-set-state="${key}"] button`).nth(i).click();await visibleLabels();}await page.locator(`[data-set-state="${key}"] button`).first().click();}
  if(name==='practice2.1'){await page.locator('.p21-drill1 > .p21-set-switcher button').nth(1).click();await visibleLabels();}
 }
 for(const name of ['practice1.2','practice7.1','practice7.2','practice7.3','practice8.1']){
  await page.goto('http://names.test/'+name+'.html');
  const labels=await page.locator('.example-box .example-label-title').allTextContents();
  check(await page.locator('.example-box .conversation-role-circle').allTextContents().then(xs=>xs.includes('Q')),true,name+' Question is Q');check(await page.locator('.example-box .conversation-role-circle').allTextContents().then(xs=>xs.includes('A')),true,name+' Answer is A');
  check(labels.some(s=>/Question:|Response:/.test(s)),false,name+' old full labels removed');
 }
 check(errors,[],'no runtime errors');await browser.close();console.log('PASS labels and speakers',checks);
})().catch(e=>{console.error(e);process.exit(1)});
