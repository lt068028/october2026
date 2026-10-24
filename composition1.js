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
    setupPreferredVoice();
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

let compositionSpeechStyle = "formal";

function compositionModel(item, omitParticle = true) {
    let text = item.jaKanji.replace(/[。？?]+$/g, "");
    const question = /ですか$/.test(text);

    if (compositionSpeechStyle !== "formal") {
        text = text
            .replace(/ですか$/, "")
            .replace(/です$/, "");

        if (compositionSpeechStyle === "casual") {
            if (omitParticle) {
                text = text.replace(
                    /^(.+?)[がは][、,\s]*/,
                    "$1、"
                );
            }

            if (!question) text += "よ";
        }
    }

    text = text.replace(
        /^(.+?[がは])[、,\s]*/,
        "$1、"
    );

    return text + (question ? "？" : "。");
}

function compositionTokens(text) {
    const chars = Array.from(
        String(text ?? "").normalize("NFKC")
    );

    const tokens = chars
        .map((char, index) => ({char, index}))
        .filter(token =>
            !/[\s、。,.!?！？「」『』・]/.test(token.char)
        );

    const suffix = tokens
        .map(token => token.char)
        .join("")
        .match(/(?:よね|よ|ね)$/);

    if (suffix) {
        tokens.splice(tokens.length - suffix[0].length);
    }

    return {chars, tokens};
}

function compositionDiff(actual, reference) {
    const a = compositionTokens(actual);
    const b = compositionTokens(reference);
    const n = a.tokens.length;
    const m = b.tokens.length;

    const reading = text =>
        convertToHiragana(text + "\uE000")
            .replace(/\uE000$/, "")
            .toLowerCase()
            .replace(/[ァ-ヶ]/g, char =>
                String.fromCharCode(char.charCodeAt(0) - 96)
            );

    const spans = tokens => tokens.map((_, start) => {
        const result = new Map();
        let text = "";

        for (
            let end = start + 1;
            end <= tokens.length;
            end++
        ) {
            text += tokens[end - 1].char;
            const value = reading(text);

            if (!result.has(value)) {
                result.set(value, []);
            }

            result.get(value).push(end);
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
        i, j, x, y, cost,
        red = false,
        blue = false
    ) => {
        const value = costs[i][j] + cost;

        if (value < costs[x][y]) {
            costs[x][y] = value;
            steps[x][y] = {i, j, red, blue};
        }
    };

    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            if (!Number.isFinite(costs[i][j])) continue;

            if (i < n && j < m) {
                const x = a.tokens[i].char;
                const y = b.tokens[j].char;

                const particle =
                    x !== y
                    && /[がは]/.test(x)
                    && /[がは]/.test(y);

                update(
                    i, j, i + 1, j + 1,
                    x === y || particle ? 0 : 1,
                    x !== y && !particle,
                    particle
                );

                for (const [value, endsA] of aa[i]) {
                    const endsB = bb[j].get(value);
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
    const blue = new Set();
    const gaps = new Set();

    let i = n;
    let j = m;

    while (i || j) {
        const step = steps[i][j];
        if (!step) break;

        for (let k = step.i; k < i; k++) {
            if (step.red) red.add(a.tokens[k].index);
            if (step.blue) blue.add(a.tokens[k].index);
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
        cost: costs[n][m],
        chars: a.chars,
        red,
        blue,
        gaps
    };
}

function compositionBestDiff(text, references) {
    let best = null;

    const candidates = references.flatMap(text => [
        text,
        convertToHiragana(text)
    ]);

    for (const reference of candidates) {
        const diff = compositionDiff(text, reference);

        if (!best || diff.cost < best.cost) {
            best = diff;
        }
    }

    return best;
}

function compositionShow(view, message = "") {
    const {
        rowIndex,
        item,
        resultSpan,
        correctionBox,
        corrText
    } = view;

    const saved = savedResults[rowIndex];

    resultSpan.replaceChildren();
    resultSpan.style.color = "var(--text-primary)";
    correctionBox.style.display = "none";
    corrText.textContent = "";

    const append = (text, color) => {
        const span = document.createElement("span");
        span.textContent = text;

        if (color) span.style.color = color;

        resultSpan.append(span);
    };

    if (item && saved?.rawTranscript) {
        // 録音時のモデルを保存し、設定変更後も保持する。
        if (!saved.references) {
            saved.references = [...item.references];
            saved.modelKanji = item.jaKanji;
        }

        if (typeof saved.isCorrect !== "boolean") {
            saved.isCorrect = compositionBestDiff(
                saved.rawTranscript,
                saved.references
            ).cost === 0;
        }

        const displayed = useHiraganaOnly
            ? convertToHiragana(saved.rawTranscript)
            : saved.rawTranscript;

        const diff = compositionBestDiff(
            displayed,
            saved.references
        );

        for (let i = 0; i <= diff.chars.length; i++) {
            if (!saved.isCorrect && diff.gaps.has(i)) {
                append("＿", "var(--error-text)");
            }

            if (i === diff.chars.length) break;

            append(
                diff.chars[i],
                !saved.isCorrect && diff.red.has(i)
                    ? "var(--error-text)"
                    : diff.blue.has(i)
                        ? "var(--accent-color)"
                        : null
            );
        }

        append(saved.isCorrect ? " ✅ " : " ");

        if (saved.isCorrect && diff.blue.size) {
            resultSpan.append(
                document.createElement("br")
            );

            append(
                "Both 'ga' and 'wa' are correct in this context. ",
                "var(--accent-color)"
            );
        }

        if (!saved.isCorrect) {
            correctionBox.style.display = "block";
            corrText.textContent =
                "🔥Keep going! Try once more!";
        }
    } else if (!item && saved?.rawTranscript) {
        // 音声専用モードへ切り替えても、以前の抽出文は残す。
        append(
            (
                useHiraganaOnly
                    ? convertToHiragana(saved.rawTranscript)
                    : saved.rawTranscript
            ) + " "
        );
    } else {
        append(
            savedAudioUrls[rowIndex]
                ? (
                    saved?.audioOnly
                        ? "🎙️Audio only "
                        : "(Recorded) "
                )
                : "(Not recorded yet) ",
            "var(--text-secondary)"
        );
    }

    if (savedAudioUrls[rowIndex]) {
        const play = document.createElement("button");

        play.type = "button";
        play.className =
            "example-button play-recording-btn custom-tip-wrap";
        play.textContent = "▶️";

        play.setAttribute(
            "aria-label",
            "Play your recorded voice"
        );

        const tip = document.createElement("span");
        tip.className = "custom-tip-box";
        tip.textContent = "Play your recorded voice";

        play.append(tip);
        play.onclick = () => compositionPlay(rowIndex);

        resultSpan.append(play);
    }

    if (message) {
        append(" " + message, "var(--text-secondary)");
    }

    if (activeRecognitionSession?.rowIndex === rowIndex) {
        resultSpan.textContent =
            activeRecognitionSession.audioOnly
                ? "Recording...(🐣Hiragana Only:🎙️Audio only)"
                : "Recording...";

        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (compositionState.starting === rowIndex) {
        resultSpan.textContent = "Preparing microphone...";
    }
}

function createDrill1Row(
    container,
    indexLabel,
    item,
    rowIndex
) {
    const model = compositionModel(item);

    compositionCreateRow(
        container,
        indexLabel,
        {
            ...item,
            jaKanji: model,
            jaHira: convertToHiragana(model),
            references: [
                ...new Set([
                    model,
                    compositionModel(item, false)
                ])
            ]
        },
        rowIndex
    );
}

function createDrill2Row(container, indexLabel) {
    compositionCreateRow(
        container,
        indexLabel,
        null,
        drill1Data.length
    );
}

function compositionCreateRow(
    container,
    indexLabel,
    item,
    rowIndex
) {
    const element = (tag, className = "", text = "") => {
        const value = document.createElement(tag);
        value.className = className;
        value.textContent = text;
        return value;
    };

    const button = (label, tip) => {
        const value = element(
            "button",
            "example-button custom-tip-wrap",
            label
        );

        value.type = "button";
        value.append(
            element("span", "custom-tip-box", tip)
        );

        return value;
    };

    const row = element("div", "drill-row");
    const table = element("table", "recording-table");
    const columns = element("colgroup");

    columns.append(
        element("col"),
        element("col"),
        element("col")
    );

    columns.children[0].style.width = "34px";

    const body = element("tbody");
    const line = element("tr");

    const number = element(
        "td",
        "drill-number-cell",
        indexLabel
    );

    const cue = element("td", "drill-cue-cell");

    if (item) {
        cue.textContent = item.en;
    } else {
        const input = element("input", "custom-input");

        input.type = "text";
        input.placeholder = "Optional reference text...";

        input.setAttribute(
            "aria-label",
            "Optional reference text"
        );

        input.value = drill2State.inputVal;

        input.oninput = () => {
            drill2State.inputVal = input.value;
        };

        cue.append(input);
    }

    const cell = element("td");
    const controls = element(
        "div",
        "recording-controls"
    );

    const actions = element(
        "div",
        "recording-actions"
    );

    if (item) {
        const listen = button(
            "🔊きく",
            "Listen to the model sentence."
        );

        listen.onclick = () =>
            compositionPlay(rowIndex, item.jaKanji, true);

        actions.append(listen);
    }

    const recordBtn = button(
        "🎙️とる",
        "Record your voice."
    );

    const stopBtn = button(
        "⏹️",
        "Stop recording."
    );

    stopBtn.disabled = true;
    actions.append(recordBtn, stopBtn);

    const resultSpan = element(
        "span",
        "result-text"
    );

    const result = element(
        "span",
        "recording-result"
    );

    result.append(resultSpan);
    controls.append(actions, result);

    const correctionBox = element(
        "div",
        "correction-box"
    );

    const corrText = element("span");
    correctionBox.append(corrText);

    cell.append(controls, correctionBox);
    line.append(number, cue, cell);
    body.append(line);
    table.append(columns, body);
    row.append(table);
    container.append(row);

    const view = {
        rowIndex,
        item,
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrText
    };

    compositionState.views[rowIndex] = view;

    recordBtn.onclick = () =>
        compositionRecord(rowIndex);

    stopBtn.onclick = () => {
        const session = activeRecognitionSession;

        if (
            session?.rowIndex === rowIndex
            && session.manual
        ) {
            session.stop();
        }
    };

    compositionShow(view);
}

(() => {
    const originalPlay = compositionPlay;

    compositionPlay = function(
        rowIndex,
        model = "",
        onlyModel = false
    ) {
        if (model) {
            const item =
                compositionState.views[rowIndex]?.item;

            model = onlyModel
                ? item?.jaKanji || model
                : savedResults[rowIndex]?.modelKanji
                    || item?.jaKanji
                    || model;
        }

        return originalPlay(rowIndex, model, onlyModel);
    };

    const originalInit = initSettingsPanel;

    initSettingsPanel = function() {
        originalInit();

        const control = document.getElementById(
            "speechStyleControl"
        );

        control?.addEventListener("click", event => {
            if (compositionBusy()) return;

            const option = event.target.closest(
                "button[data-value]"
            );

            if (
                !option
                || !control.contains(option)
            ) {
                return;
            }

            const value = option.dataset.value;

            if (
                !["formal", "informal", "casual"].includes(value)
                || value === compositionSpeechStyle
            ) {
                return;
            }

            compositionSpeechStyle = value;
            renderAll();
        });
    };

    const originalSync = compositionSync;

    compositionSync = function() {
        originalSync();

        document.querySelectorAll(
            ".compact-settings .segmented-option, " +
            ".compact-settings input"
        ).forEach(control => {
            control.disabled = compositionBusy();
        });
    };

    document.addEventListener("click", event => {
        if (
            compositionBusy()
            && event.target.closest(
                ".compact-settings .segmented-option"
            )
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    const originalRender = renderAll;

    renderAll = function() {
        if (compositionBusy()) return;

        originalRender();

        document.querySelectorAll(
            "#speechStyleControl button"
        ).forEach(option => {
            const selected =
                option.dataset.value === compositionSpeechStyle;

            option.classList.toggle(
                "is-selected",
                selected
            );

            option.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });

        for (const id of [
            "drill1Container",
            "drill2Container"
        ]) {
            const section = document.getElementById(id);
            section.classList.add("practice-section");

            section.querySelector(
                ".info-panel"
            )?.style.removeProperty("margin-top");

            const description = section.querySelector(
                ".info-panel-desc"
            );

            if (description) {
                description.textContent =
                    description.textContent
                        .trim()
                        .replace(/^💡\s*/, "💡");
            }

            const tables = Array.from(
                section.querySelectorAll(".recording-table")
            );

            let width = 0;

            for (const table of tables) {
                const cell = table.querySelector(
                    ".drill-cue-cell"
                );

                const measure =
                    document.createElement("span");

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
                    Math.ceil(
                        measure.getBoundingClientRect().width
                    )
                );

                measure.remove();
            }

            tables.forEach(table => {
                table.querySelector(
                    "colgroup"
                ).children[1].style.width =
                    `${width + 8}px`;
            });
        }

        const tip = document.querySelector(
            "#labelAutoPlay .custom-tip-box"
        );

        if (tip) {
            tip.textContent =
                "ON: Plays the model, when available, then your recording. OFF: Disables automatic playback.";
        }

        compositionSync();
    };
})();

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
