// ============================================================================
// Practice 1: XはYです
// ============================================================================

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

// ============================================================================
// Voice Selection Logic (Browser Specific Priority)
// ============================================================================

let preferredVoice = null;

function setupPreferredVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    let selected = voices.find(v => v.name.toLowerCase().includes("keita"));
    if (!selected) {
        selected = voices.find(v => v.name.toLowerCase().includes("nanami"));
    }
    if (!selected) {
        selected = voices.find(v => v.name.toLowerCase().includes("google") && v.lang.includes("ja"));
    }
    if (!selected) {
        selected = voices.find(v => v.lang.includes("ja"));
    }
    preferredVoice = selected;
}

if (typeof speechSynthesis !== "undefined") {
    setupPreferredVoice();
    if (speechSynthesis.addEventListener) {
        speechSynthesis.addEventListener("voiceschanged", setupPreferredVoice);
    } else {
        speechSynthesis.onvoiceschanged = setupPreferredVoice;
    }
}

// ============================================================================
// Global Playback Management (Interrupt & UI Restoration)
// ============================================================================

let currentPlayingAudio = null;
let currentPlayTimeoutId = null;
let activePlayButton = null;
// Chromeのガベージコレクション回避用参照
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
            activePlayButton.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
        }
        activePlayButton = null;
    }
}

function stopAllPlayback() {
    if (currentPlayTimeoutId) {
        clearTimeout(currentPlayTimeoutId);
        currentPlayTimeoutId = null;
    }
    speechSynthesis.cancel();
    currentUtteranceRef = null;
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
    }
    restorePlayButton();
}


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

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}


// ============================================================================
// Speech synthesis
// ============================================================================

function speakText(text, onEndCallback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }
    
    // ガベージコレクション回避用
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
        console.error("Speech synthesis error:", err);
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
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

    if (trigger && box) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            box.style.display = box.style.display === "none" ? "block" : "none";
        });
        document.addEventListener("click", () => {
            box.style.display = "none";
        });
    }
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
    const exampleSection = document.getElementById("exampleSection");

    if (exampleSection) {
        const ex1X = formatWord("わたし", "watashi", "I");
        const ex1Y = formatWord("がくせい", "gakusei", "student");
        const ex2X = formatWord("わたし", "watashi", "I");
        const ex2Y = formatWord("せんせい", "sensei", "teacher");

        exampleSection.className = "example-box";
        exampleSection.innerHTML = `
            <div class="example-row">
                <strong>Affirmative:</strong>
                ${ex1X} ／ ${ex1Y}
                <button id="ex1Listen" class="example-button">🔊 きく</button>
                <span class="example-desc">
                    わたしは、がくせいです。(I am a student)
                </span>
            </div>
            <div class="example-row">
                <strong>Negative:</strong>
                ${ex2X} ／ ${ex2Y}
                <button id="ex2Listen" class="example-button">🔊 きく</button>
                <span class="example-desc">
                    わたしは、せんせいじゃないです。(I am not a teacher)
                </span>
            </div>
        `;

        setupExampleListen("ex1Listen", "わたしは、がくせいです。");
        setupExampleListen("ex2Listen", "わたしは、せんせいじゃないです。");
    }

    const container = document.getElementById("task1List");
    if (!container) return;
    container.innerHTML = "";

    // ------------------------------------------------------------------------
    // Task 1 header and controls
    // ------------------------------------------------------------------------
    const headerPanel = document.createElement("div");
    headerPanel.className = "header-panel";

    const titleInstructionGroup1 = document.createElement("div");
    titleInstructionGroup1.className = "title-instruction-group";
    const titleArea1 = document.createElement("span");
    titleArea1.innerHTML = "<strong>Task 1；Drills</strong>";
    const descArea1 = document.createElement("span");
    descArea1.style.color = "var(--text-primary)";
    descArea1.style.fontSize = "15px";
    descArea1.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';
    titleInstructionGroup1.appendChild(titleArea1);
    titleInstructionGroup1.appendChild(descArea1);

    const controlGroup = document.createElement("div");
    controlGroup.className = "control-group";
    const controlItem = document.createElement("div");
    controlItem.className = "control-item";

    const labelAuto = document.createElement("span");
    labelAuto.id = "labelAuto";
    labelAuto.className = `mode-label ${!isManualStop ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    labelAuto.innerHTML = '⏹Autostop<span class="custom-tip-box">Automatically stops recording when you stop speaking.</span>';

    const switchLabel = document.createElement("label");
    switchLabel.className = "switch";
    const switchInput = document.createElement("input");
    switchInput.type = "checkbox";
    switchInput.checked = isManualStop;
    const slider = document.createElement("span");
    slider.className = "slider";
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(slider);

    const labelManual = document.createElement("span");
    labelManual.id = "labelManual";
    labelManual.className = `mode-label ${isManualStop ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    labelManual.innerHTML = '⏹Manual stop<span class="custom-tip-box">Records continuously until you click the stop button.</span>';

    switchInput.addEventListener("change", (e) => {
        isManualStop = e.target.checked;
        const autoEl = document.getElementById("labelAuto");
        const manualEl = document.getElementById("labelManual");
        if (isManualStop) {
            manualEl.className = "mode-label active-mode custom-tip-wrap";
            autoEl.className = "mode-label inactive-mode custom-tip-wrap";
        } else {
            autoEl.className = "mode-label active-mode custom-tip-wrap";
            manualEl.className = "mode-label inactive-mode custom-tip-wrap";
        }
    });

    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);
    controlGroup.appendChild(controlItem);

    // ------------------------------------------------------------------------
    // Vocabulary hint controls
    // ------------------------------------------------------------------------
    const vocabControl = document.createElement("div");
    vocabControl.className = "control-item";
    const labelHover = document.createElement("span");
    labelHover.id = "labelHover";
    labelHover.className = `mode-label ${hintMode === "hover" ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    labelHover.innerHTML = '💬 Vocab Hint<span class="custom-tip-box">Shows word pronunciation and meaning when you hover over them.</span>';

    const vocabSwitchLabel = document.createElement("label");
    vocabSwitchLabel.className = "switch";
    const vocabSwitchInput = document.createElement("input");
    vocabSwitchInput.type = "checkbox";
    vocabSwitchInput.checked = hintMode === "paren";
    const vocabSlider = document.createElement("span");
    vocabSlider.className = "slider";
    vocabSwitchLabel.appendChild(vocabSwitchInput);
    vocabSwitchLabel.appendChild(vocabSlider);

    const labelParen = document.createElement("span");
    labelParen.id = "labelParen";
    labelParen.className = `mode-label ${hintMode === "paren" ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    labelParen.innerHTML = '🔡Display Vocab<span class="custom-tip-box">Always shows word\'s meaning in parentheses.</span>';

    vocabSwitchInput.addEventListener("change", (e) => {
        hintMode = e.target.checked ? "paren" : "hover";
        const hoverEl = document.getElementById("labelHover");
        const parenEl = document.getElementById("labelParen");
        if (hintMode === "paren") {
            parenEl.className = "mode-label active-mode custom-tip-wrap";
            hoverEl.className = "mode-label inactive-mode custom-tip-wrap";
        } else {
            hoverEl.className = "mode-label active-mode custom-tip-wrap";
            parenEl.className = "mode-label inactive-mode custom-tip-wrap";
        }
        updateWordsDisplay();
    });

    vocabControl.appendChild(labelHover);
    vocabControl.appendChild(vocabSwitchLabel);
    vocabControl.appendChild(labelParen);
    controlGroup.appendChild(vocabControl);
    headerPanel.appendChild(titleInstructionGroup1);
    headerPanel.appendChild(controlGroup);
    container.appendChild(headerPanel);

    // ------------------------------------------------------------------------
    // Task 1 rows
    // ------------------------------------------------------------------------
    taskData.forEach((item, index) => {
        const currentXWord = index < 4 ? "わたし" : "ともだち";
        const currentXRomaji = index < 4 ? "watashi" : "tomodachi";
        const currentXMeaning = index < 4 ? "I" : "friend";
        const formattedX = formatWord(currentXWord, currentXRomaji, currentXMeaning);
        const formattedY = formatWord(item.y, item.yRomaji, item.yMeaning);

        createDrillRow(
            container,
            `${index + 1}.`,
            formattedX,
            formattedY,
            currentXWord,
            item.y,
            item.isNeg
        );
    });

    // ------------------------------------------------------------------------
    // Task 2 header
    // ------------------------------------------------------------------------
    const customHeaderPanel = document.createElement("div");
    customHeaderPanel.className = "header-panel";
    customHeaderPanel.style.marginTop = "30px";

    const titleInstructionGroup2 = document.createElement("div");
    titleInstructionGroup2.className = "title-instruction-group";
    const titleArea2 = document.createElement("span");
    titleArea2.innerHTML = "<strong>Task 2；Custom Practice</strong>";
    const descArea2 = document.createElement("span");
    descArea2.style.color = "var(--text-primary)";
    descArea2.style.fontSize = "15px";
    descArea2.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup2.appendChild(titleArea2);
    titleInstructionGroup2.appendChild(descArea2);
    customHeaderPanel.appendChild(titleInstructionGroup2);
    container.appendChild(customHeaderPanel);

    // ------------------------------------------------------------------------
    // Task 2 options
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // Task 2 rows
    // ------------------------------------------------------------------------
    for (let i = 1; i <= 3; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "drill-row";
        rowDiv.setAttribute("data-custom-index", i);

        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const listenBtn = document.createElement("button");
        listenBtn.className = "example-button custom-tip-wrap";
        listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
        listenBtn.disabled = true;

        const indexSpan = document.createElement("span");
        indexSpan.textContent = `${taskData.length + i}.`;

        const selectX = document.createElement("select");
        selectX.id = `customX_${i}`;
        selectX.className = "custom-select";
        selectX.innerHTML = optionsXHtml;

        const previewX = document.createElement("span");
        previewX.id = `previewX_${i}`;
        previewX.className = "translation-preview";

        const labelHa = document.createElement("span");
        labelHa.id = `labelHa_${i}`;
        labelHa.textContent = "は";

        const selectY = document.createElement("select");
        selectY.id = `customY_${i}`;
        selectY.className = "custom-select";
        selectY.innerHTML = optionsYHtml;

        const previewY = document.createElement("span");
        previewY.id = `previewY_${i}`;
        previewY.className = "translation-preview";

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
        resultSpan.textContent = "(Not recorded yet)";
        resultSpan.style.color = "var(--text-secondary)";

        topRow.appendChild(listenBtn);
        topRow.appendChild(indexSpan);
        topRow.appendChild(selectX);
        topRow.appendChild(previewX);
        topRow.appendChild(labelHa);
        topRow.appendChild(selectY);
        topRow.appendChild(previewY);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

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

        const isCustomNeg = i !== 2;

        const updateDisplay = () => {
            const selectedOptX = selectX.options[selectX.selectedIndex];
            const selectedOptY = selectY.options[selectY.selectedIndex];
            const valX = selectX.value;
            const valY = selectY.value;

            if (valX && selectedOptX) {
                const engKey = selectedOptX.getAttribute("data-eng");
                previewX.innerHTML = formatCustomWord(valX, engKey);
            } else {
                previewX.innerHTML = "";
            }

            if (valY && selectedOptY) {
                const engKey = selectedOptY.getAttribute("data-eng");
                previewY.innerHTML = formatCustomWord(valY, engKey);
            } else {
                previewY.innerHTML = "";
            }

            labelHa.style.display = valX ? "none" : "inline";

            if (valX && valY) {
                recordBtn.disabled = false;
                listenBtn.disabled = false;
                listenBtn.onclick = () => {
                    setPlayingState(listenBtn, "🔊 Playing...");
                    const textToSpeak = isCustomNeg
                        ? `${valX}は、${valY}じゃないです。`
                        : `${valX}は、${valY}です。`;
                    speakText(textToSpeak, () => stopAllPlayback());
                };
            } else {
                recordBtn.disabled = true;
                listenBtn.disabled = true;
                stopBtn.disabled = true;
            }
        };

        selectX.addEventListener("change", updateDisplay);
        selectY.addEventListener("change", updateDisplay);

        bindRecorderEvents(
            recordBtn,
            stopBtn,
            resultSpan,
            correctionBox,
            corrListenBtn,
            corrTextSpan,
            () => selectX.value,
            () => selectY.value,
            isCustomNeg
        );

        container.appendChild(rowDiv);
    }
}


// ============================================================================
// Update displayed words when hint mode changes
// ============================================================================

function updateWordsDisplay() {
    const drillRows = document.querySelectorAll(".drill-row");
    drillRows.forEach(row => {
        const customIdx = row.getAttribute("data-custom-index");
        if (customIdx) {
            const selectX = document.getElementById(`customX_${customIdx}`);
            const selectY = document.getElementById(`customY_${customIdx}`);
            const previewX = document.getElementById(`previewX_${customIdx}`);
            const previewY = document.getElementById(`previewY_${customIdx}`);

            if (selectX && selectX.value && selectX.selectedIndex >= 0) {
                const optX = selectX.options[selectX.selectedIndex];
                previewX.innerHTML = formatCustomWord(selectX.value, optX.getAttribute("data-eng"));
            }

            if (selectY && selectY.value && selectY.selectedIndex >= 0) {
                const optY = selectY.options[selectY.selectedIndex];
                previewY.innerHTML = formatCustomWord(selectY.value, optY.getAttribute("data-eng"));
            }
        } else {
            const promptSpan = row.querySelector(".prompt-content");
            if (promptSpan && promptSpan.dataset.xWord && promptSpan.dataset.yWord) {
                const xW = promptSpan.dataset.xWord;
                const xR = promptSpan.dataset.xRomaji;
                const xM = promptSpan.dataset.xMeaning;
                const yW = promptSpan.dataset.yWord;
                const yR = promptSpan.dataset.yRomaji;
                const yM = promptSpan.dataset.yMeaning;
                promptSpan.innerHTML = `${formatWord(xW, xR, xM)} ／ ${formatWord(yW, yR, yM)}`;
            }
        }
    });
}


// ============================================================================
// Task 1 row creation
// ============================================================================

function createDrillRow(
    container,
    indexLabel,
    formattedX,
    formattedY,
    targetX,
    targetY,
    isNeg
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
        setPlayingState(listenBtn, "🔊 Playing...");
        const textToSpeak = isNeg
            ? `${targetX}は、${targetY}じゃないです。`
            : `${targetX}は、${targetY}です。`;
        speakText(textToSpeak, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label prompt-content";
    promptSpan.dataset.xWord = targetX;
    promptSpan.dataset.xRomaji = targetX === "わたし" ? "watashi" : "tomodachi";
    promptSpan.dataset.xMeaning = targetX === "わたし" ? "I" : "friend";
    promptSpan.dataset.yWord = targetY;

    const foundData = taskData.find(d => d.y === targetY);
    promptSpan.dataset.yRomaji = foundData ? foundData.yRomaji : "noun";
    promptSpan.dataset.yMeaning = foundData ? foundData.yMeaning : "noun";

    promptSpan.innerHTML = `${formattedX} ／ ${formattedY}`;

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    resultSpan.textContent = "(Not recorded yet)";
    resultSpan.style.color = "var(--text-secondary)";

    topRow.appendChild(listenBtn);
    topRow.appendChild(indexSpan);
    topRow.appendChild(promptSpan);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

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
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => targetX,
        () => targetY,
        isNeg
    );

    container.appendChild(rowDiv);
}


// ============================================================================
// Example sentence playback
// ============================================================================

function setupExampleListen(btnId, text) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => {
        setPlayingState(btn, "🔊 Playing...");
        speakText(text, () => stopAllPlayback());
    });
}


// ============================================================================
// Shared recording / speech recognition
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
    let lastAudioUrl = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;
        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
        }

        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (e) {}
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
        } catch (err) {
            console.warn("Speech recognition stop error:", err);
        }
        
        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (err) {}
        }
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;
        stopAllPlayback();

        if (activeRecognitionSession !== null) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            resultSpan.textContent = "Speech recognition is not supported in this browser.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        const currentX = getXFn();
        const currentY = getYFn();
        if (!currentX || !currentY) {
            resultSpan.textContent = "Please choose both X and Y.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error("Microphone access error:", err);
            resultSpan.textContent = "Microphone access denied or unavailable.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (lastAudioUrl) {
            URL.revokeObjectURL(lastAudioUrl);
            lastAudioUrl = null;
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
                processRecognitionResult(
                    currentSession.accumulatedTranscript,
                    currentX,
                    currentY,
                    expectedIsNeg,
                    resultSpan,
                    correctionBox,
                    corrListenBtn,
                    corrTextSpan,
                    () => lastAudioUrl
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
                const audioBlob = new Blob(currentSession.audioChunks, { type: "audio/webm" });
                lastAudioUrl = URL.createObjectURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onresult = (event) => {
                if (currentSession.finished || session !== currentSession || currentSession.errorMessage) return;
                let rawTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        rawTranscript += event.results[i][0].transcript;
                    }
                }
                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = (event) => {
                if (currentSession.finished || session !== currentSession) return;
                const message =
                    event.error === "not-allowed" || event.error === "service-not-allowed" ? "Microphone permission denied." :
                    event.error === "no-speech" ? "No speech detected. Please try again." :
                    event.error === "audio-capture" ? "Microphone unavailable." :
                    event.error === "network" ? "Speech recognition network error." :
                    event.error === "aborted" ? "Recording stopped." :
                    "Speech recognition error. Please try again.";
                requestStop(currentSession, true, message);
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
            console.error("Speech recognition start error:", err);
            requestStop(currentSession, true, "Could not start recording. Please try again.");
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished) return;
        if (session.stopRequested) return;
        
        stopAllPlayback();
        session.stopRequested = true;
        stopBtn.disabled = true;
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

    const affRegex = new RegExp(`^${hiraX}は${hiraY}です` + endParticleRegex);
    const isAffirmative = affRegex.test(hiraText);

    const negRegex1 = new RegExp(`^${hiraX}は${hiraY}じゃないです` + endParticleRegex);
    const negRegex2 = new RegExp(`^${hiraX}は${hiraY}ではないです` + endParticleRegex);
    const negRegex3 = new RegExp(`^${hiraX}は${hiraY}じゃありません` + endParticleRegex);
    const negRegex4 = new RegExp(`^${hiraX}は${hiraY}ではありません` + endParticleRegex);

    const isNegative = negRegex1.test(hiraText) || negRegex2.test(hiraText) || negRegex3.test(hiraText) || negRegex4.test(hiraText);

    // ------------------------------------------------------------------------
    // Play user's recorded audio button setup
    // ------------------------------------------------------------------------
    const appendPlayButton = () => {
        let playBtn = resultSpan.querySelector(".play-recording-btn");
        if (!playBtn) {
            playBtn = document.createElement("button");
            playBtn.className = "example-button play-recording-btn custom-tip-wrap";
            playBtn.style.marginLeft = "8px";
            playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';

            playBtn.onclick = () => {
                const recordedAudioUrl = getUrlFn();
                if (recordedAudioUrl) {
                    setPlayingState(playBtn, "▶️ Playing...");
                    const audio = new Audio(recordedAudioUrl);
                    currentPlayingAudio = audio;
                    audio.onended = () => stopAllPlayback();
                    audio.play().catch(e => {
                        console.warn("Playback failed", e);
                        stopAllPlayback();
                    });
                }
            };
            resultSpan.appendChild(playBtn);
        }
        return playBtn;
    };

    let targetPlayBtn = null;

    // ------------------------------------------------------------------------
    // Evaluation Logic
    // ------------------------------------------------------------------------
    if (isAffirmative || isNegative) {
        resultSpan.textContent = hiraText + " ✅ ";
        resultSpan.style.color = "var(--text-primary)";
        targetPlayBtn = appendPlayButton();
        correctionBox.style.display = "none";
    } else {
        const hasCorrectY = hiraText.includes(hiraY);
        if (!hasCorrectY) {
            let highlightedText = hiraText.replace(
                new RegExp(`(${hiraX}は)(.*?)((?:です|じゃないです|ではないです|じゃありません|ではありません))`, "g"),
                '$1<span style="color: var(--accent-color);">$2</span>$3'
            );
            resultSpan.innerHTML = highlightedText + " ";
            resultSpan.style.color = "var(--text-primary)";
            targetPlayBtn = appendPlayButton();
            corrTextSpan.textContent = "Wrong word used.";
            corrListenBtn.style.display = "none";
        } else {
            resultSpan.textContent = hiraText + " ";
            resultSpan.style.color = "var(--error-text)";
            targetPlayBtn = appendPlayButton();
            corrTextSpan.textContent = "Structure error, try it again";
            corrListenBtn.style.display = "inline-block";

            const correctSentenceForBtn = expectedIsNeg
                ? `${currentX}は、${currentY}じゃないです。`
                : `${currentX}は、${currentY}です。`;

            corrListenBtn.onclick = () => {
                setPlayingState(corrListenBtn, "🔊 Playing...");
                speakText(correctSentenceForBtn, () => stopAllPlayback());
            };
        }
        correctionBox.style.display = "block";
    }

    // ------------------------------------------------------------------------
    // Auto Play Sequence: 0.5s Wait -> Model Audio (85%) -> 0.1s Wait -> User Audio (100%)
    // ------------------------------------------------------------------------
    const runAutoPlaySequence = (btn) => {
        const recordedAudioUrl = getUrlFn();
        if (!recordedAudioUrl || !btn) return;

        setPlayingState(btn, "▶️ Playing...");

        const correctSentence = expectedIsNeg
            ? `${currentX}は、${currentY}じゃないです。`
            : `${currentX}は、${currentY}です。`;

        const utterance = new SpeechSynthesisUtterance(correctSentence);
        utterance.lang = "ja-JP";
        utterance.rate = 0.85;

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // ガベージコレクション回避用
        currentUtteranceRef = utterance;

        utterance.onend = () => {
            currentUtteranceRef = null;
            currentPlayTimeoutId = setTimeout(() => {
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.playbackRate = 1.0;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => {
                    console.warn("Auto playback failed", e);
                    stopAllPlayback();
                });
            }, 100);
        };

        utterance.onerror = () => stopAllPlayback();

        currentPlayTimeoutId = setTimeout(() => {
            speechSynthesis.speak(utterance);
        }, 500);
    };

    runAutoPlaySequence(targetPlayBtn);
}
