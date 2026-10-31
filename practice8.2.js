// Practice 8.2: page-local models and recording; shared lifecycle via DrillAudio.
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
W('yesterday','昨日','きのう','kinō','yesterday');
W('tomorrow','明日','あした','ashita','tomorrow');
W('morning','今朝','けさ','kesa','this morning');
W('weekend','次の週末','つぎのしゅうまつ','tsugi no shūmatsu','next weekend');
W('store','デパート','デパート','depāto','department store');
W('cafe','カフェ','カフェ','kafe','cafe');
W('kent','ケントさん','ケントさん','Kento-san','Kent');
W('music','音楽','おんがく','ongaku','music');
W('book','本','ほん','hon','book');
W('movie','映画','えいが','eiga','movie');
const verbs={};
function V(id,dict,hira,romaji,meaning,forms){W(id,dict,hira,romaji,meaning);verbs[id]={dict,...forms};}
V('drink','飲む','のむ','nomu','to drink',{masu:'飲みます',past:'飲みました',neg:'飲みません',pastNeg:'飲みませんでした',plainPast:'飲んだ',plainNeg:'飲まない',plainPastNeg:'飲まなかった'});
V('eat','食べる','たべる','taberu','to eat',{masu:'食べます',past:'食べました',neg:'食べません',pastNeg:'食べませんでした',plainPast:'食べた',plainNeg:'食べない',plainPastNeg:'食べなかった'});
V('buy','買う','かう','kau','to buy',{masu:'買います',past:'買いました',neg:'買いません',pastNeg:'買いませんでした',plainPast:'買った',plainNeg:'買わない',plainPastNeg:'買わなかった'});
V('do','する','する','suru','to do',{masu:'します',past:'しました',neg:'しません',pastNeg:'しませんでした',plainPast:'した',plainNeg:'しない',plainPastNeg:'しなかった'});
V('listen','聞く','きく','kiku','to listen; to ask',{masu:'聞きます',past:'聞きました',neg:'聞きません',pastNeg:'聞きませんでした',plainPast:'聞いた',plainNeg:'聞かない',plainPastNeg:'聞かなかった'});
V('read','読む','よむ','yomu','to read',{masu:'読みます',past:'読みました',neg:'読みません',pastNeg:'読みませんでした',plainPast:'読んだ',plainNeg:'読まない',plainPastNeg:'読まなかった'});
V('watch','見る','みる','miru','to watch',{masu:'見ます',past:'見ました',neg:'見ません',pastNeg:'見ませんでした',plainPast:'見た',plainNeg:'見ない',plainPastNeg:'見なかった'});
// Register complete inflections: a dictionary-form reading alone cannot read 飲みます.
const formReadings=[];
for(const [id,v]of Object.entries(verbs)){
 const w=words[id],suffix=w.kanji.match(/[ぁ-ん]+$/)?.[0]||'';
 const stem=suffix?w.kanji.slice(0,-suffix.length):w.kanji,reading=suffix?w.hira.slice(0,-suffix.length):w.hira;
 for(const text of Object.values(v)){
  const kana=stem?text.replace(stem,reading):text;formReadings.push([text,kana]);
  if(id==='listen')for(const mark of ['聴','訊'])formReadings.push([text.replace('聞',mark),kana]);
  if(id==='watch')formReadings.push([text.replace('見','観'),kana]);
 }
}
formReadings.forEach(e=>STTDisplay.register(...e));
const dictionary=[...formReadings,...Object.values(words).map(w=>[w.kanji,w.hira]),['私','わたし'],['何','なに'],['聴く','きく'],['訊く','きく'],['観る','みる']].sort((a,b)=>b[0].length-a[0].length);
[['聴く','きく'],['訊く','きく'],['観る','みる']].forEach(e=>STTDisplay.register(...e));
function displayKana(text){let value=String(text);for(const [k,h]of dictionary)value=value.split(k).join(h);return value;}
function hira(text){return displayKana(String(text).normalize('NFKC')).replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));}
function normalize(text){return hira(text).replace(/なにかを/g,'なにか').replace(/[\p{P}\p{Z}\s]/gu,'').replace(/^ううんん|^うんん/,'ううん').replace(/^いえ/,'いいえ').replace(/(?:よね|よ|ね)$/,'');}
const sections=[
 {title:'Drill 1: 何か — Statements',instruction:'💡Use 何か. Match the tense to the cue.'},
 {title:'Drill 2: 何か／何も — Yes/No Questions',instruction:'💡Ask with 何か. Choose 🙆 or 🙅. For 🙅, use 何も＋negative.'},
 {title:'Drill 3: 何でも — Questions & Answers',instruction:'💡Ask with どんな. Answer with 何でも.'}
];
const statements=[{time:'yesterday',place:'store',verb:'buy',past:true},{time:'tomorrow',verb:'do'},{verb:'drink'},{person:'kent',verb:'listen'}];
const conversations=[{time:'weekend',verb:'do'},{time:'morning',verb:'eat',past:true},{time:'yesterday',verb:'buy',past:true},{place:'cafe',verb:'drink'}];
const habits=[{object:'music',verb:'listen'},{object:'book',verb:'read'},{object:'movie',verb:'watch'}];
function inflect(s,negative=false){const v=verbs[s.verb];return speechStyle==='formal'?v[negative?(s.past?'pastNeg':'neg'):(s.past?'past':'masu')]:negative?v[s.past?'plainPastNeg':'plainNeg']:s.past?v.plainPast:v.dict;}
function context(s){return (s.time?words[s.time].kanji+'、':'')+(s.place?words[s.place].kanji+'で':'')+(s.person?words[s.person].kanji+'に':'');}
function sentenceFor(s){
 const ending=speechStyle==='formal'?'か。':'？';
 if(s.mode==='wh')return 'どんな'+words[s.object].kanji+'を'+inflect(s)+ending;
 if(s.mode==='any')return '何でも'+inflect(s)+'。';
 if(s.mode==='reply'){const no=s.answer==='no';return (speechStyle==='casual'?(no?'ううん、':'うん、'):(no?'いいえ、':'はい、'))+(no?'何も':'')+inflect(s,no)+'。';}
 return context(s)+(s.pronoun?words[s.pronoun].kanji:'何か')+inflect(s,s.pronoun==='nothing')+(s.mode==='question'?ending:'。');
}
function makeRow(id,spec,extra={}){
 const r={id,...spec,...extra};r.text=sentenceFor(r);r.hira=displayKana(r.text);r.refs=[r.text,r.hira];
 if(r.mode==='reply'){
  const no=r.answer==='no',body=(no?'何も':'')+inflect(r,no)+'。',full=context(r)+(no?'何も':'何か')+inflect(r,no)+'。';
  const starts=speechStyle==='casual'?[no?'ううん、':'うん、','']:[no?'いいえ、':'はい、',''];
  for(const start of starts)for(const part of [body,full])r.refs.push(start+part,start+'私は、'+part,'私は、'+start+part);
 }
 if(r.mode==='any')r.refs.push('何でも','私は、'+r.text);
 if(r.mode==='statement')r.refs.push('私は、'+r.text);
 r.refs=[...new Set(r.refs.flatMap(t=>[t,hira(t)]))];
 if(speechStyle==='casual')r.refs.push(...r.refs.map(t=>t.replace('を','')));
 STTDisplay.register(r.text,r.hira);return r;
}
function rowsFor(si){
 if(si===0)return statements.map((s,i)=>[makeRow('something-'+i,{...s,mode:'statement'})]);
 if(si===1)return conversations.map((s,i)=>{const id='yn-'+i+'-a',answer=choices.get(id);return [makeRow('yn-'+i+'-q',{...s,mode:'question'},{kind:'Q',qa:'question'}),makeRow(id,{...s,mode:'reply',answer:answer||'yes'},{kind:'A',qa:'response',yn:true,pending:!answer})];});
 return habits.map((s,i)=>[makeRow('any-'+i+'-q',{...s,mode:'wh'},{kind:'Q',qa:'question'}),makeRow('any-'+i+'-a',{...s,mode:'any'},{kind:'A',qa:'response'})]);
}
function matchesAnswer(raw,r){const value=r.verb==='listen'?String(raw).replace(/[聴訊]/g,'聞'):r.verb==='watch'?String(raw).replace(/観/g,'見'):raw;return !r.pending&&DrillAnswer.formAllowed(raw,speechStyle)&&Boolean(normalize(value))&&r.refs.some(t=>normalize(t)===normalize(value));}
function feedback(){return null;}
function keyFor(r){return r.id+':'+(r.yn?(r.pending?'unselected':r.answer):'fixed');}
function word(id,shown){const w=words[id],text=escape(shown??w[scriptMode==='kanji'?'kanji':'hira']),tip=escape(w.romaji+', '+w.meaning);if(hintMode==='off')return '<span class="target-word">'+text+'</span>';if(hintMode==='paren')return '<span class="target-word">'+text+'</span><span class="vocab-inline">('+tip+')</span>';return '<span class="tooltip-wrap"><span class="target-word">'+text+'</span><span class="tooltip-tip">'+tip+'</span></span>';}
function cues(r){const ids=r.mode==='reply'?[]:r.mode==='any'?['anything']:r.mode==='wh'?['whatkind',r.object,r.verb]:[r.time,r.place,r.person,r.verb].filter(Boolean);return ids.map(id=>hintMode==='paren'?'<span class="display-cue-unit">'+word(id)+'</span>':word(id)).join(hintMode==='paren'?'':'／');}
function modelHTML(r){
 const text=scriptMode==='kanji'?r.text:r.hira;
 const marks=['何でも','何か','何も','なんでも','なにか','なにも',...(r.text.includes('何も')?['ませんでした','ません','なかった','ない']:[])].sort((a,b)=>b.length-a.length);
 const tokens=Object.entries(words).map(([id,w])=>({id,text:w[scriptMode==='kanji'?'kanji':'hira']}));
 for(const [id,v]of Object.entries(verbs))for(const t of Object.values(v))tokens.push({id,text:scriptMode==='kanji'?t:displayKana(t)});
 tokens.sort((a,b)=>b.text.length-a.text.length);
 let out='',i=0;while(i<text.length){
  const mark=marks.find(t=>text.startsWith(t,i));
  if(mark){const id=Object.keys(words).find(id=>[words[id].kanji,words[id].hira].includes(mark));out+='<strong class="grammar-highlight">'+(id?word(id,mark):escape(mark))+'</strong>';i+=mark.length;continue;}
  // Split negative endings so 何も and the ending stay visibly linked.
  const token=tokens.find(t=>text.startsWith(t.text,i));
  if(token){const neg=r.text.includes('何も')&&['ませんでした','ません','なかった','ない'].find(e=>token.text.endsWith(e));out+=neg?word(token.id,token.text.slice(0,-neg.length))+'<strong class="grammar-highlight">'+escape(neg)+'</strong>':word(token.id,token.text);i+=token.text.length;}else out+=escape(text[i++]);
 }return out;
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
    }else v.result.textContent='(Not recorded yet)';
    if(value?.url) {
        const play=button('▶️',()=>playRecording(key,play),'Play your recorded voice');
        play.classList.add('play-recording-btn');v.result.append(play);
    }
    if(notice){const note=document.createElement('span');note.className='p81-notice';note.textContent=notice;v.result.append(note);}
}
function node(tag,className='',text=''){const e=document.createElement(tag);e.className=className;e.textContent=text;return e;}

function addExample(root,si){
 const ex=node('div','example-box example-text-layout p81-example');
 let samples;
 if(si===0)samples=['something','nothing','anything'].map((pronoun,i)=>makeRow('ex1-'+i,{verb:'drink',mode:pronoun==='anything'?'any':'statement',pronoun},{kind:['何か · Something','何も＋negative · Nothing','何でも · Anything'][i],intro:true}));
 else if(si===1)samples=[makeRow('ex2-q',{time:'morning',verb:'eat',past:true,mode:'question'},{kind:'Q',qa:'question'}),makeRow('ex2-yes',{verb:'eat',past:true,mode:'reply',answer:'yes'},{kind:'A',qa:'response',listenLabel:'🔊🙆'}),makeRow('ex2-no',{verb:'eat',past:true,mode:'reply',answer:'no'},{qa:'response',listenLabel:'🔊🙅'})];
 else samples=[makeRow('ex3-q',{...habits[0],mode:'wh'},{kind:'Q',qa:'question'}),makeRow('ex3-a',{...habits[0],mode:'any'},{kind:'A',qa:'response'})];
 samples.forEach(r=>{const row=node('div','p81-example-row'),kind=node('span','example-label-title p81-kind',r.kind?(scriptMode==='kanji'?r.kind:displayKana(r.kind))+(r.qa?':':''):'');const cue=node('span','p81-example-cue');cue.innerHTML=r.intro?word(r.pronoun)+'／'+word(r.verb):cues(r);const arrow=node('span','p81-arrow',r.mode==='reply'?'':'👉️'),listen=button(r.listenLabel||'🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);}),text=node('span','p81-model');text.innerHTML=modelHTML(r);row.append(kind,cue,arrow,listen,text);ex.append(row);});root.append(ex);
}
function render(){
 const root=$('drill1Container');root.replaceChildren();views.clear();
 sections.forEach((section,si)=>{const group=node('section','p81-section');group.id='drill'+(si+1);addExample(group,si);const panel=node('div','info-panel info-panel-task1');panel.append(node('span','info-panel-title',scriptMode==='kanji'?section.title:displayKana(section.title)),node('span','info-panel-desc',scriptMode==='kanji'?section.instruction:displayKana(section.instruction)));group.append(panel);
 rowsFor(si).forEach((rows,index)=>{const card=node('div','drill-row p81-card'),table=node('table','recording-table p81-table'),body=node('tbody');table.append(body);
 rows.forEach((r,ri)=>{const key=keyFor(r),tr=node('tr');tr.dataset.row=r.id;if(!ri){const n=node('td','drill-number-cell',(index+1)+'.');n.rowSpan=rows.length;tr.append(n);}const cue=node('td','prompt-label drill-cue-cell');if(r.kind)cue.append(node('span','example-label-title p81-kind',r.kind));const content=node('span','p81-cue-words');content.innerHTML=cues(r);cue.append(content);
 if(r.yn)for(const [value,label]of [['yes','🙆'],['no','🙅']]){const choose=button(label,()=>{if(session||preparing)return;stopPlayback();choices.set(r.id,value);render();});choose.classList.add('answer-choice');choose.dataset.answer=value;choose.dataset.response=r.id;choose.setAttribute('aria-label',value==='yes'?'Yes':'No');choose.setAttribute('aria-pressed',String(!r.pending&&r.answer===value));cue.append(choose);}
 const cell=node('td','p81-controls'),line=node('div','recording-controls'),actions=node('div','recording-actions'),listen=button('🔊きく',()=>{if(!session&&!preparing)speak(r.text,listen);}),rec=button('🎙️とる',()=>record(key,r)),stop=button('⏹️',()=>{if(session?.key===key)session.stop();});stop.disabled=true;actions.append(listen,rec,stop);const wrap=node('span','recording-result'),result=node('span','result-text');wrap.append(result);line.append(actions,wrap);const correction=node('div','correction-box'),feeling=node('div','p81-feedback');correction.hidden=true;feeling.hidden=true;cell.append(line,correction,feeling);tr.append(cue,cell);body.append(tr);views.set(key,{r,rec,listen,stop,result,correction,feedback:feeling});showResult(key);
 });card.append(table);group.append(card);});root.append(group);});ConversationDisplay.format();measureCues();sync();
}
function measureCues(){document.querySelectorAll('.p81-section').forEach(group=>{let width=0;for(const cell of group.querySelectorAll('.p81-card .prompt-label')){const copy=cell.cloneNode(true);copy.querySelectorAll('.tooltip-tip').forEach(t=>t.remove());Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'block',width:'max-content',maxWidth:'none',whiteSpace:'nowrap'});group.append(copy);width=Math.max(width,Math.ceil(copy.getBoundingClientRect().width));copy.remove();}for(const card of group.querySelectorAll('.p81-card'))card.style.setProperty('--p81-cue-width',(width+8)+'px');});}
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

    render();
}


if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
DrillAudio.configure({busy:()=>Boolean(session||preparing),sync,stop:stopPlayback,cancel:()=>{preparing=false;if(session){session.discard=true;session.stop('',true);}}});
window.addEventListener('resize',()=>{if(!session&&!preparing)measureCues();});
})();
