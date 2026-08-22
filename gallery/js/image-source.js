(() => {
  'use strict';
  const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function imageName(path) {
    const filename = String(path || '').split('/').pop() || 'Imagen de Eidos';
    return filename.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim() || 'Imagen de Eidos';
  }

  function normalizeItem(item) {
    if (!item) return null;
    if (typeof item === 'string') item = {url:item,path:item};
    if (typeof item !== 'object') return null;
    const url = String(item.url || '').trim();
    const path = String(item.path || url).trim();
    if (!url || !IMAGE_EXTENSION.test(path.split(/[?#]/)[0])) return null;
    return {url, name:String(item.name || imageName(path)).trim() || imageName(path), path};
  }

  async function loadImages() {
    if (!Array.isArray(window.EIDOS_IMAGE_MANIFEST)) {
      throw new Error('No se encontró js/image-manifest.js. Ejecuta ACTUALIZAR_GALERIA.bat.');
    }
    const seen = new Set(), images = [];
    for (const raw of window.EIDOS_IMAGE_MANIFEST) {
      const item = normalizeItem(raw);
      if (!item || seen.has(item.url)) continue;
      seen.add(item.url);
      images.push(item);
    }
    return shuffle(images);
  }

  class ImageDeck {
    constructor(images) {
      this.images=[...images];
      this.invalidUrls=new Set();
      this.queue=[];
      this.lastUrl='';
      this.refill();
    }
    reject(url) {
      if (!url) return;
      this.invalidUrls.add(url);
      this.queue=this.queue.filter(item=>item && item.url!==url);
      if (this.lastUrl===url) this.lastUrl='';
    }
    validImages() {
      return this.images.filter(item=>item && !this.invalidUrls.has(item.url));
    }
    refill() {
      this.queue=shuffle(this.validImages());
    }
    next(excludedUrls=new Set()) {
      const available=this.validImages();
      if (!available.length) return null;
      let attempts=0, max=Math.max(available.length*3,12);
      while (attempts<max) {
        if (!this.queue.length) this.refill();
        const candidate=this.queue.shift();
        attempts++;
        if (!candidate || this.invalidUrls.has(candidate.url)) continue;
        if (available.length>1 && candidate.url===this.lastUrl) {this.queue.push(candidate);continue;}
        if (available.length>excludedUrls.size && excludedUrls.has(candidate.url)) {this.queue.push(candidate);continue;}
        this.lastUrl=candidate.url;
        return candidate;
      }
      const fallback=available.find(item=>!excludedUrls.has(item.url)) || available[0];
      this.lastUrl=fallback.url;
      return fallback;
    }
  }

  window.EidosImageSource={loadImages,shuffle,ImageDeck};
})();
