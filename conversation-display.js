// Shared display-only roles, people and visual targets. Audio and grading stay page-owned.
window.ConversationDisplay = (() => {
    const names={X:'A',Y:'B',Z:'C'};
    const imageSelector='.p21-distance-person[data-person],.p2x-person[data-person],.p23-city-person';
    const lineSelector='[data-model-speaker],.p21-which-model-line,.p22-conversation-line';
    let observer;
    function person(name) {
        const e=document.createElement('span');e.className='conversation-person';
        if(document.body.dataset.practice==='2.2')e.classList.add('p22-person-badge');
        e.dataset.person=names[name];e.textContent=name;return e;
    }
    function format() {
        document.querySelectorAll(imageSelector).forEach(e=>{
            if(!e.dataset.person)e.dataset.person=({A:'A',B:'B',far:'C'})[e.closest('[data-zone]')?.dataset.zone];
            e.classList.add('conversation-person');e.dataset.conversationImage='true';
        });
        const selectors='.p21-speaker-practice .drill-number-cell,.p2x-dialogue-example > p > strong,.example-label-title,.drill-cue-cell > strong,.prompt-label > strong,.p21-model-line > strong,.p21-which-model-line > strong,.p23-model-speaker,.p2x-speaker-group > h3';
        document.querySelectorAll(selectors).forEach(label=>{
            if(label.dataset.conversationLabel||label.classList.contains('conversation-role')||label.classList.contains('conversation-person')||label.closest('[data-conversation-image]'))return;
            const text=label.textContent.trim();
            let pair=text.match(/^([XYZ]) · ([QA]):$/);const role=text.match(/^([QA]):?$/),name=text.match(/^([XYZ])[:：]?$/);
            const part=label.closest(lineSelector)?.dataset.part||label.closest(lineSelector)?.dataset.conversationRole;
            if(name&&['question','response','answer'].includes(part))pair=[text,name[1],part==='question'?'Q':'A'];
            if(pair||role){
                label.classList.add('conversation-role');
                if(document.body.dataset.practice==='2.2')label.classList.add('p22-conversation-role');
                const circle=document.createElement('span');circle.className='conversation-role-circle';
                if(document.body.dataset.practice==='2.2')circle.classList.add('p22-role-circle');
                circle.textContent=pair?pair[2]:role[1];circle.setAttribute('aria-label',circle.textContent==='Q'?'Question':'Answer');
                label.replaceChildren(circle);if(pair)label.append(person(pair[1]));
            }else if(name){
                if(label.tagName==='TD'){label.dataset.conversationLabel='true';label.replaceChildren(person(name[1]));return;}
                label.classList.add('conversation-person');label.dataset.person=names[name[1]];label.textContent=name[1];
                if(document.body.dataset.practice==='2.2')label.classList.add('p22-person-badge');
            }
        });
        observer?.takeRecords();
    }
    function syncTargets({key,row,control,picture}) {
        const source=key?row:control?.closest('tr')||control;
        const policy=source?.dataset.targetPolicy;
        const active=Boolean(key||control)&&policy==='answer';
        const zone=source?.dataset.targetZone||source?.dataset.zone;
        const owner=source?.dataset.targetOwner;
        document.querySelectorAll('[data-wh-targets]').forEach(scene=>{
            if(scene===picture&&source&&!policy)return; // A mixed scene may also ask この/その/あの questions.
            scene.querySelectorAll('.p2x-object,.p2x-person-target,.p2x-umbrella-target,.p21-drill-item').forEach(target=>{
                const matches=owner?target.dataset.owner===owner:target.dataset.zone===zone;
                target.classList.toggle('is-target',active&&scene===picture&&Boolean(matches));
            });
        });
    }
    function syncSpeaker(state) {
        format();const {key,row,control,picture,who}=state;
        document.querySelectorAll('.conversation-person:not([data-conversation-image])').forEach(e=>{
            const group=e.closest('.p2x-speaker-group'),card=e.closest('.p21-speaker-practice'),line=e.closest(lineSelector),owner=e.closest('tr');
            let active=false;
            if(key||control){
                if(card)active=card===row?.closest('.p21-speaker-practice');
                else if(owner)active=owner===row;
                else if(group)active=group.closest('.example-box')?.querySelector('.p2x-picture')===picture;
                else if(line){
                    const current=control?.closest(lineSelector);
                    active=current?(line===current||(!current.querySelector('.conversation-person')&&line===current.previousElementSibling&&line.dataset.modelSpeaker===current.dataset.modelSpeaker)):line.closest('.example-box')?.querySelector('.p21-distance-board,.p21-drill-picture,.p2x-picture,.p23-city-picture')===picture;
                    if(!current&&line.dataset.object)active=active&&line.dataset.object===control?.dataset.object;
                    if(!current&&line.dataset.part)active=active&&line.dataset.part===control?.dataset.part;
                    if(!current&&line.dataset.zone)active=active&&line.dataset.zone===control?.dataset.zone;
                }
            }
            e.classList.toggle('is-speaking',active&&e.dataset.person===who);
        });
        syncTargets(state);
    }
    observer=new MutationObserver(()=>format());
    function install(){format();observer.observe(document.body,{childList:true,subtree:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
    return Object.freeze({format,syncSpeaker});
})();
