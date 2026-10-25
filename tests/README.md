# 音声操作の回帰テスト

Playwright（Node.jsパッケージ）とChromiumが利用できる環境で、リポジトリ直下から実行する。

```bash
node tests/audio-transitions.cjs
node tests/audio-lifecycle.cjs
node tests/audio-recovery.cjs
node tests/audio-relay.cjs
node tests/answer-rules.cjs
```

Chromiumが `/usr/bin/chromium` にない場合は `CHROMIUM_PATH` に実行ファイルのパスを指定する。
Playwrightはテスト実行環境に用意する。サイト自体にビルドやnpm依存は追加していない。

- `audio-transitions.cjs`：80項目。作文・発音1・発音2で、有効な録音→自動再生→次行、Labの左→右→左、録音→再生→モデル音→再録音、許可拒否からの復帰、Autostop ON→OFF、禁止カーソル、モデル収音の終了通知欠落、発音2のリレー／手動／LabのPlaying表示と再生中Autoplay切替許可、Casual無効化、ℹ️案内を検証する。マウスクリックはPlaywright、Recorder／認識終了は非同期で実行する。
- `audio-recovery.cjs`：88項目。全8ページのTTS20秒、録音再生duration＋3秒／未取得時23秒、作文の個別・リレー表示、Lab解析10秒、完了しないdecode／close、録音保持・再試行・遅い結果の破棄を確認する。実Workerの元の計算との一致、CPUを占有するWorkerの期限中断も検証する。
- `audio-relay.cjs`：192項目。全8ページで実際に録音を完了させ、自動リレー全区間の両表示、途中OFF後の継続、次回録音への設定適用、個別再生表示、TTSエラー時の中止と録音保持、別再生・次録音によるキャンセル、遅い通知の破棄、両LabのInstructionとTTSエラー時のマイク解放を確認する。
- `audio-lifecycle.cjs`：167項目。全8ページのロック、再生キャンセル、遅いイベント、ページ離脱、Voice変更とモデル曲線の無効化を確認する。

音声合成・マイク・録音・デコード・ピッチ値には制御可能な代替を使用し、回復テストの一部では実Workerと合成波形も使用する。実際の音声認識精度、TTS発音、ピッチ品質、ChromeOS固有の許可UIを保証するテストではない。初期の167項目だけでは有効録音後の連続操作によるロック競合を検出できなかったため、再現可能な回帰テストを追加した。

- `answer-rules.cjs`：255項目。認識対象7ページの全対応文体でよ／ね／よね、Formal質問のか、数字の表記差、主語と目的語の区別、時間条件、言い直し、Habit必須語を検証する。文字列を実際のページ判定関数へ入力する検証であり、マイク認識精度の試験ではない。
