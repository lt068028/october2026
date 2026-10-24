# October2026 作業引き継ぎ・進捗記録（HANDOVER）

最終更新日：2026-10-24

本書は、開発環境の現状、TTS（音声合成）の評価経緯と試験設定、スマホ対応の保留判断、および未了事項・次の作業を記録します。

---

## 1. 開発環境とGit／デプロイの進捗（2026-10-24時点）

### 1.1 構築済み環境（確認済み）
- **OS・端末**：Chrome OS の Linux 開発環境（Debian 12、x86_64、ディスク容量 20GB へ拡張済み）。
- **エディタ・操作環境**：
  - Linux 側に Antigravity を導入し、ユーザーの Google アカウント（`lt068028@gmail.com`）でログイン済み。
  - Remote Control を有効化し、Chrome ブラウザ画面から指示・確認を行う体制を構築済み（Linux 側の Antigravity は実行環境として起動維持）。
- **ローカルリポジトリ**：
  - パス：`/home/lt068028/october2026`
  - ブランチ：`main`
  - リモート `origin`：`https://github.com/lt068028/october2026.git`
  - 公開先（Vercel）：`https://october2026.vercel.app`
- **Gitコミット作成者設定（設定済み）**：
  - 過去のコミット履歴と同一の `user.name = lt068028` / `user.email = lt068028@gmail.com` をローカルリポジトリに設定済み。

### 1.2 GitHub 認証・push 体制と端末切り替え時の注意
- **GitHub CLI（`gh`）認証および push（確認済み）**：
  - GitHub CLI（`gh`）を導入し、HTTPS・ブラウザログインにより `lt068028` アカウントで認証済み（`gh auth setup-git` 設定済み）。
  - `origin/main` への `git push` および Vercel（`https://october2026.vercel.app`）へのデプロイ連携を確認済み。
- **将来の Windows 併用時の注意**：
  - 将来 Windows 端末でも作業する予定あり。別端末のローカルリポジトリへ切り替える際は、必ず未コミット・未push の変更を確認し、未保存の変更を破棄せずに GitHub の最新版を取り込んでから編集を開始すること。

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
     - 内部前処理（`UnicodeProcessor`）に日本語の漢字読み辞書・形態素解析（G2P）がなく漢字のUnicodeコードポイントを直接処理するため、「私は、学生です。」が Hiro で「わしはがくせいです」、Mina で「ががくせいです」と誤読された。
     - また、文全体の秒数を予測する `duration_predictor.onnx` が漢字＋読点を含む文で必要な秒数枠を短く見積もりすぎるため、「友達は、学生です。」が「ともだちはがくせい」で途中切断された。
     - 以上により、日本語学習用モデル音声として**不合格（候補対象外）**と確定した。
   - **注意**：今後、Supertonic 3 を未評価の新候補として再提案しないこと。

### 2.2 各ページのTTS復元状態（2026-10-24 実装）
Supertonic 3 の不採用確定に伴い、試験を行っていた以下の3ファイルをすべて Supertonic 3 導入前の元の状態へ復元した。
- **`practice1.1.js`**：`shared-tts.js` の読み込みを除去し、従来のブラウザ標準 `speechSynthesis`（`setupPreferredVoice()` による優先音声選択）による再生に復元済み（コミット `7804dd0` 時点と完全一致）。
- **`pronunciation1.js`**：`shared-tts.js` の読み込みと試験用単語変更を除去し、従来のブラウザ標準 `speechSynthesis` による再生と元の `drill1Data` に復元済み（コミット `660beff~1` 時点と完全一致）。
- **`index.js`**：上部にあった Supertonic 3 単体音声テスト（`mountSupertonicTest`）を完全除去し、モバイル環境向けの案内（`showMobileNotice`）のみの状態に復元済み（コミット `e01db79` 時点と完全一致）。

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
- **【実装済み・自動検証済み】**
  - 全8練習ページ（`practice1.1`、`practice1.2`、`practice7.1`、`practice7.2`、`practice7.3`、`composition1`、`pronunciation1`、`pronunciation2`）および `style.css`：
    - ページ最下部左（`.voice-guide-footer`）の旧 `🔊Want to change the voice? Check⚙️` とOS設定案内ポップアップを削除し、現在使用中のTTSを正式名称で表示・切替できるプルダウン（`🔊Voice:` ＋ `#voiceSelect`）と補足 `?` ツールチップに置き換え。
    - プルダウンで選択した音声名を `localStorage`（`october2026.selectedVoiceName`）に保存し、ページ移動や再読み込みでも維持するよう実装（未保存または該当音声がない環境では従来の優先順位で自動選択）。
- **【ユーザー実機確認待ち】**
  - Vercel デプロイ後、各ページ最下部左の `🔊Voice:` プルダウンに実行環境の日本語TTS一覧が正式名称で表示され、切り替え・ページ間保持が正常に動作することのWeb実機確認。
