# October2026 現在のリレー状態（HANDOVER）

## Practice 2.1 Checkmark Filled太さ・左配置Preview（2026-11-11）

- `preview/p21-checkmark-filled-stroke-20261111`、基準は3状態表示の最新実装 `30bb0a59191bfc687b372d79b952760883c4588c`。仕様登録のみのe9c6fe2を実装基準には使用しない。
- 正式Filled path・24×24 viewBoxを維持し、同色stroke 1.5（round join）を追加。外寸22px・緑の両テーマ色は維持。対応テキストの左、4px、縦中央、縮小なし。長文は既存領域内で折り返す。
- Fire・Footprints・判定／許容解答・録音／再生／停止・Q/A・目なしSmile/Frown・疑問文マーク・コピー・他ページは変更しない。正本はUI_LAYOUT_SPECの正解アイコン節。
- 自動検証：太さ・左配置・原本path比較・viewBox内の外形／22pxラスタ外周切れ201件、3状態／旧データ／認識エラー保持405件、Keep going!574件、Practice 2.1 Q/A7,495件、疑問文マーク121件成功・今回実行テストの失敗0。375/600/1440px×Light/Dark、短文・長文・改行しにくい文字列を確認。実測間隔4px・中心差0px。録音・モデル再生・停止・録音再生はモックで検証、実機マイクは未確認。
- 既知のaudio-relay停止タイムアウト問題は前工程で基準にも再現済み。今回は音声処理を変更せず、同テスト全体は再実行していない。Smile/Frown・他ページの実装／読み込み先は差分なし。
- 独立Previewでユーザー実機承認待ち。main・Production・PR #8/#9・元Preview・Practice 8.2の未コミット変更は維持する。

## Practice 2.1 判定表示A案Preview（2026-11-11）

- `preview/p21-feedback-status-a-20261111`、基準 `e9c6fe2d8a95467ba250ddbdf6c0fe23ad683f85`。正本はUI_LAYOUT_SPEC「Practice 2.1：A案」。
- 正誤照合とisCorrectは維持し、accepted/mismatchを付加。旧データ互換。緑Checkmark Filled 22pxを接続し、明示保留には紫Footprints 22pxとHover／キーボード説明を表示する。
- 客観的なUndetermined生成経路は現行に存在しないため追加しない。短文・部分一致等は既存Mismatchを維持。認識エラー・音声のみ保存を保留にしない。保留テストは表示fixtureのみ。
- 自動検証：状態・旧データ比較／認識エラー・音声のみ保持405件、Keep going!574件、Practice 2.1 Q/A7,495件、目なしSmile/Frown・Q/A共存8,024件、疑問文マーク121件成功。375/600/1440px・Light/Dark、Hover／実際のTab操作、Set・Script再描画を検証。実機マイク未検証。
- `audio-relay.cjs`（対象Practice 2.1）は`stop timeout never starts microphone`で失敗。基準e9c6fe2でも同じ条件・同じ失敗を再現した既存問題として分離し、音声処理は修正しない。Keep going!テスト内のモデル再生・録音・停止・録音再生は成功。
- 実装対象はPractice 2.1のみ。他ページ・Deutsch・Q/A・Smile/Frown・疑問文マーク・Keep going!本体は変更しない。次工程は独立Previewの実機確認。全ページ展開・main／Production統合は未承認。

## 判定結果アイコン：デザイン承認・仕様登録（2026-11-11）

- 正本：UI_LAYOUT_SPEC「判定結果アイコン共通仕様 — Feedback Status Icons」。ユーザー提出仕様を登録。動作接続は未承認。
- 正解：Fluent `Checkmark 24 Filled`（丸囲みなし）、22px、Light `#16A34A`／Dark `#4ADE80`。静的比較で使用したCheckmark Circle Regularは不採用。
- 保留：Lucide `Footprints`（ISC・例外採用）、22px、Light `#8064B0`／Dark `#B9A2E5`。説明`Could not be evaluated reliably.`はHover・キーボード双方に対応する。
- Fire＋Keep going!、Q/A、目なしSmile/Frown、疑問文マークは変更しない。今回の変更は仕様書2件だけで、静的比較ページも実ページも変更しない。
- 未決定：Practice 2.1の保留状態の生成・保存条件。認識失敗、結果なし、unrecognized/audioOnly、通信エラー、録音キャンセルを保留へ自動分類しない。
- 次工程：保留条件を調査・設計しユーザー承認を受ける。その後Practice 2.1動作実装・実機承認、全ページ監査と統合Preview承認へ進む。今回の登録だけで実装・main／Production反映を開始しない。

## Practice 2.1 判定SVG静的比較Preview（2026-11-11）

- `preview/p21-feedback-svg-comparison-20261111`、基準 `c995832f…`。当時の候補記録はUI_LAYOUT_SPEC「判定SVG静的比較」を参照。現在の正式仕様は同書冒頭「判定結果アイコン共通仕様」を優先。
- 比較ページのみ。Practice本体、判定、録音、コピー、他ページは変更しない。デザインは下記承認記録により確定したが、判定条件と動作接続は未承認。
- 自動検証：静的比較606件、Keep going! 574件、目なしSmile/Frown・Q/A共存8,024件、疑問文マーク121件成功・失敗0。375/600/1440px・Light/Darkの比較スクリーンショット取得済み。音声は既存テストのモックであり実機マイク未確認。
- 次工程：デザイン承認後、保留状態の保存・生成条件を別途確定する。Practice 2.1の実保存経路は主にisCorrectで、表示ガードにあるundetermined/unrecognized/audioOnlyの存在だけでは保留生成条件は確定できない。既存の不正解を保留へ変更しない。

## Smile/Frown承認済み外観の復元Preview（2026-11-11）

- `preview/restore-eyeless-smile-frown-20261111`、基準統合 `709de6eec2a2f596324f795966ed938738e9301a`。
- 原因は `b9b033da85a617833eb44642030d92936ed2b763` のAnswerIcons置換。目なし承認部品 `f8b06d8f…` を正確に復元。正式外観はUI_LAYOUT_SPECのY/N節。
- Q/A役割ルール、疑問文マーク、Keep going!、音声・判定処理は変更しない。独立Previewのユーザー確認待ち。
- 自動検証：目なしSVG・色・位置のBefore/After比較8,024件、Q/Aルール28,856件、Keep going! 574件、疑問文マーク121件成功・失敗0。375/600/1440px・Light/Dark、選択・全Set・再描画を確認。音声はモックであり実機マイク未検証。

## Q/A確定仕様＋Keep going! 最終統合Preview（2026-11-11）

- 専用ブランチ `preview/qa-keep-going-final-20261111`。基準Q/A `0fdc881c2d80d54778861c5a741313238d389191` にKeep going!承認Commit `644fff834355c9716cf258aa25cef9fd259131c7` の表示差分だけを適用。旧統合ブランチはマージしていない。
- 正本はUI_LAYOUT_SPECのQ/A表示条件とKeep going!節。main・PR #8/#9・元ブランチ・Productionは変更しない。最終統合Previewのユーザー承認待ち。
- 統合後の検証：Keep going! 574件、Q/A表示条件28,856件、既存Q/Aアイコン96,690件、疑問文マーク121件成功・失敗0。375/600/1440px・Light/Dark、全Set・選択・再描画・Script/English Cuesを確認。音声はAPIモックであり実機マイク未検証。
- 既知の1.2音声モック失敗、8.2 Tooltip幅、1.1 CI不安定性は修正していない。

## Q/A表示条件統一Preview（2026-11-11）

- `preview/qa-role-rules-allpages-20261111`、基準PR #9 `01e5e49d5a006a7b29602791fa8e606f121dd706`。正式条件はUI_LAYOUT_SPEC「Q/A表示条件の正本」を参照。
- 全11Practiceを監査し、Q/A補完、Smile/Frown回答のA省略、8.3のQ→Q→なしを実施・検証する。main・PR #8/#9・Keep going!・Productionは変更しない。ユーザー実機承認待ち。
- 自動検証：`qa-role-policy.cjs` 28,856件、`qa-icons.cjs` 96,690件、`question-indicator.cjs` 121件PASS。375/600/1440px・Light/Dark、選択・全Set・再描画・Script/English Cuesも全6表示条件で確認。
- `audio-relay.cjs` の対象1.2/7.1/7.2/7.3では `practice1.2 stop timeout never starts microphone` が失敗。基準PR #9でも同一コマンド・同一失敗を確認。音声処理は変更せず、別件として保持。実機マイク未検証。

## Filled Q/A・停止横疑問符 全対象Preview（2026-11-11）

- 専用ブランチ `preview/qa-filled-common-allpages-20261111`。起点：Practice 2.2承認Preview `5e7f88f4a93179ab729f9f60b502a9f7383b4460`。パス出典：比較コミット `b7a21d70f0bf3758f97f6a3422a882be556cc5ee`。
- 対象Practice全ページのQ/AとCompositionの疑問符に、共通Fluent Filledヘルパーを適用。Light `#71839A`／Dark `#D9DDE3`、疑問符はChat Help Filled 16px。Regularの輪郭は付けない。
- Practice 8.2のQuestionIndicator attach順序も、再描画でアイコンが外れる問題を直すためPreview内で最小変更。録音・停止・判定条件は不変。
- main／PR #8／Production、Practice 8.2の独立作業領域は変更しない。全対象Previewの検証・ユーザー確認待ち。

## Practice 2.1 Keep going! 限定Preview（2026-11-11、Codex Cloud）

- 独立ブランチ：`preview/p21-keep-going-approved-e-20261111`。基準実装：`preview/keep-going-practice21-20261111`。起点main：`74817eb3e5dc3ff30ad6769df673450354910d29`。
- 対象はPractice 2.1のみ。承認済みFluent Fire 24 Regularと短文 `Keep going!` をLight `#B47732`／Dark `#E4AD69`で、抽出テキストと同じ右寄せ領域へ配置する。詳細はUI_LAYOUT_SPEC冒頭を参照。
- 既存のPR #8・Practice 8.2の未コミット修正は取り込まない。main／Productionへの反映・全ページ展開・既存PRのマージは行わない。
- 検証結果は終了報告とGit履歴を参照。元のKeep going!表示はユーザー実機承認済み。今回の最終統合Previewは確認待ち。別途承認まで全ページ展開しない。

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
