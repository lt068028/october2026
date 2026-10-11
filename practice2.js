// ============================================================================
// Practice 2: Questions & Yes/No Responses (Genki Lesson 2)
// ============================================================================

const practice2Data = [
    { x: "おかあさん", xRomaji: "okaasan", xMeaning: "mother", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee" },
    { x: "おとうさん", xRomaji: "otousan", xMeaning: "father", y: "じえいぎょう", yRomaji: "jiei-gyou", yMeaning: "self-employed" },
    { x: "おとうと", xRomaji: "otouto", xMeaning: "younger brother", y: "だいがくせい", yRomaji: "daigakusei", yMeaning: "college student" },
    { x: "いもうと", xRomaji: "imouto", xMeaning: "younger sister", y: "アルバイト", yRomaji: "arubaito", yMeaning: "part-time worker" },
    { x: "おねえさん", xRomaji: "oneesan", xMeaning: "older sister", y: "こうむいん", yRomaji: "koumuin", yMeaning: "civil servant" }
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
let isAutoPlay = true;
let activeRecognitionSession = null;

// ============================================================================
// Voice Setup
// ============================================================================
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

// ============================================================================
// Playback Control & Simultaneous Button State
// ============================================================================
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
        "お母さん": "おかあさん", "お父さん": "おとうさん", "弟": "おとうと", "妹": "いもうと", "お姉さん": "おねえさん",
        "会社員": "かいしゃいん", "自営業": "じえいぎょう", "大学生": "だいがくせい", "アルバイト": "アルバイト", "公務員": "こうむいん",
        "です": "です", "ですか": "ですか", "はい": "はい", "いいえ": "いいえ",
        "じゃないです": "じゃないです", "ではないです": "ではないです", "じゃありません": "じゃありません", "ではありません": "ではありません"
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

// ============================================================================
// Initialization & DOM Setup
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    initExampleListen();
    initPitchTests();
    initPractice2Drills();
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

function initSettingsPanel() {
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

function initExampleListen() {
    const ex1Btn = document.getElementById("ex1Listen");
    if (ex1Btn) {
        ex1Btn.addEventListener("click", () => {
            setPlayingStateMultiple([ex1Btn], "Playing...");
            speakText("おにいさんは、がくせいですか。", 0.9, () => stopAllPlayback());
        });
    }

    const exYesBtn = document.getElementById("exYesListen");
    if (exYesBtn) {
        exYesBtn.addEventListener("click", () => {
            setPlayingStateMultiple([exYesBtn], "Playing...");
            speakText("はい、がくせいです。", 0.9, () => stopAllPlayback());
        });
    }

    const exNoBtn = document.getElementById("exNoListen");
    if (exNoBtn) {
        exNoBtn.addEventListener("click", () => {
            setPlayingStateMultiple([exNoBtn], "Playing...");
            speakText("いいえ、がくせいじゃないです。", 0.9, () => stopAllPlayback());
        });
    }
}

// イントネーションテストボタンの初期化（4番目の「ですかぁ？」を追加）
function initPitchTests() {
    const t1 = document.getElementById("testPitch1");
    const t2 = document.getElementById("testPitch2");
    const t3 = document.getElementById("testPitch3");
    const t4 = document.getElementById("testPitch4");

    if (t1) t1.onclick = () => { setPlayingStateMultiple([t1], "Playing..."); speakText("おにいさんは、がくせいですか？", 0.9, () => stopAllPlayback()); };
    if (t2) t2.onclick = () => { setPlayingStateMultiple([t2], "Playing..."); speakText("おにいさんは、がくせいですかっ？", 0.9, () => stopAllPlayback()); };
    if (t3) t3.onclick = () => { setPlayingStateMultiple([t3], "Playing..."); speakText("おにいさんは、がくせいですかぁ～？", 0.9, () => stopAllPlayback()); };
    if (t4) t4.onclick = () => { setPlayingStateMultiple([t4], "Playing..."); speakText("おにいさんは、がくせいですかぁ？", 0.9, () => stopAllPlayback()); };
}

function updateWordsDisplay() {
    const drillRows = document.querySelectorAll(".drill-row");
    drillRows.forEach((row, index) => {
        const item = practice2Data[index];
        if (!item) return;
        const promptSpan = row.querySelector(".prompt-content-q");
        if (promptSpan) {
            promptSpan.innerHTML = `${formatWord(item.x, item.xRomaji, item.xMeaning)} ／ ${formatWord(item.y, item.yRomaji, item.yMeaning)}`;
        }
    });
}

// ----------------------------------------------------------------------------
// Practice 2 Drills Initialization
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

    // 1. 質問作成行
    const qRow = document.createElement("div");
    qRow.className = "top-row";
    qRow.style.marginBottom = "6px";

    const qListenBtn = document.createElement("button");
    qListenBtn.className = "example-button custom-tip-wrap";
    qListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    qListenBtn.onclick = () => {
        setPlayingStateMultiple([qListenBtn], "Playing...");
        speakText(`${item.x}は、${item.y}ですか。`, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label prompt-content-q";
    promptSpan.innerHTML = `${formatWord(item.x, item.xRomaji, item.xMeaning)} ／ ${formatWord(item.y, item.yRomaji, item.yMeaning)}`;
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

    // 2. 返答練習行
    const aRow = document.createElement("div");
    aRow.className = "top-row";
    aRow.style.paddingLeft = "24px";
    aRow.style.borderTop = "1px dashed var(--border-color)";
    aRow.style.paddingTop = "6px";

    let selectedMode = null; // 初期状態：未選択（null）

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

    // 👀Text ボタン（モデル文を表示するトリガー）
    const showTextBtn = document.createElement("button");
    showTextBtn.className = "example-button custom-tip-wrap";
    showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Click to show model answer text.</span>';
    showTextBtn.disabled = true;
    showTextBtn.style.opacity = "0.4";
    showTextBtn.style.marginLeft = "4px";

    const aPromptLabel = document.createElement("span");
    aPromptLabel.className = "prompt-label";
    aPromptLabel.style.minWidth = "220px";
    aPromptLabel.style.color = "var(--text-secondary)";
    aPromptLabel.textContent = "(Choose 🙆 or 🙅 first)";
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

    // 👀Text ボタンクリック時の処理
    showTextBtn.onclick = () => {
        if (!selectedMode) return;
        isTextVisible = !isTextVisible;
        if (isTextVisible) {
            aPromptLabel.style.color = "var(--text-primary)";
            aPromptLabel.innerHTML = selectedMode === "yes" ? `はい、${item.y}です。` : `いいえ、${item.y}じゃないです。`;
            showTextBtn.innerHTML = '🙈Hide<span class="custom-tip-box">Hide model answer text.</span>';
        } else {
            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "(Text hidden. Click 👀Text to show)";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Click to show model answer text.</span>';
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

            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "(Choose 🙆 or 🙅 first)";

            aListenBtn.disabled = true;
            aListenBtn.style.opacity = "0.4";
            showTextBtn.disabled = true;
            showTextBtn.style.opacity = "0.4";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Click to show model answer text.</span>';
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

        aPromptLabel.style.color = "var(--text-secondary)";
        aPromptLabel.textContent = "(Text hidden. Click 👀Text to show)";

        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Click to show model answer text.</span>';
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

            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "(Choose 🙆 or 🙅 first)";

            aListenBtn.disabled = true;
            aListenBtn.style.opacity = "0.4";
            showTextBtn.disabled = true;
            showTextBtn.style.opacity = "0.4";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Click to show model answer text.</span>';
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

        aPromptLabel.style.color = "var(--text-secondary)";
        aPromptLabel.textContent = "(Text hidden. Click 👀Text to show)";

        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Click to show model answer text.</span>';
        aRecordBtn.disabled = false;

        const tip = aRecordBtn.querySelector('.custom-tip-box');
        if (tip) tip.textContent = "Start recording your voice.";
    };

    aListenBtn.onclick = () => {
        if (!selectedMode) return;
        setPlayingStateMultiple([aListenBtn], "Playing...");
        const modelAns = selectedMode === "yes" ? `はい、${item.y}です。` : `いいえ、${item.y}じゃないです。`;
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

    bindRecorderEvents(
        qRecordBtn, qStopBtn, qResultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => `${item.x}は${item.y}ですか`, "question", false, playRate, item
    );

    bindRecorderEvents(
        aRecordBtn, aStopBtn, aResultSpan, correctionBox, corrListenBtn, corrTextSpan,
        () => selectedMode === "yes" ? `はい${item.y}です` : `いいえ${item.y}じゃないです`, "answer", () => selectedMode === "no", playRate, item
    );

    container.appendChild(rowDiv);
}

// 共通レコーダー・判定ロジック
function bindRecorderEvents(
    recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
    getExpectedTextFn, modeType, expectedIsNeg, playRate, item
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
                const isNegVal = typeof expectedIsNeg === "function" ? expectedIsNeg() : expectedIsNeg;
                processResult(
                    currentSession.accumulatedTranscript, modeType, item, isNegVal,
                    resultSpan, correctionBox, corrListenBtn, corrTextSpan, () => lastAudioUrl, playRate
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
    rawTranscript, modeType, item, expectedIsNeg,
    resultSpan, correctionBox, corrListenBtn, corrTextSpan, getUrlFn, playRate
) {
    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
        resultSpan.textContent = rawTranscript + " (Too short)";
        resultSpan.style.color = "var(--text-secondary)";
        return;
    }

    const hiraText = convertToHiragana(rawTranscript);
    let isCorrect = false;

    if (modeType === "question") {
        const expectedQ = convertToHiragana(`${item.x}は${item.y}ですか`);
        isCorrect = hiraText.includes(expectedQ) || hiraText.includes(convertToHiragana(item.y));
    } else {
        if (!expectedIsNeg) {
            const expectedAns = convertToHiragana(`はい${item.y}です`);
            isCorrect = hiraText.includes(expectedAns) || hiraText.includes("はい");
        } else {
            const neg1 = convertToHiragana(`いいえ${item.y}じゃないです`);
            const neg2 = convertToHiragana(`いいえ${item.y}ではないです`);
            const neg3 = convertToHiragana(`いいえ${item.y}じゃありません`);
            const neg4 = convertToHiragana(`いいえ${item.y}ではありません`);
            isCorrect = hiraText.includes(neg1) || hiraText.includes(neg2) || hiraText.includes(neg3) || hiraText.includes(neg4) || hiraText.includes("いいえ");
        }
    }

    const appendPlayButton = () => {
        let playBtn = resultSpan.querySelector(".play-recording-btn");
        if (!playBtn) {
            playBtn = document.createElement("button");
            playBtn.className = "example-button play-recording-btn custom-tip-wrap";
            playBtn.style.marginLeft = "8px";
            playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
            playBtn.onclick = () => {
                const url = getUrlFn();
                if (url) {
                    setPlayingStateMultiple([playBtn], "Playing...");
                    const audio = new Audio(url);
                    currentPlayingAudio = audio;
                    audio.onended = () => stopAllPlayback();
                    audio.play().catch(e => stopAllPlayback());
                }
            };
            resultSpan.appendChild(playBtn);
        }
        return playBtn;
    };

    let targetPlayBtn = null;
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

        const modelText = modeType === "question" 
            ? `${item.x}は、${item.y}ですか。`
            : (!expectedIsNeg ? `はい、${item.y}です。` : `いいえ、${item.y}じゃないです。`);

        corrListenBtn.onclick = () => {
            setPlayingStateMultiple([corrListenBtn], "Playing...");
            speakText(modelText, playRate, () => stopAllPlayback());
        };
        correctionBox.style.display = "block";
    }

    if (isAutoPlay && targetPlayBtn) {
        const url = getUrlFn();
        if (url) {
            setPlayingStateMultiple([targetPlayBtn], "Playing...");
            const audio = new Audio(url);
            currentPlayingAudio = audio;
            audio.playbackRate = 1.0;
            audio.onended = () => stopAllPlayback();
            audio.play().catch(e => stopAllPlayback());
        }
    }
}
