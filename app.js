// 音声録音とMediaRecorder APIのテスト用ロジック

let mediaRecorder;
let audioChunks = [];

// マイクへのアクセス権限をリクエストし、録音の準備をする関数
async function setupRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        // データが集まったときの処理
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        // 録音が停止したときの処理（Blobデータの生成と再生確認）
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 画面上に再生用のプレイヤーを作る
            const audioElement = document.createElement('audio');
            audioElement.src = audioUrl;
            audioElement.controls = true;
            document.body.appendChild(audioElement);
            
            console.log("録音が完了しました。音声を確認できます。");
        };

        console.log("マイクの準備が完了しました。");
    } catch (error) {
        console.error("マイクへのアクセスが拒否されたか、利用できません。", error);
    }
}

// 実行テスト
setupRecorder();
