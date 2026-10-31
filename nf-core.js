/* Note Friends — core: music data, sound, drawing (staff + piano), playback, rewards */
const LETTERS=['C','D','E','F','G','A','B'];
const SEMI=[0,2,4,5,7,9,11];
const COLOR={C:'var(--c)',D:'var(--d)',E:'var(--e)',F:'var(--f)',G:'var(--g)',A:'var(--a)',B:'var(--b)'};
const ANIMAL={C:'Cat',D:'Dog',E:'Elephant',F:'Fish',G:'Goat',A:'Ant',B:'Bee'};
const DUR={w:4,hd:3,h:2,q:1,e:.5};
const NAME={w:'whole note',hd:'dotted half note',h:'half note',q:'quarter note',e:'eighth note'};
const RNAME={w:'whole rest',h:'half rest',q:'quarter rest',e:'eighth rest'};
const SYL={w:'ta-a-a-a',hd:'ta-a-a',h:'ta-a',q:'ta',e:'ti'};
const dMidi=d=>12*(Math.floor(d/7)+1)+SEMI[((d%7)+7)%7];
const dLetter=d=>LETTERS[((d%7)+7)%7];
const midiLetter=m=>{const i=SEMI.indexOf(m%12);return i<0?null:LETTERS[i]};
const midiD=m=>{const i=SEMI.indexOf(m%12);return i<0?null:(Math.floor(m/12)-1)*7+i};
const MC=28; // Middle C (C4) as a step number
const CLEF={treble:{bottom:30},bass:{bottom:18}};
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const pickNot=(arr,last)=>{let v,k=0;do{v=arr[rnd(arr.length)];k++}while(arr.length>1&&JSON.stringify(v)===JSON.stringify(last)&&k<30);return v};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,v){try{const x=localStorage.getItem(k);return x==null?v:JSON.parse(x)}catch(e){return v}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- sound ---------- */
let soundOn=true,actx=null,master=null,noiseBuf=null;
function audio(){
  try{
    if(!actx){actx=new (window.AudioContext||window.webkitAudioContext)();master=actx.createGain();master.gain.value=.5;master.connect(actx.destination)}
    if(actx.state==='suspended')actx.resume();
  }catch(e){return null}
  return actx;
}
function tone(midi,dur=1.4,delay=0,vol=.3){
  if(!soundOn)return;const a=audio();if(!a)return;
  const t=a.currentTime+delay+.01,f=440*Math.pow(2,(midi-69)/12),short=dur<.3;
  const env=a.createGain();
  env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(vol,t+.012);
  if(!short)env.gain.exponentialRampToValueAtTime(vol*.4,t+.28);
  env.gain.exponentialRampToValueAtTime(.0001,t+dur);
  env.connect(master);
  [[1,1,'triangle'],[2,.32,'sine'],[3,.12,'sine'],[4,.05,'sine']].forEach(([h,g,ty])=>{
    const o=a.createOscillator();o.type=ty;o.frequency.value=f*h;const gg=a.createGain();gg.gain.value=g;
    o.connect(gg);gg.connect(env);o.start(t);o.stop(t+dur+.05);
  });
}
function click(accent){
  if(!soundOn)return;const a=audio();if(!a)return;const t=a.currentTime+.005;
  const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=accent?1900:1300;
  g.gain.setValueAtTime(accent?.35:.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);o.connect(g);g.connect(master);o.start(t);o.stop(t+.08);
}
function clap(vol=.5){
  if(!soundOn)return;const a=audio();if(!a)return;
  if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.3,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  const t=a.currentTime+.005;
  [0,.011,.022].forEach((o,k)=>{const src=a.createBufferSource();src.buffer=noiseBuf;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1300;bp.Q.value=.9;const g=a.createGain();g.gain.setValueAtTime(vol,t+o);g.gain.exponentialRampToValueAtTime(.001,t+o+(k===2?.16:.025));src.connect(bp);bp.connect(g);g.connect(master);src.start(t+o);src.stop(t+o+.25)});
}
const yay=()=>{tone(79,.5,0,.16);tone(84,.6,.11,.16);tone(88,.9,.22,.14)};
const oops=()=>{tone(57,.35,0,.12);tone(55,.45,.16,.12)};

/* ---------- cancellable runs (stop when you leave a page) ---------- */
let runId=0;const wait=ms=>new Promise(r=>setTimeout(r,ms));
function run(fn){const id=++runId;return fn(()=>id!==runId)}
function cancelRuns(){runId++}

/* ---------- little pictures ---------- */
function starSVG(cls=''){return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"/></svg>`}
const ICON={
  speaker:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  play:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>`,
  stop:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>`,
  flame:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4 1-6 1-9z" fill="var(--d)"/></svg>`,
  check:`<svg class="ck" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--good)"/><path d="M7 12.5l3.2 3.2L17 9" stroke="var(--dark)" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trophy:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="var(--star)"/><path d="M18 12H8a10 10 0 0 0 12 14M46 12h10a10 10 0 0 1-12 14" stroke="var(--star)" stroke-width="4" fill="none"/><rect x="28" y="36" width="8" height="10" fill="var(--d)"/><rect x="18" y="46" width="28" height="8" rx="3" fill="var(--d)"/></svg>`,
};
function blob(L){
  const c=COLOR[L];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="94" rx="30" ry="4" fill="rgba(0,0,0,.35)"/><path d="M50 14 C76 14 92 34 90 58 C88 80 72 90 50 90 C28 90 12 80 10 58 C8 34 24 14 50 14Z" fill="${c}"/><ellipse cx="34" cy="30" rx="10" ry="6" fill="rgba(255,255,255,.35)" transform="rotate(-25 34 30)"/><circle cx="37" cy="50" r="7" fill="var(--dark)"/><circle cx="63" cy="50" r="7" fill="var(--dark)"/><circle cx="39.5" cy="47.5" r="2.4" fill="#fff"/><circle cx="65.5" cy="47.5" r="2.4" fill="#fff"/><circle cx="27" cy="62" r="5" fill="rgba(255,90,140,.45)"/><circle cx="73" cy="62" r="5" fill="rgba(255,90,140,.45)"/><path d="M40 64 Q50 74 60 64" stroke="var(--dark)" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
}
const CRIT={
  bird:`<ellipse cx="48" cy="58" rx="30" ry="25" fill="var(--g)"/><path d="M34 56 Q50 82 66 60 Q52 66 34 56Z" fill="#1fa3bb"/><path d="M20 52 L4 42 L8 62Z" fill="#1fa3bb"/><circle cx="60" cy="48" r="5" fill="var(--dark)"/><circle cx="61.5" cy="46.5" r="1.6" fill="#fff"/><path d="M76 50 L94 55 L76 61Z" fill="var(--d)"/><path d="M42 82 L40 94 M54 82 L56 94" stroke="var(--d)" stroke-width="3" stroke-linecap="round"/>`,
  bear:`<circle cx="26" cy="28" r="13" fill="#9a6440"/><circle cx="74" cy="28" r="13" fill="#9a6440"/><circle cx="26" cy="28" r="6" fill="#e6b88e"/><circle cx="74" cy="28" r="6" fill="#e6b88e"/><circle cx="50" cy="56" r="36" fill="#b47a4c"/><ellipse cx="50" cy="69" rx="16" ry="12" fill="#ecc9a0"/><ellipse cx="50" cy="63" rx="6" ry="4.5" fill="var(--dark)"/><circle cx="37" cy="48" r="4.5" fill="var(--dark)"/><circle cx="63" cy="48" r="4.5" fill="var(--dark)"/><path d="M44 73 Q50 78 56 73" stroke="var(--dark)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  mouse:`<circle cx="24" cy="34" r="19" fill="#b9bdd8"/><circle cx="76" cy="34" r="19" fill="#b9bdd8"/><circle cx="24" cy="34" r="10" fill="#ffb3c8"/><circle cx="76" cy="34" r="10" fill="#ffb3c8"/><ellipse cx="50" cy="62" rx="30" ry="27" fill="#cfd2ea"/><circle cx="40" cy="56" r="4" fill="var(--dark)"/><circle cx="60" cy="56" r="4" fill="var(--dark)"/><circle cx="50" cy="68" r="4" fill="#ff8fb0"/><path d="M30 68 L14 64 M30 72 L14 74 M70 68 L86 64 M70 72 L86 74" stroke="#8a8fb5" stroke-width="1.8" stroke-linecap="round"/>`,
  lion:`<circle cx="50" cy="52" r="45" fill="#e2913a"/><circle cx="50" cy="52" r="38" fill="#c9752a"/><circle cx="50" cy="55" r="29" fill="#ffd27a"/><circle cx="29" cy="32" r="7" fill="#ffd27a"/><circle cx="71" cy="32" r="7" fill="#ffd27a"/><circle cx="40" cy="49" r="4" fill="var(--dark)"/><circle cx="60" cy="49" r="4" fill="var(--dark)"/><path d="M45 58 L55 58 L50 64Z" fill="#7a3e1a"/><path d="M40 68 Q50 80 60 68 Z" fill="#7a3e1a"/>`,
  turtle:`<ellipse cx="50" cy="74" rx="34" ry="6" fill="rgba(0,0,0,.3)"/><ellipse cx="26" cy="70" rx="7" ry="5" fill="#8fe39a"/><ellipse cx="68" cy="70" rx="7" ry="5" fill="#8fe39a"/><circle cx="84" cy="56" r="10" fill="#8fe39a"/><circle cx="87" cy="53" r="2.4" fill="var(--dark)"/><path d="M14 66 Q46 12 78 66Z" fill="#3fb36b"/><path d="M30 60 L38 42 L54 42 L62 60 M38 42 L46 30 L54 42" stroke="#2a8a4f" stroke-width="3" fill="none"/>`,
  rabbit:`<ellipse cx="38" cy="26" rx="8" ry="22" fill="#eef0ff"/><ellipse cx="62" cy="26" rx="8" ry="22" fill="#eef0ff"/><ellipse cx="38" cy="26" rx="4" ry="15" fill="#ffb3c8"/><ellipse cx="62" cy="26" rx="4" ry="15" fill="#ffb3c8"/><circle cx="50" cy="64" r="27" fill="#eef0ff"/><circle cx="40" cy="58" r="4" fill="var(--dark)"/><circle cx="60" cy="58" r="4" fill="var(--dark)"/><ellipse cx="50" cy="68" rx="4" ry="3" fill="#ff8fb0"/><rect x="46" y="72" width="8" height="7" rx="1.5" fill="#fff" stroke="#c9cbe6"/>`,
};
const critter=(k,cls='')=>k==='blob'?blob('G').replace('<svg ',`<svg class="crit ${cls}" `):`<svg class="crit ${cls}" viewBox="0 0 100 100" aria-hidden="true">${CRIT[k]}</svg>`;
const HEART=`<svg class="heart" id="heart" viewBox="0 0 100 90" aria-hidden="true"><path d="M50 84 C20 62 4 46 4 28 C4 14 16 4 29 4 C39 4 46 10 50 18 C54 10 61 4 71 4 C84 4 96 14 96 28 C96 46 80 62 50 84Z" fill="var(--c)"/><ellipse cx="28" cy="24" rx="9" ry="6" fill="rgba(255,255,255,.35)" transform="rotate(-30 28 24)"/></svg>`;
function handSVG(side,lit){
  const R=side==='R',F=[[1,40,96,58,26,-38],[2,70,26,92,25,-8],[3,100,12,104,25,0],[4,130,24,94,25,8],[5,158,50,70,23,18]];
  const mx=x=>R?x:200-x;
  let s=`<svg class="hand" viewBox="0 0 200 200" role="img" aria-label="${R?'Right':'Left'} hand"><rect x="${R?52:28}" y="92" width="120" height="96" rx="44" fill="var(--handc)"/>`;
  F.forEach(([n,x,y,h,w,rot])=>{const cx=mx(x),r=R?rot:-rot;s+=`<g class="finger${lit===n?' on':''}" data-f="${n}" data-side="${side}" transform="rotate(${r} ${cx} ${y+h})"><rect x="${cx-w/2}" y="${y}" width="${w}" height="${h}" rx="${w/2}" fill="var(--handc)"/><circle cx="${cx}" cy="${y+17}" r="13" class="fnum"/><text x="${cx}" y="${y+23}" class="ftxt">${n}</text></g>`});
  return s+`<text x="${R?112:88}" y="158" class="hlabel">${R?'Right':'Left'}</text></svg>`;
}

/* ---------- staff drawing ---------- */
const S=30,RX=S*.62,RY=S*.46;
function posInfo(d,b){
  const p=d-b;
  if(p>=0&&p<=8)return p%2===0?{kind:'line',n:p/2+1,text:`on Line ${p/2+1}`}:{kind:'space',n:(p+1)/2,text:`in Space ${(p+1)/2}`};
  if(p===-1)return{kind:'under',text:'hanging just under the house'};
  if(p===-2)return{kind:'ledger',text:'below the house, on its own little line'};
  if(p===9)return{kind:'roof',text:'sitting on the roof'};
  if(p===10)return{kind:'ledger',text:'above the house, on its own little line'};
  return{kind:'far',text:p<0?'far below the house':'far above the house'};
}
function mkStaff(st){const clef=st.clef??null,b=CLEF[clef||'treble'].bottom,top=st.top??70;return{clef,b,top,bot:top+4*S,oneLine:!!st.oneLine,Y:d=>top+4*S-(d-b)*S/2}}
function arc(x1,y1,x2,y2,below,h){const dir=below?1:-1,mx=(x1+x2)/2;h=h??Math.min(34,10+(x2-x1)*.12);const cy=(below?Math.max(y1,y2):Math.min(y1,y2))+dir*h;return `M${x1} ${y1} Q${mx} ${cy} ${x2} ${y2} Q${mx} ${cy-dir*7} ${x1} ${y1}Z`}
function noteSVG(n,st){
  const y=st.Y(n.d),x=n.x,b=st.b,t=b+8,whole=n.dur==='w',filled=n.dur==='q'||n.dur==='e'||n.solid,rx=whole?S*.74:RX,lw=S*1.15;
  let s='';
  if(!st.oneLine){
    if(n.d<b)for(let L=b-2;L>=n.d;L-=2)s+=`<line class="ledger" x1="${x-lw}" x2="${x+lw}" y1="${st.Y(L)}" y2="${st.Y(L)}"/>`;
    if(n.d>t)for(let L=t+2;L<=n.d;L+=2)s+=`<line class="ledger" x1="${x-lw}" x2="${x+lw}" y1="${st.Y(L)}" y2="${st.Y(L)}"/>`;
  }
  const up=n.stem?n.stem==='up':n.d<b+4;n._up=up;n._y=y;
  let g=`<g class="note ${n.cls||''}"${n.color?` style="--nc:${n.color}"`:''}${n.i!=null?` data-i="${n.i}"`:''}>`;
  if(!whole){
    const sx=up?x+rx-2.5:x-rx+2.5,sy=up?y-S*3.4:y+S*3.4;n._tip={x:sx,y:sy};
    g+=`<line class="stem" x1="${sx}" x2="${sx}" y1="${y}" y2="${sy}"/>`;
    if(n.dur==='e'&&!n.beamed)g+=`<path class="flag" d="M${sx} ${sy} c2 ${up?14:-14} 20 ${up?18:-18} 16 ${up?40:-40}"/>`;
  }
  g+=`<ellipse class="head ${filled?'fill':'hollow'}" cx="${x}" cy="${y}" rx="${rx}" ry="${RY}"${whole?'':` transform="rotate(-18 ${x} ${y})"`}/>`;
  if(n.acc)g+=accSVG(n.acc,x-rx-17,y);
  if(n.dur==='hd'){const dy=((n.d-b)%2===0)?-S/4:0;g+=`<circle class="dot" cx="${x+rx+10}" cy="${y+dy}" r="5"/>`}
  if(n.letter)g+=`<text class="nl${filled?'':' hol'}" x="${x}" y="${y+6}">${n.letter}</text>`;
  return s+g+'</g>';
}
/* sharp, flat and natural signs, drawn centred on (x,y) */
function accSVG(k,x,y){
  if(k==='sharp')return `<g class="acc"><line x1="${x-4}" y1="${y-22}" x2="${x-4}" y2="${y+20}"/><line x1="${x+4}" y1="${y-20}" x2="${x+4}" y2="${y+22}"/><line class="th" x1="${x-10}" y1="${y-5}" x2="${x+10}" y2="${y-11}"/><line class="th" x1="${x-10}" y1="${y+9}" x2="${x+10}" y2="${y+3}"/></g>`;
  if(k==='flat')return `<g class="acc"><line x1="${x-5}" y1="${y-30}" x2="${x-5}" y2="${y+10}"/><path d="M${x-5} ${y+10} C${x+12} ${y+2} ${x+12} ${y-12} ${x-5} ${y-4}"/></g>`;
  return `<g class="acc"><line x1="${x-5}" y1="${y-22}" x2="${x-5}" y2="${y+10}"/><line x1="${x+5}" y1="${y-10}" x2="${x+5}" y2="${y+22}"/><line class="th" x1="${x-5}" y1="${y-6}" x2="${x+5}" y2="${y-10}"/><line class="th" x1="${x-5}" y1="${y+10}" x2="${x+5}" y2="${y+6}"/></g>`;
}
function restSVG(r,st){
  const x=r.x,mid=st.Y(st.b+4),l4=st.oneLine?mid:st.Y(st.b+6);
  let g=`<g class="rest ${r.cls||''}"${r.color?` style="--nc:${r.color}"`:''}${r.i!=null?` data-i="${r.i}"`:''}>`;
  if(r.dur==='w')g+=`<rect x="${x-14}" y="${l4}" width="28" height="${S*.5}" rx="2"/>`;
  else if(r.dur==='h')g+=`<rect x="${x-14}" y="${mid-S*.5}" width="28" height="${S*.5}" rx="2"/>`;
  else if(r.dur==='q')g+=`<path class="rq" d="M${x-5} ${mid-S*1.25} L${x+7} ${mid-S*.5} L${x-5} ${mid+S*.05} L${x+7} ${mid+S*.6} C${x-7} ${mid+S*.35} ${x-9} ${mid+S*.9} ${x} ${mid+S*1.2}"/>`;
  else g+=`<circle cx="${x-6}" cy="${mid-S*.45}" r="5"/><path class="rq" d="M${x-6} ${mid-S*.3} Q${x+2} ${mid-S*.15} ${x+8} ${mid-S*.6} L${x-2} ${mid+S*.8}"/>`;
  return g+'</g>';
}
/* o: {width,height,clef|staves,brace,timeSig,x0,x1,items,rows,lineNums,litLines,glowLine,glowSpaces,glowClef,glowTime,aria} */
function engrave(o){
  const W=o.width||800,H=o.height||270;
  const staves=(o.staves||[{clef:o.clef??null,top:o.top}]).map(mkStaff),st0=staves[0];
  const x0=o.x0??(o.lineNums?74:(o.brace?44:14)),x1=o.x1??W-14;
  let s=`<svg class="staff" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria||'Music staff'}">`;
  (o.glowSpaces||[]).forEach(d=>{s+=`<rect class="glow-space" x="${x0}" y="${st0.Y(d)-S/2+2}" width="${x1-x0}" height="${S-4}" rx="8"/>`});
  if(o.glowLine){const y=st0.Y(st0.b+(o.glowLine-1)*2);s+=`<line class="glow-line" x1="${x0}" x2="${x1}" y1="${y}" y2="${y}"/>`}
  staves.forEach((st,si)=>{
    if(st.oneLine){const y=st.Y(st.b+4);s+=`<line class="sl" x1="${x0}" x2="${x1}" y1="${y}" y2="${y}"/>`;return}
    for(let i=0;i<5;i++){const y=st.Y(st.b+i*2),lit=si===0&&o.litLines&&o.litLines.includes(i+1);s+=`<line class="sl${lit?' lit':''}" x1="${x0}" x2="${x1}" y1="${y}" y2="${y}"/>`}
    /* data-box = left,inkTop,inkBottom: placeClefs() fits the glyph's real ink to this box (standard engraving proportions) */
    if(st.clef==='treble')s+=`<text class="clef${o.glowClef?' glow':''}" data-k="treble" data-box="${x0+12},${st.top-1.4*S},${st.bot+1.6*S}" x="${x0+14}" y="${st.Y(st.b+2)}" font-size="${4*S}">\u{1D11E}</text>`;
    if(st.clef==='bass')s+=`<text class="clef${o.glowClef?' glow':''}" data-k="bass" data-box="${x0+14},${st.top-.05*S},${st.top+3.6*S}" x="${x0+14}" y="${st.Y(st.b+6)}" font-size="${4*S}">\u{1D122}</text>`;
    if(o.timeSig){const tx=st.clef?x0+118:x0+30;s+=`<text class="tsig${o.glowTime?' glow':''}" x="${tx}" y="${st.Y(st.b+6)+S*.75}">${o.timeSig[0]}</text><text class="tsig${o.glowTime?' glow':''}" x="${tx}" y="${st.Y(st.b+2)+S*.75}">${o.timeSig[1]}</text>`}
  });
  if(o.brace&&staves.length>1){const yt=staves[0].top,yb=staves[1].bot,m=(yt+yb)/2;s+=`<line class="barl" x1="${x0}" x2="${x0}" y1="${yt}" y2="${yb}"/><path class="brace" d="M${x0-10} ${yt} C${x0-30} ${yt+30} ${x0-8} ${m-30} ${x0-26} ${m} C${x0-8} ${m+30} ${x0-30} ${yb-30} ${x0-10} ${yb}"/>`}
  if(o.lineNums&&!st0.oneLine){
    for(let i=0;i<5;i++){const y=st0.Y(st0.b+i*2);s+=`<g class="num"><circle cx="24" cy="${y}" r="13"/><text x="24" y="${y+6}">${i+1}</text></g>`}
    for(let j=1;j<=4;j++){const y=st0.Y(st0.b+j*2-1);s+=`<text class="snum" x="56" y="${y+5}">${j}</text>`}
  }
  const its=o.items||[],stOf=it=>staves[it.s||0];
  const span=st=>st.oneLine?[st.Y(st.b+4)-S,st.Y(st.b+4)+S]:[st.top,st.bot];
  its.forEach(it=>{
    if(it.type==='bar'){const ss=it.s!=null?[stOf(it)]:staves;ss.forEach(st=>{const [ya,yb]=span(st);s+=it.final?`<line class="barl" x1="${it.x-10}" x2="${it.x-10}" y1="${ya}" y2="${yb}"/><rect class="barthick" x="${it.x-5}" y="${ya}" width="6" height="${yb-ya}"/>`:`<line class="barl" x1="${it.x}" x2="${it.x}" y1="${ya}" y2="${yb}"/>`})}
    if(it.type==='repeat'){const st=stOf(it),[ya,yb]=span(st),d1=st.oneLine?st.Y(st.b+4)-S/2:st.Y(st.b+5),d2=st.oneLine?st.Y(st.b+4)+S/2:st.Y(st.b+3);
      if(it.end)s+=`<g class="${it.cls||''}"><circle class="barthick" cx="${it.x-22}" cy="${d1}" r="5"/><circle class="barthick" cx="${it.x-22}" cy="${d2}" r="5"/><line class="barl" x1="${it.x-12}" x2="${it.x-12}" y1="${ya}" y2="${yb}"/><rect class="barthick" x="${it.x-6}" y="${ya}" width="7" height="${yb-ya}"/></g>`;
      else s+=`<g class="${it.cls||''}"><rect class="barthick" x="${it.x}" y="${ya}" width="7" height="${yb-ya}"/><line class="barl" x1="${it.x+13}" x2="${it.x+13}" y1="${ya}" y2="${yb}"/><circle class="barthick" cx="${it.x+23}" cy="${d1}" r="5"/><circle class="barthick" cx="${it.x+23}" cy="${d2}" r="5"/></g>`}
    if(it.type==='gap'){const st=stOf(it);s+=`<rect class="gap" x="${it.x1}" y="${st.top-14}" width="${it.x2-it.x1}" height="${4*S+28}" rx="14"/><text class="gapq" x="${(it.x1+it.x2)/2}" y="${st.Y(st.b+4)+16}">?</text>`}
  });
  its.forEach(it=>{if(it.type==='note')s+=noteSVG(it,stOf(it));if(it.type==='rest')s+=restSVG(it,stOf(it))});
  its.forEach(it=>{
    const st=stOf(it);
    if(it.type==='beam'&&it.a._tip&&it.b._tip){const a=it.a._tip,b=it.b._tip,up=it.a._up,th=up?7:-7;s+=`<polygon class="beam" style="--nc:${it.a.color||'var(--staff)'}" points="${a.x},${a.y} ${b.x},${b.y} ${b.x},${b.y+th} ${a.x},${a.y+th}"/>`}
    if(it.type==='tie'){const a=it.a,b=it.b,below=a._up,dir=below?1:-1,y=a._y+dir*(RY+5);s+=`<path class="tie"${it.color?` style="--tc:${it.color}"`:''} d="${arc(a.x+RX*.4,y,b.x-RX*.4,y,below,16)}"/>`}
    if(it.type==='slur'){const a=it.a,b=it.b,below=it.below??a._up,dir=below?1:-1;s+=`<path class="tie"${it.color?` style="--tc:${it.color}"`:''} d="${arc(a.x,a._y+dir*(RY+10),b.x,b._y+dir*(RY+10),below,30)}"/>`}
    if(it.type==='stacc'){const a=it.a;s+=`<circle class="stacc" cx="${a.x}" cy="${a._y+(a._up?RY+13:-(RY+13))}" r="6"/>`}
    if(it.type==='accent'){const a=it.a,y=a._y+(a._up?RY+18:-(RY+18));s+=`<path class="hairpin" d="M${a.x-12} ${y-8} L${a.x+12} ${y} L${a.x-12} ${y+8}"/>`}
    if(it.type==='fermata'){const a=it.a,y=Math.min(st.top-14,a._y-(a._up?S*3.4+12:RY+14));s+=`<path class="ferm" d="M${a.x-20} ${y} A20 20 0 0 1 ${a.x+20} ${y}"/><circle class="stacc" cx="${a.x}" cy="${y-6}" r="5"/>`}
    if(it.type==='count'){const y=st.oneLine?st.Y(st.b+4)+S*2.1:st.bot+S*2.4;s+=`<text class="count${it.rest?' r':''}"${it.i!=null?` data-i="${it.i}"`:''} x="${it.x}" y="${y}">${it.text}</text>`;if(it.sub)s+=`<text class="syl" x="${it.x}" y="${y+24}">${it.sub}</text>`}
    if(it.type==='dyn')s+=`<text class="dyn" x="${it.x}" y="${it.y??st.bot+S*2.3}">${it.text}</text>`;
    if(it.type==='hairpin'){const y=it.y??st.bot+S*2,a=it.cresc?it.x1:it.x2,b=it.cresc?it.x2:it.x1;s+=`<path class="hairpin" d="M${b} ${y-13} L${a} ${y} L${b} ${y+13}"/>`}
    if(it.type==='txt')s+=`<text class="${it.cls||'callout'}" x="${it.x}" y="${it.y}">${it.text}</text>`;
    if(it.type==='ghost')s+=`<ellipse class="ghost" cx="${it.x}" cy="${st.Y(it.d??st.b+4)}" rx="${RX}" ry="${RY}"/>`;
  });
  if(o.rows){
    const rows=typeof o.rows[0]==='number'?[{s:0,from:o.rows[0],to:o.rows[1]}]:o.rows;
    rows.forEach(r=>{const st=staves[r.s||0];for(let d=r.from;d<=r.to;d++)s+=`<rect class="hit" data-d="${d}" data-s="${r.s||0}" x="${x0}" y="${st.Y(d)-S/4}" width="${x1-x0}" height="${S/2}"><title>${posInfo(d,st.b).text}</title></rect>`});
  }
  return s+'</svg>';
}
/* Clef glyphs: measure the font's real ink once it loads, then fit every clef to its data-box. */
const CLEFM={},CLEFCH={treble:'\u{1D11E}',bass:'\u{1D122}'};
function measureClefs(){
  const c=document.createElement('canvas').getContext('2d');
  c.font=`100px 'Noto Music','Apple Symbols','Segoe UI Symbol',serif`;
  Object.entries(CLEFCH).forEach(([k,ch])=>{const m=c.measureText(ch),h=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;if(h>0)CLEFM[k]={a:m.actualBoundingBoxAscent,d:m.actualBoundingBoxDescent,l:m.actualBoundingBoxLeft}});
}
function placeClefs(root=document){
  $$('text.clef[data-box]',root).forEach(t=>{const m=CLEFM[t.dataset.k];if(!m)return;const [x,top,bot]=t.dataset.box.split(',').map(Number),F=100*(bot-top)/(m.a+m.d);
    t.setAttribute('font-size',F.toFixed(2));t.setAttribute('y',(top+m.a*F/100).toFixed(2));t.setAttribute('x',(x+m.l*F/100).toFixed(2))});
}
(document.fonts&&document.fonts.load?document.fonts.load(`100px 'Noto Music'`,CLEFCH.treble+CLEFCH.bass):Promise.resolve()).catch(()=>{}).then(()=>{measureClefs();placeClefs()});
new MutationObserver(()=>placeClefs()).observe(document.body,{childList:true,subtree:true});
function countLabel(e){
  if(e.dur==='e')return Number.isInteger(e.beat)?`${e.beat+1}`:'&';
  const a=[];for(let k=0;k<DUR[e.dur];k++)a.push(e.beat+k+1);return a.join(' ');
}
/* Lay out events into measures. Returns {items, end, MW}. */
function layout(evts,o={}){
  const per=o.per||4,BW=o.BW||32,pad=o.pad||34,startX=o.startX??140,lead=o.lead||24,MW=per*BW+pad,items=[],ni=[];
  let beat=0,m=0,cur=startX+lead;const barsAt=[];
  evts.forEach((e,i)=>{
    const gi=e.gi??i,x=o.flow?cur:startX+m*MW+lead+beat*BW;e.x=x;e.m=m;e.beat=beat;
    if(o.flow)cur+=Math.max(DUR[e.dur]*BW,o.minGap||44);
    const it=e.rest?{type:'rest',dur:e.dur,x,i:gi,s:o.s||0}:{type:'note',d:e.d,dur:e.dur,x,i:gi,s:o.s||0,color:o.colors===false?undefined:e.color,letter:o.letters===false?'':e.letter,stem:o.stem,cls:e.cls||''};
    items.push(it);ni[i]=it;
    if(o.counts)items.push({type:'count',x,s:o.s||0,text:countLabel(e),sub:o.syl?(e.rest?'shh':SYL[e.dur]):'',i:gi,rest:e.rest});
    beat+=DUR[e.dur];if(beat>=per-1e-6){beat=0;m++;if(o.flow){barsAt.push(cur-lead+pad);cur+=pad}}
  });
  if(o.flow&&beat>0)barsAt.push(cur-lead+pad);
  const nb=o.flow?barsAt.length:Math.max(o.bars||0,m+(beat>0?1:0));
  for(let k=1;k<=nb;k++){const x=o.flow?barsAt[k-1]:startX+k*MW;if(o.repeatEnd&&k===nb)items.push({type:'repeat',x,end:true,cls:o.repeatCls});else items.push({type:'bar',x,final:!!o.final&&k===nb})}
  for(let i=0;i<evts.length;i++){
    const a=evts[i],b=evts[i+1];
    if(b&&a.dur==='e'&&b.dur==='e'&&!a.rest&&!b.rest&&a.m===b.m&&Number.isInteger(a.beat)&&b.beat===a.beat+.5){
      const up=o.stem?o.stem==='up':(a.d+b.d)/2<(o.mid||34);ni[i].stem=ni[i+1].stem=up?'up':'down';ni[i].beamed=ni[i+1].beamed=true;items.push({type:'beam',a:ni[i],b:ni[i+1]});
    }
    if(a.tieNext&&b)items.push({type:'tie',a:ni[i],b:ni[i+1],color:o.tieColor});
    if(a.stacc)items.push({type:'stacc',a:ni[i]});
  }
  return{items,end:o.flow?(barsAt[nb-1]||startX):startX+nb*MW,MW,ni};
}
function ev(tok){
  let m=/^r(w|hd|h|q|e)$/.exec(tok);if(m)return{rest:true,dur:m[1]};
  m=/^([A-G])(\d)(w|hd|h|q|e)(~?)(\.?)$/.exec(tok);if(!m)throw new Error('bad note '+tok);
  const L=m[1],d=(+m[2])*7+LETTERS.indexOf(L);
  return{d,dur:m[3],letter:L,color:COLOR[L],midi:dMidi(d),tieNext:!!m[4],stacc:!!m[5]};
}
const parse=str=>str.split(/\s+/).filter(t=>t&&t!=='|').map(ev);
const rhythm=(arr,d=32,midi=67)=>arr.map(t=>t[0]==='r'?{rest:true,dur:t.slice(1)}:{d,dur:t,midi,letter:''});
/* one-line rhythm card */
function rhythmCard(p,w=300){
  const BW=(w-70)/4,{items}=layout(rhythm(p,34),{startX:8,BW,pad:40,lead:28,stem:'up',letters:false,colors:false});
  return engrave({staves:[{oneLine:true,top:65}],width:w,height:172,x0:6,x1:w-6,items}).replace('class="staff"','class="staff rcard"');
}
/* tiny single-symbol picture */
const mini=(item,w=180)=>engrave({clef:null,width:w,height:250,x0:12,x1:w-12,items:[{...item,x:w/2}]});

/* ---------- piano ---------- */
function keysSVG(o){
  const KW=46,KH=190,BW=28,BH=118,n=o.to-o.from+1,W=n*KW+4,H=KH+30,marks=o.marks||{},fing=o.fingers||{};
  let w='',bl='';
  for(let i=0;i<n;i++){
    const d=o.from+i,m=dMidi(d),L=dLetter(d),x=2+i*KW,mk=marks[m],cx=x+KW/2-1;
    w+=`<g class="key white${o.shake===m?' shake':''}" data-midi="${m}"><rect x="${x}" y="2" width="${KW-2}" height="${KH}" rx="7" fill="${mk||'var(--key)'}"/>`;
    if(o.labels||mk)w+=`<circle cx="${cx}" cy="${KH-24}" r="15" fill="${mk?'var(--dark)':COLOR[L]}"/><text class="klabel" x="${cx}" y="${KH-18}" fill="${mk?'#fff':'var(--dark)'}">${L}</text>`;
    if(fing[m])w+=`<circle class="kf" cx="${cx}" cy="${KH-70}" r="15"/><text class="kft" x="${cx}" y="${KH-64}">${fing[m]}</text>`;
    if(m===60)w+=`<text class="mc" x="${cx}" y="${KH+22}">Middle C</text>`;
    w+='</g>';
    if(i<n-1&&[0,1,3,4,5].includes(((d%7)+7)%7)){
      const bm=m+1,bx=x+KW-BW/2-1,bmk=marks[bm];
      const bt=o.blackLabels&&o.blackLabels[bm];
      bl+=`<g class="key black${o.shake===bm?' shake':''}" data-midi="${bm}"><rect x="${bx}" y="2" width="${BW}" height="${BH}" rx="5" fill="${bmk||'var(--keyb)'}"/>${bt?`<text class="blabel" x="${bx+BW/2}" y="${BH-12}">${bt}</text>`:''}</g>`;
    }
  }
  return `<svg class="keys" viewBox="0 0 ${W} ${H}" role="img" aria-label="Piano keyboard">${w}${bl}</svg>`;
}
function bindKeys(el,cb,silent){el.addEventListener('pointerdown',e=>{const k=e.target.closest('[data-midi]');if(!k)return;e.preventDefault();const m=+k.dataset.midi;if(!silent)tone(m);cb&&cb(m,k)})}

/* ---------- playback ---------- */
function hl(el,i){$$('.now',el).forEach(x=>x.classList.remove('now'));if(i!=null)$$(`[data-i="${i}"]`,el).forEach(x=>x.classList.add('now'))}
async function playEvents(evts,o){
  const per=o.per||4,beatMs=60000/(o.bpm||90),starts=new Map();let acc=0;
  evts.forEach((e,i)=>{starts.set(Math.round(acc*2),i);acc+=DUR[e.dur]});
  const total=Math.round(acc*2);
  for(let s=0;s<total;s++){
    if(o.gone())return false;
    if(s%2===0){const bb=(s/2)%per;o.onBeat&&o.onBeat(bb,s/2);if(o.click)click(bb===0)}
    if(starts.has(s)){
      const i=starts.get(s),e=evts[i];o.onEvent&&o.onEvent(i,e);
      const tiedIn=!o.ignoreTies&&i>0&&evts[i-1].tieNext;
      if(!e.rest&&!tiedIn){
        let beats=DUR[e.dur];if(!o.ignoreTies){let j=i;while(evts[j].tieNext&&evts[j+1]){j++;beats+=DUR[evts[j].dur]}}
        let vol=o.volFn?o.volFn(i,e):(o.vol??.3);if(e.accent&&!o.noAccent)vol=Math.min(.6,vol*2);
        if(o.clap)clap(Math.min(.9,vol*1.6));
        else{let sec=beats*beatMs/1000;if(e.ferm&&!o.noFerm)sec+=2.2;sec=(o.stacc||e.stacc&&!o.noStacc)?.16:o.legato?sec*1.1+.15:o.detached?sec*.45:sec*.92+.15;tone(e.midi,sec,0,vol)}
      }
    }
    await wait((o.msFn?o.msFn(s):beatMs)/2);
    if(starts.has(s)&&evts[starts.get(s)].ferm&&!o.noFerm&&!evts[starts.get(s)].rest){
      // fermata: hold here before moving on (wait until the note's own length is done, then pause)
      const e=evts[starts.get(s)];await wait(beatMs*DUR[e.dur]-beatMs/2+2200);s+=Math.round(DUR[e.dur]*2)-1;
    }
  }
  o.onEnd&&o.onEnd();
  return true;
}
function beatDots(n=4){return `<div class="beats">${Array.from({length:n},(_,i)=>`<span class="${i===0?'one':''}">${i+1}</span>`).join('')}</div>`}
function setBeat(el,k){$$('.beats span',el).forEach((s,i)=>s.classList.toggle('on',i===k))}

/* ---------- text helpers ---------- */
function say(el,html){if(!el)return;el.innerHTML=`<span>${html}</span>`;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
function tag(L){return `<span class="tag" style="--nc:${COLOR[L]}">${L}</span>`}
function teacher(items){return `<details class="teach"><summary>Teacher notes</summary><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></details>`}
function chipGroup(name,opts,val){return `<span class="lbl">${name}</span>`+opts.map(([v,t])=>`<button class="chip" data-opt="${name}" data-v="${v}" aria-pressed="${v===val}">${t}</button>`).join('')}
function bindChips(el,name,cb){$$(`[data-opt="${name}"]`,el).forEach(b=>b.onclick=()=>{$$(`[data-opt="${name}"]`,el).forEach(x=>x.setAttribute('aria-pressed',x===b));cb(b.dataset.v)})}

/* ---------- rewards ---------- */
let jar=store.get('nf-stars',0);
function addStar(k=1){jar+=k;const j=$('#jar');if(j){j.textContent=jar;const b=$('#jarbox');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}store.set('nf-stars',jar)}
const cv=$('#confetti'),cx=cv.getContext('2d');let parts=[],raf=0;
const CCOLS=['#ff5e5b','#ff9f40','#ffd23f','#5ee36b','#3fd0e8','#6b95ff','#b783ff','#ff7ad9'];
function confetti(x=innerWidth/2,y=innerHeight*.45,n=160,power=15){
  if(reduced())return;
  if(cv.width!==innerWidth*devicePixelRatio){cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio;cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
  for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*power,vy:-Math.random()*power-3,s:5+Math.random()*8,c:CCOLS[rnd(CCOLS.length)],r:Math.random()*6,vr:(Math.random()-.5)*.3,life:0,star:Math.random()<.25});
  if(!raf)raf=requestAnimationFrame(tick);
}
function tick(){
  cx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.y<innerHeight+40&&p.life<200);
  parts.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life++;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;
    if(p.star){cx.beginPath();for(let k=0;k<10;k++){const rr=k%2?p.s*.45:p.s;cx.lineTo(Math.cos(k*Math.PI/5)*rr,Math.sin(k*Math.PI/5)*rr)}cx.fill()}else cx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);cx.restore()});
  raf=parts.length?requestAnimationFrame(tick):0;
}
function burst(el,n=30){if(!el)return;const r=el.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2,n,9)}
function party(title,msg,onAgain,againLabel='Play again'){
  const d=document.createElement('div');d.className='party';
  d.innerHTML=`<div class="box"><span class="trophy">${ICON.trophy}</span><h3>${title}</h3><p>${msg}</p><div class="stars">${[1,2,3,4,5].map(()=>starSVG('on')).join('')}</div><button class="btn primary" id="again">${againLabel}</button></div>`;
  document.body.appendChild(d);confetti();setTimeout(()=>confetti(innerWidth*.25,innerHeight*.5,80),250);setTimeout(()=>confetti(innerWidth*.75,innerHeight*.5,80),450);yay();
  $('#again',d).onclick=()=>{d.remove();onAgain&&onAgain()};$('#again',d).focus();
}
