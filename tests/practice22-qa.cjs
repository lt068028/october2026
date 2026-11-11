const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
// Approved Microsoft Fluent Chat Help / Chat 24 Regular paths (MIT).
// Source: https://github.com/microsoft/fluentui-system-icons/tree/main/assets
// Pin these fixtures independently of the runtime helper so a wrong icon cannot self-validate.
const fluentRegularPaths=Object.freeze({
 Question: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM12 15.5C12.5523 15.5 13 15.9477 13 16.5C13 17.0523 12.5523 17.5 12 17.5C11.4477 17.5 11 17.0523 11 16.5C11 15.9477 11.4477 15.5 12 15.5ZM12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5C14.75 10.5108 14.4525 11.074 13.6989 11.8586L13.5303 12.0303C12.9084 12.6522 12.75 12.9163 12.75 13.5C12.75 13.9142 12.4142 14.25 12 14.25C11.5858 14.25 11.25 13.9142 11.25 13.5C11.25 12.4892 11.5475 11.926 12.3011 11.1414L12.4697 10.9697C13.0916 10.3478 13.25 10.0837 13.25 9.5C13.25 8.80964 12.6904 8.25 12 8.25C11.3528 8.25 10.8205 8.74187 10.7565 9.37219L10.75 9.5C10.75 9.91421 10.4142 10.25 10 10.25C9.58579 10.25 9.25 9.91421 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75Z',
 Answer: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM8.75 13H13.2483C13.6625 13 13.9983 13.3358 13.9983 13.75C13.9983 14.1297 13.7161 14.4435 13.35 14.4932L13.2483 14.5H8.75C8.33579 14.5 8 14.1642 8 13.75C8 13.3703 8.28215 13.0565 8.64823 13.0068L8.75 13H13.2483H8.75ZM8.75 9.5H15.2545C15.6687 9.5 16.0045 9.83579 16.0045 10.25C16.0045 10.6297 15.7223 10.9435 15.3563 10.9932L15.2545 11H8.75C8.33579 11 8 10.6642 8 10.25C8 9.8703 8.28215 9.55651 8.64823 9.50685L8.75 9.5H15.2545H8.75Z',
});
const source=fs.readFileSync(path.join(__dirname,'practice2-next.cjs'),'utf8');
const mock=new Function(source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'))+';return mock')();
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage();await p.addInitScript(mock);
 await p.route('http://qa.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({status:fs.existsSync(file)?200:404,body:fs.existsSync(file)?fs.readFileSync(file):'',contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':file.endsWith('.png')?'image/png':'text/html'});});
 await p.goto('http://qa.test/practice2.2.html');
 assert.equal(await p.locator('.p2x-speaker-guide').count(),0);
 let count=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 for(const width of [375,600,900,1440])for(const dark of [false,true]){
  await p.setViewportSize({width,height:1000});await p.emulateMedia({colorScheme:dark?'dark':'light'});
  const lines=p.locator('.p22-conversation-line');check(await lines.count(),4);
  check(await lines.evaluateAll(es=>es.every(e=>e.children[0].classList.contains('conversation-role')&&e.children[1].classList.contains('p22-cue-arrow'))),true);
  const roles=await p.locator('.p22-role-circle').evaluateAll(es=>es.map(e=>{
   const svg=e.querySelector('svg'),paths=svg?[...svg.querySelectorAll('path')]:[],s=getComputedStyle(e),path=paths[0];
   return {label:e.getAttribute('aria-label'),role:e.getAttribute('role'),svgCount:e.querySelectorAll('svg').length,imageCount:e.querySelectorAll('img').length,
    svg:svg?{namespace:svg.namespaceURI,fluent:svg.classList.contains('fluent-icon'),question:svg.classList.contains('fluent-icon-question'),answer:svg.classList.contains('fluent-icon-answer'),hidden:svg.getAttribute('aria-hidden'),viewBox:svg.getAttribute('viewBox'),color:getComputedStyle(svg).color}:null,
    paths:paths.map(p=>p.getAttribute('d')),fill:path?.getAttribute('fill'),stroke:path?.getAttribute('stroke'),strokeWidth:path?.getAttribute('stroke-width'),computedStrokeWidth:path?getComputedStyle(path).strokeWidth:null,computedStroke:path?getComputedStyle(path).stroke:null,
    border:s.borderWidth,radius:s.borderRadius,background:s.backgroundColor};
  }));
  check(roles.length>0,true,'Fluent conversation roles are present');
  for(const [i,role]of roles.entries()){
   const label=`role ${i} at ${width}px/${dark?'dark':'light'}`;
   check(['Question','Answer'].includes(role.label),true,label+' accessible parent label');
   check(role.role,'img',label+' parent image role');
   check([role.svgCount,role.imageCount],[1,0],label+' one SVG replaces the old image');
   check(role.svg?.namespace,'http://www.w3.org/2000/svg',label+' SVG namespace');
   check(role.svg?.fluent,true,label+' Fluent SVG');
   check([role.svg?.question,role.svg?.answer],role.label==='Question'?[true,false]:[false,true],label+' correct Question/Answer kind');
   check(role.paths,[fluentRegularPaths[role.label]],label+' approved 24 Regular path');
   check(role.svg?.viewBox,'0 0 24 24',label+' Regular viewBox');
   check([role.fill,role.stroke,role.strokeWidth],['currentColor','currentColor','0.45'],label+' approved outline attributes');
   check(role.computedStrokeWidth,'0.45px',label+' outline survives CSS');
   check(role.computedStroke,role.svg?.color,label+' outline follows theme color');
   check(role.svg?.hidden,'true',label+' decorative SVG');
   check([role.border,role.radius,role.background],['0px','0px','rgba(0, 0, 0, 0)'],label+' no enclosing border or background');
  }
  check(await p.locator('.p22-person-badge').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderRadius==='4px')),true);
  check(await lines.evaluateAll(es=>es.every(e=>e.getBoundingClientRect().right<=innerWidth+1)),true);
  check(await lines.evaluateAll(es=>es.every(e=>getComputedStyle(e).alignItems==='baseline')),true);
  for(const example of ['.p2x-price-example','.p2x-food-example']){
   const arrows=await p.locator(example+' .p22-example-arrow').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));check(Math.abs(arrows[0]-arrows[1])<1,true);
   const audio=await p.locator(example+' > p > button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));check(Math.abs(audio[0]-audio[1])<1,true);
  }
  check(await p.locator('.p22-person-badge,.p2x-person').evaluateAll((es,dark)=>es.every(e=>{
   const expected=dark?{A:['rgb(196, 181, 253)','rgb(46, 16, 101)'],B:['rgb(103, 232, 249)','rgb(8, 51, 68)']}:{A:['rgb(109, 40, 217)','rgb(255, 255, 255)'],B:['rgb(125, 211, 252)','rgb(255, 255, 255)']};
   const s=getComputedStyle(e),want=expected[e.dataset.person];return !want||(s.backgroundColor===want[0]&&s.color===want[1]&&Number(s.fontWeight)>=700);
  }),dark),true);
 }
 // Audit every visible audio row, then every alternate set in D1-D5.
 async function auditAudio(){
  const controls=p.locator('.p2x-example .p2x-audio button, .p22-conversation-line button, tr[data-speaker-recording-key] .recording-actions > button:first-child');
  const n=await controls.count();
  for(let i=0;i<n;i++){
   const b=controls.nth(i);await b.click();
   check(await b.evaluate(e=>{
    const row=e.closest('tr'),ex=e.closest('.example-box'),who=row?.dataset.drillSpeaker||e.dataset.speaker||ex?.querySelector('.p2x-picture')?.dataset.speaker;
    const badge=row?.querySelector('.p22-person-badge')||e.closest('.p22-conversation-line')?.querySelector('.p22-person-badge')||[...ex.querySelectorAll('.p2x-speaker-group .p22-person-badge')].find(x=>x.dataset.person===who);
    const picture=row?row.closest('[id$="Container"]')?.querySelector(':scope > .p2x-picture'):ex?.querySelector('.p2x-picture');
    const image=picture?.querySelector('.p2x-person[data-person="'+who+'"]');
    const dark=matchMedia('(prefers-color-scheme:dark)').matches;
    const activeColor=who==='A'?(dark?'rgb(196, 181, 253)':'rgb(109, 40, 217)'):(dark?'rgb(103, 232, 249)':'rgb(125, 211, 252)');
    return !!badge?.classList.contains('is-speaking')&&!!image?.classList.contains('is-speaking')&&[badge,image].every(x=>{const s=getComputedStyle(x);return s.backgroundColor===activeColor&&s.animationName==='p22-speaker-focus'&&s.outlineColor==='rgb(255, 255, 255)'&&x.getAnimations()[0].effect.getKeyframes().every(f=>f.boxShadow.includes('rgb(51, 65, 85)'))&&x.getAnimations()[0].effect.getKeyframes().some(f=>f.boxShadow.includes('rgb(255, 255, 255)'));});
   }),true);
   await p.evaluate(()=>t.spoken.at(-1).onend());check(await p.locator('.p22-person-badge.is-speaking').count(),0);
  }
 }
 await auditAudio();
 for(let drill=1;drill<=5;drill++){
  const switcher=p.locator('#drill'+drill+'Container .p21-set-switcher button');
  if(await switcher.count()>1){await switcher.nth(1).click();await auditAudio();}
 }
 check(await p.locator('[data-speaker-recording-key="p22_people_classmate_q_2"] .drill-cue-cell').evaluate(e=>{const c=e.cloneNode(true);c.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(x=>x.remove());c.querySelectorAll('.conversation-role-circle').forEach(x=>x.textContent=x.getAttribute('aria-label')==='Question'?'Q':'A');return c.textContent.replace(/\s/g,'')}),'QXYさんのクラスメート/どのひと');
 const button=p.locator('.p2x-price-example > .p22-conversation-line button').first();await button.click();
 check(await p.locator('.p2x-price-example > p .p22-person-badge.is-speaking').allTextContents(),['X']);
 check(await p.locator('.p22-role-circle.is-speaking').count(),0);
 await p.evaluate(()=>t.spoken.at(-1).onend());check(await p.locator('.p22-person-badge.is-speaking').count(),0);
 await p.locator('#drill5Container .p21-set-switcher button').nth(1).click();
 check(await p.locator('#drill5Container .p22-role-circle').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))),['Question','Answer','Question','Answer','Question','Answer']);
 for(const selector of ['.p2x-price-example','.p2x-food-example']){await p.locator(selector).screenshot({path:'/tmp/'+selector.slice(1)+'-qa.png'});}
 await p.emulateMedia({reducedMotion:'reduce'});await button.click();
 check(await p.locator('.p22-person-badge.is-speaking').evaluate(e=>{const s=getComputedStyle(e);return s.animationName==='none'&&s.boxShadow.includes('rgb(255, 255, 255)')&&s.boxShadow.includes('rgb(51, 65, 85)')&&s.boxShadow.endsWith('8px')}),true);
 await p.evaluate(()=>t.spoken.at(-1).onend());await p.emulateMedia({reducedMotion:'no-preference'});
 for(const theme of ['light','dark']){await p.emulateMedia({colorScheme:theme});await p.locator('.p2x-price-example').screenshot({path:'/tmp/p22-speaker-colors-'+theme+'.png'});}
 await p.goto('http://qa.test/practice2.3.html');check(await p.locator('.p22-role-circle').count(),0);
 check(await p.locator('.p2x-person').evaluateAll(es=>es.every(e=>!['rgb(109, 40, 217)','rgb(196, 181, 253)','rgb(75, 85, 99)','rgb(209, 213, 219)'].includes(getComputedStyle(e).backgroundColor))),true);
 console.log('PASS '+count);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
