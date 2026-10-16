/* Note Friends — topics, unit 5: Make Music */

/* ---- Notes + Rhythm = Music ---- */
MOUNT.mix=root=>{
  const MEL=[['E','D','C'],['C','D','E'],['G','E','C'],['C','E','G'],['G','G','C']];
  const RH=[['q','q','h'],['h','q','q'],['q','h','q'],['h','h'],['w']];
  let mi=0,ri=0;
  const fit=()=>{const r=RH[ri],m=MEL[mi];return r.map((d,i)=>m[i%m.length])};
  page(root,{body:`
  <div class="mix">
    <div class="panel"><span class="lbl">1. Which notes? (where on the staff)</span><div class="pickrow" id="pm" style="margin-top:10px">${MEL.map((m,i)=>`<button class="pick" data-m="${i}" aria-pressed="${i===0}">${m.map(L=>`<span class="lt" style="--nc:${COLOR[L]}">${L}</span>`).join('')}</button>`).join('')}</div></div>
    <div class="panel"><span class="lbl">2. How long? (the note shapes)</span><div class="pickrow" id="pr" style="margin-top:10px">${RH.map((r,i)=>`<button class="pick" data-r="${i}" aria-pressed="${i===0}">${rhythmCard(r,200)}</button>`).join('')}</div></div>
  </div>
  <div class="eq">notes + rhythm = music!</div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play my tune</button><button class="btn" id="sur">Surprise me!</button></div>
  <div class="say" id="say">Pick some notes and a rhythm. Together they make a tune.</div>`,
  notes:['Every note on the staff tells us two things: <em>which key</em> (its line or space) and <em>how long</em> (its shape).','Keep the same letters and change the rhythm: it sounds like a different tune!','Ask the child to sing the letters in rhythm before playing it on the piano.','If the rhythm has more notes than letters, the letters start again from the beginning.'],quiz:'fill'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const evts=()=>{const L=fit();return RH[ri].map((d,i)=>{const dd=28+LETTERS.indexOf(L[i]);return{d:dd,dur:d,letter:L[i],color:COLOR[L[i]],midi:dMidi(dd)}})};
  const draw=()=>{const {items}=layout(evts(),{startX:150,BW:110,pad:40,lead:40,final:true,counts:true,syl:true});sv.innerHTML=engrave({clef:'treble',timeSig:[4,4],items,height:300,width:800})};draw();
  const playIt=()=>run(async g=>{await playEvents(evts(),{bpm:84,gone:g,click:true,onEvent:i=>hl(sv,i)});hl(sv,null)});
  $$('[data-m]',root).forEach(b=>b.onclick=()=>{mi=+b.dataset.m;$$('[data-m]',root).forEach(x=>x.setAttribute('aria-pressed',x===b));draw();playIt()});
  $$('[data-r]',root).forEach(b=>b.onclick=()=>{ri=+b.dataset.r;$$('[data-r]',root).forEach(x=>x.setAttribute('aria-pressed',x===b));draw();playIt()});
  $('#play',root).onclick=()=>{say(sayEl,`${fit().map(tag).join(' ')} <span class="muted">${RH[ri].map(t=>SYL[t]).join(' ')}</span>`);playIt()};
  $('#sur',root).onclick=()=>{mi=rnd(MEL.length);ri=rnd(RH.length);$$('[data-m]',root).forEach((x,i)=>x.setAttribute('aria-pressed',i===mi));$$('[data-r]',root).forEach((x,i)=>x.setAttribute('aria-pressed',i===ri));draw();say(sayEl,'A surprise tune! Can you sing it?');playIt();burst($('#sur',root),18)};
};

/* ---- Play a Song ---- */
const SONGS=[
  {n:'Hot Cross Buns',s:'E4q D4q C4h | E4q D4q C4h | C4e C4e C4e C4e D4e D4e D4e D4e | E4q D4q C4h'},
  {n:'Mary Had a Little Lamb',s:'E4q D4q C4q D4q | E4q E4q E4h | D4q D4q D4h | E4q G4q G4h | E4q D4q C4q D4q | E4q E4q E4q E4q | D4q D4q E4q D4q | C4w'},
  {n:'Twinkle Twinkle Little Star',s:'C4q C4q G4q G4q | A4q A4q G4h | F4q F4q E4q E4q | D4q D4q C4h | G4q G4q F4q F4q | E4q E4q D4h | G4q G4q F4q F4q | E4q E4q D4h | C4q C4q G4q G4q | A4q A4q G4h | F4q F4q E4q E4q | D4q D4q C4h'},
  {n:'Jingle Bells',s:'E4q E4q E4h | E4q E4q E4h | E4q G4q C4q D4q | E4w | F4q F4q F4q F4q | F4q E4q E4q E4e E4e | E4q D4q D4q E4q | D4h G4h'},
];
MOUNT.songs=root=>{
  let si=store.get('nf-song',0),bpm=90,letters=true,counts=true,marks={};
  page(root,{body:`
  <div class="row">${chipGroup('Song',SONGS.map((s,i)=>[String(i),s.n]),String(si))}</div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Count in &amp; play</button><button class="btn" id="stop">${ICON.stop} Stop</button>${chipGroup('Speed',[['70','Slow'],['90','Medium'],['115','Fast']],'90')}<button class="chip" id="lt" aria-pressed="true">Letters</button><button class="chip" id="ct" aria-pressed="true">Counting</button></div>
  <div class="row">${beatDots(4)}<span class="say" id="say" style="flex:1;min-width:220px">Pick a song, then press play. Count along!</span></div>
  <div class="panel" id="sys" style="display:flex;flex-direction:column;gap:4px"></div>
  <div class="panel svgwrap" id="kb"></div>`,
  notes:['Before playing: clap the rhythm while counting, then sing the letter names, then play.','Watch the glowing note and the matching key light up on the piano.','Start on <em>Slow</em>. Speed up only when it feels easy.','All these songs use the right hand in C position (thumb on Middle C).'],quiz:'nn'});
  const sys=$('#sys',root),kb=$('#kb',root),sayEl=$('#say',root);
  const drawKB=()=>{kb.innerHTML=keysSVG({from:28,to:42,marks,labels:true,fingers:{60:1,62:2,64:3,65:4,67:5}})};
  let evts=[];
  const draw=()=>{
    evts=parse(SONGS[si].s);evts.forEach((e,i)=>e.gi=i);
    const measures=[];let cur=[],acc=0;evts.forEach(e=>{cur.push(e);acc+=DUR[e.dur];if(acc>=4-1e-6){measures.push(cur);cur=[];acc=0}});if(cur.length)measures.push(cur);
    const BW=38,GAP=44,PAD=30,W=820,mw=ms=>ms.reduce((a,e)=>a+Math.max(DUR[e.dur]*BW,GAP),0)+PAD;
    const lines=[];let line=[],used=0;measures.forEach(ms=>{const sx=lines.length?110:144,w=mw(ms);if(line.length&&sx+used+w>W-14){lines.push(line);line=[];used=0}line.push(ms);used+=w});if(line.length)lines.push(line);
    let html='';lines.forEach((ln,k)=>{const first=k===0,last=k===lines.length-1;
      const {items}=layout(ln.flat(),{startX:first?144:110,BW,pad:PAD,lead:22,flow:true,minGap:GAP,final:last,letters,counts});
      html+=`<div class="svgwrap">${engrave({clef:'treble',timeSig:first?[4,4]:null,items,width:W,height:counts?285:250})}</div>`});
    sys.innerHTML=html;drawKB();
  };draw();
  bindChips(root,'Song',v=>{si=+v;store.set('nf-song',si);cancelRuns();marks={};draw();say(sayEl,`<span class="hl">${SONGS[si].n}</span>. Ready?`)});
  bindChips(root,'Speed',v=>bpm=+v);
  $('#lt',root).onclick=e=>{letters=!letters;e.currentTarget.setAttribute('aria-pressed',letters);draw()};
  $('#ct',root).onclick=e=>{counts=!counts;e.currentTarget.setAttribute('aria-pressed',counts);draw()};
  $('#stop',root).onclick=()=>{cancelRuns();hl(sys,null);marks={};drawKB();setBeat(root,-1)};
  $('#play',root).onclick=()=>run(async g=>{const ms=60000/bpm;for(let k=0;k<4;k++){if(g())return;setBeat(root,k);click(k===0);say(sayEl,['1','2','Ready','Go!'][k]);await wait(ms)}
    const ok=await playEvents(evts,{bpm,gone:g,click:true,onBeat:k=>setBeat(root,k),onEvent:(i,e)=>{hl(sys,i);marks={[e.midi]:e.color};drawKB();say(sayEl,`${tag(e.letter)} ${NAME[e.dur]}`)}});
    hl(sys,null);marks={};drawKB();setBeat(root,-1);if(ok){addStar();confetti();say(sayEl,`You played <span class="hl">${SONGS[si].n}</span>! Here is a star.`)}});
};

/* ---- Write Your Own Song ---- */
MOUNT.compose=root=>{
  const START=150,BW=32,PAD=34,MW=4*BW+PAD;
  let evts=store.get('nf-comp',[]),dur='q',title=store.get('nf-comp-t','');
  const total=()=>evts.reduce((a,e)=>a+DUR[e.dur],0);
  page(root,{body:`
  <div class="row"><span class="lbl">Pick a shape</span>${[['w','Whole'],['h','Half'],['q','Quarter'],['rq','Quarter rest'],['rh','Half rest']].map(([v,t])=>`<button class="pick" data-d="${v}" aria-pressed="${v===dur}">${mini(v[0]==='r'?{type:'rest',dur:v.slice(1)}:{type:'note',d:31,dur:v},110)}<span style="font-family:var(--font-display);font-weight:700;font-size:15px">${t}</span></button>`).join('')}</div>
  <div class="row"><label class="lbl" for="ttl">Song name</label><input class="textin" id="ttl" placeholder="My song" value="${title.replace(/"/g,'&quot;')}"></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play my song</button><button class="btn" id="undo">Undo</button><button class="btn" id="clr">Start over</button><button class="btn" id="ex">Show an example</button></div>
  <div class="say" id="say">Pick a note shape, then tap the staff where you want the note.</div>`,
  notes:['Let the child choose the notes. There are no wrong songs, only the 4-beats-per-box rule!','Tip: ending on <em>C</em> makes a song sound finished.','After writing it, clap the rhythm, sing the letters, then play it on the piano together.','The song is kept on this device, so you can come back to it next lesson.'],quiz:'fill'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const save=()=>store.set('nf-comp',evts);
  const draw=()=>{evts.forEach((e,i)=>{if(!e.rest){e.letter=dLetter(e.d);e.color=COLOR[e.letter];e.midi=dMidi(e.d)}});
    const {items}=layout(evts,{startX:START,BW,pad:PAD,bars:4,final:true});const t=total();
    if(t<16){const m=Math.floor(t/4),b=t%4;items.push({type:'ghost',x:START+m*MW+24+b*BW,d:31})}
    sv.innerHTML=engrave({clef:'treble',timeSig:[4,4],items,rows:[28,38],width:820})};draw();
  $$('[data-d]',root).forEach(b=>b.onclick=()=>{dur=b.dataset.d;$$('[data-d]',root).forEach(x=>x.setAttribute('aria-pressed',x===b));if(dur[0]==='r')say(sayEl,'Rest picked. Tap anywhere on the staff to add a quiet beat.');else say(sayEl,`<span class="hl">${NAME[dur]}</span> picked (${DUR[dur]} beat${DUR[dur]>1?'s':''}). Tap the staff!`)});
  $('#ttl',root).oninput=e=>{title=e.target.value;store.set('nf-comp-t',title)};
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;const rest=dur[0]==='r',dd=rest?dur.slice(1):dur,len=DUR[dd],t=total(),left=4-(t%4);
    if(t>=16){say(sayEl,'Your song is full! Press <span class="hl">Play my song</span>.');return}
    if(len>left){oops();say(sayEl,`Only <span class="hl">${left} beat${left>1?'s':''}</span> left in this box. Pick a shorter note!`);return}
    const d=+h.dataset.d;evts.push(rest?{rest:true,dur:dd}:{d,dur:dd});save();draw();if(!rest)tone(dMidi(d),len*.6);
    const nt=total();if(nt>=16){addStar();confetti();say(sayEl,`You wrote a whole song${title?`: <span class="hl">${title}</span>`:''}! Press play to hear it.`)}else if(nt%4===0)say(sayEl,`Box ${nt/4} is full: 4 beats! Keep going.`);else say(sayEl,rest?'A quiet beat.':`${tag(dLetter(d))} ${NAME[dd]}`)});
  $('#undo',root).onclick=()=>{evts.pop();save();draw()};
  $('#clr',root).onclick=()=>{cancelRuns();evts=[];save();draw();say(sayEl,'A fresh page! Tap the staff to start.')};
  $('#ex',root).onclick=()=>{evts=parse('E4q D4q C4h | E4q D4q C4h | G4q F4q E4q D4q | C4w').map(e=>({d:e.d,dur:e.dur}));save();draw();say(sayEl,'Here is an example song. Press play, or start over and write your own!')};
  $('#play',root).onclick=()=>run(async g=>{if(!evts.length){say(sayEl,'Add some notes first!');return}say(sayEl,`Playing ${title?`<span class="hl">${title}</span>`:'your song'}…`);await playEvents(evts,{bpm:92,gone:g,click:true,onEvent:i=>hl(sv,i)});hl(sv,null);say(sayEl,'Bravo, composer!')});
};
