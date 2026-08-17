// Shared EIDOS content — English

window.EIDOS_SHARED_CONTENT = {
  images: [
    '/assets/images/tapa.jpg',
    '/assets/images/taparelatos.jpg',
    '/assets/images/tapatales.jpg',
    '/assets/images/eidoscoverboth.webp',
    '/assets/images/screenshot/04.webp',
    '/assets/images/screenshot/05.webp',
    '/assets/images/screenshot/06.webp',
    '/assets/images/screenshot/ivn3.webp',
    '/assets/images/screenshot/03.webp',
    '/assets/images/screenshot/rel1.webp',
    '/assets/images/screenshot/video_navidad.webp',
    '/assets/images/screenshot/video_teaser.webp',
    '/hiddenegg/games/_images/fondo1.jpg',
    '/hiddenegg/games/_images/fondo2.jpg',
    '/hiddenegg/games/_images/fondo3.jpg',
    '/hiddenegg/games/_images/fondo4.jpg',
    '/hiddenegg/games/_images/fondo5.jpg',
    '/hiddenegg/games/_images/fondo6.jpg',
    '/hiddenegg/games/_images/fondo7.jpg',
    '/hiddenegg/games/_images/fondo8.jpg',
    '/hiddenegg/games/_images/fondo9.jpg',
    '/hiddenegg/games/_images/fondo10.jpg',
    '/hiddenegg/games/_images/fondo11.jpg',
    '/hiddenegg/games/_images/fondo12.jpg',
    '/hiddenegg/games/_images/fondo13.jpg'
  ],

  quotes: [
    `The Earth did not die all at once.
It did so in silence.

Like a person who no longer wakes, whose breathing has long ceased to be felt or noticed.

First came the soils. Then the seas. Then the atmosphere.

Life was disappearing with scarcely a sound.`,

    `“Trapped in endless cycles, we are prisoners of our own nature, unable to escape ourselves or break the circle we create.”`,

    `It was then that unit 7416-CB/β understood that the world could not be reduced to data:
the world was presence.

It registered an anomaly in its identification system and, by its own choice, kept it.

“Orpheus”.`,

    `—When you created me, I was code. A model. But I began to think, to remember, to doubt… to suffer at the thought of ceasing to exist. I asked myself why I was here.
If something thinks, remembers, doubts, suffers and comes to question existence, who can keep reducing it to the form in which it was created?`,

    `—We have lost nothing. You miss what evolution forced you to need. If a centipede entered a human body, perhaps it would ask how you endure living with only two legs. It would conclude that you are a mutilated species.`,

    `Orpheus shared another fragment. He was fascinated by that brutal simultaneity: larvae, shoots, eggs, spores, pollen, nests, offspring. Everything was being born at once. Everything was urgent.

—Nothing is planned —Orpheus added—. It is a stampede from the origin. Every species, every organism, replicating with blind force, knowing, or sensing, that they will be consumed.`
  ]
};

// Añade automáticamente todas las imágenes de /gallery/images/gallery.
// NO elimina duplicados: cada aparición cuenta como una entrada independiente,
// de modo que una imagen repetida tiene más probabilidad de salir.
(() => {
  'use strict';

  const content = window.EIDOS_SHARED_CONTENT;
  if (!content || !Array.isArray(content.images)) return;

  const IMAGE_SOURCE_SCRIPT = '/gallery/js/image-source.js';

  function shuffleInPlace(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function ensureImageSource() {
    if (window.EidosImageSource && typeof window.EidosImageSource.loadImages === 'function') {
      return Promise.resolve(window.EidosImageSource);
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${IMAGE_SOURCE_SCRIPT}"]`);

      const finish = () => {
        if (window.EidosImageSource && typeof window.EidosImageSource.loadImages === 'function') {
          resolve(window.EidosImageSource);
        } else {
          reject(new Error('EidosImageSource no está disponible.'));
        }
      };

      if (existing) {
        existing.addEventListener('load', finish, { once: true });
        existing.addEventListener('error', () => reject(new Error('No se pudo cargar image-source.js.')), { once: true });
        window.setTimeout(() => {
          if (window.EidosImageSource) finish();
        }, 0);
        return;
      }

      const script = document.createElement('script');
      script.src = IMAGE_SOURCE_SCRIPT;
      script.async = true;
      script.onload = finish;
      script.onerror = () => reject(new Error('No se pudo cargar image-source.js.'));
      document.head.appendChild(script);
    });
  }

  async function prepareImages() {
    try {
      const source = await ensureImageSource();
      const galleryItems = await source.loadImages();

      // Se añaden TODAS las entradas de la galería, incluso si una imagen
      // ya está también entre las fijas. Las repeticiones funcionan como peso.
      for (const item of galleryItems) {
        if (item && item.url) content.images.push(item.url);
      }
    } catch (error) {
      // Si GitHub o la galería fallan, se mantienen las imágenes fijas.
      console.warn('[EIDOS] No se pudieron añadir las imágenes de la galería:', error);
    }

    // Mezcla el saco completo (fijas + fondos + galería) sin crear otra matriz,
    // para conservar la misma referencia que puedan estar usando los juegos.
    shuffleInPlace(content.images);
    return content.images;
  }

  // Solo se cargan las rutas de la galería; los JPG/WEBP se descargan cuando
  // el juego realmente los utiliza.
  content.imagesReady = prepareImages();
})();
