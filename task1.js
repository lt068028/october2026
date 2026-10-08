```js
// ============================================================================
// Pronunciation Drill
// ============================================================================

const modelSentences = [
    {
        targetText: "てんきがいいです",
        symbolColor: "#facc15",
        displayHtml: [
            { text: "て", low: false }, { type: "symbol", val: "↘" },
            { text: "んきが", low: true }, { type: "symbol", val: "｜" },
            { text: "い", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The weather is fine."
    },
    {
        targetText: "じかんがないです",
        symbolColor: "#34d399",
        displayHtml: [
            { text: "じ", low: true }, { type: "symbol", val: "↗" },
            { text: "かんが", low: false }, { type: "symbol", val: "｜" },
            { text: "な", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I don't have time."
    },
    {
        targetText: "しごとがほしいです",
        symbolColor: "#22d3ee",
        displayHtml: [
            { text: "し", low: true }, { type: "symbol", val: "↗" },
            { text: "ごとが", low: false }, { type: "symbol", val: "｜" },
            { text: "ほ", low: true }, { type: "symbol", val: "↗" },
            { text: "し", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I want a job."
    },
    {
        targetText: "せんせいはおもしろいです",
        symbolColor: "#e879f9",
        displayHtml: [
            { text: "せ", low: true }, { type: "symbol", val: "↗" },
            { text: "んせ", low: false }, { type: "symbol", val: "↘" },
            { text: "いは", low: true }, { type: "symbol", val: "｜" },
            { text: "お", low: true }, { type: "symbol", val: "↗" },
            { text: "もしろ", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The teacher is interesting."
    },
    {
        targetText: "がっこうはたのしいです",
        symbolColor: "#fda4af",
        displayHtml: [
            { text: "が", low: true }, { type: "symbol", val: "↗" },
            { text: "っこうは", low: false }, { type: "symbol", val: "｜" },
            { text: "た", low: true }, { type: "symbol", val: "↗" },
            { text: "のし", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "School is fun."
    }
];

// ============================================================================
// State & Constants
// ============================================================================

let isManualStop = false;
let isAutoPlay = true;

const SMALL_Y = new Set(["ゃ", "ゅ", "ょ"]);
const SPECIAL_MORA = new Set(["っ", "ん", "ー"]);

let activePlayback = {
    audio: null,
    timeoutId: null,
    cancel: function() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        speechSynthesis.cancel();
    }
};

// ============================================================================
// Text & Mora Processing
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_~()（）「」。、\s]/g,
        ""
    );

    cleaned = cleaned.replace(
        /[ァ-ヶ]/g,
        match => String.fromCharCode(match.charCodeAt(0) - 0x60)
    );

    const dict = {
        "天気": "てんき",
        "電気": "でんき",
        "時間": "じかん",
        "仕事": "しごと",
        "欲しい": "ほしい",
        "先生": "せんせい",
        "面白い": "おもしろい",
        "学校": "がっこう",
        "楽しい": "たのしい",
        "です": "です",
        "でした": "でした"
    };

    for (const key in dict) {
        cleaned = cleaned.replace(
            new RegExp(key, "g"),
            dict[key]
        );
    }

    return cleaned;
}

function splitIntoMora(text) {
    const chars = Array.from(text);
    const morae = [];

    for (const ch of chars) {
        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }

        morae.push({
            text: ch,
            special: SPECIAL_MORA.has(ch)
        });
    }

    return morae;
}

function getModelMoraData(itemObj) {
    const charPitch = [];

    itemObj.displayHtml.forEach(part => {
        if (part.type === "symbol") return;

        for (const ch of Array.from(part.text)) {
            charPitch.push({
                char: ch,
                low: !!part.low
            });
        }
    });

    const targetText = charPitch
        .map(item => item.char)
        .join("");

    const morae = [];
    const chars = Array.from(targetText);

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];

        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }

        const isSpecial = SPECIAL_MORA.has(ch);

        morae.push({
            text: ch,
            special: isSpecial,
            low: isSpecial ? null : charPitch[i].low
        });
    }

    return morae;
}

function compareMoraSequences(modelMorae, learnerMorae) {
    const operations = [];
    let i = 0;
    let j = 0;

    while (
        i < modelMorae.length ||
        j < learnerMorae.length
    ) {
        if (i >= modelMorae.length) {
            operations.push({
                type: "extra",
                learner: learnerMorae[j],
                learnerIndex: j
            });
            j++;
            continue;
        }

        if (j >= learnerMorae.length) {
            operations.push({
                type: "missing",
                model: modelMorae[i],
                modelIndex: i
            });
            i++;
            continue;
        }

        const model = modelMorae[i];
        const learner = learnerMorae[j];

        if (model.text === learner.text) {
            operations.push({
                type: "match",
                model,
                learner,
                modelIndex: i,
                learnerIndex: j
            });
            i++;
            j++;
            continue;
        }

        if (
            j + 1 < learnerMorae.length &&
            model.text === learnerMorae[j + 1].text
        ) {
            operations.push({
                type: "extra",
                learner,
                learnerIndex: j
            });
            j++;
            continue;
        }

        if (
            i + 1 < modelMorae.length &&
            modelMorae[i + 1].text === learner.text
        ) {
            operations.push({
                type: "missing",
                model,
                modelIndex: i
            });
            i++;
            continue;
        }

        operations.push({
            type: "sound-error",
            model,
            learner,
            modelIndex: i,
            learnerIndex: j
        });

        i++;
        j++;
    }

    return operations;
}

// ============================================================================
// UI Rendering
// ============================================================================

function renderPronunciationResult(resultSpan, operations) {
    resultSpan.innerHTML = "";
    resultSpan.style.color = "";

    const recognizedText = operations
        .filter(op => op.type !== "missing")
        .map(op => op.learner ? op.learner.text : "")
        .join("");

    if (recognizedText) {
        const span = document.createElement("span");
        span.className = "pronunciation-normal";
        span.textContent = recognizedText;
        resultSpan.appendChild(span);
    }

    return false;
}

function buildHtmlParts(itemObj) {
    let speechText = "";
    let htmlParts = "";

    itemObj.displayHtml.forEach(part => {
        if (part.type === "symbol") {
            htmlParts +=
                `<span style="color: ${itemObj.symbolColor};">${part.val}</span>`;
        } else {
            speechText += part.text;

            const pitchClass = part.low
                ? "low-pitch"
                : "high-pitch";

            htmlParts +=
                `<span class="${pitchClass}" style="text-decoration-color: ${itemObj.symbolColor};">${part.text}</span>`;
        }
    });

    return {
        htmlParts,
        speechText
    };
}

// ============================================================================
// Recording Controller
// ============================================================================

function setupRecordingEvents(rowElement, itemObj, speechText) {
    const listenBtn = rowElement.querySelector(".listen-btn");
    const recordBtn = rowElement.querySelector(".record-btn");
    const stopBtn = rowElement.querySelector(".stop-btn");
    const resultSpan = rowElement.querySelector(".result-text");
    const playRecordBtn = rowElement.querySelector(".play-record-btn");
    const meaningBtn = rowElement.querySelector(".meaning-btn");
    const meaningPopup = rowElement.querySelector(".meaning-popup");

    let mediaRecorder;
    let audioStream;
    let recognition;
    let recordedAudioUrl;

    let latestTranscript = "";
    let recordingTimeout;
    let silenceTimer;

    let recordingActive = false;
    let finishingRecording = false;
    let audioChunks = [];

    // --- Audio Playback (Manual) ---

    listenBtn.addEventListener("click", () => {
        activePlayback.cancel();

        listenBtn.disabled = true;
        listenBtn.textContent = "🔊Playing...";

        const utterance =
            new SpeechSynthesisUtterance(speechText);

        utterance.lang = "ja-JP";
        utterance.rate = 0.8;

        utterance.onend = () => {
            listenBtn.disabled = false;
            listenBtn.textContent = "🔊 きく";
        };

        speechSynthesis.speak(utterance);
    });

    playRecordBtn.addEventListener("click", () => {
        if (!recordedAudioUrl) return;

        activePlayback.cancel();

        const audio = new Audio(recordedAudioUrl);
        activePlayback.audio = audio;

        audio.playbackRate = 1.0;

        playRecordBtn.disabled = true;
        playRecordBtn.textContent = "▶️ Playing...";

        audio.play();

        audio.onended = () => {
            playRecordBtn.disabled = false;
            playRecordBtn.textContent = "▶️";
            activePlayback.audio = null;
        };
    });

    // --- UI Interactions ---

    meaningBtn.addEventListener("click", e => {
        e.stopPropagation();
        meaningPopup.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        meaningPopup.classList.remove("show");
    });

    rowElement
        .querySelector(".meaning-container")
        .addEventListener("click", e => {
            e.stopPropagation();
        });

    // --- Recording Logic ---

    function clearSilenceTimer() {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    }

    function scheduleAutostop() {
        if (
            isManualStop ||
            !recordingActive ||
            finishingRecording
        ) {
            return;
        }

        clearSilenceTimer();

        silenceTimer = setTimeout(() => {
            if (
                !recordingActive ||
                finishingRecording
            ) {
                return;
            }

            finishRecording();
        }, 1500);
    }

    function processTranscript(rawTranscript) {
        if (!rawTranscript) return null;

        const hiraText =
            convertToHiragana(rawTranscript);

        const cleanHira =
            hiraText.replace(/[\s、。]/g, "");

        if (cleanHira.length < 2) {
            resultSpan.textContent = hiraText
                ? hiraText + " (Too short)"
                : "No speech detected. Please try again.";

            resultSpan.style.color =
                "var(--text-secondary)";

            return null;
        }

        const cleanTarget =
            itemObj.targetText.replace(/[\s、。]/g, "");

        const matchRegex =
            new RegExp(
                `^${cleanTarget}(?:ね|よ|よね|ですね|ですよ)*$`
            );

        const exactSentence =
            matchRegex.test(cleanHira);

        const modelMorae =
            getModelMoraData(itemObj);

        const learnerMorae =
            splitIntoMora(cleanHira);

        let operations =
            compareMoraSequences(
                modelMorae,
                learnerMorae
            );

        if (exactSentence) {
            operations = operations.filter(
                op =>
                    op.type !== "extra" ||
                    (
                        op.learner &&
                        op.learner.text !== "ね" &&
                        op.learner.text !== "よ"
                    )
            );
        }

        renderPronunciationResult(
            resultSpan,
            operations
        );

        return {
            hiraText,
            modelMorae,
            learnerMorae,
            operations
        };
    }

    function finishRecording() {
        if (finishingRecording) return;

        finishingRecording = true;
        recordingActive = false;

        clearSilenceTimer();

        if (recordingTimeout) {
            clearTimeout(recordingTimeout);
            recordingTimeout = null;
        }

        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
        }

        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {
            try {
                mediaRecorder.stop();
            } catch (e) {}
        }

        if (audioStream) {
            audioStream
                .getTracks()
                .forEach(track => track.stop());

            audioStream = null;
        }

        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");
    }

    recordBtn.addEventListener("click", async () => {
        activePlayback.cancel();

        clearSilenceTimer();

        recordingActive = false;
        finishingRecording = false;
        audioChunks = [];
        latestTranscript = "";

        try {
            audioStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            mediaRecorder =
                new MediaRecorder(audioStream);

            mediaRecorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                recordingActive = false;

                const audioBlob =
                    new Blob(audioChunks, {
                        type: "audio/webm"
                    });

                if (recordedAudioUrl) {
                    URL.revokeObjectURL(
                        recordedAudioUrl
                    );
                }

                recordedAudioUrl =
                    URL.createObjectURL(audioBlob);

                playRecordBtn.style.display =
                    "inline-flex";

                if (latestTranscript) {
                    processTranscript(
                        latestTranscript
                    );
                } else {
                    resultSpan.textContent =
                        "No speech detected. Please try again.";

                    resultSpan.style.color =
                        "var(--text-secondary)";
                }

                finishingRecording = false;

                // --- 自動再生 / 手動再生 ---

                if (isAutoPlay) {
                    listenBtn.disabled = true;
                    listenBtn.textContent =
                        "🔊Playing...";

                    playRecordBtn.disabled = true;
                    playRecordBtn.textContent =
                        "▶️ Playing...";

                    const utterance =
                        new SpeechSynthesisUtterance(
                            speechText
                        );

                    utterance.lang = "ja-JP";
                    utterance.rate = 0.8;

                    utterance.onend = () => {
                        listenBtn.disabled = false;
                        listenBtn.textContent =
                            "🔊 きく";

                        if (recordedAudioUrl) {
                            activePlayback.timeoutId =
                                setTimeout(() => {
                                    if (!recordedAudioUrl) {
                                        return;
                                    }

                                    const audio =
                                        new Audio(
                                            recordedAudioUrl
                                        );

                                    activePlayback.audio =
                                        audio;

                                    audio.playbackRate = 1.0;
                                    audio.play();

                                    audio.onended = () => {
                                        playRecordBtn.disabled =
                                            false;

                                        playRecordBtn.textContent =
                                            "▶️";

                                        activePlayback.audio =
                                            null;
                                    };
                                }, 100);
                        } else {
                            playRecordBtn.disabled = false;
                            playRecordBtn.textContent = "▶️";
                        }
                    };

                    speechSynthesis.speak(utterance);

                } else {
                    listenBtn.disabled = false;
                    listenBtn.textContent = "🔊 きく";

                    playRecordBtn.disabled = false;
                    playRecordBtn.textContent = "▶️";
                }
            };

            mediaRecorder.start();
            recordingActive = true;

            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognition =
                    new SpeechRecognition();

                recognition.lang = "ja-JP";
                recognition.interimResults = false;

                // Task1と同じ仕様
                recognition.continuous = false;

                recognition.onresult = e => {
                    let rawTranscript = "";

                    for (
                        let i = e.resultIndex;
                        i < e.results.length;
                        i++
                    ) {
                        if (e.results[i].isFinal) {
                            rawTranscript +=
                                e.results[i][0].transcript;
                        }
                    }

                    if (!rawTranscript) return;

                    latestTranscript =
                        rawTranscript;

                    // Auto：
                    // 最後の認識結果から1.5秒後に停止
                    if (!isManualStop) {
                        processTranscript(
                            latestTranscript
                        );

                        scheduleAutostop();
                    }
                };

                recognition.onerror = err => {
                    console.error(
                        "Speech recognition error:",
                        err
                    );
                };

                try {
                    recognition.start();
                } catch (e) {
                    console.error(
                        "Recognition start error:",
                        e
                    );
                }
            } else {
                latestTranscript = "";
            }

            // Auto / Manual 共通の最大録音時間
            recordingTimeout =
                setTimeout(() => {
                    finish
```
