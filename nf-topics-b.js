/* Note Friends — topics, units 3 & 4: Rhythm, Music Signs */
let spaceTap=null; // set by the beat page so the space bar can tap

/* ---- The Steady Beat ---- */
MOUNT.beat=root=>{
  let bpm=80,running=false,beatT=0,good=0;const GOAL=8;
  page(root,{body:`
  <div class="panel heartbox">${HEART}<div style="display:flex;flex-direction:column;gap:12px;align-items:center">${beatDots(4)}<div class="row">${chipGroup('Speed',[['60','Turtle'],['80','Walking'],['110','Rabbit']],'80')}</div><button class="btn primary" id="go">${ICON.play} Start the beat</button></div>
  <div style="display:flex;flex-direction:column;gap:12px;align-items:center"><button class="tapbig" id="tap">Tap!</button><div class="tapmeter" id="meter">${'<i></i>'.repeat(GOAL)}</div></div></div>
  <div class="say" id="say">Press Start, then tap the big button (or the space bar) with every heartbeat.</div>`,
  notes:['The beat is like a heartbeat: it keeps going, steady, never rushing. Have the child put a hand on their chest.','March, pat knees or clap with the clicks before using the big button.','Count out loud "1 2 3 4" with the dots. Beat 1 is a little louder.','Get <em>8 taps on the beat</em> to fill the meter and earn a star!'],quiz:'echo'});
  const heart=$('#heart',root),sayEl=$('#say',root),meter=$('#meter',root),goB=$('#go',root);
  const paint=()=>$$('i',meter).forEach((x,i)=>x.classList.toggle('on',i<good));
  bindChips(root,'Speed',v=>{bpm=+v});
  const stop=()=>{running=false;cancelRuns();goB.innerHTML=`${ICON.play} Start the beat`;setBeat(root,-1)};
  goB.onclick=()=>{if(running)return stop();running=true;goB.innerHTML=`${ICON.stop} Stop`;run(async g=>{let k=0;while(!g()){beatT=performance.now();heart.classList.remove('beat');void heart.getBoundingClientRect();heart.classList.add('beat');setBeat(root,k%4);click(k%4===0);k++;await wait(60000/bpm)}})};
  const tap=()=>{const btn=$('#tap',root);if(!running){say(sayEl,'Press <span class="hl">Start the beat</span> first!');return}
    const per=60000/bpm,now=performance.now(),diff=Math.min(Math.abs(now-beatT),Math.abs(beatT+per-now));
    if(diff<110){good++;paint();burst(btn,14);say(sayEl,['Right on the beat!','Perfect!','Yes, steady!','Super timing!'][rnd(4)]);
      if(good>=GOAL){addStar();stop();party('Steady beat!','You tapped 8 beats right in time.',()=>{good=0;paint()},'Again!')}}
    else if(diff<200)say(sayEl,'Close! Listen for the click.');else say(sayEl,'Wait for the heartbeat… then tap.')};
  $('#tap',root).onpointerdown=e=>{e.preventDefault();tap()};spaceTap=tap;
};

/* ---- Note Lengths ---- */
MOUNT.values=root=>{
  const VAL=[
    {k:'w',n:'Whole note',b:4,sy:'ta-a-a-a',ds:'Empty oval, no stem. Hold for 4 beats.'},
    {k:'hd',n:'Dotted half',b:3,sy:'ta-a-a',ds:'A half note with a dot. The dot adds 1 more beat.'},
    {k:'h',n:'Half note',b:2,sy:'ta-a',ds:'Empty oval with a stem. Hold for 2 beats.'},
    {k:'q',n:'Quarter note',b:1,sy:'ta',ds:'Filled oval with a stem. 1 beat.'},
    {k:'ee',n:'Two eighths',b:1,sy:'ti-ti',ds:'Two quick notes holding hands with a beam. Together they make 1 beat.'}];
  const pic=v=>{if(v.k==='ee'){const a={type:'note',d:31,dur:'e',x:62,stem:'up',beamed:true},b={type:'note',d:31,dur:'e',x:118,stem:'up',beamed:true};return engrave({clef:null,width:180,height:250,x0:12,x1:168,items:[a,b,{type:'beam',a,b}]})}return mini({type:'note',d:31,dur:v.k})};
  const blocks=v=>v.k==='ee'?'<span class="blocks"><i class="half f"></i><i class="half f"></i><i></i><i></i><i></i></span>':`<span class="blocks">${[0,1,2,3].map(i=>`<i class="${i<v.b?'f':''}"></i>`).join('')}</span>`;
  const TREE=[['w',1,'1 whole note'],['h',2,'2 half notes'],['q',4,'4 quarter notes'],['e',8,'8 eighth notes']];
  const treeSVG=(dur,n)=>{const items=[],w=700/n;for(let k=0;k<n;k++)items.push({type:'note',d:34,dur,x:60+(k+.5)*w,stem:'up',i:k});if(dur==='e')for(let k=0;k<n;k+=2){items[k].beamed=items[k+1].beamed=true;items.push({type:'beam',a:items[k],b:items[k+1]})}return engrave({staves:[{oneLine:true,top:58}],width:800,height:140,x0:20,x1:780,items})};
  page(root,{body:`
  <div class="cards" id="cards">${VAL.map((v,i)=>`<button class="vcard" data-v="${i}">${pic(v)}<b>${v.n}</b>${blocks(v)}<span class="sy">${v.sy}</span><span class="ds">${v.ds}</span></button>`).join('')}</div>
  <div class="say" id="say">Tap a note card to hear how long it lasts.</div>
  <div class="panel" style="display:flex;flex-direction:column;gap:6px"><span class="lbl">The note tree: every row fills the same 4 beats</span>${TREE.map(([d,n,l],r)=>`<div class="treerow"><button class="btn small" data-r="${r}">${ICON.play} ${l}</button><div class="svgwrap" id="tr${r}">${treeSVG(d,n)}</div></div>`).join('')}</div>`,
  notes:['Say the rhythm words: whole = <em>ta-a-a-a</em>, half = <em>ta-a</em>, quarter = <em>ta</em>, eighths = <em>ti-ti</em>.','Use your hands: clap once and keep hands together while counting the held beats.','Note tree: 1 whole = 2 halves = 4 quarters = 8 eighths. Like cutting a pizza into smaller slices!','Ask: "Which is longer, a half note or a quarter note?"'],quiz:'beats'});
  const sayEl=$('#say',root);
  $$('.vcard',root).forEach(c=>c.onclick=()=>run(async g=>{
    $$('.vcard',root).forEach(x=>x.classList.toggle('on',x===c));const v=VAL[+c.dataset.v],bl=$$('.blocks i',c);bl.forEach(x=>x.classList.remove('lit'));
    say(sayEl,`<span class="hl">${v.n}</span>: ${v.b} beat${v.b>1?'s':''}. Say “${v.sy}”!`);
    if(v.k==='ee'){tone(67,.3);bl[0].classList.add('lit');click(true);await wait(375);if(g())return;tone(67,.3);bl[1].classList.add('lit');await wait(375);bl.forEach(x=>x.classList.remove('lit'));return}
    tone(67,v.b*.75*.95+.2);for(let k=0;k<v.b;k++){if(g())return;bl[k].classList.add('lit');click(k===0);await wait(750)}bl.forEach(x=>x.classList.remove('lit'));
  }));
  $$('[data-r]',root).forEach(bt=>bt.onclick=()=>run(async g=>{const [d,n]=TREE[+bt.dataset.r],el=$('#tr'+bt.dataset.r,root),evts=Array.from({length:n},()=>({d:34,dur:d,midi:67}));say(sayEl,`${TREE[+bt.dataset.r][2]} = <span class="hl">4 beats</span>. Listen!`);await playEvents(evts,{bpm:80,gone:g,click:true,onEvent:i=>hl(el,i)});hl(el,null)}));
};

/* ---- Rests ---- */
MOUNT.rests=root=>{
  const RS=[{k:'w',n:'Whole rest',b:4,ds:'Hangs down from Line 4, like a hole in the ground. 4 quiet beats.'},{k:'h',n:'Half rest',b:2,ds:'Sits on top of Line 3, like a hat. 2 quiet beats.'},{k:'q',n:'Quarter rest',b:1,ds:'A zig-zag squiggle. 1 quiet beat.'},{k:'e',n:'Eighth rest',b:.5,ds:'A little 7 with a dot. Half a quiet beat.'}];
  const DEMO=[['q','rq','q','rq'],['h','rh'],['q','q','rh'],['rq','q','rq','q'],['q','rq','rq','q']];
  let cur=0;
  page(root,{body:`
  <div class="cards">${RS.map((r,i)=>`<button class="vcard" data-r="${i}">${mini({type:'rest',dur:r.k})}<b>${r.n}</b><span class="blocks">${r.k==='e'?'<i class="half q"></i>':[0,1,2,3].map(k=>`<i class="${k<r.b?'q':''}"></i>`).join('')}</span><span class="sy">shh</span><span class="ds">${r.ds}</span></button>`).join('')}</div>
  <div class="row"><span class="lbl">Try a rhythm</span>${DEMO.map((p,i)=>`<button class="chip" data-opt="Demo" data-v="${i}" aria-pressed="${i===0}">${i+1}</button>`).join('')}<button class="btn primary" id="play">${ICON.play} Play</button></div>
  <div class="panel svgwrap" id="sv"></div>${beatDots(4)}
  <div class="say" id="say">Rests are quiet beats. We still count them, but we don't play.</div>`,
  notes:['Rests are not "nothing". They are quiet beats we still count. Put a finger on your lips and whisper "shh".','Whole rest <em>hangs down</em> (heavy, like a hole). Half rest <em>sits on top</em> (light, like a hat).','Play a rhythm and let the child show "open hands" on every rest.'],quiz:'beats'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{const {items}=layout(rhythm(DEMO[cur],34),{startX:20,BW:150,pad:40,lead:40,counts:true,syl:true,stem:'up',letters:false,colors:false,final:true});sv.innerHTML=engrave({staves:[{oneLine:true,top:60}],width:800,height:230,x0:20,x1:780,items})};draw();
  bindChips(root,'Demo',v=>{cur=+v;cancelRuns();draw()});
  $$('.vcard',root).forEach(c=>c.onclick=()=>run(async g=>{const r=RS[+c.dataset.r];$$('.vcard',root).forEach(x=>x.classList.toggle('on',x===c));say(sayEl,`<span class="hl">${r.n}</span>: ${r.ds}`);const n=Math.max(1,r.b);for(let k=0;k<n;k++){if(g())return;click(k===0);await wait(r.b<1?375:700)}}));
  $('#play',root).onclick=()=>run(async g=>{say(sayEl,'Clap on the notes, shh on the rests!');await playEvents(rhythm(DEMO[cur]),{bpm:84,gone:g,clap:true,onEvent:(i,e)=>{hl(sv,i);if(e.rest)say(sayEl,'<span class="hl">shh…</span>');else say(sayEl,'clap!')},onBeat:k=>setBeat(root,k)});hl(sv,null);setBeat(root,-1);say(sayEl,'Nice! Try another rhythm.')});
};

/* ---- Bar Lines & Time Signatures ---- */
MOUNT.measures=root=>{
  const TS={'4':{ts:[4,4],s:'C4q D4q E4q F4q | G4q F4q E4q D4q | C4w',w:'March: 1 2 3 4'},'3':{ts:[3,4],s:'C4q E4q G4q | G4q E4q C4q | C4hd',w:'Waltz: 1 2 3'},'2':{ts:[2,4],s:'C4q G4q | E4q G4q | C4h',w:'Marching feet: 1 2'}};
  let k='4';
  page(root,{body:`
  <div class="row">${chipGroup('Time',[['4','4/4'],['3','3/4'],['2','2/4']],k)}<button class="btn primary" id="play">${ICON.play} Play and count</button><button class="btn" id="ts">What do the numbers mean?</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel"><span class="lbl">Each box is a train car. The top number says how many seats it has.</span><div class="train" id="train" style="margin-top:10px"></div></div>
  <div class="say" id="say">Bar lines cut music into boxes called <span class="hl">measures</span>.</div>`,
  notes:['<em>Bar lines</em> make boxes called measures. The thick double line at the end means <em>The End</em>.','The <em>top number</em> of the time signature = how many beats in each box. The bottom 4 means a quarter note gets one beat.','4/4 feels like marching, 3/4 like a waltz (sway side to side), 2/4 like left-right feet.','Count out loud and make beat 1 a little stronger.'],quiz:'fill'});
  const sv=$('#sv',root),tr=$('#train',root),sayEl=$('#say',root);let glowTime=false;
  const draw=()=>{const t=TS[k],evts=parse(t.s),per=t.ts[0];const {items}=layout(evts,{startX:150,per,BW:52,pad:40,lead:30,final:true,counts:true});sv.innerHTML=engrave({clef:'treble',timeSig:t.ts,glowTime,items,height:285});tr.innerHTML=[0,1,2].map(m=>`<div class="car">${'<i></i>'.repeat(per)}</div>`).join('')};draw();
  bindChips(root,'Time',v=>{k=v;cancelRuns();draw();say(sayEl,TS[k].w)});
  $('#ts',root).onclick=()=>{glowTime=true;draw();const t=TS[k].ts;say(sayEl,`Top number <span class="hl">${t[0]}</span>: ${t[0]} beats in every box. Bottom number <span class="hl">${t[1]}</span>: a quarter note gets 1 beat.`);setTimeout(()=>{glowTime=false;draw()},2500)};
  $('#play',root).onclick=()=>run(async g=>{const t=TS[k],evts=parse(t.s),per=t.ts[0];const seats=$$('.car',tr).map(c=>$$('i',c));say(sayEl,t.w);
    await playEvents(evts,{bpm:92,per,gone:g,click:true,onEvent:i=>hl(sv,i),onBeat:(bb,abs)=>{seats.flat().forEach(x=>x.classList.remove('on'));const car=Math.floor(abs/per);if(seats[car])seats[car][bb].classList.add('on')}});hl(sv,null);seats.flat().forEach(x=>x.classList.remove('on'))});
};

/* ---- Count & Clap ---- */
const RHY=[
  {n:'Four steps',p:['q','q','q','q']},{n:'Two long',p:['h','h']},{n:'One big one',p:['w']},
  {n:'Short short long',p:['q','q','h']},{n:'Long short short',p:['h','q','q']},{n:'Short long short',p:['q','h','q']},
  {n:'Running feet',p:['e','e','q','e','e','q']},{n:'Hop and rest',p:['q','rq','q','rq']},{n:'Three and one',p:['hd','q']},{n:'Gallop',p:['q','e','e','q','e','e']}];
MOUNT.count=root=>{
  let cur=0,mode='clap';
  page(root,{body:`
  <div class="cards" id="rc">${RHY.map((r,i)=>`<button class="vcard${i===0?' on':''}" data-i="${i}">${rhythmCard(r.p,240)}<b>${r.n}</b></button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Count in &amp; play</button>${chipGroup('Sound',[['clap','Clap'],['piano','Piano']],mode)}</div>
  <div class="panel svgwrap" id="sv"></div>${beatDots(4)}
  <div class="say" id="say">Pick a rhythm card. We count “1 2 3 4” first, then clap together!</div>`,
  notes:['Always count in: "1, 2, ready, go!"','First say the rhythm words (ta, ta-a, ti-ti), then clap, then play it on one piano key.','Echo game: you clap a card, the child finds which card it was. (Try the <em>Rhythm Detective</em> quiz.)'],quiz:'echo'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{const {items}=layout(rhythm(RHY[cur].p,34),{startX:20,BW:150,pad:40,lead:40,counts:true,syl:true,stem:'up',letters:false,colors:false,final:true});sv.innerHTML=engrave({staves:[{oneLine:true,top:60}],width:800,height:230,x0:20,x1:780,items})};draw();
  $$('.vcard',root).forEach(c=>c.onclick=()=>{cancelRuns();cur=+c.dataset.i;$$('.vcard',root).forEach(x=>x.classList.toggle('on',x===c));draw();say(sayEl,`<span class="hl">${RHY[cur].n}</span>: ${RHY[cur].p.map(t=>t[0]==='r'?'shh':SYL[t]).join(' ')}`)});
  bindChips(root,'Sound',v=>mode=v);
  $('#play',root).onclick=()=>run(async g=>{const bpm=84,ms=60000/bpm;for(let k=0;k<4;k++){if(g())return;setBeat(root,k);click(k===0);say(sayEl,['1','2','Ready','Go!'][k]);await wait(ms)}
    await playEvents(rhythm(RHY[cur].p),{bpm,gone:g,clap:mode==='clap',click:true,onEvent:(i,e)=>{hl(sv,i);say(sayEl,e.rest?'shh':SYL[e.dur])},onBeat:k=>setBeat(root,k)});hl(sv,null);setBeat(root,-1);say(sayEl,'Great clapping! Try another card.')});
};

/* ---- shared demo for music-sign pages ---- */
function signPage(root,{body,notes,quiz,examples,label}){
  let cur=0;
  page(root,{body:`<div class="row">${examples.length>1?chipGroup('Example',examples.map((x,i)=>[String(i),x.n]),'0'):''}</div><div class="panel svgwrap" id="sv"></div>${body}<div class="say" id="say">${examples[0].say||''}</div>`,notes,quiz});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{const ex=examples[cur];sv.innerHTML=ex.draw()};
  bindChips(root,'Example',v=>{cur=+v;cancelRuns();draw();say(sayEl,examples[cur].say||'')});
  draw();return{sv,sayEl,ex:()=>examples[cur]};
}
function sheet(evts,o={}){const {items}=layout(evts,{startX:o.clef===false?40:150,BW:o.BW||44,pad:40,lead:30,final:true,...o});return engrave({clef:o.clef===false?null:'treble',timeSig:o.ts===false?null:[4,4],items:[...items,...(o.extra?o.extra(items):[])],height:o.height||275})}

/* ---- Tie ---- */
MOUNT.tie=root=>{
  const EX=[{n:'C + C',s:'C4h~ C4h',m:'2 + 2 = 4 beats'},{n:'G + G',s:'E4q F4q G4h~ | G4h E4h',m:'2 + 2 = 4 beats of G'},{n:'Across the bar',s:'C4q D4q E4q F4q~ | F4hd rq',m:'1 + 3 = 4 beats of F'}].map(x=>({...x,say:`A <span class="hl">tie</span> joins two notes that are the same. ${x.m}, but only <span class="hl">one</span> sound!`,draw:()=>sheet(parse(x.s),{tieColor:'var(--star)'})}));
  const h=signPage(root,{examples:EX,body:`<div class="row"><button class="btn primary" id="with">${ICON.play} Play with the tie</button><button class="btn" id="without">${ICON.play} Play without the tie</button></div>
  <div class="twoup"><div class="mini"><div><b>Tie = same notes</b><span>The curve joins two notes on the <span class="hl">same line or space</span>. Add their beats together.</span></div></div><div class="mini"><div><b>Play once, hold on</b><span>Press the key once and keep holding while you count both notes.</span></div></div></div>`,
  notes:['A tie is a curved line between two notes that are <em>exactly the same</em> (same line or space).','We play the first note and <em>keep holding</em> through the second. Add the beats: 2 + 2 = 4.','Ties often cross a bar line, to hold a note into the next box.','Compare the two buttons: with the tie you hear one long sound; without it, two sounds.'],quiz:'ts'});
  const go=ignore=>run(async g=>{const evts=parse(h.ex().s);await playEvents(evts,{bpm:84,gone:g,click:true,ignoreTies:ignore,onEvent:i=>hl(h.sv,i)});hl(h.sv,null)});
  $('#with',root).onclick=()=>{say(h.sayEl,'With the tie: <span class="hl">one</span> long sound. Hold it!');go(false)};
  $('#without',root).onclick=()=>{say(h.sayEl,'Without the tie: <span class="hl">two</span> sounds. Hear the difference?');go(true)};
};

/* ---- Slur ---- */
MOUNT.slur=root=>{
  const mk=(s,a,b,below)=>()=>sheet(parse(s),{extra:items=>{const ns=items.filter(x=>x.type==='note');return[{type:'slur',a:ns[a],b:ns[b],below,color:'var(--pink)'}]}});
  const EX=[{n:'Up the hill',draw:mk('C4q D4q E4q F4q | G4w',0,4,true)},{n:'Down the hill',draw:mk('G4q F4q E4q D4q | C4w',0,4,true)},{n:'Little waves',draw:mk('C4q D4q E4h | E4q D4q C4h',0,2,true)}].map(x=>({...x,say:'A <span class="hl">slur</span> joins <span class="hl">different</span> notes. Play them smooth, like a snake sliding.'}));
  const evOf=i=>parse(['C4q D4q E4q F4q G4w','G4q F4q E4q D4q C4w','C4q D4q E4h E4q D4q C4h'][i]);
  let idx=0;
  const h=signPage(root,{examples:EX,body:`<div class="row"><button class="btn primary" id="smooth">${ICON.play} Smooth (with slur)</button><button class="btn" id="bumpy">${ICON.play} Bumpy (no slur)</button></div>
  <div class="twoup"><div class="mini"><div><b>Tie</b><span>Same notes holding hands. Play once, hold.</span></div></div><div class="mini"><div><b>Slur</b><span>Different notes holding hands. Play each one, but smooth and connected.</span></div></div></div>`,
  notes:['A slur is a curve over or under <em>different</em> notes. We play every note, but smoothly, with no gaps (legato).','Imagine walking on tiptoe without lifting a foot off the ground, or a snake sliding.','Tie vs slur: the tie joins the <em>same</em> note, the slur joins <em>different</em> notes.'],quiz:'ts'});
  bindChips(root,'Example',v=>idx=+v);
  $('#smooth',root).onclick=()=>run(async g=>{say(h.sayEl,'Smooth and connected… like a snake.');await playEvents(evOf(idx),{bpm:88,gone:g,legato:true,onEvent:i=>hl(h.sv,i)});hl(h.sv,null)});
  $('#bumpy',root).onclick=()=>run(async g=>{say(h.sayEl,'Bumpy, with little gaps. No slur!');await playEvents(evOf(idx),{bpm:88,gone:g,detached:true,onEvent:i=>hl(h.sv,i)});hl(h.sv,null)});
};

/* ---- Staccato ---- */
MOUNT.stacc=root=>{
  const SS=['C4q. E4q. G4q. E4q. | C4q. C4q. C4h','G4q. G4q. G4q. rq | E4q. E4q. C4h','C4q. D4q. E4q. F4q. | G4q. G4q. G4h'];
  const EX=SS.map((s,i)=>({n:['Popcorn','Bouncing ball','Raindrops'][i],say:'A dot over or under the note means <span class="hl">staccato</span>: short and bouncy!',draw:()=>sheet(parse(s))}));
  let idx=0;
  const h=signPage(root,{examples:EX,body:`<div class="row"><button class="btn primary" id="st">${ICON.play} Play bouncy (staccato)</button><button class="btn" id="no">${ICON.play} Play without dots</button></div>`,
  notes:['The staccato dot sits on the opposite side of the stem, right by the note head.','Play it like the key is hot! Touch it and bounce away.','Do not confuse it with the dot <em>beside</em> a note (dotted half), which makes the note longer.'],quiz:'beats'});
  bindChips(root,'Example',v=>idx=+v);
  $('#st',root).onclick=()=>run(async g=>{say(h.sayEl,'Pop! Pop! Short and bouncy.');await playEvents(parse(SS[idx]),{bpm:96,gone:g,onEvent:i=>hl(h.sv,i)});hl(h.sv,null)});
  $('#no',root).onclick=()=>run(async g=>{say(h.sayEl,'Without the dots, the notes are full length.');await playEvents(parse(SS[idx]),{bpm:96,gone:g,noStacc:true,onEvent:i=>hl(h.sv,i)});hl(h.sv,null)});
};

/* ---- Loud & Soft ---- */
const DYN=[{s:'pp',w:'pianissimo',m:'very, very soft',v:.05,k:'mouse',z:.55},{s:'p',w:'piano',m:'soft',v:.1,k:'mouse',z:.75},{s:'mp',w:'mezzo piano',m:'medium soft',v:.17,k:'blob',z:.8},{s:'mf',w:'mezzo forte',m:'medium loud',v:.26,k:'blob',z:.95},{s:'f',w:'forte',m:'loud',v:.4,k:'lion',z:1.05},{s:'ff',w:'fortissimo',m:'very, very loud',v:.55,k:'lion',z:1.25}];
const TUNE='C4q E4q G4q E4q | C4h';
MOUNT.dyn=root=>{
  page(root,{body:`
  <div class="cards">${DYN.map((d,i)=>`<button class="vcard" data-i="${i}"><span class="dynsym">${d.s}</span><span style="transform:scale(${d.z})">${critter(d.k)}</span><b>${d.w}</b><span class="ds">${d.m}</span></button>`).join('')}</div>
  <div class="panel"><span class="lbl">How loud?</span><div class="meter" style="margin-top:8px"><i id="mt"></i></div></div>
  <div class="say" id="say">Tap a card to hear the same tune soft or loud.</div>`,
  notes:['<em>p</em> = piano = soft (a little mouse). <em>f</em> = forte = loud (a big lion). The m means "medium".','Fun fact: the piano got its name from "pianoforte", because it can play both soft and loud!','Play the same song as a mouse, then as a lion. Ask the child which one you played.'],quiz:'dyn'});
  const sayEl=$('#say',root),mt=$('#mt',root);
  $$('.vcard',root).forEach(c=>c.onclick=()=>run(async g=>{const d=DYN[+c.dataset.i];$$('.vcard',root).forEach(x=>x.classList.toggle('on',x===c));mt.style.width=(d.v/.55*100)+'%';say(sayEl,`<span class="dynsym" style="font-size:1.3em">${d.s}</span> <span class="hl">${d.w}</span>: play ${d.m}.`);await playEvents(parse(TUNE),{bpm:110,gone:g,vol:d.v})}));
};

/* ---- Getting Louder & Softer ---- */
MOUNT.cresc=root=>{
  const BAL=`<svg class="balloon" viewBox="0 0 160 200" aria-hidden="true"><path d="M80 150 Q74 172 86 196" stroke="var(--muted)" stroke-width="2" fill="none"/><g id="bal"><ellipse cx="80" cy="80" rx="48" ry="58" fill="var(--pink)"/><ellipse cx="62" cy="58" rx="10" ry="16" fill="rgba(255,255,255,.4)" transform="rotate(-20 62 58)"/><path d="M74 136 L86 136 L80 146Z" fill="var(--pink)"/></g></svg>`;
  const ev=parse('C4q D4q E4q F4q | G4q A4q B4q C5q');
  let k='c';
  const draw=()=>sheet(parse('C4q D4q E4q F4q | G4q A4q B4q C5q'),{extra:()=>[{type:'hairpin',x1:180,x2:740,cresc:k==='c'},{type:'dyn',x:155,text:k==='c'?'p':'f'},{type:'dyn',x:770,text:k==='c'?'f':'p'}]});
  page(root,{body:`
  <div class="row">${chipGroup('Sign',[['c','Crescendo'],['d','Decrescendo']],k)}<button class="btn primary" id="play">${ICON.play} Play it</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel" style="text-align:center">${BAL}</div>
  <div class="say" id="say">The opening shape <span class="hl">&lt;</span> means get louder. The closing shape <span class="hl">&gt;</span> means get softer.</div>`,
  notes:['These signs look like an open mouth, called hairpins. <em>Crescendo</em> (&lt;): grow louder, like blowing up a balloon. <em>Decrescendo</em> (&gt;): get softer, like letting the air out.','Crouch down small and slowly stand up tall while singing louder. Then the opposite.','Ask: "Is the mouth opening or closing?"'],quiz:'dyn'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const redraw=()=>{sv.innerHTML=draw()};redraw();
  bindChips(root,'Sign',v=>{k=v;cancelRuns();redraw();$('#bal',root).style.transform='scale(1)'});
  $('#play',root).onclick=()=>run(async g=>{const bal=$('#bal',root);say(sayEl,k==='c'?'Crescendo! Growing louder, like a balloon filling up…':'Decrescendo! Getting softer, the balloon gets smaller…');
    await playEvents(ev,{bpm:100,gone:g,volFn:i=>{const t=k==='c'?i/7:1-i/7;bal.style.transform=`scale(${.35+t*.75})`;return .05+t*.45},onEvent:i=>hl(sv,i)});hl(sv,null)});
};

/* ---- Fast & Slow ---- */
MOUNT.tempo=root=>{
  let bpm=90;
  const word=b=>b<70?['Largo','very slow','turtle']:b<100?['Andante','walking speed','blob']:b<130?['Allegro','fast and happy','rabbit']:['Presto','super fast','rabbit'];
  page(root,{body:`
  <div class="panel" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center"><span id="crit">${critter('blob')}</span><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><b id="tw" style="font-family:var(--font-display);font-size:34px;line-height:1"></b><span class="muted" id="tm"></span><input type="range" id="bpm" min="50" max="160" value="90" aria-label="Speed"><span class="muted" id="tn"></span></div></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play Twinkle</button><button class="btn" data-b="56">Turtle</button><button class="btn" data-b="90">Walking</button><button class="btn" data-b="132">Rabbit</button></div>
  <div class="panel svgwrap" id="sv"></div>${beatDots(4)}
  <div class="say" id="say">Tempo means speed. Slide to make the beat faster or slower.</div>`,
  notes:['Tempo = how fast the beat goes. The notes stay the same; only the speed changes.','Italian words on music: <em>Largo</em> (very slow), <em>Andante</em> (walking), <em>Allegro</em> (fast and happy), <em>Presto</em> (super fast).','Walk around the room to the beat: turtle steps, walking steps, rabbit hops.'],quiz:'echo'});
  const sv=$('#sv',root),sayEl=$('#say',root),ev=()=>parse('C4q C4q G4q G4q | A4q A4q G4h');
  sv.innerHTML=sheet(ev());
  const upd=()=>{const [w,m,c]=word(bpm);$('#tw',root).textContent=w;$('#tm',root).textContent=m;$('#tn',root).textContent=`${bpm} beats in a minute`;$('#crit',root).innerHTML=critter(c);$('#bpm',root).value=bpm};upd();
  $('#bpm',root).oninput=e=>{bpm=+e.target.value;upd()};
  $$('[data-b]',root).forEach(b=>b.onclick=()=>{bpm=+b.dataset.b;upd()});
  $('#play',root).onclick=()=>run(async g=>{say(sayEl,`Playing at <span class="hl">${word(bpm)[0]}</span> speed.`);await playEvents(ev(),{bpm,gone:g,click:true,onEvent:i=>hl(sv,i),onBeat:k=>setBeat(root,k)});hl(sv,null);setBeat(root,-1)});
};

/* ---- Repeat Sign ---- */
MOUNT.repeat=root=>{
  const S1='C4q D4q E4q F4q | G4q G4q G4h';let out=false;
  page(root,{body:`
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play with the repeat</button><button class="chip" id="wo" aria-pressed="false">Show it written out</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="row" style="justify-content:center"><span class="lbl">Time</span><span class="beats"><span id="t1">1</span><span id="t2">2</span></span></div>
  <div class="say" id="say">Two dots beside a thick bar line say: <span class="hl">go back and play it again!</span></div>`,
  notes:['The repeat sign is a thick bar line with two dots. The dots "look back" to where we go.','Without a repeat sign we would have to write the music twice. Show both versions to compare.','Ask the child to point back to the start when the music reaches the dots.'],quiz:'fill'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{if(out){const {items}=layout(parse(S1+' | '+S1),{startX:150,BW:32,pad:34,final:true});sv.innerHTML=engrave({clef:'treble',timeSig:[4,4],items})}else{const {items}=layout(parse(S1),{startX:150,BW:60,pad:40,lead:30,repeatEnd:true});sv.innerHTML=engrave({clef:'treble',timeSig:[4,4],items})}};draw();
  $('#wo',root).onclick=e=>{out=!out;e.currentTarget.setAttribute('aria-pressed',out);cancelRuns();draw();say(sayEl,out?'Written out the long way: the same music twice!':'With a repeat sign it is shorter to write.')};
  $('#play',root).onclick=()=>run(async g=>{if(out){out=false;$('#wo',root).setAttribute('aria-pressed',false);draw()}const t1=$('#t1',root),t2=$('#t2',root);
    for(let t=0;t<2;t++){t1.classList.toggle('on',t===0);t2.classList.toggle('on',t===1);say(sayEl,t===0?'First time through…':'<span class="hl">Go back!</span> Second time…');if(!await playEvents(parse(S1),{bpm:96,gone:g,onEvent:i=>hl(sv,i)}))return}
    hl(sv,null);t1.classList.remove('on');t2.classList.remove('on');say(sayEl,'We played it twice! That is what the repeat sign means.')});
};
