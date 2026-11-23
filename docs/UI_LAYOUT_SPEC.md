# October2026 共通UI・レイアウト仕様（UI_LAYOUT_SPEC）

> **文書バージョン：V5（2026-11-19 Global Settings・音声再生共通仕様の追加）**
>
> - 文書状態：既存のユーザー承認済み共通UI契約を維持し、2026-11-19にユーザーが確認したGlobal Settings・音声再生UIの共通規則を追加したもの。文書への掲載は、全ページの実装適合や実機確認を意味しない。
> - Q/A Filled：ユーザー承認済み（2026-11-16確認）。
> - この文書への掲載・承認は、すべての既存ページの実装適合やProductionでの実機確認を意味しない。

## 1. 目的・適用範囲・正本

本書は、October2026の共通UI、表示、操作部品の外観、レイアウト、幅配分および折り返しの設計契約を定める。今回、Global Settingsと音声再生ボタンの共通表示・操作補助規則を追加する。

| 情報 | 正本 |
| --- | --- |
| 共通UI・表示・操作配置・レイアウト | 本書 |
| 録音・再生・TTS／STT・状態保持・回答判定・共通機能 | [PROJECT_SPEC.md](PROJECT_SPEC.md) |
| 現在の設問・教材・語彙・表示文言・選択肢 | 各ページの実装コード |
| ページ固有の教育上の制約・承認済み表示例外 | 該当するPractice固有仕様書 |
| STT原文・表示変換・境界例 | [STT_DISPLAY_RULES.md](STT_DISPLAY_RULES.md) |
| 自動検証の具体的手順 | 対応するテストコード |
| 文書の新設・更新・統合・廃止・整合性確認 | [RELAY_WORKFLOW.md §5](RELAY_WORKFLOW.md#5-仕様書管理と継続的整合性確認) |

同じ共通規則を複数文書で再定義しない。ページ固有の承認済み例外は該当ページ仕様書へ置き、本書にはその内容を重複転記しない。Deutsche Übungを含む各言語ページは、共通UI規則のうち同等の設定・操作を採用するものを適用する。日本語Practice固有の教材・教育・設問規則を他言語へ自動適用しない。German固有の学習内容・地域変種・TTSロケール等は、共通仕様・コード・テストへの移行が完了するまでに限り既存の `GERMAN_DRILL_SPEC.md` を参照する。ドイツ語ページの説明文・音声案内は、対象言語と機能に合わせた文面にできる。

## 2. 正式サポート範囲・基本寸法

- 正式サポート対象はPC・タブレットとし、画面幅600px以上を基準とする。スマートフォンは正式サポート対象外。375pxは必要時の参考診断であり、必須検証・合格条件・動作保証にはしない。
- 文字・学習操作は既存の130%相当の標準表示を維持する。文字サイズの指定は余白・列間隔・行間まで一律に1.3倍する意味ではない。独自のSize切替やズームUIを追加しない。
- ページ本文は通常1280pxを基準とし、大画面では連続的に最大1600pxまで拡張する。標準幅の画面1440pxでは本文1280px、画面1920pxでは1520px、2080px以上では1600pxを上限とし、左右外側に最低32pxを確保する。
- 説明パネルの本文（`info-panel-desc`）は最大75chを目安とし、教材本文領域の幅とは分けて扱う。

## 3. 共通レスポンシブ・幅配分の設計契約（2026-11-07確定）

適用対象は全PracticeページのExample・Drillのラベル、キュー、矢印、音声ボタン、モデル本文および結果領域。ページ固有の教育上の配置・会話構造・画像上の操作配置は維持し、見た目の一律化ではなく幅配分と折り返し判定の原則を共通化する。

1. **役割に応じた幅配分**：操作ボタン・矢印・意味上不可分な日本語キュー／ラベルは内容に必要な幅を優先し、モデル本文・英訳・結果表示など可変領域へ残余幅を配分する。同じExample／Drill内で共有すべき列は、実際の最長内容に合わせて整列する。内容基準の計測pxは許容するが、理由のない任意の固定幅や余剰幅のキューへの割当てはしない。
2. **意味単位での折り返し**：`🔊きく`等の操作表示、教師が指定したキューの語句単位、矢印と対応する音声ボタン、区分と対応する内容を不自然に分断しない。意図的な質問／回答の別行やDisplayヒントの語句単位改行は維持する。スペースが不足する場合は、意味のまとまりを保った単位で段を切り替える。
3. **不足幅への対応順序**：主要な学習内容と操作を先に確保し、不必要な余白を縮小したうえで、伸縮可能なモデル本文・補助英訳・結果領域を調整する。補助英文の省略は内容確認手段（Hover・フォーカス・展開等）を備え、教材の意味や音声操作を損なわない場合に限る。日本語・操作ボタンを隠す、画面外へ押し出す、単に`overflow:hidden`で問題を覆う対処は禁止する。
4. **共通実装優先**：既存の共通`style.css`、`example-text-layout`、共有列・既存共通部品とCSS変数を優先使用する。類似するExample／Drillの幅配分・段組みをページごとに独立再実装しない。異なるページ構造に共通HTML／JSの全面統一を強制しない。固有指定・上書きが必要なら、対象セレクタ・根拠・影響範囲を限定する。
5. **実際の収まりを優先するレスポンシブ判定**：画面幅やコンテナ幅の固定境界だけを理由として、主要要素が十分収まる行を不要に分割しない。改行の要否は利用可能な内幅、文字の実測幅、列間隔・余白、選択中の文体／表記／Vocab／表示倍率を踏まえて判定する。画面幅だけによる一律の段組み切替を、Example・表形式Drillの折り返し条件にしない。
6. **振る舞いを検証する**：新規制作・該当レイアウトの修正では、狭幅から広幅へ複数の幅と境界の前後を実ブラウザで測り、不要な行分割、意味単位の分離、ボタンの欠落・重なり、横はみ出し、拡大縮小や設定切替後の破綻を検出する。単なる`scrollWidth`検査や幅ごとのスクリーンショットだけで合格としない。意図的な改行と不具合を区別するため、仕様上の行グループと実測位置を照合する。
7. **不合格時のフィードバック**：規則違反の疑いが出た場合は、ページ・Example／Drill・対象要素・画面／コンテナ幅・表示設定・要素の矩形と利用可能な内幅・違反条件・関連CSS／推定原因を提示する。確定できない判定は「要確認」とし、誤検知を合格／不合格に偽装しない。修正後は該当範囲を再テストし、未解消の規則違反が残る場合は検証完了としない。

仕様登録だけで既存実装の適合や是正完了を意味しない。共通仕様の影響調査・是正・再検証の起動条件と完了条件は[RELAY_WORKFLOW §5.8](RELAY_WORKFLOW.md#58-共通仕様の新設変更時の適用確認と是正完了義務)に従う。ページ作業完了後は変更箇所と直接影響を受ける範囲を最終確認する。ページ全体テストは、ユーザーの明示指示、依頼された受入条件、または変更がページ全体へ及ぶなど作業範囲上必要な場合に限り実施し、ページ作業完了だけを理由に自動開始しない。

## 4. 共通行・列・縦余白

### 4.1 キュー・矢印・音声列

- キュー列幅は内容基準とする。Drillは同一Drill内、Exampleは同一Example内で必要な列を共有する。ページ全体の全Drillを一つの列へ揃えない。
- 実測した最長キュー幅を基準に矢印・音声ボタンの開始位置を揃え、余剰幅をキューへ配分しない。JavaScriptが実測値をpxで保持する場合も、内容幅に基づく計測であることを維持する。
- 矢印と対応する音声ボタンは一組として扱う。狭幅でラベル／キューを上段へ移す場合も、矢印だけを上段に残さず、対応する音声ボタンと同じ段に置く。
- モデル本文・英訳・結果欄は残余幅を活用し、必要なときだけ次行へ送る。結果欄は右寄せを基本とし、操作領域や停止ボタンの必要幅を侵食しない。
- Exampleの同じ行にある本文と音声ボタンはベースラインを共有する。共通の`example-text-layout`を使い、個別のtop／transform等で補正しない。折り返して別行になった本文へ同じY座標を要求しない。
- 会話Exampleの基本順序は、発話役割 → 人物（指定がある場合）→ キュー → 矢印 → 音声 → モデル本文とする。人物指定のない課題へ人物名や人物表示を新設しない。

### 4.2 Example・セクションの縦余白

| 場所 | 基準 |
| --- | ---: |
| 独立したExample本文行の間 | 8px（`--example-row-gap`） |
| 同一行グループ内での折り返し | 4px（`--example-wrap-gap`） |
| 画像とExample本文群の間 | 12px（`--example-content-gap`） |
| Exampleから対応するDrillまで | 24px（`--example-drill-gap`） |
| 次の練習セクションまで | 40px（`--practice-section-gap`） |

- 行間は親のgap等の共通トークンで管理し、段落のブラウザ標準marginや各行の個別paddingを重ねて余白を作らない。
- Example内の発話行間にグレーの点線・破線を使わない。発話行は既定の行配置・余白・話者表示で区別する。語彙Hoverの点線下線、Exampleカード外枠、Drill内の区切り、Practice 8.3のカテゴリ／セット区切りは対象外とする。

### 4.3 Yes/No Exampleの表示配置

- Yes/No Exampleでは質問・肯定返答・否定返答の3モデルを常時表示し、いずれかの選択や再生によって他のモデルを隠さない。モデル文の表示・選択・再生の機能条件はPROJECT_SPEC §7.3を参照する。
- 3つの音声ボタンは同じ縦列に配置する。肯定・否定のモデル本文も縦に並べ、Responseの役割ラベルは返答群の最初だけに表示する。
- Question／Responseの役割アイコンは本書§7.2に従う。Yes/Noアイコンの外観は本書§8に従い、音声ボタンと本文の基線を維持する。

## 5. 共通UIの既定契約

新規ページ・改修対象では、次の共通部品・基本値を使い、承認のないページ固有の再定義を追加しない。

| 対象 | 共通実装・基本値 | 適用原則 |
| --- | --- | --- |
| 通常の項目名・役割名・比較項目名 | `example-label-title`、太字、`--example-label-color`。通常の背景バッジなし | 文法意味色とは別管理。概念区分は原則Example内に置き、通常Drillへ無断展開しない |
| 時制・アスペクト区分 | Practice 7の比較用区分表示 | 異なる時制・アスペクトを比較するExample／Drillに限る。通常項目名や単一区分のDrillへ追加しない |
| 文法強調 | `grammar-highlight`／`--grammar-highlight-color` | 指定された文法要素だけを強調する。色トークンは共通`style.css`で管理し、ページ内で独自の色値を再定義しない。句読点の扱いは該当ページ仕様に従う |
| Example本文・音声文字 | `example-text-layout`の基線配置 | 同じ行の最初の文字の基線差は0.5px未満を目標に確認。固定px移動で合わせない |
| 程度副詞の肯定・否定 | `degree-positive`／`degree-negative`、`--degree-positive-color`／`--degree-negative-color` | PROJECT_SPECの共通肯定／否定色への参照として使う。課題固有の適用範囲・語句はPractice固有仕様を参照 |

- すべての太字を文法意味色へ変換しない。文法強調は指定箇所に限る。
- 通常の項目名に装飾バッジを新設しない。ページ固有の承認済みバッジ例外はPractice固有仕様に記録する。

## 6. ラテン文字フォント・説明文・キュー表示

### 6.1 ラテン文字フォント

- 日本語学習DrillサイトのLatin-script UI textはLatoを標準フォントとする。日本語文字は既存の日本語フォント設定を維持し、日本語をLatoへ強制しない。
- 対象は英語Cue文、英語ラベル、セット切替ボタン、ドリル切替・操作案内、セグメント制御オプション、ドロップダウン項目、英語見出し・説明文、ツールチップ等。
- 日英混在では`Lato, sans-serif`のフォールバックまたは言語別セレクタを使い、日本語グリフは従来の日本語フォントで描画する。既存コンテンツをフォント適用だけのために不必要にDOM分割しない。
- 共通フォントは`style.css`で管理し、対象HTMLでフォント本体を読み込む。CSSのfont-family指定だけで読み込み済みと判断しない。

### 6.2 Drill説明文

- Drill説明文（`.info-panel-desc`、English Cues説明文を含む）の先頭にはMicrosoft Fluent `Lightbulb 24` SVGアイコンを配置し、文章を短縮しても先頭の電球アイコンを残す。Practice 8.2では `Lightbulb 24 Filled` を使用する。他ページの既存・未移行アイコンvariantは今回変更せず、各ページの個別対応時に扱う。
- 短い同目的の説明は一段落にまとめる。課題と補足、独立した操作手順は分け、句点ごとの一律改行はしない。
- 課題を先に示し、タイトル・Exampleと重複する前置きを省く。学習者に必要な操作・文型が伝わることを優先し、画面幅に応じて自然に折り返す。

### 6.3 Vocab・キュー区切り

- 文法Exampleの語彙ヒントは原則キュー側へ表示し、モデル本文へ同じローマ字・英訳ヒントを重複表示しない。画像教材・Example内の語彙Hover等、承認済みのPractice 2固有例外は各ページ仕様に従う。
- Vocab Displayでは、日本語キューと対応する読み／意味を一組として扱い、各組を別行に置く。組の内部で長いヒントがある場合は自然に折り返す。Hover／OFFおよびEnglish Cuesの既存配置を変えない。対象はVocab機能を持つPracticeページに限る。
- 日本語キューの区切りスラッシュは半角`/`を使用し、既存の空白規則を維持する。指定のないスペースを追加・削除しない。English Cuesではスラッシュ前後に半角スペースを各1個置く（`word / word`）。語句内部の空白は維持する。Vocab Displayでは既存のスラッシュ非表示動作を維持する。
- スラッシュ規則はタイトル、説明文、語彙訳、数式・除算演算子、Deutsche Übungには適用しない。

## 7. 会話役割・人物ラベル・疑問文アイコン

### 7.1 Q/Aの意味と3種の疑問文関連表示の分離定義

- Q/Aは文法形式ではなく、会話における質問・回答という発話の役割を示す。通常の質問→回答はQ→Aとする。
- 単独の疑問文作成や、回答のない質問形式比較にはQ/Aを付けない。疑問文であることだけから会話役割のQを自動推定しない。
- Smile/Frown付きの回答行・回答群ではAを省略し、質問のQは維持する。Y/N文法だけを理由にAを省略しない。
- A省略はSmile/Frown付き回答と、承認済みのページ固有構造に限る。通常の返答行のAは維持する。Practice 8.3のQ→Q→なしは[PRACTICE8_SPEC.md](PRACTICE8_SPEC.md)の固有例外に従う。
- 次の3種類の表示概念を厳格に区別し、DOM要素・責務・適用対象を混同しない：
  1. **Q/A役割アイコン（`.conversation-role` / `.conversation-role-circle`）**：会話における質問・回答の役割を示す（図柄：Q＝`Chat Help 24 Filled`／A＝`Chat 24 Filled`、対象：Practice 1.2、2.1〜2.3、7.1〜7.3、8.1〜8.3の既存の会話・応答行）。
  2. **疑問文マーカー（`.p82-question-marker`）**：単独の疑問文・回答のない質問形式比較において、文そのものが疑問文であることを示す文属性マーカー（図柄：`Chat Help 24 Filled` を再利用し既存Q/Aと同じ左側配置基準・サイズ・色で独立要素として置くが、会話の質問役を意味せず Q/A 役割とも `QuestionIndicator` とも別の DOM 要素・`aria-hidden="true"` として扱う。対象：Practice 8.2 Drill 2 のキュー左側8行）。
  3. **`QuestionIndicator`（`.question-indicator` / `.stop-indicator-wrap`）**：録音対象文が疑問文であることを停止ボタン右側で示す別機能のインジケーターであり、Q/A役割表示や疑問文マーカーと混同しない（図柄：`Chat Help Filled` 16×16px・グレー色・4px間隔・停止ボタンとの一体配置。対象：Practice 1.2、2.1〜2.3、7.1〜7.3、8.1、8.3、Composition 1 の既存の疑問文録音行の停止ボタン右側。Practice 1.1 および Practice 8.2 では使用しない）。

### 7.2 Fluent Filledアイコン

- QはMicrosoft Fluent UI System Icons `Chat Help 24 Filled`、Aは`Chat 24 Filled`を使用する。ユーザー承認済み仕様である。
- アイコン色はLight `#71839A`／Dark `#D9DDE3`。`currentColor`を使い、追加ストローク、丸囲み、背景、バッジ、影を付けない。
- 役割のアクセシブル名は親コンテナに残し、内側のSVGは支援技術から重複して読まれないようにする。空の継続役割欄は必要な場合にレイアウト領域だけを保ち、SVGを生成しない。
- Q/A役割表示の対象はPractice 1.2、2.1〜2.3、7.1〜7.3、8.1〜8.3の既存の役割行。CompositionにQ/A役割表示を新設しない。
- 停止ボタン右の疑問文マーク（`QuestionIndicator`）は`Chat Help Filled`を16×16pxで表示し、既存のグレー色・4px間隔・停止ボタンとの一体配置を維持する（対象：Practice 1.2、2.1〜2.3、7.1〜7.3、8.1、8.3、Composition 1）。
- **Practice 8.2 Drill 2 の左側疑問文マーカー（2026-11-18確定）**：Practice 8.2 Drill 2（何を vs 何か・全8行）では、右側の `QuestionIndicator` を使用せず、キュー左側に `Chat Help 24 Filled` 図柄を再利用した独立要素（`.p82-question-marker`、`aria-hidden="true"`）を各行1個ずつ配置する。Q/A役割アイコンと同じサイズ・色・左側余白基準で整列させるが、会話役割（`Question`）は付与しない。

### 7.3 人物ラベル

- 人物指定がある行だけに角丸の人物ラベルを表示する。会話役割Q/Aとは別の要素として扱い、役割→人物→キューの順序を保つ。
- 人物ラベルは角丸の矩形とし、LightはX背景`#6d28d9`／白文字、Y背景`#7dd3fc`／白文字。DarkはX背景`#c4b5fd`／文字`#2e1065`、Y背景`#67e8f9`／文字`#083344`とする。色は話者識別用であり、Q/A役割アイコンの色とは別に管理する。
- 表示名X／Yと内部のA／B等の識別子を混同しない。表示名のTTS専用読みと回答照合は[PROJECT_SPEC.md](PROJECT_SPEC.md) §§4.5／6.5を参照する。人物を割り当てていない課題へ人物ラベルを追加しない。
- 発話中の話者強調は人物ラベルの背景色・文字色を変えず、外側に固定の白い2px輪郭を付ける。補助外周は濃色`#334155`の4pxから、白6px＋濃色8pxへ1.2秒周期で変化させ、元に戻る。動きを減らす設定では白6px＋濃色8pxの静的な輪郭とする。
- 強調対象はその時点で実際に発話している人物だけとし、Q/A役割アイコンや会話中に紹介される第三者を発話者として強調しない。
- 話者強調の発火条件・解除・画像内外の連動など、ページ固有の動作はPractice固有仕様と[UI_ROLLOUT_REVIEW.md](UI_ROLLOUT_REVIEW.md)を参照する。

## 8. Yes/Noボタン・アイコン

- Yes/No選択ボタンとExample音声ボタンでは、目なしSmile/Frownの承認済みSVGを使用する。20×20px、`viewBox="0 0 24 24"`、塗りなし、`currentColor`のstroke 2、round cap/joinとし、目を追加しない。
- UI表示に🙆／🙅の絵文字を使わない。Q/A Filled、停止横の疑問文マーク、FeedbackのFireアイコンとは別の資産として管理する。
- 未選択時のボタン背景・枠はLight `#E5E7EB`／`#d1d5db`、Dark `#374151`／`#4b5563`。未選択アイコンはYesがLight `#16a34a`／Dark `#4ade80`、NoがLight `#dc2626`／Dark `#f87171`。
- 選択中のYesはLight背景`#4ade80`・枠`#22c55e`・文字`#14532d`、Dark背景`#14532d`・枠`#15803d`・文字`#bbf7d0`。NoはLight背景`#fca5a5`・枠`#ef4444`・文字`#7f1d1d`、Dark背景`#7f1d1d`・枠`#b91c1c`・文字`#fecaca`。
- 選択中のoutlineはLight `2px solid #64748b`、Dark `2px solid #94a3b8`、outline-offset 1px。HoverはLight `brightness(0.96)`、Dark `brightness(1.1)`。
- 選択ボタンは`data-answer="yes|no"`、適切な`aria-label`、`aria-pressed`を設定する。Example音声ボタンにも肯定／否定モデルを示すアクセシブル名と`data-answer`を設定し、SVGは`aria-hidden="true"`とする。
- 目なしSmile/Frownを使う既存対象はPractice 1.2、7.1〜7.3、8.1〜8.3。別ページへ新設しない。

## 9. Feedback状態アイコン

本節はAccepted／MismatchのFeedback表示を実装するページに対する共通の視覚契約であり、判定生成・保存・復元はPROJECT_SPECおよびページ固有仕様を正本とする。

| 表示 | アイコン | サイズ | Light | Dark |
| --- | --- | ---: | --- | --- |
| Accepted | Microsoft Fluent `Checkmark 24 Filled` | 22×22px | `#16A34A` | `#4ADE80` |
| Mismatch | Microsoft Fluent `Fire 24 Regular` | 20×20px | `#B47732` | `#E4AD69` |
| 未回答・録音中 | 新しい判定アイコンなし | — | — | — |

- Acceptedのチェックは丸囲みなしとし、24×24のviewBoxを維持した元のFilled形状に同色の1.5pxストロークを追加して22×22pxで表示する。`Checkmark Circle`は使用しない。
- Mismatchの案内文は`Keep going!`とし、Fire Regularを添える。アイコン・文言に背景、枠、影を付けない。
- Mismatchのページ固有の並び順・長文時の配置は[PRACTICE2_SPEC.md](PRACTICE2_SPEC.md)を参照する。
- 判定更新時は古い表示を残さず、Accepted／Mismatchを重複表示しない。未回答・録音中に新しい判定アイコンを生成しない。

## 10. Copy my sentencesボタン

- 録音付きDrillのコピー操作領域は、左にMicrosoft Fluent `Clipboard 24 Regular` SVG（20×20px、`currentColor`）、右に`Copy my sentences`を並べる。絵文字📋は使用しない。
- ボタン下の補助説明はCopy範囲に合わせ、当該Drillのみをコピーする場合は`Copy your drill results to review or share.`、複数Drillの回答をまとめてコピーする場合は`Copy all your recorded answers to review or share.`とする。
- 操作領域は各録音付きDrillの最終問題カード直後・カード枠外、同じDrillセクション内に置く。次のDrillやExampleのコンテナへ含めない。
- ボタン、補助説明、成功／失敗ステータスを一つの操作領域とし、Drill内の右端に揃える。1つのDrillに1つだけ置き、再描画や設定変更で重複生成しない。
- 既存のボタン外観を維持し、正式サポート範囲（600px以上）でラベルの縦折れや横はみ出しを起こさない。375pxは参考診断に限る。
- コピー対象・有効条件・失敗時の機能動作はPROJECT_SPEC「Copy my sentences」を正本とする。録音対象のないDrillやExampleに追加しない。

## 11. ツールチップ・Vocab表示

- 語彙キューのHover tooltip（`tooltip-tip`）は20px、ボタン操作説明（`custom-tip-box`）は18pxとする。いずれも最終CSS pxであり、130%をさらに掛けない。VocabのHover表示と操作理由の説明は別機能として扱う。
- 説明枠は最大360pxかつ画面幅−24px以内とし、左右に最低12pxの余白を確保する。長い語も折り返す。上側に十分な空間がない場合は下側へ配置し、画面内に収める。
- 対象要素が画面内にある間は、リサイズ・スクロール・レイアウト変化に応じてTooltipを画面内に収まるよう追従配置する。一方、対象要素が画面外へ移動した後の追従継続・自動閉鎖は共通必須仕様としない。
- 配置補正は共通の`tooltip-layout.js`を優先使用し、ページごとに別の位置補正を作らない。
- ボタンの実行条件・無効化条件・説明文を出す対象はPROJECT_SPEC §5.4を正本とする。条件不足の理由説明はVocab設定と独立し、停止・Yes/No・Selectへ同じ説明を無条件に重複させない。
- Vocab Displayは、日本語と対応する読み／意味を語句単位で表示する。組の内部は自然に折り返す。Hover／OFFの動作とEnglish Cuesの既存配置を変えない。Vocab機能を持たないページへ新設しない。
- 練習2の画像内品物・Example本文の語彙Hoverは承認済みのページ固有仕様であり、キュー側だけという共通原則を理由に撤去しない。


### 11.1 説明型Tooltipの表示・Escape閉鎖・Touch操作（共通原則／先行適用）

**対象と表示トリガー**

- 説明型Tooltipは、語彙・キュー・ガイド等の説明を表示する `.tooltip-wrap` と、操作ボタンの説明を表示する `.custom-tip-wrap` 等を指す。状態を示すだけの表示は対象外とする。
- 説明型Tooltipは、Mouse Hover およびキーボード Tab Focus で表示する。キーボード操作による表示は、実際のTab／Shift+Tabによるフォーカス移動を対象とし、プログラムからの `.focus()` だけをTab操作の検証根拠にしない。
- `.custom-tip-wrap` の操作説明は、実Touchでは表示しない。PC・タブレット等でのMouse Hover／Tab Focus表示は維持する。
- `.tooltip-wrap` の語彙説明はTouchに対応する。有効なタップで開き、同じホストへの有効な再タップで閉じる。別の `.tooltip-wrap` をタップした場合は前の表示を閉じて新しい対象を開き、Tooltip外をタップした場合は開いている表示を閉じる。Mouse Hover／Keyboard Focusへの移動だけではTouch表示を閉じない。Escapeでも閉じる。

**Touchのタップ判定**

- `.tooltip-wrap` はTouch／Penのpointerdownからpointerupまでの移動量が10px以内の場合に有効なタップとして扱う。10pxを超える移動および `pointercancel` はスクロール等として扱い、Tooltipを開閉しない。
- Touchで開いたTooltipは `.tap-tip-open` で管理する。再タップによる閉鎖は同じホストに限定し、他ホストや無関係な操作へ波及させない。

**Escapeによる閉鎖**

- Escapeで閉じる説明型Tooltipは、Tab Focusで表示されたもの、およびTouchで開いた `.tap-tip-open` とする。
- Mouse Hoverだけで表示されているTooltipはEscapeで閉じない。ポインターが乗っていても、Mouse Hoverを理由に閉鎖対象へ選ばない。
- Escape 1回につき最優先対象を1つだけ閉じる。Voice Dropdown、Drawer、Picker Panel、開いている `<dialog>`、フォーカス中の `<select>` 等、Tooltipより優先されるUIがある場合は、そちらの操作を優先する。
- 状態表示型Tooltip（少なくとも `.p82-autostop-open`、`.p82-autoplay-stop`、`.p82-autostop-tip-host`、`[data-tip-status-only]`）は対象外とし、状態や操作に干渉しない。
- Escapeで閉じたTab Focus対象は、フォーカスが別要素へ移るまで再表示を抑止する。Touch対象は閉じたホストに対する次の新しい有効なタップで抑止を解除し、そのタップで再表示できる。Mouse Hover対象にはEscapeによる閉鎖・再表示抑止を適用しない。

**適用範囲・実装管理**

- 共通規則を定めることは、全ページへの実装適用を意味しない。各ページへの適用は、既存構造・操作・フォーカス管理を確認した範囲に限る。
- 状態表示型Tooltip、Portal型Hint、Selection Helpは、個別に適用を確認する。これらを説明型Tooltipと同一視して一律に閉鎖制御しない。
- 本節は共通のユーザー向け動作と適用原則を定める。実装コードや自動テストの作業経緯は仕様書へ転記しない。

## 12. 録音結果・状態メッセージの文字サイズ

録音結果・状態表示は、情報の役割に応じて次の3区分とする。

| 区分 | 対象 | 最終表示サイズ |
| --- | --- | ---: |
| 抽出テキスト | STTで得られた学習者の発話テキスト | **20.8px**（16px × 130%） |
| 状態・結果・エラー表示 | 録音・音声認識・再生の状態／結果、タイムアウト、録音エラー、認識エラー等。Pitch Labの`.pitch-status`を含む | **18.2px**（14px × 130%） |
| 未録音結果 | `… Not yet` | **15.6px**（20.8px × 75%） |

- `No transcription available.`、`Preparing microphone...`、`Recording...`、タイムアウト、録音エラー、認識エラー等の結果欄メッセージは18.2pxとする。抽出テキストと同じサイズにしない。
- Pitch Labの`.pitch-status`に表示する録音・再生状態も18.2pxとする。`Ready`や`Not recorded yet`は操作状態であり、未録音結果の`… Not yet`とは区別する。
- `Keep going!`等の回答フィードバック文言も18.2pxとする。表示順序・色・アイコン・配置は該当するページ固有仕様を維持する。
- `… Not yet`は`var(--text-secondary)`とし、文言全体を一塊として扱い、内部で改行しない。結果欄が右寄せの行では右端に揃え、幅が足りない場合は文言全体を次行へ送る。
- 音声再生中の表示仕様は §13.3（`Playing...` を表示しない）へ一本化する。本節の18.2px対象は結果欄の状態・結果・エラー表示に限定する。
- 録音・再生ボタン本体、ツールチップ、操作説明、Pitch Labのタイトル・説明文・音量補助文も本規則の対象外とする。
- 本節は共通表示仕様であり、すべての既存ページの実装がこのサイズに一致していることを意味しない。各ページの適合状況は、対象となる実装範囲に応じて別途確認する。

## 13. 共通UIアイコン（Fluent SVG）・光学サイズ調整・音声再生UI・無効化カーソル規定（2026-11-19更新）

### 13.1 共通UI 4領域および音声操作の Microsoft Fluent UI System Icons 仕様

たたき台ページ（Practice 8.2）をリファレンス実装とし、共通UIの4領域（①もどるボタン、②Drill説明文の電球、③左下Voiceラベル、④グローバル設定の全ボタン）および音声操作ボタンでは、旧絵文字を廃止して公式 Microsoft Fluent UI System Icons（`@fluentui/svg-icons`、`fluent-icons.js`）のSVGを使用する（`currentColor`連動、`aria-hidden="true"`）。

| 領域・項目 | 公式 Fluent Icon 名 | `fluent-icons.js` キー（variant） | viewBox | 実描画高さ（in vb） | 表示サイズ / 光学補正（Practice 8.2基準） |
| --- | --- | --- | :---: | :---: | --- |
| ① もどるボタン（`.back-link`） | `Arrow Hook Down Left 24 Regular` | `arrowHookDownLeft` (`regular`) | `0 0 24 24` | 16.77 | `20×20px`、`translateY(-0.5px)`（Optical Height ≈ 14.0px） |
| ② Drill説明文先頭（`.info-panel-desc`、Practice 8.2の5箇所） | `Lightbulb 24 Filled` | `lightbulbFilled` (`filled`) | `0 0 24 24` | 20.00 | `20×20px`、`vertical-align: -3.5px`（Optical Height ≈ 16.7px） |
| ③ 左下Voiceラベル（`.voice-select-label`） | `Speaker 2 24 Regular` | `speaker` / `speaker2` (`regular`) | `0 0 24 24` | 17.99 | `20×20px`（モデル音声ボタンと同一パスを共有、Optical Height ≈ 15.0px） |
| ④ Script Mode — Hiragana Only | `Translate 24 Regular` | `translate` (`regular`) | `0 0 24 24` | 14.73 | `20×20px`、`translateY(-0.5px)`（Optical Height ≈ 12.3px） |
| ④ Script Mode — With漢字 | `Local Language 24 Regular` | `localLanguageGlobe` (`regular`) | `0 0 20 20` | 約15 | `24×24px`（予備 `localLanguageZi` は保持） |
| ④ Speech Style — Formal | `Building 24 Filled` | `buildingFilled` (`filled`) | `0 0 24 24` | — | `24×24px`（枠内最大） |
| ④ Speech Style — Informal | `Edit Line Horizontal 3 24 Filled` | `editLineHorizontal3Filled` (`filled`) | `0 0 24 24` | 20.00 | `16×16px`（Optical Height ≈ 13.3px） |
| ④ Speech Style — Casual | `Home 24 Filled` | `homeFilled` (`filled`) | `0 0 24 24` | — | `24×24px`（枠内最大） |
| ④ Vocabulary Display — Hover | `Chat Hint Half 24 Filled` | `chatHintHalfFilled` (`filled`) | `0 0 24 24` | 約20 | `24×24px` |
| ④ Vocabulary Display — Display | `Edit Line Horizontal 3 24 Filled` | `editLineHorizontal3Filled` (`filled`) | `0 0 24 24` | 20.00 | `24×24px` |
| ④ Autostop | `Mic 24 Filled` | `micFilled` (`filled`) | `0 0 24 24` | 20.00 | `24×24px`、アンバーゴールド（`#fbbf24`） |
| ④ Auto-Compare（旧Autoplay） | `Play Circle 24 Regular` | `playCircle` (`regular`) | `0 0 24 24` | — | `24×24px`、アンバーゴールド（`#fbbf24`） |

- Vocabulary Display の `OFF` はアイコンを置かずテキストのみとする。
- **枠内最大サイズ（2026-11-18）**：グローバル設定の全アイコン（Script Mode / Speech Style / Vocabulary Display / Autostop / Auto-Compare）は、セグメントボタンの高さ（`min-height`）および上下paddingを変えず、内容領域に収まる最大の `24×24px` に統一する。ラベル文字・隣接要素と重ねない。
- **アンバーゴールド（`#fbbf24`）の統一適用**：説明文の電球5箇所、Autostop、Auto-Compareにはセグメントボタンの選択色と完全に同一の `#fbbf24` をLight/Dark問わず固定適用する。セグメントボタン（Script Mode / Speech Style / Vocabulary Display）は選択中（`aria-pressed="true"`／`.is-selected`）のアイコンのみ `#fbbf24`（青背景・白文字は維持）。非選択時の色・背景は変更しない。
- **Global Settingsのホバー説明（全採用ページ共通／2026-11-19）**：
  - 対象はGlobal Settingsパネル内の設定項目およびVoiceヘルプの説明領域とする。Practice 8.2の11領域は初期リファレンスであり、同じ設定項目を採用する既存・新規ページにも適用する。既存ページは改修機会に順次移行し、新規ページは制作時から適用する。設定項目のないページへ項目を追加する義務はない。
  - 説明テキスト領域は左詰め（`text-align: left`）とする。対象はGlobal Settings内の説明に限り、設問内の語彙Hoverやその他の一般ツールチップへ自動拡張しない。
  - 機能の動作を動詞で説明する英文は、設定項目を主語とする三人称単数形を用いる（`Displays...`, `Hides...`, `Shows...`, `Uses...`, `Stops...`, `Auto-plays...` 等）。名詞句や利用者への案内文には機械的に適用しない。
  - `Autostop` および `Auto-Compare` のON/OFF説明は、同じホバー内で `OFF:` の直前に改行を入れる。
  - 同一機能を採用するページは次の標準英文を使用する。Voice Helpは対象言語に合わせて `Japanese`／`German` 等を置き換えられる。

| 設定 | 標準ツールチップ文言 |
| --- | --- |
| Script Mode — Hiragana Only | `Displays sentences in Hiragana only.` |
| Script Mode — With漢字 | `Displays sentences with Kanji and Kana.` |
| Speech Style — Formal | `Polite speech for work or unfamiliar people.` |
| Speech Style — Informal | `Plain forms used in writing.` |
| Speech Style — Casual | `Relaxed speech with family and friends.` |
| Vocabulary Display — OFF | `Hides vocabulary hints.` |
| Vocabulary Display — Hover | `Shows vocabulary hints on hover.` |
| Vocabulary Display — Display | `Always shows vocabulary hints.` |
| Autostop | `ON: Stops automatically after 2s of silence.` / `OFF: Uses the stop button.`（`OFF:`の前で改行） |
| Auto-Compare | `ON: Auto-plays the model audio and your recording in sequence after recording.` / `OFF: Uses the Play buttons separately.`（`OFF:`の前で改行） |
| Japanese Voice Help | `If no voices appear, you can add a Japanese voice in your device's Text-to-Speech settings.` |

  - German Voice Help等の言語固有案内は説明内容を対象言語に合わせて変更できるが、左詰めと適切な折り返しを維持する。アイコン形状・色を説明文に書く必要はなく、実装アイコンと矛盾する説明を追加しない。
- Speech Style の3項目はすべてFilled（Formal＝Building、Informal＝Edit Line Horizontal 3、Casual＝Home）。旧 `personAccounts`・`chatMultiple` 定義は未使用のため削除済み。
- **光学サイズ統一の原則（Optical Size Alignment）**：SVG の外枠 `width`/`height` を単に一律の数値に揃えるのではなく、`viewBox` 内の余白を除いた絵部分の実描画バウンディングボックス高さ（`y_max - y_min`）と垂直中心（`(y_min + y_max) / 2`）を算出し、同じUI領域（特にグローバル設定ボタン群）内で**絵そのものの視覚的な高さ（Optical Height）と垂直中央位置が揃うよう**アイコン別の表示サイズおよびYオフセットを設定する。

### 13.2 無効化（`disabled`）ボタンにおける禁止カーソル（`cursor: not-allowed`）の廃止

- ボタンが無効化・ロック状態（`button:disabled`、録音中の他ボタンロック、Yes/No未選択時の再生・録音ロック、未録音時の `Copy my sentences` 無効化等）にある場合、**グレーアウト（`disabled` による減光・不透明度低下）のみで無効状態を示し、禁止カーソル（`cursor: not-allowed`）は付与しない**（`cursor: default` とする）。

### 13.3 音声再生ボタンの再生中表示・ホバー・排他状態

- `Auto-Compare`設定アイコンと録音再生ボタンは、Microsoft Fluent `Play Circle 24 Regular`（`playCircle`、`regular`）を使用する。モデル音声の通常再生ボタンは既存のスピーカーアイコンを維持する。既存ボタンの寸法・クリック領域・配置は維持し、アイコン変更だけを理由に拡大縮小しない。
- モデル音声または録音音声の再生中は、該当ボタンを `Stop 24 Regular`（`stop`、`regular`）へ切り替え、通常のアイコン文字色（`currentColor`）で表示する。Filled variantや赤色（`#d93025` 等）・警告色による強調は、共通ルール・ページ固有ルール（Practice 8.2の `.drill-listen-btn.is-playing` / `.play-recording-btn.is-playing` 等）のいずれにおいても使用しない。再生中に `Playing...` という文字表示は使用しない。
- 本規則は**再生中の停止操作**だけに適用する。Manual録音中の停止ボタン（`.drill-record-btn.stop-btn-active` での `#d93025` 赤色強調）、およびAutostop録音中の波形・録音状態表示は別機能として扱い、現行の明確な停止表示を弱めない。
- 停止操作を警告・主要アクションのように過度に強調せず、教材や学習者の発話へ注意を向ける。ボタン寸法とクリック領域は維持する。
- 通常時のモデル音声／録音音声ボタンの操作ガイドは、Exampleまたは最初の設問行だけに表示し、同じリストの2行目以降には表示しない。これは音声ボタンの通常ガイドに限る。
- Auto-Compare ONでモデル音声→録音音声のリレー再生中は、通常の1行目限定ルールの例外とし、リレーに参加する停止操作部にAuto-CompareがONであることを知らせる説明を表示する。説明の表示位置は操作対象の行に合わせる。
- 他の音源が再生中のため操作できない音声ボタンは、§13.2に従いグレーアウト・disabledで示し、禁止カーソルは使わない。
- 再生ボタンと停止アイコンの外観規則はGlobal Settingsの有無や言語にかかわらず、同じ音声操作UIを採用するページに適用する。

### 13.4 状態通知アイコンと共通状態色トークン（`--warning-color`）

- 共通 `:root` トークンとして `--warning-color` を正式定義する（Light `#d97706` / Dark `#fbbf24`）。未定義変数（`--bg-card`・`--muted-text` 等）は使用せず、パネル背景には `--bg-panel`、補助文言（Info等）には `--text-secondary` を使用する。
- 通知の3段階アイコンは Microsoft Fluent UI System Icons（`fluent-icons.js`）を使用する：**Info**＝`Info 24 Regular`（`info`, `regular`、`var(--text-secondary)`、`role="status"` / `aria-live="polite"`）、**Warning**＝`Warning 24 Filled`（`warningFilled`, `filled`、`var(--warning-color)`、`role="status"` / `aria-live="polite"`）、**Error**＝`Error Circle 24 Filled`（`errorCircleFilled`, `filled`、`role="alert"` / `aria-live="assertive"`）。

## 14. ページ固有仕様への参照

- Practice 2.1： [PRACTICE2_SPEC.md](PRACTICE2_SPEC.md)
- Practice 2.2／2.3： [PRACTICE22_23_SPEC.md](PRACTICE22_23_SPEC.md)。Practice 2.1〜2.3共通のMismatch配置は[PRACTICE2_SPEC.md](PRACTICE2_SPEC.md)も参照。
- Practice 7.1〜7.3： [PRACTICE7_SPEC.md](PRACTICE7_SPEC.md)
- Practice 8.1／8.3： [PRACTICE8_SPEC.md](PRACTICE8_SPEC.md)
- Practice 8.2： [PRACTICE82_SPEC.md](PRACTICE82_SPEC.md)
- Deutsche Übung： [GERMAN_DRILL_SPEC.md](GERMAN_DRILL_SPEC.md)
- STT表示変換： [STT_DISPLAY_RULES.md](STT_DISPLAY_RULES.md)
- 展開・実装・検証の履歴： [UI_ROLLOUT_REVIEW.md](UI_ROLLOUT_REVIEW.md)

