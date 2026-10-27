// Snapshot audit of authored lexical slots, not source-string frequency or learner activity.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function constant(file,name){const s=fs.readFileSync(path.join(root,file),'utf8'),m=s.match(new RegExp('const '+name+' = ([\\s\\S]*?);'));if(!m)throw Error(name);return vm.runInNewContext('('+m[1]+')');}
const units=[];
function add(page,id,tokens,type='model'){units.push({page,id,type,tokens});}
const p11=constant('practice1.1.js','taskData'),dict=constant('practice1.1.js','customDict');
add('1.1','E1',['私','学生']);add('1.1','E2',['私','先生']);
p11.forEach((o,i)=>add('1.1','D1-'+(i+1),[o.xKanji,o.yKanji]));
for(const group of ['optionsX','optionsY'])for(const key of constant('practice1.1.js',group))add('1.1','D2-option-'+key,[dict[key].kanji],'option');
add('1.2','E1-Q',['お父さん','看護師']);add('1.2','E1-Yes',['看護師']);add('1.2','E1-No',['看護師']);
add('1.2','E2-Q',['専攻','何']);add('1.2','E2-R',['政治']);
constant('practice1.2.js','practice2Data').forEach((o,i)=>{add('1.2',`D1-${i+1}-Q`,[o.xKanji,o.yKanji]);for(const answer of ['Yes','No'])add('1.2',`D1-${i+1}-${answer}`,[o.yKanji]);});
constant('practice1.2.js','drill2Targets').forEach((o,i)=>{add('1.2',`D2-${i+1}-Q`,[o.labelKanji,'専攻','何']);add('1.2',`D2-${i+1}-R-template`,[]);});
constant('practice1.2.js','majorsData').forEach(o=>add('1.2','D2-option-'+o.word,[o.kanji],'option'));
const items=constant('practice2.1-scenes.js','items'),item=k=>items.find(o=>o.kind===k).kanji;
for(const k of ['book','bag','clock'])for(const speaker of ['A','B'])add('2.1','E1-'+k+'-'+speaker,[item(k)]);
for(const k of ['pen','newspaper','hat'])for(const speaker of ['A','B'])add('2.1','D1-S1-'+k+'-'+speaker,[item(k)]);
for(const [i,k] of ['notebook','pencil','tshirt'].entries()){add('2.1',`D1-S2-${i}-Q`,[item(['pencil','tshirt','notebook'][i])]);add('2.1',`D1-S2-${i}-R`,[item(k)]);}
for(const [set,kinds] of [['onigiri','bento','sandwich'],['apple','vegetables','meat']].entries())for(const [i,k]of kinds.entries()){add('2.1',`D2-S${set+1}-${i}-Q`,['何']);add('2.1',`D2-S${set+1}-${i}-R`,[item(k)]);}
for(const k of ['phone','dictionary','wallet'])for(const i of [1,2])add('2.1',`D3-${k}-${i}-Q`,[item(k)]);
// Short D3 answers have no noun; no lexical item is added for those slots.
// New Lesson 2 pages use the same item assets; count the authored lexical slots, not allowed variants.
for(const k of ['cap','sunhat','fedora'])for(const speaker of ['A','B'])add('2.2','E1-'+k+'-'+speaker,['帽子','円']);
add('2.2','D1-Example-Q',['帽子']);add('2.2','D1-Example-R',['円']);
for(const [set,k] of ['bag','clock'].entries())for(const speaker of ['A','B'])for(let i=0;i<3;i++){add('2.2',`D1-S${set+1}-${speaker}-${i}-Q`,[item(k)]);add('2.2',`D1-S${set+1}-${speaker}-${i}-R`,['円']);}
for(const set of [1,2]){add('2.2',`D2-S${set}-Example-Q`,['人','誰']);add('2.2',`D2-S${set}-Example-R`,['メアリー']);}
for(const set of [1,2])for(const name of ['メアリー','たけし','ロバート']){add('2.2',`D2-S${set}-${name}-Q`,['人','誰']);add('2.2',`D2-S${set}-${name}-R`,[name]);}
for(const [set,food] of ['おにぎり','お弁当'].entries()) {
 add('2.2',`D3-S${set+1}-Example-Q`,[food,'円']);add('2.2',`D3-S${set+1}-Example-R`,[food]);
 for(const speaker of ['A','B'])for(let i=0;i<3;i++){add('2.2',`D3-S${set+1}-${speaker}-${i}-Q`,[food,'円']);add('2.2',`D3-S${set+1}-${speaker}-${i}-R`,[food]);}
}
for(const place of ['銀行','喫茶店','図書館'])for(const speaker of ['A','B']){add('2.3','E1-'+place+'-'+speaker,[place]);add('2.3','D1-S1-'+place+'-'+speaker,[place]);}
for(const k of ['phone','dictionary','wallet'])for(const speaker of ['A','B'])add('2.3',`D1-S2-${k}-${speaker}`,[item(k)]);
for(const [set,kinds] of [['phone','wallet','dictionary'],['notebook','dictionary','wallet']].entries())for(const [i,k]of kinds.entries())add('2.3',`D2-S${set+1}-${i}-Q`,[item(k)]);
for(const k of ['phone','dictionary','wallet'])for(const i of [1,2])add('2.3',`D3-${k}-${i}-Q`,[item(k)]);

const lessons={
L1:'今|英語|学生|語|日本語|高校|午後|午前|歳|時|人|日本人|専攻|専門|先生|大学|電話|友達|名前|何|日本|年生|半|番号|私|留学生|韓国|中国|科学|アジア研究|国際関係|工学|生物学|人類学|政治|文学|歴史|仕事|医者|会社員|看護師|高校生|主婦|大学院生|大学生|弁護士|お母さん|お父さん|お姉さん|お兄さん|妹|弟|家族|国'.split('|'),
L2:'誰|美味しい|魚|肉|野菜|鉛筆|傘|鞄|靴|財布|辞書|自転車|新聞|時計|帽子|本|喫茶店|銀行|図書館|郵便局|経済|歴史|韓国|中国|英語|お母さん|お父さん|円|高い|お願いします|下さい'.split('|')};
const aliases={'鞄':'カバン','友だち':'友達','～歳':'歳'};
function matches(word,token){if(word==='人')return ['人','日本人','アメリカ人','外国人'].includes(token);if(['語','歳','時','年生'].includes(word))return token.endsWith(word);return token===(aliases[word]||word)||token===word;}
function usedPages(word){return ['1.1','1.2','2.1','2.2','2.3'].filter(page=>units.some(u=>u.page===page&&u.tokens.some(t=>matches(word,t))));}
function entry(word){return `${word==='鞄'?'カバン〔参考表記：鞄〕':word}（${usedPages(word).join('、')||'未使用'}）`;}
let out='# Genki L1・L2 参考語彙と使用ページ\n\n更新：2026-10-27。対象：練習1.1・1.2・2.1・2.2・2.3の全セット。語の右に使用ページを記載。\n\n';
out+='## 見方\n\n- 例：学生（1.1、1.2）、本（2.1）。ページ内の繰り返し回数は表示しない。\n- 手本文とは、こちらが用意した読み上げ・例文用の文のこと。手本文や問題、選択肢に登録した語を、そのページで使用している語とする。学習者の発話履歴ではない。\n- 自由入力の全組み合わせは含めない。同じ語はページごとに1つの使用箇所として示す。\n- 未使用も明記する。既習漢字一覧ではなく、語彙欄の参考漢字を確認するための表。公開リストを照合した確認用で、版差を含み、出版社紙面の完全な転記ではない。\n- この表は参考漢字のある語が中心。Genki全語彙の網羅表ではないので、この表だけから語彙カバー率を計算しない。\n\n';
for(const [lesson,words]of Object.entries(lessons)){
 out+=`## ${lesson}の参考表記\n\n| 語（使用ページ） |\n|---|\n`;
 for(const w of words)out+=`| ${entry(w)} |\n`;
 out+='\n';
}
const known=new Set(Object.values(lessons).flat().map(w=>aliases[w]||w));
const extra=[...new Set(units.flatMap(u=>u.tokens).filter(w=>/\p{Script=Han}/u.test(w)&&!known.has(w)))].sort();
out+='## 上記リストにない使用済み漢字語\n\nL1・L2の参考表記に自動で追加してよいとは限らない語。現在の独自練習・選択肢にあるため、Genki進度へ揃える際の確認対象とする。\n\n';
out+=extra.map(entry).join('、')+'。\n\n';
out+='## 照合元と再集計\n\n- [出版社公式・文字表記と学習進度](https://genki3.japantimes.co.jp/en/intro/index.html)\n- [L1語彙表](https://steven-kraft.com/projects/japanese/genki/vocab1/)／[L1の補足語彙](https://ohelo.org/japn/lang/genki_vocab_table.php?lesson=1)\n- [L2語彙表](https://nihongo-net.com/2019/07/24/genki1-lesson2-vocabulary/)／[L2照合](https://www.kakimashou.com/curricula/genki/lesson-2)\n- [L1補足の第3版照合](https://quizlet.com/1205514662/genki-additional-vocab-from-lesson-1-japn-1010-flash-cards/)では看護師・工学・生物学・家族等も確認。専攻／専門、カタカナ表記等の版差がある。現行コードのせんこうは専攻として数え、専門に統合しない。L1・L2の両方に出る語は各表に同じ使用ページを再掲する。\n- `node scripts/genki-kanji-usage.cjs`で再生成。出題パターンの変更時はこの監査スクリプトの枠定義も更新する。全枠の語を記録した[集計データ](GENKI_L1_L2_USAGE_UNITS.json)で検算可能。\n';
fs.writeFileSync(path.join(root,'docs/GENKI_L1_L2_KANJI_USAGE.md'),out);
fs.writeFileSync(path.join(root,'docs/GENKI_L1_L2_USAGE_UNITS.json'),JSON.stringify(units,null,2)+'\n');
console.log('Wrote',Object.values(lessons).reduce((n,ws)=>n+ws.length,0),'reference rows;',units.length,'authored units');
console.log('L1 used:',lessons.L1.filter(w=>usedPages(w).length).map(entry).join('、'));
console.log('L2 used:',lessons.L2.filter(w=>usedPages(w).length).map(entry).join('、'));
