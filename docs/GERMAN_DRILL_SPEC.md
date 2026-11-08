# ドイツ語ドリル（Deutsche Übung）専用仕様書

**版：2026-11-08確定**  
**正本：本書（`docs/GERMAN_DRILL_SPEC.md`）**  
**第一参照実装：`uebung1.1.html` / `uebung1.1.js`**

---

## 1. 概要と基本方針

本仕様書は、October2026プロジェクトにおけるドイツ語練習ページ（Deutsche Übungシリーズ）の画面構造、UI/UX、音声制御、状態管理、地域変種対応、およびテスト契約を規定する専用正本です。

### 1.1 目的
- 日本語学習用ドリル（Practiceシリーズ）の優れたUI構造・操作性・カードレイアウト・音声セッション管理を踏襲しつつ、ドイツ語学習に最適化された独立した学習体験を提供する。
- ドイツ語ドリル（Deutsche Übung 1.2以降）の開発・修正において、日本語ドリル実装ファイル（`practice*.js` 等）を毎回横断調査する必要を排除し、本書および第一参照実装（`uebung1.1.html` / `uebung1.1.js`）のみを参照して完結できる開発体制を確立する。

### 1.2 区分
本書では、以下の3つの状態を明確に区別して記載します。
- **【実装済み】**：Deutsche Übung 1.1 で動作確認・自動検証済みの仕様。
- **【既存共通仕様】**：サイト全体（`drill-audio-session.js`, `style.css` 等）で共有されている共通契約。
- **【今後の設計方針】**：将来のページ（Deutsche Übung 1.2+）で拡張可能な推奨設計。

---

## 2. 標準ページ構造（HTML骨格）

### 2.1 ヘッダーとメタ情報 【実装済み】
- **DOCTYPE & 言語属性**: `<!DOCTYPE html><html lang="de">`
- **文字コード & ビューポート**: `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- **フォント読み込み**: Google Fonts より **Lato**（`wght@400;500;700`）および **Inter**（`wght@400;600;700`）を読み込む。
- **スタイルシート**: `style.css?v=YYYYMMDD`（共通CSS）
- **ページ固有スコープ**: `body` 要素にページ固有クラス（例: `.uebung11-page`, `.uebung12-page`）を付与し、スタイル干渉を防止する。

### 2.2 ナビゲーションとメインヘッダー 【実装済み】
- **戻るリンク**: `<a href="index.html" class="back-link">← Back to Menu</a>`
- **大見出し**: `<h1>Deutsche Übung X.X: [トピック名]</h1>`
- **副見出し**: `<p class="page-subtitle">[学習目標の説明文（英語）]</p>`

### 2.3 グローバル設定バー（`.compact-settings`） 【実装済み】
ヘッダー直下に配置し、以下の2行構成とする（日本語特有の「漢字/ひらがな」や「文体」は含めない）。
- **Row 1**:
  - **German Variety Control**（`#germanVarietyControl`）：地域変種切替（`DE` / `AT` / `CH`）
  - **Vocabulary Display**（`#hintModeControl`）：語彙ヒント切替（`off` / `hover` / `paren`）
- **Row 2**（`.settings-auto-row`）：
  - **Autostop Switch**（`#toggleRecordMode`, `#labelAutoRecord`）：自動録音停止（既定: ON）
  - **Autoplay Switch**（`#togglePlaybackMode`, `#labelAutoPlay`）：モデル・録音リレー再生（既定: ON）

### 2.4 メインコンテナとフッター 【実装済み】
- **メイン領域**: `<main id="drillsContainer"></main>`（JavaScriptにより動的レンダリング）
- **フッター**: `<footer class="voice-guide-footer">`
  - 音声選択ドロップダウン（`#voiceSelect`）
  - 音声ヘルプツールチップ（`span.voice-help-icon`）
  - 端末音声案内バナー（`#voiceRegionNotice`）

### 2.5 スクリプト読込順序 【実装済み】
```html
<script src="drill-audio-session.js"></script>
<script src="uebungX.X.js?v=YYYYMMDD"></script>
<script src="tooltip-layout.js"></script>
```

---

## 3. Example / Drill の基本構成

各ドリルは以下の3枚カード構造（Card 1 → Card 2 → Card 3）を踏襲します。

### 3.1 Card 1: 案内・指示バナー（`.instruction-banner`） 【実装済み】
- ドリルのタイトル（`h2.drill-section-title`、例: `Drill 1: nach — Cities & Countries`）
- 文法焦点・使い方の説明文（`.instruction-text`）
- 必要に応じた補足注記（例文パターンや語彙ルール）

### 3.2 Card 2: Example カード（`.example-box`） 【実装済み】
- カード構造：
  - テーブル（`table.recording-table`）内に 4 列の `colgroup` を配置。
  - **Col 1 (Cue)**: `strong.example-label-title` ("Ex: ") ＋ `span.cue-content`（`formatCue()` によるヒント展開）
  - **Col 2 (Arrow)**: `span.example-arrow-cell` ("👉️", 幅 28px, 中央寄せ)
  - **Col 3 (Audio)**: `button("🔊きく", "Listen to the model sentence.", ...)`
  - **Col 4 (Model)**: `span.model-text`（`highlightGrammar()` による文法強調）
- **責務分離原則**: Example は独立した変更対象であり、Exampleの修正がDrill設問に波及したり、Drillの修正がExampleに波及してはならない。

### 3.3 Card 3: Drill 設問群（`.drill-row`） 【実装済み】
- 各設問（通常1ドリルあたり3問）を行形式カードとして配置。
  - テーブル（`table.recording-table`）内に 3 列の `colgroup`（番号幅 34px、キュー、操作/結果列）を配置。
  - **Col 1 (Number)**: `td.drill-number-cell`（例: `1.`）
  - **Col 2 (Cue)**: `td.drill-cue-cell` ＋ `span.cue-content`
  - **Col 3 (Controls & Result)**:
    - 操作ボタン群（`.recording-actions`）:
      - モデル聴取ボタン：`🔊きく`（推奨モデルを発話）
      - 録音ボタン：`🎙️とる`（録音開始）
      - 停止ボタン：`⏹️`（録音中のみ活性化）
    - 結果表示（`.recording-result`）:
      - 未録音時：`span.result-text.not-recorded-yet` ("… Not yet")
      - 録音後：生テキスト ＋ 判定アイコン（`✅` / `❌`） ＋ 録音再生ボタン `▶️`
    - 訂正ガイダンス（`.correction-box`、不正解時のみ表示）:
      - モデル音声ボタン `🔊きく` ＋ お手本テキスト

---

## 4. モデル文の表示・再生と音声セッション管理

### 4.1 文法ハイライト（`highlightGrammar`） 【実装済み】
- ドイツ語の前置詞や冠詞などの重要学習対象語句を `<strong class="grammar-highlight">` で強調する。
  ```javascript
  function highlightGrammar(text) {
      return text
          .replace(/\b(nach)\b/g, '<strong class="grammar-highlight">$1</strong>')
          .replace(/\b(in die|in den)\b/g, '<strong class="grammar-highlight">$1</strong>')
          .replace(/\b(zum|zur)\b/g, '<strong class="grammar-highlight">$1</strong>');
  }
  ```

### 4.2 再生中ボタンの排他表示（`markPlaying` / `stopPlayback`） 【実装済み】
- 再生開始時、ボタンの元のDOM構造（テキストノードおよびツールチップ要素）を `b._contents = Array.from(b.childNodes)` に退避し、`b.disabled = true; b.textContent = "Playing..."; b.classList.add("is-playing");` を適用する。
- 終了時・停止時・エラー時は、`b.disabled = false; b.replaceChildren(...b._contents);` により元のDOM状態へ完全復元する。
- ボタンが「Playing...」のまま固定化される障害を完全に防止する。

### 4.3 共通音声セッション（`drill-audio-session.js`）との連携契約 【既存共通仕様】
- **コールバック順序の契約**:
  - `SpeechSynthesisUtterance` インスタンス作成後、**必ず先に `u.onend` と `u.onerror` を代入し、その後に `DrillAudio.speak(u)` を呼び出す**。
  - `DrillAudio.speak(u)` が内部で `guardUtterance(u)` を呼び出し、代入済みのコールバックを安全にラップして20秒監視タイマーと連携する。
- **Chromiumのキュー詰まり回避**:
  - `window.speechSynthesis.paused` が true の場合、発話開始前に `window.speechSynthesis.resume()` を呼び出してエンジンを再開させる。
- **停止処理の階層分離**:
  - `stopPlayback()`：ローカルの音声・発話のみを停止し、ボタン表示を復元する（`invalidatePlayback` は呼ばない）。
  - `stopAllPlayback()`：外部クリックや中断時に呼ばれ、`DrillAudio.invalidatePlayback()` と `stopPlayback()` の両方を実行する。
  - Autoplayリレー中（`isRelay === true`）は `stopAllPlayback()` をスキップし、リレーの破壊を防止する。

---

## 5. 学習者の録音・再生・音声認識（STT）

### 5.1 録音処理 【実装済み】
- `DrillAudio.getUserMedia({ audio: true })` によりマイクストリームを取得。
- `MediaRecorder`（mimeType: `audio/webm;codecs=opus` 等を自動選択）で学習者の音声を録音・Blob化。
- 録音中は `document.body.classList.add('drill-recording-locked')` が付与され、他操作が排他ロックされる。

### 5.2 音声認識（STT） 【実装済み】
- `webkitSpeechRecognition` または `SpeechRecognition` を利用。
- `recognition.lang` には選択中の地域ロケール（`de-DE`, `de-AT`, `de-CH`）を明示設定する。
- 録音終了時、認識結果テキスト（`transcript`）を取得。

### 5.3 正規化と判定ロジック 【実装済み】
- **正規化関数**:
  ```javascript
  function normalizeGerman(text) {
      if (!text) return "";
      return text
          .toLowerCase()
          .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'„“…]/g, "")
          .replace(/\s+/g, " ")
          .trim();
  }
  ```
- **許容判定**: 学習者テキストを正規化し、`getAllowed(item, currentVariety)` に含まれるいずれかの文と一致すれば正解（`✅`）とする。

---

## 6. ドイツ語地域設定（German Variety: DE / AT / CH）

### 6.1 地域変種の仕様 【実装済み】
- ドイツ語圏の主要3地域を切り替えるセグメントコントロール：
  - `🇩🇪 DE` (Germany)
  - `🇦🇹 AT` (Austria)
  - `🇨🇭 CH` (Switzerland / Schweizer Hochdeutsch)
- 切替時、全ドリル（ExampleおよびDrill）の表示モデル文、ヒント、TTS音声、STTロケール、判定基準を即座に再描画・更新する。

### 6.2 地域推奨モデルと許容文の評価契約（Drill 4 Item 3方式） 【実装済み】
特定の表現において地域変種が存在する場合（例：学校へ行く＝DE/CH: `zur Schule`, AT: `in die Schule`）：
- **データ構造**:
  ```javascript
  regionalModels: {
      DE: "Ich gehe zur Schule.",
      AT: "Ich gehe in die Schule.",
      CH: "Ich gehe zur Schule."
  },
  allowedAnswers: [
      "Ich gehe zur Schule.",
      "Ich gehe in die Schule."
  ]
  ```
- **フィードバック契約**:
  1. 選択中地域の推奨文と一致：正解 `✅`（補足バッジなし）。
  2. 選択外の他地域許容文を発話：正解 `✅` を付与しつつ、選択中地域の推奨文を補足バッジ（`.uebung-supplement-badge`、例: `🇦🇹 Ich gehe in die Schule.`）として提示。
  3. 不正解文を発話：不正解 `❌` とし、選択中地域の推奨モデル文を表示。

---

## 7. 音声合成（TTS）と透過的案内

### 7.1 ロケールと優先探索 【実装済み】
- ロケールタグ：DE = `de-DE`, AT = `de-AT`, CH = `de-CH`。
- `normalizeLang()` でアンダースコア（`de_DE`）とハイフン（`de-DE`）の表記揺れを吸収。
- 探索順位：
  1. `localStorage` に保存された選択音声（`october2026.german.selectedVoiceName`）
  2. 完全一致ロケール（例: `de-AT`）
  3. 前方一致ロケール（例: `de-at-*`）
  4. 標準ドイツ語（`de-DE`）
  5. 端末内の最初のドイツ語音声（`de-*`）

### 7.2 透過的案内（無断フォールバックの禁止） 【実装済み】
- 端末に選択地域（例: `de-AT`, `de-CH`）のネイティブ音声が存在しない場合、無言で他音声へフォールバックせず、フッターの `#voiceRegionNotice` にて端末状況と実際に使用する音声を明示する。
- 端末にドイツ語音声が1件も存在しない場合は警告を表示する：
  `⚠️ No German speech synthesis voice detected on this device. (Please verify your system TTS settings).`
- 音声エラー発生時は無言で終了せず、`DrillAudio.notify()` を用いて画面上に明確な通知を行う。

---

## 8. 語彙ヒント（Vocabulary Display）

### 8.1 3つの表示モード 【実装済み】
- `off`（OFF）：語彙訳を表示せず、キュー単語のみを表示。
- `hover`（Hover、既定）：単語に点線下線を付与し、ホバー時にツールチップで英訳を表示（`tooltip-layout.js` 連携）。
- `paren`（Display）：単語の後ろに括弧付きで英訳を常時インライン表示。

### 8.2 データ構造 【実装済み】
```javascript
cue: "die Schweiz / fahren",
cueParts: ["die Schweiz", "fahren"],
hints: ["Switzerland (fem.)", "to travel/drive"]
```

---

## 9. 「Copy my sentences」機能

### 9.1 仕様と配置 【実装済み】
- 各ドリルのCard 3（設問群）直下に右寄せ配置（`.uebung-copy-area`）。
- Lucide標準 `clipboard` SVGアイコン、ボタン文言 `Copy my sentences`、説明文 `Copy your drill results to review or share.`（`.uebung-copy-help`）。
- クリック時、当該ドリルで学習者が発話した生認識テキスト（STTトランスクリプト）をローカル日時ヘッダー付きテキストとしてクリップボードへコピー。
- コピー成功時、ボタン右横に `Copied!`（`.uebung-copy-status`）を一時表示（2秒後にフェードアウト）。

---

## 10. 共通CSS・UI・アクセシビリティ仕様

### 10.1 タイポグラフィ 【既存共通仕様】
- ドイツ語テキストおよびUIテキストの欧文フォントは **Lato**（`400, 500, 700`）を基準とする。

### 10.2 レスポンシブ設計契約 【既存共通仕様】
- [UI_LAYOUT_SPEC「共通レスポンシブ・幅配分の設計契約」](UI_LAYOUT_SPEC.md) に完全準拠する。
- 横幅に十分な余裕がある場合に、キュー・矢印・音声ボタン等を分離する不必要な改行を発生させない。

### 10.3 アクセシビリティ 【既存共通仕様】
- すべてのアイコンボタンに適切な `aria-label` を付与する。
- セグメントコントロールには `role="group"`, `aria-pressed`, `aria-label` を適切に管理する。

---

## 11. 専用テスト（`tests/uebung*.cjs`）

各ドイツ語ドリルページは、専用のテストファイル（例: `tests/uebung11.cjs`）を保持し、以下の項目を機械的に検証します。
1. ファイル存在および `index.html` からのリンク確認。
2. グローバル設定（地域変種、Autostop、Autoplay、Voice）のDOM存在確認。
3. 全ドリルのタイトル・設問数・地域モデル設定の整合性確認。
4. `DrillAudio.configure`, `getUserMedia`, `playRelay`, `speak` の連携契約確認。
5. コールバック登録順序（`u.onend` / `u.onerror` が `DrillAudio.speak(u)` より前に設定されていること）の確認。
6. `Copy my sentences` の配置および機能契約確認。
