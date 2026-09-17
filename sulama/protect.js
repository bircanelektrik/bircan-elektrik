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

  /* ── Metin seçimi ve kopyalama SERBEST bırakıldı (müşteri telefon/adres kopyalayabilsin) ── */

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

    /* Ctrl+C ve Ctrl+X artık serbest — müşteri telefon/adres kopyalayabilsin */

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

    /* Ctrl+A artık serbest — metin seçimiyle tutarlı */
  });

})();
