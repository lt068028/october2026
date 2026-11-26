# Practice 8.2 — 何か・何も・何でも（PRACTICE82_SPEC）

> **文書状態：確定（最終UL済み：2026-11-16）**
>
> - GitHub掲載状態：掲載済み（main）
> - 文書全体の最終承認：ユーザー承認済み（2026-11-16）。
> - 個別に承認済みの規定は、改定対象として明示されない限り有効とする。

Practice 8.2の英語概念ラベルの外観は [PRACTICE8_SPEC.md](PRACTICE8_SPEC.md) §1を正本とする。本書では日本語列と英語ラベル列の整列、設問構成・回答許容・ページ固有の状態を定める。


Practice 8.2の確定構成はExample 4件・Drill 4件とする。旧版の3 Example・3 Drill構成へ戻さない。追加・変更は、明示されたユーザーの指示・承認に基づいて行う。

## 構成とモデル（固有制約・具体データは `practice8.2.js` を正本とする）

各Drillセクションの先頭に対応するExample群を置く。共通仕様は `PROJECT_SPEC.md` および `UI_LAYOUT_SPEC.md` を参照し、ここでは Practice 8.2 固有の教育上の制約のみを定める。

- **Example 1／Drill 1 — 何かの平叙文**：Example 1 は `Unspecified`／`None`／`All-inclusive`（`— I drink something.` 等、丸括弧なし・em dash 開始）を対比。Drill 1（`Drill 1: 何か — Affirmative Sentences`）は平叙文 4 問とし、疑問文マーカー・Q/A 役割・`QuestionIndicator` を表示せず、動詞前の自然な複数語順を許容する。
- **Example 2／Drill 2 — 何を vs 何か**：Drill 2（4 問×2 行）は回答なしの質問比較のため Q/A 役割と `QuestionIndicator` を出さず、キュー左側に `.p82-question-marker`（`aria-hidden="true"`）を表示する。設問にない主語補完を許容し、誤った疑問詞・動詞は許容しない。
- **Example 3／Drill 3 — 何か／何も Yes/No**：質問・回答を別々に録音し、Y/N 選択まで回答側の再生・録音をロックする（選択操作だけではモデル再生しない）。Drill 3 最初の回答行の Y/N ボタンは Tooltip・アクセシブル名とも `Yes`／`No`、選択前案内は `Choose Yes/No first.`、Ex3 モデル音声 Tooltip は `Listen to the affirmative model.`／`Listen to the negative model.` とする。回答判定は `PROJECT_SPEC.md` §6.4.2 に従い、全要素・モデル・省略回答と代替表現を分離し、応答語のみ（句読点・フィラー付きを含む）や述部（動詞）欠落は `incomplete`、極性矛盾は `mismatch`、連続する隣接重複（C4）は正規化畳み込みで許容する。
- **Example 4／Drill 4 — 何でも（先取り）**：Drill 4（`Drill 4: [Sneak Peek] 何でも — Unlimited Choice`、課番号付き Sneak Peek や Advanced は不使用）は「何でも＋動詞」と自然な「何でも」短答を許容し、「何でもを＋動詞」「何でもいいです」・動詞だけの返答・たい形・可能形は許容しない。

## 固有表示・表記と Beyond L8 Words

- 共通の表示・音声・採点・状態保持・English Cues 規則は `PROJECT_SPEC.md`（§3.2・§3.4・§5.2・§7.1）に従う。Practice 8.2 固有として、キューは未習漢字を平仮名で示し、Example 右側の完成モデル文には重複する語彙訳 Tooltip や余分な文法補足を加えない。
- Beyond L8 Words（`何でも`、Kanji 欄は With漢字のみ表示）および Example 2「何か(を)」の任意助詞「(を)」ホバー説明（`The particle を is optional and usually omitted after 何か.`）を維持する。具体データは `practice8.2.js` を正本とする。

## 不定表現の部分強調（Practice 8.2固有）

Example 1〜4とDrillの日本語モデル表示では、「何」（かな表示では「なに／なん」）を通常色とし、何かの「か」は共通文法強調色・太字700、何もの「も」は既存の否定色・太字、何でもの「でも」は既存の肯定色・太字、何をの「を」は通常色・太字とする。両表記・ライト／ダークに対応し、キュー・語彙ホバー定義・内部モデル／音声・判定は変更しない。

下線の追加はEx1の比較ラベルの色付き接尾部分だけ。モデル文には追加しない。何もと対になる否定語尾の既存の赤は維持する。Ex2の任意助詞「(を)」は通常色・太字とし、括弧・個別ホバー説明・操作可能性を示す既存の点線装飾を維持する。

Ex1の何でもは「Anything / Whatever」、Beyond Wordsは「anything / whatever」とし、制限のない選択を示す。BeyondのL13表示およびD4の確定タイトル・説明は維持する。本規則を他Practiceへ自動適用しない。

## 日本語列・英語ラベル列の整列

- 日本語列（.p82-concept-japanese）と英語ラベル列（.p82-concept-english）は別々に配置し、日本語列の左端と英語ラベル列の右端をそれぞれそろえる。
- 日本語列と親要素（.p82-concept-label）には囲み・背景・枠線・余白を付けず、文字として表示する。英語ラベルの外観はPRACTICE8_SPEC.md §1に従う。
- 各比較の2行目（Example 1の「〜ません」と「None」、Example 2の「何か」と「Unspecified」）をアンカーとし、日本語右端から英語ラベル外枠左端まで6pxを基準とする。各列の端をそろえた結果、他の行の日英間隔が広くなることは許容する。
- 日本語ラベル・接尾辞の意味色、音声、判定は変更しない。キーボード操作時のフォーカス枠（:focus-visible）を維持する。

## Example 1／2の内容幅に応じた配置

概念ラベル・キュー・矢印・再生ボタンは、実際のカード内容幅に収まる間は同じ行を維持する。比較ラベルの日本語列（`.p82-concept-japanese`）は文字表示として左端をそろえ、英語ラベル列（`.p82-concept-english`）はB「標準」バッジ装飾（ライト／ダーク対応、角丸8px、余白6px 10px）を適用して右端整列として別々に制御する。各比較の2行目（Ex1の「〜ません」と「None」、Ex2の「何か」と「Unspecified」）を日本語右端から英語ラベル外枠左端までの6px基準（アンカー）とする。日本語の左端と英語の右端をそろえた結果、他の行の日英間隔が広くなることは許容する。幅不足時は英語を先に省略し、全文をホバー・キーボードフォーカス・タップで参照できるようにする。日本語モデルを読める幅へ配置できなければモデルだけ次行へ送り、必須のラベル・操作列も収まらない場合に限りラベルを独立させる。画面幅だけのしきい値で強制分割しない。

録音中のリサイズでもExample表示だけは再計算し、Drillの録音状態・識別キー・表示処理を変更しない。この配置条件はPractice 8.2のExample 1／2だけに適用し、Practice 8.1／8.3へ自動拡張しない。

## 判定結果アイコンのページ固有調整

Incompleteの共通視覚契約（Footprints SVG、サイズ・色・位置、Tooltip、末尾「…」の表示条件、保存値との分離）はUI_LAYOUT_SPEC.md §9を正本とする。Practice 8.2固有の判定条件は本書の各Drill規定とpractice8.2.jsの登録データを参照し、共通の表示契約から判定ロジックを推定しない。

Practice 8.2では、Accepted／Mismatchのアイコン寸法に限り、共通標準（Accepted 22px／Mismatch 20px）に対するページ固有の視覚調整を維持する。

- **Accepted**：Microsoft Fluent Checkmark 24 Filled（Light: #16A34A / Dark: #4ADE80、24px × 24px、transform: translateY(-2px)）。
- **Mismatch**：Microsoft Fluent Fire 24 Regular（Light: #B47732 / Dark: #E4AD69、24px × 24px、transform: translateY(-2px)）。
- Mismatch時のKeep going!ラベル（.feedback-retry-label）には、日本語テキストとのベースライン視覚整列のためtransform: translateY(-1px)を適用する。
- Accepted／Mismatchのアイコンと直後の認識テキストまたは差分テキストとの間隔（icon-gap）は **2px**。Mismatchの差分テキストとKeep going!ラベルとの間隔（keep-gap）は **8px**。
- Incompleteの認識テキストは、Practice 8.2のScript Modeに応じたSTTDisplay.format()の表示変換後の文字列を使用する。表示変換および共通の末尾「…」付加は表示層に限定し、保存用raw STT、Copy出力、判定処理（r.refs照合）を変更しない。

**現行コードとの差（文書改訂時点）**：最新mainのpractice8.2.jsは、末尾「…」・ピリオド・句点・感嘆符・疑問符等をまとめて重複抑止の対象にしている。共通仕様で定める抑止条件（既存の「…」または「...」のみ）より広いため、後続の実装修正で共通契約に合わせる。今回の仕様書改訂ではアプリコードを変更しない。

## 録音停止条件および Copy my sentences 出力仕様（2026-11-18）

- **録音停止条件・Copy 基本動作**：`PROJECT_SPEC.md` §5.2（Autostop ON/Manual 停止条件）および §7.2（Copy 中の再生維持）を正本とする。
- **Practice 8.2 固有の Copy 出力仕様**：保存された `entry.status` を優先参照し、`accepted` は `✅`、`incomplete` は `👣`、`mismatch` は `🔥` を文頭に付与する（未設定時のみ `FeedbackStatus.clipboardMarker(entry)`）。Incomplete 判定の画面表示用末尾 `…` はコピー出力には混入させない。

## 採点正規化・Mismatch 理由と差分ハイライト仕様（2026-11-18）

- **Speech Style（Casual / Informal / Formal）と終助詞「よ」仕様（2026-11-19）**：
  - **Formal**：丁寧形を維持（平叙文は「〜ます。」、疑問文は「〜ますか。」等）。
  - **Informal**：普通形を維持し、平叙文に終助詞「よ」を付与しない（「〜する。」、「〜しない。」等）。疑問文は「？」で終わる。
  - **Casual**：
    - **平叙文および指定された肯定・否定の返答文**（Example 1、Example 3返答、Example 4回答、Drill 1、Drill 3返答、Drill 4回答等）：モデル表示文およびモデル音声（TTS）の語尾「。」の直前に終助詞「よ」を1回付与する（例：`授業で、何か、話すよ。` / `ううん、何も、しないよ。` / `何でも、作るよ。`）。既存の文型・返答形式を変更せず、未定義の文型や短い応答等へ一律一般化しない。
    - **疑問文**（Example 2、Example 4質問、Drill 2、Drill 3質問、Drill 4質問等）：語尾は「？」を維持し、「よ」は付与しない（例：`何を、読む？` / `何か、読む？` / `誕生日に、何か、する？` / `どんな料理を、作る？`）。
- **文末終助詞の許容範囲**：
  - 文末の終助詞は `よね / よ / ね` のみを許容対象として正規化し、疑問の `か` は許容対象から除外する（平叙文モデルに「か」が付加された場合は Mismatch とする）。Formal 疑問文で「か」を要求し、Informal / Casual 疑問文で「か」を新たに許容する変更は行わない。
- **Mismatch 判定理由の分離と差分ハイライト（`--error-text`）**：
  - 判定理由を `text`（文字列距離不一致）、`form`（Formal 文体での疑問符・終助詞制約違反）、`pending`（回答選択未完了）に分離する。
  - `text`：最小距離の許容候補（`r.refs`）との差分を `STTDisplay.projectDiff()` で表示文字列へ投影し、誤り文字および欠落記号（`＿`）を `--error-text` で示す。
  - `form`：原因となる疑問符（`?` / `？`）が表示文字列に存在する場合はその疑問符のみを `--error-text` で示し、存在しない場合は無関係な一致文字を赤字にせず独立した形式不一致表示を行う。
  - `pending` および旧データ等で差分が空の場合：無関係な一致文字や全文を赤字にしない。

## 共通UI・音声操作に関する仕様参照（2026-11-19更新）

Global Settings、Auto-Compare／Autostop、共通アイコン、音声再生・停止アイコン、再生中表示、ホバーガイド、disabled表示および Tooltip 配置・操作（`tooltip-layout.js` の共通 `ResizeObserver` による再配置追従を含む）の共通仕様は `UI_LAYOUT_SPEC.md`（§11・§13.1〜§13.3）を正本とする。Practice 8.2 固有として、`DrillTooltips.enableEscapeDismiss()` を維持する。

