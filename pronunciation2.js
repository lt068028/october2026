// ============================================================================
// Pronunciation Practice 2 (安定版：ひらがな抽出・表示切替対応)
// ============================================================================

const drill1Data = [
    { kanji: "天気が、いいです", hira: "てんきが、いいです", text: "て↘んきが｜い↘いいです", color: "#facc15" },
    { kanji: "時間が、ないです", hira: "じかんが、ないです", text: "じ↗かんが｜な↘いです", color: "#34d399" },
    { kanji: "仕事が、ほしいです", hira: "しごとが、ほしいです", text: "し↗ごとが｜ほ↗し↘いです", color: "#22d3ee" },
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

            // Preserve the existing saved-result rendering behavior.
            renderDrill1Section();
        });
    }

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

// ============================================================================
// Pronunciation Practice 2: Unified Recording / Result Handling
// ============================================================================

const p2 = {
    views: {},
    pending: false,
    locks: new Map(),
    version: 0
};

function p2Busy() {
    return p2.pending || Boolean(activeRecognitionSession);
}

function p2Sync() {
    const controls = document.querySelectorAll(
        "#drill1List button, #scriptModeControl button"
    );

    controls.forEach(button => {
        if (p2Busy()) {
            if (!p2.locks.has(button)) {
                p2.locks.set(button, button.disabled);
            }

            button.disabled = true;
        } else if (p2.locks.has(button)) {
            button.disabled = p2.locks.get(button);
            p2.locks.delete(button);
        }
    });

    const session = activeRecognitionSession;

    if (
        session &&
        session.manual &&
        !session.stopping
    ) {
        p2.views[session.key].stop.disabled = false;
    }

    Object.values(p2.views).forEach(view => {
        view.stop.classList.toggle(
            "stop-btn-active",
            Boolean(
                session &&
                session.key === view.key &&
                session.manual &&
                !session.stopping
            )
        );
    });

    controls.forEach(button => {
        button.style.setProperty(
            "cursor",
            button.disabled ? "not-allowed" : "pointer",
            "important"
        );
    });
}

// 比較専用。保存した認識テキスト自体は変更しない。
function p2Norm(text) {
    return convertToHiragana(
        String(text).normalize("NFKC")
    )
        .replace(
            /[ァ-ヶ]/g,
            character => String.fromCharCode(
                character.charCodeAt(0) - 0x60
            )
        )
        .replace(/[\p{P}\p{Z}\s]/gu, "");
}

function p2Tokens(text) {
    const words =
        /天気|時間|仕事|先生|学校|学生|てんき|じかん|しごと|せんせい|がっこう|がくせい|面白い|おもしろい|楽しい|たのしい|欲しい|ほしい|良くない|よくない|良い|いい|悪い|わるい|ない|です|でした|ます|ません|は|が|を|に|で|と|も|よ|ね|[一-龯々]+|[ァ-ヶー]+|[a-zA-Z0-9]+|./gu;

    return Array.from(
        text.matchAll(words),
        match => ({
            text: match[0],
            value: p2Norm(match[0])
        })
    ).filter(token => token.value);
}

function p2Diff(raw, expected) {
    const actual = p2Tokens(raw);
    const target = p2Tokens(expected);

    let end = actual.length;

    // 文末の「よ」「ね」は許容する。
    while (
        end &&
        ["よ", "ね"].includes(actual[end - 1].value)
    ) {
        end--;
    }

    const a = actual.slice(0, end);
    const b = target;

    const distance = Array.from(
        { length: b.length + 1 },
        () => Array(a.length + 1).fill(0)
    );

    for (let i = 0; i <= b.length; i++) {
        distance[i][0] = i;
    }

    for (let j = 0; j <= a.length; j++) {
        distance[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const substitution =
                b[i - 1].value === a[j - 1].value
                    ? 0
                    : 1;

            distance[i][j] = Math.min(
                distance[i - 1][j] + 1,
                distance[i][j - 1] + 1,
                distance[i - 1][j - 1] + substitution
            );
        }
    }

    const red = new Set();
    const gaps = new Set();

    let i = b.length;
    let j = a.length;

    while (i || j) {
        const substitution =
            i && j &&
            b[i - 1].value === a[j - 1].value
                ? 0
                : 1;

        if (
            i &&
            j &&
            distance[i][j] ===
                distance[i - 1][j - 1] + substitution
        ) {
            if (substitution) red.add(j - 1);

            i--;
            j--;
        } else if (
            i &&
            distance[i][j] === distance[i - 1][j] + 1
        ) {
            // 同じ位置で連続して不足しても＿は一つ。
            gaps.add(j);
            i--;
        } else {
            red.add(j - 1);
            j--;
        }
    }

    return {
        actual,
        red,
        gaps,
        correct: distance[b.length][a.length] === 0
    };
}

function p2Show(view, notice = "") {
    const saved = savedResults[view.key];

    view.result.replaceChildren();
    view.result.style.color = "var(--text-primary)";
    view.correction.style.display = "none";

    if (notice) {
        const message = document.createElement("span");
        message.textContent = notice + " ";
        message.style.color = "var(--text-secondary)";
        view.result.append(message);
    }

    if (saved?.rawTranscript) {
        const diff = p2Diff(
            saved.rawTranscript,
            view.item.hira
        );

        diff.actual.forEach((token, index) => {
            if (diff.gaps.has(index)) {
                addText("＿", true);
            }

            addText(
                useHiraganaOnly
                    ? p2Norm(token.text)
                    : token.text,
                diff.red.has(index)
            );
        });

        if (diff.gaps.has(diff.actual.length)) {
            addText("＿", true);
        }

        if (diff.correct) {
            addText(" ✅ ", false);
        } else {
            view.correction.style.display = "block";
        }
    } else {
        addText(
            savedAudioUrls[view.key]
                ? "Recorded "
                : "(Not recorded yet) ",
            false
        );
    }

    if (savedAudioUrls[view.key]) {
        const play = document.createElement("button");

        play.type = "button";
        play.className =
            "example-button play-recording-btn";
        play.textContent = "▶️";
        play.setAttribute(
            "aria-label",
            "Play your recorded voice"
        );

        play.onclick = () => p2Play(view.key, false);

        view.result.append(play);
    }

    function addText(text, isRed) {
        const span = document.createElement("span");
        span.textContent = text;

        if (isRed) {
            span.style.color = "var(--error-text)";
        }

        view.result.append(span);
    }
}

function p2Play(key, model = true, ownAfter = false) {
    if (p2Busy()) return;

    const view = p2.views[key];
    const version = ++p2.version;

    stopAllPlayback();

    const playOwn = () => {
        if (
            version !== p2.version ||
            p2Busy() ||
            !savedAudioUrls[key]
        ) {
            return;
        }

        const audio = new Audio(savedAudioUrls[key]);

        currentPlayingAudio = audio;
        audio.playbackRate = 1;

        const done = () => {
            if (currentPlayingAudio === audio) {
                currentPlayingAudio = null;
            }
        };

        audio.onended = done;
        audio.onerror = done;
        audio.play().catch(done);
    };

    if (!model) {
        playOwn();
        return;
    }

    // モデル文に登録された音声用の読点を維持する。
    speakText(
        view.item.kanji,
        view.rate,
        () => {
            if (
                version === p2.version &&
                ownAfter
            ) {
                playOwn();
            }
        }
    );
}

function createDrill1Row(
    container,
    indexLabel,
    item,
    rowIndex,
    playRate
) {
    const row = document.createElement("div");
    row.className = "drill-row";

    const top = document.createElement("div");
    top.className = "top-row";

    const makeButton = (text, label) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "example-button";
        button.textContent = text;
        button.setAttribute("aria-label", label);

        return button;
    };

    const listen = makeButton(
        "🔊きく",
        "Listen to the model sentence"
    );

    const number = document.createElement("span");
    number.textContent = indexLabel;
    number.style.fontWeight = "bold";

    const prompt = document.createElement("span");
    prompt.className = "prompt-label";
    prompt.innerHTML = renderPitchAccentHTML(
        item.text,
        item.color
    );
    prompt.style.minWidth = "260px";
    prompt.style.paddingLeft = "4px";

    const record = makeButton(
        "⏺️とる",
        "Start recording your voice"
    );

    const stop = makeButton(
        "⏹️",
        "Stop recording"
    );
    stop.disabled = true;

    const result = document.createElement("span");
    result.className = "result-text";

    const correction = document.createElement("div");
    correction.className = "correction-box";

    const retry = makeButton(
        "🔊きく",
        "Listen to the model sentence"
    );

    correction.append(
        retry,
        document.createTextNode(
            " 🔥 Keep going! Try once more!"
        )
    );

    const view = {
        key: rowIndex,
        item,
        rate: playRate,
        result,
        correction,
        stop
    };

    p2.views[rowIndex] = view;

    listen.onclick = retry.onclick =
        () => p2Play(rowIndex);

    record.onclick = () => p2Record(rowIndex);

    stop.onclick = () => {
        const session = activeRecognitionSession;

        if (
            session?.key === rowIndex &&
            session.manual
        ) {
            session.stop();
        }
    };

    top.append(
        listen,
        number,
        prompt,
        record,
        stop,
        result
    );

    row.append(top, correction);
    container.append(row);

    p2Show(view);
    queueMicrotask(p2Sync);
}

async function p2Record(key) {
    if (p2Busy()) return;

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (
        !Recognition ||
        !window.MediaRecorder ||
        !navigator.mediaDevices?.getUserMedia
    ) {
        p2Show(
            p2.views[key],
            "Recording or speech recognition is not supported."
        );
        return;
    }

    // 録音開始時の停止方式を固定する。
    const manual = isManualStop;

    ++p2.version;
    stopAllPlayback();

    p2.pending = true;
    p2Sync();

    p2.views[key].result.textContent =
        "Preparing microphone...";

    let stream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
    } catch (error) {
        p2.pending = false;
        p2Sync();

        p2Show(
            p2.views[key],
            "Microphone access denied."
        );
        return;
    }

    const session = {
        key,
        manual,
        stopping: false,
        finished: false,
        speech: false,
        lastSound: 0,
        chunks: [],
        final: "",
        interim: "",
        timers: [],
        context: null,
        recorderDone: false,
        recognitionDone: false,
        discard: false,
        notice: "",
        stop: null
    };

    activeRecognitionSession = session;
    p2.pending = false;

    let recorder;
    let recognition;

    const clearTimers = () => {
        session.timers.forEach(clearTimeout);
        session.timers = [];
    };

    const finish = () => {
        if (
            session.finished ||
            !session.recorderDone ||
            !session.recognitionDone
        ) {
            return;
        }

        session.finished = true;
        clearTimers();

        stream.getTracks().forEach(track => track.stop());

        if (
            session.context &&
            session.context.state !== "closed"
        ) {
            session.context.close().catch(() => {});
        }

        if (activeRecognitionSession === session) {
            activeRecognitionSession = null;
        }

        const valid =
            !session.discard &&
            session.speech &&
            session.chunks.some(chunk => chunk.size);

        if (valid) {
            const blob = new Blob(session.chunks, {
                type: recorder.mimeType || "audio/webm"
            });

            const url = URL.createObjectURL(blob);

            if (savedAudioUrls[key]) {
                URL.revokeObjectURL(savedAudioUrls[key]);
            }

            savedAudioUrls[key] = url;

            savedResults[key] = {
                rawTranscript:
                    session.final + session.interim
            };
        }

        p2Sync();

        p2Show(
            p2.views[key],
            session.notice ||
                (
                    valid &&
                    !savedResults[key]?.rawTranscript
                        ? "No transcription available."
                        : ""
                )
        );

        if (valid && isAutoPlay) {
            p2Play(key, true, true);
        }
    };

    const stop = (notice = "", discard = false) => {
        if (session.stopping || session.finished) return;

        session.stopping = true;
        session.notice = notice;
        session.discard = discard;

        clearTimers();
        p2Sync();

        session.timers.push(setTimeout(() => {
            if (!session.recorderDone) {
                session.discard = true;
            }

            session.recorderDone = true;
            session.recognitionDone = true;

            try {
                recognition?.abort();
            } catch (error) {}

            finish();
        }, 2500));

        try {
            if (
                recorder &&
                recorder.state !== "inactive"
            ) {
                recorder.stop();
            } else {
                session.recorderDone = true;
            }
        } catch (error) {
            session.discard = true;
            session.recorderDone = true;
        }

        try {
            if (
                !session.recognitionDone &&
                recognition
            ) {
                recognition.stop();
            } else {
                session.recognitionDone = true;
            }
        } catch (error) {
            session.recognitionDone = true;
        }

        finish();
    };

    session.stop = stop;

    try {
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = event => {
            if (
                !session.finished &&
                event.data.size
            ) {
                session.chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            session.recorderDone = true;
            finish();
        };

        recorder.onerror = () => {
            stop("Recording error.", true);
        };

        recognition = new Recognition();
        recognition.lang = "ja-JP";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = event => {
            if (session.finished) return;

            session.interim = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const text =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    session.final += text;
                } else {
                    session.interim += text;
                }
            }

            if (session.final || session.interim) {
                session.speech = true;
                session.lastSound = performance.now();
            }
        };

        recognition.onerror = event => {
            if (
                !session.stopping &&
                !["no-speech", "aborted"].includes(event.error)
            ) {
                stop("Speech recognition error.", true);
            }
        };

        recognition.onend = () => {
            if (session.finished) return;

            if (session.stopping) {
                session.recognitionDone = true;
                finish();
                return;
            }

            session.final += session.interim;
            session.interim = "";

            // 認識側が先に終了しても、録音を即停止しない。
            session.timers.push(setTimeout(() => {
                if (
                    session.stopping ||
                    session.finished
                ) {
                    return;
                }

                try {
                    recognition.start();
                } catch (error) {
                    session.recognitionDone = true;
                    stop("Speech recognition stopped.");
                }
            }, 100));
        };

        recorder.start();
        recognition.start();

        p2.views[key].result.textContent = "Recording...";
        p2Sync();

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

        const Context =
            window.AudioContext ||
            window.webkitAudioContext;

        session.context = new Context();

        const source =
            session.context.createMediaStreamSource(stream);

        const analyser =
            session.context.createAnalyser();

        analyser.fftSize = 1024;
        source.connect(analyser);

        const samples = new Float32Array(
            analyser.fftSize
        );

        const sounds = [];
        let previous = performance.now();

        session.context.resume().catch(() => {});

        session.timers.push(setInterval(() => {
            if (
                session.stopping ||
                session.finished
            ) {
                return;
            }

            analyser.getFloatTimeDomainData(samples);

            const now = performance.now();
            const duration = Math.min(
                now - previous,
                40
            );

            previous = now;

            const rms = Math.sqrt(
                samples.reduce(
                    (sum, value) => sum + value * value,
                    0
                ) / samples.length
            );

            sounds.push({
                time: now,
                duration: rms > 0.015 ? duration : 0
            });

            while (
                sounds.length &&
                now - sounds[0].time > 400
            ) {
                sounds.shift();
            }

            const soundDuration = sounds.reduce(
                (sum, sound) => sum + sound.duration,
                0
            );

            if (
                !session.speech &&
                soundDuration >= 100
            ) {
                session.speech = true;
                session.lastSound = now;
            }

            if (
                session.speech &&
                rms > 0.015
            ) {
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
    } catch (error) {
        stop("Could not start recording.", true);
    }
}
