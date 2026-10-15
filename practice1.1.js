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

function setupPreferredVoice() {
    if (!("speechSynthesis" in window)) return;

    const voices = window.speechSynthesis.getVoices();
    const japanese = voices.filter(v => /^ja/i.test(v.lang));

    preferredVoice =
        japanese.find(v => /chrome os/i.test(v.name))
        || japanese.find(v => /keita/i.test(v.name))
        || japanese.find(v => /nanami/i.test(v.name))
        || japanese.find(v => /google/i.test(v.name))
        || japanese[0]
        || null;
}

function stopAllPlayback() {
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

function speakText(text, rate = 0.9, done = () => {}) {
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
        window.speechSynthesis.speak(utterance);
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
    audio.play().catch(finish);
}

function playModel(text, button) {
    if (busy()) return;

    stopAllPlayback();
    markPlaying(button);
    speakText(text, 0.9, stopAllPlayback);
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
        return `<span class="target-word">${text}</span> (${hint})`;
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
                ${x} ／ ${student}
                <span>👉</span>
                <button
                    type="button"
                    id="ex1Listen"
                    class="example-button"
                >🔊きく</button>
                <span>${subject}<strong>は、</strong>${noun1}<strong>です。</strong></span>
            </div>

            <div
                class="flex-row-center dashed-border"
                style="margin-top:12px;padding-top:12px;"
            >
                <span class="example-label-title">
                    🔴Negative:
                </span>
                ${x} ／ ${teacher}
                <span>👉</span>
                <button
                    type="button"
                    id="ex2Listen"
                    class="example-button"
                >🔊きく</button>
                <span>${subject}<strong>は、</strong>${noun2}<strong>じゃないです。</strong></span>
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

function refreshRow(view) {
    const session = activeRecognitionSession;

    const running = session?.rowKey === view.rowKey;

    const starting =
        practice1State.startingRow === view.rowKey;

    const locked = running || starting;

    view.listen.disabled = !view.ready() || locked;
    view.record.disabled = !view.ready() || locked;

    view.stop.disabled =
        !running || !session.manual || session.stopRequested;

    view.stop.classList.toggle(
        "stop-btn-active",
        Boolean(
            running
            && session.manual
            && !session.stopRequested
        )
    );

    view.row.querySelectorAll("input, select")
        .forEach(input => {
            input.disabled = locked;
        });

    if (running || starting) {
        view.result.textContent = starting
            ? "Preparing microphone..."
            : session.audioOnly
                ? `Recording...(${AUDIO_ONLY_MESSAGE})`
                : "Recording...";

        view.result.style.color = "var(--accent-color)";
        view.correction.style.display = "none";

        return;
    }

    displayResult(view);
}

function displayResult(view, message = "") {
    const saved =
        practice1State.savedResults[view.rowKey];

    view.correction.style.display = "none";
    view.result.style.color = "var(--text-secondary)";

    if (saved?.audioOnly) {
        view.result.textContent = AUDIO_ONLY_MESSAGE;

    } else if (saved?.rawTranscript !== undefined) {
        // 自由入力の読みは推測しない。
        // 抽出済みテキスト自体は表示設定を変えても保持する。
        const display =
            scriptMode === "hiragana" && !saved.freeInput
                ? normalizeHiraganaTranscript(
                    saved.rawTranscript
                )
                : saved.rawTranscript;

        view.result.textContent =
            display + (saved.isCorrect ? " ✅" : "");

        view.result.style.color = saved.isCorrect
            ? "var(--text-primary)"
            : "var(--error-text)";

        if (!saved.isCorrect) {
            view.correction.style.display = "block";

            const model =
                scriptMode === "hiragana" && !saved.freeInput
                    ? normalizeHiraganaTranscript(
                        saved.modelText
                    )
                    : saved.modelText;

            view.correctionText.textContent =
                `Expected: ${model}`;

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
        view.result.prepend(
            document.createTextNode(message + " ")
        );
    }

    appendPersistedPlayButton(
        view.result,
        view.rowKey
    );
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
            <span class="info-panel-desc">${instruction}</span>
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
        "💡 Practice forming 🟢 affirmative and 🔴 negative statements.",
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
            formattedX + " ／ " + formattedY;

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
        "💡 Choose words and form sentences.",
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
        "💡 Enter X and Y, then make an affirmative sentence for 🟢 or a negative sentence for 🔴.",
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
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
    } catch (error) {
        practice1State.startingRow = null;

        refreshRow(currentView());

        displayResult(
            currentView(),
            "Microphone access denied."
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

                    isCorrect: matchesSentence(
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
            stopAllPlayback();

            const url =
                practice1State.audioUrls[rowKey];

            if (audioOnly) {
                playAudio(url);
            } else {
                speakText(
                    model,
                    0.9,
                    () => playAudio(url)
                );
            }
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
                    "Recording stopped after 20 seconds."
                );
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
    const trigger =
        document.getElementById("guideTrigger");

    const box =
        document.getElementById("guideBox");

    if (!trigger || !box) return;

    trigger.addEventListener("click", event => {
        event.stopPropagation();

        box.style.display =
            box.style.display === "none"
                ? "block"
                : "none";
    });

    document.addEventListener("click", () => {
        box.style.display = "none";
    });
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
