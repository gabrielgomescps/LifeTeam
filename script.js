(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== GRADE DE AULAS — dados reais da programação semanal =====
  var grade = [
    { name: 'Mobilidade Articular', mg: 'MO', days: ['Seg', 'Qua'], dias: 'Segunda e Quarta', chips: ['Seg · Qua · 18h30'] },
    { name: 'Mat Pilates / Alongamento', mg: 'PI', days: ['Ter', 'Qui'], dias: 'Terça e Quinta', chips: ['Ter · Qui · 8h'] },
    { name: 'Muay Thai', mg: 'MT', days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], dias: 'Segunda a Sexta', chips: ['Seg a Sex · 08h30'] },
    { name: 'Muay Thai', mg: 'MT', days: ['Seg', 'Qua'], dias: 'Segunda e Quarta', chips: ['Seg · Qua · 19h15'] },
    { name: 'Jump', mg: 'JP', days: ['Seg', 'Qua'], dias: 'Segunda e Quarta', chips: ['Seg · 20h15', 'Qua · 19h30'], note: 'Confirmar horário por dia' },
    { name: 'Jiu-Jitsu', mg: 'JJ', days: ['Seg', 'Ter', 'Qui'], dias: 'Segunda, Terça e Quinta', chips: ['Seg · Ter · Qui · 20h30'] },
    { name: 'Treinamento Funcional', mg: 'FN', days: ['Seg', 'Qua'], dias: 'Segunda e Quarta', chips: ['Seg · Qua · 17h'] },
    { name: 'Treinamento Funcional', mg: 'FN', days: ['Ter', 'Qui'], dias: 'Terça e Quinta', chips: ['Ter · 9h', 'Qui · 19h'], note: 'Confirmar horário por dia' },
    { name: 'Pilates Ball', mg: 'PB', days: ['Ter', 'Qui'], dias: 'Terça e Quinta', chips: ['Ter · Qui · 18h30'] }
  ];
  var dayNames = ['Todos', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  var currentDay = 'Todos';

  var clockIcon = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"></path></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function renderTabs() {
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    dayNames.forEach(function (d) {
      var b = document.createElement('button');
      b.className = 'tab' + (currentDay === d ? ' on' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', currentDay === d ? 'true' : 'false');
      b.textContent = d;
      b.addEventListener('click', function () { currentDay = d; renderTabs(); renderCards(); });
      tabs.appendChild(b);
    });
  }

  function renderCards() {
    var wrap = document.getElementById('ggrid');
    if (!wrap) return;
    var list = currentDay === 'Todos' ? grade : grade.filter(function (c) { return c.days.indexOf(currentDay) !== -1; });
    wrap.innerHTML = list.map(function (c) {
      var chips = c.chips.map(function (h) {
        return '<span class="chip">' + clockIcon + esc(h) + '</span>';
      }).join('');
      var note = c.note ? '<p class="gnote">⚠ ' + esc(c.note) + '</p>' : '';
      return '<article class="gcard">' +
        '<div class="fx ac gap12"><span class="mg">' + esc(c.mg) + '</span><div><h3 class="gname m0">' + esc(c.name) + '</h3><div class="gdays">' + esc(c.dias) + '</div></div></div>' +
        '<div class="fx ac gap8 wrap mt12">' + chips + '</div>' + note +
        '</article>';
    }).join('');
  }

  // ===== HERO CAROUSEL =====
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var dots = [].slice.call(document.querySelectorAll('.dot'));
  var bar = document.getElementById('hbar');
  var slide = 0, paused = false, timer = null;
  var N = slides.length;

  function restartBar() {
    if (!bar || reduced) return;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = '';
  }
  function go(i) {
    slide = (i + N) % N;
    slides.forEach(function (s, idx) {
      s.classList.toggle('on', idx === slide);
      s.setAttribute('aria-hidden', idx === slide ? 'false' : 'true');
    });
    dots.forEach(function (d, idx) { d.classList.toggle('on', idx === slide); });
    restartBar();
  }
  function startTimer() {
    if (reduced) return;
    clearInterval(timer);
    timer = setInterval(function () { if (!paused) go(slide + 1); }, 5000);
  }

  if (N > 1) {
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(+d.getAttribute('data-go')); startTimer(); });
    });
    var prev = document.getElementById('prevSlide');
    var next = document.getElementById('nextSlide');
    if (prev) prev.addEventListener('click', function () { go(slide - 1); startTimer(); });
    if (next) next.addEventListener('click', function () { go(slide + 1); startTimer(); });
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', function () { paused = true; });
      hero.addEventListener('mouseleave', function () { paused = false; });
      var tx = 0;
      hero.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
      hero.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 40) { go(slide + (dx < 0 ? 1 : -1)); startTimer(); }
      });
    }
    startTimer();
  }

  // ===== HEADER + FAB + BARRA DE PROGRESSO =====
  var hdr = document.getElementById('hdr');
  var fab = document.getElementById('fab');
  var prog = document.getElementById('prog');
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('on', y > 8);
    if (fab) fab.classList.toggle('on', y > window.innerHeight * 0.6);
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== MENU MÓVEL =====
  var drw = document.getElementById('drw');
  var scrim = document.getElementById('scrim');
  var burger = document.getElementById('burger');
  var drwClose = document.getElementById('drwClose');
  function openMenu() {
    if (drw) drw.classList.add('on');
    if (scrim) scrim.classList.add('on');
    if (burger) burger.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (drw) drw.classList.remove('on');
    if (scrim) scrim.classList.remove('on');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) burger.addEventListener('click', openMenu);
  if (scrim) scrim.addEventListener('click', closeMenu);
  if (drwClose) drwClose.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drw && drw.classList.contains('on')) closeMenu();
  });
  if (drw) [].slice.call(drw.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  // ===== SCROLL-REVEAL COM STAGGER =====
  var revs = [].slice.call(document.querySelectorAll('.rv'));
  if (reduced || !('IntersectionObserver' in window)) {
    revs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revs.forEach(function (el) {
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('rv'); });
      el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) * 70) + 'ms';
      io.observe(el);
    });
  }

  // ===== CONTADORES ANIMADOS =====
  function count(el) {
    var target = +el.dataset.cnt, suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suf; return; }
    var t0 = performance.now(), dur = 1200;
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = [].slice.call(document.querySelectorAll('[data-cnt]'));
  if (reduced || !('IntersectionObserver' in window)) {
    counters.forEach(count);
  } else {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { count(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // ===== COOKIES =====
  var cook = document.getElementById('cook');
  var cookOk = document.getElementById('cookOk');
  try {
    if (cook && !localStorage.getItem('lt_cookies_ok')) cook.hidden = false;
  } catch (e) {}
  if (cookOk) cookOk.addEventListener('click', function () {
    try { localStorage.setItem('lt_cookies_ok', '1'); } catch (e) {}
    if (cook) cook.hidden = true;
  });

  // ===== INIT =====
  renderTabs();
  renderCards();
})();
