# October2026 — 現在の引き継ぎ状態（HANDOVER）

> 本書は現在の作業状態・未完了事項・次の一手を示すスナップショット。仕様本文や作業日誌を複製しない。更新ルールは `docs/RELAY_WORKFLOW.md` §8.5 を正本とする。

## 1. 現在の作業目的

- **主題**：October2026のProject Instructions、AI作業指針、GitHub内仕様書の刷新と整合性監査。
- **今回の範囲**：文書・指針の確認と改定。教材コンテンツ拡張、機能実装、コード／CSS整理、テストコード修正は依頼範囲に含めない。
- **現在段階**：第5段階「残存文書の整合性監査」。
- **確認基準**：GitHub `main`。この引き継ぎ更新直前のHEADは `87e2ae9a5bf96ead9c3ff042e0d1202e0323bdda`。

## 2. 全体ロードマップ

| 段階 | 内容 | 状態 |
|---|---|---|
| 1 | Project Instructionsの刷新・登録 | ユーザー確認により登録完了 |
| 2 | `AGENTS.md`／`RELAY_WORKFLOW.md` の作業・運用指針刷新 | 主要改定済み。HANDOVER更新規則を§8.5で明確化 |
| 3 | FWC管理方式・`docs/FWC.md` の廃止と現行参照整理 | 完了 |
| 4 | 共通機能・UI仕様の刷新（判定2状態化、録音／STT／再生、表示規則等） | 今回の合意範囲は登録完了 |
| 5 | 現行文書・テスト説明の旧記述、矛盾、重複、参照関係の監査 | 進行中 |
| 6 | InstructionsとGitHub文書の最終整合性確認・引き継ぎ | 未着手 |

## 3. 第4段階で確定した主な事項

- 現行の判定状態はAccepted／Mismatchの2種類。Undetermined／Footprintsは現行機能・現行仕様として扱わない。ドイツ語ドリルにも適用する。
- 録音停止条件、空のSTT結果と発話前タイムアウトの区別、音声URLとSTT結果の独立保持、再生中の表示と操作状態を共通仕様に整理した。
- 通常の録音・STT結果メッセージは基準文字サイズの130%、`… Not yet`は通常メッセージの75%。`Keep going!`は130%統一の対象外とし、現行表示サイズを維持する。
- Keep going! の文字サイズについてコード・CSSを変更しない。現状表示の修正・全ページ再測定・テスト追加は行わない。

## 4. 第5段階：残っている作業

1. **`tests/README.md` の説明整合：完了**。判定レンダリング契約をAccepted／Mismatchに整理し、Practice 2.1のUndeterminedは旧fixtureの互換確認であり現行機能ではないと明記した。テストコードは変更していない。
2. **現行Markdownの残存記述監査：進行中**。`PRACTICE_FEEDBACK_AUDIT_20261112.md` に歴史資料の注意書きを追加。`UI_LAYOUT_SPEC.md` のスマートフォン対応保留、電話アイコン未採用案、旧W項目表現を整理した。その他の仕様・監査文書は引き続き確認する。
3. **参照・承認状態の整合：未着手**。正本へのリンク、重複記載、承認済み／提案／Preview限定の区別を確認する。
4. **仕様と実装の残存差分：今回のコード変更対象外**。詳細は§5。文書だけで実装まで廃止されたと誤認しない。

## 5. 既知の実装差分（今回の文書作業対象外）

- 現行仕様はAccepted／Mismatchの2状態だが、`uebung1.1.js`は空発話・短い断片を`undetermined`と返す旧判定経路を保持し、`tests/uebung11.cjs`も旧3状態の期待値を含む。
- Practice 2.1側も`feedback-status-icons.js`／`.css`と`practice2.1.js`に旧Undetermined表示・保存データ互換のコードが残る。`tests/practice21-feedback-status.cjs`には明示fixtureの確認がある。
- この作業ではコード・CSS・テスト期待値を変更しない。`tests/README.md`には旧期待値が現行仕様の適合証明にならない旨を記載した。実装是正は別途の明示指示がある場合に扱う。

## 6. 旧HANDOVER記録の扱い

- 改定前の162行のHANDOVERは `docs/archive/HANDOVER_20261115_PRE_REFRESH.md` に保存した。
- アーカイブ内のPending Actions、Preview承認待ち、担当環境、ブランチ状態は旧スナップショットの記録であり、現行タスクとして自動継承しない。
- 旧Pendingを再開する必要がある場合は、Think側の管理情報、ユーザーの最新判断、GitHub上の現在状態と照合してから現行HANDOVERへ戻す。状態未確認の項目を完了・未完了と推測しない。

## 7. 正本・作業ルール

- Project／共通機能仕様：`docs/PROJECT_SPEC.md`
- 共通UI・表示仕様：`docs/UI_LAYOUT_SPEC.md`
- AI作業ルールの入口：`AGENTS.md`
- 運用・文書管理・HANDOVER更新規則：`docs/RELAY_WORKFLOW.md` §8.5
- テストの説明：`tests/README.md`。具体的な検証内容は各テストコードを正本とする。

## 8. 直近の文書変更

- `docs/RELAY_WORKFLOW.md`：HANDOVERの更新タイミング、更新方法、整理基準、再確認手順を明文化（Commit `5e41726`）。
- `docs/archive/HANDOVER_20261115_PRE_REFRESH.md`：旧HANDOVERを履歴スナップショットとして保存（Commit `00ab90d`）。
- `docs/HANDOVER.md`：本書へ再構成し、現在のロードマップと次作業を反映（Commit `707a360`）。
- `tests/README.md`：旧Footprints／Undeterminedのテスト説明を現行機能とfixtureに分離（Commit `32b5735`）。
- `docs/PRACTICE_FEEDBACK_AUDIT_20261112.md`：旧監査資料として明示（Commit `88b4584`）。
- `docs/UI_LAYOUT_SPEC.md`：サポート範囲と古い提案記録を現行状態に整合（Commit `275306d`）。
- `tests/README.md`：Deutsche Übungテストに残る旧3状態の期待値を注意書きで区別（Commit `87e2ae9`）。