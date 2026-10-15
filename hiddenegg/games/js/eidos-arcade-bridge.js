/* EIDOS Arcade Bridge — five-game integration, uses the existing EidosRecordsUI and Worker.
   No changes to the global API or existing leaderboards. */
(function(global){
  'use strict';
  function create(config){
    const es=String(config.language||'es').startsWith('es');
    const key='eidos-arcade-pending-'+config.gameId+'-v1';
    const stages=Array.isArray(config.stages) && config.stages.length ? config.stages :
      Array.from({length:2000},(_,i)=>({value:i+1,name:(es?'Nivel ':'Level ')+(i+1)}));
    const hideStyle=document.createElement('style');hideStyle.textContent='[data-eidos-register][hidden]{display:none!important}';document.head.appendChild(hideStyle);
    const ui=global.EidosRecordsUI?.init({gameId:config.gameId,language:es?'es':'en',stages,
      labels:{stage:config.stageLabel||(es?'NIVEL ALCANZADO':'LEVEL REACHED'),score:config.scoreLabel||(es?'PUNTOS':'POINTS'),order:config.orderLabel||(es?'MAYOR NIVEL · MAYOR EFICIENCIA':'HIGHEST LEVEL · BEST EFFICIENCY')}});
    let pending=null, memory=null, prompting=false;
    try{pending=JSON.parse(localStorage.getItem(key)||'null');}catch(_){};
    if(pending && !(Number.isSafeInteger(pending.score)&&pending.score>0 && Number.isSafeInteger(pending.stage)&&pending.stage>=1&&pending.stage<=1000000))pending=null;
    const view=()=>{if(ui)void ui.view();};
    function update(){document.querySelectorAll('[data-eidos-register]').forEach(b=>{b.hidden=!pending;});}
    function capture(stage,score){
      stage=Number(stage);score=Number(score);
      if(!Number.isSafeInteger(stage)||stage<1||stage>1000000||!Number.isSafeInteger(score)||score<1||score>10000000)return false;
      pending={stage,score,at:new Date().toISOString()};memory=pending;
      try{localStorage.setItem(key,JSON.stringify(pending));}catch(_){}
      update();return true;
    }
    async function offer(){
      if(!ui || !pending || prompting)return false;
      prompting=true;
      try{
        // Reuse the session opened at the beginning of the run: the server's timing checks require the original session age.
        const ok=await ui.promptScore(pending.score,{stage:pending.stage});
        if(!ok){global.alert(es?'Esta marca todavía no entra en el TOP 20. Puedes seguir jugando.':'This score is not yet in the Top 20. Keep playing.');}
        return ok;
      }catch(err){console.warn('EIDOS: unable to open record entry',err);return false;}
      finally{prompting=false;}
    }
    document.querySelectorAll('[data-eidos-view]').forEach(el=>el.addEventListener('click',view));
    document.querySelectorAll('[data-eidos-register]').forEach(el=>el.addEventListener('click',()=>void offer()));
    update();
    return {view,offer,capture, start:()=>ui?.startSession(), isOpen:()=>Boolean(ui?.isOpen()), hasMark:()=>Boolean(pending)};
  }
  global.EidosArcadeBridge={create};
})(window);
