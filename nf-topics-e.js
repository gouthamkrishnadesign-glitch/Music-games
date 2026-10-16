/* Note Friends — more lessons, units 3, 4 & 5 */
SONGS.push(
  {n:'Old MacDonald',s:'C4q C4q C4q G3q | A3q A3q G3h | E4q E4q D4q D4q | C4w'},
  {n:'London Bridge',s:'G4q A4q G4q F4q | E4q F4q G4h | D4q E4q F4h | E4q F4q G4h | G4q A4q G4q F4q | E4q F4q G4h | D4h G4h | E4q C4hd'},
  {n:'Ode to Joy (easy)',s:'E4q E4q F4q G4q | G4q F4q E4q D4q | C4q C4q D4q E4q | E4h D4h | E4q E4q F4q G4q | G4q F4q E4q D4q | C4q C4q D4q E4q | D4h C4h'}
);
const oneLine=(p,o={})=>{const {items}=layout(rhythm(p,34),{startX:20,BW:o.BW||150,pad:40,lead:40,counts:true,syl:o.syl!==false,stem:'up',letters:false,colors:false,final:true});return engrave({staves:[{oneLine:true,top:60}],width:800,height:230,x0:20,x1:780,items})};

/* ---- Eighth Notes ---- */
MOUNT.eighths=root=>{
  const P=[['q','q','q','q'],['e','e','e','e','e','e','e','e'],['q','e','e','q','e','e'],['e','e','q','e','e','q']];let cur=1;
  page(root,{body:`
  <div class="twoup"><div class="mini">${mini({type:'note',d:31,dur:'e'},120)}<div><b>One eighth note</b><span>A filled note with a little <span class="hl">flag</span>. Half a beat. Quick!</span></div></div>
  <div class="mini">${(()=>{const a={type:'note',d:31,dur:'e',x:45,stem:'up',beamed:true},b={type:'note',d:31,dur:'e',x:85,stem:'up',beamed:true};return engrave({clef:null,width:130,height:250,x0:8,x1:122,items:[a,b,{type:'beam',a,b}]})})()}<div><b>Two eighths = 1 beat</b><span>They hold hands with a <span class="hl">beam</span>. Say “ti-ti”, count “1 &”.</span></div></div></div>
  <div class="row">${chipGroup('Pattern',P.map((p,i)=>[String(i),['Walking','Running','Walk-run-run','Run-run-walk'][i]]),String(cur))}<button class="btn primary" id="play">${ICON.play} Count &amp; clap</button></div>
  <div class="panel svgwrap" id="sv"></div>${beatDots(4)}
  <div class="say" id="say">Quarter notes walk. Eighth notes run!</div>`,
  notes:['Quarter notes = walking feet ("ta"). Eighth notes = running feet ("ti-ti").','Count eighths with "and": 1 & 2 & 3 & 4 &.','Walk around the room on quarters, then run on tiptoes for eighths, with the same beat.'],quiz:'echo'});
  const sv=$('#sv',root),sayEl=$('#say',root),draw=()=>{sv.innerHTML=oneLine(P[cur])};draw();
  bindChips(root,'Pattern',v=>{cur=+v;cancelRuns();draw()});
  $('#play',root).onclick=()=>run(async g=>{await playEvents(rhythm(P[cur]),{bpm:80,gone:g,clap:true,click:true,onEvent:(i,e)=>{hl(sv,i);say(sayEl,e.dur==='e'?'ti':'ta')},onBeat:k=>setBeat(root,k)});hl(sv,null);setBeat(root,-1);say(sayEl,'Walking and running, always on the beat!')});
};

/* ---- The Magic Dot ---- */
MOUNT.dotted=root=>{
  page(root,{body:`
  <div class="panel" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:center">
    <div class="vcard">${mini({type:'note',d:31,dur:'h'},140)}<b>Half note</b><span class="blocks"><i class="f"></i><i class="f"></i><i></i><i></i></span><span class="sy">2 beats</span></div>
    <span class="eq">+ dot =</span>
    <div class="vcard on">${mini({type:'note',d:31,dur:'hd'},140)}<b>Dotted half</b><span class="blocks"><i class="f"></i><i class="f"></i><i class="f" style="background:var(--pink);border-color:var(--pink)"></i><i></i></span><span class="sy">3 beats</span></div>
  </div>
  <div class="row"><button class="btn primary" id="h">${ICON.play} Half note (2)</button><button class="btn primary" id="hd">${ICON.play} Dotted half (3)</button><button class="btn" id="w">${ICON.play} Waltz with dotted halves</button></div>
  ${beatDots(4)}
  <div class="say" id="say">A dot beside a note is magic: it adds <span class="hl">half</span> of the note's length. 2 + 1 = 3 beats!</div>`,
  notes:['The dot sits <em>beside</em> the head, not above it (that would be staccato!).','Dotted half = 2 + 1 = 3 beats. Count "1 2 3" while holding.','Dotted halves fit perfectly into 3/4 time: one note fills a whole box.'],quiz:'beats'});
  const sayEl=$('#say',root);
  const hold=n=>run(async g=>{tone(67,n*.7);for(let k=0;k<n;k++){if(g())return;setBeat(root,k);click(k===0);await wait(700)}setBeat(root,-1)});
  $('#h',root).onclick=()=>{say(sayEl,'Half note: hold for <span class="hl">2</span>.');hold(2)};
  $('#hd',root).onclick=()=>{say(sayEl,'Dotted half: hold for <span class="hl">3</span>!');hold(3)};
  $('#w',root).onclick=()=>run(async g=>{say(sayEl,'In 3/4, one dotted half fills a whole box. 1 2 3, 1 2 3…');await playEvents(parse('C4hd | E4hd | G4hd | C5hd'),{bpm:100,per:3,gone:g,click:true,onBeat:k=>setBeat(root,k)});setBeat(root,-1)});
};

/* ---- Fruit Rhythms ---- */
const FRUIT=[{w:'Pear',p:['q'],c:'var(--f)',s:'ta'},{w:'Ap-ple',p:['e','e'],c:'var(--c)',s:'ti-ti'},{w:'Peeach',p:['h'],c:'var(--d)',s:'ta-a'},{w:'(shh)',p:['rq'],c:'var(--muted)',s:'shh'}];
MOUNT.fruit=root=>{
  let seq=[0,1,0,2];
  page(root,{body:`
  <div class="row">${FRUIT.map((f,i)=>`<button class="rblock" style="--rc:${f.c}" data-f="${i}">+ ${f.w}</button>`).join('')}<button class="chip" id="undo">Undo</button><button class="chip" id="clr">Clear</button></div>
  <div class="blockrow" id="row"></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Say &amp; clap it</button><span class="muted" id="beats"></span></div>
  <div class="say" id="say">Say the fruit names. They make rhythms! Build a fruit salad of 4 beats.</div>`,
  notes:['Pear = 1 beat (ta). Ap-ple = 2 quick sounds in 1 beat (ti-ti). Peeeach = held for 2 beats (ta-a).','Say the words while clapping, then play them on one piano key.','Let the child invent fruit sentences, then read them from the staff.'],quiz:'echo'});
  const row=$('#row',root),sv=$('#sv',root),sayEl=$('#say',root);
  const total=()=>seq.reduce((a,i)=>a+FRUIT[i].p.reduce((b,t)=>b+DUR[t.replace('r','')],0),0);
  const pat=()=>seq.flatMap(i=>FRUIT[i].p);
  const draw=()=>{row.innerHTML=seq.map((i,k)=>`<span class="rblock" style="--rc:${FRUIT[i].c}" data-k="${k}">${FRUIT[i].w}</span>`).join('')||'<span class="muted">Tap a fruit to add it</span>';
    sv.innerHTML=seq.length?oneLine(pat(),{BW:total()>4?75:150}):'';const t=total();$('#beats',root).textContent=`${t} beat${t===1?'':'s'}`};draw();
  $$('[data-f]',root).forEach(b=>b.onclick=()=>{const f=FRUIT[+b.dataset.f],add=f.p.reduce((a,t)=>a+DUR[t.replace('r','')],0);if(total()+add>8){say(sayEl,'The fruit bowl is full! Press play.');return}seq.push(+b.dataset.f);draw();say(sayEl,`<span class="hl">${f.w}</span>: “${f.s}”`);if(total()===4||total()===8){burst(row,16);yay()}});
  $('#undo',root).onclick=()=>{seq.pop();draw()};$('#clr',root).onclick=()=>{seq=[];draw()};
  $('#play',root).onclick=()=>run(async g=>{if(!seq.length)return;const marks=[];seq.forEach((i,k)=>FRUIT[i].p.forEach(()=>marks.push(k)));
    await playEvents(rhythm(pat()),{bpm:80,gone:g,clap:true,click:true,onEvent:(i)=>{hl(sv,i);$$('.rblock',row).forEach((b,k)=>b.classList.toggle('now',k===marks[i]));say(sayEl,FRUIT[seq[marks[i]]].w)}});hl(sv,null);$$('.rblock',row).forEach(b=>b.classList.remove('now'));say(sayEl,'Yum! A tasty rhythm.')});
};

/* ---- Rhythm Builder ---- */
MOUNT.rbuild=root=>{
  const B=[['q','ta','var(--g)'],['h','ta-a','var(--a)'],['ee','ti-ti','var(--c)'],['hd','ta-a-a','var(--b)'],['rq','shh','var(--muted)'],['w','ta-a-a-a','var(--d)']];
  const len={q:1,h:2,ee:1,hd:3,rq:1,w:4};let seq=[];
  page(root,{body:`
  <div class="row">${B.map(([k,t,c])=>`<button class="rblock" style="--rc:${c}" data-k="${k}">${t}</button>`).join('')}<button class="chip" id="undo">Undo</button><button class="chip" id="clr">Clear</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play my rhythm</button>${beatDots(4)}</div>
  <div class="say" id="say">Build 2 boxes of rhythm. Each box holds exactly 4 beats!</div>`,
  notes:['Each block says its rhythm word. The child must fill each box with exactly 4 beats.','If a block will not fit, ask: "How many beats are left? Which block is that long?"','Clap the finished rhythm together, then play it on one key.'],quiz:'fill'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const total=()=>seq.reduce((a,k)=>a+len[k],0),toks=()=>seq.flatMap(k=>k==='ee'?['e','e']:[k]);
  const draw=()=>{const {items}=layout(rhythm(toks(),34),{startX:20,BW:80,pad:40,lead:30,bars:2,counts:true,stem:'up',letters:false,colors:false,final:true});const t=total();if(t<8){const m=Math.floor(t/4),b=t%4;items.push({type:'ghost',x:20+m*(4*80+40)+30+b*80,d:34})}sv.innerHTML=engrave({staves:[{oneLine:true,top:60}],width:760,height:220,x0:10,x1:750,items})};draw();
  $$('[data-k]',root).forEach(b=>b.onclick=()=>{const k=b.dataset.k,t=total(),left=4-(t%4);if(t>=8){say(sayEl,'Both boxes are full! Press play.');return}if(len[k]>left){oops();say(sayEl,`Only <span class="hl">${left}</span> beat${left>1?'s':''} left in this box. Pick a shorter block!`);return}
    seq.push(k);draw();tone(67,.25);const nt=total();if(nt===8){addStar();confetti();say(sayEl,'Two full boxes! You built a rhythm. Press play!')}else if(nt%4===0){burst(sv,16);say(sayEl,'Box full: 4 beats!')}else say(sayEl,`${nt%4} beat${nt%4>1?'s':''} in this box…`)});
  $('#undo',root).onclick=()=>{seq.pop();draw()};$('#clr',root).onclick=()=>{seq=[];draw()};
  $('#play',root).onclick=()=>run(async g=>{if(!seq.length)return;await playEvents(rhythm(toks()),{bpm:84,gone:g,clap:true,click:true,onEvent:i=>hl(sv,i),onBeat:k=>setBeat(root,k)});hl(sv,null);setBeat(root,-1)});
};

/* ---- Accent ---- */
MOUNT.accent=root=>{
  const evs=()=>{const e=parse('C4q E4q G4q E4q | C4q E4q G4q E4q');e[0].accent=e[4].accent=true;e[2].accent=k===1;e[6].accent=k===1;return e};let k=0;
  page(root,{body:`
  <div class="row">${chipGroup('Example',[['0','Strong beat 1'],['1','Beats 1 and 3']],'0')}<button class="btn primary" id="play">${ICON.play} Play with accents</button><button class="btn" id="flat">${ICON.play} Play without</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">The accent sign <span class="hl">&gt;</span> means: play this note a little <span class="hl">stronger</span>. Like a hop!</div>`,
  notes:['An accent (&gt;) is a sideways arrow by the note head. It says "lean on me!"','Only that one note is stronger; the others stay normal.','Clap a rhythm and clap louder on the accents. Or stomp!'],quiz:'dyn'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=sheet(evs(),{extra:items=>items.filter((x,i)=>x.type==='note'&&evs()[x.i]&&evs()[x.i].accent).map(a=>({type:'accent',a}))})};draw();
  bindChips(root,'Example',v=>{k=+v;cancelRuns();draw()});
  $('#play',root).onclick=()=>run(async g=>{say(sayEl,'Hear the strong notes? BOOM tap tap tap!');await playEvents(evs(),{bpm:96,gone:g,vol:.2,onEvent:i=>hl(sv,i)});hl(sv,null)});
  $('#flat',root).onclick=()=>run(async g=>{say(sayEl,'Without accents, every note is the same.');await playEvents(evs(),{bpm:96,gone:g,vol:.2,noAccent:true,onEvent:i=>hl(sv,i)});hl(sv,null)});
};

/* ---- Fermata ---- */
MOUNT.fermata=root=>{
  const evs=()=>{const e=parse('C4q D4q E4q F4q | G4w');e[4].ferm=true;return e};
  page(root,{body:`
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play with the fermata</button><button class="btn" id="no">${ICON.play} Play without</button><button class="btn" id="freeze">Freeze game</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">This sign looks like a <span class="hl">bird's eye</span>. It means: hold the note longer than usual. Wait… wait…</div>`,
  notes:['The fermata looks like an eye with an eyebrow. The music "stops and looks around" before going on.','There is no exact count; hold until it feels right (or until the teacher nods).','Freeze game: sing or play, and when you show the fermata card, everyone holds and freezes!'],quiz:'beats'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  sv.innerHTML=sheet(evs(),{extra:items=>{const n=items.filter(x=>x.type==='note');return[{type:'fermata',a:n[4]}]}});
  $('#play',root).onclick=()=>run(async g=>{say(sayEl,'Hold… hold… the bird is watching!');await playEvents(evs(),{bpm:96,gone:g,onEvent:i=>hl(sv,i)});hl(sv,null);say(sayEl,'That last note waited extra long!')});
  $('#no',root).onclick=()=>run(async g=>{say(sayEl,'Without the fermata, the note lasts just its 4 beats.');await playEvents(evs(),{bpm:96,gone:g,noFerm:true,onEvent:i=>hl(sv,i)});hl(sv,null)});
  $('#freeze',root).onclick=()=>run(async g=>{say(sayEl,'Dance to the music… and FREEZE when the music holds!');const ev=parse('C4q E4q G4q C5q | G4q E4q C4h');ev[3].ferm=true;ev[6].ferm=true;await playEvents(ev,{bpm:120,gone:g,onEvent:(i,e)=>{if(e.ferm)say(sayEl,'<span class="hl">FREEZE!</span>');else say(sayEl,'Dance!')}});say(sayEl,'Great freezing!')});
};

/* ---- Slowing Down (rit.) ---- */
MOUNT.rit=root=>{
  const ev=parse('G4q F4q E4q D4q | C4q D4q E4q F4q | G4q F4q E4q D4q | C4w');
  page(root,{body:`
  <div class="row"><button class="btn primary" id="rit">${ICON.play} Play with rit.</button><button class="btn" id="acc">${ICON.play} Play with accel.</button><button class="btn" id="st">${ICON.play} Steady</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel" style="display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap" id="crit">${critter('rabbit')}<span class="eq">→</span>${critter('turtle')}</div>
  <div class="say" id="say"><span class="hl">rit.</span> means slow down little by little, like a wind-up toy running out of energy.</div>`,
  notes:['<em>rit.</em> (ritardando) = gradually slower. Often at the end of a song, to say goodbye.','<em>accel.</em> (accelerando) = gradually faster, like a train leaving the station.','Walk around the room getting slower and slower, then faster and faster.'],quiz:'echo'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const {items}=layout(ev,{startX:150,BW:32,pad:34});items.push({type:'txt',x:520,y:30,text:'rit.',cls:'dyn'});sv.innerHTML=engrave({clef:'treble',timeSig:[4,4],items});
  const go=(f,msg)=>run(async g=>{say(sayEl,msg);await playEvents(ev,{bpm:110,gone:g,click:true,msFn:f,onEvent:i=>hl(sv,i)});hl(sv,null)});
  $('#rit',root).onclick=()=>{$('#crit',root).innerHTML=`${critter('rabbit')}<span class="eq">→</span>${critter('turtle')}`;go(s=>s<14?545:545*(1+(s-14)*.09),'Steady… then slowing… down… down…')};
  $('#acc',root).onclick=()=>{$('#crit',root).innerHTML=`${critter('turtle')}<span class="eq">→</span>${critter('rabbit')}`;go(s=>Math.max(220,800-s*20),'Starting slow… getting faster and faster!')};
  $('#st',root).onclick=()=>go(()=>545,'A steady beat the whole way.');
};

/* ---- Echo Me (memory game) ---- */
MOUNT.echo=root=>{
  const R={from:28,to:32};let pattern=[],pos=0,level=store.get('nf-echo',2),marks={},busy=false,best=store.get('nf-echo-best',0);
  page(root,{body:`
  <div class="row"><button class="btn primary" id="go">${ICON.play} Listen</button><span class="lbl">Notes</span><span class="beats"><span class="on" id="lv">${level}</span></span><span class="muted" id="best">Best: ${best}</span><button class="chip" id="rs">Back to 2 notes</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">I play a little tune on C D E F G. You copy it! Each time you get it right, the tune gets longer.</div>`,
  notes:['This trains listening and memory. Let the child sing it back first, then play it.','Keep the right hand in C position (thumb on C) and use fingers 1 to 5.','Watch the keys light up the first few times. Then try with eyes closed!'],quiz:'hl'});
  const kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{kb.innerHTML=keysSVG({...R,marks,labels:true,fingers:{60:1,62:2,64:3,65:4,67:5}})};draw();
  const flash=(m,ms=380)=>{marks={[m]:COLOR[midiLetter(m)]};draw();setTimeout(()=>{marks={};draw()},ms)};
  const play=()=>run(async g=>{busy=true;pos=0;say(sayEl,'Listen…');await wait(400);for(const m of pattern){if(g())return;flash(m);tone(m,.6);await wait(600)}busy=false;say(sayEl,'Your turn!')});
  const keys=[60,62,64,65,67];
  $('#go',root).onclick=()=>{if(!pattern.length)pattern=Array.from({length:level},()=>keys[rnd(5)]);play()};
  $('#rs',root).onclick=()=>{level=2;store.set('nf-echo',2);$('#lv',root).textContent=level;pattern=[];say(sayEl,'Back to 2 notes. Press Listen!')};
  bindKeys(kb,m=>{if(busy||!pattern.length)return;flash(m,250);
    if(m===pattern[pos]){pos++;if(pos===pattern.length){addStar();burst(kb,24);yay();if(level>best){best=level;store.set('nf-echo-best',best);$('#best',root).textContent='Best: '+best}level=Math.min(8,level+1);store.set('nf-echo',level);$('#lv',root).textContent=level;pattern=[];say(sayEl,level>=8?'Amazing memory! You reached 8 notes!':`Perfect echo! Next tune has <span class="hl">${level}</span> notes. Press Listen.`);if(level>=8)party('Super memory!','You echoed a long tune!')}}
    else{oops();say(sayEl,'Oops! Listen again and try once more.');pos=0;setTimeout(play,900)}});
};
