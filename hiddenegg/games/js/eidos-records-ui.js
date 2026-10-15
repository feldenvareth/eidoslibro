/*
 * EIDOS Records UI · Universal multilingual Top 20.
 * The same gameId always shares a WORLD ranking, regardless of language.
 * Until the API_BASE setting below has a deployed URL, local rankings still work.
 * To connect API after deploy, set ONE value in this shared file.
 */
(function (global) {
  'use strict';

  // SET THIS ONLY ONCE after deploying the Cloudflare Worker:
  // Example: 'https://eidos-records-api.YOUR-SUBDOMAIN.workers.dev'
  const DEPLOYED_API_URL = 'https://eidos-records-api.feldenvareth.workers.dev'; // API mundial Eidos, ES y EN.
  const API_BASE = String(global.EIDOS_RECORDS_API_URL || DEPLOYED_API_URL).trim().replace(/\/+$/, '');
  const TRANSLATIONS = {
    es: {
      brand: 'E I D O S · ARCADE', heading: 'NUEVO RÉCORD', subtitle: '¡HAS ENTRADO EN EL TOP 20!',
      position: 'TU POSICIÓN', score: 'PUNTUACIÓN', name: 'INTRODUCE TU NOMBRE',
      hint: 'MÁXIMO 10 CARACTERES · INTRO PARA CONFIRMAR', countryLabel: 'PAÍS (OPCIONAL)', noFlag: 'SIN BANDERA', dateLabel: 'Fecha del récord', save: 'REGISTRAR RÉCORD →',
      skip: 'AHORA NO', rankings: 'CLASIFICACIÓN TOP 20', close: 'CERRAR',
      local: 'CLASIFICACIÓN LOCAL · Solo se guarda en este navegador.',
      offline: 'SIN CONEXIÓN · Clasificación local de este navegador.',
      savedLocal: 'RÉCORD LOCAL GUARDADO · No registrado en el TOP 20 mundial. Se conserva en este navegador; no se enviará automáticamente.',
      savedTemporary: 'SIN CONEXIÓN · No se pudo guardar de forma permanente. El récord se conserva solo mientras permanezca abierta esta página.',
      viewLocal: 'VER MIS RÉCORDS LOCALES', viewWorld: 'VER RÉCORDS MUNDIALES',
      world: 'CAMPEONATO MUNDIAL · Español e inglés comparten puntuaciones.',
      loading: 'CARGANDO CLASIFICACIÓN…',
      saving: 'GUARDANDO…',
      error: 'No se ha podido registrar. Inténtalo de nuevo.',
      invalid: 'La API ha rechazado la puntuación. Revisa tu partida o inténtalo más tarde.',
      outdated: 'La puntuación ya no está entre las 20 mejores.',
      session: 'No se ha podido verificar esta partida. Inicia una nueva para participar.',
      duplicate: 'Esta partida ya se ha registrado.',
      limited: 'Demasiados intentos. Vuelve a intentarlo más tarde.',
      prompt: 'Escribe al menos un carácter.', stage: 'EVOLUCIÓN MÁXIMA', unknownStage: 'SIN DATOS', rankOrder: 'ORDEN: EVOLUCIÓN MÁXIMA Y DESPUÉS PUNTOS',
      demo: 'DATOS DE EJEMPLO · NO SON RÉCORDS MUNDIALES'
    },
    en: {
      brand: 'E I D O S · ARCADE', heading: 'NEW HIGH SCORE', subtitle: 'YOU MADE THE TOP 20!',
      position: 'YOUR RANK', score: 'SCORE', name: 'ENTER YOUR NAME',
      hint: 'MAX 10 CHARACTERS · PRESS ENTER TO CONFIRM', countryLabel: 'COUNTRY (OPTIONAL)', noFlag: 'NO FLAG', dateLabel: 'Record date', save: 'SAVE HIGH SCORE →',
      skip: 'NOT NOW', rankings: 'TOP 20 LEADERBOARD', close: 'CLOSE',
      local: 'LOCAL LEADERBOARD · Saved in this browser only.',
      offline: 'OFFLINE · Showing local scores from this browser.',
      savedLocal: 'LOCAL SCORE SAVED · Not submitted to the world Top 20. Stored in this browser; it will not be sent automatically.',
      savedTemporary: 'OFFLINE · Could not save permanently. This score is kept only while this page stays open.',
      viewLocal: 'MY LOCAL SCORES', viewWorld: 'WORLD LEADERBOARD',
      world: 'WORLD CHAMPIONSHIP · Spanish and English share scores.',
      loading: 'LOADING LEADERBOARD…',
      saving: 'SAVING…',
      error: 'Could not save your score. Please try again.',
      invalid: 'The API rejected the score. Check your run or try again later.',
      outdated: 'Your score is no longer in the Top 20.',
      session: 'This game session could not be verified. Start a new game to participate.',
      duplicate: 'This game session was already submitted.',
      limited: 'Too many attempts. Please try again later.',
      prompt: 'Enter at least one character.', stage: 'MAXIMUM EVOLUTION', unknownStage: 'UNKNOWN', rankOrder: 'RANKED BY EVOLUTION, THEN SCORE',
      demo: 'SAMPLE DATA · NOT WORLD RECORDS'
    }
  };
  // One two-letter code per country. No IP-derived location or automatic nationality.
  const COUNTRIES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');
  const COUNTRY_SET = new Set(COUNTRIES);
  const cleanCountry = value => COUNTRY_SET.has(value) ? value : '';
  function flagEmoji(country) {
    const c = cleanCountry(country);
    return c ? String.fromCodePoint(...[...c].map(letter => letter.charCodeAt(0) + 0x1F1E6 - 65)) : '';
  }
  function recordDate(iso, lang) {
    const when = new Date(iso);
    if (!iso || !Number.isFinite(when.getTime()) || when.getUTCFullYear() < 2000) return '';
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB',
      {day:'2-digit',month:'2-digit',year:'numeric'}).format(when);
  }
  const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,63}$/;
  const cleanName = value => String(value || '').normalize('NFKC').replace(/[^\p{L}\p{N} _.\-]/gu, '').toUpperCase().trim().slice(0, 10).trim();
  const cleanScore = value => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : 0;
  const cleanStage = value => Number.isSafeInteger(value) && value >= 1 && value <= 1000000 ? value : null;
  const compareRecords = (a, b) => (b.stage ?? 0) - (a.stage ?? 0) || b.score - a.score || String(a.at).localeCompare(String(b.at));
  const sortScores = (scores, stageAware = false) => scores.filter(x => x && cleanName(x.name) && cleanScore(x.score))
    .map(x => ({name: cleanName(x.name), score: cleanScore(x.score), ...(cleanStage(x.stage) ? {stage: x.stage} : {}), ...(cleanCountry(x.country) ? {country: x.country} : {}), at: x.at || x.time || ''}))
    .sort(stageAware ? compareRecords : (a,b) => b.score - a.score || String(a.at).localeCompare(String(b.at))).slice(0,20);
  const format = (n, lang) => Number(n).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US');
  const qualify = (scores, s, stage, stageAware) => s > 0 && (scores.length < 20 ||
    (stageAware ? compareRecords({score:s,stage,at:'9999'}, scores[scores.length - 1]) < 0 : s > scores[scores.length - 1].score));
  const ranking = (scores, s, stage, stageAware) => 1 + scores.filter(x => stageAware
    ? compareRecords(x, {score:s,stage,at:'9999'}) <= 0 : x.score >= s).length;
  const memoryStore = {};
  function localRead(key, stageAware = false) {
    try { return sortScores(JSON.parse(localStorage.getItem(key) || '[]'), stageAware); }
    catch (_) { return sortScores(memoryStore[key] || [], stageAware); }
  }
  function localWrite(key, scores) {
    memoryStore[key] = scores;
    try { localStorage.setItem(key, JSON.stringify(scores)); return true; } catch (_) { return false; }
  }
  async function api(path, body) {
    if (!API_BASE) throw new Error('api_not_configured');
    const response = await fetch(API_BASE + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {'Accept': 'application/json', ...(body === undefined ? {} : {'Content-Type':'application/json'})},
      ...(body === undefined ? {} : {body: JSON.stringify(body)}),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data?.error || 'network_error');
      error.status = response.status;
      throw error;
    }
    return data;
  }
  function init({gameId, language = 'es', demo = false, sampleScores = [], stages = [], labels = {}} = {}) {
    if (!SAFE_ID.test(gameId || '')) throw new Error('Identificador de juego inválido.');
    const lang = String(language).toLowerCase().startsWith('en') ? 'en' : 'es';
    const t = TRANSLATIONS[lang];
    const stageNames = new Map((Array.isArray(stages) ? stages : []).filter(x => cleanStage(x?.value) && typeof x.name === 'string').map(x => [x.value, x.name]));
    const stageAware = stageNames.size > 0;
    const labelStage = typeof labels.stage === 'string' && labels.stage.trim() ? labels.stage.slice(0,80) : t.stage;
    const labelScore = typeof labels.score === 'string' && labels.score.trim() ? labels.score.slice(0,80) : t.score;
    const labelOrder = typeof labels.order === 'string' && labels.order.trim() ? labels.order.slice(0,160) : t.rankOrder;
    const stageLabel = value => cleanStage(value) && stageNames.has(value) ? stageNames.get(value) : t.unknownStage;
    const readLocal = () => localRead(storageKey, stageAware);
    const storageKey = 'eidos-records-' + (demo ? 'sample-' : 'local-') + gameId + '-v1';
    if (demo && !readLocal().length && sampleScores.length) localWrite(storageKey, sortScores(sampleScores, stageAware));
    const remoteEnabled = Boolean(API_BASE && !demo);
    let scores = readLocal();
    let worldScores = [];
    let online = false;
    let boardLocal = !remoteEnabled;
    let localSaveNotice = false;
    let localSaveIssue = false;
    let currentScore = 0;
    let currentStage = null;
    let highlighted = '';
    let previousFocus = null;
    let loadId = 0;
    let sessionPromise = null;
    let session = null;
    let busy = false;

    const root = document.createElement('div');
    root.id = 'eidos-records-root';
    root.setAttribute('role', 'presentation');
    root.innerHTML = `
      <div class="eidos-records-scrim"></div>
      <section class="eidos-records-panel" role="dialog" aria-modal="true" aria-label="${t.rankings}">
        <button class="eidos-records-close" type="button" aria-label="${t.close}">×</button>
        <p class="eidos-records-brand">${t.brand}</p>
        <div class="eidos-records-screen" data-screen="entry" hidden>
          <h2 class="eidos-records-heading"><span class="eidos-records-star">★</span> ${t.heading} <span class="eidos-records-star">★</span></h2>
          <p class="eidos-records-subtitle">${t.subtitle}</p>
          <div class="eidos-records-stats"><div class="eidos-records-stat"><span class="eidos-records-stat-label">${t.position}</span><strong data-field="rank">—</strong></div>
          <div class="eidos-records-stat"><span class="eidos-records-stat-label">${t.score}</span><strong data-field="score">—</strong></div></div>
          <p class="eidos-records-stage-entry" data-field="entry-stage" hidden></p>
          <div class="eidos-records-rule"></div>
          <form data-form="name"><label class="eidos-records-field-label" for="eidos-records-name">${t.name}</label>
            <input class="eidos-records-input" id="eidos-records-name" type="text" autocapitalize="characters" autocomplete="off" maxlength="10" placeholder="__________" required>
            <p class="eidos-records-hint">${t.hint}</p>
            <label class="eidos-records-country-label" for="eidos-records-country">${t.countryLabel}</label>
            <select class="eidos-records-country" id="eidos-records-country"><option value="">${t.noFlag}</option></select>
            <button class="eidos-records-button eidos-records-button-primary" data-action="submit" type="submit">${t.save}</button>
            <p class="eidos-records-footer" data-field="submit-error" role="status" aria-live="polite"></p>
          </form>
          <div class="eidos-records-actions"><button class="eidos-records-button" data-action="skip" type="button">${t.skip}</button></div>
        </div>
        <div class="eidos-records-screen" data-screen="board" hidden>
          <h2 class="eidos-records-heading">${t.rankings}</h2>
          <p class="eidos-records-order" ${stageAware ? '' : 'hidden'}>${t.rankOrder || ''}</p>
          <p class="eidos-records-subtitle" data-field="board-info">${remoteEnabled ? t.loading : t.local}</p>
          <div class="eidos-records-board" data-field="list"></div>
          <div class="eidos-records-actions"><button class="eidos-records-button" data-action="switch-board" type="button" hidden></button><button class="eidos-records-button eidos-records-button-primary" data-action="close" type="button">${t.close}</button></div>
        </div>
        <p class="eidos-records-footer" data-field="footer">${demo ? t.demo : remoteEnabled ? t.loading : t.local}</p>
      </section>`;
    document.body.appendChild(root);
    root.querySelectorAll('.eidos-records-stat-label')[1].textContent = labelScore;
    root.querySelector('.eidos-records-order').textContent = labelOrder;
    const entry = root.querySelector('[data-screen="entry"]');
    const board = root.querySelector('[data-screen="board"]');
    const input = root.querySelector('#eidos-records-name');
    const countrySelect = root.querySelector('#eidos-records-country');
    const displayNames = new Intl.DisplayNames([lang === 'es' ? 'es' : 'en'], {type:'region'});
    const countryOptions = COUNTRIES.map(code => ({code, label:displayNames.of(code)}))
      .sort((a,b) => a.label.localeCompare(b.label, lang === 'es' ? 'es' : 'en'));
    for (const {code, label} of countryOptions) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${flagEmoji(code)} ${label}`;
      countrySelect.appendChild(option);
    }
    const errorLabel = root.querySelector('[data-field="submit-error"]');
    const saveButton = root.querySelector('[data-action="submit"]');
    const switchBoardButton = root.querySelector('[data-action="switch-board"]');
    if (stageAware) root.classList.add('eidos-records-with-stage');

    function currentNote() {
      if (demo) return t.demo;
      if (!remoteEnabled) return t.local;
      if (boardLocal) {
        if (localSaveNotice) return localSaveIssue ? t.savedTemporary : t.savedLocal;
        return online ? t.local : t.offline;
      }
      return online ? t.world : t.offline;
    }
    function setNote(note = currentNote()) {
      root.querySelector('[data-field="board-info"]').textContent = note;
      root.querySelector('[data-field="footer"]').textContent = note;
    }
    function show(which) {
      entry.hidden = which !== 'entry'; board.hidden = which !== 'board';
      if (!root.classList.contains('eidos-records-visible')) previousFocus = document.activeElement;
      root.classList.add('eidos-records-visible');
    }
    function close() {
      if (busy) return;
      root.classList.remove('eidos-records-visible');
      currentScore = 0; currentStage = null;
      if (previousFocus && previousFocus.isConnected && previousFocus.focus) previousFocus.focus();
    }
    function isOpen() { return root.classList.contains('eidos-records-visible'); }
    function drawBoard(noteOverride = null) {
      const list = root.querySelector('[data-field="list"]');
      list.replaceChildren();
      for (let i = 0; i < 20; i++) {
        const result = scores[i];
        const row = document.createElement('div'); row.className = 'eidos-records-row';
        if (result && result.name + ':' + result.score + ':' + result.at === highlighted) row.classList.add('eidos-records-row--highlight');
        const place = document.createElement('span'); place.className = 'eidos-records-place' + (i === 0 ? ' eidos-records-place-first' : '');
        place.textContent = String(i + 1).padStart(2, '0') + '.';
        const player = document.createElement('span'); player.className = 'eidos-records-player';
        const playerLine = document.createElement('span'); playerLine.className = 'eidos-records-player-line';
        if (result?.country) {
          const flag = document.createElement('span'); flag.className = 'eidos-records-flag';
          flag.textContent = flagEmoji(result.country);
          flag.title = displayNames.of(result.country);
          playerLine.appendChild(flag);
        }
        const name = document.createElement('span'); name.className = 'eidos-records-name'; name.textContent = result?.name || '··········';
        playerLine.appendChild(name);
        player.appendChild(playerLine);
        const date = result && recordDate(result.at, lang);
        if (date) {
          const when = document.createElement('span'); when.className = 'eidos-records-date';
          when.textContent = date; when.title = t.dateLabel;
          player.appendChild(when);
        }
        const pts = document.createElement('span'); pts.className = 'eidos-records-points'; pts.textContent = result ? format(result.score, lang) : '—';
        if (stageAware) {
          const stage = document.createElement('span'); stage.className = 'eidos-records-stage';
          stage.textContent = result ? stageLabel(result.stage) : '—';
          if (result) stage.title = stage.textContent;
          row.append(place, player, stage, pts);
        } else row.append(place, player, pts);
        list.appendChild(row);
      }
      setNote(noteOverride || currentNote());
      // The local ranking remains accessible even after connectivity returns.
      const localAvailable = readLocal().length > 0;
      switchBoardButton.hidden = !remoteEnabled || (!boardLocal && !localAvailable);
      switchBoardButton.textContent = boardLocal ? t.viewWorld : t.viewLocal;
    }
    async function refresh() {
      if (!remoteEnabled) { scores = readLocal(); online = false; return; }
      const id = ++loadId;
      try {
        const result = await api('/v1/leaderboard?game=' + encodeURIComponent(gameId));
        if (id !== loadId) return;
        if (result?.game !== gameId || !Array.isArray(result.scores)) throw new Error('invalid_response');
        worldScores = sortScores(result.scores, stageAware); online = true;
        if (!boardLocal) scores = worldScores;
      } catch (error) {
        if (id !== loadId) return;
        console.warn('EIDOS: no se puede consultar la clasificación mundial.', error);
        boardLocal = true;
        scores = readLocal(); online = false;
      }
    }
    async function startSession() {
      if (!remoteEnabled) return null;
      // Starting a new run uses a new signed ticket, avoiding a second use of an old ticket.
      sessionPromise = api('/v1/session', {game: gameId}).then(data => {
        if (!data?.ticket) throw new Error('invalid_ticket');
        session = data.ticket; return session;
      }).catch(error => { session = null; console.warn('EIDOS: session unavailable', error); return null; });
      return sessionPromise;
    }
    async function view() {
      boardLocal = !remoteEnabled;
      localSaveNotice = false;
      show('board');
      drawBoard(remoteEnabled ? t.loading : null);
      await refresh();
      if (!board.hidden && isOpen()) drawBoard();
    }
    function saveLocally(name) {
      const record = {name, score: currentScore, ...(cleanCountry(countrySelect.value) ? {country: countrySelect.value} : {}), ...(currentStage != null ? {stage: currentStage} : {}), at: new Date().toISOString()};
      const updated = sortScores([...readLocal(), record], stageAware);
      localSaveIssue = !localWrite(storageKey, updated);
      localSaveNotice = true;
      boardLocal = true;
      scores = updated;
      highlighted = record.name + ':' + record.score + ':' + record.at;
      currentScore = 0; currentStage = null;
      show('board');
      drawBoard();
    }
    async function promptScore(score, details = {}) {
      const s = cleanScore(score);
      const stage = stageAware ? cleanStage(details.stage) : null;
      if (!s) return false;
      await refresh();
      const comparison = online ? worldScores : readLocal();
      if (!qualify(comparison, s, stage, stageAware)) return false;
      currentScore = s; currentStage = stage;
      const stageField = root.querySelector('[data-field="entry-stage"]');
      stageField.hidden = !stageAware;
      if (stageAware) stageField.textContent = `${labelStage}: ${stageLabel(currentStage)}`;
      root.querySelector('[data-field="rank"]').textContent = String(ranking(comparison, s, stage, stageAware)).padStart(2, '0');
      root.querySelector('[data-field="score"]').textContent = format(s, lang);
      input.value = '';
      countrySelect.value = '';
      errorLabel.textContent = '';
      show('entry');
      setNote();
      input.focus();
      return true;
    }
    root.querySelector('[data-form="name"]').addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      const name = cleanName(input.value);
      if (!name) { errorLabel.textContent = t.prompt; input.focus(); return; }
      busy = true; saveButton.disabled = true; saveButton.textContent = t.saving;
      errorLabel.textContent = '';
      try {
        if (remoteEnabled && online) {
          const ticket = session || await sessionPromise;
          if (!ticket) throw new Error('invalid_or_expired_session');
          const result = await api('/v1/scores', {game: gameId, name, score: currentScore, ...(currentStage != null ? {stage: currentStage} : {}), ...(cleanCountry(countrySelect.value) ? {country: countrySelect.value} : {}), ticket});
          session = null;
          if (!result.accepted) {
            scores = sortScores(result.scores || [], stageAware);
            errorLabel.textContent = t.outdated;
            return;
          }
          worldScores = sortScores(result.scores || [], stageAware);
          scores = worldScores;
          boardLocal = false;
          localSaveNotice = false;
          highlighted = '';
          const match = scores.find(x => x.name === name && x.score === currentScore);
          if (match) highlighted = match.name + ':' + match.score + ':' + match.at;
        } else {
          // No API or API unavailable: always preserve the result locally.
          saveLocally(name);
          return;
        }
        currentScore = 0;
        show('board'); drawBoard();
      } catch (error) {
        const code = error?.message;
        console.warn('EIDOS: score rejected/unavailable', error);
        // Rejected or duplicated scores are NOT passed off as real world records.
        // All connectivity problems (timeouts, 5xx, expired session, throttling)
        // save locally; they never claim to have been published globally.
        if (![400, 409, 422].includes(error?.status)) {
          saveLocally(name);
          return;
        }
        errorLabel.textContent = code === 'already_submitted' ? t.duplicate
          : code === 'implausible_score' || code === 'implausible_duration' || code === 'invalid_score' ? t.invalid : t.error;
      } finally {
        busy = false; saveButton.disabled = false; saveButton.textContent = t.save;
      }
    });
    switchBoardButton.addEventListener('click', async () => {
      if (busy) return;
      if (!boardLocal) {
        boardLocal = true;
        localSaveNotice = false;
        scores = readLocal();
        drawBoard();
      } else {
        boardLocal = false;
        localSaveNotice = false;
        drawBoard(t.loading);
        await refresh();
        if (!board.hidden && isOpen()) drawBoard();
      }
    });
    root.querySelector('[data-action="skip"]').addEventListener('click', close);
    root.querySelector('[data-action="close"]').addEventListener('click', close);
    root.querySelector('.eidos-records-close').addEventListener('click', close);
    root.querySelector('.eidos-records-scrim').addEventListener('click', close);
    document.addEventListener('keydown', event => {
      if (!isOpen()) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); }
      else if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(event.key) && document.activeElement === input)
        event.stopImmediatePropagation();
    }, true);
    // One initial ticket covers games that already used the shared UI before adding startSession().
    if (remoteEnabled) void startSession();
    return {view, promptScore, startSession, qualifies: (s, stage = null) => qualify(scores, cleanScore(s), cleanStage(stage), stageAware), close, isOpen};
  }
  global.EidosRecordsUI = {init};
})(window);
