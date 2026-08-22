(() => {
  'use strict';

  const GRID_PAUSE = 2000;
  const TRANSITION_FALLBACK = 1750;
  const BACKGROUND_INTERVAL = 16000;
  const effects = [
    'fx-fade', 'fx-zoom-in', 'fx-zoom-out', 'fx-slide-left', 'fx-slide-right',
    'fx-slide-up', 'fx-slide-down', 'fx-flip-x', 'fx-flip-y', 'fx-rotate',
    'fx-blur', 'fx-diagonal', 'fx-tilt', 'fx-wipe', 'fx-depth',
    'fx-curtain', 'fx-iris', 'fx-swing', 'fx-twist', 'fx-pan',
    'fx-prism', 'fx-collapse', 'fx-corner', 'fx-glide',
    'fx-dissolve', 'fx-focus', 'fx-exposure', 'fx-soft-wipe',
    'fx-parallax', 'fx-vignette', 'fx-reveal-up', 'fx-diamond'
  ];

  const grid = document.getElementById('eidos-grid');
  const status = document.getElementById('gallery-status');
  const motionToggle = document.getElementById('motion-toggle');
  const backgroundLayers = [...document.querySelectorAll('.ambient__image')];
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');

  let images = [];
  let deck = null;
  let tiles = [];
  let paused = false;
  let gridTimer = null;
  let backgroundTimer = null;
  let visibleBackground = 0;
  let lightboxIndex = 0;
  let effectQueue = [];
  let lastChangedIndexes = [];

  function desiredTileCount() {
    if (window.matchMedia('(max-width: 430px)').matches) return 8;
    if (window.matchMedia('(max-width: 760px)').matches) return 12;
    if (window.matchMedia('(max-width: 1050px)').matches) return 15;
    return 18;
  }

  function cleanUrl(url) {
    return url.replace(/(["'\\()\s])/g, '\\$1');
  }

  function nextEffect() {
    if (!effectQueue.length) effectQueue = EidosImageSource.shuffle(effects);
    return effectQueue.shift();
  }

  function setTileImmediate(tile,item) {
    const current=tile.querySelector('.tile__current');
    const next=tile.querySelector('.tile__next');
    current.style.backgroundImage=`url("${cleanUrl(item.url)}")`;
    next.style.backgroundImage='';
    tile.dataset.url=item.url;
    tile.dataset.name=item.name;
    tile.setAttribute('aria-label',`Ampliar ${item.name}`);
  }

  function repairTileIfBroken(tile,item) {
    preload(item.url).catch(()=>{
      if (!deck) return;
      deck.reject(item.url);
      const used=new Set(tiles.filter(t=>t!==tile).map(t=>t.dataset.url));
      const replacement=deck.next(used);
      if (!replacement) return;
      preload(replacement.url)
        .then(()=>setTileImmediate(tile,replacement))
        .catch(()=>{deck.reject(replacement.url);repairTileIfBroken(tile,replacement);});
    });
  }

  function createTile(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tile';
    button.dataset.url = item.url;
    button.dataset.name = item.name;
    button.setAttribute('aria-label', `Ampliar ${item.name}`);

    const current = document.createElement('span');
    current.className = 'tile__layer tile__current';
    current.style.backgroundImage = `url("${cleanUrl(item.url)}")`;

    const next = document.createElement('span');
    next.className = 'tile__layer tile__next';

    button.append(current, next);
    button.addEventListener('click', () => openLightbox(button.dataset.url));
    window.setTimeout(()=>repairTileIfBroken(button,item),0);
    return button;
  }

  function rebuildGrid() {
    if (!deck || !images.length) return;
    const target = Math.min(desiredTileCount(), Math.max(images.length, 1));
    if (tiles.length === target) return;

    grid.replaceChildren();
    tiles = [];
    lastChangedIndexes = [];
    const used = new Set();

    for (let i = 0; i < target; i += 1) {
      const item = deck.next(used);
      used.add(item.url);
      const tile = createTile(item);
      tiles.push(tile);
      grid.append(tile);
    }
  }

  function preload(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(url);
      image.onerror = reject;
      image.src = url;
    });
  }

  function gridColumnCount() {
    if (window.matchMedia('(max-width: 430px)').matches) return 2;
    if (window.matchMedia('(max-width: 760px)').matches) return 3;
    if (window.matchMedia('(max-width: 1050px)').matches) return 5;
    return 6;
  }

  function areAdjacent(firstIndex, secondIndex, columns) {
    const firstRow = Math.floor(firstIndex / columns);
    const firstColumn = firstIndex % columns;
    const secondRow = Math.floor(secondIndex / columns);
    const secondColumn = secondIndex % columns;

    return Math.abs(firstRow - secondRow) + Math.abs(firstColumn - secondColumn) === 1;
  }

  function selectSeparatedIndexes(requestedCount) {
    const columns = gridColumnCount();
    const allIndexes = tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => !tile.classList.contains('is-changing'))
      .map(({ index }) => index);

    const previous = new Set(lastChangedIndexes);
    const preferred = EidosImageSource.shuffle(allIndexes.filter(index => !previous.has(index)));
    const fallback = EidosImageSource.shuffle(allIndexes.filter(index => previous.has(index)));
    const selected = [];

    const tryAdd = index => {
      if (selected.includes(index)) return;
      if (selected.some(chosen => areAdjacent(index, chosen, columns))) return;
      selected.push(index);
    };

    preferred.forEach(index => {
      if (selected.length < requestedCount) tryAdd(index);
    });
    fallback.forEach(index => {
      if (selected.length < requestedCount) tryAdd(index);
    });

    return selected;
  }

  function runTileTransition(tile, item, effect) {
    return new Promise(resolve => {
      const current = tile.querySelector('.tile__current');
      const next = tile.querySelector('.tile__next');

      next.style.backgroundImage = `url("${cleanUrl(item.url)}")`;
      tile.classList.add('is-changing', effect);

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        current.style.backgroundImage = next.style.backgroundImage;
        next.style.backgroundImage = '';
        tile.dataset.url = item.url;
        tile.dataset.name = item.name;
        tile.setAttribute('aria-label', `Ampliar ${item.name}`);
        tile.classList.remove('is-changing', effect);
        next.removeEventListener('animationend', finish);
        resolve();
      };

      next.addEventListener('animationend', finish, { once: true });
      window.setTimeout(finish, TRANSITION_FALLBACK);
    });
  }

  function scheduleGrid(delay = GRID_PAUSE) {
    window.clearTimeout(gridTimer);
    gridTimer = null;
    if (!paused && !document.hidden) {
      gridTimer = window.setTimeout(rotateGrid, delay);
    }
  }

  async function rotateGrid() {
    gridTimer = null;
    if (paused || document.hidden || !tiles.length || !deck) return;

    const requestedCount = 1 + Math.floor(Math.random() * 3);
    const selectedIndexes = selectSeparatedIndexes(requestedCount);

    if (!selectedIndexes.length) {
      scheduleGrid();
      return;
    }

    const usedUrls = new Set(tiles.map(tile => tile.dataset.url));
    const changes = selectedIndexes.map(index => {
      const tile = tiles[index];
      const item = deck.next(usedUrls);
      usedUrls.add(item.url);
      return { index, tile, item, effect: nextEffect() };
    });

    const ready = (await Promise.all(changes.map(async change => {
      try {
        await preload(change.item.url);
        return change;
      } catch {
        if (deck) deck.reject(change.item.url);
        return null;
      }
    }))).filter(Boolean);

    if (paused || document.hidden) return;

    if (!ready.length) {
      scheduleGrid();
      return;
    }

    lastChangedIndexes = ready.map(change => change.index);
    await Promise.all(ready.map(change => runTileTransition(change.tile, change.item, change.effect)));
    scheduleGrid();
  }

  function setBackground(item) {
    if (!item) return;
    const nextIndex = visibleBackground === 0 ? 1 : 0;
    const incoming = backgroundLayers[nextIndex];
    const outgoing = backgroundLayers[visibleBackground];

    incoming.style.backgroundImage = `url("${cleanUrl(item.url)}")`;
    incoming.classList.add('is-visible');
    outgoing.classList.remove('is-visible');
    visibleBackground = nextIndex;
  }

  async function rotateBackground() {
    if (paused || document.hidden || !deck) return;
    const attempts=Math.max(images.length,1);
    for(let i=0;i<attempts;i+=1){
      const item=deck.next();
      if(!item)return;
      try{await preload(item.url);setBackground(item);return;}
      catch{deck.reject(item.url);}
    }
  }

  function openLightbox(url) {
    lightboxIndex = Math.max(0, images.findIndex(image => image.url === url));
    showLightboxImage();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function showLightboxImage() {
    const item = images[lightboxIndex];
    if (!item) return;
    lightboxImage.src = item.url;
    lightboxImage.alt = item.name;
    lightboxCaption.textContent = item.name.replace(/[-_]+/g, ' ');
  }

  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + images.length) % images.length;
    showLightboxImage();
  }

  lightboxImage.addEventListener('error',()=>{
    const broken=images[lightboxIndex];
    if(broken && deck)deck.reject(broken.url);
    if(broken)images=images.filter(item=>item.url!==broken.url);
    if(images.length){
      lightboxIndex=Math.min(lightboxIndex,images.length-1);
      showLightboxImage();
    }else{
      closeLightbox();
    }
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    document.body.style.overflow = '';
  }

  function togglePause() {
    paused = !paused;
    motionToggle.textContent = paused ? 'Continuar' : 'Pausar';
    motionToggle.setAttribute('aria-pressed', String(paused));

    if (paused) window.clearTimeout(gridTimer);
    else scheduleGrid();
  }

  async function init() {
    try {
      images = await EidosImageSource.loadImages();
      if (!images.length) {
        status.hidden = false;
        status.innerHTML = 'La carpeta <strong>gallery/images/gallery</strong> todavía no contiene imágenes.<br>Súbelas a GitHub y recarga la página.';
        return;
      }

      deck = new EidosImageSource.ImageDeck(images);
      rebuildGrid();
      status.hidden = true;
      grid.hidden = false;
      setBackground(deck.next());

      scheduleGrid();
      backgroundTimer = window.setInterval(rotateBackground, BACKGROUND_INTERVAL);
    } catch (error) {
      status.hidden = false;
      status.classList.add('is-error');
      status.textContent = error.message;
    }
  }

  motionToggle.addEventListener('click', togglePause);
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(gridTimer);
    else scheduleGrid();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuildGrid, 180);
  });

  window.addEventListener('beforeunload', () => {
    window.clearTimeout(gridTimer);
    window.clearInterval(backgroundTimer);
  });

  init();
})();
