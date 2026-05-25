(function(){
  const nav = document.querySelector('.blog-nav');
  const toggle = document.querySelector('.nav-toggle');

  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '×' : '☰';
    });

    nav.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.textContent = '☰';
      });
    });

    window.addEventListener('resize', () => {
      if(window.innerWidth > 900){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.textContent = '☰';
      }
    });
  }


  // Partículas doradas ascendentes, limitadas al primer bloque visual como en la portada principal.
  (function createParticles(){
    const container = document.querySelector('.hero #particles');
    if(!container) return;
    container.innerHTML = '';
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced) return;

    const count = 60;
    for(let i = 0; i < count; i++){
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = (Math.random() * 2 + 1) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (Math.random() * 20 + 15) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      container.appendChild(p);
    }
  })();

  const items = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    items.forEach(el => observer.observe(el));
  } else {
    items.forEach(el => el.classList.add('visible'));
  }

  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', event => {
      const action = form.getAttribute('action') || '#';
      if(action === '#'){
        event.preventDefault();
        alert('Formulario preparado. Sustituye el atributo action por el endpoint real de Brevo u otro servicio de newsletter.');
      }
    });
  });

  // Buscador y filtros del archivo.
  const searchInput = document.querySelector('#article-search');
  const filterButtons = document.querySelectorAll('.tag-filter');
  const cards = Array.from(document.querySelectorAll('.post-card'));
  const count = document.querySelector('#article-count');
  const noResults = document.querySelector('#no-results');
  let activeFilter = 'all';

  function normalize(text){
    return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function applyArchiveFilters(){
    if(!cards.length) return;
    const query = normalize(searchInput ? searchInput.value : '');
    let visible = 0;

    cards.forEach(card => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.excerpt,
        card.dataset.tags,
        card.textContent
      ].join(' '));
      const tags = normalize(card.dataset.tags || '');
      const matchQuery = !query || haystack.includes(query);
      const matchFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const show = matchQuery && matchFilter;
      card.hidden = !show;
      if(show) visible += 1;
    });

    if(count) count.textContent = String(visible);
    if(noResults) noResults.hidden = visible !== 0;
  }

  if(searchInput){
    searchInput.addEventListener('input', applyArchiveFilters);
  }
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      activeFilter = normalize(button.dataset.filter || 'all');
      applyArchiveFilters();
    });
  });
  applyArchiveFilters();

  // Cálculo automático del tiempo de lectura.
  const articleContent = document.querySelector('[data-article-content], .article-content');
  const WORDS_PER_MINUTE = 220;

  function estimateReadingMinutesFromText(text){
    const words = (text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  }

  function getReadableArticleText(root){
    if(!root) return '';
    const clone = root.cloneNode(true);

    // No contar elementos auxiliares: relacionados, newsletter, comentarios, Giscus, botones, navegación, etc.
    clone.querySelectorAll([
      '.related',
      '.newsletter-mini',
      '.comment-note',
      '.comments-section',
      '.giscus',
      'script',
      'style',
      'nav',
      'button',
      'form'
    ].join(',')).forEach(element => element.remove());

    const readableNodes = clone.querySelectorAll('p, h2, h3, blockquote, li');
    if(readableNodes.length){
      return Array.from(readableNodes).map(node => node.innerText || node.textContent || '').join(' ');
    }

    return clone.innerText || clone.textContent || '';
  }

  function updateMetaReadingTime(metaElement, minutes){
    if(!metaElement || !minutes) return;
    const parts = metaElement.textContent.split('·').map(part => part.trim()).filter(Boolean);
    const minText = `${minutes} min`;
    const idx = parts.findIndex(part => /\b\d+\s*min\b/i.test(part));

    if(idx >= 0){
      parts[idx] = minText;
    } else if(parts.length >= 1){
      parts.splice(1, 0, minText);
    } else {
      parts.push(minText);
    }

    metaElement.textContent = parts.join(' · ');
  }

  // En página de artículo: calcula sobre el texto real del artículo.
  if(articleContent){
    const articleMeta = document.querySelector('.article-meta');
    updateMetaReadingTime(articleMeta, estimateReadingMinutesFromText(getReadableArticleText(articleContent)));
  }

  // En archivo/listado: intenta leer cada artículo enlazado y calcular su duración real.
  // En GitHub Pages funciona directamente. Si se abre el HTML como archivo local, usa una estimación de respaldo.
  async function updateArchiveReadingTimes(){
    if(!cards.length) return;

    await Promise.all(cards.map(async card => {
      const link = card.querySelector('a[href]');
      const meta = card.querySelector('.meta');
      if(!link || !meta) return;

      const href = link.getAttribute('href');
      const cacheKey = `eidos-reading-time-v2:${href}`;

      try{
        const cached = sessionStorage.getItem(cacheKey);
        if(cached){
          updateMetaReadingTime(meta, Number(cached));
          return;
        }
      } catch(error) {}

      try{
        const response = await fetch(href, {cache: 'no-store'});
        if(!response.ok) throw new Error('No se pudo leer el artículo');
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('[data-article-content], .article-content');
        if(!content) throw new Error('Artículo sin contenido detectable');
        const minutes = estimateReadingMinutesFromText(getReadableArticleText(content));
        updateMetaReadingTime(meta, minutes);
        try{ sessionStorage.setItem(cacheKey, String(minutes)); } catch(error) {}
      } catch(error){
        const fallbackText = [card.dataset.title, card.dataset.excerpt, card.textContent].join(' ');
        updateMetaReadingTime(meta, estimateReadingMinutesFromText(fallbackText));
      }
    }));
  }

  updateArchiveReadingTimes();



  // Barra de progreso de lectura.
  const progress = document.querySelector('.reading-progress span');
  function updateProgress(){
    if(!progress || !articleContent) return;
    const rect = articleContent.getBoundingClientRect();
    const total = articleContent.offsetHeight - window.innerHeight;
    const read = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    progress.style.width = `${Math.round((read / Math.max(total, 1)) * 100)}%`;
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress);

  // Tabla de contenidos automática solo si el artículo tiene subtítulos h2 reales.
  const toc = document.querySelector('[data-toc]');
  const tocNav = toc ? toc.querySelector('nav') : null;
  if(toc && tocNav && articleContent){
    const headings = Array.from(articleContent.querySelectorAll(':scope > h2'));
    if(headings.length > 1){
      headings.forEach((heading, index) => {
        if(!heading.id){
          heading.id = `seccion-${index + 1}`;
        }
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        tocNav.appendChild(link);
      });
      toc.hidden = false;
    }
  }

  // Copiar enlace del artículo.
  document.querySelectorAll('[data-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const original = button.textContent;
      try{
        await navigator.clipboard.writeText(window.location.href);
        button.textContent = 'Enlace copiado';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove('copied');
        }, 1800);
      } catch(error){
        button.textContent = 'Copia la URL';
        setTimeout(() => { button.textContent = original; }, 1800);
      }
    });
  });

  // Volver arriba.
  const scrollTop = document.querySelector('.scroll-top');
  function toggleScrollTop(){
    if(!scrollTop) return;
    scrollTop.classList.toggle('visible', window.scrollY > 520);
  }
  if(scrollTop){
    scrollTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
    toggleScrollTop();
    window.addEventListener('scroll', toggleScrollTop, {passive:true});
  }
})();




