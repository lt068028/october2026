// ============================================================================
// Practice 1: XはYです (Practice 2 アーキテクチャ完全準拠版)
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
    audioUrls: {},
    savedResults: {}
};

let preferredVoice = null;

function setupPreferredVoice() {
    try {
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
let activePlayButtons = [];
let currentUtteranceRef = null;

function setPlayingStateMultiple(buttons, text) {
    stopAllPlayback();
    activePlayButtons = buttons;

    buttons.forEach(btn => {
        if (!btn) return;

        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }

        btn.disabled = true;
        btn.textContent = text;
    });
}

function restorePlayButtons() {
    activePlayButtons.forEach(btn => {
        if (!btn) return;

        btn.disabled = false;

        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
        } else {
            btn.innerHTML = "Play";
        }
    });

    activePlayButtons = [];
}

function stopAllPlayback() {
    if (currentPlayTimeoutId) {
        clearTimeout(currentPlayTimeoutId);
        currentPlayTimeoutId = null;
    }

    try {
        speechSynthesis.cancel();
    } catch (e) {}

    currentUtteranceRef = null;

    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
    }

    restorePlayButtons();
}

// ひらがな正規化処理
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

function speakText(text, rate = 0.9, onEndCallback) {
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

document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    renderAll();
    setupFooterGuide();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
    const box = document.getElementById("guideBox");

    if (trigger && box) {
        trigger.addEventListener("click", (e) => {
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

function formatCustomWord(word, kanji, meaning) {
    const displayWord = (scriptMode === "kanji" && kanji) ? kanji : word;

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

function initSettingsPanel() {
    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelHiraganaOnly = document.getElementById("labelHiraganaOnly");
    const labelWithKanji = document.getElementById("labelWithKanji");

    if (toggleScriptMode) {
        toggleScriptMode.addEventListener("change", (e) => {
            scriptMode = e.target.checked ? "kanji" : "hiragana";
            updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
            updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");
            renderAll();
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
            renderAll();
        });
        updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
        updateToggleLabelStyle(labelParenHint, hintMode === "paren");
    }

    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");
    const labelManualRecord = document.getElementById("labelManualRecord");

    if (toggleRecordMode) {
        toggleRecordMode.addEventListener("change", (e) => {
            isManualStop = e.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
            updateToggleLabelStyle(labelManualRecord, isManualStop);
        });
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        updateToggleLabelStyle(labelManualRecord, isManualStop);
    }

    const togglePlaybackMode = document.getElementById("togglePlaybackMode");
    const labelAutoPlay = document.getElementById("labelAutoPlay");
    const labelManualPlay = document.getElementById("labelManualPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.addEventListener("change", (e) => {
            isAutoPlay = !e.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
            updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
        });
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
    }
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

// ============================================================================
// Example Section（復元）
// ============================================================================

function renderExampleSection() {
    const container = document.getElementById("exampleSectionContainer");
    if (!container) return;

    const formattedX = formatWord("わたし", "私", "watashi", "I");
    const formattedStudent = formatWord("がくせい", "学生", "gakusei", "student");
    const formattedTeacher = formatWord("せんせい", "先生", "sensei", "teacher");

    const affirmativeSentence = scriptMode === "kanji"
        ? "私は、学生です。"
        : "わたしは、がくせいです。";

    const negativeSentence = scriptMode === "kanji"
        ? "私は、先生じゃないです。"
        : "わたしは、せんせいじゃないです。";

    // ExampleをDrillタイトル用のinfo-panelから独立させる
    container.innerHTML = `
        <div class="example-box">
            <div class="info-panel-desc">
                💡 Listen to model sentences and practice basic structures.
            </div>

            <div class="flex-row-center" style="margin-top: 16px;">
                <span class="example-label-title">🟢Affirmative:</span>
                ${formattedX}
                ／
                ${formattedStudent}
                <span>👉</span>
                <button id="ex1Listen" class="example-button">
                    🔊 きく
                </button>
                <span>${affirmativeSentence}</span>
            </div>

            <div class="flex-row-center dashed-border"
                 style="margin-top: 12px; padding-top: 12px;">
                <span class="example-label-title">🔴Negative:</span>
                ${formattedX}
                ／
                ${formattedTeacher}
                <span>👉</span>
                <button id="ex2Listen" class="example-button">
                    🔊 きく
                </button>
                <span>${negativeSentence}</span>
            </div>
        </div>
    `;

    const ex1Listen = document.getElementById("ex1Listen");
    const ex2Listen = document.getElementById("ex2Listen");

    if (ex1Listen) {
        ex1Listen.addEventListener("click", () => {
            setPlayingStateMultiple([ex1Listen], "Playing...");
            speakText(affirmativeSentence, 0.9, () => stopAllPlayback());
        });
    }

    if (ex2Listen) {
        ex2Listen.addEventListener("click", () => {
            setPlayingStateMultiple([ex2Listen], "Playing...");
            speakText(negativeSentence, 0.9, () => stopAllPlayback());
        });
    }
}


function renderAll() {
    renderExampleSection();
    renderTask1();
    renderTask2();
    renderTask3();
}

// ============================================================================
// Drill 1: Basic Sentences
// ============================================================================
function renderTask1() {
    let container = document.getElementById("task1Container");
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
        const currentXRomaji = item.x === "わたし" ? "watashi" : "tomodachi";
        const currentXMeaning = item.x === "わたし" ? "I" : "friend";

        const formattedX = formatWord(currentXWord, currentXKanji, currentXRomaji, currentXMeaning);
        const formattedY = formatWord(item.y, item.yKanji, item.yRomaji, item.yMeaning);
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
            `task1_${index}`,
            false
        );
    });
}

// ============================================================================
// Drill 2: Selectable Practice
// ============================================================================
function renderTask2() {
    let container = document.getElementById("task2Container");
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
        recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        if (practice1State.savedResults[rowKey]) {
            resultSpan.textContent = practice1State.savedResults[rowKey].html;
            resultSpan.style.color = practice1State.savedResults[rowKey].color;
        } else {
            resultSpan.textContent = practice1State.audioUrls[rowKey] ? "(Recorded) ✅" : "(Not recorded yet)";
            resultSpan.style.color = practice1State.audioUrls[rowKey] ? "var(--text-primary)" : "var(--text-secondary)";
        }

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
                previewX.innerHTML = formatCustomWord(valX, selectedOptX.getAttribute("data-kanji"), selectedOptX.getAttribute("data-eng"));
            } else {
                previewX.innerHTML = "";
            }

            if (valY && selectedOptY) {
                previewY.innerHTML = formatCustomWord(valY, selectedOptY.getAttribute("data-kanji"), selectedOptY.getAttribute("data-eng"));
            } else {
                previewY.innerHTML = "";
            }

            labelHa.style.display = valX ? "none" : "inline";

            if (valX && valY) {
                recordBtn.disabled = false;
                listenBtn.disabled = false;

                listenBtn.onclick = () => {
                    setPlayingStateMultiple([listenBtn], "Playing...");
                    const kanjiX = selectedOptX.getAttribute("data-kanji") || valX;
                    const kanjiY = selectedOptY.getAttribute("data-kanji") || valY;
                    const modelSentence = isCustomNeg ? `${kanjiX}は、${kanjiY}じゃ、ないです。` : `${kanjiX}は、${kanjiY}です。`;
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
            () => {
                const optX = selectX.options[selectX.selectedIndex];
                const optY = selectY.options[selectY.selectedIndex];
                const kX = optX ? optX.getAttribute("data-kanji") || selectX.value : selectX.value;
                const kY = optY ? optY.getAttribute("data-kanji") || selectY.value : selectY.value;
                return isCustomNeg ? `${kX}は${kY}じゃないです` : `${kX}は${kY}です`;
            },
            () => {
                const optX = selectX.options[selectX.selectedIndex];
                const optY = selectY.options[selectY.selectedIndex];
                const kX = optX ? optX.getAttribute("data-kanji") || selectX.value : selectX.value;
                const kY = optY ? optY.getAttribute("data-kanji") || selectY.value : selectY.value;
                return isCustomNeg ? `${kX}は、${kY}じゃ、ないです。` : `${kX}は、${kY}です。`;
            },
            0.9,
            rowKey,
            false,
            () => selectX.value,
            () => selectY.value
        );

        listDiv.appendChild(rowDiv);
    }
}

// ============================================================================
// Drill 3: Free Practice
// ============================================================================
function renderTask3() {
    let container = document.getElementById("task3Container");
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
            if (practice1State.customSelects[rowKey].x) inputX.value = practice1State.customSelects[rowKey].x;
            if (practice1State.customSelects[rowKey].y) inputY.value = practice1State.customSelects[rowKey].y;
        }

        const recordBtn = document.createElement("button");
        recordBtn.className = "example-button custom-tip-wrap";
        recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        if (practice1State.savedResults[rowKey]) {
            resultSpan.textContent = practice1State.savedResults[rowKey].html;
            resultSpan.style.color = practice1State.savedResults[rowKey].color;
        } else {
            resultSpan.textContent = practice1State.audioUrls[rowKey] ? "(Recorded) ✅" : "(Not recorded yet)";
            resultSpan.style.color = practice1State.audioUrls[rowKey] ? "var(--text-primary)" : "var(--text-secondary)";
        }

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
            () => {
                const x = inputX.value.trim();
                const y = inputY.value.trim();
                return `${x}は${y}です`;
            },
            () => `${inputX.value.trim()}は、${inputY.value.trim()}です。`,
            0.9,
            rowKey,
            true,
            () => inputX.value.trim(),
            () => inputY.value.trim()
        );

        listDiv.appendChild(rowDiv);
    }
}

// ============================================================================
// Drill Row Creation Helpers
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
    listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    listenBtn.disabled = false;

    listenBtn.onclick = () => {
        setPlayingStateMultiple([listenBtn], "Playing...");
        const modelSentence = isNeg ? `${targetKanjiX}は、${targetKanjiY}じゃ、ないです。` : `${targetKanjiX}は、${targetKanjiY}です。`;
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
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    if (practice1State.savedResults[rowKey]) {
        resultSpan.textContent = practice1State.savedResults[rowKey].html;
        resultSpan.style.color = practice1State.savedResults[rowKey].color;
    } else {
        resultSpan.textContent = practice1State.audioUrls[rowKey] ? "(Recorded) ✅" : "(Not recorded yet)";
        resultSpan.style.color = practice1State.audioUrls[rowKey] ? "var(--text-primary)" : "var(--text-secondary)";
    }

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
        () => isNeg ? `${targetX}は${targetY}じゃないです` : `${targetX}は${targetY}です`,
        () => isNeg ? `${targetKanjiX}は、${targetKanjiY}じゃ、ないです。` : `${targetKanjiX}は、${targetKanjiY}です。`,
        playRate,
        rowKey,
        false,
        () => targetX,
        () => targetY
    );

    container.appendChild(rowDiv);
}

// ============================================================================
// Saved Audio Playback Helper
// ============================================================================
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
                setPlayingStateMultiple([playBtn], "Playing...");

                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.playbackRate = playRate;

                audio.onended = () => stopAllPlayback();
                audio.onerror = () => stopAllPlayback();

                audio.play().catch(e => stopAllPlayback());
            }
        };

        resultSpan.appendChild(playBtn);
    }
    return playBtn;
}

// ============================================================================
// Shared Recorder & Speech Recognition Architecture (Practice 2 Style)
// ============================================================================
function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getExpectedTextFn,
    getExpectedKanjiFn,
    playRate,
    rowKey,
    allowEitherStructure = false,
    getXFn = () => "",
    getYFn = () => ""
) {
    let session = null;
    let lastAudioUrl = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;

        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
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
            currentSession.stream.getTracks().forEach(track => track.stop());
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

    function requestStop(currentSession, abort = false, errorMessage = "") {
        if (!currentSession || currentSession.finished) return;

        if (errorMessage) {
            currentSession.errorMessage = errorMessage;
            resultSpan.textContent = errorMessage;
            resultSpan.style.color = "var(--error-text)";
        }

        const currentRecognition = currentSession.recognition;

        if (!currentRecognition) {
            releaseSession(currentSession);
            return;
        }

        if (currentSession.watchdog === null) {
            currentSession.watchdog = setTimeout(() => {
                releaseSession(currentSession);
            }, 2500);
        }

        try {
            if (abort) {
                currentRecognition.abort();
            } else {
                currentRecognition.stop();
            }
        } catch (err) {}

        if (
            currentSession.mediaRecorder &&
            currentSession.mediaRecorder.state !== "inactive"
        ) {
            try {
                currentSession.mediaRecorder.stop();
            } catch (err) {}
        }
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;

        stopAllPlayback();

        if (activeRecognitionSession !== null) {
            releaseSession(activeRecognitionSession);
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            resultSpan.textContent = "Speech recognition is not supported.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            resultSpan.textContent = "Microphone access denied.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (rowKey && practice1State.audioUrls[rowKey]) {
            lastAudioUrl = practice1State.audioUrls[rowKey];
        }

        const currentSession = {
            finished: false,
            stopRequested: false,
            errorMessage: "",
            recognition: null,
            watchdog: null,
            mediaRecorder: null,
            audioChunks: [],
            stream: stream,
            accumulatedTranscript: "",
            recognitionDone: false,
            recorderDone: false,
            processed: false
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        const tryProcessResult = () => {
            if (currentSession.errorMessage || currentSession.processed) return;

            if (currentSession.recognitionDone && currentSession.recorderDone) {
                currentSession.processed = true;

                const expectedText = getExpectedTextFn();

                processResult(
                    currentSession.accumulatedTranscript,
                    expectedText,
                    getExpectedKanjiFn,
                    resultSpan,
                    correctionBox,
                    corrListenBtn,
                    corrTextSpan,
                    () => lastAudioUrl,
                    playRate,
                    rowKey,
                    allowEitherStructure,
                    getXFn(),
                    getYFn()
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

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    currentSession.audioChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(currentSession.audioChunks, {
                    type: "audio/webm"
                });

                lastAudioUrl = URL.createObjectURL(audioBlob);

                if (rowKey) {
                    practice1State.audioUrls[rowKey] = lastAudioUrl;
                }

                stream.getTracks().forEach(track => track.stop());

                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onresult = (event) => {
                if (
                    currentSession.finished ||
                    session !== currentSession ||
                    currentSession.errorMessage
                ) {
                    return;
                }

                let rawTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        rawTranscript += event.results[i][0].transcript;
                    }
                }

                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = (event) => {
                if (
                    currentSession.finished ||
                    session !== currentSession
                ) {
                    return;
                }

                requestStop(currentSession, true, "Recognition error.");
            };

            currentRecognition.onend = () => {
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
                releaseSession(currentSession);
            };

            recordBtn.disabled = true;
            stopBtn.disabled = !isManualStop;

            if (isManualStop) {
                stopBtn.classList.add("stop-btn-active");
            } else {
                stopBtn.classList.remove("stop-btn-active");
            }

            resultSpan.textContent = "Recording...";
            resultSpan.style.color = "var(--accent-color)";
            correctionBox.style.display = "none";

            mediaRecorder.start();
            currentRecognition.start();
        } catch (err) {
            requestStop(currentSession, true, "Could not start recording.");
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished || session.stopRequested) return;

        stopAllPlayback();

        session.stopRequested = true;
        stopBtn.disabled = true;

        requestStop(session, false);
    });
}

// ============================================================================
// Result Processing with Error Classification & Continuous Playback (Practice 2 Style)
// ============================================================================
function processResult(
    rawTranscript,
    expectedText,
    getExpectedKanjiFn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getUrlFn,
    playRate,
    rowKey,
    allowEitherStructure,
    inputX,
    inputY
) {
    const transcript = String(rawTranscript || "").trim();

    if (!transcript) {
        resultSpan.textContent = "No speech detected.";
        resultSpan.style.color = "var(--error-text)";
        return;
    }

    const normalizedTranscript = convertToHiragana(transcript);
    let acceptableSentences = [];

    if (allowEitherStructure) {
        const x = String(inputX || "").trim();
        const y = String(inputY || "").trim();

        if (!x || !y) {
            resultSpan.textContent = transcript;
            resultSpan.style.color = "var(--text-primary)";
            return;
        }

        acceptableSentences = [
            `${x}は${y}です`,
            `${x}は${y}じゃないです`,
            `${x}は${y}ではないです`,
            `${x}は${y}じゃありません`,
            `${x}は${y}ではありません`
        ];
    } else {
        const expected = String(expectedText || "").trim();
        const normalizedExpected = convertToHiragana(expected);

        acceptableSentences = [
            normalizedExpected,
            normalizedExpected.replace(/じゃないです$/, "ではないです"),
            normalizedExpected.replace(/ではないです$/, "じゃないです"),
            normalizedExpected.replace(/じゃないです$/, "じゃありません"),
            normalizedExpected.replace(/ではないです$/, "ではありません")
        ];
    }

    const normalizedAcceptableSentences = acceptableSentences
        .map(sentence => convertToHiragana(sentence))
        .filter(Boolean);

    const isCorrect = normalizedAcceptableSentences.includes(normalizedTranscript);
    const displayedTranscript = scriptMode === "hiragana" ? normalizedTranscript : transcript;
    const kanjiTextForSpeech = getExpectedKanjiFn();

    if (isCorrect) {
        // 正解時は、ひらがなで抽出したテキストの右に「✅」を出すだけ
        resultSpan.textContent = `${displayedTranscript} ✅`;
        resultSpan.style.color = "var(--text-primary)";

        if (rowKey) {
            practice1State.savedResults[rowKey] = {
                html: resultSpan.textContent,
                color: "var(--text-primary)"
            };
        }

        appendPersistedPlayButton(resultSpan, rowKey || "temp_res", playRate);
        correctionBox.style.display = "none";
    } else {
        // 不正解の場合：「語が違う」「構造が違う」の2パターンのルール分類
        let errorType = "⚠️ Wrong word.";
        const hasTopicMarker = normalizedTranscript.includes("は");
        const hasValidEnding = /(です|ないです|ではないです|じゃありません|ではありません)$/.test(normalizedTranscript);

        if (!hasTopicMarker || !hasValidEnding) {
            errorType = "⚠️ Wrong structure.";
        } else {
            errorType = "⚠️ Wrong word.";
        }

        resultSpan.textContent = `${errorType} ${displayedTranscript}`;
        resultSpan.style.color = "var(--error-text)";

        if (rowKey) {
            practice1State.savedResults[rowKey] = {
                html: resultSpan.textContent,
                color: "var(--error-text)"
            };
        }

        appendPersistedPlayButton(resultSpan, rowKey || "temp_res", playRate);

        corrTextSpan.textContent = `Expected: ${expectedText}`;
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            setPlayingStateMultiple([corrListenBtn], "Playing...");
            speakText(kanjiTextForSpeech, 0.9, () => stopAllPlayback());
        };

        correctionBox.style.display = "block";
    }

    // モデル音、0秒おいて、録音音源が指定の再生スピードで再生される連続再生フロー
    if (isAutoPlay) {
        speakText(kanjiTextForSpeech, playRate, () => {
            stopAllPlayback();

            const url = getUrlFn();
            if (url) {
                const audio = new Audio(url);
                currentPlayingAudio = audio;
                audio.playbackRate = playRate;

                audio.onended = () => {
                    currentPlayingAudio = null;
                };
                audio.onerror = () => {
                    currentPlayingAudio = null;
                };

                audio.play().catch(e => {});
            }
        });
    }
}
