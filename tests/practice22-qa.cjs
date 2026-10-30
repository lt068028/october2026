const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(__dirname,'practice2-next.cjs'),'utf8');
const mock=new Function(source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'))+';return mock')();
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage();await p.addInitScript(mock);
 await p.route('http://qa.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({status:fs.existsSync(file)?200:404,body:fs.existsSync(file)?fs.readFileSync(file):'',contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'});});
 await p.goto('http://qa.test/practice2.2.html');
 let count=0;const check=(a,b)=>{assert.deepEqual(a,b);count++};
 for(const width of [375,600,900,1440])for(const dark of [false,true]){
  await p.setViewportSize({width,height:1000});await p.emulateMedia({colorScheme:dark?'dark':'light'});
  const lines=p.locator('.p22-conversation-line');check(await lines.count(),4);
  check(await lines.evaluateAll(es=>es.every(e=>[...e.children].map(c=>c.className).join('|').startsWith('p22-conversation-role|p22-cue-arrow|'))),true);
  check(await p.locator('.p22-role-circle').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderRadius==='50%' && e.textContent.match(/^[QA]$/))),true);
  check(await p.locator('.p22-person-badge').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderRadius==='4px')),true);
  check(await lines.evaluateAll(es=>es.every(e=>e.getBoundingClientRect().right<=innerWidth+1)),true);
  check(await lines.evaluateAll(es=>es.every(e=>getComputedStyle(e).alignItems==='baseline')),true);
  const arrows=await p.locator('.p2x-food-example .p22-example-arrow').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));check(Math.abs(arrows[0]-arrows[1])<1,true);
  check(await p.locator('.p22-person-badge').evaluateAll(es=>es.every(e=>getComputedStyle(e).backgroundColor==='rgb(255, 254, 240)' && Number(getComputedStyle(e).fontWeight)>=700)),true);
 }
 // Audit every visible audio row, then every alternate set in D1-D5.
 async function auditAudio(){
  const controls=p.locator('.p2x-example .p2x-audio button, .p22-conversation-line button, tr[data-speaker-recording-key] .recording-actions button:first-child');
  const n=await controls.count();
  for(let i=0;i<n;i++){
   const b=controls.nth(i);await b.click();
   check(await b.evaluate(e=>{
    const row=e.closest('tr'),ex=e.closest('.example-box'),who=row?.dataset.drillSpeaker||e.dataset.speaker||ex?.querySelector('.p2x-picture')?.dataset.speaker;
    const badge=row?.querySelector('.p22-person-badge')||e.closest('.p22-conversation-line')?.querySelector('.p22-person-badge')||[...ex.querySelectorAll('.p2x-speaker-group .p22-person-badge')].find(x=>x.dataset.person===who);
    const picture=row?row.closest('[id$="Container"]')?.querySelector(':scope > .p2x-picture'):ex?.querySelector('.p2x-picture');
    const image=picture?.querySelector('.p2x-person[data-person="'+who+'"]');
    return !!badge?.classList.contains('is-speaking')&&!!image?.classList.contains('is-speaking');
   }),true);
   await p.evaluate(()=>t.spoken.at(-1).onend());check(await p.locator('.p22-person-badge.is-speaking').count(),0);
  }
 }
 await auditAudio();
 for(let drill=1;drill<=5;drill++){
  const switcher=p.locator('#drill'+drill+'Container .p21-set-switcher button');
  if(await switcher.count()>1){await switcher.nth(1).click();await auditAudio();}
 }
 const button=p.locator('.p2x-price-example > .p22-conversation-line button').first();await button.click();
 check(await p.locator('.p2x-price-example > p .p22-person-badge.is-speaking').allTextContents(),['X']);
 check(await p.locator('.p22-role-circle.is-speaking').count(),0);
 await p.evaluate(()=>t.spoken.at(-1).onend());check(await p.locator('.p22-person-badge.is-speaking').count(),0);
 await p.locator('#drill5Container .p21-set-switcher button').nth(1).click();
 check(await p.locator('#drill5Container .p22-role-circle').allTextContents(),['Q','A','Q','A','Q','A']);
 for(const selector of ['.p2x-price-example','.p2x-food-example']){await p.locator(selector).screenshot({path:'/tmp/'+selector.slice(1)+'-qa.png'});}
 await p.goto('http://qa.test/practice2.3.html');check(await p.locator('.p22-role-circle').count(),0);
 console.log('PASS '+count);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
