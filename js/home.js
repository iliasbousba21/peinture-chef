/* Voorpagina: menubalk wordt wit zodra je scrolt of het menu opent */
(function () {
  'use strict';
  var nav = document.getElementById('pc-nav');
  if (!nav) return;
  var btn = nav.querySelector('.menu-button');
  function update() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    document.documentElement.style.setProperty('--pc-nav-h', nav.offsetHeight + 'px');
    nav.classList.toggle('is-open', !!(btn && btn.classList.contains('w--open')));
  }
  update();
  nav.addEventListener('transitionend', update);
  window.addEventListener('resize', update);
  window.addEventListener('scroll', update, { passive: true });
  if (btn && 'MutationObserver' in window) {
    new MutationObserver(update).observe(btn, { attributes: true, attributeFilter: ['class'] });
  }
})();
