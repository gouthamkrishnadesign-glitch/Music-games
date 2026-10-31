/* Note Friends — unit "Count & Play": how to count, hold and play every note */
let voiceOn=store.get('nf-voice',true);
const NUMW=['one','two','three','four','five','six'];
function speak(t){try{if(!voiceOn||!soundOn||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.5;u.pitch=1.25;speechSynthesis.speak(u)}catch(e){}}
const voiceChip=()=>`<button class="chip" id="vc" aria-pressed="${voiceOn}">Voice counts</button>`;
function bindVoice(root){const b=$('#vc',root);if(b)b.onclick=()=>{voiceOn=!voiceOn;store.set('nf-voice',voiceOn);b.setAttribute('aria-pressed',voiceOn)}}

/* beat map: each note is a bar as long as its beats, counts underneath */
function beatMap(evts,{per=4,hide=false}={}){
  let acc=0;const used=new Set();
  const bars=evts.map((e,i)=>{const st=acc;acc+=DUR[e.dur];used.add(Math.round(st*2));const span=Math.max(1,Math.round(DUR[e.dur]*2));
    return `<div class="bm-n${e.rest?' r':''}" data-i="${i}" style="grid-column:${Math.round(st*2)+1} / span ${span};${e.rest?'':`--nc:${e.color||'var(--g)'}`}"><b>${e.rest?'shh':SYL[e.dur]}</b>${e.letter?`<i>${e.letter}</i>`:''}</div>`}).join('');
  const cols=Math.max(per*2,Math.ceil(acc/per)*per*2);
  const counts=Array.from({length:cols},(_,k)=>{const and=k%2===1,lab=hide?'?':and?'&':String((k/2)%per+1);return `<div class="bm-c${and?' and':''}${and&&!used.has(k)?' dim':''}${k&&k%(per*2)===0?' bar':''}" data-h="${k}" style="grid-column:${k+1}">${lab}</div>`}).join('');
  return `<div class="bmwrap"><div class="bm" style="--cols:${cols}">${bars}${counts}</div></div>`;
}
function bmAt(el,s){$$('.bm-c',el).forEach(c=>c.classList.toggle('on',+c.dataset.h===s))}
const bmClear=el=>{$$('.bm-c.on,.bm-n.now',el).forEach(x=>x.classList.remove('on','now'))};

/* precise timeline: count-in, clicks, voice, sound, callbacks per half-beat */
async function timeline(evts,o){
  const per=o.per||4,half=30000/(o.bpm||80),starts=new Map();let acc=0;
  evts.forEach((e,i)=>{starts.set(Math.round(acc*2),i);acc+=DUR[e.dur]});
  const total=Math.round(acc*2),ci=(o.countIn??per)*2,t0=performance.now()+150;
  o.onStart&&o.onStart(t0+ci*half,half);
  for(let s=-ci;s<total;s++){
    const d=t0+(s+ci)*half-performance.now();if(d>0)await wait(d);if(o.gone())return false;
    if(s<0){if(s%2===0){const k=(s+ci)/2;click(k%per===0);const w=per===4?['one','two','ready','go'][k%4]:NUMW[k%per];if(o.voice!==false)speak(w);o.onCountIn&&o.onCountIn(k%per,w)}continue}
    if(s%2===0){const b=(s/2)%per;if(o.click!==false)click(b===0);if(o.voice!==false&&!o.sayFn)speak(NUMW[b])}
    o.onHalf&&o.onHalf(s);
    if(starts.has(s)){const i=starts.get(s),e=evts[i];o.onEvent&&o.onEvent(i,e);if(o.sayFn)speak(o.sayFn(e));
      if(!e.rest){if(o.sound==='clap')clap(.5);else if(o.sound!=='none')tone(e.midi||67,DUR[e.dur]*half*2/1000*.92+.15,0,.3)}}
  }
  await wait(half*2);return true;
}
const FW={w:'Whole note',hd:'Dotted half note',h:'Half note',q:'Quarter note',e:'Eighth notes',rq:'Quarter rest',rh:'Half rest',rw:'Whole rest'};

/* ---- Count Out Loud ---- */
MOUNT.countloud=root=>{
  let per=4,bpm=80,running=false;
  page(root,{body:`
  <div class="row">${chipGroup('Time',[['4','4/4'],['3','3/4'],['2','2/4']],'4')}${chipGroup('Speed',[['60','Turtle'],['80','Walking'],['104','Rabbit']],'80')}${voiceChip()}</div>
  <div class="panel"><div class="counter" id="ctr"></div></div>
  <div class="row"><button class="btn primary" id="go">${ICON.play} Count with me</button><button class="btn" id="ci">Practise a count-in</button></div>
  <div class="say" id="say">We count every beat out loud: <span class="hl">1 2 3 4</span>, 1 2 3 4. Beat 1 is the strong one!</div>`,
  notes:['Counting is the steady "clock" of music. Every note and rest sits on this clock.','Count out loud, clearly and steadily. Say "one" a little stronger: it starts every box.','The count-in ("1, 2, ready, go!") tells everyone the speed before the music starts.','Clap, march or pat knees while counting. The body learns the beat first.'],quiz:'cb'});
  const ctr=$('#ctr',root),sayEl=$('#say',root),goB=$('#go',root);bindVoice(root);
  const draw=()=>{ctr.innerHTML=`<i class="ball" id="ball"></i>`+Array.from({length:per},(_,i)=>`<span class="${i?'':'one'}">${i+1}</span>`).join('')};draw();
  const mark=k=>{const sp=$$('span',ctr);sp.forEach((x,i)=>x.classList.toggle('on',i===k));const b=$('#ball',ctr),t=sp[k];if(t&&b){b.style.transform=`translateX(${t.offsetLeft+t.offsetWidth/2-17}px)`;b.classList.remove('hop');void b.offsetWidth;b.classList.add('hop')}};
  const stop=()=>{running=false;cancelRuns();goB.innerHTML=`${ICON.play} Count with me`;mark(-1)};
  bindChips(root,'Time',v=>{per=+v;stop();draw();say(sayEl,per===4?'4/4: count 1 2 3 4.':per===3?'3/4: count 1 2 3, like a waltz. Sway!':'2/4: count 1 2, like marching feet.')});
  bindChips(root,'Speed',v=>bpm=+v);
  goB.onclick=()=>{if(running)return stop();running=true;goB.innerHTML=`${ICON.stop} Stop`;say(sayEl,'Count with me! Say each number as the ball lands.');
    run(async g=>{let k=0;const t0=performance.now();let next=t0;while(!g()){const d=next-performance.now();if(d>0)await wait(d);if(g())return;const b=k%per;mark(b);click(b===0);speak(NUMW[b]);k++;next+=60000/bpm}})};
  $('#ci',root).onclick=()=>{stop();run(async g=>{const words=per===4?['1','2','Ready','Go!']:Array.from({length:per},(_,i)=>String(i+1));for(let k=0;k<per;k++){if(g())return;mark(k);click(k===0);speak(per===4?['one','two','ready','go'][k]:NUMW[k]);say(sayEl,`<span class="hl">${words[k]}</span>`);await wait(60000/bpm)}mark(-1);say(sayEl,'That is a count-in. Now everyone knows the speed and starts together!')})};
};

/* ---- Count & Hold Every Note ---- */
MOUNT.counthold=root=>{
  const T=[
    {k:'w',p:['w'],how:'Press on <span class="hl">1</span>. Keep holding while you count <span class="hl">2, 3, 4</span>. Let go just before the next 1.'},
    {k:'hd',p:['hd','q'],how:'Press on <span class="hl">1</span>, hold through <span class="hl">2, 3</span>. Then a new note on 4.'},
    {k:'h',p:['h','h'],how:'Press on <span class="hl">1</span>, hold <span class="hl">2</span>. Press again on <span class="hl">3</span>, hold <span class="hl">4</span>.'},
    {k:'q',p:['q','q','q','q'],how:'One press on every number: <span class="hl">1, 2, 3, 4</span>. Walking notes!'},
    {k:'e',p:['e','e','e','e','e','e','e','e'],how:'Two presses in every beat. Count <span class="hl">1 & 2 & 3 & 4 &</span> and press on every word.'},
    {k:'rq',p:['q','rq','q','rq'],how:'Rests are counted too! Press on 1, whisper <span class="hl">(2)</span>, press on 3, whisper <span class="hl">(4)</span>.'},
    {k:'rh',p:['h','rh'],how:'Press on 1, hold 2. Then lift your hand and whisper <span class="hl">(3) (4)</span>.'},
    {k:'rw',p:['rw'],how:'A whole box of quiet. Hands in your lap, whisper <span class="hl">(1) (2) (3) (4)</span>.'}];
  let cur=0;
  const pic=t=>t.k[0]==='r'?mini({type:'rest',dur:t.k.slice(1)},120):t.k==='e'?(()=>{const a={type:'note',d:31,dur:'e',x:40,stem:'up',beamed:true},b={type:'note',d:31,dur:'e',x:80,stem:'up',beamed:true};return engrave({clef:null,width:120,height:250,x0:8,x1:112,items:[a,b,{type:'beam',a,b}]})})():mini({type:'note',d:31,dur:t.k},120);
  page(root,{body:`
  <div class="cards" id="cards">${T.map((t,i)=>`<button class="vcard${i?'':' on'}" data-i="${i}">${pic(t)}<b>${FW[t.k]}</b></button>`).join('')}</div>
  <div class="panel" style="display:flex;flex-direction:column;gap:12px"><div class="svgwrap" id="sv"></div><div id="bm"></div></div>
  <div class="say" id="how"></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Count &amp; play it</button>${voiceChip()}</div>
  <div class="say" id="say">Pick a note. Watch when to <span class="hl">press</span>, when to <span class="hl">hold</span>, and when to <span class="hl">rest</span>.</div>`,
  notes:['For every note, ask three questions: When do I press? How long do I hold? When do I let go?','Keep counting out loud while holding. The count never stops, even when the finger doesn\'t move.','For rests, whisper the number in brackets (like "(2)") and lift the hand slightly.','Practise each card: first count only, then count and clap, then count and play on one key.'],quiz:'rc'});
  const sv=$('#sv',root),bmEl=$('#bm',root),how=$('#how',root),sayEl=$('#say',root);bindVoice(root);
  const evs=()=>rhythm(T[cur].p,34,67);
  const draw=()=>{sv.innerHTML=oneLine(T[cur].p);bmEl.innerHTML=beatMap(evs());say(how,`<b>${FW[T[cur].k]}:</b>&nbsp;${T[cur].how}`)};draw();
  $$('.vcard',root).forEach(c=>c.onclick=()=>{cancelRuns();cur=+c.dataset.i;$$('.vcard',root).forEach(x=>x.classList.toggle('on',x===c));draw()});
  $('#play',root).onclick=()=>run(async g=>{const ev=evs();let curEv=-1;
    await timeline(ev,{bpm:72,gone:g,onCountIn:(k,w)=>say(sayEl,`Count-in: <span class="hl">${w}</span>`),
      onEvent:(i,e)=>{curEv=i;hl(sv,i);$$('.bm-n',bmEl).forEach((b,j)=>b.classList.toggle('now',j===i));say(sayEl,e.rest?'<span class="muted">shh… rest</span>':'<span class="hl">Press!</span>')},
      onHalf:s=>{bmAt(bmEl,s);const e=ev[curEv];if(s%2===0&&e&&!e.rest&&ev.slice(0,curEv).reduce((a,x)=>a+DUR[x.dur],0)*2!==s)say(sayEl,'hold… keep counting')}});
    hl(sv,null);bmClear(bmEl);say(sayEl,'Great counting! Try another note.')});
};

/* ---- The Beat Map ---- */
MOUNT.beatmap=root=>{
  let cur=0,hide=false;
  page(root,{body:`
  <div class="row">${chipGroup('Rhythm',RHY.map((r,i)=>[String(i),r.n]),'0')}</div>
  <div class="panel" style="display:flex;flex-direction:column;gap:12px"><div class="svgwrap" id="sv"></div><div id="bm"></div></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Play &amp; follow</button><button class="chip" id="hd" aria-pressed="false">Hide the numbers</button>${voiceChip()}</div>
  <div class="say" id="say">Long notes make long bars. The numbers underneath show every count the note covers.</div>`,
  notes:['The beat map turns rhythm into a picture: each bar is as long as the note lasts.','Point to each count with a finger while counting out loud. Press when a new bar starts; hold while the bar keeps going.','The little "&" boxes are the halfway points between beats, used by eighth notes.','Tap <em>Hide the numbers</em> and let the child say the counts for each note.'],quiz:'cb'});
  const sv=$('#sv',root),bmEl=$('#bm',root),sayEl=$('#say',root);bindVoice(root);
  const ev=()=>rhythm(RHY[cur].p,34,67);
  const draw=()=>{sv.innerHTML=oneLine(RHY[cur].p);bmEl.innerHTML=beatMap(ev(),{hide})};draw();
  bindChips(root,'Rhythm',v=>{cur=+v;cancelRuns();draw()});
  $('#hd',root).onclick=e=>{hide=!hide;e.currentTarget.setAttribute('aria-pressed',hide);draw();say(sayEl,hide?'Numbers hidden! Point and count each box out loud.':'Numbers are back.')};
  $('#play',root).onclick=()=>run(async g=>{await timeline(ev(),{bpm:76,gone:g,onCountIn:(k,w)=>say(sayEl,`<span class="hl">${w}</span>`),onEvent:(i,e)=>{hl(sv,i);$$('.bm-n',bmEl).forEach((b,j)=>b.classList.toggle('now',j===i));say(sayEl,e.rest?'shh':SYL[e.dur])},onHalf:s=>bmAt(bmEl,s)});hl(sv,null);bmClear(bmEl);say(sayEl,'You followed the map!')});
};

/* ---- Count, Then Play ---- */
MOUNT.countplay=root=>{
  const STEPS=[['Clap & count','Clap each note while counting out loud.'],['Say the rhythm','Say ta, ta-a, ti-ti in time. No piano yet!'],['One key','Play the rhythm on just one key (G), still counting.'],['Play the tune','Now play the real notes. Keep counting!']];
  let si=0,step=0,done=new Set(),marks={};
  const phrase=()=>{const all=parse(SONGS[si].s),out=[];let acc=0;for(const e of all){if(acc>=8)break;out.push(e);acc+=DUR[e.dur]}return out};
  page(root,{body:`
  <div class="row">${chipGroup('Song',SONGS.map((s,i)=>[String(i),s.n]),'0')}</div>
  <div class="steps" id="steps"></div>
  <div class="panel" style="display:flex;flex-direction:column;gap:12px"><div class="svgwrap" id="sv"></div><div id="bm"></div></div>
  <div class="row"><button class="btn primary" id="play">${ICON.play} Start this step</button>${voiceChip()}</div>
  <div class="panel svgwrap" id="kb"></div>
  <div class="say" id="say"></div>`,
  notes:['This is the routine for every new piece: <em>count → clap → say → one key → real notes</em>.','Only move to the next step when the current one feels easy. Repeat a step as often as needed.','We practise the first two boxes (8 beats) of each song. Short and successful beats long and messy.','The voice counts along; switch it off once the child can count alone.'],quiz:'tap'});
  const sv=$('#sv',root),bmEl=$('#bm',root),kb=$('#kb',root),sayEl=$('#say',root),stEl=$('#steps',root);bindVoice(root);
  const drawSteps=()=>{stEl.innerHTML=STEPS.map(([t],i)=>`<button class="step${done.has(i)?' done':''}" data-s="${i}"${i===step?' aria-current="step"':''}><span class="n">${done.has(i)?'✓':i+1}</span>${t}</button>`).join('');$$('[data-s]',stEl).forEach(b=>b.onclick=()=>{cancelRuns();step=+b.dataset.s;draw()})};
  const draw=()=>{const ev=phrase(),tune=step===3;const {items}=layout(ev,{startX:150,BW:44,pad:34,lead:26,counts:true,letters:tune,colors:tune,final:true});sv.innerHTML=engrave({clef:'treble',timeSig:[4,4],items,height:285});
    bmEl.innerHTML=beatMap(ev.map(e=>tune?e:{...e,letter:'',color:'var(--g)'}));kb.hidden=step<2;kb.innerHTML=keysSVG({from:25,to:35,marks,labels:true});drawSteps();say(sayEl,`<b>Step ${step+1}: ${STEPS[step][0]}.</b>&nbsp;${STEPS[step][1]}`)};draw();
  bindChips(root,'Song',v=>{si=+v;cancelRuns();done.clear();step=0;draw()});
  $('#play',root).onclick=()=>run(async g=>{const ev=phrase();marks={};
    const ok=await timeline(ev.map(e=>step===2?{...e,midi:67}:e),{bpm:76,gone:g,sound:step===0?'clap':step===1?'none':'tone',voice:step!==1,sayFn:step===1?null:null,
      onCountIn:(k,w)=>say(sayEl,`<span class="hl">${w}</span>`),
      onEvent:(i,e)=>{hl(sv,i);$$('.bm-n',bmEl).forEach((b,j)=>b.classList.toggle('now',j===i));if(step===1)say(sayEl,`<span class="hl" style="font-size:1.4em">${e.rest?'shh':SYL[e.dur]}</span>`);else if(step===3&&!e.rest){marks={[e.midi]:e.color};kb.innerHTML=keysSVG({from:25,to:35,marks,labels:true});say(sayEl,`${tag(e.letter)} ${countLabel(e)}`)}else if(step===2&&!e.rest){marks={67:'var(--g)'};kb.innerHTML=keysSVG({from:25,to:35,marks,labels:true})}},
      onHalf:s=>bmAt(bmEl,s)});
    hl(sv,null);bmClear(bmEl);marks={};if(!ok)return;
    if(!done.has(step)){done.add(step);addStar();burst(stEl,24)}
    if(done.size===4){draw();party('Count & Play champion!',`You learned ${SONGS[si].n} step by step.`,null,'Yay!')}
    else{step=Math.min(3,step+1);draw();say(sayEl,`Well done! Next, <b>Step ${step+1}: ${STEPS[step][0]}</b>.`)}});
};

/* ---- Tap the Rhythm (game) ---- */
function judgeTaps(expected,taps){
  const used=new Set();return expected.map(t=>{let best=-1,bd=1e9;taps.forEach((x,j)=>{if(used.has(j))return;const d=Math.abs(x-t);if(d<bd){bd=d;best=j}});if(best>=0&&bd<260){used.add(best);return bd<110?'p':'g'}return 'm'});
}
MOUNT.taprhythm=root=>{
  let cur=0,helper=true,taps=[],live=false;
  page(root,{body:`
  <div class="row">${chipGroup('Rhythm',RHY.map((r,i)=>[String(i),r.n]),'0')}</div>
  <div class="panel" style="display:flex;flex-direction:column;gap:12px"><div class="svgwrap" id="sv"></div><div id="bm"></div></div>
  <div class="row" style="justify-content:center;gap:24px"><button class="btn primary" id="go">${ICON.play} Start</button><button class="tapbig" id="tap">Tap!</button><div style="display:flex;flex-direction:column;gap:8px"><button class="chip" id="hp" aria-pressed="true">Helper sound</button>${voiceChip()}</div></div>
  <div class="tapres" id="res"></div>
  <div class="say" id="say">Press Start. After “1, 2, ready, go”, tap the big button (or the space bar) every time a note <span class="hl">starts</span>. Don't tap on rests!</div>`,
  notes:['Tap only when a note <em>starts</em>; for long notes, keep counting but don\'t tap again.','Turn off <em>Helper sound</em> for a real challenge: the child must read the rhythm alone.','Green = right on time, yellow = close, red = missed.'],quiz:'tap'});
  const sv=$('#sv',root),bmEl=$('#bm',root),sayEl=$('#say',root),res=$('#res',root);bindVoice(root);
  const ev=()=>rhythm(RHY[cur].p,34,67);
  const draw=()=>{sv.innerHTML=oneLine(RHY[cur].p);bmEl.innerHTML=beatMap(ev());res.textContent=''};draw();
  bindChips(root,'Rhythm',v=>{cur=+v;cancelRuns();live=false;draw()});
  $('#hp',root).onclick=e=>{helper=!helper;e.currentTarget.setAttribute('aria-pressed',helper)};
  const tap=()=>{if(!live)return;taps.push(performance.now());const b=$('#tap',root);b.classList.remove('shake');burst(b,6)};
  $('#tap',root).onpointerdown=e=>{e.preventDefault();tap()};spaceTap=tap;
  $('#go',root).onclick=()=>run(async g=>{draw();taps=[];let t0=0,half=0;const e=ev();
    const ok=await timeline(e,{bpm:72,gone:g,sound:helper?'tone':'none',onStart:(a,h)=>{t0=a;half=h;live=true},onCountIn:(k,w)=>say(sayEl,`<span class="hl">${w}</span>`),onEvent:(i,x)=>{say(sayEl,x.rest?'shh':'tap!')},onHalf:s=>bmAt(bmEl,s)});
    live=false;bmClear(bmEl);if(!ok)return;
    let acc=0;const exp=[],idx=[];e.forEach((x,i)=>{if(!x.rest){exp.push(t0+acc*2*half);idx.push(i)}acc+=DUR[x.dur]});
    const r=judgeTaps(exp,taps),bars=$$('.bm-n',bmEl);r.forEach((v,k)=>bars[idx[k]].classList.add('hit-'+v));
    const score=r.reduce((a,v)=>a+(v==='p'?1:v==='g'?.6:0),0)/r.length,extra=Math.max(0,taps.length-r.filter(v=>v!=='m').length);
    res.innerHTML=`${r.filter(v=>v==='p').length} perfect · ${r.filter(v=>v==='g').length} close · ${r.filter(v=>v==='m').length} missed${extra?` · ${extra} extra`:''}`;
    if(score>=.8&&!extra){addStar();confetti();say(sayEl,'Fantastic rhythm! Try another one, or turn off the helper sound.')}else say(sayEl,'Good try! Count along and tap only when a note starts. Press Start again.')});
};
