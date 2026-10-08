```js
// ============================================================================
// Practice1；XはYです
// ============================================================================

const taskData = [
    {
        x: "わたし",
        y: "がくせい",
        meaning: "student",
        isNeg: false
    },
    {
        x: "わたし",
        y: "せんせい",
        meaning: "teacher",
        isNeg: true
    },
    {
        x: "わたし",
        y: "日本人",
        meaning: "Japanese",
        isNeg: false
    },
    {
        x: "わたし",
        y: "かいしゃいん",
        meaning: "company employee",
        isNeg: true
    },
    {
        x: "ともだち",
        y: "がくせい",
        meaning: "student",
        isNeg: false
    },
    {
        x: "ともだち",
        y: "かいしゃいん",
        meaning: "company employee",
        isNeg: true
    },
    {
        x: "ともだち",
        y: "アメリカ人",
        meaning: "American",
        isNeg: false
    }
];

// ============================================================================
// State
// ============================================================================

let isManualStop = false;
let hintMode = "hover";

const customDict = {
    x: [
        "わたし",
        "ともだち"
    ],
    y: [
        "がくせい",
        "せんせい",
        "日本人",
        "かいしゃいん",
        "アメリカ人"
    ]
};

// ============================================================================
// Utility
// ============================================================================

function normalizeJapanese(text) {
    if (!text) return "";

    return text
        .replace(/[\s、。,.!?！？]/g, "")
        .replace(
            /[ァ-ヶ]/g,
            match =>
                String.fromCharCode(
                    match.charCodeAt(0) - 0x60
                )
        );
}

function convertToHiragana(text) {
    if (!text) return "";

    let result = text;

    result = result.replace(
        /[ァ-ヶ]/g,
        match =>
            String.fromCharCode(
                match.charCodeAt(0) - 0x60
            )
    );

    const dict = {
        "私": "わたし",
        "友達": "ともだち",
        "日本人": "にほんじん",
        "会社員": "かいしゃいん",
        "学生": "がくせい",
        "先生": "せんせい",
        "アメリカ人": "あめりかじん"
    };

    for (const key in dict) {
        result = result.replace(
            new RegExp(key, "g"),
            dict[key]
        );
    }

    return result;
}

function getExpectedSentence(x, y, isNeg) {
    return isNeg
        ? `${x}は${y}ではありません`
        : `${x}は${y}です`;
}

// ============================================================================
// Recognition Result
// ============================================================================

function processRecognitionResult(
    transcript,
    currentX,
    currentY,
    expectedIsNeg,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getRecordedAudioUrl
) {
    const hiraTranscript =
        convertToHiragana(transcript);

    const normalizedTranscript =
        normalizeJapanese(hiraTranscript);

    const expectedSentence =
        getExpectedSentence(
            currentX,
            currentY,
            expectedIsNeg
        );

    const normalizedExpected =
        normalizeJapanese(
            convertToHiragana(expectedSentence)
        );

    if (
        normalizedTranscript ===
        normalizedExpected
    ) {
        resultSpan.textContent =
            hiraTranscript;

        resultSpan.style.color =
            "var(--text-primary)";

        correctionBox.style.display =
            "none";

        return true;
    }

    resultSpan.textContent =
        hiraTranscript ||
        "No speech detected. Please try again.";

    resultSpan.style.color =
        "var(--text-primary)";

    correctionBox.style.display =
        "flex";

    corrTextSpan.textContent =
        expectedSentence;

    corrListenBtn.disabled = false;

    corrListenBtn.onclick = () => {
        const utterance =
            new SpeechSynthesisUtterance(
                expectedSentence
            );

        utterance.lang = "ja-JP";
        utterance.rate = 0.8;

        speechSynthesis.cancel();
        speechSynthesis.speak(
            utterance
        );
    };

    return false;
}

// ============================================================================
// Recorder
// ============================================================================

function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getXFn,
    getYFn,
    expectedIsNeg = false
) {
    let mediaRecorder;
    let audioChunks = [];
    let audioStream = null;
    let recognition = null;
    let recordedAudioUrl = null;

    let timeoutTimer = null;
    let silenceTimer = null;

    let accumulatedTranscript = "";
    let recordingActive = false;
    let finishingRecording = false;

    // ------------------------------------------------------------------------
    // Timer
    // ------------------------------------------------------------------------

    const clearSilenceTimer = () => {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    };

    const scheduleAutostop = () => {
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

            stopRecordingProcess();
        }, 1500);
    };

    // ------------------------------------------------------------------------
    // Stop recording
    // ------------------------------------------------------------------------

    const stopRecordingProcess = () => {
        if (finishingRecording) return;

        finishingRecording = true;
        recordingActive = false;

        clearSilenceTimer();

        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
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
        recordBtn.classList.remove(
            "stop-btn-active"
        );

        recordBtn.innerHTML =
            '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

        stopBtn.disabled = true;
        stopBtn.classList.remove(
            "stop-btn-active"
        );
    };

    // ------------------------------------------------------------------------
    // Start recording
    // ------------------------------------------------------------------------

    recordBtn.addEventListener(
        "click",
        async () => {
            if (recordedAudioUrl) {
                URL.revokeObjectURL(
                    recordedAudioUrl
                );

                recordedAudioUrl = null;
            }

            const oldPlayBtn =
                resultSpan.querySelector(
                    ".play-recording-btn"
                );

            if (oldPlayBtn) {
                oldPlayBtn.remove();
            }

            const currentX = getXFn();
            const currentY = getYFn();

            accumulatedTranscript = "";
            audioChunks = [];
            recordingActive = false;
            finishingRecording = false;

            clearSilenceTimer();

            try {
                audioStream =
                    await navigator.mediaDevices
                        .getUserMedia({
                            audio: true
                        });

                mediaRecorder =
                    new MediaRecorder(
                        audioStream
                    );

                mediaRecorder.ondataavailable =
                    e => {
                        if (
                            e.data &&
                            e.data.size > 0
                        ) {
                            audioChunks.push(
                                e.data
                            );
                        }
                    };

                mediaRecorder.onstop = () => {
                    const audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type: "audio/webm"
                            }
                        );

                    recordedAudioUrl =
                        URL.createObjectURL(
                            audioBlob
                        );

                    if (
                        accumulatedTranscript
                    ) {
                        processRecognitionResult(
                            accumulatedTranscript,
                            currentX,
                            currentY,
                            expectedIsNeg,
                            resultSpan,
                            correctionBox,
                            corrListenBtn,
                            corrTextSpan,
                            () =>
                                recordedAudioUrl
                        );
                    } else {
                        resultSpan.textContent =
                            "No speech detected. Please try again.";

                        resultSpan.style.color =
                            "var(--text-secondary)";

                        correctionBox.style.display =
                            "none";
                    }

                    finishingRecording = false;
                };

                mediaRecorder.start();

                recordingActive = true;

                // ------------------------------------------------------------
                // Speech Recognition
                // ------------------------------------------------------------

                const SpeechRecognition =
                    window.SpeechRecognition ||
                    window.webkitSpeechRecognition;

                if (SpeechRecognition) {
                    recognition =
                        new SpeechRecognition();

                    recognition.lang =
                        "ja-JP";

                    recognition.interimResults =
                        false;

                    // P1 / P2 と同じ
                    recognition.continuous =
                        false;

                    recognition.onresult =
                        e => {
                            let rawTranscript =
                                "";

                            for (
                                let i =
                                    e.resultIndex;
                                i <
                                e.results.length;
                                i++
                            ) {
                                if (
                                    e.results[i]
                                        .isFinal
                                ) {
                                    rawTranscript +=
                                        e.results[i][0]
                                            .transcript;
                                }
                            }

                            if (
                                !rawTranscript
                            ) {
                                return;
                            }

                            accumulatedTranscript +=
                                rawTranscript;

                            // Auto:
                            // 最後の認識結果から1.5秒後に停止
                            if (
                                !isManualStop
                            ) {
                                scheduleAutostop();
                            }
                        };

                    recognition.onerror =
                        err => {
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
                }

                // ------------------------------------------------------------
                // Max 15 seconds
                // Auto / Manual 共通
                // ------------------------------------------------------------

                timeoutTimer =
                    setTimeout(() => {
                        stopRecordingProcess();
                    }, 15000);

                // ------------------------------------------------------------
                // Button state
                // ------------------------------------------------------------

                if (isManualStop) {
                    recordBtn.disabled = true;

                    stopBtn.disabled = false;

                    stopBtn.classList.add(
                        "stop-btn-active"
                    );

                    resultSpan.textContent =
                        "Recording (Max 15s)...";
                } else {
                    recordBtn.disabled = true;

                    stopBtn.disabled = true;

                    stopBtn.classList.remove(
                        "stop-btn-active"
                    );

                    resultSpan.textContent =
                        "Recording...";
                }

                resultSpan.style.color =
                    "var(--accent-color)";

                correctionBox.style.display =
                    "none";

            } catch (err) {
                console.error(
                    "Mic error:",
                    err
                );

                recordingActive = false;
                finishingRecording = false;

                resultSpan.textContent =
                    "Mic error";

                resultSpan.style.color =
                    "var(--error-text)";

                recordBtn.disabled =
                    false;

                stopBtn.disabled =
                    true;

                stopBtn.classList.remove(
                    "stop-btn-active"
                );
            }
        }
    );

    // ------------------------------------------------------------------------
    // Manual stop button
    // ------------------------------------------------------------------------

    stopBtn.addEventListener(
        "click",
        () => {
            stopRecordingProcess();
        }
    );
}

// ============================================================================
// Custom Practice
// ============================================================================

function createCustomPractice() {
    const container =
        document.getElementById(
            "customPractice"
        );

    if (!container) return;

    container.innerHTML = "";

    const title =
        document.createElement("h2");

    title.textContent =
        "Custom Practice";

    container.appendChild(title);

    const description =
        document.createElement("p");

    description.textContent =
        "Choose X and Y, then listen or record.";

    container.appendChild(description);

    const row =
        document.createElement("div");

    row.className =
        "custom-practice-row";

    const xSelect =
        document.createElement("select");

    xSelect.innerHTML =
        `<option value="">Xを選択</option>`;

    customDict.x.forEach(
        value => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = value;
            option.textContent = value;

            xSelect.appendChild(
                option
            );
        }
    );

    const ySelect =
        document.createElement("select");

    ySelect.innerHTML =
        `<option value="">Yを選択</option>`;

    customDict.y.forEach(
        value => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = value;
            option.textContent = value;

            ySelect.appendChild(
                option
            );
        }
    );

    const listenBtn =
        document.createElement("button");

    listenBtn.className =
        "custom-listen-btn";

    listenBtn.disabled = true;

    listenBtn.innerHTML =
        '🔊きく<span class="custom-tip-box">Listen to the sentence.</span>';

    const recordBtn =
        document.createElement("button");

    recordBtn.className =
        "custom-record-btn";

    recordBtn.disabled = true;

    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn =
        document.createElement("button");

    stopBtn.className =
        "custom-stop-btn";

    stopBtn.disabled = true;

    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop recording.</span>';

    const resultSpan =
        document.createElement("span");

    resultSpan.className =
        "custom-result";

    resultSpan.textContent =
        "(Not recorded yet)";

    const correctionBox =
        document.createElement("div");

    correctionBox.className =
        "correction-box";

    correctionBox.style.display =
        "none";

    const corrTextSpan =
        document.createElement("span");

    const corrListenBtn =
        document.createElement("button");

    corrListenBtn.textContent =
        "🔊";

    correctionBox.appendChild(
        corrTextSpan
    );

    correctionBox.appendChild(
        corrListenBtn
    );

    row.appendChild(xSelect);
    row.appendChild(ySelect);
    row.appendChild(listenBtn);
    row.appendChild(recordBtn);
    row.appendChild(stopBtn);
    row.appendChild(resultSpan);
    row.appendChild(correctionBox);

    container.appendChild(row);

    const updateButtons =
        () => {
            const enabled =
                xSelect.value &&
                ySelect.value;

            listenBtn.disabled =
                !enabled;

            recordBtn.disabled =
                !enabled;

            if (!enabled) {
                stopBtn.disabled =
                    true;
            }
        };

    xSelect.addEventListener(
        "change",
        updateButtons
    );

    ySelect.addEventListener(
        "change",
        updateButtons
    );

    listenBtn.addEventListener(
        "click",
        () => {
            if (
                !xSelect.value ||
                !ySelect.value
            ) {
                return;
            }

            const text =
                `${xSelect.value}は${ySelect.value}です`;

            speechSynthesis.cancel();

            const utterance =
                new SpeechSynthesisUtterance(
                    text
                );

            utterance.lang =
                "ja-JP";

            utterance.rate =
                0.8;

            speechSynthesis.speak(
                utterance
            );
        }
    );

    bindRecorderEvents(
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => xSelect.value,
        () => ySelect.value,
        false
    );
}

// ============================================================================
// Drill Rows
// ============================================================================

function createDrillRow(item, index) {
    const row =
        document.createElement("div");

    row.className =
        "task-row";

    const sentence =
        getExpectedSentence(
            item.x,
            item.y,
            item.isNeg
        );

    row.innerHTML = `
        <div class="task-number">
            ${index + 1}.
        </div>

        <div class="task-sentence">
            ${sentence}
        </div>

        <button class="listen-btn">
            🔊きく
        </button>

        <button class="record-btn">
            ⏺️とる
            <span class="custom-tip-box">
                Start recording your voice.
            </span>
        </button>

        <button class="stop-btn" disabled>
            <span class="stop-btn-emoji">⏹️</span>
            <span class="custom-tip-box">
                Stop the active recording.
            </span>
        </button>

        <span class="result-text">
            (Not recorded yet)
        </span>

        <div class="correction-box" style="display:none;">
            <span class="correction-text"></span>
            <button class="correction-listen-btn">
                🔊
            </button>
        </div>
    `;

    const listenBtn =
        row.querySelector(
            ".listen-btn"
        );

    const recordBtn =
        row.querySelector(
            ".record-btn"
        );

    const stopBtn =
        row.querySelector(
            ".stop-btn"
        );

    const resultSpan =
        row.querySelector(
            ".result-text"
        );

    const correctionBox =
        row.querySelector(
            ".correction-box"
        );

    const corrListenBtn =
        row.querySelector(
            ".correction-listen-btn"
        );

    const corrTextSpan =
        row.querySelector(
            ".correction-text"
        );

    listenBtn.addEventListener(
        "click",
        () => {
            speechSynthesi
```
