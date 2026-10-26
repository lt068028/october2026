// ============================================================================
// Practice 1.1: XはYです
// ============================================================================

const taskData = [
    { x: "わたし", xKanji: "私", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "わたし", xKanji: "私", y: "せんせい", yKanji: "先生", yRomaji: "sensei", yMeaning: "teacher", isNeg: true },
    { x: "わたし", xKanji: "私", y: "にほんじん", yKanji: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese", isNeg: false },
    { x: "わたし", xKanji: "私", y: "りゅうがくせい", yKanji: "留学生", yRomaji: "ryūgakusei", yMeaning: "international student", isNeg: true },
    { x: "ともだち", xKanji: "友達", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "ともだち", xKanji: "友達", y: "しゅふ", yKanji: "主婦", yRomaji: "shufu", yMeaning: "home maker", isNeg: true },
    { x: "ともだち", xKanji: "友達", y: "アメリカじん", yKanji: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American", isNeg: false }
];

const customDict = {
    "i": { hira: "わたし", kanji: "私", romaji: "watashi", meaning: "I" },
    "friend": { hira: "ともだち", kanji: "友達", romaji: "tomodachi", meaning: "friend" },
    "family": { hira: "かぞく", kanji: "家族", romaji: "kazoku", meaning: "family" },
    "colleague": { hira: "どうりょう", kanji: "同僚", romaji: "dōryō", meaning: "colleague" },
    "boss": { hira: "じょうし", kanji: "上司", romaji: "jōshi", meaning: "boss" },
    "partner": { hira: "パートナー", kanji: "パートナー", romaji: "pātonā", meaning: "partner" },
    "Bf/Gf": { hira: "こいびと", kanji: "恋人", romaji: "koibito", meaning: "Bf/Gf" },
    "best friend": { hira: "しんゆう", kanji: "親友", romaji: "shinyū", meaning: "best friend" },
    "child": { hira: "こども", kanji: "子供", romaji: "kodomo", meaning: "child" },
    "grandchild": { hira: "まご", kanji: "孫", romaji: "mago", meaning: "grandchild" },
    "sibling": { hira: "きょうだい", kanji: "兄弟", romaji: "kyōdai", meaning: "sibling" },
    "foreigner": { hira: "がいこくじん", kanji: "外国人", romaji: "gaikokujin", meaning: "foreigner" },
    "doctor": { hira: "いしゃ", kanji: "医者", romaji: "isha", meaning: "doctor" },
    "engineer": { hira: "エンジニア", kanji: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "researcher": { hira: "けんきゅうしゃ", kanji: "研究者", romaji: "kenkyūsha", meaning: "researcher" },
    "designer": { hira: "デザイナー", kanji: "デザイナー", romaji: "dezainā", meaning: "designer" },
    "store staff": { hira: "てんいん", kanji: "店員", romaji: "tenin", meaning: "store staff" },
    "self-employed": { hira: "じえいぎょう", kanji: "自営業", romaji: "jiēgyō", meaning: "self-employed" },
    "civil servant": { hira: "こうむいん", kanji: "公務員", romaji: "kōmuin", meaning: "civil servant" },
    "nurse": { hira: "かんごし", kanji: "看護師", romaji: "kangoshi", meaning: "nurse" },
    "part-time worker": { hira: "アルバイト", kanji: "アルバイト", romaji: "arubaito", meaning: "part-time worker" },
    "international student": { hira: "りゅうがくせい", kanji: "留学生", romaji: "ryūgakusei", meaning: "international student" },
    "home maker": { hira: "しゅふ", kanji: "主婦", romaji: "shufu", meaning: "home maker" }
};

// ============================================================================
// 文字正規化
// ============================================================================

function removeRecognitionPunctuation(text) {
    return String(text || "")
        .normalize("NFKC")
        .replace(
            /[\s.,\/#!$%\^&\*;:{}=\-_`~()（）「」『』【】［］〔〕〈〉《》、。.,．．！？!?：；…・"'“”‘’]/g,
            ""
        );
}

function normalizeHiraganaTranscript(text) {
    if (!text) return "";

    let cleaned = removeRecognitionPunctuation(text);

    const dict = {
        "私": "わたし",
        "学生": "がくせい",
        "先生": "せんせい",
        "日本人": "にほんじん",
        "会社員": "かいしゃいん",
        "友達": "ともだち",
        "友だち": "ともだち",
        "家族": "かぞく",
        "同僚": "どうりょう",
        "上司": "じょうし",
        "パートナー": "ぱーとなー",
        "恋人": "こいびと",
        "親友": "しんゆう",
        "子供": "こども",
        "子ども": "こども",
        "孫": "まご",
        "兄弟": "きょうだい",
        "姉妹": "しまい",
        "外国人": "がいこくじん",
        "医師": "いし",
        "医者": "いしゃ",
        "エンジニア": "えんじにあ",
        "研究者": "けんきゅうしゃ",
        "デザイナー": "でざいなー",
        "店員": "てんいん",
        "自営業": "じえいぎょう",
        "公務員": "こうむいん",
        "看護師": "かんごし",
        "看護婦": "かんごし",
        "アルバイト": "あるばいと",
        "留学生": "りゅうがくせい",
        "留学せい": "りゅうがくせい",
        "留がくせい": "りゅうがくせい",
        "主婦": "しゅふ",
        "アメリカ人": "あめりかじん",
        "アメリカじん": "あめりかじん"
    };

    const keys = Object.keys(dict).sort(
        (a, b) => b.length - a.length
    );

    for (const key of keys) {
        cleaned = cleaned.split(key).join(dict[key]);
    }

    cleaned = cleaned.replace(/[\u30A1-\u30F6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );

    return cleaned;
}

function normalizeKanjiTranscript(text) {
    return removeRecognitionPunctuation(text);
}

function convertToHiragana(text) {
    return normalizeHiraganaTranscript(text);
}

// ============================================================================
// 設定・ページ内保存
// ============================================================================

let scriptMode = "hiragana";
let hintMode = "hover";
let isManualStop = false;
let isAutoPlay = true;
let activeRecognitionSession = null;

const practice1State = {
    customSelects: {},
    audioUrls: {},
    savedResults: {},
    views: {},
    startingRow: null
};

const AUDIO_ONLY_MESSAGE = "🐣Only Hiragana:🎙️Audio only";

let preferredVoice = null;
let currentPlayingAudio = null;
let currentUtteranceRef = null;
let playbackVersion = 0;
let activePlayButtons = [];

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

function practice1Normalize(text) {
    return normalizeHiraganaTranscript(text)
        .replace(/(?:よね|よ|ね)$/, "");
}

function matchesSentence(transcript, expectedText) {
    const actual = practice1Normalize(transcript);
    const expected = practice1Normalize(expectedText);

    const core = expected.replace(
        /(?:じゃないです|ではないです|じゃありません|ではありません)$/,
        ""
    );

    const candidates = core !== expected
        ? [
            "じゃないです",
            "ではないです",
            "じゃありません",
            "ではありません"
        ].map(end => core + end)
        : [expected];

    return Boolean(actual) && candidates.includes(actual);
}

function modelSentence(x, y, negative) {
    return negative
        ? `${x}は、${y}じゃ、ないです。`
        : `${x}は、${y}です。`;
}

function expectedSentence(x, y, negative) {
    return negative
        ? `${x}は${y}じゃないです`
        : `${x}は${y}です`;
}

function busy() {
    return Boolean(
        activeRecognitionSession || practice1State.startingRow
    );
}

// ============================================================================
// 再生
// ============================================================================

const VOICE_STORAGE_KEY = "october2026.selectedVoiceName";

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
    if (!("speechSynthesis" in window)) return;

    const voices = window.speechSynthesis.getVoices();
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
}

function stopAllPlayback() {
    DrillAudio.invalidatePlayback();
    playbackVersion++;

    if (currentUtteranceRef) {
        currentUtteranceRef.onend = null;
        currentUtteranceRef.onerror = null;
    }

    currentUtteranceRef = null;

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    if (currentPlayingAudio) {
        currentPlayingAudio.onended = null;
        currentPlayingAudio.onerror = null;
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
    }

    activePlayButtons.forEach(({ button, html, disabled }) => {
        button.innerHTML = html;
        button.disabled = disabled;
    });

    activePlayButtons = [];
}

function markPlaying(button) {
    if (!button) return;

    activePlayButtons.push({
        button,
        html: button.innerHTML,
        disabled: button.disabled
    });

    button.textContent = "Playing...";
    button.disabled = true;
}

function speakText(text, rate = 0.75, done = () => {}) {
    if (!("speechSynthesis" in window)) {
        done();
        return;
    }

    setupPreferredVoice();

    const version = playbackVersion;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "ja-JP";
    utterance.rate = rate;

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    currentUtteranceRef = utterance;

    const finish = () => {
        if (version !== playbackVersion) return;

        utterance.onend = null;
        utterance.onerror = null;
        currentUtteranceRef = null;
        done();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    try {
        DrillAudio.speak(utterance);
    } catch (error) {
        finish();
    }
}

function playAudio(url) {
    if (!url || busy()) {
        stopAllPlayback();
        return;
    }

    const version = playbackVersion;
    const audio = new Audio(url);

    currentPlayingAudio = audio;
    audio.playbackRate = 1;

    const finish = () => {
        if (version === playbackVersion) {
            stopAllPlayback();
        }
    };

    audio.onended = finish;
    audio.onerror = finish;
    DrillAudio.play(audio, finish);
}

function playModel(text, button) {
    if (busy()) return;

    stopAllPlayback();
    markPlaying(button);
    speakText(text, 0.75, stopAllPlayback);
}

function appendPersistedPlayButton(resultSpan, rowKey) {
    resultSpan.querySelector(".recorded-play-button")?.remove();

    if (!practice1State.audioUrls[rowKey]) return;

    const button = document.createElement("button");

    button.type = "button";
    button.className = "example-button recorded-play-button";
    button.textContent = "▶️";
    button.setAttribute("aria-label", "Play your recording");
    button.style.marginLeft = "8px";

    button.onclick = () => {
        if (busy()) return;

        stopAllPlayback();
        markPlaying(button);
        playAudio(practice1State.audioUrls[rowKey]);
    };

    resultSpan.appendChild(button);
}

// ============================================================================
// 設定パネル
// ============================================================================

function updateToggleLabelStyle(label, active) {
    if (!label) return;

    label.classList.toggle("active-mode", active);
    label.classList.toggle("inactive-mode", !active);
}

function initSettingsPanel() {
    function bindSegments(id, getValue, setValue) {
        const control = document.getElementById(id);
        if (!control) return;

        const buttons = [
            ...control.querySelectorAll(".segmented-option")
        ];

        const sync = () => {
            buttons.forEach(button => {
                const selected =
                    button.dataset.value === getValue();

                button.classList.toggle("is-selected", selected);
                button.setAttribute(
                    "aria-pressed",
                    String(selected)
                );
            });
        };

        buttons.forEach(button => {
            button.addEventListener("click", () => {
                setValue(button.dataset.value);
                sync();
                renderAll();
            });
        });

        sync();
    }

    bindSegments(
        "scriptModeControl",
        () => scriptMode,
        value => {
            scriptMode = value;
        }
    );

    bindSegments(
        "hintModeControl",
        () => hintMode,
        value => {
            hintMode = value;
        }
    );

    const record =
        document.getElementById("toggleRecordMode");

    const playback =
        document.getElementById("togglePlaybackMode");

    if (record) {
        const sync = () => {
            record.checked = !isManualStop;

            updateToggleLabelStyle(
                document.getElementById("labelAutoRecord"),
                !isManualStop
            );
        };

        record.addEventListener("change", () => {
            isManualStop = !record.checked;
            sync();
        });

        sync();
    }

    if (playback) {
        const sync = () => {
            playback.checked = isAutoPlay;

            updateToggleLabelStyle(
                document.getElementById("labelAutoPlay"),
                isAutoPlay
            );
        };

        playback.addEventListener("change", () => {
            isAutoPlay = playback.checked;
            sync();
        });

        sync();
    }
}

function formatWord(word, kanji, romaji, meaning) {
    const text = escapeHtml(
        scriptMode === "kanji" && kanji ? kanji : word
    );

    const hint = escapeHtml(`${romaji}, ${meaning}`);

    if (hintMode === "off") {
        return `<span class="target-word">${text}</span>`;
    }

    if (hintMode === "paren") {
        return `<span class="display-cue-unit"><span class="target-word">${text}</span><span class="vocab-inline"> (${hint})</span></span>`;
    }

    return `
        <span class="tooltip-wrap">
            <span class="target-word">${text}</span>
            <span class="tooltip-tip">${hint}</span>
        </span>
    `;
}

function renderAll() {
    stopAllPlayback();

    practice1State.views = {};

    renderExampleSection();
    renderTask1();
    renderTask2();
    renderTask3();
}

// ============================================================================
// Example
// ============================================================================

function renderExampleSection() {
    const container =
        document.getElementById("exampleSectionContainer");

    if (!container) return;

    const x = formatWord("わたし", "私", "watashi", "I");

    const student = formatWord(
        "がくせい", "学生", "gakusei", "student"
    );

    const teacher = formatWord(
        "せんせい", "先生", "sensei", "teacher"
    );

    const subject =
        scriptMode === "kanji" ? "私" : "わたし";

    const noun1 =
        scriptMode === "kanji" ? "学生" : "がくせい";

    const noun2 =
        scriptMode === "kanji" ? "先生" : "せんせい";

    container.innerHTML = `
        <div class="example-box">
            <div
                class="flex-row-center"
                style="margin-top:3px;"
            >
                <span class="example-label-title">
                    🟢Affirmative:
                </span>
                ${x}${hintMode === "paren" ? "" : " ／ "}${student}
                <span>👉</span>
                <button
                    type="button"
                    id="ex1Listen"
                    class="example-button"
                >🔊きく</button>
                <span>${subject}<strong class="grammar-highlight">は、</strong>${noun1}<strong class="grammar-highlight">です。</strong></span>
            </div>

            <div
                class="flex-row-center dashed-border"
                style="margin-top:12px;padding-top:12px;"
            >
                <span class="example-label-title">
                    🔴Negative:
                </span>
                ${x}${hintMode === "paren" ? "" : " ／ "}${teacher}
                <span>👉</span>
                <button
                    type="button"
                    id="ex2Listen"
                    class="example-button"
                >🔊きく</button>
                <span>${subject}<strong class="grammar-highlight">は、</strong>${noun2}<strong class="grammar-highlight">じゃないです。</strong></span>
            </div>
        </div>
    `;

    const positive = document.getElementById("ex1Listen");
    const negative = document.getElementById("ex2Listen");

    positive.onclick = () => {
        playModel(
            modelSentence("私", "学生", false),
            positive
        );
    };

    negative.onclick = () => {
        playModel(
            modelSentence("私", "先生", true),
            negative
        );
    };
}

// ============================================================================
// 行の共通部品・結果復元
// ============================================================================

function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    if (tag === "button") {
        element.type = "button";
    }

    return element;
}

function makeRow(
    container,
    rowKey,
    number,
    negative,
    freeInput,
    getWords
) {
    const row = makeElement("div", "drill-row");
    const top = makeElement("div", "top-row");

    const listen = makeElement(
        "button", "example-button", "🔊きく"
    );

    const index = makeElement(
        "span", "", `${number}.`
    );

    const prompts = makeElement(
        "span", "prompt-label prompt-content"
    );

    prompts.style.display = "contents";

    const type = makeElement(
        "span",
        "custom-tip-wrap",
        negative ? "🔴" : "🟢"
    );

    type.title = negative ? "Negative" : "Affirmative";

    const record = makeElement(
        "button", "example-button", "⏺️とる"
    );

    const stop = makeElement(
        "button", "example-button", "⏹️"
    );

    stop.disabled = true;

    const result = makeElement(
        "span", "result-text"
    );

    const correction = makeElement(
        "div", "correction-box"
    );

    const correctionListen = makeElement(
        "button", "example-button", "🔊きく"
    );

    correctionListen.style.marginRight = "8px";

    const correctionText = makeElement("span");

    correction.append(
        correctionListen,
        correctionText
    );

    top.append(
        listen,
        index,
        prompts,
        type,
        record,
        stop,
        result
    );

    row.append(top, correction);
    container.appendChild(row);

    const view = {
        rowKey,
        row,
        prompts,
        listen,
        record,
        stop,
        result,
        correction,
        correctionListen,
        correctionText,
        freeInput,
        negative,
        getWords,

        ready: () => {
            const words = getWords();

            return Boolean(
                words.x.trim() && words.y.trim()
            );
        }
    };

    practice1State.views[rowKey] = view;

    listen.onclick = () => {
        const words = getWords();

        if (view.ready()) {
            playModel(
                modelSentence(
                    words.kanjiX || words.x,
                    words.kanjiY || words.y,
                    negative
                ),
                listen
            );
        }
    };

    record.onclick = () => startRecording(view);

    stop.onclick = () => {
        if (activeRecognitionSession?.rowKey === rowKey) {
            activeRecognitionSession.stop();
        }
    };

    return view;
}

function syncRecordingButtons() {
    const blocked = busy();
    const session = activeRecognitionSession;

    const playing = new Set(
        activePlayButtons.map(item => item.button)
    );

    Object.values(practice1State.views).forEach(view => {
        const running =
            session?.rowKey === view.rowKey;

        const starting =
            practice1State.startingRow === view.rowKey;

        const canStop = Boolean(
            running
            && session.manual
            && !session.stopRequested
        );

        // 録音中・マイク許可待ちは、全行の再生と録音を無効化する。
        view.listen.disabled =
            blocked
            || !view.ready()
            || playing.has(view.listen);

        view.record.disabled =
            blocked || !view.ready();

        // Manualでは録音中の行の停止ボタンだけを有効にする。
        view.stop.disabled = !canStop;

        view.stop.classList.toggle(
            "stop-btn-active",
            canStop
        );

        view.correctionListen.disabled =
            blocked
            || playing.has(view.correctionListen);

        view.result
            .querySelectorAll(".recorded-play-button")
            .forEach(button => {
                button.disabled =
                    blocked || playing.has(button);
            });

        // 録音対象のX・Yは、終了するまで変更できないようにする。
        view.row.querySelectorAll("input, select")
            .forEach(input => {
                input.disabled = running || starting;
            });
    });

    // Exampleのモデル再生も無効化する。
    ["ex1Listen", "ex2Listen"].forEach(id => {
        const button = document.getElementById(id);

        if (button) {
            button.disabled =
                blocked || playing.has(button);
        }
    });

    // 無効なボタンには禁止カーソルを表示する。
    document.querySelectorAll(".example-button")
        .forEach(button => {
            button.style.setProperty(
                "cursor",
                button.disabled
                    ? "not-allowed"
                    : "pointer",
                "important"
            );
        });
}

function refreshRow(view) {
    const session = activeRecognitionSession;

    const running =
        session?.rowKey === view.rowKey;

    const starting =
        practice1State.startingRow === view.rowKey;

    if (running || starting) {
        view.result.textContent = starting
            ? "Preparing microphone..."
            : session.audioOnly
                ? `Recording...(${AUDIO_ONLY_MESSAGE})`
                : "Recording...";

        view.result.style.color = "var(--accent-color)";
        view.correction.style.display = "none";

        syncRecordingButtons();
        return;
    }

    displayResult(view);
}

function practice1DiffReading(text) {
    return normalizeHiraganaTranscript(text)
        .toLowerCase();
}

function practice1DiffTokens(text) {
    const chars = Array.from(
        String(text ?? "").normalize("NFKC")
    );

    const tokens = chars
        .map((char, index) => ({char, index}))
        .filter(token =>
            practice1DiffReading(token.char) !== ""
        );

    // 終助詞は表示に残し、比較対象からだけ外す。
    const joined = tokens.map(token => token.char).join("");
    const suffix = joined.match(/(?:よね|よ|ね)$/);

    if (suffix) {
        tokens.splice(tokens.length - suffix[0].length);
    }

    return {chars, tokens};
}

function practice1FindDiff(actual, reference) {
    const a = practice1DiffTokens(actual);
    const b = practice1DiffTokens(reference);

    const n = a.tokens.length;
    const m = b.tokens.length;

    function spans(tokens) {
        return tokens.map((_, start) => {
            const readings = new Map();
            let text = "";

            for (
                let end = start + 1;
                end <= tokens.length;
                end++
            ) {
                text += tokens[end - 1].char;
                const reading = practice1DiffReading(text);

                if (!reading) continue;

                if (!readings.has(reading)) {
                    readings.set(reading, []);
                }

                readings.get(reading).push(end);
            }

            return readings;
        });
    }

    const aSpans = spans(a.tokens);
    const bSpans = spans(b.tokens);

    const costs = Array.from(
        {length: n + 1},
        () => Array(m + 1).fill(Infinity)
    );

    const steps = Array.from(
        {length: n + 1},
        () => Array(m + 1).fill(null)
    );

    costs[0][0] = 0;

    function update(i, j, nextI, nextJ, extra, red) {
        const cost = costs[i][j] + extra;

        if (cost < costs[nextI][nextJ]) {
            costs[nextI][nextJ] = cost;
            steps[nextI][nextJ] = {i, j, red};
        }
    }

    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            if (!Number.isFinite(costs[i][j])) continue;

            if (i < n && j < m) {
                const same =
                    a.tokens[i].char === b.tokens[j].char;

                update(
                    i,
                    j,
                    i + 1,
                    j + 1,
                    same ? 0 : 1,
                    !same
                );

                // 登録済みの漢字・読みの表記差は一致扱い。
                for (
                    const [reading, endsA]
                    of aSpans[i]
                ) {
                    const endsB = bSpans[j].get(reading);

                    if (!endsB) continue;

                    for (const endA of endsA) {
                        for (const endB of endsB) {
                            update(
                                i, j, endA, endB, 0, false
                            );
                        }
                    }
                }
            }

            if (i < n) {
                update(i, j, i + 1, j, 1, true);
            }

            if (j < m) {
                update(i, j, i, j + 1, 1, false);
            }
        }
    }

    const redIndexes = new Set();
    const gaps = new Set();

    let i = n;
    let j = m;

    while (i || j) {
        const step = steps[i][j];

        if (!step) break;

        if (step.red) {
            for (let k = step.i; k < i; k++) {
                redIndexes.add(a.tokens[k].index);
            }
        }

        // 連続した不足は、同じ位置の「＿」一つにまとめる。
        if (step.i === i && step.j < j) {
            const position = i < a.tokens.length
                ? a.tokens[i].index
                : a.tokens.length
                    ? a.tokens[a.tokens.length - 1].index + 1
                    : 0;

            gaps.add(position);
        }

        i = step.i;
        j = step.j;
    }


    return {
        cost: costs[n][m],
        chars: a.chars,
        redIndexes,
        gaps
    };
}

function practice1ResultDiff(displayed, saved, view) {
    let references;

    if (saved.freeInput) {
        // Drill 3では、入力されたX・Yとの内容一致を求めない。
        // 抽出文自身のX・Yを残し、文型だけを比較する。
        const tokens =
            practice1DiffTokens(displayed).tokens;

        const surface = tokens
            .map(token => token.char)
            .join("");

        const ending = surface.match(
            /(?:じゃないです|ではないです|じゃありません|ではありません|じゃない|ではない|でした|だった|です|だ)$/
        );

        let body = ending
            ? surface.slice(0, -ending[0].length)
            : surface;

        if (!body.includes("は")) {
            const words = [
                ...taskData.flatMap(item => [
                    item.x, item.xKanji
                ]),
                ...Object.values(customDict).flatMap(item => [
                    item.hira, item.kanji
                ])
            ]
                .filter(Boolean)
                .sort((a, b) => b.length - a.length);

            const first = words.find(word =>
                body.startsWith(word)
            );

            let position = first ? first.length : 0;

            if (
                !position
                && body
                && typeof Intl !== "undefined"
                && Intl.Segmenter
            ) {
                const segmenter = new Intl.Segmenter("ja", {
                    granularity: "word"
                });

                const segment = [
                    ...segmenter.segment(body)
                ].find(item => item.isWordLike);

                if (segment) {
                    position =
                        segment.index + segment.segment.length;
                }
            }

            if (!position) position = body.length;

            body =
                body.slice(0, position)
                + "は"
                + body.slice(position);
        }

        // 不足スロット用の内部記号。画面には＿だけを表示する。
        if (body.startsWith("は")) {
            body = "¤" + body;
        }

        if (body.endsWith("は")) {
            body += "¤";
        }

        references = view.negative
            ? [
                "じゃないです",
                "ではないです",
                "じゃありません",
                "ではありません"
            ].map(end => body + end)
            : [body + "です"];

    } else {
        references = [
            saved.expectedText,
            saved.modelText
        ].filter(text =>
            typeof text === "string" && text.length
        );

        references = references.flatMap(text => {
            const value =
                removeRecognitionPunctuation(text);

            const core = value.replace(
                /(?:じゃないです|ではないです|じゃありません|ではありません)$/,
                ""
            );

            return core === value
                ? [value]
                : [
                    "じゃないです",
                    "ではないです",
                    "じゃありません",
                    "ではありません"
                ].map(end => core + end);
        });

        references = [...new Set(
            references.flatMap(text => [
                text,
                normalizeHiraganaTranscript(text)
            ])
        )];
    }

    let best = null;

    for (const reference of references) {
        const diff = practice1FindDiff(
            displayed,
            reference
        );

        if (!best || diff.cost < best.cost) {
            best = diff;
        }
    }

    return best;
}

function displayResult(view, message = "") {
    const saved =
        practice1State.savedResults[view.rowKey];

    view.correction.style.display = "none";
    view.result.style.color = "var(--text-secondary)";

    if (saved?.audioOnly) {
        view.result.textContent = AUDIO_ONLY_MESSAGE;

    } else if (saved?.rawTranscript !== undefined) {
        const displayed =
            scriptMode === "hiragana" && !saved.freeInput
                ? normalizeHiraganaTranscript(
                    saved.rawTranscript
                )
                : saved.rawTranscript;

        view.result.textContent = "";
        view.result.style.color = "var(--text-primary)";

        if (saved.isCorrect) {
            view.result.appendChild(
                document.createTextNode(displayed + " ✅")
            );

        } else {
            const diff = practice1ResultDiff(
                displayed,
                saved,
                view
            );

            const red = text => {
                const span = document.createElement("span");

                span.textContent = text;
                span.style.color = "var(--error-text)";

                view.result.appendChild(span);
            };

            if (!diff) {
                view.result.appendChild(
                    document.createTextNode(displayed)
                );
            } else {
                for (
                    let index = 0;
                    index <= diff.chars.length;
                    index++
                ) {
                    if (diff.gaps.has(index)) {
                        red("＿");
                    }

                    if (index === diff.chars.length) {
                        break;
                    }

                    if (diff.redIndexes.has(index)) {
                        red(diff.chars[index]);
                    } else {
                        view.result.appendChild(
                            document.createTextNode(
                                diff.chars[index]
                            )
                        );
                    }
                }
            }

            view.correction.style.display = "block";

            view.correctionText.textContent =
                "🔥 Keep going! Try once more!";

            view.correctionListen.style.display =
                "inline-block";

            view.correctionListen.onclick = () => {
                playModel(
                    saved.modelText,
                    view.correctionListen
                );
            };
        }

    } else if (saved?.unrecognized) {
        view.result.textContent = "(Recorded)";

    } else {
        view.result.textContent =
            view.freeInput && scriptMode === "hiragana"
                ? AUDIO_ONLY_MESSAGE
                : "(Not recorded yet)";
    }

    if (message) {
        const notice = document.createElement("span");

        notice.textContent = message + " ";
        notice.style.color = "var(--text-secondary)";

        view.result.prepend(notice);
    }

    appendPersistedPlayButton(
        view.result,
        view.rowKey
    );

    syncRecordingButtons();
}

// ============================================================================
// Drill 3専用：入力したX・Yとの内容一致は求めず、指定の文型を判定する。
// 句読点・空白は判定から除外し、文末のよ／ね／よねを許容する。
// ============================================================================

function matchesFreeSentence(transcript, negative) {
    const normalized = practice1Normalize(transcript);

    const negativeEnding = normalized.match(
        /(?:じゃないです|ではないです|じゃありません|ではありません)$/
    );

    if (negative) {
        if (!negativeEnding) return false;

        const body = normalized.slice(
            0,
            -negativeEnding[0].length
        );

        // 「は」の前後に内容があることを確認する。
        return /^.+は.+$/.test(body);
    }

    // 否定文を肯定文として通さない。
    if (negativeEnding || !normalized.endsWith("です")) {
        return false;
    }

    const body = normalized.slice(0, -2);

    return /^.+は.+$/.test(body);
}

function section(
    containerId,
    title,
    instruction,
    className,
    margin
) {
    const container =
        document.getElementById(containerId);

    if (!container) return null;

    container.innerHTML = `
        <div
            class="info-panel ${className}"
            style="margin-top:${margin}px;"
        >
            <span class="info-panel-title">${title}</span>
            <span class="info-panel-desc instruction-steps">${instruction}</span>
        </div>
    `;

    const list = makeElement("div");
    container.appendChild(list);

    return list;
}

// ============================================================================
// Drill 1: Basic Sentences
// ============================================================================

function renderTask1() {
    const list = section(
        "task1Container",
        "Drill 1: Basic Sentences",
        "💡Make 🟢 affirmative and 🔴 negative sentences.",
        "info-panel-task1",
        25
    );

    if (!list) return;

    taskData.forEach((item, index) => {
        const view = makeRow(
            list,
            `task1_${index}`,
            index + 1,
            item.isNeg,
            false,
            () => ({
                x: item.x,
                y: item.y,
                kanjiX: item.xKanji,
                kanjiY: item.yKanji
            })
        );

        const formattedX = formatWord(
            item.x,
            item.xKanji,
            item.x === "わたし" ? "watashi" : "tomodachi",
            item.x === "わたし" ? "I" : "friend"
        );

        const formattedY = formatWord(
            item.y,
            item.yKanji,
            item.yRomaji,
            item.yMeaning
        );

        view.prompts.innerHTML =
            formattedX + (hintMode === "paren" ? "" : " ／ ") + formattedY;

        refreshRow(view);
    });
}

// ============================================================================
// Drill 2: Selectable Practice
// ============================================================================

const optionsX = [
    "friend",
    "family",
    "colleague",
    "boss",
    "partner",
    "Bf/Gf",
    "best friend",
    "child",
    "grandchild",
    "sibling"
];

const optionsY = [
    "foreigner",
    "doctor",
    "engineer",
    "researcher",
    "designer",
    "store staff",
    "self-employed",
    "civil servant",
    "nurse",
    "part-time worker"
];

function makeSelect(keys, label, value) {
    const select = makeElement(
        "select", "custom-select"
    );

    select.setAttribute("aria-label", label);

    const placeholder = makeElement(
        "option",
        "",
        `-- Choose ${label} --`
    );

    placeholder.value = "";
    placeholder.disabled = true;

    select.appendChild(placeholder);

    keys.forEach(key => {
        const entry = customDict[key];

        const option = makeElement(
            "option",
            "",
            key.charAt(0).toUpperCase() + key.slice(1)
        );

        option.value = entry.hira;
        select.appendChild(option);
    });

    select.value = value || "";

    return select;
}

function renderTask2() {
    const list = section(
        "task2Container",
        "Drill 2: Selectable Practice",
        "💡Choose X and Y, then make a sentence.",
        "info-panel-task2",
        30
    );

    if (!list) return;

    for (let i = 1; i <= 3; i++) {
        const key = `task2_${i}`;

        const old =
            practice1State.customSelects[key] || {};

        const selectX = makeSelect(
            optionsX, "X", old.x
        );

        const selectY = makeSelect(
            optionsY, "Y", old.y
        );

        const getEntry = (keys, value) => {
            return keys
                .map(k => customDict[k])
                .find(entry => entry.hira === value);
        };

        const getWords = () => ({
            x: selectX.value,
            y: selectY.value,

            kanjiX:
                getEntry(optionsX, selectX.value)?.kanji
                || "",

            kanjiY:
                getEntry(optionsY, selectY.value)?.kanji
                || ""
        });

        const view = makeRow(
            list,
            key,
            taskData.length + i,
            i === 2,
            false,
            getWords
        );

        const previewX = makeElement(
            "span", "translation-preview"
        );

        const previewY = makeElement(
            "span", "translation-preview"
        );

        view.prompts.append(
            selectX,
            previewX,
            selectY,
            previewY
        );

        const update = () => {
            practice1State.customSelects[key] = {
                x: selectX.value,
                y: selectY.value
            };

            const previews = [
                [
                    previewX,
                    getEntry(optionsX, selectX.value)
                ],
                [
                    previewY,
                    getEntry(optionsY, selectY.value)
                ]
            ];

            previews.forEach(([preview, entry]) => {
                preview.innerHTML = entry
                    ? formatWord(
                        entry.hira,
                        entry.kanji,
                        entry.romaji,
                        entry.meaning
                    )
                    : "";
            });

            refreshRow(view);
        };

        selectX.addEventListener("change", update);
        selectY.addEventListener("change", update);

        update();
    }
}

// ============================================================================
// Drill 3: Free Practice
// ============================================================================

function renderTask3() {
    const list = section(
        "task3Container",
        "Drill 3: Free Practice",
        "💡Enter X and Y.\nMake a 🟢 affirmative or 🔴 negative sentence.",
        "info-panel-task3",
        30
    );

    if (!list) return;

    for (let i = 1; i <= 3; i++) {
        const key = `task3_${i}`;

        const old =
            practice1State.customSelects[key] || {};

        const inputX = makeElement(
            "input", "custom-input"
        );

        const inputY = makeElement(
            "input", "custom-input"
        );

        [inputX, inputY].forEach((input, index) => {
            input.type = "text";
            input.placeholder = index === 0 ? "X" : "Y";

            input.setAttribute(
                "aria-label",
                input.placeholder
            );

            input.style.width = "120px";
        });

        inputX.value = old.x || "";
        inputY.value = old.y || "";

        const view = makeRow(
            list,
            key,
            taskData.length + 3 + i,
            i === 2,
            true,
            () => ({
                x: inputX.value.trim(),
                y: inputY.value.trim()
            })
        );

        view.prompts.append(
            inputX,
            makeElement("span", "", "は"),
            inputY
        );

        const update = () => {
            practice1State.customSelects[key] = {
                x: inputX.value,
                y: inputY.value
            };

            refreshRow(view);
        };

        inputX.addEventListener("input", update);
        inputY.addEventListener("input", update);

        update();
    }
}

// ============================================================================
// 録音・音声認識
//
// Drill 1・2：両方の表示モードでテキスト抽出・判定
// Drill 3：Hiragana OnlyではAudio only
// 発話開始前の無音：15秒
// 録音全体：20秒（Autostop・Manual共通）
// ============================================================================

async function startRecording(initialView) {
    if (busy() || !initialView.ready()) return;

    const rowKey = initialView.rowKey;

    const currentView = () =>
        practice1State.views[rowKey] || initialView;

    const audioOnly =
        initialView.freeInput && scriptMode === "hiragana";

    const Recognition =
        window.SpeechRecognition
        || window.webkitSpeechRecognition;

    if (
        !navigator.mediaDevices?.getUserMedia
        || !("MediaRecorder" in window)
    ) {
        displayResult(
            currentView(),
            "Recording is not supported."
        );
        return;
    }

    if (!audioOnly && !Recognition) {
        displayResult(
            currentView(),
            "Speech recognition is not supported."
        );
        return;
    }

    // 録音開始時点の入力・文型・設定を固定する。
    const words = initialView.getWords();

    const expected = expectedSentence(
        words.x,
        words.y,
        initialView.negative
    );

    const model = modelSentence(
        words.kanjiX || words.x,
        words.kanjiY || words.y,
        initialView.negative
    );

    const manual = isManualStop;

    stopAllPlayback();

    practice1State.startingRow = rowKey;
    refreshRow(currentView());

    let stream;

    try {
        stream = await DrillAudio.getUserMedia({
            audio: true
        });
    } catch (error) {
            if (error.name === "AbortError") return;
        practice1State.startingRow = null;

        refreshRow(currentView());

        displayResult(
            currentView(),
            DrillAudio.microphoneError(error)
        );

        return;
    }

    practice1State.startingRow = null;

    const session = {
        rowKey,
        audioOnly,
        manual,
        stream,

        recorder: null,
        recognition: null,
        context: null,

        timers: [],
        chunks: [],
        transcript: "",

        speechStarted: false,
        lastSoundAt: 0,

        stopRequested: false,
        finished: false,
        discard: false,

        recognitionDone: audioOnly,
        recorderDone: false,

        message: "",
        stop: null
    };

    activeRecognitionSession = session;

    function clearMonitoring() {
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
        if (
            session.finished
            || !session.recorderDone
            || !session.recognitionDone
        ) {
            return;
        }

        session.finished = true;

        clearMonitoring();

        stream.getTracks().forEach(track => {
            track.stop();
        });

        if (session.recognition) {
            session.recognition.onend = null;
            session.recognition.onresult = null;
            session.recognition.onerror = null;
            session.recognition.onspeechstart = null;

            try {
                session.recognition.abort();
            } catch (error) {}
        }

        if (activeRecognitionSession === session) {
            activeRecognitionSession = null;
        }

        const valid =
            !session.discard
            && session.speechStarted
            && session.chunks.some(chunk => chunk.size > 0);

        // 有効な新録音だけで前の録音を置き換える。
        // 無音タイムアウト・失敗時は前の録音と抽出結果を残す。
        if (valid) {
            const blob = new Blob(session.chunks, {
                type:
                    session.recorder.mimeType
                    || "audio/webm"
            });

            const oldUrl =
                practice1State.audioUrls[rowKey];

            practice1State.audioUrls[rowKey] =
                URL.createObjectURL(blob);

            if (oldUrl) {
                URL.revokeObjectURL(oldUrl);
            }

            if (audioOnly) {
                practice1State.savedResults[rowKey] = {
                    audioOnly: true,
                    freeInput: true,
                    modelText: model
                };

            } else if (session.transcript.trim()) {
                practice1State.savedResults[rowKey] = {
                    audioOnly: false,
                    freeInput: initialView.freeInput,
                    rawTranscript: session.transcript.trim(),
                    expectedText: expected,
                    modelText: model,

                    isCorrect: initialView.freeInput
                        ? matchesFreeSentence(
                            session.transcript,
                            initialView.negative
                        )
                        : matchesSentence(
                            session.transcript,
                            expected
                        ) 
                };

            } else {
                practice1State.savedResults[rowKey] = {
                    audioOnly: false,
                    freeInput: initialView.freeInput,
                    unrecognized: true
                };
            }
        }

        session.chunks = [];

        const view = currentView();

        refreshRow(view);

        const noTranscript =
            valid
            && !audioOnly
            && !session.transcript.trim();

        const message = session.message || (
            !valid || noTranscript
                ? "No speech recognized."
                : ""
        );

        displayResult(view, message);

        if (valid && isAutoPlay) {
            DrillAudio.playRelay({
                recordButton: view.record,
                result: view.result,
                speak: done => speakText(model, 0.75, done),
                url: () => practice1State.audioUrls[rowKey]
            });
        }
    }

    function stop(message = "", discard = false) {
        if (session.finished || session.stopRequested) {
            return;
        }

        session.stopRequested = true;
        session.message = message;

        session.discard =
            discard || !session.speechStarted;

        clearMonitoring();
        refreshRow(currentView());

        if (
            session.recognition
            && !session.recognitionDone
        ) {
            try {
                session.recognition.stop();
            } catch (error) {
                session.recognitionDone = true;
            }
        }

        if (
            !session.recorder
            || session.recorder.state === "inactive"
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

        // APIの終了通知が届かない場合にもマイクを解放する。
        session.timers.push(
            setTimeout(() => {
                session.recognitionDone = true;

                if (!session.recorderDone) {
                    session.discard = true;
                    session.recorderDone = true;
                }

                finish();
            }, 2500)
        );

        finish();
    }

    session.stop = stop;

    try {
        const recorder = new MediaRecorder(stream);

        session.recorder = recorder;

        recorder.ondataavailable = event => {
            if (
                !session.finished
                && event.data.size
            ) {
                session.chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            session.recorderDone = true;

            if (!session.stopRequested) {
                stop("Recording stopped.");
            }

            finish();
        };

        recorder.onerror = () => {
            stop("Recording error.", true);
        };

        if (!audioOnly) {
            const recognition = new Recognition();

            session.recognition = recognition;

            recognition.lang = "ja-JP";
            recognition.interimResults = true;
            recognition.continuous = manual;

            recognition.onspeechstart = () => {
                session.speechStarted = true;
            };

            recognition.onresult = event => {
                if (
                    session.finished
                    || session.discard
                ) {
                    return;
                }

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    const result = event.results[i];

                    if (result[0].transcript.trim()) {
                        session.speechStarted = true;
                    }

                    if (result.isFinal) {
                        session.transcript +=
                            result[0].transcript;
                    }
                }
            };

            recognition.onerror = event => {
                if (
                    session.finished
                    || session.stopRequested
                    || event.error === "no-speech"
                ) {
                    return;
                }

                session.recognitionDone = true;
                stop("Recognition error.", true);
            };

            recognition.onend = () => {
                if (session.finished) return;

                session.recognitionDone = true;

                if (session.stopRequested) {
                    finish();
                    return;
                }

                if (manual || !session.speechStarted) {
                    try {
                        recognition.start();
                        session.recognitionDone = false;
                        return;

                    } catch (error) {
                        // Manualでは録音を続ける。
                        // 停止ボタンまたは20秒制限で終了する。
                        if (manual) return;

                        stop(
                            "Could not restart recognition.",
                            true
                        );

                        return;
                    }
                }

                stop();
            };
        }

        refreshRow(currentView());

        recorder.start();
        session.recognition?.start();

        try {
            const AudioContextClass =
                window.AudioContext
                || window.webkitAudioContext;

            const context = new AudioContextClass();

            session.context = context;

            const source =
                context.createMediaStreamSource(stream);

            const analyser = context.createAnalyser();

            analyser.fftSize = 2048;

            source.connect(analyser);
            context.resume().catch(() => {});

            const samples = new Float32Array(
                analyser.fftSize
            );

            let soundFrames = 0;

            session.timers.push(
                setInterval(() => {
                    if (
                        session.stopRequested
                        || session.finished
                    ) {
                        return;
                    }

                    analyser.getFloatTimeDomainData(samples);

                    let sum = 0;

                    for (const sample of samples) {
                        sum += sample * sample;
                    }

                    const volume = Math.sqrt(
                        sum / samples.length
                    );

                    soundFrames = volume > 0.025
                        ? soundFrames + 1
                        : 0;

                    if (soundFrames >= 3) {
                        session.speechStarted = true;
                        session.lastSoundAt = Date.now();
                    }

                    // Audio onlyの発話後無音は従来どおり1.5秒。
                    if (
                        audioOnly
                        && !manual
                        && session.lastSoundAt
                        && Date.now() - session.lastSoundAt >= 1500
                    ) {
                        stop();
                    }
                }, 100)
            );

        } catch (error) {
            if (audioOnly) {
                stop(
                    "Audio monitoring is not supported.",
                    true
                );

                return;
            }
        }

        session.timers.push(
            setTimeout(() => {
                if (!session.speechStarted) {
                    stop(
                        "No speech detected within 15 seconds.",
                        true
                    );
                }
            }, 15000)
        );

        session.timers.push(
            setTimeout(() => {
                stop(
                    "Auto-stopped after 20 seconds."                );
            }, 20000)
        );

    } catch (error) {
        session.recognitionDone = true;
        stop("Could not start recording.", true);
    }
}

// ============================================================================
// 初期化・終了処理
// ============================================================================

function setupFooterGuide() {
    setupPreferredVoice();
}

if ("speechSynthesis" in window) {
    setupPreferredVoice();

    window.speechSynthesis.addEventListener(
        "voiceschanged",
        setupPreferredVoice
    );
}

document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    renderAll();
    setupFooterGuide();
});

window.addEventListener("pagehide", () => {
    stopAllPlayback();

    const session = activeRecognitionSession;

    if (session) {
        session.stop("", true);

        session.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    Object.values(practice1State.audioUrls)
        .forEach(url => {
            URL.revokeObjectURL(url);
        });

    practice1State.audioUrls = {};
});
// 共通仕様：文体・判定・列配置
(() => {
    let speechStyle = 'formal';

    const politeNegative = [
        'じゃないです',
        'ではないです',
        'じゃありません',
        'ではありません'
    ];

    const allNegative = [
        ...politeNegative,
        'じゃない',
        'ではない'
    ];

    const negativeEndings = style =>
        style === 'formal' ? politeNegative : allNegative;

    const endingOf = text =>
        allNegative.find(end => text.endsWith(end));

    modelSentence = function (x, y, negative) {
        const topic = speechStyle === 'casual' ? '、' : 'は、';

        const end = negative
            ? speechStyle === 'formal'
                ? 'じゃないです'
                : speechStyle === 'informal'
                    ? 'じゃない'
                    : 'じゃないよ'
            : speechStyle === 'formal'
                ? 'です'
                : speechStyle === 'informal'
                    ? 'だ'
                    : 'だよ';

        return `${x}${topic}${y}${end}。`;
    };

    expectedSentence = (x, y, negative) =>
        modelSentence(x, y, negative);

    matchesSentence = function (transcript, expectedText) {
        if (!DrillAnswer.formAllowed(transcript, speechStyle)) return false;
        const actual = practice1Normalize(transcript);
        const expected = practice1Normalize(expectedText);

        if (!actual || !expected) return false;

        const ending = endingOf(expected);

        const allowed = ending
            ? negativeEndings(speechStyle).map(end =>
                expected.slice(0, -ending.length) + end
            )
            : [expected];

        if (allowed.includes(actual)) return true;
        if (speechStyle !== 'casual') return false;

        // Casualでは主題の「は」の有無も許容する。
        for (let i = 1; i < actual.length; i++) {
            if (
                actual[i] === 'は' &&
                allowed.includes(
                    actual.slice(0, i) + actual.slice(i + 1)
                )
            ) {
                return true;
            }
        }

        return false;
    };

    function splitSubject(body) {
        const candidates = [...new Set([
            ...taskData.flatMap(item => [
                item.x, item.xKanji
            ]),
            ...Object.values(customDict).flatMap(item => [
                item.hira, item.kanji
            ])
        ].filter(Boolean).map(practice1Normalize))]
            .sort((a, b) => b.length - a.length);

        const known = candidates.find(x =>
            body.startsWith(x) && body.length > x.length
        );

        if (known) return known;

        if (
            typeof Intl !== 'undefined' &&
            Intl.Segmenter
        ) {
            const parts = [
                ...new Intl.Segmenter('ja', {
                    granularity: 'word'
                }).segment(body)
            ].filter(part => part.isWordLike);

            if (parts.length >= 2) {
                return parts[0].segment;
            }
        }

        return '';
    }

    const originalFreeMatch = matchesFreeSentence;

    matchesFreeSentence = function (transcript, negative) {
        if (!DrillAnswer.formAllowed(transcript, speechStyle)) return false;
        if (speechStyle === 'formal') {
            return originalFreeMatch(transcript, negative);
        }

        const text = practice1Normalize(transcript);
        const neg = endingOf(text);

        if (
            negative
                ? !neg
                : Boolean(neg) || !text.endsWith('だ')
        ) {
            return false;
        }

        const body = text.slice(
            0, -(negative ? neg.length : 1)
        );

        if (
            !negative &&
            /(?:じゃない|ではない)$/.test(body)
        ) {
            return false;
        }

        if (/^.+は.+$/.test(body)) return true;

        return speechStyle === 'casual' &&
            Boolean(splitSubject(body));
    };

    const originalDiff = practice1ResultDiff;

    practice1ResultDiff = function (displayed, saved, view) {
        const expected = practice1Normalize(
            saved.expectedText || saved.modelText
        );

        const expectedNeg = endingOf(expected);

        if (!saved.freeInput) {
            if (!expectedNeg) {
                return originalDiff(displayed, saved, view);
            }

            const core = expected.slice(
                0, -expectedNeg.length
            );

            return allNegative.flatMap(end => {
                const text = core + end;

                return [
                    text,
                    normalizeHiraganaTranscript(text)
                ];
            }).map(ref =>
                practice1FindDiff(displayed, ref)
            ).sort((a, b) => a.cost - b.cost)[0];
        }

        if (/(?:です|ません)$/.test(expected)) {
            return originalDiff(displayed, saved, view);
        }

        const actual = practice1Normalize(displayed);

        const suffix = actual.match(
            /(?:じゃないです|ではないです|じゃありません|ではありません|ではない|じゃない|でした|だった|です|だ)$/
        );

        let body = suffix
            ? actual.slice(0, -suffix[0].length)
            : actual;

        if (
            expected.includes('は') &&
            !body.includes('は')
        ) {
            const subject = splitSubject(body);
            const position = subject
                ? subject.length
                : body.length;

            body =
                body.slice(0, position) +
                'は' +
                body.slice(position);
        }

        if (body.startsWith('は')) body = '¤' + body;
        if (body.endsWith('は')) body += '¤';

        const endings = view.negative
            ? allNegative
            : ['だ'];

        return endings.map(end =>
            practice1FindDiff(displayed, body + end)
        ).sort((a, b) => a.cost - b.cost)[0];
    };

    const originalMakeRow = makeRow;

    makeRow = function (...args) {
        const view = originalMakeRow(...args);
        const old = view.row.querySelector('.top-row');

        const number = old.children[1];
        const type = old.children[3];

        const table = makeElement(
            'table', 'recording-table'
        );

        const columns = document.createElement('colgroup');

        for (let i = 0; i < 3; i++) {
            columns.append(document.createElement('col'));
        }

        columns.children[0].style.width = '34px';
        table.append(columns);

        const body = document.createElement('tbody');
        const tr = document.createElement('tr');

        const numberCell = makeElement(
            'td', 'drill-number-cell'
        );
        numberCell.append(number);

        const cue = makeElement(
            'td', 'drill-cue-cell prompt-label'
        );

        // 🔴🟢はキューの直後に置く。
        cue.append(
            view.prompts,
            document.createTextNode(' '),
            type
        );

        const controls = document.createElement('td');

        const layout = makeElement(
            'div', 'recording-controls'
        );

        const actions = makeElement(
            'div', 'recording-actions'
        );

        actions.append(
            view.listen,
            view.record,
            view.stop
        );

        const result = makeElement(
            'span', 'recording-result'
        );
        result.append(view.result);

        layout.append(actions, result);
        controls.append(layout);

        tr.append(numberCell, cue, controls);
        body.append(tr);
        table.append(body);

        view.row.replaceChildren(
            table,
            view.correction
        );

        view.record.textContent = '🎙️とる';
        view.correctionListen.style.display = 'none';

        return view;
    };

    const originalDisplay = displayResult;

    displayResult = function (view, message = '') {
        originalDisplay(view, message);

        view.correctionListen.style.display = 'none';

        const play = view.result.querySelector(
            '.recorded-play-button'
        );

        if (play) {
            play.classList.add(
                'play-recording-btn',
                'custom-tip-wrap'
            );

            const tip = makeElement(
                'span',
                'custom-tip-box',
                'Play your recorded voice'
            );

            play.append(tip);
        }
    };

    const originalSync = syncRecordingButtons;

    syncRecordingButtons = function () {
        originalSync();

        document.querySelectorAll(
            '.compact-settings .segmented-option'
        ).forEach(button => {
            button.disabled = busy();
        });
    };

    function installSpeechStyle() {
        const anchor = document.getElementById(
            'scriptModeControl'
        )?.closest('.control-item');

        if (!anchor) return;

        let item = document.getElementById(
            'speechStyleControl'
        )?.closest('.control-item');

        if (!item) {
            item = makeElement('div', 'control-item');

            const control = makeElement(
                'div', 'segmented-control'
            );

            control.id = 'speechStyleControl';
            control.setAttribute('role', 'group');
            control.setAttribute(
                'aria-label', 'Speech style'
            );

            [
                [
                    'formal',
                    '👔Formal',
                    'Polite speech for work or unfamiliar people.'
                ],
                [
                    'informal',
                    '✏️Informal',
                    'Plain forms used in writing'
                ],
                [
                    'casual',
                    '💬Casual',
                    'Relaxed speech with family and friends.'
                ]
            ].forEach(([value, label, description]) => {
                const button = makeElement(
                    'button',
                    'segmented-option custom-tip-wrap',
                    label
                );

                button.dataset.value = value;

                button.append(
                    makeElement(
                        'span',
                        'custom-tip-box',
                        description
                    )
                );

                button.onclick = () => {
                    if (
                        busy() ||
                        speechStyle === value
                    ) return;

                    speechStyle = value;
                    renderAll();
                };

                control.append(button);
            });

            item.append(control);
        }

        anchor.after(item);

        item.querySelectorAll('button[data-value]')
            .forEach(button => {
                const selected =
                    button.dataset.value === speechStyle;

                button.classList.toggle(
                    'is-selected', selected
                );

                button.setAttribute(
                    'aria-pressed',
                    String(selected)
                );
            });
    }

    function updateExample() {
        const subject = scriptMode === 'kanji'
            ? '私'
            : 'わたし';

        const nouns = scriptMode === 'kanji'
            ? ['学生', '先生']
            : ['がくせい', 'せんせい'];

        const example = document.querySelector(
            '#exampleSectionContainer .example-box'
        );

        if (!example) return;

        const table = makeElement(
            'table', 'drill-example-table'
        );

        const body = document.createElement('tbody');
        table.append(body);

        ['ex1Listen', 'ex2Listen'].forEach((id, index) => {
            const listen = document.getElementById(id);
            const line = listen?.parentElement;

            if (!line) return;

            const label = line.firstElementChild;
            const arrow = listen.previousElementSibling;
            const sentence = line.lastElementChild;

            const text = modelSentence(
                subject,
                nouns[index],
                Boolean(index)
            );

            const end = text.slice(
                text.indexOf(nouns[index]) +
                nouns[index].length
            );

            sentence.innerHTML =
                escapeHtml(subject) +
                '<strong class="grammar-highlight">' +
                (speechStyle === 'casual' ? '、' : 'は、') +
                '</strong>' +
                escapeHtml(nouns[index]) +
                '<strong class="grammar-highlight">' +
                escapeHtml(end) +
                '</strong>';

            const cueNodes = [];

            for (
                let node = label.nextSibling;
                node && node !== arrow;
                node = node.nextSibling
            ) {
                cueNodes.push(node);
            }

            const tr = document.createElement('tr');

            const cells = Array.from(
                { length: 5 },
                () => document.createElement('td')
            );

            cells[0].append(label);
            cells[1].append(...cueNodes);
            cells[2].append(arrow);
            cells[3].append(listen);
            cells[4].append(sentence);

            tr.append(...cells);
            body.append(tr);
        });

        example.replaceChildren(table);

        if (speechStyle === 'casual') {
            document.querySelectorAll(
                '#task3Container .prompt-content > span'
            ).forEach(span => {
                if (span.textContent === 'は') {
                    span.textContent = '／';
                }
            });
        }
    }

    function alignCueColumns() {
        [
            'task1Container',
            'task2Container',
            'task3Container'
        ].forEach(id => {
            const tables = Array.from(
                document.querySelectorAll(
                    `#${id} table.recording-table`
                )
            );

            let width = 0;

            tables.forEach(table => {
                const cell = table.querySelector(
                    '.drill-cue-cell'
                );

                const measure = makeElement('span');

                measure.append(
                    ...Array.from(
                        cell.childNodes,
                        node => node.cloneNode(true)
                    )
                );

                measure.querySelectorAll(
                    '.tooltip-tip,.custom-tip-box'
                ).forEach(tip => tip.remove());

                Object.assign(measure.style, {
                    position: 'absolute',
                    visibility: 'hidden',
                    display: 'inline-block',
                    width: 'max-content',
                    whiteSpace: 'nowrap',
                    font: 'inherit'
                });

                cell.append(measure);

                width = Math.max(
                    width,
                    Math.ceil(
                        measure.getBoundingClientRect().width
                    )
                );

                measure.remove();
            });

            tables.forEach(table => {
                table.style.setProperty('--drill-cue-width', `${width + 8}px`);
                table.querySelector('colgroup')
                    .children[1].style.width =
                        `${width + 8}px`;
            });
        });
    }

    document.addEventListener('change', event => {
        if (
            !busy() &&
            event.target.closest?.('#task2Container')
        ) {
            alignCueColumns();
        }
    });

    document.addEventListener('click', event => {
        if (
            busy() &&
            event.target.closest?.(
                '.compact-settings .segmented-option'
            )
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    const originalRender = renderAll;

    renderAll = function () {
        originalRender();
        installSpeechStyle();
        updateExample();
        alignCueColumns();
        syncRecordingButtons();
    };
})();


// Keep lifecycle and Voice locks aligned with this page's existing recorder.
DrillAudio.configure({
    busy: () => busy(),
    sync: () => syncRecordingButtons(),
    stop: () => stopAllPlayback(),
    cancel: () => {
        practice1State.startingRow = null;
        const capture = activeRecognitionSession;
        if (capture) {
            capture.discard = true;
            capture.stop?.("", true);
        }
    }
});
