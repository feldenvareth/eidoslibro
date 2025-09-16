document.addEventListener("DOMContentLoaded", () => {
  const countryFilters = document.querySelectorAll(".filtro .country"); // Filtros de país
  const comunidadesFilter = document.querySelectorAll(".filtro.comunidades li"); // Filtros de comunidades
  const municipios = document.querySelectorAll(".itemBoxej"); // Municipios

  // Función para mostrar/ocultar elementos
  const toggleVisibility = (elements, condition) => {
    elements.forEach((element) => {
      if (condition(element)) {
        element.classList.remove("hide");
        element.classList.add("active");
      } else {
        element.classList.add("hide");
        element.classList.remove("active");
      }
    });
  };

  // Mostrar todo inicialmente
  const showAll = () => {
    toggleVisibility(countryFilters, () => true); // Mostrar países
    toggleVisibility(comunidadesFilter, () => true); // Mostrar comunidades
    toggleVisibility(municipios, () => true); // Mostrar municipios
  };

  // Manejo del filtro de país
  countryFilters.forEach((country) => {
    country.addEventListener("click", () => {
      const selectedCountry = country.getAttribute("data-filter");

      if (selectedCountry === "all") {
        showAll();
        return;
      }

      // Mostrar solo comunidades y municipios relacionados con el país seleccionado
      toggleVisibility(countryFilters, () => true); // Mantener los filtros de país visibles
      toggleVisibility(comunidadesFilter, (item) =>
        item.getAttribute("data-country") === selectedCountry
      );
      toggleVisibility(municipios, (item) =>
        item.getAttribute("data-country") === selectedCountry
      );
    });
  });

  // Manejo del filtro de comunidad
  comunidadesFilter.forEach((community) => {
    community.addEventListener("click", () => {
      const selectedCommunity = community.getAttribute("data-filter");
      const selectedCountry = community.getAttribute("data-country");

      if (selectedCommunity === "all") {
        showAll();
        return;
      }

      // Mostrar solo comunidades del mismo país
      toggleVisibility(comunidadesFilter, (item) =>
        item.getAttribute("data-country") === selectedCountry
      );

      // Mostrar solo municipios que pertenecen tanto al país como a la comunidad seleccionada
      toggleVisibility(municipios, (item) =>
        item.getAttribute("data-country") === selectedCountry &&
        item.getAttribute("data-item") === selectedCommunity
      );
    });
  });

  // Mostrar todo al cargar la página
  showAll();
});

document.querySelectorAll('.itemBox').forEach((item) => {
  if (item.matches('.hide')) {
    // Ocultar con transición
    item.classList.remove('active');
    item.classList.add('hide');
  } else {
    // Mostrar con transición
    item.classList.remove('hide');
    item.classList.add('active');
  }
});

let filterItems = document.querySelectorAll('.mu-google-btni');
let itemBoxej = document.querySelectorAll('.itemBoxej');

for (let i = 0; i < filterItems.length; i++) {
  filterItems[i].addEventListener('click', function() {
    let filterValue = this.getAttribute('data-filter');
    
    // Si se hace clic en 'Próximamente'
    if (filterValue === 'prox') {
      // Ocultar todos los elementos excepto el de 'Próximamente'
      for (let k = 0; k < itemBoxej.length; k++) {
        itemBoxej[k].classList.add('hide');  // Ocultar todos los elementos
      }
      // Mostrar solo el elemento de 'Próximamente'
      let proxButton = document.querySelector('.itemBoxej[data-item="prox"]');
      if (proxButton) proxButton.classList.remove('hide');
    }
    // Para cualquier otro filtro
    else {
      for (let k = 0; k < itemBoxej.length; k++) {
        itemBoxej[k].classList.remove('hide'); // Mostrar todos los elementos
      }
    }
  });
}
