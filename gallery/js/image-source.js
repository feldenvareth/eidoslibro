(() => {
  'use strict';

  /*
   * EIDOS · Fuente dinámica de imágenes para GitHub Pages
   *
   * No usa PHP, images.json ni GitHub Actions. Lee directamente el árbol
   * del repositorio público mediante la API de GitHub y toma todos los
   * archivos incluidos en gallery/images/gallery, también en subcarpetas.
   */

  const CONFIG = Object.freeze({
    owner: 'feldenvareth',
    folder: 'gallery/images/gallery',
    repositoryOverride: '',
    repositoryCacheKey: 'eidos-gallery-repository-v3',
    repositoryCacheDays: 30
  });

  const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
  const GITHUB_API = 'https://api.github.com';

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function encodePath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  function imageName(path) {
    const filename = path.split('/').pop() || 'Imagen de Eidos';
    return filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Imagen de Eidos';
  }

  async function githubRequest(url) {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      let message = '';
      try {
        const error = await response.json();
        message = error && error.message ? ` ${error.message}` : '';
      } catch {
        // La respuesta puede no ser JSON.
      }

      if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
        throw new Error('GitHub ha limitado temporalmente las consultas. Espera unos minutos y vuelve a cargar.');
      }

      const error = new Error(`GitHub no pudo devolver la biblioteca (${response.status}).${message}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  function currentHostname() {
    return window.location.hostname.replace(/^www\./i, '').toLowerCase();
  }

  function homepageHostname(homepage) {
    if (!homepage) return '';
    try {
      return new URL(homepage).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return String(homepage).replace(/^https?:\/\//i, '').split('/')[0].replace(/^www\./i, '').toLowerCase();
    }
  }

  function repositoryScore(repo) {
    let score = 0;
    const name = String(repo.name || '').toLowerCase();
    const description = String(repo.description || '').toLowerCase();
    const hostname = currentHostname();

    if (homepageHostname(repo.homepage) === hostname) score += 1000;
    if (name === `${CONFIG.owner.toLowerCase()}.github.io`) score += 800;
    if (description.includes('eidos')) score += 500;
    if (name.includes('eidos')) score += 350;
    if (repo.has_pages) score += 200;
    if (repo.default_branch === 'main') score += 10;

    const updated = Date.parse(repo.pushed_at || repo.updated_at || 0);
    if (Number.isFinite(updated)) score += Math.max(0, updated / 1e13);
    return score;
  }

  function readRepositoryCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CONFIG.repositoryCacheKey) || 'null');
      if (!cached || !cached.name || !cached.branch || !cached.savedAt) return null;
      const maximumAge = CONFIG.repositoryCacheDays * 24 * 60 * 60 * 1000;
      if (Date.now() - cached.savedAt > maximumAge) return null;
      return cached;
    } catch {
      return null;
    }
  }

  function saveRepositoryCache(repository) {
    try {
      localStorage.setItem(CONFIG.repositoryCacheKey, JSON.stringify({
        name: repository.name,
        branch: repository.branch,
        savedAt: Date.now()
      }));
    } catch {
      // La galería funciona aunque el navegador bloquee localStorage.
    }
  }

  function clearRepositoryCache() {
    try {
      localStorage.removeItem(CONFIG.repositoryCacheKey);
    } catch {
      // Sin efecto si localStorage está bloqueado.
    }
  }

  async function getTree(repositoryName, branch) {
    const owner = encodeURIComponent(CONFIG.owner);
    const repo = encodeURIComponent(repositoryName);
    const ref = encodeURIComponent(branch || 'main');
    const url = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`;
    const data = await githubRequest(url);

    if (!data || !Array.isArray(data.tree)) {
      throw new Error('GitHub devolvió un árbol de archivos no válido.');
    }
    return data.tree;
  }

  function folderExists(tree) {
    const prefix = `${CONFIG.folder.replace(/\/+$/, '')}/`;
    return tree.some(item => item && typeof item.path === 'string' && item.path.startsWith(prefix));
  }

  function imagesFromTree(tree, repositoryName, branch) {
    const prefix = `${CONFIG.folder.replace(/\/+$/, '')}/`;
    const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(CONFIG.owner)}/${encodeURIComponent(repositoryName)}/${encodeURIComponent(branch)}/`;

    return tree
      .filter(item => item && item.type === 'blob' && typeof item.path === 'string')
      .filter(item => item.path.startsWith(prefix) && IMAGE_EXTENSION.test(item.path))
      .map(item => ({
        url: `${rawBase}${encodePath(item.path)}`,
        name: imageName(item.path),
        path: item.path.slice(prefix.length)
      }));
  }

  async function tryRepository(name, branch) {
    const tree = await getTree(name, branch);
    if (!folderExists(tree)) return null;
    return { name, branch, tree };
  }

  async function discoverRepository() {
    if (CONFIG.repositoryOverride) {
      const match = await tryRepository(CONFIG.repositoryOverride, 'main');
      if (!match) {
        throw new Error(`No se encontró ${CONFIG.folder} en el repositorio configurado.`);
      }
      saveRepositoryCache(match);
      return match;
    }

    const cached = readRepositoryCache();
    if (cached) {
      try {
        const match = await tryRepository(cached.name, cached.branch);
        if (match) return match;
      } catch (error) {
        if (error.status === 403) throw error;
      }
      clearRepositoryCache();
    }

    const owner = encodeURIComponent(CONFIG.owner);
    const repositories = await githubRequest(`${GITHUB_API}/users/${owner}/repos?per_page=100&sort=updated&type=owner`);
    if (!Array.isArray(repositories) || !repositories.length) {
      throw new Error('No se encontraron repositorios públicos para cargar la galería.');
    }

    const candidates = repositories
      .filter(repo => repo && !repo.archived && !repo.disabled)
      .sort((a, b) => repositoryScore(b) - repositoryScore(a))
      .slice(0, 15);

    for (const repo of candidates) {
      try {
        const match = await tryRepository(repo.name, repo.default_branch || 'main');
        if (match) {
          saveRepositoryCache(match);
          return match;
        }
      } catch (error) {
        if (error.status === 403) throw error;
        // Se prueba el siguiente repositorio público.
      }
    }

    throw new Error(`No se encontró la carpeta ${CONFIG.folder} en los repositorios de ${CONFIG.owner}.`);
  }

  async function loadImages() {
    const repository = await discoverRepository();
    const images = imagesFromTree(repository.tree, repository.name, repository.branch);
    return shuffle(images);
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
