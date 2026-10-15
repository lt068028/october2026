// ============================================================================
// Practice 1.2: Yes/No & Wh- Questions (Genki Lesson 2 - 「せんこう」同音異義語完全網羅版)
// ============================================================================

const practice2Data = [
    { x: "おにいさん", xKanji: "お兄さん", xRomaji: "onīsan", xMeaning: "older brother", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student" },
    { x: "おかあさん", xKanji: "お母さん", xRomaji: "okāsan", xMeaning: "mother", y: "かいしゃいん", yKanji: "会社員", yRomaji: "kaishain", yMeaning: "company employee" },
    { x: "おねえさん", xKanji: "お姉さん", xRomaji: "onēsan", xMeaning: "older sister", y: "こうこうせい", yKanji: "高校生", yRomaji: "kōkōsei", yMeaning: "high school student" },
    { x: "おとうさん", xKanji: "お父さん", xRomaji: "otōsan", xMeaning: "father", y: "じえいぎょう", yKanji: "自営業", yRomaji: "jiēgyō", yMeaning: "self-employed" },
    { x: "いもうと", xKanji: "妹", xRomaji: "imōto", xMeaning: "younger sister", y: "フリーター", yKanji: "フリーター", yRomaji: "furītā", yMeaning: "part-time worker" }
];

const drill2Targets = [
    { label: "ともだち", labelKanji: "友達", labelRomaji: "tomodachi", labelMeaning: "friend", possessive: "ともだちの", possessiveKanji: "友達の" },
    { label: "しんゆう", labelKanji: "親友", labelRomaji: "shinyū", labelMeaning: "best friend", possessive: "しんゆうの", possessiveKanji: "親友の" },
    { label: "どうりょう", labelKanji: "同僚", labelRomaji: "dōryō", labelMeaning: "colleague", possessive: "どうりょうの", possessiveKanji: "同僚の" }
];

const majorsData = [
    { word: "せいじ", kanji: "政治", romaji: "seiji", meaning: "politics" },
    { word: "けいざい", kanji: "経済", romaji: "keizai", meaning: "economics" },
    { word: "ビジネス", kanji: "ビジネス", romaji: "bijinesu", meaning: "business" },
    { word: "こくさいかんけい", kanji: "国際関係", romaji: "kokusai kankei", meaning: "international relations" },
    { word: "れきし", kanji: "歴史", romaji: "rekishi", meaning: "history" },
    { word: "にほんご", kanji: "日本語", romaji: "nihongo", meaning: "Japanese" },
    { word: "コンピューター", kanji: "コンピューター", romaji: "konpyūtā", meaning: "computer science" }
];

const rowColorThemes = [
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" }
];

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "hiragana";
let isAutoPlay = true;
let activeRecognitionSession = null;

// 変数名は構文エラーを防ぐため practice2State のまま維持
const practice2State = {
    customSelects: {},
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

// ひらがな正規化処理 ＆ 「せんこう」関連の同音異義語網羅補正
function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");

    const dict = {
        "お母さん": "おかあさん",
        "お父さん": "おとうさん",
        "お兄さん": "おにいさん",
        "お姉さん": "おねえさん",
        "弟": "おとうと",
        "妹": "いもうと",
        "会社員": "かいしゃいん",
        "自営業": "じえいぎょう",
        "高校生": "こうこうせい",
        "看護師": "かんごし",
        "主婦": "しゅふ",
        "政治": "せいじ",
        "経済": "けいざい",
        "歴史": "れきし",
        "日本語": "にほんご",
        "友達": "ともだち",
        "親友": "しんゆう",
        "同僚": "どうりょう",
        "専攻": "せんこう",
        "千校": "せんこう",
        "千項": "せんこう",
        "先行": "せんこう",
        "選考": "せんこう",
        "線香": "せんこう",
        "閃光": "せんこう",
        "潜行": "せんこう",
        "せんこう": "せんこう",
        "学生": "がくせい",
        "先生": "せんせい",
        "です": "です",
        "ですか": "ですか",
        "はい、": "はい、",
        "いいえ、": "いいえ、",
        "じゃないです": "じゃないです",
        "じゃ、ないです": "じゃ、ないです",
        "ではないです": "ではないです"
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
            box.style.display =
                box.style.display === "none" ? "block" : "none";
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

    // OFF: Japanese word only
    if (hintMode === "off") {
        return `<span class="target-word">${displayWord}</span>`;
    }

    // Vocab Display: Always show vocabulary hints
    if (hintMode === "paren") {
        return `<span class="target-word">${displayWord}</span><span class="vocab-inline">(${hintStr})</span>`;
    }

    // Vocab Hover: Show vocabulary hints on hover
    return `
        <span class="tooltip-wrap">
            <span class="target-word">${displayWord}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}

function initSettingsPanel() {
    const scriptControl =
        document.getElementById("scriptModeControl");

    const hintControl =
        document.getElementById("hintModeControl");

    function updateSegmentedSelection(control, selectedValue) {
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === selectedValue;

            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    // ==========================================
    // Hiragana Only / With漢字
    // ==========================================

    if (scriptControl) {
        updateSegmentedSelection(scriptControl, scriptMode);

        scriptControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !scriptControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["hiragana", "kanji"].includes(nextMode)) return;
            if (nextMode === scriptMode) return;

            scriptMode = nextMode;

            updateSegmentedSelection(scriptControl, scriptMode);
            renderAll();
        });
    }

    // ==========================================
    // OFF / Vocab Hover / Vocab Display
    // ==========================================

    if (hintControl) {
        updateSegmentedSelection(hintControl, hintMode);

        hintControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !hintControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["off", "hover", "paren"].includes(nextMode)) return;
            if (nextMode === hintMode) return;

            hintMode = nextMode;

            updateSegmentedSelection(hintControl, hintMode);
            renderAll();
        });
    }

    // ==========================================
    // Autostop: checked = ON
    // ==========================================

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

    // ==========================================
    // Autoplay: checked = ON
    // ==========================================

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

function renderAll() {
    practice2State.ui ??= {};
    practice2State.generatedKeyIndex = 0;

    stopAllPlayback();
    renderDrill1Section();
    renderDrill2Section();

    function connectRows(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rows = container.querySelectorAll(".drill-row");

        rows.forEach((row, index) => {
            const key = `${containerId}_${index}`;
            const state = practice2State.ui[key] ??= {
                answerMode: null,
                selectedValue: "",
                textVisible: false
            };

            const buttons = Array.from(row.querySelectorAll("button"));
            const yes = buttons.find(button =>
                button.textContent.trim() === "🙆"
            );
            const no = buttons.find(button =>
                button.textContent.trim() === "🙅"
            );
            const textButton = buttons.find(button =>
                button.textContent.startsWith("👀Text") ||
                button.textContent.startsWith("🕶️Hide")
            );
            const select = row.querySelector("select");

            // 再描画前の選択を、元のハンドラーで復元する。
            if (state.answerMode === "yes") yes?.click();
            if (state.answerMode === "no") no?.click();

            if (select && state.selectedValue) {
                select.value = state.selectedValue;
                select.dispatchEvent(new Event("change"));
            }

            if (state.textVisible &&
                textButton && !textButton.disabled) {
                textButton.click();
            }

            // 選択状態を、見た目と独立して保存する。
            if (yes) {
                const original = yes.onclick;
                yes.onclick = event => {
                    state.answerMode =
                        state.answerMode === "yes" ? null : "yes";
                    state.textVisible = false;
                    original?.call(yes, event);
                };
            }

            if (no) {
                const original = no.onclick;
                no.onclick = event => {
                    state.answerMode =
                        state.answerMode === "no" ? null : "no";
                    state.textVisible = false;
                    original?.call(no, event);
                };
            }

            if (select) {
                const original = select.onchange;
                select.onchange = event => {
                    state.selectedValue = select.value;
                    state.textVisible = false;
                    original?.call(select, event);
                };
            }

            if (textButton) {
                const original = textButton.onclick;
                textButton.onclick = event => {
                    state.textVisible = !state.textVisible;
                    original?.call(textButton, event);
                };
            }

            // 通常のモデル再生にも、読み上げ専用の読点を適用。
            buttons.forEach(button => {
                if (!button.textContent.startsWith("🔊きく")) return;

                const original = button.onclick;
                if (!original) return;

                button.onclick = event => {
                    if (activeRecognitionSession ||
                        practice2State.startingRow) return;

                    original.call(button, event);
                };
            });
        });
    }

    connectRows("drill1Container");
    connectRows("drill2Container");

    practice2SyncRecordingUI();
}

function practice2SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession
        || practice2State.startingRow
    );

    practice2State.lockedControls ??= new Map();

    const locked = practice2State.lockedControls;

    const controls = document.querySelectorAll(
        "#drill1Container button, #drill1Container select, " +
        "#drill2Container button, #drill2Container select"
    );

    if (blocked) {
        // 各操作部品の元の有効・無効状態を保存する。
        controls.forEach(control => {
            if (!locked.has(control)) {
                locked.set(
                    control,
                    control.disabled
                );
            }

            control.disabled = true;
        });

        const session = activeRecognitionSession;

        const view = session
            ? practice2State.views?.[session.rowKey]
            : null;

        if (view) {
            const canStop =
                session.manual
                && !session.stopRequested;

            view.stopBtn.disabled = !canStop;

            view.stopBtn.classList.toggle(
                "stop-btn-active",
                canStop
            );
        }

    } else {
        // 終了後は、選択前・選択後それぞれの元の状態へ戻す。
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
            control.disabled
                ? "not-allowed"
                : "pointer",
            "important"
        );
    });
}

function practice2ShowNotice(resultSpan, message) {
    if (!message) return;

    const notice = document.createElement("span");

    notice.textContent = message + " ";
    notice.style.color = "var(--text-secondary)";

    resultSpan.prepend(notice);
}

// ============================================================================
// Render Drill 1 Section
// ============================================================================
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

    const exBox = document.createElement("div");
    exBox.className = "example-box";
    exBox.style.marginTop = "30px";

    const w1 = formatWord("おとうさん", "お父さん", "otōsan", "father");
    const w2 = formatWord("かんごし", "看護師", "kangoshi", "nurse");

    const exQ = scriptMode === "kanji"
        ? "お父さん<strong>は、</strong>看護師<strong>ですか？</strong>"
        : "おとうさん<strong>は、</strong>かんごし<strong>ですか？</strong>";

    const exYes = scriptMode === "kanji"
        ? "<strong>はい、</strong>看護師<strong>です。</strong>"
        : "<strong>はい、</strong>かんごし<strong>です。</strong>";

    const exNo = scriptMode === "kanji"
        ? "<strong>いいえ、</strong>看護師<strong>じゃないです。</strong>"
        : "<strong>いいえ、</strong>かんごし<strong>じゃないです。</strong>";

    exBox.innerHTML = `
        <div class="example-line flex-row-center" style="margin-bottom: 8px;">
            <strong class="example-label-title">Question:</strong>
            ${w1} ／ ${w2}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="ex1Listen" class="example-button">🔊 きく</button>
            <span>${exQ}</span>
        </div>

        <div class="example-line dashed-border flex-row-center" style="padding-top: 10px;">
            <strong class="example-label-title">Response:</strong>
            <button id="exYesListen" class="example-button" style="margin-right: 4px;">🔊 🙆</button>
            <span>${exYes}</span> ／
            <button id="exNoListen" class="example-button" style="margin-left: 4px; margin-right: 4px;">🔊 🙅</button>
            <span>${exNo}</span>
        </div>
    `;

    container.appendChild(exBox);

    document.getElementById("ex1Listen").onclick = () => {
        setPlayingStateMultiple(
            [document.getElementById("ex1Listen")],
            "Playing..."
        );
        speakText("お父さんは、看護師ですか？", 0.9, () => stopAllPlayback());
    };

    document.getElementById("exYesListen").onclick = () => {
        setPlayingStateMultiple(
            [document.getElementById("exYesListen")],
            "Playing..."
        );
        speakText("はい、看護師です。", 0.9, () => stopAllPlayback());
    };

    document.getElementById("exNoListen").onclick = () => {
        setPlayingStateMultiple(
            [document.getElementById("exNoListen")],
            "Playing..."
        );
        speakText("いいえ、看護師じゃないです。", 0.9, () => stopAllPlayback());
    };

    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task1";
    infoPanel.style.marginTop = "25px";

    infoPanel.innerHTML = `
        <span class="info-panel-title">Drill 1: Yes/No Questions</span>
        <span class="info-panel-desc">
            💡 Form a question from the prompts and practice both affirmative and negative responses.
        </span>
    `;

    container.appendChild(infoPanel);

    const listDiv = document.createElement("div");
    listDiv.id = "drill1List";
    container.appendChild(listDiv);

    practice2Data.forEach((item, index) => {
        createPractice2Row(listDiv, `${index + 1}.`, item, index, 0.9);
    });
}

// ============================================================================
// Render Drill 2 Section
// ============================================================================
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

    const exBox = document.createElement("div");
    exBox.className = "example-box";
    exBox.style.marginTop = "40px";

    const wTarget = formatWord("あなた", "あなた", "anata", "you");
    const wMaj = formatWord("せんこう", "専攻", "senkō", "major");

    const exQ2 = scriptMode === "kanji"
        ? "あなた<strong>の</strong>専攻<strong>は、</strong>何<strong>ですか。</strong>"
        : "あなた<strong>の</strong>せんこう<strong>は、</strong>なん<strong>ですか。</strong>";

    const exA2 = scriptMode === "kanji"
        ? "わたし<strong>の</strong>専攻<strong>は、</strong>政治<strong>です。</strong>"
        : "わたし<strong>の</strong>せんこう<strong>は、</strong>せいじ<strong>です。</strong>";

    exBox.innerHTML = `
        <div class="example-line flex-row-center" style="margin-bottom: 8px;">
            <strong class="example-label-title">Question:</strong>
            ${wTarget} ／ ${wMaj}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="ex2QListen" class="example-button">🔊 きく</button>
            <span>${exQ2}</span>
        </div>

        <div class="example-line dashed-border flex-row-center" style="padding-top: 10px;">
            <strong class="example-label-title">Response:</strong>
            <button id="ex2AListen" class="example-button" style="margin-right: 4px;">🔊 きく</button>
            <span>${exA2}</span>
        </div>
    `;

    container.appendChild(exBox);

    document.getElementById("ex2QListen").onclick = () => {
        setPlayingStateMultiple(
            [document.getElementById("ex2QListen")],
            "Playing..."
        );
        speakText("あなたの専攻は何ですか。", 0.9, () => stopAllPlayback());
    };

    document.getElementById("ex2AListen").onclick = () => {
        setPlayingStateMultiple(
            [document.getElementById("ex2AListen")],
            "Playing..."
        );
        speakText("わたしの専攻は、政治です。", 0.9, () => stopAllPlayback());
    };

    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task2";
    infoPanel.style.marginTop = "20px";

    infoPanel.innerHTML = `
        <span class="info-panel-title">Drill 2: Wh- Questions</span>
        <span class="info-panel-desc">
            💡 Ask about majors using Wh- questions. Select your major from the dropdown menu and reply using the possessive form.
        </span>
    `;

    container.appendChild(infoPanel);

    const listDiv = document.createElement("div");
    listDiv.id = "drill2List";
    container.appendChild(listDiv);

    drill2Targets.forEach((target, index) => {
        createDrill2Row(listDiv, `${index + 1}.`, target, 0.9);
    });
}

function createPractice2Row(container, indexLabel, item, rowIndex, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";
    rowDiv.dataset.rowIndex = `p2_drill1_${rowIndex}`;

    const theme = rowColorThemes[rowIndex % rowColorThemes.length];

    const qRow = document.createElement("div");
    qRow.className = "top-row";
    qRow.style.marginBottom = "6px";

    const qListenBtn = document.createElement("button");
    qListenBtn.className = "example-button custom-tip-wrap";
    qListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';

    qListenBtn.onclick = () => {
        setPlayingStateMultiple([qListenBtn], "Playing...");

        const xText = scriptMode === "kanji" ? item.xKanji : item.x;
        const yText = scriptMode === "kanji" ? item.yKanji : item.y;

        speakText(`${xText}は、${yText}ですか？`, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = `${formatWord(item.x, item.xKanji, item.xRomaji, item.xMeaning)} ／ ${formatWord(item.y, item.yKanji, item.yRomaji, item.yMeaning)}`;
    promptSpan.style.minWidth = "220px";

    const qRecordBtn = document.createElement("button");
    qRecordBtn.className = "example-button custom-tip-wrap";
    qRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const qStopBtn = document.createElement("button");
    qStopBtn.className = "example-button custom-tip-wrap";
    qStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    qStopBtn.disabled = true;

    const qResultSpan = document.createElement("span");
    qResultSpan.className = "result-text";
    qResultSpan.textContent = practice2State.audioUrls[`p2_drill1_q_${rowIndex}`]
        ? "(Recorded) ✅"
        : "(Not recorded yet)";

    qResultSpan.style.color = practice2State.audioUrls[`p2_drill1_q_${rowIndex}`]
        ? "var(--text-primary)"
        : "var(--text-secondary)";

    qRow.appendChild(qListenBtn);
    qRow.appendChild(indexSpan);
    qRow.appendChild(promptSpan);
    qRow.appendChild(qRecordBtn);
    qRow.appendChild(qStopBtn);
    qRow.appendChild(qResultSpan);

    if (practice2State.audioUrls[`p2_drill1_q_${rowIndex}`]) {
        appendPersistedPlayButton(qResultSpan, `p2_drill1_q_${rowIndex}`, playRate);
    }

    const aRow = document.createElement("div");
    aRow.className = "top-row";
    aRow.style.paddingLeft = "24px";
    aRow.style.borderTop = "1px dashed var(--border-color)";
    aRow.style.paddingTop = "6px";

    let selectedMode = null;

    const yesBtn = document.createElement("button");
    yesBtn.className = "example-button";
    yesBtn.style.minWidth = "40px";
    yesBtn.innerHTML = "🙆";
    yesBtn.style.backgroundColor = theme.unselected;
    yesBtn.style.fontWeight = "bold";

    const noBtn = document.createElement("button");
    noBtn.className = "example-button";
    noBtn.style.minWidth = "40px";
    noBtn.innerHTML = "🙅";
    noBtn.style.backgroundColor = theme.unselected;
    noBtn.style.fontWeight = "bold";
    noBtn.style.marginLeft = "4px";

    const aListenBtn = document.createElement("button");
    aListenBtn.className = "example-button custom-tip-wrap";
    aListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
    aListenBtn.disabled = true;
    aListenBtn.style.opacity = "0.4";

    const showTextBtn = document.createElement("button");
    showTextBtn.className = "example-button custom-tip-wrap";
    showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
    showTextBtn.disabled = true;
    showTextBtn.style.opacity = "0.4";
    showTextBtn.style.marginLeft = "4px";

    const aPromptLabel = document.createElement("span");
    aPromptLabel.className = "prompt-label";
    aPromptLabel.style.minWidth = "220px";
    aPromptLabel.style.color = "var(--text-secondary)";
    aPromptLabel.textContent = "";

    let isTextVisible = false;

    const aRecordBtn = document.createElement("button");
    aRecordBtn.className = "example-button custom-tip-wrap";
    aRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Choose 🙆 or 🙅.</span>';
    aRecordBtn.disabled = true;

    const aStopBtn = document.createElement("button");
    aStopBtn.className = "example-button custom-tip-wrap";
    aStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    aStopBtn.disabled = true;

    const aResultSpan = document.createElement("span");
    aResultSpan.className = "result-text";
    aResultSpan.textContent = practice2State.audioUrls[`p2_drill1_a_${rowIndex}`]
        ? "(Recorded) ✅"
        : "(Not recorded yet)";

    aResultSpan.style.color = practice2State.audioUrls[`p2_drill1_a_${rowIndex}`]
        ? "var(--text-primary)"
        : "var(--text-secondary)";

    showTextBtn.onclick = () => {
        if (!selectedMode) return;

        isTextVisible = !isTextVisible;
        const wordY = (scriptMode === "kanji") ? item.yKanji : item.y;

        if (isTextVisible) {
            aPromptLabel.style.color = "var(--text-primary)";

            aPromptLabel.innerHTML = selectedMode === "yes"
                ? `はい、${wordY}です。`
                : `いいえ、${wordY}じゃないです。`;

            showTextBtn.innerHTML = '🕶️Hide<span class="custom-tip-box">Hide model answer text.</span>';
        } else {
            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        }
    };

    yesBtn.onclick = () => {
        if (selectedMode === "yes") {
            selectedMode = null;
            isTextVisible = false;

            yesBtn.style.backgroundColor = theme.unselected;
            yesBtn.style.opacity = "1";
            noBtn.style.backgroundColor = theme.unselected;
            noBtn.style.opacity = "1";

            aPromptLabel.textContent = "";
            aListenBtn.disabled = true;
            aListenBtn.style.opacity = "0.4";
            showTextBtn.disabled = true;
            showTextBtn.style.opacity = "0.4";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
            aRecordBtn.disabled = true;

            return;
        }

        selectedMode = "yes";
        isTextVisible = false;

        yesBtn.style.backgroundColor = theme.yesActive;
        yesBtn.style.opacity = "1";
        noBtn.style.backgroundColor = theme.unselected;
        noBtn.style.opacity = "0.55";

        aPromptLabel.textContent = "";
        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        aRecordBtn.disabled = false;
    };

    noBtn.onclick = () => {
        if (selectedMode === "no") {
            selectedMode = null;
            isTextVisible = false;

            noBtn.style.backgroundColor = theme.unselected;
            noBtn.style.opacity = "1";
            yesBtn.style.backgroundColor = theme.unselected;
            yesBtn.style.opacity = "1";

            aPromptLabel.textContent = "";
            aListenBtn.disabled = true;
            aListenBtn.style.opacity = "0.4";
            showTextBtn.disabled = true;
            showTextBtn.style.opacity = "0.4";
            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
            aRecordBtn.disabled = true;

            return;
        }

        selectedMode = "no";
        isTextVisible = false;

        noBtn.style.backgroundColor = theme.noActive;
        noBtn.style.opacity = "1";
        yesBtn.style.backgroundColor = theme.unselected;
        yesBtn.style.opacity = "0.55";

        aPromptLabel.textContent = "";
        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        aRecordBtn.disabled = false;
    };

    aListenBtn.onclick = () => {
        if (!selectedMode) return;

        setPlayingStateMultiple([aListenBtn], "Playing...");

        const wordYKanji = item.yKanji;

        const modelAns = selectedMode === "yes"
            ? `はい、${wordYKanji}です。`
            : `いいえ、${wordYKanji}じゃないです。`;

        speakText(modelAns, playRate, () => stopAllPlayback());
    };

    aRow.appendChild(yesBtn);
    aRow.appendChild(noBtn);
    aRow.appendChild(aListenBtn);
    aRow.appendChild(showTextBtn);
    aRow.appendChild(aPromptLabel);
    aRow.appendChild(aRecordBtn);
    aRow.appendChild(aStopBtn);
    aRow.appendChild(aResultSpan);

    if (practice2State.audioUrls[`p2_drill1_a_${rowIndex}`]) {
        appendPersistedPlayButton(aResultSpan, `p2_drill1_a_${rowIndex}`, playRate);
    }

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";

    const corrListenBtn = document.createElement("button");
    corrListenBtn.className = "example-button";
    corrListenBtn.innerHTML = "🔊 きく";
    corrListenBtn.style.marginRight = "8px";

    const corrTextSpan = document.createElement("span");

    correctionBox.appendChild(corrListenBtn);
    correctionBox.appendChild(corrTextSpan);

    rowDiv.appendChild(qRow);
    rowDiv.appendChild(aRow);
    rowDiv.appendChild(correctionBox);

    bindRecorderEvents(
        qRecordBtn,
        qStopBtn,
        qResultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => scriptMode === "kanji"
            ? `${item.xKanji}は${item.yKanji}ですか`
            : `${item.x}は${item.y}ですか`,
        () => `${item.xKanji}は${item.yKanji}ですか`,
        playRate,
        `p2_drill1_q_${rowIndex}`
    );

    bindRecorderEvents(
        aRecordBtn,
        aStopBtn,
        aResultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => {
            const yWord = scriptMode === "kanji" ? item.yKanji : item.y;

            return selectedMode === "yes"
                ? `はい、${yWord}です。`
                : `いいえ、${yWord}じゃないです。`;
        },
        () => {
            return selectedMode === "yes"
                ? `はい、${item.yKanji}です。`
                : `いいえ、${item.yKanji}じゃないです。`;
        },
        playRate,
        `p2_drill1_a_${rowIndex}`
    );

    container.appendChild(rowDiv);
}

function createDrill2Row(container, indexLabel, target, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const qRow = document.createElement("div");
    qRow.className = "top-row";
    qRow.style.marginBottom = "6px";

    const qListenBtn = document.createElement("button");
    qListenBtn.className = "example-button custom-tip-wrap";
    qListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the question.</span>';

    qListenBtn.onclick = () => {
        setPlayingStateMultiple([qListenBtn], "Playing...");
        speakText(`${target.labelKanji}の専攻は何ですか。`, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";

    const tLabelDisplay = formatWord(
        target.label,
        target.labelKanji,
        target.labelRomaji,
        target.labelMeaning
    );

    const senkouDisplay = formatWord("せんこう", "専攻", "senkō", "major");

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = `${tLabelDisplay} ／ ${senkouDisplay}`;
    promptSpan.style.minWidth = "220px";

    const qRecordBtn = document.createElement("button");
    qRecordBtn.className = "example-button custom-tip-wrap";
    qRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Record your question.</span>';

    const qStopBtn = document.createElement("button");
    qStopBtn.className = "example-button custom-tip-wrap";
    qStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop recording.</span>';
    qStopBtn.disabled = true;

    const qResultSpan = document.createElement("span");
    qResultSpan.className = "result-text";
    qResultSpan.textContent = "(Not recorded yet)";
    qResultSpan.style.color = "var(--text-secondary)";

    qRow.appendChild(qListenBtn);
    qRow.appendChild(indexSpan);
    qRow.appendChild(promptSpan);
    qRow.appendChild(qRecordBtn);
    qRow.appendChild(qStopBtn);
    qRow.appendChild(qResultSpan);

    const aRow = document.createElement("div");
    aRow.className = "top-row";
    aRow.style.paddingLeft = "24px";
    aRow.style.borderTop = "1px dashed var(--border-color)";
    aRow.style.paddingTop = "6px";

    const aPromptPrefix = document.createElement("span");
    aPromptPrefix.className = "prompt-label";
    aPromptPrefix.innerHTML = `${tLabelDisplay} ／ ${senkouDisplay} ／ `;
    aPromptPrefix.style.minWidth = "180px";
    aPromptPrefix.style.marginRight = "2px";

    const selectEl = document.createElement("select");
    selectEl.className = "custom-select custom-tip-wrap";
    selectEl.style.fontSize = "13px";
    selectEl.style.marginLeft = "0px";
    selectEl.style.marginRight = "8px";
    selectEl.innerHTML = '<option value="" disabled selected>📋Select</option>';

    const selectTip = document.createElement("span");
    selectTip.className = "custom-tip-wrap";
    selectTip.style.display = "inline-block";
    selectTip.innerHTML = '<span class="custom-tip-box">Select a major from the list to answer.</span>';
    selectTip.appendChild(selectEl);

    majorsData.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.word;

        const displayMajor = (scriptMode === "kanji") ? m.kanji : m.word;
        opt.textContent = displayMajor;
        opt.title = `${m.romaji}, ${m.meaning}`;

        selectEl.appendChild(opt);
    });

    const aListenBtn = document.createElement("button");
    aListenBtn.className = "example-button custom-tip-wrap";
    aListenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct answer.</span>';
    aListenBtn.disabled = true;
    aListenBtn.style.opacity = "0.4";

    const showTextBtn = document.createElement("button");
    showTextBtn.className = "example-button custom-tip-wrap";
    showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
    showTextBtn.disabled = true;
    showTextBtn.style.opacity = "0.4";
    showTextBtn.style.marginLeft = "4px";

    const aPromptLabel = document.createElement("span");
    aPromptLabel.className = "prompt-label";
    aPromptLabel.style.minWidth = "200px";
    aPromptLabel.style.color = "var(--text-secondary)";
    aPromptLabel.textContent = "";

    let isTextVisible = false;
    let selectedMajor = null;
    let selectedMajorKanji = null;

    const aRecordBtn = document.createElement("button");
    aRecordBtn.className = "example-button custom-tip-wrap";
    aRecordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Select a major first.</span>';
    aRecordBtn.disabled = true;

    const aStopBtn = document.createElement("button");
    aStopBtn.className = "example-button custom-tip-wrap";
    aStopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop recording.</span>';
    aStopBtn.disabled = true;

    const aResultSpan = document.createElement("span");
    aResultSpan.className = "result-text";
    aResultSpan.textContent = "(Not recorded yet)";
    aResultSpan.style.color = "var(--text-secondary)";

    selectEl.onchange = () => {
        selectedMajor = selectEl.value;

        const found = majorsData.find(m => m.word === selectedMajor);
        selectedMajorKanji = found ? found.kanji : selectedMajor;

        isTextVisible = false;

        aListenBtn.disabled = false;
        aListenBtn.style.opacity = "1";
        showTextBtn.disabled = false;
        showTextBtn.style.opacity = "1";
        aRecordBtn.disabled = false;

        aPromptLabel.style.color = "var(--text-secondary)";
        aPromptLabel.textContent = "";

        const tip = aRecordBtn.querySelector(".custom-tip-box");
        if (tip) tip.textContent = "Start recording your voice.";
    };

    showTextBtn.onclick = () => {
        if (!selectedMajor) return;

        isTextVisible = !isTextVisible;

        const poss = (scriptMode === "kanji")
            ? target.possessiveKanji
            : target.possessive;

        const maj = (scriptMode === "kanji")
            ? selectedMajorKanji
            : selectedMajor;

        if (isTextVisible) {
            aPromptLabel.style.color = "var(--text-primary)";
            aPromptLabel.innerHTML = `${poss}専攻は${maj}です。`;

            showTextBtn.innerHTML = '🕶️Hide<span class="custom-tip-box">Hide model answer text.</span>';
        } else {
            aPromptLabel.style.color = "var(--text-secondary)";
            aPromptLabel.textContent = "";

            showTextBtn.innerHTML = '👀Text<span class="custom-tip-box">Text to show.</span>';
        }
    };

    aListenBtn.onclick = () => {
        if (!selectedMajor) return;

        setPlayingStateMultiple([aListenBtn], "Playing...");
        speakText(`${target.possessiveKanji}専攻は${selectedMajorKanji}です。`, playRate, () => stopAllPlayback());
    };

    aRow.appendChild(aPromptPrefix);
    aRow.appendChild(selectTip);
    aRow.appendChild(aListenBtn);
    aRow.appendChild(showTextBtn);
    aRow.appendChild(aPromptLabel);
    aRow.appendChild(aRecordBtn);
    aRow.appendChild(aStopBtn);
    aRow.appendChild(aResultSpan);

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";

    const corrListenBtn = document.createElement("button");
    corrListenBtn.className = "example-button";
    corrListenBtn.innerHTML = "🔊 きく";
    corrListenBtn.style.marginRight = "8px";

    const corrTextSpan = document.createElement("span");

    correctionBox.appendChild(corrListenBtn);
    correctionBox.appendChild(corrTextSpan);

    rowDiv.appendChild(qRow);
    rowDiv.appendChild(aRow);
    rowDiv.appendChild(correctionBox);

    const tLabel = scriptMode === "kanji" ? target.labelKanji : target.label;
    const tLabelKanji = target.labelKanji;
    const poss = scriptMode === "kanji" ? target.possessiveKanji : target.possessive;
    const possKanji = target.possessiveKanji;

    bindRecorderEvents(
        qRecordBtn,
        qStopBtn,
        qResultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => `${tLabel}の専攻は何ですか`,
        () => `${tLabelKanji}の専攻は何ですか`,
        playRate,
        ""
    );

    bindRecorderEvents(
        aRecordBtn,
        aStopBtn,
        aResultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => `${poss}専攻は${scriptMode === "kanji" ? selectedMajorKanji : selectedMajor}です`,
        () => `${possKanji}専攻は${selectedMajorKanji}です`,
        playRate,
        ""
    );

    container.appendChild(rowDiv);
}

// ============================================================================
// Practice 1.2: Result conversion, matching and recording
// ============================================================================

function practice2ToHiragana(text) {
    let value = String(text ?? "").normalize("NFKC");

    // 元の専攻用辞書を含む変換処理を維持する。
    value = convertToHiragana(value);

    // このページの問題データに登録された語句を追加変換する。
    const pairs = [
        ...practice2Data.flatMap(item => [
            [item.xKanji, item.x],
            [item.yKanji, item.y]
        ]),
        ...drill2Targets.flatMap(item => [
            [item.possessiveKanji, item.possessive],
            [item.labelKanji, item.label]
        ]),
        ...majorsData.map(item => [item.kanji, item.word]),
        ["専攻", "せんこう"],
        ["何", "なに"]
    ].sort((a, b) => b[0].length - a[0].length);

    for (const [from, to] of pairs) {
        if (from) value = value.split(from).join(to);
    }

    return value.replace(/[ァ-ヶ]/g, character =>
        String.fromCharCode(character.charCodeAt(0) - 96)
    );
}

function practice2Normalize(text) {
    return practice2ToHiragana(text)
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, "")
        .replace(/(?:よね|よ|ね)$/, "");
}

// 読み上げ専用。表示・判定用の文は変更しない。
function practice2SpeechText(text) {
    return String(text ?? "")
        .replace(/^(はい|いいえ)[、,\s]*/, "$1、")
        .replace(/は(?=[^、])/g, "は、");
}

function practice2ShowResult(view, saved, rowKey, playRate) {
    const displayed = scriptMode === "hiragana"
        ? practice2ToHiragana(saved.rawTranscript)
        : saved.rawTranscript;

    view.resultSpan.textContent =
        displayed + (saved.isCorrect ? " ✅ " : " ");
    view.resultSpan.style.color = saved.isCorrect
        ? "var(--text-primary)"
        : "var(--error-text)";

    if (practice2State.audioUrls[rowKey]) {
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
            if (activeRecognitionSession ||
                practice2State.startingRow) return;

            setPlayingStateMultiple(
                [view.corrListenBtn], "Playing..."
            );
            speakText(
                practice2SpeechText(saved.modelText),
                0.9,
                () => stopAllPlayback()
            );
        };
    }
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
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
            practice2State.startingRow) return;

        const url = practice2State.audioUrls[rowKey];
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
    if (!rowKey) {
        practice2State.generatedKeyIndex ??= 0;

        const index = practice2State.generatedKeyIndex++;
        const targetIndex = Math.floor(index / 2);
        const part = index % 2 === 0 ? "q" : "a";
        const target = drill2Targets[targetIndex];

        rowKey =
            `p2_drill2_${target?.label || targetIndex}_${part}`;
    }

    practice2State.views ??= {};

    const view = {
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan
    };

    practice2State.views[rowKey] = view;

    const currentView = () =>
        practice2State.views[rowKey] || view;

    const saved = practice2State.savedResults[rowKey];

    if (saved?.rawTranscript !== undefined) {
        practice2ShowResult(
            view, saved, rowKey, playRate
        );
    } else if (saved) {
        resultSpan.textContent =
            saved.text ?? saved.html ?? "";

        resultSpan.style.color =
            saved.color || "var(--text-primary)";
    } else {
        resultSpan.textContent = "(Not recorded yet)";
        resultSpan.style.color = "var(--text-secondary)";
    }

    if (practice2State.audioUrls[rowKey]) {
        appendPersistedPlayButton(
            resultSpan, rowKey, playRate
        );
    }

    if (activeRecognitionSession?.rowKey === rowKey) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (practice2State.startingRow === rowKey) {
        resultSpan.textContent = "Preparing microphone...";
    }

    recordBtn.addEventListener("click", async () => {
        if (
            recordBtn.disabled
            || activeRecognitionSession
            || practice2State.startingRow
        ) {
            return;
        }

        const Recognition =
            window.SpeechRecognition
            || window.webkitSpeechRecognition;

        if (!Recognition) {
            practice2ShowNotice(
                currentView().resultSpan,
                "Speech recognition is not supported."
            );
            return;
        }

        // 録音開始時点の選択と設定を固定する。
        const expectedText = getExpectedTextFn();
        const modelText = getExpectedKanjiFn();
        const manual = isManualStop;

        stopAllPlayback();

        practice2State.startingRow = rowKey;
        practice2SyncRecordingUI();

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (error) {
            practice2State.startingRow = null;
            practice2SyncRecordingUI();

            practice2ShowNotice(
                currentView().resultSpan,
                "Microphone access denied."
            );
            return;
        }

        practice2State.startingRow = null;

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
                session.finished
                || !session.recognitionDone
                || !session.recorderDone
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
            practice2SyncRecordingUI();

            // 無音・失敗時は前の録音を置き換えない。
            if (
                !session.discard
                && session.speechStarted
                && session.chunks.length
            ) {
                const blob = new Blob(session.chunks, {
                    type:
                        session.recorder.mimeType
                        || "audio/webm"
                });

                const oldUrl =
                    practice2State.audioUrls[rowKey];

                practice2State.audioUrls[rowKey] =
                    URL.createObjectURL(blob);

                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl);
                }
            }

            session.chunks = [];

            if (
                !session.discard
                && session.transcript.trim()
            ) {
                processResult(
                    session.transcript,
                    expectedText,
                    () => modelText,
                    v.resultSpan,
                    v.correctionBox,
                    v.corrListenBtn,
                    v.corrTextSpan,
                    () => practice2State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

                // 文の一致・不一致とは別の色で停止理由を表示する。
                practice2ShowNotice(
                    v.resultSpan,
                    session.message
                );

            } else {
                const previous =
                    practice2State.savedResults[rowKey];

                if (previous?.rawTranscript !== undefined) {
                    practice2ShowResult(
                        v,
                        previous,
                        rowKey,
                        playRate
                    );
                } else {
                    v.resultSpan.textContent = previous
                        ? previous.text ?? previous.html ?? ""
                        : "";

                    v.resultSpan.style.color =
                        "var(--text-secondary)";

                    v.correctionBox.style.display = "none";

                    if (practice2State.audioUrls[rowKey]) {
                        appendPersistedPlayButton(
                            v.resultSpan,
                            rowKey,
                            playRate
                        );
                    }
                }

                practice2ShowNotice(
                    v.resultSpan,
                    session.message || "No speech recognized."
                );
            }

            practice2SyncRecordingUI();
        }

        function stop(message = "", discard = false) {
            if (
                session.finished
                || session.stopRequested
            ) {
                return;
            }

            session.stopRequested = true;
            session.message = message;

            session.discard =
                discard || !session.speechStarted;

            clearMonitoring();
            practice2SyncRecordingUI();

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

            // 終了通知が届かない場合もマイクを解放する。
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
                        // Manualでは録音を継続する。
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

            const v = currentView();

            v.resultSpan.textContent = "Recording...";
            v.resultSpan.style.color = "var(--accent-color)";
            v.correctionBox.style.display = "none";

            practice2SyncRecordingUI();

            recorder.start();
            recognition.start();

            try {
                const AudioContextClass =
                    window.AudioContext
                    || window.webkitAudioContext;

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

                session.timers.push(
                    setInterval(() => {
                        if (
                            session.stopRequested
                            || session.speechStarted
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

                        soundFrames = volume > 0.015
                            ? soundFrames + 1
                            : 0;

                        if (soundFrames >= 3) {
                            session.speechStarted = true;
                        }
                    }, 100)
                );

            } catch (error) {}

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
                        "Auto-stopped after 20 seconds."
                    );
                }, 20000)
            );

        } catch (error) {
            session.recognitionDone = true;
            stop("Could not start recording.", true);
        }
    });

    stopBtn.addEventListener("click", () => {
        const session = activeRecognitionSession;

        if (session?.rowKey === rowKey) {
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
    const normalized = practice2Normalize(transcript);

    const isCorrect = normalized.length > 0 && (
        normalized === practice2Normalize(expectedText) ||
        normalized === practice2Normalize(modelText)
    );

    const saved = {
        rawTranscript: transcript,
        expectedText,
        modelText,
        isCorrect
    };
    practice2State.savedResults[rowKey] = saved;

    practice2ShowResult(
        {
            resultSpan, correctionBox,
            corrListenBtn, corrTextSpan
        },
        saved,
        rowKey,
        playRate
    );

    if (isAutoPlay) {
        speakText(
            practice2SpeechText(modelText),
            playRate,
            () => {
                if (activeRecognitionSession ||
                    practice2State.startingRow) return;

                stopAllPlayback();
                const url = getUrlFn();
                if (!url) return;

                const audio = new Audio(url);
                currentPlayingAudio = audio;
                audio.playbackRate = 1.0;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(() => stopAllPlayback());
            }
        );
    }
}
