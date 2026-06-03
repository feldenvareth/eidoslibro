// =========================
// Helpers
// =========================
function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

// =========================
// Navbar scroll
// =========================
(function initNavbarScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
})();

// =========================
// Mobile menu
// IMPORTANT:
// Your HTML likely uses onclick="toggleMenu()" and onclick="closeMenu()"
// So these functions must exist in global scope.
// =========================
function openMenu() {
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('hamburger');
  if (!menu) return;

  menu.classList.add('open');
  if (burger) {
    burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
  }
}

function closeMenu() {
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('hamburger');
  if (!menu) return;

  menu.classList.remove('open');
  if (burger) {
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
  }
}

function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;

  if (menu.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

// =========================
// Particles
// =========================
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 60;

  for (let i = 0; i < count; i += 1) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.width = Math.random() * 2 + 1 + 'px';
    p.style.height = p.style.width;
    p.style.animationDuration = Math.random() * 20 + 15 + 's';
    p.style.animationDelay = Math.random() * 20 + 's';
    container.appendChild(p);
  }
})();

// =========================
// Scroll reveal
// =========================
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

// =========================
// Infinite slider factory
// =========================
function initInfiniteSlider(config) {
  const track = document.getElementById(config.trackId);
  if (!track) return;

  const prevBtn = document.querySelector(config.prevSelector);
  const nextBtn = document.querySelector(config.nextSelector);
  const cardSelector = config.cardSelector;

  const originalCards = Array.from(track.querySelectorAll(cardSelector));
  if (!prevBtn || !nextBtn || !originalCards.length) return;

  let visible = getVisibleCards();
  let prependClones = [];
  let appendClones = [];
  let currentIndex = visible;
  let isAnimating = false;

  function getVisibleCards() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function getCardStep() {
    const firstCard = track.querySelector(cardSelector);
    if (!firstCard) return 0;

    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function clearClones() {
    [...prependClones, ...appendClones].forEach(function (el) {
      el.remove();
    });
    prependClones = [];
    appendClones = [];
  }

  function jumpTo(index) {
    const step = getCardStep();
    track.style.transition = 'none';
    track.style.transform = `translateX(-${index * step}px)`;
  }

  function slideTo(index) {
    const step = getCardStep();
    track.style.transition = 'transform 0.55s ease';
    track.style.transform = `translateX(-${index * step}px)`;
  }

  function buildInfiniteTrack() {
    clearClones();

    visible = getVisibleCards();

    const freshOriginals = Array.from(
      track.querySelectorAll(`${cardSelector}:not(.is-clone)`)
    );

    prependClones = freshOriginals.slice(-visible).map(function (card) {
      const clone = card.cloneNode(true);
      clone.classList.add('is-clone');
      return clone;
    });

    appendClones = freshOriginals.slice(0, visible).map(function (card) {
      const clone = card.cloneNode(true);
      clone.classList.add('is-clone');
      return clone;
    });

    prependClones.forEach(function (clone) {
      track.insertBefore(clone, track.firstChild);
    });

    appendClones.forEach(function (clone) {
      track.appendChild(clone);
    });

    currentIndex = visible;
    jumpTo(currentIndex);

    if (typeof config.afterBuild === 'function') {
      config.afterBuild(track);
    }
  }

  function handleWrap() {
    const totalOriginals = originalCards.length;

    if (currentIndex >= totalOriginals + visible) {
      currentIndex = visible;
      jumpTo(currentIndex);
    }

    if (currentIndex < visible) {
      currentIndex = totalOriginals + currentIndex;
      jumpTo(currentIndex);
    }

    isAnimating = false;
  }

  nextBtn.addEventListener('click', function () {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += 1;
    slideTo(currentIndex);
  });

  prevBtn.addEventListener('click', function () {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex -= 1;
    slideTo(currentIndex);
  });

  track.addEventListener('transitionend', handleWrap);

  window.addEventListener('resize', function () {
    const newVisible = getVisibleCards();
    if (newVisible !== visible) {
      buildInfiniteTrack();
    } else {
      jumpTo(currentIndex);
    }
  });

  buildInfiniteTrack();
}

// =========================
// Stories slider
// =========================
initInfiniteSlider({
  trackId: 'storiesTrack',
  prevSelector: '.stories-arrow-prev',
  nextSelector: '.stories-arrow-next',
  cardSelector: '.story-card'
});

// =========================
// Scenes helpers
// =========================
function bindSceneInteractions(track) {
  if (!track) return;

  track.querySelectorAll('.scene-card img[data-caption]').forEach(function (img) {
    if (img.dataset.zoomBound === 'true') return;
    img.dataset.zoomBound = 'true';

    img.addEventListener('click', function () {
      const overlay = document.getElementById('zoomOverlay');
      const zoomImg = document.getElementById('zoomImg');
      const zoomCaption = document.getElementById('zoomCaption');
      const zoomText = document.getElementById('zoomText');

      if (!overlay || !zoomImg || !zoomCaption || !zoomText) return;

      zoomImg.src = this.src;
      zoomImg.alt = this.alt || '';
      zoomCaption.textContent = this.dataset.caption || '';
      zoomText.innerHTML = (this.dataset.extract || '')
        .split(/\n\s*\n/)
        .map(function (p) {
          return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  track.querySelectorAll('.scene-video-btn').forEach(function (btn) {
    if (btn.dataset.videoBound === 'true') return;
    btn.dataset.videoBound = 'true';

    btn.addEventListener('click', function () {
      const overlay = document.getElementById('zoomOverlay');
      const zoomImgWrap = document.querySelector('.zoom-image');
      const zoomText = document.getElementById('zoomText');

      if (!overlay || !zoomImgWrap || !zoomText) return;

      if (window.lockBgAudioForVideo) {
        window.lockBgAudioForVideo();
      }

      zoomImgWrap.innerHTML = `
        <video controls autoplay playsinline style="display:block; width:100%; height:auto; max-height:78vh; background:#05050e;">
          <source src="${this.dataset.videoSrc || ''}" type="video/mp4">
        </video>
        <figcaption id="zoomCaption">${this.dataset.caption || ''}</figcaption>
      `;

      zoomText.innerHTML = `<p>${this.dataset.extract || ''}</p>`;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });
}

function initScenesZoomClose() {
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomClose = document.getElementById('zoomClose');

  function closeZoom() {
    if (!zoomOverlay) return;

    zoomOverlay.classList.remove('is-open');
    document.body.style.overflow = '';

    const zoomImage = document.querySelector('.zoom-image');
    if (zoomImage) {
      zoomImage.innerHTML = `
        <img id="zoomImg" src="" alt="">
        <figcaption id="zoomCaption"></figcaption>
      `;
    }

    const zoomText = document.getElementById('zoomText');
    if (zoomText) {
      zoomText.innerHTML = '';
    }

    if (window.unlockBgAudioForVideo) {
      window.unlockBgAudioForVideo();
    }
  }

  if (zoomClose) {
    zoomClose.addEventListener('click', closeZoom);
  }

  if (zoomOverlay) {
    zoomOverlay.addEventListener('click', function (e) {
      if (e.target === zoomOverlay) {
        closeZoom();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'Escape' &&
      zoomOverlay &&
      zoomOverlay.classList.contains('is-open')
    ) {
      closeZoom();
    }
  });
}

// =========================
// Scenes slider
// =========================
initInfiniteSlider({
  trackId: 'scenesTrack',
  prevSelector: '.scenes-arrow-prev',
  nextSelector: '.scenes-arrow-next',
  cardSelector: '.scene-card',
  afterBuild: function (track) {
    bindSceneInteractions(track);
  }
});

initScenesZoomClose();