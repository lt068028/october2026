let mediaRecorder;
let audioChunks = [];
let audioStream = null;
let recognition = null;
let currentTranscript = "";

// --- 1. スタイル設定の注入 ---
const styleElement = document.createElement('style');
styleElement.textContent = `
    .mode-container {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        font-family: sans-serif;
    }
    .mode-label {
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: color 0.3s, opacity 0.3s;
    }
    .inactive-mode {
        color: #aaa;
        opacity: 0.4;
    }
    .active-mode {
        color: #2196F3;
        opacity: 1.0;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #2196F3;
        transition: .4s;
        border-radius: 28px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider:before {
        transform: translateX(22px);
    }
    .control-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        font-family: sans-serif;
    }
    ruby { ruby-align: center; }
    rt { font-size: 0.7em; color: #666; }
`;
document.head.appendChild(styleElement);

// 既存のボタン要素を取得
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

if (recordBtn && stopBtn) {
    recordBtn.textContent = 'Record';
    stopBtn.textContent = 'Stop';
}

// --- 2. ふりがな切り替えスイッチの構築 ---
const controlPanel = document.createElement('div');
controlPanel.className = 'mode-container';

const labelOn = document.createElement('span');
labelOn.className = 'mode-label active-mode';
labelOn.textContent = 'Withふりがな';

const switchLabel = document.createElement('label');
switchLabel.className = 'switch';
const rubyToggleInput = document.createElement('input');
rubyToggleInput.type = 'checkbox';
rubyToggleInput.id = 'rubyToggleInput';
rubyToggleInput.checked = true;
const sliderSpan = document.createElement('span');
sliderSpan.className = 'slider';
switchLabel.appendChild(rubyToggleInput);
switchLabel.appendChild(sliderSpan);

const labelOff = document.createElement('span');
labelOff.className = 'mode-label inactive-mode';
labelOff.textContent = 'Noふりがな';

controlPanel.appendChild(labelOn);
controlPanel.appendChild(switchLabel);
controlPanel.appendChild(labelOff);

if (recordBtn) {
    document.body.insertBefore(controlPanel, recordBtn);
} else {
    document.body.appendChild(controlPanel);
}

// --- 3. 自動／手動停止スイッチの構築 ---
const modeContainer = document.createElement('div');
modeContainer.style.display = 'flex';
modeContainer.style.alignItems = 'center';
modeContainer.style.gap = '8px';
modeContainer.style.marginLeft = '10px';

const autoLabel = document.createElement('span');
autoLabel.className = 'mode-label active-mode';
autoLabel.style.fontSize = '13px';
autoLabel.textContent = 'Auto Stop';

const stopSwitchLabel = document.createElement('label');
stopSwitchLabel.className = 'switch';
stopSwitchLabel.style.width = '40px';
stopSwitchLabel.style.height = '22px';

const stopModeToggle = document.createElement('input');
stopModeToggle.type = 'checkbox';
stopModeToggle.id = 'stopModeToggle';
stopModeToggle.checked = false;

const stopSliderSpan = document.createElement('span');
stopSliderSpan.className = 'slider';
stopSwitchLabel.appendChild(stopModeToggle);
stopSwitchLabel.appendChild(stopSliderSpan);

const manualLabel = document.createElement('span');
manualLabel.className = 'mode-label inactive-mode';
manualLabel.style.fontSize = '13px';
manualLabel.textContent = 'Manual Stop';

modeContainer.appendChild(autoLabel);
modeContainer.appendChild(stopSwitchLabel);
modeContainer.appendChild(manualLabel);

if (stopBtn && stopBtn.parentNode) {
    stopBtn.parentNode.insertBefore(modeContainer, stopBtn.nextSibling);
}

// ステータス表示
const statusDisplay = document.createElement('p');
statusDisplay.id = 'statusDisplay';
statusDisplay.style.fontWeight = 'bold';
statusDisplay.style.color = '#2c3e50';
statusDisplay.textContent = 'Ready...';
if (recordBtn) {
    document.body.insertBefore(statusDisplay, recordBtn);
} else {
    document.body.appendChild(statusDisplay);
}

const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

let isRubyEnabled = true;
let isManualStop = false;

rubyToggleInput.addEventListener('change', (e) => {
    isRubyEnabled = e.target.checked;
    if (isRubyEnabled) {
        labelOn.className = 'mode-label active-mode';
        labelOff.className = 'mode-label inactive-mode';
    } else {
        labelOff.className = 'mode-label active-mode';
        labelOn.className = 'mode-label inactive-mode';
    }
});

stopModeToggle.addEventListener('change', (e) => {
    isManualStop = e.target.checked;
    if (!isManualStop) {
        autoLabel.className = 'mode-label active-mode';
        manualLabel.className = 'mode-label inactive-mode';
    } else {
        manualLabel.className = 'mode-label active-mode';
        autoLabel.className = 'mode-label inactive-mode';
    }
});

// --- 4. 変換辞書（漢字 -> ルビ用） ---
const kanjiMap = {
    "私": "わたし",
    "学生": "がくせい",
    "先生": "せんせい",
    "本": "ほん",
    "机": "つくえ",
    "椅子": "いす",
    "車": "くるま",
    "部屋": "へや",
    "猫": "ねこ",
    "犬": "いぬ",
    "私達": "わたしたち",
    "今日": "きょう",
    "明日": "あした",
    "昨日": "きのう",
    "日本語": "にほんご",
    "英語": "えいご",
    "友達": "ともだち"
};

function processText(text, rubyOn) {
    if (!text) return "（No transcription）";
    let processed = text;
    if (rubyOn) {
        for (const [kanji, hira] of Object.entries(kanjiMap)) {
            const regex = new RegExp(kanji, 'g');
            processed = processed.replace(regex, `<ruby>${kanji}<rt>${hira}</rt></ruby>`);
        }
    }
    return processed;
}

// --- 5. 録音および音声認識の制御 ---
function finalizeRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const itemDiv = document.createElement('div');
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.gap = '15px';
    itemDiv.style.marginBottom = '10px';
    itemDiv.style.padding = '8px';
    itemDiv.style.backgroundColor = '#fff';
    itemDiv.style.border = '1px solid #ddd';
    itemDiv.style.borderRadius = '4px';

    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    audioElement.controls = true;

    const textSpan = document.createElement('span');
    const formattedHTML = processText(currentTranscript, isRubyEnabled);
    textSpan.innerHTML = formattedHTML;

    itemDiv.appendChild(audioElement);
    itemDiv.appendChild(textSpan);
    
    listContainer.appendChild(itemDiv);
    statusDisplay.textContent = 'Ready...';

    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }

    if (recordBtn) recordBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
}

async function startRecording() {
    try {
        audioChunks = [];
        currentTranscript = "";
        
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(audioStream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.start();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'ja-JP';
            recognition.interimResults = false;
            recognition.continuous = isManualStop;

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                currentTranscript = transcript;
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
            };

            recognition.onend = () => {
                if (!isManualStop) {
                    finalizeRecording();
                }
            };

            recognition.start();
        }

        statusDisplay.textContent = "Recording...";
        if (recordBtn) recordBtn.disabled = true;

        if (isManualStop) {
            if (stopBtn) stopBtn.disabled = false;
        } else {
            if (stopBtn) stopBtn.disabled = true;
        }

    } catch (error) {
        console.error("Microphone access error:", error);
        statusDisplay.textContent = "Microphone access error.";
    }
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
    }
    statusDisplay.textContent = "Processing...";
    finalizeRecording();
}

if (recordBtn) recordBtn.addEventListener('click', startRecording);
if (stopBtn) {
    stopBtn.addEventListener('click', stopRecording);
    stopBtn.disabled = true;
}
