
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
const VOICE_STORAGE_KEY = "october2026.selectedVoiceName";
let preferredVoice = null;

function setupPreferredVoice() {
    try {
        const voices =
            typeof speechSynthesis !== "undefined"
                ? speechSynthesis.getVoices()
                : [];

        const japanese = (voices || []).filter(
            v => v && v.lang && /^ja/i.test(v.lang)
        );

        let savedName = null;
        try {
            savedName = localStorage.getItem(VOICE_STORAGE_KEY);
        } catch (e) {}

        let selected = savedName
            ? japanese.find(v => v.name === savedName)
            : null;

        if (!selected) {
            selected =
                japanese.find(v =>
                    v.name && /chrome os/i.test(v.name)
                )
                || japanese.find(v =>
                    v.name && /keita/i.test(v.name)
                )
                || japanese.find(v =>
                    v.name && /nanami/i.test(v.name)
                )
                || japanese.find(v =>
                    v.name && /google/i.test(v.name)
                )
                || japanese[0]
                || null;
        }

        preferredVoice = selected;

        const selectEl = document.getElementById("voiceSelect");
        if (selectEl) {
            if (!selectEl.dataset.bound) {
                selectEl.dataset.bound = "true";
                selectEl.addEventListener("change", () => {
                    try {
                        localStorage.setItem(
                            VOICE_STORAGE_KEY,
                            selectEl.value
                        );
                    } catch (e) {}
                    setupPreferredVoice();
                });
            }

            const signature = japanese.map(v => v.name).join("||");
            if (selectEl.dataset.voicesSignature !== signature) {
                selectEl.dataset.voicesSignature = signature;
                selectEl.replaceChildren();

                if (!japanese.length) {
                    const opt = document.createElement("option");
                    opt.value = "";
                    opt.textContent = "No Japanese voice available";
                    selectEl.append(opt);
                    selectEl.disabled = true;
                } else {
                    selectEl.disabled = false;
                    japanese.forEach(v => {
                        const opt = document.createElement("option");
                        opt.value = v.name;
                        opt.textContent = v.name;
                        selectEl.append(opt);
                    });
                }
            }

            if (selected && selectEl.value !== selected.name) {
                selectEl.value = selected.name;
            }
        }
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
        currentPlayingAudio.onended = null;
        currentPlayingAudio.onerror = null;
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
    }

    restorePlayButtons();

    if (activePitchPlayingState) {
        const state = activePitchPlayingState;
        activePitchPlayingState = null;

        if (!state.isRecording && !state.isAnalyzing) {
            if (state.listenBtn) {
                state.listenBtn.disabled = !state.modelText;
            }

            state.recordBtn.disabled = false;
            state.playBtn.disabled = !state.audioBlob;

            setPitchStatus(
                state,
                state.audioBlob ? "Ready" : "Not recorded yet"
            );
        }
    }
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
    setupPreferredVoice();
}

const pronunciation1State = {
    audioUrls: {},
    views: {},
    starting: null,
    locked: new Map(),
    playback: 0
};

let activePitchRecordingState = null;
let activePitchPlayingState = null;
let pronunciationCapture = null;

function initSettingsPanel() {
    for (const [id, labelId, get, set] of [
        [
            "toggleRecordMode",
            "labelAutoRecord",
            () => !isManualStop,
            value => { isManualStop = !value; }
        ],
        [
            "togglePlaybackMode",
            "labelAutoPlay",
            () => isAutoPlay,
            value => { isAutoPlay = value; }
        ]
    ]) {
        const toggle = document.getElementById(id);
        const label = document.getElementById(labelId);

        if (!toggle) continue;

        toggle.checked = get();
        updateToggleLabelStyle(label, get());

        toggle.addEventListener("change", () => {
            set(toggle.checked);
            updateToggleLabelStyle(label, get());
        });
    }

    const kanji = document.querySelector(
        '#scriptModeControl [data-value="kanji"]'
    );

    if (kanji) {
        kanji.disabled = true;
        kanji.setAttribute("aria-disabled", "true");
        kanji.classList.add("pronunciation-kanji-disabled");
    }
}

function updateToggleLabelStyle(label, active) {
    if (!label) return;

    label.classList.toggle("active-mode", active);
    label.classList.toggle("inactive-mode", !active);
}

function pronunciation1Busy() {
    return Boolean(
        pronunciationCapture
        || activeRecognitionSession
        || pronunciation1State.starting !== null
        || activePitchRecordingState
    );
}

function pronunciation1Sync() {
    const controls = document.querySelectorAll(
        "#drill1List button, #pitchLab button, .compact-settings input"
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

        const session = pronunciationCapture;

        if (session?.recording && !session.stopping) {
            const stop = session.state?.stopBtn
                || pronunciation1State.views[session.key]?.stopBtn;

            if (stop) {
                stop.disabled = !session.manual;
                stop.classList.toggle(
                    "stop-btn-active",
                    session.manual
                );
            }
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
}

function renderDrill1Section() {
    if (pronunciation1Busy()) return;

    const container = document.getElementById("drill1List");
    if (!container) return;

    ++pronunciation1State.playback;
    stopAllPlayback();

    pronunciation1State.views = {};
    container.replaceChildren();

    drill1Data.forEach((item, index) => {
        createDrill1Row(
            container,
            `${index + 1}.`,
            item,
            0.9
        );
    });

    let width = 0;

    container.querySelectorAll(
        ".drill-cue-cell"
    ).forEach(cell => {
        const measure = document.createElement("span");

        cell.childNodes.forEach(child =>
            measure.append(child.cloneNode(true))
        );

        // 内容幅の測定専用。
        Object.assign(measure.style, {
            position: "absolute",
            visibility: "hidden",
            display: "inline-block",
            width: "max-content",
            whiteSpace: "nowrap",
            font: "inherit"
        });

        cell.append(measure);

        width = Math.max(
            width,
            Math.ceil(measure.getBoundingClientRect().width)
        );

        measure.remove();
    });

    container.querySelectorAll(
        "colgroup"
    ).forEach(columns => {
        columns.children[1].style.width = `${width + 8}px`;
    });

    pronunciation1Sync();
}

function pronunciation1Show(view, message = "") {
    const {resultSpan, key} = view;

    const recorded = Boolean(
        pronunciation1State.audioUrls[key]
    );

    resultSpan.textContent = recorded
        ? "Recorded "
        : "(Not recorded yet) ";

    resultSpan.style.color = recorded
        ? "var(--text-primary)"
        : "var(--text-secondary)";

    if (recorded) {
        const play = document.createElement("button");

        play.type = "button";
        play.className =
            "example-button play-recording-btn custom-tip-wrap";

        play.innerHTML =
            '▶️<span class="custom-tip-box">Play your recorded voice</span>';

        play.onclick = () =>
            pronunciation1Play(key, false);

        resultSpan.append(play);
    }

    if (message) {
        const notice = document.createElement("span");
        notice.textContent = " " + message;
        notice.style.color = "var(--text-secondary)";
        resultSpan.append(notice);
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

    const view = pronunciation1State.views[key];
    if (!view) return;

    const version = ++pronunciation1State.playback;

    const selected = model
        ? view.listenBtn
        : view.resultSpan.querySelector(".play-recording-btn");

    setPlayingStateMultiple(
        [selected].filter(Boolean),
        "Playing..."
    );

    let completed = false;

    const finish = () => {
        if (
            version !== pronunciation1State.playback
            || completed
        ) {
            return;
        }

        completed = true;
        stopAllPlayback();
        pronunciation1Sync();
    };

    const own = () => {
        if (
            version !== pronunciation1State.playback
            || pronunciation1Busy()
        ) {
            return;
        }

        const url = pronunciation1State.audioUrls[key];

        if (!url) {
            finish();
            return;
        }

        const audio = new Audio(url);
        currentPlayingAudio = audio;
        audio.playbackRate = 1;

        audio.onended = finish;
        audio.onerror = finish;
        audio.play().catch(finish);
    };

    if (!model) {
        own();
        return;
    }

    let modelEnded = false;

    const afterModel = () => {
        if (
            modelEnded
            || version !== pronunciation1State.playback
        ) {
            return;
        }

        modelEnded = true;

        if (playOwnAfter) own();
        else finish();
    };

    try {
        speakText(
            view.item.kanji,
            view.playRate,
            afterModel
        );
    } catch (error) {
        afterModel();
    }
}

function createDrill1Row(
    container,
    indexLabel,
    item,
    playRate
) {
    const make = (tag, cls = "", text = "") => {
        const element = document.createElement(tag);
        element.className = cls;
        element.textContent = text;
        return element;
    };

    const button = (text, tip) => {
        const element = make(
            "button",
            "example-button custom-tip-wrap",
            text
        );

        element.type = "button";
        element.append(
            make("span", "custom-tip-box", tip)
        );

        return element;
    };

    const key = indexLabel;
    const row = make("div", "drill-row");
    const table = make("table", "recording-table");
    const columns = make("colgroup");

    columns.append(
        make("col"),
        make("col"),
        make("col")
    );

    columns.children[0].style.width = "34px";

    const body = make("tbody");
    const line = make("tr");

    const number = make(
        "td",
        "drill-number-cell",
        indexLabel
    );

    const cue = make("td", "drill-cue-cell");
    cue.innerHTML = renderPitchAccentHTML(
        item.text,
        item.color
    );

    const cell = make("td");
    const controls = make("div", "recording-controls");
    const actions = make("div", "recording-actions");

    const listenBtn = button(
        "🔊きく",
        "Listen to the model."
    );

    const recordBtn = button(
        "🎙️とる",
        "Record your voice."
    );

    const stopBtn = button(
        "⏹️",
        "Stop recording."
    );

    stopBtn.disabled = true;

    const resultSpan = make("span", "result-text");
    const result = make("span", "recording-result");

    result.append(resultSpan);
    actions.append(listenBtn, recordBtn, stopBtn);
    controls.append(actions, result);
    cell.append(controls);
    line.append(number, cue, cell);
    body.append(line);
    table.append(columns, body);
    row.append(table);
    container.append(row);

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

    listenBtn.onclick = () =>
        pronunciation1Play(key);

    recordBtn.onclick = () =>
        pronunciation1Record(key);

    stopBtn.onclick = () => {
        if (
            pronunciationCapture?.key === key
            && pronunciationCapture.manual
        ) {
            pronunciationCapture.stop();
        }
    };

    pronunciation1Show(view);
}

function pronunciation1Record(key) {
    return pronunciationCaptureStart(key, null);
}

// DrillとLabに共通の録音処理。
async function pronunciationCaptureStart(key, state) {
    if (pronunciation1Busy() || state?.isAnalyzing) return;

    const status = message => {
        if (state) {
            setPitchStatus(state, message);
        } else {
            pronunciation1Show(
                pronunciation1State.views[key],
                message
            );
        }
    };

    if (
        !navigator.mediaDevices?.getUserMedia
        || typeof MediaRecorder === "undefined"
    ) {
        status("Recording is not supported.");
        return;
    }

    ++pronunciation1State.playback;
    stopAllPlayback();

    const session = {
        key,
        state,
        manual: isManualStop,
        recording: false,
        stopping: false,
        finished: false,
        discard: false,
        speech: false,
        lastSound: 0,
        chunks: [],
        timers: [],
        stream: null,
        recorder: null,
        context: null,
        message: "",
        stop: null
    };

    pronunciationCapture = session;

    if (state) {
        activePitchRecordingState = state;
    } else {
        pronunciation1State.starting = key;
    }

    pronunciation1Sync();
    status("Requesting microphone access...");

    const clear = () => {
        session.timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });

        session.timers = [];
        session.context?.close().catch(() => {});
        session.context = null;
    };

    const finish = async () => {
        if (session.finished) return;

        session.finished = true;
        clear();

        session.stream?.getTracks().forEach(
            track => track.stop()
        );

        const valid =
            !session.discard
            && session.speech
            && session.chunks.some(chunk => chunk.size > 0);

        const blob = valid
            ? new Blob(session.chunks, {
                type: session.recorder?.mimeType || "audio/webm"
            })
            : null;

        session.chunks = [];

        if (state) {
            state.isRecording = false;
            state.stopBtn.classList.remove("stop-btn-active");
        } else {
            activeRecognitionSession = null;
            pronunciation1State.starting = null;

            pronunciation1State.views[key]
                .stopBtn.classList.remove("stop-btn-active");
        }

        // 有効な新録音ができた場合だけ、以前の音声を置き換える。
        if (blob) {
            const url = URL.createObjectURL(blob);

            const old = state
                ? state.audioUrl
                : pronunciation1State.audioUrls[key];

            if (state) {
                state.audioBlob = blob;
                state.audioUrl = url;
                state.f0Frames = null;
            } else {
                pronunciation1State.audioUrls[key] = url;
            }

            if (old) URL.revokeObjectURL(old);
        }

        try {
            if (state && blob) {
                await analyzePitchRecording(state);
            } else if (state) {
                if (state.f0Frames?.length) {
                    drawPitchCurve(state, state.f0Frames);
                } else {
                    drawPitchPlaceholder(
                        state,
                        "Record your voice to begin."
                    );
                }
            }
        } finally {
            pronunciationCapture = null;
            activePitchRecordingState = null;
            pronunciation1State.starting = null;

            pronunciation1Sync();

            if (state) {
                if (state.listenBtn) {
                    state.listenBtn.disabled = !state.modelText;
                }
                state.recordBtn.disabled = false;
                state.stopBtn.disabled = true;
                state.playBtn.disabled = !state.audioBlob;
            }

            const message = session.message
                || (!valid ? "No speech detected." : "");

            if (!state || message) status(message);

            if (valid && isAutoPlay) {
                if (state) {
                    playPitchRecording(state);
                } else {
                    pronunciation1Play(key, true, true);
                }
            }
        }
    };

    session.stop = (message = "", discard = false) => {
        if (session.stopping || session.finished) return;

        session.stopping = true;
        session.message = message;
        session.discard = discard;

        clear();
        pronunciation1Sync();

        if (
            !session.recorder
            || session.recorder.state === "inactive"
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
    };

    try {
        session.stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        const Context =
            window.AudioContext || window.webkitAudioContext;

        const context = new Context();
        session.context = context;

        const source = context.createMediaStreamSource(
            session.stream
        );

        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);

        await context.resume();

        const samples = new Float32Array(analyser.fftSize);
        const recorder = new MediaRecorder(session.stream);

        session.recorder = recorder;

        recorder.ondataavailable = event => {
            if (!session.finished && event.data.size) {
                session.chunks.push(event.data);
            }
        };

        recorder.onstop = () => finish();

        recorder.onerror = () =>
            session.stop("Recording error.", true);

        session.recording = true;

        if (state) {
            state.recorder = recorder;
            state.isRecording = true;
            drawPitchPlaceholder(state, "Recording...");
        } else {
            pronunciation1State.starting = null;
            activeRecognitionSession = session;
        }

        recorder.start();
        status("Recording...");
        pronunciation1Sync();

        const sounds = [];
        let previous = performance.now();

        session.timers.push(setInterval(() => {
            if (session.stopping || session.finished) return;

            analyser.getFloatTimeDomainData(samples);

            const now = performance.now();
            const elapsed = Math.min(
                Math.max(now - previous, 0),
                40
            );

            previous = now;

            const sound = Math.sqrt(
                samples.reduce(
                    (sum, value) => sum + value * value,
                    0
                ) / samples.length
            ) > 0.015;

            sounds.push({
                time: now,
                duration: sound ? elapsed : 0
            });

            while (
                sounds.length
                && now - sounds[0].time > 400
            ) {
                sounds.shift();
            }

            // 短い単語の発音も検出する。
            if (
                !session.speech
                && sounds.reduce(
                    (sum, sample) => sum + sample.duration,
                    0
                ) >= 100
            ) {
                session.speech = true;
                session.lastSound = now;
            }

            if (session.speech && sound) {
                session.lastSound = now;
            }

            if (
                !session.manual
                && session.speech
                && now - session.lastSound >= 2000
            ) {
                session.stop();
            }
        }, 20));

        session.timers.push(setTimeout(() => {
            if (!session.speech) {
                session.stop(
                    "No speech detected within 15 seconds.",
                    true
                );
            }
        }, 15000));

        session.timers.push(setTimeout(() => {
            session.stop("Auto-stopped after 20 seconds.");
        }, 20000));
    } catch (error) {
        session.stop(
            "Could not start recording. Check microphone permissions.",
            true
        );
    }
}

function pronunciationLabTips() {
    document.querySelectorAll(
        "#pitchLab .pitch-play"
    ).forEach(button => {
        if (
            activePlayButtons.includes(button)
            || button.querySelector(".custom-tip-box")
        ) {
            return;
        }

        button.classList.add(
            "play-recording-btn",
            "custom-tip-wrap"
        );

        const tip = document.createElement("span");
        tip.className = "custom-tip-box";
        tip.textContent = "Play your recorded voice";
        button.append(tip);
        button.dataset.originalHtml = button.innerHTML;
    });
}

document.addEventListener(
    "DOMContentLoaded",
    pronunciationLabTips
);

document.addEventListener("click", event => {
    if (
        pronunciation1Busy()
        && event.target.closest(".pitch-pair-summary")
    ) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

document.addEventListener(
    "click",
    pronunciationLabTips
);

function initPitchLab() {
    const lab = document.getElementById("pitchLab");
    const grid = lab?.querySelector(".pitch-lab-grid");

    if (!grid || lab.querySelector("#pitchPairSelect")) return;

    const pairs = drill1Data.map((item, index) => ({
        id: String(index),
        words: item.text.split("｜").map(text => text.trim()),
        models: item.kanji
            .split("。")
            .map(text => text.trim())
            .filter(Boolean),
        free: false
    }));

    pairs.push({
        id: "free",
        words: ["First recording", "Second recording"],
        models: ["", ""],
        free: true
    });

    const picker = document.createElement("details");
    picker.className = "pitch-pair-picker";

    const summary = document.createElement("summary");
    summary.id = "pitchPairSelect";
    summary.className = "pitch-pair-summary";
    summary.setAttribute("aria-label", "Choose a word pair");

    const options = document.createElement("div");
    options.className = "pitch-pair-options";

    picker.append(summary, options);
    grid.before(picker);

    const cache = new Map();
    const choices = [];
    let selectedId = pairs[0].id;

    function pairContent(pair) {
        const content = document.createElement("span");
        content.className = "pitch-pair-content";

        pair.words.forEach((word, index) => {
            if (index) {
                const separator = document.createElement("span");
                separator.textContent = "↔️";
                separator.setAttribute("aria-hidden", "true");
                content.append(separator);
            }

            const part = document.createElement("span");

            if (pair.free) {
                part.textContent = word;
            } else {
                part.innerHTML = renderPitchAccentHTML(
                    word,
                    "#e879f9"
                );
            }

            content.append(part);
        });

        return content;
    }

    function busy() {
        return Array.from(cache.values()).flat().some(
            state =>
                state.isRecording
                || state.isAnalyzing
                || activePitchRecordingState === state
        );
    }

    function redraw(state) {
        if (state.f0Frames?.length) {
            drawPitchCurve(state, state.f0Frames);
        } else {
            drawPitchPlaceholder(
                state,
                state.isRecording
                    ? "Recording..."
                    : "Record your voice to begin."
            );
        }
    }

    function makeCard(word, pair, side) {
        const card = document.createElement("section");
        card.className = "pitch-card";
        card.dataset.pitchSide = `${pair.id}-${side}`;
        card.setAttribute("aria-label", word);

        const controls = document.createElement("div");
        controls.className = "pitch-controls";

        function button(text, className, label, tipText = "") {
            const element = document.createElement("button");
            element.type = "button";
            element.className = `example-button ${className}`;
            element.textContent = text;

            element.setAttribute(
                "aria-label",
                `${label}: ${word}`
            );

            if (tipText) {
                element.classList.add("custom-tip-wrap");
                const tip = document.createElement("span");
                tip.className = "custom-tip-box";
                tip.textContent = tipText;
                element.append(tip);
            }

            element.dataset.originalHtml = element.innerHTML;

            return element;
        }

        const modelText = pair.models?.[side] || "";

        const listenBtn = button(
            "🔊きく",
            "pitch-listen",
            "Listen to the model",
            "Listen to the model."
        );

        const recordBtn = button(
            "🎙️とる",
            "pitch-record",
            "Record",
            "Record your voice."
        );

        const stopBtn = button(
            "⏹️",
            "pitch-stop",
            "Stop recording",
            "Stop recording."
        );

        const playBtn = button(
            "▶️",
            "pitch-play play-recording-btn",
            "Play your recording",
            "Play your recorded voice"
        );

        listenBtn.disabled = !modelText;
        stopBtn.disabled = true;
        playBtn.disabled = true;

        const statusEl = document.createElement("span");
        statusEl.className = "pitch-status";
        statusEl.setAttribute("role", "status");
        statusEl.setAttribute("aria-live", "polite");
        statusEl.textContent = "Not recorded yet";

        const canvas = document.createElement("canvas");
        canvas.className = "pitch-canvas";

        canvas.setAttribute(
            "aria-label",
            `Recorded pitch: ${word}`
        );

        controls.append(
            listenBtn,
            recordBtn,
            stopBtn,
            playBtn,
            statusEl
        );

        card.append(controls, canvas);

        const state = {
            card,
            side: card.dataset.pitchSide,
            modelText,
            listenBtn,
            recordBtn,
            stopBtn,
            playBtn,
            statusEl,
            canvas,
            recorder: null,
            stream: null,
            chunks: [],
            audioBlob: null,
            audioUrl: null,
            isRecording: false,
            isAnalyzing: false,
            f0Frames: null
        };

        listenBtn.addEventListener("click", () => {
            playPitchModel(state);
        });

        recordBtn.addEventListener("click", () => {
            startPitchRecording(state);
        });

        stopBtn.addEventListener("click", () => {
            stopPitchRecording(state);
        });

        playBtn.addEventListener("click", () => {
            playPitchRecording(state);
        });

        if (typeof ResizeObserver !== "undefined") {
            state.observer = new ResizeObserver(() => {
                if (canvas.isConnected && canvas.clientWidth) {
                    redraw(state);
                }
            });

            state.observer.observe(canvas);
        }

        return state;
    }

    function showPair(pair) {
        if (!cache.has(pair.id)) {
            cache.set(
                pair.id,
                pair.words.map((word, side) =>
                    makeCard(word, pair, side)
                )
            );
        }

        selectedId = pair.id;
        summary.replaceChildren(pairContent(pair));

        summary.setAttribute(
            "aria-label",
            "Choose a word pair: "
                + (
                    pair.free
                        ? "Free practice"
                        : pair.words.join(" / ")
                )
        );

        choices.forEach((choice, index) => {
            choice.setAttribute(
                "aria-current",
                String(pairs[index].id === selectedId)
            );
        });

        const states = cache.get(pair.id);
        grid.replaceChildren(
            ...states.map(state => state.card)
        );

        states.forEach(redraw);
    }

    pairs.forEach(pair => {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "pitch-pair-choice";

        if (pair.free) {
            choice.textContent = "Free practice";
        } else {
            choice.append(pairContent(pair));
        }

        choice.addEventListener("click", () => {
            if (busy()) return;

            ++pronunciation1State.playback;
            stopAllPlayback();

            showPair(pair);
            picker.open = false;
            summary.focus();
        });

        choices.push(choice);
        options.append(choice);
    });

    picker.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            picker.open = false;
            summary.focus();
            event.preventDefault();
        } else if (
            event.key === "ArrowDown"
            || event.key === "ArrowUp"
        ) {
            event.preventDefault();
            picker.open = true;

            let index = choices.indexOf(
                document.activeElement
            );

            if (index < 0) {
                index = pairs.findIndex(
                    pair => pair.id === selectedId
                );
            } else {
                const direction =
                    event.key === "ArrowDown" ? 1 : -1;

                index = (
                    index + direction + choices.length
                ) % choices.length;
            }

            choices[index].focus();
        }
    });

    document.addEventListener("click", event => {
        if (!picker.contains(event.target)) {
            picker.open = false;
        }
    });

    showPair(pairs[0]);
}

function startPitchRecording(state) {
    return pronunciationCaptureStart(null, state);
}

function stopPitchRecording(state) {
    if (
        pronunciationCapture?.state === state
        && pronunciationCapture.manual
    ) {
        pronunciationCapture.stop();
    }
}

function playPitchModel(state) {
    if (
        pronunciation1Busy()
        || state.isAnalyzing
        || !state.modelText
    ) {
        return;
    }

    const version = ++pronunciation1State.playback;

    setPlayingStateMultiple(
        [state.listenBtn],
        "Playing..."
    );

    activePitchPlayingState = state;
    setPitchStatus(state, "Playing...");

    let completed = false;

    const finish = () => {
        if (
            completed
            || version !== pronunciation1State.playback
        ) {
            return;
        }

        completed = true;
        stopAllPlayback();
    };

    try {
        speakText(state.modelText, 0.9, finish);
    } catch (error) {
        finish();
    }
}

function playPitchRecording(state) {
    if (
        pronunciation1Busy()
        || state.isAnalyzing
        || !state.audioUrl
        || !state.audioBlob
    ) {
        return;
    }

    const version = ++pronunciation1State.playback;

    setPlayingStateMultiple(
        [state.playBtn],
        "Playing..."
    );

    activePitchPlayingState = state;
    setPitchStatus(state, "Playing...");

    const audio = new Audio(state.audioUrl);
    currentPlayingAudio = audio;
    audio.playbackRate = 1;

    let completed = false;

    const finish = () => {
        if (
            completed
            || version !== pronunciation1State.playback
        ) {
            return;
        }

        completed = true;
        stopAllPlayback();
    };

    audio.onended = finish;
    audio.onerror = finish;
    audio.play().catch(finish);
}
async function analyzePitchRecording(state) {
    if (!state.audioBlob || state.isAnalyzing) return;

    state.isAnalyzing = true;
    if (state.listenBtn) {
        state.listenBtn.disabled = true;
    }
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
        if (state.listenBtn) {
            state.listenBtn.disabled = !state.modelText;
        }
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

    const minFrequency = 75;
    const maxFrequency = 400;

    const minLag = Math.floor(sampleRate / maxFrequency);
    const maxLag = Math.ceil(sampleRate / minFrequency);

    if (samples.length < frameLength) {
        return [];
    }

    // Build Hann window once per analysis.
    const hannWindow = new Float32Array(frameLength);
    for (let i = 0; i < frameLength; i++) {
        hannWindow[i] =
            0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameLength - 1)));
    }

    const rawFrames = [];
    let maxRms = 0;

    for (
        let start = 0;
        start + frameLength <= samples.length;
        start += hopLength
    ) {
        const frame = samples.subarray(
            start,
            start + frameLength
        );

        let mean = 0;
        for (let i = 0; i < frameLength; i++) {
            mean += frame[i];
        }
        mean /= frameLength;

        let energy = 0;
        let zeroCrossings = 0;
        let prev = frame[0] - mean;

        for (let i = 0; i < frameLength; i++) {
            const centeredVal = frame[i] - mean;
            energy += centeredVal * centeredVal;

            if (
                (centeredVal >= 0 && prev < 0)
                || (centeredVal < 0 && prev >= 0)
            ) {
                zeroCrossings++;
            }
            prev = centeredVal;
        }

        const rms = Math.sqrt(energy / frameLength);
        if (rms > maxRms) {
            maxRms = rms;
        }

        const zcrHz = (zeroCrossings * sampleRate) / (2 * frameLength);

        rawFrames.push({
            start,
            time: (start + frameLength / 2) / sampleRate,
            rms,
            zcrHz,
            mean,
            f0: null
        });
    }

    if (maxRms < 0.008) {
        return rawFrames.map(({ time }) => ({ time, f0: null }));
    }

    // Relative vocal energy gate: ignore background hum, breath, and silence.
    const rmsThreshold = Math.max(0.008, maxRms * 0.18);

    for (let idx = 0; idx < rawFrames.length; idx++) {
        const info = rawFrames[idx];

        // Skip low-energy frames and high-frequency unvoiced fricatives (s, sh, h).
        if (info.rms < rmsThreshold || info.zcrHz > 2200) {
            continue;
        }

        const frame = samples.subarray(
            info.start,
            info.start + frameLength
        );

        info.f0 = estimateFrameF0(
            frame,
            info.mean,
            hannWindow,
            sampleRate,
            minLag,
            maxLag
        );
    }

    // 1. 5-frame median filter to eliminate isolated 1-2 frame octave spikes.
    const medianFiltered = rawFrames.map((frame, i) => {
        if (!Number.isFinite(frame.f0)) return null;

        const neighbors = [];
        for (
            let j = Math.max(0, i - 2);
            j <= Math.min(rawFrames.length - 1, i + 2);
            j++
        ) {
            if (Number.isFinite(rawFrames[j].f0)) {
                neighbors.push(rawFrames[j].f0);
            }
        }

        if (neighbors.length < 3) return null;

        const med = calculateMedian(neighbors);
        if (Math.abs(frame.f0 - med) / med > 0.18) {
            return med;
        }

        return frame.f0;
    });

    for (let i = 0; i < rawFrames.length; i++) {
        rawFrames[i].f0 = medianFiltered[i];
    }

    // 2. Bridge tiny 1-2 frame (10-20ms) gaps within a smooth voiced contour.
    for (let i = 1; i < rawFrames.length - 2; i++) {
        if (!Number.isFinite(rawFrames[i].f0)) {
            const left = rawFrames[i - 1].f0;
            const right1 = rawFrames[i + 1].f0;
            const right2 = rawFrames[i + 2].f0;

            if (
                Number.isFinite(left)
                && Number.isFinite(right1)
                && Math.abs(left - right1) / left < 0.12
            ) {
                rawFrames[i].f0 = (left + right1) / 2;
            } else if (
                Number.isFinite(left)
                && !Number.isFinite(right1)
                && Number.isFinite(right2)
                && Math.abs(left - right2) / left < 0.12
            ) {
                rawFrames[i].f0 = (2 * left + right2) / 3;
                rawFrames[i + 1].f0 = (left + 2 * right2) / 3;
            }
        }
    }

    // 3. Extract contiguous voiced segments and filter out short noise blips (< 60ms)
    //    or segments far weaker than the main spoken word.
    const segments = [];
    let currentSeg = [];

    for (let i = 0; i < rawFrames.length; i++) {
        if (Number.isFinite(rawFrames[i].f0)) {
            currentSeg.push(i);
        } else if (currentSeg.length) {
            segments.push(currentSeg);
            currentSeg = [];
        }
    }
    if (currentSeg.length) {
        segments.push(currentSeg);
    }

    // Trim steep consonant-onset/offset jumps at the edges of each segment.
    const validSegments = [];

    for (const seg of segments) {
        if (seg.length < 6) continue;

        const segMedian = calculateMedian(
            seg.map(idx => rawFrames[idx].f0)
        );

        // Reject outlier frames within the segment that deviate > 28% from segment median
        // or jump > 12% in a single 10ms step at segment boundaries.
        let startIdx = 0;
        let endIdx = seg.length - 1;

        while (startIdx < endIdx) {
            const fCur = rawFrames[seg[startIdx]].f0;
            const fNext = rawFrames[seg[startIdx + 1]].f0;
            if (
                Math.abs(fCur - fNext) / fNext > 0.10
                || Math.abs(fCur - segMedian) / segMedian > 0.28
            ) {
                startIdx++;
            } else {
                break;
            }
        }

        while (endIdx > startIdx) {
            const fCur = rawFrames[seg[endIdx]].f0;
            const fPrev = rawFrames[seg[endIdx - 1]].f0;
            if (
                Math.abs(fCur - fPrev) / fPrev > 0.10
                || Math.abs(fCur - segMedian) / segMedian > 0.28
            ) {
                endIdx--;
            } else {
                break;
            }
        }

        const trimmed = seg.slice(startIdx, endIdx + 1);
        if (trimmed.length >= 6) {
            const peakRms = Math.max(
                ...trimmed.map(idx => rawFrames[idx].rms)
            );
            const totalEnergy = trimmed.reduce(
                (sum, idx) =>
                    sum + rawFrames[idx].rms * rawFrames[idx].rms,
                0
            );

            validSegments.push({
                indices: trimmed,
                peakRms,
                totalEnergy,
                startTime: rawFrames[trimmed[0]].time,
                endTime: rawFrames[trimmed[trimmed.length - 1]].time
            });
        }
    }

    const cleanedF0 = new Array(rawFrames.length).fill(null);

    if (validSegments.length) {
        // Identify the primary spoken word segment (highest total vocal energy)
        // and keep only segments belonging to that utterance.
        const mainSeg = validSegments.reduce((best, seg) =>
            seg.totalEnergy > best.totalEnergy ? seg : best
        );

        const keptSegments = validSegments.filter(seg => {
            const timeGap = Math.max(
                0,
                seg.startTime - mainSeg.endTime,
                mainSeg.startTime - seg.endTime
            );
            return (
                seg.peakRms >= mainSeg.peakRms * 0.30
                && timeGap <= 0.45
            );
        });

        // 4. Smooth each kept voiced segment with 2 passes of a weighted 5-point filter
        //    so only the clear pitch movement (rise/fall) is drawn.
        const weights = [1, 2, 3, 2, 1];

        for (const seg of keptSegments) {
            let values = seg.indices.map(idx => rawFrames[idx].f0);

            for (let pass = 0; pass < 2; pass++) {
                values = values.map((_, pos) => {
                    let weightedSum = 0;
                    let weightTotal = 0;

                    for (let offset = -2; offset <= 2; offset++) {
                        const neighborPos = pos + offset;
                        if (
                            neighborPos >= 0
                            && neighborPos < values.length
                        ) {
                            const w = weights[offset + 2];
                            weightedSum += values[neighborPos] * w;
                            weightTotal += w;
                        }
                    }

                    return weightedSum / weightTotal;
                });
            }

            seg.indices.forEach((frameIdx, pos) => {
                cleanedF0[frameIdx] = values[pos];
            });
        }
    }

    return rawFrames.map((frame, i) => ({
        time: frame.time,
        f0: cleanedF0[i]
    }));
}

function estimateFrameF0(
    frame,
    mean,
    hannWindow,
    sampleRate,
    minLag,
    maxLag
) {
    const length = frame.length;
    const windowed = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        windowed[i] = (frame[i] - mean) * hannWindow[i];
    }

    const upperLag = Math.min(maxLag, length - 2);
    const correlations = new Float32Array(upperLag + 1);

    // Find the first zero-crossing of the autocorrelation after lag = 0
    // so we never pick the lag = 0 main lobe slope at minLag (400 Hz).
    let passedZero = false;

    for (let lag = 1; lag <= upperLag; lag++) {
        let cross = 0;
        let energyA = 0;
        let energyB = 0;

        for (let i = 0; i < length - lag; i++) {
            const a = windowed[i];
            const b = windowed[i + lag];

            cross += a * b;
            energyA += a * a;
            energyB += b * b;
        }

        const denominator = Math.sqrt(energyA * energyB);
        const corr = denominator > 0 ? cross / denominator : 0;

        if (!passedZero) {
            if (corr <= 0) {
                passedZero = true;
            }
            continue;
        }

        correlations[lag] = corr;
    }

    if (!passedZero) {
        return null;
    }

    // Collect local maxima within [minLag, upperLag].
    const peaks = [];
    let maxPeakCorr = 0;

    for (let lag = Math.max(minLag, 2); lag < upperLag; lag++) {
        const corr = correlations[lag];
        if (
            corr >= 0.68
            && corr > correlations[lag - 1]
            && corr >= correlations[lag + 1]
        ) {
            peaks.push({ lag, corr });
            if (corr > maxPeakCorr) {
                maxPeakCorr = corr;
            }
        }
    }

    if (!peaks.length || maxPeakCorr < 0.68) {
        return null;
    }

    // Choose the first strong peak (>= 90% of the highest peak) to avoid
    // picking a half-frequency subharmonic octave drop.
    const chosen = peaks.find(
        peak => peak.corr >= maxPeakCorr * 0.90
    ) || peaks[0];

    let refinedLag = chosen.lag;
    const prevCorr = correlations[chosen.lag - 1];
    const nextCorr = correlations[chosen.lag + 1];
    const denom = prevCorr - 2 * chosen.corr + nextCorr;

    if (Math.abs(denom) > 1e-6) {
        const delta = 0.5 * (prevCorr - nextCorr) / denom;
        if (Math.abs(delta) <= 0.5) {
            refinedLag += delta;
        }
    }

    const f0 = sampleRate / refinedLag;

    if (f0 < 75 || f0 > 400) {
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

    // Focus the time window around the voiced speech so leading/trailing silence
    // does not compress the word contour into a tiny sliver.
    const voicedFrames = frames.filter(
        frame =>
            Number.isFinite(frame.f0)
            && frame.f0 >= minHz
            && frame.f0 <= maxHz
    );

    const totalDuration = Math.max(
        frames[frames.length - 1].time,
        0.1
    );

    let windowStart = 0;
    let windowEnd = totalDuration;

    if (voicedFrames.length) {
        const firstVoiced = voicedFrames[0].time;
        const lastVoiced = voicedFrames[voicedFrames.length - 1].time;
        const voicedSpan = Math.max(0, lastVoiced - firstVoiced);
        const targetSpan = Math.max(0.8, voicedSpan + 0.30);
        const center = (firstVoiced + lastVoiced) / 2;

        windowStart = Math.max(0, center - targetSpan / 2);
        windowEnd = Math.min(totalDuration, windowStart + targetSpan);
        windowStart = Math.max(0, windowEnd - targetSpan);
    }

    const windowDuration = Math.max(windowEnd - windowStart, 0.1);

    context.fillStyle = "#777777";
    context.font = "10px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";

    context.fillText("0 s", plotLeft, plotBottom + 7);
    context.fillText(
        `${windowDuration.toFixed(1)} s`,
        plotRight,
        plotBottom + 7
    );

    // Draw a smooth, bold curve for each continuous voiced section
    // with start/end endpoint markers instead of noisy per-frame dots.
    context.strokeStyle = "#0d9488";
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.lineCap = "round";

    const segments = [];
    let currentSegment = [];

    frames.forEach(frame => {
        if (
            !Number.isFinite(frame.f0) ||
            frame.f0 < minHz ||
            frame.f0 > maxHz ||
            frame.time < windowStart ||
            frame.time > windowEnd
        ) {
            if (currentSegment.length) {
                segments.push(currentSegment);
                currentSegment = [];
            }
            return;
        }

        const x =
            plotLeft +
            ((frame.time - windowStart) / windowDuration) * plotWidth;

        const y =
            plotBottom -
            ((frame.f0 - minHz) / (maxHz - minHz)) * plotHeight;

        currentSegment.push({ x, y });
    });

    if (currentSegment.length) {
        segments.push(currentSegment);
    }

    segments.forEach(points => {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
            const midX = (points[i].x + points[i + 1].x) / 2;
            const midY = (points[i].y + points[i + 1].y) / 2;
            context.quadraticCurveTo(
                points[i].x,
                points[i].y,
                midX,
                midY
            );
        }

        if (points.length > 1) {
            const last = points[points.length - 1];
            context.lineTo(last.x, last.y);
        }

        context.stroke();

        // Draw subtle start and end markers so the direction of movement is clear.
        context.fillStyle = "#0d9488";
        [points[0], points[points.length - 1]].forEach(pt => {
            context.beginPath();
            context.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            context.fill();
        });
    });
}

function setPitchStatus(state, message) {
    if (state.statusEl) {
        state.statusEl.textContent = message;
    }
}
