(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const progress = document.querySelector('.reading-progress span');
  const parallax = document.querySelector('[data-parallax]');
  const year = document.querySelector('[data-year]');

  if (year) year.textContent = new Date().getFullYear();

  const setMenu = (open) => {
    menuToggle?.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);

    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;

    if (parallax && window.innerWidth > 980 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const offset = Math.min(28, y * 0.025);
      parallax.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  // Subtle interactive light on thematic cards (desktop only).
  document.querySelectorAll('.theme-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (window.innerWidth < 980) return;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(157,17,24,.16), transparent 48%)`;
    });
    card.addEventListener('pointerleave', () => { card.style.background = ''; });
  });


  // Premium book-cover interaction: subtle 3D tilt + moving velvet sheen.
  const coverStage = document.querySelector('.cover-stage');
  const coverPicture = coverStage?.querySelector('picture');
  const canHoverCover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (coverStage && coverPicture && canHoverCover && !reduceMotion) {
    const updateCover = (e) => {
      const r = coverStage.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      const rotateY = (px - 0.5) * 11;
      const rotateX = (0.5 - py) * 7;

      coverStage.style.setProperty('--cover-rx', `${rotateX.toFixed(2)}deg`);
      coverStage.style.setProperty('--cover-ry', `${rotateY.toFixed(2)}deg`);
      coverStage.style.setProperty('--shine-x', `${(px * 100).toFixed(1)}%`);
      coverStage.style.setProperty('--shine-y', `${(py * 100).toFixed(1)}%`);
      coverStage.style.setProperty('--shine-opacity', '.9');
      coverStage.classList.add('is-hovering');
    };

    const resetCover = () => {
      coverStage.style.setProperty('--cover-rx', '.6deg');
      coverStage.style.setProperty('--cover-ry', '-4deg');
      coverStage.style.setProperty('--shine-x', '50%');
      coverStage.style.setProperty('--shine-y', '44%');
      coverStage.style.setProperty('--shine-opacity', '0');
      coverStage.classList.remove('is-hovering');
    };

    coverStage.addEventListener('pointermove', updateCover);
    coverStage.addEventListener('pointerleave', resetCover);
  }

})();
