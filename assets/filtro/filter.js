let list = document.querySelectorAll('.list');
let itemBox = document.querySelectorAll('.itemBox');

for (let i = 0; i < list.length; i++) {
  list[i].addEventListener('click', function () {
    for (let j = 0; j < list.length; j++) {
      list[j].classList.remove('active');
    }
    this.classList.add('active');

    let dataFilter = this.getAttribute('data-filter');

    for (let k = 0; k < itemBox.length; k++) {
      itemBox[k].classList.remove('active');
      itemBox[k].classList.add('hide');

      if (
        itemBox[k].getAttribute('data-item') == dataFilter ||
        dataFilter == 'all'
      ) {
        itemBox[k].classList.remove('hide');
        itemBox[k].classList.add('active');
      }
    }
  });
}
 let listej = document.querySelectorAll('.listej');
  let itemBoxej = document.querySelectorAll('.itemBoxej');

  for (let i = 0; i < listej.length; i++) {
    listej[i].addEventListener('click', function () {
      for (let j = 0; j < listej.length; j++) { // Cambié "list" a "listej" para que coincida con el selector correcto
        listej[j].classList.remove('active');
      }
      this.classList.add('active');

      let dataFilter = this.getAttribute('data-filter');

      for (let k = 0; k < itemBoxej.length; k++) { // Cambié "itemBox" a "itemBoxej" para que coincida con el selector correcto
        itemBoxej[k].classList.remove('active');
        itemBoxej[k].classList.add('hide');

        if (itemBoxej[k].getAttribute('data-item') == dataFilter || dataFilter == 'all') {
          itemBoxej[k].classList.remove('hide');
          itemBoxej[k].classList.add('active');
        }
      }
    });
  }
