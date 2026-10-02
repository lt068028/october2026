let mediaRecorder;
let audioChunks = [];
let audioStream = null;
let recognition = null;
let currentTranscript = "";

// --- 1. スタイル設定 ---
const styleElement = document.createElement('style');
styleElement.textContent = `
    .controls-panel {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 15px;
        font-family: sans-serif;
        flex-wrap: wrap;
    }
    .control-item {
        display: flex;
        align-items: center;
        gap: 8px;
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
    ruby { ruby-align: center; }
    rt { font-size: 0.7em; color: #666; }
`;
document.head.appendChild(styleElement);

// 既存ボタンのテキストを英語に変更
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

if (recordBtn) recordBtn.textContent = 'Record';
if (stopBtn) stopBtn.textContent = 'Stop';

// --- 2. コントロールパネルの構築（Record/Stopの右側に並べる） ---
const panel = document.createElement('div');
panel.className = 'controls-panel';

// ふりがな切り替え (左: Withふりがな, 右: Noふりがな)
const rubyItem = document.createElement('div');
rubyItem.className = 'control-item';

const labelWithRuby = document.createElement('span');
labelWithRuby.className = 'mode-label active-mode';
labelWithRuby.textContent = 'Withふりがな';

const rubySwitch = document.createElement('label');
rubySwitch.className = 'switch';
const rubyToggleInput = document.createElement('input');
rubyToggleInput.type = 'checkbox';
rubyToggleInput.checked = false; // 左がデフォルト(With)
const rubySlider = document.createElement('span');
rubySlider.className = 'slider';
rubySwitch.appendChild(rubyToggleInput);
rubySwitch.appendChild(rubySlider);

const labelNoRuby = document.createElement('span');
labelNoRuby.className = 'mode-label inactive-mode';
labelNoRuby.textContent = 'Noふりがな';

rubyItem.appendChild(labelWithRuby);
rubyItem.appendChild(rubySwitch);
rubyItem.appendChild(labelNoRuby);

// 停止モード切り替え (左: Auto Stop, 右: Manual Stop)
const stopItem = document.createElement('div');
stopItem.className = 'control-item';

const labelAuto = document.createElement('span');
labelAuto.className = 'mode-label active-mode';
labelAuto.textContent = 'Auto Stop';

const stopSwitch = document.createElement('label');
stopSwitch.className = 'switch';
const stopModeToggle = document.createElement('input');
stopModeToggle.type = 'checkbox';
stopModeToggle.checked = false; // 左がデフォルト(Auto)
const stopSlider = document.createElement('span');
stopSlider.className = 'slider';
stopSwitch.appendChild(stopModeToggle);
stopSwitch.appendChild(stopSlider);

const labelManual = document.createElement('span');
labelManual.className = 'mode-label inactive-mode';
labelManual.textContent = 'Manual Stop';

stopItem.appendChild(labelAuto);
stopItem.appendChild(stopSwitch);
stopItem.appendChild(labelManual);

// パネルに要素を追加
if (recordBtn) panel.appendChild(recordBtn);
if (stopBtn) panel.appendChild(stopBtn);
panel.appendChild(rubyItem);
panel.appendChild(stopItem);

document.body.insertBefore(panel, document.body.firstChild);

// ステータス表示
const statusDisplay = document.createElement('p');
statusDisplay.id = 'statusDisplay';
statusDisplay.style.fontWeight = 'bold';
statusDisplay.style.color = '#2c3e50';
statusDisplay.textContent = 'Ready...';
document.body.insertBefore(statusDisplay, panel);

// リストコンテナ
const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

let isRubyEnabled = true;
let isManualStop = false;

rubyToggleInput.addEventListener('change', (e) => {
    isRubyEnabled = !e.target.checked; 
    if (isRubyEnabled) {
        labelWithRuby.className = 'mode-label active-mode';
        labelNoRuby.className = 'mode-label inactive-mode';
    } else {
        labelNoRuby.className = 'mode-label active-mode';
        labelWithRuby.className = 'mode-label inactive-mode';
    }
});

stopModeToggle.addEventListener('change', (e) => {
    isManualStop = e.target.checked; 
    if (!isManualStop) {
        labelAuto.className = 'mode-label active-mode';
        labelManual.className = 'mode-label inactive-mode';
    } else {
        labelManual.className = 'mode-label active-mode';
        labelAuto.className = 'mode-label inactive-mode';
    }
});

// --- 3. 変換辞書（漢字 -> ルビ用） ---
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

// --- 4. 録音および音声認識の制御 ---
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
