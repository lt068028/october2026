let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

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
    mediaRecorder.start();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    console.log("録音を開始した。");
});

stopBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    console.log("録音を停止した。");
});

initRecorder();
