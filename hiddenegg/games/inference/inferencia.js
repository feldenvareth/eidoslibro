
(()=>{'use strict';

const LANG=(document.documentElement.lang||'en').toLowerCase().startsWith('es')?'es':'en';
const isES=LANG==='es';
const TEXT={
  es:{
    gameTitle:'INFERENCIA',subtitle:'RECONSTRUYE LO OCULTO A PARTIR DE SUS RASTROS',
    startSubtitle:'CONTEO · BLOQUES · SECUENCIAS · DEDUCCIÓN',
    intro:'Las cifras de cada fila y columna describen la estructura que debes reconstruir. La propia regla se vuelve más exigente a medida que avanzas.',
    campaignRule:'LA REGLA EVOLUCIONA',
    campaignRuleText:'1–10: importa cuántas casillas hay. 11–20: deben formar un bloque continuo. Desde el 21 aparecen varias secuencias en orden.',
    start:'INICIAR',continue:'CONTINUAR PARTIDA',levels:'NIVELES',copyLink:'COPIAR ENLACE',discoverEidos:'CONOCE EIDOS',
    startNote:'50 niveles de campaña · después, Inferencia infinita.',
    fill:'RELLENAR',mark:'MARCAR X',undo:'DESHACER',
    levelsSubtitle:'CAMPAÑA DE INFERENCIA',back:'VOLVER',deleteCampaign:'ELIMINAR CAMPAÑA',
    deleteSubtitle:'ESTA ACCIÓN NO SE PUEDE DESHACER',
    deleteText:'Vas a empezar desde cero. Se eliminarán los niveles completados, los desbloqueados, los mejores tiempos y la partida actual guardados en este navegador.',
    deleteWarning:'Todo el progreso de la campaña desaparecerá y volverás al nivel 1.',
    deleteConfirm:'ELIMINAR Y EMPEZAR DE CERO',cancel:'CANCELAR',
    endless:'INFERENCIA INFINITA',endlessText:'Puzzles nuevos de dificultad progresiva. El tamaño aumenta hasta 15×15.',play:'JUGAR',
    solved:'PATRÓN RECONSTRUIDO',next:'SIGUIENTE NIVEL',
    count:'CONTEO',block:'BLOQUE',sequence:'SECUENCIA',cross:'CRUCE',deduction:'DEDUCCIÓN',
    modeCount:'Cuenta total de casillas',modeBlock:'Un único bloque consecutivo',modeSequence:'Secuencias en orden',modeCross:'Cruce avanzado',modeDeduction:'Deducción completa',
    copied:'ENLACE COPIADO',copyPrompt:'Copia este enlace:',
    level:'Nivel',infinite:'∞',completed:'Completados',unlocked:'Desbloqueados',
    hintCount:'En esta fase las cifras indican cuántas casillas debe haber en total.',
    hintClassic:'Las cifras indican bloques consecutivos, separados por al menos una casilla vacía.'
  },
  en:{
    gameTitle:'INFERENCE',subtitle:'RECONSTRUCT THE HIDDEN FROM ITS TRACES',
    startSubtitle:'COUNT · BLOCKS · SEQUENCES · DEDUCTION',
    intro:'The numbers on each row and column describe the structure you must reconstruct. The rule itself becomes more demanding as you advance.',
    campaignRule:'THE RULE EVOLVES',
    campaignRuleText:'1–10: only the number of filled cells matters. 11–20: they must form one continuous block. From 21 onward, several ordered sequences appear.',
    start:'START',continue:'CONTINUE GAME',levels:'LEVELS',copyLink:'COPY LINK',discoverEidos:'DISCOVER EIDOS',
    startNote:'50 campaign levels · then, endless inference.',
    fill:'FILL',mark:'MARK X',undo:'UNDO',
    levelsSubtitle:'INFERENCE CAMPAIGN',back:'BACK',deleteCampaign:'DELETE CAMPAIGN',
    deleteSubtitle:'THIS ACTION CANNOT BE UNDONE',
    deleteText:'You are about to start from zero. Completed levels, unlocked levels, best times and the current saved game in this browser will be deleted.',
    deleteWarning:'All campaign progress will disappear and you will return to level 1.',
    deleteConfirm:'DELETE AND START FROM ZERO',cancel:'CANCEL',
    endless:'ENDLESS INFERENCE',endlessText:'New puzzles with progressive difficulty. Size increases up to 15×15.',play:'PLAY',
    solved:'PATTERN RECONSTRUCTED',next:'NEXT LEVEL',
    count:'COUNT',block:'BLOCK',sequence:'SEQUENCE',cross:'CROSS-CHECK',deduction:'DEDUCTION',
    modeCount:'Total number of filled cells',modeBlock:'One continuous block',modeSequence:'Ordered sequences',modeCross:'Advanced cross-check',modeDeduction:'Full deduction',
    copied:'LINK COPIED',copyPrompt:'Copy this link:',
    level:'Level',infinite:'∞',completed:'Completed',unlocked:'Unlocked',
    hintCount:'In this phase each clue tells you how many cells must be filled in total.',
    hintClassic:'The clues describe consecutive blocks, separated by at least one empty cell.'
  }
};
const T=TEXT[LANG];

document.querySelectorAll('[data-t]').forEach(el=>{const k=el.dataset.t;if(T[k])el.textContent=T[k]});

const SAVE='eidos-inference-save-v1';
const PROG='eidos-inference-progress-v1';
const CAMPAIGN=50;
const STAGES=[
  {id:'count',from:1,to:10,name:()=>T.count},
  {id:'block',from:11,to:20,name:()=>T.block},
  {id:'sequence',from:21,to:30,name:()=>T.sequence},
  {id:'cross',from:31,to:40,name:()=>T.cross},
  {id:'deduction',from:41,to:50,name:()=>T.deduction}
];

const $=id=>document.getElementById(id);
const arcade=window.EidosArcadeBridge?.create({gameId:'inferencia',language:LANG,scoreLabel:LANG==='es'?'EFICIENCIA':'EFFICIENCY'});
const read=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const remove=k=>{try{localStorage.removeItem(k)}catch(e){}};

let progress=read(PROG,{unlocked:1,completed:{},best:{},endless:0});
let state=null,history=[],mode='fill',timer=null,paused=false,screenReturn='start';

function rng(seed){
  let s=seed>>>0;
  return ()=>((s=Math.imul(1664525,s)+1013904223>>>0)/4294967296);
}
function seedFor(level,index=0){return (level*2654435761+index*2246822519)>>>0}
function stageForLevel(level){
  if(level>50)return {id:'deduction',name:()=>T.deduction};
  return STAGES.find(s=>level>=s.from&&level<=s.to)||STAGES[0];
}
function sizeFor(level){
  if(level<=10)return 5;
  if(level<=20)return level<=15?5:6;
  if(level<=30)return level<=25?7:8;
  if(level<=40)return level<=35?9:10;
  if(level<=50)return level<=45?10:12;
  return Math.min(15,10+Math.floor((level-51)/8));
}
function emptyGrid(n){return Array.from({length:n},()=>Array(n).fill(0))}
function randomGrid(n,seed,density=.45){
  const r=rng(seed),g=emptyGrid(n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)g[y][x]=r()<density?1:0;
  return g;
}
function blobGrid(n,seed){
  const r=rng(seed),g=emptyGrid(n);
  const cx=(n-1)/2+(r()-.5)*.8,cy=(n-1)/2+(r()-.5)*.8;
  const rx=n*(.29+r()*.12),ry=n*(.29+r()*.12);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const dx=(x-cx)/rx,dy=(y-cy)/ry;
    g[y][x]=(dx*dx+dy*dy<1)?1:0;
  }
  // clip one edge occasionally while preserving row/column convexity
  if(r()<.5){
    const cut=Math.floor(n*(.18+r()*.18));
    for(let y=0;y<cut;y++)for(let x=0;x<n;x++)if(x<cut-y)g[y][x]=0;
  }
  return g;
}
function smoothGrid(n,seed,density){
  let g=randomGrid(n,seed,density),r=rng(seed^0x9e3779b9);
  for(let pass=0;pass<2;pass++){
    const ng=g.map(row=>row.slice());
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      let near=0,total=0;
      for(let yy=Math.max(0,y-1);yy<=Math.min(n-1,y+1);yy++)
        for(let xx=Math.max(0,x-1);xx<=Math.min(n-1,x+1);xx++)
          if(xx!==x||yy!==y){total++;near+=g[yy][xx]}
      if(near>=5)ng[y][x]=1;
      else if(near<=2)ng[y][x]=0;
      else if(r()<.08)ng[y][x]=1-ng[y][x];
    }
    g=ng;
  }
  return g;
}
function runs(line){
  const out=[];let c=0;
  for(const v of line){
    if(v){c++}
    else if(c){out.push(c);c=0}
  }
  if(c)out.push(c);
  return out.length?out:[0];
}
function cluesFor(g,rule){
  const n=g.length;
  const rows=[],cols=[];
  for(let y=0;y<n;y++)rows.push(rule==='count'?[g[y].reduce((a,b)=>a+b,0)]:runs(g[y]));
  for(let x=0;x<n;x++){
    const col=g.map(row=>row[x]);
    cols.push(rule==='count'?[col.reduce((a,b)=>a+b,0)]:runs(col));
  }
  return {rows,cols};
}
function buildPuzzle(level){
  const n=sizeFor(level),stage=stageForLevel(level),seed=seedFor(level);
  let solution;
  if(stage.id==='count')solution=randomGrid(n,seed,.36+((level-1)%5)*.04);
  else if(stage.id==='block')solution=blobGrid(n,seed);
  else if(stage.id==='sequence')solution=smoothGrid(n,seed,.42);
  else if(stage.id==='cross')solution=smoothGrid(n,seed,.46);
  else solution=smoothGrid(n,seed,.49);
  // avoid trivial all-empty/full lines in early count levels where possible
  const clue=cluesFor(solution,stage.id==='count'?'count':'classic');
  return {level,n,stage:stage.id,solution,rows:clue.rows,cols:clue.cols};
}
function newState(level){
  const p=buildPuzzle(level);
  return {...p,cells:Array.from({length:p.n},()=>Array(p.n).fill(0)),startedAt:Date.now(),elapsed:0,moves:0};
}
function save(){
  if(!state)return;
  const now=paused?state.elapsed:state.elapsed+(Date.now()-state.startedAt);
  write(SAVE,{...state,elapsed:now,startedAt:Date.now()});
  updateStartUI();
}
function loadSaved(){
  const s=read(SAVE,null);
  if(!s||!Array.isArray(s.cells))return false;
  state=s;state.startedAt=Date.now();history=[];paused=false;
  closeAll();renderGame();startTimer();return true;
}
function elapsed(){
  if(!state)return 0;
  return state.elapsed+(paused?0:(Date.now()-state.startedAt));
}
function fmt(ms){
  const sec=Math.max(0,Math.floor(ms/1000)),m=Math.floor(sec/60),s=sec%60;
  return m+':'+String(s).padStart(2,'0');
}
function startTimer(){
  clearInterval(timer);
  timer=setInterval(()=>{if(state&&!paused)$('time-hud').textContent=fmt(elapsed())},500);
}
function closeAll(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('open'))}
function open(id){$(id).classList.add('open')}
function hasProgress(){return Boolean(read(SAVE,null)||progress.unlocked>1||Object.keys(progress.completed).length||progress.endless>0)}
function updateStartUI(){
  $('start-button').textContent=hasProgress()?T.continue:T.start;
  $('delete-campaign-button').hidden=!hasProgress();
}
function continueCampaign(){
  if(loadSaved())return;
  if(progress.unlocked>50){startLevel(51+Math.max(0,progress.endless-1));return}
  startLevel(Math.max(1,progress.unlocked));
}
function startLevel(level){arcade?.start();
  state=newState(level);history=[];paused=false;
  closeAll();renderGame();save();startTimer();changeBackground();
}
function lineValues(index,isRow){
  if(isRow)return state.cells[index].map(v=>v===1?1:0);
  return state.cells.map(row=>row[index]===1?1:0);
}
function clueSatisfied(index,isRow){
  const target=isRow?state.rows[index]:state.cols[index];
  const vals=lineValues(index,isRow);
  if(state.stage==='count')return vals.reduce((a,b)=>a+b,0)===target[0];
  const rr=runs(vals);
  return rr.length===target.length&&rr.every((v,i)=>v===target[i]);
}
function progressRatio(){
  if(!state)return 0;
  let ok=0;
  for(let i=0;i<state.n;i++){if(clueSatisfied(i,true))ok++;if(clueSatisfied(i,false))ok++}
  return ok/(state.n*2);
}
function checkWin(){
  for(let i=0;i<state.n;i++)if(!clueSatisfied(i,true)||!clueSatisfied(i,false))return false;
  return true;
}
function setCell(y,x,value){
  if(!state)return;
  history.push(state.cells.map(r=>r.slice()));
  state.cells[y][x]=value;
  state.moves++;
  renderCells();save();
  if(checkWin())finishLevel();
}
function toggleCell(y,x){
  const cur=state.cells[y][x];
  setCell(y,x,mode==='fill'?(cur===1?0:1):(cur===2?0:2));
}
function undo(){
  const prev=history.pop();if(!prev)return;
  state.cells=prev;state.moves++;renderCells();save();
}
function renderClue(target){
  return target.map(v=>`<span>${v}</span>`).join('<span class="sep">·</span>');
}
function renderGame(){
  if(!state)return;
  document.documentElement.style.setProperty('--n',state.n);
  $('puzzle-wrap').style.setProperty('--n',state.n);
  const st=stageForLevel(state.level);
  $('level-hud').textContent=state.level<=50?`${T.level} ${state.level}/50`:`${T.infinite}${state.level-50}`;
  $('mode-hud').textContent=st.name();
  $('time-hud').textContent=fmt(elapsed());
  $('game-message').textContent=state.stage==='count'?T.hintCount:T.hintClassic;

  $('col-clues').innerHTML=state.cols.map((c,i)=>`<div class="clue col-clue" data-col="${i}">${renderClue(c)}</div>`).join('');
  $('row-clues').innerHTML=state.rows.map((c,i)=>`<div class="clue row-clue" data-row="${i}">${renderClue(c)}</div>`).join('');
  $('grid').innerHTML='';
  for(let y=0;y<state.n;y++)for(let x=0;x<state.n;x++){
    const b=document.createElement('button');b.className='cell';b.dataset.y=y;b.dataset.x=x;
    b.addEventListener('click',()=>toggleCell(y,x));
    b.addEventListener('contextmenu',e=>{e.preventDefault();const old=mode;mode='mark';toggleCell(y,x);mode=old});
    $('grid').appendChild(b);
  }
  renderCells();
}
function renderCells(){
  if(!state)return;
  document.querySelectorAll('.cell').forEach(el=>{
    const y=+el.dataset.y,x=+el.dataset.x,v=state.cells[y][x];
    el.classList.toggle('fill',v===1);el.classList.toggle('mark',v===2);
  });
  document.querySelectorAll('[data-row]').forEach(el=>el.classList.toggle('solved',clueSatisfied(+el.dataset.row,true)));
  document.querySelectorAll('[data-col]').forEach(el=>el.classList.toggle('solved',clueSatisfied(+el.dataset.col,false)));
  $('bg').style.setProperty('--bg-opacity',(.18+progressRatio()*.50).toFixed(3));
}
function finishLevel(){arcade?.capture(state.level,Math.max(1,999-Math.min(998,state.moves*2+Math.floor(elapsed()/10000))));
  paused=true;state.elapsed=elapsed();
  clearInterval(timer);remove(SAVE);
  const ms=state.elapsed,key=String(state.level);
  if(!progress.best[key]||ms<progress.best[key])progress.best[key]=ms;
  if(state.level<=50){
    progress.completed[key]=true;
    progress.unlocked=Math.max(progress.unlocked,Math.min(51,state.level+1));
  }else{
    progress.endless=Math.max(progress.endless,state.level-50);
  }
  write(PROG,progress);updateStartUI();
  $('win-title').textContent=state.level<=50?`${T.level} ${state.level}`:`${T.endless} ${state.level-50}`;
  $('win-stats').textContent=`${fmt(ms)} · ${state.moves} moves`;
  $('next-button').hidden=state.level===50;
  open('win-screen');
}
function nextLevel(){
  closeAll();
  if(state.level===50){showLevels('start');return}
  startLevel(state.level+1);
}
function showLevels(from='start'){
  screenReturn=from;
  if(state&&!paused&&from==='game'){state.elapsed=elapsed();state.startedAt=Date.now();paused=true;save()}
  renderLevelMap();closeAll();open('levels-screen');
}
function backLevels(){
  closeAll();
  if(screenReturn==='game'&&state){paused=false;state.startedAt=Date.now();renderGame();startTimer()}
  else open('start-screen');
}
function renderLevelMap(){
  const map=$('level-map');map.innerHTML='';
  $('levels-summary').textContent=`${T.completed}: ${Object.keys(progress.completed).length}/50 · ${T.unlocked}: ${Math.min(progress.unlocked,50)}/50`;
  STAGES.forEach(s=>{
    const box=document.createElement('section');box.className='stage';
    const done=Array.from({length:10},(_,i)=>s.from+i).filter(l=>progress.completed[String(l)]).length;
    box.innerHTML=`<div class="stage-head"><strong>${s.name()}</strong><span>${done}/10</span></div><div class="nodes"></div>`;
    const nodes=box.querySelector('.nodes');
    for(let l=s.from;l<=s.to;l++){
      const b=document.createElement('button');b.className='node';b.textContent=l;
      const unlocked=l<=progress.unlocked||progress.completed[String(l)];
      if(progress.completed[String(l)])b.classList.add('done'); else if(unlocked)b.classList.add('unlocked');
      if(state&&state.level===l)b.classList.add('current');
      b.disabled=!unlocked;
      b.onclick=()=>startLevel(l);
      nodes.appendChild(b);
    }
    map.appendChild(box);
  });
  const endlessUnlocked=progress.unlocked>50;
  $('endless-panel').hidden=!endlessUnlocked;
  if(endlessUnlocked)$('endless-input').value=Math.max(1,progress.endless||1);
  $('delete-campaign-button').hidden=!hasProgress();
}
function playEndless(){
  const i=Math.max(1,parseInt($('endless-input').value||'1',10));
  startLevel(50+i);
}
function openDelete(){closeAll();open('delete-screen')}
function confirmDelete(){
  clearInterval(timer);remove(SAVE);progress={unlocked:1,completed:{},best:{},endless:0};write(PROG,progress);
  state=null;history=[];paused=false;updateStartUI();closeAll();open('start-screen');
}
async function copyLink(){
  const url=document.querySelector('link[rel=canonical]')?.href||location.href;
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(url);
      const b=$('copy-link-button'),old=b.textContent;b.textContent=T.copied;setTimeout(()=>b.textContent=old,1400);return;
    }
  }catch(e){}
  window.prompt(T.copyPrompt,url);
}

// Gallery backgrounds
const CONTENT=window.EIDOS_SHARED_CONTENT||{images:[]};
function galleryUrl(item){
  const raw=typeof item==='string'?item:String(item?.url||'').trim();
  if(!raw)return'';if(/^(?:https?:)?\/\//i.test(raw)||raw.startsWith('/'))return raw;
  return '/gallery/'+raw.replace(/^\.?\//,'');
}
const MANIFEST=Array.isArray(window.EIDOS_IMAGE_MANIFEST)?window.EIDOS_IMAGE_MANIFEST.map(galleryUrl).filter(Boolean):[];
const IMAGES=MANIFEST.length?MANIFEST:(Array.isArray(CONTENT.images)?CONTENT.images.filter(Boolean):[]);
let bgIndex=-1,bgLayer=0;
function changeBackground(){
  if(!IMAGES.length)return;
  bgIndex=(bgIndex+1)%IMAGES.length;const target=bgLayer?$('bg-a'):$('bg-b'),other=bgLayer?$('bg-b'):$('bg-a');
  target.onload=()=>{other.classList.remove('active');target.classList.add('active');bgLayer=1-bgLayer};
  target.onerror=()=>{bgIndex=(bgIndex+1)%IMAGES.length;target.src=IMAGES[bgIndex]};
  target.src=IMAGES[bgIndex];
}

$('fill-mode').onclick=()=>{mode='fill';$('fill-mode').classList.add('active');$('mark-mode').classList.remove('active')};
$('mark-mode').onclick=()=>{mode='mark';$('mark-mode').classList.add('active');$('fill-mode').classList.remove('active')};
$('undo-btn').onclick=undo;
$('start-button').onclick=continueCampaign;
$('start-levels-button').onclick=()=>showLevels('start');
$('levels-btn').onclick=()=>showLevels('game');
$('levels-back').onclick=backLevels;
$('win-levels-button').onclick=()=>showLevels('start');
$('next-button').onclick=nextLevel;
$('copy-link-button').onclick=copyLink;
$('delete-campaign-button').onclick=openDelete;
$('confirm-delete').onclick=confirmDelete;
$('cancel-delete').onclick=()=>{closeAll();open('levels-screen')};
$('endless-play').onclick=playEndless;
$('close-btn').onclick=()=>window.parent.postMessage('cerrar-eidos','*');

updateStartUI();changeBackground();
})();
