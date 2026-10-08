// ============================================================================
// Data for Drill 1
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
    }
];

// ============================================================================
// Core Logic (共通)
// ============================================================================
let isManualStop = false;
let isAutoPlay = true;

let activePlayback = {
    audio: null,
    timeoutId: null,
    cancel: function() {
        if (this.audio) { this.audio.pause(); this.audio = null; }
        if (this.timeoutId) { clearTimeout(this.timeoutId); this.timeoutId = null; }
        speechSynthesis.cancel();
    }
};

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

    listenBtn.onclick = () => {
        activePlayback.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "ja-JP";
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    };

    meaningBtn.onclick = (e) => {
        e.stopPropagation();
        meaningPopup.classList.toggle("show");
    };

    recordBtn.onclick = async () => {
        activePlayback.cancel();
        audioChunks = [];
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                recordedAudioUrl = URL.createObjectURL(audioBlob);
                playRecordBtn.style.display = "inline-flex";
                if (isAutoPlay) {
                    const utterance = new SpeechSynthesisUtterance(speechText);
                    utterance.lang = "ja-JP";
                    utterance.onend = () => {
                        setTimeout(() => { if(recordedAudioUrl) new Audio(recordedAudioUrl).play(); }, 500);
                    };
                    speechSynthesis.speak(utterance);
                }
            };

            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRec) {
                recognition = new SpeechRec();
                recognition.lang = "ja-JP";
                recognition.onresult = e => {
                    resultSpan.textContent = "認識結果: " + e.results[0][0].transcript;
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
        } catch (e) { resultSpan.textContent = "マイクエラー"; }
    };

    stopBtn.onclick = () => {
        if (!isRecording) return;
        isRecording = false;
        mediaRecorder.stop();
        if (recognition) recognition.stop();
        audioStream.getTracks().forEach(t => t.stop());
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.remove("stop-btn-active");
    };

    playRecordBtn.onclick = () => {
        if (recordedAudioUrl) new Audio(recordedAudioUrl).play();
    };
}

function initDrill() {
    const drillList = document.getElementById("drillList");
    if (!drillList) return;
    drillList.innerHTML = "";

    const header = document.createElement("div");
    header.className = "header-panel";
    header.innerHTML = `
        <div class="title-instruction-group">
            <strong>設定パネル</strong>
        </div>
        <div class="control-group">
            <div class="control-item">
                <span class="mode-label">自動停止</span>
                <label class="switch"><input type="checkbox" id="stopModeSwitch"><span class="slider"></span></label>
                <span class="mode-label">手動停止</span>
            </div>
            <div class="control-item">
                <span class="mode-label">再生: 自動</span>
                <label class="switch"><input type="checkbox" id="playModeSwitch" checked><span class="slider"></span></label>
            </div>
        </div>
    `;
    drillList.appendChild(header);

    document.getElementById("stopModeSwitch").onchange = e => isManualStop = e.target.checked;
    document.getElementById("playModeSwitch").onchange = e => isAutoPlay = e.target.checked;

    modelSentences.forEach((item, idx) => {
        const row = document.createElement("div");
        row.className = "drill-row";
        let htmlContent = "", speechText = "";
        item.displayHtml.forEach(p => {
            if (p.type === "symbol") {
                htmlContent += `<span style="color:${item.symbolColor}">${p.val}</span>`;
            } else {
                speechText += p.text;
                const cls = p.low ? "low-pitch" : "high-pitch";
                htmlContent += `<span class="${cls}" style="text-decoration-color:${item.symbolColor}">${p.text}</span>`;
            }
        });

        row.innerHTML = `
            <div class="top-row">
                <span style="color:var(--text-secondary); font-weight:bold;">${idx + 1}.</span>
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
document.addEventListener("DOMContentLoaded", initDrill);
