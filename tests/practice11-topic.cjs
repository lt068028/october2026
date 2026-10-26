const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage();let checks=0;
 const check=(a,b,label)=>{assert.deepEqual(a,b,label);checks++};
 await page.addInitScript(()=>{
  window.spoken=[];
  window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{value:{speaking:false,pending:false,getVoices:()=>[{name:'Japanese',lang:'ja-JP',voiceURI:'ja'}],cancel(){},speak(u){window.spoken.push(u.text);u.onend?.();},addEventListener(){}}});
 });
 await page.route('http://drill.test/**',r=>{
  const file=path.join(__dirname,'..',new URL(r.request().url()).pathname);
  return fs.existsSync(file)?r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'}):r.fulfill({status:404,body:''});
 });
 await page.goto('http://drill.test/practice1.1.html');
 for(const style of ['formal','informal','casual']) {
  await page.locator(`#speechStyleControl [data-value="${style}"]`).click();
  for(const id of ['task2Container','task3Container']) {
   const row=page.locator('#'+id+' .drill-row').first();
   if(id==='task2Container') {
    await row.locator('select').nth(0).selectOption({index:1});await row.locator('select').nth(1).selectOption({index:1});
   } else {
    await row.locator('input').nth(0).fill('わたし');await row.locator('input').nth(1).fill('がくせい');
   }
   check(await row.locator('.prompt-content').textContent().then(t=>t.includes('は')),true,id+' displays topic particle '+style);
   const before=await page.evaluate(()=>spoken.length);
   await row.locator('button').filter({hasText:'🔊きく'}).first().click();
   await page.waitForFunction(n=>spoken.length>n,before);
   check(await page.evaluate(()=>spoken.at(-1).includes('は、')),true,id+' actual TTS text retains topic '+style);
  }
  for(const negative of [false,true]) {
   check(await page.evaluate(negative=>modelSentence('私','学生',negative,true).includes('は、'),negative),true,'positive/negative retain topic');
  }
 }
 check(await page.evaluate(()=>modelSentence('私','学生',false).includes('は、')),false,'D1 Casual remains unchanged');
 check(await page.evaluate(()=>matchesSentence('私学生だよ',expectedSentence('私','学生',false))),true,'existing Casual omission acceptance unchanged');
 await browser.close();console.log('PASS Practice 1.1 topic particle',checks);
})().catch(e=>{console.error(e);process.exit(1)});
