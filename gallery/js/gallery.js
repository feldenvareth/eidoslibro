(() => {
  'use strict';

  const GRID_INTERVAL = 3000;
  const BACKGROUND_INTERVAL = 16000;
  const effects = [
    'fx-fade', 'fx-zoom-in', 'fx-zoom-out', 'fx-slide-left', 'fx-slide-right',
    'fx-slide-up', 'fx-slide-down', 'fx-flip-x', 'fx-flip-y', 'fx-rotate',
    'fx-blur', 'fx-diagonal', 'fx-tilt', 'fx-wipe', 'fx-depth'
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

  function desiredTileCount() {
    if (window.matchMedia('(max-width: 430px)').matches) return 8;
    if (window.matchMedia('(max-width: 760px)').matches) return 12;
    if (window.matchMedia('(max-width: 1050px)').matches) return 15;
    return 18;
  }

  function cleanUrl(url) {
    return url.replace(/(["'\\()\s])/g, '\\$1');
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
    return button;
  }

  function rebuildGrid() {
    if (!deck || !images.length) return;
    const target = Math.min(desiredTileCount(), Math.max(images.length, 1));
    if (tiles.length === target) return;

    grid.replaceChildren();
    tiles = [];
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

  async function replaceTile(tile, item) {
    if (!tile || tile.classList.contains('is-changing')) return;

    try {
      await preload(item.url);
    } catch {
      return;
    }

    const current = tile.querySelector('.tile__current');
    const next = tile.querySelector('.tile__next');
    const effect = effects[Math.floor(Math.random() * effects.length)];

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
    };

    next.addEventListener('animationend', finish, { once: true });
    window.setTimeout(finish, 1300);
  }

  function rotateGrid() {
    if (paused || document.hidden || !tiles.length) return;

    const maximum = Math.min(4, tiles.length);
    const count = 1 + Math.floor(Math.random() * maximum);
    const selected = EidosImageSource.shuffle(tiles).slice(0, count);
    const usedUrls = new Set(tiles.map(tile => tile.dataset.url));

    selected.forEach((tile, index) => {
      const item = deck.next(usedUrls);
      usedUrls.add(item.url);
      window.setTimeout(() => replaceTile(tile, item), index * 110);
    });
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

  function rotateBackground() {
    if (paused || document.hidden || !deck) return;
    setBackground(deck.next());
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

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    document.body.style.overflow = '';
  }

  function togglePause() {
    paused = !paused;
    motionToggle.textContent = paused ? 'Continuar' : 'Pausar';
    motionToggle.setAttribute('aria-pressed', String(paused));
  }

  async function init() {
    try {
      images = await EidosImageSource.loadImages();
      if (!images.length) {
        status.innerHTML = 'La carpeta <strong>gallery/images/gallery</strong> todavía no contiene imágenes.<br>Súbelas a GitHub y recarga la página.';
        return;
      }

      deck = new EidosImageSource.ImageDeck(images);
      rebuildGrid();
      status.hidden = true;
      grid.hidden = false;
      setBackground(deck.next());

      gridTimer = window.setInterval(rotateGrid, GRID_INTERVAL);
      backgroundTimer = window.setInterval(rotateBackground, BACKGROUND_INTERVAL);
    } catch (error) {
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

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuildGrid, 180);
  });

  window.addEventListener('beforeunload', () => {
    window.clearInterval(gridTimer);
    window.clearInterval(backgroundTimer);
  });

  init();
})();
