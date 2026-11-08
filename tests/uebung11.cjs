// Verification script for Deutsche Übung 1.1: nach / in / zum / zur
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'uebung1.1.html');
const jsPath = path.join(root, 'uebung1.1.js');
const cssPath = path.join(root, 'style.css');
const indexPath = path.join(root, 'index.html');

console.log('Testing Deutsche Übung 1.1 static and structural contracts...');

// 1. Check file existence
assert.ok(fs.existsSync(htmlPath), 'uebung1.1.html must exist');
assert.ok(fs.existsSync(jsPath), 'uebung1.1.js must exist');

// 2. Check index.html link
const indexHtml = fs.readFileSync(indexPath, 'utf8');
assert.ok(indexHtml.includes('uebung1.1.html'), 'index.html must link to uebung1.1.html');
assert.ok(indexHtml.includes('Deutsche Übung 1.1'), 'index.html link must mention Deutsche Übung 1.1');

// 3. Check HTML structure
const html = fs.readFileSync(htmlPath, 'utf8');
assert.ok(html.includes('id="germanVarietyControl"'), 'HTML must have germanVarietyControl');
assert.ok(html.includes('data-value="DE"') && html.includes('data-value="AT"') && html.includes('data-value="CH"'), 'Variety control must have DE, AT, CH options');
assert.ok(html.includes('id="toggleRecordMode"'), 'HTML must have Autostop toggle');
assert.ok(html.includes('id="togglePlaybackMode"'), 'HTML must have Autoplay toggle');
assert.ok(html.includes('id="voiceSelect"'), 'HTML must have Voice selector');
assert.ok(html.includes('drill-audio-session.js'), 'HTML must load drill-audio-session.js');
assert.ok(html.includes('uebung1.1.js'), 'HTML must load uebung1.1.js');

// 4. Check CSS additions in style.css
const css = fs.readFileSync(cssPath, 'utf8');
assert.ok(css.includes('.uebung11-page .uebung-copy-area'), 'style.css must have copy-area rules for uebung11');
assert.ok(css.includes('.uebung-supplement-badge'), 'style.css must have supplement badge rules');

// 5. Check JS code contract
const js = fs.readFileSync(jsPath, 'utf8');

// 5.1 Drills data check: 4 drills, each with 1 Ex and 3 Items
const expectedDrillTitles = [
    'Drill 1: nach — Cities & Countries',
    'Drill 2: in — Countries with Articles (Akkusativ)',
    'Drill 3: zum — Masculine & Neuter Destinations',
    'Drill 4: zur — Feminine Destinations'
];
for (const title of expectedDrillTitles) {
    assert.ok(js.includes(title), `JS must define ${title}`);
}

// 5.2 Check Drill 4 Item 3 regional configuration
assert.ok(js.includes('die Schule / gehen'), 'Drill 4 must include die Schule / gehen');
assert.ok(js.includes('Ich gehe zur Schule.'), 'Must include Ich gehe zur Schule.');
assert.ok(js.includes('Ich gehe in die Schule.'), 'Must include Ich gehe in die Schule.');

// 5.3 Check DrillAudio configuration and speech ordering
assert.ok(js.includes('DrillAudio.configure'), 'JS must configure DrillAudio');
assert.ok(js.includes('DrillAudio.getUserMedia'), 'JS must use DrillAudio.getUserMedia');
assert.ok(js.includes('DrillAudio.playRelay'), 'JS must use DrillAudio.playRelay');
assert.ok(js.includes('DrillAudio.speak'), 'JS must speak utterances through DrillAudio.speak');
assert.ok(js.indexOf('u.onend =') < js.indexOf('DrillAudio.speak(u)'), 'u.onend must be assigned before DrillAudio.speak');
assert.ok(js.indexOf('u.onerror =') < js.indexOf('DrillAudio.speak(u)'), 'u.onerror must be assigned before DrillAudio.speak');

// 5.4 Check Copy my sentences
assert.ok(js.includes('Copy my sentences'), 'JS must implement Copy my sentences');
assert.ok(js.includes('Copy your drill results to review or share.'), 'JS must implement helper text');
assert.ok(js.includes('navigator.clipboard.writeText'), 'JS must use clipboard API');

// 5.5 Check Example & Drill 1 UI improvements (Ex-1 ~ Ex-5, Dr1-1 ~ Dr1-2)
assert.ok(js.includes('isDrill1 ? "drill-example-table" : "recording-table drill-example-table"'), 'Drill 1 Ex table must use drill-example-table without recording-table');
assert.ok(js.includes('if (!isDrill1) {\n                exCueTd.append(node("strong", "example-label-title", "Ex: "));\n            }'), 'Ex: title must only be appended to non-Drill 1 examples');
assert.ok(js.includes('tooltip-wrap') && js.includes('target-word'), 'Drill 1 cue must use tooltip-wrap with target-word in hover mode');
assert.ok(js.includes('alignDrill1Cues'), 'JS must include alignDrill1Cues for Dr1 cue alignment');
assert.ok(css.includes('.uebung11-page #drill1 .example-box .drill-example-table'), 'style.css must have Drill 1 Ex grid rules');
assert.ok(css.includes('.uebung11-page #drill1 .drill-row .recording-table'), 'style.css must have Drill 1 Dr1 grid rules');

// 5.6 Check Drill 1 Cue non-wrapping and intrinsic measurement contracts
assert.ok(
    css.includes('.uebung11-page #drill1 .drill-row .recording-table .drill-cue-cell') &&
    css.includes('white-space: nowrap !important;'),
    'Drill 1 cue cell must enforce white-space: nowrap !important to prevent unwanted wrapping'
);
assert.ok(
    js.includes('copy.querySelectorAll(".tooltip-tip, .custom-tip-box").forEach(t => t.remove());'),
    'alignDrill1Cues must exclude hidden tooltip text when measuring natural width'
);
assert.ok(
    js.includes('width: "max-content"') && js.includes('whiteSpace: "nowrap"'),
    'alignDrill1Cues must measure natural unconstrained width using max-content and nowrap'
);

console.log('PASS: All structural and contract tests passed successfully.');
