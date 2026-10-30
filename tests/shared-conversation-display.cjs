const{chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),s=fs.readFileSync(path.join(__dirname,'practice2-next.cjs'),'utf8');
const mock=new Function(s.slice(s.indexOf('function mock()'),s.indexOf('(async()=>'))+';return mock')();
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let count=0;const eq=(a,e,label)=>{assert.deepEqual(a,e,label);count++};
const p=await b.newPage();await p.addInitScript(mock);await p.route('http://shared.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'',contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':f.endsWith('.json')?'application/json':'text/html'});});
for(const name of ['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','practice8.1','pronunciation1','pronunciation2','composition1']){
 const errors=[];const error=e=>errors.push(e.message);p.on('pageerror',error);await p.goto('http://shared.test/'+name+'.html');
 for(const width of [375,600,900,1440])for(const dark of [false,true]){
  await p.setViewportSize({width,height:1100});await p.emulateMedia({colorScheme:dark?'dark':'light'});
  eq(await p.locator('.conversation-role-circle').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderRadius==='50%'&&/^[QA]$/.test(e.textContent))),true,name+' role circles');
  eq(await p.locator('.conversation-person[data-person="A"],.conversation-person[data-person="B"]').evaluateAll((es,dark)=>es.every(e=>{const st=getComputedStyle(e),bg=e.dataset.person==='A'?(dark?'rgb(196, 181, 253)':'rgb(109, 40, 217)'):(dark?'rgb(103, 232, 249)':'rgb(125, 211, 252)');return st.backgroundColor===bg&&st.borderRadius==='4px'}),dark),true,name+' person palette');
  eq(await p.locator('.example-box').evaluateAll(es=>{const tips=[...document.querySelectorAll('.tooltip-tip,.custom-tip-box')].filter(e=>getComputedStyle(e).visibility==='hidden');const styles=tips.map(e=>e.style.display);tips.forEach(e=>e.style.display='none');const overflow=es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className);tips.forEach((e,i)=>e.style.display=styles[i]);return overflow;}),[],name+' Example fits '+width);
 }
 if(['practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','practice8.1'].includes(name))eq(await p.locator('.conversation-role-circle').count()>0,true,name+' adopted roles');
 else eq(await p.locator('.conversation-person').count(),0,name+' no invented people');
 if(name.startsWith('practice2.')){
  eq(await p.locator('.p21-photo-context:not(.p23-call-note)').count(),0,name+' no Who guide');
  if(name==='practice2.3')eq(await p.locator('.p23-call-note').textContent(),'X is calling Y and talking about Z.','scenario retained');
 }else eq(await p.locator('.conversation-person').count(),0,name+' no added speaker');
 eq(errors,[],name+' runtime');p.off('pageerror',error);
}
await p.goto('http://shared.test/practice2.2.html');await p.setViewportSize({width:1440,height:1100});
// Questions, focus, response, next question, cancellation: never leak the unknown target.
for(const drill of [3,5])for(const set of [0,1]){
 await p.locator('#drill'+drill+'Container .p21-set-switcher button').nth(set).click();
 const scene='#drill'+drill+'Container > [data-wh-targets]',rows=p.locator('#drill'+drill+'Container tr');
 for(let i=0;i<await rows.count();i+=2){
  const q=rows.nth(i).locator('.recording-actions button').first(),a=rows.nth(i+1).locator('.recording-actions button').first();
  await q.focus();eq(await p.locator(scene+' .is-target').count(),0,'question focus has no answer');
  await q.click();eq(await p.locator(scene+' .is-target').count(),0,'which question has no answer');await p.evaluate(()=>t.spoken.at(-1).onend());
  await a.click();eq(await p.locator(scene+' .is-target').count(),1,'demonstrative response identifies target');await p.evaluate(()=>t.spoken.at(-1).onend());eq(await p.locator(scene+' .is-target').count(),0,'no previous response target');
 }
}
await p.locator('#drill4Container .p21-set-switcher button').nth(1).click();const q=p.locator('[data-speaker-recording-key="p22_people_classmate_q_2"] button').first();await q.focus();eq(await p.locator('#drill4Container > .p2x-picture .is-target').count(),0,'which person focus');await q.click();eq(await p.locator('#drill4Container > .p2x-picture .is-target').count(),0,'which person question');await p.evaluate(()=>t.spoken.at(-1).onend());
// Microphone preparation must not reveal the question's answer either.
await p.evaluate(()=>{t.defer=true;for(const id of ['togglePlaybackMode','toggleRecordMode']){const e=document.getElementById(id);if(e.checked)e.click();}});
for(const drill of [3,5])for(const part of [0,1]){
 const row=p.locator('#drill'+drill+'Container tr').nth(part),record=row.locator('.recording-actions button').nth(1),scene='#drill'+drill+'Container > [data-wh-targets]';
 await record.click();eq(await p.locator(scene+' .is-target').count(),part,'target in microphone preparation');
 await p.evaluate(()=>t.requests.at(-1)());await p.waitForFunction(()=>Boolean(activeRecognitionSession));eq(await p.locator(scene+' .is-target').count(),part,'target in recording');
 await row.locator('.recording-actions button').nth(2).click();await p.waitForFunction(()=>!activeRecognitionSession&&!practice2State.startingRow);eq(await p.locator(scene+' .is-target').count(),0,'stop clears target');
}
await p.goto('http://shared.test/practice2.1.html');
const ex=p.locator('.p21-which-example'),qs=ex.locator('.p21-which-models button');
await qs.nth(0).click();eq(await ex.locator('.p21-drill-item.is-target').getAttribute('data-zone'),'A','known intro target');await p.evaluate(()=>t.spoken.at(-1).onend());
await qs.nth(1).click();eq(await ex.locator('.p21-drill-item.is-target').count(),0,'unknown which Example');await p.evaluate(()=>t.spoken.at(-1).onend());
await qs.nth(2).click();eq(await ex.locator('.p21-drill-item.is-target').getAttribute('data-zone'),'far','known Example reply');await p.evaluate(()=>t.spoken.at(-1).onend());
await p.locator('#drill4Container button').click();eq(await p.locator('#drill2Container .conversation-role-circle').count()>0,true,'English cues keep role circles');eq(await p.locator('#drill2Container .conversation-person').count()>0,true,'English cues keep people');
await p.goto('http://shared.test/practice2.3.html');
for(const control of await p.locator('.p23-example-audio button').all()){
 const who=await control.getAttribute('data-speaker');await control.click();
 eq(await p.locator('.conversation-person.is-speaking:not([data-conversation-image])').allTextContents(),[who==='A'?'X':'Y'],'city Example text speaker follows image');
 eq(await p.locator('.p23-city-person.is-speaking').allTextContents(),[who==='A'?'X':'Y'],'city image speaker');await p.evaluate(()=>t.spoken.at(-1).onend());
 eq(await p.locator('.conversation-person.is-speaking').count(),0,'city speaker clears');
}
console.log('PASS shared conversation display '+count);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
