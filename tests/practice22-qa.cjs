const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
// Approved Microsoft Fluent Chat Help / Chat 24 Filled paths (MIT).
// Source: https://github.com/microsoft/fluentui-system-icons/tree/main/assets
// Pin these fixtures independently of the runtime helper so a wrong icon cannot self-validate.
const fluentFilledPaths=Object.freeze({
 Question: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3596 22 8.77516 21.6039 7.35578 20.8583L3.06538 21.9753C2.6111 22.0937 2.1469 21.8213 2.02858 21.367C1.99199 21.2266 1.99198 21.0791 2.02855 20.9386L3.1449 16.6502C2.3972 15.2294 2 13.6428 2 12C2 6.47715 6.47715 2 12 2ZM12 15.5C11.4477 15.5 11 15.9477 11 16.5C11 17.0523 11.4477 17.5 12 17.5C12.5523 17.5 13 17.0523 13 16.5C13 15.9477 12.5523 15.5 12 15.5ZM12 6.75C10.4812 6.75 9.25 7.98122 9.25 9.5C9.25 9.91421 9.58579 10.25 10 10.25C10.3797 10.25 10.6935 9.96785 10.7432 9.60177L10.7565 9.37219C10.8205 8.74187 11.3528 8.25 12 8.25C12.6904 8.25 13.25 8.80964 13.25 9.5C13.25 10.0388 13.115 10.3053 12.6051 10.8322L12.3011 11.1414C11.5475 11.926 11.25 12.4892 11.25 13.5C11.25 13.9142 11.5858 14.25 12 14.25C12.4142 14.25 12.75 13.9142 12.75 13.5C12.75 12.9612 12.885 12.6947 13.3949 12.1678L13.6989 11.8586C14.4525 11.074 14.75 10.5108 14.75 9.5C14.75 7.98122 13.5188 6.75 12 6.75Z',
 Answer: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3596 22 8.77516 21.6039 7.35578 20.8583L3.06538 21.9753C2.6111 22.0937 2.1469 21.8213 2.02858 21.367C1.99199 21.2266 1.99198 21.0791 2.02855 20.9386L3.1449 16.6502C2.3972 15.2294 2 13.6428 2 12C2 6.47715 6.47715 2 12 2ZM13.2517 13H8.75L8.64823 13.0068C8.28215 13.0565 8 13.3703 8 13.75C8 14.1297 8.28215 14.4435 8.64823 14.4932L8.75 14.5H13.2517L13.3535 14.4932C13.7196 14.4435 14.0017 14.1297 14.0017 13.75C14.0017 13.3703 13.7196 13.0565 13.3535 13.0068L13.2517 13ZM15.25 9.5H8.75L8.64823 9.50685C8.28215 9.55651 8 9.8703 8 10.25C8 10.6297 8.28215 10.9435 8.64823 10.9932L8.75 11H15.25L15.3518 10.9932C15.7178 10.9435 16 10.6297 16 10.25C16 9.8703 15.7178 9.55651 15.3518 9.50685L15.25 9.5Z',
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
   check(role.paths,[fluentFilledPaths[role.label]],label+' approved 24 Filled path');
   check(role.svg?.viewBox,'0 0 24 24',label+' Filled viewBox');
   check([role.fill,role.stroke,role.strokeWidth],['currentColor',null,null],label+' Filled has no added outline');
   check(role.computedStrokeWidth,'1px',label+' no CSS outline boost');
   check(role.computedStroke,'none',label+' Filled has no computed stroke');
   check(role.svg?.color,dark?'rgb(217, 221, 227)':'rgb(113, 131, 154)',label+' approved theme color');
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
