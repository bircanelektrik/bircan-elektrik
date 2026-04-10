/* ══════════════════════════════════════════════════════════
   protect.js — Bircan Elektrik Mühendislik
   İçerik Koruma Modülü
   ══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Sağ tık engelle ── */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  /* ── Metin seçimi engelle ── */
  document.addEventListener('selectstart', function (e) {
    e.preventDefault();
    return false;
  });

  document.addEventListener('mousedown', function (e) {
    if (e.detail > 1) {          // çift/üçlü tık ile seçimi engelle
      e.preventDefault();
    }
  });

  /* ── CSS ile metin seçimini engelle (JS olmayan fallback) ── */
  var style = document.createElement('style');
  style.textContent =
    '* { -webkit-user-select: none !important; -moz-user-select: none !important; ' +
    '-ms-user-select: none !important; user-select: none !important; }' +
    'input, textarea, select { -webkit-user-select: text !important; ' +
    '-moz-user-select: text !important; user-select: text !important; }';
  document.head.appendChild(style);

  /* ── Sürükle-bırak engelle ── */
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
  });

  /* ── Klavye kısayolları engelle ── */
  document.addEventListener('keydown', function (e) {
    var key = e.key ? e.key.toLowerCase() : '';
    var ctrl = e.ctrlKey || e.metaKey;

    /* F12 */
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    /* Ctrl+U  — kaynak görüntüle */
    if (ctrl && key === 'u') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+C  — kopyala */
    if (ctrl && key === 'c') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+X  — kes */
    if (ctrl && key === 'x') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+S  — kaydet */
    if (ctrl && key === 's') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+Shift+I  — DevTools */
    if (ctrl && e.shiftKey && key === 'i') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+Shift+J  — Console */
    if (ctrl && e.shiftKey && key === 'j') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+Shift+C  — Elements panel (Chrome) */
    if (ctrl && e.shiftKey && key === 'c') {
      e.preventDefault();
      return false;
    }

    /* Ctrl+A  — tümünü seç */
    if (ctrl && key === 'a') {
      /* Form alanları dışında engelle */
      var tag = (document.activeElement || {}).tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    }
  });

  /* ── Kopyalama eventi (Ctrl+C dışındaki yolları da kapat) ── */
  document.addEventListener('copy', function (e) {
    e.preventDefault();
    return false;
  });

  /* ── Kesme eventi ── */
  document.addEventListener('cut', function (e) {
    e.preventDefault();
    return false;
  });

})();
