// ============================================================================
// Practice 2: Yes/No & Wh- Questions (Genki Lesson 2)
// ============================================================================

const practice2Data = [
    { x: "おにいさん", xKanji: "お兄さん", xRomaji: "oniisan", xMeaning: "older brother", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student" },
    { x: "おかあさん", xKanji: "お母さん", xRomaji: "okaasan", xMeaning: "mother", y: "かいしゃいん", yKanji: "会社員", yRomaji: "kaishain", yMeaning: "company employee" },
    { x: "おねえさん", xKanji: "お姉さん", xRomaji: "oneesan", xMeaning: "older sister", y: "こうこうせい", yKanji: "高校生", yRomaji: "koukousei", yMeaning: "high school student" },
    { x: "おとうさん", xKanji: "お父さん", xRomaji: "otousan", xMeaning: "father", y: "じえいぎょう", yKanji: "自営業", yRomaji: "jiei-gyou", yMeaning: "self-employed" },
    { x: "いもうと", xKanji: "妹", xRomaji: "imouto", xMeaning: "younger sister", y: "フリーター", yKanji: "フリーター", yRomaji: "furiitaa", yMeaning: "part-time worker" }
];

const drill2Targets = [
    { label: "ともだち", labelKanji: "友達", labelRomaji: "tomodachi", labelMeaning: "friend", possessive: "ともだちの", possessiveKanji: "友達の" },
    { label: "しんゆう", labelKanji: "親友", labelRomaji: "shinyuu", labelMeaning: "best friend", possessive: "しんゆうの", possessiveKanji: "親友の" },
    { label: "どうりょう", labelKanji: "同僚", labelRomaji: "douryou", labelMeaning: "colleague", possessive: "どうりょうの", possessiveKanji: "同僚の" }
];

const majorsData = [
    { word: "せいじ", kanji: "政治", romaji: "seiji", meaning: "politics" },
    { word: "けいざい", kanji: "経済", romaji: "keizai", meaning: "economics" },
    { word: "ビジネス", kanji: "ビジネス", romaji: "bijinesu", meaning: "business" },
    { word: "こくさいかんけい", kanji: "国際関係", romaji: "kokusai kankei", meaning: "international relations" },
    { word: "れきし", kanji: "歴史", romaji: "rekishi", meaning: "history" },
    { word: "にほんご", kanji: "日本語", romaji: "nihongo", meaning: "Japanese" },
    { word: "コンピューター", kanji: "コンピューター", romaji: "konpyuutaa", meaning: "computer science" }
];

const rowColorThemes = [
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" }
];

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "hiragana";
let isAutoPlay = true;
let activeRecognitionSession = null;

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
let activePlayButtons = [];
let currentUtteranceRef = null; 

function setPlayingStateMultiple(buttons, text) {
    stopAllPlayback();
    activePlayButtons = buttons;
    buttons.forEach(btn => {
        if (!btn) return;
        if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
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
            btn.innerHTML = 'Play';
        }
    });
    activePlayButtons = [];
}

function stopAllPlayback() {
    if (currentPlayTimeoutId) { clearTimeout(currentPlayTimeoutId); currentPlayTimeoutId = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    currentUtteranceRef = null;
    if (currentPlayingAudio) { currentPlayingAudio.pause(); currentPlayingAudio = null; }
    restorePlayButtons();
}

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    const dict = {
        "お母さん": "おかあさん", "お父さん": "おとうさん", "お兄さん": "おにいさん", "お姉さん": "おねえさん", "弟": "おとうと", "妹": "いもうと",
        "会社員": "かいしゃいん", "自営業": "じえいぎょう", "高校生": "こうこうせい", "看護師": "かんごし", "主婦": "しゅふ",
        "政治": "せいじ", "経済": "けいざい", "歴史": "れきし", "日本語": "にほんご", "友達": "ともだち", "親友": "しんゆう", "同僚": "どうりょう",
        "専攻": "せんこう", "政治": "せいじ", "経済": "けいざい", "歴史": "れきし", "日本語": "にほんご",
        "です": "です", "ですか": "ですか", "はい": "はい", "いいえ": "いいえ",
        "じゃないです": "じゃないです", "じゃ、ないです": "じゃ、ないです", "ではないです": "ではないです"
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
        console.error("Speech synthesis error:", err);
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    renderDrill1Example();
    renderDrill2Example();
    initPractice2Drills();
    initDrill2();
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

function initSettingsPanel() {
    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelHiraganaOnly = document.getElementById("labelHiraganaOnly");
    const labelWithKanji = document.getElementById("labelWithKanji");

    if (toggleScriptMode) {
        toggleScriptMode.addEventListener("change", (e) => {
            scriptMode = e.target.checked ? "kanji" : "hiragana";
            updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
            updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");
            updateWordsDisplay();
        });
        updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
        updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");
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

    const toggleHintMode = document.getElementById("toggleHintMode");
    const labelHoverHint = document.getElementById("labelHoverHint");
    const labelParenHint = document.getElementById("labelParenHint");

    if (toggleHintMode) {
        toggleHintMode.addEventListener("change", (e) => {
            hintMode = e.target.checked ? "paren" : "hover";
            updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
            updateToggleLabelStyle(labelParenHint, hintMode === "paren");
            updateWordsDisplay();
        });
        updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
        updateToggleLabelStyle(labelParenHint, hintMode === "paren");
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
    labelEl.className = `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    const emoji = labelEl.querySelector('.icon-emoji');
    if (emoji) {
        if (isActive) { emoji.style.filter = "none"; emoji.style.opacity = "1"; }
        else { emoji.style.filter = "grayscale(100%)"; emoji.style.opacity = "0.55"; }
    }
}

function updateWordsDisplay() {
    renderDrill1Example();
    renderDrill2Example();
    initPractice2Drills();
    initDrill2();
}

// ============================================================================
// Render Example Sections
// ============================================================================
function renderDrill1Example() {
    const box = document.getElementById("drill1ExampleBox");
    if (!box) return;

    const w1 = formatWord("おとうさん", "お父さん", "otousan", "father");
    const w2 = formatWord("かんごし", "看護師", "kangoshi", "nurse");
    
    box.innerHTML = `
        <div class="example-line flex-row-center" style="margin-bottom: 8px;">
            <strong class="example-label-title">Question:</strong>${w1} ／ ${w2}<span style="font-size: 16px; margin: 0 4px;">👉</span><button id="ex1Listen" class="example-button">🔊 きく</button><span>おとうさんは、かんごしですか？ <span style="font-size: 0.85em; color: var(--text-secondary);">(Is your father a nurse?)</span></span>
        </div>
        <div class="example-line dashed-border flex-row-center" style="padding-top: 10px;">
            <strong class="example-label-title">Response:</strong> 
            <button id="exYesListen" class="example-button" style="margin-right: 4px;">🔊 🙆</button>
            <span>はい、かんごしです。</span> ／ 
            <button id="exNoListen" class="example-button" style="margin-left: 4px; margin-right: 4px;">🔊 🙅</button>
            <span>いいえ、かんごしじゃ、ないです。</span>
        </div>
    `;

    document.getElementById("ex1Listen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("ex1Listen")], "Playing...");
        // 音声品質向上のため内部的に漢字混じりの正規文を渡す
        speakText("お父さんは、看護師ですか？", 0.9, () => stopAllPlayback());
    };
    document.getElementById("exYesListen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("exYesListen")], "Playing...");
        speakText("はい、看護師です。", 0.9, () => stopAllPlayback());
    };
    document.getElementById("exNoListen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("exNoListen")], "Playing...");
        speakText("いいえ、看護師じゃ、ないです。", 0.9, () => stopAllPlayback());
    };
}

function renderDrill2Example() {
    const box = document.getElementById("drill2ExampleBox");
    if (!box) return;

    const wTarget = formatWord("あなた", "あなた", "anata", "you");
    const wMaj = formatWord("せんこう", "専攻", "senkou", "major");

    box.innerHTML = `
        <div class="example-line flex-row-center" style="margin-bottom: 8px;">
            <strong class="example-label-title">Question:</strong>${wTarget} ／ ${wMaj}<span style="font-size: 16px; margin: 0 4px;">👉</span><button id="ex2QListen" class="example-button">🔊 きく</button><span>あなたの専攻は何ですか？ <span style="font-size: 0.85em; color: var(--text-secondary);">(What is your major?)</span></span>
        </div>
        <div class="example-line dashed-border flex-row-center" style="padding-top: 10px;">
            <strong class="example-label-title">Response:</strong> 
            <button id="ex2AListen" class="example-button" style="margin-right: 4px;">🔊 きく</button>
            <span>わたしの専攻は政治です。</span>
        </div>
    `;

    document.getElementById("ex2QListen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("ex2QListen")], "Playing...");
        speakText("あなたの専攻は何ですか。", 0.9, () => stopAllPlayback());
    };
    document.getElementById("ex2AListen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("ex2AListen")], "Playing...");
        speakText("わたしの専攻は政治です。", 0.9, () => stopAllPlayback());
    };
}

// ----------------------------------------------------------------------------
// Drill 1 Initialization
// ----------------------------------------------------------------------------
function initPractice2Drills() {
    const container = document.getElementById("drill1List");
    if (!container) return;
    container.innerHTML = "";

    practice2Data.forEach((item, index) => {
        createPractice2Row(container, `${index + 1}.`, item, index, 0.9);
    });
}

function createPractice2Row(container, indexLabel, item, rowIndex, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const theme = rowColorThemes[rowIndex % rowColorThemes.length];

    const qRow = document.createElement("div");
    qRow.className = "top-row";
    qRow.style.marginBottom = "6px";

    const qListenBtn = document.createElement("button");
    qListenBtn.className = "example-button custom-tip-wrap";
    qListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    qListenBtn.onclick = () => {
        setPlayingStateMultiple([qListenBtn], "Playing...");
        // 音質向上のため音声生成には漢字混じりのテキストを使用
        speakText(`${item.xKanji}は、${item.yKanji}ですか？`, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label prompt-content-q";
    promptSpan.innerHTML = `${formatWord(item.x, item.xKanji, item.xRomaji, item.xMeaning)} ／ ${formatWord(item.y, item.yKanji, item.yRomaji, item.yMeaning)}`;
    promptSpan.style.minWidth = "220px";

    const qRecordBtn = document.createElement("button");
    qRecordBtn.className = "example-button custom-tip-wrap";
    qRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const qStopBtn = document.createElement("button");
    qStopBtn.className = "example-button custom-tip-wrap";
    qStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    qStopBtn.disabled = true;

    const qResultSpan = document.createElement("span");
    qResultSpan.className = "result-text";
    qResultSpan.textContent = "(Not recorded yet)";
    qResultSpan.style.color = "var(--text-secondary)";

    qRow.appendChild(qListenBtn);
    qRow.appendChild(indexSpan);
    qRow.appendChild(promptSpan);
    qRow.appendChild(qRecordBtn);
    qRow.appendChild(qStopBtn);
    qRow.appendChild(qResultSpan);

    const aRow = document.createElement("div");
    aRow.className = "top-row";
    aRow.style.paddingLeft = "24px";
    aRow.style.borderTop = "1px dashed var(--border-color)";
    aRow.style.paddingTop = "6px";

    let selectedMode = null; 

    const yesBtn = document.createElement("button");
    yesBtn.className = "example-button";
    yesBtn.style.minWidth = "40px";
    yesBtn.innerHTML = "🙆";
    yesBtn.style.backgroundColor = theme.unselected;
    yesBtn.style.fontWeight = "bold";

    const noBtn = document.createElement("button");
    noBtn.className = "example-button";
    noBtn.style.minWidth = "40px";
    noBtn.innerHTML = "🙅";
    noBtn.style.backgroundColor = theme.unselected;
    noBtn.style.fontWeight = "bold";
    noBtn.style.marginLeft = "4px";

    const aListenBtn = document.createElement("button");
    aListenBtn.className = "example-button custom-tip-wrap";
    aListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    aListenBtn.disabled = true;
    aListenBtn.style.opacity = "0.4";

    const showTextBtn = document.createElement("button");
    showTextBtn.className = "example-button custom-tip-wrap";
    showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
    showTextBtn.disabled = true;
    showTextBtn.style.opacity = "0.4";
    showTextBtn.style.marginLeft = "4px";

    const aPromptLabel = document.createElement("span");
    aPromptLabel.className = "prompt-label";
    aPromptLabel.style.minWidth = "220px";
    aPromptLabel.style.color = "var(--text-secondary)";
    aPromptLabel.textContent = "";
    let isTextVisible = false;

    const aRecordBtn = document.createElement("button");
    aRecordBtn.className = "example-button custom-tip-wrap";
    aRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Choose 🙆 or 🙅.</span>';
    aRecordBtn.disabled = true;

    const aStopBtn = document.createElement("button");
    aStopBtn.className = "example-button custom-tip-wrap";
    aStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    aStopBtn.disabled = true;

    const aResultSpan = document.createElement("span");
    aResultSpan.className = "result-text";
    aResultSpan.textContent = "(Not recorded yet)";
    aResultSpan.style.color = "var(--text-secondary)";

    showTextBtn.onclick = () => {
        if (!selectedMode) return;
        isTextVisible = !isTextVisible;
        const wordY = (scriptMode === "kanji") ? item.yKanji : item.y;
        if (isTextVisible) {
            aPromptLabel.style.color = "var(--text-primary)";
            aPromptLabel.innerHTML = selectedMode === "yes" ? `はい、${wordY}です。` : `いいえ、${wordY}じゃないです。`;
            showTextBtn.innerHTML = '🕶️Hide<span class="custom-tip-box">Hide model answer text.</span>';
        } else {
            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        }
    };

    yesBtn.onclick = () => {
        if (selectedMode === "yes") {
            selectedMode = null;
            isTextVisible = false;
            yesBtn.style.backgroundColor = theme.unselected;
            yesBtn.style.opacity = "1";
            noBtn.style.backgroundColor = theme.unselected;
            noBtn.style.opacity = "1";

            aPromptLabel.textContent = "";

            aListenBtn.disabled = true;
            aListenBtn.style.opacity = "0.4";
            showTextBtn.disabled = true;
            showTextBtn.style.opacity = "0.4";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
            aRecordBtn.disabled = true;

            const tip = aRecordBtn.querySelector('.custom-tip-box');
            if (tip) tip.textContent = "Choose 🙆 or 🙅.";
            return;
        }

        selectedMode = "yes";
        isTextVisible = false;
        yesBtn.style.backgroundColor = theme.yesActive;
        yesBtn.style.opacity = "1";
        noBtn.style.backgroundColor = theme.unselected;
        noBtn.style.opacity = "0.55";

        aPromptLabel.textContent = "";

        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        aRecordBtn.disabled = false;

        const tip = aRecordBtn.querySelector('.custom-tip-box');
        if (tip) tip.textContent = "Start recording your voice.";
    };

    noBtn.onclick = () => {
        if (selectedMode === "no") {
            selectedMode = null;
            isTextVisible = false;
            noBtn.style.backgroundColor = theme.unselected;
            noBtn.style.opacity = "1";
            yesBtn.style.backgroundColor = theme.unselected;
            yesBtn.style.opacity = "1";

            aPromptLabel.textContent = "";

            aListenBtn.disabled = true;
            aListenBtn.style.opacity = "0.4";
            showTextBtn.disabled = true;
            showTextBtn.style.opacity = "0.4";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
            aRecordBtn.disabled = true;

            const tip = aRecordBtn.querySelector('.custom-tip-box');
            if (tip) tip.textContent = "Choose 🙆 or 🙅.";
            return;
        }

        selectedMode = "no";
        isTextVisible = false;
        noBtn.style.backgroundColor = theme.noActive;
        noBtn.style.opacity = "1";
        yesBtn.style.backgroundColor = theme.unselected;
        yesBtn.style.opacity = "0.55";

        aPromptLabel.textContent = "";

        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        aRecordBtn.disabled = false;

        const tip = aRecordBtn.querySelector('.custom-tip-box');
        if (tip) tip.textContent = "Start recording your voice.";
    };

    aListenBtn.onclick = () => {
        if (!selectedMode) return;
        setPlayingStateMultiple([aListenBtn], "Playing...");
        const wordYKanji = item.yKanji;
        const modelAns = selectedMode === "yes" ? `はい、${wordYKanji}です。` : `いいえ、${wordYKanji}じゃ、ないです。`;
        speakText(modelAns, playRate, () => stopAllPlayback());
    };

    aRow.appendChild(yesBtn);
    aRow.appendChild(noBtn);
    aRow.appendChild(aListenBtn);
    aRow.appendChild(showTextBtn);
    aRow.appendChild(aPromptLabel);
    aRow.appendChild(aRecordBtn);
    aRow.appendChild(aStopBtn);
    aRow.appendChild(aResultSpan);

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";
    const corrListenBtn = document.createElement("button");
    corrListenBtn.className = "example-button";
    corrListenBtn.innerHTML = "🔊 きく";
    corrListenBtn.style.marginRight = "8px";
    const corrTextSpan = document.createElement("span");
    correctionBox.appendChild(corrListenBtn);
    correctionBox.appendChild(corrTextSpan);

    rowDiv.appendChild(qRow);
    rowDiv.appendChild(aRow);
    rowDiv.appendChild(correctionBox);

    const wordX = item.x;
    const wordY = item.y;
    const wordXKanji = item.xKanji;
    const wordYKanji = item.yKanji;

    bindRecorderEvents(
        qRecordBtn, qStopBtn, qResultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => `${wordX}は${wordY}ですか`, () => `${wordXKanji}は${wordYKanji}ですか`, "question", false, playRate, 0.95, item
    );

    bindRecorderEvents(
        aRecordBtn, aStopBtn, aResultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => selectedMode === "yes" ? `はい${wordY}です` : `いいえ${wordY}じゃないです`, () => selectedMode === "yes" ? `はい${wordYKanji}です` : `いいえ${wordYKanji}じゃないです`, "answer", () => selectedMode === "no", playRate, 0.95, item
    );

    container.appendChild(rowDiv);
}

// ----------------------------------------------------------------------------
// Drill 2 Initialization (Wh- Questions - 3 items: ともだち、しんゆう、どうりょう)
// ----------------------------------------------------------------------------
function initDrill2() {
    const container = document.getElementById("drill2List");
    if (!container) return;
    container.innerHTML = "";

    drill2Targets.forEach((target, index) => {
        createDrill2Row(container, `${index + 1}.`, target, 0.9);
    });
}

function createDrill2Row(container, indexLabel, target, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    // 1. 質問作成行（ともだち ／ せんこう）
    const qRow = document.createElement("div");
    qRow.className = "top-row";
    qRow.style.marginBottom = "6px";

    const qListenBtn = document.createElement("button");
    qListenBtn.className = "example-button custom-tip-wrap";
    qListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the question.</span>';
    qListenBtn.onclick = () => {
        setPlayingStateMultiple([qListenBtn], "Playing...");
        speakText(`${target.labelKanji}の専攻は何ですか。`, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const tLabelDisplay = formatWord(target.label, target.labelKanji, target.labelRomaji, target.labelMeaning);
    const senkouDisplay = formatWord("せんこう", "専攻", "senkou", "major");
    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = `${tLabelDisplay} ／ ${senkouDisplay}`;
    promptSpan.style.minWidth = "220px";

    const qRecordBtn = document.createElement("button");
    qRecordBtn.className = "example-button custom-tip-wrap";
    qRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Record your question.</span>';

    const qStopBtn = document.createElement("button");
    qStopBtn.className = "example-button custom-tip-wrap";
    qStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop recording.</span>';
    qStopBtn.disabled = true;

    const qResultSpan = document.createElement("span");
    qResultSpan.className = "result-text";
    qResultSpan.textContent = "(Not recorded yet)";
    qResultSpan.style.color = "var(--text-secondary)";

    qRow.appendChild(qListenBtn);
    qRow.appendChild(indexSpan);
    qRow.appendChild(promptSpan);
    qRow.appendChild(qRecordBtn);
    qRow.appendChild(qStopBtn);
    qRow.appendChild(qResultSpan);

    // 2. 返答練習行（ともだち ／ せんこう ／ 📋Select）
    const aRow = document.createElement("div");
    aRow.className = "top-row";
    aRow.style.paddingLeft = "24px";
    aRow.style.borderTop = "1px dashed var(--border-color)";
    aRow.style.paddingTop = "6px";

    const aPromptPrefix = document.createElement("span");
    aPromptPrefix.className = "prompt-label";
    aPromptPrefix.innerHTML = `${tLabelDisplay} ／ ${senkouDisplay} ／ `;
    aPromptPrefix.style.minWidth = "200px";

    const selectEl = document.createElement("select");
    selectEl.className = "custom-select custom-tip-wrap";
    selectEl.style.fontSize = "13px";
    selectEl.style.marginRight = "8px";
    selectEl.innerHTML = '<option value="" disabled selected>📋Select</option>';
    
    const selectTip = document.createElement('span');
    selectTip.className = 'custom-tip-wrap';
    selectTip.style.display = 'inline-block';
    selectTip.innerHTML = '<span class="custom-tip-box">Select a major from the list to answer.</span>';
    selectTip.appendChild(selectEl);

    majorsData.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.word;
        // 標準では日本語のみ（Hintモード時にツールチップ等で補足）
        const displayMajor = (scriptMode === "kanji") ? m.kanji : m.word;
        opt.textContent = displayMajor;
        opt.title = `${m.romaji}, ${m.meaning}`;
        selectEl.appendChild(opt);
    });

    const aListenBtn = document.createElement("button");
    aListenBtn.className = "example-button custom-tip-wrap";
    aListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct answer.</span>';
    aListenBtn.disabled = true;
    aListenBtn.style.opacity = "0.4";

    const showTextBtn = document.createElement("button");
    showTextBtn.className = "example-button custom-tip-wrap";
    showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
    showTextBtn.disabled = true;
    showTextBtn.style.opacity = "0.4";
    showTextBtn.style.marginLeft = "4px";

    const aPromptLabel = document.createElement("span");
    aPromptLabel.className = "prompt-label";
    aPromptLabel.style.minWidth = "200px";
    aPromptLabel.style.color = "var(--text-secondary)";
    aPromptLabel.textContent = "";
    let isTextVisible = false;
    let selectedMajor = null;
    let selectedMajorKanji = null;

    const aRecordBtn = document.createElement("button");
    aRecordBtn.className = "example-button custom-tip-wrap";
    aRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Select a major first.</span>';
    aRecordBtn.disabled = true;

    const aStopBtn = document.createElement("button");
    aStopBtn.className = "example-button custom-tip-wrap";
    aStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop recording.</span>';
    aStopBtn.disabled = true;

    const aResultSpan = document.createElement("span");
    aResultSpan.className = "result-text";
    aResultSpan.textContent = "(Not recorded yet)";
    aResultSpan.style.color = "var(--text-secondary)";

    selectEl.onchange = () => {
        selectedMajor = selectEl.value;
        const found = majorsData.find(m => m.word === selectedMajor);
        selectedMajorKanji = found ? found.kanji : selectedMajor;
        isTextVisible = false;

        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        aRecordBtn.disabled = false;

        aPromptLabel.style.color = "var(--text-secondary)";
        aPromptLabel.textContent = "";

        const tip = aRecordBtn.querySelector('.custom-tip-box');
        if (tip) tip.textContent = "Start recording your voice.";
    };

    showTextBtn.onclick = () => {
        if (!selectedMajor) return;
        isTextVisible = !isTextVisible;
        const poss = (scriptMode === "kanji") ? target.possessiveKanji : target.possessive;
        const maj = (scriptMode === "kanji") ? selectedMajorKanji : selectedMajor;
        if (isTextVisible) {
            aPromptLabel.style.color = "var(--text-primary)";
            aPromptLabel.innerHTML = `${poss}専攻は${maj}です。`;
            showTextBtn.innerHTML = '🕶️Hide<span class="custom-tip-box">Hide model answer text.</span>';
        } else {
            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        }
    };

    aListenBtn.onclick = () => {
        if (!selectedMajor) return;
        setPlayingStateMultiple([aListenBtn], "Playing...");
        speakText(`${target.possessiveKanji}専攻は${selectedMajorKanji}です。`, playRate, () => stopAllPlayback());
    };

    aRow.appendChild(aPromptPrefix);
    aRow.appendChild(selectTip);
    aRow.appendChild(aListenBtn);
    aRow.appendChild(showTextBtn);
    aRow.appendChild(aPromptLabel);
    aRow.appendChild(aRecordBtn);
    aRow.appendChild(aStopBtn);
    aRow.appendChild(aResultSpan);

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";
    const corrListenBtn = document.createElement("button");
    corrListenBtn.className = "example-button";
    corrListenBtn.innerHTML = "🔊 きく";
    corrListenBtn.style.marginRight = "8px";
    const corrTextSpan = document.createElement("span");
    correctionBox.appendChild(corrListenBtn);
    correctionBox.appendChild(corrTextSpan);

    rowDiv.appendChild(qRow);
    rowDiv.appendChild(aRow);
    rowDiv.appendChild(correctionBox);

    const tLabel = target.label;
    const tLabelKanji = target.labelKanji;
    const poss = target.possessive;
    const possKanji = target.possessiveKanji;

    bindRecorderEvents(
        qRecordBtn, qStopBtn, qResultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => `${tLabel}の専攻は何ですか`, () => `${tLabelKanji}の専攻は何ですか`, "question", false, playRate, 0.95, null
    );

    bindRecorderEvents(
        aRecordBtn, aStopBtn, aResultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => `${poss}専攻は${selectedMajor}です`, () => `${possKanji}専攻は${selectedMajorKanji}です`, "answer", false, playRate, 0.95, null
    );

    container.appendChild(rowDiv);
}

// ============================================================================
// Recorder & Verification Logic (Model playback at 95% rate with Kanji text)
// ============================================================================
function bindRecorderEvents(
    recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
    getExpectedTextFn, getExpectedKanjiFn, modeType, expectedIsNeg, playRate, modelPlayRate, item
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
        if (!currentRecognition) { releaseSession(currentSession); return; }
        if (currentSession.watchdog === null) {
            currentSession.watchdog = setTimeout(() => { releaseSession(currentSession); }, 2500);
        }
        try { if (abort) currentRecognition.abort(); else currentRecognition.stop(); } catch (err) {}
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
            alert("Browser Notice\nBrave browser does not support speech recognition. Please try another browser.");
            resultSpan.textContent = "Speech recognition is not supported.";
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

        if (lastAudioUrl) { URL.revokeObjectURL(lastAudioUrl); lastAudioUrl = null; }

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
                const expectedText = getExpectedTextFn();
                processResult(
                    currentSession.accumulatedTranscript, modeType, expectedText, getExpectedKanjiFn,
                    resultSpan, correctionBox, corrListenBtn, corrTextSpan, () => lastAudioUrl, playRate, modelPlayRate
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
                lastAudioUrl = URL.createObjectURL(audioBlob);
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
                const message = event.error === "no-speech" ? "No speech detected." : "Recognition error.";
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
            if (isManualStop) stopBtn.classList.add("stop-btn-active");
            else stopBtn.classList.remove("stop-btn-active");

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

function processResult(
    rawTranscript, modeType, expectedText, getExpectedKanjiFn,
    resultSpan, correctionBox, corrListenBtn, corrTextSpan, getUrlFn, playRate, modelPlayRate
) {
    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
        resultSpan.textContent = rawTranscript + " (Too short)";
        resultSpan.style.color = "var(--text-secondary)";
        return;
    }

    const hiraText = convertToHiragana(rawTranscript);
    const expectedHira = convertToHiragana(expectedText);
    const isCorrect = hiraText.includes(expectedHira) || hiraText.length >= 2;

    const appendPlayButton = () => {
        let playBtn = resultSpan.querySelector(".play-recording-btn");
        if (!playBtn) {
            playBtn = document.createElement("button");
            playBtn.className = "example-button play-recording-btn custom-tip-wrap";
            playBtn.style.marginLeft = "8px";
            playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice (100%)</span>';
            playBtn.onclick = () => {
                const url = getUrlFn();
                if (url) {
                    setPlayingStateMultiple([playBtn], "Playing...");
                    const audio = new Audio(url);
                    currentPlayingAudio = audio;
                    audio.playbackRate = 1.0;
                    audio.onended = () => stopAllPlayback();
                    audio.play().catch(e => stopAllPlayback());
                }
            };
            resultSpan.appendChild(playBtn);
        }
        return playBtn;
    };

    let targetPlayBtn = null;
    const kanjiTextForSpeech = getExpectedKanjiFn();

    if (isCorrect) {
        resultSpan.textContent = hiraText + " ✅ ";
        resultSpan.style.color = "var(--text-primary)";
        targetPlayBtn = appendPlayButton();
        correctionBox.style.display = "none";
    } else {
        resultSpan.textContent = hiraText + " ";
        resultSpan.style.color = "var(--error-text)";
        targetPlayBtn = appendPlayButton();
        corrTextSpan.textContent = "🔥 Keep going! Try once more!";
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            setPlayingStateMultiple([corrListenBtn], "Playing...");
            speakText(kanjiTextForSpeech, 0.9, () => stopAllPlayback());
        };
        correctionBox.style.display = "block";
    }

    // 自動再生時は音質向上のため漢字混じり文を 95% で再生
    if (isAutoPlay) {
        speakText(kanjiTextForSpeech, modelPlayRate, () => {
            stopAllPlayback();
            if (targetPlayBtn) {
                const url = getUrlFn();
                if (url) {
                    const audio = new Audio(url);
                    currentPlayingAudio = audio;
                    audio.playbackRate = 1.0;
                    audio.onended = () => { currentPlayingAudio = null; };
                    audio.play().catch(e => {});
                }
            }
        });
    }
}
