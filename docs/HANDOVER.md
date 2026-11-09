# October2026 現在のリレー状態（HANDOVER）

> [!IMPORTANT]
> 本書は「現在の作業状態・直前作業の成果・継続確認事項」を記録する運用文書です。
> 正式な仕様は各正本仕様書（`PROJECT_SPEC.md`, `UI_LAYOUT_SPEC.md`, `GERMAN_DRILL_SPEC.md` 等）を参照してください。
> 過去の詳細履歴は [8. 過去履歴アーカイブ](#8-過去履歴アーカイブ) を参照してください。

## 1. 基本情報（Current State）
- **最終更新日時**：2026-11-09T18:15:00+01:00
- **担当環境**：Codex / Antigravity
- **対象ブランチ / 最新コミット**：`main`
- **リポジトリ状態**：Clean（未コミット・未Pushなし）
- **Vercel本番状態**：Ready / Stable

## 2. 直近の完了作業
- **課題**：C3-FAIL 第1弾：確定仕様に基づく6テストの更新・CI完走確認
- **変更内容**：
  1. `tests/speaker-guide.cjs`: Practice 2.3 Example 1の通話案内表示を現行の `X ↔ Y` および `.p23-phone-icon`、`conversation-person` バッジ構造に準拠した検証に更新（CI: 3s PASS）。
  2. `tests/shared-conversation-display.cjs`: 同じ通話案内の旧英文期待値を現行の `X ↔ Y`、電話アイコンおよび話者バッジの保持検証に更新（CI: 29s PASS）。
  3. `tests/practice21.cjs`: Drill 3質問の人物呼称期待値を、確定仕様（人物X/Y/Z統一ルール）に基づく `わいさんの`/`えっくすさんの` に更新（旧 `'あなたの'` からの乖離解消、CI: 77s PASS）。
  4. `tests/practice23-cities.cjs`: Q/A役割アイコン（`.conversation-role-circle`）導入後の話者ラベル textContent（`['X','X','Y','','X','Y','']`）、役割アイコンの aria-label（Question/Answer）検証、および共有キュー幅の検証を現行仕様に整合（CI: 56s PASS）。
  5. `tests/practice22-umbrellas.cjs`: 確定仕様（「どの／どれ」質問時に正答品物を囲まず、返答時のみハイライト）に基づき、質問行クリック時はターゲット非囲み（`count() === 0`）、返答行クリック時は正答傘をハイライト、再生終了時は解除されることを検証（CI: 14s PASS）。
  6. `tests/practice83-speech-style.cjs`: `speechSynthesis` モックに `current: null` および `pause(){}, resume(){}` を補完。スタイル切替前に能動的にモデル音声を再生し、スタイル切替による即時再生中断（`current === null`）および遅延コールバックによる不要な再生復帰の抑止を検証（CI: 32s PASS）。
  7. 本体HTML/CSS/JSおよび共有モジュールには一切変更を加えず、テストファイル6件のみを限定修正。対象6テスト全件がGitHub Actions CI（Run `42668859670`）にてPASSすることを確認完了。

## 3. 継続確認・未解決事項（Pending Actions）
- [ ] **Deutsche Übung 1.1**：ユーザー実機ブラウザでのドイツ語TTS診断・再生失敗通知・ヘッダー直下専用バナー動作確認（FWC W9）。
- [ ] **Practice 8.1**：ユーザー実機ブラウザでのDrill 4活動選択高速化・相互排他・表示動作の確認待ち。
- [ ] **Practice 8.3**：ユーザー実機ブラウザでのバッジ表示統一（Verb・だれ・何）の確認待ち（Vercel本番Ready確認済み）。
- [ ] **録音・再生の排他制御**：全Practice共通の音声セッション排他制御・競合防止について、実機での競合防止動作の確認待ち。
- [ ] **Deutsche Übung 1.1**：Drill 2〜4のUI標準化およびCSSキャッシュ反映について、ユーザー実機確認待ち（Commit `5a91ddf`, `691bbe0`）。
- [ ] **Practice 2.3**：Example 1のQ/Aラベル接触解消および話者・導入文の6px間隔について、ユーザー実機確認待ち（Commit `650186e`）。

※ Practice 7.3およびPractice 8.1の「Copy my sentences」機能追加（Commit `69b917f`）はユーザー実機確認済みのため完了。

## 4. 検証済み成果・動作確認状態（Verified Results）
- **自動検証**：
  - Playwright Headless（Chromium）CIテスト（`tests/*.cjs`）：対象6テスト全件PASS（Run `42668859670`）
    - `tests/speaker-guide.cjs` (3s PASS)
    - `tests/shared-conversation-display.cjs` (29s PASS)
    - `tests/practice21.cjs` (77s PASS)
    - `tests/practice23-cities.cjs` (56s PASS)
    - `tests/practice22-umbrellas.cjs` (14s PASS)
    - `tests/practice83-speech-style.cjs` (32s PASS)
  - `git diff --check`（構文・差分整合確認済み）
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
- 2026-11-09: C3 Phase 1: 確定仕様に基づく6テスト更新・CI全件PASS確認（Commit `c77a2ca`）
- 2026-11-09: W7: Practice 7.2 音声排他制御の回帰テスト追加（Commit `97b8d2d`, `959100a`）
- 2026-11-09: Vercel ignoreCommand 256文字制限解消・スクリプト分離（Commit `338cbd2`）
- 2026-11-09: Deutsche Übung 1.1 ドイツ語TTS診断・通知バナー実装（Commit `041944b`）
- 2026-11-09: Practice 8.1 Drill 4活動選択の根本的高速化（Commit `8955bcf`）
- 2026-11-09: 不要プレビュー15件削除およびテスト・クレジット整合（Commit `5d233a1`）
- 2026-11-09: HANDOVER軽量化・過去ログアーカイブ分割（Commit `a45f304`）

## 8. 過去履歴アーカイブ（History Index）
過去の詳細な作業ログ・リレー記録は以下のアーカイブファイルに保管されています。
- [HANDOVER_202611_EARLY.md](archive/HANDOVER_202611_EARLY.md)（2026年11月1日〜11月9日：リレーログ No.2〜No.72、計2,581行）
- [HANDOVER_202610.md](archive/HANDOVER_202610.md)（2026年10月度：初期構築〜設計進捗原本、計1,467行）
