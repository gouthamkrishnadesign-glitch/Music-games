/* Note Friends — Quiz Zone */
let sayOut=store.get('nf-out',false);
const QI=t=>`<svg viewBox="0 0 34 34" aria-hidden="true"><text x="17" y="24" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="${t.length>2?13:19}" fill="var(--dark)">${t}</text></svg>`;
const QUIZ=[
  {id:'ls',name:'Line or Space?',lead:'Is the note on a line or in a space? Which number?',c:'var(--e)',ic:'L S',flash:true,opts:[{k:'lvl',l:'Practice',c:[['lines','Lines only'],['spaces','Spaces only'],['both','Both']],d:'lines'},{k:'nums',l:'Helper numbers',c:[['off','Off'],['on','On']],d:'off'}],gen:genLS},
  {id:'nn',name:'Name the Note',lead:'Read the note in the treble or bass house and say its letter.',c:'var(--g)',ic:'A?',flash:true,opts:[{k:'clef',l:'House',c:[['treble','Treble'],['bass','Bass'],['both','Both']],d:'treble'},{k:'range',l:'Notes',c:[['near','Near Middle C'],['all','Whole house']],d:'near'}],gen:genNN},
  {id:'ph',name:'Piano Hunt',lead:'Find the key on the piano!',c:'var(--pink)',ic:'♪',opts:[{k:'help',l:'Letter helpers',c:[['off','Off'],['on','On']],d:'off'}],gen:genPH},
  {id:'wm',name:"Who's Missing?",lead:'One note friend ran away. Who is missing from the line?',c:'var(--b)',ic:'C?E',opts:[{k:'lvl',l:'Level',c:[['easy','Start at C'],['tricky','Start anywhere']],d:'easy'}],gen:genWM},
  {id:'beats',name:'How Many Beats?',lead:'How long does this note or rest last?',c:'var(--d)',ic:'1234',flash:true,opts:[{k:'what',l:'Use',c:[['notes','Notes'],['both','Notes & rests']],d:'notes'}],gen:genBeats},
  {id:'which',name:'Spot the Shape',lead:'Find the note or rest that matches the name.',c:'var(--a)',ic:'♩?',opts:[{k:'what',l:'Use',c:[['notes','Notes'],['rests','Rests']],d:'notes'}],gen:genWhich},
  {id:'hl',name:'Higher or Lower?',lead:'Listen carefully. Does the second sound go up or down?',c:'var(--g)',ic:'↑↓',flash:true,opts:[{k:'lvl',l:'Level',c:[['easy','Big jumps'],['tricky','Small steps']],d:'easy'}],gen:genHL},
  {id:'ss',name:'Step, Skip or Same?',lead:'Look at the two notes. Is it a step, a skip, or the same note?',c:'var(--f)',ic:'S S',flash:true,gen:genSS},
  {id:'ts',name:'Tie or Slur?',lead:'Same notes joined, or different notes joined?',c:'var(--pink)',ic:'⌒',flash:true,gen:genTS},
  {id:'dyn',name:'Loud or Soft?',lead:'Read the sign or listen. Mouse or lion?',c:'var(--c)',ic:'p f',flash:true,opts:[{k:'mode',l:'Mode',c:[['read','Read the sign'],['hear','Listen']],d:'read'}],gen:genDyn},
  {id:'fill',name:'Fill the Box',lead:'Each box needs 4 beats. Which note fills the gap?',c:'var(--e)',ic:'[?]',gen:genFill},
  {id:'echo',name:'Rhythm Detective',lead:'Listen to the rhythm. Which card did you hear?',c:'var(--d)',ic:'ta',gen:genEcho},
  {id:'all',name:'Super Star Mix',lead:'A bit of everything! How many stars can you catch?',c:'var(--star)',ic:'★',wide:true,flash:true},
];
const QBY=Object.fromEntries(QUIZ.map(q=>[q.id,q]));
const cfgOf=qz=>{const c={};(qz.opts||[]).forEach(o=>c[o.k]=store.get(`nf-q-${qz.id}-${o.k}`,o.d));return c};
const defOf=qz=>{const c={};(qz.opts||[]).forEach(o=>c[o.k]=o.d);return c};
let trophies=store.get('nf-trophies',{});

function openQuiz(root,qz){
  const cfg=cfgOf(qz);
  root.innerHTML=`<div class="head"><div class="eyebrow"><span class="unitchip" style="--uc:${qz.c}">Quiz Zone</span><span>Get 5 stars to win a trophy</span></div><h2>${qz.name}</h2><p class="lead">${qz.lead}</p></div>
  <div class="panel qpanel"><div class="gamebar"><div class="row">${(qz.opts||[]).map(o=>chipGroup(o.l,o.c,cfg[o.k])).join('')}${qz.flash?`<span class="lbl">Answer by</span><button class="chip" data-mode="tap" aria-pressed="${!sayOut}">Tapping</button><button class="chip" data-mode="out" aria-pressed="${sayOut}">Saying it out loud</button>`:''}</div><div class="row"><span class="streak" id="streak"></span><div class="stars" id="stars"></div></div></div>
  <div class="qv" id="qv"></div><div class="say" id="say"></div><div id="qa"></div></div>
  ${teacher(['<em>Saying it out loud</em>: the child answers aloud, you press <em>Show answer</em>, then <em>Got it</em> or <em>Not yet</em>. Great for quick-fire practice.','A wrong tap never takes a star away. It wiggles, and the child tries again.','5 stars = a trophy and a party. Trophies are counted in the Quiz Zone.'])}`;
  (qz.opts||[]).forEach(o=>bindChips(root,o.l,v=>{store.set(`nf-q-${qz.id}-${o.k}`,v);openQuiz(root,qz)}));
  $$('[data-mode]',root).forEach(b=>b.onclick=()=>{sayOut=b.dataset.mode==='out';store.set('nf-out',sayOut);openQuiz(root,qz)});
  const vEl=$('#qv',root),sayEl=$('#say',root),aEl=$('#qa',root),stEl=$('#stars',root),skEl=$('#streak',root);
  let n=0,streak=0,q=null,lock=false;
  const paint=pop=>{stEl.innerHTML=[0,1,2,3,4].map(i=>starSVG(i<n?(pop&&i===n-1?'on pop':'on'):'off')).join('');skEl.innerHTML=streak>=2?`${ICON.flame}${streak} in a row!`:''};paint();
  function win(r={}){n++;addStar();paint(true);yay();if(r.sound)setTimeout(r.sound,450);
    if(n>=5){trophies[qz.id]=(trophies[qz.id]||0)+1;store.set('nf-trophies',trophies);renderSide();setTimeout(()=>party('You did it!',`Five stars in ${qz.name}. Here is a trophy!`,()=>{n=0;paint();next()}),r.wait||1300)}
    else setTimeout(()=>{if(q&&q._live)next()},r.wait||1500)}
  const api={locked:()=>lock,
    right(el,msg){if(lock)return;lock=true;streak++;const r=q.reveal?q.reveal():{};if(r.visual!=null)vEl.innerHTML=r.visual;say(sayEl,r.say||msg||'Yes!');if(el){el.classList.add('right');burst(el)}else burst(vEl,24);$$('.ans',aEl).forEach(b=>b.disabled=true);win(r)},
    wrong(el,msg){streak=0;paint();if(el)el.classList.add('wrong');oops();say(sayEl,msg||'Try again!')}};
  function next(){
    cancelRuns();if(q)q._live=false;lock=false;aEl.onpointerdown=null;
    const src=qz.id==='all'?QUIZ.filter(x=>x.id!=='all')[rnd(QUIZ.length-1)]:qz;
    q=src.gen(src===qz?cfg:defOf(src),src);q.src=src;q._live=true;
    vEl.innerHTML=q.visual;
    say(sayEl,(qz.id==='all'?`<span class="from">${src.name}</span> `:'')+q.prompt+(q.play?` <button class="btn small" id="again">${ICON.speaker} Hear it again</button>`:''));
    if(q.play){$('#again',sayEl).onclick=q.play;const me=q;setTimeout(()=>{if(me._live)me.play()},400)}
    if(q.after)q.after(vEl);
    if(sayOut&&src.flash&&!q.noFlash&&!q.custom){
      aEl.innerHTML=`<div class="flash"><button class="btn primary" id="rv">Show answer</button><button class="btn" id="skip">Skip</button></div>`;
      $('#skip',aEl).onclick=next;
      $('#rv',aEl).onclick=()=>{const r=q.reveal?q.reveal():{};if(r.visual!=null)vEl.innerHTML=r.visual;say(sayEl,r.say||'');r.sound&&r.sound();
        aEl.innerHTML=`<div class="flash"><button class="btn primary" id="got">${starSVG()} Got it!</button><button class="btn" id="not">Not yet</button></div>`;
        const gs=$('#got svg',aEl);gs.style.fill='var(--dark)';
        $('#got',aEl).onclick=e=>{if(lock)return;lock=true;streak++;burst(e.currentTarget);win({wait:900})};
        $('#not',aEl).onclick=()=>{streak=0;paint();next()}};
      return;
    }
    if(q.custom){q.custom(aEl,api);return}
    const groups={};q.options.forEach((o,i)=>{(groups[o.group||'']=groups[o.group||'']||[]).push([o,i])});
    aEl.innerHTML=Object.entries(groups).map(([g,arr])=>`<div class="ansrow">${g?`<span class="lbl">${g}</span>`:''}${arr.map(([o,i])=>`<button class="ans ${o.cls||''}" style="${o.style||''}" data-k="${i}"${o.aria?` aria-label="${o.aria}"`:''}>${o.html}</button>`).join('')}</div>`).join('');
    $$('.ans',aEl).forEach(b=>b.onclick=()=>{if(lock)return;const o=q.options[+b.dataset.k];o.correct?api.right(b):api.wrong(b,q.wrong?q.wrong(o):'Try again!')});
  }
  next();
}

/* ---------- generators ---------- */
const letterOpts=(L,list=LETTERS)=>list.map(x=>({html:x,cls:'letter',style:`--nc:${COLOR[x]}`,correct:x===L}));
function genLS(cfg,src){
  const b=30,pool=[];for(let p=0;p<=8;p++){if(cfg.lvl==='lines'&&p%2)continue;if(cfg.lvl==='spaces'&&!(p%2))continue;pool.push(b+p)}
  const d=pickNot(pool,src._last);src._last=d;const dur=['w','h','q'][rnd(3)],pi=posInfo(d,b),col=pi.kind==='line'?'var(--e)':'var(--a)';
  const vis=rev=>`<div class="svgwrap">${engrave({clef:null,lineNums:cfg.nums==='on',items:[{type:'note',d,dur,x:430,color:rev?col:undefined,cls:'pop'}],litLines:rev&&pi.kind==='line'?[pi.n]:null,glowSpaces:rev&&pi.kind==='space'?[d]:null})}</div>`;
  const options=[];
  if(cfg.lvl!=='spaces')for(let k=1;k<=5;k++)options.push({group:'On a line',html:k,cls:'line',correct:pi.kind==='line'&&pi.n===k});
  if(cfg.lvl!=='lines')for(let k=1;k<=4;k++)options.push({group:'In a space',html:k,cls:'space',correct:pi.kind==='space'&&pi.n===k});
  return{visual:vis(false),prompt:'Where does this note live?',options,wrong:()=>'Almost! Count up from the bottom line.',
    reveal:()=>({visual:vis(true),say:pi.kind==='line'?`Yes! On <span class="hl">Line ${pi.n}</span>. The line goes through its middle.`:`Yes! In <span style="color:var(--a)">Space ${pi.n}</span>, snug between two lines.`,sound:()=>tone(dMidi(d))})};
}
function genNN(cfg,src){
  const clef=cfg.clef==='both'?(Math.random()<.5?'treble':'bass'):cfg.clef;
  const [lo,hi]=clef==='treble'?(cfg.range==='near'?[28,32]:[28,39]):(cfg.range==='near'?[24,28]:[17,28]);
  const pool=[];for(let d=lo;d<=hi;d++)pool.push(d);const d=pickNot(pool,src._last);src._last=d;
  const L=dLetter(d),dur=['w','h','q'][rnd(3)];
  const vis=rev=>`<div class="svgwrap">${engrave({clef,items:[{type:'note',d,dur,x:450,color:rev?COLOR[L]:undefined,letter:rev?L:'',cls:'pop'}]})}</div>`;
  return{visual:vis(false),prompt:`What is this note called? <span class="muted">(${clef} clef)</span>`,options:letterOpts(L),wrong:o=>`Not ${o.html}. Try another friend!`,
    reveal:()=>({visual:vis(true),say:`${tag(L)} It is <span style="color:${COLOR[L]}">${L}</span>${d===MC?', Middle C!':''}. It sits ${posInfo(d,CLEF[clef].bottom).text}.`,sound:()=>tone(dMidi(d))})};
}
function genPH(cfg,src){
  const t=Math.random()<.18?'MC':pickNot(LETTERS,src._last);src._last=t;const L=t==='MC'?'C':t;
  const hint=t==='MC'?'Hint: find the twins in the middle. C is just left of them.':t==='C'?'Hint: C lives just left of the twins.':t==='F'?'Hint: F lives just left of the triplets.':t==='D'?'Hint: D sits between the twins.':'Tap a key. Any key with this name wins!';
  return{visual:`<div class="target"><span>Find ${t==='MC'?'<span class="hl">Middle C</span>':'a'}</span><span class="big" style="--nc:${COLOR[L]}">${L}</span><span>on the piano!</span></div>`,prompt:hint,
    custom(aEl,api){const R={from:21,to:35};let marks={};const draw=sh=>{aEl.innerHTML=`<div class="svgwrap">${keysSVG({...R,labels:cfg.help==='on',marks,shake:sh})}</div>`};draw();
      aEl.onpointerdown=e=>{const k=e.target.closest('[data-midi]');if(!k||api.locked())return;e.preventDefault();const m=+k.dataset.midi;tone(m);const KL=midiLetter(m),ok=t==='MC'?m===60:KL===t;
        if(ok){marks={[m]:COLOR[KL]};draw();api.right(null,`${tag(KL)} You found ${t==='MC'?'Middle C':KL}!`)}else{draw(m);api.wrong(null,KL?(t==='MC'&&KL==='C'?'That is a C, but not the middle one. Try again!':`That is ${tag(KL)}. Try again!`):'That is a black key. Look for a white one!')}}}};
}
function genWM(cfg){
  const start=cfg.lvl==='easy'?0:rnd(7),seq=Array.from({length:7},(_,i)=>LETTERS[(start+i)%7]),miss=cfg.lvl==='easy'?1+rnd(6):rnd(7),M=seq[miss];
  const paint=fill=>`<div class="slots">${seq.map((L,i)=>i===miss&&!fill?'<span class="slot q">?</span>':`<span class="slot" style="--nc:${COLOR[L]}">${L}</span>`).join('')}</div>`;
  return{visual:paint(false),prompt:'One friend ran away! Who is missing?',options:letterOpts(M,shuffle([M,...shuffle(LETTERS.filter(x=>x!==M)).slice(0,2)])),wrong:o=>`${o.html} is already in the line. Try again!`,
    reveal:()=>({visual:paint(true),say:`${tag(M)} Yes, ${M} came home!`,sound:()=>run(async g=>{for(let i=0;i<7;i++){if(g())return;const k=LETTERS.indexOf(seq[i]);tone(60+SEMI[k]+(k<start?12:0),.5);await wait(120)}})})};
}
function genBeats(cfg,src){
  const pool=[['n','w'],['n','h'],['n','q'],['n','hd']];if(cfg.what==='both')pool.push(['r','w'],['r','h'],['r','q']);
  const [k,dur]=pickNot(pool,src._last);src._last=[k,dur];const ans=DUR[dur];
  const item=k==='n'?{type:'note',d:31,dur,color:'var(--g)'}:{type:'rest',dur,color:'var(--g)'};
  return{visual:`<div style="max-width:260px;margin:0 auto;width:100%">${mini(item,240)}</div>`,prompt:k==='n'?'How many beats does this note get?':'How many quiet beats is this rest?',
    options:[1,2,3,4].map(x=>({html:x,correct:x===ans})),wrong:()=>'Not quite. Look at the shape again!',
    reveal:()=>({say:k==='n'?`A <span class="hl">${NAME[dur]}</span> gets ${ans} beat${ans>1?'s':''}: “${SYL[dur]}”.`:`A <span class="hl">${RNAME[dur]}</span> is ${ans} quiet beat${ans>1?'s':''}. Shh!`,
      sound:()=>run(async g=>{if(k==='n')tone(67,ans*.6+.2);for(let i=0;i<ans;i++){if(g())return;click(i===0);await wait(600)}}),wait:1500+ans*500})};
}
function genWhich(cfg,src){
  const R=cfg.what==='rests',pool=R?['w','h','q']:['w','h','q','e'],t=pickNot(pool,src._last);src._last=t;
  const DS=R?{w:'it hangs down from Line 4. 4 quiet beats.',h:'it sits on Line 3 like a hat. 2 quiet beats.',q:'a zig-zag squiggle. 1 quiet beat.'}:{w:'an empty oval with no stem. 4 beats.',h:'an empty oval with a stem. 2 beats.',q:'a filled oval with a stem. 1 beat.',e:'a filled oval with a stem and a flag. Half a beat.'};
  const opts=shuffle([t,...shuffle(pool.filter(x=>x!==t)).slice(0,2)]),nm=R?RNAME[t]:NAME[t];
  return{visual:`<div class="target">Find the <span class="hl">${nm}</span></div>`,prompt:'Tap the matching picture.',
    options:opts.map(x=>({html:mini(R?{type:'rest',dur:x}:{type:'note',d:31,dur:x},150),cls:'pic',correct:x===t,aria:R?RNAME[x]:NAME[x]})),
    wrong:o=>'Not that one. Look closely!',reveal:()=>({say:`Yes! The <span class="hl">${nm}</span>: ${DS[t]}`})};
}
function genHL(cfg){
  const k=cfg.lvl==='easy'?4+rnd(4):1+rnd(2),up=Math.random()<.5,d1=up?24+rnd(8):30+rnd(8),d2=up?d1+k:d1-k,m1=dMidi(d1),m2=dMidi(d2);
  const play=()=>{tone(m1,1);tone(m2,1.2,.85)};
  const from=Math.min(d1,d2)-2,to=Math.max(d1,d2)+2;
  return{visual:`<div class="soundpair"><button class="sbtn" data-m="${m1}">${ICON.speaker}<span>Sound 1</span></button><span class="lbl">then</span><button class="sbtn" data-m="${m2}">${ICON.speaker}<span>Sound 2</span></button></div>`,
    after:v=>$$('.sbtn',v).forEach(b=>b.onclick=()=>tone(+b.dataset.m,1.1)),play,prompt:'Is Sound 2 higher or lower?',
    options:[{html:`${critter('bird','sm')}Higher`,cls:'pic',correct:up},{html:`${critter('bear','sm')}Lower`,cls:'pic',correct:!up}],wrong:()=>'Listen again! Press the sound buttons.',
    reveal:()=>({visual:`<div class="svgwrap">${keysSVG({from,to,marks:{[m1]:'var(--a)',[m2]:'var(--star)'},labels:true})}</div>`,say:up?'It went <span class="hl">up</span>! Higher, like a bird, and to the right on the piano.':'It went <span class="hl">down</span>! Lower, like a bear, and to the left on the piano.'})};
}
function genSS(cfg,src){
  const delta=pickNot([1,-1,2,-2,0],src._last);src._last=delta;const d1=31+rnd(5),d2=d1+delta,L1=dLetter(d1),L2=dLetter(d2);
  const word=delta===0?'Same':Math.abs(delta)===1?'Step':'Skip';
  const vis=rev=>`<div class="svgwrap">${engrave({clef:'treble',items:[{type:'note',d:d1,dur:'w',x:330,color:rev?COLOR[L1]:undefined,letter:rev?L1:''},{type:'note',d:d2,dur:'w',x:530,color:rev?COLOR[L2]:undefined,letter:rev?L2:''},...(rev?[{type:'txt',x:430,y:36,text:word.toUpperCase()}]:[])]})}</div>`;
  return{visual:vis(false),play:()=>{tone(dMidi(d1),.9);tone(dMidi(d2),1,.7)},prompt:'Step, skip, or the same note?',
    options:['Step','Skip','Same'].map(w=>({html:w,correct:w===word})),wrong:()=>'Look again: line to space is a step, line to line is a skip.',
    reveal:()=>({visual:vis(true),say:word==='Same'?`${tag(L1)} ${tag(L2)} The <span class="hl">same</span> note twice!`:word==='Step'?`${tag(L1)} to ${tag(L2)}: a <span class="hl">step</span> to the very next friend.`:`${tag(L1)} to ${tag(L2)}: a <span class="hl">skip</span> over ${tag(dLetter((d1+d2)/2))}.`})};
}
function genTS(){
  const tie=Math.random()<.5;let items;
  if(tie){const d=29+rnd(7),a={type:'note',d,dur:'h',x:330},b={type:'note',d,dur:'h',x:530};items=[a,b,{type:'tie',a,b,color:'var(--pink)'}]}
  else{const d=29+rnd(4),dir=Math.random()<.5?1:-1,n=2+rnd(2),ns=Array.from({length:n},(_,i)=>({type:'note',d:d+(dir>0?i:n-1-i),dur:'q',x:290+i*(300/(n-1))}));items=[...ns,{type:'slur',a:ns[0],b:ns[n-1],color:'var(--pink)'}]}
  const notes=items.filter(x=>x.type==='note');
  return{visual:`<div class="svgwrap">${engrave({clef:'treble',items})}</div>`,prompt:'Is the curve a tie or a slur?',
    options:[{html:'Tie',correct:tie},{html:'Slur',correct:!tie}],wrong:()=>'Check: are the joined notes the same, or different?',
    reveal:()=>({say:tie?'A <span class="hl">tie</span>! Same notes: play once and hold.':'A <span class="hl">slur</span>! Different notes: play them smooth.',
      sound:()=>run(async g=>{if(tie){tone(dMidi(notes[0].d),2.4);return}for(const nn of notes){if(g())return;tone(dMidi(nn.d),.75);await wait(420)}}),wait:2400})};
}
function genDyn(cfg,src){
  const opt=(k,lab)=>({html:`${critter(k,'sm')}${lab}`,cls:'pic'});
  if(cfg.mode==='hear'){const loud=Math.random()<.5,v=loud?.5:.06,play=()=>run(g=>playEvents(parse(TUNE),{bpm:120,gone:g,vol:v}));
    return{visual:`<div class="soundpair"><button class="sbtn" id="hs">${ICON.speaker}<span>Listen</span></button></div>`,after:el=>{$('#hs',el).onclick=play},play,noFlash:true,prompt:'Was that soft or loud?',
      options:[{...opt('mouse','Soft'),correct:!loud},{...opt('lion','Loud'),correct:loud}],wrong:()=>'Listen once more!',reveal:()=>({say:loud?'<span class="dynsym">f</span> Loud, like a lion!':'<span class="dynsym">p</span> Soft, like a mouse.'})};}
  const d=pickNot(DYN,src._last);src._last=d;const cat=d.k==='mouse'?0:d.k==='blob'?1:2;
  return{visual:`<div class="dynbig">${d.s}</div>`,prompt:'How should we play?',
    options:[{...opt('mouse','Soft'),correct:cat===0},{...opt('blob','Medium'),correct:cat===1},{...opt('lion','Loud'),correct:cat===2}],wrong:()=>'Hint: p is soft, f is loud, m means medium.',
    reveal:()=>({say:`<span class="dynsym">${d.s}</span> means <span class="hl">${d.w}</span>: ${d.m}.`,sound:()=>run(g=>playEvents(parse(TUNE),{bpm:120,gone:g,vol:d.v})),wait:2600})};
}
function genFill(cfg,src){
  const SETS=[{h:['q','q','q'],n:'q'},{h:['h','q'],n:'q'},{h:['q','h'],n:'q'},{h:['q','q'],n:'h'},{h:['h'],n:'h'},{h:['q'],n:'hd'}];
  const s=pickNot(SETS,src._last);src._last=s;const used=s.h.reduce((a,t)=>a+DUR[t],0);
  const mk=t=>{const d=28+rnd(5),L=dLetter(d);return{d,dur:t,letter:L,color:COLOR[L],midi:dMidi(d)}};
  const base=s.h.map(mk),fin={...mk(s.n)};
  const BW=95,ST=150;
  const vis=rev=>{const ev=rev?[...base,fin]:base;const {items}=layout(ev,{startX:ST,BW,pad:40,lead:36,bars:1,final:true,counts:true});if(!rev)items.push({type:'gap',x1:ST+36+used*BW-30,x2:ST+4*BW+40-14});return `<div class="svgwrap">${engrave({clef:'treble',timeSig:[4,4],items,width:600,height:285})}</div>`};
  const opts=shuffle([s.n,...shuffle(['q','h','hd','w'].filter(x=>x!==s.n)).slice(0,2)]);
  return{visual:vis(false),prompt:`This box has ${used} beat${used>1?'s':''}. It needs 4. Which note fills the gap?`,
    options:opts.map(x=>({html:mini({type:'note',d:31,dur:x},140),cls:'pic',correct:x===s.n,aria:NAME[x]})),wrong:o=>'Count the beats again: 1, 2, 3, 4!',
    reveal:()=>({visual:vis(true),say:`Yes! A <span class="hl">${NAME[s.n]}</span> adds ${DUR[s.n]}. ${used} + ${DUR[s.n]} = 4 beats!`,sound:()=>run(g=>playEvents([...base,fin],{bpm:96,gone:g})),wait:3200})};
}
function genEcho(cfg,src){
  const ans=pickNot(RHY,src._last);src._last=ans;const others=shuffle(RHY.filter(r=>r!==ans)).slice(0,2),opts=shuffle([ans,...others]);
  const play=()=>run(g=>playEvents(rhythm(ans.p),{bpm:88,gone:g,clap:true}));
  return{visual:`<div class="soundpair"><button class="sbtn" id="hs">${ICON.speaker}<span>Listen</span></button></div>`,after:el=>{$('#hs',el).onclick=play},play,noFlash:true,
    prompt:'Which rhythm did you hear?',options:opts.map(r=>({html:rhythmCard(r.p,240),cls:'pic',correct:r===ans,aria:r.n})),wrong:()=>'Not that one. Listen again and count!',
    reveal:()=>({say:`Yes! <span class="hl">${ans.n}</span>: ${ans.p.map(t=>t[0]==='r'?'shh':SYL[t]).join(' ')}`})};
}
