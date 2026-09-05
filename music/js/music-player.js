(() => {
      'use strict';
      const ROOT_LANGUAGE_KEY = 'root';
      const IS_ENGLISH = document.documentElement.lang.toLowerCase().startsWith('en');

      const COPY = IS_ENGLISH ? {
        languageLabels: {
          esp: 'Spanish', es: 'Spanish', eng: 'English', en: 'English',
          fra: 'French', fre: 'French', fr: 'French', ita: 'Italian', it: 'Italian',
          deu: 'German', ger: 'German', de: 'German', por: 'Portuguese', pt: 'Portuguese',
          cat: 'Catalan', ca: 'Catalan', eus: 'Basque', eu: 'Basque',
          glg: 'Galician', gl: 'Galician', root: 'Other'
        },
        unsupportedAudio: 'This browser does not support the Web Audio API.',
        unmute: 'Unmute', mute: 'Mute', play: 'Play', pause: 'Pause',
        ordered: 'Play in order', random: 'Shuffle playback',
        oneTrack: 'track available', manyTracks: 'tracks available',
        sharedTrack: name => `Shared track: ${name}`,
        randomStart: name => `Starts at random: ${name}`,
        noTracks: 'No tracks are available.', playerTitle: 'Eidos Â· Music Visualizer',
        noCompatibleAudio: 'No compatible audio tracks were found in js/music-manifest.js.',
        musicFailed: 'The music could not be prepared.',
        updateManifest: 'Run ACTUALIZAR_MUSICA.bat after changing files inside music/songs.',
        preparing: 'Preparing the visualizerâ€¦',
        startFailed: message => `The track could not be started. ${message}`,
        playFailed: name => `Could not play ${name}.`,
        linkShared: 'Link shared.', nativeShareFailed: 'The native share menu could not be used. The link will be copied.',
        linkCopied: 'Link copied.', linkCopyFailed: 'The link could not be copied.',
        fullscreenExitFailed: 'Could not exit full-screen mode.',
        enterFullscreen: 'Enter full screen', exitFullscreen: 'Exit full screen',
        shareTitle: 'Eidos Â· Music Visualizer', sharePlayer: 'Listen to the Eidos music visualizer.',
        shareTrack: name => `Listen to â€œ${name}â€ in the Eidos music visualizer.`
      } : {
        languageLabels: {
          esp: 'EspaÃ±ol', es: 'EspaÃ±ol', eng: 'English', en: 'English',
          fra: 'FranÃ§ais', fre: 'FranÃ§ais', fr: 'FranÃ§ais', ita: 'Italiano', it: 'Italiano',
          deu: 'Deutsch', ger: 'Deutsch', de: 'Deutsch', por: 'PortuguÃªs', pt: 'PortuguÃªs',
          cat: 'CatalÃ ', ca: 'CatalÃ ', eus: 'Euskara', eu: 'Euskara',
          glg: 'Galego', gl: 'Galego', root: 'Otros'
        },
        unsupportedAudio: 'Este navegador no admite Web Audio API.',
        unmute: 'Recuperar volumen', mute: 'Silenciar', play: 'Reproducir', pause: 'Pausar',
        ordered: 'ReproducciÃ³n en orden', random: 'ReproducciÃ³n aleatoria',
        oneTrack: 'canciÃ³n disponible', manyTracks: 'canciones disponibles',
        sharedTrack: name => `CanciÃ³n compartida: ${name}`,
        randomStart: name => `ComenzarÃ¡ al azar: ${name}`,
        noTracks: 'No hay canciones disponibles.', playerTitle: 'Eidos Â· Visor musical',
        noCompatibleAudio: 'No se han encontrado audios compatibles en js/music-manifest.js.',
        musicFailed: 'No se ha podido preparar la mÃºsica.',
        updateManifest: 'Ejecuta ACTUALIZAR_MUSICA.bat despuÃ©s de cambiar archivos dentro de music/songs.',
        preparing: 'Preparando la visualizaciÃ³nâ€¦',
        startFailed: message => `No se pudo iniciar la canciÃ³n. ${message}`,
        playFailed: name => `No se pudo reproducir ${name}.`,
        linkShared: 'Enlace compartido.', nativeShareFailed: 'No se ha podido usar el menÃº nativo. Se copiarÃ¡ el enlace.',
        linkCopied: 'Enlace copiado.', linkCopyFailed: 'No se ha podido copiar el enlace.',
        fullscreenExitFailed: 'No se ha podido salir de pantalla completa.',
        enterFullscreen: 'Entrar en pantalla completa', exitFullscreen: 'Salir de pantalla completa',
        shareTitle: 'Eidos Â· Visor musical', sharePlayer: 'Escucha el visor musical de Eidos.',
        shareTrack: name => `Escucha â€œ${name}â€ en el visor musical de Eidos.`
      };

      const LANGUAGE_LABELS = COPY.languageLabels;

      const AUDIO_EXTENSION = /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac|webm)$/i;
      const SONGS_DIRECTORY = './songs/';
      const START_DELAY_MS = 2000;

      const canvas = document.getElementById('visualizer');
      const ctx = canvas.getContext('2d', { alpha: false });
      const audio = document.getElementById('audio');
      const preloadAudio = new Audio();
      preloadAudio.preload = 'auto';
      const panel = document.getElementById('startPanel');
      const languageSwitches = Array.from(document.querySelectorAll('.lang-switch'));

      function setPlayerLanguageSwitchesVisible(visible) {
        languageSwitches.forEach(element => {
          element.hidden = !visible;
          element.style.display = visible ? '' : 'none';
        });
      }

      const startButton = document.getElementById('startButton');
      const previousButton = document.getElementById('previousButton');
      const pauseButton = document.getElementById('pauseButton');
      const pauseIcon = document.getElementById('pauseIcon');
      const nextButton = document.getElementById('nextButton');
      const selectButton = document.getElementById('selectButton');
      const selectorPanel = document.getElementById('selectorPanel');
      const closeSelector = document.getElementById('closeSelector');
      const trackList = document.getElementById('trackList');
      const languageFilter = document.getElementById('languageFilter');
      let languageFilterButtons = [];
      const startTrack = document.getElementById('startTrack');
      const startStatus = document.getElementById('startStatus');
      const currentTrackName = document.getElementById('currentTrackName');
      const currentTrackClone = document.getElementById('currentTrackClone');
      const currentTrackMarquee = document.getElementById('currentTrackMarquee');
      const currentTrackViewport = document.getElementById('currentTrackViewport');
      const brandButton = document.getElementById('brand');
      const modeButton = document.getElementById('modeButton');
      const modeIcon = document.getElementById('modeIcon');
      const shareButton = document.getElementById('shareButton');
      const fullscreenButton = document.getElementById('fullscreenButton');
      const fullscreenIcon = document.getElementById('fullscreenIcon');
      const sharePanel = document.getElementById('sharePanel');
      const closeShare = document.getElementById('closeShare');
      const sharePlayerButton = document.getElementById('sharePlayerButton');
      const shareTrackButton = document.getElementById('shareTrackButton');
      const shareStatus = document.getElementById('shareStatus');
      const currentTimeLabel = document.getElementById('currentTimeLabel');
      const durationLabel = document.getElementById('durationLabel');
      const seekBar = document.getElementById('seekBar');
      const muteButton = document.getElementById('muteButton');
      const volumeBar = document.getElementById('volumeBar');

      let audioContext = null;
      let analyser = null;
      let sourceNode = null;
      let outputGainNode = null;
      let frequencyData = null;
      let timeData = null;
      let width = 0;
      let height = 0;
      let dpr = 1;
      let running = false;
      let starting = false;
      let localPlaylist = [];
      let currentTrackIndex = 0;
      let trackTransitioning = false;
      let lastFrame = performance.now();
      let controlsTimer = null;
      let selectorOpen = false;
      let playbackMode = 'random';
      let preloadedNextIndex = -1;

      /*
        Bolsa aleatoria:
        contiene las canciones aÃºn no reproducidas en el ciclo actual.
        Solo se vuelve a llenar cuando todas han sonado.
      */
      let randomQueue = [];

      const storedLanguageFilter = (() => {
        try {
          const value = String(
            localStorage.getItem('eidosMusicLanguageFilter') || ''
          ).trim().toLowerCase();

          return value || 'all';
        } catch (_) {
          return 'all';
        }
      })();

      let trackLanguageFilter = storedLanguageFilter;
      let shareOpen = false;
      let marqueeFrame = 0;
      let requestedTrackMatched = false;
      let transportInteracting = false;
      let isSeeking = false;
      let lastNonZeroVolume = 0.85;
      let shareStatusTimer = null;
      let shareAutoCloseTimer = null;

      const storedVolume = (() => {
        try {
          const stored = localStorage.getItem('eidosMusicVolume');

          if (stored === null || stored === '') {
            return 0.85;
          }

          const value = Number(stored);

          return Number.isFinite(value)
            ? Math.max(0, Math.min(1, value))
            : 0.85;
        } catch (_) {
          return 0.85;
        }
      })();

      let desiredVolume = storedVolume;
      if (desiredVolume > 0) lastNonZeroVolume = desiredVolume;

      const coverPaths = IS_ENGLISH
        ? {
            collection: './assets/eidoscover-both-eng.webp',
            essay: './assets/tapaessey.jpg'
          }
        : {
            collection: './assets/eidoscover-both.webp',
            essay: './assets/tapaensayo.jpg'
          };

      const launcherCovers = [coverPaths.collection, coverPaths.essay];

      let previousLauncherCover = -1;

      function chooseLauncherCover() {
        let nextIndex = Math.floor(Math.random() * launcherCovers.length);

        if (
          launcherCovers.length > 1 &&
          nextIndex === previousLauncherCover
        ) {
          nextIndex = (nextIndex + 1) % launcherCovers.length;
        }

        previousLauncherCover = nextIndex;

        document.documentElement.style.setProperty(
          '--launcher-cover',
          `url("${launcherCovers[nextIndex]}")`
        );
      }

      const requestedTrackToken = (() => {
        try {
          return new URL(window.location.href).searchParams.get('track');
        } catch (_) {
          return null;
        }
      })();

      const particles = [];
      const ripples = [];
      const glowNodes = [];
      const peakStars = [];
      const transferWaves = [];
      const dataFilaments = [];
      const constellations = [];

      const collectionImage = new Image();
      collectionImage.src = coverPaths.collection;
      const essayImage = new Image();
      essayImage.src = coverPaths.essay;

      const sideCoverState = {
        alpha: 0,
        holdUntil: 0,
        lastTrigger: -99,
        maxAlpha: 0.62,
        pulse: 0
      };

      const cubeSparkState = {
        currentVertex: -1,
        previousVertex: -1,
        transitionStart: 0,
        transitionDuration: 0.38
      };

      const random = (min, max) => min + Math.random() * (max - min);
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      const lerp = (a, b, t) => a + (b - a) * t;
      const roundedRect = (x, y, w, h, r) => {
        const rr = Math.max(0, Math.min(r, Math.min(w, h) * 0.5));
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
      };

      // Ajuste automÃ¡tico de rendimiento. Mantiene el aspecto general,
      // pero reduce carga en pantallas grandes, mÃ³viles y equipos modestos.
      const compactDevice =
        window.matchMedia('(max-width: 820px)').matches ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

      const quality = {
        dpr: compactDevice ? 1 : 1.25,
        particles: compactDevice ? 0.58 : 0.72,
        nodes: compactDevice ? 0.58 : 0.72,
        bars: compactDevice ? 0.62 : 0.76,
        wavePoints: compactDevice ? 64 : 88,
        haloLayers: compactDevice ? 2 : 3,
        waveLayers: 2,
        maxStars: compactDevice ? 48 : 78,
        maxRipples: compactDevice ? 3 : 5
      };

      const energy = {
        bass: 0,
        mid: 0,
        high: 0,
        overall: 0,
        beat: 0,
        smoothedBeat: 0,
        previousBass: 0,
        previousMid: 0,
        previousHigh: 0
      };

      const musicalEvents = {
        previousLevel: 0,
        smoothedLevel: 0,
        baseline: 0.12,
        sustainedFor: 0,
        lastSampleTime: performance.now() / 1000,
        lastAccent: -99,
        lastCover: -99,
        lastRipple: -99,
        lastStarBurst: -99,
        lastStructureHit: -99
      };

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, quality.dpr);
        width = Math.max(1, window.innerWidth);
        height = Math.max(1, window.innerHeight);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildScene();
        scheduleTrackMarqueeUpdate();
      }

      function buildScene() {
        particles.length = 0;
        glowNodes.length = 0;
        peakStars.length = 0;

        const area = width * height;
        const particleCount = Math.round(clamp((area / 11500) * quality.particles, 52, 185));
        const nodeCount = Math.round(clamp((width / 205) * quality.nodes, 4, 10));

        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: random(0.35, 1.8),
            alpha: random(0.04, 0.26),
            driftX: random(-0.018, 0.018),
            driftY: random(-0.015, 0.015),
            phase: random(0, Math.PI * 2),
            band: Math.floor(random(0, 3))
          });
        }

        for (let i = 0; i < nodeCount; i++) {
          glowNodes.push({
            x: random(width * 0.06, width * 0.94),
            y: random(height * 0.10, height * 0.90),
            radius: random(Math.min(width, height) * 0.035, Math.min(width, height) * 0.11),
            phase: random(0, Math.PI * 2),
            speed: random(0.10, 0.30),
            band: i % 3,
            strength: random(0.5, 1.0)
          });
        }
      }

      function setupAudioGraph() {
        if (audioContext) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error(COPY.unsupportedAudio);

        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.82;
        analyser.minDecibels = -92;
        analyser.maxDecibels = -12;

        sourceNode = audioContext.createMediaElementSource(audio);
        outputGainNode = audioContext.createGain();

        /*
          El analizador recibe siempre la seÃ±al original. El volumen
          del usuario se aplica despuÃ©s, solo a la salida audible.
        */
        sourceNode.connect(analyser);
        analyser.connect(outputGainNode);
        outputGainNode.connect(audioContext.destination);

        audio.volume = 1;
        audio.muted = false;
        outputGainNode.gain.value = desiredVolume;

        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        timeData = new Uint8Array(analyser.fftSize);
      }

      function averageRange(startRatio, endRatio) {
        const start = Math.floor(frequencyData.length * startRatio);
        const end = Math.max(start + 1, Math.floor(frequencyData.length * endRatio));
        let total = 0;
        for (let i = start; i < end; i++) total += frequencyData[i];
        return total / ((end - start) * 255);
      }


      function spawnPeakBurst(intensity = 0.7) {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const count = Math.round(5 + intensity * 10);
        const baseRadius = Math.min(width, height) * (0.07 + energy.bass * 0.09 + energy.smoothedBeat * 0.05);

        for (let i = 0; i < count; i++) {
          const angle = random(0, Math.PI * 2);
          const speed = random(50, 140) + intensity * 120;
          const startR = baseRadius * random(0.9, 1.35);
          peakStars.push({
            x: cx + Math.cos(angle) * startR,
            y: cy + Math.sin(angle) * startR,
            vx: Math.cos(angle) * speed + random(-14, 14),
            vy: Math.sin(angle) * speed + random(-14, 14),
            life: random(0.8, 1.7),
            age: 0,
            size: random(1.4, 3.6),
            twinkle: random(0, Math.PI * 2),
            hueBand: Math.floor(random(0, 4))
          });
        }
      }

      function triggerSideCovers(intensity = 0.7, time = performance.now() / 1000) {
        const level = clamp(0.24 + intensity * 0.54, 0.24, 0.84);
        const alreadyVisible = sideCoverState.alpha > 0.03;

        sideCoverState.maxAlpha = Math.max(
          sideCoverState.maxAlpha * 0.88,
          level
        );

        if (alreadyVisible) {
          /*
            Si llega otro impacto mientras las portadas estÃ¡n visibles
            o entrando en fade-out, se recuperan suavemente.
          */
          sideCoverState.alpha = Math.max(
            sideCoverState.alpha,
            Math.min(0.88, level * 0.88)
          );
        }

        sideCoverState.holdUntil = time + (alreadyVisible ? 1.35 : 1.05);
        sideCoverState.lastTrigger = time;
        sideCoverState.pulse = Math.max(sideCoverState.pulse, 1);
      }

      function triggerAccentEffects(intensity = 0.7, time = performance.now() / 1000) {
        const minSize = Math.min(width || window.innerWidth, height || window.innerHeight);
        const waveCount = 1;

        for (let i = 0; i < waveCount && transferWaves.length < 6; i++) {
          transferWaves.push({
            radius: minSize * (0.13 + i * 0.018),
            alpha: 0.18 + intensity * 0.22,
            speed: minSize * (0.24 + intensity * 0.12 + i * 0.02),
            thickness: Math.max(1.2, minSize * 0.0021),
            life: 2.2 + i * 0.12,
            age: 0
          });
        }

        const filamentCount = compactDevice ? 2 : 3;
        for (let i = 0; i < filamentCount && dataFilaments.length < 18; i++) {
          const toCover = sideCoverState.alpha > 0.06 && Math.random() < 0.55;
          const side = Math.random() < 0.5 ? -1 : 1;
          const targetRadius = minSize * random(0.22, 0.35);
          const angle = random(-Math.PI * 0.9, Math.PI * 0.9);

          let targetX = width * 0.5 + Math.cos(angle) * targetRadius;
          let targetY = height * 0.5 + Math.sin(angle) * targetRadius;

          if (toCover) {
            targetX = width * 0.5 + side * minSize * random(0.26, 0.36);
            targetY = height * (0.45 + random(-0.10, 0.10));
          }

          dataFilaments.push({
            age: 0,
            life: random(1.15, 1.9),
            alpha: 0.18 + intensity * 0.28,
            bend: random(-1, 1),
            targetX,
            targetY,
            side
          });
        }

        if (constellations.length < (compactDevice ? 1 : 2)) {
          const nodeCount = compactDevice ? 4 : 6;
          const nodes = [];
          const links = [];
          const radius = minSize * random(0.23, 0.36);
          const baseAngle = random(0, Math.PI * 2);

          for (let i = 0; i < nodeCount; i++) {
            const angle = baseAngle + (i / nodeCount) * Math.PI * 2 + random(-0.24, 0.24);
            const r = radius + random(-minSize * 0.045, minSize * 0.045);
            nodes.push({
              x: width * 0.5 + Math.cos(angle) * r,
              y: height * 0.5 + Math.sin(angle) * r,
              driftX: random(-3, 3),
              driftY: random(-3, 3),
              size: random(1.2, 2.8)
            });
          }


          for (let i = 0; i < nodes.length; i++) {
            links.push([i, (i + 1) % nodes.length]);
            if (i + 2 < nodes.length && Math.random() < 0.5) links.push([i, i + 2]);
          }

          constellations.push({
            age: 0,
            life: random(1.6, 2.4),
            alpha: 0.12 + intensity * 0.18,
            nodes,
            links
          });
        }
      }

      function updateEnergy() {
        if (!analyser || !frequencyData) return;

        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(timeData);

        const bassNow = averageRange(0.004, 0.075);
        const midNow = averageRange(0.075, 0.32);
        const highNow = averageRange(0.32, 0.78);

        let rms = 0;
        for (let i = 0; i < timeData.length; i++) {
          const sample = (timeData[i] - 128) / 128;
          rms += sample * sample;
        }
        rms = Math.sqrt(rms / timeData.length);

        energy.bass = lerp(energy.bass, bassNow, 0.16);
        energy.mid = lerp(energy.mid, midNow, 0.12);
        energy.high = lerp(energy.high, highNow, 0.10);
        energy.overall = lerp(energy.overall, clamp(rms * 2.4, 0, 1), 0.14);

        const bassDelta = Math.max(0, bassNow - energy.previousBass);
        const midDelta = Math.max(0, midNow - energy.previousMid);
        const highDelta = Math.max(0, highNow - energy.previousHigh);

        /*
          Cambios de distribuciÃ³n de frecuencias: no importa solo subir
          el volumen, sino que entren graves, voz o agudos de otra forma.
        */
        const structureShift = clamp(
          Math.abs(bassNow - energy.bass) * 1.9 +
          Math.abs(midNow - energy.mid) * 1.45 +
          Math.abs(highNow - energy.high) * 1.9,
          0,
          1
        );

        energy.previousBass = lerp(energy.previousBass, bassNow, 0.30);
        energy.previousMid = lerp(energy.previousMid, midNow, 0.28);
        energy.previousHigh = lerp(energy.previousHigh, highNow, 0.26);

        energy.beat = clamp(
          bassDelta * 6.2 +
          midDelta * 1.8 +
          bassNow * 0.31,
          0,
          1
        );

        energy.smoothedBeat = lerp(
          energy.smoothedBeat,
          energy.beat,
          energy.beat > energy.smoothedBeat ? 0.38 : 0.08
        );

        const nowSec = performance.now() / 1000;
        const sampleDt = clamp(
          nowSec - musicalEvents.lastSampleTime,
          0,
          0.12
        );
        musicalEvents.lastSampleTime = nowSec;

        const musicalLevel = clamp(
          bassNow * 0.34 +
          midNow * 0.26 +
          highNow * 0.18 +
          energy.overall * 0.34,
          0,
          1
        );

        const baselineSpeed =
          musicalLevel > musicalEvents.baseline ? 0.010 : 0.035;

        musicalEvents.baseline = lerp(
          musicalEvents.baseline,
          musicalLevel,
          baselineSpeed
        );

        const levelRise = Math.max(
          0,
          musicalLevel - musicalEvents.previousLevel
        );

        musicalEvents.previousLevel = musicalLevel;
        musicalEvents.smoothedLevel = lerp(
          musicalEvents.smoothedLevel,
          musicalLevel,
          0.11
        );

        const aboveBaseline =
          musicalEvents.smoothedLevel -
          musicalEvents.baseline;

        if (
          musicalEvents.smoothedLevel > 0.19 &&
          aboveBaseline > 0.025
        ) {
          musicalEvents.sustainedFor = Math.min(
            2.8,
            musicalEvents.sustainedFor + sampleDt
          );
        } else {
          musicalEvents.sustainedFor = Math.max(
            0,
            musicalEvents.sustainedFor - sampleDt * 1.7
          );
        }

        const transientScore = clamp(
          energy.beat * 0.70 +
          bassDelta * 2.6 +
          highDelta * 4.1 +
          midDelta * 1.25,
          0,
          1
        );

        const swellScore = clamp(
          levelRise * 7.4 +
          Math.max(0, aboveBaseline) * 4.0,
          0,
          1
        );

        const sustainedScore =
          musicalEvents.sustainedFor > 0.52
            ? clamp(
                (musicalEvents.smoothedLevel - 0.17) * 2.75 +
                Math.min(1.8, musicalEvents.sustainedFor) * 0.24,
                0,
                1
              )
            : 0;

        /*
          Momento estructural claro: golpe, cambio de espectro o subida.
          Se recuerda brevemente para reconocer un clÃ­max que culmina
          y se mantiene.
        */
        const structureHitScore = Math.max(
          transientScore,
          swellScore * 0.92,
          structureShift * 0.95
        );

        if (structureHitScore > 0.46) {
          musicalEvents.lastStructureHit = nowSec;
        }

        const climaxHoldScore =
          nowSec - musicalEvents.lastStructureHit < 2.05
            ? clamp(
                sustainedScore * 0.95 +
                Math.max(0, aboveBaseline) * 2.0,
                0,
                1
              )
            : sustainedScore * 0.72;

        const accentScore = Math.max(
          transientScore,
          structureShift * 0.90,
          swellScore * 0.88,
          climaxHoldScore * 0.78
        );

        const coverScore = Math.max(
          transientScore * 0.84,
          structureShift * 0.92,
          swellScore * 0.86,
          climaxHoldScore
        );

        /*
          Rayas, cÃ­rculos y demÃ¡s: algo menos frecuentes que antes.
        */
        if (
          accentScore > 0.50 &&
          nowSec - musicalEvents.lastAccent > 1.30
        ) {
          triggerAccentEffects(accentScore, nowSec);
          musicalEvents.lastAccent = nowSec;
        }

        /*
          Portadas:
          - pueden iniciarse tras un momento fuerte;
          - si ya estÃ¡n visibles o en fade, un nuevo impacto relevante
            puede reactivarlas tras ~1 s;
          - si han desaparecido, sÃ­ se espera mÃ¡s para que conserven
            su valor promocional.
        */
        const coverVisible = sideCoverState.alpha > 0.035;
        const coverRefreshReady =
          coverVisible &&
          nowSec - sideCoverState.lastTrigger > 0.95 &&
          coverScore > 0.46;

        const newCoverCooldown =
          coverScore > 0.80 ? 3.8 : 4.8;

        const canStartNewCover =
          !coverVisible &&
          coverScore > 0.56 &&
          nowSec - musicalEvents.lastCover > newCoverCooldown;

        if (coverRefreshReady || canStartNewCover) {
          triggerSideCovers(coverScore, nowSec);
          musicalEvents.lastCover = nowSec;

          /*
            Los efectos secundarios no deben dispararse siempre que se
            refuerzan las portadas. Solo acompaÃ±an los impactos mÃ¡s
            claros o cuando hacÃ­a bastante que no aparecÃ­an.
          */
          if (
            coverScore > 0.61 &&
            nowSec - musicalEvents.lastAccent > 0.78
          ) {
            triggerAccentEffects(coverScore * 0.92, nowSec);
            musicalEvents.lastAccent = nowSec;
          }
        }

        if (
          accentScore > 0.54 &&
          nowSec - musicalEvents.lastRipple > 0.76 &&
          ripples.length < quality.maxRipples
        ) {
          ripples.push({
            x: width * 0.5 + random(-width * 0.13, width * 0.13),
            y: height * 0.5 + random(-height * 0.10, height * 0.10),
            radius: Math.min(width, height) * 0.05,
            alpha: 0.22 + accentScore * 0.18,
            speed: 24 + accentScore * 46
          });
          musicalEvents.lastRipple = nowSec;
        }

        if (
          Math.max(transientScore, structureShift, swellScore) > 0.57 &&
          nowSec - musicalEvents.lastStarBurst > 1.05 &&
          peakStars.length < quality.maxStars
        ) {
          spawnPeakBurst(
            Math.max(transientScore, structureShift, swellScore)
          );
          musicalEvents.lastStarBurst = nowSec;
        }
      }

      function drawBackground(time) {
        const bass = energy.bass;
        const mid = energy.mid;
        const high = energy.high;

        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, `rgb(${Math.round(5 + bass * 10)}, ${Math.round(18 + mid * 18)}, ${Math.round(17 + high * 15)})`);
        bg.addColorStop(0.34, `rgb(${Math.round(8 + mid * 10)}, ${Math.round(27 + bass * 18)}, ${Math.round(23 + high * 14)})`);
        bg.addColorStop(0.70, `rgb(${Math.round(13 + high * 12)}, ${Math.round(28 + mid * 17)}, ${Math.round(22 + bass * 10)})`);
        bg.addColorStop(1, 'rgb(3, 10, 8)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        const sweepX = width * (0.5 + Math.sin(time * 0.07) * 0.12);
        const sweepY = height * (0.42 + Math.cos(time * 0.06) * 0.10);
        const auric = ctx.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, Math.max(width, height) * 0.50);
        auric.addColorStop(0, `rgba(184, 222, 198, ${0.030 + bass * 0.075})`);
        auric.addColorStop(0.28, `rgba(73, 126, 115, ${0.028 + mid * 0.068})`);
        auric.addColorStop(0.55, `rgba(103, 124, 70, ${0.018 + high * 0.052})`);
        auric.addColorStop(0.76, `rgba(216, 178, 57, ${0.010 + energy.overall * 0.040})`);
        auric.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auric;
        ctx.fillRect(0, 0, width, height);

        const centerPulse = Math.min(width, height) * (0.13 + bass * 0.17 + energy.smoothedBeat * 0.15);
        const halo = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, centerPulse * 4.4);
        halo.addColorStop(0, `rgba(246, 224, 129, ${0.055 + bass * 0.105})`);
        halo.addColorStop(0.22, `rgba(95, 150, 135, ${0.040 + mid * 0.080})`);
        halo.addColorStop(0.48, `rgba(93, 116, 67, ${0.024 + high * 0.060})`);
        halo.addColorStop(0.72, `rgba(216, 178, 57, ${0.010 + energy.smoothedBeat * 0.040})`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);

        // RespiraciÃ³n cromÃ¡tica lenta.
        const breath = 0.5 + Math.sin(time * 0.11) * 0.5;
        const chroma = ctx.createLinearGradient(
          width * (0.10 + Math.sin(time * 0.045) * 0.08),
          0,
          width * (0.90 + Math.cos(time * 0.042) * 0.07),
          height
        );
        chroma.addColorStop(0, `rgba(38, 82, 112, ${0.012 + breath * 0.028})`);
        chroma.addColorStop(0.35, `rgba(48, 103, 86, ${0.010 + (1 - breath) * 0.026})`);
        chroma.addColorStop(0.72, `rgba(160, 118, 38, ${0.008 + breath * 0.020})`);
        chroma.addColorStop(1, `rgba(19, 46, 56, ${0.010 + (1 - breath) * 0.020})`);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = chroma;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }

      function drawGlowNodes(time) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (const node of glowNodes) {
          const bandEnergy = node.band === 0 ? energy.bass : node.band === 1 ? energy.mid : energy.high;
          const breathe = 0.82 + Math.sin(time * node.speed + node.phase) * 0.18;
          const radius = node.radius * (0.72 + bandEnergy * 1.65 + energy.smoothedBeat * (node.band === 0 ? 0.8 : 0.3)) * breathe;
          const alpha = (0.016 + bandEnergy * 0.15) * node.strength;

          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
          if (node.band === 0) {
            gradient.addColorStop(0, `rgba(226, 236, 202, ${alpha * 1.2})`);
            gradient.addColorStop(0.28, `rgba(77, 144, 132, ${alpha * 0.58})`);
          } else if (node.band === 1) {
            gradient.addColorStop(0, `rgba(124, 158, 128, ${alpha * 1.1})`);
            gradient.addColorStop(0.32, `rgba(70, 111, 91, ${alpha * 0.55})`);
          } else {
            gradient.addColorStop(0, `rgba(235, 207, 105, ${alpha * 1.08})`);
            gradient.addColorStop(0.35, `rgba(178, 127, 42, ${alpha * 0.42})`);
          }
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      function sampleTransferInfluence(radius) {
        if (!transferWaves.length) return 0;
        const band = Math.min(width, height) * 0.09;
        let influence = 0;
        for (const wave of transferWaves) {
          const falloff = Math.max(0, 1 - Math.abs(radius - wave.radius) / band);
          influence = Math.max(influence, falloff * wave.alpha * 2.4);
        }
        return clamp(influence, 0, 1);
      }

      function drawMainPulse(time) {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const minSize = Math.min(width, height);
        const baseRadius = minSize * (
          0.075 +
          energy.bass * 0.10 +
          energy.smoothedBeat * 0.065
        );

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Halos exteriores pulsantes.
        for (let layer = 0; layer < quality.haloLayers; layer++) {
          const layerRadius =
            baseRadius * (1 + layer * 0.42) +
            Math.sin(time * (0.25 + layer * 0.04) + layer) *
              minSize * 0.012;

          const alpha =
            (0.090 - layer * 0.014) *
            (0.55 + energy.overall * 1.28);

          const ring = ctx.createRadialGradient(
            cx,
            cy,
            layerRadius * 0.65,
            cx,
            cy,
            layerRadius * 1.22
          );

          ring.addColorStop(0, 'rgba(0,0,0,0)');
          ring.addColorStop(
            0.60,
            `rgba(184, 221, 196, ${alpha * 0.24})`
          );
          ring.addColorStop(
            0.77,
            `rgba(92, 142, 127, ${alpha * 0.42})`
          );
          ring.addColorStop(
            0.90,
            `rgba(158, 169, 99, ${alpha * 0.56})`
          );
          ring.addColorStop(
            0.98,
            `rgba(226, 188, 61, ${alpha * 0.32})`
          );
          ring.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = ring;
          ctx.beginPath();
          ctx.arc(cx, cy, layerRadius * 1.22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ecualizador radial completo.
        const bars = Math.round(
          clamp((width / 21) * quality.bars, 48, 108)
        );
        const innerR = baseRadius * 1.55;
        const outerBase = minSize * 0.06;
        const spectrumLength = frequencyData ? frequencyData.length : 0;
        const usefulSpectrum =
          spectrumLength > 0
            ? Math.max(4, Math.floor(spectrumLength * 0.43))
            : 0;

        ctx.save();

        for (let i = 0; i < bars; i++) {
          const p = i / bars;
          const angle = p * Math.PI * 2 - Math.PI / 2;

          // El espectro se refleja para que responda toda la circunferencia.
          const folded = p <= 0.5 ? p * 2 : (1 - p) * 2;

          let amp = 0.08 +
            Math.sin(time * 0.75 + p * Math.PI * 8) * 0.035;

          if (usefulSpectrum > 0) {
            const idx = Math.min(
              usefulSpectrum - 1,
              Math.floor(folded * (usefulSpectrum - 1))
            );

            const i0 = Math.max(0, idx - 2);
            const i1 = Math.max(0, idx - 1);
            const i2 = idx;
            const i3 = Math.min(usefulSpectrum - 1, idx + 1);
            const i4 = Math.min(usefulSpectrum - 1, idx + 2);

            amp = (
              frequencyData[i0] +
              frequencyData[i1] +
              frequencyData[i2] * 1.35 +
              frequencyData[i3] +
              frequencyData[i4]
            ) / (5.35 * 255);

            amp = clamp(
              amp * 0.82 +
              energy.overall * 0.10 +
              energy.smoothedBeat * 0.07,
              0,
              1
            );
          }

          const transferInfluence = sampleTransferInfluence(innerR + outerBase * 0.55);
          const len = outerBase * (
            0.35 +
            amp * 1.8 +
            energy.smoothedBeat * 0.22 +
            transferInfluence * 0.52
          );

          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * (innerR + len);
          const y2 = cy + Math.sin(angle) * (innerR + len);

          const barAlpha = 0.25 + amp * 0.58 + transferInfluence * 0.16;

          if (p < 0.25) {
            ctx.strokeStyle = `rgba(104, 181, 164, ${barAlpha})`;
          } else if (p < 0.5) {
            ctx.strokeStyle = `rgba(132, 167, 128, ${barAlpha})`;
          } else if (p < 0.75) {
            ctx.strokeStyle = `rgba(229, 190, 72, ${barAlpha})`;
          } else {
            ctx.strokeStyle = `rgba(173, 211, 169, ${barAlpha})`;
          }

          ctx.lineWidth = Math.max(1.2, minSize * 0.0020);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();

        // Ondas circulares deformadas por la mÃºsica.
        for (let layer = 0; layer < quality.waveLayers; layer++) {
          const radius = baseRadius * (2.0 + layer * 0.42);

          ctx.strokeStyle = layer === 0
            ? `rgba(232, 236, 207, ${0.18 + energy.mid * 0.18})`
            : layer === 1
              ? `rgba(112, 156, 131, ${0.14 + energy.high * 0.14})`
              : `rgba(221, 190, 82, ${0.10 + energy.overall * 0.12})`;

          ctx.lineWidth = Math.max(
            1.4,
            minSize * (0.0023 - layer * 0.00035)
          );

          ctx.beginPath();

          const points = quality.wavePoints;

          for (let i = 0; i <= points; i++) {
            const t = i === points ? 0 : (i / points);
            const angle = t * Math.PI * 2;

            let amp = 0;
            if (frequencyData && frequencyData.length) {
              const samplePos = t * frequencyData.length;
              const idx0 = Math.floor(samplePos) % frequencyData.length;
              const idx1 = (idx0 + 1) % frequencyData.length;
              const frac = samplePos - Math.floor(samplePos);

              const a0 = frequencyData[idx0] / 255;
              const a1 = frequencyData[idx1] / 255;
              amp = lerp(a0, a1, frac);
            }

            const waveform =
              Math.sin(angle * 4 + time * 0.45 + layer) *
                energy.mid *
                minSize *
                0.010 +
              Math.sin(
                angle * 10 -
                time * 0.62 +
                layer * 0.7
              ) *
                energy.high *
                minSize *
                0.006 +
              amp *
                minSize *
                (0.010 + layer * 0.0025);

            const r = radius + waveform;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.closePath();
          ctx.stroke();
        }

        // Cono/altavoz central pulsante.
        // Se conserva el efecto, pero se elimina el pequeÃ±o disco blanco
        // que antes quedaba visible detrÃ¡s del cubo.
        const outerSpeaker = baseRadius * 0.95;
        const innerSpeaker = outerSpeaker * 0.62;

        const cone = ctx.createRadialGradient(
          cx,
          cy,
          innerSpeaker * 0.1,
          cx,
          cy,
          outerSpeaker * 1.35
        );

        cone.addColorStop(
          0,
          `rgba(255,255,255, ${0.20 + energy.overall * 0.16})`
        );
        cone.addColorStop(
          0.10,
          `rgba(236, 224, 154, ${0.25 + energy.bass * 0.22})`
        );
        cone.addColorStop(
          0.35,
          `rgba(86, 139, 122, ${0.22 + energy.mid * 0.18})`
        );
        cone.addColorStop(
          0.70,
          `rgba(104, 132, 79, ${0.18 + energy.high * 0.15})`
        );
        cone.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.arc(cx, cy, outerSpeaker * 1.35, 0, Math.PI * 2);
        ctx.fill();

        /*
          Eliminado intencionadamente:
          el cÃ­rculo blanco sÃ³lido que se dibujaba aquÃ­.
        */

        ctx.restore();
      }







      function drawBackdropWaveform(time) {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const minSize = Math.min(width, height);

        const barsPerSide = compactDevice ? 10 : 14;
        const gap = clamp(minSize * 0.132, 88, 130);
        const sideSpan = clamp(width * 0.16, 120, 205);
        const barSpacing = sideSpan / Math.max(1, barsPerSide - 0.15);
        const barWidth = Math.max(1.6, Math.min(3.7, barSpacing * 0.14));

        const baseHeight = Math.max(4.5, minSize * 0.014);
        const maxExtraHeight = clamp(minSize * 0.145, 42, 96);

        const spectrumLength = frequencyData ? frequencyData.length : 0;
        const usefulSpectrum =
          spectrumLength > 0
            ? Math.max(18, Math.floor(spectrumLength * 0.62))
            : 0;

        function sampleAmplitude(p) {
          let amp = 0.08;

          if (usefulSpectrum > 0) {
            const idx = Math.min(
              usefulSpectrum - 1,
              Math.floor(p * (usefulSpectrum - 1))
            );

            const i0 = Math.max(0, idx - 1);
            const i1 = idx;
            const i2 = Math.min(usefulSpectrum - 1, idx + 1);

            amp = (
              frequencyData[i0] * 0.80 +
              frequencyData[i1] * 1.85 +
              frequencyData[i2] * 0.80
            ) / (3.45 * 255);
          }

          const rhythmicLift =
            energy.smoothedBeat * 0.24 +
            energy.overall * 0.10 +
            Math.max(0, Math.sin(time * 4.1 + p * 8.0)) * 0.05;

          return clamp(amp * 0.98 + rhythmicLift, 0, 1);
        }

        function drawHalf(side) {
          const startX = side < 0 ? cx - gap : cx + gap;
          const direction = side < 0 ? -1 : 1;

          const strokeGradient = ctx.createLinearGradient(
            startX,
            cy,
            startX + direction * sideSpan,
            cy
          );
          strokeGradient.addColorStop(0, 'rgba(255, 233, 154, 0.14)');
          strokeGradient.addColorStop(0.18, 'rgba(244, 203, 76, 0.34)');
          strokeGradient.addColorStop(0.50, 'rgba(232, 189, 62, 0.50)');
          strokeGradient.addColorStop(0.84, 'rgba(190, 214, 184, 0.18)');
          strokeGradient.addColorStop(1, 'rgba(165, 205, 195, 0.05)');

          const glowGradient = ctx.createLinearGradient(
            startX,
            cy,
            startX + direction * sideSpan,
            cy
          );
          glowGradient.addColorStop(0, 'rgba(255, 219, 96, 0.00)');
          glowGradient.addColorStop(0.24, 'rgba(240, 200, 80, 0.08)');
          glowGradient.addColorStop(0.50, 'rgba(226, 182, 56, 0.13)');
          glowGradient.addColorStop(0.86, 'rgba(171, 206, 188, 0.05)');
          glowGradient.addColorStop(1, 'rgba(160, 201, 190, 0.00)');

          for (let i = 0; i < barsPerSide; i++) {
            const p = i / Math.max(1, barsPerSide - 1);

            const centerEnvelope = Math.pow(1 - p, 1.20);
            const amp = sampleAmplitude(p);

            const beatSwing =
              0.10 +
              energy.smoothedBeat * 0.34 +
              Math.sin(time * 4.6 + i * 0.92 + side * 0.55) * 0.06;

            const h = clamp(
              baseHeight +
                maxExtraHeight *
                  (
                    centerEnvelope * 0.58 +
                    amp * 1.20 +
                    beatSwing * 0.24
                  ),
              baseHeight,
              baseHeight + maxExtraHeight
            );

            const x =
              startX +
              direction * (i * barSpacing + barSpacing * 0.46);

            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            // halo sutil, mÃ¡s transparente
            ctx.strokeStyle = glowGradient;
            ctx.lineWidth = Math.max(3.0, barWidth * 1.95);
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.10 + amp * 0.12;
            ctx.beginPath();
            ctx.moveTo(x, cy - h * 0.52);
            ctx.lineTo(x, cy + h * 0.52);
            ctx.stroke();

            // barra principal, algo mÃ¡s limpia y transparente
            ctx.strokeStyle = strokeGradient;
            ctx.lineWidth = barWidth;
            ctx.globalAlpha = 0.28 + amp * 0.28;
            ctx.beginPath();
            ctx.moveTo(x, cy - h * 0.50);
            ctx.lineTo(x, cy + h * 0.50);
            ctx.stroke();

            // nÃºcleo luminoso pequeÃ±o
            ctx.strokeStyle = 'rgba(255, 246, 198, 0.24)';
            ctx.lineWidth = Math.max(0.9, barWidth * 0.30);
            ctx.globalAlpha = 0.08 + amp * 0.10;
            ctx.beginPath();
            ctx.moveTo(x, cy - h * 0.16);
            ctx.lineTo(x, cy + h * 0.16);
            ctx.stroke();

            ctx.restore();
          }
        }

        ctx.save();
        drawHalf(-1);
        drawHalf(1);
        ctx.restore();
      }


      const cubeTextureSize = compactDevice ? 160 : 224;
      const cubeSurfaceCanvas = document.createElement('canvas');
      const cubeSurfaceCtx = cubeSurfaceCanvas.getContext('2d');
      const cubeNoiseCanvas = document.createElement('canvas');
      const cubeNoiseCtx = cubeNoiseCanvas.getContext('2d');
      cubeSurfaceCanvas.width = cubeSurfaceCanvas.height = cubeTextureSize;
      cubeNoiseCanvas.width = cubeNoiseCanvas.height = cubeTextureSize;

      let cubeTextureTimestamp = -Infinity;

      const cubeCloudSeeds = Array.from({ length: compactDevice ? 10 : 16 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        radius: random(.09, .27),
        phase: random(0, Math.PI * 2),
        speed: random(.12, .35),
        bright: i % 3 !== 0
      }));

      (function buildCubeNoise() {
        const image = cubeNoiseCtx.createImageData(cubeTextureSize, cubeTextureSize);
        for (let i = 0; i < image.data.length; i += 4) {
          const value = Math.floor(Math.random() * 255);
          image.data[i] = value;
          image.data[i + 1] = value;
          image.data[i + 2] = value;
          image.data[i + 3] = Math.floor(random(14, 58));
        }
        cubeNoiseCtx.putImageData(image, 0, 0);
      })();

      function updateCubeTexture(time) {
        if (time - cubeTextureTimestamp < (compactDevice ? 0.18 : 0.12)) return;
        cubeTextureTimestamp = time;

        const tctx = cubeSurfaceCtx;
        const size = cubeTextureSize;

        tctx.clearRect(0, 0, size, size);

        const base = tctx.createLinearGradient(0, 0, size, size);
        base.addColorStop(0, '#fff8a8');
        base.addColorStop(.18, '#ffe04d');
        base.addColorStop(.52, '#eaa918');
        base.addColorStop(.78, '#ffd62f');
        base.addColorStop(1, '#9b5807');
        tctx.fillStyle = base;
        tctx.fillRect(0, 0, size, size);

        tctx.save();
        tctx.filter = 'blur(17px)';
        for (const seed of cubeCloudSeeds) {
          const driftX = Math.sin(time * seed.speed + seed.phase) * size * .11;
          const driftY = Math.cos(time * seed.speed * .73 + seed.phase) * size * .09;
          const x = seed.x * size + driftX;
          const y = seed.y * size + driftY;
          const r = seed.radius * size * (1 + Math.sin(time * .4 + seed.phase) * .12);

          const cloud = tctx.createRadialGradient(x, y, 0, x, y, r);
          if (seed.bright) {
            cloud.addColorStop(0, 'rgba(255,255,225,.66)');
            cloud.addColorStop(.36, 'rgba(255,235,120,.30)');
            cloud.addColorStop(1, 'rgba(255,190,30,0)');
            tctx.globalCompositeOperation = 'screen';
          } else {
            cloud.addColorStop(0, 'rgba(118,61,2,.34)');
            cloud.addColorStop(.46, 'rgba(161,83,3,.17)');
            cloud.addColorStop(1, 'rgba(100,45,0,0)');
            tctx.globalCompositeOperation = 'multiply';
          }

          tctx.fillStyle = cloud;
          tctx.beginPath();
          tctx.arc(x, y, r, 0, Math.PI * 2);
          tctx.fill();
        }
        tctx.restore();

        tctx.save();
        tctx.globalCompositeOperation = 'screen';
        const innerLight = tctx.createRadialGradient(
          size * (.44 + Math.sin(time * .23) * .035),
          size * (.39 + Math.cos(time * .19) * .03),
          size * .02,
          size * .48,
          size * .46,
          size * .55
        );
        innerLight.addColorStop(0, 'rgba(255,255,244,.75)');
        innerLight.addColorStop(.25, 'rgba(255,246,167,.39)');
        innerLight.addColorStop(.72, 'rgba(255,205,45,.12)');
        innerLight.addColorStop(1, 'rgba(255,190,20,0)');
        tctx.fillStyle = innerLight;
        tctx.fillRect(0, 0, size, size);
        tctx.restore();

        tctx.save();
        tctx.globalCompositeOperation = 'overlay';
        tctx.globalAlpha = .16;
        tctx.drawImage(cubeNoiseCanvas, 0, 0);
        tctx.restore();

        tctx.save();
        tctx.globalCompositeOperation = 'screen';
        tctx.globalAlpha = .20;
        tctx.lineWidth = 1.2;
        for (let i = 0; i < 11; i++) {
          const y = size * (.10 + i * .079) + Math.sin(time * .38 + i) * 5;
          tctx.strokeStyle = `rgba(255,249,196,${.08 + (i % 3) * .025})`;
          tctx.beginPath();
          tctx.moveTo(-20, y + 18);
          tctx.bezierCurveTo(size * .28, y - 14, size * .68, y + 20, size + 24, y - 8);
          tctx.stroke();
        }
        tctx.restore();

        const glaze = tctx.createLinearGradient(0, 0, size, size);
        glaze.addColorStop(0, 'rgba(255,255,255,.24)');
        glaze.addColorStop(.22, 'rgba(255,255,255,.03)');
        glaze.addColorStop(.65, 'rgba(104,49,0,.05)');
        glaze.addColorStop(1, 'rgba(53,21,0,.18)');
        tctx.fillStyle = glaze;
        tctx.fillRect(0, 0, size, size);
      }

      function drawMappedTriangle(image, source, destination, alpha = 1) {
        const [s0, s1, s2] = source;
        const [d0, d1, d2] = destination;

        const denom =
          s0.x * (s1.y - s2.y) +
          s1.x * (s2.y - s0.y) +
          s2.x * (s0.y - s1.y);

        if (Math.abs(denom) < 0.0001) return;

        const a = (
          d0.x * (s1.y - s2.y) +
          d1.x * (s2.y - s0.y) +
          d2.x * (s0.y - s1.y)
        ) / denom;

        const c = (
          d0.x * (s2.x - s1.x) +
          d1.x * (s0.x - s2.x) +
          d2.x * (s1.x - s0.x)
        ) / denom;

        const e = (
          d0.x * (s1.x * s2.y - s2.x * s1.y) +
          d1.x * (s2.x * s0.y - s0.x * s2.y) +
          d2.x * (s0.x * s1.y - s1.x * s0.y)
        ) / denom;

        const b = (
          d0.y * (s1.y - s2.y) +
          d1.y * (s2.y - s0.y) +
          d2.y * (s0.y - s1.y)
        ) / denom;

        const d = (
          d0.y * (s2.x - s1.x) +
          d1.y * (s0.x - s2.x) +
          d2.y * (s1.x - s0.x)
        ) / denom;

        const f = (
          d0.y * (s1.x * s2.y - s2.x * s1.y) +
          d1.y * (s2.x * s0.y - s0.x * s2.y) +
          d2.y * (s0.x * s1.y - s1.x * s0.y)
        ) / denom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(d0.x, d0.y);
        ctx.lineTo(d1.x, d1.y);
        ctx.lineTo(d2.x, d2.y);
        ctx.closePath();
        ctx.clip();
        ctx.globalAlpha = alpha;
        ctx.setTransform(a * dpr, b * dpr, c * dpr, d * dpr, e * dpr, f * dpr);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
      }

      function drawMappedQuad(image, points, alpha) {
        const s = cubeTextureSize;
        drawMappedTriangle(
          image,
          [{x:0,y:0}, {x:s,y:0}, {x:s,y:s}],
          [points[0], points[1], points[2]],
          alpha
        );
        drawMappedTriangle(
          image,
          [{x:0,y:0}, {x:s,y:s}, {x:0,y:s}],
          [points[0], points[2], points[3]],
          alpha
        );
      }


      function drawEidosCube(time) {
        updateCubeTexture(time);

        const cx = width * .5;
        const cy = height * .5;
        const minSize = Math.min(width, height);
        const pulse = 1 + energy.bass * .035 + energy.smoothedBeat * .022;

        const rotY = time * .23;
        const rotX = -.57 + Math.sin(time * .18) * .035;
        const rotZ = Math.sin(time * .12) * .018;

        const sy = Math.sin(rotY), cyRot = Math.cos(rotY);
        const sx = Math.sin(rotX), cxRot = Math.cos(rotX);
        const sz = Math.sin(rotZ), czRot = Math.cos(rotZ);

        const camera = 4.7;
        const focal = clamp(minSize * .255, 92, 220) * pulse;

        const base = [
          [-1,-1,-1], [ 1,-1,-1], [ 1, 1,-1], [-1, 1,-1],
          [-1,-1, 1], [ 1,-1, 1], [ 1, 1, 1], [-1, 1, 1]
        ];

        const vertices = base.map(([x, y, z]) => {
          let px = x;
          let py = y;
          let pz = z;

          const yx = px * cyRot - pz * sy;
          const yz = px * sy + pz * cyRot;
          px = yx;
          pz = yz;

          const xx = py * cxRot - pz * sx;
          const xz = py * sx + pz * cxRot;
          py = xx;
          pz = xz;

          const zx = px * czRot - py * sz;
          const zy = px * sz + py * czRot;
          px = zx;
          py = zy;

          const perspective = focal / (camera - pz);

          return {
            x3: px,
            y3: py,
            z3: pz,
            x: cx + px * perspective,
            y: cy + py * perspective
          };
        });

        const faces = [
          { idx:[4,5,6,7] },
          { idx:[1,0,3,2] },
          { idx:[5,1,2,6] },
          { idx:[0,4,7,3] },
          { idx:[0,1,5,4] },
          { idx:[7,6,2,3] }
        ];

        const light = { x:-.43, y:-.58, z:.69 };
        const lightLen = Math.hypot(light.x, light.y, light.z);
        light.x /= lightLen;
        light.y /= lightLen;
        light.z /= lightLen;

        function faceData(face) {
          const pts = face.idx.map(i => vertices[i]);
          const a = pts[0], b = pts[1], c = pts[2];

          const ux = b.x3 - a.x3;
          const uy = b.y3 - a.y3;
          const uz = b.z3 - a.z3;
          const vx = c.x3 - a.x3;
          const vy = c.y3 - a.y3;
          const vz = c.z3 - a.z3;

          let nx = uy * vz - uz * vy;
          let ny = uz * vx - ux * vz;
          let nz = ux * vy - uy * vx;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          nx /= nLen;
          ny /= nLen;
          nz /= nLen;

          const depth = pts.reduce((sum, p) => sum + p.z3, 0) / pts.length;
          const centerX = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
          const centerY = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
          const lambert = Math.max(0, nx * light.x + ny * light.y + nz * light.z);

          return {
            pts,
            nx, ny, nz,
            depth,
            centerX,
            centerY,
            lambert,
            visible: nz > .035
          };
        }

        const visibleFaces = faces
          .map(faceData)
          .filter(face => face.visible)
          .sort((a, b) => a.depth - b.depth);

        ctx.save();

        ctx.globalCompositeOperation = 'screen';
        const haloRadius = clamp(minSize * .15, 72, 150) * pulse;
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloRadius);
        halo.addColorStop(0, `rgba(255,240,128,${.18 + energy.overall * .08})`);
        halo.addColorStop(.25, `rgba(255,208,45,${.10 + energy.bass * .06})`);
        halo.addColorStop(.60, `rgba(236,157,18,${.035 + energy.smoothedBeat * .028})`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        const core = ctx.createRadialGradient(cx - 9, cy - 12, 2, cx, cy, haloRadius * .58);
        core.addColorStop(0, `rgba(255,255,244,${.24 + energy.bass * .08})`);
        core.addColorStop(.28, `rgba(255,239,132,${.14 + energy.overall * .05})`);
        core.addColorStop(.72, 'rgba(255,184,27,.03)');
        core.addColorStop(1, 'rgba(255,164,0,0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, haloRadius * .58, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        for (const face of visibleFaces) {
          const shade = .62 + face.lambert * .34;
          const alpha = clamp(shade + energy.overall * .05, .44, .85);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(face.pts[0].x, face.pts[0].y);
          for (let i = 1; i < face.pts.length; i++) {
            ctx.lineTo(face.pts[i].x, face.pts[i].y);
          }
          ctx.closePath();

          const underpaint = ctx.createLinearGradient(
            face.centerX - focal * .18,
            face.centerY - focal * .18,
            face.centerX + focal * .22,
            face.centerY + focal * .22
          );
          underpaint.addColorStop(0, `rgba(255,244,160,${.18 * shade})`);
          underpaint.addColorStop(.45, `rgba(255,198,34,${.38 * shade})`);
          underpaint.addColorStop(1, `rgba(112,54,1,${.30 * shade})`);
          ctx.fillStyle = underpaint;
          ctx.fill();
          ctx.restore();

          drawMappedQuad(cubeSurfaceCanvas, face.pts, alpha);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(face.pts[0].x, face.pts[0].y);
          for (let i = 1; i < face.pts.length; i++) {
            ctx.lineTo(face.pts[i].x, face.pts[i].y);
          }
          ctx.closePath();
          ctx.clip();

          const faceMinX = Math.min(...face.pts.map(p => p.x));
          const faceMaxX = Math.max(...face.pts.map(p => p.x));
          const faceMinY = Math.min(...face.pts.map(p => p.y));
          const faceMaxY = Math.max(...face.pts.map(p => p.y));

          const reflection = ctx.createLinearGradient(faceMinX, faceMinY, faceMaxX, faceMaxY);
          reflection.addColorStop(0, `rgba(255,255,245,${.14 * face.lambert + .025})`);
          reflection.addColorStop(.24, 'rgba(255,255,255,.012)');
          reflection.addColorStop(.78, 'rgba(88,35,0,.035)');
          reflection.addColorStop(1, `rgba(52,18,0,${.10 * (1 - face.lambert)})`);
          ctx.fillStyle = reflection;
          ctx.fillRect(faceMinX - 4, faceMinY - 4, faceMaxX - faceMinX + 8, faceMaxY - faceMinY + 8);

          const movingGlint = ctx.createRadialGradient(
            face.centerX - focal * (.08 + Math.sin(time * .31) * .03),
            face.centerY - focal * (.10 + Math.cos(time * .27) * .03),
            0,
            face.centerX,
            face.centerY,
            Math.max(12, focal * .19)
          );
          movingGlint.addColorStop(0, `rgba(255,255,246,${.08 + face.lambert * .07})`);
          movingGlint.addColorStop(.42, 'rgba(255,243,170,.025)');
          movingGlint.addColorStop(1, 'rgba(255,210,70,0)');
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = movingGlint;
          ctx.fillRect(faceMinX - 6, faceMinY - 6, faceMaxX - faceMinX + 12, faceMaxY - faceMinY + 12);
          ctx.restore();
        }

        const highlightVertexIndex = vertices.reduce(
          (bestIndex, vertex, index) => {
            const best = vertices[bestIndex];
            return (
              vertex.y < best.y ||
              (vertex.y === best.y && vertex.z3 > best.z3)
            ) ? index : bestIndex;
          },
          0
        );

        if (cubeSparkState.currentVertex < 0) {
          cubeSparkState.currentVertex = highlightVertexIndex;
          cubeSparkState.transitionStart = time - cubeSparkState.transitionDuration;
        } else if (highlightVertexIndex !== cubeSparkState.currentVertex) {
          cubeSparkState.previousVertex = cubeSparkState.currentVertex;
          cubeSparkState.currentVertex = highlightVertexIndex;
          cubeSparkState.transitionStart = time;
        }

        const rawTransition = clamp(
          (time - cubeSparkState.transitionStart) /
            cubeSparkState.transitionDuration,
          0,
          1
        );
        const transition =
          rawTransition * rawTransition * (3 - 2 * rawTransition);
        const sparkRadius = clamp(minSize * .018, 8, 16);

        function drawVertexSpark(vertexIndex, alpha) {
          if (vertexIndex < 0 || alpha <= 0.002) return;

          const vertex = vertices[vertexIndex];
          const spark = ctx.createRadialGradient(
            vertex.x,
            vertex.y,
            0,
            vertex.x,
            vertex.y,
            sparkRadius
          );
          spark.addColorStop(0, `rgba(255,255,255,${.40 * alpha})`);
          spark.addColorStop(.24, `rgba(255,248,176,${.18 * alpha})`);
          spark.addColorStop(1, 'rgba(255,194,27,0)');
          ctx.fillStyle = spark;
          ctx.beginPath();
          ctx.arc(vertex.x, vertex.y, sparkRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (cubeSparkState.previousVertex >= 0 && transition < 1) {
          drawVertexSpark(
            cubeSparkState.previousVertex,
            1 - transition
          );
        }

        drawVertexSpark(cubeSparkState.currentVertex, transition);

        if (transition >= 1) {
          cubeSparkState.previousVertex = -1;
        }

        ctx.restore();
      }

      function drawSingleSideCover(
        image,
        x,
        y,
        drawWidth,
        drawHeight,
        alpha,
        rotation,
        glow,
        transparentArtwork = false
      ) {
        if (!image.complete || !image.naturalWidth || alpha <= 0.005) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        const halfW = drawWidth * 0.5;
        const halfH = drawHeight * 0.5;

        ctx.globalCompositeOperation = 'screen';
        const panelGlow = ctx.createRadialGradient(0, 0, drawWidth * 0.10, 0, 0, drawWidth * 0.84);
        panelGlow.addColorStop(0, `rgba(255, 219, 94, ${alpha * 0.14 + glow * 0.08})`);
        panelGlow.addColorStop(0.48, `rgba(111, 162, 144, ${alpha * 0.10})`);
        panelGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = panelGlow;
        ctx.fillRect(-drawWidth * 0.75, -drawHeight * 0.72, drawWidth * 1.5, drawHeight * 1.44);

        ctx.globalCompositeOperation = 'source-over';
        if (!transparentArtwork) {
          ctx.globalAlpha = alpha * 0.22;
          ctx.fillStyle = 'rgba(5, 16, 14, 0.90)';
          roundedRect(-halfW - 10, -halfH - 10, drawWidth + 20, drawHeight + 20, 18);
          ctx.fill();
        }

        ctx.globalAlpha = alpha * 0.94;
        ctx.shadowColor = `rgba(255, 211, 82, ${0.24 + glow * 0.18})`;
        ctx.shadowBlur = drawWidth * (0.06 + glow * 0.05);
        ctx.drawImage(image, -halfW, -halfH, drawWidth, drawHeight);

        if (!transparentArtwork) {
          ctx.globalAlpha = alpha * 0.30;
          const vignette = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
          vignette.addColorStop(0, 'rgba(255,255,255,0.20)');
          vignette.addColorStop(0.26, 'rgba(255,255,255,0.02)');
          vignette.addColorStop(0.72, 'rgba(10,20,18,0.02)');
          vignette.addColorStop(1, 'rgba(0,0,0,0.28)');
          ctx.fillStyle = vignette;
          ctx.fillRect(-halfW, -halfH, drawWidth, drawHeight);

          ctx.globalAlpha = alpha * 0.16;
          ctx.strokeStyle = 'rgba(239, 228, 195, 0.85)';
          ctx.lineWidth = 1.1;
          ctx.strokeRect(-halfW + 0.5, -halfH + 0.5, drawWidth - 1, drawHeight - 1);
        }
        ctx.restore();
      }

      function drawSideCovers(time, dt) {
        const active = time < sideCoverState.holdUntil;
        if (active) {
          const target = Math.max(sideCoverState.alpha, sideCoverState.maxAlpha);
          sideCoverState.alpha = lerp(sideCoverState.alpha, target, 0.15);
        } else {
          /*
            Fade mÃ¡s breve: recupera el impacto de apariciÃ³n. Si llega otro
            golpe durante el fade, triggerSideCovers lo reinicia.
          */
          sideCoverState.alpha = Math.max(0, sideCoverState.alpha - dt / 3.0);
          sideCoverState.maxAlpha = Math.max(0, sideCoverState.maxAlpha - dt * 0.095);
        }
        sideCoverState.pulse = Math.max(0, sideCoverState.pulse - dt * 0.7);

        const alpha = sideCoverState.alpha * (compactDevice ? 0.72 : 0.92);
        if (alpha <= 0.008) return;

        const minSize = Math.min(width, height);
        const coverHeight = clamp(minSize * (compactDevice ? 0.40 : 0.52), 180, compactDevice ? 260 : 430);
        const narrowCovers = width <= 650;
        const collectionHeight = coverHeight * (narrowCovers ? 1.05 : 1.14);
        const collectionAspect = collectionImage.naturalWidth && collectionImage.naturalHeight
          ? collectionImage.naturalWidth / collectionImage.naturalHeight
          : 0.67;
        const collectionWidth = collectionHeight * collectionAspect;
        const essayHeight = coverHeight * (narrowCovers ? 0.88 : 0.92);
        const essayWidth = essayHeight * 0.63;
        const sideOffset = clamp(
          width * (compactDevice ? 0.25 : 0.22),
          Math.max(collectionWidth, essayWidth) * 0.72,
          width * 0.29
        );
        const cx = width * 0.5;
        const y = height * 0.52 + Math.sin(time * 0.22) * 8;
        const glow = clamp(energy.high * 0.65 + energy.smoothedBeat * 0.55 + sideCoverState.pulse * 0.28, 0, 1);
        const spread = Math.sin(time * 0.17) * minSize * 0.012;

        // La ficciÃ³n se presenta como una Ãºnica composiciÃ³n transparente a la
        // izquierda. Ensayos ocupa el lado derecho y el cubo queda despejado.
        drawSingleSideCover(
          collectionImage,
          cx - sideOffset - spread,
          y,
          collectionWidth,
          collectionHeight,
          alpha,
          -0.025 - Math.sin(time * 0.19) * 0.006,
          glow,
          true
        );

        drawSingleSideCover(
          essayImage,
          cx + sideOffset + spread,
          y,
          essayWidth,
          essayHeight,
          alpha,
          0.030 + Math.cos(time * 0.17) * 0.006,
          glow
        );
      }

      function drawTransferWaves(time, dt) {
        if (!transferWaves.length) return;
        const cx = width * 0.5;
        const cy = height * 0.5;
        const minSize = Math.min(width, height);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = transferWaves.length - 1; i >= 0; i--) {
          const wave = transferWaves[i];
          wave.age += dt;
          wave.radius += wave.speed * dt;
          wave.alpha *= Math.pow(0.58, dt);

          const lifeT = wave.age / wave.life;
          const alpha = Math.max(0, wave.alpha * (1 - lifeT));
          if (lifeT >= 1 || alpha < 0.008) {
            transferWaves.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(239, 205, 95, ${alpha * 0.85})`;
          ctx.lineWidth = wave.thickness + (1 - lifeT) * 1.5;
          ctx.beginPath();

          const points = Math.max(64, quality.wavePoints);
          for (let p = 0; p <= points; p++) {
            const angle = (p / points) * Math.PI * 2;
            const wobble =
              Math.sin(angle * 6 - time * 2.8 + i) * minSize * 0.0038 * (0.35 + energy.mid) +
              Math.cos(angle * 11 + time * 2.2) * minSize * 0.0018 * (0.25 + energy.high);
            const r = wave.radius + wobble;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (p === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      }

      function drawDataFilaments(time, dt) {
        if (!dataFilaments.length) return;
        const cx = width * 0.5;
        const cy = height * 0.5;
        const minSize = Math.min(width, height);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.lineCap = 'round';

        for (let i = dataFilaments.length - 1; i >= 0; i--) {
          const filament = dataFilaments[i];
          filament.age += dt;
          const lifeT = filament.age / filament.life;

          if (lifeT >= 1) {
            dataFilaments.splice(i, 1);
            continue;
          }

          const appear = clamp(lifeT / 0.18, 0, 1);
          const disappear = clamp((1 - lifeT) / 0.34, 0, 1);
          const alpha = filament.alpha * Math.min(appear, disappear);

          const endX = filament.targetX;
          const endY = filament.targetY;
          const bendAmount = minSize * 0.08 * filament.bend;
          const ctrl1X = cx + (endX - cx) * 0.28 + bendAmount;
          const ctrl1Y = cy + (endY - cy) * 0.18 - bendAmount * 0.35;
          const ctrl2X = cx + (endX - cx) * 0.68 - bendAmount * 0.55;
          const ctrl2Y = cy + (endY - cy) * 0.78 + bendAmount * 0.18;

          ctx.strokeStyle = `rgba(245, 216, 110, ${alpha * 0.62})`;
          ctx.lineWidth = Math.max(1, minSize * 0.0016);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
          ctx.stroke();

          ctx.strokeStyle = `rgba(222, 240, 215, ${alpha * 0.46})`;
          ctx.lineWidth = Math.max(0.7, minSize * 0.0008);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
          ctx.stroke();

          const headX = cx + (endX - cx) * appear;
          const headY = cy + (endY - cy) * appear;
          ctx.fillStyle = `rgba(255, 247, 190, ${alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(headX, headY, Math.max(1.1, minSize * 0.0026), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      function drawConstellations(time, dt) {
        if (!constellations.length) return;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.lineCap = 'round';

        for (let i = constellations.length - 1; i >= 0; i--) {
          const cluster = constellations[i];
          cluster.age += dt;
          const lifeT = cluster.age / cluster.life;

          if (lifeT >= 1) {
            constellations.splice(i, 1);
            continue;
          }

          const alpha = cluster.alpha * Math.sin(Math.min(1, lifeT) * Math.PI);
          if (alpha <= 0.002) continue;

          for (const [a, b] of cluster.links) {
            const n1 = cluster.nodes[a];
            const n2 = cluster.nodes[b];
            const offset1X = Math.sin(time * 0.55 + a) * n1.driftX * lifeT;
            const offset1Y = Math.cos(time * 0.48 + a) * n1.driftY * lifeT;
            const offset2X = Math.sin(time * 0.55 + b) * n2.driftX * lifeT;
            const offset2Y = Math.cos(time * 0.48 + b) * n2.driftY * lifeT;

            ctx.strokeStyle = `rgba(187, 223, 204, ${alpha * 0.55})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n1.x + offset1X, n1.y + offset1Y);
            ctx.lineTo(n2.x + offset2X, n2.y + offset2Y);
            ctx.stroke();
          }

          for (let n = 0; n < cluster.nodes.length; n++) {
            const node = cluster.nodes[n];
            const offsetX = Math.sin(time * 0.55 + n) * node.driftX * lifeT;
            const offsetY = Math.cos(time * 0.48 + n) * node.driftY * lifeT;

            ctx.fillStyle = `rgba(248, 233, 151, ${alpha * 0.84})`;
            ctx.beginPath();
            ctx.arc(node.x + offsetX, node.y + offsetY, node.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      function drawPeakStars(time, dt) {
        if (!peakStars.length) return;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = peakStars.length - 1; i >= 0; i--) {
          const s = peakStars[i];
          s.age += dt;
          const lifeT = s.age / s.life;
          if (lifeT >= 1) {
            peakStars.splice(i, 1);
            continue;
          }

          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vx *= Math.pow(0.55, dt);
          s.vy *= Math.pow(0.55, dt);

          const alpha = (1 - lifeT) * (0.55 + Math.sin(time * 12 + s.twinkle) * 0.18);
          const size = s.size * (1 + lifeT * 1.4);

          let colorA, colorB;
          switch (s.hueBand) {
            case 0: colorA = [232, 238, 205]; colorB = [78, 145, 133]; break;
            case 1: colorA = [126, 160, 131]; colorB = [217, 186, 81]; break;
            case 2: colorA = [234, 202, 87]; colorB = [175, 143, 62]; break;
            default: colorA = [167, 205, 161]; colorB = [239, 215, 128]; break;
          }

          ctx.fillStyle = `rgba(${colorA[0]}, ${colorA[1]}, ${colorA[2]}, ${alpha * 0.62})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, Math.max(0.8, size * 0.72), 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(${colorB[0]}, ${colorB[1]}, ${colorB[2]}, ${alpha * 0.70})`;
          ctx.lineWidth = Math.max(0.8, size * 0.45);
          ctx.beginPath();
          ctx.moveTo(s.x - size * 1.8, s.y);
          ctx.lineTo(s.x + size * 1.8, s.y);
          ctx.moveTo(s.x, s.y - size * 1.8);
          ctx.lineTo(s.x, s.y + size * 1.8);
          ctx.stroke();
        }

        ctx.restore();
      }

      function drawParticles(time, dt) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const cx = width * 0.5;
        const cy = height * 0.5;
        for (const particle of particles) {
          const bandEnergy = particle.band === 0 ? energy.bass : particle.band === 1 ? energy.mid : energy.high;
          particle.x += particle.driftX * dt * 60;
          particle.y += particle.driftY * dt * 60;

          if (particle.x < -8) particle.x = width + 8;
          if (particle.x > width + 8) particle.x = -8;
          if (particle.y < -8) particle.y = height + 8;
          if (particle.y > height + 8) particle.y = -8;

          const dx = particle.x - cx;
          const dy = particle.y - cy;
          const distance = Math.hypot(dx, dy) || 1;
          const push = energy.smoothedBeat * 0.22;
          particle.x += (dx / distance) * push;
          particle.y += (dy / distance) * push;

          let transferLift = 0;
          for (const wave of transferWaves) {
            const diff = Math.abs(distance - wave.radius);
            const band = Math.min(width, height) * 0.035;
            if (diff < band) {
              const influence = (1 - diff / band) * wave.alpha * 3.2;
              particle.x += (dx / distance) * influence * 1.6;
              particle.y += (dy / distance) * influence * 1.6;
              transferLift = Math.max(transferLift, influence);
            }
          }

          const flicker = 0.72 + Math.sin(time * 0.55 + particle.phase) * 0.28;
          const alpha = particle.alpha * flicker * (0.55 + bandEnergy * 1.9 + transferLift * 0.8);
          const radius = particle.radius * (0.9 + bandEnergy * 1.6 + energy.smoothedBeat * 0.25 + transferLift * 0.18);

          let color;
          if (particle.band === 0) color = `rgba(221, 234, 202, ${alpha})`;
          else if (particle.band === 1) color = `rgba(125, 162, 132, ${alpha})`;
          else color = `rgba(224, 193, 91, ${alpha})`;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      function drawRipples(dt) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = ripples.length - 1; i >= 0; i--) {
          const ripple = ripples[i];
          ripple.radius += ripple.speed * dt;
          ripple.alpha *= Math.pow(0.26, dt);

          ctx.strokeStyle = `rgba(181, 202, 139, ${ripple.alpha * 0.82})`;
          ctx.lineWidth = Math.max(1.0, Math.min(width, height) * 0.0018);
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (ripple.alpha < 0.006) ripples.splice(i, 1);
        }

        ctx.restore();
      }

      function render(now) {
        if (document.hidden) {
          lastFrame = now;
          requestAnimationFrame(render);
          return;
        }

        const dt = Math.min((now - lastFrame) / 1000, 0.1);
        lastFrame = now;
        const time = now / 1000;

        if (running && !audio.paused) updateEnergy();
        else {
          energy.bass = lerp(energy.bass, 0.03, 0.025);
          energy.mid = lerp(energy.mid, 0.02, 0.025);
          energy.high = lerp(energy.high, 0.015, 0.025);
          energy.overall = lerp(energy.overall, 0.02, 0.025);
          energy.smoothedBeat = lerp(energy.smoothedBeat, 0, 0.04);
        }

        drawBackground(time);
        drawGlowNodes(time);
        drawConstellations(time, dt);
        drawParticles(time, dt);
        drawSideCovers(time, dt);
        drawBackdropWaveform(time);
        drawMainPulse(time);
        drawTransferWaves(time, dt);
        drawDataFilaments(time, dt);
        drawEidosCube(time);
        drawPeakStars(time, dt);
        drawRipples(dt);

        requestAnimationFrame(render);
      }

      async function requestFullscreen() {
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } catch (_) {
          // Algunos navegadores mÃ³viles no permiten fullscreen; la animaciÃ³n continÃºa igualmente.
        }
      }

      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      function trackSource(file) {
        if (/^(https?:)?\/\//i.test(file) || file.startsWith('/') || file.startsWith('./') || file.startsWith('../')) {
          return file;
        }

        const safePath = String(file)
          .split('/')
          .map(segment => encodeURIComponent(segment))
          .join('/');

        return `${SONGS_DIRECTORY}${safePath}`;
      }

      function normalizeLanguageKey(value) {
        return String(value || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      function formatLanguageLabel(language) {
        const key = normalizeLanguageKey(language);

        if (LANGUAGE_LABELS[key]) {
          return LANGUAGE_LABELS[key];
        }

        return key
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, letter => letter.toUpperCase()) ||
          'Otros';
      }

      function detectTrackLanguage(file, explicitLanguage = '') {
        const normalizedExplicit = normalizeLanguageKey(explicitLanguage);

        if (normalizedExplicit) {
          return normalizedExplicit;
        }

        const parts = String(file || '')
          .replace(/\\/g, '/')
          .split('/')
          .filter(Boolean);

        return parts.length > 1
          ? normalizeLanguageKey(parts[0])
          : ROOT_LANGUAGE_KEY;
      }

      function normalizeTrack(item, index) {
        if (typeof item === 'string') {
          const defaultName = item
            .split('/')
            .pop()
            .replace(/\.[^.]+$/, '')
            .replace(/[_-]+/g, ' ');

          return {
            name: defaultName,
            source: trackSource(item),
            file: item,
            language: detectTrackLanguage(item)
          };
        }

        const file = String(item?.file || item?.src || '').trim();
        if (!file) return null;

        const defaultName = file
          .split('/')
          .pop()
          .replace(/\.[^.]+$/, '')
          .replace(/[_-]+/g, ' ');

        return {
          name: String(item.title || item.name || defaultName).trim(),
          source: trackSource(file),
          file,
          language: detectTrackLanguage(file, item.language),
          order: Number.isFinite(item.order) ? item.order : index
        };
      }

      function formatPlaybackTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

        const total = Math.floor(seconds);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const secs = total % 60;

        if (hours > 0) {
          return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        return `${minutes}:${String(secs).padStart(2, '0')}`;
      }

      function setRangeProgress(input, ratio) {
        input.style.setProperty(
          '--range-progress',
          `${clamp(ratio, 0, 1) * 100}%`
        );
      }

      function updateTransportUI() {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
        const previewTime = duration > 0
          ? (Number(seekBar.value) / 1000) * duration
          : 0;

        if (!isSeeking) {
          const ratio = duration > 0 ? audio.currentTime / duration : 0;
          seekBar.value = String(Math.round(clamp(ratio, 0, 1) * 1000));
          currentTimeLabel.textContent = formatPlaybackTime(audio.currentTime);
        } else {
          currentTimeLabel.textContent = formatPlaybackTime(previewTime);
        }

        durationLabel.textContent = formatPlaybackTime(duration);
        seekBar.disabled = !(duration > 0);
        setRangeProgress(seekBar, Number(seekBar.value) / 1000);
      }

      function setOutputGain(value) {
        if (!outputGainNode || !audioContext) return;

        const gainValue = clamp(Number(value) || 0, 0, 1);
        const now = audioContext.currentTime;

        outputGainNode.gain.cancelScheduledValues(now);
        outputGainNode.gain.setValueAtTime(gainValue, now);
      }

      function updateVolumeUI() {
        volumeBar.value = String(desiredVolume);
        setRangeProgress(volumeBar, desiredVolume);

        const muted = desiredVolume <= 0;

        muteButton.innerHTML = muted
          ? ICONS.muted
          : desiredVolume < 0.45
            ? ICONS.volumeLow
            : ICONS.volumeHigh;

        muteButton.setAttribute(
          'aria-label',
          muted ? COPY.unmute : COPY.mute
        );
        muteButton.title = muted ? COPY.unmute : COPY.mute;
      }

      function applyVolume(value, { persist = true } = {}) {
        desiredVolume = clamp(Number(value) || 0, 0, 1);

        if (desiredVolume > 0) {
          lastNonZeroVolume = desiredVolume;
        }

        /*
          El elemento permanece a volumen completo para que el analizador
          reciba la canciÃ³n sin atenuaciÃ³n. Solo cambia la ganancia de salida.
        */
        audio.volume = 1;
        audio.muted = false;
        setOutputGain(desiredVolume);

        if (persist) {
          try {
            localStorage.setItem(
              'eidosMusicVolume',
              desiredVolume.toFixed(2)
            );
          } catch (_) {
            // El almacenamiento local es opcional.
          }
        }

        updateVolumeUI();
      }

      function commitSeek() {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;

        if (duration > 0) {
          audio.currentTime =
            clamp(Number(seekBar.value) / 1000, 0, 1) * duration;
        }

        isSeeking = false;
        updateTransportUI();
        showControls();
      }

      function trackMatchesLanguageFilter(track) {
        return Boolean(
          track &&
          (
            trackLanguageFilter === 'all' ||
            track.language === trackLanguageFilter
          )
        );
      }

      function getAvailableTrackIndices() {
        return localPlaylist
          .map((track, index) =>
            trackMatchesLanguageFilter(track) ? index : -1
          )
          .filter(index => index >= 0);
      }

      function getAvailableTrackCount() {
        return getAvailableTrackIndices().length;
      }

      function shuffleIndices(indices) {
        const shuffled = indices.slice();

        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
      }

      function resetRandomQueue(excludeIndex = currentTrackIndex) {
        const availableIndices = getAvailableTrackIndices();

        if (!availableIndices.length) {
          randomQueue = [];
          return;
        }

        if (availableIndices.length === 1) {
          randomQueue = availableIndices.slice();
          return;
        }

        randomQueue = shuffleIndices(
          availableIndices.filter(index => index !== excludeIndex)
        );
      }

      function cleanRandomQueue() {
        const validIndices = new Set(getAvailableTrackIndices());

        randomQueue = randomQueue.filter(
          (index, position, queue) =>
            validIndices.has(index) &&
            index !== currentTrackIndex &&
            queue.indexOf(index) === position
        );
      }

      function peekRandomIndex() {
        const availableIndices = getAvailableTrackIndices();

        if (!availableIndices.length) return -1;
        if (availableIndices.length === 1) return availableIndices[0];

        cleanRandomQueue();

        if (!randomQueue.length) {
          resetRandomQueue(currentTrackIndex);
        }

        return randomQueue[0] ?? -1;
      }

      function markRandomTrackAsPlayed(index) {
        randomQueue = randomQueue.filter(
          queuedIndex => queuedIndex !== index
        );
      }

      function chooseNextIndex() {
        const availableIndices = getAvailableTrackIndices();
        if (!availableIndices.length) return -1;

        if (playbackMode === 'ordered') {
          const position = availableIndices.indexOf(currentTrackIndex);

          return position >= 0
            ? availableIndices[(position + 1) % availableIndices.length]
            : availableIndices[0];
        }

        return peekRandomIndex();
      }

      function choosePreviousIndex() {
        const availableIndices = getAvailableTrackIndices();
        if (!availableIndices.length) return -1;

        const position = availableIndices.indexOf(currentTrackIndex);

        return position >= 0
          ? availableIndices[
              (position - 1 + availableIndices.length) % availableIndices.length
            ]
          : availableIndices[availableIndices.length - 1];
      }

      const ICONS = {
        play: `
          <svg class="icon-play" viewBox="0 0 24 24" focusable="false">
            <path d="M7 4.8v14.4L18 12 7 4.8Z"></path>
          </svg>
        `,
        pause: `
          <svg class="icon-pause" viewBox="0 0 24 24" focusable="false">
            <path d="M7.5 5v14M16.5 5v14"></path>
          </svg>
        `,
        shuffle: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 7h2.2c2.1 0 3.2 1.1 4.5 3.1l2.4 3.8c1.2 1.9 2.3 3.1 4.7 3.1H20"></path>
            <path d="m17 14 3 3-3 3"></path>
            <path d="M4 17h2.2c1.9 0 3-.9 4.1-2.5l2.9-4.4C14.4 8.2 15.6 7 17.8 7H20"></path>
            <path d="m17 4 3 3-3 3"></path>
          </svg>
        `,
        ordered: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 7h13"></path>
            <path d="m15 4 3 3-3 3"></path>
            <path d="M20 17H7"></path>
            <path d="m9 14-3 3 3 3"></path>
          </svg>
        `,
        volumeHigh: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 9h4l5-4v14l-5-4H4V9Z"></path>
            <path d="M16 8.3a5 5 0 0 1 0 7.4"></path>
            <path d="M18.5 5.8a8.5 8.5 0 0 1 0 12.4"></path>
          </svg>
        `,
        volumeLow: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 9h4l5-4v14l-5-4H4V9Z"></path>
            <path d="M16 8.3a5 5 0 0 1 0 7.4"></path>
          </svg>
        `,
        muted: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 9h4l5-4v14l-5-4H4V9Z"></path>
            <path d="m17 9 4 4M21 9l-4 4"></path>
          </svg>
        `,
        fullscreenEnter: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"></path>
          </svg>
        `,
        fullscreenExit: `
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 9h5V4M20 9h-5V4M15 20v-5h5M9 20v-5H4"></path>
          </svg>
        `
      };

      function updatePauseButtonUI() {
        const shouldShowPlay = audio.paused || audio.ended;

        pauseIcon.innerHTML = shouldShowPlay
          ? ICONS.play
          : ICONS.pause;

        pauseButton.setAttribute(
          'aria-label',
          shouldShowPlay ? COPY.play : COPY.pause
        );
        pauseButton.title =
          shouldShowPlay ? COPY.play : COPY.pause;
      }

      function updatePlaybackModeUI() {
        const ordered = playbackMode === 'ordered';

        modeButton.dataset.mode = playbackMode;
        modeButton.setAttribute(
          'aria-label',
          ordered ? COPY.ordered : COPY.random
        );
        modeButton.setAttribute(
          'aria-pressed',
          ordered ? 'true' : 'false'
        );
        modeButton.title = ordered
          ? COPY.ordered
          : COPY.random;

        modeIcon.innerHTML = ordered
          ? ICONS.ordered
          : ICONS.shuffle;
      }

      function updateFullscreenButtonUI() {
        const isFullscreen = Boolean(document.fullscreenElement);
        const label = isFullscreen
          ? COPY.exitFullscreen
          : COPY.enterFullscreen;

        fullscreenIcon.innerHTML = isFullscreen
          ? ICONS.fullscreenExit
          : ICONS.fullscreenEnter;
        fullscreenButton.setAttribute('aria-label', label);
        fullscreenButton.title = label;
        fullscreenButton.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
      }

      function scheduleTrackMarqueeUpdate() {
        cancelAnimationFrame(marqueeFrame);

        marqueeFrame = requestAnimationFrame(() => {
          currentTrackMarquee.classList.remove('is-marquee');
          currentTrackMarquee.style.removeProperty('--marquee-distance');
          currentTrackMarquee.style.removeProperty('--marquee-duration');

          const viewportWidth = currentTrackViewport.clientWidth;
          const textWidth = currentTrackName.scrollWidth;

          if (
            viewportWidth > 0 &&
            textWidth > viewportWidth + 6 &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            const gapWidth = 104;
            const distance = textWidth + gapWidth;
            const duration = Math.max(10, distance / 27);

            currentTrackMarquee.style.setProperty(
              '--marquee-distance',
              `${distance}px`
            );
            currentTrackMarquee.style.setProperty(
              '--marquee-duration',
              `${duration.toFixed(2)}s`
            );
            currentTrackMarquee.classList.add('is-marquee');
          }
        });
      }

      function getAvailableLanguageKeys() {
        const keys = Array.from(
          new Set(
            localPlaylist
              .map(track => normalizeLanguageKey(track.language))
              .filter(Boolean)
          )
        );

        const priority = [
          'esp', 'es', 'eng', 'en',
          'fra', 'fre', 'fr',
          'ita', 'it',
          'deu', 'ger', 'de',
          'por', 'pt',
          'cat', 'ca',
          'eus', 'eu',
          'glg', 'gl'
        ];

        return keys.sort((a, b) => {
          if (a === ROOT_LANGUAGE_KEY) return 1;
          if (b === ROOT_LANGUAGE_KEY) return -1;

          const aPriority = priority.indexOf(a);
          const bPriority = priority.indexOf(b);

          if (aPriority >= 0 || bPriority >= 0) {
            if (aPriority < 0) return 1;
            if (bPriority < 0) return -1;
            return aPriority - bPriority;
          }

          return formatLanguageLabel(a).localeCompare(
            formatLanguageLabel(b),
            'es',
            { sensitivity: 'base' }
          );
        });
      }

      function renderLanguageFilterButtons() {
        const availableKeys = getAvailableLanguageKeys();
        const validFilters = new Set(['all', ...availableKeys]);

        if (!validFilters.has(trackLanguageFilter)) {
          trackLanguageFilter = 'all';

          try {
            localStorage.setItem(
              'eidosMusicLanguageFilter',
              trackLanguageFilter
            );
          } catch (_) {
            // El almacenamiento local es opcional.
          }
        }

        languageFilter.replaceChildren();

        const filterOptions = [
          { key: 'all', type: 'world', label: 'All' },
          ...availableKeys.map(key => ({
            key,
            type: ['esp','es'].includes(key)
              ? 'spain'
              : ['eng','en'].includes(key)
                ? 'uk'
                : 'text',
            label: formatLanguageLabel(key)
          }))
        ];

        for (const option of filterOptions) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'language-filter-button';
          button.dataset.language = option.key;
          button.setAttribute('aria-pressed', 'false');
          button.setAttribute('aria-label', option.label);

          if (option.type === 'world') {
            const icon = document.createElement('span');
            icon.className = 'language-filter-world';
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = `<svg class="language-filter-world-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <circle cx="12" cy="12" r="8.5"></circle>
  <path d="M3.8 12h16.4"></path>
  <path d="M12 3.5c2.25 2.25 3.35 5.08 3.35 8.5S14.25 18.25 12 20.5"></path>
  <path d="M12 3.5C9.75 5.75 8.65 8.58 8.65 12S9.75 18.25 12 20.5"></path>
  <path d="M5.45 7.2h13.1"></path>
  <path d="M5.45 16.8h13.1"></path>
</svg>`;
            button.appendChild(icon);
          } else if (option.type === 'spain' || option.type === 'uk') {
            const image = document.createElement('img');
            image.className = 'language-filter-flag';
            image.src = option.type === 'spain'
              ? '../assets/images/flagspain.webp'
              : '../assets/images/flaguk.webp';
            image.alt = '';
            image.setAttribute('aria-hidden', 'true');
            button.appendChild(image);
          } else {
            button.textContent = option.label;
          }

          languageFilter.appendChild(button);
        }

        languageFilterButtons = Array.from(
          languageFilter.querySelectorAll('.language-filter-button')
        );
      }

      function updateLanguageFilterUI() {
        languageFilterButtons.forEach(button => {
          const active = button.dataset.language === trackLanguageFilter;

          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }

      function updatePlaylistStatus() {
        const count = getAvailableTrackCount();
        const filterLabel = trackLanguageFilter === 'all'
          ? ''
          : ` Â· ${formatLanguageLabel(trackLanguageFilter)}`;

        startStatus.textContent =
          `${count} ${
            count === 1 ? COPY.oneTrack : COPY.manyTracks
          }${filterLabel}.`;
      }

      function updateTrackLabels() {
        const track = localPlaylist[currentTrackIndex];
        const name = track?.name || 'â€”';

        currentTrackName.textContent = name;
        currentTrackClone.textContent = name;

        if (track) {
          const currentTrackIsRequested =
            requestedTrackMatched &&
            requestedTrackToken &&
            [track.file, track.name].some(candidate =>
              String(candidate || '')
                .trim()
                .toLocaleLowerCase('es') ===
              String(requestedTrackToken)
                .trim()
                .toLocaleLowerCase('es')
            );

          startTrack.textContent = currentTrackIsRequested
            ? COPY.sharedTrack(name)
            : COPY.randomStart(name);
        } else {
          startTrack.textContent = COPY.noTracks;
        }

        document.title = track ? `${name} Â· Eidos` : COPY.playerTitle;

        trackList.querySelectorAll('.track-option').forEach(button => {
          const index = Number(button.dataset.trackIndex);
          const active = index === currentTrackIndex;

          button.classList.toggle('active', active);
          button.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        scheduleTrackMarqueeUpdate();
      }

      function renderTrackList() {
        renderLanguageFilterButtons();
        trackList.replaceChildren();

        const filteredTracks = localPlaylist
          .map((track, index) => ({ track, index }))
          .filter(({ track }) => trackMatchesLanguageFilter(track));

        filteredTracks.forEach(({ track, index }, visibleIndex) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'track-option';
          button.setAttribute('role', 'option');
          button.dataset.trackIndex = String(index);
          button.innerHTML =
            `<span class="track-number">${String(visibleIndex + 1).padStart(2, '0')}</span>` +
            `<span class="track-title"></span>`;

          button.querySelector('.track-title').textContent = track.name;

          button.addEventListener('click', async () => {
            closeTrackSelector();
            await playPlaylistTrack(index, 0, 'manual');
          });

          trackList.appendChild(button);
        });

        updateLanguageFilterUI();
        updatePlaylistStatus();
        updateTrackLabels();
      }

      function rawTracksFromFiles(files) {
        return files.map(item => {
          const file = typeof item === 'string'
            ? item
            : String(item.file || '');

          return {
            title: file
              .split('/')
              .pop()
              .replace(/\.[^.]+$/, '')
              .replace(/[_-]+/g, ' ')
              .replace(/\s+/g, ' ')
              .trim(),
            file,
            language: typeof item === 'string'
              ? detectTrackLanguage(file)
              : detectTrackLanguage(file, item.language)
          };
        });
      }

      function applyPlaylist(rawTracks, {
        preserveCurrentTrack = false
      } = {}) {
        const previousTrackFile = preserveCurrentTrack
          ? getCurrentTrack()?.file
          : null;

        const nextPlaylist = rawTracks
          .map(normalizeTrack)
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(
            b.name,
            'es',
            {
              numeric: true,
              sensitivity: 'base'
            }
          ));

        if (!nextPlaylist.length) {
          return false;
        }

        localPlaylist = nextPlaylist;

        const availableLanguageKeys = new Set(
          getAvailableLanguageKeys()
        );

        if (
          trackLanguageFilter !== 'all' &&
          !availableLanguageKeys.has(trackLanguageFilter)
        ) {
          trackLanguageFilter = 'all';
        }

        const normalizedRequestedTrack = requestedTrackToken
          ? String(requestedTrackToken)
              .trim()
              .toLocaleLowerCase('es')
          : '';

        const requestedIndex = normalizedRequestedTrack
          ? localPlaylist.findIndex(track => {
              const candidates = [
                track.file,
                track.name,
                (() => {
                  try {
                    return decodeURIComponent(
                      new URL(track.source, document.baseURI)
                        .pathname
                        .split('/')
                        .pop() || ''
                    );
                  } catch (_) {
                    return '';
                  }
                })()
              ];

              return candidates.some(candidate =>
                String(candidate || '')
                  .trim()
                  .toLocaleLowerCase('es') ===
                normalizedRequestedTrack
              );
            })
          : -1;

        requestedTrackMatched = requestedIndex >= 0;

        if (requestedTrackMatched) {
          currentTrackIndex = requestedIndex;
        } else if (previousTrackFile) {
          const preservedIndex = localPlaylist.findIndex(
            track =>
              track.file === previousTrackFile &&
              trackMatchesLanguageFilter(track)
          );

          const availableIndices = getAvailableTrackIndices();

          currentTrackIndex = preservedIndex >= 0
            ? preservedIndex
            : availableIndices[
                Math.floor(Math.random() * availableIndices.length)
              ] ?? 0;
        } else {
          const availableIndices = getAvailableTrackIndices();

          currentTrackIndex = availableIndices[
            Math.floor(Math.random() * availableIndices.length)
          ] ?? 0;
        }

        resetRandomQueue(currentTrackIndex);
        renderTrackList();
        updatePlaylistStatus();

        startButton.disabled = getAvailableTrackCount() === 0;
        preloadNextTrack();

        return true;
      }

      function loadPlaylist() {
        try {
          const manifest = Array.isArray(window.EIDOS_MUSIC_MANIFEST)
            ? window.EIDOS_MUSIC_MANIFEST
            : [];
          const loaded = applyPlaylist(manifest);
          if (!loaded) throw new Error(COPY.noCompatibleAudio);
        } catch (error) {
          console.error(error);
          startTrack.textContent = COPY.musicFailed;
          startStatus.textContent = COPY.updateManifest;
          startButton.disabled = true;
        }
      }

      function getCurrentTrack() {
        return localPlaylist[currentTrackIndex] || null;
      }

      function configureAudioSource(track) {
        audio.pause();
        isSeeking = false;
        seekBar.value = '0';
        currentTimeLabel.textContent = '0:00';
        durationLabel.textContent = '0:00';
        setRangeProgress(seekBar, 0);
        audio.removeAttribute('src');
        audio.load();

        const absolute = new URL(track.source, document.baseURI);
        if (absolute.origin !== window.location.origin) audio.crossOrigin = 'anonymous';
        else audio.removeAttribute('crossorigin');

        audio.src = absolute.href;
        audio.load();
      }

      function preloadNextTrack() {
        if (!localPlaylist.length) {
          preloadedNextIndex = -1;
          preloadAudio.removeAttribute('src');
          preloadAudio.load();
          return;
        }

        preloadedNextIndex = chooseNextIndex();
        if (preloadedNextIndex < 0) return;

        preloadAudio.src = new URL(localPlaylist[preloadedNextIndex].source, document.baseURI).href;
        preloadAudio.load();
      }

      async function startInitialPlayback() {
        if (starting || !localPlaylist.length) return;
        const track = getCurrentTrack();
        if (!track) return;

        starting = true;
        startButton.disabled = true;
        startStatus.textContent = COPY.preparing;

        try {
          setupAudioGraph();
          const fullscreenPromise = requestFullscreen();
          const resumePromise = audioContext.state === 'suspended' ? audioContext.resume() : Promise.resolve();

          configureAudioSource(track);
          audio.volume = 1;
          audio.muted = false;
          setOutputGain(0);
          audio.currentTime = 0;

          panel.classList.add('hidden');
          document.body.classList.add('visualizer-started');
          setPlayerLanguageSwitchesVisible(false);
          updatePauseButtonUI();
          updateTrackLabels();

          const playPromise = audio.play();
          await Promise.all([resumePromise, playPromise, fullscreenPromise.catch(() => {})]);

          // La reproducciÃ³n ya ha arrancado: tras el fundido, retiramos
          // completamente la carÃ¡tula de entrada para que no pueda quedar
          // visible ni interceptar eventos.
          window.setTimeout(() => {
            if (panel.classList.contains('hidden')) panel.hidden = true;
          }, 900);

          running = false;
          await delay(START_DELAY_MS);
          audio.currentTime = 0;
          setOutputGain(desiredVolume);
          running = true;
          updatePauseButtonUI();
          updateVolumeUI();
          startStatus.textContent = '';
          preloadNextTrack();
          showControls();
        } catch (error) {
          audio.pause();
          setOutputGain(desiredVolume);
          running = false;
          updateVolumeUI();
          panel.hidden = false;
          panel.classList.remove('hidden');
          document.body.classList.remove('visualizer-started');
          setPlayerLanguageSwitchesVisible(true);
          startStatus.textContent = COPY.startFailed(error.message);
          console.error(error);
        } finally {
          starting = false;
          startButton.disabled = false;
        }
      }

      async function playPlaylistTrack(
        index,
        attempts = 0,
        source = 'automatic'
      ) {
        if (!localPlaylist.length || trackTransitioning) return;
        if (attempts >= localPlaylist.length) {
          running = false;
          updatePauseButtonUI();
          return;
        }

        trackTransitioning = true;
        const normalizedIndex = (index + localPlaylist.length) % localPlaylist.length;
        const track = localPlaylist[normalizedIndex];

        try {
          /*
            En aleatorio, la pista automÃ¡tica se consume de la bolsa.
            Una selecciÃ³n manual tambiÃ©n se marca como escuchada para
            evitar que reaparezca poco despuÃ©s.
          */
          if (
            playbackMode === 'random' ||
            source === 'manual'
          ) {
            markRandomTrackAsPlayed(normalizedIndex);
          }

          currentTrackIndex = normalizedIndex;
          configureAudioSource(track);
          audio.volume = 1;
          audio.muted = false;
          setOutputGain(desiredVolume);
          if (audioContext && audioContext.state === 'suspended') await audioContext.resume();
          await audio.play();
          running = true;
          updatePauseButtonUI();
          updateTrackLabels();
          preloadNextTrack();
          showControls();
        } catch (error) {
          console.error(COPY.playFailed(track.name), error);
          trackTransitioning = false;
          await playPlaylistTrack(
            chooseNextIndex(),
            attempts + 1,
            source
          );
          return;
        }

        trackTransitioning = false;
      }

      function buildPlayerShareUrl() {
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        return url.toString();
      }

      function buildTrackShareUrl() {
        const track = getCurrentTrack();
        const url = new URL(buildPlayerShareUrl());

        if (track) {
          url.searchParams.set('track', track.file || track.name);
        }

        return url.toString();
      }

      async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      function canUseNativeMobileShare() {
        const userAgent = navigator.userAgent || '';
        const mobileUserAgent =
          /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

        /*
          iPadOS puede identificarse como un Mac. Esta comprobaciÃ³n
          permite usar el menÃº nativo en iPad sin activarlo en Windows.
        */
        const iPadDesktopMode =
          navigator.platform === 'MacIntel' &&
          navigator.maxTouchPoints > 1;

        return (
          typeof navigator.share === 'function' &&
          (mobileUserAgent || iPadDesktopMode)
        );
      }

      function clearShareAutoClose() {
        clearTimeout(shareAutoCloseTimer);
        shareAutoCloseTimer = null;
      }

      function scheduleShareAutoClose(delay = 4000) {
        clearShareAutoClose();

        if (!shareOpen) return;

        shareAutoCloseTimer = setTimeout(() => {
          if (shareOpen) {
            closeSharePanel();
          }
        }, delay);
      }

      function showTemporaryShareStatus(message, duration = 1500) {
        clearTimeout(shareStatusTimer);
        shareStatus.textContent = message;

        shareStatusTimer = setTimeout(() => {
          shareStatus.textContent = '';
        }, duration);
      }

      async function shareLink({ url, title, text }) {
        clearTimeout(shareStatusTimer);
        clearShareAutoClose();
        shareStatus.textContent = '';

        if (canUseNativeMobileShare()) {
          try {
            await navigator.share({ title, text, url });
            showTemporaryShareStatus(COPY.linkShared, 1500);
            scheduleShareAutoClose(1000);
            return;
          } catch (error) {
            /*
              Si el usuario cierra voluntariamente el menÃº de compartir,
              no se copia nada ni se muestra un error.
            */
            if (error?.name === 'AbortError') {
              scheduleShareAutoClose(4000);
              return;
            }

            console.warn(
              'No se ha podido usar el menÃº nativo. Se copiarÃ¡ el enlace.',
              error
            );
          }
        }

        try {
          await copyTextToClipboard(url);
          showTemporaryShareStatus(COPY.linkCopied, 1500);
          scheduleShareAutoClose(1000);
        } catch (error) {
          console.error(error);
          showTemporaryShareStatus(
            'No se ha podido copiar el enlace.',
            2500
          );
          scheduleShareAutoClose(3000);
        }
      }

      function openSharePanel() {
        if (selectorOpen) {
          selectorOpen = false;
          document.body.classList.remove('selector-open');
        }

        shareOpen = true;
        shareStatus.textContent = '';
        shareButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('share-open', 'show-controls');
        clearTimeout(controlsTimer);
        scheduleShareAutoClose(4000);
      }

      function closeSharePanel({ keepControls = true } = {}) {
        shareOpen = false;
        shareButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('share-open');

        clearTimeout(shareStatusTimer);
        clearShareAutoClose();
        shareStatus.textContent = '';

        if (keepControls) showControls();
      }

      async function returnToLauncher() {
        if (starting) return;

        audio.pause();
        audio.volume = 1;
        audio.muted = false;
        setOutputGain(desiredVolume);
        audio.currentTime = 0;
        updateTransportUI();
        updateVolumeUI();
        running = false;
        trackTransitioning = false;

        clearTimeout(controlsTimer);
        selectorOpen = false;
        shareOpen = false;
        shareButton.setAttribute('aria-expanded', 'false');

        document.body.classList.remove(
          'visualizer-started',
          'show-controls',
          'selector-open',
          'share-open'
        );

        selectorPanel.classList.remove('open');
        chooseLauncherCover();
        panel.hidden = false;
        panel.classList.remove('hidden');
        updatePauseButtonUI();
        startStatus.textContent = '';
        updateTrackLabels();

        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen();
          }
        } catch (error) {
          console.warn(COPY.fullscreenExitFailed, error);
        }

        startButton.focus({ preventScroll: true });
      }

      function showControls() {
        if (!document.body.classList.contains('visualizer-started')) return;
        document.body.classList.add('show-controls');
        clearTimeout(controlsTimer);
        if (!selectorOpen && !shareOpen && !transportInteracting) {
          controlsTimer = setTimeout(() => document.body.classList.remove('show-controls'), 2600);
        }
      }

      function openTrackSelector() {
        if (shareOpen) closeSharePanel({ keepControls: false });
        selectorOpen = true;
        document.body.classList.add('selector-open', 'show-controls');
        clearTimeout(controlsTimer);
        const active = trackList.querySelector('.track-option.active');
        active?.scrollIntoView({ block: 'nearest' });
      }

      function closeTrackSelector() {
        selectorOpen = false;
        document.body.classList.remove('selector-open');
        showControls();
      }

      startButton.addEventListener('click', startInitialPlayback);

      brandButton.addEventListener('click', event => {
        event.stopPropagation();
        returnToLauncher();
      });

      previousButton.addEventListener('click', async () => {
        if (
          starting ||
          trackTransitioning ||
          !localPlaylist.length
        ) {
          return;
        }

        if (audio.currentTime > 5) {
          audio.currentTime = 0;
          updateTransportUI();
        } else {
          const previousIndex = choosePreviousIndex();

          if (previousIndex >= 0) {
            await playPlaylistTrack(previousIndex, 0, 'previous');
          }
        }

        showControls();
      });

      pauseButton.addEventListener('click', async () => {
        if (starting) return;

        if (audio.paused) {
          if (
            audioContext &&
            audioContext.state === 'suspended'
          ) {
            await audioContext.resume();
          }

          await audio.play();
          running = true;
        } else {
          audio.pause();
          running = false;
        }

        updatePauseButtonUI();
        showControls();
      });

      languageFilter.addEventListener('click', async event => {
        const button = event.target.closest('.language-filter-button');
        if (!button) return;

        const nextFilter = button.dataset.language;

        const validFilters = new Set([
          'all',
          ...getAvailableLanguageKeys()
        ]);

        if (
          !validFilters.has(nextFilter) ||
          nextFilter === trackLanguageFilter
        ) {
          return;
        }

        trackLanguageFilter = nextFilter;

        try {
          localStorage.setItem(
            'eidosMusicLanguageFilter',
            trackLanguageFilter
          );
        } catch (_) {
          // El almacenamiento local es opcional.
        }

        resetRandomQueue(currentTrackIndex);
        renderTrackList();

        const currentAllowed =
          trackMatchesLanguageFilter(getCurrentTrack());

        const nextIndex = currentAllowed
          ? currentTrackIndex
          : peekRandomIndex();

        if (
          nextIndex >= 0 &&
          nextIndex !== currentTrackIndex
        ) {
          if (document.body.classList.contains('visualizer-started')) {
            await playPlaylistTrack(
              nextIndex,
              0,
              'language-filter'
            );
          } else {
            currentTrackIndex = nextIndex;
            markRandomTrackAsPlayed(nextIndex);
            updateTrackLabels();
            preloadNextTrack();
          }
        } else {
          updateTrackLabels();
          preloadNextTrack();
        }

        const active = trackList.querySelector('.track-option.active');
        active?.scrollIntoView({ block: 'nearest' });
        showControls();
      });

      modeButton.addEventListener('click', () => {
        playbackMode =
          playbackMode === 'random'
            ? 'ordered'
            : 'random';

        if (playbackMode === 'random') {
          /*
            Al entrar en aleatorio se inicia un ciclo nuevo, excluyendo
            la canciÃ³n actual para que no se repita inmediatamente.
          */
          resetRandomQueue(currentTrackIndex);
        }

        updatePlaybackModeUI();
        preloadNextTrack();
        showControls();
      });

      nextButton.addEventListener('click', async () => {
        if (
          starting ||
          trackTransitioning ||
          !localPlaylist.length
        ) {
          return;
        }

        const nextIndex =
          preloadedNextIndex >= 0
            ? preloadedNextIndex
            : chooseNextIndex();

        if (nextIndex >= 0) {
          await playPlaylistTrack(nextIndex);
        }

        showControls();
      });

      selectButton.addEventListener('click', () => {
        if (selectorOpen) closeTrackSelector();
        else openTrackSelector();
      });

      shareButton.addEventListener('click', () => {
        if (shareOpen) closeSharePanel();
        else openSharePanel();
      });

      fullscreenButton.addEventListener('click', async () => {
        if (document.fullscreenElement) {
          try {
            if (document.exitFullscreen) await document.exitFullscreen();
          } catch (error) {
            console.warn(COPY.fullscreenExitFailed, error);
          }
        } else {
          await requestFullscreen();
        }

        updateFullscreenButtonUI();
        showControls();
      });

      closeSelector.addEventListener('click', closeTrackSelector);
      closeShare.addEventListener('click', () => closeSharePanel());

      sharePanel.addEventListener('pointerdown', event => {
        if (!event.target.closest('.share-option')) {
          scheduleShareAutoClose(4000);
        }
      });

      sharePanel.addEventListener('focusin', event => {
        if (!event.target.closest('.share-option')) {
          scheduleShareAutoClose(4000);
        }
      });

      seekBar.addEventListener('pointerdown', () => {
        transportInteracting = true;
        isSeeking = true;
        clearTimeout(controlsTimer);
        showControls();
      });

      seekBar.addEventListener('input', () => {
        isSeeking = true;
        updateTransportUI();
        showControls();
      });

      seekBar.addEventListener('change', commitSeek);

      volumeBar.addEventListener('pointerdown', () => {
        transportInteracting = true;
        clearTimeout(controlsTimer);
        showControls();
      });

      volumeBar.addEventListener('input', () => {
        applyVolume(volumeBar.value);
        showControls();
      });

      muteButton.addEventListener('click', () => {
        if (desiredVolume > 0) {
          lastNonZeroVolume = desiredVolume;
          applyVolume(0);
        } else {
          applyVolume(lastNonZeroVolume || 0.85);
        }
        showControls();
      });

      document.addEventListener('pointerup', () => {
        if (!transportInteracting) return;
        transportInteracting = false;

        if (isSeeking) commitSeek();
        else showControls();
      }, { passive: true });

      document.addEventListener('pointercancel', () => {
        transportInteracting = false;
        isSeeking = false;
        updateTransportUI();
        showControls();
      }, { passive: true });

      sharePlayerButton.addEventListener('click', () => {
        shareLink({
          url: buildPlayerShareUrl(),
          title: COPY.shareTitle,
          text: COPY.sharePlayer
        });
      });

      shareTrackButton.addEventListener('click', () => {
        const track = getCurrentTrack();

        shareLink({
          url: buildTrackShareUrl(),
          title: track ? `${track.name} Â· Eidos` : COPY.shareTitle,
          text: track
            ? COPY.shareTrack(track.name)
            : COPY.sharePlayer
        });
      });

      audio.addEventListener('play', updatePauseButtonUI);
      audio.addEventListener('pause', updatePauseButtonUI);
      audio.addEventListener('loadedmetadata', updateTransportUI);
      audio.addEventListener('durationchange', updateTransportUI);
      audio.addEventListener('timeupdate', updateTransportUI);
      audio.addEventListener('seeking', updateTransportUI);
      audio.addEventListener('seeked', updateTransportUI);
      audio.addEventListener('emptied', updateTransportUI);
      audio.addEventListener('volumechange', updateVolumeUI);
      document.addEventListener('fullscreenchange', () => {
        updateFullscreenButtonUI();
        showControls();
      });

      audio.addEventListener('ended', () => {
        updateTransportUI();
        const nextIndex = preloadedNextIndex >= 0 ? preloadedNextIndex : chooseNextIndex();
        if (nextIndex >= 0) playPlaylistTrack(nextIndex);
      });

      audio.addEventListener('error', () => {
        if (!panel.classList.contains('hidden')) return;
        const nextIndex = chooseNextIndex();
        if (nextIndex >= 0) playPlaylistTrack(nextIndex);
      });

      document.addEventListener('pointermove', showControls, { passive: true });
      document.addEventListener('pointerdown', event => {
        if (
          !selectorPanel.contains(event.target) &&
          selectorOpen &&
          !selectButton.contains(event.target)
        ) {
          closeTrackSelector();
        }

        if (
          !sharePanel.contains(event.target) &&
          shareOpen &&
          !shareButton.contains(event.target)
        ) {
          closeSharePanel();
        }

        showControls();
      }, { passive: true });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          if (shareOpen) closeSharePanel();
          else if (selectorOpen) closeTrackSelector();
        }

        if (
          event.code === 'Space' &&
          document.body.classList.contains('visualizer-started') &&
          !selectorOpen &&
          !shareOpen
        ) {
          event.preventDefault();
          pauseButton.click();
        }
      });

      window.addEventListener('resize', resize);

      chooseLauncherCover();
      applyVolume(desiredVolume, { persist: false });
      updateTransportUI();
      updatePlaybackModeUI();
      updatePauseButtonUI();
      updateFullscreenButtonUI();
      updateLanguageFilterUI();
      loadPlaylist();
      resize();
      requestAnimationFrame(render);
    })();

(() => {
      const navbar = document.getElementById('navbar');
      const menu = document.getElementById('mobile-menu');
      const burger = document.getElementById('hamburger');

      let navigationTimer = null;
      let viewportTimer = null;
      let compactNavigation = window.innerWidth <= 900;

      function scheduleNavigationFade() {
        clearTimeout(navigationTimer);

        if (!document.body.classList.contains('visualizer-started')) return;
        if (document.body.classList.contains('mobile-menu-open')) return;

        navigationTimer = setTimeout(() => {
          if (!document.body.classList.contains('mobile-menu-open')) {
            document.body.classList.remove('nav-visible');
          }
        }, 3300);
      }

      function showNavigation() {
        document.body.classList.add('nav-visible');
        scheduleNavigationFade();
      }

      window.toggleMenu = function toggleMenu() {
        const opening = !menu.classList.contains('open');

        // Abrir o cerrar navegaciÃ³n es una operaciÃ³n puramente visual.
        // Nunca llama a requestFullscreen/exitFullscreen.
        menu.classList.toggle('open', opening);
        burger.classList.toggle('active', opening);
        burger.setAttribute('aria-expanded', opening ? 'true' : 'false');
        document.body.classList.toggle('mobile-menu-open', opening);

        document.body.classList.add('nav-visible');
        clearTimeout(navigationTimer);

        if (!opening) scheduleNavigationFade();
      };

      window.exitPlayerFullscreen = async function exitPlayerFullscreen() {
        closeMenu();
        if (document.fullscreenElement && document.exitFullscreen) {
          try {
            await document.exitFullscreen();
          } catch (_) {
            // Escape sigue siendo la alternativa nativa del navegador.
          }
        }
      };

      window.closeMenu = function closeMenu() {
        menu.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('mobile-menu-open');
        scheduleNavigationFade();
      };

      function stabilizeNavigationAfterViewportChange(forceClose = false) {
        clearTimeout(viewportTimer);

        document.body.classList.add('nav-visible');
        clearTimeout(navigationTimer);

        viewportTimer = setTimeout(() => {
          const nextCompactNavigation = window.innerWidth <= 900;
          const breakpointChanged =
            nextCompactNavigation !== compactNavigation;

          // Mientras estamos en fullscreen, un resize/viewport-change
          // provocado por el navegador no debe cerrar el menÃº ni alterar
          // la experiencia. Solo el usuario lo cierra.
          const keepFullscreenMenu =
            Boolean(document.fullscreenElement) &&
            menu.classList.contains('open');

          if (!keepFullscreenMenu && (forceClose || breakpointChanged)) {
            closeMenu();
          }

          compactNavigation = nextCompactNavigation;
          document.body.classList.add('nav-visible');
          scheduleNavigationFade();
        }, 180);
      }

      function handleOrientationChange() {
        stabilizeNavigationAfterViewportChange(true);

        setTimeout(
          () => stabilizeNavigationAfterViewportChange(true),
          420
        );
      }

      document.addEventListener('pointermove', showNavigation, { passive: true });
      document.addEventListener('pointerdown', showNavigation, { passive: true });
      document.addEventListener('touchstart', showNavigation, { passive: true });
      document.addEventListener('focusin', showNavigation);

      navbar.addEventListener('mouseenter', () => {
        document.body.classList.add('nav-visible');
        clearTimeout(navigationTimer);
      });

      navbar.addEventListener('mouseleave', scheduleNavigationFade);
      menu.addEventListener('mouseenter', () => clearTimeout(navigationTimer));
      menu.addEventListener('mouseleave', scheduleNavigationFade);

      document.addEventListener('pointerdown', event => {
        if (
          menu.classList.contains('open') &&
          !menu.contains(event.target) &&
          !burger.contains(event.target)
        ) {
          closeMenu();
        }
      }, { passive: true });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
      });

      window.addEventListener(
        'resize',
        () => stabilizeNavigationAfterViewportChange(false),
        { passive: true }
      );

      window.addEventListener(
        'orientationchange',
        handleOrientationChange,
        { passive: true }
      );

      function syncFullscreenState() {
        // Fullscreen solo cambia el estado visual del botÃ³n/opciÃ³n.
        // No cerramos menÃº ni forzamos ningÃºn reajuste de navegaciÃ³n.
        document.body.classList.toggle(
          'is-fullscreen',
          Boolean(document.fullscreenElement)
        );
        document.body.classList.add('nav-visible');
        clearTimeout(navigationTimer);
        scheduleNavigationFade();
      }

      document.addEventListener('fullscreenchange', syncFullscreenState);
      syncFullscreenState();

      if (window.visualViewport) {
        window.visualViewport.addEventListener(
          'resize',
          () => stabilizeNavigationAfterViewportChange(false),
          { passive: true }
        );
      }

      if (
        screen.orientation &&
        typeof screen.orientation.addEventListener === 'function'
      ) {
        screen.orientation.addEventListener(
          'change',
          handleOrientationChange
        );
      }

      document.body.classList.add('nav-visible');
      scheduleNavigationFade();
    })();