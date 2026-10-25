# 音声操作の回帰テスト

Playwright（Node.jsパッケージ）とChromiumが利用できる環境で、リポジトリ直下から実行する。

```bash
node tests/audio-transitions.cjs
node tests/audio-lifecycle.cjs
node tests/audio-recovery.cjs
node tests/audio-relay.cjs
node tests/answer-rules.cjs
node tests/voice-default.cjs
node tests/css-regression.cjs
```

Chromiumが `/usr/bin/chromium` にない場合は `CHROMIUM_PATH` に実行ファイルのパスを指定する。
Playwrightはテスト実行環境に用意する。サイト自体にビルドやnpm依存は追加していない。

- `audio-transitions.cjs`：80項目。作文・発音1・発音2で、有効な録音→自動再生→次行、Labの左→右→左、録音→再生→モデル音→再録音、許可拒否からの復帰、Autostop ON→OFF、禁止カーソル、モデル収音の終了通知欠落、発音2のリレー／手動／LabのPlaying表示と再生中Autoplay切替許可、Casual無効化、ℹ️案内を検証する。マウスクリックはPlaywright、Recorder／認識終了は非同期で実行する。
- `audio-recovery.cjs`：88項目。全8ページのTTS20秒、録音再生duration＋3秒／未取得時23秒、作文の個別・リレー表示、Lab解析10秒、完了しないdecode／close、録音保持・再試行・遅い結果の破棄を確認する。実Workerの元の計算との一致、CPUを占有するWorkerの期限中断も検証する。
- `audio-relay.cjs`：208項目。全8ページで実際に録音を完了させ、自動リレー全区間の両表示、途中OFF後の継続、次回録音への設定適用、個別再生表示、TTSエラー時の中止と録音保持、別再生・次録音によるキャンセル、遅い通知の破棄、両LabのInstructionとTTSエラー時のマイク解放を確認する。
- `audio-lifecycle.cjs`：167項目。全8ページのロック、再生キャンセル、遅いイベント、ページ離脱、Voice変更とモデル曲線の無効化を確認する。

音声合成・マイク・録音・デコード・ピッチ値には制御可能な代替を使用し、回復テストの一部では実Workerと合成波形も使用する。実際の音声認識精度、TTS発音、ピッチ品質、ChromeOS固有の許可UIを保証するテストではない。初期の167項目だけでは有効録音後の連続操作によるロック競合を検出できなかったため、再現可能な回帰テストを追加した。

- `answer-rules.cjs`：255項目。認識対象7ページの全対応文体でよ／ね／よね、Formal質問のか、数字の表記差、主語と目的語の区別、時間条件、言い直し、Habit必須語を検証する。文字列を実際のページ判定関数へ入力する検証であり、マイク認識精度の試験ではない。

- `voice-default.cjs`：112項目。全8ページで日本語3の初期選択・実際のUtteranceのvoice指定、全角／空白／英語表記、保存済み手動設定、候補不在、遅い一覧、Edge・Brave相当の優先順位維持を代替音声一覧で検証する。実機の音声名・音質確認とは区別する。

- `css-regression.cjs`：整理前のf893dd6のCSSと現行CSSを、同一DOMの計算済みスタイル・寸法・スクリーンショットの画素で比較する。全9ページ、明色／暗色、1280／600px、文体・表示・ヒント・キュー・Voiceメニュー・再生・マイク待機を対象とする。アニメーションとスクロール位置を固定する。Node.jsのpngjsも実行環境に用意する。`CSS_BASELINE=/path/to/style.css` で比較元を指定できる。比較用CSSの入替以外の製品コードの操作は実際のクリックで行う。
- リレーテストはモデルTTSの指定値（練習1は0.75、練習7は0.8、作文・発音は0.9）・録音再生1.0の確認を追加した。モデルTTSの値は厳密な実時間比率を保証しない。

## 開発用モデル音声収録

`node tests/model-recorder.cjs`：共有許可とTTSを代替し、Web Audioの合成信号を**実際のChromium MediaRecorder**で記録する。実デコード、WAV生成、ZIPのCRC・manifest・WAVヘッダー／フレーム、無音、共有拒否／音声なし、遅い共有の解放、条件変更後の再確認、TTSエラー／期限、デコード期限／遅い結果、中止／共有終了／部分完成の保持を確認する。ZIPの検証にはPython 3標準ライブラリも使用。実TTSのタブ／システム共有への経路、Windowsの共有ダイアログ、実音声のアクセントは実機で別途確認する。
