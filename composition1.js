// ============================================================================
// Composition 1: English ➡️ Japanese Approach (安定版 - Hiragana Only表示変更対応)
// ============================================================================

const drill1Data = [
    { en: "It's a nice day.", jaKanji: "天気がいいです", jaHira: "てんきが、いいです" },
    { en: "I want a watch.", jaKanji: "時計がほしいです", jaHira: "とけいが、ほしいです" },
    { en: "Work is fun.", jaKanji: "仕事は楽しいです", jaHira: "しごとは、たのしいです" },
    { en: "Studying is interesting.", jaKanji: "勉強はおもしろいです", jaHira: "べんきょうは、おもしろいです" },
    { en: "Don't you have time?", jaKanji: "時間がないですか", jaHira: "じかんが、ないですか" },
    { en: "Is the weather bad?", jaKanji: "天気が悪いですか", jaHira: "てんきが、わるいですか" },
    { en: "The weather is not good.", jaKanji: "天気が良くないです", jaHira: "てんきが、よくないです" },
    { en: "I want an umbrella.", jaKanji: "傘がほしいです", jaHira: "かさが、ほしいです" }
];

let isManualStop = false;
let isAutoPlay = true;
let useHiraganaOnly = false;
let activeRecognitionSession = null;

const savedAudioUrls = {};
const savedResults = {};
const drill2State = {
    transcript: "",
    inputVal: "",
    persistedDisplay: ""
};

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
        if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
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
                audio.onerror = () => stopAllPlayback();
                audio.play().catch(() => stopAllPlayback());
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
            currentSession.stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {}
            });
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
            const previousSession = activeRecognitionSession;

            if (typeof previousSession.forceStop === "function") {
                previousSession.forceStop();
            } else {
                releaseSession(previousSession);
            }
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

        currentSession.forceStop = () => {
            requestStop(currentSession, true);
            releaseSession(currentSession);
        };

        const tryProcessResult = () => {
            if (currentSession.errorMessage || currentSession.processed) return;

            if (currentSession.recognitionDone && currentSession.recorderDone) {
                currentSession.processed = true;

                processDrill1Result(
                    currentSession.accumulatedTranscript,
                    jaKanji,
                    jaHira,
                    rowIndex,
                    resultSpan,
                    correctionBox,
                    corrListenBtn,
                    corrTextSpan,
                    playRate
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
                if (e.data.size > 0) currentSession.audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(currentSession.audioChunks, { type: "audio/webm" });

                if (audioBlob.size > 0) {
                    const audioUrl = URL.createObjectURL(audioBlob);

                    if (savedAudioUrls[rowIndex]) {
                        URL.revokeObjectURL(savedAudioUrls[rowIndex]);
                    }

                    savedAudioUrls[rowIndex] = audioUrl;
                }

                stream.getTracks().forEach(track => {
                    try {
                        track.stop();
                    } catch (e) {}
                });

                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onresult = (event) => {
                if (
                    currentSession.finished ||
                    localSession !== currentSession ||
                    currentSession.errorMessage
                ) {
                    return;
                }

                let rawTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        rawTranscript += event.results[i][0].transcript;
                    }
                }

                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = () => {
                if (currentSession.finished || localSession !== currentSession) return;
                requestStop(currentSession, true, "Recognition error.");
            };

            currentRecognition.onend = () => {
                if (currentSession.finished) return;

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
        if (!localSession || localSession.finished) return;
        if (localSession.stopRequested) return;

        stopAllPlayback();
        localSession.stopRequested = true;
        stopBtn.disabled = true;

        requestStop(localSession, false);
    });
}

function processDrill1Result(
    rawTranscript,
    jaKanji,
    jaHira,
    rowIndex,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    playRate
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
    const isAltMatch =
        matchRegex2.test(hiraText) ||
        matchRegex3.test(hiraText) ||
        hiraText.includes(expectedHiraAlt) ||
        hiraText.includes(expectedHiraAlt2);

    const isCorrect = isExactMatch || isAltMatch;

    const displayedTranscript = useHiraganaOnly ? hiraText : rawTranscript;
    const modelSpeechText = jaKanji;

    if (isCorrect) {
        let innerHtml = "";
        const tColor = "var(--text-primary)";

        if (isAltMatch && !isExactMatch) {
            let highlightedHtml = "";

            for (let i = 0; i < hiraText.length; i++) {
                if (i < expectedHira.length && hiraText[i] === expectedHira[i]) {
                    highlightedHtml += hiraText[i];
                } else if (
                    i < expectedHira.length &&
                    (
                        (expectedHira[i] === "が" && hiraText[i] === "は") ||
                        (expectedHira[i] === "は" && hiraText[i] === "が")
                    )
                ) {
                    highlightedHtml += `<span style="color: #38bdf8; font-weight: bold;">${hiraText[i]}</span>`;
                } else {
                    highlightedHtml += hiraText[i];
                }
            }

            innerHtml = highlightedHtml +
                " ✅ <br><span style='font-size: 11px; color: #38bdf8;'>(Both 'ga' and 'wa' are correct in this context)</span>";
        } else {
            innerHtml = displayedTranscript + " ✅ ";
        }

        resultSpan.innerHTML = innerHtml;
        resultSpan.style.color = tColor;

        savedResults[rowIndex] = {
            htmlContent: innerHtml,
            textColor: tColor
        };

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

        savedResults[rowIndex] = {
            htmlContent: highlightedHtml + " ",
            textColor: "var(--error-text)"
        };

        appendPersistedPlayButton(resultSpan, rowIndex, jaKanji, playRate);
        corrTextSpan.textContent = "🔥 Keep going! Try once more!";
        corrListenBtn.style.display = "inline-block";

        corrListenBtn.onclick = () => {
            const listenBtn = resultSpan.querySelector(".model-listen-btn");
            const playBtn = resultSpan.querySelector(".play-recording-btn");

            setPlayingStateMultiple(
                [corrListenBtn, listenBtn, playBtn],
                "Playing..."
            );

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
                audio.onerror = () => stopAllPlayback();
                audio.play().catch(() => stopAllPlayback());
            });
        }
    }
}

// ============================================================================
// Drill 2: Self-Check Your Sounds (Hiragana時は「🐣Only Hiragana:🎙️Audio only」を継続表示)
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

    const inputEn = document.createElement("input");
    inputEn.type = "text";
    inputEn.className = "custom-input";
    inputEn.placeholder = "Optional reference text...";
    inputEn.setAttribute("aria-label", "Optional reference text");
    inputEn.style.flex = "1";
    inputEn.style.minWidth = "260px";
    inputEn.value = drill2State.inputVal;

    inputEn.addEventListener("input", (e) => {
        drill2State.inputVal = e.target.value;
    });

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";

    if (savedAudioUrls[rowIndex]) {
        if (useHiraganaOnly) {
            resultSpan.textContent = "🐣Only Hiragana:🎙️Audio only";
        } else if (drill2State.persistedDisplay) {
            resultSpan.textContent = drill2State.persistedDisplay;
        } else {
            resultSpan.textContent = "(Recorded)";
        }
        resultSpan.style.color = "var(--text-primary)";
    } else {
        resultSpan.textContent = "(Not recorded yet)";
        resultSpan.style.color = "var(--text-secondary)";
    }

    topRow.appendChild(indexSpan);
    topRow.appendChild(inputEn);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

    rowDiv.appendChild(topRow);

    if (savedAudioUrls[rowIndex]) {
        ensureDrill2PlayButton(resultSpan, rowIndex);
    }

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

function ensureDrill2PlayButton(resultSpan, rowIndex) {
    let playBtn = resultSpan.querySelector(".play-recording-btn");

    if (!playBtn) {
        playBtn = document.createElement("button");
        playBtn.type = "button";
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "8px";
        playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
        playBtn.addEventListener("click", () => {
            const audioUrl = savedAudioUrls[rowIndex];
            if (!audioUrl) return;

            setPlayingStateMultiple([playBtn], "Playing...");

            const audio = new Audio(audioUrl);
            currentPlayingAudio = audio;
            audio.playbackRate = 1.0;
            audio.onended = () => stopAllPlayback();
            audio.onerror = () => stopAllPlayback();
            audio.play().catch(() => stopAllPlayback());
        });
        resultSpan.appendChild(playBtn);
    }

    return playBtn;
}

function bindDrill2RecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    inputEn,
    rowIndex,
    playRate = 0.9
) {
    let localSession = null;

    function setIdleControls() {
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");
    }

    function releaseTracks(session) {
        if (!session || !session.stream) return;

        session.stream.getTracks().forEach(track => {
            try {
                track.stop();
            } catch (e) {}
        });

        session.stream = null;
    }

    function clearSessionTimers(session) {
        if (session.autoStopTimer !== null) {
            clearTimeout(session.autoStopTimer);
            session.autoStopTimer = null;
        }

        if (session.watchdog !== null) {
            clearTimeout(session.watchdog);
            session.watchdog = null;
        }
    }

    function finalizeSession(session, errorMessage = "") {
        if (!session || session.finalized) return;

        session.finalized = true;
        clearSessionTimers(session);
        releaseTracks(session);

        if (activeRecognitionSession === session) {
            activeRecognitionSession = null;
        }

        if (localSession === session) {
            localSession = null;
        }

        setIdleControls();

        if (errorMessage) {
            resultSpan.textContent = errorMessage;
            resultSpan.style.color = "var(--error-text)";
        }
    }

    function stopSession(session, reason = "user") {
        if (!session || session.finalized || session.stopRequested) return;

        session.stopRequested = true;
        clearSessionTimers(session);

        if (reason === "error") {
            session.errorMessage = "Could not finish recording.";
        }

        const recorder = session.mediaRecorder;

        if (recorder && recorder.state !== "inactive") {
            try {
                recorder.stop();
            } catch (e) {
                finalizeSession(
                    session,
                    session.errorMessage || "Could not finish recording."
                );
            }
        } else if (!session.finalized) {
            finalizeSession(session, session.errorMessage || "");
        }

        if (!session.finalized) {
            session.watchdog = setTimeout(() => {
                finalizeSession(
                    session,
                    session.errorMessage || "Recording stopped."
                );
            }, 2000);
        }
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;

        stopAllPlayback();

        if (activeRecognitionSession !== null) {
            const previousSession = activeRecognitionSession;

            if (typeof previousSession.forceStop === "function") {
                previousSession.forceStop();
            } else {
                if (previousSession.stream) releaseTracks(previousSession);

                if (
                    previousSession.mediaRecorder &&
                    previousSession.mediaRecorder.state !== "inactive"
                ) {
                    try {
                        previousSession.mediaRecorder.stop();
                    } catch (e) {}
                }
            }
        }

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia ||
            typeof MediaRecorder === "undefined"
        ) {
            resultSpan.textContent = "Recording is not supported.";
            resultSpan.style.color = "var(--error-text)";
            setIdleControls();
            return;
        }

        drill2State.transcript = "";
        drill2State.persistedDisplay = "";

        recordBtn.disabled = true;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");

        const isKanjiMode = !useHiraganaOnly;

        if (isKanjiMode) {
            resultSpan.textContent = "Preparing microphone...";
        } else {
            resultSpan.textContent = "🐣Only Hiragana:🎙️Audio only";
        }
        resultSpan.style.color = "var(--accent-color)";

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            setIdleControls();
            resultSpan.textContent = "Microphone unavailable.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (activeRecognitionSession !== null) {
            stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {}
            });

            setIdleControls();
            resultSpan.textContent = "Another recording is already active.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        let SpeechRecognition = null;

        if (isKanjiMode) {
            SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        }

        const session = {
            finalized: false,
            stopRequested: false,
            errorMessage: "",
            mediaRecorder: null,
            recognition: null,
            audioChunks: [],
            stream,
            autoStopTimer: null,
            watchdog: null,
            forceStop: null,
            accumulatedTranscript: "",
            recognitionDone: false,
            recorderDone: false,
            processed: false
        };

        localSession = session;
        activeRecognitionSession = session;

        session.forceStop = () => {
            if (
                session.mediaRecorder &&
                session.mediaRecorder.state !== "inactive"
            ) {
                try {
                    session.mediaRecorder.stop();
                } catch (e) {}
            }
            if (session.recognition) {
                try {
                    session.recognition.stop();
                } catch (e) {}
            }
            finalizeSession(session);
        };

        const tryProcessResult = () => {
            if (session.errorMessage || session.processed) return;

            if (session.recorderDone && (!isKanjiMode || session.recognitionDone)) {
                session.processed = true;

                if (isKanjiMode) {
                    const transcript = session.accumulatedTranscript.trim();
                    const hiraText = convertToHiragana(transcript);
                    drill2State.transcript = hiraText || transcript;
                    drill2State.persistedDisplay = drill2State.transcript || "(Recorded)";
                    resultSpan.textContent = drill2State.persistedDisplay;
                } else {
                    drill2State.persistedDisplay = "🐣Only Hiragana:🎙️Audio only";
                    resultSpan.textContent = drill2State.persistedDisplay;
                }

                resultSpan.style.color = "var(--text-primary)";
                ensureDrill2PlayButton(resultSpan, rowIndex);
                finalizeSession(session);

                if (isAutoPlay) {
                    const audioUrl = savedAudioUrls[rowIndex];
                    if (audioUrl) {
                        const playBtn = resultSpan.querySelector(".play-recording-btn");
                        if (playBtn) {
                            setPlayingStateMultiple([playBtn], "Playing...");
                            const audio = new Audio(audioUrl);
                            currentPlayingAudio = audio;
                            audio.playbackRate = 1.0;
                            audio.onended = () => stopAllPlayback();
                            audio.onerror = () => stopAllPlayback();
                            audio.play().catch(() => stopAllPlayback());
                        }
                    }
                }
            }
        };

        try {
            let recorder;
            const preferredMimeType = "audio/webm;codecs=opus";

            if (
                typeof MediaRecorder.isTypeSupported === "function" &&
                MediaRecorder.isTypeSupported(preferredMimeType)
            ) {
                recorder = new MediaRecorder(stream, {
                    mimeType: preferredMimeType
                });
            } else {
                recorder = new MediaRecorder(stream);
            }

            session.mediaRecorder = recorder;

            recorder.addEventListener("dataavailable", event => {
                if (event.data && event.data.size > 0) {
                    session.audioChunks.push(event.data);
                }
            });

            recorder.addEventListener("error", () => {
                if (!session.finalized) {
                    session.errorMessage = "Recording failed.";
                    stopSession(session, "error");
                }
            });

            recorder.addEventListener("stop", () => {
                if (session.finalized) return;

                const mimeType =
                    recorder.mimeType ||
                    (session.audioChunks[0] && session.audioChunks[0].type) ||
                    "audio/webm";

                const audioBlob = new Blob(session.audioChunks, {
                    type: mimeType
                });

                if (savedAudioUrls[rowIndex]) {
                    URL.revokeObjectURL(savedAudioUrls[rowIndex]);
                }

                savedAudioUrls[rowIndex] = URL.createObjectURL(audioBlob);
                delete savedResults[rowIndex];

                session.recorderDone = true;
                tryProcessResult();
            });

            recorder.start();

            if (isKanjiMode && SpeechRecognition) {
                const recognition = new SpeechRecognition();
                session.recognition = recognition;
                recognition.lang = "ja-JP";
                recognition.interimResults = false;
                recognition.continuous = isManualStop;

                recognition.onresult = (event) => {
                    if (session.finalized || localSession !== session) return;
                    let raw = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            raw += event.results[i][0].transcript;
                        }
                    }
                    session.accumulatedTranscript += raw;
                };

                recognition.onerror = () => {
                    if (session.finalized || localSession !== session) return;
                    session.recognitionDone = true;
                    tryProcessResult();
                };

                recognition.onend = () => {
                    if (session.finalized) return;
                    session.recognitionDone = true;
                    tryProcessResult();
                };

                recognition.start();
            } else {
                session.recognitionDone = true;
            }

            if (isKanjiMode) {
                resultSpan.textContent = "Recording...";
            } else {
                resultSpan.textContent = "🐣Only Hiragana:🎙️Audio only";
            }
            resultSpan.style.color = "var(--accent-color)";

            stopBtn.disabled = !isManualStop;

            if (isManualStop) {
                stopBtn.classList.add("stop-btn-active");
            } else {
                stopBtn.classList.remove("stop-btn-active");
            }

            if (isManualStop) {
                session.autoStopTimer = setTimeout(() => {
                    stopSession(session, "timeout");
                }, 15000);
            } else {
                session.autoStopTimer = setTimeout(() => {
                    stopSession(session, "autostop");
                }, 3000);
            }
        } catch (err) {
            session.errorMessage = "Could not start recording.";

            if (
                session.mediaRecorder &&
                session.mediaRecorder.state !== "inactive"
            ) {
                stopSession(session, "error");
            } else {
                finalizeSession(session, session.errorMessage);
            }
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!localSession || localSession.finalized || !isManualStop) return;

        stopBtn.disabled = true;
        stopSession(localSession, "user");
        if (localSession && localSession.recognition) {
            try {
                localSession.recognition.stop();
            } catch (e) {}
        }
    });
}
