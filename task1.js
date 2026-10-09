
/* ============================================================================
   Practice 1: XはYです
   Task 1: Instruction panel (right column, 320px)
   Task 2: Custom Practice
   ============================================================================ */

const taskData = [
    { x: "わたし", y: "がくせい", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "わたし", y: "せんせい", yRomaji: "sensei", yMeaning: "teacher", isNeg: true },
    { x: "わたし", y: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese", isNeg: false },
    { x: "わたし", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee", isNeg: true },
    { x: "ともだち", y: "がくせい", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "ともだち", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee", isNeg: true },
    { x: "ともだち", y: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American", isNeg: false }
];

const customDict = {
    "i": { hira: "わたし", romaji: "watashi", meaning: "I" },
    "friend": { hira: "ともだち", romaji: "tomodachi", meaning: "friend" },
    "family": { hira: "かぞく", romaji: "kazoku", meaning: "family" },
    "colleague": { hira: "どうりょう", romaji: "douryou", meaning: "colleague" },
    "boss": { hira: "じょうし", romaji: "joushi", meaning: "boss" },
    "partner": { hira: "パートナー", romaji: "paatanaa", meaning: "partner" },
    "Bf/Gf": { hira: "こいびと", romaji: "koibito", meaning: "Bf/Gf" },
    "best friend": { hira: "しんゆう", romaji: "shinyuu", meaning: "best friend" },
    "child": { hira: "こども", romaji: "kodomo", meaning: "child" },
    "grandchild": { hira: "まご", romaji: "mago", meaning: "grandchild" },
    "sibling": { hira: "きょうだい", romaji: "kyoudai", meaning: "sibling" },
    "foreigner": { hira: "がいこくじん", romaji: "gaikokujin", meaning: "foreigner" },
    "doctor": { hira: "いしゃ", romaji: "isha", meaning: "doctor" },
    "engineer": { hira: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "researcher": { hira: "けんきゅうしゃ", romaji: "kenkyuusha", meaning: "researcher" },
    "designer": { hira: "デザイナー", romaji: "dezainaa", meaning: "designer" },
    "store staff": { hira: "てんいん", romaji: "tenin", meaning: "store staff" },
    "self-employed": { hira: "じえいぎょう", romaji: "jiei-gyou", meaning: "self-employed" },
    "civil servant": { hira: "こうむいん", romaji: "koumuin", meaning: "civil servant" },
    "nurse": { hira: "かんごし", romaji: "kangoshi", meaning: "nurse" },
    "part-time worker": { hira: "アルバイト", romaji: "arubaito", meaning: "part-time worker" }
};

let isManualStop = false;
let hintMode = "hover";
let activeRecognitionSession = null;
let preferredVoiceName = "auto";

const NORMAL_PLAYBACK_RATE = 0.70;
const RECORDED_PLAYBACK_RATE = 0.85;


// ============================================================================
// Japanese text conversion
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g,
        ""
    );

    const dict = {
        "私": "わたし",
        "学生": "がくせい",
        "先生": "せんせい",
        "日本人": "にほんじん",
        "会社員": "かいしゃいん",
        "友達": "ともだち",
        "家族": "かぞく",
        "同僚": "どうりょう",
        "上司": "じょうし",
        "パートナー": "パートナー",
        "恋人": "こいびと",
        "親友": "しんゆう",
        "子供": "こども",
        "子ども": "こども",
        "孫": "まご",
        "兄弟": "きょうだい",
        "外国人": "がいこくじん",
        "医師": "いしゃ",
        "医者": "いしゃ",
        "エンジニア": "エンジニア",
        "研究者": "けんきゅうしゃ",
        "デザイナー": "デザイナー",
        "店員": "てんいん",
        "自営業": "じえいぎょう",
        "こうむいん": "こうむいん",
        "公務員": "こうむいん",
        "看護師": "かんごし",
        "看護婦": "かんごし",
        "アルバイト": "アルバイト",
        "です": "です",
        "でした": "でした",
        "じゃないです": "じゃないです",
        "ではないです": "ではないです",
        "じゃありません": "じゃありません",
        "ではありません": "ではありません"
    };

    for (const key of Object.keys(dict)) {
        cleaned = cleaned.replace(
            new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            dict[key]
        );
    }

    // Convert remaining katakana to hiragana.
    cleaned = cleaned.replace(/[\u30A1-\u30F6]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );

    return cleaned;
}


// ============================================================================
// Speech synthesis: choose an available Japanese voice
// ============================================================================

function getAvailableVoices() {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices();
}

function findVoiceByName(voices, pattern) {
    return voices.find(v => pattern.test(v.name));
}

function getJapaneseVoice() {
    const voices = getAvailableVoices();
    if (!voices.length) return null;

    if (preferredVoiceName !== "auto") {
        const selected = voices.find(v => v.name === preferredVoiceName);
        if (selected) return selected;
    }

    // Preferred candidates, in the requested order.
    return (
        findVoiceByName(voices, /Microsoft.*Keita/i) ||
        findVoiceByName(voices, /Microsoft.*Nanami/i) ||
        findVoiceByName(voices, /Google.*日本語|Google.*Japanese/i) ||
        voices.find(v => /^ja([-_]|$)/i.test(v.lang)) ||
        voices.find(v => /Japanese|日本語/i.test(v.name)) ||
        null
    );
}

function populateVoiceSelector(selectElement, statusElement) {
    if (!selectElement) return;

    const voices = getAvailableVoices();
    const candidates = [
        { label: "Auto (recommended)", value: "auto" },
        ...voices
            .filter(v =>
                /Microsoft.*Keita|Microsoft.*Nanami|Google.*日本語|Google.*Japanese/i.test(v.name)
            )
            .map(v => ({
                label: `${v.name} (${v.lang})`,
                value: v.name
            }))
    ];

    const japaneseVoices = voices.filter(v =>
        /^ja([-_]|$)/i.test(v.lang) || /Japanese|日本語/i.test(v.name)
    );

    // Add other Japanese voices if none of the named candidates is present.
    if (candidates.length === 1) {
        japaneseVoices.forEach(v => {
            candidates.push({
                label: `${v.name} (${v.lang})`,
                value: v.name
            });
        });
    }

    const previousValue = preferredVoiceName;
    selectElement.replaceChildren();

    candidates.forEach(item => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        selectElement.appendChild(option);
    });

    const stillAvailable = candidates.some(item => item.value === previousValue);
    selectElement.value = stillAvailable ? previousValue : "auto";
    preferredVoiceName = selectElement.value;

    if (statusElement) {
        statusElement.textContent = japaneseVoices.length
            ? `${japaneseVoices.length} Japanese voice(s) available`
            : "No Japanese voice detected. Check your browser/OS voice settings.";
    }
}

function speakText(text, onEndCallback, rate = NORMAL_PLAYBACK_RATE) {
    if (!("speechSynthesis" in window)) {
        console.error("Speech synthesis is not supported.");
        if (onEndCallback) onEndCallback();
        return;
    }

    // Cancel pending speech so consecutive clicks do not queue up.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;

    const voice = getJapaneseVoice();
    if (voice) utterance.voice = voice;

    let callbackCalled = false;
    const finish = () => {
        if (callbackCalled) return;
        callbackCalled = true;
        if (onEndCallback) onEndCallback();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    try {
        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("Speech synthesis error:", err);
        finish();
    }
}


// ============================================================================
// Initialization
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupFooterGuide();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
    const box = document.getElementById("guideBox");

    if (!trigger || !box) return;

    trigger.addEventListener("click", e => {
        e.stopPropagation();
        box.style.display = box.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", () => {
        box.style.display = "none";
    });
}


// ============================================================================
// Word formatting
// ============================================================================

function formatWord(word, romaji, meaning) {
    const hintStr = `${romaji}, ${meaning}`;

    if (hintMode === "paren") {
        return `<span class="target-word">${word}</span> (${hintStr})`;
    }

    return `
        <span class="tooltip-wrap">
            <span class="target-word">${word}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}

function formatCustomWord(hira, engKey) {
    const entry = customDict[engKey];
    if (!entry) return hira;
    return formatWord(hira, entry.romaji, entry.meaning);
}


// ============================================================================
// Main application
// ============================================================================

function initApp() {
    installPracticeLayoutStyles();
    setupExampleSection();

    const container = document.getElementById("task1List");
    if (!container) return;

    container.replaceChildren();

    const layout = document.createElement("div");
    layout.className = "practice-layout";

    const mainColumn = document.createElement("main");
    mainColumn.className = "practice-main";

    const guidePanel = createTask1GuidePanel();

    const task2Header = document.createElement("div");
    task2Header.className = "header-panel";
    task2Header.innerHTML = `
        <div class="title-instruction-group">
            <span><strong>Task 2；Custom Practice</strong></span>
            <span class="task-description">
                💡 Choose X and Y, then make a sentence.
            </span>
        </div>
    `;
    mainColumn.appendChild(task2Header);

    createTask2Rows(mainColumn);

    layout.appendChild(mainColumn);
    layout.appendChild(guidePanel);
    container.appendChild(layout);

    const voiceSelect = guidePanel.querySelector("#voiceSelect");
    const voiceStatus = guidePanel.querySelector("#voiceStatus");

    if ("speechSynthesis" in window) {
        populateVoiceSelector(voiceSelect, voiceStatus);

        // Some browsers load their voices asynchronously.
        window.speechSynthesis.onvoiceschanged = () => {
            populateVoiceSelector(voiceSelect, voiceStatus);
        };

        voiceSelect.addEventListener("change", () => {
            preferredVoiceName = voiceSelect.value;
        });
    } else {
        voiceStatus.textContent = "Speech synthesis is not supported in this browser.";
        voiceSelect.disabled = true;
    }
}

function installPracticeLayoutStyles() {
    if (document.getElementById("practiceLayoutStyles")) return;

    const style = document.createElement("style");
    style.id = "practiceLayoutStyles";
    style.textContent = `
        .practice-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
            gap: 20px;
            align-items: start;
            width: 100%;
        }
        .practice-main { min-width: 0; }
        .task1-guide-panel {
            box-sizing: border-box;
            width: 320px;
            max-width: 100%;
            padding: 16px;
            border: 1px solid var(--border-color, #ccc);
            border-radius: 10px;
            background: var(--panel-background, var(--background, transparent));
        }
        .task1-guide-panel h3 { margin-top: 0; }
        .task1-guide-panel p { line-height: 1.5; }
        .task1-guide-panel .guide-section { margin: 16px 0; }
        .task1-guide-panel select { max-width: 100%; }
        .task1-guide-panel .voice-status {
            display: block;
            margin-top: 6px;
            font-size: 0.85em;
            color: var(--text-secondary);
        }
        .task-description {
            color: var(--text-primary);
            font-size: 15px;
        }
        .practice-main .header-panel { margin-bottom: 16px; }
        .practice-main .drill-row { margin-bottom: 12px; }
        .practice-main .top-row { flex-wrap: wrap; }
        @media (max-width: 850px) {
            .practice-layout { grid-template-columns: minmax(0, 1fr); }
            .task1-guide-panel { width: 100%; grid-row: 1; }
        }
    `;
    document.head.appendChild(style);
}

function setupExampleSection() {
    const section = document.getElementById("exampleSection");
    if (!section) return;

    section.className = "example-box";
    section.innerHTML = `
        <div class="example-row">
            <strong>Affirmative:</strong>
            <span class="tooltip-wrap">
                <span class="target-word">わたし</span>
                <span class="tooltip-tip">watashi, I</span>
            </span>
            ／
            <span class="tooltip-wrap">
                <span class="target-word">がくせい</span>
                <span class="tooltip-tip">gakusei, student</span>
            </span>
            <button id="ex1Listen" class="example-button">🔊 きく</button>
            <span class="example-desc">わたしは、がくせいです。(I am a student)</span>
        </div>
        <div class="example-row">
            <strong>Negative:</strong>
            <span class="tooltip-wrap">
                <span class="target-word">わたし</span>
                <span class="tooltip-tip">watashi, I</span>
            </span>
            ／
            <span class="tooltip-wrap">
                <span class="target-word">せんせい</span>
                <span class="tooltip-tip">sensei, teacher</span>
            </span>
            <button id="ex2Listen" class="example-button">🔊 きく</button>
            <span class="example-desc">わたしは、せんせいじゃないです。(I am not a teacher)</span>
        </div>
    `;

    setupExampleListen("ex1Listen", "わたしは、がくせいです。");
    setupExampleListen("ex2Listen", "わたしは、せんせいじゃないです。");
}

function createTask1GuidePanel() {
    const panel = document.createElement("aside");
    panel.className = "task1-guide-panel";
    panel.innerHTML = `
        <h3>Task 1；Guide</h3>
        <p>Practise making a sentence with the pattern below.</p>

        <div class="guide-section">
            <strong>Affirmative</strong>
            <p>X は Y です。</p>
            <p>わたしは、がくせいです。</p>
            <button type="button" class="example-button" id="guideAffListen">
                🔊 きく
            </button>
        </div>

        <div class="guide-section">
            <strong>Negative</strong>
            <p>X は Y じゃないです。</p>
            <p>わたしは、せんせいじゃないです。</p>
            <button type="button" class="example-button" id="guideNegListen">
                🔊 きく
            </button>
        </div>

        <div class="guide-section">
            <strong>Recording mode</strong>
            <div class="control-item">
                <span id="labelAuto" class="mode-label active-mode custom-tip-wrap">
                    ⏹Autostop
                    <span class="custom-tip-box">Stops when you stop speaking.</span>
                </span>
                <label class="switch">
                    <input id="recordModeSwitch" type="checkbox">
                    <span class="slider"></span>
                </label>
                <span id="labelManual" class="mode-label inactive-mode custom-tip-wrap">
                    ⏹Manual stop
                    <span class="custom-tip-box">Click Stop to finish recording.</span>
                </span>
            </div>
        </div>

        <div class="guide-section">
            <strong>Vocabulary hints</strong>
            <div class="control-item">
                <span id="labelHover" class="mode-label active-mode custom-tip-wrap">
                    💬 Vocab Hint
                    <span class="custom-tip-box">Hover over a word to see its meaning.</span>
                </span>
                <label class="switch">
                    <input id="vocabModeSwitch" type="checkbox">
                    <span class="slider"></span>
                </label>
                <span id="labelParen" class="mode-label inactive-mode custom-tip-wrap">
                    🔡Display Vocab
                    <span class="custom-tip-box">Always show meanings in parentheses.</span>
                </span>
            </div>
        </div>

        <div class="guide-section">
            <label for="voiceSelect"><strong>Japanese voice</strong></label>
            <select id="voiceSelect" class="custom-select">
                <option value="auto">Auto (recommended)</option>
            </select>
            <span id="voiceStatus" class="voice-status">
                Checking available voices...
            </span>
        </div>

        <p><strong>Playback speeds</strong></p>
        <p>Sample sentence: 70%</p>
        <p>Recorded voice: 85%</p>
    `;

    const recordSwitch = panel.querySelector("#recordModeSwitch");
    recordSwitch.addEventListener("change", () => {
        isManualStop = recordSwitch.checked;
        panel.querySelector("#labelAuto").className =
            `mode-label ${!isManualStop ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
        panel.querySelector("#labelManual").className =
            `mode-label ${isManualStop ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    });

    const vocabSwitch = panel.querySelector("#vocabModeSwitch");
    vocabSwitch.addEventListener("change", () => {
        hintMode = vocabSwitch.checked ? "paren" : "hover";
        panel.querySelector("#labelHover").className =
            `mode-label ${hintMode === "hover" ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
        panel.querySelector("#labelParen").className =
            `mode-label ${hintMode === "paren" ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
        updateWordsDisplay();
    });

    panel.querySelector("#guideAffListen").addEventListener("click", event => {
        playSyntheticAudio("わたしは、がくせいです。", event.currentTarget, "🔊 きく");
    });

    panel.querySelector("#guideNegListen").addEventListener("click", event => {
        playSyntheticAudio("わたしは、せんせいじゃないです。", event.currentTarget, "🔊 きく");
    });

    return panel;
}


// ============================================================================
// Task 2 options and rows
// ============================================================================

function createTask2Rows(container) {
    const optionsXHtml = `
        <option value="" disabled selected>-- Choose X --</option>
        <option value="ともだち" data-eng="friend">Friend</option>
        <option value="かぞく" data-eng="family">Family</option>
        <option value="どうりょう" data-eng="colleague">Colleague</option>
        <option value="じょうし" data-eng="boss">Boss</option>
        <option value="パートナー" data-eng="partner">Partner</option>
        <option value="こいびと" data-eng="Bf/Gf">Bf/Gf</option>
        <option value="しんゆう" data-eng="best friend">Best friend</option>
        <option value="こども" data-eng="child">Child</option>
        <option value="まご" data-eng="grandchild">Grandchild</option>
        <option value="きょうだい" data-eng="sibling">Sibling</option>
    `;

    const optionsYHtml = `
        <option value="" disabled selected>-- Choose Y --</option>
        <option value="がいこくじん" data-eng="foreigner">Foreigner</option>
        <option value="いしゃ" data-eng="doctor">Doctor</option>
        <option value="エンジニア" data-eng="engineer">Engineer</option>
        <option value="けんきゅうしゃ" data-eng="researcher">Researcher</option>
        <option value="デザイナー" data-eng="designer">Designer</option>
        <option value="てんいん" data-eng="store staff">Store staff</option>
        <option value="じえいぎょう" data-eng="self-employed">Self-employed</option>
        <option value="こうむいん" data-eng="civil servant">Civil servant</option>
        <option value="かんごし" data-eng="nurse">Nurse</option>
        <option value="アルバイト" data-eng="part-time worker">Part-time worker</option>
    `;

    for (let i = 1; i <= 3; i++) {
        const row = document.createElement("div");
        row.className = "drill-row";
        row.dataset.customIndex = i;

        const top = document.createElement("div");
        top.className = "top-row";

        const listenBtn = createButton(
            '🔊きく<span class="custom-tip-box">Listen to the sample sentence.</span>'
        );
        listenBtn.disabled = true;

        const number = document.createElement("span");
        number.textContent = `${i}.`;

        const selectX = document.createElement("select");
        selectX.id = `customX_${i}`;
        selectX.className = "custom-select";
        selectX.innerHTML = optionsXHtml;

        const previewX = document.createElement("span");
        previewX.id = `previewX_${i}`;
        previewX.className = "translation-preview";

        const ha = document.createElement("span");
        ha.id = `labelHa_${i}`;
        ha.textContent = "は";

        const selectY = document.createElement("select");
        selectY.id = `customY_${i}`;
        selectY.className = "custom-select";
        selectY.innerHTML = optionsYHtml;

        const previewY = document.createElement("span");
        previewY.id = `previewY_${i}`;
        previewY.className = "translation-preview";

        const recordBtn = createButton(
            '⏺️とる<span class="custom-tip-box">Start recording.</span>'
        );
        recordBtn.disabled = true;

        const stopBtn = createButton(
            '⏹️<span class="custom-tip-box">Stop recording.</span>'
        );
        stopBtn.disabled = true;

        const result = document.createElement("span");
        result.className = "result-text";
        result.textContent = "(Not recorded yet)";
        result.style.color = "var(--text-secondary)";

        top.append(
            listenBtn, number, selectX, previewX, ha,
            selectY, previewY, recordBtn, stopBtn, result
        );

        const correctionBox = document.createElement("div");
        correctionBox.className = "correction-box";
        correctionBox.style.display = "none";

        const corrListenBtn = createButton("🔊 きく");
        corrListenBtn.style.marginRight = "8px";

        const corrText = document.createElement("span");
        correctionBox.append(corrListenBtn, corrText);

        row.append(top, correctionBox);
        container.appendChild(row);

        const isNegative = i !== 2;

        function updateDisplay() {
            const xOption = selectX.options[selectX.selectedIndex];
            const yOption = selectY.options[selectY.selectedIndex];

            previewX.innerHTML = selectX.value && xOption
                ? formatCustomWord(selectX.value, xOption.dataset.eng)
                : "";

            previewY.innerHTML = selectY.value && yOption
                ? formatCustomWord(selectY.value, yOption.dataset.eng)
                : "";

            ha.style.display = selectX.value ? "none" : "inline";

            const ready = Boolean(selectX.value && selectY.value);
            listenBtn.disabled = !ready;
            recordBtn.disabled = !ready;

            if (ready) {
                listenBtn.onclick = () => {
                    const sentence = isNegative
                        ? `${selectX.value}は、${selectY.value}じゃないです。`
                        : `${selectX.value}は、${selectY.value}です。`;
                    playSyntheticAudio(sentence, listenBtn, "🔊きく");
                };
            }
        }

        selectX.addEventListener("change", updateDisplay);
        selectY.addEventListener("change", updateDisplay);

        bindRecorderEvents(
            recordBtn,
            stopBtn,
            result,
            correctionBox,
            corrListenBtn,
            corrText,
            () => selectX.value,
            () => selectY.value,
            isNegative
        );
    }
}

function createButton(html) {
    const button = document.createElement("button");
    button.className = "example-button custom-tip-wrap";
    button.innerHTML = html;
    return button;
}


// ============================================================================
// Update word hints
// ============================================================================

function updateWordsDisplay() {
    document.querySelectorAll(".drill-row[data-custom-index]").forEach(row => {
        const index = row.dataset.customIndex;
        const selectX = document.getElementById(`customX_${index}`);
        const selectY = document.getElementById(`customY_${index}`);
        const previewX = document.getElementById(`previewX_${index}`);
        const previewY = document.getElementById(`previewY_${index}`);

        if (selectX && selectX.value && previewX) {
            const option = selectX.options[selectX.selectedIndex];
            previewX.innerHTML = formatCustomWord(
                selectX.value,
                option.dataset.eng
            );
        }

        if (selectY && selectY.value && previewY) {
            const option = selectY.options[selectY.selectedIndex];
            previewY.innerHTML = formatCustomWord(
                selectY.value,
                option.dataset.eng
            );
        }
    });
}


// ============================================================================
// Sample audio playback
// ============================================================================

function playSyntheticAudio(text, button, originalText) {
    if (!button) return;

    button.disabled = true;
    button.textContent = "🔊 Playing...";

    speakText(text, () => {
        button.disabled = false;
        button.textContent = originalText;
    }, NORMAL_PLAYBACK_RATE);
}

function setupExampleListen(btnId, text) {
    const button = document.getElementById(btnId);
    if (!button) return;

    button.addEventListener("click", () => {
        playSyntheticAudio(text, button, "🔊 きく");
    });
}


// ============================================================================
// Shared recording / speech recognition
// SpeechRecognition handles transcription.
// MediaRecorder stores the audio for playback.
// ============================================================================

function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getXFn,
    getYFn,
    expectedIsNeg = false
) {
    let session = null;

    function showError(message) {
        resultSpan.textContent = message;
        resultSpan.style.color = "var(--error-text)";
    }

    function releaseSession(s) {
        if (!s || s.finished) return;
        s.finished = true;

        if (s.watchdog !== null) {
            clearTimeout(s.watchdog);
            s.watchdog = null;
        }

        if (s.stream) {
            s.stream.getTracks().forEach(track => {
                try { track.stop(); } catch (_) {}
            });
            s.stream = null;
        }

        if (activeRecognitionSession === s) {
            activeRecognitionSession = null;
        }

        if (session === s) {
            session = null;
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            stopBtn.classList.remove("stop-btn-active");
        }
    }

    function stopMediaRecorder(s) {
        if (!s.mediaRecorder || s.mediaRecorder.state === "inactive") {
            s.mediaStopped = true;
            finishIfReady(s);
            return;
        }

        try {
            s.mediaRecorder.stop();
        } catch (err) {
            console.warn("MediaRecorder stop error:", err);
            s.mediaStopped = true;
            finishIfReady(s);
        }
    }

    function requestStop(s, abort = false, errorMessage = "") {
        if (!s || s.finished) return;

        if (errorMessage) {
            s.errorMessage = errorMessage;
            showError(errorMessage);
        }

        if (s.watchdog === null) {
            s.watchdog = setTimeout(() => {
                // Safety fallback if a browser fails to dispatch end/stop.
                releaseSession(s);
            }, 3000);
        }

        stopMediaRecorder(s);

        if (s.recognition && !s.recognitionEnded) {
            try {
                if (abort) s.recognition.abort();
                else s.recognition.stop();
            } catch (err) {
                // Recognition may already have ended.
                console.warn("Speech recognition stop error:", err);
                s.recognitionEnded = true;
                finishIfReady(s);
            }
        } else {
            s.recognitionEnded = true;
            finishIfReady(s);
        }
    }

    function finishIfReady(s) {
        if (!s || s.finished) return;
        if (!s.recognitionEnded || !s.mediaStopped) return;

        if (s.errorMessage) {
            releaseSession(s);
            return;
        }

        if (s.transcript) {
            processRecognitionResult(
                s.transcript,
                s.currentX,
                s.currentY,
                expectedIsNeg,
                resultSpan,
                correctionBox,
                corrListenBtn,
                corrTextSpan,
                () => s.audioUrl || null
            );
        } else if (resultSpan.textContent === "Recording...") {
            resultSpan.textContent = "No speech detected. Please try again.";
            resultSpan.style.color = "var(--error-text)";
        }

        releaseSession(s);
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled || activeRecognitionSession) return;

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showError("Speech recognition is not supported in this browser.");
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ||
            !window.MediaRecorder) {
            showError("Audio recording is not supported in this browser.");
            return;
        }

        const currentX = getXFn();
        const currentY = getYFn();

        if (!currentX || !currentY) {
            showError("Please choose both X and Y.");
            return;
        }

        const s = {
            finished: false,
            stopRequested: false,
            errorMessage: "",
            recognition: null,
            stream: null,
            mediaRecorder: null,
            chunks: [],
            audioUrl: null,
            transcript: "",
            recognitionEnded: false,
            mediaStopped: false,
            watchdog: null,
            currentX,
            currentY
        };

        session = s;
        activeRecognitionSession = s;

        recordBtn.disabled = true;
        stopBtn.disabled = !isManualStop;
        stopBtn.classList.toggle("stop-btn-active", isManualStop);
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
        corrTextSpan.textContent = "";
        corrListenBtn.style.display = "inline-block";

        try {
            s.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (s.finished || session !== s) {
                s.stream.getTracks().forEach(track => track.stop());
                return;
            }

            s.mediaRecorder = new MediaRecorder(s.stream);

            s.mediaRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    s.chunks.push(event.data);
                }
            };

            s.mediaRecorder.onstop = () => {
                if (s.chunks.length) {
                    const blob = new Blob(s.chunks, {
                        type: s.mediaRecorder.mimeType || "audio/webm"
                    });

                    if (blob.size > 0) {
                        s.audioUrl = URL.createObjectURL(blob);
                    }
                }

                s.mediaStopped = true;

                if (s.stream) {
                    s.stream.getTracks().forEach(track => {
                        try { track.stop(); } catch (_) {}
                    });
                    s.stream = null;
                }

                finishIfReady(s);
            };

            s.mediaRecorder.start();

            const recognition = new SpeechRecognition();
            s.recognition = recognition;
            recognition.lang = "ja-JP";
            recognition.interimResults = false;
            recognition.continuous = isManualStop;

            recognition.onresult = event => {
                if (s.finished || session !== s || s.errorMessage) return;

                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }

                if (transcript) s.transcript += transcript;
            };

            recognition.onerror = event => {
                if (s.finished || session !== s) return;

                console.error("Speech recognition error:", event.error);

                if (event.error === "network") {
                    const isBrave = Boolean(navigator.brave);

                    if (isBrave) {
                        s.errorMessage =
                            "Speech Recognition Error\n\n" +
                            "Issues with speech recognition have been reported in Brave. " +
                            "This page has been tested with Google Chrome and Microsoft Edge. " +
                            "Try with another browser.";
                        showError(s.errorMessage);
                    } else {
                        // No network-error message for browsers other than Brave.
                        resultSpan.textContent = "(Not recorded yet)";
                        resultSpan.style.color = "var(--text-secondary)";
                        s.errorMessage = "network";
                    }

                    requestStop(s, true);
                    return;
                }

                // An abort following the user's Stop click is intentional.
                if (event.error === "aborted" && s.stopRequested) return;

                const messages = {
                    "not-allowed": "Microphone permission denied.",
                    "service-not-allowed": "Microphone permission denied.",
                    "no-speech": "No speech detected. Please try again.",
                    "audio-capture": "Microphone unavailable.",
                    "language-not-supported": "Japanese speech recognition is not available."
                };

                const message = messages[event.error] ||
                    "Speech recognition error. Please try again.";

                s.errorMessage = message;
                showError(message);
                requestStop(s, true);
            };

            recognition.onend = () => {
                if (s.finished) return;
                s.recognitionEnded = true;
                stopMediaRecorder(s);
                finishIfReady(s);
            };

            recognition.start();
        } catch (err) {
            console.error("Recording start error:", err);

            const message = err && err.name === "NotAllowedError"
                ? "Microphone permission denied."
                : "Could not start recording. Please try again.";

            s.errorMessage = message;
            showError(message);

            if (s.mediaRecorder && s.mediaRecorder.state !== "inactive") {
                stopMediaRecorder(s);
            } else {
                s.mediaStopped = true;
            }

            if (s.recognition && !s.recognitionEnded) {
                try { s.recognition.abort(); } catch (_) {}
            } else {
                s.recognitionEnded = true;
            }

            if (s.stream) {
                s.stream.getTracks().forEach(track => {
                    try { track.stop(); } catch (_) {}
                });
                s.stream = null;
            }

            // Do not leave the UI locked if startup fails.
            releaseSession(s);
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished || session.stopRequested) return;

        session.stopRequested = true;
        stopBtn.disabled = true;

        // stop() allows a final recognition result to arrive.
        requestStop(session, false);
    });
}


// ============================================================================
// Recognition result processing
// ============================================================================

function processRecognitionResult(
    rawTranscript,
    currentX,
    currentY,
    expectedIsNeg,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getUrlFn
) {
    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
        resultSpan.textContent = rawTranscript + " (Too short)";
        resultSpan.style.color = "var(--text-secondary)";
        return;
    }

    const hiraText = convertToHiragana(rawTranscript);
    const hiraX = convertToHiragana(currentX);
    const hiraY = convertToHiragana(currentY);
    const endParticleRegex = "(?:ね|よ|よね|ですね|ですよ)*[.。!]?$";

    const isAffirmative = new RegExp(
        `^${hiraX}は${hiraY}です` + endParticleRegex
    ).test(hiraText);

    const negativePatterns = [
        `^${hiraX}は${hiraY}じゃないです` + endParticleRegex,
        `^${hiraX}は${hiraY}ではないです` + endParticleRegex,
        `^${hiraX}は${hiraY}じゃありません` + endParticleRegex,
        `^${hiraX}は${hiraY}ではありません` + endParticleRegex
    ];

    const isNegative = negativePatterns.some(pattern =>
        new RegExp(pattern).test(hiraText)
    );

    const recordedAudioUrl = getUrlFn ? getUrlFn() : null;

    function appendPlayButton() {
        if (!recordedAudioUrl) return;

        const oldButton = resultSpan.querySelector(".play-recording-btn");
        if (oldButton) oldButton.remove();

        const playBtn = document.createElement("button");
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "8px";
        playBtn.innerHTML =
            '▶<span class="custom-tip-box">Play the recorded audio at 85% speed.</span>';

        playBtn.addEventListener("click", () => {
            const audio = new Audio(recordedAudioUrl);
            audio.playbackRate = RECORDED_PLAYBACK_RATE;
            audio.play().catch(err => {
                console.error("Recorded audio playback error:", err);
            });
        });

        resultSpan.appendChild(playBtn);
    }

    if (isAffirmative || isNegative) {
        resultSpan.textContent = hiraText + " ✅ ";
        resultSpan.style.color = "var(--text-primary)";
        appendPlayButton();
        correctionBox.style.display = "none";
        return;
    }

    const hasCorrectY = hiraText.includes(hiraY);

    if (!hasCorrectY) {
        resultSpan.textContent = hiraText + " ";
        resultSpan.style.color = "var(--text-primary)";
        appendPlayButton();

        corrTextSpan.textContent = "Wrong word used.";
        corrListenBtn.style.display = "none";
    } else {
        resultSpan.textContent = hiraText + " ";
        resultSpan.style.color = "var(--error-text)";
        appendPlayButton();

        corrTextSpan.textContent = "Structure error, try it again";
        corrListenBtn.style.display = "inline-block";

        const correctSentence = expectedIsNeg
            ? `${currentX}は、${currentY}じゃないです。`
            : `${currentX}は、${currentY}です。`;

        corrListenBtn.onclick = () => {
            playSyntheticAudio(correctSentence, corrListenBtn, "🔊 きく");
        };
    }

    correctionBox.style.display = "block";
}
