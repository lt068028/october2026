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
let activePitchRecordingState = null;
let activePitchPlayingState = null;
let pronunciationCapture = null;
let updatePitchLabSpeechStyle = null;

const savedAudioUrls = {};
const savedResults = {}; // 録音結果やHTMLコンテンツを永続化保存

// ============================================================================
// Voice Setup
// ============================================================================
const VOICE_STORAGE_KEY = "october2026.selectedVoiceName";
let preferredVoice = null;

function voicePriorityRank(v) {
    if (DrillAudio.isChromeJapanese3(v)) return -1;
    const name = (v && v.name) ? v.name : "";
    if (/chrome os/i.test(name)) return 0;
    if (/google/i.test(name)) return 1;
    if (/nanami/i.test(name)) return 2;
    if (/keita/i.test(name)) return 3;
    if (/haruka/i.test(name)) return 4;
    return 5;
}

function setupPreferredVoice() {
    try {
        const voices =
            typeof speechSynthesis !== "undefined"
                ? speechSynthesis.getVoices()
                : [];

        const japanese = (voices || [])
            .filter(v => v && v.lang && /^ja(?:$|[-_])/i.test(v.lang))
            .sort((a, b) => voicePriorityRank(a) - voicePriorityRank(b));

        let savedName = null;
        try {
            savedName = localStorage.getItem(VOICE_STORAGE_KEY);
        } catch (e) {}

        let selected = savedName
            ? japanese.find(v => v.name === savedName)
            : null;

        if (!selected) {
            selected = japanese[0] || null;
        }

        const previousVoice = preferredVoice;
        preferredVoice = selected;
        if (JSON.stringify([previousVoice?.voiceURI, previousVoice?.name, previousVoice?.lang]) !==
            JSON.stringify([selected?.voiceURI, selected?.name, selected?.lang])) {
            stopAllPlayback();
            DrillAudio.clearModels();
        }

        const selectEl = document.getElementById("voiceSelect");
        if (selectEl) {
            selectEl.setAttribute("translate", "no");
            selectEl.classList.add("notranslate", "is-enhanced");

            const labelEl = document.querySelector('label[for="voiceSelect"]');
            if (labelEl) {
                labelEl.setAttribute("for", "voiceDropdownBtn");
            }

            let dropdownEl = document.getElementById("voiceDropdown");
            if (!dropdownEl) {
                dropdownEl = document.createElement("div");
                dropdownEl.id = "voiceDropdown";
                dropdownEl.className = "voice-dropdown notranslate";
                dropdownEl.setAttribute("translate", "no");

                const btn = document.createElement("button");
                btn.type = "button";
                btn.id = "voiceDropdownBtn";
                btn.className = "voice-dropdown-btn notranslate";
                btn.setAttribute("translate", "no");
                btn.setAttribute("aria-haspopup", "listbox");
                btn.setAttribute("aria-expanded", "false");

                const btnLabel = document.createElement("span");
                btnLabel.className = "voice-dropdown-btn-label";

                const btnArrow = document.createElement("span");
                btnArrow.className = "voice-dropdown-btn-arrow";
                btnArrow.setAttribute("aria-hidden", "true");
                btnArrow.textContent = "▾";

                btn.append(btnLabel, btnArrow);

                const menu = document.createElement("ul");
                menu.id = "voiceDropdownMenu";
                menu.className = "voice-dropdown-menu notranslate";
                menu.setAttribute("translate", "no");
                menu.setAttribute("role", "listbox");
                menu.hidden = true;

                dropdownEl.append(btn, menu);
                selectEl.insertAdjacentElement("afterend", dropdownEl);

                btn.addEventListener("click", event => {
                    event.stopPropagation();
                    if (btn.disabled) return;
                    const willOpen = menu.hidden;
                    menu.hidden = !willOpen;
                    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
                });

                document.addEventListener("click", event => {
                    if (!dropdownEl.contains(event.target)) {
                        menu.hidden = true;
                        btn.setAttribute("aria-expanded", "false");
                    }
                });

                document.addEventListener("keydown", event => {
                    if (event.key === "Escape" && !menu.hidden) {
                        menu.hidden = true;
                        btn.setAttribute("aria-expanded", "false");
                    }
                });
            }

            const btn = document.getElementById("voiceDropdownBtn");
            const btnLabel = dropdownEl.querySelector(".voice-dropdown-btn-label");
            const menu = document.getElementById("voiceDropdownMenu");

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
                if (menu) menu.replaceChildren();

                if (!japanese.length) {
                    const opt = document.createElement("option");
                    opt.value = "";
                    opt.textContent = "No Japanese voice available";
                    selectEl.append(opt);
                    selectEl.disabled = true;
                    if (btn) btn.disabled = true;
                    if (btnLabel) btnLabel.textContent = "No Japanese voice available";
                    if (menu) menu.hidden = true;
                } else {
                    selectEl.disabled = false;
                    if (btn) btn.disabled = false;
                    japanese.forEach(v => {
                        const opt = document.createElement("option");
                        opt.value = v.name;
                        opt.textContent = v.name;
                        opt.setAttribute("translate", "no");
                        opt.className = "notranslate";
                        selectEl.append(opt);

                        if (menu) {
                            const item = document.createElement("li");
                            item.className = "voice-dropdown-item notranslate";
                            item.setAttribute("translate", "no");
                            item.setAttribute("role", "option");
                            item.dataset.voiceName = v.name;
                            item.textContent = v.name;
                            item.addEventListener("click", event => {
                                event.stopPropagation();
                                try {
                                    localStorage.setItem(VOICE_STORAGE_KEY, v.name);
                                } catch (e) {}
                                menu.hidden = true;
                                if (btn) btn.setAttribute("aria-expanded", "false");
                                setupPreferredVoice();
                            });
                            menu.append(item);
                        }
                    });
                }
            }

            if (selected && selectEl.value !== selected.name) {
                selectEl.value = selected.name;
            }
            if (btnLabel && japanese.length) {
                btnLabel.textContent = selected ? selected.name : japanese[0].name;
            }
            if (menu) {
                Array.from(menu.children).forEach(item => {
                    const isSelected = Boolean(
                        selected && item.dataset.voiceName === selected.name
                    );
                    item.classList.toggle("is-selected", isSelected);
                    item.setAttribute("aria-selected", isSelected ? "true" : "false");
                });
            }
        }
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
    DrillAudio.invalidatePlayback();
    // Detach callbacks before cancel: browsers may deliver an error synchronously.
    if (currentUtteranceRef) {
        currentUtteranceRef.onend = null;
        currentUtteranceRef.onerror = null;
    }
    if (currentPlayingAudio) {
        currentPlayingAudio.onended = null;
        currentPlayingAudio.onerror = null;
    }
    DrillAudio.cancelModel();
    if (currentPlayTimeoutId) { clearTimeout(currentPlayTimeoutId); currentPlayTimeoutId = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
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
        let isLatin = /[a-zA-Z]/.test(ch);

        if (isLatin || ch === ' ') {
            resultHTML += ch;
            i++;
        } else if (ch === '↘' || ch === '＼') {
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

function speakText(text, rate = 0.9, onEndCallback, onErrorCallback = onEndCallback) {
    setupPreferredVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;
    if (preferredVoice) utterance.voice = preferredVoice;
    
    currentUtteranceRef = utterance;
    utterance.onend = () => { currentUtteranceRef = null; if (onEndCallback) onEndCallback(); };
    utterance.onerror = () => { currentUtteranceRef = null; onErrorCallback?.(); };
    try { DrillAudio.speak(utterance); } catch (err) {
        currentUtteranceRef = null;
        onErrorCallback?.();
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
    return Boolean(
        p2.pending
        || activeRecognitionSession
        || pronunciationCapture
        || activePitchRecordingState
    );
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
            ["formal", "informal"],
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
            if (toggle.disabled) { toggle.checked = get(); return; }
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

    if (updatePitchLabSpeechStyle) {
        updatePitchLabSpeechStyle();
    }

    p2Sync();
}

function p2Sync() {
    const controls = document.querySelectorAll(
        "#drill1List button, " +
        "#pitchLab button, " +
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

        const capture = pronunciationCapture;

        if (capture?.recording && !capture.stopping) {
            const stop = capture.state?.stopBtn;

            if (stop) {
                stop.disabled = !capture.manual;
                stop.classList.toggle(
                    "stop-btn-active",
                    capture.manual
                );
            }
        }
    } else {
        p2.locks.forEach((disabled, control) => {
            if (control.isConnected) {
                control.disabled = disabled;
            }
        });

        p2.locks.clear();
    }

    const casual = document.querySelector('#speechStyleControl [data-value="casual"]');
    if (casual) { casual.disabled = true; casual.setAttribute('aria-disabled', 'true'); }

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

    if (!DrillAnswer.formAllowed(raw, p2SpeechStyle)) {
        best.correct = false;
        best.cost = Math.max(1, best.cost);
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

    const buttons = model && ownAfter
        ? [view.listen, view.result.querySelector(".play-recording-btn")]
        : [selected];
    setPlayingStateMultiple(buttons.filter(Boolean), "Playing...");

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
        DrillAudio.play(audio, finish);
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
        speakText(text, view.rate, afterModel, finish);
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
        stream = await DrillAudio.getUserMedia({
            audio: true
        });
    } catch (error) {
        if (error.name === "AbortError") return;
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

// ============================================================================
// Pitch Lab (Pronunciation 2: Full Sentence Pitch Contour & Comparison)
// ============================================================================

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
        p2Busy()
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

    grid.style.gridTemplateColumns = "minmax(0, 1fr)";

    const pairs = drill1Data.map((item, index) => ({
        id: String(index),
        itemIndex: index,
        words: ["Recording"],
        free: false
    }));

    pairs.push({
        id: "free",
        itemIndex: -1,
        words: ["Free practice"],
        free: true
    });

    const picker = document.createElement("details");
    picker.className = "pitch-pair-picker";

    const summary = document.createElement("summary");
    summary.id = "pitchPairSelect";
    summary.className = "pitch-pair-summary";
    summary.setAttribute("aria-label", "Choose a sentence");

    const options = document.createElement("div");
    options.className = "pitch-pair-options";

    picker.append(summary, options);
    grid.before(picker);

    const cache = new Map();
    const choices = [];
    let selectedId = pairs[0].id;

    function getPairModel(pair) {
        if (pair.free || pair.itemIndex < 0) return null;
        return p2Model(drill1Data[pair.itemIndex]);
    }

    function pairContent(pair) {
        const content = document.createElement("span");
        content.className = "pitch-pair-content";

        const part = document.createElement("span");
        part.style.gridColumn = "1 / -1";

        if (pair.free) {
            part.textContent = "Free practice";
        } else {
            const model = getPairModel(pair);
            part.innerHTML = renderPitchAccentHTML(
                model.text,
                "#e879f9"
            );
        }

        content.append(part);

        return content;
    }

    function busy() {
        return p2Busy() || Array.from(cache.values()).flat().some(
            state =>
                state.isRecording
                || state.isAnalyzing
                || activePitchRecordingState === state
        );
    }

    function redraw(state) {
        if (state.f0Frames?.length || state.modelF0Frames?.length) {
            drawPitchCurve(state, state.f0Frames, state.modelF0Frames);
        } else {
            drawPitchPlaceholder(
                state,
                state.isRecording
                    ? "Recording..."
                    : "Click 🔊きく or 🎙️とる to draw pitch."
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

        const model = getPairModel(pair);
        const modelText = model ? model.kanji : "";

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

        const volumeNoteEl = document.createElement("p");
        volumeNoteEl.className = "pitch-volume-note";
        volumeNoteEl.textContent =
            "If the model line does not appear clearly, please turn up your speaker volume.";
        volumeNoteEl.hidden = !p2.hasModelPitchDrawn;

        controls.append(
            listenBtn,
            recordBtn,
            stopBtn,
            playBtn,
            statusEl
        );

        card.append(controls, canvas, volumeNoteEl);

        const state = {
            card,
            pair,
            side: card.dataset.pitchSide,
            modelText,
            listenBtn,
            recordBtn,
            stopBtn,
            playBtn,
            statusEl,
            canvas,
            volumeNoteEl,
            recorder: null,
            stream: null,
            chunks: [],
            audioBlob: null,
            audioUrl: null,
            isRecording: false,
            isAnalyzing: false,
            f0Frames: null,
            modelF0Frames: null
        };
        DrillAudio.registerPitch(state, () => {
            if (state.f0Frames?.length || state.modelF0Frames?.length) {
                drawPitchCurve(state, state.f0Frames, state.modelF0Frames);
            } else {
                drawPitchPlaceholder(state, "Record your voice to begin.");
            }
        });

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

    function updatePairLabelsAndModels() {
        pairs.forEach((pair, index) => {
            const choice = choices[index];
            if (choice && !pair.free) {
                choice.replaceChildren(pairContent(pair));
            }

            if (cache.has(pair.id)) {
                const model = getPairModel(pair);
                const modelText = model ? model.kanji : "";
                cache.get(pair.id).forEach(state => {
                    if (state.modelText !== modelText) {
                        state.modelText = modelText;
                        state.modelF0Frames = null;
                    }
                    if (!state.isRecording && !state.isAnalyzing) {
                        state.listenBtn.disabled = !modelText;
                    }
                    redraw(state);
                });
            }
        });

        const currentPair = pairs.find(p => p.id === selectedId) || pairs[0];
        summary.replaceChildren(pairContent(currentPair));
        const currentModel = getPairModel(currentPair);
        summary.setAttribute(
            "aria-label",
            "Choose a sentence: "
                + (
                    currentPair.free
                        ? "Free practice"
                        : currentModel?.text || ""
                )
        );
    }

    updatePitchLabSpeechStyle = updatePairLabelsAndModels;

    function showPair(pair) {
        if (!cache.has(pair.id)) {
            cache.set(
                pair.id,
                pair.words.map((word, side) =>
                    makeCard(word, pair, side)
                )
            );
        } else {
            const model = getPairModel(pair);
            const modelText = model ? model.kanji : "";
            cache.get(pair.id).forEach(state => {
                if (state.modelText !== modelText) {
                    state.modelText = modelText;
                    state.modelF0Frames = null;
                }
                if (!state.isRecording && !state.isAnalyzing) {
                    state.listenBtn.disabled = !modelText;
                }
            });
        }

        selectedId = pair.id;
        summary.replaceChildren(pairContent(pair));

        const currentModel = getPairModel(pair);
        summary.setAttribute(
            "aria-label",
            "Choose a sentence: "
                + (
                    pair.free
                        ? "Free practice"
                        : currentModel?.text || ""
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

            ++p2.version;
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

async function startPitchRecording(state) {
    if (p2Busy() || state?.isAnalyzing) return;

    if (
        !navigator.mediaDevices?.getUserMedia
        || typeof MediaRecorder === "undefined"
    ) {
        setPitchStatus(state, "Recording is not supported.");
        return;
    }

    ++p2.version;
    stopAllPlayback();

    const session = {
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
    activePitchRecordingState = state;

    p2Sync();
    setPitchStatus(state, "Requesting microphone access...");

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

        state.isRecording = false;
        state.stopBtn.classList.remove("stop-btn-active");

        if (blob) {
            const url = URL.createObjectURL(blob);
            const old = state.audioUrl;

            state.audioBlob = blob;
            state.audioUrl = url;
            state.f0Frames = null;

            if (old) URL.revokeObjectURL(old);
        }

        try {
            if (blob) {
                await analyzePitchRecording(state);
            } else {
                if (state.f0Frames?.length || state.modelF0Frames?.length) {
                    drawPitchCurve(state, state.f0Frames, state.modelF0Frames);
                } else {
                    drawPitchPlaceholder(
                        state,
                        "Click 🔊きく or 🎙️とる to draw pitch."
                    );
                }
            }
        } finally {
            pronunciationCapture = null;
            activePitchRecordingState = null;

            p2Sync();

            if (state.listenBtn) {
                state.listenBtn.disabled = !state.modelText;
            }
            state.recordBtn.disabled = false;
            state.stopBtn.disabled = true;
            state.playBtn.disabled = !state.audioBlob;

            const message = session.message
                || (!valid ? "No speech detected." : "");

            if (message) setPitchStatus(state, message);

            if (valid && isAutoPlay && !state.analysisTimedOut) {
                playPitchRecording(state, true);
            }
        }
    };

    session.stop = (message = "", discard = false) => {
        if (session.stopping || session.finished) return;

        session.stopping = true;
        session.message = message;
        session.discard = discard;

        clear();
        p2Sync();

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
            await DrillAudio.getUserMedia({
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
        state.recorder = recorder;
        state.isRecording = true;
        drawPitchPlaceholder(state, "Recording...");

        recorder.start();
        setPitchStatus(state, "Recording...");
        p2Sync();

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

function stopPitchRecording(state) {
    if (
        pronunciationCapture?.state === state
        && pronunciationCapture.manual
    ) {
        pronunciationCapture.stop();
    }
}

async function playPitchModel(state) {
    if (p2Busy() || state.isAnalyzing || !state.modelText) return;
    ++p2.version;
    setPlayingStateMultiple([state.listenBtn], "Playing...");
    activePitchPlayingState = state;
    const token = DrillAudio.beginModel(state, () => {
        state.isAnalyzing = false;
        state.listenBtn.disabled = !state.modelText;
        state.recordBtn.disabled = false;
        state.playBtn.disabled = !state.audioBlob;
        setPitchStatus(state, state.audioBlob ? "Ready" : "Not recorded yet");
    });
    // Recording is a new task: it may cancel this model session.
    state.recordBtn.disabled = false;
    state.playBtn.disabled = true;
    setPitchStatus(state, "Playing & capturing model...");
    const chunks = [];
    if (navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined") {
        try {
            token.stream = await DrillAudio.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });
        } catch (error) {
            // Retry only unsupported constraints, never a denial or a cancelled session.
            token.stream = null;
            if (DrillAudio.valid(token) && error.name === "OverconstrainedError") {
                try { token.stream = await DrillAudio.getUserMedia({ audio: true }); }
                catch (_) { token.stream = null; }
            }
        }
    }
    if (!DrillAudio.valid(token)) {
        token.stream?.getTracks().forEach(track => track.stop());
        return;
    }
    if (token.stream) {
        try {
            token.recorder = new MediaRecorder(token.stream);
            token.recorder.ondataavailable = event => {
                if (DrillAudio.valid(token) && event.data?.size) chunks.push(event.data);
            };
            token.recorder.start();
            // Some browser voices/recorders never deliver their completion event.
            token.watchdog = setTimeout(() => {
                if (!DrillAudio.valid(token)) return;
                stopAllPlayback();
                setPitchStatus(state, "Model pitch not detected.");
            }, 20000);
        } catch (error) {
            token.stream.getTracks().forEach(track => track.stop());
            token.recorder = null;
        }
    }
    let completed = false;
    const finish = () => {
        if (completed || !DrillAudio.valid(token)) return;
        completed = true;
        if (!token.recorder || token.recorder.state === "inactive") {
            DrillAudio.endModel(token);
            stopAllPlayback();
            setPitchStatus(state, "Model pitch not detected.");
            return;
        }
        token.timer = setTimeout(() => {
            if (!DrillAudio.valid(token)) return;
            token.recorder.onstop = async () => {
                token.stream.getTracks().forEach(track => track.stop());
                if (!DrillAudio.valid(token)) return;
                const blob = chunks.length ? new Blob(chunks, {
                    type: token.recorder.mimeType || "audio/webm"
                }) : null;
                try {
                    if (blob) await analyzeModelPitchBlob(state, blob, token);
                } finally {
                    if (DrillAudio.valid(token)) {
                        DrillAudio.endModel(token);
                        stopAllPlayback();
                    }
                }
            };
            try { token.recorder.stop(); } catch (error) {
                DrillAudio.cancelModel();
                stopAllPlayback();
            }
        }, 220);
    };
    try { speakText(state.modelText, 0.9, finish); } catch (error) { finish(); }
}

async function analyzeModelPitchBlob(state, blob, token) {
    if (!blob || state.isAnalyzing || !DrillAudio.valid(token)) return;

    const analysis = DrillAudio.beginAnalysis(state);
    state.isAnalyzing = true;
    if (state.listenBtn) {
        state.listenBtn.disabled = true;
    }
    // Recording is a new task: it may cancel this model session.
    state.recordBtn.disabled = false;
    state.playBtn.disabled = true;
    setPitchStatus(state, "Drawing model pitch...");

    let audioContext = null;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("Web Audio API is not supported.");
        }

        audioContext = new AudioContextClass();
        analysis.context = audioContext;
        token.context = audioContext;

        if (audioContext.state === "suspended") {
            await analysis.wait(audioContext.resume());
        }

        const arrayBuffer = await analysis.wait(blob.arrayBuffer());
        const audioBuffer = await analysis.wait(audioContext.decodeAudioData(arrayBuffer));
        analysis.check();

        if (!DrillAudio.valid(token)) return;

        const frames = await analysis.frames(
            mixAudioToMono(audioBuffer), audioBuffer.sampleRate, true,
            {estimateF0Frames, estimateFrameF0, calculateMedian}
        );

        analysis.check();
        const hasPitch = frames.some(
            frame => Number.isFinite(frame.f0) && frame.f0 > 0
        );

        if (!hasPitch) {
            if (state.f0Frames?.length || state.modelF0Frames?.length) {
                drawPitchCurve(state, state.f0Frames, state.modelF0Frames);
            } else {
                drawPitchPlaceholder(
                    state,
                    "Model pitch not detected."
                );
            }
            setPitchStatus(
                state,
                "Model pitch not detected."
            );
            return;
        }

        p2.hasModelPitchDrawn = true;
        document.querySelectorAll("#pitchLab .pitch-volume-note").forEach(el => {
            el.hidden = false;
        });
        if (state.volumeNoteEl) {
            state.volumeNoteEl.hidden = false;
        }

        state.modelF0Frames = frames;
        drawPitchCurve(state, state.f0Frames, state.modelF0Frames);
        setPitchStatus(state, "Model pitch drawn");
    } catch (error) {
        if (!analysis.owns() || !DrillAudio.valid(token)) return;
        if (error.name === 'AbortError') return;
        if (error.name === 'TimeoutError') {
            DrillAudio.notify("Pitch analysis timed out. Your recording has been kept. Please try again.");
        }
        setPitchStatus(state, error.name === 'TimeoutError'
            ? "Pitch analysis timed out. Your recording has been kept. Please try again."
            : "Could not draw pitch. Try again.");
    } finally {
        const owns = analysis.owns();
        analysis.finish();
        if (!owns || !DrillAudio.valid(token)) return;
        state.isAnalyzing = false;
        if (state.listenBtn) state.listenBtn.disabled = !state.modelText;
        state.recordBtn.disabled = false;
        state.playBtn.disabled = !state.audioBlob;
    }
}

function playPitchRecording(state, autoplay = false) {
    if (
        p2Busy()
        || state.isAnalyzing
        || !state.audioUrl
        || !state.audioBlob
    ) {
        return;
    }

    const version = ++p2.version;

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
            || version !== p2.version
        ) {
            return;
        }

        completed = true;
        stopAllPlayback();
    };

    audio.onended = finish;
    audio.onerror = finish;
    DrillAudio.play(audio, finish);
}

async function analyzePitchRecording(state) {
    if (!state.audioBlob || state.isAnalyzing) return;

    const analysis = DrillAudio.beginAnalysis(state);
    state.isAnalyzing = true;
    state.analysisTimedOut = false;
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
        analysis.context = audioContext;

        if (audioContext.state === "suspended") {
            await analysis.wait(audioContext.resume());
        }

        const arrayBuffer = await analysis.wait(state.audioBlob.arrayBuffer());
        const audioBuffer = await analysis.wait(audioContext.decodeAudioData(arrayBuffer));
        analysis.check();

        const frames = await analysis.frames(
            mixAudioToMono(audioBuffer), audioBuffer.sampleRate, false,
            {estimateF0Frames, estimateFrameF0, calculateMedian}
        );

        analysis.check();
        const hasPitch = frames.some(
            frame => Number.isFinite(frame.f0) && frame.f0 > 0
        );

        if (!hasPitch) {
            state.f0Frames = null;
            if (state.modelF0Frames?.length) {
                drawPitchCurve(state, null, state.modelF0Frames);
            } else {
                drawPitchPlaceholder(state, "Pitch not detected.");
            }
            setPitchStatus(state, "Pitch not detected. Try again.");
            return;
        }

        state.f0Frames = frames;
        drawPitchCurve(state, state.f0Frames, state.modelF0Frames);
        setPitchStatus(state, "Ready");
    } catch (error) {
        if (!analysis.owns()) return;
        if (error.name === 'AbortError') return;
        if (error.name === 'TimeoutError') {
            DrillAudio.notify("Pitch analysis timed out. Your recording has been kept. Please try again.");
        }
        state.analysisTimedOut = error.name === 'TimeoutError';
        setPitchStatus(state, error.name === 'TimeoutError'
            ? "Pitch analysis timed out. Your recording has been kept. Please try again."
            : "Could not draw pitch. Try again.");
    } finally {
        const owns = analysis.owns();
        analysis.finish();
        if (!owns) return;
        state.isAnalyzing = false;
        if (state.listenBtn) state.listenBtn.disabled = !state.modelText;
        state.recordBtn.disabled = false;
        state.playBtn.disabled = !state.audioBlob;
    }
}

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

function estimateF0Frames(samples, sampleRate, isModelCapture = false) {
    const frameLength = Math.round(sampleRate * 0.040);
    const hopLength = Math.round(sampleRate * 0.010);

    const minFrequency = 75;
    const maxFrequency = 400;

    const minLag = Math.floor(sampleRate / maxFrequency);
    const maxLag = Math.ceil(sampleRate / minFrequency);

    if (samples.length < frameLength) {
        return [];
    }

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

    const minRmsFloor = isModelCapture ? 0.0015 : 0.008;
    if (maxRms < minRmsFloor) {
        return rawFrames.map(({ time }) => ({ time, f0: null }));
    }

    const rmsThreshold = Math.max(minRmsFloor, maxRms * 0.18);

    for (let idx = 0; idx < rawFrames.length; idx++) {
        const info = rawFrames[idx];

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

    const validSegments = [];

    for (const seg of segments) {
        if (seg.length < 6) continue;

        const segMedian = calculateMedian(
            seg.map(idx => rawFrames[idx].f0)
        );

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
        // Keep voiced segments belonging to the spoken sentence (allowing short
        // unvoiced consonant or phrase-boundary pauses across the 2-phrase sentence).
        const mainSeg = validSegments.reduce((best, seg) =>
            seg.totalEnergy > best.totalEnergy ? seg : best
        );

        const candidateSegments = validSegments.filter(
            seg => seg.peakRms >= mainSeg.peakRms * 0.22
        );

        const keptSet = new Set([mainSeg]);
        let clusterStart = mainSeg.startTime;
        let clusterEnd = mainSeg.endTime;
        let changed = true;

        while (changed) {
            changed = false;
            for (const seg of candidateSegments) {
                if (keptSet.has(seg)) continue;
                const gap = Math.max(
                    0,
                    seg.startTime - clusterEnd,
                    clusterStart - seg.endTime
                );
                if (gap <= 0.85) {
                    keptSet.add(seg);
                    clusterStart = Math.min(clusterStart, seg.startTime);
                    clusterEnd = Math.max(clusterEnd, seg.endTime);
                    changed = true;
                }
            }
        }

        const keptSegments = candidateSegments.filter(seg =>
            keptSet.has(seg)
        );

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

function calculateMedian(values) {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

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

function drawPitchCurve(state, userFrames, modelFrames = null) {
    const { context, width, height } =
        preparePitchCanvas(state.canvas);

    context.clearRect(0, 0, width, height);

    const padding = {
        left: 44,
        right: 12,
        top: 22,
        bottom: 28
    };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const hasUser = Boolean(userFrames?.length);
    const hasModel = Boolean(modelFrames?.length);

    if (plotWidth <= 0 || plotHeight <= 0 || (!hasUser && !hasModel)) {
        drawPitchPlaceholder(state, "No F0 data available.");
        return;
    }

    const minHz = 70;
    const maxHz = 400;

    const plotLeft = padding.left;
    const plotRight = padding.left + plotWidth;
    const plotTop = padding.top;
    const plotBottom = padding.top + plotHeight;

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

    function extractVoicedInfo(frames) {
        if (!frames?.length) return null;
        const voiced = frames.filter(
            frame =>
                Number.isFinite(frame.f0)
                && frame.f0 >= minHz
                && frame.f0 <= maxHz
        );
        if (!voiced.length) return null;
        const firstVoiced = voiced[0].time;
        const lastVoiced = voiced[voiced.length - 1].time;
        return {
            frames,
            firstVoiced,
            lastVoiced,
            span: Math.max(0, lastVoiced - firstVoiced)
        };
    }

    const userInfo = extractVoicedInfo(userFrames);
    const modelInfo = extractVoicedInfo(modelFrames);

    const maxSpan = Math.max(
        userInfo ? userInfo.span : 0,
        modelInfo ? modelInfo.span : 0
    );
    const windowDuration = Math.max(0.8, maxSpan + 0.30);

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

    function renderContour(info, color, isDashed = false) {
        if (!info) return;

        context.save();
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.lineJoin = "round";
        context.lineCap = "round";
        if (isDashed) {
            context.setLineDash([6, 4]);
        }

        const segments = [];
        let currentSegment = [];

        info.frames.forEach(frame => {
            const relTime = frame.time - info.firstVoiced + 0.15;
            if (
                !Number.isFinite(frame.f0) ||
                frame.f0 < minHz ||
                frame.f0 > maxHz ||
                relTime < 0 ||
                relTime > windowDuration
            ) {
                if (currentSegment.length) {
                    segments.push(currentSegment);
                    currentSegment = [];
                }
                return;
            }

            const x =
                plotLeft +
                (relTime / windowDuration) * plotWidth;

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

            context.setLineDash([]);
            context.fillStyle = color;
            [points[0], points[points.length - 1]].forEach(pt => {
                context.beginPath();
                context.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
                context.fill();
            });
            if (isDashed) {
                context.setLineDash([6, 4]);
            }
        });

        context.restore();
    }

    if (modelInfo) {
        renderContour(modelInfo, "#9333ea", Boolean(userInfo));
    }
    if (userInfo) {
        renderContour(userInfo, "#0d9488", false);
    }

    // Legend at top right
    context.save();
    context.font = "bold 11px sans-serif";
    context.textBaseline = "top";
    context.textAlign = "right";
    let legendX = plotRight;
    if (userInfo) {
        context.fillStyle = "#0d9488";
        context.fillText("● You (🎙️)", legendX, 4);
        legendX -= 76;
    }
    if (modelInfo) {
        context.fillStyle = "#9333ea";
        context.fillText("● Model (🔊)", legendX, 4);
    }
    context.restore();
}

function setPitchStatus(state, message) {
    if (state.statusEl) {
        state.statusEl.textContent = message;
    }
}


// Keep lifecycle and Voice locks aligned with this page's existing recorder.
DrillAudio.configure({
    busy: () => p2Busy(),
    sync: () => p2Sync(),
    stop: () => stopAllPlayback(),
    cancel: () => {
        p2.pending = false;
        const capture = pronunciationCapture || activeRecognitionSession;
        if (capture) {
            capture.discard = true;
            capture.stop?.("", true);
        }
    }
});
