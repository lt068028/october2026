let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

// 音声認識（SpeechRecognition）のセットアップ
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
const resultDisplay = document.createElement('p');
resultDisplay.id = 'resultDisplay';
resultDisplay.style.fontWeight = 'bold';
resultDisplay.style.color = '#2c3e50';
document.body.appendChild(resultDisplay);

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resultDisplay.textContent = `認識されたテキスト: ${transcript}`;
        console.log("認識されたテキスト:", transcript);
    };

    recognition.onerror = (event) => {
        console.error("音声認識エラー:", event.error);
    };
} else {
    resultDisplay.textContent = "このブラウザは音声認識に対応していません。";
}

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
            
            const audioElement = document.createElement('audio');
            audioElement.src = audioUrl;
            audioElement.controls = true;
            document.body.appendChild(audioElement);
            
            audioChunks = [];
        };

        console.log("マイクの準備が完了した。");
    } catch (error) {
        console.error("マイクの初期化に失敗した。", error);
    }
}

recordBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    audioChunks = [];
    resultDisplay.textContent = "音声認識中...";
    mediaRecorder.start();
    if (recognition) {
        recognition.start();
    }
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    console.log("録音および音声認識を開始した。");
});

stopBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    if (recognition) {
        recognition.stop();
    }
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    console.log("録音を停止した。");
});

initRecorder();
