/* Note Friends — unit "High, Middle & Low C": registers, staff position and piano position */
const GT=100,GB=GT+6*S,KR={from:14,to:42}; // treble top, bass top; piano C2..C6
const CFAM=[
  {d:14,n:'Very Low C',nick:'Grandpa C',where:'below the bass staff, on 2 little ledger lines',k:'bear'},
  {d:21,n:'Low C',nick:'Papa C',where:'in Space 2 of the bass staff',k:'bear'},
  {d:28,n:'Middle C',nick:'Me!',where:'between the two staves, on its own little line',k:'blob'},
  {d:35,n:'High C',nick:'Sister C',where:'in Space 3 of the treble staff',k:'bird'},
  {d:42,n:'Very High C',nick:'Baby C',where:'above the treble staff, on 2 little ledger lines',k:'bird'}];
const ZONE=[{id:'low',n:'Low',c:'color-mix(in srgb,#b47a4c 55%,var(--key))',k:'bear',hand:'left hand',staff:'bass staff'},{id:'mid',n:'Middle',c:'color-mix(in srgb,var(--star) 50%,var(--key))',k:'blob',hand:'both thumbs',staff:'around Middle C'},{id:'high',n:'High',c:'color-mix(in srgb,var(--g) 50%,var(--key))',k:'bird',hand:'right hand',staff:'treble staff'}];
const zoneOf=d=>d<=24?ZONE[0]:d<=31?ZONE[1]:ZONE[2];
const onStaff=(d,x,extra={})=>({type:'note',d,s:d>=28?0:1,dur:'w',solid:true,x,...extra});
const grandSVG=(items,o={})=>engrave({staves:[{clef:'treble',top:GT},{clef:'bass',top:GB}],brace:true,height:GB+4*S+80,x0:44,items:[...items,{type:'bar',x:786,final:true}],...o});
const GROWS=[{s:0,from:28,to:42},{s:1,from:14,to:27}];
const cname=d=>{const c=CFAM.find(x=>x.d===d);return c?c.n:dLetter(d)};
const where=d=>{const s=d>=28?0:1,pi=posInfo(d,s?18:30);return `${pi.text.replace('the house','the staff')} of the ${s?'bass':'treble'} staff`};

/* ---- The C Family ---- */
MOUNT.cfamily=root=>{
  let items=[],marks={};
  page(root,{body:`
  <div class="cards">${CFAM.map((c,i)=>`<button class="vcard" data-i="${i}">${critter(c.k)}<b>${c.n}</b><span class="sy">${c.nick}</span><span class="ds">${c.where}</span></button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="walk">${ICON.play} Meet the whole family</button><button class="btn" id="guess">Which C am I?</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">The piano has many Cs. They have the same name, but they live in different places: low, middle and high!</div>`,
  notes:['Every C sits just left of the twins (the 2 black keys). Find them all on the real piano first.','Give each C a voice: Grandpa C is deep and slow, Baby C is tiny and squeaky. The child sings "C" in each voice.','On the staff: Low C and High C are both <em>space</em> notes (bass Space 2, treble Space 3). Middle C wears its own little line between the staves.','Very Low and Very High C need 2 ledger lines. They are far away from the house!'],quiz:'whichc'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=grandSVG(items);kb.innerHTML=keysSVG({...KR,marks})};draw();
  const show=c=>{items=[onStaff(c.d,430,{color:COLOR.C,letter:'C',cls:'pop'})];marks={[dMidi(c.d)]:COLOR.C};draw();tone(dMidi(c.d),1.2);say(sayEl,`<span class="hl">${c.n}</span> (${c.nick}) lives ${c.where}, in the <span class="hl">${zoneOf(c.d).n.toLowerCase()}</span> part of the piano.`)};
  $$('.vcard',root).forEach(b=>b.onclick=()=>{cancelRuns();$$('.vcard',root).forEach(x=>x.classList.toggle('on',x===b));show(CFAM[+b.dataset.i])});
  $('#walk',root).onclick=()=>run(async g=>{items=[];marks={};for(let i=0;i<CFAM.length;i++){if(g())return;const c=CFAM[i];items.forEach(n=>n.cls='');items.push(onStaff(c.d,140+i*140,{color:COLOR.C,letter:'C',cls:'pop'}));marks[dMidi(c.d)]=COLOR.C;draw();tone(dMidi(c.d),1);say(sayEl,`<span class="hl">${c.n}</span>: ${c.nick}`);await wait(1000)}say(sayEl,'Five Cs, from deep and low to tiny and high. One big family!')});
  $('#guess',root).onclick=()=>{cancelRuns();const c=CFAM[rnd(5)];items=[onStaff(c.d,430,{cls:'pop'})];marks={};draw();tone(dMidi(c.d),1.2);say(sayEl,`Listen and look… which C is this? <button class="btn small primary" id="rv">Show me</button>`);$('#rv',root).onclick=()=>show(c)};
};

/* ---- Low, Middle & High Registers ---- */
MOUNT.registers=root=>{
  let marks={},items=[];
  const tint=()=>{const m={};for(let d=KR.from;d<=KR.to;d++)m[dMidi(d)]=zoneOf(d).c;return m};
  page(root,{body:`
  <div class="twoup">${ZONE.map(z=>`<div class="mini">${critter(z.k)}<div><b>${z.n} register</b><span>${z.id==='low'?'Deep sounds on the left. Usually the <span class="hl">left hand</span>, written in the <span class="hl">bass staff</span>.':z.id==='mid'?'Around <span class="hl">Middle C</span>, in the middle of the piano. Both thumbs live here!':'Bright sounds on the right. Usually the <span class="hl">right hand</span>, written in the <span class="hl">treble staff</span>.'}</span></div></div>`).join('')}</div>
  <div class="row"><span class="lbl">Same tune in the</span><button class="btn" data-z="0">Low register</button><button class="btn primary" data-z="1">Middle register</button><button class="btn" data-z="2">High register</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">The piano has three neighbourhoods. Tap any key to find out which one it lives in!</div>`,
  notes:['A <em>register</em> is a part of the piano: low (left), middle (around Middle C), high (right).','Play the same tune in all three registers: the letters stay the same, only the "voice" changes, like a bear, a child and a bird singing the same song.','On the staff, the low register is written low (bass staff) and the high register is written high (treble staff).'],quiz:'reg'});
  const kb=$('#kb',root),sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{kb.innerHTML=keysSVG({...KR,marks:{...tint(),...marks}});sv.innerHTML=grandSVG(items)};draw();
  bindKeys(kb,m=>{const d=midiD(m);if(d==null){say(sayEl,'A black key! Find the white key next to it.');return}const z=zoneOf(d),L=dLetter(d);cancelRuns();marks={[m]:COLOR[L]};items=[onStaff(d,430,{color:COLOR[L],letter:L,cls:'pop'})];draw();say(sayEl,`${tag(L)} ${cname(d)} is in the <span class="hl">${z.n.toLowerCase()} register</span>. On the staff it sits ${where(d)}.`)});
  $$('[data-z]',root).forEach(b=>b.onclick=()=>run(async g=>{const sh=[-14,0,7][+b.dataset.z],tune=parse('E4q D4q C4h | E4q D4q C4h').map(e=>({...e,d:e.d+sh,midi:dMidi(e.d+sh)}));
    items=tune.map((e,i)=>onStaff(e.d,140+i*110,{color:e.color,letter:e.letter}));marks={};draw();say(sayEl,`Hot Cross Buns in the <span class="hl">${ZONE[+b.dataset.z].n.toLowerCase()} register</span>. Same letters, different voice!`);
    await playEvents(tune,{bpm:100,gone:g,onEvent:(i,e)=>{marks={[e.midi]:e.color};items.forEach((n,j)=>n.cls=j===i?'now':'');draw()}});marks={};items.forEach(n=>n.cls='');draw()}));
};

/* ---- Staff ↔ Piano Mirror ---- */
MOUNT.staffkey=root=>{
  let items=[],marks={},cur=null;
  page(root,{body:`
  <div class="row"><button class="btn primary" id="rand">Surprise note</button><button class="btn" id="how">How do I find it?</button><button class="chip" id="clr">Clear</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Tap the staff to light up the key. Tap a key to see where it is written. They are mirrors!</div>`,
  notes:['Reading trick: <em>find the nearest C, then step or skip</em> to the note. The Cs are our signposts.','Higher on the staff = further right on the piano. Lower on the staff = further left.','Use <em>How do I find it?</em> to show the path from the nearest C, one step at a time.'],quiz:'s2k'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=grandSVG(items,{rows:GROWS});kb.innerHTML=keysSVG({...KR,marks})};draw();
  const show=d=>{cur=d;const L=dLetter(d);items=[onStaff(d,430,{color:COLOR[L],letter:L,cls:'pop'})];marks={[dMidi(d)]:COLOR[L]};draw();tone(dMidi(d));say(sayEl,`${tag(L)} ${cname(d)}: written ${where(d)}, in the <span class="hl">${zoneOf(d).n.toLowerCase()} register</span>.`)};
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;cancelRuns();show(+h.dataset.d)});
  bindKeys(kb,m=>{const d=midiD(m);if(d==null){say(sayEl,'Black keys need a sharp or flat. Try a white key!');return}cancelRuns();show(d)},true);
  $('#rand',root).onclick=()=>{cancelRuns();const d=14+rnd(29);cur=d;items=[onStaff(d,430,{cls:'pop'})];marks={};draw();say(sayEl,`Where is this note on the piano? Try to find it, then press <span class="hl">How do I find it?</span>`)};
  $('#how',root).onclick=()=>run(async g=>{if(cur==null){say(sayEl,'Tap a note on the staff first!');return}const d=cur,c=Math.min(42,Math.max(14,Math.round(d/7)*7)),dir=d>c?1:-1;
    items=[onStaff(c,250,{color:COLOR.C,letter:'C',cls:'pop'})];marks={[dMidi(c)]:COLOR.C};draw();tone(dMidi(c));say(sayEl,`First find the nearest C: <span class="hl">${cname(c)}</span>.`);await wait(1300);
    for(let x=c+dir,k=1;dir>0?x<=d:x>=d;x+=dir,k++){if(g())return;const L=dLetter(x);items=[onStaff(c,250,{color:COLOR.C,letter:'C'}),onStaff(x,250+k*70,{color:COLOR[L],letter:L,cls:'pop'})];marks={[dMidi(c)]:COLOR.C,[dMidi(x)]:COLOR[L]};draw();tone(dMidi(x),.6);say(sayEl,`${dir>0?'Up':'Down'} ${k}: ${tag(L)}`);await wait(700)}
    if(d!==c)say(sayEl,`From ${cname(c)}, we went ${Math.abs(d-c)} step${Math.abs(d-c)>1?'s':''} ${dir>0?'up':'down'} to ${tag(dLetter(d))}. Found it!`);else say(sayEl,'It IS a C! Easy.')});
  $('#clr',root).onclick=()=>{cancelRuns();cur=null;items=[];marks={};draw()};
};

/* ---- Octave Jumps on the Staff ---- */
MOUNT.octstaff=root=>{
  let d=28,items=[],marks={};
  page(root,{body:`
  <div class="row"><span class="lbl">Start on</span>${LETTERS.map((L,i)=>`<button class="ans letter" style="--nc:${COLOR[L]};height:46px;min-width:46px;font-size:22px" data-l="${i}">${L}</button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="up">Jump up an octave</button><button class="btn primary" id="down">Jump down an octave</button><button class="btn" id="all">All the way up</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">An octave jump lands on the same letter, higher or lower. Watch what happens on the staff!</div>`,
  notes:['Octave jump on the staff = 7 steps. A <em>line note lands in a space</em>, and a <em>space note lands on a line</em>.','Example: Middle C (on its little line) jumps up to High C (in a space). High C jumps up to Very High C (on a line again).','On the piano it is 8 white keys counting both ends: C D E F G A B C.'],quiz:'k2s'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=grandSVG(items);kb.innerHTML=keysSVG({...KR,marks})};
  const set=nd=>{d=nd;const L=dLetter(d);items=[onStaff(d,430,{color:COLOR[L],letter:L,cls:'pop'})];marks={[dMidi(d)]:COLOR[L]};draw();tone(dMidi(d))};set(28);
  $$('[data-l]',root).forEach(b=>b.onclick=()=>{cancelRuns();set(28+(+b.dataset.l));say(sayEl,`${tag(dLetter(d))} Now jump up or down an octave!`)});
  const jump=dir=>{cancelRuns();const nd=d+7*dir;if(nd<14||nd>42){say(sayEl,`No more ${dLetter(d)}s that way on our piano. Try the other direction!`);return}const L=dLetter(d),k1=posInfo(d,d>=28?30:18).kind,k2=posInfo(nd,nd>=28?30:18).kind;
    items=[onStaff(d,300,{color:COLOR[L],letter:L}),onStaff(nd,560,{color:COLOR[L],letter:L,cls:'pop'}),{type:'txt',x:430,y:40,text:dir>0?'octave up':'octave down'}];marks={[dMidi(d)]:'color-mix(in srgb,var(--muted) 45%,var(--key))',[dMidi(nd)]:COLOR[L]};draw();tone(dMidi(d),.6);tone(dMidi(nd),1,.5);
    const lineish=k=>k==='line'||k==='ledger';say(sayEl,`${tag(L)} ${dir>0?'Up':'Down'} 7 steps: ${lineish(k1)?'a line note':'a space note'} jumped ${lineish(k2)?'onto a line':'into a space'}!`);d=nd};
  $('#up',root).onclick=()=>jump(1);$('#down',root).onclick=()=>jump(-1);
  $('#all',root).onclick=()=>run(async g=>{const i=((d%7)+7)%7,ds=[];for(let x=14+i;x<=42;x+=7)ds.push(x);items=[];marks={};for(let k=0;k<ds.length;k++){if(g())return;const L=dLetter(ds[k]);items.forEach(n=>n.cls='');items.push(onStaff(ds[k],150+k*150,{color:COLOR[L],letter:L,cls:'pop'}));marks[dMidi(ds[k])]=COLOR[L];draw();tone(dMidi(ds[k]),.8);await wait(700)}say(sayEl,`Every ${tag(dLetter(ds[0]))} on our piano: line, space, line, space… as they climb!`)});
};

/* ---------- quizzes ---------- */
function genWhichC(cfg,src){
  const c=pickNot(CFAM,src._last);src._last=c;
  return{visual:`<div class="svgwrap">${grandSVG([onStaff(c.d,430,{cls:'pop'})])}</div>`,play:()=>tone(dMidi(c.d),1.2),prompt:'Which C is this?',
    options:CFAM.map(x=>({html:x.n,correct:x===c,style:'font-size:20px'})),wrong:()=>'Look: is it in the treble or bass staff? Does it have ledger lines?',
    reveal:()=>({visual:`<div class="svgwrap">${grandSVG([onStaff(c.d,430,{color:COLOR.C,letter:'C'})])}</div>${keysSVG({...KR,marks:{[dMidi(c.d)]:COLOR.C}})}`,say:`Yes! <span class="hl">${c.n}</span> lives ${c.where}.`})};
}
function genS2K(cfg,src){
  const pool=cfg.what==='cs'?CFAM.map(c=>c.d):Array.from({length:29},(_,i)=>14+i),d=pickNot(pool,src._last);src._last=d;const L=dLetter(d),m=dMidi(d);
  return{visual:`<div class="svgwrap">${grandSVG([onStaff(d,430,{cls:'pop'})])}</div>`,prompt:`Tap the <span class="hl">exact</span> key for this note!`,
    custom(aEl,api){let marks={};const draw=sh=>{aEl.innerHTML=`<div class="svgwrap">${keysSVG({...KR,marks,shake:sh,labels:cfg.help==='on'})}</div>`};draw();
      aEl.onpointerdown=e=>{const k=e.target.closest('[data-midi]');if(!k||api.locked())return;e.preventDefault();const t=+k.dataset.midi;tone(t);
        if(t===m){marks={[t]:COLOR[L]};draw();api.right(null,`${tag(L)} Yes! ${cname(d)}, in the ${zoneOf(d).n.toLowerCase()} register.`)}
        else{draw(t);const tl=midiLetter(t);api.wrong(null,tl===L?`Right letter, wrong ${L}! Go ${t<m?'higher (right)':'lower (left)'}.`:`That is ${tl?tag(tl):'a black key'}. Go ${t<m?'higher (right)':'lower (left)'}!`)}}}};
}
function genK2S(cfg,src){
  const d=pickNot(Array.from({length:22},(_,i)=>17+i),src._last);src._last=d;const L=dLetter(d),cands=[d+7,d-7,d+14,d-14].filter(x=>x>=14&&x<=42),wr=shuffle(cands).slice(0,2);
  const pic=x=>engrave({staves:[{clef:'treble',top:GT},{clef:'bass',top:GB}],brace:true,height:GB+4*S+80,width:260,x0:40,x1:250,items:[onStaff(x,170,{color:COLOR[L],letter:L})]});
  return{visual:`<div class="svgwrap">${keysSVG({...KR,marks:{[dMidi(d)]:COLOR[L]},labels:false})}</div>`,play:()=>tone(dMidi(d),1),prompt:`This ${tag(L)} key is lit. Which staff picture shows it?`,
    options:shuffle([d,...wr]).map(x=>({html:pic(x),cls:'pic',correct:x===d,aria:`${L} on staff`})),wrong:()=>'Same letter, different register! Is the key low, middle or high?',
    reveal:()=>({say:`Yes! This ${L} is written ${where(d)}.`})};
}
function genReg(cfg,src){
  const z=pickNot([0,1,2],src._last);src._last=z;const ranges=[[14,20],[26,30],[35,42]],[lo,hi]=ranges[z],d=lo+rnd(hi-lo+1),m=dMidi(d),hear=cfg.mode==='hear';
  return{visual:hear?`<div class="soundpair"><button class="sbtn" id="hs">${ICON.speaker}<span>Listen</span></button></div>`:`<div class="svgwrap">${keysSVG({...KR,marks:{[m]:'var(--pink)'}})}</div>`,
    after:el=>{const b=$('#hs',el);if(b)b.onclick=()=>tone(m,1.2)},play:()=>tone(m,1.2),noFlash:hear,prompt:hear?'Is this sound low, middle or high?':'Is the pink key in the low, middle or high register?',
    options:ZONE.map((x,i)=>({html:`${critter(x.k,'sm')}${x.n}`,cls:'pic',correct:i===z})),wrong:()=>hear?'Listen again: bear, child or bird?':'Look: left side, middle, or right side?',
    reveal:()=>({visual:`<div class="svgwrap">${keysSVG({...KR,marks:{[m]:'var(--pink)'}})}</div>`,say:`It is ${tag(dLetter(d))} in the <span class="hl">${ZONE[z].n.toLowerCase()} register</span>: ${ZONE[z].hand}, ${ZONE[z].staff}.`})};
}
QUIZ.splice(QUIZ.length-1,0,
  {id:'whichc',name:'Which C Is It?',lead:'Very Low, Low, Middle, High or Very High C?',c:'var(--c)',ic:'C?',flash:true,gen:genWhichC},
  {id:'s2k',name:'Staff to Piano',lead:'Read the note, then tap the exact key.',c:'var(--b)',ic:'♪→',opts:[{k:'what',l:'Notes',c:[['cs','Only Cs'],['all','All notes']],d:'cs'},{k:'help',l:'Letter helpers',c:[['off','Off'],['on','On']],d:'off'}],gen:genS2K},
  {id:'k2s',name:'Piano to Staff',lead:'A key lights up. Which staff picture shows it?',c:'var(--a)',ic:'→♪',flash:true,gen:genK2S},
  {id:'reg',name:'Low, Middle or High?',lead:'Find the register: bear, child or bird?',c:'var(--d)',ic:'L M H',flash:true,opts:[{k:'mode',l:'Mode',c:[['see','Look at the key'],['hear','Listen']],d:'see'}],gen:genReg});
['whichc','s2k','k2s','reg'].forEach(id=>QBY[id]=QUIZ.find(q=>q.id===id));

/* ---- Note Map: every note in every register ---- */
const ROWS=[{n:'Very Low',from:14,c:CFAM[0]},{n:'Low',from:21,c:CFAM[1]},{n:'Middle',from:28,c:CFAM[2]},{n:'High',from:35,c:CFAM[3]},{n:'Very High',from:42,c:CFAM[4]}];
MOUNT.allnotes=root=>{
  let row=2,sel=null,col=null;
  page(root,{body:`
  <div class="panel"><div class="ngrid" id="grid">
    <span></span>${LETTERS.map((L,i)=>`<button class="ncol" data-c="${i}" style="--nc:${COLOR[L]}" aria-label="Every ${L}">${L}</button>`).join('')}<span></span>
    ${ROWS.map((r,ri)=>`<button class="nrow" data-r="${ri}">${r.n}</button>${LETTERS.map((L,i)=>{const d=r.from+i,ok=d<=42;return ok?`<button class="ncell" data-d="${d}" style="--nc:${COLOR[L]}">${L}<small>${Math.floor(d/7)}</small></button>`:'<span></span>'}).join('')}<button class="nplay" data-p="${ri}" aria-label="Play ${r.n} row">${ICON.play}</button>`).join('')}
  </div></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Every letter lives in every register! Tap any square, or tap a letter at the top to find all of them.</div>`,
  notes:['Each row starts on a C from the C family. Read across: C D E F G A B, then the next row starts on the next C, higher up.','Columns are "families" of the same letter: every G sounds like G, just higher or lower.','The small number is the octave number musicians use (Middle C is C4). Older kids like knowing that!','Ask: "Show me the G in the high register." The child finds it in the grid, on the staff, then on the real piano.'],quiz:'anyn'});
  const grid=$('#grid',root),sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const rowDs=ri=>{const r=ROWS[ri],a=[];for(let d=r.from;d<=Math.min(42,r.from+7);d++)a.push(d);return a};
  const draw=()=>{
    let ds;if(col!=null){ds=[];for(let d=14+col;d<=42;d+=7)ds.push(d)}else ds=rowDs(row);
    const step=Math.min(80,560/Math.max(1,ds.length-1));
    const items=ds.map((d,k)=>{const L=dLetter(d);return onStaff(d,180+k*step,{color:COLOR[L],letter:L,cls:sel==null?'':sel===d?'pop':'dim'})});
    sv.innerHTML=grandSVG(items);
    const marks={};ds.forEach(d=>marks[dMidi(d)]=sel==null||sel===d?COLOR[dLetter(d)]:'color-mix(in srgb,var(--muted) 35%,var(--key))');kb.innerHTML=keysSVG({...KR,marks,labels:true});
    $$('.ncell',grid).forEach(c=>{const d=+c.dataset.d;c.classList.toggle('on',d===sel);c.classList.toggle('in',ds.includes(d))});
    $$('.nrow',grid).forEach((b,i)=>b.classList.toggle('on',col==null&&i===row));$$('.ncol',grid).forEach((b,i)=>b.classList.toggle('on',i===col));
  };draw();
  const pick=d=>{sel=d;const L=dLetter(d);if(col==null||(d-14)%7!==col){col=null;row=Math.min(4,Math.floor((d-14)/7))}draw();tone(dMidi(d),1.1);say(sayEl,`${tag(L)} This <span style="color:${COLOR[L]}">${L}</span> is in the <span class="hl">${ROWS[Math.min(4,Math.floor((d-14)/7))].n.toLowerCase()}</span> row. It is written ${where(d)}, and it lives in the ${zoneOf(d).n.toLowerCase()} part of the piano.`)};
  $$('.ncell',grid).forEach(c=>c.onclick=()=>{cancelRuns();pick(+c.dataset.d)});
  $$('.nrow',grid).forEach(b=>b.onclick=()=>{cancelRuns();row=+b.dataset.r;col=null;sel=null;draw();say(sayEl,`The <span class="hl">${ROWS[row].n.toLowerCase()}</span> row starts on ${ROWS[row].c.n}. Tap a note, or press ▶ to hear it.`)});
  $$('.ncol',grid).forEach(b=>b.onclick=()=>run(async g=>{col=+b.dataset.c;sel=null;draw();const L=LETTERS[col];say(sayEl,`Every <span style="color:${COLOR[L]}">${L}</span> on our piano, from low to high. Same name, different voices!`);for(let d=14+col;d<=42;d+=7){if(g())return;sel=d;draw();tone(dMidi(d),.8);await wait(600)}sel=null;draw()}));
  $$('.nplay',grid).forEach(b=>b.onclick=()=>run(async g=>{row=+b.dataset.p;col=null;const ds=rowDs(row);say(sayEl,`The ${ROWS[row].n.toLowerCase()} row: ${ds.map(d=>dLetter(d)).join(' ')}`);for(const d of ds){if(g())return;sel=d;draw();tone(dMidi(d),.6);await wait(420)}sel=null;draw()}));
  bindKeys(kb,m=>{const d=midiD(m);if(d!=null){cancelRuns();pick(d)}},true);
};
function genAnyN(cfg,src){
  const d=pickNot(Array.from({length:29},(_,i)=>14+i),src._last);src._last=d;const L=dLetter(d);
  return{visual:`<div class="svgwrap">${grandSVG([onStaff(d,430,{cls:'pop'})])}</div>`,prompt:'What is this note called?',options:letterOpts(L),wrong:o=>`Not ${o.html}. Find the nearest C and count!`,
    reveal:()=>({visual:`<div class="svgwrap">${grandSVG([onStaff(d,430,{color:COLOR[L],letter:L})])}</div><div class="svgwrap">${keysSVG({...KR,marks:{[dMidi(d)]:COLOR[L]}})}</div>`,say:`${tag(L)} It is ${L}, in the <span class="hl">${zoneOf(d).n.toLowerCase()} register</span>, written ${where(d)}.`,sound:()=>tone(dMidi(d))})};
}
QUIZ.splice(QUIZ.length-1,0,{id:'anyn',name:'Note Anywhere',lead:'Name any note from Very Low C to Very High C.',c:'var(--f)',ic:'?♪',flash:true,gen:genAnyN});
QBY.anyn=QUIZ.find(q=>q.id==='anyn');
