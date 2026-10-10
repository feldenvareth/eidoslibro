(()=>{'use strict';

const LANG=(document.documentElement.lang||'es').toLowerCase().startsWith('es')?'es':'en';
const isES=LANG==='es';
const TEXT={
  es:{
    gameTitle:'¿SUFICIENTE?',subtitle:'ELIGE UNA META · ALCÁNZALA · DECIDE CUÁNDO PARAR',
    startSubtitle:'UN JUEGO SOBRE LO QUE OCURRE DESPUÉS DE CONSEGUIRLO',
    intro:'Imagina que esta cifra representa aquello que persigues. Antes de empezar, fija un número que, ahora mismo, te parezca suficiente.',
    chooseEnough:'¿En qué cifra pensarías: «ya está, con esto basta»?',start:'EMPEZAR',copyLink:'COPIAR ENLACE',discoverEidos:'CONOCE EIDOS',
    startNote:'No hay una respuesta correcta. El número solo sirve para fijar tu primera meta.',restart:'REINICIAR',
    goal:'META',round:'RONDA',rhythm:'RITMO',
    gameHint:'Pulsa para avanzar. Cada toque cambia la imagen y el ritmo multiplica cada impulso. Si te detienes, lo ganado en esta etapa empieza a caer.',
    reached:'META ALCANZADA',stopHere:'PARAR AQUÍ',continue:'SEGUIR',yourChoice:'TU RECORRIDO',
    resultTitle:'¿CUÁNDO FUE SUFICIENTE?',playAgain:'JUGAR DE NUEVO',backEssay:'VOLVER AL ENSAYO',
    initial:'DIJISTE QUE BASTABA',final:'HAS PARADO EN',copied:'ENLACE COPIADO',copyPrompt:'Copia este enlace:',
    falling:(n)=>`−${fmtN(n)}/s`,holding:'MANTÉN EL RITMO',
    milestoneTitles:[
      'Esto era lo que habías elegido.',
      'Ahora tienes el doble.',
      'Ya es cuatro veces tu primera meta.',
      'Ocho veces aquello que llamaste suficiente.',
      'Dieciséis veces tu punto de partida.'
    ],
    milestoneTexts:[
      'Antes de empezar dijiste que esta cifra sería suficiente. Ya estás aquí. ¿Paras?',
      'La primera meta quedó atrás. Puedes detenerte ahora o convertir este número en un nuevo punto de partida.',
      'Lo que al principio parecía suficiente ya queda lejos. Puedes parar o aceptar otra meta.',
      'Has multiplicado varias veces aquello que elegiste al comienzo. Aun así, el juego puede proponerte otra cifra.',
      'Podríamos seguir doblando la meta. El mecanismo no necesita un final.'
    ],
    stopFirst:(base)=>`Elegiste ${fmtN(base)} como suficiente y, al alcanzarlo, decidiste parar.`,
    stopLater:(base,total,n)=>`Antes de empezar dijiste que ${fmtN(base)} sería suficiente. Has parado en ${fmtN(total)}, después de aceptar ${n} ${n===1?'meta nueva':'metas nuevas'}.`,
    exhausted:(base,total)=>`Empezaste llamando suficiente a ${fmtN(base)}. Has llegado a ${fmtN(total)}. Podríamos proponerte ${fmtN(total*2)} y el juego funcionaría exactamente igual.`,
    reflection:'El juego no mide tu felicidad. Solo muestra lo fácil que puede resultar convertir una meta alcanzada en el punto de partida de la siguiente.'
  },
  en:{
    gameTitle:'ENOUGH?',subtitle:'CHOOSE A GOAL · REACH IT · DECIDE WHEN TO STOP',
    startSubtitle:'A GAME ABOUT WHAT HAPPENS AFTER YOU GET THERE',
    intro:'Imagine this number represents whatever you are pursuing. Before you begin, choose a figure that, right now, feels like enough.',
    chooseEnough:'At what number would you think: “that’s it, this is enough”?',start:'START',copyLink:'COPY LINK',discoverEidos:'DISCOVER EIDOS',
    startNote:'There is no correct answer. The number simply fixes your first goal.',restart:'RESTART',
    goal:'GOAL',round:'ROUND',rhythm:'RHYTHM',
    gameHint:'Tap to advance. Every tap changes the image, and rhythm multiplies each impulse. Stop, and the progress made in this stage begins to slip away.',
    reached:'GOAL REACHED',stopHere:'STOP HERE',continue:'KEEP GOING',yourChoice:'YOUR PATH',
    resultTitle:'WHEN WAS IT ENOUGH?',playAgain:'PLAY AGAIN',backEssay:'BACK TO THE ESSAY',
    initial:'YOU SAID ENOUGH WAS',final:'YOU STOPPED AT',copied:'LINK COPIED',copyPrompt:'Copy this link:',
    falling:(n)=>`−${fmtN(n)}/s`,holding:'KEEP THE RHYTHM',
    milestoneTitles:[
      'This is what you chose.',
      'Now you have twice as much.',
      'Four times your first goal.',
      'Eight times what you called enough.',
      'Sixteen times your starting point.'
    ],
    milestoneTexts:[
      'Before you began, you said this number would be enough. You are here. Do you stop?',
      'The first goal is behind you. You can stop now, or turn this number into a new starting point.',
      'What once looked like enough is already far behind. You can stop or accept another goal.',
      'You have multiplied what you chose at the beginning several times over. The game can still offer another number.',
      'We could keep doubling the goal. The mechanism does not need an ending.'
    ],
    stopFirst:(base)=>`You chose ${fmtN(base)} as enough and stopped when you reached it.`,
    stopLater:(base,total,n)=>`Before you began, you said ${fmtN(base)} would be enough. You stopped at ${fmtN(total)}, after accepting ${n} new ${n===1?'goal':'goals'}.`,
    exhausted:(base,total)=>`You began by calling ${fmtN(base)} enough. You reached ${fmtN(total)}. We could offer ${fmtN(total*2)} next and the game would work exactly the same way.`,
    reflection:'The game does not measure your happiness. It only shows how easily a goal, once reached, can become the starting point for the next one.'
  }
};
const T=TEXT[LANG];
const ARTICLE_URL=isES
  ? 'https://www.eidoslibro.com/blog/articulos/11_si_la_felicidad_nunca_hubiera_sido_la_meta.html'
  : 'https://www.eidoslibro.com/blog/articles/11_if_happiness_was_never_the_goal.html';
const $=id=>document.getElementById(id);
const SAVE='eidos-enough-state-v2';
const MAX_ROUNDS=5;
const IDLE_GRACE=760;
const BG_AUTO_MS=4200;

function fmtN(n){return new Intl.NumberFormat(LANG==='es'?'es-ES':'en-US',{maximumFractionDigits:0}).format(Math.round(n))}
function read(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function remove(k){try{localStorage.removeItem(k)}catch(e){}}
function closeAll(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('open'))}
function open(id){$(id).classList.add('open')}
function hasOpenScreen(){return !!document.querySelector('.screen.open')}

document.querySelectorAll('[data-t]').forEach(el=>{const k=el.dataset.t;if(typeof T[k]==='string')el.textContent=T[k]});

let state={base:250,total:0,round:1,target:250,continues:0,streak:0,lastTap:0,finished:false,active:false};
let locked=false,lastFrame=performance.now(),lastPaint=0;

function fresh(base){return {base,total:0,round:1,target:base,continues:0,streak:0,lastTap:0,finished:false,active:true}}
function save(){write(SAVE,state)}
function clearSave(){remove(SAVE)}
function stageStart(){return state.round===1?0:state.base*Math.pow(2,state.round-2)}
function stageSpan(){return Math.max(1,state.target-stageStart())}
function baseGain(){return Math.max(1,Math.round(stageSpan()/36))}
function multiplier(){return state.streak>=10?4:state.streak>=6?3:state.streak>=3?2:1}
function gain(){return Math.max(1,baseGain()*multiplier())}
function decayPerSecond(){return Math.max(1,stageSpan()/(31-Math.min(5,state.round)*1.6))}
function stageProgress(){return Math.max(0,Math.min(1,(state.total-stageStart())/stageSpan()))}

function buildLifeform(){
  const life=$('lifeform'); if(!life||life.children.length)return;
  const core=document.createElement('b');life.appendChild(core);
  for(let i=0;i<10;i++){const node=document.createElement('i');node.style.setProperty('--i',i);life.appendChild(node)}
}
function renderLifeform(p){
  const life=$('lifeform');if(!life)return;
  const nodes=[...life.querySelectorAll('i')];
  const on=Math.round(p*nodes.length);
  nodes.forEach((n,i)=>n.classList.toggle('on',i<on));
  life.style.setProperty('--growth',(0.68+p*.48).toFixed(3));
  life.classList.toggle('hot',state.streak>=6);
}
function renderDots(){
  const wrap=$('streak-dots');wrap.innerHTML='';
  for(let i=1;i<=10;i++){const dot=document.createElement('i');if(i<=state.streak)dot.className='on';wrap.appendChild(dot)}
}
function render(){
  $('round-hud').textContent=`${T.round} ${state.round}/${MAX_ROUNDS}`;
  $('target-hud').textContent=`${T.goal}: ${fmtN(state.target)}`;
  $('goal-value').textContent=fmtN(state.target);
  $('total-value').textContent=fmtN(state.total);
  $('tap-gain').textContent=`+${fmtN(gain())} · ×${multiplier()}`;
  const p=stageProgress();
  $('progress-fill').style.width=(p*100).toFixed(2)+'%';
  renderDots();renderLifeform(p);
  $('gain-button').classList.toggle('streaking',state.streak>=3);
  $('bg').style.setProperty('--bg-opacity',(.2+p*.32).toFixed(3));
  const idle=state.lastTap && performance.now()-state.lastTap>IDLE_GRACE;
  $('drift-status').textContent=idle&&state.total>stageStart()?T.falling(decayPerSecond()):T.holding;
  $('drift-status').classList.toggle('falling',!!idle&&state.total>stageStart());
}
function floating(amount){
  const el=document.createElement('span');el.className='float-gain';el.textContent='+'+fmtN(amount);
  el.style.setProperty('--dx',`${Math.round((Math.random()-.5)*100)}px`);
  $('float-layer').appendChild(el);setTimeout(()=>el.remove(),700);
}
function tap(){
  if(locked||hasOpenScreen()||!state.active)return;
  const now=performance.now();
  const gap=state.lastTap?now-state.lastTap:9999;
  if(gap<260)state.streak=Math.min(10,state.streak+2);
  else if(gap<650)state.streak=Math.min(10,state.streak+1);
  else if(gap<1050)state.streak=Math.max(1,state.streak-1);
  else state.streak=0;
  state.lastTap=now;
  const amount=gain();state.total=Math.min(state.target,state.total+amount);
  floating(amount);
  $('gain-button').classList.add('hit');setTimeout(()=>$('gain-button').classList.remove('hit'),85);
  rewardBackground(now);
  render();save();
  if(state.total>=state.target){locked=true;state.active=false;setTimeout(showMilestone,220)}
}
function showMilestone(){
  locked=false;
  const i=Math.min(state.round-1,T.milestoneTitles.length-1);
  $('milestone-number').textContent=fmtN(state.total);
  $('milestone-title').textContent=T.milestoneTitles[i];
  $('milestone-text').textContent=T.milestoneTexts[i];
  $('continue-button').textContent=state.round>=MAX_ROUNDS?(isES?'VER QUÉ OCURRE':'SEE WHAT HAPPENS'):T.continue;
  closeAll();open('milestone-screen');changeBackground(true);
}
function keepGoing(){
  if(state.round>=MAX_ROUNDS){finish(true);return}
  state.continues++;state.round++;state.target=state.base*Math.pow(2,state.round-1);
  state.total=stageStart();state.streak=0;state.lastTap=0;state.active=true;
  save();closeAll();render();changeBackground(true);scheduleBg();
}
function stopHere(){finish(false)}
function finish(exhausted){
  state.finished=true;state.active=false;save();
  $('result-numbers').innerHTML=`
    <div class="result-num"><small>${T.initial}</small><strong>${fmtN(state.base)}</strong></div>
    <div class="result-arrow">→</div>
    <div class="result-num"><small>${T.final}</small><strong>${fmtN(state.total)}</strong></div>`;
  if(exhausted)$('result-text').textContent=T.exhausted(state.base,state.total);
  else if(state.round===1)$('result-text').textContent=T.stopFirst(state.base);
  else $('result-text').textContent=T.stopLater(state.base,state.total,state.continues);
  $('reflection-text').textContent=T.reflection;
  closeAll();open('result-screen');changeBackground(true);
}
function startNew(){
  const base=Number($('enough-range').value)||250;
  state=fresh(base);save();closeAll();render();changeBackground(true);scheduleBg();
}
function restart(){
  clearSave();state=fresh(Number($('enough-range').value)||250);state.active=false;locked=false;
  closeAll();open('start-screen');render();changeBackground(true);scheduleBg();
}
function resumeIfUseful(){
  const old=read(SAVE,null);if(!old||!Number.isFinite(old.base)||!Number.isFinite(old.target))return false;
  state={...fresh(old.base),...old};
  $('enough-range').value=String(Math.max(100,Math.min(1000,state.base)));
  $('enough-output').textContent=fmtN(state.base);render();
  if(state.finished){finish(false);return true}
  if(state.total>=state.target){state.active=false;showMilestone();return true}
  state.active=true;closeAll();scheduleBg();return true;
}
async function copyLink(button){
  const url=document.querySelector('link[rel=canonical]')?.href||location.href;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);const old=button.textContent;button.textContent=T.copied;setTimeout(()=>button.textContent=old,1400);return}}catch(e){}
  window.prompt(T.copyPrompt,url);
}

// Fondos EIDOS: imágenes fijas + galería. Se usan como parte del ritmo del juego.
const CONTENT=window.EIDOS_SHARED_CONTENT||{images:[]};
function galleryUrl(item){
  const raw=typeof item==='string'?item:String(item?.url||'').trim();
  if(!raw)return'';if(/^(?:https?:)?\/\//i.test(raw)||raw.startsWith('/'))return raw;
  return '/gallery/'+raw.replace(/^\.?\//,'');
}
let IMAGES=[];
let bgIndex=-1,bgLayer=0,lastBgChange=0,nextBgAt=performance.now()+BG_AUTO_MS;
function shuffle(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items}
async function prepareImages(){
  const list=[];
  if(Array.isArray(CONTENT.images))list.push(...CONTENT.images);
  if(Array.isArray(window.EIDOS_IMAGE_MANIFEST))list.push(...window.EIDOS_IMAGE_MANIFEST);

  // Arranca ya con los fondos fijos disponibles; la galería completa puede llegar después.
  IMAGES=shuffle(list.map(galleryUrl).filter(Boolean));
  if(IMAGES.length&&!document.querySelector('#bg img.active'))changeBackground(true);

  if(CONTENT.imagesReady&&typeof CONTENT.imagesReady.then==='function'){
    try{
      await CONTENT.imagesReady;
      if(Array.isArray(CONTENT.images)){
        IMAGES=shuffle(CONTENT.images.concat(window.EIDOS_IMAGE_MANIFEST||[]).map(galleryUrl).filter(Boolean));
      }
    }catch(e){}
  }
}
function scheduleBg(){nextBgAt=performance.now()+BG_AUTO_MS}
let bgRequestToken=0;
function preloadAhead(count=6){
  if(!IMAGES.length)return;
  for(let i=1;i<=Math.min(count,IMAGES.length);i++){
    const idx=(bgIndex+i+IMAGES.length)%IMAGES.length;
    const img=new Image();img.src=IMAGES[idx];
  }
}
function changeBackground(force=false){
  if(!IMAGES.length)return;
  const now=performance.now();
  lastBgChange=now;bgIndex=(bgIndex+1)%IMAGES.length;
  const target=bgLayer?$('bg-a'):$('bg-b'),other=bgLayer?$('bg-b'):$('bg-a');
  const token=++bgRequestToken;
  target.onload=()=>{
    if(token!==bgRequestToken)return;
    other.classList.remove('active');target.classList.add('active');bgLayer=1-bgLayer;
    preloadAhead();
  };
  target.onerror=()=>{
    if(token!==bgRequestToken)return;
    bgIndex=(bgIndex+1)%IMAGES.length;target.src=IMAGES[bgIndex];
  };
  target.src=IMAGES[bgIndex];scheduleBg();
}
function rewardBackground(now){
  // Cada pulsación válida tiene una recompensa visual inmediata.
  // Reiniciamos el reloj automático para que, mientras juegas, manden tus clics.
  changeBackground(true);
  nextBgAt=now+BG_AUTO_MS;
}

function gameLoop(now){
  const dt=Math.min(.08,(now-lastFrame)/1000);lastFrame=now;
  if(state.active&&!locked&&!hasOpenScreen()){
    if(state.lastTap&&now-state.lastTap>IDLE_GRACE&&state.total>stageStart()){
      const before=state.total;state.total=Math.max(stageStart(),state.total-decayPerSecond()*dt);
      if(before!==state.total&&now-lastPaint>70){render();lastPaint=now}
      if(state.streak>0&&now-state.lastTap>1150)state.streak=Math.max(0,state.streak-Math.ceil(dt*5));
    }
    if(now>=nextBgAt)changeBackground(true);
  }else if(now>=nextBgAt&&!hasOpenScreen())changeBackground(true);
  requestAnimationFrame(gameLoop);
}

$('enough-range').addEventListener('input',e=>$('enough-output').textContent=fmtN(Number(e.target.value)));
$('start-button').onclick=startNew;$('gain-button').onclick=tap;$('stop-button').onclick=stopHere;$('continue-button').onclick=keepGoing;
$('reset-btn').onclick=restart;$('play-again').onclick=restart;
$('back-essay').onclick=()=>{try{window.top.location.href=ARTICLE_URL}catch(e){window.location.href=ARTICLE_URL}};$('close-btn').onclick=()=>window.parent.postMessage('cerrar-eidos','*');
$('copy-link-button').onclick=()=>copyLink($('copy-link-button'));$('result-copy').onclick=()=>copyLink($('result-copy'));
window.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&!hasOpenScreen()){e.preventDefault();tap()}});
window.addEventListener('beforeunload',save);

buildLifeform();$('enough-output').textContent=fmtN(Number($('enough-range').value));render();prepareImages();requestAnimationFrame(gameLoop);
if(new URLSearchParams(location.search).get('resume')==='1')resumeIfUseful();
})();
