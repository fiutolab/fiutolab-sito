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
    if (!big || !small || !ring || !big.animate) { finish(); return; }

    function finish() {
      if (done) return;
      done = true;
      try { sessionStorage.setItem('fiuto-intro', '1'); } catch (e) {}
      html.classList.add('intro-done');
      if (stage) stage.remove();
      reveal();
      removeSkip();
    }

    function fly() {
      if (done) return;
      var b = big.getBoundingClientRect(), s = small.getBoundingClientRect();
      var scale = parseFloat(getComputedStyle(small).fontSize) / parseFloat(getComputedStyle(big).fontSize);
      var dx = s.left - b.left, dy = s.top - b.top;
      big.style.transformOrigin = '0 0';
      var k = parseFloat(getComputedStyle(html).getPropertyValue('--k')) || 1;
      var t = 820 * k;
      big.animate(
        [{ transform: 'none' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')' }],
        { duration: t, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }
      ).onfinish = finish;
      stage.animate([{ backgroundColor: 'rgba(14,39,45,1)' }, { backgroundColor: 'rgba(14,39,45,0)' }],
        { duration: t * .7, delay: t * .3, easing: 'ease', fill: 'forwards' });
      /* il titolo parte mentre il logo è ancora in volo */
      setTimeout(reveal, t * .45);
    }

    ring.addEventListener('animationend', function () { setTimeout(fly, 120); }, { once: true });

    /* chi ha fretta salta l'apertura: clic, tasto o scroll */
    function skip() { finish(); }
    var evs = ['pointerdown', 'keydown', 'wheel', 'touchmove'];
    evs.forEach(function (e) { window.addEventListener(e, skip, { passive: true }); });
    function removeSkip() { evs.forEach(function (e) { window.removeEventListener(e, skip); }); }
  }

  if (html.classList.contains('intro')) intro();
  else if (animated) requestAnimationFrame(function () { requestAnimationFrame(reveal); });

  if (!animated) return;

  /* ---------- Solo con il mouse: sottobicchiere, pulsanti magnetici, cursore ---------- */
  if (!finePointer) return;

  var hero = document.getElementById('hero');
  var coaster = document.querySelector('.hero-coaster');
  if (hero && coaster) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      coaster.style.setProperty('--cx', (x * -26).toFixed(1) + 'px');
      coaster.style.setProperty('--cy', (y * -20).toFixed(1) + 'px');
      coaster.style.setProperty('--cr', (x * 14).toFixed(1) + 'deg');
    });
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

