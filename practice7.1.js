// ============================================================================
// Practice 7.1: ているform① Habit continuous
// ============================================================================

const practice71Data = [];
let renderAll, speakText, practice71ToHiragana, practice71Normalize;

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "kanji"; // デフォルトはWith漢字
let isAutoPlay = true;
let activeRecognitionSession = null;

const practice71State = {
    audioUrls: {},
    savedResults: {}
};

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
            selected = voices.find(v => v.name && v.name.toLowerCase().includes("keita"));
        }
        if (!selected) {
            selected = voices.find(v => v.name && v.name.toLowerCase().includes("nanami"));
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

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
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

function formatWord(word, kanji, romaji, meaning) {
    const displayWord =
        (scriptMode === "kanji" && kanji) ? kanji : word;

    const hintStr = `${romaji}, ${meaning}`;

    if (hintMode === "off") {
        return `<span class="target-word">${displayWord}</span>`;
    }

    if (hintMode === "paren") {
        return `<span class="target-word">${displayWord}</span><span class="vocab-inline">(${hintStr})</span>`;
    }

    return `
        <span class="tooltip-wrap">
            <span class="target-word">${displayWord}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}

function initSettingsPanel() {
    const scriptControl = document.getElementById("scriptModeControl");
    const hintControl = document.getElementById("hintModeControl");

    function updateSegmentedSelection(control, selectedValue) {
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === selectedValue;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    if (scriptControl) {
        updateSegmentedSelection(scriptControl, scriptMode);

        scriptControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");
            if (!button || !scriptControl.contains(button)) return;

            const value = button.dataset.value;
            if (value !== "hiragana" && value !== "kanji") return;
            if (value === scriptMode) return;

            scriptMode = value;
            updateSegmentedSelection(scriptControl, scriptMode);
            renderAll();
        });
    }

    if (hintControl) {
        updateSegmentedSelection(hintControl, hintMode);

        hintControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");
            if (!button || !hintControl.contains(button)) return;

            const value = button.dataset.value;
            if (!["off", "hover", "paren"].includes(value)) return;
            if (value === hintMode) return;

            hintMode = value;
            updateSegmentedSelection(hintControl, hintMode);
            renderAll();
        });
    }

    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = !isManualStop;
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);

        toggleRecordMode.addEventListener("change", event => {
            isManualStop = !event.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        });
    }

    const togglePlaybackMode = document.getElementById("togglePlaybackMode");
    const labelAutoPlay = document.getElementById("labelAutoPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.checked = isAutoPlay;
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);

        togglePlaybackMode.addEventListener("change", event => {
            isAutoPlay = event.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
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

function createPractice71TableCard(container, indexLabel, item, rowIndex, playRate) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "drill-row";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // ----------------------------------------------------
    // 1行目: Past
    // ----------------------------------------------------
    const tr1 = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.rowSpan = 2;
    tdIndex.textContent = indexLabel;
    tdIndex.style.fontWeight = "bold";
    tdIndex.style.verticalAlign = "middle";
    tdIndex.style.width = "30px";
    tdIndex.style.paddingRight = "4px";

    const tdPrompt = document.createElement("td");
    tdPrompt.rowSpan = 2;
    tdPrompt.className = "prompt-label";
    const cueParts = item.xKanji === "漢字50個"
        ? [
            formatWord(
                "かんじ", "漢字",
                "kanji", "kanji characters"
            ),
            formatWord(
                "50こ", "50個",
                "gojūkko", "50 items"
            ),
            formatWord(
                item.y, item.yKanji,
                item.yRomaji, item.yMeaning
            )
        ]
        : [
            formatWord(
                item.x, item.xKanji,
                item.xRomaji, item.xMeaning
            ),
            formatWord(
                item.y, item.yKanji,
                item.yRomaji, item.yMeaning
            )
        ];

    tdPrompt.innerHTML = cueParts.join(" ／ ");    tdPrompt.style.verticalAlign = "middle";
    tdPrompt.style.width = "220px";
    tdPrompt.style.paddingRight = "10px";

    const tdPastControls = document.createElement("td");
    tdPastControls.style.paddingBottom = "4px";
    tdPastControls.style.whiteSpace = "nowrap";

    const listenBtn1 = document.createElement("button");
    listenBtn1.className = "example-button custom-tip-wrap";
    listenBtn1.innerHTML = '🔊きく<span class="custom-tip-box">Listen to past tense.</span>';

    const pastLabel = document.createElement("span");
    pastLabel.style.fontWeight = "bold";
    pastLabel.style.display = "inline-block";
    pastLabel.style.padding = "4px 8px";
    pastLabel.style.margin = "0 6px";
    pastLabel.style.borderRadius = "4px";
    pastLabel.style.backgroundColor = "#bae6fd";
    pastLabel.style.color = "#0369a1";
    pastLabel.style.fontSize = "13px";
    pastLabel.innerHTML = "⏪ Past";

    const recordBtn1 = document.createElement("button");
    recordBtn1.className = "example-button custom-tip-wrap";
    recordBtn1.innerHTML = '⏺️とる<span class="custom-tip-box">Record past tense.</span>';

    const stopBtn1 = document.createElement("button");
    stopBtn1.className = "example-button custom-tip-wrap";
    stopBtn1.innerHTML = '⏹️<span class="custom-tip-box">Stop active recording.</span>';
    stopBtn1.disabled = true;

    const rightWrapper1 = document.createElement("span");
    rightWrapper1.style.float = "right";
    rightWrapper1.style.display = "inline-flex";
    rightWrapper1.style.alignItems = "center";

    const resultSpan1 = document.createElement("span");
    resultSpan1.className = "result-text";
    resultSpan1.textContent = "(Not recorded yet)";
    resultSpan1.style.color = "var(--text-secondary)";
    resultSpan1.style.marginLeft = "8px";

    rightWrapper1.appendChild(resultSpan1);

    listenBtn1.onclick = () => {
        setPlayingStateMultiple([listenBtn1], "Playing...");
        speakText(item.pastSentence, playRate, () => stopAllPlayback());
    };

    tdPastControls.appendChild(listenBtn1);
    tdPastControls.appendChild(pastLabel);
    tdPastControls.appendChild(recordBtn1);
    tdPastControls.appendChild(stopBtn1);
    tdPastControls.appendChild(rightWrapper1);

    tr1.appendChild(tdIndex);
    tr1.appendChild(tdPrompt);
    tr1.appendChild(tdPastControls);
    table.appendChild(tr1);

    const correctionBox1 = document.createElement("div");
    correctionBox1.className = "correction-box";
    const corrListenBtn1 = document.createElement("button");
    corrListenBtn1.className = "example-button";
    corrListenBtn1.innerHTML = "🔊 きく";
    corrListenBtn1.style.marginRight = "8px";
    const corrTextSpan1 = document.createElement("span");
    correctionBox1.appendChild(corrListenBtn1);
    correctionBox1.appendChild(corrTextSpan1);

    bindRecorderEvents(
        recordBtn1, stopBtn1, resultSpan1, correctionBox1, corrListenBtn1, corrTextSpan1,
        () => item.pastSentenceHira,
        () => item.pastSentence,
        playRate,
        `p7_drill_past_${rowIndex}`
    );

    // ----------------------------------------------------
    // 2行目: Perfect
    // ----------------------------------------------------
    const tr2 = document.createElement("tr");
    tr2.style.borderTop = "1px dashed var(--border-color)";

    const tdPerfControls = document.createElement("td");
    tdPerfControls.style.paddingTop = "4px";
    tdPerfControls.style.whiteSpace = "nowrap";

    const listenBtn2 = document.createElement("button");
    listenBtn2.className = "example-button custom-tip-wrap";
    listenBtn2.innerHTML = '🔊きく<span class="custom-tip-box">Listen to Habit perfect.</span>';

    const perfLabel = document.createElement("span");
    perfLabel.style.fontWeight = "bold";
    perfLabel.style.display = "inline-block";
    perfLabel.style.padding = "4px 8px";
    perfLabel.style.margin = "0 6px";
    perfLabel.style.borderRadius = "4px";
    perfLabel.style.backgroundColor = "#dcfce7";
    perfLabel.style.color = "#15803d";
    perfLabel.style.fontSize = "13px";
    perfLabel.innerHTML = "⏳ Perfect";

    const recordBtn2 = document.createElement("button");
    recordBtn2.className = "example-button custom-tip-wrap";
    recordBtn2.innerHTML = '⏺️とる<span class="custom-tip-box">Record Habit perfect.</span>';

    const stopBtn2 = document.createElement("button");
    stopBtn2.className = "example-button custom-tip-wrap";
    stopBtn2.innerHTML = '⏹️<span class="custom-tip-box">Stop active recording.</span>';
    stopBtn2.disabled = true;

    const rightWrapper2 = document.createElement("span");
    rightWrapper2.style.float = "right";
    rightWrapper2.style.display = "inline-flex";
    rightWrapper2.style.alignItems = "center";

    const resultSpan2 = document.createElement("span");
    resultSpan2.className = "result-text";
    resultSpan2.textContent = "(Not recorded yet)";
    resultSpan2.style.color = "var(--text-secondary)";
    resultSpan2.style.marginLeft = "8px";

    rightWrapper2.appendChild(resultSpan2);

    listenBtn2.onclick = () => {
        setPlayingStateMultiple([listenBtn2], "Playing...");
        speakText(item.perfectSentence, playRate, () => stopAllPlayback());
    };

    tdPerfControls.appendChild(listenBtn2);
    tdPerfControls.appendChild(perfLabel);
    tdPerfControls.appendChild(recordBtn2);
    tdPerfControls.appendChild(stopBtn2);
    tdPerfControls.appendChild(rightWrapper2);

    tr2.appendChild(tdPerfControls);
    table.appendChild(tr2);

    const correctionBox2 = document.createElement("div");
    correctionBox2.className = "correction-box";
    const corrListenBtn2 = document.createElement("button");
    corrListenBtn2.className = "example-button";
    corrListenBtn2.innerHTML = "🔊 きく";
    corrListenBtn2.style.marginRight = "8px";
    const corrTextSpan2 = document.createElement("span");
    correctionBox2.appendChild(corrListenBtn2);
    correctionBox2.appendChild(corrTextSpan2);

    bindRecorderEvents(
        recordBtn2, stopBtn2, resultSpan2, correctionBox2, corrListenBtn2, corrTextSpan2,
        () => item.perfectSentenceHira,
        () => item.perfectSentence,
        playRate,
        `p7_drill_perf_${rowIndex}`
    );
    cardDiv.appendChild(table);
    cardDiv.appendChild(correctionBox1);
    cardDiv.appendChild(correctionBox2);
    container.appendChild(cardDiv);
}

// ============================================================================
// Practice 7.1: Recognition, Recording & Result Display
// ============================================================================

// 実際の認識結果を、このページで扱う語句の範囲で変換する。
// モデル文そのものへの置き換えは行わない。
function practice71BaseToHiragana(text) {
    let value = String(text ?? "").normalize("NFKC");

    const dictionary = [
        ["お正月", "おしょうがつ"],
        ["夏休み", "なつやすみ"],
        ["結婚", "けっこん"],
        ["漢字", "かんじ"],
        ["年前", "ねんまえ"],
        ["覚", "おぼ"],
        ["知", "し"],
        ["起", "お"],
        ["寝", "ね"],
        ["着", "き"],
        ["太", "ふと"],
        ["痩", "や"],
        ["朝", "あさ"],
        ["夜", "よる"],
        ["時", "じ"],
        ["個", "こ"]
    ];

    for (const [from, to] of dictionary) {
        value = value.split(from).join(to);
    }

    return value
        .replace(/[ァ-ヶ]/g, character =>
            String.fromCharCode(character.charCodeAt(0) - 96)
        )
        .replace(/五十(?=こ)/g, "50")
        .replace(/十(?=じ)/g, "10")
        .replace(/五(?=じ)/g, "5")
        .replace(/三(?=ねんまえ)/g, "3")
        .replace(
            /(?:t\s*しゃつ|てぃー\s*しゃつ|てぃ\s*しゃつ)/gi,
            "Tしゃつ"
        )
        .replace(/ふぉーむ|form/gi, "Form");
}

function practice71DiffTokens(text) {
    const value = String(text ?? "").normalize("NFKC");
    const chars = Array.from(value);
    const tokens = [];

    const units = [
        "お正月", "夏休み", "結婚", "漢字", "年前",
        "おしょうがつ", "なつやすみ", "3ねんまえ",
        "3年前",
        "フォーム", "ふぉーむ", "Form", "form", "FORM",
        "Tシャツ", "Tしゃつ", "tしゃつ",
        "ティーシャツ", "てぃーしゃつ",
        "ティシャツ", "てぃしゃつ",
        "五十個", "五十こ", "三年前", "十時", "五時",
        "覚", "知", "起", "寝", "着", "太", "痩",
        "朝", "夜", "時", "個"
    ].sort((a, b) => b.length - a.length);

    const timeWord =
        /^(おしょうがつ|なつやすみ|3ねんまえ)$/;

    const suffix = value.match(
        /(?:よね|よ|ね)[。！？!?\s]*$/
    );

    const limit = suffix
        ? Array.from(value.slice(0, suffix.index)).length
        : chars.length;

    for (let index = 0; index < limit;) {
        const rest = chars.slice(index, limit).join("");

        const spacedShirt = rest.match(
            /^(?:t\s*しゃつ|t\s*シャツ|てぃー\s*しゃつ|ティー\s*シャツ)/i
        );

        const unit =
            spacedShirt?.[0] ||
            units.find(word => rest.startsWith(word)) ||
            chars[index];

        const length = Array.from(unit).length;

        const reading = practice71ToHiragana(unit)
            .toLowerCase()
            .replace(/[\s、。,.!?！？「」『』・]/g, "");

        // 時間表現の置き換えを欠落と誤認しない。
        const comparisonUnits = timeWord.test(reading)
            ? [reading]
            : Array.from(reading);

        for (const character of comparisonUnits) {
            tokens.push({
                character,
                start: index,
                end: index + length
            });
        }

        index += length;
    }

    // この３つの時間表現だけ「に」の省略を許容。
    if (
        timeWord.test(tokens[0]?.character || "") &&
        tokens[1]?.character === "に"
    ) {
        tokens.splice(1, 1);
    }

    return { chars, tokens };
}

function practice71FindDiff(actual, reference) {
    const a = practice71DiffTokens(actual);
    const b = practice71DiffTokens(reference);

    const rows = a.tokens.length;
    const columns = b.tokens.length;

    const costs = Array.from(
        { length: rows + 1 },
        () => Array(columns + 1).fill(0)
    );

    for (let i = 0; i <= rows; i++) {
        costs[i][0] = i;
    }

    for (let j = 0; j <= columns; j++) {
        costs[0][j] = j;
    }

    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= columns; j++) {
            const same =
                a.tokens[i - 1].character ===
                b.tokens[j - 1].character;

            costs[i][j] = Math.min(
                costs[i - 1][j - 1] + (same ? 0 : 1),
                costs[i - 1][j] + 1,
                costs[i][j - 1] + 1
            );
        }
    }

    const redIndexes = new Set();
    const gaps = new Set();

    const markToken = token => {
        for (
            let index = token.start;
            index < token.end;
            index++
        ) {
            redIndexes.add(index);
        }
    };

    let i = rows;
    let j = columns;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0) {
            const same =
                a.tokens[i - 1].character ===
                b.tokens[j - 1].character;

            if (
                costs[i][j] ===
                costs[i - 1][j - 1] + (same ? 0 : 1)
            ) {
                if (!same) {
                    markToken(a.tokens[i - 1]);
                }

                i--;
                j--;
                continue;
            }
        }

        if (
            j > 0 &&
            costs[i][j] === costs[i][j - 1] + 1
        ) {
            const position = i < rows
                ? a.tokens[i].start
                : rows > 0
                    ? a.tokens[rows - 1].end
                    : 0;

            gaps.add(position);
            j--;
            continue;
        }

        if (i > 0) {
            markToken(a.tokens[i - 1]);
            i--;
        }
    }

    // 不一致文字を含む語全体へ赤字範囲を広げる。
    if (
        typeof Intl !== "undefined" &&
        typeof Intl.Segmenter === "function"
    ) {
        const originalRed = new Set(redIndexes);
        const segmenter = new Intl.Segmenter("ja", {
            granularity: "word"
        });

        const value = a.chars.join("");

        for (const part of segmenter.segment(value)) {
            if (!part.isWordLike) continue;

            const start = Array.from(
                value.slice(0, part.index)
            ).length;

            const end =
                start + Array.from(part.segment).length;

            let mismatched = false;

            for (let index = start; index < end; index++) {
                if (originalRed.has(index)) {
                    mismatched = true;
                    break;
                }
            }

            if (mismatched) {
                for (
                    let index = start;
                    index < end;
                    index++
                ) {
                    redIndexes.add(index);
                }
            }
        }
    }

    return {
        cost: costs[rows][columns],
        chars: a.chars,
        redIndexes,
        gaps
    };
}

function practice71ShowResult(view, saved, rowKey, playRate) {
    // モード変更による再描画では、録音時の判定を保持する。
    // 新しい録音の判定はprocessResult側で保存される。
    if (typeof saved.isCorrect !== 'boolean') {
        const normalized = practice71Normalize(
            saved.rawTranscript
        );

        saved.isCorrect = normalized.length > 0 && [
            saved.expectedText,
            saved.modelText
        ].some(text =>
            typeof text === 'string' &&
            text.length > 0 &&
            normalized === practice71Normalize(text)
        );
    }
    const displayed = scriptMode === "hiragana"
        ? practice71ToHiragana(saved.rawTranscript)
        : String(saved.rawTranscript ?? "");
    view.resultSpan.textContent = "";
    view.resultSpan.style.color = "var(--text-primary)";

    if (saved.isCorrect) {
        view.resultSpan.appendChild(
            document.createTextNode(displayed + " ✅ ")
        );
    } else {
        const references = [...new Set(
            [saved.expectedText, saved.modelText]
                .filter(text =>
                    typeof text === "string" &&
                    text.length > 0
                )
                .flatMap(text => [
                    text,
                    practice71ToHiragana(text)
                ])
        )];

        let best = null;

        for (const reference of references) {
            const diff = practice71FindDiff(
                displayed,
                reference
            );

            if (!best || diff.cost < best.cost) {
                best = diff;
            }
        }

        const appendRed = text => {
            const span = document.createElement("span");
            span.textContent = text;
            span.style.color = "var(--error-text)";
            view.resultSpan.appendChild(span);
        };

        if (best) {
            for (
                let index = 0;
                index <= best.chars.length;
                index++
            ) {
                if (best.gaps.has(index)) {
                    appendRed("＿");
                }

                if (index === best.chars.length) break;

                const character = best.chars[index];

                if (best.redIndexes.has(index)) {
                    appendRed(character);
                } else {
                    view.resultSpan.appendChild(
                        document.createTextNode(character)
                    );
                }
            }
        } else {
            view.resultSpan.appendChild(
                document.createTextNode(displayed)
            );
        }

        view.resultSpan.appendChild(
            document.createTextNode(" ")
        );
    }

    if (practice71State.audioUrls[rowKey]) {
        appendPersistedPlayButton(
            view.resultSpan, rowKey, playRate
        );
    }

    view.correctionBox.style.display =
        saved.isCorrect ? "none" : "block";

    if (!saved.isCorrect) {
        view.corrTextSpan.textContent =
            "🔥 Keep going! Try once more!";

        view.corrListenBtn.style.display = "inline-block";

        view.corrListenBtn.onclick = () => {
            if (
                activeRecognitionSession ||
                practice71State.startingRow
            ) {
                return;
            }

            setPlayingStateMultiple(
                [view.corrListenBtn],
                "Playing..."
            );

            speakText(
                saved.modelText,
                0.9,
                () => stopAllPlayback()
            );
        };
    }
}
function practice71SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession || practice71State.startingRow
    );

    practice71State.lockedControls ??= new Map();
    const locked = practice71State.lockedControls;

    const controls = document.querySelectorAll(
        "#drill1Container button, #drill1Container select, " +
        "#drill1Container input"
    );

    if (blocked) {
        controls.forEach(control => {
            if (!locked.has(control)) {
                locked.set(control, control.disabled);
            }
            control.disabled = true;
        });

        const session = activeRecognitionSession;
        const view = session
            ? practice71State.views?.[session.rowKey]
            : null;

        if (view) {
            const canStop =
                session.manual && !session.stopRequested;

            view.stopBtn.disabled = !canStop;
            view.stopBtn.classList.toggle(
                "stop-btn-active",
                canStop
            );
        }
    } else {
        locked.forEach((disabled, control) => {
            if (control.isConnected) {
                control.disabled = disabled;
            }
        });
        locked.clear();
    }

    controls.forEach(control => {
        control.style.setProperty(
            "cursor",
            control.disabled ? "not-allowed" : "pointer",
            "important"
        );
    });
}

function practice71ShowNotice(resultSpan, message) {
    if (!message) return;

    const notice = document.createElement("span");
    notice.textContent = message + " ";
    notice.style.color = "var(--text-secondary)";
    resultSpan.prepend(notice);
}

function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getExpectedTextFn,
    getExpectedKanjiFn,
    playRate,
    rowKey
) {
    practice71State.views ??= {};

    const view = {
        recordBtn, stopBtn, resultSpan,
        correctionBox, corrListenBtn, corrTextSpan
    };

    practice71State.views[rowKey] = view;

    const currentView = () =>
        practice71State.views[rowKey] || view;

    const restoreResult = message => {
        const v = currentView();
        const saved = practice71State.savedResults[rowKey];

        if (saved?.rawTranscript !== undefined) {
            practice71ShowResult(
                v, saved, rowKey, playRate
            );
        } else {
            v.resultSpan.textContent =
                saved?.text || "(Not recorded yet)";
            v.resultSpan.style.color =
                "var(--text-secondary)";
            v.correctionBox.style.display = "none";

            if (practice71State.audioUrls[rowKey]) {
                appendPersistedPlayButton(
                    v.resultSpan, rowKey, playRate
                );
            }
        }

        practice71ShowNotice(v.resultSpan, message);
    };

    restoreResult("");

    if (activeRecognitionSession?.rowKey === rowKey) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (practice71State.startingRow === rowKey) {
        resultSpan.textContent = "Preparing microphone...";
    }

    // 再描画後の新しいボタンにも録音中の制御を適用する。
    queueMicrotask(practice71SyncRecordingUI);

    recordBtn.addEventListener("click", async () => {
        if (
            recordBtn.disabled ||
            activeRecognitionSession ||
            practice71State.startingRow
        ) {
            return;
        }

        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!Recognition) {
            restoreResult(
                "Speech recognition is not supported."
            );
            return;
        }

        if (
            !navigator.mediaDevices?.getUserMedia ||
            !window.MediaRecorder
        ) {
            restoreResult("Recording is not supported.");
            return;
        }

        // 録音開始時の問題文・設定を固定する。
        const expectedText = getExpectedTextFn();
        const modelText = getExpectedKanjiFn();
        const manual = isManualStop;

        stopAllPlayback();
        practice71State.startingRow = rowKey;
        practice71SyncRecordingUI();

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (error) {
            practice71State.startingRow = null;
            practice71SyncRecordingUI();
            restoreResult("Microphone access denied.");
            practice71SyncRecordingUI();
            return;
        }

        practice71State.startingRow = null;

        const session = {
            rowKey,
            manual,
            stopRequested: false,
            finished: false,
            speechStarted: false,
            recognitionDone: false,
            recorderDone: false,
            discard: false,
            transcript: "",
            message: "",
            chunks: [],
            timers: [],
            context: null,
            recognition: null,
            recorder: null,
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
                session.finished ||
                !session.recognitionDone ||
                !session.recorderDone
            ) {
                return;
            }

            session.finished = true;
            clearMonitoring();

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

            if (activeRecognitionSession === session) {
                activeRecognitionSession = null;
            }

            const v = currentView();
            v.stopBtn.classList.remove("stop-btn-active");

            practice71SyncRecordingUI();

            const valid =
                !session.discard &&
                session.speechStarted &&
                session.chunks.some(chunk => chunk.size > 0);

            if (valid) {
                const blob = new Blob(session.chunks, {
                    type:
                        session.recorder.mimeType ||
                        "audio/webm"
                });

                const newUrl = URL.createObjectURL(blob);
                const oldUrl =
                    practice71State.audioUrls[rowKey];

                practice71State.audioUrls[rowKey] = newUrl;

                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl);
                }
            }

            session.chunks = [];

            if (valid && session.transcript.trim()) {
                processResult(
                    session.transcript,
                    expectedText,
                    () => modelText,
                    v.resultSpan,
                    v.correctionBox,
                    v.corrListenBtn,
                    v.corrTextSpan,
                    () => practice71State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

                practice71ShowNotice(
                    v.resultSpan,
                    session.message
                );
            } else {
                restoreResult(
                    session.message || "No speech recognized."
                );
            }

            practice71SyncRecordingUI();
        }

        function stop(message = "", discard = false) {
            if (
                session.finished ||
                session.stopRequested
            ) {
                return;
            }

            session.stopRequested = true;
            session.message = message;
            session.discard = discard;
            clearMonitoring();
            practice71SyncRecordingUI();

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
                    session.discard = true;
                    session.recorderDone = true;
                }
            }

            session.timers.push(setTimeout(() => {
                try {
                    session.recognition?.abort();
                } catch (error) {}

                session.recognitionDone = true;

                if (!session.recorderDone) {
                    session.discard = true;
                    session.recorderDone = true;
                }

                finish();
            }, 2500));

            finish();
        }

        session.stop = stop;

        try {
            const recognition = new Recognition();
            session.recognition = recognition;

            recognition.lang = "ja-JP";
            recognition.interimResults = true;
            recognition.continuous = true;

            session.lastSpeechAt = 0;

            const noteSpeech = () => {
                session.speechStarted = true;
                session.lastSpeechAt = performance.now();
            };

            recognition.onspeechstart = noteSpeech;

            recognition.onresult = event => {
                if (session.finished || session.discard) {
                    return;
                }

                for (
                    let index = event.resultIndex;
                    index < event.results.length;
                    index++
                ) {
                    const result = event.results[index];
                    const text = result[0].transcript;

                    if (text.trim()) {
                        noteSpeech();
                    }

                    if (result.isFinal) {
                        session.transcript += text;
                    }
                }
            };

            recognition.onerror = event => {
                if (
                    session.finished ||
                    session.stopRequested
                ) {
                    return;
                }

                if (event.error === "no-speech") return;

                session.recognitionDone = true;
                stop("Recognition error.", true);
            };

            recognition.onend = () => {
                if (session.finished) return;

                if (session.stopRequested) {
                    session.recognitionDone = true;
                    finish();
                    return;
                }

                // 文中の間で認識が終了しても録音を続ける。
                try {
                    recognition.start();
                } catch (error) {
                    session.recognitionDone = true;
                    stop(
                        "Could not restart recognition.",
                        true
                    );
                }
            };

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

            recorder.onstop = () => {
                session.recorderDone = true;
                finish();
            };

            recorder.onerror = () => {
                stop("Recording error.", true);
            };

            const v = currentView();
            v.resultSpan.textContent = "Recording...";
            v.resultSpan.style.color =
                "var(--accent-color)";
            v.correctionBox.style.display = "none";

            practice71SyncRecordingUI();

            recorder.start();
            recognition.start();

            try {
                const AudioContextClass =
                    window.AudioContext ||
                    window.webkitAudioContext;

                const context = new AudioContextClass();
                session.context = context;

                const source =
                    context.createMediaStreamSource(stream);

                const analyser = context.createAnalyser();
                analyser.fftSize = 1024;
                source.connect(analyser);

                const samples = new Float32Array(
                    analyser.fftSize
                );

                let soundFrames = 0;

                context.resume().catch(() => {});

                session.timers.push(setInterval(() => {
                    if (
                        session.finished ||
                        session.stopRequested
                    ) {
                        return;
                    }

                    analyser.getFloatTimeDomainData(samples);

                    let sum = 0;

                    for (const sample of samples) {
                        sum += sample * sample;
                    }

                    const volume =
                        Math.sqrt(sum / samples.length);

                    const now = performance.now();

                    if (volume > 0.015) {
                        soundFrames++;

                        if (soundFrames >= 3) {
                            session.speechStarted = true;
                        }

                        if (session.speechStarted) {
                            session.lastSpeechAt = now;
                        }
                    } else {
                        soundFrames = 0;
                    }

                    if (
                        !manual &&
                        session.speechStarted &&
                        session.lastSpeechAt > 0 &&
                        now - session.lastSpeechAt >= 2000
                    ) {
                        stop();
                    }
                }, 100));
            } catch (error) {
                // 音量監視が使えなくても、
                // 手動停止と20秒上限は維持する。
            }

            session.timers.push(setTimeout(() => {
                if (!session.speechStarted) {
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
            session.recognitionDone = true;
            stop("Could not start recording.", true);
        }
    });

    stopBtn.addEventListener("click", () => {
        const session = activeRecognitionSession;

        if (
            session?.rowKey === rowKey &&
            session.manual
        ) {
            stopAllPlayback();
            session.stop();
        }
    });
}

function processResult(
    rawTranscript,
    expectedText,
    getExpectedKanjiFn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getUrlFn,
    playRate,
    rowKey
) {
    const transcript = String(rawTranscript ?? "").trim();
    const modelText = getExpectedKanjiFn();
    const normalized = practice71Normalize(transcript);

    const isCorrect = normalized.length > 0 && (
        normalized === practice71Normalize(expectedText) ||
        normalized === practice71Normalize(modelText)
    );

    const saved = {
        rawTranscript: transcript,
        modelText,
        expectedText,
        isCorrect
    };
    practice71State.savedResults[rowKey] = saved;

    practice71ShowResult(
        {
            resultSpan, correctionBox,
            corrListenBtn, corrTextSpan
        },
        saved,
        rowKey,
        playRate
    );

    if (isAutoPlay) {
        speakText(modelText, playRate, () => {
            // 新しい録音中に古い自動再生を開始しない。
            if (activeRecognitionSession ||
                practice71State.startingRow) return;

            stopAllPlayback();
            const url = getUrlFn();
            if (!url) return;

            const audio = new Audio(url);
            currentPlayingAudio = audio;
            audio.playbackRate = 1.0;
            audio.onended = () => stopAllPlayback();
            audio.play().catch(() => stopAllPlayback());
        });
    }
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
        queueMicrotask(() => {
        practice71State.refreshMeaningNotes?.();
    });
    if (resultSpan.querySelector(".play-recording-btn")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className =
        "example-button play-recording-btn custom-tip-wrap";
    button.style.marginLeft = "8px";
    button.innerHTML =
        '▶️<span class="custom-tip-box">Play your recorded voice</span>';

    button.onclick = () => {
        if (activeRecognitionSession ||
            practice71State.startingRow) return;

        const url = practice71State.audioUrls[rowKey];
        if (!url) return;

        stopAllPlayback();
        setPlayingStateMultiple([button], "Playing...");

        const audio = new Audio(url);
        currentPlayingAudio = audio;
        audio.playbackRate = 1.0;
        audio.onended = () => stopAllPlayback();
        audio.play().catch(() => stopAllPlayback());
    };

    resultSpan.appendChild(button);
}
// ============================================================================
// Practice 7.1: ているform① Habit continuous
// ============================================================================
(() => {
    let english = false;
    let previousHint = hintMode;
    const word = (h, k, r, e) => ({ h, k, r, e });
    const data = [
        [
            [word('へや','部屋','heya','room'), word('Switch','Switch','suitchi','Switch'), word('プレイする','プレイする','purei suru','play')],
            '部屋で、Switchを、', 'プレイします', 'プレイしています'
        ],
        [
            [word('がっこう','学校','gakkō','school'), word('せんせい','先生','sensei','teacher'), word('えいご','英語','eigo','English'), word('はなす','話す','hanasu','speak')],
            '学校で、先生と、英語を、', '話します', '話しています'
        ],
        [
            [word('えいがかん','映画館','eigakan','cinema'), word('えいが','映画','eiga','movie'), word('みる','見る','miru','watch')],
            '映画館で、映画を、', '見ます', '見ています'
        ],
        [
            [word('いえ','家','ie','home'), word('シャワー','シャワー','shawā','shower'), word('あびる','浴びる','abiru','take')],
            '家で、シャワーを、', '浴びます', '浴びています'
        ],
        [
            [word('でんしゃ','電車','densha','train'), word('スマホ','スマホ','sumaho','smartphone'), word('つかう','使う','tsukau','use')],
            '電車で、スマホを、', '使います', '使っています'
        ],
        [
            [word('そと','外','soto','outside'), word('タバコ','タバコ','tabako','cigarette'), word('すう','吸う','suu','smoke')],
            '外で、タバコを、', '吸います', '吸っています'
        ],
        [
            [word('こうえん','公園','kōen','park'), word('ともだち','友達','tomodachi','friend'), word('あそぶ','遊ぶ','asobu','play')],
            '公園で、友達と、', '遊びます', '遊んでいます'
        ],
        [
            [word('きっさてん','喫茶店','kissaten','café'), word('コーヒー','コーヒー','kōhī','coffee'), word('のむ','飲む','nomu','drink')],
            '喫茶店で、コーヒーを、', '飲みます', '飲んでいます'
        ],
        [
            [word('だいがく','大学','daigaku','university'), word('せんせい','先生','sensei','teacher'), word('きく','聞く','kiku','ask')],
            '大学で、先生に、', '聞きます', '聞いています'
        ],
        [[word('いそぐ','急ぐ','isogu','hurry')], '', '急ぎます', '急いでいます']
    ];

    const originalToHiragana = practice71BaseToHiragana;

    practice71ToHiragana = function (text) {
        let value = String(text ?? '').normalize('NFKC');

        value = value.replace(
            /(?:Nintendo\s*Switch|任天堂\s*スイッチ|ニンテンドー\s*スイッチ|ニンテンドウ\s*スイッチ|Switch)/gi,
            'すいっち'
        ).replace(/スマートフォン|スマートホン/g, 'スマホ');

        const dictionary = [
            ['映画館','えいがかん'], ['喫茶店','きっさてん'],
            ['学校','がっこう'], ['大学','だいがく'], ['先生','せんせい'],
            ['英語','えいご'], ['映画','えいが'], ['部屋','へや'],
            ['電車','でんしゃ'], ['公園','こうえん'], ['友達','ともだち'],
            ['友だち','ともだち'], ['今','いま'], ['家','いえ'], ['外','そと'],
            ['話','はな'], ['見','み'], ['浴','あ'], ['使','つか'],
            ['吸','す'], ['遊','あそ'], ['飲','の'], ['聞','き'], ['急','いそ']
        ];

        dictionary.forEach(([from, to]) => {
            value = value.split(from).join(to);
        });

        return originalToHiragana(value);
    };

    const flat = text => practice71ToHiragana(text)
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, '');

    practice71Data.splice(
        0,
        practice71Data.length,
        ...data.map((row, index) => {
            const [words, clauses, Habit, ongoing] = row;
            const last = words[words.length - 1];
            const a = `いつも、${clauses}${Habit}。`;
            const b = `いま、${clauses}${ongoing}。`;

            return {
                words,
                clauses,
                Habit,
                ongoing,
                x: words[0].h,
                xKanji: words[0].k,
                xRomaji: words[0].r,
                xMeaning: words[0].e,
                y: last.h,
                yKanji: last.k,
                yRomaji: last.r,
                yMeaning: last.e,
                pastSentence: a,
                pastSentenceHira: practice71ToHiragana(a),
                perfectSentence: b,
                perfectSentenceHira: practice71ToHiragana(b),
                itemIndex: index
            };
        })
    );

    // 助詞付き語句を、順不同で過不足なく使用したか確認する。
    practice71Normalize = function (text) {
        const value = flat(text);

        for (const item of practice71Data) {
            const chunks = item.clauses
                .split('、')
                .filter(Boolean)
                .map(flat);

            for (const [time, verb] of [
                ['いつも', item.Habit],
                ['いま', item.ongoing]
            ]) {
                const ending = flat(verb);
                if (!value.endsWith(ending)) continue;

                let rest = value.slice(0, -ending.length);
                const remaining = [time, ...chunks];

                while (rest && remaining.length) {
                    const index = remaining.findIndex(
                        chunk => rest.startsWith(chunk)
                    );

                    if (index < 0) break;

                    rest = rest.slice(remaining[index].length);
                    remaining.splice(index, 1);
                }

                if (!rest && !remaining.length) {
                    return `${time}|${chunks.slice().sort().join('|')}|${ending}`;
                }
            }
        }

        return value;
    };

    // 読み上げの区切りとSwitchの読みを指定する。
    speakText = function (text, rate = 0.9, onEndCallback) {
        setupPreferredVoice();

        const utterance = new SpeechSynthesisUtterance(
            String(text ?? '').replace(
                /(?:Nintendo\s*)?Switch/gi,
                'スイッチ'
            )
        );

        utterance.lang = 'ja-JP';
        utterance.rate = rate;

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        currentUtteranceRef = utterance;

        const finish = () => {
            if (currentUtteranceRef !== utterance) return;

            currentUtteranceRef = null;
            onEndCallback?.();
        };

        utterance.onend = finish;
        utterance.onerror = finish;

        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            finish();
        }
    };

    function cue(item) {
        const words = item.words.map(w => {
            const content = english
                ? w.e
                : formatWord(w.h, w.k, w.r, w.e);

            return `<span class="p71-cue-word">${content}</span>`;
        });

        return `<span class="p71-cues">${
            words.join(
                '<span class="p71-cue-separator">／</span><wbr>'
            )
        }</span>`;
    }


    function exampleSentence(item, ongoing) {
        if (!document.getElementById('practice71GrammarStyle')) {
            const style = document.createElement('style');
            style.id = 'practice71GrammarStyle';
            style.textContent = `
                #practice71Example .p71-grammar-highlight {
                    color: #CA8A04;
                    font-weight: bold;
                }

                @media (prefers-color-scheme: dark) {
                    #practice71Example .p71-grammar-highlight {
                        color: #FBBF24;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const highlight = text =>
            `<span class="p71-grammar-highlight">${text}</span>`;

        let sentence;

        if (!english) {
            const text = ongoing
                ? item.perfectSentence
                : item.pastSentence;

            sentence = scriptMode === 'hiragana'
                ? practice71ToHiragana(text)
                : text;
        } else {
            const under = text =>
                `<span class="p71-underlined">${text}</span>`;

            sentence =
                `${ongoing ? 'いま' : 'いつも'}、` +
                `${under('room')} で、` +
                `Switch を、${under('play')} ` +
                `${ongoing ? 'しています' : 'します'}。`;
        }

        if (ongoing) {
            sentence = sentence.replace(
                /^(?:いま|今)/,
                () => highlight(scriptMode === 'hiragana' ? 'いま' : '今')
            );

            sentence = sentence.replace(
                /ています(?=[。．.!！]?$)/,
                () => highlight('ています')
            );
        } else {
            sentence = sentence.replace(
                /^いつも/,
                () => highlight('いつも')
            );

            sentence = sentence.replace(
                /ます(?=[。．.!！]?$)/,
                () => highlight('ます')
            );
        }

        return sentence;
    }

    function refreshHintButtons() {
        document.querySelectorAll(
            '#hintModeControl button[data-value]'
        ).forEach(button => {
            const selected = button.dataset.value === hintMode;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }

    renderAll = function () {
        let container = document.getElementById('drill1Container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'drill1Container';
            document.body.insertBefore(container, document.querySelector('.voice-guide-footer'));
        }
        container.replaceChildren();
        practice71State.views = {};
        practice71State.refreshMeaningNotes = () => {};
        const item = practice71Data[0];
        const example = document.createElement('div');
        example.className = 'example-box';
        example.id = 'practice71Example';
        example.style.marginTop = '30px';
        example.innerHTML = `
            <style>
                #practice71Example .p71-example-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(5, max-content) minmax(0, 1fr);
                    align-items: center;
                    column-gap: 4px;
                    row-gap: 10px;
                    padding: 10px 0;
                }

                #practice71Example .p71-example-grid > .example-line {
                    display: contents !important;
                }

                #practice71Example .p71-example-grid > .example-line + .example-line::before {
                    content: "";
                    grid-column: 1 / -1;
                    border-top: 1px dashed #fbc02d;
                }

                #practice71Example .p71-example-grid .example-label-title {
                    width: auto !important;
                    min-width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    white-space: nowrap;
                }

                #practice71Example .p71-example-grid > .example-line > .example-button {
                    justify-self: start;
                    margin: 0;
                    white-space: nowrap;
                }

                #practice71Example .p71-example-model {
                    min-width: 0;
                    overflow-wrap: normal;
                    word-break: normal;
                }

                @media (prefers-color-scheme: dark) {
                    #practice71Example .p71-example-grid > .example-line + .example-line::before {
                        border-top-color: #713f12;
                    }
                }
            </style>

            <div class="p71-example-grid">
                ${[false, true].map(ongoing => `
                    <div class="example-line">
                        <strong class="example-label-title">${ongoing ? 'Ongoing:' : 'Habit:'}</strong>
                        ${cue(item)}
                        <span>👉</span>
                        <button type="button"
                                class="example-button"
                                data-model="${ongoing ? 'ongoing' : 'Habit'}">🔊きく</button>
                        <span class="p71-tense ${ongoing ? 'p71-ongoing' : 'p71-Habit'}">${ongoing ? '▶️Ongoing' : '🔁Habit'}</span>
                        <span class="p71-example-model">${exampleSentence(item, ongoing)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        example.querySelectorAll('button[data-model]').forEach(button => {
            button.onclick = () => {
                setPlayingStateMultiple([button],'Playing...');
                speakText(button.dataset.model === 'Habit' ? item.pastSentence : item.perfectSentence,0.9,stopAllPlayback);
            };
        });
        container.appendChild(example);
        const info = document.createElement('div');
        info.className = 'info-panel info-panel-task1';
        info.style.marginTop = '25px';
        info.innerHTML = '<span class="info-panel-title">Drill 1: Compare Habit &amp; Ongoing</span><span class="info-panel-desc">💡 Compare what you usually do with what you are doing now: いつも ↔️ いま.</span>';
        container.appendChild(info);
        const list = document.createElement('div');
        list.id = 'drill1List';
        container.appendChild(list);
        practice71Data.slice(1).forEach((item,index) => {
            createPractice71TableCard(list,`${index+1}.`,item,index,0.9);
            const card = list.lastElementChild;
            card.querySelector('.prompt-label').innerHTML = cue(item);
            const rows = card.querySelectorAll('tr');
            [false,true].forEach((ongoing,rowIndex) => {
                const row = rows[rowIndex];
                const control = row.lastElementChild;
                const label = Array.from(control.children).find(el => el.tagName === 'SPAN');
                if (label) {
                    label.textContent = ongoing ? '▶️Ongoing' : '🔁Habit';
                    label.className = `p71-tense ${ongoing ? 'p71-ongoing' : 'p71-Habit'}`;
                    label.removeAttribute('style');
                }
                const stopButton = control.querySelectorAll('button')[2];

                if (stopButton) {
                    const startHint = document.createElement('span');
                    startHint.className = 'p71-start-hint';
                    startHint.textContent = ongoing
                        ? (scriptMode === 'hiragana' ? 'いま…' : '今…')
                        : 'いつも…';

                    startHint.style.marginLeft = '8px';
                    startHint.style.fontWeight = 'bold';
                    startHint.style.whiteSpace = 'nowrap';

                    stopButton.insertAdjacentElement('afterend', startHint);
                }

                row.querySelectorAll('.custom-tip-box').forEach(tip => {
                    tip.textContent = tip.textContent
                        .replace(/past tense/gi, 'Habit form')
                        .replace(/Habit perfect/gi, 'ongoing action');
                });            });
        });
        const panel = document.createElement('div');
        panel.className = 'info-panel info-panel-task1 drill-cue-panel';
        panel.innerHTML = `
            <span class="info-panel-title drill-cue-title">
                Drill 2: Practice with English cues
            </span>
            <span class="info-panel-desc drill-cue-description">
                💡 Practise making sentences with this lesson’s vocabulary, using English cues.
            </span>
        `;

        const button = document.createElement('button');
        button.id = 'practice71CueButton';
        button.type = 'button';
        button.className = english
            ? 'drill-cue-button is-english'
            : 'drill-cue-button';
        button.setAttribute('aria-pressed',String(english));
        button.textContent = english ? 'Display Japanese cues' : 'Display English cues';
        button.onclick = () => {
            if (activeRecognitionSession || practice71State.startingRow) return;
            stopAllPlayback();
            if (!english) { previousHint = hintMode; hintMode = 'off'; }
            else hintMode = previousHint;
            english = !english;
            practice71State.savedResults = {};
            refreshHintButtons();
            renderAll();
            requestAnimationFrame(() => {
                const target = document.getElementById('practice71Example');
                const style = getComputedStyle(target);
                const line = parseFloat(style.lineHeight) || (parseFloat(style.fontSize)||16)*1.5;
                window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-line),behavior:'smooth'});
            });
        };
        // Drill 2：左にタイトル＋指示文、右にボタン。
        const copy = document.createElement('div');
        copy.className = 'p71-drill2-copy';

        while (panel.firstChild) {
            copy.appendChild(panel.firstChild);
        }

        panel.id = 'practice71Drill2Panel';
        panel.append(copy, button);
        container.appendChild(panel);

        // 配置と確定配色を適用。
        if (!document.getElementById('practice71LayoutStyle')) {
            const style = document.createElement('style');
            style.id = 'practice71LayoutStyle';
            style.textContent = `
                #practice71Drill2Panel {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                }

                #practice71Drill2Panel .p71-drill2-copy {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    flex: 1;
                    min-width: 0;
                }

                #practice71Drill2Panel .drill-cue-title,
                #practice71Drill2Panel .drill-cue-description {
                    display: block;
                    margin: 0;
                }

                #practice71Drill2Panel > .drill-cue-button {
                    flex: 0 0 auto;
                    width: auto;
                    min-width: 190px;
                }

                #drill1Container .p71-tense.p71-Habit {
                    background: #fde047;
                    color: #713f12;
                }

                #drill1Container .p71-tense.p71-ongoing {
                    background: #ffab70;
                    color: #6b240b;
                }

                #drill1Container .p71-cues {
                    white-space: nowrap;
                }

                #drill1Container .p71-cues wbr {
                    display: none;
                }

                @media (prefers-color-scheme: dark) {
                    #drill1Container .p71-tense.p71-Habit {
                        background: #665710;
                        color: #fef08a;
                    }

                    #drill1Container .p71-tense.p71-ongoing {
                        background: #813d16;
                        color: #ffdab5;
                    }
                }

                @media (max-width: 600px) {
                    #practice71Drill2Panel {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    #practice71Drill2Panel > .drill-cue-button {
                        width: 100%;
                        min-width: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 全キューを実測し、最長の1行表示幅に列を揃える。
        const cueCells = Array.from(
            list.querySelectorAll('.prompt-label')
        );

        let cueWidth = 0;

        cueCells.forEach(cell => {
            const measure = document.createElement('span');
            measure.innerHTML = cell.innerHTML;

            Object.assign(measure.style, {
                position: 'absolute',
                visibility: 'hidden',
                display: 'inline-block',
                width: 'max-content',
                maxWidth: 'none',
                whiteSpace: 'nowrap',
                font: 'inherit',
                pointerEvents: 'none'
            });

            cell.appendChild(measure);

            cueWidth = Math.max(
                cueWidth,
                Math.ceil(measure.getBoundingClientRect().width)
            );

            measure.remove();
        });

        cueCells.forEach(cell => {
            cell.style.setProperty('width', `${cueWidth}px`, 'important');
            cell.style.setProperty('padding-right', '4px', 'important');
            cell.style.setProperty('white-space', 'nowrap', 'important');
        });

        practice71SyncRecordingUI();
    };
    const originalSync = practice71SyncRecordingUI;
    practice71SyncRecordingUI = function () {
        originalSync();
        const button = document.getElementById('practice71CueButton');
        if (button) button.disabled = Boolean(activeRecognitionSession || practice71State.startingRow);
    };
})();

// ============================================================================
// Practice 7.1：基本キュー／で・と／英語キュー
// ============================================================================
(() => {
    let stage = 1;
    let previousHint = hintMode;
    let speechStyle = 'formal';

    const baseRender = renderAll;
    const baseNormalize = practice71Normalize;
    const baseShowResult = practice71ShowResult;
    const originalSync = practice71SyncRecordingUI;
    const baseFormatWord = formatWord;
    const baseToHiragana = practice71ToHiragana;

    const w = (h, k, r, e) => ({ h, k, r, e });
    const originalItems = practice71Data.slice();
    const order = [2, 3, 0, 1, 4, 5, 6, 7, 8, 9];
    const items = order.map(index => ({
        ...originalItems[index]
    }));

    const basicIndexes = [
        [1, 2], [1, 2], [1, 2], [2, 3], [1, 2],
        [1, 2], [2], [1, 2], [1, 2], [0]
    ];

    const basicClauses = [
        '映画を、',
        'シャワーを、',
        'Switchを、',
        '英語を、',
        'スマホを、',
        'タバコを、',
        '',
        'コーヒーを、',
        '先生に、',
        ''
    ];

    items.forEach((item, index) => {
        item.basicWords = basicIndexes[index].map(
            i => item.words[i]
        );
        item.basicClauses = basicClauses[index];
        item.expandedWords = item.words.slice();
        item.expandedClauses = item.clauses;
    });

    items[2].expandedWords.splice(
        1, 0,
        w('いもうと', '妹', 'imōto', 'younger sister')
    );
    items[2].expandedClauses = '部屋で、妹と、Switchを、';

    items[3].expandedWords[1] = w(
        'クラスメート', 'クラスメート',
        'kurasumēto', 'classmate'
    );
    items[3].expandedClauses =
        '学校で、クラスメートと、英語を、';

    // Example：見る。
    // 問題：浴びる、プレイする、話す、使う、吸う、
    //       遊ぶ、飲む、聞く、急ぐ。
    const plainHabit = [
        '見る', '浴びる', 'プレイする', '話す', '使う',
        '吸う', '遊ぶ', '飲む', '聞く', '急ぐ'
    ];

    const plainOngoing = [
        '見ている',
        '浴びている',
        'プレイしている',
        '話している',
        '使っている',
        '吸っている',
        '遊んでいる',
        '飲んでいる',
        '聞いている',
        '急いでいる'
    ];

    const casualHabit = [
        '見るよ', '浴びるよ', 'プレイするよ',
        '話すよ', '使うよ', '吸うよ', '遊ぶよ',
        '飲むよ', '聞くよ', '急ぐよ'
    ];

    const casualOngoing = [
        '見てるよ',
        '浴びてるよ',
        'プレイしてるよ',
        '話してるよ',
        '使ってるよ',
        '吸ってるよ',
        '遊んでるよ',
        '飲んでるよ',
        '聞いてるよ',
        '急いでるよ'
    ];

    // Casualの助詞省略は各問題に明示する。
    const casualBasic = [
        '映画、',
        'シャワー、',
        'Switch、',
        '英語、',
        'スマホ、',
        'タバコ、',
        '',
        'コーヒー、',
        '先生に、',
        ''
    ];

    const casualExpanded = [
        '映画館で、映画、',
        '家で、シャワー、',
        '部屋で、妹と、Switch、',
        '学校で、クラスメートと、英語、',
        '電車で、スマホ、',
        '外で、タバコ、',
        '公園で、友達と、',
        '喫茶店で、コーヒー、',
        '大学で、先生に、',
        ''
    ];

    // モードにかかわらず、同じ問題の抽出文・録音を表示する。
    const sharedRecord = {
        savedResults: practice71State.savedResults,
        audioUrls: practice71State.audioUrls
    };

    const emptyRecords = () => ({
        1: sharedRecord,
        2: sharedRecord,
        3: sharedRecord
    });

    const styleRecords = {
        formal: emptyRecords(),
        informal: emptyRecords(),
        casual: emptyRecords()
    };

    let records = styleRecords.formal;

    practice71ToHiragana = text => baseToHiragana(
        String(text ?? '').replace(/妹/g, 'いもうと')
    );

    formatWord = function (h, k, r, e) {
        if (stage !== 3) {
            return baseFormatWord(h, k, r, e);
        }

        const span = document.createElement('span');
        span.textContent = e;
        return span.innerHTML;
    };

    function blocked() {
        return Boolean(
            activeRecognitionSession ||
            practice71State.startingRow
        );
    }

    function syncSpeechStyle() {
        document.querySelectorAll(
            '#speechStyleControl button[data-value]'
        ).forEach(button => {
            const selected =
                button.dataset.value === speechStyle;

            button.classList.toggle('is-selected', selected);
            button.setAttribute(
                'aria-pressed',
                String(selected)
            );
            button.disabled = blocked();
        });

        document.querySelectorAll(
            '#drill1List .result-text'
        ).forEach(result => {
            const cell = result.closest('td');
            if (!cell) return;

            // 作成済みの行は再構成しない。
            if (cell.querySelector('.recording-controls')) {
                return;
            }

            const resultWrap = result.parentElement;
            resultWrap.classList.add('recording-result');

            const layout = document.createElement('div');
            layout.className = 'recording-controls';

            const actions = document.createElement('div');
            actions.className = 'recording-actions';

            // 操作ボタンと結果欄を、それぞれまとめる。
            // 既存要素を移動するため、クリック処理は保持される。
            Array.from(cell.childNodes).forEach(node => {
                if (node !== resultWrap) {
                    actions.appendChild(node);
                }
            });

            layout.append(actions, resultWrap);
            cell.appendChild(layout);
        });
    }

    const baseSync = function () {
        originalSync();
        syncSpeechStyle();
    };

    function installSpeechStyle() {
        const script = document.getElementById(
            'scriptModeControl'
        );
        const anchor = script?.closest('.control-item');
        if (!anchor) return;

        const existing = document.getElementById(
            'speechStyleControl'
        );

        if (existing) {
            anchor.after(existing.closest('.control-item'));
            syncSpeechStyle();
            return;
        }

        const item = document.createElement('div');
        item.className = 'control-item speech-style-item';

        const control = document.createElement('div');
        control.id = 'speechStyleControl';
        control.className = 'segmented-control';
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', 'Speech style');

        [
            [
                'formal',
                '🏢Formal',
                'Polite speech for work or unfamiliar people.'
            ],
            [
                'informal',
                '🏠Informal',
                'Plain forms used in writing'
            ],
            [
                'casual',
                '🫂Casual',
                'Relaxed speech with family and friends.'
            ]
        ].forEach(([value, label, description]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className =
                'segmented-option custom-tip-wrap';
            button.dataset.value = value;
            button.append(document.createTextNode(label));

            const tip = document.createElement('span');
            tip.className = 'custom-tip-box';
            tip.textContent = description;
            button.append(tip);

            button.onclick = () => {
                if (blocked() || speechStyle === value) return;

                stopAllPlayback();

                // 文体だけを変更し、保存先を切り替えない。
                speechStyle = value;
                records = styleRecords[value];

                renderAll();
            };

            control.append(button);
        });

        item.append(control);

        // Hiragana／漢字 → 文体 → Vocabの順。
        anchor.after(item);
        syncSpeechStyle();
    }
    function applyStage() {
        installSpeechStyle();

        practice71Data.splice(
            0,
            practice71Data.length,
            ...items.map((item, index) => {
                const words = stage === 1
                    ? item.basicWords
                    : item.expandedWords;

                const clauses = speechStyle === 'casual'
                    ? (
                        stage === 1
                            ? casualBasic[index]
                            : casualExpanded[index]
                    )
                    : (
                        stage === 1
                            ? item.basicClauses
                            : item.expandedClauses
                    );

                const Habit = speechStyle === 'formal'
                    ? item.Habit
                    : speechStyle === 'informal'
                        ? plainHabit[index]
                        : casualHabit[index];

                const ongoing = speechStyle === 'formal'
                    ? item.ongoing
                    : speechStyle === 'informal'
                        ? plainOngoing[index]
                        : casualOngoing[index];

                const a = `いつも、${clauses}${Habit}。`;
                const b = `いま、${clauses}${ongoing}。`;

                const first = words[0];
                const last = words[words.length - 1];

                return {
                    ...item,
                    words,
                    clauses,
                    Habit,
                    ongoing,
                    itemIndex: index,
                    x: first.h,
                    xKanji: first.k,
                    xRomaji: first.r,
                    xMeaning: first.e,
                    y: last.h,
                    yKanji: last.k,
                    yRomaji: last.r,
                    yMeaning: last.e,
                    pastSentence: a,
                    pastSentenceHira:
                        practice71ToHiragana(a),
                    perfectSentence: b,
                    perfectSentenceHira:
                        practice71ToHiragana(b)
                };
            })
        );
    }

    function styleExampleSentence(ongoing) {
        const item = practice71Data[0];

        const suffix = ongoing
            ? {
                formal: 'ています',
                informal: 'ている',
                casual: 'てるよ'
            }[speechStyle]
            : {
                formal: 'ます',
                informal: 'る',
                casual: 'るよ'
            }[speechStyle];

        const gold = text =>
            `<span class="p71-grammar-highlight">${text}</span>`;

        const start = ongoing
            ? (scriptMode === 'hiragana' ? 'いま' : '今')
            : 'いつも';

        if (stage === 3) {
            const under = text =>
                `<span class="p71-underlined">${text}</span>`;

            return gold(start) + '、' +
                under('cinema') + ' で、' +
                under('movie') +
                (speechStyle === 'casual' ? '、' : ' を、') +
                under('watch') + ' ' +
                gold(suffix) + '。';
        }

        let text = ongoing
            ? item.perfectSentence
            : item.pastSentence;

        if (scriptMode === 'hiragana') {
            text = practice71ToHiragana(text);
        }

        return text
            .replace(
                /^(?:いつも|いま|今)/,
                () => gold(start)
            )
            .replace(
                new RegExp(suffix + '。$'),
                () => gold(suffix) + '。'
            );
    }

    // 「英語を／英語で」を比較時だけ同じ形にする。
    practice71Normalize = text => baseNormalize(
        String(text ?? '').replace(
            /(英語|えいご)([\s、，,]*)で/g,
            '$1$2を'
        )
    );

    // 「英語を／英語で」の対象は並べ替え後の3番。
    practice71ShowResult = function (
        view, saved, rowKey, playRate
    ) {
        const target =
            /^p7_drill_(past|perf)_2$/.test(rowKey);

        const usesDe = target &&
            /(?:英語|えいご)[\s、，,]*で/.test(
                String(saved.rawTranscript ?? '')
            );

        const withDe = text => String(text ?? '').replace(
            /(英語|えいご)([\s、，,]*)を/g,
            '$1$2で'
        );

        const result = usesDe ? {
            ...saved,
            expectedText: withDe(saved.expectedText),
            modelText: withDe(saved.modelText)
        } : saved;

        baseShowResult(view, result, rowKey, playRate);
        saved.isCorrect = result.isCorrect;

        if (!target || !result.isCorrect) return;

        const recording = view.resultSpan.querySelector(
            '.play-recording-btn'
        );

        const displayed = scriptMode === 'hiragana'
            ? practice71ToHiragana(saved.rawTranscript)
            : String(saved.rawTranscript ?? '');

        view.resultSpan.replaceChildren();

        const match = usesDe
            ? /(?:英語|えいご)[\s、，,]*で/.exec(displayed)
            : null;

        if (match) {
            const index =
                match.index + match[0].length - 1;

            const particle = document.createElement('span');
            particle.className = 'p71-accepted-particle';
            particle.textContent = 'で';

            view.resultSpan.append(
                document.createTextNode(
                    displayed.slice(0, index)
                ),
                particle,
                document.createTextNode(
                    displayed.slice(index + 1)
                )
            );
        } else {
            view.resultSpan.append(
                document.createTextNode(displayed)
            );
        }

        view.resultSpan.append(
            document.createTextNode(' ✅ ')
        );

        const listen = document.createElement('button');
        listen.type = 'button';
        listen.className = 'example-button';
        listen.textContent = '🔊きく';

        listen.onclick = () => {
            if (activeRecognitionSession ||
                practice71State.startingRow) return;

            stopAllPlayback();
            setPlayingStateMultiple([listen], 'Playing...');
            speakText(
                result.modelText,
                playRate,
                stopAllPlayback
            );
        };

        view.resultSpan.append(listen);

        if (recording) {
            view.resultSpan.append(recording);
        }

        if (usesDe) {
            const note = document.createElement('span');
            note.className = 'p71-particle-note';
            note.textContent =
                'Both ‘を’ and ‘で’ are correct in this context.';
            view.resultSpan.append(note);
        }
    };

    function selectStage(next) {
        if (activeRecognitionSession ||
            practice71State.startingRow) return;

        stopAllPlayback();

        records[stage] = {
            savedResults: practice71State.savedResults,
            audioUrls: practice71State.audioUrls
        };

        if (next === 3 && stage !== 3) {
            previousHint = hintMode;
            hintMode = 'off';
        } else if (stage === 3 && next !== 3) {
            hintMode = previousHint;
        }

        stage = next;

        practice71State.savedResults =
            records[stage].savedResults;

        practice71State.audioUrls =
            records[stage].audioUrls;

        renderAll();

        document.getElementById(
            'practice71Example'
        )?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    function makePanel(
        number, title, description, text, active, next
    ) {
        const panel = document.createElement('section');
        panel.className =
            'info-panel info-panel-task1 ' +
            'drill-cue-panel p71-stage-panel';

        const copy = document.createElement('div');
        copy.className = 'p71-stage-copy';

        const heading = document.createElement('span');
        heading.className = 'info-panel-title';
        heading.textContent = title;

        const desc = document.createElement('span');
        desc.className = 'info-panel-desc';
        desc.textContent = description;

        copy.append(heading, desc);

        const button = document.createElement('button');
        button.type = 'button';
        button.id = `practice71Stage${number}Button`;
        button.className = 'drill-cue-button';
        button.classList.toggle('is-english', active);
        button.setAttribute('aria-pressed', String(active));
        button.textContent = text;
        button.onclick = () => selectStage(next);

        panel.append(copy, button);
        return panel;
    }

    function installStageStyles() {
        if (document.getElementById(
            'practice71StageStyle'
        )) return;

        const style = document.createElement('style');
        style.id = 'practice71StageStyle';
        style.textContent = `
            #drill1Container .info-panel.p71-stage-panel {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 24px;
            }

            #drill1Container .p71-stage-copy {
                display: flex;
                flex-direction: column;
                gap: 5px;
                flex: 1;
                min-width: 0;
            }

            #drill1Container .p71-stage-copy > span {
                display: block;
                margin: 0;
            }

            #drill1Container .p71-stage-panel > .drill-cue-button {
                flex: 0 0 auto;
                width: auto;
                min-width: 190px;
            }

            #drill1Container .p71-accepted-particle,
            #drill1Container .p71-particle-note {
                color: #2563eb;
            }

            #drill1Container .p71-particle-note {
                display: block;
                margin-top: 6px;
                font-size: 14px;
                font-weight: normal;
                line-height: 1.5;
                white-space: normal;
            }

            @media (prefers-color-scheme: dark) {
                #drill1Container .p71-accepted-particle,
                #drill1Container .p71-particle-note {
                    color: #60a5fa;
                }
            }

            @media (max-width: 600px) {
                #drill1Container .info-panel.p71-stage-panel {
                    flex-direction: column;
                    align-items: stretch;
                }

                #drill1Container .p71-stage-panel > .drill-cue-button {
                    width: 100%;
                    min-width: 0;
                }
            }
        `;

        document.head.appendChild(style);
    }

    renderAll = function () {
        applyStage();
        installStageStyles();
        baseRender();

        const container =
            document.getElementById('drill1Container');

        document.getElementById(
            'practice71Drill2Panel'
        )?.remove();

        const titles = {
            1: 'Drill 1: Compare Habit & Ongoing — Basic cues',
            2: 'Drill 2: Add a place or a person — で・と',
            3: 'Drill 3: Practice with English cues'
        };

        const heading = container.querySelector(
            '.info-panel:not(.drill-cue-panel) .info-panel-title'
        );

        if (heading) {
            heading.textContent = titles[stage];
        }

        const desc = heading?.parentElement.querySelector(
            '.info-panel-desc'
        );

        if (desc) {
            desc.textContent = stage === 1
                ? '💡 Use all the cues. Begin with いつも or いま.'
                : stage === 2
                    ? '💡 Use all the cues. Add で for a place and と for a companion. Keep 先生に with 聞く. 急ぐ has no extra cues.'
                    : '💡 Use all the English cues to make Japanese sentences. Begin with いつも or いま.';
        }

        container.querySelectorAll(
            '#practice71Example .example-line'
        ).forEach((line, index) => {
            line.lastElementChild.innerHTML =
                styleExampleSentence(Boolean(index));
        });
        container.append(
            makePanel(
                2,
                titles[2],
                '💡 Add Japanese cues for a place or a companion to the same exercises.',
                stage === 2
                    ? 'Display basic cues'
                    : 'Display expanded cues',
                stage === 2,
                stage === 2 ? 1 : 2
            ),
            makePanel(
                3,
                titles[3],
                '💡 Practise the expanded sentences using English cues.',
                stage === 3
                    ? 'Display Japanese cues'
                    : 'Display English cues',
                stage === 3,
                stage === 3 ? 2 : 3
            )
        );

        document.querySelectorAll(
            '#hintModeControl button[data-value]'
        ).forEach(button => {
            const selected =
                button.dataset.value === hintMode;

            button.classList.toggle(
                'is-selected', selected
            );

            button.setAttribute(
                'aria-pressed', String(selected)
            );
        });

        practice71SyncRecordingUI();
    };

    practice71SyncRecordingUI = function () {
        baseSync();

        const blocked = Boolean(
            activeRecognitionSession ||
            practice71State.startingRow
        );

        document.querySelectorAll(
            '.p71-stage-panel button'
        ).forEach(button => {
            button.disabled = blocked;
        });
    };

    applyStage();
})();
