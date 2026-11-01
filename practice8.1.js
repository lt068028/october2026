// Practice 8.1: page-local models and recording; shared lifecycle via DrillAudio.
(() => {
'use strict';
const $ = id => document.getElementById(id);
const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let scriptMode='kanji',hintMode='hover',speechStyle='formal';
let manual=false,autoplay=true,session=null,preparing=false;
let playingAudio=null,utterance=null,playButton=null;
const views=new Map(),saved=new Map(),choices=new Map(),comparisonOptionOrder=new Map();
const words={};
function W(id,kanji,hira,romaji,meaning) {
    words[id]={kanji,hira,romaji,meaning};
    STTDisplay.register(kanji,hira,meaning);
}
W("you","あなた","あなた","anata","you");
W("i","私","わたし","watashi","I");
W("book","本","ほん","hon","book");
W("movie","映画","えいが","eiga","movie");
W("television","テレビ","てれび","terebi","television");
W("watch","見る","みる","miru","to watch");
W("cycling","自転車","じてんしゃ","jitensha","bicycle");
W("ride","乗る","のる","noru","to ride");
W("coffee","コーヒー","コーヒー","kōhī","coffee");
W("drink","飲む","のむ","nomu","to drink");
W("clothes","服","ふく","fuku","clothes");
W("buy","買う","かう","kau","to buy");
W("guitar","ギター","ギター","gitā","guitar");
W("play","弾く","ひく","hiku","to play an instrument");
W("teach","教える","おしえる","oshieru","to teach");
W("dance","おどる","おどる","odoru","to dance");
W("letter","手紙","てがみ","tegami","letter");
W("grammar","文法","ぶんぽう","bunpō","grammar");
W("question","質問","しつもん","shitsumon","question");
W("answer","答える","こたえる","kotaeru","to answer");
W("motorcycle","バイク","バイク","baiku","motorcycle");
W("father","父","ちち","chichi","my father");
W("olderSister","姉","あね","ane","my older sister");
W("youngerBrother","弟","おとうと","otōto","younger brother");
W("youngerSister","妹","いもうと","imōto","younger sister");
W("grandmother","祖母","そぼ","sobo","my grandmother");
W("olderBrother","兄","あに","ani","my older brother");
W("computer","パソコン","ぱそこん","pasokon","computer");
W("use","使う","つかう","tsukau","to use");
W("dish","お皿","おさら","osara","plate; dish");
W("thing","もの","もの","mono","thing");
W("smartphone","スマホ","スマホ","sumaho","smartphone");
W("hair","髪","かみ","kami","hair");
W("bag","カバン","かばん","kaban","bag");
W("luggage","荷物","にもつ","nimotsu","luggage");
W("carry","持つ","もつ","motsu","to hold; to carry");
W("homework","宿題","しゅくだい","shukudai","homework");
W("music","音楽","おんがく","ongaku","music");
W("photo","写真","しゃしん","shashin","photograph");
W("read","読む","よむ","yomu","to read");
W("listen","聞く","きく","kiku","to listen");
W("take","撮る","とる","toru","to take photographs");
W("room","部屋","へや","heya","room");
W("clean","掃除する","そうじする","sōji suru","to clean");
W("cleaning","掃除","そうじ","sōji","cleaning");
W("laundry","洗濯","せんたく","sentaku","laundry");
W("do","する","する","suru","to do");
W("friend","友達","ともだち","tomodachi","friend");
W("classmate","クラスメート","クラスメート","kurasumēto","classmate");
W("senior","先輩","せんぱい","senpai","senior student or colleague");
W("mountain","山","やま","yama","mountain");
W("climb","登る","のぼる","noboru","to climb");
W("teacher","先生","せんせい","sensei","teacher");
W("student","留学生","りゅうがくせい","ryūgakusei","international student");
W("child","子ども","こども","kodomo","child");
W("person","この人","このひと","kono hito","this person");
W("siblings","兄弟","きょうだい","kyōdai","siblings");
W("write","書く","かく","kaku","to write");
W("kanji","漢字","かんじ","kanji","kanji");
W("katakana","カタカナ","カタカナ","katakana","katakana");
W("cook","料理","りょうり","ryōri","cooking");
W("sing","歌う","うたう","utau","to sing");
W("song","歌","うた","uta","song");
W("karaoke","カラオケ","カラオケ","karaoke","karaoke");
W("shower","シャワー","シャワー","shawā","shower");
W("bathe","浴びる","あびる","abiru","to take a shower");
W("sea","海","うみ","umi","sea");
W("swim","泳ぐ","およぐ","oyogu","to swim");
W("car","車","くるま","kuruma","car");
W("drive","運転する","うんてんする","unten suru","to drive");
W("remember","覚える","おぼえる","oboeru","to memorize");
W('speak','話す','はなす','hanasu','to speak');
W("english","英語","えいご","eigo","English");
W("make","作る","つくる","tsukuru","to make");
W("wash","洗う","あらう","arau","to wash");
W("cut","切る","きる","kiru","to cut");
W("tomato","トマト","トマト","tomato","tomato");
W("breakfast","朝ご飯","あさごはん","asagohan","breakfast");
W("eat","食べる","たべる","taberu","to eat");
W("oldmag","古い雑誌","ふるいざっし","furui zasshi","old magazine");
W("discard","捨てる","すてる","suteru","to throw away");
W("study","勉強","べんきょう","benkyō","studying");
W("begin","始める","はじめる","hajimeru","to begin");
W("like","好き","すき","suki","like");
W("dislike","きらい","きらい","kirai","dislike");
W("good","上手","じょうず","jōzu","skillful");
W("bad","下手","へた","heta","unskillful");
W("strong","得意","とくい","tokui","a personal strength");
W("difficult","苦手","にがて","nigate","difficult or uncomfortable for someone");
W("totemo","とても","とても","totemo","very");
W("sugoku","すごく","すごく","sugoku","very; really");
W("maamaa","まぁまぁ","まぁまぁ","māmā","fairly; reasonably");
W("chotto","ちょっと","ちょっと","chotto","a little");
W("amari","あまり","あまり","amari","not very (with a negative ending)");
W("zenzen","ぜんぜん","ぜんぜん","zenzen","not at all (with a negative ending)");
W('japaneseTeacher','日本語の先生','にほんごのせんせい','nihongo no sensei','Japanese teacher');
W('japanese','日本語','にほんご','nihongo','Japanese');
const adjectives=['good','bad','strong','difficult'];
const adverbs=['zenzen','amari','chotto','maamaa','totemo','sugoku'];
W('studentFriend','留学生の友達','りゅうがくせいのともだち','ryūgakusei no tomodachi','an international-student friend');
W('mother','母','はは','haha','my mother');
W('flower','花','はな','hana','flower');
W('grow','育てる','そだてる','sodateru','to grow');
W('early','早く','はやく','hayaku','early');
W('wake','起きる','おきる','okiru','to get up');
const dictionary=[...Object.values(words).map(w=>[w.kanji,w.hira]),['まあまあ','まぁまぁ'],['子供','こども'],['嫌い','きらい'],['友だち','ともだち'],['私','わたし'],['料理する','りょうりする'],['掃除する','そうじする'],['洗濯する','せんたくする'],['踊る','おどる']].sort((a,b)=>b[0].length-a[0].length);
dictionary.forEach(([k,h])=>STTDisplay.register(k,h));
function hira(text) {
    let value=String(text).normalize('NFKC');
    for(const [from,to] of dictionary)value=value.split(from).join(to);
    return value.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
}
function normalize(text) {
    return hira(text).replace(/(?:ではありません|じゃありません|ではないです)/g,'じゃないです').replace(/[\p{P}\p{Z}\s]/gu,'').replace(/^(?:ううんん|うんん)/,'ううん').replace(/^いえ/,'いいえ').replace(/(?:よね|よ|ね)$/,'');
}
const action=(object,verb,particle=verb==='do'?'':'を')=>({object,verb,particle});
const compareActions=[action('book','read'),action('music','listen'),action('cycling','ride','に')];
const selfActions=[action('coffee','drink'),action('laundry','do'),action('breakfast','eat'),action('clothes','buy')];
const people=[
    {subject:'classmate',verb:'dance',particle:'',adjective:'good'},
    {subject:'grandmother',...action('sea','swim','で'),adjective:'good'},
    {subject:'child',...action('katakana','remember'),adjective:'difficult'},
    {subject:'siblings',...action('motorcycle','drive'),adjective:'difficult'}
];
const degreeActions=[
    {actionId:'washDish',...action('dish','wash')},
    {actionId:'discardThing',...action('thing','discard')},
    {actionId:'useSmartphone',...action('smartphone','use')},
    {actionId:'cutHair',...action('hair','cut')},
    {actionId:'carryBag',...action('bag','carry')},
    {actionId:'beginStudy',...action('study','begin')}
];
const degreeLevels=[
    {adjective:'like',degree:'like',tone:'positive'},
    {adjective:'dislike',adverb:'zenzen',degree:'zenzen',tone:'negative'},
    {adjective:'dislike',adverb:'amari',degree:'amari',tone:'negative'},
    {adjective:'dislike',adverb:'chotto',degree:'chotto',tone:'positive'},
    {adjective:'dislike',adverb:'maamaa',degree:'maamaa',tone:'positive'},
    {adjective:'dislike',adverb:'sugoku',degree:'sugoku',tone:'positive'}
];
const exampleDegreeLevels=['zenzen','amari','chotto','maamaa','totemo','sugoku'].map(adverb=>({adjective:'like',adverb,degree:adverb,tone:['zenzen','amari'].includes(adverb)?'negative':'positive'}));
// Meaning first, then context-dependent interpersonal impressions.
const comparisons=[
 {phase:'Meaning',subject:'father',...action('cook','do'),options:['good','strong'],labels:['Skillful','Observed'],scenario:'Talking about your father’s cooking after eating it.',impressions:{
  good:'The speaker judges that the subject has high skill.',
  strong:'The speaker infers that the subject sees the activity as their own strength.'
 }},
 {phase:'Meaning',subject:'i',...action('english','speak'),options:['bad','difficult'],labels:['Poor','Uncomfortable'],scenario:'Talking about speaking English.',impressions:{
  bad:'The speaker judges that the subject’s skill is low.',
  difficult:'The speaker feels uncomfortable or not fond of the activity, regardless of actual skill.'
 }},
 {phase:'Meaning',subject:'i',...action('early','wake',''),options:['bad','difficult'],labels:['Unnatural','Natural'],scenario:'Talking about waking up early.',impressions:{
  bad:'Sounds unnatural because 下手 judges learned skills, not daily habits.',
  difficult:'Sounds natural because 苦手 expresses that waking up early is hard for the speaker.'
 }},
 {phase:'Impression',subject:'i',...action('cleaning','do'),options:['good','strong'],labels:['Boastful','Natural'],scenario:'Introducing yourself to someone you have just met.',impressions:{
  good:'Praising the speaker’s own skill directly can sound boastful.',
  strong:'Describing the activity as something the speaker feels confident in sounds natural.'
 }},
 {phase:'Impression',subject:'studentFriend',...action('kanji','write'),options:['good','strong'],labels:['Praise','Observed'],scenario:'Talking about an international-student friend after watching them write kanji.',impressions:{
  good:'The speaker directly praises a skill they have observed.',
  strong:'The speaker infers that the subject feels confident in the activity.'
 }},
 {phase:'Impression',subject:'olderBrother',...action('karaoke','sing','で'),options:['bad','difficult'],labels:['Blunt','Tactful'],scenario:'Talking about your older brother after hearing him sing karaoke.',impressions:{
  bad:'Directly judging the subject’s lack of skill can sound blunt or hurtful.',
  difficult:'Describing the activity as difficult for the subject sounds gentler.'
 }},
 {phase:'Impression',subject:'japaneseTeacher',verb:'teach',particle:'',options:['good','strong'],labels:['Presumptuous','Overstepping'],scenario:'A beginning student talking about their Japanese teacher.',impressions:{
  good:'Evaluating a superior’s skill from below sounds presumptuous.',
  strong:'Assuming what a superior considers their personal strength also sounds overstepping.'
 }}
];
comparisons.forEach(spec=>{
 spec.impressionWords=Object.fromEntries(spec.options.map((id,i)=>[id,spec.labels[i]]));
});
const sections=[
    {title:'Drill 1: Nounが好き／Verbのが好き',instruction:'💡Say if you like the thing or activity.'},
    {title:'Drill 2: Verbのが好き／きらい',instruction:'💡Ask, choose Yes/No, then answer.'},
    {title:'Drill 3: Verbのが上手／苦手',instruction:'💡Choose 上手 or 苦手, then record.'},
    {title:'Drill 4: Degrees of liking',instruction:'💡Select a different action for each line, then record.'},
    {title:'Drill 5: How Do These Expressions Differ?',instruction:'💡Choose the best adjective for each label, then record.'}
];
function selected(id,initial){return choices.get(id)||initial;}
function sentenceFor(spec,style=speechStyle,kanji=true,adjective=spec.adjective) {
    const get=id=>words[id][kanji?'kanji':'hira'];
    let prefix=spec.subject?get(spec.subject)+'は、':'';
    prefix+=(spec.object?get(spec.object):'')+(spec.noun?'が':(spec.object?spec.particle:'')+get(spec.verb)+'のが');
    const negative=['amari','zenzen'].includes(spec.adverb)||spec.answer==='no';
    const ending=style==='formal'?(negative?'じゃないです。':'です。'):(negative?'じゃない。':style==='casual'?'だよ。':'だ。');
    if(spec.qa==='question')return prefix+get(adjective)+(style==='formal'?'ですか。':'？');
    const body=(spec.short?'':prefix)+(spec.adverb?get(spec.adverb):'')+get(adjective)+ending;
    if(spec.qa==='response')return (spec.answer==='no'?(style==='casual'?'ううん、':'いいえ、'):(style==='casual'?'うん、':'はい、'))+body;
    return body;
}
function makeRow(id,spec,extra={}) {
    const r={...spec,...extra,id};
    r.text=sentenceFor(r,speechStyle,true);r.hira=sentenceFor(r,speechStyle,false);
    r.refs=[];
    const possible=[r.adjective];
    const subjectVariants=(!r.subject||r.subject==='i')?[null,r.qa==='question'?'you':'i']:[r.subject];
    for(const a of possible)for(const subj of subjectVariants) {
        const variant={...r,subject:subj};
        for(const kanji of [true,false]) {
            const full=sentenceFor(variant,speechStyle,kanji,a);
            r.refs.push(full);
            // する nouns permit both forms (without を as model, with を as accepted); keep のが mandatory in action rows.
            if(r.verb==='do'){
                const obj=kanji?words[r.object].kanji:words[r.object].hira;
                r.refs.push(full.includes(obj+'をする')?full.replace(obj+'をする',obj+'する'):full.replace(obj+'する',obj+'をする'));
            }
        }
    }
    if(r.qa==='response') {
        for(const kanji of [true,false])for(const subject of [null,'i']) {
            const full=sentenceFor({...r,short:false,subject},speechStyle,kanji);
            r.refs.push(full,full.replace(/^(?:はい|いいえ|うん|ううん)、/,''));
            if(r.verb==='do'){
                const obj=kanji?words[r.object].kanji:words[r.object].hira;
                const alt=full.includes(obj+'をする')?full.replace(obj+'をする',obj+'する'):full.replace(obj+'する',obj+'をする');
                r.refs.push(alt,alt.replace(/^(?:はい|いいえ|うん|ううん)、/,''));
            }
        }
        r.refs.push(r.text.replace(/^(?:はい|いいえ|うん|ううん)、/,''),r.hira.replace(/^(?:はい|いいえ|うん|ううん)、/,''));
    }
    STTDisplay.register(r.text,r.hira);
    return r;
}
function rowsFor(si) {
    if(si===0)return compareActions.map((a,i)=>[
        makeRow(`compare-${i}-noun`,{...a,noun:true,adjective:'like'}),
        makeRow(`compare-${i}-action`,{...a,adjective:'like'})]);
    if(si===1)return selfActions.map((a,i)=>{
        const adjective=i%2?'dislike':'like',id=`self-${i}`,answer=choices.get(id+'-response');
        return [makeRow(id+'-question',{...a,adjective,qa:'question'},{kind:'Q'}),makeRow(id+'-response',{...a,adjective,qa:'response',short:true,answer:answer||'yes'},{kind:'A',pending:!answer})];
    });
    if(si===2)return people.map((s,i)=>{const id=`people-${i}`;return [makeRow(id,{...s,adjective:selected(id,s.adjective)},{selectKind:'ability'})];});
    if(si===3)return degreeLevels.map((level,i)=>{
        const id=`degree-${i}`,activity=choices.get(id),selectedAction=degreeActions.find(a=>a.actionId===activity)||degreeActions[0];
        const row=makeRow(id,{...selectedAction,...level},{selectKind:'activity',activity,pending:!activity,degreeLevel:level});
        return [row];
    });
    return comparisons.map((spec,i)=>spec.options.map(adjective=>{const id=`comparison-${i}-${adjective}`,choice=choices.get(id);return makeRow(id,{...spec,adjective},{comparison:true,comparisonBase:`comparison-${i}`,kind:spec.impressionWords[adjective],selectKind:'comparison',pending:choice!==adjective,quizChoice:choice});}));
}
function matchesAnswer(raw,r) {
    if(r.pending||!DrillAnswer.formAllowed(raw,speechStyle))return false;
    const n=normalize(raw);
    return Boolean(n)&&r.refs.some(ref=>normalize(ref)===n);
}
function recordedAdjective(raw) {
    const n=normalize(raw);
    return adjectives.find(key=>n.endsWith(words[key].hira+'です')||n.endsWith(words[key].hira+'だ')||n.endsWith(words[key].hira));
}
function feedback(r,raw) {
    const adjective=recordedAdjective(raw);
    return adjective?r.impressions?.[adjective]||null:null;
}
function keyFor(r){if(r.comparison)return r.id+':'+(r.quizChoice||'unselected');return r.id+':' +(r.qa==='response'?(r.pending?'unselected':r.answer):r.selectKind==='activity'?(choices.get(r.id)||'unselected'):r.selectKind==='adverb'?r.adverb:r.selectKind?(r.pending?'unselected':r.adjective):'fixed');}

function word(id) {
    const w=words[id],text=escape(w[scriptMode==='kanji'?'kanji':'hira']);
    const tip=escape(w.romaji+', '+w.meaning);
    const display=adverbs.includes(id)?`<strong class="degree-adverb degree-${['amari','zenzen'].includes(id)?'negative':'positive'}">${text}</strong>`:text;
    if(hintMode==='off')return `<span class="target-word">${display}</span>`;
    if(hintMode==='paren')return `<span class="target-word">${display}</span><span class="vocab-inline">(${tip})</span>`;
    return `<span class="tooltip-wrap"><span class="target-word">${display}</span><span class="tooltip-tip">${tip}</span></span>`;
}
function actionText(a,mode=scriptMode) {
    const get=id=>words[id][mode==='kanji'?'kanji':'hira'];
    return get(a.object)+(a.particle||'を')+get(a.verb);
}
function degreePhraseHTML(level) {
    return level.adverb?word(level.adverb):word(level.adjective);
}
function cues(r,visibleIds) {
    if(r.qa==='response')return '';
    const ids=visibleIds||[r.subject,r.object,...(r.noun?[]:[r.verb]),...(r.adverb&&!r.selectKind?[r.adverb]:[]),...(r.selectKind==='ability'||r.selectKind==='adverb'||r.selectKind==='comparison'?[]:[r.adjective])].filter(Boolean);
    const wrap=html=>hintMode==='paren'?`<span class="display-cue-unit">${html}</span>`:html;
    return ids.map(id=>wrap(word(id))).join(hintMode==='paren'?'':'／');
}

function modelHTML(r,repeatPrefix=false) {
    const fullText=scriptMode==='kanji'?r.text:r.hira;
    const nogaIndex=repeatPrefix?fullText.indexOf('のが'):-1;
    const text=nogaIndex>=0?fullText.slice(nogaIndex):fullText;
    const omittedText=nogaIndex>=0?fullText.slice(0,nogaIndex):'';
    const tokens=[...Object.values(words)].map(w=>w[scriptMode==='kanji'?'kanji':'hira']).sort((a,b)=>b.length-a.length);
    let out=repeatPrefix?`<span class="p81-model-repeat-spacer"></span><span class="p81-ditto" role="img" aria-label="${escape(omittedText)}">〃</span><span class="p81-model-repeat-after-spacer"></span>`:'',i=0;
    while(i<text.length) {
        const responseMark=r.qa==='response'?(i===0?text.match(/^(はい|いいえ|うん|ううん)/)?.[0]:text.slice(i).match(/^(じゃないです|じゃない|です|だよ|だ)/)?.[0]):null;
        const gold=responseMark||(r.qa==='question'&&text.startsWith('ですか',i)?'ですか':text.startsWith('のが',i)?'のが':r.noun&&text[i]==='が'?'が':r.highlightTopic&&r.subject&&i===words[r.subject][scriptMode==='kanji'?'kanji':'hira'].length&&text[i]==='は'?'は':null);
        if(gold){out+=`<strong class="p81-gold grammar-highlight">${gold}</strong>`;i+=gold.length;continue;}
        if(r.degreeLevel&&['zenzen','amari'].includes(r.adverb)&&text.startsWith('ない',i)){out+='<span class="degree-negative">ない</span>';i+=2;continue;}
        const token=tokens.find(t=>text.startsWith(t,i));
        const id=token&&Object.keys(words).find(k=>words[k][scriptMode==='kanji'?'kanji':'hira']===token);
        if(id){out+=word(id);i+=token.length;}else{out+=escape(text[i]);i++;}
    }
    return out;
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

const VOICE_STORAGE_KEY81 = 'october2026.selectedVoiceName';
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

function setupPreferredVoice81() {
    try {
        const synth = window.speechSynthesis;
        const voices = synth ? synth.getVoices() : [];

        const japanese = (voices || [])
            .filter(v => v && v.lang && /^ja(?:$|[-_])/i.test(v.lang))
            .sort((a, b) => voicePriorityRank81(a) - voicePriorityRank81(b));

        let savedName = null;
        try {
            savedName = localStorage.getItem(VOICE_STORAGE_KEY81);
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
                            VOICE_STORAGE_KEY81,
                            selectEl.value
                        );
                    } catch (e) {}
                    setupPreferredVoice81();
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
                                    localStorage.setItem(VOICE_STORAGE_KEY81, v.name);
                                } catch (e) {}
                                menu.hidden = true;
                                if (btn) btn.setAttribute('aria-expanded', 'false');
                                setupPreferredVoice81();
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
    setupPreferredVoice81();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged =
            setupPreferredVoice81;
    }
}

function speak(text, b, done, relay = false) {
    if (!relay) stopPlayback();

    if (!window.speechSynthesis) {
        if (done) done();
        return;
    }

    setupPreferredVoice81();

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
    if(v.notYet)v.notYet.hidden=Boolean(value?.raw||value?.url||session?.key===key);
    if(v.nuance){const pairHasRecording=[...views.entries()].some(([pairKey,pairView])=>pairView.r.comparisonBase===v.r.comparisonBase&&Boolean(saved.get(pairKey)?.url));views.forEach(pairView=>{if(pairView.r.comparisonBase===v.r.comparisonBase&&pairView.nuance)pairView.nuance.hidden=!pairHasRecording;});}
    v.result.replaceChildren();v.correction.replaceChildren();v.correction.hidden=true;
    v.feedback.replaceChildren();v.feedback.hidden=true;
    if(session?.key===key){if(v.notYet)v.notYet.hidden=true;v.result.textContent='Recording...';return;}
    if(value?.raw) {
        let displayed=STTDisplay.format(value.raw,{mode:scriptMode,anchor:v.result,context:value.modelText||v.r.text,page:'8.1'});
        if(v.r.verb==='dance')displayed=displayed.replace(/踊る/g,'おどる');
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
    }else if(!v.r.comparison){v.result.append(node('span','not-recorded-yet','… Not yet'));}
    if(value?.url) {
        const play=button('▶️',()=>playRecording(key,play),'Play your recorded voice');
        play.classList.add('play-recording-btn');v.result.append(play);
    }
    if(notice){const note=document.createElement('span');note.className='p81-notice';note.textContent=notice;v.result.append(note);}
}
function node(tag,className='',text=''){const e=document.createElement(tag);e.className=className;e.textContent=text;return e;}
function addSelect(cue,r,key) {
    if(!r.selectKind)return;
    const select=node('select','custom-select p81-select'+(r.selectKind==='activity'?' p81-activity-select':''));
    const isActivity=r.selectKind==='activity',activity=choices.get(r.id)||'';
    const usedActivities=new Set(degreeLevels.map((_,i)=>choices.get(`degree-${i}`)).filter(Boolean));
    const activityOptions=degreeActions.filter(a=>!usedActivities.has(a.actionId)||a.actionId===activity);
    if(r.selectKind==='comparison'&&!comparisonOptionOrder.has(r.id)){
        const opts=[...r.options];
        if(Math.random()<0.5)opts.reverse();
        comparisonOptionOrder.set(r.id,opts);
    }
    const ids=isActivity?activityOptions.map(a=>a.actionId):r.selectKind==='comparison'?comparisonOptionOrder.get(r.id):r.selectKind==='preference'?['like','dislike']:r.selectKind==='adverb'?adverbs:r.selectKind==='ability'?['good','difficult']:adjectives;
    select.setAttribute('aria-label',isActivity?'Select':r.selectKind==='adverb'?'Degree adverb':r.selectKind==='preference'?'Like or dislike':r.selectKind==='ability'?'Skill or difficulty':'Choice of words');
    select.dataset.choice=r.id;
    if(r.selectKind==='comparison'||isActivity){const empty=node('option','',isActivity?'— Select —':'— Adj —');empty.value='';select.append(empty);}
    for(const id of ids){const opt=node('option','',isActivity?actionText(degreeActions.find(a=>a.actionId===id)):words[id][scriptMode==='kanji'?'kanji':'hira']);opt.value=id;if(r.selectKind==='adverb')opt.classList.add('degree-'+(['amari','zenzen'].includes(id)?'negative':'positive'));select.append(opt);}
    select.value=isActivity?activity:r.selectKind==='comparison'?(r.quizChoice||''):r.pending?'':r.selectKind==='adverb'?r.adverb:r.adjective;
    if(r.selectKind==='adverb')select.classList.add('degree-adverb','degree-'+(['amari','zenzen'].includes(r.adverb)?'negative':'positive'));
    if(!isActivity&&['adverb','ability','comparison'].includes(r.selectKind)&&hintMode!=='paren')cue.append(document.createTextNode('／'));
    const hint=node('span','p81-selection-hint');
    const selectedActivity=isActivity?degreeActions.find(a=>a.actionId===activity):null;
    hint.textContent=hintMode==='off'?'':selectedActivity?[words[selectedActivity.object].romaji,words[selectedActivity.verb].romaji].join(' + ')+'; '+words[selectedActivity.verb].meaning:select.value?words[select.value].romaji+', '+words[select.value].meaning:isActivity?'Select.':'Choose an expression first.';
    if(hintMode==='hover'){hint.className='tooltip-tip';const host=node('span','tooltip-wrap');host.append(select,hint);cue.append(host);}
    else {cue.append(select);if(hintMode==='paren')cue.append(node('span','vocab-inline','('+hint.textContent+')'));}
    select.onchange=()=>{
        if(session||preparing)return;
        stopPlayback();choices.set(r.id,select.value);render();
        document.querySelector(`[data-choice="${r.id}"]`)?.focus({preventScroll:true});
    };
}
function addExample(root,si) {
    const ex=node('div','example-box example-text-layout p81-example');if(si===3)ex.classList.add('p81-degree-example');if(si===4)ex.classList.add('p81-meaning-example');
    const samples=[
        [makeRow('ex1-noun',{...action('movie','make'),noun:true,adjective:'like'},{kind:'Noun'}),makeRow('ex1-action',{...action('movie','make'),adjective:'like'},{kind:'Verb＋の'})],
        [makeRow('ex2-q',{...action('television','watch'),adjective:'like',qa:'question'},{kind:'Q'}),makeRow('ex2-a',{...action('television','watch'),adjective:'like',qa:'response',short:true,answer:'yes'},{kind:'A',listenLabel:'🔊🙆'}),makeRow('ex2-no',{...action('television','watch'),adjective:'like',qa:'response',short:true,answer:'no'},{listenLabel:'🔊🙅'})],
        [makeRow('ex3-good',{subject:'youngerSister',...action('photo','take'),adjective:'good',highlightTopic:true}),makeRow('ex3-difficult',{subject:'youngerSister',...action('photo','take'),adjective:'difficult',highlightTopic:true})],
        exampleDegreeLevels.map((level,i)=>makeRow('ex4-'+i,{...action('cook','make'),...level,degreeLevel:level})),
        [makeRow('ex5-skill',{subject:'olderSister',...action('guitar','play'),adjective:'good',highlightTopic:true},{kind:'Skillful'}),makeRow('ex5-perception',{subject:'olderSister',...action('guitar','play'),adjective:'strong',highlightTopic:true},{kind:'Observed'})]
    ][si];
    const hasKinds=samples.some(r=>r.kind);
    for(const [index,r] of samples.entries()) {
        const repeatPrefix=(si===2||si===3||si===4)&&index>0;
        const row=node('div','p81-example-row');
        const kind=node('span',r.qa?'example-label-title':'example-label-title p81-kind',r.kind?r.kind+(r.qa?':':''):'');
        const cue=node('span','p81-example-cue');
        if(si===3){
            const prefix=node('span','p81-degree-cue-prefix'+(repeatPrefix?' p81-degree-cue-repeat':''));
            if(repeatPrefix){
                prefix.dataset.repeatCue='3';
                const spacer=node('span','p81-repeat-spacer');
                const mark=node('span','p81-repeat-mark','〃');mark.setAttribute('role','img');mark.setAttribute('aria-label',actionText(r));prefix.append(spacer,mark);
            }else {
                prefix.dataset.repeatAnchor='3';prefix.dataset.repeatStart=r.object;prefix.dataset.repeatEnd=r.verb;
                prefix.innerHTML=cues(r,[r.object,r.verb]);
            }
            if(hintMode!=='paren'&&!repeatPrefix)prefix.append(document.createTextNode('／'));
            cue.append(prefix);
            const tail=node('span','p81-degree-cue-tail');tail.innerHTML=degreePhraseHTML(r.degreeLevel)+(r.adverb?'／'+word('like'):'');cue.append(tail);
        }else if((si===2||si===4)&&index===1){
            cue.dataset.repeatCue=String(si);
            const spacer=node('span','p81-repeat-spacer');
            cue.append(spacer,node('span','p81-repeat-mark','〃'));
            cue.append(node('span','p81-repeat-separator-spacer'));if(hintMode!=='paren')cue.append(document.createTextNode('／'));
            const adjective=node('span','p81-repeat-adjective');adjective.innerHTML=word(r.adjective);cue.append(adjective);
        }else {
            cue.innerHTML=cues(r);
            if(si===2||si===4){cue.dataset.repeatAnchor=String(si);cue.dataset.repeatStart=r.subject||r.object;cue.dataset.repeatEnd=r.verb;cue.dataset.repeatVerb=r.verb;}
        }
        const arrow=node('span','p81-arrow',r.qa==='response'?'':'👉️');
        const listen=button(r.listenLabel||'🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);});
        const text=node('span','p81-model');text.innerHTML=modelHTML(r,repeatPrefix);
        if(si===2||si===3||si===4){
            if(index===0)text.dataset.repeatModelAnchor=String(si);
            else text.dataset.repeatModelCue=String(si);
        }
        if(hasKinds)row.append(kind);else row.classList.add('p81-no-kind');
        row.append(cue,arrow,listen,text);ex.append(row);
    }
    root.append(ex);
}
function addScale(root) {
    const scale=node('div','p81-degree-scale');scale.setAttribute('aria-label','Degree guide: negative and affirmative forms, approximate strength');
    const groups=[['zenzen','−−−','negative'],['amari','−','negative'],['chotto','＋','positive'],['maamaa','＋＋','positive'],['totemo','＋＋＋','positive']];
    groups.forEach(([id,marks,sign])=>{
        const point=node('div','p81-degree-point degree-'+sign);
        const mark=node('span','p81-degree-marks',marks);mark.setAttribute('aria-hidden','true');
        const label=node('span','p81-degree-label');
        label.innerHTML=id==='totemo'?word('totemo')+'／'+word('sugoku'):word(id)+(['zenzen','amari'].includes(id)?'<strong class="degree-negative">〜ない</strong>':'');
        point.append(mark,label);scale.append(point);
    });
    root.append(scale);
}
function render() {
    const root=$('drill1Container');root.replaceChildren();views.clear();
    sections.forEach((section,si)=>{
        const group=node('section','p81-section');group.id='drill'+(si+1);
        addExample(group,si);
        const panel=node('div','info-panel info-panel-task1');
        panel.append(node('span','info-panel-title',section.title));if(section.instruction)panel.append(node('span','info-panel-desc',section.instruction));group.append(panel);
        if(si===3)addScale(group);
        rowsFor(si).forEach((rows,index)=>{
            const card=node('div','drill-row p81-card');card.dataset.item=String(index+1);
            if(rows[0].scenario){const scenario=node('p','p81-scenario');if(si===4)scenario.append(node('span','p81-scenario-number',(index+1)+'.'),document.createTextNode(' '+rows[0].scenario));else scenario.textContent=rows[0].scenario;card.append(scenario);}
            if(rows[0].comparison)card.classList.add('p81-comparison-card');
            const table=node('table','recording-table p81-table');const body=node('tbody');table.append(body);
            let pairNotice=null;if(rows[0].comparison){pairNotice=node('div','p81-nuance-note');pairNotice.hidden=true;pairNotice.setAttribute('role','note');pairNotice.append(node('div','p81-nuance-note-title','✨Notice the difference:'));rows.forEach(item=>{const noteLine=node('div','p81-nuance-note-text');noteLine.append(node('strong','p81-nuance-adjective',words[item.adjective].kanji+'：'),document.createTextNode(item.impressions[item.adjective]));pairNotice.append(noteLine);});}
            rows.forEach((r,ri)=>{
                const key=keyFor(r),tr=node('tr');tr.dataset.row=r.id;
                if(!ri&&si!==4){const number=node('td','drill-number-cell',(index+1)+'.');number.rowSpan=rows.length;tr.append(number);}
                const cue=node('td','prompt-label drill-cue-cell');
                if(r.kind)cue.append(node('span','example-label-title p81-kind',r.kind));
                const cueBody=r.comparison?node('span','p81-cue-body'):cue;if(r.comparison)cue.append(cueBody);
                const listen=button('🔊きく',()=>{if(!session&&!preparing&&!r.pending&&!(r.selectKind==='activity'&&!choices.get(r.id)))speak(r.text,listen);});
                const rec=button('🎙️とる',()=>record(key,r));
                const stop=button('⏹️',()=>{if(session?.key===key)session.stop();});stop.classList.add('stop-record-btn');stop.disabled=true;stop.setAttribute('aria-disabled','true');
                const content=node('span','p81-cue-words');
                if(r.selectKind==='activity'){
                    addSelect(cueBody,r,key);
                    cueBody.append(document.createTextNode('／'));
                    const target=node('span','p81-degree-target');target.innerHTML=degreePhraseHTML(r.degreeLevel);cueBody.append(target);
                    if(r.adverb){cueBody.append(document.createTextNode('／'));const adjective=node('span','p81-degree-target');adjective.innerHTML=word('dislike');cueBody.append(adjective);}
                }else{
                    if(r.comparison&&ri>0){content.dataset.repeatCue='true';content.append(node('span','p81-drill-repeat-spacer'),node('span','p81-repeat-mark','〃'),node('span','p81-drill-repeat-after-spacer'));}
                    else{content.innerHTML=cues(r);if(r.comparison){content.dataset.repeatAnchor=r.verb;content.dataset.repeatStart=r.subject||r.object;content.dataset.repeatEnd=r.verb;}}
                    cueBody.append(content);addSelect(cueBody,r,key);
                }
                if(r.comparison)listen.classList.add('p81-cue-listen');
                if(r.selectKind==='adverb'){cueBody.append(document.createTextNode(hintMode==='paren'?'':'／'));const tail=node('span',hintMode==='paren'?'display-cue-unit':'p81-adjective');tail.innerHTML=word(r.adjective);cueBody.append(tail);}
                if(r.qa==='response')for(const [value,label]of [['yes','🙆'],['no','🙅']]){
                    const choose=button(label,()=>{if(session||preparing)return;stopPlayback();choices.set(r.id,value);render();});choose.classList.add('answer-choice');choose.dataset.answer=value;choose.dataset.response=r.id;choose.setAttribute('aria-label',value==='yes'?'Yes':'No');choose.setAttribute('aria-pressed',String(!r.pending&&r.answer===value));cueBody.append(choose);
                }
                const cell=node('td','p81-controls');const line=node('div','recording-controls');const actions=node(r.comparison?'span':'div','recording-actions');let notYet=null;
                if(r.comparison){const buttonGroup=node('span','p81-cue-button-group');buttonGroup.append(listen,rec,stop);notYet=node('span','not-recorded-yet','… Not yet');notYet.hidden=false;actions.classList.add('p81-cue-actions');actions.append(buttonGroup,notYet);cueBody.append(actions);}
                else actions.append(listen,rec,stop);
                const wrap=node('span','recording-result');const result=node('span','result-text');wrap.append(result);if(!r.comparison)line.append(actions);
                line.append(wrap);
                const correction=node('div','correction-box');correction.hidden=true;
                const feeling=node('div','p81-feedback');feeling.setAttribute('role','status');feeling.hidden=true;
                cell.append(line,correction,feeling);tr.append(cue,cell);body.append(tr);
                views.set(key,{r,rec,listen,stop,result,correction,feedback:feeling,notYet,nuance:pairNotice});showResult(key);
            });
            card.append(table);if(pairNotice)card.append(pairNotice);group.append(card);
        });
        root.append(group);
    });
    ConversationDisplay.format();measureCues();sync();
}
function measureCues() {
    document.querySelectorAll('.p81-repeat-spacer,.p81-repeat-separator-spacer,.p81-drill-repeat-spacer,.p81-drill-repeat-after-spacer,.p81-model-repeat-spacer,.p81-model-repeat-after-spacer').forEach(e=>{e.style.width='0px';});
    const alignDitto=(anchor,mark,startId,endId,spacer)=>{
        const display=id=>words[id]?.[scriptMode==='kanji'?'kanji':'hira'];
        const firstText=display(startId),lastText=display(endId);if(!anchor||!mark||!spacer||!firstText||!lastText)return;
        const targets=[...anchor.querySelectorAll('.target-word')];
        const first=targets.find(e=>e.textContent.includes(firstText)),last=[...targets].reverse().find(e=>e.textContent.includes(lastText));
        if(!first||!last)return;
        const firstRect=first.getBoundingClientRect(),lastRect=last.getBoundingClientRect(),cueRect=anchor.getBoundingClientRect(),markWidth=mark.getBoundingClientRect().width;
        const left=firstRect.left,right=lastRect.right;
        spacer.style.width=Math.max(0,left-cueRect.left+(right-left-markWidth)/2)+'px';
    };
    document.querySelectorAll('.p81-degree-example').forEach(ex=>{
        const measure=e=>{const copy=e.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'block',width:'max-content',maxWidth:'none'});ex.append(copy);const width=copy.getBoundingClientRect().width;copy.remove();return width;};
        const tailWidth=Math.max(...[...ex.querySelectorAll('.p81-degree-cue-tail')].map(measure));
        ex.style.setProperty('--degree-tail-width',tailWidth+'px');
    });
    document.querySelectorAll('.p81-example-cue[data-repeat-cue], .p81-degree-cue-prefix[data-repeat-cue]').forEach(cue=>{
        const anchor=cue.closest('.p81-example')?.querySelector('.p81-example-cue[data-repeat-anchor], .p81-degree-cue-prefix[data-repeat-anchor]');
        const mark=cue.querySelector('.p81-repeat-mark'),spacer=cue.querySelector('.p81-repeat-spacer');
        alignDitto(anchor,mark,anchor?.dataset.repeatStart,anchor?.dataset.repeatEnd,spacer);
        const separator=cue.querySelector('.p81-repeat-separator-spacer');
        if(!separator||!anchor)return;
        const adjective=[...anchor.querySelectorAll('.target-word')].at(-1);
        let adjectiveUnit=adjective;
        while(adjectiveUnit&&adjectiveUnit.parentElement!==anchor)adjectiveUnit=adjectiveUnit.parentElement;
        const slash=adjectiveUnit?.previousSibling;
        if(slash?.nodeType!==Node.TEXT_NODE)return;
        const slashIndex=slash.textContent.indexOf('／');if(slashIndex<0)return;
        const slashRange=document.createRange();slashRange.setStart(slash,slashIndex);slashRange.setEnd(slash,slashIndex+1);
        const slashX=slashRange.getBoundingClientRect().left,markRect=mark.getBoundingClientRect();
        separator.style.width=Math.max(0,slashX-markRect.right)+'px';
    });
    document.querySelectorAll('.p81-model[data-repeat-model-cue]').forEach(target=>{
        const ex=target.closest('.p81-example');
        const anchor=ex?.querySelector('.p81-model[data-repeat-model-anchor]');
        const anchorNoga=[...(anchor?.querySelectorAll('.p81-gold')||[])].find(e=>e.textContent==='のが');
        const targetNoga=[...(target.querySelectorAll('.p81-gold')||[])].find(e=>e.textContent==='のが');
        const spacer=target.querySelector('.p81-model-repeat-spacer');
        const afterSpacer=target.querySelector('.p81-model-repeat-after-spacer');
        const mark=target.querySelector('.p81-ditto');
        if(!anchor||!anchorNoga||!targetNoga||!spacer||!afterSpacer||!mark)return;
        const firstWord=anchor.querySelector('.target-word');
        const startX=(firstWord||anchor).getBoundingClientRect().left;
        const nogaX=anchorNoga.getBoundingClientRect().left;
        const targetX=target.getBoundingClientRect().left;
        const markWidth=mark.getBoundingClientRect().width;
        const emptyWidth=Math.max(0,nogaX-startX);
        const leftWidth=Math.max(0,startX-targetX+(emptyWidth-markWidth)/2);
        spacer.style.width=leftWidth+'px';
        const currentTargetNogaX=targetNoga.getBoundingClientRect().left;
        afterSpacer.style.width=Math.max(0,nogaX-currentTargetNogaX)+'px';
    });
    document.querySelectorAll('.p81-section').forEach(group=>{
        group.style.removeProperty('--p81-kind-width');
        const cards=group.querySelectorAll('.p81-card'),cells=group.querySelectorAll('.p81-card .prompt-label');let width=0;
        for(const cell of cells) {
            const copy=cell.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(e=>e.remove());
            Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'block',width:'max-content',maxWidth:'none',whiteSpace:'nowrap'});
            group.append(copy);width=Math.max(width,Math.ceil(copy.getBoundingClientRect().width));copy.remove();
        }
        for(const card of cards)card.style.setProperty('--p81-cue-width',(width+8)+'px');
        group.querySelectorAll('.p81-comparison-card').forEach(card=>{
            card.style.removeProperty('--p81-kind-width');
            const promptCells=[...card.querySelectorAll('.prompt-label:has(> .p81-cue-body)')];
            promptCells.forEach(c=>c.style.removeProperty('--p81-kind-width'));
            const labels=promptCells.map(c=>c.querySelector(':scope > .p81-kind'));
            if(labels.length!==2||!labels[0]||!labels[1])return;
            const labelWidths=labels.map(label=>{
                const copy=label.cloneNode(true);Object.assign(copy.style,{position:'absolute',visibility:'hidden',width:'max-content',maxWidth:'none'});
                card.append(copy);const w=copy.getBoundingClientRect().width;copy.remove();return w;
            });
            const anchor=card.querySelector('.p81-cue-words[data-repeat-anchor]'),target=card.querySelector('.p81-cue-words[data-repeat-cue]');
            const spacer=target?.querySelector('.p81-drill-repeat-spacer'),mark=target?.querySelector('.p81-repeat-mark'),afterSpacer=target?.querySelector('.p81-drill-repeat-after-spacer');
            const display=id=>words[id]?.[scriptMode==='kanji'?'kanji':'hira'];
            const firstText=display(anchor?.dataset.repeatStart),lastText=display(anchor?.dataset.repeatEnd);
            const targets=[...(anchor?.querySelectorAll('.target-word')||[])];
            const first=targets.find(e=>e.textContent.includes(firstText||'\u0000')),last=[...targets].reverse().find(e=>e.textContent.includes(lastText||'\u0000'));
            if(!anchor||!target||!spacer||!mark||!first||!last)return;
            const anchorRect0=anchor.getBoundingClientRect(),firstRect0=first.getBoundingClientRect(),lastRect0=last.getBoundingClientRect(),markWidth=mark.getBoundingClientRect().width;
            const relCenter=(firstRect0.left+lastRect0.right)/2-anchorRect0.left;
            const row1KindWidth=Math.max(labelWidths[0],labelWidths[1]-Math.max(0,relCenter-markWidth/2));
            promptCells[0].style.setProperty('--p81-kind-width',row1KindWidth+'px');
            promptCells[1].style.setProperty('--p81-kind-width',labelWidths[1]+'px');
            const firstRect=first.getBoundingClientRect(),lastRect=last.getBoundingClientRect(),targetRect=target.getBoundingClientRect();
            const centerX=(firstRect.left+lastRect.right)/2;
            spacer.style.width=Math.max(0,centerX-markWidth/2-targetRect.left)+'px';
            if(afterSpacer){
                const anchorRight=Math.max(anchor.getBoundingClientRect().right,lastRect.right);
                const markRight=mark.getBoundingClientRect().right;
                afterSpacer.style.width=Math.max(0,anchorRight-markRight)+'px';
                const selects=[...card.querySelectorAll('select.p81-select')];
                if(selects.length===2&&Math.abs(selects[0].getBoundingClientRect().top-firstRect.top)<8){
                    const delta=selects[0].getBoundingClientRect().left-selects[1].getBoundingClientRect().left;
                    if(Math.abs(delta)>0.1)afterSpacer.style.width=Math.max(0,parseFloat(afterSpacer.style.width)+delta)+'px';
                }
            }
        });
    });
}
function sync() {
    const busy=Boolean(session||preparing);
    document.querySelectorAll('#drill1Container button:not(.stop-record-btn),#drill1Container select,.compact-settings button,.compact-settings input').forEach(e=>e.disabled=busy);
    document.querySelectorAll('#drill1Container .stop-record-btn').forEach(b=>{b.disabled=true;b.setAttribute('aria-disabled','true');b.classList.remove('stop-btn-active');});
    views.forEach(v=>{
        const activitySelect=v.r.selectKind==='activity'?document.querySelector('[data-choice="'+v.r.id+'"]'):null;
        const activitySelected=Boolean(activitySelect?.value||choices.get(v.r.id));
        const pending=v.r.selectKind==='activity'?!activitySelected:Boolean(v.r.pending);
        const locked=busy||pending;
        for(const b of [v.listen,v.rec]){
            b.disabled=locked;
            b.setAttribute('aria-disabled',String(locked));
            b.classList.toggle('is-selection-locked',pending);
            if(pending)b.dataset.selectionHelp=v.r.qa==='response'?'Choose 🙆 or 🙅 first.':v.r.comparison?'Choose an adjective that matches the label.':v.r.selectKind==='activity'?'Select first.':'Choose an expression first.';
            else delete b.dataset.selectionHelp;
        }
        const canStop=Boolean(session&&session.key===keyFor(v.r)&&session.manual&&manual&&!session.stopping);
        v.stop.disabled=!canStop;
        v.stop.setAttribute('aria-disabled',String(!canStop));
        v.stop.classList.toggle('stop-btn-active',canStop);
    });
}
async function record(key, r) {
    if (session || preparing || r.pending || (r.selectKind==='activity'&&!choices.get(r.id))) return;

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
            sync();

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

    setupPreferredVoice81();

    render();
}


if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
DrillAudio.configure({busy:()=>Boolean(session||preparing),sync,stop:stopPlayback,cancel:()=>{preparing=false;if(session){session.discard=true;session.stop('',true);}}});
window.addEventListener('resize',()=>{if(!session&&!preparing)measureCues();});
document.fonts.ready.then(measureCues);
})();
