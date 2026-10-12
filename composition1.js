// ============================================================================
// Composition 1: English ➡️ Japanese Approach (安定版)
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

    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");

    const dict = {
        "天気": "てんき",
        "時計": "とけい",
        "仕事": "しごと",
        "勉強": "べんきょう",
        "時間": "じかん",
        "悪い": "わるい",
        "傘": "かさ",
        "良い": "いい",
        "良く": "よく",
        "楽しい": "たのしい",
        "欲しい": "ほしい",
        "面白い": "おもしろい",
        "私": "わたし",
        "学生": "がくせい",
        "先生": "せんせい"
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
        document.body.insertBefore(
            container,
            document.getElementById("drill2Container") || document.body.lastChild
        );
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
        document.body.insertBefore(
            container,
            document.querySelector(".voice-guide-footer")
        );
    }

    container.innerHTML = "";

    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task2";
    infoPanel.style.marginTop = "30px";

    infoPanel.innerHTML = `
        <span class="info-panel-title">Drill 2: Self-Check Your Sounds</span>
        <span class="info-panel-desc">💡 Use this space to record and review how your spoken Japanese sounds.</span>
    `;

    container.appendChild(infoPanel);

    const listDiv = document.createElement("div");
    listDiv.id = "drill2List";
    container.appendChild(listDiv);

    // Drill 2 は入力欄と録音操作を1組だけ表示する。
    createDrill2Row(listDiv, `${drill1Data.length + 1}.`, 0.9);
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
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        item.jaKanji,
        item.jaHira,
        rowIndex,
        playRate
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
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    jaKanji,
    jaHira,
    rowIndex,
    playRate = 0.9
) {
    let localSession = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;

        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
        }

        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
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

        if (localSession === currentSession) {
            localSession = null;
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
            resultSpan.textContent = "Microphone access denied or unavailable.";
            resultSpan.style.color = "var(--error-text)";
            return;
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

        localSession = currentSession;
        activeRecognitionSession = currentSession;

        const tryProcessResult = () => {
            if (currentSession.errorMessage || currentSession.processed) return;

            if (currentSession.recognitionDone && currentSession.recorderDone) {
                currentSession.processed = true;

                let playBtn = resultSpan.querySelector(".play-recording-btn");

                if (!playBtn) {
                    resultSpan.textContent =
                        "Recording saved. Play it back to review your pronunciation.";
                    resultSpan.style.color = "var(--text-primary)";

                    playBtn = document.createElement("button");
                    playBtn.className =
                        "example-button play-recording-btn custom-tip-wrap";
                    playBtn.style.marginLeft = "8px";
                    playBtn.innerHTML =
                        '▶️<span class="custom-tip-box">Play your recorded voice</span>';

                    playBtn.onclick = () => {
                        const recordedAudioUrl = savedAudioUrls[drill1Data.length];

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

                const audioUrl = URL.createObjectURL(audioBlob);
                savedAudioUrls[rowIndex] = audioUrl;

                stream.getTracks().forEach(track => track.stop());

                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onerror = (event) => {
                if (currentSession.finished || localSession !== currentSession) return;
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
        if (!localSession || localSession.finished) return;
        if (localSession.stopRequested) return;

        stopAllPlayback();

        localSession.stopRequested = true;
        stopBtn.disabled = true;

        requestStop(localSession, false);
    });
}

// ============================================================================
// Drill 2: Self-Check Your Sounds
// 録音音源を保存し、自分で再生して確認する。正誤判定は行わない。
// ============================================================================

function createDrill2Row(container, indexLabel, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const rowIndex = drill1Data.length;

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    // 練習する文の参照用入力欄。判定には使用しない。
    const inputEn = document.createElement("input");
    inputEn.type = "text";
    inputEn.className = "custom-input";
    inputEn.placeholder = "Japanese sentence for your reference (optional)...";
    inputEn.style.flex = "1";
    inputEn.style.minWidth = "260px";

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
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

    bindDrill2RecorderEvents(
        recordBtn,
        stopBtn,
        resultSpan,
        inputEn,
        rowIndex,
        playRate
    );

    container.appendChild(rowDiv);
}

function bindDrill2RecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    inputEn,
    rowIndex,
    playRate = 0.9
) {
    // inputEn is retained only as a visual reference; it is not used for judgment.
    let localSession = null;

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

        if (localSession === currentSession) {
            localSession = null;
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
            resultSpan.textContent = "Microphone access denied or unavailable.";
            resultSpan.style.color = "var(--error-text)";
            return;
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
            recognitionDone: false,
            recorderDone: false,
            processed: false
        };

        localSession = currentSession;
        activeRecognitionSession = currentSession;

        const tryProcessResult = () => {
            if (currentSession.errorMessage || currentSession.processed) return;

            if (currentSession.recognitionDone && currentSession.recorderDone) {
                currentSession.processed = true;

                resultSpan.textContent =
                    "Recording saved. Play it back to review your pronunciation.";
                resultSpan.style.color = "var(--text-primary)";

                let playBtn = resultSpan.querySelector(".play-recording-btn");

                if (!playBtn) {
                    playBtn = document.createElement("button");
                    playBtn.className =
                        "example-button play-recording-btn custom-tip-wrap";
                    playBtn.style.marginLeft = "8px";
                    playBtn.innerHTML =
                        '▶️<span class="custom-tip-box">Play your recorded voice</span>';

                    playBtn.onclick = () => {
                        const recordedAudioUrl = savedAudioUrls[rowIndex];

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
        };

        try {
            const currentRecognition = new SpeechRecognition();
            currentSession.recognition = currentRecognition;

            // 音声認識は録音停止タイミングの検出に使用する。
            // 認識テキストの表示や、入力文との正誤比較は行わない。
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

                const audioUrl = URL.createObjectURL(audioBlob);
                savedAudioUrls[rowIndex] = audioUrl;

                stream.getTracks().forEach(track => track.stop());

                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onerror = (event) => {
                if (currentSession.finished || localSession !== currentSession) return;
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

            mediaRecorder.start();
            currentRecognition.start();
        } catch (err) {
            requestStop(currentSession, true, "Could not start recording.");
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!localSession || localSession.finished) return;
        if (localSession.stopRequested) return;

        stopAllPlayback();

        localSession.stopRequested = true;
        stopBtn.disabled = true;

        requestStop(localSession, false);
    });
}
