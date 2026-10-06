// ============================================================================
// Pronunciation Drill
// ============================================================================

const modelSentences = [
    {
        targetText: "てんきがいいです",
        symbolColor: "#fb7185",
        displayHtml: [
            { text: "て", low: false }, { type: "symbol", val: "↘" },
            { text: "んきが", low: true }, { type: "symbol", val: "｜" },
            { text: "い", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The weather is fine."
    },
    {
        targetText: "じかんがないです",
        symbolColor: "#f43f5e",
        displayHtml: [
            { text: "じ", low: true }, { type: "symbol", val: "↗" },
            { text: "かんが", low: false }, { type: "symbol", val: "｜" },
            { text: "な", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I don't have time."
    },
    {
        targetText: "しごとがほしいです",
        symbolColor: "#fda4af",
        displayHtml: [
            { text: "し", low: true }, { type: "symbol", val: "↗" },
            { text: "ごとが", low: false }, { type: "symbol", val: "｜" },
            { text: "ほ", low: true }, { type: "symbol", val: "↗" },
            { text: "し", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I want a job."
    },
    {
        targetText: "せんせいはおもしろいです",
        symbolColor: "#e879f9",
        displayHtml: [
            { text: "せ", low: true }, { type: "symbol", val: "↗" },
            { text: "んせ", low: false }, { type: "symbol", val: "↘" },
            { text: "いは", low: true }, { type: "symbol", val: "｜" },
            { text: "お", low: true }, { type: "symbol", val: "↗" },
            { text: "もしろ", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The teacher is interesting."
    },
    {
        targetText: "がっこうはたのしいです",
        symbolColor: "#34d399",
        displayHtml: [
            { text: "が", low: true }, { type: "symbol", val: "↗" },
            { text: "っこうは", low: false }, { type: "symbol", val: "｜" },
            { text: "た", low: true }, { type: "symbol", val: "↗" },
            { text: "のし", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "School is fun."
    }
];

// ============================================================================
// State & Constants
// ============================================================================

let isManualStop = false;

const SMALL_Y = new Set(["ゃ", "ゅ", "ょ"]);
const SPECIAL_MORA = new Set(["っ", "ん", "ー"]);

// ============================================================================
// Text & Mora Processing
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_~()（）「」。、\s]/g, "");
    cleaned = cleaned.replace(/[ァ-ヶ]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));

    const dict = {
        "天気": "てんき", "電気": "でんき", "時間": "じかん", "仕事": "しごと",
        "欲しい": "ほしい", "先生": "せんせい", "面白い": "おもしろい",
        "学校": "がっこう", "楽しい": "たのしい", "です": "です", "でした": "でした"
    };

    for (const key in dict) {
        cleaned = cleaned.replace(new RegExp(key, "g"), dict[key]);
    }
    return cleaned;
}

function splitIntoMora(text) {
    const chars = Array.from(text);
    const morae = [];
    for (const ch of chars) {
        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }
        morae.push({ text: ch, special: SPECIAL_MORA.has(ch) });
    }
    return morae;
}

function getModelMoraData(itemObj) {
    const charPitch = [];
    itemObj.displayHtml.forEach(part => {
        if (part.type === "symbol") return;
        for (const ch of Array.from(part.text)) {
            charPitch.push({ char: ch, low: !!part.low });
        }
    });
    const targetText = charPitch.map(item => item.char).join("");
    const morae = [];
    const chars = Array.from(targetText);
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }
        const isSpecial = SPECIAL_MORA.has(ch);
        morae.push({
            text: ch,
            special: isSpecial,
            low: isSpecial ? null : charPitch[i].low
        });
    }
    return morae;
}

function compareMoraSequences(modelMorae, learnerMorae) {
    const operations = [];
    let i = 0; let j = 0;

    while (i < modelMorae.length || j < learnerMorae.length) {
        if (i >= modelMorae.length) {
            operations.push({ type: "extra", learner: learnerMorae[j], learnerIndex: j });
            j++; continue;
        }
        if (j >= learnerMorae.length) {
            operations.push({ type: "missing", model: modelMorae[i], modelIndex: i });
            i++; continue;
        }

        const model = modelMorae[i];
        const learner = learnerMorae[j];

        if (model.text === learner.text) {
            operations.push({ type: "match", model, learner, modelIndex: i, learnerIndex: j });
            i++; j++; continue;
        }

        if (j + 1 < learnerMorae.length && model.text === learnerMorae[j + 1].text) {
            operations.push({ type: "extra", learner, learnerIndex: j });
            j++; continue;
        }

        if (i + 1 < modelMorae.length && modelMorae[i + 1].text === learner.text) {
            operations.push({ type: "missing", model, modelIndex: i });
            i++; continue;
        }

        operations.push({ type: "sound-error", model, learner, modelIndex: i, learnerIndex: j });
        i++; j++;
    }
    return operations;
}

// ============================================================================
// UI Rendering
// ============================================================================

function renderPronunciationResult(resultSpan, operations) {
    resultSpan.innerHTML = "";
    resultSpan.style.color = "";

    const recognizedText = operations
        .filter(op => op.type !== "missing")
        .map(op => op.learner ? op.learner.text : "")
        .join("");

    if (recognizedText) {
        const span = document.createElement("span");
        span.className = "pronunciation-normal";
        span.textContent = recognizedText;
        resultSpan.appendChild(span);
    }
    return false;
}

function buildHtmlParts(itemObj) {
    let speechText = "";
    let htmlParts = "";
    itemObj.displayHtml.forEach(part => {
        if (part.type === "symbol") {
            htmlParts += `<span style="color: ${itemObj.symbolColor};">${part.val}</span>`;
        } else {
            speechText += part.text;
            const pitchClass = part.low ? "low-pitch" : "high-pitch";
            htmlParts += `<span class="${pitchClass}" style="text-decoration-color: ${itemObj.symbolColor};">${part.text}</span>`;
        }
    });
    return { htmlParts, speechText };
}

// ============================================================================
// Recording Controller
// ============================================================================

function setupRecordingEvents(rowElement, itemObj, speechText) {
    const listenBtn = rowElement.querySelector(".listen-btn");
    const recordBtn = rowElement.querySelector(".record-btn");
    const stopBtn = rowElement.querySelector(".stop-btn");
    const resultSpan = rowElement.querySelector(".result-text");
    const playRecordBtn = rowElement.querySelector(".play-record-btn");
    const meaningBtn = rowElement.querySelector(".meaning-btn");
    const meaningPopup = rowElement.querySelector(".meaning-popup");

    let mediaRecorder, audioStream, recognition, recordedAudioUrl;
    let latestTranscript = "", recordingTimeout, silenceTimer;
    let recordingActive = false, finishingRecording = false, audioChunks = [];

    // --- Audio Playback ---
    listenBtn.addEventListener("click", () => {
        listenBtn.disabled = true;
        listenBtn.textContent = "🔊Playing...";
        
        // Timeoutによる意図的なディレイを削除し、即時実行
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "ja-JP"; 
        utterance.rate = 0.7; // ※読み上げ速度設定（0.7=遅い）
        utterance.onend = () => { listenBtn.disabled = false; listenBtn.textContent = "🔊 きく"; };
        speechSynthesis.speak(utterance);
    });

    playRecordBtn.addEventListener("click", () => {
        if (!recordedAudioUrl) return;
        const audio = new Audio(recordedAudioUrl);
        audio.playbackRate = 1.0; 
        playRecordBtn.disabled = true; 
        playRecordBtn.textContent = "▶️ Playing...";
        audio.play();
        audio.onended = () => { 
            playRecordBtn.disabled = false; 
            playRecordBtn.textContent = "▶️"; 
        };
    });

    // --- UI Interactions ---
    meaningBtn.addEventListener("click", e => { e.stopPropagation(); meaningPopup.classList.toggle("show"); });
    document.addEventListener("click", () => meaningPopup.classList.remove("show"));
    rowElement.querySelector(".meaning-container").addEventListener("click", e => e.stopPropagation());

    // --- Recording Logic ---
    function clearSilenceTimer() { if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; } }
    
    function scheduleAutostop() {
        if (isManualStop || !recordingActive || finishingRecording) return;
        clearSilenceTimer();
        silenceTimer = setTimeout(() => { if (!recordingActive || finishingRecording) return; finishRecording(); }, 1500);
    }

    function processTranscript(rawTranscript) {
        if (!rawTranscript) return null;
        const hiraText = convertToHiragana(rawTranscript);
        const cleanHira = hiraText.replace(/[\s、。]/g, "");
        
        if (cleanHira.length < 2) {
            resultSpan.textContent = hiraText + " (Too short)";
            resultSpan.style.color = "var(--text-secondary)";
            return null;
        }
        
        const cleanTarget = itemObj.targetText.replace(/[\s、。]/g, "");
        const matchRegex = new RegExp(`^${cleanTarget}(?:ね|よ|よね|ですね|ですよ)*$`);
        const exactSentence = matchRegex.test(cleanHira);
        
        const modelMorae = getModelMoraData(itemObj);
        const learnerMorae = splitIntoMora(cleanHira);
        let operations = compareMoraSequences(modelMorae, learnerMorae);
        
        if (exactSentence) {
            operations = operations.filter(op => op.type !== "extra" || (op.learner && op.learner.text !== "ね" && op.learner.text !== "よ"));
        }
        
        renderPronunciationResult(resultSpan, operations);
        return { hiraText, modelMorae, learnerMorae, operations };
    }

    function finishRecording() {
        if (finishingRecording) return;
        finishingRecording = true; recordingActive = false;
        clearSilenceTimer();
        
        if (recordingTimeout) { clearTimeout(recordingTimeout); recordingTimeout = null; }
        if (recognition) { try { recognition.stop(); } catch (e) {} }
        if (mediaRecorder && mediaRecorder.state !== "inactive") { try { mediaRecorder.stop(); } catch (e) {} }
        if (audioStream) { audioStream.getTracks().forEach(track => track.stop()); audioStream = null; }
        
        recordBtn.disabled = false; stopBtn.disabled = true; stopBtn.classList.remove("stop-btn-active");
    }

    recordBtn.addEventListener("click", async () => {
        clearSilenceTimer(); recordingActive = false; finishingRecording = false; audioChunks = []; latestTranscript = "";
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);
            
            mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) audioChunks.push(e.data); };
            mediaRecorder.onstop = async () => {
                recordingActive = false;
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
                recordedAudioUrl = URL.createObjectURL(audioBlob);
                
                playRecordBtn.style.display = "inline-flex";
                // 録音完了直後は自動再生完了まで手動クリックをブロックする
                playRecordBtn.disabled = true; 
                
                if (latestTranscript) {
                    processTranscript(latestTranscript);
                } else {
                    resultSpan.textContent = "No speech detected. Please try again.";
                    resultSpan.style.color = "var(--text-secondary)";
                }
                finishingRecording = false;

                // 録音完了 ⇨ モデル音プレイ(グレーアウト) ⇨ 録音音源再生(グレーアウト)
                // 待機時間（setTimeout）を削除し、即時実行
                listenBtn.disabled = true;
                listenBtn.textContent = "🔊Playing...";

                const utterance = new SpeechSynthesisUtterance(speechText);
                utterance.lang = "ja-JP";
                utterance.rate = 0.7; // ※読み上げ速度
                utterance.onend = () => {
                    listenBtn.disabled = false;
                    listenBtn.textContent = "🔊 きく";
                    
                    if (recordedAudioUrl) {
                        // モデル音声終了後、即時に録音音声を再生（ディレイ削除）
                        playRecordBtn.disabled = false;
                        playRecordBtn.click();
                    } else {
                        playRecordBtn.disabled = false;
                    }
                };
                speechSynthesis.speak(utterance);
            };
            
            mediaRecorder.start(); recordingActive = true;

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.lang = "ja-JP"; recognition.interimResults = false; recognition.continuous = false;
                
                recognition.onresult = e => {
                    let rawTranscript = "";
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        if (e.results[i].isFinal) rawTranscript += e.results[i][0].transcript;
                    }
                    if (!rawTranscript) return;
                    latestTranscript = rawTranscript;
                    if (!isManualStop) { processTranscript(latestTranscript); scheduleAutostop(); }
                };
                recognition.onerror = err => console.error("Speech recognition error:", err);
                try { recognition.start(); } catch (e) { console.error("Recognition start error:", e); }
            } else { 
                latestTranscript = ""; 
            }

            recordBtn.disabled = true;
            if (isManualStop) {
                stopBtn.disabled = false; stopBtn.classList.add("stop-btn-active");
                resultSpan.textContent = "Recording (Max 15s)...";
                recordingTimeout = setTimeout(() => finishRecording(), 15000);
            } else {
                stopBtn.disabled = true; stopBtn.classList.remove("stop-btn-active");
                resultSpan.textContent = "Recording...";
            }
            resultSpan.style.color = "var(--accent-color)";
            playRecordBtn.style.display = "none";

        } catch (err) {
            console.error("Mic error:", err); recordingActive = false; finishingRecording = false;
            resultSpan.textContent = "Mic error"; resultSpan.style.color = "var(--error-text)";
            recordBtn.disabled = false; stopBtn.disabled = true; stopBtn.classList.remove("stop-btn-active");
        }
    });

    stopBtn.addEventListener("click", () => finishRecording());
}

// ============================================================================
// App Initialization
// ============================================================================

function initDrill() {
    const drillList = document.getElementById("drillList");
    if (!drillList) return;
    drillList.innerHTML = "";

    const headerPanel = document.createElement("div");
    headerPanel.className = "header-panel";
    headerPanel.innerHTML = `
        <span style="color: var(--text-primary);"><strong>Pronunciation Drills</strong></span>
        <div class="control-item" id="modeControlItem"></div>
    `;
    drillList.appendChild(headerPanel);

    const controlItem = headerPanel.querySelector("#modeControlItem");
    const updateLabels = () => {
        controlItem.innerHTML = `
            <span class="mode-label ${isManualStop ? 'inactive-mode' : 'active-mode'} custom-tip-wrap">
                <span class="emoji-gray">⏹</span>Autostop
                <span class="custom-tip-box">Automatically stops recording when you stop speaking.</span>
            </span>
            <label class="switch">
                <input type="checkbox" id="modeSwitch" ${isManualStop ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
            <span class="mode-label ${isManualStop ? 'active-mode' : 'inactive-mode'} custom-tip-wrap">
                <span class="emoji-gray">⏹</span>Manual stop
                <span class="custom-tip-box">Records continuously until you click the stop button.</span>
            </span>
        `;
        document.getElementById("modeSwitch").addEventListener("change", e => {
            isManualStop = e.target.checked;
            updateLabels();
        });
    };
    updateLabels();

    // --- Drill Sentences ---
    modelSentences.forEach((itemObj, index) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "drill-row";
        
        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const { htmlParts, speechText } = buildHtmlParts(itemObj);

        topRow.innerHTML = `
            <span class="sentence-number">${index + 1}.</span>
            <span class="tooltip-wrap">
                <button class="listen-btn">🔊 きく</button>
                <span class="tooltip-tip">Listen to model audio</span>
            </span>
            <span class="sentence-label">${htmlParts}</span>
            <button class="record-btn custom-tip-wrap">
                ⏺️とる<span class="custom-tip-box">Start recording your voice.</span>
            </button>
            <button class="stop-btn custom-tip-wrap" disabled>
                <span class="stop-btn-emoji">⏹️</span><span class="custom-tip-box">Stop the active recording.</span>
            </button>
            <div class="result-container">
                <span class="result-text" style="color: var(--text-secondary);">(Not recorded yet)</span>
                <span class="tooltip-wrap">
                    <button class="play-record-btn">▶️</button>
                    <span class="tooltip-tip">Play your recording</span>
                </span>
            </div>
            <div class="meaning-container">
                <span class="tooltip-wrap">
                    <button class="meaning-btn">🌐</button>
                    <span class="tooltip-tip">Translate sentence</span>
                </span>
                <div class="meaning-popup">${itemObj.meaning}</div>
            </div>
        `;
        
        rowDiv.appendChild(topRow);
        drillList.appendChild(rowDiv);
        
        setupRecordingEvents(topRow, itemObj, speechText);
    });
}

// ============================================================================
// CSS Injection
// ============================================================================

const styleElement = document.createElement("style");
styleElement.textContent = `
    .header-panel { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: var(--bg-panel); border-radius: 6px; font-family: sans-serif; border: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px; }
    .control-item { display: flex; align-items: center; gap: 8px; }
    .mode-label { font-weight: bold; font-size: 14px; }
    .mode-label .emoji-gray { filter: grayscale(100%); opacity: 0.55; }
    .mode-label.active-mode .active-mode .emoji-gray { filter: none; opacity: 1; }
    .switch { position: relative; display: inline-block; width: 36px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--button-disabled-bg); transition: .3s; border-radius: 20px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--accent-color); }
    input:checked + .slider:before { transform: translateX(16px); }
    .drill-row { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 12px; background: var(--bg-row); border: 1px solid var(--border-color); border-radius: 6px; font-family: sans-serif; }
    .top-row { display: flex; align-items: center; gap: 12px; width: 100%; flex-wrap: wrap; }
    .sentence-number { font-weight: bold; min-width: 30px; font-size: 16px; color: var(--text-secondary); }
    .sentence-label { font-weight: normal !important; min-width: 220px; font-size: 16px; color: var(--text-primary); }
    button, .play-record-btn, .meaning-btn { padding: 6px 12px; cursor: pointer; border: 1px solid var(--border-color); border-radius: 4px; background: var(--button-bg); color: var(--text-primary); font-size: 14px; line-height: 1.4; display: inline-flex; align-items: center; justify-content: center; }
    button:hover, .play-record-btn:hover, .meaning-btn:hover { background: var(--button-hover); }
    button:disabled { background: var(--button-disabled-bg); color: var(--button-disabled-text); cursor: not-allowed; border-color: var(--border-color); }
    .stop-btn-emoji { filter: grayscale(100%); opacity: 0.55; }
    .stop-btn-active .stop-btn-emoji { filter: none; opacity: 1; }
    .stop-btn-active { background-color: var(--rec-active-bg) !important; color: var(--rec-active-text) !important; border-color: var(--rec-active-bg) !important; font-weight: bold; }
    .play-record-btn { display: none; background-color: var(--button-bg); }
    .result-container { display: flex; align-items: center; gap: 8px; flex-grow: 1; margin-left: 10px; }
    .result-text { font-size: 15px; color: var(--text-primary); font-weight: normal !important; }
    .pronunciation-normal { color: var(--text-primary); font-weight: normal !important; }
    .pronunciation-error { color: var(--error-color, #ef4444); font-weight: normal !important; }
    .pronunciation-missing { color: var(--error-color, #ef4444); font-weight: normal !important; }
    .pronunciation-extra { color: var(--error-color, #ef4444); font-weight: normal !important; }
    .high-pitch { text-decoration: overline; text-decoration-thickness: 1px; font-weight: normal !important; }
    .low-pitch { text-decoration: underline; text-decoration-thickness: 1px; font-weight: normal !important; }
    .meaning-container { position: relative; margin-left: auto; }
    .meaning-popup { display: none; position: absolute; right: 0; bottom: 100%; margin-bottom: 6px; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); white-space: nowrap; font-size: 14px; color: var(--text-primary); z-index: 10; font-weight: normal !important; }
    .meaning-popup.show { display: block; }
    .tooltip-wrap { position: relative; display: inline-block; }
    .tooltip-wrap .tooltip-tip { visibility: hidden; background-color: var(--tooltip-bg, #333); color: var(--tooltip-text, #fff); text-align: center; border-radius: 4px; padding: 4px 8px; position: absolute; z-index: 20; bottom: 125%; left: 50%; transform: translateX(-50%); opacity: 0; transition: opacity 0.3s; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
    .tooltip-wrap:hover .tooltip-tip { visibility: visible; opacity: 1; }
`;
document.head.appendChild(styleElement);

document.addEventListener("DOMContentLoaded", initDrill);
