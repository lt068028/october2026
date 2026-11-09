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

// 5.5 Check Example & Drill UI standardization (Drills 1–4)
assert.ok(js.includes('node("table", "drill-example-table")'), 'All Ex tables must use drill-example-table without recording-table');
assert.ok(!js.includes('example-label-title", "Ex: "'), 'Ex: title must be removed from all examples (Drills 1–4)');
assert.ok(js.includes('tooltip-wrap') && js.includes('target-word'), 'Drills 1–4 cues must use tooltip-wrap with target-word in hover mode');
assert.ok(js.includes('alignDrillCues') && js.includes('alignDrill1Cues'), 'JS must include alignDrillCues and backward-compatible alignDrill1Cues');
assert.ok(css.includes('.uebung11-page :is(#drill1, #drill2, #drill3, #drill4) .example-box .drill-example-table'), 'style.css must have Drills 1–4 Ex grid rules');
assert.ok(css.includes('.uebung11-page :is(#drill1, #drill2, #drill3, #drill4) .drill-row .recording-table'), 'style.css must have Drills 1–4 Dr grid rules');

// 5.6 Check Drill 1–4 Cue non-wrapping and intrinsic measurement contracts
assert.ok(
    css.includes('.uebung11-page :is(#drill1, #drill2, #drill3, #drill4) .drill-row .recording-table .drill-cue-cell') &&
    css.includes('white-space: nowrap !important;'),
    'Drills 1–4 cue cells must enforce white-space: nowrap !important to prevent unwanted wrapping'
);
assert.ok(
    js.includes('copy.querySelectorAll(".tooltip-tip, .custom-tip-box").forEach(t => t.remove());'),
    'alignDrillCues must exclude hidden tooltip text when measuring natural width'
);
assert.ok(
    js.includes('width: "max-content"') && js.includes('whiteSpace: "nowrap"'),
    'alignDrillCues must measure natural unconstrained width using max-content and nowrap'
);

// 6. Check German TTS Diagnostic and Notice Banner contracts (FWC W9)
// 6.1 HTML dedicated banner
assert.ok(html.includes('id="germanTtsNotice"'), 'HTML must have dedicated #germanTtsNotice');
assert.ok(html.includes('german-tts-notice-title'), 'HTML must have german-tts-notice-title');
assert.ok(html.includes('german-tts-notice-message'), 'HTML must have german-tts-notice-message');
assert.ok(html.includes('id="germanTtsNoticeClose"'), 'HTML must have #germanTtsNoticeClose');

// 6.2 CSS banner rules
assert.ok(css.includes('.uebung11-page #germanTtsNotice'), 'CSS must define .uebung11-page #germanTtsNotice');
assert.ok(css.includes('.uebung11-page #germanTtsNotice.is-error'), 'CSS must define .is-error state');
assert.ok(css.includes('.uebung11-page .german-tts-notice-close'), 'CSS must define close button');

// 6.3 JS Diagnostic and Notice functions
assert.ok(js.includes('function showGermanTtsNotice'), 'JS must define showGermanTtsNotice');
assert.ok(js.includes('function hideGermanTtsNotice'), 'JS must define hideGermanTtsNotice');
assert.ok(js.includes('function diagnoseTtsStartup'), 'JS must define diagnoseTtsStartup');
assert.ok(js.includes('function cancelActivePlaybackToken'), 'JS must define cancelActivePlaybackToken');

// 6.4 Required Notice Copy
assert.ok(js.includes('German audio is not supported'), 'JS must contain unsupported title');
assert.ok(js.includes('Your browser does not support speech synthesis. Please try a compatible browser.'), 'JS must contain unsupported message');
assert.ok(js.includes('German voice not detected'), 'JS must contain voice not detected title');
assert.ok(js.includes('Your browser could not find a German voice. Model audio may not work on this device. Please check your browser or system speech settings.'), 'JS must contain voice not detected message');
assert.ok(js.includes('German audio could not be played'), 'JS must contain playback error title');
assert.ok(js.includes('German audio did not start'), 'JS must contain start timeout title');
assert.ok(js.includes('The speech service did not respond in time. Please try again or reload the page.'), 'JS must contain start timeout message');
assert.ok(js.includes("Can't hear the audio?"), 'JS must contain inaudible audio title');
assert.ok(js.includes('Check your device volume, mute settings, and audio output. You can also try another German voice.'), 'JS must contain inaudible audio message');

// 6.5 Preservation of voiceRegionNotice and independent notice banner
assert.ok(html.includes('id="voiceRegionNotice"'), 'HTML must keep #voiceRegionNotice');
assert.ok(js.includes('No native') && js.includes('with') && js.includes('tag'), 'JS must preserve existing de-AT region notice format');

// 6.6 Playback diagnostics and watchdog listeners
assert.ok(js.includes('u.addEventListener("start"'), 'JS must listen to utterance start');
assert.ok(js.includes('u.addEventListener("error"'), 'JS must listen to utterance error');
assert.ok(js.includes('u.addEventListener("end"'), 'JS must listen to utterance end');
assert.ok(js.includes('startTimeoutTimer'), 'JS must have start timeout timer');

console.log('PASS: All structural and contract tests passed successfully.');
