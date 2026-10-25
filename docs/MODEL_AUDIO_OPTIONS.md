# 発音モデル音声の固定ファイル化：方式検討

2026-10-25。ユーザー案Aを受けた調査・提案。録音ツールや学習ページへの固定音声搭載は未実装。CSS・速度設定の実装とは別作業。

## 推奨する進め方

1. 開発用の独立ページで、Chromeの選択Voice（まず日本語3・発音ページの現行rate 0.9での試作を提案）を1語だけ再生し、共有音声へ入るか実機検証する。
2. `getDisplayMedia` のタブ音声を試し、入らない場合は、その実機で選択可能ならシステム音声共有を試す。音声トラックの存在だけで成功扱いにせず、波形・デコード・保存ファイルの試聴で確認する。
3. 録音経路が確認できたら、一覧を1項目ずつ再生・録音して命名・保存する。長い録音からの音声認識・無音区切りによる自動分割は初期案にしない。
4. まず数語のアクセント対で、声・アクセント、語頭と語尾の欠け、余白、音量を確認してから全量を作る。
5. 再生に使用する確定ファイルそのものからモデル曲線を作り、音声と曲線を同じIDで管理する。現在のスピーカー→マイクによるモデル収音の置換は別途承認・実装する。

## 実現方法の比較

| 方法 | 仕組み | 手間・現実性 |
| :--- | :--- | :--- |
| A1：通常ページ＋タブ音声共有 | ユーザーが共有対象と音声共有を選び、得た音声トラックをMediaRecorderで記録 | 外部ソフト・拡張なしで試せる第一候補。選択したTTS出力がそのタブの収録対象になるか実機確認が必要 |
| A2：通常ページ＋システム音声共有 | 実機が提供する場合に、共有画面のシステム音声を記録 | TTSがタブ音声に入らない場合の候補。OS・Chromeが音声共有を提供することが条件。他の通知音等も混入し得る |
| B：開発用Chrome拡張 | tabCaptureと必要ならoffscreen documentでタブのストリームを取得し、バッチ録音 | 初回の導入・開発が増える。タブ指定操作を簡略化できるが、TTSがタブ外の音声経路なら必ず解決するとは限らない。通常ページでの試験後に必要性を判断 |
| C：OSのループバック録音 | OSが提供する出力音声の録音経路を使う | ブラウザで取得できない場合の代替。OSごとに対応方法・追加ツールの要否が異なる。初期案にはしない |

## 仕組み上の制約

- Web Speech APIは発話の再生・設定・イベントを提供するが、SpeechSynthesisUtteranceから音声Blob／AudioBuffer／MediaStreamを直接取り出す標準APIはない。speakの戻り値も音声ファイルではない。
- ChromeのTTS出力はOS・選択音声のエンジンにより異なる。したがって、タブキャプチャAPIがあることと、対象TTSの音声をその経路で取得できることは区別する。本プロジェクトの実機では未検証。
- getDisplayMediaにはユーザー操作と共有対象の選択が必要。共有許可を恒久保存して無操作で取得し続ける構成にはできない。1回の許可で得た共有ストリームを、同じバッチ内の各項目の録音に使用する案。
- getDisplayMediaの要求は映像も含めて行い、録音時は音声トラックだけのMediaStreamを作る。取得した映像をファイルに保存する必要はない。音声の取得可能範囲は環境依存で、audio:trueやsystemAudio:includeだけでは音声取得を保証しない。

## 分割・ファイル形式・作業量

- 1語ごとにRecorder開始→TTS再生→終了通知＋余白→Recorder停止→データ確定の順に進める。次の語は前のRecorder停止・保存完了後に再生する。語頭の無声子音を無音判定で切り落とさない。
- 初期検証はMediaRecorderが対応するWebM/Opus等。形式はisTypeSupportedで確認する。MP3への直接録音は前提にせず、必要なら別途エンコードする。拡張子の変更だけでは変換できない。
- 解析用・保存原本の候補はPCM/WAV。ブラウザ内で共有音声をWeb Audio／AudioWorkletから収集しWAVを書き出せるが、MediaRecorderのWebMより実装は増える。最初の収録経路確認には不要。
- ZIPで1回書き出すか、対応するChromeなら最初に保存先フォルダーを選び、まとめて保存する。多数の自動ダウンロードを前提にしない。
- 所要時間は概ね「項目数×実再生時間と余白×Voice数」。1 Voice・短い20〜30語なら1〜2分程度に収まる可能性はあるが、4 Voice・ネットワーク待機・試聴・再収録まで含めて保証はできない。
- 単語を単独で読ませるか、今の対語・文脈の中で読ませるかでTTSのアクセントが変わる可能性がある。実際に評価した読み上げ文字列・区切りを確定して保存する。
- manifestにモデルID、表示語、読み上げ文字列、voice.name／voiceURI／lang、rate／pitch、収録環境・日時、ファイル名・長さを保存する。初回は日本語3に絞る案を推奨し、1〜4の全Voiceを作るかは別途決める。
- 固定ファイルを使用する発音ページでは、Voice設定との対応・変更時の扱いを別仕様として決める。現在のVoice設定を無断で無効化しない。

## 調査した一次資料

- [Web Speech API：SpeechSynthesis／Utteranceのインターフェース](https://webaudio.github.io/web-speech-api/#speechsynthesisutterance)
- [Chromium：Chrome／Chrome OSのTTS出力経路](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/accessibility/browser/tts.md)
- [Chrome：音声録音・画面キャプチャ](https://developer.chrome.com/docs/extensions/how-to/web-platform/screen-capture)
- [Chrome：tabCapture](https://developer.chrome.com/docs/extensions/reference/api/tabCapture)
- [getDisplayMedia：音声取得と許可条件](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [MediaRecorder.isTypeSupported](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static)
