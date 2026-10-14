/*
 * EIDOS Records UI (prototipo local, sin servidor)
 * Misma ID de juego = misma clasificación local en cualquier idioma del sitio.
 * Para récords mundiales reales falta conectar una API segura con validación de partidas.
 */
(function (global) {
  'use strict';
  const TRANSLATIONS = {
    es: {
      brand: 'E I D O S · ARCADE', heading: '★ NUEVO RÉCORD ★', subtitle: '¡HAS ENTRADO EN EL TOP 20!',
      position: 'TU POSICIÓN', score: 'PUNTUACIÓN', name: 'INTRODUCE TU NOMBRE',
      hint: 'MÁXIMO 10 CARACTERES · PULSA INTRO PARA CONFIRMAR', save: 'REGISTRAR RÉCORD →',
      skip: 'AHORA NO', rankings: 'CLASIFICACIÓN TOP 20', close: 'CERRAR', rankingButton: 'VER CLASIFICACIÓN',
      empty: '---', local: 'PRUEBA LOCAL: estos resultados solo se guardan en este navegador.',
      error: 'Introduce al menos un carácter.', back: 'VOLVER', saved: '¡RÉCORD REGISTRADO!', demo: 'DATOS DE EJEMPLO · NO SON RÉCORDS MUNDIALES'
    },
    en: {
      brand: 'E I D O S · ARCADE', heading: '★ NEW HIGH SCORE ★', subtitle: 'YOU MADE THE TOP 20!',
      position: 'YOUR RANK', score: 'SCORE', name: 'ENTER YOUR NAME',
      hint: 'MAX 10 CHARACTERS · PRESS ENTER TO CONFIRM', save: 'SAVE HIGH SCORE →',
      skip: 'NOT NOW', rankings: 'TOP 20 LEADERBOARD', close: 'CLOSE', rankingButton: 'VIEW LEADERBOARD',
      empty: '---', local: 'LOCAL DEMO: scores are saved in this browser only.',
      error: 'Enter at least one character.', back: 'BACK', saved: 'HIGH SCORE SAVED!', demo: 'SAMPLE DATA · NOT WORLD RECORDS'
    }
  };
  const SAFE_ID = /^[a-z0-9_-]{1,64}$/;
  const fmt = (value, language) => Number(value).toLocaleString(language === 'en' ? 'en-US' : 'es-ES');
  const cleanName = name => String(name || '').normalize('NFKC').replace(/[^\p{L}\p{N} _.\-]/gu, '').toUpperCase().slice(0, 10).trim();
  const cleanScore = n => Number.isSafeInteger(Number(n)) && Number(n) > 0 ? Number(n) : 0;
  const sortScores = list => list.slice().sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 20);
  let memoryStore = {};
  function read(key) {
    let items;
    try { items = JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (_) { items = memoryStore[key]; }
    return Array.isArray(items) ? sortScores(items.filter(item => item && cleanName(item.name) && cleanScore(item.score)).map(item => ({
      name: cleanName(item.name), score: cleanScore(item.score), time: Number(item.time) || Date.now()
    }))) : [];
  }
  function write(key, items) {
    memoryStore[key] = items;
    try { localStorage.setItem(key, JSON.stringify(items)); return true; }
    catch (_) { return false; }
  }
  function init({gameId, language = 'es', demo = false, sampleScores = []} = {}) {
    if (!SAFE_ID.test(gameId || '')) throw new Error('Debes indicar un identificador de juego válido.');
    const lang = language.toLowerCase().startsWith('en') ? 'en' : 'es';
    const t = TRANSLATIONS[lang];
    const storageKey = 'eidos-records-' + (demo ? 'sample-' : 'local-') + gameId + '-v1';
    if (demo && !read(storageKey).length && sampleScores.length) {
      write(storageKey, sortScores(sampleScores.filter(x => cleanName(x.name) && cleanScore(x.score)).map((x, i) => ({name: cleanName(x.name), score: cleanScore(x.score), time: i + 1}))));
    }
    const root = document.createElement('div');
    root.id = 'eidos-records-root';
    root.setAttribute('role', 'presentation');
    root.innerHTML = `
      <div class="eidos-records-scrim"></div>
      <section class="eidos-records-panel" role="dialog" aria-modal="true" aria-label="${t.rankings}">
        <button class="eidos-records-close" type="button" aria-label="${t.close}">×</button>
        <p class="eidos-records-brand">${t.brand}</p>
        <div class="eidos-records-screen" data-screen="entry" hidden>
          <h2 class="eidos-records-heading"><span class="eidos-records-star">★</span> ${lang === 'es' ? 'NUEVO RÉCORD' : 'NEW HIGH SCORE'} <span class="eidos-records-star">★</span></h2>
          <p class="eidos-records-subtitle">${t.subtitle}</p>
          <div class="eidos-records-stats"><div class="eidos-records-stat"><span class="eidos-records-stat-label">${t.position}</span><strong data-field="rank">—</strong></div>
          <div class="eidos-records-stat"><span class="eidos-records-stat-label">${t.score}</span><strong data-field="score">—</strong></div></div>
          <div class="eidos-records-rule"></div>
          <form data-form="name"><label class="eidos-records-field-label" for="eidos-records-name">${t.name}</label>
            <input class="eidos-records-input" id="eidos-records-name" type="text" autocapitalize="characters" autocomplete="off" maxlength="10" placeholder="__________" required>
            <p class="eidos-records-hint">${t.hint}</p><button class="eidos-records-button eidos-records-button-primary" type="submit">${t.save}</button>
          </form>
          <div class="eidos-records-actions"><button class="eidos-records-button" data-action="skip" type="button">${t.skip}</button></div>
        </div>
        <div class="eidos-records-screen" data-screen="board" hidden>
          <h2 class="eidos-records-heading">${t.rankings}</h2>
          <p class="eidos-records-subtitle" data-field="board-info">${demo ? t.demo : t.local}</p>
          <div class="eidos-records-board" data-field="list"></div>
          <div class="eidos-records-actions"><button class="eidos-records-button eidos-records-button-primary" data-action="close" type="button">${t.close}</button></div>
        </div>
        <p class="eidos-records-footer">${demo ? t.demo : t.local}</p>
      </section>`;
    document.body.appendChild(root);
    const entry = root.querySelector('[data-screen="entry"]');
    const board = root.querySelector('[data-screen="board"]');
    const input = root.querySelector('#eidos-records-name');
    let activeScore = 0;
    let previousFocus = null;
    let highlightedSignature = null;
    function switchTo(which) { entry.hidden = which !== 'entry'; board.hidden = which !== 'board'; }
    function show() { previousFocus = document.activeElement; root.classList.add('eidos-records-visible'); }
    function close() {
      root.classList.remove('eidos-records-visible');
      activeScore = 0;
      if (previousFocus && previousFocus.isConnected && previousFocus.focus) previousFocus.focus();
    }
    function isOpen() { return root.classList.contains('eidos-records-visible'); }
    function qualifies(score) { const s = cleanScore(score), values = read(storageKey); return s > 0 && (values.length < 20 || s > values[values.length - 1].score); }
    function rankFor(score) { return 1 + read(storageKey).filter(item => item.score >= score).length; }
    function view() {
      const scores = read(storageKey);
      const list = root.querySelector('[data-field="list"]');
      list.replaceChildren();
      for (let i = 0; i < 20; i++) {
        const result = scores[i];
        const row = document.createElement('div');
        row.className = 'eidos-records-row';
        if (result && result.name + ':' + result.score + ':' + result.time === highlightedSignature) row.classList.add('eidos-records-row--highlight');
        const place = document.createElement('span'); place.className = 'eidos-records-place' + (i === 0 ? ' eidos-records-place-first' : ''); place.textContent = String(i + 1).padStart(2, '0') + '.';
        const name = document.createElement('span'); name.className = 'eidos-records-name'; name.textContent = result ? result.name : '··········';
        const pts = document.createElement('span'); pts.className = 'eidos-records-points'; pts.textContent = result ? fmt(result.score, lang) : '—';
        row.append(place, name, pts); list.appendChild(row);
      }
      switchTo('board'); show();
      root.querySelector('[data-action="close"]').focus();
    }
    function promptScore(score) {
      const s = cleanScore(score);
      if (!qualifies(s)) return false;
      activeScore = s;
      root.querySelector('[data-field="rank"]').textContent = String(rankFor(s)).padStart(2,'0');
      root.querySelector('[data-field="score"]').textContent = fmt(s, lang);
      input.value = '';
      switchTo('entry'); show(); input.focus(); return true;
    }
    root.querySelector('[data-form="name"]').addEventListener('submit', function(event) {
      event.preventDefault();
      const name = cleanName(input.value);
      if (!name) { input.focus(); return; }
      if (!qualifies(activeScore)) { view(); return; }
      const now = Date.now();
      const record = {name, score: activeScore, time: now};
      write(storageKey, sortScores([...read(storageKey), record]));
      highlightedSignature = name + ':' + activeScore + ':' + now;
      activeScore = 0;
      view();
    });
    root.querySelector('[data-action="skip"]').addEventListener('click', close);
    root.querySelector('[data-action="close"]').addEventListener('click', close);
    root.querySelector('.eidos-records-close').addEventListener('click', close);
    root.querySelector('.eidos-records-scrim').addEventListener('click', close);
    document.addEventListener('keydown', event => {
      if (!root.classList.contains('eidos-records-visible')) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); }
      else if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(event.key) && document.activeElement === input) event.stopImmediatePropagation();
    }, true);
    return {view, promptScore, qualifies, close, isOpen};
  }
  global.EidosRecordsUI = {init};
})(window);
