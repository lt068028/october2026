
// ============================================================================
// Pronunciation Practice 1 (Audio Comparison Only - No Transcription)
// ============================================================================

const drill1Data = [
    { kanji: "箸。橋。", hira: "はし、はし", text: "は↘し chopstick ｜ は↗し bridge", color: "#facc15" },
    { kanji: "萌々。桃", hira: "もも、もも", text: "も↘も thigh ｜ も↗も peach", color: "#34d399" },
    { kanji: "降る。振る", hira: "ふる、ふる", text: "ふ↘る to fall ｜ ふ↗る to shake", color: "#22d3ee" },
    { kanji: "切る。着る", hira: "きる、きる", text: "き↘る to cut ｜ き↗る to wear", color: "#e879f9" },
    { kanji: "撒く。巻く", hira: "まく、まく", text: "ま↘く to scatter ｜ ま↗く to roll", color: "#fda4af" },
    { kanji: "春。貼る", hira: "はる、はる", text: "は↘る spring ｜ は↗る to paste", color: "#facc15" },
    { kanji: "隅。炭。", hira: "すみ、すみ", text: "す↘み corner ｜ す↗み charcoal", color: "#34d399" },
    { kanji: "牡蠣。かき。", hira: "かき、かき", text: "かき、かき", color: "#22d3ee" },
    { kanji: "鶴。釣る", hira: "つる、つる", text: "つ↘る crane ｜ つ↗る to fish", color: "#e879f9" },
    { kanji: "雨。飴", hira: "あめ、あめ", text: "あ↘め rain ｜ あ↗め candy", color: "#fda4af" }
];

let isManualStop = false; // Autostopデフォルト
let isAutoPlay = true;
const useHiraganaOnly = true;
let activeRecognitionSession = null;

// ============================================================================
// Voice Setup
// ============================================================================
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
            selected = voices.find(v =>
                v.name && v.name.toLowerCase().includes("keita")
            );
        }

        if (!selected) {
            selected = voices.find(v =>
                v.name && v.name.toLowerCase().includes("nanami")
            );
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

// ============================================================================
// Pitch Accent HTML Parser
// ============================================================================
function renderPitchAccentHTML(textStr, color) {
    let resultHTML = "";
    let isHigh = true;

    let i = 0;

    while (i < textStr.length) {
        let ch = textStr[i];
        let isLatin = /[a-zA-Z]/.test(ch);

        if (isLatin || ch === " ") {
            resultHTML += ch;
            i++;
        } else if (ch === "↘" || ch === "＼") {
            resultHTML +=
                `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;

            isHigh = false;
            i++;
        } else if (ch === "↗" || ch === "/") {
            resultHTML +=
                `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;

            isHigh = true;
            i++;
        } else if (ch === "｜") {
            resultHTML +=
                `<span style="color: ${color}; font-weight: bold; margin: 0 4px;">${ch}</span>`;

            i++;
        } else {
            let nextCh = textStr[i + 1];
            let effectiveHigh = isHigh;

            if (nextCh === "↘" || nextCh === "＼") {
                effectiveHigh = true;
            } else if (nextCh === "↗" || nextCh === "/") {
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
// Initialization & DOM Setup
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    renderDrill1Section();
    setupFooterGuide();
    initPitchLab();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
    const box = document.getElementById("guideBox");

    if (trigger && box) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();

            box.style.display =
                box.style.display === "none" ? "block" : "none";
        });

        document.addEventListener("click", () => {
            box.style.display = "none";
        });
    }
}

function initSettingsPanel() {
    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");
    const labelManualRecord = document.getElementById("labelManualRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = false;
        isManualStop = false;

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

    const scriptControlItem = toggleScriptMode
        ? toggleScriptMode.closest(".control-item")
        : null;

    if (toggleScriptMode) {
        toggleScriptMode.checked = true;
        toggleScriptMode.disabled = true;
    }

    if (scriptControlItem) {
        scriptControlItem.style.opacity = "0.4";
        scriptControlItem.style.pointerEvents = "none";
    }

    if (labelKanji) {
        labelKanji.className =
            "mode-label inactive-mode custom-tip-wrap";

        const emoji = labelKanji.querySelector(".icon-emoji");

        if (emoji) {
            emoji.style.filter = "grayscale(100%)";
            emoji.style.opacity = "0.4";
        }
    }

    if (labelHiragana) {
        labelHiragana.className =
            "mode-label inactive-mode custom-tip-wrap";

        const emoji = labelHiragana.querySelector(".icon-emoji");

        if (emoji) {
            emoji.style.filter = "grayscale(100%)";
            emoji.style.opacity = "0.4";
        }
    }
}

function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;

    labelEl.className =
        `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;

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

// ============================================================================
// Render Drill 1 Section (InfoPanel -> List)
// ============================================================================
function renderDrill1Section() {
    let container = document.getElementById("drill1List");

    if (!container) {
        container = document.createElement("div");
        container.id = "drill1List";

        document.body.insertBefore(
            container,
            document.querySelector(".voice-guide-footer")
        );
    }

    // Drill 1 の前に Info Panel を動的挿入
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
            0.9
        );
    });
}

// ----------------------------------------------------------------------------
// Drill 1 Row Creation
// ----------------------------------------------------------------------------
function createDrill1Row(container, indexLabel, item, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");

    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML =
        '🔊きく<span class="custom-tip-box">Listen to the model sentence.</span>';

    listenBtn.onclick = () => {
        const recordBtnEl = rowDiv.querySelector(".play-recording-btn");

        setPlayingStateMultiple(
            [listenBtn, recordBtnEl],
            "Playing..."
        );

        speakText(item.kanji, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");

    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";
    indexSpan.style.marginRight = "6px";

    const promptSpan = document.createElement("span");

    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = renderPitchAccentHTML(item.text, item.color);
    promptSpan.style.minWidth = "380px";
    promptSpan.style.paddingLeft = "4px";

    const recordBtn = document.createElement("button");

    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");

    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop the active recording.</span>';

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

    rowDiv.appendChild(topRow);

    bindDrill1RecorderEvents(
        recordBtn,
        stopBtn,
        resultSpan,
        item.kanji,
        playRate
    );

    container.appendChild(rowDiv);
}

function bindDrill1RecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    expectedKanjiText,
    playRate = 0.9
) {
    let mediaRecorder = null;
    let audioChunks = [];
    let lastAudioUrl = null;
    let stream = null;
    let isRecording = false;

    const appendPlayButton = () => {
        let playBtn = resultSpan.querySelector(".play-recording-btn");

        if (!playBtn) {
            playBtn = document.createElement("button");

            playBtn.className =
                "example-button play-recording-btn custom-tip-wrap";

            playBtn.style.marginLeft = "8px";

            playBtn.innerHTML =
                '▶️<span class="custom-tip-box">Play your recorded voice</span>';

            playBtn.onclick = () => {
                if (!lastAudioUrl) return;

                const rowContainer = resultSpan.closest(".drill-row");

                const modelListenBtn = rowContainer
                    ? rowContainer.querySelector(".example-button")
                    : null;

                setPlayingStateMultiple(
                    [modelListenBtn, playBtn],
                    "Playing..."
                );

                const audio = new Audio(lastAudioUrl);

                currentPlayingAudio = audio;

                audio.onended = () => stopAllPlayback();

                audio.play().catch(e => {
                    console.warn("Playback failed", e);
                    stopAllPlayback();
                });
            };

            resultSpan.appendChild(playBtn);
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;

        isRecording = false;

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");
    };

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;

        stopAllPlayback();

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (err) {
            resultSpan.textContent = "Microphone access denied.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (lastAudioUrl) {
            URL.revokeObjectURL(lastAudioUrl);
            lastAudioUrl = null;
        }

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const mimeType =
                mediaRecorder.mimeType || "audio/webm";

            const audioBlob = new Blob(audioChunks, {
                type: mimeType
            });

            lastAudioUrl = URL.createObjectURL(audioBlob);

            resultSpan.textContent = "Recorded ";
            resultSpan.style.color = "var(--text-primary)";

            appendPlayButton();

            if (isAutoPlay) {
                runAutoPlaySequence(
                    resultSpan,
                    expectedKanjiText,
                    playRate,
                    () => lastAudioUrl
                );
            }
        };

        mediaRecorder.start();
        isRecording = true;

        recordBtn.disabled = true;
        stopBtn.disabled = !isManualStop;

        if (isManualStop) {
            stopBtn.classList.add("stop-btn-active");
        } else {
            stopBtn.classList.remove("stop-btn-active");
        }

        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";

        if (!isManualStop) {
            setTimeout(() => {
                if (isRecording) {
                    stopRecording();
                }
            }, 2500);
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!isRecording) return;

        stopAllPlayback();
        stopRecording();
    });
}

function runAutoPlaySequence(
    resultSpan,
    expectedKanjiText,
    playRate,
    getUrlFn
) {
    if (!isAutoPlay) return;

    const rowContainer = resultSpan.closest(".drill-row");

    const modelListenBtn = rowContainer
        ? rowContainer.querySelector(".example-button")
        : null;

    const playBtn = resultSpan.querySelector(".play-recording-btn");
    const recordedAudioUrl = getUrlFn();

    if (!recordedAudioUrl || !playBtn) return;

    setPlayingStateMultiple(
        [modelListenBtn, playBtn],
        "Playing..."
    );

    const utterance = new SpeechSynthesisUtterance(expectedKanjiText);

    utterance.lang = "ja-JP";
    utterance.rate = playRate;

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

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
}

// ============================================================================
// Pitch Lab
// Independent recording, playback, F0 estimation and canvas visualization
// No speech recognition or transcription
// ============================================================================

let activePitchRecordingState = null;

function initPitchLab() {
    const cards = document.querySelectorAll(".pitch-card[data-pitch-side]");

    if (!cards.length) return;

    cards.forEach(card => {
        const state = {
            card,
            side: card.dataset.pitchSide,
            recordBtn: card.querySelector(".pitch-record"),
            stopBtn: card.querySelector(".pitch-stop"),
            playBtn: card.querySelector(".pitch-play"),
            analyzeBtn: card.querySelector(".pitch-analyze"),
            statusEl: card.querySelector(".pitch-status"),
            summaryEl: card.querySelector(".pitch-summary"),
            canvas: card.querySelector(".pitch-canvas"),

            recorder: null,
            stream: null,
            chunks: [],
            audioBlob: null,
            audioUrl: null,
            isRecording: false,
            f0Frames: null,
            medianF0: null
        };

        if (
            !state.recordBtn ||
            !state.stopBtn ||
            !state.playBtn ||
            !state.analyzeBtn ||
            !state.canvas
        ) {
            return;
        }

        state.stopBtn.disabled = true;
        state.playBtn.disabled = true;
        state.analyzeBtn.disabled = true;

        state.recordBtn.addEventListener("click", () => {
            startPitchRecording(state);
        });

        state.stopBtn.addEventListener("click", () => {
            stopPitchRecording(state);
        });

        state.playBtn.addEventListener("click", () => {
            playPitchRecording(state);
        });

        state.analyzeBtn.addEventListener("click", () => {
            analyzePitchRecording(state);
        });

        drawPitchPlaceholder(state, "Record your voice to begin.");

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(() => {
                if (state.f0Frames && state.f0Frames.length) {
                    drawPitchCurve(state, state.f0Frames);
                } else {
                    drawPitchPlaceholder(state, "No F0 data yet.");
                }
            });

            observer.observe(state.canvas);
        }
    });
}

// ----------------------------------------------------------------------------
// Start recording
// ----------------------------------------------------------------------------
async function startPitchRecording(state) {
    if (state.isRecording) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPitchStatus(
            state,
            "Microphone recording is not supported in this browser or context."
        );
        return;
    }

    if (typeof MediaRecorder === "undefined") {
        setPitchStatus(
            state,
            "MediaRecorder is not supported in this browser."
        );
        return;
    }

    if (activePitchRecordingState && activePitchRecordingState !== state) {
        setPitchStatus(
            state,
            "Stop the other Pitch Lab recording first."
        );
        return;
    }

    stopAllPlayback();

    state.recordBtn.disabled = true;
    setPitchStatus(state, "Requesting microphone access...");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        // Another card may have been activated while permission was pending.
        if (activePitchRecordingState && activePitchRecordingState !== state) {
            stream.getTracks().forEach(track => track.stop());
            state.recordBtn.disabled = false;

            setPitchStatus(
                state,
                "Another Pitch Lab recording is active."
            );
            return;
        }

        state.stream = stream;
        state.chunks = [];
        state.audioBlob = null;
        state.f0Frames = null;
        state.medianF0 = null;

        if (state.audioUrl) {
            URL.revokeObjectURL(state.audioUrl);
            state.audioUrl = null;
        }

        state.summaryEl.textContent = "Median F0: —";
        drawPitchPlaceholder(state, "Recording...");

        state.recorder = new MediaRecorder(stream);

        state.recorder.addEventListener("dataavailable", event => {
            if (event.data && event.data.size > 0) {
                state.chunks.push(event.data);
            }
        });

        state.recorder.addEventListener("stop", () => {
            finishPitchRecording(state);
        }, { once: true });

        state.recorder.start();

        state.isRecording = true;
        activePitchRecordingState = state;

        state.recordBtn.disabled = true;
        state.stopBtn.disabled = false;
        state.playBtn.disabled = true;
        state.analyzeBtn.disabled = true;

        setPitchStatus(
            state,
            "Recording... Speak はし naturally, then click Stop."
        );
    } catch (error) {
        console.error("Pitch Lab microphone error:", error);

        state.recordBtn.disabled = false;

        setPitchStatus(
            state,
            "Microphone access failed. Check browser permissions and try again."
        );
    }
}

// ----------------------------------------------------------------------------
// Stop recording
// ----------------------------------------------------------------------------
function stopPitchRecording(state) {
    if (!state.isRecording) return;

    state.isRecording = false;
    state.stopBtn.disabled = true;

    if (state.recorder && state.recorder.state !== "inactive") {
        state.recorder.stop();
    }

    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }

    if (activePitchRecordingState === state) {
        activePitchRecordingState = null;
    }

    state.recordBtn.disabled = false;
    setPitchStatus(state, "Finishing recording...");
}

// ----------------------------------------------------------------------------
// Finalize recording
// ----------------------------------------------------------------------------
function finishPitchRecording(state) {
    const mimeType =
        state.recorder && state.recorder.mimeType
            ? state.recorder.mimeType
            : "audio/webm";

    state.audioBlob = new Blob(state.chunks, {
        type: mimeType
    });

    if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
    }

    state.audioUrl = URL.createObjectURL(state.audioBlob);

    state.playBtn.disabled = false;
    state.analyzeBtn.disabled = false;
    state.recordBtn.disabled = false;
    state.stopBtn.disabled = true;

    setPitchStatus(
        state,
        `Recording ready (${(state.audioBlob.size / 1024).toFixed(1)} KB).`
    );

    // Automatically estimate F0 after recording.
    analyzePitchRecording(state);
}

// ----------------------------------------------------------------------------
// Playback recording
// ----------------------------------------------------------------------------
function playPitchRecording(state) {
    if (!state.audioUrl || !state.audioBlob) return;

    // Keep Pitch Lab playback separate from the existing Drill 1 controls.
    stopAllPlayback();

    const audio = new Audio(state.audioUrl);
    state.playBtn.disabled = true;

    let restored = false;

    const restoreButton = () => {
        if (restored) return;
        restored = true;
        state.playBtn.disabled = !state.audioBlob;
    };

    audio.addEventListener("ended", restoreButton, { once: true });
    audio.addEventListener("error", restoreButton, { once: true });

    audio.play().then(() => {
        setPitchStatus(state, "Playing your recording...");
    }).catch(error => {
        console.warn("Pitch Lab playback failed:", error);

        setPitchStatus(
            state,
            "Playback failed. Try recording again."
        );

        restoreButton();
    });
}

// ----------------------------------------------------------------------------
// Analyze F0 from the recorded audio
// ----------------------------------------------------------------------------
async function analyzePitchRecording(state) {
    if (!state.audioBlob) {
        setPitchStatus(state, "Record your voice first.");
        return;
    }

    state.analyzeBtn.disabled = true;
    setPitchStatus(state, "Analyzing F0...");

    let audioContext = null;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("Web Audio API is not supported.");
        }

        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        const arrayBuffer = await state.audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const monoSamples = mixAudioToMono(audioBuffer);
        const frames = estimateF0Frames(
            monoSamples,
            audioBuffer.sampleRate
        );

        state.f0Frames = frames;

        const validF0 = frames
            .map(frame => frame.f0)
            .filter(value => Number.isFinite(value) && value > 0);

        if (!validF0.length) {
            state.medianF0 = null;
            state.summaryEl.textContent = "Median F0: unavailable";

            drawPitchPlaceholder(
                state,
                "No reliable voiced frames detected."
            );

            setPitchStatus(
                state,
                "F0 could not be estimated. Try a clear, short recording."
            );

            return;
        }

        state.medianF0 = calculateMedian(validF0);

        state.summaryEl.textContent =
            `Median F0: ${Math.round(state.medianF0)} Hz`;

        drawPitchCurve(state, frames);

        const voicedPercent = Math.round(
            validF0.length / Math.max(frames.length, 1) * 100
        );

        setPitchStatus(
            state,
            `F0 estimated. Voiced frames: ${voicedPercent}%.`
        );
    } catch (error) {
        console.error("Pitch Lab F0 analysis error:", error);

        setPitchStatus(
            state,
            "F0 analysis failed. Try recording again in a supported browser."
        );
    } finally {
        if (audioContext && audioContext.state !== "closed") {
            try {
                await audioContext.close();
            } catch (e) {
                console.warn("Could not close AudioContext:", e);
            }
        }

        state.analyzeBtn.disabled = !state.audioBlob;
    }
}

// ----------------------------------------------------------------------------
// Convert multichannel audio to mono
// ----------------------------------------------------------------------------
function mixAudioToMono(audioBuffer) {
    const channelCount = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;

    const mono = new Float32Array(length);

    for (let channel = 0; channel < channelCount; channel++) {
        const samples = audioBuffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
            mono[i] += samples[i] / channelCount;
        }
    }

    return mono;
}

// ----------------------------------------------------------------------------
// Estimate fundamental frequency using windowed autocorrelation
// ----------------------------------------------------------------------------
function estimateF0Frames(samples, sampleRate) {
    const frameLength = Math.round(sampleRate * 0.040);
    const hopLength = Math.round(sampleRate * 0.010);

    const minFrequency = 70;
    const maxFrequency = 400;

    const minLag = Math.floor(sampleRate / maxFrequency);
    const maxLag = Math.ceil(sampleRate / minFrequency);

    const frames = [];

    if (samples.length < frameLength) {
        return frames;
    }

    for (
        let start = 0;
        start + frameLength <= samples.length;
        start += hopLength
    ) {
        const frame = samples.subarray(
            start,
            start + frameLength
        );

        const f0 = estimateFrameF0(
            frame,
            sampleRate,
            minLag,
            maxLag
        );

        frames.push({
            time: (start + frameLength / 2) / sampleRate,
            f0
        });
    }

    return frames;
}

function estimateFrameF0(frame, sampleRate, minLag, maxLag) {
    const length = frame.length;

    // Remove DC offset.
    let mean = 0;

    for (let i = 0; i < length; i++) {
        mean += frame[i];
    }

    mean /= length;

    const centered = new Float32Array(length);
    let energy = 0;

    for (let i = 0; i < length; i++) {
        centered[i] = frame[i] - mean;
        energy += centered[i] * centered[i];
    }

    // Ignore silence and very low-energy frames.
    if (energy / length < 0.000015) {
        return null;
    }

    let bestLag = -1;
    let bestCorrelation = 0;

    const upperLag = Math.min(maxLag, length - 2);

    for (let lag = minLag; lag <= upperLag; lag++) {
        let cross = 0;
        let energyA = 0;
        let energyB = 0;

        for (let i = 0; i < length - lag; i++) {
            const a = centered[i];
            const b = centered[i + lag];

            cross += a * b;
            energyA += a * a;
            energyB += b * b;
        }

        const denominator = Math.sqrt(energyA * energyB);

        if (denominator <= 0) continue;

        const correlation = cross / denominator;

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestLag = lag;
        }
    }

    // Reject weak periodicity to reduce false pitch estimates.
    if (bestLag < 0 || bestCorrelation < 0.55) {
        return null;
    }

    const f0 = sampleRate / bestLag;

    if (f0 < 70 || f0 > 400) {
        return null;
    }

    return f0;
}

// ----------------------------------------------------------------------------
// Median helper
// ----------------------------------------------------------------------------
function calculateMedian(values) {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

// ----------------------------------------------------------------------------
// Canvas drawing helpers
// ----------------------------------------------------------------------------
function preparePitchCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();

    const cssWidth = Math.max(240, rect.width || 300);
    const cssHeight = Math.max(150, rect.height || 190);
    const pixelRatio = Math.max(1, window.devicePixelRatio || 1);

    const pixelWidth = Math.round(cssWidth * pixelRatio);
    const pixelHeight = Math.round(cssHeight * pixelRatio);

    if (
        canvas.width !== pixelWidth ||
        canvas.height !== pixelHeight
    ) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
    }

    const context = canvas.getContext("2d");

    context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    return {
        context,
        width: cssWidth,
        height: cssHeight
    };
}

function drawPitchPlaceholder(state, message) {
    const { context, width, height } =
        preparePitchCanvas(state.canvas);

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#888888";
    context.font = "12px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
        message,
        width / 2,
        height / 2,
        width - 20
    );
}

function drawPitchCurve(state, frames) {
    const { context, width, height } =
        preparePitchCanvas(state.canvas);

    context.clearRect(0, 0, width, height);

    const padding = {
        left: 44,
        right: 12,
        top: 16,
        bottom: 28
    };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    if (plotWidth <= 0 || plotHeight <= 0 || !frames.length) {
        drawPitchPlaceholder(state, "No F0 data available.");
        return;
    }

    const minHz = 70;
    const maxHz = 400;

    const plotLeft = padding.left;
    const plotRight = padding.left + plotWidth;
    const plotTop = padding.top;
    const plotBottom = padding.top + plotHeight;

    // Horizontal grid and frequency labels.
    context.font = "10px sans-serif";
    context.textAlign = "right";
    context.textBaseline = "middle";

    [100, 200, 300, 400].forEach(hz => {
        const y = plotBottom -
            ((hz - minHz) / (maxHz - minHz)) * plotHeight;

        context.beginPath();
        context.moveTo(plotLeft, y);
        context.lineTo(plotRight, y);
        context.strokeStyle = "#d1d5db";
        context.lineWidth = 1;
        context.stroke();

        context.fillStyle = "#777777";
        context.fillText(`${hz}`, plotLeft - 7, y);
    });

    // Axis labels.
    context.save();
    context.translate(12, plotTop + plotHeight / 2);
    context.rotate(-Math.PI / 2);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#777777";
    context.font = "10px sans-serif";
    context.fillText("F0 (Hz)", 0, 0);
    context.restore();

    context.strokeStyle = "#9ca3af";
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(plotLeft, plotTop);
    context.lineTo(plotLeft, plotBottom);
    context.lineTo(plotRight, plotBottom);
    context.stroke();

    const maxTime = Math.max(
        frames[frames.length - 1].time,
        0.1
    );

    context.fillStyle = "#777777";
    context.font = "10px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";

    context.fillText("0 s", plotLeft, plotBottom + 7);
    context.fillText(
        `${maxTime.toFixed(1)} s`,
        plotRight,
        plotBottom + 7
    );

    // Draw a separate segment for each continuous voiced section.
    // Missing/unvoiced frames create gaps rather than being interpolated.
    context.strokeStyle = "#0d9488";
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.lineCap = "round";

    let segmentOpen = false;

    context.beginPath();

    frames.forEach(frame => {
        if (
            !Number.isFinite(frame.f0) ||
            frame.f0 < minHz ||
            frame.f0 > maxHz
        ) {
            segmentOpen = false;
            return;
        }

        const x =
            plotLeft + (frame.time / maxTime) * plotWidth;

        const y =
            plotBottom -
            ((frame.f0 - minHz) / (maxHz - minHz)) * plotHeight;

        if (!segmentOpen) {
            context.moveTo(x, y);
            segmentOpen = true;
        } else {
            context.lineTo(x, y);
        }
    });

    context.stroke();

    context.fillStyle = "#0d9488";

    frames.forEach(frame => {
        if (
            !Number.isFinite(frame.f0) ||
            frame.f0 < minHz ||
            frame.f0 > maxHz
        ) {
            return;
        }

        const x =
            plotLeft + (frame.time / maxTime) * plotWidth;

        const y =
            plotBottom -
            ((frame.f0 - minHz) / (maxHz - minHz)) * plotHeight;

        context.beginPath();
        context.arc(x, y, 1.8, 0, Math.PI * 2);
        context.fill();
    });
}

function setPitchStatus(state, message) {
    if (state.statusEl) {
        state.statusEl.textContent = message;
    }
}
