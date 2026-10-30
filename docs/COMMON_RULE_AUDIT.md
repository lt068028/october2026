# 共通仕様の照合（2026-10-29）

- 2026-10-30確定ルール・全10対象ページへ実装：[STT_DISPLAY_RULES.md](STT_DISPLAY_RULES.md)。専攻表記の強制は1.2だけ。他ページへ無条件の共通化をしない。

- 追加点検：練習2キューの空白混入は[CUE_SPACING_AUDIT.md](CUE_SPACING_AUDIT.md)。未指定スペースを追加しない規則をUI_LAYOUT_SPECに明記。

対象：Index＋全11練習ページ。表示/説明/設定/操作/音声/回答の既存共通ルールと、仕様書・実装・既存検証の対応を確認した。履歴中の古い値を現行ルールとして使用しない。今回すべての音声・表示テストを再実行したという意味ではない。

## 今回の修正・不足整理

| 項目 | 確認結果・対応 |
| --- | --- |
| Drill説明の💡 | 前回まで共通ルールの明記がなく短縮時に欠落。全Drill説明の先頭として明記済み。文言だけの変更でも維持する。 |
| 2.2 D3の補足 | 一文のみへ確定した後も個別仕様に「単複の補足を付ける」が残存。削除し、説明は「💡Ask with どの＋noun.」に固定。単複の学習内容自体は維持。 |
| English cues移動 | 旧Example移動記録が残る。現行は最初のDrill見出し＋本文1行余白。UI_LAYOUT_SPEC冒頭を優先し、旧記録を採用しない。2.2は機能未実装。 |
| Example本文の語彙Hover | 旧一般則「キューだけ」を練習2に無条件適用すると、ユーザーが承認した画像/Example語彙Hoverと矛盾。練習2の画像教材・Example語彙は個別仕様の適用を明記。 |
| 2.1 Example構成 | UI一覧の古い「Ex1のみ、追加Exampleなし」は現行E2と矛盾。PRACTICE2_SPECの現行E1/E2・D1〜D3・D4構成へ訂正。 |
| 話者赤点滅 | 2.1/2.2にも実装。全3ページの適用範囲と検証は[LESSON2_SPEAKER_AUDIT.md](LESSON2_SPEAKER_AUDIT.md)。Who案内の背景点滅と人物名の赤点滅を区別する。 |
| Ex4の要否 | ユーザー選定済み。Ex4を撤去しD4説明「💡Use だれ to ask who someone is.」でだれを太字＋ゴールドで導入。 |

## 既存ルールの確認先

| 共通事項 | 確定仕様の所在 | 実装・既存検証の確認先 |
| --- | --- | --- |
| 130%・本文幅・余剰幅配分・列揃え・折り返し | UI_LAYOUT_SPEC「確定事項」「キュー・矢印・音声列」 | style.css、tests/fluid-width.cjs、layout-rules.cjs、global-display.cjs |
| E→対応Dの順序・24px/次節40px | UI_LAYOUT_SPEC、各ページ仕様 | tests/example-order.cjs、section-spacing.cjs |
| 💡・短い課題説明・段落分離 | UI_LAYOUT_SPEC「説明文の段落・文言」 | 各ページ説明生成処理。初期全11ページ33欄の💡を前回確認。今回2.2 D1/D2/D3文言を検証に追加 |
| 文法だけ太字＋ゴールド | UI_LAYOUT_SPEC「区分と強調」 | style.css、tests/css-regression.cjs。見出し等すべての太字へ拡張しない |
| 練習7比較区分の共通幅・字間最大3.5px | UI_LAYOUT_SPEC「区分幅」 | style.css・練習7の内容幅測定処理 |
| Y/N選択と再生分離・Text撤去 | UI_LAYOUT_SPEC「確定事項」 | 各Drill生成処理、tests/listen-help.cjs、global-display.cjs |
| 選択可の未選択と選択不可の区別 | PROJECT_SPECのグローバル設定利用可否 | style.css、tests/settings-availability.cjs。選択不可かつ未選択の絵文字だけ白黒55% |
| 通常操作説明を撤去・条件不足のみ案内 | UI_LAYOUT_SPEC「操作説明と前提条件」 | tests/listen-help.cjs。きく・とるに同じ条件を適用 |
| 語彙20px/操作18px・画面内幅・Display語句単位改行 | UI_LAYOUT_SPEC「ツールチップ」 | tooltip-layout.js、tests/tooltip-layout.cjs、display-cue-lines.cjs |
| 同一Hover内の重複情報を省く | PROJECT_SPECの2026-10-29 Hover重複整理 | 各ページヒント整形。読み/英訳の同一情報を重ねない。必要な別情報は残す |
| 再生・録音の排他/中断・古い終了処理を無効化 | PROJECT_SPEC §6ほか音声ライフサイクル | drill-audio-session.js、tests/audio-lifecycle.cjs、audio-transitions.cjs、audio-recovery.cjs |
| 設定/セット切替後の録音・認識・結果保持 | UI_LAYOUT_SPEC、各ページ仕様 | 各ページ状態管理、tests/practice21.cjs、practice2-next.cjs、practice23-cities.cjs |
| 短答・全文補完の許容/必須要素の例外 | PROJECT_SPEC、PRACTICE2_SPEC、PRACTICE22_23_SPEC | drill-answer-rules.jsと各課題の登録済み許容文。2.2 D2は指示語＋名詞＋価格必須 |
| 練習2以降、文脈上自然な「も」 | PROJECT_SPEC冒頭 | 各ページモデル/許容文。独立問題に機械的に付加しない |
| Genki進度・初期表記・カバン・L3未習内容 | PRACTICE2_SPEC、PRACTICE22_23_SPEC、PROJECT_SPEC | 各課題語彙/モデル、scripts/genki-kanji-usage.cjs。土日/何曜日は承認済み例外 |

## 今後の変更時に確認すること

新しい統一指示を受けたら、対象ページ/対象外、標準状態/操作中/終了時、例外を仕様書に記す。文言だけの短縮でも💡・役割表示・必要な学習要素を個別に確認する。既存の統一済み事項と提案/未実装を混同しない。旧仕様と衝突する箇所は現行記述を訂正するか、旧履歴であると明示する。実装差が見つかっても未承認の挙動を自動で新仕様にしない。
