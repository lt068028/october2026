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
assert.ok(css.includes('.uebung11-page .uebung-copy-area'), 'style.css must have copy-area rules for uebung11');
assert.ok(css.includes('.uebung11-page :is(.ex-audio-btn, .drill-listen-btn, .drill-record-btn, .drill-stop-btn, .play-recording-btn)'), 'CSS must center audio button SVG icons consistently');
assert.ok(css.includes('.uebung11-page .recording-controls > .recording-result {\n    justify-content: flex-end;\n    text-align: right;'), 'Result region must be right-aligned');
assert.ok(css.includes('.uebung11-page .recording-controls > .recording-result .feedback-retry-label'), 'CSS must style inline Keep going! retry label');
assert.ok(css.includes('.uebung11-page .uebung-regional-note'), 'style.css must have simple regional note rules');
assert.ok(css.includes('color: var(--text-secondary);'), 'Regional note must use Option 1 --text-secondary color');
assert.ok(!css.includes('.uebung-supplement-badge'), 'style.css must not use legacy .uebung-supplement-badge pill');

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
assert.ok(js.includes('Copy all your recorded answers to review or share.'), 'JS must describe the all-Drill Copy scope');
assert.ok(js.includes('navigator.clipboard.writeText'), 'JS must use clipboard API');
assert.ok(js.includes('const hasAnyRecordings = drillsData.some'), 'Any saved answer must enable Copy across drills');
assert.ok(js.includes('btn.dataset.keepPlayback = "true";'), 'Copy must preserve audio playback');
assert.ok(js.includes('entries.push(`${idx + 1}. ${marker} ${entry.raw}`)'), 'Copy must include marker and untouched raw STT');
assert.ok(!js.includes('entries.push(`${idx + 1}. ${marker} ${item.cue}: ${entry.raw}`)'), 'Copy must not include the exercise cue');
assert.ok(js.includes('const cleanTitle = d.title.replace(/^Drill \\d+:\\s*/, "").split(/\\s*—\\s*/)[0].trim();'), 'Copy header must strip learning focus duplicate from cleanTitle');
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
assert.ok(incorrectRule && /font-weight:\s*700/.test(incorrectRule[1]), 'Incorrect STT tokens must remain bold');
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
assert.ok(js.includes('if (btn) markPlaying(btn);\n        activeAudio = audio;'), 'playRecording must call markPlaying before setting activeAudio');

// D: Empty STT discards audio without saving
assert.ok(js.includes('if (raw && normRaw && hasValidAudio)'), 'Empty STT must not create Blob URL');
assert.ok(!js.includes('unrecognized: true'), 'Empty STT must not save unrecognized audio entry');

// E: Icons (playCircle normal, stop regular & currentColor)
assert.ok(js.includes('FluentIcons.create("playCircle", 20)'), 'Recording playback button must use playCircle icon');
assert.ok(js.includes('FluentIcons.create("stop", 20, "", "regular")'), 'Playing stop icon must use regular variant');
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
assert.ok(js.includes('No need to press. Autostop is ON.'), 'Must include No need to press. Autostop is ON.');
assert.ok(js.includes('Stop recording.'), 'Must include Stop recording.');
assert.ok(js.includes('isFirstItemOfDrill1'), 'Must conditionally check first item of Drill 1');
assert.ok(js.includes('updateFirstStopTip'), 'Must dynamically update stop tooltip on Autostop toggle');

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

// 8.6 Germanized basic operation button labels
assert.ok(html.includes('↩️ Zurück'), 'HTML must have ↩️ Zurück back link');
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
                clipboardWrites: [],
                clipboardFailure: false,
                speaking: false,
                deny: false,
                recordError: false
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
                            arr.fill(window.t.speaking ? 0.08 : 0);
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

        const getStopBtn = () => page.locator('#drillsContainer .recording-actions button[data-stop]').first();
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

        // --- Scenario 1: Autostop ONで未発話5秒停止 ---
        await clickRecord(false);
        assert.ok(await isRecording(), 'S1: Recording started in Autostop ON');
        await advanceToElapsed(4800);
        assert.ok(await isRecording(), 'S1: Still recording at 4.8s without speech');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S1: Stopped at 5.0s timeout');
        const resText1 = await getResult().textContent();
        assert.ok(resText1.includes('No speech detected within 5 seconds.'), 'S1: Shows 5s timeout message');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'S1: No play button saved');

        // --- Scenario 2: Autostop OFFで未発話5秒停止 ---
        await clickRecord(true); // Manual
        assert.ok(await isRecording(), 'S2: Recording started in Autostop OFF');
        await advanceToElapsed(4800);
        assert.ok(await isRecording(), 'S2: Still recording at 4.8s in Manual');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S2: Stopped at 5.0s timeout in Manual');
        const resText2 = await getResult().textContent();
        assert.ok(resText2.includes('No speech detected within 5 seconds.'), 'S2: Shows 5s timeout message');
        assert.equal(await getResult().locator('.play-recording-btn').count(), 0, 'S2: No play button saved');

        // --- Scenario 3: onspeechstart先行でも5秒タイムアウトが成立 ---
        // (SpeechRecognition mock automatically dispatches onspeechstart at 50ms)
        await clickRecord(false);
        await page.clock.runFor(2500); // 2.5s elapsed (well past 2.0s from onspeechstart)
        assert.ok(await isRecording(), 'S3: Premature onspeechstart does NOT trigger 2s silence stop');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S3: Auto-stopped at 5s timeout despite onspeechstart');
        assert.ok((await getResult().textContent()).includes('No speech detected within 5 seconds.'), 'S3: 5s timeout message');

        // --- Scenario 4: onresult先行でも5秒タイムアウトが成立 ---
        await clickRecord(false);
        // Early onresult without microphone volume activity
        await page.clock.runFor(200);
        await triggerRecognition('Frühzeitiger Text');
        await page.clock.runFor(2500); // Past 2s from onresult
        assert.ok(await isRecording(), 'S4: onresult alone without mic volume does NOT trigger 2s silence stop');
        await advanceToElapsed(5100);
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S4: Stops at 5.0s timeout');

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

        // --- Scenario 6: Autostop OFFで発話後2秒無音停止しない ---
        await clickRecord(true); // Manual
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await setSpeaking(false);
        await page.clock.runFor(4000); // 4.0s silence
        assert.ok(await isRecording(), 'S6: Manual mode does NOT auto-stop on silence');
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions button[data-stop]:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S6: Stopped via manual stop button');

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
        await clickRecord(true); // Manual mode allows manual stop button
        await page.clock.runFor(1500); // 1.5s elapsed without speech
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions button[data-stop]:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S17: Stopped via manual stop at 1.5s');
        const resText17 = await getResult().textContent();
        assert.ok(!resText17.includes('No speech detected within 5 seconds.'), 'S17: Does NOT show 5s timeout on early manual stop');
        assert.ok(resText17.includes('… Not yet'), 'S17: Shows initial Not yet state');

        // --- Scenario 18: MediaRecorder異常終了 (stop exception) ---
        await page.evaluate(() => { window.t.failRecorderStop = true; });
        await clickRecord(true);
        await page.clock.runFor(1000);
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions button[data-stop]:not(:disabled)');
            if (stopBtn) stopBtn.click();
        });
        await page.clock.runFor(2600); // fallback watchdog
        assert.ok(!(await isRecording()), 'S18: Fallback watchdog stops cleanly even when recorder.stop throws');
        await page.evaluate(() => { window.t.failRecorderStop = false; });

        // --- Scenario 19: 停止条件の競合・二重停止 ---
        await clickRecord(true);
        await page.evaluate(() => {
            const stopBtn = document.querySelector('#drillsContainer .recording-actions button[data-stop]:not(:disabled)');
            if (stopBtn) {
                stopBtn.click();
                stopBtn.click();
            }
        });
        await page.clock.runFor(100);
        assert.ok(!(await isRecording()), 'S19: Recording stopped cleanly without duplication errors');

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

        // --- Scenario 20B: All-Drill Copy aggregation, state, raw STT, and reset ---
        assert.deepEqual(
            await copyButtons.evaluateAll(buttons => buttons.map(button => button.disabled)),
            [false, false, false, false],
            'One valid answer must enable all four Copy buttons'
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
            [false, false, false, false],
            'All Copy buttons must re-enable after recording completes'
        );

        // Pressing Drill 4's button copies only answered drills, in page order.
        await page.locator('#drill4 .uebung-copy-button').click();
        await page.waitForFunction(() => window.t.clipboardWrites.length === 1);
        const copiedBatch = await page.evaluate(() => window.t.clipboardWrites[0]);
        const copiedHeaders = copiedBatch.match(/Deutsche Übung 1\.1 — Drill \d+: .* — \d{4}-\d{2}-\d{2}/g) || [];
        assert.equal(copiedHeaders.length, 2, 'Copy must include one dated heading for each answered drill');
        assert.ok(copiedBatch.includes('Deutsche Übung 1.1 — Drill 1: nach —'), 'Copy must contain stripped Drill 1 header without learning focus');
        assert.ok(copiedBatch.includes('Deutsche Übung 1.1 — Drill 2: in —'), 'Copy must contain stripped Drill 2 header without learning focus');
        assert.ok(!copiedBatch.includes('Cities & Countries'), 'Copy header must not include duplicate learning focus');
        assert.ok(copiedBatch.indexOf('Drill 1:') < copiedBatch.indexOf('Drill 2:'), 'Copied drills must be ordered by page');
        assert.ok(copiedBatch.includes('1. ✅ Ich fliege nach Berlin.'), 'Copy must contain Drill 1 raw STT and accepted marker');
        assert.ok(copiedBatch.includes('1. ✅ Du fliegst in die Türkei.'), 'Copy must contain Drill 2 raw STT and accepted marker');
        assert.ok(!copiedBatch.includes('Ich / fliegen / Berlin'), 'Copy must not contain Drill 1 cue text');
        assert.ok(!copiedBatch.includes('Du / fliegen / die Türkei'), 'Copy must not contain Drill 2 cue text');
        assert.ok(!copiedBatch.includes('…') && !copiedBatch.includes('＿'), 'Copy must not include screen-only symbols');
        assert.ok(!copiedBatch.includes('Drill 3:') && !copiedBatch.includes('Drill 4:'), 'Drills without answers must be omitted');

        const copyBtn4Label = page.locator('#drill4 .uebung-copy-button .uebung-copy-label');
        const copyBtn1Label = page.locator('#drill1 .uebung-copy-button .uebung-copy-label');
        await page.waitForFunction(() => document.querySelector('#drill4 .uebung-copy-button .uebung-copy-label')?.textContent === 'Copied');
        assert.equal(await copyBtn4Label.textContent(), 'Copied', 'Clicked button label must change to Copied');
        assert.equal(await copyBtn1Label.textContent(), 'Copy my sentences', 'Other copy buttons must keep Copy my sentences');
        await page.clock.runFor(2000);
        assert.equal(await copyBtn4Label.textContent(), 'Copy my sentences', 'Clicked button label must revert after two seconds');

        // Clipboard failure must never change button label to Copied.
        await page.evaluate(() => { window.t.clipboardFailure = true; });
        await page.locator('#drill1 .uebung-copy-button').click();
        await page.clock.runFor(100);
        assert.equal(await copyBtn1Label.textContent(), 'Copy my sentences', 'Clipboard failure must keep Copy my sentences');
        await page.evaluate(() => { window.t.clipboardFailure = false; });

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
                stopRecDisabled: row?.querySelector('[data-stop]')?.disabled,
                otherVoiceDisabled: document.getElementById('voiceSelect')?.disabled
            };
        });
        assert.equal(relayClearedState.listenPlaying, false, 'Stopping from model button must restore model button');
        assert.equal(relayClearedState.playPlaying, false, 'Stopping from model button must restore play button');
        assert.equal(relayClearedState.listenTip, 'Listen to the model answer.', 'Stopping must restore original Drill 1-1 listen hover');
        assert.equal(relayClearedState.playTip, 'Play your recorded voice.', 'Stopping must restore original Drill 1-1 play hover');
        assert.equal(relayClearedState.hasIconWrap, true, 'Stopping must preserve .ex-audio-icon wrapper');
        assert.equal(relayClearedState.stopRecDisabled, true, 'sync() must keep recording stop button disabled after playback stops');
        assert.equal(relayClearedState.otherVoiceDisabled, false, 'Voice selector must re-enable after playback stops');

        // --- Scenario 20c: Single playback exclusive disabled & same-button re-click stop ---
        await page.locator('#drill1 .drill-row .drill-listen-btn').click();
        await page.clock.runFor(50);
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

        // Re-click the SAME playing button -> must ONLY stop, NOT restart
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

        // --- Scenario 20d: Patch B Layout checks (right-aligned result, inline Keep going!, single-line Incomplete, 2nd-line regional note) ---
        await clickRecord(false);
        await advanceToElapsed(1000);
        await setSpeaking(true);
        await page.clock.runFor(400);
        await page.evaluate(() => {
            const rec = window.t.recognitions.at(-1);
            rec?.onresult?.({
                resultIndex: 0,
                results: [{ isFinal: true, 0: { transcript: 'Ich fliege zu Berlin.' } }]
            });
        });
        await setSpeaking(false);
        await page.clock.runFor(2200);
        await page.locator('#drill1 .drill-row .drill-listen-btn').click().catch(() => {});
        await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });
        await page.clock.runFor(50);

        const mismatchLayout = await page.evaluate(() => {
            const row = document.querySelector('#drill1 .drill-row');
            const resText = row?.querySelector('.recording-result > .result-text');
            const retry = resText?.querySelector('.feedback-retry-label');
            return {
                hasInlineRetry: Boolean(retry),
                retryFontSize: retry ? window.getComputedStyle(retry).fontSize : null,
                resTextAlign: resText ? window.getComputedStyle(resText).textAlign : null,
                resDisplay: resText ? window.getComputedStyle(resText).display : null,
                html: resText?.innerHTML || ''
            };
        });
        assert.equal(mismatchLayout.hasInlineRetry, true, 'Mismatch must render Keep going! inline inside .result-text');
        assert.equal(mismatchLayout.retryFontSize, '18.2px', 'Inline Keep going! must be 18.2px');
        assert.equal(mismatchLayout.resTextAlign, 'right', 'Result text must be right-aligned');
        assert.notEqual(mismatchLayout.resDisplay, 'flex', 'Result text must not be flex container');
        assert.ok(mismatchLayout.html.includes('fliege <span class="result-incorrect">'), 'Mismatch must preserve space between tokens');

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

        // Resource cleanup check
        const tracksAllEnded = await page.evaluate(() => window.t.tracks.every(tr => tr.readyState === 'ended'));
        assert.ok(tracksAllEnded, 'All microphone tracks ended');
        const contextsClosed = await page.evaluate(() => window.t.contexts.every(c => c.state === 'closed'));
        assert.ok(contextsClosed, 'All AudioContext instances closed');

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
