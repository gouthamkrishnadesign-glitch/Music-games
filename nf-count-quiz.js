/* Note Friends — counting quizzes */
const startLab=b=>Number.isInteger(b)?String(b+1):`${Math.floor(b)+1} &`;
const withBeats=ev=>{let a=0;ev.forEach(e=>{e.beat=a;a+=DUR[e.dur]});return ev};
function lineSVG(ev,{counts=false,mark=-1,per=4}={}){
  const {items,ni}=layout(ev,{startX:20,BW:150,pad:40,lead:40,per,counts,syl:false,stem:'up',letters:false,colors:false,final:true});
  if(mark>=0&&ni[mark])ni[mark].color='var(--pink)';
  return engrave({staves:[{oneLine:true,top:60}],width:800,height:counts?210:180,x0:20,x1:780,items});
}
const countText=ev=>withBeats(ev).map(e=>e.rest?`(${countLabel(e)})`:countLabel(e)).join(' · ');

function genCB(cfg,src){
  const r=pickNot(RHY.filter(x=>x.p.filter(t=>t[0]!=='r').length>=2),src._last);src._last=r;
  const ev=withBeats(rhythm(r.p,34,67)),cand=ev.map((e,i)=>i).filter(i=>!ev[i].rest),i=cand[rnd(cand.length)],ans=startLab(ev[i].beat);
  const hasAnd=ev.some(e=>!Number.isInteger(e.beat));
  const opts=hasAnd?shuffle([ans,...shuffle(['1','1 &','2','2 &','3','3 &','4','4 &'].filter(x=>x!==ans)).slice(0,3)]):['1','2','3','4'];
  return{visual:`<div class="svgwrap">${lineSVG(ev,{mark:i})}</div>`,prompt:'On which count does the <span style="color:var(--pink)">pink</span> note start?',
    options:opts.map(o=>({html:o,correct:o===ans})),wrong:()=>'Count from the start of the box: 1, 2, 3, 4…',
    reveal:()=>({visual:`<div class="svgwrap">${lineSVG(ev,{mark:i,counts:true})}</div>${beatMap(ev)}`,say:`Yes! It starts on <span class="hl">${ans}</span>.`})};
}
function genFull(cfg,src){
  const target=pickNot([3,4,4,5,4],src._last);src._last=target;const pieces=[['q',1],['h',2],['hd',3],['w',4],['ee',1]],toks=[],lens=[];let left=target;
  while(left>0){const fit=pieces.filter(p=>p[1]<=left&&!(p[0]==='w'&&target!==4));const [k,l]=fit[rnd(fit.length)];if(k==='ee')toks.push('e','e');else toks.push(k);lens.push(l);left-=l}
  const ev=rhythm(toks,34,67),verdict=target<4?'few':target>4?'many':'right';
  const {items}=layout(ev,{startX:20,BW:110,pad:40,lead:40,per:8,stem:'up',letters:false,colors:false});
  return{visual:`<div class="svgwrap">${engrave({staves:[{oneLine:true,top:60}],width:Math.max(560,40+target*110+60),height:180,x0:20,items:items.filter(x=>x.type!=='bar')})}</div>`,prompt:'A box in 4/4 needs exactly <span class="hl">4 beats</span>. Is this box…',
    options:[{html:'Too few',correct:verdict==='few'},{html:'Just right',correct:verdict==='right'},{html:'Too many',correct:verdict==='many'}],wrong:()=>'Add up the beats of each note!',
    reveal:()=>({visual:beatMap(ev),say:`${lens.join(' + ')} = <span class="hl">${target}</span> beat${target>1?'s':''}. ${verdict==='right'?'Just right!':verdict==='few'?'Too few: it needs '+(4-target)+' more.':'Too many: that is '+(target-4)+' extra!'}`})};
}
function genRC(cfg,src){
  const r=pickNot(RHY,src._last);src._last=r;const ev=rhythm(r.p,34,67),ans=countText(ev);
  const others=shuffle(RHY.filter(x=>countText(rhythm(x.p))!==ans)).map(x=>countText(rhythm(x.p)));
  const same=others.filter(t=>t.split(' · ').length===ans.split(' · ').length),wrong=[...new Set([...same,...others])].slice(0,2);
  return{visual:`<div class="svgwrap">${lineSVG(ev)}</div>`,prompt:'Which counting matches this rhythm?',
    options:shuffle([ans,...wrong]).map(t=>({html:t,correct:t===ans,style:'font-size:22px;height:auto;padding:12px 18px'})),wrong:()=>'Look at how long each note is, then count again.',
    reveal:()=>({visual:`<div class="svgwrap">${lineSVG(ev,{counts:true})}</div>`,say:`Yes! <span class="hl">${ans}</span>`})};
}
function genTap(cfg,src){
  const r=pickNot(RHY.filter(x=>!x.p.includes('w')),src._last);src._last=r;const ev=rhythm(r.p,34,67);
  return{visual:`<div class="svgwrap">${lineSVG(ev,{counts:true})}</div>`,prompt:`<span class="hl">${r.n}</span>: press Start, then tap when each note starts!`,noFlash:true,
    custom(aEl,api){let taps=[],live=false;
      aEl.innerHTML=`<div class="row" style="justify-content:center;gap:24px"><button class="btn primary" id="qs">${ICON.play} Start</button><button class="tapbig" id="qt">Tap!</button></div><div class="tapres" id="qr"></div>`;
      const tap=()=>{if(!live)return;taps.push(performance.now());burst($('#qt',aEl),6)};$('#qt',aEl).onpointerdown=e=>{e.preventDefault();tap()};spaceTap=tap;
      $('#qs',aEl).onclick=()=>run(async g=>{taps=[];let t0=0,half=0;
        const ok=await timeline(ev,{bpm:72,gone:g,sound:cfg.help==='off'?'none':'tone',onStart:(a,h)=>{t0=a;half=h;live=true},onCountIn:(k,w)=>{$('#qr',aEl).textContent=w}});live=false;if(!ok)return;
        let acc=0;const exp=[];ev.forEach(x=>{if(!x.rest)exp.push(t0+acc*2*half);acc+=DUR[x.dur]});const res=judgeTaps(exp,taps),hit=res.filter(v=>v!=='m').length,extra=Math.max(0,taps.length-hit);
        $('#qr',aEl).textContent=`${res.filter(v=>v==='p').length} perfect · ${res.filter(v=>v==='g').length} close · ${res.filter(v=>v==='m').length} missed${extra?` · ${extra} extra`:''}`;
        if(hit===exp.length&&!extra&&res.filter(v=>v==='p').length>=exp.length/2)api.right(null,'Right on the beat!');else api.wrong(null,'Almost! Count along and press Start to try again.')})}};
}
QUIZ.splice(QUIZ.length-1,0,
  {id:'cb',name:'Which Count?',lead:'Find the count where the pink note starts.',c:'var(--d)',ic:'1&',flash:true,gen:genCB},
  {id:'full',name:'Is the Box Full?',lead:'Add up the beats. Too few, just right, or too many?',c:'var(--g)',ic:'=4',flash:true,gen:genFull},
  {id:'rc',name:'Right Counting?',lead:'Pick the counting that matches the rhythm.',c:'var(--e)',ic:'123',flash:true,gen:genRC},
  {id:'tap',name:'Tap the Rhythm',lead:'Tap along in time. Get every note right on the beat!',c:'var(--pink)',ic:'tap',opts:[{k:'help',l:'Helper sound',c:[['on','On'],['off','Off']],d:'on'}],gen:genTap});
['cb','full','rc','tap'].forEach(id=>QBY[id]=QUIZ.find(q=>q.id===id));
