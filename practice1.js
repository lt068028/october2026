// ============================================================================
// Practice 1: XはYです (完全安定版)
// ============================================================================

const taskData = [
    { x: "わたし", xKanji: "私", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "わたし", xKanji: "私", y: "せんせい", yKanji: "先生", yRomaji: "sensei", yMeaning: "teacher", isNeg: true },
    { x: "わたし", xKanji: "私", y: "日本人", yKanji: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese", isNeg: false },
    { x: "わたし", xKanji: "私", y: "りゅうがくせい", yKanji: "留学生", yRomaji: "ryuugakusei", yMeaning: "international student", isNeg: true },
    { x: "ともだち", xKanji: "友達", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "ともだち", xKanji: "友達", y: "しゅふ", yKanji: "主婦", yRomaji: "home maker", yMeaning: "home maker", isNeg: true },
    { x: "ともだち", xKanji: "友達", y: "アメリカ人", yKanji: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American", isNeg: false }
];

const customDict = {
    "i": { hira: "わたし", kanji: "私", romaji: "watashi", meaning: "I" },
    "friend": { hira: "ともだち", kanji: "友達", romaji: "tomodachi", meaning: "friend" },
    "family": { hira: "かぞく", kanji: "家族", romaji: "kazoku", meaning: "family" },
    "colleague": { hira: "どうりょう", kanji: "同僚", romaji: "douryou", meaning: "colleague" },
    "boss": { hira: "じょうし", kanji: "上司", romaji: "joushi", meaning: "boss" },
    "partner": { hira: "パートナー", kanji: "パートナー", romaji: "paatanaa", meaning: "partner" },
    "Bf/Gf": { hira: "こいびと", kanji: "恋人", romaji: "koibito", meaning: "Bf/Gf" },
    "best friend": { hira: "しんゆう", kanji: "親友", romaji: "shinyuu", meaning: "best friend" },
    "child": { hira: "こども", kanji: "子供", romaji: "kodomo", meaning: "child" },
    "grandchild": { hira: "まご", kanji: "孫", romaji: "mago", meaning: "grandchild" },
    "sibling": { hira: "きょうだい", kanji: "兄弟", romaji: "kyoudai", meaning: "sibling" },
    "foreigner": { hira: "がいこくじん", kanji: "外国人", romaji: "gaikokujin", meaning: "foreigner" },
    "doctor": { hira: "いしゃ", kanji: "医者", romaji: "isha", meaning: "doctor" },
    "engineer": { hira: "エンジニア", kanji: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "researcher": { hira: "けんきゅうしゃ", kanji: "研究者", romaji: "kenkyuusha", meaning: "researcher" },
    "designer": { hira: "デザイナー", kanji: "デザイナー", romaji: "dezainaa", meaning: "designer" },
    "store staff": { hira: "てんいん", kanji: "店員", romaji: "tenin", meaning: "store staff" },
    "self-employed": { hira: "じえいぎょう", kanji: "自営業", romaji: "jiei-gyou", meaning: "self-employed" },
    "civil servant": { hira: "こうむいん", kanji: "公務員", romaji: "koumuin", meaning: "civil servant" },
    "nurse": { hira: "かんごし", kanji: "看護師", romaji: "kangoshi", meaning: "nurse" },
    "part-time worker": { hira: "アルバイト", kanji: "アルバイト", romaji: "arubaito", meaning: "part-time worker" },
    "international student": { hira: "りゅうがくせい", kanji: "留学生", romaji: "ryuugakusei", meaning: "international student" },
    "home maker": { hira: "しゅふ", kanji: "主婦", romaji: "home maker", meaning: "home maker" }
};

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "hiragana"; 
let isAutoPlay = true; 
let activeRecognitionSession = null;

const practice1State = {
    customSelects: {},
    audioUrls: {}
};

let preferredVoice = null;
function setupPreferredVoice() {
    try {
        const voices = speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;
        let selected = voices.find(v => v.name && v.lang && v.name.toLowerCase().includes("chrome os") && v.lang.includes("ja"));
        if (!selected) selected = voices.find(v => v.name && v.name.toLowerCase().includes("keita"));
        if (!selected) selected = voices.find(v => v.name && v.name.toLowerCase().includes("nanami"));
        if (!selected) selected = voices.find(v => v.name && v.lang && v.name.toLowerCase().includes("google") && v.lang.includes("ja"));
        if (!selected) selected = voices.find(v => v.lang && v.lang.includes("ja"));
        if (selected) preferredVoice = selected;
    } catch (e) { console.warn("Voice setup error:", e); }
}

if (typeof speechSynthesis !== "undefined") {
    setupPreferredVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => setupPreferredVoice();
    }
}

let currentPlayingAudio = null;
let currentPlayTimeoutId = null;
let activePlayButton = null;
let currentUtteranceRef = null; 

function setPlayingState(btn, text) {
    stopAllPlayback();
    btn.dataset.originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = text;
    activePlayButton = btn;
}

function restorePlayButton() {
    if (activePlayButton) {
        activePlayButton.disabled = false;
        if (activePlayButton.dataset.originalHtml) {
            activePlayButton.innerHTML = activePlayButton.dataset.originalHtml;
        } else {
            activePlayButton.innerHTML = 'Play';
        }
        activePlayButton = null;
    }
}

function stopAllPlayback() {
    if (currentPlayTimeoutId) { clearTimeout(currentPlayTimeoutId); currentPlayTimeoutId = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    currentUtteranceRef = null;
    if (currentPlayingAudio) { currentPlayingAudio.pause(); currentPlayingAudio = null; }
    restorePlayButton();
}

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    const dict = {
        "私": "わたし", "学生": "がくせい", "先生": "せんせい", "日本人": "にほんじん",
        "会社員": "かいしゃいん", "友達": "ともだち", "家族": "かぞく", "同僚": "どうりょう",
        "上司": "じょうし", "パートナー": "パートナー", "恋人": "こいびと", "親友": "しんゆう",
        "子供": "こども", "子ども": "こども", "孫": "まご", "兄弟": "きょうだい",
        "外国人": "がいこくじん", "医師": "いしゃ", "医者": "いしゃ", "エンジニア": "エンジニア",
        "研究者": "けんきゅうしゃ", "デザイナー": "デザイナー", "店員": "てんいん",
        "自営業": "じえいぎょう", "こうむいん": "こうむいん", "公務員": "こうむいん",
        "看護師": "かんごし", "看護婦": "かんごし", "アルバイト": "アルバイト",
        "留学生": "りゅうがくせい", "主婦": "しゅふ",
        "です": "です", "でした": "でした", "じゃないです": "じゃないです",
        "ではないです": "ではないです", "じゃありません": "じゃありません", "ではありません": "ではありません"
    };
    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }
    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}

function speakText(text, rate = 0.9, onEndCallback) {
    setupPreferredVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;
    if (preferredVoice) utterance.voice = preferredVoice;
    
    currentUtteranceRef = utterance;
    utterance.onend = () => { currentUtteranceRef = null; if (onEndCallback) onEndCallback(); };
    utterance.onerror = () => { currentUtteranceRef = null; if (onEndCallback) onEndCallback(); };
    try { speechSynthesis.speak(utterance); } catch (err) {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    initExampleListen();
    initTask1();
    initTask2();
    initTask3Container();
    setupFooterGuide();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
    const box = document.getElementById("guideBox");
    if (trigger && box) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            box.style.display = box.style.display === "none" ? "block" : "none";
        });
        document.addEventListener("click", () => { box.style.display = "none"; });
    }
}

function formatWord(word, kanji, romaji, meaning) {
    const displayWord = (scriptMode === "kanji" && kanji) ? kanji : word;
    const hintStr = `${romaji}, ${meaning}`;
    if (hintMode === "paren") {
        return `<span class="target-word">${displayWord}</span> (${hintStr})`;
    }
    return `
        <span class="tooltip-wrap">
            <span class="target-word">${displayWord}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}

function formatCustomWord(hira, kanji, engKey) {
    const entry = customDict[engKey];
    if (!entry) return hira;
    return formatWord(hira, kanji || entry.kanji, entry.romaji, entry.meaning);
}

function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;
    labelEl.className = `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    const emoji = labelEl.querySelector('.icon-emoji');
    if (emoji) {
        if (isActive) { emoji.style.filter = "none"; emoji.style.opacity = "1"; }
        else { emoji.style.filter = "grayscale(100%)"; emoji.style.opacity = "0.55"; }
    }
}

function initSettingsPanel() {
    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelHiraganaOnly = document.getElementById("labelHiraganaOnly") || document.getElementById("labelHiragana");
    const labelWithKanji = document.getElementById("labelWithKanji") || document.getElementById("labelKanji");

    if (toggleScriptMode) {
        toggleScriptMode.addEventListener("change", (e) => {
            scriptMode = e.target.checked ? "kanji" : "hiragana";
            updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
            updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");
            initTask1();
            initTask2();
            initTask3Container();
        });
        updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
        updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");
    }

    const toggleHintMode = document.getElementById("toggleHintMode");
    const labelHoverHint = document.getElementById("labelHoverHint");
    const labelParenHint = document.getElementById("labelParenHint");

    if (toggleHintMode) {
        toggleHintMode.addEventListener("change", (e) => {
            hintMode = e.target.checked ? "paren" : "hover";
            updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
            updateToggleLabelStyle(labelParenHint, hintMode === "paren");
            initTask1();
            initTask2();
            initTask3Container();
        });
        updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
        updateToggleLabelStyle(labelParenHint, hintMode === "paren");
    }
}

function initExampleListen() {
    const ex1Btn = document.getElementById("ex1Listen");
    if (ex1Btn) {
        ex1Btn.addEventListener("click", () => {
            setPlayingState(ex1Btn, "Playing...");
            speakText("私は、学生です。", 0.9, () => stopAllPlayback());
        });
    }

    const ex2Btn = document.getElementById("ex2Listen");
    if (ex2Btn) {
        ex2Btn.addEventListener("click", () => {
            setPlayingState(ex2Btn, "Playing...");
            speakText("私は、先生じゃないです。", 0.9, () => stopAllPlayback());
        });
    }
}

function initTask1() {
    const container = document.getElementById("task1List");
    if (!container) return;
    container.innerHTML = "";

    taskData.forEach((item, index) => {
        const currentXWord = index < 4 ? "わたし" : "ともだち";
        const currentXKanji = index < 4 ? "私" : "友達";
        const currentXRomaji = index < 4 ? "watashi" : "tomodachi";
        const currentXMeaning = index < 4 ? "I" : "friend";
        const formattedX = formatWord(currentXWord, currentXKanji, currentXRomaji, currentXMeaning);
        const formattedY = formatWord(item.y, item.yKanji, item.yRomaji, item.yMeaning);
        const isNeg = (index % 2 === 1);

        createDrillRow(
            container, `${index + 1}.`, formattedX, formattedY,
            currentXWord, currentXKanji, item.y, item.yKanji, isNeg, 0.9, `task1_${index}`
        );
    });
}

function initTask2() {
    const container = document.getElementById("task2List");
    if (!container) return;
    container.innerHTML = "";

    const optionsXHtml = `
        <option value="" disabled selected>-- Choose X --</option>
        <option value="ともだち" data-eng="friend" data-kanji="友達">Friend</option>
        <option value="かぞく" data-eng="family" data-kanji="家族">Family</option>
        <option value="どうりょう" data-eng="colleague" data-kanji="同僚">Colleague</option>
        <option value="じょうし" data-eng="boss" data-kanji="上司">Boss</option>
        <option value="パートナー" data-eng="partner" data-kanji="パートナー">Partner</option>
        <option value="こいびと" data-eng="Bf/Gf" data-kanji="恋人">Bf/Gf</option>
        <option value="しんゆう" data-eng="best friend" data-kanji="親友">Best friend</option>
        <option value="こども" data-eng="child" data-kanji="子供">Child</option>
        <option value="まご" data-eng="grandchild" data-kanji="孫">Grandchild</option>
        <option value="きょうだい" data-eng="sibling" data-kanji="兄弟">Sibling</option>
    `;

    const optionsYHtml = `
        <option value="" disabled selected>-- Choose Y --</option>
        <option value="がいこくじん" data-eng="foreigner" data-kanji="外国人">Foreigner</option>
        <option value="いしゃ" data-eng="doctor" data-kanji="医者">Doctor</option>
        <option value="エンジニア" data-eng="engineer" data-kanji="エンジニア">Engineer</option>
        <option value="けんきゅうしゃ" data-eng="researcher" data-kanji="研究者">Researcher</option>
        <option value="デザイナー" data-eng="designer" data-kanji="デザイナー">Designer</option>
        <option value="てんいん" data-eng="store staff" data-kanji="店員">Store staff</option>
        <option value="じえいぎょう" data-eng="self-employed" data-kanji="自営業">Self-employed</option>
        <option value="こうむいん" data-eng="civil servant" data-kanji="こうむいん">Civil servant</option>
        <option value="かんごし" data-eng="nurse" data-kanji="看護師">Nurse</option>
        <option value="アルバイト" data-eng="part-time worker" data-kanji="アルバイト">Part-time worker</option>
    `;

    for (let i = 1; i <= 3; i++) {
        const rowKey = `task2_${i}`;
        const rowDiv = document.createElement("div");
        rowDiv.className = "drill-row";

        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const listenBtn = document.createElement("button");
        listenBtn.className = "example-button custom-tip-wrap";
        listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
        listenBtn.disabled = true;

        const indexSpan = document.createElement("span");
        indexSpan.textContent = `${taskData.length + i}.`;

        const selectX = document.createElement("select");
        selectX.className = "custom-select";
        selectX.innerHTML = optionsXHtml;

        const previewX = document.createElement("span");
        previewX.className = "prompt-label translation-preview";

        const labelHa = document.createElement("span");
        labelHa.textContent = "は";

        const selectY = document.createElement("select");
        selectY.className = "custom-select";
        selectY.innerHTML = optionsYHtml;

        const previewY = document.createElement("span");
        previewY.className = "prompt-label translation-preview";

        if (practice1State.customSelects[rowKey]) {
            if (practice1State.customSelects[rowKey].x) selectX.value = practice1State.customSelects[rowKey].x;
            if (practice1State.customSelects[rowKey].y) selectY.value = practice1State.customSelects[rowKey].y;
        }

        const isCustomNeg = (i % 2 === 0);
        const typeLabel = document.createElement("span");
        typeLabel.style.fontSize = "12px";
        typeLabel.style.color = "var(--text-secondary)";
        typeLabel.style.marginLeft = "4px";
        typeLabel.style.marginRight = "8px";
        typeLabel.textContent = isCustomNeg ? "(Negative)" : "(Affirmative)";

        const recordBtn = document.createElement("button");
        recordBtn.className = "example-button custom-tip-wrap";
        recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        resultSpan.textContent = practice1State.audioUrls[rowKey] ? "(Recorded) ✅" : "(Not recorded yet)";
        resultSpan.style.color = practice1State.audioUrls[rowKey] ? "var(--text-primary)" : "var(--text-secondary)";

        topRow.appendChild(listenBtn);
        topRow.appendChild(indexSpan);
        topRow.appendChild(selectX);
        topRow.appendChild(previewX);
        topRow.appendChild(labelHa);
        topRow.appendChild(selectY);
        topRow.appendChild(previewY);
        topRow.appendChild(typeLabel);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

        if (practice1State.audioUrls[rowKey]) {
            appendPersistedPlayButton(resultSpan, rowKey, 0.9);
        }

        const correctionBox = document.createElement("div");
        correctionBox.className = "correction-box";
        const corrListenBtn = document.createElement("button");
        corrListenBtn.className = "example-button";
        corrListenBtn.innerHTML = "🔊 きく";
        corrListenBtn.style.marginRight = "8px";
        const corrTextSpan = document.createElement("span");
        correctionBox.appendChild(corrListenBtn);
        correctionBox.appendChild(corrTextSpan);

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

        const updateDisplay = () => {
            const selectedOptX = selectX.options[selectX.selectedIndex];
            const selectedOptY = selectY.options[selectY.selectedIndex];
            const valX = selectX.value;
            const valY = selectY.value;

            if (!practice1State.customSelects[rowKey]) practice1State.customSelects[rowKey] = {};
            practice1State.customSelects[rowKey].x = valX;
            practice1State.customSelects[rowKey].y = valY;

            if (valX && selectedOptX) {
                previewX.innerHTML = formatCustomWord(valX, selectedOptX.getAttribute("data-kanji"), selectedOptX.getAttribute("data-eng"));
            } else { previewX.innerHTML = ""; }

            if (valY && selectedOptY) {
                previewY.innerHTML = formatCustomWord(valY, selectedOptY.getAttribute("data-kanji"), selectedOptY.getAttribute("data-eng"));
            } else { previewY.innerHTML = ""; }

            labelHa.style.display = valX ? "none" : "inline";

            if (valX && valY) {
                recordBtn.disabled = false;
                listenBtn.disabled = false;
                listenBtn.onclick = () => {
                    setPlayingState(listenBtn, "Playing...");
                    const kanjiX = selectedOptX.getAttribute("data-kanji") || valX;
                    const kanjiY = selectedOptY.getAttribute("data-kanji") || valY;
                    speakText(isCustomNeg ? `${kanjiX}は、${kanjiY}じゃないです。` : `${kanjiX}は、${kanjiY}です。`, 0.9, () => stopAllPlayback());
                };
            } else {
                recordBtn.disabled = true;
                listenBtn.disabled = true;
                stopBtn.disabled = true;
            }
        };

        selectX.addEventListener("change", updateDisplay);
        selectY.addEventListener("change", updateDisplay);
        updateDisplay();

        bindRecorderEvents(
            recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
            () => selectX.value, () => selectY.value,
            () => {
                const optX = selectX.options[selectX.selectedIndex];
                const optY = selectY.options[selectY.selectedIndex];
                const kX = optX ? optX.getAttribute("data-kanji") : selectX.value;
                const kY = optY ? optY.getAttribute("data-kanji") : selectY.value;
                return isCustomNeg ? `${kX}は${kY}じゃないです` : `${kX}は${kY}です`;
            },
            isCustomNeg, 0.9, rowKey
        );

        container.appendChild(rowDiv);
    }
}

function initTask3Container() {
    const container = document.getElementById("task3List");
    if (!container) return;
    let rowCount = 0;

    const englishToMap = {
        "i": { hira: "わたし", kanji: "私" },
        "college student": { hira: "だいがくせい", kanji: "大学生" },
        "major": { hira: "せんこう", kanji: "専攻" }, 
        "korea": { hira: "かんこく", kanji: "韓国" },
        "england": { hira: "イギリス", kanji: "イギリス" },
        "university": { hira: "だいがく", kanji: "大学" }, 
        "hospital": { hira: "びょういん", kanji: "病院" },
        "bank": { hira: "ぎんこう", kanji: "銀行" },
        "america": { hira: "アメリカ", kanji: "アメリカ" }
    };

    function resolveData(val) {
        const clean = val.trim().toLowerCase();
        return englishToMap[clean] || { hira: val, kanji: val };
    }

    function addTask3Row() {
        if (rowCount >= 12) return;
        rowCount++;
        const rowKey = `task3_${rowCount}`;
        const currentGlobalIndex = taskData.length + 3 + rowCount;
        const isCustomNeg = (rowCount % 2 === 0);

        const rowDiv = document.createElement("div");
        rowDiv.className = "drill-row";

        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const listenBtn = document.createElement("button");
        listenBtn.className = "example-button custom-tip-wrap";
        listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
        listenBtn.disabled = true;

        const indexSpan = document.createElement("span");
        indexSpan.textContent = `${currentGlobalIndex}.`;

        const inputX = document.createElement("input");
        inputX.type = "text";
        inputX.className = "custom-input task3-input-x";
        inputX.placeholder = "X";
        inputX.style.width = "130px";

        const labelHa = document.createElement("span");
        labelHa.textContent = "は";

        const inputY = document.createElement("input");
        inputY.type = "text";
        inputY.className = "custom-input task3-input-y";
        inputY.placeholder = "Y";
        inputY.style.width = "140px";

        if (practice1State.customSelects[rowKey]) {
            if (practice1State.customSelects[rowKey].x) inputX.value = practice1State.customSelects[rowKey].x;
            if (practice1State.customSelects[rowKey].y) inputY.value = practice1State.customSelects[rowKey].y;
        }

        const typeLabel = document.createElement("span");
        typeLabel.style.fontSize = "12px";
        typeLabel.style.color = "var(--text-secondary)";
        typeLabel.style.marginLeft = "4px";
        typeLabel.style.marginRight = "8px";
        typeLabel.textContent = isCustomNeg ? "(Negative)" : "(Affirmative)";

        const recordBtn = document.createElement("button");
        recordBtn.className = "example-button custom-tip-wrap";
        recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        resultSpan.textContent = practice1State.audioUrls[rowKey] ? "(Recorded) ✅" : "(Not recorded yet)";
        resultSpan.style.color = practice1State.audioUrls[rowKey] ? "var(--text-primary)" : "var(--text-secondary)";

        topRow.appendChild(listenBtn);
        topRow.appendChild(indexSpan);
        topRow.appendChild(inputX);
        topRow.appendChild(labelHa);
        topRow.appendChild(inputY);
        topRow.appendChild(typeLabel);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

        if (practice1State.audioUrls[rowKey]) {
            appendPersistedPlayButton(resultSpan, rowKey, 0.9);
        }

        const correctionBox = document.createElement("div");
        correctionBox.className = "correction-box";
        const corrListenBtn = document.createElement("button");
        corrListenBtn.className = "example-button";
        corrListenBtn.innerHTML = "🔊 きく";
        corrListenBtn.style.marginRight = "8px";
        const corrTextSpan = document.createElement("span");
        correctionBox.appendChild(corrListenBtn);
        correctionBox.appendChild(corrTextSpan);

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

        const updateDisplay = () => {
            const valX = inputX.value.trim();
            const valY = inputY.value.trim();

            if (!practice1State.customSelects[rowKey]) practice1State.customSelects[rowKey] = {};
            practice1State.customSelects[rowKey].x = inputX.value;
            practice1State.customSelects[rowKey].y = inputY.value;

            if (valX && valY) {
                recordBtn.disabled = false;
                listenBtn.disabled = false;
                listenBtn.onclick = () => {
                    setPlayingState(listenBtn, "Playing...");
                    const resX = resolveData(valX);
                    const resY = resolveData(valY);
                    speakText(isCustomNeg ? `${resX.kanji}は、${resY.kanji}じゃないです。` : `${resX.kanji}は、${resY.kanji}です。`, 0.9, () => stopAllPlayback());
                };
            } else {
                recordBtn.disabled = true;
                listenBtn.disabled = true;
                stopBtn.disabled = true;
            }
        };

        inputX.addEventListener("input", updateDisplay);
        inputY.addEventListener("input", updateDisplay);
        updateDisplay();

        bindRecorderEvents(
            recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
            () => resolveData(inputX.value).hira, () => resolveData(inputY.value).hira,
            () => {
                const rX = resolveData(inputX.value);
                const rY = resolveData(inputY.value);
                return isCustomNeg ? `${rX.kanji}は${rY.kanji}じゃないです` : `${rX.kanji}は${rY.kanji}です`;
            },
            isCustomNeg, 0.9, rowKey
        );

        container.appendChild(rowDiv);
    }

    container.innerHTML = "";
    for (let k = 0; k < 3; k++) { addTask3Row(); }
}

function createDrillRow(container, indexLabel, formattedX, formattedY, targetX, targetKanjiX, targetY, targetKanjiY, isNeg, playRate, rowKey) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    listenBtn.disabled = false;

    listenBtn.onclick = () => {
        setPlayingState(listenBtn, "Playing...");
        speakText(isNeg ? `${targetKanjiX}は、${targetKanjiY}じゃないです。` : `${targetKanjiX}は、${targetKanjiY}です。`, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label prompt-content";
    promptSpan.innerHTML = `${formattedX} ／ ${formattedY}`;

    const typeLabel = document.createElement("span");
    typeLabel.style.fontSize = "12px";
    typeLabel.style.color = "var(--text-secondary)";
    typeLabel.style.marginLeft = "4px";
    typeLabel.style.marginRight = "8px";
    typeLabel.textContent = isNeg ? "(Negative)" : "(Affirmative)";

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    resultSpan.textContent = practice1State.audioUrls[rowKey] ? "(Recorded) ✅" : "(Not recorded yet)";
    resultSpan.style.color = practice1State.audioUrls[rowKey] ? "var(--text-primary)" : "var(--text-secondary)";

    topRow.appendChild(listenBtn);
    topRow.appendChild(indexSpan);
    topRow.appendChild(promptSpan);
    topRow.appendChild(typeLabel);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

    if (practice1State.audioUrls[rowKey]) {
        appendPersistedPlayButton(resultSpan, rowKey, playRate);
    }

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";
    const corrListenBtn = document.createElement("button");
    corrListenBtn.className = "example-button";
    corrListenBtn.innerHTML = "🔊 きく";
    corrListenBtn.style.marginRight = "8px";
    const corrTextSpan = document.createElement("span");
    correctionBox.appendChild(corrListenBtn);
    correctionBox.appendChild(corrTextSpan);

    rowDiv.appendChild(topRow);
    rowDiv.appendChild(correctionBox);

    bindRecorderEvents(
        recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => targetX, () => targetY,
        () => isNeg ? `${targetKanjiX}は${targetKanjiY}じゃないです` : `${targetKanjiX}は${targetKanjiY}です`,
        isNeg, playRate, rowKey
    );

    container.appendChild(rowDiv);
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
    let playBtn = resultSpan.querySelector(".play-recording-btn");
    if (!playBtn) {
        playBtn = document.createElement("button");
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "8px";
        playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
        playBtn.onclick = () => {
            const recordedAudioUrl = practice1State.audioUrls[rowKey];
            if (recordedAudioUrl) {
                setPlayingState(playBtn, "Playing...");
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => stopAllPlayback());
            }
        };
        resultSpan.appendChild(playBtn);
    }
}

function bindRecorderEvents(
    recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
    getXFn, getYFn, getExpectedKanjiFn, expectedIsNeg = false, playRate = 0.9, rowKey = ""
) {
    let session = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;
        currentSession.finished = true;
        if (currentSession.watchdog !== null) { clearTimeout(currentSession.watchdog); currentSession.watchdog = null; }
        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (e) {}
        }
        if (currentSession.stream) { currentSession.stream.getTracks().forEach(track => track.stop()); }
        if (activeRecognitionSession === currentSession) { activeRecognitionSession = null; }
        if (session === currentSession) {
            session = null;
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            stopBtn.classList.remove("stop-btn-active");
        }
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;
        stopAllPlayback();
        if (activeRecognitionSession !== null) { releaseSession(activeRecognitionSession); }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            resultSpan.textContent = "Speech recognition is not supported in this browser.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        const currentX = getXFn();
        const currentY = getYFn();
        if (!currentX || !currentY) {
            resultSpan.textContent = "Please provide both X and Y.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        let stream;
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } 
        catch (err) {
            resultSpan.textContent = "Microphone access denied.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        const currentSession = {
            finished: false, stopRequested: false, errorMessage: "", recognition: null,
            watchdog: null, mediaRecorder: null, audioChunks: [], stream: stream,
            accumulatedTranscript: "", recognitionDone: false, recorderDone: false, processed: false
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        const tryProcessResult = () => {
            if (currentSession.errorMessage || currentSession.processed) return;
            if (currentSession.recognitionDone && currentSession.recorderDone) {
                currentSession.processed = true;
                processRecognitionResult(
                    currentSession.accumulatedTranscript, currentX, currentY, getExpectedKanjiFn, expectedIsNeg,
                    resultSpan, correctionBox, corrListenBtn, corrTextSpan, playRate, rowKey
                );
            }
        };

        try {
            const currentRecognition = new SpeechRecognition();
            currentSession.recognition = currentRecognition;
            currentRecognition.lang = "ja-JP";
            currentRecognition.interimResults = false;
            currentRecognition.continuous = isManualStop;

            const mediaRecorder = new MediaRecorder(stream);
            currentSession.mediaRecorder = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) currentSession.audioChunks.push(e.data); };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(currentSession.audioChunks, { type: "audio/webm" });
                const audioUrl = URL.createObjectURL(audioBlob);
                if (rowKey) practice1State.audioUrls[rowKey] = audioUrl;
                stream.getTracks().forEach(track => track.stop());
                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onresult = (event) => {
                if (currentSession.finished || session !== currentSession || currentSession.errorMessage) return;
                let rawTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) rawTranscript += event.results[i][0].transcript;
                }
                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = (event) => {
                if (currentSession.finished || session !== currentSession) return;
                releaseSession(currentSession);
            };

            currentRecognition.onend = () => {
                currentSession.recognitionDone = true;
                if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
                    try { currentSession.mediaRecorder.stop(); } catch (e) {}
                }
                tryProcessResult();
                releaseSession(currentSession);
            };

            recordBtn.disabled = true;
            stopBtn.disabled = !isManualStop;
            if (isManualStop) stopBtn.classList.add("stop-btn-active");
            else stopBtn.classList.remove("stop-btn-active");

            resultSpan.textContent = "Recording...";
            resultSpan.style.color = "var(--accent-color)";
            correctionBox.style.display = "none";

            mediaRecorder.start();
            currentRecognition.start();
        } catch (err) {
            releaseSession(currentSession);
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished || session.stopRequested) return;
        stopAllPlayback();
        session.stopRequested = true;
        stopBtn.disabled = true;
        releaseSession(session);
    });
}

function processRecognitionResult(
    rawTranscript, currentX, currentY, getExpectedKanjiFn, expectedIsNeg,
    resultSpan, correctionBox, corrListenBtn, corrTextSpan, playRate, rowKey
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

    const affRegex = new RegExp(`^${hiraX}は${hiraY}です` + endParticleRegex);
    const isAffirmative = affRegex.test(hiraText);

    const negRegex1 = new RegExp(`^${hiraX}は${hiraY}じゃないです` + endParticleRegex);
    const negRegex2 = new RegExp(`^${hiraX}は${hiraY}ではないです` + endParticleRegex);
    const negRegex3 = new RegExp(`^${hiraX}は${hiraY}じゃありません` + endParticleRegex);
    const negRegex4 = new RegExp(`^${hiraX}は${hiraY}ではありません` + endParticleRegex);
    const isNegative = negRegex1.test(hiraText) || negRegex2.test(hiraText) || negRegex3.test(hiraText) || negRegex4.test(hiraText);

    const isCorrectType = expectedIsNeg ? isNegative : isAffirmative;
    const kanjiTextForSpeech = getExpectedKanjiFn();

    if (isCorrectType) {
        resultSpan.textContent = hiraText + " ✅ ";
        resultSpan.style.color = "var(--text-primary)";
        if (rowKey) appendPersistedPlayButton(resultSpan, rowKey, playRate);
        correctionBox.style.display = "none";
    } else {
        resultSpan.textContent = hiraText + " ";
        resultSpan.style.color = "var(--error-text)";
        if (rowKey) appendPersistedPlayButton(resultSpan, rowKey, playRate);
        corrTextSpan.textContent = "Structure error, try it again";
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            setPlayingState(corrListenBtn, "Playing...");
            speakText(kanjiTextForSpeech, playRate, () => stopAllPlayback());
        };
        correctionBox.style.display = "block";
    }

    if (isAutoPlay && rowKey) {
        const recordedAudioUrl = practice1State.audioUrls[rowKey];
        if (recordedAudioUrl) {
            speakText(kanjiTextForSpeech, playRate, () => {
                stopAllPlayback();
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.playbackRate = 1.0;
                audio.onended = () => { currentPlayingAudio = null; };
                audio.play().catch(e => {});
            });
        }
    }
}
