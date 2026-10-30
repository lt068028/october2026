// Lesson 2.1 visual content; all coordinates describe relationships, never screen-left answers.
const Practice21 = (() => {
    const items = [
        {id:1,hira:'ほん',kanji:'本',romaji:'hon',meaning:'book',zone:'A',kind:'book'},
        {id:2,hira:'ペン',kanji:'ペン',romaji:'pen',meaning:'pen',zone:'A',kind:'pen'},
        {id:3,hira:'かばん',kanji:'カバン',romaji:'kaban',meaning:'bag',zone:'B',kind:'bag'},
        {id:4,hira:'さいふ',kanji:'財布',romaji:'saifu',meaning:'wallet',zone:'B',kind:'wallet'},
        {id:5,hira:'かさ',kanji:'傘',romaji:'kasa',meaning:'umbrella',zone:'far',kind:'umbrella'},
        {id:6,hira:'とけい',kanji:'時計',romaji:'tokei',meaning:'clock',zone:'far',kind:'clock'},
        {id:7,hira:'ぼうし',kanji:'帽子',romaji:'bōshi',meaning:'hat',kind:'hat'},
        {id:8,hira:'ノート',kanji:'ノート',romaji:'nōto',meaning:'notebook',kind:'notebook'},
        {id:9,hira:'じしょ',kanji:'辞書',romaji:'jisho',meaning:'dictionary',kind:'dictionary'},
        {id:10,hira:'しんぶん',kanji:'新聞',romaji:'shinbun',meaning:'newspaper',kind:'newspaper'},
        {id:11,hira:'Tシャツ',kanji:'Tシャツ',romaji:'tīshatsu',meaning:'T-shirt',kind:'tshirt'},
        {id:12,hira:'スマホ',kanji:'スマホ',romaji:'sumaho',meaning:'smartphone',kind:'phone'},
        {id:13,hira:'えんぴつ',kanji:'鉛筆',romaji:'enpitsu',meaning:'pencil',kind:'pencil'},
        {id:14,hira:'おにぎり',kanji:'おにぎり',romaji:'onigiri',meaning:'rice ball',kind:'onigiri'},
        {id:15,hira:'おべんとう',kanji:'お弁当',romaji:'obentō',meaning:'boxed lunch',kind:'bento'},
        {id:16,hira:'サンドイッチ',kanji:'サンドイッチ',romaji:'sandoitchi',meaning:'sandwich',kind:'sandwich'},
        {id:17,hira:'くつ',kanji:'靴',romaji:'kutsu',meaning:'shoes',kind:'shoes'},
        {id:18,hira:'ジーンズ',kanji:'ジーンズ',romaji:'jīnzu',meaning:'jeans',kind:'jeans'},
        {id:19,hira:'トレーナー',kanji:'トレーナー',romaji:'torēnā',meaning:'sweatshirt',kind:'sweatshirt'}
    ];
    const variants = item => ['A','B','far'].map((zone,i)=>({...item,id:i+1,zone,color:['#e76f51','#4f86c6','#55a66b'][(i+item.id)%3]}));
    const shuffle = values => {
        const result=[...values];
        for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
        return result;
    };
    const targets=shuffle([1,2,3,1,2,3]);
    const tasks3=shuffle(items).map((item,i)=>({item,target:targets[i]}));
    const pronoun = (speaker,zone) => zone==='far'?'あれ':speaker===zone?'これ':'それ';
    const positions={A:[[180,218],[270,218]],B:[[490,218],[580,218]],far:[[315,95],[425,95]]};
    function icon(o) {
        const color=o.color||'#d7a855';
        const shapes={
            book:`<path d="M-26-22H22V22H-26Z" fill="${o.color||'#4f86c6'}"/><path d="M-19-22V22M-14-14H14M-14-6H14"/>`,
            pen:`<g transform="rotate(35)"><rect x="-7" y="-27" width="14" height="40" rx="4" fill="${color}"/><path d="M-7 8H7L0 29Z" fill="#bcc5d3"/><path d="M0 29V34M-3-23V-7H-10"/></g>`,
            bag:`<rect x="-27" y="-10" width="54" height="38" rx="5" fill="${color}"/><path d="M-13-10V-18Q0-36 13-18V-10"/>`,
            wallet:`<rect x="-30" y="-18" width="60" height="38" rx="5" fill="${color}"/><path d="M6-7H30V12H6Z" fill="#e5ba8e"/>`,
            umbrella:`<path d="M-34 0Q0-52 34 0Z" fill="${color}"/><path d="M0 0V24Q0 38 14 25M-34 0H34"/>`,
            clock:`<circle r="28" fill="#fff" stroke="${color}" stroke-width="6"/><path d="M0-18V0L13 8M0-25V-21M25 0H21M0 25V21M-25 0H-21"/>`
        };
        return `<g class="p21-drawing" stroke="#25364a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${shapes[o.kind]}</g>`;
    }
    let serial=0;
    function scene(objects=items,speaker='A',target=null) {
        const titleId=`p21-scene-${++serial}`;
        const counts={A:0,B:0,far:0};
        const marks=objects.map(o=>{
            const [x,y]=positions[o.zone][counts[o.zone]++];
            return `<g class="p21-object${o.id===target?' is-target':''}" data-object="${o.id}" transform="translate(${x} ${y})"><rect class="p21-object-frame" x="-43" y="-44" width="86" height="101" rx="9"/>${icon(o)}<text y="49" text-anchor="middle">Object ${o.id}</text></g>`;
        }).join('');
        return `<svg class="p21-scene" viewBox="0 0 760 320" role="img" aria-labelledby="${titleId}"><title id="${titleId}">X and Y face each other. Objects near each person and a shelf far from both.${objects.map(o=>` Object ${o.id}: ${o.meaning}, ${o.zone==='far'?'far from both':'near '+SpeakerGuide.name(o.zone)}.`).join('')}${speaker?' Speaker '+SpeakerGuide.name(speaker)+'.':''}${target?' Target Object '+target+'.':''}</title><rect class="p21-room" x="2" y="2" width="756" height="316" rx="12"/><rect class="p21-far" x="220" y="20" width="320" height="138" rx="12"/><text x="380" y="43" text-anchor="middle">Far from X and Y</text><rect class="p21-person-zone" x="28" y="163" width="290" height="143" rx="16"/><rect class="p21-person-zone" x="442" y="163" width="290" height="143" rx="16"/><path class="p21-facing" d="M102 240H130M126 233L134 240L126 247M658 240H630M634 233L626 240L634 247"/>${['A','B'].map((p,i)=>`<g class="p21-person${p===speaker?' is-speaker':''}" transform="translate(${i?690:70} 215)"><circle r="26"/><text y="7" text-anchor="middle">${SpeakerGuide.name(p)}</text><text class="p21-speaking-label" y="57" text-anchor="middle">Speaking</text><text class="p21-listening-label" y="57" text-anchor="middle">Listening</text></g>`).join('')}${marks}</svg>`;
    }
    function refreshTargets() {
        document.querySelectorAll('.practice21-page .recording-table tr[data-speaker], .practice21-page .drill-example-table tr[data-speaker]').forEach(row=>{
            row.addEventListener('pointerenter',()=>highlight(row));
            row.addEventListener('focusin',()=>highlight(row));
        });
    }
    function highlight(row) {
        const section=row.closest('[id$="Container"]');
        const root=row.closest('.example-box, .drill-row')||section;
        const svg=root.querySelector('.p21-example-diagram svg, .p21-drill-scene svg');
        if(!svg)return;
        svg.querySelectorAll('.p21-object').forEach(o=>o.classList.toggle('is-target',o.dataset.object===row.dataset.object));
        svg.querySelectorAll('.p21-person').forEach(p=>{
            const selected=p.querySelector('text').textContent===SpeakerGuide.name(row.dataset.speaker);
            p.classList.toggle('is-speaker',selected);
        });
        const title=svg.querySelector('title');
        title.textContent=title.textContent.replace(/ Speaker [XY]\./,` Speaker ${SpeakerGuide.name(row.dataset.speaker)}.`).replace(/ Target Object \d+\./,` Target Object ${row.dataset.object}.`);
        root.querySelector('.p21-scene-context').textContent=`Speaker ${SpeakerGuide.name(row.dataset.speaker)} → Object ${row.dataset.object}`;
    }
    return {items,variants,tasks3,scene,pronoun,refreshTargets,icon};
})();
