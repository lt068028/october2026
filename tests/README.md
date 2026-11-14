# テスト運用ガイドとテスト一覧

> **版：2026-11-14.1**
>
> - ユーザー承認状態：承認済み（`tests/README.md` 全体）
> - 承認日：2026-11-14

本ドキュメントは、October2026 プロジェクト（`lt068028/october2026`）における回帰テストの運用方針およびテスト一覧をまとめたものです。

---

## 1. テスト運用の基本方針

### 1.1 テスト選択の原則
- **影響範囲に応じた選択**: テストは変更した機能および直接影響を受ける範囲に応じて、必要最小限のテストを選定して実行します。日常の修正作業ですべてのテストを一律に実行する必要はありません（全件一括実行は不要・非推奨です）。
- **ページ固有の修正**: 原則として対象ページ固有のテスト、および直接関係する動作ロジックの限定テストを実行します。
- **共通機能・共通CSSの変更**: 共通モジュール（音声セッション管理、ツールチップ、フィードバックアイコン等）や共通スタイルを変更した場合、その影響を受ける対象ページ群の関連テストを選択します。
- **全ページ対象テストの扱い**: 全11ページを横断検証するテスト（E2E総合回帰テストや横断レイアウト検査等）は、全ページへの波及が実際に想定される場合や、ページ作業完了後の総合確認として使用します。日常の小作業で毎回実行する義務はありません。
- **ページ限定実行の優先**: 環境変数（例: `PRACTICE_PAGES=practice8.1` 等）で対象を絞り込めるテストは、ページ限定実行を優先します。

### 1.2 正式サポート端末と画面幅に関する方針
- **正式な対応対象はPCおよびタブレット**: 本プロジェクトにおける正式なレスポンシブ・レイアウト検証対象はPCおよびタブレット画面（600px〜1440px等）です。
- **スマートフォン幅（375px）の扱い**: スマートフォン幅（375px）での表示検証は、過去の検証記録や一部既存テストコード（`viewport: { width: 375 }`）に含まれていますが、現行プロジェクトにおける**必須の合格条件ではありません**。過去の記録やテストコード内の375px記述を、現在の必須要件と誤認しないようにしてください。

### 1.3 テスト結果と合格判定の区別
以下の事実はそれぞれ独立しており、厳密に区別して扱います。
1. **テストファイルが存在すること**: テストファイルが存在しても、それが現在の最新仕様を完全に保証しているとは限りません。
2. **テストが現在の仕様に対応していること**: 過去の仕様を前提とした古いテストや、表示fixtureのみを検証するテストが存在します。
3. **テストを実行したこと / テストが成功したこと**: Playwrightやモック環境での機械的自動検証に成功した状態です。
4. **ユーザーの実機確認が完了したこと**: 公開URLまたは実機ブラウザ環境で、実際の音声合成品質、マイク録音、音声認識精度、表示・操作感をユーザー自身が確認した状態です。自動テストの成功をもって実機確認済みとみなすことはできません。

### 1.4 実行環境と前提条件
- **必要環境**: Node.js、Playwright、Chromium。
- サイト本体にはビルド手順やnpm実行時依存はありません（静的HTML/CSS/JS構成）。
- Chromiumの実行ファイルが `/usr/bin/chromium` に存在しない場合は、環境変数 `CHROMIUM_PATH` に実行ファイルパスを指定します。

```bash
# 例: Chromiumパスの指定
export CHROMIUM_PATH=/path/to/chromium
```

---

## 2. 基本的な音声回帰テスト（代表例）

音声操作の中核ロジック（トランジション、ライフサイクル、リカバリ、リレー）を変更した際に参照・選択する基本テスト群です。

```bash
node tests/audio-transitions.cjs
node tests/audio-lifecycle.cjs
node tests/audio-recovery.cjs
node tests/audio-relay.cjs
node tests/relay-zero-gap.cjs
```

※ 上記コマンドは代表的なテストの例示であり、日常の小修正でこれらすべてを一律に実行することを義務付けるものではありません。変更内容に応じたテストを選択してください。

---

## 3. テスト一覧（用途別の整理）

### 3.1 音声操作・録音・リレー・ライフサイクル

音声合成・マイク・録音・デコード・ピッチ値には制御可能な代替（モック）を使用しています。実際のブラウザ音声認識精度、実TTS発音、実マイク音質を保証するテストではありません。

- **`node tests/audio-transitions.cjs`**
  - **対象**: 作文、発音1、発音2
  - **検証内容**: 有効な録音→自動再生→次行、Labの左右切り替え、録音→再生→モデル音→再録音、マイク許可拒否からの復帰、Autostop ON/OFF、禁止カーソル、モデル収音の終了通知欠落、発音2のリレー／手動／LabのPlaying表示と再生中Autoplay切替許可、Casual無効化、案内表示の検証（80項目）。
  - **実行場面**: 作文・発音ページの音声状態遷移やAutostop/Autoplay設定の変更時。
- **`node tests/audio-lifecycle.cjs`**
  - **対象**: 全8ページ（`PRACTICE_PAGES` で絞り込み可能）
  - **検証内容**: 操作ロック、再生キャンセル、遅延イベント、ページ離脱、Voice変更とモデル曲線の無効化（167項目）。
  - **実行場面**: 排他ロック制御、ページ離脱時の音声停止、音声モデル切り替え処理の変更時。
  - **実行例**: `PRACTICE_PAGES=practice8.1 node tests/audio-lifecycle.cjs`
- **`node tests/audio-recovery.cjs`**
  - **対象**: 全8ページ
  - **検証内容**: TTSタイムアウト（20秒）、録音再生duration＋3秒（未取得時23秒）、作文の個別・リレー表示、Lab解析10秒タイムアウト、未完了のdecode/close処理、録音データ保持・再試行・遅延結果の破棄。Worker計算一致とCPU占有Workerの中断（88項目）。
  - **実行場面**: タイムアウト処理、エラーリカバリ、Worker通信の修正時。
- **`node tests/audio-relay.cjs`**
  - **対象**: 全8ページ（`PRACTICE_PAGES` で絞り込み可能）
  - **検証内容**: 自動リレー全区間の表示、途中OFF後の継続、次回録音への設定適用、個別再生表示、TTSエラー時の中止と録音保持、別再生・次録音によるキャンセル、遅延通知の破棄、LabのInstructionとTTSエラー時のマイク解放（292項目）。モデルTTS速度指定値、録音再生1.0の確認。
  - **TTS速度の扱いに関する注意**:
    - テストコード内で照合されているTTS速度（練習1・2系: 0.75、練習7系: 0.8、作文・発音・8系等: 0.9）は、既存ページの実装に合わせた**テストコード上の現行検証値（実装値）**である。
    - これらの数値をページ番号に応じた今後の標準仕様として扱わない。新規作成・更新する通常Drillの標準速度は「0.9」とするプロジェクト方針と混同しないこと（今回はテストコードおよびページ実装の変更は行わない）。
  - **実行場面**: 録音後の自動リレー再生や再生キュー処理の変更時。
  - **実行例**: `PRACTICE_PAGES=practice8.1 node tests/audio-relay.cjs`
- **`node tests/relay-zero-gap.cjs`**
  - **対象**: 全11練習ページ
  - **検証内容**: 通常Drillの実録音後経路において、疑似TTS終了コールバックと同一同期ブロック内でAudio.playが即座に呼び出されること（間隔0秒）を確認。
  - **実行場面**: リレー再生開始タイミングの変更時。
- **`node tests/practice72-audio-interruption.cjs`**
  - **対象**: Practice 7.2
  - **検証内容**: 新しい行での録音開始時に先行するモデルTTSおよび録音Audioが即座に中断される排他制御、古いAutoplayコールバックの破棄、データ損失のない再録音動作。
  - **実行場面**: 行間移動時の音声中断・排他制御の変更時。

---

### 3.2 回答判定・STT・TTS

文字列を実際のページ判定ロジックに入力して検証するテスト群です（マイクの音響認識精度の試験ではありません）。

- **`node tests/answer-rules.cjs`**
  - **対象**: 認識対象7ページ
  - **検証内容**: 各文体での「よ／ね／よね」、Formal質問の「か」、数字の表記揺れ、主語と目的語の区別、時間条件、言い直し、Habit必須語の正誤判定（255項目）。
  - **実行場面**: 回答判定ルールや正規化ロジックの修正時。
- **`node tests/stt-display.cjs`**
  - **対象**: 全10対象ページ
  - **検証内容**: 平仮名保持、課別カタカナ、専攻限定語彙、境界判定、同音語、全角記号・空白の処理、誤答差分の文字対応。
  - **実行場面**: 音声認識結果（STT）のテキスト整形・表示ロジック変更時。
- **`node tests/tts-model-script.cjs`**
  - **対象**: 公開11練習ページ
  - **検証内容**: 表示モード（漢字／ひらがな等）に依存せず、漢字かな交じりの同一モデル文がブラウザTTSへ渡ることを確認（22項目）。
  - **実行場面**: 表示モード切替とTTS発話テキスト生成の連携修正時。
- **`node tests/voice-default.cjs`**
  - **対象**: 全8ページ
  - **検証内容**: 日本語音声の初期選択、Utteranceのvoice指定、全角／空白／英語表記の揺れ、保存済み手動設定の復元、候補不在時のフォールバック、遅延リスト取得時の順位維持（112項目）。
  - **実行場面**: 音声選択ドロップダウンや初期Voice決定ロジックの変更時。

---

### 3.3 共通UI・レイアウト・表示

画面幅、コンポーネント配置、テーマ、CSSクラスの共通規則を検証するテスト群です。

- **`node tests/fluid-width.cjs`**
  - **対象**: 全公開9ページ
  - **検証内容**: 幅1440〜2560pxでの本文幅連続計算、最大幅1600px上限、左右余白、キュー／音声／録音ボタンの横位置維持、録音結果側への幅拡張、長い認識結果のはみ出し防止。
  - **実行場面**: ページ最大幅やフルード幅計算CSS/JSの変更時。
- **`node tests/content-layout.cjs`**
  - **対象**: 全11Practice（Drill部分）
  - **検証内容**: 幅600〜1280px（過去の375pxも含む）でのDrill要素の必要幅、不必要な強制改行の有無、ボタン収容、表示文言維持の実測検証。
  - **環境変数**: `CONTENT_BASELINE=/path/to/baseline` で変更前ツリーと比較可能。`PRACTICE_PAGES`、`CONTENT_WIDTHS`、`CONTENT_REPORT` で対象・幅・出力先を指定可能。
  - **関連テスト**:
    - `node tests/content-examples.cjs`: 表形式・画像付き・8系グリッド等の共有Example行・セル矩形検証。
    - `node tests/content-layout-states.cjs`: Set切替、英語キュー切替、表示モード切替時の安定性。
    - `node tests/content-layout-boundaries.cjs`: Drill行の実改行境界と前後1pxの測定。
    - `node tests/content-photograph-controls.cjs`: 写真下の操作ボタン配置検証。
    - `node tests/content-food-callout.cjs`: 2.2 Ex3の食品注釈・価格衝突検証。
    - `node tests/content-price-cues.cjs`: 2.2の価格語中改行防止検証。
- **`node tests/tooltip-layout.cjs`**
  - **対象**: 8練習ページ
  - **検証内容**: 幅600/1440px、明暗テーマでの語彙ツールチップ（20px/18px）の画面内配置・はみ出し防止。
  - **実行場面**: ツールチップ表示ロジックやCSS変更時。
- **`node tests/display-cue-lines.cjs`**
  - **対象**: 1.1, 1.2, 7.1, 7.2, 7.3
  - **検証内容**: Vocab Display時の語句単位改行、語句とヒントの対応、はみ出し防止、英語キュー表示時の区切り維持。
  - **実行場面**: 語彙ヒント表示時の折り返し仕様変更時。
- **`node tests/section-spacing.cjs`**
  - **対象**: 全11練習ページ
  - **検証内容**: ExampleからDrillへの間隔（24px）、セクション間余白の統一。
  - **実行場面**: セクション間マージンやカード外枠の変更時。
- **`node tests/example-arrow-alignment.cjs`**
  - **対象**: 練習1, 2, 7, 8（9ページ）
  - **検証内容**: 同一Example内での矢印（👉️）開始位置の列揃え検証。
  - **実行場面**: Example内のキュー・矢印配置CSS変更時。
- **`node tests/example-vertical-spacing.cjs`**
  - **対象**: 全13練習ページ
  - **検証内容**: Example内の縦余白の共通値、発話強調時の表示崩れなしを確認。
  - **実行場面**: Example内の縦方向マージン・行間変更時。
- **`node tests/shared-conversation-display.cjs`**
  - **対象**: 全13練習ページ
  - **検証内容**: 会話役割（Q/A）と人物色、画像内外の発話同期、指示語返答時の対象強調制御。
  - **実行場面**: 会話UIコンポーネントの表示ロジック変更時。
- **`node tests/semantic-colors.cjs`**
  - **対象**: 11 Practice ＋ 作文・発音（計14ページ）
  - **検証内容**: 文法意味色、太さ700、句読点、明暗テーマでの配色維持。
  - **環境変数**: `SEMANTIC_BASELINE_ROOT=/path/to/baseline` で変更前比較。`SEMANTIC_REPORT` で結果出力。
  - **実行場面**: 共通カラーパレットや文法ハイライトCSSの変更時。
- **`node tests/example-negative.cjs`**
  - **対象**: 11 Practice
  - **検証内容**: 指定された否定要素のみが共通否定色・太字700となり、他のテキスト・DOM・TTS入力が不変であることの回帰検証。
  - **環境変数**: `NEGATIVE_BASELINE_ROOT=/path/to/baseline` で変更前比較。`NEGATIVE_REPORT` で結果出力。
  - **実行場面**: 否定表現の強調表示変更時。
- **`node tests/common-yn-examples.cjs`**
  - **対象**: 1.2, 7.1, 7.2, 7.3, 8.1
  - **検証内容**: 全文体での肯定／否定モデル常時表示、標準化されたYes/No音声ボタンの独立再生とDrill選択不変の照合。
  - **実行場面**: Yes/No選択式Exampleの構造変更時。
- **`node tests/labels-and-speakers.cjs`**
  - **対象**: 1.1, 1.2, 練習2全ページ
  - **検証内容**: Q/A表示、人物X/Y/Zラベル、TTS専用読み、内部キーと画面表示名の分離検証。
  - **実行場面**: 人物ラベルや話者表示の変更時。
- **`node tests/qa-icons.cjs` / `node tests/qa-role-policy.cjs` / `node tests/eyeless-answer-icons.cjs` / `node tests/fluent-filled.cjs`**
  - **対象**: 会話表示を使用する対象ページ群
  - **検証内容**: Microsoft Fluent アイコンパス、SVGレンダリング、アスペクト比、明暗テーマ色、排他ポリシー。
  - **実行場面**: 会話アイコンSVGや表示スタイルの変更時。
- **`node tests/question-indicator.cjs`**
  - **対象**: Practice 1.1, Practice 1.2
  - **検証内容**: 疑問文インジケーター（Question Indicator）の構造・表示契約。
  - **実行場面**: 1.1/1.2の疑問文マーク変更時。
- **`node tests/settings-availability.cjs`**
  - **対象**: 全11ページ
  - **検証内容**: 設定絵文字（Script/Vocab/Speech Style等）の利用可否表示、明暗テーマ色、無効時の白黒表示制御。
  - **実行場面**: ヘッダー設定コントロールの仕様変更時。
- **`node tests/english-cue-navigation.cjs`**
  - **対象**: Practice 7.1, 7.2, 7.3, 2.3, 2.1（テストコードが実際に検証している5ページ）
  - **検証内容**: 下部パネル等からのEnglish Cues切替時に、ビューポート上端に1行分の余白を残して **Drill 1 の見出し**へスムーズスクロールする動作の検証。
  - **共通仕様と検証範囲の区別**:
    - **共通仕様上の確定ルール**: English Cues（日英キュー）切替後の移動先は **Drill 1** とする。
    - **テストの検証対象**: 本テストが実際にスクロール先を検証しているのは上記の5ページである。後からEnglish Cuesが追加・拡張されたページ（1.2, 8.1, 8.3等）や未対応ページは本テストの検証対象に含まれておらず、テストの存在が全ページのスクロール実装完了を保証するものではない（キュー表示自体の拡張検証は `english-cues-expansion.cjs` を参照）。
  - **実行場面**: English Cues切替時のDrill 1へのスクロールナビゲーション変更時。
- **`node tests/english-cues-expansion.cjs`**（`npm run test:english-cues`）
  - **対象**: Practice 1.2, 8.1, 8.3
  - **検証内容**: 新たに展開されたEnglish Cues機能（問題キューの英語化、スラッシュ表記、日本語音声維持）の検証。
  - **実行場面**: 対象ページでのEnglish Cues追加・修正時。
- **`node tests/feedback-rendering-contract.cjs`**
  - **対象**: 判定結果アイコン共通仕様
  - **検証内容**: 正解（Checkmark）、不正解（Fire＋Keep going!）、保留（Footprints）のレンダリング契約。
  - **実行場面**: 判定アイコン描画コンポーネントの変更時。
- **`node tests/css-regression.cjs`**
  - **注意**: 本テストは整理前の古い特定コミット（`f893dd6`）と現行CSSを画素単位で比較する歴史的テストです。現行の意図された130%基準やレイアウト改訂とは互換性がないため、日常の回帰テストとしては実行しません（現在の表示検証は `global-display.cjs` や `content-layout.cjs` を使用します）。
- **`node tests/global-display.cjs`**
  - **対象**: 全公開9ページ
  - **検証内容**: 130%基準、幅600〜1440px、テーマ、文体・Vocab・表記切替時の主要領域はみ出し防止、Example縦長化防止、Text/Hideボタンが非生成であることの確認。
  - **実行場面**: 全体的な表示倍率や共通レイアウトの広範な改修時。
- **`node tests/layout-rules.cjs`**
  - **対象**: 文法5ページ（練習7系中心）
  - **検証内容**: カード内容幅850px前後の段組み境界、説明文ブロック構造の整合性検証。
  - **実行場面**: 練習7の説明文や段組み境界の変更時。
- **`node tests/example-order.cjs`**
  - **対象**: 練習7（7.1, 7.2, 7.3）
  - **検証内容**: 先頭区分、キュー、矢印、音声、本文の列順序、区分の重複禁止、横はみ出し防止。
  - **実行場面**: 練習7のExample構造変更時。`EXAMPLE_ORDER_SMOKE=1 node tests/example-order.cjs` でスモーク実行可能。

---

### 3.4 Practice固有の検証

各ページの固有機能・教材内容・表示ロジックを検証するテスト群です。該当ページを修正した際に選択して実行します。

#### Practice 1.1 / 1.2
- **`node tests/practice11-topic.cjs`**: 1.1 D2/D3の「は」表示、実ボタンからのTTS入力、3文体モデル、D1 Casualの維持。
- **`node tests/p11-cue-resize.cjs`**: 1.1 Exampleセルの幅、単語境界、リサイズ状態の検証。
- **`node tests/display-size.cjs`**: 1.2の130%相当固定、Size選択撤去、設定マトリクス（4幅×通常/ダーク×3文体×Vocab×漢字/ひらがな）での横はみ出し防止、Yes/No応答行の配置照合。
- **`node tests/listen-help.cjs`**: 通常Listen説明撤去、Y/N未選択理由、1.2 D2専攻選択理由、ホバー／キーボード表示と選択後の有効化検証。

#### Practice 2.1 / 2.2 / 2.3
- **`node tests/practice21.cjs`**: 2.1 Ex1の6音声モデル、話者・領域交代、下部モデル対応、各画面幅での表示検証。
- **`node tests/practice21-keep-going.cjs`**: 2.1 Mismatch時の「Keep going!」文言およびFireアイコンの表示検証。
- **`node tests/practice21-feedback-status.cjs`**: 2.1 A案判定結果（Accepted/Mismatch/明示保留Undetermined）の排他表示・保存復元検証。
- **`node tests/practice21-feedback-wrap.cjs`**: 2.1 フィードバック表示の折り返し挙動検証。
- **`node tests/practice21-inline-wrap-geometry.cjs`**: 2.1 インライン折り返しのDOMジオメトリ実測検証。
- **`node tests/practice21-checkmark-stroke.cjs`**: 2.1 正解チェックマークの外観・ストローク検証。
- **`node tests/practice21-feedback-icons-preview.cjs`**: 2.1 アイコン表示プレビュー用検証。
- **`node tests/practice2-next.cjs`**: 2.2のモデル、指示語、価格、場所、短答／全文判定、録音保持（`NEXT_SCREENSHOT_DIR` でスクリーンショット保存可能）。
- **`node tests/practice2-next-inline-wrap-geometry.cjs`**: 2.2/2.3におけるインライン折り返しのDOMジオメトリ検証。
- **`node tests/practice22-qa.cjs`**: 2.2限定のQ/A役割アイコン、人物角丸表示、Ex1〜Ex3およびD1〜D5の話者強調検証。
- **`node tests/practice22-umbrellas.cjs`**: 2.2 D5傘比較課題のモデル、指示語／形式誤答判定、所有対象同期、録音排他と保持。
- **`node tests/practice23-cities.cjs`**: 2.3街課題（Ex1、D1人物/持ち物所在、D2 Country/Time/Cities、D3 Day、D4 English cues）の全モデル、話者色交換、短答／全文判定、録音保持。
- **`node tests/speaker-guide.cjs`**: 練習2の全Exampleにおける話者案内（WhoからA/Bへの変更、Playing時点滅、復帰）の検証。
- **`node tests/lesson2-speaker-pulse.cjs`**: 練習2の人物名赤点滅、外枠強調、reduced-motion対応の検証。
- **`node tests/lesson2-cue-spacing.cjs`**: 練習2の全セット・表記における余計な空白文字の検出。

#### Practice 7.1 / 7.2 / 7.3
- **`node tests/practice71-answer-selection.cjs`**（`npm run test:p71`）: 7.1 Drill 2のYes/No回答選択における局所DOM更新（churnなし）、状態保持、With漢字／Hiragana切替時の維持を検証。
- **`node tests/copy72.cjs`**: 7.2のCopy機能・録音制御の検証。
- **`node tests/preview73.cjs`**: 7.3の130%表示、文法強調（「の」「なんですか」）の検証。

#### Practice 8.1 / 8.2 / 8.3
- **`node tests/practice81.cjs`**: 8.1 D1〜D5のモデル、選択肢、文体設定、文法／状況別フィードバック、Example基線揃え、録音保持の検証。
- **`node tests/practice81-cue-fit.cjs`**: 8.1 D5の配置マトリクス（要素間隔、操作ボタン整列、はみ出し・クリップ測定）。
- **`node tests/practice81-final.cjs`**: 8.1 確定タイトル／説明、問題順／保存ID、L8漢字、Beyond照合、開閉状態保持の総合検証。
- **`node tests/practice81-timing.cjs`**: 仮想時計による録音タイミング・エラーリカバリ検証（※録音タイムアウト時間に関する詳細は第4節を参照）。
- **`node tests/practice81-activity-select.cjs`**: 8.1 ピッカー操作と録音・選択解除の検証。
- **`node tests/practice82.cjs`**: 8.2 全モデル、3文体/2表記/3ヒント、否定形、短答、0秒リレー、録音保持の検証。
- **`node tests/practice82-example-layout.cjs`**: 8.2 Ex1〜Ex4の配置、英語右端整列、非クリップ検証（`P82_LAYOUT_BASELINE` で比較可能）。
- **`node tests/copy82.cjs` / `node tests/copy83.cjs`**: 8.2 / 8.3 のCopy機能の検証。
- **`node tests/practice83-speech-style.cjs`**: 8.3 スピーチスタイル（文体）、TTS入力文、保存状態維持の検証。

#### 共通Beyond（未習語彙・漢字アコーディオン）
- **`node tests/beyond-button.cjs`**: 8.1, 8.2, 8.3 の未習語（Beyond）アコーディオン開閉、スタイル、明暗テーマ色、モード切替時の状態維持検証。

---

### 3.5 German Practice固有の検証

- **`node tests/uebung11.cjs`**
  - **対象**: Deutsche Übung 1.1（`uebung1.1.html`）
  - **検証内容**: 静的構造、4 Drills（各Ex 1問＋練習3問）、German variety設定（DE / AT / CH）、地域別モデル文・許容回答、Copy my sentences、DrillAudioセッション管理、HTML/JS/CSS設計契約の検証。
  - **実行場面**: ドイツ語ドリルページの新規作成・修正時。

---

### 3.6 E2E・横断的な回帰検証

- **`node tests/e2e-all-practice-pages.cjs`**（`npm test` または `npm run test:e2e`）
  - **対象**: 全11 Practiceページ（1.1, 1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3）
  - **検証内容**:
    - **JS例外なし**: 全11ページでの実行時未処理エラー0件を確認。
    - **スラッシュキュー仕様**: 全角 `／` の完全排除、日本語キューのスペース規則維持、English Cues ON時の半角スラッシュ（`word / word`）描画確認。
    - **Vocab / Script切替**: Vocab OFF/Hover/Display時のレイアウト、With漢字／Hiragana Only切替時の状態維持。
    - **回答選択と局所更新**: 7.1 Drill 2のDOM維持局所更新、7.2の属性同期、1.2の選択状態保持。
    - **音声排他制御**: モデル音声再生発火、録音開始時の先行音声Cancel、操作ロック解放。
    - **レイアウト検証**: PC（1440px）およびタブレット（600px）幅での横スクロールはみ出しなし、キュー要素の画面外クリップなし、1文字縦落ちなしを要素バウンディングボックスで実測。
    - **注意（375pxについて）**: 本テストのコード内には過去の検証条件として375pxが含まれていますが、現在の正式サポート範囲はPC・タブレットです。375pxの合格を日常の必須要件として扱わないでください。
  - **実行場面**: 共通基盤の大規模改修など、全ページへの影響が想定される場合や、ページ作業完了後に全体の総合確認が必要な場合。PR作成前であっても、変更範囲に応じて実行要否を判断し、毎回の実行を義務付けない。

---

### 3.7 開発補助・音声収録

- **`node tests/model-recorder.cjs`**
  - **用途**: 開発用モデル音声収録スクリプト。Playwright Chromium上のWeb Audio合成信号をMediaRecorderでWAV記録し、ZIPアーカイブを生成する検証補助ツール。

---

## 4. 録音時間（F4仕様）とテストコードの整合性に関する注意

本プロジェクトで確定している共通録音時間仕様（F4）は以下のとおりです。

### 確定共通仕様（正本: PROJECT_SPEC.md §5.2「録音停止条件（F4・確定仕様）」）
1. **発話前タイムアウト**: 録音開始後、**5秒間**発話がなければ自動停止する。
2. **発話後タイムアウト**: Autostop ONの場合、発話後**2秒間**（2.0秒）の連続無音で自動停止する。
3. **最大録音時間**: Manual / Autostopの設定を問わず、録音開始から**20秒**で強制停止する。

### `tests/practice81-timing.cjs` の実際の検証内容と相違点
`tests/practice81-timing.cjs` を読み取り専用で確認したところ、テストコード内の実際の検証時間は以下のようになっています。

- `scenario === 'pre-speech'`: `p.clock.fastForward(15100)` （**15.1秒**でタイムアウト判定）
- `scenario === 'autostop'`: `p.clock.fastForward(2100)` （**2.1秒**でタイムアウト判定）
- `scenario === 'upper'`: `p.clock.fastForward(20100)` （**20.1秒**でタイムアウト判定）

> [!WARNING]
> **仕様とテストコードの不一致に関する注意**:
> `tests/practice81-timing.cjs` は作成当時の古い仕様（発話前タイムアウト15秒）に基づいて実装されており、現在の確定共通仕様である「**発話前5秒で自動停止**」とは一致していません。
> - テストコードを勝手に変更して5秒仕様に合わせることは禁止されています。
> - `practice81-timing.cjs` が成功したとしても、現在の確定F4仕様（発話前5秒停止）を検証できたことにはなりません。両者を混同しないよう注意してください。

---

## 5. テスト結果・ステータスの報告ルール

作業報告時には、以下の区別を混同せず明確に記載してください。

1. **テストファイルが存在すること**（リポジトリ上にコードがある状態）
2. **テスト仕様の合致状況**（現行仕様と完全に一致しているか、過去の仕様／表示fixtureのみか）
3. **自動検証済み**（Playwrightやモック環境でテストコマンドがエラーなく終了した状態）
4. **実機確認済み**（ユーザーがWebブラウザ実機上で実際の表示・音声・操作を確認した状態）

自動テストの成功やREADMEの記載のみをもって、全ページの動作保証やユーザー実機確認完了とみなすことはできません。
