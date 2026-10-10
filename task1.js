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

// 状態管理フラグ (Task1, 2共通設定)
let isManualStop = false;
let hintMode = "hover";
let isAutoPlay = true; 

let activeRecognitionSession = null;

// ============================================================================
// Voice Selection Logic (Browser Specific Priority)
// ============================================================================

let preferredVoice = null;

function setupPreferredVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    let selected = voices.find(v => v.name.toLowerCase().includes("chrome os") && v.lang.includes("ja"));
    
    if (!selected) {
        selected = voices.find(v => v.name.toLowerCase().includes("keita"));
    }
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
            activePlayButton.innerHTML = 'Playing...';
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
        "私": "わたし", "学生": "がくせい", "先生": "せんせい", "日本人": "にほんじん",
        "会社員": "かいしゃいん", "友達": "ともだち", "家族": "かぞく", "同僚": "どうりょう",
        "上司": "じょうし", "パートナー": "パートナー", "恋人": "こいびと", "親友": "しんゆう",
        "子供": "こども", "子ども": "こども", "孫": "まご", "兄弟": "きょうだい",
        "外国人": "がいこくじん", "医師": "いしゃ", "医者": "いしゃ", "エンジニア": "エンジニア",
        "研究者": "けんきゅうしゃ", "デザイナー": "デザイナー", "店員": "てんいん",
        "自営業": "じえいぎょう", "こうむいん": "こうむいん", "公務員": "こうむいん",
        "看護師": "かんごし", "看護婦": "かんごし", "アルバイト": "アルバイト",
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


// ============================================================================
// Speech synthesis
// ============================================================================

function speakText(text, rate = 1.0, onEndCallback) {
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

// ----------------------------------------------------------------------------
// Helper: Toggle UI Styler (Handles Emoji Grayscale)
// ----------------------------------------------------------------------------
function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;
    labelEl.className = `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    
    const emoji = labelEl.querySelector('.icon-emoji');
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
// Main application
// ============================================================================

function initApp() {
    const exampleSection = document.getElementById("exampleSection");
    const container = document.getElementById("task1List");
    const anchorElement = exampleSection || container;

    // ------------------------------------------------------------------------
    // Top Layout Setup (右寄りのグローバル設定パネル)
    // ------------------------------------------------------------------------
    if (anchorElement && anchorElement.parentNode) {
        const topLayoutContainer = document.createElement("div");
        topLayoutContainer.style.display = "flex";
        topLayoutContainer.style.justifyContent = "flex-end"; // 右寄せ
        topLayoutContainer.style.marginBottom = "20px";
        topLayoutContainer.style.width = "100%";

        const rightCol = document.createElement("div");
        rightCol.className = "control-group";
        rightCol.style.display = "flex";
        rightCol.style.flexDirection = "column"; // 縦並び
        rightCol.style.alignItems = "flex-end";  // 右揃え
        rightCol.style.gap = "12px";

        // ↩️もどる リンク (一番上)
        const backLink = document.createElement("a");
        backLink.href = "#";
        backLink.innerHTML = "↩️ もどる";
        backLink.style.textDecoration = "none";
        backLink.style.color = "var(--text-primary, #333)";
        backLink.style.fontWeight = "bold";
        backLink.style.fontSize = "16px";
        backLink.style.marginBottom = "4px";
        backLink.onclick = (e) => {
            e.preventDefault();
            window.history.back();
        };
        rightCol.appendChild(backLink);

        // 1. Recording Toggle
        const recordControl = document.createElement("div");
        recordControl.className = "control-item";
        
        const labelAutoRecord = document.createElement("span");
        labelAutoRecord.innerHTML = '<span class="icon-emoji">⏹️</span>Autostop<span class="custom-tip-box">Automatically stops recording when you stop speaking.</span>';

        const switchRecord = document.createElement("label");
        switchRecord.className = "switch";
        const inputRecord = document.createElement("input");
        inputRecord.type = "checkbox";
        inputRecord.checked = isManualStop;
        const sliderRecord = document.createElement("span");
        sliderRecord.className = "slider";
        switchRecord.appendChild(inputRecord);
        switchRecord.appendChild(sliderRecord);

        const labelManualRecord = document.createElement("span");
        labelManualRecord.innerHTML = '<span class="icon-emoji">⏹️</span>Manual stop<span class="custom-tip-box">Records continuously until you click the stop button.</span>';

        inputRecord.addEventListener("change", (e) => {
            isManualStop = e.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
            updateToggleLabelStyle(labelManualRecord, isManualStop);
        });

        recordControl.appendChild(labelAutoRecord);
        recordControl.appendChild(switchRecord);
        recordControl.appendChild(labelManualRecord);
        rightCol.appendChild(recordControl);
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        updateToggleLabelStyle(labelManualRecord, isManualStop);

        // 2. Vocab Hint Toggle
        const vocabControl = document.createElement("div");
        vocabControl.className = "control-item";
        
        const labelHoverHint = document.createElement("span");
        labelHoverHint.innerHTML = '<span class="icon-emoji">💬</span> Vocab Hint<span class="custom-tip-box">Shows word pronunciation and meaning when you hover over them.</span>';

        const switchHint = document.createElement("label");
        switchHint.className = "switch";
        const inputHint = document.createElement("input");
        inputHint.type = "checkbox";
        inputHint.checked = (hintMode === "paren");
        const sliderHint = document.createElement("span");
        sliderHint.className = "slider";
        switchHint.appendChild(inputHint);
        switchHint.appendChild(sliderHint);

        const labelParenHint = document.createElement("span");
        labelParenHint.innerHTML = '<span class="icon-emoji">🔡</span>Display Vocab<span class="custom-tip-box">Always shows word\'s meaning in parentheses.</span>';

        inputHint.addEventListener("change", (e) => {
            hintMode = e.target.checked ? "paren" : "hover";
            updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
            updateToggleLabelStyle(labelParenHint, hintMode === "paren");
            updateWordsDisplay();
        });

        vocabControl.appendChild(labelHoverHint);
        vocabControl.appendChild(switchHint);
        vocabControl.appendChild(labelParenHint);
        rightCol.appendChild(vocabControl);
        updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
        updateToggleLabelStyle(labelParenHint, hintMode === "paren");

        // 3. Playback Toggle (Auto/Manual)
        const playbackControl = document.createElement("div");
        playbackControl.className = "control-item";

        const labelAutoPlay = document.createElement("span");
        labelAutoPlay.innerHTML = '<span class="icon-emoji">▶️</span>Autoplay<span class="custom-tip-box">Plays the model and your voice automatically after recording.</span>';

        const switchPlayback = document.createElement("label");
        switchPlayback.className = "switch";
        const inputPlayback = document.createElement("input");
        inputPlayback.type = "checkbox";
        inputPlayback.checked = !isAutoPlay; 
        const sliderPlayback = document.createElement("span");
        sliderPlayback.className = "slider";
        switchPlayback.appendChild(inputPlayback);
        switchPlayback.appendChild(sliderPlayback);

        const labelManualPlay = document.createElement("span");
        labelManualPlay.innerHTML = '<span class="icon-emoji">⏯️</span>Manual play<span class="custom-tip-box">Disables automatic playback.</span>';

        inputPlayback.addEventListener("change", (e) => {
            isAutoPlay = !e.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
            updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
        });

        playbackControl.appendChild(labelAutoPlay);
        playbackControl.appendChild(switchPlayback);
        playbackControl.appendChild(labelManualPlay);
        rightCol.appendChild(playbackControl);
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        updateToggleLabelStyle(labelManualPlay, !isAutoPlay);

        topLayoutContainer.appendChild(rightCol);

        // ExampleまたはTaskリストの前に挿入
        anchorElement.parentNode.insertBefore(topLayoutContainer, anchorElement);
    }

    // ------------------------------------------------------------------------
    // Example Section Initialization
    // ------------------------------------------------------------------------
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

    if (!container) return;
    container.innerHTML = "";


    // ------------------------------------------------------------------------
    // Task 1 header (案内パネル風デザイン)
    // ------------------------------------------------------------------------
    const headerPanelTask1 = document.createElement("div");
    // インラインスタイルで案内パネル風に強制
    headerPanelTask1.style.backgroundColor = "#f0f8ff"; 
    headerPanelTask1.style.borderLeft = "6px solid #4facfe"; 
    headerPanelTask1.style.padding = "15px 20px";
    headerPanelTask1.style.borderRadius = "8px";
    headerPanelTask1.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
    headerPanelTask1.style.marginBottom = "20px";

    const titleInstructionGroup1 = document.createElement("div");
    titleInstructionGroup1.style.display = "flex";
    titleInstructionGroup1.style.flexDirection = "column";
    titleInstructionGroup1.style.gap = "6px";

    const titleArea1 = document.createElement("span");
    titleArea1.innerHTML = "<strong style='font-size: 1.2em; color: #2c3e50;'>Task 1；Drills</strong>";
    const descArea1 = document.createElement("span");
    descArea1.style.color = "var(--text-primary, #444)";
    descArea1.style.fontSize = "15px";
    descArea1.style.lineHeight = "1.5";
    descArea1.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';
    
    titleInstructionGroup1.appendChild(titleArea1);
    titleInstructionGroup1.appendChild(descArea1);

    headerPanelTask1.appendChild(titleInstructionGroup1);
    container.appendChild(headerPanelTask1);

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
    // Task 2 header (案内パネル風デザイン)
    // ------------------------------------------------------------------------
    const customHeaderPanel = document.createElement("div");
    customHeaderPanel.style.backgroundColor = "#fffcf0"; 
    customHeaderPanel.style.borderLeft = "6px solid #ffb84d"; 
    customHeaderPanel.style.padding = "15px 20px";
    customHeaderPanel.style.borderRadius = "8px";
    customHeaderPanel.style.marginTop = "35px";
    customHeaderPanel.style.marginBottom = "20px";
    customHeaderPanel.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";

    const titleInstructionGroup2 = document.createElement("div");
    titleInstructionGroup2.style.display = "flex";
    titleInstructionGroup2.style.flexDirection = "column";
    titleInstructionGroup2.style.gap = "6px";

    const titleArea2 = document.createElement("span");
    titleArea2.innerHTML = "<strong style='font-size: 1.2em; color: #2c3e50;'>Task 2；Custom Practice</strong>";
    const descArea2 = document.createElement("span");
    descArea2.style.color = "var(--text-primary, #444)";
    descArea2.style.fontSize = "15px";
    descArea2.style.lineHeight = "1.5";
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
                    setPlayingState(listenBtn, "Playing...");
                    const textToSpeak = isCustomNeg
                        ? `${valX}は、${valY}じゃないです。`
                        : `${valX}は、${valY}です。`;
                    speakText(textToSpeak, 0.7, () => stopAllPlayback());
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
        setPlayingState(listenBtn, "Playing...");
        const textToSpeak = isNeg
            ? `${targetX}は、${targetY}じゃないです。`
            : `${targetX}は、${targetY}です。`;
        speakText(textToSpeak, 0.7, () => stopAllPlayback());
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
        setPlayingState(btn, "Playing...");
        speakText(text, 0.7, () => stopAllPlayback());
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
            
            if (currentSession.recognitionDone && currentSession.recorder
