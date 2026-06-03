/**	
	* Template Name: Apex App
	* Version: 1.0	
	* Template Scripts
	* Author: MarkUps
	* Author URI: http://www.markups.io/

	Custom JS
	
	1. FULL OVERLAY MENU
	2. MENU SMOOTH SCROLLING
	3. VIDEO POPUP
	4. APPS SCREENSHOT SLIDEER ( SLICK SLIDER )
	5. BOOTSTRAP ACCORDION  
	
	
**/

(function( $ ){

	/* ----------------------------------------------------------- */
	/*  CONTROL DE CARGA COMPLETA PARA EL MENU
	/* ----------------------------------------------------------- */

	var pageFullyLoaded = false;

	$(window).on('load', function () {
		pageFullyLoaded = true;
	});


	/* ----------------------------------------------------------- */
	/*  1. FULL OVERLAY MENU
	/* ----------------------------------------------------------- */

	$('.mu-menu-btn').on('click', function(event) {
		event.preventDefault();
		$('.mu-menu-full-overlay').addClass('mu-menu-full-overlay-show');
	});

	// when click close btn
	$('.mu-menu-close-btn').on('click', function(event) {
		event.preventDefault();
		$('.mu-menu-full-overlay').removeClass('mu-menu-full-overlay-show');
	});


	/* ----------------------------------------------------------- */
	/*  2. MENU SMOOTH SCROLLING
	/* ----------------------------------------------------------- */ 

	// MENU SCROLLING WITH ACTIVE ITEM SELECTED
	// Unificado en un solo handler para evitar conflictos

	$('.mu-menu a').on('click', function(event) {
		var hash = this.hash;

		// cerrar overlay siempre
		$('.mu-menu-full-overlay').removeClass('mu-menu-full-overlay-show');

		// si no hay hash o no existe el destino, salir
		if (!hash || !$(hash).length) {
			return;
		}

		event.preventDefault();

		var $target = $(hash);

		function goToSection() {
			var dest = $target.offset().top;

			// evita valores imposibles sin mandar al final de página por error
			var maxScroll = $(document).height() - $(window).height();
			if (dest > maxScroll) {
				dest = maxScroll;
			}
			if (dest < 0) {
				dest = 0;
			}

			$('html, body').stop().animate({
				scrollTop: dest
			}, 1000, 'swing');

			// segundo ajuste por si cambian alturas al terminar de cargar imágenes/sliders
			setTimeout(function() {
				var correctedDest = $target.offset().top;
				var correctedMaxScroll = $(document).height() - $(window).height();

				if (correctedDest > correctedMaxScroll) {
					correctedDest = correctedMaxScroll;
				}
				if (correctedDest < 0) {
					correctedDest = 0;
				}

				$('html, body').stop().animate({
					scrollTop: correctedDest
				}, 200);
			}, 350);
		}

		// si el usuario pulsa demasiado pronto al entrar, esperamos un poco
		if (!pageFullyLoaded) {
			setTimeout(goToSection, 500);
		} else {
			goToSection();
		}
	});
	    

	/* ----------------------------------------------------------- */
	/*  3. VIDEO POPUP
	/* ----------------------------------------------------------- */

	$('.mu-video-play-btn').on('click', function(event) {
		event.preventDefault();
		$('.mu-video-iframe-area').addClass('mu-video-iframe-display');
	});

	// when click the close btn
	$('.mu-video-close-btn').on('click', function(event) {
		event.preventDefault();
		$('.mu-video-iframe-area').removeClass('mu-video-iframe-display');
	});

	// stop iframe if it is play while close the iframe window
	$('.mu-video-close-btn').on('click', function() {
		$('.mu-video-iframe').attr('src', $('.mu-video-iframe').attr('src'));
	});

	// when click overlay area
	$('.mu-video-iframe-area').on('click', function(event) {
		event.preventDefault();
		$('.mu-video-iframe-area').removeClass('mu-video-iframe-display');
	});

	$('.mu-video-iframe-area, .mu-video-iframe').on('click', function(e){
		e.stopPropagation();
	});


	/* ----------------------------------------------------------- */
	/*  4. APPS SCREENSHOT SLIDEER ( SLICK SLIDER )
	/* ----------------------------------------------------------- */

	$('.mu-apps-screenshot-slider').slick({
		slidesToShow: 4,
		responsive: [
			{
				breakpoint: 768,
				settings: {
					arrows: true,
					slidesToShow: 3
				}
			},
			{
				breakpoint: 480,
				settings: {
					arrows: true,
					slidesToShow: 1
				}
			}
		]
	});


	/* ----------------------------------------------------------- */
	/*  5. BOOTSTRAP ACCORDION 
	/* ----------------------------------------------------------- */ 

	/* Start for accordion #1*/
	$('#accordion .panel-collapse').on('shown.bs.collapse', function () {
		$(this).prev().find(".fa").removeClass("fa-plus").addClass("fa-minus");
	});
	
	// The reverse of the above on hidden event:
	$('#accordion .panel-collapse').on('hidden.bs.collapse', function () {
		$(this).prev().find(".fa").removeClass("fa-minus").addClass("fa-plus");
	});

})( jQuery );


/* ----------------------------------------------------------- */
/*  6. screenshot galeria para que salga una imagen sola
/* ----------------------------------------------------------- */ 

document.addEventListener("DOMContentLoaded", function () {
	var images = document.querySelectorAll(".mu-single-screeshot img");
	var zoomOverlay = document.getElementById("zoomOverlay");
	var zoomedImage = document.getElementById("zoomedImage");

	if (!zoomOverlay || !zoomedImage || !images.length) return;

	images.forEach(function(img) {
		img.addEventListener("click", function () {
			zoomedImage.src = img.src;
			zoomOverlay.classList.add("active");
		});
	});

	zoomOverlay.addEventListener("click", function () {
		zoomOverlay.classList.remove("active");
	});
});


/* ---------- Visor imagen + texto ---------- */
(function(){
	var overlay = document.getElementById('zoomOverlay');
	var imgEl   = document.getElementById('zoomedImage');
	var txtEl   = document.getElementById('zoomText');
	var capEl   = document.getElementById('zoomCaption');
	var closeBt = document.getElementById('zoomClose');

	if (!overlay || !imgEl || !txtEl || !capEl || !closeBt) return;

	var defaultText = "Extracto pendiente. Añade el atributo data-extract al <img> para mostrar aquí un texto de la novela.";

	// --- Funciones auxiliares ---
	function escapeHTML(s){
		return s.replace(/[&<>"']/g, function(m){
			return {
				'&':'&amp;',
				'<':'&lt;',
				'>':'&gt;',
				'"':'&quot;',
				"'":'&#39;'
			}[m];
		});
	}

	function toParagraphs(raw){
		// si ya trae <p> lo respetamos
		if (/<\s*p[\s>]/i.test(raw)) return raw;

		// divide SOLO por doble salto de línea → párrafos
		var parts = raw.trim().split(/\r?\n\s*\r?\n/g);

		return parts
			.map(function(p){
				return '<p>' + escapeHTML(p).replace(/\r?\n/g,' ') + '</p>';
			})
			.join('');
	}

	// --- Abre overlay con la imagen clicada ---
	function openOverlay(img){
		imgEl.src = img.getAttribute('src');
		imgEl.alt = img.getAttribute('alt') || '';
		capEl.textContent = img.dataset.caption || '';

		var raw = img.dataset.extract || defaultText;
		txtEl.innerHTML = toParagraphs(raw);

		overlay.classList.add('is-open');
		overlay.setAttribute('aria-hidden','false');
		document.body.style.overflow = 'hidden';
	}

	// --- Cierra overlay ---
	function closeOverlay(){
		overlay.classList.remove('is-open');
		overlay.setAttribute('aria-hidden','true');
		imgEl.src = '';
		document.body.style.overflow = '';
	}

	// --- Click en imágenes de la galería ---
	var galleryImgs = document.querySelectorAll('.mu-apps-screenshot-slider .mu-single-screeshot img');
	galleryImgs.forEach(function(img){
		img.style.cursor = 'zoom-in';
		img.addEventListener('click', function(){ openOverlay(img); });
	});

	// --- Eventos de cierre ---
	closeBt.addEventListener('click', closeOverlay);

	overlay.addEventListener('click', function(e){
		if(e.target === overlay) closeOverlay();
	});

	document.addEventListener('keydown', function(e){
		if(e.key === 'Escape' && overlay.classList.contains('is-open')) {
			closeOverlay();
		}
	});
})();	