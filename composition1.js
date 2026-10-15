// ============================================================================
// Composition 1: English ➡️ Japanese Approach (安定版 - 録音中/完了時のHiragana Onlyメッセージ対応)
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
    const scriptControl =
        document.getElementById("scriptModeControl");

    function updateScriptSelection() {
        if (!scriptControl) return;

        const selectedValue =
            useHiraganaOnly ? "hiragana" : "kanji";

        scriptControl.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === selectedValue;

            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    if (scriptControl) {
        updateScriptSelection();

        scriptControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !scriptControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["hiragana", "kanji"].includes(nextMode)) return;

            const nextHiraganaOnly = nextMode === "hiragana";

            if (nextHiraganaOnly === useHiraganaOnly) return;

            useHiraganaOnly = nextHiraganaOnly;

            updateScriptSelection();
            renderAll();
        });
    }

    // Autostop: checked = ON
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

    // Autoplay: checked = ON
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
}
function renderAll() {
    ++compositionState.playback;
    stopAllPlayback();

    compositionState.views = {};

    renderDrill1Section();
    renderDrill2Section();

    compositionSync();
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

const compositionState = {
    views: {}, starting: null, locked: new Map(), playback: 0
};

function compositionBusy() {
    return Boolean(
        activeRecognitionSession ||
        compositionState.starting !== null
    );
}

function compositionSync() {
    const busy = compositionBusy();
    const controls = document.querySelectorAll(
        "#drill1Container button, #drill2Container button, #drill2Container input"
    );

    if (busy) {
        controls.forEach(control => {
            if (!compositionState.locked.has(control)) {
                compositionState.locked.set(control, control.disabled);
            }
            control.disabled = true;
        });

        const session = activeRecognitionSession;
        const view = session &&
            compositionState.views[session.rowIndex];

        if (view) {
            const canStop = session.manual && !session.stopping;
            view.stopBtn.disabled = !canStop;
            view.stopBtn.classList.toggle("stop-btn-active", canStop);
        }
    } else {
        compositionState.locked.forEach((disabled, control) => {
            if (control.isConnected) control.disabled = disabled;
        });
        compositionState.locked.clear();
    }

    controls.forEach(control => {
        control.style.setProperty(
            "cursor",
            control.disabled ? "not-allowed" : "pointer",
            "important"
        );
    });
}

function compositionPlay(rowIndex, model = "", onlyModel = false) {
    if (compositionBusy()) return;

    const version = ++compositionState.playback;
    stopAllPlayback();

    const url = savedAudioUrls[rowIndex];

    const playOwn = () => {
        if (
            version !== compositionState.playback ||
            compositionBusy() || !url || onlyModel
        ) {
            return;
        }

        const audio = new Audio(url);
        currentPlayingAudio = audio;
        audio.playbackRate = 1;

        const ended = () => {
            if (currentPlayingAudio === audio) {
                currentPlayingAudio = null;
            }
        };

        audio.onended = ended;
        audio.onerror = ended;
        audio.play().catch(ended);
    };

    if (model) speakText(model, 0.9, playOwn);
    else playOwn();
}

function compositionTokens(text) {
    const chars = Array.from(
        String(text ?? "").normalize("NFKC")
    );
    const value = chars.join("");
    const suffix = value.match(/(?:よね|よ|ね)[。！？!?\s]*$/);
    const limit = suffix
        ? Array.from(value.slice(0, suffix.index)).length
        : chars.length;

    const lexicon = [
        "天気", "てんき", "時計", "とけい", "仕事", "しごと",
        "勉強", "べんきょう", "時間", "じかん", "傘", "かさ",
        "悪い", "わるい", "良い", "いい", "良く", "よく",
        "楽しい", "たのしい", "欲しい", "ほしい",
        "面白い", "おもしろい",
        "私", "わたし", "学生", "がくせい", "先生", "せんせい",
        "ありません", "じゃ", "では", "ない",
        "です", "でした", "が", "は", "か"
    ].sort((a, b) => b.length - a.length);

    const segmenter = typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter("ja", { granularity: "word" })
        : null;

    const tokens = [];

    for (let index = 0; index < limit;) {
        const rest = chars.slice(index, limit).join("");

        if (/^[\s、。,.!?！？「」『』・]/.test(rest)) {
            index++;
            continue;
        }

        const unit = lexicon.find(word => rest.startsWith(word)) ||
            (segmenter
                ? segmenter.segment(rest)[Symbol.iterator]().next().value.segment
                : chars[index]);

        const length = Array.from(unit).length;

        tokens.push({
            reading: convertToHiragana(unit)
                .normalize("NFKC")
                .toLowerCase()
                .replace(/[ァ-ヶ]/g, character =>
                    String.fromCharCode(character.charCodeAt(0) - 96)
                ),
            start: index,
            end: index + length
        });

        index += length;
    }

    return { chars, tokens };
}

function compositionDiff(actual, reference) {
    const a = compositionTokens(actual);
    const b = compositionTokens(reference);
    const n = a.tokens.length;
    const m = b.tokens.length;

    // このページ固有：「が／は」を許容する。
    const equal = (x, y) =>
        x === y ||
        ((x === "が" || x === "は") &&
         (y === "が" || y === "は"));

    const d = Array.from(
        { length: n + 1 },
        () => Array(m + 1).fill(0)
    );

    for (let i = 0; i <= n; i++) d[i][0] = i;
    for (let j = 0; j <= m; j++) d[0][j] = j;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + (
                    equal(
                        a.tokens[i - 1].reading,
                        b.tokens[j - 1].reading
                    ) ? 0 : 1
                )
            );
        }
    }

    const red = new Set();
    const blue = new Set();
    const gaps = new Set();

    const mark = (set, token) => {
        for (let k = token.start; k < token.end; k++) {
            set.add(k);
        }
    };

    let i = n;
    let j = m;

    while (i || j) {
        if (i && j) {
            const x = a.tokens[i - 1];
            const y = b.tokens[j - 1];
            const same = equal(x.reading, y.reading);

            if (
                d[i][j] ===
                d[i - 1][j - 1] + (same ? 0 : 1)
            ) {
                if (!same) mark(red, x);
                else if (x.reading !== y.reading) mark(blue, x);

                i--;
                j--;
                continue;
            }
        }

        if (j && d[i][j] === d[i][j - 1] + 1) {
            gaps.add(
                i < n
                    ? a.tokens[i].start
                    : n ? a.tokens[n - 1].end : 0
            );
            j--;
        } else {
            mark(red, a.tokens[i - 1]);
            i--;
        }
    }

    return {
        cost: d[n][m],
        chars: a.chars,
        red,
        blue,
        gaps
    };
}

function compositionShow(view, message = "") {
    const {
        rowIndex, item, resultSpan, correctionBox
    } = view;

    const saved = savedResults[rowIndex];

    resultSpan.textContent = "";
    resultSpan.style.color = "var(--text-primary)";
    correctionBox.style.display = "none";

    if (item && saved?.rawTranscript) {
        const raw = saved.rawTranscript;
        const displayed = useHiraganaOnly
            ? convertToHiragana(raw)
            : raw;

        const diff = compositionDiff(displayed, item.jaHira);
        saved.isCorrect = diff.cost === 0;

        const append = (text, color) => {
            const span = document.createElement("span");
            span.textContent = text;
            if (color) span.style.color = color;
            resultSpan.appendChild(span);
        };

        for (let i = 0; i <= diff.chars.length; i++) {
            if (diff.gaps.has(i)) {
                append("＿", "var(--error-text)");
            }

            if (i === diff.chars.length) break;

            append(
                diff.chars[i],
                diff.red.has(i)
                    ? "var(--error-text)"
                    : diff.blue.has(i) ? "#38bdf8" : null
            );
        }

        append(saved.isCorrect ? " ✅ " : " ");

        if (saved.isCorrect && diff.blue.size) {
            append(
                " (Both 'ga' and 'wa' are correct in this context)",
                "#38bdf8"
            );
        }

        if (!saved.isCorrect) {
            correctionBox.style.display = "block";
            view.corrText.textContent =
                "🔥 Keep going! Try once more!";
        }
    } else if (!item && savedAudioUrls[rowIndex]) {
        resultSpan.textContent = useHiraganaOnly
            ? "🐣Only Hiragana:🎙️Audio only "
            : (saved?.rawTranscript || "(Recorded)") + " ";
    } else {
        resultSpan.textContent = savedAudioUrls[rowIndex]
            ? "(Recorded) "
            : "(Not recorded yet) ";
        resultSpan.style.color = "var(--text-secondary)";
    }

    if (savedAudioUrls[rowIndex]) {
        if (item) {
            const model = document.createElement("button");
            model.type = "button";
            model.className = "example-button model-listen-btn";
            model.textContent = "🔊きく";
            model.style.marginLeft = "8px";
            model.onclick = () =>
                compositionPlay(rowIndex, item.jaHira, true);
            resultSpan.appendChild(model);
        }

        const play = document.createElement("button");
        play.type = "button";
        play.className = "example-button play-recording-btn";
        play.textContent = "▶️";
        play.setAttribute("aria-label", "Play your recorded voice");
        play.style.marginLeft = "6px";
        play.onclick = () => compositionPlay(rowIndex);
        resultSpan.appendChild(play);
    }

    if (message) {
        const notice = document.createElement("span");
        notice.textContent = message + " ";
        notice.style.color = "var(--text-secondary)";
        resultSpan.prepend(notice);
    }

    const session = activeRecognitionSession;

    if (session?.rowIndex === rowIndex) {
        resultSpan.textContent = !item && session.audioOnly
            ? "Recording...(🐣Only Hiragana:🎙️Audio only)"
            : "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (compositionState.starting === rowIndex) {
        resultSpan.textContent = "Preparing microphone...";
    }
}

function createDrill1Row(
    container, indexLabel, item, rowIndex, playRate
) {
    compositionCreateRow(container, indexLabel, item, rowIndex);
}

function createDrill2Row(container, indexLabel, playRate) {
    compositionCreateRow(
        container, indexLabel, null, drill1Data.length
    );
}

function compositionCreateRow(container, indexLabel, item, rowIndex) {
    const row = document.createElement("div");
    row.className = "drill-row";

    const top = document.createElement("div");
    top.className = "top-row";

    const index = document.createElement("strong");
    index.textContent = indexLabel;
    top.appendChild(index);

    if (item) {
        const prompt = document.createElement("span");
        prompt.className = "prompt-label";
        prompt.textContent = item.en;
        prompt.style.minWidth = "220px";
        top.appendChild(prompt);
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "custom-input";
        input.placeholder = "Optional reference text...";
        input.setAttribute("aria-label", "Optional reference text");
        input.style.flex = "1";
        input.style.minWidth = "180px";
        input.value = drill2State.inputVal;

        input.oninput = () => {
            drill2State.inputVal = input.value;
        };

        top.appendChild(input);
    }

    const recordBtn = document.createElement("button");
    recordBtn.type = "button";
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.disabled = true;
    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop the active recording.</span>';

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";

    top.append(recordBtn, stopBtn, resultSpan);
    row.appendChild(top);

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";

    const corrListen = document.createElement("button");
    corrListen.type = "button";
    corrListen.className = "example-button";
    corrListen.textContent = "🔊きく";
    corrListen.style.marginRight = "8px";
    corrListen.onclick = () =>
        compositionPlay(rowIndex, item?.jaHira || "", true);

    const corrText = document.createElement("span");
    correctionBox.append(corrListen, corrText);
    row.appendChild(correctionBox);

    const view = {
        rowIndex, item, recordBtn, stopBtn,
        resultSpan, correctionBox, corrText
    };

    compositionState.views[rowIndex] = view;
    recordBtn.onclick = () => compositionRecord(rowIndex);

    stopBtn.onclick = () => {
        const session = activeRecognitionSession;
        if (session?.rowIndex === rowIndex && session.manual) {
            session.stop();
        }
    };

    container.appendChild(row);
    compositionShow(view);
}

async function compositionRecord(rowIndex) {
    if (compositionBusy()) return;

    const view = compositionState.views[rowIndex];
    const audioOnly = !view.item && useHiraganaOnly;
    const manual = isManualStop;
    const Recognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (
        !navigator.mediaDevices?.getUserMedia ||
        !window.MediaRecorder
    ) {
        compositionShow(view, "Recording is not supported.");
        return;
    }

    if (!audioOnly && !Recognition) {
        compositionShow(view, "Speech recognition is not supported.");
        return;
    }

    ++compositionState.playback;
    stopAllPlayback();

    compositionState.starting = rowIndex;
    compositionSync();
    compositionShow(view);

    let stream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
    } catch (error) {
        compositionState.starting = null;
        compositionSync();
        compositionShow(
            compositionState.views[rowIndex],
            "Microphone access denied."
        );
        compositionSync();
        return;
    }

    compositionState.starting = null;

    const session = {
        rowIndex,
        manual,
        audioOnly,
        stopping: false,
        finished: false,
        discard: false,
        speech: false,
        lastSound: 0,
        raw: "",
        chunks: [],
        timers: [],
        context: null,
        recognition: null,
        recorder: null,
        recognitionDone: audioOnly,
        recorderDone: false,
        message: "",
        stop: null
    };

    activeRecognitionSession = session;

    const current = () => compositionState.views[rowIndex];

    const clear = () => {
        session.timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });
        session.timers = [];

        if (session.context) {
            session.context.close().catch(() => {});
            session.context = null;
        }
    };

    function finish() {
        if (
            session.finished ||
            !session.recorderDone ||
            !session.recognitionDone
        ) {
            return;
        }

        session.finished = true;
        clear();
        stream.getTracks().forEach(track => track.stop());

        if (session.recognition) {
            session.recognition.onend = null;
            session.recognition.onresult = null;
            session.recognition.onerror = null;
            session.recognition.onspeechstart = null;

            try {
                session.recognition.abort();
            } catch (error) {}
        }

        activeRecognitionSession = null;

        current().stopBtn.classList.remove("stop-btn-active");
        compositionSync();

        const valid =
            !session.discard &&
            session.speech &&
            session.chunks.some(chunk => chunk.size > 0);

        if (valid) {
            const url = URL.createObjectURL(
                new Blob(session.chunks, {
                    type: session.recorder.mimeType || "audio/webm"
                })
            );

            const old = savedAudioUrls[rowIndex];
            savedAudioUrls[rowIndex] = url;

            if (old) URL.revokeObjectURL(old);

            savedResults[rowIndex] = {
                rawTranscript: session.raw.trim(),
                audioOnly
            };
        }

        session.chunks = [];

        compositionShow(
            current(),
            session.message || (
                !valid || (!audioOnly && !session.raw.trim())
                    ? "No speech recognized."
                    : ""
            )
        );

        compositionSync();

        if (valid && isAutoPlay) {
            compositionPlay(rowIndex, view.item?.jaHira || "");
        }
    }

    function stop(message = "", discard = false) {
        if (session.finished || session.stopping) return;

        session.stopping = true;
        session.message = message;
        session.discard = discard;

        clear();
        compositionSync();

        if (session.recognition) {
            try {
                session.recognition.stop();
            } catch (error) {
                session.recognitionDone = true;
            }
        } else {
            session.recognitionDone = true;
        }

        if (
            !session.recorder ||
            session.recorder.state === "inactive"
        ) {
            session.recorderDone = true;
        } else {
            try {
                session.recorder.stop();
            } catch (error) {
                session.recorderDone = true;
                session.discard = true;
            }
        }

        session.timers.push(setTimeout(() => {
            try {
                session.recognition?.abort();
            } catch (error) {}

            session.recognitionDone = true;

            if (!session.recorderDone) {
                session.recorderDone = true;
                session.discard = true;
            }

            finish();
        }, 2500));

        finish();
    }

    session.stop = stop;

    try {
        if (!audioOnly) {
            const recognition = new Recognition();
            session.recognition = recognition;

            recognition.lang = "ja-JP";
            recognition.continuous = true;
            recognition.interimResults = true;

            const note = () => {
                session.speech = true;
                session.lastSound = performance.now();
            };

            recognition.onspeechstart = note;

            recognition.onresult = event => {
                if (session.finished || session.discard) return;

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    const result = event.results[i];

                    if (result[0].transcript.trim()) note();

                    if (result.isFinal) {
                        session.raw += result[0].transcript;
                    }
                }
            };

            recognition.onerror = event => {
                if (
                    session.finished ||
                    session.stopping ||
                    event.error === "no-speech"
                ) {
                    return;
                }

                session.recognitionDone = true;
                stop("Recognition error.", true);
            };

            recognition.onend = () => {
                if (session.finished) return;

                if (session.stopping) {
                    session.recognitionDone = true;
                    finish();
                    return;
                }

                try {
                    recognition.start();
                } catch (error) {
                    session.recognitionDone = true;
                    stop("Could not restart recognition.", true);
                }
            };
        }

        const recorder = new MediaRecorder(stream);
        session.recorder = recorder;

        recorder.ondataavailable = event => {
            if (!session.finished && event.data.size) {
                session.chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            session.recorderDone = true;
            finish();
        };

        recorder.onerror = () => stop("Recording error.", true);

        compositionShow(current());
        compositionSync();

        recorder.start();
        session.recognition?.start();

        try {
            const Context =
                window.AudioContext || window.webkitAudioContext;

            const context = new Context();
            session.context = context;

            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();

            analyser.fftSize = 1024;
            source.connect(analyser);

            const samples = new Float32Array(analyser.fftSize);
            let frames = 0;

            context.resume().catch(() => {});

            session.timers.push(setInterval(() => {
                if (session.stopping || session.finished) return;

                analyser.getFloatTimeDomainData(samples);

                let sum = 0;
                for (const sample of samples) {
                    sum += sample * sample;
                }

                const now = performance.now();

                if (Math.sqrt(sum / samples.length) > 0.015) {
                    frames++;
                    if (frames >= 3) session.speech = true;
                    if (session.speech) session.lastSound = now;
                } else {
                    frames = 0;
                }

                if (
                    !manual &&
                    session.speech &&
                    session.lastSound &&
                    now - session.lastSound >= 2000
                ) {
                    stop();
                }
            }, 100));
        } catch (error) {}

        session.timers.push(setTimeout(() => {
            if (!session.speech) {
                stop("No speech detected within 15 seconds.", true);
            }
        }, 15000));

        session.timers.push(setTimeout(() => {
            stop("Auto-stopped after 20 seconds.");
        }, 20000));
    } catch (error) {
        session.recognitionDone = true;
        stop("Could not start recording.", true);
    }
}
