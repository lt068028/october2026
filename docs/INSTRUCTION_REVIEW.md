# 説明文の短縮・段落整理レビュー

更新：2026-10-26。課題説明と発音Lab説明を対象に、学生が行うことを先に示し、タイトル・Exampleから分かる重複を削る。音声モデル・問題・判定条件は変更しない。

## 方針

- 短い同目的の説明は一段落。課題と補足、別の操作手順は意味単位で分ける。句点ごとの一律改行はしない。
- Ask / Make / Select / Recordなど具体的な動詞を使う。practice formingやUse this spaceなどの前置きを省く。
- Yes/No質問とWh質問の指示を区別する。Y/Nを選ぶ必要と、1.2 D1で両方の返答を練習する条件を残す。
- からの位置、のの結合、7.1拡張キューの助詞・例外を落とさない。
- 発音Labのpronunciation / rhythm / timingの学習対象と、モデルとのピッチ線比較を残す。

## 画面での前後比較

既定表示の課題説明・Lab説明と7.1の拡張キュー説明を比較。空白/改行を1個の空白に正規化してUnicode文字数を数える。タイトル・Example・問題文・Voice説明・システム通知は含まない。

確認対象は1849文字から1280文字へ約31%短縮。短い一部の文は明確さのため長くした。文字数だけを最適化していない。

| ページ・項目 | 変更前 | 変更後 | 段落数 |
| --- | --- | --- | --- |
| practice1.1 / 1 | 💡 Practice forming 🟢 affirmative and 🔴 negative statements. | 💡Make 🟢 affirmative and 🔴 negative sentences. | 1 |
| practice1.1 / 2 | 💡 Choose words and form sentences. | 💡Choose X and Y, then make a sentence. | 1 |
| practice1.1 / 3 | 💡 Enter X and Y, then make an affirmative sentence for 🟢 or a negative sentence for 🔴. | 💡Enter X and Y. Make a 🟢 affirmative or 🔴 negative sentence. | 2 |
| practice1.2 / 1 | 💡Form a question from the prompts and practice both affirmative and negative responses. | 💡Ask a Yes/No question. Practise both 🙆 and 🙅 answers. | 2 |
| practice1.2 / 2 | 💡Ask about majors. Select a major from the dropdown menu and reply using the possessive form. | 💡Ask about a major. Select a major; use person + の + せんこう. | 2 |
| practice7.1 / 1 | 💡 Use all the cues. Begin with いつも or いま. | 💡Use all cues; start with いつも or いま. | 1 |
| practice7.1 / 2 | 💡Ask what someone is doing now. Choose 🙆 or 🙅, then record your answer. | 💡Ask a Yes/No question. Choose 🙆 or 🙅 and record your answer. | 2 |
| practice7.1 / 3 | 💡 Add Japanese cues for a place or a companion to the same exercises. | 💡Add place and person cues. | 1 |
| practice7.1 / 4 | 💡 Practise the expanded sentences using English cues. | 💡Use English cues for the same sentences. | 1 |
| practice7.1 expanded / 1 | 💡 Use all the cues. Add で for a place and と for a companion. Keep 先生に with 聞く. 急ぐ has no extra cues. | 💡Use all cues. Place: で · With someone: と. Keep 先生に with 聞く. No extra cues for 急ぐ. | 3 |
| practice7.2 / 1 | 💡Compare a past action with the state that continues now. Use から after a time expression to show when that state began. | 💡Make both sentences from the cues. Present State: start time + から. | 2 |
| practice7.2 / 2 | 💡Ask about a present state. Choose 🙆 or 🙅, then record your answer. | 💡Ask a Yes/No question. Choose 🙆 or 🙅 and record your answer. | 2 |
| practice7.2 / 3 | 💡Practise making sentences with this lesson’s vocabulary, using English cues. | 💡Make the same sentences from English cues. | 1 |
| practice7.3 / 1 | 💡 Compare a completed past action with an action in progress at a past time. | 💡Compare a completed action with an ongoing action at a past time. | 1 |
| practice7.3 / 2 | 💡Ask the question. Choose Yes or No, then answer. | 💡Ask a Yes/No question. Choose 🙆 or 🙅 and record your answer. | 2 |
| practice7.3 / 3 | 💡 Ask what someone was doing at the given time, then answer using the cues. | 💡Use the cues to ask and answer. | 1 |
| practice7.3 / 4 | 💡 Until when did that state continue? | 💡Ask and answer with まで. | 1 |
| practice7.3 / 5 | 💡Practise all questions and responses in Drills 1–4 using English cues. | 💡Use English cues for Drills 1–4. | 1 |
| composition1 / 1 | 💡Form and speak a Japanese sentence using appropriate i-adjectives based on the given context. | 💡Say a Japanese sentence with an い-adjective for each situation. | 1 |
| composition1 / 2 | 💡Use this space to record and review how your spoken Japanese sounds. | 💡Record, listen, and check your pronunciation. | 1 |
| pronunciation1 / 1 | 💡Listen to the model, mimic the voice and speak aloud. | 💡Listen to the model and repeat. | 1 |
| pronunciation1 / 2 | 💡Copy the model’s pronunciation, rhythm, and timing. Compare the two pitch lines to see whether your pitch rises and falls in a similar way. Try any word pair, such as はし／はし. | 💡Copy the model’s pronunciation, rhythm, and timing. Compare your pitch line with the model’s. Try any pair, such as はし／はし. | 3 |
| pronunciation2 / 1 | 💡Listen to the model, mimic the voice and speak aloud. | 💡Listen to the model and repeat. | 1 |
| pronunciation2 / 2 | 💡Copy the model’s pronunciation, rhythm, and timing. Compare the two pitch lines to see whether your pitch rises and falls in a similar way. | 💡Copy the model’s pronunciation, rhythm, and timing. Compare your pitch line with the model’s. | 2 |

## 区分ラベルの余白案（7.2試験へ更新）

ユーザーの意図は、背景幅と長いPresent Stateは変えず、短いPastだけ左右40pxを確保し、残り幅で文字を均等配置すること。前回は両方のラベルの余白を増やす案と取り違えていた。

7.2の共通背景は約149px。Present Stateは従来の左右8px・中央寄せを維持し、Pastだけ左右40pxの内側（約69px）にアイコン＋文字を置く。アイコンを先頭へ置き、残り幅でPastの文字を均等配置する。背景幅と録音/停止の列は維持する。他ページへは展開しない。

## 検証範囲

実ブラウザDOMで全8練習ページと7.1拡張キューの文面を採取し比較。通常/ダーク・文体/表記/Vocab・狭幅/大画面の既存表示回帰、音声回帰、段組み基準の検証を行う。実機での読みやすさは公開後の確認対象。
