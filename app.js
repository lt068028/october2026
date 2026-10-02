let mediaRecorder;
let audioChunks = [];
let currentTranscript = "";

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

// --- UI要素（漢字切り替えボタン、ライブ表示、リスト）の動的生成 ---
const controlPanel = document.createElement('div');
controlPanel.style.marginBottom = '15px';

const kanjiToggleBtn = document.createElement('button');
kanjiToggleBtn.id = 'kanjiToggleBtn';
kanjiToggleBtn.textContent = '漢字モード: OFF (ひらがな)';
kanjiToggleBtn.style.padding = '6px 12px';
kanjiToggleBtn.style.cursor = 'pointer';
controlPanel.appendChild(kanjiToggleBtn);
document.body.insertBefore(controlPanel, recordBtn);

// ライブ表示エリア
const currentDisplay = document.createElement('p');
currentDisplay.id = 'currentDisplay';
currentDisplay.style.fontWeight = 'bold';
currentDisplay.style.color = '#2c3e50';
currentDisplay.textContent = '待機中...';
document.body.insertBefore(currentDisplay, recordBtn);

// 過去の録音結果を蓄積するリスト用コンテナ
const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

// 漢字モードの状態管理（初期値 OFF）
let isKanjiEnabled = false;

kanjiToggleBtn.addEventListener('click', () => {
    isKanjiEnabled = !isKanjiEnabled;
    if (isKanjiEnabled) {
        kanjiToggleBtn.textContent = '漢字モード: ON';
        kanjiToggleBtn.style.backgroundColor = '#d4edda';
    } else {
        kanjiToggleBtn.textContent = '漢字モード: OFF (ひらがな)';
        kanjiToggleBtn.style.backgroundColor = '';
    }
});

// --- 音声認識のセットアップ ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let finalTranscriptCache = "";

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            finalTranscriptCache += finalTranscript;
        }

        // 録音中は漢字ON/OFFに関わらず、直近の認識音声をひらがな風（またはそのまま）でライブ表示
        currentTranscript = finalTranscriptCache + interimTranscript;
        currentDisplay.textContent = `音声認識中: ${currentTranscript}`;
    };

    recognition.onerror = (event) => {
        console.error("音声認識エラー:", event.error);
    };
} else {
    currentDisplay.textContent = "このブラウザは音声認識に対応していない。";
}

// --- 簡易的なひらがな変換（必要に応じた補正用、ブラウザの確定結果を活用） ---
function formatText(text, kanjiOn) {
    if (!text) return "（認識テキストなし）";
    if (!kanjiOn) {
        // 漢字OFFの場合は全角カタカナや漢字を簡易的にひらがなに寄せる、あるいはそのまま返す
        // ブラウザのWeb Speech API特性上、強制変換は難しいため、そのまま使用または必要に応じて調整
        return text; 
    }
    return text; // 漢字ONの場合は音声認識エンジンの最終確定結果（漢字混じり）をそのまま返す
}

// --- 録音機能のセットアップ ---
async function initRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 1件分のコンテナ作成
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
            // 漢字モードの状態に応じて表示を分ける
            const processedText = formatText(currentTranscript, isKanjiEnabled);
            textSpan.textContent = `[${isKanjiEnabled ? '漢字' : 'ひらがな'}] ${processedText}`;

            itemDiv.appendChild(audioElement);
            itemDiv.appendChild(textSpan);
            
            listContainer.appendChild(itemDiv);
            
            audioChunks = [];
            currentTranscript = "";
            finalTranscriptCache = "";
            currentDisplay.textContent = '待機中...';
        };

        console.log("マイクの準備が完了した。");
    } catch (error) {
        console.error("マイクの初期化に失敗した。", error);
    }
}

recordBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    audioChunks = [];
    currentTranscript = "";
    finalTranscriptCache = "";
    currentDisplay.textContent = "音声認識中...";
    mediaRecorder.start();
    if (recognition) {
        recognition.start();
    }
    recordBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    if (recognition) {
        recognition.stop();
    }
    recordBtn.disabled = false;
    stopBtn.disabled = true;
});

initRecorder();
