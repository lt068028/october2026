// STT display only. Do not use these transformations to grade or generate TTS.
(() => {
    const entries = new Map();
    const han = /\p{Script=Han}/u;
    const kata = /[\u30a1-\u30f6]/g;
    const kanaReading = text => String(text).normalize('NFKC').replace(kata,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
    const esc = text => text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    function register(kanji, reading, meaning='') {
        if (!kanji || !reading) return;
        kanji=String(kanji); reading=String(reading);
        const id=kanji+'\0'+reading;
        if (!entries.has(id)) entries.set(id,{kanji,reading,verb:/^to\s/.test(meaning)});
    }
    const basic = [['何時','なんじ'],['何曜日','なんようび'],['今日','きょう'],['日本人','にほんじん'],['一人','ひとり'],['看護婦','かんごふ'],['私','わたし'],['先生','せんせい'],['人','ひと'],['円','えん']];
    basic.forEach(e=>register(...e));
    ['スマホ','カバン','コーヒー','テレビ','サンドイッチ','ノート','ペン','ジーンズ','トレーナー','カラオケ','メアリー','ロバート'].forEach(k=>register(k,k));
    function cues(anchor) {
        const row=anchor?.closest('tr')||anchor?.closest('.drill-row');
        if (!row) return '';
        return [...row.querySelectorAll('.drill-cue-cell .target-word,.prompt-label .target-word,.drill-cue-cell select,.prompt-label select')].map(e=>e.tagName==='SELECT'?[...e.selectedOptions].map(o=>o.textContent).join(''):e.textContent).join(' ');
    }
    function stemEntries(list) {
        const result=[];
        for(const e of list){
            if(!han.test(e.kanji))continue;
            const compact=s=>kanaReading(s).replace(/[、。！？?.,\s]/g,'');
            const parts=compact(e.kanji).split(/(\p{Script=Han}+)/u),groups=[];
            let pattern='^';
            for(const part of parts){if(!part)continue;if(/^\p{Script=Han}+$/u.test(part)){groups.push(part);pattern+='(.+?)';}else pattern+=esc(kanaReading(part));}
            const match=compact(e.reading).match(new RegExp(pattern+'$','u'));
            if(!match)continue;
            let n=0;
            for(let i=0;i<parts.length;i++)if(/^\p{Script=Han}+$/u.test(parts[i]||'')){
                result.push({key:parts[i],value:match[++n],prefix:parts[i-1]||'',suffix:parts[i+1]||'',verb:e.verb});
            }
        }
        return result;
    }
    function format(raw, {mode='hiragana',anchor=null,context='',page=''}={}) {
        const original=String(raw??'');
        page=page||document.body.dataset.practice||location.pathname.match(/practice([\d.]+)\.html/)?.[1]||'';
        const lesson1=page==='1.1'||page==='1.2';
        const cue=cues(anchor);
        if(typeof Practice21!=='undefined')for(const o of Practice21.items)register(o.kanji,o.hira);
        if(typeof PracticeNext!=='undefined'){
            for(const o of PracticeNext.items)register(o.kanji,o.hira);
            for(const[k,r]of PracticeNext.readings)if(k!=='武'||/たけし/.test(cue+' '+context))register(k,r);
        }
        if(typeof customDict!=='undefined')for(const o of Object.values(customDict))register(o.kanji,o.hira);
        if(typeof practice2Data!=='undefined')for(const o of practice2Data){register(o.xKanji,o.x);register(o.yKanji,o.y);}
        if(typeof majorsData!=='undefined')for(const o of majorsData)register(o.kanji,o.word);
        const known=[...entries.values()];
        const hasShirt=/Tシャツ|Tしゃつ|ティーシャツ|てぃーしゃつ/i.test(cue);
        const major=page==='1.2'&&/専攻|せんこう/.test(cue+' '+context);
        let text=original;
        // Exact exceptions, not substrings of English or other Japanese words.
        text=text.replace(/(?<![A-Za-z])Form(?![A-Za-z])/g,'Form');
        text=text.replace(/(?<![ぁ-ゖァ-ヺA-Za-z])ふぉーむ(?=$|[はがをにでとのも、。！？?\s])/g,'Form');
        if(/ている(?:フォーム|Form)/.test(cue))text=text.replace(/ているふぉーむ(?=$|[はがをにでとのも、。！？?\s])/g,'ているForm');
        if(hasShirt)text=text.replace(/(^|[はがをにでとのもへ、。！？?\s])(?:Tシャツ|Tしゃつ|ティーシャツ|てぃーしゃつ)(?=$|[はがをにでとのもへ、。！？?\s])/g,(_,prefix)=>prefix+(lesson1&&mode==='hiragana'?'Tしゃつ':'Tシャツ'));
        if(lesson1&&mode==='hiragana')text=text.replace(/Tシャツ/g,'Tしゃつ');
        if(major&&mode==='kanji'){
            text=text.replace(/\p{Script=Han}+/gu,w=>/^(?:専攻|先行|選考|線香|閃光|潜行|千校|千項)$/.test(w)?'専攻':w);
            text=text.replace(/(^|[はがをにでとのもへ、。！？?\s])せんこう(?=$|[はがをにでとのもへ、。！？?\s])/g,(_,prefix)=>prefix+'専攻');
        }
        if(mode==='hiragana'){
            const stems=stemEntries(known);
            text=text.replace(/\p{Script=Han}+/gu,(word,offset,source)=>{
                if(major&&/^(?:専攻|先行|選考|線香|閃光|潜行|千校|千項)$/.test(word))return 'せんこう';
                if(word==='人'&&/[0-9０-９]$/.test(source.slice(0,offset)))return word;
                if(word==='何'){const after=source.slice(offset+word.length);return /^(?:ですか|の)/.test(after)?'なん':'なに';}
                const whole=known.filter(e=>e.kanji===word);
                const choices=whole.length?whole.map(e=>e.reading):stems.filter(e=>e.key===word&&(!e.prefix||source.slice(0,offset).endsWith(e.prefix))&&(!e.suffix||e.verb||source.slice(offset+word.length).startsWith(e.suffix))).map(e=>e.value);
                const values=[...new Set(choices)];
                return values.length===1?values[0]:word;
            });
            if(lesson1)text=text.replace(/[\uff66-\uff9f]+/g,s=>s.normalize('NFKC')).replace(kata,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
        }else{
            const allowed=known.filter(e=>cue.includes(e.kanji)||(!han.test(e.kanji)&&/[ァ-ヶ]/.test(e.kanji)&&!/^T/.test(e.kanji)));
            const permittedStems=stemEntries(known).filter(e=>cue.includes(e.key)).map(e=>({kanji:e.key,reading:e.value}));
            const grouped=new Map();
            for(const e of [...allowed,...permittedStems]) {
                const from=kanaReading(e.reading);
                if(!from||from===e.kanji)continue;
                if(!grouped.has(from))grouped.set(from,new Set());
                grouped.get(from).add(e.kanji);
            }
            const pairs=[...grouped].filter(([,values])=>values.size===1).map(([from,values])=>[from,[...values][0]]).sort((a,b)=>b[0].length-a[0].length);
            // Never convert a reading inside another word, or write an answer from its model.
            for(const[from,to]of pairs){
                const pattern=new RegExp('(^|[はがをにでとのもへ、。！？?\\s])('+esc(from)+')(?=$|[はがをにでとのもへ、。！？?\\s])','gu');
                text=text.replace(pattern,(_,prefix)=>prefix+to);
            }
        }
        return text;
    }
    // Reattach comparison marks to the original display characters. Grading stays normalized.
    function projectDiff(diff, displayed) {
        if (!diff || diff.chars.join('') === displayed) return diff;
        if (diff.chars.join('') !== displayed.normalize('NFKC')) return diff;
        const chars=Array.from(displayed), map=[], boundaries=[0];
        let originalOffset=0;
        for(const {segment} of new Intl.Segmenter('ja',{granularity:'grapheme'}).segment(displayed)) {
            const count=Array.from(segment).length;
            for(const c of Array.from(segment.normalize('NFKC'))) {
                map.push([originalOffset,originalOffset+count]);
                boundaries.push(originalOffset+count);
            }
            originalOffset+=count;
        }
        const result={...diff,chars};
        for(const key of ['red','redIndexes']) if(diff[key]) {
            result[key]=new Set();
            for(const i of diff[key]) for(let n=map[i]?.[0];n<map[i]?.[1];n++) result[key].add(n);
        }
        result.gaps=new Set([...diff.gaps].map(i=>boundaries[i]??chars.length));
        return result;
    }
    window.STTDisplay={register,format,projectDiff};
})();
