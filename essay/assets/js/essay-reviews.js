/* =========================================================
   EIDOS · ENSAYOS — RESEÑAS / REVIEWS
   Comportamiento compartido por index.html e indexeng.html.

   - Nivel 1: abre/cierra el grupo general de reseñas.
   - Nivel 2: abre/cierra cada reseña.
   - Todo aparece colapsado al cargar.
   - Solo una reseña individual queda abierta cada vez.
   - Los contadores se calculan automáticamente.
   ========================================================= */
(function () {
  function initReviewSection(section, sectionIndex) {
    const category = section.querySelector('.essay-review-category');
    const categoryButton = category?.querySelector('.essay-review-category-button');
    const categoryPanel = category?.querySelector('.essay-review-category-panel');
    const reviews = Array.from(section.querySelectorAll('.essay-review'));

    if (!category || !categoryButton || !categoryPanel) return;

    /* -------------------------------------------------------
       CONTADORES AUTOMÁTICOS
       ------------------------------------------------------- */
    const count = reviews.length;
    const singular = section.dataset.reviewSingular || 'review';
    const plural = section.dataset.reviewPlural || 'reviews';
    const noun = count === 1 ? singular : plural;

    const categoryCount = section.querySelector('[data-review-category-count]');
    if (categoryCount) {
      categoryCount.textContent = `${count} ${noun}`;
    }

    const summary = section.querySelector('[data-review-summary]');
    if (summary) {
      const template = count === 1
        ? (section.dataset.reviewSummarySingular || '{count} selected Amazon review')
        : (section.dataset.reviewSummaryPlural || '{count} selected Amazon reviews');
      summary.textContent = template.replace('{count}', String(count));
    }

    /* -------------------------------------------------------
       ACCESIBILIDAD · IDs AUTOMÁTICOS
       No hace falta crear IDs a mano al añadir una reseña.
       ------------------------------------------------------- */
    const baseId = section.id || `essay-reviews-${sectionIndex + 1}`;

    if (!categoryButton.id) categoryButton.id = `${baseId}-category-button`;
    if (!categoryPanel.id) categoryPanel.id = `${baseId}-category-panel`;
    categoryButton.setAttribute('aria-controls', categoryPanel.id);
    categoryPanel.setAttribute('aria-labelledby', categoryButton.id);

    reviews.forEach(function (review, reviewIndex) {
      const button = review.querySelector('.essay-review-button');
      const panel = review.querySelector('.essay-review-panel');
      if (!button || !panel) return;

      if (!button.id) button.id = `${baseId}-review-${reviewIndex + 1}-button`;
      if (!panel.id) panel.id = `${baseId}-review-${reviewIndex + 1}-panel`;

      button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', button.id);
    });

    /* -------------------------------------------------------
       ESTADOS
       ------------------------------------------------------- */
    function setReviewState(review, open) {
      const button = review.querySelector('.essay-review-button');
      const panel = review.querySelector('.essay-review-panel');

      review.classList.toggle('is-open', open);
      if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    function closeAllReviews() {
      reviews.forEach(function (review) {
        setReviewState(review, false);
      });
    }

    function setCategoryState(open) {
      category.classList.toggle('is-open', open);
      categoryButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      categoryPanel.setAttribute('aria-hidden', open ? 'false' : 'true');

      if (!open) closeAllReviews();
    }

    /* Todo empieza cerrado. */
    closeAllReviews();
    setCategoryState(false);

    /* -------------------------------------------------------
       NIVEL 1 · GRUPO GENERAL
       ------------------------------------------------------- */
    categoryButton.addEventListener('click', function () {
      const willOpen = !category.classList.contains('is-open');
      setCategoryState(willOpen);
    });

    /* -------------------------------------------------------
       NIVEL 2 · RESEÑAS INDIVIDUALES
       ------------------------------------------------------- */
    reviews.forEach(function (review) {
      const button = review.querySelector('.essay-review-button');
      if (!button) return;

      button.addEventListener('click', function () {
        const willOpen = !review.classList.contains('is-open');
        closeAllReviews();
        if (willOpen) setReviewState(review, true);
      });
    });
  }

  function initReviews() {
    document.querySelectorAll('.essay-reviews').forEach(initReviewSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviews, { once: true });
  } else {
    initReviews();
  }
})();
