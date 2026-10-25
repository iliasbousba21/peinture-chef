/* Peinture & Chef: animaties bij scrollen + lightbox voor foto's */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Klikbare foto's ---------- */
  var photos = Array.prototype.slice.call(
    document.querySelectorAll('.gallery-scroll img:not(.image-49), .about-grid img, .pc-work img, .pc-shot img')
  );

  // Kies de scherpste versie die nog licht genoeg is (max. ~2000px breed)
  function bestSource(img) {
    var set = img.getAttribute('srcset');
    if (!set) return img.currentSrc || img.src;
    var best = null, bestW = 0, smallest = null, smallestW = Infinity;
    set.split(',').forEach(function (part) {
      var bits = part.trim().split(/\s+/);
      var w = parseInt(bits[1], 10);
      if (!bits[0] || !w) return;
      if (w <= 2000 && w > bestW) { best = bits[0]; bestW = w; }
      if (w < smallestW) { smallest = bits[0]; smallestW = w; }
    });
    return best || smallest || img.currentSrc || img.src;
  }

  var lb, lbImg, lbCount, current = -1, lastFocus = null, touchX = null, touchY = null;

  function icon(path) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'pc-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Foto vergroot');
    lb.innerHTML =
      '<div class="pc-lb__stage"><span class="pc-lb__spinner"></span><img class="pc-lb__img" alt=""></div>' +
      '<button type="button" class="pc-lb__btn pc-lb__close" aria-label="Sluiten">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
      '<button type="button" class="pc-lb__btn pc-lb__prev" aria-label="Vorige foto">' + icon('M15 5l-7 7 7 7') + '</button>' +
      '<button type="button" class="pc-lb__btn pc-lb__next" aria-label="Volgende foto">' + icon('M9 5l7 7-7 7') + '</button>' +
      '<div class="pc-lb__count" aria-live="polite"></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('.pc-lb__img');
    lbCount = lb.querySelector('.pc-lb__count');

    lb.querySelector('.pc-lb__close').addEventListener('click', close);
    lb.querySelector('.pc-lb__prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.pc-lb__next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('pc-lb__stage')) close();
    });
    lb.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
      touchX = touchY = null;
    });
    if (photos.length < 2) {
      lb.querySelector('.pc-lb__prev').style.display = 'none';
      lb.querySelector('.pc-lb__next').style.display = 'none';
    }
  }

  function show(i) {
    current = (i + photos.length) % photos.length;
    var src = bestSource(photos[current]);
    lbImg.classList.remove('pc-loaded');
    lb.classList.add('pc-busy');
    lbCount.textContent = photos.length > 1 ? (current + 1) + ' / ' + photos.length : '';
    var loader = new Image();
    loader.onload = loader.onerror = function () {
      if (bestSource(photos[current]) !== src) return; // gebruiker klikte al verder
      lbImg.src = src;
      lbImg.alt = photos[current].alt || '';
      lb.classList.remove('pc-busy');
      requestAnimationFrame(function () { lbImg.classList.add('pc-loaded'); });
    };
    loader.src = src;
    // buren alvast inladen
    [1, -1].forEach(function (d) {
      var n = photos[(current + d + photos.length) % photos.length];
      if (n) (new Image()).src = bestSource(n);
    });
  }

  function step(d) { if (lb.classList.contains('pc-open')) show(current + d); }

  function open(i) {
    if (!lb) buildLightbox();
    lastFocus = document.activeElement;
    doc.classList.add('pc-lock');
    lb.classList.add('pc-open');
    show(i);
    lb.querySelector('.pc-lb__close').focus({ preventScroll: true });
  }

  function close() {
    if (!lb || !lb.classList.contains('pc-open')) return;
    lb.classList.remove('pc-open');
    doc.classList.remove('pc-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('pc-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      var btns = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return b.offsetParent; });
      var first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  photos.forEach(function (img, i) {
    img.classList.add('pc-zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    if (!img.alt) img.alt = 'Realisatie van Peinture & Chef';
    img.setAttribute('aria-label', 'Foto vergroten');
    img.addEventListener('click', function () { open(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  /* ---------- Verschijnen bij scrollen ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll([
      '.heading-jumbo-small', '.home-section-wrap > *', '.about-grid > img',
      '.gallery-scroll h1', '.gallery-scroll p', '.gallery-scroll img',
      '.contact-form-wrap', '.div-block-2 .details-wrap', '.intro-header', '[data-reveal]'
    ].join(','));

    doc.classList.add('pc-js');
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('pc-reveal'); });

    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, n) {
        var el = en.target;
        el.style.setProperty('--pc-delay', Math.min(n * 0.08, 0.4) + 's');
        el.classList.add('pc-in');
        io.unobserve(el);
        // na de animatie: klasse weg, zodat hover-effecten soepel blijven
        setTimeout(function () {
          el.classList.remove('pc-reveal', 'pc-in');
          el.style.removeProperty('--pc-delay');
        }, 1400 + Math.min(n * 80, 400));
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- Zachte overgang tussen pagina's ---------- */
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = a.getAttribute('href');
      if (a.target === '_blank' || !/\.html($|[?#])/.test(href) || a.hostname !== location.hostname) return;
      if (a.pathname === location.pathname) return;
      e.preventDefault();
      document.body.classList.add('pc-leaving');
      setTimeout(function () { location.href = a.href; }, 220);
    });
    // terugknop: pagina niet onzichtbaar laten
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) document.body.classList.remove('pc-leaving');
    });
  }
})();
