# 練習2 キュー空白点検（2026-10-29）

ユーザー指示：指定した位置以外にスペースを入れない。この人/その人/あの人は語内を分割しない。

対象：2.1/2.2/2.3の全セット、Hiragana/With漢字、Hover/OFF/Display、English cues実装ページの全セット。役割見出し、Hover/Displayの補足、モデル本文はキュー本文の空白件数と区別する。修正前基準はdc7d12b。

## 結果

- 2,226行状態を確認。修正前は行・表記別の重複をまとめて211種類に空白あり（日本語141、English cues70）。同じ表示でも録音キーが違えば別の出題として数える。
- 主因はformatWordのHover用HTMLに含まれる改行/字下げ。HTML要素の間で半角スペースとして表示され、「その ひと」「わたし の おとうと」や／前後の空きが生じていた。2.1と2.2/2.3共用JSでcompactなHTMLへ修正。
- English cuesの区切り「 / 」も「/」へ。英語の単語間は保持（over there、younger brother等）。修正後の空白35種類はすべて英語語句内の必要な空白。日本語キューの未指定空白と区切り前後の空白はなし。
- Displayの語句単位改行は維持。このひと/そのひと/あのひと、D4の私の弟/友達/先生、A/Bさんのクラスメートは指定された一つの語句として表示し、途中に空白/改行を追加しない。
- 2.2 D4 Set 1 Q2返答キューを「このひと／メアリー」、モデルを「この人はメアリーさんです」へ変更。自然な短答/正しい補完は既存どおり許容。

## 修正前の全件一覧

空白を「␠」で可視化。／そのものは保持。キュー内に含まれない役割見出しのA · Question:等は省く。キーは出題を特定するための内部識別子。

### 練習2.1

| 出題キー | 空白のあるキュー | 設定 |
| --- | --- | --- |
| `p21_d2_s0_q_0` | これ／␠なに | hiragana/hover |
| `p21_d2_s0_q_1` | それ／␠なに | hiragana/hover |
| `p21_d2_s0_q_2` | あれ／␠なに | hiragana/hover |
| `p21_d3_s0_q_0` | あなた␠／␠じしょ␠／どれ | hiragana/hover |
| `p21_d3_s0_q_1` | あなた␠／␠じしょ␠／どれ | hiragana/hover |
| `p21_d2_s1_q_0` | これ／␠なに | hiragana/hover |
| `p21_d2_s1_q_1` | それ／␠なに | hiragana/hover |
| `p21_d2_s1_q_2` | あれ／␠なに | hiragana/hover |
| `p21_d3_s1_q_0` | あなた␠／␠さいふ␠／どれ | hiragana/hover |
| `p21_d3_s1_q_1` | あなた␠／␠さいふ␠／どれ | hiragana/hover |
| `p21_d1_s1_q_0` | これ／␠えんぴつ | hiragana/hover |
| `p21_d1_s1_r_0` | いいえ／␠ノート | hiragana/hover, kanji/hover |
| `p21_d1_s1_q_1` | それ／␠Tシャツ | hiragana/hover, kanji/hover |
| `p21_d1_s1_r_1` | いいえ／␠えんぴつ | hiragana/hover |
| `p21_d1_s1_q_2` | あれ／␠ノート | hiragana/hover, kanji/hover |
| `p21_d1_s1_r_2` | いいえ／␠Tシャツ | hiragana/hover, kanji/hover |
| `p21_d2_s0_q_0` | これ／␠何 | kanji/hover |
| `p21_d2_s0_q_1` | それ／␠何 | kanji/hover |
| `p21_d2_s0_q_2` | あれ／␠何 | kanji/hover |
| `p21_d3_s0_q_0` | あなた␠／␠辞書␠／どれ | kanji/hover |
| `p21_d3_s0_q_1` | あなた␠／␠辞書␠／どれ | kanji/hover |
| `p21_d2_s1_q_0` | これ／␠何 | kanji/hover |
| `p21_d2_s1_q_1` | それ／␠何 | kanji/hover |
| `p21_d2_s1_q_2` | あれ／␠何 | kanji/hover |
| `p21_d3_s1_q_0` | あなた␠／␠財布␠／どれ | kanji/hover |
| `p21_d3_s1_q_1` | あなた␠／␠財布␠／どれ | kanji/hover |
| `p21_d1_s1_q_0` | これ／␠鉛筆 | kanji/hover |
| `p21_d1_s1_r_1` | いいえ／␠鉛筆 | kanji/hover |
| `p21_d1_s0_A_0` | this␠/␠… | English cues |
| `p21_d1_s0_A_1` | that␠/␠… | English cues |
| `p21_d1_s0_A_2` | that␠(over␠there)␠/␠… | English cues |
| `p21_d1_s0_B_0` | this␠/␠… | English cues |
| `p21_d1_s0_B_1` | that␠/␠… | English cues |
| `p21_d1_s0_B_2` | that␠(over␠there)␠/␠… | English cues |
| `p21_d2_s0_q_0` | this␠/␠what | English cues |
| `p21_d2_s0_q_1` | that␠/␠what | English cues |
| `p21_d2_s0_q_2` | that␠(over␠there)␠/␠what | English cues |
| `p21_d3_s0_q_0` | you␠/␠dictionary␠/␠which␠one | English cues |
| `p21_d3_s0_q_1` | you␠/␠dictionary␠/␠which␠one | English cues |
| `p21_d2_s1_q_0` | this␠/␠what | English cues |
| `p21_d2_s1_q_1` | that␠/␠what | English cues |
| `p21_d2_s1_q_2` | that␠(over␠there)␠/␠what | English cues |
| `p21_d3_s1_q_0` | you␠/␠wallet␠/␠which␠one | English cues |
| `p21_d3_s1_q_1` | you␠/␠wallet␠/␠which␠one | English cues |
| `p21_d1_s1_q_0` | this␠/␠pencil | English cues |
| `p21_d1_s1_r_0` | no␠/␠notebook | English cues |
| `p21_d1_s1_q_1` | that␠/␠T-shirt | English cues |
| `p21_d1_s1_r_1` | no␠/␠pencil | English cues |
| `p21_d1_s1_q_2` | that␠(over␠there)␠/␠notebook | English cues |
| `p21_d1_s1_r_2` | no␠/␠T-shirt | English cues |

### 練習2.2

| 出題キー | 空白のあるキュー | 設定 |
| --- | --- | --- |
| `p22_statements_s0_B_0` | その／␠かばん␠／Price | hiragana/hover |
| `p22_statements_s0_A_1` | この／␠かばん␠／Price | hiragana/hover |
| `p22_statements_s0_B_2` | あの／␠かばん␠／Price | hiragana/hover |
| `p22_price_s0_A_0_q` | この／␠かばん␠／␠いくら | hiragana/hover |
| `p22_price_s0_A_1_q` | その／␠かばん␠／␠いくら | hiragana/hover |
| `p22_price_s0_A_2_q` | あの／␠かばん␠／␠いくら | hiragana/hover |
| `p22_food_s0_A_0_q` | どの／␠おにぎり␠／さんびゃくえん | hiragana/hover |
| `p22_food_s0_A_1_q` | どの／␠おにぎり␠／ろっぴゃくえん | hiragana/hover |
| `p22_food_s0_A_2_q` | どの／␠おにぎり␠／きゅうひゃくえん | hiragana/hover |
| `p22_people_mixed_q_0` | その␠ひと␠／␠だれ | hiragana/hover |
| `p22_people_mixed_r_0` | この␠ひと␠／␠たけし | hiragana/hover |
| `p22_people_mixed_q_1` | その␠ひと␠／␠だれ | hiragana/hover |
| `p22_people_mixed_q_2` | あの␠ひと␠／␠だれ | hiragana/hover |
| `p22_people_mixed_r_2` | あの␠ひと␠／␠ロバート | hiragana/hover |
| `p22_statements_s1_B_0` | その／␠とけい␠／Price | hiragana/hover |
| `p22_statements_s1_A_1` | この／␠とけい␠／Price | hiragana/hover |
| `p22_statements_s1_B_2` | あの／␠とけい␠／Price | hiragana/hover |
| `p22_price_s1_A_0_q` | この／␠とけい␠／␠いくら | hiragana/hover |
| `p22_price_s1_A_1_q` | その／␠とけい␠／␠いくら | hiragana/hover |
| `p22_price_s1_A_2_q` | あの／␠とけい␠／␠いくら | hiragana/hover |
| `p22_food_s1_A_0_q` | どの／␠おべんとう␠／せんえん | hiragana/hover |
| `p22_food_s1_A_1_q` | どの／␠おべんとう␠／にせんえん | hiragana/hover |
| `p22_food_s1_A_2_q` | どの／␠おべんとう␠／さんぜんえん | hiragana/hover |
| `p22_people_relations_q_0` | その␠ひと␠／Bさんの␠クラスメート | hiragana/hover |
| `p22_people_relations_r_0` | この␠ひと␠／␠わたし␠の␠おとうと | hiragana/hover |
| `p22_people_relations_q_1` | その␠ひと␠／Aさんの␠クラスメート | hiragana/hover |
| `p22_people_relations_r_1` | この␠ひと␠／␠わたし␠の␠ともだち | hiragana/hover |
| `p22_people_relations_q_2` | あの␠ひと␠／Bさんの␠クラスメート | hiragana/hover |
| `p22_people_relations_r_2` | あの␠ひと␠／␠わたし␠の␠せんせい | hiragana/hover |
| `p22_statements_s0_B_0` | その／␠カバン␠／Price | kanji/hover |
| `p22_statements_s0_A_1` | この／␠カバン␠／Price | kanji/hover |
| `p22_statements_s0_B_2` | あの／␠カバン␠／Price | kanji/hover |
| `p22_price_s0_A_0_q` | この／␠カバン␠／␠いくら | kanji/hover |
| `p22_price_s0_A_1_q` | その／␠カバン␠／␠いくら | kanji/hover |
| `p22_price_s0_A_2_q` | あの／␠カバン␠／␠いくら | kanji/hover |
| `p22_food_s0_A_0_q` | どの／␠おにぎり␠／三百円 | kanji/hover |
| `p22_food_s0_A_1_q` | どの／␠おにぎり␠／六百円 | kanji/hover |
| `p22_food_s0_A_2_q` | どの／␠おにぎり␠／九百円 | kanji/hover |
| `p22_people_mixed_q_0` | その␠人␠／␠誰 | kanji/hover |
| `p22_people_mixed_r_0` | この␠人␠／␠たけし | kanji/hover |
| `p22_people_mixed_q_1` | その␠人␠／␠誰 | kanji/hover |
| `p22_people_mixed_q_2` | あの␠人␠／␠誰 | kanji/hover |
| `p22_people_mixed_r_2` | あの␠人␠／␠ロバート | kanji/hover |
| `p22_statements_s1_B_0` | その／␠時計␠／Price | kanji/hover |
| `p22_statements_s1_A_1` | この／␠時計␠／Price | kanji/hover |
| `p22_statements_s1_B_2` | あの／␠時計␠／Price | kanji/hover |
| `p22_price_s1_A_0_q` | この／␠時計␠／␠いくら | kanji/hover |
| `p22_price_s1_A_1_q` | その／␠時計␠／␠いくら | kanji/hover |
| `p22_price_s1_A_2_q` | あの／␠時計␠／␠いくら | kanji/hover |
| `p22_food_s1_A_0_q` | どの／␠お弁当␠／千円 | kanji/hover |
| `p22_food_s1_A_1_q` | どの／␠お弁当␠／二千円 | kanji/hover |
| `p22_food_s1_A_2_q` | どの／␠お弁当␠／三千円 | kanji/hover |
| `p22_people_relations_q_0` | その␠人␠／Bさんの␠クラスメート | kanji/hover |
| `p22_people_relations_r_0` | この␠人␠／␠私␠の␠弟 | kanji/hover |
| `p22_people_relations_q_1` | その␠人␠／Aさんの␠クラスメート | kanji/hover |
| `p22_people_relations_r_1` | この␠人␠／␠私␠の␠友達 | kanji/hover |
| `p22_people_relations_q_2` | あの␠人␠／Bさんの␠クラスメート | kanji/hover |
| `p22_people_relations_r_2` | あの␠人␠／␠私␠の␠先生 | kanji/hover |

### 練習2.3

| 出題キー | 空白のあるキュー | 設定 |
| --- | --- | --- |
| `Example` | ここ／␠あさ | hiragana/hover |
| `Example` | ここ／␠よる | hiragana/hover |
| `Example` | あそこ／␠ゆうがた | hiragana/hover |
| `p23_where_d1_s0_0_r` | ここ／␠きっさてん | hiragana/hover |
| `p23_where_d1_s0_1_r` | ここ／␠ぎんこう | hiragana/hover |
| `p23_where_d1_s0_2_r` | Cさん／␠としょかん | hiragana/hover |
| `p23_dialogue_s0_0_r` | ここ／␠フランス | hiragana/hover, kanji/hover |
| `p23_dialogue_s0_1_r` | ここ／␠にほん | hiragana/hover |
| `p23_dialogue_s0_2_r` | Cさん／␠アメリカ | hiragana/hover, kanji/hover |
| `p23_where_d1_s1_0_q` | かばん␠／どこ | hiragana/hover |
| `p23_where_d1_s1_1_q` | ほん␠／どこ | hiragana/hover |
| `p23_where_d1_s1_2_q` | ノート␠／どこ | hiragana/hover, kanji/hover |
| `p23_where_d1_s1_3_q` | ペン␠／どこ | hiragana/hover, kanji/hover |
| `p23_where_d1_s1_3_r` | ペン␠／ここ | hiragana/hover, kanji/hover |
| `p23_where_d1_s2_0_q` | かばん␠／あそこ | hiragana/hover |
| `p23_where_d1_s2_1_q` | ほん␠／ここ | hiragana/hover |
| `p23_where_d1_s2_2_q` | ノート␠／そこ | hiragana/hover, kanji/hover |
| `p23_where_d1_s2_3_q` | ペン␠／あそこ | hiragana/hover, kanji/hover |
| `p23_dialogue_s1_0_q` | そこ／␠フランスのどこ | hiragana/hover, kanji/hover |
| `p23_dialogue_s1_0_r` | ここ／␠パリ | hiragana/hover, kanji/hover |
| `p23_dialogue_s1_1_q` | そこ／␠にほんのどこ | hiragana/hover |
| `p23_dialogue_s1_1_r` | ここ／␠おおさか | hiragana/hover |
| `p23_dialogue_s1_2_q` | Cさん／␠アメリカのどこ | hiragana/hover, kanji/hover |
| `p23_dialogue_s1_2_r` | あそこ／␠ロサンゼルス | hiragana/hover, kanji/hover |
| `p23_dialogue_s2_0_r` | ここ／␠よるじゅうじ | hiragana/hover |
| `p23_dialogue_s2_1_r` | ここ／␠あさろくじ | hiragana/hover |
| `p23_dialogue_s2_2_r` | あそこ／␠ごごいちじ | hiragana/hover |
| `p23_dialogue_s3_0_q` | そこ／␠なんようび | hiragana/hover |
| `p23_dialogue_s3_0_r` | ここ／␠どようび | hiragana/hover |
| `p23_dialogue_s3_1_q` | そこ／␠なんようび | hiragana/hover |
| `p23_dialogue_s3_1_r` | ここ／␠にちようび | hiragana/hover |
| `p23_dialogue_s3_2_q` | あそこ／␠なんようび | hiragana/hover |
| `p23_dialogue_s3_2_r` | あそこ／␠どようび | hiragana/hover |
| `Example` | ここ／␠朝 | kanji/hover |
| `Example` | ここ／␠夜 | kanji/hover |
| `Example` | あそこ／␠夕方 | kanji/hover |
| `p23_where_d1_s0_0_r` | ここ／␠喫茶店 | kanji/hover |
| `p23_where_d1_s0_1_r` | ここ／␠銀行 | kanji/hover |
| `p23_where_d1_s0_2_r` | Cさん／␠図書館 | kanji/hover |
| `p23_dialogue_s0_1_r` | ここ／␠日本 | kanji/hover |
| `p23_where_d1_s1_0_q` | カバン␠／どこ | kanji/hover |
| `p23_where_d1_s1_1_q` | 本␠／どこ | kanji/hover |
| `p23_where_d1_s2_0_q` | カバン␠／あそこ | kanji/hover |
| `p23_where_d1_s2_1_q` | 本␠／ここ | kanji/hover |
| `p23_dialogue_s1_1_q` | そこ／␠日本のどこ | kanji/hover |
| `p23_dialogue_s1_1_r` | ここ／␠大阪 | kanji/hover |
| `p23_dialogue_s2_0_r` | ここ／␠夜十時 | kanji/hover |
| `p23_dialogue_s2_1_r` | ここ／␠朝六時 | kanji/hover |
| `p23_dialogue_s2_2_r` | あそこ／␠午後一時 | kanji/hover |
| `p23_dialogue_s3_0_q` | そこ／␠何曜日 | kanji/hover |
| `p23_dialogue_s3_0_r` | ここ／␠土曜日 | kanji/hover |
| `p23_dialogue_s3_1_q` | そこ／␠何曜日 | kanji/hover |
| `p23_dialogue_s3_1_r` | ここ／␠日曜日 | kanji/hover |
| `p23_dialogue_s3_2_q` | あそこ／␠何曜日 | kanji/hover |
| `p23_dialogue_s3_2_r` | あそこ／␠土曜日 | kanji/hover |
| `p23_describe_s0_2` | United␠States | English cues |
| `p23_where_d1_s0_0_q` | B␠/␠where | English cues |
| `p23_where_d1_s0_0_r` | here␠/␠cafe | English cues |
| `p23_where_d1_s0_1_q` | A␠/␠where | English cues |
| `p23_where_d1_s0_1_r` | here␠/␠bank | English cues |
| `p23_where_d1_s0_2_q` | C␠/␠where | English cues |
| `p23_where_d1_s0_2_r` | C␠/␠library | English cues |
| `p23_dialogue_s0_0_q` | there␠/␠where | English cues |
| `p23_dialogue_s0_0_r` | here␠/␠France | English cues |
| `p23_dialogue_s0_1_q` | there␠/␠where | English cues |
| `p23_dialogue_s0_1_r` | here␠/␠Japan | English cues |
| `p23_dialogue_s0_2_q` | C␠/␠where | English cues |
| `p23_dialogue_s0_2_r` | C␠/␠United␠States | English cues |
| `p23_describe_cities_2` | Los␠Angeles | English cues |
| `p23_describe_time_0` | 6␠a.m. | English cues |
| `p23_describe_time_1` | 10␠p.m. | English cues |
| `p23_describe_time_2` | 1␠p.m. | English cues |
| `p23_where_d1_s1_0_q` | bag␠/␠where | English cues |
| `p23_where_d1_s1_1_q` | book␠/␠where | English cues |
| `p23_where_d1_s1_2_q` | notebook␠/␠where | English cues |
| `p23_where_d1_s1_3_q` | pen␠/␠where | English cues |
| `p23_where_d1_s1_3_r` | pen␠/␠here | English cues |
| `p23_where_d1_s2_0_q` | bag␠/␠over␠there | English cues |
| `p23_where_d1_s2_0_r` | over␠there␠/␠here | English cues |
| `p23_where_d1_s2_1_q` | book␠/␠here | English cues |
| `p23_where_d1_s2_1_r` | there␠/␠over␠there | English cues |
| `p23_where_d1_s2_2_q` | notebook␠/␠there | English cues |
| `p23_where_d1_s2_2_r` | here␠/␠over␠there | English cues |
| `p23_where_d1_s2_3_q` | pen␠/␠over␠there | English cues |
| `p23_where_d1_s2_3_r` | over␠there␠/␠here | English cues |
| `p23_dialogue_s1_0_q` | there␠/␠where␠in␠France | English cues |
| `p23_dialogue_s1_0_r` | here␠/␠Paris | English cues |
| `p23_dialogue_s1_1_q` | there␠/␠where␠in␠Japan | English cues |
| `p23_dialogue_s1_1_r` | here␠/␠Osaka | English cues |
| `p23_dialogue_s1_2_q` | C␠/␠where␠in␠United␠States | English cues |
| `p23_dialogue_s1_2_r` | over␠there␠/␠Los␠Angeles | English cues |
| `p23_dialogue_s2_0_q` | there␠/␠what␠time | English cues |
| `p23_dialogue_s2_0_r` | here␠/␠10␠p.m. | English cues |
| `p23_dialogue_s2_1_q` | there␠/␠what␠time | English cues |
| `p23_dialogue_s2_1_r` | here␠/␠6␠a.m. | English cues |
| `p23_dialogue_s2_2_q` | over␠there␠/␠what␠time | English cues |
| `p23_dialogue_s2_2_r` | over␠there␠/␠1␠p.m. | English cues |
| `p23_dialogue_s3_0_q` | there␠/␠what␠day␠of␠the␠week | English cues |
| `p23_dialogue_s3_0_r` | here␠/␠Saturday | English cues |
| `p23_dialogue_s3_1_q` | there␠/␠what␠day␠of␠the␠week | English cues |
| `p23_dialogue_s3_1_r` | here␠/␠Sunday | English cues |
| `p23_dialogue_s3_2_q` | over␠there␠/␠what␠day␠of␠the␠week | English cues |
| `p23_dialogue_s3_2_r` | over␠there␠/␠Saturday | English cues |

## 修正後に残す空白：全件

英語語句内だけ。区切りの前後には置かない。

| ページ/出題キー | キュー |
| --- | --- |
| practice2.1 / `p21_d1_s0_A_2` | that␠(over␠there)/… |
| practice2.1 / `p21_d1_s0_B_2` | that␠(over␠there)/… |
| practice2.1 / `p21_d2_s0_q_2` | that␠(over␠there)/what |
| practice2.1 / `p21_d3_s0_q_0` | you/dictionary/which␠one |
| practice2.1 / `p21_d3_s0_q_1` | you/dictionary/which␠one |
| practice2.1 / `p21_d2_s1_q_2` | that␠(over␠there)/what |
| practice2.1 / `p21_d3_s1_q_0` | you/wallet/which␠one |
| practice2.1 / `p21_d3_s1_q_1` | you/wallet/which␠one |
| practice2.1 / `p21_d1_s1_q_2` | that␠(over␠there)/notebook |
| practice2.3 / `p23_describe_s0_2` | United␠States |
| practice2.3 / `p23_dialogue_s0_2_r` | C/United␠States |
| practice2.3 / `p23_describe_cities_2` | Los␠Angeles |
| practice2.3 / `p23_describe_time_0` | 6␠a.m. |
| practice2.3 / `p23_describe_time_1` | 10␠p.m. |
| practice2.3 / `p23_describe_time_2` | 1␠p.m. |
| practice2.3 / `p23_where_d1_s2_0_q` | bag/over␠there |
| practice2.3 / `p23_where_d1_s2_0_r` | over␠there/here |
| practice2.3 / `p23_where_d1_s2_1_r` | there/over␠there |
| practice2.3 / `p23_where_d1_s2_2_r` | here/over␠there |
| practice2.3 / `p23_where_d1_s2_3_q` | pen/over␠there |
| practice2.3 / `p23_where_d1_s2_3_r` | over␠there/here |
| practice2.3 / `p23_dialogue_s1_0_q` | there/where␠in␠France |
| practice2.3 / `p23_dialogue_s1_1_q` | there/where␠in␠Japan |
| practice2.3 / `p23_dialogue_s1_2_q` | C/where␠in␠United␠States |
| practice2.3 / `p23_dialogue_s1_2_r` | over␠there/Los␠Angeles |
| practice2.3 / `p23_dialogue_s2_0_q` | there/what␠time |
| practice2.3 / `p23_dialogue_s2_0_r` | here/10␠p.m. |
| practice2.3 / `p23_dialogue_s2_1_q` | there/what␠time |
| practice2.3 / `p23_dialogue_s2_1_r` | here/6␠a.m. |
| practice2.3 / `p23_dialogue_s2_2_q` | over␠there/what␠time |
| practice2.3 / `p23_dialogue_s2_2_r` | over␠there/1␠p.m. |
| practice2.3 / `p23_dialogue_s3_0_q` | there/what␠day␠of␠the␠week |
| practice2.3 / `p23_dialogue_s3_1_q` | there/what␠day␠of␠the␠week |
| practice2.3 / `p23_dialogue_s3_2_q` | over␠there/what␠day␠of␠the␠week |
| practice2.3 / `p23_dialogue_s3_2_r` | over␠there/Saturday |

## 2.2の懸念事項・改善余地（点検後の対応を含む）

| 項目 | 現状と判断 |
| --- | --- |
| D2説明 | ユーザー指定の「💡A: Ask the price and answer.」はAが質問・返答両方をするとも読める。実装はA質問/B返答。改善案「💡Ask and answer the price.」。指定文なので承認前に変えない。 |
| D4見出し | 点検後ユーザー確定により「どの人ですか？だれですか？」へ変更。Set 2 Q3もどの人がクラスメートかを尋ねる形へ変更済み。 |
| English cues | 2.1/2.3にはあるが2.2は未実装。未対応の機能として明記し、実装済みとは扱わない。追加は別途方針決定。 |
| 短い説明と必須回答 | D2は指示語＋名詞＋価格、D3は指示語＋名詞が必要。短い説明だけで不明な場合はExampleで示す方針。削除済みの長い補足を無断で戻さない。 |
| TTSの実音 | 金額は漢字生成テキストを使用し、弟/友達/先生の表記差も認識比較で正規化。使用端末・Voiceによる発音/抑揚は自動検証だけで保証しない。公開先で実音確認が必要。 |
| 写真と語彙Hover | 名前常時表示なし・人物Hover名前だけ・話者A/B赤点滅は承認済み。衣服説明や名前ラベルを追加で戻さない。 |

構造・会話整合：D1/D2の指示語と画像位置、D3の品名/群の価格、D4の紹介対象と発話者・私の関係をコードとモデルで照合。追加の不一致は確認されていない。未確認の公開実機表示を確認済みとは扱わない。

## 再検証

`node tests/lesson2-cue-spacing.cjs`：全セットの空白点検。`--snapshot`は修正前dc7d12bのキュー用ソースで一覧を再生成する監査用途。通常検証に過去ソースは使用しない。状態別JSONは実行環境の一時ディレクトリoctober2026-cue-audit内へ保存。
