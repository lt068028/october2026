/**
 * ドリル音声再生および状態管理クラス
 */
class DrillAudioPlayer {
  constructor() {
    this.currentAudio = null; // 現在再生中のAudioオブジェクト
    this.timeoutId = null;    // 待機時間（0.1秒）用のタイマーID
    this.isPlaying = false;   // 再生状態のフラグ
  }

  /**
   * 現在の再生と待機キューを強制終了する（キャンセルオーバー処理）
   */
  cancelPlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isPlaying = false;
  }

  /**
   * 次のドリルへ遷移する
   * 前の音声が再生中の場合は即座に破棄される
   */
  moveToNextDrill() {
    this.cancelPlayback();
    console.log("前の音声をキャンセルし、次のドリルへ遷移した。");
    
    // UIを初期状態にリセットする処理をここに実装する
    // 例: document.getElementById('playButton').textContent = "▶️";

    // 次のドリルのデータをロードする処理をここに実装する
  }

  /**
   * 音声再生シーケンスを実行する
   * @param {string} modelVoiceUrl - モデル音声のURL
   * @param {string} recordedVoiceUrl - 録音音声のURL
   * @param {HTMLElement} playButtonElement - 対象の再生ボタン要素
   */
  startPlaybackSequence(modelVoiceUrl, recordedVoiceUrl, playButtonElement) {
    // 1. 既存の再生処理が走っていれば強制キャンセル
    this.cancelPlayback();
    this.isPlaying = true;

    // 2. ボタンをフライングで「Playing...」に書き換え
    if (playButtonElement) {
      playButtonElement.textContent = "Playing...";
    }

    // 3. モデル音声のロードと再生
    this.currentAudio = new Audio(modelVoiceUrl);
    
    // モデル音声の再生終了時のイベント
    this.currentAudio.onended = () => {
      // 4. モデル音声終了から0.1秒(100ms)待機する
      this.timeoutId = setTimeout(() => {
        // 待機中に次のドリルへ遷移(キャンセル)された場合は処理を中断
        if (!this.isPlaying) return;

        // 5. 録音音声のロードと再生
        this.currentAudio = new Audio(recordedVoiceUrl);
        
        // 録音音声の再生終了時のイベント
        this.currentAudio.onended = () => {
          this.isPlaying = false;
          // 再生完了後、ボタンの表記を元に戻す
          if (playButtonElement) {
            playButtonElement.textContent = "▶️";
          }
        };

        // 録音音声の再生実行
        this.currentAudio.play().catch(error => {
          console.error("録音音声の再生エラー:", error);
          this.isPlaying = false;
        });

      }, 100); // 100ミリ秒 = 0.1秒
    };

    // モデル音声の再生実行
    this.currentAudio.play().catch(error => {
      console.error("モデル音声の再生エラー:", error);
      this.isPlaying = false;
      if (playButtonElement) {
        playButtonElement.textContent = "▶️";
      }
    });
  }
}

// ---------------------------------------------------------
// 実装例（貴殿のシステムに組み込む際の呼び出し方法）
// ---------------------------------------------------------
const player = new DrillAudioPlayer();

// 再生ボタンクリック時のイベントリスナー例
// document.getElementById('playButton').addEventListener('click', (event) => {
//   const modelUrl = 'path/to/model_audio.mp3';
//   const recordedUrl = 'path/to/recorded_audio.mp3';
//   const button = event.target;
//   player.startPlaybackSequence(modelUrl, recordedUrl, button);
// });

// 「次へ」ボタンクリック時のイベントリスナー例
// document.getElementById('nextButton').addEventListener('click', () => {
//   player.moveToNextDrill();
// });
