const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),before=process.argv.includes('--snapshot');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();let checks=0;const findings=new Map();
await p.route('http://cues.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({body:before&&['practice2.1.js','practice2-next.js'].includes(path.basename(f))?require('child_process').execFileSync('git',['show','dc7d12b:'+path.basename(f)],{cwd:root}):fs.readFileSync(f),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'image/png'});});
for(const page of ['practice2.1','practice2.2','practice2.3']){
 await p.goto('http://cues.test/'+page+'.html');
 async function collect(state){const rows=await p.locator('.drill-cue-cell,.p23-example-cue').evaluateAll(es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll('strong,.tooltip-tip,.vocab-inline').forEach(x=>x.remove());return{key:e.closest('tr')?.dataset.speakerRecordingKey||'Example',text:c.textContent.replace(/\s+/g,' ').trim(),words:[...e.querySelectorAll('.target-word')].map(x=>x.textContent)};}));
 for(const r of rows){checks++;if(/\s/.test(r.text)){const key=page+' '+r.key+' '+r.text;const old=findings.get(key)||{page,key:r.key,text:r.text,states:[]};if(!old.states.includes(state))old.states.push(state);findings.set(key,old);}
 if(!before){assert.ok(!/\s[／/]|[／/]\s/.test(r.text),'no padding around cue separators: '+r.text);assert.ok(!/(?:この|その|あの)\s+ひと|(?:この|その|あの)\s+人/.test(r.text),'demonstrative and person stay joined: '+r.text);assert.ok(!/[\p{Script=Hiragana}\p{Script=Han}\p{Script=Katakana}]\s+[\p{Script=Hiragana}\p{Script=Han}\p{Script=Katakana}]/u.test(r.text),'no inserted Japanese cue spaces: '+r.text);}}
 }
 for(const script of ['hiragana','kanji'])for(const hint of ['hover','off','paren']){
  await p.locator(`#scriptModeControl [data-value="${script}"]`).click();await p.locator(`#hintModeControl [data-value="${hint}"]`).click();await collect(script+'/'+hint+' initial');
  const groups=await p.locator('[data-set-state]').evaluateAll(es=>es.map(e=>({key:e.dataset.setState,count:e.querySelectorAll('button').length})));
  for(const g of groups)for(let i=1;i<g.count;i++){await p.locator(`[data-set-state="${g.key}"] button`).nth(i).click();await collect(script+'/'+hint+' '+g.key+'='+i);await p.locator(`[data-set-state="${g.key}"] button`).first().click();}
  if(page==='practice2.1'){await p.locator('.p21-drill1 > .p21-set-switcher button').nth(1).click();await collect(script+'/'+hint+' D1 Set2');await p.locator('.p21-drill1 > .p21-set-switcher button').first().click();}
 }
 if(page!=='practice2.2'){
  await p.locator('.drill-cue-button').click();await collect('English cues');
  const groups=await p.locator('[data-set-state]').evaluateAll(es=>es.map(e=>({key:e.dataset.setState,count:e.querySelectorAll('button').length})));
  for(const g of groups)for(let i=1;i<g.count;i++){await p.locator(`[data-set-state="${g.key}"] button`).nth(i).click();await collect('English cues '+g.key+'='+i);await p.locator(`[data-set-state="${g.key}"] button`).first().click();}
  if(page==='practice2.1'){await p.locator('.p21-drill1 > .p21-set-switcher button').nth(1).click();await collect('English cues D1 Set2');}
 }
}
await b.close();const list=[...findings.values()];const auditDir=path.join(require('os').tmpdir(),'october2026-cue-audit');fs.mkdirSync(auditDir,{recursive:true});fs.writeFileSync(path.join(auditDir,'lesson2-cue-spacing-'+(before?'before':'after')+'.json'),JSON.stringify(list,null,2));console.log('PASS cue audit',checks,'rows;',list.length,'unique cues with spaces');
})().catch(e=>{console.error(e);process.exit(1)});
