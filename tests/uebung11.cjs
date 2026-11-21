// Verification script for Deutsche Übung 1.1: nach / in / zum / zur
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'uebung1.1.html');
const jsPath = path.join(root, 'uebung1.1.js');
const cssPath = path.join(root, 'style.css');
const feedbackCssPath = path.join(root, 'feedback-status-icons.css');
const feedbackJsPath = path.join(root, 'feedback-status-icons.js');
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
assert.ok(html.includes('id="togglePlaybackMode"'), 'HTML must have Auto-Compare toggle');
assert.ok(html.includes('Auto-Compare'), 'HTML must display Auto-Compare');
assert.ok(!html.includes('Autoplay'), 'HTML must not contain legacy Autoplay text');
assert.ok(html.includes('id="voiceSelect"'), 'HTML must have Voice selector');
assert.ok(html.includes('drill-audio-session.js'), 'HTML must load drill-audio-session.js');
assert.ok(html.includes('uebung1.1.js'), 'HTML must load uebung1.1.js');

// 4. Check CSS additions in style.css
const css = fs.readFileSync(cssPath, 'utf8');
const feedbackCss = fs.readFileSync(feedbackCssPath, 'utf8');
const feedbackJs = fs.readFileSync(feedbackJsPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
assert.ok(css.includes('.uebung11-page .uebung-copy-area'), 'style.css must have copy-area rules for uebung11');
assert.ok(css.includes('.uebung11-page :is(.ex-audio-btn, .drill-listen-btn, .drill-record-btn, .play-recording-btn)'), 'CSS must center audio button SVG icons consistently');
assert.ok(!js.includes('drill-stop-btn') && !js.includes('data-stop'), 'Must remove 3rd stop button completely in favor of 2-button layout');
assert.ok(html.includes('fluent-icon-chatHintHalfFilled fluent-icon-filled'), 'Hover button must use chatHintHalfFilled Filled icon per UI_LAYOUT_SPEC §13.1');
assert.ok(html.includes('fluent-icon-warningFilled fluent-icon-filled') && !html.includes('⚠️'), 'HTML must use Fluent warningFilled SVG instead of emoji');
assert.ok(js.includes('warningFilled') && !js.includes('⚠️'), 'JS must use warningFilled SVG without ⚠️ emoji');
assert.ok(html.includes('>Standarddeutsch<') && html.includes('>Österreichisches Deutsch<') && html.includes('>Schweizer Hochdeutsch<'), 'Variety tips must use German-only designations');
assert.ok(html.includes('uebung-flag-svg') && !html.includes('🇩🇪') && !html.includes('🇦🇹') && !html.includes('🇨🇭'), 'Variety selector must use vector flag SVGs without emojis');
const fluentJs = fs.readFileSync(path.join(root, 'fluent-icons.js'), 'utf8');
assert.ok(fluentJs.includes('chatHintHalf:') && fluentJs.includes('warning:') && fluentJs.includes('"chatHintHalfFilled":') && fluentJs.includes('"warningFilled":'), 'fluent-icons.js must preserve existing Regular/Filled keys and add warningFilled');
assert.ok(css.includes('color: #fbbf24;') && css.includes('filter: grayscale(100%);'), 'CSS must apply amber #fbbf24 and flag-only dimming');
assert.ok(css.includes('.uebung11-page .uebung-cue-place-stack'), 'CSS must align Drill 3-1 alternative cue under target noun');
assert.ok(css.includes('.uebung11-page .recording-controls > .recording-result > .result-main-row > .result-text > .feedback-retry-fire'), 'CSS must style split inline Fire icon');
assert.ok(css.includes(':is(.practice82-page, .uebung11-page) .recording-controls > .recording-result {') && css.includes('align-items: flex-end;') && css.includes('text-align: right;'), 'Result region must be right-aligned');
assert.ok(css.includes('.uebung11-page .recording-controls > .recording-result .feedback-retry-label'), 'CSS must style inline Keep going! retry label');
assert.ok(css.includes('.uebung11-page .uebung-regional-note'), 'style.css must have simple regional note rules');
assert.ok(css.includes('color: var(--text-secondary);'), 'Regional note must use Option 1 --text-secondary color');
assert.ok(!html.includes('uebung-supplement-badge') && !js.includes('uebung-supplement-badge'), 'HTML and JS must not use legacy .uebung-supplement-badge pill');

// 5. Check JS code contract

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

// 5.2 Check Drill 4 Item 3 regional configuration (explicit subject + current verb cue)
assert.ok(js.includes('Ihr / fahren / die Schule'), 'Drill 4 must include Ihr / fahren / die Schule');
assert.ok(js.includes('Ihr fahrt zur Schule.'), 'DE/CH model must include Ihr fahrt zur Schule.');
assert.ok(js.includes('Ihr fahrt in die Schule.'), 'AT model must include Ihr fahrt in die Schule.');

// 5.3 Check DrillAudio configuration and speech ordering
assert.ok(js.includes('DrillAudio.configure'), 'JS must configure DrillAudio');
assert.ok(js.includes('DrillAudio.getUserMedia'), 'JS must use DrillAudio.getUserMedia');
assert.ok(js.includes('DrillAudio.playRelay'), 'JS must use DrillAudio.playRelay');
assert.ok(js.includes('DrillAudio.speak'), 'JS must speak utterances through DrillAudio.speak');
assert.ok(js.indexOf('u.onend =') < js.indexOf('DrillAudio.speak(u)'), 'u.onend must be assigned before DrillAudio.speak');
assert.ok(js.indexOf('u.onerror =') < js.indexOf('DrillAudio.speak(u)'), 'u.onerror must be assigned before DrillAudio.speak');

// 5.4 Check Copy my sentences: raw STT only, no cue text
assert.ok(js.includes('Copy my sentences'), 'JS must implement Copy my sentences');
assert.ok(js.includes('Copy your drill results to review or share.'), 'JS must use UI_LAYOUT_SPEC Copy help text');
assert.ok(!js.includes('Copy all your recorded answers to review or share.'), 'JS must remove legacy all-Drill Copy help text');
assert.ok(js.includes('navigator.clipboard.writeText'), 'JS must use clipboard API');
assert.ok(js.includes('const hasDrillRecordings = drill.items.some') && !js.includes('const hasAnyRecordings = drillsData.some'), 'Copy button enabling must be scoped per individual drill');
assert.ok(js.includes('INCOMPLETE_TIPS = ["Getting closer!", "Almost there!", "Keep it up!", "Nice flow!", "Great start!"]'), 'D1.1 must share P8.2 random incomplete encouragement tips');
assert.ok(js.includes('volume > 0.015') && !js.includes('volume > 0.025'), 'D1.1 speech volume threshold must unify to 0.015');
assert.ok(js.includes('v.rec.classList.toggle("stop-btn-active", canManualStop);'), 'D1.1 must apply stop-btn-active to manual stop only');
assert.ok(css.includes('.uebung11-page .recording-controls > .recording-result > .result-sub-row {\n    flex-direction: column;\n    align-items: flex-end;'), 'style.css must stack D1.1 row-2 items vertically');
assert.ok(js.includes('btn.dataset.keepPlayback = "true";'), 'Copy must preserve audio playback');
assert.ok(js.includes('entries.push(`${idx + 1}. ${marker} ${entry.raw}`)'), 'Copy must include marker and untouched raw STT');
assert.ok(!js.includes('entries.push(`${idx + 1}. ${marker} ${item.cue}: ${entry.raw}`)'), 'Copy must not include the exercise cue');
assert.ok(js.includes('const cleanTitle = drill.title.replace(/^Drill \\d+:\\s*/, "").split(/\\s*—\\s*/)[0].trim();'), 'Copy header must strip learning focus duplicate from cleanTitle');
assert.ok(!js.includes('⏹️'), 'Must not hardcode stop emoji ⏹️ anywhere in uebung1.1.js');
assert.ok(js.includes('wrapAudioIcon') && js.includes('setButtonAudioIcon'), 'All audio buttons must preserve <span class="ex-audio-icon"> wrapper');

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

// 6. Check German TTS Diagnostic and Notice Banner contracts
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

// 7. 3-Stage Evaluation & Feedback UI Contracts
// 7.1 Structural and feedback text contracts
assert.ok(!js.includes('result-incorrect", " ❌"'), 'Must not render ❌ mark in result');
assert.ok(!js.includes('Try once more!'), 'Must not contain Try once more!');
assert.ok(!js.includes('correction-listen-btn'), 'Must not create duplicate listen button in correction-box');
assert.ok(!js.includes('→ ${val.modelText}'), 'Must not auto-disclose model sentence in correction-box');
assert.ok(js.includes('FeedbackStatus.setMismatch'), 'Must use the approved Fluent mismatch renderer');
assert.ok(!js.includes('FeedbackStatus.appendUndetermined'), 'Must not use legacy undetermined renderer');
assert.ok(js.includes('uebung-incomplete-svg'), 'Must render Footprints SVG for incomplete state');
assert.ok(js.includes('FeedbackStatus.appendAccepted'), 'Must use the approved Fluent accepted renderer');
assert.ok(js.includes('module.exports ='), 'Must export modules for testing');

// 7.2 Functional unit tests on 3-stage evaluation engine
const {
    drillsData,
    evaluateGermanAnswer,
    normalizeGerman,
    getItemGrammarSpec
} = require(jsPath);

assert.ok(Array.isArray(drillsData) && drillsData.length === 4, 'drillsData must contain 4 drills');

// Locate test items
const itemSalzburg = drillsData[0].example; // d1_ex: Ich / fahren / Salzburg -> "Ich fahre nach Salzburg."
const itemItalien = drillsData[0].items[1]; // d1_2: Ich / reisen / Italien -> "Ich reise nach Italien."
const itemTuerkei = drillsData[1].items[0]; // d2_1: Du / fliegen / die Türkei -> "Du fliegst in die Türkei."
const itemSupermarkt = drillsData[2].example; // d3_ex: Er / gehen / der Supermarkt -> "Er geht zum Supermarkt."
const itemKrankenhaus = drillsData[2].items[0]; // d3_1: Er / fahren / das Krankenhaus (AT/CH: Spital)
const itemPost = drillsData[3].example; // d4_ex: Ihr / gehen / die Post -> "Ihr geht zur Post."
const itemBank = drillsData[3].items[0]; // d4_1: Ihr / laufen / die Bank -> "Ihr lauft zur Bank."
const itemSchule = drillsData[3].items[2]; // d4_3: Ihr / fahren / die Schule -> regional models

console.log('Running 3-stage evaluation engine unit tests...');

// Case 1: Exact model match
const resCase1 = evaluateGermanAnswer("Ich fahre nach Salzburg.", itemSalzburg, "DE");
assert.equal(resCase1.judgment, "accepted", "Exact match must be accepted");
assert.equal(resCase1.redPart, null, "Exact match has no redPart");

// Case 2: Regional variations (DE/AT/CH) for d4_3 (Schule) & d3_1 (Krankenhaus / Spital)
const resCase2a = evaluateGermanAnswer("Ihr fahrt zur Schule.", itemSchule, "AT");
assert.equal(resCase2a.judgment, "accepted", "DE expression 'zur Schule' must be accepted under AT");
assert.ok(resCase2a.supplement && resCase2a.supplement.includes("in die Schule"), "Should include AT supplement");

const resCase2b = evaluateGermanAnswer("Ihr fahrt in die Schule.", itemSchule, "DE");
assert.equal(resCase2b.judgment, "accepted", "AT expression 'in die Schule' must be accepted under DE");
assert.ok(resCase2b.supplement && resCase2b.supplement.includes("zur Schule"), "Should include DE supplement");

const resCase2c = evaluateGermanAnswer("Er fährt zum Spital.", itemKrankenhaus, "AT");
assert.equal(resCase2c.judgment, "accepted", "AT/CH model 'Er fährt zum Spital.' must be accepted under AT");
const resCase2d = evaluateGermanAnswer("Er fährt zum Krankenhaus.", itemKrankenhaus, "AT");
assert.equal(resCase2d.judgment, "accepted", "DE model 'Er fährt zum Krankenhaus.' must be accepted under AT with supplement");
assert.ok(resCase2d.supplement && resCase2d.supplement.includes("Spital"), "Must suggest AT Spital");

// Case 3: Uncontracted forms (zu dem / zu der) equivalence & strict article/case check
const resCase3a = evaluateGermanAnswer("Er geht zu dem Supermarkt.", itemSupermarkt, "DE");
assert.equal(resCase3a.judgment, "accepted", "Uncontracted 'zu dem Supermarkt' must be accepted");
const resCase3b = evaluateGermanAnswer("Ihr geht zu der Post.", itemPost, "DE");
assert.equal(resCase3b.judgment, "accepted", "Uncontracted 'zu der Post' must be accepted");
const resCase3c = evaluateGermanAnswer("Er ist zu dem Supermarkt gegangen.", itemSupermarkt, "DE");
assert.equal(resCase3c.judgment, "accepted", "Perfekt with 'zu dem' must be accepted");
const resCase3d = evaluateGermanAnswer("Zu der Bank lauft ihr.", itemBank, "DE");
assert.equal(resCase3d.judgment, "accepted", "Inverted with 'Zu der' must be accepted");

const resCase3Bad1 = evaluateGermanAnswer("Er geht zu der Supermarkt.", itemSupermarkt, "DE");
assert.equal(resCase3Bad1.judgment, "mismatch", "Wrong article 'zu der Supermarkt' must be mismatch");
const resCase3Bad2 = evaluateGermanAnswer("Ihr lauft zu dem Bank.", itemBank, "DE");
assert.equal(resCase3Bad2.judgment, "mismatch", "Wrong article 'zu dem Bank' must be mismatch");
const resCase3Bad3 = evaluateGermanAnswer("Er geht zu den Supermarkt.", itemSupermarkt, "DE");
assert.equal(resCase3Bad3.judgment, "mismatch", "Wrong case 'zu den Supermarkt' must be mismatch");
const resCase3Prefix1 = evaluateGermanAnswer("Er geht zu", itemSupermarkt, "DE");
assert.equal(resCase3Prefix1.judgment, "incomplete", "Prefix 'Er geht zu' must remain incomplete");
const resCase3Prefix2 = evaluateGermanAnswer("Er geht zu dem", itemSupermarkt, "DE");
assert.equal(resCase3Prefix2.judgment, "incomplete", "Prefix 'Er geht zu dem' must remain incomplete");

// Case 4: Inverted word order (OVS)
const resCase4a = evaluateGermanAnswer("Nach Salzburg fahre ich.", itemSalzburg, "DE");
assert.equal(resCase4a.judgment, "accepted", "Inverted word order 'Nach Salzburg fahre ich.' must be accepted");
const resCase4b = evaluateGermanAnswer("In die Türkei fliegst du.", itemTuerkei, "DE");
assert.equal(resCase4b.judgment, "accepted", "Inverted word order 'In die Türkei fliegst du.' must be accepted");
const resCase4c = evaluateGermanAnswer("Zum Supermarkt geht er.", itemSupermarkt, "DE");
assert.equal(resCase4c.judgment, "accepted", "Inverted word order 'Zum Supermarkt geht er.' must be accepted");

// Case 5: Alternate tenses (Perfekt / Präteritum) with explicit drill subjects
const resCase5a = evaluateGermanAnswer("Ich bin nach Salzburg gefahren.", itemSalzburg, "DE");
assert.equal(resCase5a.judgment, "accepted", "Perfekt 'Ich bin nach Salzburg gefahren.' must be accepted");
const resCase5b = evaluateGermanAnswer("Du bist in die Türkei geflogen.", itemTuerkei, "DE");
assert.equal(resCase5b.judgment, "accepted", "Perfekt 'Du bist in die Türkei geflogen.' must be accepted");
const resCase5c = evaluateGermanAnswer("Ich fuhr nach Salzburg.", itemSalzburg, "DE");
assert.equal(resCase5c.judgment, "accepted", "Präteritum 'Ich fuhr nach Salzburg.' must be accepted");
const resCase5d = evaluateGermanAnswer("Er ist zum Supermarkt gegangen.", itemSupermarkt, "DE");
assert.equal(resCase5d.judgment, "accepted", "Perfekt 'Er ist zum Supermarkt gegangen.' must be accepted");

// Case 6: Subject mismatch / wrong subject (explicit subject required)
const resCase6 = evaluateGermanAnswer("Er fahren nach Salzburg.", itemSalzburg, "DE");
assert.equal(resCase6.judgment, "mismatch", "Subject/agreement mismatch must be mismatch");
assert.ok(resCase6.diffTokens.some(t => t.status === "incorrect" && t.text === "Er"), "Wrong subject 'Er' must be flagged incorrect");

// Case 6b: Missing subject -> mismatch with leading ＿
const itemSchweiz = drillsData[1].example; // Du / fahren / die Schweiz
const resCase6b = evaluateGermanAnswer("fährst in die Schweiz.", itemSchweiz, "DE");
assert.equal(resCase6b.judgment, "mismatch", "Missing subject must be mismatch");
assert.equal(resCase6b.diffTokens[0].status, "missing", "Missing subject position must have ＿");
assert.equal(resCase6b.diffTokens[0].text, "＿", "Missing token must be ＿");

// Case 6c: Inverted word order with explicit subject -> accepted (not subject-missing)
const resCase6c1 = evaluateGermanAnswer("Nach Salzburg fahre ich.", itemSalzburg, "DE");
assert.equal(resCase6c1.judgment, "accepted", "Inverted 'Nach Salzburg fahre ich.' must be accepted");
const resCase6c2 = evaluateGermanAnswer("In die Schweiz fährst du.", itemSchweiz, "DE");
assert.equal(resCase6c2.judgment, "accepted", "Inverted 'In die Schweiz fährst du.' must be accepted");

// Case 7: Wrong preposition for destination -> mismatch with diffTokens
const resCase7 = evaluateGermanAnswer("Ich fahre zu Salzburg.", itemSalzburg, "DE");
assert.equal(resCase7.judgment, "mismatch", "Wrong preposition must be mismatch");
assert.ok(resCase7.diffTokens.some(t => t.status === "incorrect" && t.text === "zu"), "Wrong preposition 'zu' must be flagged incorrect");

// Case 8: Wrong place / cue mismatch
const resCase8 = evaluateGermanAnswer("Ich fahre nach Berlin.", itemSalzburg, "DE");
assert.equal(resCase8.judgment, "mismatch", "Wrong destination place must be mismatch");
assert.ok(resCase8.diffTokens.some(t => t.status === "incorrect" && t.text === "Berlin."), "Wrong place must be flagged incorrect");

// Case 9: Wrong verb root
const resCase9 = evaluateGermanAnswer("Ich gehe nach Salzburg.", itemSalzburg, "DE");
assert.equal(resCase9.judgment, "mismatch", "Wrong motion verb root must be mismatch");
assert.ok(resCase9.diffTokens.some(t => t.status === "incorrect" && t.text === "gehe"), "Wrong verb root must be flagged incorrect");

// Case 10: Complex sentence structure -> mismatch (no longer undetermined)
const resCase10 = evaluateGermanAnswer("Ich möchte nach Salzburg fahren.", itemSalzburg, "DE");
assert.equal(resCase10.judgment, "mismatch", "Complex/modal structure must be mismatch");
assert.ok(resCase10.diffTokens.some(t => t.status === "incorrect" && t.text === "möchte"), "Modal 'möchte' must be flagged incorrect");

// Case 11: Incomplete (true token-level prefix match) vs Mismatch boundaries
const resCase11Inc = evaluateGermanAnswer("Ich fahre nach", itemSalzburg, "DE");
assert.equal(resCase11Inc.judgment, "incomplete", "True prefix 'Ich fahre nach' must be incomplete");

const resCase11Cut = evaluateGermanAnswer("Ich fahre nach Salz", itemSalzburg, "DE");
assert.equal(resCase11Cut.judgment, "mismatch", "Cut-off token 'Ich fahre nach Salz' must be mismatch");
const resCase11Extra = evaluateGermanAnswer("Ich fahre nach Salzburg und", itemSalzburg, "DE");
assert.equal(resCase11Extra.judgment, "mismatch", "Extra trailing word must be mismatch");
const resCase11Mid1 = evaluateGermanAnswer("fahre nach", itemSalzburg, "DE");
assert.equal(resCase11Mid1.judgment, "mismatch", "Mid-sentence fragment 'fahre nach' must be mismatch");
const resCase11Mid2 = evaluateGermanAnswer("Salzburg", itemSalzburg, "DE");
assert.equal(resCase11Mid2.judgment, "mismatch", "Single trailing word 'Salzburg' must be mismatch");

// Case 12: Empty STT & Low-confidence fallback
const resCase12Empty = evaluateGermanAnswer("   ", itemSalzburg, "DE");
assert.equal(resCase12Empty.judgment, "empty", "Whitespace-only STT must be empty");

const resCase12Low = evaluateGermanAnswer("Hallo Welt heute", itemSalzburg, "DE");
assert.equal(resCase12Low.judgment, "mismatch", "Completely unrelated speech must be mismatch");
assert.ok(resCase12Low.diffTokens.every(t => t.status === "incorrect" && t.text !== "＿"), "Low-confidence fallback must mark all tokens incorrect without inserting ＿");

// 7.3 Responsive style & A-F contracts verification
assert.ok(css.includes('.uebung11-page'), 'CSS must include .uebung11-page scope');
assert.ok(css.includes('.uebung11-page .result-incorrect'), 'CSS must style .uebung11-page .result-incorrect');
assert.ok(css.includes('.uebung11-page .result-missing'), 'CSS must style .uebung11-page .result-missing');
const missingRule = css.match(/\.uebung11-page \.result-missing\s*\{([^}]*)\}/);
assert.ok(missingRule && /font-weight:\s*400/.test(missingRule[1]), 'Missing ＿ marker must use regular font weight');
const incorrectRule = css.match(/\.uebung11-page \.result-incorrect\s*\{([^}]*)\}/);
assert.ok(incorrectRule && /font-weight:\s*400/.test(incorrectRule[1]), 'Incorrect STT tokens must use regular font weight');
assert.ok(js.includes('node("span", "result-missing", tok.text)'), 'Missing diff tokens must render with result-missing');
assert.ok(css.includes('.correction-box'), 'CSS must style .correction-box');
assert.ok(feedbackCss.includes('.feedback-status'), 'Feedback CSS must style shared status renderers');
assert.ok(feedbackCss.includes('.feedback-retry-label'), 'Feedback CSS must style the Fluent retry renderer');

// New motion verbs must support Präteritum and Perfekt with their intended subjects.
const newVerbTenseCases = [
    { verb: "ziehen", item: drillsData[0].items[2], sentences: ["Ich zog nach Wien.", "Ich bin nach Wien gezogen."] },
    { verb: "kommen", item: drillsData[1].items[2], sentences: ["Du kamst in den Irak.", "Du bist in den Irak gekommen."] },
    { verb: "rennen", item: drillsData[2].items[1], sentences: ["Er rannte zum Bahnhof.", "Er ist zum Bahnhof gerannt."] },
    { verb: "spazieren", item: drillsData[2].items[2], sentences: ["Er spazierte zum Park.", "Er ist zum Park spaziert."] },
    { verb: "laufen", item: drillsData[3].items[0], sentences: ["Ihr lieft zur Bank.", "Ihr seid zur Bank gelaufen."] },
    { verb: "radeln", item: drillsData[3].items[1], sentences: ["Ihr radeltet zur Apotheke.", "Ihr seid zur Apotheke geradelt."] }
];
for (const testCase of newVerbTenseCases) {
    for (const sentence of testCase.sentences) {
        const result = evaluateGermanAnswer(sentence, testCase.item, "DE");
        assert.equal(result.judgment, "accepted", `New verb ${testCase.verb} must accept "${sentence}"`);
    }
}
// A: All 16 items cueParts must follow SVO order [subject, verb, place] & no duplicate verbs per drill
const expectedSubjects = ["Ich", "Du", "Er", "Ihr"];
const knownVerbs = new Set(["fahren", "reisen", "fliegen", "gehen", "ziehen", "kommen", "rennen", "spazieren", "laufen", "radeln"]);
drillsData.forEach((drill, dIdx) => {
    const allItems = [drill.example, ...drill.items];
    const verbsInDrill = new Set();
    allItems.forEach(it => {
        assert.equal(it.cueParts[0], expectedSubjects[dIdx], `Drill ${dIdx + 1} cueParts[0] must be ${expectedSubjects[dIdx]}`);
        assert.ok(knownVerbs.has(it.cueParts[1]), `Drill ${dIdx + 1} cueParts[1] must be verb, got ${it.cueParts[1]}`);
        assert.ok(!verbsInDrill.has(it.cueParts[1]), `Drill ${dIdx + 1} must not duplicate verb ${it.cueParts[1]}`);
        verbsInDrill.add(it.cueParts[1]);
    });
});

// C: Playback generation and order in playRecording
assert.ok(js.includes('let playbackGeneration = 0;'), 'Must track playbackGeneration');
const playRecordingStart = js.indexOf('function playRecording(');
const playRecordingEnd = js.indexOf('function record(', playRecordingStart);
const playRecordingBody = playRecordingStart >= 0 && playRecordingEnd > playRecordingStart ? js.slice(playRecordingStart, playRecordingEnd) : '';
const markPlayingPos = playRecordingBody.indexOf('if (btn) markPlaying(btn);');
const activeAudioPos = playRecordingBody.indexOf('activeAudio = audio;');
assert.ok(markPlayingPos >= 0 && activeAudioPos > markPlayingPos, 'playRecording must call markPlaying before setting activeAudio');

// D: Empty STT discards audio without saving
assert.ok(js.includes('if (raw && normRaw && hasValidAudio)'), 'Empty STT must not create Blob URL');
assert.ok(!js.includes('unrecognized: true'), 'Empty STT must not save unrecognized audio entry');

// E: Icons (playCircle normal, stop regular & currentColor)
assert.ok(js.includes('FluentIcons.create("playCircle", 20)'), 'Recording playback button must use playCircle icon');
assert.ok(js.includes('setButtonAudioIcon(b, "stop", "regular")') && js.includes('FluentIcons.create(iconName, 20, "", variant)'), 'Playing stop icon must use regular variant via setButtonAudioIcon');
assert.ok(css.includes('.uebung11-page .play-recording-btn .fluent-icon-stop {\n    color: currentColor;'), 'Playing stop icon must use currentColor');

// F: Copy my sentences with keepPlayback & markers
assert.ok(js.includes('btn.dataset.keepPlayback = "true";'), 'Copy button must set data-keep-playback="true"');
assert.ok(js.includes('entry.judgment === "accepted" ? "✅" : (entry.judgment === "incomplete" ? "👣" : "🔥")'), 'Copy must prepend status markers');

// 8. Introductory Hover & Status Tooltip Contracts
console.log('Testing Deutsche Übung 1.1 hover and tooltip contracts...');

// 8.1 Autostop & Auto-Compare multi-line setting tooltips in HTML + Fluent SVG icons
assert.ok(html.includes('ON: Stops automatically after 2s of silence.<br>OFF: Uses the stop button.'), 'Autostop must have standard multi-line tooltip');
assert.ok(html.includes('ON: Auto-plays the model audio and your recording in sequence after recording.<br>OFF: Uses the Play buttons separately.'), 'Auto-Compare must have standard multi-line tooltip');
assert.ok(html.includes('fluent-icon-arrowHookDownLeft'), 'Back link must use Arrow Hook Down Left Fluent SVG');
assert.ok(html.includes('fluent-icon-speaker'), 'Voice label must use Speaker 2 Fluent SVG');
assert.ok(html.includes('fluent-icon-playCircle'), 'Auto-Compare must use Play Circle 24 Regular Fluent SVG');
assert.ok(html.includes('fluent-icon-micFilled'), 'Autostop must use Mic 24 Filled Fluent SVG');
assert.ok(html.includes('fluent-icon-chatHintHalfFilled'), 'Hover must use Chat Hint Half 24 Filled Fluent SVG');
assert.ok(html.includes('fluent-icon-editLineHorizontal3Filled'), 'Display must use Edit Line Horizontal 3 24 Filled Fluent SVG');
assert.ok(js.includes('lightbulbFilled'), 'Instruction panel must use Lightbulb 20 Filled Fluent SVG');
assert.ok(!js.includes('b.textContent = "Playing..."'), 'Must abolish Playing... text during Drill model playback');
assert.ok(js.includes('key === "d1_1" ? "Play your recorded voice." : ""'), 'Recorded play hover must be restricted to Drill 1 Item 1 only');
assert.ok(js.includes('createFlagSvgMarkup'), 'Must render DE/AT/CH vector SVG flags');
assert.ok(js.includes('regionalCuePlaces'), 'Drill 3-1 must support regional cue place switching');

// 8.1b drill-audio-session.js button-only cursor:default separation
const sessionJs = fs.readFileSync(path.join(__dirname, '..', 'drill-audio-session.js'), 'utf8');
assert.ok(sessionJs.includes("const targetCursor = el.tagName === 'BUTTON' ? 'default' : 'not-allowed';"), 'drill-audio-session.js must separate button cursor:default from form controls not-allowed');
assert.ok(sessionJs.includes('else if (el.style.cursor === targetCursor) el.style.removeProperty(\'cursor\');'), 'drill-audio-session.js must clean up matching cursor inline style on enable');

// 8.2 Basic operation button hovers restricted to Example 1 and Drill 1 Item 1 only
assert.ok(js.includes('Listen to the example.'), 'Must include Listen to the example. for Example 1');
assert.ok(js.includes('drill.number === 1 ? "Listen to the example." : ""'), 'Example tooltip must be restricted to Example 1 only');

assert.ok(js.includes('Listen to the model answer.'), 'Must include Listen to the model answer. for Drill 1 Item 1');
assert.ok(js.includes('Record your answer.'), 'Must include Record your answer. for Drill 1 Item 1');
assert.ok(js.includes('isFirstItemOfDrill1'), 'Must conditionally check first item of Drill 1');

// 8.3 Undetermined (👣) tooltip
assert.ok(feedbackJs.includes('Could not be evaluated reliably.'), 'Shared renderer must provide the undetermined tooltip');
assert.ok(feedbackJs.includes("badge.className = 'feedback-status feedback-status-'"), 'Shared renderer must create the undetermined status class');

// 8.4 CSS styling for multi-line and status tooltips
assert.ok(css.includes('.uebung11-page .settings-onoff .custom-tip-box'), 'CSS must format settings tooltips');
assert.ok(css.includes('.uebung11-page .settings-onoff .custom-tip-box .tip-line'), 'CSS must format tip-line blocks');
assert.ok(feedbackCss.includes('.feedback-status-undetermined:hover'), 'Feedback CSS must support the undetermined tooltip interaction');

// 8.5 tooltip-layout.js preserves .uebung11-page introductory tooltips
const tooltipLayoutJs = fs.readFileSync(path.join(root, 'tooltip-layout.js'), 'utf8');
assert.ok(tooltipLayoutJs.includes('.uebung11-page'), 'tooltip-layout.js must preserve .uebung11-page tooltips');

// 8.6 Germanized basic operation button labels (Fluent arrowHookDownLeft + Zurück)
assert.ok(html.includes('fluent-icon-arrowHookDownLeft') && html.includes('>Zurück<span'), 'HTML must have Fluent back icon + Zurück back link');
assert.ok(!html.includes('もどる'), 'HTML must not have もどる');
assert.ok(js.includes('drill-listen-btn'), 'JS must use drill-listen-btn for listen buttons');
assert.ok(js.includes('drill-record-btn'), 'JS must use drill-record-btn for record button');
assert.ok(!js.includes('🔊きく'), 'JS must not contain 🔊きく');
assert.ok(!js.includes('とる'), 'JS must not contain とる');

console.log('PASS: All structural, contract, 3-stage evaluation, and hover tooltip tests passed successfully.');

// ============================================================================
// 9. Browser E2E: Recording Lifecycle, Limits, Audio Monitoring & Error Handling
// ============================================================================
const { chromium } = require('playwright');

const chromiumPath = process.env.CHROMIUM_PATH ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' :
     path.join(root, '.tools/ms-playwright/chromium-1140/chrome-linux/chrome'));

async function runRecordingLifecycleTests() {
    console.log('Testing Deutsche Übung 1.1 recording lifecycle and limits in browser...');
    const browser = await chromium.launch({
        executablePath: chromiumPath,
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.addInitScript(() => {
            window.t = {
                tracks: [],
                recorders: [],
                recognitions: [],
                contexts: [],
                utterances: [],
                audios: [],
                clipboardWrites: [],
                clipboardFailure: false,
                speaking: false,
                deny: false,
                recordError: false
            };

            const origSpeech = window.speechSynthesis;
            if (origSpeech) {
                const origSpeak = origSpeech.speak.bind(origSpeech);
                origSpeech.speak = u => {
                    window.t.utterances.push(u);
                    try { origSpeak(u); } catch (_) {}
                };
            }

            const OrigAudio = window.Audio;
            window.Audio = class extends OrigAudio {
                constructor(src) {
                    super(src);
                    window.t.audios.push(this);
                }
                play() {
                    return Promise.resolve();
                }
            };

            Object.defineProperty(navigator, 'mediaDevices', {
                value: {
                    getUserMedia: () => new Promise((resolve, reject) => {
                        if (window.t.deny) return reject(new DOMException('Denied', 'NotAllowedError'));
                        const track = {
                            readyState: 'live',
                            stop() { this.readyState = 'ended'; },
                            addEventListener() {}
                        };
                        window.t.tracks.push(track);
                        resolve({ getTracks: () => [track] });
                    })
                }
            });

            window.MediaRecorder = class {
                constructor(stream) {
                    this.stream = stream;
                    this.state = 'inactive';
                    this.mimeType = 'audio/webm';
                    window.t.recorders.push(this);
                }
                start() {
                    this.state = 'recording';
                    window.recordingStartTime = Date.now();
                }
                stop() {
                    if (window.t.failRecorderStop) {
                        this.state = 'inactive';
                        throw new Error('recorder stop failed');
                    }
                    this.state = 'inactive';
                    if (!window.t.noRecorderOnstop) {
                        setTimeout(() => {
                            if (!window.t.emptyChunks) {
                                this.ondataavailable?.({ data: new Blob(['recorded-audio'], { type: 'audio/webm' }) });
                            }
                            this.onstop?.();
                        }, 0);
                    }
                }
            };

            window.SpeechRecognition = class {
                constructor() {
                    window.t.recognitions.push(this);
                }
                start() {
                    if (window.t.failRecognitionStart) {
                        throw new Error('recognition start failed');
                    }
                    this.active = true;
                    // Real Chrome dispatches onspeechstart shortly after start even in silence
                    setTimeout(() => {
                        if (this.active) this.onspeechstart?.();
                    }, 50);
                }
                stop() {
                    this.active = false;
                    setTimeout(() => this.onend?.(), 0);
                }
                abort() {
                    this.active = false;
                    setTimeout(() => this.onend?.(), 0);
                }
            };
            window.webkitSpeechRecognition = window.SpeechRecognition;

            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: {
                    writeText: async text => {
                        if (window.t.clipboardFailure) {
                            throw new Error('Clipboard permission denied');
                        }
                        window.t.clipboardWrites.push(text);
                    }
                }
            });

            window.AudioContext = class {
                constructor() {
                    if (window.t.failAudioContext) {
                        throw new Error('AudioContext init failed');
                    }
                    this.state = 'running';
                    window.t.contexts.push(this);
                }
                resume() {
                    if (window.t.failResume) {
                        return Promise.reject(new Error('resume failed'));
                    }
                    return Promise.resolve();
                }
                close() { this.state = 'closed'; return Promise.resolve(); }
                createMediaStreamSource() {
                    if (window.t.failSource) {
                        throw new Error('createMediaStreamSource failed');
                    }
                    return { connect() {}, disconnect() {} };
                }
                createAnalyser() {
                    if (window.t.failAnalyser) {
                        throw new Error('createAnalyser failed');
                    }
                    return {
                        fftSize: 2048,
                        getFloatTimeDomainData(arr) {
                            arr.fill(typeof window.t.speaking === 'number' ? window.t.speaking : (window.t.speaking ? 0.08 : 0));
                        },
                        disconnect() {}
                    };
                }
            };
            window.webkitAudioContext = window.AudioContext;
        });

        await page.route('**/*', route => {
            const u = new URL(route.request().url());
            if (u.hostname !== 'uebung11.test') return route.abort();
            const f = path.join(root, u.pathname);
            return route.fulfill({
                status: fs.existsSync(f) ? 200 : 404,
                body: fs.existsSync(f) ? fs.readFileSync(f) : '',
                contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.png') ? 'image/png' : 'text/html'
            });
        });

        await page.goto('http://uebung11.test/uebung1.1.html');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.clock.install();

        const copyButtons = page.locator('.uebung-copy-button');
        assert.equal(await copyButtons.count(), 4, 'There must be one Copy button under each drill');
        assert.deepEqual(
            await copyButtons.evaluateAll(buttons => buttons.map(button => button.disabled)),
            [true, true, true, true],
            'All Copy buttons must be disabled when no valid answers exist'
        );
        assert.equal(
            await copyButtons.evaluateAll(buttons => buttons.every(button => button.dataset.keepPlayback === 'true')),
            true,
            'Every Copy button must preserve ongoing audio playback'
        );

        const isRecording = () => page.evaluate(() => {
            const rec = window.t.recorders.at(-1);
            return Boolean(rec && rec.state === 'recording');
        });

        const clickRecordInDrill = async drillNo => {
            await page.locator(`#drill${drillNo} .drill-row .drill-record-btn`).first().click();
            for (let i = 0; i < 10; i++) {
                await page.clock.runFor(50);
                if (await isRecording()) break;
            }
            assert.ok(await isRecording(), `D${drillNo}: Recording started`);
        };

        const clickRecord = async (isManual = false) => {
            await page.evaluate(manual => {
                const toggle = document.querySelector('#toggleRecordMode');
                if (toggle) {
                    if (manual && toggle.checked) toggle.click();
                    if (!manual && !toggle.checked) toggle.click();
                }
                const playToggle = document.querySelector('#togglePlaybackMode');
                if (playToggle && playToggle.checked) playToggle.click();

                const recBtns = [...document.querySelectorAll('#drillsContainer .recording-actions button')];
                const recBtn = recBtns.find(b => b.classList.contains('drill-record-btn'));
                if (recBtn) recBtn.click();
            }, isManual);
            for (let i = 0; i < 10; i++) {
                await page.clock.runFor(50);
                if (await page.evaluate(() => window.t.recorders.at(-1)?.state === 'recording')) break;
            }
        };

        const advanceToElapsed = async (targetElapsed) => {
            const currentElapsed = await page.evaluate(() => Date.now() - (window.recordingStartTime || Date.now()));
            const toAdvance = targetElapsed - currentElapsed;
            if (toAdvance > 0) {
                await page.clock.runFor(toAdvance);
            }
        };

        const getStopBtn = () => page.locator('#drillsContainer .recording-actions button.stop-btn-active').first();
        const getResult = () => page.locator('#drillsContainer .recording-result').first();

        const setSpeaking = val => page.evaluate(v => { window.t.speaking = v; }, val);
        const triggerRecognition = (text) => page.evaluate(t => {
            const rec = window.t.recognitions.at(-1);
            if (rec?.onresult) {
                rec.onresult({
                    resultIndex: 0,
                    results: [[{ transcript: t, isFinal: true }]]
                });
            }
        }, text);

        // =========================================================================
        // 19 Scenarios based on Section 7 Requirements
        // =========================================================================

        // --- Section structure check: Example -> Info Panel -> Drill rows ---
        const d1OrderOk = await page.evaluate(() => {
            const sec = document.querySelector('#drill1');
            const kids = [...sec.children];
            const exIdx = kids.findIndex(el => el.classList.contains('example-box'));
            const panelIdx = kids.findIndex(el => el.classList.contains('info-panel'));
            const drillIdx = kids.findIndex(el => el.classList.contains('drill-row'));
            return exIdx !== -1 && panelIdx !== -1 && drillIdx !== -1 && exIdx < panelIdx && panelIdx < drillIdx;
        });
        assert.equal(d1OrderOk, true, 'D1.1 section order must place .example-box before .info-panel and .drill-row');

        // --- Scenario 1: Autostop ONで未発話5秒停止 ---
        await clickRecord(false);
        assert.ok(await isRecording(), 'S1: Recording started in Autostop ON');
        const tipDuringAutostop = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const host = row?.querySelector('.p82-autostop-tip-host');
            const recTip = row?.querySelector('.drill-record-btn > .custom-tip-box');
            const hostTip = host?.querySelector(':scope > .custom-tip-box');
            return {
                hostOpen: Boolean(host?.classList.contains('p82-autostop-open')),
                hostText: hostTip?.textContent || '',
                hasDuplicateRecTip: Boolean(recTip)
            };
        });
        assert.deepEqual(tipDuringAutostop, {
            hostOpen: true,
            hostText: 'Autostop: ON',
            hasDuplicateRecTip: false
        }, 'S1: Shows single Autostop: ON tooltip on host while Autostop ON recording is active');
        await advanceToElapsed(4800);
        assert.ok(await isRecording(), 'S1: Still recording at 4.8s without speech');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S1: Stopped at 5.0s timeout');
        const s1UiState = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            return {
                mainText: row?.querySelector('.recording-result > .result-main-row > .result-text')?.textContent || '',
                subNotice: row?.querySelector('.recording-result > .result-sub-row > .result-notice')?.textContent || '',
                hostOpen: Boolean(row?.querySelector('.p82-autostop-tip-host')?.classList.contains('p82-autostop-open')),
                restoredRecTip: row?.querySelector('.drill-record-btn > .custom-tip-box')?.textContent || ''
            };
        });
        assert.equal(s1UiState.mainText, '… Not yet', 'S1: Keeps … Not yet in row 1 after unsaved timeout notice');
        assert.equal(s1UiState.subNotice, 'No speech detected within 5 seconds.', 'S1: Shows 5s timeout notice independently in row 2');
        assert.equal(s1UiState.hostOpen, false, 'S1: Closes Autostop: ON tooltip after stopping');
        assert.equal(s1UiState.restoredRecTip, 'Record your answer.', 'S1: Restores Drill 1 Item 1 Record your answer. tooltip after stopping');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'S1: No play button saved');

        // --- Scenario 2: Autostop OFF（Manual）で未発話5秒タイムアウトが発動しない ---
        await clickRecord(true); // Manual
        assert.ok(await isRecording(), 'S2: Recording started in Autostop OFF');
        await advanceToElapsed(4800);
        assert.ok(await isRecording(), 'S2: Still recording at 4.8s in Manual');
        await advanceToElapsed(5500);
        await page.clock.runFor(100);
        assert.ok(await isRecording(), 'S2: Still recording past 5.0s in Manual without speech');
        await page.evaluate(() => {
            document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active')?.click();
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S2: Stops on manual stop button click');
        const resText2 = await getResult().textContent();
        assert.ok(!resText2.includes('No speech detected within 5 seconds.'), 'S2: Does not show 5s timeout message in Manual');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'S2: No play button saved without speech');

        // --- Scenario 3: onspeechstart先行でも5秒タイムアウトが成立 ---
        // (SpeechRecognition mock automatically dispatches onspeechstart at 50ms)
        await clickRecord(false);
        await page.clock.runFor(2500); // 2.5s elapsed (well past 2.0s from onspeechstart)
        assert.ok(await isRecording(), 'S3: Premature onspeechstart does NOT trigger 2s silence stop');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S3: Auto-stopped at 5s timeout despite onspeechstart');
        assert.ok((await getResult().textContent()).includes('No speech detected within 5 seconds.'), 'S3: 5s timeout message');

        // --- Scenario 4: onresult単独は2秒無音停止を起こさず、有効STTは5秒保護・無効STTは5秒停止 ---
        await clickRecord(false);
        // Early valid onresult without microphone volume activity
        await page.clock.runFor(200);
        await triggerRecognition('Frühzeitiger Text');
        await page.clock.runFor(2500); // Past 2s from onresult
        assert.ok(await isRecording(), 'S4: onresult alone without mic volume does NOT trigger 2s silence stop');
        await advanceToElapsed(5200);
        await page.clock.runFor(100);
        assert.ok(await isRecording(), 'S4: Recognized STT protects against 5.0s timeout');
        // Finish cleanly via speech + 2s silence autostop
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(2200);
        assert.ok(!(await isRecording()), 'S4: Stops cleanly via 2s silence autostop after speech');

        // Whitespace-only onresult without mic volume still times out at 5.0s
        await clickRecord(false);
        await page.clock.runFor(200);
        await triggerRecognition('   ');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S4b: Whitespace-only onresult still stops at 5.0s timeout');
        assert.ok((await getResult().textContent()).includes('No speech detected within 5 seconds.'), 'S4b: Shows 5s timeout message');

        // --- Scenario 5: Autostop ONで発話後2秒無音停止 ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(500); // 500ms speech (soundFrames >= 3)
        await setSpeaking(false); // Speech ends, silence begins
        await page.clock.runFor(1500); // 1.5s silence
        assert.ok(await isRecording(), 'S5: Still recording at 1.5s silence');
        await page.clock.runFor(900); // 2.4s total silence
        assert.ok(!(await isRecording()), 'S5: Auto-stopped after 2.0s silence');

        // --- Scenario 6: Autostop OFFで発話後2秒無音停止しない ＋ 2ボタン構成・手動停止検証 ---
        const actionsBtnCount = await page.locator('#drill1 .drill-row').first().locator('.recording-actions button').count();
        assert.equal(actionsBtnCount, 2, 'S6: .recording-actions must contain exactly 2 buttons (listen + rec)');
        assert.equal(await page.locator('#drillsContainer button[data-stop]').count(), 0, 'S6: Must not render 3rd stop button');

        await clickRecord(true); // Manual
        assert.equal(
            await page.evaluate(() => Boolean(document.querySelector('#drillsContainer .drill-row .drill-record-btn')?.classList.contains('stop-btn-active'))),
            true,
            'S6: Manual recording must apply .stop-btn-active'
        );
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(4000); // 4.0s silence
        assert.ok(await isRecording(), 'S6: Manual mode does NOT auto-stop on silence');
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S6: Stopped via recBtn in manual mode');

        // Manual -> Autostop ON transition with 0.020 RMS volume (> 0.015 threshold) still stops after 2.0s silence
        await clickRecord(false);
        await advanceToElapsed(800);
        await setSpeaking(0.02);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(2200);
        assert.ok(!(await isRecording()), 'Manual -> Autostop ON session with 0.020 RMS volume stops after 2.0s silence');

        // --- Scenario 7: 音声再検出で無音時間がリセット ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(1500); // 1.5s silence
        assert.ok(await isRecording(), 'S7: Still recording at 1.5s silence');
        await setSpeaking(true); // Resumed speech
        await page.clock.runFor(300);
        await setSpeaking(false);
        await page.clock.runFor(1500); // 1.5s silence after resumption
        assert.ok(await isRecording(), 'S7: Still recording 1.5s after speech resumed');
        await page.clock.runFor(700); // 2.2s silence
        assert.ok(!(await isRecording()), 'S7: Auto-stopped 2.0s after speech resumed');

        // --- Scenario 8: Autostop ONで20秒上限 ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await advanceToElapsed(19700);
        assert.ok(await isRecording(), 'S8: Still recording at 19.7s while speaking');
        await advanceToElapsed(20200);
        await page.clock.runFor(100);
        await setSpeaking(false);
        assert.ok(!(await isRecording()), 'S8: Stopped at 20s absolute upper limit');
        assert.ok((await getResult().textContent()).includes('Auto-stopped after 20 seconds.'), 'S8: 20s limit message');

        // --- Scenario 9: Autostop OFFで20秒上限 ---
        await clickRecord(true); // Manual
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400); // Speech confirmed by mic
        await setSpeaking(false);
        await advanceToElapsed(19700);
        assert.ok(await isRecording(), 'S9: Still recording at 19.7s in Manual');
        await advanceToElapsed(20200);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S9: Stopped at 20s in Manual');
        assert.ok((await getResult().textContent()).includes('Auto-stopped after 20 seconds.'), 'S9: 20s limit message');

        // --- Scenario 10: STT error leaves no saved audio or playback button ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400); // Speech confirmed by mic
        await setSpeaking(false);
        await page.evaluate(() => {
            const rec = window.t.recognitions.at(-1);
            rec?.onerror?.({ error: 'network' });
        });
        await page.clock.runFor(200);
        assert.ok(!(await isRecording()), 'S10: Stopped on recognition error');
        const resText10 = await getResult().textContent();
        assert.ok(resText10.includes('Recognition error.'), 'S10: Shows Recognition error.');
        const playBtn10 = getResult().locator('.play-recording-btn');
        assert.equal(await playBtn10.count(), 0, 'S10: Empty STT discards audio without play button');
        // --- Scenario 12: STT空・録音音声ありの場合の表示（録音破棄・再生ボタンなし） ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(2200);
        assert.ok(!(await isRecording()), 'S12: Stopped after 2s silence');
        const resText12 = await getResult().textContent();
        assert.ok(resText12.includes('No transcription available.'), 'S12: Shows No transcription available.');
        assert.ok(!resText12.includes('… Not yet'), 'S12: Does not show Not yet');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'S12: No play button when STT is empty');

        // --- Scenario 13: AudioContext初期化失敗 ---
        await page.evaluate(() => { window.t.failAudioContext = true; });
        await clickRecord(false);
        await page.clock.runFor(200);
        assert.ok(!(await isRecording()), 'S13: Stopped immediately on AudioContext init failure');
        assert.ok((await getResult().textContent()).includes('Recording error.'), 'S13: Shows Recording error.');
        await page.evaluate(() => { window.t.failAudioContext = false; });

        // --- Scenario 14: 音量監視初期化失敗 (resume failure) ---
        await page.evaluate(() => { window.t.failResume = true; });
        await clickRecord(false);
        await page.clock.runFor(200);
        assert.ok(!(await isRecording()), 'S14: Stopped on volume monitoring resume failure');
        assert.ok((await getResult().textContent()).includes('Recording error.'), 'S14: Shows Recording error on volume monitor failure');
        await page.evaluate(() => { window.t.failResume = false; });

        // --- Scenario 15: recognition.start() の例外 ---
        await page.evaluate(() => { window.t.failRecognitionStart = true; });
        await clickRecord(false);
        await page.clock.runFor(200);
        assert.ok(!(await isRecording()), 'S15: Stopped on recognition.start() exception');
        assert.ok((await getResult().textContent()).includes('Recognition error.'), 'S15: Shows Recognition error (distinguished from recording error)');
        await page.evaluate(() => { window.t.failRecognitionStart = false; });

        // --- Scenario 16: 録音データ取得失敗 ---
        await page.evaluate(() => { window.t.emptyChunks = true; });
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400); // speech detected
        await setSpeaking(false);
        await page.clock.runFor(2200); // silence stop
        assert.ok(!(await isRecording()), 'S16: Stopped after silence');
        const resText16 = await getResult().textContent();
        assert.ok(resText16.includes('Recording error.'), 'S16: Shows Recording error when audio data missing (not No transcription available)');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'S16: No play button when audio acquisition failed');
        await page.evaluate(() => { window.t.emptyChunks = false; });

        // --- Scenario 17: 5秒未満の手動停止 ---
        await clickRecord(true); // Manual mode allows manual stop via recBtn
        await page.clock.runFor(1500); // 1.5s elapsed without speech
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S17: Stopped via manual recBtn at 1.5s');
        const resText17 = await getResult().textContent();
        assert.ok(!resText17.includes('No speech detected within 5 seconds.'), 'S17: Does NOT show 5s timeout on early manual stop');
        assert.ok(resText17.includes('… Not yet'), 'S17: Shows initial Not yet state');

        // --- Scenario 18: MediaRecorder異常終了 (stop exception) ---
        await page.evaluate(() => { window.t.failRecorderStop = true; });
        await clickRecord(true);
        await page.clock.runFor(1000);
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(2600); // fallback watchdog
        assert.ok(!(await isRecording()), 'S18: Fallback watchdog stops cleanly even when recorder.stop throws');
        await page.evaluate(() => { window.t.failRecorderStop = false; });

        // --- Scenario 19: 停止条件の競合・二重停止 ---
        await clickRecord(true);
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active:not(:disabled)');
            if (stopBtn) {
                stopBtn.click();
                stopBtn.click();
            }
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S19: Recording stopped cleanly without duplication errors');

        // Verify Autostop mode keeps recBtn disabled without .stop-btn-active red border
        await clickRecord(false);
        await page.clock.runFor(100);
        const autostopDisabled = await page.evaluate(() => {
            const recBtn = document.querySelector('#drillsContainer .drill-row .drill-record-btn');
            return recBtn?.disabled === true && !recBtn?.classList.contains('stop-btn-active');
        });
        assert.equal(autostopDisabled, true, 'Autostop recording must keep recBtn disabled without .stop-btn-active');
        await page.clock.runFor(5200); // Wait for 5s silence timeout to clear autostop session cleanly

        // --- Scenario 20: 既存のドイツ語文字起こし・判定・保存機能の維持 ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Ich fliege nach Berlin.');
        await setSpeaking(false);
        await page.clock.runFor(2200);

        const resText20 = await getResult().textContent();
        assert.ok(resText20.includes('Ich fliege nach Berlin.'), 'S20: Contains the current D1 Item 1 recognized sentence');
        assert.equal(await getResult().locator('.feedback-status-accepted').count(), 1, 'S20: Contains accepted status badge');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 1, 'S20: Play button exists for accepted answer');

        // --- Scenario 20B: Per-Drill Copy isolation, state, help text, raw STT, and reset ---
        const copyHelpTexts = await page.locator('.uebung-copy-help').evaluateAll(els => els.map(el => el.textContent.trim()));
        assert.deepEqual(
            copyHelpTexts,
            Array(4).fill('Copy your drill results to review or share.'),
            'All 4 Copy areas must use standardized per-drill help copy'
        );
        assert.deepEqual(
            await copyButtons.evaluateAll(buttons => buttons.map(button => button.disabled)),
            [false, true, true, true],
            'Drill 1 answer must enable only Drill 1 Copy button while Drills 2-4 remain disabled'
        );

        await clickRecordInDrill(2);
        assert.deepEqual(
            await copyButtons.evaluateAll(buttons => buttons.map(button => button.disabled)),
            [true, true, true, true],
            'All Copy buttons must be disabled while any recording session is active'
        );
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Du fliegst in die Türkei.');
        await setSpeaking(false);
        await page.clock.runFor(2300);
        assert.ok(!(await isRecording()), 'D2 Copy setup: recording completed');
        assert.deepEqual(
            await copyButtons.evaluateAll(buttons => buttons.map(button => button.disabled)),
            [false, false, true, true],
            'Drills 1 and 2 answers must enable only Drills 1 and 2 Copy buttons while Drills 3-4 remain disabled'
        );

        // Pressing Drill 1's button copies only Drill 1 without Drill 2 contamination.
        await page.locator('#drill1 .uebung-copy-button').click();
        await page.waitForFunction(() => window.t.clipboardWrites.length === 1);
        const copiedD1 = await page.evaluate(() => window.t.clipboardWrites[0]);
        const d1Headers = copiedD1.match(/Deutsche Übung 1\.1 — Drill \d+: .* — \d{4}-\d{2}-\d{2}/g) || [];
        assert.equal(d1Headers.length, 1, 'Drill 1 Copy must include only one dated heading');
        assert.ok(copiedD1.includes('Deutsche Übung 1.1 — Drill 1: nach —'), 'Drill 1 Copy must contain Drill 1 heading');
        assert.ok(copiedD1.includes('1. ✅ Ich fliege nach Berlin.'), 'Drill 1 Copy must contain Drill 1 raw STT and accepted marker');
        assert.ok(!copiedD1.includes('Drill 2:') && !copiedD1.includes('Du fliegst in die Türkei.'), 'Drill 1 Copy must not include Drill 2 answers');
        assert.ok(!copiedD1.includes('Ich / fliegen / Berlin'), 'Copy must not contain Drill 1 cue text');
        assert.ok(!copiedD1.includes('…') && !copiedD1.includes('＿'), 'Copy must not include screen-only symbols');

        await page.clock.runFor(2000);

        // Pressing Drill 2's button copies only Drill 2 without Drill 1 contamination.
        await page.locator('#drill2 .uebung-copy-button').click();
        await page.waitForFunction(() => window.t.clipboardWrites.length === 2);
        const copiedD2 = await page.evaluate(() => window.t.clipboardWrites[1]);
        const d2Headers = copiedD2.match(/Deutsche Übung 1\.1 — Drill \d+: .* — \d{4}-\d{2}-\d{2}/g) || [];
        assert.equal(d2Headers.length, 1, 'Drill 2 Copy must include only one dated heading');
        assert.ok(copiedD2.includes('Deutsche Übung 1.1 — Drill 2: in —'), 'Drill 2 Copy must contain Drill 2 heading');
        assert.ok(copiedD2.includes('1. ✅ Du fliegst in die Türkei.'), 'Drill 2 Copy must contain Drill 2 raw STT and accepted marker');
        assert.ok(!copiedD2.includes('Drill 1:') && !copiedD2.includes('Ich fliege nach Berlin.'), 'Drill 2 Copy must not include Drill 1 answers');
        assert.ok(!copiedD2.includes('Cities & Countries'), 'Copy header must not include duplicate learning focus');
        assert.ok(!copiedD2.includes('Du / fliegen / die Türkei'), 'Copy must not contain Drill 2 cue text');

        const copyBtn2Label = page.locator('#drill2 .uebung-copy-button .uebung-copy-label');
        const copyBtn1Label = page.locator('#drill1 .uebung-copy-button .uebung-copy-label');
        await page.waitForFunction(() => document.querySelector('#drill2 .uebung-copy-button .uebung-copy-label')?.textContent === 'Copied');
        assert.equal(await copyBtn2Label.textContent(), 'Copied', 'Clicked button label must change to Copied');
        assert.equal(await copyBtn1Label.textContent(), 'Copy my sentences', 'Other copy buttons must keep Copy my sentences');
        await page.clock.runFor(2000);
        assert.equal(await copyBtn2Label.textContent(), 'Copy my sentences', 'Clicked button label must revert after two seconds');

        // Clipboard failure must never change button label to Copied.
        await page.evaluate(() => { window.t.clipboardFailure = true; });
        await page.locator('#drill1 .uebung-copy-button').click();
        await page.clock.runFor(100);
        assert.equal(await copyBtn1Label.textContent(), 'Copy my sentences', 'Clipboard failure must keep Copy my sentences');
        await page.evaluate(() => { window.t.clipboardFailure = false; });

        // --- Incomplete random encouragement tooltip (mouseenter/focus + DrillTooltips.position) + Row-2 vertical stacking (Keep going! + notice) ---
        await clickRecordInDrill(3);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Er fährt zum');
        await setSpeaking(false);
        await page.clock.runFor(2200);
        const incompleteCheck = await page.evaluate(() => {
            const tips = ['Getting closer!', 'Almost there!', 'Keep it up!', 'Nice flow!', 'Great start!'];
            const wrap = document.querySelector('#drill3 .drill-row .uebung-incomplete-wrap');
            const box = wrap?.querySelector('.custom-tip-box');
            if (!wrap || !box) return { found: false };
            const initial = box.textContent;
            let positioned = 0;
            const origPos = window.DrillTooltips?.position;
            if (window.DrillTooltips) {
                window.DrillTooltips.position = (h, b) => {
                    positioned++;
                    return origPos?.(h, b);
                };
            }
            const seen = new Set([initial]);
            for (let i = 0; i < 15; i++) {
                wrap.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
                seen.add(box.textContent);
                wrap.dispatchEvent(new FocusEvent('focus'));
                seen.add(box.textContent);
            }
            if (window.DrillTooltips && origPos) window.DrillTooltips.position = origPos;
            return {
                found: true,
                tabIndex: wrap.tabIndex,
                role: box.getAttribute('role'),
                allValid: [...seen].every(t => tips.includes(t)),
                rerolledVariety: seen.size >= 2,
                positionedCount: positioned
            };
        });
        assert.deepEqual(incompleteCheck, {
            found: true,
            tabIndex: 0,
            role: 'tooltip',
            allValid: true,
            rerolledVariety: true,
            positionedCount: 30
        }, 'D1.1 incomplete mark exposes accessible tooltip that rerolls and repositions on mouseenter/focus');

        // Stack Keep going! and notice vertically inside #drill3 .result-sub-row
        await clickRecordInDrill(3);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Er fährt in Krankenhaus.');
        await setSpeaking(false);
        await page.clock.runFor(2200);
        await clickRecordInDrill(3);
        await advanceToElapsed(5200);
        await page.clock.runFor(100);
        const subRowStackCheck = await page.evaluate(() => {
            const subRow = document.querySelector('#drill3 .drill-row .recording-result > .result-sub-row');
            const retry = subRow?.querySelector('.feedback-retry-label');
            const notice = subRow?.querySelector('.result-notice');
            if (!subRow || !retry || !notice) return { found: false };
            const rRect = retry.getBoundingClientRect();
            const nRect = notice.getBoundingClientRect();
            const cs = getComputedStyle(subRow);
            return {
                found: true,
                flexDir: cs.flexDirection,
                stackedVertically: nRect.top >= rRect.bottom - 2,
                retryText: retry.textContent.trim(),
                noticeText: notice.textContent.trim()
            };
        });
        assert.deepEqual(subRowStackCheck, {
            found: true,
            flexDir: 'column',
            stackedVertically: true,
            retryText: 'Keep going!',
            noticeText: 'No speech detected within 5 seconds.'
        }, 'D1.1 .result-sub-row stacks Keep going! and session notice vertically');

        // --- Scenario 20b: Auto-Compare ON Relay Playback State Transitions (10 items + 5 independent conditions) ---
        await page.evaluate(() => {
            const toggle = document.getElementById('togglePlaybackMode');
            if (toggle && !toggle.checked) toggle.click();
        });
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await page.evaluate(() => {
            const rec = window.t.recognitions.at(-1);
            rec?.onresult?.({
                resultIndex: 0,
                results: [{ isFinal: true, 0: { transcript: 'Ich fliege nach Berlin.' } }]
            });
        });
        await setSpeaking(false);
        await page.clock.runFor(2200);
        // Relay active: both model listen & recorded play buttons show stop regular, Auto-Compare: ON hover, enabled, keep-playback
        const relayActiveState = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const listen = row?.querySelector('.drill-listen-btn');
            const play = row?.querySelector('.play-recording-btn');
            return {
                listenPlaying: listen?.classList.contains('is-playing'),
                playPlaying: play?.classList.contains('is-playing'),
                listenDisabled: listen?.disabled,
                playDisabled: play?.disabled,
                listenKeep: listen?.dataset.keepPlayback,
                playKeep: play?.dataset.keepPlayback,
                listenTip: listen?.querySelector('.custom-tip-box')?.textContent,
                playTip: play?.querySelector('.custom-tip-box')?.textContent,
                otherVoiceDisabled: document.getElementById('voiceSelect')?.disabled,
                settingDisabled: document.querySelector('#germanVarietyControl button')?.disabled,
                copyDisabled: document.querySelector('#drill1 .uebung-copy-button')?.disabled
            };
        });
        assert.equal(relayActiveState.listenPlaying, true, 'Relay must mark model button is-playing');
        assert.equal(relayActiveState.playPlaying, true, 'Relay must mark play button is-playing');
        assert.equal(relayActiveState.listenDisabled, false, 'Relay model stop button must remain enabled');
        assert.equal(relayActiveState.playDisabled, false, 'Relay play stop button must remain enabled');
        assert.equal(relayActiveState.listenKeep, 'true', 'Relay model button must have data-keep-playback');
        assert.equal(relayActiveState.playKeep, 'true', 'Relay play button must have data-keep-playback');
        assert.equal(relayActiveState.listenTip, 'Auto-Compare: ON', 'Relay model button must show Auto-Compare: ON');
        assert.equal(relayActiveState.playTip, 'Auto-Compare: ON', 'Relay play button must show Auto-Compare: ON');
        assert.equal(relayActiveState.otherVoiceDisabled, true, 'Voice selector must be disabled during relay playback');
        assert.equal(relayActiveState.settingDisabled, true, 'Settings must be disabled during relay playback');
        assert.equal(relayActiveState.copyDisabled, false, 'Copy button must remain enabled during playback');

        // Stop from model button -> restores both buttons and re-evaluates sync()
        await page.locator('#drill1 .drill-row .drill-listen-btn').click();
        await page.clock.runFor(100);
        const relayClearedState = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const listen = row?.querySelector('.drill-listen-btn');
            const play = row?.querySelector('.play-recording-btn');
            return {
                listenPlaying: listen?.classList.contains('is-playing'),
                playPlaying: play?.classList.contains('is-playing'),
                listenTip: listen?.querySelector('.custom-tip-box')?.textContent,
                playTip: play?.querySelector('.custom-tip-box')?.textContent,
                hasIconWrap: Boolean(listen?.querySelector('.ex-audio-icon svg')),
                recDisabled: row?.querySelector('.drill-record-btn')?.disabled,
                otherVoiceDisabled: document.getElementById('voiceSelect')?.disabled
            };
        });
        assert.equal(relayClearedState.listenPlaying, false, 'Stopping from model button must restore model button');
        assert.equal(relayClearedState.playPlaying, false, 'Stopping from model button must restore play button');
        assert.equal(relayClearedState.listenTip, 'Listen to the model answer.', 'Stopping must restore original Drill 1-1 listen hover');
        assert.equal(relayClearedState.playTip, 'Play your recorded voice.', 'Stopping must restore original Drill 1-1 play hover');
        assert.equal(relayClearedState.hasIconWrap, true, 'Stopping must preserve .ex-audio-icon wrapper');
        assert.equal(relayClearedState.recDisabled, false, 'sync() must re-enable rec button after playback stops');
        assert.equal(relayClearedState.otherVoiceDisabled, false, 'Voice selector must re-enable after playback stops');

        // Relay intermediate transition (model natural end -> recorded audio phase) preserves exclusive disabled & stops cleanly at end
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Ich fliege nach Berlin.');
        await setSpeaking(false);
        await page.clock.runFor(2200);
        await page.evaluate(() => {
            const utt = window.t.utterances.at(-1);
            utt?.onend?.();
        });
        await page.clock.runFor(50);
        const relayMidState = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            return {
                listenPlaying: row?.querySelector('.drill-listen-btn')?.classList.contains('is-playing'),
                playPlaying: row?.querySelector('.play-recording-btn')?.classList.contains('is-playing'),
                voiceDisabled: document.getElementById('voiceSelect')?.disabled,
                otherListenDisabled: document.querySelectorAll('#drill1 .drill-row .drill-listen-btn')[1]?.disabled
            };
        });
        assert.equal(relayMidState.listenPlaying, true, 'Relay transition to recorded phase must keep listen is-playing');
        assert.equal(relayMidState.playPlaying, true, 'Relay transition to recorded phase must keep play is-playing');
        assert.equal(relayMidState.voiceDisabled, true, 'Relay transition must preserve exclusive disabled lock');
        assert.equal(relayMidState.otherListenDisabled, true, 'Relay transition must keep other rows disabled');
        await page.evaluate(() => {
            const aud = window.t.audios.at(-1);
            aud?.onended?.();
        });
        await page.clock.runFor(50);
        assert.equal(await page.evaluate(() => document.getElementById('voiceSelect')?.disabled), false, 'Relay full completion must release exclusive disabled');

        // --- Scenario 20c: Single playback natural completion, late-event protection, & same-button re-click stop ---
        await page.locator('#drill1 .drill-row .drill-listen-btn').click();
        await page.clock.runFor(50);
        const oldUtteranceIdx = await page.evaluate(() => window.t.utterances.length - 1);
        const singlePlayingState = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const listen = row?.querySelector('.drill-listen-btn');
            const rec = row?.querySelector('.drill-record-btn');
            const play = row?.querySelector('.play-recording-btn');
            return {
                listenPlaying: listen?.classList.contains('is-playing'),
                listenKeep: listen?.dataset.keepPlayback,
                recDisabled: rec?.disabled,
                playDisabled: play?.disabled,
                copyDisabled: document.querySelector('#drill1 .uebung-copy-button')?.disabled
            };
        });
        assert.equal(singlePlayingState.listenPlaying, true, 'Single Drill listen click must start playback');
        assert.equal(singlePlayingState.listenKeep, 'true', 'Playing button must set data-keep-playback=true');
        assert.equal(singlePlayingState.recDisabled, true, 'Record button must be disabled during single playback');
        assert.equal(singlePlayingState.playDisabled, true, 'Other play button must be disabled during single playback');
        assert.equal(singlePlayingState.copyDisabled, false, 'Copy button must remain enabled during single playback');

        // Natural completion of Drill model playback must restore button and unlock others
        await page.evaluate(idx => { window.t.utterances[idx]?.onend?.(); }, oldUtteranceIdx);
        await page.clock.runFor(50);
        assert.equal(await page.evaluate(() => document.querySelector('#drill1 .drill-row .drill-listen-btn')?.classList.contains('is-playing')), false, 'Drill model natural end must clear is-playing');
        assert.equal(await page.evaluate(() => document.querySelector('#drill1 .drill-row .drill-record-btn')?.disabled), false, 'Drill model natural end must re-enable controls');

        // Start recorded playback, verify natural end + late stale event immunity
        await page.locator('#drill1 .drill-row .play-recording-btn').click();
        await page.clock.runFor(50);
        const recPlayAudioIdx = await page.evaluate(() => window.t.audios.length - 1);
        // Fire stale utterance onend from previous playback -> must NOT unlock or disturb active recorded playback
        await page.evaluate(idx => { window.t.utterances[idx]?.onend?.(); }, oldUtteranceIdx);
        await page.clock.runFor(20);
        assert.equal(await page.evaluate(() => document.querySelector('#drill1 .drill-row .play-recording-btn')?.classList.contains('is-playing')), true, 'Stale utterance end event must not clear active recorded playback');
        // Now fire natural end on active recorded audio -> restores cleanly
        await page.evaluate(idx => { window.t.audios[idx]?.onended?.(); }, recPlayAudioIdx);
        await page.clock.runFor(50);
        assert.equal(await page.evaluate(() => document.querySelector('#drill1 .drill-row .play-recording-btn')?.classList.contains('is-playing')), false, 'Recorded playback natural end must clear is-playing');
        assert.equal(await page.evaluate(() => document.getElementById('voiceSelect')?.disabled), false, 'Recorded playback natural end must release disabled lock');

        // Re-click the SAME playing button -> must ONLY stop, NOT restart
        await page.locator('#drill1 .drill-row .drill-listen-btn').click();
        await page.clock.runFor(50);
        await page.locator('#drill1 .drill-row .drill-listen-btn').click();
        await page.clock.runFor(50);
        const reclickStoppedState = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const listen = row?.querySelector('.drill-listen-btn');
            return {
                listenPlaying: listen?.classList.contains('is-playing'),
                listenKeep: listen?.dataset.keepPlayback,
                hasIconWrap: Boolean(listen?.querySelector('.ex-audio-icon svg')),
                recDisabled: row?.querySelector('.drill-record-btn')?.disabled
            };
        });
        assert.equal(reclickStoppedState.listenPlaying, false, 'Re-clicking playing button must stop playback without restarting');
        assert.equal(reclickStoppedState.listenKeep, undefined, 'Stopped button must clear data-keep-playback');
        assert.equal(reclickStoppedState.hasIconWrap, true, 'Stopped button must preserve .ex-audio-icon SVG wrapper');
        assert.equal(reclickStoppedState.recDisabled, false, 'Other buttons must re-enable after stop');

        // --- Scenario 20d: Visual & Coordinate Checks (Mismatch split Fire/Keep going, Drill 3-1 stack alignment, Global settings/warnings) ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await triggerRecognition('Ich fliege zu Berlin.');
        const duringRecText = await getResult().locator('.result-main-row > .result-text').textContent();
        assert.equal(duringRecText, 'Recording...', 'D1.1 hides intermediate STT text and keeps Recording... until recording stops');
        await setSpeaking(false);
        await page.clock.runFor(2200);
        await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });
        await page.clock.runFor(50);

        const mismatchLayout = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const resText = row?.querySelector('.recording-result > .result-main-row > .result-text');
            const subRow = row?.querySelector('.recording-result > .result-sub-row');
            const fire = resText?.querySelector('.feedback-retry-fire');
            const retry = subRow?.querySelector('.feedback-retry-label');
            const fireRect = fire?.getBoundingClientRect();
            const retryRect = retry?.getBoundingClientRect();
            return {
                isFireFirstChild: resText?.firstElementChild === fire,
                hasSubRowRetry: Boolean(retry),
                subRowVisible: Boolean(subRow && !subRow.hidden),
                retryBelowMainRow: fireRect && retryRect ? retryRect.top >= fireRect.bottom - 2 : false,
                retryFontSize: retry ? window.getComputedStyle(retry).fontSize : null,
                resTextAlign: resText ? window.getComputedStyle(resText).textAlign : null,
                resDisplay: resText ? window.getComputedStyle(resText).display : null,
                html: resText?.innerHTML || ''
            };
        });
        assert.equal(mismatchLayout.isFireFirstChild, true, 'Mismatch must place 🔥 icon at the start of .result-text');
        assert.equal(mismatchLayout.hasSubRowRetry, true, 'Mismatch must place Keep going! label inside .result-sub-row');
        assert.equal(mismatchLayout.subRowVisible, true, 'Mismatch must show .result-sub-row');
        assert.equal(mismatchLayout.retryBelowMainRow, true, 'Keep going! in .result-sub-row must render below row 1');
        assert.equal(mismatchLayout.retryFontSize, '18.2px', 'Inline Keep going! must be 18.2px');
        assert.equal(mismatchLayout.resTextAlign, 'right', 'Result text must be right-aligned');
        assert.notEqual(mismatchLayout.resDisplay, 'flex', 'Result text must not be flex container');
        assert.ok(mismatchLayout.html.includes('fliege <span class="result-incorrect">'), 'Mismatch must preserve space between tokens');

        // Verify .result-incorrect weight (400) & Light/Dark error color unity with P8.2
        const errStyleLight = await page.evaluate(() => {
            const inc = document.querySelector('#drill1 .drill-row .result-incorrect');
            const cs = inc ? getComputedStyle(inc) : null;
            return cs ? { fw: cs.fontWeight, color: cs.color } : null;
        });
        assert.deepEqual(errStyleLight, { fw: '400', color: 'rgb(225, 29, 72)' }, 'Light mode .result-incorrect must use weight 400 and #E11D48');
        await page.emulateMedia({ colorScheme: 'dark' });
        const errColorDark = await page.evaluate(() => {
            const inc = document.querySelector('#drill1 .drill-row .result-incorrect');
            return inc ? getComputedStyle(inc).color : null;
        });
        assert.equal(errColorDark, 'rgb(255, 138, 165)', 'Dark mode .result-incorrect must match #FF8AA5');
        await page.emulateMedia({ colorScheme: 'light' });

        // Drill 3-1 cue stack alignment (DE/AT/CH) & Part 2 settings/warning visual checks
        const d1AlignRef = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const num = row?.querySelector('.drill-number-cell');
            const btn = row?.querySelector('.drill-listen-btn');
            const rr = row?.getBoundingClientRect();
            const nr = num?.getBoundingClientRect();
            const br = btn?.getBoundingClientRect();
            return (rr && nr && br) ? { numTopOffset: nr.top - rr.top, btnTopOffset: br.top - rr.top } : null;
        });
        const checkDrill3Alignment = async (varietyCode) => {
            await page.locator(`#germanVarietyControl button[data-value="${varietyCode}"]`).click();
            await page.clock.runFor(50);
            return page.evaluate((ref) => {
                const row = document.querySelector('#drill3 .drill-row');
                const cueCell = row?.querySelector('.drill-cue-cell');
                const numCell = row?.querySelector('.drill-number-cell');
                const listenBtn = row?.querySelector('.drill-listen-btn');
                const stack = cueCell?.querySelector('.uebung-cue-place-stack');
                const rowRect = row?.getBoundingClientRect();
                const stackRect = stack?.getBoundingClientRect();
                const altText = stack?.querySelector('.uebung-cue-alt-text');
                const altTextRect = altText?.getBoundingClientRect();
                const flags = stack?.querySelector('.uebung-cue-alt-flags');
                const flagsRect = flags?.getBoundingClientRect();
                const numRect = numCell?.getBoundingClientRect();
                const btnRect = listenBtn?.getBoundingClientRect();
                const d3NumOffset = (rowRect && numRect) ? numRect.top - rowRect.top : -1;
                const d3BtnOffset = (rowRect && btnRect) ? btnRect.top - rowRect.top : -1;
                // Verify slash preceding the stack is strictly on line 1 above flagsRect.top
                return {
                    aligned: stackRect && altTextRect ? Math.abs(stackRect.left - altTextRect.left) <= 1 : false,
                    flagsLeftOfText: flagsRect && altTextRect ? flagsRect.right <= altTextRect.left : false,
                    altBelowLine1: stackRect && altTextRect && flagsRect ? (altTextRect.top > stackRect.top && flagsRect.top > stackRect.top) : false,
                    line1NumAligned: ref ? Math.abs(d3NumOffset - ref.numTopOffset) <= 2 : false,
                    line1BtnAligned: ref ? Math.abs(d3BtnOffset - ref.btnTopOffset) <= 2 : false,
                    speakerClearance: altTextRect && btnRect ? (altTextRect.right + 4 <= btnRect.left) : false
                };
            }, d1AlignRef);
        };
        for (const vCode of ['DE', 'AT', 'CH']) {
            const d3Check = await checkDrill3Alignment(vCode);
            assert.deepEqual(
                d3Check,
                { aligned: true, flagsLeftOfText: true, altBelowLine1: true, line1NumAligned: true, line1BtnAligned: true, speakerClearance: true },
                `Drill 3-1 (${vCode}) alt noun must align cleanly with line-1 number/speaker alignment and >=4px speaker clearance`
            );
        }
        await page.locator('#germanVarietyControl button[data-value="DE"]').click();

        const visualAudit = await page.evaluate(() => {
            const hoverIcon = document.querySelector('#hintModeControl button[data-value="hover"] .uebung-setting-icon');
            const autostopIcon = document.querySelector('#labelAutoRecord .uebung-setting-icon');
            const inactiveFlag = document.querySelector('#germanVarietyControl button[data-value="AT"] .uebung-flag-svg');
            const inactiveFlagBtn = document.querySelector('#germanVarietyControl button[data-value="AT"]');
            const ttsWarnIcon = document.querySelector('#germanTtsNotice .fluent-icon-warningFilled.fluent-icon-filled');
            const hoverSvgRectColor = hoverIcon ? window.getComputedStyle(hoverIcon).color : null;
            const voiceHelp = document.querySelector('.voice-help-icon');
            const panelProbe = document.createElement('span');
            panelProbe.style.backgroundColor = 'var(--bg-panel)';
            const warnProbe = document.createElement('span');
            warnProbe.style.color = 'var(--warning-color)';
            document.body.append(panelProbe, warnProbe);
            const panelBg = window.getComputedStyle(panelProbe).backgroundColor;
            const warnTokenColor = window.getComputedStyle(warnProbe).color;
            panelProbe.remove();
            warnProbe.remove();
            return {
                hoverIsFilled: Boolean(hoverIcon?.classList.contains('fluent-icon-chatHintHalfFilled')) && Boolean(hoverIcon?.classList.contains('fluent-icon-filled')),
                hoverAmberColor: hoverSvgRectColor,
                autostopAmberColor: autostopIcon ? window.getComputedStyle(autostopIcon).color : null,
                inactiveFlagDimmed: inactiveFlag ? window.getComputedStyle(inactiveFlag).opacity === '0.55' : false,
                inactiveBtnNotDimmed: inactiveFlagBtn ? window.getComputedStyle(inactiveFlagBtn).opacity === '1' : false,
                hasFilledTtsWarning: Boolean(ttsWarnIcon),
                voiceHelpBgMatchesPanel: voiceHelp ? window.getComputedStyle(voiceHelp).backgroundColor === panelBg : false,
                warningTokenLight: warnTokenColor
            };
        });
        assert.equal(visualAudit.hoverIsFilled, true, 'Hover icon must use chatHintHalfFilled Filled icon');
        assert.equal(visualAudit.hoverAmberColor, 'rgb(251, 191, 36)', 'Selected Hover icon must use #fbbf24');
        assert.equal(visualAudit.autostopAmberColor, 'rgb(251, 191, 36)', 'Autostop icon must use #fbbf24');
        assert.equal(visualAudit.inactiveFlagDimmed, true, 'Inactive flag SVG must be dimmed');
        assert.equal(visualAudit.inactiveBtnNotDimmed, true, 'Inactive variety button text must stay full opacity');
        assert.equal(visualAudit.hasFilledTtsWarning, true, '#germanTtsNotice must render warningFilled SVG');
        assert.equal(visualAudit.voiceHelpBgMatchesPanel, true, '.voice-help-icon must use defined --bg-panel instead of undefined --bg-card');
        assert.equal(visualAudit.warningTokenLight, 'rgb(217, 119, 6)', ':root --warning-color in light mode must be #d97706');

        // Notice deduplication & 3-level transitions (Info / Warning / Error)
        await page.evaluate(() => {
            window.__origGetVoices = window.speechSynthesis.getVoices.bind(window.speechSynthesis);
            window.speechSynthesis.getVoices = () => [];
            window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));
        });
        await page.clock.runFor(1100);
        const zeroVoicesState = await page.evaluate(() => {
            const banner = document.getElementById('germanTtsNotice');
            const region = document.getElementById('voiceRegionNotice');
            const icon = banner?.querySelector('.german-tts-notice-icon svg');
            const cs = banner ? window.getComputedStyle(banner) : null;
            return {
                bannerHidden: banner?.hidden,
                bannerHasIsError: banner?.classList.contains('is-error'),
                bannerRole: banner?.getAttribute('role'),
                bannerLive: banner?.getAttribute('aria-live'),
                bannerIconWarning: Boolean(icon?.classList.contains('fluent-icon-warningFilled')),
                bannerIconColor: icon ? window.getComputedStyle(icon).color : null,
                bannerLeftBorderColor: cs?.borderLeftColor,
                regionHidden: region?.hidden
            };
        });
        assert.deepEqual(zeroVoicesState, {
            bannerHidden: false,
            bannerHasIsError: false,
            bannerRole: 'status',
            bannerLive: 'polite',
            bannerIconWarning: true,
            bannerIconColor: 'rgb(217, 119, 6)',
            bannerLeftBorderColor: 'rgb(217, 119, 6)',
            regionHidden: true
        }, '0 German voices must show Warning only in #germanTtsNotice and hide #voiceRegionNotice');

        await page.locator('#germanVarietyControl button[data-value="AT"]').click();
        await page.evaluate(() => {
            window.speechSynthesis.getVoices = () => [
                { name: 'Mock German DE', lang: 'de-DE', default: false, localService: true, voiceURI: 'mock-de' }
            ];
            window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));
        });
        await page.clock.runFor(50);
        const infoNoticeState = await page.evaluate(() => {
            const banner = document.getElementById('germanTtsNotice');
            const region = document.getElementById('voiceRegionNotice');
            const icon = region?.querySelector('svg');
            const secProbe = document.createElement('span');
            secProbe.style.color = 'var(--text-secondary)';
            document.body.append(secProbe);
            const secColor = window.getComputedStyle(secProbe).color;
            secProbe.remove();
            return {
                bannerHidden: banner?.hidden,
                regionHidden: region?.hidden,
                regionRole: region?.getAttribute('role'),
                regionLive: region?.getAttribute('aria-live'),
                hasInfoRegularIcon: Boolean(icon?.classList.contains('fluent-icon-info')) && !Boolean(icon?.classList.contains('fluent-icon-filled')),
                regionColorMatchesSecondary: region ? window.getComputedStyle(region).color === secColor : false
            };
        });
        assert.deepEqual(infoNoticeState, {
            bannerHidden: true,
            regionHidden: false,
            regionRole: 'status',
            regionLive: 'polite',
            hasInfoRegularIcon: true,
            regionColorMatchesSecondary: true
        }, 'Regional fallback with >=1 German voices must hide startup #germanTtsNotice and show #voiceRegionNotice as Info');

        // Switching to matching variety hides #voiceRegionNotice
        await page.locator('#germanVarietyControl button[data-value="DE"]').click();
        assert.equal(await page.evaluate(() => document.getElementById('voiceRegionNotice')?.hidden), true, '#voiceRegionNotice must hide when native regional voice exists');

        // Warning <-> Error state transition inside #germanTtsNotice
        await page.locator('#drill1 .drill-row .drill-listen-btn').first().click();
        await page.evaluate(() => {
            const u = window.t.utterances.at(-1);
            u?.onerror?.({ error: 'synthesis-failed' });
        });
        await page.clock.runFor(50);
        const errorNoticeState = await page.evaluate(() => {
            const banner = document.getElementById('germanTtsNotice');
            const icon = banner?.querySelector('.german-tts-notice-icon svg');
            return {
                bannerHidden: banner?.hidden,
                hasIsError: banner?.classList.contains('is-error'),
                role: banner?.getAttribute('role'),
                live: banner?.getAttribute('aria-live'),
                hasErrorCircleFilled: Boolean(icon?.classList.contains('fluent-icon-errorCircleFilled')) && Boolean(icon?.classList.contains('fluent-icon-filled')),
                iconColor: icon ? window.getComputedStyle(icon).color : null
            };
        });
        assert.deepEqual(errorNoticeState, {
            bannerHidden: false,
            hasIsError: true,
            role: 'alert',
            live: 'assertive',
            hasErrorCircleFilled: true,
            iconColor: 'rgb(220, 38, 38)'
        }, 'Error notice must switch icon to errorCircleFilled, apply .is-error and role=alert / aria-live=assertive');

        // Transition back from Error to Warning
        await page.evaluate(() => {
            window.speechSynthesis.getVoices = () => [];
            window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));
        });
        await page.clock.runFor(1100);
        const revertedWarningState = await page.evaluate(() => {
            const banner = document.getElementById('germanTtsNotice');
            const icon = banner?.querySelector('.german-tts-notice-icon svg');
            const region = document.getElementById('voiceRegionNotice');
            return {
                bannerHidden: banner?.hidden,
                hasIsError: banner?.classList.contains('is-error'),
                role: banner?.getAttribute('role'),
                live: banner?.getAttribute('aria-live'),
                hasWarningFilled: Boolean(icon?.classList.contains('fluent-icon-warningFilled')),
                regionHidden: region?.hidden
            };
        });
        assert.deepEqual(revertedWarningState, {
            bannerHidden: false,
            hasIsError: false,
            role: 'status',
            live: 'polite',
            hasWarningFilled: true,
            regionHidden: true
        }, 'Warning restoration after Error must remove .is-error and restore warningFilled, status/polite, and hide #voiceRegionNotice');

        // Restore original getVoices cleanly
        await page.evaluate(() => {
            if (window.__origGetVoices) {
                window.speechSynthesis.getVoices = window.__origGetVoices;
                delete window.__origGetVoices;
            }
            window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));
        });
        await page.clock.runFor(50);

        // --- Scenario 20e: Recognized STT without audio volume threshold does NOT false-timeout at 5s ---
        await page.evaluate(() => {
            const toggle = document.getElementById('togglePlaybackMode');
            if (toggle && !toggle.checked) toggle.click();
        });
        await clickRecord(true); // Manual mode
        // Push MediaRecorder audio chunk directly without triggering volume threshold (speaking = false)
        await page.evaluate(() => {
            const rec = window.t.recorders.at(-1);
            rec?.ondataavailable?.({ data: new Blob(['low-vol-audio'], { type: 'audio/webm' }) });
        });
        await triggerRecognition('Ich fliege nach Berlin.');
        await page.clock.runFor(5200); // Exceed 5s timer
        assert.equal(await isRecording(), true, '5s watchdog must NOT cancel when STT text is already recognized');
        await page.evaluate(() => {
            document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active')?.click();
        });
        await page.clock.runFor(100);
        const lowVolResText = await getResult().textContent();
        assert.ok(!lowVolResText.includes('No speech detected within 5 seconds.'), 'Must NOT show 5s timeout when STT recognized');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 1, 'Must save non-empty audio chunks and render [▶] when STT recognized');
        assert.equal(await page.evaluate(() => document.querySelector('#drill1 .drill-row .drill-listen-btn')?.classList.contains('is-playing')), true, 'Auto-Compare ON relay must start when valid STT + URL exist');
        await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });
        await page.clock.runFor(50);

        // Recognized STT with empty chunks must keep STT text but NOT generate [▶] play button
        await page.evaluate(() => { window.t.emptyChunks = true; });
        await clickRecord(true);
        await triggerRecognition('Ich fliege nach Berlin.');
        await page.clock.runFor(5200);
        await page.evaluate(() => {
            document.querySelector('#drillsContainer .recording-actions .drill-record-btn.stop-btn-active')?.click();
        });
        await page.clock.runFor(100);
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'Empty chunks must NOT render [▶] play button even if STT recognized');
        await page.evaluate(() => { window.t.emptyChunks = false; });

        // Verify pagehide cleanup listener
        await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });
        await page.clock.runFor(50);

        // --- Scenario 21: Typography & Computed Font Size Verification (18.2px / 20.8px / 15.6px) ---
        // 1. Normal STT extracted text: 20.8px
        const normalSttSize = await page.evaluate(() => {
            const el = document.querySelector('#drillsContainer .recording-result .result-text');
            return window.getComputedStyle(el).fontSize;
        });
        assert.equal(normalSttSize, '20.8px', 'Normal STT extracted text must be 20.8px');

        // 2. Unrecorded "… Not yet": 15.6px
        const notYetSize = await page.evaluate(() => {
            const el = document.querySelectorAll('#drillsContainer .recording-result .not-recorded-yet')[1];
            return window.getComputedStyle(el).fontSize;
        });
        assert.equal(notYetSize, '15.6px', 'Unrecorded "... Not yet" must be 15.6px');

        // 3. Preparing microphone...: 18.2px
        const prepSize = await page.evaluate(() => {
            const el = document.querySelectorAll('#drillsContainer .recording-result .result-text')[2];
            el.classList.remove('not-recorded-yet');
            el.classList.add('recording-status');
            el.textContent = 'Preparing microphone...';
            return window.getComputedStyle(el).fontSize;
        });
        assert.equal(prepSize, '18.2px', 'Preparing microphone... status text must be 18.2px');

        // 4. Recording...: 18.2px
        const recSize = await page.evaluate(() => {
            const el = document.querySelectorAll('#drillsContainer .recording-result .result-text')[2];
            el.textContent = 'Recording...';
            return window.getComputedStyle(el).fontSize;
        });
        assert.equal(recSize, '18.2px', 'Recording... status text must be 18.2px');

        // 5. Result notice (timeout / recording error / recognition error): 18.2px
        const noticeSize = await page.evaluate(() => {
            const el = document.querySelectorAll('#drillsContainer .recording-result .result-text')[2];
            el.classList.remove('recording-status');
            el.replaceChildren();
            const note = document.createElement('span');
            note.className = 'result-notice';
            note.textContent = 'No speech detected within 5 seconds.';
            el.append(note);
            return window.getComputedStyle(note).fontSize;
        });
        assert.equal(noticeSize, '18.2px', 'Result notice (timeout / error) must be 18.2px');

        // 6. Answer feedback (.correction-box): 18.2px
        const feedbackSize = await page.evaluate(() => {
            const corr = document.querySelector('#drillsContainer .correction-box');
            return window.getComputedStyle(corr).fontSize;
        });
        assert.equal(feedbackSize, '18.2px', 'Answer feedback (.correction-box) must be 18.2px');

        // --- Scenario 22: Content-Width-First Layout, 25px Hysteresis, and Non-Destructive Resize ---
        await setSpeaking(true);
        await clickRecord(false);
        await page.clock.runFor(400);
        await triggerRecognition('Ich fliege nach Köln.');
        await setSpeaking(false);
        await page.clock.runFor(2200);
        assert.equal(await page.locator('#drill1 .drill-row .play-recording-btn').first().count(), 1,
            'Scenario 22 setup creates saved playback button before resize checks');

        await page.setViewportSize({ width: 650, height: 800 });
        await page.clock.runFor(100);
        const d11LayoutParams = await page.evaluate(() => {
            const section = document.getElementById('drill1');
            const row = section.querySelector('.drill-row');
            const actions = row.querySelector('.recording-actions');
            const copy = actions.cloneNode(true);
            copy.querySelectorAll('.tooltip-tip, .custom-tip-box').forEach(t => t.remove());
            Object.assign(copy.style, { position: 'absolute', visibility: 'hidden', display: 'inline-flex', width: 'max-content', whiteSpace: 'nowrap' });
            row.append(copy);
            const actionsWidth = Math.ceil(copy.getBoundingClientRect().width);
            copy.remove();
            const cueWidth = parseFloat(getComputedStyle(section).getPropertyValue('--drill-cue-width')) || 0;
            const needed = 34 + 16 + cueWidth + actionsWidth + 120;
            const style = getComputedStyle(row);
            const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
            const currentAvailable = row.clientWidth - pad;
            const chromeDelta = window.innerWidth - currentAvailable;
            return { needed, chromeDelta };
        });
        const setOffsetVp = async (offset) => {
            const targetVp = Math.max(320, Math.round(d11LayoutParams.chromeDelta + d11LayoutParams.needed + offset));
            await page.setViewportSize({ width: targetVp, height: 800 });
            await page.clock.runFor(100);
        };

        await page.setViewportSize({ width: 1280, height: 800 });
        await page.clock.runFor(100);
        const wideD11 = await page.evaluate(() => {
            const tbl = document.querySelector('#drill1 .drill-row .recording-table');
            const cue = tbl.querySelector('.drill-cue-cell').getBoundingClientRect();
            const ctrl = tbl.querySelector('td:has(> .recording-controls)').getBoundingClientRect();
            return {
                validGrid: getComputedStyle(tbl).gridTemplateColumns !== 'none',
                layout: tbl.dataset.controlsLayout,
                tracks: getComputedStyle(tbl).gridTemplateColumns.trim().split(/\s+/).length,
                inlineSideBySide: ctrl.left >= cue.right - 2
            };
        });
        assert.deepEqual(wideD11, { validGrid: true, layout: 'inline', tracks: 3, inlineSideBySide: true },
            'D1.1 wide viewport uses valid 3-track inline layout');

        const playBtnBeforeResize = await page.locator('#drill1 .drill-row .play-recording-btn').first().count();
        await setOffsetVp(-20);
        const stackedD11 = await page.evaluate(() => {
            const tbl = document.querySelector('#drill1 .drill-row .recording-table');
            const cue = tbl.querySelector('.drill-cue-cell').getBoundingClientRect();
            const ctrl = tbl.querySelector('td:has(> .recording-controls)').getBoundingClientRect();
            return {
                validGrid: getComputedStyle(tbl).gridTemplateColumns !== 'none',
                layout: tbl.dataset.controlsLayout,
                tracks: getComputedStyle(tbl).gridTemplateColumns.trim().split(/\s+/).length,
                controlsBelowCue: ctrl.top >= cue.bottom - 2
            };
        });
        assert.deepEqual(stackedD11, { validGrid: true, layout: 'stacked', tracks: 2, controlsBelowCue: true },
            'D1.1 switches to valid 2-track stacked layout when content exceeds available width');

        await setOffsetVp(10);
        assert.equal(
            await page.locator('#drill1 .drill-row .recording-table').first().getAttribute('data-controls-layout'),
            'stacked',
            'D1.1 25px hysteresis keeps stacked layout inside [needed, needed + 25) band'
        );

        await setOffsetVp(35);
        assert.equal(
            await page.locator('#drill1 .drill-row .recording-table').first().getAttribute('data-controls-layout'),
            'inline',
            'D1.1 restores inline layout once available width clears 25px hysteresis threshold'
        );
        assert.equal(
            await page.locator('#drill1 .drill-row .play-recording-btn').first().count(),
            playBtnBeforeResize,
            'Non-destructive resize preserves existing recording UI state'
        );

        // Verify [data-theme="dark"] shared status tokens on uebung1.1
        await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
        const d11StatusTokensDark = await page.evaluate(() => {
            const s = getComputedStyle(document.documentElement);
            return {
                inc: s.getPropertyValue('--status-incomplete-color').trim().toLowerCase(),
                mis: s.getPropertyValue('--status-mismatch-color').trim().toLowerCase()
            };
        });
        assert.deepEqual(d11StatusTokensDark, { inc: '#b9a2e5', mis: '#e4ad69' },
            'D1.1 resolves shared dark status color tokens under [data-theme="dark"]');
        await page.evaluate(() => { document.documentElement.removeAttribute('data-theme'); });

        // Resource cleanup check
        const tracksAllEnded = await page.evaluate(() => window.t.tracks.every(tr => tr.readyState === 'ended'));
        assert.ok(tracksAllEnded, 'All microphone tracks ended');
        const contextsClosed = await page.evaluate(() => window.t.contexts.every(c => c.state === 'closed'));
        assert.ok(contextsClosed, 'All AudioContext instances closed');

        // Escape dismiss and suppression checks for Übung 1.1
        const backLink = page.locator('.back-link.custom-tip-wrap').first();
        if (await backLink.count() > 0) {
            await backLink.hover();
            assert.equal(await backLink.locator('.custom-tip-box').evaluate(e => getComputedStyle(e).visibility === 'visible'), true,
                'Uebung 1.1 back-link tooltip visible on hover');
            await page.keyboard.press('Escape');
            assert.equal(await backLink.locator('.custom-tip-box').evaluate(e => getComputedStyle(e).visibility === 'hidden' && parseFloat(getComputedStyle(e).opacity) === 0), true,
                'Uebung 1.1 back-link tooltip hidden on Escape');
            assert.equal(await backLink.evaluate(e => e.getAttribute('data-tip-suppressed') === 'true'), true,
                'Uebung 1.1 back-link tooltip suppressed on Escape');
            await page.mouse.move(0, 0);
            assert.equal(await backLink.evaluate(e => !e.hasAttribute('data-tip-suppressed')), true,
                'Uebung 1.1 back-link suppression cleared on pointer leave');
            await backLink.hover();
            assert.equal(await backLink.locator('.custom-tip-box').evaluate(e => getComputedStyle(e).visibility === 'visible'), true,
                'Uebung 1.1 back-link tooltip re-revealed on new hover');
            await page.mouse.move(0, 0);
        }

        assert.equal(errors.length, 0, 'No uncaught page errors during tests');
        console.log('PASS: All recording lifecycle scenarios (1 to 20) and typography checks passed successfully.');
    } finally {
        await browser.close();
    }
}

runRecordingLifecycleTests().catch(err => {
    console.error('Recording lifecycle test failed:', err);
    process.exit(1);
});
