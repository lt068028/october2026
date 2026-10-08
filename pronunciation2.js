// ============================================================================
// Data for Drill 2
// ============================================================================
const modelSentences = [
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
// State & Core Logic
// ============================================================================
let isManualStop = false;
let isAutoPlay = true;

// グローバルな再生管理
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

/**
 * 録音・音声認識・UI制御のセットアップ
 */
function setupRecordingEvents(rowElement, itemObj, speechText) {
    const listenBtn = rowElement.querySelector(".listen-btn");
    const recordBtn = rowElement.querySelector(".record-btn");
    const stopBtn = rowElement.querySelector(".stop-btn");
    const resultSpan = rowElement.querySelector(".result-text");
    const playRecordBtn = rowElement.querySelector(".play-record-btn");
    const meaningBtn = rowElement.querySelector(".meaning-btn");
    const meaningPopup = rowElement.querySelector(".meaning-popup");

    let mediaRecorder, audioStream, recognition, recordedAudioUrl;
    let audioChunks = [];
    let isRecording = false;

    // --- お手本再生 ---
    listenBtn.onclick = () => {
        activePlayback.cancel();
        listenBtn.disabled = true;
        const originalText = listenBtn.textContent;
        listenBtn.textContent = "🔊再生中...";
        
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "ja-JP";
        utterance.rate = 0.8;
        utterance.onend = () => {
            listenBtn.disabled = false;
            listenBtn.textContent = originalText;
        };
        speechSynthesis.speak(utterance);
    };

    // --- 意味の表示 ---
    meaningBtn.onclick = (e) => {
        e.stopPropagation();
        meaningPopup.classList.toggle("show");
    };

    // --- 録音開始 ---
    recordBtn.onclick = async () => {
        activePlayback.cancel();
        audioChunks = [];
        
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);
            
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
                recordedAudioUrl = URL.createObjectURL(audioBlob);
                
                playRecordBtn.style.display = "inline-flex";

                // 自動再生モードの場合
                if (isAutoPlay) {
                    const utterance = new SpeechSynthesisUtterance(speechText);
                    utterance.lang = "ja-JP";
                    utterance.onend = () => {
                        activePlayback.timeoutId = setTimeout(() => {
                            if (recordedAudioUrl) {
                                const audio = new Audio(recordedAudioUrl);
                                activePlayback.audio = audio;
                                audio.play();
                            }
                        }, 500);
                    };
                    speechSynthesis.speak(utterance);
                }
            };

            // 音声認識
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.lang = "ja-JP";
                recognition.onresult = e => {
                    const transcript = e.results[0][0].transcript;
                    resultSpan.textContent = "結果: " + transcript;
                    // 手動停止モードでなければ、認識した時点で停止
                    if (!isManualStop) stopBtn.click();
                };
                recognition.start();
            }

            mediaRecorder.start();
            isRecording = true;
            recordBtn.disabled = true;
            stopBtn.disabled = false;
            stopBtn.classList.add("stop-btn-active");
            resultSpan.textContent = "録音中...";
            resultSpan.style.color = "var(--accent-color)";

        } catch (err) {
            console.error("Mic error:", err);
            resultSpan.textContent = "エラー: マイクが使えません";
            resultSpan.style.color = "var(--error-text)";
        }
    };

    // --- 録音停止 ---
    stopBtn.onclick = () => {
        if (!isRecording) return;
        isRecording = false;
        
        if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
        if (recognition) recognition.stop();
        if (audioStream) audioStream.getTracks().forEach(t => t.stop());
        
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");
        resultSpan.style.color = "var(--text-secondary)";
    };

    // --- 自分の録音を再生 ---
    playRecordBtn.onclick = () => {
        if (recordedAudioUrl) {
            activePlayback.cancel();
            const audio = new Audio(recordedAudioUrl);
            activePlayback.audio = audio;
            audio.play();
        }
    };
}

/**
 * 画面の初期化
 */
function initDrill() {
    const drillList = document.getElementById("drillList");
    if (!drillList) return;
    drillList.innerHTML = "";

    // --- ヘッダー（設定パネル） ---
    const header = document.createElement("div");
    header.className = "header-panel";
    header.innerHTML = `
        <div class="title-instruction-group">
            <strong>設定パネル</strong>
            <span style="font-size:12px; color:var(--text-secondary)">録音の動作を切り替えられます。</span>
        </div>
        <div class="control-group">
            <div class="control-item">
                <span class="mode-label ${!isManualStop ? '' : 'inactive-mode'}">自動停止</span>
                <label class="switch">
                    <input type="checkbox" id="stopModeSwitch" ${isManualStop ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <span class="mode-label ${isManualStop ? '' : 'inactive-mode'}">手動停止</span>
            </div>
            <div class="control-item">
                <span class="mode-label">お手本＋自分の声 自動再生</span>
                <label class="switch">
                    <input type="checkbox" id="playModeSwitch" ${isAutoPlay ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    `;
    drillList.appendChild(header);

    // スイッチのイベント
    document.getElementById("stopModeSwitch").onchange = e => {
        isManualStop = e.target.checked;
        initDrill(); // ラベルの太字を更新するために再描画
    };
    document.getElementById("playModeSwitch").onchange = e => {
        isAutoPlay = e.target.checked;
    };

    // --- 文リストの生成 ---
    modelSentences.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "drill-row";
        
        let htmlContent = "";
        let speechText = "";
        
        item.displayHtml.forEach(part => {
            if (part.type === "symbol") {
                htmlContent += `<span style="color: ${item.symbolColor};">${part.val}</span>`;
            } else {
                speechText += part.text;
                const pitchClass = part.low ? "low-pitch" : "high-pitch";
                htmlContent += `<span class="${pitchClass}" style="text-decoration-color: ${item.symbolColor};">${part.text}</span>`;
            }
        });

        row.innerHTML = `
            <div class="top-row">
                <span style="font-weight:bold; color:var(--text-secondary); min-width:25px;">${index + 1}.</span>
                <button class="listen-btn">🔊 きく</button>
                <span class="sentence-label">${htmlContent}</span>
                <button class="record-btn">⏺️ とる</button>
                <button class="stop-btn" disabled>⏹️ 止める</button>
                <div class="result-container">
                    <span class="result-text">(未録音)</span>
                    <button class="play-record-btn">▶️ 再生</button>
                </div>
                <div class="meaning-container">
                    <button class="meaning-btn">🌐</button>
                    <div class="meaning-popup">${item.meaning}</div>
                </div>
            </div>
        `;
        
        drillList.appendChild(row);
        setupRecordingEvents(row, item, speechText);
    });
}

// 起動
document.addEventListener("DOMContentLoaded", initDrill);
