/* Preview-only color selector; preserves Practice 2.1 SVG and wrapping logic. */
(() => {
 const root=document.body;
 if(!root.classList.contains('p21-keep-going-preview')) return;
 const header=document.querySelector('.main-header');
 if(!header) return;
 const section=document.createElement('section');
 section.className='p21-keep-color-picker';
 section.setAttribute('aria-label','Keep going color comparison');
 const title=document.createElement('strong');title.textContent='Keep going! — C / E / F color preview';
 const options=document.createElement('div');options.className='p21-color-options';
 const colors=[['C','Blue','#3978B5'],['E','Orange','#B47732'],['F','Teal','#159C92']];
 const buttons=[];
 const choose=id=>{root.dataset.keepColor=id;buttons.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.color===id)));};
 colors.forEach(([id,label,color])=>{
  const btn=document.createElement('button');btn.type='button';btn.dataset.color=id;
  const swatch=document.createElement('span');swatch.className='p21-swatch';swatch.style.setProperty('--swatch',color);swatch.setAttribute('aria-hidden','true');
  btn.append(swatch,document.createTextNode(id+' · '+label+' ('+color+')'));
  btn.addEventListener('click',()=>choose(id));buttons.push(btn);options.append(btn);
 });
 const note=document.createElement('small');note.className='p21-note';note.textContent='Only the SVG fire and Keep going! text color changes. The original placement and wrapping remain unchanged.';
 section.append(title,options,note);header.insertAdjacentElement('afterend',section);choose('E');
})();
