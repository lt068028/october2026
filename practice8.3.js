// Practice 8.3: subject-question examples and Drill 1; shared recording lifecycle via DrillAudio.
(() => {
'use strict';
const $ = id => document.getElementById(id);
const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let scriptMode='kanji',hintMode='hover',speechStyle='formal';
let manual=false,autoplay=true,session=null,preparing=false;
let playingAudio=null,utterance=null,playButton=null;
const views=new Map(),saved=new Map(),choices=new Map();
const words={};
function W(id,kanji,hira,romaji,meaning) {
    words[id]={kanji,hira,romaji,meaning};
    STTDisplay.register(kanji,hira,meaning);
}

W('something','何か','なにか','nanika','something');
W('nothing','何も','なにも','nanimo','nothing (with a negative ending)');
W('anything','何でも','なんでも','nandemo','anything; no restriction');
W('whatkind','どんな','どんな','donna','what kind of');
W('tomorrow','明日','あした','ashita','tomorrow');
W('morning','今朝','けさ','kesa','this morning');
W('weekend','次の週末','つぎのしゅうまつ','tsugi no shūmatsu','next weekend');
W('store','デパート','デパート','depāto','department store');
W('teacher','先生','せんせい','sensei','teacher');
W('barbecue','バーベキュー','バーベキュー','bābekyū','barbecue');
W('cook','料理','りょうり','ryōri','cooking; cuisine');
W('song','歌','うた','uta','song');
W('hat','帽子','ぼうし','bōshi','hat');
W('shoes','靴','くつ','kutsu','shoes');
const verbs={};
function V(id,dict,hira,romaji,meaning,forms){W(id,dict,hira,romaji,meaning);verbs[id]={dict,...forms};}
V('drink','飲む','のむ','nomu','to drink',{masu:'飲みます',past:'飲みました',neg:'飲みません',pastNeg:'飲みませんでした',plainPast:'飲んだ',plainNeg:'飲まない',plainPastNeg:'飲まなかった'});
V('eat','食べる','たべる','taberu','to eat',{masu:'食べます',past:'食べました',neg:'食べません',pastNeg:'食べませんでした',plainPast:'食べた',plainNeg:'食べない',plainPastNeg:'食べなかった'});
V('buy','買う','かう','kau','to buy',{masu:'買います',past:'買いました',neg:'買いません',pastNeg:'買いませんでした',plainPast:'買った',plainNeg:'買わない',plainPastNeg:'買わなかった'});
V('do','する','する','suru','to do',{masu:'します',past:'しました',neg:'しません',pastNeg:'しませんでした',plainPast:'した',plainNeg:'しない',plainPastNeg:'しなかった'});
V('listen','聞く','きく','kiku','to listen; to ask',{masu:'聞きます',past:'聞きました',neg:'聞きません',pastNeg:'聞きませんでした',plainPast:'聞いた',plainNeg:'聞かない',plainPastNeg:'聞かなかった'});
V('takealong','持っていく','もっていく','motte iku','to take something along',{masu:'持っていきます',past:'持っていきました',neg:'持っていきません',pastNeg:'持っていきませんでした',plainPast:'持っていった',plainNeg:'持っていかない',plainPastNeg:'持っていかなかった'});
V('discard','捨てる','すてる','suteru','to throw away',{masu:'捨てます',past:'捨てました',neg:'捨てません',pastNeg:'捨てませんでした',plainPast:'捨てた',plainNeg:'捨てない',plainPastNeg:'捨てなかった'});
V('wash','洗う','あらう','arau','to wash',{masu:'洗います',past:'洗いました',neg:'洗いません',pastNeg:'洗いませんでした',plainPast:'洗った',plainNeg:'洗わない',plainPastNeg:'洗わなかった'});
V('cut','切る','きる','kiru','to cut',{masu:'切ります',past:'切りました',neg:'切りません',pastNeg:'切りませんでした',plainPast:'切った',plainNeg:'切らない',plainPastNeg:'切らなかった'});
V('make','作る','つくる','tsukuru','to make',{masu:'作ります',past:'作りました',neg:'作りません',pastNeg:'作りませんでした',plainPast:'作った',plainNeg:'作らない',plainPastNeg:'作らなかった'});
V('sing','歌う','うたう','utau','to sing',{masu:'歌います',past:'歌いました',neg:'歌いません',pastNeg:'歌いませんでした',plainPast:'歌った',plainNeg:'歌わない',plainPastNeg:'歌わなかった'});
V('cap','かぶる','かぶる','kaburu','to wear a hat',{masu:'かぶります',past:'かぶりました',neg:'かぶりません',pastNeg:'かぶりませんでした',plainPast:'かぶった',plainNeg:'かぶらない',plainPastNeg:'かぶらなかった'});
V('wearshoes','はく','はく','haku','to wear footwear',{masu:'はきます',past:'はきました',neg:'はきません',pastNeg:'はきませんでした',plainPast:'はいた',plainNeg:'はかない',plainPastNeg:'はかなかった'});
V('teach','教える','おしえる','oshieru','to teach',{masu:'教えます',past:'教えました',neg:'教えません',pastNeg:'教えませんでした',plainPast:'教えた',plainNeg:'教えない',plainPastNeg:'教えなかった'});
// Register complete inflections: a dictionary-form reading alone cannot read 飲みます.
const formReadings=[];
for(const [id,v]of Object.entries(verbs)){
 const w=words[id],suffix=w.kanji.match(/[ぁ-ん]+$/)?.[0]||'';
 const stem=suffix?w.kanji.slice(0,-suffix.length):w.kanji,reading=suffix?w.hira.slice(0,-suffix.length):w.hira;
 for(const text of Object.values(v)){
  const kana=stem?text.replace(stem,reading):text;formReadings.push([text,kana]);
  if(id==='listen')for(const mark of ['聴','訊'])formReadings.push([text.replace('聞',mark),kana]);
  if(id==='takealong')formReadings.push([text.replace('持ってい','持って行'),kana]);
  if(id==='wearshoes')for(const mark of ['履','穿'])formReadings.push([text.replace(/^は/,mark),kana]);
  if(id==='cap')formReadings.push([text.replace(/^かぶ/,'被'),kana]);
 }
}
formReadings.forEach(e=>STTDisplay.register(...e));
words['teach'].kanji = 'おしえる';
const dictionary=[...formReadings,...Object.values(words).map(w=>[w.kanji,w.hira]),['私','わたし'],['何','なに'],['果物','くだもの'],['教える','おしえる'],['教えます','おしえます'],['冷蔵庫','れいぞうこ'],['聴く','きく'],['訊く','きく'],['映画','えいが'],['日本の映画','にほんのえいが'],['日本','にほん'],['山下先生','やましたせんせい'],['山下','やました'],['山口さん','やまぐちさん'],['山口','やまぐち'],['中山さん','なかやまさん'],['中山','なかやま'],['川村さん','かわむらさん'],['川村','かわむら'],['歌が上手','うたがじょうず'],['歌','うた'],['上手','じょうず'],['友達','ともだち'],['楽しい','たのしい'],['好き','すき'],['音楽','おんがく'],['難しい','むずかしい'],['日本語','にほんご'],['来る','くる'],['来ます','きます'],['始まる','はじまる'],['始まります','はじまります'],['始まっている','はじまっている'],['始まっています','はじまっています'],['終わる','おわる'],['終わります','おわります'],['終わっている','おわっている'],['終わっています','おわっています'],['作る','つくる'],['作ります','つくります'],['休む','やすむ'],['休みます','やすみます'],['会社','かいしゃ'],['店','みせ'],['２番','２ばん'],['２番のバス','にばんのバス'],['４ページ','よんページ'],['イタリアの映画','イタリアのえいが'],['どの映画','どのえいが'],['フランスの会社','フランスのかいしゃ'],['どの会社','どのかいしゃ'],['あの店','あのみせ'],['どの店','どのみせ'],['ダンスのイベント','ダンスのイベント'],['どのイベント','どのイベント'],['英語のクラス','えいごのクラス'],['英語','えいご'],['木村さんのチーム','きむらさんのチーム'],['どのチーム','どのチーム'],['木村','きむら'],['チーム','チーム'],['わからない','わからない'],['スペイン語の本','スペインごのほん'],['どの本','どのほん'],['本','ほん'],['スペイン語','スペインご'],['どの部屋','どのへや'],['その部屋','そのへや'],['部屋','へや'],['静か','しずか'],['何曜日','なんようび'],['水曜日','すいようび'],['暇','ひま'],['どの時計','どのとけい'],['あの時計','あのとけい'],['時計','とけい'],['高い','たかい'],['どのペン','どのペン'],['先生のペン','せんせいのペン'],['妹のペン','いもうとのペン'],['妹','いもうと'],['新しい','あたらしい'],['どのコンビニ','どのコンビニ'],['コンビニ','コンビニ'],['近い','ちかい'],['どのカフェ','どのカフェ'],['駅のカフェ','えきのカフェ'],['どのトイレ','どのトイレ'],['駅のトイレ','えきのトイレ'],['トイレ','トイレ'],['どのクラスメート','どのクラスメート'],['どの学生','どのがくせい'],['どの友達','どのともだち'],['この池','このいけ'],['池','いけ'],['どの魚','どのさかな'],['魚','さかな'],['コイ','コイ'],['泳いでいる','およいでいる'],['泳いでいます','およいでいます'],['泳ぐ','およぐ'],['親切','しんせつ'],['どの店の店員','どのみせのてんいん'],['どの店員','どのてんいん'],['店員','てんいん'],['本屋の店員','ほんやのてんいん'],['本屋','ほんや'],['どのゲーム','どのゲーム'],['ゲーム','ゲーム'],['このRPG','このRPG'],['このアールピージー','このRPG'],['RPG','RPG'],['アールピージー','RPG'],['どの人','どのひと'],['人','ひと'],['駅','えき'],['カフェ','カフェ'],['きれい','きれい'],['どの日','どのひ'],['日','ひ'],['クリスマス','クリスマス'],['どの時間','どのじかん'],['時間','じかん'],['忙しい','いそがしい'],['午後','ごご'],['得意','とくい'],['勉強','べんきょう'],['ピアノをひく','ピアノをひく'],['ピアノ','ピアノ'],['ひく','ひく'],['弾く','ひく'],['歌う','うたう'],['きらい','きらい'],['嫌い','きらい']].sort((a,b)=>b[0].length-a[0].length);
[['聴く','きく'],['訊く','きく'],['果物','くだもの'],['教える','おしえる'],['教えます','おしえます'],['冷蔵庫','れいぞうこ'],['映画','えいが'],['日本の映画','にほんのえいが'],['日本','にほん'],['山下先生','やましたせんせい'],['山下','やました'],['山口さん','やまぐちさん'],['山口','やまぐち'],['中山さん','なかやまさん'],['中山','なかやま'],['川村さん','かわむらさん'],['川村','かわむら'],['歌が上手','うたがじょうず'],['歌','うた'],['上手','じょうず'],['友達','ともだち'],['楽しい','たのしい'],['好き','すき'],['音楽','おんがく'],['難しい','むずかしい'],['日本語','にほんご'],['来る','くる'],['来ます','きます'],['始まる','はじまる'],['始まります','はじまります'],['始まっている','はじまっている'],['始まっています','はじまっています'],['終わる','おわる'],['終わります','おわります'],['終わっている','おわっている'],['終わっています','おわっています'],['作る','つくる'],['作ります','つくります'],['休む','やすむ'],['休みます','やすみます'],['会社','かいしゃ'],['店','みせ'],['２番','２ばん'],['２番のバス','にばんのバス'],['４ページ','よんページ'],['イタリアの映画','イタリアのえいが'],['どの映画','どのえいが'],['フランスの会社','フランスのかいしゃ'],['どの会社','どのかいしゃ'],['あの店','あのみせ'],['どの店','どのみせ'],['ダンスのイベント','ダンスのイベント'],['どのイベント','どのイベント'],['英語のクラス','えいごのクラス'],['英語','えいご'],['木村さんのチーム','きむらさんのチーム'],['どのチーム','どのチーム'],['木村','きむら'],['チーム','チーム'],['わからない','わからない'],['スペイン語の本','スペインごのほん'],['どの本','どのほん'],['本','ほん'],['スペイン語','スペインご'],['どの部屋','どのへや'],['その部屋','そのへや'],['部屋','へや'],['静か','しずか'],['何曜日','なんようび'],['水曜日','すいようび'],['暇','ひま'],['どの時計','どのとけい'],['あの時計','あのとけい'],['時計','とけい'],['高い','たかい'],['どのペン','どのペン'],['先生のペン','せんせいのペン'],['妹のペン','いもうとのペン'],['妹','いもうと'],['新しい','あたらしい'],['どのコンビニ','どのコンビニ'],['コンビニ','コンビニ'],['近い','ちかい'],['どのカフェ','どのカフェ'],['駅のカフェ','えきのカフェ'],['どのトイレ','どのトイレ'],['駅のトイレ','えきのトイレ'],['トイレ','トイレ'],['どのクラスメート','どのクラスメート'],['どの学生','どのがくせい'],['どの友達','どのともだち'],['この池','このいけ'],['池','いけ'],['どの魚','どのさかな'],['魚','さかな'],['コイ','コイ'],['泳いでいる','およいでいる'],['泳いでいます','およいでいます'],['泳ぐ','およぐ'],['親切','しんせつ'],['どの店の店員','どのみせのてんいん'],['どの店員','どのてんいん'],['店員','てんいん'],['本屋の店員','ほんやのてんいん'],['本屋','ほんや'],['どのゲーム','どのゲーム'],['ゲーム','ゲーム'],['このRPG','このRPG'],['このアールピージー','このRPG'],['RPG','RPG'],['アールピージー','RPG'],['どの人','どのひと'],['人','ひと'],['駅','えき'],['カフェ','カフェ'],['きれい','きれい'],['どの日','どのひ'],['日','ひ'],['クリスマス','クリスマス'],['どの時間','どのじかん'],['時間','じかん'],['忙しい','いそがしい'],['午後','ごご'],['得意','とくい'],['勉強','べんきょう'],['ピアノをひく','ピアノをひく'],['ピアノ','ピアノ'],['ひく','ひく'],['弾く','ひく'],['歌う','うたう'],['きらい','きらい'],['嫌い','きらい']].forEach(e=>STTDisplay.register(...e));
function displayKana(text){let value=String(text);for(const [k,h]of dictionary)value=value.split(k).join(h);for(const w of Object.values(words).sort((a,b)=>b.kanji.length-a.kanji.length)){if(w.kanji!==w.hira)value=value.split(w.kanji).join(w.hira);}return value;}
function hira(text){return displayKana(String(text).normalize('NFKC')).replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));}
function normalize(text){return hira(text).replace(/なにかを/g,'なにか').replace(/[\p{P}\p{Z}\s]/gu,'').replace(/^ううんん|^うんん/,'ううん').replace(/^いえ/,'いいえ').replace(/(?:よね|よ|ね)$/,'');}
const sections=[
 {title:'Drill 1: Subject Questions — だれ／何 (Verb)',instruction:'💡Ask with だれ or 何, narrow down with a specific noun, then answer.'},
 {title:'Drill 2: Subject Questions — だれ／何 (Adjective)',instruction:'💡Ask with an adjective (だれ or 何), narrow down with a specific noun, then answer.'},
 {title:'Drill 3: Subject Questions — どれ／どこ (Verb)',instruction:'💡Ask with どれ or どこ, narrow down with a specific noun, then answer.'},
 {title:'Drill 4: Subject Questions — どれ／どこ／いつ (Adjective)',instruction:'💡Ask with an adjective (どれ, どこ, or いつ), narrow down with a specific noun, then answer.'}
];
let currentD1Set=0,currentD2Set=0,currentD3Set=0,currentD4Set=0;
const d1Sets=[
 {
  name:'だれ',
  label:'だれ (Who)',
  items:[
   {q1:'だれが、てつだいますか。',q2:'どの学生が、てつだいますか。',a:'山田さんが、てつだいます。',c1:['だれ','てつだう'],c2:['どの','学生','てつだう'],ca:['山田さん']},
   {q1:'だれが、りょうりしますか。',q2:'どの学生が、りょうりしますか。',a:'田中さんが、りょうりします。',accept:['田中さんが、りょうりをします。'],c1:['だれ','りょうりする'],c2:['どの','学生','りょうりする'],ca:['田中さん']}
  ]
 },
 {
  name:'何',
  label:'何 (What)',
  items:[
   {q1:'何が、こうえんにいますか。',q2:'どのペットが、いますか。',a:'いぬが、います。',accept:['いぬが、こうえんにいます。'],c1:['何','こうえん','いる'],c2:['どの','ペット','いる'],ca:['いぬ']},
   {q1:'何が、この池で泳いでいますか。',q2:'どの魚が、泳いでいますか。',a:'コイが、泳いでいます。',accept:['こいが、およいでいます。','コイが泳いでいます。','何が、この池に泳いでいますか。','なにが、このいけでおよいでいますか。','なにが、この池で泳いでいますか。'],c1:['何','この池','およいでいる'],c2:['どの魚','およいでいる'],ca:['コイ']}
  ]
 }
];
const d2Sets=[
 {
  name:'だれ',
  label:'だれ (Who)',
  items:[
   {q1:'だれが、勉強が得意ですか。',q2:'どの人が、勉強が得意ですか。',a:'山口さんが、勉強が得意です。',accept:['やまぐちさんが、べんきょうがとくいです。','やまぐちさんが、勉強が得意です。','山口さんが、勉強が得意です。','やまぐちさんが、勉強がとくいです。','山口さんが、べんきょうがとくいです。','やまぐちさんが、べんきょうが得意です。','山口さんが、べんきょうが得意です。','山口さんが、勉強がとくいです。'],c1:['だれ','勉強','とくい'],c2:['どの人','勉強','とくい'],ca:['山口さん']},
   {q1:'だれが、ピアノをひくのが上手ですか。',q2:'どのクラスメートが、ピアノをひくのが上手ですか。',a:'中山さんが、ピアノをひくのが上手です。',accept:['なかやまさんが、ピアノをひくのがじょうずです。','中山さんが、ピアノをひくのが上手です。','なかやまさんが、ピアノを弾くのが上手です。','中山さんが、ピアノを弾くのが上手です。','なかやまさんが、ピアノを弾くのがじょうずです。','中山さんが、ピアノをひくのがじょうずです。','中山さんが、ピアノを弾くのがじょうずです。'],c1:['だれ','ピアノをひく','じょうず'],c2:['どのクラスメート','ピアノをひく','じょうず'],ca:['中山さん']},
   {q1:'だれが、歌うのがきらいですか。',q2:'どの友達が、歌うのがきらいですか。',a:'川村さんが、歌うのがきらいです。',accept:['かわむらさんが、うたうのがきらいです。','川村さんが、うたうのがきらいです。','かわむらさんが、歌うのが嫌いです。','川村さんが、歌うのが嫌いです。','かわむらさんが、うたうのが嫌いです。','川村さんが、歌うのがきらいです。','かわむらさんが、歌うのがきらいです。'],c1:['だれ','うたう','きらい'],c2:['どの友達','うたう','きらい'],ca:['川村さん']}
  ]
 },
 {
  name:'何',
  label:'何 (What)',
  items:[
   {q1:'何が、楽しいですか。',q2:'どのスポーツが、楽しいですか。',a:'テニスが、楽しいです。',c1:['何','たのしい'],c2:['どの','スポーツ','たのしい'],ca:['テニス']},
   {q1:'何が、好きですか。',q2:'どの音楽が、好きですか。',a:'ロックが、好きです。',c1:['何','すき'],c2:['どの','音楽','すき'],ca:['ロック']},
   {q1:'何が、難しいですか。',q2:'どのクラスが、難しいですか。',a:'英語のクラスが、難しいです。',accept:['えいごのクラスが、むずかしいです。'],c1:['何','むずかしい'],c2:['どのクラス','むずかしい'],ca:['英語のクラス']}
  ]
 }
];
const d3Sets=[
 {
  name:'どれ',
  label:'どれ (Which one)',
  items:[
   {q1:'どれが、はじまっていますか。',q2:'どの映画が、はじまっていますか。',a:'イタリアの映画が、はじまっています。',accept:['イタリアの映画が、始まります。','イタリアの映画が、始まっています。','イタリアの映画が、はじまります。','イタリアの映画が、はじまっています。','イタリアのえいがが、はじまっています。','イタリアのえいがが、はじまります。','始まっています','始まります','はじまっています','はじまります'],c1:['どれ','はじまっている'],c2:['どの映画','はじまっている'],ca:['イタリアの映画']},
   {q1:'どれが、おわっていますか。',q2:'どのイベントが、おわっていますか。',a:'ダンスのイベントが、おわっています。',accept:['ダンスのイベントが、終わります。','ダンスのイベントが、終わっています。','ダンスのイベントが、おわります。','ダンスのイベントが、おわっています。','終わっています','終わります','おわっています','おわります'],c1:['どれ','おわっている'],c2:['どのイベント','おわっている'],ca:['ダンスのイベント']}
  ]
 },
 {
  name:'どこ',
  label:'どこ (Where)',
  items:[
   {q1:'どこが、作りますか。',q2:'どの会社が、作りますか。',a:'フランスの会社が、作ります。',accept:['フランスのかいしゃが、つくります。'],c1:['どこ','つくる'],c2:['どの会社','つくる'],ca:['フランスの会社']},
   {q1:'どこが、休みますか。',q2:'どのチームが、休みますか。',a:'木村さんのチームが、休みます。',accept:['きむらさんのチームが、やすみます。'],c1:['どこ','やすむ'],c2:['どのチーム','やすむ'],ca:['木村さんのチーム']}
  ]
 }
];
const d4Sets=[
 {
  name:'どれ',
  label:'どれ (Which one)',
  items:[
   {q1:'どれが、高いですか。',q2:'どの時計が、高いですか。',a:'あの時計が、高いです。',accept:['あのとけいが、たかいです。'],c1:['どれ','たかい'],c2:['どの時計','たかい'],ca:['あの時計']},
   {q1:'どれが、新しいですか。',q2:'どのペンが、新しいですか。',a:'妹のペンが、新しいです。',accept:['いもうとのペンが、あたらしいです。'],c1:['どれ','あたらしい'],c2:['どのペン','あたらしい'],ca:['妹のペン']}
  ]
 },
 {
  name:'どこ',
  label:'どこ (Where)',
  items:[
   {q1:'どこが、ちかいですか。',q2:'どのコンビニが、ちかいですか。',a:'ローソンが、ちかいです。',accept:['ローソンが、近いです。','ローソンが、ちかいです。'],c1:['どこ','ちかい'],c2:['どのコンビニ','ちかい'],ca:['ローソン']},
   {q1:'どこが、きれいですか。',q2:'どのトイレが、きれいですか。',a:'駅のトイレが、きれいです。',accept:['えきのトイレが、きれいです。'],c1:['どこ','きれい'],c2:['どのトイレ','きれい'],ca:['駅のトイレ']}
  ]
 },
 {
  name:'いつ',
  label:'いつ (When)',
  items:[
   {q1:'いつが、いいですか。',q2:'どの日が、いいですか。',a:'クリスマスが、いいです。',c1:['いつ','いい'],c2:['どの日','いい'],ca:['クリスマス']},
   {q1:'いつが、忙しいですか。',q2:'どの時間が、忙しいですか。',a:'午後が、忙しいです。',accept:['ごごが、いそがしいです。'],c1:['いつ','いそがしい'],c2:['どの時間','いそがしい'],ca:['午後']}
  ]
 }
];
const exSets1=[
 {q1:'だれが、教えますか。',q2:'どの先生が、教えますか。',a:'先生が、教えます。',accept:['せんせいが、おしえます。'],c1:['だれ','おしえる'],c2:['どの','先生','おしえる'],ca:['先生']},
 {q1:'何が、キッチンにありますか。',q2:'どの果物が、ありますか。',a:'りんごが、あります。',c1:['何','キッチン','ある'],c2:['どの','くだもの','ある'],ca:['りんご','ある']}
];
const exSets2=[
 {q1:'だれが、親切ですか。',q2:'どの店の店員が、親切ですか。',a:'本屋の店員が、親切です。',accept:['ほんやのてんいんが、しんせつです。'],c1:['だれ','しんせつ'],c2:['どの店の店員','しんせつ'],ca:['本屋の店員']},
 {q1:'何が、おもしろいですか。',q2:'どのゲームが、おもしろいですか。',a:'このRPGが、おもしろいです。',accept:['このアールピージーが、おもしろいです。','このRPGが、おもしろいです。','このアールピージーが、面白いです。','このRPGが、面白いです。','アールピージーが、おもしろいです。'],c1:['何','おもしろい'],c2:['どのゲーム','おもしろい'],ca:['このRPG']}
];
const exSets4=[
 {q1:'どれが、ないですか。',q2:'どの本が、ないですか。',a:'スペイン語の本が、ないです。',accept:['スペインごのほんが、ないです。','スペイン語の本が、ありません。'],c1:['どれ','ない'],c2:['どの本','ない'],ca:['スペイン語の本']},
 {q1:'どこが、静かですか。',q2:'どの部屋が、静かですか。',a:'その部屋が、静かです。',accept:['そのへやが、しずかです。'],c1:['どこ','しずか'],c2:['どの部屋','しずか'],ca:['その部屋']},
 {q1:'いつが、ひまですか。',q2:'何曜日が、ひまですか。',a:'水曜日が、ひまです。',accept:['すいようびが、ひまです。','すいようびが、暇です。'],c1:['いつ','ひま'],c2:['何曜日','ひま'],ca:['水曜日']}
];
const exSets3=[
 {q1:'どれが、来ますか。',q2:'どのバスが、来ますか。',a:'２番が、来ます。',accept:['２番のバスが、来ます。','にばんが、きます。','２ばんが、きます。'],c1:['どれ','くる'],c2:['どのバス','くる'],ca:['２番']},
 {q1:'どこが、わかりませんか。',q2:'どのページが、わかりませんか。',a:'４ページが、わかりません。',accept:['よんページが、わかりません。'],c1:['どこ','わからない'],c2:['どのページ','わからない'],ca:['４ページ']}
];
[['だれ','who'],['どの','which'],['学生','student'],['クラスメート','classmate'],['先生','teacher'],['おしえる','to teach'],['てつだう','to help'],['りょうりする','to cook'],['何','what'],['こうえん','park'],['ペット','pet'],['いぬ','dog'],['キッチン','kitchen'],['れいぞうこ','refrigerator'],['ある','there is'],['いる','there is (living things)'],['やさい','vegetable'],['くだもの','fruit'],['トマト','tomato'],['田中','Tanaka'],['来る','to come'],['りんご','apple'],['山田','Yamada'],['やさしい','kind'],['山下先生','Prof. Yamashita'],['おもしろい','interesting'],['えいが','movie'],['日本','Japan'],['山口さん','Yamaguchi'],['かっこいい','cool; good-looking'],['中山さん','Nakayama'],['うた','song'],['じょうず','good at'],['友達','friend'],['川村さん','Kawamura'],['たのしい','fun'],['スポーツ','sports'],['テニス','tennis'],['すき','favorite; liked'],['音楽','music'],['ロック','rock music'],['むずかしい','difficult'],['クラス','class'],['日本語','Japanese language'],['どれ','which one'],['どこ','where'],['くる','to come'],['わかる','to understand'],['はじまる','to begin'],['おわる','to end'],['はじまっている','to have started'],['おわっている','to have ended'],['つくる','to make'],['やすむ','to rest / be absent'],['どのバス','which bus'],['２番','No. 2'],['どのページ','which page'],['４ページ','page 4'],['どの映画','which movie'],['イタリアの映画','Italian movie'],['どのイベント','which event'],['ダンスのイベント','dance event'],['どの会社','which company'],['フランスの会社','French company'],['どの店','which shop'],['あの店','that shop'],['どのチーム','which team'],['木村さんのチーム','Kimura\'s team'],['英語','English language'],['わからない','to not understand'],['ない','there is not'],['どの本','which book'],['スペイン語の本','Spanish book'],['しずか','quiet'],['どの部屋','which room'],['その部屋','that room'],['いつ','when'],['ひま','free (time)'],['何曜日','what day of the week'],['水曜日','Wednesday'],['たかい','expensive / high'],['どの時計','which watch'],['あの時計','that watch over there'],['あたらしい','new'],['どのペン','which pen'],['妹のペン','younger sister\'s pen'],['ちかい','near / close'],['どのコンビニ','which convenience store'],['ローソン','Lawson'],['きれい','clean / beautiful'],['どのトイレ','which restroom / toilet'],['駅のトイレ','station restroom'],['どのクラスメート','which classmate'],['どの学生','which student'],['どの友達','which friend'],['この池','this pond'],['どの魚','which fish'],['コイ','carp'],['およいでいる','swimming / to be swimming'],['しんせつ','kind / helpful'],['どの店員','which store clerk'],['どの店の店員','clerk of which store'],['本屋の店員','bookstore clerk'],['どのゲーム','which game'],['このRPG','this RPG'],['RPG','role-playing game'],['どの人','which person'],['いい','good'],['どの日','which day'],['クリスマス','Christmas'],['いそがしい','busy'],['どの時間','which time / hour'],['午後','afternoon'],['勉強','study'],['とくい','good at / one\'s forte'],['ピアノをひく','to play the piano'],['うたう','to sing'],['きらい','disliked / hate']].forEach(([kanji,meaning],i)=>W('s83w'+i,kanji,({'だれ':'だれ','どの':'どの','学生':'がくせい','クラスメート':'クラスメート','先生':'せんせい','おしえる':'おしえる','てつだう':'てつだう','りょうりする':'りょうりする','何':'なに','こうえん':'こうえん','ペット':'ペット','いぬ':'いぬ','キッチン':'キッチン','れいぞうこ':'れいぞうこ','ある':'ある','いる':'いる','やさい':'やさい','くだもの':'くだもの','トマト':'トマト','田中':'たなか','来る':'くる','りんご':'りんご','山田':'やまだ','やさしい':'やさしい','山下先生':'やましたせんせい','おもしろい':'おもしろい','えいが':'えいが','日本':'にほん','山口さん':'やまぐちさん','かっこいい':'かっこいい','中山さん':'なかやまさん','うた':'うた','じょうず':'じょうず','友達':'ともだち','川村さん':'かわむらさん','たのしい':'たのしい','スポーツ':'スポーツ','テニス':'テニス','すき':'すき','音楽':'おんがく','ロック':'ロック','むずかしい':'むずかしい','クラス':'クラス','日本語':'にほんご','どれ':'どれ','どこ':'どこ','くる':'くる','わかる':'わかる','はじまる':'はじまる','おわる':'おわる','はじまっている':'はじまっている','おわっている':'おわっている','つくる':'つくる','やすむ':'やすむ','どのバス':'どのバス','２番':'２ばん','どのページ':'どのページ','４ページ':'よんページ','どの映画':'どのえいが','イタリアの映画':'イタリアのえいが','どのイベント':'どのイベント','ダンスのイベント':'ダンスのイベント','どの会社':'どのかいしゃ','フランスの会社':'フランスのかいしゃ','どの店':'どのみせ','あの店':'あのみせ','どのチーム':'どのチーム','木村さんのチーム':'きむらさんのチーム','英語':'えいご','わからない':'わからない','ない':'ない','どの本':'どのほん','スペイン語の本':'スペインごのほん','しずか':'しずか','どの部屋':'どのへや','その部屋':'そのへや','いつ':'いつ','ひま':'ひま','何曜日':'なんようび','水曜日':'すいようび','たかい':'たかい','どの時計':'どのとけい','あの時計':'あのとけい','あたらしい':'あたらしい','どのペン':'どのペン','妹のペン':'いもうとのペン','ちかい':'ちかい','どのコンビニ':'どのコンビニ','ローソン':'ローソン','きれい':'きれい','どのトイレ':'どのトイレ','駅のトイレ':'えきのトイレ','どのクラスメート':'どのクラスメート','どの学生':'どのがくせい','どの友達':'どのともだち','この池':'このいけ','どの魚':'どのさかな','コイ':'コイ','およいでいる':'およいでいる','しんせつ':'しんせつ','どの店員':'どのてんいん','どの店の店員':'どのみせのてんいん','本屋の店員':'ほんやのてんいん','どのゲーム':'どのゲーム','このRPG':'このRPG','RPG':'RPG','どの人':'どのひと','いい':'いい','どの日':'どのひ','クリスマス':'クリスマス','いそがしい':'いそがしい','どの時間':'どのじかん','午後':'ごご','勉強':'べんきょう','とくい':'とくい','ピアノをひく':'ピアノをひく','うたう':'うたう','きらい':'きらい'})[kanji],'',meaning));
function inflect(s){return s.text;}
function context(s){return '';}
function sentenceFor(s){return s.text||'';}
function makeRow(id,spec,extra={}){const r={id,...spec,...extra};r.text=sentenceFor(r);r.hira=displayKana(r.text);r.refs=[r.text,r.hira,...(r.accept||[])];STTDisplay.register(r.text,r.hira);return r;}
function makeKindBadge(kind){
 const span=node('span','example-label-title p81-kind');
 if(kind==='Q'||kind==='A'){span.textContent=kind;}
 else{span.classList.add('conversation-role','conversation-role-blank');const circle=node('span','conversation-role-circle');circle.textContent='Q';circle.style.visibility='hidden';circle.setAttribute('aria-hidden','true');span.append(circle);}
 return span;
}
function rowsFor(si){
 if(si===0){
  const setDef=d1Sets[currentD1Set],offset=currentD1Set===0?0:d1Sets[0].items.length;
  return setDef.items.map((s,i)=>{
   const globalIndex=offset+i;
   return [
    makeRow('d1-'+globalIndex+'-q1',{text:s.q1,cueIds:s.c1},{kind:'Q'}),
    makeRow('d1-'+globalIndex+'-q2',{text:s.q2,cueIds:s.c2},{kind:''}),
    makeRow('d1-'+globalIndex+'-a',{text:s.a,accept:s.accept||[],cueIds:s.ca},{kind:'A'})
   ];
  });
 }
 if(si===1){
  const setDef=d2Sets[currentD2Set],offset=currentD2Set===0?0:d2Sets[0].items.length;
  return setDef.items.map((s,i)=>{
   const globalIndex=offset+i;
   return [
    makeRow('d2-'+globalIndex+'-q1',{text:s.q1,cueIds:s.c1},{kind:'Q'}),
    makeRow('d2-'+globalIndex+'-q2',{text:s.q2,cueIds:s.c2},{kind:''}),
    makeRow('d2-'+globalIndex+'-a',{text:s.a,accept:s.accept||[],cueIds:s.ca},{kind:'A'})
   ];
  });
 }
 if(si===3){
  const setDef=d4Sets[currentD4Set];
  const offset=currentD4Set===0?0:(currentD4Set===1?d4Sets[0].items.length:d4Sets[0].items.length+d4Sets[1].items.length);
  return setDef.items.map((s,i)=>{
   const globalIndex=offset+i;
   return [
    makeRow('d4-'+globalIndex+'-q1',{text:s.q1,cueIds:s.c1},{kind:'Q'}),
    makeRow('d4-'+globalIndex+'-q2',{text:s.q2,cueIds:s.c2},{kind:''}),
    makeRow('d4-'+globalIndex+'-a',{text:s.a,accept:s.accept||[],cueIds:s.ca},{kind:'A'})
   ];
  });
 }
 if(si===2){
  const setDef=d3Sets[currentD3Set],offset=currentD3Set===0?0:d3Sets[0].items.length;
  return setDef.items.map((s,i)=>{
   const globalIndex=offset+i;
   return [
    makeRow('d3-'+globalIndex+'-q1',{text:s.q1,cueIds:s.c1},{kind:'Q'}),
    makeRow('d3-'+globalIndex+'-q2',{text:s.q2,cueIds:s.c2},{kind:''}),
    makeRow('d3-'+globalIndex+'-a',{text:s.a,accept:s.accept||[],cueIds:s.ca},{kind:'A'})
   ];
  });
 }
 return [];
}
function matchesAnswer(raw,r){const value=r.verb==='listen'?String(raw).replace(/[聴訊]/g,'聞'):r.verb==='takealong'?String(raw).replace(/持って行/g,'持ってい'):r.verb==='wearshoes'?String(raw).replace(/[履穿]/g,'は'):r.verb==='cap'?String(raw).replace(/被/g,'かぶ'):raw;return !r.pending&&DrillAnswer.formAllowed(raw,speechStyle)&&Boolean(normalize(value))&&r.refs.some(t=>normalize(t)===normalize(value));}
function feedback(){return null;}
function keyFor(r){return r.id+':'+(r.yn?(r.pending?'unselected':r.answer):'fixed');}
function word(id,shown){const w=words[id],text=escape(shown??w[scriptMode==='kanji'?'kanji':'hira']),tip=escape(w.romaji+', '+w.meaning);if(hintMode==='off')return '<span class="target-word">'+text+'</span>';if(hintMode==='paren')return '<span class="target-word">'+text+'</span><span class="vocab-inline">('+tip+')</span>';return '<span class="tooltip-wrap"><span class="target-word">'+text+'</span><span class="tooltip-tip">'+tip+'</span></span>';}
function cues(r){const ids=r.cueIds||[];return ids.map(id=>{const found=Object.keys(words).find(k=>words[k].kanji===id||words[k].hira===id);if(!found)return escape(scriptMode==='kanji'?id:displayKana(id));const value=word(found);return hintMode==='paren'?'<span class="display-cue-unit">'+value+'</span>':value;}).join(hintMode==='paren'?'':'／');}
function modelHTML(r){
 const text=scriptMode==='kanji'?r.text:r.hira;
 // Highlight the subject marker in the same shared grammar-highlight style as other pages.
 return escape(text).replace(/が/g,'<strong class="grammar-highlight">が</strong>');
}
function button(text, fn, tip = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'example-button';
    b.append(document.createTextNode(text));
    b.onclick = fn;

    if (tip) {
        b.classList.add('custom-tip-wrap');

        const t = document.createElement('span');
        t.className = 'custom-tip-box';
        t.textContent = tip;
        b.append(t);
    }

    return b;
}

function stopPlayback() {
    DrillAudio.invalidatePlayback();
    // Detach callbacks before cancel: browsers may deliver an error synchronously.
    if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
    }
    if (playingAudio) {
        playingAudio.onended = null;
        playingAudio.onerror = null;
    }
    window.speechSynthesis?.cancel();

    if (playingAudio) {
        playingAudio.pause();
        playingAudio = null;
    }

    if (playButton) {
        playButton.disabled = false;
        playButton.replaceChildren(...playButton._contents);
        playButton = null;
    }

    utterance = null;
}

function markPlaying(b) {
    if (!b) return;

    playButton = b;
    b._contents = Array.from(b.childNodes);
    b.disabled = true;
    b.textContent = 'Playing...';
}

function speechText(text) { return text.replace(/^ううん、/,'ううんん、'); }

const VOICE_STORAGE_KEY82 = 'october2026.selectedVoiceName';
let preferredVoice81 = null;

function voicePriorityRank81(v) {
    if (DrillAudio.isChromeJapanese3(v)) return -1;
    const name = (v && v.name) ? v.name : '';
    if (/chrome os/i.test(name)) return 0;
    if (/google/i.test(name)) return 1;
    if (/nanami/i.test(name)) return 2;
    if (/keita/i.test(name)) return 3;
    if (/haruka/i.test(name)) return 4;
    return 5;
}

function setupPreferredVoice82() {
    try {
        const synth = window.speechSynthesis;
        const voices = synth ? synth.getVoices() : [];

        const japanese = (voices || [])
            .filter(v => v && v.lang && /^ja(?:$|[-_])/i.test(v.lang))
            .sort((a, b) => voicePriorityRank81(a) - voicePriorityRank81(b));

        let savedName = null;
        try {
            savedName = localStorage.getItem(VOICE_STORAGE_KEY82);
        } catch (e) {}

        let selected = savedName
            ? japanese.find(v => v.name === savedName)
            : null;

        if (!selected) {
            selected = japanese[0] || null;
        }

        preferredVoice81 = selected;

        const selectEl = document.getElementById('voiceSelect');
        if (selectEl) {
            selectEl.setAttribute('translate', 'no');
            selectEl.classList.add('notranslate', 'is-enhanced');

            const labelEl = document.querySelector('label[for="voiceSelect"]');
            if (labelEl) {
                labelEl.setAttribute('for', 'voiceDropdownBtn');
            }

            let dropdownEl = document.getElementById('voiceDropdown');
            if (!dropdownEl) {
                dropdownEl = document.createElement('div');
                dropdownEl.id = 'voiceDropdown';
                dropdownEl.className = 'voice-dropdown notranslate';
                dropdownEl.setAttribute('translate', 'no');

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.id = 'voiceDropdownBtn';
                btn.className = 'voice-dropdown-btn notranslate';
                btn.setAttribute('translate', 'no');
                btn.setAttribute('aria-haspopup', 'listbox');
                btn.setAttribute('aria-expanded', 'false');

                const btnLabel = document.createElement('span');
                btnLabel.className = 'voice-dropdown-btn-label';

                const btnArrow = document.createElement('span');
                btnArrow.className = 'voice-dropdown-btn-arrow';
                btnArrow.setAttribute('aria-hidden', 'true');
                btnArrow.textContent = '▾';

                btn.append(btnLabel, btnArrow);

                const menu = document.createElement('ul');
                menu.id = 'voiceDropdownMenu';
                menu.className = 'voice-dropdown-menu notranslate';
                menu.setAttribute('translate', 'no');
                menu.setAttribute('role', 'listbox');
                menu.hidden = true;

                dropdownEl.append(btn, menu);
                selectEl.insertAdjacentElement('afterend', dropdownEl);

                btn.addEventListener('click', event => {
                    event.stopPropagation();
                    if (btn.disabled) return;
                    const willOpen = menu.hidden;
                    menu.hidden = !willOpen;
                    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                });

                document.addEventListener('click', event => {
                    if (!dropdownEl.contains(event.target)) {
                        menu.hidden = true;
                        btn.setAttribute('aria-expanded', 'false');
                    }
                });

                document.addEventListener('keydown', event => {
                    if (event.key === 'Escape' && !menu.hidden) {
                        menu.hidden = true;
                        btn.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            const btn = document.getElementById('voiceDropdownBtn');
            const btnLabel = dropdownEl.querySelector('.voice-dropdown-btn-label');
            const menu = document.getElementById('voiceDropdownMenu');

            if (!selectEl.dataset.bound) {
                selectEl.dataset.bound = 'true';
                selectEl.addEventListener('change', () => {
                    try {
                        localStorage.setItem(
                            VOICE_STORAGE_KEY82,
                            selectEl.value
                        );
                    } catch (e) {}
                    setupPreferredVoice82();
                });
            }

            const signature = japanese.map(v => v.name).join('||');
            if (selectEl.dataset.voicesSignature !== signature) {
                selectEl.dataset.voicesSignature = signature;
                selectEl.replaceChildren();
                if (menu) menu.replaceChildren();

                if (!japanese.length) {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.textContent = 'No Japanese voice available';
                    selectEl.append(opt);
                    selectEl.disabled = true;
                    if (btn) btn.disabled = true;
                    if (btnLabel) btnLabel.textContent = 'No Japanese voice available';
                    if (menu) menu.hidden = true;
                } else {
                    selectEl.disabled = false;
                    if (btn) btn.disabled = false;
                    japanese.forEach(v => {
                        const opt = document.createElement('option');
                        opt.value = v.name;
                        opt.textContent = v.name;
                        opt.setAttribute('translate', 'no');
                        opt.className = 'notranslate';
                        selectEl.append(opt);

                        if (menu) {
                            const item = document.createElement('li');
                            item.className = 'voice-dropdown-item notranslate';
                            item.setAttribute('translate', 'no');
                            item.setAttribute('role', 'option');
                            item.dataset.voiceName = v.name;
                            item.textContent = v.name;
                            item.addEventListener('click', event => {
                                event.stopPropagation();
                                try {
                                    localStorage.setItem(VOICE_STORAGE_KEY82, v.name);
                                } catch (e) {}
                                menu.hidden = true;
                                if (btn) btn.setAttribute('aria-expanded', 'false');
                                setupPreferredVoice82();
                            });
                            menu.append(item);
                        }
                    });
                }
            }

            if (selected && selectEl.value !== selected.name) {
                selectEl.value = selected.name;
            }
            if (btnLabel && japanese.length) {
                btnLabel.textContent = selected ? selected.name : japanese[0].name;
            }
            if (menu) {
                Array.from(menu.children).forEach(item => {
                    const isSelected = Boolean(
                        selected && item.dataset.voiceName === selected.name
                    );
                    item.classList.toggle('is-selected', isSelected);
                    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                });
            }
        }
    } catch (e) {
        console.warn('Voice setup error:', e);
    }
}

if (window.speechSynthesis) {
    setupPreferredVoice82();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged =
            setupPreferredVoice82;
    }
}

function speak(text, b, done, relay = false) {
    if (!relay) stopPlayback();

    if (!window.speechSynthesis) {
        if (done) done();
        return;
    }

    setupPreferredVoice82();

    const u = new SpeechSynthesisUtterance(
        speechText(text)
    );

    u.lang = 'ja-JP';
    u.rate = 0.9;

    if (preferredVoice81) {
        u.voice = preferredVoice81;
    }

    markPlaying(b);
    utterance = u;

    const finish = () => {
        if (utterance !== u) return;
        if (relay) utterance = null;
        else stopPlayback();
        if (done) done();
    };

    u.onend = finish;
    u.onerror = finish;

    DrillAudio.speak(u);
}
function playRecording(key, b) {
    const value = saved.get(key);

    if (!value?.url || session || preparing) return;

    stopPlayback();

    playingAudio = new Audio(value.url);
    playingAudio.playbackRate = 1;

    markPlaying(b);

    playingAudio.onended = stopPlayback;
    playingAudio.onerror = stopPlayback;
    DrillAudio.play(playingAudio, stopPlayback);
}

function diffTokens(text) {
    const chars = Array.from(
        String(text).normalize('NFKC')
    );
    const tokens = [];

    const units = dictionary.map(x => x[0])
        .sort((a, b) => b.length - a.length);

    for (let i = 0; i < chars.length;) {
        const rest = chars.slice(i).join('');
        const unit = units.find(w => rest.startsWith(w))
            || chars[i];
        const end = i + Array.from(unit).length;

        // 語の途中の「よ・ね」は削除しない。
        for (const c of normalize(unit + '§').slice(0, -1)) {
            tokens.push({ c, start: i, end });
        }

        i = end;
    }

    while (
        tokens.length &&
        /[よね]/.test(tokens[tokens.length - 1].c)
    ) {
        tokens.pop();
    }

    return { chars, tokens };
}

function findDiff(actual, reference) {
    const a = diffTokens(actual);
    const b = diffTokens(reference);
    const n = a.tokens.length;
    const m = b.tokens.length;

    const costs = Array.from(
        { length: n + 1 },
        () => Array(m + 1).fill(0)
    );

    for (let i = 0; i <= n; i++) costs[i][0] = i;
    for (let j = 0; j <= m; j++) costs[0][j] = j;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            costs[i][j] = Math.min(
                costs[i - 1][j] + 1,
                costs[i][j - 1] + 1,
                costs[i - 1][j - 1] +
                    (a.tokens[i - 1].c === b.tokens[j - 1].c
                        ? 0 : 1)
            );
        }
    }

    const red = new Set();
    const gaps = new Set();

    const mark = token => {
        for (let k = token.start; k < token.end; k++) {
            red.add(k);
        }
    };

    let i = n;
    let j = m;

    while (i || j) {
        if (
            i && j &&
            costs[i][j] === costs[i - 1][j - 1] +
                (a.tokens[i - 1].c === b.tokens[j - 1].c
                    ? 0 : 1)
        ) {
            if (a.tokens[i - 1].c !== b.tokens[j - 1].c) {
                mark(a.tokens[i - 1]);
            }

            i--;
            j--;
        } else if (
            j &&
            costs[i][j] === costs[i][j - 1] + 1
        ) {
            gaps.add(
                i < n
                    ? a.tokens[i].start
                    : n
                        ? a.tokens[n - 1].end
                        : 0
            );
            j--;
        } else {
            mark(a.tokens[i - 1]);
            i--;
        }
    }

    return {
        chars: a.chars,
        red,
        gaps,
        cost: costs[n][m]
    };
}

function showResult(key,notice='') {
    const v=views.get(key);if(!v)return;
    const value=saved.get(key);
    v.result.classList.remove('not-recorded-yet');
    v.result.replaceChildren();v.correction.replaceChildren();v.correction.hidden=true;
    v.feedback.replaceChildren();v.feedback.hidden=true;
    if(session?.key===key){v.result.textContent='Recording...';return;}
    if(value?.raw) {
        const displayed=STTDisplay.format(value.raw,{mode:scriptMode,anchor:v.result,context:value.modelText||v.r.text,page:'8.2'});
        if(value.correct)v.result.append(document.createTextNode(displayed+' ✅ '));
        else {
            let best=value.refs.map(ref=>findDiff(displayed,ref)).sort((a,b)=>a.cost-b.cost)[0];
            best=STTDisplay.projectDiff(best,displayed);
            const red=text=>{const span=document.createElement('span');span.style.color='var(--error-text)';span.textContent=text;v.result.append(span);};
            for(let i=0;i<=best.chars.length;i++) {
                if(best.gaps.has(i))red('＿');if(i===best.chars.length)break;
                if(best.red.has(i))red(best.chars[i]);else v.result.append(document.createTextNode(best.chars[i]));
            }
            v.correction.textContent='🔥Keep going! Try once more!';v.correction.hidden=false;
        }
        if(value.feedback&&!v.r.comparison) {
            v.feedback.textContent=value.feedback.label;v.feedback.dataset.tone=value.feedback.tone;v.feedback.hidden=false;
        }
    }else {v.result.textContent='… Not yet';v.result.classList.add('not-recorded-yet');}
    if(value?.url) {
        const play=button('▶️',()=>playRecording(key,play),'Play your recorded voice');
        play.classList.add('play-recording-btn');v.result.append(play);
    }
    if(notice){const note=document.createElement('span');note.className='p81-notice';note.textContent=notice;v.result.append(note);}
}
function node(tag,className='',text=''){const e=document.createElement(tag);e.className=className;e.textContent=text;return e;}

function addExample(root,si){
 if(si!==0&&si!==1&&si!==2&&si!==3)return;
 const ex=node('div','example-box example-text-layout p81-example');
 const headerRow=node('div','p83-example-header-row');
 const spacer1=node('span','p83-header-spacer-col1');
 const spacer2=node('span','p83-header-spacer-col2');
 const headerCue=node('div','p83-example-header-cue');
 const prefixSpacer=node('span','p83-header-prefix',(si===2||si===3)?'どれ／':'だれ／');
 prefixSpacer.setAttribute('aria-hidden','true');
 const headerTitle=(si===1||si===3)?'Adjective':'Verb';
 const badge=node('span','p83-header-badge',headerTitle);
 headerCue.append(prefixSpacer,badge);
 headerRow.append(spacer1,spacer2,headerCue);
 ex.append(headerRow);
 const currentExSets=si===0?exSets1:(si===1?exSets2:(si===2?exSets3:exSets4));
 const catLabels=si===3?[{main:'どれ',sub:'(Which)'},{main:'どこ',sub:'(Where)'},{main:'いつ',sub:'(When)'}]:(si===2?[{main:'どれ',sub:'(Which)'},{main:'どこ',sub:'(Where)'}]:[{main:'だれ',sub:'(Who)'},{main:'何',sub:'(What)'}]);
 currentExSets.forEach((s,index)=>{
  if(index>0)ex.append(node('div','p83-example-divider'));
  const cat=node('div','p83-example-category');
  const catDef=catLabels[index]||{main:'',sub:''};
  const catMain=node('span','p83-cat-main',scriptMode==='kanji'?catDef.main:displayKana(catDef.main));
  const catSub=node('span','p83-cat-sub',catDef.sub);
  cat.append(catMain,catSub);
  ex.append(cat);
  const rows=[
   makeRow('ex'+(si+1)+'-'+index+'-q1',{text:s.q1,cueIds:s.c1},{kind:'Q'}),
   makeRow('ex'+(si+1)+'-'+index+'-q2',{text:s.q2,cueIds:s.c2},{kind:''}),
   makeRow('ex'+(si+1)+'-'+index+'-a',{text:s.a,cueIds:s.ca},{kind:'A'})
  ];
  rows.forEach(r=>{
   const row=node('div','p81-example-row'),kind=makeKindBadge(r.kind),cue=node('span','p81-example-cue');
   cue.innerHTML=cues(r);
   const arrow=node('span','p81-arrow',r.kind==='A'?'':'👉️'),listen=button('🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);}),text=node('span','p81-model');
   text.innerHTML=modelHTML(r);
   row.append(kind,cue,arrow,listen,text);
   ex.append(row);
  });
 });
 root.append(ex);
}
function openCuesDrawer(){
 const drawer=$('behindTheCuesDrawer');
 if(!drawer)return;
 drawer.hidden=false;
 requestAnimationFrame(()=>{
  drawer.classList.add('is-open');
  drawer.querySelector('.cues-drawer-close')?.focus();
 });
 const btn=$('behindTheCuesBtn');
 if(btn)btn.setAttribute('aria-expanded','true');
 document.addEventListener('keydown',handleDrawerKeydown);
}
function closeCuesDrawer(){
 const drawer=$('behindTheCuesDrawer');
 if(!drawer)return;
 drawer.classList.remove('is-open');
 const btn=$('behindTheCuesBtn');
 if(btn)btn.setAttribute('aria-expanded','false');
 document.removeEventListener('keydown',handleDrawerKeydown);
 setTimeout(()=>{
  if(!drawer.classList.contains('is-open')){
   drawer.hidden=true;
   btn?.focus();
  }
 },250);
}
function handleDrawerKeydown(e){
 if(e.key==='Escape'){
  e.preventDefault();
  closeCuesDrawer();
 }
}
function initDrawerEvents(){
 const drawer=$('behindTheCuesDrawer');
 if(!drawer||drawer.dataset.bound)return;
 drawer.dataset.bound='true';
 drawer.querySelectorAll('[data-action="close"]').forEach(el=>{
  el.addEventListener('click',closeCuesDrawer);
 });
}
function updateUnlearnedLexicon(){
 const kanjiGroup=$('unlearnedKanjiGroup');
 if(!kanjiGroup)return;
 const isKanji=scriptMode==='kanji';
 kanjiGroup.style.display=isKanji?'block':'none';
}
function setupUnlearnedAccordion(){
 const acc=$('unlearnedAccordion');
 if(!acc)return;
 if(sessionStorage.getItem('p83-unlearned-open')==='true')acc.open=true;
 acc.addEventListener('toggle',()=>{
  sessionStorage.setItem('p83-unlearned-open',String(acc.open));
 });
}
function render(){
 updateUnlearnedLexicon();
 const root=$('drill1Container');root.replaceChildren();views.clear();
 sections.forEach((section,si)=>{
  const group=node('section','p81-section');group.id='drill'+(si+1);addExample(group,si);
  const panel=node('div','info-panel info-panel-task1');
  panel.append(node('span','info-panel-title',scriptMode==='kanji'?section.title:displayKana(section.title)));
  panel.append(node('span','info-panel-desc',scriptMode==='kanji'?section.instruction:displayKana(section.instruction)));
  if(si===2){
   const actions=node('div','info-panel-actions');
   const noteBtn=button('🧩 Behind the Cues',openCuesDrawer);
   noteBtn.className='behind-the-cues-btn';
   noteBtn.id='behindTheCuesBtn';
   noteBtn.setAttribute('aria-haspopup','dialog');
   const drawer=$('behindTheCuesDrawer');
   const isOpen=Boolean(drawer&&drawer.classList.contains('is-open'));
   noteBtn.setAttribute('aria-expanded',String(isOpen));
   actions.append(noteBtn);
   panel.append(actions);
  }
  group.append(panel);
  const isD1=si===0,isD2=si===1,isD3=si===2;
  const sets=isD1?d1Sets:(isD2?d2Sets:(isD3?d3Sets:d4Sets));
  const currentSet=isD1?currentD1Set:(isD2?currentD2Set:(isD3?currentD3Set:currentD4Set));
  const switcher=node('div','p21-set-switcher');switcher.setAttribute('role','group');switcher.setAttribute('aria-label',`Drill ${si+1} Practice Set`);
  sets.forEach((setDef,setIdx)=>{
   const b=node('button','example-button',setDef.label);b.type='button';b.setAttribute('aria-pressed',String(setIdx===currentSet));
   b.onclick=()=>{if(session||preparing||setIdx===currentSet)return;stopPlayback();if(isD1)currentD1Set=setIdx;else if(isD2)currentD2Set=setIdx;else if(isD3)currentD3Set=setIdx;else currentD4Set=setIdx;render();};
   switcher.append(b);
  });
  group.append(switcher);
  rowsFor(si).forEach((rows,index)=>{
   const card=node('div','drill-row p81-card'),table=node('table','recording-table p81-table'),body=node('tbody');table.append(body);
   rows.forEach((r,ri)=>{
    const key=keyFor(r),tr=node('tr');tr.dataset.row=r.id;
    if(!ri){const n=node('td','drill-number-cell',(index+1)+'.');n.rowSpan=rows.length;tr.append(n);}
    const cue=node('td','prompt-label drill-cue-cell');
    cue.append(makeKindBadge(r.kind));
    const content=node('span','p81-cue-words');content.innerHTML=cues(r);cue.append(content);
    if(r.yn)for(const [value,label]of [['yes','🙆'],['no','🙅']]){const choose=button(label,()=>{if(session||preparing)return;stopPlayback();choices.set(r.id,value);render();});choose.classList.add('answer-choice');choose.dataset.answer=value;choose.dataset.response=r.id;choose.setAttribute('aria-label',value==='yes'?'Yes':'No');choose.setAttribute('aria-pressed',String(!r.pending&&r.answer===value));cue.append(choose);}
    const cell=node('td','p81-controls'),line=node('div','recording-controls'),actions=node('div','recording-actions'),listen=button('🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);}),rec=button('🎙️とる',()=>record(key,r)),stop=button('⏹️',()=>{if(session?.key===key)session.stop();});stop.disabled=true;actions.append(listen,rec,stop);const wrap=node('span','recording-result'),result=node('span','result-text');wrap.append(result);line.append(actions,wrap);const correction=node('div','correction-box'),feeling=node('div','p81-feedback');correction.hidden=true;feeling.hidden=true;cell.append(line,correction,feeling);tr.append(cue,cell);body.append(tr);views.set(key,{r,rec,listen,stop,result,correction,feedback:feeling});showResult(key);
   });card.append(table);group.append(card);
  });root.append(group);
 });ConversationDisplay.format();measureCues();sync();
}
function measureCues(){const intro=document.querySelector('#drill1 .example-box');if(intro){intro.style.removeProperty('--p82-concept-factor');const labels=[...intro.querySelectorAll('.p81-kind')],natural=Math.max(...labels.map(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().width;}));if(natural)intro.style.setProperty('--p82-concept-factor',parseFloat(getComputedStyle(labels[0]).fontSize)/natural);}document.querySelectorAll('.p81-section').forEach(group=>{let width=0;for(const cell of group.querySelectorAll('.p81-card .prompt-label')){const copy=cell.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'block',width:'max-content',maxWidth:'none',whiteSpace:'nowrap'});group.append(copy);width=Math.max(width,Math.ceil(copy.getBoundingClientRect().width));copy.remove();}for(const card of group.querySelectorAll('.p81-card'))card.style.setProperty('--p81-cue-width',(width+8)+'px');});}
function sync() {
    const busy=Boolean(session||preparing);
    document.querySelectorAll('#drill1Container button,#drill1Container select,.compact-settings button,.compact-settings input').forEach(e=>e.disabled=busy);
    views.forEach(v=>{if(v.r.pending){for(const b of [v.listen,v.rec]){b.disabled=true;b.dataset.selectionHelp=v.r.qa==='response'?'Choose 🙆 or 🙅 first.':v.r.comparison?'Choose an adjective that matches the label.':'Choose an expression first.';}}
        const canStop=session?.key===keyFor(v.r)&&session.manual&&!session.stopping;v.stop.disabled=!canStop;v.stop.classList.toggle('stop-btn-active',Boolean(canStop));});
}
async function record(key, r) {
    if (session || preparing || r.pending) return;

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition || !window.MediaRecorder) {
        showResult(
            key,
            "Speech recognition or recording is not supported."
        );
        return;
    }

    stopPlayback();
    preparing = true;
    sync();

    views.get(key).result.textContent =
        "Preparing microphone...";

    let stream;

    try {
        stream = await DrillAudio.getUserMedia({
            audio: true
        });
    } catch (e) {
            if (e.name === "AbortError") return;
        preparing = false;
        showResult(key, DrillAudio.microphoneError(e));
        sync();
        return;
    }

    preparing = false;

    const s = {
        key,
        manual,
        stopping: false,
        finished: false,
        heard: false,
        raw: "",
        interim: "",
        chunks: [],
        timers: [],
        recognitionDone: false,
        recorderDone: false,
        discard: false,
        notice: "",
        context: null
    };

    session = s;

    const clear = () => {
        s.timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });

        s.timers = [];

        if (s.context) {
            s.context.close().catch(() => {});
            s.context = null;
        }
    };

    const finish = () => {
        if (
            s.finished ||
            !s.recognitionDone ||
            !s.recorderDone
        ) {
            return;
        }

        s.finished = true;
        clear();

        stream.getTracks().forEach(t => t.stop());

        if (s.recognition) {
            s.recognition.onend = null;
            s.recognition.onresult = null;
            s.recognition.onerror = null;

            try {
                s.recognition.abort();
            } catch (e) {}
        }

        session = null;

        if (s.interim?.trim()) {
            s.raw += s.interim;
        }

        const previous = saved.get(key) || {};

        if (
            !s.discard &&
            s.heard &&
            s.chunks.length
        ) {
            const url = URL.createObjectURL(
                new Blob(s.chunks, {
                    type: s.recorder.mimeType || "audio/webm"
                })
            );

            if (previous.url) {
                URL.revokeObjectURL(previous.url);
            }

            saved.set(key, {
                url,
                raw: s.raw,
                modelText:r.text, modelHira:r.hira, refs:[...r.refs],
                feedback:r.comparison&&matchesAnswer(s.raw,r)?feedback(r,s.raw):null,
                correct:
                    Boolean(s.raw.trim()) &&
                    matchesAnswer(s.raw, r)
            });
        }

        s.chunks = [];

        showResult(
            key,
            s.notice ||
            (!s.raw.trim() ? "No speech recognized." : "")
        );

        sync();

        if (
            autoplay &&
            !s.discard &&
            s.raw.trim()
        ) {
            const view = views.get(key);
            DrillAudio.playRelay({
                recordButton: view.rec,
                result: view.result,
                speak: done => speak(r.text, null, done, true),
                url: () => saved.get(key)?.url
            });
        }
    };

    s.stop = (notice = "", discard = false) => {
        if (s.stopping || s.finished) return;

        s.stopping = true;
        s.notice = notice;
        s.discard = discard || !s.heard;

        clear();
        sync();

        try {
            s.recognition.stop();
        } catch (e) {
            s.recognitionDone = true;
        }

        if (
            !s.recorder ||
            s.recorder.state === "inactive"
        ) {
            s.recorderDone = true;
        } else {
            try {
                s.recorder.stop();
            } catch (e) {
                s.recorderDone = true;
                s.discard = true;
            }
        }

        s.timers.push(
            setTimeout(() => {
                s.recognitionDone = true;

                if (!s.recorderDone) {
                    s.recorderDone = true;
                    s.discard = true;
                }

                finish();
            }, 2500)
        );

        finish();
    };

    try {
        const recognition = new Recognition();
        s.recognition = recognition;

        recognition.lang = "ja-JP";
        recognition.continuous = true;
        recognition.interimResults = true;

        let interim = "";
        let lastSound = Date.now();

        const heard = () => {
            s.heard = true;
            lastSound = Date.now();
        };

        recognition.onspeechstart = heard;

        recognition.onresult = e => {
            if (s.finished || s.discard) return;

            interim = "";

            for (
                let i = e.resultIndex;
                i < e.results.length;
                i++
            ) {
                const text = e.results[i][0].transcript;

                if (text.trim()) heard();

                if (e.results[i].isFinal) {
                    s.raw += text;
                } else {
                    interim += text;
                }
            }

            s.interim = interim;
        };

        recognition.onerror = e => {
            if (
                s.stopping ||
                e.error === "no-speech"
            ) {
                return;
            }

            s.recognitionDone = true;
            s.stop("Recognition error.", true);
        };

        recognition.onend = () => {
            s.recognitionDone = true;

            if (s.stopping) {
                finish();
                return;
            }

            try {
                recognition.start();
                s.recognitionDone = false;
            } catch (e) {
                s.stop(
                    "Could not restart recognition.",
                    true
                );
            }
        };

        const recorder = new MediaRecorder(stream);
        s.recorder = recorder;

        recorder.ondataavailable = e => {
            if (!s.finished && e.data.size) {
                s.chunks.push(e.data);
            }
        };

        recorder.onstop = () => {
            s.recorderDone = true;

            if (!s.stopping) {
                s.stop("Recording stopped.");
            }

            finish();
        };

        recorder.onerror = () => {
            s.stop("Recording error.", true);
        };

        showResult(key);
        sync();

        recorder.start();
        recognition.start();

        try {
            const Context =
                window.AudioContext ||
                window.webkitAudioContext;

            const context = new Context();
            s.context = context;

            context.resume().catch(() => {});

            const analyser = context.createAnalyser();
            analyser.fftSize = 1024;

            context
                .createMediaStreamSource(stream)
                .connect(analyser);

            const samples = new Float32Array(
                analyser.fftSize
            );

            let frames = 0;

            s.timers.push(
                setInterval(() => {
                    if (s.stopping) return;

                    analyser.getFloatTimeDomainData(samples);

                    let sum = 0;

                    for (const n of samples) {
                        sum += n * n;
                    }

                    const sound =
                        Math.sqrt(sum / samples.length) > 0.015;

                    frames = sound ? frames + 1 : 0;

                    if (sound && s.heard) {
                        lastSound = Date.now();
                    }

                    if (frames >= 3) heard();
                }, 100)
            );
        } catch (e) {}

        // Autostop：発話後の無音2秒
        s.timers.push(
            setInterval(() => {
                if (
                    !s.manual &&
                    s.heard &&
                    Date.now() - lastSound >= 2000
                ) {
                    s.stop();
                }
            }, 100)
        );

        // 発話開始前の無音15秒：新しい録音を保存しない
        s.timers.push(
            setTimeout(() => {
                if (!s.heard) {
                    s.stop(
                        "No speech detected within 15 seconds.",
                        true
                    );
                }
            }, 15000)
        );

        // Autostop・手動停止の共通上限
        s.timers.push(
            setTimeout(() => {
                s.stop("Auto-stopped after 20 seconds.");
            }, 20000)
        );
    } catch (e) {
        s.recognitionDone = true;
        s.stop("Could not start recording.", true);
    }
}

// Settings and footer
function init() {
    const anchor = $('scriptModeControl')
        ?.closest('.control-item');

    if (anchor) {
        const item = document.createElement('div');
        item.className = 'control-item';

        const control = document.createElement('div');
        control.id = 'speechStyleControl';
        control.className = 'segmented-control';
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', 'Speech style');

        [
            [
                'formal',
                '👔Formal',
                'Polite speech for work or unfamiliar people.'
            ],
            [
                'informal',
                '✏️Informal',
                'Plain forms used in writing'
            ],
            [
                'casual',
                '💬Casual',
                'Relaxed speech with family and friends.'
            ]
        ].forEach(([value, label, tip]) => {
            const b = button(label, () => {}, tip);
            b.classList.add('segmented-option');
            b.dataset.value = value;
            control.append(b);
        });

        item.append(control);
        anchor.after(item);
    }

    [
        [
            'scriptModeControl',
            () => scriptMode,
            v => scriptMode = v
        ],
        [
            'speechStyleControl',
            () => speechStyle,
            v => speechStyle = v
        ],
        [
            'hintModeControl',
            () => hintMode,
            v => hintMode = v
        ]
    ].forEach(([id, get, set]) => {
        const control = $(id);
        if (!control) return;

        const update = () => {
            control.querySelectorAll('button[data-value]')
                .forEach(b => {
                    const selected = b.dataset.value === get();

                    b.classList.toggle('is-selected', selected);
                    b.setAttribute(
                        'aria-pressed',
                        String(selected)
                    );
                });
        };

        update();

        control.addEventListener('click', e => {
            const b = e.target.closest('button[data-value]');

            if (
                session ||
                preparing ||
                !b ||
                !control.contains(b) ||
                b.dataset.value === get()
            ) return;

            stopPlayback();
            set(b.dataset.value);
            update();
            render();
        });
    });

    [
        [
            'toggleRecordMode',
            'labelAutoRecord',
            on => manual = !on
        ],
        [
            'togglePlaybackMode',
            'labelAutoPlay',
            on => autoplay = on
        ]
    ].forEach(([id, label, change]) => {
        const input = $(id);
        if (!input) return;

        input.checked = true;

        input.addEventListener('change', () => {
            change(input.checked);

            $(label)?.classList.toggle(
                'active-mode',
                input.checked
            );
            $(label)?.classList.toggle(
                'inactive-mode',
                !input.checked
            );
        });
    });

    setupPreferredVoice82();
    initDrawerEvents();
    setupUnlearnedAccordion();

    rowsFor(0, currentD1Set);
    render();
}


if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
DrillAudio.configure({busy:()=>Boolean(session||preparing),sync,stop:stopPlayback,cancel:()=>{preparing=false;if(session){session.discard=true;session.stop('',true);}}});
window.addEventListener('resize',()=>{if(!session&&!preparing)measureCues();});
document.fonts.ready.then(measureCues);
})();
