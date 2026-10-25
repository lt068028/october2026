# 音声操作の回帰テスト

Playwright（Node.jsパッケージ）とChromiumが利用できる環境で、リポジトリ直下から実行する。

```bash
node tests/audio-transitions.cjs
node tests/audio-lifecycle.cjs
```

Chromiumが `/usr/bin/chromium` にない場合は `CHROMIUM_PATH` に実行ファイルのパスを指定する。
Playwrightはテスト実行環境に用意する。サイト自体にビルドやnpm依存は追加していない。

- `audio-transitions.cjs`：51項目。作文・発音1・発音2で、有効な録音→自動再生→次行、Labの左→右→左、録音→再生→モデル音→再録音、許可拒否からの復帰、Autostop ON→OFF、禁止カーソル、モデル収音の終了通知欠落を検証する。マウスクリックはPlaywright、Recorder／認識終了は非同期で実行する。
- `audio-lifecycle.cjs`：167項目。全8ページのロック、再生キャンセル、遅いイベント、ページ離脱、Voice変更とモデル曲線の無効化を確認する。

音声合成・マイク・録音・デコード・ピッチ値には制御可能な代替を使用する。実際の音声認識精度、TTS発音、ピッチ品質、ChromeOS固有の許可UIを保証するテストではない。初期の167項目だけでは有効録音後の連続操作によるロック競合を検出できなかったため、再現可能な回帰テストを追加した。
