
(() => {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grid = document.getElementById('eidos-grid');
  const lightbox = document.getElementById('lightbox');
  const figure = lightbox?.querySelector('.lightbox__figure');
  const lightboxImage = document.getElementById('lightbox-image');

  const effects = [
    'fade','zoom','drift-left','drift-right','rise','fall','flip-x','flip-y',
    'orbit','blur','depth','diagonal','curtain','iris','swing','twist',
    'pan','prism','collapse','corner','glide','dissolve','focus','exposure',
    'soft-wipe','parallax','vignette','reveal-up','diamond','pixel-dissolve',
    'pixel-build','digital-mosaic','random-tiles','wave-tiles','scan-lines',
    'vertical-scan','data-glitch','signal-loss','fragmentation','venetian',
    'checkerboard','radial-pixels','compression','memory-corruption',
    'pixel-fusion','pixel-crystallize','organic-erosion','organic-burn-map',
    'grid-flip-3d','quadrant-escape','shutter-cascade','column-rain',
    'pinwheel','cross-split','spiral-tiles','domino-tiles','center-fold',
    'slice-shuffle','ripple-rings','hex-dissolve'
  ];

  let effectQueue = [];
  let previousSrc = '';
  let mutationBusy = false;

  function shuffled(items){
    const a=[...items];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function nextEffect(){
    if(!effectQueue.length) effectQueue=shuffled(effects);
    return effectQueue.shift();
  }

  function pair(name){
    const basic = {
      fade:[[{opacity:1},{opacity:0}],[{opacity:0},{opacity:1}]],
      zoom:[[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.28)',filter:'blur(7px)'}],[{opacity:0,transform:'scale(.72)',filter:'blur(9px)'},{opacity:1,transform:'scale(1)',filter:'none'}]],
      'drift-left':[[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-34%) scale(.92)'}],[{opacity:0,transform:'translateX(38%) scale(1.06)'},{opacity:1,transform:'translateX(0) scale(1)'}]],
      'drift-right':[[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(34%) scale(.92)'}],[{opacity:0,transform:'translateX(-38%) scale(1.06)'},{opacity:1,transform:'translateX(0) scale(1)'}]],
      rise:[[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-30%) scale(.9)'}],[{opacity:0,transform:'translateY(35%) scale(1.06)'},{opacity:1,transform:'none'}]],
      fall:[[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(30%) scale(.9)'}],[{opacity:0,transform:'translateY(-35%) scale(1.06)'},{opacity:1,transform:'none'}]],
      'flip-x':[[{opacity:1,transform:'perspective(900px) rotateX(0)'},{opacity:0,transform:'perspective(900px) rotateX(86deg)'}],[{opacity:0,transform:'perspective(900px) rotateX(-86deg)'},{opacity:1,transform:'none'}]],
      'flip-y':[[{opacity:1,transform:'perspective(900px) rotateY(0)'},{opacity:0,transform:'perspective(900px) rotateY(-86deg)'}],[{opacity:0,transform:'perspective(900px) rotateY(86deg)'},{opacity:1,transform:'none'}]],
      orbit:[[{opacity:1,transform:'rotate(0) scale(1)'},{opacity:0,transform:'rotate(-15deg) translate(-10%,9%) scale(.65)'}],[{opacity:0,transform:'rotate(15deg) translate(10%,-9%) scale(1.25)'},{opacity:1,transform:'none'}]],
      blur:[[{opacity:1,filter:'blur(0)'},{opacity:0,filter:'blur(26px)',transform:'scale(1.05)'}],[{opacity:0,filter:'blur(30px)',transform:'scale(.9)'},{opacity:1,filter:'blur(0)',transform:'scale(1)'}]],
      depth:[[{opacity:1,transform:'perspective(1000px) translateZ(0)'},{opacity:0,transform:'perspective(1000px) translateZ(-500px) rotateX(10deg)'}],[{opacity:0,transform:'perspective(1000px) translateZ(380px) rotateX(-10deg)'},{opacity:1,transform:'none'}]],
      diagonal:[[{opacity:1,transform:'none'},{opacity:0,transform:'translate(-38%,-38%) rotate(-7deg) scale(.78)'}],[{opacity:0,transform:'translate(42%,42%) rotate(7deg) scale(1.16)'},{opacity:1,transform:'none'}]],
      curtain:[[{opacity:1,clipPath:'inset(0)'},{opacity:0,clipPath:'inset(0 50% 0 50%)'}],[{opacity:1,clipPath:'inset(0 50% 0 50%)'},{opacity:1,clipPath:'inset(0)'}]],
      iris:[[{opacity:1,clipPath:'circle(72% at 50% 50%)'},{opacity:0,clipPath:'circle(0% at 50% 50%)'}],[{opacity:1,clipPath:'circle(0% at 50% 50%)'},{opacity:1,clipPath:'circle(72% at 50% 50%)'}]],
      swing:[[{opacity:1,transformOrigin:'0 50%',transform:'perspective(900px) rotateY(0)'},{opacity:0,transformOrigin:'0 50%',transform:'perspective(900px) rotateY(62deg)'}],[{opacity:0,transformOrigin:'100% 50%',transform:'perspective(900px) rotateY(-62deg)'},{opacity:1,transform:'none'}]],
      twist:[[{opacity:1,transform:'none'},{opacity:0,transform:'rotate(-22deg) scale(.45)',filter:'blur(7px)'}],[{opacity:0,transform:'rotate(22deg) scale(1.35)',filter:'blur(7px)'},{opacity:1,transform:'none',filter:'none'}]],
      pan:[[{opacity:1,transform:'translateX(0) scale(1.03)'},{opacity:0,transform:'translateX(-14%) scale(1.08)'}],[{opacity:0,transform:'translateX(14%) scale(1.08)'},{opacity:1,transform:'none'}]],
      prism:[[{opacity:1,filter:'none'},{opacity:0,filter:'saturate(2) hue-rotate(28deg) blur(4px)',transform:'skewX(7deg)'}],[{opacity:0,filter:'saturate(2) hue-rotate(-28deg) blur(4px)',transform:'skewX(-7deg)'},{opacity:1,filter:'none',transform:'none'}]],
      collapse:[[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.05)'}],[{opacity:0,transform:'scale(.05)'},{opacity:1,transform:'scale(1)'}]],
      corner:[[{opacity:1,clipPath:'inset(0)'},{opacity:0,clipPath:'inset(0 100% 100% 0)'}],[{opacity:1,clipPath:'inset(100% 0 0 100%)'},{opacity:1,clipPath:'inset(0)'}]],
      glide:[[{opacity:1,transform:'translateX(0) skewX(0)'},{opacity:0,transform:'translateX(-45%) skewX(10deg)'}],[{opacity:0,transform:'translateX(45%) skewX(-10deg)'},{opacity:1,transform:'none'}]],
      dissolve:[[{opacity:1,filter:'contrast(1)'},{opacity:0,filter:'contrast(2.2) blur(9px)'}],[{opacity:0,filter:'contrast(2.2) blur(9px)'},{opacity:1,filter:'none'}]],
      focus:[[{opacity:1,filter:'blur(0)'},{opacity:0,filter:'blur(18px)',transform:'scale(.95)'}],[{opacity:0,filter:'blur(18px)',transform:'scale(1.08)'},{opacity:1,filter:'blur(0)',transform:'scale(1)'}]],
      exposure:[[{opacity:1,filter:'brightness(1)'},{opacity:0,filter:'brightness(2.8) contrast(.7)'}],[{opacity:0,filter:'brightness(2.8) contrast(.7)'},{opacity:1,filter:'brightness(1)'}]],
      'soft-wipe':[[{opacity:1,clipPath:'inset(0)'},{opacity:0,clipPath:'inset(0 100% 0 0)'}],[{opacity:1,clipPath:'inset(0 0 0 100%)'},{opacity:1,clipPath:'inset(0)'}]],
      parallax:[[{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:'translateX(-12%) scale(.92)'}],[{opacity:0,transform:'translateX(22%) scale(1.12)'},{opacity:1,transform:'none'}]],
      vignette:[[{opacity:1,filter:'brightness(1)'},{opacity:0,filter:'brightness(.18) blur(4px)',transform:'scale(.97)'}],[{opacity:0,filter:'brightness(.18) blur(4px)',transform:'scale(1.03)'},{opacity:1,filter:'none',transform:'none'}]],
      'reveal-up':[[{opacity:1,clipPath:'inset(0)'},{opacity:0,clipPath:'inset(100% 0 0 0)'}],[{opacity:1,clipPath:'inset(100% 0 0 0)'},{opacity:1,clipPath:'inset(0)'}]],
      diamond:[[{opacity:1,clipPath:'polygon(50% 0,100% 50%,50% 100%,0 50%)'},{opacity:0,clipPath:'polygon(50% 50%,50% 50%,50% 50%,50% 50%)'}],[{opacity:1,clipPath:'polygon(50% 50%,50% 50%,50% 50%,50% 50%)'},{opacity:1,clipPath:'polygon(50% 0,100% 50%,50% 100%,0 50%)'}]],
      'scan-lines':[[{opacity:1,filter:'contrast(1)'},{opacity:0,filter:'contrast(1.8) blur(3px)',transform:'scaleY(.94)'}],[{opacity:0,clipPath:'inset(0 0 100% 0)',filter:'contrast(1.8)'},{opacity:1,clipPath:'inset(0)',filter:'none'}]],
      'vertical-scan':[[{opacity:1,clipPath:'inset(0)'},{opacity:0,clipPath:'inset(0 100% 0 0)'}],[{opacity:1,clipPath:'inset(0 0 0 100%)'},{opacity:1,clipPath:'inset(0)'}]],
      'data-glitch':[[{opacity:1,transform:'none'},{opacity:.4,transform:'translateX(-2%) skewX(2deg)',filter:'contrast(1.6)'},{opacity:0,transform:'translateX(3%)'}],[{opacity:0,transform:'translateX(3%)',filter:'contrast(1.7)'},{opacity:.65,transform:'translateX(-1.5%)'},{opacity:1,transform:'none',filter:'none'}]],
      'signal-loss':[[{opacity:1,filter:'none'},{opacity:.3,filter:'grayscale(1) contrast(2) blur(8px)'},{opacity:0,filter:'blur(14px)'}],[{opacity:0,filter:'blur(15px) grayscale(1)'},{opacity:.6,filter:'blur(5px)'},{opacity:1,filter:'none'}]],
      compression:[[{opacity:1,transform:'scaleX(1)'},{opacity:.8,transform:'scaleX(.05)'},{opacity:0,transform:'scaleX(.01) scaleY(.5)'}],[{opacity:0,transform:'scaleX(.01) scaleY(.5)'},{opacity:.7,transform:'scaleX(.06)'},{opacity:1,transform:'none'}]],
      'memory-corruption':[[{opacity:1},{opacity:.6,filter:'blur(2px)'},{opacity:.15,transform:'scale(1.03)',filter:'blur(8px)'},{opacity:0}],[{opacity:0,transform:'scale(.97)',filter:'blur(11px)'},{opacity:.7,transform:'scale(1.02)'},{opacity:.35},{opacity:1,transform:'none',filter:'none'}]],
      'quadrant-escape':[[{opacity:1,clipPath:'inset(0)'},{opacity:0,transform:'scale(1.18)',clipPath:'inset(48% 48% 48% 48%)'}],[{opacity:0,transform:'scale(.82)',clipPath:'inset(48% 48% 48% 48%)'},{opacity:1,transform:'none',clipPath:'inset(0)'}]],
      'column-rain':[[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(20%)',filter:'blur(7px)'}],[{opacity:0,transform:'translateY(-24%) scaleY(1.08)',filter:'blur(8px)'},{opacity:1,transform:'none',filter:'none'}]],
      pinwheel:[[{opacity:1,transform:'rotate(0) scale(1)'},{opacity:0,transform:'rotate(-32deg) scale(.16)'}],[{opacity:0,transform:'rotate(32deg) scale(.16)'},{opacity:1,transform:'none'}]],
      'center-fold':[[{opacity:1,transform:'perspective(900px) rotateX(0)'},{opacity:0,transform:'perspective(900px) rotateX(82deg) scaleY(.35)'}],[{opacity:0,transform:'perspective(900px) rotateX(-82deg) scaleY(.35)'},{opacity:1,transform:'none'}]],
      'slice-shuffle':[[{opacity:1,transform:'none'},{opacity:.7,transform:'translateX(-6%) skewX(8deg)'},{opacity:.35,transform:'translateX(6%) skewX(-7deg)'},{opacity:0,transform:'translateX(-18%)'}],[{opacity:0,transform:'translateX(18%) skewX(-10deg)'},{opacity:.7,transform:'translateX(-4%)'},{opacity:1,transform:'none'}]],
      'ripple-rings':[[{opacity:1,transform:'scale(1)'},{opacity:.45,transform:'scale(1.04)',filter:'blur(3px)'},{opacity:0,transform:'scale(1.1)',filter:'blur(8px)'}],[{opacity:0,transform:'scale(.88)',filter:'blur(11px)'},{opacity:.7,transform:'scale(1.025)'},{opacity:1,transform:'none',filter:'none'}]],

      'venetian':[[{opacity:1,transform:'scaleY(1)'},{opacity:0,transform:'scaleY(.06)',filter:'blur(3px)'}],[{opacity:0,transform:'scaleY(.06)',filter:'blur(3px)'},{opacity:1,transform:'scaleY(1)',filter:'none'}]],
      'shutter-cascade':[[{opacity:1,clipPath:'inset(0)'},{opacity:0,clipPath:'inset(48% 0 48% 0)',filter:'brightness(.7)'}],[{opacity:0,clipPath:'inset(48% 0 48% 0)',filter:'brightness(1.4)'},{opacity:1,clipPath:'inset(0)',filter:'none'}]],
      'cross-split':[[{opacity:1,clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)'},{opacity:0,clipPath:'polygon(0 48%,48% 48%,48% 0,52% 0,52% 48%,100% 48%,100% 52%,52% 52%,52% 100%,48% 100%,48% 52%,0 52%)'}],[{opacity:0,clipPath:'polygon(0 50%,50% 50%,50% 0,50% 0,50% 50%,100% 50%,100% 50%,50% 50%,50% 100%,50% 100%,50% 50%,0 50%)'},{opacity:1,clipPath:'inset(0)'}]],
      'pixel-fusion':[[{opacity:1,filter:'contrast(1)'},{opacity:.55,filter:'contrast(1.35) saturate(.75)'},{opacity:0,filter:'blur(2px) contrast(1.1)'}],[{opacity:0,filter:'blur(3px) contrast(1.6)'},{opacity:.55,filter:'contrast(1.25)'},{opacity:1,filter:'none'}]],
      'pixel-crystallize':[[{opacity:1,filter:'none'},{opacity:.35,filter:'blur(5px) brightness(.85)'},{opacity:0,transform:'scale(.985)'}],[{opacity:0,transform:'scale(1.035)',filter:'blur(10px) brightness(1.4)'},{opacity:.7,filter:'blur(2px)'},{opacity:1,transform:'none',filter:'none'}]],
      'organic-erosion':[[{opacity:1,filter:'none'},{opacity:.6,filter:'contrast(1.2)'},{opacity:0,filter:'blur(2px)'}],[{opacity:0,filter:'blur(2px)'},{opacity:.7,filter:'contrast(1.08)'},{opacity:1,filter:'none'}]],
      'organic-burn-map':[[{opacity:1,filter:'none'},{opacity:.52,filter:'contrast(1.3) brightness(.82)'},{opacity:0,filter:'blur(3px) brightness(.7)'}],[{opacity:0,filter:'blur(3px) brightness(1.18)'},{opacity:.7,filter:'contrast(1.1)'},{opacity:1,filter:'none'}]]
    };

    if(basic[name]) return basic[name];

    // Efectos de mosaico/orgánicos usan una base breve mientras una capa auxiliar
    // da la sensación de bloques, píxeles o propagación.
    const tileNames = new Set([
      'pixel-dissolve','pixel-build','digital-mosaic','random-tiles','wave-tiles',
      'fragmentation','venetian','checkerboard','radial-pixels','pixel-fusion',
      'pixel-crystallize','organic-erosion','organic-burn-map','grid-flip-3d',
      'shutter-cascade','cross-split','spiral-tiles','domino-tiles','hex-dissolve'
    ]);
    if(tileNames.has(name)){
      return [
        [{opacity:1,filter:'none'},{opacity:0,filter:'blur(3px)',transform:'scale(.985)'}],
        [{opacity:0,filter:'blur(3px)',transform:'scale(1.015)'},{opacity:1,filter:'none',transform:'none'}]
      ];
    }
    return basic.fade;
  }

  function tileOverlay(name, src){
    if(!figure || !src || REDUCED) return;
    const tileNames = new Set([
      'pixel-dissolve','pixel-build','digital-mosaic','random-tiles','wave-tiles',
      'fragmentation','checkerboard','radial-pixels','pixel-fusion',
      'pixel-crystallize','organic-erosion','organic-burn-map','grid-flip-3d',
      'spiral-tiles','domino-tiles','hex-dissolve'
    ]);
    if(!tileNames.has(name)) return;

    const overlay=document.createElement('div');
    overlay.className=`eidos-gallery-fx-overlay fx-${name}`;

    let cols=10,rows=7;
    if(name==='pixel-dissolve'||name==='pixel-build'||name==='pixel-fusion'||name==='pixel-crystallize'){cols=22;rows=14}
    if(name==='digital-mosaic'){cols=8;rows=5}
    if(name==='fragmentation'){cols=7;rows=5}
    if(name==='hex-dissolve'){cols=12;rows=8}
    if(name==='organic-erosion'||name==='organic-burn-map'){cols=18;rows=12}

    const total=cols*rows;
    const order=Array.from({length:total},(_,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
    const rank=new Map(order.map((v,i)=>[v,i]));

    for(let i=0;i<total;i++){
      const x=i%cols,y=Math.floor(i/cols),t=document.createElement('i');
      t.style.left=`${x*100/cols}%`;t.style.top=`${y*100/rows}%`;
      t.style.width=`${100/cols+.12}%`;t.style.height=`${100/rows+.12}%`;
      t.style.backgroundImage=`url("${src.replace(/"/g,'\\"')}")`;
      t.style.backgroundSize=`${cols*100}% ${rows*100}%`;
      t.style.backgroundPosition=`${x*100/(cols-1)}% ${y*100/(rows-1)}%`;
      t.style.setProperty('--x',x);t.style.setProperty('--y',y);
      t.style.setProperty('--cx',x-(cols-1)/2);t.style.setProperty('--cy',y-(rows-1)/2);

      let d=rank.get(i)/total*520;
      if(name==='wave-tiles') d=(x+y*.62)*36;
      if(name==='checkerboard') d=((x+y)%2)*360+y*14;
      if(name==='radial-pixels'){
        const dx=x-(cols-1)/2,dy=y-(rows-1)/2;
        d=Math.hypot(dx,dy)*62;
      }
      if(name==='spiral-tiles'){
        const dx=x-(cols-1)/2,dy=y-(rows-1)/2;
        d=(((Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2))*72)+Math.hypot(dx,dy)*26;
      }
      if(name==='domino-tiles') d=((y%2?cols-1-x:x)+y*.55)*48;
      if(name==='grid-flip-3d') d=(x+y)*32;
      if(name==='digital-mosaic') d=rank.get(i)/total*700;
      if(name==='fragmentation') d=rank.get(i)/total*340;
      if(name==='hex-dissolve') d=rank.get(i)/total*600+((x+y)%3)*55;
      if(name==='organic-erosion'){
        const dx=x-(cols-1)/2,dy=y-(rows-1)/2;
        d=rank.get(i)/total*480 + Math.sin(x*.9+y*.7)*80 + Math.hypot(dx,dy)*10;
      }
      if(name==='organic-burn-map'){
        const seeds=[[2,2],[cols-3,2],[Math.floor(cols*.35),rows-3],[Math.floor(cols*.7),Math.floor(rows*.55)]];
        const dist=Math.min(...seeds.map(([sx,sy])=>Math.hypot(x-sx,y-sy)));
        d=dist*72+Math.random()*110;
      }
      if(name==='pixel-fusion') d=rank.get(i)/total*780;
      if(name==='pixel-crystallize') d=(1-rank.get(i)/total)*220 + rank.get(i)/total*520;

      t.style.setProperty('--d',`${Math.max(0,d)}ms`);
      overlay.appendChild(t);
    }
    figure.appendChild(overlay);
    setTimeout(()=>overlay.remove(),1800);
  }

  function animateLightboxChange(){
    if(!lightboxImage || REDUCED) return;
    const newSrc=lightboxImage.currentSrc || lightboxImage.src;
    if(!newSrc || newSrc===previousSrc) return;

    const effect=nextEffect();
    const [outFrames,inFrames]=pair(effect);
    let old=null;

    if(previousSrc && figure){
      old=lightboxImage.cloneNode(false);
      old.removeAttribute('id');
      old.src=previousSrc;
      old.className='eidos-lightbox-old';
      figure.insertBefore(old,lightboxImage);
      old.animate(outFrames,{duration:900,easing:'cubic-bezier(.18,.72,.18,1)',fill:'forwards'});
      setTimeout(()=>old.remove(),1100);
    }

    lightboxImage.animate(inFrames,{duration:920,easing:'cubic-bezier(.18,.72,.18,1)'});
    tileOverlay(effect,newSrc);
    previousSrc=newSrc;
  }

  function decorateCards(){
    if(!grid) return;
    [...grid.children].forEach((card,index)=>{
      if(card.dataset.eidosEnhanced) return;
      card.dataset.eidosEnhanced='1';
      card.classList.add('eidos-card-enter');
      card.style.setProperty('--eidos-card-delay',`${Math.min(index,18)*35}ms`);
      const rx=((index*17)%7-3)*.45;
      const ry=((index*29)%9-4)*.5;
      card.style.setProperty('--gx',`${rx}deg`);
      card.style.setProperty('--gy',`${ry}deg`);
      card.style.setProperty('--gs','1.018');
    });
  }

  if(grid){
    const gridObserver=new MutationObserver(decorateCards);
    gridObserver.observe(grid,{childList:true,subtree:false});
    decorateCards();
  }

  if(lightboxImage){
    previousSrc=lightboxImage.currentSrc || lightboxImage.src || '';
    const imageObserver=new MutationObserver(mutations=>{
      if(mutationBusy) return;
      if(mutations.some(m=>m.type==='attributes' && (m.attributeName==='src'||m.attributeName==='srcset'))){
        mutationBusy=true;
        requestAnimationFrame(()=>{
          animateLightboxChange();
          mutationBusy=false;
        });
      }
    });
    imageObserver.observe(lightboxImage,{attributes:true,attributeFilter:['src','srcset']});
    lightboxImage.addEventListener('load',animateLightboxChange);
  }

  // El fondo ambiental recibe variaciones sutiles al cambiar la imagen visible.
  const ambientImages=[...document.querySelectorAll('.ambient__image')];
  ambientImages.forEach((el,index)=>{
    const observer=new MutationObserver(()=>{
      if(REDUCED || !el.classList.contains('is-visible')) return;
      const variants=[
        [{opacity:.2,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],
        [{opacity:.1,transform:'translateX(-2%) scale(1.05)'},{opacity:1,transform:'none'}],
        [{opacity:.1,filter:'blur(18px)'},{opacity:1,filter:'blur(0)'}],
        [{opacity:.1,transform:'translateY(2%) scale(1.04)'},{opacity:1,transform:'none'}]
      ];
      el.animate(variants[(Date.now()+index)%variants.length],{duration:1450,easing:'ease-out'});
    });
    observer.observe(el,{attributes:true,attributeFilter:['class','style']});
  });
})();
