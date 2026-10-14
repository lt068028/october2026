// ============================================================================
// Practice 1.1: XはYです
// Hiragana Only / With Kanji 分離対応版 (修正済み)
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

// ============================================================================
// 音声設定
// ============================================================================

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

// ============================================================================
// 文字正規化
// ============================================================================

function removeRecognitionPunctuation(text) {
    return String(text || "")
        .normalize("NFKC")
        .replace(
            /[\s.,\/#!$%\^&\*;:{}=\-_`~()（）「」『』【】［］〔〕〈〉《》、。.,．．！？!?：；…・"'“”‘’]/g,
            ""
        );
}

function normalizeHiraganaTranscript(text) {
    if (!text) return "";

    let cleaned = removeRecognitionPunctuation(text);

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

    cleaned = cleaned.replace(/[\u30A1-\u30F6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );

    return cleaned;
}

function normalizeKanjiTranscript(text) {
    return removeRecognitionPunctuation(text);
}

function convertToHiragana(text) {
    return normalizeHiraganaTranscript(text);
}

// ============================================================================
// 文型判定
// ============================================================================

function checkHiraganaStructure(transcript) {
    const normalized = normalizeHiraganaTranscript(transcript);
    const pattern = /^.+は.+(?:ではないです|じゃないです|ではありません|じゃありません|です)$/;

    return {
        normalizedTranscript: normalized,
        isCorrect: pattern.test(normalized)
    };
}

function checkKanjiStructure(transcript) {
    const normalized = normalizeKanjiTranscript(transcript);
    const pattern = /^.+は.+(?:ではないです|じゃないです|ではありません|じゃありません|です)$/;

    return {
        normalizedTranscript: normalized,
        isCorrect: pattern.test(normalized)
    };
}

function checkDrill3Structure(transcript) {
    if (scriptMode === "hiragana") {
        return checkHiraganaStructure(transcript);
    }
    return checkKanjiStructure(transcript);
}

// ============================================================================
// 音声読み上げ
// ============================================================================

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

// ============================================================================
// 初期化
// ============================================================================

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

// ============================================================================
// 表示用単語フォーマット
// ============================================================================

function formatWord(word, kanji, romaji, meaning) {
    const displayWord =
        (scriptMode === "kanji" && kanji) ? kanji : word;

    const hintStr = `${romaji}, ${meaning}`;

    // OFF: Japanese word only
    if (hintMode === "off") {
        return `<span class="target-word">${displayWord}</span>`;
    }

    // Vocab Display: Always show vocabulary hints
    if (hintMode === "paren") {
        return `<span class="target-word">${displayWord}</span><span class="vocab-inline">(${hintStr})</span>`;
    }

    // Vocab Hover: Show vocabulary hints on hover
    return `
        <span class="tooltip-wrap">
            <span class="target-word">${displayWord}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}
// ============================================================================
// Settings Panel
// ============================================================================
function formatCustomWord(word, kanji, meaning) {
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

// ============================================================================
// Settings Panel
// ============================================================================
function initSettingsPanel() {
    const scriptControl =
        document.getElementById("scriptModeControl");

    const hintControl =
        document.getElementById("hintModeControl");

    function updateSegmentedSelection(control, selectedValue) {
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === selectedValue;

            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    // ==========================================
    // Hiragana Only / With漢字
    // ==========================================

    if (scriptControl) {
        updateSegmentedSelection(scriptControl, scriptMode);

        scriptControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !scriptControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["hiragana", "kanji"].includes(nextMode)) return;
            if (nextMode === scriptMode) return;

            scriptMode = nextMode;

            updateSegmentedSelection(scriptControl, scriptMode);
            renderAll();
        });
    }

    // ==========================================
    // OFF / Vocab Hover / Vocab Display
    // ==========================================

    if (hintControl) {
        updateSegmentedSelection(hintControl, hintMode);

        hintControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !hintControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["off", "hover", "paren"].includes(nextMode)) return;
            if (nextMode === hintMode) return;

            hintMode = nextMode;

            updateSegmentedSelection(hintControl, hintMode);
            renderAll();
        });
    }

    // ==========================================
    // Autostop: checked = ON
    // ==========================================

    const toggleRecordMode =
        document.getElementById("toggleRecordMode");

    const labelAutoRecord =
        document.getElementById("labelAutoRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = !isManualStop;

        updateToggleLabelStyle(labelAutoRecord, !isManualStop);

        toggleRecordMode.addEventListener("change", event => {
            isManualStop = !event.target.checked;

            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        });
    }

    // ==========================================
    // Autoplay: checked = ON
    // ==========================================

    const togglePlaybackMode =
        document.getElementById("togglePlaybackMode");

    const labelAutoPlay =
        document.getElementById("labelAutoPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.checked = isAutoPlay;

        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);

        togglePlaybackMode.addEventListener("change", event => {
            isAutoPlay = event.target.checked;

            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        });
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
// Example Section
// ============================================================================

function renderExampleSection() {
    const container = document.getElementById("exampleSectionContainer");
    if (!container) return;

    const formattedX = formatWord("わたし", "私", "watashi", "I");
    const formattedStudent = formatWord("がくせい", "学生", "gakusei", "student");
    const formattedTeacher = formatWord("せんせい", "先生", "sensei", "teacher");

    const affirmativeSentence = scriptMode === "kanji"
        ? "私<strong>は、</strong>学生<strong>です。</strong>"
        : "わたし<strong>は、</strong>がくせい<strong>です。</strong>";

    const negativeSentence = scriptMode === "kanji"
        ? "私<strong>は、</strong>先生<strong>じゃないです。</strong>"
        : "わたし<strong>は、</strong>せんせい<strong>じゃないです。</strong>";

    container.innerHTML = `
        <div class="example-box">
            <div class="info-panel-desc"></div>

            <div class="flex-row-center" style="margin-top: 3px;">
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
            speakText(scriptMode === "kanji" ? "私は、学生です。" : "わたしは、がくせいです。", 0.9, () => stopAllPlayback());
        });
    }

    if (ex2Listen) {
        ex2Listen.addEventListener("click", () => {
            setPlayingStateMultiple([ex2Listen], "Playing...");
            speakText(scriptMode === "kanji" ? "私は、先生じゃないです。" : "わたしは、せんせいじゃないです。", 0.9, () => stopAllPlayback());
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
// 結果表示の初期状態
// ============================================================================

function setInitialResultDisplay(resultSpan, rowKey) {
    if (practice1State.savedResults[rowKey]) {
        resultSpan.textContent = practice1State.savedResults[rowKey].html;
        resultSpan.style.color = practice1State.savedResults[rowKey].color;
    } else {
        resultSpan.textContent = practice1State.audioUrls[rowKey]
            ? "(Recorded) ✅"
            : "(Not recorded yet)";

        resultSpan.style.color = practice1State.audioUrls[rowKey]
            ? "var(--text-primary)"
            : "var(--text-secondary)";
    }
}

// ============================================================================
// Drill 1: Basic Sentences
// ============================================================================

function renderTask1() {
    const container = document.getElementById("task1Container");
    if (!container) return;

    container.innerHTML = `
        <div class="info-panel" style="margin-top: 30px;">
            <span class="info-panel-title">Drill 1: Basic Sentences</span>
            <span class="info-panel-desc">💡 Listen to the sentence and record your voice.</span>
        </div>
        <div id="task1List"></div>
    `;

    const listDiv = document.getElementById("task1List");

    taskData.forEach((task, index) => {
        const rowKey = `task1_${index}`;
        const rowDiv = document.createElement("div");
        rowDiv.className = "drill-row";

        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const listenBtn = document.createElement("button");
        listenBtn.className = "example-button custom-tip-wrap";
        listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';

        const indexSpan = document.createElement("span");
        indexSpan.textContent = `${index + 1}.`;

        const promptSpan = document.createElement("span");
        promptSpan.className = "prompt-label";

        const xText = formatWord(task.x, task.xKanji, "watashi", "I");
        const yText = formatWord(task.y, task.yKanji, task.yRomaji, task.yMeaning);

        promptSpan.innerHTML = `${xText} <strong>は</strong> ${yText}`;

        const typeLabel = document.createElement("span");
        typeLabel.className = "custom-tip-wrap";
        typeLabel.style.fontSize = "16px";
        typeLabel.style.marginLeft = "4px";
        typeLabel.style.marginRight = "8px";
        typeLabel.style.cursor = "pointer";
        typeLabel.innerHTML = task.isNeg
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
        setInitialResultDisplay(resultSpan, rowKey);

        topRow.appendChild(listenBtn);
        topRow.appendChild(indexSpan);
        topRow.appendChild(promptSpan);
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

        listenBtn.addEventListener("click", () => {
            setPlayingStateMultiple([listenBtn], "Playing...");

            const sentence = task.isNeg
                ? `${task.xKanji}は、${task.yKanji}じゃないです。`
                : `${task.xKanji}は、${task.yKanji}です。`;

            speakText(sentence, 0.9, () => stopAllPlayback());
        });

        const correctSentence = task.isNeg
            ? `${task.xKanji}は${task.yKanji}じゃないです`
            : `${task.xKanji}は${task.yKanji}です`;

        const modelSentence = task.isNeg
            ? `${task.xKanji}は、${task.yKanji}じゃないです。`
            : `${task.xKanji}は、${task.yKanji}です。`;

        bindRecorderEvents(
            recordBtn,
            stopBtn,
            resultSpan,
            correctionBox,
            corrListenBtn,
            corrTextSpan,
            correctSentence,
            modelSentence,
            0.9,
            rowKey,
            true
        );

        listDiv.appendChild(rowDiv);
    });
}

// ============================================================================
// Drill 2: Selectable Practice
// ============================================================================

function renderTask2() {
    const container = document.getElementById("task2Container");
    if (!container) return;

    container.innerHTML = `
        <div class="info-panel" style="margin-top: 30px;">
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
        recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement("button");
        stopBtn.className = "example-button custom-tip-wrap";
        stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result-text";
        setInitialResultDisplay(resultSpan, rowKey);

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
                    setPlayingStateMultiple([listenBtn], "Playing...");

                    const kanjiX = selectedOptX.getAttribute("data-kanji") || valX;
                    const kanjiY = selectedOptY.getAttribute("data-kanji") || valY;

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
                    ? `${kX}は${kY}じゃないです`
                    : `${kX}は${kY}です`;
            },
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
            0.9,
            rowKey,
            false,
            () => selectX.value,
            () => selectY.value,
            true
        );

        listDiv.appendChild(rowDiv);
    }
}

// ============================================================================
// Drill 3: Free Input Practice (Stub)
// ============================================================================

function renderTask3() {
    const container = document.getElementById("task3Container");
    if (!container) return;

    container.innerHTML = `
        <div class="info-panel" style="margin-top: 30px;">
            <span class="info-panel-title">Drill 3: Free Input Practice</span>
            <span class="info-panel-desc">💡 Type your own X and Y.</span>
        </div>
        <div id="task3List"></div>
    `;
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
    rowKey,
    forceRecognition = false
) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';

    listenBtn.onclick = () => {
        setPlayingStateMultiple([listenBtn], "Playing...");

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
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    setInitialResultDisplay(resultSpan, rowKey);

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
        () => isNeg
            ? `${targetX}は${targetY}じゃないです`
            : `${targetX}は${targetY}です`,
        () => isNeg
            ? `${targetKanjiX}は、${targetKanjiY}じゃ、ないです。`
            : `${targetKanjiX}は、${targetKanjiY}です。`,
        playRate,
        rowKey,
        false,
        () => targetX,
        () => targetY,
        forceRecognition
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

                audio.play().catch(() => stopAllPlayback());
            }
        };

        resultSpan.appendChild(playBtn);
    }

    return playBtn;
}

// ============================================================================
// Shared Recorder & Speech Recognition Architecture
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
    getYFn = () => "",
    forceRecognition = false
) {
    let session = null;

    const AUDIO_ONLY_STATUS = "🐣Only Hiragana:🎙️Audio only";
    const AUDIO_ONLY_RECORDING_STATUS =
        "Recording...(🐣Only Hiragana:🎙️Audio only)";

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;

        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
        }

        if (currentSession.silenceInterval !== null) {
            clearInterval(currentSession.silenceInterval);
            currentSession.silenceInterval = null;
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

        if (currentSession.audioContext) {
            try {
                if (currentSession.audioContext.state !== "closed") {
                    currentSession.audioContext.close();
                }
            } catch (e) {}

            currentSession.audioContext = null;
        }

        if (currentSession.recognition) {
            currentSession.recognition.onresult = null;
            currentSession.recognition.onerror = null;
            currentSession.recognition.onend = null;
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

    function showAudioOnlyStatus(currentSession, isRecording) {
        if (forceRecognition) {
            resultSpan.textContent = isRecording ? "Recording..." : "";
            resultSpan.style.color = "var(--accent-color)";
            return;
        }

        resultSpan.textContent = isRecording
            ? AUDIO_ONLY_RECORDING_STATUS
            : AUDIO_ONLY_STATUS;

        resultSpan.style.color = "var(--text-primary)";

        if (!isRecording && rowKey && practice1State.audioUrls[rowKey]) {
            appendPersistedPlayButton(resultSpan, rowKey, playRate);
        }
    }

    function stopAudioOnlySession(currentSession, errorMessage = "") {
        if (!currentSession || currentSession.finished) return;

        if (currentSession.silenceInterval !== null) {
            clearInterval(currentSession.silenceInterval);
            currentSession.silenceInterval = null;
        }

        if (errorMessage) {
            currentSession.errorMessage = errorMessage;
            resultSpan.textContent = errorMessage;
            resultSpan.style.color = "var(--error-text)";
        }

        const recorder = currentSession.mediaRecorder;

        if (recorder && recorder.state !== "inactive") {
            try {
                recorder.stop();
            } catch (e) {
                releaseSession(currentSession);
            }
        } else if (!currentSession.recorderDone) {
            currentSession.recorderDone = true;
            releaseSession(currentSession);
        }
    }

    function startSilenceDetection(currentSession) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            currentSession.watchdog = setTimeout(() => {
                stopAudioOnlySession(currentSession);
            }, 15000);
            return;
        }

        try {
            const audioContext = new AudioContextClass();
            currentSession.audioContext = audioContext;

            const source = audioContext.createMediaStreamSource(
                currentSession.stream
            );

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);

            const buffer = new Uint8Array(analyser.fftSize);

            currentSession.soundDetectedAt = 0;
            currentSession.lastSoundAt = 0;
            currentSession.recordingStartedAt = Date.now();

            currentSession.watchdog = setTimeout(() => {
                stopAudioOnlySession(currentSession);
            }, 15000);

            currentSession.silenceInterval = setInterval(() => {
                if (
                    currentSession.finished ||
                    session !== currentSession ||
                    !currentSession.mediaRecorder ||
                    currentSession.mediaRecorder.state !== "recording"
                ) {
                    return;
                }

                analyser.getByteTimeDomainData(buffer);

                let sumSquares = 0;

                for (let i = 0; i < buffer.length; i++) {
                    const normalized = (buffer[i] - 128) / 128;
                    sumSquares += normalized * normalized;
                }

                const rms = Math.sqrt(sumSquares / buffer.length);
                const now = Date.now();

                if (rms > 0.025) {
                    if (!currentSession.soundDetectedAt) {
                        currentSession.soundDetectedAt = now;
                    }

                    currentSession.lastSoundAt = now;
                }

                if (
                    currentSession.soundDetectedAt &&
                    currentSession.lastSoundAt &&
                    now - currentSession.lastSoundAt >= 1500
                ) {
                    stopAudioOnlySession(currentSession);
                }
            }, 100);
        } catch (err) {
            console.warn("Silence detection setup failed:", err);

            currentSession.watchdog = setTimeout(() => {
                stopAudioOnlySession(currentSession);
            }, 15000);
        }
    }

    function finishAudioOnlyRecording(currentSession) {
        if (!currentSession || currentSession.finished) return;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
        }

        if (currentSession.silenceInterval !== null) {
            clearInterval(currentSession.silenceInterval);
            currentSession.silenceInterval = null;
        }

        const chunks = currentSession.audioChunks || [];
        let audioUrl = null;

        if (chunks.length > 0) {
            const mimeType =
                currentSession.mediaRecorder &&
                currentSession.mediaRecorder.mimeType
                    ? currentSession.mediaRecorder.mimeType
                    : "audio/webm";

            const audioBlob = new Blob(chunks, { type: mimeType });

            if (audioBlob.size > 0) {
                audioUrl = URL.createObjectURL(audioBlob);

                if (rowKey) {
                    const previousUrl = practice1State.audioUrls[rowKey];

                    if (previousUrl && previousUrl !== audioUrl) {
                        URL.revokeObjectURL(previousUrl);
                    }

                    practice1State.audioUrls[rowKey] = audioUrl;
                }
            }
        }

        if (currentSession.stream) {
            currentSession.stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {}
            });
        }

        if (currentSession.audioContext) {
            try {
                if (currentSession.audioContext.state !== "closed") {
                    currentSession.audioContext.close();
                }
            } catch (e) {}

            currentSession.audioContext = null;
        }

        currentSession.finished = true;

        if (activeRecognitionSession === currentSession) {
            activeRecognitionSession = null;
        }

        if (session === currentSession) {
            session = null;
        }

        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");

        correctionBox.style.display = "none";

        showAudioOnlyStatus(currentSession, false);

        if (isAutoPlay && audioUrl) {
            const kanjiTextForSpeech = typeof getExpectedKanjiFn === "function" ? getExpectedKanjiFn() : getExpectedKanjiFn;
            speakText(kanjiTextForSpeech, playRate, () => {
                stopAllPlayback();

                const audio = new Audio(audioUrl);
                currentPlayingAudio = audio;
                audio.playbackRate = playRate;

                audio.onended = () => {
                    currentPlayingAudio = null;
                };

                audio.onerror = () => {
                    currentPlayingAudio = null;
                };

                audio.play().catch(() => {});
            });
        }
    }

    function startAudioOnlyRecording(stream) {
        const currentSession = {
            mode: "audio-only",
            finished: false,
            stopRequested: false,
            errorMessage: "",
            recognition: null,
            watchdog: null,
            silenceInterval: null,
            audioContext: null,
            mediaRecorder: null,
            audioChunks: [],
            stream,
            recorderDone: false
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        try {
            let mediaRecorder;

            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm;codecs=opus"
                });
            } else {
                mediaRecorder = new MediaRecorder(stream);
            }

            currentSession.mediaRecorder = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    currentSession.audioChunks.push(event.data);
                }
            };

            mediaRecorder.onerror = () => {
                stopAudioOnlySession(
                    currentSession,
                    "Recording error."
                );
            };

            mediaRecorder.onstop = () => {
                currentSession.recorderDone = true;
                finishAudioOnlyRecording(currentSession);
            };

            recordBtn.disabled = true;
            stopBtn.disabled = false;
            stopBtn.classList.add("stop-btn-active");

            correctionBox.style.display = "none";
            showAudioOnlyStatus(currentSession, true);

            mediaRecorder.start();

            if (!isManualStop) {
                startSilenceDetection(currentSession);
            } else {
                currentSession.watchdog = setTimeout(() => {
                    stopAudioOnlySession(currentSession);
                }, 15000);
            }
        } catch (err) {
            console.error("Audio-only recording start error:", err);

            resultSpan.textContent = "Could not start recording.";
            resultSpan.style.color = "var(--error-text)";

            releaseSession(currentSession);
        }
    }

    function startRecognitionRecording(stream) {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            stream.getTracks().forEach(track => {
                try { track.stop(); } catch (e) {}
            });
            resultSpan.textContent = "Speech recognition is not supported.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        const currentSession = {
            mode: "recognition",
            finished: false,
            stopRequested: false,
            errorMessage: "",
            recognition: null,
            watchdog: null,
            silenceInterval: null,
            audioContext: null,
            mediaRecorder: null,
            audioChunks: [],
            stream,
            accumulatedTranscript: "",
            recognitionDone: false,
            recorderDone: false,
            processed: false,
            tryFinalize: null
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        const tryFinalize = () => {
            if (currentSession.finished || currentSession.processed) return;
            if (!currentSession.recognitionDone || !currentSession.recorderDone) return;

            currentSession.processed = true;

            if (currentSession.watchdog !== null) {
                clearTimeout(currentSession.watchdog);
                currentSession.watchdog = null;
            }

            if (currentSession.errorMessage) {
                releaseSession(currentSession);
                return;
            }

            processResult(
                currentSession.accumulatedTranscript,
                typeof getExpectedTextFn === "function" ? getExpectedTextFn() : getExpectedTextFn,
                getExpectedKanjiFn,
                resultSpan,
                correctionBox,
                corrListenBtn,
                corrTextSpan,
                () => rowKey ? practice1State.audioUrls[rowKey] : null,
                playRate,
                rowKey,
                allowEitherStructure,
                getXFn(),
                getYFn()
            );

            releaseSession(currentSession);
        };

        currentSession.tryFinalize = tryFinalize;

        const stopRecorderAfterRecognition = () => {
            const recorder = currentSession.mediaRecorder;

            if (recorder && recorder.state !== "inactive") {
                try {
                    recorder.stop();
                } catch (err) {
                    if (recorder.state === "inactive") {
                        currentSession.recorderDone = true;
                        tryFinalize();
                    }
                }
            } else if (!currentSession.recorderDone) {
                currentSession.recorderDone = true;
                tryFinalize();
            }
        };

        try {
            const currentRecognition = new SpeechRecognition();
            currentSession.recognition = currentRecognition;
            currentRecognition.lang = "ja-JP";
            currentRecognition.interimResults = false;
            currentRecognition.continuous = isManualStop;

            let mediaRecorder;
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm;codecs=opus"
                });
            } else {
                mediaRecorder = new MediaRecorder(stream);
            }

            currentSession.mediaRecorder = mediaRecorder;

            mediaRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    currentSession.audioChunks.push(event.data);
                }
            };

            mediaRecorder.onerror = () => {
                requestRecognitionStop(currentSession, true, "Recording error.");
            };

            mediaRecorder.onstop = () => {
                const chunks = currentSession.audioChunks || [];
                if (chunks.length > 0) {
                    const mimeType = mediaRecorder.mimeType || "audio/webm";
                    const audioBlob = new Blob(chunks, { type: mimeType });

                    if (audioBlob.size > 0 && rowKey) {
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const previousUrl = practice1State.audioUrls[rowKey];
                        if (previousUrl && previousUrl !== audioUrl) {
                            URL.revokeObjectURL(previousUrl);
                        }
                        practice1State.audioUrls[rowKey] = audioUrl;
                    }
                }

                currentSession.recorderDone = true;
                tryFinalize();
            };

            currentRecognition.onresult = event => {
                if (
                    currentSession.finished ||
                    session !== currentSession ||
                    currentSession.errorMessage
                ) return;

                let rawTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        rawTranscript += event.results[i][0].transcript;
                    }
                }
                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = event => {
                if (currentSession.finished || session !== currentSession) return;

                if (event && event.error === "aborted" && currentSession.stopRequested) {
                    return;
                }
                requestRecognitionStop(currentSession, true, "Recognition error.");
            };

            currentRecognition.onend = () => {
                if (currentSession.finished || currentSession.recognitionDone) return;

                currentSession.recognitionDone = true;
                stopRecorderAfterRecognition();
            };

            recordBtn.disabled = true;
            stopBtn.disabled = false;
            stopBtn.classList.add("stop-btn-active");
            resultSpan.textContent = "Recording...";
            resultSpan.style.color = "var(--accent-color)";
            correctionBox.style.display = "none";

            mediaRecorder.start();
            currentRecognition.start();
        } catch (err) {
            console.error("Recognition recording start error:", err);
            currentSession.errorMessage = "Could not start recording.";
            resultSpan.textContent = currentSession.errorMessage;
            resultSpan.style.color = "var(--error-text)";

            if (!currentSession.recognition) {
                currentSession.recognitionDone = true;
                stopRecorderAfterRecognition();
            } else {
                requestRecognitionStop(currentSession, true, currentSession.errorMessage);
            }
        }
    }

    function requestRecognitionStop(
        currentSession,
        abort = false,
        errorMessage = ""
    ) {
        if (!currentSession || currentSession.finished) return;

        if (errorMessage) {
            currentSession.errorMessage = errorMessage;
            resultSpan.textContent = errorMessage;
            resultSpan.style.color = "var(--error-text)";
        }

        const recognition = currentSession.recognition;
        if (!recognition) {
            currentSession.recognitionDone = true;
            const recorder = currentSession.mediaRecorder;
            if (recorder && recorder.state !== "inactive") {
                try { recorder.stop(); } catch (err) {}
            } else {
                currentSession.recorderDone = true;
                if (typeof currentSession.tryFinalize === "function") {
                    currentSession.tryFinalize();
                } else {
                    releaseSession(currentSession);
                }
            }
            return;
        }

        if (currentSession.watchdog === null) {
            currentSession.watchdog = setTimeout(() => {
                if (currentSession.finished) return;

                if (!currentSession.recognitionDone) {
                    currentSession.recognitionDone = true;
                }

                const recorder = currentSession.mediaRecorder;
                if (recorder && recorder.state !== "inactive") {
                    try {
                        recorder.stop();
                    } catch (err) {
                        if (recorder.state === "inactive") {
                            currentSession.recorderDone = true;
                        }
                    }
                } else {
                    currentSession.recorderDone = true;
                }

                if (typeof currentSession.tryFinalize === "function") {
                    currentSession.tryFinalize();
                } else {
                    releaseSession(currentSession);
                }
            }, 5000);
        }

        try {
            if (abort) recognition.abort();
            else recognition.stop();
        } catch (err) {}
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;

        stopAllPlayback();

        if (activeRecognitionSession !== null) {
            const oldSession = activeRecognitionSession;

            if (oldSession.mode === "audio-only") {
                stopAudioOnlySession(oldSession);
            } else {
                requestRecognitionStop(oldSession, true);
            }
        }

        let stream;

        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error("Microphone API unavailable");
            }

            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (err) {
            resultSpan.textContent = "Microphone access denied.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        const recordingMode = forceRecognition ? "kanji" : scriptMode;

        if (recordingMode === "hiragana") {
            startAudioOnlyRecording(stream);
        } else {
            startRecognitionRecording(stream);
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished || session.stopRequested) return;

        stopAllPlayback();

        session.stopRequested = true;
        stopBtn.disabled = true;

        if (session.mode === "audio-only") {
            stopAudioOnlySession(session);
        } else {
            requestRecognitionStop(session, false);
        }
    });
}

// ============================================================================
// Result Processing
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

    let normalizedTranscript = "";
    let isCorrect = false;

    if (allowEitherStructure) {
        const x = String(inputX || "").trim();
        const y = String(inputY || "").trim();

        if (!x || !y) {
            resultSpan.textContent = transcript;
            resultSpan.style.color = "var(--text-primary)";
            return;
        }

        const structureResult = checkDrill3Structure(transcript);

        normalizedTranscript = structureResult.normalizedTranscript;
        isCorrect = structureResult.isCorrect;
    } else {
        normalizedTranscript = normalizeHiraganaTranscript(transcript);

        const expected = String(expectedText || "").trim();
        const normalizedExpected = normalizeHiraganaTranscript(expected);

        const acceptableSentences = [
            normalizedExpected,
            normalizedExpected.replace(/じゃないです$/, "ではないです"),
            normalizedExpected.replace(/ではないです$/, "じゃないです"),
            normalizedExpected.replace(/じゃないです$/, "じゃありません"),
            normalizedExpected.replace(/ではないです$/, "ではありません")
        ];

        const normalizedAcceptableSentences = acceptableSentences
            .map(sentence => normalizeHiraganaTranscript(sentence))
            .filter(Boolean);

        isCorrect = normalizedAcceptableSentences.includes(
            normalizedTranscript
        );
    }

    const displayedTranscript = scriptMode === "hiragana" && !allowEitherStructure
        ? normalizedTranscript
        : transcript;

    const kanjiTextForSpeech = typeof getExpectedKanjiFn === "function" ? getExpectedKanjiFn() : getExpectedKanjiFn;

    if (isCorrect) {
        resultSpan.textContent = `${displayedTranscript} ✅`;
        resultSpan.style.color = "var(--text-primary)";

        if (rowKey) {
            practice1State.savedResults[rowKey] = {
                html: resultSpan.textContent,
                color: "var(--text-primary)"
            };
        }

        if (rowKey && practice1State.audioUrls[rowKey]) {
            appendPersistedPlayButton(resultSpan, rowKey, playRate);
        }

        correctionBox.style.display = "none";
    } else {
        let errorType;

        if (allowEitherStructure) {
            errorType = "⚠️ Wrong structure.";
        } else {
            const hasTopicMarker = normalizedTranscript.includes("は");

            const hasValidEnding =
                /(です|ないです|ではないです|じゃありません|ではありません)$/
                    .test(normalizedTranscript);

            errorType =
                (!hasTopicMarker || !hasValidEnding)
                    ? "⚠️ Wrong structure."
                    : "⚠️ Wrong word.";
        }

        resultSpan.textContent = `${errorType} ${displayedTranscript}`;
        resultSpan.style.color = "var(--error-text)";

        if (rowKey) {
            practice1State.savedResults[rowKey] = {
                html: resultSpan.textContent,
                color: "var(--error-text)"
            };
        }

        if (rowKey && practice1State.audioUrls[rowKey]) {
            appendPersistedPlayButton(resultSpan, rowKey, playRate);
        }

        corrTextSpan.textContent = `Expected: ${expectedText}`;
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            setPlayingStateMultiple([corrListenBtn], "Playing...");
            speakText(kanjiTextForSpeech, 0.9, () => stopAllPlayback());
        };

        correctionBox.style.display = "block";
    }

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

                audio.play().catch(() => {});
            }
        });
    }
}
