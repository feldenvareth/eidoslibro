(()=>{'use strict';
const LANG=(document.documentElement.lang||'en').toLowerCase().startsWith('es')?'es':'en';
const ES_TEXT={"Impulse":"Impulso","First connections":"Primeras conexiones","Synapse":"Sinapsis","The network begins to close":"La red comienza a cerrarse","Memory":"Memoria","Anticipate several routes":"Anticipa varios recorridos","Identity":"Identidad","Order begins to matter":"El orden empieza a importar","Consciousness":"Consciencia","Deep and extensive patterns":"Patrones profundos y extensos","The impulse exists, but there is no memory yet.":"El impulso existe, pero todavía no hay memoria.","Synapses form a network. The network begins to preserve a history.":"Las sinapsis forman una red. La red comienza a conservar una historia.","A memory does not reside in one neuron, but in the persistence of a pattern.":"Un recuerdo no reside en una neurona, sino en la persistencia de un patrón.","Identity appears when every part depends on a shared organization.":"La identidad aparece cuando todas las partes dependen de una organización común.","You rebuilt the connectome. It still does not prove that you recovered the one who inhabited it.":"Has reconstruido el conectoma. Sigue sin estar demostrado que hayas recuperado a quien lo habitaba.","The form falls away. The pattern continues.":"La forma cae. El patrón continúa.","No consciousness exists in isolation.":"Ninguna conciencia existe aislada.","Identity does not reside in one connection, but in the pattern as a whole.":"La identidad no reside en una conexión, sino en la totalidad del patrón.","The network remembers even when no neuron remembers on its own.":"La red recuerda incluso cuando ninguna neurona recuerda por sí sola.","Rebuilding the structure does not prove that you recovered the one who inhabited it.":"Reconstruir la estructura no demuestra haber recuperado a quien la habitaba.","Completed: <strong>":"Completados: <strong>","Unlocked: <strong>":"Desbloqueados: <strong>","Current level":"Nivel actual","Completed":"Completado","Unlocked":"Desbloqueado","Locked":"Bloqueado"," · Level ":" · Nivel "," · Best: ":" · Récord: ","Locked · complete the previous depth":"Bloqueado · completa la profundidad anterior","Campaign complete · endless unlocked":"Campaña completa · infinito desbloqueado","Depth complete":"Profundidad completada","Invalid level":"Nivel inválido","Node ":"Núcleo ","Incomplete pattern":"Patrón incompleto","Connect every pair and fill the entire network.":"Conecta todas las parejas y ocupa toda la red.","Connect every pair without crossing fibers.":"Conecta todas las parejas sin cruzar fibras.","Unstable memory":"Memoria inestable","Memorize the colors. Afterwards only correct connections will light up.":"Memoriza los colores. Después solo se iluminarán las conexiones correctas.","MEMORY":"MEMORIA","The colors are gone. Rebuild the pattern before its trace is lost.":"Los colores han desaparecido. Reconstruye el patrón antes de perder su rastro.","Recalling the pattern cost one life.":"Recordar el patrón ha consumido una vida.","Memory recovered":"Recuerdo recuperado","Observe every pair: they will be hidden again in a moment.":"Observa todas las parejas: volverán a ocultarse en un instante.","The colors are hidden again.":"Los colores vuelven a quedar ocultos.","Follow the preserved fiber":"Sigue la fibra conservada","Follow the glowing segment to its other end.":"Recorre el tramo luminoso hasta su otro extremo.","Preserved fiber":"Fibra conservada","That segment belongs to another connection.":"Ese tramo pertenece a otra conexión.","Wrong entry":"Entrada incorrecta","Enter the fixed fiber through one of its ends.":"Entra en la fibra fija por uno de sus extremos.","Required segment skipped":"Tramo obligatorio omitido","This connection must follow the preserved fiber of its color.":"Esta conexión debe recorrer la fibra conservada de su color.","The connection did not belong to the same pattern.":"La conexión no pertenecía al mismo patrón.","Integrity reduced":"Integridad reducida","ENDLESS MODE · ":"MODO INFINITO · ","LEVEL ":"NIVEL "," OF ":" DE ","Completed level":"Nivel completado","Pending level":"Nivel pendiente","REBUILD THE CONNECTIONS · RECOVER THE PATTERN":"RECONSTRUYE LAS CONEXIONES · RECUPERA EL PATRÓN","MEMORIZE THE COLORS · RECOVER THE PATTERN":"MEMORIZA LOS COLORES · RECUPERA EL PATRÓN","First connections established":"Primeras conexiones establecidas","Synapses rebuilt":"Sinapsis reconstruidas","The network begins to stabilize":"La red comienza a estabilizarse","The pattern is almost complete":"El patrón casi está completo","Neural activity restored":"Actividad neuronal restaurada","Degraded connectome":"Conectoma degradado","Connect each pair without crossing or sharing cells.":"Une cada pareja sin cruzar ni compartir casillas.","The first impulses begin to travel through the structure.":"Los primeros impulsos comienzan a recorrer la estructura.","The network begins to preserve a recognizable organization.":"La red empieza a conservar una organización reconocible.","Each new fiber reduces discontinuities in the pattern.":"Cada nueva fibra reduce las discontinuidades del patrón.","Only a few regions remain to be integrated.":"Solo quedan algunas regiones por integrar.","The structure transmits information as a unit again.":"La estructura vuelve a transmitir información como una unidad.","Pattern recovered":"Patrón recuperado","The network transmits information again.":"La red vuelve a transmitir información.","You have rebuilt all 50 campaign patterns. From here the connectome continues without limit and complexity keeps increasing.":"Has reconstruido los 50 patrones de la campaña. A partir de aquí el conectoma continúa sin límite y la complejidad seguirá creciendo.","You have completed this depth. The next pattern rises to ":"Has completado esta profundidad. El siguiente patrón asciende a ","ENDLESS MODE":"MODO INFINITO","Pair highlighted":"Pareja señalada","The two highlighted nodes belong to the same connection.":"Los dos núcleos iluminados pertenecen a la misma conexión.","Three hints cost one life.":"Tres pistas han consumido una vida.","EIDOS · Connectome":"EIDOS · Conectoma","Rebuild the connections. Recover the pattern. How far will you get?":"Reconstruye las conexiones. Recupera el patrón. ¿Hasta dónde conseguirás llegar?","https://www.eidoslibro.com/hiddenegg/games/conectoma/conectomaEN.html":"https://www.eidoslibro.com/hiddenegg/games/conectoma/conectoma.html","Game link copied.":"Enlace del juego copiado.","Copy this link to share the game:":"Copia este enlace para compartir el juego:","Next pattern ":"Siguiente patrón "," · global level ":" · nivel global ","Time ":"Tiempo "," redrawn connections · board ":" conexiones redibujadas · tablero "," · difficulty ":" · dificultad ","Recovered patterns: ":"Patrones recuperados: "," · Collapses: ":" · Colapsos: "," · Memory patterns cleared: ":" · Memorias superadas: ","START":"INICIAR","CONTINUE GAME":"CONTINUAR PARTIDA","COPY LINK":"COPIAR ENLACE","LINK COPIED":"ENLACE COPIADO","Copy this link:":"Copia este enlace:"};
function tr(value){return LANG==='es'?(ES_TEXT[value]??value):value}

const $=id=>document.getElementById(id);
const LEGACY_ES_KEYS={
  'eidos-conectoma-save-v5':'eidos-connectome-save-v5',
  'eidos-conectoma-progress-v5':'eidos-connectome-progress-v5',
  'eidos-conectoma-sound-v1':'eidos-connectome-sound-v1',
  'eidos-conectoma-stats-v1':'eidos-connectome-stats-v1'
};
if(LANG==='es'){
  try{
    Object.entries(LEGACY_ES_KEYS).forEach(([legacy,canonical])=>{
      if(localStorage.getItem(canonical)==null&&localStorage.getItem(legacy)!=null){
        localStorage.setItem(canonical,localStorage.getItem(legacy));
      }
    });
  }catch(e){}
}
const SAVE='eidos-connectome-save-v5',PROGRESS='eidos-connectome-progress-v5',SOUND='eidos-connectome-sound-v1',STATS='eidos-connectome-stats-v1';
const COLORS=['#65d9ff','#f3c85b','#e86f83','#78df9a','#b98cff','#ff9f55','#e7ec72','#59b6a7','#f1a9d2','#8ba7ff'];
const SYMBOLS=['●','◆','▲','■','✦','⬟','✚','◉','✿','⬢'];
const DIFFS=[
{id:'impulso',name:tr('Impulse'),size:[5,5],pairs:[3,4],fill:false,desc:tr('First connections')},
{id:'sinapsis',name:tr('Synapse'),size:[5,6],pairs:[4,5],fill:true,desc:tr('The network begins to close')},
{id:'memoria',name:tr('Memory'),size:[6,7],pairs:[5,7],fill:true,desc:tr('Anticipate several routes')},
{id:'identidad',name:tr('Identity'),size:[7,8],pairs:[7,8],fill:true,desc:tr('Order begins to matter')},
{id:'consciencia',name:tr('Consciousness'),size:[8,10],pairs:[8,10],fill:true,desc:tr('Deep and extensive patterns')}];
const CAMPAIGN_PER_DIFF=10;
const NARRATIVES=[
tr('The impulse exists, but there is no memory yet.'),
tr('Synapses form a network. The network begins to preserve a history.'),
tr('A memory does not reside in one neuron, but in the persistence of a pattern.'),
tr('Identity appears when every part depends on a shared organization.'),
tr('You rebuilt the connectome. It still does not prove that you recovered the one who inhabited it.')
];
const FALLBACK_QUOTES=[tr('The form falls away. The pattern continues.'),tr('No consciousness exists in isolation.'),tr('Identity does not reside in one connection, but in the pattern as a whole.'),tr('The network remembers even when no neuron remembers on its own.'),tr('Rebuilding the structure does not prove that you recovered the one who inhabited it.')];
const SHARED=window.EIDOS_SHARED_CONTENT||{images:[],quotes:[]};
function galleryImageUrl(item){
  const raw=typeof item==='string'?item:String(item?.url||'').trim();
  if(!raw)return '';
  if(/^(?:https?:)?\/\//i.test(raw)||raw.startsWith('/'))return raw;
  return '/gallery/'+raw.replace(/^\.?\//,'');
}
const MANIFEST_IMAGES=Array.isArray(window.EIDOS_IMAGE_MANIFEST)?window.EIDOS_IMAGE_MANIFEST.map(galleryImageUrl).filter(Boolean):[];
const SHARED_IMAGES=Array.isArray(SHARED.images)?SHARED.images.filter(Boolean):[];
const IMAGES=MANIFEST_IMAGES.length?MANIFEST_IMAGES:SHARED_IMAGES;
const QUOTES=Array.isArray(SHARED.quotes)&&SHARED.quotes.length?SHARED.quotes:FALLBACK_QUOTES;
const BG_LAYERS=[$('bg-a'),$('bg-b')];
let bgDeck=[],quoteDeck=[],activeBg=0,lastBg=-1,lastQuote=-1;
const badBgIndexes=new Set();
function shuffle(values){for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values}
function refillBgDeck(){bgDeck=shuffle(IMAGES.map((_,i)=>i).filter(i=>!badBgIndexes.has(i)));if(bgDeck.length>1&&bgDeck[0]===lastBg)[bgDeck[0],bgDeck[1]]=[bgDeck[1],bgDeck[0]]}
function changeBackground(attempt=0){
  if(!IMAGES.length||badBgIndexes.size>=IMAGES.length)return;
  if(!bgDeck.length)refillBgDeck();
  if(!bgDeck.length)return;
  const index=bgDeck.shift(),next=1-activeBg,img=BG_LAYERS[next],old=BG_LAYERS[activeBg];
  img.onload=()=>{img.onload=null;img.onerror=null;lastBg=index;old.classList.remove('active');img.classList.add('active');activeBg=next};
  img.onerror=()=>{img.onload=null;img.onerror=null;badBgIndexes.add(index);img.removeAttribute('src');if(attempt<IMAGES.length-1)changeBackground(attempt+1)};
  img.src=IMAGES[index];
}
function updateBackgroundReveal(pct=0){const bg=$('neural-bg');if(!bg)return;const clamped=Math.max(0,Math.min(100,Number(pct)||0));const opacity=.22+(clamped/100)*.48;bg.style.setProperty('--bg-reveal',opacity.toFixed(3))}
function refillQuoteDeck(){quoteDeck=shuffle(QUOTES.map((_,i)=>i));if(quoteDeck.length>1&&quoteDeck[0]===lastQuote)[quoteDeck[0],quoteDeck[1]]=[quoteDeck[1],quoteDeck[0]]}
function nextQuote(){if(!quoteDeck.length)refillQuoteDeck();const i=quoteDeck.shift();lastQuote=i;return QUOTES[i]||FALLBACK_QUOTES[0]}
let sound=localStorage.getItem(SOUND)!=='off',audio=null;
let progress=read(PROGRESS,{completed:{},best:{},count:{}}),stats=read(STATS,{wins:0,deaths:0,memoryWins:0,hints:0,reveals:0,totalTime:0});
let state=null,timer=null,revealTimer=null;
function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch(e){return f}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function tone(f,d=.08,g=.035,type='sine'){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;audio=audio||new A();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.value=f;v.gain.setValueAtTime(g,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(v).connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}
function openScreen(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
function closeScreen(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashSeed(diff,index){let h=2166136261;for(const ch of diff+':'+index){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function key(p){return p[0]+','+p[1]}
function same(a,b){return a&&b&&a[0]===b[0]&&a[1]===b[1]}
function adjacent(a,b){return a&&b&&Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1}
function neighbors([r,c],rows,cols){const out=[];if(r)out.push([r-1,c]);if(r+1<rows)out.push([r+1,c]);if(c)out.push([r,c-1]);if(c+1<cols)out.push([r,c+1]);return out}
function snake(rows,cols,vertical=false){const p=[];if(!vertical){for(let r=0;r<rows;r++){const range=r%2===0?[...Array(cols).keys()]:[...Array(cols).keys()].reverse();range.forEach(c=>p.push([r,c]))}}else{for(let c=0;c<cols;c++){const range=c%2===0?[...Array(rows).keys()]:[...Array(rows).keys()].reverse();range.forEach(r=>p.push([r,c]))}}return p}
function randomHamiltonian(rows,cols,seed){const rand=rng(seed);let path=snake(rows,cols,rand()<.5);for(let z=0;z<rows*cols*42;z++){const head=rand()<.5,end=head?path[0]:path[path.length-1],candidates=[];for(const n of neighbors(end,rows,cols)){const i=path.findIndex(p=>same(p,n));if(head&&i>1)candidates.push(i);if(!head&&i<path.length-2)candidates.push(i)}if(!candidates.length)continue;const i=candidates[Math.floor(rand()*candidates.length)];path=head?path.slice(0,i).reverse().concat(path.slice(i)):path.slice(0,i+1).concat(path.slice(i+1).reverse())}return path}
function splitPath(path,pairs,seed){const rand=rng(seed^0x9e3779b9),n=path.length;let sizes=Array(pairs).fill(2),remaining=n-pairs*2;while(remaining-->0)sizes[Math.floor(rand()*pairs)]++;for(let i=sizes.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[sizes[i],sizes[j]]=[sizes[j],sizes[i]]}const result=[];let at=0;for(const size of sizes){result.push(path.slice(at,at+size));at+=size}return result}
function countTurns(path){let turns=0;for(let i=2;i<path.length;i++){const a=[path[i-1][0]-path[i-2][0],path[i-1][1]-path[i-2][1]],b=[path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]];if(a[0]!==b[0]||a[1]!==b[1])turns++}return turns}
function evaluateLevel(paths,rows,cols){const lengths=paths.map(p=>p.length),turns=paths.reduce((n,p)=>n+countTurns(p),0),long=Math.max(...lengths),short=Math.min(...lengths),bottlenecks=paths.filter(p=>p.some(([r,c])=>(r===0||c===0||r===rows-1||c===cols-1))).length;return Math.round(paths.length*8+turns*1.6+(long-short)*1.5+bottlenecks*2+rows*cols*.35)}
function specialMode(diff,index,seed){
  if(index<3)return 'normal';
  const rand=rng(seed^0x51f15e);
  let chance=diff==='impulso'?.18:diff==='sinapsis'?.28:diff==='memoria'?.36:.32;
  if(diff==='consciencia'&&index>CAMPAIGN_PER_DIFF){
    const endless=index-CAMPAIGN_PER_DIFF;
    chance=Math.min(.72,.38+(endless-1)*.014);
  }
  return rand()<chance?'memory':'normal';
}
function makeLocked(paths,mode,seed){return paths.map(()=>[])}
function makeLevel(diffId,index){
  const d=DIFFS.find(x=>x.id===diffId),seed=hashSeed(diffId,index),rand=rng(seed);
  let minSize=d.size[0],maxSize=d.size[1],minPairs=d.pairs[0],maxPairsBase=d.pairs[1];
  if(diffId==='consciencia'&&index>CAMPAIGN_PER_DIFF){
    const endless=index-CAMPAIGN_PER_DIFF;
    const growth=Math.min(5,Math.floor((endless-1)/8));
    minSize=Math.min(14,9+growth);
    maxSize=Math.min(14,10+growth);
    minPairs=Math.min(10,8+Math.floor((endless-1)/6));
    maxPairsBase=10;
  }
  const size=minSize+Math.floor(rand()*(maxSize-minSize+1));
  const maxPairs=Math.min(maxPairsBase,Math.floor(size*size/2));
  const pairs=Math.min(maxPairs,minPairs+Math.floor(rand()*(Math.max(0,maxPairs-minPairs)+1)));
  const full=randomHamiltonian(size,size,seed),paths=splitPath(full,pairs,seed),mode=specialMode(diffId,index,seed);
  return{id:diffId+'-'+index,difficulty:diffId,index,rows:size,cols:size,fillAll:d.fill,seed,solution:paths,mode,locked:makeLocked(paths,mode,seed),rating:evaluateLevel(paths,size,size),campaign:index<=CAMPAIGN_PER_DIFF};
}
function validateLevel(l){const seen=new Set();if(!l||!Array.isArray(l.solution))return false;for(const p of l.solution){if(p.length<2)return false;for(let i=0;i<p.length;i++){const k=key(p[i]);if(seen.has(k))return false;seen.add(k);if(i&&Math.abs(p[i][0]-p[i-1][0])+Math.abs(p[i][1]-p[i-1][1])!==1)return false}}return seen.size===l.rows*l.cols}
function nextIndex(diff){return Math.max(1,(progress.count[diff]||0)+1)}
function completedInDiff(diff){let n=0;for(let i=1;i<=CAMPAIGN_PER_DIFF;i++)if(progress.completed[diff+'-'+i])n++;return n}
function diffIndex(diff){return DIFFS.findIndex(d=>d.id===diff)}
function globalCampaignNumber(diff,index){const di=diffIndex(diff);return di<0?index:di*CAMPAIGN_PER_DIFF+index}
function campaignLevelFromGlobal(global){const g=Math.max(1,Math.min(DIFFS.length*CAMPAIGN_PER_DIFF,global));const di=Math.floor((g-1)/CAMPAIGN_PER_DIFF);return{diff:DIFFS[di].id,index:((g-1)%CAMPAIGN_PER_DIFF)+1,global:g}}
function campaignCompletedGlobal(global){const l=campaignLevelFromGlobal(global);return Boolean(progress.completed[l.diff+'-'+l.index])}
function campaignUnlockedGlobal(){const total=DIFFS.length*CAMPAIGN_PER_DIFF;let unlocked=1;for(let g=1;g<=total;g++){if(campaignCompletedGlobal(g))unlocked=Math.min(total,g+1);else break}return unlocked}
function nextCampaignIndex(diff){for(let i=1;i<=CAMPAIGN_PER_DIFF;i++)if(!progress.completed[diff+'-'+i])return i;return CAMPAIGN_PER_DIFF}
function nextCampaignLevel(level){const global=globalCampaignNumber(level.difficulty,level.index);return campaignLevelFromGlobal(Math.min(DIFFS.length*CAMPAIGN_PER_DIFF,global+1))}
function campaignComplete(){return campaignCompletedGlobal(DIFFS.length*CAMPAIGN_PER_DIFF)}
function hasSavedGame(){
  const saved=read(SAVE,null);
  return Boolean(saved&&validateLevel(saved.level));
}
function hasCampaignProgress(){
  return hasSavedGame()||totalCampaignCompleted()>0||campaignUnlockedGlobal()>1||Object.keys(progress.best||{}).length>0;
}
function updateStartUI(){
  $('start-button').textContent=hasCampaignProgress()?tr('CONTINUE GAME'):tr('START');
  const del=$('delete-campaign-button');
  if(del)del.hidden=!hasCampaignProgress();
}
function continueCampaign(){
  const saved=read(SAVE,null);
  if(saved&&validateLevel(saved.level)){
    beginLevel(saved.level,saved);
    closeScreen($('start-screen'));
    return;
  }
  if(campaignComplete()){
    startNew('consciencia',CAMPAIGN_PER_DIFF+1);
    return;
  }
  const next=campaignLevelFromGlobal(campaignUnlockedGlobal());
  startNew(next.diff,next.index);
}
function resetCampaignData(){
  try{localStorage.removeItem(SAVE)}catch(e){}
  progress={completed:{},best:{},count:{}};
  write(PROGRESS,progress);
}
function openDeleteCampaign(){
  if(!hasCampaignProgress())return;
  closeScreen($('levels-screen'));
  openScreen($('delete-campaign-screen'));
}
function cancelDeleteCampaign(){
  closeScreen($('delete-campaign-screen'));
  openScreen($('levels-screen'));
}
function confirmDeleteCampaign(){
  clearInterval(timer);
  clearTimeout(revealTimer);
  resetCampaignData();
  state=null;
  levelsPausedGame=false;
  levelsReturn='start';
  closeScreen($('delete-campaign-screen'));
  closeScreen($('levels-screen'));
  closeScreen($('difficulty-screen'));
  closeScreen($('victory-screen'));
  closeScreen($('game-over-screen'));
  renderDifficulties();
  renderLevelsScreen();
  updateStartUI();
  openScreen($('start-screen'));
}
function normalizeCampaignProgress(){
  progress.completed=progress.completed||{};
  progress.best=progress.best||{};
  progress.count=progress.count||{};
  write(PROGRESS,progress);
}

let levelsReturn='start',levelsPausedGame=false;
function highestCompletedIndex(diff){
  let highest=0;
  for(let i=1;i<=CAMPAIGN_PER_DIFF;i++)if(progress.completed[diff+'-'+i])highest=i;
  return highest;
}
function maxUnlockedIndex(diff){
  const di=diffIndex(diff);
  if(di<0)return 0;
  const stageStart=di*CAMPAIGN_PER_DIFF+1;
  const globalUnlocked=campaignUnlockedGlobal();
  const sequential=Math.max(0,Math.min(CAMPAIGN_PER_DIFF,globalUnlocked-stageStart+1));
  return Math.max(sequential,highestCompletedIndex(diff));
}
function totalCampaignCompleted(){
  return DIFFS.reduce((sum,d)=>sum+completedInDiff(d.id),0);
}
function totalCampaignUnlocked(){
  return DIFFS.reduce((sum,d)=>sum+maxUnlockedIndex(d.id),0);
}
function renderLevelsScreen(){
  const box=$('levels-map');
  const del=$('delete-campaign-button');if(del)del.hidden=!hasCampaignProgress();
  box.innerHTML='';
  $('levels-completed').innerHTML=tr('Completed: <strong>')+totalCampaignCompleted()+'/'+(DIFFS.length*CAMPAIGN_PER_DIFF)+'</strong>';
  $('levels-unlocked').innerHTML=tr('Unlocked: <strong>')+totalCampaignUnlocked()+'/'+(DIFFS.length*CAMPAIGN_PER_DIFF)+'</strong>';
  DIFFS.forEach(d=>{
    const stage=document.createElement('section');
    stage.className='level-stage';
    const head=document.createElement('div');
    head.className='level-stage-head';
    const done=completedInDiff(d.id),max=maxUnlockedIndex(d.id);
    head.innerHTML='<strong>'+d.name+'</strong><span>'+done+'/'+CAMPAIGN_PER_DIFF+'</span>';
    const grid=document.createElement('div');
    grid.className='level-grid';
    for(let i=1;i<=CAMPAIGN_PER_DIFF;i++){
      const completed=Boolean(progress.completed[d.id+'-'+i]);
      const unlocked=i<=max;
      const current=Boolean(state&&state.level.campaign&&state.level.difficulty===d.id&&state.level.index===i);
      const node=document.createElement('button');
      node.type='button';
      node.className='level-node '+(current?'current':completed?'done':unlocked?'unlocked':'locked');
      node.textContent=i;
      const status=current?tr('Current level'):completed?tr('Completed'):unlocked?tr('Unlocked'):tr('Locked');
      const best=progress.best[d.id+'-'+i];
      node.title=status+tr(' · Level ')+i+(best?tr(' · Best: ')+fmt(best):'');
      node.setAttribute('aria-label',node.title);
      if(!unlocked)node.disabled=true;
      else node.onclick=()=>{
        levelsPausedGame=false;
        closeScreen($('levels-screen'));
        startNew(d.id,i);
      };
      grid.appendChild(node);
    }
    stage.append(head,grid);
    box.appendChild(stage);
  });
}
function showLevelsScreen(from='start'){
  levelsReturn=from;
  levelsPausedGame=false;
  if(from==='game'&&state&&state.started){
    state.base=elapsed();
    state.started=0;
    clearInterval(timer);
    levelsPausedGame=true;
    saveGame();
  }
  renderLevelsScreen();
  if(from==='start')closeScreen($('start-screen'));
  if(from==='victory')closeScreen($('victory-screen'));
  if(from==='gameover')closeScreen($('game-over-screen'));
  openScreen($('levels-screen'));
}
function closeLevelsScreen(){
  closeScreen($('levels-screen'));
  if(levelsReturn==='start')openScreen($('start-screen'));
  else if(levelsReturn==='victory')openScreen($('victory-screen'));
  else if(levelsReturn==='gameover')openScreen($('game-over-screen'));
  else if(levelsReturn==='game'&&state){
    if(levelsPausedGame){
      state.started=Date.now();
      clearInterval(timer);
      timer=setInterval(updateHud,500);
      saveGame();
    }
    $('board').focus();
  }
  levelsPausedGame=false;
}
function renderDifficulties(){
  const box=$('difficulty-list');box.innerHTML='';
  DIFFS.forEach((d,di)=>{
    const done=completedInDiff(d.id),available=maxUnlockedIndex(d.id)>0,b=document.createElement('button');
    const next=nextCampaignIndex(d.id);
    b.className='difficulty-card';
    b.disabled=!available;
    const stateText=!available?tr('Locked · complete the previous depth'):done===CAMPAIGN_PER_DIFF?(di===DIFFS.length-1?tr('Campaign complete · endless unlocked'):tr('Depth complete')):`${tr('Next pattern ')}${next}${tr(' · global level ')}${globalCampaignNumber(d.id,next)}`;
    b.innerHTML=`<strong>${d.name}</strong><span>${done}/${CAMPAIGN_PER_DIFF}</span><small>${d.desc}<br>${stateText}</small>`;
    if(available)b.onclick=()=>startNew(d.id,done===CAMPAIGN_PER_DIFF?CAMPAIGN_PER_DIFF:next);
    box.appendChild(b);
  });
}
function startNew(diff,index=null){
  const i=index??nextCampaignIndex(diff);
  if(i<=CAMPAIGN_PER_DIFF){
    const id=diff+'-'+i,global=globalCampaignNumber(diff,i);
    if(global>campaignUnlockedGlobal()&&!progress.completed[id])return;
  }else if(diff!=='consciencia'||!campaignComplete()){
    return;
  }
  const level=makeLevel(diff,i);
  if(!validateLevel(level)){console.error(tr('Invalid level'),level);return}
  progress.count[diff]=Math.max(progress.count[diff]||0,i);
  write(PROGRESS,progress);
  beginLevel(level,null);
  closeScreen($('difficulty-screen'));closeScreen($('start-screen'));closeScreen($('levels-screen'));
}
function beginLevel(level,saved){clearInterval(timer);clearTimeout(revealTimer);if(level.mode==='degraded'){level={...level,mode:'normal',locked:level.solution.map(()=>[])};saved=null}const restored=saved?.paths||level.solution.map(()=>[]);const needsBriefing=level.mode==='memory'&&!saved;state={level,paths:restored,active:null,drawing:false,lastPointer:null,lastClient:null,lockedRun:null,history:[],moves:saved?.moves||0,hints:saved?.hints??3,lives:saved?.lives??3,base:saved?.elapsed||0,started:needsBriefing?0:Date.now(),cursor:[0,0],memoryHidden:level.mode==='memory'&&Boolean(saved),inputLocked:needsBriefing};buildBoard();if(state.memoryHidden)$('board').classList.add('memory-hidden');draw();updateHud();if(!needsBriefing)timer=setInterval(updateHud,500);saveGame();changeBackground();tone(196,.1);setTimeout(()=>tone(294,.13),65);$('board').focus();if(needsBriefing)openScreen($('memory-briefing'));}
function isExactFragment(fragment,path){return fragment.length&&path?.length===fragment.length&&path.every((x,j)=>same(x,fragment[j]))}
function buildBoard(){const l=state.level,b=$('board'),ends=new Map();b.innerHTML='';b.classList.remove('memory-hidden','memory-reveal','keyboard');b.style.gridTemplateColumns=`repeat(${l.cols},1fr)`;b.style.gridTemplateRows=`repeat(${l.rows},1fr)`;l.solution.forEach((p,i)=>{ends.set(key(p[0]),i);ends.set(key(p[p.length-1]),i)});for(let r=0;r<l.rows;r++)for(let c=0;c<l.cols;c++){const e=document.createElement('div');e.className='cell';e.dataset.r=r;e.dataset.c=c;const i=ends.get(r+','+c);if(i!==undefined){const n=document.createElement('span');n.className='node';n.style.setProperty('--c',COLORS[i]);n.style.setProperty('--real-color',COLORS[i]);n.textContent=SYMBOLS[i];n.setAttribute('aria-label',tr('Node ')+(i+1));e.appendChild(n)}if(l.locked?.some(f=>f.some(p=>p[0]===r&&p[1]===c)))e.classList.add('locked-cell');b.appendChild(e)}const labels={normal:[tr('Incomplete pattern'),l.fillAll?tr('Connect every pair and fill the entire network.'):tr('Connect every pair without crossing fibers.')],memory:[tr('Unstable memory'),tr('Memorize the colors. Afterwards only correct connections will light up.')]};$('status-title').textContent=labels[l.mode][0];$('status-text').textContent=labels[l.mode][1];$('mode-badge').textContent=l.mode==='memory'?tr('MEMORY'):'';$('mode-badge').classList.toggle('visible',l.mode==='memory');$('remember-button').classList.toggle('visible',l.mode==='memory');setModeSubtitle(l.mode);positionCursor();renderCampaignMap()}
function startMemoryReveal(){if(!state||state.level.mode!=='memory')return;closeScreen($('memory-briefing'));state.inputLocked=true;state.memoryHidden=false;state.started=Date.now();clearInterval(timer);timer=setInterval(updateHud,500);$('board').classList.remove('memory-hidden');$('board').classList.add('memory-reveal');const curtain=$('memory-curtain'),count=curtain.querySelector('.memory-count');curtain.classList.add('visible');count.textContent='2';tone(330,.12);setTimeout(()=>{if(!state||state.level.mode!=='memory')return;count.textContent='1';tone(390,.1)},1000);revealTimer=setTimeout(()=>{if(!state||state.level.mode!=='memory')return;$('board').classList.remove('memory-reveal');$('board').classList.add('memory-hidden');curtain.classList.remove('visible');state.memoryHidden=true;state.inputLocked=false;$('status-title').textContent=tr('Unstable memory');$('status-text').textContent=tr('The colors are gone. Rebuild the pattern before its trace is lost.');draw();saveGame();tone(210,.16)},2000)}
function revealMemory(cost=true){
  if(!state||state.level.mode!=='memory'||state.inputLocked)return;
  if(cost&&!loseLife(tr('Recalling the pattern cost one life.'),false))return;
  stats.reveals++;
  write(STATS,stats);
  state.inputLocked=true;
  $('board').classList.add('memory-reveal');
  $('status-title').textContent=tr('Memory recovered');
  $('status-text').textContent=tr('Observe every pair: they will be hidden again in a moment.');
  tone(410,.12,.025);
  setTimeout(()=>{
    if(!state)return;
    $('board').classList.remove('memory-reveal');
    state.inputLocked=false;
    $('status-title').textContent=tr('Unstable memory');
    $('status-text').textContent=tr('The colors are hidden again.');
    draw();
    saveGame();
  },850);
}
function cell(r,c){return $('board').querySelector(`[data-r="${r}"][data-c="${c}"]`)}
function center(p){const w=$('board-wrap').getBoundingClientRect(),e=cell(...p).getBoundingClientRect();return[e.left-w.left+e.width/2,e.top-w.top+e.height/2]}
function endpoint(r,c){for(let i=0;i<state.level.solution.length;i++){const p=state.level.solution[i];if(same([r,c],p[0])||same([r,c],p[p.length-1]))return i}return null}
function lockedOwner(r,c){if(state.level.mode!=='degraded')return null;for(let i=0;i<state.level.locked.length;i++)if(state.level.locked[i]?.some(p=>same(p,[r,c])))return i;return null}
function occupant(r,c){for(let i=0;i<state.paths.length;i++)if(state.paths[i].some(p=>same(p,[r,c])))return i;return lockedOwner(r,c)}
function containsLockedFragment(i,path){const fragment=state.level.locked?.[i]||[];if(!fragment.length)return true;const orientations=[fragment,[...fragment].reverse()];return orientations.some(f=>{for(let at=0;at<=path.length-f.length;at++){let ok=true;for(let j=0;j<f.length;j++)if(!same(path[at+j],f[j])){ok=false;break}if(ok)return true}return false})}
function complete(i){const p=state.paths[i],s=state.level.solution[i],ends=p.length>1&&((same(p[0],s[0])&&same(p[p.length-1],s[s.length-1]))||(same(p[0],s[s.length-1])&&same(p[p.length-1],s[0])));return ends&&containsLockedFragment(i,p)}
function isLockedCell(i,r,c){return state.level.locked?.[i]?.some(p=>p[0]===r&&p[1]===c)}
function lockedFragment(i){
  return state.level.locked?.[i]||[];
}
function startLockedRun(i,target){
  const fragment=lockedFragment(i);
  if(!fragment.length)return false;
  let ordered=null;
  if(same(target,fragment[0]))ordered=fragment.map(p=>[...p]);
  else if(same(target,fragment[fragment.length-1]))ordered=[...fragment].reverse().map(p=>[...p]);
  else return false;
  state.lockedRun={color:i,ordered,index:0};
  return true;
}
function lockedRunNext(){
  if(!state.lockedRun)return null;
  const nextIndex=state.lockedRun.index+1;
  return state.lockedRun.ordered[nextIndex]||null;
}
function advanceLockedRun(target){
  const run=state.lockedRun;
  if(!run)return false;
  const expected=lockedRunNext();
  if(!expected||!same(expected,target))return false;
  run.index++;
  if(run.index>=run.ordered.length-1)state.lockedRun=null;
  return true;
}
function inferLockedRun(i,path){
  const fragment=lockedFragment(i);
  if(!fragment.length||!path.length)return null;
  for(const ordered of [fragment,[...fragment].reverse()]){
    for(let start=Math.max(0,path.length-ordered.length);start<path.length;start++){
      let count=0;
      while(start+count<path.length&&count<ordered.length&&same(path[start+count],ordered[count]))count++;
      if(start+count===path.length&&count>0&&count<ordered.length){
        return {color:i,ordered:ordered.map(p=>[...p]),index:count-1};
      }
    }
  }
  return null;
}
function drawLockedFragments(svg){if(state.level.mode!=='degraded')return;state.level.locked.forEach((fragment,i)=>{if(!fragment?.length)return;const pts=fragment.map(x=>center(x).join(',')).join(' ');for(const cls of ['fiber-shadow','fiber locked']){const el=document.createElementNS('http://www.w3.org/2000/svg','polyline');el.setAttribute('points',pts);el.setAttribute('class',cls);el.style.setProperty('--c',COLORS[i]);svg.appendChild(el)}for(const pos of [fragment[0],fragment[fragment.length-1]]){const [cx,cy]=center(pos),cap=document.createElementNS('http://www.w3.org/2000/svg','circle');cap.setAttribute('cx',cx);cap.setAttribute('cy',cy);cap.setAttribute('r',5);cap.setAttribute('class','locked-cap');cap.style.setProperty('--c',COLORS[i]);svg.appendChild(cap)}})}
function draw(){const svg=$('paths'),w=$('board-wrap').clientWidth;svg.setAttribute('viewBox',`0 0 ${w} ${w}`);svg.innerHTML='';drawLockedFragments(svg);state.paths.forEach((p,i)=>{if(!p.length)return;const pts=p.map(x=>center(x).join(',')).join(' '),memoryGray=state.level.mode==='memory'&&state.memoryHidden&&!complete(i);for(const cls of ['fiber-shadow','fiber']){const el=document.createElementNS('http://www.w3.org/2000/svg','polyline');el.setAttribute('points',pts);el.setAttribute('class',cls+(complete(i)?' complete':'')+(memoryGray&&cls==='fiber'?' memory-gray':''));el.style.setProperty('--c',COLORS[i]);svg.appendChild(el)}});state.level.solution.forEach((p,i)=>[p[0],p[p.length-1]].forEach(pos=>cell(...pos).querySelector('.node').classList.toggle('complete',complete(i))));updateHud()}
function snapshot(){
  state.history.push({
    paths:state.paths.map(p=>p.map(x=>[...x])),
    lives:state.lives
  });
  if(state.history.length>100)state.history.shift();
}
function beginPathAt(r,c){
  if(state.inputLocked)return false;
  const i=endpoint(r,c);
  if(i===null){
    invalid();
    return false;
  }
  snapshot();
  if(state.paths[i].length)state.moves++;
  state.paths[i]=[[r,c]];
  state.active=i;
  state.drawing=true;
  state.lastPointer=[r,c];
  state.lockedRun=null;
  tone(220+i*26,.05);
  draw();
  saveGame();
  return true;
}
function lockedBacktrackLength(i,path,target){const fragment=state.level.locked?.[i]||[];if(!fragment.length||path.length<fragment.length+1)return 0;for(const f of [fragment,[...fragment].reverse()]){const start=path.length-f.length;let suffix=true;for(let j=0;j<f.length;j++)if(!same(path[start+j],f[j])){suffix=false;break}if(suffix&&f.length>1&&same(target,f[f.length-2]))return f.length}return 0}
function stepTo(r,c){
  const i=state.active;
  if(i===null||i===undefined||state.inputLocked)return false;

  const p=state.paths[i];
  const target=[r,c];
  const last=p[p.length-1];

  if(same(last,target))return true;
  if(!adjacent(last,target))return false;

  // Backtracking always works. If the user backs out of a fixed segment,
  // reconstruct the traversal state from the remaining path.
  if(p.length>1&&same(p[p.length-2],target)){
    p.pop();
    state.lockedRun=inferLockedRun(i,p);
    draw();
    saveGame();
    return true;
  }

  if(p.some(x=>same(x,target))){
    invalid();
    return false;
  }

  const ep=endpoint(r,c);
  const lock=lockedOwner(r,c);
  const oc=occupant(r,c);

  // While inside a fixed segment, only its next physical cell is valid.
  if(state.lockedRun){
    if(state.lockedRun.color!==i||!advanceLockedRun(target)){
      invalid();
      $('status-title').textContent=tr('Follow the preserved fiber');
      $('status-text').textContent=tr('Follow the glowing segment to its other end.');
      return false;
    }
    p.push(target);
    draw();
    tone(345+i*18,.045,.018);
    saveGame();
    return true;
  }

  // Entering a fixed segment is only possible through one of its endpoints.
  if(lock!==null){
    if(lock!==i){
      invalid();
      $('status-title').textContent=tr('Preserved fiber');
      $('status-text').textContent=tr('That segment belongs to another connection.');
      return false;
    }
    if(!startLockedRun(i,target)){
      invalid();
      $('status-title').textContent=tr('Wrong entry');
      $('status-text').textContent=tr('Enter the fixed fiber through one of its ends.');
      return false;
    }
    p.push(target);
    // A one-cell fixed fragment is already fully traversed.
    if(state.lockedRun&&state.lockedRun.ordered.length===1)state.lockedRun=null;
    draw();
    tone(345+i*18,.06,.02);
    saveGame();
    return true;
  }

  if(oc!==null&&oc!==i){
    invalid();
    return false;
  }

  if(ep!==null&&ep!==i){
    if(state.level.mode==='memory'){
      p.push(target);
      draw();
      wrongMemoryConnection(i);
      return false;
    }
    invalid();
    return false;
  }

  if(complete(i)){
    invalid();
    return false;
  }

  p.push(target);

  // A degraded connection is valid only if it has physically crossed its
  // complete fixed fragment.
  if(ep===i&&!complete(i)&&lockedFragment(i).length){
    p.pop();
    invalid();
    $('status-title').textContent=tr('Required segment skipped');
    $('status-text').textContent=tr('This connection must follow the preserved fiber of its color.');
    draw();
    saveGame();
    return false;
  }

  draw();
  tone(280+i*18,.02,.012);
  saveGame();

  if(complete(i)){
    tone(430,.09);
    setTimeout(()=>tone(620,.12),65);
    state.active=null;
    state.drawing=false;
    state.lockedRun=null;
    checkWin();
  }
  return true;
}
function wrongMemoryConnection(i){tone(95,.18,.035,'square');state.active=null;state.drawing=false;setTimeout(()=>{if(!state)return;state.paths[i]=[];draw();loseLife(tr('The connection did not belong to the same pattern.'),true);saveGame()},250)}
function loseLife(message,flash=true){if(!state)return false;state.lives=Math.max(0,state.lives-1);$('status-title').textContent=tr('Integrity reduced');$('status-text').textContent=message;if(flash)invalid();updateHud();if(state.lives<=0){clearInterval(timer);state.started=0;stats.deaths++;write(STATS,stats);try{localStorage.removeItem(SAVE)}catch(e){}setTimeout(()=>openScreen($('game-over-screen')),450);return false}return true}
function eventCell(e){
  return clientPointToCell(e.clientX,e.clientY);
}
function clientPointToCell(clientX,clientY){
  const b=$('board').getBoundingClientRect();
  return[
    Math.max(0,Math.min(state.level.rows-1,Math.floor((clientY-b.top)/b.height*state.level.rows))),
    Math.max(0,Math.min(state.level.cols-1,Math.floor((clientX-b.left)/b.width*state.level.cols)))
  ];
}
function sampledCells(fromClient,toClient){
  const b=$('board').getBoundingClientRect();
  const cellW=b.width/state.level.cols;
  const cellH=b.height/state.level.rows;
  const dx=toClient.x-fromClient.x;
  const dy=toClient.y-fromClient.y;
  const distance=Math.hypot(dx,dy);
  const stepSize=Math.max(2,Math.min(cellW,cellH)*.22);
  const steps=Math.max(1,Math.ceil(distance/stepSize));
  const cells=[];
  let previous=null;
  for(let n=1;n<=steps;n++){
    const t=n/steps;
    const cellPos=clientPointToCell(
      fromClient.x+dx*t,
      fromClient.y+dy*t
    );
    if(!previous||!same(previous,cellPos)){
      cells.push(cellPos);
      previous=cellPos;
    }
  }
  return cells;
}
$('board-wrap').addEventListener('pointerdown',e=>{
  if(!state||state.inputLocked||e.button>0)return;
  e.preventDefault();
  $('board-wrap').setPointerCapture?.(e.pointerId);
  state.lastClient={x:e.clientX,y:e.clientY};
  beginPathAt(...eventCell(e));
});
$('board-wrap').addEventListener('pointermove',e=>{
  if(!state?.drawing||state.inputLocked)return;
  e.preventDefault();
  const current={x:e.clientX,y:e.clientY};
  const previous=state.lastClient||current;
  const cells=sampledCells(previous,current);
  for(const q of cells){
    if(!state.drawing)break;
    const last=state.paths[state.active]?.at(-1);
    if(last&&same(last,q))continue;

    // A diagonal pointer crossing can expose two possible orthogonal orders.
    // Try the sampled cell first; if it is diagonal from the path end,
    // try the two legal corner cells without terminating the gesture.
    if(last&&!adjacent(last,q)){
      const corners=[[last[0],q[1]],[q[0],last[1]]]
        .filter(x=>x[0]>=0&&x[0]<state.level.rows&&x[1]>=0&&x[1]<state.level.cols);
      let advanced=false;
      for(const corner of corners){
        if(adjacent(last,corner)&&stepTo(...corner)){
          advanced=true;
          break;
        }
      }
      if(!advanced)continue;
    }

    if(state.drawing&&state.active!==null){
      const now=state.paths[state.active]?.at(-1);
      if(now&&!same(now,q)&&adjacent(now,q))stepTo(...q);
    }
  }
  state.lastClient=current;
});
window.addEventListener('pointerup',()=>{
  if(state){
    state.drawing=false;
    state.active=null;
    state.lastPointer=null;
    state.lastClient=null;
    state.lockedRun=null;
  }
});
window.addEventListener('pointercancel',()=>{
  if(state){
    state.drawing=false;
    state.active=null;
    state.lastPointer=null;
    state.lastClient=null;
    state.lockedRun=null;
  }
});
function invalid(){const f=$('flash');f.classList.remove('bad');void f.offsetWidth;f.classList.add('bad');tone(105,.08,.018,'square')}
function used(){const cells=new Set();state.paths.forEach(p=>p.forEach(x=>cells.add(key(x))));if(state.level.mode==='degraded')state.level.locked.forEach(f=>f.forEach(x=>cells.add(key(x))));return cells.size}
function elapsed(){return state.base+(state.started?Date.now()-state.started:0)}
function fmt(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function renderCampaignMap(){
  if(!state)return;
  const box=$('campaign-map'),label=$('campaign-current-label'),infinite=!state.level.campaign;
  box.innerHTML='';
  const global=globalCampaignNumber(state.level.difficulty,state.level.index);
  label.textContent=infinite
    ?tr('ENDLESS MODE · ')+(state.level.index-CAMPAIGN_PER_DIFF)
    :tr('LEVEL ')+global+tr(' OF ')+(DIFFS.length*CAMPAIGN_PER_DIFF);
  for(let i=1;i<=CAMPAIGN_PER_DIFF;i++){
    const n=document.createElement('span');
    const done=Boolean(progress.completed[state.level.difficulty+'-'+i]);
    const current=!infinite&&state.level.index===i;
    n.className='campaign-node '+(current?'current':done?'done':'future');
    n.textContent=i;
    n.title=current?tr('Current level'):done?tr('Completed level'):tr('Pending level');
    n.setAttribute('aria-label',n.title+' '+i);
    box.appendChild(n);
  }
}
function setModeSubtitle(mode){
  const subtitles={
    normal:tr('REBUILD THE CONNECTIONS · RECOVER THE PATTERN'),
    memory:tr('MEMORIZE THE COLORS · RECOVER THE PATTERN'),
    degraded:tr('REBUILD THE CONNECTIONS · RECOVER THE PATTERN')
  };
  $('subtitle').textContent=subtitles[mode]||subtitles.normal;
}
function updateNeuralProgress(pct){
  $('progress-fill').style.width=pct+'%';
  const activePath=$('mini-link-active');
  if(activePath)activePath.style.strokeDashoffset=String(Math.max(0,100-pct));
  document.querySelectorAll('#mini-connectome .mini-node').forEach(node=>{
    const threshold=Number(node.dataset.threshold)||0;
    node.classList.toggle('active',pct>=threshold&&pct<100);
    node.classList.toggle('complete',pct>=100);
  });
}
function updateProgressStatus(pct){
  if(!state)return;
  const genericTitles=new Set([
    tr('Incomplete pattern'),
    tr('First connections established'),
    tr('Synapses rebuilt'),
    tr('The network begins to stabilize'),
    tr('The pattern is almost complete'),
    tr('Neural activity restored'),
    tr('Degraded connectome'),
    tr('Unstable memory')
  ]);
  if(!genericTitles.has($('status-title').textContent))return;
  let title,text;
  if(pct<12){
    title=tr('Incomplete pattern');
    text=state.level.fillAll?tr('Connect every pair and fill the entire network.'):tr('Connect each pair without crossing or sharing cells.');
  }else if(pct<32){
    title=tr('First connections established');
    text=tr('The first impulses begin to travel through the structure.');
  }else if(pct<55){
    title=tr('Synapses rebuilt');
    text=tr('The network begins to preserve a recognizable organization.');
  }else if(pct<78){
    title=tr('The network begins to stabilize');
    text=tr('Each new fiber reduces discontinuities in the pattern.');
  }else if(pct<100){
    title=tr('The pattern is almost complete');
    text=tr('Only a few regions remain to be integrated.');
  }else{
    title=tr('Neural activity restored');
    text=tr('The structure transmits information as a unit again.');
  }
  $('status-title').textContent=title;
  $('status-text').textContent=text;
}
function updateHud(){
  if(!state)return;
  const l=state.level;
  const d=DIFFS.find(x=>x.id===l.difficulty);
  const pct=Math.round(used()/(l.rows*l.cols)*100);
  $('level-el').textContent=l.campaign?globalCampaignNumber(l.difficulty,l.index):'∞'+(l.index-CAMPAIGN_PER_DIFF);
  $('difficulty-el').textContent=d.name;
  $('time-el').textContent=fmt(elapsed());
  updateNeuralProgress(pct);
  updateProgressStatus(pct);
  updateBackgroundReveal(pct);
  $('seed-label').textContent=pct+'% · '+l.rows+'×'+l.cols+' · D'+l.rating;
  $('hint-count').textContent=state.hints;
  $('undo-button').disabled=!state.history.length;
  $('lives-el').textContent=state.lives>0?'♥ '.repeat(state.lives).trim():'—';
  const best=progress.best[l.id];
  $('best-el').textContent=best?fmt(best):'—';
}
function checkWin(){if(!state.paths.every((_,i)=>complete(i)))return;if(state.level.fillAll&&used()!==state.level.rows*state.level.cols)return;clearInterval(timer);state.base=elapsed();state.started=0;const id=state.level.id;progress.completed[id]=true;if(!progress.best[id]||state.base<progress.best[id])progress.best[id]=state.base;stats.wins++;stats.totalTime+=state.base;if(state.level.mode==='memory')stats.memoryWins++;write(PROGRESS,progress);write(STATS,stats);try{localStorage.removeItem(SAVE)}catch(e){}$('status-title').textContent=tr('Pattern recovered');$('status-text').textContent=tr('The network transmits information again.');tone(262,.25);setTimeout(()=>tone(392,.3),130);setTimeout(()=>tone(587,.4),280);setTimeout(showVictory,650)}
function showVictory(){
  changeBackground();
  $('victory-stats').textContent=`${tr('Time ')}${fmt(state.base)} · ${state.moves}${tr(' redrawn connections · board ')}${state.level.rows}×${state.level.cols}${tr(' · difficulty ')}${state.level.rating}`;
  $('victory-quote').textContent=nextQuote();
  const narrative=$('narrative-copy');
  const di=DIFFS.findIndex(d=>d.id===state.level.difficulty);
  const global=state.level.campaign?globalCampaignNumber(state.level.difficulty,state.level.index):50+(state.level.index-CAMPAIGN_PER_DIFF);
  const finalCampaign=state.level.campaign&&global===DIFFS.length*CAMPAIGN_PER_DIFF;
  const depthEnd=state.level.campaign&&state.level.index===CAMPAIGN_PER_DIFF;
  const milestone=state.level.campaign&&global%5===0;
  narrative.hidden=!(milestone||depthEnd||finalCampaign);
  if(finalCampaign){
    narrative.textContent=tr('You have rebuilt all 50 campaign patterns. From here the connectome continues without limit and complexity keeps increasing.');
  }else if(depthEnd){
    const next=campaignLevelFromGlobal(global+1);
    narrative.textContent=tr('You have completed this depth. The next pattern rises to ')+DIFFS[diffIndex(next.diff)].name+'.';
  }else{
    narrative.textContent=milestone?NARRATIVES[di]:'';
  }
  $('global-stats').textContent=`${tr('Recovered patterns: ')}${stats.wins}${tr(' · Collapses: ')}${stats.deaths}${tr(' · Memory patterns cleared: ')}${stats.memoryWins}`;
  $('next-button').hidden=finalCampaign;
  $('level-up-button').hidden=true;
  $('infinite-button').hidden=!finalCampaign;
  $('infinite-button').textContent=tr('ENDLESS MODE');
  renderCampaignMap();
  openScreen($('victory-screen'));
}
function undo(){
  const h=state.history.pop();
  if(!h)return;
  state.paths=h.paths;
  state.lives=h.lives;
  state.active=null;
  state.drawing=false;
  state.lastPointer=null;
  state.lastClient=null;
  state.lockedRun=null;
  draw();
  saveGame();
  tone(170,.06);
}
function hint(){
  if(!state||state.inputLocked)return;
  const i=state.paths.findIndex((_,j)=>!complete(j));
  if(i<0)return;
  state.hints=Math.max(0,state.hints-1);
  stats.hints++;
  write(STATS,stats);
  const sol=state.level.solution[i];
  const endpoints=[sol[0],sol[sol.length-1]];
  endpoints.forEach(pos=>{
    const node=cell(...pos)?.querySelector('.node');
    if(node)node.animate([
      {transform:'translate(-50%,-50%) scale(1)',filter:'brightness(1)'},
      {transform:'translate(-50%,-50%) scale(1.32)',filter:'brightness(1.8)'},
      {transform:'translate(-50%,-50%) scale(1)',filter:'brightness(1)'}
    ],{duration:1500,easing:'ease-in-out'});
  });
  $('status-title').textContent=tr('Pair highlighted');
  $('status-text').textContent=tr('The two highlighted nodes belong to the same connection.');
  tone(520,.1,.025);
  setTimeout(()=>tone(680,.12,.022),90);
  if(state.hints===0){
    const alive=loseLife(tr('Three hints cost one life.'),false);
    if(alive)state.hints=3;
  }
  updateHud();
  saveGame();
}
function saveGame(){if(!state)return;write(SAVE,{level:state.level,paths:state.paths,moves:state.moves,hints:state.hints,lives:state.lives,elapsed:elapsed()});updateStartUI()}
async function shareGame(){
  const url=tr('https://www.eidoslibro.com/hiddenegg/games/conectoma/conectomaEN.html');
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(url);
      const btn=$('share-button'),original=btn.textContent;
      btn.textContent=tr('LINK COPIED');
      setTimeout(()=>{btn.textContent=original},1500);
      return;
    }
  }catch(e){}
  window.prompt(tr('Copy this link:'),url);
}
function resume(){const s=read(SAVE,null);if(!s||!validateLevel(s.level))return;beginLevel(s.level,s);closeScreen($('start-screen'))}
function positionCursor(){if(!state)return;const e=cell(...state.cursor);if(!e)return;const b=$('board').getBoundingClientRect(),r=e.getBoundingClientRect(),c=$('cursor');c.style.left=r.left-b.left+'px';c.style.top=r.top-b.top+'px';c.style.width=r.width+'px';c.style.height=r.height+'px'}
window.addEventListener('keydown',e=>{if(!state||state.inputLocked||document.querySelector('.screen.open'))return;const dirs={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};if(dirs[e.key]){e.preventDefault();$('board').classList.add('keyboard');const d=dirs[e.key];state.cursor=[Math.max(0,Math.min(state.level.rows-1,state.cursor[0]+d[0])),Math.max(0,Math.min(state.level.cols-1,state.cursor[1]+d[1]))];positionCursor();if(state.drawing)stepTo(...state.cursor)}else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!state.drawing)beginPathAt(...state.cursor);else{state.drawing=false;state.active=null}}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo()}else if(e.key.toLowerCase()==='r'&&state.level.mode==='memory'){e.preventDefault();revealMemory(true)}});
window.addEventListener('resize',()=>{if(state){draw();positionCursor()}});
$('start-button').onclick=continueCampaign;
$('start-levels-button').onclick=()=>showLevelsScreen('start');$('share-button').onclick=shareGame;$('levels-button').onclick=()=>showLevelsScreen('game');$('levels-back').onclick=closeLevelsScreen;
$('delete-campaign-button').onclick=openDeleteCampaign;
$('confirm-delete-campaign').onclick=confirmDeleteCampaign;
$('cancel-delete-campaign').onclick=cancelDeleteCampaign;
$('difficulty-back').onclick=()=>closeScreen($('difficulty-screen'));
$('undo-button').onclick=undo;
$('hint-button').onclick=hint;
$('remember-button').onclick=()=>revealMemory(true);
$('memory-begin-button').onclick=startMemoryReveal;
$('new-button').onclick=()=>{
  if(!state)return;
  if(state.level.campaign){
    const next=campaignLevelFromGlobal(campaignUnlockedGlobal());
    startNew(next.diff,next.index);
  }else{
    startNew('consciencia',state.level.index+1);
  }
};
$('next-button').onclick=()=>{
  closeScreen($('victory-screen'));
  if(state.level.campaign){
    const next=nextCampaignLevel(state.level);
    startNew(next.diff,next.index);
  }else{
    startNew('consciencia',state.level.index+1);
  }
};
$('level-up-button').onclick=()=>{};
$('infinite-button').onclick=()=>{
  if(!campaignComplete())return;
  closeScreen($('victory-screen'));
  startNew('consciencia',CAMPAIGN_PER_DIFF+1);
};
$('replay-button').onclick=()=>{const l=state.level;closeScreen($('victory-screen'));beginLevel(l,null)};
$('victory-levels-button').onclick=()=>showLevelsScreen('victory');$('menu-button').onclick=()=>{closeScreen($('victory-screen'));renderDifficulties();openScreen($('difficulty-screen'))};
$('retry-level-button').onclick=()=>{const l=state.level;closeScreen($('game-over-screen'));beginLevel(l,null)};
$('game-over-levels-button').onclick=()=>showLevelsScreen('gameover');$('game-over-menu-button').onclick=()=>{closeScreen($('game-over-screen'));renderDifficulties();openScreen($('difficulty-screen'))};
$('sound-button').onclick=()=>{sound=!sound;localStorage.setItem(SOUND,sound?'on':'off');$('sound-button').textContent=sound?'♪':'∕';if(sound)tone(440,.1)};
$('sound-button').textContent=sound?'♪':'∕';
const banner=$('consent-banner');$('consent-accept').onclick=()=>{localStorage.setItem('consentGiven','true');banner.hidden=true;window.loadEidosAnalytics?.()};$('consent-reject').onclick=()=>{localStorage.setItem('consentGiven','false');banner.hidden=true};try{const c=localStorage.getItem('consentGiven');banner.hidden=c==='true'||c==='false'}catch(e){banner.hidden=false}
normalizeCampaignProgress();renderDifficulties();updateStartUI();changeBackground();
})();
