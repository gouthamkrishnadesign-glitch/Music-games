/* Note Friends — topics, units 1 & 2: Meet the Notes, The Staff */
const MOUNT={};

/* ---- Note Friends ---- */
MOUNT.friends=root=>{
  page(root,{body:`
  <div class="friends" id="fr">${LETTERS.map((L,i)=>`<button class="friend" data-i="${i}" style="--nc:${COLOR[L]}" aria-label="${L}">${blob(L)}<span class="L">${L}</span><span class="w">${ANIMAL[L]}</span></button>`).join('')}</div>
  <div class="say" id="say">Tap a friend!</div>
  <div class="row"><button class="btn primary" id="up">Walk up the hill</button><button class="btn" id="down">Walk down the hill</button><button class="btn" id="mix">Who comes next?</button><button class="btn" id="bef">Who comes before?</button></div>
  <div class="panel"><span class="lbl">The friends hold hands in a circle</span>
    <div class="loop" style="margin-top:10px">${LETTERS.map(L=>`<span class="c" style="--nc:${COLOR[L]}">${L}</span>`).join('')}<span class="arrow">then back to</span><span class="c" style="--nc:var(--c)">C</span><span class="arrow">again!</span></div></div>`,
  notes:['"These are our 7 note friends. Each one has its own color and voice."','Press <em>Walk up the hill</em> and sing the letters together. Then walk down.','Ask: "Who comes after E?" and "Who comes before C?" (It is B, because the friends hold hands in a circle.)','Point to a color and ask: "Where is the green friend? That is F!"'],quiz:'wm'});
  const fr=$$('.friend',root),sayEl=$('#say',root);
  const hop=(i,up=0)=>{const el=fr[i];el.classList.remove('bounce');void el.offsetWidth;el.classList.add('bounce');fr.forEach(f=>f.classList.remove('on'));el.classList.add('on');tone(60+SEMI[i]+up*12)};
  fr.forEach((el,i)=>el.onclick=()=>{hop(i);const L=LETTERS[i];say(sayEl,`${tag(L)} This is <span style="color:${COLOR[L]}">${L}</span>. ${L} is for ${ANIMAL[L]}!`)});
  $('#up',root).onclick=()=>run(async g=>{for(let i=0;i<8;i++){if(g())return;hop(i%7,i===7?1:0);say(sayEl,i===7?'C D E F G A B C … back to C, up high!':LETTERS.slice(0,i+1).join(' '));await wait(560)}});
  $('#down',root).onclick=()=>run(async g=>{const t=[];for(let i=7;i>=0;i--){if(g())return;hop(i%7,i===7?1:0);t.push(LETTERS[i%7]);say(sayEl,t.join(' '));await wait(560)}});
  const ask=after=>{const i=rnd(7),L=LETTERS[i],j=after?(i+1)%7:(i+6)%7,N=LETTERS[j];hop(i);say(sayEl,`${after?'After':'Before'} ${tag(L)} comes … <button class="btn small" id="rv">Show me</button>`);$('#rv',root).onclick=()=>{hop(j);say(sayEl,`${after?'After':'Before'} ${tag(L)} comes ${tag(N)} <span style="color:${COLOR[N]}">${N}</span>!`);burst(fr[j],16)}};
  $('#mix',root).onclick=()=>ask(true);$('#bef',root).onclick=()=>ask(false);
};

/* ---- Twins & Triplets ---- */
MOUNT.piano=root=>{
  const R={from:21,to:35};let st={labels:false,marks:{}};
  page(root,{body:`
  <div class="row"><button class="btn" data-a="twins">Spot the twins (2)</button><button class="btn" data-a="trips">Spot the triplets (3)</button><button class="btn primary" data-a="c">Where does C live?</button><button class="btn" data-a="f">Where does F live?</button><button class="btn" data-a="mc">Find Middle C</button></div>
  <div class="row"><span class="lbl">Light up</span>${LETTERS.map(L=>`<button class="ans letter" style="--nc:${COLOR[L]};height:46px;min-width:46px;font-size:22px" data-l="${L}">${L}</button>`).join('')}<button class="chip" id="lb" aria-pressed="false">Show all letters</button><button class="chip" id="cl">Clear</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Tap any key. Can you see black keys that come in twos?</div>`,
  notes:['Black keys come in <em>twins</em> (2) and <em>triplets</em> (3). On the real piano, ask the child to touch every pair of twins, going up.','<em>C always lives just left of the twins.</em> D is between the twins, like a dog in its doghouse. E is just right of them.','<em>F lives just left of the triplets.</em>','Middle C is the C nearest the middle of the piano. It is our home key.'],quiz:'ph'});
  const kb=$('#kb',root),sayEl=$('#say',root),draw=()=>{kb.innerHTML=keysSVG({...R,labels:st.labels,marks:st.marks})};draw();
  const whites=[];for(let d=R.from;d<=R.to;d++)whites.push(d);
  bindKeys(kb,m=>{const L=midiLetter(m);if(L)say(sayEl,`${tag(L)} That key is <span style="color:${COLOR[L]}">${L}</span>${m===60?', Middle C, our home key!':'!'}`);else{const s=m%12;say(sayEl,s===1||s===3?'A black key in the <span style="color:var(--pink)">twins</span> group.':'A black key in the <span style="color:var(--g)">triplets</span> group.')}});
  const dim='color-mix(in srgb,var(--pink) 55%,var(--keyb))',dimT='color-mix(in srgb,var(--g) 55%,var(--keyb))';
  $$('[data-a]',root).forEach(b=>b.onclick=()=>{
    cancelRuns();const a=b.dataset.a;st.marks={};
    if(a==='twins'){const cs=whites.filter(d=>d%7===0&&d<R.to);cs.forEach(d=>{const m=dMidi(d);st.marks[m+1]=st.marks[m+3]='var(--pink)'});draw();say(sayEl,'See the <span style="color:var(--pink)">twins</span>? Two black keys, side by side.');run(async g=>{for(const d of cs){if(g())return;const m=dMidi(d);tone(m+1,.6);tone(m+3,.6,.18);await wait(650)}})}
    if(a==='trips'){const fs=whites.filter(d=>d%7===3&&d<R.to);fs.forEach(d=>{const m=dMidi(d);[1,3,5].forEach(k=>st.marks[m+k]='var(--g)')});draw();say(sayEl,'See the <span style="color:var(--g)">triplets</span>? Three black keys together.');run(async g=>{for(const d of fs){if(g())return;const m=dMidi(d);tone(m+1,.6);tone(m+3,.6,.15);tone(m+5,.6,.3);await wait(750)}})}
    if(a==='c'){const cs=whites.filter(d=>d%7===0);cs.forEach(d=>{const m=dMidi(d);st.marks[m]='var(--c)';if(d<R.to)st.marks[m+1]=st.marks[m+3]=dim});draw();say(sayEl,`${tag('C')} C lives just <span class="hl">left of the twins</span>. Every time!`);run(async g=>{for(const d of cs){if(g())return;tone(dMidi(d),.9);await wait(550)}})}
    if(a==='f'){const fs=whites.filter(d=>d%7===3);fs.forEach(d=>{const m=dMidi(d);st.marks[m]='var(--f)';[1,3,5].forEach(k=>st.marks[m+k]=dimT)});draw();say(sayEl,`${tag('F')} F lives just <span class="hl">left of the triplets</span>.`);run(async g=>{for(const d of fs){if(g())return;tone(dMidi(d),.9);await wait(550)}})}
    if(a==='mc'){st.marks[60]='var(--c)';draw();tone(60);say(sayEl,`${tag('C')} This is <span class="hl">Middle C</span>, the home key in the middle of the piano.`)}
  });
  $$('[data-l]',root).forEach(b=>b.onclick=()=>{cancelRuns();const L=b.dataset.l,i=LETTERS.indexOf(L),ds=whites.filter(d=>d%7===i);st.marks={};ds.forEach(d=>st.marks[dMidi(d)]=COLOR[L]);draw();say(sayEl,`${tag(L)} Here are all the <span style="color:${COLOR[L]}">${L}</span>s. Same name, higher and lower voices.`);run(async g=>{for(const d of ds){if(g())return;tone(dMidi(d),.8);await wait(450)}})});
  $('#lb',root).onclick=e=>{st.labels=!st.labels;e.currentTarget.setAttribute('aria-pressed',st.labels);draw()};
  $('#cl',root).onclick=()=>{cancelRuns();st.marks={};draw();say(sayEl,'All clear. Tap any key!')};
};

/* ---- High & Low ---- */
MOUNT.highlow=root=>{
  const R={from:21,to:35};let marks={},notes=[];
  page(root,{body:`
  <div class="twoup"><div class="mini" id="bird">${critter('bird')}<div><b>High sounds</b><span>Light and tweety, like a bird. They live on the <span class="hl">right</span> side of the piano and high up on the staff.</span></div></div>
  <div class="mini" id="bear">${critter('bear')}<div><b>Low sounds</b><span>Deep and growly, like a bear. They live on the <span class="hl">left</span> side of the piano and low on the staff.</span></div></div></div>
  <div class="row"><button class="btn primary" id="up">Climb up (go right)</button><button class="btn" id="down">Climb down (go left)</button><button class="btn" id="bb">Bird or bear?</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">Tap a key. Is it a bird sound or a bear sound?</div>`,
  notes:['Play a very low key and a very high key on the real piano. Ask the child to growl like a bear or tweet like a bird.','Going <em>right</em> on the piano = going <em>up</em> = higher. Going left = lower.','On the staff, higher notes sit higher in the house.','Close your eyes game: you play one note, the child says "bird" or "bear".'],quiz:'hl'});
  const kb=$('#kb',root),sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{kb.innerHTML=keysSVG({...R,marks});sv.innerHTML=engrave({clef:'treble',items:notes})};draw();
  const jump=id=>{const el=$('#'+id,root);el.classList.remove('bounce');void el.offsetWidth;el.classList.add('bounce')};
  bindKeys(kb,m=>{if(m>60){jump('bird');say(sayEl,'High, like a bird! Tweet tweet!')}else if(m<60){jump('bear');say(sayEl,'Low, like a bear! Grrr!')}else say(sayEl,`${tag('C')} Middle C, right in the middle!`)});
  const climb=dir=>run(async g=>{notes=[];const ds=[28,29,30,31,32,33,34,35];if(dir<0)ds.reverse();for(let i=0;i<ds.length;i++){if(g())return;const d=ds[i],L=dLetter(d);notes.forEach(n=>n.cls='');notes.push({type:'note',d,dur:'w',solid:true,x:150+i*82,color:COLOR[L],letter:L,cls:'pop'});marks={[dMidi(d)]:COLOR[L]};draw();tone(dMidi(d),.8);jump(dir>0?'bird':'bear');await wait(520)}say(sayEl,dir>0?'Up, up, up! The notes climb higher on the staff, and we move <span class="hl">right</span> on the piano.':'Down, down, down! The notes go lower on the staff, and we move <span class="hl">left</span> on the piano.')});
  $('#up',root).onclick=()=>climb(1);$('#down',root).onclick=()=>climb(-1);
  $('#bb',root).onclick=()=>{cancelRuns();const hi=Math.random()<.5,m=hi?[72,74,76,77,79][rnd(5)]:[48,50,52,53,55][rnd(5)];tone(m,1.4);say(sayEl,`Listen… bird or bear? <button class="btn small" id="again">${ICON.speaker} Again</button><button class="btn small primary" id="rv">Show me</button>`);$('#again',root).onclick=()=>tone(m,1.4);$('#rv',root).onclick=()=>{marks={[m]:hi?'var(--g)':'#b47a4c'};draw();jump(hi?'bird':'bear');say(sayEl,hi?'A <span class="hl">bird</span>! That was a high sound.':'A <span class="hl">bear</span>! That was a low sound.')}};
};

/* ---- Finger Numbers ---- */
MOUNT.fingers=root=>{
  const R={from:21,to:35},RH={60:1,62:2,64:3,65:4,67:5},LH={48:5,50:4,52:3,53:2,55:1};
  let pos='both',lit={R:0,L:0},marks={};
  page(root,{body:`
  <div class="row" style="justify-content:center;gap:30px" id="hands"></div>
  <div class="row"><button class="btn primary" id="rh">Right hand on Middle C</button><button class="btn" id="lh">Left hand on low C</button><button class="btn" id="bh">Both hands</button><button class="btn" id="p5">Play 1 2 3 4 5</button><button class="btn" id="simon">Wiggle game</button></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Thumbs are always number 1. Tap a finger!</div>`,
  notes:['Hold hands up like a mirror. Thumbs are <em>1</em>, pointer is 2, tall middle finger is 3, ring finger 4, pinky 5. Same numbers on both hands.','Right hand C position: thumb (1) on Middle C, fingers rest on C D E F G.','Left hand C position: pinky (5) on the C below Middle C, thumb (1) lands on G.','<em>Wiggle game</em>: press it, the child wiggles that finger, then press Show me. Fun warm-up!'],quiz:'ph'});
  const hands=$('#hands',root),kb=$('#kb',root),sayEl=$('#say',root);
  const fmap=()=>pos==='R'?RH:pos==='L'?LH:{...RH,...LH};
  const draw=()=>{hands.innerHTML=handSVG('L',lit.L)+handSVG('R',lit.R);kb.innerHTML=keysSVG({...R,fingers:fmap(),marks,labels:true})};draw();
  const hit=(side,n)=>{const map=side==='R'?RH:LH,m=+Object.keys(map).find(k=>map[k]===n);lit={R:0,L:0};lit[side]=n;marks={[m]:'var(--star)'};draw();tone(m);return m};
  hands.addEventListener('pointerdown',e=>{const f=e.target.closest('.finger');if(!f)return;cancelRuns();const side=f.dataset.side,n=+f.dataset.f,m=hit(side,n);say(sayEl,`${side==='R'?'Right':'Left'} hand finger <span class="hl">${n}</span> plays ${tag(midiLetter(m))}.`)});
  bindKeys(kb,m=>{const map=fmap();if(map[m]){const side=m>=60?'R':'L';lit={R:0,L:0};lit[side]=map[m];marks={[m]:'var(--star)'};draw();say(sayEl,`Use your ${side==='R'?'right':'left'} hand finger <span class="hl">${map[m]}</span>.`)}},true);
  $('#rh',root).onclick=()=>{pos='R';lit={R:0,L:0};marks={};draw();say(sayEl,'Right thumb (1) sits on <span class="hl">Middle C</span>. Fingers 1 2 3 4 5 play C D E F G.')};
  $('#lh',root).onclick=()=>{pos='L';lit={R:0,L:0};marks={};draw();say(sayEl,'Left pinky (5) sits on <span class="hl">low C</span>. Fingers 5 4 3 2 1 play C D E F G.')};
  $('#bh',root).onclick=()=>{pos='both';lit={R:0,L:0};marks={};draw();say(sayEl,'Both hands ready! Thumbs are always 1.')};
  $('#p5',root).onclick=()=>run(async g=>{const sides=pos==='both'?['L','R']:[pos];for(const side of sides){for(let n=1;n<=5;n++){if(g())return;const fn=side==='L'?6-n:n;hit(side,fn);say(sayEl,`${side==='R'?'Right':'Left'} hand: finger <span class="hl">${fn}</span>`);await wait(520)}}});
  $('#simon',root).onclick=()=>{cancelRuns();const side=Math.random()<.5?'R':'L',n=1+rnd(5);lit={R:0,L:0};marks={};draw();say(sayEl,`Wiggle your <span class="hl">${side==='R'?'RIGHT':'LEFT'}</span> hand finger <span class="hl">${n}</span>! <button class="btn small primary" id="rv">Show me</button>`);$('#rv',root).onclick=()=>{hit(side,n);burst($('#hands',root),20);say(sayEl,`${side==='R'?'Right':'Left'} finger ${n}. Did you get it?`)}};
};

/* ---- The Staff House ---- */
MOUNT.staff=root=>{
  const b=30;let st={nums:true,notes:[],lit:[],gs:[]};
  page(root,{body:`
  <div class="row"><button class="btn primary" id="cl5">Count the lines</button><button class="btn" id="cs4">Count the spaces</button><button class="btn" id="climb">Climb the stairs</button><button class="chip" id="nm" aria-pressed="true">Show numbers</button><button class="chip" id="clr">Clear</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">Tap the house to drop a note!</div>`,
  notes:['Count the lines from the <em>bottom up</em>: 1, 2, 3, 4, 5. Line 1 is the bottom one, like the ground floor.','Then count the spaces between the lines: 1, 2, 3, 4. There is one space fewer than there are lines.','Put a note somewhere and ask: <em>"Line or space? Which number?"</em> Let the child count up from the bottom with a finger.','Turn off <em>Show numbers</em> when the child is ready to count alone.'],quiz:'ls'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=engrave({clef:null,lineNums:st.nums,items:st.notes,litLines:st.lit,glowSpaces:st.gs,rows:[29,39]})};draw();
  const col=k=>k==='line'?'var(--e)':'var(--a)';
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;cancelRuns();const d=+h.dataset.d,pi=posInfo(d,b);
    st={...st,notes:[{type:'note',d,dur:'w',solid:true,x:430,color:col(pi.kind),cls:'pop'}],lit:pi.kind==='line'?[pi.n]:[],gs:pi.kind==='space'?[d]:[]};draw();tone(dMidi(d));
    say(sayEl,pi.kind==='line'?`This note is <span class="hl">on Line ${pi.n}</span>. The line goes through its tummy.`:pi.kind==='space'?`This note is <span style="color:var(--a)">in Space ${pi.n}</span>. It sits between two lines.`:`This note is ${pi.text}.`)});
  $('#cl5',root).onclick=()=>run(async g=>{st={...st,notes:[],gs:[]};for(let i=1;i<=5;i++){if(g())return;st.lit=[i];draw();tone(dMidi(b+(i-1)*2),.8);say(sayEl,`Line <span class="hl">${i}</span>`+(i===1?' (the bottom one)':i===5?' (the top one). Five lines!':''));await wait(800)}st.lit=[];draw()});
  $('#cs4',root).onclick=()=>run(async g=>{st={...st,notes:[],lit:[]};for(let j=1;j<=4;j++){if(g())return;st.gs=[b+j*2-1];draw();tone(dMidi(b+j*2-1),.8);say(sayEl,`Space <span style="color:var(--a)">${j}</span>`+(j===4?'. Four spaces!':''));await wait(800)}st.gs=[];draw()});
  $('#climb',root).onclick=()=>run(async g=>{st={...st,notes:[],lit:[],gs:[]};for(let p=0;p<=8;p++){if(g())return;const d=b+p,pi=posInfo(d,b);st.notes.forEach(n=>n.cls='');st.notes.push({type:'note',d,dur:'w',solid:true,x:130+p*76,color:col(pi.kind),cls:'pop'});draw();tone(dMidi(d),.7);say(sayEl,pi.kind==='line'?`Line ${pi.n}`:`Space ${pi.n}`);await wait(620)}say(sayEl,'Line, space, line, space … all the way up the stairs!')});
  $('#nm',root).onclick=e=>{st.nums=!st.nums;e.currentTarget.setAttribute('aria-pressed',st.nums);draw()};
  $('#clr',root).onclick=()=>{cancelRuns();st={...st,notes:[],lit:[],gs:[]};draw();say(sayEl,'Tap the house to drop a note!')};
};

/* ---- Line Notes & Space Notes (note shapes) ---- */
MOUNT.linespace=root=>{
  const b=30;let dur='w',mode='one',d=34;
  page(root,{body:`
  <div class="row">${chipGroup('Note shape',[['w','Whole'],['h','Half'],['q','Quarter'],['e','Eighth']],dur)}</div>
  <div class="row"><button class="btn primary" id="al">All the line notes</button><button class="btn" id="as">All the space notes</button><button class="btn" id="stem">The stem rule</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">Tap the staff to move the note. Watch how it sits!</div>
  <div class="twoup">
    <div class="mini">${engrave({clef:null,width:200,height:150,top:15,x0:10,x1:190,items:[{type:'note',d:32,dur:'w',x:100,color:'var(--e)'}],litLines:[2]})}<div><b>On a line</b><span>The line cuts right through the middle of the note, like a belt.</span></div></div>
    <div class="mini">${engrave({clef:null,width:200,height:150,top:15,x0:10,x1:190,items:[{type:'note',d:33,dur:'w',x:100,color:'var(--a)'}],glowSpaces:[33]})}<div><b>In a space</b><span>The note fills the space and touches the lines above and below.</span></div></div>
  </div>`,
  notes:['Draw a whole note on the whiteboard on Line 3: the line goes through its middle. Now draw it in Space 2: it is sandwiched between lines.','Kids often draw space notes too big or line notes too high. Ask them to "hug" the line or "fill" the space.','<em>Stem rule</em>: notes below the middle line have stems going <em>up</em> on the right side. Notes on or above the middle line have stems going <em>down</em> on the left side.','Switch between whole, half and quarter so they see the head looks the same on a line, only the stem and colour change.'],quiz:'ls'});
  const sv=$('#sv',root),sayEl=$('#say',root);
  const col=k=>k==='line'?'var(--e)':'var(--a)';
  const draw=()=>{
    let items=[],lit=[],gs=[],glowLine=null;
    if(mode==='one'){const pi=posInfo(d,b);items=[{type:'note',d,dur,x:430,color:col(pi.kind),cls:'pop'}];if(pi.kind==='line')lit=[pi.n];else gs=[d]}
    if(mode==='lines')[30,32,34,36,38].forEach((dd,i)=>items.push({type:'note',d:dd,dur,x:170+i*125,color:'var(--e)'}));
    if(mode==='spaces')[31,33,35,37].forEach((dd,i)=>items.push({type:'note',d:dd,dur,x:200+i*140,color:'var(--a)'}));
    if(mode==='stem'){for(let p=0;p<=8;p++){const dd=b+p;items.push({type:'note',d:dd,dur:dur==='w'?'q':dur,x:130+p*76,color:dd<34?'var(--f)':'var(--pink)'})}glowLine=3;items.push({type:'txt',x:250,y:28,text:'stems UP',cls:'callout'},{type:'txt',x:620,y:262,text:'stems DOWN',cls:'callout'})}
    sv.innerHTML=engrave({clef:null,lineNums:true,items,litLines:lit,glowSpaces:gs,glowLine,rows:[30,38],height:280});
  };
  const describe=()=>{const pi=posInfo(d,b),up=d<34;say(sayEl,`A <span class="hl">${NAME[dur]}</span> ${pi.kind==='line'?`on Line ${pi.n}: the line goes through its middle.`:`in Space ${pi.n}: it fits between two lines.`}${dur==='w'?' Whole notes have no stem.':` Its stem goes <span class="hl">${up?'up on the right':'down on the left'}</span>.`}`)};
  draw();
  bindChips(root,'Note shape',v=>{dur=v;draw();if(mode==='one')describe();tone(dMidi(d),DUR[dur]*.6)});
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;d=+h.dataset.d;mode='one';draw();tone(dMidi(d));describe()});
  $('#al',root).onclick=()=>{mode='lines';draw();say(sayEl,`Five <span class="hl">line notes</span>. Each one has a line through its middle.`);run(async g=>{for(const dd of [30,32,34,36,38]){if(g())return;tone(dMidi(dd),.6);await wait(380)}})};
  $('#as',root).onclick=()=>{mode='spaces';draw();say(sayEl,`Four <span style="color:var(--a)">space notes</span>. Each one sits snug between two lines.`);run(async g=>{for(const dd of [31,33,35,37]){if(g())return;tone(dMidi(dd),.6);await wait(380)}})};
  $('#stem',root).onclick=()=>{mode='stem';draw();say(sayEl,'Below the <span class="hl">middle line</span>, stems go UP. On or above it, stems go DOWN.')};
};

/* ---- Steps & Skips ---- */
MOUNT.steps=root=>{
  const K={from:28,to:42};let items=[],marks={};
  page(root,{body:`
  <div class="row"><button class="btn primary" data-k="1">Step up</button><button class="btn" data-k="-1">Step down</button><button class="btn primary" data-k="2">Skip up</button><button class="btn" data-k="-2">Skip down</button><button class="btn" data-k="0">Same note</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say">Press a button to see a step or a skip.</div>
  <div class="twoup"><div class="mini"><div><b>Step</b><span>Line to the very next space (or space to the next line). We go to the <span class="hl">next friend</span>: C to D.</span></div></div><div class="mini"><div><b>Skip</b><span>Line to line, or space to space. We <span class="hl">jump over</span> one friend: C to E.</span></div></div></div>`,
  notes:['On the piano a step is the next white key. A skip leaves one white key out in the middle.','Make it physical: kids take a small step, then a big skip, across the room.','Point at two notes in a real book and ask: step, skip or same?'],quiz:'ss'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=engrave({clef:'treble',items});kb.innerHTML=keysSVG({...K,marks})};draw();
  $$('[data-k]',root).forEach(bt=>bt.onclick=()=>run(async g=>{
    const k=+bt.dataset.k,d1=k<0?32+rnd(4):29+rnd(4),d2=d1+k,L1=dLetter(d1),L2=dLetter(d2);
    const word=k===0?'SAME':Math.abs(k)===1?'STEP':'SKIP';
    items=[{type:'note',d:d1,dur:'w',solid:true,x:330,color:COLOR[L1],letter:L1,cls:'pop'}];marks={[dMidi(d1)]:COLOR[L1]};draw();tone(dMidi(d1),.9);
    await wait(650);if(g())return;
    items.push({type:'note',d:d2,dur:'w',solid:true,x:530,color:COLOR[L2],letter:L2,cls:'pop'},{type:'txt',x:430,y:36,text:word});
    marks[dMidi(d2)]=COLOR[L2];if(Math.abs(k)===2){const mid=(d1+d2)/2;marks[dMidi(mid)]='color-mix(in srgb,var(--muted) 45%,var(--key))'}draw();tone(dMidi(d2),.9);
    say(sayEl,k===0?`${tag(L1)} to ${tag(L2)}: the <span class="hl">same</span> note again!`:Math.abs(k)===1?`${tag(L1)} to ${tag(L2)} is a <span class="hl">step</span>. The very next friend!`:`${tag(L1)} to ${tag(L2)} is a <span class="hl">skip</span>. We jumped over ${tag(dLetter((d1+d2)/2))}.`);
  }));
};

/* ---- Treble & Bass ---- */
function clefPage(root,clef){
  const T=clef==='treble',b=CLEF[clef].bottom,K=T?{from:28,to:42}:{from:14,to:28},rows=T?[28,39]:[17,28];
  const walk=T?[28,29,30,31,32,33,34,35]:[28,27,26,25,24,23,22,21];
  const sp=T?{ds:[31,33,35,37],line:'The spaces spell <span class="hl">FACE</span>!'}:{ds:[19,21,23,25],line:'Spaces: <span class="hl">A</span>ll <span class="hl">C</span>ows <span class="hl">E</span>at <span class="hl">G</span>rass!'};
  const ln=T?{ds:[30,32,34,36,38],line:'Lines: <span class="hl">E</span>very <span class="hl">G</span>ood <span class="hl">B</span>oy <span class="hl">D</span>oes <span class="hl">F</span>ine!'}:{ds:[18,20,22,24,26],line:'Lines: <span class="hl">G</span>ood <span class="hl">B</span>irds <span class="hl">D</span>o <span class="hl">F</span>ly <span class="hl">A</span>way!'};
  let st={notes:[],marks:{},glowLine:null,gs:[],glowClef:false,lit:[]};
  page(root,{body:`
  <div class="row"><button class="btn primary" id="walk">${T?'Climb up from Middle C':'Walk down from Middle C'}</button><button class="btn" id="mc">Where is Middle C?</button><button class="btn" id="clue">${T?'The G line clue':'The F line clue'}</button><button class="btn" id="sp">${T?'FACE spaces':'Cows spaces'}</button><button class="btn" id="ln">Line rhyme</button><button class="chip" id="clr">Clear</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">Tap the house to drop a note. Watch the piano too!</div>
  <div class="panel svgwrap" id="kb"></div>`,
  notes:T?['The treble clef is also called the <em>G clef</em>. Its curly tummy wraps around <em>Line 2</em>, and that line is G.','<em>Middle C</em> sits just below the house on its own little line (a ledger line).','Climb up together: C D E F G A B C, line, space, line, space. Play each one on the real piano with the right hand.','Spaces spell <em>FACE</em>. Lines: <em>Every Good Boy Does Fine</em>.']:['The bass clef is also called the <em>F clef</em>. Its two dots hug <em>Line 4</em>, and that line is F.','<em>Middle C</em> sits just above the house on its own little line. Same Middle C as the treble one.','Walk down together: C B A G F E D C, the friends going backwards. Left hand, moving left.','Spaces: <em>All Cows Eat Grass</em>. Lines: <em>Good Birds Do Fly Away</em>.'],quiz:'nn'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=engrave({clef,items:st.notes,rows,glowLine:st.glowLine,glowSpaces:st.gs,glowClef:st.glowClef,litLines:st.lit});kb.innerHTML=keysSVG({...K,marks:st.marks,labels:true})};
  const clean=()=>{st={notes:[],marks:{},glowLine:null,gs:[],glowClef:false,lit:[]}};
  const N=(d,x,cls='pop')=>{const L=dLetter(d);return{type:'note',d,dur:'w',solid:true,x,color:COLOR[L],letter:L,cls}};
  draw();
  const show=d=>{const L=dLetter(d),pi=posInfo(d,b);clean();st.notes=[N(d,430)];st.marks={[dMidi(d)]:COLOR[L]};draw();tone(dMidi(d));say(sayEl,d===MC?`${tag('C')} This is <span class="hl">Middle C</span>! It sits ${pi.text}.`:`${tag(L)} This is <span style="color:${COLOR[L]}">${L}</span>. It is ${pi.text}.`)};
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;cancelRuns();show(+h.dataset.d)});
  bindKeys(kb,m=>{const d=midiD(m);if(d==null){say(sayEl,'A black key! We will meet those later.');return}if(d>=rows[0]&&d<=rows[1]){cancelRuns();show(d)}else say(sayEl,`${tag(midiLetter(m))} That one lives ${T?'lower, in the bass house':'higher, in the treble house'}.`)});
  const seq=(ds,x0,step,done)=>run(async g=>{clean();const t=[];for(let i=0;i<ds.length;i++){if(g())return;const d=ds[i];st.notes.forEach(n=>n.cls='');st.notes.push(N(d,x0+i*step));st.marks={[dMidi(d)]:COLOR[dLetter(d)]};draw();tone(dMidi(d),.9);t.push(tag(dLetter(d)));say(sayEl,t.join(' '));await wait(680)}done&&done()});
  $('#walk',root).onclick=()=>seq(walk,150,80,()=>say(sayEl,T?'C D E F G A B C! Up the stairs: line, space, line, space.':'C B A G F E D C! Down the stairs, lower and lower.'));
  $('#mc',root).onclick=()=>{cancelRuns();show(MC);say(sayEl,`${tag('C')} <span class="hl">Middle C</span> sits ${T?'below':'above'} the house, wearing its own little line.`)};
  $('#clue',root).onclick=()=>{cancelRuns();clean();const d=T?32:24,L=dLetter(d);st.glowLine=T?2:4;st.glowClef=true;st.notes=[N(d,430)];st.marks={[dMidi(d)]:COLOR[L]};draw();tone(dMidi(d));say(sayEl,T?`${tag('G')} The treble clef curls around <span class="hl">Line 2</span>. That line is G. It is the G clef!`:`${tag('F')} The two dots hug <span class="hl">Line 4</span>. That line is F. It is the F clef!`)};
  $('#sp',root).onclick=()=>seq(sp.ds,220,130,()=>{st.gs=sp.ds;draw();say(sayEl,sp.line)});
  $('#ln',root).onclick=()=>seq(ln.ds,190,115,()=>{st.lit=[1,2,3,4,5];draw();say(sayEl,ln.line)});
  $('#clr',root).onclick=()=>{cancelRuns();clean();draw();say(sayEl,'Tap the house to drop a note. Watch the piano too!')};
}
MOUNT.treble=root=>clefPage(root,'treble');
MOUNT.bass=root=>clefPage(root,'bass');

/* ---- Grand Staff ---- */
MOUNT.grand=root=>{
  const K={from:21,to:35},TOP2=70+4*S+2*S;let items=[],marks={};
  page(root,{body:`
  <div class="row"><button class="btn primary" id="climb">Climb the whole ladder</button><button class="btn" id="mc">Middle C in both houses</button><button class="btn" id="hands">Which hand?</button><button class="chip" id="clr">Clear</button></div>
  <div class="panel svgwrap" id="sv"></div>
  <div class="say" id="say">The treble house sits on top, the bass house below. Tap either one!</div>
  <div class="panel svgwrap" id="kb"></div>`,
  notes:['The brace <em>{</em> joins the two houses: this is the <em>grand staff</em>, the map for piano music.','Right hand usually reads the top (treble), left hand reads the bottom (bass).','Middle C can be written in either house, on its little line. It is the <em>same key</em>.','Climb the ladder: notes walk up from the bass house, through Middle C, into the treble house.'],quiz:'nn'});
  const sv=$('#sv',root),kb=$('#kb',root),sayEl=$('#say',root);
  const draw=()=>{sv.innerHTML=engrave({staves:[{clef:'treble',top:70},{clef:'bass',top:TOP2}],brace:true,height:TOP2+4*S+50,items:[...items,{type:'bar',x:786,final:true}],rows:[{s:0,from:28,to:39},{s:1,from:17,to:27}]});kb.innerHTML=keysSVG({...K,marks,labels:true})};draw();
  const N=(d,x,s)=>{const L=dLetter(d);return{type:'note',d,dur:'w',solid:true,x,s,color:COLOR[L],letter:L,cls:'pop'}};
  sv.addEventListener('pointerdown',e=>{const h=e.target.closest('.hit');if(!h)return;cancelRuns();const d=+h.dataset.d,s=+h.dataset.s,L=dLetter(d);items=[N(d,430,s)];marks={[dMidi(d)]:COLOR[L]};draw();tone(dMidi(d));say(sayEl,`${tag(L)} This is ${d===MC?'<span class="hl">Middle C</span>':L}, in the <span class="hl">${s?'bass':'treble'}</span> house. ${s?'Left':'Right'} hand!`)});
  $('#climb',root).onclick=()=>run(async g=>{items=[];for(let d=21;d<=35;d++){if(g())return;items.forEach(n=>n.cls='');items.push(N(d,110+(d-21)*47,d<28?1:0));marks={[dMidi(d)]:COLOR[dLetter(d)]};draw();tone(dMidi(d),.7);say(sayEl,d<28?'In the bass house…':d===28?`${tag('C')} Middle C, the bridge!`:'Now in the treble house!');await wait(430)}say(sayEl,'We climbed from the bass house, over Middle C, into the treble house!')});
  $('#mc',root).onclick=()=>{cancelRuns();items=[N(28,300,0),N(28,560,1),{type:'txt',x:300,y:40,text:'treble Middle C'},{type:'txt',x:560,y:TOP2+4*S+44,text:'bass Middle C'}];marks={60:'var(--c)'};draw();tone(60);say(sayEl,`${tag('C')} Two ways to write <span class="hl">Middle C</span>, but it is the <span class="hl">same key</span> on the piano!`)};
  $('#hands',root).onclick=()=>{cancelRuns();const s=rnd(2),d=s?17+rnd(10):29+rnd(10),L=dLetter(d);items=[N(d,430,s)];marks={};draw();tone(dMidi(d));say(sayEl,`Which hand plays this ${tag(L)}? <button class="btn small primary" id="rv">Show me</button>`);$('#rv',root).onclick=()=>{marks={[dMidi(d)]:COLOR[L]};draw();say(sayEl,`The <span class="hl">${s?'left':'right'} hand</span>, because it is in the ${s?'bass':'treble'} house.`)}};
  $('#clr',root).onclick=()=>{cancelRuns();items=[];marks={};draw();say(sayEl,'Tap either house!')};
};
