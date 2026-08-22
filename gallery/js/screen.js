(() => {
  'use strict';

  const CYCLE_TIME = 9000;
  const TRANSITION_TIME = 2200;
  const effects = [
    'screen-fade', 'screen-zoom', 'screen-drift-left', 'screen-drift-right',
    'screen-rise', 'screen-fall', 'screen-flip-x', 'screen-flip-y',
    'screen-orbit', 'screen-blur', 'screen-depth', 'screen-diagonal',
    'screen-curtain', 'screen-iris', 'screen-swing', 'screen-twist',
    'screen-pan', 'screen-prism', 'screen-collapse', 'screen-corner',
    'screen-glide', 'screen-dissolve', 'screen-focus', 'screen-exposure',
    'screen-soft-wipe', 'screen-parallax', 'screen-vignette',
    'screen-reveal-up', 'screen-diamond',
    'screen-pixel-dissolve', 'screen-pixel-build', 'screen-digital-mosaic',
    'screen-random-tiles', 'screen-wave-tiles', 'screen-scan-lines',
    'screen-vertical-scan', 'screen-data-glitch', 'screen-signal-loss',
    'screen-fragmentation', 'screen-venetian', 'screen-checkerboard',
    'screen-radial-pixels', 'screen-compression', 'screen-memory-corruption',
    'screen-pixel-fusion', 'screen-pixel-crystallize',
    'screen-organic-erosion', 'screen-organic-burn-map',
    'screen-grid-flip-3d', 'screen-quadrant-escape', 'screen-shutter-cascade',
    'screen-column-rain', 'screen-pinwheel', 'screen-cross-split',
    'screen-spiral-tiles', 'screen-domino-tiles', 'screen-center-fold',
    'screen-slice-shuffle', 'screen-ripple-rings', 'screen-hex-dissolve'
  ];

  const root = document.getElementById('screensaver');
  const status = document.getElementById('screen-status');
  const pauseButton = document.getElementById('screen-pause');
  const currentImage = document.querySelector('.screen-image--current');
  const nextImage = document.querySelector('.screen-image--next');
  const currentBg = document.querySelector('.screen-bg--current');
  const nextBg = document.querySelector('.screen-bg--next');
  let fxOverlays = [];
  let pixelFusionRaf = null;

  let deck = null;
  let currentItem = null;
  let timer = null;
  let paused = false;
  let changing = false;
  let idleTimer = null;
  let effectQueue = [];

  function preload(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  function cssUrl(url) {
    return `url("${url.replace(/(["'\\()\s])/g, '\\$1')}")`;
  }

  function nextEffect() {
    if (!effectQueue.length) effectQueue = EidosImageSource.shuffle(effects);
    return effectQueue.shift();
  }


  const tileEffects = new Set([
    'screen-pixel-dissolve', 'screen-pixel-build', 'screen-digital-mosaic',
    'screen-random-tiles', 'screen-wave-tiles', 'screen-checkerboard',
    'screen-radial-pixels', 'screen-fragmentation',
    'screen-grid-flip-3d', 'screen-spiral-tiles', 'screen-domino-tiles',
    'screen-hex-dissolve'
  ]);

  function clearFxOverlay() {
    if (pixelFusionRaf) {
      cancelAnimationFrame(pixelFusionRaf);
      pixelFusionRaf = null;
    }
    for (const overlay of fxOverlays) overlay.remove();
    fxOverlays = [];
  }

  function seededOrder(count) {
    const a = Array.from({length: count}, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getContainedImageRect(imageElement, naturalWidth, naturalHeight) {
    const style = getComputedStyle(imageElement);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;

    const availableWidth = Math.max(1, imageElement.clientWidth - padLeft - padRight);
    const availableHeight = Math.max(1, imageElement.clientHeight - padTop - padBottom);
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);

    const width = naturalWidth * scale;
    const height = naturalHeight * scale;

    return {
      left: padLeft + (availableWidth - width) / 2,
      top: padTop + (availableHeight - height) / 2,
      width,
      height
    };
  }

  function buildTileLayer(effect, url, rect, direction) {
    const overlay = document.createElement('div');
    overlay.className = `screen-fx-overlay ${effect} screen-fx-overlay--${direction}`;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const dense = effect === 'screen-pixel-dissolve' || effect === 'screen-pixel-build';
    const cols = dense ? 18 : 12;
    const rows = dense ? 11 : 8;
    const total = cols * rows;
    const randomRank = new Map(seededOrder(total).map((v, i) => [v, i]));
    const tileWidth = rect.width / cols;
    const tileHeight = rect.height / rows;

    for (let i = 0; i < total; i++) {
      const x = i % cols;
      const y = Math.floor(i / cols);
      const tile = document.createElement('i');
      tile.className = 'screen-fx-tile';
      tile.style.setProperty('--x', x);
      tile.style.setProperty('--y', y);
      tile.style.left = `${x * tileWidth}px`;
      tile.style.top = `${y * tileHeight}px`;
      tile.style.width = `${tileWidth + .7}px`;
      tile.style.height = `${tileHeight + .7}px`;
      tile.style.backgroundImage = cssUrl(url);
      tile.style.backgroundSize = `${rect.width}px ${rect.height}px`;
      tile.style.backgroundPosition = `${-x * tileWidth}px ${-y * tileHeight}px`;

      let delay = 0;
      if (effect === 'screen-random-tiles' || effect === 'screen-pixel-dissolve' || effect === 'screen-pixel-build') {
        delay = randomRank.get(i) / total * 1.18;
      } else if (effect === 'screen-wave-tiles') {
        delay = (x + y * .62) / (cols + rows * .62) * 1.18;
      } else if (effect === 'screen-checkerboard') {
        delay = ((x + y) % 2 ? .62 : .06) + (y / rows) * .25;
      } else if (effect === 'screen-radial-pixels') {
        const dx = x - (cols - 1) / 2;
        const dy = y - (rows - 1) / 2;
        delay = Math.hypot(dx, dy) / Math.hypot(cols / 2, rows / 2) * 1.05;
      } else if (effect === 'screen-fragmentation') {
        delay = randomRank.get(i) / total * .5;
      } else if (effect === 'screen-grid-flip-3d') {
        delay = (x + y) / (cols + rows) * .95;
      } else if (effect === 'screen-domino-tiles') {
        delay = ((y % 2 ? (cols - 1 - x) : x) + y * .55) / (cols + rows * .55) * 1.05;
      } else if (effect === 'screen-spiral-tiles') {
        const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
        const dx = x - cx, dy = y - cy;
        const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
        const radius = Math.hypot(dx, dy) / Math.hypot(cx, cy);
        delay = Math.min(1.15, angle / (Math.PI * 2) * .72 + radius * .48);
      } else if (effect === 'screen-hex-dissolve') {
        delay = (randomRank.get(i) / total * .75) + (((x + (y % 2) * .5) % 3) * .09);
      } else {
        delay = (y / rows) * .65 + (x / cols) * .32;
      }

      // La salida se ejecuta en orden inverso para que no parezca el mismo barrido duplicado.
      if (direction === 'out') delay = Math.max(0, 1.15 - delay);
      tile.style.setProperty('--delay', `${delay}s`);
      overlay.appendChild(tile);
    }

    root.appendChild(overlay);
    fxOverlays.push(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-active'));
  }

  function makeTileOverlay(effect, oldUrl, newUrl, loadedImage) {
    clearFxOverlay();

    const oldNaturalWidth = currentImage.naturalWidth;
    const oldNaturalHeight = currentImage.naturalHeight;
    const newNaturalWidth = loadedImage && loadedImage.naturalWidth ? loadedImage.naturalWidth : nextImage.naturalWidth;
    const newNaturalHeight = loadedImage && loadedImage.naturalHeight ? loadedImage.naturalHeight : nextImage.naturalHeight;

    if (!oldNaturalWidth || !oldNaturalHeight || !newNaturalWidth || !newNaturalHeight) return;

    const oldRect = getContainedImageRect(currentImage, oldNaturalWidth, oldNaturalHeight);
    const newRect = getContainedImageRect(nextImage, newNaturalWidth, newNaturalHeight);

    // Dos geometrías independientes:
    // 1) la foto antigua se destruye exactamente donde estaba;
    // 2) la nueva se construye exactamente donde va a quedar.
    buildTileLayer(effect, oldUrl, oldRect, 'out');
    buildTileLayer(effect, newUrl, newRect, 'in');
  }



  function createOrganicTransitionCanvas(effect, oldUrl, newUrl, loadedImage) {
    clearFxOverlay();

    const oldW = currentImage.naturalWidth;
    const oldH = currentImage.naturalHeight;
    const newW = loadedImage && loadedImage.naturalWidth ? loadedImage.naturalWidth : nextImage.naturalWidth;
    const newH = loadedImage && loadedImage.naturalHeight ? loadedImage.naturalHeight : nextImage.naturalHeight;
    if (!oldW || !oldH || !newW || !newH) return;

    const oldRect = getContainedImageRect(currentImage, oldW, oldH);
    const newRect = getContainedImageRect(nextImage, newW, newH);

    const canvas = document.createElement('canvas');
    canvas.className = `screen-pixel-canvas ${effect}`;
    canvas.setAttribute('aria-hidden', 'true');

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(root.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(root.clientHeight * dpr));
    canvas.style.width = `${root.clientWidth}px`;
    canvas.style.height = `${root.clientHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const oldImg = new Image();
    const newImg = new Image();
    oldImg.src = oldUrl;
    newImg.src = newUrl;

    const sparse = effect === 'screen-organic-burn-map';
    const seedCount = sparse ? 11 : 28;
    const seeds = [];

    for (let i = 0; i < seedCount; i++) {
      seeds.push({
        x: newRect.left + Math.random() * newRect.width,
        y: newRect.top + Math.random() * newRect.height,
        start: sparse ? Math.random() * .48 : Math.random() * .58,
        speed: sparse ? (.72 + Math.random() * .45) : (.52 + Math.random() * .45),
        base: sparse ? (34 + Math.random() * 58) : (13 + Math.random() * 32),
        max: sparse
          ? Math.max(newRect.width, newRect.height) * (.42 + Math.random() * .34)
          : Math.max(newRect.width, newRect.height) * (.22 + Math.random() * .24),
        wobble: Math.random() * Math.PI * 2,
        lobes: sparse ? 7 + Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 5)
      });
    }

    root.appendChild(canvas);
    fxOverlays.push(canvas);

    const duration = TRANSITION_TIME;
    const start = performance.now();

    function contained(img, rect, alpha = 1) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
      ctx.globalAlpha = 1;
    }

    function organicPath(seed, radius, timePhase) {
      const points = 42;
      ctx.moveTo(
        seed.x + radius * (1 + .10 * Math.sin(seed.wobble + timePhase)) ,
        seed.y
      );
      for (let k = 1; k <= points; k++) {
        const a = k / points * Math.PI * 2;
        const n =
          1 +
          .115 * Math.sin(a * seed.lobes + seed.wobble) +
          .065 * Math.sin(a * (seed.lobes + 3) - seed.wobble * 1.7) +
          .035 * Math.sin(a * 17 + timePhase);
        const rr = radius * n;
        ctx.lineTo(seed.x + Math.cos(a) * rr, seed.y + Math.sin(a) * rr);
      }
      ctx.closePath();
    }

    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, root.clientWidth, root.clientHeight);

      if (oldImg.complete) contained(oldImg, oldRect, 1);

      if (newImg.complete) {
        ctx.save();
        ctx.beginPath();

        for (const seed of seeds) {
          const local = Math.max(0, Math.min(1, (p - seed.start) / Math.max(.12, 1 - seed.start)));
          if (local <= 0) continue;
          const eased = 1 - Math.pow(1 - local, sparse ? 1.55 : 1.9);
          const radius = seed.base + seed.max * eased * seed.speed;
          organicPath(seed, radius, p * 4.5);
        }

        // In the last part, guarantee complete convergence while keeping organic edges.
        if (p > .82) {
          const cover = (p - .82) / .18;
          if (cover > .92) ctx.rect(0, 0, root.clientWidth, root.clientHeight);
        }

        ctx.clip();
        contained(newImg, newRect, 1);
        ctx.restore();
      }

      // Fade any portions of an old larger photograph that lie outside the new rect,
      // only at the very end after the organic islands have done the visible work.
      if (p > .86 && oldImg.complete) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = Math.min(1, (p - .86) / .14);
        ctx.fillStyle = '#000';
        ctx.fillRect(oldRect.left, oldRect.top, oldRect.width, oldRect.height);
        ctx.restore();

        if (newImg.complete) {
          ctx.globalAlpha = Math.min(1, (p - .86) / .14);
          contained(newImg, newRect, 1);
          ctx.globalAlpha = 1;
        }
      }

      if (p < 1) pixelFusionRaf = requestAnimationFrame(frame);
      else pixelFusionRaf = null;
    }

    pixelFusionRaf = requestAnimationFrame(frame);
  }

  function createPixelFusionCanvas(effect, oldUrl, newUrl, loadedImage) {
    clearFxOverlay();

    const oldW = currentImage.naturalWidth;
    const oldH = currentImage.naturalHeight;
    const newW = loadedImage && loadedImage.naturalWidth ? loadedImage.naturalWidth : nextImage.naturalWidth;
    const newH = loadedImage && loadedImage.naturalHeight ? loadedImage.naturalHeight : nextImage.naturalHeight;
    if (!oldW || !oldH || !newW || !newH) return;

    const oldRect = getContainedImageRect(currentImage, oldW, oldH);
    const newRect = getContainedImageRect(nextImage, newW, newH);

    const canvas = document.createElement('canvas');
    canvas.className = `screen-pixel-canvas ${effect}`;
    canvas.setAttribute('aria-hidden', 'true');

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(root.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(root.clientHeight * dpr));
    canvas.style.width = `${root.clientWidth}px`;
    canvas.style.height = `${root.clientHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    const oldImg = new Image();
    const newImg = new Image();
    oldImg.src = oldUrl;
    newImg.src = newUrl;

    const block = Math.max(2, Math.min(4, Math.round(root.clientWidth / 520)));
    const cols = Math.ceil(newRect.width / block);
    const rows = Math.ceil(newRect.height / block);
    const total = cols * rows;

    // Deterministic-looking random thresholds; no visible square-grid sweep.
    const thresholds = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      // mix pseudo-random with a tiny spatial wave so neighbouring pixels occasionally melt together
      const x = i % cols;
      const y = Math.floor(i / cols);
      const wave = (Math.sin(x * .71 + y * 1.13) + Math.sin(x * .17 - y * .43)) * .035;
      thresholds[i] = Math.min(1, Math.max(0, Math.random() * .93 + .035 + wave));
    }

    root.appendChild(canvas);
    fxOverlays.push(canvas);

    const duration = TRANSITION_TIME;
    const start = performance.now();

    function drawImageContained(img, rect, alpha = 1) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, root.clientWidth, root.clientHeight);

      if (effect === 'screen-pixel-fusion') {
        // Old image stays complete; new image grows through tiny random pixels.
        if (oldImg.complete) drawImageContained(oldImg, oldRect, 1);

        if (newImg.complete) {
          ctx.save();
          ctx.beginPath();
          const eased = p * p * (3 - 2 * p);
          for (let i = 0; i < total; i++) {
            if (thresholds[i] <= eased) {
              const x = i % cols;
              const y = Math.floor(i / cols);
              ctx.rect(
                newRect.left + x * block,
                newRect.top + y * block,
                Math.min(block + .45, newRect.width - x * block),
                Math.min(block + .45, newRect.height - y * block)
              );
            }
          }
          ctx.clip();
          drawImageContained(newImg, newRect, 1);
          ctx.restore();
        }

        // Old image softly loses presence only near the end, preventing hard remnants
        // when the two photographs have different aspect ratios.
        if (p > .72 && oldImg.complete) {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.globalAlpha = Math.min(1, (p - .72) / .28);
          ctx.fillStyle = '#000';
          ctx.fillRect(oldRect.left, oldRect.top, oldRect.width, oldRect.height);
          ctx.restore();
        }
      } else {
        // Crystallize: begin with the new image ghosted, then solidify it pixel by pixel
        // while the old image disappears through complementary tiny gaps.
        if (oldImg.complete) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - p * .92);
          drawImageContained(oldImg, oldRect, 1);
          ctx.restore();
        }

        if (newImg.complete) {
          ctx.save();
          ctx.beginPath();
          const eased = 1 - Math.pow(1 - p, 2.2);
          for (let i = 0; i < total; i++) {
            if (thresholds[i] <= eased) {
              const x = i % cols;
              const y = Math.floor(i / cols);
              ctx.rect(
                newRect.left + x * block,
                newRect.top + y * block,
                Math.min(block + .45, newRect.width - x * block),
                Math.min(block + .45, newRect.height - y * block)
              );
            }
          }
          ctx.clip();
          drawImageContained(newImg, newRect, 1);
          ctx.restore();
        }
      }

      if (p < 1) pixelFusionRaf = requestAnimationFrame(frame);
      else pixelFusionRaf = null;
    }

    pixelFusionRaf = requestAnimationFrame(frame);
  }

  function prepareSpecialEffect(effect, oldUrl, newUrl, loadedImage) {
    const isTile = tileEffects.has(effect);
    const isPixelFusion =
      effect === 'screen-pixel-fusion' ||
      effect === 'screen-pixel-crystallize' ||
      effect === 'screen-organic-erosion' ||
      effect === 'screen-organic-burn-map';
    root.classList.toggle('has-tile-fx', isTile);
    root.classList.toggle('has-pixel-fusion', isPixelFusion);

    if (isTile) {
      makeTileOverlay(effect, oldUrl, newUrl, loadedImage);
    } else if (effect === 'screen-organic-erosion' || effect === 'screen-organic-burn-map') {
      createOrganicTransitionCanvas(effect, oldUrl, newUrl, loadedImage);
    } else if (isPixelFusion) {
      createPixelFusionCanvas(effect, oldUrl, newUrl, loadedImage);
    } else {
      clearFxOverlay();
    }
  }


  function setInitial(item) {
    currentItem = item;
    currentImage.src = item.url;
    currentImage.alt = item.name;
    currentBg.style.backgroundImage = cssUrl(item.url);
    status.hidden = true;
  }

  async function nextLoadableItem(){
    if(!deck)return null;
    const attempts=Math.max(deck.images?deck.images.length:1,1);
    for(let i=0;i<attempts;i+=1){
      const item=deck.next();
      if(!item)return null;
      try{await preload(item.url);return item;}
      catch{deck.reject(item.url);}
    }
    return null;
  }

  async function showNext() {
    if (!deck || paused || changing || document.hidden) return;
    const item = deck.next(new Set(currentItem ? [currentItem.url] : []));
    if (!item) return;

    let loadedImage;
    try {
      loadedImage = await preload(item.url);
    } catch {
      if(deck)deck.reject(item.url);
      window.setTimeout(showNext,120);
      return;
    }

    changing = true;
    const effect = nextEffect();
    nextImage.src = item.url;
    nextImage.alt = item.name;
    nextBg.style.backgroundImage = cssUrl(item.url);
    prepareSpecialEffect(effect, currentItem ? currentItem.url : item.url, item.url, loadedImage);
    root.classList.add('is-changing', effect);

    const finish = () => {
      // En este momento la capa NEXT ya muestra la nueva imagen, tanto nítida como difuminada.
      // Copiamos esa misma imagen a CURRENT antes de retirar la transición. Después hacemos
      // un reset atómico, sin animaciones, para que no exista ningún instante con fondo vacío.
      currentImage.src = item.url;
      currentImage.alt = item.name;
      currentBg.style.backgroundImage = cssUrl(item.url);

      root.classList.add('is-resetting');
      root.classList.remove('is-changing', effect);

      // Forzar el estado final: CURRENT visible y NEXT invisible, pero ambas contienen aún
      // la misma imagen. Visualmente no puede producirse salto ni negro.
      void root.offsetWidth;

      requestAnimationFrame(() => {
        nextImage.removeAttribute('src');
        nextImage.alt = '';
        nextBg.style.backgroundImage = '';
        root.classList.remove('is-resetting');
        clearFxOverlay();
        root.classList.remove('has-tile-fx');
        root.classList.remove('has-pixel-fusion');
      });

      currentItem = item;
      changing = false;
      schedule();
    };

    window.setTimeout(finish, TRANSITION_TIME + 32);
  }

  function schedule() {
    window.clearTimeout(timer);
    if (!paused) timer = window.setTimeout(showNext, CYCLE_TIME);
  }

  function togglePause() {
    paused = !paused;
    pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (paused) window.clearTimeout(timer);
    else schedule();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // Algunos navegadores o marcos bloquean la pantalla completa.
    }
  }

  function revealControls() {
    if (root.classList.contains('clock-panel-open')) return;
    root.classList.remove('is-idle');
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => root.classList.add('is-idle'), 3200);
  }

  async function init() {
    try {
      const images = await EidosImageSource.loadImages();
      if (!images.length) {
        status.innerHTML = 'La carpeta <strong>gallery/images/gallery</strong> todavía no contiene imágenes.<br>Súbelas a GitHub y recarga la página.';
        return;
      }

      deck = new EidosImageSource.ImageDeck(images);
      const firstItem=await nextLoadableItem();
      if(!firstItem){
        status.classList.add('is-error');
        status.textContent='No se pudo cargar ninguna imagen registrada. Ejecuta ACTUALIZAR_GALERIA.bat para reconstruir la lista.';
        return;
      }
      setInitial(firstItem);
      schedule();
      revealControls();
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = `${error.message} Comprueba que la carpeta gallery/images/gallery exista en el repositorio público.`;
    }
  }

  pauseButton.addEventListener('click', togglePause);
  document.getElementById('screen-next').addEventListener('click', () => {
    paused = false;
    pauseButton.textContent = 'Pausar';
    window.clearTimeout(timer);
    showNext();
  });
  document.getElementById('screen-fullscreen').addEventListener('click', toggleFullscreen);

  ['pointermove', 'mousemove', 'mousedown', 'touchstart', 'keydown', 'focusin'].forEach(eventName => {
    document.addEventListener(eventName, revealControls, { passive: true });
  });

  document.addEventListener('keydown', event => {
    if (['INPUT','SELECT','BUTTON'].includes(document.activeElement?.tagName) && root.classList.contains('clock-panel-open')) return;
    if (event.code === 'Space') {
      event.preventDefault();
      togglePause();
    }
    if (event.key === 'ArrowRight') {
      window.clearTimeout(timer);
      showNext();
    }
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key === 'Escape' && !document.fullscreenElement) window.location.href = 'index.html';
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(timer);
    else schedule();
  });


  // ===== Reloj EIDOS V2.2: reloj opcional + cuenta atrás =====
  const clockRoot = document.getElementById('eidos-clock');
  const clockTime = document.getElementById('eidos-clock-time');
  const clockDate = document.getElementById('eidos-clock-date');
  const clockSettingsButton = document.getElementById('screen-clock-settings');
  const clockPanel = document.getElementById('clock-panel');
  const clockPanelClose = document.getElementById('clock-panel-close');
  const clockNormalOptions = document.getElementById('clock-normal-options');
  const clockCountdownOptions = document.getElementById('clock-countdown-options');
  const clockCountdownStatus = document.getElementById('clock-countdown-status');
  const clockCountdownPreset = document.getElementById('clock-countdown-preset');
  const clockPresetButton = document.getElementById('clock-preset-button');
  const clockPresetLabel = document.getElementById('clock-preset-label');
  const clockPresetMenu = document.getElementById('clock-preset-menu');
  const clockPresetOptions = [...clockPresetMenu.querySelectorAll('[data-value]')];
  const clockInputs = {
    enabled: document.getElementById('clock-enabled'),
    mode: document.getElementById('clock-mode'),
    showTime: document.getElementById('clock-show-time'),
    showDate: document.getElementById('clock-show-date'),
    showSeconds: document.getElementById('clock-show-seconds'),
    is24h: document.getElementById('clock-24h'),
    motion: document.getElementById('clock-motion'),
    style: document.getElementById('clock-style'),
    countdownHours: document.getElementById('clock-countdown-hours'),
    countdownMinutes: document.getElementById('clock-countdown-minutes'),
    countdownSeconds: document.getElementById('clock-countdown-seconds'),
    countdownSound: document.getElementById('clock-countdown-sound')
  };
  const countdownButtons = {
    start: document.getElementById('clock-countdown-start'),
    pause: document.getElementById('clock-countdown-pause'),
    reset: document.getElementById('clock-countdown-reset'),
    minus: document.getElementById('clock-countdown-minus'),
    plus: document.getElementById('clock-countdown-plus')
  };

  const CLOCK_KEY = 'eidosClockSettingsV22';
  const clockDefaults = {
    enabled: false,
    mode: 'clock',
    showTime: true,
    showDate: true,
    showSeconds: false,
    is24h: true,
    motion: true,
    style: 'evolving',
    countdownMinutes: 10,
    countdownDurationSeconds: 10 * 60,
    countdownSound: true,
    countdownRunning: false,
    countdownEnd: 0,
    countdownRemaining: 10 * 60 * 1000
  };
  const SEGMENTS = {
    '0':'abcdef', '1':'bc', '2':'abdeg', '3':'abcdg', '4':'bcfg',
    '5':'acdfg', '6':'acdefg', '7':'abc', '8':'abcdefg', '9':'abcdfg'
  };
  let clockSettings={...clockDefaults}, clockMoveTimer=null, clockPhaseTimer=null, clockColorTimer=null;
  let previousParts=null, lastMinuteStamp='', lastCountdownSecond=null;
  let countdownFinishPlayed=false, finishFxTimer=null, lastCountdownTickSecond=null;

  function clampInt(value,min,max,fallback=0){
    const n=Math.round(Number(value));
    return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
  }
  const COUNTDOWN_PRESETS=new Set([300,600,900,1800,2700,3600,7200]);
  function syncCountdownPreset(totalSeconds){
    const total=Math.max(1,Math.round(Number(totalSeconds)||600));
    const value=COUNTDOWN_PRESETS.has(total)?String(total):'custom';
    clockCountdownPreset.value=value;
    const option=clockCountdownPreset.querySelector(`option[value="${value}"]`);
    if(clockPresetLabel) clockPresetLabel.textContent=option?option.textContent:'Personalizado';
    if(clockPresetOptions) clockPresetOptions.forEach(btn=>btn.classList.toggle('is-selected',btn.dataset.value===value));
  }
  function durationFromInputs(){
    const h=clampInt(clockInputs.countdownHours.value,0,99,0);
    const m=clampInt(clockInputs.countdownMinutes.value,0,59,0);
    const s=clampInt(clockInputs.countdownSeconds.value,0,59,0);
    const total=h*3600+m*60+s;
    return Math.max(1,total);
  }
  function setDurationInputs(totalSeconds){
    const total=Math.max(1,Math.round(Number(totalSeconds)||600));
    const h=Math.min(99,Math.floor(total/3600));
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    clockInputs.countdownHours.value=h;
    clockInputs.countdownMinutes.value=m;
    clockInputs.countdownSeconds.value=s;
    if(typeof clockCountdownPreset!=='undefined' && clockCountdownPreset) syncCountdownPreset(total);
  }
  function normalizeDurationSettings(){
    let total=Number(clockSettings.countdownDurationSeconds);
    if(!Number.isFinite(total)||total<1){
      total=Math.max(1,(Number(clockSettings.countdownMinutes)||10)*60);
    }
    clockSettings.countdownDurationSeconds=Math.min(99*3600+59*60+59,Math.round(total));
    clockSettings.countdownMinutes=Math.max(1,Math.ceil(clockSettings.countdownDurationSeconds/60));
  }
  function loadClockSettings(){
    try{clockSettings={...clockDefaults,...JSON.parse(localStorage.getItem(CLOCK_KEY)||'{}')}}catch{clockSettings={...clockDefaults}}
    clockSettings.mode=clockSettings.mode==='countdown'?'countdown':'clock';
    clockSettings.style=['evolving','digital','fluid'].includes(clockSettings.style)?clockSettings.style:'evolving';
    normalizeDurationSettings();
    if(clockSettings.countdownRunning && clockSettings.countdownEnd<=Date.now()){
      clockSettings.countdownRunning=false; clockSettings.countdownRemaining=0;
    }
    clockInputs.enabled.checked=!!clockSettings.enabled;
    clockInputs.mode.value=clockSettings.mode;
    clockInputs.showTime.checked=!!clockSettings.showTime;
    clockInputs.showDate.checked=!!clockSettings.showDate;
    clockInputs.showSeconds.checked=!!clockSettings.showSeconds;
    clockInputs.is24h.checked=!!clockSettings.is24h;
    clockInputs.motion.checked=!!clockSettings.motion;
    clockInputs.style.value=clockSettings.style;
    setDurationInputs(clockSettings.countdownDurationSeconds);
    clockInputs.countdownSound.checked=clockSettings.countdownSound!==false;
  }
  function saveClockSettings(){try{localStorage.setItem(CLOCK_KEY,JSON.stringify(clockSettings))}catch{}}
  function readClockSettingsFromUI(){
    const previousMode=clockSettings.mode;
    clockSettings.enabled=clockInputs.enabled.checked;
    clockSettings.mode=clockInputs.mode.value==='countdown'?'countdown':'clock';
    clockSettings.showTime=clockInputs.showTime.checked;
    clockSettings.showDate=clockInputs.showDate.checked;
    clockSettings.showSeconds=clockInputs.showSeconds.checked;
    clockSettings.is24h=clockInputs.is24h.checked;
    clockSettings.motion=clockInputs.motion.checked;
    clockSettings.style=clockInputs.style.value;
    clockSettings.countdownDurationSeconds=durationFromInputs();
    clockSettings.countdownMinutes=Math.max(1,Math.ceil(clockSettings.countdownDurationSeconds/60));
    clockSettings.countdownSound=clockInputs.countdownSound.checked;
    setDurationInputs(clockSettings.countdownDurationSeconds);
    if(previousMode!==clockSettings.mode){previousParts=null;lastCountdownSecond=null;clockRoot.classList.remove('countdown-finished')}
    saveClockSettings(); applyClockSettings();
  }
  function getClockParts(now){
    let hours=now.getHours(), suffix='';
    if(!clockSettings.is24h){suffix=hours>=12?'PM':'AM';hours=hours%12||12}
    return {h:String(hours).padStart(clockSettings.is24h?2:1,'0'),m:String(now.getMinutes()).padStart(2,'0'),s:String(now.getSeconds()).padStart(2,'0'),suffix};
  }
  function getCountdownRemaining(){
    if(clockSettings.countdownRunning) return Math.max(0,clockSettings.countdownEnd-Date.now());
    return Math.max(0,Number(clockSettings.countdownRemaining)||0);
  }
  function getCountdownParts(ms){
    const totalSeconds=Math.max(0,Math.ceil(ms/1000));
    const h=Math.floor(totalSeconds/3600);
    const m=Math.floor((totalSeconds%3600)/60);
    const sec=totalSeconds%60;
    return {h:String(h).padStart(2,'0'),m:String(m).padStart(2,'0'),s:String(sec).padStart(2,'0'),suffix:''};
  }
  function formatDate(now){const months=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];return `${String(now.getDate()).padStart(2,'0')} · ${months[now.getMonth()]} · ${now.getFullYear()}`}

  function makeDigit(value,index){
    const digit=document.createElement('span'); digit.className='clock-digit'; digit.dataset.value=value; digit.dataset.index=index;
    for(const name of 'abcdefg'){
      const seg=document.createElement('i'); seg.className='clock-seg'; seg.dataset.s=name;
      const angle=((index*37+name.charCodeAt(0)*19)%92)-46;
      const x=(((index+3)*29+name.charCodeAt(0)*13)%58)-29;
      const y=(((index+5)*31+name.charCodeAt(0)*17)%50)-25;
      seg.style.setProperty('--scatter-x',`${x}px`); seg.style.setProperty('--scatter-y',`${y}px`); seg.style.setProperty('--scatter-r',`${angle}deg`);
      seg.style.setProperty('--scatter-delay',`${('abcdefg'.indexOf(name)*23)%95}ms`);
      if((SEGMENTS[value]||'').includes(name)) seg.classList.add('is-on'); digit.appendChild(seg);
    }
    return digit;
  }
  function makeColon(){const c=document.createElement('span');c.className='clock-colon';c.setAttribute('aria-hidden','true');return c}
  function makeSuffix(text){const s=document.createElement('span');s.className='clock-suffix';s.textContent=text;return s}
  function buildClock(parts,forceSeconds=false){
    const showSeconds=forceSeconds||clockSettings.showSeconds;
    const frag=document.createDocumentFragment();let idx=0;
    [...parts.h].forEach(ch=>frag.appendChild(makeDigit(ch,idx++))); frag.appendChild(makeColon());
    [...parts.m].forEach(ch=>frag.appendChild(makeDigit(ch,idx++)));
    if(showSeconds){frag.appendChild(makeColon());[...parts.s].forEach(ch=>frag.appendChild(makeDigit(ch,idx++)))}
    if(parts.suffix)frag.appendChild(makeSuffix(parts.suffix));
    clockTime.replaceChildren(frag); clockTime.setAttribute('aria-label',`${parts.h}:${parts.m}${showSeconds?':'+parts.s:''}${parts.suffix?' '+parts.suffix:''}`);
  }
  function digitsOnly(parts,forceSeconds=false){return `${parts.h}${parts.m}${(forceSeconds||clockSettings.showSeconds)?parts.s:''}`}
  function animateValueChange(nextParts,forceSeconds=false,strong=true){
    const currentDigits=[...clockTime.querySelectorAll('.clock-digit')];
    const oldString=previousParts?digitsOnly(previousParts,forceSeconds):''; const newString=digitsOnly(nextParts,forceSeconds);
    const changed=[]; for(let i=0;i<Math.max(oldString.length,newString.length);i++) if(oldString[i]!==newString[i])changed.push(i);
    const targets=currentDigits.filter((_,i)=>changed.includes(i));
    if(!strong||!targets.length){buildClock(nextParts,forceSeconds);return}
    targets.forEach((d,i)=>{d.classList.remove('is-reintegrating');d.classList.add('is-disintegrating');d.style.setProperty('--digit-delay',`${i*35}ms`)});
    window.setTimeout(()=>{
      buildClock(nextParts,forceSeconds);
      const fresh=[...clockTime.querySelectorAll('.clock-digit')].filter((_,i)=>changed.includes(i));
      fresh.forEach(d=>d.classList.add('is-reintegrating'));
      window.setTimeout(()=>fresh.forEach(d=>d.classList.remove('is-reintegrating')),900);
    },620);
  }
  function updateNormalClock(){
    const now=new Date(), parts=getClockParts(now); const stamp=`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    if(!previousParts) buildClock(parts);
    else if(stamp!==lastMinuteStamp) animateValueChange(parts,false,true);
    else if(clockSettings.showSeconds && parts.s!==previousParts.s) buildClock(parts);
    previousParts=parts; lastMinuteStamp=stamp; clockDate.textContent=formatDate(now);
  }


  function playCountdownTick(){
    if(!clockSettings.countdownSound)return;
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      const ac=new AudioCtx();
      const o=ac.createOscillator();
      const g=ac.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(880,ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(760,ac.currentTime+.055);
      g.gain.setValueAtTime(.0001,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.045,ac.currentTime+.008);
      g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.12);
      o.connect(g);g.connect(ac.destination);
      o.start();o.stop(ac.currentTime+.14);
      window.setTimeout(()=>ac.close().catch(()=>{}),280);
    }catch{}
  }

  function pulseCountdownTick(){
    clockRoot.classList.remove('countdown-tick');
    void clockRoot.offsetWidth;
    clockRoot.classList.add('countdown-tick');
    window.setTimeout(()=>clockRoot.classList.remove('countdown-tick'),520);
  }

  function playFinishChime(){
    if(!clockSettings.countdownSound)return;
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      const ac=new AudioCtx();
      const master=ac.createGain();
      master.gain.setValueAtTime(.0001,ac.currentTime);
      master.gain.exponentialRampToValueAtTime(.11,ac.currentTime+.035);
      master.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+2.6);
      master.connect(ac.destination);
      const notes=[659.25,523.25,392.00];
      notes.forEach((freq,i)=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.type='sine';o.frequency.setValueAtTime(freq,ac.currentTime+i*.24);
        g.gain.setValueAtTime(.0001,ac.currentTime+i*.24);
        g.gain.exponentialRampToValueAtTime(.55,ac.currentTime+i*.24+.025);
        g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+i*.24+1.35);
        o.connect(g);g.connect(master);o.start(ac.currentTime+i*.24);o.stop(ac.currentTime+i*.24+1.5);
      });
      window.setTimeout(()=>ac.close().catch(()=>{}),3200);
    }catch{}
  }

  function createMemoryBurst(){
    const old=document.querySelector('.countdown-memory-burst');if(old)old.remove();
    const burst=document.createElement('div');burst.className='countdown-memory-burst';burst.setAttribute('aria-hidden','true');
    const url=currentItem&&currentItem.url?currentItem.url:(currentImage.currentSrc||currentImage.src);
    if(!url)return;
    const pieces=42,cols=7,rows=6;
    for(let i=0;i<pieces;i++){
      const x=i%cols,y=Math.floor(i/cols),p=document.createElement('i');
      p.style.left=`${x*100/cols}%`;p.style.top=`${y*100/rows}%`;
      p.style.width=`${100/cols+.15}%`;p.style.height=`${100/rows+.15}%`;
      p.style.backgroundImage=cssUrl(url);p.style.backgroundSize=`${cols*100}% ${rows*100}%`;
      p.style.backgroundPosition=`${x*100/(cols-1)}% ${y*100/(rows-1)}%`;
      const dx=(x-(cols-1)/2)*(13+Math.random()*11)+(Math.random()-.5)*70;
      const dy=(y-(rows-1)/2)*(12+Math.random()*11)+(Math.random()-.5)*65;
      p.style.setProperty('--burst-x',`${dx}px`);p.style.setProperty('--burst-y',`${dy}px`);
      p.style.setProperty('--burst-r',`${(Math.random()-.5)*24}deg`);
      p.style.setProperty('--burst-delay',`${Math.random()*150}ms`);
      burst.appendChild(p);
    }
    root.appendChild(burst);
    requestAnimationFrame(()=>burst.classList.add('is-active'));
    window.setTimeout(()=>burst.remove(),5200);
  }

  function triggerCountdownFinish(){
    if(countdownFinishPlayed)return;
    countdownFinishPlayed=true;
    window.clearTimeout(finishFxTimer);
    clockRoot.classList.remove('countdown-celebrate','countdown-tick');
    void clockRoot.offsetWidth;
    clockRoot.classList.add('countdown-celebrate');
    playFinishChime();
    createMemoryBurst();
    finishFxTimer=window.setTimeout(()=>clockRoot.classList.remove('countdown-celebrate'),5600);
  }

  function formatCountdownStatus(ms){
    const t=Math.max(0,Math.ceil(ms/1000));
    const h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;
    if(h>0)return `${h} h ${String(m).padStart(2,'0')} min ${String(s).padStart(2,'0')} s`;
    if(m>0)return `${m} min ${String(s).padStart(2,'0')} s`;
    return `${s} s`;
  }

  function updateCountdown(){
    const remaining=getCountdownRemaining();
    const totalSeconds=Math.max(0,Math.ceil(remaining/1000));

    if(clockSettings.countdownRunning && totalSeconds>0 && totalSeconds<=3 && totalSeconds!==lastCountdownTickSecond){
      lastCountdownTickSecond=totalSeconds;
      playCountdownTick();
      pulseCountdownTick();
    }
    if(totalSeconds>3) lastCountdownTickSecond=null;

    const parts=getCountdownParts(remaining);
    const minuteBoundary=lastCountdownSecond!==null && Math.floor(lastCountdownSecond/60)!==Math.floor(totalSeconds/60);
    if(!previousParts) buildClock(parts,true);
    else if(totalSeconds!==lastCountdownSecond) animateValueChange(parts,true,minuteBoundary);
    previousParts=parts; lastCountdownSecond=totalSeconds;
    clockDate.hidden=true;
    const totalDuration=clockSettings.countdownDurationSeconds;
    if(remaining<=0){
      const wasRunning=clockSettings.countdownRunning;
      if(clockSettings.countdownRunning){clockSettings.countdownRunning=false;clockSettings.countdownRemaining=0;saveClockSettings()}
      clockRoot.classList.add('countdown-finished');
      clockCountdownStatus.textContent='Finalizada';
      if(wasRunning)triggerCountdownFinish();
    }else{
      countdownFinishPlayed=false;
      clockRoot.classList.remove('countdown-finished');
      clockCountdownStatus.textContent=clockSettings.countdownRunning?'En marcha':`Pausada · ${formatCountdownStatus(remaining)}`;
    }
    if(!clockSettings.countdownRunning && Math.abs(remaining-totalDuration*1000)<1000) clockCountdownStatus.textContent=`Preparado · ${formatCountdownStatus(remaining)}`;
  }
  function updateClock(){
    if(!clockSettings.enabled)return;
    if(clockSettings.mode==='countdown') updateCountdown(); else updateNormalClock();
  }
  function startCountdown(){
    const durationSeconds=durationFromInputs();
    clockSettings.countdownDurationSeconds=durationSeconds;
    clockSettings.countdownMinutes=Math.max(1,Math.ceil(durationSeconds/60));
    setDurationInputs(durationSeconds);

    let remaining=getCountdownRemaining();
    const configuredMs=durationSeconds*1000;

    if(remaining<=0 || (!clockSettings.countdownRunning && lastCountdownSecond===null)) remaining=configuredMs;
    if(!clockSettings.countdownRunning && Math.abs(remaining-configuredMs)>1000 && lastCountdownSecond===null) remaining=configuredMs;

    clockSettings.countdownRemaining=remaining;
    clockSettings.countdownEnd=Date.now()+remaining;
    clockSettings.countdownRunning=true;
    clockSettings.enabled=true; clockInputs.enabled.checked=true;
    countdownFinishPlayed=false; lastCountdownTickSecond=null; clockRoot.classList.remove('countdown-finished','countdown-celebrate','countdown-tick'); previousParts=null; lastCountdownSecond=null;
    saveClockSettings();applyClockSettings();
    setClockPanel(false);
  }
  function pauseCountdown(){
    if(clockSettings.countdownRunning) clockSettings.countdownRemaining=getCountdownRemaining();
    clockSettings.countdownRunning=false; clockSettings.countdownEnd=0;
    saveClockSettings();updateCountdown();
  }
  function resetCountdown(){
    const durationSeconds=durationFromInputs();
    clockSettings.countdownDurationSeconds=durationSeconds;
    clockSettings.countdownMinutes=Math.max(1,Math.ceil(durationSeconds/60));
    clockSettings.countdownRunning=false;
    clockSettings.countdownEnd=0;
    clockSettings.countdownRemaining=durationSeconds*1000;
    setDurationInputs(durationSeconds);
    countdownFinishPlayed=false; lastCountdownTickSecond=null; clockRoot.classList.remove('countdown-finished','countdown-celebrate','countdown-tick');previousParts=null;lastCountdownSecond=null;
    saveClockSettings();updateCountdown();
    setClockPanel(false);
  }
  function scheduleClockMove(){
    window.clearTimeout(clockMoveTimer);clockRoot.classList.toggle('is-static',!clockSettings.motion);
    if(!clockSettings.enabled||!clockSettings.motion||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const move=()=>{const points=[[13+Math.random()*24,17+Math.random()*20],[62+Math.random()*23,17+Math.random()*21],[61+Math.random()*24,61+Math.random()*20],[14+Math.random()*24,61+Math.random()*20],[35+Math.random()*28,72+Math.random()*10]];const[x,y]=points[Math.floor(Math.random()*points.length)];clockRoot.style.left=`${x}%`;clockRoot.style.top=`${y}%`;clockMoveTimer=window.setTimeout(move,15000+Math.random()*11000)};
    clockMoveTimer=window.setTimeout(move,1800);
  }
  function scheduleClockPhase(){
    window.clearTimeout(clockPhaseTimer);clockRoot.classList.remove('clock-style-digital','clock-style-fluid','clock-style-evolving','is-fluid-phase');clockRoot.classList.add(`clock-style-${clockSettings.style}`);
    if(!clockSettings.enabled||clockSettings.style!=='evolving'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const phase=()=>{clockRoot.classList.toggle('is-fluid-phase');clockPhaseTimer=window.setTimeout(phase,12000+Math.random()*9000)};clockPhaseTimer=window.setTimeout(phase,9000);
  }
  function scheduleClockColor(){
    window.clearTimeout(clockColorTimer);
    const palette=[
      ['rgba(232,250,246,.91)','rgba(71,224,197,.38)','rgba(91,238,208,.62)'],
      ['rgba(255,219,142,.91)','rgba(244,158,48,.38)','rgba(255,184,74,.64)'],
      ['rgba(196,224,255,.92)','rgba(74,154,255,.38)','rgba(98,178,255,.62)'],
      ['rgba(188,246,214,.90)','rgba(55,217,135,.36)','rgba(75,236,153,.60)'],
      ['rgba(241,205,255,.89)','rgba(190,91,238,.34)','rgba(207,119,247,.58)']
    ];
    let last=-1;
    const shift=()=>{let i;do{i=Math.floor(Math.random()*palette.length)}while(i===last&&palette.length>1);last=i;const[c,g,a]=palette[i];clockRoot.style.setProperty('--clock-color',c);clockRoot.style.setProperty('--clock-glow',g);clockRoot.style.setProperty('--clock-accent',a);clockColorTimer=window.setTimeout(shift,9000+Math.random()*5000)};
    shift();
  }
  function updatePanelMode(){
    const countdown=clockSettings.mode==='countdown';
    clockNormalOptions.hidden=countdown;
    clockCountdownOptions.hidden=!countdown;
    countdownButtons.pause.disabled=!clockSettings.countdownRunning;
    countdownButtons.start.textContent=clockSettings.countdownRunning?'Reanudar':'Iniciar';
  }
  function applyClockSettings(){
    clockRoot.style.display=clockSettings.enabled?'':'none';
    clockTime.hidden=clockSettings.mode==='clock'?!clockSettings.showTime:false;
    clockDate.hidden=clockSettings.mode==='countdown'||!clockSettings.showDate;
    clockRoot.classList.toggle('is-countdown',clockSettings.mode==='countdown');
    updatePanelMode();scheduleClockMove();scheduleClockPhase();previousParts=null;updateClock();
  }
  function setClockPanel(open){clockPanel.hidden=!open;root.classList.toggle('clock-panel-open',open);clockSettingsButton.setAttribute('aria-expanded',String(open));if(open){root.classList.remove('is-idle');window.clearTimeout(idleTimer)}else revealControls()}

  let activeCountdownField='minutes';
  function markActiveCountdownField(field){
    activeCountdownField=field;
    [clockInputs.countdownHours,clockInputs.countdownMinutes,clockInputs.countdownSeconds].forEach(el=>{
      el.closest('.clock-time-cell').classList.toggle('is-active',el===field);
    });
  }
  function stepCountdownField(delta){
    const map={
      hours:[clockInputs.countdownHours,0,99],
      minutes:[clockInputs.countdownMinutes,0,59],
      seconds:[clockInputs.countdownSeconds,0,59]
    };
    const [input,min,max]=map[activeCountdownField]||map.minutes;
    input.value=clampInt(Number(input.value)+delta,min,max,0);
    clockSettings.countdownDurationSeconds=durationFromInputs();
    clockSettings.countdownMinutes=Math.max(1,Math.ceil(clockSettings.countdownDurationSeconds/60));
    syncCountdownPreset(clockSettings.countdownDurationSeconds);
    clockSettings.countdownRunning=false;
    clockSettings.countdownEnd=0;
    clockSettings.countdownRemaining=clockSettings.countdownDurationSeconds*1000;
    previousParts=null;lastCountdownSecond=null;lastCountdownTickSecond=null;
    saveClockSettings();updateCountdown();
  }

  loadClockSettings();syncCountdownPreset(clockSettings.countdownDurationSeconds);applyClockSettings();scheduleClockColor();window.setInterval(updateClock,250);
  [clockInputs.enabled,clockInputs.mode,clockInputs.showTime,clockInputs.showDate,clockInputs.showSeconds,clockInputs.is24h,clockInputs.motion,clockInputs.style,clockInputs.countdownSound].forEach(input=>input.addEventListener('change',readClockSettingsFromUI));
  [clockInputs.countdownHours,clockInputs.countdownMinutes,clockInputs.countdownSeconds].forEach((input,index)=>{
    const names=['hours','minutes','seconds'];
    input.addEventListener('focus',()=>markActiveCountdownField(names[index]));
    input.addEventListener('click',()=>markActiveCountdownField(names[index]));
    input.addEventListener('change',()=>{
      const limits=[[0,99],[0,59],[0,59]][index];
      input.value=clampInt(input.value,limits[0],limits[1],0);
      clockSettings.countdownDurationSeconds=durationFromInputs();
      clockSettings.countdownMinutes=Math.max(1,Math.ceil(clockSettings.countdownDurationSeconds/60));
      syncCountdownPreset(clockSettings.countdownDurationSeconds);
      clockSettings.countdownRunning=false;
      clockSettings.countdownEnd=0;
      clockSettings.countdownRemaining=clockSettings.countdownDurationSeconds*1000;
      previousParts=null;lastCountdownSecond=null;lastCountdownTickSecond=null;
      saveClockSettings();updateCountdown();
    });
  });
  function applyCountdownPreset(value){
    if(value==='custom'){
      clockCountdownPreset.value='custom';
      syncCountdownPreset(clockSettings.countdownDurationSeconds);
      return;
    }
    const seconds=Number(value);
    if(!Number.isFinite(seconds)||seconds<1)return;
    clockSettings.countdownDurationSeconds=seconds;
    clockSettings.countdownMinutes=Math.max(1,Math.ceil(seconds/60));
    clockSettings.countdownRunning=false;
    clockSettings.countdownEnd=0;
    clockSettings.countdownRemaining=seconds*1000;
    setDurationInputs(seconds);
    previousParts=null;
    lastCountdownSecond=null;
    lastCountdownTickSecond=null;
    countdownFinishPlayed=false;
    saveClockSettings();
    updateCountdown();
  }

  clockCountdownPreset.addEventListener('change',()=>applyCountdownPreset(clockCountdownPreset.value));

  function setPresetMenu(open){
    clockPresetMenu.classList.toggle('is-open',open);
    clockPresetButton.setAttribute('aria-expanded',String(open));
  }
  clockPresetButton.addEventListener('click',e=>{
    e.stopPropagation();
    setPresetMenu(!clockPresetMenu.classList.contains('is-open'));
  });
  clockPresetOptions.forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.dataset.value!=='custom') applyCountdownPreset(btn.dataset.value);
    setPresetMenu(false);
  }));
  document.addEventListener('click',e=>{
    if(!clockPresetMenu.contains(e.target) && !clockPresetButton.contains(e.target)) setPresetMenu(false);
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') setPresetMenu(false);
  });
  markActiveCountdownField('minutes');
  countdownButtons.start.addEventListener('click',startCountdown);
  countdownButtons.pause.addEventListener('click',pauseCountdown);
  countdownButtons.reset.addEventListener('click',resetCountdown);
  countdownButtons.minus.addEventListener('click',()=>stepCountdownField(-1));
  countdownButtons.plus.addEventListener('click',()=>stepCountdownField(1));
  clockSettingsButton.addEventListener('click',event=>{event.stopPropagation();setClockPanel(clockPanel.hidden)});clockPanelClose.addEventListener('click',()=>setClockPanel(false));clockPanel.addEventListener('pointerdown',event=>event.stopPropagation());


  init();
})();
