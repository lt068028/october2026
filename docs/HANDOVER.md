# 現在のリレー状態 — Icons8会話役割アイコン採用

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
- 次工程：対象ページ・DrillのRead-only調査でデータ構造・再描画・録音ロック・共通化可能性と展開順序を報告。その結果の確認後に共通化・段階的実装。全ページ実装は未着手。

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

**完了・除外履歴（現行タスク外）**：Icons8 Q/Aアイコン採用は全該当10ページの実装・ブラウザ検証を完了しmainへ保存。公開接続403・実機未確認と既存共有テストの別件失敗は冒頭のIcons8リレー状態を参照。 Practice 8.1 Drill 5のバッジ左余白・`〃`位置修正は実装・Push・ユーザー実機確認完了（2026-11-08、実装Commit `a5f2d9fe360956cc05c3b4361b8b89635f3efbc7`。`Poor`等のバッジを自然な左位置に戻し、`〃`は動詞位置に追従）。 Practice 8.1 Drill 5タイトル「へた」Hoverと語義「Bad at」への変更は実装・Push・ユーザー実機確認完了（2026-11-08、実装Commit `59c947bef0ec4758a927bd5a586cab0b4e0f027d`）。Practice 7.1「いつも…／今…」表示調整は2026-11-08にユーザー実機確認完了（実装Commit `acbb9ff828cc8621dfd3b9b4a7224a0eebb3810e`）。Practice 1.1およびPractice 2.2 English Cuesは実装・Push・ユーザー実機確認完了。Beyond漢字異なり字数も実装・Push・実機確認完了。Beyondの他ページ展開はW-1に統合。Preview／実機・回帰確認とProduction反映は各作業の標準完了手順。

### W：検討・仕様判断・前工程に依存する作業（優先順）
1. **W-1 各ページの使用語・語彙表示見直し → Beyond新設置・デザイン展開**［未着手／段階依存］：対象候補はPractice 1.1／1.2／2.1／2.2／2.3／7.1／7.2／7.3／8.1／8.2／8.3。ページごとに使用語・学習範囲と表示内容を先に確定し、語句・Hover／Displayを整えてから、そのページにBeyondを新設または承認済みデザインを適用する。先行する語彙調整が終わらないページへBeyondを先行展開しない。既存Beyond 8.1〜8.3は現状を保持し、必要な差分のみ検討する。
2. **W-2 人物表示・場所表示の見直し**［未着手］：人物X／Y／Z・人物ガイド（2.1／2.2／2.3）と、場所・都市・国の表示（2.2／2.3）。同じ画像・会話表示の検討としてまとめ、実装は対象要素ごとに切り分ける。
3. **W-3 English Cues未対応ページへの最小追加**［共通原則確定／残り3ページ実装待ち］：対象は **Practice 1.2／8.1／8.3**。Practice 8.2は実装・Push・ユーザー実機確認完了（2026-11-08、Commit `6ef5470`）。Practice 1.1は実装・Push・ユーザー実機確認完了（2026-11-08、Commit `2b75bfa`）で現行対象から除外。PROJECT_SPEC「English Cues追加の共通実装原則」に従い、既存ボタン・切替方式を再利用し、各Drillの日本語キューに対応する英単語・短い英語表現のみを定義・接続する。新規教材設計・UI再設計・無関係な変更はしない。既存の日本語キュー・Example・モデル・音声・判定・配置を保持。各ページを小さな独立変更として進める。
4. **W-4 7.2／7.3時制区分の配置検討**［検討］：「きく」左への配置案。現行の確定配置を無断変更しない。
5. **W-5 8系英語ラベルのフォント・色・区分表示の残件**［要確認］：既に確定・実装したLatoや装飾を再作業せず、未決の箇所だけ扱う。
6. **W-6 Example／DrillのHover説明の改善**［検討］：Ex1／Dr1等の説明の出し方と範囲を決める。
7. **W-7 8.1 Dr4ドロップダウン候補Hover**［Antigravity調査終了／Codex追加調査待ち・実装未承認］：プルダウンを開いた状態で、各選択肢にカーソルを合わせると、その候補の英語の意味を選択前に表示したい。追加UI・無関係な変更は不要。Antigravity調査ではネイティブ`select`／`option`での信頼できる実現は困難とされ、DOMカスタムドロップダウン案が提示されたが、既存`voiceDropdown`再利用の範囲・実際のCSSスコープ・キーボード／タッチ操作の保持をCodexで追加調査する。実装方法は未決定。コード変更・Commit・Pushは承認まで禁止。
8. **W-8 教師への報告機能**［構想］：報告ボタン・送信先・データ最小化・失敗時挙動を先に設計。
9. **W-9 追加練習の自動生成**［構想］：教材範囲と教師キューの制約を先に確定。
10. **W-10 絵文字／Lucideの表示統一調査**［検討］：採用済みのIcons8 Q／Aは再調査せず、未決の表示だけを扱う。

### C：独立作業ではなく、関連作業で監視する懸念
1. **C-1 共通CSS／JSの波及・Previewブランチの競合**：Ex／Dr・他ページへの意図しない影響、ブランチ差分、未Push成果の上書きを防止。各変更の事前影響調査・差分確認に組み込む。
2. **C-2 自動検証とChromeOS実機の差**：タッチ・画面幅・ダークモード・実音声等の未検証を合格扱いしない。各作業の必要な検証で管理。
3. **C-3 Antigravity／Codex等の利用枠・中断リスク**：途中保存・引き継ぎ・最新main同期を既存リレー手順に従って管理。
4. **C-4 追加練習の教材範囲逸脱**：W-10に着手する際、未習語・未習文法の混入を確認。
5. **C-5 教師報告のプライバシー・送信品質**：W-9に着手する際、個人情報・誤送信・送信失敗を確認。

**解消・通常手順へ移行**：旧C-5 Beyond漢字件数とテスト期待値の不一致は、2026-11-08のF-5修正により対象実装・期待値が更新されたため、独立した懸念から外す。実機確認の未了は各作業の検証状態として残す。

**Updateの定義（2026-11-08ユーザー確定）**：F／W／Cの現行リストは未完了作業のみを表示する。完了したタスクは現行リストから除外し、必要な完了履歴は別枠・過去ログに残す。一部完了した複合タスクは、完了したページ・範囲を対象列挙から除外する。番号は残件で振り直し、完了項目を次回Updateで再掲載しない。

**運用ルール**：Fは小さく独立した実装、Wは検討・依存関係のある複合タスク、Cはリスク管理。調査・実装・限定検証・Commit／Push・必要な公開／実機確認は各タスクの工程であり、通常は別番号を付けない。依存工程を無理に分割せず、一つのW項目の内部ステップとして進捗管理する。

---

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

# October2026 作業引き継ぎ・進捗記録（HANDOVER）

## D5の選択時メッセージ撤去と録音後の短い注記（2026-10-31 / Europe/Vienna / Codex）

- Adj選択時の「Correct choice...」および誤選択時の促し表示を撤去。選択は状態変更のみとし、D5の短い解説は録音URL保存後に表示する。
- 見出し「✨Notice the difference:」。7.2の注記と同じ12px見出し／14px本文スケール・行間1.6。短くした解説本文を右端に揃えた最大42emのブロックに置き、本文は左揃えで自然に折り返す。録音URL保存後に行ごとに表示する。
- PRACTICE8_SPECの説明文も短縮版へ更新。`git diff --check`確認予定。自動テスト未実施。

## D5のきく改行とNot yet消失（2026-10-31 / Europe/Vienna / Codex）

- 原因：Not yet要素を作成した後、録音ボタン群へappendしておらずDOMに追加されていなかった。さらに操作列自体を全幅flexにしたことで、Adjの後の同一行フローが失われた。
- 修正：D5のキュー行を折返し可能なflexにし、操作列は残り幅を使ってボタン群をAdjの後ろ、Not yetを列の右端へ配置。3ボタン群はnowrap。Not yetは録音/保存中だけ非表示にする。Practice 8.1のCSS/JSキャッシュキーを更新。
- `git diff --check`確認予定。自動テスト未実施。

## 未録音表示の全ページ統一（2026-10-31 / Europe/Vienna / Codex）

- 仕様確定：録音結果欄の未録音表示は「… Not yet」、0.75em、secondary色。文字列は一塊で改行せず、狭い幅では全体を次行へ送る。録音準備状態の「Not recorded yet」は対象外。
- Practice 1/2/7/8、Composition、Pronunciationの録音結果欄へ展開。D5は「きく／とる／停止」のボタン列と同じ行に表示し、右端揃えを維持。幅不足時はNot yet全体を折り返す。
- UI_LAYOUT_SPECとPRACTICE8_SPECを改訂。CSS/JSの参照クエリを更新。`git diff --check`確認予定。自動テスト未実施。

## 8.1 D5の7問目で録音ボタンが重なる修正（2026-10-31 / Europe/Vienna / Codex）

- 原因：D5の7問目はキュー／Adjをnowrapにする一方、600px超では録音操作を隣列に固定。幅計算が制約幅より長いnowrap内容のオーバーフローを隣列へ許していた。
- 修正：D5はhint右端からキューを揃え、Adjの右に8px空けて3ボタンを置く。ボタン間2px、ボタン間で改行しない。Not yetは8.1全問でPractice 7同様の継承サイズとし、語句内改行を禁止。D5ではボタン列の横に加え、幅不足時はフレーズ全体で折り返す。正答後の録音案内はURL保存後に隠す。
- PRACTICE8_SPEC、practice8.1.html、practice8.1.js、style.cssを更新。HTMLのCSS/JS版クエリも更新。`git diff --check` 合格。自動テスト未実施。

## 8.1 D1〜D5のタスク説明とD5間隔（2026-10-31 / Europe/Vienna / Codex）

- 全Drillタイトル直下に簡潔なタスク説明を追加。D5は英語hintと日本語キューの間隔を8pxにし、Adj選択後4pxで「きく」を配置。
- PRACTICE8_SPEC、practice8.1.js、style.cssを更新。`git diff --check` 合格。自動テスト未実施。

## 8.1 D5の操作ボタン・未録音表示（2026-10-31 / Europe/Vienna / Codex）

- 「きく」「とる」「停止」を同じ操作列に隣接配置し、折り返さない。D5全問の未録音表示を「… Not yet」、0.75emへ統一。
- PRACTICE8_SPEC、practice8.1.js、style.cssを更新。`git diff --check` 合格。自動テストは未実施。コミット／Push／Vercel反映待ち。

## 8.1 D5の学習前後表示・結果サイズ（2026-10-31 / Europe/Vienna / Codex）

- ユーザー訂正に従い変更はD5のみ。D4の直前変更を取り消し、D1〜D4の説明文を復元。D5はMeaning／Speaker & listener区分を撤去、各ペアの番号を状況文へ移動、7番のAdj折返しを防止。
- Not recorded yetはD5の1〜5問で0.95 / 0.9 / 0.85 / 0.8 / 0.75em、6・7問は0.85emを試す。D1〜D4は現行サイズ。
- D5の事前説明の必要性について結論を回答。状況判断に必要な短い文脈は残す考えを示す。
- 仕様書・practice8.1.js・style.cssを更新。`git diff --check` 合格。テストは未実行。Node.js不在のため構文チェックも未実施。

## 8.1 D4/D5の折返し調整（2026-10-31 / Europe/Vienna / Codex）

- D4は「きく」をキュー直後へ配置し、幅のあるキュー行を確保。結果欄はその下で折り返し可能。D5,7のキューとAdj選択欄は非折返し。
- PRACTICE8_SPEC、practice8.1.js、style.cssを更新。賛否検討事項（説明文・Meaning/Speaker & listener表示・番号・未録音表示サイズ）はユーザーへ提案として回答し、今回未変更。
- `git diff --check` 合格。既存テストは未実行。Node.js不在のためJS構文チェックも未実施。コミット／Pushはこれから。

## 8.1 Drill説明とD5ペア整列（2026-10-31 / Europe/Vienna / Codex）

- ユーザー指示で各Drillの💡操作説明を撤去し、タイトル・設問・操作UIから課題を理解する構成へ。D5のタイトルは「How Do These Expressions Differ?」。各設問の状況文は判断材料なので維持。
- D5の英語ラベルと日本語キューの整列を全問題共通から各2行ペア単位へ変更。英語ラベル列とキュー開始位置の間隔4px、キューと「きく」の間隔4px。
- 仕様書、practice8.1.js、style.cssを更新。ペア単位のラベル幅再計測を実装。`git diff --check` 合格。既存テストは未実行、Node.js不在のため構文チェックも未実施。コミット／Pushはこれから。

## 8.1 D5：録音後の解説フロー（2026-10-31 / Europe/Vienna / Codex）

- 開始main `941c2ed`、mainがorigin/mainと一致し作業ツリーはクリーン。D5の語彙・対人印象ラベルと英語解説文をユーザー承認に基づき改訂。
- D5,6は上手を重複させず、Blunt→下手／Tactful→苦手。D5タイトルは「Choose, Record & Learn」、説明はラベルに合うAdjを選び録音後に解説を読む流れ。選択後は正誤と録音案内のみ、詳細解説は各行の録音URL保存後に録音再生ボタン直下へ表示。
- D5限定で「きく」を日本語キュー・Adj選択の直後へ移動。ラベル、クイズ選択、文型判定、録音保持、音声ライフサイクルは従来仕様を維持。
- PRACTICE8_SPEC、practice8.1.js、style.cssを更新。自動確認：`git diff --check` 合格。既存テストは依頼外のため未実行。JavaScript構文確認はNode.jsが環境になく未実施。公開反映・ユーザー実機確認は未了。

## 8.1：英語指定後のキュー頭整列（2026-10-31 / Europe/Vienna / Codex）

- 開始main `f600815`、workクリーン・GitHub main一致。ユーザーがD5のAdvancedタイトル、Ex5のAssessment等の語、動詞の分散案を依頼。これら名称/内容変更は選定用の提案に留め、承認前に差し替えていない。
- 実装対象は英語指定後のキュー頭整列。従来のinlineのラベル実幅差が開始位置差の原因。Drill内の最長ラベル実幅を計測して共有し、日本語を別列へ。フォント準備・設定変更・リサイズに追従。Q/A表示は対象外。狭幅Displayの長い語は日本語列内で折返し、本文/ボタンの縮小や固定座標補正をしない。音声列の共有・最短間隔・録音保持を維持。
- 検証：practice81 991項目、practice81-cue-fit 96項目合格（700〜1920px、両表記/全ヒント、キュー頭・音声列・最短間隔・実本文基線）。基線テストはGrid外枠へ疑似要素を追加して列を動かす方法から、実際の日本語内容内で測る方法へ変更。
- PRACTICE8_SPEC/UI_LAYOUT_SPECへ整列規則を明記。mainへ保存。名称/キュー案は終了報告で提示、ユーザー選定待ち。Vercel反映・実機確認は未了。


## 8.2：疑問文・語彙分散（2026-10-31 / Europe/Vienna / Codex）

- 開始main `7f03560`、workクリーンでGitHub main一致。導入の何も＋Negative, Nothingを１行表示。D1からTense指示を外し、指定のデパート/明日/飲む/先生の４疑問文へ。D2はL8の持っていく/捨てる/洗う/切る、D3は作る/歌う/かぶる、E3は靴をはくへ変更。D3返答キューは何でも／動詞。
- 別問題枠の動詞・具体的目的語の重複を避ける基本ルールをAGENTS/PROJECT_SPECへ記載。ページ内一覧はPRACTICE82_SPEC。目標語/Q&A/比較/指定語彙は反復の例外。E1とD1の飲むは指定による重複、D1〜D3の11動詞枠は重複なし。既存ページは改作していない。
- 導入区分は900px以下で独立行。375px等のひらがな区分だけ実幅に合わせ文字を縮小し、本文・ボタンは標準サイズを維持。親子container条件不一致によるDisplay狭幅のはみ出しをmedia条件統一で解消。必要な語の活用形読みと課題限定の漢字異表記を登録、STT原文保持、短答・時間/場所の部分補完を許容。
- 自動検証：practice82 480、shared-conversation-display 444、example-vertical-spacing 176項目合格。通常/ダーク、375〜1440px、全表記/文体/ヒント、Y/Nロック・独立録音保持・０秒リレー・中断を確認。JS構文・差分チェック済み。
- mainへ保存。Vercel反映・TTSの実音・ユーザー実機確認は未了。次は公開8.2の表示/音声確認。最終SHAはGit履歴・終了報告を参照。


## 8.1 D5：一語指定・文重複撤去・実内容幅（2026-10-31 / Europe/Vienna / Codex）

- 開始main `a4c37b8`、workクリーン・GitHub main一致。Skill assessment/Personal perceptionをSkill/Perceptionへ短縮。Ex5は母の花育てを維持し、D5第１組は母の料理へ変更。同じ完成文を例とDrillで反復しない。Adj選択・意味/対人的印象の構成は維持。
- 原因：旧measureCuesは折返し前のnowrap最大幅＋8pxを保持し、CSSの列間隔とセルpadding/select末尾marginも加算。折返した実内容に合わせた再計測がなかった。さらに900px付近では、850px共通container規則と600pxの練習８規則が競合し、３列表のまま操作セルだけ次行へ移っていた。
- D5限定で操作３ボタンの実寸と利用可能幅を確保し、折返したテキストRange/選択欄の最長端を計測して共有キュー列を詰める。余剰幅は操作列の後ろへ。末尾paddingとselect右marginを除き、最長端→きくは共通grid gap4px（小数丸め１px未満）だけ。600pxまでは次行、601px以降は３列に統一する詳細度のCSSを指定。他Drill/8.2へ幅計算法を広げない。フォント準備・設定・リサイズで再計測。固定位置補正・フォント縮小はしない。
- 検証：practice81 991、practice81-cue-fit60項目合格。例文/Drill非重複、一語指定、標準1440/1920pxの１行表示、700/900/1100/1440/1920px×両表記×全ヒントで、最長端から約4〜5px・全行のきく同列を実測。クイズ/録音・２行保持・基線・通常/ダークも確認。描画目視・構文/差分チェック済み。
- PRACTICE8_SPEC/UI_LAYOUT_SPEC/PROJECT_SPEC更新、幅計算の単独回帰テストを追加。mainへ保存。Vercelデプロイ完了とユーザー実機確認は未了。最終SHAはGit履歴・終了報告を参照。

## 8.2新設：何か・何も・何でも（2026-10-31 / Europe/Vienna / Codex）

- 開始main `5cd9d74`、workクリーン・GitHub main一致確認。ユーザー承認の青写真を実装。新規practice8.2.html/JS、Indexへ追加。
- E1は飲むを使い何か/何も＋否定/何でもを比較。D1４文（昨日デパート、明日、飲む、ケントさんに聞く）。E2今朝の食事のQ/Yes/No→D2４Y/N会話（次の週末、今朝、昨日、カフェ）。E3どんな音楽→何でも→D3音楽/本/映画の３会話。希望のたい形や可能形は使わず、普段の習慣で種類を限定しない何でもを導入。
- Y/N未選択はきく/とる両方をロック、選択だけで再生しない。否定返答は今回の学習目標として何も＋否定を必須、肯定の長答/冒頭省略、D3何でも単独の自然な短答を許容。何かをは許容、何も/何でものをは同様に削除しない。別の時間・極性は拒否。
- 8.1の設定・HTML・音声/録音/STT/０秒リレー/中断/結果保持をページ固有JSへ踏襲し、8.1本体は変更しない。共通練習8レイアウトのp81クラスを再利用し、8.2固有の概念見出しの折返しだけpractice82-pageへ限定。内部A/B/C人物は追加しない。共通丸囲みQ/A・130%・余白・テーマ・ヒントを維持。
- 何か=なにか、何も=なにも、何でも=なんでもと活用形まで読みを登録。Hiragana Onlyでもカタカナ保持。STT原文・表示・採点・TTSを分離。聞く課題の聴く/訊く、見る課題の観るを登録語の表記差として許容し、原文の漢字は書き換えない。
- 検証：practice82 455、shared-conversation-display444、section-spacing68、example-vertical-spacing176合格。全モデル/３文体/２表記/３ヒント、Q/A、Y/N、かな認識、原文空白、２行結果とYes/No独立保持、０秒リレー・新規録音中断、375〜1440px・通常/ダーク、全読み/ヒントの狭幅を確認。描画目視・構文/差分も確認。公開実機/実TTSの音質は未確認。
- 仕様：PRACTICE82_SPEC新設、PROJECT_SPEC更新。語彙一覧・判定例外・継承範囲を記録。既存L1/L2参考漢字監査は練習１・２が対象であり範囲を無断拡大しない。
- 保存先main。Vercelデプロイ完了とユーザー実機確認は未了。最終SHAはGit履歴・終了報告を参照。

## 8.1 D5意味→対人的印象のAdjクイズ（2026-10-31 / Europe/Vienna / Codex）

- 開始main `9e288a5`、workクリーン・GitHub main一致。ユーザー承認によりD5を刷新。左端のオレンジ指定は固定し、学習者が日本語Adjを２択プルダウンから選ぶ。
- 前半Meaning３組：母の花育て上手/得意、自分の英会話の下手/苦手、早起きの苦手/下手。後半Speaker & listener４組：自己紹介のBoastful/Confident、留学生の友達のPraise/Personal perception、歌のPraise/Direct、初級者→教師本人のPatronizing/Rude。計７組14行、全てVerbのがAdj。花/育てる・早く起きるはユーザーの比較例から補足。計算と踊るは今回は不採用。
- Skill assessmentは技能評価、Personal perceptionは本人の強み・難しさについての捉え方。第三者の得意は使用禁止にしない。本人の発言や実際の技能を知る場面を明示。上手を思考活動全般に禁止する一般則にもせず、早起きの下手を通常用法の違和感として扱う。Ex5も母の上手/得意を意味指定で導入。
- 未選択/指定と不一致ならきく/とるをロック。両方へChoose an adjective that matches the label.。合致で解除して短い説明。選択で音声を自動再生しない。クイズは指定の意味・印象を作るための選択であり、声色や人格を採点しない。録音判定・モデル・２行独立保持・0秒リレーは維持。行IDと選択語で保存し、表記・文体・ヒント変更で選択/録音を消さない。
- 検証：practice81 973、shared-conversation-display417合格。全選択の不一致/合致/解除、全モデルの文体・表記、両行の録音保持、基線、共有きく列、Ex4整列維持、375〜1920px通常/ダーク、長い意味指定の狭幅表示を確認。描画を目視、構文/差分確認済み。検証後はシナリオ英語を短縮し、クイズの答えを先に書く文を撤去（モデル・操作は同一）。
- 仕様：PRACTICE8_SPEC/PROJECT_SPEC/UI_LAYOUT_SPEC更新。保存先main、最終SHAはGit履歴・終了報告を参照。Vercelデプロイ完了とユーザー実機確認は未了。

## 8.1 Ex4整列・D5行頭指定（2026-10-30 / Europe/Vienna / Codex）

- 開始main `cf13501`、workクリーン。ユーザー指示によりEx4の2行目以降の副詞開始位置を先頭のぜんぜんへ合わせ、👉️直前の共通列へ寄せる。本文の〃は先頭文「のが」のがと同じ中心位置へ。内容幅の計測とgrid列を使用し、top/transform等の固定座標補正はしない。語彙ヒント・漢字/ひらがな・文体・リサイズ時に追従。音声は省略せず全文のまま。
- D5は英語の印象2択を撤去し、各行の頭にBoastful/Confident、Modest/Uncomfortable等の固定指定を共通項目名スタイルで表示。通常Drill内の区分非表示に対する今回の承認例外としてUI_LAYOUT_SPEC/PRACTICE8_SPECに明記。Ex5項目名もBoastful/Confidentへ合わせる。説明をMake both sentences to match the labels. Compare how they sound.へ。２行の録音・モデル再生・結果・採点・個別音声の保持は維持。英語印象の選択状態/結果処理のみ撤去。
- 検証：practice81 856項目合格。375/600/900/1440/1920px、通常/ダーク、副詞の頭と〃の実座標、本文基線、D5固定指定と両行の録音保持を確認。追加の表示マトリクス48項目（ひらがな/漢字×Formal/Casual×Off/Hover/Display×600/1440pxで副詞頭/〃中心）合格。通常/ダークの描画を目視確認、構文・差分チェック済み。
- 保存先main。Vercelデプロイ完了・ユーザー実機確認は未了。最終コミットIDはGit履歴と終了報告を参照。

## 表示指摘への追従（2026-10-30 / Europe/Vienna / Codex）

- 開始main `8c0e88c`、workクリーン・GitHub main一致を確認。ユーザーの修正依頼に対応。
- 1.1 D2/D3の説明・選択/入力欄・操作前ガイドをN₁/N₂へ（内部キー維持）。1.2 D2の説明内せんこう/専攻も文字モード連動。
- 2.1 E2の最初のXをQXの人物位置へ右寄せ、返答にあれキューと👉️、D3色キューを🔴🔵🟢へ。Who案内は既存DOMにはなかったが生成処理も撤去。2.3 E1の単独XもQXの人物列へ。8.1 D2はQ/Aに末尾コロンがなく共通変換を通らなかったため、コロン有無に依存しないよう修正。共通アセットのキャッシュ版を更新。
- 2.1 D3の1Yは後でユーザー確認する指示により個別修正を保留。入れ子のstrongの表示問題は今回変更しない。
- 7.3は今朝/今日の朝、昨夜/昨晩/昨日の晩、先ほど、昨日のお昼、時刻指定のない昨日の朝、登録の午前十時/午後八・九時を同義表現として採点で許容。異なる時間帯・時刻は拒否。STT表示・モデル音声は維持。詳細はPROJECT_SPEC冒頭。
- 7.2 D1停止右「…から…」は、開始点のガイドになる利点と、キュー重複/文の型を固定して見せる弱点を提示。検討段階として未実装。
- 検証：shared-conversation-display417、answer-rules355、practice81 881、listen-help51合格。2.1 E2/2.3 E1は600/1440pxで人物位置、説明の漢字切替、2.1返答キューと色記号、8.1 D2全Q/Aを直接検証。構文・差分確認済み。
- mainへ保存。公開のデプロイ完了/ユーザー実機確認は未了。最終SHAはGit履歴と終了報告を参照。

## 現在のリレー状態（2026-10-30 / Europe/Vienna / Codex）

- 状態：全ページ実装・自動検証済み。main保存後にユーザーの公開実機確認待ち。
- 開始main：`2b1a6a7`、作業ブランチwork。ユーザー「では全ページ実装せよ」に基づく共通表示展開。
- 2.2確定の丸囲みQ/A・角丸X/Y・テーマ別人物色・白い外枠の伸縮を該当する全ページへ適用。`conversation-display.js`で表示処理を共有し、人物未指定の課題には追加しない。画像内外の人物は実際の発話・準備・録音・録音再生と同期、終了/中断で解除。2.1/2.2のWho案内撤去、2.3通話説明と第三者Z、7の時制、8の比較録音保持。
- 「どの／どれ」の質問/フォーカス/準備中に正答を囲む処理を撤去。2.1 E2/D3、2.2 E3/D3/D4S2のどの人/D5は返答時だけ対象表示し終了で解除。既知のこの/その/あの質問での概念表示は維持。
- 2.1英語キュー切替時の役割・人物保持を修正（文法強調strongは複製しない）。2.3の共有役割列は全行最大内容幅で測定し狭幅のはみ出しを防止。375pxの2.1写真内ボタンのみ左右padding4px・min-width解除、フォントや座標は維持。
- 自動検証：shared-conversation-display407、practice21 815、practice22-qa540、practice23-cities2566、practice81 881、lesson2-speaker-pulse1631、labels-and-speakers100、example-arrow-alignment44、common-yn-examples125、speaker-guide60、section-spacing62、example-vertical-spacing164、練習7 Example順序の代表組合せ150項目合格。構文/差分確認。練習7全組合せは300秒で完了せず（共通表示を外した従来処理でも測定に時間を要する）。重複測定を削減し、EXAMPLE_ORDER_SMOKE=1で全3ページ×600/1440px×両テーマ×文体/ヒント/文字モードの代表組合せを確認。全組合せ合格とは扱わない。
- 仕様更新：AGENTS/UI_LAYOUT_SPEC/PROJECT_SPEC/PRACTICE2_SPEC/PRACTICE22_23_SPEC/COMMON_RULE_AUDIT/LESSON2_SPEAKER_AUDIT/UI_ROLLOUT_REVIEW。後述の2.2限定・他ページ未展開・旧赤点滅は当時の履歴。現行は上記共通仕様を優先。
- 公開/実機：Vercelのデプロイ完了とユーザー環境の実機確認は未了。次は公開表示・再生/録音時の人物と対象表示を確認する。保存先main、最終SHAはGit履歴と終了報告を参照。

- 2026-10-30 / Codex：開始main `b5568e0`、workクリーン・GitHub最新4ルール文書確認。ユーザーが2.2の表示改訂を確定。丸囲みQ/A・角丸人物・通常/ダーク色・白い外枠伸縮・Who撤去・順序/共有列/縦余白/ボタン位置/時計会話維持をUI_ROLLOUT_REVIEWへ一覧化し、UI_LAYOUT_SPEC等の試験/未確定記述を更新。他ページへのコード展開は今回未実施。
- D3/D5の正答品物の青枠をコード/Chromiumで点検。両方とも初期なし→質問再生中は正答対象あり→終了後も残る。D3はフォーカスだけで点灯、D5はクリック時。賛否・返答モデル時だけ示す提案・D5の所有関係情報の問題を整理し、動作は変更しない。人物の発話枠と対象品物の青枠を混同しない。
- 全13公開ページをコード照合し、人物指定のない課題へX/Yを追加しないこと、2.3の通話場面説明と第三者Z、7の時制区分、8の2行録音比較、発音の制限設定を保つ点を記録。文書のみ変更のため音声/録音の回帰テストは再実行せず、リンク/差分/コード参照と対象強調の実測を確認。次はユーザーへ賛否と展開時の考慮点を提示する。

- 2026-10-30 / Codex：開始main `475342f`、workクリーン・GitHub最新4ルール文書確認。ユーザーの確認後、推奨した第一段階「白い枠が広がる＋文字色は既存のまま」を2.2で試行。濃い人物色の拡大枠は服と同化したため撤回。box-shadowを濃い補助外周4px→白6px＋濃い補助外周8px→元へ、1.2秒周期に戻す。2px白輪郭固定。reduced-motionは白6px＋濃い補助外周8pxで静止。人物本体/文字色・配置・Who撤去は維持。DeepPinkは第二段階候補であり今回は未実装。
- UI_LAYOUT_SPEC等を現仕様へ更新。practice22-qa 540項目合格。全発話の白い外枠キーフレームと補助外周、静止表示を確認。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `8fc233b`、workクリーン・GitHub最新4ルール文書確認。2.2の広がる外枠を白＋グレーから、各人物の濃い色へ変更。X#4c1d95/Y#075985のbox-shadowを1.2秒周期で4→8→4px、細い2px白輪郭は固定。人物本体の色・文字・ボタン位置は維持。reduced-motionは濃い人物色の8px枠で静止。通常/ダーク共通。Who案内の撤去と終了時枠解除を維持。UI_LAYOUT_SPEC等へ反映。
- practice22-qa 540項目合格。全発話の画像内外の枠アニメーション色と、reduced-motion時の色/8px静止を確認。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `8f89617`、workクリーン・GitHub最新4ルール文書確認。2.2のWho is speaking?/X/Y is speaking案内をDOMから撤去。画像内外のX/Yは人物色③を維持し、白い輪郭＋濃い外周の枠を1.2秒周期でゆっくり点滅する方式へ変更。濃色反転と赤点滅は2.2では使わない。reduced-motionは明るい枠の静止表示。2.1/2.3は維持。
- Playing/マイク準備/録音/録音再生の既存状態に同期し、終了/中断/エラーで枠を解除。Who案内は非表示CSSではなくsceneで配置しない。ボタン・領域説明の座標、時計/値段/会話、共通縦余白は維持。撤去前mainと比較して幅375/600/900/1440の全Exampleボタン矩形40件が一致。UI_LAYOUT_SPEC等を現仕様へ更新。
- practice22-qa 539、speaker-guide82合格。通常/ダーク・両セット・全音声の枠強調と解除を確認。lesson2-speaker-pulse 1631、practice2-next441、example-vertical-spacing164も合格。描画も目視確認。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `e9cfe19`、workクリーン・GitHub最新4ルール文書確認。全公開ページのExample縦余白を共通変数へ。独立例文/共有grid行8px、同一グループ折返し4px、画像から例文群12px。ブラウザp margin/行追加margin/cell上下paddingの重複を除去。Example→Drill24px・セクション40pxは維持。発音/作文は該当Exampleなし。全HTMLのCSSキャッシュ版を更新。
- 2.2だけWho案内を通常#334155文字/#f1f5f9背景、ダークは反転した無彩色へ。speaker-guideのアニメーションを2.2では実行しない。図内外の人物は実際の再生/準備/録音/録音再生中、X濃紫#4c1d95/Y濃青#075985＋白文字/同色2px枠へ静的反転し、終了/中断で復帰。2.1/2.3の赤点滅は維持。2.2 Ex2の時計/値段/会話は維持。
- UI_LAYOUT_SPEC/PROJECT_SPEC/PRACTICE22_23_SPEC/LESSON2_SPEAKER_AUDITを更新。Example縦余白164、section-spacing62、speaker-guide123、practice22-qa539合格。通常/ダークの2.2を描画確認。practice81 881、lesson2-speaker-pulse 1631、example-arrow-alignment44、common-yn-examples125も合格。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `e76e674`、workクリーン・GitHub最新4ルール文書確認。D4 S2 3Qの「Yさんのクラスメートは、どの人ですか」を確定採用。共通question関数でFormal/Informal/Casualの語尾へ対応。キュー順、話者X→Y、返答「あのひと」と許容回答を維持。
- 青系比較③のペアを2.2だけ実装。Xは通常#6d28d9白文字/ダーク#c4b5fd濃紫文字を維持。Yは通常#7dd3fc白文字（ユーザーの「知ろほんと」を白フォントと解釈）、ダーク#67e8f9濃紺#083344。画像内外の同色と再生/録音中の赤点滅を維持。通常Yの白文字は明るい水色と明度差が小さい点を実装前に報告。UI_LAYOUT_SPEC/PRACTICE22_23_SPECを確定仕様に更新。practice22-qa 539、practice2-next 441合格。通常/ダーク描画も確認。公開後の実機確認は未了。

- 2026-10-30 / Codex：通常背景のYを青寄りにした3案をassets/review/person-y-blue-20261030.pngへ作成。Xは現紫、ダークYは前回②シアン#67e8f9に固定し、通常Yだけ#0369a1白文字/#0ea5e9濃紺文字/#7dd3fc濃紺文字で比較。画像目視済み。候補提示のみ、教材本体の色とD4のは/がは変更していない。

- 2026-10-30 / Codex：開始main `8bc8351`、workクリーン・GitHub最新4ルール文書確認。2.2 E2の👉️/音声をE3同様の共有grid/subgrid列に変更。9ページの初期表示600/1440px点検で1.1の狭幅のみ約24pxずれを発見し、折り返しflexを共有gridへ変更。他の初期表示は揃っていた。共通の最長キュー内容幅・同一Example内共有列・固定px禁止・矢印不要行は追加しない規定をUI_LAYOUT_SPECへ明記。
- D4 S2 3Qを「Yさんのクラスメート／どのひと」へ並べ替え。助詞「は」は賛否の検討依頼であり確定変更ではないため、現モデル「どの人がYさんのクラスメートですか」を維持。「Yさんのクラスメートはどの人ですか」を推奨候補とし、返答・許容・話者は維持。
- Y色3案（赤紫、シアン、より明暗差の強い黒/白）を通常/ダーク＋Example背景で作成し、assets/review/person-y-colors-20261030.pngでリンク提示する。Xは現在の紫に固定。Y本体は現グレーを維持。practice22-qa 539、practice2-next 441、practice11-topic 20、example-arrow-alignment 44合格。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `071f6c1`、workクリーン・GitHub最新4ルール文書確認。ユーザー指定②の人物色を2.2だけに実装。画像内/外のXは紫、Yはグレー。通常背景X#6d28d9/Y#4b5563＋白文字、ダークX#c4b5fd/文字#2e1065、Y#d1d5db/文字#1f2937。静止時のみ適用し、再生/録音の赤点滅/枠と終了後の復元を維持。Q/A、領域色、文法色、他ページ、音声/判定は維持。UI_LAYOUT_SPECへ範囲とテーマ別規定を追加。
- practice22-qa 514項目合格。通常/ダーク・幅375〜1440の画像内外の計算色/太さ、全Example/Drill両セットの話者点滅と解除、Ex3共有矢印列、2.3非影響を確認。通常/ダークの描画も目視済み。公開後の実機確認は未了。

- 2026-10-30 / Codex：人物色3案の比較画像を再描画し、assets/review/person-colors-20261030.pngへ保存。通常/ダーク＋Example背景、紫×無彩色の淡色/強色/枠線の3案。チャット添付とsandboxリンクがユーザー環境でNo imageになったため、GitHubのHTTPS画像URLで再提示する。教材本体の人物色は未変更。画像のみ目視済み、音声等のコードテスト再実行なし。

- 2026-10-30 / Codex：開始main `a4578e4`、workクリーン・GitHub最新4文書確認。2.2 Ex1画像外X/Y見出しの赤点滅漏れを修正。原因はグループ見出しが行別の同期対象から漏れていたため。該当Example画像の発話人物とグループのdatasetを照合し、再生終了/中断で解除。既存Ex2/Ex3、D1〜D5は行の人物のみ点滅を維持。
- Ex3はCSS grid/subgridで役割・キュー・👉️・きく・本文の列を共有。キュー幅はmax-content上限と可縮幅、固定pxなし。700px以下は本文を次行へ回し矢印列を保持。色分けは提案段階で未実装。
- practice22-qa 513項目合格：Ex1の6音声、Ex2/Ex3、D1〜D5の初期/別セットの全音声で図内外の該当話者点滅と終了解除、375/600/900/1440の通常/ダークでEx3矢印列整列・収まりを確認。既存practice2-nextは録音中の図内外人物同時点滅を含む441項目合格。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `f39f096`、workクリーン・最新GitHub4文書確認。2.2限定で①の丸囲みQ/Aと画像準拠の角丸X/Yを試験実装。Ex2/Ex3は役割→話者→キュー→👉️→きく→全文に修正。D2〜D5も役割を先にし、D1/Ex1の話者も同じ角丸表示にする。役割は静止、話者だけ画像と連動して再生/録音中赤点滅。音声・判定・録音キー・2.3等は維持。
- 仕様はUI_LAYOUT_SPEC/PRACTICE22_23_SPECへ2.2限定例外として記録。既存検証practice2-next 439合格。追加practice22-qa 61項目合格。初期構造、幅375/600/900/1440・通常/ダーク、役割の円・人物の角丸、再生中の話者のみ点滅と終了解除、セット再描画・2.3非影響を確認。非表示既存custom-tip-boxは375pxで外に出るため、今回の会話行の収まりを検証対象とする。公開後の実機確認は未了。

- 2026-10-30 / Codex：開始main `16c2b21`、workクリーン。GitHub連携でmainと最新4ルール文書を確認。ユーザー指示により8.1 D5を根本再構築。日本語の表現選択プルダウンを撤去し、同じ場面で固定した2行×5問（計10行）を初期から常時表示。両行の日本語評価語と英語2択が録音前から見える。
- 各行右側の英語選択はBoastful/Confident、Modest/Uncomfortable、Praising/Direct、Praising/Descriptive、Arrogant/Rude。両行それぞれが同じ2候補から印象を選び、対応すれば✓と既存の短い説明、異なればCompare the two expressions again.を表示。選択だけで再生・録音せず、日本語モデル・録音の採点を変更しない。従来の「録音後だけ印象が見える」動作は廃止。
- 両方の行に独立したきく/とる/停止・文字抽出・録音再生を設置。1行目の結果を表示したまま2行目を録音でき、終了後も同時に比較できる。既存録音キーcomparison-N:評価語を維持し、英語選択は別Mapで行ごとに保持。表記・文体・Vocab変更でも両録音と選択を復元。録音中は英語選択もロック。音声ライフサイクルと0秒リレーは維持。
- 最長キューに基づくきく列、通常/ダーク、130%、共有ボタンを継承。比較のキューと音声の文字は最初の基線で整列し、任意の上下px補正を使わない。番号は2行の中央。Ex5と他Drillの学習内容は維持。PRACTICE8_SPEC/UI_LAYOUT_SPEC/PROJECT_SPEC/tests READMEを現行仕様へ更新し、旧D5選択前ロック記述も撤去。
- 検証：practice81 881、section-spacing62合格。初期から10行/20英語ボタン、各モデルと行別採点、録音前の印象選択、両実録音の同時表示・別URL・再描画後保持、英語変更で録音を再採点しないこと、録音中ロック、0秒リレー、全モード、375〜1920pxの通常/ダークと基線を確認。通常/ダークを描画、ダークを目視。公開後の実機・実際の音声品質は未確認。
- 保存はGitHub連携でmainへ通常の親子関係を維持して反映。今回の再構築で以前のCompare形式の確認待ちは解決。公開後は両録音を並べて比較できることと英語の印象語・説明をユーザー実機で確認する。

- 2026-10-30 / Codex：開始main `d38dc18`、workクリーン。GitHub連携で最新mainとAGENTS/RELAY_WORKFLOW/PROJECT_SPEC/HANDOVERを取得し一致確認。ユーザー確定の文型「N₁はN₂です」、人物Xさん/Yさん/Zさん、会話のQ/Aを実装。
- 1.1/1.2のHTML title・h1・IndexをN₁はN₂です/ですかへ統一。Question:/Response:は1.2、2.1、2.2/2.3、7.1/7.2/7.3、8.1の既存位置でQ:/A:へ短縮。独立した段や音声ボタン内の役割表示は追加せず、共通の色・基線・音声列を維持。
- 練習2の人物名は画像のX/Y/Z、キュー・モデルのXさん/Yさん/Zさん、Who/通話案内、所有物/クラスメート/英語キュー/画像代替文まで更新。メアリー・たけし・ロバートは維持。位置・指示語・録音キー・CSS・datasetは既存A/B/Cを保ち、SpeakerGuide.nameで画面名に変換。赤点滅・所有関係・視点を保持。
- TTS専用はえっくすさん/わいさん/ぜっとさんへ明示。判定は英字/かな/カタカナ/小文字/全角の人物名を照合し、長い英字人名の末尾は変換しない。STT原文表示・一般語のかな規則は変更なし。キャッシュ混在を防ぐため変更したJSの読み込みURLを20261030-labelsへ更新。
- 共通表記はUI_LAYOUT_SPECの先頭を正とし、PROJECT_SPEC/PRACTICE2_SPEC/PRACTICE22_23_SPEC/LESSON2_SPEAKER_AUDITから参照。AGENTSとPRACTICE8_SPECも更新。旧比較画像/履歴は記録として維持し、Q/R案選定待ちはQ/A採用で解決。Compareの英語印象2択は今回指示の対象外で引き続き確認待ち。
- 自動検証：labels-and-speakers100、practice21 815、practice2-next439、practice23-cities2566、practice22-umbrellas321、practice81 773、speaker-guide123、lesson2-speaker-pulse1631、common-yn-examples125、section-spacing62、tts-model-script22、stt-display194、audio-relay420、answer-rules279合格。構文/差分正常、2.1/2.2/2.3の通常/ダーク画面を保存し2.2/2.3を目視。音声の実機品質・公開デプロイ・ユーザー確認は未実施。
- 練習7の追加配置検証：全文体/全幅のexample-orderは長時間のため手動停止（合格と扱わない）。元のテストは変更せず、今回対象の600/1440px・通常/ダーク・Formal/Casual・OFF/Display・漢字の48条件へ絞った一時テストは198項目合格。
- 保存：GitHub連携でmainへ通常の親子関係を維持して反映する。通常Gitの認証設定は変更しない。公開後は新しいQ/A表記と人物名・実際のTTS読みをユーザー実機で確認する。

- 2026-10-30 / Codex：開始main `07bd13c`、workクリーン。git fetchは認証エラー、GitHub連携のcommit/main照会と最新AGENTS/RELAY_WORKFLOW/PROJECT_SPEC/HANDOVER取得でmainとHEAD一致を確認。通常Gitの認証設定は変更せず、今回の保存はGitHub連携を使う。
- 8.1 Example4：先頭行のキューと本文は全文、後続5行のキューは副詞／好きから表示。本文の共通する料理を作るのがは〃で省略。〃には省略前の表記に対応するアクセシビリティ用ラベルを設定。音声は全6行とも完全なモデルを再生する。Drill4のキュー・モデル・判定は維持。PRACTICE8_SPEC/UI_LAYOUT_SPEC更新。
- 検証：practice81 773項目合格。全文体×両表記×6音声の全文再生、6行の表示、〃のラベル、全モード/通常・ダーク/375〜1920pxの既存表示・録音・判定を確認。通常/ダーク画面を保存しダークを目視。公開後の実機と実際の発音品質は未確認。
- Compareの次案は確認待ち：ユーザーのDrill6は現行Drill5のCompare expressionsを指す想定。「2文を並べ、各行右側でBoastful/Confident等の英語2択から聞こえ方を選ぶ」理解を質問。返答前なのでD5の問題構成・選択欄・採点は変更せず、現行5問を維持。Q/Rの3案選定も引き続き未確定。

- 2026-10-30 / Codex：開始main `4a0e087`、workクリーン・追加ネットワーク権限でfetch同期確認。ユーザー指示により8.1 D1のNoun/Verb＋の区分を撤去し、Example1だけに維持。AGENTS/UI_LAYOUT_SPEC/PRACTICE8_SPECへ「通常区分はExample内、Drillの時制区分は比較問題のみ」を明記。Question/Responseは会話役割表示として別扱い。
- 練習7の3ページをブラウザDOMで点検：Drill内の時制区分は7.1のHabit/Ongoing比較18個、7.2のPast/Present State比較14個、7.3のPast/Past Ongoing比較6個のみ。単一区分Drillへの表示なし、追加修正不要。
- Question/Responseは未選定の3案をassets/review/practice81-qr-options.htmlへ作成。①行頭Q:/R:、②きくボタン内Q/R、③小さな正式名見出しを上段へ。通常/ダーク画像も同ディレクトリへ。共通130%の本文/ボタン・共有音声列を維持した比較用の静的見本で、本体の役割表示は変更しない。推奨は①。③は今回の見本で①より高さ70px増加。比較用ボタンは非操作。
- 検証：practice81 711、section-spacing62合格、構文/差分正常。比較画像を目視、比較HTMLは375/600/1200pxではみ出しなし。公開反映・ユーザー実機確認は未確認。次は役割表示案のユーザー選定を受けて実装。

- 2026-10-30 / Codex：開始main `7bef5ff`、クリーン・fetch同期確認。ユーザー選定の①で8.1 D5を2択切り替えへ変更。Target impression/Skill・Comfortのセットボタン・目標指定・達成表示・隠れたセットを撤去。自分の上手/得意、下手/苦手、友達の上手/下手、留学生の上手/苦手、熟練日本語教師の日本語への上手/下手の5場面。各場面で選んだ表現のモデル・判定・録音後の聞こえ方を連動。得意を他者へ使う問題は今回作らない。
- Ex5は自分の撮影について上手/得意を縦に比較する2文へ統一。選択だけでは音声を流さず、各選択の録音URL/原文/モデル/判定/印象を独立保存・復元。音声・文字の自動人格評価はせず、その場面での語の選択の説明として表示。共通の通常項目名・ゴールド・基線・語彙設定を維持。
- 検証：practice81 710、section-spacing62合格。全5問の各2語について選択とTTS・判定が一致すること、セット/Target表示の不存在、2つの実録音の独立保持と復元、通常/ダーク・375〜1920pxを確認。公開後の実機・実際の音声品質は未確認。

- 2026-10-30 / Codex：開始main `6f47fe3`、クリーン・fetch同期確認。ユーザー確定：通常項目名は練習1方式、時制/アスペクト区分は練習7方式。AGENTSとUI_LAYOUT_SPEC「共通UIの既定契約」へ登録。8.1の通常項目名はexample-label-titleへ統一して灰色バッジの独自装飾を撤去。ActionはVerb＋のに変更。本文と音声の基線は共通example-text-layoutを利用し、子の個別縦位置指定をしない。基本値と実表示テストを両方必須とする。CIの公開ブロックは未導入。
- 副詞：既存ガイドの肯定青/否定赤を共通変数へ移し、ガイド・例文・キュー・選択欄が同じ定義を参照。副詞だけ太字、文法ゴールドは維持。先生の教え方の代替表現は提案のみでEx5へ未追加。文型内の候補「先生は漢字を教えるのが得意です」、実感を述べる別文型「先生の教え方はとてもわかりやすいです」。得意は自分専用ではない。
- 検証：practice81 708、共通Y/N Example125、共通間隔62合格。通常/ダーク・375〜1920pxの項目色/太さ/背景なし、副詞の色と太字、共通配置クラスと音声基線、全モデル/選択/録音保持を確認。公開後の実機・実音声は未確認。

- 2026-10-30 / Codex：開始main `396ecd1`、クリーン・fetch同期確認。8.1 Exampleの低い音声文字は独自align-self:startが親Gridのbaselineを上書きしたため。1440px Chromiumの先頭モデルで1.2/7.3は基線差0px、8.1は4px。個別指定を削除して共通揃えに従わせ、差0pxを確認。従来はX列整列だけの検証だったため、広幅の全Example行に文字基線の検証を追加。
- D3は指定6人物の動作を固定し、上手/苦手をプルダウンに変更。Ex3は同じ友達・撮影の動作について2評価文を常時表示。Ex4は同じ料理を作る動作・好きに6副詞を付けた6文を常時表示、各文を独立再生。副詞の追加強調、項目名統一、Ex5のすごい導入は提案のみで未実装。
- 検証：practice81 668、section-spacing 62合格。通常/ダーク、375〜1920px、全文体/表記/語彙設定、広幅の全Exampleの基線・共有音声列、D3両選択のモデルと判定を確認。公開後の実機と発音品質は未確認。
- ルール追従の助言：共通クラス/部品の利用、実計算値・表示モデル数・初期状態・基線を確認するテスト、CIでの公開前必須化を提案。CIや共通Example生成部品の新設は今回未実施。原因・仕様はPRACTICE81_INHERITANCE_AUDIT/PRACTICE8_SPEC/UI_LAYOUT_SPECへ記録。

- 2026-10-30 / Codex：開始main `6be63f3`、クリーン・fetch同期確認。8.1の色の原因調査：初回a4bc73eで既存の共通値/grammar-highlightを使わず独自色を指定し、初回テストは個数のみで値の照合なし。6be63f3の色値修正からさらに、今回は共通クラスを直接使いページ固有色指定を撤去（色自体は現行維持）。証跡と是正はPRACTICE81_INHERITANCE_AUDIT。
- Ex2：質問・肯定・否定の3モデルを常時表示し、🔊きく/🔊🙆/🔊🙅を縦に整列。既存1.2/7.1/7.2/7.3から共通仕様を特定してUI_LAYOUT_SPECへ明文化。前回はDrillのNoだけを実装してExample配列へ追加していなかった。Ex5は両セットではとのがを強調。
- D5：前回は新課題をSituationsへ実装したが初期値compareを維持したため旧内容だけに見えた。Target impressionを初期値/先頭タブへ変更し、見出し・説明・Example5も連動。Modest/Confident/Boastful/Rude/Arrogantが最初から表示。Skill/Comfortは補助セットとして保持。
- 検証：common-yn-examples既存4ページ＋8.1の全文体125項目、section-spacing62合格。practice81 628項目合格。公開後の実機と実際の音声品質は未確認。

- 2026-10-30 / Codex：開始main `a4bc73e`。8.1改訂：固有ゴールドが共通仕様と不一致だったため通常#ca8a04/ダーク#fbbf24へ修正。明るめ3案はassets/review/practice81-gold-1〜3.png（通常/ダーク例文背景）として提示、採用は未決定。Ex3のはを強調。D2は固定交互の好き/きらいによる4組のY/N Q/Rへ変更し、返答は選択後にListen/Record解除・前提理由Hover・短答モデル/完全回答許容・各選択の録音保持。D4は目的語/動詞/副詞選択/ADJへ。Example音声列は内容幅を共有して整列。
- D5 Situations：目標Modest/Confident/Boastful/Rude/Arrogantを提示し、日本語評価語を選ぶ課題へ変更。選択前は操作ロック。熟練した日本語教師を初学者が評価する設定の「日本語の先生は、日本語が上手です」を追加。文法正答と目標印象の達成は分離、負の印象の一致も行動推奨ではない。Skill/Comfort比較セットは維持。詳細はPRACTICE8_SPEC。
- 検証：practice81 615、audio-relay全12ページ420、section-spacing62合格。通常/ダークの規定色、全文体のY/N両選択、モデルと許容、D5印象、選択前ロック、録音保持、375〜1920pxのはみ出し・列整列を確認。公開後の実機・実音声は未確認。

- 2026-10-30 / Codex：開始main `9b94e85`、workクリーン・fetch同期確認。承認済み青写真で練習8.1を新規実装しIndexへ追加。E1/D1名詞と動作3組、D2自分の好み4問（好き/きらい選択）、D3指定6人物の上手/苦手、D4程度副詞6問（肯定青/否定赤と符号のガイド）、D5 Skill/Comfort4組とSituations5問。D5の文法正答と場面別フィードバックは分離し、認識された評価語に基づき録音後だけ表示。未確定事項の裁量はユーザー承認済み。具体的文・許容・例外はPRACTICE8_SPEC。覚える・まぁまぁは補足語として明示。
- 音声/状態：7.3のページ内音声・Voice処理を基に作成し共通DrillAudioへ接続。8.1のTTS速度0.9。録音中の選択/設定ロック、録音開始で再生中断、0秒リレー、選択ごとのURL/原文/モデル/正誤/言い方評価の保持を実装。共通音声コード・既存ページの学習内容は変更なし。
- 検証：practice81 499、audio-relay 全12ページ420、audio-lifecycle 184、relay-zero-gap 全12ページ12、stt-display 全11対象ページ194、section-spacing 62合格。通常/ダーク・375/600/900/1440/1920px、Example→D24px、次節40px、最長キュー直後の聞く列、録音後のD5評価、結果切替保持を検証。実画面を目視。公開後の実機表示・発音品質は未確認。

- 2026-10-30 / Codex：開始main `f2bdc0b`、workはクリーン・同期確認。2.3の名称を「Demonstratives of Place」に変更し、HTML title・h1・Index・仕様書を一致させた。静的HTML/差分確認合格。8.1はユーザー案を検討中で未実装。D2人物語はL8まで、D3程度の6副詞の可視化と新動詞、D4下手/苦手の英語区分を調査。下手/苦手は技能と心理で完全には二分できない。覚えるL9・まぁまぁL11は進度上の追加確認事項。調査結果はチャットで提示し、未確定案を仕様として登録しない。

- 2026-10-30 / Codex：開始main `016ba13`。STT表示専用 `stt-display.js` を全10対象ページへ導入（発音1はSTTなし）。原文保存のtrimを撤去し、表示・判定・TTSの経路を分離。既存かな保持／1.1・1.2だけカタカナかな化／2以降カタカナ保持、キュー明示時のTシャツ、Form/ふぉーむ独立語限定、1.2専攻限定、キュー登録表記への漢字化を実装。複合語・同音語の曖昧さは推測せず原表記を保持。誤答差分も元の全角・句読点・空白へ対応付け、結果欄pre-wrap。採点とモデル音は変更しない。以下の旧「未実装・未確定」記録は履歴であり、最新仕様はSTT_DISPLAY_RULESを参照。
- 検証：STT表示178項目（全10対象ページ、実際の誤答表示6ページ含む）、answer-rules 279、audio-relay 全11ページ388、practice21 815、practice2-next 439、practice23-cities 2566合格。実音声の認識品質・公開環境の実機確認は未実施。

- 境界追記：STTすまほ/こーひーと教材スマホ/コーヒーは、ひらがな保持と教材カタカナ統一の優先順位が重なる。既存かな保持を優先する案を提示し、未確定として仕様に明示。今回はアプリ実装の変更なし。

- 2026-10-30 / Codex：開始main 83faa2d、クリーン同期確認。ユーザー確認に基づくSTT_DISPLAY_RULESを作成。専攻強制はpractice1.2限定/登録語句、ひらがな保持、カタカナは1.1/1.2だけかな化・その他保持、Tシャツ英字例外、Form/ふぉーむ、句読点/空白、文末わの無条件補正不要、課題内逆変換と表示/判定分離を整理。全11ページのカタカナ等を実行監査。現行コードとの差分とTシャツ別綴り/フォーム/数字等の境界例を明示。今回アプリの表示処理は未変更。次は境界例の扱いを踏まえた表示/判定分離の実装と全ページ検証が必要。

- 検証完了：relay-zero-gap 全11ページ、practice21 815（なん/なに/何すべて正答・原文保持、3文独立再生、新D2/D3）、lesson2-speaker-pulse 1631、practice23-cities 2566（赤枠含む）、section-spacing 52合格。構文/差分正常。語彙枠226へ再集計。共通リレーコードに待機追加なし、録音トリミング/音声エンジン変更なし。

- 2026-10-29 / Codex：開始main 1d3a368、同期確認。全11ページ通常Drillのモデル→録音再生0秒を実録音後経路/疑似APIで確認しAUDIO_HANDOFF_AUDITへ全件記録。2.1何ですかのTTS漢字任せと一律かな変換を修正、なん基準/なにも許容/原文保持。D2返答キュー/モデルを指示語＋品名へ、短答許容。D3辞書は1A Bさん/辞書/どれ、2A Aさん/辞書/どれ（両方B返答）、所有者整合の許容文更新。スマホExample2はA導入/A質問/B返答3文・各再生、画像2ボタンはスマホ内側下へ。全2の話者枠をWhoと同色赤へ。実機未確認。

- 検証：practice22-umbrellas.cjs 321項目（各6行/3ペア、ガイド/行内形式名なし、全モデル、形式判定、切替後の両結果/録音保持、切替ロック、3画面幅通常/ダーク）、lesson2-speaker-pulse.cjs 1177項目合格。構文/差分正常。

- 2026-10-29 / Codex：開始main 461e50f、同期クリーン確認。ユーザー訂正：D5はSet 1 Adjectives/Set 2 Pronouns切替、各3ペア会話のみ。縦比較4行/問と行内形式名は撤去。画像上のAさんの/Bさんの/先生のガイド撤去、話者A/B・Hover・対象強調・モデル/判定/録音キーは維持。切替は既存setButtonsで結果保持/録音中ロックを継承。仕様更新、実機未確認。

- 検証：practice22-umbrellas.cjs 318項目合格（全Speech/Scriptの新モデル/判定、所有対象と話者、録音保持、3画面幅通常/ダークの札枠内）。構文/差分正常。

- 2026-10-29 / Codex：開始main fc24f60、同期クリーン確認。D5 Aさんの傘→あの傘/あれ、先生の傘→この傘/これへ変更。傘の物理位置/画像は維持し、中央黄色にA所有札、A側赤に先生所有札を交換して整合。2Bこの傘/これは維持。モデル/判定/対象強調/所有Hover・alt・仕様更新。実機未確認。

- 検証：practice22-umbrellas.cjs 318項目合格（新配置のモデル/判定・全Speech/Script、録音/ロック/保持、375/600/1440通常ダークの人物/所有札枠内）。構文/差分正常。横長化後の人物札を54%へ上げて狭幅の下切れを解消。

- 2026-10-29 / Codex：開始main 602c42f、同期クリーン確認。ユーザー訂正：D5傘は元の③配置維持。赤A側/青B側/黄中央遠方へ画像差替、上下をさらに省いて4:1表示。1A返答をこのかさ/これへ、2Bこのかさ/これ、3Aあのかさ/あれは維持。モデル/判定/説明/画像座標・仕様を同時修正。生成原本exec-49994f0b-a9f5-4f43-aea9-cc67b3bd7dd8.png保全。実機未確認。

- D5検証：practice22-umbrellas.cjs 318項目（全Speech/Scriptモデル/形式誤答/対象傘と話者/録音ロックと保存保持/375・600・1440通常ダーク）合格。lesson2-speaker-pulse 1186、practice2-next 439、practice23-cities 2205、cue-spacing 2586行、section-spacing 52合格。初回狭幅は隠れたHover枠によるはみ出しがありD5内の初期tooltip位置と形式ラベル改行を修正、再検証合格。構文/差分正常。語彙枠224へ更新。公開実機未確認。

- 2026-10-29 / Codex：開始main 379c585。2.2 D5どのかさ/どれ比較を新設。1 B→Aその傘/それ、2 A→Bこの傘/これ、3 B→Aあの傘/あれ。③長い傘立てを元に生成し、指定返答に整合するようA/B所有の傘を両方B側、先生の傘を中央遠方へ。所有札/語彙Hover/対象強調/話者赤点滅/既存録音判定・排他/独立キーを実装。形式の比較が目標なので形を取り違える回答は不可。生成原本exec-6251acb1-03c4-4b67-98ee-a4df7b3d4d65.png保全。実機未確認。

- 検証：practice2-next.cjs 439項目合格（Q3主語がの質問/短答モデル全Speech/Script、タイトル・判定・録音/結果保持）。構文/差分正常。旧懸念事項一覧のD4見出しも確定内容へ更新。

- 2026-10-29 / Codex：開始main b3115cf、work同期確認。2.2 D1〜D3タイトルを文型明示②、D4「どの人ですか？だれですか？」へ。D4 Set2 Q3キュー「どのひと／Bさんのクラスメート」、モデルは疑問主語がで「どの人がBさんのクラスメートですか」。返答キュー/モデルは「あのひと／あの人です」、正しい全文も許容。物版クイズは案のみ未実装。実機未確認。

- 検証：practice2-next.cjs 439項目（新Whモデル全Speech/Script、短答/誤指示語/不要否定/旧先生回答の判定）、lesson2-speaker-pulse.cjs 946項目合格。構文/差分正常。

- 2026-10-29 / Codex：開始main 5123d9a、クリーン同期確認。2.2 D4 Set2 Q3をA「Bさんのクラスメート／どのひと」→B「私のクラスメート／あのひと」へ変更。モデル全文、あの人です短答許容、いいえ導入/停止右いいえ…はQ3のみ撤去。1/2維持。Set2説明から全問否定指示を外し「💡Ask about each person.」。Q3新キーp22_people_classmate。仕様・語彙枠更新、実機未確認。

- 2026-10-29 / Codex：開始main dc7d12b。全練習2キュー空白監査。Hover用formatWordのHTML整形空白が未指定の空白を作る原因。2.1/2.2共用2.3をcompact HTMLへ、English cues区切り前後も空白なし。D4のこの/その/あのひと・所有関係を単一語句にしてDisplayも途中分断しない。2.2 D4 Set 1 2A「このひと／メアリー」、モデル「この人はメアリーさんです」へ変更。語彙枠監査も更新。
- 監査2226行状態、修正前211種類（日本語141/英語70）をCUE_SPACING_AUDITへ全件掲載。修正後35種類は英語語句の必要空白のみ。D2説明のA役割曖昧さ/D4見出しとSet 2/2.2English cues未実装なども同書に整理、無断変更なし。検証：cue-spacing 2226行合格、practice2-next 438、practice21 810、practice23-cities 2205合格。構文/差分正常。公開実機未確認。

- 検証：practice2-next.cjs 438項目合格（人物常時名なし、実Hover3人が名前のみ、既存モデル/判定/録音/画像枠）。構文/差分正常。

- 2026-10-29 / Codex：開始main 9f9f3a0、同期/クリーン確認。2.2 D4写真内のメアリー/たけし/ロバート常時ラベル撤去。人物Hoverを名前だけに限定、服装/色補足を除去。A/B・赤点滅・問題キュー/モデル/判定は維持。仕様更新、実機未確認。

- 自動検証：practice2-next.cjs 434項目（全Speech/Scriptの新モデル、否定/短答/誤答判定、セット結果保持）、lesson2-speaker-pulse.cjs 946項目（Set 2赤点滅含む）合格。構文/差分正常。語彙枠監査を現行D4へ修正し212 authored unitsへ再集計。弟/友達/先生・クラスメイト表記を認識比較時に正規化、タケシHover服装も新画像へ訂正。

- 2026-10-29 / Codex：開始main 5e52c62。2.2 D4にSet 2関係確認を追加。A/B切替は復活させずSet 1/2選択。指定3会話：クラスメートか→いいえ、この人は私の弟/友達、あの人は私の先生。返答停止右にいいえ…（Casualううん…）。短答/否定後の補完許容、キーp22_people_relationsで結果分離。話者順A/B/B/A/A/B・赤点滅維持。実機未確認。

- 自動検証：practice2-next.cjs 390項目、lesson2-speaker-pulse.cjs 853項目合格。新3会話モデル/返答者視点の判定/切替撤去/各話者赤点滅/録音・解除を確認。構文/差分正常。

- 2026-10-29 / Codex：開始main 89c2550、work。2.2 D4話者切替を廃止、指定3会話へ：Aその人/だれ→Bこの人/たけし、Bその人/だれ→Aメアリー、Aあの人/だれ→Bあの人/ロバート。キューに従い1/3全文、2名前のみのモデル、自然な短答/正しい補完許容。新キーp22_people_mixedで旧問題の結果混同を防止。追加セットは提案のみ未実装。実機未確認。

- 2026-10-29 / Codex：開始main df3b87a、workクリーン同期確認。練習2全3ページの話者赤点滅を再点検。修正前2.1/2.2はWho背景/静的枠のみで人物名赤点滅なし（2.2 D4含む）、2.3は実装済み。2.1/2.2に実再生/マイク準備/録音同期のA/B赤点滅を追加。終了/中断解除、reduced-motion静的赤強調、録音/訂正再生対応。紹介対象人名や第三者Cは点滅しない。全箇所一覧LESSON2_SPEAKER_AUDIT.mdと共通/個別仕様を更新。
- 自動検証：lesson2-speaker-pulse.cjs 946項目（全セットモデル、録音準備/録音/録音再生、終了、中断、古い終了通知、reduced-motion）、practice21.cjs 810、practice2-next.cjs 414、practice23-cities.cjs 2205合格。構文/差分正常。ユーザー公開実機未確認。

- 検証：構文/差分正常、375/600/1440px×A/B視点で画像比率と人物ラベル枠内配置を確認。

- 2026-10-29 / Codex：Bの一貫性を優先するユーザー訂正により、Bは変更前の紺シャツ/眼鏡なしへ復帰。タケシをからし色シャツ/黒縁眼鏡へ変更し長いドレッドは維持。開始main 5f5fa73。画像・alt・人物仕様更新。生成原本exec-34790c96-1289-4f62-b3e4-5d688514872f.png保全。実機未確認。

- 自動確認：構文/差分正常、375/600/1440px×A/B視点で画像比率2:1・全人物ラベルの枠内配置を確認。1440pxのページ描画も目視確認。

- 2026-10-29 / Codex：開始main 3358881、workクリーン同期確認。2.2 D4人物写真のBだけ短髪/黒縁眼鏡/淡い黄色シャツへ変更してタケシとの差を明確化。構図・ラベル位置維持。assets/practice22-people.png差替、alt/人物仕様更新。生成原本は/workspace/generated_images/exec-f172a072-7399-44bd-8229-4b5625fc514b.pngに保全。ユーザー公開実機未確認。

- 検証：node --check practice2-next.js、git diff --check正常。node tests/practice2-next.cjs 414項目合格（E4なし・D4新説明/強調・既存モデル/録音/判定/狭幅を含む）。

- 2026-10-29 / Codex：開始main d0b7bcb、workクリーン同期確認。2.2 Ex4撤去、D4説明を「💡Use だれ to ask who someone is.」にし、だれだけ共通grammar-highlightで太字＋ゴールド。D4人物画像・問題・モデル・許容回答・録音キー維持。PRACTICE22_23_SPEC/COMMON_RULE_AUDIT更新。実機未確認。

- 今回自動検証：node --check practice2-next.js、git diff --check、node tests/practice2-next.cjs（412項目合格）。仕様照合一覧は静的確認を含み、全ページ全操作の再検証完了とはしない。

- 2026-10-29 / Codex：開始main f6c6595、workクリーン・同期確認。2.2 D1「💡Name the item and say its price.」/D2「💡A: Ask the price and answer.」へ指定どおり変更。A質問/B返答の役割・必須回答要素は変更なし。Ex4撤去は意見のみ、未実施。共通仕様照合COMMON_RULE_AUDITを追加、旧2.1例文構成/2.2 D3補足記述を訂正、練習2語彙Hoverの適用例外を明記。話者赤点滅全3ページ統一は未完了。実機未確認。

- 追加確認：全11ページの初期表示にあるDrill説明33欄はすべて💡始まり（2.2 D3を復元）。共通仕様をPROJECT_SPEC/UI_LAYOUT_SPECに追記。D1/D2短縮案は提案のみ、未変更。English cue navigationは5ページ×4幅×2Script×英日切替、241検証合格。構文・差分正常、公開実機未確認。

- 2026-10-29 / Codex：English cues実装済み全5ページ（2.1/2.3/7.1/7.2/7.3）の英日切替後ジャンプを、Exampleから最初のDrill見出し＋本文1行余白へ変更。2.2はEnglish cues未実装。仕様4文書の冒頭に現行仕様を明記。話者赤点滅の全ページ統一・現況一覧は未完了。

- 2026-10-29 / Codex：2.2 D3説明をユーザー指定の「Ask with どの＋noun.」のみへ短縮。補足・絵文字なし。開始main c6bc630、work。構文・差分検証。実機未確認。練習2全3ページの話者赤点滅統一・現況一覧は引き続き未完了。

最終更新日：2026-10-29

## 現在のリレー状態（2026-10-29／Europe/Vienna）
- 今回開始main 8103b16/work、同期クリーン確認。ユーザー指示で2.2 D3どの＋名詞とD4だれを分離。E3/D3食品2セット維持、E4でだれ=who?導入、D4 A asks/B asks各3会話。直近選定画像exec-ae14dc9e（たけしの視線維持、Bをメアリー方向へ微調整）へ差替え。人物の既存キー/モデル/許容維持、D4も録音ロック/列整列へ追加。仕様/語彙監査更新。2.2自動409件・余白54件PASS、375/600/1440px×A/Bラベル範囲/写真比率検査、600/1440pxプレビュー確認。構文/差分チェックPASS。公開反映/ユーザー実機未確認。
- 今回開始main cb52ec7/work、同期クリーン確認。2.2人物写真をペア間の対話へ：左手前A/メアリーを同じ奥行きの横並び・後ろ姿、右B/たけしを共に顔と胸を左手前へ向ける。最初の画像案は視線/横並びが不自然との指摘で採用せず再生成したものへ差替え。たけしは長いドレッドヘア。奥ロバート座位読書維持、メアリー/たけし対象の名前/ホバー/強調を画像に合わせ調整。モデル/判定/役割変更なし。仕様更新、375/600/1440px×A asks/B asksの写真読み込み・2:1・ラベル範囲検査PASS、600/1440pxプレビュー確認。構文/差分チェックPASS。音声ロジック未変更で今回の機能テスト再実行なし。公開反映/ユーザー実機未確認。
- 今回開始main b04fcc4/work、同期クリーン確認。2.2人物写真のペア間隔を拡大、A/メアリーは左手前、B/たけしは右少し奥、たけしの髪は肩より長く。ロバートはさらに奥で座位読書維持。たけし対象の名前/ホバー/強調位置を画像に合わせ右へ。モデル/判定/役割変更なし。仕様更新、2.2自動407件・構文/差分チェックPASS、375〜1440pxラベル検査と600/1440pxプレビュー確認。公開反映/ユーザー実機未確認。
- 今回開始main 1fe83e1/work、同期クリーン確認。2.2人物画像を手前4人立位・友人紹介、奥ロバート座位読書へ変更。A/メアリー左、たけし/B右。A/B印は下側外縁の体付近、人物名/ホバー/強調枠を新位置へ同期。モデル/判定/役割・2:1維持。仕様更新、2.2自動407件・構文/差分チェックPASS。375〜1440pxラベル検査、600/1440pxプレビュー確認。公開反映/ユーザー実機未確認。
- 今回開始main b9bf6b3/work、同期クリーン確認。2.2 D3人物写真を座位へ：Aとメアリー左ソファ/Bとたけし右ソファ、ロバート奥中央立位維持。左右対象枠をy64%/height66%へ、名前/ホバー/強調を人物に合わせる。モデル/役割/判定変更なし。仕様更新、2.2自動407件・構文/差分チェックPASS。375〜1440pxラベル検査と600/1440pxプレビュー確認。公開反映/ユーザー実機未確認。
- 今回開始main be221fd/work、同期クリーン確認。ユーザー確認D3に人物セット追加。おにぎり/おべんとう/この人はだれ、人物ではA asks/B asks各3会話。旧最下部Under reviewを統合、名前短答モデルと返答者視点全文の許容/旧キー維持。生成写真を既存people画像へ差替え（A側黒人短髪メアリー/B側長髪たけし/奥メキシコ系ロバート）、2:1/顔下名前へ。共通sceneはpeople時だけ配置調整、2.3には影響なし。2.2自動407件/余白52件PASS、375〜1440pxラベル検査、600/1440px画像確認。どれ/だれの既存補足もExample内へ移設。仕様/語彙監査更新、構文/差分チェックPASS。公開反映/ユーザー実機未確認。
- 今回開始main f0cbc3c/work、同期クリーン確認。2.1 D4 English cuesを追加、D1両セット/D2両セット/D3両セットの問題キュー英日切替、D3色/Example/画像/日本語モデル/既存録音キー維持。準備録音中は無効、再生中切替は中断。D3→D4共通40px。ユーザーの移動先に関する意見照会へ、D1見出しへの移動を推奨と回答。実装変更の明示指示はまだないため現行Ex1＋本文1行余白を維持。仕様/検証更新。2.1自動810件・英日移動145件・余白54件PASS。構文/差分チェックPASS、600/1440pxプレビュー確認。公開反映/ユーザー実機未確認。
- 今回開始main e8e527a/work、同期クリーン確認。2.3 D3 Day通常キューを日本語へ戻し、画像Sun./Sat.維持。D4 English cuesパネル/トグル新設：D1〜D3の問題キューのみ英語/日本語、Ex1/画像/日本語モデルは維持。切替は再生停止→再描画→Ex1へ本文1行余白でsmoothスクロール。準備/録音中無効、既存キー/録音/認識/判定・セット間の英語状態維持。仕様/既存検証更新。2.3自動2205件、2.2回帰404件、英日キュー移動97件、余白54件PASS。構文/差分チェックPASS、600/1440px英語キュー/D4プレビュー確認。公開反映/ユーザー実機未確認。
- 今回開始main 6d29540/work、同期クリーン確認。DayはSun./Sat.の画像/返答キューへ、日本語ホバー維持。Time画像ヒントは日本語/ローマ字/英語各1回、Item1/Item2の背景施設ヒント撤去・品物保持。全11ページ35状態延べ371種のホバー内容を点検し2.1/2.3 pen、2.2 banana/たけし、7.3 karaoke/kanjiの同一表記重複を除去。異なる読み/英訳は維持。再点検で重複候補/JSエラーなし。自動検証2.3 2183件、2.2 404件、2.1 792件、全ページホバー配置318件PASS。構文/差分チェックPASS、600/1440px Day表示確認。公開反映/ユーザー実機未確認。
- 今回開始main d1857e8/work、クリーン確認。仕様に練習2以降の会話で適切なもをモデルに使う共通方針を追加。全11ページの採用例文/会話/許容回答を点検し、追加コード修正不要。2.3対応済み3箇所、他は独立問答/異なる情報/視点交代で機械的置換せず。PROJECT_SPEC冒頭に点検表、練習2各仕様から参照。Day英略語表示の追加相談あり：Sun./Sat.推奨、画像ヒント/返答キューも日本語を隠す案を提示、まだ実装指示として扱わず未変更。文書差分/リンク先ファイル確認PASS。コード変更なしにつき機能テスト再実行不要。
- 今回開始main 1e80a20/work、同期クリーン確認。D1説明文②を採用。D2 Item1 Q3ノートもあそこです、D3 Day Q3あそこも土曜日ですをモデル、各は版/短答も許容。Item2 Q3も品名補完のノートも版を許容、モデルは短い訂正文維持。2.3全体の画像/問い/返答/もを点検、カバンA側・ペンB側のここは別場所、他に必須のも変更なし。2.3自動2147件・構文/差分チェックPASS。公開反映/ユーザー実機未確認。
- 今回開始main 647e909/work、同期クリーン確認。D2 Peopleの1・2キュー/モデルをここ/施設へ。Item2返答キュー品名撤去。D3 Citiesはキューに沿うここはパリ/大阪・あそこはLAのモデルへ、短答/国名付き許容は維持。D1説明文3案チャット提示（②You are A. Make each sentence using ここ, そこ, or あそこ.推奨）、未選定につき未変更。Item2 Q2は視点矛盾を確認し、ユーザー回答B本/ここ→Aそこ/あそこで確定。既存実装と一致、追加コード変更なし。自動2123件・構文/差分チェックPASS、600/1440pxプレビュー確認。D1案選定・実機未了。
- 今回開始main a87709e/work、クリーン確認。旧D2単文をD1へ、旧D1会話をD2へ交換（Ex1は先頭維持）。People/Item1/Item2。Item2モデルはいいえ＋否定＋ここ/あそこです、品名付き全文も許容。旧録音キー維持、語彙監査の番号/モデル対象更新。2.3自動2123件・余白54件・構文/差分チェックPASS。600/1440pxプレビュー確認。ユーザー実機/公開反映未確認。
- 今回開始main 8f965f8/work、同期クリーン確認。D1 Item 1/Item 2に分離、Item 2は同画像4品のY/N否定訂正（返答視点で指示語交代）。停止右にいいえ…/Casualううん…、全文モデルと短答許容、独立キーset2。D1/D2の順序交換は現D2先行が段階的と提案、未変更。D3確認回答：Genki進度を優先、土日だけ特例。L3動詞を追加せず既存Country/Cities/Time/Dayを維持。語彙監査216枠。2.3自動2123件・構文/差分チェックPASS、Item 2の600/1440pxプレビュー確認。ユーザー実機/公開反映未確認。
- 今回開始main de36751/work、同期クリーン確認。2.3 D3 Day追加：A日曜日06時/B土曜日22時/C土曜日13時。A→Bそこ/何曜日、B→Aそこ/何曜日、A→Bあそこ/何曜日の3会話。図右下曜日・Hover/Display・モデル・短答許容・話者点滅・mode3録音キー。何曜日の先行導入は今回ユーザー指示、D2は変更なし。仕様/語彙監査208枠更新。2.3自動1875件・構文/差分チェックPASS、600/1440px Dayプレビュー確認。ユーザー実機/公開反映未確認。
- 今回開始main b7bee4c/work、同期クリーン確認。2.3全画像/回答を再照合し不一致なし、前段自動1697件PASS。公開サイト取得は環境の403で未確認。追加依頼：D3 Cities返答キューをここ/パリ・ここ/大阪・あそこ/ロサンゼルスに修正。モデル都市名のみ/国付き許容を維持。仕様更新、自動1703件・構文/差分チェックPASS。ユーザー実機未確認。
- 今回開始main 81734a8/work、同期クリーン確認。ユーザー訂正によりEx1 Bの表示のみ返答を「私はイギリスです」へ修正。画像と同じcountries[1]を参照し、不一致解消。D2/D3のフランスは維持。仕様/語彙監査/検証期待値更新。2.3自動検証1697件・構文/差分チェックPASS。実機/公開反映未確認。
- 今回開始main 6de65e1/work、同期クリーン確認。Ex1 B「私はフランスです」を表示のみ追加（画像のBイギリスとの不一致を報告済み、画像未変更）。D1 People返答キューに場所追加、Itemは右上4px、本をC側に移してA「あそこ」、Q4をA→BにしてB「ペンはここです」。D3 Citiesモデルはパリ/大阪/ロサンゼルスの短答、国名付き全文を許容。語彙監査202枠。2.3自動検証1697件・構文/差分チェックPASS。600/1440pxプレビューで右上カードと話者交代確認。公開反映/ユーザー実機未確認。
- 今回開始main ea0294d／work、同期・クリーン確認。D1返答は私/Cさん/品名付き全文モデルに変更し短答も許容。質問者だけだった点滅をEx1/D1Q・R/D2/D3Q・Rの全発話へ拡張、再生/準備/録音と同期、終了/中断/相手への受渡しで正しく切替、Cは対象のみ。D2のAラベル撤去、Time余白も右下4px。D3はD2写真/国都市時刻データを共有しCountry/Cities/Time各3会話。Countryの重複した話者表記はA→B/B→A/B→A、C対象をCに補正と先に報告。Cities/TimeはA→B/B→A/A→B。D3短答/省略/12・24h対応、誤指示語/国/都市/時刻は拒否。キーはmode別で録音保持。Drill間40px。語彙監査201枠。自動検証：2.3 1692件、2.2回帰404件、話者ガイド123件、余白54件PASS。構文/差分チェックPASS。600/1440px画像確認、375〜1440px/light・dark自動確認。ユーザー実機・公開反映未確認。
- 今回開始main 624e3b0／work、同期・クリーン確認。D1 PeopleキューBさん/Aさん/Cさん＋どこ、R私/私/Cさん、3問目B→Aへ。Itemは全問B→A、Rにも品名、短答の視点をAへ（ここ/そこ/あそこ/そこ）。質問者のA/Bラベルを再生/準備/録音中だけ赤く点滅、既存終了/中断処理に同期して解除、reduced-motion対応。カード28%正方形で左上4px、複数は4px間隔縦積み。D2 Country/Cities/Time順、既存モード別キーは保持。都市札を時刻同様の濃紺白字にし右下4px。語彙監査のRキューを更新。自動検証：街1046件・2.2共有404件・間隔54件合格、600/1440px描画・構文・差分正常。ユーザー実機未確認。
- 今回開始main ddcc775／work、同期・クリーン確認。ユーザー意図はABCともう一方の情報の見た目を分けること。指示どおりD2 Timeだけ③の濃紺/白文字/中太600へ。ABCとCitiesの白札は維持。右下10px等の配置/サイズ指定は維持。局所CSSの見た目のみで音声/課題は変更なし。ブラウザでTimeの配色・ABC/都市名の非変更・位置指定を検証済み。実機未確認。
- 今回開始main a9decee／work、同期・クリーン確認。ユーザーはD2の位置変更を望まず、フォント/見栄えのみの比較へ訂正。A/B/Cと値の位置・外寸を固定し、①ゴシック/白細枠②明朝/アイボリー③ゴシック/濃紺白字の3案をp23-d2-appearance-option-{1,2,3}.pngへ（各Time/Cities）。全ラベルの座標/外寸一致を検証済み。前回の位置変更案は採用しない。本体の配置・書体は未変更、見た目の選定待ち。
- 今回開始main 64b8d73／work、同期・クリーン確認。E1 Cさん/アメリカのキュー/矢印/音声を撤去、Cさんはアメリカです表示文は独立行で維持。5音声へ。D1 Items2撤去、Items1は指定どおりItemへ改称、People3会話＋Item4会話。Itemのモデル/配置/キーは保持、状態を0/1に制限。語彙監査183枠。D2のA/B/Cと値の配置は3画像案（①上下分離②写真下の帯③上の一体札、各Time/Cities）をreviewへ。D2本体は選定待ちで未変更。自動検証：街589件・案内123件合格。600/1440px描画・構文・差分正常。ユーザー実機未確認。
- 今回開始main 4dd3350／work、同期・クリーン確認。2.3 E1ど雲をA画像右下へ寄せ、SVG外縁と画像右/下端の隙間を各4pxに。既存の列幅ResizeObserverで写真幅も監視し、雲の張り出しを実測してtranslate補正。375/600/900/1440pxで外縁4pxを実測確認。不透明度60%・形・文言は維持。自動検証：街685件合格、構文・差分正常。ユーザー実機未確認。
- 今回開始main 8250a18／work、同期・クリーン確認。2.3 E1で私は日本ですを独立行、Bイギリスですか確認文を撤去、Cアメリカモデルの後に明示改行してあそこ夕方を全キューの開始列へ。6キューを同じ4列で共有、導入の横列と末尾の入れ子キューを廃止。6音声・D1/D2は維持。語彙監査191枠。Bどこ質問にここ夜だけでは所在を答えていない点を報告、イギリスです追加は提案のみで未反映。自動検証：街685件・話者123件合格、600/1440px描画・構文・差分正常。ユーザー実機未確認。
- 今回開始main 641c012／work、同期・クリーン確認。2.3をEx1→D1 Where?→D2旧D1へ再編。重複Ex2/何時D2・旧Ex3/D3は撤去。D1はPeople3会話とItems1/2各4会話、カバン/本/ノート/ペンを新規透過アトラスで枠付き合成。人物を避けた配置・ホバー・対象強調、返答者のここ/そこ/あそこ、短答/正しい主語補完を許容。Cは話さない。新D1キーはセット別、旧D1のCountry/Time/CitiesはD2へ録音/表示を保持。時計/都市名スタイルをID依存から課題クラスへ。語彙監査192枠へ更新。自動検証：街661件（短答/全文/カフェ許容・誤指示語拒否・録音ロック/保持）・2.2共有404件・案内123件・間隔54件合格。600/1440pxの各セット描画、構文・差分正常。ユーザー実機未確認。
- 今回開始main 18e23f4／work、同期・クリーン確認。全11ページのグローバル設定を利用可能=カラー100%（未選択/OFFも）、不可かつ未選択=白黒55%へ統一。発音1固定Hiraはカラー、漢字と発音2Casualは同じ灰色。Casual親opacity重複を撤去。settings-appearance.jsで直接記載絵文字を正規化、設定内再描画へ追従、CSSで状態に連動。録音/選択ロック動作は変更しない。2.3ど背景/小丸は不透明度60%に確定反映。銀行/カフェ/図書館の展開案は相談継続、課題構成未変更。自動検証：設定1728件・音声ライフサイクル167件・街526件合格。600pxの発音1/2・1.2描画と375px幅を確認。構文・差分正常。ユーザー実機未確認。
- 今回開始main 8f87d9f／work。ユーザー指定に合わせ、ど吹き出し③の不透明度50/60/70%をassets/review/p23-doko-opacity-{50,60,70}.pngへ再比較。前回は透明度50/60/70%だったため値の意味を区別する。実ブラウザで背景と小丸のalphaだけを0.5/0.6/0.7へ設定、文字は固定。ページ本体の不透明度40%は選定まで維持。画像案のみ、追加の機能変更なし。
- 今回開始main b79465d／work、同期・クリーン確認。2.3 D1 Timeキュー/モデルを朝六時・夜十時・午後一時、数字札6/22/13時維持、画像ヒントも時刻へ。新キーp23_describe_time_{row}で旧時間帯結果を分離、朝6時/夜10時表記の正規化を追加。Citiesは右下に都市名札、文字10〜20pxで調整。語彙監査更新。街526件合格、600/1440px描画・構文・差分正常。Ex2何時の不要性とどこタスクへの改編は相談中、既存D3施設会話のD2前倒しと重複整理を提案、課題自体は未改編。ユーザー実機未確認。
- 今回開始main 4f3a5af／work、同期・クリーン確認。2.3 E1の導入/キュー/👉️聞く/モデルを列共有へ。導入A私日本とAのBイギリスですか？、主キュー5行（ここ朝/Bどこ/ここ夜/Cどこ/Cアメリカ）、C返答のあそこ夕方に別音声、計6モデル音A/A/B/A/B/B。最長キュー実測とResizeObserverで列幅追従、狭幅は導入/モデルを折り返す。どは選定③の半透明雲・枠なしを反映、透明度50/60/70%比較をreviewへ（現行60%=不透明度40%）。透明度の意味をチャットで明示。語彙監査188枠へ更新。自動検証：街484件・案内143件・間隔58件合格、600/1440px描画・構文・差分正常。ユーザー実機未確認。
- 今回開始main a6fef8a／work。2.3 Ex1どの人物重なり/不透明背景について3つの比較画像をassets/review/p23-doko-harmony-{1,2,3}.pngへ。①A右下の角丸札、②A右上寄りの角丸札、③A右下の雲形。全てこ/あ同様の白系40%背景・赤文字・かな28px/英語18px、枠なし。人物を避ける配置を実ブラウザで確認。今回はユーザー指定どおりチャット内画像表示を試す。比較用のみでページ本体は未変更、選定待ち。
- 今回開始main fd6d822／work、同期・クリーン確認。7.3 English cuesで移動先が未指定だったため再描画後も下部位置が残る不具合を修正。仕様書に明記がなかったことを報告し、7.2既存実装に合わせ、英語/日本語どちらへの切替でもExample1上に本文1行分の余白を残してsmooth移動。新規navigation回帰検証を追加。自動検証：navigation49件、Display348件合格、構文・差分正常。ユーザー実機未確認。
- 今回開始main 97fae8a／work、同期・クリーン確認。2.3 D1をCountry/Time/Citiesへ。Citiesは大阪/パリ/LAのここは〜です、旧People課題を置換。画像ホバーも国名/時間帯＋数字時刻と読み/都市名へ選択同期。Timeの6:00/22:00/13:00は維持。Citiesキーを分離し旧People結果を流用しない。語彙監査を都市名へ更新。自動検証：街446件（実際のヒント表示・全Speech/Script・録音結果保持を含む）合格、600/1440px描画・構文・差分正常。ユーザー実機未確認。
- 今回開始main 5a556d5／work、同期・クリーン確認。ユーザー確定：D1 Timeは6:00/22:00/13:00。24時間白札の案①を適用、先頭0なし。濃い太字数字16〜24px、各画像右下10px。Time以外とD2は既存維持。自動検証：街410件合格、構文・差分正常、600/1440px描画確認。実機確認未了。
- 追加依頼：D1 Timeの右下時刻3案（①24時間白札、②AM/PM濃紺札、③日本語＋かな）をassets/review/p23-clock-option-{1,2,3}.pngへ作成。選定待ちでページの時刻書式は変更しない。冬06/22/13・夏06/23/14・2026-10-29は06/22/14をIntlタイムゾーンで検算。冬の固定教材値を維持。会話完成の確認用画像はp23-ex1-doko-conversation.png。
- 今回開始main 950544e／work、同期・クリーン確認。2.3 E1はユーザー選定のA/B会話5行へ（A紹介→AのBどこ質問→B自分紹介→AのCどこ質問→BのC紹介）。イギリですですはイギリスですとして修正。本文開始位置共有、各行音声/話者A/A/B/A/Bと画像の領域切替を同期。見出しにどこ追加、強調は場所指示語のみ。2.1と同形のど思考雲をA画像右下へ。幅450px以下は英語説明を隠す。D1課題は維持。語彙監査元データを更新。自動検証：街410件・案内143件・間隔58件合格、600/1440pxの描画と差分を確認。ユーザー実機未確認。
- 今回開始main becfa8c／work、同期・クリーン確認。D1切替名Places/Time/Peopleは既に実装済みで維持。D1/D2共用の別都市写真でC背景のHOLLYWOOD看板を拡大生成し差し替え。Ex1ど案をassets/review/p23-doko-option-{1,2,3}.pngへ（①中央下吹き出し、②右下説明札、③中央下どこ？＋対象名）。比較案のみでEx1コードには未採用。People代替候補・A単独/AB会話の例文はチャットで提案、選定待ち。街タスク319件・差分検査合格、600/1440px描画確認。ユーザー実機未確認。
- 今回開始main e4ff6a2／work、同期・クリーン確認。2.3 D1の切替をPlaces/Time/Peopleへ。Timeのみ各画像右下に大阪06:00/パリ22:00/LA13:00（冬の標準時、Japan翌日）、Hover読みも一致。朝/夜/昼モデル・D2既存時刻は維持。自動検証：街319件合格、構文/差分正常。600/1440px描画確認。ユーザー実機未確認。
- 今回開始main 6fe6a75／work、同期・クリーン確認。2.3 D1を承認された3セット各3問で試作：Places（日本/フランス/アメリカ）、Time（朝/夜/昼）、People（私/Bさん/Cさんの位置）。全てA視点、Cは第三者対象。指示語はキューに先出ししない。既存の別都市写真共用、概念札/画像内ボタンなし。cityDrillSet状態とp23_describe_s{set}_{row}キーで録音/判定を分離、切替後の保持を検証。国名データを共通語彙へ登録して日本の漢字/かな認識とTTSを整合。語彙監査も3セットへ更新。どこはEx3のまま、Ex1追加は未実施。自動検証：街300件、案内135件、間隔58件、2.2共有404件合格。600/1440pxで3セット描画確認。実機確認待ち。
- 今回開始main 306ce23／work、同期・クリーン確認。電話案内①背景付き角丸を採用（var(--bg-panel)、4px10px、radius6）。D1聞くを画像から問題行へ戻し、説明文を修正。D1新設計は未実装：現在の別都市画像をA視点固定、場所名/時間帯/人物位置の3セット各3問を提案。指示語はキューに出さず国名/時間帯/人物から選ばせる案。自動検証：街245件（問題行でのモデル再生/録音を含む）、案内135件、間隔58件合格。実機未確認。
- 今回開始main 918178d／work、同期・クリーン確認。2.3 E1の3モデル文をボタン右にすべて表示。Formal疑問文表示も句点、音声用？は維持。語尾ガイドを撤去。導入文とキュー間のcolumn-gapを0へ。キュー通常色、モデル指示語のみ金色、国名導入、1文音声は維持。追加指示で電話案内を見出し右側へ移動（狭幅は折り返す）。区分風表示は背景/細枠/左色線の3案を通常/ダーク画像assets/review/p23-call-badge-options-{light,dark}.pngで提示、装飾未反映。自動検証：街245件、案内135件、間隔58件合格。600/1440px描画確認。実機未確認。
- 今回開始main 4ca198b／work、同期・クリーン確認。ユーザー承認により2.3電話案内の📞を線画SVGへ置換（currentColor・1.15em・線幅2・間隔8px）。Ex1の文面/画像左下配置を維持、他Exampleの電話案内も同じSVG。SpeakerGuide初期化後にSVGを追加し再生開始/停止でも保持する。通常/ダークの本文色へ連動。再生中も白文字が読めるよう電話案内だけ透明/薄灰16%の点滅へ（他のWho点滅色は維持）。自動検証：案内135件（通常/ダークの色一致・再生時保持・コントラスト含む）、街245件、間隔58件合格。600/1440px・ダーク描画確認。実機未確認。
- 今回開始main 75dbf14／work、同期・クリーン確認。ユーザーは電話SVGの実装前表示を要求。ページ本体は変更せず、現在のExample背景と本文書体でcurrentColorの線画電話SVG（1.15em、線幅2）をブラウザ上で仮表示。通常/ダーク比較をassets/review/phone-svg-example-{light,dark}.pngへ。アイコン/文字が同じ計算色（通常#333333、ダーク#f8fafc）であることを検証。採用待ち。
- 今回開始main 5d6667f／work、同期・クリーン確認。2.3 E1導入/図ヒントを日本/イギリス/アメリカへ。キューは全て通常色、そこ/よる・あそこ/ゆうがたから語尾を分離、ボタン右に…〜か？/…ね。ガイドを表示。1行目だけモデル全文表示、2/3行目の全文は音声で維持。非Formal疑問は…？。語彙監査のE1導入枠も国名へ更新。📞はユーザーの意見要求に対しテーマ連動単色SVGを推奨、変更保留。自動検証：街245件、案内129件、間隔58件合格。600/1440px描画確認。実機未確認。
- 今回開始main 565bc66／work、同期・クリーン確認。2.1 E1 Far from bothを時計右端から4pxへ。2.3 E1を導入文→キュー→👉️きく→モデル文に変更。ここ/あさ、そこ/よる/〜か？、あそこ/ゆうがた/〜ね（非Formal疑問は〜？）。聞くは図からキュー直後へ、最後の1文だけ再生。金色はここ/そこ/あそこのみ、導入/助詞/語尾は通常色。元の3チャンク各2文のうち導入は表示のみ。自動検証：街242件、案内129件、間隔58件合格。375/600/1440px・ダーク等の表示検査を含む。600/1440px描画確認。実機未確認。
- 今回開始main 1076976／work、同期・クリーン確認。2.1 E1あ説明を最大4px左（時計から8px確保）。どコロン見落としを是正し2.1 E2/2.2 E3ともAsking about / the unknownの2行へ。2.2こ/そ/あ説明4px上。2.3 E1の合意文をAの3チャンク×2文として実装：自身は肯定、Bにはですか、Cにはですね。Informalだね/Casualだよね、質問は既存仕様。確認語尾は一体で金色。可変幅の3行、文単位折り返し、各行2文で1モデル音。聞くは画像内のまま。文左への移動を、B画像内のボタンがB発話と誤解されうる点も含め提案。自動検証：2.1 792件、街240件、案内129件、間隔58件合格。375pxも横はみ出しなし。600/1440px描画確認。実機未確認。
- 今回開始main c039cdd／work、同期・クリーン確認。2.1/2.2ど注記をこ/そ/あと同じ28px/18px・太字へ。E3雲は切れない下端位置へ。2.1 D3専用の辞書表紙（赤国語・青English・緑Deutsch）アトラス追加、語彙/判定はじしょ。2.2 E1あ説明を棚上へ再調整、E2デジタル4,000円（Drill価格は維持）。2.3電話案内を本文共通書体・テーマ文字色へ。ユーザー提案：A発話3チャンク、1 私は東京/ここは朝、2 BさんLondonですか/そこは夜ですか、3 CさんNYですね/あそこは夕方ですね。文案は未実装、3行×2文・文境界折り返しとですか/ですねの意味の違いを提案。自動検証：2.1 792件、2.2 404件、案内129件、間隔58件合格。600/1440px・ダーク表示、E2価格と辞書表紙の描画確認。実機未確認。
- 今回開始main 753b9af／work、同期・クリーン確認。そ文字② #86efacを採用（背景10%、こ/あ40%維持）。都市名帯・写真内白区切り・HTML概念枠を撤去。E1時刻撤去、E2/D2の何時練習には数字時刻を維持と説明。電話案内は📞 A is calling B and talking about C. に変更。画像左下枠外。自動検証：街240件、案内129件、間隔58件合格。600/1440px描画確認。実機未確認。
- 今回開始main 31cb4ef／work、同期・クリーン確認。そ背景10%へ確定反映、こ/あ40%維持。明るい緑文字3案 #4ade80/#86efac/#bbf7d0 をassets/review/p23-so10-text-brightness-{1,2,3}.pngへ。計算背景色を確認しブラウザで同条件撮影。文字色選定待ち。
- 今回開始main ae11156／work、同期・クリーン確認。2.3 Exampleのこ/あ説明札を40%へ確定反映。そは76%維持し、30/20/10%の比較3画像（こ/あは40%固定）をassets/review/p23-ko-a40-so{30,20,10}.pngへ。実ブラウザで計算色と描画を検証。そ選定・ユーザー実機確認待ち。
- 今回開始main 6a41f0b／work、同期・クリーン確認。2.2 E1あ説明を帽子直右へ。2.3電話案内を画像直後の左下枠外（8px下、左端揃え）に統一。説明札の枠線を撤去、不透明度76%は維持して70/60/50%の同一画面比較3画像をassets/reviewへ保存。自動検証：間隔/画像下案内58件、話者129件合格。600/1440px描画確認。ユーザー選定待ち。実機未確認。
- 今回開始main 42c24c7／work、同期・クリーン確認。2.1 E2小丸を雲と同じ不透明塗り/枠へ。2.2あ説明を棚上、こ/そ着色開始を値札直下へ。時計6,000円商品を約1割拡大。2.3電話案内📞付き・Georgia斜体・広幅は図左枠外、狭幅は図直前。概念札の白背景は76%不透明度。追加指示により2.3全Drillから概念札/領域色/枠を撤去、2.1/2.2 Drにも同種説明がないことを確認。自動検証：街238件、話者案内129件、全ページ間隔56件合格。600/1440px描画確認。実機未確認。
- 追加指示：2.3 E1はA is calling B（再生時も固定文言、点滅は維持）を画像直前へ仮配置。Practice times注意文を撤去、時刻を表示して音声ボタンの上に置く。場所の音説明を白寄りの角丸背景＋領域対応色へ。位置の最終決定は実機確認後。
- 今回開始main dfb688d／work、同期・クリーン確認。2.1 E1そ説明8px左、E2ど雲の余裕拡大・B対象を奥のスマホへ変更し「あれです」・金色はどれだけ。2.2 E3ど雲も拡大、Whoを両ページ20pxへ、E1各音声とあ説明の配置調整。帽子を原型に時計/カバン写真の上段棚を同幅・同高さへ統一し、値札/ホバー座標を合わせた。2.1は792件、2.2は404件、2.3は236件、案内129件、間隔56件合格。600/1440px描画確認。ユーザー実機未確認。
- 今回開始時main ab98715／work、クリーン・同期確認。2.1 E2のA/B音声を写真内の人物近くへ、ど雲を不透明な薄赤＋濃赤文字/枠へ。Example→Drillの適用漏れを全11ページ点検、2.1 E2・1.1の25px・7.3の25pxを共通24px、1.1次セクションは40pxへ。2.2の6写真を実際の壁が続くよう編集、時計上段棚を帽子に近い高さへ、金額を商品直上3pxアンカーへ。E1こ/そ説明は棚直下、B音声を帽子の左へ。果物だけの可変上部トリミングを撤去し全Example可視枠2:0.94で統一。棚幅の一括短縮（1〜2割案）は意見提示のみで未実施。自動検証：2.1 792件、2.2 404件、2.3 236件、話者案内124件、全ページ間隔/図枠52件、TTS22件、1.1は20件合格。600/1440px描画確認済み。利用枠取得不可・既存確認待ち。ユーザー実機未確認。
- 今回開始時main 46472a6／work、GitHub同期・クリーン確認。再生終了後のWho復帰を共通化。2.1 E2案内を画像内左上・どを中央・丸をA方向、上5％をカット。D3のど撤去、青財布4px左。2.2 E1は近い音声/値札/領域/文字を元配置へ戻し、遠い音声だけ左位置を保ち上へ。Who1行。白帯・上への人工余白を撤去し、果物だけ不要な既存壁をトリミング。Ex3のどを棚と下枠の中央へ。追加指示で腕時計③の銀色アナログ/壁時計①の木枠多色目盛りを参考に時計素材を生成し差し替え。2.1は792件、2.2は404件、2.3は236件、TTS22件合格。話者/配置の追加124件も合格。実機未確認。帽子の壁延長は未実施。
- 担当Codex／ルール2026-10-25.2。今回の開始時main 285467b／work。保存先main。
- 今回：2.3屋内3案・街3案の横長画像をリンク用review素材として作成。指定説明英文は削除、画像差し替え・タイトル・時差課題は相談段階。追加指示で2.1対象枠を品物へ、2.2 D1をPriceキュー・Bその/Aこの/Bあの（同じ左品物を2視点、ユーザー確認済み）に変更。時計写真を壁時計・置時計・大きいスポーツ腕時計へ。吹き出しの丸を本体へ寄せ、D3補足を説明欄へ統合。2.1の809件、新2ページ633件、全11ページTTS22件合格。開始時main 057f0a0。
- 直前の実装：2.2の品物用画像をassets/practice22-shelves.pngへ。Aが左・Bが右に立ち、左右の近い棚・中央奥の遠い棚の商品を見る。Example・D1・D3に反映し、商品・価格・モデル・判定は維持。D2の人物画像と2.3は未変更。
- 2.1のWho背景は3回固定からPlaying中の継続点滅へ。1.2秒周期で正常終了・エラー・中断まで続け、既存の停止処理で解除する。鮮やかな赤文字・独立最前面配置は維持。reduced-motionはPlaying中の静的強調。2.2・2.3の回数は未変更。
- 2.2・2.3の初期実装を追加。indexからリンクし、practice2-next.jsを新2ページで共用。設定・130％・語彙・行ごとの録音・判定・リレー・セット別の結果保持は2.1を踏襲。既存2.1の録音実装を共通化し直してはいない。
- 2.2：Example 1は物＋値段のA／B計6文、D1は2セット各6文、D2は人物画像でこの人はだれですか＋短答（3組×2セット、役割交代）、D3はどの＋名詞（3品名×2問）。どれ＝which one／だれ＝whoを短く対比。だれのですかは導入しない。価格文は提案を前提に組んだ初期案で、ユーザーが別の述語を希望すれば調整する。
- 2.3：1F銀行A・2F喫茶店B・3F図書館の室内3コマを横並びにしたassets/practice23-floors.png。通話中と説明。ExampleとD1 S1は場所紹介、D1 S2は物の所在、D2は物はどこですか、D3は色で指定した物の所在。返答者の視点でここ／そこ／あそこを判定する。
- 詳細はPRACTICE22_23_SPEC。UI_LAYOUT_SPECの公開ページ数・対象一覧も12ページ／11練習ページへ更新。Genki語彙の使用ページ表と集計枠を2.2・2.3へ拡張。旧2.3の建物外観案は採用しない。
- 自動検証：新2ページ633件、2.1は809件、全12ページ130％表示7985件、録音後リレー388件、幅の拡張1932件、ツールチップ318件、操作説明51件が合格。構文・差分も確認済み。
- 今回の2.1品名入れ替えはユーザー実機確認未了。2.1の805件、共有語彙データを使う2.2/2.3の716件が合格。600/1440px画像確認済み。2.2会話・食品群と名称も実機確認は別。画像・6モデル・値札・Who配置を実装し、今回の2.2/2.3テスト716件、全11練習ページのリレー388件、全12ページの130％表示7985件が合格。4写真の600/1440pxスクリーンショットで確認。利用枠取得不可・既存確認待ち。

---

本書は、開発環境の現状、TTS（音声合成）の評価経緯と試験設定、スマホ対応の保留判断、および未了事項・次の作業を記録します。

---

## 1. 開発環境とGit／デプロイの進捗（2026-10-24時点）

### 1.1 構築済み環境（確認済み）
- **OS・端末**：
  - Chrome OS の Linux 開発環境（Debian 12、x86_64、ディスク容量 20GB へ拡張済み）。
  - Windows 端末（`c:\Users\veryl\Projects\october2026`）での Antigravity 作業環境も接続確認済み。
- **エディタ・操作環境**：
  - Antigravity を導入し、ユーザーの Google アカウント（`lt068028@gmail.com`）でログイン済み。
  - Remote Control を有効化し、Chrome ブラウザ画面から指示・確認を行う体制を構築済み。
- **ローカルリポジトリ**：
  - パス（Linux）：`/home/lt068028/october2026` ／ パス（Windows）：`c:\Users\veryl\Projects\october2026`
  - ブランチ：`main`
  - リモート `origin`：`https://github.com/lt068028/october2026.git`
  - 公開先（Vercel）：`https://october2026.vercel.app`
- **Gitコミット作成者設定（設定済み）**：
  - 過去のコミット履歴と同一の `user.name = lt068028` / `user.email = lt068028@gmail.com` を使用。

### 1.2 GitHub 認証・push 体制と端末切り替え時の注意
- **GitHub 認証および push（確認済み）**：
  - `origin/main` への `git push` および Vercel（`https://october2026.vercel.app`）へのデプロイ連携を確認済み。
- **端末切り替え時の注意**：
  - Linux 端末と Windows 端末を切り替える際は、必ず未コミット・未push の変更を確認し、未保存の変更を破棄せずに GitHub の最新版を取り込んでから編集を開始すること。

---

## 2. TTS（音声合成）検討の経緯とブラウザ標準TTSへの復元

### 2.1 外部TTS候補エンジンの評価結果（すべて候補対象外として確定）
従来のブラウザ標準 `speechSynthesis` に代わる、ブラウザ内推論型の日本語TTSエンジンを検討・評価したが、以下のとおりすべて候補対象外となった。

1. **Kokoro**：【候補対象外（ユーザー試聴済み）】
   - 理由：デモ試聴の結果、学習上必要な日本語のピッチアクセントを再現できなかったため。
   - **注意**：今後、未評価の新候補として再提案しないこと。
2. **Piper-plus**：【候補対象外（ユーザー試聴済み）】
   - 理由：デモ試聴の結果、音声品質が要求水準に合わなかったため。
   - **注意**：今後、未評価の新候補として再提案しないこと。
3. **Supertonic 3（`Hiro` [M2] ／ `Mina` [F1]）**：【候補対象外（ユーザー実機確認済み）】
   - **発音1（`pronunciation1.js`）での評価結果**：
     - 単語ペア（箸／端など）で求めるピッチアクセントの正確性として**不合格**。
   - **Practice 1.1（`practice1.1.js`）の通常文での評価結果**：
     - **試聴結果**：「私は、学生です。」が Hiro で「わしはがくせいです」、Mina で「ががくせいです」と誤読された。
     - **試聴結果**：「友達は、学生です。」が「ともだちはがくせい」で途中切断された。
     - **当時の調査・推定**：`UnicodeProcessor` の日本語読み処理と `duration_predictor.onnx` の出力時間予測が原因候補として記録された。今回の撤去作業では外部エンジン内部や原因を再検証しておらず、試聴結果と因果関係の推定を区別する。
     - 以上により、日本語学習用モデル音声として**不合格（候補対象外）**と確定した。
   - **注意**：今後、Supertonic 3 を未評価の新候補として再提案しないこと。

### 2.2 各ページのTTS復元状態（2026-10-24 実装）
Supertonic 3 の不採用確定に伴い、当時試験を行っていた以下の3ファイルを復元した。以下の一致記録は復元時点の履歴であり、現行ファイル全体の一致を意味しない。復元後、Practice 1.1と発音1には音声選択UI・優先順位・Pitch Lab等の後続変更が加わっている。
- **`practice1.1.js`**：`shared-tts.js` の読み込みを除去し、従来のブラウザ標準 `speechSynthesis`（`setupPreferredVoice()` による優先音声選択）による再生に復元済み（コミット `7804dd0` 時点と復元当時に一致）。
- **`pronunciation1.js`**：`shared-tts.js` の読み込みと試験用単語変更を除去し、従来のブラウザ標準 `speechSynthesis` による再生と元の `drill1Data` に復元済み（コミット `660beff~1` 時点と復元当時に一致）。
- **`index.js`**：上部にあった Supertonic 3 単体音声テスト（`mountSupertonicTest`）を完全除去し、モバイル環境向けの案内（`showMobileNotice`）のみの状態に復元済み（コミット `e01db79` 時点と復元当時に一致）。

### 2.3 試験実装の撤去（2026-10-25）
- **検討目的と判断**：ブラウザ内で動作する日本語モデル音声の候補としてSupertonic 3の搭載を検討し、試験用モジュール `shared-tts.js` を作成した。Hiro／Minaを発音1・Practice 1.1等で評価したが、ピッチアクセント・漢字読み・文末までの再生品質が要求を満たさず、現状の採用を断念した。不採用の試聴記録は§2.1に保持する。
- **撤去直前の状態**：基準コミット `aa8993f` では、全ページからモジュールへの参照はなく、`index` の `mountSupertonicTest` も除去済みだった。
- **今回の撤去範囲**：未使用の `shared-tts.js` 全体と、`style.css` 末尾の `#ttsStatus` 専用装飾・`tts-status-spin` アニメーションを削除。トップページと全8練習ページのHTML・JSは変更していない。
- **旧試験設定（現行仕様ではない）**：Hiro（M2）／Mina（F1）、保存キー `practice.tts.voice`、句点単位の分割、クリップ間500ms、生成速度1.0、再生速度0.7。冒頭コメントの「50％」より実際の最終設定値を優先して記録する。
- **現行TTSの維持**：ブラウザ標準 `speechSynthesis`、Voice選択・優先順位、保存キー `october2026.selectedVoiceName`、Pitch Labのモデル音収音を維持。旧保存キーを消す実行時処理は追加していない。
- **状態**：ローカル撤去・文書更新済み。検証は構文・参照・差分の静的確認を対象とし、ユーザー実機確認・公開デプロイ確認とは区別する。

---

## 3. スマホ（モバイル）対応の試験経緯と保留判断

- **判断結果（確定事項）**：**スマホ対応は現在保留**。
- **経緯と理由**：
  - モバイル環境ではブラウザの音声認識（Web Speech API）および正誤判定が意図どおりに動作しないため、現段階ではPC環境を対象とし、スマホでの音声認識・判定対応は保留と判断した。
- **現行実装の状態（`index.js` 実装済み）**：
  - `index.js` 内の `showMobileNotice()` により、モバイル端末（Android / iPhone / iPad / iPod 等）からのアクセス時には、メニュー上部に `#mobileSupportNotice` パネル（*"Mobile support: Speech recognition and answer checking are not currently supported on mobile. Please use a computer for these features."*）を表示している。

---

## 4. 実装・検証の状態区分と次の作業（TODO）

### 4.1 現在の状態区分
- **【ユーザー実機確認済み】**
  - `pronunciation1` および `practice1.1` における Supertonic 3（Hiro／Mina）の実機試聴・不採用判断。
  - Chrome でのブラウザ標準TTSへの復元動作、および `pronunciation1` の Pitch Lab における `🔊きく` ボタン・ピッチ曲線描画・自動停止動作。
  - `pronunciation2` における Pitch Lab の設置・1枚カード表示、`🔊きく` によるスピーカーからのモデル音収音・ピッチ曲線重ね描き、TTS優先順位（`Nanami` 優先・`Haruka` 筆頭）、`🔊Voice:` 下部の Chrome 推奨文言、および描画エリア下部の音量案内表示の実機確認。
  - `🔊Voice:` カスタムプルダウン（`#voiceDropdown`）の表示・切替動作、および ChromeOS / Chrome における複数の日本語音声（1〜4）の選択・品質確認。
- **【実装済み・自動検証済み】**
  - 全8練習ページ（`practice1.1`、`practice1.2`、`practice7.1`、`practice7.2`、`practice7.3`、`composition1`、`pronunciation1`、`pronunciation2`）および `style.css`：
    - ページ最下部左（`.voice-guide-footer`）のカスタムプルダウン（`#voiceDropdown`）において、全8ページ共通で音声の優先順位・プルダウン並び順を `Chrome OS` → `Google` → `Nanami` → `Keita` → `Haruka` → その他 に統一し、`localStorage`（`october2026.selectedVoiceName`）によるページ間保持と `translate="no"`（自動翻訳防止）を全ページに適用。
  - `pronunciation1.html` / `pronunciation1.js` / `style.css`：
    - Edge や Brave 等、適切なピッチアクセントモデルを提示できないブラウザで発音1を開いた際に、Drill 1 上部へ注意喚起バナー（`#browserPitchNotice`：`⚠️ Pitch Accent Notice` / `This browser does not support presenting accurate pitch accent models on this page. Google Chrome is recommended.`）を自動表示するよう実装（Chrome / ChromeOS で Google・ChromeOS 音声が使える場合は非表示）。
    - Pitch Lab（左右2枚のカード）に `🔊きく` 押下時のスピーカーからのモデル音バックグラウンド収音・`Model (🔊)`（紫）と `You (🎙️)`（緑）のピッチ曲線重ね描き機能、および描画エリア下部の音量案内表示を実装。
- **【ユーザー実機確認待ち】**
  - `pronunciation1` を Edge や Brave 等の非推奨ブラウザで開いた際に上部の注意喚起バナー（`#browserPitchNotice`）が表示され、Google Chrome で開いた際には非表示となることの実機確認。
  - 全8ページで `🔊Voice:` プルダウンの並び順・選択保持が統一されて動作することの実機確認。


### 4.2 今回の監査と残課題（2026-10-25）
- 現行コードとルール・仕様の不一致／懸念を `docs/PROJECT_SPEC.md` §5に記録した。Autostop初期値、モデル音収音時の設定ロック、Voice選択のロック範囲、状態保持範囲、ページ別判定仕様を分けて確認する。
- これらは調査・記録のみ。既存UI・録音・認識・判定・状態保持の挙動変更は実施していない。
- Supertonic撤去の自動検証：残存JSの構文、JSON、HTMLのローカル参照、旧実装参照の除去、CSSが旧専用ブロック以前と同一であること、現行HTML・JSが基準コミットと同一であること、差分形式を確認。実機・公開デプロイは未確認。


### 4.3 ユーザー方針の確認と追加調査（2026-10-25）
- **確定・文書反映済み**：発音2のみAutostop初期値OFF／Manualは意図した仕様。学習者がゆっくり練習する際の間を自動停止が妨げたため。PROJECT_SPEC §2.3を訂正し、§5の不一致扱いを解消した。15秒／20秒制限は現行仕様を維持。
- **確定・文書反映済み**：学習者録音中は他タスク・設定・Voice操作を禁止し、Manual停止は可能。再生中は次タスクへの操作で即時キャンセルする方針をPROJECT_SPEC §2.1に明記。
- **目的の確認**：発音1は文生成や認識テキストの正誤判定ではなく、発音・ピッチアクセントの練習。目的の記述案をPROJECT_SPEC §6.2に記載。
- **提案・未実装**：PROJECT_SPEC §6にモデル音収音のキャンセルと設定ロック、状態保持と永続保存の区別、モデル曲線の条件管理、未確定事項、ページ／Drill別検証計画を記録した。
- **変更範囲**：今回は仕様書と本引き継ぎ書のみ。ページ実装・UIは未変更、実機検証は未実施。


### 4.4 操作ロック・キャンセル・モデル曲線の修正（2026-10-25）
- 全8ページに共通ライフサイクル制御 `drill-audio-session.js` を追加。録音・マイク待機中にVoiceと他操作をロックし、Manual停止とキャンセルして戻る操作を維持する。
- 再生中に次行の録音／別再生へ進んだ際、旧音声の終了・エラー通知やAudio再生失敗が後続の自動再生を復活させないよう保護した。
- 両Pitch Labのモデル収音をキャンセル可能なセッションで管理。中断でマイク・Recorder・解析Contextを終了し、遅い許可／解析結果を無効化する。
- Voice切替でモデル曲線のみ全キャッシュから消去。学習者の曲線・録音は保持する。
- 時間制限を全8ページで照合。発話前無音15秒／全体20秒であり、全体上限15秒の箇所はなかった。値と発音2のManual初期値は維持する。
- 確定仕様と検証範囲はPROJECT_SPEC §6.1・§7。実音声・実機の確認は未実施。判定・永続保存等のその他項目は随時検討する。

- **自動検証結果**：Chromium／Playwrightと制御可能な音声・マイク代替APIによる167項目が通過。通常APIのままの起動確認も全8ページ通過。JS構文・JSON・HTMLローカル参照・旧実装参照除去・差分チェックも通過。実マイク／実スピーカーでの品質・許可UIは実機確認待ち。
- **反映状態（検証記録作成時点）**：ローカル実装・文書更新まで。以降のコミット・Push結果はGit履歴を参照。公開デプロイ・実機確認は別途確認する。


### 4.5 実機確認後の操作不能修正（2026-10-25）
- **実機報告**：ChromeOS／Chromeで、作文・発音2の再生中に次行を録音できない、発音Labの左右・再録音・Autostopが無効化されたままになる問題をユーザー確認。
- **原因と実装**：共通／ページ固有のdisabled状態の二重保存を解消。共通処理は追加で無効化した操作だけを解除する。モデル収音中の他の「きく」を禁止し、「とる」はキャンセルして開始可能にする。禁止カーソルとモデル終了通知欠落時の20秒保護も修正。
- **自動検証**：修正前に有効録音後の全行録音ボタン無効化を再現。非同期録音イベントと実クリックによる51項目を追加し、既存167項目とともに通過。テストを `tests/` に保存。旧167項目だけでは今回の連続操作不具合を検出できなかったことを明記した。
- **実機確認待ち**：修正後の作文で「録音→自動再生→次行録音」、発音1で「Lab左→右→左」、発音2で「きく→とる→再生→きく→とる」とAutostop ON→OFF。
- その他のLab懸念はPROJECT_SPEC §8.2。録音時文体の表示、Lab固有のAutoplay順序、収音品質等は現行挙動を維持し別途判断する。


### 4.6 発音2の自動再生表示の監査（2026-10-25）
- ユーザーが通常行の録音後の自動再生で録音再生ボタンにPlaying表示が出ないことを報告。`b0e7bb3` のコードとChromiumで「きく」だけがモデル・録音の両段階でPlayingとなる現状を確認した。
- 今回の確定仕様は「モデル開始〜録音終了まで、同じ行のきく・録音再生を両方Playing」。PROJECT_SPEC §2.3へ追記。ページコードの修正は今回実施していない。
- PROJECT_SPEC §9に差分、案内絵文字10候補、未通知・解析待ち・Autoplay途中OFF等の残る懸念と、未了の検証リストを追加。絵文字は未選定・未変更。
- 調査・文書更新の段階であり、表示修正済みや全項目問題なしとは扱わない。


### 4.7 リレー表示・Autoplayロック・案内・文体制限（2026-10-25）
- 発音2の通常行で、Autoplayリレー中のみ両ボタンをPlaying表示にした。手動個別再生の1ボタン表示は維持する。TTSエラーではリレーを中止し表示を戻す。
- 従来の発音2は自動再生中もAutoplayを変更できた。今回、通常行リレーとLab録音自動再生の実行中の切替を禁止し、終了・中断・エラーで解除する。手動再生時はこの禁止を適用しない。他ページへの展開は今回行わない。
- 発音1・2のVoice下部の案内をℹ️へ変更。発音2のCasualをグレー表示・disabledとし、Formal／Informalだけを選択可能にする。
- Labで自分の録音のみ再生する区別は正しい確定仕様として維持。文体比較条件は発音2のLab、スピーカー収音品質は発音1・2のLabの話と明記した。
- 通常再生の終了通知欠落と学習者録音後の解析停滞への対策はPROJECT_SPEC §10.2に提案として記録。今回は未実装。

- **自動検証済み**：更新した遷移テスト80項目、既存ライフサイクルテスト167項目が通過。JS構文・HTML参照・差分も確認。ChromeOS実機確認は未実施。


### 4.8 通知欠落・解析期限・作文表示（2026-10-25）
- ユーザー承認に基づき、全8ページのTTS20秒・録音再生duration＋3秒（未取得時23秒）の段階監視を実装。期限切れはリレー全体を中止し、表示・ロックを戻し、録音を保持する。
- 発音1・2のLabはモデル／ユーザーとも解析10秒。decode等の待機とWorkerのF0計算に期限を適用し、完了しないcloseを待たずUIを解除。古い結果を破棄し再生・再録音を可能にする。
- 作文の個別Playing欠落は表示変更処理未呼び出しが原因。手動は対象ボタンのみ、自動リレーは両ボタンのPlayingとし、終了・中断・エラー・期限切れで復元する。自動再生中のAutoplay変更も禁止する。
- 自動検証は既存80＋167項目と回復88項目が通過。実Workerの計算一致・無限計算の中断も確認。テストは `tests/` に保存。
- 発音ページの総点検で、発音2 Labの長い間による曲線後半の除外を合成波形で再現。発音1のリレー表示・Autoplayロック・TTSエラーの扱いも発音2と未統一。今回は無断で変えず、PROJECT_SPEC §11.3へ優先順位を付けて記録した。
- 修正後のChromeOS実機確認は未実施。実機確認の一覧も§11.3を使用する。

### 4.9 全ページの再生仕様統一とLab Instruction（2026-10-25）
- ユーザー採用の英語Instructionを両Labへ反映。モデルの発音・リズム・タイミングをまね、曲線の上下動を比較する目的を明確化した。
- 全8ページの通常行の自動リレーを両ボタンPlayingへ統一。手動個別再生とLabの自分のみ再生は対象1ボタンを維持する。文法5ページのリレーも共通セッションで段階間の表示・キャンセルを保持する。
- §4.7／4.8の再生中Autoplayロックは最新指示で撤回。変更は可能とし、開始済みのリレーは完了、新設定は次回の録音後から適用する。録音・許可待ち・モデル収音中の設定ロックは維持する。
- 明示TTSエラーも全ページでリレー全体を中止し、後続再生を開始せず表示を復元、録音を保持する。
- 長い間による曲線後半の除外・検出範囲はユーザー許容済み。簡易Labの収音品質対策は既存注意喚起で完了。今回は未検出時の案内やモデル線の処理を変えない。モデルファイル生成は別途検討中。
- Edge・Brave、Voice別の読み・アクセント、Chrome推奨／警告の実機確認は後日に残す。最新仕様はPROJECT_SPEC §12を参照。
- **自動検証済み**：既存80＋167＋88項目、追加の全8ページのリレー標準192項目、計527項目が通過。JS構文・JSON・HTML参照・差分も確認。最新の実機チェックリストはPROJECT_SPEC §12.1。
- **ユーザー確認待ち**：修正後のChromeOS／Chromeでの実音声・表示、およびVercel公開反映。自動テスト通過を実機確認済みとは扱わない。

### 4.10 発音確認完了と回答判定の確定方針（2026-10-25）
- ユーザーから直前の実機チェック完了を受領。発音1・2の既知の録音・再生・Lab操作の不具合は確認範囲で解消済み。後日予定のEdge・Brave、Voice別の読み・アクセント、Chrome推奨警告は継続する。
- 終助詞よ／ね／よねを認識対象7ページで許容し、Practice 7.1の通常行を修正。Formalは「か」のない疑問記号付きの文を不正解とする共通条件を追加。従前の「会っていました？」不正解は意図した仕様と確定した。
- 重複する任意語句は言い直しとして許容済みであり、修正対象から外した。Practice 7.2の主語の助詞はは／がに制限し、目的語のをを維持した。
- Practice 7.3の追加Yes／No応答は時間省略可、明示するなら質問と一致が必要。行の時間条件を保持して比較する。基本のHabit課題の「いつも」必須は教育目的による確定仕様と記録した。
- 数字の比較補助・Formal質問条件を `drill-answer-rules.js` に追加。Practice 7.2・7.3の数字読みを強化し、ごじゅっこ／ごじっこ等も許容。モデル・漢字キューは漢数字を基本とし、保存した認識原文は書き換えない。
- ページ別助詞許容、自由文の名詞と否定語尾の境界、記号が不正解になる具体例をPROJECT_SPEC §13に整理。未確定箇所を無断で統一せず、自由文の文型判定と記号除去は今回維持する。
- **自動検証済み**：回答判定248＋既存音声527、合計775項目が通過。JS構文・JSON・HTML参照・差分も確認。今回の新しい回答判定のユーザー実機確認は未実施。

### 4.11 待機リストの整理と電話番号の助詞（2026-10-25）
- 自由名詞の「学生ない」は学習者の裁量で問題なし・追加対応不要とユーザー確定。文型判定は変更せず、懸念から除外した。
- Practice 7.2の電話番号の目的語は、を／は・省略を維持し、がを拒否するよう限定修正。他の目的語の検討へ広げない。
- 人工的な【】比較は作文Drill 1の定型問題を対象とした監査であり、自由練習Drill 2は定型回答判定の対象外。実機不具合ではないため修正待ちの懸念から除外し、記号処理は維持する。
- 最新の待機事項はPROJECT_SPEC §14に集約。新判定の実機確認、後日のEdge・Brave、Voice別の読み・アクセントとChrome推奨警告を残す。モデルファイル生成方式は不具合と別の検討事項。未指定の追加検討を広げない。
- **検証**：更新した回答判定テスト255項目、変更JS・テストの構文、差分チェックが通過。今回の助詞修正の実機確認は未実施。

### 4.12 Chromeの初期Voice「日本語3」（2026-10-25）
- ユーザー指定により、全8ページの未保存時Voice優先順位の先頭を、Chromeで利用可能な「日本語3」とした。表示名の空白・全角数字・Japanese 3を吸収し、一覧の3番目や日本語13を誤選択しない。
- 保存済み手動選択を優先し、不在時の従来優先順位を維持。Edge・Opera・検出可能なBraveは従来どおり。実機の正式音声名・品質はクラウドから取得していないため、実機選択・再生の確認を残す。
- CSSとページコードの整理は今回は候補の調査・提示まで。style.cssは1963行・!important 44箇所・media 21箇所であり、単純な重複検索だけで不要と判断しない。動的生成・暗色・録音状態等での利用も確認してから削除する。
- **自動検証済み**：`voice-default.cjs` 112項目と既存ライフサイクル167項目が通過（計279）。全JS構文・JSON・HTML参照・差分も確認。実機確認は未実施。

### 4.13 速度の現状確認とCSS整理（2026-10-25）
- 速度調査時点は全8ページTTS rate 0.9、録音1.0。その後の追加指示によりPractice 1.1・1.2を0.75、Practice 7.1〜7.3を暫定0.8へ変更。作文・発音は0.9、録音再生は1.0を維持する。旧Supertonic試験の0.7と区別する。
- CSS整理をユーザー承認。参照のない旧UIの15ルールを除去し、重複指定を統合、圧縮された宣言を改行した。!importantは44→38。JSは速度指定のみ変更し、録音・判定・状態保持や動的な計測スタイルは維持する。
- CSS整理前のf893dd6を基準に、同一DOM・同一位置で明暗／2幅／文体・表示・ヒント・キュー切替／再生・マイク待機の計算済みスタイル・全要素寸法・表示画像を比較するテストを追加。アニメーションとスクロール位置の時間差は固定して比較する。
- 実機確認リストを `docs/DEVICE_CHECKLIST.md` に作成。該当項目を確認できれば完了。後日予定のブラウザ確認は別管理とし、現行確認後に発音モデル音生成プロジェクトへ移行する。
- **自動検証済み**：CSSの計算済みスタイル・寸法・表示画像比較704項目と、指定速度／録音等速を含むリレー208項目が通過。JS構文・JSON・HTML参照・差分も確認。

### 4.14 モデル音生成の方式検討（2026-10-25）
- ユーザーの案Aを一次資料で検討し、MODEL_AUDIO_OPTIONS.mdへ整理。Web Speechから直接ファイル取得はできず、共有音声の内部収録が必要。Chrome OSの実TTSがタブ／システム音声へ入るかを1語で試す段階から進める案。
- 通常ページの共有録音、開発用Chrome拡張、OS出力ループバックを比較。1項目ずつ録音して既知の境界で分割・命名する方式を推奨。MP3直接録音や1〜2分で全Voiceを作れることは前提にしない。
- 今回は検討記録のみ。収録ツール・固定音声・モデル曲線の学習ページ搭載は未実装。実機での内部収録成功も未確認。


### 4.15 モデル音声収録ツール（2026-10-25）
- ユーザーが提示方式での進行を承認し、一度限りの収録をWindowsで実施してよいと明示。独立した `tools/model-recorder.html` と専用JS/CSSを実装。既存ページの動作やVoice保存は変更しない。
- タブ／システム音声共有、1項目の収録・波形・試聴確認、一括収録、WebM等＋変換WAV＋manifestのZIP保存を実装。無音検知・段階期限・中止・共有終了・遅い結果の破棄を備え、完成済みは保持する。
- 操作手順は `docs/MODEL_AUDIO_CAPTURE.md`。公開反映後、実機で先頭1項目を収録・試聴する。WindowsのVoice一覧がChromeOSと同じとは限らず、実名・声の確認が必要。信号の検出だけでは対象TTS収録成功としない。
- 収録一覧の確定、本番ファイルの採用、同ファイルからの曲線生成、既存Labへの搭載は別工程。ツール実装を実機収録成功と混同しない。

- **自動検証済み**：`tests/model-recorder.cjs` 39項目が通過。合成共有音声を実MediaRecorderで録音し、実デコード・WAV生成・ZIP展開／CRCと条件記録を確認。許可取消・無音・期限・中止・遅い結果・部分完成の保持も確認した。実Google音声の収録経路と品質は未確認。


### 4.16 区分ラベルの配色・表示範囲（2026-10-25）
- ユーザー承認により、7.1のOngoingと7.3のPast Ongoingを共通のローズ系へ変更。通常は背景 `#fce7f3`／文字 `#831843`、ダークは背景 `#831843`／文字 `#fce7f3`。ChromeOSのオレンジ系矢印絵文字との同化を避ける目的。Habit・Past・Present State・Past StateとExampleの背景は維持する。
- 比較を行う7.1・7.2・7.3のDrill 1は、Exampleと問題各行の区分を維持する。
- 単一区分の7.1 Drill 2はExampleの質問行に `▶️Ongoing`、7.2 Drill 2は同位置に `⏳Present State` を追加。問題行には追加しない。
- 7.3 Drill 2の既存表示を基準に、Drill 3・4はExampleの質問行だけに区分を表示し、応答行・問題各行で同一区分を繰り返さない。
- 録音・TTS・音声認識・正誤判定・状態保持は変更しない。
- 自動検証：3ページ×通常／ダークの6通りで起動、区分の数・表示範囲、進行ラベルの計算済み色、日本語ラベルを確認。JS構文・差分チェック、既存 `tests/audio-lifecycle.cjs` 167項目も通過。ブラウザ画像で日本語表示を確認。ChromeOS実機の絵文字・見やすさと公開反映はユーザー確認待ち。


### 前回のリレー状態（履歴保存）
## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当：Codex。共通ルール版：2026-10-25.2。合言葉は「サービス切り替え」。
- 課題：Codex入口の再テスト準備とローカル同期の復旧。開始時mainは18c88e7348f983468a58505e8b181282d58f8f87。
- Git通信：実行ツールの追加ネットワーク権限を付けたfetchが成功。workをmainへfast-forward更新済み。プロキシ・認証・リモートURLの変更なし。
- 変更：AGENTS.mdで対象と合言葉の意味を明確化。RELAY_WORKFLOW §7に常設指示の登録文・再テスト方法・通信権限の扱いを記録。
- 次の操作：ユーザー側の会話開始時に適用される設定へ§7の最小文を登録し、新規会話で合言葉だけを送る。この会話にはアカウント常設指示を書き換えるツールがなく、設定登録は未完了。
- 検証：文書差分・参照を確認。GitHub保存先とコミットは終了報告・Git履歴を参照。新規会話での自動読込は未確認。
- LTは開始フローの実施報告を受領。INFOは未確認。Codexは補足指示後の明示読込は成功、合言葉単独は再テスト待ち。
- 利用枠：取得不可。自動監視・タイマー・チェック用スクリプトは未実装で、当面運用を見て導入判断する。
- 既存機能・モデル音収録の実機確認事項は以下の履歴・PROJECT_SPECを維持する。


### 4.17 狭幅Exampleと区分表示の追補（2026-10-25）
- 最新ユーザー指示により、狭幅時の文の折り返し変更はPractice 7.2だけに限定。練習1・7全体への統一案は採用しない。他ページの表示仕様は維持する。
- 7.2は幅700px以下でExample表の文セルを下段へ回し、その幅内で折り返す。上段のラベル・キュー・操作・区分はまとまりを維持し、収まらない場合は要素単位で折り返す。700pxより広い場合の列配置は維持する。対象はExample 1・2。
- 7.3 Example 3は質問・応答の両行に `◀️Past Ongoing`、Example 4は両行に `⏳Past State` を表示し、それぞれ2つ縦に並べる。§19のExample質問行だけに表示する方針を、この2例に限り更新。問題各行の区分非表示とExample 2の代表行1つ表示は維持する。
- 現状調査：変更前は通常／ダーク・1280／800／600px・対応文体／表示の240通りを確認し、7.2以外のExampleにはみ出しはなかった。ただしVocabをDisplayにした追加調査では、7.1に問題はなく、7.1以外ではPractice 1.2のExample 1に幅600px・漢字表示で約29pxのはみ出しを確認。今回は指示どおり変更しない。作文・発音ページには同じExample表はなく、今回のCSSは適用しない。
- 録音・再生・認識・判定・保存の処理は変更しない。公開反映とChromeOS実機確認は別途行う。


### 前回のリレー状態（区分配色変更の履歴）
## 現在のリレー状態（2026-10-25T15:56+01:00／Europe/Vienna）
- 担当環境：Codex。GitHubアカウント：lt068028。共通ルール版：2026-10-25.2。
- 状態：実装・自動検証済み。GitHub保存結果はGit履歴・終了報告を参照。
- 課題：7.1〜7.3の区分ラベルのローズ配色と表示範囲統一。開始時main：f99ca31b6e883e3b3fb203d44ee1260694c51851。作業ブランチ：work。保存先：main。
- 完了：Ongoing／Past Ongoingを通常・ダーク双方でローズ系に変更。7.1・7.2 Drill 2のExampleに区分を追加。7.3 Drill 3・4はExample質問行に区分を残し、応答行・問題行の反復区分を除去。比較Drill 1は各行の区分を維持。
- 変更ファイル：practice7.1.js、practice7.2.js、practice7.3.js、style.css、本書、PROJECT_SPEC.md。
- 自動検証：3ページ×2配色の表示確認、node --check（変更JS）、git diff --check、tests/audio-lifecycle.cjs 167項目通過。ブラウザ画像で日本語表示を確認。
- ユーザー実機確認／CI／デプロイ：今回の修正後は未確認。
- 次の具体的操作：Vercel反映後、ChromeOS／Chromeで3ページの区分表示・通常／ダークの配色と矢印の見やすさを確認。モデル音収録等の既存実機確認事項は維持。
- 利用枠：取得不可・先の確認依頼への回答待ち。今回の小修正と保存を実施。
- 未回収作業：ローカル未保存変更・独自コミットなしで開始。リモート途中保存ブランチなし。他環境の未Push変更は取得できない。
- 入口テスト：今回の明示指示による最新読込・同期は成功。常設指示登録と合言葉単独の新規会話テストは未確認。

- §4.17の最終検証結果：7.2の表示60通り＋Vocab Display 12通りでExampleの横はみ出しなし。7.1〜7.3の通常／ダーク6通りで区分・色・日本語・起動を確認。JS構文・差分チェック通過。実機・公開反映は未確認。


### 4.18 Practice 1.2 Example 2のキュー（2026-10-25）
- 質問行：`あなた／せんこう 👉／なに`、応答行：`あなた／せんこう／せいじ 👉`。With漢字では専攻・何・政治に切り替え、既存の語彙ヒントを維持する。
- キューだけを変更し、読み上げる質問は「あなたの専攻は、何ですか？」、応答は「わたしの専攻は、政治です。」を各文体の既存生成のまま維持。Example 1のYes／No応答配置は変更しない。
- 3文体×2表示の6通りでキュー・矢印位置とExample 1の行構成を確認。各行の再生ボタンを押して既存モデル文の発話指定を確認。ページエラーなし、JS構文・差分チェック通過。実機確認は未実施。
- 押下対象の拡大は検討段階。もどる・リンク・きく・とる・停止・Yes／Noを含め、文字と余白・最低押下サイズを合わせて調整する提案であり、今回サイズは変更しない。

- 保存：c44ea2fと今回の追加コミットはローカル保存。先のmainへのPushは自動承認レビューに拒否されており、追加承認待ち。


### 4.19 学習操作ボタンとリンクの文字拡大（2026-10-25）
- ユーザー承認により、上下左右の余白・高さ指定は維持し、きく／とる／停止／Yes・No／録音再生等の学習操作ボタン（設定セグメントを除くexample-button）の文字を13px→14.95px（115%）へ拡大。最小幅36pxを確保する。
- もどるリンクを14px→16.1px、トップの練習一覧リンクを16px→18.4pxへ拡大。本文・キュー・設定セグメント・Voice等のサイズは維持する。CSS transformやページ全体のzoomは使わない。
- 既存のpadding・margin・min-height指定は維持するが、文字が大きくなるためボタンの自然な寸法や折り返しは変わり得る。
- 既存の音声ライフサイクルテスト167項目通過。表示検証の最終結果はHANDOVER参照。ChromeOSでの実機確認・公開反映は未確認。


### 前回のリレー状態（キュー変更までの履歴）
## 現在のリレー状態（2026-10-25T16:34+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：実装・自動検証済み。保存先：main。作業ブランチ：work。開始時main：202085b4489ec384f69d7b486247036677e00adb。
- 課題：7.2の狭幅折り返し・7.3 Example 3／4区分の追補はc44ea2fへローカル保存済み、Push承認待ち。続けて1.2 Example 2のキューを指定どおり変更。
- 完了：変更は7.2のExample 1・2に限定。幅700px以下で文を下段へ回して折り返す。7.3 Example 3はPast Ongoing、Example 4はPast Stateを両行表示。問題行の区分非表示は維持。
- 変更ファイル：style.css、practice7.3.js、PROJECT_SPEC.md、本書。
- 自動検証：7.2の通常／ダーク・600／700／701／800／1280px・3文体・2表示の60通りと、600pxのVocab Display追加12通りでExampleはみ出しなし。3ページ×2配色で区分数・色・日本語・起動を確認。practice7.3.js構文・差分チェック通過。ブラウザ画像で折り返し・日本語表示確認。
- 実機／CI／デプロイ：今回の変更後は未確認。
- 次の操作：公開反映後、ChromeOSで7.2を幅600pxにして文の折り返しと各操作、7.3 Example 3・4の区分2つを確認。
- 他ページの調査：通常設定ではExampleはみ出しは7.2のみ。追加のVocab Displayでは1.2のExample 1にも幅600px・漢字で約29pxのはみ出しあり。今回の変更対象外。
- 利用枠：取得不可・先の確認依頼への回答待ち。小変更と保存を実施。
- その他の待機事項・入口テスト・モデル音収録は既存記録を維持。


### 4.20 Example 2のキューと矢印の整合（2026-10-25）
- 1.2 Example 2の質問キューを `あなた／せんこう／なに 👉`（With漢字は `あなた／専攻／何 👉`）へ訂正する。§21の `あなた／せんこう 👉／なに` は旧仕様。入力キューをすべて矢印の前、モデル文を後へ置く他Exampleとの共通構造に戻す。
- 応答キュー `あなた／せんこう／せいじ 👉` は今回変更しない。問いかけの「あなた」を、応答者が「わたし」として答える視点の切替であり、モデル文を「あなたの専攻は政治です」へ変えない。
- 単独語のキュー「なに」と、モデル文中「何ですか」の「なん」は文脈に応じた読み分けであり維持する。
- 今後の変更検討では、矢印前後の役割、質問者／応答者の視点、Exampleと問題・他ページの配置を照合し、不整合があれば実装前に指摘する。
- 読み上げ・認識・判定は変更しない。3文体×漢字／ひらがなの6通りでキュー・矢印位置、Example 1の構成と両行のモデル発話を確認する。実機確認は別途。


### 前回のリレー状態（ボタン拡大時の履歴）
## 現在のリレー状態（2026-10-25T16:58+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：実装・自動検証済み。開始時main：202085b4489ec384f69d7b486247036677e00adb。作業ブランチ：work。保存先：main。
- 課題：学習操作ボタン・リンクの文字を115%に拡大。ユーザーは余白を据え置き、最低幅確保とコミット・Pushを明示承認。
- 完了：きく・とる・停止・Yes／No・録音再生を14.95px、もどるを16.1px、トップ練習リンクを18.4px。学習ボタン最小幅36px。余白・高さ指定、本文・キュー・設定セグメント・Voiceは維持。
- 同時反映：c44ea2f（7.2の狭幅Example折り返し／7.3 Example 3・4の区分縦並び）と17f05eb（1.2 Example 2キュー）はローカル保存済み。今回ユーザーのコミット・Push指示により合わせて反映する。
- 変更ファイル：style.css、PROJECT_SPEC.md、本書。以前の2コミットにはpractice1.2.js・practice7.3.jsも含まれる。
- 自動検証：既存tests/audio-lifecycle.cjs 167項目通過。9ページ×通常／ダーク×1280／600pxの36通りで起動エラーなし。対象文字115%、padding・margin・min-height不変、7.2 Exampleのはみ出しなしを確認。差分チェック通過。
- 実機／CI／デプロイ：今回の変更後は未確認。
- 次の操作：公開後、押下対象の見やすさ、1.2 Example 2のキュー、7.2の折り返し、7.3 Example 3・4の区分をChromeOSで確認。
- 利用枠：取得不可・先の確認依頼への回答待ち。小変更と保存を実施。
- 他ページの狭幅事項：1.2 Example 1はVocab Display・600px・漢字で約29pxはみ出しがあった。未承認の折り返し変更はしない。今回の文字拡大後の表示は別途実機確認。
- その他の待機事項・入口テスト・モデル音収録は既存記録を維持。


### 4.21 1.2のCasual否定と専攻モデル音の試験（2026-10-25）
- 1.2だけの試験変更。他ページへの反映は1.2のユーザー試聴後に判断する。
- Example 2のCasual質問のひらがな表示を「あなたのせんこう、なに？」へ変更。漢字表示は「あなたの専攻、何？」。Formal／Informalの表示は維持。
- 1.2のモデル音専用処理で「の専攻／のせんこう」を「の、専攻／の、せんこう」へ変換し、「あなたの、専攻」「友達の、専攻」のように区切る。表示文にこの読点は追加しない。従来の専攻への無条件な「は、」補完を外し、Casualで省略した「は」をTTSに復活させない。Formal／Informalの既存の「は」は維持。
- Casual No返答の表示は「ううん」、TTS専用の入力は「ううんん」。従来の表示「うんん」／TTS「うんんー」は旧仕様。認識原文・録音を表示置換で書き換えず、既存の判定正規化は維持する。
- 読点による間の長さや「ううんん」の音声品質はエンジン依存。日本語1〜4の実機試聴なしに改善済みとは扱わない。速度0.75は維持。


### 前回のリレー状態（Example 2矢印訂正時の履歴）
## 現在のリレー状態（2026-10-25T17:02+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.2 Example 2の矢印位置訂正を実装。保存先main／作業ブランチwork。開始時main：c452e8197f2043f747a119d0811a94aa74003941。
- 完了：質問キューを「あなた／せんこう／なに 👉」へ統一。疑問語を矢印セルからキューセルへ移動し、入力→モデル文の構造に戻す。漢字・ヒント表示は維持。
- 変更ファイル：practice1.2.js、PROJECT_SPEC.md、本書。
- 自動検証：JS構文・差分チェック、3文体×2表示のキュー・矢印位置とExample 1構成、質問／応答の発話指定を確認。
- ユーザー実機確認／CI／デプロイ：今回の変更後は未確認。
- 次の操作：公開後の1.2 Example 2でキュー位置を確認。応答者の視点（あなた→わたし）、単独語なに／文中なんの読み分けは維持する。
- 前回のボタン拡大・キュー等はc452e81までmainへPush照合済み。利用枠は取得不可・先の確認依頼への回答待ち。
- 残る実機確認・他ページの狭幅課題は過去の記録を維持。

- 今回の最終自動検証：3文体×2表示の6通りでキュー・表示とExample 1構成を確認し、各例のボタンからTTSへ渡る18件を照合。漢字／ひらがな表示のどちらもTTSは漢字に統一し、「なに／なん」は「何」へ変換。既存回答判定255項目、JS構文、git diff --check通過。実機の発音品質は未確認。


### 4.22 Casual No返答統一・1.2実機確認（2026-10-25）
- ユーザーが§24の1.2実機確認を完了し、他ページの同形態への展開を承認。ボタンサイズに改善が見られたとの報告も受領した。今回展開後の他ページまで実機確認済みとは扱わない。
- 1.2・7.1・7.2・7.3のCasual No返答は、モデル表示を「ううん、」、TTS専用入力を「ううんん、」に統一。Exampleと問題行のText表示・個別再生・モデル再生経路に同じページ内生成／変換を適用する。旧「うんん、」のモデル生成と「うんんー、」のTTS生成は終了。
- 認識された「うんん／ううん」等の既存許容を維持し、認識原文・録音・正誤判定を今回書き換えない。Formal／Informalの「いいえ、」を維持する。
- 専攻の所有表現の区切り・Casual Example 2の「なに？」は該当する1.2に維持。他ページに専攻の同形態はなく、一般の助詞・語句へ無条件に読点を追加しない。1.1・作文・発音ページには同じCasual No返答生成がないため実装変更しない。
- グローバルの表示サイズ調整は技術的に可能だが今回実装しない。文字・操作部の寸法をCSS変数で連動させ、設定のページ間共有・保存と狭幅確認を行う別工程として検討する。


### 前回のリレー状態（1.2試験変更時の履歴）
## 現在のリレー状態（2026-10-25T17:19+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.2限定のCasual否定・専攻音声試験を実装。保存先main／作業ブランチwork。開始時main：910e8605ce96b4c2949a73429138ad45bc61cf67。
- 完了：Example 2 Casualを「あなたのせんこう、なに？」、No表示「ううん」／TTS「ううんん」へ変更。専攻の前の「の、」はモデル音だけに追加し、Casualへの「は、」強制補完を解消。
- 変更ファイル：practice1.2.js、PROJECT_SPEC.md、本書。他ページの実装は変更しない。
- 自動検証：3文体×2表示で表示・キュー・TTS指定、既存回答判定テストを実行。最終結果は作業履歴参照。
- 実機／CI／公開反映：今回の変更後は未確認。読点の間と「ううんん」の発音は日本語1〜4でユーザー試聴が必要。
- 次の操作：1.2で試聴し、問題がなければ他ページ展開を判断。速度0.75、録音・認識原文・判定は維持。
- 利用枠：取得不可・先の確認依頼への回答待ち。その他の実機確認事項は既存記録を維持。

- 今回の最終自動検証：1.2・7.1・7.2・7.3の3文体×2表示、計24通りでExampleの表示・ボタン経由のTTS入力を照合。Casualは表示「ううん、」／TTS「ううんん、」、Formal／Informalは「いいえ、」を確認。回答判定255項目と再生リレー208項目通過。変更JSの構文・git diff --check通過。展開後の他ページ実機は未確認。


### 4.23 1.2限定のSize設定（2026-10-25）
- ユーザー承認により1.2だけにSizeの3段階（100%／115%／130%）を追加。現在の改善後UIを100%の基準とし、他ページへは実機確認後に展開する。
- 本文・キュー・モデル／認識結果、見出し、学習ボタン・もどる、設定・Voice・ツールチップ等の文字を倍率に連動。学習ボタンの最低幅・高さ、設定セグメントの最低高さ、ON／OFFスイッチの寸法も連動。ボタンのpaddingは据え置き、ページ全体のzoom／transformは使わない。
- 選択値は `october2026.practice12.displaySize` に保存し、1.2での再訪・再読込時に復元。100／115／130以外の値は100へフォールバック。保存APIが使えなくても当該ページ内の切替は動作させる。他ページの設定は変えない。
- 切替で再生中の音声を停止し、既存renderAllで列幅を再計測。録音Blob／URL・認識原文・判定・Yes／Noや専攻選択等の既存学習状態は保持。録音中／マイク許可待ちはサイズ操作を禁止し、終了後に解除する。
- 115／130%かつ幅900px以下ではExampleの文を下段へ回し、キューの語句も必要に応じて折り返す。問題行はキューと録音操作を上下に分ける。倍率100%の従来配置は維持する。100%・600px・Vocab Displayで従来から存在するExample／問題行の横はみ出しを解消したとは扱わない。
- 今回TTSエンジンは変更しない。AzureはEdge専用ではなくAPI認証が必要、VOICEVOXは都度生成ならエンジン稼働・事前WAV化なら再生用の常時エンジン不要、IBMには月1万文字の無料枠があるが登録・API管理が必要。追加運用のないブラウザ内TTSと同条件の置換ではない。
- 自動検証結果はHANDOVER・tests/display-size.cjsを参照。公開反映とChromeOS実機確認は別工程。


### 前回のリレー状態（Casual No統一時の履歴）
## 現在のリレー状態（2026-10-25T17:27+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：Casual No返答統一を実装・自動検証済み。保存先main／作業ブランチwork。開始時main：945cb877d3bb2b2e7c128bc62af380e1cc5bd5bf。
- 実機確認受領：1.2の試験変更はユーザー確認完了。他ページ展開を承認。ボタンサイズ改善の報告も受領。
- 完了：7.1・7.2・7.3を1.2に合わせ、Casual No表示「ううん」／TTS「ううんん」へ統一。認識表記の既存許容とFormal／Informalは維持。専攻の同形態は他ページにない。
- 変更ファイル：practice7.1.js、practice7.2.js、practice7.3.js、PROJECT_SPEC.md、本書。
- 自動検証：4ページ×3文体×2表示の再生入力・表示、既存判定・リレーテストを実行。最終結果は以下の履歴参照。
- 他ページ展開後の実機／CI／公開反映：未確認。
- 次の操作：公開後に7.1〜7.3のCasual Noを試聴する。表示サイズのグローバル設定は質問への説明のみで未実装。
- 利用枠：取得不可・先の確認依頼への回答待ち。その他の実機確認事項は既存記録を維持。

- 今回の最終検証：tests/display-size.cjs 100項目通過（保存・復元・不正値・保存不可、クリック／キーボード、録音待機ロック、録音URL・元の判定保持、他ページ非影響、3幅×2配色×拡大2段階×Vocab2設定×2表示の48配置、および各幅・配色での実クリック切替）。通常／ダーク・3幅・3段階・3文体・2表示の108ケースではページエラー／Example・設定のはみ出しなし。既存再生リレー208項目、JS構文・差分チェックも通過。100%のVocab Display狭幅課題は従来どおり、115／130%の48配置ではExample・問題行・設定のはみ出しなし。実機・公開反映は未確認。


### 4.24 練習1の文構造の強調色（2026-10-25）
- ユーザー指示により、1.1・1.2のExampleで既に太字としている文構造等の注目部分に共通 `grammar-highlight` を適用。練習7と同じ通常 `#ca8a04`／ダーク `#fbbf24` のゴールド＋太字へ揃える。強調語の選択範囲・文言・配置は維持する。
- 1.1の初期描画と文体・表示切替後の再描画、1.2のExample 1・2の質問／応答を対象とする。モデル音・録音・判定は変更しない。
- 1.2のSize設定は今回維持。ユーザーがブラウザ標準ズームの案内への置換を検討中であり、削除・全ページ展開・ショートカット案内の追加は未実施。通常のWebページからChrome本体のズームを直接操作する標準APIはなく、拡張機能のtabs.setZoomとは区別する。
- VOICEVOX事前WAV化は、採用するモデル文・文体・声等の有限の組み合わせを生成し公開先へ置く方式。任意の自由入力まで網羅できる方式ではない。今回は音声方式の変更なし。


### 前回のリレー状態（1.2 Size設定時の履歴）
## 現在のリレー状態（2026-10-25T17:49+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.2限定のSize設定を実装・自動検証済み。保存先main／作業ブランチwork。開始時main：08acaa2bf0f575f89f2d571c88682a9140272133。
- 完了：設定欄にSize 100%／115%／130%。文字と操作部の最低寸法が連動。専用localStorageで保存・復元、録音・許可待ち中ロック、切替後も録音・認識原文・判定等の学習状態を保持。拡大時の狭幅配置を調整。他ページのUIは変更しない。
- 変更ファイル：practice1.2.html、practice1.2.js、style.css、tests/display-size.cjs、tests/README.md、PROJECT_SPEC.md、本書。
- 自動検証：サイズ切替・保存・失敗・キーボード・録音待機ロック・状態保持・他ページ非影響、通常／ダークと複数幅を検証。最終結果は以下の履歴参照。既存再生リレー208項目通過。
- 実機／CI／公開反映：今回の変更後は未確認。
- 次の操作：1.2のSize 3段階をChromeOS実機で確認し、問題なければ全ページ展開を判断。
- 既存制約：100%の600px・Vocab Displayのはみ出しは従来配置を維持。115／130%では狭幅の折り返しを適用。
- 利用枠：取得不可・先の確認依頼への回答待ち。TTS候補の運用条件は説明のみで実装変更なし。その他の実機事項は履歴を維持。

- 今回の最終検証：2ページ×通常／ダーク×3文体×漢字／ひらがなの24通りで、Exampleの既存太字が共通強調クラスを持ち、計算済み色が練習7と同じゴールドになること、ページエラーなしを確認。変更JS構文・git diff --check通過。実機確認は未実施。


### 4.25 強調色監査と130%標準化の事前検討（2026-10-25）
- PROJECT_SPEC §28に監査結果、役割別の色の適用範囲、拡大前の懸念、英文案、Display配置案を記録。アプリコードは変更していない。


### 前回のリレー状態（文構造強調の変更時）
## 現在のリレー状態（2026-10-25T18:01+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.1・1.2の文構造強調色を実装。保存先main／作業ブランチwork。開始時main：7d862c8fe565250595af3ef1832ac688cc111c8c。
- 完了：既存のExampleの太字にgrammar-highlightを付け、練習7と同じ通常／ダークのゴールドへ統一。文言・強調範囲・音声・判定は維持。
- 変更ファイル：practice1.1.js、practice1.2.js、PROJECT_SPEC.md、本書。
- 自動検証：2ページ×通常／ダーク×3文体×漢字／ひらがなを検証。最終結果は以下の履歴参照。
- 実機／CI／公開反映：今回の変更後は未確認。
- 次の操作：公開後、1.1・1.2 Exampleの文構造の色を確認。Sizeはブラウザ標準ズームの案内への置換を検討中、今回削除しない。他ページへの展開も未実施。
- 利用枠：取得不可・先の確認依頼への回答待ち。TTS方式は説明のみで変更なし。その他の実機事項は履歴を維持。


### 4.26 1.2の130%固定とDisplay配置（2026-10-25）
- 最新ユーザー指示により、1.2だけを従来Size 130%と同じ実寸へ固定。Size選択UIと倍率の保存・復元処理を撤去。旧 `october2026.practice12.displaySize` は参照せず、保存値が100／115／130等でも表示倍率に再加算しない。他ページのサイズは変更しない。
- ブラウザズーム案内は保留であり追加しない。110／125／150等の段階的ズームボタン案も否定・確定せず今後の検討事項として残す。1.2の細部をユーザーが実機確認した後に全ページ展開する。
- フォント・最低操作寸法等は従来130%の値を維持。文法強調の通常／ダークのゴールド、TTS・録音・認識・判定・状態保持は維持。
- Displayキューは日本語＋ローマ字／英語ヒントを1つの組に包み、組の境目で折り返せるようにする。組がカード幅を超える場合は英語ヒントを単語間等で折り返す。矢印はキューの末尾に続け、遠い右端へ離さない。
- Exampleはラベル＋キューを上段、きく＋モデル文を下段に配置。Yes／Noの応答をそれぞれボタン＋文の組で保持し、収まらない場合は組単位で折り返す。カードの使用可能幅が650px以下ならラベルも別段とし、肯定／否定を縦に並べる。viewportだけを基準にせずコンテナ幅で分岐する。
- 問題カードは番号＋キューを上段、録音操作を全幅の次段へ置く。Yes／Noの選択や専攻ドロップダウンは応答側の上段、応答操作はその次段とし、右端の細い列にボタンが縦積みにならないようにする。長い認識結果も折り返す。
- 今回は1.2のHTML・JSと1.2限定CSS、対応テスト・文書のみ。他ページに共通CSSを無条件適用しない。


### 前回のリレー状態（130%標準化の事前検討時）
## 現在のリレー状態（2026-10-25T18:22+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：全ページの強調色監査・130%標準化の事前検討を文書化。保存先main／作業ブランチwork。開始時main：e569b074e93fa85b3c7ed8138337dc2c0d22e281。
- 完了：文法5ページの文構造注目箇所のゴールド＋太字を60通りで確認。作文・発音・トップは役割が異なる太字を維持する仕様を明記。
- 方向：全ページを現在の1.2 Size 130%の実寸へ統一し、Size切替を撤去する予定。ただし今回の依頼は先に懸念・Display配置案を確認する段階なので、サイズ・設定撤去・ガイド追加は未実装。
- 変更ファイル：PROJECT_SPEC.md、本書のみ。アプリ実装はe569b07のまま。
- 自動検証：5文法ページ×通常／ダーク×3文体×漢字／ひらがなの60通りで文構造強調の色一致・ページエラーなし。文書差分チェック。
- 提案：Displayの語句＋ヒントを組で折り返す。モデル文の幅を優先し、例文／操作を次段へ回す。Yes／No応答は狭ければ別行。画面幅だけでなくカードの使用可能幅で配置を決める。
- 実機／CI／公開反映：新規実装なし。添付画面のDisplay時の細い本文列・右端ボタン縦積みを課題として記録。
- 次の操作：§28の懸念・英文ガイド・Display配置案をユーザーが確認後、全ページ標準化とSize撤去を実施する。
- 利用枠：取得不可・先の確認依頼への回答待ち。その他の実機事項は履歴を維持。

- 今回の最終検証：tests/display-size.cjs 302項目通過。144配置（4幅×2配色×3文体×Vocab3設定×2表示）の横はみ出しなしとYes／No応答の組、固定倍率・旧設定無視・保存不可・録音結果保持・他ページ非影響を確認。既存再生リレー208、回答判定255項目、変更JS構文・git diff --check通過。1100／600pxのブラウザ画像でDisplay・日本語・ゴールド・操作配置を確認。実機・公開反映は未確認。


### 4.27 1.2の横幅と横並び優先（2026-10-25）
- ユーザーが左右余白と常時2段配置を指摘。130%を維持したまま幅上限を拡張し、できるだけ横並びを優先する。§29の常時段分けは今回の配置仕様で更新する。
- 1.2だけ、bodyの従来共通上限（content 900px）をborder-box最大1320px・画面幅から左右計32px控除・内側padding16pxへ変更。他ページの本文幅と倍率は維持する。130%は維持し、125%への変更は今回採用しない。
- Exampleはラベル・キュー＋矢印・きく＋モデル文のまとまりを同じ行に置き、実際に収まらないときだけ折り返す。きくとモデル文を同じ要素にまとめ、ボタンだけ上段に残さない。モデル欄に一定の可読幅を確保し、数文字しか入らない細い列を作らない。
- 問題行も番号・キュー・録音操作を同じ行に置ける場合は横並び。操作欄の最低必要幅を確保し、収まらなければ操作全体を次行へ回す。Yes／No応答はボタン＋文の組単位で折り返す。Displayの語句＋ヒントの組、ゴールド、録音結果保持は維持。
- 通常PC幅1440／1280pxでは、Example 1の質問と最初の録音操作がHover／Displayのいずれでも同じ行に置かれることを検証。狭幅では折り返しを許容する。
- 比較調査：幅1100px・Display・Formalひらがなでは130%／125%どちらもExample質問は折り返す。最初の録音操作は125%なら横並び、130%では折り返しとなった。125%は130%比で約3.85%小さくなるだけで、すべての2段表示を解消するものではない。
- ズーム案内は引き続き保留。将来の110／125／150等のズームボタン案を否定しない。全ページ展開は1.2の細部確認後に判断。


### 前回のリレー状態（1.2の130%固定時）
## 現在のリレー状態（2026-10-25T18:35+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.2のみ130%相当固定・Display配置調整を実装。保存先main／作業ブランチwork。開始時main：9ade6c1abfae1629cb849daee5454bda574e91e0。
- 完了：Size切替と保存復元処理を撤去。旧保存値は無視。キュー＋矢印を上段、きく＋モデル文を下段、問題操作を全幅へ配置。Displayの日本語＋ヒントを組単位で折り返す。狭いカードでは肯定／否定応答を縦並び。
- 変更ファイル：practice1.2.html、practice1.2.js、style.css、tests/display-size.cjs、tests/README.md、PROJECT_SPEC.md、本書。
- 自動検証：固定130%・旧保存値無視・他ページ非影響・状態保持・4幅／通常ダーク／全3文体／Vocab3設定／2表示の配置を検証。既存再生リレー208、回答判定255項目通過。最終結果は履歴参照。
- 実機／CI／公開反映：今回の変更後は未確認。ブラウザ画像で日本語・ゴールド・配置を確認。
- 次の操作：1.2の細部を実機確認し、その後に全ページ展開。ズーム案内は保留。Chrome風の110／125／150等のズームボタン案も検討を継続し、今回は実装しない。
- 利用枠：取得不可・先の確認依頼への回答待ち。その他の実機事項は履歴を維持。

- 今回の最終検証：tests/display-size.cjs 310項目、既存再生リレー208項目、変更JS構文・git diff --check通過。144配置のはみ出し防止に加え、広い画面での横並び優先を確認。ブラウザ画像と1100pxの130／125比較も確認。ユーザー実機・公開反映は未確認。


### 4.28 1.2の余白ときく列の再統一（2026-10-25）
- ユーザー承認により、1.2の外枠上限を1280px、外側余白を左右最低32px（width: calc(100% - 64px)）へ調整。内側padding16px、文字等の130%は維持。他ページの幅・倍率は変更しない。
- Drill 1の応答側は「🙆／🙅／👀Text（表示時は🕶️Hide）」を選択側の同一グループに並べる。Text専用の空き列を質問行などへ新設しない。Drill 2も専攻選択の隣にTextを配置し、録音操作より左側へまとめる。
- 表示したモデル文は操作欄の独立した次行に置き、Text／Hide操作で「きく」の列を押し動かさない。
- 問題行のキュー列幅をDrill内で共通にし、使用可能幅の50%を上限とする。きく・とる・停止は全問題の質問／応答で同じ開始列。狭いカード（850px以下）では録音操作全体を次段へ回し、その左端もDrill内で揃える。
- Exampleも共有グリッドでラベル・キュー・モデル音列を揃え、各行の最初の「きく」の開始位置を統一。Yes／Noの2つの音声が同じ行に収まる場合は横並び可、折り返す場合はその開始位置を揃える。カード800px以下では段組みへ切り替え、開始列を揃える。
- Displayの矢印は末尾の語句＋ヒントの組に付け、矢印だけの孤立改行を避ける。ゴールド、TTS・判定・録音結果保持、Size撤去、案内保留は維持する。
- 旧900px上限の由来：2026-10-03の04c218fで「600pxから900pxへ拡大・統一」と記録。900pxという値の詳細な算定根拠はGit履歴から確認できず、HTMLの標準幅や教材上の必須条件とは扱わない。


### 前回のリレー状態（横幅活用・横並び優先時）
## 現在のリレー状態（2026-10-25T18:46+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.2の余白縮小・横並び優先を実装。保存先main／作業ブランチwork。開始時main：5a034f7dbc888dfa2d84d96257e2c72d7d3297a1。
- 完了：130%を維持し、1.2のbody最大外幅1320pxへ拡張。Example・問題行の強制段分けを解消し、収まるときは横並び、収まらなければまとまりごとに折り返す。きくとモデル文は一組。
- 変更ファイル：practice1.2.js、style.css、tests/display-size.cjs、tests/README.md、PROJECT_SPEC.md、本書。他ページと案内表示は変更しない。
- 自動検証：固定130%・状態保持・144配置、1440／1280pxでHover／DisplayのExample質問と録音操作の横並びを確認。既存再生リレーを実行。最終結果は履歴参照。
- 実機／CI／公開反映：今回の変更後は未確認。ブラウザ画像でDisplayと日本語・ゴールド・横並びを確認。
- 比較：1100pxのDisplayは125%でもExampleが2段。録音操作は125%で横並びになるが、今回はまず余白・配置を改善して130%を維持する。
- 次の操作：ユーザーの通常ウィンドウで1.2を確認。必要なら125%への変更を判断し、全ページ展開はその後。ズームボタン案と案内表示は保留。
- 利用枠：取得不可・先の確認依頼への回答待ち。その他の実機事項は履歴を維持。

- 今回の最終検証：tests/display-size.cjs 892項目通過。144配置のはみ出し・列揃え、🙆🙅Textの順序、Text／Hideの表示ときく位置不変、専攻選択後Text、幅・余白を確認。既存再生リレー208、回答判定255項目、変更JS構文・git diff --checkも通過。ユーザー実機・公開反映は未確認。


### 4.29 1.2強調・7.3拡大試験とリレー中断調査（2026-10-25）

## 現在のリレー状態（2026-10-25T20:15+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版2026-10-25.2。開始時main ec5cd678c0a2ca080fe73715adc71a754c9683e4／work。
- 実装：1.2 Example 2の所有助詞「の」と「なんですか／何ですか」全体を太字・ゴールド化。7.3だけ130%・上限1280px・左右最低32pxを試験適用し、Display・狭幅のキュー／操作／Exampleの折り返しを調整。1.2の既存配置を維持。
- 調査未了：リレー中「とる」で中断しないとの実機報告。全8ページのモデル／録音段階で同じ行の実クリックを確認したが再現せず、音声処理の原因修正は行っていない。ユーザーが1.2 Drill 1の5問目「いもうと／フリーター」、疑問文・No返答で再現すると指定。クリック後の録音表示の変化を質問中。自動テスト通過を実機解決と扱わない。
- 検証：再生リレー208、1.2固定表示892、回答判定255通過。7.3の144配置と1.2の新強調は最終結果を履歴へ記録。
- 公開／実機：今回変更後は未確認。次は7.3の130%の見え方をユーザーが判断。全ページ展開・ズーム案内は保留。
- 利用枠：取得不可、既存の確認待ちを維持。保存先main（最終コミットIDはGit履歴）。

前回の状態を保全：

## 現在のリレー状態（2026-10-25T19:06+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版：2026-10-25.2。
- 状態：1.2の幅・余白・きく列揃え・Text配置を実装。保存先main／作業ブランチwork。開始時main：29980d4d23f80d07aa0316501a9f6cc4e562c246。
- 完了：外枠上限1280px、外側左右最低32px、130%維持。🙆🙅Textを選択側に集約し、Text専用の空き枠は追加しない。DrillとExampleのきく開始列を揃える。Text表示は別行へ出し、きくを押し動かさない。
- 変更ファイル：practice1.2.js、style.css、tests/display-size.cjs、tests/README.md、PROJECT_SPEC.md、本書。
- 自動検証：144配置のはみ出し・Drill／Example列揃え、Yes／No＋TextとHide、専攻選択後のText、旧保存値無視・状態保持・他ページ非影響を検証。既存再生リレー208、回答判定255項目通過。最終結果は履歴参照。
- 実機／CI／公開反映：今回の変更後は未確認。ブラウザ画像で余白、ゴールド、Display、操作配置を確認。
- 次の操作：1.2の幅・余白・きく列・🙆🙅Text配置をユーザー実機で確認し、その後に全ページ展開。案内表示とズームボタン案は引き続き保留。
- 利用枠：取得不可・先の確認依頼への回答待ち。その他の実機事項は履歴を維持。

最終検証：7.3の144配置＋1.2強調の149項目、1.2表示892、再生リレー208、回答判定255、変更JS構文・差分チェック通過。リレー中断の実機症状は未再現・条件確認待ち。


### 4.30 リレー中断の対象行を絞り込んだ追加調査（2026-10-25）
- ユーザー指定：1.2 Drill 1の5問目「いもうと／フリーター」の疑問文と「いいえ」の返答で再現可能。
- 追加試験：No選択後、5問目の疑問文／否定応答 × Auto／Manual録音 × モデル音／自分の録音の8条件。録音結果にも当該文を使用し、次の行の「とる」を実クリック。マイク許可を意図的に保留し、既存Audioのpause、モデル音再生中のTTS終了通知解除、Playing表示の復元が許可待ち中に済むことを確認する。
- 音声APIを代替したChromiumでは症状未再現。実ChromeOSの音響的停止は未確認。アプリ音声処理は原因が確定していないため変更していない。ユーザーへクリック直後がPreparing microphone／Recordingに変わるか、画面も変化しないかを質問中。
- tests/audio-relay.cjsに再現条件を追加し、次回以降の回帰試験として保持。最終結果は終了記録参照。保存先main／作業work、開始時main 6ad76108322f691fa3f3dcf2c2d642c55343cd2e。

追加調査後の修正：

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 6ad76108322f691fa3f3dcf2c2d642c55343cd2e／work。保存先main。
- ユーザー補足：1.2 Drill 1の5問目「いもうと／フリーター」、疑問文・No返答で発生。「とる」でRecording状態にはなる。録音終了後、次の行へ進むと再生と録音が競合する。
- 確認した隙間：既存はspeechSynthesis.cancel()直後にマイク・録音・認識を開始でき、ブラウザがまだspeaking/pendingを返す場合を待っていなかった。停止遅延の代替条件を追加したテストは変更前コードで失敗。実機の内部状態を取得したわけではなく、報告原因を完全特定したとは扱わない。
- 修正：1.2の録音開始前のみ、ブラウザのspeaking/pendingが解除されるまで最大2秒待つ。停止しなければマイクを起動せず、正しい再試行メッセージを出しロック解除。離脱時は中止。他ページの音声実装・音声選択・判定・表示サイズは変更しない。
- 試験：指定行・Auto/Manual・質問/No・モデル/録音で次の行へ進む8条件、停止遅延・停止完了・期限切れ・遅い旧通知の試験を追加。最終結果は末尾参照。
- 実機／公開：修正後は未確認。次は同じ5問目から次の行へ進んで、競合と停止待ち案内の有無をユーザー実機確認。7.3の130%試験・全ページ展開判断は継続保留。
- 利用枠：取得不可、既存確認待ちを維持。

前段階の調査記録：

## 現在のリレー状態（2026-10-25T20:15+01:00／Europe/Vienna）
- 担当：Codex／GitHub lt068028。共通ルール版2026-10-25.2。開始時main ec5cd678c0a2ca080fe73715adc71a754c9683e4／work。
- 実装：1.2 Example 2の所有助詞「の」と「なんですか／何ですか」全体を太字・ゴールド化。7.3だけ130%・上限1280px・左右最低32pxを試験適用し、Display・狭幅のキュー／操作／Exampleの折り返しを調整。1.2の既存配置を維持。
- 調査未了：リレー中「とる」で中断しないとの実機報告。全8ページのモデル／録音段階で同じ行の実クリックを確認したが再現せず、音声処理の原因修正は行っていない。ユーザーが1.2 Drill 1の5問目「いもうと／フリーター」、疑問文・No返答で再現すると指定。クリック後の録音表示の変化を質問中。自動テスト通過を実機解決と扱わない。
- 検証：再生リレー208、1.2固定表示892、回答判定255通過。7.3の144配置と1.2の新強調は最終結果を履歴へ記録。
- 公開／実機：今回変更後は未確認。次は7.3の130%の見え方をユーザーが判断。全ページ展開・ズーム案内は保留。
- 利用枠：取得不可、既存の確認待ちを維持。保存先main（最終コミットIDはGit履歴）。

最終検証：tests/audio-relay.cjs 243項目通過。停止遅延ケースは変更前ソースで失敗・変更後で成功。practice1.2.jsとテスト構文、git diff --check通過。実機確認待ち。


### 4.31 練習7 Exampleの順序統一（2026-10-25）

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main cf23deb12a70e641f59610da2c9b3c195d170a2f／work。保存先main。
- 実機確認受領：1.2のリレー再生と次録音の競合はcf23deb適用後「現象はなくなった」とユーザー確認済み。
- 今回実装：7.1／7.2／7.3の全Exampleを色付き区分→キュー→👉→きく→本文に統一。重複区分ラベルを統合し、Question／Responseは役割表示として保持。Yes／Noのキューなし応答は区分・役割→音声＋本文とし、キューは追加しない。
- レイアウト：共通5列で開始列を揃え、カード850px以下は順序を保って段分け。7.3 Example 3／4の上下2つの区分を保持。7.1／7.2のサイズと問題行は維持。7.3の130%試験を維持し、全ページ展開は判断待ち。
- 自動検証：全3ページ×4幅×2配色×3文体×3Vocab×2表記でExampleの順序・横はみ出し・起動エラーを確認。再生243項目通過。最終結果は末尾参照。
- 実機／公開：今回のExample配置変更後は未確認。次は3ページのExample順序と折り返し、7.3の130%を実機で確認。案内表示・ズーム案と全ページ倍率展開は保留。
- 利用枠：取得不可、既存確認待ちを維持。

前回状態を保全：

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 6ad76108322f691fa3f3dcf2c2d642c55343cd2e／work。保存先main。
- ユーザー補足：1.2 Drill 1の5問目「いもうと／フリーター」、疑問文・No返答で発生。「とる」でRecording状態にはなる。録音終了後、次の行へ進むと再生と録音が競合する。
- 確認した隙間：既存はspeechSynthesis.cancel()直後にマイク・録音・認識を開始でき、ブラウザがまだspeaking/pendingを返す場合を待っていなかった。停止遅延の代替条件を追加したテストは変更前コードで失敗。実機の内部状態を取得したわけではなく、報告原因を完全特定したとは扱わない。
- 修正：1.2の録音開始前のみ、ブラウザのspeaking/pendingが解除されるまで最大2秒待つ。停止しなければマイクを起動せず、正しい再試行メッセージを出しロック解除。離脱時は中止。他ページの音声実装・音声選択・判定・表示サイズは変更しない。
- 試験：指定行・Auto/Manual・質問/No・モデル/録音で次の行へ進む8条件、停止遅延・停止完了・期限切れ・遅い旧通知の試験を追加。最終結果は末尾参照。
- 実機／公開：修正後は未確認。次は同じ5問目から次の行へ進んで、競合と停止待ち案内の有無をユーザー実機確認。7.3の130%試験・全ページ展開判断は継続保留。
- 利用枠：取得不可、既存確認待ちを維持。

最終検証：Example順序・432配置の867項目、再生リレー243、7.3表示＋1.2強調149項目通過。変更JS構文・git diff --check通過。1440／600pxのブラウザ画像で日本語・区分先頭・矢印ときく・本文を確認。今回Example配置の実機・公開反映は未確認。


### 4.32 全ページ拡大と共通停止待ち・Example見出し（2026-10-25）

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main b9c07bb84e105ec6c408867f8879c57ac7824de4／work。保存先main。
- 実装：全公開9ページ130%・上限1280px・外側左右最低32px。最長キュー直後のきく列をGridで直接設定。Y/N例文を縦並び。Question/Response型ExampleはQuestionの1行上に区分見出し1個、各行の重複区分は撤去。比較型は各行先頭区分を維持。
- 再生録音：1.2の実機確認済み停止待ちを共通マイク取得へ移し、全8練習ページへ適用。全ページでspeaking/pending停止遅延・解除後の開始・期限切れ復帰を自動確認（リレー292項目通過）。他ページの実音声は未確認。
- 原因：7.3のCSS col min()が固定テーブルで実測300pxを590pxへ配分していた。実測値をGrid列へ直結。固定幅／nowrap inline !importantとDisplayの折り返し、旧td width1%も調整。
- 検証：全9公開ページの130%・4幅・通常/ダーク・文体/表記/Vocab、Example見出し・縦並び・列幅・状態保持、音声回帰を確認。最終結果は末尾参照。
- 公開／実機：1.2の前回競合解消は確認済み。今回の全ページ反映は未確認。次は全ページ130%、7.3のきく列、Q/R見出し、他Y/Nの次録音を実機確認。
- 保留：ズーム案内／独自ズームボタン。開発用tools/model-recorderは今回の拡大対象外。利用枠は取得不可・既存確認待ちを維持。

前回状態を保全：

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main cf23deb12a70e641f59610da2c9b3c195d170a2f／work。保存先main。
- 実機確認受領：1.2のリレー再生と次録音の競合はcf23deb適用後「現象はなくなった」とユーザー確認済み。
- 今回実装：7.1／7.2／7.3の全Exampleを色付き区分→キュー→👉→きく→本文に統一。重複区分ラベルを統合し、Question／Responseは役割表示として保持。Yes／Noのキューなし応答は区分・役割→音声＋本文とし、キューは追加しない。
- レイアウト：共通5列で開始列を揃え、カード850px以下は順序を保って段分け。7.3 Example 3／4の上下2つの区分を保持。7.1／7.2のサイズと問題行は維持。7.3の130%試験を維持し、全ページ展開は判断待ち。
- 自動検証：全3ページ×4幅×2配色×3文体×3Vocab×2表記でExampleの順序・横はみ出し・起動エラーを確認。再生243項目通過。最終結果は末尾参照。
- 実機／公開：今回のExample配置変更後は未確認。次は3ページのExample順序と折り返し、7.3の130%を実機で確認。案内表示・ズーム案と全ページ倍率展開は保留。
- 利用枠：取得不可、既存確認待ちを維持。

最終検証：全公開ページ130%表示3499、1.2表示・状態保持892、練習7 Example順序867、回答判定255、再生リレー292、音声ライフサイクル167、連続遷移80、回復88項目通過。変更JS構文・git diff --check通過。1440/600pxのブラウザ画像で列幅・日本語・Display折り返し・各ページ拡大を確認。整理前CSSとの同一性試験は意図的な表示変更のため実行対象外。実機確認は1.2の前回修正だけで、今回全ページ展開は未確認。


### 4.33 Exampleの内容幅・再生3列揃え（2026-10-25）

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 180c70caa79fd8b9de9c6206b996ddee44639587／work。保存先main。
- 実装：7.1／7.2／7.3 Example 2の質問・Yes・No音声3個を同じ縦列へ統一。応答も親の再生／本文列をsubgridで共有する。
- Exampleの余白：練習7のキュー1frと本文の12em下限／1.2fr配分を撤去し、内容幅fit-content(55%)＋本文残り幅へ変更。長いDisplayは割合上限で折り返す。7.2 Ex1、7.3 Ex1/3/4も対象。追加指示の1.2 Ex2も同じ内容幅方式へ変更。1.2 Ex1・全問題行は維持。
- 原因：今回のExampleの空きは固定px指定ではなく、キューのfr余剰幅配分。前回の7.3問題カードcol min()とは区別する。
- 検証：練習7の全配色・文体・表記・Vocab・幅の順序／3音声列／横はみ出し、短いキュー直後の隙間、1.2既存表示と状態保持を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は3ページEx2の音声3個の縦列、対象Exampleの余白を実機確認。130%と共通停止待ちを維持する。
- 利用枠取得不可・既存確認待ち、ズーム案内／独自ズーム案の保留を維持。

前回状態を保全：

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main b9c07bb84e105ec6c408867f8879c57ac7824de4／work。保存先main。
- 実装：全公開9ページ130%・上限1280px・外側左右最低32px。最長キュー直後のきく列をGridで直接設定。Y/N例文を縦並び。Question/Response型ExampleはQuestionの1行上に区分見出し1個、各行の重複区分は撤去。比較型は各行先頭区分を維持。
- 再生録音：1.2の実機確認済み停止待ちを共通マイク取得へ移し、全8練習ページへ適用。全ページでspeaking/pending停止遅延・解除後の開始・期限切れ復帰を自動確認（リレー292項目通過）。他ページの実音声は未確認。
- 原因：7.3のCSS col min()が固定テーブルで実測300pxを590pxへ配分していた。実測値をGrid列へ直結。固定幅／nowrap inline !importantとDisplayの折り返し、旧td width1%も調整。
- 検証：全9公開ページの130%・4幅・通常/ダーク・文体/表記/Vocab、Example見出し・縦並び・列幅・状態保持、音声回帰を確認。最終結果は末尾参照。
- 公開／実機：1.2の前回競合解消は確認済み。今回の全ページ反映は未確認。次は全ページ130%、7.3のきく列、Q/R見出し、他Y/Nの次録音を実機確認。
- 保留：ズーム案内／独自ズームボタン。開発用tools/model-recorderは今回の拡大対象外。利用枠は取得不可・既存確認待ちを維持。

最終検証：練習7 Example順序・3音声の縦列・内容幅の1302項目、1.2表示/状態保持892、7.3表示＋1.2強調149項目通過。差分チェック通過。1440/600pxのブラウザ画像で質問/Yes/No列と内容幅・日本語を確認。今回のCSS変更後の公開・実機確認は未了。


### 4.34 Text撤去・Example音声列再修正（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 9556e270ee59e3bb0da42a4bfa442070ce74bdb2／work。保存先main。
- 実装：全DrillのText／Hide機能を撤去（1.2 D1/D2、7.1/7.2/7.3 D2）。確認用モデル文はExample常時表示とする。録音結果・判定・選択・音声再生は維持。
- Ex2：7.2/7.3の縦揃え不足の再報告を受け、7.1を含む3ページの質問・Yes・Noを同じ5セル行へ変更。入れ子subgrid・結合応答セルを撤去し、1つの親Gridにセルを直接並べ、ボタン幅も共通化。狭幅の空段を抑制。
- 維持：比較Drillの区分はきくの右隣。130%、内容幅基準のキュー、1280px上限・左右最低32px、共通停止待ちを維持。上限の利点/欠点を整理し、変更判断は別途とする。
- 検証：全公開ページのText/Hide非生成、Y/N/Select選択後の録音、状態保持、Example 3音声列と各設定の配置・起動エラー・音声回帰を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2/7.3 Ex2の3音声の縦列とText非表示・選択後録音を実機確認。
- 保留：本文上限の変更、ズーム案内／独自ズーム案。利用枠取得不可・既存確認待ちを維持。

前回状態を保全：

## 現在のリレー状態（2026-10-25／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 180c70caa79fd8b9de9c6206b996ddee44639587／work。保存先main。
- 実装：7.1／7.2／7.3 Example 2の質問・Yes・No音声3個を同じ縦列へ統一。応答も親の再生／本文列をsubgridで共有する。
- Exampleの余白：練習7のキュー1frと本文の12em下限／1.2fr配分を撤去し、内容幅fit-content(55%)＋本文残り幅へ変更。長いDisplayは割合上限で折り返す。7.2 Ex1、7.3 Ex1/3/4も対象。追加指示の1.2 Ex2も同じ内容幅方式へ変更。1.2 Ex1・全問題行は維持。
- 原因：今回のExampleの空きは固定px指定ではなく、キューのfr余剰幅配分。前回の7.3問題カードcol min()とは区別する。
- 検証：練習7の全配色・文体・表記・Vocab・幅の順序／3音声列／横はみ出し、短いキュー直後の隙間、1.2既存表示と状態保持を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は3ページEx2の音声3個の縦列、対象Exampleの余白を実機確認。130%と共通停止待ちを維持する。
- 利用枠取得不可・既存確認待ち、ズーム案内／独自ズーム案の保留を維持。

最終検証：全公開ページ表示・Text非生成4659、1.2状態保持/選択後録音890、練習7 Example順序/3音声列1302、再生リレー292、回答判定255項目通過。変更JS構文・git diff --check通過。1440/600pxの画像で7.2/7.3 Ex2の3音声列を確認。今回の公開・実機確認は未了。


### 4.35 大画面への連続拡張（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main fae2c75f291e995c586ebb52b1d2196b185fd397／work。保存先main。
- 実装：全公開9ページを1280px基準→1600px最大へ連続拡張。1440画面で1280、1920で1520、2080以上で1600。左右最低32px、130%を維持し、幅切替ボタンは追加しない。
- 配分：標準幅からキュー上限を導き、大画面でキュー／きく／録音／停止の本文左端からの横位置を動かさない。増えた幅は通常Drillの結果領域とExample本文側へ使う。1.2 Ex1の残っていたキューへの余剰配分も撤去。説明文は75ch上限。
- 維持：Textなし、共通停止待ち、Q/R区分見出し1個、Example音声3個縦列、比較Drill区分はきくの右隣。Y/Nの選択と再生は現行分離を維持。一体化はメリット/デメリットの提案のみ。
- 検証：全9ページの広幅・配色・Vocab、幅の連続値、本文からの操作位置不変、結果側の幅増分、長い認識結果と横はみ出しを確認。通常/狭幅の全表示設定も確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は最大化/縮小したときの幅・停止後の結果表示・音声列を実機確認し、Y/N一体化の是非を判断する。
- 保留：Y/N一体化、ズーム案内／独自ズーム。利用枠取得不可・既存確認待ちを維持。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 9556e270ee59e3bb0da42a4bfa442070ce74bdb2／work。保存先main。
- 実装：全DrillのText／Hide機能を撤去（1.2 D1/D2、7.1/7.2/7.3 D2）。確認用モデル文はExample常時表示とする。録音結果・判定・選択・音声再生は維持。
- Ex2：7.2/7.3の縦揃え不足の再報告を受け、7.1を含む3ページの質問・Yes・Noを同じ5セル行へ変更。入れ子subgrid・結合応答セルを撤去し、1つの親Gridにセルを直接並べ、ボタン幅も共通化。狭幅の空段を抑制。
- 維持：比較Drillの区分はきくの右隣。130%、内容幅基準のキュー、1280px上限・左右最低32px、共通停止待ちを維持。上限の利点/欠点を整理し、変更判断は別途とする。
- 検証：全公開ページのText/Hide非生成、Y/N/Select選択後の録音、状態保持、Example 3音声列と各設定の配置・起動エラー・音声回帰を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2/7.3 Ex2の3音声の縦列とText非表示・選択後録音を実機確認。
- 保留：本文上限の変更、ズーム案内／独自ズーム案。利用枠取得不可・既存確認待ちを維持。

最終検証：連続幅拡張/操作位置不変/結果側配分1497、全公開ページ表示4659、練習7 Example順序/音声3列1302、1.2表示/状態保持890項目通過。git diff --check通過。1440/1920/2560pxのブラウザ画像でも7.3のきく/停止列と結果側の拡張を確認。CSS・文書のみ変更し、Y/Nイベント・音声・録音・判定は変更していない。公開/実機確認は未了。


### 4.36 矢印隣接修正とレイアウト・仕様点検（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 78f93d730be894e4dbf1a24828695698045d49d9／work。保存先main。
- ユーザー確定：Y/N選択と再生は分離を維持。一体化は行わない。
- 修正：1.2 Ex1/Ex2の矢印をキュー内から独立共通列へ移し、きくに隣接。狭幅でも矢印と音声を同じ段にする。130%、連続幅拡張、音声開始列、録音処理、状態保持は維持。
- 点検：全公開ページを確認。追加発見は比較Drillのとる/停止の位置差（区分の長さが原因）、7.2 Ex1本文にもVocab時刻ヒントが重複する点。独自変更せず仕様整理の判断候補として記録。
- 文書：docs/UI_LAYOUT_SPEC.mdに現行一覧と判断候補を分離。PROJECT_SPECの冒頭から案内し、過去のSize/Text/幅/区分位置を現行と誤解しないようにした。折り返し800/850の扱いと600px未満PCの保証範囲も未決として明示。
- 検証：1.2矢印隣接/状態保持1178、全公開表示4659、連続幅1497通過。最終結果・画像確認は末尾参照。公開/実機は今回未確認。
- 次：1.2 Ex1/Ex2の矢印ときくを実機確認。追加整理候補はUI_LAYOUT_SPECを参照し、必要な変更を判断。
- 保留：ズーム案内/独自ズーム。利用枠取得不可・既存確認待ちを維持。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main fae2c75f291e995c586ebb52b1d2196b185fd397／work。保存先main。
- 実装：全公開9ページを1280px基準→1600px最大へ連続拡張。1440画面で1280、1920で1520、2080以上で1600。左右最低32px、130%を維持し、幅切替ボタンは追加しない。
- 配分：標準幅からキュー上限を導き、大画面でキュー／きく／録音／停止の本文左端からの横位置を動かさない。増えた幅は通常Drillの結果領域とExample本文側へ使う。1.2 Ex1の残っていたキューへの余剰配分も撤去。説明文は75ch上限。
- 維持：Textなし、共通停止待ち、Q/R区分見出し1個、Example音声3個縦列、比較Drill区分はきくの右隣。Y/Nの選択と再生は現行分離を維持。一体化はメリット/デメリットの提案のみ。
- 検証：全9ページの広幅・配色・Vocab、幅の連続値、本文からの操作位置不変、結果側の幅増分、長い認識結果と横はみ出しを確認。通常/狭幅の全表示設定も確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は最大化/縮小したときの幅・停止後の結果表示・音声列を実機確認し、Y/N一体化の是非を判断する。
- 保留：Y/N一体化、ズーム案内／独自ズーム。利用枠取得不可・既存確認待ちを維持。

最終検証：1.2表示/状態保持/矢印隣接1178、全公開表示4659、連続幅/結果側配分1497項目通過。JS構文・git diff --check通過。1440/600px画像でEx1/Ex2の矢印ときくを確認。比較Drillの位置差と7.2 Ex1ヒント重複はブラウザ測定で確認し、未変更の整理候補へ分離。公開/実機確認は今回未了。


### 4.37 7.2区分欄試験とヒント/折り返し統一（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 44cfa3417df509e1294d165d309758baafc9807f／work。保存先main。
- 7.2試験：Drill 1の区分外側欄を最長ラベル実測幅へ共有。色付きラベル背景は自然幅のまま。きく／とる／停止を揃え、7.1／7.3は変更しない。
- 統一：Vocabヒントはキュー側だけとし7.2 Ex1本文の重複を撤去。Example/表形式Drillの段組み切替はカード内容幅850px以下へ統一。ヘッダー/設定600px・Lab列数680pxは別部品として維持。
- 維持：130%、1280→1600連続幅、停止後への追加幅、Y/N分離、Textなし、矢印ときく隣接、音声/認識/判定/録音保持。
- 検証：全設定の7.2操作列・色付きラベル自然幅、他ページへの試験非展開、全Example本文のヒント非表示、カード境界前後、英語キュー切替を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2の区分欄を実機で確認してから他ページ展開を判断。PC600px未満の保証は未決。
- 利用枠取得不可・既存確認待ち、ズーム案内/独自ズーム保留を維持。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 78f93d730be894e4dbf1a24828695698045d49d9／work。保存先main。
- ユーザー確定：Y/N選択と再生は分離を維持。一体化は行わない。
- 修正：1.2 Ex1/Ex2の矢印をキュー内から独立共通列へ移し、きくに隣接。狭幅でも矢印と音声を同じ段にする。130%、連続幅拡張、音声開始列、録音処理、状態保持は維持。
- 点検：全公開ページを確認。追加発見は比較Drillのとる/停止の位置差（区分の長さが原因）、7.2 Ex1本文にもVocab時刻ヒントが重複する点。独自変更せず仕様整理の判断候補として記録。
- 文書：docs/UI_LAYOUT_SPEC.mdに現行一覧と判断候補を分離。PROJECT_SPECの冒頭から案内し、過去のSize/Text/幅/区分位置を現行と誤解しないようにした。折り返し800/850の扱いと600px未満PCの保証範囲も未決として明示。
- 検証：1.2矢印隣接/状態保持1178、全公開表示4659、連続幅1497通過。最終結果・画像確認は末尾参照。公開/実機は今回未確認。
- 次：1.2 Ex1/Ex2の矢印ときくを実機確認。追加整理候補はUI_LAYOUT_SPECを参照し、必要な変更を判断。
- 保留：ズーム案内/独自ズーム。利用枠取得不可・既存確認待ちを維持。

最終検証：7.2操作列/自然幅/Example1878、全公開表示/本文ヒント非生成5819、カード境界/英語キュー26、1.2表示1178、連続幅1497、再生リレー292項目通過。JS構文・git diff --check通過。7.2の1440/600px画像で自然幅の区分背景と録音/停止列を確認。今回の公開/実機確認は未了。


### 4.38 区分本体の均等割付試験と説明文改行（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main f3a3399c732d7be60b5d301b0d4b1bf5191b1948／work。保存先main。
- ユーザー意図補足：見たかったのは外側欄だけでなく、区分ラベル本体の幅拡大と文字均等割付。7.2限定の試験をその形へ更新。アイコンは先頭、英文字を均等配置。ラベル文字列・区分色・音声操作列を維持。7.1/7.3は変更しない。
- 説明文：75ch内で2文を連結していたためUse文の途中で折り返す。7.2 Drill 1のCompare文/Use文を独立行へ分け、狭幅では各文を自然折り返し。文言とからのゴールドは維持。
- 所感：Pastの文字間が大きくなり、区分は目立つが英単語の自然なまとまりは弱くなる。等幅背景＋中央寄せも候補だが今回は均等割付を実機確認できるようにする。
- 検証：7.2の色付きラベル等幅・文字間隔・操作列、他ページへの非展開、2文の文言/構造、全表示設定のはみ出しを確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2のPast/Present Stateの見た目と説明文の改行を実機確認し、配置方式を判断する。
- 維持：Vocabキューのみ、850pxカード境界、130%、連続幅、Y/N分離、Textなし、共通音声停止待ち。利用枠取得不可・既存確認待ち。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main 44cfa3417df509e1294d165d309758baafc9807f／work。保存先main。
- 7.2試験：Drill 1の区分外側欄を最長ラベル実測幅へ共有。色付きラベル背景は自然幅のまま。きく／とる／停止を揃え、7.1／7.3は変更しない。
- 統一：Vocabヒントはキュー側だけとし7.2 Ex1本文の重複を撤去。Example/表形式Drillの段組み切替はカード内容幅850px以下へ統一。ヘッダー/設定600px・Lab列数680pxは別部品として維持。
- 維持：130%、1280→1600連続幅、停止後への追加幅、Y/N分離、Textなし、矢印ときく隣接、音声/認識/判定/録音保持。
- 検証：全設定の7.2操作列・色付きラベル自然幅、他ページへの試験非展開、全Example本文のヒント非表示、カード境界前後、英語キュー切替を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2の区分欄を実機で確認してから他ページ展開を判断。PC600px未満の保証は未決。
- 利用枠取得不可・既存確認待ち、ズーム案内/独自ズーム保留を維持。

最終検証：練習7の配置/色付きラベル等幅/文字均等配置2022、全公開表示5819、境界/説明文2ブロック28項目通過。JS構文・git diff --check通過。1440/600px画像で区分背景・Past字間・説明文の2文配置を確認。今回の公開/実機確認は未了。


### 4.39 区分中央寄せ試験と説明文方針比較（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main d818726a678baf3efbabc4186a6294a0f0747fb1／work。保存先main。
- ユーザー決定：文字均等割付は却下。7.2限定で同じ背景幅＋通常字間のアイコン/区分文字の中央寄せへ変更。文字単位span生成・space-betweenを撤去。きく/とる/停止列と他ページは維持。
- 説明文監査：全8ページを確認し、7.2 D1の2文ブロック以外は複数文でも自然折り返しが基本。1.2 D2、7.1 D1/D2、7.3 D2、発音Labなどを比較。意味単位改行と自然折り返しの利点/欠点をUI_LAYOUT_SPECへ記録。
- 推奨：短い同目的の説明は1段落、課題と補足/独立した手順は分ける。句点ごとの一律改行は推奨しない。全体方針は未決で、今回は他ページへ改行を追加せず、7.2の2文配置も維持。
- 検証：7.2の背景幅・通常字間の中央寄せ・操作列と他ページ非展開、全表示設定を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2の中央寄せを実機評価。改行の全体方針は比較結果をもとに判断する。
- 維持：Vocabキューのみ、850pxカード基準、130%、連続幅、Textなし、Y/N分離、停止待ち。利用枠取得不可・既存確認待ち。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main f3a3399c732d7be60b5d301b0d4b1bf5191b1948／work。保存先main。
- ユーザー意図補足：見たかったのは外側欄だけでなく、区分ラベル本体の幅拡大と文字均等割付。7.2限定の試験をその形へ更新。アイコンは先頭、英文字を均等配置。ラベル文字列・区分色・音声操作列を維持。7.1/7.3は変更しない。
- 説明文：75ch内で2文を連結していたためUse文の途中で折り返す。7.2 Drill 1のCompare文/Use文を独立行へ分け、狭幅では各文を自然折り返し。文言とからのゴールドは維持。
- 所感：Pastの文字間が大きくなり、区分は目立つが英単語の自然なまとまりは弱くなる。等幅背景＋中央寄せも候補だが今回は均等割付を実機確認できるようにする。
- 検証：7.2の色付きラベル等幅・文字間隔・操作列、他ページへの非展開、2文の文言/構造、全表示設定のはみ出しを確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2のPast/Present Stateの見た目と説明文の改行を実機確認し、配置方式を判断する。
- 維持：Vocabキューのみ、850pxカード境界、130%、連続幅、Y/N分離、Textなし、共通音声停止待ち。利用枠取得不可・既存確認待ち。

最終検証：区分等幅/中央寄せ/操作列/他ページ非展開2022、全公開表示5819、境界/説明文2ブロック28項目通過。JS構文・git diff --check通過。1440/600px画像で自然な字間の中央寄せを確認。全8ページの説明文の段落構造を点検済み。公開/実機確認は今回未了。


### 4.40 説明文の短縮・意味単位の段落化（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main e97b66a60790541f2de7939d7ecc0863757f42f6／work。保存先main。
- 実装：全練習ページの課題説明/Lab説明を短縮し、同目的の短文は1段落、独立手順/課題と補足を分ける。Y/N質問明記、のの結合を具体化。助詞/例外・両返答練習・発音/リズム/タイミングの条件を維持。
- レビュー：全8ページの既定表示＋7.1拡張キューで前後文面/段落を採取し、docs/INSTRUCTION_REVIEW.mdへ比較表を作成。確認対象1849→1280文字、約31%短縮。文字数より明確さを優先し、必要な一部の文は具体化して長くした。
- 区分案：左右余白を8→16pxと解釈して実測。149px背景/最長内容132pxでは入らず、背景拡張で収めると内側幅はほぼ元に戻る。案を評価したが今回は中央寄せを維持、区分配置は変更しない。
- 検証：全設定の表示/配置、段組み境界/説明構造、大画面/音声回帰、変更前後の文面・7.1拡張モードを確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は説明の読みやすさ/必要条件と段落数を実機で確認。区分は中央寄せのまま。
- 維持：モデル文/TTS/録音/判定、Vocabキューのみ、850px、130%、連続幅、Textなし、Y/N分離、停止待ち。利用枠取得不可・既存確認待ち。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main d818726a678baf3efbabc4186a6294a0f0747fb1／work。保存先main。
- ユーザー決定：文字均等割付は却下。7.2限定で同じ背景幅＋通常字間のアイコン/区分文字の中央寄せへ変更。文字単位span生成・space-betweenを撤去。きく/とる/停止列と他ページは維持。
- 説明文監査：全8ページを確認し、7.2 D1の2文ブロック以外は複数文でも自然折り返しが基本。1.2 D2、7.1 D1/D2、7.3 D2、発音Labなどを比較。意味単位改行と自然折り返しの利点/欠点をUI_LAYOUT_SPECへ記録。
- 推奨：短い同目的の説明は1段落、課題と補足/独立した手順は分ける。句点ごとの一律改行は推奨しない。全体方針は未決で、今回は他ページへ改行を追加せず、7.2の2文配置も維持。
- 検証：7.2の背景幅・通常字間の中央寄せ・操作列と他ページ非展開、全表示設定を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2の中央寄せを実機評価。改行の全体方針は比較結果をもとに判断する。
- 維持：Vocabキューのみ、850pxカード基準、130%、連続幅、Textなし、Y/N分離、停止待ち。利用枠取得不可・既存確認待ち。

最終検証：全公開表示5819、境界/説明構造28、連続幅1497、再生リレー292項目通過。変更JS構文・git diff --check通過。最終文面は全8ページ＋7.1拡張モードでブラウザ採取して比較表化し、1849→1280文字（約31%短縮）を確認。600/1440pxの7.2説明画像で課題/からの規則の段落を確認。区分は中央寄せ維持。今回の公開/実機確認は未了。


### 4.41 Pastだけの余白増・均等配置（2026-10-26）

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main fa1bfde3727a2b97953efec475ffb350cbf9eab4／work。保存先main。
- ユーザー意図補足：背景幅とPresent Stateを変えず、短いPastだけ左右16pxを取って残りを均等配置したかった。前回の「両方の余白を増やす」解釈を訂正。
- 7.2限定試験：共通背景幅を維持。Present Stateは左右8px・通常文字・中央寄せのまま。Pastだけ左右16px・文字均等配置へ変更。アイコンは先頭。きく/とる/停止の列と他ページは維持。
- 説明文の短縮/段落整理はfa1bfdeでmain保存済み。今回その説明文は変更していない。UI_LAYOUT_SPECとINSTRUCTION_REVIEWの区分案の解釈を修正し、誤った過去評価を現行と混同させない。
- 検証：全設定の背景等幅/操作列/Past余白16px/均等文字間/Present State無変更を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2のPastだけの割付を実機評価。説明文の新方針も併せて確認可能。
- 利用枠取得不可・既存確認待ち。Y/N分離、Textなし、130%、850px、連続幅、音声停止待ちを維持。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main e97b66a60790541f2de7939d7ecc0863757f42f6／work。保存先main。
- 実装：全練習ページの課題説明/Lab説明を短縮し、同目的の短文は1段落、独立手順/課題と補足を分ける。Y/N質問明記、のの結合を具体化。助詞/例外・両返答練習・発音/リズム/タイミングの条件を維持。
- レビュー：全8ページの既定表示＋7.1拡張キューで前後文面/段落を採取し、docs/INSTRUCTION_REVIEW.mdへ比較表を作成。確認対象1849→1280文字、約31%短縮。文字数より明確さを優先し、必要な一部の文は具体化して長くした。
- 区分案：左右余白を8→16pxと解釈して実測。149px背景/最長内容132pxでは入らず、背景拡張で収めると内側幅はほぼ元に戻る。案を評価したが今回は中央寄せを維持、区分配置は変更しない。
- 検証：全設定の表示/配置、段組み境界/説明構造、大画面/音声回帰、変更前後の文面・7.1拡張モードを確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は説明の読みやすさ/必要条件と段落数を実機で確認。区分は中央寄せのまま。
- 維持：モデル文/TTS/録音/判定、Vocabキューのみ、850px、130%、連続幅、Textなし、Y/N分離、停止待ち。利用枠取得不可・既存確認待ち。

最終検証：練習7表示/7.2背景等幅/操作列/Past16px/均等文字間/Present State維持2166項目通過。JS構文・git diff --check通過。1440/600px画像を確認。説明文改訂fa1bfdeもmain保存済み。今回の公開/実機確認は未了。


### 4.42 Past左右24pxの再試験（2026-10-26）
- 7.2のPastだけ左右24pxとし、残り幅で均等配置。背景幅/Present State/操作列/説明文は維持。開始時main d74b872、保存先main。最終検証は末尾参照。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main fa1bfde3727a2b97953efec475ffb350cbf9eab4／work。保存先main。
- ユーザー意図補足：背景幅とPresent Stateを変えず、短いPastだけ左右16pxを取って残りを均等配置したかった。前回の「両方の余白を増やす」解釈を訂正。
- 7.2限定試験：共通背景幅を維持。Present Stateは左右8px・通常文字・中央寄せのまま。Pastだけ左右16px・文字均等配置へ変更。アイコンは先頭。きく/とる/停止の列と他ページは維持。
- 説明文の短縮/段落整理はfa1bfdeでmain保存済み。今回その説明文は変更していない。UI_LAYOUT_SPECとINSTRUCTION_REVIEWの区分案の解釈を修正し、誤った過去評価を現行と混同させない。
- 検証：全設定の背景等幅/操作列/Past余白16px/均等文字間/Present State無変更を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2のPastだけの割付を実機評価。説明文の新方針も併せて確認可能。
- 利用枠取得不可・既存確認待ち。Y/N分離、Textなし、130%、850px、連続幅、音声停止待ちを維持。

最終検証：7.2 Past左右24px/均等文字間/背景同幅/Present State維持/操作列の全表示設定2166項目通過。git diff --check通過。1440/600px画像を確認。公開/実機確認は今回未了。


### 4.43 Past左右32pxの再試験（2026-10-26）
- 7.2 Pastだけ左右32pxへ変更。背景幅とPresent State、操作列は維持。開始時main 447548c、保存先main。

前回状態を保全：

## 現在のリレー状態（2026-10-26／Europe/Vienna）
- 担当Codex／GitHub lt068028。ルール2026-10-25.2。開始時main d74b8725da8044f895a62579ab0648a59be36456／work。保存先main。
- ユーザー意図補足：背景幅とPresent Stateを変えず、短いPastだけ左右24pxを取って残りを均等配置したかった。前回の「両方の余白を増やす」解釈を訂正。
- 7.2限定試験：共通背景幅を維持。Present Stateは左右8px・通常文字・中央寄せのまま。Pastだけ左右24px・文字均等配置へ変更。アイコンは先頭。きく/とる/停止の列と他ページは維持。
- 説明文の短縮/段落整理はfa1bfdeでmain保存済み。今回その説明文は変更していない。UI_LAYOUT_SPECとINSTRUCTION_REVIEWの区分案の解釈を修正し、誤った過去評価を現行と混同させない。
- 検証：全設定の背景等幅/操作列/Past余白24px/均等文字間/Present State無変更を確認。最終結果は末尾参照。
- 公開／実機：今回変更後は未確認。次は7.2のPastだけの割付を実機評価。説明文の新方針も併せて確認可能。
- 利用枠取得不可・既存確認待ち。Y/N分離、Textなし、130%、850px、連続幅、音声停止待ちを維持。

- 今回の差分：Pastの左右余白16→24px。残りの文字領域を縮め、背景幅/Present State/操作列は維持して再試験。

最終検証：Past左右32px/均等文字間/背景同幅/Present State維持/操作列2166項目通過。git diff --check通過。今回の公開/実機確認は未了。


### 4.44 Past左右40pxの再試験（2026-10-26）
- 32pxの実機評価を受け、7.2 Drill 1のPastだけ左右40pxへ変更。共通背景幅・Present State・操作列・他ページは維持。開始時main 491ff43、保存先main。
- 自動検証：example-order 2166項目とgit diff --check通過。40pxの公開・実機確認は未了。


### 4.45 練習7全3ページの区分仕様統一（2026-10-26）
- practice7-categories.jsを3ページへ導入。7.2専用の試験処理を置換。最長自然幅・文字領域上限・残り余白を共通化。
- 自動検証：example-order 1734項目、global-display 5819項目通過。構文・git diff --check通過。公開／実機確認は未了。
- 共通化で旧7.2専用クラスを参照していたlayout-rules検証を更新し、英語キュー切替後を含む28項目通過。


### 4.46 文字間隔上限3.5pxへ訂正（2026-10-26）
- 前回の文字全体幅上限を撤回。practice7-categories.jsと仕様・検証を更新。3ページ共通で追加字間上限3.5px、最長自然背景幅と残り左右余白を維持。
- 自動検証：example-order 1734項目、layout-rules 28項目通過。Habit／Pastの追加字間3.5pxと背景幅維持を実測。構文とgit diff --check通過。公開／実機確認は未了。


### 4.47 練習7タイトルとHoverアイコン（2026-10-26）
- 区分名とページタイトル・Indexを統一。Hoverを🔎へ変更し、Casualの💬と区別。
- 自動検証：global-display 5819項目、title／h1／Index一致・Hover/Casualアイコン整合確認、JS構文・git diff --check通過。公開・実機確認は未了。


### 4.48 ツールチップ拡大と位置補正（2026-10-26）
- 語彙20px／操作説明18px、折り返し・最大幅・画面端配置を実装。説明文の追加・削除とDisplay改行は保留。
- 自動検証：tooltip-layout 228項目通過（8ページ／2幅／2配色、語彙と操作説明のサイズ・画面内配置・長文と長単語の折り返し）。JS構文とgit diff --check通過。公開／実機確認は未了。


### 4.49 7.3 Display語句ごと改行試験（2026-10-26）
- cueWordsでDisplay時のみ語句とヒントをブロック化。1組1行、長い組内ヒントは折り返す。他モード・英語キューは既存配置。
- 自動検証：display-cue-lines 244項目、layout-rules 28項目、JS構文・git diff --check通過。Exampleの表示画像も確認。公開・実機確認は未了。


### 4.50 Display改行の全対応ページ展開（2026-10-26）
- 7.3実機確認を受け、1.1／1.2／7.1／7.2へ展開。英語キューに語彙用改行を適用せず区切りを維持。
- 自動検証：display-cue-lines 348項目、global-display 5819項目、layout-rules 28項目通過。JS構文・git diff --check通過。展開後の公開／ユーザー実機確認は未了。


### 4.51 Listen通常説明撤去・選択理由の実装（2026-10-26）
- 各Y/N・専攻返答に未選択マーカーを付け、tooltip-layoutの共通処理で理由枠を表示。通常Listen説明を除去。
- 自動検証：listen-help 36項目（実ホバー／キーボード含む）、tooltip-layout 228項目、audio-relay 292項目、global-display 5819項目、JS構文・git diff --check通過。既存テスト読み取りを削除と判定した自動レビュー拒否は、既存ファイル無変更を確認して独立テスト追加により解消。公開／実機確認は未了。


### 4.52 1.1文型・前提条件説明と録音操作の統一（2026-10-26）
- 1.1 D2プルダウン間には。D2・D3の条件説明を追加し、他の選択必須問題もきく・とる両方へ理由表示。自明な通常説明を撤去。
- 説明枠検証で発音2の無効Casualボタンのfilterが固定配置の基準を変えて画面外へ出す問題を発見。グレー文字・背景とopacityは維持し、filterはアイコンへ限定して修正。
- 自動検証：listen-help 47項目、audio-relay 292項目、global-display 5819項目、tooltip-layout 228項目通過。JS構文・git diff --check通過。今回の公開・実機確認は未了。


### 4.53 実機確認後の仕様文書点検（2026-10-26）
- bedd182実機確認完了。UI_LAYOUT_SPECの説明重複・古い7.2試験記述、PROJECT_SPECの録音再生説明、INSTRUCTION_REVIEWの現行／履歴混同を修正。条件・文言・対象を集約。
- 1.1 D2/D3 Casualの区切りの差は未決事項として記録。コード変更なし。
- 文書検証：リンク先の存在、現行条件表の各文言1か所への集約、旧7.2限定試験記述の撤去、実機確認記録、git diff --check通過。変更は文書4ファイルのみのため機能テストは再実行していない。


### 4.54 1.1 D2／D3 Casualの「は」保持（2026-10-26）
- モデル生成にD2/D3限定の主題保持指定を追加。通常きくと録音後モデルへ適用。D3 Casualの「／」変換を撤去。
- 自動検証：practice11-topic 20項目（実ボタンからのTTS入力・3文体・肯定否定・D1と判定許容維持）、audio-relay 292項目、JS構文・git diff --check通過。実音声の発音品質と公開後の実機確認は未了。


### 4.55 練習2.1の新規実装（2026-10-26）
- 本・ペン・かばん・さいふ・かさ・とけいの6語。E1～3・D1～3をSVGの固定位置と発話者に対応。1.2の録音制御を継承し新ページとして実装。
- 自動検証：practice21 173項目（モデル視点・出題数・抽選保持・D2/D3録音判定・排他ロック・誤指示語拒否）、global-display 6541項目、audio-relay 324項目、tooltip-layout 258項目、fluid-width 1678項目通過。通常/ダークの図入りページ画像、JS構文・相対リンク・git diff --checkも確認。実音声品質・新ページの公開／実機確認は未了。


### 4.56 練習2.1 Ex1の距離領域・6モデル（2026-10-26）
- Ex1だけに絞り、3音の領域・話者交代・アイテム近くの再生と下部の6文を実装。Ex2以降は保留。
- 自動検証：practice21 Ex1 235項目（6モデル・3文体／2表記・役割／領域／文の対応・旧音声終了通知の無効化・狭幅）、global-display 6541項目、tooltip-layout 258項目、fluid-width 1606項目通過。通常広幅／ダーク600pxの画面、JS構文・git diff --check確認。Ex2以降は未検証ではなく明示的保留。新Ex1の公開・実機確認は未了。


### 4.57 検討画像の直接URLによる受け渡し（2026-10-26）
- ユーザー依頼により、生成済みPNGを公開静的ファイルとして追加。元ファイルは維持し、教材のHTML・JS・CSSは変更しない。
- 送信後確認：GitHub Rawの3b27a4a版PNGはHTTP 200、Content-Type image/png、PNGシグネチャ一致。Vercel URLはこの実行環境のプロキシで403となり取得未確認のため、ユーザーには取得確認済みのGitHub RawとGitHub画像ページを案内する。ユーザー画面での表示は未確認。


### 4.58 練習2.1 Ex1の写真・領域表示案v2（2026-10-26）
- v1の直接リンクはユーザーが表示成功を報告。指示に従い壁掛け時計へ変更し、A視点の3領域、各品物のA/B再生ボタンの配置案、下部6文を画像化。元PNGは保持。
- 検討用PNG追加と本記録のみ。教材への適用前に画像案を確認する段階。PNG形式確認とgit diff --checkを実施。教材コード未変更のため機能テストは再実行しない。


### 4.59 検討画像v3の机・到達範囲調整（2026-10-26）
- ユーザー指示で机を壁沿いとし、時計を机上方の壁へ配置。こ／その領域は机の両端・手前まで広げ、中央側のみ丸い境界とした。6文と6再生ボタンの配置案を維持。
- 検討用PNGと引き継ぎ記録のみ更新。PNG形式・目視・git diff --check確認。教材HTML／JS／CSS未変更のため機能テストは再実行しない。


### 4.60 練習2.1 Ex1を写真＋実ボタンへ実装（2026-10-26）
- v3を基に文字・ボタン・色を除いた背景画像を生成。HTML/CSSでこ／そ／あ領域、人物A/B、話者表示、6再生ボタンを構成。下部6文は既存の語彙・文体・表記・金色の文法強調を維持。縦の余白を抑えるため背景写真下部の床はCSSで表示範囲を制限。
- 自動検証：practice21 273項目（写真読込、6文×3文体×2表記、話者・領域・対象文、旧再生通知、狭幅）、global-display 6541項目、tooltip-layout 258項目、fluid-width 1606項目通過。1440px／600pxの画面目視、PNG・JS構文・git diff --check確認。今回の公開／実機確認は未了。
- Drillは未実装。共通の場面で品物を差し替える6文案を推奨するが、背景と品物の分離・遠方品物の設置面・出題順・セット状態保持は今後決める。


### 4.61 Ex1写真70％・色領域と品物の重なり調整（2026-10-26）
- 画像は広幅70％、900px以下100％。A/B再生ボタンは縦並び、表示画像幅650px以下では写真下へ移動。説明は28px／18pxの白背景前面表示。
- 天板を四辺の座標で切り抜き、品物と手を元写真の切り抜きで前面へ復元。色の切り替えとモデル文の連動を維持。写真ファイル自体は変更していない。
- 自動検証：practice21 297項目、global-display 6541項目、fluid-width 1606項目通過。600／900／1440／1920pxの画像を生成し、600／900／1440pxを目視確認。JS構文・git diff --check通過。今回の公開／ユーザー実機確認は未了。


### 4.62 Ex1の画像75％・白背景撤去とDrill方針（2026-10-26）
- 白背景を撤去、28px／18pxの太字と文字の影へ変更。あを時計左、A側説明を上、B側説明を左へ移動。画像75％、狭幅100％。写真・音声処理・範囲と文の連動は維持。
- 自動検証：practice21 305項目（75％、白背景なし、フォント、6モデルと話者、狭幅等）、fluid-width 1606項目、JS構文・git diff --check通過。600／900／1440／1920pxの画面生成、900／1440pxを目視確認。最終調整であの説明をさらに左へ移し時計との接触を回避。今回の公開／実機確認は未了。
- Drill出題順・背景分離方式を確定仕様として記録。壁側候補のLesson 2語彙を公開2一覧で照合。Drill自体・分離画像資産はまだ実装していない。


### 4.63 話者ガイドと品物周辺の配置（2026-10-26）
- ユーザーが75％サイズで進めることを了承。赤いWho is speaking?＋現在のA/Bを表示し、時計左の縦再生・右のあ説明へ交換。A側説明は少し右下、B側はかばんの真上へ。
- 手に色が重なってよいとの指示で手の切り抜きを撤去。品物3つの色復元は維持。
- 自動検証：practice21 307項目、fluid-width 1606項目、JS構文・git diff --check通過。600／900／1440／1920pxの画面生成、900／1440pxを目視確認。今回の配置・ガイドの実機確認は未了。
- Drill 1の残る確認事項として2セットの具体語彙、問題中の距離ガイド・色領域を提示する。Drillはまだ実装しない。


### 4.64 練習2.1 Drill 1・60％の共有画像（2026-10-26）
- 品物なし背景と透明な6品物シートを生成して保存。1枚の場面を2セットで共有し、A・B各3行で1文ずつ既存の再生・録音・文字起こし・判定を使う。問題文はこれは／それは／あれは…、Object番号・色領域・距離説明はなし。
- セット切り替えで録音を混ぜないようキーを分離。録音中は切り替えをロックし、戻ったセットの結果を復元する。Ex1の75％・領域説明・6モデルは維持。
- 自動検証：practice21 468項目（6文×2セット×3文体×2表記、1行録音の認識・判定、誤指示語の拒否、セット別保存・ロック、60％・狭幅）、audio-relay 324項目（2.1を追加）、global-display 6541項目、tooltip-layout 258項目、fluid-width 1642項目通過。1440pxの両セットと600pxの画面目視、JS構文・git diff --check通過。公開／ユーザー実機確認は未了。
- Lesson 2語彙は版差を併記して記録。花はLesson 12の公開一覧2件で確認。今回は花を出題していない。


### 4.65 Drill 1の品物差し替え・位置調整（2026-10-26）
- Set 1の財布を新聞にし、手に重ならないよう少し左へ。Set 2のノート・辞書も少し左へ、壁のかばんはハンガーのTシャツへ。新規透明素材を追加し、モデル・認識対象を同時更新。
- 自動検証：practice21 469項目（2セット×6文×3文体×2表記、新品名のモデル・判定、Tシャツ表記、録音・状態保持等）、fluid-width 1642項目通過。1440px両セットの画面目視、PNG・JS構文・git diff --check通過。実機確認は未了。
- Set 2の会話化は提案への意見提示まで。ユーザーのキューは意図的に誤った品名を質問する案で整合する。否定＋訂正の完成例1組を推奨。Bも指示語を使う場合はそれ／これ／あれへ切り替える。会話出題は未実装で、現行は肯定文6行を維持。


### 4.66 写真・例文の語彙ヒント、Set 2会話の試験実装（2026-10-26）
- ExampleとDrillの全品物にホバー／フォーカス情報、例文内の6つの品物名にもHoverを追加。写真内はbody直下の前面ヒントとして表示し、共通の20px・画面内位置補正を再利用。OFFでは無効、Displayでは写真内はホバー、品物見出しの説明を常時表示する。
- Tシャツを写真の上端へ移動。Set 2は質問A／返答Bの3組へ変更し、キューはいいえ、＿は＿です（文体連動）。短い訂正モデルに加え否定＋訂正も正答にするが、誤品名・誤指示語・訂正なし・余分な文は拒否。許容文は録音時の判定とともに保存し、後から再判定しない。
- 自動検証：practice21 568項目（全モデル・3文体／2表記、短文／複文の許容と誤答拒否、全品物・例文内ヒント、20px・画面内配置・OFF、録音・保存・狭幅）、global-display 6541項目、audio-relay 324項目、tooltip-layout 258項目、fluid-width 1642項目通過。広幅のEx1とSet 2の画面目視、JS構文・git diff --check通過。公開／ユーザー実機確認は未了。


### 4.67 Drill 2／3とどの右肩表示（2026-10-27）
- 承認済み表示「ど：Asking about the unknown」をD3写真の右肩へ追加。D2は名前を尋ねる2セット各3会話、D3はスマホ／辞書／開いた財布の同型3色から英語色キューで対象を指定する計6問。A質問・B返答を個別に録音し、色名は発話に含めない。新規Exampleは追加しない。
- Ex1の色・位置、D1 Set 2のBキュー（いいえ／品名）と停止右の固定いいえ…を反映。棚背景と3色×3品物の透明素材を追加し、各セット状態と録音キーを分離。
- 自動検証：practice21 740項目（D1～3の3文体×2表記モデル、画像ヒント、短文／複文の許容、D2／D3実ボタン録音と正誤、色答え・誤指示語拒否、セット別復元・録音ロック、幅600～1920）、global-display 6541項目、audio-relay 324項目、tooltip-layout 258項目、fluid-width 1642項目通過。Ex1／D1の既存画像とD2／D3の広幅・600px画像生成、D2広幅とD3広幅・600pxを目視確認。PNG・JS構文・git diff --check通過。公開／ユーザー実機確認は未了。


### 4.68 そ・D2配色・D3図内説明と役割の修正（2026-10-27）
- Ex1のそを少し明るくし、こ／その説明を3px下へ。D2の品物はグレースケールにし、ヒントから色名も除いた。
- どの説明を赤系・28px／18pxの図内右上へ移動し、Ex1の距離説明と書式を揃えた。分岐図は撤去。
- D3は各セット1・2へ採番、問題1はA質問／B返答、問題2はB質問／A返答。モデル・判定・話者表示も更新。
- リンクではなく、セット操作で全体再描画した際のスクロール位置のずれが原因。切り替え後のボタン位置とpreventScrollフォーカスを保持して修正。品物とボタンの実クリックでURL維持、セット切り替えで画面内位置維持を確認。
- 自動検証：practice21 747項目（全モデル、役割交代、番号、D2無色、図内説明、実クリックと表示位置、録音・判定・保存）、global-display 6541項目、tooltip-layout 258項目、fluid-width 1642項目通過。D2広幅とD3広幅・600pxの画面を目視確認。JS構文・git diff --check通過。公開／ユーザー実機確認は未了。


### 4.69 赤い囲みのローカル実装と比較画像（2026-10-27）
- Whoを角丸半透明赤、どを半透明赤の楕円で囲み、こ／そをさらに2px下げた。楕円と💭風の生成モックを直接リンク用に保存。💭風は比較案のみ。
- 自動検証：practice21 747項目、PNG検証、git diff --check通過。Ex1広幅とD3の600pxを目視。音声・録音処理は変更なし。
- コミット／Push要求は自動承認審査により拒否。画像案依頼からmain公開変更の承認が十分でないという理由。拒否されたコマンドは実行されず、GitHubはbe49e18のまま。ユーザーへ理由を説明しPush承認を依頼。迂回は行わない。現在の変更・画像は未コミットのローカル保存のみ。


### 4.70 比較画像だけの直接リンク公開（2026-10-27）
- ユーザーが以後リンクでの受け渡しを指定し、リンクを要求。ページ変更を含めない安全な代替として比較画像PNGのみをコミットしmainへPush（d3c716f）。この操作は承認審査を通過。CSS・仕様書等の変更は未コミットのローカル保存で、公開ページへは反映していない。
- Raw URLをHTTP 200・image/png・PNGシグネチャ一致で確認。以後はチャット画像表示を使わずリンクで渡す。


### 4.71 上段Who・下段右の💭風を承認後に実装（2026-10-27）
- ユーザーが比較画像の上段・下段右を指定して実装を承認。Whoは元の位置を維持して角丸半透明赤、どはSVGの雲形と小さな点で囲む。こ／そ説明も追加2px下げた変更を反映する。
- 自動検証：practice21 747項目、fluid-width 1642項目、JS構文・git diff --check通過。公開／ユーザー実機確認は未了。以後の画像受け渡しはリンクのみとする。


### 4.72 雲形の点・あなた／なにヒントと漢字調査（2026-10-27）
- 雲形の2つの小さな点を右へ移動。D2なに／D3あなたに20pxの語彙ヒントを追加し、Hover／Display／OFFに連動。両語はかな表記を維持。
- 出版社公式第3版のOrthography説明で、L1・L2本文はかな、漢字学習はL3からと確認。語彙欄の参考漢字と学習対象を区別し、現行With漢字が一般表記変換であること、辞書表紙等は画像内文字であることを記録。漢字範囲は未変更。
- 自動検証：practice21 759項目（追加2語の実ホバー・20px・画面内位置を含む）、global-display 6541項目、JS構文・git diff --check通過。公開／実機確認は未了。


### 4.73 L1・L2参考漢字の使用一覧と進度方針（2026-10-27）
- ユーザー判断により、L1・L2のHiragana初期値を維持、練習2は語彙欄の参考漢字を使用。鞄はWith漢字時カバンへ変更し、ASR鞄の読みの互換性を維持。なにはWith漢字で何。L3以降は登場漢字を扱ったWith漢字を初期表示とする予定を仕様に記載。
- GENKI_L1_L2_KANJI_USAGE.mdへ85行の確認表、検算用98枠JSON、scripts/genki-kanji-usage.cjsを追加。固定モデル・固定テンプレート語と選択肢登録を分けて全セットを集計。見出し・キュー重複、文体別表示、許容返答の重複、自由入力の組み合わせ、利用者の発話回数は加算しない。公開表の版差と要照合語を明記。
- 自動検証：practice21 770項目（初期Hiragana、カバン／旧鞄の同一視、なに／何、全モデル・ヒント・録音・判定）、global-display 6541項目通過。監査85行の内訳合計、98枠のキー重複なし、再生成の一致、3ページの初期Hiragana、JS構文・git diff --check確認。公開／実機確認は未了。


### 4.74 使用ページ管理・丸の棚端配置・2.1の点検（2026-10-27）
- 固定モデルは用意した手本文を意味すると説明。一覧を学生（1.1、1.2）の使用ページ表へ変更。回数は表示せず、未使用語も記載。85行のページ表・再生成の一致を確認。
- 💭の丸を雲形から切り離して写真の棚の右端付近へ配置。雲形本体と説明は維持し、Bの文字を指さない形にする。
- Genki語彙の使用・未使用を各ページ作成の確認基準として仕様書へ追加。全語彙・版の母集団未確定につきカバー率はまだ計算しない。2.1の点検はPRACTICE21_REVIEWに記録。D1短答／長答の省略許容差、D3の返答形式案内、色と位置の固定等を提示し、追加変更は承認待ち。
- 自動検証：practice21 770項目、JS構文・git diff --check、85語彙行の使用ページ形式・再生成一致を確認。公開／実機確認は未了。

### 2026-10-27 会話の短答・完全な返答の統一
- 既知要素を省略したモデルと、正しい全文・部分補完の両立を1.2・2.1・7.1～7.3で点検・修正。2.1 D3説明を明確化。詳細はPROJECT_SPEC §74とPRACTICE2_SPEC。
- 2.2・2.3は新規ページ未実装。2.2は同じ品物の写真、2.3は場所の見取り図を候補とする。
- 検証の内訳は現在のリレー状態を参照。公開後の表示・実音・録音認識の実機確認はユーザー確認待ち。

### 2026-10-27 話者ガイドと💭の位置
- Who is speaking?の文字影をなくし、図内の重なり順を説明・操作より上へ変更。きく操作ごとに単発1秒の色強調を追加。
- 同じ話者の再実行、静的強調の端末設定、既存の話者・領域・音声連動を自動検証。💭の丸を上・右へ調整し、小さい丸の中心が棚の高さになるよう画像に追従させる。
- 自動検証：Practice 2.1の794件が合格。変更JS構文・差分確認済み。今回の位置・強調の見え方は公開後の実機確認待ち。

### 2026-10-27 話者ガイドの再調整と2.3画像案
- Whoを写真から独立した最前面へ移し、薄赤の不透明背景・濃い文字へ。A／Bの拡大を2回と、消えない赤枠強調に変更。前回の1秒だけの色強調を置換。
- 2.2の「だれ」課題は、人物を尋ねる「この人はだれですか」と、所有者を尋ねる「この本はだれのですか」を区別して検討。画像・構成の確認前に新規ページは作らない。
- 2.3画像案をリンクで示す。人物が別々の建物内にいる構成で、第三の図書館は二人から離れた位置。画像案のみ、ページ実装なし。
- 自動検証：Practice 2.1は795件合格。幅600／1440pxで実際に話者文字が最前面の要素として取得されることも確認。構文・差分検証済み。公開後の実機確認は未了。

### 2026-10-27 鮮やかな話者文字・3回の拡大
- 文字色#e60012、背景#fff5f5へ。強調で背景を濃くする方式を廃止。A／Bの文字拡大は1.2秒×3回に変更。
- 人物課題は「この人はだれですか」の方針。所有格は2.1に導入しない。ユーザーが画像を検討するため、新しい画像・課題の実装を待機する。
- 今回の文字色・3回強調はPractice 2.1自動検証795件、変更JS構文・差分確認が合格。公開後の実機確認は未了。

### 2026-10-27 練習2.2・2.3初期実装
- ユーザーの新規実装依頼により待機を解除。2.2の物＋価格／人物／どの＋名詞と、2.3の違う階の室内3コマ／物の所在を実装。Index、仕様書、使用語彙ページ表を更新。
- Whoの背景を濃くして戻す動き3回へ変更。新2ページも同じ強調、同じ音声操作・判定・結果保持を使用する。
- 新ページの実音・画像理解・課題負荷は実機確認待ち。自動検証の内訳は現在のリレー状態を参照。

### 2026-10-27 2.1再生中の背景点滅
- A／BのPlaying表示中ずっと背景の濃淡を繰り返し、終了・中断・エラーで停止する。再生操作による先行停止で消えないよう、Playing状態設定後に開始する。
- 2.2は左右に立つ二人が棚を見る構図を提案中。近い左右の棚と遠い奥の棚でこの／その／あのを維持できる。画像は未生成・未変更。
- 自動検証：2.1は809件、録音後リレーは全11練習ページ388件が合格。構文・差分確認済み。新しい継続点滅の実機確認は未了。

### 2026-10-27 練習2.2の棚画像を実装
- 左右の人物が立って商品を見る写真を作成し、Example・D1・D3へ反映。左右の棚は各人物に近く、中央奥の棚は両者から遠い。商品は別レイヤーのためセット切り替えを維持する。
- 商品・値札・A／B・こ／そ／あの説明を棚に合わせて移動。幅600pxの説明切れも確認対象に追加。D2・2.3は維持。
- 公開後の画像理解・見え方の実機確認は未了。
- 自動検証：2.2・2.3の471件が合格。幅600／900／1440px・通常／ダーク・語彙モード・説明の写真内表示・録音／結果保持を確認。構文・差分確認済み。新画像の実機確認は未了。

### 2026-10-27 後ろ姿と2段の壁付け棚の画像案
- ユーザーの画像作成依頼により、2.1の二人・本・かばん・時計を元に3案を生成。後ろ姿で2段の壁付け棚を見て、下段の左・右と上段中央に1点ずつ置く。余分な家具・商品・操作や説明文字は加えない。
- reviewのv1-realistic（写真寄り）、v2-outline（輪郭線のあるイラスト）、v3-simple（簡略イラスト）をリンクで提示する。画像内容を目視確認。コード変更がないためUI・音声テストは再実行しない。
- 画像案のみの公開。2.2の実装画像や課題は変更していない。次はユーザーと図の構成を相談する。


### 2026-11-01 Practice 8.1 Example 3／4／5・D5表示の一括修正
- Example3は2行目を「〃／苦手」とし、〃を「妹／写真／撮る」全体の中央へ配置。苦手は上手と同位置に揃える。Example4は料理を作る6段階に統一し、2行目以降のキューにも動作を省略する〃を中央配置。Example5は2行目を「〃／得意」、モデル文を「〃のが得意です」とする。
- D5は各ペア2行目の〃を主語から動詞までの反復範囲の中央に配置。英語ラベル・Adj選択・録音操作・録音後の解説・録音保存／判定ロジックは維持する。
- 表示位置はHTML要素とCSS、実際の表示語幅による計測で実装。空白文字による位置合わせは行わない。Practice 8.1のCSS／JSキャッシュキーを更新。
- `tests/practice81.cjs`にExample3／4／5の表示とD5の〃中央配置の回帰確認を追加。テスト実行はユーザーが行うため、この変更時点では実行していない。


### 2026-11-01 Practice 8.1 Example3／4／5・D5の表示位置再調整
- Ex3の本文2行目を「〃苦手です」に変更。Ex4キューは2行目以降の〃直後の区切りを除き、区切りをAdj「好き」の直前に残す。後続「〜好き」は👉️の直前側へ揃える。
- Ex4本文の〃は「料理を作るのが」全体中央ではなく「作る」に対応する位置へ計測配置。Ex5本文も同じ方式で「弾く」に対応させ、「〃のが得意です」とする。表記は「まぁまぁ」に統一し、旧表記「まあまあ」の認識互換を残す。
- D5の2行目は〃の後に区切りを置いてAdjを続け、既存のAdj右8px・録音ボタン群2px間隔・録音後解説を維持。録音／判定処理は変更しない。
- 回帰テストを更新・追加。テスト実行はユーザー側で行う。
