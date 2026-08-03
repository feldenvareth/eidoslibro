(() => {
  'use strict';

  const API_URL = 'api/images.php';

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  async function loadImages() {
    const response = await fetch(`${API_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`No se pudo leer la carpeta de imágenes (${response.status}).`);
    }

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.images)) {
      throw new Error(data.message || 'La respuesta del servidor no es válida.');
    }

    return data.images;
  }

  class ImageDeck {
    constructor(images) {
      this.images = [...images];
      this.queue = [];
      this.lastUrl = '';
      this.refill();
    }

    refill() {
      this.queue = shuffle(this.images);
    }

    next(excludedUrls = new Set()) {
      if (!this.images.length) return null;

      let attempts = 0;
      const maximumAttempts = Math.max(this.images.length * 2, 8);

      while (attempts < maximumAttempts) {
        if (!this.queue.length) this.refill();
        const candidate = this.queue.shift();
        attempts += 1;

        if (!candidate) continue;
        if (this.images.length > 1 && candidate.url === this.lastUrl) {
          this.queue.push(candidate);
          continue;
        }
        if (this.images.length > excludedUrls.size && excludedUrls.has(candidate.url)) {
          this.queue.push(candidate);
          continue;
        }

        this.lastUrl = candidate.url;
        return candidate;
      }

      const fallback = this.images[Math.floor(Math.random() * this.images.length)];
      this.lastUrl = fallback.url;
      return fallback;
    }
  }

  window.EidosImageSource = { loadImages, shuffle, ImageDeck };
})();
