# テスト運用ガイドとテスト一覧

> **版：2026-11-18.1**
>
> - 既存のテスト運用方針：ユーザー承認済み（2026-11-14）
> - 今回の参照・一覧補正：確認済み（2026-11-16）

本ドキュメントは、October2026 プロジェクト（`lt068028/october2026`）における回帰テストの運用方針およびテスト一覧をまとめたものです。

---

## 1. テスト運用の基本方針

### 1.1 テスト選択の原則
- **一律の実行義務を設けない**: テスト実行を日常の修正作業すべての必須条件とはしません。ユーザーの依頼、現行の作業手順、変更の影響・リスク等から検証が必要と判断された場合に限り、適切な範囲を選びます。
- **ページ固有の変更**: 検証を行う場合は、対象ページ固有のテストや変更に直接関係する動作ロジックのテストを候補とします。無関係なテストを追加しません。
- **共通機能・共通CSSの変更**: 検証が必要な場合は、変更した共通モジュールやスタイルの影響を受ける範囲に対象を限定します。
- **全ページ対象テストの扱い**: 全11ページを横断するE2E・レイアウト検査は、全ページへの波及が想定される場合、またはユーザーが全体確認を指定し、依頼された受入条件に含まれる場合など、作業範囲上必要なときに限ります。ページ作業完了の宣言だけで自動的に実行せず、日常の小作業で一律に実行しません。
- **ページ限定実行**: 環境変数（例: PRACTICE_PAGES=practice8.1 等）で対象を絞り込めるテストは、検証時にページ限定で実行します。

### 1.2 正式サポート端末と画面幅に関する方針
- **正式な対応対象はPCおよびタブレット**: 本プロジェクトにおける正式なレスポンシブ・レイアウト検証対象はPCおよびタブレット画面のうち、幅600px以上です。600px・900px・1440px等は代表的な確認幅であり、1440pxを上限とはしません。
- **スマートフォン幅（375px）の扱い**: スマートフォン幅（375px）での表示検証は、過去の検証記録や一部既存テストコード（`viewport: { width: 375 }`）に含まれていますが、現行プロジェクトにおける**必須の合格条件ではありません**。過去の記録やテストコード内の375px記述を、現在の必須要件と誤認しないようにしてください。

### 1.3 テスト結果と合格判定の区別
以下の事実はそれぞれ独立しており、厳密に区別して扱います。
1. **テストファイルが存在すること**: テストファイルが存在しても、それが現在の最新仕様を完全に保証しているとは限りません。
2. **テストが現在の仕様に対応していること**: 過去の仕様を前提とした古いテストや、表示fixtureのみを検証するテストが存在します。
3. **テストを実行したこと / テストが成功したこと**: Playwrightやモック環境での機械的自動検証に成功した状態です。
4. **ユーザーの実機確認が完了したこと**: 公開URLまたは実機ブラウザ環境で、実際の音声合成品質、マイク録音、音声認識精度、表示・操作感をユーザー自身が確認した状態です。自動テストの成功をもって実機確認済みとみなすことはできません。

### 1.4 実行環境と自動検証の基本方針
- **ローカルNode.jsの扱い**：現状、October2026のローカル作業環境にはNode.jsを導入しません。ユーザーが方針変更を明示するまで、ローカル自動テストを標準要件とせず、Node.jsの導入を前提とする計画・指示を行いません。
- **テスト実行環境**：本プロジェクトの自動テストはNode.js、Playwright、Chromiumを使用します。GitHub Actions CIではWorkflow内でNode.js 20と必要なPlaywright／Chromium環境を用意します。ローカルでテストを実行できることを、テスト選択や作業完了の前提にしません。
- サイト本体にはビルド手順やnpm実行時依存はありません（静的HTML/CSS/JS構成）。
- 本書に記載する `node tests/...` コマンドは、各テストの実行内容・識別を示すものです。ローカルNode.jsの導入やローカル実行を求めるものではありません。
- ユーザーが今回の作業で利用を許可した別環境においてテストを実行する場合、Chromiumの実行ファイルが `/usr/bin/chromium` に存在しなければ、環境変数 `CHROMIUM_PATH` に実行ファイルパスを指定します。

### 1.5 GitHub Actions CIの起動・重複実行制御

- GitHub ActionsのTest Suiteは、mainへのコード／テスト／ワークフロー等の変更、およびmainを対象とするPRで実行する。Markdownファイルのみ、または `docs/` 内だけの変更では、アプリ全体のCIを起動しない。文書とコード等が同じCommitに含まれる場合はCIを実行する。
- `workflow_dispatch` による手動実行は、文書のみの変更であっても利用できる。現行Workflowでは登録済みのテストグループ全体を実行し、個別のテストファイルを選択して実行する機能ではない。
- 同一ワークフロー・同一Git refでは、新しい実行が古い実行を置き換える。新しい関連Commit／PR更新が来た場合、古い実行はキャンセルし、最新の変更を対象とする実行を優先する。
- キャンセルされた実行は合格ではなく「最新変更によって不要になった旧実行」と扱う。完了判定は、最新の関連Commitに対する実行結果で行う。
- 文書のみの変更でCIが起動しないことは、テスト合格を意味しない。アプリコード・テスト対象が変わっていないため、全体テストを省略した状態として扱う。
- 起動条件と重複実行制御の実装正本は `.github/workflows/test.yml` とする。本節はその運用意図を定める。


### 1.6 検証方法の選択とCI対象との照合

- **検証対象の選択**：変更範囲・直接影響する範囲・リスク・受入条件に基づき、必要なテストとその他の検証項目を選択します。一律に全テストを実行せず、無関係なテストを追加しません。
- **CI対象の確認**：選択した自動テストについて、テストファイルが存在することだけでCI実行対象と判断せず、`.github/workflows/test.yml` の実際の実行対象と起動条件を確認します。本書のテスト一覧・説明はテストの用途を示し、CIへの登録を保証しません。
- **CI対象に含まれる場合**：必要な自動検証はGitHub Actions CIを基本経路とします。対象テストがPush等で実行される条件を満たすかを確認し、実際の実行結果で判定します。
- **CI対象に含まれない場合**：必要性に応じてCIへの追加を提案するか、ユーザーが今回の作業で利用を許可した環境、またはユーザー自身によるブラウザ・実機確認等の適切な方法を選びます。CIワークフローの変更は、具体的な変更内容を提示し、ユーザーの承認を得てから実施します。
- **未検証の扱い**：どの方法でも必要な検証を実施できない場合は、未検証の項目と理由を報告し、検証済みと扱いません。CIが起動しなかった場合や、必要なテストが実行対象に含まれていなかった場合も、その事実と未検証範囲を明示します。
- **結果の意味**：CIの成功は、実際に実行されたテストの成功だけを意味します。テスト一覧にあるすべてのテストの成功、CI対象外の検証、またはユーザーの実機確認を意味しません。
- **不一致への対応**：本書のテスト一覧・説明とWorkflowの実行対象に不一致がある場合は、不一致として報告します。どちらかを独断で正しいと決めたり、CI対象を独断で変更したりしません。実際のCI実行対象・起動条件は `.github/workflows/test.yml` を根拠として確認します。

### 1.7 テスト作成・改訂時の検証対象および共通テスト整合規定（2026-11-18追記）

- **画面上の最終描画結果・算出スタイルの直接検証**：機能・表示修正のテストでは、内部変数やクラス付与だけでなく、学習者の画面に最終的に描画される DOM 要素・テキスト・算出スタイル（`getComputedStyle`）を直接検証すること。
- **仕様改訂時の個別テスト・共通テスト同時整合確認**：仕様書の動作ルールを改訂した際は、対象ページの個別テストだけでなく、そのページを対象に含む共通テスト（Group 2 等）の期待値との整合確認を同時に行うこと。

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

- **CI 登録状況（全 85 テスト）**：`.github/workflows/test.yml` の Group 1〜5 に登録されている 70 テストが CI 実行対象です。残り 15 テスト（`copy11.cjs`, `copy12.cjs`, `copy21.cjs`, `copy22.cjs`, `copy23.cjs`, `copy71.cjs`, `copy81.cjs`, `eyeless-answer-icons.cjs`, `fluent-filled.cjs`, `practice21-checkmark-stroke.cjs`, `practice21-feedback-icons-preview.cjs`, `practice21-feedback-status.cjs`, `practice21-feedback-wrap.cjs`, `practice21-keep-going.cjs`, `qa-role-policy.cjs`）は **CI 対象外（個別補助検証）** です。
- **対象ページ数・検証範囲の最新基準**：`fluid-width.cjs`（12 ページ）、`global-display.cjs`（12 ページ）、`example-vertical-spacing.cjs`（既定 14 ページ）、`section-spacing.cjs`（practice・pronunciation・composition の HTML 走査）、`tooltip-layout.cjs`（8 Practice ＋ Composition・Pronunciation 対象、Mouse Hover / Tab Focus / Escape 閉鎖 / Voice Dropdown 優先 Escape / Touch / Practice 8.2・Übung 1.1 契約検証）。

### 3.1 音声操作・録音・リレー・ライフサイクル

原則として外部環境に依存しない制御可能な代替（モック）を使用していますが、一部テストではブラウザ標準 API ラッパーや明示的なイベント制御を併用しています。実際のブラウザ音声認識精度、実TTS発音、実マイク音質を保証するテストではありません。

- **`node tests/audio-transitions.cjs`**
  - **対象**: 作文、発音1、発音2
  - **検証内容**: 有効な録音→自動再生→次行、Labの左右切り替え、録音→再生→モデル音→再録音、マイク許可拒否からの復帰、Autostop ON/OFF、禁止カーソル、モデル収音の終了通知欠落、発音2のリレー／手動／LabのPlaying表示と再生中Autoplay切替許可、Casual無効化、案内表示の検証（80項目）。
  - **実行場面**: 作文・発音ページの音声状態遷移やAutostop/Autoplay設定の変更時。
- **`node tests/audio-lifecycle.cjs`**
  - **対象**: 9ページ（Practice 1.1／1.2、7.1〜7.3、8.1、Composition 1、Pronunciation 1／2。`PRACTICE_PAGES` で絞り込み可能）
  - **検証内容**: 操作ロック、再生キャンセル、遅延イベント、ページ離脱、Voice変更とモデル曲線の無効化（167項目）。
  - **実行場面**: 排他ロック制御、ページ離脱時の音声停止、音声モデル切り替え処理の変更時。
  - **実行例**: `PRACTICE_PAGES=practice8.1 node tests/audio-lifecycle.cjs`
- **`node tests/audio-recovery.cjs`**
  - **対象**: 全8ページ
  - **検証内容**: TTSタイムアウト（20秒）、録音再生duration＋3秒（未取得時23秒）、作文の個別・リレー表示、Lab解析10秒タイムアウト、未完了のdecode/close処理、録音データ保持・再試行・遅延結果の破棄。Worker計算一致とCPU占有Workerの中断（88項目）。
  - **実行場面**: タイムアウト処理、エラーリカバリ、Worker通信の修正時。
- **`node tests/audio-relay.cjs`**
  - **対象**: 12ページ（Practice 1.1／1.2、2.1〜2.3、7.1〜7.3、8.1、Composition 1、Pronunciation 1／2。`PRACTICE_PAGES` で絞り込み可能）
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

- **`node tests/f4-recording-limits.cjs`**
  - **対象**: 日本語の録音対象14ページ（`PRACTICE_PAGES` で絞り込み可能）
  - **検証内容**: 発話開始前5秒停止（Autostop ON時、およびManual時の5秒停止廃止が先行適用された `practice8.2.html` を除く未適用13ページ）と停止理由メッセージ `No speech detected within 5 seconds.`、`practice8.2.html` の Manual 時5秒継続検証、発話後の連続2.0秒無音停止と途中発話による計測リセット（Autostopのみ）、Manual時の発話後無音停止なし、20秒の絶対上限と停止理由メッセージ `Auto-stopped after 20 seconds.`（Autostop／Manual双方）、認識終了イベント単独では2.0秒の無音停止を代替しないこと、および停止時のマイク・音量監視リソース解放。制御されたモック環境による検証。
  - **実行場面**: 共通録音停止条件または対象ページの録音停止監視ロジックを変更した場合。

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
  - **対象**: 8 Practice ＋ Composition・Pronunciation・Practice 8.2・Übung 1.1
  - **検証内容**: 幅600/1440px、明暗テーマでの語彙ツールチップ（20px/18px）の画面内配置・はみ出し防止、Mouse Hover / Tab Focus / Escape 閉鎖 / Voice Dropdown 優先 Escape / Touch、および共通 `ResizeObserver`（コンテンツ領域サイズ変化・非ループ収束）・スクロール・Viewport リサイズ時の通常／ガイド Tooltip 自動追従。
  - **実行場面**: ツールチップ表示・再配置ロジックやCSS変更時。
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
  - **対象**: Practice 1.1, 1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, Composition 1
  - **検証内容**: 停止ボタン横の疑問文インジケーター（`QuestionIndicator`）の構造・表示数・非表示条件（Practice 1.1およびPractice 8.2では0個）の契約検証（Practice 8.2 Drill 2のキュー左側「疑問文マーカー」は `tests/practice82.cjs` で分担検証）。
  - **実行場面**: `QuestionIndicator` の表示条件・構造変更時（GitHub Actions CI Group 4A に登録済み）。
- **`node tests/settings-availability.cjs`**
  - **対象**: 全11ページ
  - **検証内容**: 設定絵文字（Script/Vocab/Speech Style等）の利用可否表示、明暗テーマ色、無効時の白黒表示制御。
  - **実行場面**: ヘッダー設定コントロールの仕様変更時。
- **`node tests/english-cue-navigation.cjs`**
  - **対象**: Practice 7.1, 7.2, 7.3, 2.3, 2.1（テストコードが実際に検証している5ページ）
  - **検証内容**: 下部パネル等からのEnglish Cues切替時に、ビューポート上端に1行分の余白を残して対象の指示パネル見出しへスムーズスクロールする動作の検証（Practice 7.1では現在の段階見出し）。
  - **共通仕様と検証範囲の区別**:
    - **共通仕様上の確定ルール**: 切替後の移動先は対応する指示パネル見出しとする。Practice 2.1／2.3／7.2／7.3はDrill 1、Practice 7.1は現在選択中の段階（Drill 1／2／3）の見出し。
    - **テストの検証対象**: 本テストが実際に見出しの位置を検証しているのは上記の5ページであり、見出し文言自体の正しさを照合するテストではない。後からEnglish Cuesが追加・拡張されたページ（1.2, 8.1, 8.3等）や未対応ページは本テストの検証対象に含まれておらず、テストの存在が全ページのスクロール実装完了を保証するものではない（キュー表示自体の拡張検証は `english-cues-expansion.cjs` を参照）。
  - **実行場面**: English Cues切替時のDrill 1へのスクロールナビゲーション変更時。
- **`node tests/english-cues-expansion.cjs`**（`npm run test:english-cues`）
  - **対象**: Practice 1.2, 8.1, 8.3
  - **検証内容**: 新たに展開されたEnglish Cues機能（問題キューの英語化、スラッシュ表記、日本語音声維持）の検証。
  - **実行場面**: 対象ページでのEnglish Cues追加・修正時。
- **`node tests/feedback-rendering-contract.cjs`**
  - **対象**: 判定結果アイコン共通仕様
  - **検証内容**: 現行のAccepted／Mismatch（Checkmark、Fire＋Keep going!）のレンダリング契約。Footprints／Undeterminedの現行機能を検証するテストではない。
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
- **`node tests/copy11.cjs`**: 1.1 Task 1〜3のCopy対象範囲、各Taskの日付付き見出し、Copied表示・復帰、クリップボード失敗時の動作。
- **`node tests/display-size.cjs`**: 1.2の130%相当固定、Size選択撤去、設定マトリクス（4幅×通常/ダーク×3文体×Vocab×漢字/ひらがな）での横はみ出し防止、Yes/No応答行の配置照合。
- **`node tests/listen-help.cjs`**: 通常Listen説明撤去、Y/N未選択理由、1.2 D2専攻選択理由、ホバー／キーボード表示と選択後の有効化検証。
- **`node tests/copy12.cjs`**: 1.2 Drill 1／2のCopy対象、日付付き見出し、Copied表示・復帰、クリップボード失敗時の動作。

#### Practice 2.1 / 2.2 / 2.3
- **`node tests/practice21.cjs`**: 2.1 Ex1の6音声モデル、話者・領域交代、下部モデル対応、各画面幅での表示検証。
- **`node tests/copy21.cjs`**: 2.1 Drill 1〜3のCopy対象、日付付き見出し、Copied表示・復帰、クリップボード失敗時の動作。
- **`node tests/practice21-keep-going.cjs`**: 2.1 Mismatch時の「Keep going!」文言およびFireアイコンの表示検証。
- **`node tests/practice21-feedback-status.cjs`**: 2.1の新規回答がAccepted／Mismatchのみを生成し、認識エラー・音声のみ・キャンセル等を保留へ分類しないこと、および旧Undetermined表示fixtureの互換確認を行うテスト。fixtureの保留表示は現行機能・現行仕様を意味しない。
- **`node tests/practice21-feedback-wrap.cjs`**: 2.1 フィードバック表示の折り返し挙動検証。
- **`node tests/practice21-inline-wrap-geometry.cjs`**: 2.1 インライン折り返しのDOMジオメトリ実測検証。
- **`node tests/practice21-checkmark-stroke.cjs`**: 2.1 正解チェックマークの外観・ストローク検証。
- **`node tests/practice21-feedback-icons-preview.cjs`**: 2.1 アイコン表示プレビュー用検証。
- **`node tests/practice2-next.cjs`**: 2.2のモデル、指示語、価格、場所、短答／全文判定、録音保持（`NEXT_SCREENSHOT_DIR` でスクリーンショット保存可能）。
- **`node tests/practice2-next-inline-wrap-geometry.cjs`**: 2.2/2.3におけるインライン折り返しのDOMジオメトリ検証。
- **`node tests/practice22-qa.cjs`**: 2.2限定のQ/A役割アイコン、人物角丸表示、Ex1〜Ex3およびD1〜D5の話者強調検証。
- **`node tests/copy22.cjs`**: 2.2 Drill 1〜4のCopyボタン・出力見出し・対象範囲とクリップボード動作の検証。
- **`node tests/practice22-umbrellas.cjs`**: 2.2 D5傘比較課題のモデル、指示語／形式誤答判定、所有対象同期、録音排他と保持。
- **`node tests/practice23-cities.cjs`**: 2.3街課題（Ex1、D1人物/持ち物所在、D2 Country/Time/Cities、D3 Day、D4 English cues）の全モデル、話者色交換、短答／全文判定、録音保持。
- **`node tests/copy23.cjs`**: 2.3 Drill 1〜3のCopy対象、日付付き見出し、Copied表示・復帰、クリップボード失敗時の動作。
- **`node tests/speaker-guide.cjs`**: 練習2の全Exampleにおける話者案内（WhoからA/Bへの変更、Playing時点滅、復帰）の検証。
- **`node tests/lesson2-speaker-pulse.cjs`**: 練習2の人物名赤点滅、外枠強調、reduced-motion対応の検証。
- **`node tests/lesson2-cue-spacing.cjs`**: 練習2の全セット・表記における余計な空白文字の検出。

#### Practice 7.1 / 7.2 / 7.3
- **`node tests/practice71-answer-selection.cjs`**（`npm run test:p71`）: 7.1 Drill 2のYes/No回答選択における局所DOM更新（churnなし）、状態保持、With漢字／Hiragana切替時の維持を検証。
- **`node tests/copy71.cjs`**: 7.1のメインDrill／Q&A別Copy出力、正誤マーカー、ボタン状態、クリップボード失敗時の動作。
- **`node tests/copy72.cjs`**: 7.2のCopy機能・録音制御の検証。
- **`node tests/preview73.cjs`**: 7.3の130%表示、文法強調（「の」「なんですか」）の検証。

#### Practice 8.1 / 8.2 / 8.3
- **`node tests/practice81.cjs`**: 8.1 D1〜D5のモデル、選択肢、文体設定、文法／状況別フィードバック、Example基線揃え、録音保持の検証。
- **`node tests/practice81-cue-fit.cjs`**: 8.1 D5の配置マトリクス（要素間隔、操作ボタン整列、はみ出し・クリップ測定）。
- **`node tests/practice81-final.cjs`**: 8.1 確定タイトル／説明、問題順／保存ID、L8漢字、Beyond照合、開閉状態保持の総合検証。
- **`node tests/practice81-timing.cjs`**: 仮想時計による録音タイミング・エラーリカバリ検証（※録音タイムアウト時間に関する詳細は第4節を参照）。
- **`node tests/practice81-activity-select.cjs`**: 8.1 ピッカー操作と録音・選択解除の検証。
- **`node tests/copy81.cjs`**: 8.1 Drill 1〜5のCopyボタン配置・有効化、コピー本文、Copied表示・復帰、クリップボード失敗時の動作。
- **`node tests/practice82.cjs`**: 8.2 全モデル、3文体/2表記/3ヒント、否定形、短答、Incomplete表示・5秒STT保護・フィラー、0秒リレー、録音保持の検証。
- **`node tests/practice82-example-layout.cjs`**: 8.2 Ex1〜Ex4の配置、英語右端整列、非クリップ検証（`P82_LAYOUT_BASELINE` で比較可能）。
- **`node tests/copy82.cjs` / `node tests/copy83.cjs`**: 8.2 / 8.3 のCopyボタン・出力内容・状態保持の検証。Practice 8.2では、各DrillのCopyボタンはそのDrill自身に有効な保存済みSTTがある場合に個別に有効化し、押下時のコピー本文は`PROJECT_SPEC.md` §7.2に従って同一学習単位内の先頭から押下対象Drillまで累積する。後続Drillや独立した学習単位は含めない。
- **`node tests/practice83-speech-style.cjs`**: 8.3 スピーチスタイル（文体）、TTS入力文、保存状態維持の検証。

#### 共通Beyond（未習語彙・漢字アコーディオン）
- **`node tests/beyond-button.cjs`**: 8.1, 8.2, 8.3 の未習語（Beyond）アコーディオン開閉、スタイル、明暗テーマ色、モード切替時の状態維持検証。

---

### 3.5 German Practice固有の検証

- **`node tests/uebung11.cjs`**
  - **対象**: Deutsche Übung 1.1（`uebung1.1.html`）
  - **検証内容**: 静的構造、Global Settings 24px / Drill 20px Fluent SVG・`Auto-Compare` 表記・左詰め標準英文ツールチップ、4 Drills（各Ex 1問＋練習3問・全16問動詞重複なし、SVO発話順キュー・主語明示 `Ich`/`Du`/`Er`/`Ihr`）、German variety設定（DE / AT / CH）および地域別名詞交代（`Krankenhaus`/`Spital` 3モード対語直下表示）・DE/AT/CH ベクターSVG国旗・右端シンプル地域補足、`zum`/`zur` に対する非縮約形（`zu dem`/`zu der`）の厳格許容、3状態判定（`Accepted` / `Incomplete` / `Mismatch`）、空STT時の録音データ破棄、単語単位差分・赤字（`.result-incorrect`）・細字欠落 `＿`（`.result-missing`）・Footprints 25×25px+`…` 描画、`Playing...` 廃止・`Auto-Compare` ON リレー再生制御（`keepButtons: true`・全終了経路復元・二重イベント/旧イベント防止）・1行目限定ホバー、`drill-audio-session.js` のボタン限定 `cursor: default`、各Drillの既存CopyボタンからDrill 1〜押下対象Drillまでをページ順・回答済みDrillのみ累積コピー（ボタンラベル `Copied` 2秒自動復帰・`✅`/`👣`/`🔥`マーカー・raw STTのみ・再生維持）、HTML/JS/CSS設計契約の検証。（※`docs/GERMAN_DRILL_SPEC.md` は共通仕様・コード・テストへの移行と廃止可否の確認中。現在の規則の正本として恒久維持する前提ではない）
  - **既知の未整合**：現行tests/uebung11.cjsには、Drill単位だけをコピーするScenario 20Bの旧期待値と、累積Copy方式の検証が併存している。累積Copy契約へ統一するテスト改修は後続作業で行う。また、Germanフィラーohが除去されないことを直接確認する否定テストは未追加であり、後続テスト改修の対象とする。
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
  - **実行場面**: 共通基盤の大規模改修など、全ページへの影響が想定される場合や、ユーザーの指示・依頼された受入条件が全体確認を求める場合。ページ作業完了の宣言だけでは実行せず、変更範囲に応じて要否を判断し、毎回の実行を義務付けない。

---

### 3.7 開発補助・音声収録

- **`node tests/model-recorder.cjs`**
  - **用途**: 開発用モデル音声収録スクリプト。Playwright Chromium上のWeb Audio合成信号をMediaRecorderでWAV記録し、ZIPアーカイブを生成する検証補助ツール。

---

## 4. 録音停止条件テストの参照

共通録音停止条件の正本は `PROJECT_SPEC.md` §5.2.1・§5.2.2です。本節はテストごとの期待値と現行仕様との関係を整理するものであり、録音停止条件そのものを再定義しません。

### `tests/practice81-timing.cjs` の旧ページ個別検証値

`tests/practice81-timing.cjs` のソースに記載された時間条件は次のとおりです。

- `scenario === 'pre-speech'`: `p.clock.fastForward(15100)`（**15.1秒**）
- `scenario === 'autostop'`: `p.clock.fastForward(2100)`（**2.1秒**）
- `scenario === 'upper'`: `p.clock.fastForward(20100)`（**20.1秒**）

> [!WARNING]
> このテストは作成当時のページ個別条件（発話前タイムアウト15秒）を前提とする旧テストです。現在の共通仕様である「発話開始前5秒」を検証するものとして扱わないでください。
> - 旧テストの期待値を、現在の共通仕様の根拠として使用しないでください。
> - このテストの存在・成功だけでは、現行の共通録音停止条件への適合を証明しません。
>
> 現行共通条件を対象とする `tests/f4-recording-limits.cjs` は、日本語の録音対象14ページについて、発話開始前5秒と正確な停止理由メッセージ、連続2.0秒の無音停止と途中発話による計測リセット、Manual時の発話後無音停止なし、20秒の絶対上限と正確な停止理由メッセージ、認識イベント単独での代替不可、および停止時のリソース解放をモック環境で検証する内容です。記載された検証内容は、テスト実行済み・実機確認済みを意味しません。
