// Verify actual Example-to-Drill spacing and the shared shop image frame.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
 const page=await browser.newPage();
 await page.route('http://spacing.test/**',route=>{
  const f=path.join(root,new URL(route.request().url()).pathname);
  return route.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':f.endsWith('.json')?'application/json':'text/html'});
 });
 for(const width of [600,1440]){
  await page.setViewportSize({width,height:1000});
  for(const name of fs.readdirSync(root).filter(f=>/^(practice|pronunciation|composition).*\.html$/.test(f))){
   await page.goto('http://spacing.test/'+name);
   const gaps=await page.locator('.example-box').evaluateAll(es=>es.map(e=>{
    const next=e.nextElementSibling||(e.parentElement.id==='exampleSectionContainer'?document.querySelector('#task1Container > .info-panel'):null);
    if(!next?.matches('.info-panel,.p21-drill1,.drill-row'))return null;
    return next.getBoundingClientRect().top-e.getBoundingClientRect().bottom;
   }).filter(x=>x!==null));
   for(const gap of gaps){assert.ok(Math.abs(gap-24)<.1,`${name} ${width}px: gap ${gap}`);checks++;}
   if(name==='practice2.2.html'){
    const frames=await page.locator('.example-box .p2x-cropped-picture .p2x-stage').evaluateAll(es=>es.slice(0,3).map(e=>{const r=e.getBoundingClientRect();return[r.width,r.height]}));
    assert.equal(frames.length,3);for(const frame of frames){assert.ok(frame.every((x,i)=>Math.abs(x-frames[0][i])<.1),'all shop Examples use the same frame');checks++;}
   }
   if(name==='practice2.3.html'){
    const placement=await page.locator('.p23-call-note').evaluate(e=>{const a=e.getBoundingClientRect(),h=e.parentElement.querySelector('h2').getBoundingClientRect(),b=e.closest('.example-box').querySelector('.p23-city-stage').getBoundingClientRect();return{above:a.bottom<=b.top,right:a.left>=h.right,inHeader:e.parentElement.classList.contains('p23-example-header')};});
    assert.ok(placement.inHeader&&placement.above&&(width<1000||placement.right),'call note joins the heading above the photograph');checks++;
   }
   if(name==='practice2.1.html'){
    const box=page.locator('.p21-which-example');
    assert.equal(await box.locator('.p21-photo-stage button').count(),2);checks++;
    assert.deepEqual(await box.locator(':scope > p .grammar-highlight').allTextContents(),['どれ']);checks++;
    assert.ok((await box.locator(':scope > p').last().textContent()).includes('あれです'));checks++;
    assert.equal(await box.locator('.p21-thought-cloud path').evaluate(e=>getComputedStyle(e).fill),'rgb(255, 227, 227)');checks++;
    const controls=await box.locator('.p21-which-audio').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),s=e.closest('.p21-photo-stage').getBoundingClientRect();return{speaker:e.dataset.speaker,x:(r.left-s.left)/s.width,right:(r.right-s.left)/s.width,bottom:r.bottom<=s.bottom};}));
    assert.ok(controls[0].x<.15&&controls[1].right>.85&&controls.every(x=>x.bottom),'controls stay beside their speakers');checks++;
   }
  }
 }
 await browser.close();console.log('PASS section spacing and scene frames',checks);
})().catch(e=>{console.error(e);process.exit(1)});
