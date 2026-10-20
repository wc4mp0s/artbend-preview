/* ArtBend — comportamento da interface pública.
   Sem dependências externas. Tudo é progressivo: sem JS o site continua navegável. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- menu mobile */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var backdrop = document.querySelector('.nav-backdrop');

  function setNav(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-open', String(open));
    document.body.setAttribute('data-nav-open', String(open));
    if (backdrop) backdrop.hidden = !open;
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setNav(false); });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    setNav(false);
    closeAllMegaMenus();
  });

  /* ------------------------------------------- megamenu de produtos */
  var megaItems = Array.prototype.slice.call(document.querySelectorAll('[data-mega]'));

  function closeAllMegaMenus(except) {
    megaItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('nav__item--open');
      var toggle = item.querySelector('[data-mega-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  megaItems.forEach(function (item) {
    var toggle = item.querySelector('[data-mega-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var open = !item.classList.contains('nav__item--open');
      closeAllMegaMenus(item);
      item.classList.toggle('nav__item--open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // em telas grandes, abre ao passar o mouse
    item.addEventListener('mouseenter', function () {
      if (window.innerWidth > 1060) {
        closeAllMegaMenus(item);
        item.classList.add('nav__item--open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.innerWidth > 1060) {
        item.classList.remove('nav__item--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // fecha ao sair do menu pelo teclado
    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) {
        item.classList.remove('nav__item--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-mega]')) closeAllMegaMenus();
  });

  /* --------------------------------------- sombra do cabeçalho na rolagem */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.setAttribute('data-scrolled', String(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------- revelação ao rolar */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ------------------------------------------------ galeria do produto */
  var galleryMain = document.querySelector('[data-gallery-main] img');
  var thumbs = document.querySelectorAll('[data-gallery-thumb]');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      if (!galleryMain) return;
      galleryMain.src = thumb.getAttribute('data-src');
      galleryMain.alt = thumb.getAttribute('data-alt') || '';
      thumbs.forEach(function (other) { other.setAttribute('aria-current', 'false'); });
      thumb.setAttribute('aria-current', 'true');
    });
  });

  /* ------------------------------------------- filtros em tela pequena */
  var filtersToggle = document.querySelector('[data-filters-toggle]');
  var filtersPanel = document.querySelector('[data-filters-panel]');
  if (filtersToggle && filtersPanel) {
    var syncFilters = function () {
      var small = window.innerWidth <= 920;
      filtersPanel.setAttribute('data-collapsed', String(small && filtersToggle.getAttribute('aria-expanded') !== 'true'));
    };
    filtersToggle.addEventListener('click', function () {
      var open = filtersToggle.getAttribute('aria-expanded') !== 'true';
      filtersToggle.setAttribute('aria-expanded', String(open));
      syncFilters();
    });
    window.addEventListener('resize', syncFilters);
    syncFilters();
  }

  /* --------------------------------------------------- aviso de cookies */
  var cookieBar = document.querySelector('[data-cookie-bar]');
  if (cookieBar) {
    var KEY = 'artbend_cookie_notice';
    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = 'skip'; }
    if (!stored) {
      cookieBar.hidden = false;
      var accept = cookieBar.querySelector('[data-cookie-accept]');
      if (accept) {
        accept.addEventListener('click', function () {
          try { window.localStorage.setItem(KEY, '1'); } catch (e) { /* sessão privada */ }
          cookieBar.hidden = true;
        });
      }
    }
  }

  /* ---------------------------------- envio do formulário: evita duplicidade */
  document.querySelectorAll('form[method="post"]').forEach(function (form) {
    form.addEventListener('submit', function () {
      var button = form.querySelector('button[type="submit"]');
      if (!button || form.noValidate === false && !form.checkValidity()) return;
      window.setTimeout(function () {
        button.setAttribute('aria-disabled', 'true');
        button.textContent = 'Enviando…';
      }, 0);
    });
  });
})();
