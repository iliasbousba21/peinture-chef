/* Galerij: actieve categorie in de balk volgen */
(function () {
  'use strict';
  var links = Array.prototype.slice.call(document.querySelectorAll('.pc-filter a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var byId = {};
  var nav = document.getElementById('pc-nav');
  var bar = document.querySelector('.pc-filter');
  links.forEach(function (a) {
    byId[a.getAttribute('href').slice(1)] = a;
    a.addEventListener('click', function (e) {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      e.stopPropagation(); // niet laten overnemen door de trage scroll van Webflow
      var navH = nav ? Math.min(nav.offsetHeight, 84) : 80;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - bar.offsetHeight - 32;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + target.id);
    });
  });
  function setActive(id) {
    links.forEach(function (a) { a.classList.toggle('is-active', a === byId[id]); });
    var a = byId[id];
    if (a && a.scrollIntoView) {
      var list = a.parentNode.parentNode;
      list.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
    }
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.pc-gcat').forEach(function (s) { io.observe(s); });
})();
