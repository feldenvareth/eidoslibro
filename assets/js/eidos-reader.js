/* Eidos: portada cerrada y pliegos con páginas pares a la izquierda. */
(() => {
  'use strict';
  if (!document.querySelector('[data-eidos-reader]') || !window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  const root = new URL('../../',document.currentScript.src);
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const lang = english ? 'en' : 'es';
  const editions = {
    novel: { es:{key:'eidos-es',cover:'assets/images/tapa.jpg',title:'Eidos',short:'Novela',total:70,start:16,recto:[15,16,23,27,41,53,57,60],pdf:'eidosprimeroscapitulos.pdf',buy:'https://www.amazon.es/dp/B0FCR5ZPBJ'},
             en:{key:'eidos-en',cover:'assets/images/tapa.jpg',title:'Eidos',short:'Novel',total:72,start:19,recto:[18,19,26,30,44,56,60,63],pdf:'chapters.pdf',buy:'https://www.amazon.es/dp/B0FCFGZXZT'} },
    relatos: { es:{key:'relatos-es',cover:'assets/images/taparelatos.jpg',title:'Eidos Relatos',short:'Relatos',total:72,start:16,recto:[15,16,31,40,50,60],exclude:[[63,70]],pdf:'eidosrelatosprimercapitulo.pdf?v=2',buy:'https://www.amazon.es/dp/B0G8HLFJXT'},
               en:{key:'relatos-en',cover:'assets/images/tapatales.jpg',title:'Eidos Tales',short:'Tales',total:71,start:17,recto:[16,17,31,39,49,60,71],exclude:[[63,70]],pageVersions:{62:2},pdf:'eidostalesfirstchapter.pdf?v=2',buy:'https://www.amazon.es/dp/B0GDNQW7VZ'} }
  };
  const L = english ? {
    title:'First chapters',close:'Close the book',zoom:'Enlarge',fit:'Fit book',pdf:'Open the original PDF',
    previous:'Previous pages',next:'Next pages',page:'Page',blank:'Blank page',loading:'Opening the book…',
    error:'These pages could not be loaded.',fallback:'Read the PDF',buy:'Buy the book',tap:'Click the cover to open',
    open:'Open the book and leaf through to the beginning',help:'Even pages are on the left and odd pages on the right. Click the cover to open the book. Use the arrow keys, buttons, page edges, or swipe to turn pages. Enlarge the book to read larger text.',
    cover:title=>`Cover of ${title}`,count:(n,total)=>`Page ${n} of ${total}`,pair:(a,b,total)=>a===1?`Cover · 1 / ${total}`:`Pages ${a}${b<=total?'–'+b:''} of ${total}`
  } : {
    title:'Primeros capítulos',close:'Cerrar el libro',zoom:'Ampliar',fit:'Ajustar',pdf:'Abrir el PDF original',
    previous:'Páginas anteriores',next:'Páginas siguientes',page:'Página',blank:'Página en blanco',loading:'Abriendo el libro…',
    error:'No se han podido cargar estas páginas.',fallback:'Leer el PDF',buy:'Comprar el libro',tap:'Pulsa la portada para abrir',
    open:'Abrir el libro y hojear hasta el comienzo',help:'Las páginas pares están a la izquierda y las impares a la derecha. Pulsa la portada para abrir el libro. Usa las flechas del teclado, los botones, las páginas o desliza para pasar las hojas. Pulsa Ampliar para leer el texto más grande.',
    cover:title=>`Portada de ${title}`,count:(n,total)=>`Página ${n} de ${total}`,pair:(a,b,total)=>a===1?`Portada · 1 / ${total}`:`Páginas ${a}${b<=total?'–'+b:''} de ${total}`
  };
  document.body.insertAdjacentHTML('beforeend',`
    <dialog class="er-dialog" id="eidos-reader-dialog" aria-labelledby="er-title" aria-describedby="er-help">
      <header class="er-header">
        <h2 class="er-heading" id="er-title"><strong>EIDOS</strong><span class="er-subtitle">${L.title}</span></h2>
        <div class="er-tools">
          <button class="er-tool er-zoom-button" type="button" aria-pressed="false">${L.zoom}</button>
          <a class="er-tool er-pdf-link" target="_blank" rel="noopener" aria-label="${L.pdf}" title="${L.pdf}">PDF</a>
          <button class="er-close" type="button" aria-label="${L.close}" title="${L.close}">×</button>
        </div>
      </header>
      <p class="er-sr-only" id="er-help">${L.help}</p>
      <div class="er-stage">
        <button class="er-side-arrow er-side-prev" type="button" aria-label="${L.previous}">‹</button>
        <div class="er-book-viewport" tabindex="0" aria-label="${L.title}">
          <div class="er-book er-at-cover">
            <div class="er-page er-page-left er-blank" aria-hidden="true"><img alt="" draggable="false"></div>
            <div class="er-page er-page-right er-blank" aria-hidden="true"><img alt="" draggable="false"></div>
            <div class="er-turn-shadow" aria-hidden="true"></div>
            <div class="er-turn-leaf" aria-hidden="true" hidden>
              <div class="er-leaf-face er-leaf-front"><img alt="" draggable="false"><span class="er-leaf-shade"></span></div>
              <div class="er-leaf-face er-leaf-back"><img alt="" draggable="false"><span class="er-leaf-shade"></span></div>
            </div>
            <button class="er-cover-trigger" type="button" aria-label="${L.open}" title="${L.open}"></button>
          </div>
        </div>
        <button class="er-side-arrow er-side-next" type="button" aria-label="${L.next}">›</button>
        <div class="er-loading" role="status" hidden>${L.loading}</div>
        <div class="er-error" role="alert" hidden><p>${L.error}</p><a class="er-error-pdf" target="_blank" rel="noopener">${L.fallback}</a></div>
      </div>
      <footer class="er-footer">
        <nav class="er-navigation" aria-label="${L.title}">
          <button class="er-nav-button er-prev" type="button" aria-label="${L.previous}">←</button>
          <form class="er-page-form"><label class="er-page-label" for="er-page-input">${L.page}</label><input id="er-page-input" class="er-page-input" type="number" min="1" step="1" inputmode="numeric" aria-label="${L.page}" value="1"><output class="er-page-range"></output></form>
          <button class="er-nav-button er-next" type="button" aria-label="${L.next}">→</button>
        </nav>
        <a class="er-buy" target="_blank" rel="noopener">${L.buy}</a>
      </footer>
      <p class="er-sr-only er-status" aria-live="polite" aria-atomic="true"></p>
      <article class="er-sr-only er-page-text" aria-label="${L.title}"></article>
    </dialog>`);
  const dialog=document.getElementById('eidos-reader-dialog');
  const $=selector=>dialog.querySelector(selector);
  const viewport=$('.er-book-viewport'),book=$('.er-book'),left=$('.er-page-left'),right=$('.er-page-right');
  const leaf=$('.er-turn-leaf'),front=$('.er-leaf-front img'),back=$('.er-leaf-back img'),shadow=$('.er-turn-shadow');
  const coverButton=$('.er-cover-trigger'),input=$('.er-page-input'),zoomButton=$('.er-zoom-button');
  const loading=$('.er-loading'),error=$('.er-error');
  const previous=[$('.er-prev'),$('.er-side-prev')],next=[$('.er-next'),$('.er-side-next')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const blankPage='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800"><rect width="1200" height="1800" fill="white"/></svg>');
  const contexts=new Map();
  let active=null,busy=false,zoomed=false,operation=0,trigger=null,animations=[],pointer=null,skipClickUntil=0,introTimer=null;
  function readerPages(edition) {
    // Los números son páginas del PDF original. Se conserva su orden y se
    // intercala un blanco solo si una portadilla o capítulo caería a la izquierda.
    const recto=new Set(edition.recto),pages=[];
    for(let n=1;n<=edition.total;n++){
      if(edition.exclude?.some(([first,last])=>n>=first&&n<=last))continue;
      if(recto.has(n)&&(pages.length+1)%2===0)pages.push(0);
      pages.push(n);
    }
    return pages;
  }
  function context(id) {
    id=id==='relatos'?'relatos':'novel';
    if (!contexts.has(id)) {
      const ctx={...editions[id][lang],id,spread:0,cache:new Map(),introPromise:null,textRequested:false,thumbnails:new Map()};
      ctx.pages=readerPages(ctx);
      ctx.start=ctx.pages.indexOf(ctx.start)+1;ctx.total=ctx.pages.length;
      ctx.base=new URL(`assets/reader/${ctx.key}/`,root);
      ctx.cover=new URL(ctx.cover,root).href;
      ctx.pdfURL=new URL(`docs/${ctx.pdf}`,root).href;
      ctx.lastSpread=Math.floor(ctx.total/2);ctx.startSpread=Math.floor(ctx.start/2);
      contexts.set(id,ctx);
    }
    return contexts.get(id);
  }
  function source(ctx,n,tiny=false) {
    if (tiny&&ctx.thumbnails.has(n)) return ctx.thumbnails.get(n);
    const page=ctx.pages[n-1];
    if (page===0) return blankPage;
    if (page===1) return ctx.cover;
    const url=new URL(`pagina-${String(page).padStart(3,'0')}.webp`,ctx.base);
    if(ctx.pageVersions?.[page])url.searchParams.set('v',ctx.pageVersions[page]);
    return url.href;
  }
  function load(ctx,n,tiny=false) {
    if (n<1||n>ctx.total) return Promise.resolve(null);
    const url=source(ctx,n,tiny);
    if (!ctx.cache.has(url)) {
      const promise=new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>{if(img.decode)img.decode().then(()=>resolve(img),()=>resolve(img));else resolve(img);};img.onerror=()=>reject(new Error('page image'));img.src=url;
      });
      ctx.cache.set(url,promise);promise.catch(()=>ctx.cache.delete(url));
    }
    return ctx.cache.get(url);
  }
  function pair(ctx,spread) { return spread===0?[null,1]:[spread*2,spread*2+1<=ctx.total?spread*2+1:null]; }
  function paint(element,n,ctx,tiny=false) {
    const img=element.querySelector('img');
    element.dataset.page=n?String(n):'';
    element.classList.toggle('er-blank',!n);element.setAttribute('aria-hidden',String(!n));
    img.hidden=!n;
    if (!n) { img.removeAttribute('src');img.alt='';return; }
    img.src=source(ctx,n,tiny);img.alt=ctx.pages[n-1]===0?L.blank:n===1?L.cover(ctx.title):`${L.count(n,ctx.total)} · ${ctx.title}`;
  }
  function textForSpread(ctx) {
    const text=window.EidosReaderText?.[ctx.key];
    $('.er-page-text').textContent=text?pair(ctx,ctx.spread).filter(Boolean).map(n=>ctx.pages[n-1]===0?L.blank:text[ctx.pages[n-1]-1]).join('\n\n'):'';
  }
  function requestText(ctx) {
    if (ctx.textRequested) return;
    ctx.textRequested=true;
    const script=document.createElement('script');script.src=new URL('texto.js?v=3',ctx.base).href;
    script.onload=()=>{if(active===ctx&&dialog.open)textForSpread(ctx);};document.head.appendChild(script);
  }
  function render(ctx,spread,tiny=false,announce=true) {
    const [a,b]=pair(ctx,spread);ctx.spread=spread;
    paint(left,a,ctx,tiny);paint(right,b,ctx,tiny);
    book.classList.toggle('er-at-cover',spread===0);book.classList.toggle('er-open',spread>0);
    coverButton.hidden=spread!==0;dialog.dataset.spread=String(spread);
    const first=a||1;input.value=String(first);
    $('.er-page-range').textContent=`${a&&b?'– '+b+' ':''}/ ${ctx.total}`;
    $('.er-subtitle').textContent=`${ctx.short} · ${spread===0?L.tap:L.title}`;
    if (announce) {$('.er-status').textContent=L.pair(first,b||first,ctx.total);textForSpread(ctx);}
  }
  function updateControls() {
    if (!active) return;
    previous.forEach(button=>{button.disabled=busy||active.spread===0;});
    next.forEach(button=>{button.disabled=busy||active.spread===active.lastSpread;});
    input.disabled=busy;coverButton.disabled=busy;zoomButton.disabled=busy||active.spread===0;
  }
  function fitBook() {
    if (!dialog.open) return;
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if (zoomed) {
      const zoomWidth=Math.max(1100,width*1.5);book.style.width=`${zoomWidth}px`;book.style.height=`${zoomWidth*.75}px`;
    } else {
      const h=Math.max(1,Math.min(height,width*.75));book.style.width=`${h*4/3}px`;book.style.height=`${h}px`;
    }
  }
  if(window.ResizeObserver)new ResizeObserver(fitBook).observe(viewport);
  window.addEventListener('resize',fitBook,{passive:true});
  function cancelAnimations() {
    animations.forEach(animation=>animation.cancel());animations=[];leaf.hidden=true;shadow.style.opacity='0';
  }
  const valid=(ctx,token)=>dialog.open&&ctx===active&&token===operation;
  function begin() {
    cancelAnimations();const token=++operation;busy=true;error.hidden=true;updateControls();
    const timer=setTimeout(()=>{if(token===operation&&dialog.open)loading.hidden=false;},180);
    return {token,timer};
  }
  function ready(run) {clearTimeout(run.timer);if(run.token===operation)loading.hidden=true;}
  function finish(ctx,run) {
    ready(run);if(valid(ctx,run.token)){busy=false;updateControls();}
  }
  async function loadSpread(ctx,spread,tiny=false) {await Promise.all(pair(ctx,spread).filter(Boolean).map(n=>load(ctx,n,tiny)));}
  function prefetch(ctx) {
    const keep=new Set([ctx.cover]);
    for(const spread of [ctx.spread-1,ctx.spread,ctx.spread+1]){
      if(spread<0||spread>ctx.lastSpread)continue;
      for(const page of pair(ctx,spread).filter(Boolean))keep.add(source(ctx,page));
      if(spread!==ctx.spread)loadSpread(ctx,spread).catch(()=>{});
    }
    for(const url of ctx.cache.keys())if(!url.startsWith('data:')&&!keep.has(url))ctx.cache.delete(url);
  }
  function prepareIntro(ctx) {
    if(!ctx.introPromise){
      const pages=Array.from({length:ctx.startSpread*2+1},(_,i)=>i+1);
      ctx.introPromise=(async()=>{
        const images=await Promise.all(pages.map(n=>load(ctx,n,false)));
        // Las caras pequeñas se crean a partir de las páginas reales ya cargadas.
        // Si el navegador impide usar canvas, se conservan las imágenes originales.
        const canvas=document.createElement('canvas');
        const drawing=canvas.getContext('2d');
        if(drawing)for(let i=0;i<images.length;i++){
          try{
            const image=images[i];canvas.width=420;canvas.height=Math.round(image.naturalHeight*420/image.naturalWidth);
            drawing.drawImage(image,0,0,canvas.width,canvas.height);
            ctx.thumbnails.set(pages[i],canvas.toDataURL('image/webp',.82));
          }catch(_){}
        }
        canvas.width=canvas.height=1;
        await Promise.all(pages.map(n=>load(ctx,n,true)));
      })();
      ctx.introPromise.catch(()=>{ctx.introPromise=null;});
    }
    return ctx.introPromise;
  }
  async function turn(ctx,target,duration,tiny,token,announce=true) {
    if(!valid(ctx,token))return;
    const forward=target>ctx.spread;
    if(reduced.matches||!leaf.animate||zoomed){render(ctx,target,tiny,announce);return;}
    const [oldLeft,oldRight]=pair(ctx,ctx.spread),[newLeft,newRight]=pair(ctx,target);
    const frontNumber=forward?oldRight:newRight,backNumber=forward?newLeft:oldLeft;
    if(!frontNumber||!backNumber){render(ctx,target,tiny,announce);return;}
    front.src=source(ctx,frontNumber,tiny);back.src=source(ctx,backNumber,tiny);
    if(forward)paint(right,newRight,ctx,tiny);else paint(left,newLeft,ctx,tiny);
    coverButton.hidden=true;book.classList.remove('er-at-cover');book.classList.add('er-open');
    leaf.hidden=false;leaf.style.transform=forward?'rotateY(0deg)':'rotateY(-180deg)';
    const frames=forward?[
      {transform:'rotateY(0deg) skewY(0deg)'},
      {offset:.5,transform:'rotateY(-90deg) skewY(-.7deg)'},
      {transform:'rotateY(-180deg) skewY(0deg)'}
    ]:[
      {transform:'rotateY(-180deg) skewY(0deg)'},
      {offset:.5,transform:'rotateY(-90deg) skewY(.7deg)'},
      {transform:'rotateY(0deg) skewY(0deg)'}
    ];
    const animation=leaf.animate(frames,{duration,easing:'cubic-bezier(.35,.05,.25,1)',fill:'forwards'});
    animations.push(animation);
    for(const shade of [...leaf.querySelectorAll('.er-leaf-shade'),shadow]){
      animations.push(shade.animate([{opacity:0},{offset:.45,opacity:.36},{opacity:0}],{duration,easing:'linear',fill:'forwards'}));
    }
    try{await animation.finished;}catch(_){return;}
    if(!valid(ctx,token))return;
    render(ctx,target,tiny,announce);cancelAnimations();
  }
  async function goTo(spread) {
    if(!active||busy||!dialog.open)return;
    const ctx=active;spread=Math.min(ctx.lastSpread,Math.max(0,Math.round(spread)));
    if(!Number.isFinite(spread)||spread===ctx.spread){render(ctx,ctx.spread);return;}
    const run=begin();
    try{
      await loadSpread(ctx,spread);
      if(!valid(ctx,run.token))return;
      ready(run);await turn(ctx,spread,580,false,run.token);
      if(valid(ctx,run.token)){viewport.scrollTo(0,0);prefetch(ctx);}
    }catch(_){if(valid(ctx,run.token)){error.hidden=false;input.value=String(pair(ctx,ctx.spread)[0]||1);}}
    finally{finish(ctx,run);}
  }
  async function leafToBeginning() {
    if(!active||busy||active.spread!==0)return;
    const ctx=active,run=begin();requestText(ctx);
    try{
      await prepareIntro(ctx);
      if(!valid(ctx,run.token))return;
      ready(run);
      if(reduced.matches){render(ctx,ctx.startSpread);}
      else{
        const deadline=performance.now()+1900;
        for(let target=1;target<=ctx.startSpread;target++){
          if(!valid(ctx,run.token))return;
          const remaining=ctx.startSpread-target+1;
          const duration=target===1?420:Math.max(80,(deadline-performance.now())/remaining);
          await turn(ctx,target,duration,true,run.token,false);
        }
        if(valid(ctx,run.token))render(ctx,ctx.startSpread,false,true);
      }
      if(valid(ctx,run.token))prefetch(ctx);
    }catch(_){if(valid(ctx,run.token))error.hidden=false;}
    finally{finish(ctx,run);}
  }
  function toggleZoom() {
    if(!active||busy||active.spread===0)return;
    zoomed=!zoomed;dialog.classList.toggle('er-is-zoomed',zoomed);
    zoomButton.setAttribute('aria-pressed',String(zoomed));zoomButton.textContent=zoomed?L.fit:L.zoom;
    fitBook();viewport.scrollTo(0,0);
  }
  function track(ctx) {
    try{
      const consent=JSON.parse(localStorage.getItem('ga_consent_v2')||'{}');
      if(localStorage.getItem('consentGiven')!=='true'&&consent.analytics_storage!=='granted')return;
      const id=ctx.id==='relatos'?'eidos_relatos':'eidos';
      localStorage.setItem(`opened_chapter_${id}`,'yes');
      if(typeof window.gtag==='function')window.gtag('event','chapter_open',{book:id,language:lang,reader:'book'});
    }catch(_){}
  }
  function openReader(element) {
    if(dialog.open)return;
    active=context(element?.dataset.eidosReader);trigger=element||document.activeElement;
    operation++;cancelAnimations();busy=false;zoomed=false;dialog.classList.remove('er-is-zoomed');
    loading.hidden=true;error.hidden=true;zoomButton.textContent=L.zoom;zoomButton.setAttribute('aria-pressed','false');
    input.max=String(active.total);dialog.dataset.book=active.id;
    $('.er-pdf-link').href=active.pdfURL;$('.er-error-pdf').href=active.pdfURL;$('.er-buy').href=active.buy;
    $('.er-buy').textContent=english?`Buy ${active.title}`:`Comprar ${active.title}`;
    coverButton.setAttribute('aria-label',`${L.open} · ${active.title}`);
    render(active,0);updateControls();
    document.documentElement.classList.add('er-reader-open');dialog.showModal();fitBook();viewport.scrollTo(0,0);
    coverButton.focus({preventScroll:true});load(active,1).catch(()=>{});prepareIntro(active).catch(()=>{});track(active);
    clearTimeout(introTimer);
    const ctx=active,token=operation;
    // Primero se muestra la portada; el hojeado arranca sin exigir un segundo clic.
    introTimer=setTimeout(()=>{
      introTimer=null;
      if(valid(ctx,token)&&ctx.spread===0&&!busy)leafToBeginning();
    },280);
  }
  const go=direction=>{if(active)goTo(active.spread+direction);};
  previous.forEach(button=>button.addEventListener('click',()=>go(-1)));
  next.forEach(button=>button.addEventListener('click',()=>go(1)));
  coverButton.addEventListener('click',leafToBeginning);
  zoomButton.addEventListener('click',toggleZoom);
  $('.er-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{
    clearTimeout(introTimer);introTimer=null;
    operation++;cancelAnimations();busy=false;loading.hidden=true;error.hidden=true;
    document.documentElement.classList.remove('er-reader-open');
    if(trigger?.isConnected&&typeof trigger.focus==='function')trigger.focus({preventScroll:true});
  });
  function choosePage(){
    if(!active||busy)return;
    const n=Number(input.value);if(!input.value||!Number.isFinite(n)){render(active,active.spread);return;}
    goTo(Math.floor(Math.min(active.total,Math.max(1,Math.round(n)))/2));
  }
  $('.er-page-form').addEventListener('submit',event=>{event.preventDefault();choosePage();});
  input.addEventListener('change',choosePage);
  dialog.addEventListener('keydown',event=>{
    if(event.target===input||event.ctrlKey||event.metaKey||event.altKey||busy)return;
    if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();go(1);}
    if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();go(-1);}
    if(event.key==='Home'){event.preventDefault();goTo(0);}
    if(event.key==='End'){event.preventDefault();goTo(active.lastSpread);}
  });
  viewport.addEventListener('pointerdown',event=>{
    pointer=!busy&&!zoomed&&event.isPrimary?{x:event.clientX,y:event.clientY}:null;
  },{passive:true});
  viewport.addEventListener('pointerup',event=>{
    const start=pointer;pointer=null;if(!start||busy||zoomed)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){skipClickUntil=performance.now()+500;go(dx<0?1:-1);}
  },{passive:true});
  viewport.addEventListener('pointercancel',()=>{pointer=null;},{passive:true});
  viewport.addEventListener('click',event=>{
    if(busy||zoomed||performance.now()<skipClickUntil||event.target.closest('.er-cover-trigger'))return;
    const page=event.target.closest('.er-page');
    if(page&&!page.classList.contains('er-blank'))go(page===left?-1:1);
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-eidos-reader]');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();openReader(link);
  });
  if(document.body.hasAttribute('data-eidos-reader-auto'))openReader(document.querySelector('[data-eidos-reader]'));
})();
