// Practice 8.1: page-local models and recording; shared lifecycle via DrillAudio.
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
W("you","あなた","あなた","anata","you");
W("i","私","わたし","watashi","I");
W("book","本","ほん","hon","book");
W("music","音楽","おんがく","ongaku","music");
W("photo","写真","しゃしん","shashin","photograph");
W("read","読む","よむ","yomu","to read");
W("listen","聞く","きく","kiku","to listen");
W("take","撮る","とる","toru","to take photographs");
W("room","部屋","へや","heya","room");
W("clean","掃除する","そうじする","sōji suru","to clean");
W("laundry","洗濯","せんたく","sentaku","laundry");
W("do","する","する","suru","to do");
W("friend","友達","ともだち","tomodachi","friend");
W("teacher","先生","せんせい","sensei","teacher");
W("student","留学生","りゅうがくせい","ryūgakusei","international student");
W("child","子ども","こども","kodomo","child");
W("person","この人","このひと","kono hito","this person");
W("siblings","兄弟","きょうだい","kyōdai","siblings");
W("write","書く","かく","kaku","to write");
W("kanji","漢字","かんじ","kanji","kanji");
W("cook","料理","りょうり","ryōri","cooking");
W("sing","歌う","うたう","utau","to sing");
W("song","歌","うた","uta","song");
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
W("oldbook","古い本","ふるいほん","furui hon","old book");
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
W("maamaa","まあまあ","まあまあ","māmā","fairly; reasonably");
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
const dictionary=[...Object.values(words).map(w=>[w.kanji,w.hira]),['子供','こども'],['嫌い','きらい'],['友だち','ともだち'],['私','わたし'],['料理する','りょうりする'],['洗濯する','せんたくする']].sort((a,b)=>b[0].length-a[0].length);
dictionary.forEach(([k,h])=>STTDisplay.register(k,h));
function hira(text) {
    let value=String(text).normalize('NFKC');
    for(const [from,to] of dictionary)value=value.split(from).join(to);
    return value.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
}
function normalize(text) {
    return hira(text).replace(/(?:ではありません|じゃありません|ではないです)/g,'じゃないです').replace(/[\p{P}\p{Z}\s]/gu,'').replace(/^(?:ううんん|うんん)/,'ううん').replace(/^いえ/,'いいえ').replace(/(?:よね|よ|ね)$/,'');
}
const action=(object,verb,particle='を')=>({object,verb,particle});
const compareActions=[action('book','read'),action('music','listen'),action('photo','take')];
const selfActions=[action('book','read'),action('room','clean'),action('photo','take'),action('laundry','do')];
const people=[
    {subject:'friend',...action('photo','take'),adjective:'good'},
    {subject:'teacher',...action('kanji','write'),adjective:'good'},
    {subject:'student',...action('cook','do'),adjective:'difficult'},
    {subject:'child',...action('kanji','remember'),adjective:'difficult'},
    {subject:'person',...action('song','sing'),adjective:'good'},
    {subject:'siblings',...action('car','drive'),adjective:'difficult'}
];
const degrees=[
    {...action('cook','make'),adjective:'like',initial:'totemo'},
    {...action('car','wash'),adjective:'dislike',initial:'sugoku'},
    {subject:'friend',...action('tomato','cut'),adjective:'good',initial:'maamaa'},
    {...action('breakfast','make'),adjective:'bad',initial:'chotto'},
    {...action('oldbook','discard'),adjective:'like',initial:'amari'},
    {...action('study','begin'),adjective:'like',initial:'zenzen'}
];
// Meaning first, then context-dependent interpersonal impressions.
const comparisons=[
 {phase:'Meaning',subject:'mother',...action('flower','grow'),options:['good','strong'],labels:['Skill assessment','Personal perception'],scenario:'You have seen the flowers; your mother calls gardening her strength.'},
 {phase:'Meaning',subject:'i',...action('english','speak'),options:['bad','difficult'],labels:['Skill assessment','Personal perception'],scenario:'Separate your speaking skill from how difficult speaking feels.'},
 {phase:'Meaning',subject:'i',...action('early','wake',''),options:['difficult','bad'],labels:['Personal perception','Unnatural'],scenario:'Talk about getting up early: personal difficulty versus an unusual skill judgment.'},
 {phase:'Impression',subject:'i',...action('cook','do'),options:['good','strong'],labels:['Boastful','Confident'],scenario:'Introduce your cooking ability to a new acquaintance.'},
 {phase:'Impression',subject:'studentFriend',...action('japanese','speak'),options:['good','strong'],labels:['Praise','Personal perception'],scenario:'You heard them speak; they also call Japanese their strength.'},
 {phase:'Impression',subject:'friend',...action('song','sing'),options:['good','bad'],labels:['Praise','Direct'],scenario:'Describe your friend’s singing after hearing it.'},
 {phase:'Impression',subject:'japaneseTeacher',...action('japanese','speak'),options:['good','bad'],labels:['Patronizing','Rude'],scenario:'As a beginner, say this directly to an experienced Japanese teacher about their Japanese.'}
];
comparisons.forEach(spec=>{
 spec.impressionWords=Object.fromEntries(spec.options.map((id,i)=>[id,spec.labels[i]]));
 spec.impressions=Object.fromEntries(spec.options.map((id,i)=>[id,{label:({Boastful:'May sound boastful in this situation.',Confident:'States your own strength.',Praise:'Praises the other person’s skill.',Direct:'May sound too direct.',Patronizing:'May sound patronizing: you are judging the teacher’s expertise.',Rude:'May sound rude: a direct negative judgment of the teacher.',Unnatural:'Unusual: getting up early is not normally described with 下手.'})[spec.labels[i]]||({good:'This assesses skill.',bad:'This directly assesses limited skill.',strong:'This describes a personal strength.',difficult:'This describes personal difficulty.'})[id],tone:['Unnatural','Boastful','Direct','Patronizing','Rude'].includes(spec.labels[i])?'caution':'fit'}]));
});
const sections=[
    {title:'Drill 1: Nounが好き／Verbのが好き',instruction:'💡Compare liking a thing with liking an activity.'},
    {title:'Drill 2: Verbのが好き／きらい',instruction:'💡Ask a Yes/No question. Choose 🙆 or 🙅 and answer.'},
    {title:'Drill 3: Verbのが上手／苦手',instruction:'💡Choose 上手 or 苦手 to describe each person.'},
    {title:'Drill 4: Degree adverbs',instruction:'💡Choose an adverb. Use a negative ending with あまり or ぜんぜん.'},
    {title:'Drill 5: Compare expressions',instruction:'💡Choose an adjective for each label: meaning first, then impression.'}
];
function selected(id,initial){return choices.get(id)||initial;}
function sentenceFor(spec,style=speechStyle,kanji=true,adjective=spec.adjective) {
    const get=id=>words[id][kanji?'kanji':'hira'];
    let prefix=spec.subject?get(spec.subject)+'は、':'';
    prefix+=get(spec.object)+(spec.noun?'が':spec.particle+get(spec.verb)+'のが');
    const negative=['amari','zenzen'].includes(spec.adverb)||spec.answer==='no';
    const ending=style==='formal'?(negative?'じゃないです。':'です。'):(negative?'じゃない。':style==='casual'?'だよ。':'だ。');
    if(spec.qa==='question')return prefix+get(adjective)+(style==='formal'?'ですか。':'？');
    const body=(spec.short?'':prefix)+(spec.adverb?get(spec.adverb):'')+get(adjective)+ending;
    if(spec.qa==='response')return (spec.answer==='no'?(style==='casual'?'ううん、':'いいえ、'):(style==='casual'?'うん、':'はい、'))+body;
    return body;
}
function makeRow(id,spec,extra={}) {
    const r={id,...spec,...extra};
    r.text=sentenceFor(r,speechStyle,true);r.hira=sentenceFor(r,speechStyle,false);
    r.refs=[];
    const possible=[r.adjective];
    for(const a of possible)for(const explicitSelf of r.subject?[false]:[false,true]) {
        const variant=explicitSelf?{...r,subject:r.qa==='question'?'you':'i'}:r;
        for(const kanji of [true,false]) {
            const full=sentenceFor(variant,speechStyle,kanji,a);
            r.refs.push(full);
            // する nouns permit both forms; keep のが mandatory in action rows.
            if(r.verb==='do')r.refs.push(full.replace((kanji?words[r.object].kanji:words[r.object].hira)+'をする',(kanji?words[r.object].kanji:words[r.object].hira)+'する'));
        }
    }
    if(r.qa==='response') {
        for(const kanji of [true,false])for(const subject of [null,'i']) {
            const full=sentenceFor({...r,short:false,subject},speechStyle,kanji);
            r.refs.push(full,full.replace(/^(?:はい|いいえ|うん|ううん)、/,''));
            if(r.verb==='do')r.refs.push(full.replace('をする','する'),full.replace('をする','する').replace(/^(?:はい|いいえ|うん|ううん)、/,''));
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
    if(si===3)return degrees.map((s,i)=>{const id=`degree-${i}`;return [makeRow(id,{...s,adverb:selected(id,s.initial)},{selectKind:'adverb'})];});
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
function keyFor(r){if(r.comparison)return r.id+':'+(r.quizChoice||'unselected');return r.id+':' +(r.qa==='response'?(r.pending?'unselected':r.answer):r.selectKind==='adverb'?r.adverb:r.selectKind?(r.pending?'unselected':r.adjective):'fixed');}

function word(id) {
    const w=words[id],text=escape(w[scriptMode==='kanji'?'kanji':'hira']);
    const tip=escape(w.romaji+', '+w.meaning);
    const display=adverbs.includes(id)?`<strong class="degree-adverb degree-${['amari','zenzen'].includes(id)?'negative':'positive'}">${text}</strong>`:text;
    if(hintMode==='off')return `<span class="target-word">${display}</span>`;
    if(hintMode==='paren')return `<span class="target-word">${display}</span><span class="vocab-inline">(${tip})</span>`;
    return `<span class="tooltip-wrap"><span class="target-word">${display}</span><span class="tooltip-tip">${tip}</span></span>`;
}
function cues(r,visibleIds) {
    if(r.qa==='response')return '';
    const ids=visibleIds||[r.subject,r.object,...(r.noun?[]:[r.verb]),...(r.adverb&&!r.selectKind?[r.adverb]:[]),...(r.selectKind==='ability'||r.selectKind==='adverb'||r.selectKind==='comparison'?[]:[r.adjective])].filter(Boolean);
    const wrap=html=>hintMode==='paren'?`<span class="display-cue-unit">${html}</span>`:html;
    return ids.map(id=>wrap(word(id))).join(hintMode==='paren'?'':'／');
}

function modelHTML(r,repeatPrefix=false) {
    const fullText=scriptMode==='kanji'?r.text:r.hira;
    const text=repeatPrefix?sentenceFor({...r,short:true},speechStyle,scriptMode==='kanji'):fullText;
    const tokens=[...Object.values(words)].map(w=>w[scriptMode==='kanji'?'kanji':'hira']).sort((a,b)=>b.length-a.length);
    let out=repeatPrefix?`<span class="p81-ditto" role="img" aria-label="${escape(fullText.slice(0,fullText.length-text.length))}">〃</span> `:'',i=0;
    while(i<text.length) {
        const responseMark=r.qa==='response'?(i===0?text.match(/^(はい|いいえ|うん|ううん)/)?.[0]:text.slice(i).match(/^(じゃないです|じゃない|です|だよ|だ)/)?.[0]):null;
        const gold=responseMark||(r.qa==='question'&&text.startsWith('ですか',i)?'ですか':text.startsWith('のが',i)?'のが':r.noun&&text[i]==='が'?'が':r.highlightTopic&&r.subject&&i===words[r.subject][scriptMode==='kanji'?'kanji':'hira'].length&&text[i]==='は'?'は':null);
        if(gold){out+=`<strong class="p81-gold grammar-highlight">${gold}</strong>`;i+=gold.length;continue;}
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
    v.result.replaceChildren();v.correction.replaceChildren();v.correction.hidden=true;
    v.feedback.replaceChildren();v.feedback.hidden=true;
    if(session?.key===key){v.result.textContent='Recording...';return;}
    if(value?.raw) {
        const displayed=STTDisplay.format(value.raw,{mode:scriptMode,anchor:v.result,context:value.modelText||v.r.text,page:'8.1'});
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
    }else v.result.textContent='(Not recorded yet)';
    if(value?.url) {
        const play=button('▶️',()=>playRecording(key,play),'Play your recorded voice');
        play.classList.add('play-recording-btn');v.result.append(play);
    }
    if(notice){const note=document.createElement('span');note.className='p81-notice';note.textContent=notice;v.result.append(note);}
}
function node(tag,className='',text=''){const e=document.createElement(tag);e.className=className;e.textContent=text;return e;}
function addSelect(cue,r,key) {
    if(!r.selectKind)return;
    const select=node('select','custom-select p81-select');
    const ids=r.selectKind==='comparison'?r.options:r.selectKind==='preference'?['like','dislike']:r.selectKind==='adverb'?adverbs:r.selectKind==='ability'?['good','difficult']:adjectives;
    select.setAttribute('aria-label',r.selectKind==='adverb'?'Degree adverb':r.selectKind==='preference'?'Like or dislike':r.selectKind==='ability'?'Skill or difficulty':'Choice of words');
    select.dataset.choice=r.id;
    if(r.selectKind==='comparison'){const empty=node('option','','— Adj —');empty.value='';empty.disabled=true;select.append(empty);}
    for(const id of ids){const opt=node('option','',words[id][scriptMode==='kanji'?'kanji':'hira']);opt.value=id;if(r.selectKind==='adverb')opt.classList.add('degree-'+(['amari','zenzen'].includes(id)?'negative':'positive'));select.append(opt);}
    select.value=r.selectKind==='comparison'?(r.quizChoice||''):r.pending?'':r.selectKind==='adverb'?r.adverb:r.adjective;
    if(r.selectKind==='adverb')select.classList.add('degree-adverb','degree-'+(['amari','zenzen'].includes(r.adverb)?'negative':'positive'));
    if(['adverb','ability','comparison'].includes(r.selectKind)&&hintMode!=='paren')cue.append(document.createTextNode('／'));
    const hint=node('span','p81-selection-hint');
    hint.textContent=hintMode==='off'?'':select.value?words[select.value].romaji+', '+words[select.value].meaning:'Choose an expression first.';
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
        [makeRow('ex1-noun',{...compareActions[0],noun:true,adjective:'like'},{kind:'Noun'}),makeRow('ex1-action',{...compareActions[0],adjective:'like'},{kind:'Verb＋の'})],
        [makeRow('ex2-q',{...selfActions[0],adjective:'like',qa:'question'},{kind:'Q'}),makeRow('ex2-a',{...selfActions[0],adjective:'like',qa:'response',short:true,answer:'yes'},{kind:'A',listenLabel:'🔊🙆'}),makeRow('ex2-no',{...selfActions[0],adjective:'like',qa:'response',short:true,answer:'no'},{listenLabel:'🔊🙅'})],
        [makeRow('ex3-good',{...people[0],adjective:'good',highlightTopic:true}),makeRow('ex3-difficult',{...people[0],adjective:'difficult',highlightTopic:true})],
        adverbs.map(adverb=>makeRow('ex4-'+adverb,{...degrees[0],adverb})),
        [makeRow('ex5-skill',{...comparisons[0],adjective:'good',highlightTopic:true},{kind:'Skill assessment'}),makeRow('ex5-perception',{...comparisons[0],adjective:'strong',highlightTopic:true},{kind:'Personal perception'})]
    ][si];
    const hasKinds=samples.some(r=>r.kind);
    for(const [index,r] of samples.entries()) {
        const repeatPrefix=si===3&&index>0;
        const row=node('div','p81-example-row');
        const kind=node('span',r.qa?'example-label-title':'example-label-title p81-kind',r.kind?r.kind+(r.qa?':':''):'');
        const cue=node('span','p81-example-cue');
        if(si===3){
            if(!repeatPrefix){const prefix=node('span','p81-degree-cue-prefix');prefix.innerHTML=cues(r,[r.object,r.verb])+(hintMode==='paren'?'':'／');cue.append(prefix);}
            const tail=node('span','p81-degree-cue-tail');tail.innerHTML=cues(r,[r.adverb,r.adjective]);cue.append(tail);
        }else cue.innerHTML=cues(r);
        const arrow=node('span','p81-arrow',r.qa==='response'?'':'👉️');
        const listen=button(r.listenLabel||'🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);});
        const text=node('span','p81-model');text.innerHTML=modelHTML(r,repeatPrefix);
        if(si===3){
            const prefix=node('span','p81-degree-model-prefix'),tail=node('span','p81-degree-model-tail');
            if(repeatPrefix){prefix.append(text.querySelector('.p81-ditto'));tail.append(...text.childNodes);}
            else {const html=text.innerHTML,mark='<strong class="p81-gold grammar-highlight">のが</strong>',end=html.indexOf(mark)+mark.length;prefix.innerHTML=html.slice(0,end);tail.innerHTML=html.slice(end);}
            text.replaceChildren(prefix,tail);
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
        const label=node('span','p81-degree-label');label.innerHTML=word(id)+(id==='totemo'?'／'+word('sugoku'):'')+(['zenzen','amari'].includes(id)?'<span>〜ない</span>':'');
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
        panel.append(node('span','info-panel-title',section.title),node('span','info-panel-desc',section.instruction));group.append(panel);
        if(si===3)addScale(group);
        rowsFor(si).forEach((rows,index)=>{
            const card=node('div','drill-row p81-card');card.dataset.item=String(index+1);
            if(si===4&&(index===0||comparisons[index].phase!==comparisons[index-1].phase))group.append(node('p','p81-phase',comparisons[index].phase==='Meaning'?'Meaning':'Speaker & listener'));
            if(rows[0].scenario)card.append(node('p','p81-scenario',rows[0].scenario));
            if(rows[0].comparison)card.classList.add('p81-comparison-card');
            const table=node('table','recording-table p81-table');const body=node('tbody');table.append(body);
            rows.forEach((r,ri)=>{
                const key=keyFor(r),tr=node('tr');tr.dataset.row=r.id;
                if(!ri){const number=node('td','drill-number-cell',(index+1)+'.');number.rowSpan=rows.length;tr.append(number);}
                const cue=node('td','prompt-label drill-cue-cell');
                if(r.kind)cue.append(node('span','example-label-title p81-kind',r.kind));
                const content=node('span','p81-cue-words');content.innerHTML=cues(r);cue.append(content);addSelect(cue,r,key);
                if(r.selectKind==='adverb'){cue.append(document.createTextNode(hintMode==='paren'?'':'／'));const tail=node('span',hintMode==='paren'?'display-cue-unit':'p81-adjective');tail.innerHTML=word(r.adjective);cue.append(tail);}
                if(r.qa==='response')for(const [value,label]of [['yes','🙆'],['no','🙅']]){
                    const choose=button(label,()=>{if(session||preparing)return;stopPlayback();choices.set(r.id,value);render();});choose.classList.add('answer-choice');choose.dataset.answer=value;choose.dataset.response=r.id;choose.setAttribute('aria-label',value==='yes'?'Yes':'No');choose.setAttribute('aria-pressed',String(!r.pending&&r.answer===value));cue.append(choose);
                }
                const cell=node('td','p81-controls');const line=node('div','recording-controls');const actions=node('div','recording-actions');
                const listen=button('🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);});
                const rec=button('🎙️とる',()=>record(key,r));
                const stop=button('⏹️',()=>{if(session?.key===key)session.stop();});stop.disabled=true;
                actions.append(listen,rec,stop);
                const wrap=node('span','recording-result');const result=node('span','result-text');wrap.append(result);line.append(actions);
                line.append(wrap);
                const correction=node('div','correction-box');correction.hidden=true;
                const feeling=node('div','p81-feedback');feeling.setAttribute('role','status');feeling.hidden=true;
                let quizNote=null;
                if(r.comparison){const quiz=node('p','p81-choice-feedback');quiz.setAttribute('role','status');quiz.hidden=!r.quizChoice;quiz.textContent=r.quizChoice?(r.pending?'Try the other adjective for this label.':'✓ '+r.impressions[r.adjective].label):'';quizNote=quiz;}
                cell.append(line,correction,feeling);if(quizNote)cell.append(quizNote);tr.append(cue,cell);body.append(tr);
                views.set(key,{r,rec,listen,stop,result,correction,feedback:feeling});showResult(key);
            });
            card.append(table);group.append(card);
        });
        root.append(group);
    });
    ConversationDisplay.format();measureCues();sync();
}
function measureCues() {
    document.querySelectorAll('.p81-degree-example').forEach(ex=>{
        const measure=e=>{const copy=e.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'block',width:'max-content',maxWidth:'none'});ex.append(copy);const width=copy.getBoundingClientRect().width;copy.remove();return width;};
        const tailWidth=Math.max(...[...ex.querySelectorAll('.p81-degree-cue-tail')].map(measure));
        const prefix=ex.querySelector('.p81-degree-model-prefix');
        ex.style.setProperty('--degree-tail-width',tailWidth+'px');
        ex.style.setProperty('--degree-prefix-width',measure(prefix)+'px');
    });
    document.querySelectorAll('.p81-section').forEach(group=>{
        const cards=group.querySelectorAll('.p81-card'),cells=group.querySelectorAll('.p81-card .prompt-label');let width=0;
        for(const cell of cells) {
            const copy=cell.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(e=>e.remove());
            Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'block',width:'max-content',maxWidth:'none',whiteSpace:'nowrap'});
            group.append(copy);width=Math.max(width,Math.ceil(copy.getBoundingClientRect().width));copy.remove();
        }
        for(const card of cards)card.style.setProperty('--p81-cue-width',(width+8)+'px');
    });
}
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

    setupPreferredVoice81();

    render();
}


if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
DrillAudio.configure({busy:()=>Boolean(session||preparing),sync,stop:stopPlayback,cancel:()=>{preparing=false;if(session){session.discard=true;session.stop('',true);}}});
window.addEventListener('resize',()=>{if(!session&&!preparing)measureCues();});
})();
