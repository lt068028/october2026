// ============================================================================
// Practice 1: XはYです
// Drill 1: Basic Sentences
// Drill 2: Selectable Practice
// Drill 3: Free Input + Speech Recognition
// ============================================================================

const taskData = [
    { x: "わたし", xKanji: "私", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "わたし", xKanji: "私", y: "せんせい", yKanji: "先生", yRomaji: "sensei", yMeaning: "teacher", isNeg: true },
    { x: "わたし", xKanji: "私", y: "にほんじん", yKanji: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese", isNeg: false },
    { x: "わたし", xKanji: "私", y: "りゅうがくせい", yKanji: "留学生", yRomaji: "ryūgakusei", yMeaning: "international student", isNeg: true },
    { x: "ともだち", xKanji: "友達", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "ともだち", xKanji: "友達", y: "しゅふ", yKanji: "主婦", yRomaji: "shufu", yMeaning: "home maker", isNeg: true },
    { x: "ともだち", xKanji: "友達", y: "アメリカじん", yKanji: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American", isNeg: false }
];

const customDict = {
    "i": { hira: "わたし", kanji: "私", romaji: "watashi", meaning: "I" },
    "friend": { hira: "ともだち", kanji: "友達", romaji: "tomodachi", meaning: "friend" },
    "family": { hira: "かぞく", kanji: "家族", romaji: "kazoku", meaning: "family" },
    "colleague": { hira: "どうりょう", kanji: "同僚", romaji: "dōryō", meaning: "colleague" },
    "boss": { hira: "じょうし", kanji: "上司", romaji: "jōshi", meaning: "boss" },
    "partner": { hira: "パートナー", kanji: "パートナー", romaji: "pātonā", meaning: "partner" },
    "Bf/Gf": { hira: "こいびと", kanji: "恋人", romaji: "koibito", meaning: "Bf/Gf" },
    "best friend": { hira: "しんゆう", kanji: "親友", romaji: "shinyū", meaning: "best friend" },
    "child": { hira: "こども", kanji: "子供", romaji: "kodomo", meaning: "child" },
    "grandchild": { hira: "まご", kanji: "孫", romaji: "mago", meaning: "grandchild" },
    "sibling": { hira: "きょうだい", kanji: "兄弟", romaji: "kyōdai", meaning: "sibling" },
    "foreigner": { hira: "がいこくじん", kanji: "外国人", romaji: "gaikokujin", meaning: "foreigner" },
    "doctor": { hira: "いしゃ", kanji: "医者", romaji: "isha", meaning: "doctor" },
    "engineer": { hira: "エンジニア", kanji: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "researcher": { hira: "けんきゅうしゃ", kanji: "研究者", romaji: "kenkyūsha", meaning: "researcher" },
    "designer": { hira: "デザイナー", kanji: "デザイナー", romaji: "dezainā", meaning: "designer" },
    "store staff": { hira: "てんいん", kanji: "店員", romaji: "tenin", meaning: "store staff" },
    "self-employed": { hira: "じえいぎょう", kanji: "自営業", romaji: "jiēgyō", meaning: "self-employed" },
    "civil servant": { hira: "こうむいん", kanji: "公務員", romaji: "kōmuin", meaning: "civil servant" },
    "nurse": { hira: "かんごし", kanji: "看護師", romaji: "kangoshi", meaning: "nurse" },
    "part-time worker": { hira: "アルバイト", kanji: "アルバイト", romaji: "arubaito", meaning: "part-time worker" },
    "international student": { hira: "りゅうがくせい", kanji: "留学生", romaji: "ryūgakusei", meaning: "international student" },
    "home maker": { hira: "しゅふ", kanji: "主婦", romaji: "shufu", meaning: "home maker" }
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
        if (typeof speechSynthesis === "undefined") return;

        const voices = speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        let selected = voices.find(v =>
            v.name && v.lang &&
            v.name.toLowerCase().includes("chrome os") &&
            v.lang.includes("ja")
        );

        if (!selected) {
            selected = voices.find(v =>
                v.name && v.name.toLowerCase().includes("keita")
            );
        }

        if (!selected) {
            selected = voices.find(v =>
                v.name && v.name.toLowerCase().includes("nanami")
            );
        }

        if (!selected) {
            selected = voices.find(v =>
                v.name && v.lang &&
                v.name.toLowerCase().includes("google") &&
                v.lang.includes("ja")
            );
        }

        if (!selected) {
            selected = voices.find(v => v.lang && v.lang.includes("ja"));
        }

        if (selected) preferredVoice = selected;
    } catch (e) {
        console.warn("Voice setup error:", e);
    }
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

    if (!btn) return;

    if (!btn.dataset.originalHtml) {
        btn.dataset.originalHtml = btn.innerHTML;
    }

    btn.disabled = true;
    btn.textContent = text;
    activePlayButton = btn;
}

function restorePlayButton() {
    if (!activePlayButton) return;

    activePlayButton.disabled = false;

    if (activePlayButton.dataset.originalHtml) {
        activePlayButton.innerHTML = activePlayButton.dataset.originalHtml;
    } else {
        activePlayButton.innerHTML = "Play";
    }

    activePlayButton = null;
}

function stopAllPlayback() {
    if (currentPlayTimeoutId) {
        clearTimeout(currentPlayTimeoutId);
        currentPlayTimeoutId = null;
    }

    try {
        if (typeof speechSynthesis !== "undefined") {
            speechSynthesis.cancel();
        }
    } catch (e) {}

    currentUtteranceRef = null;

    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
    }

    restorePlayButton();
}

// ============================================================================
// Text normalization
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = String(text).normalize("NFKC");

    cleaned = cleaned.replace(
        /[\s.,\/#!$%\^&\*;:{}=\-_`~()（）「」『』【】［］〔〕〈〉《》、。，．！？!?：；…・"'“”‘’]/g,
        ""
    );

    cleaned = cleaned.replace(/[\u30A1-\u30F6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );

    const dict = {
        "私": "わたし",
        "学生": "がくせい",
        "先生": "せんせい",
        "日本人": "にほんじん",
        "会社員": "かいしゃいん",
        "友達": "ともだち",
        "友だち": "ともだち",
        "家族": "かぞく",
        "同僚": "どうりょう",
        "上司": "じょうし",
        "パートナー": "ぱーとなー",
        "恋人": "こいびと",
        "親友": "しんゆう",
        "子供": "こども",
        "子ども": "こども",
        "孫": "まご",
        "兄弟": "きょうだい",
        "姉妹": "しまい",
        "外国人": "がいこくじん",
        "医師": "いし",
        "医者": "いしゃ",
        "エンジニア": "えんじにあ",
        "研究者": "けんきゅうしゃ",
        "デザイナー": "でざいなー",
        "店員": "てんいん",
        "自営業": "じえいぎょう",
        "公務員": "こうむいん",
        "看護師": "かんごし",
        "看護婦": "かんごし",
        "アルバイト": "あるばいと",
        "留学生": "りゅうがくせい",
        "留学せい": "りゅうがくせい",
        "留がくせい": "りゅうがくせい",
        "主婦": "しゅふ",
        "アメリカ人": "あめりかじん",
        "アメリカじん": "あめりかじん"
    };

    const keys = Object.keys(dict).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        cleaned = cleaned.split(key).join(dict[key]);
    }

    return cleaned;
}

// ============================================================================
// Speech synthesis
// ============================================================================

function speakText(text, rate = 0.9, onEndCallback) {
    if (typeof SpeechSynthesisUtterance === "undefined") {
        if (onEndCallback) onEndCallback();
        return;
    }

    setupPreferredVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    currentUtteranceRef = utterance;

    utterance.onend = () => {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    };

    try {
        speechSynthesis.speak(utterance);
    } catch (err) {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    }
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    initTask1();
    initTask2();
    initTask3();
    setupFooterGuide();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
    const box = document.getElementById("guideBox");

    if (trigger && box) {
        trigger.addEventListener("click", e => {
            e.stopPropagation();
            box.style.display =
                box.style.display === "none" ? "block" : "none";
        });

        document.addEventListener("click", () => {
            box.style.display = "none";
        });
    }
}

function formatWord(word, kanji, romaji, meaning) {
    const displayWord =
        scriptMode === "kanji" && kanji ? kanji : word;

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

function formatCustomWord(word, kanji, meaning) {
    const displayWord =
        scriptMode === "kanji" && kanji ? kanji : word;

    const matchingKey = Object.keys(customDict).find(
        key =>
            customDict[key].meaning.toLowerCase() ===
            String(meaning || "").toLowerCase()
    );

    const romaji = matchingKey
        ? customDict[matchingKey].romaji
        : meaning;

    return formatWord(word, kanji, romaji, meaning);
}

function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;

    labelEl.className =
        `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;

    const emoji = labelEl.querySelector(".icon-emoji");

    if (emoji) {
        if (isActive) {
            emoji.style.filter = "none";
            emoji.style.opacity = "1";
        } else {
            emoji.style.filter = "grayscale(100%)";
            emoji.style.opacity = "0.55";
        }
    }
}

function initSettingsPanel() {
    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelHiraganaOnly =
        document.getElementById("labelHiraganaOnly") ||
        document.getElementById("labelHiragana");
    const labelWithKanji =
        document.getElementById("labelWithKanji") ||
        document.getElementById("labelKanji");

    if (toggleScriptMode) {
        toggleScriptMode.addEventListener("change", e => {
            scriptMode = e.target.checked ? "kanji" : "hiragana";

            updateToggleLabelStyle(
                labelHiraganaOnly,
                scriptMode === "hiragana"
            );

            updateToggleLabelStyle(
                labelWithKanji,
                scriptMode === "kanji"
            );

            initTask1();
            initTask2();
            initTask3();
        });

        updateToggleLabelStyle(labelHiraganaOnly, true);
        updateToggleLabelStyle(labelWithKanji, false);
    }

    const toggleHintMode = document.getElementById("toggleHintMode");
    const labelHoverHint = document.getElementById("labelHoverHint");
    const labelParenHint = document.getElementById("labelParenHint");

    if (toggleHintMode) {
        toggleHintMode.addEventListener("change", e => {
            hintMode = e.target.checked ? "paren" : "hover";

            updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
            updateToggleLabelStyle(labelParenHint, hintMode === "paren");

            initTask1();
            initTask2();
            initTask3();
        });

        updateToggleLabelStyle(labelHoverHint, true);
        updateToggleLabelStyle(labelParenHint, false);
    }
}

// ============================================================================
// Drill 1
// ============================================================================

function initTask1() {
    const container = document.getElementById("task1Container");
    if (!container) return;

    container.innerHTML = `
        <div class="info-panel info-panel-task1" style="margin-top: 25px;">
            <span class="info-panel-title">Drill 1: Basic Sentences</span>
            <span class="info-panel-desc">💡 Practice forming 🟢 affirmative and 🔴 negative statements.</span>
        </div>
        <div id="task1List"></div>
    `;

    const listDiv = document.getElementById("task1List");

    taskData.forEach((item, index) => {
        const currentXWord = item.x;
        const currentXKanji = item.xKanji;
        const currentXRomaji =
            item.x === "わたし" ? "watashi" : "tomodachi";
        const currentXMeaning =
            item.x === "わたし" ? "I" : "friend";

        const formattedX = formatWord(
            currentXWord,
            currentXKanji,
            currentXRomaji,
            currentXMeaning
        );

        const formattedY = formatWord(
            item.y,
            item.yKanji,
            item.yRomaji,
            item.yMeaning
        );

        const isNeg = item.isNeg;

        createDrillRow(
            listDiv,
            `${index + 1}.`,
            formattedX,
            formattedY,
            currentXWord,
            currentXKanji,
            item.y,
            item.yKanji,
            isNeg,
            0.9,
            `task1_${index}`
        );
    });
}

// ============================================================================
// Drill 2
// ============================================================================

function initTask2() {
    const container = document.getElementById("task2Container");
    if (!container) return;

    container.innerHTML = `
        <div class="info-panel info-panel-task2" style="margin-top: 30px;">
            <span class="info-panel-title">Drill 2: Selectable Practice</span>
            <span class="info-panel-desc">💡 Choose words and form sentences.</span>
        </div>
        <div id="task2List"></div>
    `;

    const listDiv = document.getElementById("task2List");

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
        <option value="こうむいん" data-eng="civil servant" data-kanji="公務員">Civil servant</option>
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
        listenBtn.innerHTML =
            '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
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
            if (practice1State.customSelects[rowKey].x) {
                selectX.value = practice1State.customSelects[rowKey].x;
            }

            if (practice1State.customSelects[rowKey].y) {
                selectY.value = practice1State.customSelects[rowKey].y;
            }
        }

        const isCustomNeg = i % 2 === 0;

        const typeLabel = document.createElement("span");
        typeLabel.className = "custom-tip-wrap";
        typeLabel.style.fontSize = "16px";
        typeLabel.style.marginLeft = "4px";
        typeLabel.style.marginRight = "8px";
        typeLabel.style.cursor = "pointer";
        typeLabel.innerHTML = isCustomNeg
            ? `🔴<span class="custom-tip-box">Negative</span>`
            : `🟢<span class="custom-tip-box">Affirmative</span>`;

        const recordBtn = document.createElement("button");
        recordBtn.className = "example-button custom-tip-wrap";
        recordBtn.innerHTML =
            '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML =
            '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        resultSpan.textContent = practice1State.audioUrls[rowKey]
            ? "(Recorded)"
            : "(Not recorded yet)";
        resultSpan.style.color = practice1State.audioUrls[rowKey]
            ? "var(--text-primary)"
            : "var(--text-secondary)";

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
        correctionBox.style.display = "none";

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

            if (!practice1State.customSelects[rowKey]) {
                practice1State.customSelects[rowKey] = {};
            }

            practice1State.customSelects[rowKey].x = valX;
            practice1State.customSelects[rowKey].y = valY;

            if (valX && selectedOptX) {
                previewX.innerHTML = formatCustomWord(
                    valX,
                    selectedOptX.getAttribute("data-kanji"),
                    selectedOptX.getAttribute("data-eng")
                );
            } else {
                previewX.innerHTML = "";
            }

            if (valY && selectedOptY) {
                previewY.innerHTML = formatCustomWord(
                    valY,
                    selectedOptY.getAttribute("data-kanji"),
                    selectedOptY.getAttribute("data-eng")
                );
            } else {
                previewY.innerHTML = "";
            }

            labelHa.style.display = valX ? "none" : "inline";

            if (valX && valY) {
                recordBtn.disabled = false;
                listenBtn.disabled = false;

                listenBtn.onclick = () => {
                    setPlayingState(listenBtn, "Playing...");

                    const kanjiX =
                        selectedOptX.getAttribute("data-kanji") || valX;
                    const kanjiY =
                        selectedOptY.getAttribute("data-kanji") || valY;

                    const modelSentence = isCustomNeg
                        ? `${kanjiX}は、${kanjiY}じゃ、ないです。`
                        : `${kanjiX}は、${kanjiY}です。`;

                    speakText(modelSentence, 0.9, () => stopAllPlayback());
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
            recordBtn,
            stopBtn,
            resultSpan,
            correctionBox,
            corrListenBtn,
            corrTextSpan,
            () => selectX.value,
            () => selectY.value,
            () => {
                const optX = selectX.options[selectX.selectedIndex];
                const optY = selectY.options[selectY.selectedIndex];

                const kX = optX
                    ? optX.getAttribute("data-kanji") || selectX.value
                    : selectX.value;

                const kY = optY
                    ? optY.getAttribute("data-kanji") || selectY.value
                    : selectY.value;

                return isCustomNeg
                    ? `${kX}は、${kY}じゃ、ないです。`
                    : `${kX}は、${kY}です。`;
            },
            isCustomNeg,
            0.9,
            rowKey,
            false
        );

        listDiv.appendChild(rowDiv);
    }
}

// ============================================================================
// Drill 3: Free X/Y input + speech recognition
// ============================================================================

function initTask3() {
    const container = document.getElementById("task3Container");
    if (!container) return;

    container.innerHTML = `
        <div class="info-panel info-panel-task3" style="margin-top: 30px;">
            <span class="info-panel-title">Drill 3: Free Practice</span>
            <span class="info-panel-desc">💡 Enter X and Y, then speak a sentence. You can use affirmative or negative sentences.</span>
        </div>
        <div id="task3List"></div>
    `;

    const listDiv = document.getElementById("task3List");

    for (let k = 1; k <= 3; k++) {
        const rowKey = `task3_${k}`;
        const currentGlobalIndex = taskData.length + 3 + k;

        const rowDiv = document.createElement("div");
        rowDiv.className = "drill-row";

        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const indexSpan = document.createElement("span");
        indexSpan.textContent = `${currentGlobalIndex}.`;
        indexSpan.style.fontWeight = "bold";

        const inputX = document.createElement("input");
        inputX.type = "text";
        inputX.className = "custom-input";
        inputX.placeholder = "X";
        inputX.style.width = "120px";

        const labelHa = document.createElement("span");
        labelHa.textContent = "は";

        const inputY = document.createElement("input");
        inputY.type = "text";
        inputY.className = "custom-input";
        inputY.placeholder = "Y";
        inputY.style.width = "120px";

        if (practice1State.customSelects[rowKey]) {
            if (practice1State.customSelects[rowKey].x) {
                inputX.value = practice1State.customSelects[rowKey].x;
            }

            if (practice1State.customSelects[rowKey].y) {
                inputY.value = practice1State.customSelects[rowKey].y;
            }
        }

        const recordBtn = document.createElement("button");
        recordBtn.className = "example-button custom-tip-wrap";
        recordBtn.innerHTML =
            '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML =
            '⏹️<span class="custom-tip-box">Stop recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        resultSpan.textContent = practice1State.audioUrls[rowKey]
            ? "(Recorded)"
            : "(Not recorded yet)";
        resultSpan.style.color = practice1State.audioUrls[rowKey]
            ? "var(--text-primary)"
            : "var(--text-secondary)";

        topRow.appendChild(indexSpan);
        topRow.appendChild(inputX);
        topRow.appendChild(labelHa);
        topRow.appendChild(inputY);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

        if (practice1State.audioUrls[rowKey]) {
            appendPersistedPlayButton(resultSpan, rowKey, 0.9);
        }

        const correctionBox = document.createElement("div");
        correctionBox.className = "correction-box";
        correctionBox.style.display = "none";

        const corrListenBtn = document.createElement("button");
        corrListenBtn.className = "example-button";
        corrListenBtn.innerHTML = "🔊 きく";
        corrListenBtn.style.marginRight = "8px";

        const corrTextSpan = document.createElement("span");

        correctionBox.appendChild(corrListenBtn);
        correctionBox.appendChild(corrTextSpan);

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

        const updateState = () => {
            const valX = inputX.value.trim();
            const valY = inputY.value.trim();

            if (!practice1State.customSelects[rowKey]) {
                practice1State.customSelects[rowKey] = {};
            }

            practice1State.customSelects[rowKey].x = inputX.value;
            practice1State.customSelects[rowKey].y = inputY.value;

            recordBtn.disabled = !(valX && valY);

            if (!valX || !valY) {
                stopBtn.disabled = true;
            }
        };

        inputX.addEventListener("input", updateState);
        inputY.addEventListener("input", updateState);

        updateState();

        bindRecorderEvents(
            recordBtn,
            stopBtn,
            resultSpan,
            correctionBox,
            corrListenBtn,
            corrTextSpan,
            () => inputX.value.trim(),
            () => inputY.value.trim(),
            () => `${inputX.value.trim()}は、${inputY.value.trim()}です。`,
            null,
            0.9,
            rowKey,
            true
        );

        listDiv.appendChild(rowDiv);
    }
}

// ============================================================================
// Saved audio playback
// ============================================================================

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
    let playBtn = resultSpan.querySelector(".play-recording-btn");

    if (playBtn) return;

    playBtn = document.createElement("button");
    playBtn.className =
        "example-button play-recording-btn custom-tip-wrap";
    playBtn.style.marginLeft = "8px";
    playBtn.innerHTML =
        '▶️<span class="custom-tip-box">Play your recorded voice</span>';

    playBtn.onclick = () => {
        const recordedAudioUrl = practice1State.audioUrls[rowKey];

        if (!recordedAudioUrl) return;

        setPlayingState(playBtn, "Playing...");

        const audio = new Audio(recordedAudioUrl);
        currentPlayingAudio = audio;
        audio.playbackRate = 1.0;

        audio.onended = () => stopAllPlayback();
        audio.onerror = () => stopAllPlayback();

        audio.play().catch(() => stopAllPlayback());
    };

    resultSpan.appendChild(playBtn);
}

// ============================================================================
// Shared recorder + speech recognition
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
    getExpectedKanjiFn,
    expectedIsNeg = false,
    playRate = 0.9,
    rowKey = "",
    allowEitherStructure = false
) {
    let session = null;

    function showError(message) {
        resultSpan.textContent = message;
        resultSpan.style.color = "var(--error-text)";

        if (correctionBox) {
            correctionBox.style.display = "none";
        }
    }

    function releaseSession(currentSession, stopRecognition = false) {
        if (!currentSession || currentSession.finished) return;

        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
        }

        if (currentSession.autoStopTimer) {
            clearTimeout(currentSession.autoStopTimer);
            currentSession.autoStopTimer = null;
        }

        if (stopRecognition && currentSession.recognition) {
            try {
                currentSession.recognition.stop();
            } catch (e) {}
        }

        if (
            currentSession.mediaRecorder &&
            currentSession.mediaRecorder.state !== "inactive"
        ) {
            try {
                currentSession.mediaRecorder.stop();
            } catch (e) {}
        }

        if (currentSession.stream) {
            currentSession.stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {}
            });
        }

        if (activeRecognitionSession === currentSession) {
            activeRecognitionSession = null;
        }

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

        if (activeRecognitionSession !== null) {
            releaseSession(activeRecognitionSession, true);
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showError(
                "Speech recognition is not available in this browser. Please use a supported browser such as Chrome."
            );
            return;
        }

        const currentX = String(getXFn() || "").trim();
        const currentY = String(getYFn() || "").trim();

        if (!currentX || !currentY) {
            showError("Please enter or select both X and Y.");
            return;
        }

        if (
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
            showError("Microphone access is not available in this environment.");
            return;
        }

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (err) {
            showError(
                "Microphone access failed. Please check your microphone permissions."
            );
            return;
        }

        if (activeRecognitionSession !== null) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        const currentSession = {
            finished: false,
            stopRequested: false,
            errorMessage: "",
            recognition: null,
            watchdog: null,
            autoStopTimer: null,
            mediaRecorder: null,
            audioChunks: [],
            stream,
            accumulatedTranscript: "",
            recognitionDone: false,
            recorderDone: false,
            processed: false,
            audioUrl: null
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        const tryProcessResult = () => {
            if (
                currentSession.errorMessage ||
                currentSession.processed ||
                currentSession.finished
            ) {
                return;
            }

            if (
                currentSession.recognitionDone &&
                currentSession.recorderDone
            ) {
                currentSession.processed = true;

                processRecognitionResult(
                    currentSession.accumulatedTranscript,
                    resultSpan,
                    correctionBox
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

            mediaRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    currentSession.audioChunks.push(event.data);
                }
            };

            mediaRecorder.onerror = () => {
                if (currentSession.finished) return;

                currentSession.errorMessage = "recording-error";
                showError("Recording failed. Please try again.");
                releaseSession(currentSession, true);
            };

            mediaRecorder.onstop = () => {
                if (currentSession.errorMessage) return;

                if (currentSession.audioChunks.length > 0) {
                    const audioBlob = new Blob(
                        currentSession.audioChunks,
                        { type: "audio/webm" }
                    );

                    currentSession.audioUrl =
                        URL.createObjectURL(audioBlob);

                    if (rowKey) {
                        const oldUrl = practice1State.audioUrls[rowKey];

                        if (
                            oldUrl &&
                            oldUrl !== currentSession.audioUrl
                        ) {
                            URL.revokeObjectURL(oldUrl);
                        }

                        practice1State.audioUrls[rowKey] =
                            currentSession.audioUrl;
                    }
                }

                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onresult = event => {
                if (
                    currentSession.finished ||
                    session !== currentSession ||
                    currentSession.errorMessage
                ) {
                    return;
                }

                let rawTranscript = "";

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    if (event.results[i].isFinal) {
                        rawTranscript += event.results[i][0].transcript;
                    }
                }

                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = event => {
                if (
                    currentSession.finished ||
                    session !== currentSession
                ) {
                    return;
                }

                currentSession.errorMessage =
                    event.error || "recognition-error";

                if (
                    event.error === "not-allowed" ||
                    event.error === "service-not-allowed"
                ) {
                    showError(
                        "Microphone or speech recognition permission was denied. Check your browser settings."
                    );
                } else if (event.error === "audio-capture") {
                    showError(
                        "No microphone was detected. Check your microphone connection and settings."
                    );
                } else if (event.error === "no-speech") {
                    showError("No speech detected.");
                } else if (event.error === "network") {
                    showError(
                        "Speech recognition service connection failed. Check your connection and try again."
                    );
                } else if (event.error !== "aborted") {
                    showError(
                        "Speech could not be recognized. Please try recording again."
                    );
                }

                releaseSession(currentSession, true);
            };

            currentRecognition.onend = () => {
                if (currentSession.errorMessage) return;

                currentSession.recognitionDone = true;

                if (
                    currentSession.mediaRecorder &&
                    currentSession.mediaRecorder.state !== "inactive"
                ) {
                    try {
                        currentSession.mediaRecorder.stop();
                    } catch (e) {}
                }

                tryProcessResult();

                if (
                    currentSession.recorderDone &&
                    currentSession.recognitionDone
                ) {
                    releaseSession(currentSession);
                }
            };

            recordBtn.disabled = true;
            stopBtn.disabled = !isManualStop;

            if (isManualStop) {
                stopBtn.classList.add("stop-btn-active");
            } else {
                stopBtn.classList.remove("stop-btn-active");
            }

            // Do not display a "Recording..." status.
            // The result area remains unchanged until a transcript is available.

            if (correctionBox) {
                correctionBox.style.display = "none";
            }

            mediaRecorder.start();
            currentRecognition.start();

            currentSession.watchdog = setTimeout(() => {
                if (
                    currentSession.finished ||
                    session !== currentSession
                ) {
                    return;
                }

                currentSession.errorMessage = "timeout";
                showError(
                    "Speech recognition did not finish. Please try recording again."
                );
                releaseSession(currentSession, true);
            }, isManualStop ? 20000 : 12000);

            if (!isManualStop) {
                currentSession.autoStopTimer = setTimeout(() => {
                    if (
                        currentSession.finished ||
                        session !== currentSession
                    ) {
                        return;
                    }

                    if (
                        currentSession.mediaRecorder &&
                        currentSession.mediaRecorder.state === "recording"
                    ) {
                        try {
                            currentSession.mediaRecorder.stop();
                        } catch (e) {}
                    }

                    if (currentSession.recognition) {
                        try {
                            currentSession.recognition.stop();
                        } catch (e) {}
                    }
                }, 5000);
            }
        } catch (err) {
            console.error("Recording/recognition startup error:", err);

            currentSession.errorMessage = "startup-error";
            showError(
                "Recording could not start. Check your microphone settings and try again."
            );
            releaseSession(currentSession, true);
        }
    });

    stopBtn.addEventListener("click", () => {
        if (
            !session ||
            session.finished ||
            session.stopRequested
        ) {
            return;
        }

        const currentSession = session;
        currentSession.stopRequested = true;

        stopAllPlayback();
        stopBtn.disabled = true;

        if (
            currentSession.mediaRecorder &&
            currentSession.mediaRecorder.state === "recording"
        ) {
            try {
                currentSession.mediaRecorder.stop();
            } catch (e) {}
        }

        if (currentSession.recognition) {
            try {
                currentSession.recognition.stop();
            } catch (e) {}
        }
    });
}

// ============================================================================
// Recognition result display
// No sentence judgement, no correct/incorrect messages.
// ============================================================================

function processRecognitionResult(
    rawTranscript,
    resultSpan,
    correctionBox
) {
    const transcript = String(rawTranscript || "").trim();

    if (correctionBox) {
        correctionBox.style.display = "none";
    }

    if (!transcript) {
        resultSpan.textContent = "No speech detected.";
        resultSpan.style.color = "var(--error-text)";
        return;
    }

    // Display the recognized text as-is.
    // Do not normalize it for judgement or evaluate sentence structure.
    resultSpan.textContent = transcript;
    resultSpan.style.color = "var(--text-primary)";
}

// ============================================================================
// Drill row creation
// ============================================================================

function createDrillRow(
    container,
    indexLabel,
    formattedX,
    formattedY,
    targetX,
    targetKanjiX,
    targetY,
    targetKanjiY,
    isNeg,
    playRate,
    rowKey
) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML =
        '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    listenBtn.disabled = false;

    listenBtn.onclick = () => {
        setPlayingState(listenBtn, "Playing...");

        const modelSentence = isNeg
            ? `${targetKanjiX}は、${targetKanjiY}じゃ、ないです。`
            : `${targetKanjiX}は、${targetKanjiY}です。`;

        speakText(modelSentence, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label prompt-content";
    promptSpan.innerHTML = `${formattedX} ／ ${formattedY}`;

    const typeLabel = document.createElement("span");
    typeLabel.className = "custom-tip-wrap";
    typeLabel.style.fontSize = "16px";
    typeLabel.style.marginLeft = "4px";
    typeLabel.style.marginRight = "8px";
    typeLabel.style.cursor = "pointer";
    typeLabel.innerHTML = isNeg
        ? `🔴<span class="custom-tip-box">Negative</span>`
        : `🟢<span class="custom-tip-box">Affirmative</span>`;

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    resultSpan.textContent = practice1State.audioUrls[rowKey]
        ? "(Recorded)"
        : "(Not recorded yet)";
    resultSpan.style.color = practice1State.audioUrls[rowKey]
        ? "var(--text-primary)"
        : "var(--text-secondary)";

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
    correctionBox.style.display = "none";

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
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => targetX,
        () => targetY,
        () => isNeg
            ? `${targetKanjiX}は、${targetKanjiY}じゃ、ないです。`
            : `${targetKanjiX}は、${targetKanjiY}です。`,
        isNeg,
        playRate,
        rowKey,
        false
    );

    container.appendChild(rowDiv);
}
