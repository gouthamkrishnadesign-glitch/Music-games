/* Note Friends — more lessons, units 1 & 2 */
const SH='♯',FL='♭',NA='♮';
const blackName=(m,acc)=>{const s=m%12,sharp={1:'C',3:'D',6:'F',8:'G',10:'A'}[s],flat={1:'D',3:'E',6:'G',8:'A',10:'B'}[s];return acc==='flat'?flat+FL:sharp+SH};

/* ---- Sharps & Flats ---- */
MOUNT.sharps=root=>{
  const R={from:28,to:35};let marks={},bl={},base=60;
  page(root,{body:`
  <div class="twoup">
    <div class="mini"><span class="symbig" style="color:var(--g)">${SH}</span><div><b>Sharp = go UP</b><span>Move to the very next key on the <span class="hl">right</span>. Sharp like a pin, poking up!</span></div></div>
    <div class="mini"><span class="symbig" style="color:var(--a)">${FL}</span><div><b>Flat = go DOWN</b><span>Move to the very next key on the <span class="hl">left</span>. Down like a flat tyre.</span></div></div>
    <div class="mini"><span class="symbig" style="color:var(--f)">${NA}</span><div><b>Natural = back home</b><span>Cancel the sharp or flat. Play the plain white key again.</span></div></div>
  </div>
  <div class="row"><span class="lbl">Start on</span>${LETTERS.map((L,i)=>`<button class="ans letter" style="--nc:${COLOR[L]};height:46px;min-width:46px;font-size:22px" data-b="${60+SEMI[i]}">${L}</button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="sh">${SH} Make it sharp</button><button class="btn" id="fl">${FL} Make it flat</button><button class="btn" id="na">${NA} Natural</button><button class="btn" id="tw">Two names, one key</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Pick a white key, then make it sharp or flat.</div>`,
  notes:['Sharp (♯) means the very next key to the <em>right</em>, even if it is white! E sharp lands on F.','Flat (♭) means the very next key to the <em>left</em>. C flat lands on B.','Every black key has two names: C♯ is the same key as D♭. Like a person with a nickname!','Natural (♮) cancels the sharp or flat.'],quiz:'sf'});
  const kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{kb.innerHTML=keysSVG({...R,marks,labels:true,blackLabels:bl})};
  const pickBase=m=>{base=m;marks={[m]:COLOR[midiLetter(m)]};bl={};draw();tone(m)};pickBase(60);
  $$('[data-b]',root).forEach(b=>b.onclick=()=>{pickBase(+b.dataset.b);say(sayEl,`${tag(midiLetter(base))} Now press sharp or flat!`)});
  const move=(dir,acc)=>{const m=base+dir,L=midiLetter(base);marks={[base]:'color-mix(in srgb,var(--muted) 45%,var(--key))',[m]:dir>0?'var(--g)':'var(--a)'};bl=midiLetter(m)?{}:{[m]:blackName(m,acc)};draw();tone(base,.5);tone(m,.9,.45);
    const land=midiLetter(m);say(sayEl,`${L}${acc==='sharp'?SH:FL} = one key to the <span class="hl">${dir>0?'right':'left'}</span>. ${land?`It lands on a white key: ${tag(land)}!`:`It lands on the black key <span class="hl">${blackName(m,acc)}</span>.`}`)};
  $('#sh',root).onclick=()=>move(1,'sharp');$('#fl',root).onclick=()=>move(-1,'flat');
  $('#na',root).onclick=()=>{pickBase(base);say(sayEl,`${NA} Natural! Back to plain ${tag(midiLetter(base))}.`)};
  $('#tw',root).onclick=()=>run(async g=>{for(const m of [61,63,66,68,70]){if(g())return;marks={[m]:'var(--pink)'};bl={[m]:blackName(m,'sharp')};draw();tone(m,.7);say(sayEl,`<span class="hl">${blackName(m,'sharp')}</span>`);await wait(700);if(g())return;bl={[m]:blackName(m,'flat')};draw();say(sayEl,`<span class="hl">${blackName(m,'sharp')}</span> is also called <span class="hl">${blackName(m,'flat')}</span>. Same key, two names!`);await wait(1100)}});
  bindKeys(kb,m=>{const L=midiLetter(m);if(L){pickBase(m);say(sayEl,`${tag(L)} Now press sharp or flat!`)}else{marks={[m]:'var(--pink)'};bl={[m]:blackName(m,'sharp')};draw();say(sayEl,`This black key is <span class="hl">${blackName(m,'sharp')}</span> or <span class="hl">${blackName(m,'flat')}</span>.`)}},true);
};

/* ---- Half Steps & Whole Steps ---- */
MOUNT.halfwhole=root=>{
  const R={from:28,to:35};let marks={};
  page(root,{body:`
  <div class="twoup"><div class="mini"><div><b>Half step</b><span>Next-door neighbours. Two keys with <span class="hl">nothing</span> in between. The smallest step on the piano!</span></div></div><div class="mini"><div><b>Whole step</b><span>Skip over <span class="hl">one</span> key. Two half steps glued together.</span></div></div></div>
  <div class="row"><button class="btn primary" id="hs">Show a half step</button><button class="btn primary" id="ws">Show a whole step</button><button class="btn" id="tw">The white twins: E-F and B-C</button><button class="btn" id="ch">Climb all half steps</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Tap two keys and I will tell you: half step or whole step?</div>`,
  notes:['Half step: the closest key, white or black. Whole step: skip one key in between.','E to F and B to C are special: white keys with no black key between them, so they are half steps.','Have the child "walk" with two fingers: tiny steps (half) and giant steps (whole).'],quiz:'hw'});
  const kb=$('#kb',root),sayEl=$('#say',root);let first=null;
  const draw=()=>{kb.innerHTML=keysSVG({...R,marks,labels:true})};draw();
  const nm=m=>midiLetter(m)||blackName(m,'sharp');
  const show=(a,b)=>{marks={[a]:'var(--star)',[b]:'var(--pink)'};const gap=Math.abs(b-a);if(gap===2)marks[(a+b)/2]='color-mix(in srgb,var(--muted) 45%,var(--key))';draw();tone(a,.6);tone(b,.8,.45);
    say(sayEl,gap===1?`<span class="hl">${nm(a)}</span> to <span class="hl">${nm(b)}</span>: a <span class="hl">half step</span>. Next-door neighbours!`:gap===2?`<span class="hl">${nm(a)}</span> to <span class="hl">${nm(b)}</span>: a <span class="hl">whole step</span>. We skipped one key.`:`That is ${gap} half steps apart. Try keys closer together!`)};
  $('#hs',root).onclick=()=>{const a=60+rnd(10);show(a,a+1)};
  $('#ws',root).onclick=()=>{const a=60+rnd(9);show(a,a+2)};
  $('#tw',root).onclick=()=>run(async g=>{show(64,65);await wait(1800);if(g())return;show(71,72);say(sayEl,'E-F and B-C have no black key between them, so they are <span class="hl">half steps</span> too!')});
  $('#ch',root).onclick=()=>run(async g=>{for(let m=60;m<=72;m++){if(g())return;marks={[m]:'var(--star)'};draw();tone(m,.4);say(sayEl,`Half step… ${nm(m)}`);await wait(330)}say(sayEl,'12 half steps from C to C. Every key, white and black!')});
  bindKeys(kb,m=>{if(first==null){first=m;marks={[m]:'var(--star)'};draw();say(sayEl,'Now tap a second key!')}else{show(first,m);first=null}},true);
};

/* ---- Octaves ---- */
MOUNT.octave=root=>{
  const R={from:14,to:42};let marks={};
  page(root,{body:`
  <div class="row"><span class="lbl">Find every</span>${LETTERS.map(L=>`<button class="ans letter" style="--nc:${COLOR[L]};height:46px;min-width:46px;font-size:22px" data-l="${L}">${L}</button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="jump">Octave jump</button><button class="btn" id="count">Count 8 friends</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">An octave is the same letter, 8 white keys away. Same name, higher or lower voice!</div>`,
  notes:['"Octo" means 8, like an octopus with 8 legs. Count C D E F G A B C: 8 friends from C to C.','Low C sounds like a bear, high C like a bird, but they are both C. They sound like family!','Find all the Cs on the real piano. How many are there?'],quiz:'ph'});
  const kb=$('#kb',root),sayEl=$('#say',root),draw=()=>{kb.innerHTML=keysSVG({...R,marks})};draw();
  $$('[data-l]',root).forEach(b=>b.onclick=()=>run(async g=>{const L=b.dataset.l,i=LETTERS.indexOf(L);marks={};const ds=[];for(let d=R.from;d<=R.to;d++)if(d%7===i)ds.push(d);ds.forEach(d=>marks[dMidi(d)]=COLOR[L]);draw();say(sayEl,`${tag(L)} There are <span class="hl">${ds.length}</span> ${L}s here. Low to high, all one family!`);for(const d of ds){if(g())return;tone(dMidi(d),.7);await wait(380)}}));
  $('#jump',root).onclick=()=>run(async g=>{for(const m of [48,60,72,84,72,60,48]){if(g())return;marks={[m]:'var(--c)'};draw();tone(m,.6);await wait(420)}say(sayEl,'Boing! Jumping octave to octave, always landing on C.')});
  $('#count',root).onclick=()=>run(async g=>{const ds=[28,29,30,31,32,33,34,35];marks={};for(let k=0;k<8;k++){if(g())return;const d=ds[k];marks[dMidi(d)]=COLOR[dLetter(d)];draw();tone(dMidi(d),.5);say(sayEl,`${k+1}… ${tag(dLetter(d))}`);await wait(450)}say(sayEl,'8 friends from C to C. That is an <span class="hl">octave</span>!')});
};

/* ---- Sitting & Hand Shape ---- */
MOUNT.posture=root=>{
  const ST=[['Sit on the front half of the bench','Like a bird on a branch, not slumped like a sack of potatoes.'],['Feet flat on the floor','Or on a box if the floor is far away.'],['Back tall like a giraffe','Shoulders soft and relaxed, not up by your ears.'],['Elbows a little in front of you','Arms float, like holding a beach ball.'],['Bubble hands','Curve your fingers as if holding a small bubble. Don\'t pop it!'],['Play on your fingertips','Short nails, rounded fingers, thumb on its side.']];
  page(root,{body:`
  <div class="panel" style="display:flex;flex-direction:column;gap:10px">${ST.map(([t,d],i)=>`<button class="check" data-i="${i}"><span class="box">${ICON.check.replace('class="ck"','width="24" height="24"')}</span><span><b>${t}</b><br><span class="muted" style="font-size:16px">${d}</span></span></button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="bub">Bubble hands game</button><button class="btn" id="rst">Start again</button></div>
  <div class="say" id="say">Tick each one when the child does it!</div>`,
  notes:['Go through the checklist at the start of every lesson; it becomes a habit.','Bubble hands: hold an imaginary bubble, then put that hand shape on the keys.','Pancake fingers (flat) and claw fingers (too curled) are the two to watch for.'],quiz:null});
  const sayEl=$('#say',root);
  const checks=$$('.check',root);checks.forEach(c=>{c.querySelector('svg').style.visibility='hidden';c.onclick=()=>{c.classList.toggle('on');c.querySelector('svg').style.visibility=c.classList.contains('on')?'visible':'hidden';if(c.classList.contains('on')){tone(72+rnd(8),.4);burst(c,10)}
    if(checks.every(x=>x.classList.contains('on'))){addStar();party('Ready to play!','Perfect piano posture. Great job!')}else say(sayEl,`${checks.filter(x=>x.classList.contains('on')).length} of ${checks.length} done!`)}});
  $('#rst',root).onclick=()=>{checks.forEach(c=>{c.classList.remove('on');c.querySelector('svg').style.visibility='hidden'});say(sayEl,'Tick each one when the child does it!')};
  $('#bub',root).onclick=()=>run(async g=>{const steps=['Hold a bubble in your hand…','Careful, don\'t pop it!','Now put your bubble hand on the keys.','Fingertips touch the keys… gently!','Play C D E F G with bubble fingers!'];for(const s of steps){if(g())return;say(sayEl,s);await wait(2200)}run(async g2=>{for(const m of [60,62,64,65,67]){if(g2())return;tone(m,.6);await wait(400)}})});
};

/* ---- Ledger Lines ---- */
MOUNT.ledger=root=>{
  let clef='treble',items=[];
  page(root,{body:`
  <div class="row">${chipGroup('House',[['treble','Treble'],['bass','Bass']],clef)}<button class="btn primary" id="up">Climb above the house</button><button class="btn" id="down">Go below the house</button><button class="chip" id="clr">Clear</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">When notes are too high or too low for the house, they get little helper lines called <span class="hl">ledger lines</span>.</div>`,
  notes:['A ledger line is a short line just for one note, like a little ladder step outside the house.','Middle C is the most famous ledger-line note!','Count ledger lines just like staff lines: keep going line, space, line, space.'],quiz:'nn'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{const b=CLEF[clef].bottom;sv.innerHTML=engrave({clef,items,rows:[b-6,b+14],height:350,top:110})};draw();
  bindChips(root,'House',v=>{clef=v;items=[];cancelRuns();draw()});
  const N=(d,x)=>{const L=dLetter(d);return{type:'note',d,dur:'w',solid:true,x,color:COLOR[L],letter:L,cls:'pop'}};
  const walk=(ds,msg)=>run(async g=>{items=[];for(let i=0;i<ds.length;i++){if(g())return;items.forEach(n=>n.cls='');items.push(N(ds[i],170+i*95));draw();tone(dMidi(ds[i]),.7);await wait(550)}say(sayEl,msg)});
  $('#up',root).onclick=()=>{const t=CLEF[clef].bottom+8;walk([t,t+1,t+2,t+3,t+4,t+5,t+6],'Above the roof: each new line note gets its own <span class="hl">ledger line</span>.')};
  $('#down',root).onclick=()=>{const b=CLEF[clef].bottom;walk([b,b-1,b-2,b-3,b-4,b-5,b-6],'Below the house: ledger lines help us keep counting down.')};
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;cancelRuns();const d=+h.dataset.d,b=CLEF[clef].bottom,L=dLetter(d);items=[N(d,430)];draw();tone(dMidi(d));
    const n=d<b?Math.floor((b-d)/2):d>b+8?Math.floor((d-b-8)/2):0;say(sayEl,`${tag(L)} ${d===MC?'Middle C! ':''}${n?`It needs <span class="hl">${n}</span> ledger line${n>1?'s':''}.`:'It lives inside the house, no ledger lines needed.'}`)});
  $('#clr',root).onclick=()=>{cancelRuns();items=[];draw()};
};

/* ---- Landmark Notes ---- */
MOUNT.landmarks=root=>{
  const LM=[{d:28,s:0,n:'Middle C',t:'just below the treble house, on its own line'},{d:32,s:0,n:'Treble G',t:'on Line 2, where the treble clef curls'},{d:35,s:0,n:'Treble C',t:'in Space 3, the middle of the treble house'},{d:38,s:0,n:'Top F',t:'on the top line of the treble house'},{d:28,s:1,n:'Middle C',t:'just above the bass house'},{d:24,s:1,n:'Bass F',t:'on Line 4, between the bass clef dots'},{d:21,s:1,n:'Bass C',t:'in Space 2, the middle of the bass house'},{d:18,s:1,n:'Low G',t:'on the bottom line of the bass house'}];
  const TOP2=70+4*S+2*S;let items=[],marks={};
  page(root,{body:`
  <div class="row">${LM.map((l,i)=>`<button class="btn small" data-i="${i}">${l.n}${l.d===28?(l.s?' (bass)':' (treble)'):''}</button>`).join('')}</div>
  <div class="row"><button class="btn primary" id="all">Show all landmarks</button><button class="btn" id="nb">Neighbour game</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">Landmarks are notes we know by heart. From a landmark, we can step or skip to any other note!</div>
  <div class="panel svgwrap" id="kb"></div>`,
  notes:['Like landmarks in a town (the park, the shop), these notes help us find our way.','Learn these first: Middle C, Treble G, Bass F. Then Treble C and Bass C.','Neighbour game: find the landmark, then step up or down to name the mystery note.'],quiz:'nn'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=engrave({staves:[{clef:'treble',top:70},{clef:'bass',top:TOP2}],brace:true,height:TOP2+4*S+50,items:[...items,{type:'bar',x:786,final:true}]});kb.innerHTML=keysSVG({from:14,to:42,marks})};draw();
  const N=(l,x)=>({type:'note',d:l.d,s:l.s,dur:'w',solid:true,x,color:COLOR[dLetter(l.d)],letter:dLetter(l.d),cls:'pop'});
  $$('[data-i]',root).forEach(b=>b.onclick=()=>{cancelRuns();const l=LM[+b.dataset.i];items=[N(l,430)];marks={[dMidi(l.d)]:COLOR[dLetter(l.d)]};draw();tone(dMidi(l.d));say(sayEl,`<span class="hl">${l.n}</span> sits ${l.t}.`)});
  $('#all',root).onclick=()=>run(async g=>{items=[];marks={};for(let i=0;i<LM.length;i++){if(g())return;const l=LM[i];items.forEach(n=>n.cls='');items.push(N(l,120+(i%4)*190));marks[dMidi(l.d)]=COLOR[dLetter(l.d)];draw();tone(dMidi(l.d),.7);say(sayEl,`<span class="hl">${l.n}</span>`);await wait(700)}say(sayEl,'All our landmarks! Know these and you can find any note.')});
  $('#nb',root).onclick=()=>{cancelRuns();const l=LM[rnd(LM.length)],k=[1,-1,2,-2][rnd(4)],d=l.d+k,L=dLetter(d);items=[{...N(l,330),cls:''},{type:'note',d,s:l.s,dur:'w',solid:true,x:530,cls:'pop'}];marks={[dMidi(l.d)]:COLOR[dLetter(l.d)]};draw();tone(dMidi(l.d),.6);tone(dMidi(d),.8,.5);
    say(sayEl,`Here is <span class="hl">${l.n}</span>. What is the white note next to it? <button class="btn small primary" id="rv">Show me</button>`);$('#rv',root).onclick=()=>{items[1]={...items[1],color:COLOR[L],letter:L};marks[dMidi(d)]=COLOR[L];draw();say(sayEl,`${Math.abs(k)===1?'A step':'A skip'} ${k>0?'up':'down'} from ${l.n}: ${tag(L)} <span style="color:${COLOR[L]}">${L}</span>!`)}};
};

/* ---- Sharps & Flats on the Staff ---- */
MOUNT.accid=root=>{
  let items=[],marks={},bl={};
  page(root,{body:`
  <div class="row"><button class="btn primary" data-a="sharp">${SH} Add a sharp</button><button class="btn primary" data-a="flat">${FL} Add a flat</button><button class="btn" data-a="natural">${NA} Natural</button><button class="btn" id="bar">The bar line rule</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">On the staff, the sharp or flat sits just <span class="hl">before</span> the note, on the same line or space.</div>`,
  notes:['We say "F sharp", but we write the sharp sign <em>before</em> the note, on exactly the same line or space.','The middle of the sharp sign (the box) sits on the note\'s line or space.','Bar line rule: a sharp or flat lasts until the bar line. In the next box, the note is back to normal.'],quiz:'sf'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=engrave({clef:'treble',items});kb.innerHTML=keysSVG({from:28,to:35,marks,labels:true,blackLabels:bl})};
  const pick=()=>{const opts=[29,30,31,32,33,35,36];return opts[rnd(opts.length)]};
  let d=31;
  const show=acc=>{const L=dLetter(d),base=dMidi(d),m=acc==='sharp'?base+1:acc==='flat'?base-1:base;items=[{type:'note',d,dur:'w',solid:true,x:430,color:COLOR[L],letter:L,acc:acc==='natural'?'natural':acc,cls:'pop'}];
    marks={[m]:acc==='sharp'?'var(--g)':acc==='flat'?'var(--a)':COLOR[L]};bl=midiLetter(m)?{}:{[m]:L+(acc==='sharp'?SH:FL)};draw();tone(m);
    say(sayEl,acc==='natural'?`${tag(L)} ${L} natural: the plain white key.`:`${tag(L)} <span class="hl">${L}${acc==='sharp'?SH:FL}</span>: the ${acc} sits before the note. Play the key one step to the ${acc==='sharp'?'right':'left'}.`)};
  draw();
  $$('[data-a]',root).forEach(b=>b.onclick=()=>{cancelRuns();if(b.dataset.a!=='natural')d=pick();show(b.dataset.a)});
  $('#bar',root).onclick=()=>run(async g=>{const L='F';items=[{type:'note',d:31,dur:'q',x:200,color:'var(--g)',letter:L,acc:'sharp',i:0},{type:'note',d:31,dur:'q',x:300,color:'var(--g)',letter:L,i:1},{type:'bar',x:400},{type:'note',d:31,dur:'q',x:500,color:COLOR.F,letter:L,i:2},{type:'note',d:31,dur:'q',x:600,color:COLOR.F,letter:L,i:3},{type:'bar',x:700,final:true}];marks={};bl={};draw();
    for(const [i,m,t] of [[0,66,'F sharp…'],[1,66,'still F sharp in this box!'],[2,65,'New box: back to plain F.'],[3,65,'plain F.']]){if(g())return;hl(sv,i);marks={[m]:m===66?'var(--g)':COLOR.F};bl=m===66?{66:'F'+SH}:{};kb.innerHTML=keysSVG({from:28,to:35,marks,labels:true,blackLabels:bl});tone(m,.7);say(sayEl,t);await wait(900)}hl(sv,null);say(sayEl,'A sharp lasts until the <span class="hl">bar line</span>. Then it is gone!')});
};
