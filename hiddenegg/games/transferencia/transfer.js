(() => {
      "use strict";

      const LANG=(document.documentElement.lang||"en").toLowerCase().startsWith("es")?"es":"en";
      const isES=LANG==="es";
      const L=(en,es)=>isES?es:en;

      const EIDOS_CONTENT = window.EIDOS_SHARED_CONTENT || { images: [], quotes: [] };

      function galleryImageUrl(item) {
        const raw = typeof item === "string"
          ? item
          : String(item?.url || "").trim();

        if (!raw) return "";
        if (/^(?:https?:)?\/\//i.test(raw) || raw.startsWith("/")) return raw;

        return "/gallery/" + raw.replace(/^\.?\//, "");
      }

      const GALLERY_IMAGES = Array.isArray(window.EIDOS_IMAGE_MANIFEST)
        ? window.EIDOS_IMAGE_MANIFEST.map(galleryImageUrl).filter(Boolean)
        : [];

      const BG_IMAGES = GALLERY_IMAGES.length
        ? GALLERY_IMAGES
        : (Array.isArray(EIDOS_CONTENT.images) ? EIDOS_CONTENT.images.filter(Boolean) : []);

      const backgroundRoot = document.getElementById("eidos-background");
      const backgroundLayers = [
        document.getElementById("background-a"),
        document.getElementById("background-b")
      ];

      const canvas = document.getElementById("game-canvas");
      const ctx = canvas.getContext("2d");
      const boardWrap = document.getElementById("board-wrap");
      const scoreHud = document.getElementById("score-hud");
      const bestHud = document.getElementById("best-hud");
      const stageHud = document.getElementById("stage-hud");
      const syncHud = document.getElementById("sync-hud");
      const syncFill = document.getElementById("sync-fill");
      const stageNameElement = document.getElementById("stage-name");
      const stageDescriptionElement = document.getElementById("stage-description");
      const fragmentCount = document.getElementById("fragment-count");
      const originalStatus = document.getElementById("original-status");
      const copyStatus = document.getElementById("copy-status");
      const boardMessage = document.getElementById("board-message");
      const undoButton = document.getElementById("undo-button");
      const restartStageButton = document.getElementById("restart-stage-button");
      const finishButton = document.getElementById("finish-button");
      const soundButton = document.getElementById("sound-button");
      const soundNote = document.getElementById("sound-note");
      const startScreen = document.getElementById("start-screen");
      const gameOverScreen = document.getElementById("game-over-screen");
      const victoryScreen = document.getElementById("victory-screen");
      const finishScreen = document.getElementById("finish-screen");
      const levelsScreen = document.getElementById("levels-screen");
      const deleteCampaignScreen = document.getElementById("delete-campaign-screen");
      const startButton = document.getElementById("start-button");
      const levelMap = document.getElementById("level-map");
      const campaignCompleted = document.getElementById("campaign-completed");
      const campaignUnlocked = document.getElementById("campaign-unlocked");
      const finishVisual = document.getElementById("finish-visual");
      const finishImage = document.getElementById("finish-image");
      const phaseFlash = document.getElementById("phase-flash");
      const phaseName = document.getElementById("phase-name");
      const phaseCopy = document.getElementById("phase-copy");
      const victoryCard = document.getElementById("victory-card");
      const victoryKicker = document.getElementById("victory-kicker");
      const victoryTitle = document.getElementById("victory-title");
      const victoryCopy = document.getElementById("victory-copy");
      const victoryResultContent = document.getElementById("victory-result-content");
      const transferCanvas = document.getElementById("transfer-canvas");
      const transferContext = transferCanvas.getContext("2d");
      const transferSequenceLabel = document.getElementById("transfer-sequence-label");

      const N = 7;
      const CELL_COUNT = N * N;
      const narrowLayoutMedia = window.matchMedia?.("(max-width: 520px)") || { matches: false };
      let W = 580;
      let H = 500;
      let CELL = 31;
      let GRID_SIZE = CELL * N;
      let LEFT_X = 35;
      let LEFT_Y = 76;
      let RIGHT_X = 328;
      let RIGHT_Y = 76;
      let STATUS_Y = 341;
      let narrowLayout = false;
      const MOVE_MS = 145;
      const TOTAL_STAGES = 7;
      const BEST_KEY="eidosTransferBestV2";
      const SAVE_KEY="eidosTransferSaveV2";
      const PROGRESS_KEY="eidosTransferCampaignV2";
      const GAME_DURATION_MS = 10 * 60 * 1000;
      const MINE_PENALTY_PERCENT = 1;
      const BLOCKED_MOVE_PENALTY_PERCENT = 1;
      const RESTART_PENALTY_PERCENT = 2;
      const TRANSFER_THRESHOLD = 30;
      const DIRS = [
        { key: "up", dx: 0, dy: -1, glyph: "↑" },
        { key: "right", dx: 1, dy: 0, glyph: "→" },
        { key: "down", dx: 0, dy: 1, glyph: "↓" },
        { key: "left", dx: -1, dy: 0, glyph: "←" }
      ];

      const STAGES = [
        {
          name: L("Perception","Percepción"),
          short: L("PERCEPTION","PERCEPCIÓN"),
          copy: L("Two systems receive the same world. They still seem identical.","Dos sistemas reciben el mismo mundo. Todavía parecen idénticos."),
          fragments: [L("Light","Luz"), L("Form","Forma")]
        },
        {
          name: L("Memory","Memoria"),
          short: L("MEMORY","MEMORIA"),
          copy: L("Remembering is not just storage: it also requires reconstruction.","Recordar no consiste solo en almacenar: también hay que reconstruir."),
          fragments: [L("Childhood","Infancia"), L("Face","Rostro")]
        },
        {
          name: L("Language","Lenguaje"),
          short: L("LANGUAGE","LENGUAJE"),
          copy: L("Symbols organize thought and alter what can be imagined.","Los símbolos organizan el pensamiento y alteran lo que puede imaginarse."),
          fragments: [L("Name","Nombre"), L("Meaning","Significado")]
        },
        {
          name: L("Emotion","Emoción"),
          short: L("EMOTION","EMOCIÓN"),
          copy: L("Information gains weight when something matters, attracts or threatens.","La información adquiere peso cuando algo importa, atrae o amenaza."),
          fragments: [L("Fear","Miedo"), L("Affection","Afecto")]
        },
        {
          name: L("Identity","Identidad"),
          short: L("IDENTITY","IDENTIDAD"),
          copy: L("A life recognizes itself in the story it preserves about itself.","Una vida se reconoce en la historia que conserva sobre sí misma."),
          fragments: [L("History","Historia"), L("Choice","Elección")]
        },
        {
          name: L("Self-awareness","Autoconsciencia"),
          short: L("SELF-AWARE.","AUTOCON."),
          copy: L("The mind observes its own thoughts and asks who produces them.","La mente observa su propio pensamiento y se pregunta quién lo produce."),
          fragments: [L("Self","Yo"), L("Continuity","Continuidad")]
        },
        {
          name: L("Autonomy","Autonomía"),
          short: L("AUTONOMY","AUTONOMÍA"),
          copy: L("A perfect copy stops being one as soon as it begins to live.","Una copia perfecta deja de serlo en cuanto comienza a vivir."),
          fragments: [L("Decision","Decisión"), L("Future","Futuro")]
        }
      ];

      const searchParams = new URLSearchParams(window.location.search || "");
      const soundSetting = searchParams.get("sound");
      const embedded = window.parent !== window;
      let soundEnabled = soundSetting !== "0";
      let audioContext = null;

      let runSeed = 1;
      let stageIndex = 0;
      let completedStages = 0;
      let stage = null;
      let posL = 0;
      let posR = 0;
      let targetIndex = 0;
      let score = 0;
      let best = loadBest();
      let sync = 100;
      let transferTimeRemaining = GAME_DURATION_MS;
      let lastTimerTick = 0;
      let lastDisplayedSecond = -1;
      let moves = 0;
      let history = [];
      let playing = false;
      let animating = false;
      let transitioning = false;
      let animation = null;
      let flashUntil = 0;
      let flashType = "";
      let pointerStart = null;
      let messageTimer = 0;
      let activeBackgroundLayer = 0;
      let backgroundDeck = [];
      let lastBackgroundIndex = -1;
      const badBackgroundIndexes = new Set();
      let hasStartedBefore = false;
      let transferAnimationFrame = 0;

      function configureCanvasLayout() {
        narrowLayout = Boolean(narrowLayoutMedia.matches);
        W = 580;
        if (narrowLayout) {
          H = 760;
          CELL = 38;
          GRID_SIZE = CELL * N;
          LEFT_X = (W - GRID_SIZE) / 2;
          LEFT_Y = 52;
          RIGHT_X = LEFT_X;
          RIGHT_Y = 379;
          STATUS_Y = 660;
          boardWrap.style.aspectRatio = "580 / 760";
        } else {
          H = 500;
          CELL = 31;
          GRID_SIZE = CELL * N;
          LEFT_X = 35;
          LEFT_Y = 76;
          RIGHT_X = 328;
          RIGHT_Y = 76;
          STATUS_Y = 341;
          boardWrap.style.aspectRatio = "580 / 500";
        }
        if (canvas.width !== W) canvas.width = W;
        if (canvas.height !== H) canvas.height = H;
      }

      function loadBest() {
        try {
          const shared=Number(localStorage.getItem(BEST_KEY))||0;
          const oldEn=Number(localStorage.getItem("eidosTransferBest"))||0;
          const oldEs=Number(localStorage.getItem("eidosTransferenciaBest"))||0;
          const migrated=Math.max(shared,oldEn,oldEs);
          if(migrated) localStorage.setItem(BEST_KEY,String(migrated));
          return migrated;
        } catch { return 0; }
      }

      function saveBest() {
        if (score <= best) return;
        best = score;
        try { localStorage.setItem(BEST_KEY, String(best)); }
        catch {}
      }

      function defaultProgress(){return {unlocked:1,completed:0,campaignComplete:false,checkpoints:{}}}
      function readJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
      function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
      function removeKey(key){try{localStorage.removeItem(key)}catch{}}
      let progress=Object.assign(defaultProgress(),readJSON(PROGRESS_KEY,{}));
      progress.unlocked=Math.max(1,Math.min(TOTAL_STAGES,Number(progress.unlocked)||1));
      progress.completed=Math.max(0,Math.min(TOTAL_STAGES,Number(progress.completed)||0));
      progress.checkpoints=progress.checkpoints&&typeof progress.checkpoints==="object"?progress.checkpoints:{};
      progress.campaignComplete=Boolean(progress.campaignComplete||progress.completed>=TOTAL_STAGES);
      let menuPaused=false;
      let levelsReturn="start";
      let lastSaveAt=0;


      function mulberry32(seed) {
        return function random() {
          let t = seed += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }

      function shuffle(array, rng) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }

      function refillBackgroundDeck() {
        backgroundDeck = shuffle(
          BG_IMAGES.map((_, index) => index).filter(index => !badBackgroundIndexes.has(index)),
          Math.random
        );
        if (backgroundDeck.length > 1 && backgroundDeck[0] === lastBackgroundIndex) {
          [backgroundDeck[0], backgroundDeck[1]] = [backgroundDeck[1], backgroundDeck[0]];
        }
      }

      function changeBackground(attempt = 0) {
        if (!BG_IMAGES.length || badBackgroundIndexes.size >= BG_IMAGES.length) return;
        if (!backgroundDeck.length) refillBackgroundDeck();
        if (!backgroundDeck.length) return;

        const imageIndex = backgroundDeck.shift();
        const imageUrl = BG_IMAGES[imageIndex];
        const nextLayerIndex = 1 - activeBackgroundLayer;
        const nextLayer = backgroundLayers[nextLayerIndex];
        const previousLayer = backgroundLayers[activeBackgroundLayer];

        nextLayer.onload = () => {
          nextLayer.onload = null;
          nextLayer.onerror = null;
          lastBackgroundIndex = imageIndex;
          previousLayer.classList.remove("active");
          nextLayer.classList.add("active");
          activeBackgroundLayer = nextLayerIndex;
        };

        nextLayer.onerror = () => {
          nextLayer.onload = null;
          nextLayer.onerror = null;
          badBackgroundIndexes.add(imageIndex);
          nextLayer.removeAttribute("src");
          if (attempt < BG_IMAGES.length - 1) changeBackground(attempt + 1);
        };

        nextLayer.src = imageUrl;
      }

      function updateBackgroundPresence() {
        if (!backgroundRoot) return;

        const totalMemories = stage?.targets?.length || 2;
        const currentStageProgress = stageIndex >= completedStages
          ? Math.min(1, Math.max(0, targetIndex / Math.max(1, totalMemories)))
          : 0;

        const overallProgress = Math.min(
          1,
          Math.max(0, (completedStages + currentStageProgress) / TOTAL_STAGES)
        );

        const opacity = .20 + overallProgress * .52;
        backgroundRoot.style.setProperty("--eidos-bg-opacity", opacity.toFixed(3));
      }

      function indexOf(x, y) { return y * N + x; }
      function pointOf(index) { return { x: index % N, y: Math.floor(index / N) }; }
      function stateKey(left, right) { return left * CELL_COUNT + right; }
      function parseState(key) { return { left: Math.floor(key / CELL_COUNT), right: key % CELL_COUNT }; }

      function movePosition(position, direction, walls) {
        const point = pointOf(position);
        const x = point.x + direction.dx;
        const y = point.y + direction.dy;
        if (x < 0 || x >= N || y < 0 || y >= N) return position;
        const next = indexOf(x, y);
        return walls[next] ? position : next;
      }

      function transition(left, right, direction, wallsL, wallsR) {
        return {
          left: movePosition(left, direction, wallsL),
          right: movePosition(right, direction, wallsR)
        };
      }

      function explore(startLeft, startRight, wallsL, wallsR) {
        const start = stateKey(startLeft, startRight);
        const queue = [start];
        let head = 0;
        const nodes = new Map([[start, { distance: 0, previous: null, direction: null }]]);
        while (head < queue.length) {
          const currentKey = queue[head++];
          const current = parseState(currentKey);
          const currentNode = nodes.get(currentKey);
          for (const direction of DIRS) {
            const next = transition(current.left, current.right, direction, wallsL, wallsR);
            const nextKey = stateKey(next.left, next.right);
            if (nextKey === currentKey || nodes.has(nextKey)) continue;
            nodes.set(nextKey, {
              distance: currentNode.distance + 1,
              previous: currentKey,
              direction: direction.key
            });
            queue.push(nextKey);
          }
        }
        return nodes;
      }

      function reconstructPath(nodes, targetKey) {
        const path = [];
        let key = targetKey;
        while (key !== null && nodes.has(key)) {
          path.push(parseState(key));
          key = nodes.get(key).previous;
        }
        return path.reverse();
      }

      function makeWalls(rng, count, protectedCells) {
        const walls = Array(CELL_COUNT).fill(false);
        const candidates = shuffle(Array.from({ length: CELL_COUNT }, (_, i) => i)
          .filter(i => !protectedCells.has(i)), rng);
        for (let i = 0; i < Math.min(count, candidates.length); i++) walls[candidates[i]] = true;
        return walls;
      }

      function pickDistantState(nodes, rng, usedLeft, usedRight, minDistance) {
        const candidates = [];
        for (const [key, node] of nodes) {
          if (node.distance < minDistance) continue;
          const state = parseState(key);
          if (usedLeft.has(state.left) || usedRight.has(state.right)) continue;
          candidates.push({ key, distance: node.distance, state });
        }
        candidates.sort((a, b) => b.distance - a.distance);
        if (!candidates.length) return null;
        const top = candidates.slice(0, Math.max(1, Math.ceil(candidates.length * .18)));
        return top[Math.floor(rng() * top.length)];
      }

      function addPathToSafe(path, safeLeft, safeRight) {
        for (const state of path) {
          safeLeft.add(state.left);
          safeRight.add(state.right);
        }
      }

      function makeHazards(rng, walls, safe, count) {
        const candidates = shuffle(Array.from({ length: CELL_COUNT }, (_, i) => i)
          .filter(i => !walls[i] && !safe.has(i)), rng);
        return new Set(candidates.slice(0, count));
      }

      function generateStage(index) {
        const baseSeed = (runSeed + (index + 1) * 104729) >>> 0;
        const startLeft = indexOf(0, 6);
        const startRight = indexOf(6, 6);
        const fragmentNames = STAGES[index].fragments;

        for (let attempt = 0; attempt < 120; attempt++) {
          const rng = mulberry32(baseSeed + attempt * 7919);
          const protectedL = new Set([startLeft, indexOf(0,5), indexOf(1,6)]);
          const protectedR = new Set([startRight, indexOf(6,5), indexOf(5,6)]);
          const wallCount = 4 + index * 2;
          const wallsL = makeWalls(rng, wallCount, protectedL);
          const wallsR = makeWalls(rng, wallCount + (index > 2 ? 1 : 0), protectedR);
          let current = { left: startLeft, right: startRight };
          const targets = [];
          const usedLeft = new Set([startLeft]);
          const usedRight = new Set([startRight]);
          const safeLeft = new Set([startLeft]);
          const safeRight = new Set([startRight]);
          let valid = true;

          for (let i = 0; i < fragmentNames.length; i++) {
            const nodes = explore(current.left, current.right, wallsL, wallsR);
            if (nodes.size < 65) { valid = false; break; }
            const picked = pickDistantState(nodes, rng, usedLeft, usedRight, 4 + Math.floor(index / 2));
            if (!picked) { valid = false; break; }
            addPathToSafe(reconstructPath(nodes, picked.key), safeLeft, safeRight);
            targets.push({ left: picked.state.left, right: picked.state.right, name: fragmentNames[i] });
            usedLeft.add(picked.state.left);
            usedRight.add(picked.state.right);
            current = picked.state;
          }

          if (!valid) continue;
          const exitNodes = explore(current.left, current.right, wallsL, wallsR);
          const exitPick = pickDistantState(exitNodes, rng, usedLeft, usedRight, 5 + Math.floor(index / 2));
          if (!exitPick) continue;
          addPathToSafe(reconstructPath(exitNodes, exitPick.key), safeLeft, safeRight);
          safeLeft.add(exitPick.state.left);
          safeRight.add(exitPick.state.right);
          const hazardCount = index < 2 ? 0 : Math.min(3, Math.floor((index + 1) / 2));

          return {
            wallsL,
            wallsR,
            hazardsL: makeHazards(rng, wallsL, safeLeft, hazardCount),
            hazardsR: makeHazards(rng, wallsR, safeRight, hazardCount),
            startLeft,
            startRight,
            targets,
            exit: exitPick.state
          };
        }

        throw new Error(L("A valid stage could not be generated.","No se pudo generar una fase válida."));
      }

      function getAudioContext() {
        if (!soundEnabled) return null;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!audioContext) audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
        return audioContext;
      }

      function tone(frequency, delay = 0, duration = .08, volume = .035, type = "sine", endFrequency = frequency) {
        const context = getAudioContext();
        if (!context) return;
        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(Math.max(1, frequency), start);
        if (endFrequency !== frequency) {
          oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
        }
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + .035);
      }

      function noiseBurst(delay = 0, duration = .08, volume = .014, filterFrequency = 950) {
        const context = getAudioContext();
        if (!context) return;
        const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
        const buffer = context.createBuffer(1, frameCount, context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          const fade = 1 - i / frameCount;
          data[i] = (Math.random() * 2 - 1) * fade;
        }
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        const start = context.currentTime + delay;
        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(filterFrequency, start);
        filter.Q.setValueAtTime(1.2, start);
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start(start);
      }

      function playStart() {
        [196, 294, 392].forEach((frequency, i) => tone(frequency, i * .075, .16, .032, "triangle", frequency * 1.03));
        noiseBurst(.02, .12, .006, 1350);
      }

      function playMove(changedBoth) {
        const notes = [196, 220, 247, 220];
        const frequency = notes[moves % notes.length];
        tone(frequency, 0, .055, changedBoth ? .031 : .021, "triangle", frequency * 1.04);
        if (changedBoth) tone(frequency * 2, .012, .04, .011, "sine");
      }

      function playBlocked() {
        // Short, dry impact: distinct from a mine’s electrical discharge.
        tone(138, 0, .055, .036, "square", 96);
        tone(82, .045, .065, .024, "square", 68);
        noiseBurst(0, .045, .008, 1250);
      }

      function playNode() {
        tone(330, 0, .12, .045, "sine", 350);
        tone(495, .075, .15, .043, "sine", 520);
        tone(660, .155, .18, .038, "sine", 700);
        noiseBurst(.12, .11, .009, 1750);
      }

      function playStage() {
        [262, 330, 392, 523].forEach((frequency, i) => tone(frequency, i * .085, .2, .043, "triangle", frequency * 1.025));
        tone(784, .31, .32, .025, "sine", 820);
      }

      function playHazard() {
        // Low electrical discharge, longer than the blocked-direction warning.
        tone(190, 0, .24, .064, "sawtooth", 66);
        tone(118, .035, .31, .05, "square", 52);
        noiseBurst(0, .24, .03, 390);
        noiseBurst(.07, .13, .017, 1650);
      }

      function playUndo() {
        tone(260, 0, .09, .027, "triangle", 185);
        tone(185, .055, .1, .022, "triangle", 150);
      }

      function playRestart() {
        tone(145, 0, .1, .032, "triangle", 210);
        tone(210, .08, .13, .029, "triangle", 290);
      }

      function playFinish() {
        tone(262, 0, .16, .035, "triangle", 300);
        tone(392, .09, .22, .032, "triangle", 440);
        tone(523, .2, .26, .025, "sine", 590);
      }

      function playWin() {
        [220, 277, 330, 440, 554, 659, 880].forEach((frequency, i) => tone(frequency, i * .095, .25, .042, i > 3 ? "sine" : "triangle", frequency * 1.025));
        noiseBurst(.48, .22, .012, 1900);
      }

      function updateSoundUI() {
        soundButton.classList.toggle("off", !soundEnabled);
        soundButton.setAttribute("aria-pressed", String(soundEnabled));
        soundButton.setAttribute("aria-label", soundEnabled ? L("Mute sound","Desactivar sonido") : L("Enable sound","Activar sonido"));
        soundButton.title = soundEnabled ? L("Mute sound","Desactivar sonido") : L("Enable sound","Activar sonido");
        soundNote.textContent = soundEnabled
          ? L("Sound on. You can mute it with ♪.","Sonido activado. Puedes silenciarlo con ♪.")
          : L("Sound off. You can enable it with ♪.","Sonido desactivado. Puedes activarlo con ♪.");
      }

      function toggleSound() {
        soundEnabled = !soundEnabled;
        updateSoundUI();
        if (soundEnabled) {
          getAudioContext();
          tone(440, 0, .08, .025);
        } else if (audioContext?.state === "running") {
          audioContext.suspend().catch(() => {});
        }
      }

      function openScreen(screen) {
        [startScreen, levelsScreen, deleteCampaignScreen, gameOverScreen, victoryScreen, finishScreen].forEach(item => {
          const open = item === screen;
          item.classList.toggle("open", open);
          item.setAttribute("aria-hidden", String(!open));
        });
      }

      function closeScreens() {
        [startScreen, levelsScreen, deleteCampaignScreen, gameOverScreen, victoryScreen, finishScreen].forEach(item => {
          item.classList.remove("open");
          item.setAttribute("aria-hidden", "true");
        });
      }

      function savedGame(){return readJSON(SAVE_KEY,null)}
      function hasSavedGame(){const s=savedGame();return Boolean(s&&Number.isInteger(s.stageIndex)&&s.stageIndex>=0&&s.stageIndex<TOTAL_STAGES)}
      function hasCampaignProgress(){return hasSavedGame()||progress.completed>0||progress.unlocked>1||progress.campaignComplete}
      function writeProgress(){writeJSON(PROGRESS_KEY,progress)}
      function checkpointFor(index){return progress.checkpoints[String(index)]||null}
      function saveCheckpoint(index,force=false){
        if(index<0||index>=TOTAL_STAGES)return;
        const next={runSeed,stageIndex:index,completedStages:Math.max(index,completedStages),score,transferTimeRemaining};
        const old=checkpointFor(index);
        if(force||!old||Number(next.transferTimeRemaining)>Number(old.transferTimeRemaining||0)){
          progress.checkpoints[String(index)]=next;writeProgress();
        }
      }
      function saveCurrentGame(force=false){
        if(!playing||transitioning||!stage)return;
        const now=performance.now();if(!force&&now-lastSaveAt<650)return;lastSaveAt=now;
        writeJSON(SAVE_KEY,{runSeed,stageIndex,completedStages,score,transferTimeRemaining,posL,posR,targetIndex,moves});
      }
      function restoreRunState(data){
        cancelTransferAnimation();
        runSeed=(Number(data.runSeed)||1)>>>0;
        stageIndex=Math.max(0,Math.min(TOTAL_STAGES-1,Number(data.stageIndex)||0));
        completedStages=Math.max(0,Math.min(TOTAL_STAGES,Number(data.completedStages)||stageIndex));
        score=Math.max(0,Number(data.score)||0);
        transferTimeRemaining=Math.max(1,Math.min(GAME_DURATION_MS,Number(data.transferTimeRemaining)||GAME_DURATION_MS));
        syncFromRemainingTime();lastTimerTick=performance.now();lastDisplayedSecond=-1;
        stage=generateStage(stageIndex);
        posL=Number.isInteger(data.posL)?data.posL:stage.startLeft;
        posR=Number.isInteger(data.posR)?data.posR:stage.startRight;
        targetIndex=Math.max(0,Math.min(stage.targets.length,Number(data.targetIndex)||0));
        moves=Math.max(0,Number(data.moves)||0);history=[];animation=null;animating=false;transitioning=false;playing=true;
        hasStartedBefore=true;closeScreens();updateHud();updateObjectiveMessage();changeBackground();getAudioContext();playStart();boardWrap.focus({preventScroll:true});saveCurrentGame(true);
      }
      function loadSavedGame(){const data=savedGame();if(!data)return false;restoreRunState(data);return true}
      function loadCheckpoint(index){
        const cp=checkpointFor(index);if(!cp)return false;
        restoreRunState(Object.assign({},cp,{posL:null,posR:null,targetIndex:0,moves:0}));return true;
      }
      function updateStartUI(){
        if(progress.campaignComplete)startButton.textContent=L("PLAY AGAIN","JUGAR DE NUEVO");
        else startButton.textContent=hasCampaignProgress()?L("CONTINUE GAME","CONTINUAR PARTIDA"):L("START","INICIAR");
        const del=document.getElementById("delete-campaign-button");if(del)del.hidden=!hasCampaignProgress();
      }
      function beginNewRun(preserveHistory=false){
        cancelTransferAnimation();if(hasStartedBefore)changeBackground();hasStartedBefore=true;
        runSeed=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;score=0;transferTimeRemaining=GAME_DURATION_MS;syncFromRemainingTime();lastTimerTick=performance.now();lastDisplayedSecond=-1;completedStages=0;playing=true;transitioning=false;
        if(!preserveHistory){progress=defaultProgress();writeProgress()}removeKey(SAVE_KEY);prepareStage(0,false);saveCheckpoint(0,true);saveCurrentGame(true);closeScreens();getAudioContext();playStart();boardWrap.focus({preventScroll:true});updateStartUI();
      }
      function continueCampaign(){
        if(loadSavedGame())return;
        if(progress.campaignComplete){beginNewRun(true);return}
        const index=Math.max(0,Math.min(TOTAL_STAGES-1,progress.unlocked-1));
        if(loadCheckpoint(index))return;
        beginNewRun(false);
      }
      function stageStatus(index){if(index<progress.completed)return "completed";if(index===Math.min(TOTAL_STAGES-1,progress.unlocked-1))return "current";return ""}
      function renderLevelMap(){
        levelMap.innerHTML="";
        STAGES.forEach((item,index)=>{
          const unlocked=index<progress.unlocked||progress.campaignComplete;
          const button=document.createElement("button");button.type="button";button.className="phase-level "+(unlocked?stageStatus(index):"locked");button.disabled=!unlocked;
          const state=!unlocked?L("LOCKED","BLOQUEADA"):(index<progress.completed?L("COMPLETED","COMPLETADA"):(index===progress.unlocked-1&&!progress.campaignComplete?L("CURRENT","ACTUAL"):L("UNLOCKED","DESBLOQUEADA")));
          button.innerHTML=`<strong>${String(index+1).padStart(2,"0")} · ${item.name}</strong><span>${state}</span>`;
          if(unlocked)button.addEventListener("click",()=>{menuPaused=false;if(!loadCheckpoint(index)){const seed=runSeed||1;restoreRunState({runSeed:seed,stageIndex:index,completedStages:Math.min(progress.completed,index),score:0,transferTimeRemaining:GAME_DURATION_MS})}});
          levelMap.appendChild(button);
        });
        campaignCompleted.innerHTML=`${L("Completed","Completadas")}: <strong>${progress.completed}/${TOTAL_STAGES}</strong>`;
        campaignUnlocked.innerHTML=`${L("Unlocked","Desbloqueadas")}: <strong>${progress.campaignComplete?TOTAL_STAGES:progress.unlocked}/${TOTAL_STAGES}</strong>`;
        const del=document.getElementById("delete-campaign-button");if(del)del.hidden=!hasCampaignProgress();
      }
      function showLevels(from="start"){
        levelsReturn=from;
        if(from==="game"&&playing){saveCurrentGame(true);playing=false;menuPaused=true}else menuPaused=false;
        renderLevelMap();openScreen(levelsScreen);
      }
      function backFromLevels(){
        closeScreens();
        if(levelsReturn==="game"&&menuPaused&&stage){playing=true;menuPaused=false;lastTimerTick=performance.now();boardWrap.focus({preventScroll:true});return}
        openScreen(startScreen);updateStartUI();
      }
      function openDeleteCampaign(){if(!hasCampaignProgress())return;openScreen(deleteCampaignScreen)}
      function cancelDeleteCampaign(){openScreen(levelsScreen)}
      function deleteCampaignAndRestart(){
        removeKey(SAVE_KEY);removeKey(PROGRESS_KEY);removeKey(BEST_KEY);removeKey("eidosTransferBest");removeKey("eidosTransferenciaBest");
        best=0;progress=defaultProgress();writeProgress();bestHud.textContent="0";beginNewRun(false);
      }
      async function copyGameLink(){
        const url=document.querySelector('link[rel="canonical"]')?.href||location.href;
        try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);const b=document.getElementById("copy-link-button"),old=b.textContent;b.textContent=L("LINK COPIED","ENLACE COPIADO");setTimeout(()=>b.textContent=old,1500);return}}catch{}
        window.prompt(L("Copy this link:","Copia este enlace:"),url);
      }
      function retryCurrentStage(){removeKey(SAVE_KEY);if(loadCheckpoint(stageIndex))return;continueCampaign()}
      function setMessage(text, type = "", duration = 0) {
        window.clearTimeout(messageTimer);
        boardMessage.textContent = text;
        boardMessage.className = type;
        if (duration) {
          messageTimer = window.setTimeout(updateObjectiveMessage, duration);
        }
      }

      function formatTransferTime(milliseconds) {
        const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
      }

      function syncFromRemainingTime() {
        sync = Math.max(0, Math.min(100, transferTimeRemaining / GAME_DURATION_MS * 100));
      }

      function applyTimePenalty(percent) {
        transferTimeRemaining = Math.max(
          0,
          transferTimeRemaining - GAME_DURATION_MS * (percent / 100)
        );
        syncFromRemainingTime();
        lastTimerTick = performance.now();
        lastDisplayedSecond = -1;
        updateHud();
        if (transferTimeRemaining <= 0 && playing) endGame();
      }

      function tickTransferWindow(now) {
        if (!lastTimerTick) lastTimerTick = now;
        if (!playing || transitioning || document.hidden) {
          lastTimerTick = now;
          return;
        }
        const elapsed = Math.max(0, now - lastTimerTick);
        lastTimerTick = now;
        transferTimeRemaining = Math.max(0, transferTimeRemaining - elapsed);
        syncFromRemainingTime();
        const displayedSecond = Math.ceil(transferTimeRemaining / 1000);
        if (displayedSecond !== lastDisplayedSecond) {
          lastDisplayedSecond = displayedSecond;
          updateHud();
        }
        if (transferTimeRemaining <= 0) endGame();
      }

      function updateObjectiveMessage() {
        if (!stage) return;
        if (targetIndex < stage.targets.length) {
          setMessage(L(`Synchronize the memory “${stage.targets[targetIndex].name}” in both minds.`,`Sincroniza el recuerdo «${stage.targets[targetIndex].name}» en las dos mentes.`));
        } else {
          setMessage(L("All memories have been copied. Guide both minds to the exit.","Todos los recuerdos están copiados. Lleva ambas mentes a la salida."));
        }
      }

      function progressStageNumber() {
        return Math.min(TOTAL_STAGES, Math.max(stageIndex + 1, completedStages + 1));
      }

      function updateHud() {
        updateBackgroundPresence();
        scoreHud.textContent = String(Math.max(0, Math.round(score)));
        bestHud.textContent = String(Math.max(best, Math.round(score)));
        stageHud.textContent = L(`Stage ${progressStageNumber()}/${TOTAL_STAGES}`,`Fase ${progressStageNumber()}/${TOTAL_STAGES}`);
        syncHud.textContent = L(`Window ${formatTransferTime(transferTimeRemaining)}`,`Ventana ${formatTransferTime(transferTimeRemaining)}`);
        syncFill.style.width = `${Math.max(0, sync)}%`;
        syncFill.style.background = sync < TRANSFER_THRESHOLD
          ? "linear-gradient(90deg,#cf726a,#e9a36f)"
          : "linear-gradient(90deg,#79d9c0,#89dda9 55%,#ead27d)";
        stageNameElement.textContent = STAGES[stageIndex].name;
        stageDescriptionElement.textContent = STAGES[stageIndex].copy;
        const totalMemories = stage?.targets.length || 2;
        fragmentCount.textContent = L(`${Math.min(targetIndex, totalMemories)}/${totalMemories} synchronized`,`${Math.min(targetIndex, totalMemories)}/${totalMemories} sincronizados`);
        const currentTarget = targetIndex < totalMemories ? stage.targets[targetIndex] : null;
        const phaseComplete = targetIndex >= totalMemories;
        const originalReady = phaseComplete || Boolean(currentTarget && posL === currentTarget.left);
        const copyReady = phaseComplete || Boolean(currentTarget && posR === currentTarget.right);
        originalStatus.textContent = originalReady
          ? L("ORIGINAL MEMORY · SYNCHRONIZED","RECUERDO ORIGINAL · SINCRONIZADO")
          : L("ORIGINAL MEMORY · PENDING","RECUERDO ORIGINAL · PENDIENTE");
        copyStatus.textContent = copyReady
          ? L("COPY MEMORY · SYNCHRONIZED","RECUERDO COPIA · SINCRONIZADO")
          : L("COPY MEMORY · PENDING","RECUERDO COPIA · PENDIENTE");
        originalStatus.classList.toggle("ready", originalReady);
        copyStatus.classList.toggle("ready", copyReady);
        boardWrap.setAttribute(
          "aria-label",
          L(`Circuits of the original and the copy. Progress: ${completedStages} of ${TOTAL_STAGES} stages completed. Current stage: ${STAGES[stageIndex].name}.`,`Circuitos del original y de la copia. Progreso: ${completedStages} de ${TOTAL_STAGES} fases completadas. Fase actual: ${STAGES[stageIndex].name}.`)
        );
        undoButton.disabled = !history.length || animating || transitioning || !playing;
        finishButton.disabled = !playing || animating || transitioning;
        saveCurrentGame();
      }

      function snapshot() {
        return { posL, posR, targetIndex, score, moves };
      }

      function restoreSnapshot(state) {
        posL = state.posL;
        posR = state.posR;
        targetIndex = state.targetIndex;
        score = state.score;
        moves = state.moves;
        animation = null;
        animating = false;
        updateHud();
        updateObjectiveMessage();
      }

      function prepareStage(index, preserveSync = true) {
        stageIndex = index;
        stage = generateStage(stageIndex);
        posL = stage.startLeft;
        posR = stage.startRight;
        targetIndex = 0;
        moves = 0;
        history = [];
        animation = null;
        animating = false;
        if (!preserveSync) {
          transferTimeRemaining = GAME_DURATION_MS;
          syncFromRemainingTime();
          lastTimerTick = performance.now();
          lastDisplayedSecond = -1;
        }
        updateHud();
        updateObjectiveMessage();
      }

      function startNewGame() { beginNewRun(false); }

      function restartStage() {
        if (!playing || transitioning || animating) return;
        applyTimePenalty(RESTART_PENALTY_PERCENT);
        if (!playing) return;
        score = Math.max(0, score - 75);
        posL = stage.startLeft;
        posR = stage.startRight;
        targetIndex = 0;
        moves = 0;
        history = [];
        animation = null;
        flashUntil = performance.now() + 350;
        flashType = "restart";
        updateHud();
        playRestart();
        setMessage(L(`Stage restarted · −${RESTART_PENALTY_PERCENT}% of the window.`,`Fase reiniciada · −${RESTART_PENALTY_PERCENT} % de la ventana.`), "warning", 1500);
        saveCurrentGame(true);
      }

      function undo() {
        if (!history.length || animating || transitioning || !playing) return;
        restoreSnapshot(history.pop());
        playUndo();
      }

      function currentGoal() {
        if (targetIndex < stage.targets.length) return stage.targets[targetIndex];
        return stage.exit;
      }

      function routeExists() {
        const goal = currentGoal();
        return explore(posL, posR, stage.wallsL, stage.wallsR).has(stateKey(goal.left, goal.right));
      }

      function attemptMove(direction) {
        if (!playing || animating || transitioning) return;
        const next = transition(posL, posR, direction, stage.wallsL, stage.wallsR);
        if (next.left === posL && next.right === posR) {
          applyTimePenalty(BLOCKED_MOVE_PENALTY_PERCENT);
          if (!playing) return;
          score = Math.max(0, score - 20);
          flashUntil = performance.now() + 430;
          flashType = "blocked";
          playBlocked();
          setMessage(L(`DIRECTION BLOCKED · −${BLOCKED_MOVE_PENALTY_PERCENT}% of the window.`,`DIRECCIÓN BLOQUEADA · −${BLOCKED_MOVE_PENALTY_PERCENT} % de la ventana.`), "danger", 950);
          updateHud();
          return;
        }

        history.push(snapshot());
        if (history.length > 80) history.shift();
        const fromL = posL;
        const fromR = posR;
        animation = {
          fromL,
          fromR,
          toL: next.left,
          toR: next.right,
          startedAt: performance.now(),
          origin: { left: fromL, right: fromR }
        };
        animating = true;
        posL = next.left;
        posR = next.right;
        moves++;
        const changedL = next.left !== fromL;
        const changedR = next.right !== fromR;
        score += 7 + stageIndex * 2;
        playMove(changedL && changedR);
        updateHud();
        window.setTimeout(resolveMove, MOVE_MS + 8);
      }

      function resolveMove() {
        if (!animation) return;
        const origin = animation.origin;
        animation = null;
        animating = false;

        const hitLeft = stage.hazardsL.has(posL);
        const hitRight = stage.hazardsR.has(posR);
        if (hitLeft || hitRight) {
          const mineHits = Number(hitLeft) + Number(hitRight);
          const minePenalty = mineHits * MINE_PENALTY_PERCENT;
          applyTimePenalty(minePenalty);
          if (!playing) return;
          score = Math.max(0, score - 90);
          posL = origin.left;
          posR = origin.right;
          flashUntil = performance.now() + 500;
          flashType = "hazard";
          playHazard();
          setMessage(L(`Noise corrupted the impulse · −${minePenalty}% of the window.`,`El ruido ha corrompido el impulso · −${minePenalty} % de la ventana.`), "danger", 1400);
          updateHud();
          return;
        }

        if (targetIndex < stage.targets.length) {
          const target = stage.targets[targetIndex];
          const leftReady = posL === target.left;
          const rightReady = posR === target.right;
          if (leftReady && rightReady) {
            const name = target.name;
            targetIndex++;
            score += 220 + stageIndex * 45;
            flashUntil = performance.now() + 560;
            flashType = "memory";
            playNode();
            updateHud();
            setMessage(L(`“${name}” has been preserved in both minds.`,`«${name}» se ha conservado en las dos mentes.`), "", 1100);
            if (targetIndex >= stage.targets.length) {
              completeStage();
              return;
            }
          } else if (leftReady || rightReady) {
            setMessage(leftReady ? L("The original remembers; the copy does not yet.","El original recuerda; la copia todavía no.") : L("The copy remembers; the original does not yet.","La copia recuerda; el original todavía no."), "warning", 900);
          }
        } else if (posL === stage.exit.left && posR === stage.exit.right) {
          completeStage();
          return;
        }

        if (!routeExists()) {
          setMessage(L("The pattern is locked. Undo the last move or restart the stage.","El patrón ha quedado bloqueado. Deshaz el último movimiento o reinicia la fase."), "danger");
        }
        updateHud();
      }

      function showPhase(text, copy, duration, callback) {
        phaseName.textContent = text.toUpperCase();
        phaseCopy.textContent = copy;
        phaseFlash.classList.add("show");
        phaseFlash.setAttribute("aria-hidden", "false");
        window.setTimeout(() => {
          phaseFlash.classList.remove("show");
          phaseFlash.setAttribute("aria-hidden", "true");
          if (callback) window.setTimeout(callback, 230);
        }, duration);
      }

      function completeStage() {
        if (transitioning) return;
        transitioning = true;
        animating = false;
        score += Math.round(350 + sync * 5 + stageIndex * 100);
        completedStages = Math.max(completedStages, stageIndex + 1);
        progress.completed=Math.max(progress.completed,completedStages);
        progress.unlocked=Math.max(progress.unlocked,Math.min(TOTAL_STAGES,stageIndex+2));
        if(stageIndex===TOTAL_STAGES-1){progress.campaignComplete=true;removeKey(SAVE_KEY)}
        writeProgress();
        saveBest();
        updateHud();
        playStage();
        changeBackground();

        if (stageIndex === TOTAL_STAGES - 1) {
          showPhase(L("AUTONOMY","AUTONOMÍA"), L("The copy no longer waits for the next instruction.","La copia ya no espera la siguiente instrucción."), 1450, showVictory);
          return;
        }

        saveCheckpoint(stageIndex+1);
        const completedName = STAGES[stageIndex].name;
        const nextName = STAGES[stageIndex + 1].name;
        showPhase(completedName, L(`Stable pattern. Next stage: ${nextName}.`,`Patrón estable. Siguiente fase: ${nextName}.`), 1200, () => {
          prepareStage(stageIndex + 1, true);
          transitioning = false;
          updateHud();
          saveCurrentGame(true);
        });
      }

      function endGame() {
        playing = false;
        transitioning = false;
        saveBest();
        removeKey(SAVE_KEY);
        updateStartUI();
        updateHud();
        document.getElementById("failure-stage").textContent = STAGES[stageIndex].name;
        playHazard();
        openScreen(gameOverScreen);
      }

      function cancelTransferAnimation() {
        if (transferAnimationFrame) cancelAnimationFrame(transferAnimationFrame);
        transferAnimationFrame = 0;
      }

      function transferParticleSet(count = 112) {
        return Array.from({ length: count }, (_, index) => ({
          delay: (index % 28) / 34 + Math.floor(index / 28) * .07,
          wave: 8 + Math.random() * 25,
          phase: Math.random() * Math.PI * 2,
          size: .8 + Math.random() * 1.9,
          speed: .82 + Math.random() * .4
        }));
      }

      function smoothStep(start, end, value) {
        const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
        return t * t * (3 - 2 * t);
      }

      function drawTransferNode(context, x, y, radius, color, glow, label, opacity = 1, pulse = 1) {
        if (opacity <= .01) return;
        context.save();
        context.globalAlpha = opacity;
        const animatedRadius = radius * pulse;
        const aura = context.createRadialGradient(x, y, 0, x, y, animatedRadius * 2.8);
        aura.addColorStop(0, color.replace("1)", `${Math.min(.72, glow)})`));
        aura.addColorStop(.38, color.replace("1)", `${Math.min(.25, glow * .36)})`));
        aura.addColorStop(1, color.replace("1)", "0)"));
        context.fillStyle = aura;
        context.beginPath();
        context.arc(x, y, animatedRadius * 2.8, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = color;
        context.lineWidth = 1.5;
        context.shadowBlur = 14 + glow * 20;
        context.shadowColor = color;
        context.beginPath();
        context.arc(x, y, animatedRadius, 0, Math.PI * 2);
        context.stroke();
        context.shadowBlur = 0;

        for (let i = 0; i < 7; i++) {
          const angle = i / 7 * Math.PI * 2 + glow * 1.3;
          const inner = animatedRadius * (.22 + (i % 3) * .1);
          const outer = animatedRadius * (.55 + (i % 2) * .13);
          context.strokeStyle = color.replace("1)", `${.25 + glow * .17})`);
          context.beginPath();
          context.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
          context.lineTo(x + Math.cos(angle + .35) * outer, y + Math.sin(angle + .35) * outer);
          context.stroke();
        }

        context.fillStyle = color;
        context.shadowColor = color;
        context.shadowBlur = 13;
        context.beginPath();
        context.arc(x, y, 3.5 + glow * 1.6, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;

        context.fillStyle = "rgba(245,236,208,.76)";
        context.font = "700 8px Arial";
        context.textAlign = "center";
        context.fillText(label, x, y + animatedRadius + 24);
        context.restore();
      }

      function drawTransferWorlds(context, width, height, sourceX, targetX) {
        context.save();

        context.strokeStyle = "rgba(121,217,192,.13)";
        context.fillStyle = "rgba(121,217,192,.07)";
        const horizonY = height * .79;
        context.beginPath();
        context.arc(sourceX - 4, height * .94, Math.min(92, width * .18), Math.PI, Math.PI * 2);
        context.stroke();
        const buildings = [13, 22, 17, 31, 20, 37, 16];
        let buildingX = 12;
        for (const buildingHeight of buildings) {
          context.fillRect(buildingX, horizonY - buildingHeight, 10, buildingHeight);
          buildingX += 13;
        }
        context.fillStyle = "rgba(196,214,203,.66)";
        context.font = "700 7px Arial";
        context.textAlign = "left";
        context.fillText(L("EARTH · PHYSICAL WORLD","TIERRA · MUNDO FÍSICO"), 10, 16);

        context.strokeStyle = "rgba(234,210,125,.17)";
        context.fillStyle = "rgba(234,210,125,.055)";
        const rackY = height * .79;
        const rackStart = width - 94;
        for (let i = 0; i < 3; i++) {
          const x = rackStart + i * 25;
          const rackHeight = 55 + (i % 2) * 9;
          context.fillRect(x, rackY - rackHeight, 17, rackHeight);
          context.strokeRect(x, rackY - rackHeight, 17, rackHeight);
          for (let y = rackY - rackHeight + 8; y < rackY - 5; y += 10) {
            context.fillRect(x + 4, y, 9, 1);
          }
        }
        context.fillStyle = "rgba(230,215,167,.72)";
        context.textAlign = "right";
        context.fillText(L("EIDOS · SERVER MATRIX","EIDOS · MATRIZ DE SERVIDORES"), width - 10, 16);
        context.restore();
      }

      function drawSourceMemory(context, sourceX, centerY, progress, success, elapsed) {
        const migration = success ? smoothStep(.18, .87, progress) : 0;
        const remaining = success ? 1 - migration : 1;
        const count = success ? Math.max(0, Math.round(24 * remaining)) : 24;
        context.save();
        for (let i = 0; i < count; i++) {
          const angle = i / 24 * Math.PI * 2 + elapsed * .0011 * (i % 2 ? 1 : -1);
          const orbit = 38 + (i % 4) * 4 + Math.sin(elapsed / 290 + i) * 2;
          const alpha = success ? .18 + remaining * .62 : .44 + Math.sin(elapsed / 420 + i) * .13;
          const color = i % 3 ? `rgba(121,217,192,${alpha})` : `rgba(234,210,125,${alpha * .78})`;
          context.fillStyle = color;
          context.shadowColor = color;
          context.shadowBlur = 6;
          context.beginPath();
          context.arc(sourceX + Math.cos(angle) * orbit, centerY + Math.sin(angle) * orbit * .72, 1.1 + (i % 3) * .35, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      function animateTransfer(success) {
        cancelTransferAnimation();
        const particles = transferParticleSet(success ? 126 : 112);
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const duration = reducedMotion ? 1000 : 5600;
        const start = performance.now();
        let lastLabel = "";

        function frame(now) {
          const rect = transferCanvas.getBoundingClientRect();
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const width = Math.max(320, rect.width || 460);
          const height = Math.max(185, rect.height || 245);
          if (transferCanvas.width !== Math.round(width * dpr) || transferCanvas.height !== Math.round(height * dpr)) {
            transferCanvas.width = Math.round(width * dpr);
            transferCanvas.height = Math.round(height * dpr);
          }
          const context = transferContext;
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          context.clearRect(0, 0, width, height);

          const elapsed = now - start;
          const progress = Math.min(1, elapsed / duration);
          const sourceX = width * .17;
          const targetX = width * .83;
          const centerY = height * .48;
          const targetBuild = smoothStep(.36, .86, progress);
          const sourceFade = success ? smoothStep(.55, .93, progress) : 0;
          const connectionFade = 1 - smoothStep(.72, .94, progress);

          const background = context.createLinearGradient(0, 0, width, height);
          background.addColorStop(0, "rgba(4,18,12,.97)");
          background.addColorStop(.5, "rgba(2,9,6,.99)");
          background.addColorStop(1, "rgba(9,20,14,.97)");
          context.fillStyle = background;
          context.fillRect(0, 0, width, height);

          context.save();
          context.strokeStyle = "rgba(121,217,192,.035)";
          context.lineWidth = 1;
          for (let x = 0; x < width; x += 24) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
          }
          for (let y = 0; y < height; y += 24) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
          }
          context.restore();

          drawTransferWorlds(context, width, height, sourceX, targetX);
          drawSourceMemory(context, sourceX, centerY, progress, success, elapsed);

          const flowProgress = Math.max(0, Math.min(1, (progress - .10) / .68));
          if (connectionFade > .01) {
            context.save();
            context.globalAlpha = connectionFade;
            context.strokeStyle = "rgba(121,217,192,.14)";
            context.lineWidth = 1;
            for (let i = 0; i < 7; i++) {
              const y = centerY + (i - 3) * 10;
              context.beginPath();
              context.moveTo(sourceX + 27, y);
              context.bezierCurveTo(width * .38, y + Math.sin(i) * 15, width * .62, y - Math.cos(i) * 17, targetX - 27, y);
              context.stroke();
            }
            context.restore();
          }

          for (const particle of particles) {
            const local = (flowProgress * 1.6 - particle.delay) * particle.speed;
            if (local <= 0 || local >= 1.08 || connectionFade <= .01) continue;
            const t = Math.max(0, Math.min(1, local));
            const eased = 1 - Math.pow(1 - t, 2.35);
            const x = sourceX + (targetX - sourceX) * eased;
            const y = centerY + Math.sin(t * Math.PI * 4 + particle.phase) * particle.wave * (1 - t * .58);
            const alpha = (Math.sin(t * Math.PI) * .9 + .08) * connectionFade;
            const particleColor = particle.phase > Math.PI
              ? `rgba(234,210,125,${alpha})`
              : `rgba(121,217,192,${alpha})`;
            context.fillStyle = particleColor;
            context.shadowBlur = 8;
            context.shadowColor = particleColor;
            context.beginPath();
            context.arc(x, y, particle.size, 0, Math.PI * 2);
            context.fill();
            context.shadowBlur = 0;
          }

          const sourceOpacity = success ? 1 - sourceFade : 1;
          const sourcePulse = 1 + Math.sin(elapsed / 210) * (success ? .035 : .07);
          const targetPulse = 1 + Math.sin(elapsed / 190) * (progress > .82 ? .075 : .035);
          drawTransferNode(
            context,
            sourceX,
            centerY,
            27,
            "rgba(121,217,192,1)",
            .35 + (1 - sourceFade) * .48,
            L("ORIGINAL · EARTH","ORIGINAL · TIERRA"),
            sourceOpacity,
            sourcePulse
          );
          drawTransferNode(
            context,
            targetX,
            centerY,
            27,
            "rgba(234,210,125,1)",
            .12 + targetBuild * .78,
            success ? L("CONTINUITY · EIDOS","CONTINUIDAD · EIDOS") : L("COPY · EIDOS","COPIA · EIDOS"),
            Math.max(.08, targetBuild),
            targetPulse
          );

          const label = progress < .25
            ? L("READING THE CONSCIOUS PATTERN","LEYENDO EL PATRÓN CONSCIENTE")
            : progress < .62
              ? success ? L("MIGRATING CONSCIOUSNESS","MIGRANDO LA CONSCIENCIA") : L("COPYING THE CONSCIOUS PATTERN","COPIANDO EL PATRÓN CONSCIENTE")
              : progress < .88
                ? L("STABILIZING IN EIDOS","ESTABILIZANDO EN EIDOS")
                : success
                  ? L("A SINGLE CONTINUITY REMAINS","QUEDA UNA SOLA CONTINUIDAD")
                  : L("TWO INDEPENDENT CONTINUITIES","DOS CONTINUIDADES INDEPENDIENTES");
          if (label !== lastLabel) {
            transferSequenceLabel.textContent = label;
            transferSequenceLabel.style.color = progress >= .88 ? "#ead27d" : "#d9e2dc";
            lastLabel = label;
          }

          if (progress < 1) {
            transferAnimationFrame = requestAnimationFrame(frame);
          } else {
            transferAnimationFrame = 0;
            revealTransferOutcome(success);
          }
        }

        transferAnimationFrame = requestAnimationFrame(frame);
      }

      function revealTransferOutcome(success) {
        victoryCard.classList.toggle("success", success);
        victoryCard.classList.toggle("copy-only", !success);
        victoryKicker.textContent = success ? L("CONSCIOUSNESS PRESERVED","CONSCIENCIA CONSERVADA") : L("COPY CREATED","COPIA CREADA");
        victoryTitle.textContent = success ? L("TRANSFERRED TO EIDOS","TRANSFERIDO A EIDOS") : L("TWO CONTINUITIES","DOS CONTINUIDADES");
        victoryCopy.innerHTML = success
          ? L(`At least ${TRANSFER_THRESHOLD}% of the transfer window remained. The original has ceased and the conscious pattern continues in EIDOS.<br><strong>Only one continuity remains.</strong>`,`Quedaba al menos un ${TRANSFER_THRESHOLD} % de la ventana de transferencia. El original ha cesado y el patrón consciente continúa en EIDOS.<br><strong>Solo queda una continuidad.</strong>`)
          : L(`Less than ${TRANSFER_THRESHOLD}% of the transfer window remained. A copy reached EIDOS, but the original remained active on Earth.<br><strong>There are now two independent continuities.</strong>`,`Quedaba menos de un ${TRANSFER_THRESHOLD} % de la ventana de transferencia. Una copia llegó a EIDOS, pero el original permaneció activo en la Tierra.<br><strong>Ahora son dos continuidades independientes.</strong>`);
        victoryResultContent.classList.add("revealed");
      }

      function showVictory() {
        playing = false;
        transitioning = false;
        syncFromRemainingTime();
        const finalWindow = Math.max(0, Math.round(sync));
        const success = finalWindow >= TRANSFER_THRESHOLD;
        score += success ? 1500 : 500;
        saveBest();
        updateHud();
        document.getElementById("final-sync").textContent = `${finalWindow} %`;
        victoryCard.classList.remove("success", "copy-only");
        victoryResultContent.classList.remove("revealed");
        victoryKicker.textContent = L("EIDOS · CONSCIOUSNESS TRANSFER","EIDOS · TRANSFERENCIA DE CONSCIENCIA");
        victoryTitle.textContent = L("TRANSFER IN PROGRESS","TRANSFERENCIA EN CURSO");
        transferSequenceLabel.textContent = L("READING THE CONSCIOUS PATTERN","LEYENDO EL PATRÓN CONSCIENTE");
        transferSequenceLabel.style.color = "#d9e2dc";
        openScreen(victoryScreen);
        if (success) {
          playWin();
        } else {
          playFinish();
          window.setTimeout(playHazard, 620);
        }
        animateTransfer(success);
      }

      function finishGame() {
        if (!playing || animating || transitioning) return;
        saveCurrentGame(true);
        playing = false;
        transitioning = false;
        saveBest();
        updateHud();
        document.getElementById("finish-stage").textContent = STAGES[stageIndex].name;
        document.getElementById("finish-progress").textContent = completedStages === 1
          ? L("1 of 7 stages completed. The copy already retains its first pattern.","1 de 7 fases completada. La copia conserva ya su primer patrón.")
          : L(`${completedStages} of 7 stages completed. You can continue the transfer in a new game.`,`${completedStages} de 7 fases completadas. Puedes continuar la transferencia en una nueva partida.`);
        const visibleBackground = backgroundLayers[activeBackgroundLayer];
        const visibleSource = visibleBackground?.currentSrc || visibleBackground?.src || "";
        finishImage.classList.remove("loaded");
        finishVisual.classList.remove("has-image");
        const revealFinishImage = () => {
          finishImage.classList.add("loaded");
          finishVisual.classList.add("has-image");
        };
        finishImage.onload = revealFinishImage;
        finishImage.onerror = () => {
          finishImage.classList.remove("loaded");
          finishVisual.classList.remove("has-image");
        };
        if (visibleSource) {
          finishImage.src = visibleSource;
          if (finishImage.complete && finishImage.naturalWidth) revealFinishImage();
        }
        else finishImage.removeAttribute("src");
        playFinish();
        openScreen(finishScreen);
      }

      function gridPosition(index, gridX, gridY) {
        const point = pointOf(index);
        return {
          x: gridX + point.x * CELL + CELL / 2,
          y: gridY + point.y * CELL + CELL / 2
        };
      }

      function drawRoundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
      }

      function drawBackground(time) {
        ctx.clearRect(0, 0, W, H);
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#07150e");
        gradient.addColorStop(1, "#030a07");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.globalAlpha = .18;
        for (let i = 0; i < 34; i++) {
          const x = (i * 83 + stageIndex * 29) % W;
          const y = (i * 47 + Math.sin(time / 1300 + i) * 12 + 500) % H;
          ctx.fillStyle = i % 4 ? "#4a7c6f" : "#c8a84b";
          ctx.fillRect(x, y, 1.2, 1.2);
        }
        ctx.restore();
      }

      function drawHeaderLabels() {
        ctx.textAlign = "center";
        if (narrowLayout) {
          ctx.fillStyle = "#79d9c0";
          ctx.font = "700 12px Arial";
          ctx.fillText("ORIGINAL", W / 2, 20);
          ctx.fillStyle = "rgba(245,236,208,.42)";
          ctx.font = "9px Arial";
          ctx.fillText(L("BIOLOGICAL SUBSTRATE","SUSTRATO BIOLÓGICO"), W / 2, 36);

          ctx.fillStyle = "#ead27d";
          ctx.font = "700 12px Arial";
          ctx.fillText("COPIA", W / 2, 347);
          ctx.fillStyle = "rgba(245,236,208,.42)";
          ctx.font = "9px Arial";
          ctx.fillText(L("DIGITAL SUBSTRATE","SUSTRATO DIGITAL"), W / 2, 363);

          ctx.strokeStyle = "rgba(74,124,111,.36)";
          ctx.setLineDash([4, 7]);
          ctx.beginPath();
          ctx.moveTo(LEFT_X - 13, 337);
          ctx.lineTo(LEFT_X + GRID_SIZE + 13, 337);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = "#79d9c0";
          ctx.font = "700 11px Arial";
          ctx.fillText("ORIGINAL", LEFT_X + GRID_SIZE / 2, 34);
          ctx.fillStyle = "#ead27d";
          ctx.fillText("COPIA", RIGHT_X + GRID_SIZE / 2, 34);
          ctx.fillStyle = "rgba(245,236,208,.38)";
          ctx.font = "9px Arial";
          ctx.fillText(L("BIOLOGICAL SUBSTRATE","SUSTRATO BIOLÓGICO"), LEFT_X + GRID_SIZE / 2, 51);
          ctx.fillText(L("DIGITAL SUBSTRATE","SUSTRATO DIGITAL"), RIGHT_X + GRID_SIZE / 2, 51);

          const centerX = W / 2;
          ctx.strokeStyle = "rgba(74,124,111,.38)";
          ctx.setLineDash([4, 7]);
          ctx.beginPath();
          ctx.moveTo(centerX, 59);
          ctx.lineTo(centerX, LEFT_Y + GRID_SIZE + 15);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      function drawGrid(gridX, gridY, walls, hazards, accent, time) {
        ctx.save();
        drawRoundedRect(gridX - 7, gridY - 7, GRID_SIZE + 14, GRID_SIZE + 14, 10);
        ctx.fillStyle = "rgba(7,25,17,.72)";
        ctx.fill();
        ctx.strokeStyle = accent === "cyan" ? "rgba(121,217,192,.4)" : "rgba(200,168,75,.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const index = indexOf(x, y);
            const px = gridX + x * CELL;
            const py = gridY + y * CELL;
            ctx.strokeStyle = "rgba(74,124,111,.16)";
            ctx.strokeRect(px + .5, py + .5, CELL - 1, CELL - 1);

            if (!walls[index]) {
              ctx.strokeStyle = "rgba(121,217,192,.055)";
              ctx.beginPath();
              if (x < N - 1 && !walls[index + 1]) {
                ctx.moveTo(px + CELL / 2, py + CELL / 2);
                ctx.lineTo(px + CELL * 1.5, py + CELL / 2);
              }
              if (y < N - 1 && !walls[index + N]) {
                ctx.moveTo(px + CELL / 2, py + CELL / 2);
                ctx.lineTo(px + CELL / 2, py + CELL * 1.5);
              }
              ctx.stroke();
            }

            if (walls[index]) {
              const wallGradient = ctx.createLinearGradient(px, py, px + CELL, py + CELL);
              wallGradient.addColorStop(0, "rgba(22,48,35,.92)");
              wallGradient.addColorStop(1, "rgba(5,18,12,.96)");
              ctx.fillStyle = wallGradient;
              ctx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
              ctx.strokeStyle = "rgba(74,124,111,.45)";
              ctx.strokeRect(px + 5.5, py + 5.5, CELL - 11, CELL - 11);
              ctx.beginPath();
              ctx.moveTo(px + 8, py + 8);
              ctx.lineTo(px + CELL - 8, py + CELL - 8);
              ctx.stroke();
            } else if (hazards.has(index)) {
              const pulse = .55 + Math.sin(time / 170 + index) * .18;
              ctx.fillStyle = `rgba(207,114,106,${pulse * .2})`;
              ctx.fillRect(px + 5, py + 5, CELL - 10, CELL - 10);
              ctx.strokeStyle = `rgba(207,114,106,${pulse})`;
              ctx.beginPath();
              ctx.moveTo(px + 8, py + 10);
              ctx.lineTo(px + CELL - 7, py + 10);
              ctx.moveTo(px + 11, py + 16);
              ctx.lineTo(px + CELL - 10, py + 16);
              ctx.moveTo(px + 7, py + 22);
              ctx.lineTo(px + CELL - 12, py + 22);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      function drawGoal(index, gridX, gridY, color, label, time, activePart) {
        const point = gridPosition(index, gridX, gridY);
        const pulse = 1 + Math.sin(time / 220) * .08;
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = color;
        ctx.shadowBlur = activePart ? 15 : 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = activePart ? 2.4 : 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = .42;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = .88;
        ctx.textAlign = "center";
        ctx.font = "700 6px Arial";
        ctx.fillText(label.toUpperCase().slice(0, 9), point.x, point.y + 23);
        ctx.restore();
      }

      function drawExit(index, gridX, gridY, color, time) {
        const point = gridPosition(index, gridX, gridY);
        const spin = time / 900;
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(spin);
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -10, 20, 20);
        ctx.rotate(-spin * 2);
        ctx.globalAlpha = .55;
        ctx.strokeRect(-14, -14, 28, 28);
        ctx.restore();
      }

      function interpolatedPosition(side, time) {
        const gridX = side === "left" ? LEFT_X : RIGHT_X;
        const gridY = side === "left" ? LEFT_Y : RIGHT_Y;
        if (!animation) return gridPosition(side === "left" ? posL : posR, gridX, gridY);
        const from = gridPosition(side === "left" ? animation.fromL : animation.fromR, gridX, gridY);
        const to = gridPosition(side === "left" ? animation.toL : animation.toR, gridX, gridY);
        const progress = Math.min(1, Math.max(0, (time - animation.startedAt) / MOVE_MS));
        const eased = 1 - Math.pow(1 - progress, 3);
        return { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
      }

      function drawMind(point, type, time) {
        const isOriginal = type === "original";
        const color = isOriginal ? "#79d9c0" : "#ead27d";
        const pulse = 1 + Math.sin(time / 180 + (isOriginal ? 0 : 1.4)) * .05;
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = isOriginal ? "rgba(21,76,59,.96)" : "rgba(72,58,20,.96)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        if (isOriginal) {
          ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
        } else {
          ctx.moveTo(0, -12);
          ctx.lineTo(12, 0);
          ctx.lineTo(0, 12);
          ctx.lineTo(-12, 0);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      function drawConnection(time) {
        const left = interpolatedPosition("left", time);
        const right = interpolatedPosition("right", time);
        const gradient = ctx.createLinearGradient(left.x, left.y, right.x, right.y);
        gradient.addColorStop(0, "rgba(121,217,192,.25)");
        gradient.addColorStop(.5, "rgba(245,236,208,.09)");
        gradient.addColorStop(1, "rgba(234,210,125,.25)");
        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 8]);
        ctx.lineDashOffset = -time / 90;
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        if (narrowLayout) {
          const spineX = W - 24;
          ctx.bezierCurveTo(spineX, left.y, spineX, right.y, right.x, right.y);
        } else {
          ctx.bezierCurveTo(W * .43, left.y, W * .57, right.y, right.x, right.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      function drawStageIcon(index, x, y, state, time) {
        const active = state === "active";
        const completed = state === "completed";
        const color = completed ? "#79d9c0" : active ? "#ead27d" : "rgba(91,124,113,.5)";
        const pulse = active ? 1 + Math.sin(time / 180) * .055 : 1;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);
        ctx.strokeStyle = color;
        ctx.fillStyle = completed
          ? "rgba(121,217,192,.13)"
          : active
            ? "rgba(234,210,125,.13)"
            : "rgba(10,30,21,.72)";
        ctx.lineWidth = active ? 1.8 : 1.35;
        if (active) {
          ctx.shadowColor = "#ead27d";
          ctx.shadowBlur = 11;
        }
        ctx.beginPath();
        ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.35;

        if (index === 0) {
          // Perception: an open eye.
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.quadraticCurveTo(0, -6, 8, 0);
          ctx.quadraticCurveTo(0, 6, -8, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        } else if (index === 1) {
          // Memory: linked memories.
          ctx.beginPath();
          ctx.moveTo(-5, -4);
          ctx.lineTo(5, -5);
          ctx.lineTo(1, 6);
          ctx.lineTo(-5, -4);
          ctx.stroke();
          ctx.fillStyle = color;
          for (const point of [[-5, -4], [5, -5], [1, 6]]) {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (index === 2) {
          // Language: a speech bubble with two lines of meaning.
          ctx.beginPath();
          ctx.roundRect(-8, -6, 16, 11, 3);
          ctx.moveTo(-3, 5);
          ctx.lineTo(-6, 9);
          ctx.lineTo(1, 5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-4, -2);
          ctx.lineTo(4, -2);
          ctx.moveTo(-4, 2);
          ctx.lineTo(2, 2);
          ctx.stroke();
        } else if (index === 3) {
          // Emotion: a geometric heart.
          ctx.beginPath();
          ctx.moveTo(0, 8);
          ctx.bezierCurveTo(-2, 5, -8, 1, -8, -3);
          ctx.bezierCurveTo(-8, -8, -2, -9, 0, -5);
          ctx.bezierCurveTo(2, -9, 8, -8, 8, -3);
          ctx.bezierCurveTo(8, 1, 2, 5, 0, 8);
          ctx.stroke();
        } else if (index === 4) {
          // Identity: a unique fingerprint.
          ctx.beginPath();
          ctx.arc(0, 1, 7, Math.PI * .9, Math.PI * 2.15);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 1, 4, Math.PI * .78, Math.PI * 2.05);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 1, 1.4, 0, Math.PI * 2);
          ctx.stroke();
        } else if (index === 5) {
          // Self-awareness: a mind observing itself.
          ctx.beginPath();
          ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, 10, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          // Autonomy: a trajectory leaving the circle.
          ctx.beginPath();
          ctx.arc(-1, 1, 7, Math.PI * .35, Math.PI * 1.85);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(2, 3);
          ctx.lineTo(8, -5);
          ctx.lineTo(8, 0);
          ctx.moveTo(8, -5);
          ctx.lineTo(3, -5);
          ctx.stroke();
        }

        if (completed) {
          ctx.fillStyle = "#07140e";
          ctx.strokeStyle = "#79d9c0";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(9, -9, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(6.8, -9);
          ctx.lineTo(8.5, -7.3);
          ctx.lineTo(11.5, -10.7);
          ctx.stroke();
        }
        ctx.restore();
      }

      function drawStatus(time) {
        const y = STATUS_Y;
        const startX = 42;
        const endX = W - 42;
        const step = (endX - startX) / (TOTAL_STAGES - 1);
        const iconY = y + 27;
        const activeStageIndex = completedStages >= TOTAL_STAGES ? -1 : progressStageNumber() - 1;
        const reachedIndex = activeStageIndex >= 0 ? activeStageIndex : TOTAL_STAGES - 1;

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(245,236,208,.52)";
        ctx.font = "9px Arial";
        ctx.fillText(L(`TRANSFER PROGRESS · ${progressStageNumber()}/${TOTAL_STAGES}`,`PROGRESO DE LA TRANSFERENCIA · ${progressStageNumber()}/${TOTAL_STAGES}`), W / 2, y);

        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(74,124,111,.2)";
        ctx.beginPath();
        ctx.moveTo(startX, iconY);
        ctx.lineTo(endX, iconY);
        ctx.stroke();

        if (reachedIndex > 0) {
          const progressGradient = ctx.createLinearGradient(startX, 0, startX + step * reachedIndex, 0);
          progressGradient.addColorStop(0, "rgba(121,217,192,.78)");
          progressGradient.addColorStop(1, activeStageIndex < 0 ? "rgba(121,217,192,.78)" : "rgba(234,210,125,.82)");
          ctx.strokeStyle = progressGradient;
          ctx.beginPath();
          ctx.moveTo(startX, iconY);
          ctx.lineTo(startX + step * reachedIndex, iconY);
          ctx.stroke();
        }

        for (let i = 0; i < TOTAL_STAGES; i++) {
          const state = i < completedStages
            ? "completed"
            : i === activeStageIndex
              ? "active"
              : "pending";
          const x = startX + i * step;
          drawStageIcon(i, x, iconY, state, time);
          ctx.fillStyle = state === "active"
            ? "#f5ecd0"
            : state === "completed"
              ? "rgba(121,217,192,.82)"
              : "rgba(126,148,137,.42)";
          ctx.font = state === "active" ? "bold 8.6px Arial" : "7.8px Arial";
          ctx.fillText(STAGES[i].short, x, iconY + 27);
        }
        ctx.restore();
      }

      function draw(time) {
        tickTransferWindow(time);
        drawBackground(time);
        drawHeaderLabels();
        if (stage) {
          drawGrid(LEFT_X, LEFT_Y, stage.wallsL, stage.hazardsL, "cyan", time);
          drawGrid(RIGHT_X, RIGHT_Y, stage.wallsR, stage.hazardsR, "gold", time);

          if (targetIndex < stage.targets.length) {
            const target = stage.targets[targetIndex];
            drawGoal(target.left, LEFT_X, LEFT_Y, "#79d9c0", target.name, time, posL === target.left);
            drawGoal(target.right, RIGHT_X, RIGHT_Y, "#ead27d", target.name, time, posR === target.right);
          } else {
            drawExit(stage.exit.left, LEFT_X, LEFT_Y, "#79d9c0", time);
            drawExit(stage.exit.right, RIGHT_X, RIGHT_Y, "#ead27d", time);
          }

          drawConnection(time);
          drawMind(interpolatedPosition("left", time), "original", time);
          drawMind(interpolatedPosition("right", time), "copy", time);
          drawStatus(time);
        }

        if (time < flashUntil) {
          const remaining = Math.max(0, flashUntil - time);
          const baseDuration = flashType === "hazard" ? 500 : flashType === "blocked" ? 430 : 500;
          const strength = flashType === "hazard" ? .38 : flashType === "blocked" ? .31 : .28;
          const alpha = Math.min(strength, remaining / baseDuration * strength);
          const isErrorFlash = flashType === "hazard" || flashType === "blocked";
          ctx.fillStyle = isErrorFlash
            ? `rgba(207,70,64,${alpha})`
            : flashType === "memory"
              ? `rgba(121,217,192,${alpha})`
              : `rgba(200,168,75,${alpha * .7})`;
          ctx.fillRect(0, 0, W, H);
          if (isErrorFlash) {
            ctx.save();
            ctx.strokeStyle = `rgba(255,116,106,${Math.min(.9, alpha * 2.4)})`;
            ctx.lineWidth = flashType === "hazard" ? 8 : 5;
            ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
            ctx.restore();
          }
        }

        requestAnimationFrame(draw);
      }

      document.addEventListener("visibilitychange", () => {
        lastTimerTick = performance.now();
      });

      function directionFromKey(key) {
        const map = { ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left" };
        return DIRS.find(direction => direction.key === map[key]);
      }

      function handleKey(event) {
        if (event.key === "Escape") {
          closeGame();
          return;
        }
        if (startScreen.classList.contains("open") && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          startNewGame();
          return;
        }
        if ((event.key === "z" || event.key === "Z") && playing) {
          event.preventDefault();
          undo();
          return;
        }
        const direction = directionFromKey(event.key);
        if (!direction || event.repeat) return;
        event.preventDefault();
        attemptMove(direction);
      }

      function closeGame() {
        saveCurrentGame(true);
        if (window.parent !== window) {
          window.parent.postMessage("cerrar-eidos", "*");
        } else {
          window.location.href = "/hiddenegg/index.html";
        }
      }

      boardWrap.addEventListener("pointerdown", event => {
        if (!playing) return;
        pointerStart = { x: event.clientX, y: event.clientY };
        boardWrap.setPointerCapture?.(event.pointerId);
      });

      boardWrap.addEventListener("pointerup", event => {
        if (!pointerStart || !playing) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        const key = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");
        attemptMove(DIRS.find(direction => direction.key === key));
      });

      boardWrap.addEventListener("pointercancel", () => { pointerStart = null; });
      if (narrowLayoutMedia.addEventListener) {
        narrowLayoutMedia.addEventListener("change", configureCanvasLayout);
      } else {
        narrowLayoutMedia.addListener?.(configureCanvasLayout);
      }
      document.addEventListener("keydown", handleKey);
      startButton.addEventListener("click", continueCampaign);
      document.getElementById("start-levels-button").addEventListener("click",()=>showLevels("start"));
      document.getElementById("levels-button").addEventListener("click",()=>showLevels("game"));
      document.getElementById("levels-back").addEventListener("click",backFromLevels);
      document.getElementById("delete-campaign-button").addEventListener("click",openDeleteCampaign);
      document.getElementById("confirm-delete-campaign").addEventListener("click",deleteCampaignAndRestart);
      document.getElementById("cancel-delete-campaign").addEventListener("click",cancelDeleteCampaign);
      document.getElementById("copy-link-button").addEventListener("click",copyGameLink);
      document.getElementById("retry-button").addEventListener("click", retryCurrentStage);
      document.getElementById("victory-retry-button").addEventListener("click",()=>beginNewRun(true));
      document.getElementById("finish-retry-button").addEventListener("click", continueCampaign);
      document.getElementById("close-btn").addEventListener("click", closeGame);
      soundButton.addEventListener("click", toggleSound);
      undoButton.addEventListener("click", undo);
      restartStageButton.addEventListener("click", restartStage);
      finishButton.addEventListener("click", finishGame);

      bestHud.textContent = String(best);
      updateSoundUI();
      configureCanvasLayout();
      runSeed = 1;
      stage = generateStage(0);
      posL = stage.startLeft;
      posR = stage.startRight;
      playing=false;
      updateHud();
      updateObjectiveMessage();
      updateStartUI();
      changeBackground();
      document.addEventListener("visibilitychange",()=>{if(document.hidden)saveCurrentGame(true);else if(playing)lastTimerTick=performance.now()});
      requestAnimationFrame(draw);
    })();
