/* ══════════════════════════════════════════
   animations.js — Bircan Elektrik
   GSAP + ScrollTrigger animasyonları
   bircan.js'e dokunmadan çalışır
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  /* GSAP yüklü değilse sessizce çık */
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── GSAP NULL GUARD — element yoksa hata verme ── */
  var _gsapFrom = gsap.from.bind(gsap);
  var _gsapTo   = gsap.to.bind(gsap);
  gsap.from = function(target, vars) {
    if (typeof target === 'string' && !document.querySelector(target)) return { kill: function(){} };
    return _gsapFrom(target, vars);
  };
  gsap.to = function(target, vars) {
    if (typeof target === 'string' && !document.querySelector(target)) return { kill: function(){} };
    return _gsapTo(target, vars);
  };

  /* ─────────────────────────────────────────
     YARDIMCI: reduced-motion kontrolü
  ───────────────────────────────────────── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     1. HERO — giriş animasyonu
  ───────────────────────────────────────── */
  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .from('.hero-badge',        { opacity: 0, y: 16, duration: 1, delay: 0.2 })
    .from('.hero h1',           { opacity: 0, y: 32, duration: 1.2 }, '-=0.6')
    .from('.hero p',            { opacity: 0, y: 20, duration: 1   }, '-=0.8')
    .from('.hero-stats-inline', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
    .from('.hero-right',        { opacity: 0, x: 24, duration: 0.9 }, '-=0.7');

  /* ─────────────────────────────────────────
     2. HERO PARALLAX — scroll'da h1 yüzer
  ───────────────────────────────────────── */
  if (!prefersReduced) {
    gsap.to('.hero h1', {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    gsap.to('.hero p', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    /* hero::before parallax kaldırıldı — pseudo elementler GSAP'ta çalışmaz */
  }

  /* ─────────────────────────────────────────
     3. NAV — scroll'da küçülür
  ───────────────────────────────────────── */
  ScrollTrigger.create({
    start: 'top -60',
    onEnter: function () {
      gsap.to('nav', { paddingTop: '0.7rem', paddingBottom: '0.7rem',
        backgroundColor: 'rgba(18,20,23,0.94)', duration: 0.4, ease: 'power2.out' });
    },
    onLeaveBack: function () {
      gsap.to('nav', { paddingTop: '1.1rem', paddingBottom: '1.1rem',
        backgroundColor: 'rgba(24,27,31,0.82)', duration: 0.4, ease: 'power2.out' });
    }
  });

  /* ─────────────────────────────────────────
     4. SECTION DIVIDER çizgisi çizim efekti
  ───────────────────────────────────────── */
  gsap.utils.toArray('.section-divider hr').forEach(function (hr) {
    gsap.from(hr, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: hr,
        start: 'top 88%'
      }
    });
  });

  gsap.utils.toArray('.section-divider span').forEach(function (span) {
    gsap.from(span, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: span,
        start: 'top 88%'
      }
    });
  });

  /* ─────────────────────────────────────────
     5. VIZYON — altın çizgi + quote + pillars
  ───────────────────────────────────────── */
  gsap.from('.vizyon-label', {
    opacity: 0, x: -20, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#vizyon', start: 'top 75%' }
  });

  gsap.from('.vizyon-quote', {
    opacity: 0, y: 30, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.vizyon-quote', start: 'top 80%' }
  });

  /* Altın sol çizgi genişleme efekti */
  gsap.from('.vizyon-quote', {
    borderLeftColor: 'rgba(210,125,86,0)',
    duration: 1.4,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.vizyon-quote', start: 'top 80%' }
  });

  gsap.from('.vizyon-ilke', {
    opacity: 0, y: 20, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.vizyon-ilke', start: 'top 85%' }
  });

  gsap.utils.toArray('.pillar').forEach(function (el, i) {
    gsap.from(el, {
      opacity: 0, y: 30,
      duration: 0.8,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.vizyon-pillars', start: 'top 80%' }
    });
  });

  /* ─────────────────────────────────────────
     6. HİZMETLER — başlık + kartlar stagger
  ───────────────────────────────────────── */
  gsap.from('#hizmetler > h2', {
    opacity: 0, y: 28, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#hizmetler > h2', start: 'top 82%' }
  });
  gsap.from('#hizmetler > p', {
    opacity: 0, y: 16, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#hizmetler > p', start: 'top 85%' }
  });

  gsap.from('.svc-card', {
    opacity: 0, y: 24,
    stagger: 0.07,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.services-grid', start: 'top 78%' }
  });

  /* ─────────────────────────────────────────
     7. REHBER kartları
  ───────────────────────────────────────── */
  /* .rcard dinamik oluşturulduğu için ScrollTrigger yerine MutationObserver */
  var rehberObserved = false;
  ScrollTrigger.create({
    trigger: '#rehber',
    start: 'top 75%',
    onEnter: function () {
      if (rehberObserved) return;
      rehberObserved = true;
      setTimeout(function() {
        var rcards = document.querySelectorAll('.rcard');
        if (rcards.length) {
          gsap.from(rcards, { opacity: 0, y: 24, stagger: 0.08, duration: 0.75, ease: 'power3.out' });
        }
      }, 100);
    },
    once: true
  });

  /* ─────────────────────────────────────────
     8. TEKNİK — başlık + kategori butonları
  ───────────────────────────────────────── */
  gsap.from('#teknik > h2, #teknik > p', {
    opacity: 0, y: 24, stagger: 0.15, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#teknik', start: 'top 78%' }
  });

  gsap.from('.cat-btn', {
    opacity: 0, y: 20, stagger: 0.1, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.cat-btn', start: 'top 82%' }
  });

  /* ─────────────────────────────────────────
     9. YORUMLAR — kartlar dalga gibi gelir
  ───────────────────────────────────────── */
  ScrollTrigger.create({
    trigger: '#yorumlar',
    start: 'top 72%',
    onEnter: function () {
      var cards = document.querySelectorAll('#yorumlar [style*="padding:1.5rem"]');
      gsap.from(cards, {
        opacity: 0, y: 32, stagger: 0.1, duration: 0.85, ease: 'power3.out'
      });
    },
    once: true
  });

  /* ─────────────────────────────────────────
     10. HİZMET ALANI
  ───────────────────────────────────────── */
  gsap.from('#hizmet-alani h2, #hizmet-alani p', {
    opacity: 0, y: 24, stagger: 0.15, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#hizmet-alani', start: 'top 78%' }
  });

  gsap.from('.sehir-etiketler span', {
    opacity: 0, scale: 0.88, stagger: 0.06, duration: 0.6, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.sehir-etiketler', start: 'top 85%' }
  });

  /* ─────────────────────────────────────────
     11. REFERANSLAR
  ───────────────────────────────────────── */
  ScrollTrigger.create({
    trigger: '#referanslar',
    start: 'top 75%',
    onEnter: function () {
      var cards = document.querySelectorAll('.ref-card');
      gsap.from(cards, {
        opacity: 0, y: 28, stagger: 0.09, duration: 0.8, ease: 'power3.out'
      });
    },
    once: true
  });

  /* ─────────────────────────────────────────
     12. TEKLİF FORMU
  ───────────────────────────────────────── */
  gsap.from('.teklif-info', {
    opacity: 0, x: -30, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#teklif', start: 'top 78%' }
  });
  gsap.from('.teklif-form-box', {
    opacity: 0, x: 30, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#teklif', start: 'top 78%' }
  });

  /* ─────────────────────────────────────────
     13. EKİP
  ───────────────────────────────────────── */
  gsap.from('#ekip h2, #ekip > p', {
    opacity: 0, y: 24, stagger: 0.15, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#ekip', start: 'top 78%' }
  });

  var teamCards = document.querySelectorAll('#ekip [style*="border-radius:var(--radius)"], #ekip [style*="background:rgba(255,255,255,0.06)"]');
  gsap.from(teamCards, {
    opacity: 0, y: 28, stagger: 0.15, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#ekip', start: 'top 72%' }
  });

  /* ─────────────────────────────────────────
     14. FOOTER
  ───────────────────────────────────────── */
  gsap.from('footer', {
    opacity: 0, y: 16, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: 'footer', start: 'top 95%' }
  });

  /* ─────────────────────────────────────────
     15. GÖRSEL HOVER — grayscale → renk
     Tüm <img> etiketlerine otomatik uygula
  ───────────────────────────────────────── */
  document.querySelectorAll('img:not(.nav-logo img)').forEach(function (img) {
    /* Zaten bir wrapper içindeyse tekrar sarma */
    if (img.parentElement.classList.contains('img-gsap-wrap')) return;

    /* Wrapper oluştur */
    var wrap = document.createElement('div');
    wrap.className = 'img-gsap-wrap';
    wrap.style.cssText = 'position:relative;overflow:hidden;display:block;';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    /* Başlangıç: siyah-beyaz */
    gsap.set(img, { filter: 'grayscale(100%) brightness(0.55)', scale: 1 });

    /* Hover in */
    wrap.addEventListener('mouseenter', function () {
      gsap.to(img, {
        filter: 'grayscale(0%) brightness(0.85)',
        scale: 1.05,
        duration: 1.2,
        ease: 'power3.out'
      });
    });

    /* Hover out */
    wrap.addEventListener('mouseleave', function () {
      gsap.to(img, {
        filter: 'grayscale(100%) brightness(0.55)',
        scale: 1,
        duration: 1.5,
        ease: 'power3.out'
      });
    });

    /* Scroll ile fade-in */
    gsap.from(img, {
      opacity: 0,
      filter: 'grayscale(100%) brightness(0.3) blur(6px)',
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 82%'
      }
    });
  });

  /* ─────────────────────────────────────────
     16. SAYAÇ ANİMASYONU — stat-num
  ───────────────────────────────────────── */
  document.querySelectorAll('.stat-num').forEach(function (el) {
    var text = el.textContent.trim();
    if (text.indexOf('/') !== -1) return;
    var num  = parseFloat(text.replace(/[^0-9.]/g, ''));
    var suffix = text.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;

    var obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: num,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = (Number.isInteger(num)
              ? Math.round(obj.val)
              : obj.val.toFixed(1)) + suffix;
          }
        });
      }
    });
  });

  /* ─────────────────────────────────────────
     17. ALTINDIZGI — section başlıkları
     Her section'ın ilk h2'sine gold accent çizgi
  ───────────────────────────────────────── */
  document.querySelectorAll('section > h2').forEach(function (h2) {
    /* Zaten var mı kontrol et */
    var prev = h2.previousElementSibling;
    if (prev && prev.classList.contains('gold-line')) return;

    var line = document.createElement('div');
    line.className = 'gold-line';
    line.style.cssText = [
      'width:0px',
      'height:1px',
      'background:rgba(210,125,86,0.5)',
      'margin-bottom:1.2rem',
      'display:block'
    ].join(';');
    h2.parentNode.insertBefore(line, h2);

    gsap.to(line, {
      width: '36px',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: h2, start: 'top 85%' }
    });

    gsap.from(h2, {
      opacity: 0, y: 24, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: h2, start: 'top 85%' }
    });
  });

  /* ─────────────────────────────────────────
     18. SVC CARD hover manyetik efekti
  ───────────────────────────────────────── */
  document.querySelectorAll('.svc-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      gsap.to(card, { y: -4, duration: 0.35, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', function () {
      gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
    });
  });

  /* ─────────────────────────────────────────
     19. NAV LINKLERİ — underline slide efekti
     CSS'de zaten var ama GSAP ile güçlendir
  ───────────────────────────────────────── */
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('mouseenter', function () {
      gsap.to(a, { color: '#d2a56f', duration: 0.25, ease: 'power2.out' });
    });
    a.addEventListener('mouseleave', function () {
      if (!a.classList.contains('active')) {
      gsap.to(a, { color: 'rgba(232,230,227,0.56)', duration: 0.35, ease: 'power2.out' });
      }
    });
  });

  /* ─────────────────────────────────────────
     20. POPUP açılış animasyonu
  ───────────────────────────────────────── */
  /* Popup — CSS transform: translate(-50%,-50%) sabit, sadece opacity+scale animate */
  var origShow = window.showCallPopup;
  if (origShow) {
    window.showCallPopup = function () {
      origShow();
      var popup = document.getElementById('call-popup');
      if (popup) {
        /* Önce GSAP'ın transform'una izin verme — sadece opacity ve scale */
        gsap.set(popup, { opacity: 0, scale: 0.96 });
        gsap.to(popup, {
          opacity: 1, scale: 1,
          duration: 0.35,
          ease: 'power3.out'
        });
      }
    };
  }

  /* ─────────────────────────────────────────
     21. DETAIL BOX (servis detay) animasyonu
  ───────────────────────────────────────── */
  var detailObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        var el = m.target;
        if (el.classList.contains('visible')) {
          gsap.fromTo(el,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          );
        }
      }
    });
  });
  var detailBox = document.getElementById('detail');
  if (detailBox) {
    detailObserver.observe(detailBox, { attributes: true });
  }

  /* ─────────────────────────────────────────
     22. RCARD açılış animasyonu
  ───────────────────────────────────────── */
  var rcardObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        var body = m.target;
        if (body.classList.contains('open')) {
          gsap.fromTo(body,
            { opacity: 0, height: 0 },
            { opacity: 1, height: 'auto', duration: 0.45, ease: 'power3.out' }
          );
        }
      }
    });
  });
  document.querySelectorAll('.rcard-body').forEach(function (b) {
    rcardObserver.observe(b, { attributes: true });
  });

  /* ─────────────────────────────────────────
     ScrollTrigger — yeniden hesapla
     (bircan.js'in DOM işlemleri bitince)
  ───────────────────────────────────────── */
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });

})();
