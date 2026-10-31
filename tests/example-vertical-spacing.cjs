const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(__dirname,'practice2-next.cjs'),'utf8');
const mock=new Function(source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'))+';return mock')();
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();await p.addInitScript(mock);let count=0;const eq=(a,e,label)=>{assert.deepEqual(a,e,label);count++};
await p.route('http://vertical.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'',contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':f.endsWith('.json')?'application/json':'text/html'});});
for(const name of ['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','practice8.1','practice8.2','pronunciation1','pronunciation2','composition1']){
 await p.goto('http://vertical.test/'+name+'.html');
 for(const width of [600,1440])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:1000});await p.emulateMedia({colorScheme:theme});
  const state=await p.evaluate(()=>({tokens:['--example-row-gap','--example-wrap-gap','--example-content-gap'].map(t=>getComputedStyle(document.documentElement).getPropertyValue(t).trim()),grids:[...document.querySelectorAll('.example-box .drill-example-table,.example-box .p73-example-table,.p81-example,.p23-conversation-models,.p21-which-models,.p2x-speaker-sentences')].map(e=>({display:getComputedStyle(e).display,gap:getComputedStyle(e).rowGap})),overflow:[...document.querySelectorAll('.example-box')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)}));
  eq(state.tokens,['8px','4px','12px'],name+' tokens');eq(state.grids.every(x=>x.display!=='grid'||x.gap==='8px'),true,name+' shared grid spacing');eq(state.overflow,[],name+' fits '+width+theme);
  if(name==='practice2.2'){
   eq(await p.locator('.p22-conversation-line').evaluateAll(es=>es.every(e=>getComputedStyle(e).marginTop==='0px'&&getComputedStyle(e).marginBottom==='0px')),true,'no browser paragraph margin');
   for(const sel of ['.p2x-speaker-sentences','.p2x-price-example','.p2x-food-example']){
    const gap=await p.locator(sel).first().evaluate(e=>{const rows=e.querySelectorAll(':scope > p');return rows[1].getBoundingClientRect().top-rows[0].getBoundingClientRect().bottom;});eq(Math.abs(gap-8)<.1,true,sel+' actual 8px gap');
   }
   eq(await p.locator('.p2x-speaker-guide').count(),0,'Who guides removed');
  }
 }
}
await p.goto('http://vertical.test/practice2.2.html');await p.setViewportSize({width:1440,height:1000});await p.locator('.p2x-price-example').screenshot({path:'/tmp/p22-rhythm-rest.png'});await p.locator('.p2x-price-example > p button').last().click();await p.locator('.p2x-price-example').screenshot({path:'/tmp/p22-rhythm-speaking.png'});
await b.close();console.log('PASS Example vertical spacing '+count);
})().catch(e=>{console.error(e);process.exit(1)});
