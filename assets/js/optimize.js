// Eidos perf + media helpers (ASCII-safe)
(function () {
  // ===== AUDIO (only after user gesture) =====
  const AUDIO_SRC = 'assets/audio/seventh.mp3';
  const audio  = document.getElementById('bg-audio');
  const toggle = document.getElementById('audio-toggle');
  const icon   = document.getElementById('audio-toggle-icon');
  const slider = document.getElementById('audio-volume');

  // ===== YOUTUBE modal refs =====
  const iframe  = document.querySelector('.mu-video-iframe');
  const playBtn = document.querySelector('.mu-video-play-btn') || document.querySelector('.mu-google-btn');
  const closeBtn= document.querySelector('.mu-video-close-btn');
  const area    = document.querySelector('.mu-video-iframe-area');

  // remember if music was playing before opening the video
  let wasPlayingBeforeVideo = false;

  function videoOpen() {
    return !!area && area.classList.contains('open');
  }

  function setIcon(){
    if (!icon || !audio) return;
    // muted (red slash) = &#128263;  |  speaker high = &#128266;
    const muted = audio.paused || audio.volume === 0 || videoOpen();
    icon.innerHTML = muted ? '&#128263;' : '&#128266;';
  }

  function ensureSrc() { if (audio && !audio.src) audio.src = AUDIO_SRC; }

  async function fadeTo(target, ms) {
    if (!audio) return;
    const start = Number.isFinite(audio.volume) ? audio.volume : 0;
    const steps = Math.max(1, Math.round(ms / 40));
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 40));
      audio.volume = start + (target - start) * (i / steps);
    }
  }

  // toggle button (blocked while video is open)
  toggle?.addEventListener('click', async (e) => {
    if (videoOpen()) { e.preventDefault(); return; }
    if (!audio) return;
    ensureSrc();
    try {
      if (audio.paused) {
        const v = Math.max(0.01, (Number(slider?.value) || 50) / 100);
        audio.volume = v;
        await audio.play();
      } else {
        await fadeTo(0, 150);
        audio.pause();
      }
    } catch (e) {}
    setIcon();
  });

  // volume slider (blocked while video is open)
  slider?.addEventListener('input', (e) => {
    if (videoOpen()) return;
    if (!audio) return;
    ensureSrc();
    const v = Math.max(0, Math.min(100, Number(e.target.value))) / 100;
    audio.volume = v;
    setIcon();
  });

  document.addEventListener('DOMContentLoaded', () => {
    setIcon();
    if (slider && Number.isFinite(audio?.volume)) {
      slider.value = Math.round((audio.volume || 0.5) * 100);
    }
  });

  window.addEventListener('pageshow', setIcon);
  
  

  // ===== YOUTUBE (lazy load + stop audio on close + resume bg music) =====
function openVideo(){
  // Saca el modal al <body> para que no herede opacidad de ancestros
  if (area && area.parentElement !== document.body) {
    document.body.appendChild(area);
  }

  area?.classList.add('open');
  document.body.classList.add('no-scroll');

  // recuerda si sonaba la música y páusala (tu código actual)
  wasPlayingBeforeVideo = !!(audio && !audio.paused && audio.volume > 0);
  if (audio && !audio.paused){ audio.pause(); setIcon(); }

  if (iframe && !iframe.src){
    let url = iframe.dataset?.src || '';
    if (url && !/enablejsapi=1/.test(url)){
      url += (url.includes('?') ? '&' : '?') + 'enablejsapi=1';
    }
    if (url) iframe.src = url;
  }
}


  function closeVideo(){
    area?.classList.remove('open');
    if (iframe) {
      // try API stop (ok if it fails)
      try {
        iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}','*');
      } catch(e){}
      // unload src to cut audio on all browsers
      const url = iframe.getAttribute('src') || iframe.dataset?.src || '';
      iframe.removeAttribute('src');
      if (url) iframe.dataset.src = url; // ready to reopen
    }

    // if music was ON before opening, resume it
    if (wasPlayingBeforeVideo) {
      ensureSrc();
      audio?.play().catch(()=>{});
    }
    wasPlayingBeforeVideo = false;
    setIcon();
  }

  // prevent closing by clicking the dark backdrop (only the X closes)
  area?.addEventListener('click', function (e) {
    if (e.target.closest('.mu-video-close-btn')) return; // allow X
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
  }, true);

  playBtn?.addEventListener('click', (e) => { e.preventDefault(); openVideo(); });
  closeBtn?.addEventListener('click', (e) => { e.preventDefault(); closeVideo(); });
})();
