# Practice 8.2 — 何か・何も・何でも（PRACTICE82_SPEC）

> **文書状態：確定（最終UL済み：2026-11-16）**
>
> - GitHub掲載状態：掲載済み（main）
> - 文書全体の最終承認：ユーザー承認済み（2026-11-16）。
> - 個別に承認済みの規定は、改定対象として明示されない限り有効とする。

Practice 8.2の英語概念ラベルの外観は [PRACTICE8_SPEC.md](PRACTICE8_SPEC.md) §1を正本とする。本書では日本語列と英語ラベル列の整列、設問構成・回答許容・ページ固有の状態を定める。


Practice 8.2の確定構成はExample 4件・Drill 4件とする。旧版の3 Example・3 Drill構成へ戻さない。追加・変更は、明示されたユーザーの指示・承認に基づいて行う。

## 構成とモデル

各Drillセクションの先頭に対応するExample群を置く。共通の練習8レイアウト、表示設定、共通Q/A役割表示、独立したモデル音声、録音・採点結果保持を使う。

### Example 1／Drill 1 — 何かの平叙文

Example 1は飲むを使い、何か（something）・何も＋否定（nothing）・何でも（unlimited choice）の意味を対比する3行。

Example 1の左側の英語ラベルは `Unspecified`／`None`／`All-inclusive` とする。各モデル文の右側には英訳を表示する：`— I drink something.`／`— I drink nothing.`／`— I drink anything.`。Example 2と同じく、丸括弧なし、先頭にem dash（`—`）と半角スペースを置き、Lato・既存の薄い文字色（`--text-secondary`、`.vocab-inline`）を用いる。

Drill 1はタイトルを `Drill 1: 何か — Affirmative Sentences`、説明文を `Place 何か naturally before the verb.` とし、時制選択を課題にせず平叙文4問を出す。平叙文であるため疑問文マーカーやQ/A役割、`QuestionIndicator` は表示しない。各設問では動詞の前に「何か」を置く自然な複数語順（例：`授業で、何か、話します。` および `何か、授業で、話します。`）を許容回答候補（`r.refs`）として明示的に登録し、不自然な後置語順や旧疑問文は許容しない。

| キュー | モデル |
| --- | --- |
| 授業／話す | 授業で、何か、話します。 |
| 学校／習う | 学校で、何か、習います。 |
| 大学／教える | 大学で、何か、教えます。 |
| 先生／聞く | 先生に、何か、聞きます。 |

### Example 2／Drill 2 — 何を vs 何か

Example 2は「何を · Specific」と「何か · Unspecified」の質問を、見るで対比する。

Drill 2は4問それぞれを「何を」と「何か」の2行（計8行）で練習する。キューの漢字は既習範囲に合わせる。Drill 2（8行）は回答のない質問形式比較であるためQ/A役割は付与せず、右側の `QuestionIndicator` も表示しない。代わりにキュー左側に `Chat Help 24 Filled` 図柄の疑問文マーカー（`.p82-question-marker`、`aria-hidden="true"`）を各行1個ずつ表示する（Drill 3・4は既存のQ/A役割表示を維持）。

| 問 | 動詞 | 何をモデル | 何かモデル |
| --- | --- | --- | --- |
| 1 | 読む | 何を、読みますか。 | 何か、読みますか。 |
| 2 | 書く | 何を、書きますか。 | 何か、書きますか。 |
| 3 | 撮る | 何を、撮りますか。 | 何か、撮りますか。 |
| 4 | 洗う | 何を、洗いますか。 | 何か、洗いますか。 |

判定は適切な助詞・キューに沿う回答を許容する。設問に指定のない「あなたは」等の主語補完も許容する。誤った疑問詞や動詞は許容しない。

### Example 3／Drill 3 — 何か／何も Yes/No

Example 3は「お土産に、何か、買いますか。」の質問と、肯定・否定の回答を常時表示する。回答は「はい、買います。」「いいえ、何も、買いません。」。キューはおみやげ／かう。Drill 3は質問と回答を別々に録音し、🙆／🙅の選択が済むまで回答側の再生・録音をロックする。選択操作だけではモデルを再生しない。

- Drill 3の最初の回答行のY/Nボタンは、Tooltipとアクセシブル名を`Yes`／`No`とする。選択前のスピーカーとマイクの案内は`Choose Yes/No first.`。Example 3の肯定モデル音声Tooltipは`Listen to the affirmative model.`とする。

| 問 | 質問キュー・動詞 | 質問モデル |
| --- | --- | --- |
| 1 | 誕生日／する | 誕生日に、何か、しますか。 |
| 2 | パーティー／持っていく | パーティーに、何か、持っていきますか。 |
| 3 | おやつ／食べる | おやつで、何か、食べますか。 |
| 4 | 友達／借りる | 友達に、何か、借りますか。 |
| 5 | スマホ／つける | スマホに、何か、つけますか。 |

回答は選択した極性と一致すること、否定側は何も＋否定形を含むことが必要。肯定／否定の録音と結果は独立して保持する。パーティーへ、スマホへ、誕生日の助詞省略、友達から等、登録済みの自然な助詞差は許容する。

### Example 4／Drill 4 — 何でも（先取り）

Example 4は「どんな靴を、はきますか。」／「何でも、はきます。」。Drill 4は次の3つの習慣・種類の質問と回答を扱う。

| キュー | 質問モデル | 回答モデル |
| --- | --- | --- |
| どんな／料理／作る | どんな料理を、作りますか。 | 何でも、作ります。 |
| どんな／歌／歌う | どんな歌を、歌いますか。 | 何でも、歌います。 |
| どんな／帽子／かぶる | どんな帽子を、かぶりますか。 | 何でも、かぶります。 |

Drill 4のタイトルは `Drill 4: [Sneak Peek] 何でも — Unlimited Choice`。案内は、何でもが制限のない選択を表すことと、どんなで質問して何でもで答えることを簡潔に示す。課番号付きSneak Peekや難易度を示すAdvancedは使わない。何でも＋動詞をモデルにし、会話として自然な「何でも」の短答も許容する。「何でもを＋動詞」「何でもいいです」、動詞だけの返答は許容しない。たい形・可能形は導入しない。

## 共通表示・読み・音声・採点

- 初期表示はWith漢字／Formal／Hover。Hiragana Only、Informal、Casual、Display、OFF、声選択、Autostop／Manual録音、Auto-Compare／Manualを維持する。Practice 8.2のキューは未習漢字を平仮名で示し、モデル文はWith漢字表示を保つ。
- Hiragana Onlyでもデパート、バーベキュー、パーティー、スマホ等のカタカナ表記を保つ。モデル文・案内の読みと、動詞活用形の読みを登録する。
- モデル表示文とTTS読み上げ文は、文節の区切りに対応する読点を同じ位置に置く。STTの句読点は共通正規化で採点し、STT原文表示や保存原文を書き換えない。
- 助詞の自然な差、読み・漢字の登録済み異表記、許容される短答・主語補完だけを採点候補に加える。誤った疑問詞、動詞、否定極性、課題の対象を正答扱いしない。
- 行とY/N選択ごとに録音URL、STT原文、録音時モデル／許容文、採点結果を保持する。設定変更や選択切替で別キーの録音を消さず、過去の採点を再計算しない。
- 録音開始時に既存のモデル再生・録音再生・リレーを停止する。マイク準備中と録音中は他操作をロックする。モデル再生終了から録音再生への意図的な待機は0秒。
- Text/Hideボタン、サイズ切替、追加画像は設けない。English CuesはD1〜D4の問題キューに適用し、切替等の共通動作は [PROJECT_SPEC.md](PROJECT_SPEC.md) §7.1に従う。
- Example右側の完成モデル文には、重複する語彙訳Tooltipや`(with a negative ending)`等の余分な文法補足を加えない。Example 2の任意助詞「(を)」Tooltipは維持する（詳細は「表記とBeyond L8 Words」を参照）。

## 表記とBeyond L8 Words（2026-11-04）

共通原則はPROJECT_SPEC.md §§3.2・3.4に従う。Ex・DrillのキューはL8漢字範囲。Ex3のキューは「おみやげ／かう」、右側の例文では「お土産」「買います」を使う。Ex4のキューは「どんな／くつ／はく」、右側の例文では「靴」を使用する。音声生成用内部文およびSTT原文は別用途として扱う。

8.3と同じ位置・共通スタイルのBeyond L8 Wordsを設置する。Wordsは何でも（L13）の1語。お土産はL5の既習語のためWordsには掲載せず、Kanjiの「産：お土産（おみやげ）」は維持する。Kanjiは産／靴（Genki外）・買（L10）の3項目。漢字欄はWith漢字だけ表示し、件数も連動する。「何か(を)」の「を」は個別ホバー説明 “The particle を is optional and usually omitted after 何か.” を持ち、点線下線でホバー可能と示す。開閉状態は現在のブラウザーセッション中に保持する。L8はPractice 8に対応する値であり、他課の名称はBeyond L{対象課番号} Wordsとする。

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

## 採点結果アイコンとIncomplete視覚仕様（Practice 8.2固有）

Practice 8.2の3段階判定表示（Accepted / Incomplete / Mismatch）では、共通仕様（UI_LAYOUT_SPEC §9の22px/20px基準）を一部最適化したページ固有の視覚パラメータを適用する。

- **3アイコン共通寸法と個別視覚補正**：
  - Accepted：Microsoft Fluent `Checkmark 24 Filled`（Light: `#16A34A` / Dark: `#4ADE80`、`24px × 24px`、`transform: translateY(-2px)`）
  - Incomplete：Lucide `Footprints` 原本アウトラインSVG（Light: `#8064B0` / Dark: `#B9A2E5`、`aria-hidden="true"`、`25px × 25px`、`transform: translateY(-0.5px)`）
  - Mismatch：Microsoft Fluent `Fire 24 Regular`（Light: `#B47732` / Dark: `#E4AD69`、`24px × 24px`、`transform: translateY(-2px)`）
  - Mismatch 時の `Keep going!` ラベル（`.feedback-retry-label`）には、日本語テキストとのベースライン視覚整列のため `transform: translateY(-1px)` を適用する。
- **配置間隔（Gap）**：
  - 各アイコンと直後の認識テキスト（または差分テキスト）との間隔（`icon-gap`）は **`2px`**（`margin-right: 2px` または `gap: 2px`）。
  - Mismatchにおける差分テキストと `Keep going!` ラベル（`.feedback-retry-label`）の間隔（`keep-gap`）は **`8px`**（`margin-left: 8px`）。
- **Incomplete（未完了）判定のテキスト仕様**：
  - 判定が `incomplete` の場合、表示上の認識テキスト末尾に `…`（三点リーダー）を付加する。
  - 元テキスト末尾に既に終端記号（`…`, `...`, `。`, `.`, `！`, `？`, `!`, `?` 等）が存在する場合は重複付与を行わず、末尾に不自然な空白が生じないようにする。
  - `…` は画面表示のみに付与し、保存用 raw STT 文字列、`Copy my sentences` 出力、および採点処理（`r.refs` 照合）には混入させない。
  - Incomplete 判定時は `Keep going!` を表示せず、`[Footprints SVG] → [認識テキスト]… → [再生ボタン]` の順序で右寄せ配置する。

## 録音停止条件および Copy my sentences 出力仕様（2026-11-18）

- **録音停止条件**：
  - **Autostop ON**：発話前5秒無音で自動停止（`No speech detected within 5 seconds.`、新録音保存なし）／発話後2.0秒連続無音で自動停止／絶対上限20秒で自動停止（`Auto-stopped after 20 seconds.`）。
  - **Manual（Autostop OFF）**：発話前5秒停止なし／発話後2.0秒無音停止なし／ユーザーの手動停止または絶対上限20秒（`Auto-stopped after 20 seconds.`）のみで停止する。
- **`Copy my sentences` 出力アイコン**：
  - 保存された `entry.status` を優先参照し、`accepted` は `✅`、`incomplete` は `👣`、`mismatch` は `🔥` を文頭に付与する（未設定時のみ `FeedbackStatus.clipboardMarker(entry)` へフォールバック）。
  - Incomplete 判定の画面表示用末尾 `…` はコピー出力には混入させない。
- **`Copy my sentences` 操作と音声再生・アイコン**：
  - `PROJECT_SPEC.md` §7.2 に従い、モデル音声・録音音声の再生中に `Copy my sentences` を実行しても再生を中断せず、再生状態を維持する（録音中・マイク準備中の無効化条件は維持）。
  - Copy ボタンアイコンは `UI_LAYOUT_SPEC.md` §10 準拠（`fluent-icons.js` 既存の Microsoft Fluent `Clipboard 24 Regular`）を用いる。

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

Global Settingsの設定アイコン、Auto-Compare／Autostop、ツールチップ、音声再生・停止アイコン、再生中の表示、ホバーガイドおよびdisabled表示の共通仕様は、`UI_LAYOUT_SPEC.md` §13.1〜§13.3を正本とする。本書では共通規則を重複定義しない。

Practice 8.2固有の表示として、次の3点を維持する。
1. **もどるボタン（`.back-link`）**：Microsoft Fluent `Arrow Hook Down Left 24 Regular`（`arrowHookDownLeft`、`20×20px`、`translateY(-0.5px)`）を使用する。
2. **Drill説明文の電球アイコン（5箇所）**：Drill 1〜4およびDrill 5 English Cuesの`.info-panel-desc`先頭にMicrosoft Fluent `Lightbulb 24 Filled`（`lightbulbFilled`、`20×20px`、`vertical-align: -3.5px`）を配置し、`#fbbf24`を適用する。
3. **左下Voiceラベル（`.voice-select-label`）**：Microsoft Fluent `Speaker 2 24 Regular`（`speaker`／`speaker2`、`20×20px`）を使用する。

