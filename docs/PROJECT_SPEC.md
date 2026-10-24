# October2026 機能仕様書（PROJECT_SPEC）

最終更新日：2026-10-24

本書は、日本語学習用練習サイト「October2026」における**ユーザーが確定した仕様**と、実コード照合に基づく**現行実装の動作・相違点・未確認事項**を記録します。

---

## 1. 対象ページと全体構成

- **リポジトリ**：`https://github.com/lt068028/october2026`
- **公開先**：`https://october2026.vercel.app`
- **構成ファイル**：
  - トップページ：`index.html` / `index.js`
  - 文法練習：`practice1.1.html` / `practice1.1.js`、`practice1.2.html` / `practice1.2.js`、`practice7.1.html` / `practice7.1.js`、`practice7.2.html` / `practice7.2.js`、`practice7.3.html` / `practice7.3.js`
  - 作文練習：`composition1.html` / `composition1.js`
  - 発音練習：`pronunciation1.html` / `pronunciation1.js`、`pronunciation2.html` / `pronunciation2.js`
  - 共通ファイル：`style.css`（全ページ共通スタイル）、`vocab.json`（語彙データ）
  - ※注：`shared-tts.js`（旧 Supertonic 3 試験用モジュール）はリポジトリ内に残存しているが、Supertonic 3 が候補対象外となったため現在どのページからも読み込まれていない。

---

## 2. グローバル設定（ヘッダー設定パネル）とブラウザ標準TTSの仕様

### 2.1 設定項目の並び順と構成
- **確定仕様**：
  - 上段（セグメント行）：**`Script Mode` → `Speech Style` → `Vocab`（ヒント表示）** の並びを基本とする。
  - 下段（トグル行）：`Autostop`、`Autoplay` を配置する。
  - 録音中（およびマイク許可待ち中）は、設定パネルの切替操作を無効化（ロック）する。
- **状態保持の原則（確定仕様・現行実装一致）**：
  - 表示モード（`Script Mode`）、`Speech Style`、`Vocab` ヒント表示などを切り替えても、**既に録音した音声データ・元の認識結果・抽出テキスト・正誤判定結果を消去しない**。

### 2.2 ブラウザ標準TTS（`speechSynthesis`）の優先音声選択・切替仕様（全8練習ページ共通）
- 全練習ページ（`practice1.1.js`、`practice1.2.js`、`practice7.1.js`、`practice7.2.js`、`practice7.3.js`、`composition1.js`、`pronunciation1.js`、`pronunciation2.js`）では、`setupPreferredVoice()`（`practice7.3.js` では `setupPreferredVoice73()`）により、`window.speechSynthesis.getVoices()` から日本語音声（`/^ja/i.test(v.lang)`）を取得して以下のように選択する：
  - **保存音声の復元**：`localStorage`（キー：`october2026.selectedVoiceName`）に保存された音声名が現在の環境の日本語音声一覧に存在する場合は、その音声を選択する（ページ移動や再読み込みでも維持される）。
  - **未保存時・該当音声不在時の自動選択優先順位**：
    1. **ChromeOS 日本語音声**：`name` に `"chrome os"` を含み、`lang` に `"ja"` を含む音声
    2. **Windows（Edge / OS）男性自然音声**：`name` に `"keita"` を含む音声（Microsoft Keita）
    3. **Windows（Edge / OS）女性自然音声**：`name` に `"nanami"` を含む音声（Microsoft Nanami）
    4. **Google 日本語音声（Chrome / Android 等）**：`name` に `"google"` を含み、`lang` に `"ja"` を含む音声
    5. **その他の日本語音声（フォールバック）**：上記がない場合、`lang` に `"ja"` を含む最初の音声（macOS / iOS の Kyoko・Otoya 等）
- 読み上げ時は `utterance.lang = "ja-JP"`、`utterance.rate = 0.9`（デフォルト）で再生する。
- **ページ最下部左（`.voice-guide-footer`）の音声選択UI**：
  - 従来の `🔊Want to change the voice? Check⚙️` およびOS別設定パスのポップアップは廃止し、`🔊Voice:` ＋ プルダウン（`#voiceSelect`）＋ 補足ツールチップ（`?`）を配置する。
  - プルダウンには実行環境で利用可能なすべての日本語TTSを正式名称（`voice.name`）で一覧表示し、現在使用中の音声を表示するとともに、他の日本語TTSへその場で切り替え・`localStorage` 保存できるようにする。
  - 横の `?` アイコンのツールチップには、選択肢が出ない場合のみ端末のText-to-Speech設定で日本語音声を追加できる旨の補足（`If no voices appear, you can add a Japanese voice in your device's Text-to-Speech settings.`）を表示する。

### 2.3 各設定項目の目的・対象・動作・制約

1. **Script Mode（`🐣Hiragana Only` ／ `🐤With漢字`）**
   - **目的**：学習段階に応じて、問題キュー・例文・音声認識結果の表示を「ひらがなのみ」と「漢字かな交じり」で切り替える。
   - **制約と理由（確定仕様）**：
     - ブラウザの音声認識API（Web Speech API）は仕様上かならず漢字かな交じり表記で抽出され、API側でひらがなのみに制御することはできない。
     - そのため、語彙が定まっている問題（Drill 1・2等）では、事前登録辞書を用いて認識結果をひらがなへ置換・補完して表示・判定する。
     - 一方、学習者が任意の語を入力・発話する自由入力問題（Practice 1.1 の Drill 3、Composition 1 の Drill 2 等）では事前辞書による補完が不可能であるため、**`Hiragana Only` 選択時の自由入力問題はテキスト抽出・判定を行わず、録音のみ（`Audio only`）として動作させ、テキスト抽出不可を示す文言（`🐣Only Hiragana:🎙️Audio only` 等）を表示する**。
   - **発音練習での制約（確定仕様・現行実装一致）**：
     - `pronunciation1` および `pronunciation2` では `🐣Hiragana Only` を選択状態で固定し、`🐤With漢字` は `disabled`（選択不可・グレーアウト表示 `.pronunciation-kanji-disabled`）とする。

2. **Speech Style（`👔Formal` ／ `✏️Informal` ／ `💬Casual`）**
   - **表記（確定仕様・現行実装一致）**：`👔Formal` ／ `✏️Informal` ／ `💬Casual`（絵文字の直後に不要な空白を入れない）。
   - **ツールチップ説明（確定仕様・現行実装一致）**：
     - Formal：`Polite speech for work or unfamiliar people.`
     - Informal：`Plain forms used in writing`
     - Casual：`Relaxed speech with family and friends.`
   - **文体ごとのモデル文と終助詞の扱い（確定仕様・現行実装一致）**：
     - **Informal のモデル文には終助詞「よ」を付けない**（例：`私は、学生だ。` / `私は、先生じゃない。`）。
     - **Casual のモデル文には終助詞「よ」を付ける**（肯定・否定の平叙文、例：`私、学生だよ。` / `私、先生じゃないよ。`）。
     - **正誤判定では、モデル文の「よ」の有無にかかわらず、文末の終助詞（`よ`／`ね`／`よね`）の有無を許容する**（「モデルとして提示する文」と「判定での許容範囲」は別々に扱う）。

3. **Vocab（ヒント表示：`Hover` ／ `( )` ／ `OFF`）**
   - **動作**：語彙キューに対するローマ字・英語意味のヒント表示方法を切り替える（ツールチップ表示／括弧内常時表示／非表示）。

4. **Autostop（自動停止トグル：デフォルト ON）**
   - **動作**：ON時は発話終了後の無音を検知して録音を自動停止する。OFF（Manual）時は手動停止ボタン（`⏹️`）で停止する。
   - **制約**：Autostop ON／OFF（Manual）のどちらであっても、発話開始前の無音15秒制限および録音全体の最大20秒制限が適用される。

5. **Autoplay（自動再生トグル：デフォルト ON）**
   - **動作**：ON時は有効な録音完了後に「モデル音声 → 自分の録音音声」の順（モデル文がない自由録音行では録音音声のみ）で自動再生する。
   - **OFF時の動作（確定仕様・現行実装一致）**：録音完了後の自動再生のみを行わない。**録音音声の保存（再生ボタン `▶️` の表示）、テキスト抽出、正誤判定、結果表示は Autoplay ON 時と全く同じように実行・保持される**。

---

## 3. 5種類のテキストデータの区別と句読点の扱い

システム内部では、以下の5つのテキストを明確に区別して扱います。

| 種類 | 役割・内容 | 読点「、」・句点「。」の扱い | 表示モード（Hiragana / Kanji）との関係 |
| :--- | :--- | :--- | :--- |
| **① モデル表示文** | Example欄等で画面上に表示される手本文 | **【要確認】** 下記3.2参照 | `Script Mode` に連動して「ひらがな」または「漢字かな交じり」で表示 |
| **② 読み上げ用テキスト** | TTS（音声合成）に渡してモデル音声を生成するための文字列 | 自然なポーズを作るため**読点「、」・句点「。」を含む** | **原則として常に漢字かな交じり表記を使用**（TTSの誤読・アクセント崩れ防止） |
| **③ 元の認識結果 (`rawTranscript`)** | Web Speech APIが返した生の認識文字列（`savedResults` にそのまま保持） | APIが返した状態を保持 | 常にAPI出力（漢字かな交じり）のままメモリに保持 |
| **④ 認識結果の表示 (`displayed`)** | 各行の結果欄に学習者へ表示する抽出テキスト | 句読点・記号を除去して表示（終助詞は表示に残す） | `With漢字` 時は `rawTranscript`、`Hiragana Only` 時は事前辞書でひらがな変換した文字列を表示 |
| **⑤ 判定用テキスト** | 正誤判定（` ✅`）および差分（赤字・不足 `＿`）算出に使う正規化文字列 | **句読点・空白・記号をすべて除去**し、文末の終助詞（`よ／ね／よね`）も比較対象から除外 | 辞書変換・カタカナ→ひらがな正規化を行い、漢字とひらがなの表記差は一致扱いとする |

### 3.1 モデル音用の読点「、」と音声生成（確定仕様・現行実装一致）
- **目的**：モデル音声の読み上げ時に、主語（助詞）や応答語の後ろに自然な一拍の間（ポーズ）を入れるため、読み上げ用テキストに読点「、」を入れる（例：`私は、学生です。` / `私、学生だよ。` / `はい、読んでいます。`）。
- **`shared-tts.js` での分割仕様**：
  - `shared-tts.js` は渡されたテキストを**句点「。」単位で分割**（`String(text).match(/[^。]+。?/g)`）し、**読点「、」では分割しない**。
  - これにより、発音1の単語ペア（`"箸。端。"`）は2つの音声クリップに分けて間に0.5秒（`GAP_MS = 500`）の間隔を空けて再生され、Practice 1.1 等の通常文（`"私は、学生です。"`）は分割されず1つのつながった文として生成・再生される。

### 3.2 モデル音生成元と表示文に関するコード照合結果（実装詳細・相違点）
- **モデル音の生成元（現行実装）**：
  - `practice1.1.js`（Example・Drill 1・Drill 2）、`practice1.2.js`、`practice7.1.js`、`practice7.2.js`、`practice7.3.js`、`composition1.js`、`pronunciation1.js` のいずれも、`Script Mode` が `Hiragana Only` のときでも **TTSへ渡す読み上げ用テキストには漢字表記（`kanji`）を使用**している。
  - 例外として、`practice1.1.js` の Drill 3（自由入力）のみ、学習者が入力欄（`inputX` / `inputY`）に入力した文字列そのままを `modelSentence` に渡している。
- **モデル表示文の読点に関する注意点（コード照合で確認された事項）**：
  - `practice1.1.js` の Example 表示（573行目・590行目・2722行目）では、`私<strong>は、</strong>学生<strong>です。</strong>` のように画面表示文にも読点「、」が含まれている。また `practice7.1.js` の Example 2 等でも `model()` の文字列（読点あり）を表示に用いている箇所がある。画面表示からモデル音用の読点を除外する仕様とする場合は、今後の改修対象として確認が必要。

---

## 4. 録音・音声認識・UIの確定仕様と現行実装の照合

### 4.1 録音の時間制限と無音検知
- **発話開始前の無音制限（確定仕様・全ページ実装一致）**：
  - 録音開始から **15秒（`15000ms`）** 以内に発話が検知されない場合、`"No speech detected within 15 seconds."` を表示して自動停止する。
  - このとき `discard = true` となり、**録音ファイル（Blob）は生成・保存しない**。既にその行に過去の有効な録音結果がある場合は、それを消さずに維持する。
- **録音全体の最大時間制限（確定仕様・全ページ実装一致）**：
  - `Autostop`（自動停止）と `Manual`（手動停止）の**両方に共通して、録音開始から最大20秒（`20000ms`）** で `"Auto-stopped after 20 seconds."` として自動停止する。
- **Autostop（発話後の無音自動停止）の検知方法（現行実装のページ別詳細）**：
  - Web Audio API（`AudioContext` + `AnalyserNode` のRMS音量監視）と `SpeechRecognition` イベントを併用して発話開始（`speechStarted` / `speech`）を判定している。
  - **発話後の無音時間**：
    - `practice1.1.js`・`practice1.2.js`（通常認識時）：`recognition.continuous = false`（Autostop時）により、Web Speech API が発話区切り（`onend`）を検知した時点で停止。
    - `practice1.1.js`（Drill 3 `Audio only` 時）：`AnalyserNode` で音量（閾値 `> 0.025` が3フレーム＝約300ms以上で発話開始）を監視し、最後の音声から **1.5秒（`1500ms`）** 無音が続くと自動停止。
    - `composition1.js`・`practice7.1.js`・`practice7.2.js`・`practice7.3.js`・`pronunciation1.js`・`pronunciation2.js`：`AnalyserNode`（閾値 `> 0.015` 等）で最後の音声時刻を更新し、発話開始後に **2.0秒（`2000ms`）** 無音が続くと自動停止。

### 4.2 回答許容仕様（現行実装で確認済み）
- **否定表現の許容**（Practice 1.1 等）：
  - Formal：`じゃないです` ／ `ではないです` ／ `じゃありません` ／ `ではありません` のいずれも正解として許容。
  - Informal・Casual：上記4種に加え、`じゃない` ／ `ではない` も正解として許容。
- **Casual での助詞省略許容**：
  - Practice 1.1 等では Casual 選択時に主題の「は」の省略を許容。
  - Practice 7.1 等では Casual 選択時に目的語の「を」の省略や、「うん／うんん／ううん」の応答を許容。
- **終助詞の許容**：
  - 認識結果の文末に付いた `よ` ／ `ね` ／ `よね` は、表示テキストには残しつつ判定比較からは除外して許容する。

### 4.3 UIボタン・配置の統一仕様
- **録音ボタン**：表記は **`🎙️とる`**（絵文字の直後に空白を入れない）。
  - ※注：`practice1.1.js` は初期関数 `makeRow`（669行目）で `"⏺️とる"` を生成した後、下部IIFEのラッパー（2540行目）で `'🎙️とる'` に上書きし、あわせて `.correction-box` 内の重複聞くボタン（`correctionListen`）を非表示化している。
- **聞くボタン**：表記は **`🔊きく`**。各行のキュー横の所定の操作列（`.recording-actions`）、および `pronunciation1` の Pitch Lab 各カードの録音ボタン（`🎙️とる`）の前に配置し、重複追加しない。
- **停止ボタン**：表記は **`⏹️`**。Manual モードで録音中の行のみ有効化（`.stop-btn-active`）し、Autostop 時や非録音時は無効化する。
- **録音再生ボタン**：録音が存在する行の結果欄末尾（および Pitch Lab 各カード）に **`▶️`**（ツールチップ：`Play your recorded voice`）を表示する。
- **Pitch Lab（`pronunciation1`）のピッチ描画仕様**：
  - 録音全体のピーク音量に対する相対エネルギー閾値（18%以上）およびゼロ交差率（ZCR）フィルタにより、無音区間・環境ノイズ・無声子音（s/sh/h等）を除外する。
  - 自己相関の最初のゼロ交差以降の局所ピーク（周期性 `>= 0.68`）のみを検出し、400Hz上限張り付きノイズやオクターブ誤検出を防止する。
  - 5フレーム中央値フィルタ、短区間ノイズ（60ms未満）除外、および重み付き移動平均平滑化（2パス）を適用し、細かい揺れを除いた明確なピッチの上昇・下降曲線のみを描画する。
  - 横軸（時間軸）は有声区間を中心に自動トリミングして表示し、前後の無音時間で曲線が潰れないようにする。
