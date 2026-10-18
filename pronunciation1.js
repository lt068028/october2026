
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
    { kanji: "牡蠣。かき。", hira: "かき、かき", text: "か↘き oyster ｜ か↗き persimmon", color: "#22d3ee" },
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
    const toggleRecordMode =
        document.getElementById("toggleRecordMode");

    const labelAutoRecord =
        document.getElementById("labelAutoRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = !isManualStop;

        updateToggleLabelStyle(labelAutoRecord, !isManualStop);

        toggleRecordMode.addEventListener("change", event => {
            isManualStop = !event.target.checked;

            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        });
    }

    const togglePlaybackMode =
        document.getElementById("togglePlaybackMode");

    const labelAutoPlay =
        document.getElementById("labelAutoPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.checked = isAutoPlay;

        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);

        togglePlaybackMode.addEventListener("change", event => {
            isAutoPlay = event.target.checked;

            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        });
    }
    // このページではWith漢字を選択不可にする。
    const kanjiOption = document.querySelector(
        '#scriptModeControl [data-value="kanji"]'
    );

    if (kanjiOption) {
        kanjiOption.disabled = true;
        kanjiOption.setAttribute("aria-disabled", "true");
        kanjiOption.setAttribute("aria-pressed", "false");
        kanjiOption.classList.remove("is-selected");
        kanjiOption.classList.add("pronunciation-kanji-disabled");
    }

    if (!document.getElementById("pronunciationDisabledStyle")) {
        const style = document.createElement("style");
        style.id = "pronunciationDisabledStyle";

        style.textContent = `
            #scriptModeControl
            .segmented-option.pronunciation-kanji-disabled:disabled {
                color: #707b8a !important;
                background: #939eac !important;
                opacity: 1 !important;
                cursor: not-allowed !important;
                box-shadow: none !important;
                font-weight: normal !important;
            }

            #scriptModeControl
            .pronunciation-kanji-disabled .icon-emoji {
                filter: grayscale(100%) !important;
                opacity: 1 !important;
            }

            @media (prefers-color-scheme: dark) {
                #scriptModeControl
                .segmented-option.pronunciation-kanji-disabled:disabled {
                    color: #94a3b8 !important;
                    background: #718096 !important;
                }
            }
        `;

        document.head.appendChild(style);
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
const pronunciation1State = {
    audioUrls: {},
    views: {},
    starting: null,
    locked: new Map(),
    playback: 0
};

function pronunciation1Busy() {
    return Boolean(
        activeRecognitionSession ||
        pronunciation1State.starting !== null
    );
}

function pronunciation1Sync() {
    const controls = document.querySelectorAll(
        "#drill1List button"
    );

    if (pronunciation1Busy()) {
        controls.forEach(control => {
            if (!pronunciation1State.locked.has(control)) {
                pronunciation1State.locked.set(
                    control,
                    control.disabled
                );
            }

            control.disabled = true;
        });

        const session = activeRecognitionSession;
        const view = session &&
            pronunciation1State.views[session.key];

        if (view) {
            const canStop =
                session.manual && !session.stopping;

            view.stopBtn.disabled = !canStop;
            view.stopBtn.classList.toggle(
                "stop-btn-active",
                canStop
            );
        }
    } else {
        pronunciation1State.locked.forEach(
            (disabled, control) => {
                if (control.isConnected) {
                    control.disabled = disabled;
                }
            }
        );

        pronunciation1State.locked.clear();
    }

    controls.forEach(control => {
        control.style.setProperty(
            "cursor",
            control.disabled ? "not-allowed" : "pointer",
            "important"
        );
    });
}

function pronunciation1Show(view, message = "") {
    const { resultSpan, key } = view;
    const hasAudio = Boolean(
        pronunciation1State.audioUrls[key]
    );

    resultSpan.textContent = hasAudio
        ? "Recorded "
        : "(Not recorded yet) ";

    resultSpan.style.color = hasAudio
        ? "var(--text-primary)"
        : "var(--text-secondary)";

    if (hasAudio) {
        const play = document.createElement("button");
        play.type = "button";
        play.className =
            "example-button play-recording-btn custom-tip-wrap";
        play.style.marginLeft = "8px";

        play.innerHTML =
            '▶️<span class="custom-tip-box">Play your recorded voice</span>';

        play.onclick = () =>
            pronunciation1Play(key, false);

        resultSpan.appendChild(play);
    }

    if (message) {
        const notice = document.createElement("span");
        notice.textContent = message + " ";
        notice.style.color = "var(--text-secondary)";
        resultSpan.prepend(notice);
    }

    if (activeRecognitionSession?.key === key) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
    } else if (pronunciation1State.starting === key) {
        resultSpan.textContent = "Preparing microphone...";
    }
}


function pronunciation1Play(
    key,
    model = true,
    playOwnAfter = false
) {
    if (pronunciation1Busy()) return;

    if (
        typeof activePitchRecordingState !== "undefined" &&
        activePitchRecordingState
    ) {
        return;
    }

    const view = pronunciation1State.views[key];
    if (!view) return;

    const version = ++pronunciation1State.playback;

    stopAllPlayback();

    const url = pronunciation1State.audioUrls[key];
    const buttons = [
        view.rowDiv?.querySelector("button"),
        view.resultSpan?.querySelector(".play-recording-btn")
    ].filter(Boolean);

    // rowDivを保持していない場合にもモデルボタンを取得する。
    const row = view.resultSpan?.closest(".drill-row");
    const modelButton = row?.querySelector("button");

    if (modelButton && !buttons.includes(modelButton)) {
        buttons.unshift(modelButton);
    }

    activePlayButtons = buttons;

    buttons.forEach(button => {
        button.dataset.originalHtml = button.innerHTML;
        button.disabled = true;
        button.textContent = "Playing...";
        button.style.setProperty(
            "cursor",
            "not-allowed",
            "important"
        );
    });

    const isCurrent = () =>
        version === pronunciation1State.playback &&
        !pronunciation1Busy();

    const finish = () => {
        if (!isCurrent()) return;

        restorePlayButtons();
        pronunciation1Sync();
    };

    const playOwn = () => {
        if (!isCurrent()) return;

        if (!url) {
            finish();
            return;
        }

        const audio = new Audio(url);
        currentPlayingAudio = audio;
        audio.playbackRate = 1;

        const done = () => {
            if (currentPlayingAudio === audio) {
                currentPlayingAudio = null;
            }

            finish();
        };

        audio.onended = done;

        audio.onerror = () => {
            console.warn("Recorded audio playback failed.");
            done();
        };

        audio.play().catch(error => {
            console.warn("Recorded audio playback failed:", error);
            done();
        });
    };

    if (!model) {
        playOwn();
        return;
    }

    if (
        !("speechSynthesis" in window) ||
        !("SpeechSynthesisUtterance" in window)
    ) {
        if (playOwnAfter) {
            playOwn();
        } else {
            finish();
        }

        return;
    }

    setupPreferredVoice();

    const utterance = new SpeechSynthesisUtterance(
        view.item.kanji
    );

    utterance.lang = "ja-JP";
    utterance.rate = view.playRate ?? 0.9;

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    currentUtteranceRef = utterance;

    let completed = false;

    const afterModel = () => {
        if (completed) return;
        completed = true;

        if (currentUtteranceRef === utterance) {
            currentUtteranceRef = null;
        }

        if (!isCurrent()) return;

        if (playOwnAfter) {
            playOwn();
        } else {
            finish();
        }
    };

    utterance.onend = afterModel;

    utterance.onerror = event => {
        console.warn("Model audio playback failed:", event.error);
        afterModel();
    };

    try {
        speechSynthesis.resume();
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.warn("Model audio playback failed:", error);
        afterModel();
    }
}

function createDrill1Row(
    container,
    indexLabel,
    item,
    playRate
) 
{
    const key = indexLabel;

    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.type = "button";
    listenBtn.className = "example-button custom-tip-wrap";

    listenBtn.innerHTML =
        '🔊きく<span class="custom-tip-box">Listen to the model sentence.</span>';

    listenBtn.onclick = () => pronunciation1Play(key);

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";
    indexSpan.style.marginRight = "6px";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML =
        renderPitchAccentHTML(item.text, item.color);
    promptSpan.style.minWidth = "380px";
    promptSpan.style.paddingLeft = "4px";

    const recordBtn = document.createElement("button");
    recordBtn.type = "button";
    recordBtn.className = "example-button custom-tip-wrap";

    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "example-button custom-tip-wrap";

    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop the active recording.</span>';

    stopBtn.disabled = true;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";

    const view = {
        key,
        item,
        playRate,
        listenBtn,
        recordBtn,
        stopBtn,
        resultSpan
    };

    pronunciation1State.views[key] = view;

    recordBtn.onclick = () => pronunciation1Record(key);

    stopBtn.onclick = () => {
        const session = activeRecognitionSession;

        if (session?.key === key && session.manual) {
            session.stop();
        }
    };

    topRow.append(
        listenBtn,
        indexSpan,
        promptSpan,
        recordBtn,
        stopBtn,
        resultSpan
    );

    rowDiv.appendChild(topRow);
    container.appendChild(rowDiv);

    pronunciation1Show(view);
    queueMicrotask(pronunciation1Sync);
}

async function pronunciation1Record(key) {
    if (
        pronunciation1Busy() ||
        activePitchRecordingState
    ) {
        return;
    }

    const current = () => pronunciation1State.views[key];
    const manual = isManualStop;

    if (
        !navigator.mediaDevices?.getUserMedia ||
        !window.MediaRecorder
    ) {
        pronunciation1Show(
            current(),
            "Recording is not supported."
        );
        return;
    }

    ++pronunciation1State.playback;
    stopAllPlayback();

    pronunciation1State.starting = key;
    pronunciation1Sync();
    pronunciation1Show(current());

    let stream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
    } catch (error) {
        pronunciation1State.starting = null;
        pronunciation1Sync();

        pronunciation1Show(
            current(),
            "Microphone access denied."
        );

        pronunciation1Sync();
        return;
    }

    pronunciation1State.starting = null;

    const session = {
        key,
        manual,
        stopping: false,
        finished: false,
        discard: false,
        speech: false,
        lastSound: 0,
        chunks: [],
        timers: [],
        context: null,
        recorder: null,
        message: "",
        stop: null
    };

    activeRecognitionSession = session;

    function clear() {
        session.timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });

        session.timers = [];

        if (session.context) {
            session.context.close().catch(() => {});
            session.context = null;
        }
    }

    function finish() {
        if (session.finished) return;

        session.finished = true;
        clear();

        stream.getTracks().forEach(track => track.stop());

        if (activeRecognitionSession === session) {
            activeRecognitionSession = null;
        }

        current().stopBtn.classList.remove("stop-btn-active");
        pronunciation1Sync();

        const valid =
            !session.discard &&
            session.speech &&
            session.chunks.some(chunk => chunk.size > 0);

        if (valid) {
            const blob = new Blob(session.chunks, {
                type:
                    session.recorder.mimeType ||
                    "audio/webm"
            });

            const url = URL.createObjectURL(blob);
            const old = pronunciation1State.audioUrls[key];

            pronunciation1State.audioUrls[key] = url;

            if (old) {
                URL.revokeObjectURL(old);
            }
        }

        session.chunks = [];

        pronunciation1Show(
            current(),
            session.message ||
                (!valid ? "No speech recognized." : "")
        );

        pronunciation1Sync();

        if (valid && isAutoPlay) {
            pronunciation1Play(key, true, true);
        }
    }

    function stop(message = "", discard = false) {
        if (session.stopping || session.finished) return;

        session.stopping = true;
        session.message = message;
        session.discard = discard;

        clear();
        pronunciation1Sync();

        if (
            !session.recorder ||
            session.recorder.state === "inactive"
        ) {
            finish();
            return;
        }

        session.timers.push(setTimeout(() => {
            session.discard = true;
            finish();
        }, 2500));

        try {
            session.recorder.stop();
        } catch (error) {
            session.discard = true;
            finish();
        }
    }

    session.stop = stop;

    try {
        const recorder = new MediaRecorder(stream);
        session.recorder = recorder;

        recorder.ondataavailable = event => {
            if (
                !session.finished &&
                event.data.size > 0
            ) {
                session.chunks.push(event.data);
            }
        };

        recorder.onstop = finish;

        recorder.onerror = () => {
            stop("Recording error.", true);
        };

        pronunciation1Show(current());
        pronunciation1Sync();

        recorder.start();

        const Context =
            window.AudioContext ||
            window.webkitAudioContext;

        const context = new Context();
        session.context = context;

        const source =
            context.createMediaStreamSource(stream);

        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);

        const samples = new Float32Array(
            analyser.fftSize
        );

        // 短い発音も検出する。
        // 400ms以内の音量検出を合計し、100ms分で発話開始とする。
        const soundSamples = [];
        let previousCheck = performance.now();

        context.resume().catch(error => {
            console.warn("AudioContext resume failed:", error);
        });

        session.timers.push(setInterval(() => {
            if (session.stopping || session.finished) return;

            analyser.getFloatTimeDomainData(samples);

            let sum = 0;

            for (const sample of samples) {
                sum += sample * sample;
            }

            const now = performance.now();
            const elapsed = Math.min(
                Math.max(now - previousCheck, 0),
                40
            );

            previousCheck = now;

            const rms = Math.sqrt(sum / samples.length);
            const hasSound = rms > 0.015;

            soundSamples.push({
                time: now,
                duration: hasSound ? elapsed : 0
            });

            while (
                soundSamples.length &&
                now - soundSamples[0].time > 400
            ) {
                soundSamples.shift();
            }

            if (!session.speech) {
                const soundDuration = soundSamples.reduce(
                    (total, sample) => total + sample.duration,
                    0
                );

                if (soundDuration >= 100) {
                    session.speech = true;
                    session.lastSound = now;
                }
            }

            if (session.speech && hasSound) {
                session.lastSound = now;
            }

            if (
                !manual &&
                session.speech &&
                now - session.lastSound >= 2000
            ) {
                stop();
            }
        }, 20));

        session.timers.push(setTimeout(() => {
            if (!session.speech) {
                stop(
                    "No speech detected within 15 seconds.",
                    true
                );
            }
        }, 15000));

        session.timers.push(setTimeout(() => {
            stop("Auto-stopped after 20 seconds.");
        }, 20000));
    } catch (error) {
        stop("Could not start recording.", true);
    }
}

// ============================================================================
// Pitch Lab
// Independent recording, playback, F0 estimation and canvas visualization
// No speech recognition or transcription
// ============================================================================

let activePitchRecordingState = null;

function initPitchLab() {
    const cards = document.querySelectorAll(
        ".pitch-card[data-pitch-side]"
    );

    cards.forEach(card => {
        const state = {
            card,
            side: card.dataset.pitchSide,
            recordBtn: card.querySelector(".pitch-record"),
            stopBtn: card.querySelector(".pitch-stop"),
            playBtn: card.querySelector(".pitch-play"),
            statusEl: card.querySelector(".pitch-status"),
            canvas: card.querySelector(".pitch-canvas"),
            recorder: null,
            stream: null,
            chunks: [],
            audioBlob: null,
            audioUrl: null,
            isRecording: false,
            isAnalyzing: false,
            f0Frames: null
        };

        if (
            !state.recordBtn ||
            !state.stopBtn ||
            !state.playBtn ||
            !state.canvas
        ) {
            return;
        }

        state.stopBtn.disabled = true;
        state.playBtn.disabled = true;

        state.recordBtn.addEventListener("click", () => {
            startPitchRecording(state);
        });

        state.stopBtn.addEventListener("click", () => {
            stopPitchRecording(state);
        });

        state.playBtn.addEventListener("click", () => {
            playPitchRecording(state);
        });

        setPitchStatus(state, "Not recorded yet");
        drawPitchPlaceholder(state, "Record your voice to begin.");

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(() => {
                if (state.f0Frames && state.f0Frames.length) {
                    drawPitchCurve(state, state.f0Frames);
                } else {
                    drawPitchPlaceholder(
                        state,
                        state.isRecording
                            ? "Recording..."
                            : "Record your voice to begin."
                    );
                }
            });

            observer.observe(state.canvas);
        }
    });
}

async function startPitchRecording(state) {
    if (state.isRecording || state.isAnalyzing) return;

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia ||
        typeof MediaRecorder === "undefined"
    ) {
        setPitchStatus(
            state,
            "Recording is not supported in this browser."
        );
        return;
    }

    if (activePitchRecordingState) {
        setPitchStatus(state, "Stop the other recording first.");
        return;
    }

    stopAllPlayback();
    state.recordBtn.disabled = true;
    activePitchRecordingState = state;
    setPitchStatus(state, "Requesting microphone access...");

    try {
        state.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        state.chunks = [];
        state.audioBlob = null;
        state.f0Frames = null;

        if (state.audioUrl) {
            URL.revokeObjectURL(state.audioUrl);
            state.audioUrl = null;
        }

        state.recorder = new MediaRecorder(state.stream);

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

        state.stopBtn.disabled = false;
        state.playBtn.disabled = true;

        drawPitchPlaceholder(state, "Recording...");
        setPitchStatus(state, "Recording...");
    } catch (error) {
        console.error("Pitch Lab microphone error:", error);

        if (state.stream) {
            state.stream.getTracks().forEach(track => track.stop());
            state.stream = null;
        }

        if (activePitchRecordingState === state) {
            activePitchRecordingState = null;
        }

        state.recordBtn.disabled = false;
        state.playBtn.disabled = !state.audioBlob;

        setPitchStatus(
            state,
            "Microphone access failed. Check browser permissions."
        );
    }
}

function stopPitchRecording(state) {
    if (!state.isRecording) return;

    state.isRecording = false;
    state.stopBtn.disabled = true;
    setPitchStatus(state, "Finishing recording...");

    if (state.recorder && state.recorder.state !== "inactive") {
        state.recorder.stop();
    }

    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
}

function finishPitchRecording(state) {
    if (activePitchRecordingState === state) {
        activePitchRecordingState = null;
    }

    state.isRecording = false;
    state.stopBtn.disabled = true;

    const mimeType = state.recorder?.mimeType || "audio/webm";
    state.audioBlob = new Blob(state.chunks, { type: mimeType });

    if (!state.audioBlob.size) {
        state.audioBlob = null;
        state.recordBtn.disabled = false;
        state.playBtn.disabled = true;
        setPitchStatus(state, "No audio recorded. Try again.");
        return;
    }

    if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
    }

    state.audioUrl = URL.createObjectURL(state.audioBlob);

    // 停止後に自動解析する。解析ボタンは不要。
    analyzePitchRecording(state);
}

function playPitchRecording(state) {
    if (
        !state.audioUrl ||
        !state.audioBlob ||
        state.isRecording ||
        state.isAnalyzing
    ) {
        return;
    }

    stopAllPlayback();

    const audio = new Audio(state.audioUrl);
    state.playBtn.disabled = true;
    state.recordBtn.disabled = true;

    let restored = false;

    const restore = () => {
        if (restored) return;
        restored = true;
        state.playBtn.disabled = !state.audioBlob;
        state.recordBtn.disabled = false;
    };

    audio.addEventListener("ended", () => {
        restore();
        setPitchStatus(state, "Ready");
    }, { once: true });

    audio.addEventListener("error", () => {
        restore();
        setPitchStatus(state, "Playback failed. Try again.");
    }, { once: true });

    audio.play().then(() => {
        setPitchStatus(state, "Playing...");
    }).catch(error => {
        console.warn("Pitch Lab playback failed:", error);
        restore();
        setPitchStatus(state, "Playback failed. Try again.");
    });
}

async function analyzePitchRecording(state) {
    if (!state.audioBlob || state.isAnalyzing) return;

    state.isAnalyzing = true;
    state.recordBtn.disabled = true;
    state.playBtn.disabled = true;
    setPitchStatus(state, "Drawing pitch...");

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
        const audioBuffer = await audioContext.decodeAudioData(
            arrayBuffer
        );

        const frames = estimateF0Frames(
            mixAudioToMono(audioBuffer),
            audioBuffer.sampleRate
        );

        const hasPitch = frames.some(
            frame => Number.isFinite(frame.f0) && frame.f0 > 0
        );

        if (!hasPitch) {
            state.f0Frames = null;
            drawPitchPlaceholder(state, "Pitch not detected.");
            setPitchStatus(state, "Pitch not detected. Try again.");
            return;
        }

        state.f0Frames = frames;
        drawPitchCurve(state, frames);
        setPitchStatus(state, "Ready");
    } catch (error) {
        console.error("Pitch Lab analysis error:", error);
        setPitchStatus(state, "Could not draw pitch. Try again.");
    } finally {
        if (audioContext && audioContext.state !== "closed") {
            try {
                await audioContext.close();
            } catch (error) {
                console.warn("Could not close AudioContext:", error);
            }
        }

        state.isAnalyzing = false;
        state.recordBtn.disabled = false;
        state.playBtn.disabled = !state.audioBlob;
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
