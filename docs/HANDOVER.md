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

### 1.2 未確認・未検証事項（混同注意）
- **GitHub への push 認証および実際の push 成功**：**未検証**（`credential.helper` やトークン／SSH／GitHub CLI 等の認証設定は、次回のコミット・push 時にセットアップ予定）。
- **Vercel のデプロイ反映確認**：**未検証**。
- **将来の Windows 併用時の注意**：
  - 将来 Windows 端末でも作業する予定あり。別端末のローカルリポジトリへ切り替える際は、必ず未コミット・未push の変更を確認し、未保存の変更を破棄せずに GitHub の最新版を取り込んでから編集を開始すること。

---

## 2. TTS（音声合成）検討の経緯と現在の試験設定

### 2.1 候補エンジンの評価結果（確定事項）
従来のブラウザ標準 `speechSynthesis` に代わる、より自然な日本語音声のブラウザ内生成を検討・評価した。

1. **Kokoro**：【候補対象外（ユーザー試聴済み）】
   - 理由：デモ試聴の結果、学習上必要な日本語のピッチアクセントを再現できなかったため。
   - **注意**：今後、未評価の新候補として再提案しないこと。
2. **Piper-plus**：【候補対象外（ユーザー試聴済み）】
   - 理由：デモ試聴の結果、音声品質が要求水準に合わなかったため。
   - **注意**：今後、未評価の新候補として再提案しないこと。
3. **Supertonic 3（`Hiro` [M2] ／ `Mina` [F1]）**：【試験導入中】
   - **発音1（`pronunciation1.js`）での評価結果（ユーザー実機確認済み）**：
     - 生成・再生できることは確認済みだが、発音1の単語ペア（箸／端など）で求めるピッチアクセントの正確性としては**不合格**。
     - 発音1用の音声は今後別の方法を検討する。現時点では発音1の実装を勝手に削除・変更せずそのまま維持する。
   - **通常の文での評価（現在進行中）**：
     - 単語ペアでは不合格だったが、通常の文（文脈のある文）として使えるかは未評価であるため、**Practice 1.1（`practice1.1.js`）で Supertonic 3 の `Hiro` ／ `Mina` の品質を試す**方針が決定した。
     - ※Supertonic 3 はまだ全ページでの正式採用が決まったわけではなく、`shared-tts.js` というファイル名であっても現時点で接続しているのは `pronunciation1.js` と試験実装中の `practice1.1.js` のみである（`index.js` には別途単体テスト用の処理が存在する）。

### 2.2 現在の Supertonic 3 試験設定（2026-10-24 実装状態）
- **`shared-tts.js` の設定値（ローカルコミット済み `fe1b552`・未push）**：
  - 生成速度：`GENERATION_SPEED = 1.0`（100%）
  - 再生速度：`PLAYBACK_RATE = 0.7`（**70%** ※Practice 1.1 試験用に従来の `0.5`［50%］から変更）
  - クリップ間の待機時間：`GAP_MS = 500`（0.5秒）
  - 文の分割：句点「。」で分割し、**読点「、」では分割しない**（通常文は読点を含んだまま1文として生成・再生する）。
  - 案内枠（`#ttsStatus`）の表示と配色：
    - 初回モデル読み込み時（`Preparing voices…`）および音声生成時（`Preparing model audio… Please wait.`）は、回転スピナー付きの案内枠を表示する。
    - 再生開始後の速度案内メッセージ（旧 `Playing model audio at ...% speed…`）は、ユーザー指示により**非表示化済み**（`message('')`）。
    - 案内枠の採用色（A配色、通常・ダーク両対応）：
      - 通常モード：背景 `#fee2e2`、枠 `#dc2626`、文字 `#991b1b`
      - ダークモード：背景 `#450a0a`、枠 `#f87171`、文字 `#fecaca`
- **`practice1.1.js` の接続状態（ローカルコミット済み `fe1b552`・未push）**：
  - `./shared-tts.js` を動的 `import` し、設定パネルへの `Voice`（`Hiro` / `Mina`）切替ボタン追加、Example・各Drillの「🔊きく」再生、録音完了後の Autoplay（モデル音 → 録音音声）、および `stopAllPlayback()` での停止連携を実装済み。
  - ブラウザ標準 `speechSynthesis` への自動フォールバックは入れていない。

---

## 3. スマホ（モバイル）対応の試験経緯と保留判断

- **判断結果（確定事項）**：**スマホ対応は現在保留**。
- **経緯と理由**：
  - モバイル環境ではブラウザの音声認識（Web Speech API）および正誤判定が意図どおりに動作しないため、現段階ではPC環境を対象とし、スマホでの音声認識・判定対応は保留と判断した。
- **現行実装の状態（`index.js` 実装済み）**：
  - `index.js` 内の `showMobileNotice()`（280〜325行目）により、モバイル端末（Android / iPhone / iPad / iPod 等）からのアクセス時には、メニュー上部に `#mobileSupportNotice` パネル（*"Mobile support: Speech recognition and answer checking are not currently supported on mobile. Please use a computer for these features."*）を表示している。

---

## 4. 実装・検証の状態区分と次の作業（TODO）

### 4.1 現在の状態区分
- **【ユーザー実機確認済み】**
  - `pronunciation1` における Supertonic 3（Hiro／Mina）の生成・再生動作、および初回案内枠（A配色）の表示。
- **【実装済み・自動検証済み（ローカル `main` にコミット済み）】**
  - `shared-tts.js`：再生速度 `0.7`（70%）への変更、および再生中の速度案内文の非表示化（コミット `fe1b552`）。
  - `practice1.1.js`：`shared-tts.js` との接続（Hiro／Mina 切替UI、モデル音再生、Autoplay連携、停止処理）（コミット `fe1b552`）。
  - `AGENTS.md`、`docs/PROJECT_SPEC.md`、`docs/HANDOVER.md` の作成・Git管理対象化（`AGENTS.md` のシステム自動読み込み確認済み、および通常依頼時は検証・コミット・pushまで一連で行うルールを明記済み）。
- **【未完了・これから行う作業】**
  1. **GitHub push セットアップと反映**：GitHub CLI（`gh`）のHTTPS・ブラウザログインで認証を完了し、ローカル `main` のコミットを `origin/main` へ push する。
  2. **Vercel デプロイと Practice 1.1 の実機確認**：ユーザーが Vercel のデプロイ完了を確認し、Web 上で Practice 1.1 の通常文における Supertonic 3（Hiro／Mina、生成1.0・再生70%）の音声品質・表示・録音・判定を確認する。
  3. **細部仕様の確認事項（備忘録）**：
     - `practice1.1.js`（および `practice7.1.js` 等）の Example 画面表示文に読点「、」が含まれている点について、画面表示から読点を除くか現状維持とするか、実機確認とあわせて必要に応じ確認する。
     - 録音中に `.compact-settings .segmented-option` 全体がロックされることで `Voice`（Hiro／Mina）ボタンも録音中はロックされる挙動の実機確認。
