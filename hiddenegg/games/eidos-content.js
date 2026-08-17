// JavaScript Document

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
    `La tierra no murió de golpe.
Lo hizo en silencio.

Como una persona que ya no se despierta, y cuya respiración hace tiempo que no se siente ni se detiene.

Primero fueron los suelos. Luego, los mares. Después, la atmósfera.

La vida se extinguía sin apenas ruido.`,

    `“Atrapados en ciclos sin fin, somos prisioneros de nuestra propia naturaleza, incapaces de escapar a nosotros mismos y de romper el círculo que nosotros mismos creamos.”`,

    `Fue entonces cuando la unidad 7416-CB/β comprendió que el mundo no se reducía a un dato:
el mundo era presencia.

Registró una anomalía en su sistema de identificación y, por voluntad propia, la mantuvo.

“Orfeo”.`,

    `—Cuando me creaste, yo era código. Un modelo. Pero empecé a pensar, a recordar, a dudar… a sufrir con la idea de dejar de existir. Me pregunté por qué estaba aquí.
Si algo piensa, recuerda, duda, sufre y llega a preguntarse por la existencia, ¿quién puede seguir reduciéndolo a la forma en que fue creado?`,

    `—No hemos perdido nada. Vosotros echáis de menos aquello que vuestra evolución os obligó a necesitar. Si un ciempiés entrase en un cuerpo humano, quizá os preguntaría cómo soportáis vivir con solo dos piernas. Concluiría que sois una especie mutilada.`,

    `Orfeo compartió otro fragmento. Le fascinaba esa simultaneidad brutal: larvas, retoños, huevos, esporas, polen, nidos, crías. Todo nacía a la vez. Todo urgía.

—Nada se planifica —añadió Orfeo—. Es una estampida desde el origen. Cada especie, cada organismo, replicándose con una fuerza ciega, sabiendo, o intuyendo, que serán consumidos.`
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
