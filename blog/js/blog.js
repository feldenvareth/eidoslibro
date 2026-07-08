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

  // Mostrar fecha en .meta y ordenar por fecha via CSS order.
  (function showDatesAndOrder(){
    if(!cards.length) return;

    // Recoger fechas y calcular orden CSS (mas reciente = order mas bajo).
    var dated = cards
      .map(function(card){
        return { card: card, ts: new Date((card.dataset.date || '1970-01-01') + 'T00:00:00').getTime() };
      })
      .filter(function(item){ return !isNaN(item.ts); })
      .sort(function(a, b){ return b.ts - a.ts; });

    dated.forEach(function(item, index){
      item.card.style.order = String(index);
    });

    // Mostrar fecha legible en .meta.
    cards.forEach(function(card){
      var dateStr = card.dataset.date;
      if(!dateStr) return;
      var meta = card.querySelector('.meta');
      if(!meta) return;
      var date = new Date(dateStr + 'T00:00:00');
      if(isNaN(date)) return;
      var formatted = date.toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'});
      if(meta.textContent.indexOf(formatted) === -1){
        meta.textContent = meta.textContent.trimEnd() + ' · ' + formatted;
      }
    });
  })();

  // Calculo automatico del tiempo de lectura.
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



// Barras de progreso: artículo + zona de conversación.
const articleProgress = document.querySelector('.reading-progress-article span');
const forumProgress = document.querySelector('.reading-progress-forum span');
const forumStart = document.querySelector('.related, .newsletter-mini, #comentarios');

function calculateProgressForElement(element){
  if(!element) return 0;

  const rect = element.getBoundingClientRect();
  const total = element.offsetHeight - window.innerHeight;
  const read = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));

  return Math.round((read / Math.max(total, 1)) * 100);
}

function updateProgress(){
  if(articleProgress && articleContent){
    articleProgress.style.width = `${calculateProgressForElement(articleContent)}%`;
  }

  if(forumProgress && forumStart){
    const forumRect = forumStart.getBoundingClientRect();
    const documentHeight = document.documentElement.scrollHeight;
    const forumTop = window.scrollY + forumRect.top;
    const total = documentHeight - forumTop - window.innerHeight;
    const read = window.scrollY - forumTop;

    const pct = Math.round(
      Math.min(Math.max(read, 0), Math.max(total, 1)) / Math.max(total, 1) * 100
    );

    forumProgress.style.width = `${pct}%`;
  }
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


/* ==========================================================
   LECTOR EN VOZ ALTA CON MINI REPRODUCTOR + FLOTANTE
   ========================================================== */

(function () {
    const openBtn = document.querySelector(".read-aloud-open");
    const player = document.querySelector(".read-aloud-player");
    const pauseBtn = document.querySelector(".read-pause");
    const stopBtn = document.querySelector(".read-stop");
    const prevBtn = document.querySelector(".read-prev");
    const nextBtn = document.querySelector(".read-next");
    const progress = document.querySelector(".read-progress");
    const status = document.querySelector(".read-status");
    const article = document.querySelector("[data-article-content]");

    const floating = document.querySelector(".read-floating-player");
    const floatingPrev = document.querySelector(".read-floating-prev");
    const floatingPause = document.querySelector(".read-floating-pause");
    const floatingNext = document.querySelector(".read-floating-next");
    const floatingStop = document.querySelector(".read-floating-stop");

    if (!openBtn || !player || !pauseBtn || !stopBtn || !progress || !status || !article) return;

    if (!("speechSynthesis" in window)) {
        openBtn.textContent = "Lectura no disponible";
        openBtn.disabled = true;
        return;
    }

    let chunks = [];
    let current = 0;
    let isReading = false;
    let isPaused = false;
    let internalCancel = false;
    let voice = null;

    function getBestSpanishVoice() {
        const voices = speechSynthesis.getVoices();

        const preferred = [
            "Microsoft Elvira Online (Natural) - Spanish (Spain)",
            "Microsoft Alvaro Online (Natural) - Spanish (Spain)",
            "Microsoft Helena",
            "Microsoft Alvaro",
            "Google español de España",
            "Google español",
            "Mónica",
            "Jorge"
        ];

        for (const name of preferred) {
            const found = voices.find(v => v.name === name);
            if (found) return found;
        }

        return voices.find(v => v.lang === "es-ES") ||
               voices.find(v => v.lang && v.lang.startsWith("es")) ||
               null;
    }

    function buildChunks() {
        const elements = Array.from(article.querySelectorAll("h2, h3, p, blockquote, li"))
            .filter(el => {
                return !el.closest(".related, .newsletter-mini, .comments, .comment-note, .giscus");
            });

        chunks = elements
            .map(el => {
                const tag = el.tagName.toLowerCase();
                const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
                return text ? { tag, text, element: el } : null;
            })
            .filter(Boolean);

        progress.min = 0;
        progress.max = Math.max(chunks.length - 1, 0);
        progress.value = current;
    }

    function setStatus(text) {
        status.textContent = text;
    }

    function cancelSpeech() {
        internalCancel = true;
        speechSynthesis.cancel();

        setTimeout(function () {
            internalCancel = false;
        }, 200);
    }

    function previousSectionIndex() {
        for (let i = current - 1; i >= 0; i--) {
            if (chunks[i].tag === "h2" || chunks[i].tag === "h3") return i;
        }
        return -1;
    }

    function nextSectionIndex() {
        for (let i = current + 1; i < chunks.length; i++) {
            if (chunks[i].tag === "h2" || chunks[i].tag === "h3") return i;
        }
        return -1;
    }

    function updateButtons() {
        const hasPrev = previousSectionIndex() !== -1;
        const hasNext = nextSectionIndex() !== -1;

        if (prevBtn) {
            prevBtn.disabled = !hasPrev;
            prevBtn.classList.toggle("disabled", !hasPrev);
        }

        if (nextBtn) {
            nextBtn.disabled = !hasNext;
            nextBtn.classList.toggle("disabled", !hasNext);
        }

        if (floatingPrev) {
            floatingPrev.disabled = !hasPrev;
            floatingPrev.classList.toggle("disabled", !hasPrev);
        }

        if (floatingNext) {
            floatingNext.disabled = !hasNext;
            floatingNext.classList.toggle("disabled", !hasNext);
        }

        pauseBtn.textContent = isPaused ? "▶ Reanudar" : "⏸ Pausar";

        if (floatingPause) {
            floatingPause.textContent = isPaused ? "▶" : "⏸";
            floatingPause.title = isPaused ? "Reanudar" : "Pausar";
        }
    }

    function syncFloatingVisibility() {
        if (!floating) return;

        const playerOpen = !player.hidden;
        const rect = player.getBoundingClientRect();
        const playerVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (playerOpen && !playerVisible) {
            floating.hidden = false;
            requestAnimationFrame(function () {
                floating.classList.add("visible");
            });
        } else {
            floating.classList.remove("visible");
            setTimeout(function () {
                if (!floating.classList.contains("visible")) {
                    floating.hidden = true;
                }
            }, 250);
        }
    }

    function scrollToCurrentBlock() {
        const block = chunks[current];

        if (!block || !block.element) return;

        block.element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function openPlayer() {
        player.hidden = false;
        openBtn.hidden = true;
        syncFloatingVisibility();
    }

    function closePlayer() {
        cancelSpeech();

        isReading = false;
        isPaused = false;
        current = 0;

        progress.value = 0;
        player.hidden = true;
        openBtn.hidden = false;

        if (floating) {
            floating.classList.remove("visible");
            floating.hidden = true;
        }

        pauseBtn.textContent = "⏸ Pausar";
        setStatus("Lectura automática del navegador. La calidad de la voz puede variar según el dispositivo.");
        updateButtons();
    }

    function finishReading() {
        closePlayer();
    }

    function speakCurrent() {
        if (!chunks.length || current >= chunks.length) {
            finishReading();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[current].text);

        utterance.lang = "es-ES";
        utterance.rate = 0.88;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (voice) utterance.voice = voice;

        utterance.onstart = function () {
            isReading = true;
            isPaused = false;
            progress.value = current;

            setStatus("Leyendo bloque " + (current + 1) + " de " + chunks.length + ".");
            updateButtons();
            syncFloatingVisibility();
        };

        utterance.onend = function () {
            if (internalCancel) return;

            current++;
            progress.value = current;

            if (current >= chunks.length) {
                finishReading();
            } else {
                updateButtons();
                speakCurrent();
            }
        };

        utterance.onerror = function () {
            if (internalCancel) return;

            isReading = false;
            isPaused = false;
            setStatus("La lectura se ha interrumpido.");
            updateButtons();
            syncFloatingVisibility();
        };

        speechSynthesis.speak(utterance);
    }

    function startReading(fromIndex, shouldScroll) {
        if (!chunks.length) buildChunks();

        if (!chunks.length) {
            setStatus("No hay texto para leer.");
            return;
        }

        current = Math.max(0, Math.min(fromIndex, chunks.length - 1));
        progress.value = current;

        voice = getBestSpanishVoice();

        if (shouldScroll) {
            scrollToCurrentBlock();
        }

        cancelSpeech();

        setTimeout(function () {
            speakCurrent();
        }, 240);
    }

    function jumpTo(newIndex) {
        if (!chunks.length) buildChunks();

        if (newIndex < 0 || newIndex >= chunks.length) return;

        isReading = false;
        isPaused = false;

        startReading(newIndex, true);
    }

    openBtn.addEventListener("click", function () {
        buildChunks();
        current = 0;
        openPlayer();
        startReading(0, false);
    });

    pauseBtn.addEventListener("click", function () {
        if (!isReading && !isPaused) return;

        if (isPaused) {
            speechSynthesis.resume();
            isPaused = false;
            setStatus("Lectura reanudada.");
        } else {
            speechSynthesis.pause();
            isPaused = true;
            setStatus("Lectura pausada.");
        }

        updateButtons();
        syncFloatingVisibility();
    });

    stopBtn.addEventListener("click", closePlayer);

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            const target = previousSectionIndex();
            if (target !== -1) jumpTo(target);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            const target = nextSectionIndex();
            if (target !== -1) jumpTo(target);
        });
    }

    progress.addEventListener("input", function () {
        jumpTo(Number(progress.value));
    });

    if (floatingPrev && prevBtn) {
        floatingPrev.addEventListener("click", function () {
            prevBtn.click();
        });
    }

    if (floatingPause) {
        floatingPause.addEventListener("click", function () {
            pauseBtn.click();
        });
    }

    if (floatingNext && nextBtn) {
        floatingNext.addEventListener("click", function () {
            nextBtn.click();
        });
    }

    if (floatingStop) {
        floatingStop.addEventListener("click", function () {
            stopBtn.click();
        });
    }

    speechSynthesis.onvoiceschanged = function () {
        voice = getBestSpanishVoice();
    };

    window.addEventListener("scroll", syncFloatingVisibility, { passive:true });
    window.addEventListener("resize", syncFloatingVisibility);

    window.addEventListener("beforeunload", function () {
        speechSynthesis.cancel();
    });
})();