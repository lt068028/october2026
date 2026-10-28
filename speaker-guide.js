// One state and animation policy for the Lesson 2 speaker guides.
window.SpeakerGuide = Object.freeze({
    init(guide) {
        guide.replaceChildren();
        const prompt=document.createElement('span'),speaker=document.createElement('strong');
        prompt.textContent='Who is speaking?';speaker.className='p21-current-speaker';speaker.hidden=true;
        guide.append(prompt,speaker);guide.setAttribute('role','status');guide.setAttribute('aria-live','polite');
    },
    reset(guide) {
        if(!guide)return;
        guide.getAnimations().forEach(animation=>animation.cancel());
        const prompt=guide.querySelector('span'),label=guide.querySelector('.p21-current-speaker');
        if(prompt){prompt.textContent='Who is speaking?';prompt.hidden=false;}
        if(label){label.textContent='';label.hidden=true;}
        delete guide.dataset.speaker;guide.classList.remove('is-emphasized');
        guide.closest('.p21-distance-board,.p2x-picture,.p21-drill-picture')?.querySelectorAll('[data-person]').forEach(e=>e.classList.remove('is-speaker'));
    },
    play(guide,who) {
        if(!guide?.isConnected||!['A','B'].includes(who))return;
        guide.dataset.speaker=who;
        guide.querySelector('span').textContent='';guide.querySelector('span').hidden=true;
        const label=guide.querySelector('.p21-current-speaker');label.hidden=false;label.textContent=`${who} is speaking`;
        guide.classList.add('is-emphasized');guide.getAnimations().forEach(animation=>animation.cancel());
        const normal={backgroundColor:'#fff5f5'},active={backgroundColor:'#fecaca'};
        const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
        guide.animate(reduced?[active,active]:[normal,active,normal],{duration:1200,iterations:Infinity,easing:'ease-in-out'});
        const scene=guide.closest('.p21-distance-board,.p2x-picture,.p21-drill-picture');
        scene?.querySelectorAll('[data-person]').forEach(e=>e.classList.toggle('is-speaker',e.dataset.person===who));
    }
});
