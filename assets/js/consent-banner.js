(function(window, document){
  'use strict';

  if (window.__consentBannerInitialized) return;
  window.__consentBannerInitialized = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function applyConsentObject(obj){
    try {
      gtag('consent', 'update', obj);
    } catch(e){}

    try {
      localStorage.setItem('ga_consent_v2', JSON.stringify(obj));
    } catch(e){}
  }

  function getStoredConsent(){
    try {
      var raw = localStorage.getItem('ga_consent_v2');
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') return saved;
    } catch(e){}
    return null;
  }

  function hasStoredChoice(){
    try {
      return !!localStorage.getItem('ga_consent_v2');
    } catch(e){}
    return false;
  }

  function sendPageViewIfNeeded(){
    try {
      var saved = JSON.parse(localStorage.getItem('ga_consent_v2') || '{}');
      if (saved.analytics_storage === 'granted' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view');
      }
    } catch(e){}
  }

function injectStyles(){
  if (document.getElementById('consent-banner-styles')) return;

  var style = document.createElement('style');
  style.id = 'consent-banner-styles';
  style.textContent = [
    '#cb-banner{position:fixed;left:0;right:0;bottom:0;z-index:10000;background:#f7f7f7;border-top:1px solid #ddd;padding:12px;font-family:Arial,sans-serif}',
    '#cb-banner p{margin:0 0 8px;color:#222;font-size:14px;line-height:1.45;background:transparent}',
    '#cb-banner .cb-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;background:transparent}',
    '#cb-banner button{border:0;padding:10px 14px;border-radius:6px;cursor:pointer;font-size:14px}',
    '#cb-accept{background:#1a73e8;color:#fff}',
    '#cb-reject{background:#eaeaea;color:#222}',
    '#cb-config{background:#fff;border:1px solid #ccc;color:#222}',

    '.cb-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10001;display:none}',
    '.cb-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;z-index:10002;width:min(520px,92vw);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.2);display:none;font-family:Arial,sans-serif;overflow:hidden}',
    '.cb-modal *{box-sizing:border-box}',
    '.cb-modal-header{padding:14px 16px;border-bottom:1px solid #eee;font-weight:600;background:#fff;color:#111}',
    '.cb-modal-body{padding:14px 16px;max-height:60vh;overflow:auto;background:#fff}',
    '.cb-row{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px dashed #eee;background:#fff}',
    '.cb-row:last-child{border-bottom:none}',
    '.cb-row > div{background:transparent !important}',
    '.cb-modal h4{margin:.2rem 0;font-size:16px;color:#111;background:transparent}',
    '.cb-modal p{margin:.2rem 0;color:#555;font-size:.95rem;line-height:1.45;background:transparent}',
    '.cb-actions{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #eee;background:#fff}',
    '.cb-actions button{border:0;padding:10px 14px;border-radius:8px;cursor:pointer}',
    '.cb-btn-primary{background:#1a73e8;color:#fff}',
    '.cb-btn-ghost{background:#eaeaea;color:#222}',

    '.cb-switch{position:relative;display:inline-block;width:44px;height:24px;background:transparent}',
    '.cb-switch input{opacity:0;width:0;height:0}',
    '.cb-slider{position:absolute;cursor:pointer;inset:0;background:#ccc;transition:.2s;border-radius:24px}',
    '.cb-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;top:3px;background:white;transition:.2s;border-radius:50%}',
    '.cb-switch input:checked + .cb-slider{background:#1a73e8}',
    '.cb-switch input:checked + .cb-slider:before{transform:translateX(20px)}'
  ].join('');
  document.head.appendChild(style);
}


function injectMarkup(){
  if (document.getElementById('cb-banner')) return;

  var wrapper = document.createElement('div');
  wrapper.innerHTML =
    '<div id="cb-banner" hidden>' +
      '<p>Usamos cookies analíticas (Google Analytics) y puedes elegir tus preferencias. Más info en nuestra <a href="/terminosycondiciones.html" rel="noopener">Política de Privacidad</a>.</p>' +
      '<div class="cb-btns">' +
        '<button id="cb-accept">Aceptar todo</button>' +
        '<button id="cb-reject">Rechazar</button>' +
        '<button id="cb-config">Configurar</button>' +
      '</div>' +
    '</div>' +
    '<div class="cb-backdrop" id="cb-backdrop"></div>' +
    '<div class="cb-modal" id="cb-modal" role="dialog" aria-modal="true" aria-labelledby="cb-modal-title">' +
      '<div class="cb-modal-header" id="cb-modal-title">Preferencias de privacidad</div>' +
      '<div class="cb-modal-body">' +
        '<div class="cb-row">' +
          '<div>' +
            '<label class="cb-switch" title="Activar/desactivar cookies de medición">' +
              '<input id="cb-toggle-analytics" type="checkbox">' +
              '<span class="cb-slider"></span>' +
            '</label>' +
          '</div>' +
          '<div>' +
            '<h4>Analíticas (Google Analytics)</h4>' +
            '<p>Nos ayudan a entender el uso del sitio. Sin publicidad ni seguimiento entre sitios.</p>' +
          '</div>' +
        '</div>' +
        '<div class="cb-row">' +
          '<div>' +
            '<label class="cb-switch" title="Publicidad personalizada y medición de anuncios">' +
              '<input id="cb-toggle-ads" type="checkbox">' +
              '<span class="cb-slider"></span>' +
            '</label>' +
          '</div>' +
          '<div>' +
            '<h4>Publicidad (opcional)</h4>' +
            '<p>Permite almacenamiento de anuncios, datos de usuario y personalización. Desactívalo si no quieres publicidad personalizada.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="cb-actions">' +
        '<button class="cb-btn-ghost" id="cb-cancel">Cancelar</button>' +
        '<button class="cb-btn-primary" id="cb-save">Guardar preferencias</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(wrapper);
}


  function initBanner(){
    injectStyles();
    injectMarkup();

    var banner = document.getElementById('cb-banner');
var acceptBt = document.getElementById('cb-accept');
var rejectBt = document.getElementById('cb-reject');
var configBt = document.getElementById('cb-config');

var modal = document.getElementById('cb-modal');
var backdrop = document.getElementById('cb-backdrop');
var saveBt = document.getElementById('cb-save');
var cancelBt = document.getElementById('cb-cancel');

var tgAnalytics = document.getElementById('cb-toggle-analytics');
var tgAds = document.getElementById('cb-toggle-ads');

function showBanner(){ banner.hidden = false; }
function hideBanner(){ banner.hidden = true; }

    function openModal(){
      var saved = getStoredConsent();

      var anaGranted = saved && saved.analytics_storage === 'granted';
      var adsGranted = saved
        && saved.ad_storage === 'granted'
        && saved.ad_user_data === 'granted'
        && saved.ad_personalization === 'granted';

      tgAnalytics.checked = !!anaGranted;
      tgAds.checked = !!adsGranted;

      backdrop.style.display = 'block';
      modal.style.display = 'block';
    }

    function closeModal(){
      backdrop.style.display = 'none';
      modal.style.display = 'none';
    }

    function acceptAll(){
      applyConsentObject({
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
      hideBanner();
      closeModal();
      sendPageViewIfNeeded();
    }

    function rejectAll(){
      applyConsentObject({
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      hideBanner();
      closeModal();
    }

    function saveGranular(){
      applyConsentObject({
        analytics_storage: tgAnalytics.checked ? 'granted' : 'denied',
        ad_storage: tgAds.checked ? 'granted' : 'denied',
        ad_user_data: tgAds.checked ? 'granted' : 'denied',
        ad_personalization: tgAds.checked ? 'granted' : 'denied'
      });
      hideBanner();
      closeModal();
      sendPageViewIfNeeded();
    }

    if (!hasStoredChoice()) {
      showBanner();
    }

    acceptBt.addEventListener('click', acceptAll);
    rejectBt.addEventListener('click', rejectAll);
    configBt.addEventListener('click', openModal);
    saveBt.addEventListener('click', saveGranular);
    cancelBt.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }

})(window, document);