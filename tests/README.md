# 音声操作の回帰テスト

Playwright（Node.jsパッケージ）とChromiumが利用できる環境で、リポジトリ直下から実行する。

```bash
node tests/audio-transitions.cjs
node tests/audio-lifecycle.cjs
node tests/audio-recovery.cjs
node tests/audio-relay.cjs
node tests/answer-rules.cjs
node tests/voice-default.cjs
node tests/css-regression.cjs
```

Chromiumが `/usr/bin/chromium` にない場合は `CHROMIUM_PATH` に実行ファイルのパスを指定する。
Playwrightはテスト実行環境に用意する。サイト自体にビルドやnpm依存は追加していない。

- `audio-transitions.cjs`：80項目。作文・発音1・発音2で、有効な録音→自動再生→次行、Labの左→右→左、録音→再生→モデル音→再録音、許可拒否からの復帰、Autostop ON→OFF、禁止カーソル、モデル収音の終了通知欠落、発音2のリレー／手動／LabのPlaying表示と再生中Autoplay切替許可、Casual無効化、ℹ️案内を検証する。マウスクリックはPlaywright、Recorder／認識終了は非同期で実行する。
- `audio-recovery.cjs`：88項目。全8ページのTTS20秒、録音再生duration＋3秒／未取得時23秒、作文の個別・リレー表示、Lab解析10秒、完了しないdecode／close、録音保持・再試行・遅い結果の破棄を確認する。実Workerの元の計算との一致、CPUを占有するWorkerの期限中断も検証する。
- `audio-relay.cjs`：292項目。全8ページで実際に録音を完了させ、自動リレー全区間の両表示、途中OFF後の継続、次回録音への設定適用、個別再生表示、TTSエラー時の中止と録音保持、別再生・次録音によるキャンセル、遅い通知の破棄、両LabのInstructionとTTSエラー時のマイク解放を確認する。
- `audio-lifecycle.cjs`：167項目。全8ページのロック、再生キャンセル、遅いイベント、ページ離脱、Voice変更とモデル曲線の無効化を確認する。

音声合成・マイク・録音・デコード・ピッチ値には制御可能な代替を使用し、回復テストの一部では実Workerと合成波形も使用する。実際の音声認識精度、TTS発音、ピッチ品質、ChromeOS固有の許可UIを保証するテストではない。初期の167項目だけでは有効録音後の連続操作によるロック競合を検出できなかったため、再現可能な回帰テストを追加した。

- `answer-rules.cjs`：255項目。認識対象7ページの全対応文体でよ／ね／よね、Formal質問のか、数字の表記差、主語と目的語の区別、時間条件、言い直し、Habit必須語を検証する。文字列を実際のページ判定関数へ入力する検証であり、マイク認識精度の試験ではない。

- `voice-default.cjs`：112項目。全8ページで日本語3の初期選択・実際のUtteranceのvoice指定、全角／空白／英語表記、保存済み手動設定、候補不在、遅い一覧、Edge・Brave相当の優先順位維持を代替音声一覧で検証する。実機の音声名・音質確認とは区別する。

- `css-regression.cjs`：整理前のf893dd6のCSSと現行CSSを、同一DOMの計算済みスタイル・寸法・スクリーンショットの画素で比較する。全9ページ、明色／暗色、1280／600px、文体・表示・ヒント・キュー・Voiceメニュー・再生・マイク待機を対象とする。アニメーションとスクロール位置を固定する。Node.jsのpngjsも実行環境に用意する。`CSS_BASELINE=/path/to/style.css` で比較元を指定できる。比較用CSSの入替以外の製品コードの操作は実際のクリックで行う。
- リレーテストはモデルTTSの指定値（練習1は0.75、練習7は0.8、作文・発音は0.9）・録音再生1.0の確認を追加した。モデルTTSの値は厳密な実時間比率を保証しない。

## 開発用モデル音声収録

`node tests/model-recorder.cjs`：共有許可とTTSを代替し、Web Audioの合成信号を**実際のChromium MediaRecorder**で記録する。実デコード、WAV生成、ZIPのCRC・manifest・WAVヘッダー／フレーム、無音、共有拒否／音声なし、遅い共有の解放、条件変更後の再確認、TTSエラー／期限、デコード期限／遅い結果、中止／共有終了／部分完成の保持を確認する。ZIPの検証にはPython 3標準ライブラリも使用。実TTSのタブ／システム共有への経路、Windowsの共有ダイアログ、実音声のアクセントは実機で別途確認する。


## Practice 1.2の表示サイズ試験

`node tests/display-size.cjs`：1.2の130%相当固定、Size選択撤去、旧保存値の無視、保存不可環境での起動、他ページ非影響を確認。再描画で録音URL・元の結果・再生ボタンが残ることも確認する。4幅（1440／1100／900／600px）×通常／ダーク×3文体×Vocab OFF／Hover／Display×漢字／ひらがなの144配置でExample・問題行・設定の横はみ出しとYes／No応答の組を確認する。ブラウザ標準ズームの操作や実音声品質のテストではない。

- 表示サイズ試験には1440／1280px・Vocab Hover／Displayで、Example 1の質問と最初の問題操作が収まるときに同じ行を使う確認も含む。横はみ出し防止だけでなく、不必要な強制改行の再発も確認する。

- 列揃えの検証：144配置それぞれでDrill内の全質問／応答の「きく」X座標と、Exampleの各行の最初の「きく」X座標を照合。Yes／Noの音声が折り返す場合も左端を照合。Yes/No（Lucideアイコン）Textの並び、Text／Hide時の本文表示ときくの位置不変、専攻選択後のText有効化、幅上限1280pxと最低外側余白32pxも確認する。


`node tests/preview73.cjs`：7.3の130%試験を4幅×2配色×3文体×3Vocab設定×2表記で確認し、1.2の「の」2箇所と「なんですか／何ですか」全体の強調を検証する。

再生リレー試験の中断操作は、録音した同じ行の「とる」をPlaywrightの実クリックで押す。モデル段階／録音段階と遅い旧終了通知を確認する。ブラウザ音声APIは代替しており、実ChromeOSの音響的停止は別途確認が必要。

- リレー試験には1.2の5問目「いもうと／フリーター」の疑問文とNo返答を指定した8条件（Auto／Manual × 質問／No × モデル／録音）も含む。マイク許可を保留して、許可応答前の停止を確認する。

- 1.2でTTSのspeakingがcancel後もしばらく残る代替条件を追加。停止確認前はマイク・Recorder・認識を開始せず、解除後の開始、期限切れの案内・ロック解除、旧通知の無効化を確認。変更前ソースでは停止待ち条件に失敗することを別途確認。


`node tests/example-order.cjs`：練習7の3ページ×4幅×2配色×3文体×3Vocab×2表記で全Exampleを確認。先頭区分、キュー、矢印、音声、本文の5列順序（Yes／No応答は区分＋結合セル）、区分の重複がないこと、横はみ出し、実行時エラーを検証する。


`node tests/global-display.cjs`：全公開9ページの130%基準、1440／1100／900／600px、通常／ダーク、文体・Vocab・表記を検証。主要領域の横はみ出し、Exampleの過度な縦長化、単一区分見出しとYes/No縦並び、7.3の実測キュー直後の操作列を確認する。ツールチップは寸法試験中だけ非表示にし、非表示ツールチップによる偽の横はみ出しを除く。
- 全ページ130%展開後はdisplay-sizeの他ページ確認も130%を期待する。example-orderはQ/R型で先頭共通見出し1個を許容し、各行の重複区分を禁止する。
- native speech停止遅延の試験は全8ページに拡大。Y/NページではNo選択後の次応答へ移り、解除前のマイク非起動・停止解除後の開始・遅い旧通知の無効化・期限切れの案内とロック解除を確認する。
- css-regressionは古い整理前CSSとの同一性試験であり、今回の意図した130%／配置変更とは互換しない。今回の表示検証はglobal-display等で行う。

- Example順序試験に、7.1／7.2／7.3 Example 2の質問・Yes・Noの3ボタンの開始位置と上下順を全設定で検証する項目、および広い画面の短いキューと矢印の間が列間隔だけであることの確認を追加した。


- Text撤去後、global-displayは全ページ・各設定でText/Hideボタンが生成されないことを確認。display-sizeはY/N選択の維持、専攻選択後の応答録音有効化、Text非生成を確認する。旧Text表示/非表示操作の試験は撤去済み。
- Example 2の応答は結合セルから5セル×2行に変更。example-orderは質問・Yes・Noの3音声ボタンを直接測定し、同一親Gridで開始列と上下順が揃うことを検証する。


`node tests/fluid-width.cjs`：全公開9ページ、通常/ダーク、Vocab各設定、画面1440/1442/1600/1920/2080/2560pxを検証。本文幅の連続計算・1600上限・左右余白、キュー/音声/録音/停止の横位置不変、録音結果側への同量の幅拡張、長い認識結果の表示・横はみ出しを確認する。音声操作の一体化は実装していない。

- display-sizeは1.2の両Exampleについて、矢印ときくが同じ段で隣接（要素間12px以内）することを全144設定で測定する。キューの長さ・折り返しにより矢印だけ上段へ残る配置を禁止する。
- 表示仕様の現行一覧・点検で発見した判断候補はdocs/UI_LAYOUT_SPEC.mdを参照。


`node tests/layout-rules.cjs`：文法5ページのExampleをカード内容幅849/850/851px前後で確認し、段組み境界の統一を検証。7.2ではキューのDisplayヒント維持・モデル本文のヒント非表示、表記/英語キュー変更後の区分欄保持も確認する。example-orderは7.2だけで全設定のきく/とる/停止の列揃え、色付きラベル自体の自然幅維持を確認し、他ページへの試験非展開も検証する。global-displayは全ページのExample本文に語彙ヒントが生成されないことを確認する。

- 7.2区分試験を更新：example-orderは色付きラベル本体の等幅・Past各文字間隔の均等性・操作列維持を確認する。layout-rulesは説明文が文言を維持した2つの行ブロックであることを確認する。

- 均等割付却下後は、example-orderが7.2の等幅背景と自然なテキストの中央位置・文字単位span撤去・録音/停止列を確認する。説明文の改行全体適用は未実装で、7.2の既存2ブロックを維持する。

- 説明文改訂後も、layout-rulesは7.2の課題とからの規則の2ブロックを確認する。全8ページ既定表示と7.1拡張モードの前後文面/段落数をブラウザDOMで比較し、docs/INSTRUCTION_REVIEW.mdへ記録した。

- 旧7.2限定試験はPast左右40pxだった。現在は下記の練習7共通仕様へ移行済み。

- 練習7の区分共通化：example-orderは3ページの背景が同じ比較範囲の最長自然幅に一致することを検証する。40px固定paddingは試験を終了し、短い名称の文字幅上限と残り余白の方式へ移行。

- 最新の区分検証は文字全体幅上限を撤回。追加字間が0〜3.5pxかつ背景幅内で可能な最大値であること、最長名称の字間が0であることを確認する。

- `node tests/tooltip-layout.cjs`：8練習ページ、600/1440px、通常/ダークで語彙20px・説明18pxと画面内配置を確認。

- `node tests/display-cue-lines.cjs`：7.3のDisplay語句単位改行、語句とヒントの対応、横はみ出し、Hover/OFF／英語キュー維持を4幅・2配色・3文体・2表記で検証。

- display-cue-linesは1.1／1.2／7.1／7.2も追加検証。Display限定の語句＋ヒント、改行、はみ出しと7.1拡張／英語キュー・7.2英語キューの区切り維持を確認。

- `node tests/listen-help.cjs`：全8ページの通常Listen説明撤去、4ページのY/N未選択理由、1.2 D2専攻選択理由、実ホバーとキーボード表示、選択後の説明撤去・再生有効化を検証。

- listen-helpは1.1 D2の「は」、D2／D3両条件の充足と入力消去時の理由復帰、1.2 D1のモデル未再生での録音有効化、とるへの選択理由、通常操作説明撤去も検証。

- `node tests/practice11-topic.cjs`：1.1 D2／D3の「は」表示と実ボタンからのTTS入力、全3文体・肯定否定モデル、D1 Casualと省略許容の維持を確認。実音声の品質は検証しない。

- `node tests/practice21.cjs`：現行はEx1の6モデル・話者と領域の交代・下部の文との対応を検証。初期の全Drill版からEx1専用の検証へ更新済み。

- 現在のpractice21テストはEx1のみ。3文体／2表記の6音声と話者・領域交代、下部モデル対応、600～1920pxのはみ出しを検証。2.1は録音UIを保留したためaudio-relayの対象から外し、既存8ページの検証を維持。図内ボタンはアイテムに追従するのでfluid-widthの固定きく列検証の対象外（ページ幅・はみ出しは継続）。

## 練習2.2・2.3

- `node tests/practice2-next.cjs`：練習2.2のモデル・指示語・人名・価格・場所・短答／全文の判定（2.2 D1のいくら会話・指示表現必須・価格のみ短答不可、D3の食品群・どの＋名詞が＋価格、両話者視点を含む）、録音とセット保持、表示の検証。
- `NEXT_SCREENSHOT_DIR=/tmp/lesson2-preview node tests/practice2-next.cjs`でExampleとD2画像のスクリーンショットも保存する。
- global-display／audio-relay／tooltip-layout／fluid-widthの対象にも新2ページを追加。音声入力はモックのため、ブラウザ実音・認識精度の保証ではない。

- 練習2.1ではExampleとD1/D2/D3各セットの品目を合計18種・重複なしで検証し、D1/D2にスマホ・辞書・財布が含まれないことも確認する。

- `node tests/tts-model-script.cjs`：公開11練習ページの代表モデルを再生し、表示モードに依存せず漢字かな交じりの同じ文がTTSへ渡ることを22項目で確認する。音響品質の評価ではない。

- `node tests/practice23-cities.cjs`：2.3街課題の全モデル／文体・文字モード、話者での色交換、短答・全文・誤答、録音・セット保持、375〜1440pxの通常／ダーク・語彙モードを確認。

- 2.3再構成後は236件：人物＋都市／時間帯、図内D1音声から行録音への連携、何時、あなた／Cさんの所在、短答と全文の許容、文字と写真・頭部の分離と図内ボタンの収まりを375〜1440pxで確認。

- 2026-10-28：2.1はスマホの新Example 2と辞書／財布のD3、2.2は果物の誤強調・価格・図下レスポンシブ音声、2.3は写真内の色・右下音声を検証する。

- `node tests/speaker-guide.cjs`：練習2の全Exampleの初期Who、A/Bへの文言変更、Playing中の点滅と終了時Whoへの復帰、2.1 E2の画像内配置・D3案内撤去・財布位置、2.2に白い上部帯を足さないことを600/900/1440pxで検証。

- `node tests/section-spacing.cjs`：全11練習ページのExample→Drill 24px、2.1 E2図内音声・不透明ど案内、2.2 Example画像枠の統一を600/1440pxで検証。

- `node tests/english-cue-navigation.cjs`：7.3の下部パネルから英語/日本語へ切り替え、最初のExample上に1行分の余白を残して戻ることを375/600/900/1440px・かな/漢字で確認する。

- `node tests/settings-availability.cjs`：全11ページで設定絵文字の利用可否と選択状態を明暗テーマ・選択切替・再描画・OFFスイッチ・一時ロック/復元で照合。選択可能はカラー100%、不可かつ未選択は白黒55%、発音1の固定Hiragana/発音2Casualを含む。

- `node tests/practice23-cities.cjs`：現行2.3のEx1→D1人物/持ち物所在→D2 Country/Time/Citiesを検証。物の配置・返答者の指示語、短答/全文と誤答拒否、対象強調、セットごとの録音保持/録音中のロック、375/600/900/1440px表示を含む。

- practice23-citiesはD1全文モデル＋短答許容、D2のA表示撤去、D3各モード3会話、全Ex/Drillの話者点滅（質問/返答/録音/中断/終了）、誤指示語等の拒否、モードごとの録音保持も検証する。

- 2.3 D3 Day：土日3会話、曜日ヒントと図内表示、文体/文字モード、短答・誤曜日拒否、話者点滅、結果保持、狭幅の表示をpractice23-cities.cjsで確認。

- 2.3 D1 Item 2：4問のY/N否定訂正、A/B視点交代、全文/短答と誤答拒否、文体別TTS、停止右の否定ガイド、録音・判定のセット間独立保持と表示幅をpractice23-cities.cjsで確認。

- 2.3のD1/D2交換後は新D1＝単文、新D2＝所在会話。Item2の否定＋短い場所モデル、許容する品名付き全文と旧録音キー保持を確認。

- 2.3 DayはSun./Sat.表示と日本語ホバー、Item1/Item2は背景施設ヒントなし・品物ヒントあり、Timeは重複しないヒントをpractice23-cities.cjsで確認。

- 2.3 D4 English cues：D1〜D3の各セット/トピックの英語化、日本語復帰、音声日本語/録音判定保持/録音ロック/狭幅をpractice23-cities.cjs、7.3と共通のEx1移動位置をenglish-cue-navigation.cjsで確認。

- 2.1 D4：各セット英語化/日本語復帰・録音保持・日本語音声・色キュー・録音中の切替ロックをpractice21.cjs、Ex1への移動をenglish-cue-navigation.cjsで検証。

- 2.2 D3人物セット：3題材切替/A asks・B asks各3会話、旧人物キー/認識結果保持、名前と指示語の判定、2:1画像・ラベル範囲をpractice2-next.cjsで確認。

- 2.2のD3は食品選択、D4は新疑問詞だれの独立課題。practice2-next.cjsはE4導入、A/B各3会話と人物名/指示語判定、食品と人物の結果独立保持を確認。

- 練習2人物名赤点滅：`node tests/lesson2-speaker-pulse.cjs`。2.1/2.2の全セット・全Example/Drillモデル、マイク準備/録音/録音再生、解除/受け渡し/古い終了通知、reduced-motion。2.3はpractice23-cities.cjs。Whoガイド背景点滅はspeaker-guide.cjsで別確認。

- 練習2の未指定空白：`node tests/lesson2-cue-spacing.cjs`。全セット・両Script・全Vocab・English cuesを走査し、語内/区切り前後の余計な空白を検出する。

- 2.2 D5傘比較：`node tests/practice22-umbrellas.cjs`。同じ傘のAdjectives/Pronouns、全Speech/Scriptモデル、指示語/形式誤答判定、所有対象/話者同期、録音排他と保持、375/600/1440px通常/ダークの枠内配置。

- 通常Drillのリレー間隔0秒：`node tests/relay-zero-gap.cjs`。全11ページの実録音後経路で、疑似TTS終了の同一コールバック内にAudio.playが呼ばれることを確認。録音内の無音や実機の音響的間隔の検証とは区別。

- STT表示規則：`node tests/stt-display.cjs`。全10対象ページのひらがな保持、課別カタカナ、専攻限定、Tシャツ/Form境界、同音語、全角記号・空白、誤答差分の文字対応を検証。音声認識品質の検証とは区別。

- 練習8.1：`node tests/practice81.cjs`。D1〜D5のモデル・選択・必須文型・文体と表示設定、文法と状況別フィードバックの分離、実録音と結果保持、画面幅/テーマを検証。8.1を音声ライフサイクル/リレー/STTの既存テストにも追加。

- 8.1改訂の追加検証：共通ゴールド実色とEx3主題、Y/N返答のListen/Recordロック、全文体での肯定/否定・短答/完全形、D4の順番、D5の7ペアの意味／印象と未選択ロックをpractice81.cjsで確認。

- 共通Y/N Example：`node tests/common-yn-examples.cjs`。1.2・7.1・7.2・7.3・8.1の全文体で肯定/否定モデルの常時表示、標準化されたY/N音声ボタンの独立再生とDrill選択不変を照合。8.1固有の計算色・初期D5・Ex5主題強調はpractice81.cjs。

- 8.1の追加Example：D3の上手/苦手選択とEx3の2文、Ex4の6副詞・同一動作6文を検証。広幅の各Exampleで音声ボタン文字とモデルの最初の行にゼロ高さの基線測定要素を置き、外枠の上端ではなく文字の基線差を確認。

- 8.1の既定契約：通常項目名の共通クラス・太字・色・透明背景、Exampleの共通基線クラス、各副詞とガイド/選択欄の共通色・太字をpractice81.cjsで検証。項目名と時制区分の使い分けはAGENTS/UI_LAYOUT_SPECに登録。

- D5の2行常時表示：practice81.cjsで全7問×2行、固定英語ラベルと日本語形容詞選択、適合選択によるロック解除、各行のモデル音声・採点、録音中の選択ロック、独立した録音URL／原文／正誤の保持と設定変更後の復元を検証。問題の表示順と保存IDは分離する。

## 2026-10-30：Example限定の区分

`node tests/practice81.cjs`は、Example1のNoun/Verb＋のを維持し、対応Drillの区分が0個であることも確認する。Question/Responseは役割表示として維持。比較用HTML/画像の3案は未採用であり、本体の期待値へ混ぜない。

- Example4の省略表示：先頭行は全文、後続5行は副詞からのキュー・〃からの本文であることと、省略部分のアクセシビリティ用ラベルを確認。全3文体×両表記×6ボタンで、省略記号を含めず完全なモデル音声を再生することを検証する。

## 文型・人物・Q/Aの共通表記

`node tests/labels-and-speakers.cjs`で、1.1/1.2のtitle・h1・Index、全7対象JSのQ/A、練習2全3ページ・各セットのX/Y/Zラベルと旧名の不存在、文字/ひらがな/カタカナの名前照合、TTS専用読みを確認する。内部A/B/Cと画面名は別の期待値で検証。既存のpractice21/practice2-next/practice23-cities/practice22-umbrellas/speaker-guide/lesson2-speaker-pulseも新しい表示・モデルに合わせた期待値で維持する。

- `node tests/practice22-qa.cjs`：2.2限定Q/A役割アイコン・人物角丸の試験。順序、幅別表示、Ex2/Ex3矢印・音声の共有列、Ex1/Ex2/Ex3とD1〜D5両セットの図内外話者強調・終了解除、再描画、2.3への非影響。

- `node tests/example-arrow-alignment.cjs`：練習1/2/7/8の9ページ、幅600/1440の初期表示で同一Example内の👉️開始位置を比較する。

- `node tests/example-vertical-spacing.cjs`：全13練習ページの共通縦余白値・幅600/1440・通常/ダーク、2.2 E1/E2/E3の実測8px、Who案内撤去と画像内外の発話強調を確認。


## 共通会話表示

`node tests/shared-conversation-display.cjs`：全13練習ページの適用範囲、幅375/600/900/1440・通常/ダーク、Q/Aと人物色、画像内外の発話同期、どの/どれ質問で正答を先に示さないこと、返答時と停止時の対象表示を確認する。

`lesson2-speaker-pulse.cjs`は練習2の画像内外の人物色・白い外枠と準備/録音/再生/終了を確認する。`practice21.cjs`等の旧Who案内検査は、撤去と現在の枠強調へ更新済み。

`EXAMPLE_ORDER_SMOKE=1 node tests/example-order.cjs`は練習7の600/1440px・両テーマで全3文体/全3ヒント/両文字モードを分散した代表組合せを検査する。環境変数なしは従来の全組合せ検査。


`node tests/practice82.cjs`：8.2の全モデルと３文体/２表記/３ヒント、何か/何も/何でもと否定形、Y/NのListen/Record解除、短答、実録音/原文保持/０秒リレー/中断、狭幅と通常/ダークを検証する。共通表示・Example縦余白にも8.2を含める。

`node tests/practice81-cue-fit.cjs`：8.1 D5の375/600/768/1024/1440/1920px・両テーマ・両表記・Off/Hover/Display・未選択/誤選択/正選択/Notice表示を検証。ペア単位の整列、8pxのラベル／操作間隔、説明がある場合は説明末尾からの間隔、3個の操作ボタンと2px間隔、実描画の重なり・横はみ出し・クリップを測る。取り消された全ペア共通列／4px固定間隔は要求しない。

## Practice 8.1 ページ全体検証（2026-11-06）

対象は8.1のみ。他ページの全体テストを同時実行しない。音声APIはモックを使用し、実機の音質・発音・認識精度の検証と区別する。

- `node tests/practice81.cjs`：教材・文体・判定・録音・STT原文・保存状態・Example基線。
- `node tests/practice81-cue-fit.cjs`：全7ペアの配置マトリクス。
- `node tests/practice81-final.cjs`：確定タイトル／説明・問題順／保存ID・一体キュー・L8漢字・公式漢字マスターとのBeyond照合・Notice・開閉保持・ページ固有タッチ。
- `node tests/practice81-timing.cjs`：仮想時計によるAutostop、15秒未発話、20秒上限、マイク拒否後再試行、認識エラー。
- `PRACTICE_PAGES=practice8.1 node tests/audio-lifecycle.cjs`
- `PRACTICE_PAGES=practice8.1 node tests/audio-relay.cjs`

後二つの絞込み指定がない場合は従来どおり複数ページを検証する。上記は自動検証手順であり、それ自体でページ全体の合格やユーザー実機の確認完了を意味しない。語彙の初出課を漢字配当マスターから推測しない。

## 共通意味色・句読点の限定回帰（2026-11-06）

`node tests/semantic-colors.cjs` は11のPracticeと作文・発音の計14ページを対象に、意味色・太さ700・通常句読点・Example背景・英語ラベルの既存表示・375/1440px・両テーマ・両表記・利用可能な3文体・ヒント表示を検証する。文法の強調箇所がない作文・発音では、共通CSSの表示用fixtureと非影響を確認する。音声APIはモックで、実音質の確認ではない。

変更前の同じファイル構成を用意し、`SEMANTIC_BASELINE_ROOT=/path/to/baseline node tests/semantic-colors.cjs` と指定すると、表示文字・入力／選択肢・英語ラベル・操作UI配色・モデルTTS入力の変更前後比較も行う。HTMLの構造上の空白だけは表示文言比較から除く。テスト内だけCSS transition／animationを無効化し、切替途中の補間色ではなく最終表示を比較する。`SEMANTIC_REPORT` で結果JSONの保存先を指定できる。画像はリポジトリの実ファイルを使用する。

本テストは共通表示変更の限定回帰であり、各ページのページ全体テスト実施・合格やページ作業完了宣言を意味しない。正誤・時制・操作・警告・Beyond漢字の色を意味色へ一括置換しない。

## Example否定要素の限定回帰（2026-11-06）

`NEGATIVE_BASELINE_ROOT=/path/to/unchanged-checkout node tests/example-negative.cjs` は、11PracticeのExample表示を両テーマ・両表記・利用可能な3文体・375／1440pxで比較する。指定否定要素だけ共通否定色・太字700になり、残りの文字色／太さ、全文字、DrillのDOM・選択肢、モデルTTS入力が変更前と一致することを確認する。7.2の知る、8.3のわかる、8.2の既存否定色も非影響を確認。音声は既存モックであり、実音質・STT精度の試験ではない。

ブラウザ切替中の補間色はテスト内だけtransition／animationを無効化して除く。表示用関数の全9境界例、対象外の否定形、二重適用で変化しないことも検証する。結果JSONは一時領域へ出力し、`NEGATIVE_REPORT`で保存先を指定できる。本テストはページ全体テストではない。

## Practice 8.2 Preview Example配置の限定回帰

`P82_LAYOUT_BASELINE=/path/to/unchanged-preview node tests/practice82-example-layout.cjs` は8.1〜8.3の全Exampleを375／600／760／900／1024／1280px・両表記・両テーマで実測し、8.2 Ex1／Ex2の暗黙列なし、6px基準・英語右端整列、ボタン／日本語の非クリップ、横スクロールなしを確認する。基準コピーを指定すると8.1／8.3・8.2 Ex3／Ex4の相対配置、Drill DOM、モデルTTS入力を比較する。ヒント／文体／表記切替、実際の段組み境界の前後1px、全文英訳へのホバー／キーボード／タッチ、既存録音結果の状態保持も限定確認する。音声はモックであり実音質の確認ではない。`P82_LAYOUT_REPORT`で測定JSON保存先を変更可能。

既存practice82.cjsにはBeyond件数など今回のPreview実装に対応しない期待値が残っている。変更前からの失敗と今回の表示回帰を区別し、教材や古い期待値をこの限定修正のために書き換えない。ページ全体テストではない。

## 共通内容幅レイアウトの適合検査

`CONTENT_BASELINE=/path/to/unchanged-main node tests/content-layout.cjs` は全11PracticeのDrillを375／600／760／850／900／1024／1280px、両ScriptとVocab／文体／テーマ変更で実測する。キュー／操作の必要幅、実際の列・矩形、幅が足りる行の不必要な改行、ボタンの収容、表示文言・選択肢維持を検証する。`PRACTICE_PAGES`、`CONTENT_WIDTHS`で修正単位の再検証を絞り、`CONTENT_REPORT`で測定JSONの保存先を指定できる。基準コピーの比較では元の文言・フォーム状態を確認し、古い固定ブレークポイントを合格条件にしない。これはレイアウトの横断検査であり、教材・録音機能全体の包括テストではない。

- `node tests/content-examples.cjs`：共有Example（表形式・画像付き会話・8系グリッド）の7画面幅・両表記・3ヒント。セルと実描画文字の矩形、再生操作、重なり・横はみ出しを確認する。既存CSSで非表示の空セルは表示要素の矩形として扱わない。

- `node tests/content-layout-states.cjs`：Set／英語キュー／長い選択肢／文体／表記／CSS倍率の切替とアイドル安定性。倍率はCSS変数による100・130・140%相当の検証であり、実機ブラウザのズーム確認とは区別する。
- `node tests/content-layout-boundaries.cjs`：各ページの共通Drill行の実改行境界と前後1px、変更していない自然なインラインExample行。
- `content-examples.cjs`は共有行とセル内文字を検査する。写真内の図解・注釈同士の関係は別の視覚検査として扱い、行内文字の矩形判定に混ぜない。2.2 Ex3の狭幅注釈はHANDOVERの未解決事項を参照。

- `node tests/content-photograph-controls.cjs`：写真下の操作群、旧450px境界と実際の3列成立付近の検証。
- `CONTENT_BASELINE=/path/to/baseline node tests/content-food-callout.cjs`：承認済み2.2 Ex3注釈の価格衝突・写真内外の往復・ノード／字形／色／写真座標の維持と実境界前後1px。

- `CONTENT_BASELINE=/path/to/baseline node tests/content-price-cues.cjs`：2.2の価格が語中で改行されず、狭い共有列に収まり、全表示文字・フォーム・書体が変わらないことを確認する。

## 承認済みIcons8会話役割

`node tests/qa-icons.cjs`：該当する10Practiceの画像読込・役割対応・空欄・帰属リンク・両テーマ・1440/375px・両表記/3ヒント/3文体・セット/English cues切替・入力/録音結果のリサイズ保持をChromiumで検査する。音声APIは既存モックであり実音響検証ではない。`QA_BASELINE`に変更前ツリーを指定すると役割の実外寸・位置・フォーム状態も比較する。`QA_OUTPUT`に測定JSONと代表画像を保存できる。`QA_PAGES`で変更影響を受けるページだけに限定できる。

## Deutsche Übung 1.1: nach / in / zum / zur

`node tests/uebung11.cjs`：Deutsche Übung 1.1 の静的構造、4 Drills（各Ex 1問＋練習3問）、German variety設定（DE / AT / CH）、地域別モデル文・許容回答、Copy my sentences、DrillAudioセッション管理、HTML・JS・CSS設計契約を検証する。

## Practice 7.1 Drill 2 Yes/No回答選択の局所描画

`node tests/practice71-answer-selection.cjs`：Practice 7.1 Drill 2 の Yes/No 選択操作において、対象行の回答セルのみを局所更新し、Drill 1 や他の設問を再描画しないこと、`aria-pressed` および `.is-selected` が即時同期すること、Yes/No 切替や同一ボタン連続クリックで不具合がないこと、回答別録音結果の復元、モデル音声TTS排他制御、および With漢字／Hiragana Only 切替や 375/600/1440px での状態維持を検証する。

## 全11ページ E2E総合回帰テスト

`node tests/e2e-all-practice-pages.cjs`（または `npm run test:e2e`）：
全11 Practiceページ（1.1, 1.2, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3）を実ブラウザ（Playwright Chromium）で自動横断検証する包括的E2Eテスト（1,071検証項目）。
- **正常読み込みとJS例外なし**: 全11ページで未処理例外（uncaught runtime errors）0件を確認。
- **スラッシュキュー仕様検証**: 全角 `／` の完全排除、日本語キューのページ別スペース規則維持（1.1は `わたし / がくせい`、他は `これ/なに`、`その/かばん` 等のコンパクト表記）、English Cues ON時の前後半角スペース付き半角スラッシュ（`word / word`）およびページ別代表英単語キュー（`I / student`, `older brother / student`, `this / …`, `that / bag` 等）の実描画自動検証（語彙訳内のスラッシュ等は除外）。
- **Vocab / Script切替**: Vocab OFF/Hover/Display時の表示破綻なし、With漢字／Hiragana Only切替時の状態維持。
- **回答選択と局所更新・DOM Churn監査**:
  - Practice 7.1: Drill 2 Yes/No選択時に行1のDOMノード同一性を検証し、全体再描画（DOM churn）が発生せず局所更新が行われていることを実証。
  - Practice 7.2: Drill 2 Yes/No選択の属性同期・状態保持と再描画動作の検証。
  - Practice 1.2: Drill 1 Yes/NoおよびDrill 2 Select（専攻選択）の状態が、With漢字／Hiragana OnlyおよびEnglish Cues切替をまたいで確実に保持されることを検証。
- **音声・録音排他制御**: モデル音声再生（`speechSynthesis.speak` 発火および発話内容の非空日本語テキスト検証）、録音開始時の先行音声中断（Cancel）、操作ロックの解放。
- **レスポンシブ検証**: 375px（モバイル）、600px（タブレット）、1440px（PC）の3画面幅で横スクロールはみ出し（horizontal overflow）がないこと、キュー要素の画面外クリップがないこと、およびキュー文字列の1文字縦落ち（single-character vertical collapse）が発生していないことを要素バウンディングボックスで実測検証。
- **Practice 8.1 〃 位置合わせ**: 比較設問におけるDitto Mark（`〃`）およびスペーサー要素の整合性。
