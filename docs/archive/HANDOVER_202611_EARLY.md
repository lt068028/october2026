# 前回のリレー状態 — Practice 7.3・8.1「Copy my sentences」機能追加完了

- 更新日時：2026-11-09T00:45:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex実装指示書 — Practice 7.3・8.1 Copy my sentences追加 ／ `1707076f7fbb64861448b3014a5ef8cbe9d784fc` ／ `main`
- 実装内容と設計：
  1. **スコープと対象Drill**:
     - **Practice 7.3**：Drill 1（Compare Past & Past Continuous）、Drill 2（What were you doing?）、Drill 3（Until when?）の録音付きDrill各1箇所（計3箇所）。
     - **Practice 8.1**：Drill 1（Nounが、すき ↔ Verbのが、すき）、Drill 2（Verbのが、すき ↔ きらい？）、Drill 3（Verbのが、じょうず ↔ にがて）、Drill 4（Degrees of Intensity）、Drill 5（Compare じょうず・とくい・へた・にがて）の全5Drill各1箇所（計5箇所）。
     - Exampleには追加せず、各Drillの最終問題カード直後・カード枠外・右寄せに配置。
     - 他の練習ページ・共通音声モジュール等の既存ロジックは一切変更せず保持。
  2. **UI仕様（確定共通仕様準拠）**:
     - ボタン：Lucide `clipboard` SVG（20×20px、`stroke-width: 2`、`stroke: currentColor`）、ラベル「`Copy my sentences`」。
     - 補助説明：`Copy your drill results to review or share.`
     - ステータス表示：ARIA属性（`role="status"`、`aria-live="polite"`）、成功時「`Copied!`」（2秒後自動フェードアウト）、失敗時「`Could not copy. Please allow clipboard access.`」。
  3. **コピー内容とフォーマット**:
     - 英語見出しとローカル日付：
       - `Practice 7.3 — Drill 1: Compare Past & Past Continuous — ～ました／～ていました — YYYY-MM-DD`
       - `Practice 7.3 — Drill 2: What were you doing? — ～ていましたか — YYYY-MM-DD`
       - `Practice 7.3 — Drill 3: Until when? — ～まで～ていました — YYYY-MM-DD`
       - `Practice 8.1 — Drill 1: Nounが、すき ↔ Verbのが、すき — Noun vs. Verb＋の — YYYY-MM-DD`
       - `Practice 8.1 — Drill 2: Verbのが、すき ↔ きらい？ — すき／きらい — YYYY-MM-DD`
       - `Practice 8.1 — Drill 3: Verbのが、じょうず ↔ にがて — じょうず／にがて — YYYY-MM-DD`
       - `Practice 8.1 — Drill 4: Degrees of Intensity — ぜんぜん～すき — YYYY-MM-DD`
       - `Practice 8.1 — Drill 5: Compare じょうず・とくい・へた・にがて — じょうず／とくい／へた／にがて — YYYY-MM-DD`
     - 本文行：`${number}. ${role ? role + ': ' : ''}${isCorrect ? '✅ ' : '— '}${raw}`
     - 各Drill内で発話された**raw STT transcriptのみ**を出力（モデル文、正答例、訂正文、音声URL、未録音行は一切含めない）。
  4. **状態制御とライフサイクル連携**:
     - 初期状態（未録音時）：Disabled。
     - 録音準備中・録音中（`session || preparing`）：Disabled。
     - 録音完了・確定時：自動的にEnabled。
     - Script Mode（Hiragana/Kanji）、Speech Style（Formal/Casual）、Hint Mode（Off/Hover/Display）、English Cues切替等の再描画時も録音データを保全し、ボタンの重複生成を防止。
  5. **スタイルとキャッシュバスター**:
     - `style.css`: `.practice73-page .p73-copy-area`, `.practice81-page .p81-copy-area` および各ボタンスタイルを共通定義。
     - `practice7.3.html`, `practice8.1.html`: `style.css?v=20261109-copy-sentences`, `practice7.3.js?v=20261109-copy-sentences`, `practice8.1.js?v=20261109-copy-sentences` に更新。
  6. **自動検証（Chromium / Brave Headless CDP実機計測）**:
     - Practice 7.3：3個のCopyエリア確認、初期Disabled確認、モック録音データ投入後のEnabled確認、クリップボード書込確認（日付・Drill名・学習テーマ・raw STT・正誤記号）、設定切替時のボタン重複なし（3個維持）、クリップボード拒否時のエラー通知確認、レスポンシブ幅（1200px/768px/375px）での横スクロールなし（overflow: false）。
     - Practice 8.1：5個のCopyエリア確認、初期Disabled確認、モック録音データ投入後のEnabled確認、クリップボード書込確認（日付・Drill名・学習テーマ・raw STT・ロール接頭辞・正誤記号）、設定切替時のボタン重複なし（5個維持）、クリップボード拒否時のエラー通知確認、レスポンシブ幅（1200px/768px/375px）での横スクロールなし（overflow: false）。
- 変更ファイル：`style.css`, `practice7.3.html`, `practice7.3.js`, `practice8.1.html`, `practice8.1.js`, `docs/HANDOVER.md`
- スコープ厳守：Practice 7.3およびPractice 8.1のCopy機能追加に限定。他ページへの横展開なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - Brave Headless CDP実機計測（Practice 7.3 / Practice 8.1 全12検証項目、1200/768/375px）：全項目PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境にて検証済み）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Practice 7.3（Drill 1〜3）および Practice 8.1（Drill 1〜5）の「Copy my sentences」ボタン表示、録音後のコピー機能、クリップボード出力テキストの確認。

# 前回のリレー状態 — Practice 8.3「Verb」と「だれ・何」のボタン表示差解消完了

- 更新日時：2026-11-09T00:15:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Practice 8.3「Verb」と「だれ・何」のボタン表示差 ／ `5a91ddfd668ae69614f107fbaae22616a1c89f5c` ／ `main`
- 原因分析と修正内容：
  1. **確定した原因（Example内VerbバッジとDrill内セット切替ボタンのスタイル不一致）**:
     - Example 1最上段の英語カテゴリ「Verb」（`.p83-header-badge`）は、共通仕様（Lato 700、0.9em、padding 6px 10px、1px枠、8px角丸、height 36.45px、inline-flex配置）へ統一されていた。
     - 一方、Drill 1のセット切替ボタン「だれ (Who)」「何 (What)」（`.practice83-page .p21-set-switcher .example-button`）は、全般的な `.example-button` の既定値（font-weight 400、padding 4px 8px、4px角丸、height 33.8px、display: block）のまま残存していた。
     - このため、同じPractice 8.3内で角丸（8px vs 4px）、余白（6px 10px vs 4px 8px）、太さ（700 vs 400）、高さ（36.45px vs 33.8px）の不統一が生じていた。
  2. **修正内容**:
     - `style.css`: `.practice83-page .p21-set-switcher .example-button` に対し、共通UI契約（`display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-latin); font-size: .9em; font-weight: 700; line-height: 1.2; padding: 6px 10px; border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; letter-spacing: normal; box-sizing: border-box;`）を明示適用。
     - これにより、英字部分（`(Who)`, `(What)` 等）はLato 700で描画され、日本語部分（`だれ`, `何` 等）は既定の日本語フォント（sans-serifフォールバック）を維持したまま、高さ（36.45px）、余白（6px 10px）、角丸（8px）、枠線、文字の垂直中央整列がVerbバッジと完全に一致。
     - 文字幅に応じた自然な横幅（だれ 115.08px、何 102.78px）を維持し、固定幅の強制は行わない。
     - 選択状態（`[aria-pressed="true"]` の青枠アウトライン）、Hover動作、クリック操作、およびQuestionIndicator（疑問文アイコン）は100%保持。
     - `practice8.3.html`: スタイルシートのキャッシュバスターを `style.css?v=20261109-p83-btn-unify` に更新。
  3. **自動検証（Chromium / Brave Headless CDP実機計測）**:
     - computed style計測：
       - `verbBadge`: height 36.45px, padding 6px 10px, border-radius 8px, font-weight 700, font-size 18.72px
       - `dareSetBtn`: height 36.45px, padding 6px 10px, border-radius 8px, font-weight 700, font-size 18.72px
       - `naniSetBtn`: height 36.45px, padding 6px 10px, border-radius 8px, font-weight 700, font-size 18.72px
     - 375px / 768px / 1200px の全画面幅で横はみ出しなし（docWidth <= winWidth、水平スクロールなし）。
     - セット切替クリック操作検証：状態切替、設問再レンダリング、スタイル保持を確認。
     - 疑問文アイコン検証：18個の `.question-indicator-icon` がすべてDOM内に正常表示。
- 変更ファイル：`style.css`, `practice8.3.html`, `docs/HANDOVER.md`
- スコープ厳守：Practice 8.3のセット切替ボタンに限定。他ページ、Ex本文、学習内容、音声/録音ロジックへの影響なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - Brave Headless CDP実機計測（375/768/1200px、クリック動作、computed style比較、ダークモード）：全項目PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境にて検証済み）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Practice 8.3 の「Verb」と「だれ・何」ボタンの外観統一（高さ36px、角丸8px、余白6px 10px、文字の太さ・位置）の確認。

# 前回のリレー状態 — Deutsche Übung 1.1 Vercel配信・CSSキャッシュ問題解消完了

- 更新日時：2026-11-08T23:45:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Deutsche Übung 1.1 Vercel配信・CSSキャッシュ問題 ／ `650186e885ee8d98d02e07173e6d24ba208d88e6` ／ `main`
- 原因分析と修正内容：
  1. **確定した原因分類：区分B（公開HTMLは最新だが、ユーザー実機ブラウザにおいて同一URLパラメータによるCSSキャッシュ残存が発生）**:
     - コミット `691bbe0` において、Drill 2〜4へのUI統一適用時に `uebung1.1.js?v=20261108-drills-standardized` のキャッシュバスターは更新されていたが、`uebung1.1.html` 内のスタイルシート参照が Drill 1 修正時の `style.css?v=20261108-uebung11` のまま据え置かれていた。
     - このため、Drill 1 修正段階で同ページにアクセスしていたユーザーの実機ブラウザ（Chrome等）では、クエリパラメータが同一の旧 `style.css?v=20261108-uebung11`（`#drill1` のみ対象で `#drill2`〜`#drill4` のGrid規則を含まない古いCSS）がブラウザのディスク・メモリキャッシュから継続利用された。
     - 一方、JavaScriptは新バージョンがロードされたため、CSS Gridのセレクタが適用されない状態とJSの動作が不整合を起こし、Drill 2〜4でキュー改行や重なりなどの未反映状態が生じていた。
  2. **修正内容**:
     - `uebung1.1.html`: スタイルシートのキャッシュバスターを `<link rel="stylesheet" href="style.css?v=20261108-drills-standardized">` に更新。
     - これにより、全ユーザー環境で最新のCSS（`:is(#drill1, #drill2, #drill3, #drill4)` 対応）が強制再取得され、ブラウザキャッシュによる不整合が解消される。
  3. **自動検証（Chromium / Brave Headless CDP実機計測）**:
     - 1200px: Drills 1〜4 全件 `display: grid`、キュー折り返しなし、音声とモデル文の重なりなし（0件）、横スクロールなし（docWidth 1185px <= 1200px）。
     - 768px: Drills 1〜4 全件 `display: grid`、キュー折り返しなし、音声とモデル文の重なりなし（0件）、横スクロールなし（docWidth 753px <= 768px）。
     - 520px / 480px / 375px: モバイル用レスポンシブ契約が正常動作（操作部が安全に次段折り返し、横スクロールなし docWidth 375px <= 375px）。
     - ウィンドウResizeイベント発火時の `--drill-cue-width` 動的再計算が正常動作。
     - 地域変種（DE / AT / CH）切り替え時のレイアウト破損なし。
- 変更ファイル：`uebung1.1.html`, `docs/HANDOVER.md`
- スコープ厳守：Deutsche Übung 1.1 のみ。Drill 1確定仕様、学習コンテンツ、日本語Practice、共通UI仕様への影響なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - Brave Headless CDP実機計測（375/480/520/768/1200px、リサイズ、変種切替）：全項目PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境にて検証済み）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの `https://october2026.vercel.app/uebung1.1.html` の更新確認（キャッシュクリア不要で最新CSSが自動適用されることの確認）。

# 前回のリレー状態 — Practice 2.3 Example 1 Q/Aラベルとキューの接触解消完了

- 更新日時：2026-11-08T23:25:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Practice 2.3 Example 1 Q/Aラベルとキューの接触解消 ／ `691bbe054317e593f8cff33d031c902fa6d82773` ／ `main`
- 原因分析と修正内容：
  1. **確定した原因（適応セル min-width: 0 と flex-gap 計算の干渉）**:
     - `content-layout.js` の `adaptiveExample` により、音声とモデル文を持つ設問行（行1, 行4の Q行）の話者ラベル `strong.p23-model-speaker.conversation-role` に `data-content-adaptive-cell="label"` が付与される。
     - `style.css` 4601行目の `body.site-scale .content-adaptive-example [data-content-adaptive-cell]:not(button) { min-width: 0; max-width: 100%; }` により、Q行の話者ラベル要素が幅圧縮を許容される。
     - この要素は `display: flex; gap: 6px;` を持つ複合要素（Qアイコン25.86px ＋ Xバッジ23.88px ＝ 内容幅49.73px ＋ flex gap 6px ＝ 55.73px）であるが、`min-width: 0` と `justify-self: end` の組み合わせにより、ブラウザのGrid配置計算時に外側要素の幅が flex gap 6px を除いた `48.7344px` に縮小された。
     - その結果、`justify-self: end` によって外側要素が右端（120.73px）に揃えられた際、左端が `72.0px`（本来の列開始65.0pxから7px右）に配置され、内部の Xバッジが右側に 7px はみ出して `127.73px` に達し、次列のキュー「Yさん／どこ」（開始位置 `126.73px`）と -1px の接触・食い込みを発生させていた。
  2. **修正内容**:
     - `style.css`:
       - `.p23-conversation-models .p23-model-speaker { grid-column: 1; min-width: max-content; }` を適用。
       - `body.site-scale .content-adaptive-example.p23-conversation-models .p23-model-speaker { min-width: max-content; }` を追加（詳細度 `(0, 4, 1)` で適応セルの `min-width: 0` を確実に上書き）。
     - `practice2.3.html`: キャッシュバスターを `style.css?v=20261108-p23-qa-gap` に更新。
     - これにより、Q行の話者ラベルが本来の自然幅 `55.7344px`（65.0px〜120.7344px）を常に保ち、内包する Xバッジの右端が厳密に `120.7344px` に収まる。
     - 次列のキュー（`126.7344px`）との間隔が**厳密に 6.0000px**となり、接触・食い込みが完全に解消。
     - 同時に、行1の単独Xと導入文（`126.7344px - 120.7344px = 6.0000px`）、次行キューとの開始位置完全一致（差0px）、A行の配置も完全維持。
  3. **自動検証（Chromium / Brave Headless CDP実機計測）**:
     - 375px / 768px / 1000px / 1200px の全画面幅で計測：
       - 行1 X右端 → 導入文左端: **6.00px**
       - Q行 X右端 → キュー左端: **6.00px**
       - A行 Y右端 → キュー左端: **6.00px**
       - 導入文左端とキュー左端の差: **0.00px**
       - Q/Aラベルとキューの重なり: **なし (false)**
       - ページ横はみ出し: **なし (false)**
     - `tests/practice23-cities.cjs` に上記契約を検証する自動アサーションを追加。
- 変更ファイル：`style.css`, `practice2.3.html`, `tests/practice23-cities.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 2.3 Example 1の話者ラベル幅・配置に限定。Example 2以降、Drill 1・2、他ページへの変更なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - Brave Headless CDP実機座標測定（375/768/1000/1200px）：全項目PASS
  - `tests/practice23-cities.cjs` 全アサーション検証：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境にて検証済み）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Practice 2.3 Example 1 の Q/Aラベルとキューの間隔（6px）、行1のXと導入文間隔（6px）、重なり解消の確認。

# 前回のリレー状態 — Deutsche Übung 1.1 Drills 2・3・4 UI統一修正完了

- 更新日時：2026-11-08T22:35:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Deutsche Übung 1.1 Drill 2・3・4のUIをDrill 1確定仕様に統一 ／ `f0f750b38c031d279761e389e81b672a9a463d12` ／ `main`
- 修正内容と統一事項：
  1. **Example表示の統一**:
     - 不要な「Ex:」ラベルをDrill 2〜4の全Exampleから完全撤去（`uebung1.1.js`）。
     - Exampleテーブルから設問用 `.recording-table` スタイルを排除し、全Drill（Drills 1〜4）で独立した `table.drill-example-table` 4列Grid（キュー、👉、🔊きく、モデル文）を適用。
     - Hover時の語彙ヒントを共通の `.tooltip-wrap` / `.target-word` / `.tooltip-tip`（点線下線）に統一（`formatCue(item, true)`）。
     - 音声ボタンとモデル文の重なり・改行分断を防止し、狭幅時（<= 520px / 375px）は上段にキュー、下段に👉・🔊きく・モデル文をまとめるレスポンシブ契約をDrills 1〜4全件に適用（`style.css`）。
  2. **Drill設問群の統一**:
     - キューセルに `white-space: nowrap !important;` を適用し、通常幅での1行表示を保証（`style.css`）。
     - Hover時の点線下線（`.tooltip-wrap` / `.target-word`）を全設問に適用。
     - 自然幅計測処理 `alignDrillCues()` を導入し、Drills 1〜4の各セクションごとに非表示クローン（`white-space: nowrap`, `width: max-content`, ツールチップ要素除外）を用いて最長キューの自然幅（intrinsic width）を測定し、各セクションの `--drill-cue-width` に設定。
     - 循環圧縮の防止、過大幅（固定50%等）の排除、操作ボタン列との不要な余白を解消。
     - 既存の `alignDrill1Cues()` は後方互換ラッパーとして維持。
     - 狭幅（<= 480px / 375px）ではキューを圧縮せず、操作ボタン列を次段（`grid-column: 1 / -1;`）へ折り返す契約を全Drillに展開。
     - OFF / Hover / Display 切替時およびウィンドウResize時の自動再計測を保証。
  3. **仕様書・テスト・キャッシュ更新**:
     - `docs/GERMAN_DRILL_SPEC.md`: Drills 1〜4全件への適用状態を反映。
     - `tests/uebung11.cjs`: Drills 1〜4全体のExテーブル・Exラベル撤去・ツールチップ・自然幅計測・`white-space: nowrap !important` を検証する回帰テストに強化。
     - `uebung1.1.html`: スクリプトキャッシュバスターを `20261108-drills-standardized` に更新。
- 変更ファイル：`uebung1.1.js`, `style.css`, `uebung1.1.html`, `docs/GERMAN_DRILL_SPEC.md`, `tests/uebung11.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Deutsche Übung 1.1 のみ。Drill 1の既存表示・動作・音声・判定・地域変種・他ページへの悪影響なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - 全マークダウン構文チェック：PASS
  - `tests/uebung11.cjs` 全アサーション検証スクリプト：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境なしのため未実施）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Deutsche Übung 1.1 Drills 2・3・4 の Example 表示および設問キューの1行表示・整列確認。

# 前回のリレー状態 — Practice 2.3 Example 1 話者・導入文6px間隔再調査と修正完了

- 更新日時：2026-11-08T22:25:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Practice 2.3 Example 1・6px間隔の再調査と修正（話者ラベル右揃え指定のセレクタ不一致解消とキャッシュ更新） ／ `b9889cc46d0a793544d0cb66687aeb4a4d6f851d` ／ `main`
- 原因分析と修正内容：
  1. **確定した原因（セレクタ不一致による右寄せ未適用）**:
     - `practice-next.js` の Example 1 導入文行（行1: `X:`）では、`node('strong', 'p23-model-speaker', label ?? speakerName(who) + ':')` で生成され、`ConversationDisplay.format()` により `label.classList.add('conversation-person')` が付与される。
     - しかし、Q/Aアイコン行（行2, 3, 5, 6）では `pair || role` の分岐に入り、`label.classList.add('conversation-role')` が付与されるため、外側の要素は `strong.p23-model-speaker.conversation-role` となり、`conversation-person` クラスは子要素の `span.conversation-person` に付与される。
     - 一方、`style.css` の右寄せ規則は `.site-scale :is(.p21-which-model-line > .conversation-person,.p23-model-speaker.conversation-person) { justify-self: end; }` となっており、また一般的な `.conversation-person:not([data-conversation-image]) { justify-self: start; }` が存在した。
     - このため、第1列の幅が最大要素（Q/Aアイコン付きラベル約48px）によって決まる一方、単独の `X` は左寄せ（`justify-self: start`）となり、要素幅約22pxの右側に余分な空間（約26px）が残存し、実効間隔が 6px + 26px = 約32px となってしまっていた。
  2. **修正内容**:
     - `style.css`: `.site-scale :is(.p21-which-model-line > .conversation-person,.p23-model-speaker.conversation-person,.p23-model-speaker) { justify-self: end; }` と修正。
     - これにより、`conversation-person` クラスの有無や `conversation-role` との合成状態にかかわらず、`.p23-conversation-models` の第1列に配置されるすべての話者ラベル（`strong.p23-model-speaker`）が常に確実に列の右端（`justify-self: end`）へ整列される。
     - 第1列の右端と第2列（導入文および次行キュー）の左端との距離が、Gridの `column-gap: 6px` により**厳密に 6px** となる。
     - `practice2.3.html`: スタイルシートのキャッシュバスターを `style.css?v=20261108-p23-speaker-align` へ更新。
  3. **回帰テスト（`tests/practice23-cities.cjs`）の強化**:
     - すべての `.p23-model-speaker` 要素が `justify-self: end` を保持していることを検証するアサーションを追加。
- 変更ファイル：`style.css`, `practice2.3.html`, `tests/practice23-cities.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 2.3 Example 1の話者ラベル・導入文間隔に限定。Example 2以降、Drill 1・2、他ページへの変更なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - Python静的構文チェック・セレクタ整合性検証：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境なしのため未実施）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Practice 2.3 Example 1 の X/Y と導入文頭（わたしは…）の間隔（6px）および導入文と次行キュー開始位置の一致確認。

# 前回のリレー状態 — Deutsche Übung 1.1 Dr1 キュー改行修正・専用仕様書改訂完了

- 更新日時：2026-11-08T22:16:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex指示書 — Deutsche Übung 1.1 Dr1 キュー改行修正・専用仕様書改訂（Drill 1設問3「Berlin / fahren」改行解消、自然幅計測契約の策定・実装・テスト強化） ／ `b0c2b0de31cbf04655458e0892019c0b1157973d` ／ `main`
- 原因分析と修正内容：
  1. **改行の確定原因**:
     - `style.css` の `.uebung11-page #drill1 .drill-row .recording-table .drill-cue-cell` に `white-space: normal !important;` が指定されており、キューの任意折り返しが許可されていた。
     - `uebung1.1.js` の `alignDrill1Cues()` が、既に折り返された状態の `.cue-content` の `getBoundingClientRect().width` を測定していたため、折り返し後の狭い幅（約1行分）が `--drill-cue-width` に固定され、キューが復元されず改行状態に固定化される循環圧縮が発生していた。
  2. **修正内容**:
     - `style.css`: `.uebung11-page #drill1 .drill-row .recording-table .drill-cue-cell` の `white-space` を `nowrap !important` に変更。通常の表示幅で地名・区切りスラッシュ・動詞が1行で表示されることを保証。
     - `uebung1.1.js`: `alignDrill1Cues()` において、`cloneNode(true)` を用いた一時的な非表示クローン要素（`white-space: nowrap`, `width: max-content`, ツールチップ要素 `.tooltip-tip`, `.custom-tip-box` 除去済み）を生成して測定する方式に改善。折り返し前の純粋な自然幅（intrinsic width）を取得し、`--drill-cue-width` に設定。
     - `uebung1.1.html`: スクリプトキャッシュバスターを `20261108-cue-width-fix` に更新。
  3. **ドイツ語専用仕様書（`docs/GERMAN_DRILL_SPEC.md`）の改訂**:
     - 「3.4 キューの非折り返し・自然幅計測契約」を新設。
     - 1行表示原則、折り返し前の自然幅計測、循環圧縮の禁止、幅不足時の操作ボタン列折り返し優先、地名・記号・動詞の非分断、OFF/Hover/DisplayおよびResize後の再計測保証、極小幅時の安全なフォールバック、新規ドリルへの共通適用を明文化。
  4. **回帰テスト（`tests/uebung11.cjs`）の強化**:
     - Drill 1 キューセルの `white-space: nowrap !important` 指定、`alignDrill1Cues` のツールチップ除去処理、`max-content` / `whiteSpace: nowrap` による自然幅測定契約を検証するアサーションを追加。
- 変更ファイル：`uebung1.1.js`, `style.css`, `uebung1.1.html`, `docs/GERMAN_DRILL_SPEC.md`, `tests/uebung11.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Deutsche Übung 1.1 Drill 1 および専用仕様書・テスト・引き継ぎ文書のみ。Example、Drill 2〜4、他ページ、共通音声・録音ロジックは一切変更なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - 全マークダウン構文チェック：PASS
  - `tests/uebung11.cjs` 全アサーション検証スクリプト：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境なしのため未実施）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Deutsche Übung 1.1 Drill 1 設問1〜3（特に設問3「Berlin / fahren」）の1行表示確認。
  - 実機確認完了後、確定仕様をDrill 2〜4へ展開予定。

# 前回のリレー状態 — Practice 8.3 疑問文アイコン未表示修正完了

- 更新日時：2026-11-08T22:05:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Practice 8.3 疑問文アイコン未表示（停止ボタンラッパーのDOM孤立不具合の修正と回帰テスト強化） ／ `028f44eed8b86e85543a3db1bc04141682de143e` ／ `main`
- 不具合の原因と修正内容：
  1. **不具合メカニズム（実行順序の不整合）**:
     - `practice8.3.js` の録音行生成（L891）において、`actions.append(listen, rec, stop)` より前に `QuestionIndicator.attach(stop, ...)` が呼び出されていた。
     - `attach()` 実行時、`stop` は親要素を持たない（`stop.parentElement === null`）。そのため `container`（`.recording-actions`）が取得できず、作成された `.stop-indicator-wrap` はDOMツリーに追加されない状態となっていた。
     - その直後に `actions.append(listen, rec, stop)` が実行されたため、`stop` のみが `actions` へ直接移動され、アイコンを含むラッパーはDOMから切り離されて完全に孤立していた。
  2. **修正内容**:
     - `practice8.3.js` L891 の実行順序を修正し、`actions.append(listen, rec, stop)` を先に実行した上で `QuestionIndicator.attach(stop, ...)` を呼び出すように変更。
     - これにより、`stop` が `.recording-actions` 内に存在する状態で `attach()` が実行され、`stop` が `.stop-indicator-wrap` で正しく置換され、`[stop, indicator]` が `.recording-actions` の直接の子要素として正常に配置される。
     - `practice8.3.html` のスクリプトキャッシュバスターを `20261108-question-indicator-fix` へ更新。
  3. **回帰テスト（`tests/question-indicator.cjs`）の強化**:
     - 単なるセレクタ存在判定だけでなく、`.recording-actions > .stop-indicator-wrap > .question-indicator` の階層構造を直接検証するアサーションを追加。
     - 疑問文行（`-q1`, `-q2`）のみにインジケーターが存在し、回答行（`-a`）には一切付与されないことを厳格に検証。
     - セット切り替え時（D1 Set 2, D2 Set 2, D3 Set 2, D4 Set 2 & Set 3）の全代替セットでも `.recording-actions` 内に正しく配置されることを確認。
- 変更ファイル：`practice8.3.js`, `practice8.3.html`, `tests/question-indicator.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 8.3 およびテスト・引き継ぎ文書のみ。他ページや Example、動詞・疑問詞ボタン等のロジックは一切変更なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - DOMツリー構築・孤立防止シミュレーションテスト：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境なしのため未実施）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Practice 8.3 Drills 1〜4 疑問文アイコン表示確認。

# 前回のリレー状態 — F5: Example発話行間のグレー点線撤去・共通仕様確定完了

- 更新日時：2026-11-08T21:52:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex指示書 — F5 Example発話行間のグレー点線撤去（共通表示仕様の確定・全ページ横断監査・UI_LAYOUT_SPEC.md正本化） ／ `6b0cf4544d9f67a26f8d3886566ae8cfbe038166` ／ `main`
- 調査および監査結果：
  1. **点線の発生原因と既存撤去状況**:
     - かつて `style.css` の `.drill-example-table > tbody > tr + tr > td`（L453）および `.practice12-page .drill-example-table > tbody > tr + tr`（L2306）に `border-top: 1px dashed var(--border-color);` が、`practice1.1.js` に `dashed-border` クラス（`border-top: 1px dashed #fbc02d;`）が存在していた。
     - これらは先行コミット `8abcf8d` でスタイル定義が撤去されており、日本語Practice全14ページおよびドイツ語ページのExample発話行間においてグレー点線が残存していないことを横断監査で確認。
  2. **非対象の区切り線の維持確認**:
     - 語彙キューのホバー点線（`.tooltip-wrap` の `border-bottom: 1px dotted var(--accent-color);`）は全ページで正常に維持されている。
     - Drill設問行間の区切り線（`practice7.1.js` L1377 の `tr2.style.borderTop`）はDrill設問テーブル専用のため保持。
     - Practice 8.3 Example内のセット大区切り線（`.practice83-page .p83-example-divider`）はカテゴリ大区分のため保持。
     - Exampleカード外枠（`.example-box` の黄色/オレンジ境界線）は維持。
  3. **共通UI仕様書（`docs/UI_LAYOUT_SPEC.md`）への明文化**:
     - 指示書規定の共通ルール「Example内の発話行を区切るグレーの点線は使用しない。発話行の区別は既存の行配置・余白・話者表示で維持する。語彙キューのホバー対象を示す点線下線は、この撤去対象に含まない。」を新規セクションとして追記。
- 変更ファイル：`docs/UI_LAYOUT_SPEC.md`, `docs/HANDOVER.md`
- スコープ厳守：F5の仕様書確定および横断監査のみ。余白・行間・他UIへの不要な変更なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - 全マークダウン構文チェック：PASS
  - 全Practiceファイル横断境界線監査スクリプト：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境なしのため未実施）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの全Practice Example表示確認。

# 前回のリレー状態 — F8 Practice 2.3 Example 1 話者・導入文間隔修正完了

- 更新日時：2026-11-08T21:48:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex指示書 — F8 Practice 2.3 Example 1 間隔修正（候補B: 実効間隔6pxの採用、padding-left: 4px撤去、導入文と次行キュー開始位置の一致） ／ `8903a14d5199b9f14549b34798a90eaaf413ab7e` ／ `main`
- 実装内容：
  1. **Practice 2.3 Example 1 話者ラベルと導入文の間隔修正**:
     - `style.css` の `.p23-conversation-models .p23-model-intro` から `padding-left: 4px;` を撤去。
     - 既存の `column-gap: 6px` を維持し、話者ラベル「X」（右揃え）と導入文（「わたしは、にほんです。」）の実効間隔を 10px から **6px** へ変更。
     - 導入文（第2列開始）と次行のキュー（「ここ／あさ」等、第2列開始）の水平開始位置を完全に一致。
     - Q/A行（`[Q] [X]` / `[A] [Y]`）の配置・整列を完全維持。
  2. **影響範囲の厳密な局所化**:
     - 変更対象は `style.css` の `.p23-conversation-models .p23-model-intro` のみ。
     - Practice 2.3 の Drill、他の Example、他ページへの影響は一切なし。不要なリファクタリングも未実施。
- 変更ファイル：`style.css`, `docs/HANDOVER.md`
- スコープ厳守：Practice 2.3 Example 1のみ。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - CSS構文・セレクタ検証：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち（ブラウザ自動検証環境なしのため未実施）。
- 次の具体的操作／判断待ち：
  - 実機ブラウザでの Practice 2.3 Example 1 表示確認。

# 前回のリレー状態 — Deutsche Übung 1.1：Ex・Dr1のUI修正完了

- 更新日時：2026-11-08T21:45:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex修正指示書 — Deutsche Übung 1.1：Ex・Dr1のUI修正（Ex-1: 「Ex.」撤去、Ex-2: キュー点線表示、Ex-3: キューと👉の余白修正、Ex-4: 👉と音声ボタンの改行修正、Ex-5: モデル文と音声ボタンの重なり解消、Dr1-1: キュー点線表示、Dr1-2: キューと音声ボタンの余白修正） ／ `81ea7811cfe8a5e50e5a01fd8427e1ed469d01ce` ／ `main`
- 根本原因の分析：
  1. **Ex-1**: `uebung1.1.js` の `exCueTd` 生成時に `strong.example-label-title` ("Ex: ") を独自追加していた。
  2. **Ex-2 & Dr1-1**: 語彙ヒント生成関数 `formatCue()` で、ホバー時に共通の `.tooltip-wrap`（`border-bottom: 1px dotted var(--accent-color)`）ではなく `.custom-tip-wrap` を使用していたため点線下線がスタイル付与されなかった。
  3. **Ex-3, Ex-4, Ex-5**: `exTable` に `recording-table` クラスが付与されていたため、共通CSS（`style.css` L2450）の3列Gridレイアウト（34px / 50% / 1fr）が誤適用され、行1でキューが50%幅を占有して👉️との間に巨大な空白が生じ（Ex-3）、列溢れにより音声ボタンが次行へ強制改行され（Ex-4）、34px幅セル内に配置された音声ボタンが隣接セル（モデル文）と重なって表示されていた（Ex-5）。
  4. **Dr1-2**: Drill 1の `.recording-table` において `--drill-cue-width` が未定義だったため、`style.css` の既定値 `50%` 幅がキュー列に割り当てられ、キュー文字列と音声ボタンの間に約250pxの不要な空白が生じていた。
- 実装内容：
  1. **Ex（Drill 1 Example）の修正**:
     - `exCueTd` から「Ex: 」項目名を撤去（カード枠・見出し等は維持）。
     - ホバー時に `.tooltip-wrap` / `.target-word` / `.tooltip-tip` を適用し、確定共通仕様の点線下線を表示（OFF/Paren時の動作契約維持）。
     - `exTable` から `recording-table` クラスを撤去し、`.uebung11-page #drill1 .example-box .drill-example-table` に4列Grid（`max-content max-content max-content minmax(0, 1fr)`、`column-gap: 8px`）を適用。広幅時は同一行・8px間隔で整列させ、不要な改行およびモデル文との重なりを解消。
     - 狭幅（<= 520px / 375px）時はコンテナクエリによりキューを上段、[👉️] [🔊きく] [モデル文] を下段に配置し、矢印と音声ボタンを同一行に維持。
  2. **Dr1（Drill 1 設問群）の修正**:
     - ホバー時に `.tooltip-wrap` / `.target-word` を適用し点線下線を表示。
     - `alignDrill1Cues()` を新設し、Drill 1の最長キュー幅を実測して `--drill-cue-width` に同期。不要な固定50%空白を撤去し、8px間隔で音声ボタンへ近接配置。
     - 狭幅（<= 480px / 375px）時は操作群を自然に次段へ折り返す。
     - 録音・再生・停止・Autostop・Autoplayの動作ロジックは一切変更なし。
  3. **Dr2〜Dr4および日本語ページの完全保全**:
     - スタイリングはすべて `.uebung11-page #drill1` に限定スコープ化。Dr2〜Dr4のDOM構造・スタイル・動作、および日本語Practiceページには一切の変更なし。
- 変更ファイル：`uebung1.1.js`, `style.css`, `tests/uebung11.cjs`, `docs/GERMAN_DRILL_SPEC.md`, `docs/HANDOVER.md`
- スコープ厳守：Deutsche Übung 1.1のExおよびDr1のみ。Dr2〜Dr4および他ページへの不要な変更なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - `tests/uebung11.cjs`（全項目およびEx-1〜Ex-5, Dr1-1〜Dr1-2検証）：PASS
  - Python契約整合性テスト：PASS
- ユーザー実機確認／CI／デプロイ：Vercelデプロイ後の実機確認待ち。
- 次の具体的操作／判断待ち：
  - 実機ブラウザ（通常幅および375px幅）でのEx・Dr1の表示・操作確認。

# 前回のリレー状態 — W：ドイツ語ドリル開発の参照範囲最適化・専用仕様整備完了

- 更新日時：2026-11-08T21:12:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Codex作業指示書 — W：ドイツ語ドリル開発の参照範囲最適化・専用仕様整備（GERMAN_DRILL_SPEC.md新設、GERMAN_DEVELOPMENT_GUIDE.md新設、AGENTS.md参照優先順位追記） ／ `60fbe3dcb1a470bcc1449a20c2c7f3db79f8629f` ／ `main`
- 実装内容：
  1. **ドイツ語専用仕様書の新設（`docs/GERMAN_DRILL_SPEC.md`）**:
     - `Deutsche Übung 1.1` を第一参照実装とし、全12領域（標準ページ構造、Ex/Drill基本構成、モデル文表示・再生、録音・再生・STT、Autostop/Autoplay、地域変種DE/AT/CH、TTS/STTロケール・音声選択、語彙ヒント、Copy my sentences、共通CSS・Lato・Lucide、モバイル・アクセシビリティ、専用テスト）の仕様を明文化。
     - 「実装済み」「既存共通仕様」「今後の設計方針」を厳格に区分し、未実装機能の実装済み扱いを排除。
  2. **ドイツ語開発ガイドの新設（`docs/GERMAN_DEVELOPMENT_GUIDE.md`）**:
     - 参照優先順位（1: 対象ドイツ語ページ → 2: GERMAN_DRILL_SPEC → 3: ドイツ語専用テスト → 4: 必要な共通モジュール → 5: 共通仕様書）の確立。
     - 日本語ファイル（`practice*.js`, `practice*.html` 等）の原則参照禁止と、例外4条件（共通モジュール仕様確認、新機能移植、共通モジュール変更の影響調査、既存テスト失敗時の原因分析）および作業報告への理由明記義務を策定。
     - 共通モジュール変更時の回帰確認方針（全日本語ファイルの無条件読み込みを禁止し既存自動テスト `tests/*.cjs` を優先）と、調査効率化ルール、新規ドイツ語ドリル（Deutsche Übung 1.2+）作成の標準手順を規定。
  3. **プロジェクト継続ルールへの反映（`AGENTS.md`）**:
     - `## 2. 最優先の実装・編集ルール` に「ドイツ語ドリル（Deutsche Übung）の参照優先順位と探索範囲（2026-11-08策定）」を追加。
  4. **コード・テストの完全保全**:
     - `uebung1.1.html` / `uebung1.1.js`、日本語ドリルのHTML/JS、`drill-audio-session.js`、`style.css`、既存自動テスト等の実行コードは一切無変更を維持。
- 変更ファイル：`docs/GERMAN_DRILL_SPEC.md` (新規), `docs/GERMAN_DEVELOPMENT_GUIDE.md` (新規), `AGENTS.md`, `docs/HANDOVER.md`
- スコープ厳守：ドイツ語ドリルの開発体制・仕様書整備のみ。実行コードの変更・リファクタリング・スタイル変更は一切なし。
- 自動検証：
  - `git diff --check`：PASS（空白・改行不整合なし）
  - 全マークダウンファイル構文およびリンク整合性チェック：PASS
  - 既存テストへの非干渉確認：PASS
- ユーザー実機確認／CI／デプロイ：文書変更のため実機動作影響なし（Vercelデプロイ確認待ち）。
- 次の具体的操作／判断待ち：
  - Deutsche Übung 1.2以降の新規ドリル作成時に、本開発ガイドおよび専用仕様書に沿った開発運用の開始。

# 前回のリレー状態 — Deutsche Übung 1.1 モデル音声再生修正完了

- 更新日時：2026-11-08T21:05:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Deutsche Übung 1.1: モデル音声再生不具合の調査・修正（speakModelとguardUtteranceの連携順序是正、DrillAudio.speak経由への統一、stopPlaybackとstopAllPlaybackの分離によるAutoplayリレー保全、端末音声検出とエラー通知改善） ／ `fceffb20d3fdb98fc04d7db8f1d392301901c0eb` ／ `main`
- 調査結果と根本原因：
  1. **コールバック設定順序とguardUtteranceの無効化**:
     - `uebung1.1.js` の `speakModel()` 内で、`u.onend` / `u.onerror` を設定する前に `DrillAudio.guardUtterance(u)` を呼び出していたため、`guardUtterance` 内部で `callback` が未定義となり、その直後に `u.onend = cleanup` で上書きされたことで、`guardUtterance` のセッション管理ラッパーが完全に破棄されていた。
  2. **`DrillAudio.speak(u)` 未使用と直接呼出**:
     - 既存の全ページで共通利用されている `DrillAudio.speak(u)` ではなく、直接 `window.speechSynthesis.speak(u)` を呼んでいたため、実行時エラーの捕捉・セッション watchdog・旧音声キャンセルが一元管理されていなかった。
  3. **`stopAllPlayback()` の無条件呼出によるAutoplayリレー破壊**:
     - `speakModel()` 内で無条件に `stopAllPlayback()` を呼んでいたため、Autoplayリレー（`DrillAudio.playRelay`）実行時に `DrillAudio.invalidatePlayback()` が発火し、`relay = null` となって学習者の録音再生へ繋がらなくなっていた。
  4. **Chromium系ブラウザの `speechSynthesis.paused` デッドロック**:
     - `cancelSpeech()`（Pause-then-Cancel）の直後にブラウザ側で `paused === true` のまま固定化され、キューに入った発話が一切再生されなくなる問題が発生していた。
  5. **端末音声未検出時の無言終了と通知の欠落**:
     - 端末側にドイツ語音声が存在しない環境で、エラーが捕捉されずボタンも戻らない、あるいは無言で終了しユーザーに原因が伝わらなかった。
- 実装内容：
  1. **`speakModel()` の連携是正**:
     - `u.onend` および `u.onerror` を先にアタッチし、`DrillAudio.speak(u)` 経由で再生するよう修正。
     - `window.speechSynthesis.paused` の場合に `resume()` を呼んでブラウザのキュー詰まりを解除。
     - 実行時例外および音声エラー（`canceled` / `interrupted` を除く）を `DrillAudio.notify` で通知し、無言終了を防止。
  2. **`stopPlayback()` と `stopAllPlayback()` の分離**:
     - 内部停止用の `stopPlayback()` と、外部中断・ボタンクリック用の `stopAllPlayback()`（`invalidatePlayback` を含む）を分離。
     - `isRelay === true` 時は `stopAllPlayback()` をスキップし、Autoplayリレーを破壊しないよう修正。
  3. **ボタン状態の確実な管理**:
     - `markPlaying(btn)` / `stopPlayback()` により、`btn._contents` を退避・復元し、再生中は `disabled = true` かつ `Playing...` を表示。失敗時・エラー時も確実に復元。
  4. **音声検出とロケール判定の堅牢化**:
     - `normalizeLang()` により、アンダースコア（`de_DE`）とハイフン（`de-DE`）の差異を吸収。
     - 端末にドイツ語音声が1件も存在しない場合の警告表示を `#voiceRegionNotice` に追加。
- 変更ファイル：`uebung1.1.js`, `tests/uebung11.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Deutsche Übung 1.1の音声制御のみ。日本語ドリル14ページおよび既存CSS・HTMLへの不要な変更は一切なし。
- 自動検証：
  - `tests/uebung11.cjs`（Python実行および契約チェック）：PASS
  - `git diff --check`：PASS
  - Playwright実レンダリングテスト：環境制約（ブラウザバイナリ未配備）のため NOT RUN。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでのDeutsche Übung 1.1のモデル音声再生、地域変種切り替え、Autoplay動作確認。

# 前回のリレー状態 — Deutsche Übung 1.1 新規実装完了

- 更新日時：2026-11-08T20:45:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Deutsche Übung 1.1: ドイツ語練習ページ新設（前置詞nach/in/zum/zur・ドイツ語地域変種DE/AT/CH対応・評価および補足バッジ・Copy my sentences実装） ／ `f8b06d8f9f65c514488da423a18545b454d45e6b` ／ `main`
- 実装内容：
  1. **ページ本体とドリルデータの実装（`uebung1.1.html`, `uebung1.1.js`）**:
     - 既存の日本語練習ページ構造（`practice1.1.html` 等）を踏襲し、Drill 1（nach）、Drill 2（in + Akkusativ）、Drill 3（zum）、Drill 4（zur）の4ドリル（各Ex 1問＋Drill 3問）を構築。
     - 日本語特有の設定（漢字/ひらがな、文体）を排し、ドイツ語地域変種（DE, AT, CH）セグメントコントロールを標準配備。
     - ヒントモード（OFF, Hover, Display）、Autostop、Autoplay、音声選択を既存共通仕様に準拠して実装。
  2. **地域変種（German Variety DE / AT / CH）と地域評価ロジック**:
     - Drill 4 Item 3（die Schule / gehen）において、`Ich gehe zur Schule.` および `Ich gehe in die Schule.` の両文を正解（Valid）として判定。
     - 選択中の地域（DE: zur Schule, AT: in die Schule, CH: zur Schule）の推奨文と異なる許容文を発話した際、正解 ✅ を付与しつつ、選択中地域の推奨文を補足バッジ（`.uebung-supplement-badge`）として提示。
     - 地域変種切り替え時に、全ドリルのExampleおよびDrillのモデル文、ヒント、および現在表示結果の推奨文を即座に更新。
  3. **音声合成（TTS）と音声認識（STT）**:
     - 音声認識（STT）は選択地域タグ（`de-DE`, `de-AT`, `de-CH`）を自動設定。
     - 音声合成（TTS）は選択地域ロケール（`de-AT`, `de-CH`）の音声を優先探索。未検出時は安易に無断代替（無言フォールバック）せず、UI上に透過的な案内（`#voiceRegionNotice`）を表示して端末状態を明示。
     - 共通音声管理モジュール `drill-audio-session.js` と連携し、再生・録音の相互排他制御を保証。
  4. **「Copy my sentences」機能**:
     - 各ドリルのカード3直下に右寄せ配置。Lucide標準 `clipboard` SVGアイコン、ボタンテキスト `Copy my sentences`、説明文 `Copy your drill results to review or share.`。
     - クリック時に当該ドリルの学習者発話結果（STT生認識テキスト）をローカル日時ヘッダー付きでクリップボードへコピー。
  5. **ナビゲーションとスタイルの統合**:
     - `index.html` に「Deutsche Übung 1.1: nach / in / zum / zur」へのリンクを追加。
     - `style.css` にスコープ付きスタイル（`.uebung11-page` 配下）を追加。
  6. **テストと検証**:
     - `tests/uebung11.cjs` を新設し、`tests/README.md` にテスト内容を文書化。
     - 全ファイル構文検査、正規化判定ロジック検証、地域変種推奨／許容マトリクス検証を実施し合格。
- 変更ファイル：`uebung1.1.html` (新規), `uebung1.1.js` (新規), `tests/uebung11.cjs` (新規), `index.html`, `style.css`, `tests/README.md`, `docs/PROJECT_SPEC.md`, `docs/HANDOVER.md`
- スコープ厳守：Deutsche Übung 1.1新設のみ。既存の日本語ドリル14ページの教材文・ロジック・スタイル等への不要な干渉・改変は一切なし。
- 自動検証：
  - Pythonスクリプトによる全修正ファイルの構文・括弧・タグ対照整合性チェックPASS。
  - 地域変種評価ロジック（DE/AT/CH × zur Schule / in die Schule / 不正解文）の全組み合わせ自動テストPASS。
  - `git diff --check` 合格（空白・構文エラーなし）。
  - ブラウザバイナリ未配備のため、Playwright実レンダリングテストは環境制約により NOT RUN（結果を詐称せず明示）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでのDeutsche Übung 1.1の表示、地域変種切替（DE/AT/CH）、音声合成・録音認識、Drill 4 Item 3の補足バッジ表示、Copy my sentencesの動作確認。

# 前回のリレー状態 — F6: サイト全域のYes/No (Y/N) アイコン・ボタン標準化完了

- 更新日時：2026-11-08T20:25:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F6: サイト全体（14ページ）のYes/No (Y/N) アイコン・ボタン外観標準化・共通ヘルパー配備・CSS共通化・仕様書更新 ／ `1279a2f77ddcbaf06fa1a1188fb855e378c894c2` ／ `main`
- 実装内容：
  1. **全14ページのY/N要素棚卸しと分類**:
     - 対象7ページ（Y/N要素あり）: Practice 1.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3
     - 対象外7ページ（Y/N要素なし）: Practice 1.1, 2.1, 2.2, 2.3, Pronunciation 1, Pronunciation 2, Composition 1
  2. **共通ヘルパー（`answer-icons.js`）の新規作成**:
     - Practice 7.1の承認済み実装（commit `0cbc5a1`, `e0d2ec3`）を忠実に踏襲し、目なしのLucide smile（肯定）およびfrown（否定）SVG（20×20px）を提供する `window.AnswerIcons` を新設。
     - `AnswerIcons.create(kind, inline = false)`: SVG要素（未選択色）またはインラインラッパー（`.yn-inline-icon.p71-inline-icon`）を生成。
     - `AnswerIcons.createExampleLabel(kind)`: DocumentFragment（`🔊` ＋ インラインSVG）を生成し、Example音声ボタンで統一利用可能に。
  3. **共通スタイルシート（`style.css`）の統合**:
     - 従来のレガシー青色スタイル（`#bae6fd`）を撤去し、Practice 7.1で承認済みのクールグレー配色（ライト `#E5E7EB` / border `#d1d5db`、ダーク `#374151` / border `#4b5563`）を共通化。
     - 未選択アイコンストローク色：Yesは緑（ライト `#16a34a`、ダーク `#4ade80`）、Noは赤（ライト `#dc2626`、ダーク `#f87171`）。
     - 選択時（アクティブ）配色：Yesは緑（ライト `#4ade80` / `#14532d`、ダーク `#14532d` / `#bbf7d0`）、Noは赤（ライト `#fca5a5` / `#7f1d1d`、ダーク `#7f1d1d` / `#fecaca`）。
     - アウトライン：`2px solid #64748b`（ダーク `2px solid #94a3b8`）、offset 1px。
  4. **対象ドリルページの実装更新**:
     - **Practice 7.2**: `button` でNode型ラベルをサポート。Example 1音声ボタン（`🔊🙆`/`🔊🙅`）を `AnswerIcons.createExampleLabel` に置換、Drill 2説明文のインラインアイコンおよびDrill 2回答選択ボタンを `AnswerIcons.create` に置換。
     - **Practice 7.3**: `button` でNode型ラベルをサポート。Example 1音声ボタンを `AnswerIcons.createExampleLabel` に置換、Drill 2説明文および回答選択ボタンを `AnswerIcons.create` に置換。
     - **Practice 8.1**: `button` でNode型ラベルをサポート。Example 2音声ボタンを `AnswerIcons.createExampleLabel` に置換、Drill 2回答選択ボタンを `AnswerIcons.create` に置換。
     - **Practice 8.2**: `button` でNode型ラベルをサポート。Example 3音声ボタンを `AnswerIcons.createExampleLabel` に置換、Drill 3回答選択ボタンを `AnswerIcons.create` に置換。
     - **Practice 8.3**: `button` でNode型ラベルをサポート。Drill 1〜4回答選択ボタンを `AnswerIcons.create` に置換。
     - **Practice 1.2**: `node` および `button` でNode型コンテンツをサポート。Drill 1説明文、Example 1音声ボタン、Drill 1回答選択ボタン（青色ハードコード背景スタイル撤去）を `AnswerIcons` に置換。
     - **Practice 7.1**: `answer-icons.js` をリンクし、共通CSSとの整合性を維持。
  5. **テストファイルの適合更新**:
     - `tests/practice81.cjs`, `tests/display-size.cjs`, `tests/answer-rules.cjs`, `tests/listen-help.cjs`, `tests/README.md` において、旧絵文字依存のセレクタ・期待値を新Lucideアイコン／`data-answer`属性へ適合させ、かつ後方互換性を維持。
  6. **仕様書更新**:
     - `docs/UI_LAYOUT_SPEC.md` に「Yes/No (Y/N) ボタンおよびアイコンの共通標準仕様（2026-11-08確定、F6標準化）」を追加明文化。
- 変更ファイル：`answer-icons.js` (新規), `style.css`, `practice1.2.html`, `practice1.2.js`, `practice7.1.html`, `practice7.2.html`, `practice7.2.js`, `practice7.3.html`, `practice7.3.js`, `practice8.1.html`, `practice8.1.js`, `practice8.2.html`, `practice8.2.js`, `practice8.3.html`, `practice8.3.js`, `tests/practice81.cjs`, `tests/display-size.cjs`, `tests/answer-rules.cjs`, `tests/listen-help.cjs`, `tests/README.md`, `docs/UI_LAYOUT_SPEC.md`, `docs/HANDOVER.md`
- スコープ厳守：F6 Y/N標準化のみ。F1（音声セッション）、F4（Lato）、F5（Example破線）、F7（疑問文インジケーター）、F8（話者間隔）、教材問題文・学習データ等は一切変更なし。
- 自動検証：
  - Pythonスクリプトによる全修正ファイルの構文・括弧・タグ対照整合性チェックPASS。
  - `git diff --check` 合格（空白・構文エラーなし）。
  - ブラウザバイナリ未配備のため、Playwright実レンダリングテストは環境制約により NOT RUN（結果を詐称せず明示）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの各ページ（1.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3）におけるY/Nボタン・Example音声ボタン・説明文アイコンのLucide表示、クールグレー未選択色、緑/赤アクティブ配色、ダークモード表示の確認。

# 前回のリレー状態 — F4: サイト全域のLatin UIタイポグラフィLato標準化完了

- 更新日時：2026-11-08T19:42:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F4: サイト全体（14ページ）のLatin-script UIテキストのLatoフォント標準化・フォント読込補完・日本語フォント保全・仕様書更新 ／ `3f59c7e995138f2958493da1421fbc135addadd8` ／ `main`
- 実装内容：
  1. **全14ページのフォント読込棚卸しと統一**:
     - 調査結果：LatoフォントをHTMLで読み込んでいたのは5ページ（1.1, 7.3, 8.1, 8.2, 8.3）のみで、9ページ（1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 8.3の一部ウェイト, Pronunciation 1, Pronunciation 2, Composition 1）で未読み込みまたはウェイト不足を確認。
     - 補完：全14ドリルページのHTML `<head>` に Google Fonts Lato（`wght@400;500;700`）の事前接続（`preconnect`）およびスタイルシートリンクを標準配備。
     - スタイルシート参照のキャッシュバスターを `style.css?v=20261108-lato-standard` に更新。
  2. **共通スタイルシート（`style.css`）の一元化**:
     - `:root` に `--font-latin: 'Lato', sans-serif;` を定義。
     - セット切替ボタン：`.p21-drill1 > .p21-set-switcher .example-button`, `.p21-set-switcher-latin .example-button`, 各 `data-set-state`（namingSet, describeSet, peopleConversationSet, umbrellaModeSet, cityDrillSet, whereDrillSet, cityDialogueSet）、および Practice 8.3 のセットボタンに `--font-latin` を適用。
     - セグメント制御：`.segmented-control .segmented-option`（With漢字, Hiragana Only, Formal, Informal, Casual）。
     - 設定スイッチ：`.settings-onoff .mode-label`, `.settings-onoff .slider::after`（Autostop, Autoplay, ON, OFF）。
     - ドロップダウン・設定入力：`.custom-select`, `.custom-input`, `.voice-select`, `.voice-guide-footer label`。
     - 英語キュー関連：`.drill-cue-panel .drill-cue-button`, Composition 1 の `.composition1-page .drill-cue-cell` / `.composition-table .drill-cue-cell`, `.vocab-inline`, `.p81-cue-english`, `.example-model-translation`, `.p82-translation-text`。
     - 英語見出し・案内：`.info-panel-title`, `.info-panel-desc`, `.pitch-lab-title`, `.pitch-lab-description`, `.instruction-line`, `.voice-recommend-note`。
     - ツールチップ：`.custom-tip-box`, `.custom-tip-box-inline`。
     - バッジ・Drawer：`:is(.tense-badge, .p73-tense)`, `.practice7-page :is(.p71-copy-button, .p72-copy-button)`, `.behind-the-cues-btn`, `.cues-drawer-title`, `.cues-drawer-lead`, `.cues-drawer-section h4`。
  3. **日本語フォントの保全と混在ラベルの分離**:
     - 日本語のみのセットボタン（P2.1 D3の「辞書」「さいふ」等）は変更せず、元の日本語フォント設定を完全に維持。
     - Practice 8.3 の日英混在セットボタン（`だれ (Who)` 等）は、DOM分割・再構成を行わず、CSSフォントフォールバック（`'Lato', sans-serif`）により英語部分のみLatoで描画し、日本語部分は既存の日本語フォント設定を完全に維持。キュー文セル（`.drill-cue-cell`）も同様にフォールバックを活用し、英語キュー有効時のみLatoが適用され日本語キュー時は日本語フォントを維持。
     - `practice2.1.js` および `practice2-next.js` の `setButtons` において、英字を含むボタン群に `p21-set-switcher-latin` クラスを自動付与。
  4. **共通仕様書の更新**:
     - `docs/UI_LAYOUT_SPEC.md` に「共通ラテン文字タイポグラフィ（Lato標準化・2026-11-08確定）」を新設・承認文書化。
- 変更ファイル：`style.css`, `practice2.1.js`, `practice2-next.js`, `practice8.3.js`, `practice1.1.html`, `practice1.2.html`, `practice2.1.html`, `practice2.2.html`, `practice2.3.html`, `practice7.1.html`, `practice7.2.html`, `practice7.3.html`, `practice8.1.html`, `practice8.2.html`, `practice8.3.html`, `pronunciation1.html`, `pronunciation2.html`, `composition1.html`, `docs/UI_LAYOUT_SPEC.md`, `docs/HANDOVER.md`
- スコープ厳守：F4 タイポグラフィ標準化のみ。音声制御（F1）、選択遅延（F3）、Example境界線（F5）、Y/Nアイコン（F6）、疑問文インジケーター（F7）、話者間隔（F8）、教材問題文・学習データ等は一切変更なし。
- 自動検証：
  - HTMLパーサーによる全14ファイルの構文検証PASS。全ファイルでのLato読込・キャッシュバスター設定を確認。
  - `style.css` ブロック対照整合性チェックPASS（1444ブロック整合）。
  - `git diff --check` 合格（空白・構文エラーなし）。
  - ブラウザバイナリ未配備のため、Playwright実レンダリングテストは環境制約により NOT RUN（結果を詐称せず明示）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの各ページにおける英字UI（セットボタン、セグメント、英語キュー、見出し等）のLatoフォント適用、および日本語フォントの維持状態の確認。

# 前回のリレー状態 — F1: サイト全域の音声セッション競合調査・最小安全修正完了

- 更新日時：2026-11-08T19:20:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F1: サイト全体（14ページ）の音声セッション競合調査と Practice 7.2 等の録音・再生中断不具合の最小安全修正 ／ `da43795d7cb1777ff40c1318f9c16d4485710ae0` ／ `main`
- 実装内容：
  1. **不具合根本原因の特定**:
     - **共通マネージャー（`drill-audio-session.js`）**:
       - `DrillAudio.play(audio)` が再生中 `Audio` オブジェクトの参照（`activeAudio`）を一元保持していなかったため、`invalidatePlayback()` が呼ばれた際にリレー以外の再生中音声（▶️ボタン等）の停止や `currentTime = 0` / `src = ''` へのリセットが完全に行われず、OS音声バッファや非同期再生Promiseとの競合が発生していた。
       - `invalidatePlayback()` や `getUserMedia()` が `speechSynthesis.cancel()` のみを呼んでおり、Chromium等のブラウザで音声キューがロックされた際に `cancel()` が無視される既知の不具合に対して、`speechSynthesis.pause()` を前置する「Pause-then-Cancel」イディオムが適用されていなかった。
       - `getUserMedia()` の中で `speaking` ループが最長2000msで `PlaybackStopError` を投げていたため、ブラウザの `speaking` フラグが解除されない場合に新規録音の開始自体が遮断されていた（"Playback is still stopping..." 表示）。
     - **個別13ページにおける `AbortError` 時のロック残存（`startingRow` / `preparing` リーク）**:
       - 13ページ（Practice 1.1, 1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, Pronunciation 2, Composition 1）において、`DrillAudio.getUserMedia` の catch ブロックで `if (error.name === "AbortError") return;` が `startingRow = null`（または `preparing = false`）の初期化処理の前に置かれていた。このため、行の切り替えや再生中断等で `AbortError` が発生すると `startingRow` が `true` のまま残存し、`adapter.busy()` が恒久的にロックされ、以後の「とる」クリックが `control(event)` で完全に破棄される致命的バグが存在していた。
     - **個別ページの `stopAllPlayback()` / `stopPlayback()`**:
       - `speechSynthesis.pause()` の前置漏れと、`currentPlayingAudio` の `currentTime = 0` / `src = ""` クリーンアップ漏れ。
  2. **最小安全修正**:
     - `drill-audio-session.js`:
       - `activeAudio` 変数および `stopAudio(audio)` / `cancelSpeech()` ヘルパーを新設。
       - `DrillAudio.play(audio, onError)`: 前回の `activeAudio` を確実に完全停止し、今回の `audio` を登録。完了・エラー・ステージ破棄時に参照を自動解除。
       - `DrillAudio.speak(utterance)`: 発話開始前に `activeAudio` を停止し、`cancelSpeech()` を実行。
       - `DrillAudio.invalidatePlayback()`: `activeAudio` および `relay.audio` を完全停止（pause、currentTime=0、src=''、コールバック解除）し、`cancelSpeech()` を実行。
       - `DrillAudio.getUserMedia(options)`: マイク取得処理の入口で `activeAudio` / `relay.audio` を完全停止し、`cancelSpeech()` を実行。`speaking` ループのタイムアウト時には再度 `cancelSpeech()` してループを抜け、録音開始を不当に阻害しないよう改善。
     - 13ページ（Practice 1.1, 1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, Pronunciation 2, Composition 1）:
       - `catch (error)` 内で `startingRow = null`（または `preparing = false`, `p2.pending = false`, `compositionState.starting = null`）と UI 同期（`syncUI()`）を `if (error.name === "AbortError") return;` の前に実行するように修正。
       - 全14ページの `stopAllPlayback()` / `stopPlayback()` において、`speechSynthesis.pause(); speechSynthesis.cancel();` を適用し、再生中 `Audio` の `currentTime = 0; src = "";` を確実に実行。
  3. **データ保全の維持**:
     - 録音済みURL（`audioUrls`）、音声認識結果（`rawTranscript`）、正誤判定、各入力フィールドは一切破棄せず完全保持。
- 変更ファイル：`drill-audio-session.js`, `practice7.2.js`, `practice7.1.js`, `practice7.3.js`, `practice8.1.js`, `practice8.2.js`, `practice8.3.js`, `practice1.1.js`, `practice1.2.js`, `practice2.1.js`, `practice2-next.js`, `composition1.js`, `pronunciation1.js`, `pronunciation2.js`, `docs/HANDOVER.md`
- スコープ厳守：F1 音声競合修正のみ。UIレイアウト、フォント、問題文、CSSスタイル、F3/F4/F6/F7/F8等の他タスクへの変更は一切なし。
- 自動検証：
  - Python静的構文チェック全14ファイルPASS。
  - `git diff --check` 合格（空白・構文エラーなし）。
  - ブラウザバイナリ未配備のため、Playwrightテストは環境制約により NOT RUN（結果を詐称せず明示）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Practice 7.2（および他ページ）における、モデル音声再生中・録音ファイル再生中・連続再生（リレー）中に別行の「とる」をクリックした際の即座な音声中断と新規録音開始の確認。

# 前回のリレー状態 — F8: Practice 2.3 話者・導入文間スペーシング調整完了

- 更新日時：2026-11-08T18:41:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F8: Practice 2.3 Example 1 における話者ラベルX/Yと導入文間の余白ピンポイント修正 ／ `8abcf8d57fe4edd5ccd01bd33b4639b3e964a74b` ／ `main`
- 実装内容：
  1. **確認されたCSS Grid構造と原因**:
     - `.practice-next-page .p23-conversation-models` は4列グリッド（列1: 話者ラベル `X`/`Y`、列2: キュー、列3: 音声ボタン、列4: モデル文）。
     - 導入文行（Line 1: わたしは日本です、Line 3: わたしはイギリスです、Line 6: Zさんはアメリカです）では、`.p23-model-intro` が `grid-column: 2 / -1` を占有。
     - 既存のグローバル列ギャップ `gap: 8px 6px` により、列1の話者ラベルと列2から始まる導入文との物理間隔が 6px のみとなっており、ラベルと文頭が近接する不具合が発生。
  2. **ピンポイント修正（`style.css`）**:
     - `.p23-conversation-models .p23-model-intro` に `padding-left: 4px;` を追加。
     - これにより、既存の列ギャップ 6px ＋ padding 4px で、話者ラベルと導入文テキストとの間に**意図通りの合計 10px の実効スペーシング**を確保（※実機レンダリングでの計算値であり、ブラウザ実測値としては未計測）。
     - グリッドの全体列ギャップ（`gap: 8px 6px`）、キュー幅計算（`--p23-example-cue-width`）、音声ボタン列、モデル回答列（列4）の配置・位置関係は完全不変。
  3. **キャッシュバスター更新（`practice2.3.html`）**:
     - `practice2.3.html` のスタイルシート参照を `style.css?v=20261108-p23-intro-spacing` に更新。
- 変更ファイル：`style.css`, `practice2.3.html`, `docs/HANDOVER.md`
- スコープ厳守：F8のみ。F1、F3、F4、F6等の他タスクやPractice 2.1、2.2、8.x等への変更なし。
- 自動検証：
  - Python静的構文チェック、HTML/CSSセレクタ検証全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Practice 2.3 Example 1 の X/Y と導入文頭（わたしは…）の余白確認（デスクトップ・375pxモバイル）。

# 前回のリレー状態 — F5: Example発話行間のグレー点線撤去完了

- 更新日時：2026-11-08T18:37:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F5: Example発話行間のグレー点線区切り線撤去（サイト全体承認済み仕様） ／ `7101cfb49181da4ec551b4852e93dac768985bc0` ／ `main`
- 実装内容：
  1. **サイト全体共通設計原則の確立**:
     - Exampleセクション内の発話行（Q/A行、Affirmative/Negative行、Tense比較行など）の間を区切るグレー点線（dotted/dashed border）を全廃。
     - 行間は共通バーティカルリズムトークン（`--example-row-gap: 8px`、`row-gap`、`padding-top`）による自然な余白で整列・分離を維持。
  2. **共通スタイル（`style.css`）修正**:
     - `.drill-example-table > tbody > tr + tr > td`（行384付近）: `border-top: 1px dashed var(--border-color);` を削除。
     - `.practice12-page .drill-example-table > tbody > tr + tr`（行2155付近）: `border-top: 1px dashed var(--border-color);` を削除。
  3. **個別ページ修正（`practice1.1.js` / `practice1.1.html`）**:
     - `practice1.1.js`: Example内のNegative発話行のラッパーから `dashed-border` クラスを削除（`class="flex-row-center"` に修正）。
     - `practice1.1.html`: スクリプト配信識別子およびスタイルシート参照を `practice1.1.js?v=20261108-no-example-separators`、`style.css?v=20261108-no-example-separators` に更新。
  4. **保持・非対象（意図的に変更しなかった要素）**:
     - Exampleボックス自体の外枠・ヘッダー装飾（`.example-box` の黄色/オレンジ境界線・バッジ）。
     - Drill本体の設問テーブル区切り線（`practice7.1.js` の `tr2.style.borderTop` は Drill 1 設問行のため保持）。
     - Practice 8.3 Example内のカテゴリ／セット大区切り線（`.p83-example-divider` はだれ/何等のセット区分線のため保持）。
     - 単語ヒントの点線（`.tooltip-wrap` の下点線）。
- 変更ファイル：`style.css`, `practice1.1.js`, `practice1.1.html`, `docs/HANDOVER.md`
- スコープ厳守：F5のみ。F1、F3、F4、F6、F8等の他タスクや録音・再生ロジックは一切変更なし。
- 自動検証：
  - Python静的構文チェック、CSSセレクタ検証、HTML/JSスクリプト読込順検証全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Example 内発話行間の外観確認（点線撤去・余白保持）。

# 前回のリレー状態 — 疑問文インジケーター全展開完了（Practice 8.1 / 8.2 / 8.3 / Composition 1）

- 更新日時：2026-11-08T18:18:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 8.1, 8.2, 8.3 および Composition 1 疑問文インジケーター（Lucide `message-circle-question`）最終展開 ／ `fc6c83ee3fb52e308946fda1ccba0f02a6dcee6b` ／ `main`
- 実装内容：
  1. **共有ヘルパー（`question-indicator.js`）および共通スタイル（`style.css`）の再利用**:
     - 既存の Lucide `message-circle-question`、16×16px、`var(--text-secondary)`、非対話（`aria-hidden="true"`, `pointer-events: none`）、停止ボタン直後 4px（`.stop-indicator-wrap`）を全ページ共通で使用。
  2. **対象ページと疑問文スロット内訳（今回バッチ計 66 箇所、サイト全体計 157 箇所）**:
     - **Practice 8.1（4 箇所）**:
       - Drill 2: 4（`r.qa === 'question'` の質問行のみ付与、回答行 `r.qa === 'response'` は非付与）
       - Drill 1, 3, 4, 5, Example: 0
     - **Practice 8.2（20 箇所）**:
       - Drill 1: 4（`mode === 'question'`、何か疑問文）
       - Drill 2: 8（`mode === 'contrast'`、何を／何か対比疑問文：4ペア×2）
       - Drill 3: 5（`qa === 'question'`、Yes/No疑問文行のみ付与、回答行は非付与）
       - Drill 4: 3（`mode === 'wh'` / `qa === 'question'`、どんな疑問文行のみ付与、回答行は非付与）
       - Drill 5, Example: 0
     - **Practice 8.3（全代替セット含め 40 箇所）**:
       - 各アイテムの q1 行・q2 行（`r.id.endsWith('-q1') || r.id.endsWith('-q2')`）に付与、回答行 a（`r.id.endsWith('-a')`）は非付与。
       - Drill 1: だれ (4) + 何 (4) = 8
       - Drill 2: だれ (6) + 何 (6) = 12
       - Drill 3: どれ (4) + どこ (4) = 8
       - Drill 4: どれ (4) + どこ (4) + いつ (4) = 12
       - デフォルト表示時: 4 + 6 + 4 + 4 = 18。全セット合計: 8 + 12 + 8 + 12 = 40。
       - Example: 0
     - **Composition 1（2 箇所）**:
       - Drill 1 第5行（`en: "Don't you have time?"`）: 1（`question: true`）
       - Drill 1 第6行（`en: "Is the weather bad?"`）: 1（`question: true`）
       - 他の Drill 1 行（平叙文 6行）および Drill 2（自由練習 1行）: 0
       - 判定条件: `Boolean(item?.question)` で明示的に判定し、録音停止ボタン直後に `.stop-indicator-wrap` で付与。
       - `composition1.html` に `<script src="question-indicator.js?v=20261108"></script>` を追加し、スクリプトバージョンを `composition1.js?v=20261108-question-indicator` に更新。
     - **サイト全体インベントリ（157 箇所）**:
       - 既実装分（91）: P1.1 (0) + P1.2 (8) + P2.1 (13) + P2.2 (24) + P2.3 (23) + P7.1 (5) + P7.2 (5) + P7.3 (13) = 91
       - 本バッチ分（66）: P8.1 (4) + P8.2 (20) + P8.3 (40) + Comp1 (2) = 66
       - 総計: 91 + 66 = 157 箇所。
  3. **回帰テスト（`tests/question-indicator.cjs`）**:
     - Practice 8.1（4）、Practice 8.2（20）、Practice 8.3（40）、Composition 1（2、第5・第6行検証）のアサーションを追加。
- 変更ファイル：`composition1.html`, `composition1.js`, `tests/question-indicator.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Composition 1 およびテスト・引き継ぎ文書のみ。既存の Practice 1.x, 2.x, 7.x, 8.x および共通音声制御・UIへの変更なし。
- 自動検証：
  - Python静的構文チェック、HTML/JSスクリプト読込順検証、行生成パス検証全件PASS（計66スロットおよびサイト全体157スロット整合確認）。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Composition 1（行5・6の疑問文アイコン表示・整列・録音）の実機確認。

# 前回のリレー状態 — Practice 8.1 / 8.2 / 8.3: 疑問文インジケーター一括実装

- 更新日時：2026-11-08T18:10:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 8.1, 8.2, 8.3 疑問文インジケーター（Lucide `message-circle-question`）一括実装 ／ `e2c9e5218d6b88015cf0154be8ce4fe2febe8855` ／ `main`
- 実装内容：
  1. **共有ヘルパー（`question-indicator.js`）および共通スタイル（`style.css`）の再利用**:
     - 既存の Lucide `message-circle-question`、16×16px、`var(--text-secondary)`、非対話（`aria-hidden="true"`, `pointer-events: none`）、停止ボタン直後 4px（`.stop-indicator-wrap`）をそのまま使用。
  2. **Practice 8.1（合計 4 箇所）**:
     - Drill 1: 0（平叙文対比）
     - Drill 2: 4（`r.qa === 'question'` の質問行のみ付与、回答行 `r.qa === 'response'` は非付与）
     - Drill 3: 0（他者の得意・苦手平叙文）
     - Drill 4: 0（強度平叙文）
     - Drill 5: 0（形容詞比較）
     - Example: 0
  3. **Practice 8.2（合計 20 箇所）**:
     - Drill 1: 4（`mode === 'question'`、何か疑問文）
     - Drill 2: 8（`mode === 'contrast'`、何を／何か対比疑問文：4ペア×2）
     - Drill 3: 5（`qa === 'question'`、Yes/No疑問文行のみ付与、回答行は非付与）
     - Drill 4: 3（`mode === 'wh'` / `qa === 'question'`、どんな疑問文行のみ付与、回答行は非付与）
     - Drill 5: 0（English Cues パネル）
     - Example: 0
  4. **Practice 8.3（全代替セット含め合計 40 箇所）**:
     - 各アイテムの q1 行・q2 行（`r.id.endsWith('-q1') || r.id.endsWith('-q2')`）に付与、回答行 a（`r.id.endsWith('-a')`）は非付与。
     - Drill 1: だれ (4) + 何 (4) = 8
     - Drill 2: だれ (6) + 何 (6) = 12
     - Drill 3: どれ (4) + どこ (4) = 8
     - Drill 4: どれ (4) + どこ (4) + いつ (4) = 12
     - デフォルト表示時: 4 + 6 + 4 + 4 = 18。全セット合計: 8 + 12 + 8 + 12 = 40。
     - Example: 0
  5. **3ページ総計**: **64** 箇所（8.1: 4 + 8.2: 20 + 8.3: 40）。
  6. **HTMLファイル更新**:
     - `practice8.1.html`, `practice8.2.html`, `practice8.3.html` に `<script src="question-indicator.js?v=20261108"></script>` を追加。
     - スクリプト配信識別子を `practice8.1.js?v=20261108-question-indicator`、`practice8.2.js?v=20261108-question-indicator`、`practice8.3.js?v=20261108-question-indicator` に更新。
  7. **回帰テスト（`tests/question-indicator.cjs`）**:
     - Practice 8.1（4）、Practice 8.2（20）、Practice 8.3（セット切替時検証含む 40 枠）のテストケースを追加。
- 変更ファイル：`practice8.1.html`, `practice8.1.js`, `practice8.2.html`, `practice8.2.js`, `practice8.3.html`, `practice8.3.js`, `tests/question-indicator.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 8.1, 8.2, 8.3 のみ対象。Practice 1.x, 2.x, 7.x, Composition 1, 無関係なCSS/機能への変更なし。
- 自動検証：
  - Python静的構文チェック、HTML/JSスクリプト読込順検証、行生成パス検証全件PASS（計64スロット整合確認）。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Practice 8.1（4）、Practice 8.2（20）、Practice 8.3（40スロット）の表示・整列・録音状態遷移の確認。
  - ユーザー確認後、他ページ（Composition等）への展開検討。

# 前回のリレー状態 — Practice 7.1 / 7.2 / 7.3: 疑問文インジケーター実装

- 更新日時：2026-11-08T17:55:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 7.1, 7.2, 7.3 疑問文インジケーター（Lucide `message-circle-question`）実装 ／ `887751a37c9569429d20c5418b76c8bb82d338f0` ／ `main`
- 実装内容：
  1. **共有ヘルパー（`question-indicator.js`）および共通スタイル（`style.css`）**:
     - `style.css` に `.stop-indicator-wrap > button { margin-right: 0 !important; }` を追加し、ボタン固有の margin とラップ要素の gap: 4px の重複を防止（停止ボタン直後 4px の間隔を厳格に保持）。
  2. **Practice 7.1（合計 5 箇所）**:
     - Drill 1: 0（過去・現在完了習慣平叙文）
     - Drill 2: 5（今～ていますか疑問文行 `kind === 'q'` に付与、回答行 `kind === 'a'` には非付与）
     - Drill 3–4: 0（英語キュー・復習パネル）
     - Example: 0
     - 既存の Y/N Smile/Frown アイコンおよび Cool-Gray 背景（#E5E7EB）は完全維持。
  3. **Practice 7.2（合計 5 箇所）**:
     - Drill 1: 0（平叙文）
     - Drill 2: 5（過去進行疑問文行 `kind === 'q'` に付与、回答行 `kind === 'a'` には非付与）
     - Drill 3: 0
     - Example: 0
     - 既存の音声再生・録音ライフサイクルは完全維持（中断問題の個別修正は行わず維持）。
  4. **Practice 7.3（合計 13 箇所）**:
     - 2系統の録音行生成経路の両方に `window.QuestionIndicator.attach` を接続：
       - 経路1（`sections.forEach` 内、L1336 付近）：`model(r)` に明示的 `question` プロパティ（`r.label === 'Q:'`）を追加し、`Boolean(r.question)` で判定。Drill 1（平叙文）= 0、Drill 3（何をしていましたか）= 3、Drill 4（いつまで）= 5。
       - 経路2（`qa73` 内、L2560 付近）：`kind === 'q'` で判定。Drill 2（Yes/No 過去進行）= 5。
       - Drill 5: 0（English Cues パネル）
       - Example: 0
     - 合計: 0 + 5 + 3 + 5 + 0 = 13 箇所。
  5. **3ページ総計**: **23** 箇所（7.1: 5 + 7.2: 5 + 7.3: 13）。
  6. **HTMLファイル更新**:
     - `practice7.1.html`, `practice7.2.html`, `practice7.3.html` に `<script src="question-indicator.js?v=20261108"></script>` を追加。
     - スクリプト配信識別子を `practice7.1.js?v=20261108-question-indicator`、`practice7.2.js?v=20261108-question-indicator`、`practice7.3.js?v=20261108-question-indicator` に更新。
  7. **回帰テスト（`tests/question-indicator.cjs`）**:
     - Practice 7.1（5）、Practice 7.2（5）、Practice 7.3（13）の件数、Example/Answer行非表示、ラッパー完全性、7.1 Y/N アイコン不変性、再レンダリング時の重複防止をテストに追加。
- 変更ファイル：`practice7.1.html`, `practice7.1.js`, `practice7.2.html`, `practice7.2.js`, `practice7.3.html`, `practice7.3.js`, `style.css`, `tests/question-indicator.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 7.1, 7.2, 7.3 のみ対象。Practice 8.x, Composition への展開は未実施。Practice 2.1–2.3 は未変更。
- 自動検証：
  - Python静的構文チェック、HTML/JSスクリプト読込順検証、行生成パス検証全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Practice 7.1（5）、Practice 7.2（5）、Practice 7.3（13）の表示・整列・録音状態遷移の確認。
  - ユーザー確認後、他ページへの適用検討および共通仕様書への反映。

# 前回のリレー状態 — Practice 2.1 / 2.2 / 2.3: 疑問文インジケーター一括実装

- 更新日時：2026-11-08T17:25:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 2.1, 2.2, 2.3 疑問文インジケーター（Lucide `message-circle-question`）一括実装 ／ `30eede101dfeb0863c635e6b8bab79292f3359ba` ／ `main`
- 実装内容：
  1. **共有ヘルパー（`question-indicator.js`）の適用**:
     - `practice2.1.js` および `practice2-next.js` の `recordingRow` に `isInterrogative = false` 引数を追加し、`window.QuestionIndicator.attach(stopBtn, isInterrogative)` を呼び出し。
     - 記号（`?` や `か`）や Q ラベルからの推測を排し、各ドリル・各セットの文型生成ロジックから明示的に真偽値を渡す設計を徹底。
     - 録音停止ボタン直後に 16×16px Lucide `message-circle-question`（`var(--text-secondary)`）を配置。`.stop-indicator-wrap` により狭小幅（375px）でも停止ボタンと行分離しないアトミック構造を保持。
  2. **Practice 2.1（合計 13 箇所）**:
     - Drill 1: Set 1（平叙文発話）= 0、Set 2（対話練習・X疑問文）= 3
     - Drill 2: Set 1 = 3、Set 2 = 3（X「これは何ですか」疑問文）
     - Drill 3: Set 1 = 2、Set 2 = 2（「〜さんのスマホ／辞書／財布はどれですか」疑問文）
     - Drill 4: English Cues パネル = 0
     - 初期表示件数: 5（D1: 0 + D2: 3 + D3: 2）、Example・回答行は 0。
  3. **Practice 2.2（合計 24 箇所）**:
     - Drill 1: Both sets（名詞＋価格平叙文）= 0
     - Drill 2: Set 1 = 3、Set 2 = 3（X「いくらですか」疑問文）
     - Drill 3: Set 1 = 3、Set 2 = 3（X「どの〜が〜ですか」疑問文）
     - Drill 4: Set 1 = 3、Set 2 = 3（X「だれですか」「どの人ですか」疑問文）
     - Drill 5: Set 1 = 3、Set 2 = 3（「どのかさ／どれですか」疑問文）
     - English Cues パネル = 0
     - 初期表示件数: 12（D1: 0 + D2: 3 + D3: 3 + D4: 3 + D5: 3）、Example・回答行は 0。
  4. **Practice 2.3（合計 23 箇所）**:
     - Drill 1: Country / Cities / Time（ここ／そこ／あそこ平叙文）= 0
     - Drill 2: People = 3、Item 1 = 4、Item 2 = 4（「どこですか」疑問文）
     - Drill 3: Country = 3、Cities = 3、Time = 3、Day = 3（「どこ」「何時」「何曜日」疑問文）
     - Drill 4: English Cues パネル = 0
     - 初期表示件数: 6（D1: 0 + D2: 3 + D3: 3）、Example・回答行は 0。
  5. **3ページ切替セット総計**: **60** 箇所（2.1: 13 + 2.2: 24 + 2.3: 23）。
  6. **HTMLファイル更新**:
     - `practice2.1.html`, `practice2.2.html`, `practice2.3.html` に `<script src="question-indicator.js?v=20261108"></script>` を追加。
     - スクリプト配信識別子を `practice2.1.js?v=20261108-question-indicator`、`practice2-next.js?v=20261108-question-indicator` に更新。
  7. **回帰テスト（`tests/question-indicator.cjs`）**:
     - Practice 1.1（0）、Practice 1.2（8）に加え、Practice 2.1（5→8）、Practice 2.2（12）、Practice 2.3（6→8→7）の各セット切替テスト、各ドリル件数、Example非表示、ラッパー完全性を自動テストに追加。
- 変更ファイル：`practice2.1.html`, `practice2.1.js`, `practice2.2.html`, `practice2.3.html`, `practice2-next.js`, `tests/question-indicator.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 2.1, 2.2, 2.3 のみ対象。他ページ（7.x, 8.x等）への展開は未実施。全Drill展開や共通仕様書（UI_LAYOUT_SPEC）の確定は行わず一括コミット。
- 自動検証：
  - Python静的構文チェック、HTML/JSスクリプト読込順検証、すべての `recordingRow` 呼出引数（`isInterrogative`）検証全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Practice 2.1（13）、Practice 2.2（24）、Practice 2.3（23）の表示・整列・録音状態遷移の確認。
  - ユーザー確認後、他ページへの適用検討および共通仕様書への反映。

# 前回のリレー状態 — Practice 1.1 / 1.2: 疑問文インジケーター実装（第1段階）

- 更新日時：2026-11-08T16:50:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 1.1 / Practice 1.2 疑問文インジケーター（Lucide `message-circle-question`）の第1段階実装 ／ `e0d2ec31ab763a5ee0e0bf967254678a7f94939b` ／ `main`
- 実装内容：
  1. **共通再利用ヘルパー（`question-indicator.js`）**:
     - `window.QuestionIndicator` を新設。
     - Lucide `message-circle-question`（16×16px、stroke="currentColor"、stroke-width="2"、`aria-hidden="true"`）を生成。
     - `attach(target, isInterrogative)`：明示的な真偽値 `isInterrogative` を受け取り、録音停止ボタン直後に配置。再レンダリング時の重複防止および停止ボタンとの行分離防止のため、`.stop-indicator-wrap` でアトミックにグループ化。
  2. **共通スタイル（`style.css`）**:
     - `.stop-indicator-wrap`：`display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;`。
     - `.question-indicator`：`color: var(--text-secondary); pointer-events: none; user-select: none;`。背景なし・非対話・フォーカス不可。ライト/ダーク両テーマ対応。
  3. **Practice 1.1**:
     - 調査結果を現行コードと照合し、疑問文発話生成行が存在しない（Drill 1〜3は名詞平叙文「XはYです」）ことを確認。
     - 不要なコード変更は行わず、表示インジケーター数：**0**。
  4. **Practice 1.2**:
     - 疑問文発話生成行に明示的フラグ `isInterrogative: true` を渡してインジケーターを付与：
       - Drill 1: 5 問（Q 行に付与、A 行には非付与）
       - Drill 2: 3 問（Q 行に付与、A 行には非付与）
       - 合計: **8** 箇所。Example や応答行には非表示。
     - `<script src="question-indicator.js?v=20261108"></script>` を追加し、スクリプト配信識別子を `practice1.2.js?v=20261108-question-indicator` に更新。
  5. **回帰テスト（`tests/question-indicator.cjs`）**:
     - Practice 1.1（0件）、Practice 1.2（Drill 1: 5件、Drill 2: 3件、計8件）、Example/Answer行非表示、375px幅での停止ボタン同一行保持、設定切替時の重複防止を検証するテストを追加。
- 変更ファイル：`question-indicator.js`, `style.css`, `practice1.2.js`, `practice1.2.html`, `tests/question-indicator.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 1.1 / 1.2 のみ対象。他ページ（7.x, 8.x, 2.x等）への展開は未実施。全Drill展開や共通仕様書（UI_LAYOUT_SPEC）の確定は行わず第1段階完了。
- 自動検証：
  - Python静的構文チェック、XML/SVG妥当性検証、HTML/JS整合性チェック全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの Practice 1.1（0件）および Practice 1.2（Drill 1: 5件、Drill 2: 3件、計8件）の表示・整列・録音状態遷移の確認。
  - ユーザー確認後、他ページへの適用検討および共通仕様書への反映。

# 前回のリレー状態 — Practice 7.1: Y/Nアイコン統一完了（Example 2・Drillタイトル）

- 更新日時：2026-11-08T16:35:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 7.1: Y/Nアイコン完全統一（Example 2 音声ボタン、Drill 2 タイトル説明文） ／ `0cbc5a18651697e0cd5294f98abb4c7369158439` ／ `main`
- 実装内容：
  1. `practice7.1.js`：
     - `createAnswerIcon(kind, inline)` に `inline` オプションを追加。非選択肢のインライン配置時に `<span class="p71-inline-icon" data-answer="${kind}"><svg ...></svg></span>` を生成。
     - **Example 2**: 音声モデル再生ボタン（`🔊🙆`/`🔊🙅`）の絵文字を置換し、`'🔊'` ＋ `createAnswerIcon(kind, true)`（Lucide smile/frown 線画）を配置。`data-answer` および `aria-label` を付与。非対話ボタンであるため Cool-Gray 背景は付与せず通常の音声ボタン背景を保持。
     - **Drill 2 タイトル**: 説明文（`Choose 🙆 or 🙅 and record your answer.`）内の絵文字を `createAnswerIcon('yes', true)` および `createAnswerIcon('no', true)` に置換。見出しテキスト・フォント・余白・レスポンシブ配置を完全維持。
     - **Drill 2 回答ボタン**: 前回コミット（`0cbc5a1`）で導入した Lucide アイコン＋Cool-Gray 背景（#E5E7EB）の設計を完全維持。全3箇所で同一の Lucide smile（緑）/ frown（赤）線画デザイン・同一カラー・同一サイズ（20×20px）に統一完了。旧絵文字 `🙆`/`🙅` は全3箇所から完全に除去。
  2. `practice7.1.html`：
     - `<style>` に `.practice71-page .p71-inline-icon` および `.practice71-page .example-audio-cell .example-button` の整列スタイルを追加。
     - インラインアイコンの配色を Drill 2 回答ボタンと共通化（`:is(.example-button.answer-choice, .p71-inline-icon)[data-answer="yes|no"]`）：ライト（緑 `#16a34a` / 赤 `#dc2626`）、ダーク（緑 `#4ade80` / 赤 `#f87171`）。
     - スクリプト配信識別子を `practice7.1.js?v=20261108-lucide-yn-complete` に更新。
  3. `tests/common-yn-examples.cjs`：
     - Example 2 の音声ボタン検索で、従来の `🔊🙆`/`🔊🙅` テキスト照合に加え `data-answer` 属性対応を追加（他ページ 1.2, 7.2, 7.3, 8.1 との完全後方互換性を維持）。
- 変更ファイル：`practice7.1.html`, `practice7.1.js`, `tests/common-yn-examples.cjs`, `docs/HANDOVER.md`
- スコープ厳守：Practice 7.1 のみ変更。Practice 7.2・8.x・共通CSS（`style.css`）・共通仕様書（UI_LAYOUT_SPEC）は未変更。
- 自動検証：
  - Python静的構文チェック、XML/SVG妥当性検証、HTML/JS整合性チェック全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでの各箇所（Example 2、Drill 2タイトル、Drill 2回答ボタン）の表示・操作確認。
  - ユーザー確認後、他ページへの適用検討および共通仕様書への反映。

# 前回のリレー状態 — Practice 7.1: Yes/Noボタン Lucideアイコン・Cool-Gray背景実装

- 更新日時：2026-11-08T16:10:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 7.1 Yes/Noボタン Lucideアイコン（Smile/Frown カラー線画）および Cool-Gray 背景（#E5E7EB）の実装 ／ `17c6be0eae96430e527c37536bc292f8ffc396c0` ／ `main`
- 実装内容：
  1. `practice7.1.js`：
     - Lucide `smile`（YES）および `frown`（NO）のインラインSVG定義（`ANSWER_ICONS`）と生成関数 `createAnswerIcon(kind)` を追加（20×20px、stroke="currentColor"、stroke-width="2"、aria-hidden="true"）。
     - `button()` ヘルパーを拡張し、Nodeインスタンスが渡された場合も直接DOM appendするように改修（既存の文字列引数処理・ツールチップ生成・ガード処理は完全維持）。
     - Drill 2のYes/No回答選択肢ループで絵文字（`🙆`/`🙅`）を `createAnswerIcon(kind)` に置換。アクセシビリティラベル `aria-label`（`Affirmative response` / `Negative response`）を追加し、`aria-pressed`・選択状態・録音再生・回答管理ロジックを忠実に保持。
  2. `practice7.1.html`：
     - `<body class="site-scale practice7-page">` に `practice71-page` を追加し、他ページ（Practice 7.2, 7.3, 8.x等）への波及を完全に遮断。
     - `<style>` に Practice 7.1 専用の Y/N ボタン用スタイルを追加：
       - デフォルト背景：Cool-gray `#E5E7EB`（境界線 `#d1d5db`）。ダークモード時：`#374151`（境界線 `#4b5563`）。
       - アイコン色（stroke）：YESは緑色（ライト `#16a34a` / ダーク `#4ade80`）、NOは赤色（ライト `#dc2626` / ダーク `#f87171`）。
       - 選択時（`aria-pressed="true"`）：既存の肯定・否定フィードバックを踏襲（YES: `#4ade80` / `#14532d`、NO: `#fca5a5` / `#7f1d1d`）し、選択リング outline（ライト `#64748b` / ダーク `#94a3b8`）を付与。
     - スクリプトのキャッシュバスターを `20261108-lucide-yn` に更新。
- 変更ファイル：`practice7.1.html`, `practice7.1.js`, `docs/HANDOVER.md`
- スコープ厳守：Practice 7.1 のみ変更。Practice 7.2・8.x・共通CSS（`style.css`）・共通仕様書（UI_LAYOUT_SPEC）は未変更（実機確認後に共通仕様へ展開予定）。
- 自動検証：
  - Python静的構文チェック、XML/SVG妥当性検証、HTML/JS整合性チェック全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち：
  - Vercelデプロイ完了確認および実機ブラウザでのYes/Noボタン表示・操作確認。
  - ユーザー確認後、他ページへの適用検討および共通仕様書への反映。

# 前回のリレー状態 — Practice 8.1 Drill 4: Fix Japanese Text Wrapping

- 更新日時：2026-11-08T15:45:00+01:00 ／ 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 8.1 Drill 4: 日本語テキスト折り返し不具合（「べんきょうをはじめる」の「る」が次行へ落ちる問題）の修正 ／ `508a994aaf059b315840810b947a70e0d6f1b476` ／ `main`
- 根本原因：
  1. CSS側：`.practice81-page #drill4 .p81-option-japanese` およびボタンに `white-space: nowrap` が未指定だったため、日本語テキストが任意の文字間で改行可能だった。
  2. レイアウト制約＆計算：`.practice81-page #drill4 .p81-base-select` に `inline-size: var(--p81-select-width)` が指定され、さらに JS（`enhanceActivitySelects`）で `select.style.width = nativeWidth` と狭い固定幅がインライン強制設定されていた。`appearance: base-select` 適用後の `<button>` の内部余白・ピッカー矢印により、利用可能幅がネイティブ `<select>` より数px不足し、十分な水平余白があるにもかかわらず「る」が折り返されていた。
- 修正内容：
  1. `style.css`：
     - `.practice81-page #drill4 .p81-option-japanese` に `white-space: nowrap;` を追加（閉じた選択表示・開いたドロップダウン両方で適用）。
     - `.practice81-page #drill4 .p81-base-select > button` に `white-space: nowrap;` を追加。
     - `.practice81-page #drill4 .p81-base-select` を `inline-size: max-content; min-inline-size: var(--p81-select-width, max-content); max-inline-size: 100%;` に変更（内容に応じて自然にフィットし、未選択時の最小幅を保ちつつ、狭小幅での横あふれを防止）。
  2. `practice8.1.js`：
     - `enhanceActivitySelects()` でインラインスタイル `select.style.width` の強制固定設定を撤廃（`select.style.removeProperty('width')`）。
     - `nativeWidth` は `Math.ceil(...)` で四捨五入し `--p81-select-width` へ提供。
  3. `tests/practice81-activity-select.cjs`：
     - closed select（全6問）および open picker options（全選択肢）において、日本語テキストが複数行に折り返されていないこと（`range.getClientRects().length <= 1`）を検証する回帰アサーションを追加。
  4. キャッシュバスター：`practice8.1.html` および `preview-practice8.1-dr4-1-base-select.html` の配信識別子を `20261108-p81-wrap-fix` に更新。
  5. 仕様書：`docs/UI_LAYOUT_SPEC.md` に Drill 4 の日本語ラベル折り返し防止契約を追記。PROJECT_SPECの変更は不要。
- 変更ファイル：`style.css`, `practice8.1.js`, `practice8.1.html`, `preview-practice8.1-dr4-1-base-select.html`, `tests/practice81-activity-select.cjs`, `docs/UI_LAYOUT_SPEC.md`, `docs/HANDOVER.md`
- 自動検証：
  - Python静的・DOM構造・CSS/JSセレクタ解析全件PASS。
  - `git diff --check` 合格（構文・空白エラーなし）。
  - （※Node/Playwrightブラウザ実行はコンテナ制約のため未実施。CI/Codex Cloud環境での実行を想定）。
- ユーザー実機確認／CI／デプロイ：未実施（Push後にVercelデプロイ・実機確認依頼）。物理実機での確認は断定しない。
- 次の具体的操作／判断待ち／未回収作業：
  - GitHub `origin/main` への push 完了後、Vercel でのデプロイ完了確認および実機ブラウザでの「べんきょうをはじめる」表示確認。
  - 未回収作業なし。

# 前回のリレー状態 — Practice 8.1 Drill 4承認済み候補Hoverの本番統合

- 担当：Codex Cloud／2026-11-08。開始時main：`91ba5447fae58b026935c31ef877d53504c60c9c`。未コミット変更なしを確認してfast-forward同期。作業中のmain更新`562e9dd`／`0c15f03`は7.1 Previewのみで、内容を保持してfast-forward取得。
- 対象：Practice 8.1 / Drill 4 / degree-0〜degree-5 / 活動候補select。承認済みPreview `91ba544`の右側英語説明を6問へ統合。Previewの実機承認はユーザー報告。本番統合後の実機確認とは区別する。
- 実装：ページ内rendererで候補DOMを生成。OFF／Hover／Displayに連動し、touchを理由とした全候補英語表示は行わない。共有列で英語を整列し、一覧高さを画面内へ制限。未選択Selectツールチップは生成しない。
- 選択・除外・録音キー・録音／再生／判定の処理は維持。閉じたselectの実測幅を測定クローンにも保持し、候補英語でキュー列が広がることを防ぐ。
- Previewは本番と同じ実装を使用。旧Preview専用JS／CSSを撤去し、二重実装を解消。共通CSSの追加は8.1 Drill 4の専用クラス配下だけ。
- 限定自動検証：`node tests/practice81-activity-select.cjs` 2,724確認合格（Linux Chromium 154）。6問×Vocab 3設定×1440/375px×ライト/ダークの72条件で実際のpickerを開き、Hover未確定・右側英語・共通列整列・画面内表示・placeholderヒントなしを確認。開始時mainの本番ページをbaselineに対象外の全ExampleとDrill 1/2/3/5の本文・フォーム・操作状態・カード寸法を12条件で比較し一致。
- 選択後：6問すべてでクリック1回につきchange1回、選択済みヒント、候補重複除外、選択変更・Vocab切替を確認。上下キー／Enter／Escape、6問のタッチ相当選択、OFF／Hoverをtouchが上書きしないことを確認。対応検出をfalseにしたnative fallbackの6問選択も確認（非対応ブラウザ実機ではない）。
- 録音：6問のモデル再生→選択による中断→マイク待ち／録音中の全selectロック→停止→正解結果表示、活動キーの復元、表記／文体切替と375→1440の反復リサイズで保存結果保持を確認。音声・認識APIは既存モックを使用。`PRACTICE_PAGES=practice8.1 node tests/audio-relay.cjs` 32確認合格。構文確認・`git diff --check`は表示／動作検証と別に合格。
- 検証中に375pxの後半設問で一覧下端が画面外になる問題を検出し、標準anchorの反転・空き高さ選択を明示して解消。最終72条件で再検証済み。英語で閉じたselectの測定幅が広がる問題も、既存の実測幅を測定クローンへ保持して対処。
- 未検証：本番統合後のWindows／ChromeOS・タッチ／ハイブリッド実機、スクリーンリーダー、実マイク・実音声・認識品質。ユーザーのPreview `91ba544`実機承認と今回の自動検証を混同しない。
- 公開接続：本環境から本番URLはCONNECT 403（通信ポリシー）。公開画面・新しい配信識別子の読込確認は未実施。Push／Vercel状態と公開表示確認を区別する。
- 仕様書：UI_LAYOUT_SPECに対象限定の承認内容を追記。教材・共通Vocab／音声仕様の変更はなくPROJECT_SPECの変更は不要。

# 前回のリレー状態 — Copy機能展開方針検討待ち／W-7 Codex追加調査を先行

- 更新日：2026-11-08（Europe/Vienna）／担当：Codex Cloud。開始時main：`131edf1b779be7ad1e470acddd0abbaf94879dae`。作業中に文書のみの更新`df85867`をfast-forward取得・保持。保存先：GitHub main。
- 対象：Practice 7.2 / Drill 1（Past・Present State）とDrill 2（Present StateのQ/A）/ 最終問題カード直後・枠外・右寄せのCopy UI。Drill 3はEnglish Cues切替で独立した録音結果がないためCopyを新設しない。Example・Practice 7.1・他ページ・共通CSS/JSは変更しない。
- 実装済み・限定自動検証済み：7.1のCopy UI・Lucide clipboard（20×20、stroke-width 2、currentColor）・成功/失敗通知に合わせ、7.2の保存キーへ適応。ボタンは`Copy my sentences`、補助説明は現行確定文言`Copy your drill results to review or share.`。
- コピー内容：明示したDrill見出し・学習テーマ・コピー操作時のローカル日付と、表示中のDrillのrawTranscript・保存済み正誤マーカーだけ。原文の空白・句読点も保持し、モデル・表示用かな変換・採点し直しを混ぜない。D1はPast／Present State、D2はQ／A。D2の旧Yes/No viewも保存レジストリへ残るため、現在のaria-pressed選択から該当回答だけを抽出する。
- 録音開始待ち・録音中・原文なしは無効化。既存renderAll／processResult／practice7SyncRecordingUIを戻り値・引数ごと維持して表示更新だけを追加し、再描画後の重複生成を防止。音声・録音・認識・判定の内容は変更しない。
- 変更ファイル：`practice7.2.js`、`practice7.2.html`（7.2専用スタイルとJS識別子`20261108-copy72`）、`tests/copy72.cjs`、本書。
- 自動検証：
  - `node tests/copy72.cjs`：Chromium 69確認合格。1440/375px・ライト/ダークで枠外/最終カード直後/右揃え/表示文言/アイコン、原文・マーカー・Drill境界・未選択と非表示の回答除外、文体/表記/Vocab/English cues再描画、録音開始待ちと実際の録音/停止イベント、空状態、Clipboard失敗を確認。
  - ローカル日付はブラウザをAmerica/Los_Angeles、UTC 2026-11-09T00:30に固定し、コピーには2026-11-08が入ることを確認。アプリの利用者タイムゾーンを固定する変更ではない。
  - `PRACTICE_PAGES=practice7.2 node tests/audio-relay.cjs`：既存の限定音声リレー検証32確認合格。
  - 変更前131edf1とのChromium比較19状態で、Copy UIを除いた本文・Example・フォーム状態が一致（両表記×3Vocab×3文体、およびEnglish cuesのExample比較）。
  - `node --check practice7.2.js`、`node --check tests/copy72.cjs`合格。`git diff --check`は差分形式の確認として別管理。
- 仕様整合性：既存のCopy共通仕様に沿った個別適用で、共通仕様の追加変更は不要。7.2の保存キー/現選択への対応はページ実装を正本とする。7.1や他ページへのCopy追加・共通化は行わない。
- 実機確認：ユーザーが2026-11-08にPractice 7.2の実機確認完了を報告。モックによる自動検証とは区別して記録する。実音声の品質など、個別の検証項目の内訳は未報告のため断定しない。次の状態は「各ページへのCopy機能の進め方を検討」（実装指示待ち）。先にW-7のCodex追加調査を優先する。

# 前回のリレー状態 — Icons8会話役割アイコン採用

- 更新日：2026-11-08（Europe/Vienna）／担当：Codex Cloud。開始時main：`d31fa525be6e96a9f7cac0338c74f755366dc0da`。作業ブランチ：`work`、保存先：GitHub `main`。
- Q/Aアイコン状態：採用決定・実装中 → 実装済み・検証済み（アイコン適用範囲、最新main ab69d6fと比較済み）。公開確認・ユーザー実機・実音響は別状態。
- 対象：Practice 1.2、2.1、2.2、2.3、7.1、7.2、7.3、8.1、8.2、8.3。初期状態の役割コンテナ数は順に4、10、28、16、2、2、6、10、20、54（8.3は空スペーサー18を含み、画像は36）。Example／Drillの実在する会話役割だけを変換。1.1・発音1/2・作文1・Indexは役割なしとブラウザで確認。
- 実装：`conversation-display.js`の既存生成経路へ、承認済みIcons8 mono Ask Question／Speech Bubbleを統合。`assets/qa-icons/`へ元Previewと同一バイトのPNGをコピーし出典・Icons8帰属条件を記録。各使用ページに可視の小さなIcons8リンクを追加。Microsoft素材のMITライセンスはIcons8へ適用しない。
- 見た目：既存互換クラスと外寸・基線・位置・間隔を保持。囲み・背景なし、通常は黒線、ダークはCSS反転した白線。Question／Answer名は親に残し画像は装飾扱い。空欄には画像を入れない。`content-layout.js`では画像だけの役割も「内容あり」と認識し、8.1／8.3の狭幅で旧配置から変わらないよう統合した。
- 比較Preview：4種類を維持し、元Q/Aも比較可能。7.3の別ラベル比較も役割の旧表示を維持。本番へPreview置換スクリプトは読み込まない。8.3のWho／What／Which／Where／Whenは括弧なしを維持。教材・Lato・人物・操作・音声・録音・認識・採点処理は変更なし。
- 変更範囲：共有表示JS・共有内容幅JS・CSS、該当10ページのHTML（帰属と配信識別子）、1.1 HTML（共有JS識別子のみ）、比較2 HTML、PNG2点＋CREDITS、関連テスト・仕様・入口・本追跡記録。配信識別子：`20261108-icons8-mono`。

## 今回の検証

- `tests/qa-icons.cjs`最終比較：10ページ、313条件、35,458確認、不合格0。240設定条件（1440／375px × ライト／ダーク × かな／漢字 × Vocab OFF／Hover／Display）、43セット／English cues切替、30保存結果付きリサイズ。文体はOFF→Formal、Hover→Informal、Display→Casualで各テーマ・幅・表記に適用し、全文体の再描画を確認。全ての文体×Vocab組合せの総当たりではない。
- 全非空役割で正しい承認済み画像の読込・Question／Answer名・装飾画像・枠背景なし・テーマ反転を確認。旧mainとの役割コンテナ数・実外寸・位置・フォーム状態の比較に合格。空欄へ画像を生成せず、8.3の括弧なし英語9表示を保持。例：標準役割外寸は変更前後とも25.859375px四方。
- 既存APIモックの録音／停止イベントで保存結果を生成し、各ページで1440→375→1440px後の入力・設定・選択・録音再生／判定結果DOM保持を確認。
- 補足実測：10ページ×2幅×2テーマ＝40条件で、役割画像と操作／人物要素の交差、Example／テーブル境界からのクリップを検査し、該当不具合0。
- Preview：4選択肢×2幅×2テーマ＝16条件。元Q/Aは画像0、Microsoft／Icons8 Color／Icons8 monoは各36画像読込、空欄画像0、ページ横はみ出し0。
- `node tests/labels-and-speakers.cjs`：100確認合格。`node tests/practice22-qa.cjs`：540確認合格。画像役割への期待値更新を行い、既存の人物・音声イベント等の検証を保持。
- `node --check`：共有表示JS・共有内容幅JSと変更テストの構文確認合格。`git diff --check`は差分形式のみの合格として別扱い。PNG2点の`cmp`で承認済みPreview素材との同一性を確認。
- 再開時にmainが`ab69d6f0f1fce400ea5dc1a73c1d5886f7b91d38`へ進んでいたため、全更新を保全してfast-forward同期し、そのツリーを変更前baselineとして全10ページを再検証した。新English Cues・7.1 Copy・Beyond件数・新仕様を保持。CopyのQ/A区分は保存データから生成する既存処理のままで、アイコン画像から文字を抽出しない。

- 最終同期：`efb8014`の7.1 Copy補助説明短縮と関連文書を保全。描画コード差分はその1文だけのため、最新efb8014をbaselineに7.1の28条件・624確認を追加再実行し不合格0。他9ページの描画コードはab69d6fでの最終確認時から不変。
- 検証はローカル配信した実ページのChromium描画・操作による。数式シミュレーションや構文確認だけで合格にしていない。before／afterの代表画像：8.3と2.2の会話Example、1440pxライト／375pxダークを同じHiragana／Hover／Formalで撮影し会話へ提示。
- 実音響・実マイク・実Web Speech認識品質・ChromeOS等のユーザー実機は未検証。録音／判定の保持試験は既存APIモックで生成した保存結果を使用。
- 既存共有テスト：`tests/shared-conversation-display.cjs`は未合格。初回は2.1 Exampleの375px幅チェックで失敗し、未変更の開始時mainでも同じ失敗。フォントと配置の確定を待つようテストを整えた後は2.3の600px「intro X shares Q person column」で失敗し、同じ待機を加えた最新ab69d6fの未変更baselineでも再現（再開後に両方を再実行）。今回のアイコン配置差分検査とは区別し、既存の人物列整列問題を解消済みとは扱わない。アイコン採用以外のレイアウト修正は行っていない。
- 初回アイコン差分テストでは8.1／8.3狭幅の24条件で位置変化を検出。画像役割を空ラベルと誤認する上記統合箇所を修正し、最終実行で再検証した。初回失敗を合格として転記しない。
- 仕様書：UI_LAYOUT_SPEC・UI_ROLLOUT_REVIEW（採用追跡）更新済み。AGENTSと関連共通／ページ仕様の旧丸囲み記述を現行共通表示への参照へ整合させた。過去のPreview比較記録は履歴として保持。
- 公開確認：この実行環境から`https://october2026.vercel.app/practice8.3.html`はCONNECT 403。公開画面・公開ファイルの新識別子は未確認。Push・Vercelチェック成功・公開描画確認を混同しない。
- 次の具体的操作：許可ドメインを反映した実行環境で公開ページの`20261108-icons8-mono`読み込み、PNG画像・帰属・テーマ・狭幅を確認する。既存共有テストの2.3人物列整列は別の未解決事項として扱う。

## 2026-11-08 — Copy機能7.1実機確認・文言確定・全ページ展開準備
- ユーザーがPractice 7.1のCopy機能（実装Commit `572aee9`）について実機確認完了を報告。先行実装の確認待ちは解消。
- 共通表示文言の現行確定版：ボタン `Copy my sentences`／補助説明 `Copy your drill results to review or share.`。Lucide `clipboard` アイコンは維持。Practice 7.1の補助説明はコミット `131edf1` で変更済み（GitHub再取得によるコード確認済み）。この行は以前の文言 `Copy to review or share.` と「コード変更は未実施」の記録を更新したもの。7.2以降へのCopy機能展開は別作業として扱う。
- 全ページ展開対象：録音による発話記録を持つすべてのDrill。Pronunciation 1・2、Compositionは除外。
- 現行ステータス：7.1・7.2のCopy機能は実装・ユーザー実機確認完了。残りの対象ページへの展開は「進め方を検討」段階。既存のRead-only調査を踏まえ、共通化の範囲・ページ順序・個別Drill対応を改めて判断する。追加実装は未承認。W-7 Codex追加調査を先に行う。

## 2026-11-08 — Practice 7.1 Copyボタン共通仕様適用完了
- 更新日時：2026-11-08T13:40:00+01:00 / 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 7.1 Copyボタン共通仕様適用（Lucide clipboard SVG、カード外右寄せ配置、YYYY-MM-DDローカル日付付きヘッダー） / `642a6c585807b14f75f08b35b746738a63080bbe` / `main`
- 完了・未完了／変更ファイル：
  - 完了：
    1. アイコン：絵文字 `📋` を Lucide `clipboard` SVG（20×20px、stroke-width 2、currentColor、aria-hidden="true"）に置換。ラベル `Copy my sentences` を併記。
    2. 配置：Drill 1（`#drill1List`最終カード直後）およびDrill 2（`#practice71QuestionSection`最終カード直後）の両方で、カード枠内からカード枠外の直後へ移動し、右端揃え。再描画時の重複生成を防止。
    3. コピー先頭見出し：
       - Drill 1: `Practice 7.1 — Drill 1: Compare Habit & Ongoing — いつも～ています／今～ています — YYYY-MM-DD`
       - Drill 2: `Practice 7.1 — Drill 2: Ask and answer — 今～ていますか — YYYY-MM-DD`
       利用者のローカル日付（`YYYY-MM-DD`）をコピー操作時に生成して付与。
    4. 動作保持：raw STT transcript、正誤マーカー（`✅`/`—`）、Q/A区分、未録音時・録音中の無効化ロック（`practice71SyncRecordingUI`連携）、クリップボード成否通知を維持。
  - 変更ファイル：`practice7.1.html`, `practice7.1.js`, `docs/HANDOVER.md`
- 自動検証：PythonによるSVG構造・カード外配置・ローカル日付形式・見出し文字列・重複防止・録音中ロック検証全件PASS、`git diff --check` 合格。
- ユーザー実機確認／CI／デプロイ：GitHub push 完了。ユーザーは2026-11-08に当該Copy機能の実機確認完了を報告。Node／Playwrightのブラウザ自動テストは未実施（コンテナ制約）。
- 次の具体的操作／判断待ち／未回収作業：未回収作業なし。後続タスク（F-2 セット切替Lato適用、W-3 残り3ページEnglish Cues等）へ移行可能。

## 2026-11-08 — W-3: Practice 8.2 English Cues実装完了
- 更新日時：2026-11-08T13:20:00+01:00 / 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：W-3 Practice 8.2 English Cues追加 / `eabbbcde5d1d3d7c61dc454b6dfe0fc399fa61d0` / `main`
- 完了・未完了／変更ファイル：
  - 完了：`practice8.2.html` に `#drill5Container` を追加。`practice8.2.js` に `englishCues`、`Drill 5: Practice with English cues` パネル生成関数 `renderEnglishCuePanel()` を追加。既存の `cues(r)` および `words` のデータ構造を活用し、Drill 1〜4 の全設問で英語キュー切り替えを可能に接続（Drill 1: class / speak, school / learn, college / teach, teacher / ask。Drill 2: what/read, something/read 等。Drill 3: birthday/do, party/take along 等のQ行キュー、A行は従来のYes/No回答選択肢を完全維持。Drill 4: what kind of/cooking/make 等のQ行、anything/make 等のA行）。Example行は日本語表示のまま保持。切替時のDrill 1上部へのスムーズスクロール、録音中ロック対応、録音結果・選択状態・音声URLを保持したままの再描画を確認。
  - 変更ファイル：`practice8.2.html`, `practice8.2.js`, `docs/HANDOVER.md`
- 自動検証：PythonによるDrill 1〜4全問キュー変換シミュレーション全件PASS（Example日本語不変性・Drill英語キュー英語性・Drill 3 Yes/No保持確認）、`git diff --check` 合格。
- ユーザー実機確認／CI／デプロイ：ユーザー申告：Practice 8.2の実機確認完了（2026-11-08）。Node／Playwrightのブラウザ自動テストは未実施（コンテナ制約）。
- 次の具体的操作／判断待ち／未回収作業：未回収作業なし。後続のEnglish Cues未対応ページ（Practice 1.2, 8.1, 8.3）またはF-2等へ移行可能。

## 2026-11-08 — W-3: Practice 1.1 English Cues実装完了
- 更新日時：2026-11-08T13:00:00+01:00 / 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：W-3 Practice 1.1 English Cues追加 / `fecd70a2790292372828a2c9acf2923190de8cd8` / `main`
- 完了・未完了／変更ファイル：
  - 完了：`practice1.1.html` に `#task4Container` を追加。`practice1.1.js` に `practice1State.englishCues`、`Drill 4: Practice with English cues` パネル生成関数 `renderEnglishCuePanel()` を追加し、Drill 1 のキュー表示を英語／日本語で動的に切り替え可能に接続（1. I / student, 2. I / teacher, 3. I / Japanese, 4. I / international student, 5. friend / student, 6. friend / home maker, 7. friend / American）。切替時のDrill 1上部への滑らかなスクロール、録音中ロック対応、録音結果・音声を保持したままの再描画を確認。
  - 変更ファイル：`practice1.1.html`, `practice1.1.js`, `docs/HANDOVER.md`
- 自動検証：Pythonによる全7問キュー変換シミュレーション全件一致PASS、`git diff --check` 合格。
- ユーザー実機確認／CI／デプロイ：GitHub push 完了。2026-11-08、ユーザーがPractice 1.1 English Cuesの実機確認完了を報告し、本作業を完了と確定。Node／Playwrightのブラウザ自動テストは未実施（コンテナ制約）。
- 次の具体的操作／判断待ち／未回収作業：未回収作業なし。後続のEnglish Cues未対応ページ（Practice 1.2, 8.1, 8.2, 8.3）またはF-2等へ移行可能。

## 2026-11-08 — F-1: Practice 2.2 English Cues実装完了
- 更新日時：2026-11-08T11:40:00+01:00 / 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F-1 Practice 2.2 English Cues有効化 / `58bc6cfce1e8315912a11ad3ee57b2c6fe6dae30` / `main`
- 完了・未完了／変更ファイル：
  - 完了：`practice2-next.js` 内に Practice 2.2 用の English Cue コントロールパネル生成関数（`Drill 5: Practice with English cues`、`#drill5Container`末尾配置）を実装。Drill 1〜4 の各設問に `englishCue` による英語キュー切り替え（Drill 1: this/bag/price等、Drill 2: this/bag/how much等、Drill 3: which/rice ball/300 yen等、Drill 4: that person/who, that person/Takeshi, classmate等）を接続。Practice 2.3 への非干渉を確認。
  - 変更ファイル：`practice2-next.js`, `docs/HANDOVER.md`
- 自動検証：Pythonによる全Drill（1〜4）キュー変換シミュレーション全件一致PASS、構文チェックPASS、`git diff --check` 合格。
- ユーザー実機確認／CI／デプロイ：GitHub push 完了。2026-11-08、ユーザーがPractice 2.2の実機確認完了を報告。Node／Playwrightのブラウザ自動テストは未実施。
- 次の具体的操作／判断待ち／未回収作業：未回収作業なし。後続タスク（F-2 Q/Aアイコン採用、F-3 7.1表示調整、F-4 セット切替Lato適用等）へ移行可能。

## 2026-11-08 — 現行F／W／C管理リスト（優先順位可変）

この節を**現行の作業管理一覧**とする。以下の番号は固定IDではなく、着手順・依存関係・ユーザー判断に応じて振り直す。過去のF/W/C番号は履歴として維持し、旧番号と現行番号を同一視しない。履歴にある「未完了」は現行状態を上書きしない。

### F：比較的独立して進められる作業（優先順）
1. **F-1 セット切替ボタン英字Lato適用**［仕様確定・実装待ち］：2.1／2.2／2.3／8.3。UI_LAYOUT_SPECの確定仕様に従い対象ボタンのみ変更し、共有CSSとフォント読込を限定検証する。
2. **F-2 Example発話行のグレー点線撤去**［仕様方針確定・実装待ち］：共通`.drill-example-table > tbody > tr + tr > td`の発話行区切り点線を撤去。Practice 1.2等のページ固有の行区切り指定と7.1等のJS生成線も影響調査し、発話行のグレー点線のみ除去する。オレンジのExample外枠や別用途の区切り線は保持。
3. **F-3 Practice 7.2 新規録音時の再生中断不具合**［実機報告・原因調査／修正待ち］：別行の「とる」を押しても直前のモデル音声・録音ファイルの自動再生が続く。確定済みの新規録音時中断仕様に従い原因を特定して修正する。既存`tests/audio-relay.cjs`の模擬テストは中断を一部検証済みだが、実機の競合条件を十分網羅したとは限らない。実機再現・回帰試験を要する。

**完了・除外履歴（現行タスク外）**：Icons8 Q/Aアイコン採用は全該当10ページの実装・ブラウザ検証を完了しmainへ保存。公開接続403・実機未確認と既存共有テストの別件失敗は冒頭のIcons8リレー状態を参照。 Practice 8.1 Drill 5のバッジ左余白・`〃`位置修正は実装・Push・ユーザー実機確認完了（2026-11-08、実装Commit `a5f2d9fe360956cc05c3b4361b8b89635f3efbc7`。`Poor`等のバッジを自然な左位置に戻し、`〃`は動詞位置に追従）。 Practice 8.1 Drill 5タイトル「へた」Hoverと語義「Bad at」への変更は実装・Push・ユーザー実機確認完了（2026-11-08、実装Commit `59c947bef0ec4758a927bd5a586cab0b4e0f027d`）。Practice 7.1「いつも…／今…」表示調整は2026-11-08にユーザー実機確認完了（実装Commit `acbb9ff828cc8621dfd3b9b4a7224a0eebb3810e`）。Practice 1.1およびPractice 2.2 English Cuesは実装・Push・ユーザー実機確認完了。Beyond漢字異なり字数も実装・Push・実機確認完了。Beyondの他ページ展開はW-1に統合。Preview／実機・回帰確認とProduction反映は各作業の標準完了手順。

### W：検討・仕様判断・前工程に依存する作業（優先順）
1. **W-1 各ページの使用語・語彙表示見直し → Beyond新設置・デザイン展開**［未着手／段階依存］：対象候補はPractice 1.1／1.2／2.1／2.2／2.3／7.1／7.2／7.3／8.1／8.2／8.3。ページごとに使用語・学習範囲と表示内容を先に確定し、語句・Hover／Displayを整えてから、そのページにBeyondを新設または承認済みデザインを適用する。先行する語彙調整が終わらないページへBeyondを先行展開しない。既存Beyond 8.1〜8.3は現状を保持し、必要な差分のみ検討する。
2. **W-2 人物表示・場所表示の見直し**［未着手］：人物X／Y／Z・人物ガイド（2.1／2.2／2.3）と、場所・都市・国の表示（2.2／2.3）。同じ画像・会話表示の検討としてまとめ、実装は対象要素ごとに切り分ける。
3. **W-3 English Cues未対応ページへの最小追加**［共通原則確定／残り3ページ実装待ち］：対象は **Practice 1.2／8.1／8.3**。Practice 8.2は実装・Push・ユーザー実機確認完了（2026-11-08、Commit `6ef5470`）。Practice 1.1は実装・Push・ユーザー実機確認完了（2026-11-08、Commit `2b75bfa`）で現行対象から除外。PROJECT_SPEC「English Cues追加の共通実装原則」に従い、既存ボタン・切替方式を再利用し、各Drillの日本語キューに対応する英単語・短い英語表現のみを定義・接続する。新規教材設計・UI再設計・無関係な変更はしない。既存の日本語キュー・Example・モデル・音声・判定・配置を保持。各ページを小さな独立変更として進める。
4. **W-4 7.2／7.3時制区分の配置検討**［検討］：「きく」左への配置案。現行の確定配置を無断変更しない。
5. **W-5 8系英語ラベルのフォント・色・区分表示の残件**［要確認］：既に確定・実装したLatoや装飾を再作業せず、未決の箇所だけ扱う。
6. **W-6 Example／DrillのHover説明の改善**［検討］：Ex1／Dr1等の説明の出し方と範囲を決める。
7. **W-7 8.1 Dr4ドロップダウン候補Hover**［Preview実機承認済み／本番実装・限定自動検証済み／本番実機確認待ち］：ユーザー承認`91ba544`に基づき6問へ適用。OFF／Hover／Displayと右側英語列を維持。今回の本番統合後の実機確認は別途必要。詳細は冒頭の現在状態を参照。
8. **W-8 教師への報告機能**［構想］：報告ボタン・送信先・データ最小化・失敗時挙動を先に設計。
9. **W-9 追加練習の自動生成**［構想］：教材範囲と教師キューの制約を先に確定。
10. **W-10 絵文字／Lucideの表示統一調査**［7.1比較Preview更新済み・採用判断待ち／他は検討］：採用済みのIcons8 Q／Aは再調査しない。Practice 7.1のYes／No比較Previewで目なしSmile／Frownの色なし・色つきを比較可能に更新（Commit `af3e5d7`、本番未変更）。どの案を採用するかは未決定。
11. **W-11 疑問文の文作成時の「？」吹き出し表示**［検討・実装未承認］：疑問文を作る操作では停止ボタンの右にグレーの「？」吹き出しを表示する。対象ページ・対象Drill・疑問文判定条件・録音中／停止後の表示・既存ボタンとの干渉を先に調査して仕様確定する。

### C：独立作業ではなく、関連作業で監視する懸念
1. **C-1 共通CSS／JSの波及・Previewブランチの競合**：Ex／Dr・他ページへの意図しない影響、ブランチ差分、未Push成果の上書きを防止。各変更の事前影響調査・差分確認に組み込む。
2. **C-2 自動検証とChromeOS実機の差**：タッチ・画面幅・ダークモード・実音声等の未検証を合格扱いしない。各作業の必要な検証で管理。
3. **C-3 Antigravity／Codex等の利用枠・中断リスク**：途中保存・引き継ぎ・最新main同期を既存リレー手順に従って管理。
4. **C-4 追加練習の教材範囲逸脱**：W-9に着手する際、未習語・未習文法の混入を確認。
5. **C-5 教師報告のプライバシー・送信品質**：W-8に着手する際、個人情報・誤送信・送信失敗を確認。

**解消・通常手順へ移行**：旧C-5 Beyond漢字件数とテスト期待値の不一致は、2026-11-08のF-5修正により対象実装・期待値が更新されたため、独立した懸念から外す。実機確認の未了は各作業の検証状態として残す。

**Updateの定義（2026-11-08ユーザー確定）**：F／W／Cの現行リストは未完了作業のみを表示する。完了したタスクは現行リストから除外し、必要な完了履歴は別枠・過去ログに残す。一部完了した複合タスクは、完了したページ・範囲を対象列挙から除外する。番号は残件で振り直し、完了項目を次回Updateで再掲載しない。

**運用ルール**：Fは小さく独立した実装、Wは検討・依存関係のある複合タスク、Cはリスク管理。調査・実装・限定検証・Commit／Push・必要な公開／実機確認は各タスクの工程であり、通常は別番号を付けない。依存工程を無理に分割せず、一つのW項目の内部ステップとして進捗管理する。

---

## 2026-11-08 — Practice 7.2 実機での音声中断不具合報告
- ユーザー報告：一行の録音後に始まるモデル音声と録音ファイルの連続再生が、別の「とる」を選んでも中断されず続く場合がある。既存の「新規録音開始で全再生を中断」仕様に反する。実機確認済みのCopy機能とは別件として扱う。
- 調査状況：`practice7.2.js`には`stopAllPlayback()`と`DrillAudio.invalidatePlayback()`が存在。`tests/audio-relay.cjs`には新録音で旧モデル後続・旧録音音声を止める模擬テストがあるため「まったくテストしていない」とは言えない。ただし実機で再現した具体的な行間遷移・モデル／録音音声の実API・イベント競合を網羅した証拠はない。原因未特定。読み取り調査と実機再現条件の特定を優先し、修正は別途承認を得る。

## 2026-11-08 — F-5: Beyond Kanji counts updated to unique characters
- 更新日時：2026-11-08T11:03:00+01:00 / 担当環境：Antigravity (Gemini 3.8 Flash, Linux)
- 状態：引き継ぎ可能（GitHub保存完了）
- 課題／開始時mainのコミットID／作業ブランチ：F-5: Beyond Kanji Count修正（掲載項目数から対象未習漢字のユニーク文字数「字」へ変更） / `0ee897c370e7bc6f663bea80730b219ec2fb3747` / `main`
- 完了・未完了／変更ファイル：
  - 完了：8.1, 8.2, 8.3 各JSの `updateUnlearnedLexicon()` 動的計算ロジック修正、8.1, 8.2, 8.3, preview-8.3 各HTML初期テキスト修正、PROJECT_SPEC.md 件数規定更新、tests/practice81-final.cjs および tests/practice82.cjs 期待値更新。
  - 変更ファイル：`practice8.1.js`, `practice8.2.js`, `practice8.3.js`, `practice8.1.html`, `practice8.2.html`, `practice8.3.html`, `preview-practice8.3-qa.html`, `docs/PROJECT_SPEC.md`, `tests/practice81-final.cjs`, `tests/practice82.cjs`, `docs/HANDOVER.md`
- 自動検証：Python DOMシミュレーションによるユニーク漢字数検証（8.1: 14字, 8.2: 3字, 8.3: 18字）全件PASS、`git diff --check` 合格。
- ユーザー実機確認／CI／デプロイ：GitHub push 完了後のデプロイ・ユーザー実機確認待ち。
- 次の具体的操作／判断待ち／未回収作業：未回収作業なし。後続タスク（セット切替Lato適用、またはQ/Aアイコン判断等）へ移行可能。

## 2026-11-08 — セット切替のLato共通仕様確定
- ユーザー承認：調査で挙げた2.1・2.2・2.3・8.3の英字セット切替をLatoへ統一。先に共通ルールを仕様として確定する。
- 正本：UI_LAYOUT_SPEC「セット切替ボタンの英字フォント」。今後の新規セット切替も初めから適用する。
- 仕様登録済み・影響調査済み。今回は文書のみ更新。既存ページの実装対応・ブラウザ再検証・ユーザー実機確認は未実施／後続作業。対象は仕様書の棚卸しを参照。
- 次の作業：共通CSS・フォント読込・混在ラベルの英字分離へ適用し、対象ボタンだけを検証する。音声等の動作ロジックは変更しない。

## 2026-11-08 — 8.3 English subtitles / Q&A decision status
- Q／A icon status: 実装済み・検証済み（アイコン適用範囲）（Icons8 monochrome outlined Ask Question / Speech Bubble、全該当会話役割へ適用）。Four preview choices retained.
- Removed parentheses only from Example second-line p83-cat-sub labels: Who, What, Which, Where, When (9 rendered labels, 7 definitions).
- Lato, Japanese labels, styling and drill switch button wording retained.
- Canonical and comparison HTML reference updated script version. Public browser verification: all 9 subtitles show plain Who/What/Which/Where/When, computed font Lato; Example 1 screenshot visually checked.

## 2026-11-08 — Q/A comparison: Icons8 variants
- Added Icons8 Color and iOS Outlined Ask Question / Speech Bubble to preview-practice8.3-qa.html alongside Microsoft Color and original Q/A.
- Preview-only PNG assets stored locally; visible Icons8 attribution included. Monochrome inverts in dark mode.
- Canonical practice8.3.html unchanged. Await visual selection before adoption.
- Validation: PNG signatures and JS syntax verified. Vercel success. Public browser verified both Icons8 modes: 36/36 images loaded, preview border removed, no horizontal overflow at desktop width. Color and outlined screenshots visually checked. Narrow width/dark mode not browser-tested in this change.

# 2026-11-08 / 8.3 Q/AのFluent Color Preview

- ユーザー指定：Chat Bubbles Question（質問）＋Chat More（応答）を8.3でPreviewして判断。本番のpractice8.3.htmlは変更しない。
- 独立ページ：preview-practice8.3-qa.html。クエリなしはカラー吹き出し、?qa=originalは現行Q/A。preview-qa-icons.js/cssとassets/qa-previewの2 SVG・MITライセンスを使用。画像はMicrosoft公式から取得。
- 元のQuestion/Answerアクセシビリティ名を維持し、空の役割スペーサーは変更しない。動的再描画後にも適用する表示専用アダプタ。教材・音声・録音・判定は元の8.3を使用。
- 7.3の時制区分Latoは適用・公開確認済み。7.2はまだLato未適用のため現状を確認して報告する。7.2への変更指示としては扱わない。
- 公開1363pxのPreviewで36役割アイコンの画像読み込み・Question/Answer名・横はみ出しなしを確認。初回キャプチャは画像描画前だったが、自然幅24pxで読込完了後の実画像で質問/応答の対を確認。Hiragana Onlyへの再描画後も36アイコンが保持されることを確認。node --check合格。375px/ダーク/実機は未確認。ユーザー採用判断待ち。7.2公開版はsans-serifでLato未適用を確認。

# 2026-11-08 / 8.3二段目英字とLato読み込み不足の修正

## 2026-11-08 / Lato読込と8.3二段目英字

- 8.3のVerb/Adjectiveにfont-familyだけ指定してフォント本体を読み込んでいなかったため、8.3 HTMLにLato 400/700を追加。8.1でも同じ欠落を確認し、既存のLato指定を実際に読み込めるようHTMLへ追加した。1.1/8.2/7.3には読み込みあり。
- 8.3のp83-cat-sub（Who/What/Which/Where/When）にLatoを指定。括弧・日本語・枠・配置・音声・教材内容は変更なし。Q/Aの候補選定は別件。
- 横断調査：8.3形式の日本語主ラベル＋英語副ラベルは8.3の9表示。同様の画像内日英説明は2.1/2.2/2.3にあり、既存W項目として分離し今回は変更しない。
- フォント採用時はCSSのfont-familyだけで合格にせず、フォント本体の読み込みを確認する。

- 公開限定検証済み：8.3の4見出し・9副ラベルの計算font-familyがLato、8.3/8.1のLato stylesheet追加をDOMで確認。1363pxで8.3ページ横はみ出しなし。括弧は維持。ユーザー実機・375px/ダークは未確認。

# 2026-11-08 / 7.3のフォント採用・8.3の不要装飾是正

- 対象：7.3時制ラベルをLatoへ、8.3 Ex1のQ/A・空欄への概念バッジ漏れを是正。ユーザー明示指示により実装。教材・音声・録音・判定は変更しない。
- 実装：style.cssで8.1用Example概念バッジのライト/ダークセレクタをdata-practice="8.1"に限定。7.3のp73-tense/tense-badgeはfont-familyだけLato。7.3 HTMLのフォント読込・CSS識別子、8.3のCSS識別子を更新。
- Who/What等の括弧は意見提示のみ、未変更。Lucide丸囲み文字候補は保留、新しい絵に近い質問/応答ペアを検討。Q/Aのフォント自体は未選定で維持。
- 公開限定検証済み：1363pxの8.3 Ex1で役割欄の背景透明・枠0px・padding 0px、空欄の不要囲み消失を確認。Ex1〜4のVerb/AdjectiveはLato維持、ページ横はみ出しなし。7.3時制ラベルはLato・従来の青/ピンク背景・枠0px・padding 4px 8pxを確認。375px/ダーク/実機は未確認。仕様書更新済み。

# 2026-11-08 / F-2・8.3品詞ラベルとW追記

- 担当：GitHub API直接編集。基準main：1e0cc61e70a997a5c17d17a87b6e9cfe830c25a6。PCローカル編集なし。旧環境の未Push領域は直接確認不可。利用枠は取得不可。
- 1.1および他ページのキュー縦割れ・不要変更整理はユーザーが実機確認全件OKと報告。公開版1363pxで1.1 Exampleセル175.703px・横表示をこちらでも確認済み。
- F-1：8.1 Noun／Verb＋のの共通装飾は公開版で確認、完了。
- F-2：全11Practiceの同様ラベルを調査。8.3 Ex1〜4 Verb／Adjectiveをユーザー承認により共通装飾へ統一。Q/Aはフォントのみ選定待ちで変更しない。7.3時制ラベルは別Preview、採用待ち。8.3 Ex1 Q/Aへの8.1 CSSの漏れは既知の別懸念。Q/Aの形状変更指示なしのため今回維持。
- 変更：style.cssのp83-header-badgeだけ、practice8.3.htmlのCSS識別子、UI_LAYOUT_SPEC、本記録。公開版1363pxで4見出しすべてLato・18.72px・padding 6px 10px・1px枠を確認。

- 公開検証：7.3独立比較ページの現行／Latoのみ／B装飾リンクを確認。Latoのみは既存時制色、B装飾は共通中立背景・Lato・6px 10px余白をcomputed styleと画像で確認、1363pxでページ横はみ出しなし。mainの通常practice7.3.htmlは差分なし。375px・ダークの実表示、ユーザー採用判断は未確認。Q/Aは変更なし。
- Lucide調査：公式リポジトリのcircle-letter-q／circle-letter-a SVGを確認。代案message-circle-question-mark／message-circle-replyも公式サイトで確認。候補提示のみで未採用。

## Wリスト追記（既存番号を変更しない）

- 人物表示の見直し：Practice 2.1／2.2／2.3。X／Y／Z・人物ガイド等。F-2の概念区分統一とは別項目。未着手。
- 場所表示の見直し：Practice 2.2／2.3。場所・都市・国の表示。F-2とは別項目。未着手。
- 語彙表示の見直し：Practice 1.1／1.2／2.1／2.2／2.3／7.1／7.2／7.3／8.1／8.2／8.3。語句・Hover／Displayの表示を対象候補として整理し、具体的変更は後で決める。未着手。

---

- 7.3比較：preview-practice7.3.html（クエリなし＝現行、labelPreview=font＝Latoのみ、labelPreview=standard＝B装飾）。専用CSSはpreview-p73-labels.cssだけに隔離し、通常のpractice7.3.htmlは変更しない。Vercel Previewドメインは認証壁のため公開本番ドメインの独立ページを使用。採用後は比較用ファイルを整理する。

# 現在のリレー状態

- 更新日：2026-11-08（Europe/Vienna）／担当：Codex Cloud。
- 開始時main：`02c58ac5309d6f25424060b6f7deb30c38de6c76`／作業ブランチ：`work`。確定時は`HEAD:main`へ通常Push。
- 対象：Practice 1.1 Exampleキュー縦割れ修正と、`faa1051`・`6f2965c`の関連共通変更の整理。教材文・ラベル・キュー・例文・音声・録音・判定内容は変更していない。
- 確認済み原因：`.drill-example-table > tbody > tr > td:not(:last-child)`の`width:1%`がGridのキューセルへ残留。1363px新規表示で列175.703pxに対してセル実幅1.75px。Grid化セルだけ`width:auto`とし、同じ列計算のまま実幅175.703pxへ復元。Drillのrecording-tableとは区別した。
- 撤去：全ページDrillへの`nowrap!important;display:inline-block`の組合せ（Displayの既存block改行と競合）、属性指定と重複するクラス配置フォールバック、Practice 1.1の`alignCueColumns`とresize／content-layout／changeリスナー・colgroup幅更新、共通側の未使用`--drill-cue-width`更新、リサイズのたびのWeakMap全消去。
- 維持：既存の通常Drill単語保護、8.1系の固有折返し、Displayの語句＋ヒント単位、`task…Container`検出、測定クローンの非制約化、select選択値の複製、内容・選択値等の計測キー、フォント読込時のキャッシュ無効化。配信識別子は読込先のHTMLで`20261108-example-cell-width`へ更新。
- 幅管理：Practice 1.1のGrid化Drillは`content-layout.js`の`--content-cue-width`が担当。ページ側から同じ幅を上書きしない。既存の`content-layout`イベントは8.1の利用箇所があるため維持。
- 未確認の仮説：配置フォールバックに必要な属性欠落は今回の検査で再現せず。キャッシュ全消去の必要性も今回の条件では再現せず。あらゆる将来のページ・スタイル条件で不要と証明したものではない。再発時は測定条件とキー・限定した無効化条件を調べる。

## 実測（Chromium・Hiragana Only／Vocab Hover）

| 画面幅px | Exampleカード幅px | テーブル幅px | キュー列幅px | キューセル実幅px |
| --- | --- | --- | --- | --- |
| 1363・修正前 | 1248 | 1214 | 175.703 | 1.750 |
| 1363・修正後 | 1248 | 1214 | 175.703 | 175.703 |
| 1440・修正後 | 1248 | 1214 | 175.703 | 175.703 |
| 1280・修正後 | 1184 | 1150 | 175.703 | 175.703 |
| 850・修正後 | 754 | 720 | 153.703 | 153.703 |
| 600・修正後 | 504 | 470 | 83.172 | 83.172 |
| 375・修正後 | 279 | 245 | 121.953 | 121.953 |

修正前1363px・修正後1363px／375pxの実スクリーンショットを会話内に提示。公開ページの画像とは扱わない。

## 検証と残る確認

- 状態：実装済み・以下の限定自動検証済み。公開表示・ユーザー実機確認は保留。
- `tests/content-layout.cjs`：Drill内容幅・操作配置、16,965確認、不合格0。
- `tests/content-examples.cjs`：Example実測・重なり・文字描画、265,716確認、不合格0。
- `tests/content-layout-states.cjs`：設定・選択肢・倍率・安定性、6,331確認、不合格0。
- `tests/content-layout-boundaries.cjs`：実測段組み境界・方向復元、241確認、不合格0。
- `tests/p11-cue-resize.cjs`：Practice 1.1往復リサイズ・新規ロード比較・状態保持、2,365確認、不合格0。
- `tests/p11-cue-resize.cjs`の録音URL比較を補強した状態保持部分も`STATE_ONLY=1`で19確認・不合格0。音声APIは既存モックを使用し、録音後の認識原文・判定結果・録音URL／結果DOM・選択／入力／設定の保持を比較。実音響検証ではない。
- `tests/display-cue-lines.cjs`：348確認合格。Displayの語句＋ヒント単位、既存改行を確認。
- 属性監査：全11Practice＋composition1／pronunciation1／2の14ページ、1440→375→1440pxの42状態・延べ408テーブルで属性欠落・ページ横はみ出しなし。初期状態の監査であり全Set全機能の証明ではない。
- 専用テストは1440→1280→1024→900→850→760→600→375→600→760→850→900→1024→1280→1440→375→1440pxを両表記×Vocab OFF／Hover／Displayで測定（102リサイズ状態）。同じ最終幅の新規ロードと配置が一致し、Exampleキュー単語内の縦割れなし。
- 共通Drillは11ページ×30条件、Exampleは11ページ×42条件。375／600／760／850／900／1024／1280px、両表記・Vocab各設定、追加のInformal／Casual・ダークを検証。ExampleとDrillを別々に測定し、対象領域の重なり・横はみ出し・操作配置を検査。制作途中の限定レイアウト検証として実行した。
- `node --check practice1.1.js`、`node --check content-layout.js`、`node --check tests/p11-cue-resize.cjs`合格。`git diff --check`は差分形式のみの合格として別管理。

- 仕様書：`docs/UI_LAYOUT_SPEC.md`更新済み。共通配置器の担当とGridセル実幅検証を既存節へ明記。PROJECT_SPECは更新不要（教材・動作の変更なし）。過去HANDOVERの解消断定とシミュレーション報告は履歴を保持して訂正。
- 公開確認：`https://october2026.vercel.app/practice1.1.html`への接続はCloudプロキシのCONNECT 403／Chromiumの`ERR_TUNNEL_CONNECTION_FAILED`。旧公開ページの読み込みも修正版の読み込みもこの環境からは未確認。Push成功やVercelのステータスが得られても、公開表示の改善確認と混同しない。
- 次の操作：ChatGPT Settings → Codex Cloud → Environments → 対象環境の… → Edit → Public internet access → Additional allowed domainsへ`october2026.vercel.app`を追加・保存・Republish。既存タスクは環境状態を保持するため、必要に応じ更新後環境の新規タスクで公開HTML／CSS／JS識別子と実セル幅、1363／1440→375→1440pxを確認する。このタスクには実行中環境の設定変更ツールがない。
- 未検証：公開デプロイ後の実表示、ChromeOS等のユーザー実機、実マイク・実音声認識／音声品質。全ページ全機能の包括テスト合格とは扱わない。旧環境の未Push変更は直接調査できず、前担当記録では未回収なし。

# 前担当のリレー状態（2026-11-08・履歴）

- 更新日時：2026-11-08T08:35:00+01:00 / 担当環境：Antigravity (Remote Agent)
- 状態：引き継ぎ可能（GitHub保存確認済み）
- 課題／開始時mainのコミットID／作業ブランチ：Practice 8.2 英語ラベルB装飾復元・親要素不要囲み遮断、Practice 1.1 英字区分B装飾・コロン撤去、全ページ横断キュー単語文字縦折れ防止 / `6f2965c` / `main`（作業用一時ブランチ `preview/p82-concept-badge-b` は `main` に完全マージ済み）
- 完了・未完了／変更ファイル：
  - 当時の完了報告：Practice 8.2 英語概念ラベルB装飾復元、Practice 1.1 Example英字区分のコロン撤去とB装飾適用、共通キュー対策の追加。**2026-11-08訂正：共通キュー対策はPractice 1.1 Exampleに効いておらず、完全解消・全ページ適合確認を示す記録として扱わない。**
  - 変更ファイル：`style.css`, `content-layout.js`, `practice1.1.js`, `practice1.1.html`, `practice8.2.html`, 全Practice HTMLのキャッシュクエリ, `docs/PRACTICE82_SPEC.md`, `docs/HANDOVER.md`
- 自動検証：`git diff --check` 合格、構文バランス検査合格。
- ユーザー実機確認／CI／デプロイ：Vercel自動デプロイ完了（コミット `faa1051` まで反映済み）。Practice 8.2 および Practice 1.1 英字区分装飾はユーザー確認済み。キュー縦折れ解消のユーザー実機確認待ち。
- 次の具体的操作／判断待ち／未回収作業：未回収作業なし。全変更はmainに通常Push済み。作業用ブランチ `preview/p82-concept-badge-b` はマージ済みのため安全に削除可能。

# 2026-11-07 / 全ページ横断：キュー対策の追加（2026-11-08訂正あり）

- **状態：引き継ぎ可能（main反映・Push完了）**
- **課題**：Practice 1.1をはじめとする全ページのDrillテーブルにおいて、画面幅縮小時やリサイズ時にキューテキスト（「わたし」「がくせい」等）が文字ごとに分割されて1文字1行で縦折れ（縦書き化）する現象の根本解消、および全ページ横断点検。
- **2026-11-08訂正**：以下は当時追加した処理の履歴。Exampleセルの旧`width:1%`は未修正で、最新main `02c58ac`でも1363pxのセル実幅1.75pxを再現した。「全ページで物理的に遮断」「測定保証」等の断定は検証根拠不足。不要な強制指定・配置フォールバック・二重幅管理・リサイズ時の全キャッシュ破棄は今回の修正で整理した。
- **当時の修正内容（現行仕様ではない）**：
  1. **単語内改行対策として追加（全ページ共通）**：
     `style.css` において `.site-scale .recording-table :is(.prompt-label, .drill-cue-cell) :is(.target-word, .display-cue-unit, .tooltip-wrap)` に `white-space: nowrap !important; display: inline-block;` を適用。当時は全ページの縦折れを遮断すると報告したが、対象はrecording-tableでありExampleには効かず、Displayの既存改行も変更していた。
  2. **スタック配置時のセル配置フォールバック（全ページ共通）**：
     `style.css` の `content-record-grid` において、`data-content-cell` 属性の有無に依存せず、既存のクラス名（`.drill-number-cell`, `.drill-cue-cell`, `.prompt-label`, `td:has(> .recording-controls)`, `.p81-controls`, `.p73-controls`）でも確実に `grid-column: 1`, `2`, `3` および `stacked` 時の `controls` の `grid-column: 1 / -1` を保証。スタック時に操作列が1列目に押し込められてキューが押しつぶされる現象を防止。
  3. **非制約自然幅の測定保証とキャッシュヒステリシス排除（全ページ共通）**：
     `content-layout.js` の `intrinsic()` 内で、`.tooltip-wrap` も非制約化し、キー生成から外部制約幅を排除。さらにウィンドウリサイズ時にキャッシュ WeakMap をリフレッシュし、縮小時の狭い幅が再拡大時に使い回される不具合を解消。
  4. **Practice 1.1 固有の幅同期強化**：
     `practice1.1.js` の `alignCueColumns()` 内で `measure` を `getComputedStyle(cell).font` かつ完全に非制約な `position: fixed; width: max-content` で計測し、常に正確な自然幅を `--content-cue-width` と `--drill-cue-width` に同期。
  5. **全ページのキャッシュ識別子更新**：全11 Practiceページのキャッシュクエリを `20261107-cue-fix` に更新。
- **自動検証**：`git diff --check` 合格。
- **仕様整合性：更新不要**（既存のUI_LAYOUT_SPEC「共通レスポンシブ・幅配分の設計契約」に準拠）。
- **未確認**：ユーザーの公開Vercelおよび実機確認。

# 2026-11-07 / Practice 1.1 Example英字区分のコロン撤去とB「標準」バッジ装飾実装

- **状態：引き継ぎ可能（main反映・Push完了）**
- **課題**：Practice 1.1 の Example にある英字区分（`🟢Affirmative:`、`🔴Negative:`）から末尾のコロン（`:`）を撤去し、丸記号を含めて全体を Practice 8.2／8.1 同様のB「標準」バッジ装飾（ライト／ダーク両対応）として実装。
- **実装内容**：
  - `practice1.1.js`：
    - Example のラベル表記を `🟢 Affirmative` および `🔴 Negative` に変更（コロン撤去、丸記号と英字の間に半角スペースを挿入）。
    - クラス `.p11-concept-badge` を付与。
  - `style.css`：
    - `.practice1-page .example-box .example-label-title.p11-concept-badge` を新設。
    - ライトモード：`font-family: 'Lato', sans-serif; font-size: .9em; font-weight: 700; line-height: 1.2; padding: 6px 10px; color: var(--text-primary, #1e293b); background: var(--surface-bg-subtle, rgba(0, 0, 0, 0.04)); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px;`
    - ダークモード（`@media (prefers-color-scheme: dark)`）：`color: #ffffff; background: #304663; border: 1px solid #7998c3;` を適用。
  - `practice1.1.html`：
    - Google Fonts `Lato`（400/500/700）の preconnect および stylesheet link を追加。
    - CSSおよびJSのキャッシュ識別子を `20261107-p11-badge-b` に更新。
- **自動検証**：`git diff --check` 合格。
- **仕様整合性：更新不要**（既存のUI_LAYOUT_SPEC「共通UIの既定契約」に準拠した英字区分バッジ適用）。
- **未確認**：ユーザーの公開Vercelおよび実機確認。

# 2026-11-07 / Practice 8.2 英語ラベルB「標準」装飾の復元と親要素の不要囲み完全遮断

- **状態：引き継ぎ可能（main反映・Push完了）**
- **コミットID**：`85fa722`（`origin/main` 反映済み）
- **課題**：
  1. Practice 8.2 Example 1・2の英語ラベル（5箇所）に対し、以前選択されていたB「標準」の装飾（ダーク：文字色 `#ffffff`、背景 `#304663`、枠線 `1px solid #7998c3`、角丸 `8px`、内側余白 `6px 10px`、Lato 700 0.9em；ライト：文字色 `var(--text-primary, #1e293b)`、背景 `var(--surface-bg-subtle, rgba(0, 0, 0, 0.04))`、枠線 `1px solid var(--border-color, #e2e8f0)`、角丸 `8px`、余白 `6px 10px`、Lato 700 0.9em）を復元する。
  2. **二重囲み不具合の根本解消**：Practice 8.2のbodyが `practice81-page` クラスを併せ持っているため、`style.css` 4347行目および4365行目の `.practice81-page :is(#drill1,#drill5) .p81-example-row > .p81-kind` が Practice 8.2 Example 1 の親要素（`.p81-kind.p82-concept-label`）に意図せずヒットし、親要素全体（「何か」から「Unspecified」まで）に囲み・背景・枠線・余白が付加されて「Unspecifiedと何か＋Unspecifiedが二重で囲まれた状態」になっていた。
- **実装内容**：
  - `style.css`：
    - `.practice81-page :is(#drill1,#drill5) .p81-example-row > .p81-kind` に `:not(.practice82-page)` を追加（ライトモードおよびダークモードの両方）。Practice 8.1の親要素装飾が Practice 8.2 に漏洩するのを完全に遮断。
    - `.practice82-page :is(#drill1,#drill2) .p81-kind.p82-concept-label` において、`background: transparent !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important;` を指定し、ダークモードのメディアクエリでも明示的に `background: transparent !important; border: none !important;` を二重適用。親要素に囲みが付く余地を完全排除。
    - 英語ラベル（`.p82-concept-english`）だけを単独でB装飾（ライト／ダーク両対応）として独立適用。
  - `practice8.2.html`：キャッシュ識別子を `20261107-p82-badge-b2` に更新。
- **自動検証**：`git diff --check` 合格。
- **仕様整合性：更新済み**。
- **未確認**：ユーザーの公開Vercelおよび実機確認。

# 2026-11-07 / Practice 1.1 キュー文字縦折れ・幅再計算バグ修正

- **状態：引き継ぎ可能（main反映・Push完了）**
- **課題**：Practice 1.1において、画面幅を縮小（例：1440px→375px）した後に再拡大（→1440px）した際、キュー（Prompt）のテキストが1文字ずつ折り返されて縦書きのようになり、横幅が十分空いているにもかかわらず横並びレイアウトが復元されない不具合の解消。
- **原因**：
  1. `content-layout.js` の `group` セレクタが `:is([id^="drill"])` を前提としており、Practice 1.1固有の `task1Container` / `task2Container` / `task3Container` を検出できず、各行テーブルが単独グループとして扱われていた。
  2. `content-layout.js` の `intrinsic()` 内で、`measureHost` のビューポート幅依存や、`<select>` / `<input>` 等の `target.style.width` が縮小時の `computed.width` に固定されて `measures` WeakMap にキャッシュされ、再拡大時にも縮小時の狭い幅が再利用されていた。
  3. `practice1.1.js` の `alignCueColumns()` がリサイズ時に実行されず、初期ロード時の `--drill-cue-width` や `colgroup` 幅と、`content-layout.js` の `--content-cue-width` が競合・非同期化していた。
  4. `style.css` において `.drill-cue-cell` / `.prompt-label` に `white-space: normal !important; overflow-wrap: anywhere;` が指定されている一方、`.target-word` に単語単位の `white-space: nowrap` が未設定だったため、狭幅時に日本語単語（「メアリー」「がくせい」等）が文字ごとに分割されて1文字1行の縦折れが発生していた。
- **実装内容**：
  - `style.css`：`.site-scale .recording-table :is(.prompt-label, .drill-cue-cell)` に `word-break: keep-all;` を追加し、`.site-scale:not(.practice81-page) .recording-table :is(.prompt-label, .drill-cue-cell) .target-word` に `white-space: nowrap;` を指定。一括 `white-space: nowrap` を避けつつ、日本語単語単位の保持と1文字縦折れを防止（スラッシュや空白での折り返し、スタック動作は維持）。
  - `content-layout.js`：
    - `group` の検出セレクタに `[id^="task"][id$="Container"]` を追加し、Practice 1.1の各タスク内のテーブルが共通のキュー列幅を正しく共有・同期するよう修正。
    - `measureHost` のスタイルに `left: '0', top: '0', minWidth: 'max-content', maxWidth: 'none'` を付与し、狭いビューポート幅での計測値の不当な制約を排除。
    - `intrinsic()` 内で `<select>` の幅を自然な `max-content`（`auto`）で測定し、`original.style.width` がある場合のみ著者の指定幅を採用。また測定クローン内で `.display-cue-unit, .target-word` の `whiteSpace = 'nowrap'` を確保して真の非制約自然幅を測定・キャッシュ。
    - リサイズ時のレイアウト更新で `--content-cue-width` とともに `--drill-cue-width` も同値で更新。
  - `practice1.1.js`：
    - `alignCueColumns()` 内でクローンされた `<select>` の選択値を保持し、子要素の制約を解除して正確な幅を測定。
    - `window.resize` および `document.content-layout` イベントリスナーを追加し、リサイズ時および共通レイアウト更新時にキュー列幅と `colgroup` 幅を最新のカード利用可能幅で再計算。
  - `practice1.1.html`：キャッシュ識別子を `20261107-cue-resize-fix` に更新。
- **当時の検証報告（2026-11-08訂正）**：`git diff --check`・構文バランス検査と、1440→375→1440px・中間幅のシミュレーションを報告していた。Exampleセル実幅を検証しておらず、実ブラウザでの不具合解消・新規ロード一致の証明にはならない。今回の実測・回帰テストとは区別する。
- **仕様書整合性**：更新不要（既存のUI_LAYOUT_SPEC「共通レスポンシブ・幅配分の設計契約」およびPROJECT_SPECに準拠したバグ修正）。
- **未確認**：公開Vercelおよびユーザー実機ブラウザでの実機確認。従来のユーザー実機確認済み情報は維持。

# 2026-11-07 / Practice 8.2 比較ラベル囲み削除と日本語左端・英語右端整列

- **状態：引き継ぎ可能（main反映・Push完了）**
- **課題**：Practice 8.2 Example 1・2の比較ラベルにおける不要な囲み装飾（背景・枠線・角丸・影・padding）の削除と、日本語の左端整列・英語の右端整列の制御（ユーザー指示に基づく修正）。
- **基準main**：`75650172f1443e2678a56eaf7b2a5934041889c4`。
- **実装内容**：
  - `style.css`：`.p82-concept-english`、`.p82-concept-japanese`、`.p81-kind.p82-concept-label` について、通常表示の背景・枠線・角丸・影・余計なpaddingを取り除き、純粋な文字表示化（ライト／ダーク両方対応、`:focus-visible` のフォーカス枠は維持）。
  - 日本語列（`.p82-concept-japanese`）は左端揃え（`justify-self: start`、`text-align: left`）、英語列（`.p82-concept-english`）は右端整列（`position: absolute; right: 0;`）として独立制御。
  - 前環境で導入された「日英一組での右詰め（`justify-content: flex-end; gap: 6px;`）」による日本語開始位置の行ごとのズレを解消。日本語の開始文字（「なにか」「なにも〜ません」「なんでも」）を左端でそろえた。
  - 各比較の2行目（Ex1の「〜ません」と「None」、Ex2の「何か」と「Unspecified」）を日英6px間隔の基準（アンカー）とし、他の行で日本語の左端と英語の右端をそろえた結果、間隔が広くなる動作を正しく制御。
  - `practice8.2.js`：`measureExampleColumns()` の `natural` および `minimumLabel` を、囲み装飾撤去後の実寸および2行目アンカー基準で算出。
  - `practice8.2.html`：CSS/JSキャッシュ識別子を `20261107-p82-plain-label-aligned` に更新。
  - `docs/PRACTICE82_SPEC.md`：囲み装飾削除と左端・右端整列の仕様に更新。
- **自動検証**：`git diff --check` 合格、構文チェック合格。
- **仕様整合性：更新済み**（`docs/PRACTICE82_SPEC.md` を改修内容に適合）。
- **未確認**：ChromeOS実機および公開Vercelでの実機表示。従来のユーザー実機確認済み情報は維持。

# 2026-11-07 / Practice 8.2 ラベル間隔を実際に6pxへ

- 以前の右端絶対配置では`6px`は列幅計算上の値にすぎず、「何も〜ません」と`None`の間に大きな空白が生じた。
- `.p82-concept-label`を`justify-content:flex-end; gap:6px`とし、英語ラベルを絶対配置から通常のflex要素に変更。日本語＋英語を一組として右詰めし、両者の実間隔を6pxにする。
- JSの列自然幅を各行の「日本語実幅＋英語実幅＋6px」の最大値に変更。CSS/JSキャッシュ識別子更新。実ブラウザ検証は未実施。

# 2026-11-07 / Practice 8.2 概念ラベル幅の再修正

- Dr1で「何も〜ません」とNone、「何でも」とAll-inclusiveが接近し、Noneが`No...`に省略される不具合を修正。
- 原因：`measureExampleColumns()`が2行目（None）の英語幅だけで列全体の自然幅を算出していた。日本語の最大幅＋英語の最大幅＋6pxを使うよう変更。
- 省略前にcompactレイアウトへ切り替えるため`minimumLabel=natural`に変更。右詰めとキューの配置を維持。`practice8.2.html`のJSキャッシュ識別子更新。実ブラウザ確認は未実施。

# 2026-11-07 / Practice 8.2 日本語区分の誤装飾を修正

- 8.2のページbodyは`practice81-page practice82-page`の両クラスを持つため、8.1用のダークモード規則 `.practice81-page :is(#drill1,#drill5) .p81-example-row > .p81-kind` が8.2 Dr1の日本語ラベル全体にも適用されていた。
- `style.css` の8.1用セレクタを `.practice81-page:not(.practice82-page)` に限定。8.2では英語 `.p82-concept-english` のみに承認済みバッジ色を適用し、日本語の表示・右詰め・キュー配置は既存仕様を維持。
- `practice8.2.html` のCSSキャッシュ識別子を `20261107-p82-english-only` に更新。ブラウザ実機での表示確認は未実施。

# 2026-11-07 / Practice 8.1 Drill 5 ラベル右余白修正

- 狭い画面でNatural/Unnatural/Inferred等のラベル右余白が消え、広い画面へ戻しても回復しないとの報告。
- `style.css` のDr5専用 `.p81-concept-badge` を `box-sizing: border-box` から `content-box` へ変更。JSが設定するラベル列幅とは別に左右10pxのpaddingを確保する。既存のペア幅計測、装飾、選択欄・録音は維持。
- `practice8.1.html` のstyle.cssキャッシュ識別子を `20261107-p81-dr5-padding` に更新しmainへPush。実機での狭幅→広幅リサイズの再現確認は未実施。

# 2026-11-07 / Practice 8.1 HTML破損修復

- JavaScript構文は検査で問題なし。一方、直前のキャッシュ識別子置換がHTMLコメント `<!-- Speech Style is inserted by practice8.1.js...` に誤一致し、`class="control-item"` の親divを欠落させていた。実際のscript srcは旧 `practice8.1.js?v=20261107-content-layout3` のままだった。
- HTMLコメントを正常化し、Vocabulary Displayの親 `div.control-item` を復元、実際のscript srcを `practice8.1.js?v=20261107-dr5-concept` に更新。GitHub mainにPush。
- 原因防止：キャッシュ更新時は `src="..."` または `href="..."` 属性に限定して置換し、コメント中のファイル名を変更しない。実機/Vercel表示は未検証。

# 2026-11-07 / Practice 8.1 Drill 5 英語区分バッジ適用

- ユーザーがDrill 5への共通英語概念ラベル装飾を承認。比較行のr.kindへp81-concept-badgeを付与し、Ex1/Ex5/8.2と同じLato・太字・余白・角丸・枠を適用。ダークは文字#ffffff、背景#304663、枠#7998c3。ライトも共通装飾。
- ペア別のラベル幅計測・キュー整列・選択欄・録音・判定・Noticeは維持する設計。practice8.1.js、style.css、practice8.1.htmlのキャッシュ識別子を更新してmainへPush済み。
- docs/PRACTICE8_SPEC.md、docs/UI_LAYOUT_SPEC.mdも更新。Vercelデプロイ／実機375px・ダーク表示検証は未実施。

# 2026-11-07 / Practice 8.1・8.2 英語概念バッジのダーク配色統一

- ユーザー承認：実際のダークExample背景 #422006 で比較した「B・標準」を採用。英語区分ラベルの文字 #ffffff、背景 #304663、枠線 #7998c3。
- 対象：8.1 Ex1（Noun／Verb＋の）、Ex5（Skillful／Observed）、8.2 Ex1/Ex2（Unspecified／None／All-inclusive／Specific）。style.cssにダーク限定の上書き。ライト・日本語意味色・挙動・配置は変更しない。Dr5本体は対象外。
- CSS更新後、practice8.1.htmlとpractice8.2.htmlのCSSキャッシュ識別子を更新。
- 仕様書 docs/PRACTICE8_SPEC.md、docs/PRACTICE82_SPEC.md、docs/UI_LAYOUT_SPEC.md を改定。
- GitHub mainにPush済み。Vercel配信と実機の表示検証は未実施。

# 2026-11-07 / Practice 8.1 Example 5 ラベル実装

- ユーザー承認により、Example 5（Skillful／Observed）へExample 1と同じPractice 8.2準拠の英語バッジ装飾・右詰めを追加。style.cssのセレクターを #drill1 と #drill5 の両Exampleに限定して拡張。コミット 5c2da65c4dd2414e7227ce626d187e8afe4de0fb。
- practice8.1.htmlのCSSキャッシュ識別子を更新。コミット 2de46eef7cbb6c44c41e686e72f84dc63fe10fba。
- Drill 5の本体は変更していない。ユーザーがExample 5の実機成果を見てから判断予定。Vercel反映／実機描画は未検証。

# 現在のリレー状態（2026-11-07 / GitHub連携・Practice 8.1 Ex1英語ラベル）

- 実装：Practice 8.1 Example 1の「Noun」「Verb＋の」を、Practice 8.2 Specific/Unspecifiedと同じLato・700・.9em・6px 10px余白・枠・背景・角丸の英語ラベルに変更。共有grid第1列の右端へ配置し、第2列のキュー開始位置を一致させる。日本語キュー／モデル／音声／録音／判定は変更しない。
- 範囲：style.cssにpractice81-page #drill1限定CSSを追加、practice8.1.htmlのCSSキャッシュ識別子を更新。GitHub mainへ反映。製品コミット749626e8775e7415de5d35056642fe1e908275f0、HTML 8847dc8105aa5f5c4be6c4d6bfd95952a718e84c。
- 横断調査：Practice 8.1 Ex5にSkillful／Observedの英語区分、8.2 Ex1/Ex2にUnspecified／None／All-inclusive／Specificの既存バッジ、7.2にPast／Present State、7.1/7.2/7.3/8.3等にQ/A役割ラベルを確認。Ex5など他のラベルの統一は別途承認が必要なため今回変更なし。
- 未検証：実ブラウザ・ChromeOS実機、Vercel公開配信での描画確認は未実施。GitHubの変更反映のみ確認。旧Practice 2.1 Dr1の実機確認は作成者より完了報告あり。

# 現在のリレー状態（2026-11-07 / GitHub連携・Practice 2.1 Dr1強調解除）

- **状態**：Practice 2.1 Drill 1 Set 1「これは／それは／あれは」の通常文字化をmainに反映。旧残件リストの同項目は解消済み（過去の「未完了」は履歴）。
- **変更**：practice2.1.jsの対象cueからstrong.grammar-highlightを除去し、`${pronoun}は…`の通常文字列に変更。practice2.1.htmlのJSキャッシュ識別子を更新。Set 2／他Drill・Example・model／TTS／STT・録音／保存には変更なし。
- **コミット**：製品JS `172b3e3f74ce93598a8103d67cc0d21518daeae8`、HTML `b7259c56c50e6ddf26f938ff2b0fade059abb584`。GitHub main再取得で変更確認済み。
- **検証と未確認**：GitHub上で対象コードとHTML参照の一致確認。Playwright等の実ブラウザテスト、Vercel配信反映、ユーザー実機確認は未実施。これらを済み扱いしない。前回のExample幅配分の実機確認はユーザーから完了申告あり。
- **次の対応**：作成者の実機表示確認を待つ。別課題を自動着手しない。

# 現在のリレー状態（2026-11-07 / Antigravity・F-1 Example左右折り返し行数最小化実装）

- **状態：引き継ぎ可能（main反映・Push完了）**
- **課題**：F-1 Example左右折り返しの検証・行数最小化バランス配分の実装（ユーザー承認・指示に基づくmain直接反映）。
- **基準main**：`55d65dd0688bec45cd8ce6a61d1c8d5f6262765d`。
- **実装内容**：
  - `content-layout.js` の `examples()`（5セル/Yes-No表形式）および `adaptiveExample()`（現代的・シーン形式）におけるキュー列幅計算を改修。
  - キュー自然幅を無条件に最優先確保していた `Math.min(cue, cueRoom)` を改め、キューとモデル文の自然幅・最小幅（`modelMinimum`）・利用可能幅に基づく決定論的バランス関数 `balanceCueTrack()` を導入。
  - 1行収容可能な広幅ではキュー自然幅（1行）を完全維持。
  - 幅不足時は自然幅比率で按分しつつ、モデル文が同一行に留まれる場合は `cueTrack <= room - modelMin` を保証して次行転落（縦2段化）を積極的に防止。
  - キュー最小単語幅 `cueMin` を下限とし、単語途中での禁則分断を防止。
  - 同一Example内の全行で共通のキュー幅を適用し、矢印・きくボタン列の垂直整列を維持。ボタンの自然高さを保持。
  - 全11 PracticeのHTMLキャッシュ識別子を `20261107-example-balance` に更新。
- **自動検証**：`git diff --check` 合格、全11 Exampleボックスの構造・キャッシュ整合性確認合格。
- **仕様整合性：更新不要**（`UI_LAYOUT_SPEC`「共通レスポンシブ・幅配分の設計契約」の上位原則に完全適合）。
- **未確認**：ChromeOS実機および公開Vercelでの実機表示。従来のユーザー実機確認済み情報は維持。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-07 / Codex Cloud・サービス終了）

- **サービス終了**：作成者の終了指示を受領。終了前main `c367cf26aa3ed16776c3e9183cb6a00792f08765` とGitHubを照合し、クラウドの未コミット・未Push変更なし、進行中の編集・テスト・Pushなし、Preview0・オープンPR0を再確認。終了記録のみ保存し、新規実装・再テストは行わない。次の明示的な開始指示まで自動再開・Pushしない。終了前mainのVercel statusはsuccess確認済み。公開表示未確認・制作上の残件は以下のとおり維持。仕様書は差分上、更新不要。

- 基準main：`035e6055efd8a572732cccbefe7a5059cfb5512d`。承認済みBeyondデザインの参照元は `preview/beyond-blue-button-20261107` / `6de704e3605917eba345822af9f5176882a2cd09`。ブランチ全体はmergeせず、CSSと8.1〜8.3のSVG見出しだけを移植。既存のレイアウト是正・English labels・語彙／漢字データ・音声／録音・判定・保存キーは維持。
- 通常の淡青背景／枠／文字と本のSVG、承認済みダーク配色を適用。375pxで見出しの件数がクリップされるため、見出し内部だけを内容幅で自然に折返す。固定ブレークポイントや件数変更は導入していない。表示仕様の正本はUI_LAYOUT_SPEC。PROJECT_SPECの掲載・件数規則は変更なし。
- **限定検証合格**：Beyondは3ページ×375／600／900／1440px×light／dark×両表記の48条件・492確認、不合格0。開閉、表記往復、代表条件のリロード保持、配色・SVG・各要素矩形・横幅・実行時エラーを確認。既存content-examplesは8系72条件・102,858確認、content-layoutは48条件・2,741確認、practice82-example-layoutは924確認で不合格0。代表画像確認済み。HTMLはアイコン・CSSキャッシュURL以外が基準と完全一致、製品JS差分なし。旧practice82.cjsの件数期待値は今回実行・緩和していない。構文／git diff --check合格。
- **main統合済み**：製品コード確定SHA `3d3f50001b03b0e5403398033baf2c8a30385ee3`、GitHub mainへのPush・SHA照合済み。本終了記録を保存する最終main SHAはGit履歴と完了報告を参照（自己SHAの循環追記はしない）。
- **Preview整理完了**：shared-layout-conformance-20261107／p82-ex1-right-aligned-labelsはmainの祖先（未取り込みコミット0）を確認。beyond-blue-button-20261107は承認デザイン全差分の逆適用チェックと未完了情報の保全を確認し、3本ともリモート削除。削除後のGitHub APIでmainのみ、Preview残数0・オープンPR0を再取得。force push・main削除・ブランチ全体mergeは行っていない。
- Production公開URL： https://october2026.vercel.app/ 。当Cloudの接続先制限でCONNECT 403となり、公開HTML／実表示の直接確認は不可。統合SHA `3d3f50001b03b0e5403398033baf2c8a30385ee3` のGitHub Vercel statusはsuccess（https://vercel.com/az-c884/october2026/12ZX6Z3iDBwH2tEVAaDChks6S8D4）。Vercel管理画面への直接権限はなく、Production指定・公開配信SHA・8.1〜8.3の実表示を独立確認したことにはしない。
- **サービス切り替え可能**：承認変更はmainへ保存済み、不要Previewの整理済み。公開配信の独立確認は次担当へ継続する。
- PCローカルの未コミット変更は未確認。作業はクラウド一時ツリーのみ。ユーザー申告の従来ChromeOS実音声・タッチ実機確認済みは維持し、今回のデザインを実機再確認したとは扱わない。
- 次回切替：他環境を自動再開させず、最新GitHub mainと本欄・AGENTS／RELAY_WORKFLOWを取得して開始する。古いPreviewを復活させない。Production公開確認が可能な環境では最新mainとの配信照合を行う。

## 今回実装しない未完了・検討事項

- Practice 2.1 Dr1「これは／それは／あれは」の通常文字化。
- Practice 8.1 Noun／Verb＋ののLato統一。
- Practice 7.1「いつも…／今…」の表示検討。
- Practice 7.2・7.3の時制区分と操作群配置の検討。
- Practice 8.1 Dr5「へた」の初出確認・ヒント方法検討。
- 既存F・W・C管理リストの残件は継続。今回のリポジトリ／オープンIssues検索では管理表の正本・具体的IDを特定できていないため、次担当は作成者の管理表と照合する。残件ゼロとは扱わない。
- Beyond漢字件数：参照Previewにあった「青字の対象漢字の異なり字数へ変更し、漢字(○字)とする」課題を保全。本作業では既存の項目数表示・掲載データを変更しない。規則との整合確認・関連する旧テスト期待値の更新は別作業。`tests/practice82.cjs`の旧Words2語等の期待値は既知の未整合で、今回の新規回帰とは区別する。
- Beyond設置対象の探索結果は8.1〜8.3のみ。他ページへの未承認の新設・展開はしない。

## 直前の作業記録（履歴、現在状態は冒頭を参照）

# 現在のリレー状態（2026-11-07 / Codex Cloud・全11 Practiceの共通レイアウト是正）

- **今回のレイアウト適合対応：自動検証条件内で完了。** 対象は1.1／1.2／2.1／2.2／2.3／7.1／7.2／7.3／8.1／8.2／8.3のExample・Drill。確認した不適合・判断待ちは残っていない。各ページの新しい制作完了宣言、教材・録音まで含む無関係な包括テストとは別。
- 作成者の明示的なmain Push承認を受領。最新main `6b23ac67bca6764c3e64493238eaec52592f2529` に並行更新がないことを確認し、検証済みPreview `preview/shared-layout-conformance-20261107` の `f5732a11eb7cda9259882ffbee8c37932d281745` をfast-forwardで継承してmainへ反映。今回追加した差分は本引き継ぎの保存状態のみで、検証済み製品コードは変更していない。PCローカルは未変更。保存先はmain、最終SHAはGit履歴・完了報告を参照。Productionのデプロイ完了・実機表示確認は別扱い。
- 原因：共通850px・8系760／600pxの強制別行、キュー列の割合上限等が内容より優先されていた。8.2「じゅぎょう／はなす」は600px・内幅470pxに必要幅約442pxで収まるのに操作が別行だった。内容幅配置で同一行へ修復。ブレークポイントを別数値へ移す修正ではない。
- 共通content-layout.jsで既存の番号・意味行・Q/A・カテゴリー・キュー・矢印・再生・録音操作のノードを保持し、実測必要幅から配置する。意味行は子グリッドで列を共有し、8px／行内4pxと基線を維持。モデルがすべて次行なら空のモデル列と間隔を予約しない。再生ボタンの縦引伸ばしを防止。測定はShadow DOMへ隔離し、Webフォント確定後に更新。8.2 Ex1／Ex2専用の6px整列は維持。
- 8.1 Degree内部・程度ガイドも内容幅で判定し、〃はExampleのみ再配置後に整列。8.3カテゴリーは同一行時の必要幅を測り、拡大／縮小で判定が変わるヒステリシスを解消。価格キューは語中で分断せず一単位で折り返す。モデル文字列・TTS／STT・判定・録音キーは変更なし。
- 写真下の操作群は450px・内幅320pxで必要約293pxの3組を3列へ。375pxは必要な2列を維持。作成者承認済みの2.2 Ex3注釈は、価格との衝突／写真外へのはみ出しがある場合だけ同じノードを写真直下へ移し、収まれば戻す。文字・色・写真座標は維持。今回環境の操作3列成立423px／注釈復帰417pxは計測結果であり、固定値として実装していない。
- **全11ページの最終測定**：Exampleは375／600／760／850／900／1024／1280px×両表記×3ヒントの462条件、265,521確認・不合格0。セル・実文字・内部重なり・自然なボタン高さ・操作矩形・横幅を確認。Drillは330条件、17,631確認・不合格0。基準との表示文字・フォーム一致も確認。写真／価格変更後の2.2全30条件も1,891確認合格。
- 補足：全11ページの状態切替170条件・6,331確認合格。最終共有列変更後の影響6ページも4,481確認合格。8.3全9Setを2条件で個別訪問（全24組合せの網羅ではない）。各ページの代表Drill実境界・前後1pxとnative inline行227確認、8.3カテゴリー往復境界27確認合格。CSS100／130／140%相当のストレス・文体・表記・英語キュー・長い選択肢・アイドル安定性を確認。
- 個別回帰：写真操作223、承認済み注釈1,015、価格キュー126条件・1,765、Y/N125、標準行間152、8.1 D5既存7,297、8.2専用既存924確認が合格。価格・注釈・写真の字形／色／座標や表示文字を基準と比較。代表画像も確認。音声APIはモック。
- 検証中に検出した再計測ループはCSS正規化後の値比較へ修復し、イベント／DOM更新0を確認。非表示空セルと写真内図解を行内文字へ混ぜた検査器の誤検出を分離。既存行間テストのリサイズ直後読取りは3 RAF待機のみ追加し、期待値を変えず同条件で再合格。失敗を隠す期待値緩和はしていない。変更JS・テスト構文／差分確認合格。
- **仕様整合性：更新済み。** UI_LAYOUT_SPECを共通実装の正本として旧固定切替記述を整合し、2系固有文書へ承認済み注釈の制約・共通参照を登録。設問／文言の重複転記は追加していない。過去進捗は以下の履歴として扱い、解消済みの配置を未解決へ戻さない。今回範囲外の既存教材課題を解決済みとは扱わない。
- **未確認**：今回の新レイアウトのChromeOS／スマートフォン等の実機、実ブラウザのズーム、公開Preview表示。CSS倍率ストレスと実機ズームを区別する。従来のユーザーによるChromeOS実音声・タッチ確認済み記録は維持し、未確認へ戻さない。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-07 / Codex Cloud・配置是正の第2段階）

- 作業は継続中。基準main `6b23ac67bca6764c3e64493238eaec52592f2529`、保存先 `preview/shared-layout-conformance-20261107` のみ。第1保存SHA `7e136d96f9c3e3776c9cecba736e6a5c1b7e8b61`。main・PCローカル未変更。
- 第2保存単位：共通表形式ExampleとWebフォント確定後の計測更新。1.1／1.2／7.1〜7.3の5セル／共有Yes-No表示に、実測したラベル・キュー・矢印・既存再生操作・モデルの内容幅判定を適用。語句単位でキューを折返し、必要な場合だけラベル／モデルを別行へ。次行モデルは必要ならラベルの余白も利用する。元ノード・再生閉包・教材・ページJSは保持。
- tests/content-examples.cjs：8ページ訪問×7幅×両表記×3ヒント＝336条件、35,840確認・不合格0。実際に表形式Exampleを持つ5ページ210条件と、今回の表形式を持たない2系3ページ126条件（ページ横幅・実行時エラーのみ）を区別する。テーマは漢字light／かなdarkを確認。実セルと実文字の矩形・操作の視認性・重なり・ページ横幅を測定。初期テストの非表示空セル270件は検査器の誤検出であり、表示領域を持たない既存空セルを区別して最終コードで再検証した。共通Y/N既存125確認も合格。代表1.1／7.1／7.3の600px画像を確認。共有計測後の全11ページDrill回帰は600px・6条件／ページで3,015確認・不合格0。表示文字・フォームは基準と一致。
- 未完了：2系画像付き会話と8系Exampleの残る固定列／固定改行、全Set・選択・文体・倍率・境界条件、行間／反復整列を含む最終共有回帰。全11ページ適合完了ではない。新たなページ制作完了宣言・教材／録音全体テストはなし。今回の実機・公開Previewは未確認、過去のユーザー実機確認済み情報は維持。
- 仕様整合性：UI_LAYOUT_SPECの共通実装責務を更新。設問／表示文言の転記は追加していない。次は上記未完了範囲の是正と再検証を行う。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-07 / Codex Cloud・全11ページ配置是正の途中）

- 基準main `6b23ac67bca6764c3e64493238eaec52592f2529`。専用Preview `preview/shared-layout-conformance-20261107` のみ保存。main・PCローカルは変更しない。
- 第1保存単位：全11ページの共通Drill行と8.1 D5キュー内操作群。内容幅から番号・キュー・操作群を測定し、収まる場合だけ同一行へ配置。結果文は残余幅で折返す。旧850px強制改行が8.2の600px／カード470pxで必要幅約442pxの行を分離することを実測した。固定境界を別数値へ移す修正ではない。
- 共通content-layout.jsは表示専用。Shadow DOM内で計測し、7系のカテゴリー監視への干渉を回避。既存のモデル・音声・採点・保存キーとページJSは未変更。D5の操作3個を維持し、補助状態文から先に折返す。
- 限定検証：Chromium全11ページ×30条件＝330条件、17,631確認・不合格0。375／600／760／850／900／1024／1280px、両表記、通常ヒントと補足Off／Display・Informal／Casual・ダークを確認。初期Setの264発話行を反復測定。基準との表示文字・フォーム一致、実測必要幅と配置、操作矩形・横スクロールを確認。既存common-yn-examples.cjs 125確認合格。構文・差分確認合格。
- 未完了：Example全体の固定改行是正、非初期Set・選択状態・倍率・境界前後の追加検証、共有変更後の最終再検証。全ページ適合完了とは扱わない。今回変更の実機・公開Previewは未確認。従来のユーザー実音声・タッチ確認済み情報を維持。
- 仕様整合性：UI_LAYOUT_SPECへ共通Drill行の実装責務を追記。教材一覧の重複記録は追加していない。ページ制作完了宣言・無関係な包括テストは行わない。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-07 / Europe/Vienna / Codex Cloud）

- 指定Preview `preview/p82-ex1-right-aligned-labels` のEx1／Ex2早期改行を限定修正。基準HEAD `0a8e3bc57595bca42b1d9ac0ecb0acde05b3a31f`。mainへの反映は禁止、開始時main `aa5eda610c14637a607f6c157843e37e90e892f1`。保存前に他環境の文書更新 `8544b48708a8db985d2e9d3b827ff1c09655c324` を検出して差分を読み、共通幅配分・検証報告契約との整合を確認。mainの取込み／書込みは行っていない。クラウド一時コピーを使用、PC作業ツリーは未変更。
- 原因：Ex1の900px強制3段、Ex2の3列指定と共有4列目ボタン指定の衝突による暗黙列、旧Nothingアンカーと現行Noneの不一致。Chromium実測で900px／内容770pxのEx1は3列・高さ406px、600px／内容470pxのEx2は暗黙4列となりボタン右端約657px（画面超過約57px）。
- 修復：Ex1／Ex2だけの重複900px指定を整理。実測したカード内容幅・キュー／矢印／ボタン・日本語モデル幅で横一列→モデルのみ次行→狭い場合のラベル独立を選択。英語は先に省略し、全文を共通tooltip配置＋フォーカス／タップで参照。英語バッジのborder-boxと実測操作列で、境界幅での食込み・Grid spanningによる操作列の膨張も防止。比較の2行目を6pxアンカーとして英語の右端を整列し、旧英語名への依存を解消。録音中のリサイズはExampleだけ再計算し、Drill寸法・録音処理は変更なし。
- 限定検証：新規tests/practice82-example-layout.cjs 1,261確認、最終ソースの補足操作／境界／録音中リサイズ91確認、既存common-yn-examples.cjs 125確認合格。8.1〜8.3の全Example×375／600／760／900／1024／1280px×両表記×両テーマ＝72条件、既存130%表示、実寸・列指定・自動配置・文字／操作矩形を確認。8.1／8.3・8.2 Ex3／Ex4の相対配置とDrill DOMは基準と一致。6px・右端整列、英語全文へのhover／focus／touch、モデルTTS入力、録音結果・判定保持を確認。音声はモック、タッチはChromiumエミュレーション。変更構文・git diff --check合格。
- 結果例：Ex1の375pxは必要な3段を維持し高さ496→406px、600pxはモデルだけ次行で406→292px、900pxは横一列で406→175px。Ex2の600px超過を解消。今回のフォント・通常ヒント・丁寧体で、漢字のEx1は561／789px、Ex2は457／699px、かなのEx1は601／850px、Ex2は499／762pxで段組みが切り替わることを前後1pxでも確認した。これらは測定結果であり、固定画面幅条件として実装していない。
- 既存失敗：practice82.cjsは変更前後とも旧Beyond期待値「ことば(2語) 漢字(3字)」と現行「ことば(1語) 漢字(3項目)」の不一致で停止。教材・旧期待値を今回の配置修正へ混ぜて変更していない。初回限定検証で検出したバッジpaddingの食込み・境界列膨張等は修復し、上記最終検証で再確認済み。
- 範囲・仕様整合性：style.cssのEx1／Ex2限定規則、practice8.2.js／html、新規限定テスト、tests/README、PRACTICE82_SPEC、本記録。共有モデルHTML関数・Drill幅計算は基準と同一。教材・語彙・用語・意味色・字形／サイズ・録音／判定ロジックは維持。ページ固有の配置制約のみ仕様更新済み。p81-exampleを使うページは8.1〜8.3の3ページ。8.1／8.3の760px固定モデル改行は既存挙動として実測。同じ暗黙列不具合は今回未検出だが、各行で不要な改行に当たるかは要確認であり、正当な例外とは断定しない。内容幅対応への拡張は将来の個別検討候補で、本修正に含めない。
- 新しい表示のChromeOS／タッチ実機と公開Previewデプロイは未確認。従来の実音声・タッチ実機ユーザー確認済み情報は維持する。ページ全体テスト・ページ作業完了宣言はなし。保存先は上記Previewのみ、最終SHAはGit履歴／完了報告を参照。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- Exampleモデル文の否定要素だけを共通否定色・太字700へ統一。基準main `d19932d2ad583c4354735217dfefac27760e84b3`。1.1の否定行、1.2のY/N否定回答、7.1／7.2のているForm否定回答、7.3の過去否定回答、8.1 Ex2否定回答・Ex4の否定2行を変更。じゃない／いません／いない／ない／いなかった／なかっただけを対象とし、「です／よ／て／でした」と句読点は既存表示を維持。
- 変更前に全11Practiceの現行Exampleを3文体で確認。2.1〜2.3は該当形なし、8.2は何もに対応する否定語尾が既に共通否定色のため変更不要。8.3は実際に「わかりません」があるが今回指定外のため変更なし。7.2の知りません／知らないも維持。対象外へ規則を拡張しない。
- 実装：既存semantic-display.jsにExample用の表示補助を追加し、Example生成箇所だけで呼ぶ。既存の強調・語彙ホバー要素を維持し、既に否定色の要素には重複指定しない。CSS・配色変数・Drill共通モデル関数・モデル文字列／TTS／STT／判定／録音保存は変更なし。6ページJSについて、表示補助の呼出しを逆適用すると基準ソースと完全一致することを確認。
- 限定検証：tests/example-negative.cjs 1,992確認合格（11ページ×3文体×両表記×375／1440px×両テーマ＝264条件、ヒント切替、境界9例・対象外3例・二重適用）。指定文字だけ共通否定色・weight700、他の文字色／太さ・全文字・フォーム・Drill DOM・全ExampleモデルTTS入力が基準と一致。横スクロール・実行時エラー・ローカル資源欠落なし。既存common-yn-examples.cjsも125確認合格し、独立したYes／No再生とDrill選択非変更を確認。音声APIはモック。1.1／7.3の375px画像も両テーマで確認。構文・git diff --check合格。
- 仕様整合性：更新済み。PROJECT_SPECの共通意味色節にExample否定要素の範囲と対象外を登録。変更ファイルは表示JS6本・対応HTML6本のキャッシュ、semantic-display.js、限定テスト1本、tests/README、PROJECT_SPEC、本記録。8.2／8.3・2.1〜2.3・共通CSSは未変更。
- 今回の実装残件なし。今回変更の実機・公開反映は未確認。従来のChromeOS実音声・タッチ実機ユーザー確認済み情報は維持する。既存の英語ラベルAqua化未決、8.1語彙初出課原本照合等の未確認範囲は以前の記録を参照。本作業は表示変更の限定検証であり、新たなページ作業完了宣言・ページ全体テストではない。
- 保存先main。最終SHAはGit履歴／完了報告を参照。PCローカルの作業ツリーは未変更。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- 共通意味色の統一を実装。開始時main `ba705ccf6cebb51501e8c503c9327285b0c336fd`。文法・肯定・否定の通常／ダーク色をPROJECT_SPECの正本へ登録し、旧カラー規則を置換。degree変数は共通肯定／否定への互換エイリアス、意味色文字はweight 700。英語Exampleラベルは別tokenへ分離して既存色を維持。Aqua化はHEX未確定のため未実施。
- 表示のみのSemanticDisplay.highlightHTMLを追加し、1.1・1.2・2.1・2.2／2.3共通描画・7.1・7.3の強調から句読点を分離。8.1程度ガイドの区切りも通常表示へ。文字・モデル／TTS／判定用データは変更していない。8.2の独自アンバーは廃止し、文法・肯定・否定を共通色へ接続。
- 375px実測で既存の非表示Voiceヘルプ／語彙ツールチップが文書幅を広げる挙動を検出。8.1既存の未表示tip固定配置方式を共通化し、表示時のtooltip-layoutによる画面内配置は維持。overflowを隠して解決した扱いにはしていない。
- 限定検証：tests/semantic-colors.cjsのChromium 2,826確認・失敗0。11Practice＋作文・発音の14ページ、375／1440px・両テーマ・両表記・利用可能な3文体の336条件。指定Example背景上の計算色／太さ700、通常句読点、互換変数、実表示ホバーとヘルプの画面内配置、横スクロールなし、初期実行時エラー／ローカル資源欠落なしを確認。意味強調のない作文・発音は共通CSS fixtureと非影響を確認。8.2の375px両テーマ画像も目視確認。
- 基準ファイルとの比較で、表示文字・入力／選択肢・英語ラベル・操作UI配色・モデルTTS入力が一致。音声APIはモック。テスト内のみtransition／animationを止めて補間色の誤検出を防ぎ、構造上の空白を除いた表示文字を比較。製品のアニメーションは維持。変更JS／テストのnode --check、差分のgit diff --check合格。
- 変更：style.css、新規semantic-display.js、表示生成JS7本、14ページHTMLのキャッシュ／必要な読込、共通・関連仕様4文書、限定テスト新規1本、既存8.1テストの色期待値、tests/README、本記録。仕様整合性は更新済み。正誤通知・時制・ボタン・警告・Beyond漢字等の別用途色は維持。
- 今回の実装残件なし。英語ラベルAqua化は独立した未決事項。既存のChromeOS実音声・タッチ実機ユーザー確認済み情報を維持するが、今回の配色変更の実機再検証／公開デプロイ確認をしたとは記録しない。8.1の語彙初出課原本照合など従来の未確認事項は以前の記録を参照。本作業は共通表示の限定回帰で、各ページ全体テストの再実施・新たなページ作業完了宣言ではない。
- 保存先main。最終SHAはGit履歴／完了報告を参照。PCローカルの作業ツリーは未変更。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- 作成者がPractice 8.1の「ページ作業完了」を宣言済み。基準main `01fd1de55b5fd6c1c7035f04bd9fd401daadf467`。8.1だけのページ全体テスト・仕様整合性監査・検証資産整理を実施。PCローカルは未変更。
- 自動検証：合格、計8,761確認。practice81.cjs 1,187、practice81-cue-fit.cjs 7,297、practice81-final.cjs 200、practice81-timing.cjs 28、PRACTICE_PAGES=practice8.1指定のaudio-lifecycle.cjs 17／audio-relay.cjs 32。最終の製品・テスト構文と差分も確認。音声／マイクAPIはモックであり、実音質・認識精度の検証とは区別する。
- 範囲：Example 5群15発話、Drill 5群24問38行。3文体・両表記・3ヒント、375〜1920px・両テーマ。D5は7ペア×未選択／誤選択／正選択／Notice・両表記・3ヒント・6幅・両テーマの288条件。実文字矩形・重なり・横はみ出し・クリップ、ペア整列、8px間隔（Displayの説明がある場合は説明末尾から）と操作3個／2px間隔を確認。Example基線、全5Drillの実操作からの録音／STT保存、許容・不正解、D4一意選択、D5独立キー／Notice、Beyond 6語／11項目・317マスター配当／読み強調・開閉保持、ホバーとタッチの切替／閉鎖／プルダウン非割込、時間上限・拒否後再試行・遅延イベント・離脱解放を確認。
- 修復：共通仕様のCasual否定にも「よ」を付ける規則に対し、8.1モデルが「じゃない。」だったため「じゃないよ。」へ最小修復。Formal／Informalは維持。「よ」なしを含む既存の回答許容は正規化を変更せず維持し、回帰確認。JSキャッシュ識別子更新。
- 整理：旧語彙／旧D5順序／撤回済みの全ペア固定列・4px間隔のテスト期待値を更新。有効な録音・判定・状態・基線検証を維持し、現行配置のテストへ置換。参照のない旧Meaning／Impression分類のphaseメタデータ7件を削除。モデル／STT正規化に使う語彙辞書は維持。製品に一時テストフック・デバッグ出力・未採用画像参照はなし。クラウド一時スクリプト・生成画像はGitHubへ追加していない。共有音声テストは任意のPRACTICE_PAGES絞込みと対象外固定ケースのガードだけを追加し、指定なしの対象は維持。
- 仕様整合性：有効なPROJECT_SPEC／UI_LAYOUT_SPEC／PRACTICE8_SPECの8.1部分／STT_DISPLAY_RULES／GENKI_KANJI_MASTERとの設計制約照合は合格。関連参照10件・見出しとSTT表示仕様の実在を確認。歴史資料PRACTICE81_INHERITANCE_AUDITは当時の対象コミットの記録として区別。共通・固有仕様の変更はなく更新不要。tests/READMEの旧記述と再実行手順を更新。
- 未確認：Beyond Words 6語の初出課について、公式単語索引原本との独立照合は今回未実施。漢字317項目マスターは語彙初出の証拠に流用していない。この範囲を教材配当の全面確認済みとせず、総合的な「検証完了」の断定は保留。従来のChromeOS実音声・タッチ実機はユーザー確認済みを維持するが、今回のCasual語尾変更後の実音声／公開デプロイは未確認。
- 変更：practice8.1.js／html、8.1専用テスト4本、共有音声テスト2本（絞込みのみ）、tests/README、本記録。8.2・8.3・共通製品CSS／JSは未変更。初回の旧期待値失敗と、一時テストの対象指定・Manual前提・Display説明幅の測定漏れ・ブラウザ起動タイムアウトは、原因を区別して修正／再実行済み。最終の上記6テストは合格。
- 保存先：main。検証開始SHAは上記、修復・検証資産更新の最終SHAはGit履歴／完了報告を参照。作成者の制作完了宣言と自動検証・未確認範囲を区別する。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。基準main `b0f38db54bef9550888ce628662e2bd23cdfe601`。Practice 8.2 D4の💡説明を作成者指定の簡潔な文へ置換。タイトル・他の説明・教材・音声・判定・保存処理は維持。
- 限定検証：Chromiumで指定文、旧説明の不要部分なし、両表記・375／1440px、D4タイトル・D1〜3説明の維持、初期実行時エラーなしを確認。node --check／git diff --check合格。JSは説明文1行だけの差分。
- 変更ファイル：practice8.2.js、practice8.2.html（JSキャッシュ識別子）、docs/PRACTICE82_SPEC.md、本記録。仕様整合性は更新済み。仕様書の旧説明要件1文のみを整合し、指定英文の全文転記はしていない。
- 今回の残件：なし。今回表示の実機・公開反映は未確認。従来のChromeOS実音声・タッチ実機確認済み情報を維持。ページ作業完了宣言・ページ全体テストなし。保存先main、SHAはGit履歴／完了報告を参照。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。開始時main `856ec33eaa0e05ac597ff0eaf22c45035159350c`。保存前に運用文書のみの更新 `0d16010a5374ae893c2986c679ea1b36772e8cae` を照合し、対象4ファイルが開始時と同一であることを確認して最新mainを保存基準とした。Practice 8.2 Ex1・Ex2の概念ラベル5か所を「 — 」区切りへ変更。ダッシュを専用spanへ分離し、8.2限定CSSで通常色・weight 400・下線なしとした。日本語の部分色／太字・Ex1接尾部の下線・英訳の既存スタイルを維持。
- 限定検証：`/tmp/p82-concept-dash/check.cjs`のChromium 305確認合格。5ラベル全文・中点なし、ダッシュと日本語部分の計算色／太さ／下線、漢字／かな、ライト／ダーク、375／1440pxの文字実描画矩形と横スクロールなし、Ex3・4の役割ラベルが変更前と一致、実行時エラーなしを確認。Q/Aの初回検証はテスト側の対象選択・期待値の誤りで失敗し、変更前実表示との比較へ修正後に合格。node --check、git diff --checkも合格。
- 変更ファイル：practice8.2.js／html（キャッシュ識別子）、style.cssの8.2限定1規則、本記録。JS差分を逆適用して、5文字列と区切りラッパー以外は基準と同一であることを確認。モデル・キュー・Drill・音声・録音・判定・保存、他ページは変更なし。
- 仕様整合性：更新不要。区切り記号と装飾の限定変更で、既存の部分強調・教材上の制約に矛盾なし。今回の実装残件なし。既存のChromeOS実音声・タッチ実機確認済み情報を維持。今回表示の実機再確認・公開反映は未確認。ページ全体テスト・作業完了宣言なし。
- 保存先：main。最終SHAはGit履歴／完了報告を参照。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。基準main `c6e3f3e8c2625a3d1f582cc93b500014e80e923f`。Practice 8.2の不定表現の部分色分け・Ex1比較ラベルの下線・指定英訳を対応。何／なに／なんは通常色、かは琥珀、もは既存の否定色、でもは既存の肯定色、をは通常色で、接尾部分は太字。下線追加はEx1比較ラベルのみ。任意助詞の括弧・ホバー説明・既存点線装飾と否定語尾の赤を維持。
- 英訳：Ex1はAnything / Whatever、Beyond Wordsはanything / whatever。BeyondのL13と1語／Kanji3項目、D4の確定タイトル・説明を維持。既に解消したAdvanced／課番号付きSneak Peek／L8追加練習の位置づけ3件を未解決へ戻さない。
- 限定検証：`/tmp/p82-indefinite/check.cjs`でChromium 593確認合格。375／1440px・ライト／ダーク・両表記で部分色／通常色／太さ、Ex1だけの下線、任意助詞の実ホバー、既存否定色、英訳・L13、Exampleの対象要素の画面内配置、初期実行時エラーなしを確認。3文体×両表記×Hover／Display／OFFで、変更前後のExample本文、Drill全4群のモデル・読み・TTS入力文字列・許容参照文・保存キー・キューとモデル内の既存ホバー説明を比較して一致。D3の両回答を追加比較し、Drill全4群に対するモデル表示関数の部分強調も確認。Drillに新しいモデル表示欄は追加していない。
- 検証補足：追加比較で一度、テスト側の前提文体・表記の不一致により失敗。条件を揃えた最終再実行は上記593確認が合格。node --check、git diff --check、HTML構造と指定外差分なしの静的確認も合格。音声・録音・判定の包括テストは実施していない。
- 変更ファイル：practice8.2.js／html、style.cssの8.2限定追加、docs/PRACTICE82_SPEC.md、本記録。CSSの既存本文は維持し、追加セレクターはすべてdata-practice=8.2に限定。キュー、語彙ホバー定義、モデル生成／TTS／STT／録音／判定／保存処理、8.1・8.3は変更なし。
- 仕様整合性：更新済み。PRACTICE82_SPECに8.2固有の表示制約を記録。PROJECT_SPEC等の共通仕様は更新不要。他ページへ自動展開しない。
- 今回の残件：なし。既存のChromeOS実音声・タッチ実機確認済み情報は維持。今回の表示の実機再確認・公開デプロイ確認は未実施。ページ作業完了宣言・ページ全体テストは行っていない。保存先main、最終SHAはGit履歴／完了報告を参照。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / GitHub編集）

- 今回：Practice 8.2 Drill 4タイトルを `[Sneak Peek] 何でも — Unlimited Choice` に変更し、説明文のAdvanced表示を撤去。何か／何も＋否定との対比、教科書の当該課の範囲外である点、どんな→何でもの用法を明示。PROJECT_SPECに今後の補足内容の[Sneak Peek]基本方針と、実在する後続課を確認できる場合だけ課番号を付ける方針を登録。PRACTICE82_SPECの旧Advanced / Sneak Peek L15を更新。8.2のタイトル関連3件は解消。今回の変更範囲の静的確認のみでページ全体テストは未実施。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-06 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。基準main `efb94e5e5c2f1bd34df172ab7be4092fb21e55b8`。8.3 Beyond Wordsのチーム【L21】を【Genki外】へ修正。根拠は作成者が確認・確定した『げんき［第3版］公式単語索引』（2024年3月更新）のVocabulary Index未登録。本作業で公式索引を独立再照合したとは扱わない。
- 限定確認：該当表示、旧L21表示の不在、Words8項目・項目順・その他全文の維持、変更前後のHTMLタグ構造一致を確認。製品差分はpractice8.3.htmlの課ラベル1か所のみ。共通仕様は更新不要。ページ全体テスト・ページ作業完了宣言なし。
- 現在の残件：チームの初出課未確認は解決済み。他語の初出課は今回の照合・変更対象外。最新mainで既にちかい【L13】になっている点もそのまま維持した。8.2 D4の①[Advanced]の妥当性、②Sneak Peek L15の妥当性、③何でもをL8追加練習としてどう位置づけるか、の3件は未解決の検討事項として維持。タイトル等は作成者との検討後に決定する。
- 変更ファイル：practice8.3.html、本記録。8.1・8.2、他のBeyond項目、JS／CSS、語彙・英訳・順序・件数・Script Mode・開閉処理は変更なし。既存のChromeOS実音声・タッチ実機確認済み情報を維持。今回の実機再確認・公開反映確認は未実施。
- 保存先：main。最終SHAはGit履歴／完了報告を参照。以下は過去の調査時点の記録であり、チームの現在の残件を意味しない。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-05 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。基準main `78563ac5902078553885770e978f6298d3837a3c`。今回のA（8.2旧記録の整合）は解消。B（8.3語彙初出課）は全8語を抽出・調査したが一次資料本文の入手に制約があり、確定照合は未完了。PCローカル作業ツリーは未変更。
- A：PRACTICE82_SPEC「表記とBeyond L8 Words」のWords旧2語を何でも1語へ修正。お土産は既習語としてWords対象外、Kanjiの産は維持。同節に混在していた撤去済みの昨日・手伝いましたを除き、Ex4の表示キュー「どんな／くつ／はく」と例文の靴へ整合。Kanjiの計数単位を3字から3項目へ修正。対象節以外・製品コードは変更なし。
- B：現行Wordsは、はじまる【L9】、おわる【L9】、ちかい【L11】、チーム【L21】、とくい／コイ／RPG／ローソン【各Genki外】の8語。8語すべて初出課／一覧外の一次資料照合は未確認。誤りが確定したラベルは0件であり、正しいと認定した件数ではない。推測による課変更・Genki外認定はせず、表示データを維持した。
- 調査典拠：出版社[教師用教材案内](https://genki3.japantimes.co.jp/teacher/resources/)および[公式索引データ案内](https://genki3.japantimes.co.jp/info?id=8209)で第3版の単語索引Excelの提供を確認。ただし補助教材への登録・ログインが必要で、本環境には当該資料への認証がなく本文未取得。[教材案内](https://genki3.japantimes.co.jp/intro/index.html)は索引の説明であり個別語の初出課を確定できない。[2026年6月公式増刷修正一覧](https://bookclub2.japantimes.co.jp/download/files/genki3/Genki3rdedition_Erratum_2606_en.pdf)も調査したが、対象8語の初出課や一覧外を確定する根拠を得られなかった。検索不一致・部分資料での不在を一覧外の証明にしていない。次の確認には公式単語索引Excelまたは該当索引・語彙ページの提供が必要。
- ページ間照合：8.3 Wordsと8.1・8.2 Wordsに同一見出しの重複なし。Kanjiの得意【Genki外 / L15】・好き【L11】は8.1と8.3で一致し、公式照合済み317項目マスターに整合。得の漢字一覧外／意L15と、語彙とくいの初出課未確認は別情報。8.2は産・買・靴で8.3との対象字重複なし。マスターの再推測・修正、既に解消した8.3 A／B／Cの再修正は行っていない。
- 限定検証：Aは実装・共通仕様・対象節の静的照合10確認が合格。8.3は最新mainのHTML／JS・共通依存をクラウド一時領域へ取得し、既存Beyond限定テストを8.3だけに絞って実行（`/tmp/beyond-vocab-review/check.cjs`）。Chromiumの354確認が合格。375／1440px、ライト／ダーク、With漢字／Hiragana Only往復、Words8語／Kanji15項目・公式マスターとの配当一致・既存強調・読み保持、漢字欄と件数の非表示／復元、開閉・再読込保持、対象要素の横はみ出し／クリップなし、初期実行時エラーなし。最初のブラウザ起動はサンドボックスのsocket制約で失敗したため、起動権限を得て同一テストを再実行して合格。これは語彙初出課の照合合格を意味しない。
- 仕様整合性：Aは更新済み。PROJECT_SPEC・GENKI_KANJI_MASTER・8.1には差分による更新理由がなく更新不要。Bは語彙初出課の根拠が要確認。変更ファイルはdocs/PRACTICE82_SPEC.mdと本記録のみ。教材・UI・音声・判定・保存キーに変更なし。
- 実機／公開：既存のChromeOS実音声・タッチ実機のユーザー確認済み情報は維持。今回は実機再確認・公開デプロイ確認を行っていない。ページ作業完了宣言・ページ全体テストなし。
- 現在の残件：8.3上記8語の語彙初出課の一次資料照合。8.2旧Words記録、8.3キュー漢字／Kanji追加／人名変更、7.3部分削除は解決済みで現在の不具合としない。過去の記録は以下を参照。保存先main、最終SHAはGit履歴／完了報告を参照。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-05 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。基準main `db1ab6287035f913db8d603ebe13d1cb0bb0880e`。Practice 7.3 D4第4問回答の部分削除不具合を修正。前回監査の7.3モデル不整合は解消。
- 方法：置換順の変更は包含関係に依存するため採用せず、既存の行キューIDに対応する語句だけを省略する小修正を採用。自転車行に車をの削除を適用しない。省略した語句の前後の境界読点も1つに整え、Formalモデルを「昨日まで、借りていました。」、かなを「きのうまで、かりていました。」へ修復。TTS入力もモデルと一致する。
- 維持：目的語省略の既存仕様、全文／短答の許容、正答判定コード、キュー、録音処理・保存キー。他のD4の9行はモデル・読み・表示用文字列・TTS・参照文と判定結果を変更前と照合して一致。
- 限定検証：`/tmp/p73-phrase-fix/check.cjs` の87確認合格。D4全5問Q/A、3文体×両表記、表記切替往復、表示フォーマッター、実きく操作からのTTS入力、正しい全文・短答の許容、正規化後の許容参照集合の一致を確認。node --check合格、初期実行時エラーなし。実音APIはモックし、実音品質の確認とは区別。
- 変更ファイル：practice7.3.jsの省略ブロック、practice7.3.htmlのJSキャッシュ識別子、本記録。8.1・他ページ・共通CSS／JSは変更なし。
- 仕様整合性：更新不要。既存の省略仕様へ戻す不具合修正で、設計・回答許容の変更なし。
- 未実施：ページ全体テスト、録音・STTの包括検証、今回変更後の実機表示・音声と公開反映の確認。従来のChromeOS実音声／タッチ実機の確認済み情報は維持。
- 今回の実装残件：なし。保存先main、最終SHAはGit履歴／完了報告参照。次の指示を待つ。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-05 / Europe/Vienna / Codex Cloud）

- 状態：引き継ぎ可能。基準main `3eed2fbf8d303720f20072db7a8504605f6bd7d2`。Practice 8.1の確定5動詞を指定箇所だけ一体キュー化。クラウド一時領域とGitHub APIを使用し、PCローカル作業ツリーは未変更。
- 対象：Ex1動詞行＝りょこうする、Ex2質問＝さんぽする、D2第2問質問＝せんたくする、D5第3問＝そうじする、第4問＝りょうりする。5群・反復2行を含む7発話行。各複合動詞は1つのtarget-word／語彙ヒントとして扱い、全体の読みと意味を提示。既存辞書・モデル側ホバーの英訳は変更していない。
- 内部object／verb、モデル文・モデルHTML、TTS／STT、正答判定、許容参照文、行ID・保存キーを維持。Ex1名詞行とEx2／D2短答は不変。他のする表現へ自動結合しない。D5の反復記号・Adj選択・既存整列処理は維持。
- 表示修正：375px・DisplayでEx1の長い複合キューがきくボタンと重なることを確認し、data-practice=8.1と新クラスに限定したCSSで自然な折返しを許可して解消。既存のレイアウト構造・画面幅しきい値・他の語句／ページのCSS規則は変更なし。HTMLのJS／CSSキャッシュ識別子を更新。
- 限定検証：一時スクリプト `/tmp/p81-compound/check.cjs` の238確認が最終合格。変更前後のモデル／読み／参照文／モデル側ホバーHTML／保存キー、7行の実TTS入力と両形の許容を3文体・両表記で比較。Hover／Display／OFF、375／1440px、ライト／ダーク、5動詞の単一要素と全体ヒント、影響外キューの一致、D5反復・選択・広幅整列・8px間隔、文字の実描画矩形と操作ボタンの重なり／横はみ出しなしを確認。node --check、git diff --checkも合格。初期実行時エラーなし。
- 仕様整合性：更新済み。PRACTICE8_SPECに一体キューの8.1固有方針と名詞行の例外を必要最小限記録。共通原則はPROJECT_SPECを参照し再転記していない。変更ファイルはpractice8.1.js／html、style.cssの限定規則、PRACTICE8_SPEC、本記録。
- 未実施：ページ全体テスト、実マイク録音、今回表示のChromeOS／タッチ実機での再確認、公開デプロイ確認。従来のChromeOS実音声・タッチ実機のユーザー確認済み情報は維持。今回の表示変更を実機再検証したとは扱わない。
- 今回の実装残件：なし。別件として前回監査の7.3 D4第4問回答（自転車の部分削除によるモデル不整合）は未修正・今回対象外。既存の広範囲practice81テストに残る旧教材期待値も今回は整理・全件実行していない。ページ作業完了の宣言は行っていない。
- 保存承認：共有style.cssの追加2行を含む変更とmainへのCommit・Pushについて、ユーザーが明示承認済み。最新mainとの一致を再確認。保存先main、最終SHAはGit履歴／完了報告を参照。追加作業は行わず次の指示を待つ。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-05 / UTC / Codex Cloud）

- 状態：引き継ぎ可能。基準main `140ccfdf04c8444dc59c738cfead15981ed52b1d`。既存Practiceと共通スクリプトのHTML／JSを検索し、きょうだいの語彙ホバー英訳はPractice 8.1の1定義だけsiblings→siblingへ修正。Practice 1.1は既にsibling。共有定義はなく、内部ID siblingsと問題内容は維持。
- 変更ファイル：practice8.1.js、本引き継ぎ。製品差分は英訳の末尾s削除のみ。文章中の英訳、Beyond、キュー、モデル文、TTS、判定、その他のホバーは変更なし。
- 限定検証：node --check合格。ChromiumでPractice 8.1 Drill 3のきょうだいに実際にマウスを重ね、両表記モードで「kyōdai, sibling」の表示を確認。初期実行時エラーなし。定義1箇所以外に製品差分がないことを確認。ページ全体テストは未実施。
- 仕様整合性：差分は見出し語英訳のみで共通設計・制約への影響がなく、仕様書更新不要。
- ChromeOS実音声・タッチ実機の既存確認済み情報は維持。今回のホバー変更に対する新たなユーザー実機確認・公開反映確認は未実施。保存先main、SHAはGit履歴／完了報告参照。次の追加作業は行わない。

## 以前の引き継ぎ記録（参照用）

# 現在のリレー状態（2026-11-05 / UTC / Codex Cloud）

- 状態：引き継ぎ可能。基準main `b42bb48749e3fc6ef00eef1c344ba6c5192b7335` のBeyond Kanji新共通仕様をPractice 8.1〜8.3へ適用。クラウド一時領域とGitHub APIを使用し、PCローカル作業ツリーは未変更。
- 掲載項目数：8.1は14→11、8.2は3→3、8.3は18→15。8.1は得意・写真・散歩を統合し、上手と苦手を分離して苦手の重複も解消。8.3は得意・果物・親切を統合。苦手・部屋を含め、語句内の未習漢字を強調し、既習字は通常表示。熟字訓のお土産・果物・部屋は読みを非強調のまま維持。
- 変更：3ページのHTML／JS（Kanji欄・初期／動的件数の単位「項目」・JSキャッシュ識別子）、本引き継ぎ。Words、Example、Drill、音声、判定、保存キー、共通CSS／JSは変更なし。
- 限定検証：一時テスト `/tmp/beyond-merge/check.cjs` によるChromium 726確認が合格。公式照合済み317項目マスターから全掲載語句の未習字と課ラベル（文字順・同課の重複排除）を照合。全語句／読みの保持、同一語句の重複なし、漢字と読みの青色・太さ、375／1440px、ライト／ダーク、両表記の往復、Kanjiと件数の非表示／復元、Words復元、開閉・再読込保持、対象要素の横はみ出し／クリップなし、初期実行時エラーなしを確認。3 JSのnode --checkも合格。差分は許可範囲のみ。
- 仕様整合性：共通仕様は更新不要。既存の新規則を実装へ反映し、正本の再転記は行っていない。別件としてPRACTICE82_SPECにはWords旧2語（実装は1語）等の古い実装記録が残る。今回のKanji表示修正範囲では変更せず、必要なら別途文書整合を行う。
- 実機：ChromeOS実音声・タッチ実機はユーザー申告で確認済みを維持。今回の表示変更を実機で再確認したとは扱わない。公開デプロイ／今回表示のユーザー確認は未確認。
- 今回の実装残件：なし。他ページへ展開しない。ページ作業完了の宣言・ページ全体テストは行っていない。保存先main、最終SHAはGit履歴／完了報告を参照。

## 以前の引き継ぎ記録（参照用）

# 現在の引き継ぎ状態（2026-11-05 / Europe/Vienna）

- 今回：Practice 8.3の残件A／B／Cを対応。基準main dbd8eb1。公式照合済みGENKI_KANJI_MASTERを参照し、全9 Setの生成元キューデータと描画を確認した。
- A：かな表記の生成元20箇所（Drill15、Example5）を修正し、辞書の漢字表記へ戻る経路を解消。キュー定義の表示を使用し、既習の作るは生成元を明示して従来表示を維持。実表示の差分はDrill7 Set・16行とExample7行。D1何＝池／魚、D2だれ＝勉強／歌う／友達、D2何＝音楽／英語、D3どれ＝映画、D4どれ＝時計／妹、D4どこ＝駅、D4いつ＝時間／午後。Exampleの店員／本屋／来る／２番／部屋もL8範囲へ整合。モデル・判定用漢字は一律に削除していない。
- B：物L13（果物）、切L14（親切）、来L9（来る）、番L22（２番）、部L16（部屋）を追加。既存13字から18字へ更新し、課順・Genki外末尾で整列。員は除外、店は維持、村は未追加。Wordsは変更なし。物を追加する果物と部屋は熟字訓扱いで読みを分割強調せず、既存の果の項目も同じ規則へ整合。読み文字列・漢字本体の青字太字は維持。
- 読みの根拠：漢字ペディアの[く行の熟字訓索引](https://www.kanjipedia.jp/sakuin/jyukujikun_ateji/%E3%81%8F)（果物）、[へ行の熟字訓索引](https://www.kanjipedia.jp/sakuin/jyukujikun_ateji/%E3%81%B8)（部屋）。その他の追加語は対象字に対応する読み部分のみ既存スタイルで強調。
- C：D2だれ第3問の川村→山本、D3どこ第2問の木村→田中。キュー、モデル、漢字／かなの辞書・許容参照文・英語ヒント、Behind the Cues内の説明例を整合。問題ID・保存キーは維持。旧名字を正答の別形として残していない。
- 限定検証：ABC314項目、既存文体回帰306項目、英語ヒント／計算色・太さ53項目、計673項目合格。全9 Set、両表記の往復、3文体、375/1440px、ライト／ダーク、18項目の配当・重複・順序・読み強調、Words維持、開閉と再読込保持を確認。キューの未習漢字なし、旧名字なし、TTS入力と正答参照の整合、保存状態保持、構文・初期実行時エラーなしを確認。再検証時にクリック待ちのタイムアウト1回があったが、同条件再実行では再現せず最終確認は合格。色の検証は最新版CSSの実値（light #0369a1／dark #38bdf8、weight 700）を使用し、製品色は変更していない。
- 仕様整合性：更新済み。PRACTICE8_SPECに残る今回関連の名字と２ばんキュー例のみ最小整合。設計制約の変更や全設問の再転記は行っていない。変更は8.3 JS／HTML、当該既存テストの名字期待値、PRACTICE8_SPEC、本HANDOVER。8.1話キュー・既存配当修正、8.2、共通CSS／UI／録音モジュールに変更なし。
- 残件：今回のA／B／Cは解消。語彙初出課の一次資料照合は別件で、今回変更していない。音声・録音の確認は模擬APIであり、今回の修正を実マイク／ChromeOSで再確認したという意味ではない。既存のユーザー実機確認済み記録は維持。ページ作業完了宣言なし、ページ全体テストなし。追加作業は作成者の指示を待つ。

## 直前のBeyond Kanji配当修正（参照用）

- 今回：公式照合済みGENKI_KANJI_MASTERに基づき、8.1の6件・8.3の11件、計17件のBeyond Kanji配当ラベルを修正。基準main b660dd0。既に一致する8.2の3件は変更なし。8.3の員（L8既習）の説明項目のみ削除し、店の項目と2語句を維持。修正後件数14／3／13。
- 8.1の話（L9）をキュー既習漢字の許可集合から除き、Dr5新1・7の提示語をはなすへ整合。内部モデル・TTS用の話すは維持。JSの差分は当該許可集合の1字削除のみ。HTMLのJS読込バージョンを更新。
- 限定検証：Chromium 375/1440px・ライト／ダーク・両表記で201項目合格（8.1:75、8.2:59、8.3:67）。全掲載ラベルと公式マスターの一致、L8既習字の不在、読み／強調マークアップ保持、対象字と読みの配色・太さ、件数、モード往復、開閉状態と再読込後の復元、表示幅、初期実行時エラーを確認。8.1の選択後Dr5操作列も画面内。JS構文確認合格。Words欄の固定HTMLの完全維持と、他の機能ロジックの不変を差分で確認。
- 掲載漏れ候補の再分類（全Setの実表示を再抽出）：8.3のA＝キューのみ17字〔勉・強、午・後、友・達、妹、映・画、歌、池、英、計、間、音、駅、魚〕はかな化候補として未修正。B＝Example本文にも出る5字〔物L13、切L14、来L9、番L22、部L16〕はBeyond追加候補として未追加。C＝村（川村／木村、人名）は個別判断待ち。D＝員は既習のため削除済み。8.1話は修正前Aだったが、今回かな化により画面から除去済み・追加不要。内部音声／判定モデルだけの漢字は表示上の追加候補と混同しない。
- 未解決：上記A〜Cの扱いは作成者判断待ち。今回は新規Kanji項目追加や8.3キュー修正は未実施。Wordsの表示・語彙初出課、音声・録音・判定・文体処理に変更なし。配当一覧自体の公式照合は完了済み。語彙初出課の未確認は別件。
- 仕様整合性：更新不要。既存の公式マスター参照・キューのL8制限を満たす限定修正で、共通・固有制約の変更なし。ChromeOS実音声・タッチ実機の従来のユーザー確認済みは維持。今回の変更の実機再確認は未実施。ページ作業完了宣言なし、ページ全体テスト未実施。

## 直前の公式配当資料照合作業（参照用）

- 今回：Genki第3版の漢字配当317項目を出版社公式PDFと独立照合し、GENKI_KANJI_MASTERの検証状態・出典を更新。基準main 1ae0073。第3〜23課・21課の文字、課、順序、課別件数、番号1〜317が全件一致、不一致0。既存の文字列・配当・順序・件数は変更なし。
- 出典：指定の出版社公式genki-3rd_kanji_Fr.pdf（1ページ）と、公式教材案内からリンクされるgenki-3rd_kanji_E.pdf（1ページ）。双方の317組も一致。漢字配当PDF本文に発行／改訂日なし。確認日2026-11-05（Europe/Vienna）。々は第12課・番号133の学習項目として維持。
- 増刷修正：公式トップの2026.06.01案内と、その英語リンク先Genki3rdedition_Erratum_2606_en.pdf（本文June 2026、全5ページ）を確認。テキスト2第19刷などの修正を含むが、今回の確認範囲に漢字導入課・対象字・通し番号変更は見つからない。「果」欄の例語削除は対象字の削除と区別。全刷現物や未公開・将来の訂正まで不変とは扱わない。
- 変更範囲：GENKI_KANJI_MASTER、PROJECT_SPEC、本HANDOVERのみ。PROJECT_SPECに正本参照・ページ間統一・語彙初出との区別・新規制作／訂正／新版時の参照規則を一か所追加。仕様整合性：更新済み。番号範囲・正本リンク・既存一覧の完全維持を確認した。製品コード・ページ全体テストに変更／実行なし。
- 次作業：8.1〜8.3のBeyond Kanji配当不一致・掲載漏れ候補は未修正。今回の作業で修正には着手せず、作成者の別途指示を待つ。語彙初出課は今回の資料照合の対象外。
- 残る範囲：教科書・ワークブック全ページ／全刷の現物照合は未実施。今回の「全件照合済み」は取得した公式第3版漢字配当PDFとの一致を意味する。

## 直前のPractice 8.3作業状態（参照用）

- 今回：Practice 8.3のSpeech Style不具合を修正。Formal固定文を返すsentenceForと固定参照文が原因。8.3内で文末述語を選択文体へ変換し、表示・TTS・回答参照文を同じ生成結果へ統一。Formal元データ、主語が、進行／結果の意味は維持。
- 文体：Informalは普通体、Casualは平叙文に終助詞よ、疑問文は普通形。選択文体の既存許容回答も変換し、普通体の書き言葉の疑問か、共通終助詞許容とCasualの進行形縮約を確認。録音キー・保存済みraw／モデル／参照文／判定は変更していない。
- 変更：practice8.3.js、同HTMLのJS読込バージョン、tests/practice83-speech-style.cjs、本HANDOVER。基準main 0c905fc。8.1／8.2・共通モジュール・CSS・Beyondに変更なし。
- 限定検証：node --check合格。Chromiumの文体回帰テスト306項目合格。全4Drill・9Set・60行と全27 Example行、両表記、Formal→Informal→Casual→Formal、独立した文法期待値、文体別正解と誤答、全Setの実際の🔊操作からTTSへ渡る文、保存スナップショットと回答状態保持を確認。準備中／録音中のロックはテスト状態で確認。初期・実行時エラーなし。
- 確認範囲：音声API・録音状態は模擬環境。今回の修正後の実音声品質・実マイク収録は再確認していない。従来のChromeOS実音声・タッチ実機のユーザー確認済み記録は維持。ページ作業完了宣言なし、ページ全体テストなし。
- 仕様整合性：更新不要。PROJECT_SPECの既存3文体・終助詞規則とPRACTICE8_SPECの文法目標へ実装を整合する不具合修正で、固有制約の変更なし。仕様書に実装を重複転記していない。

## 直前のBeyond作業状態（参照用）

- 今回：Beyond Wordsを登録済み共通仕様へ整合。8.1は服→ふく・弾く→ひく・料理→りょうり、8.3は得意→とくい。8.2は既習語お土産をWordsから除外し、何でもの独立読みを削除。Kanjiの産は維持。
- Script Mode：Wordsの表示用表記・ひらがなをHTMLの明示データで管理し、各ページのBeyond更新関数だけで切替。カタカナは維持。件数はDOMの実項目数から算出（Words 6/1/8、Kanji 14/3/14）。他機能・共通CSS/JSは変更なし。
- 限定検証：3ページ各57項目合格。Chromium 375/1440px、ライト／ダーク、両表記、往復復元、件数、漢字欄非表示、開閉状態保存、横幅、初期実行時エラーを確認。3つのJS構文確認合格。Kanji以下のHTMLは完全維持。
- 語彙照合：各Words見出しを現行キューと照合。3ページの掲載語に同じ語・同じ用法の重複はなく英訳変更は不要。お土産のL5既習扱いは作成者指示に基づく。残る語彙初出課は既存表示を維持し、一次典拠での再確定は未実施。特に8.3得意のGenki外扱いと、既存の好・意・得等のページ間漢字配当相違は要確認。根拠なく配当を変更していない。
- 仕様整合性：更新不要。最新PROJECT_SPECの掲載対象・表記・Script Mode同期規則へ実装を整合。PRACTICE8_SPECに今回の変更と矛盾する固有制約なし。設問・語彙一覧を仕様書へ転記していない。
- ChromeOS実音声・タッチ実機は従来のユーザー確認済みを維持。今回の表示変更の実機再確認とは扱わない。ページ作業完了宣言なし、ページ全体テスト未実施。
- 前回：8.2 Beyond Wordsの2件のem dashのみ削除し空白で区切る形式へ統一。語彙・読み・訳・課番号、8.1／8.3 Wordsは変更なし。仕様整合性：更新不要（既存形式への文言修正）。
- 限定検証：Chromium 375/1440px・ライト／ダークでWords文字列・項目の左右端と内容幅・ページ横幅・実行時エラーの13項目合格。既存Beyond限定確認37項目も合格。ページ全体テストなし。課配当は調査事項のままで修正していない。
- 直前：8.1〜8.3のBeyond漢字欄で、対象字に対応する読みだけを同じ既存codeスタイル（青色・太字）で強調。語ごとに明示的に対応を設定し、文字数による割当は行っていない。
- 対象：8.1は14項目15語句すべて、8.2は3項目中2項目2語句、8.3は14項目15語句すべてで読みを強調。8.2「産：お土産（おみやげ）」は熟字訓のため読み全体を通常表示。
- 課番号・語句・読みと文字列順を完全維持。変更は3ページのHTML、PROJECT_SPEC、HANDOVERのみ。CSS・JS・Words欄・教材・録音・開閉処理は変更なし。
- 限定検証：各ページChromium 375/1440px、ライト／ダーク、両表記で37項目合格。対象字と読みの同色、語句右端とページ横幅、既存の漢字欄表示切替、開閉状態保存、初期実行時エラーを確認。HTMLから装飾タグを除いた比較で既存の全文・他のマークアップの保持を確認。
- 仕様整合性：更新済み。PROJECT_SPEC共通Beyond節に読みの部分強調、熟字訓・対応不明時の非強調規則を追加。
- 既存課配当のページ間不一致（好・意・得など）は未解決のまま維持。今回は配当を変更していない。
- ChromeOS実音声・タッチ実機はユーザー申告で確認済み。今回の表示変更の実機再検証とは扱わない。ページ作業完了宣言なし、ページ全体テスト未実施。

## 過去の引き継ぎ記録

以下は当時の記録。履歴全体を一括削除していない。未完了事項の詳細を回収する際は最新実装・承認内容と照合する。

## Practice 8.1 Dr5横はみ出し修正（2026-11-04 / Europe/Vienna）

- 「Adjとボタン群を分離しない」指定を撤回。style.cssのDr5行を折返し可能なflexへ変更し、内側cue-bodyをdisplay:contentsにしてボタン群が英語ラベル分の固定列に閉じ込められないようにした。3ボタンは一組を維持。固定画面幅のしきい値は追加していない。
- PRACTICE8_SPECの旧禁止文を更新。製品JS・教材・Notice・録音ロジックは変更なし。
- 64cc369を基準に最新依存ファイルを固定取得し、修正CSSを当てたChromiumで375px、全7問、With漢字／Hiragana Only、未選択・両候補選択／切替・録音保存状態によるNotice表示を限定測定。全状態scrollWidth=clientWidth=375。主要要素の重なり・祖先クリップなし。録音保存後の再生ボタン14個も最大右端355.8pxで収まる。実行時エラーなし。
- 1440pxでは両表記・全7問で選択欄とボタンが同じ行を維持し、横スクロール・重なり・クリップなし。
- Noticeは保存済みURLをテスト内で再現し、実際のshowResult条件を通して表示。実録音検証ではない。ChromeOS実機未確認。制作途中の限定検証でありページ全体テストは未実施。

## Practice 8.1 Dr5のInferred表記（2026-11-04 / Europe/Vienna）

- Dr5第1問・第5問のObservedをInferredへ変更。Ex5のObservedは今回対象外。
- 第1問Noticeはinfers that the subject sees the activity as their own strength、第5問はinfers that the subject feels confident in the activityであり、推測を示すInferredと整合。Notice本文の変更なし。
- node --check合格。差分はラベル2箇所のみと確認。ブラウザ表示・ChromeOS実機は未確認。ページ全体テストなし。

## Practice 8.1 Notice3文限定修正（2026-11-04 / Europe/Vienna）

- practice8.1.jsのDr5第3問へた、第7問じょうず／とくいの英語Notice3文のみ指示文へ差替え。Presumptuous／Overstepping、Observed、表示処理・条件・かな変換を維持。
- node --check合格。逆置換で旧ファイルと完全一致し、指定3文以外の製品コード差分なし。Chromiumで3文の生成結果、上手→じょうず／下手→へた変換、初期非表示を限定確認し合格。
- ページ全体テストは未実施。作成者の「ページ作業完了」宣言待ち。ChromeOS実機未確認。

## Practice 8.1制作途中：Drillタイトル・説明文限定調整（2026-11-04 / Europe/Vienna）

- 開始main 75f68f0。practice8.1.jsの指定5文字列のみ変更。D1説明：Say what you like and what you like doing.／D3説明：Describe what other people are good at or struggle with.／D4タイトル：Degrees of Intensity、説明：Choose a different action for each line.／D5説明：Choose the adjective that matches each label. Consider its meaning and how it sounds. D2文言は維持。
- 限定検証：node --check合格、Chromiumで5タイトル・5説明文の完全一致、初期実行時エラーなしを確認。文字列変更を逆置換すると変更前と完全一致し、既存の設問・機能・レイアウトコードに差分なし。
- 今回は制作途中の限定修正。「ページ作業完了」「検証完了」の宣言ではなく、ページ全体テストは実施していない。ChromeOS実機未確認。

## Practice 8.1 Dr5 Adj最小幅（2026-11-04 / Europe/Vienna）

- 未選択表示を— Adj —からAdjへ変更。comparison選択欄はwidth:auto/min-width:0で、各ペア内の最長候補にネイティブの矢印・余白を加えた幅を使う。候補間・未選択／選択後で幅は安定。
- node --check合格。375px Chromium比較：1/4/5/7の選択幅122px、2/3/6は116→101px。ボタン列右端は変更なし（各問393.3/449.5/398.4/380.3/393.3/365.7/444.7px）。未選択・全候補選択後とも同じ幅・右端。
- 結果：選択欄の一部は15px縮小したが、375px横はみ出しは解消していない。追加の配置変更は未実施。ChromeOS実機確認待ち。今回のブラウザ比較は共有作業ツリーの既存HTML/CSSに最新8.1 JSを差し替えて実施。

## Practice 8.1 Dr5-7の動作変更（2026-11-04 / Europe/Vienna）

- Dr5-7を日本語の先生／日本語を話す／Adjへ変更。内部モデルも日本語の先生は、日本語を話すのが…へ連動。じょうず／とくいの比較、ラベル・説明は維持。
- 話を既習キュー漢字へ登録し、当該行の目的語・助詞・動詞を一つの提示句に連結。Hiragana Onlyではかなへ連動。Ex対象のBeyond欄に変更なし。
- node --check合格。ブラウザ・ChromeOS実機確認は未実施。

## ページ作業完了とページ全体テストの運用登録（2026-11-04 / Europe/Vienna）

- 開始main：75867d8。文書のみ更新：AGENTS.md、docs/PROJECT_SPEC.md、docs/RELAY_WORKFLOW.md、本HANDOVER。
- 作成者による「ページ作業完了」は制作終了の宣言。テスト合格とは別。宣言で当該ページの全体テストを開始し、宣言なしではCodexが独自開始しない（別途明示的テスト指示には従う）。
- 制作中の限定検証条件・安全制約を維持。包括検証を制作途中で繰り返さず、不具合修正後は影響範囲を再検証する。
- 教材・ホバー・レイアウト・機能・技術の確認項目、共通タッチ検証の再利用と追加確認条件、合格／不合格／未実施・未確認／対象外の報告、エミュレーションと実機の区別を登録。
- 確認：旧開始条件の現行規定を置換し、重要条件の保持を文書比較で確認。過去のHANDOVER履歴は当時の記録として保持。
- 今回は運用登録のみ。8.1を含むどのページも「ページ作業完了」宣言として扱わず、ページ全体テストは実施していない。製品コード・教材・UI・ホバー訳は変更なし。

## 語彙ホバーのタッチ開閉（2026-11-04 / Europe/Vienna / GitHub連携）

- 共通tooltip-layout.js／style.cssに通常語彙のタッチ開閉を追加。同語再タップ・外側タップで閉じ、別語へ切替。タッチ時の残留hover表示を抑制。マウスpointerdownで通常hoverへ戻る。
- select/input/textarea/button/aを含むホストは語彙タップ対象外。イベントのpreventDefault／stopPropagationなし。スクロール時の誤開閉防止として移動10px超・pointercancelは無視。
- 自動確認：node --check合格。Chromium hasTouchの限定fixtureで開く／再タップ／外側／語彙切替、selectへのpointerイベントがキャンセルされないことに合格。ネイティブ選択UI・実ページ全体・ChromeOS／スマートフォン実機は未検証。包括テストなし。
- GitHub mainへ保存。共通スクリプト使用ページへ適用される。

## Practice 8.1ホバー訳（2026-11-04 / Europe/Vienna）

- 苦手: not comfortable、下手: not skilled、まぁまぁ: So-so、取る: to take に変更。practice8.1.jsのみ更新。構文確認は未実施。公開表示・実機確認待ち。

## Practice 8.1ドリル見出し確定（2026-11-04 / Europe/Vienna）

- Drill 1〜5のタイトルを確定文言へ統一。Drill 1説明だけを “Say what you like or like doing.” に変更し、Drill 2〜5説明は維持。
- `practice8.1.js`、`docs/PRACTICE8_SPEC.md`を更新。テストに該当する旧期待値はなし。JS構文確認合格。Playwrightで指定タイトル5件、D1説明更新、D2〜5説明維持を確認。375pxではタイトル表示に問題なし。ページ全体の横幅検証ではDr5録音ボタン列に横はみ出しを検出（今回変更外）。ChromeOS実機確認待ち。

## Practice 8.1 D3-1差替え（2026-11-04 / Europe/Vienna）

- Dr3タイトルをVerbのが、じょうず／にがてへ変更。
- D3-1をクラスメート／ノート／とるへ変更。内部文はクラスメートは、ノートを取るのが、上手です。写真の撮るとは別語として登録。
- Beyond変更なし：ノートはL2語彙で、漢字欄はExのみ対象。Ex3の写真を撮るは維持。
- 自動検証：node --check合格。Chromiumで新タイトル・D3-1表示キュー・Dr3選択肢・Dr5全7問の反復余白・ページ例外なしを限定確認。実音声・ChromeOS確認待ち。

## Practice 8.1キュー表記とDr5反復配置修正（2026-11-04 / Europe/Vienna）

- Dr3タイトル・指示・プルダウンをじょうず／にがてへ変更。Dr1/2タイトル、選択式キュー、Dr5説明見出し・本文の語もかな表記へ統一。
- 原因：かな表示へ変更した語を位置計算が旧漢字で検索し、Dr5の2/3/5/6/7で計算が中断。cueTextを表示・検索・選択肢・選択式動詞句で共用して修正。
- 限定検証：node --check合格、ChromiumでDr3タイトル・選択肢およびDr5全7問の反復後余白が正値となること、ページ例外なしを確認。Ex本文は自然な漢字、STT原文・内部TTSを維持。全ページ包括テストなし。ChromeOS実機確認待ち。

## Practice 8.1 Beyond追加（2026-11-04 / Europe/Vienna / GitHub連携）

- Ex1は直前確定の旅行Noun／Verb2行、Ex2散歩、Ex4アニメを維持。キュー表示の未習漢字をかなへ変換し、Ex本文の自然な漢字表記と内部TTS文を分離。
- Beyond L8 Wordsを8.3と同じ位置・スタイルで追加。Words6語（バイク・アニメ・服・ギター・弾く・料理）、Kanji14字（旅・手・弾・意・歩・写・真・姉・妹・得・好・散・撮・苦）。配当課はユーザー提供一覧に従う。映画は旅行へ変更済みのため映・画は除外。
- 表記モード連動、開閉状態をsessionStorage p81-unlearned-openで保持。GitHub APIで保存。ブラウザ動作・構文の自動検証は未実行。公開表示・ChromeOSの実機確認待ち。

## 現在のリレー状態（2026-11-04 UTC / Codex Cloud）

- 開始main：d447081。今回の継続作業を完了しmainへ通常Pushする。
- Ex3を現在形へ変更：おみやげ／かう → お土産に、何か、買いますか。／はい、買います。／いいえ、何も、買いません。内部モデルは文字列を保ち、ホバーHTMLは表示時だけ生成。
- Ex2の(を)に個別の点線ホバー説明を追加：The particle を is optional and usually omitted after 何か.
- Beyond欄の旧「昨・手・伝」を撤去し「産・買」を追加。お土産L5、買うL4の語彙情報と、土L4・買L10・産Genki外の漢字情報はユーザー提供。表示欄はお土産L5と何でもL15の2語、産・買・靴の3字。
- 375px失敗原因：Ex2見出しをmax-content／nowrapにしたためキュー列が0pxとなりカード277pxから41px超過。見出し列をfit-content(25%)へ戻して折返しを許可。狭幅では例文だけ次行に置き、キュー・矢印・聞くの列を維持。
- 自動検証：node tests/practice82.cjs 179項目合格（375/600/900/1440px、表記・ヒント、録音状態を含む8.2限定回帰）。node --check practice8.2.js、node --check tests/practice82.cjs、git diff --check合格。他ページは実行していない。
- 実機確認：ChromeOS表示・録音品質・TTS発音、Vercel公開反映は未確認。

## 現在のリレー状態（2026-11-04 UTC / Codex Cloud）

- 対象：lt068028/october2026。開始main `8f74eae`、Cloudブランチworkは一致・クリーン。ルール版2026-11-01.1。利用枠は取得不可。
- 完了：Practice 8.2へ8.3準拠のBeyond L8 Wordsを追加。Wordsは何でも（L15）の1語、Kanjiは昨・手・伝・靴の4字。モード連動とsessionStorage開閉保持を実装。
- AGENTS.md／PROJECT_SPEC.mdにEx・Drillのキュー、Ex右側例文、TTS内部文、STT原文の用途別規則を明記。Beyond L{N} WordsのNは対象Lesson番号。8.2仕様にも適用例を記録。
- 自動検証：node --check practice8.2.js、git diff --check合格。Playwright限定検証で件数、漢字欄のモード連動、再読込時の開閉保持、375px／1440pxで横はみ出しなし、ページ例外なしを確認。初回は依存解決・Chromium起動制限で実行不能だったが、共有依存と正規の追加権限で再実行し合格。包括テストは未実行。
- 実機・公開反映：ChromeOSでの表示確認、Vercelデプロイ確認はユーザー待ち。音声・STTロジックの変更なし。
- 保存先：GitHub mainへ通常Pushする。最終コミットID・保存結果は終了報告で確認。

## Practice 8.2回帰テスト同期（2026-11-04 / Codex Cloud）

- 開始時に `git fetch origin` を実施し、`main` の最新は `8a63cac`。Cloud作業ブランチ `work` はクリーンで、fetch前のHEAD `f8511a6` からfast-forwardのみで同期。
- Practice 8.2の現行実装はExample 4件・Drill 4件。旧 `tests/practice82.cjs` はExample 3件・Drill 3件の件数と旧問題構成を期待し、実行時に `4 !== 3` で停止した。これは期待値の陳腐化で、製品コードの不具合ではない。
- テスト期待値を現行モデルへ同期し、4セクションの全モデル・3文体の許容／拒否、Y/N回答ロック、選択時の自動再生なし、Hiragana Only／3ヒント設定、録音・STT原文・Y/N別結果保持、0秒リレー・新規録音の中断、375〜1440px表示を確認。
- `docs/PRACTICE82_SPEC.md` と `PROJECT_SPEC.md` のPractice 8.2概要をExample 4件・Drill 4件へ更新。
- 自動検証：`node tests/practice82.cjs` 175項目合格、`node --check tests/practice82.cjs` と `git diff --check` 合格。今回の対象外は未実行。引き継ぎ上の別ページ未完了テストは `tests/practice81.cjs`（2026-11-01の追加項目は当時未実行と記録）。全ページ・全テスト包括実行はしていない。
- GitHubへの本変更のコミット／Pushはこの記録作成後に実施する。ChromeOSでの実録音品質・TTS・ASRの実機確認は未了。

## 最新リレー状態（2026-11-04 / Europe/Vienna / LT）

- 状態：引き継ぎ可能（GitHub保存確認済み）。サービス終了作業完了。開始時HEAD `2a0e854`。
- 本セッション完了事項の総括：
  1. **Practice 8.2 D1〜D4 インフォパネル指示文更新（`fd08896`）**：英語グロス付き指示文へ更新。
  2. **Practice 8.2 Drill 3 問題順並び替え・5番更新（`2488ba8`）**：1.たんじょうび／する、2.パーティー／持っていく、3.おやつ／食べる、4.ともだち／借りる、5.スマホ／つける。語彙（誕生日、スマホ、つける）の登録とSTT正規化対応。
  3. **Practice 8.2 Drill 3 文節別読点・助詞許容拡充（`8e2b709`）**：`誕生日に、何か、しますか。` 等への更新、および `パーティーへ`、`スマホへ`、`誕生日`（助詞なし）、`友達から` の判定許容。
  4. **Practice 8.2 全体への文節別読点全面適用および仕様確定（`ac3f40c`）**：Ex1〜Ex4、D1〜D4 全文に要素ごとの読点「、」を適用。`PROJECT_SPEC.md` §3.3 に「モデル音およびモデル表示文の文節ポーズ制御原則」を正式追記。
  5. **Practice 8.1 D1 名詞節構造の調査確認および仕様明確化（`f8511a6`）**：8.1 が当初から名詞節の非分断・節境界読点（`本を読むのが、好きです。`）に完全準拠していることを確認。`PROJECT_SPEC.md` §3.3 に名詞化節ルールを追記。
  6. **リモート同期（`2a0e854`）**：外部更新（クラウド優先ルール・録音状態変更時の限定検証ルール追加）を fast-forward にて取り込み・同期完了。
- 変更ファイル：docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、作業ツリークリーン確認、バックグラウンドタスク停止確認。
- 実機確認状況：各更新機能（Practice 8.2の表示・音声・判定）の実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-04 / Europe/Vienna / LT・コミット `f8511a6`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.2 Drill 4 のタイトル・説明文の先取り（Advanced / Sneak Peek L15）更新完了。開始時HEAD `e9c34d5`。
- 変更：
  1. **Drill 4 のタイトルおよび説明文の更新（`practice8.2.js`）**：
     - タイトル: `Drill 4: [Advanced] 何でも — Unlimited Choice ( Sneak Peek L15 )`
     - 説明文: `💡[Advanced] Unlike 何か (some) or 何も (none), 何でも can describe "whatever". Ask with どんな and answer with 何でも.`
     - 何か・何もとの対比を明確化し、Genki II L15で本格導入される「QW＋でも」の普遍ルールへの布石（Sneak Peek）を明記。
  2. **キャッシュキー更新（`practice8.2.html`）**：
     - スクリプトタグを `v=20261103-p82-d4-advanced-sneak-peek` に更新。
- 変更ファイル：practice8.2.js、practice8.2.html、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、語彙・構文整合性確認合格。
- 実機確認状況：Drill 4 のパネルタイトル・説明文の表示（With漢字／Hiragana Only両モード）確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `e9c34d5`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。全14ページの「↩️もどる」ボタンへのホバーツールチップ（Return to Practice Menu.）実装完了。開始時HEAD `5c1c4c2`。
- 変更：
  1. **全14ページの「↩️もどる」ボタンへのホバーツールチップ実装（全HTML）**：
     - `composition1.html`, `practice1.1.html`, `practice1.2.html`, `practice2.1.html`, `practice2.2.html`, `practice2.3.html`, `practice7.1.html`, `practice7.2.html`, `practice7.3.html`, `practice8.1.html`, `practice8.2.html`, `practice8.3.html`, `pronunciation1.html`, `pronunciation2.html`
     - 全ファイルの `.back-link` に `custom-tip-wrap` を付与し、内部に `<span class="custom-tip-box">Return to Practice Menu.</span>` を追加。
  2. **スタイル追加（`style.css`）**：
     - `.back-link > .custom-tip-box` に `left: auto; right: 0; transform: none; white-space: nowrap;` を設定し、右端からのはみ出しを防止。
- 変更ファイル：全HTML（14ファイル）、style.css、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、全14ファイルのリンク構造・ツールチップ整合性確認合格。
- 実機確認状況：各ページの「↩️もどる」ボタンにホバーした際のツールチップ表示（Return to Practice Menu.）確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `5c1c4c2`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.2 新Ex2・新Drill 2（何を vs 何か対比・重複ゼロ4問）新設および全4ドリル構成への拡張完了。開始時HEAD `4238d33`。
- 変更：
  1. **新Ex2（何を vs 何か対比ペア）新設（`practice8.2.js`）**：
     - 行1: `何を · What`（キュー: `何`／`見る` 👉️ 🔊 `何を見ますか。`）
     - 行2: `何か · Something`（キュー: `何か`／`見る` 👉️ 🔊 `何か見ますか。`）
     - 「見る（みる）」はL3語彙・L5既習漢字。
  2. **新Drill 2（何を vs 何か対比・4問）新設（`practice8.2.js`）**：
     - 各問で「何を〜か」と「何か〜か」をペア（2行）で練習する形式：
       - 問1（読む）: `何を読みますか。` ／ `何か読みますか。`（キュー: `何`／`読む`、`何か`／`読む`［L8漢字既習］）
       - 問2（書く）: `何を書きますか。` ／ `何か書きますか。`（キュー: `何`／`かく`、`何か`／`かく`［L9未出漢字➔平仮名］）
       - 問3（撮る）: `何を撮りますか。` ／ `何か撮りますか。`（キュー: `何`／`とる`、`何か`／`とる`［L19未出漢字➔平仮名］）
       - 問4（友達から借りる）: `友達から、何を借りますか。` ／ `友達から、何か借りますか。`（キュー: `ともだち`／`何`／`かりる`、`ともだち`／`何か`／`かりる`［友達・借りる未出漢字➔平仮名、「友達に」も許容］）
     - ページ内の既存動詞・名詞との**重複完全ゼロ（0）**を達成。
  3. **セクション構成の拡張（全4ドリル体制）と旧D2/D3のシフト（`practice8.2.js`、`tests/practice82.cjs`）**：
     - Drill 1: `何か — Questions`
     - Drill 2（新設）: `何を vs 何か — Questions`
     - Drill 3（旧D2）: `何か／何も — Yes/No Questions`
     - Drill 4（旧D3）: `何でも — Questions & Answers`
     - 回帰テスト内のインデックス（`rowsFor(2)`, `rowsFor(3)` 等）を同期。
  4. **キャッシュキー更新（`practice8.2.html`）**：
     - スクリプトタグを `v=20261103-p82-contrast-drill2` に更新。
- 変更ファイル：practice8.2.js、practice8.2.html、tests/practice82.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、括弧整合性・語彙重複ゼロ確認合格。
- 実機確認状況：新Ex2・新Drill 2の表示・音声・キュー・録音認識および全4ドリル構成の確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `4238d33`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.2 キューの未出漢字Genki準拠（平仮名化）およびモデル文漢字表記維持完了。開始時HEAD `6e478c4`。
- 変更：
  1. **キューの未出漢字平仮名化とモデル文漢字分離（`practice8.2.js`）**：
     - Genki L8未習漢字を含む語彙について、キュー（プロンプト）表示をL8既習漢字範囲へ厳密に準拠させ平仮名化（モデル文のWith漢字表示は維持）：
       - 買 ➔ `買う` ➔ キュー: `かう`（L10漢字）
       - 持 ➔ `持っていく` ➔ キュー: `もっていく`（L10漢字）
       - 歌 ➔ `歌` / `歌う` ➔ キュー: `うた` / `うたう`（L11漢字）
       - 切 ➔ `切る` ➔ キュー: `きる`（L12漢字）
       - 料・理 ➔ `料理` ➔ キュー: `りょうり`（L13漢字）
       - 週・末 ➔ `次の週末` ➔ キュー: `次のしゅうまつ`（「次」はL8既習、週末はL16/L22漢字）
       - 明 ➔ `明日` ➔ キュー: `あした`（L17漢字）
       - 捨 ➔ `捨てる` ➔ キュー: `すてる`（L18漢字）
       - 洗 ➔ `洗う` ➔ キュー: `あらう`（L18漢字）
       - 朝 ➔ `今朝` ➔ キュー: `けさ`（L19漢字）
       - 靴 ➔ `靴` ➔ キュー: `くつ`（指定外漢字）
       - 帽 ➔ `帽子` ➔ キュー: `ぼうし`（指定外漢字）
     - `W` / `V` 定義に関数第6引数（キュー用表記 `cue`）を追加し、`word(id, shown)` でキュー表示時に `w.cue` を参照するよう設計。モデル文生成（`modelHTML`）は `shown` を渡すため漢字表記を維持。
  2. **テスト同期とキャッシュキー更新（`tests/practice82.cjs`、`practice8.2.html`）**：
     - 回帰テスト内のキュー検証（`any-1-a`）の期待値を `うたう` に同期。
     - `practice8.2.html` のスクリプトタグを `v=20261103-p82-cue-kanji-separation` に更新。
- 変更ファイル：practice8.2.js、practice8.2.html、tests/practice82.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、語彙・キュー整合性確認合格。
- 実機確認状況：Practice 8.2 各ドリルのキュー表記（平仮名化）およびEx・モデル文の漢字表示確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `6e478c4`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 未習語アコーディオン開時全体幅100%維持および全文字・要素の右詰め（右寄せ）配置完了。開始時HEAD `e7ef460`。
- 変更：
  1. **開時全体幅100%の維持と右詰め配置（`practice8.3.html`、`style.css`）**：
     - 開いたパネル（`[open]`）の幅を画面全体幅（`width: 100%`）に戻し、一覧性を確保。
     - ヘッダー内の要素順・配置を調整し、開いた時も右端に `🧭 Beyond L8 Words ▴` を維持（サマリー全体に `justify-content: flex-end;`）。
     - 件数表示（`ことば(8語) 漢字(14字)`）をタイトルのすぐ左側に右詰めで配置。
     - アコーディオン内部（`.unlearned-body`）の全要素（見出し `【Words】`、`【Kanji】` および語彙チップ群 `ul.unlearned-list`）をすべて右詰め（`text-align: right; justify-content: flex-end;`）に統一。
  2. **キャッシュキー更新（`practice8.3.html`）**：
     - `style.css` および `practice8.3.js` のクエリを `v=20261103-p83-beyond-l8-fullwidth-rightaligned` に更新。
- 変更ファイル：practice8.3.html、style.css、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、全幅100%・右詰め整合性確認合格。
- 実機確認状況：開いた時の全体幅100%表示、右端の `🧭 Beyond L8 Words` 表示維持、内部の全テキスト右詰め表示確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `e7ef460`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 未習語ボタンの絵文字変更（🧭）、開いた時限定の件数表示（ことば(8語) 漢字(14字)）、右寄せカード展開完了。開始時HEAD `f07a44d`。
- 変更：
  1. **絵文字の変更（🧭）と右寄せカード展開（`practice8.3.html`、`style.css`）**：
     - 未習語メニューボタンの絵文字を新規の `🧭`（コンパス）に変更：`🧭 Beyond L8 Words`。
     - アコーディオン開時（`[open]`）の幅を `width: min(100%, 540px)` に設定。右寄せ（`display: flex; justify-content: flex-end;`）のまま右側にコンパクトなサブコンテンツパネルとして展開させ、ドリル主動線を邪魔しないレイアウトを実現。
  2. **展開時限定の件数表示（ことば(8語) 漢字(14字)）（`practice8.3.html`、`practice8.3.js`、`style.css`）**：
     - 閉じた時は件数を非表示（`display: none;`）、開いた時にのみサマリーバー内に `ことば(8語) 漢字(14字)`（またはHiragana Only時は `ことば(8語)`）を表示。
     - ScriptMode（With漢字／Hiragana Only）の切り替えと動的に連動。
     - 内部見出しは `【Words】`、`【Kanji】` にスッキリ整理。
  3. **キャッシュキー更新（`practice8.3.html`）**：
     - `style.css` および `practice8.3.js` のクエリを `v=20261103-p83-beyond-l8-compass-counts` に更新。
- 変更ファイル：practice8.3.html、practice8.3.js、style.css、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、展開時件数表示・右寄せカード幅整合性確認合格。
- 実機確認状況：閉じた時の `🧭 Beyond L8 Words ▾`、開いた時の `ことば(8語) 漢字(14字)` 表示および右寄せ540pxカード展開の確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `f07a44d`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 未習リストの英語メニュー名変更（Beyond L8 Words）・右寄せコンパクト化・件数内包化完了。開始時HEAD `bbd62b0`。
- 変更：
  1. **メニュー名の英語化と右寄せコンパクト化（`practice8.3.html`、`style.css`）**：
     - メニュー名を学習者向けに `📘 Beyond L8 Words` に変更。
     - 閉じた状態では右端に小さく角丸ボタン（pill style）で配置（`unlearned-lexicon-container` に `display: flex; justify-content: flex-end;`）。ドリル主動線を邪魔しない控えめなデザインへ刷新。
     - 開いた状態（`[open]`）ではカード幅が100%に広がり、一覧性を維持。
  2. **件数表示の内部移動と注記削除（`practice8.3.html`、`practice8.3.js`）**：
     - 閉じたボタンの常時カウント表示を撤去し、クリックして展開した後の内部見出しに `【Words】（8）`、`【Kanji】（14）` として配置。
     - `※With漢字モードで使用` の注記テキストを削除。
     - `practice8.3.js` の `updateUnlearnedLexicon` を簡素化（Kanjiグループの表示切替のみ）。
  3. **キャッシュキー更新（`practice8.3.html`）**：
     - `style.css` および `practice8.3.js` のクエリを `v=20261103-p83-beyond-l8-compact` に更新。
- 変更ファイル：practice8.3.html、practice8.3.js、style.css、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、右寄せレイアウト・構文整合性確認合格。
- 実機確認状況：閉じた時の右寄せコンパクトボタン表示、クリック展開時のレイアウト、見出し件数表示確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `bbd62b0`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 未習リストのレベル表記括弧統一（【...】）および未出語への英語意味付与完了。開始時HEAD `56ad343`。
- 変更：
  1. **未習リスト表記の統一と英語意味の追加（`practice8.3.html`、`practice8.3.js`）**：
     - 未出の言葉（8語）と未出の漢字（14字）のレベル表記括弧をすべて `【L...】`・`【Genki外】` の墨付き括弧で統一。
     - 未出の言葉すべてに英語の意味を追加：
       - `はじまる`【L9】to begin
       - `おわる`【L9】to end
       - `ちかい`【L11】near / close
       - `チーム`【L21】team
       - `得意`【Genki外】good at / one's forte
       - `コイ`【Genki外】carp
       - `RPG`【Genki外】role-playing game
       - `ローソン`【Genki外】Lawson (convenience store)
     - 語彙数を `8語`（はじまる・おわるを分離）に更新（HTML初期表示およびJSの `updateUnlearnedLexicon` 内カウント表示）。
  2. **キャッシュキー更新（`practice8.3.html`）**：
     - `v=20261103-p83-unlearned-english-meanings` に更新。
- 変更ファイル：practice8.3.html、practice8.3.js、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、語彙・括弧統一確認合格。
- 実機確認状況：未習リスト内の英語意味表示およびレベル表記括弧の統一確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `56ad343`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 ページ上部への「Genki L8 未習リスト」アコーディオン追加、D3/D4およびBehind the Cuesの「はじまる・おわる・ちかい」ひらがな統一完了。開始時HEAD `7b0da14`。
- 変更：
  1. **Genki L8 未習リスト（アコーディオン）の実装（`practice8.3.html`、`practice8.3.js`、`style.css`）**：
     - 設定バー直下・Drill1上部に `<details class="unlearned-accordion">` を新設。
     - 【未出の言葉（7語）】: `はじまる / おわる`（L9）、`ちかい`（L11）、`チーム`（L21）、`得意 / コイ / RPG / ローソン`（Genki外）。
     - 【未出の漢字（14字）】: `With漢字` モード時のみ表示（`Hiragana Only` 時は非表示）。`員【L9】店員（てんいん）`、`楽【L10】楽しい（たのしい）`、`屋【L11】本屋（ほんや）`、`親【L12】親切（しんせつ）`、`教【L12】教える（おしえる）`、`好【L13】好き（すき）`、`意【L13】得意（とくい）`、`泳【L14】泳ぐ（およぐ）`、`店【L16】店（みせ）／店員（てんいん）`、`静【L18】静か（しずか）`、`難【L21】難しい（むずかしい）`、`果【L22】果物（くだもの）`、`忙【Genki外】忙しい（いそがしい）`、`得【Genki外】得意（とくい）`。
     - セッション保持（`sessionStorage`）により開閉状態を維持。
  2. **本文・解説のひらがな統一（`practice8.3.js`、`practice8.3.html`）**：
     - D3本文の `はじまっていますか`、`おわっていますか`、D4の `ちかいですか` を平仮名に統一。
     - `Behind the Cues` 内の解説文も `はじまる`、`おわる`、`ちかい` に統一。
  3. **キャッシュキー更新（`practice8.3.html`）**：
     - `v=20261103-p83-unlearned-accordion` に更新。
- 変更ファイル：practice8.3.html、practice8.3.js、style.css、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、構文・アコーディオン整合性確認合格。
- 実機確認状況：アコーディオン開閉動作、Script Mode連動、D3/D4ひらがな表示確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `7b0da14`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Drill 2 だれ（勉強が得意、ピアノをひくのが上手、歌うのがきらい）実装完了。開始時HEAD `acc53be`。
- 変更：
  1. **Drill 2 だれ（3問）の全面刷新（`practice8.3.js`）**：
     - 1問目: `だれが、勉強が得意ですか。／どの人が、勉強が得意ですか。／山口さんが、勉強が得意です。`（キュー: `だれ`・`勉強`・`とくい`、`どの人`・`勉強`・`とくい`、`山口さん`）。「得意」はGenki例外として採用、「どの人」を採用。
     - 2問目: `だれが、ピアノをひくのが上手ですか。／どのクラスメートが、ピアノをひくのが上手ですか。／中山さんが、ピアノをひくのが上手です。`（キュー: `だれ`・`ピアノをひく`・`じょうず`、`どのクラスメート`・`ピアノをひく`・`じょうず`、`中山さん`）。「英語」との重複を回避して「ピアノをひく」を採用。
     - 3問目: `だれが、歌うのがきらいですか。` ➔ `どの友達が、歌うのがきらいですか。` ➔ `川村さんが、歌うのがきらいです。`（キュー: `だれ`・`うたう`・`きらい`、`どの友達`・`うたう`・`きらい`、`川村さん`）。
     - 語彙辞書・STT登録・単語マッピング（`得意`、`勉強`、`ピアノをひく`、`ピアノ`、`ひく`、`歌う`、`きらい`、`嫌い`、`とくい`）を追加。
  2. **キャッシュキー更新（`practice8.3.html`）**：
     - `v=20261103-p83-d2-piano-tokui-kirai` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、語彙・構文整合性確認合格。
- 実機確認状況：Practice 8.3 Drill 2 だれ 3問の表示・音声・キュー・録音認識確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `acc53be`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。本番アセット全24枚のWebP化（42MB→3.7MB・約91%削減）およびVercel不要デプロイ自動スキップ（vercel.json ignoreCommand）実装完了。開始時HEAD `6437a93`。
- 変更：
  1. **全本番アセット（assets/ 直下24枚）のWebP化**：
     - `libMagickWand` を用いて全24枚のPNGを高品位WebP（品質85、アルファ透過維持、縦横比完全維持）へ変換し、PNGファイルを削除。
     - アセット容量を **42MB ➔ 3.7MB（約91%削減）** へ劇的に軽量化。
     - 参照コード（`practice2.1.js`、`practice2-next.js`、`style.css`、テスト群）の参照パスを `.webp` へ更新。
  2. **Vercel不要デプロイ自動スキップ（`vercel.json`）**：
     - `ignoreCommand` を設定し、`docs/`、`tests/`、`scripts/`、`*.md` のみ変更のコミットではVercelビルド・デプロイを自動スキップ（Exit 0）させ、デプロイ容量消費を抑制。
- 変更ファイル：assets/*.webp, assets/*.png (del), practice2.1.js, practice2-next.js, style.css, tests/*.cjs, vercel.json, docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格、WebP寸法・透過チャネル検証合格。
- 実機確認状況：P2.1, P2.2, P2.3 での WebP 画像表示確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `6437a93`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。未採用Review画像（assets/review/ 全73ファイル・約62MB）一括削除、画像整理・削除ルールのAGENTS.md制定完了。開始時HEAD `1f6bc08`。
- 変更：
  1. **未採用Review画像の一括削除（`assets/review/`）**：
     - 過去のUI比較・検討用画像全73ファイル（約62MB）を一括削除。
     - 本番コード（HTML/CSS/JS）で参照されている本番用画像（`assets/` 直下24ファイル・約42MB）はすべて完全維持。
  2. **画像整理・削除ルールの制定（`AGENTS.md`）**：
     - レビューが終わり採用が見送られた検討用画像はリポジトリ肥大化防止のため削除する。
     - 各ページの作成完了宣言時に、採用しなかった画像は削除する（必要に応じてユーザー許可を確認する形態も可）。
- 変更ファイル：assets/review/（削除）、AGENTS.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：本番各ページ（P2.1, P2.2, P2.3等）の画像表示への影響がないことを確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `1f6bc08`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Vercelデプロイ容量削減用 `.vercelignore` 追加完了。開始時HEAD `729ada4`。
- 変更：
  1. **`.vercelignore` の新設**：
     - Vercelデプロイ対象から `assets/review/`（約62MBの検討用高解像度画像群）、`tests/`、`docs/`、`*.md` を除外。
     - 1デプロイあたりの転送・保存容量を約107MBから約35MB以下（約67%以上の削減）へ圧縮。
- 変更ファイル：.vercelignore、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：Vercel自動デプロイでの容量削減効果・ビルド確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-03 / Europe/Vienna / LT・コミット `729ada4`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Ex2 語彙精緻化（どの店の店員、このRPG）完了、Vercel容量急増（6GB→15GB）原因調査完了。開始時HEAD `0b05ca6`。
- 変更：
  1. **Ex2 語彙精緻化（`practice8.3.js`）**：
     - Ex2 だれ Q2: `どの店員が、親切ですか。` ➔ `どの店の店員が、親切ですか。`（キュー: `どの店の店員`、回答: `本屋の店員が、親切です。` と呼応）。
     - Ex2 何 A: `RPGが、おもしろいです。` ➔ `このRPGが、おもしろいです。`（キュー: `このRPG`）。
     - 語彙辞書・STT登録（`どの店の店員`、`このRPG`、`このアールピージー`）を追加。
  2. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261103-p83-kono-rpg-clerk` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Ex2（どの店の店員、このRPG）の表示・動作・音声判定は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `0b05ca6`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Ex2/D2語彙更新（親切・本屋の店員、ゲーム・RPG、どの人）、Behind the Cues への「どれ vs どの＋名詞」解説および形容詞・疑問詞対称性テーブル追加完了。開始時HEAD `1450a2e`。
- 変更：
  1. **Ex2 および D2 の語彙更新（`practice8.3.js`）**：
     - Ex2 だれ: `どの先生が、やさしいですか。／山下先生が、やさしいです。` ➔ `どの店員が、親切ですか。／本屋の店員が、親切です。`（キュー: `しんせつ`、`どの店員`、`本屋の店員`）に変更し、Ex1（先生）およびD2（やさしい）との重複を解消。
     - Ex2 何: `どの映画が、おもしろいですか。／日本の映画が、おもしろいです。` ➔ `どのゲームが、おもしろいですか。／RPGが、おもしろいです。`（キュー: `どのゲーム`、`RPG`）に変更し、D3（映画）との重複を解消。
     - D2 だれ: 1問目を `どの学生が、やさしいですか。` ➔ `どの人が、やさしいですか。`（キュー: `どの人`）に変更し、D1（どの学生）との重複を解消。
     - 語彙辞書・STT登録（`親切`、`どの店員`、`店員`、`本屋の店員`、`本屋`、`どのゲーム`、`ゲーム`、`RPG`、`アールピージー`、`どの人`、`人` 等）を追加。
  2. **Behind the Cues（ドロワー）への解説・対称性テーブル追加（`practice8.3.html`、`style.css`）**：
     - 「5. `どれ` vs `どの＋Noun`: When Is the Category Known?」を追加（カテゴリー未指定のどれ vs 既知カテゴリー内の絞り込みであるどの＋名詞）。
     - 「6. Semantic Symmetry: Adjectives & Question Words」を追加（いつ/だれ/何/どれ/どこ とそれぞれが要求する形容詞カテゴリー・具体例の対照表を収載）。
     - ドロワー内テーブル用CSSスタイル（`.cues-drawer-table`、ダークモード対応）を追加。
  3. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-drawer-symmetry-table` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、style.css、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格、全29問重複検証完了。
- 実機確認状況：Ex2（親切・本屋の店員、ゲーム・RPG）およびD2（どの人）、ドロワー内追加テーブルの表示は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `1450a2e`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Drill 1 何（いぬ、この池／泳いでいる／どの魚／コイ）更新、Behind the Cues 筆者メモ全面再構成完了。開始時HEAD `cd1811a`。
- 変更：
  1. **Drill 1 何 のキュー・問題更新（`practice8.3.js`）**：
     - 1問目回答キューを `['いぬ','いる']` から `['いぬ']` に簡素化。
     - 2問目を冷蔵庫・トマトから「池・魚・コイ・泳いでいる」に変更：
       - Q1: `何が、この池で泳いでいますか。`（キュー: `何`／`この池`／`およいでいる`）
       - Q2: `どの魚が、泳いでいますか。`（キュー: `どの魚`／`およいでいる`）
       - A: `コイが、泳いでいます。`（キュー: `コイ`）
     - 語彙辞書・STT登録（`この池`、`どの魚`、`コイ`、`泳いでいる`、`泳いでいます`、`泳ぐ`）を追加。
  2. **Behind the Cues（Drill 3 ドロワー）の筆者設計ノート再構成（`practice8.3.html`）**：
     - ユーザーの設計意図（だれ/何での動詞作成と自動詞の活用、どれの無生物制約と乗り物/イベント、どこを組織主体として動詞を取らせる「どの+Noun」の必然性、なぜ「いつ」には動詞文がないのか）に基づき、流麗な英語解説文に全面再構成。
  3. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-behind-the-cues-full` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Drill 1 何（コイ・泳いでいる）の表示・音声・判定、および Behind the Cues ドロワーの解説文面は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `cd1811a`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 キュー重複解消・語彙精緻化、全Drillタイトル・説明文統一完了。開始時HEAD `7ff5dcc`。
- 変更：
  1. **Ex1・D2・D4の語彙重複解消とキュー変更（`practice8.3.js`）**：
     - Ex1 だれ A: 想定回答を `田中先生が、教えます。` から `先生が、教えます。` に修正（キューの `先生` と一致させ、重複チェック完了）。
     - D2 だれ: 2問目を `どの学生が、かっこいいですか。` から `どのクラスメートが、おもしろいですか。`（中山さん）に変更し、1問目（学生・やさしい）・2問目（クラスメート・おもしろい）・3問目（友達・歌が上手）で被修飾名詞・形容詞の重複を完全解消。
     - D2 何: 3問目の回答キュー `['英語','クラス']` を一語化ルールに基づき `['英語のクラス']` に修正。
     - D4 どれ: 2問目の `先生のペン` を `妹のペン` に変更（`先生` の他タスク重複を解消）。
     - D4 どこ: 2問目の `どのカフェ／駅のカフェ` を `どのトイレ／駅のトイレ` に変更。
     - 語彙辞書・STT登録（`妹のペン`、`どのトイレ`、`駅のトイレ`、`どのクラスメート`、`どの学生`、`どの友達` 等）を拡充。
  2. **Drill 1〜4 タイトルおよび説明文の他ページ統一化（`practice8.3.js`）**：
     - タイトルを `Subject Questions — [疑問詞] ([品詞])` 形式に統一（`だれ／何 (Verb)`、`だれ／何 (Adjective)`、`どれ／どこ (Verb)`、`どれ／どこ／いつ (Adjective)`）。
     - 説明文を `💡Ask with ..., narrow down with a specific noun, then answer.` 形式で他ページの行動指示型（Practice 8.1 / 8.2 等）と統一。
  3. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-cue-refinements` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Ex1・D2・D4の語彙表示、Dr1〜4タイトル・説明文の統一表示、音声・録音判定は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `7ff5dcc`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Drill 3 に「🧩 Behind the Cues」スライドイン・ドロワー実装完了。開始時HEAD `d7736b3`。
- 変更：
  1. **Drill 3 「🧩 Behind the Cues」スライドイン・ドロワー新設（`practice8.3.html`、`practice8.3.js`、`style.css`）**：
     - Drill 3 の `info-panel` 右下に「`🧩 Behind the Cues`」ボタン（`.behind-the-cues-btn`）を設置。
     - クリック時に画面右端からスムーズにスライドインする解説ドロワー（`.cues-drawer`）を実装（Escキー・背景クリック・✕ボタンでクローズ、ARIA属性対応）。
     - ドロワー内に「どれ」の状況的文脈（`はじまっている`・`おわっている`）、「どこ」の組織・主体への拡張（`どの会社`・`どのチーム`）、一語化キュー設計の意図を収載。
     - ダークモード対応（`@media (prefers-color-scheme: dark)`）。
  2. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-behind-cues` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、style.css、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Drill 3 の「🧩 Behind the Cues」ボタンの表示、ドロワーの開閉動作・アニメーション・レスポンシブ表示は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `d7736b3`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 における「ひま」モデル文平仮名固定化、人名変更（スミス→山口、ロバート→中山、メアリー→川村）。開始時HEAD `08216c9`。
- 変更：
  1. **Practice 8.3 モデル文・人名変更（`practice8.3.js`）**：
     - Ex4の「暇」を、With漢字モードでも平仮名表記となるよう `ひま`（`いつが、ひまですか。` 等）に統一。
     - Drill 2 の回答人名を日本人の名前に変更：スミスさん → 山口さん、ロバートさん → 中山さん、メアリーさん → 川村さん。
     - 語彙辞書・STT登録（`山口さん`、`中山さん`、`川村さん`）を拡充。
  2. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-names-hima` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Practice 8.3 Drill 2の人名回答およびEx4の「ひま」表示・音声認識は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `08216c9`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Drill 3 の「どれ」キューおよびモデル文更新（`はじまる/おわる` → `はじまっている/おわっている`、`始まっていますか/終わっていますか`）。開始時HEAD `df986e3`。
- 変更：
  1. **Practice 8.3 Drill 3 キュー・モデル文変更（`practice8.3.js`）**：
     - Drill 3「どれ」のキューを `はじまる/おわる` から `はじまっている/おわっている` に変更。
     - モデル文・想定回答を「始まっていますか／終わっていますか」「〜始まっています／〜終わっています」に更新（旧表記 `始まります` 等も許容配列に保持）。
     - 語彙辞書・STT登録（`始まっている`、`始まっています`、`終わっている`、`終わっています`）を追加。
  2. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-d3-teiru` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Practice 8.3 Drill 3 の「どれ」キューおよび音声・録音判定は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `df986e3`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 における英語語義内のアポストロフィエスケープ漏れ修正（`Kimura's team` → `Kimura\'s team`）。開始時HEAD `1e1c3f8`。
- 変更：
  1. **Practice 8.3 構文エラー修正（`practice8.3.js`）**：
     - `practice8.3.js` 内の辞書登録処理で、`['木村さんのチーム','Kimura's team']` における英単語のアポストロフィがエスケープされておらず JavaScript 構文エラー（SyntaxError: Unexpected identifier 's'）となっていた不具合を、`['木村さんのチーム','Kimura\'s team']` に修正。
     - JS トークナイザーによる全ファイル構文・括弧・クォート検証を実施し、未閉合クォート・括弧 0 を確認。
  2. **キャッシュ更新（`practice8.3.html`）**：
     - キャッシュキーを `v=20261102-p83-syntax-fix` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/HANDOVER.md。
- 自動検証：JS構文解析テスト合格、`git diff --check` 合格。
- 実機確認状況：Practice 8.3 正常表示（画面ロード・Example 1〜4・Drill 1〜4）は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `1e1c3f8`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Example 4 および Drill 4（どれ / どこ / いつ：形容詞・ない 主語質問文）の新設、最上段への `Adjective` バッジ設置完了。開始時HEAD `60389a1`。
- 変更：
  1. **Practice 8.3 Example 4 および Drill 4 の新設（`practice8.3.js`、`style.css`）**：
     - Example 4 最上段に形容詞文として `Adjective` バッジを配置（キューの `ない` の真上に配置）。
     - 区分列は `どれ (Which)`／`どこ (Where)`／`いつ (When)` の3組を設定。
     - キューの一語化規則（`どの本`、`スペイン語の本`、`どの部屋`、`その部屋`、`何曜日`、`水曜日`、`どの時計`、`あの時計`、`どのペン`、`先生のペン`、`どのコンビニ`、`ローソン`、`どのカフェ`、`駅のカフェ`、`どの日`、`クリスマス`、`どの時間`、`午後`）を遵守。
     - Example 4:
       - どれ: 「どれが、ないですか。／どの本が、ないですか。／スペイン語の本が、ないです。」
       - どこ: 「どこが、静かですか。／どの部屋が、静かですか。／その部屋が、静かです。」
       - いつ: 「いつが、暇ですか。／何曜日が、暇ですか。／水曜日が、暇です。」
     - Drill 4:
       - どれ:
         1. どれが、高いですか。／どの時計が、高いですか。／あの時計が、高いです。
         2. どれが、新しいですか。／どのペンが、新しいですか。／先生のペンが、新しいです。
       - どこ:
         1. どこが、近いですか。／どのコンビニが、近いですか。／ローソンが、近いです。
         2. どこが、きれいですか。／どのカフェが、きれいですか。／駅のカフェが、きれいです。
       - いつ:
         1. いつが、いいですか。／どの日が、いいですか。／クリスマスが、いいです。
         2. いつが、忙しいですか。／どの時間が、忙しいですか。／午後が、忙しいです。
     - Drill 4 の Set切替ボタン（`どれ (Which one)` / `どこ (Where)` / `いつ (When)`）を連動。
     - 語彙辞書・STT登録（スペイン語の本、どの本、スペイン語、どの部屋、その部屋、静か、何曜日、水曜日、暇、どの時計、あの時計、高い、どのペン、先生のペン、新しい、どのコンビニ、近い、どのカフェ、駅のカフェ、どの日、クリスマス、どの時間、忙しい、午後等）の拡充。
  2. **スタイル・キャッシュ更新（`style.css`、`practice8.3.html`）**：
     - `#drill4 .p81-example` および `#drill4 .p81-model` を CSS グリッド定義に追加。
     - キャッシュキーを `v=20261102-p83-add-ex4-dr4` に更新。
- 変更ファイル：practice8.3.js、practice8.3.html、style.css、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：Practice 8.3 Example 4・Drill 4 のレイアウト、`Adjective` バッジ位置、3セット切替、音声・録音判定は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `60389a1`）

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `f60f930`）

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `9dc3cd0`）

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `35faf4d`）

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `cd06387`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 における Example 2 および Drill 2（形容詞の主語質問文: Adjective）の新設、Exampleヘッダー区分（Verb / Adjective）の追加完了。開始時HEAD `c862c3a`。
- 変更：
  1. **Practice 8.3 Example 2 および Drill 2 の新設（`practice8.3.js`、`style.css`）**：
     - Example 1（Verb）および Example 2（Adjective）の最上段に英語ヘッダー（`.p83-example-header`）を設置（学習者負担を考慮し日本語表記「動詞」「形容詞」は無し）。
     - Example 2 に「だれ (Who)」「何 (What)」の2セットを配置：
       - だれ: 「だれが、やさしいですか。／どの先生が、やさしいですか。／山下先生が、やさしいです。」
       - 何: 「何が、おもしろいですか。／どの映画が、おもしろいですか。／日本の映画が、おもしろいです。」
     - Drill 2 に「だれ (Who)」3問・「何 (What)」3問を設置（Genki既習語準拠、キューの未習漢字は平仮名化）：
       - だれ 1: だれ ／ やさしい（Q1: だれが、やさしいですか。／Q2: どの学生が、やさしいですか。／A: スミスさんが、やさしいです。）
       - だれ 2: だれ ／ かっこいい（Q1: だれが、かっこいいですか。／Q2: どの学生が、かっこいいですか。／A: ロバートさんが、かっこいいです。）
       - だれ 3: だれ ／ 歌が上手（Q1: だれが、歌が上手ですか。／Q2: どの友達が、歌が上手ですか。／A: メアリーさんが、歌が上手です。）
       - 何 1: 何 ／ 楽しい（Q1: 何が、楽しいですか。／Q2: どのスポーツが、楽しいですか。／A: テニスが、楽しいです。）
       - 何 2: 何 ／ 好き（Q1: 何が、好きですか。／Q2: どの音楽が、好きですか。／A: ロックが、好きです。）
       - 何 3: 何 ／ 難しい（Q1: 何が、難しいですか。／Q2: どのクラスが、難しいですか。／A: 日本語のクラスが、難しいです。）
     - Drill 2 の Set切替ボタン（「だれ (Who)」「何 (What)」）の連動およびレンダリングを実装。
     - 語彙・辞書（映画、日本の映画、日本、山下先生、山下、歌が上手、歌、上手、友達、楽しい、好き、音楽、難しい、日本語等）の登録。
  2. **スタイル更新（`style.css`）**：
     - `#drill2 .p81-example` にも Example 6列グリッド定義を適用。
     - `.p83-example-header` のスタイル定義（上部ヘッダーとして全幅スパン、ダークモード対応）。
  3. **仕様書・キャッシュ更新（`docs/PRACTICE8_SPEC.md`、`practice8.3.html`）**。
- 変更ファイル：practice8.3.js、practice8.3.html、style.css、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：Practice 8.3 Example 2・Drill 2の表示、きくボタン、録音・正誤判定、ヘッダー表示は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `c862c3a`）

## 以前の記録（2026-11-02 / Europe/Vienna / LT・コミット `588f7da`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 括弧漢字ルールに基づく「教える」「果物」のWith漢字実装、および「だれ」の平仮名維持完了。開始時HEAD `5dbca5f`。
- 変更：
  1. **未習参考漢字のWith漢字実装（`practice8.3.js`）**：
     - Genki語彙欄の参考漢字（括弧漢字）に基づき、可読性と実用性の高い「教える」（動詞活用形含む）および「果物」を `With漢字` モードで漢字表記として登録・適用。
     - `Hiragana Only` モードでは自動的に「おしえる」「くだもの」へ展開されるよう辞書・変換ルールを完全連動。
     - 疑問詞「だれ」は初級教科書・公文書の標準規則に従い平仮名表記を維持。
  2. **仕様書の同期（`docs/PRACTICE8_SPEC.md`）**：
     - Practice 8.3節に上記漢字仕様を追記。
  3. **キャッシュキー更新（`practice8.3.html`）**。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：今回のPractice 8.3「教える」「果物」漢字表示（With漢字／Hiragana Only両モード）は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `5dbca5f`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Drill 1 何Set 1問目のQ2（どの／ペット／いる）およびA（いぬ／いる）のキュー・モデル簡潔化完了。開始時HEAD `c726abf`。
- 変更：
  1. **Drill 1 何Set 1問目のQ2・A簡潔化（`practice8.3.js`）**：
     - Q2を「どのペットが、いますか。」（キュー：`どの`／`ペット`／`いる`）に変更し、1行目の「こうえん」との重複を排除。
     - Aを「いぬが、います。」（キュー：`いぬ`／`いる`）に変更。許容回答（`accept`）として従来の「いぬが、こうえんにいます。」も保持。
  2. **仕様書の同期（`docs/PRACTICE8_SPEC.md`）**：
     - Practice 8.3節のWhat set 1問目の仕様記述を最新実装に同期。
  3. **キャッシュキー更新（`practice8.3.html`）**。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：今回のDrill 1 What 1問目のキュー・モデル変更（どの／ペット／いる、いぬ／いる）は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `c726abf`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Set切替ラベルからのSet表記撤去、Ex Q2のキッチン除外、Drill 1 何Set 2の「れいぞうこ」導入、および全モデル・表示における「が、」徹底完了。開始時HEAD `99e7a15`。
- 変更：
  1. **Set切替ボタンのラベル修正（`practice8.3.js`）**：
     - 切替ボタン自体を維持しつつ、ラベルから「Set 1」「Set 2」を撤去し「だれ (Who)」「何 (What)」へ変更。
  2. **Ex Q2の文面・キュー調整（`practice8.3.js`）**：
     - 1行目のキッチンとの重複を避け「どのくだものが、ありますか。」（キュー：`どの`／`くだもの`／`ある`）に変更。回答「りんごが、あります。」を維持。
     - 「が」の強調後の「、」は通常フォントのまま表示。
  3. **Drill 1 何Set 2の「れいぞうこ」導入と「が、」徹底（`practice8.3.js`）**：
     - 何Set 2問目を「何が、れいぞうこにありますか。」（キュー：`何`／`れいぞうこ`／`ある`）、「どのやさいが、ありますか。」（キュー：`どの`／`やさい`／`ある`）、「トマトが、あります。」（キュー：`トマト`／`ある`）へ更新。語彙・STT辞書に「れいぞうこ」「冷蔵庫」を登録。
     - ページ内のすべての文（ExampleおよびDrill 1全行）において、モデル文・表示文ともに「が」の後ろに読点「、」を入れることを徹底。
  4. **仕様書の同期（`docs/PRACTICE8_SPEC.md`）**：
     - Practice 8.3節の仕様記述を上記最新決定事項に同期。
- 変更ファイル：practice8.3.js、practice8.3.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：今回のPractice 8.3修正（Setラベル、Ex Q2、れいぞうこ、全行「が、」）は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `99e7a15`）

- Practice 8.3のExample／Drill 1修正をGitHub `main` へ保存。Ex1のくだもの質問・モデルからキッチンを除外し、返答を「りんごが、あります。」へ変更。Exampleモデルの「が」を共通 `grammar-highlight`（太字＋ゴールド）で強調。Drill 1はSet表示・切替を撤去し4問を連続表示、D1-1-Aを山田さん、D1-2-Aを田中さんへ変更し、料理する／料理をするの両形を許容。
- 構文確認：JavaScript構文解析合格。ブラウザ・音声・録音・判定の実機確認は未了。Vercelデプロイも未確認。
- 保存コミット：HTML cache key更新 `5bf614d1e871f23172547e7275b5f3e5804c05b5`。その直前のJS変更は `18179f4`、`9090128`。
- 引き継ぎ可能（GitHub保存確認済み）。未確認の実機動作・公開反映を完了扱いにしない。

---

## 現在のリレー状態（2026-11-01 / Europe/Vienna / LT）

- 状態：引き継ぎ可能（GitHub保存確認済み）。IndexにおけるPractice 8.3リンク位置・HTMLタグ構文エラーの修正、およびタイトル「Practice 8.3: だれが？何が？」への統一更新完了。開始時HEAD `aa80b32`。
- 変更：
  1. **Indexのリンク位置とHTML構文の修正（`index.html`）**：
     - Pronunciation 1と2の間に挟まっていたリンクを `practice8.2.html` の直下へ移動。
     - 破損していたタグ（`</li`、`</li>>`）を正しいリスト構造（`<li><a ...></a></li>`）へ修正。
  2. **タイトルの更新（`index.html`・`practice8.3.html`）**：
     - 文法用語「疑問詞が主語の文」から、学習者にとって直感的かつGenki語彙表記（Lesson 1語彙「だれ」、Lesson 2漢字「何」）に準拠した `Practice 8.3: だれが？何が？` へ変更。
     - `practice8.3.html` の `<title>` および `<h1>` も同一タイトルへ統一。
- 変更ファイル：index.html、practice8.3.html、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：Indexの配置・表示およびPractice 8.3タイトル表示は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `aa80b32`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 8.3 Exampleの丸Q・空欄プレースホルダー・縦並びレイアウト崩れ解消、およびDrill 1のSet 1 (だれ) / Set 2 (何) 分割の反映完了。開始時HEAD `6bcd492`。
- 変更：
  1. **Example の丸Q・空欄プレースホルダーによる縦位置整列（`practice8.3.js`・`style.css`）**：
     - 行1: `Q`（丸囲みQ）、行2: `Q` と同幅の不可視空欄プレースホルダー（`visibility: hidden;`）、行3: `A`（丸囲みA）を生成する `makeKindBadge()` を導入。
     - 2行目（どのNounが）のキュー開始位置が1行目・3行目と同一のX座標で一直線に揃うよう修正。
  2. **Example の横並びレイアウト崩れの解消（`practice8.3.js`・`style.css`）**：
     - `.p81-example` 直下へのラッパー要素配置による横方向グリッド流し込みを解消し、`p81-example-row` を直接展開。
     - セット間に横断セパレータ（`.p83-example-divider`、`grid-column: 1 / -1;`）を配置し、「だれ」セット3行＋「何」セット3行の計6行が縦方向に美しく整列するよう修正。
  3. **Drill 1 の Set 分割（`practice8.3.js`・`style.css`）**：
     - Drill 1 を `Set 1: だれ (Who)`（問1: てつだう、問2: りょうりする）と `Set 2: 何 (What)`（問1: こうえん・いる、問2: キッチン・ある）に分割。
     - 切り替えUI（`.p21-set-switcher`）を導入し、学習負荷の軽減と今後のDrill拡張に対応。各カード内でも丸Q・空欄・丸Aでキュー位置を統一。
- 変更ファイル：practice8.3.js、style.css、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：今回のPractice 8.3 Exampleレイアウト・丸Q空欄整列およびDrill 1のSet切り替えは実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `a9ebd3b`）

- 状態：引き継ぎ可能（GitHub保存確認済み）。Practice 2.3 Ex1モデル行音声ボタンと本文のベースライン共有化、および都市領域（Ex1・D1・D2）の上下左右4pxインセット・角丸6px統一フレームの反映完了。開始時HEAD `d6bc375`。未了の残作業なし。
- 変更：
  1. **Ex1音声ボタンと本文のベースライン共有化（`style.css`）**：
     - `.p23-conversation-models .p23-example-audio` に残っていたセル上端揃え（`align-self: start;`）を撤去し、共通レイアウト契約通り親グリッドの `align-items: baseline` に従わせるよう修正（`align-self: auto;`）。「👉️」「🔊きく」と右側モデル文の第1行文字ベースラインを完全に一致。
  2. **都市領域の上下左右4pxインセット・角丸6px統一フレーム化（`practice2-next.js`・`style.css`）**：
     - `practice2-next.js` にて各都市領域要素へ `data-region-index`（0, 1, 2）を付与。
     - `style.css` にて、Ex1・D1・D2のすべての都市領域（`.p23-city-region`）を写真外枠から上下左右各4px内側に収まり、隣接領域間も4px間隔を保つ統一インセットフレーム（`top: 4px; bottom: 4px; border-radius: 6px;`）に再構成。
     - 発話中の青枠強調（`outline: 3px solid #2563eb; outline-offset: -3px; border-radius: 6px;`）が写真の外周やコンテナ境界線と干渉・同化せず、写真の中でカード状に独立して視認できるように改善。
- 変更ファイル：practice2-next.js、style.css、practice2.3.html、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：今回のPractice 2.3 Ex1音声ボタン基線一致および都市領域4pxインセット統一フレームは実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `d6bc375`）

- 状態：Practice 2.3 Ex1の「🔊きく」ボタン配置（`X ↔ Y`の直右）・再生中テキスト（`Playing...`）・発話連動XY点滅（ヘッダーバッジおよび画像内話者）・発話都市青枠ハイライト（X発話時日本／Y発話時イギリス）・発話に応じた「こ／そ」視点リアルタイム切り替え、および再生終了時のクリーンアップ完了。開始時HEAD `e5f32da`。
- 変更：
  1. **Ex1連続再生ボタンの配置と再生中テキスト修正（`style.css`・`practice2-next.js`）**：
     - `.p23-dialogue-audio` の `margin-left: auto;` を `margin-left: 0;` に変更し、ボタン（`🔊きく`）を `[📞 X ↔ Y]` バッジの直右に配置。
     - 再生中のボタンテキストを日本語 `再生中…` からサイト標準の `Playing...` に統一。
  2. **発話に応じたXY点滅と発話都市の青枠ハイライト連動（`practice2-next.js`・`style.css`）**：
     - 連続再生中、各文の発話者（Xの文ではX、Yの文ではY）に応じて、ヘッダーの通話バッジ（`[📞 X ↔ Y]` 内の該当人物）、画像内の話者バッジ（`.p23-city-person`）、およびモデル文行の話者バッジがリアルタイムで点滅（`.is-speaking`）するよう連動。
     - 発話中の都市領域（`.p23-city-region`）に青枠（`outline: 3px solid #2563eb;`）を適用し、Xが話しているときは日本、Yが話しているときはイギリスを青枠表示。
     - 再生完了時および中断時（`stopAllPlayback`）に、すべての点滅・青枠・モデル行強調を漏れなく確実に解除。
  3. **Y発話時の「こ／そ」視点動的切り替えの完全連動（`practice2-next.js`）**：
     - X発話時は日本＝「こ」（話し手の近く）、イギリス＝「そ」（聞き手の近く）、アメリカ＝「あそこ」。
     - Y発話時はイギリス＝「こ」（話し手の近く）、日本＝「そ」（聞き手の近く）、アメリカ＝「あそこ」へと、連続再生の各文の切り替えに合わせてラベルおよび説明テキストが動的に更新される動作を完全連動。
- 変更ファイル：practice2-next.js、style.css、practice2.3.html、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：今回のPractice 2.3 Ex1修正（ボタン位置、Playing...、XY点滅連動、都市青枠、こ/そ視点切替）は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `e5f32da`）

- 状態：Practice 2.3 Ex1の通話表示を角丸四角囲み人物表記（`📞 [X] ↔ [Y]`）へ統一、Ex1全発話（1行目「私は日本です」〜「あそこは夕方です」）の順次連続再生、および各行の個別音声ボタン（`🔊きく`）への復元完了。開始時HEAD `95acbd5`。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `95acbd5`）

- 状態：Practice 2.2の最新版修正（D2・D3のY返答キュー `…の／`、英語キュー `adjective/…`）がGitHub上に反映完了していることを確認し、未反映状態データを削除・整理完了。ローカル変更の未Push放置禁止と即時コミット・Push原則をプロトコル（`AGENTS.md`・`docs/RELAY_WORKFLOW.md`、版：2026-11-01.1）へ改定完了。開始時HEAD `500cfdc`。
- 変更：
  1. **Practice 2.2最新版の確認と未反映状態データの削除・整理**：
     - リモート（origin/main `500cfdc`）にて `practice2-next.js` のD2およびD3のY返答キューが `…の／${vocabulary(o)}`（英語キュー `adjective/...`）へ修正済みであることを全件照合・確認。
     - 以前の引き継ぎ記録に残っていた「2.2未反映・確認待ち」等の記述を解消・確認済みとして削除・整理。
  2. **共通リレープロトコルの改定（版：2026-11-01.1）**：
     - `AGENTS.md`（第1節・第3節）および `docs/RELAY_WORKFLOW.md`（原則・第2節）に、ローカル作業時のトークン切れ・会話切断による未Push変更放置・孤立を防ぐため、「ローカル編集後は構文検証からコミット＆Pushまでを不可分（アトミック）に即座完了させ、未Push変更を残したまま質問・相談や会話持ち越しを行わない原則」を明文化。
- 変更ファイル：AGENTS.md、docs/RELAY_WORKFLOW.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：Practice 2.2（D2・D3キュー、青枠表示）、Practice 2.3（Ex1通話再生・話者フォーカス）はすべて実装・自動検証済み。Practice 2.1はD2キュー（`…れ／品名`）のみ未反映（次作業）。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `7bac623`）

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `0db7a4d`）

- 状態：内部ロジックテストの実行タイミングに関する継続ルール（ユーザーから「このページは完了だ」の一言があった後に各ページ1度だけ実行し、途中の小作業での反復テストによる浪費を回避する規則）を `AGENTS.md` および `docs/RELAY_WORKFLOW.md` に登録完了。開始時HEAD `5053d36`。
- 変更：
  1. **内部ロジックテスト実行条件のルール化**：`AGENTS.md`（第3節）および `docs/RELAY_WORKFLOW.md`（第2節）に、通常の小作業では最小限の差分・構文チェックのみを行い、包括的な内部ロジックテストはユーザーの「このページは完了だ」という宣言後に各ページ1度だけ行うことを明記。
- 変更ファイル：AGENTS.md、docs/RELAY_WORKFLOW.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` 合格。
- 実機確認状況：Practice 8.1の実装・内部ロジックテスト完了（Drill 2タイトル `Drill 2: Verbのが好き／きらい？` を反映済み）。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `5053d36`）
- 変更：
  1. **Drill 2タイトルの変更**：`sections[1].title` を `Drill 2: Verbのが好き／きらい？` に変更し、疑問文の練習であることを明示。
  2. **内部ロジック全件検証と回帰テスト・仕様書の同期**：D1〜D5全行・3文体・2表記モード・許容文・不正解文の計918項目をPythonで機械検証して全項目合格を確認し、`tests/practice81.cjs`、`tests/practice81-cue-fit.cjs`、`docs/PRACTICE8_SPEC.md` の古い期待値を現行仕様へ同期。
- 変更ファイル：practice8.1.js、practice8.1.html、docs/PRACTICE8_SPEC.md、tests/practice81.cjs、tests/practice81-cue-fit.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる計918項目の内部ロジック全件検証合格。
- 実機確認状況：Drill 2タイトル `Drill 2: Verbのが好き／きらい？` の表示のみ実機確認待ち（他項目はすべて実機確認完了）。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `899f50a`）
- 変更：
  1. **STT表記揺れ辞書の補強（`practice8.1.js`）**：教材表記がひらがな・カタカナ・交ぜ書きの語（`ぜんぜん`、`すごく`、`あまり`、`もの`、`カバン`、`朝ご飯`、`クラスメート`、`カタカナ`）や同訓異字（`音楽を聞く` に対する `聴く`、`早く` に対する `速く`）について、ブラウザ音声認識が漢字・別表記（`全然`、`凄く`、`鞄`、`物`、`朝ごはん`、`クラスメイト`、`聴く` 等）を返した場合でも正解判定・ひらがな変換されるよう `dictionary` に登録。
  2. **仕様書（`docs/PRACTICE8_SPEC.md`）の整合性修正**：D2節に残っていた旧「部屋／掃除する／きらい」を「洗濯／する／きらい」に更新し、動詞・目的語一覧直後の旧重複説明（手紙を書く・日本語を話す）を現行の「休む／泳ぐ／覚える／運転する」「日本語の先生／教える」に合わせて更新。
- 変更ファイル：practice8.1.js、practice8.1.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる全行モデル・正誤判定・STT表記揺れ検証合格。
- 実機確認状況：Practice 8.1のUI・語彙・順序変更はすべて実機確認完了。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `601365a`）

- 状態：Practice 8.1のD5-3を「1行目：Natural → 苦手、2行目：Unnatural → 下手」、D5-4を「1行目：Natural → 得意、2行目：Boastful → 上手」へ並び替え完了。開始時HEAD `beaaba0`。
- 変更：
  1. **D5-3の順序変更**：1行目を `Natural`（`私は、早く起きるのが苦手です。`）、2行目を `Unnatural`（`私は、早く起きるのが下手です。`）へ変更（Notice内の並びも `苦手` → `下手` に連動）。
  2. **D5-4の順序変更**：1行目を `Natural`（`私は、掃除するのが得意です。`）、2行目を `Boastful`（`私は、掃除するのが上手です。`）へ変更（Notice内の並びも `得意` → `上手` に連動）。
- 変更ファイル：practice8.1.js、practice8.1.html、docs/PRACTICE8_SPEC.md、tests/practice81.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・データ検証合格。
- 実機確認状況：D3-1「クラスメート／休む」を含む前回までの修正事項は全て実機確認完了。今回変更したD5-3・D5-4の行順序のみ実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `beaaba0`）

- 状態：Practice 8.1のD3-1をGenki L4既出・L6漢字配当の「休む」（`クラスメート／休む`、モデル：`クラスメートは、休むのが上手です。`）へ変更し、仕様書（AGENTS.md・PROJECT_SPEC.md・PRACTICE8_SPEC.md）に漢字表記のGenki仕様準拠徹底を明記完了。開始時HEAD `43c9a61`（仕様更新コミット `a7bf0c9`）。
- 変更：
  1. **漢字表記のGenki準拠徹底を仕様明記**：`AGENTS.md`、`docs/PROJECT_SPEC.md`、`docs/PRACTICE8_SPEC.md` に、語彙の初出Lessonだけでなく `With漢字` モードでの漢字表記もGenkiの語彙欄・漢字配当仕様に厳密に合わせることを明記。
  2. **D3-1を「クラスメート／休む」へ変更**：L9初出の「おどる」から、L4初出・L6漢字配当・ページ内重複なしの `W("rest","休む","やすむ","yasumu","to rest")` に変更（キュー：`クラスメート／休む`、モデル：`クラスメートは、休むのが上手です。`／`苦手です。`）。
- 変更ファイル：AGENTS.md、docs/PROJECT_SPEC.md、practice8.1.js、practice8.1.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・データ検証合格。
- 実機確認状況：D4「カバンを持つ」、D5-7「日本語の先生／教える」、D5 Notice（右側ボックス＋内部テキスト左詰め・黄色系見出し）、D5二択プルダウンのランダム順など従来分は全て実機確認完了。今回変更したD3-1「クラスメート／休む」のみ実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `43c9a61`）

- 状態：Practice 8.1のD3-1「おどる」をひらがな表記（`W("dance","おどる","おどる","odoru","to dance")`、STT変換対応）へ変更完了。開始時HEAD `6635c97`。
- 変更：Genki漢字配当外のため、D3-1の「踊る」を漢字・ひらがな両モードで「おどる」表示（`クラスメート／おどる`、モデル：`クラスメートは、おどるのが上手です。`）に統一し、音声認識で「踊る」が返った場合も「おどる」として判定・表示するよう対応。
- 変更ファイル：practice8.1.js、practice8.1.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・データ検証合格。
- 実機確認状況：D3-1「クラスメート／踊る（→おどるへ表記変更）」、D4「カバンを持つ」、D5-7「日本語の先生／教える」、D5 Notice（右側ボックス＋内部テキスト左詰め・黄色系見出し）、D5二択プルダウンのランダム順まで実機確認完了。今回変更したD3-1「おどる」のひらがな表示のみ実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `6635c97`）

- 状態：Practice 8.1のD5-7を「日本語の先生／教える」、D3-1を「クラスメート／踊る」へ変更完了。開始時HEAD `900a90f`。
- 変更：
  1. **D5-7を「日本語の先生／教える」へ変更**：キューを `日本語の先生／教える`、モデル文を `日本語の先生は、教えるのが上手です。`／`日本語の先生は、教えるのが得意です。` に変更。
  2. **D3-1を「クラスメート／踊る」へ変更**：`words.dance`（`踊る・おどる・odoru・to dance`）を登録し、キューを `クラスメート／踊る`、モデル文を `クラスメートは、踊るのが上手です。`（または `苦手です。`）に変更。`sentenceFor` が目的語なしの単独動詞キューに対応するよう更新。
- 変更ファイル：practice8.1.js、practice8.1.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・データ検証合格。
- 実機確認状況：D5-7「日本語の先生／教える」およびD3-1「クラスメート／踊る」の実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `900a90f`）

- 状態：Practice 8.1のD4「カバンを持っていく」→「カバンを持つ」への変更、D5 Noticeボックスを右側配置のまま内部テキストのみ左詰め（`margin: 10px 0 4px auto; text-align: left;`）へ修正、およびD5の2択プルダウン選択肢順のランダム化（`comparisonOptionOrder`）を完了。開始時HEAD `803641c`。
- 変更：
  1. **D4のアクション変更**：`words.carry` を `持っていく` から `持つ（もつ・motsu, to hold; to carry）` に変更し、D4選択肢を「カバンを持つ」に変更。
  2. **D5 Noticeの配置修正**：`.p81-nuance-note` ボックス自体は右側配置（`margin: 10px 0 4px auto; width: 50%;`）を維持し、ボックス内の見出し・本文のみ左詰め（`text-align: left;`）に設定。
  3. **D5二択プルダウンの選択肢順ランダム化**：`addSelect` にて各D5行の2択順序を初期化時にランダム化（`comparisonOptionOrder` でセッション中保持）し、常に1行目の1番目が正解にならないように変更。
- 変更ファイル：practice8.1.js、style.css、practice8.1.html、docs/PRACTICE8_SPEC.md、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・データ検証合格。
- 実機確認状況：Ex3/4/5の「のが」位置、Ex4「／好き👉️」右詰め、D4ボタンロック解消、D2「洗濯する」・D5「掃除する」は実機確認完了。今回のD4「カバンを持つ」、D5 Notice右ボックス内左詰め、D5プルダウン選択肢ランダム化は実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `803641c`）

- 状態：Practice 8.1のD2-2を「洗濯／する／きらい」、D5-4を「私／掃除／する」へ変更、D5 Noticeの見出し「✨Notice the difference:」を黄色系（通常`#ca8a04`／ダーク`#fbbf24`）とし、Noticeボックスを左寄せ（幅50%・左揃え）へ変更完了。開始時HEAD `f03abb1`。
- 変更：
  1. **D2-2とD5-4の語彙変更（重複解消）**：D2-2を `部屋／掃除する` から `洗濯／する`（モデル：`洗濯するのがきらいですか。`、許容：`洗濯をするのが…`）に変更し、D5-4を `私／料理／する` から `私／掃除／する`（モデル：`私は、掃除するのが上手です／得意です。`、許容：`掃除をするのが…` および `私は` 省略）へ変更。
  2. **Notice見出しの黄色系カラー化と左寄せ表示**：`.p81-nuance-note-title`（`✨Notice the difference:`）を黄色系（通常`#ca8a04`／ダーク`#fbbf24`）に設定し、`.p81-nuance-note` ボックスおよび内部テキストを左寄せ（`margin: 10px auto 4px 0; text-align: left;`）に変更。
- 変更ファイル：practice8.1.js、style.css、practice8.1.html、docs/PRACTICE8_SPEC.md、tests/practice81.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・データ検証合格。ユーザーの実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `f03abb1`）

- 状態：Practice 8.1のEx4「／好き👉️」（「／すき👉️」）全6行の右詰め完全一致、D5-3の順序変更（1行目：Unnatural→下手、2行目：Natural→苦手）、D5全7問の状況説明（Scenario）とNotice文の重複排除・Speaker視点統一、およびNotice全体の色付き表示（`#7c3aed`／ダーク `#c084fc`）を完了。開始時HEAD `e0dfd1e`。
- 変更：
  1. **Ex4キュー「／好き👉️」全6行の右詰め整列**：`.p81-degree-example .p81-example-cue` に `width: 100%; justify-self: stretch;`、`.p81-degree-cue-tail` に `justify-self: end; text-align: right;` を指定し、全6行の「／好き👉️」（ひらがなモード時「／すき👉️」）の横位置が完全に一致するよう修正。
  2. **D5全7問のSituation（状況説明）とNotice（解説文）の整理・D5-3順序入れ替え**：D5-3を1行目「Unnatural → 下手」・2行目「Natural → 苦手」へ変更し、全7問の番号横状況説明を場面提示のみに簡潔化、NoticeをSpeaker視点で統一。
  3. **D5 Notice全体の色付き化**：`.p81-nuance-note-title`、`.p81-nuance-note-text`、`.p81-nuance-adjective` をすべて通常時 `#7c3aed`・ダーク時 `#c084fc` の色付き太字に統一。
- 変更ファイル：practice8.1.js、style.css、practice8.1.html、docs/PRACTICE8_SPEC.md、tests/practice81.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・ロジック検証合格。ユーザーの実機確認待ち（Dr4ボタンの正常動作は実機確認完了）。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT・コミット `e0dfd1e`）

- 状態：Practice 8.1のDr4全6行ロック不具合（`degreeActions` の `id` による `r.id` 上書きと `views` キー衝突）およびページ全体の停止ボタン非アクティブ保証、D5-2/3/4の「私は」省略許容、D5-1/4「料理する」モデル文（助詞「を」なしモデル・「を」あり許容）、Noticeブロック幅50%への変更を完了。開始時HEAD `869ffbc`。
- 変更：
  1. **Dr4の1〜5番で「きく・とる・停止」がアクティブになっていた根本原因の解消**：`degreeActions` の各要素が `{id: 'washDish', ...}` を持っていたため、`makeRow(id, spec, extra)` 内の `{id, ...spec, ...extra}` で行ID（`degree-0`〜`degree-5`）が `'washDish'` に上書きされ、Dr4の全6行が同一キー `'washDish:unselected'` となって `views` Map上で1〜5行目が6行目に上書き消失していた問題を修正（`degreeActions` のキーを `actionId` に分離し、`makeRow` を `{...spec, ...extra, id}` に変更）。あわせて全停止ボタンに `.stop-record-btn` を付与し、`sync()` で停止ボタンの一括有効化を防止。
  2. **「私」が主語の文（D5-2・D5-3・D5-4）での「私は」省略許容**：`makeRow` の `subjectVariants` で `!r.subject || r.subject === 'i'` の場合に `subject: null` と `subject: 'i'` の双方を許容リスト（`r.refs`）へ登録。
  3. **する動詞（D5-1・D5-4「料理する」）のモデル文変更**：「を」を使わない形（`父は、料理するのが上手です。`／`私は、料理するのが得意です。` 等）をモデル文とし、「を」を使った形（`料理をするのが…`）を許容文に設定。
  4. **D5 Notice幅の変更**：`.p81-nuance-note` の `width` を `60%` から `50%` に変更。
- 変更ファイル：practice8.1.js、style.css、practice8.1.html、docs/PRACTICE8_SPEC.md、tests/practice81.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによる構文・ロジック検証合格。ユーザーの実機確認待ち。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 以前の記録（2026-11-01 / Europe/Vienna / LT）

- 状態：Practice 8.1のEx3・Ex4・Ex5省略表示（「のが…」位置一致と空き領域中央の「〃」配置）、Dr5ペアごとの1行目キュー開始位置と上下Adj選択欄（`／`・`Adj ▼`）の横位置一致、Dr4（およびDr2／Dr5）ボタンロック表示・抑止の修正完了。開始時HEAD `11853fa`（`806b627` から `origin/main` へ fast-forward 同期済み）。
- 変更：
  1. Ex3・Ex4・Ex5のモデル2行目以降をすべて「のが…」を残す形式に統一し、`.p81-model-repeat-spacer` と `.p81-model-repeat-after-spacer` により各Example内で「のが…」の開始横位置を完全に一致させ、「〃」は「のが」の左側の空き領域（省略された1行目の主語〜動詞／動作部分）の中央に配置。
  2. Ex3・Ex4・Ex5のキュー側も同様に、省略された動作／主語〜動詞の中央に「〃」を置き、後続の「／」と評価語・程度表現の開始位置を上下で一致。
  3. Dr5（`#drill5 .p81-comparison-card`）はペアごとに1行目の英語ラベル幅から1行目の日本語キュー開始位置を算出し（2行目の英語ラベルが「〃」の中央配置に干渉しない範囲で最小化）、2行目の「〃」を1行目の繰り返し部分の中央に配置したうえで、`.p81-drill-repeat-after-spacer` により2行目の「／」と `select.p81-select`（`Adj ▼`）を1行目の「／」と `Adj ▼` と完全に同じ横位置へ整列。
  4. Dr4（およびDr2／Dr5）で `tooltip-layout.js` が生成する `.selection-help-wrap` により直下セレクタ `.recording-actions > button:disabled` が外れていた問題を、子孫セレクタ `.recording-actions button:disabled`・`.p81-cue-button-group button:disabled`・`.is-selection-locked`・`.selection-help-wrap:has(> button:disabled)` および `sync()` / `record()` / `render()` のクリック・状態ガードで解消。
- 変更ファイル：practice8.1.js、style.css、practice8.1.html、docs/PRACTICE8_SPEC.md、tests/practice81.cjs、docs/HANDOVER.md。
- 自動検証：`git diff --check` およびPythonによるJS/CSS構文・DOM生成・整合性チェック合格（コンテナ内にNode.js/Chromium不在のためPlaywright実ブラウザテストは未実行）。ユーザーの実機確認・デプロイ確認は未了。
- 保存先：`main` ブランチへコミットし、`origin/main` へ Push。

## 8.1 Ex3・Ex4・Ex5の「のが」整列・空き領域中央「〃」配置、Dr5ペア別開始位置とAdj整列、Dr4ボタンロック修正（2026-11-01 / Europe/Vienna / LT）

- 前環境（Codex）での会話内容が `origin/main`（`11853fa`）に未反映だった原因（Ex3/Ex4モデルの「のが」欠落と右スペーサー不在、Dr5の `.p81-drill-repeat-after-spacer` 不在と計測順序、Dr4の `.selection-help-wrap` ラッパーによる `:disabled` 直下セレクタ不一致および別ブランチ `origin/practice81-lock-guard-20261101` への退避）を特定・報告。
- `practice8.1.js`、`style.css`、`practice8.1.html`、`docs/PRACTICE8_SPEC.md`、`tests/practice81.cjs` を更新し、Ex3/4/5・Dr5・Dr4の全項目を反映。

## 以前の記録（2026-11-01 / Europe/Vienna / Codex）

- 状態：Practice 8.1修正完了、ローカル保存済み。開始時HEAD `af99480`、mainは取得済みorigin/mainと一致。
- 変更：Ex3/Eの〃を省略した目的語〜動詞範囲の中央へ整列し、Example5の／を削除。D4の好き／きらいは非太字、未選択Selectは中央・選択動詞は左揃え。Auto時に停止をロックする現在モード判定を追加。D4未選択時のきく／とるロックとSelect first案内は既存動作を確認。
- 変更ファイル：practice8.1.js、style.css、docs/PRACTICE8_SPEC.md。
- 自動検証：`git diff --check` 合格。自動テスト未実施。実機確認・デプロイ確認は未了。
- 保存先：作業差分はローカルmain。コミット／Pushはこの記録更新後に行う。

## Lesson番号と語彙範囲（2026-10-31）

- 共通ルールをAGENTS.mdとPROJECT_SPEC.mdに、8.1への適用をPRACTICE8_SPEC.mdに記載。ページ番号NではGenki Lesson Nまでの語彙を基本とする。
- 未解決：8.1のD3-2とEx4にLesson 8範囲外の語彙がある。代替案は提示済みで、選択待ち。
- 文書変更のみ。git diff --check確認後、未コミット／未Push。

## 8.1 D3-2の主語・動作変更（2026-10-31 / Europe/Vienna / Codex）

- 留学生の主語重複を避け、D3-2を先輩／山に登る／上手へ変更。先輩はこのページ内の他の問題枠にない主語として選択。
- practice8.1.jsとPRACTICE8_SPEC.mdへ反映。git diff --check 合格。Node.js不在のため構文確認不可、自動テスト未実施。ローカル保存済み、未コミット。実機確認は未了。

## 8.1 D3-3と語彙重複時の提案ルール（2026-10-31 / Europe/Vienna / Codex）

- D3-3を子ども／漢字を覚えるから子ども／カタカナを覚えるへ変更。
- AGENTS.mdとPROJECT_SPEC.mdに、重複を例外記録する前に重複しない自然な代案を検討・提案し、代案不適・学習目的上必須・ユーザー指定の場合のみ例外化する運用を追加。
- D3-2（留学生／手紙／書く）の代案は未選択。候補を提示してユーザー判断を待つ。
- 自動テスト未実施。差分確認後に保存予定。実機確認は未了。

## 8.1 D3-1／D5-5／D5-7の変更（2026-10-31 / Europe/Vienna / Codex）

- D3-1を先生からクラスメートへ変更し、文法を教える項目を維持。
- D5-5を日本語を話すから漢字を書くへ変更。D3-2の「書く」と動詞、D3-3の「漢字」と目的語が重なる点は指定による例外として仕様へ記録。
- D5-7は日本語を話すキューで、上手（能力の直接評価）と得意（本人の自己認識の推測）を比較する説明項目へ変更。選択肢・Notice文・仕様書を同期。
- git diff --check 合格。Node.js不在のため構文確認不可。自動テスト未実施。ローカル保存済み、未コミット。実機確認は未了。

## 8.1 D5 Notice幅と解説文（2026-10-31 / Europe/Vienna / Codex）

- Noticeブロックの幅をページの60％へ変更。得意の説明からstrength or difficultyを外し、早起きの苦手は困難さ、下手は技能語として不自然な点を短く説明する。
- D5-4の得意は、自分の能力を断定評価するより、その行動にcomfortableだと述べる方が自然という説明へ変更。D5-7のキューは日本語を話すに戻した。
- git diff --check 合格。Node.js不在のため構文確認不可。自動テスト未実施。ローカル保存済み、未コミット。実機確認は未了。

## 8.1 D1以降が描画されない原因と修正（2026-10-31 / Europe/Vienna / Codex）

- 原因：D2-3の動詞ID eat に語彙登録がなく、D2行のモデル文生成時に words.eat 参照で例外が発生。描画ループはD1を追加した後に停止していた。
- 修正：食べる／たべる／taberu を登録。D2-3以降とD3〜D5が描画を継続できる。
- practice8.1.js を更新。git diff --check 合格。Node.js不在のため構文確認と自動テスト未実施。未コミット／未Push。

## 8.1 指定キュー間の目的語重複解消（2026-10-31 / Europe/Vienna / Codex）

- D3-4の目的語を車からバイクへ変更。D4-1の車／洗うを維持した。
- 日本語の目的語がD3-1、D5-5、D5-7で重なっていたため、D3-1を先生／文法／教える、D5-7を日本語の先生／質問／答えるへ変更。D5-7のPresumptuous／Harshの対比と初学者が教師を評価する設定は維持。
- practice8.1.jsとPRACTICE8_SPEC.mdを更新し、目的語・動詞一覧も同期。`git diff --check` 合格。Node.js不在のため構文確認不可。自動テスト未実施。ローカル保存済み、未コミット／未Push。実機確認は未了。

## 8.1 キューの語彙分散（2026-10-31 / Europe/Vienna / Codex）

- D1を本／読む・音楽／聞く・自転車／乗るに変更。D2をコーヒー／飲む、部屋／掃除する、朝ご飯／食べる、服／買うの４会話へ変更。
- D3は提案６件から、Ex5のギター／弾く、D5の歌／歌うとの重複を避けて４件（先生／日本語／教える、留学生／手紙／書く、子ども／漢字／覚える、兄弟／車／運転する）を採用。D4を指定６項目へ変更。
- Ex1〜Ex5もDrillとの動詞・目的語重複を避けるため調整。Ex1は映画／作る、Ex2はテレビ／見る、Ex3は友達／写真／撮る、Ex4は花／育てる、Ex5は姉／ギター／弾く。D5-1は父の料理へ変更。Q/A、比較行、副詞の反復は課題構造上の必要な例外。
- 変更対象：practice8.1.js、PRACTICE8_SPEC.md。`git diff --check` 合格。Node.js不在のため構文確認不可。自動テスト未実施。ローカル保存済み、未コミット。公開／実機確認は未了。

