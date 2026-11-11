const fs=require('node:fs'),path=require('node:path');
const root=process.argv[2]||path.resolve('diagnostic-artifacts');
const out=path.join(root,'summary.md');
let measurements=[];try{measurements=JSON.parse(fs.readFileSync(path.join(root,'measurements.json'),'utf8'));}catch{}
let summary='';try{summary=fs.readFileSync(path.join(root,'diagnostic-summary.json'),'utf8');}catch{}
let text='# PR #9 width diagnostic\n\n';
text+='Pinned commits: main `74817eb3e5dc3ff30ad6769df673450354910d29`; PR #9 `01e5e49d5a006a7b29602791fa8e606f121dd706`.\n\n';
text+='The diagnostic uses a single runner, browser install and Playwright process for both commits. See `environment.txt`, `measurements.json` and per-commit logs for details.\n\n';
if(summary){const s=JSON.parse(summary);text+=`Collected ${s.totalMeasurements} measurements: ${s.p82} Practice 8.2 width samples and ${s.p11} Practice 1.1 samples. Practice 8.2 samples above its existing +10px test threshold: ${s.failedP82}. Practice 1.1 button-position assertion mismatches: ${s.failedP11Position}.\n\n`;}
text+='## Practice 8.2 saved state\n\n| Commit | Scenario | Script | Theme | Width | Samples | Failed (+10px) | Max excess px |\n|---|---|---|---|---:|---:|---:|---:|\n';
const p82=measurements.filter(x=>x.test==='practice8.2/saved-state');
const groups=new Map();for(const m of p82){const key=[m.commit,m.scenario,m.scriptMode,m.theme,m.innerWidth].join('|');const g=groups.get(key)||{commit:m.commit,scenario:m.scenario,script:m.scriptMode,theme:m.theme,width:m.innerWidth,n:0,fail:0,max:-Infinity};g.n++;if(!m.passed)g.fail++;g.max=Math.max(g.max,m.horizontalExcessPx);groups.set(key,g);}
for(const g of groups.values())text+=`| ${g.commit} | ${g.scenario} | ${g.script} | ${g.theme} | ${g.width} | ${g.n} | ${g.fail} | ${g.max} |\n`;
text+='\n## Practice 1.1 fluid-width positions\n\n| Commit | Hint | Theme | Width | Samples | Position assertion failures | Max horizontal excess px |\n|---|---|---|---:|---:|---:|---:|\n';
const p11=measurements.filter(x=>x.test==='fluid-width/Practice1.1');const groups11=new Map();for(const m of p11){const key=[m.commit,m.hint,m.theme,m.width].join('|');const g=groups11.get(key)||{commit:m.commit,hint:m.hint,theme:m.theme,width:m.width,n:0,fail:0,max:-Infinity};g.n++;if(!m.buttonPositionPass)g.fail++;g.max=Math.max(g.max,m.horizontalExcessPx);groups11.set(key,g);}
for(const g of groups11.values())text+=`| ${g.commit} | ${g.hint} | ${g.theme} | ${g.width} | ${g.n} | ${g.fail} | ${g.max} |\n`;
text+='\n## Existing test outcomes\n\n';
for(const v of ['main','filled']) for(const t of ['existing-qa-icons','existing-fluid-width']) {
 const p=path.join(root,v,`${t}.exit`);let code='not recorded';try{code=fs.readFileSync(p,'utf8').trim();}catch{}
 text+='- '+v+' '+t+': process exit '+code+'; full log: `'+v+'/'+t+'.log`.\n';
}
text+='\n## Existing test log excerpts\n\n';
for(const v of ['main','filled']) for(const t of ['existing-qa-icons','existing-fluid-width']) {
 const p=path.join(root,v,`${t}.log`);let log='';try{log=fs.readFileSync(p,'utf8');}catch{}
 text+='### '+v+' '+t+'\n\n```text\n'+log.split('\n').slice(-80).join('\n')+'\n```\n\n';
}
fs.writeFileSync(out,text);
