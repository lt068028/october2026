// ============================================================================
// Pronunciation Practice 2 (安定版：ひらがな抽出・表示切替対応)
// ============================================================================

const drill1Data = [
    { kanji: "天気が、いいです", hira: "てんきが、いいです", text: "て↘んきが｜い↘いです", color: "#facc15" },
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

let p2SpeechStyle = "formal";

const p2 = {
    views: {},
    pending: false,
    locks: new Map(),
    version: 0
};

function p2Busy() {
    return p2.pending || Boolean(activeRecognitionSession);
}

function initSettingsPanel() {
    for (const [id, values, get, set] of [
        [
            "scriptModeControl",
            ["hiragana", "kanji"],
            () => useHiraganaOnly ? "hiragana" : "kanji",
            value => {
                useHiraganaOnly = value === "hiragana";
            }
        ],
        [
            "speechStyleControl",
            ["formal", "informal", "casual"],
            () => p2SpeechStyle,
            value => {
                p2SpeechStyle = value;
            }
        ]
    ]) {
        const control = document.getElementById(id);

        control?.addEventListener("click", event => {
            if (p2Busy()) return;

            const button = event.target.closest(
                "button[data-value]"
            );

            if (!button || !control.contains(button)) return;

            const value = button.dataset.value;

            if (
                !values.includes(value)
                || value === get()
            ) {
                return;
            }

            set(value);
            renderDrill1Section();
        });
    }

    for (const [id, labelId, get, set] of [
        [
            "toggleRecordMode",
            "labelAutoRecord",
            () => !isManualStop,
            value => {
                isManualStop = !value;
            }
        ],
        [
            "togglePlaybackMode",
            "labelAutoPlay",
            () => isAutoPlay,
            value => {
                isAutoPlay = value;
            }
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
}

function p2Model(item, omitParticle = true) {
    let kanji = item.kanji;
    let hira = item.hira;
    let text = item.text;

    if (p2SpeechStyle !== "formal") {
        kanji = kanji.replace(/です$/, "");
        hira = hira.replace(/です$/, "");
        text = text.replace(/です$/, "");

        if (p2SpeechStyle === "casual") {
            if (omitParticle) {
                kanji = kanji.replace(
                    /^(.+?)[がは][、,\s]*/,
                    "$1、"
                );

                hira = hira.replace(
                    /^(.+?)[がは][、,\s]*/,
                    "$1、"
                );

                text = text.replace(
                    /[がは](?=｜)/,
                    ""
                );
            }

            kanji += "よ";
            hira += "よ";
            text += "よ";
        }
    }

    return {...item, kanji, hira, text};
}

function renderDrill1Section() {
    if (p2Busy()) return;

    const container = document.getElementById("drill1List");
    if (!container) return;

    ++p2.version;
    stopAllPlayback();

    p2.views = {};
    container.replaceChildren();

    for (const [id, value] of [
        [
            "scriptModeControl",
            useHiraganaOnly ? "hiragana" : "kanji"
        ],
        [
            "speechStyleControl",
            p2SpeechStyle
        ]
    ]) {
        document.querySelectorAll(
            `#${id} button[data-value]`
        ).forEach(button => {
            const selected =
                button.dataset.value === value;

            button.classList.toggle(
                "is-selected",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });
    }

    drill1Data.forEach((item, index) => {
        const model = p2Model(item);

        model.references = [
            ...new Set([
                model.kanji,
                model.hira,
                p2Model(item, false).kanji,
                p2Model(item, false).hira
            ])
        ];

        createDrill1Row(
            container,
            `${index + 1}.`,
            model,
            index,
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
        columns.children[1].style.width =
            `${width + 8}px`;
    });

    p2Sync();
}

function p2Sync() {
    const controls = document.querySelectorAll(
        "#drill1List button, " +
        ".compact-settings button, " +
        ".compact-settings input"
    );

    if (p2Busy()) {
        controls.forEach(control => {
            if (!p2.locks.has(control)) {
                p2.locks.set(control, control.disabled);
            }

            control.disabled = true;
        });
    } else {
        p2.locks.forEach((disabled, control) => {
            if (control.isConnected) {
                control.disabled = disabled;
            }
        });

        p2.locks.clear();
    }

    const session = activeRecognitionSession;

    Object.values(p2.views).forEach(view => {
        const manualStop = Boolean(
            session
            && session.key === view.key
            && session.manual
            && !session.stopping
        );

        if (manualStop) view.stop.disabled = false;

        view.stop.classList.toggle(
            "stop-btn-active",
            manualStop
        );
    });
}

function p2Norm(text) {
    return convertToHiragana(
        String(text ?? "").normalize("NFKC") + "\uE000"
    )
        .replace(/\uE000$/, "")
        .toLowerCase()
        .replace(/[ァ-ヶ]/g, char =>
            String.fromCharCode(char.charCodeAt(0) - 96)
        )
        .replace(/[\p{P}\p{Z}\s]/gu, "");
}

function p2Tokens(text) {
    const chars = Array.from(
        String(text ?? "").normalize("NFKC")
    );

    const tokens = chars
        .map((char, index) => ({char, index}))
        .filter(token => p2Norm(token.char));

    const suffix = tokens
        .map(token => token.char)
        .join("")
        .match(/(?:よね|よ|ね)$/);

    if (suffix) {
        tokens.splice(tokens.length - suffix[0].length);
    }

    return {chars, tokens};
}

function p2Diff(raw, expected) {
    const a = p2Tokens(raw);
    const b = p2Tokens(expected);

    const n = a.tokens.length;
    const m = b.tokens.length;

    const spans = tokens => tokens.map((_, start) => {
        const result = new Map();
        let text = "";

        for (
            let end = start + 1;
            end <= tokens.length;
            end++
        ) {
            text += tokens[end - 1].char;
            const reading = p2Norm(text);

            if (!result.has(reading)) {
                result.set(reading, []);
            }

            result.get(reading).push(end);
        }

        return result;
    });

    const aa = spans(a.tokens);
    const bb = spans(b.tokens);

    const costs = Array.from(
        {length: n + 1},
        () => Array(m + 1).fill(Infinity)
    );

    const steps = Array.from(
        {length: n + 1},
        () => Array(m + 1).fill(null)
    );

    costs[0][0] = 0;

    const update = (
        i, j, x, y, extra, red = false
    ) => {
        const cost = costs[i][j] + extra;

        if (cost < costs[x][y]) {
            costs[x][y] = cost;
            steps[x][y] = {i, j, red};
        }
    };

    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            if (!Number.isFinite(costs[i][j])) continue;

            if (i < n && j < m) {
                const same =
                    a.tokens[i].char === b.tokens[j].char;

                update(
                    i, j,
                    i + 1, j + 1,
                    same ? 0 : 1,
                    !same
                );

                for (const [reading, endsA] of aa[i]) {
                    const endsB = bb[j].get(reading);
                    if (!endsB) continue;

                    for (const x of endsA) {
                        for (const y of endsB) {
                            update(i, j, x, y, 0);
                        }
                    }
                }
            }

            if (i < n) {
                update(i, j, i + 1, j, 1, true);
            }

            if (j < m) {
                update(i, j, i, j + 1, 1);
            }
        }
    }

    const red = new Set();
    const gaps = new Set();

    let i = n;
    let j = m;

    while (i || j) {
        const step = steps[i][j];
        if (!step) break;

        if (step.red) {
            for (let k = step.i; k < i; k++) {
                red.add(a.tokens[k].index);
            }
        }

        if (step.i === i && step.j < j) {
            gaps.add(
                i < n
                    ? a.tokens[i].index
                    : n
                        ? a.tokens[n - 1].index + 1
                        : 0
            );
        }

        i = step.i;
        j = step.j;
    }

    return {
        chars: a.chars,
        red,
        gaps,
        cost: costs[n][m],
        correct: costs[n][m] === 0
    };
}

function p2BestDiff(raw, references) {
    let best = null;

    for (const reference of references) {
        const diff = p2Diff(raw, reference);

        if (!best || diff.cost < best.cost) {
            best = diff;
        }
    }

    return best;
}

function p2Show(view, notice = "") {
    const saved = savedResults[view.key];

    view.result.replaceChildren();
    view.result.style.color = "var(--text-primary)";
    view.correction.style.display = "none";
    view.correctionText.textContent = "";

    const append = (text, red = false) => {
        const span = document.createElement("span");
        span.textContent = text;

        if (red) span.style.color = "var(--error-text)";

        view.result.append(span);
    };

    if (saved?.rawTranscript) {
        // 録音時のモデルと判定を保持する。
        if (!saved.references) {
            saved.references = [...view.item.references];
            saved.modelKanji = view.item.kanji;
        }

        if (typeof saved.isCorrect !== "boolean") {
            saved.isCorrect = p2BestDiff(
                saved.rawTranscript,
                saved.references
            ).correct;
        }

        const displayed = useHiraganaOnly
            ? convertToHiragana(saved.rawTranscript)
            : saved.rawTranscript;

        const diff = p2BestDiff(
            displayed,
            saved.references
        );

        for (let i = 0; i <= diff.chars.length; i++) {
            if (!saved.isCorrect && diff.gaps.has(i)) {
                append("＿", true);
            }

            if (i === diff.chars.length) break;

            append(
                diff.chars[i],
                !saved.isCorrect && diff.red.has(i)
            );
        }

        append(saved.isCorrect ? " ✅ " : " ");

        if (!saved.isCorrect) {
            view.correctionText.textContent =
                "🔥Keep going! Try once more!";

            view.correction.style.display = "block";
        }
    } else {
        append(
            savedAudioUrls[view.key]
                ? "Recorded "
                : "(Not recorded yet) "
        );
    }

    if (savedAudioUrls[view.key]) {
        const play = document.createElement("button");

        play.type = "button";
        play.className =
            "example-button play-recording-btn custom-tip-wrap";

        play.innerHTML =
            '▶️<span class="custom-tip-box">Play your recorded voice</span>';

        play.setAttribute(
            "aria-label",
            "Play your recorded voice"
        );

        play.onclick = () =>
            p2Play(view.key, false);

        view.result.append(play);
    }

    if (notice) {
        const message = document.createElement("span");
        message.textContent = " " + notice;
        message.style.color = "var(--text-secondary)";
        view.result.append(message);
    }
}

function p2Play(key, model = true, ownAfter = false) {
    if (p2Busy()) return;

    const view = p2.views[key];
    if (!view) return;

    const version = ++p2.version;

    const selected = model
        ? view.listen
        : view.result.querySelector(".play-recording-btn");

    setPlayingStateMultiple(
        [selected].filter(Boolean),
        "Playing..."
    );

    let completed = false;

    const finish = () => {
        if (version !== p2.version || completed) return;

        completed = true;
        stopAllPlayback();
        p2Sync();
    };

    const own = () => {
        if (version !== p2.version || p2Busy()) return;

        const url = savedAudioUrls[key];

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
        if (modelEnded || version !== p2.version) return;

        modelEnded = true;

        if (ownAfter) own();
        else finish();
    };

    const text = ownAfter
        ? savedResults[key]?.modelKanji || view.item.kanji
        : view.item.kanji;

    try {
        speakText(text, view.rate, afterModel);
    } catch (error) {
        afterModel();
    }
}

function createDrill1Row(
    container,
    indexLabel,
    item,
    rowIndex,
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

    const listen = button(
        "🔊きく",
        "Listen to the model sentence."
    );

    const record = button(
        "🎙️とる",
        "Record your voice."
    );

    const stop = button(
        "⏹️",
        "Stop recording."
    );

    stop.disabled = true;

    const result = make("span", "result-text");
    const resultBox = make("span", "recording-result");

    resultBox.append(result);
    actions.append(listen, record, stop);
    controls.append(actions, resultBox);

    const correction = make("div", "correction-box");
    const correctionText = make("span");

    correction.append(correctionText);
    cell.append(controls, correction);
    line.append(number, cue, cell);
    body.append(line);
    table.append(columns, body);
    row.append(table);
    container.append(row);

    const view = {
        key: rowIndex,
        item,
        rate: playRate,
        listen,
        result,
        correction,
        correctionText,
        stop
    };

    p2.views[rowIndex] = view;

    listen.onclick = () => p2Play(rowIndex);
    record.onclick = () => p2Record(rowIndex);

    stop.onclick = () => {
        const session = activeRecognitionSession;

        if (
            session?.key === rowIndex
            && session.manual
        ) {
            session.stop();
        }
    };

    p2Show(view);
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
