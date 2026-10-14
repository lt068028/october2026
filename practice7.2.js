// ============================================================================
// Practice 7.2: ているform② present perfect
// ============================================================================

const practice7Data = [
    { 
        x: "よる10じ", xKanji: "夜10時", xRomaji: "yoru jū-ji", xMeaning: "10 o'clock at night", 
        y: "ねる", yKanji: "寝る", yRomaji: "neru", yMeaning: "to sleep / go to bed",
        pastSentence: "夜10時に寝ました。",
        pastSentenceHira: "よる10じに、ねました。",
        perfectSentence: "夜10時から寝ています。",
        perfectSentenceHira: "よる10じから、ねています。"
    },
    { 
        x: "さっき", xKanji: "さっき", xRomaji: "sakki", xMeaning: "a little while ago", 
        y: "Tシャツをきる", yKanji: "Tシャツを着る", yRomaji: "tīshatsu o kiru", yMeaning: "to wear a T-shirt",
        pastSentence: "さっきTシャツを着ました。",
        pastSentenceHira: "さっきTしゃつを、きました。",
        perfectSentence: "さっきからTシャツを着ています。",
        perfectSentenceHira: "さっきから、Tしゃつを、きています。"
    }
];

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "kanji"; // デフォルトはWith漢字
let isAutoPlay = true;
let activeRecognitionSession = null;

const practice7State = {
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
            selected = voices.find(v => v.name && v.name.toLowerCase().includes("keita"));
        }
        if (!selected) {
            selected = voices.find(v => v.name && v.name.toLowerCase().includes("nanami"));
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

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    cleaned = cleaned.replace(/わ$/g, "は");
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
            box.style.display = box.style.display === "none" ? "block" : "none";
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

function initSettingsPanel() {
    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelHiraganaOnly = document.getElementById("labelHiraganaOnly");
    const labelWithKanji = document.getElementById("labelWithKanji");

    if (toggleScriptMode) {
        scriptMode = toggleScriptMode.checked ? "kanji" : "hiragana";
        updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
        updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");

        toggleScriptMode.addEventListener("change", (e) => {
            scriptMode = e.target.checked ? "kanji" : "hiragana";
            updateToggleLabelStyle(labelHiraganaOnly, scriptMode === "hiragana");
            updateToggleLabelStyle(labelWithKanji, scriptMode === "kanji");
            renderAll();
        });
    }

    const toggleHintMode = document.getElementById("toggleHintMode");
    const labelHoverHint = document.getElementById("labelHoverHint");
    const labelParenHint = document.getElementById("labelParenHint");

    if (toggleHintMode) {
        hintMode = toggleHintMode.checked ? "paren" : "hover";
        updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
        updateToggleLabelStyle(labelParenHint, hintMode === "paren");

        toggleHintMode.addEventListener("change", (e) => {
            hintMode = e.target.checked ? "paren" : "hover";
            updateToggleLabelStyle(labelHoverHint, hintMode === "hover");
            updateToggleLabelStyle(labelParenHint, hintMode === "paren");
            renderAll();
        });
    }

    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");
    const labelManualRecord = document.getElementById("labelManualRecord");

    if (toggleRecordMode) {
        isManualStop = toggleRecordMode.checked;
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        updateToggleLabelStyle(labelManualRecord, isManualStop);

        toggleRecordMode.addEventListener("change", (e) => {
            isManualStop = e.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
            updateToggleLabelStyle(labelManualRecord, isManualStop);
        });
    }

    const togglePlaybackMode = document.getElementById("togglePlaybackMode");
    const labelAutoPlay = document.getElementById("labelAutoPlay");
    const labelManualPlay = document.getElementById("labelManualPlay");

    if (togglePlaybackMode) {
        isAutoPlay = !togglePlaybackMode.checked;
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        updateToggleLabelStyle(labelManualPlay, !isAutoPlay);

        togglePlaybackMode.addEventListener("change", (e) => {
            isAutoPlay = !e.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
            updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
        });
    }
}

function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;

    labelEl.className = `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
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

function renderAll() {
    renderDrill1Section();
}

// ============================================================================
// Render Drill 1 Section (Past & Present Perfect Practice)
// ============================================================================
function renderDrill1Section() {
    let container = document.getElementById("drill1Container");

    if (!container) {
        container = document.createElement("div");
        container.id = "drill1Container";
        document.body.insertBefore(container, document.querySelector(".voice-guide-footer"));
    }

    container.innerHTML = "";

    // Example Box (きくボタンの右に見出し、指定部分の太字化)
    const exBox = document.createElement("div");
    exBox.className = "example-box";
    exBox.style.marginTop = "30px";

    const w1 = formatWord("よる10じ", "夜10時", "yoru jū-ji", "10 o'clock at night");
    const w2 = formatWord("ねる", "寝る", "neru", "to sleep");

    exBox.innerHTML = `
        <div class="example-line flex-row-center" style="margin-bottom: 8px;">
            <strong class="example-label-title" style="min-width: 130px;">Past Tense:</strong>
            ${w1} ／ ${w2}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="exPastListen" class="example-button">🔊きく</button>
            <span style="display:inline-block; padding:4px 8px; margin:0 6px; border-radius:4px; background:#bae6fd; color:#0369a1; font-size:13px; font-weight:bold;">⏪ Past</span>
            <span>${w1}に寝<strong>ました。</strong></span>
        </div>

        <div class="example-line dashed-border flex-row-center" style="padding-top: 10px;">
            <strong class="example-label-title" style="min-width: 130px;">Present Perfect:</strong>
            ${w1} ／ ${w2}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="exPerfListen" class="example-button">🔊きく</button>
            <span style="display:inline-block; padding:4px 8px; margin:0 6px; border-radius:4px; background:#dcfce7; color:#15803d; font-size:13px; font-weight:bold;">⏳ Perfect</span>
            <span>${w1}<strong>から</strong>寝<strong>ています。</strong></span>
        </div>
    `;

    container.appendChild(exBox);

    document.getElementById("exPastListen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("exPastListen")], "Playing...");
        speakText("夜10実に寝ました。", 0.9, () => stopAllPlayback());
    };

    document.getElementById("exPerfListen").onclick = () => {
        setPlayingStateMultiple([document.getElementById("exPerfListen")], "Playing...");
        speakText("夜10時から寝ています。", 0.9, () => stopAllPlayback());
    };

    // Info Panel
    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task1";
    infoPanel.style.marginTop = "25px";

    infoPanel.innerHTML = `
        <span class="info-panel-title">Drill 1: Compare Past & Present Perfect</span>
        <span class="info-panel-desc">
            💡 Compare past actions with ongoing states using ているform.
        </span>
    `;

    container.appendChild(infoPanel);

    const listDiv = document.createElement("div");
    listDiv.id = "drill1List";
    container.appendChild(listDiv);

    practice7Data.forEach((item, index) => {
        createPractice7TableCard(listDiv, `${index + 1}.`, item, index, 0.9);
    });
}

function createPractice7TableCard(container, indexLabel, item, rowIndex, playRate) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "drill-row";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // ----------------------------------------------------
    // 1行目: Past
    // ----------------------------------------------------
    const tr1 = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.rowSpan = 2;
    tdIndex.textContent = indexLabel;
    tdIndex.style.fontWeight = "bold";
    tdIndex.style.verticalAlign = "middle";
    tdIndex.style.width = "30px";
    tdIndex.style.paddingRight = "4px";

    const tdPrompt = document.createElement("td");
    tdPrompt.rowSpan = 2;
    tdPrompt.className = "prompt-label";
    tdPrompt.innerHTML = `${formatWord(item.x, item.xKanji, item.xRomaji, item.xMeaning)} ／ ${formatWord(item.y, item.yKanji, item.yRomaji, item.yMeaning)}`;
    tdPrompt.style.verticalAlign = "middle";
    tdPrompt.style.width = "220px";
    tdPrompt.style.paddingRight = "10px";

    const tdPastControls = document.createElement("td");
    tdPastControls.style.paddingBottom = "4px";
    tdPastControls.style.whiteSpace = "nowrap";

    const listenBtn1 = document.createElement("button");
    listenBtn1.className = "example-button custom-tip-wrap";
    listenBtn1.innerHTML = '🔊きく<span class="custom-tip-box">Listen to past tense.</span>';

    const pastLabel = document.createElement("span");
    pastLabel.style.fontWeight = "bold";
    pastLabel.style.display = "inline-block";
    pastLabel.style.padding = "4px 8px";
    pastLabel.style.margin = "0 6px";
    pastLabel.style.borderRadius = "4px";
    pastLabel.style.backgroundColor = "#bae6fd";
    pastLabel.style.color = "#0369a1";
    pastLabel.style.fontSize = "13px";
    pastLabel.innerHTML = "⏪ Past";

    const recordBtn1 = document.createElement("button");
    recordBtn1.className = "example-button custom-tip-wrap";
    recordBtn1.innerHTML = '⏺️とる<span class="custom-tip-box">Record past tense.</span>';

    const stopBtn1 = document.createElement("button");
    stopBtn1.className = "example-button custom-tip-wrap";
    stopBtn1.innerHTML = '⏹️<span class="custom-tip-box">Stop active recording.</span>';
    stopBtn1.disabled = true;

    const rightWrapper1 = document.createElement("span");
    rightWrapper1.style.float = "right";
    rightWrapper1.style.display = "inline-flex";
    rightWrapper1.style.alignItems = "center";

    const resultSpan1 = document.createElement("span");
    resultSpan1.className = "result-text";
    resultSpan1.textContent = "(Not recorded yet)";
    resultSpan1.style.color = "var(--text-secondary)";
    resultSpan1.style.marginLeft = "8px";

    rightWrapper1.appendChild(resultSpan1);

    listenBtn1.onclick = () => {
        setPlayingStateMultiple([listenBtn1], "Playing...");
        speakText(item.pastSentence, playRate, () => stopAllPlayback());
    };

    tdPastControls.appendChild(listenBtn1);
    tdPastControls.appendChild(pastLabel);
    tdPastControls.appendChild(recordBtn1);
    tdPastControls.appendChild(stopBtn1);
    tdPastControls.appendChild(rightWrapper1);

    tr1.appendChild(tdIndex);
    tr1.appendChild(tdPrompt);
    tr1.appendChild(tdPastControls);
    table.appendChild(tr1);

    const correctionBox1 = document.createElement("div");
    correctionBox1.className = "correction-box";
    const corrListenBtn1 = document.createElement("button");
    corrListenBtn1.className = "example-button";
    corrListenBtn1.innerHTML = "🔊 きく";
    corrListenBtn1.style.marginRight = "8px";
    const corrTextSpan1 = document.createElement("span");
    correctionBox1.appendChild(corrListenBtn1);
    correctionBox1.appendChild(corrTextSpan1);

    bindRecorderEvents(
        recordBtn1, stopBtn1, resultSpan1, correctionBox1, corrListenBtn1, corrTextSpan1,
        () => item.pastSentenceHira,
        () => item.pastSentence,
        playRate,
        `p7_drill_past_${rowIndex}`
    );

    // ----------------------------------------------------
    // 2行目: Perfect
    // ----------------------------------------------------
    const tr2 = document.createElement("tr");
    tr2.style.borderTop = "1px dashed var(--border-color)";

    const tdPerfControls = document.createElement("td");
    tdPerfControls.style.paddingTop = "4px";
    tdPerfControls.style.whiteSpace = "nowrap";

    const listenBtn2 = document.createElement("button");
    listenBtn2.className = "example-button custom-tip-wrap";
    listenBtn2.innerHTML = '🔊きく<span class="custom-tip-box">Listen to present perfect.</span>';

    const perfLabel = document.createElement("span");
    perfLabel.style.fontWeight = "bold";
    perfLabel.style.display = "inline-block";
    perfLabel.style.padding = "4px 8px";
    perfLabel.style.margin = "0 6px";
    perfLabel.style.borderRadius = "4px";
    perfLabel.style.backgroundColor = "#dcfce7";
    perfLabel.style.color = "#15803d";
    perfLabel.style.fontSize = "13px";
    perfLabel.innerHTML = "⏳ Perfect";

    const recordBtn2 = document.createElement("button");
    recordBtn2.className = "example-button custom-tip-wrap";
    recordBtn2.innerHTML = '⏺️とる<span class="custom-tip-box">Record present perfect.</span>';

    const stopBtn2 = document.createElement("button");
    stopBtn2.className = "example-button custom-tip-wrap";
    stopBtn2.innerHTML = '⏹️<span class="custom-tip-box">Stop active recording.</span>';
    stopBtn2.disabled = true;

    const rightWrapper2 = document.createElement("span");
    rightWrapper2.style.float = "right";
    rightWrapper2.style.display = "inline-flex";
    rightWrapper2.style.alignItems = "center";

    const resultSpan2 = document.createElement("span");
    resultSpan2.className = "result-text";
    resultSpan2.textContent = "(Not recorded yet)";
    resultSpan2.style.color = "var(--text-secondary)";
    resultSpan2.style.marginLeft = "8px";

    rightWrapper2.appendChild(resultSpan2);

    listenBtn2.onclick = () => {
        setPlayingStateMultiple([listenBtn2], "Playing...");
        speakText(item.perfectSentence, playRate, () => stopAllPlayback());
    };

    tdPerfControls.appendChild(listenBtn2);
    tdPerfControls.appendChild(perfLabel);
    tdPerfControls.appendChild(recordBtn2);
    tdPerfControls.appendChild(stopBtn2);
    tdPerfControls.appendChild(rightWrapper2);

    tr2.appendChild(tdPerfControls);
    table.appendChild(tr2);

    const correctionBox2 = document.createElement("div");
    correctionBox2.className = "correction-box";
    const corrListenBtn2 = document.createElement("button");
    corrListenBtn2.className = "example-button";
    corrListenBtn2.innerHTML = "🔊 きく";
    corrListenBtn2.style.marginRight = "8px";
    const corrTextSpan2 = document.createElement("span");
    correctionBox2.appendChild(corrListenBtn2);
    correctionBox2.appendChild(corrTextSpan2);

    bindRecorderEvents(
        recordBtn2, stopBtn2, resultSpan2, correctionBox2, corrListenBtn2, corrTextSpan2,
        () => item.perfectSentenceHira,
        () => item.perfectSentence,
        playRate,
        `p7_drill_perf_${rowIndex}`
    );

    cardDiv.appendChild(table);
    cardDiv.appendChild(correctionBox1);
    cardDiv.appendChild(correctionBox2);
    container.appendChild(cardDiv);
}

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
    rowKey
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
            if (abort) currentRecognition.abort();
            else currentRecognition.stop();
        } catch (err) {}

        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (err) {}
        }
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;

        stopAllPlayback();

        if (activeRecognitionSession !== null) {
            releaseSession(activeRecognitionSession);
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
                    rowKey
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

                if (rowKey) {
                    practice7State.audioUrls[rowKey] = lastAudioUrl;
                }

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

            currentRecognition.onerror = () => {
                if (currentSession.finished || session !== currentSession) return;
                requestStop(currentSession, true, "Recognition error.");
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
    rawTranscript,
    expectedText,
    getExpectedKanjiFn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getUrlFn,
    playRate,
    rowKey
) {
    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
        resultSpan.textContent = rawTranscript + " (Too short)";
        resultSpan.style.color = "var(--text-secondary)";
        return;
    }

    const hiraText = convertToHiragana(rawTranscript);
    const expectedHira = convertToHiragana(expectedText);
    const isCorrect = hiraText.includes(expectedHira) || hiraText.length >= 2;

    const displayedTranscript = scriptMode === "hiragana" ? hiraText : rawTranscript;
    const kanjiTextForSpeech = getExpectedKanjiFn();

    if (isCorrect) {
        resultSpan.textContent = displayedTranscript + " ✅ ";
        resultSpan.style.color = "var(--text-primary)";
        appendPersistedPlayButton(resultSpan, rowKey || "temp_res", playRate);
        correctionBox.style.display = "none";
    } else {
        resultSpan.textContent = displayedTranscript + " ";
        resultSpan.style.color = "var(--error-text)";
        appendPersistedPlayButton(resultSpan, rowKey || "temp_res", playRate);

        corrTextSpan.textContent = "🔥 Keep going! Try once more!";
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
                audio.playbackRate = 1.0;
                audio.onended = () => { currentPlayingAudio = null; };
                audio.play().catch(e => {});
            }
        });
    }
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
    let playBtn = resultSpan.querySelector(".play-recording-btn");

    if (!playBtn) {
        playBtn = document.createElement("button");
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "8px";
        playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';

        playBtn.onclick = () => {
            const recordedAudioUrl = practice7State.audioUrls[rowKey];
            if (recordedAudioUrl) {
                setPlayingStateMultiple([playBtn], "Playing...");
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => stopAllPlayback());
            }
        };

        resultSpan.appendChild(playBtn);
    }
}
