/* Note Friends — topic list, right rail, navigation */
const UNITS=[
  {id:'notes',name:'Meet the Notes',c:'var(--c)'},
  {id:'staff',name:'The Staff',c:'var(--e)'},
  {id:'rhythm',name:'Rhythm',c:'var(--g)'},
  {id:'signs',name:'Music Signs',c:'var(--pink)'},
  {id:'make',name:'Make Music',c:'var(--b)'},
];
const TOPICS=[
  ['notes','friends','Note Friends','Music uses only 7 letters. Tap a friend to hear its voice.'],
  ['notes','piano','Twins & Triplets','The black keys come in little groups. They help us find every white key.'],
  ['notes','highlow','High & Low','Sounds can be high like a bird or low like a bear.'],
  ['notes','fingers','Finger Numbers','Every finger has a number. Thumbs are always 1.'],
  ['notes','posture','Sitting & Hand Shape','Sit tall, feet flat, bubble hands. Ready to play!'],
  ['notes','octave','Octaves','Same letter, 8 white keys away: a family of high and low voices.'],
  ['notes','sharps','Sharps & Flats','Sharp goes up, flat goes down. Meet the black keys\' names!'],
  ['notes','halfwhole','Half Steps & Whole Steps','Next-door neighbours, or one key in between?'],
  ['staff','staff','The Staff House','Five lines and four spaces. We count from the bottom up.'],
  ['staff','linespace','Line Notes & Space Notes','How whole, half and quarter notes look on a line and in a space.'],
  ['staff','steps','Steps & Skips','Notes can step to the next friend, or skip over one.'],
  ['staff','treble','Treble Clef','The house for high notes. Usually the right hand.'],
  ['staff','bass','Bass Clef','The house for low notes. Usually the left hand.'],
  ['staff','ledger','Ledger Lines','Little helper lines for notes outside the house.'],
  ['staff','landmarks','Landmark Notes','Notes we know by heart, to help find all the others.'],
  ['staff','accid','Sharps & Flats on the Staff','Where the sign sits, and how long it lasts.'],
  ['staff','grand','Grand Staff','Both houses together, with Middle C in between.'],
  ['rhythm','beat','The Steady Beat','Music has a heartbeat. Can you tap along?'],
  ['rhythm','values','Note Lengths','The shape of a note tells us how long to hold it.'],
  ['rhythm','rests','Rests: Quiet Time','Rests are beats where we stay silent.'],
  ['rhythm','measures','Bar Lines & Time Signatures','Bar lines cut music into boxes. The top number says how many beats fit in each box.'],
  ['rhythm','eighths','Eighth Notes','Quarter notes walk, eighth notes run!'],
  ['rhythm','dotted','The Magic Dot','A dot beside a note makes it longer.'],
  ['rhythm','fruit','Fruit Rhythms','Pear, ap-ple, peeeach: words that make rhythms.'],
  ['rhythm','rbuild','Rhythm Builder','Snap rhythm blocks together to fill each box.'],
  ['rhythm','count','Count & Clap','Read the rhythm, count out loud, and clap.'],
  ['signs','tie','The Tie','A tie joins two notes that are the same. Play once, hold for both.'],
  ['signs','slur','The Slur','A slur joins different notes. Play them smooth and connected.'],
  ['signs','stacc','Staccato','A little dot means play short and bouncy, like popcorn.'],
  ['signs','dyn','Loud & Soft','Dynamics tell us how loud or soft to play.'],
  ['signs','cresc','Getting Louder & Softer','Hairpins tell us to grow louder or fade softer.'],
  ['signs','tempo','Fast & Slow','Tempo is how fast the beat goes.'],
  ['signs','accent','The Accent','A little arrow means: play this one stronger!'],
  ['signs','fermata','The Fermata','The bird\'s eye: hold the note and wait.'],
  ['signs','rit','Slowing Down & Speeding Up','rit. and accel.: the music changes speed bit by bit.'],
  ['signs','repeat','The Repeat Sign','Two dots mean: go back and play it again!'],
  ['make','mix','Notes + Rhythm = Music','Which note to play, plus how long to hold it, makes a tune.'],
  ['make','songs','Play a Song','Real songs! Watch the notes, count the beats, and play along.'],
  ['make','echo','Echo Me','Listen to a little tune and play it back. How long can you go?'],
  ['make','compose','Write Your Own Song','Pick a note shape, tap the staff, and build your own tune.'],
].map(([u,id,title,lead],i)=>({u,id,title,lead,n:i+1}));
const TBY=Object.fromEntries(TOPICS.map(t=>[t.id,t]));
let route=store.get('nf-route','t:friends'),done=new Set(store.get('nf-done',[]));
if(!/^[tq]:/.test(route)||(route[0]==='t'&&!TBY[route.slice(2)])||(route[0]==='q'&&!QBY[route.slice(2)]))route='t:friends';

/* shared page frame for every topic */
function page(root,{body,notes,quiz}){
  const t=TBY[route.slice(2)],u=UNITS.find(x=>x.id===t.u),isDone=done.has(t.id),prev=TOPICS[t.n-2],next=TOPICS[t.n];
  root.innerHTML=`<div class="head"><div class="eyebrow"><span class="unitchip" style="--uc:${u.c}">${u.name}</span><span>Topic ${t.n} of ${TOPICS.length}</span></div><h2>${t.title}</h2><p class="lead">${t.lead}</p></div>
  ${body}
  ${notes?teacher(notes):''}
  <div class="pager">${prev?`<button class="btn" id="pgprev">← ${prev.title}</button>`:'<span></span>'}
  <div class="row">${quiz?`<button class="btn" id="pgquiz">Quiz: ${QBY[quiz].name}</button>`:''}<button class="btn learned${isDone?' done':''}" id="pglearn">${isDone?'Learned!':`${starSVG()} We learned it!`}</button></div>
  ${next?`<button class="btn primary" id="pgnext">${next.title} →</button>`:'<span></span>'}</div>`;
  const ls=$('#pglearn svg',root);if(ls)ls.style.fill='var(--dark)';
  if(prev)$('#pgprev',root).onclick=()=>go('t:'+prev.id);
  if(next)$('#pgnext',root).onclick=()=>go('t:'+next.id);
  if(quiz)$('#pgquiz',root).onclick=()=>go('q:'+quiz);
  $('#pglearn',root).onclick=e=>{if(done.has(t.id))return;done.add(t.id);store.set('nf-done',[...done]);addStar();burst(e.currentTarget,50);yay();e.currentTarget.classList.add('done');e.currentTarget.textContent='Learned!';renderSide();
    if(done.size===TOPICS.length)setTimeout(()=>party('Music star!','You learned every topic. Amazing!'),600)};
}

/* right rail */
function renderSide(){
  const tot=Object.values(trophies).reduce((a,b)=>a+b,0);
  $('#trophies').textContent=tot?`${tot} troph${tot===1?'y':'ies'}`:'Win trophies!';
  $('#qlist').innerHTML=QUIZ.map(q=>`<button class="qtile${q.wide?' wide':''}" data-q="${q.id}" style="--qc:${q.c}"${route==='q:'+q.id?' aria-current="page"':''}><span class="qi">${q.wide?QI('★').replace('var(--dark)','var(--star)'):QI(q.ic)}</span><span class="tn">${q.name}${trophies[q.id]?`<span class="tr">Trophies: ${trophies[q.id]}</span>`:''}</span></button>`).join('');
  $('#progtxt').textContent=`${done.size} of ${TOPICS.length} learned`;
  $('#progbar').style.width=(done.size/TOPICS.length*100)+'%';
  $('#tlist').innerHTML=UNITS.map(u=>`<div class="unit" style="--uc:${u.c}"><div class="unit-h"><i></i>${u.name}</div>${TOPICS.filter(t=>t.u===u.id).map(t=>`<button class="tbtn${done.has(t.id)?' done':''}" data-t="${t.id}"${route==='t:'+t.id?' aria-current="page"':''}><span class="n">${t.n}</span><span>${t.title}</span>${done.has(t.id)?ICON.check:''}</button>`).join('')}</div>`).join('');
  $$('[data-q]').forEach(b=>b.onclick=()=>go('q:'+b.dataset.q));
  $$('[data-t]').forEach(b=>b.onclick=()=>go('t:'+b.dataset.t));
}
function go(r){
  cancelRuns();spaceTap=null;route=r;store.set('nf-route',r);document.body.classList.remove('side-open');
  const stage=$('#stage');stage.innerHTML='';
  if(r[0]==='q')openQuiz(stage,QBY[r.slice(2)]);else MOUNT[r.slice(2)](stage);
  renderSide();window.scrollTo({top:0});
  const cur=$('.side [aria-current]');cur&&cur.scrollIntoView({block:'nearest'});
}

/* header tools */
$('#jar').textContent=jar;
$('#snd').onclick=e=>{soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',soundOn);e.currentTarget.textContent=soundOn?'Sound on':'Sound off';if(soundOn)audio()};
$('#fs').onclick=()=>{try{const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();p&&p.catch&&p.catch(()=>{})}catch(e){}};
const narrow=()=>matchMedia('(max-width:1000px)').matches;
const sideLabel=()=>{$('#sidebtn').textContent=narrow()?'Topics & quizzes':document.body.classList.contains('hide-side')?'Show list':'Hide list'};
$('#sidebtn').onclick=()=>{if(narrow())document.body.classList.toggle('side-open');else{document.body.classList.toggle('hide-side');store.set('nf-hide',document.body.classList.contains('hide-side'))}sideLabel()};
$('#scrim').onclick=()=>document.body.classList.remove('side-open');
if(store.get('nf-hide',false))document.body.classList.add('hide-side');
addEventListener('resize',sideLabel);sideLabel();
document.addEventListener('pointerdown',()=>audio(),{once:true});
document.addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea'))return;
  if(e.code==='Space'&&spaceTap){e.preventDefault();spaceTap();return}
  if(e.key==='Escape')document.body.classList.remove('side-open');
});
go(route);
