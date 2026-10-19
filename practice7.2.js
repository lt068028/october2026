// ============================================================================
// Practice 7.2: ているform② Present State
// ============================================================================

const practice7Data = [
    {
        x: "よる10じ",
        xKanji: "夜10時",
        xRomaji: "yoru jū-ji",
        xMeaning: "10 o'clock at night",
        y: "ねる",
        yKanji: "寝る",
        yRomaji: "neru",
        yMeaning: "to sleep / go to bed",
        pastSentence: "夜10時に寝ました。",
        pastSentenceHira: "よる10じに、ねました。",
        perfectSentence: "夜10時から寝ています。",
        perfectSentenceHira: "よる10じから、ねています。"
    },
    {
        x: "さっき",
        xKanji: "さっき",
        xRomaji: "sakki",
        xMeaning: "a little while ago",
        y: "Tシャツをきる",
        yKanji: "Tシャツを着る",
        yRomaji: "tīshatsu o kiru",
        yMeaning: "to put on / wear a T-shirt",
        pastSentence: "さっきTシャツを着ました。",
        pastSentenceHira: "さっきTしゃつを、きました。",
        perfectSentence: "さっきからTシャツを着ています。",
        perfectSentenceHira: "さっきから、Tしゃつを、きています。"
    },
    {
        x: "おしょうがつ",
        xKanji: "お正月",
        xRomaji: "oshōgatsu",
        xMeaning: "New Year",
        y: "ふとる",
        yKanji: "太る",
        yRomaji: "futoru",
        yMeaning: "to gain weight",
        pastSentence: "お正月に太りました。",
        pastSentenceHira: "おしょうがつに、ふとりました。",
        perfectSentence: "お正月から太っています。",
        perfectSentenceHira: "おしょうがつから、ふとっています。"
    },
    {
        x: "なつやすみ",
        xKanji: "夏休み",
        xRomaji: "natsuyasumi",
        xMeaning: "summer vacation",
        y: "やせる",
        yKanji: "やせる",
        yRomaji: "yaseru",
        yMeaning: "to lose weight",
        pastSentence: "夏休みにやせました。",
        pastSentenceHira: "なつやすみに、やせました。",
        perfectSentence: "夏休みからやせています。",
        perfectSentenceHira: "なつやすみから、やせています。"
    },
    {
        x: "3ねんまえ",
        xKanji: "3年前",
        xRomaji: "san-nen mae",
        xMeaning: "three years ago",
        y: "けっこんする",
        yKanji: "結婚する",
        yRomaji: "kekkon suru",
        yMeaning: "to get married",
        pastSentence: "3年前に結婚しました。",
        pastSentenceHira: "3ねんまえに、けっこんしました。",
        perfectSentence: "3年前から結婚しています。",
        perfectSentenceHira: "3ねんまえから、けっこんしています。"
    },
    {
        x: "かんじ50こ",
        xKanji: "漢字50個",
        xRomaji: "kanji gojūkko",
        xMeaning: "50 kanji characters",
        y: "おぼえる",
        yKanji: "覚える",
        yRomaji: "oboeru",
        yMeaning: "to memorize / remember",
        pastSentence: "漢字を50個覚えました。",
        pastSentenceHira: "かんじを50こ、おぼえました。",
        perfectSentence: "漢字を50個覚えています。",
        perfectSentenceHira: "かんじを50こ、おぼえています。"
    },
    {
        x: "ているForm",
        xKanji: "ているForm",
        xRomaji: "te iru form",
        xMeaning: "the te-iru form",
        y: "しる",
        yKanji: "知る",
        yRomaji: "shiru",
        yMeaning: "to learn of / know",
        pastSentence: "ているフォームを知りました。",
        pastSentenceHira: "ているふぉーむを、しりました。",
        perfectSentence: "ているフォームを知っています。",
        perfectSentenceHira: "ているふぉーむを、しっています。"
    }
];

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "kanji"; // デフォルトはWith漢字
let isAutoPlay = true;
let activeRecognitionSession = null;

const practice7State = {
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

function speakText(text, rate = 0.9, onEndCallback) {
    setupPreferredVoice();

    // 読み上げ専用。表示文・判定文には反映しない。
    const speechText = String(text ?? "")
        .replace(/朝5時に(?=起き)/g, "朝5時に、")
        .replace(/朝5時から(?=起き)/g, "朝5時から、")
        .replace(/夜10時に(?=寝)/g, "夜10時に、")
        .replace(/夜10時から(?=寝)/g, "夜10時から、")
        .replace(/さっきから(?=Tシャツ)/g, "さっきから、")
        .replace(/さっき(?=Tシャツ)/g, "さっき、")
        .replace(/お正月に(?=太)/g, "お正月に、")
        .replace(/お正月から(?=太)/g, "お正月から、")
        .replace(/夏休みに(?=やせ)/g, "夏休みに、")
        .replace(/夏休みから(?=やせ)/g, "夏休みから、")
        .replace(/漢字を50個(?=覚え)/g, "漢字を50個、")
        .replace(/3年前に(?=結婚)/g, "3年前に、")
        .replace(/3年前から(?=結婚)/g, "3年前から、")
        .replace(/ているフォームを(?=知)/g, "ているフォームを、");

    const utterance = new SpeechSynthesisUtterance(speechText);
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

function renderAll() {
    let style = document.getElementById("practice7KaraStyle");

    if (!style) {
        style = document.createElement("style");
        style.id = "practice7KaraStyle";
        document.head.appendChild(style);
    }

    style.textContent = `
        #drill1Container .grammar-highlight {
color: #CA8A04;
font-weight: bold;
        }

        @media (prefers-color-scheme: dark) {
            #drill1Container .grammar-highlight {
                color: #FBBF24;
            }
        }
    `;

    renderDrill1Section();

    const container = document.getElementById("drill1Container");
    if (!container) return;

    const instruction = container.querySelector(".info-panel-desc");
    if (instruction) {
        instruction.innerHTML = `
            💡 Compare a past action with the state that continues now.
            Use <strong class="grammar-highlight">から</strong>
            after a time expression to show when that state began.
        `;
    }

    container.querySelectorAll(".example-box strong").forEach(element => {
        const text = element.textContent;
        const grammar = text.replace(/。$/, "");

        if (["から", "ました", "ています"].includes(grammar)) {
            const highlighted = document.createElement("strong");
            highlighted.className = "grammar-highlight";
            highlighted.textContent = grammar;

            element.replaceWith(
                highlighted,
                document.createTextNode(text.endsWith("。") ? "。" : "")
            );
        }
    });
}

// ============================================================================
// Render Drill 1 Section (Past & Present State Practice)
// ============================================================================
function renderDrill1Section() {
    let container = document.getElementById("drill1Container");

    if (!container) {
        container = document.createElement("div");
        container.id = "drill1Container";
        document.body.insertBefore(
            container,
            document.querySelector(".voice-guide-footer")
        );
    }

    container.innerHTML = "";

    const exBox = document.createElement("div");
    exBox.className = "example-box";
    exBox.style.marginTop = "30px";

    const w1 = formatWord(
        "あさ5じ", "朝5時", "asa go-ji",
        "5 o'clock in the morning"
    );
    const w2 = formatWord(
        "おきる", "起きる", "okiru",
        "to wake up / get up"
    );
    const verbStem = scriptMode === "kanji" ? "起き" : "おき";

    exBox.innerHTML = `
        <div class="example-line flex-row-center"
             style="margin-bottom: 8px;">
            <strong class="example-label-title"
                    style="min-width: 130px;">Past Tense:</strong>
            ${w1} ／ ${w2}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="exPastListen" type="button"
                    class="example-button">🔊きく</button>
            <span style="display:inline-block; padding:4px 8px;
                         margin:0 6px; border-radius:4px;
                         background:#bae6fd; color:#0369a1;
                         font-size:13px; font-weight:bold;">⏪Past</span>
            <span>${w1}に${verbStem}<strong>ました。</strong></span>
        </div>

        <div class="example-line dashed-border flex-row-center"
             style="padding-top: 10px;">
            <strong class="example-label-title"
                    style="min-width: 130px;">Present State:</strong>
            ${w1} ／ ${w2}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="exPerfListen" type="button"
                    class="example-button">🔊きく</button>
            <span style="display:inline-block; padding:4px 8px;
                         margin:0 6px; border-radius:4px;
                         background:#dcfce7; color:#15803d;
                         font-size:13px; font-weight:bold;">⏳Present State</span>
            <span>${w1}<strong>から</strong>${verbStem}<strong>ています。</strong></span>
        </div>
    `;

    container.appendChild(exBox);

    const pastListen = document.getElementById("exPastListen");
    const perfectListen = document.getElementById("exPerfListen");

    pastListen.onclick = () => {
        setPlayingStateMultiple([pastListen], "Playing...");
        speakText("朝5時に起きました。", 0.9, () => stopAllPlayback());
    };

    perfectListen.onclick = () => {
        setPlayingStateMultiple([perfectListen], "Playing...");
        speakText("朝5時から起きています。", 0.9, () => stopAllPlayback());
    };

    const infoPanel = document.createElement("div");
    infoPanel.className = "info-panel info-panel-task1";
    infoPanel.style.marginTop = "25px";
    infoPanel.innerHTML = `
        <span class="info-panel-title">
            Drill 1: Compare Past & Present State
        </span>
        <span class="info-panel-desc">
            💡 Compare past actions with ongoing states using ているform.
        </span>
    `;
    container.appendChild(infoPanel);

    const listDiv = document.createElement("div");
    listDiv.id = "drill1List";
    container.appendChild(listDiv);

    practice7Data.forEach((item, index) => {
        createPractice7TableCard(
            listDiv, `${index + 1}.`, item, index, 0.9
        );
    });
}

function createPractice7TableCard(container, indexLabel, item, rowIndex, playRate) {
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
    pastLabel.innerHTML = "⏪Past";

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
    listenBtn2.innerHTML = '🔊きく<span class="custom-tip-box">Listen to Present State.</span>';

    const perfLabel = document.createElement("span");
    perfLabel.style.fontWeight = "bold";
    perfLabel.style.display = "inline-block";
    perfLabel.style.padding = "4px 8px";
    perfLabel.style.margin = "0 6px";
    perfLabel.style.borderRadius = "4px";
    perfLabel.style.backgroundColor = "#dcfce7";
    perfLabel.style.color = "#15803d";
    perfLabel.style.fontSize = "13px";
    perfLabel.innerHTML = "⏳Present State";

    const recordBtn2 = document.createElement("button");
    recordBtn2.className = "example-button custom-tip-wrap";
    recordBtn2.innerHTML = '⏺️とる<span class="custom-tip-box">Record Present State.</span>';

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
    // 「覚える」「知る」専用の意味変化メモ。
    const meaningNotes = {
        "覚える": {
            kanji: ["覚えました", "覚えています"],
            hiragana: ["おぼえました", "おぼえています"],
            english: ["memorized", "remember"]
        },
        "知る": {
            kanji: ["知りました", "知っています"],
            hiragana: ["しりました", "しっています"],
            english: ["learned", "know"]
        }
    };

    // 保存された録音ファイルの有無で表示を更新する。
    practice7State.refreshMeaningNotes = () => {
        document.querySelectorAll(
            "#drill1Container .meaning-change-row"
        ).forEach(row => {
            row.hidden = !(
                practice7State.audioUrls[row.dataset.pastKey] ||
                practice7State.audioUrls[row.dataset.perfectKey]
            );
        });
    };

    const meaningNote = meaningNotes[item.yKanji];

    if (meaningNote) {
        let noteStyle = document.getElementById(
            "practice7MeaningNoteStyle"
        );

        if (!noteStyle) {
            noteStyle = document.createElement("style");
            noteStyle.id = "practice7MeaningNoteStyle";
            document.head.appendChild(noteStyle);
        }

        noteStyle.textContent = `
            #drill1Container .meaning-change-row[hidden] {
                display: none;
            }

            #drill1Container .meaning-change-note {
                padding-top: 10px;
                padding-bottom: 4px;
                font-size: 14px;
                line-height: 1.6;
            }

            #drill1Container .meaning-change-note-title {
                color: var(--text-primary);
                font-size: 12px;
                font-weight: normal;
            }

            #drill1Container .meaning-change-comparison {
                color: #7C3AED;
                font-weight: bold;
            }

            @media (prefers-color-scheme: dark) {
                #drill1Container .meaning-change-comparison {
                    color: #C084FC;
                }
            }
        `;

        const forms = scriptMode === "hiragana"
            ? meaningNote.hiragana
            : meaningNote.kanji;

        const pastKey = `p7_drill_past_${rowIndex}`;
        const perfectKey = `p7_drill_perf_${rowIndex}`;

        const noteRow = document.createElement("tr");
        noteRow.className = "meaning-change-row";
        noteRow.dataset.pastKey = pastKey;
        noteRow.dataset.perfectKey = perfectKey;

        noteRow.hidden = !(
            practice7State.audioUrls[pastKey] ||
            practice7State.audioUrls[perfectKey]
        );

        const spacer = document.createElement("td");
        spacer.colSpan = 2;

        const noteCell = document.createElement("td");
        noteCell.className = "meaning-change-note";

        const title = document.createElement("div");
        title.className = "meaning-change-note-title";
        title.textContent = "✨ Notice the meaning change:";

        const comparison = document.createElement("strong");
        comparison.className = "meaning-change-comparison";
        comparison.textContent =
            `${forms[0]} = ${meaningNote.english[0]} / ` +
            `${forms[1]} = ${meaningNote.english[1]}`;

        noteCell.appendChild(title);
        noteCell.appendChild(comparison);
        noteRow.appendChild(spacer);
        noteRow.appendChild(noteCell);
        table.appendChild(noteRow);
    }
    cardDiv.appendChild(table);
    cardDiv.appendChild(correctionBox1);
    cardDiv.appendChild(correctionBox2);
    container.appendChild(cardDiv);
}

// ============================================================================
// Practice 7.2: Recognition, Recording & Result Display
// ============================================================================

// 実際の認識結果を、このページで扱う語句の範囲で変換する。
// モデル文そのものへの置き換えは行わない。
function practice7ToHiragana(text) {
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

function practice7Normalize(text) {
    return practice7ToHiragana(text)
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, "")
        .replace(/(?:よね|よ|ね)$/, "")
        .replace(
            /^(おしょうがつ|なつやすみ|3ねんまえ)に/,
            "$1"
        );
}

function practice7DiffTokens(text) {
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

        const reading = practice7ToHiragana(unit)
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

function practice7FindDiff(actual, reference) {
    const a = practice7DiffTokens(actual);
    const b = practice7DiffTokens(reference);

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


    return {
        cost: costs[rows][columns],
        chars: a.chars,
        redIndexes,
        gaps
    };
}

function practice7ShowResult(view, saved, rowKey, playRate) {
    // 設定変更による再描画では、録音時の判定を保持する。
    if (typeof saved.isCorrect !== "boolean") {
        const normalized = practice7Normalize(
            saved.rawTranscript
        );

        saved.isCorrect = normalized.length > 0 && [
            saved.expectedText,
            saved.modelText
        ].some(text =>
            typeof text === "string" &&
            text.length > 0 &&
            normalized === practice7Normalize(text)
        );
    }
    const displayed = scriptMode === "hiragana"
        ? practice7ToHiragana(saved.rawTranscript)
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
                    practice7ToHiragana(text)
                ])
        )];

        let best = null;

        for (const reference of references) {
            const diff = practice7FindDiff(
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

    if (practice7State.audioUrls[rowKey]) {
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
                practice7State.startingRow
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
function practice7SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession || practice7State.startingRow
    );

    practice7State.lockedControls ??= new Map();
    const locked = practice7State.lockedControls;

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
            ? practice7State.views?.[session.rowKey]
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

function practice7ShowNotice(resultSpan, message) {
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
    practice7State.views ??= {};

    const view = {
        recordBtn, stopBtn, resultSpan,
        correctionBox, corrListenBtn, corrTextSpan
    };

    practice7State.views[rowKey] = view;

    const currentView = () =>
        practice7State.views[rowKey] || view;

    const restoreResult = message => {
        const v = currentView();
        const saved = practice7State.savedResults[rowKey];

        if (saved?.rawTranscript !== undefined) {
            practice7ShowResult(
                v, saved, rowKey, playRate
            );
        } else {
            v.resultSpan.textContent =
                saved?.text || "(Not recorded yet)";
            v.resultSpan.style.color =
                "var(--text-secondary)";
            v.correctionBox.style.display = "none";

            if (practice7State.audioUrls[rowKey]) {
                appendPersistedPlayButton(
                    v.resultSpan, rowKey, playRate
                );
            }
        }

        practice7ShowNotice(v.resultSpan, message);
    };

    restoreResult("");

    if (activeRecognitionSession?.rowKey === rowKey) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (practice7State.startingRow === rowKey) {
        resultSpan.textContent = "Preparing microphone...";
    }

    // 再描画後の新しいボタンにも録音中の制御を適用する。
    queueMicrotask(practice7SyncRecordingUI);

    recordBtn.addEventListener("click", async () => {
        if (
            recordBtn.disabled ||
            activeRecognitionSession ||
            practice7State.startingRow
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
        practice7State.startingRow = rowKey;
        practice7SyncRecordingUI();

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (error) {
            practice7State.startingRow = null;
            practice7SyncRecordingUI();
            restoreResult("Microphone access denied.");
            practice7SyncRecordingUI();
            return;
        }

        practice7State.startingRow = null;

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

            practice7SyncRecordingUI();

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
                    practice7State.audioUrls[rowKey];

                practice7State.audioUrls[rowKey] = newUrl;

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
                    () => practice7State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

                practice7ShowNotice(
                    v.resultSpan,
                    session.message
                );
            } else {
                restoreResult(
                    session.message || "No speech recognized."
                );
            }

            practice7SyncRecordingUI();
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
            practice7SyncRecordingUI();

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

            practice7SyncRecordingUI();

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
    const normalized = practice7Normalize(transcript);

    const isCorrect = normalized.length > 0 && (
        normalized === practice7Normalize(expectedText) ||
        normalized === practice7Normalize(modelText)
    );

    const saved = {
        rawTranscript: transcript,
        modelText,
        expectedText,
        isCorrect
    };
    practice7State.savedResults[rowKey] = saved;

    practice7ShowResult(
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
                practice7State.startingRow) return;

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
        practice7State.refreshMeaningNotes?.();
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
            practice7State.startingRow) return;

        const url = practice7State.audioUrls[rowKey];
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
// Practice 7.2: Drill 2 — Practice with English cues
// ============================================================================

(() => {
    let englishCuesEnabled = false;
    let previousHintMode = hintMode;

    const englishCues = {
        "寝る": ["22:00", "go to bed"],
        "太る": ["New Year", "gain weight"],
        "やせる": ["summer vacation", "lose weight"],
        "結婚する": ["3 years ago", "get married"],
        "Tシャツを着る": ["earlier", "put on a T-shirt"],
        "覚える": ["kanji", "50", "memorize"],
        "知る": ["ているForm", "learn of"]
    };

    // 「着る」を5番に移動。初回描画前に実行する。
    const shirtIndex = practice7Data.findIndex(
        item => item.yKanji === "Tシャツを着る"
    );

    if (shirtIndex !== -1 && shirtIndex !== 4) {
        const [shirtItem] = practice7Data.splice(shirtIndex, 1);
        practice7Data.splice(4, 0, shirtItem);
    }

    const originalRenderAll = renderAll;
    const originalSyncRecordingUI = practice7SyncRecordingUI;

    function installStyles() {
        if (document.getElementById("practice7EnglishCueStyle")) return;

        const style = document.createElement("style");
        style.id = "practice7EnglishCueStyle";
        style.textContent = `
            #practice7Drill2Panel.p7-copy-layout {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 24px;
            }

            #practice7Drill2Panel.p7-copy-layout .p7-drill2-copy {
                display: flex;
                flex-direction: column;
                gap: 5px;
                flex: 1;
                min-width: 0;
            }

            #practice7Drill2Panel.p7-copy-layout .drill-cue-title,
            #practice7Drill2Panel.p7-copy-layout .drill-cue-description {
                display: block;
                margin: 0;
            }

            #practice7Drill2Panel.p7-copy-layout > .drill-cue-button {
                flex: 0 0 auto;
                width: auto;
                min-width: 190px;
            }

            @media (max-width: 600px) {
                #practice7Drill2Panel.p7-copy-layout {
                    flex-direction: column;
                    align-items: stretch;
                }

                #practice7Drill2Panel.p7-copy-layout > .drill-cue-button {
                    width: 100%;
                    min-width: 0;
                }
            }            #drill1Container .p7-english-cue {
                overflow-wrap: anywhere;
            }

            #drill1Container .p7-example-cue {
                margin-bottom: 12px;
                font-weight: bold;
            }

            #drill1Container .p7-underlined-cue {
                text-decoration: underline;
                text-underline-offset: 4px;
                font-weight: bold;
            }

            #drill1Container .p7-shirt-note[hidden] {
                display: none;
            }

            #drill1Container .p7-shirt-note td {
                padding-top: 10px;
                padding-bottom: 4px;
                font-size: 14px;
                line-height: 1.6;
            }

            #drill1Container .p7-shirt-note small {
                display: block;
                color: var(--text-primary);
                font-size: 12px;
                font-weight: normal;
            }

            #drill1Container .p7-shirt-note strong {
                color: #7c3aed;
                font-weight: bold;
            }

            @media (prefers-color-scheme: dark) {
                #drill1Container .p7-shirt-note strong {
                    color: #c084fc;
                }
            }
        `;

        document.head.appendChild(style);
    }
    function updateHintControl() {
        const control = document.getElementById("hintModeControl");
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === hintMode;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }
    function updateExample(container) {
        if (!englishCuesEnabled) return;

        const example = container.querySelector(".example-box");
        if (!example) return;

        example.querySelectorAll(".example-line").forEach((line, index) => {
            // 元の日本語キューを、同じ位置で英語に変更する。
            line.querySelectorAll(".target-word").forEach((word, wordIndex) => {
                word.textContent = wordIndex === 0 ? "05:00" : "get up";
                word.classList.add("p7-underlined-cue");
            });

            // ボタン・Past／Perfectラベルの位置は変更しない。
            const sentence = line.lastElementChild;
            if (!sentence || sentence.tagName !== "SPAN") return;

            sentence.innerHTML = index === 0
                ? '<span class="p7-underlined-cue">05:00</span> に ' +
                  '<span class="p7-underlined-cue">get up</span> ' +
                  '<strong class="grammar-highlight">ました</strong>。'
                : '<span class="p7-underlined-cue">05:00</span> ' +
                  '<strong class="grammar-highlight">から</strong> ' +
                  '<span class="p7-underlined-cue">get up</span> ' +
                  '<strong class="grammar-highlight">ています</strong>。';        });
    }
    function updatePracticeCues(container) {
        if (!englishCuesEnabled) return;

        container.querySelectorAll(
            "#drill1List .prompt-label"
        ).forEach((prompt, index) => {
            const item = practice7Data[index];
            const parts = englishCues[item?.yKanji];
            if (!parts) return;

            const cue = document.createElement("strong");
            cue.className = "p7-english-cue";
            cue.textContent = parts.join(" ／ ");
            prompt.replaceChildren(cue);
        });
    }

    function addShirtMeaningNote(container) {
        const rowIndex = practice7Data.findIndex(
            item => item.yKanji === "Tシャツを着る"
        );

        const cards = container.querySelectorAll("#drill1List .drill-row");
        const table = cards[rowIndex]?.querySelector("table");
        if (!table) return;

        // 既存コードで追加済みの場合は重複させない。
        if (table.querySelector(".meaning-change-row")) return;

        const pastKey = `p7_drill_past_${rowIndex}`;
        const perfectKey = `p7_drill_perf_${rowIndex}`;

        const row = document.createElement("tr");
        row.className = "meaning-change-row p7-shirt-note";
        row.dataset.pastKey = pastKey;
        row.dataset.perfectKey = perfectKey;
        row.hidden = !(
            practice7State.audioUrls[pastKey] ||
            practice7State.audioUrls[perfectKey]
        );

        const spacer = document.createElement("td");
        spacer.colSpan = 2;

        const cell = document.createElement("td");
        cell.className = "meaning-change-note";

        const title = document.createElement("small");
        title.textContent = "✨ Notice the meaning change:";

        const comparison = document.createElement("strong");
        comparison.className = "meaning-change-comparison";
        comparison.textContent = scriptMode === "hiragana"
            ? "きました = put on / きています = am wearing"
            : "着ました = put on / 着ています = am wearing";

        cell.append(title, comparison);
        row.append(spacer, cell);
        (table.tBodies[0] || table).appendChild(row);
    }

    function addDrill2Panel(container) {
        const panel = document.createElement("section");
        panel.id = "practice7Drill2Panel";
        panel.className = "info-panel info-panel-task1 drill-cue-panel";
        panel.setAttribute("aria-labelledby", "practice7Drill2Title");

        const title = document.createElement("span");
        title.id = "practice7Drill2Title";
        title.className = "info-panel-title drill-cue-title";
        title.textContent = "Drill 2: Practice with English cues";

        const description = document.createElement("span");
        description.className = "info-panel-desc drill-cue-description";
        description.textContent =
            "💡 Practise making sentences with this lesson’s vocabulary, using English cues.";

        const button = document.createElement("button");
        button.id = "practice7EnglishCueButton";
        button.type = "button";
        button.className = "drill-cue-button";
        button.classList.toggle("is-english", englishCuesEnabled);
        button.setAttribute("aria-pressed", String(englishCuesEnabled));
        button.textContent = englishCuesEnabled
            ? "Display Japanese cues"
            : "Display English cues";

        button.addEventListener("click", () => {
            if (activeRecognitionSession || practice7State.startingRow) {
                return;
            }

            stopAllPlayback();

            if (!englishCuesEnabled) {
                previousHintMode = hintMode;
                englishCuesEnabled = true;
                hintMode = "off";
            } else {
                englishCuesEnabled = false;
                hintMode = previousHintMode;
            }

            // キュー変更でも抽出文・判定・録音音声を保持する。
            
            updateHintControl();
            renderAll();

            requestAnimationFrame(() => {
                const example = document.querySelector(
                    "#drill1Container .example-box"
                );
                if (!example) return;

                const computed = getComputedStyle(example);
                const fontSize = parseFloat(computed.fontSize) || 16;
                const lineHeight =
                    parseFloat(computed.lineHeight) || fontSize * 1.5;

                const top =
                    window.scrollY +
                    example.getBoundingClientRect().top -
                    lineHeight;

                window.scrollTo({
                    top: Math.max(0, top),
                    behavior: "smooth"
                });
            });
        });

        panel.classList.add("p7-copy-layout");

        const copy = document.createElement("div");
        copy.className = "p7-drill2-copy";
        copy.append(title, description);

        panel.append(copy, button);
        container.appendChild(panel);
    }
    renderAll = function () {
        originalRenderAll();

        const container = document.getElementById("drill1Container");
        if (!container) return;

        installStyles();
        updateExample(container);
        updatePracticeCues(container);

        // 最長キューの幅に、全行のキュー列を揃える。
        const cueCells = Array.from(
            container.querySelectorAll("#drill1List .prompt-label")
        );

        let cueWidth = 0;

        cueCells.forEach(cell => {
            const measure = document.createElement("span");
            measure.innerHTML = cell.innerHTML;

            Object.assign(measure.style, {
                position: "absolute",
                visibility: "hidden",
                display: "inline-block",
                width: "max-content",
                maxWidth: "none",
                whiteSpace: "nowrap",
                font: "inherit",
                pointerEvents: "none"
            });

            cell.appendChild(measure);

            cueWidth = Math.max(
                cueWidth,
                Math.ceil(measure.getBoundingClientRect().width)
            );

            measure.remove();
        });

        cueCells.forEach(cell => {
            cell.style.setProperty("width", `${cueWidth}px`, "important");
            cell.style.setProperty("padding-right", "4px", "important");
            cell.style.setProperty("white-space", "nowrap", "important");
        });

        addShirtMeaningNote(container);
        addDrill2Panel(container);
        practice7State.refreshMeaningNotes?.();
        practice7SyncRecordingUI();
    };

    practice7SyncRecordingUI = function () {
        originalSyncRecordingUI();

        const button = document.getElementById(
            "practice7EnglishCueButton"
        );

        if (button) {
            button.disabled = Boolean(
                activeRecognitionSession ||
                practice7State.startingRow
            );
        }
    };
})();

// 共通設定：Formal / Informal / Casual
(() => {
    let speechStyle = 'formal';

    const fields = [
        'pastSentence',
        'pastSentenceHira',
        'perfectSentence',
        'perfectSentenceHira'
    ];

    const originals = practice7Data.map(item =>
        Object.fromEntries(
            fields.map(key => [key, item[key]])
        )
    );

    function convert(text) {
        if (speechStyle === 'formal') return text;

        let value = String(text);

        const endings = [
            ['寝ました', '寝た'],
            ['ねました', 'ねた'],
            ['着ました', '着た'],
            ['きました', 'きた'],
            ['太りました', '太った'],
            ['ふとりました', 'ふとった'],
            ['やせました', 'やせた'],
            ['結婚しました', '結婚した'],
            ['けっこんしました', 'けっこんした'],
            ['覚えました', '覚えた'],
            ['おぼえました', 'おぼえた'],
            ['知りました', '知った'],
            ['しりました', 'しった'],
            ['起きました', '起きた'],
            ['おきました', 'おきた']
        ];

        endings.forEach(([from, to]) => {
            value = value.replace(from, to);
        });

        // 文末の活用だけを変える。
        value = value.replace(
            /ています(?=[。．.!！]?$)/g,
            'ている'
        );

        if (speechStyle === 'casual') {
            value = value
                .replace(
                    /ている(?=[。．.!！]?$)/g,
                    'てる'
                )
                .replace(/を/g, '');

            return value.replace(/。$/, 'よ。');
        }

        // Informalには終助詞を付けない。
        return value;
    }

    function blocked() {
        return Boolean(
            activeRecognitionSession ||
            practice7State.startingRow
        );
    }

    function syncStyleButtons() {
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
    }

    function installSettings() {
        const anchor = document.getElementById(
            'scriptModeControl'
        )?.closest('.control-item');

        if (!anchor) return;

        let item = document.getElementById(
            'speechStyleControl'
        )?.closest('.control-item');

        if (!item) {
            item = document.createElement('div');
            item.className =
                'control-item speech-style-item';

            const control = document.createElement('div');
            control.id = 'speechStyleControl';
            control.className = 'segmented-control';
            control.setAttribute('role', 'group');
            control.setAttribute(
                'aria-label',
                'Speech style'
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
                const button =
                    document.createElement('button');

                button.type = 'button';
                button.className =
                    'segmented-option custom-tip-wrap';
                button.dataset.value = value;
                button.append(
                    document.createTextNode(label)
                );

                const tip = document.createElement('span');
                tip.className = 'custom-tip-box';
                tip.textContent = description;
                button.append(tip);

                button.onclick = () => {
                    if (
                        blocked() ||
                        speechStyle === value
                    ) return;

                    stopAllPlayback();
                    speechStyle = value;
                    renderAll();
                };

                control.append(button);
            });

            item.append(control);
        }

        anchor.after(item);

        const labels = {
            hover: '💬Hover',
            paren: '🔡Display',
            off: 'OFF'
        };

        document.querySelectorAll(
            '#hintModeControl button[data-value]'
        ).forEach(button => {
            const label = labels[button.dataset.value];
            if (!label) return;

            const tip = button.querySelector(
                '.custom-tip-box'
            );

            button.replaceChildren(
                document.createTextNode(label)
            );

            if (tip) button.append(tip);
        });

        syncStyleButtons();
    }

    function updateLayout() {
        document.querySelectorAll(
            '#drill1List .result-text'
        ).forEach(result => {
            const cell = result.closest('td');

            if (
                !cell ||
                cell.querySelector('.recording-controls')
            ) return;

            const wrap = result.parentElement;
            wrap.classList.add('recording-result');

            const layout = document.createElement('div');
            layout.className = 'recording-controls';

            const actions = document.createElement('div');
            actions.className = 'recording-actions';

            Array.from(cell.childNodes).forEach(node => {
                if (node !== wrap) actions.append(node);
            });

            layout.append(actions, wrap);
            cell.append(layout);
        });

        document.querySelectorAll(
            '#drill1List .prompt-label'
        ).forEach(cell => {
            const table = cell.closest('table');
            if (!table) return;

            table.classList.add('recording-table');

            let cols = table.querySelector(
                'colgroup.recording-columns'
            );

            if (!cols) {
                cols = document.createElement('colgroup');
                cols.className = 'recording-columns';

                for (let i = 0; i < 3; i++) {
                    cols.append(
                        document.createElement('col')
                    );
                }

                table.prepend(cols);
            }

            cols.children[0].style.width = '34px';
            cols.children[1].style.width =
                `${(parseFloat(cell.style.width) || 0) + 4}px`;
        });
    }

    function updateExample() {
        document.querySelectorAll(
            '#drill1Container .example-box .example-line'
        ).forEach(line => {
            const sentence = line.lastElementChild;

            if (
                !sentence ||
                sentence.tagName !== 'SPAN'
            ) return;

            sentence.querySelectorAll('strong')
                .forEach(strong => {
                    const text = strong.textContent;
                    let ending;

                    if (text.startsWith('ました')) {
                        ending = speechStyle === 'formal'
                            ? 'ました'
                            : speechStyle === 'informal'
                                ? 'た'
                                : 'たよ';
                    } else if (
                        text.startsWith('ています')
                    ) {
                        ending = speechStyle === 'formal'
                            ? 'ています'
                            : speechStyle === 'informal'
                                ? 'ている'
                                : 'てるよ';
                    } else {
                        return;
                    }

                    strong.textContent = ending +
                        (text.endsWith('。') ? '。' : '');
                });
        });

        [
            ['exPastListen', '朝5時に起きました。'],
            ['exPerfListen', '朝5時から起きています。']
        ].forEach(([id, text]) => {
            const button = document.getElementById(id);
            if (!button) return;

            const model = convert(text);

            button.onclick = () => {
                setPlayingStateMultiple(
                    [button],
                    'Playing...'
                );

                speakText(
                    model,
                    0.9,
                    () => stopAllPlayback()
                );
            };
        });
    }

    const originalShow = practice7ShowResult;

    practice7ShowResult = function (
        view, saved, rowKey, playRate
    ) {
        originalShow(view, saved, rowKey, playRate);
        view.corrListenBtn.style.display = 'none';
    };

    const originalRender = renderAll;

    renderAll = function () {
        practice7Data.forEach((item, index) => {
            fields.forEach(key => {
                item[key] = convert(
                    originals[index][key]
                );
            });
        });

        originalRender();
        installSettings();
        updateLayout();
        updateExample();
    };

    const originalSync = practice7SyncRecordingUI;

    practice7SyncRecordingUI = function () {
        originalSync();
        syncStyleButtons();
    };
})();
