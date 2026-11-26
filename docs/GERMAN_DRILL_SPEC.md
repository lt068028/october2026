# German Drills（Deutsche Übung）暫定参照メモ

**文書状態：暫定（2026-11-19更新）**<br>
**用途：共通仕様・現行コード・テストへ移行するまでの確認用。恒久的な独立正本として維持する前提ではない。**<br>
**現行実装の参照先：`uebung1.1.html` / `uebung1.1.js` および対応テスト**

---

## 1. 概要と基本方針

本書は、German Drillsに関する既存の固有事項を移行期間中に参照するための暫定資料である。共通機能は `PROJECT_SPEC.md` と `UI_LAYOUT_SPEC.md` を優先し、現行動作はコードと対応テストで確認する。記載が現行実装・共通仕様と矛盾する場合は、そのまま正として扱わず、差異を確認して必要最小限の更新または削除対象とする。

### 1.1 目的
- German固有の教材・文法・地域変種は言語固有の登録ルールとして扱い、共通UI・音声セッション・STT保持・回答判定の基本契約は共通仕様に従う。
- 共通機能の移植・共通化・影響確認では、日本語を含む他言語の関連コードやテストも必要な範囲で参照する。言語の違いだけを理由に横断確認を禁止しない。
- 本書の詳細は移行対象の棚卸し用であり、記載内容をそのまま永久に残すことを目的としない。

### 1.2 ドリルの別解許容原則 【最優先基本原則・2026-11-10確定】
- **ドリルの正解はモデル文一つに限定しない。**
- キューで指定された学習目標を満たし、文法的に正しい別解を常に考慮する。
- 主語・時制・語順が指定されていない場合、それらの違いだけを理由に不正解としてはならない。
- モデル文は代表的な正しい回答例であり、唯一の正解ではない。
- この原則は今後作成するすべてのDeutschドリルにも適用する。

### 1.3 区分
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
- **戻るリンク**: `UI_LAYOUT_SPEC.md` §13.1（`href="index.html"` 固定・履歴戻り非使用）に従い、`<a href="index.html" class="back-link custom-tip-wrap">↩️ Zurück<span class="custom-tip-box">Return to Practice Menu.</span></a>` とする。
- **大見出し**: `<h1>Deutsche Übung X.X: [トピック名]</h1>`
- **副見出し**: `<p class="page-subtitle">[学習目標の説明文（英語）]</p>`

### 2.3 グローバル設定バー（`.compact-settings`） 【実装済み】
ヘッダー直下に配置し、以下の2行構成とする（日本語特有の「漢字/ひらがな」や「文体」は含めない）。
- **Row 1**:
  - **German Variety Control**（`#germanVarietyControl`）：地域変種切替（`DE` / `AT` / `CH`）
  - **Vocabulary Display**（`#hintModeControl`）：語彙ヒント切替（`off` / `hover` / `paren`）
- **Row 2**（`.settings-auto-row`）：
  - **Autostop Switch**（`#toggleRecordMode`, `#labelAutoRecord`）：自動録音停止（既定: ON）
    - ホバー説明（`.custom-tip-box`、ON/OFF別行表示）：
      - `ON:` Recording stops automatically.
      - `OFF:` Stop recording manually.
  - **Autoplay Switch**（`#togglePlaybackMode`, `#labelAutoPlay`）：モデル・録音リレー再生（既定: ON）
    - ホバー説明（`.custom-tip-box`、ON/OFF別行表示）：
      - `ON:` After recording, the model audio and your recording play automatically.
      - `OFF:` Choose what and when to play.

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
  - テーブル（`table.drill-example-table`、`recording-table` とは分離して4列Gridでレイアウト）。
  - **Col 1 (Cue)**: `span.cue-content`（`formatCue()` によるヒント展開。ユーザー未指定の「Ex: 」項目名は配置せず、ホバー時は `.tooltip-wrap` / `.target-word` / `.tooltip-tip` により日本語Practiceと同様の点線下線を表示）。
  - **Col 2 (Arrow)**: `td.example-arrow-cell` ("👉️", 幅 28px, 中央寄せ)
  - **Col 3 (Audio)**: `button("🔊 Anhören", ...)`（Example 1 のみホバー説明 `Listen to the example.` を配置。Example 2以降には配置しない）
  - **Col 4 (Model)**: `span.model-text`（`highlightGrammar()` による文法強調。音声ボタンとの重なりを防止）
- **レスポンシブ契約**:
  - 広幅時: [キュー] [👉️] [🔊 Anhören] [モデル文] を同一行・8px列間隔で整列。
  - 正式サポート範囲内で実際の内容幅が不足する場合は、キューを必要に応じて別段へ移し、[👉️] [🔊 Anhören] [モデル文] の対応関係を保つ。矢印と音声ボタンを分断せず、モデル文の表示領域を確保する。固定のスマートフォン幅を必須の切替条件にしない。
- **責務分離原則**: Example は独立した変更対象であり、Exampleの修正がDrill設問に波及したり、Drillの修正がExampleに波及してはならない。

### 3.3 Card 3: Drill 設問群（`.drill-row`） 【実装済み】
- 各設問（通常1ドリルあたり3問）を行形式カードとして配置。
  - テーブル（`table.recording-table`）内に 3 列の `colgroup`（番号幅 34px、キュー、操作/結果列）を配置。
  - **Col 1 (Number)**: `td.drill-number-cell`（例: `1.`）
  - **Col 2 (Cue)**: `td.drill-cue-cell` ＋ `span.cue-content`（ホバー時は `.tooltip-wrap` / `.target-word` により点線下線を表示。Drills 1〜4では実測自然幅に基づく `--drill-cue-width` により不要な余白を排除）
  - **Col 3 (Controls & Result)**:
    - 操作ボタン群（`.recording-actions`）:
      - 基本操作ホバー（初学者案内）：**Example 1 と Drill 1 の設問 1 だけに限定設置**（Drill 1 設問2以降および Drill 2〜4 には基本操作ホバーを配置しない）。
        - モデル聴取ボタン：`🔊 Anhören`（Drill 1 設問1のみホバー `Listen to the model answer.`）
        - 録音ボタン：`⏺️ Aufnehmen`（Drill 1 設問1のみホバー `Record your answer.`）
        - 停止ボタン：`⏹️`（Drill 1 設問1のみ現在のAutostop設定に応じて動的切替）
          - Autostop ON: `No need to press. Autostop is ON.`
          - Autostop OFF (Manual Stop): `Stop recording.`
    - 結果表示（`.recording-result`）:
      - 未録音時：`span.result-text.not-recorded-yet` ("… Not yet")
      - 録音後はAccepted／Mismatchの2種類で扱う。
        - Accepted: 生テキスト ＋ ` ✅`（選択外地域の許容文発話時は補足バッジを付与）
        - Mismatch: 生テキストのうち不一致箇所のみを赤字（`<span class="result-incorrect">`）で表示（❌マークは付与しない）
      - 録音再生ボタン `▶️`：音声データが存在する場合に結果行へ表示
    - 訂正ガイダンス（`.correction-box`、`mismatch` 時のみ表示）:
      - 文言：`🔥 Keep going!` のみを表示する（重複する `🔊 Anhören` ボタン、`Try once more!`、モデル文の自動開示 `→ [モデル文]` は表示しない。モデル音声の確認は操作ボタン群の `🔊 Anhören` を使用する）。
  - **レスポンシブ契約**: 通常幅では番号・キュー・操作を1行で整列し、正式サポート範囲内で実際の内容幅が不足する場合は操作群を次段へ折り返す。固定のスマートフォン幅を必須の切替条件にしない。

### 3.4 キューの非折り返し・自然幅計測契約 【実装済み】
1. **ドイツ語Drillのキューは、通常の表示幅では1行表示を原則とする。**
2. **キュー幅の算定には、折り返し前の自然幅を使用する。**
   - 測定時はクローン要素（非表示・`white-space: nowrap`・`width: max-content`）を用いて折り返し前の自然幅（intrinsic width）を取得する。
3. **既に折り返された要素の描画幅を、そのまま必要幅として採用しない。**
   - 折り返し後の圧縮された幅を測定して列幅変数（`--drill-cue-width` 等）にセットする循環圧縮を禁止する。
4. **必要幅が実際に不足する場合は、操作ボタン群を次段へ配置する。**
   - 折り返し前のキュー自然幅、操作ボタン群の必要幅、列間隔を合計し、利用可能な行内幅に収まらない場合に限って操作ボタン列を次行へ折り返す。キューを不必要に圧縮して語句を改行させず、キューの1行表示領域を確保する。
   - コンテナクエリ（例：`@container (max-width: 480px)`）は実装上の判定手段として使用できるが、480pxという境界だけで収まりを検査せずに折り返してはならない。境界の前後で実際の必要幅と利用可能幅を確認し、内容が収まる場合は同一行を維持する。
5. **キューの語句・区切り記号・動詞を不必要に分断しない。**
   - 例: `Graz / fahren`, `Italien / reisen`, `Berlin / fahren` 等において、地名・区切りスラッシュ・動詞が別行へ分断されることを防止する。
6. **OFF / Hover / DisplayおよびResize後の再計測を保証する。**
   - 表示モード切替時（`renderAll()` 呼び出し時）およびウィンドウリサイズ時に、自然幅に基づく再計測が即座に反映される。
   - ツールチップ（`.tooltip-tip`, `.custom-tip-box`）の非表示テキストがキュー幅の自然幅計測に混入しないよう除外処理を行う。
7. **極端に狭い表示領域では、横はみ出しを防止するためのフォールバックを許容する。**
   - 正式サポート範囲内で利用可能な内容幅が不足する場合は、横はみ出し・重なり・クリップを避ける安全な配置へ切り替える。スマートフォン幅の動作保証や必須検証条件を追加するものではない。
8. **新規ドイツ語ドリルにも同じレイアウト契約を適用する。**
   - Deutsche Übung 1.2以降のドリル作成時にも本書のレイアウト契約を共通で踏襲する。

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
- 音声再生中のボタン表示・停止アイコン・排他ロックは `UI_LAYOUT_SPEC.md` §13.3 を正本とする（`Playing...` 文字列は表示しない）。終了時・停止時・エラー時は元の DOM 状態へ復元する。

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

### 4.4 ドイツ語TTS診断・再生失敗通知・専用バナー 【実装済み】
- **専用通知バナー（`#germanTtsNotice`）**:
  - ヘッダー直下に配置された専用のインラインバナー。既存の `#audioRecoveryStatus` および `#voiceRegionNotice` とは完全に分離・独立。
  - 閉じるボタン（`#germanTtsNoticeClose`）を備え、キーボード操作および正式サポート範囲内の画面幅に対応。
  - 新たな再生失敗時は自動的に再表示され、正常再生成功時には再生エラー通知を自動消去する。
- **起動時TTS診断（`diagnoseTtsStartup`）**:
  - `unsupported`: Web Speech API非対応ブラウザへの案内（`German audio is not supported`）。
  - `unknown`: 初回 `getVoices()` が空配列の場合、1000msのタイマーと `voiceschanged` イベントで遅延ロードを待機（断定的な誤警告を防止）。
  - `unavailable`: 音声一覧確定後もドイツ語音声が0件の場合の案内（`German voice not detected`）。
  - `available`: ドイツ語音声が検出された場合（既存の未検出警告があれば自動解除）。
- **再生時診断とライフサイクル監視**:
  - `addEventListener('start' / 'error' / 'end')` を `u` に直接付与し、`guardUtterance` によるコールバック握り潰しを回避して確実にエラーを捕捉。
  - **開始タイムアウト（5000ms）**: 発話開始（`onstart`）が遅延・未達の場合に検知し、`German audio did not start` を通知。
  - **明示的エラー（`onerror`）**: サービスエラー時に `German audio could not be played` を通知。
  - **短時間終了（<150ms）**: 10文字以上の文が極短時間で終了した（音声データ欠落や無音終了の疑い）場合に `Can't hear the audio?` を案内。
  - **意図的キャンセル保護**: 別ボタンクリック、録音開始、地域変更等の正規中断時は `cancelActivePlaybackToken(true)` により誤通知を完全に防止。

---

## 5. 学習者の録音・再生・音声認識（STT）

### 5.1 録音処理・監視・停止条件 【実装済み】
- **マイクストリーム取得**: `DrillAudio.getUserMedia({ audio: true })` によりマイクストリームを取得。
- **録音と状態保持**: `MediaRecorder`（mimeType: `audio/webm;codecs=opus` 等を自動選択）で学習者の音声を録音・Blob化。録音中は `document.body.classList.add('drill-recording-locked')` が付与され、他操作が排他ロックされる。
- **マイク音量監視（`AudioContext` / `AnalyserNode`）**:
  - マイク入力音量を監視して発話開始（`speechStarted = true`）および無音タイマー起算点（`lastSoundAt`）を更新する（SpeechRecognition の `onspeechstart` や `onresult` は使用しない）。初期化・音量監視失敗時は `Recording error.` として安全に停止・リソース解放する。
- **3つの正式な録音停止条件（`PROJECT_SPEC.md` §5.2 対象外の German 固有仕様）**:
  1. **発話開始前の上限：5秒（Autostop ON時のみ）**:
     - Autostop ON 時、録音開始から5秒以内にマイク入力による発話（`speechStarted`）も有効なSTT認識テキスト（`raw` / `interim`）も検出できない場合、録音を自動停止し、`No speech detected within 5 seconds.` を表示する（音声保存なし）。Manual（Autostop OFF）時は5秒未発話で自動停止しない。
     - 5秒未満で手動停止された場合は、未発話タイムアウトメッセージを表示せず初期状態（`… Not yet`）とする。
  2. **発話後の無音停止：連続2.0秒（Autostop ON時のみ）**:
     - SpeechRecognitionの文字起こしイベントではなく、マイク入力音量の監視により無音を判定。
     - 発話検出後、連続2.0秒間音声入力がなければ自動停止。
     - 途中で音声入力が再開した場合は、無音時間の計測をリセット。
     - Autostop OFF（Manual）では2秒無音による自動停止を行わず、手動停止ボタン（⏹️）または20秒上限で停止。
  3. **絶対上限：20秒（Autostop ON/OFF共通）**:
     - 録音開始から20秒で必ず自動停止。停止メッセージは `Auto-stopped after 20 seconds.`。
- **重複停止防止とリソース解放**:
  - `stopping` フラグにより重複停止処理を抑止。
  - 停止・破棄時にはマイクトラック、`AudioContext`、監視タイマー群を確実に解放。

### 5.2 音声認識（STT）と音声検出の分離・メッセージ仕様 【実装済み】
- **STTエンジン**: `webkitSpeechRecognition` または `SpeechRecognition` を利用。
- **言語設定**: `recognition.lang` には選択中の地域ロケール（`de-DE`, `de-AT`, `de-CH`）を明示設定。
- **音声検出と文字起こしの分離管理**:
  - 音声検出フラグ（`speechStarted`）と認識テキスト（`raw`）を独立して管理する。
  - **録音音声の保存条件**：発話検出または有効なSTT認識テキストがあり、有効なマイク録音データ（非空 `chunks`）と空白だけではないSTT原文の両方が取得できた場合に限り、録音音声Blob／再生URLを保存する（有効なSTTが存在しても録音データが欠損している場合は再生URLを生成しない）。判定・Copy用のraw STTは認識原文として保持し、画面表示用の加工を保存値へ書き戻さない。
  - **STTが空の場合**：発話が検知されてもSTT原文が空なら録音音声は保存せず、録音再生ボタンも表示しない。`No transcription available.` を表示する。
  - **STT認識エラーまたは開始例外**：`recognition.onerror` または `recognition.start()` の例外では `Recognition error.` を表示し、空STTのため録音音声・再生URLを保存しない。再生ボタンも表示しない。
  - **録音処理自体の失敗**：有効な録音データを取得できない場合は `Recording error.` として区別する。
- **統一された状態・エラーメッセージ体系**:
  - 準備中：`Preparing microphone...`
  - 録音中：`Recording...`
  - 5秒未発話タイムアウト：`No speech detected within 5 seconds.`（音声保存なし）
  - 20秒絶対上限停止：`Auto-stopped after 20 seconds.`
  - 発話検知あり・STT空：`No transcription available.`（録音音声保存なし、再生ボタンなし）
  - 非対応ブラウザ案内：
    - STT非対応：`Speech recognition is not supported in this browser.`
    - 録音非対応：`Recording is not supported in this browser.`
    - 両方非対応：`Speech recognition and recording are not supported in this browser.`
  - エラー案内：
    - 録音エラー：`Recording error.` / `Could not start recording.`
    - 認識エラー：`Recognition error.`（空STTとなるため録音音声保存・再生ボタンなし）

### 5.3 回答判定エンジン（`evaluateGermanAnswer`）とフィードバック契約 【現行仕様】
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
- **3状態判定の基準（`Accepted` / `Incomplete` / `Mismatch`、`PROJECT_SPEC.md` §6.4.1 準拠）**:
  1. **`accepted`（正解受容）**:
     - モデル文との完全一致、地域変種・別解リスト（`allowedAnswers`）との一致、およびキューの学習目標（動詞・目的地・対応する前置詞）を満たし、主語・語順（SVO、倒置OVS `Nach Graz fahre ich.` 等）・時制（現在形、現在完了形Perfekt `Ich bin nach Graz gefahren.`、過去形Präteritum `Ich fuhr nach Graz.`）が文法的に正しく一致している発話。
     - UI表示：生認識テキスト ＋ ` ✅`（選択外地域文の場合は推奨モデル補足バッジを表示）。訂正ボックスは非表示。
  2. **`incomplete`（途中・不足）**:
     - 発話が途中で切れている、または必要な要素が不足しているが明確な誤りではない発話。
  3. **`mismatch`（明示的不一致）**:
     - 主語と動詞の人称変化の不一致（例: `Er fahren nach Graz.` → `fahren` が不一致）、目的地に対する前置詞の誤り（例: `Ich fahre zu Graz.` → `zu` が不一致）、キューと異なる目的地・名詞の発話（例: `Ich fahre nach Berlin.` → `berlin` が不一致）、キューと異なる移動動詞語幹の使用（例: `Ich gehe nach Graz.` → `gehe` が不一致）。
     - UI表示：生認識テキストのうち特定された不一致箇所のみを赤字（`<span class="result-incorrect">`）で表示。訂正ボックスには `🔥 Keep going!` のみを表示する。

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
  1. 選択中地域の推奨文と一致：正解 `accepted`（`✅`、補足バッジなし）。
  2. 選択外の他地域許容文を発話：正解 `accepted`（`✅`）を付与しつつ、選択中地域の推奨文を補足バッジ（`.uebung-supplement-badge`、例: `🇦🇹 Ich gehe in die Schule.`）として提示。
  3. 不一致文を発話：`mismatch` とし、不一致箇所を赤字表示 ＋ `🔥 Keep going!`。

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

### 7.2 透過的案内と通知3段階分離（Info / Warning / Error） 【実装済み】
- 通知は情報重要度に応じて **Info / Warning / Error の3段階**に分離し、`#voiceRegionNotice`（フッター）と `#germanTtsNotice`（上部専用バナー）の重複表示を防ぐ：
  - **Info（`#voiceRegionNotice`）**：ドイツ語音声が1件以上存在する状態で、選択地域（`de-DE`, `de-AT`, `de-CH`）のネイティブ音声が端末にない場合のみ、使用音声と適用タグを明示する。Microsoft Fluent `Info 24 Regular`（`info`, `regular`、`20×20px`）、補助文字色 `var(--text-secondary)`、`role="status"`、`aria-live="polite"` を使用する。直接一致する音声がある場合、およびドイツ語音声が0件の場合は非表示とする。
  - **Warning（`#germanTtsNotice`）**：ドイツ語音声が1件も検出できない起動時未検出（`German voice not detected`）および短時間無音終了疑い案内（`Can't hear the audio?`）を表示する。`Warning 24 Filled`（`warningFilled`, `filled`、`20×20px`）、左境界・アイコン色 `var(--warning-color)`（Light `#d97706` / Dark `#fbbf24`）、`role="status"`、`aria-live="polite"` を使用する。ドイツ語音声が利用可能になった場合は起動時通知を自動消去する。
  - **Error（`#germanTtsNotice.is-error`）**：Speech Synthesis 非対応、再生エラー、開始タイムアウト等のエラーを表示する。`Error Circle 24 Filled`（`errorCircleFilled`, `filled`、`20×20px`）、赤系エラー強調、`.is-error`、`role="alert"`、`aria-live="assertive"` を用い、`showGermanTtsNotice()` で `type` に応じてアイコン・色・ARIA属性を同期切替する。
- 音声エラー発生時は無言で終了せず、上記バナーを用いて画面上に明確な通知を行う。

---

## 8. 語彙ヒント（Vocabulary Display）

### 8.1 3つの表示モード 【実装済み】
- `off`（OFF）：語彙訳を表示せず、キュー単語のみを表示。
- `hover`（Hover、既定）：単語に点線下線を付与し、ホバー時にツールチップで英訳を表示（`tooltip-layout.js` 連携）。
- `paren`（Display）：単語の後ろに括弧付きで英訳を常時インライン表示。

### 8.2 データ構造 【実装済み】

- `cueParts`と`hints`は同じインデックスで対応させ、独立した英語ヒントが重複・不要な箇所には`null`を使用する。
- 個々のキュー・ヒントのデータ正本は`uebung1.1.js`とする。本書に全件一覧やコード例を再掲しない。

---

## 9. 「Copy my sentences」機能

- Copy対象範囲・raw STT保持・出力形式・録音中の無効化等は、共通仕様 `PROJECT_SPEC.md` §7.2を正本とする。
- ボタンの外観・配置は `UI_LAYOUT_SPEC.md` を正本とする。
- 本書ではGerman専用のCopy出力形式や、設問キューのコピー追加を定義しない。

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
