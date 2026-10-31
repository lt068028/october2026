# 練習8.1：VerbのがAdj

更新：2026-10-30。ユーザー承認の青写真に基づく初回実装。ページタイトル・h1・Indexは `Practice 8.1: VerbのがAdj`。

## 構成

Example1→D1→Example2→D2→Example3→D3→Example4→D4→Example5→D5。各Drill説明は💡で開始。Exampleと対応Drillの間隔24px、次節40px。全ページ共通130%・本文幅・ボタン寸法・設定アイコン・語彙ヒント仕様を適用。

### D1：Nounが好き／Verbのが好き

3問×2行。それぞれ独立してモデル再生・録音・停止・文字抽出。

| キュー | 名詞のモデル | 動作のモデル |
| --- | --- | --- |
| 本／読む／好き | 本が好きです。 | 本を読むのが好きです。 |
| 音楽／聞く／好き | 音楽が好きです。 | 音楽を聞くのが好きです。 |
| 写真／撮る／好き | 写真が好きです。 | 写真を撮るのが好きです。 |

名詞の行には動詞を出さない。Noun／Verb＋のの項目名はExample1内だけに表示し、Drill内には出さない。Exampleの項目名は背景バッジを使わず、練習1のexample-label-titleを使う。動作の行では動詞＋のがを必須とする。

### D2：Yes/No questions with 好き／きらい

本／読む／好き、部屋／掃除する／きらい、写真／撮る／好き、洗濯／する／きらいの4問×Question/Response。好き・きらいは交互に教材側で固定し、好みのプルダウンは撤去。Questionは動作＋のが好き/きらいですか、Responseは🙆/🙅を選択して答える。

Example2はQuestion・肯定・否定の3モデルを常時表示し、🔊きく／🔊🙆／🔊🙅を同じ縦列へ配置。返答群のA:表示は1個。個々の音声は独立し、Drill選択を変えない。UI_LAYOUT_SPECのYes/No Example共通仕様を適用する。

会話の役割はQ:／A:へ短縮し、従来の行頭位置で表示する。高さを増やす見出し段や、音声ボタン内への組み込みは行わない。Ex1の区分撤去とは別に扱う。

返答側の「きく」「とる」はY/N選択前にロック。両方に「Choose 🙆 or 🙅 first.」を共通の選択理由表示として付ける。選択後に解除。質問側は常に使用可（録音中を除く）。選択と再生は分離し、Y/Nボタンを押しただけではモデル再生しない。

モデルは会話の省略に従い「はい、好きです」「いいえ、好きじゃないです」「はい、きらいです」「いいえ、きらいじゃないです」。自分の主語・目的語・動作を含む長い返答や、冒頭返答語の省略も許容する。返答だけの課題なので短答にのがを要求しない。正式な肯定/否定とY/Nの整合は必須。Yes/Noの各録音・判定を独立保存。

CasualのNoは表示ううん、TTS専用ううんん。うんん/ううんん等の比較上の許容は原文表示を変えない。通常のListen等の説明は付けない。

### D3：Verbのが上手／苦手

人物・動作を固定した6問。上手／苦手をプルダウンで選択してモデル・判定を連動させる。初期値は下表。ここでは文作りのみを扱い、対人表現の適切さを判定しない。Example3は同じ友達・写真を撮るという動作について上手／苦手の2文を常時表示。両方のはとのがを強調。選択ごとに録音と判定を保持する。

| 人物 | 動作 | 評価語 |
| --- | --- | --- |
| 友達 | 写真を撮る | 上手 |
| 先生 | 漢字を書く | 上手 |
| 留学生 | 料理をする | 苦手 |
| 子ども | 漢字を覚える | 苦手 |
| この人 | 歌を歌う | 上手 |
| 兄弟 | 車を運転する | 苦手 |

兄弟は集団として述べる。人はこの人として対象を示す。これらを人物や職業の本質的な能力差と定義しない。

### D4：程度の副詞

動詞・目的語・形容詞は固定。キューは目的語／動詞／副詞プルダウン／形容詞の順。Exampleも目的語／動詞／副詞／形容詞にそろえる。副詞だけを6語から選択し、モデル・正答を連動させる。頻度副詞の課題ではない。

| 固定動作 | 評価語 | 初期副詞 |
| --- | --- | --- |
| 料理を作る | 好き | とても |
| 車を洗う | きらい | すごく |
| 友達はトマトを切るのが… | 上手 | まあまあ |
| 朝ご飯を作る | 下手 | ちょっと |
| 古い本を捨てる | 好き | あまり |
| 勉強を始める | 好き | ぜんぜん |

副詞はぜんぜん・あまり・ちょっと・まあまあ・とても・すごく。あまり・ぜんぜんは否定形、それ以外は肯定形。6問とも全6語を選択できる。とても・すごくは同じ強さの目安に置くが、選択肢・録音キーは分ける。

Example4は同じ料理を作る動作・好きの評価について6副詞を6行で比較する。順番はぜんぜん／あまり／ちょっと／まあまあ／とても／すごく。最初の2文は否定形。先頭行のキューは料理／作る／ぜんぜん／好き、本文は全文を表示。2行目以降は共通の料理／作るを省き、副詞／好きから表示する。副詞／好きは共通の内容幅の列として、全行の副詞の開始位置をぜんぜんに合わせ、キュー列の右端（👉️の直前）へ揃える。右側本文も共通の料理を作るのがを〃に置き換え、〃の中心を先頭文の「のが」の「が」に合わせ、「〃 あまり好きじゃないです。」等とする。Hiragana・文体変更にも連動し、〃には省略した部分の読み上げ用ラベルを付ける。各行の独立した再生ボタンは省略記号を読まず、常に元の全文を再生する。Drill4のキュー・モデル・判定は省略しない。

副詞は共通degree-adverbで太字とし、肯定の4語は青、否定を伴う2語は赤。ガイド・キュー・モデル本文・選択欄で同じ色変数を参照。新しい色は作らず、既存ガイドの通常/ダークの色を共有する。

数直線に近いガイドは `ぜんぜん〜ない／あまり〜ない／ちょっと／まあまあ／とても・すごく` の5位置。−−−／−／＋／＋＋／＋＋＋を添える。否定形は赤、肯定形は青。程度の目安であり数値・厳密な等間隔ではない。好評価・悪評価の色分けでもない（すごくきらいも青）。好きじゃない＝嫌いと定義しない。狭幅では折り返し、色だけに依存しない。

### D5：Choose, Record & Learn（Adjクイズ）

学習者は各行に固定表示された英語ラベルを読み、2択の日本語Adjから合うものを考えて選ぶ。正解なら「Correct choice. Record the sentence to see the explanation.」と次の操作だけを案内し、誤答なら別のAdjを試す案内を出す。選択だけで音声を再生・録音しない。各行の「🔊きく」は日本語キューとAdj選択の直後に置く（D5限定の配置例外）。「🎙️とる」「⏹️」は共通の録音操作列に置く。

録音が完了し録音URLが保存された後、その行の録音再生ボタンの真下に選択Adjの詳しい英語解説を表示する。解説は行ごとに独立し、文字起こしの正誤とは独立して録音完了を条件とする。選択時に詳しい解説を先出ししない。D5タイトルと説明はこの学習順序を示す。

タイトル：`Drill 5: Choose, Record & Learn`

説明：`💡Choose the adjective that fits each label. Record the sentence, then read the explanation.`

前半はMeaning、後半はSpeaker & listenerの順。７問×２行。D5,6は上手／下手の対を避け、下手／苦手の言い方の差を扱う。

| 順 | 場面 | ラベル → 選ぶAdj | 録音後に表示する英語解説 |
| --- | --- | --- | --- |
| 1 Meaning | 母は料理をするのが…：料理を実際に食べ、母が料理を強みと考えていると推測できる | Skillful → 上手 | This is an outside judgment of how well someone performs an activity. You can praise someone’s skill even if you do not share that skill. |
|  |  | Observed → 得意 | From what the speaker observes, they infer that the person sees this activity as one of their strengths or difficulties. This is a guess about the person’s own view. |
| 2 Meaning | 私は英語を話すのが…：技能の低さと、話す際の居心地の悪さを区別 | Poor → 下手 | This describes someone who does not perform an activity well. It judges ability, not how the person feels about doing it. |
|  |  | Uncomfortable → 苦手 | This describes an activity the person feels uneasy or uncomfortable doing. It does not necessarily mean they lack skill. |
| 3 Meaning | 私は早く起きるのが… | Observed → 苦手 | From what the speaker observes, they infer that the person finds the activity difficult. This is a guess about the person’s own view. |
|  |  | Unnatural → 下手 | 下手 usually describes skill. Getting up early is not normally treated as a skill, so 早く起きるのが下手 sounds unnatural; 苦手 is the natural choice. |
| 4 Speaker & listener | 私は料理をするのが…：初対面の人への自己紹介 | Boastful → 上手 | Using 上手 for your own ability can sound like you are praising yourself too strongly. |
|  |  | Natural → 得意 | 得意 is a natural way to describe something as your own strength. It presents a personal forte rather than an outside judgment. |
| 5 Speaker & listener | 留学生の友達は日本語を話すのが…：実際の会話を聞いている | Praise → 上手 | The speaker praises the friend’s demonstrated Japanese ability. The speaker does not need to share that skill. |
|  |  | Observed → 得意 | From what the speaker knows, they infer that the friend sees Japanese as one of their strengths. This is a guess about the friend’s own view. |
| 6 Speaker & listener | 友達は歌を歌うのが…：実際に歌を聞いた後 | Blunt → 下手 | Calling a friend 下手 directly judges their ability and can sound blunt or hurtful. |
|  |  | Tactful → 苦手 | 苦手 describes the activity as something the person finds difficult, rather than bluntly judging their ability. This softer phrasing can help avoid hurting the listener. |
| 7 Speaker & listener | 日本語の先生は日本語を話すのが…：初級学習者が教師の専門能力を評価 | Presumptuous → 上手 | A beginner judging a Japanese teacher’s professional Japanese may seem to claim authority without enough knowledge to support that judgment. |
|  |  | Harsh → 下手 | Calling the teacher 下手 is a severe negative judgment about their core expertise and may sound hurtful. |

上手は技能への外部評価、得意は本人が強みと捉えているという観察者の推測として扱う。どちらも絶対的な客観事実を意味しない。得意を本人専用に限定しない。早起きの下手は通常の用法では不自然な例として示し、あらゆる思考活動に上手を禁止する一般則にはしない。計算と踊るの比較は追加しない。

録音の正誤はその行の文法・内容を判定し、声色や人格、英語ラベルの対人評価は採点しない。録音・抽出文・再生ボタンは行IDと選択Adjの組ごとに保存し、別行や別Adjへ流用しない。表記・文体・ヒント変更でも選択と保存済み録音を保持し、録音時の正誤は再判定しない。録音中は他操作をロックし、既存の0秒リレーと中断動作を維持する。

Exampleと対応Drillで同じ完成文を反復しない。D5第1問は母の料理、Example5は母の花を育てる文とし、Skillful（上手）／Observed（得意）の意味比較を常時表示・独立再生する。は／のがを共通ゴールドで強調する。花・育てる、早く起きるは本課題の補足語彙として登録する。

## 表記・音声・判定・保持

- L8相当のWith漢字を初期値とする。Hiragana Only、Formal／Informal／Casual、Hover／Display／OFFは既存UIを踏襲。全モードでのの前は辞書形を維持する。Casualでも今回の目標であるのがを省略しない。
- 覚える（標準語彙表ではL9）、まあまあ（L11）はユーザー指定の重要な補足語として今回含める。
- キュー・Exampleの語彙は共通ヒント。Displayは語句ごとに改行。文法のが／名詞行のがを太字＋ゴールドで表示する。Example3・Example5は主題のはも強調。8.1固有の旧色#906500/#ffd54fを撤去し、共通の通常#ca8a04・ダーク#fbbf24へ統一。共通grammar-highlightを直接使用しページ独自の色指定は廃止。比較用の色3案は採用せず、ユーザー指示により現行色を維持。
- Y/N・副詞・D3評価語の選択ごと、およびD5の各指定行・選択語ごとに録音URL・STT原文・録音時モデル・許容文・判定を保存。D5の英語ラベルは固定表示し、選択Adjと録音結果は行ごとに保持する。表記・文体・ヒント変更で録音を消さず、保存した正誤を再判定しない。
- 料理する／料理をする、洗濯する／洗濯をするは両方許容。文末のよ・ね・よねと句読点・空白は既存の判定方針に従う。Formal否定はじゃないです／じゃありません／ではありません／ではないですを許容する。
- 自分を主語として省略しているD1・D4の行では私はの追加を許容。D2のQuestionはあなたはの追加、Responseは私はを含む完全回答を許容。D3およびD4の友達の行、D5の明示主語は保持する。D1動作行・D3・D4・D5の動作課題で名詞だけの好き表現へ短縮することは不可。D2の会話返答は上記の短答仕様を優先する。
- STT原文・表示変換・判定・TTSを分離し、STT_DISPLAY_RULESを適用。カタカナは保持。未確定の認識をモデル文へ置き換えない。
- 標準TTSとVoice選択は7.3のページ内処理を基に踏襲し、8.1の速度は共通既定0.9。音声エンジンを追加しない。
- DrillAudioの既存ライフサイクルを使用。録音中・マイク準備中は設定・選択・他の音声操作をロック。手動停止は当該行のみ。発話前無音15秒・発話後無音2秒・上限20秒。録音開始時にモデル・録音再生の双方を中断し、古い終了通知で再開させない。モデル→録音のリレーは待機0秒。
- Textボタン・通常のListen/Record/Stop説明・拡大率ボタン・English cuesは追加しない。D2のY/N返答だけに上記の未選択ロックを適用。D4は初期副詞、D5はラベルに合うAdjを選択後にきく・とるを使用可能。解説はその行の録音保存後に表示する。

## 検証

`tests/practice81.cjs`：全文体・表記・語彙設定、全モデル、文型必須条件、プルダウンと否定形、D5の2行と行頭指定の初期表示・副詞開始位置/〃のが位置への整列、実録音経路、両行の録音結果の同時保持・基線、STT原文、375/600/900/1440/1920px・通常/ダーク・間隔・はみ出し。

`audio-relay.cjs`、`audio-lifecycle.cjs`、`relay-zero-gap.cjs`、`stt-display.cjs`へ8.1を追加。実機での音声品質と公開ページ確認はユーザー確認として別扱い。

取り込み漏れの経緯と是正は[PRACTICE81_INHERITANCE_AUDIT.md](PRACTICE81_INHERITANCE_AUDIT.md)。色の規定は既存であり、未規定を理由に独自色を認めるものではない。

## 2026-10-30：Example音声の縦位置

共通example-text-layoutを使い、ボタンは親Gridのalign-items:baselineに従わせる。固定pxの上下移動を追加しない。基準はボタン外枠の上端ではなく、ボタン文字とモデル本文の最初の行のベースライン。同一行にある広幅表示で差0.5px未満を検証する。モデルが次の行へ回る狭幅時には同じY位置を要求しない。

通常項目名と副詞の強調はユーザー承認により実装済み。Ex5のすごい導入・追加説明は検討段階で未実装。先生の強みを今回の文型で述べる候補は「先生は漢字を教えるのが得意です」。得意は自分専用の語ではない。直接の感想として「先生の教え方はとてもわかりやすいです」等も候補だが、文型・新語の範囲が異なるため無断でモデルへ追加しない。

## D5の幅計算（2026-10-31修正）

D5の英語ラベルは各行に固定表示する。文言と録音後の解説は上記D5表を参照する。

D5は「とる／停止」操作ボタンの実寸とカードの利用可能幅からキュー上限を決め、「きく」ボタンを含むキューと選択欄の折返し後の最長端を計測して共有列を詰める。キューに残り幅を配らず、音声列の後ろへ割り当てる。最長端と操作列の間は共通gridの列間隔4pxのみ（小数丸め１px未満を許容）。以前の折返し前最大幅＋8pxの保持はD5では廃止する。600px以下の操作列を次行に置く共通仕様は維持。フォント準備完了、設定変更、リサイズ時に再計測し、固定top/transformや文字サイズ縮小で補正しない。8.1 D1〜D4と8.2の幅計算へ無断展開しない。

幅計算の回帰検証は`node tests/practice81-cue-fit.cjs`（700〜1920px・両表記・全ヒント）、既存の`practice81.cjs`では完成文非重複、一語見出し、900px以降の実間隔と通常幅１行表示も確認する。850pxの共通container規則と600pxの練習８規則の競合をD5で解消し、末尾セルpaddingとselect右marginの余分な加算も撤去する。

## 英語指定後のキュー頭（2026-10-31）

各Drill内で英語指定の最長実内容幅を共有し、その右の日本語キュー頭を揃える。文字数で固定幅を決めず、フォント準備・表記・ヒント・リサイズ時に再計測。ラベル列と日本語内容列を分け、後者だけ自然折返しとする。既存の音声列の共有・最短間隔・録音保持は維持する。今回、名称変更・語彙差替えは提案段階で未適用。
