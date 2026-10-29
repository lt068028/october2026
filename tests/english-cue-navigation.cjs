// English/Japanese cue changes return to Example 1, including from the bottom panel.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('http://navigation.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'text/html'});});let checks=0;
 for(const name of ['practice7.3','practice2.3'])for(const width of [375,600,900,1440])for(const script of ['hiragana','kanji']){
  await p.setViewportSize({width,height:900});await p.goto('http://navigation.test/'+name+'.html');
  await p.locator('#scriptModeControl [data-value="'+script+'"]').click();
  for(const english of [true,false]){
   const toggle=p.locator('.drill-cue-button');await toggle.scrollIntoViewIfNeeded();
   assert.ok(await p.evaluate(()=>scrollY)>1000,'starts from the bottom cue panel');checks++;
   await toggle.click();
   await p.waitForFunction(()=>{const e=document.querySelector('#drill1Container .example-box'),c=getComputedStyle(e),line=parseFloat(c.lineHeight)||parseFloat(c.fontSize)*1.5;return Math.abs(e.getBoundingClientRect().top-line)<2;});
   assert.equal(await p.locator('.drill-cue-button').getAttribute('aria-pressed'),String(english));checks++;
   const gap=await p.locator('#drill1Container .example-box').first().evaluate(e=>{const c=getComputedStyle(e);return[e.getBoundingClientRect().top,parseFloat(c.lineHeight)||parseFloat(c.fontSize)*1.5];});
   assert.ok(Math.abs(gap[0]-gap[1])<2,'Example 1 is one line below viewport top');checks++;
  }
 }
 assert.deepEqual(errors,[]);checks++;await b.close();console.log('PASS English cue navigation',checks);
})().catch(e=>{console.error(e);process.exit(1)});
