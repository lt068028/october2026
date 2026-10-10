// ============================================================================
// Pronunciation Practice 1 (Audio Comparison Only - No Transcription)
// ============================================================================

const drill1Data = [
    { kanji: "箸。橋。", hira: "はし、はし", text: "は↘し chopstick ｜ は↗し bridge", color: "#facc15" },
    { kanji: "萌々。桃", hira: "もも、もも", text: "も↘も thigh ｜ も↗も peach", color: "#34d399" },
    { kanji: "降る。振る", hira: "ふる、ふる", text: "ふ↘る to fall ｜ ふ↗る to shake", color: "#22d3ee" },
    { kanji: "切る。着る", hira: "きる、きる", text: "き↘る to cut ｜ き↗る to wear", color: "#e879f9" },
    { kanji: "撒く。巻く", hira: "まく、まく", text: "ま↘く to scatter ｜ ま↗く to roll", color: "#fda4af" },
    { kanji: "春。貼る", hira: "はる、はる", text: "は↘る spring ｜ は↗る to paste", color: "#facc15" },
    { kanji: "隅。炭。", hira: "すみ、すみ", text: "す↘み corner ｜ す↗み charcoal", color: "#34d399" },
    { kanji: "牡蠣。かき。", hira: "かき、かき", text: "か↘き oyster ｜ か↗き persimmon", color: "#22d3ee" },
    { kanji: "鶴。釣る", hira: "つる、つる", text: "つ↘る crane ｜ つ↗る to fish", color: "#e879f9" },
    { kanji: "雨。飴", hira: "あめ、あめ", text: "あ↘め rain ｜ あ↗め candy", color: "#fda4af" }
];

let isManualStop = false; // Autostopデフォルト
let isAutoPlay = true; 
const useHiraganaOnly = true; 
let activeRecognitionSession = null;

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
        console.error("Speech synthesis error:", err);
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    }
}

// ============================================================================
// Initialization & DOM Setup
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    initDrill1();
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

function initSettingsPanel() {
    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");
    const labelManualRecord = document.getElementById("labelManualRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = false; // Autostopデフォルト
        isManualStop = false;
        toggleRecordMode.addEventListener("change", (e) => {
            isManualStop = e.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
            updateToggleLabelStyle(labelManualRecord, isManualStop);
        });
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        updateToggleLabelStyle(labelManualRecord, isManualStop);
    }

    const togglePlaybackMode = document.getElementById("togglePlaybackMode");
    const labelAutoPlay = document.getElementById("labelAutoPlay");
    const labelManualPlay = document.getElementById("labelManualPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.addEventListener("change", (e) => {
            isAutoPlay = !e.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
            updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
        });
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
    }

    // スクリプト切り替えトグル（完全グレーアウト）
    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelKanji = document.getElementById("labelKanji");
    const labelHiragana = document.getElementById("labelHiragana");
    const scriptControlItem = toggleScriptMode ? toggleScriptMode.closest(".control-item") : null;

    if (toggleScriptMode) {
        toggleScriptMode.checked = true;
        toggleScriptMode.disabled = true;
    }
    if (scriptControlItem) {
        scriptControlItem.style.opacity = "0.4";
        scriptControlItem.style.pointerEvents = "none";
    }
    if (labelKanji) {
        labelKanji.className = "mode-label inactive-mode custom-tip-wrap";
        const emoji = labelKanji.querySelector('.icon-emoji');
        if (emoji) { emoji.style.filter = "grayscale(100%)"; emoji.style.opacity = "0.4"; }
    }
    if (labelHiragana) {
        labelHiragana.className = "mode-label inactive-mode custom-tip-wrap";
        const emoji = labelHiragana.querySelector('.icon-emoji');
        if (emoji) { emoji.style.filter = "grayscale(100%)"; emoji.style.opacity = "0.4"; }
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

// ----------------------------------------------------------------------------
// Drill 1 Initialization
// ----------------------------------------------------------------------------
function initDrill1() {
    const container = document.getElementById("drill1List");
    if (!container) return;
    container.innerHTML = "";

    drill1Data.forEach((item, index) => {
        createDrill1Row(
            container,
            `${index + 1}.`,
            item,
            0.9
        );
    });
}

function createDrill1Row(container, indexLabel, item, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the model sentence.</span>';

    listenBtn.onclick = () => {
        const recordBtnEl = rowDiv.querySelector(".play-recording-btn");
        setPlayingStateMultiple([listenBtn, recordBtnEl], "Playing...");
        speakText(item.kanji, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";
    indexSpan.style.marginRight = "6px";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = renderPitchAccentHTML(item.text, item.color);
    promptSpan.style.minWidth = "380px";
    promptSpan.style.paddingLeft = "4px";

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = !isManualStop;

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    resultSpan.textContent = "(Not recorded yet)";
    resultSpan.style.color = "var(--text-secondary)";

    topRow.appendChild(listenBtn);
    topRow.appendChild(indexSpan);
    topRow.appendChild(promptSpan);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

    topRow.appendChild(correctionBox);

    bindDrill1RecorderEvents(
        recordBtn, stopBtn, resultSpan, item.kanji, playRate
    );

    container.appendChild(rowDiv);
}

// 文字起こしを完全に排除し、録音完了後に音声再生ボタンのみを表示するレコーダー制御
function bindDrill1RecorderEvents(
    recordBtn, stopBtn, resultSpan, expectedKanjiText, playRate = 0.9
) {
    let mediaRecorder = null;
    let audioChunks = [];
    let lastAudioUrl = null;
    let stream = null;
    let isRecording = false;

    const appendPlayButton = () => {
        let playBtn = resultSpan.querySelector(".play-recording-btn");
        if (!playBtn) {
            playBtn = document.createElement("button");
            playBtn.className = "example-button play-recording-btn custom-tip-wrap";
            playBtn.style.marginLeft = "8px";
            playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';

            playBtn.onclick = () => {
                if (lastAudioUrl) {
                    const rowContainer = resultSpan.closest(".drill-row");
                    const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
                    setPlayingStateMultiple([modelListenBtn, playBtn], "Playing...");
                    const audio = new Audio(lastAudioUrl);
                    currentPlayingAudio = audio;
                    audio.onended = () => stopAllPlayback();
                    audio.play().catch(e => {
                        console.warn("Playback failed", e);
                        stopAllPlayback();
                    });
                }
            };
            resultSpan.appendChild(playBtn);
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;
        isRecording = false;

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");
    };

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;
        stopAllPlayback();

        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            resultSpan.textContent = "Microphone access denied.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (lastAudioUrl) {
            URL.revokeObjectURL(lastAudioUrl);
            lastAudioUrl = null;
        }

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            lastAudioUrl = URL.createObjectURL(audioBlob);

            resultSpan.textContent = "Recorded ";
            resultSpan.style.color = "var(--text-primary)";
            appendPlayButton();

            // AutoPlay設定が有効な場合、録音完了後に自動再生
            if (isAutoPlay) {
                runAutoPlaySequence(resultSpan, expectedKanjiText, playRate, () => lastAudioUrl);
            }
        };

        mediaRecorder.start();
        isRecording = true;

        recordBtn.disabled = true;
        stopBtn.disabled = !isManualStop;
        if (isManualStop) stopBtn.classList.add("stop-btn-active");
        else stopBtn.classList.remove("stop-btn-active");

        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";

        // Autostopモード（isManualStop = false）の場合、2.5秒後に自動停止するタイマーを設定
        if (!isManualStop) {
            setTimeout(() => {
                if (isRecording) {
                    stopRecording();
                }
            }, 2500);
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!isRecording) return;
        stopAllPlayback();
        stopRecording();
    });
}

// 録音完了後の自動再生シーケンス（お手本音声 ➡ 少しウェイト ➡ 自分の録音音声）
function runAutoPlaySequence(resultSpan, expectedKanjiText, playRate, getUrlFn) {
    if (!isAutoPlay) return;

    const rowContainer = resultSpan.closest(".drill-row");
    const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
    const playBtn = resultSpan.querySelector(".play-recording-btn");
    const recordedAudioUrl = getUrlFn();

    if (!recordedAudioUrl || !playBtn) return;

    setPlayingStateMultiple([modelListenBtn, playBtn], "Playing...");

    const utterance = new SpeechSynthesisUtterance(expectedKanjiText);
    utterance.lang = "ja-JP";
    utterance.rate = playRate;

    if (preferredVoice) utterance.voice = preferredVoice;
    currentUtteranceRef = utterance;

    utterance.onend = () => {
        currentUtteranceRef = null;
        currentPlayTimeoutId = setTimeout(() => {
            const audio = new Audio(recordedAudioUrl);
            currentPlayingAudio = audio;
            audio.playbackRate = 1.0;
            audio.onended = () => stopAllPlayback();
            audio.play().catch(e => {
                console.warn("Auto playback failed", e);
                stopAllPlayback();
            });
        }, 100);
    };

    utterance.onerror = () => stopAllPlayback();

    currentPlayTimeoutId = setTimeout(() => {
        speechSynthesis.speak(utterance);
    }, 500);
}
