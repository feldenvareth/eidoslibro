(function(window, document){
  'use strict';

  var GA_ID = 'G-SCSFPYKJTX';

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  function readConsentObject(){
    try {
      var raw = localStorage.getItem('ga_consent_v2');
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') return saved;
    } catch(e){}
    return null;
  }

  function hasAnalyticsConsent(){
    try {
      var saved = readConsentObject();
      return !!(saved && saved.analytics_storage === 'granted');
    } catch(e){}
    return false;
  }

  function applyStoredConsent(){
    var saved = readConsentObject();
    if (!saved) return;
    try {
      gtag('consent', 'update', saved);
    } catch(e){}
  }

  applyStoredConsent();

  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(gaScript);

  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false });

  function trackEvent(name, params){
    if (!hasAnalyticsConsent()) return;
    try {
      gtag('event', name, params || {});
    } catch(e){}
  }

  function sendPageViewIfNeeded(){
    if (!hasAnalyticsConsent()) return;
    trackEvent('page_view', {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title
    });
  }

  function setLocalFlag(key, value){
    try {
      localStorage.setItem(key, value);
    } catch(e){}
  }

  function getLocalFlag(key){
    try {
      return localStorage.getItem(key);
    } catch(e){}
    return null;
  }

  function getPostId(){
    if (!document.body) return '';
    return document.body.getAttribute('data-post-id') || '';
  }

  function getPageType(){
    if (!document.body) return '';
    return document.body.getAttribute('data-page-type') || '';
  }

  function getBookFromHref(href){
    if (!href) return '';
    if (href.indexOf('B0FCR5ZPBJ') !== -1) return 'eidos';
    if (href.indexOf('B0G8HLFJXT') !== -1) return 'eidos_relatos';
    return '';
  }

  function wasPdfOpened(postId){
    if (!postId) return 'no';
    return getLocalFlag('opened_pdf_' + postId) === 'yes' ? 'yes' : 'no';
  }

  function trackAmazonClick(postId, destination, href){
    trackEvent('amazon_click', {
      post_id: postId || '',
      destination: destination || '',
      opened_pdf: wasPdfOpened(postId),
      link_url: href || '',
      page_type: getPageType()
    });
  }

  function trackPdfOpen(postId, title, pdfUrl){
    if (postId) {
      setLocalFlag('opened_pdf_' + postId, 'yes');
    }

    trackEvent('chapter_open', {
      post_id: postId || '',
      title: title || '',
      pdf_url: pdfUrl || '',
      page_type: getPageType()
    });
  }

  function wireAmazonLinks(){
    var links = document.querySelectorAll('a[href]');
    var postId = getPostId();
    var i;
    var link;
    var href;
    var book;

    for (i = 0; i < links.length; i++) {
      link = links[i];
      href = link.getAttribute('href') || '';
      book = getBookFromHref(href);

      if (book) {
        (function(currentLink, currentBook){
          currentLink.addEventListener('click', function(){
            trackAmazonClick(postId, currentBook, currentLink.href);
          });
        })(link, book);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    sendPageViewIfNeeded();
    wireAmazonLinks();

    if (document.body && document.body.hasAttribute('data-pdf-post-id')) {
      var postId = document.body.getAttribute('data-pdf-post-id') || '';
      var title = document.body.getAttribute('data-pdf-title') || '';
      var pdfUrl = document.body.getAttribute('data-pdf-url') || '';

      trackPdfOpen(postId, title, pdfUrl);
    }
  });

})(window, document);