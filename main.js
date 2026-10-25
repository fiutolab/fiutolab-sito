/* FiuTO · effetti del sito (niente librerie, niente cookie) */
(function () {
  var html = document.documentElement;
  var animated = html.classList.contains('anim');
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Apertura: logo che si monta, poi vola nella testata ---------- */
  function reveal() { html.classList.add('go'); }

  function intro() {
    var stage = document.querySelector('.intro-stage');
    var big = stage && stage.querySelector('.logo-xl');
    var small = document.querySelector('.site-header .logo');
    var ring = big && big.querySelector('.lg-o .ring');
    var done = false;
    var evs = ['pointerdown', 'keydown', 'wheel', 'touchmove'];
    if (!big || !small || !ring || !big.animate) { finish(); return; }

    function finish() {
      if (done) return;
      done = true;
      try { sessionStorage.setItem('fiuto-intro', '1'); } catch (e) {}
      html.classList.add('intro-done');
      if (stage) stage.remove();
      reveal();
      evs.forEach(function (e) { window.removeEventListener(e, finish); });
    }

    function fly() {
      if (done) return;
      var b = big.getBoundingClientRect(), s = small.getBoundingClientRect();
      var scale = parseFloat(getComputedStyle(small).fontSize) / parseFloat(getComputedStyle(big).fontSize);
      var k = parseFloat(getComputedStyle(html).getPropertyValue('--k')) || 1;
      var t = 820 * k;
      big.style.transformOrigin = '0 0';
      big.animate(
        [{ transform: 'none' }, { transform: 'translate(' + (s.left - b.left) + 'px,' + (s.top - b.top) + 'px) scale(' + scale + ')' }],
        { duration: t, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }
      ).onfinish = finish;
      stage.animate([{ backgroundColor: 'rgba(14,39,45,1)' }, { backgroundColor: 'rgba(14,39,45,0)' }],
        { duration: t * .7, delay: t * .3, easing: 'ease', fill: 'forwards' });
      /* il titolo parte mentre il logo è ancora in volo */
      setTimeout(reveal, t * .45);
    }

    ring.addEventListener('animationend', function () { setTimeout(fly, 120); }, { once: true });
    /* chi ha fretta salta l'apertura: clic, tasto o scroll */
    evs.forEach(function (e) { window.addEventListener(e, finish, { passive: true }); });
  }

  if (html.classList.contains('intro')) intro();
  else if (animated) requestAnimationFrame(function () { requestAnimationFrame(reveal); });

  /* ---------- Menu a tutto schermo (telefono) ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  var main = document.querySelector('main');
  if (menuBtn && menu) {
    var closeTimer;
    var setMenu = function (open) {
      clearTimeout(closeTimer);
      menuBtn.setAttribute('aria-expanded', String(open));
      html.classList.toggle('menu-open', open);
      if (main) main.inert = open;
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
        var first = menu.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else {
        menu.classList.remove('is-open');
        closeTimer = setTimeout(function () { menu.hidden = true; }, animated ? 600 : 0);
      }
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    matchMedia('(min-width: 720px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Testata: piena dopo l'apertura, si nasconde scendendo e torna risalendo ---------- */
  var header = document.querySelector('.site-header');
  var hero = document.getElementById('hero');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-solid', y > 40);
      if (!html.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 320);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Copia email ---------- */
  document.querySelectorAll('.copy[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var reset = function () { setTimeout(function () { btn.textContent = 'Copia'; }, 1800); };
      var ok = function () { btn.textContent = 'Copiata'; reset(); };
      var fallback = function () {
        var el = btn.parentNode.querySelector('a');
        var r = document.createRange(); r.selectNodeContents(el);
        var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        btn.textContent = 'Selezionata'; reset();
      };
      try { navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(ok, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------- WhatsApp fisso su telefono: dopo l'apertura, non sopra i contatti ---------- */
  var fab = document.getElementById('wa-float');
  var contact = document.getElementById('contatti');
  if (fab) {
    if (!hero || !contact || !('IntersectionObserver' in window)) fab.classList.add('show');
    else {
      var heroIn = true, contactIn = false;
      var upd = function () { fab.classList.toggle('show', !heroIn && !contactIn && !html.classList.contains('menu-open')); };
      new IntersectionObserver(function (e) { heroIn = e[0].isIntersecting; upd(); }).observe(hero);
      new IntersectionObserver(function (e) { contactIn = e[0].isIntersecting; upd(); }).observe(contact);
    }
  }

  if (!animated || !hero) return;

  /* ---------- Rivelazioni allo scroll ---------- */
  if ('IntersectionObserver' in window) {
    /* titoli: parola per parola */
    document.querySelectorAll('[data-split]').forEach(function (h) {
      /* gli a capo voluti (<br>) restano dove sono */
      var i = 0;
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(function (part) {
        var tmp = document.createElement('span');
        tmp.innerHTML = part;
        /* si divide solo sugli spazi normali: gli spazi non divisibili tengono unite le parole */
        return tmp.textContent.trim().split(/[ \t\r\n]+/).map(function (w) {
          return '<span class="w" style="--i:' + (i++) + '"><span>' + w + '</span></span>';
        }).join(' ');
      }).join('<br>');
    });
    var once = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains('tile') ? 'play' : e.target.tagName === 'LI' ? 'lit' : 'in');
        once.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -18% 0px' });
    document.querySelectorAll('[data-split], .tile, .net').forEach(function (el) { once.observe(el); });
    /* le tre frasi si accendono quando arrivano a metà schermo */
    var lit = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); lit.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -16% 0px' });
    document.querySelectorAll('.changes-list li, .steps li').forEach(function (el) { lit.observe(el); });
    /* la sezione dei locali si accende quando entra per un quarto */
    var night = document.querySelector('.night');
    if (night) new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { night.classList.add('lit'); o.disconnect(); }
    }, { threshold: .22 }).observe(night);
  }

  /* ---------- Fuori e dentro: la porta si apre scorrendo ---------- */
  var doorScroll = document.querySelector('.door-scroll');
  var doorFrame = doorScroll && doorScroll.querySelector('.door-frame');
  if (doorFrame) {
    var doorTick = false;
    var paintDoor = function () {
      doorTick = false;
      var r = doorScroll.getBoundingClientRect();
      var span = r.height - innerHeight;
      if (span <= 0) return;
      var prog = Math.min(Math.max(-r.top / span, 0), 1);
      var d = Math.min(Math.max((prog - .12) / .62, 0), 1);
      doorScroll.style.setProperty('--d', (d * d * (3 - 2 * d)).toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!doorTick) { doorTick = true; requestAnimationFrame(paintDoor); } }, { passive: true });
    paintDoor();
  }
  /* col mouse, la micro-animazione riparte a ogni passaggio */
  if (finePointer) document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('mouseenter', function () { t.classList.remove('play'); void t.offsetWidth; t.classList.add('play'); });
  });

  /* ---------- Scorrendo: le righe del titolo si separano, il sottobicchiere gira ---------- */
  var coaster = hero.querySelector('.o-coaster');
  var px = 0, ticking = false;
  function paint() {
    ticking = false;
    var p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    hero.style.setProperty('--p', p.toFixed(3));
    if (coaster) coaster.style.setProperty('--sr', (p * 50 + px * 16).toFixed(1) + 'deg');
  }
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', ask, { passive: true });

  /* ---------- Solo con il mouse: luce, pulsanti magnetici, cursore ---------- */
  if (!finePointer) return;

  var light = hero.querySelector('.hero-light');
  var lx = innerWidth * .82, ly = innerHeight * .18, tx = lx, ty = ly, glowing = false;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    px = tx / r.width - .5;
    ask();
    if (!glowing) { glowing = true; requestAnimationFrame(glow); }
  });
  function glow() {
    lx += (tx - lx) * .08; ly += (ty - ly) * .08;
    if (light) { light.style.setProperty('--lx', lx.toFixed(1) + 'px'); light.style.setProperty('--ly', ly.toFixed(1) + 'px'); }
    if (Math.abs(tx - lx) + Math.abs(ty - ly) > .5) requestAnimationFrame(glow);
    else glowing = false;
  }

  document.querySelectorAll('[data-magnetic]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = 'translate(' + (x * .22).toFixed(1) + 'px,' + (y * .32).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  var cur = document.createElement('div');
  cur.className = 'cursor';
  cur.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cur);
  var mx = -100, my = -100, cx = -100, cy = -100, moving = false;
  window.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    cur.classList.add('on');
    cur.classList.toggle('hot', !!e.target.closest('a, button, summary'));
    if (!moving) { moving = true; requestAnimationFrame(follow); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
  function follow() {
    cx += (mx - cx) * .2; cy += (my - cy) * .2;
    cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    if (Math.abs(mx - cx) + Math.abs(my - cy) > .3) requestAnimationFrame(follow);
    else moving = false;
  }
})();
