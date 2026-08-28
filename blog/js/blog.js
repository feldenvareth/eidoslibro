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

  (function showDatesAndOrder(){
    if(!cards.length) return;

    var dated = cards
      .map(function(card){
        return { card: card, ts: new Date((card.dataset.date || '1970-01-01') + 'T00:00:00').getTime() };
      })
      .filter(function(item){ return !isNaN(item.ts); })
      .sort(function(a, b){ return b.ts - a.ts; });

    dated.forEach(function(item, index){
      item.card.style.order = String(index);
    });

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

  if(articleContent){
    const articleMeta = document.querySelector('.article-meta');
    updateMetaReadingTime(articleMeta, estimateReadingMinutesFromText(getReadableArticleText(articleContent)));
  }

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
    const speedSelects = document.querySelectorAll(".read-speed");

    const floating = document.querySelector(".read-floating-player");
    const floatingPrev = document.querySelector(".read-floating-prev");
    const floatingPause = document.querySelector(".read-floating-pause");
    const floatingNext = document.querySelector(".read-floating-next");
    const floatingStop = document.querySelector(".read-floating-stop");
    const floatingStatus = document.querySelector(".read-floating-status");

    if (!openBtn || !player || !pauseBtn || !stopBtn || !progress || !status || !article) return;

    const STRINGS = {
        es: {
            openLabel: "🎧 Escuchar con el navegador",
            unavailable: "Lectura no disponible",
            prevLabel: "⏮ Sección anterior",
            pauseLabel: "⏸ Pausar",
            resumeLabel: "▶ Reanudar",
            nextLabel: "⏭ Siguiente sección",
            stopLabel: "■ Detener",
            speedLabel: "Velocidad",
            prevTitle: "Sección anterior",
            pauseTitle: "Pausar",
            resumeTitle: "Reanudar",
            nextTitle: "Siguiente sección",
            stopTitle: "Detener",
            defaultStatus: "Lectura automática del navegador. La calidad de la voz puede variar según el dispositivo.",
            reading: function (i, total, speed) {
                return "Leyendo bloque " + i + " de " + total + " · Velocidad " + speed + "x.";
            },
            resumed: function (speed) {
                return "Lectura reanudada · Velocidad " + speed + "x.";
            },
            paused: "Lectura pausada.",
            interrupted: "La lectura se ha interrumpido.",
            noText: "No hay texto para leer."
        },
        en: {
            openLabel: "🎧 Listen in your browser",
            unavailable: "Reading unavailable",
            prevLabel: "⏮ Previous section",
            pauseLabel: "⏸ Pause",
            resumeLabel: "▶ Resume",
            nextLabel: "⏭ Next section",
            stopLabel: "■ Stop",
            speedLabel: "Speed",
            prevTitle: "Previous section",
            pauseTitle: "Pause",
            resumeTitle: "Resume",
            nextTitle: "Next section",
            stopTitle: "Stop",
            defaultStatus: "Automatic browser narration. Voice quality may vary by device.",
            reading: function (i, total, speed) {
                return "Reading block " + i + " of " + total + " · Speed " + speed + "x.";
            },
            resumed: function (speed) {
                return "Reading resumed · Speed " + speed + "x.";
            },
            paused: "Reading paused.",
            interrupted: "Reading was interrupted.",
            noText: "No text to read."
        }
    };

    if (!("speechSynthesis" in window)) {
        openBtn.textContent = STRINGS[detectPageLang()].unavailable;
        openBtn.disabled = true;
        return;
    }

    let chunks = [];
    let current = 0;
    let isReading = false;
    let isPaused = false;
    let internalCancel = false;
    let voice = null;
    let readingSpeed = 1;

    let pageLang = detectPageLang();
    let utteranceLang = pageLang === "en" ? "en-US" : "es-ES";
    let T = STRINGS[pageLang];

    function applyStaticLabels() {
        openBtn.textContent = T.openLabel;

        if (prevBtn) { prevBtn.textContent = T.prevLabel; prevBtn.title = T.prevTitle; }
        if (nextBtn) { nextBtn.textContent = T.nextLabel; nextBtn.title = T.nextTitle; }
        if (stopBtn) { stopBtn.textContent = T.stopLabel; stopBtn.title = T.stopTitle; }
        if (pauseBtn) { pauseBtn.textContent = T.pauseLabel; pauseBtn.title = T.pauseTitle; }

        if (floatingPrev) floatingPrev.title = T.prevTitle;
        if (floatingNext) floatingNext.title = T.nextTitle;
        if (floatingStop) floatingStop.title = T.stopTitle;
        if (floatingPause) { floatingPause.textContent = "⏸"; floatingPause.title = T.pauseTitle; }

        speedSelects.forEach(function (select) {
            const label = select.closest(".read-speed-label");
            if (!label) return;
            for (const node of label.childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
                    node.textContent = " " + T.speedLabel + " ";
                    return;
                }
            }
        });

        status.textContent = T.defaultStatus;
        if (floatingStatus) floatingStatus.textContent = T.defaultStatus;
    }

    applyStaticLabels();

    let highlightedEl = null;
    const HIGHLIGHT_CLASS = "read-highlight";

    try {
        const savedSpeed = localStorage.getItem("eidos-read-speed");
        if (savedSpeed) readingSpeed = Number(savedSpeed) || 1;
    } catch (error) {}

    function syncSpeedSelects() {
        speedSelects.forEach(function (select) {
            select.value = String(readingSpeed);
        });
    }

    speedSelects.forEach(function (select) {
        select.addEventListener("change", function () {
            readingSpeed = Number(select.value) || 1;
            try {
                localStorage.setItem("eidos-read-speed", String(readingSpeed));
            } catch (error) {}
            syncSpeedSelects();
            if (isReading && !isPaused) {
                startReading(current, false);
            }
        });
    });

    syncSpeedSelects();

    function detectPageLang() {
        const raw = (
            article.getAttribute("lang") ||
            article.closest("[lang]")?.getAttribute("lang") ||
            document.documentElement.getAttribute("lang") ||
            "es"
        ).toLowerCase();
        if (raw.startsWith("en")) return "en";
        return "es";
    }

    function getBestVoiceForLang(lang) {
        const voices = speechSynthesis.getVoices();

        const preferredEs = [
            "Microsoft Elvira Online (Natural) - Spanish (Spain)",
            "Microsoft Alvaro Online (Natural) - Spanish (Spain)",
            "Microsoft Helena",
            "Microsoft Alvaro",
            "Google español de España",
            "Google español",
            "Mónica",
            "Jorge"
        ];

        const preferredEn = [
            "Microsoft Aria Online (Natural) - English (United States)",
            "Microsoft Guy Online (Natural) - English (United States)",
            "Microsoft Libby Online (Natural) - English (United Kingdom)",
            "Microsoft Ryan Online (Natural) - English (United Kingdom)",
            "Google US English",
            "Google UK English Female",
            "Google UK English Male",
            "Samantha",
            "Daniel"
        ];

        const preferredList = lang === "en" ? preferredEn : preferredEs;

        for (const name of preferredList) {
            const found = voices.find(v => v.name === name);
            if (found) return found;
        }

        if (lang === "en") {
            return voices.find(v => v.lang === "en-US") ||
                   voices.find(v => v.lang && v.lang.startsWith("en")) ||
                   null;
        }

        return voices.find(v => v.lang === "es-ES") ||
               voices.find(v => v.lang && v.lang.startsWith("es")) ||
               null;
    }

    function buildChunks() {
        pageLang = detectPageLang();
        utteranceLang = pageLang === "en" ? "en-US" : "es-ES";

        const elements = Array.from(article.querySelectorAll("h2, h3, p, blockquote, li"))
            .filter(el => {
                return !el.closest(".related, .newsletter-mini, .comments, .comment-note, .giscus, .article-bibliography");
            });

        chunks = elements
            .map(el => {
                const tag = el.tagName.toLowerCase();
                const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
                return text ? { tag, text, element: el, words: null } : null;
            })
            .filter(Boolean);

        progress.min = 0;
        progress.max = Math.max(chunks.length - 1, 0);
        progress.value = current;
    }

    function setStatus(text) {
        status.textContent = text;
        if (floatingStatus) floatingStatus.textContent = text;
    }

    function setHighlight(el) {
        if (highlightedEl && highlightedEl !== el) {
            highlightedEl.classList.remove(HIGHLIGHT_CLASS);
        }
        if (el) el.classList.add(HIGHLIGHT_CLASS);
        highlightedEl = el;
    }

    function clearHighlight() {
        if (highlightedEl) highlightedEl.classList.remove(HIGHLIGHT_CLASS);
        highlightedEl = null;
    }

    function cancelSpeech() {
        internalCancel = true;
        speechSynthesis.cancel();
        setTimeout(function () { internalCancel = false; }, 200);
    }

    function sectionStartIndex(fromIndex) {
        for (let i = fromIndex; i >= 0; i--) {
            if (chunks[i].tag === "h2" || chunks[i].tag === "h3") return i;
        }
        return 0;
    }

    function previousSectionIndex(fromIndex) {
        const start = sectionStartIndex(fromIndex);
        for (let i = start - 1; i >= 0; i--) {
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
        const hasPrev = chunks.length > 0;
        const hasNext = nextSectionIndex() !== -1;

        if (prevBtn) { prevBtn.disabled = !hasPrev; prevBtn.classList.toggle("disabled", !hasPrev); }
        if (nextBtn) { nextBtn.disabled = !hasNext; nextBtn.classList.toggle("disabled", !hasNext); }
        if (floatingPrev) { floatingPrev.disabled = !hasPrev; floatingPrev.classList.toggle("disabled", !hasPrev); }
        if (floatingNext) { floatingNext.disabled = !hasNext; floatingNext.classList.toggle("disabled", !hasNext); }

        pauseBtn.textContent = isPaused ? T.resumeLabel : T.pauseLabel;

        if (floatingPause) {
            floatingPause.textContent = isPaused ? "▶" : "⏸";
            floatingPause.title = isPaused ? T.resumeTitle : T.pauseTitle;
        }
    }

    function syncFloatingVisibility() {
        if (!floating) return;

        const isMobile = window.innerWidth <= 900;

        if (isMobile && openBtn.hidden && (isReading || isPaused)) {
            floating.hidden = false;
            requestAnimationFrame(function () { floating.classList.add("visible"); });
            return;
        }

        const playerOpen = !player.hidden;
        const rect = player.getBoundingClientRect();
        const playerVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (playerOpen && !playerVisible) {
            floating.hidden = false;
            requestAnimationFrame(function () { floating.classList.add("visible"); });
        } else {
            floating.classList.remove("visible");
            setTimeout(function () {
                if (!floating.classList.contains("visible")) floating.hidden = true;
            }, 250);
        }
    }

    function scrollToCurrentBlock() {
        const block = chunks[current];
        if (!block || !block.element) return;
        block.element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function openPlayer() {
        openBtn.hidden = true;

        if (window.innerWidth <= 900) {
            player.hidden = true;
            if (floating) {
                floating.hidden = false;
                requestAnimationFrame(function () { floating.classList.add("visible"); });
            }
            return;
        }

        player.hidden = false;
        syncFloatingVisibility();
    }

    function closePlayer() {
        cancelSpeech();

        isReading = false;
        isPaused = false;
        current = 0;

        clearHighlight();

        progress.value = 0;
        player.hidden = true;
        openBtn.hidden = false;

        if (floating) {
            floating.classList.remove("visible");
            floating.hidden = true;
        }

        pauseBtn.textContent = T.pauseLabel;
        setStatus(T.defaultStatus);
        updateButtons();

        // ▼▼▼ AÑADIDO: avisa al widget del juego que el lector ha parado ▼▼▼
        document.dispatchEvent(new CustomEvent('eidos-reader-stop'));
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

        utterance.lang = utteranceLang;
        utterance.rate = readingSpeed;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (voice) utterance.voice = voice;

        utterance.onstart = function () {
            isReading = true;
            isPaused = false;
            progress.value = current;
            setHighlight(chunks[current].element);
            setStatus(T.reading(current + 1, chunks.length, readingSpeed));
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
            clearHighlight();
            setStatus(T.interrupted);
            updateButtons();
            syncFloatingVisibility();
        };

        speechSynthesis.speak(utterance);
    }

    function startReading(fromIndex, shouldScroll) {
        if (!chunks.length) buildChunks();

        if (!chunks.length) {
            setStatus(T.noText);
            return;
        }

        current = Math.max(0, Math.min(fromIndex, chunks.length - 1));
        progress.value = current;

        voice = getBestVoiceForLang(pageLang);

        if (shouldScroll) scrollToCurrentBlock();

        cancelSpeech();

        setTimeout(function () { speakCurrent(); }, 240);
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

        // ▼▼▼ AÑADIDO: avisa al widget del juego que el lector ha arrancado ▼▼▼
        document.dispatchEvent(new CustomEvent('eidos-reader-start'));
    });

    pauseBtn.addEventListener("click", function () {
        if (!isReading && !isPaused) return;

        if (isPaused) {
            speechSynthesis.resume();
            isPaused = false;
            setStatus(T.resumed(readingSpeed));
        } else {
            speechSynthesis.pause();
            isPaused = true;
            setStatus(T.paused);
        }

        updateButtons();
        syncFloatingVisibility();
    });

    stopBtn.addEventListener("click", closePlayer);

    let lastPrevClickAt = 0;
    const PREV_DOUBLE_CLICK_MS = 600;

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            if (!chunks.length) return;

            const now = Date.now();
            const isQuickSecondClick = now - lastPrevClickAt < PREV_DOUBLE_CLICK_MS;
            lastPrevClickAt = now;

            const sectionStart = sectionStartIndex(current);
            const alreadyAtSectionStart = current <= sectionStart;

            if (isQuickSecondClick || alreadyAtSectionStart) {
                const target = previousSectionIndex(current);
                jumpTo(target !== -1 ? target : 0);
            } else {
                jumpTo(sectionStart);
            }
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
        floatingPrev.addEventListener("click", function () { prevBtn.click(); });
    }

    if (floatingPause) {
        floatingPause.addEventListener("click", function () { pauseBtn.click(); });
    }

    if (floatingNext && nextBtn) {
        floatingNext.addEventListener("click", function () { nextBtn.click(); });
    }

    if (floatingStop) {
        floatingStop.addEventListener("click", function () { stopBtn.click(); });
    }

    speechSynthesis.onvoiceschanged = function () {
        voice = getBestVoiceForLang(pageLang);
    };

    window.addEventListener("scroll", syncFloatingVisibility, { passive: true });
    window.addEventListener("resize", syncFloatingVisibility);

    window.addEventListener("beforeunload", function () {
        speechSynthesis.cancel();
    });
})();



document.addEventListener('DOMContentLoaded', function () {

  const canHover = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  if (!canHover) {
    return;
  }

  const cards = document.querySelectorAll(
    '.post-card .card-preview-video'
  );

  cards.forEach(function (video) {

    const card = video.closest('.post-card');
    const sourceUrl = video.dataset.videoSrc;

    if (!card || !sourceUrl) {
      return;
    }

    let videoLoaded = false;

    function loadVideo() {
      if (videoLoaded) {
        return;
      }

      video.src = sourceUrl;
      video.load();
      videoLoaded = true;
    }

    function startVideo() {
      loadVideo();

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            card.classList.add('video-playing');
          })
          .catch(function () {
            card.classList.remove('video-playing');
          });
      }
    }

    function stopVideo() {
      video.pause();
      video.currentTime = 0;
      card.classList.remove('video-playing');
    }

    card.addEventListener('mouseenter', startVideo);
    card.addEventListener('mouseleave', stopVideo);

    card.addEventListener('focusin', startVideo);
    card.addEventListener('focusout', stopVideo);

  });

});


/* =========================================================
   GLOSARIO CONTEXTUAL
   Las definiciones se leen desde <template data-eidos-glossary>
   en cada HTML. Este archivo solo gestiona la interacción.
   ========================================================= */

(function () {
  'use strict';

  const CLOSE_DELAY_MS = 150;
  const VIEWPORT_MARGIN = 14;
  const POPOVER_GAP = 12;

  let activeTrigger = null;
  let closeTimer = null;
  let hideTimer = null;
  let pinned = false;
  let popover = null;
  let contentHost = null;
  let closeButton = null;
  let suppressNextFocus = false;

  function normalise(value) {
    return String(value || '')
      .normalize('NFC')
      .toLocaleLowerCase(document.documentElement.lang || undefined);
  }

  function isExcludedTextNode(node) {
    const parent = node.parentElement;

    if (!parent || !node.nodeValue.trim()) {
      return true;
    }

    return Boolean(parent.closest(
      'a, button, script, style, template, textarea, code, pre, ' +
      '.eidos-glossary-term, [data-no-glossary]'
    ));
  }

  function findFirstOccurrence(root, term) {
    const needle = normalise(term);
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          return isExcludedTextNode(node)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;

    while ((node = walker.nextNode())) {
      const haystack = normalise(node.nodeValue);
      let searchFrom = 0;

      while (searchFrom <= haystack.length - needle.length) {
        const index = haystack.indexOf(needle, searchFrom);

        if (index === -1) {
          break;
        }

        const before = index > 0 ? haystack[index - 1] : '';
        const afterIndex = index + needle.length;
        const after = afterIndex < haystack.length ? haystack[afterIndex] : '';
        const isWordChar = function (char) {
          return char && /[\p{L}\p{N}_]/u.test(char);
        };

        if (!isWordChar(before) && !isWordChar(after)) {
          return { node: node, index: index, length: term.length };
        }

        searchFrom = index + 1;
      }
    }

    return null;
  }

  function wrapOccurrence(match, key, term) {
    const original = match.node.nodeValue;
    const before = original.slice(0, match.index);
    const visibleTerm = original.slice(match.index, match.index + match.length);
    const after = original.slice(match.index + match.length);
    const fragment = document.createDocumentFragment();
    const trigger = document.createElement('button');
    const language = (document.documentElement.lang || 'es').toLowerCase();
    const definitionLabel = language.startsWith('en')
      ? ': view definition'
      : ': ver definición';

    trigger.type = 'button';
    trigger.className = 'eidos-glossary-term';
    trigger.dataset.glossaryKey = key;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'eidos-glossary-popover');
    trigger.setAttribute('aria-label', visibleTerm + definitionLabel);
    trigger.textContent = visibleTerm || term;

    if (before) {
      fragment.appendChild(document.createTextNode(before));
    }

    fragment.appendChild(trigger);

    if (after) {
      fragment.appendChild(document.createTextNode(after));
    }

    match.node.parentNode.replaceChild(fragment, match.node);
    return trigger;
  }

  function createPopover() {
    const language = (document.documentElement.lang || 'es').toLowerCase();
    const closeLabel = language.startsWith('en')
      ? 'Close definition'
      : 'Cerrar definición';

    popover = document.createElement('aside');
    popover.id = 'eidos-glossary-popover';
    popover.hidden = true;
    popover.setAttribute('role', 'tooltip');
    popover.setAttribute('aria-live', 'polite');

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'eidos-glossary-close';
    closeButton.setAttribute('aria-label', closeLabel);
    closeButton.textContent = '\u00d7';

    contentHost = document.createElement('div');
    contentHost.className = 'eidos-glossary-content';

    popover.appendChild(closeButton);
    popover.appendChild(contentHost);
    document.body.appendChild(popover);
  }

  function clearTimers() {
    window.clearTimeout(closeTimer);
    window.clearTimeout(hideTimer);
    closeTimer = null;
    hideTimer = null;
  }

  function positionPopover() {
    if (!activeTrigger || !popover || popover.hidden) {
      return;
    }

    const triggerRect = activeTrigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const roomBelow = viewportHeight - triggerRect.bottom;
    const roomAbove = triggerRect.top;
    const placeAbove = roomBelow < popoverRect.height + POPOVER_GAP &&
      roomAbove > roomBelow;

    let left = triggerRect.left + (triggerRect.width / 2) - 42;
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, viewportWidth - popoverRect.width - VIEWPORT_MARGIN)
    );

    let top = placeAbove
      ? triggerRect.top - popoverRect.height - POPOVER_GAP
      : triggerRect.bottom + POPOVER_GAP;

    top = Math.max(
      VIEWPORT_MARGIN,
      Math.min(top, viewportHeight - popoverRect.height - VIEWPORT_MARGIN)
    );

    const arrowLeft = Math.max(
      18,
      Math.min(
        triggerRect.left + (triggerRect.width / 2) - left - 5,
        popoverRect.width - 28
      )
    );

    popover.dataset.placement = placeAbove ? 'top' : 'bottom';
    popover.style.left = Math.round(left) + 'px';
    popover.style.top = Math.round(top) + 'px';
    popover.style.setProperty(
      '--eidos-glossary-arrow-left',
      Math.round(arrowLeft) + 'px'
    );
  }

  function setPinned(nextPinned) {
    pinned = nextPinned;
    popover.classList.toggle('is-pinned', pinned);
    popover.setAttribute('role', pinned ? 'dialog' : 'tooltip');
  }

  function showPopover(trigger, shouldPin) {
    const template = document.querySelector(
      'template[data-eidos-glossary][data-glossary-key="' +
      CSS.escape(trigger.dataset.glossaryKey) + '"]'
    );

    if (!template) {
      return;
    }

    clearTimers();

    if (activeTrigger && activeTrigger !== trigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
    }

    activeTrigger = trigger;
    activeTrigger.setAttribute('aria-expanded', 'true');
    contentHost.replaceChildren(template.content.cloneNode(true));

    const entry = contentHost.querySelector('.eidos-glossary-entry');
    if (entry && entry.querySelector('.eidos-glossary-media')) {
      entry.classList.add('has-media');
    }

    setPinned(Boolean(shouldPin));
    popover.hidden = false;

    window.requestAnimationFrame(function () {
      positionPopover();
      popover.classList.add('is-visible');
    });
  }

  function closePopover(force) {
    if (!popover || popover.hidden || (pinned && !force)) {
      return;
    }

    clearTimers();
    setPinned(false);
    popover.classList.remove('is-visible');

    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
    }

    activeTrigger = null;
    hideTimer = window.setTimeout(function () {
      popover.hidden = true;
      contentHost.replaceChildren();
      popover.style.removeProperty('left');
      popover.style.removeProperty('top');
    }, 180);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      closePopover(false);
    }, CLOSE_DELAY_MS);
  }

  function bindTrigger(trigger) {
    trigger.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse' && !pinned) {
        showPopover(trigger, false);
      }
    });

    trigger.addEventListener('pointerleave', function (event) {
      if (event.pointerType === 'mouse' && !pinned) {
        scheduleClose();
      }
    });

    trigger.addEventListener('focus', function () {
      if (suppressNextFocus) {
        suppressNextFocus = false;
        return;
      }

      if (pinned && activeTrigger !== trigger) {
        showPopover(trigger, true);
        return;
      }

      if (!pinned) {
        showPopover(trigger, false);
      }
    });

    trigger.addEventListener('blur', function (event) {
      if (!pinned && !popover.contains(event.relatedTarget)) {
        scheduleClose();
      }
    });

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      showPopover(trigger, true);
    });
  }

  function initialiseGlossary() {
    const article = document.querySelector('[data-article-content]');
    const templates = Array.from(
      document.querySelectorAll('template[data-eidos-glossary][data-term]')
    );

    if (!article || !templates.length) {
      return;
    }

    createPopover();

    templates.forEach(function (template, index) {
      const term = template.dataset.term.trim();
      const aliases = (template.dataset.aliases || '')
        .split('|')
        .map(function (alias) { return alias.trim(); })
        .filter(Boolean);
      const candidates = [term].concat(aliases)
        .sort(function (a, b) { return b.length - a.length; });
      const key = template.dataset.glossaryKey || 'glossary-' + (index + 1);
      let match = null;
      let matchedTerm = term;

      template.dataset.glossaryKey = key;

      candidates.some(function (candidate) {
        match = findFirstOccurrence(article, candidate);
        if (match) {
          matchedTerm = candidate;
          return true;
        }
        return false;
      });

      if (match) {
        bindTrigger(wrapOccurrence(match, key, matchedTerm));
      }
    });

    popover.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') {
        window.clearTimeout(closeTimer);
      }
    });

    popover.addEventListener('pointerleave', function (event) {
      if (event.pointerType === 'mouse' && !pinned) {
        scheduleClose();
      }
    });

    popover.addEventListener('click', function (event) {
      if (!event.target.closest('.eidos-glossary-close') && !pinned) {
        setPinned(true);
      }
    });

    closeButton.addEventListener('click', function (event) {
      const triggerToFocus = activeTrigger;

      event.stopPropagation();
      closePopover(true);

      if (triggerToFocus && event.detail === 0) {
        suppressNextFocus = true;
        triggerToFocus.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && popover && !popover.hidden) {
        const triggerToFocus = activeTrigger;

        closePopover(true);

        if (triggerToFocus) {
          suppressNextFocus = true;
          triggerToFocus.focus({ preventScroll: true });
        }
      }
    });

    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseGlossary);
  } else {
    initialiseGlossary();
  }
})();




