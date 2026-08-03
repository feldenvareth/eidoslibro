(() => {
  'use strict';

  const CYCLE_TIME = 9000;
  const TRANSITION_TIME = 2200;
  const effects = [
    'screen-fade', 'screen-zoom', 'screen-drift-left', 'screen-drift-right',
    'screen-rise', 'screen-fall', 'screen-flip-x', 'screen-flip-y',
    'screen-orbit', 'screen-blur', 'screen-depth', 'screen-diagonal'
  ];

  const root = document.getElementById('screensaver');
  const status = document.getElementById('screen-status');
  const pauseButton = document.getElementById('screen-pause');
  const currentImage = document.querySelector('.screen-image--current');
  const nextImage = document.querySelector('.screen-image--next');
  const currentBg = document.querySelector('.screen-bg--current');
  const nextBg = document.querySelector('.screen-bg--next');

  let deck = null;
  let currentItem = null;
  let timer = null;
  let paused = false;
  let changing = false;
  let idleTimer = null;

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

  function setInitial(item) {
    currentItem = item;
    currentImage.src = item.url;
    currentImage.alt = item.name;
    currentBg.style.backgroundImage = cssUrl(item.url);
    status.hidden = true;
  }

  async function showNext() {
    if (!deck || paused || changing || document.hidden) return;
    const item = deck.next(new Set(currentItem ? [currentItem.url] : []));
    if (!item) return;

    try {
      await preload(item.url);
    } catch {
      window.setTimeout(showNext, 500);
      return;
    }

    changing = true;
    const effect = effects[Math.floor(Math.random() * effects.length)];
    nextImage.src = item.url;
    nextImage.alt = item.name;
    nextBg.style.backgroundImage = cssUrl(item.url);
    root.classList.add('is-changing', effect);

    const finish = () => {
      currentImage.src = item.url;
      currentImage.alt = item.name;
      currentBg.style.backgroundImage = cssUrl(item.url);
      nextImage.removeAttribute('src');
      nextImage.alt = '';
      nextBg.style.backgroundImage = '';
      root.classList.remove('is-changing', effect);
      currentItem = item;
      changing = false;
      schedule();
    };

    window.setTimeout(finish, TRANSITION_TIME + 120);
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
    root.classList.remove('is-idle');
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => root.classList.add('is-idle'), 2600);
  }

  async function init() {
    try {
      const images = await EidosImageSource.loadImages();
      if (!images.length) {
        status.innerHTML = 'La carpeta <strong>images/gallery</strong> está vacía.<br>Añade imágenes y recarga la página.';
        return;
      }

      deck = new EidosImageSource.ImageDeck(images);
      setInitial(deck.next());
      schedule();
      revealControls();
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = `${error.message} El salvapantallas debe abrirse desde un servidor con PHP.`;
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

  ['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach(eventName => {
    document.addEventListener(eventName, revealControls, { passive: true });
  });

  document.addEventListener('keydown', event => {
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

  init();
})();
