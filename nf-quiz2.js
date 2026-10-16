/* Note Friends — extra quizzes */
function genSF(cfg,src){
  if(cfg.mode==='sign'){
    const k=pickNot(['sharp','flat','natural'],src._last);src._last=k;
    return{visual:`<div class="symbig">${{sharp:SH,flat:FL,natural:NA}[k]}</div>`,prompt:'What does this sign mean?',
      options:[{html:'Go up (right)',correct:k==='sharp'},{html:'Go down (left)',correct:k==='flat'},{html:'Back to plain',correct:k==='natural'}],wrong:()=>'Hint: sharp pokes up, flat goes down.',
      reveal:()=>({say:k==='sharp'?`${SH} <span class="hl">Sharp</span>: one key to the right.`:k==='flat'?`${FL} <span class="hl">Flat</span>: one key to the left.`:`${NA} <span class="hl">Natural</span>: cancel it, play the plain key.`})};
  }
  const whites=[60,62,64,65,67,69,71],base=pickNot(whites,src._last);src._last=base;const L=midiLetter(base),acc=Math.random()<.5?'sharp':'flat',m=acc==='sharp'?base+1:base-1;
  return{visual:`<div class="target"><span>Find</span><span class="big" style="--nc:${COLOR[L]};font-size:48px;width:auto;padding:0 18px">${L}${acc==='sharp'?SH:FL}</span></div>`,prompt:`Tap the key for <span class="hl">${L} ${acc}</span>.`,
    custom(aEl,api){let marks={[base]:'color-mix(in srgb,var(--muted) 40%,var(--key))'};const draw=sh=>{aEl.innerHTML=`<div class="svgwrap">${keysSVG({from:27,to:36,marks,labels:true,shake:sh})}</div>`};draw();
      aEl.onpointerdown=e=>{const k=e.target.closest('[data-midi]');if(!k||api.locked())return;e.preventDefault();const t=+k.dataset.midi;tone(t);
        if(t===m){marks={[t]:acc==='sharp'?'var(--g)':'var(--a)'};draw();api.right(null,`Yes! ${L}${acc==='sharp'?SH:FL} is one key to the ${acc==='sharp'?'right':'left'} of ${L}.`)}
        else{draw(t);api.wrong(null,`Start on ${tag(L)} and move <span class="hl">one</span> key to the ${acc==='sharp'?'right':'left'}.`)}}}};
}
function genHW(cfg,src){
  const half=Math.random()<.5,a=pickNot([60,61,62,63,64,65,66,67,68,69,70],src._last);src._last=a;const b=a+(half?1:2);
  const vis=rev=>`<div class="svgwrap">${keysSVG({from:28,to:35,labels:true,marks:{[a]:'var(--star)',[b]:'var(--pink)',...(rev&&!half?{[a+1]:'color-mix(in srgb,var(--muted) 45%,var(--key))'}:{})}})}</div>`;
  return{visual:vis(false),play:()=>{tone(a,.6);tone(b,.8,.5)},prompt:'Half step or whole step?',
    options:[{html:'Half step',correct:half},{html:'Whole step',correct:!half}],wrong:()=>'Look for a key in between the two coloured keys.',
    reveal:()=>({visual:vis(true),say:half?'A <span class="hl">half step</span>: next-door neighbours, nothing in between.':'A <span class="hl">whole step</span>: one key hiding in between.'})};
}
QUIZ.splice(QUIZ.length-1,0,
  {id:'sf',name:'Sharp, Flat or Natural?',lead:'Read the sign, or find the sharp or flat key.',c:'var(--a)',ic:'♯♭',flash:true,opts:[{k:'mode',l:'Mode',c:[['sign','What does it mean?'],['key','Find the key']],d:'sign'}],gen:genSF},
  {id:'hw',name:'Half or Whole Step?',lead:'Next-door neighbours, or one key in between?',c:'var(--f)',ic:'½ 1',flash:true,gen:genHW});
QBY.sf=QUIZ.find(q=>q.id==='sf');QBY.hw=QUIZ.find(q=>q.id==='hw');
