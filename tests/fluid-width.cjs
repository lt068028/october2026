// Practice 7.3 fixed 130% preview and Practice 1.2 grammar emphasis.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),key='october2026.practice12.displaySize';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};
 async function open(context,name='practice1.2'){
  const page=await context.newPage();page.setDefaultTimeout(10000);page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.route('http://drill.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html'});
  });
  await page.goto('http://drill.test/'+name+'.html');return page;
 }


 const context=await browser.newContext();
 const names=['index','practice1.1','practice1.2','practice2.1','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2'];
 for(const name of names) {
  const p=await open(context,name);await p.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
  for(const theme of ['light','dark']) for(const hint of name==='index'?['off']:['off','hover','paren']) {
   await p.emulateMedia({colorScheme:theme});await p.setViewportSize({width:1440,height:900});
   await p.evaluate(hint=>document.querySelector(`#hintModeControl [data-value="${hint}"]`)?.click(),hint);
   const positions=()=>p.evaluate(()=>{
    const left=document.body.getBoundingClientRect().x;
    return [...document.querySelectorAll('.recording-actions,.example-box')].map(e=>{
     const buttons=[...e.querySelectorAll('button')];
     return buttons.slice(0,3).map(b=>Math.round((b.getBoundingClientRect().x-left)*100)/100);
    });
   });
   await p.evaluate(()=>{const result=document.querySelector('.recording-controls .result-text');if(result)result.textContent='認識された長い文の表示を確認します。キューと音声操作の位置を保ったまま、停止ボタンより後の領域で表示します。';});
   const baseline=await positions();
   const baselineResultSpace=await p.locator('.recording-controls').first().count()?await p.locator('.recording-controls').first().evaluate(e=>e.getBoundingClientRect().width):null;
   for(const width of [1440,1442,1600,1920,2080,2560]) {
    await p.setViewportSize({width,height:900});
    const box=await p.locator('body').boundingBox();
    check(Math.abs(box.width-Math.min(width-64,Math.max(1280,Math.min(1600,width*.5+560))))<1,true,name+' smooth width '+width);
    check(box.x>=32,true,name+' minimum side gutters '+width);
    if(baselineResultSpace!==null)check(Math.abs((await p.locator('.recording-controls').first().evaluate(e=>e.getBoundingClientRect().width)-baselineResultSpace)-(box.width-1280))<2,true,name+' growth allocated to result side '+width);
    const now=await positions();
    check(now.every((a,i)=>a.every((x,j)=>Math.abs(x-baseline[i][j])<2)),true,name+' extra width stays after controls '+width+'/'+hint);
    check(await p.locator('.example-box,.drill-row,.settings-row,.pitch-card').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,name+' wide overflow '+width+'/'+hint);
   }
  }
  check(p.errors,[],name+' runtime errors');await p.close();console.log('WIDE',name);
 }
 await browser.close();console.log('PASS fluid page width',checks);
})().catch(e=>{console.error(e);process.exit(1)});
