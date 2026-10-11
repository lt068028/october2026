// ============================================================================
// Pronunciation Practice 2 (安定版：ひらがな抽出・表示切替対応)
// ============================================================================

const drill1Data = [
    { kanji: "天気が、いいです", hira: "てんきが、いいです", text: "て↘んきが｜い↘いいです", color: "#facc15" },
    { kanji: "時間が、ないです", hira: "じかんが、ないです", text: "じ↗かんが｜な↘いです", color: "#34d399" },
    { kanji: "仕事が、ほしいです", hira: "しごとが、ほしいです", text: "し↗ごとは｜ほ↗し↘いです", color: "#22d3ee" },
    { kanji: "先生は、おもしろいです", hira: "せんせいは、おもしろいです", text: "せ↗んせ↘いは｜お↗もしろ↘いです", color: "#e879f9" },
    { kanji: "学校は、たのしいです", hira: "がっこうは、たのしいです", text: "が↗っこうは｜た↗のし↘いです", color: "#fda4af" }
];

let isManualStop = true; 
let isAutoPlay = true; 
let useHiraganaOnly = false;
let activeRecognitionSession = null;

const savedAudioUrls = {};
const savedResults = {}; // 録音結果やHTMLコンテンツを永続化保存

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

// ひらがな変換の安定化（助詞や主要な語彙の揺らぎに対応）
function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    const dict = {
        "天気": "てんき", "時間": "じかん", "仕事": "しごと", "先生": "せんせい", "学校": "がっこう",
        "悪い": "わるい", "傘": "かさ", "良い": "いい", "楽しい": "たのしい", "欲しい": "ほしい", "面白い": "おもしろい"
    };
    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }
    // 文脈上の「は／が」の相互変換に対応しやすくする
    return cleaned;
}

// ピッチアクセントHTMLパーサー
function renderPitchAccentHTML(textStr, color) {
    let resultHTML = '';
    let isHigh = true; 
    
    let i = 0;
    while (i < textStr.length) {
        let ch = textStr[i];
        if (ch === '↘' || ch === '＼') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;
            isHigh = false; 
            i++;
        } else if (ch === '↗' || ch === '/') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;
            isHigh = true; 
            i++;
        } else if (ch === '｜') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 4px;">${ch}</span>`;
            i++;
        } else {
            let nextCh = textStr[i+1];
            let effectiveHigh = isHigh;
            
            if (nextCh === '↘' || nextCh === '＼') {
                effectiveHigh = true; 
            } else if (nextCh === '↗' || nextCh === '/') {
                effectiveHigh = false;
            }
            
            let decorationStyle = effectiveHigh
                ? `text-decoration: overline; text-decoration-color: ${color}; text-decoration-thickness: 2px;`
                : `text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 2px;`;
            
            resultHTML += `<span style="${decorationStyle}">${ch}</span>`;
            i++;
        }
    }
    return resultHTML;
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

// ============================================================================
// Initialization & DOM Setup
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    renderDrill1Section();
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

    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelKanji = document.getElementById("labelKanji");
    const labelHiragana = document.getElementById("labelHiragana");

    if (toggleScriptMode) {
        toggleScriptMode.addEventListener("change", (e) => {
            useHiraganaOnly = e.target.checked;
            updateToggleLabelStyle(labelKanji, !useHiraganaOnly);
            updateToggleLabelStyle(labelHiragana, useHiraganaOnly);
            // 漢字／ひらがな切り替え時、保存された結果を保持したまま再描画
            renderDrill1Section(); 
        });
        updateToggleLabelStyle(labelKanji, !useHiraganaOnly);
        updateToggleLabelStyle(labelHiragana, useHiraganaOnly);
    }
}

function renderDrill1Section() {
    let container = document.getElementById("drill1List");
    if (!container) {
        container = document.createElement("div");
        container.id = "drill1List";
        document.body.insertBefore(container, document.querySelector(".voice-guide-footer"));
    }

    const existingPanel = document.querySelector(".info-panel-task1");
    if (!existingPanel) {
        const infoPanel = document.createElement("div");
        infoPanel.className = "info-panel info-panel-task1";
        infoPanel.style.marginTop = "25px";
        infoPanel.innerHTML = `
            <span class="info-panel-title">Drill 1: Mimic and Compare (Listen & Shadow)</span>
            <span class="info-panel-desc">💡 Listen to the model, mimic the voice and speak aloud.</span>
        `;
        container.parentNode.insertBefore(infoPanel, container);
    }

    container.innerHTML = "";

    drill1Data.forEach((item, index) => {
        createDrill1Row(
            container,
            `${index + 1}.`,
            item,
            index,
            0.9
        );
    });
}

function createDrill1Row(container, indexLabel, item, rowIndex, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the model sentence.</span>';

    listenBtn.onclick = () => {
        const recordBtnEl = rowDiv.querySelector(".play-recording-btn");
        setPlayingStateMultiple([listenBtn, recordBtnEl], "Playing...");
        speakText(item.kanji, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";
    indexSpan.style.marginRight = "6px";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = renderPitchAccentHTML(item.text, item.color);
    promptSpan.style.minWidth = "260px";
    promptSpan.style.paddingLeft = "4px";

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = !isManualStop;

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

    // 既に録音・判定結果が保存されている場合は、切り替えモード（ひらがな/漢字）を反映して復元
    if (savedAudioUrls[rowIndex] && savedResults[rowIndex]) {
        const savedData = savedResults[rowIndex];
        const displayTranscript = useHiraganaOnly ? savedData.hiraText : savedData.rawTranscript;
        resultSpan.innerHTML = displayTranscript + (savedData.isCorrect ? " ✅ " : " ");
        resultSpan.style.color = savedData.textColor;
        appendPersistedButtons(resultSpan, rowIndex, item.kanji, playRate);
    }

    bindDrill1RecorderEvents(
        recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
        item.hira, item.kanji, rowIndex, playRate
    );

    container.appendChild(rowDiv);
}

function appendPersistedButtons(resultSpan, rowIndex, kanjiText, playRate) {
    let playBtn = resultSpan.querySelector(".play-recording-btn");
    if (!playBtn) {
        playBtn = document.createElement("button");
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "8px";
        playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';

        playBtn.onclick = () => {
            const recordedAudioUrl = savedAudioUrls[rowIndex];
            if (recordedAudioUrl) {
                const rowContainer = resultSpan.closest(".drill-row");
                const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
                setPlayingStateMultiple([modelListenBtn, playBtn], "Playing...");
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => { stopAllPlayback(); });
            }
        };
        resultSpan.appendChild(playBtn);
    }
}

function bindDrill1RecorderEvents(
    recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
    expectedHiraText, expectedKanjiText, rowIndex, playRate = 0.9
) {
    let session = null;

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
            stopBtn.disabled = !isManualStop;
            if (!isManualStop) stopBtn.classList.remove("stop-btn-active");
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
                processDrill1Result(
                    currentSession.accumulatedTranscript, expectedHiraText, expectedKanjiText,
                    resultSpan, correctionBox, corrListenBtn, corrTextSpan, rowIndex, playRate
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
                savedAudioUrls[rowIndex] = URL.createObjectURL(audioBlob);
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
        if (!session || session.finished) return;
        if (session.stopRequested) return;
        stopAllPlayback();
        session.stopRequested = true;
        stopBtn.disabled = true;
        requestStop(session, false);
    });
}

function processDrill1Result(
    rawTranscript, expectedHiraText, expectedKanjiText,
    resultSpan, correctionBox, corrListenBtn, corrTextSpan, rowIndex, playRate
) {
    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
        resultSpan.textContent = rawTranscript + " (Too short)";
        resultSpan.style.color = "var(--text-secondary)";
        return;
    }

    const hiraText = convertToHiragana(rawTranscript);
    const expectedHira = convertToHiragana(expectedHiraText);
    const endParticleRegex = "(?:ね|よ|よね|ですね|ですよ)*[.。!]?$";

    const matchRegex = new RegExp(`^${expectedHira}` + endParticleRegex);
    const isCorrect = matchRegex.test(hiraText) || hiraText.includes(expectedHira);

    const displayedTranscript = useHiraganaOnly ? hiraText : rawTranscript;
    const modelSpeechText = expectedKanjiText;

    // 結果を永続保存（切り替え時の保持のため、生テキストとひらがなテキストの両方を保持）
    savedResults[rowIndex] = {
        rawTranscript: rawTranscript,
        hiraText: hiraText,
        isCorrect: isCorrect,
        textColor: isCorrect ? "var(--text-primary)" : "var(--error-text)"
    };

    if (isCorrect) {
        resultSpan.textContent = displayedTranscript + " ✅ ";
        resultSpan.style.color = "var(--text-primary)";
        appendPersistedButtons(resultSpan, rowIndex, expectedKanjiText, playRate);
        correctionBox.style.display = "none";
    } else {
        resultSpan.textContent = displayedTranscript + " ";
        resultSpan.style.color = "var(--error-text)";
        appendPersistedButtons(resultSpan, rowIndex, expectedKanjiText, playRate);
        corrTextSpan.textContent = "🔥 Keep going! Try once more!";
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            const rowContainer = resultSpan.closest(".drill-row");
            const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
            const playBtn = resultSpan.querySelector(".play-recording-btn");
            setPlayingStateMultiple([corrListenBtn, modelListenBtn, playBtn], "Playing...");
            speakText(modelSpeechText, playRate, () => stopAllPlayback());
        };
        correctionBox.style.display = "block";
    }

    if (isAutoPlay) {
        const recordedAudioUrl = savedAudioUrls[rowIndex];
        const rowContainer = resultSpan.closest(".drill-row");
        const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
        const playBtn = resultSpan.querySelector(".play-recording-btn");

        if (recordedAudioUrl && playBtn) {
            setPlayingStateMultiple([modelListenBtn, playBtn], "Playing...");
            speakText(modelSpeechText, playRate, () => {
                stopAllPlayback();
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.playbackRate = 1.0;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => stopAllPlayback());
            });
        }
    }
}
