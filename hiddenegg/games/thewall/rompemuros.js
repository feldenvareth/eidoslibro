
(()=>{'use strict';

const LANG=(document.documentElement.lang||'en').toLowerCase().startsWith('es')?'es':'en';
const isES=LANG==='es';

const TEXT={
  es:{
    score:'Puntos',best:'Récord',level:'Nivel',lives:'Vidas',close:'Cerrar',levels:'NIVELES',
    cadence:'Cadencia',cadenceSoft:'Contemplativa',cadenceClassic:'Estable',cadenceFast:'Intensa',
    start:'INICIAR',continue:'CONTINUAR PARTIDA',copy:'COPIAR ENLACE',copied:'ENLACE COPIADO',
    copyPrompt:'Copia este enlace:',discover:'CONOCE EIDOS',
    title:'ROMPEMUROS',subtitle:'ROMPE · RESISTE · AVANZA',
    intro:'Conserva la esfera y atraviesa cada estructura. La campaña recorre 50 niveles cada vez más inestables. Después, el muro continúa sin límite.',
    moveTitle:'MOVER',moveText:'Ratón o desliza el dedo',
    reboundTitle:'REBOTE',reboundText:'Los extremos de la plataforma cambian el ángulo',
    cadenceTitle:'CADENCIA',cadenceText:'Elige el ritmo antes o durante la partida',
    goalTitle:'OBJETIVO',goalText:'Rompe todos los ladrillos y conserva la esfera',
    campaignNote:'50 niveles · 5 profundidades · después, modo infinito',
    levelMapTitle:'CAMPAÑA',levelMapSub:'PROGRESO DE NIVELES',
    completed:'Completados',unlocked:'Máximo desbloqueado',bestLevel:'Mejor puntuación',
    levelMapHelp:'Puedes volver a cualquier nivel desbloqueado. Eliminar la campaña está separado y exige confirmación.',
    stages:['IMPACTO','RESISTENCIA','INERCIA','FRACTURA','UMBRAL'],
    endlessTitle:'MURO INFINITO',endlessDesc:'Después del nivel 50, las estructuras siguen creciendo en densidad, resistencia y movimiento.',
    highestEndless:'Máximo alcanzado',play:'JUGAR',back:'VOLVER',
    deleteCampaign:'ELIMINAR CAMPAÑA',deleteSubtitle:'ESTA ACCIÓN NO SE PUEDE DESHACER',
    deleteIntro:'Vas a empezar desde cero. Se eliminarán los niveles completados, los niveles desbloqueados, las mejores puntuaciones y la partida actual guardados en este navegador.',
    deleteWarningTitle:'SE BORRARÁ TODO EL PROGRESO DE ESTA CAMPAÑA.',
    deleteWarningText:'La cadencia elegida se conservará. Si quieres seguir donde estabas, usa CONTINUAR PARTIDA o entra en NIVELES sin borrar.',
    deleteConfirm:'ELIMINAR Y EMPEZAR DE CERO',cancel:'CANCELAR',
    moveToStart:'Mueve el ratón o toca para empezar',effectRight:'Efecto derecha',effectLeft:'Efecto izquierda',
    levelCleared:'Nivel superado',campaignCleared:'Campaña completada',
    campaignClearedQuote:'Has atravesado los cincuenta muros. A partir de aquí la estructura continúa sin límite.',
    tapContinue:'— Toca para continuar —',
    gameOver:'Fin de partida',retry:'REPETIR NIVEL',
    stageLabel:'Profundidad',endlessLabel:'Infinito',
    closeAria:'Cerrar juego',levelsAria:'Abrir niveles',
    speedDown:'Reducir cadencia',speedUp:'Aumentar cadencia'
  },
  en:{
    score:'Score',best:'Best',level:'Level',lives:'Lives',close:'Close',levels:'LEVELS',
    cadence:'Cadence',cadenceSoft:'Contemplative',cadenceClassic:'Stable',cadenceFast:'Intense',
    start:'START',continue:'CONTINUE GAME',copy:'COPY LINK',copied:'LINK COPIED',
    copyPrompt:'Copy this link:',discover:'DISCOVER EIDOS',
    title:'WALLBREAKER',subtitle:'BREAK · ENDURE · ADVANCE',
    intro:'Keep the ball alive and break through every structure. The campaign spans 50 increasingly unstable levels. After that, the wall continues without limit.',
    moveTitle:'MOVE',moveText:'Mouse or swipe your finger',
    reboundTitle:'REBOUND',reboundText:'The paddle edges change the angle',
    cadenceTitle:'CADENCE',cadenceText:'Choose the rhythm before or during play',
    goalTitle:'OBJECTIVE',goalText:'Break every brick and keep the ball alive',
    campaignNote:'50 levels · 5 depths · then, endless mode',
    levelMapTitle:'CAMPAIGN',levelMapSub:'LEVEL PROGRESS',
    completed:'Completed',unlocked:'Highest unlocked',bestLevel:'Best score',
    levelMapHelp:'You can return to any unlocked level. Campaign deletion is separate and requires confirmation.',
    stages:['IMPACT','RESISTANCE','INERTIA','FRACTURE','THRESHOLD'],
    endlessTitle:'ENDLESS WALL',endlessDesc:'After level 50, structures keep growing in density, resistance and movement.',
    highestEndless:'Highest reached',play:'PLAY',back:'BACK',
    deleteCampaign:'DELETE CAMPAIGN',deleteSubtitle:'THIS ACTION CANNOT BE UNDONE',
    deleteIntro:'You are about to start from zero. Completed levels, unlocked levels, best scores and the current saved game in this browser will be deleted.',
    deleteWarningTitle:'ALL PROGRESS FOR THIS CAMPAIGN WILL BE ERASED.',
    deleteWarningText:'Your cadence setting will remain. To keep going, use CONTINUE GAME or open LEVELS without deleting anything.',
    deleteConfirm:'DELETE AND START FROM ZERO',cancel:'CANCEL',
    moveToStart:'Move the mouse or tap to start',effectRight:'Right spin',effectLeft:'Left spin',
    levelCleared:'Level cleared',campaignCleared:'Campaign complete',
    campaignClearedQuote:'You have broken through all fifty walls. From here, the structure continues without limit.',
    tapContinue:'— Tap to continue —',
    gameOver:'Game over',retry:'RETRY LEVEL',
    stageLabel:'Depth',endlessLabel:'Endless',
    closeAria:'Close game',levelsAria:'Open levels',
    speedDown:'Decrease cadence',speedUp:'Increase cadence'
  }
};
const T=TEXT[LANG];
const $=id=>document.getElementById(id);

const GAME_URL=isES
  ?'https://www.eidoslibro.com/hiddenegg/games/thewall/rompemuros.html'
  :'https://www.eidoslibro.com/hiddenegg/games/thewall/rompemurosEN.html';
const EIDOS_URL=isES?'https://www.eidoslibro.com/':'https://www.eidoslibro.com/indexeng.html';

const EIDOS_CONTENT=window.EIDOS_SHARED_CONTENT||{images:[],quotes:[]};
function galleryImageUrl(item){
  const raw=typeof item==='string'?item:String(item?.url||'').trim();
  if(!raw)return'';
  if(/^(?:https?:)?\/\//i.test(raw)||raw.startsWith('/'))return raw;
  return'/gallery/'+raw.replace(/^\.?\//,'');
}
const GALLERY_IMAGES=Array.isArray(window.EIDOS_IMAGE_MANIFEST)
  ?window.EIDOS_IMAGE_MANIFEST.map(galleryImageUrl).filter(Boolean)
  :[];
const BG_IMAGES=GALLERY_IMAGES.length
  ?GALLERY_IMAGES
  :(Array.isArray(EIDOS_CONTENT.images)?EIDOS_CONTENT.images.filter(Boolean):[]);
const QUOTES=Array.isArray(EIDOS_CONTENT.quotes)?EIDOS_CONTENT.quotes:[];

const cv=$('c'),ctx=cv.getContext('2d');
const W=480,H=650;
const BEST_SCORE_KEY='eidosRompemurosBestScore';
const PROGRESS_KEY='eidosWallbreakerCampaignV3';
const SAVE_KEY='eidosWallbreakerCurrentV3';
const SPEED_MODE_KEY='eidosRompemurosCadenceModeV2';

function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function removeKey(key){try{localStorage.removeItem(key)}catch{}}
function loadBestScore(){try{return Number(localStorage.getItem(BEST_SCORE_KEY))||0}catch{return 0}}
function saveBestScore(v){try{localStorage.setItem(BEST_SCORE_KEY,String(v))}catch{}}

let progress=readJSON(PROGRESS_KEY,{unlocked:1,completed:{},best:{},endless:0});
progress.unlocked=Math.max(1,Number(progress.unlocked)||1);
progress.completed=progress.completed&&typeof progress.completed==='object'?progress.completed:{};
progress.best=progress.best&&typeof progress.best==='object'?progress.best:{};
progress.endless=Math.max(0,Number(progress.endless)||0);

let score=0,bestScore=loadBestScore(),lives=3,started=false,over=false,win=false,level=1;
let spinEffect=0,spinTimer=0,quoteVisible=false,quoteNextLevel=1;
let quoteBag=[],imageBag=[],lastQuoteIndex=-1,lastImageIndex=-1,totalBricks=0;
let currentBg=null,bgImgs=[],badBgIndices=new Set();
let gamePaused=true,mapReturn='start',lastAutoSave=0;
let bricks=[],mouseX=W/2;
let running=false;

const SPEED_MODES={
  soft:{base:3.15,levelStep:.07,max:4.55,accel:.00024},
  classic:{base:3.8,levelStep:.10,max:5.4,accel:.00035},
  fast:{base:5.0,levelStep:.14,max:7.2,accel:.00055}
};
const SPEED_ORDER=['soft','classic','fast'];
let speedMode=(()=>{try{const v=localStorage.getItem(SPEED_MODE_KEY);return SPEED_MODES[v]?v:'classic'}catch{return'classic'}})();

const pad={w:80,h:12,x:W/2-40,y:H-40,prevX:W/2-40};
const ball={r:8,x:W/2,y:H-60,dx:SPEED_MODES.classic.base,dy:-SPEED_MODES.classic.base,speed:SPEED_MODES.classic.base};
const COLORS=['#f5d76e','#c8a84b','#8fd4c2','#e8c49a','#a8d4a0'];
const BW=52,BH=18,GAP=4;

function stageIndexFor(lvl){return lvl<=50?Math.min(4,Math.floor((Math.max(1,lvl)-1)/10)):4}
function levelDisplay(lvl){return lvl<=50?String(lvl):'∞'+(lvl-50)}
function stageName(lvl){return lvl<=50?T.stages[stageIndexFor(lvl)]:T.endlessTitle}

function mulberry32(seed){
  let a=seed>>>0;
  return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
}
function hashLevel(lvl){
  let h=2166136261;
  const s='wall-'+lvl;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return h>>>0;
}
function shuffledIndices(length,lastIndex=-1,rand=Math.random){
  const arr=Array.from({length},(_,i)=>i);
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
  if(arr.length>1&&arr[0]===lastIndex)[arr[0],arr[1]]=[arr[1],arr[0]];
  return arr;
}
function quoteText(v){return typeof v==='string'?v:(v?.text||v?.quote||v?.frase||'')}
function nextQuoteIndex(){
  if(!QUOTES.length)return-1;
  if(!quoteBag.length)quoteBag=shuffledIndices(QUOTES.length,lastQuoteIndex);
  lastQuoteIndex=quoteBag.shift();
  return lastQuoteIndex;
}
function nextBackground(){
  if(!bgImgs.length||badBgIndices.size>=bgImgs.length)return null;
  if(!imageBag.length)imageBag=shuffledIndices(bgImgs.length,lastImageIndex).filter(i=>!badBgIndices.has(i));
  if(!imageBag.length)return null;
  lastImageIndex=imageBag.shift();
  return bgImgs[lastImageIndex];
}
function setupBackgrounds(){
  bgImgs=BG_IMAGES.map((url,index)=>{
    const image=new Image();
    image.crossOrigin='anonymous';
    image.onerror=()=>{
      badBgIndices.add(index);
      imageBag=imageBag.filter(i=>i!==index);
      if(currentBg===image)currentBg=nextBackground();
    };
    image.src=url;
    return image;
  });
}

function speedName(mode){
  return mode==='soft'?T.cadenceSoft:mode==='fast'?T.cadenceFast:T.cadenceClassic;
}
function levelSpeedTarget(){
  const s=SPEED_MODES[speedMode],campaign=Math.max(0,level-1);
  const growth=campaign*s.levelStep*.22;
  const extraCap=Math.min(1.35,stageIndexFor(level)*.16+Math.max(0,level-50)*.012);
  return Math.min(s.max+extraCap,s.base+growth);
}
function updateSpeedControl(){
  const label=$('speed-label');
  label.textContent=speedName(speedMode);
  label.dataset.prefix=T.cadence+' · ';
}
function setSpeedMode(mode){
  if(!SPEED_MODES[mode])return;
  speedMode=mode;
  try{localStorage.setItem(SPEED_MODE_KEY,mode)}catch{}
  updateSpeedControl();
  const target=levelSpeedTarget(),current=Math.hypot(ball.dx,ball.dy);
  ball.speed=target;
  if(current>0){ball.dx=ball.dx/current*target;ball.dy=ball.dy/current*target}
  $('msg').textContent=T.cadence+' '+speedName(speedMode).toLowerCase();
  saveCurrentGame();
}
function changeSpeedMode(direction){
  const i=SPEED_ORDER.indexOf(speedMode),n=Math.max(0,Math.min(SPEED_ORDER.length-1,i+direction));
  setSpeedMode(SPEED_ORDER[n]);
}

function fixedLayout(l){
  const all=[];
  if(l===1){for(let r=0;r<5;r++)for(let c=0;c<8;c++)all.push({r,c})}
  else if(l===2){[[0,3],[0,4],[1,2],[1,3],[1,4],[1,5],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]].forEach(([r,c])=>all.push({r,c}))}
  else if(l===3){for(let r=0;r<5;r++)for(let c=0;c<8;c++)if((r+c)%2===0)all.push({r,c})}
  else if(l===4){for(let i=0;i<4;i++){all.push({r:i,c:i});all.push({r:i,c:7-i})}for(let c=3;c<=4;c++)all.push({r:4,c})}
  else if(l===5){for(let c=0;c<8;c++)all.push({r:2,c});for(let r=0;r<5;r++){all.push({r,c:3});all.push({r,c:4})}}
  else{for(let r=0;r<5;r++){const start=r%2===0?0:1;for(let c=start;c<8;c+=2)all.push({r,c})}}
  return all;
}
function proceduralLayout(lvl){
  const rand=mulberry32(hashLevel(lvl)),rows=6,cols=8,stage=stageIndexFor(lvl);
  const endless=Math.max(0,lvl-50);
  const minTarget=[20,24,28,31,34][stage];
  const maxTarget=[28,32,36,40,44][stage];
  const target=Math.min(46,Math.round(minTarget+rand()*(maxTarget-minTarget)+Math.min(2,endless*.08)));
  const symmetricChance=Math.max(.42,.82-stage*.08-Math.min(.14,endless*.004));
  const symmetric=rand()<symmetricChance;
  const used=new Set(),all=[];
  const add=(r,c)=>{
    if(r<0||r>=rows||c<0||c>=cols)return;
    const key=r+','+c;if(used.has(key))return;used.add(key);all.push({r,c});
  };
  const mode=lvl%5;
  if(mode===1){
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if((r+c+lvl)%3!==0&&rand()>.18)add(r,c);
  }else if(mode===2){
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(Math.abs(c-3.5)<=2.6-r*.18&&rand()>.15)add(r,c);
  }else if(mode===3){
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(((r*2+c+lvl)%4)<2&&rand()>.10)add(r,c);
  }
  let attempts=0;
  while(all.length<target&&attempts<600){
    attempts++;
    const r=Math.floor(rand()*rows),c=Math.floor(rand()*cols);
    add(r,c);
    if(symmetric)add(r,cols-1-c);
    if(rand()<.18+stage*.04)add(Math.min(rows-1,r+1),c);
    if(rand()<.08+stage*.025)add(Math.max(0,r-1),c);
  }
  return all.slice(0,target);
}
function getLayout(lvl){return lvl<=6?fixedLayout(lvl):proceduralLayout(lvl)}

function initBricks(lvl){
  bricks=[];
  const layout=getLayout(lvl),stage=stageIndexFor(lvl),endless=Math.max(0,lvl-50);
  const rand=mulberry32(hashLevel(lvl)^0xA5A5A5A5);
  const doubleCount=Math.min(layout.length,2+stage*2+Math.floor(((lvl-1)%10)/3)+Math.min(4,Math.floor(endless/8)));
  const shuffled=shuffledIndices(layout.length,-1,rand);
  const doubleIndices=new Set(shuffled.slice(0,doubleCount));
  layout.forEach(({r,c},index)=>{
    const isDouble=doubleIndices.has(index),rowColor=COLORS[r%COLORS.length];
    bricks.push({
      x:4+c*(BW+GAP),y:45+r*(BH+GAP),w:BW,h:BH,alive:true,
      hits:isDouble?2:1,maxHits:isDouble?2:1,moving:false,dx:0,
      special:isDouble?'double':'normal',color:rowColor,baseColor:rowColor
    });
  });
  let movingCount=1+(stage>=2?1:0)+(stage>=4?1:0);
  if(endless>0)movingCount=Math.min(5,movingCount+Math.floor((endless-1)/12));
  for(let i=0;i<movingCount;i++){
    const movingWidth=Math.max(56,72-stage*3-Math.min(8,Math.floor(endless/8)));
    const base=COLORS[(lvl+2+i)%COLORS.length];
    const y=185+i*31+((lvl+i)%2)*10;
    bricks.push({
      x:Math.max(10,Math.min(W-movingWidth-10,W/2-movingWidth/2+(i-(movingCount-1)/2)*58)),
      y,w:movingWidth,h:20,alive:true,hits:2,maxHits:2,moving:true,
      dx:(i%2? -1:1)*(1.15+Math.min(lvl,60)*.022+i*.10),
      special:'moving',color:base,baseColor:base
    });
  }
  totalBricks=bricks.length;
  pad.w=Math.max(60,82-stage*4-Math.min(6,Math.floor(endless/10)));
  pad.x=Math.max(0,Math.min(W-pad.w,pad.x));
}

function resetBall(){
  const target=levelSpeedTarget();
  ball.x=W/2;ball.y=H-60;ball.speed=target;
  ball.dx=target*(Math.random()<.5?1:-1);ball.dy=-target;
  spinEffect=0;spinTimer=0;$('spin').textContent='';started=false;
}
function hearts(){return'♥ '.repeat(Math.max(0,lives)).trim()||'×'}
function updateHUD(){
  $('scoreEl').textContent=T.score+': '+score;
  $('bestEl').textContent=T.best+': '+bestScore;
  $('levelEl').textContent=T.level+' '+levelDisplay(level)+' · '+stageName(level);
  $('livesEl').textContent=hearts();
}
function setInstruction(){
  $('msg').textContent=T.moveToStart;
  $('game-btn').style.display='none';
}
function updateBestScore(){
  if(score<=bestScore)return;
  bestScore=score;saveBestScore(bestScore);$('bestEl').textContent=T.best+': '+bestScore;
}

function hasSavedGame(){
  const s=readJSON(SAVE_KEY,null);
  return Boolean(s&&Number(s.version)===3&&Array.isArray(s.bricks)&&Number(s.level)>=1);
}
function hasCampaignProgress(){
  return hasSavedGame()||progress.unlocked>1||Object.keys(progress.completed).length>0||Object.keys(progress.best).length>0||progress.endless>0;
}
function saveCurrentGame(){
  if(gamePaused||quoteVisible||over||win)return;
  writeJSON(SAVE_KEY,{
    version:3,level,score,lives,started,spinEffect,spinTimer,mouseX,
    ball:{...ball},pad:{...pad},bricks:bricks.map(b=>({...b}))
  });
  updateStartUI();
}
function loadSavedGame(){
  const s=readJSON(SAVE_KEY,null);
  if(!s||Number(s.version)!==3||!Array.isArray(s.bricks))return false;
  level=Math.max(1,Math.floor(Number(s.level)||1));score=Math.max(0,Number(s.score)||0);
  lives=Math.max(1,Number(s.lives)||3);started=Boolean(s.started);
  spinEffect=Number(s.spinEffect)||0;spinTimer=Number(s.spinTimer)||0;mouseX=Number(s.mouseX)||W/2;
  Object.assign(ball,s.ball||{});Object.assign(pad,s.pad||{});
  bricks=s.bricks.map(b=>({...b}));totalBricks=bricks.length;
  over=false;win=false;quoteVisible=false;gamePaused=false;
  currentBg=nextBackground()||currentBg;updateHUD();$('game-btn').style.display='none';
  $('msg').textContent=started?'':T.moveToStart;
  closeAllScreens();loop();return true;
}
function resetCampaignData(){
  removeKey(SAVE_KEY);
  progress={unlocked:1,completed:{},best:{},endless:0};
  writeJSON(PROGRESS_KEY,progress);
  bestScore=0;saveBestScore(0);
}
function markLevelCleared(){
  const key=String(level);
  progress.completed[key]=true;
  progress.best[key]=Math.max(Number(progress.best[key])||0,score);
  if(level<=50)progress.unlocked=Math.max(progress.unlocked,Math.min(51,level+1));
  else progress.endless=Math.max(progress.endless,level-50);
  writeJSON(PROGRESS_KEY,progress);
  removeKey(SAVE_KEY);
  updateStartUI();
}

function open(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
function close(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}
function closeAllScreens(){document.querySelectorAll('.screen').forEach(close)}
function updateStartUI(){
  $('start-button').textContent=hasCampaignProgress()?T.continue:T.start;
  $('delete-campaign-button').hidden=!hasCampaignProgress();
}
function startLevel(lvl){
  level=Math.max(1,Math.floor(Number(lvl)||1));score=0;lives=3;over=false;win=false;started=false;quoteVisible=false;gamePaused=false;
  initBricks(level);resetBall();currentBg=nextBackground()||currentBg;setInstruction();updateHUD();closeAllScreens();saveCurrentGame();loop();
}
function continueCampaign(){
  if(loadSavedGame())return;
  startLevel(Math.max(1,progress.unlocked||1));
}
function replayLevel(){removeKey(SAVE_KEY);startLevel(level)}

function renderLevelMap(){
  const box=$('level-map');box.innerHTML='';
  const doneCount=Object.keys(progress.completed).filter(k=>Number(k)>=1&&Number(k)<=50&&progress.completed[k]).length;
  $('campaign-completed').innerHTML=T.completed+': <strong>'+doneCount+'/50</strong>';
  $('campaign-unlocked').innerHTML=T.unlocked+': <strong>'+Math.min(50,progress.unlocked)+'</strong>';
  for(let s=0;s<5;s++){
    const section=document.createElement('section');section.className='stage-map';
    const head=document.createElement('div');head.className='stage-map-head';
    head.innerHTML='<strong>'+T.stages[s]+'</strong><span>'+(s*10+1)+'–'+(s*10+10)+'</span>';
    const grid=document.createElement('div');grid.className='level-grid';
    for(let n=s*10+1;n<=s*10+10;n++){
      const b=document.createElement('button');b.type='button';b.className='level-node';b.textContent=n;
      const unlocked=n<=progress.unlocked,done=Boolean(progress.completed[String(n)]),current=n===Math.min(progress.unlocked,50);
      if(done)b.classList.add('done');else if(unlocked)b.classList.add('unlocked');else b.classList.add('locked');
      if(current&&!done)b.classList.add('current');
      if(!unlocked)b.disabled=true;
      else{
        const best=Number(progress.best[String(n)])||0;
        b.title=done?(T.level+' '+n+' · '+T.bestLevel+': '+best):(T.level+' '+n);
        b.onclick=()=>{removeKey(SAVE_KEY);startLevel(n)};
      }
      grid.appendChild(b);
    }
    section.append(head,grid);box.appendChild(section);
  }
  const endless=$('endless-panel');
  if(progress.unlocked>50){
    endless.hidden=false;
    const max=Math.max(1,progress.endless||1);
    $('endless-description').textContent=T.endlessDesc+' '+T.highestEndless+': ∞'+max+'.';
    $('endless-input').min='1';$('endless-input').max=String(max);$('endless-input').value=String(max);
  }else endless.hidden=true;
  $('delete-campaign-button').hidden=!hasCampaignProgress();
}
function showLevels(from='game'){
  mapReturn=from;
  if(from==='game'&&!over&&!win){saveCurrentGame();gamePaused=true}
  renderLevelMap();close($('start-screen'));open($('levels-screen'));
}
function backFromLevels(){
  close($('levels-screen'));
  if(mapReturn==='start'){open($('start-screen'));return}
  gamePaused=false;loop();
}
function playEndlessSelection(){
  const max=Math.max(1,progress.endless||1),raw=Math.floor(Number($('endless-input').value)||1),n=Math.max(1,Math.min(max,raw));
  $('endless-input').value=String(n);removeKey(SAVE_KEY);startLevel(50+n);
}
function openDeleteCampaign(){if(!hasCampaignProgress())return;close($('levels-screen'));open($('delete-campaign-screen'))}
function cancelDeleteCampaign(){close($('delete-campaign-screen'));open($('levels-screen'))}
function confirmDeleteCampaign(){
  resetCampaignData();score=0;lives=3;level=1;over=false;win=false;started=false;gamePaused=true;
  initBricks(1);resetBall();currentBg=nextBackground()||currentBg;updateHUD();setInstruction();
  close($('delete-campaign-screen'));close($('levels-screen'));updateStartUI();open($('start-screen'));draw();
}

async function copyGameLink(){
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(GAME_URL);
      const old=$('copy-link-button').textContent;$('copy-link-button').textContent=T.copied;
      setTimeout(()=>{$('copy-link-button').textContent=T.copy},1500);return;
    }
  }catch{}
  window.prompt(T.copyPrompt,GAME_URL);
}

function showQuote(){
  quoteVisible=true;gamePaused=true;
  const idx=nextQuoteIndex(),qs=$('quote-screen'),qt=$('quote-text'),qh=$('quote-hint');
  const campaignFinish=level===50;
  qt.textContent=campaignFinish?T.campaignClearedQuote:(idx>=0?quoteText(QUOTES[idx]):T.levelCleared);
  qh.textContent=T.tapContinue;qh.classList.remove('show');qt.classList.remove('show');
  qs.classList.add('visible');qs.style.background='rgba(0,0,0,0)';
  let op=0;
  const fi=setInterval(()=>{
    op=Math.min(op+.04,.88);qs.style.background='rgba(5,12,8,'+op+')';
    if(op>=.88){clearInterval(fi);qt.classList.add('show');qh.classList.add('show')}
  },30);
}
function dismissQuote(){
  if(!quoteVisible)return;
  const qs=$('quote-screen'),qt=$('quote-text'),qh=$('quote-hint');
  qt.classList.remove('show');qh.classList.remove('show');
  let op=.88;
  const fo=setInterval(()=>{
    op=Math.max(op-.05,0);qs.style.background='rgba(5,12,8,'+op+')';
    if(op<=0){clearInterval(fo);qs.classList.remove('visible');quoteVisible=false;gamePaused=false;startLevel(quoteNextLevel)}
  },30);
}

function update(){
  if(gamePaused||quoteVisible||over||win)return;
  pad.prevX=pad.x;pad.x=Math.max(0,Math.min(W-pad.w,mouseX-pad.w/2));
  for(const brick of bricks){
    if(!brick.alive||!brick.moving)continue;
    brick.x+=brick.dx;
    if(brick.x<=2){brick.x=2;brick.dx=Math.abs(brick.dx)}
    if(brick.x+brick.w>=W-2){brick.x=W-brick.w-2;brick.dx=-Math.abs(brick.dx)}
  }
  if(!started)return;
  const s=SPEED_MODES[speedMode],max=s.max+Math.min(1.35,stageIndexFor(level)*.16+Math.max(0,level-50)*.012);
  if(ball.speed<max){
    ball.speed=Math.min(max,ball.speed+s.accel);
    const cs=Math.hypot(ball.dx,ball.dy);
    if(cs>0){ball.dx=ball.dx/cs*ball.speed;ball.dy=ball.dy/cs*ball.speed}
  }
  if(spinEffect!==0&&spinTimer>0){
    ball.dx+=spinEffect*ball.speed*.016;spinTimer--;
    if(spinTimer<=0){spinEffect=0;$('spin').textContent=''}
  }
  ball.x+=ball.dx;ball.y+=ball.dy;
  if(ball.x-ball.r<0){ball.x=ball.r;ball.dx=Math.abs(ball.dx)}
  if(ball.x+ball.r>W){ball.x=W-ball.r;ball.dx=-Math.abs(ball.dx)}
  if(ball.y-ball.r<0){ball.y=ball.r;ball.dy=Math.abs(ball.dy)}
  if(ball.dy>0&&ball.y+ball.r>=pad.y&&ball.y-ball.r<=pad.y+pad.h&&ball.x>=pad.x&&ball.x<=pad.x+pad.w){
    const pv=pad.x-pad.prevX,rel=(ball.x-(pad.x+pad.w/2))/(pad.w/2);
    ball.dx=rel*5;ball.dy=-Math.abs(ball.dy);ball.y=pad.y-ball.r;
    if(Math.abs(pv)>2){spinEffect=pv>0?1:-1;spinTimer=60;$('spin').textContent=spinEffect>0?T.effectRight:T.effectLeft}
    const rs=Math.hypot(ball.dx,ball.dy);if(rs>0){ball.dx=ball.dx/rs*ball.speed;ball.dy=ball.dy/rs*ball.speed}
  }
  for(const brick of bricks){
    if(!brick.alive)continue;
    const bw=brick.w,bh=brick.h;
    if(ball.x+ball.r>brick.x&&ball.x-ball.r<brick.x+bw&&ball.y+ball.r>brick.y&&ball.y-ball.r<brick.y+bh){
      brick.hits--;
      if(brick.hits<=0){brick.alive=false;score+=brick.moving?100:(brick.maxHits>1?20:10)}
      else score+=brick.moving?20:5;
      updateBestScore();updateHUD();
      const fl=ball.x+ball.r-brick.x,fr=brick.x+bw-(ball.x-ball.r),ft=ball.y+ball.r-brick.y,fb=brick.y+bh-(ball.y-ball.r);
      if(Math.min(fl,fr)<Math.min(ft,fb))ball.dx*=-1;else ball.dy*=-1;
      saveCurrentGame();break;
    }
  }
  if(ball.y-ball.r>H){
    lives--;updateHUD();
    if(lives<=0){over=true;removeKey(SAVE_KEY);updateStartUI();return}
    resetBall();saveCurrentGame();
  }
  if(bricks.every(b=>!b.alive)){win=true;markLevelCleared()}
  const now=performance.now();if(now-lastAutoSave>900){lastAutoSave=now;saveCurrentGame()}
}

function draw(){
  ctx.globalAlpha=1;ctx.fillStyle='#111a14';ctx.fillRect(0,0,W,H);
  if(currentBg&&currentBg.complete&&currentBg.naturalWidth>0){
    const iW=currentBg.naturalWidth,iH=currentBg.naturalHeight,scale=Math.min(W/iW,H/iH),dw=iW*scale,dh=iH*scale;
    const alive=bricks.reduce((n,b)=>n+(b.alive?1:0),0),p=totalBricks?1-alive/totalBricks:0;
    ctx.globalAlpha=.18+p*.82;ctx.drawImage(currentBg,(W-dw)/2,(H-dh)/2,dw,dh);ctx.globalAlpha=1;
    const darkness=.86-p*.68;ctx.fillStyle='rgba(10,20,15,'+darkness+')';ctx.fillRect(0,0,W,H);
  }else{ctx.fillStyle='#1e3d2f';ctx.fillRect(0,0,W,H)}
  for(const b of bricks){
    if(!b.alive)continue;
    const bw=b.w,bh=b.h,untouchedDouble=b.special==='double'&&b.hits===b.maxHits,untouchedMoving=b.special==='moving'&&b.hits===b.maxHits;
    ctx.save();
    if(untouchedDouble){ctx.shadowColor='rgba(255,211,92,.95)';ctx.shadowBlur=14;ctx.globalAlpha=1;ctx.fillStyle='#d6ad38'}
    else if(untouchedMoving){ctx.shadowColor='rgba(143,212,194,.85)';ctx.shadowBlur=12;ctx.globalAlpha=.98;ctx.fillStyle='#5fae9c'}
    else{ctx.shadowBlur=0;ctx.globalAlpha=b.moving?.98:.85;ctx.fillStyle=b.baseColor||b.color}
    ctx.beginPath();ctx.roundRect(b.x,b.y,bw,bh,b.moving?7:3);ctx.fill();ctx.restore();
    ctx.globalAlpha=.22;ctx.fillStyle='#fff';ctx.fillRect(b.x+2,b.y+2,bw-4,4);
    ctx.globalAlpha=1;ctx.strokeStyle=untouchedDouble?'rgba(255,245,190,.98)':b.moving?'rgba(190,255,240,.90)':b.maxHits>1?'rgba(255,255,255,.48)':'rgba(255,255,255,.15)';
    ctx.lineWidth=untouchedDouble?2:(b.moving?2:(b.maxHits>1?1.5:1));ctx.beginPath();ctx.roundRect(b.x,b.y,bw,bh,b.moving?7:3);ctx.stroke();
    if(b.maxHits>1&&b.hits===1){
      ctx.strokeStyle='rgba(30,20,8,.75)';ctx.lineWidth=1.5;ctx.beginPath();
      ctx.moveTo(b.x+bw*.20,b.y+2);ctx.lineTo(b.x+bw*.42,b.y+bh*.48);ctx.lineTo(b.x+bw*.31,b.y+bh-2);
      ctx.moveTo(b.x+bw*.42,b.y+bh*.48);ctx.lineTo(b.x+bw*.72,b.y+3);ctx.stroke();
    }
    if(b.moving){
      ctx.fillStyle='#241d08';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('◆',b.x+bw/2,b.y+bh/2+.5);ctx.textAlign='left';ctx.textBaseline='alphabetic';
    }
  }
  ctx.globalAlpha=.92;ctx.fillStyle=spinEffect>0?'#f5d76e':spinEffect<0?'#8fd4c2':'rgba(255,255,255,.88)';
  ctx.beginPath();ctx.roundRect(pad.x,pad.y,pad.w,pad.h,6);ctx.fill();ctx.globalAlpha=1;
  if(spinEffect!==0){ctx.strokeStyle=spinEffect>0?'rgba(245,215,110,.6)':'rgba(143,212,194,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r+5,0,Math.PI*2);ctx.stroke()}
  const g=ctx.createRadialGradient(ball.x-2,ball.y-2,1,ball.x,ball.y,ball.r);g.addColorStop(0,'#fff7a0');g.addColorStop(1,'#c8a020');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
  if(!started&&!over&&!win&&!quoteVisible&&!gamePaused){
    ctx.fillStyle='rgba(0,0,0,.52)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f5ecd0';ctx.font='bold 22px Georgia,serif';ctx.textAlign='center';ctx.fillText('E I D O S',W/2,H/2-16);
    ctx.font='13px sans-serif';ctx.fillStyle='#c8c8b0';ctx.fillText(T.moveToStart,W/2,H/2+14);ctx.textAlign='left';
  }
}
function loop(){
  if(running)return;running=true;
  function frame(){
    if(quoteVisible){running=false;draw();return}
    if(over||win){
      running=false;draw();
      if(win){
        quoteNextLevel=level+1;showQuote();
      }else{
        $('msg').textContent=T.gameOver+' · '+T.score+': '+score;
        $('game-btn').textContent=T.retry;$('game-btn').onclick=replayLevel;$('game-btn').style.display='inline-block';
      }
      return;
    }
    update();draw();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function localizeStaticUI(){
  $('scoreEl').textContent=T.score+': 0';$('bestEl').textContent=T.best+': '+bestScore;$('levelEl').textContent=T.level+' 1';
  $('levels-btn').textContent=T.levels;$('levels-btn').setAttribute('aria-label',T.levelsAria);
  $('close-btn').textContent='✕ '+T.close;$('close-btn').setAttribute('aria-label',T.closeAria);
  $('speed-down').setAttribute('aria-label',T.speedDown);$('speed-up').setAttribute('aria-label',T.speedUp);
  $('start-title').textContent=T.title;$('start-subtitle').textContent=T.subtitle;$('start-intro').textContent=T.intro;
  $('rule-move-title').textContent=T.moveTitle;$('rule-move-text').textContent=T.moveText;
  $('rule-rebound-title').textContent=T.reboundTitle;$('rule-rebound-text').textContent=T.reboundText;
  $('rule-cadence-title').textContent=T.cadenceTitle;$('rule-cadence-text').textContent=T.cadenceText;
  $('rule-goal-title').textContent=T.goalTitle;$('rule-goal-text').textContent=T.goalText;
  $('start-levels-button').textContent=T.levels;$('copy-link-button').textContent=T.copy;$('discover-eidos').textContent=T.discover;$('discover-eidos').href=EIDOS_URL;
  $('campaign-note').textContent=T.campaignNote;$('campaign-title').textContent=T.levelMapTitle;$('campaign-subtitle').textContent=T.levelMapSub;
  $('endless-title').textContent=T.endlessTitle;$('endless-play').textContent=T.play;$('levels-help').textContent=T.levelMapHelp;$('levels-back').textContent=T.back;$('delete-campaign-button').textContent=T.deleteCampaign;
  $('delete-title').textContent=T.deleteCampaign;$('delete-subtitle').textContent=T.deleteSubtitle;$('delete-intro').textContent=T.deleteIntro;
  $('delete-warning-title').textContent=T.deleteWarningTitle;$('delete-warning-text').textContent=T.deleteWarningText;$('confirm-delete-campaign').textContent=T.deleteConfirm;$('cancel-delete-campaign').textContent=T.cancel;
  $('quote-hint').textContent=T.tapContinue;
}

cv.addEventListener('mousemove',e=>{if(quoteVisible||gamePaused)return;const r=cv.getBoundingClientRect();mouseX=(e.clientX-r.left)*(W/r.width);started=true});
cv.addEventListener('touchmove',e=>{if(quoteVisible||gamePaused)return;e.preventDefault();const r=cv.getBoundingClientRect();mouseX=(e.touches[0].clientX-r.left)*(W/r.width);started=true},{passive:false});
cv.addEventListener('click',()=>{if(!quoteVisible&&!gamePaused)started=true});
$('quote-screen').addEventListener('click',dismissQuote);
$('speed-down').addEventListener('click',()=>changeSpeedMode(-1));
$('speed-up').addEventListener('click',()=>changeSpeedMode(1));
$('close-btn').addEventListener('click',()=>window.parent.postMessage('cerrar-eidos','*'));
$('levels-btn').addEventListener('click',()=>showLevels('game'));
$('start-button').addEventListener('click',continueCampaign);
$('start-levels-button').addEventListener('click',()=>showLevels('start'));
$('copy-link-button').addEventListener('click',copyGameLink);
$('levels-back').addEventListener('click',backFromLevels);
$('delete-campaign-button').addEventListener('click',openDeleteCampaign);
$('confirm-delete-campaign').addEventListener('click',confirmDeleteCampaign);
$('cancel-delete-campaign').addEventListener('click',cancelDeleteCampaign);
$('endless-play').addEventListener('click',playEndlessSelection);
$('endless-input').addEventListener('keydown',e=>{if(e.key==='Enter')playEndlessSelection()});
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if($('delete-campaign-screen').classList.contains('open')){cancelDeleteCampaign();return}
  if($('levels-screen').classList.contains('open')){backFromLevels();return}
  if(!$('start-screen').classList.contains('open'))showLevels('game');
});

setupBackgrounds();currentBg=nextBackground();localizeStaticUI();updateSpeedControl();initBricks(1);resetBall();updateHUD();setInstruction();updateStartUI();open($('start-screen'));draw();

})();
