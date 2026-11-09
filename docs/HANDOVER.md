# October2026 現在のリレー状態（HANDOVER）

> [!IMPORTANT]
> 本書は「現在の作業状態・直前作業の成果・継続確認事項」を記録する運用文書です。
> 正式な仕様は各正本仕様書（`PROJECT_SPEC.md`, `UI_LAYOUT_SPEC.md`, `GERMAN_DRILL_SPEC.md` 等）を参照してください。
> 過去の詳細履歴は [8. 過去履歴アーカイブ](#8-過去履歴アーカイブ) を参照してください。

## 1. 基本情報（Current State）
- **最終更新日時**：2026-11-09T08:50:00+01:00
- **担当環境**：Codex / Antigravity
- **対象ブランチ / 最新コミット**：`main`（Commit `f8b694a9bae9c7415376c4b2c3adec60eac25bc2`）
- **リポジトリ状態**：Clean（未コミット・未Pushなし）
- **Vercel本番状態**：Ready（ユーザーがDashboardで確認済み）

## 2. 直近の完了作業
- **課題**：Practice 8.3「Verb」「だれ」「何」バッジ表示統一（再修正）
- **対応コミット**：`f8b694a`（HEAD）
- **変更内容**：`style.css` の `.p83-header-badge` および `.p83-example-category` を共通スタイルに統一（font-size: .9em, font-weight: 700, line-height: 1.2, padding: 6px 10px, border 1px solid, border-radius: 8px、ダーク文字 `#ffffff`、背景 `#304663`、枠 `#7998c3`）。`practice8.3.html` のCSSキャッシュバスターを `20261109-p83-badge-unify` へ更新。
- **仕様反映**：`docs/UI_LAYOUT_SPEC.md` にPractice 8.3バッジ表示統一仕様を追記。
- **検証結果**：構文チェックPASS、Playwright Headlessブラウザ（Chromium / Brave）による実測測定PASS（計算値が完全一致）。

## 3. 継続確認・未解決事項（Pending Actions）
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
- 2026-11-09: Practice 7.3・8.1「Copy my sentences」機能追加（Commit `69b917f` / 実機確認完了）
- 2026-11-09: Deutsche Übung 1.1 CSSキャッシュバスター更新（Commit `5a91ddf`）
- 2026-11-08: Practice 2.3 Example 1 Q/Aラベル接触解消・min-width契約適用（Commit `650186e`）

## 8. 過去履歴アーカイブ（History Index）
過去の詳細な作業ログ・リレー記録は以下のアーカイブファイルに保管されています。
- [HANDOVER_202611_EARLY.md](archive/HANDOVER_202611_EARLY.md)（2026年11月1日〜11月9日：リレーログ No.2〜No.72、計2,581行）
- [HANDOVER_202610.md](archive/HANDOVER_202610.md)（2026年10月度：初期構築〜設計進捗原本、計1,467行）
