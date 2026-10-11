// ============================================================================
// Composition 1: English ➡️ Japanese Approach (Example完全排除・クリーン版)
// ============================================================================

const drill1Data = [
    { en: "It's a nice day.", jaKanji: "天気がいいです", jaHira: "てんきがいいです" },
    { en: "I want a watch.", jaKanji: "時計がほしいです", jaHira: "とけいがほしいです" },
    { en: "Work is fun.", jaKanji: "仕事は楽しいです", jaHira: "しごとはたのしいです" },
    { en: "Studying is interesting.", jaKanji: "勉強はおもしろいです", jaHira: "べんきょうはおもしろいです" },
    { en: "Don't you have time?", jaKanji: "時間がないですか", jaHira: "じかんがないですか" },
    { en: "Is the weather bad?", jaKanji: "天気が悪いですか", jaHira: "てんきがわるいですか" },
    { en: "The weather is not good.", jaKanji: "天気が良くないです", jaHira: "てんきがよくないです" },
    { en: "I want an umbrella.", jaKanji: "傘がほしいです", jaHira: "かさがほしいです" }
];

let isManualStop = false;
let isAutoPlay = true; 
let useHiraganaOnly = false; 
let activeRecognitionSession = null;

const savedAudioUrls = {};
const savedResults = {}; 

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
        "天気": "てんき", "時計": "とけい", "仕事": "しごと", "勉強": "べんきょう",
        "時間": "じかん", "悪い": "わるい", "傘": "かさ", "良い": "いい", "良く": "よく", "楽しい": "たのしい",
        "欲しい": "ほしい", "面白い": "おもしろい",
        "私": "わたし", "学生": "がくせい", "先生": "せんせい"
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
            renderAll(); 
        });
        updateToggleLabelStyle(labelKanji, !useHiraganaOnly);
        updateToggleLabelStyle(labelHiragana, useHiraganaOnly);
    }
}

function renderAll() {
    renderDrill1Section();
    renderDrill2Section();
}

function renderDrill1Section() {
    let container = document.getElementById("drill1Container");
    if (!container) {
        container = document.createElement("div");
        container.id = "drill1Container";
        document.body.insertBefore(container, document.getElementById("drill2Container") || document.body.lastChild);
    }
    container.innerHTML = "";

    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task1";
    infoPanel.style.marginTop = "25px";
    infoPanel.innerHTML = `
        <span class="info-panel-title">Drill 1</span>
        <span class="info-panel-desc">💡 Form and speak a Japanese sentence using appropriate i-adjectives based on the given context.</span>
    `;
    container.appendChild(infoPanel);

    // ※ 指示のない勝手な Example ボックスは完全に削除済み

    const listDiv = document.createElement("div");
    listDiv.id = "drill1List";
    container.appendChild(listDiv);

    drill1Data.forEach((item, index) => {
        createDrill1Row(listDiv, `${index + 1}.`, item, index, 0.9);
    });
}

function renderDrill2Section() {
    let container = document.getElementById("drill2Container");
    if (!container) {
        container = document.createElement("div");
        container.id = "drill2Container";
        document.body.insertBefore(container, document.querySelector(".voice-guide-footer"));
    }
    container.innerHTML = "";

    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task2";
    infoPanel.style.marginTop = "30px";
    infoPanel.innerHTML = `
        <span class="info-panel-title">Drill 2: Self-Check with i-Adjective Sentences</span>
        <span class="info-panel-desc">💡 Use this space to record and review how your spoken Japanese sounds.</span>
    `;
    container.appendChild(infoPanel);

    const listDiv = document.createElement("div");
    listDiv.id = "drill2List";
    container.appendChild(listDiv);

    for (let i = 1; i <= 3; i++) {
        createDrill2Row(listDiv, `${i + drill1Data.length}.`, 0.9);
    }
}

function createDrill1Row(container, indexLabel, item, rowIndex, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";
    rowDiv.dataset.rowIndex = rowIndex;

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.textContent = item.en;
    promptSpan.style.minWidth = "220px";

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

    if (savedAudioUrls[rowIndex]) {
        if (savedResults[rowIndex]) {
            resultSpan.innerHTML = savedResults[rowIndex].htmlContent;
            resultSpan.style.color = savedResults[rowIndex].textColor;
        } else {
            resultSpan.textContent = "(Recorded) ✅ ";
            resultSpan.style.color = "var(--text-primary)";
        }
        appendPersistedPlayButton(resultSpan, rowIndex, item.jaKanji, playRate);
    }

    bindDrill1RecorderEvents(
        recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
        item.jaKanji, item.jaHira, rowIndex, playRate
    );

    container.appendChild(rowDiv);
}

function appendPersistedPlayButton(resultSpan, rowIndex, jaKanji, playRate) {
    let playBtn = resultSpan.querySelector(".play-recording-btn");
    let listenBtn = resultSpan.querySelector(".model-listen-btn");

    if (!listenBtn) {
        listenBtn = document.createElement("button");
        listenBtn.className = "example-button model-listen-btn custom-tip-wrap";
        listenBtn.style.marginLeft = "8px";
        listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
        listenBtn.onclick = () => {
            const pBtn = resultSpan.querySelector(".play-recording-btn");
            setPlayingStateMultiple([listenBtn, pBtn], "Playing...");
            speakText(jaKanji, playRate, () => stopAllPlayback());
        };
        resultSpan.appendChild(listenBtn);
    }

    if (!playBtn) {
        playBtn = document.createElement("button");
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "6px";
        playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
        playBtn.onclick = () => {
            const recordedAudioUrl = savedAudioUrls[rowIndex];
            if (recordedAudioUrl) {
                const lBtn = resultSpan.querySelector(".model-listen-btn");
                setPlayingStateMultiple([lBtn, playBtn], "Playing...");
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => stopAllPlayback());
            }
        };
        resultSpan.appendChild(playBtn);
    }
}

function bindDrill1RecorderEvents(
    recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
    jaKanji, jaHira, rowIndex, playRate = 0.9
) {
    let session = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;
        currentSession.finished = true;
        if (currentSession.watchdog !== null) { clearTimeout(currentSession.watchdog); currentSession.watchdog = null; }
        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (e) {}
        }
        if (currentSession.stream) { currentSession.stream.getTracks().forEach(track => track.stop()); }
        if (activeRecognitionSession === currentSession) { activeRecognitionSession = null; }
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
        if (activeRecognitionSession !== null) { releaseSession(activeRecognitionSession); }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            resultSpan.textContent = "Speech recognition is not supported.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        let stream;
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } 
        catch (err) {
            resultSpan.textContent = "Microphone access denied or unavailable.";
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
                    currentSession.accumulatedTranscript, jaKanji, jaHira, rowIndex,
                    resultSpan, correctionBox, corrListenBtn, corrTextSpan, playRate
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
                const audioUrl = URL.createObjectURL(audioBlob);
                savedAudioUrls[rowIndex] = audioUrl;
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
    rawTranscript, jaKanji, jaHira, rowIndex,
    resultSpan, correctionBox, corrListenBtn, corrTextSpan, playRate
) {
    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
        resultSpan.textContent = rawTranscript + " (Too short)";
        resultSpan.style.color = "var(--text-secondary)";
        return;
    }

    const hiraText = convertToHiragana(rawTranscript);
    const expectedHira = convertToHiragana(jaHira);

    const expectedHiraAlt = expectedHira.replace(/が/g, "は");
    const expectedHiraAlt2 = expectedHira.replace(/は/g, "が");

    const endParticleRegex = "(?:ね|よ|よね|ですね|ですよ)*[.。!]?$";
    const matchRegex1 = new RegExp(`^${expectedHira}` + endParticleRegex);
    const matchRegex2 = new RegExp(`^${expectedHiraAlt}` + endParticleRegex);
    const matchRegex3 = new RegExp(`^${expectedHiraAlt2}` + endParticleRegex);

    const isExactMatch = matchRegex1.test(hiraText) || hiraText.includes(expectedHira);
    const isAltMatch = matchRegex2.test(hiraText) || matchRegex3.test(hiraText) || hiraText.includes(expectedHiraAlt) || hiraText.includes(expectedHiraAlt2);
    const isCorrect = isExactMatch || isAltMatch;

    const displayedTranscript = useHiraganaOnly ? hiraText : rawTranscript;
    const modelSpeechText = jaKanji;

    if (isCorrect) {
        let innerHtml = "";
        let tColor = "var(--text-primary)";
        if (isAltMatch && !isExactMatch) {
            let highlightedHtml = "";
            for (let i = 0; i < hiraText.length; i++) {
                if (i < expectedHira.length && hiraText[i] === expectedHira[i]) {
                    highlightedHtml += hiraText[i];
                } else if (i < expectedHira.length && (
                    (expectedHira[i] === 'が' && hiraText[i] === 'は') || 
                    (expectedHira[i] === 'は' && hiraText[i] === 'が')
                )) {
                    highlightedHtml += `<span style="color: #38bdf8; font-weight: bold;">${hiraText[i]}</span>`;
                } else {
                    highlightedHtml += hiraText[i];
                }
            }
            innerHtml = highlightedHtml + " ✅ <br><span style='font-size: 11px; color: #38bdf8;'>(Both 'ga' and 'wa' are correct in this context)</span>";
        } else {
            innerHtml = displayedTranscript + " ✅ ";
        }

        resultSpan.innerHTML = innerHtml;
        resultSpan.style.color = tColor;

        savedResults[rowIndex] = { htmlContent: innerHtml, textColor: tColor };

        appendPersistedPlayButton(resultSpan, rowIndex, jaKanji, playRate);
        correctionBox.style.display = "none";
    } else {
        let highlightedHtml = "";
        for (let i = 0; i < hiraText.length; i++) {
            if (i < expectedHira.length && hiraText[i] === expectedHira[i]) {
                highlightedHtml += hiraText[i];
            } else {
                highlightedHtml += `<span style="color: var(--error-text);">${hiraText[i]}</span>`;
            }
        }

        resultSpan.innerHTML = highlightedHtml + " ";
        resultSpan.style.color = "var(--error-text)";

        savedResults[rowIndex] = { htmlContent: highlightedHtml + " ", textColor: "var(--error-text)" };

        appendPersistedPlayButton(resultSpan, rowIndex, jaKanji, playRate);
        corrTextSpan.textContent = "🔥 Keep going! Try once more!";
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            const listenBtn = resultSpan.querySelector(".model-listen-btn");
            const playBtn = resultSpan.querySelector(".play-recording-btn");
            setPlayingStateMultiple([corrListenBtn, listenBtn, playBtn], "Playing...");
            speakText(modelSpeechText, playRate, () => stopAllPlayback());
        };
        correctionBox.style.display = "block";
    }

    if (isAutoPlay) {
        const recordedAudioUrl = savedAudioUrls[rowIndex];
        const listenBtn = resultSpan.querySelector(".model-listen-btn");
        const playBtn = resultSpan.querySelector(".play-recording-btn");
        if (recordedAudioUrl && playBtn) {
            setPlayingStateMultiple([listenBtn, playBtn], "Playing...");
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

function createDrill2Row(container, indexLabel, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const inputEn = document.createElement("input");
    inputEn.type = "text";
    inputEn.className = "custom-input";
    inputEn.placeholder = "Enter text or notes here (optional)...";
    inputEn.style.flex = "1";
    inputEn.style.minWidth = "260px";

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

    topRow.appendChild(indexSpan);
    topRow.appendChild(inputEn);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

    rowDiv.appendChild(topRow);
    bindDrill2RecorderEvents(recordBtn, stopBtn, resultSpan, playRate);
    container.appendChild(rowDiv);
}

function bindDrill2RecorderEvents(recordBtn, stopBtn, resultSpan, playRate = 0.9) {
    let session = null;
    let lastAudioUrl = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;
        currentSession.finished = true;
        if (currentSession.watchdog !== null) { clearTimeout(currentSession.watchdog); currentSession.watchdog = null; }
        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (e) {}
        }
        if (currentSession.stream) { currentSession.stream.getTracks().forEach(track => track.stop()); }
        if (activeRecognitionSession === currentSession) { activeRecognitionSession = null; }
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
        if (activeRecognitionSession !== null) { releaseSession(activeRecognitionSession); }

        let stream;
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } 
        catch (err) {
            resultSpan.textContent = "Microphone access denied.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (lastAudioUrl) { URL.revokeObjectURL(lastAudioUrl); lastAudioUrl = null; }

        const currentSession = {
            finished: false, stopRequested: false, errorMessage: "",
            watchdog: null, mediaRecorder: null, audioChunks: [], stream: stream
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        try {
            const mediaRecorder = new MediaRecorder(stream);
            currentSession.mediaRecorder = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) currentSession.audioChunks.push(e.data); };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(currentSession.audioChunks, { type: "audio/webm" });
                lastAudioUrl = URL.createObjectURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                
                resultSpan.textContent = "Recorded ✅ ";
                resultSpan.style.color = "var(--text-primary)";

                let playBtn = resultSpan.querySelector(".play-recording-btn");
                if (!playBtn) {
                    playBtn = document.createElement("button");
                    playBtn.className = "example-button play-recording-btn custom-tip-wrap";
                    playBtn.style.marginLeft = "8px";
                    playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
                    playBtn.onclick = () => {
                        if (lastAudioUrl) {
                            setPlayingStateMultiple([playBtn], "Playing...");
                            const audio = new Audio(lastAudioUrl);
                            currentPlayingAudio = audio;
                            audio.onended = () => stopAllPlayback();
                            audio.play().catch(e => stopAllPlayback());
                        }
                    };
                    resultSpan.appendChild(playBtn);
                }

                if (isAutoPlay) {
                    setPlayingStateMultiple([playBtn], "Playing...");
                    const audio = new Audio(lastAudioUrl);
                    currentPlayingAudio = audio;
                    audio.playbackRate = 1.0;
                    audio.onended = () => stopAllPlayback();
                    audio.play().catch(e => stopAllPlayback());
                }

                releaseSession(currentSession);
            };

            recordBtn.disabled = true;
            stopBtn.disabled = !isManualStop;
            if (isManualStop) stopBtn.classList.add("stop-btn-active");
            else stopBtn.classList.remove("stop-btn-active");

            resultSpan.textContent = "Recording...";
            resultSpan.style.color = "var(--accent-color)";

            mediaRecorder.start();

            if (!isManualStop) {
                setTimeout(() => {
                    if (currentSession.mediaRecorder && currentSession.mediaRecorder.state === "recording") {
                        currentSession.mediaRecorder.stop();
                    }
                }, 3000);
            }
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
        releaseSession(session);
    });
}
