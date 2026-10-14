// ============================================================================
// Practice 7.2: ているform② present perfect
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
    if (!document.getElementById("practice7KaraStyle")) {
        const style = document.createElement("style");
        style.id = "practice7KaraStyle";
        style.textContent = `
            #drill1Container .kara-highlight {
                color: #B45309;
                font-weight: bold;
            }

            @media (prefers-color-scheme: dark) {
                #drill1Container .kara-highlight {
                    color: #FBBF24;
                }
            }
        `;
        document.head.appendChild(style);
    }

    renderDrill1Section();

    const container = document.getElementById("drill1Container");
    if (!container) return;

    const instruction = container.querySelector(".info-panel-desc");
    if (instruction) {
        instruction.innerHTML = `
            💡 Compare a past action with the state that continues now.
            Use <strong class="kara-highlight">から</strong>
            after a time expression to show when that state began.
        `;
    }

    container.querySelectorAll(".example-box strong").forEach(element => {
        if (element.textContent === "から") {
            element.classList.add("kara-highlight");
        }
    });
}

// ============================================================================
// Render Drill 1 Section (Past & Present Perfect Practice)
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
                         font-size:13px; font-weight:bold;">⏪ Past</span>
            <span>${w1}に${verbStem}<strong>ました。</strong></span>
        </div>

        <div class="example-line dashed-border flex-row-center"
             style="padding-top: 10px;">
            <strong class="example-label-title"
                    style="min-width: 130px;">Present Perfect:</strong>
            ${w1} ／ ${w2}
            <span style="font-size: 16px; margin: 0 4px;">👉</span>
            <button id="exPerfListen" type="button"
                    class="example-button">🔊きく</button>
            <span style="display:inline-block; padding:4px 8px;
                         margin:0 6px; border-radius:4px;
                         background:#dcfce7; color:#15803d;
                         font-size:13px; font-weight:bold;">⏳ Perfect</span>
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
            Drill 1: Compare Past & Present Perfect
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
    tdPrompt.innerHTML = `${formatWord(item.x, item.xKanji, item.xRomaji, item.xMeaning)} ／ ${formatWord(item.y, item.yKanji, item.yRomaji, item.yMeaning)}`;
    tdPrompt.style.verticalAlign = "middle";
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
    listenBtn2.innerHTML = '🔊きく<span class="custom-tip-box">Listen to present perfect.</span>';

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
    recordBtn2.innerHTML = '⏺️とる<span class="custom-tip-box">Record present perfect.</span>';

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

    // 再描画後も、以前の抽出テキストと録音を復元する。
    const saved = practice7State.savedResults[rowKey];
    if (saved) {
        resultSpan.textContent = saved.text;
        resultSpan.style.color = saved.color;
    }
    if (practice7State.audioUrls[rowKey]) {
        appendPersistedPlayButton(resultSpan, rowKey, playRate);
    }

    function currentView() {
        return practice7State.views[rowKey] || view;
    }

    const running = activeRecognitionSession;
    if (running && running.rowKey === rowKey) {
        recordBtn.disabled = true;
        stopBtn.disabled = !running.manual || running.stopRequested;
        stopBtn.classList.toggle(
            "stop-btn-active",
            running.manual && !running.stopRequested
        );
        resultSpan.textContent = "Recording...";
    }

    recordBtn.addEventListener("click", async () => {
        if (activeRecognitionSession || recordBtn.disabled) return;

        const Recognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!Recognition) {
            resultSpan.textContent = "Speech recognition is not supported.";
            return;
        }

        stopAllPlayback();
        recordBtn.disabled = true;

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (error) {
            currentView().recordBtn.disabled = false;
            currentView().resultSpan.textContent =
                "Microphone access denied.";
            return;
        }

        const session = {
            rowKey,
            manual: isManualStop,
            finished: false,
            stopRequested: false,
            speechStarted: false,
            recognitionDone: false,
            recorderDone: false,
            transcript: "",
            message: "",
            chunks: [],
            timers: [],
            audioContext: null,
            stream,
            recognition: null,
            mediaRecorder: null,
            stop: null
        };
        activeRecognitionSession = session;

        function cleanMonitoring() {
            session.timers.forEach(timer => {
                clearTimeout(timer);
                clearInterval(timer);
            });
            session.timers = [];

            if (session.audioContext) {
                session.audioContext.close().catch(() => {});
                session.audioContext = null;
            }
        }

        function finish() {
            if (session.finished ||
                !session.recognitionDone ||
                !session.recorderDone) return;

            session.finished = true;
            cleanMonitoring();
            stream.getTracks().forEach(track => track.stop());

            if (activeRecognitionSession === session) {
                activeRecognitionSession = null;
            }

            const v = currentView();
            v.recordBtn.disabled = false;
            v.stopBtn.disabled = true;
            v.stopBtn.classList.remove("stop-btn-active");

            if (session.transcript.trim()) {
                processResult(
                    session.transcript,
                    getExpectedTextFn(),
                    getExpectedKanjiFn,
                    v.resultSpan,
                    v.correctionBox,
                    v.corrListenBtn,
                    v.corrTextSpan,
                    () => practice7State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

            } else {
                const previousResult =
                    practice7State.savedResults[rowKey];

                v.resultSpan.textContent =
                    session.message || "No speech recognized.";
                v.resultSpan.style.color = "var(--text-secondary)";
                v.correctionBox.style.display = "none";

                if (previousResult) {
                    v.resultSpan.appendChild(
                        document.createElement("br")
                    );

                    const previousText = document.createElement("span");
                    previousText.textContent = previousResult.text;
                    previousText.style.color = previousResult.color;
                    v.resultSpan.appendChild(previousText);
                }

                if (practice7State.audioUrls[rowKey]) {
                    appendPersistedPlayButton(
                        v.resultSpan, rowKey, playRate
                    );
                }

                // 以前の結果は上書きしない。
                return;
            }                

            // 再生ボタンの文字を除き、結果そのものを保存する。
            const resultCopy = v.resultSpan.cloneNode(true);
            resultCopy.querySelectorAll("button").forEach(
                button => button.remove()
            );
            practice7State.savedResults[rowKey] = {
                text: resultCopy.textContent,
                color: v.resultSpan.style.color
            };
        }

        function stop(message = "") {
            if (session.finished || session.stopRequested) return;

            session.stopRequested = true;
            session.message = message;
            cleanMonitoring();

            const v = currentView();
            v.stopBtn.disabled = true;
            v.stopBtn.classList.remove("stop-btn-active");

            try {
                session.recognition?.stop();
            } catch (error) {
                session.recognitionDone = true;
            }

            if (session.mediaRecorder?.state !== "inactive") {
                try {
                    session.mediaRecorder.stop();
                } catch (error) {
                    session.recorderDone = true;
                }
            }

            // 音声認識から終了通知が来ない場合の後処理。
            session.timers.push(setTimeout(() => {
                try {
                    session.recognition?.abort();
                } catch (error) {}
                session.recognitionDone = true;
                stream.getTracks().forEach(track => track.stop());
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
            recognition.continuous = session.manual;

            recognition.onspeechstart = () => {
                session.speechStarted = true;
            };

            recognition.onresult = event => {
                if (session.finished) return;

                for (let i = event.resultIndex;
                     i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result[0].transcript.trim()) {
                        session.speechStarted = true;
                    }
                    if (result.isFinal) {
                        session.transcript += result[0].transcript;
                    }
                }
            };

            recognition.onerror = event => {
                if (session.finished || session.stopRequested) return;

                // 発話前のブラウザ側の無音終了は、
                // 独自の15秒タイマーまで再開を許可する。
                if (event.error === "no-speech" &&
                    !session.speechStarted) return;

                session.recognitionDone = true;
                stop("Recognition error.");
            };

            recognition.onend = () => {
                if (session.finished) return;

                if (!session.stopRequested &&
                    !session.speechStarted) {
                    try {
                        recognition.start();
                        return;
                    } catch (error) {
                        session.recognitionDone = true;
                        stop("Could not restart recognition.");
                        return;
                    }
                }

                session.recognitionDone = true;
                if (!session.stopRequested) stop();
                finish();
            };

            const recorder = new MediaRecorder(stream);
            session.mediaRecorder = recorder;

            recorder.ondataavailable = event => {
                if (event.data.size) session.chunks.push(event.data);
            };

            recorder.onstop = () => {
                const noSpeechTimeout =
                    session.message ===
                    "No speech detected within 15 seconds.";

                const keepRecording =
                    session.speechStarted &&
                    !noSpeechTimeout &&
                    session.chunks.length > 0;

                if (keepRecording) {
                    const blob = new Blob(session.chunks, {
                        type: recorder.mimeType || "audio/webm"
                    });

                    const previousUrl =
                        practice7State.audioUrls[rowKey];

                    if (previousUrl) {
                        URL.revokeObjectURL(previousUrl);
                    }

                    practice7State.audioUrls[rowKey] =
                        URL.createObjectURL(blob);
                }

                session.chunks = [];
                session.recorderDone = true;
                finish();
            };

            recorder.onerror = () => {
                stop("Recording error.");
            };

            const v = currentView();
            v.resultSpan.textContent = "Recording...";
            v.resultSpan.style.color = "var(--accent-color)";
            v.correctionBox.style.display = "none";
            v.stopBtn.disabled = !session.manual;
            v.stopBtn.classList.toggle(
                "stop-btn-active", session.manual
            );

            recorder.start();
            recognition.start();

            // マイク音量でも発話開始を検出する。
            // 音声認識の結果が出る前に話し始めた場合に対応。
            try {
                const AudioContextClass =
                    window.AudioContext || window.webkitAudioContext;
                const context = new AudioContextClass();
                session.audioContext = context;

                const source =
                    context.createMediaStreamSource(stream);
                const analyser = context.createAnalyser();
                analyser.fftSize = 1024;
                source.connect(analyser);

                const samples =
                    new Float32Array(analyser.fftSize);
                let soundFrames = 0;

                context.resume().catch(() => {});

                session.timers.push(setInterval(() => {
                    if (session.stopRequested ||
                        session.speechStarted) return;

                    analyser.getFloatTimeDomainData(samples);
                    let sum = 0;
                    for (const sample of samples) {
                        sum += sample * sample;
                    }
                    const volume = Math.sqrt(sum / samples.length);
                    soundFrames = volume > 0.015
                        ? soundFrames + 1 : 0;

                    if (soundFrames >= 3) {
                        session.speechStarted = true;
                    }
                }, 100));
            } catch (error) {
                // 利用できない場合は音声認識の発話通知を使う。
            }

            session.timers.push(setTimeout(() => {
                if (!session.speechStarted) {
                    stop("No speech detected within 15 seconds.");
                }
            }, 15000));

            session.timers.push(setTimeout(() => {
                stop("Recording stopped after 20 seconds.");
            }, 20000));
        } catch (error) {
            session.recognitionDone = true;
            if (!session.mediaRecorder ||
                session.mediaRecorder.state === "inactive") {
                session.recorderDone = true;
            }
            stop("Could not start recording.");
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
    // このページで使用する語句の表記を統一する。
    // 否定・助詞・語尾は削除しない。
    function normalizeForMatch(text) {
        let normalized = String(text ?? "")
            .normalize("NFKC")
            .toLowerCase()
            .replace(/[\s、。,.!?！？「」『』・]/g, "")
            .replace(/[ァ-ヶ]/g, character =>
                String.fromCharCode(character.charCodeAt(0) - 96)
            );

        const replacements = [
            ["お正月", "おしょうがつ"],
            ["夏休み", "なつやすみ"],
            ["結婚", "けっこん"],
            ["漢字", "かんじ"],
            ["覚", "おぼ"],
            ["知", "し"],
            ["起", "お"],
            ["寝", "ね"],
            ["太", "ふと"],
            ["朝", "あさ"],
            ["夜", "よる"],
            ["年前", "ねんまえ"],
            ["時", "じ"],
            ["個", "こ"],
            ["三", "3"],
            ["五十", "50"],
            ["十", "10"],
            ["五", "5"],
            ["form", "ふぉーむ"]
        ];

        for (const [from, to] of replacements) {
            normalized = normalized.split(from).join(to);
        }

        return normalized;
    }

    const transcript = String(rawTranscript ?? "").trim();
    const modelText = getExpectedKanjiFn();
    const normalizedTranscript = normalizeForMatch(transcript);

    const isCorrect = normalizedTranscript.length > 0 && (
        normalizedTranscript === normalizeForMatch(expectedText) ||
        normalizedTranscript === normalizeForMatch(modelText)
    );

    // 認識された原文を保持して表示する。
    resultSpan.textContent =
        transcript + (isCorrect ? " ✅ " : " ");
    resultSpan.style.color = isCorrect
        ? "var(--text-primary)"
        : "var(--error-text)";

    if (practice7State.audioUrls[rowKey]) {
        appendPersistedPlayButton(resultSpan, rowKey, playRate);
    }

    if (isCorrect) {
        correctionBox.style.display = "none";
    } else {
        corrTextSpan.textContent = "🔥 Keep going! Try once more!";
        corrListenBtn.style.display = "inline-block";
        corrListenBtn.onclick = () => {
            setPlayingStateMultiple([corrListenBtn], "Playing...");
            speakText(modelText, 0.9, () => stopAllPlayback());
        };
        correctionBox.style.display = "block";
    }

    if (isAutoPlay) {
        speakText(modelText, playRate, () => {
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
    let playBtn = resultSpan.querySelector(".play-recording-btn");

    if (!playBtn) {
        playBtn = document.createElement("button");
        playBtn.className = "example-button play-recording-btn custom-tip-wrap";
        playBtn.style.marginLeft = "8px";
        playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';

        playBtn.onclick = () => {
            const recordedAudioUrl = practice7State.audioUrls[rowKey];
            if (recordedAudioUrl) {
                setPlayingStateMultiple([playBtn], "Playing...");
                const audio = new Audio(recordedAudioUrl);
                currentPlayingAudio = audio;
                audio.onended = () => stopAllPlayback();
                audio.play().catch(e => stopAllPlayback());
            }
        };

        resultSpan.appendChild(playBtn);
    }
}
