(function(){
  const nav = document.querySelector('.blog-nav');
  const toggle = document.querySelector('.nav-toggle');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.textContent = '☰';
      });
    });
    window.addEventListener('resize', () => {
      if(window.innerWidth > 900){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.textContent = '☰';
      }
    });
  }

  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  items.forEach(el => observer.observe(el));
})();
