# October2026 現在のリレー状態（HANDOVER）

> [!IMPORTANT]
> 本書は「現在の作業状態・直前作業の成果・継続確認事項」を記録する運用文書です。
> 正式な仕様は各正本仕様書（`PROJECT_SPEC.md`, `UI_LAYOUT_SPEC.md`, `GERMAN_DRILL_SPEC.md` 等）を参照してください。
> 過去の詳細履歴は [8. 過去履歴アーカイブ](#8-過去履歴アーカイブ) を参照してください。

## 1. 基本情報（Current State）
- **最終更新日時**：2026-11-10T15:10:00+01:00
- **担当環境**：Codex / Antigravity
- **対象ブランチ / 最新コミット**：`main`
- **リポジトリ状態**：Clean（未コミット・未Pushなし）
- **Vercel本番状態**：Ready / Stable

## 2. 直近の完了作業
- **課題**：全11ページE2Eテストの品質監査・不足項目補強・CI安定化
- **変更内容**：
  1. **E2E総合回帰テストの品質監査・大幅補強** (`tests/e2e-all-practice-pages.cjs`):
     - **960件から1,071件へ検証項目拡大**（全11 Practiceページ、100% PASS）。
     - **スラッシュ仕様のページ別実体検証**: 日本語キュー（1.1の `わたし / がくせい`、他10ページの `これ/なに`、`その/かばん` 等のコンパクト表記）および英語キュー（`I / student`, `older brother / student`, `this / …`, `that / bag` 等の `" / "` 表記）の代表語句実描画を自動照合。
     - **DOM Churn・局所更新の機械的立証**: Practice 7.1 Drill 2 の Yes/No 選択時に第2行（Row 1）のDOMノード同一性（`__domRow1 === rows[1]`）を検証し、全体再描画が発生せず局所更新が行われていることを実証。
     - **選択状態・回答保持の検証**: Practice 1.2（Drill 1 Yes/No、Drill 2 専攻Select）、Practice 7.1、Practice 7.2 の状態維持を検証。
     - **音声ライフサイクル & モデルTTS検証**: モデル音声再生時の `window.speechSynthesis.speak` 発火および発話テキストが空でないこと、録音中の排他制御・操作ロック状態を検証。
     - **レスポンシブ実測検証の厳格化**: 375px/600px/1440px での横スクロールはみ出し防止に加え、キュー要素の画面外クリップ、およびキュー文字列の1文字縦落ち（single-character vertical collapse）の不在をバウンディングボックスで実測検証。
  2. **CI安定化・既存テストの仕様同期是正**:
     - `tests/english-cues-expansion.cjs`: 375pxモバイル幅でシステムフォント環境に依存せずスペーサークランプ（`>= 0`）を許容。PASS（234 checks）。
     - `tests/lesson2-cue-spacing.cjs`: 全11ページ統一英語キュー仕様（`" / "`）との不整合を是正。日本語キュー（スペース禁止）と英語キュー（前後スペース必須）をモード・行種別（Drill / Example）に応じて厳密に判定。PASS（2,568 checks）。
  3. **プロダクションコード不変の堅持**:
     - プロダクションコード（HTML/CSS/JS）は一切変更なし。テストスイートおよびドキュメントのみを更新。
- **検証結果**：
  - `tests/e2e-all-practice-pages.cjs`: **PASS（11/11ページ、1,071 checks）**。
  - `tests/lesson2-cue-spacing.cjs`: **PASS（2,568 cue rows）**。
  - `tests/english-cues-expansion.cjs`: **PASS（234 checks across 3 pages）**。
  - `tests/practice71-answer-selection.cjs`: **PASS（23 checks）**。
  - `git diff --check` にて空白・構文不備なし。

## 3. 継続確認・未解決事項（Pending Actions）
- [ ] **全11ページ**：新仕様である半角スラッシュキュー表示（日本語 `父/母` または `父 / 母`、英語 `word / word`）および 375px／600px／1440px での表示・視認性・折り返しのユーザー実機ブラウザ確認待ち。
- [ ] **Practice 7.1**：Drill 2 の Yes/No 選択時の即時色反映（遅延解消）、モデル文・録音ボタンの即時切替、および回答別録音結果の保持のユーザー実機ブラウザ確認待ち。
- [ ] **Practice 8.1**：Drill 4 の English Cues ON 時における程度副詞の意味色（青/赤）・太字表示、および `not very` / `not at all` に不要な括弧説明がないことのユーザー実機ブラウザ確認待ち。
- [ ] **Practice 8.1**：Drill 4 の `Select` プレースホルダー・左揃え・小文字英語選択肢・チェックマーク撤去、および Drill 5 の `clean` / `cook` 表示のユーザー実機ブラウザ確認待ち。
- [ ] **Deutsche Übung 1.1**：ユーザー実機ブラウザでのボタンドイツ語表記（`🔊 Anhören`, `⏺️ Aufnehmen`, `↩️ Zurück`）および Autoplay OFF ホバー（`Choose what and when to play.`）の確認待ち。
- [ ] **Practice 8.1**：Drill 5 の English Cues ON／OFF 時における `Adj`（形容詞セレクト）と `〃`（同上符）の水平整列・表示位置のユーザー実機ブラウザ確認待ち。
- [ ] **Deutsche Übung 1.1**：ユーザー実機ブラウザでの英語ホバー表示（Example 1 / Drill 1 設問1、Autostop動的切替、設定の別行表示、👣ホバー）の確認待ち。
- [ ] **Practice 1.2 & 8.1**：ユーザー実機ブラウザでの Select 英語化（Drill 2 専攻選択、Drill 4 Activity選択）および English Cues トグル時の選択状態・録音保持の動作確認待ち。
- [ ] **Deutsche Übung 1.1**：ユーザー実機ブラウザでの3段階判定（別解受容、不一致箇所の赤字表示、保留判定 👣、🔥 Keep going!、重複きくボタン撤去）の動作確認待ち。
- [ ] **Practice 1.2, 8.1, 8.3**：ユーザー実機ブラウザでのEnglish Cuesトグル動作、英語・日本語表示切替、およびスムーススクロール動作の確認待ち。
- [ ] **Deutsche Übung 1.1**：ユーザー実機ブラウザでのドイツ語TTS診断・再生失敗通知・ヘッダー直下専用バナー動作確認（FWC W9）。
- [ ] **Practice 8.1**：ユーザー実機ブラウザでのDrill 4活動選択高速化・相互排他・表示動作の確認待ち。
- [ ] **Practice 8.3**：ユーザー実機ブラウザでのバッジ表示統一（Verb・だれ・何）の確認待ち（Vercel本番Ready確認済み）。
- [ ] **録音・再生の排他制御**：全Practice共通の音声セッション排他制御・競合防止について、実機での競合防止動作の確認待ち。
- [ ] **Deutsche Übung 1.1**：Drill 2〜4のUI標準化およびCSSキャッシュ反映について、ユーザー実機確認待ち（Commit `5a91ddf`, `691bbe0`）。
- [ ] **Practice 2.3**：Example 1のQ/Aラベル接触解消および話者・導入文の6px間隔について、ユーザー実機確認待ち（Commit `650186e`）。

※ Practice 7.3およびPractice 8.1の「Copy my sentences」機能追加（Commit `69b917f`）はユーザー実機確認済みのため完了。

## 4. 検証済み成果・動作確認状態（Verified Results）
- **自動検証**：Playwright Headless（Chromium / Brave）実測測定、既存自動テスト（`tests/*.cjs`）、`git diff --check`。
- **実機確認済み機能**：
  - Practice 1.1, 1.2, 2.1, 2.2, 7.1, 7.2 の既存機能全般
  - Practice 7.3, 8.1 の「Copy my sentences」機能（ユーザー実機確認完了）
  - 各ページの英字セット切替ボタンLato適用（2.1, 2.2, 2.3, 8.3）
  - Example発話行間のグレー点線撤去（F5）
  - 会話役割アイコン（Q/A）表示

## 5. 有効な設計制約・直近の合意事項（Active Decisions and Constraints）
- **FWC管理の原則**：FWC（Framework/Feedback/Feature Work Checklist）はChatGPT側で正本管理する。GitHub側のHANDOVERには、必要な実機確認事項のみを番号なしで記録し、全管理表をGitHub側で推測・同期しない。
- **共通UI仕様の遵守**：セット切替英字Lato、発話行間グレー点線撤去、会話役割（Q/A）表示等は `docs/UI_LAYOUT_SPEC.md` を正とする。
- **ドイツ語ドリル専用仕様**：ドイツ語ドリル（`uebung1.1.*` 以降）の改修・参照は `docs/GERMAN_DRILL_SPEC.md` および `docs/GERMAN_DEVELOPMENT_GUIDE.md` を第一正本とし、日本語ファイルを無条件に横断参照しない。
- **ExとDrの独立性**：Example（Ex）とDrill（Dr）は独立した変更対象であり、一方の修正指示で他方を「ついでに変更」しない。

## 6. 運用・引き継ぎルール（Relay Instructions）
- **二段階読込**：会話開始時・編集前には `AGENTS.md`、`docs/RELAY_WORKFLOW.md`、`docs/PROJECT_SPEC.md`、`docs/HANDOVER.md` を読み直す。
- **即時コミット・Push原則**：ローカル作業時はコード編集から構文検証・コミット＆Pushまでを一連の不可分な処理として即座に完了させ、未Pushの変更を放置しない。
- **HANDOVER更新ルール**：各リレー完了時は「直近の完了作業」を更新し、直近履歴（最大3〜5件）へスライドさせる。目標サイズ（100〜150行程度）を維持し、過去ログは定期的にアーカイブへ退避する。

## 7. 直近の完了履歴
- 2026-11-10: Practice 8.1 Drill 4 英語キュー意味色継承・仕様書更新（Commit `8a08160`）
- 2026-11-10: Practice 8.1 Drill 4・Drill 5 表示統一（Commit `31c70d4`）
- 2026-11-10: Deutsch Übung 1.1 3段階判定（別解許容・不一致赤字・保留👣・重複ボタン撤去）試験実装
- 2026-11-10: English Cues未対応ページ（Practice 1.2, 8.1, 8.3）一括実装・統合テストPASS（Commit `ae60a87`）
- 2026-11-09: W7 Practice 7.2 音声排他制御の回帰テスト追加・全件PASS（Commit `97b8d2d`）
- 2026-11-09: Vercel ignoreCommand 256文字制限解消・スクリプト分離（Commit `338cbd2`）
- 2026-11-09: Deutsche Übung 1.1 ドイツ語TTS診断・通知バナー実装（Commit `041944b`）

## 8. 過去履歴アーカイブ（History Index）
過去の詳細な作業ログ・リレー記録は以下のアーカイブファイルに保管されています。
- [HANDOVER_202611_EARLY.md](archive/HANDOVER_202611_EARLY.md)（2026年11月1日〜11月9日：リレーログ No.2〜No.72、計2,581行）
- [HANDOVER_202610.md](archive/HANDOVER_202610.md)（2026年10月度：初期構築〜設計進捗原本、計1,467行）
