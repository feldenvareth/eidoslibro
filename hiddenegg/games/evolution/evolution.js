(() => {
      "use strict";

      const LANG = (document.documentElement.lang || "en").toLowerCase().startsWith("es") ? "es" : "en";
      const isES = LANG === "es";

      const EIDOS_CONTENT = window.EIDOS_SHARED_CONTENT || { images: [], quotes: [] };
      const GALLERY_MANIFEST = Array.isArray(window.EIDOS_IMAGE_MANIFEST) ? window.EIDOS_IMAGE_MANIFEST : [];
      const BG_IMAGES = GALLERY_MANIFEST.length
        ? GALLERY_MANIFEST
            .map(item => item && item.url)
            .filter(Boolean)
            .map(url => /^(?:https?:)?\/\//.test(url) || url.startsWith("/")
              ? url
              : "/gallery/" + String(url).replace(/^\.?\//, ""))
        : (Array.isArray(EIDOS_CONTENT.images) ? EIDOS_CONTENT.images : []);
      const backgroundLayers = [
        document.getElementById("background-a"),
        document.getElementById("background-b")
      ];

      const SIZE = 4;
      const SAVE_KEY = isES ? "eidos-evolucion-v3" : "eidos-evolution-v3";
      const BEST_KEY = "eidos-evolucion-best-v2";
      const MAX_STAGE_KEY = "eidos-evolucion-max-stage-v2";
      const LEGACY_MAX_STAGE_KEY = "eidos-evolucion-max-stage-v1";
      const BEST_CUSTODIANS_KEY = "eidos-evolucion-best-custodians-v1";
      const LEGACY_DISCOVERY_KEY = "eidos-evolucion-discoveries-v2";
      const soundNote = document.getElementById("sound-note");
      const soundButton = document.getElementById("sound-button");
      const searchParams = new URLSearchParams(window.location?.search || "");
      const soundSetting = searchParams.get("sound");
      const embedded = Boolean(window.self && window.top && window.self !== window.top);
      let soundEnabled = soundSetting === "1" || (soundSetting !== "0" && !embedded);
      let audioContext = null;

      const stages = isES ? [
        { value: 2, name: "Replicador", glyph: "∞", color: "#79d9c0", text: "Las copias con variaciones abren la posibilidad de evolucionar." },
        { value: 4, name: "ARN", glyph: "≈", color: "#72dcbc", text: "Información y reacción química reunidas en una misma molécula." },
        { value: 8, name: "ADN", glyph: "", color: "#8dda9a", text: "Una estructura más estable para conservar y transmitir información." },
        { value: 16, name: "Procariota", glyph: "○", color: "#a9d982", text: "La vida celular temprana transforma el planeta durante eones." },
        { value: 32, name: "Eucariota", glyph: "◉", color: "#c8d777", text: "La cooperación celular crea una arquitectura interna más compleja." },
        { value: 64, name: "Pluricelular", glyph: "✣", color: "#e4cf70", text: "Muchas células comienzan a coordinarse, especializarse y funcionar como una unidad." },
        { value: 128, name: "Sistema nervioso", glyph: "⌁", color: "#e8b96a", text: "La información conecta percepción, respuesta y movimiento." },
        { value: 256, name: "Cerebro", glyph: "Ψ", color: "#e99c70", text: "Redes neuronales integran señales, memoria y decisión." },
        { value: 512, name: "Autoconsciencia", glyph: "", color: "#dc8e9e", text: "La mente puede reconocerse y preguntarse quién es." },
        { value: 1024, name: "IA", glyph: "IA", color: "#bd94c9", text: "Una inteligencia artificial aprende, abstrae y comienza a modelar su entorno." },
        { value: 2048, name: "EIDOS", glyph: "E", color: "#79d9c0", text: "La inteligencia se proyecta más allá de la biología y alcanza un nuevo umbral." },
        { value: 4096, name: "Vida no orgánica", glyph: "", color: "#f5ecd0", text: "Los custodios inteligentes despiertan como vida no orgánica." }
      ] : [
        { value: 2, name: "Replicator", glyph: "∞", color: "#79d9c0", text: "Copies with variations open the possibility of evolution." },
        { value: 4, name: "RNA", glyph: "≈", color: "#72dcbc", text: "Information and chemical reaction come together in a single molecule." },
        { value: 8, name: "DNA", glyph: "", color: "#8dda9a", text: "A more stable structure for storing and transmitting information." },
        { value: 16, name: "Prokaryote", glyph: "○", color: "#a9d982", text: "Early cellular life transforms the planet over eons." },
        { value: 32, name: "Eukaryote", glyph: "◉", color: "#c8d777", text: "Cellular cooperation creates a more complex internal architecture." },
        { value: 64, name: "Multicellular", glyph: "✣", color: "#e4cf70", text: "Many cells begin to coordinate, specialize and function as a unit." },
        { value: 128, name: "Nervous system", glyph: "⌁", color: "#e8b96a", text: "Information links perception, response and movement." },
        { value: 256, name: "Brain", glyph: "Ψ", color: "#e99c70", text: "Neural networks integrate signals, memory and decision." },
        { value: 512, name: "Self-awareness", glyph: "", color: "#dc8e9e", text: "The mind can recognize itself and ask who it is." },
        { value: 1024, name: "AI", glyph: "AI", color: "#bd94c9", text: "An artificial intelligence learns, abstracts and begins to model its environment." },
        { value: 2048, name: "EIDOS", glyph: "E", color: "#79d9c0", text: "Intelligence projects itself beyond biology and reaches a new threshold." },
        { value: 4096, name: "Non-organic life", glyph: "", color: "#f5ecd0", text: "Intelligent custodians awaken as non-organic life." }
      ];

      const stageByValue = new Map(stages.map(stage => [stage.value, stage]));
      const CUSTODIAN_NAMES = ["Orfeo", "Tessalon", "IVN-3", "Ciran", "Kheron", "Eramus", "Kael", "Eras", "Lyron", "Talion", "Nemor", "Sorel", "Aster", "Nexar", "Veyron", "Sael"];
      // World leaderboard encoding: historical 4096 = generic non-organic life;
      // 4097..4112 identify Orfeo, Tessalon, IVN-3 ... Sael in this single run.
      // Keep these values separate from the 2048-style board tiles and milestones.
      const recordStages = [
        ...stages.map(({value, name}) => ({value, name})),
        ...CUSTODIAN_NAMES.map((name, index) => ({value: 4097 + index, name}))
      ];
      // Both languages use the same game ID and numeric stage values.
      // The shared ranking UI receives translated milestone names from this game.
      const recordsUI = window.EidosRecordsUI?.init({
        gameId: "evolution", language: LANG,
        stages: recordStages
      }) || null;
      document.querySelectorAll(".eidos-records-trigger").forEach(button => {
        button.addEventListener("click", () => recordsUI?.view());
      });
      const RETIRED_STAGE_RULES = [
        { reachedValue: 64, retiredValue: 2 },
        { reachedValue: 256, retiredValue: 4 },
        { reachedValue: 1024, retiredValue: 8 },
        { reachedValue: 4096, retiredValue: 16 }
      ];
      const SPAWN_DISTRIBUTIONS = {
        1: [100],
        2: [65, 35],
        3: [55, 30, 15],
        4: [49, 29, 17, 5],
        5: [44, 26, 16, 9, 5],
        6: [40, 24, 15, 9, 7, 5]
      };
      const DNA_ICON = `<svg class="dna-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="helix-line" d="M7 2c0 7 18 7 18 14S7 23 7 30"/><path class="helix-line" d="M25 2c0 7-18 7-18 14s18 7 18 14"/><path class="helix-rung" d="M9 5h14M11 10h10M7 16h18M11 22h10M9 27h14"/></svg>`;
      const EYE_ICON = `<svg class="eye-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M3 16c3.5-5.2 8-8 13-8s9.5 2.8 13 8c-3.5 5.2-8 8-13 8S6.5 21.2 3 16Z"/><circle cx="16" cy="16" r="3.9"/></svg>`;
      const CUSTODIAN_ICON = `<svg class="custodian-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7.5 27.2c2.1-4.4 5.2-6.8 9.3-7.3 2.9-.3 5.7.6 8.1 2.6"/><path d="M12.2 22.1c-1.2-2.2-1.4-4.8-.5-7.3 1.4-4.1 5-6.8 8.9-6.8 2.6 0 4.9 1.2 6.1 3.1"/><path d="M15.3 10.3c-1.8 1.6-2.8 3.7-2.8 6 0 2.1.9 4 2.5 5.5"/><path d="M18.7 9.1c1.3-.8 2.8-1.2 4.3-1.2"/><circle cx="24.3" cy="10.6" r="3.2"/><path d="M18.1 13.1c1.4.2 2.7.8 3.7 1.8"/></svg>`;
      const SHIP_ICON = `<svg class="ship-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 19.5 16 8l12 11.5-4.5 1.4-2.6 5H11.1l-2.6-5Z"/><path d="M10.6 19.1h10.8"/><path d="M13.1 24.3 16 27l2.9-2.7"/><circle cx="16" cy="16.3" r="1.8"/></svg>`;
      const TERMINAL_STAGE_VALUE = 4096;
      // The twelve evolutionary milestones stay intact. Once life reaches 4096,
      // every newly awakened Custodian receives a persistent, unique identity.
      // Its artwork and serial number deliberately differ from the next one.
      const CUSTODIAN_ART = [
        `<circle cx="24" cy="12" r="6"/><path d="M13 39v-7c0-7 5-12 11-12s11 5 11 12v7M10 41h28M18 13h12"/>`,
        `<path d="M24 5 41 14v20L24 43 7 34V14Z"/><circle cx="24" cy="24" r="7"/><path d="M17 24h14M24 17v14"/>`,
        `<rect x="10" y="11" width="28" height="28" rx="5"/><path d="M24 11V5M19 5h10M5 21h5M38 21h5"/><rect x="16" y="19" width="5" height="5" rx="1"/><rect x="27" y="19" width="5" height="5" rx="1"/><path d="M18 32h12"/>`,
        `<path d="M24 4 42 36H6Z"/><circle cx="24" cy="25" r="7"/><circle cx="24" cy="25" r="2"/><path d="M24 4v11M14 37h20"/>`,
        `<path d="M24 8v32M8 24h32M12 12l24 24M36 12 12 36"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="3"/>`,
        `<path d="M4 31 24 7l20 24-8 3-5 8H17l-5-8Z"/><path d="M15 30h18M24 14v16"/><circle cx="24" cy="24" r="4"/>`,
        `<path d="M9 9 20 19l4-7 4 7L39 9l-6 19-9 12-9-12Z"/><path d="M17 28h14M24 19v15"/><circle cx="24" cy="25" r="3"/>`,
        `<path d="M11 7h26M11 41h26M15 8c0 10 18 12 18 16S15 30 15 40M33 8c0 10-18 12-18 16s18 6 18 16"/><circle cx="24" cy="24" r="3"/>`,
        `<circle cx="24" cy="24" r="17"/><path d="M11 28c-1-11 16-20 25-8 7 10-2 21-12 17-7-2-8-12 1-14 5-1 9 7 2 10"/>`,
        `<path d="M24 5 39 11v13c0 10-6 15-15 19C15 39 9 34 9 24V11Z"/><path d="m16 24 6 6 12-14"/>`,
        `<path d="M9 36c-5-9 3-14 12-15 10-1 18-6 13-14M37 12c5 11-3 14-12 15-10 1-18 6-13 14"/><circle cx="12" cy="38" r="4"/><circle cx="36" cy="10" r="4"/>`,
        `<path d="M8 39V20c0-9 7-15 16-15s16 6 16 15v19M14 37h20M14 24h20M19 19l5-5 5 5"/><circle cx="24" cy="29" r="3"/>`,
        `<path d="m24 4 5 14 15 1-12 9 4 15-12-9-12 9 4-15-12-9 15-1Z"/><circle cx="24" cy="24" r="4"/>`,
        `<circle cx="24" cy="8" r="5"/><circle cx="8" cy="36" r="5"/><circle cx="40" cy="36" r="5"/><circle cx="24" cy="26" r="5"/><path d="m24 13 0 8M20 29 12 34m16-5 8 5M12 35h24"/>`,
        `<path d="m27 4-16 23h12l-2 17 17-24H26Z"/><path d="M7 9h8M34 39h8"/>`,
        `<circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="4"/><path d="M24 3v9m0 24v9M3 24h9m24 0h9M9 9l7 7m16 16 7 7M39 9l-7 7M16 32l-7 7"/>`
      ];
      const CUSTODIAN_COLORS = [
        "#8de6cd", "#e2c074", "#90baff", "#f5aa85",
        "#ceb0ff", "#f3d58b", "#ef9ed3", "#a7dada",
        "#91dca9", "#ffbc89", "#e5b1fa", "#aad3ed",
        "#ffe195", "#95e1d5", "#ffadac", "#c0d990"
      ];

      function custodianGlyphMarkup(index) {
        const drawing = CUSTODIAN_ART[(index - 1) % CUSTODIAN_ART.length];
        return `<svg class="unique-custodian-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${drawing}</svg>`;
      }

      function custodianColorFor(index) {
        return CUSTODIAN_COLORS[(index - 1) % CUSTODIAN_COLORS.length];
      }

      const gameShell = document.getElementById("game-shell");
      const tilesElement = document.getElementById("tiles");
      const scoreElement = document.getElementById("score");
      const bestElement = document.getElementById("best");
      const stageHud = document.getElementById("stage-hud");
      const custodianHud = document.getElementById("custodian-hud");
      const custodianCountElement = document.getElementById("custodian-count");
      const undoButton = document.getElementById("undo-button");
      const newButton = document.getElementById("new-button");
      const board = document.getElementById("board");
      const discoveryGlyph = document.getElementById("discovery-glyph");
      const discoveryName = document.getElementById("discovery-name");
      const discoveryText = document.getElementById("discovery-text");
      const progressFill = document.getElementById("progress-fill");
      const nextStage = document.getElementById("next-stage");
      const milestonesElement = document.getElementById("milestones");
      const bestEvolution = document.getElementById("best-evolution");
      const startScreen = document.getElementById("start-screen");
      const startButton = document.getElementById("start-button");
      const resumeButton = document.getElementById("resume-button");
      const startActions = document.getElementById("start-actions");
      const copyLinkButton = document.getElementById("copy-link-button");
      const gameOverScreen = document.getElementById("game-over");
      const gameOverKicker = document.getElementById("game-over-kicker");
      const gameOverStage = document.getElementById("game-over-stage");
      const gameOverImage = document.getElementById("game-over-image");
      const evolutionScreen = document.getElementById("evolution-screen");
      const victoryScreen = document.getElementById("victory-screen");
      const victoryImage = document.getElementById("victory-image");
      const victoryKicker = document.getElementById("victory-kicker") || document.querySelector("#victory-screen .card-kicker");
      const victoryLead = document.getElementById("victory-lead") || document.querySelector("#victory-screen .result-lead");
      const victoryTitle = document.getElementById("victory-title") || document.querySelector("#victory-screen h2");
      const victoryFallback = document.getElementById("victory-fallback") || document.querySelector("#victory-screen .result-image-fallback");
      const levelUpOverlay = document.getElementById("level-up-overlay");
      const levelUpStage = document.getElementById("level-up-stage");
      const levelUpFrom = document.getElementById("level-up-from");
      const levelUpFromGlyph = document.getElementById("level-up-from-glyph");
      const levelUpFromName = document.getElementById("level-up-from-name");
      const levelUpTo = document.getElementById("level-up-to");
      const levelUpToGlyph = document.getElementById("level-up-to-glyph");
      const levelUpToName = document.getElementById("level-up-to-name");

      let grid = emptyGrid();
      let score = 0;
      let best = readNumber(BEST_KEY);
      let bestCustodianCount = Math.min(SIZE * SIZE, readNumber(BEST_CUSTODIANS_KEY));
      let history = null;
      let pendingReplay = null;
      let runMaxValue = 2;
      let maxEverValue = loadMaxStage();
      let uid = 0;
      let newIds = new Set();
      let mergedIds = new Set();
      let started = false;
      let animating = false;
      let activeBackgroundLayer = 0;
      let backgroundDeck = [];
      let lastBackgroundIndex = -1;
      let currentBackgroundUrl = "";
      let pendingDiscovery = null;
      let gameOverPending = false;
      let custodianCount = 0;
      let pendingCustodianAnnouncements = [];


      function canMergeValue(value) {
        return value !== TERMINAL_STAGE_VALUE;
      }

      function custodianNameFor(count) {
        return CUSTODIAN_NAMES[count - 1] || `${isES ? "Custodio" : "Custodian"} ${count}`;
      }


      function announceCustodianBirth() {
        custodianCount += 1;
        bestCustodianCount = Math.max(bestCustodianCount, custodianCount);
        try { localStorage.setItem(BEST_CUSTODIANS_KEY, String(bestCustodianCount)); }
        catch (_) {}
        const name = custodianNameFor(custodianCount);
        pendingCustodianAnnouncements.push({ count: custodianCount, name, icon: custodianGlyphMarkup(custodianCount) });
      }

      function updateSoundUI() {
        soundNote.textContent = soundEnabled
          ? (isES ? "Con sonido: comenzará con tu primer movimiento." : "Sound on: it will begin with your first move.")
          : (isES ? "Sonido desactivado. Puedes activarlo con ♪." : "Sound off. You can turn it on with ♪.");
        soundButton.classList.remove(soundEnabled ? "off" : "on");
        soundButton.classList.add(soundEnabled ? "on" : "off");
        soundButton.setAttribute("aria-pressed", String(soundEnabled));
        soundButton.setAttribute("aria-label", soundEnabled
          ? (isES ? "Desactivar sonido" : "Mute sound")
          : (isES ? "Activar sonido" : "Turn sound on"));
        soundButton.title = soundEnabled
          ? (isES ? "Desactivar sonido" : "Mute sound")
          : (isES ? "Activar sonido" : "Turn sound on");
      }

      function toggleSound() {
        soundEnabled = !soundEnabled;
        updateSoundUI();
        if (soundEnabled) {
          getAudioContext();
          tone(262, 0, .13, .06, "sine");
          tone(392, .07, .18, .045, "sine");
        } else if (audioContext?.state === "running") {
          audioContext.suspend().catch(() => {});
        }
      }

      function getAudioContext() {
        if (!soundEnabled) return null;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!audioContext) audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
        return audioContext;
      }

      function tone(frequency, delay = 0, duration = .1, volume = .045, type = "sine") {
        const context = getAudioContext();
        if (!context) return;
        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + .014);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + .025);
      }

      function playStartSound() {
        tone(196, 0, .11, .05, "sine");
        tone(294, .065, .16, .04, "sine");
      }

      function playMoveSound(mergeCount) {
        if (!mergeCount) {
          tone(118, 0, .065, .02, "triangle");
          return;
        }
        tone(220, 0, .1, .05, "sine");
        tone(330, .035, .15, .04, "sine");
        if (mergeCount > 1) tone(440, .075, .15, .03, "sine");
      }

      function playMilestoneSound(value) {
        const index = Math.max(0, stages.findIndex(stage => stage.value === value));
        const root = 220 * Math.pow(2, Math.min(index, 11) / 24);
        tone(root, 0, .32, .055, "sine");
        tone(root * 1.25, .12, .38, .05, "sine");
        tone(root * 1.5, .25, .44, .042, "sine");
      }

      updateSoundUI();

      function shuffle(values) {
        for (let index = values.length - 1; index > 0; index--) {
          const other = Math.floor(Math.random() * (index + 1));
          [values[index], values[other]] = [values[other], values[index]];
        }
        return values;
      }

      function refillBackgroundDeck() {
        backgroundDeck = shuffle(BG_IMAGES.map((_, index) => index));
        if (backgroundDeck.length > 1 && backgroundDeck[0] === lastBackgroundIndex) {
          [backgroundDeck[0], backgroundDeck[1]] = [backgroundDeck[1], backgroundDeck[0]];
        }
      }

      function changeBackground() {
        if (!BG_IMAGES.length) return;
        if (!backgroundDeck.length) refillBackgroundDeck();

        const imageIndex = backgroundDeck.shift();
        const imageUrl = BG_IMAGES[imageIndex];
        const nextLayerIndex = 1 - activeBackgroundLayer;
        const nextLayer = backgroundLayers[nextLayerIndex];
        const previousLayer = backgroundLayers[activeBackgroundLayer];

        lastBackgroundIndex = imageIndex;
        nextLayer.onload = () => {
          previousLayer.classList.remove("active");
          nextLayer.classList.add("active");
          activeBackgroundLayer = nextLayerIndex;
          currentBackgroundUrl = imageUrl;
        };
        nextLayer.onerror = () => {};
        nextLayer.src = imageUrl;
      }

      function setResultImage(image) {
        image.classList.remove("loaded");
        const imageUrl = currentBackgroundUrl || BG_IMAGES[lastBackgroundIndex] || BG_IMAGES[0];
        if (!imageUrl) {
          image.removeAttribute("src");
          return;
        }
        image.onload = () => image.classList.add("loaded");
        image.onerror = () => image.classList.remove("loaded");
        image.src = imageUrl;
      }

      function emptyGrid() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      }

      function readNumber(key) {
        try { return Number(localStorage.getItem(key)) || 0; }
        catch (_) { return 0; }
      }

      function createTile(value, row, col, custodianIndex = 0) {
        return { id: ++uid, value, row, col,
          custodianIndex: value === TERMINAL_STAGE_VALUE ? custodianIndex : 0 };
      }

      // Old saved games store only numeric tile values. New games also store the
      // Custodian IDs, so individual names and artwork survive a reload or Undo.
      // When restoring an older game, assign deterministic distinct IDs.
      function hydrateGrid(values, savedIds) {
        const used = new Set();
        let nextFree = 1;
        return values.map((row, r) => row.map((rawValue, c) => {
          const value = Number(rawValue);
          if (!value) return null;
          if (value !== TERMINAL_STAGE_VALUE) return createTile(value, r, c);
          const preferred = Number(savedIds?.[r]?.[c]);
          let index = Number.isInteger(preferred) && preferred >= 1 &&
            preferred <= SIZE * SIZE && !used.has(preferred) ? preferred : 0;
          if (!index) {
            while (used.has(nextFree)) nextFree++;
            index = nextFree;
          }
          used.add(index);
          return createTile(value, r, c, index);
        }));
      }

      function gridCustodianIds() {
        return grid.map(row => row.map(tile => tile?.custodianIndex || 0));
      }

      function normalizedRecordedStage(value, hasCustodianRecord = false) {
        const numericValue = Number(value) || 2;
        let validValue = 2;
        stages.forEach(stage => {
          if (stage.value <= numericValue) validValue = stage.value;
        });
        // In the previous version, 4096 represented EIDOS, not a Custodian.
        if (validValue === TERMINAL_STAGE_VALUE && !hasCustodianRecord) return 2048;
        return validValue;
      }

      function loadMaxStage() {
        let legacyDiscoveryMaximum = 2;
        try {
          const legacy = JSON.parse(localStorage.getItem(LEGACY_DISCOVERY_KEY));
          if (Array.isArray(legacy) && legacy.length) legacyDiscoveryMaximum = Math.max(...legacy);
        } catch (_) {}

        const currentMaximum = readNumber(MAX_STAGE_KEY);
        const legacyMaximum = Math.max(readNumber(LEGACY_MAX_STAGE_KEY), legacyDiscoveryMaximum);
        const hasCustodianRecord = readNumber(BEST_CUSTODIANS_KEY) > 0;
        const migratedLegacyMaximum = normalizedRecordedStage(legacyMaximum, hasCustodianRecord);
        const custodianRecordMaximum = hasCustodianRecord ? TERMINAL_STAGE_VALUE : 2;
        const maximum = Math.max(2, currentMaximum, migratedLegacyMaximum, custodianRecordMaximum);

        try { localStorage.setItem(MAX_STAGE_KEY, String(maximum)); }
        catch (_) {}
        return maximum;
      }

      function loadGame() {
        try {
          const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
          const validValues = new Set([0, ...stages.map(stage => stage.value)]);
          const validGrid = saved && Array.isArray(saved.grid) && saved.grid.length === SIZE &&
            saved.grid.every(row => Array.isArray(row) && row.length === SIZE &&
              row.every(value => validValues.has(Number(value))));
          if (!validGrid) return false;

          grid = hydrateGrid(saved.grid, saved.custodianIds);
          if (!grid.flat().some(Boolean)) return false;

          score = Math.max(0, Number(saved.score) || 0);
          best = Math.max(best, score);
          custodianCount = grid.flat().filter(tile => tile?.value === TERMINAL_STAGE_VALUE).length;
          bestCustodianCount = Math.min(SIZE * SIZE, Math.max(bestCustodianCount, custodianCount));
          const gridMaximum = Math.max(2, ...grid.flat().filter(Boolean).map(tile => tile.value));
          runMaxValue = Math.max(gridMaximum, normalizedRecordedStage(saved.runMaxValue, custodianCount > 0));
          maxEverValue = Math.max(maxEverValue, runMaxValue);
          gameOverPending = !movesAvailable();

          try {
            localStorage.setItem(BEST_KEY, String(best));
            localStorage.setItem(MAX_STAGE_KEY, String(maxEverValue));
            localStorage.setItem(BEST_CUSTODIANS_KEY, String(bestCustodianCount));
          } catch (_) {}
          return true;
        } catch (_) {
          return false;
        }
      }

      function saveGame() {
        try {
          const values = grid.map(row => row.map(tile => tile ? tile.value : 0));
          localStorage.setItem(SAVE_KEY, JSON.stringify({ grid: values,
            custodianIds: gridCustodianIds(), score, runMaxValue, custodianCount }));
          localStorage.setItem(BEST_KEY, String(best));
          localStorage.setItem(MAX_STAGE_KEY, String(maxEverValue));
          localStorage.setItem(BEST_CUSTODIANS_KEY, String(bestCustodianCount));
        } catch (_) {}
      }

      function clearSavedGame() {
        try { localStorage.removeItem(SAVE_KEY); }
        catch (_) {}
      }

      function addRandomTile(forcedSpawn = null) {
        const spaces = [];
        grid.forEach((row, r) => row.forEach((tile, c) => { if (!tile) spaces.push([r, c]); }));
        if (!spaces.length) return null;
        const forcedIsAvailable = forcedSpawn && spaces.some(([r, c]) => r === forcedSpawn.row && c === forcedSpawn.col);
        const [row, col] = forcedIsAvailable
          ? [forcedSpawn.row, forcedSpawn.col]
          : spaces[Math.floor(Math.random() * spaces.length)];
        const value = forcedIsAvailable ? forcedSpawn.value : randomSpawnValue();
        const tile = createTile(value, row, col);
        grid[row][col] = tile;
        newIds.add(tile.id);
        return { row, col, value };
      }

      function retiredStageValues() {
        return RETIRED_STAGE_RULES
          .filter(rule => runMaxValue >= rule.reachedValue)
          .map(rule => rule.retiredValue);
      }

      function countTilesByValue(value) {
        let count = 0;
        grid.forEach(row => row.forEach(tile => {
          if (tile?.value === value) count += 1;
        }));
        return count;
      }

      function compensationSpawnValue() {
        for (const value of retiredStageValues()) {
          if (countTilesByValue(value) % 2 === 1) return value;
        }
        return null;
      }

      function randomSpawnValue() {
        const compensationValue = compensationSpawnValue();
        if (compensationValue !== null) return compensationValue;

        const currentStage = stageByValue.get(runMaxValue) || stages[0];
        const currentIndex = Math.max(0, stages.indexOf(currentStage));
        const maximumSpawnIndex = Math.max(0, currentIndex - 3);
        const retiredValues = new Set(retiredStageValues());
        const candidates = stages
          .slice(0, maximumSpawnIndex + 1)
          .filter(stage => !retiredValues.has(stage.value));
        const availableCandidates = candidates.length ? candidates : [stages[0]];
        const weights = SPAWN_DISTRIBUTIONS[availableCandidates.length] || SPAWN_DISTRIBUTIONS[6];
        let roll = Math.random() * 100;

        for (let index = 0; index < availableCandidates.length; index++) {
          roll -= weights[index];
          if (roll < 0) return availableCandidates[index].value;
        }

        return availableCandidates[availableCandidates.length - 1].value;
      }

      function startNewGame() {
        recordsUI?.startSession();
        animating = false;
        pendingDiscovery = null;
        gameOverPending = false;
        pendingCustodianAnnouncements = [];
        grid = emptyGrid();
        score = 0;
        custodianCount = 0;
        runMaxValue = 2;
        history = null;
        pendingReplay = null;
        newIds.clear();
        mergedIds.clear();
        addRandomTile();
        addRandomTile();
        changeBackground();
        closeScreen(gameOverScreen);
        closeScreen(evolutionScreen);
        closeScreen(victoryScreen);
        levelUpOverlay.classList.remove("open");
        newButton.disabled = false;
        render();
        saveGame();
      }

      function cloneState() {
        return {
          values: grid.map(row => row.map(tile => tile ? tile.value : 0)),
          custodianIds: gridCustodianIds(),
          score,
          runMaxValue,
          custodianCount,
          replay: null
        };
      }

      function restoreState(state) {
        animating = false;
        pendingDiscovery = null;
        pendingCustodianAnnouncements = [];
        gameOverPending = false;
        grid = hydrateGrid(state.values, state.custodianIds);
        score = state.score;
        custodianCount = state.values.flat().filter(value => Number(value) === TERMINAL_STAGE_VALUE).length;
        newIds.clear();
        mergedIds.clear();
        runMaxValue = Number(state.runMaxValue) || Math.max(2, ...state.values.flat());
        pendingReplay = state.replay || null;
        history = null;
        closeScreen(gameOverScreen);
        render();
        saveGame();
      }

      function move(direction) {
        if (
          !started || animating ||
          isScreenOpen(gameOverScreen) ||
          isScreenOpen(evolutionScreen) ||
          isScreenOpen(victoryScreen)
        ) return;

        const vectors = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] };
        const vector = vectors[direction];
        if (!vector) return;

        const previous = cloneState();
        pendingDiscovery = null;
        const startPositions = new Map(
          grid.flat().filter(Boolean).map(tile => [tile.id, { row: tile.row, col: tile.col }])
        );
        const movementPaths = new Map();

        function recordMovement(tileId, row, col, merging = false) {
          const from = startPositions.get(tileId);
          if (!from) return;
          const previousPath = movementPaths.get(tileId);
          movementPaths.set(tileId, {
            from,
            to: { row, col },
            merging: merging || Boolean(previousPath?.merging)
          });
        }
        const [dr, dc] = vector;
        const rows = [...Array(SIZE).keys()];
        const cols = [...Array(SIZE).keys()];
        if (dr === 1) rows.reverse();
        if (dc === 1) cols.reverse();

        let moved = false;
        let mergeCount = 0;
        const mergedPositions = new Set();
        newIds.clear();
        mergedIds.clear();

        for (const r of rows) {
          for (const c of cols) {
            const tile = grid[r][c];
            if (!tile) continue;

            let nr = r;
            let nc = c;
            while (inside(nr + dr, nc + dc) && !grid[nr + dr][nc + dc]) {
              nr += dr;
              nc += dc;
            }

            const targetRow = nr + dr;
            const targetCol = nc + dc;
            const targetKey = `${targetRow},${targetCol}`;

            if (
              inside(targetRow, targetCol) &&
              grid[targetRow][targetCol] &&
              grid[targetRow][targetCol].value === tile.value &&
              canMergeValue(tile.value) &&
              !mergedPositions.has(targetKey)
            ) {
              const targetTile = grid[targetRow][targetCol];
              recordMovement(tile.id, targetRow, targetCol, true);
              recordMovement(targetTile.id, targetRow, targetCol, true);
              grid[r][c] = null;
              if (nr !== r || nc !== c) grid[nr][nc] = null;
              const value = tile.value * 2;
              const merged = createTile(value, targetRow, targetCol,
                value === TERMINAL_STAGE_VALUE ? custodianCount + 1 : 0);
              grid[targetRow][targetCol] = merged;
              mergedPositions.add(targetKey);
              mergedIds.add(merged.id);
              score += value;
              mergeCount += 1;
              moved = true;
              discover(value);
              if (value === TERMINAL_STAGE_VALUE) announceCustodianBirth();
            } else if (nr !== r || nc !== c) {
              recordMovement(tile.id, nr, nc);
              grid[r][c] = null;
              tile.row = nr;
              tile.col = nc;
              grid[nr][nc] = tile;
              moved = true;
            }
          }
        }

        if (!moved) {
          if (!movesAvailable()) showGameOver();
          return;
        }

        const replaySpawn = pendingReplay?.direction === direction ? pendingReplay.spawn : null;
        pendingReplay = null;
        history = previous;
        best = Math.max(best, score);
        playMoveSound(mergeCount);
        animateMovement(movementPaths, () => {
          const spawn = addRandomTile(replaySpawn);
          history.replay = { direction, spawn };
          render();
          saveGame();
          gameOverPending = !movesAvailable();

          const discovery = pendingDiscovery;
          pendingDiscovery = null;

          const unlockBoard = () => {
            animating = false;
            newButton.disabled = false;
          };

          const openAfterTransition = callback => {
            animating = true;
            newButton.disabled = true;
            window.setTimeout(() => {
              callback();
              unlockBoard();
            }, 170);
          };

          const finishMove = () => {
            if (discovery?.to.value === 2048) {
              openAfterTransition(() => openScreen(evolutionScreen));
              return;
            }

            if (pendingCustodianAnnouncements.length) {
              openAfterTransition(showVictory);
              return;
            }

            if (gameOverPending) {
              scheduleLockedScreen(showGameOver, 190);
              return;
            }
            unlockBoard();
          };

          if (discovery) playLevelUp(discovery, finishMove);
          else finishMove();
        });
      }

      function animateMovement(paths, onComplete) {
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const duration = reducedMotion ? 0 : 180;

        if (!duration || !paths.size || typeof Element === "undefined" || !Element.prototype.animate) {
          onComplete();
          return;
        }

        const style = window.getComputedStyle(board);
        const gap = parseFloat(style.columnGap || style.gap) || 0;
        const area = tilesElement.getBoundingClientRect();
        const slot = (area.width - gap * (SIZE - 1)) / SIZE;
        const step = slot + gap;
        const animations = [];

        animating = true;
        undoButton.disabled = true;
        newButton.disabled = true;

        paths.forEach((path, tileId) => {
          const element = tilesElement.querySelector(`[data-tile-id="${tileId}"]`);
          if (!element) return;

          const dx = (path.to.col - path.from.col) * step;
          const dy = (path.to.row - path.from.row) * step;
          const destination = `translate(${dx}px, ${dy}px)`;
          const frames = path.merging
            ? [
                { transform: "translate(0, 0) scale(1)", opacity: 1 },
                { transform: `${destination} scale(1)`, opacity: 1, offset: .76 },
                { transform: `${destination} scale(.68)`, opacity: 0 }
              ]
            : [
                { transform: "translate(0, 0)", opacity: 1 },
                { transform: destination, opacity: 1 }
              ];

          const animation = element.animate(frames, {
            duration,
            easing: "cubic-bezier(.2,.78,.2,1)",
            fill: "forwards"
          });
          animations.push(animation.finished.catch(() => {}));
        });

        if (!animations.length) {
          onComplete();
          return;
        }

        Promise.all(animations).then(onComplete);
      }

      function animateNode(element, frames, options) {
        if (typeof Element !== "undefined" && Element.prototype.animate) {
          return element.animate(frames, options).finished.catch(() => {});
        }
        return new Promise(resolve => window.setTimeout(resolve, options.duration || 0));
      }

      function waitForPaint(frames = 1) {
        return new Promise(resolve => {
          const nextFrame = () => {
            frames -= 1;
            if (frames <= 0) resolve();
            else window.requestAnimationFrame(nextFrame);
          };
          window.requestAnimationFrame(nextFrame);
        });
      }

      function compactMode() {
        const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
        const touchOnly = navigator.maxTouchPoints > 0 &&
          window.matchMedia?.("(hover: none)").matches;
        return coarsePointer || touchOnly || gameShell.getBoundingClientRect().height < 590;
      }

      async function playLevelUp(discovery, onComplete) {
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        animating = true;
        undoButton.disabled = true;
        newButton.disabled = true;
        playMilestoneSound(discovery.to.value);

        if (reducedMotion) {
          changeBackground();
          pulseCurrentHito();
          pulseMilestone(discovery.to.value);
          onComplete();
          return;
        }

        resetLevelUpAnimation();
        levelUpOverlay.classList.add("open");
        levelUpOverlay.setAttribute("aria-hidden", "false");
        setLevelUpState(levelUpFrom, levelUpFromGlyph, levelUpFromName, discovery.from);
        setLevelUpState(levelUpTo, levelUpToGlyph, levelUpToName, discovery.to);

        const centeredRect = levelUpStage.getBoundingClientRect();
        const originMilestone = milestonesElement.querySelector(`[data-stage-value="${discovery.from.value}"]`);
        const destinationMilestone = milestonesElement.querySelector(`[data-stage-value="${discovery.to.value}"]`);
        prepareMilestoneArrival(destinationMilestone);
        originMilestone?.classList.add("transition-origin");
        const origin = transitionOffset(originMilestone || discoveryName, centeredRect);

        if (compactMode()) {
          await playCompactLevelUp(discovery, origin, originMilestone, destinationMilestone);
          concealLevelUpLayers();
          levelUpOverlay.classList.remove("open");
          levelUpOverlay.setAttribute("aria-hidden", "true");
          await waitForPaint(2);
          resetLevelUpAnimation();
          revealMilestone(destinationMilestone, discovery.to);
          pulseCurrentHito();
          onComplete();
          return;
        }

        await Promise.all([
          animateNode(levelUpStage, [
            { opacity: .12, transform: `translate(${origin.x}px, ${origin.y}px) scale(.14)` },
            { opacity: .3, transform: `translate(${origin.x}px, ${origin.y}px) scale(.2)`, offset: .14 },
            { opacity: 1, transform: "translate(0, 0) scale(1)", offset: .78 },
            { opacity: 1, transform: "translate(0, 0) scale(1)" }
          ], { duration: 1100, easing: "cubic-bezier(.2,.75,.2,1)", fill: "forwards" }),
          animateNode(levelUpFrom, [
            { opacity: 1 },
            { opacity: 1 }
          ], { duration: 1100, easing: "linear", fill: "forwards" })
        ]);

        await animateNode(levelUpFrom, [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.035)" }
        ], { duration: 260, easing: "ease-in", fill: "forwards" });

        levelUpFrom.style.opacity = "0";
        levelUpTo.style.opacity = "0";
        changeBackground();
        await waitForPaint(2);

        await animateNode(levelUpTo, [
          { opacity: 0, transform: "scale(.94)" },
          { opacity: 1, transform: "scale(1)" }
        ], { duration: 310, easing: "ease-out", fill: "forwards" });

        originMilestone?.classList.remove("transition-origin");
        const destination = transitionOffset(destinationMilestone || discoveryName, levelUpStage.getBoundingClientRect());

        await Promise.all([
          animateNode(levelUpStage, [
            { opacity: 1, transform: "translate(0, 0) scale(1)" },
            { opacity: 0, transform: `translate(${destination.x}px, ${destination.y}px) scale(.18)` }
          ], { duration: 950, easing: "cubic-bezier(.2,.75,.2,1)", fill: "forwards" }),
          animateNode(levelUpTo, [
            { opacity: 1 },
            { opacity: 1, offset: .82 },
            { opacity: 0 }
          ], { duration: 950, easing: "ease-in", fill: "forwards" })
        ]);

        revealMilestone(destinationMilestone, discovery.to);
        concealLevelUpLayers();
        levelUpOverlay.classList.remove("open");
        levelUpOverlay.setAttribute("aria-hidden", "true");
        await waitForPaint(2);
        resetLevelUpAnimation();
        pulseCurrentHito();
        pulseMilestone(discovery.to.value);
        onComplete();
      }

      async function playCompactLevelUp(discovery, origin, originMilestone, destinationMilestone) {
        levelUpTo.style.opacity = "0";
        levelUpTo.style.transform = "scale(.96)";

        await Promise.all([
          animateNode(levelUpStage, [
            { opacity: .16, transform: `translate(${origin.x}px, ${origin.y}px) scale(.16)` },
            { opacity: 1, transform: "translate(0, 0) scale(1)" }
          ], { duration: 760, easing: "cubic-bezier(.2,.75,.2,1)", fill: "forwards" }),
          animateNode(levelUpFrom, [
            { opacity: 1 },
            { opacity: 1 }
          ], { duration: 760, easing: "linear", fill: "forwards" })
        ]);

        await animateNode(levelUpFrom, [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(.96)" }
        ], { duration: 190, easing: "ease-in", fill: "forwards" });

        levelUpFrom.style.opacity = "0";
        changeBackground();
        await waitForPaint(2);

        await animateNode(levelUpTo, [
          { opacity: 0, transform: "scale(.96)" },
          { opacity: 1, transform: "scale(1)" }
        ], { duration: 240, easing: "ease-out", fill: "forwards" });

        originMilestone?.classList.remove("transition-origin");
        const destination = transitionOffset(destinationMilestone || discoveryName, levelUpStage.getBoundingClientRect());

        await Promise.all([
          animateNode(levelUpStage, [
            { opacity: 1, transform: "translate(0, 0) scale(1)" },
            { opacity: 0, transform: `translate(${destination.x}px, ${destination.y}px) scale(.18)` }
          ], { duration: 720, easing: "cubic-bezier(.2,.75,.2,1)", fill: "forwards" }),
          animateNode(levelUpTo, [
            { opacity: 1 },
            { opacity: 1, offset: .78 },
            { opacity: 0 }
          ], { duration: 720, easing: "ease-in", fill: "forwards" })
        ]);
      }

      function transitionOffset(target, sourceRect) {
        if (!target) return { x: 0, y: 0 };
        const targetRect = target.getBoundingClientRect();
        return {
          x: targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2),
          y: targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2)
        };
      }

      function concealLevelUpLayers() {
        [levelUpStage, levelUpFrom, levelUpTo].forEach(element => {
          element.getAnimations?.().forEach(animation => animation.cancel());
          element.style.opacity = "0";
        });
      }

      function resetLevelUpAnimation() {
        [levelUpStage, levelUpFrom, levelUpTo].forEach(element => {
          element.getAnimations?.().forEach(animation => animation.cancel());
          element.style.opacity = "";
          element.style.transform = "";
        });
      }

      function setLevelUpState(element, glyph, name, stage) {
        element.style.setProperty("--level-color", stage.color);
        setStageGlyph(glyph, stage);
        name.textContent = stage.name;
      }

      function prepareMilestoneArrival(milestone) {
        if (!milestone) return;
        milestone.classList.remove("found", "just-found");
        milestone.classList.add("receiving");
        milestone.textContent = "·";
        milestone.title = isES ? "Hito en evolución" : "Milestone evolving";
      }

      function revealMilestone(milestone, stage) {
        if (!milestone) return;
        milestone.classList.remove("receiving");
        milestone.classList.add("found");
        milestone.innerHTML = stageGlyphMarkup(stage);
        milestone.title = stage.name;
      }

      function stageGlyphMarkup(stage) {
        if (stage.value === 8) return DNA_ICON;
        if (stage.value === 512) return EYE_ICON;
        if (stage.value === 4096) return CUSTODIAN_ICON;
        return stage.glyph;
      }

      function setStageGlyph(element, stage) {
        if (stage.value === 8) element.innerHTML = DNA_ICON;
        else if (stage.value === 512) element.innerHTML = EYE_ICON;
        else if (stage.value === 4096) element.innerHTML = CUSTODIAN_ICON;
        else element.textContent = stage.glyph;
      }

      function pulseMilestone(value) {
        const milestone = milestonesElement.querySelector(`[data-stage-value="${value}"]`);
        if (!milestone) return;
        milestone.classList.remove("just-found");
        void milestone.offsetWidth;
        milestone.classList.add("just-found");
      }

      function pulseCurrentHito() {
        const card = document.getElementById("current-hito-card");
        card.classList.remove("just-updated");
        void card.offsetWidth;
        card.classList.add("just-updated");
      }

      function scheduleLockedScreen(callback, delay = 120) {
        animating = true;
        undoButton.disabled = true;
        newButton.disabled = true;
        window.setTimeout(() => {
          callback();
          animating = false;
          undoButton.disabled = !history;
          newButton.disabled = false;
        }, delay);
      }

      function showGameOver(reason = "collapse") {
        const voluntary = reason === "voluntary";
        animating = false;
        gameOverKicker.textContent = voluntary
          ? (isES ? "TU EVOLUCIÓN SE DETIENE AQUÍ" : "YOUR EVOLUTION STOPS HERE")
          : (isES ? "TU PLANETA HA COLAPSADO" : "YOUR PLANET HAS COLLAPSED");
        gameOverStage.textContent = custodianCount > 0
          ? custodianNameFor(custodianCount)
          : (stageByValue.get(runMaxValue)?.name || highestStage().name);
        if (voluntary) {
          document.getElementById("game-over-copy").textContent = custodianCount
            ? (isES
                ? `Has cerrado esta partida. Habías reunido ${custodianCount} custodio${custodianCount === 1 ? "" : "s"} inteligente${custodianCount === 1 ? "" : "s"}.`
                : `You closed this run. You had gathered ${custodianCount} intelligent custodian${custodianCount === 1 ? "" : "s"}.`)
            : (isES
                ? "Has cerrado esta partida. Puedes comenzar otra o descubrir la idea que hay detrás de esta evolución."
                : "You closed this run. You can start another one or discover the idea behind this evolution.");
        } else {
          document.getElementById("game-over-copy").textContent = custodianCount
            ? (isES
                ? `El tablero se ha llenado y ya no quedan combinaciones posibles. Has despertado a ${custodianCount} custodio${custodianCount === 1 ? "" : "s"} inteligente${custodianCount === 1 ? "" : "s"}. Último: ${custodianNameFor(custodianCount)}.`
                : `The board is full and no more combinations remain. You awakened ${custodianCount} intelligent custodian${custodianCount === 1 ? "" : "s"}. Latest: ${custodianNameFor(custodianCount)}.`)
            : (isES
                ? "El tablero se ha llenado y ya no quedan combinaciones posibles."
                : "The board is full and no more combinations remain.");
        }
        setResultImage(gameOverImage);
        gameOverPending = false;
        clearSavedGame();
        openScreen(gameOverScreen);
        // Offer registration only when this finished run qualifies for the TOP 20.
        // The game engine passes the numeric score, never text read from the page.
        // Record the latest Custodian reached, not just the last board tile value 4096.
        // This is a leaderboard-only value: the board itself keeps the original 12 stages.
        const recordStage = custodianCount > 0
          ? TERMINAL_STAGE_VALUE + Math.min(custodianCount, CUSTODIAN_NAMES.length)
          : runMaxValue;
        if (score > 0) recordsUI?.promptScore(score, {stage: recordStage});
      }

      function showVictory() {
        const current = pendingCustodianAnnouncements.shift();
        if (!current) return;
        setResultImage(victoryImage);
        if (victoryFallback) victoryFallback.innerHTML = current.icon;
        victoryKicker.textContent = isES ? "YA TIENES A" : "YOU NOW HAVE";
        victoryLead.textContent = isES
          ? `Custodio inteligente ${current.count} de esta partida`
          : `Intelligent custodian ${current.count} in this run`;
        victoryTitle.textContent = current.name;
        document.getElementById("victory-copy").textContent = current.name === "Eramus"
          ? (isES
              ? "Eramus aparece asociado a una nave en tu constelación de custodios. Continúa y reúne tantos custodios inteligentes como puedas."
              : "Eramus appears linked to a spacecraft in your constellation of custodians. Keep going and awaken as many intelligent custodians as you can.")
          : (isES
              ? "La vida no orgánica ya camina junto a EIDOS. Continúa y reúne tantos custodios inteligentes como puedas."
              : "Non-organic life now walks beside EIDOS. Keep going and awaken as many intelligent custodians as you can.");
        openScreen(victoryScreen);
      }

      function continueAfterOrganic() {
        closeScreen(evolutionScreen);
        if (pendingCustodianAnnouncements.length) {
          scheduleLockedScreen(showVictory);
          return;
        }
        if (gameOverPending) {
          scheduleLockedScreen(showGameOver);
        }
      }

      function continueAfterCustodian() {
        closeScreen(victoryScreen);
        if (pendingCustodianAnnouncements.length) {
          scheduleLockedScreen(showVictory);
          return;
        }
        if (gameOverPending) {
          scheduleLockedScreen(showGameOver);
        }
      }

      function inside(row, col) {
        return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
      }

      function movesAvailable() {
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            const current = grid[r][c];
            if (!current) return true;
            if (r + 1 < SIZE && grid[r + 1][c] && grid[r + 1][c].value === current.value && canMergeValue(current.value)) return true;
            if (c + 1 < SIZE && grid[r][c + 1] && grid[r][c + 1].value === current.value && canMergeValue(current.value)) return true;
          }
        }
        return false;
      }

      function discover(value) {
        const stage = stageByValue.get(value);
        if (!stage || value <= runMaxValue) return;
        const previousStage = stageByValue.get(runMaxValue) || highestStage();
        if (!pendingDiscovery) pendingDiscovery = { from: previousStage, to: stage };
        else pendingDiscovery.to = stage;
        runMaxValue = value;
        maxEverValue = Math.max(maxEverValue, value);
      }

      function openScreen(element) {
        element.classList.add("open");
        element.setAttribute("aria-hidden", "false");
        window.setTimeout(() => fitScreenCard(element), 0);
      }

      function closeScreen(element) {
        element.classList.remove("open");
        element.setAttribute("aria-hidden", "true");
      }

      function fitScreenCard(screen) {
        const card = screen.querySelector?.(".card");
        if (!card) return;

        screen.classList.remove("mobile-fit");
        card.style.setProperty("--card-fit-scale", "1");
        if (!compactMode()) return;

        screen.classList.add("mobile-fit");
        const screenRect = screen.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const scale = Math.max(.72, Math.min(
          1,
          (screenRect.width - 18) / cardRect.width,
          (screenRect.height - 34) / cardRect.height
        ));
        card.style.setProperty("--card-fit-scale", scale.toFixed(3));
      }

      function isScreenOpen(element) {
        return element.classList.contains("open");
      }

      function highestStage() {
        const highestValue = Math.max(2, ...grid.flat().filter(Boolean).map(tile => tile.value));
        return stageByValue.get(highestValue) || stages[stages.length - 1];
      }

      function render() {
        tilesElement.innerHTML = "";
        const fragment = document.createDocumentFragment();

        grid.flat().filter(Boolean).forEach(tile => {
          const stage = stageByValue.get(tile.value) || stages[stages.length - 1];
          const element = document.createElement("div");
          element.className = "tile";
          element.dataset.tileId = String(tile.id);
          if (newIds.has(tile.id)) element.classList.add("new");
          if (mergedIds.has(tile.id)) element.classList.add("merged");
          element.style.setProperty("--x", tile.col);
          element.style.setProperty("--y", tile.row);
          if (tile.value === TERMINAL_STAGE_VALUE) {
            const index = tile.custodianIndex || 1;
            const name = custodianNameFor(index);
            element.classList.add("custodian-tile");
            element.style.setProperty("--tile", custodianColorFor(index));
            element.title = isES
              ? `${name} · Custodio ${index}. No se fusiona con otras piezas.`
              : `${name} · Custodian ${index}. Cannot merge with other tiles.`;
            element.setAttribute("aria-label", element.title);
            element.innerHTML = `<span class="custodian-number">${String(index).padStart(2, "0")}</span>` +
              `<span class="glyph">${custodianGlyphMarkup(index)}</span>` +
              `<span class="tile-name">${name}</span>` +
              `<span class="tile-value">${isES ? "NO FUSIONA" : "NO MERGE"}</span>`;
          } else {
            element.style.setProperty("--tile", stage.color);
            element.innerHTML = `<span class="glyph">${stageGlyphMarkup(stage)}</span>` +
              `<span class="tile-name">${stage.name}</span><span class="tile-value">${tile.value}</span>`;
          }
          fragment.appendChild(element);
        });

        tilesElement.appendChild(fragment);
        scoreElement.textContent = score.toLocaleString(isES ? "es-ES" : "en-GB");
        bestElement.textContent = best.toLocaleString(isES ? "es-ES" : "en-GB");
        undoButton.disabled = !history;

        const currentStage = stageByValue.get(runMaxValue) || highestStage();
        const currentIndex = Math.min(stages.indexOf(currentStage), stages.length - 1);
        stageHud.textContent = `${isES ? "Hito" : "Stage"} ${currentIndex + 1}/${stages.length}`;
        custodianHud.hidden = custodianCount <= 0;
        custodianCountElement.textContent = `${custodianCount}/${SIZE * SIZE}`;

        const followingStage = stages[currentIndex + 1];
        setStageGlyph(discoveryGlyph, currentStage);
        discoveryGlyph.style.color = currentStage.color;
        discoveryName.textContent = currentStage.name;
        discoveryText.textContent = custodianCount > 0
          ? (isES
              ? "Cada Custodio tiene su identidad y ocupa una casilla que no puede fusionarse."
              : "Every Custodian has its own identity and occupies a tile that cannot merge.")
          : currentStage.text;
        progressFill.style.width = `${(currentIndex / (stages.length - 1)) * 100}%`;
        nextStage.textContent = followingStage
          ? `${isES ? "Próximo hito" : "Next milestone"}: ${followingStage.name}`
          : (isES
              ? `Fase Custodios: ${custodianCount}/${SIZE * SIZE} · Las piezas no se fusionan`
              : `Custodian phase: ${custodianCount}/${SIZE * SIZE} · Tiles cannot merge`);

        const maximumStage = stageByValue.get(maxEverValue) || stages[stages.length - 1];
        if (bestCustodianCount > 0) {
          const recordName = custodianNameFor(bestCustodianCount);
          bestEvolution.textContent = `${isES ? "Récord" : "Record"}: ${bestCustodianCount} · ${recordName}`;
          bestEvolution.title = isES
            ? `Récord del navegador: ${bestCustodianCount} custodio${bestCustodianCount === 1 ? "" : "s"} inteligente${bestCustodianCount === 1 ? "" : "s"}. Último: ${recordName}.`
            : `Browser record: ${bestCustodianCount} intelligent custodian${bestCustodianCount === 1 ? "" : "s"}. Latest: ${recordName}.`;
        } else {
          bestEvolution.textContent = `${isES ? "Máxima evolución" : "Best evolution"}: ${maximumStage.name}`;
          bestEvolution.title = isES ? `Máxima evolución alcanzada en este navegador: ${maximumStage.name}.` : `Best evolution reached in this browser: ${maximumStage.name}.`;
        }

        milestonesElement.innerHTML = "";
        stages.forEach(stage => {
          const milestone = document.createElement("div");
          const found = stage.value <= runMaxValue;
          milestone.className = `milestone${found ? " found" : ""}`;
          milestone.dataset.stageValue = String(stage.value);
          milestone.style.setProperty("--milestone-color", stage.color);
          milestone.innerHTML = found ? stageGlyphMarkup(stage) : "·";
          milestone.title = found ? stage.name : (isES ? "Hito por descubrir" : "Undiscovered milestone");
          milestonesElement.appendChild(milestone);
        });
      }

      function handleKey(event) {
        // Do not intercept keys while the player enters their arcade name.
        if (recordsUI?.isOpen()) return;
        if (event.key === "Escape") {
          window.parent.postMessage("cerrar-eidos", "*");
          return;
        }

        const activationKey = event.key === "Enter" || event.key === " ";
        const focusedControl = event.target instanceof Element && event.target.closest("button, a");
        if (activationKey && focusedControl) return;

        if (!started && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          if (resumeButton.hidden) startFreshGame();
          else begin();
          return;
        }

        if (isScreenOpen(evolutionScreen) && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          continueAfterOrganic();
          return;
        }

        if (isScreenOpen(victoryScreen) && activationKey) {
          event.preventDefault();
          continueAfterCustodian();
          return;
        }

        if (isScreenOpen(gameOverScreen) && activationKey) {
          event.preventDefault();
          startNewGame();
          return;
        }

        const directions = {
          ArrowLeft: "left", a: "left", A: "left",
          ArrowRight: "right", d: "right", D: "right",
          ArrowUp: "up", w: "up", W: "up",
          ArrowDown: "down", s: "down", S: "down"
        };

        if (!directions[event.key]) return;
        event.preventDefault();
        move(directions[event.key]);
      }

      function updateStartActions(hasSave) {
        resumeButton.hidden = !hasSave;
        startButton.classList.toggle("full-start-action", !hasSave);
        startButton.textContent = hasSave
          ? (isES ? "REINICIAR" : "RESTART")
          : (isES ? "INICIAR" : "START");
      }

      async function copyGameLink() {
        const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(canonical);
            const original = copyLinkButton.textContent;
            copyLinkButton.textContent = isES ? "ENLACE COPIADO" : "LINK COPIED";
            window.setTimeout(() => { copyLinkButton.textContent = original; }, 1500);
            return;
          }
        } catch (error) {}
        window.prompt(isES ? "Copia este enlace:" : "Copy this link:", canonical);
      }

      function begin() {
        recordsUI?.startSession();
        started = true;
        closeScreen(startScreen);
        playStartSound();
        board.focus?.();
        if (gameOverPending || !movesAvailable()) {
          gameOverPending = true;
          scheduleLockedScreen(showGameOver);
        }
      }

      function startFreshGame() {
        if (!resumeButton.hidden) {
          const ok = window.confirm(
            isES
              ? "¿Reiniciar esta evolución? La partida guardada actual será sustituida."
              : "Restart this evolution? The current saved game will be replaced."
          );
          if (!ok) return;
        }
        updateStartActions(false);
        startNewGame();
        begin();
      }

      let pointerStart = null;

      board.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointerStart = { x: event.clientX, y: event.clientY };
        board.setPointerCapture?.(event.pointerId);
      });

      board.addEventListener("pointerup", event => {
        if (!pointerStart) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      });

      board.addEventListener("pointercancel", () => { pointerStart = null; });
      document.addEventListener("keydown", handleKey);
      window.addEventListener?.("resize", () => {
        [startScreen, gameOverScreen, evolutionScreen, victoryScreen]
          .filter(isScreenOpen)
          .forEach(fitScreenCard);
      });

      soundButton.addEventListener("click", toggleSound);
      startButton.addEventListener("click", startFreshGame);
      resumeButton.addEventListener("click", begin);
      copyLinkButton.addEventListener("click", copyGameLink);
      undoButton.addEventListener("click", () => { if (history) restoreState(history); });
      newButton.addEventListener("click", () => showGameOver("voluntary"));
      document.getElementById("retry-button").addEventListener("click", startNewGame);
      document.getElementById("continue-button").addEventListener("click", continueAfterOrganic);
      document.getElementById("victory-restart-button").addEventListener("click", continueAfterCustodian);

      if (loadGame()) {
        updateStartActions(true);
        render();
        changeBackground();
      } else {
        updateStartActions(false);
        startNewGame();
      }
      window.setTimeout(() => fitScreenCard(startScreen), 0);
    })();
