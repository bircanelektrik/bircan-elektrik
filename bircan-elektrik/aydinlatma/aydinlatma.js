/* ══════════════════════════════════════════
   aydinlatma.js — Bircan Elektrik Mühendislik
   Aydınlatma Hesaplayıcı: Lümen · Kelvin · Armatür
   (ana siteden ayrılmış bağımsız araç sayfası)
   ══════════════════════════════════════════ */

/* ── TAB ── */
function showAydTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.tkbtn').forEach(function (b) { b.classList.remove('active'); });
  var p = document.getElementById('tab-' + id);
  if (p) p.classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'kelvin') setKelvin(3000);
  if (id === 'lumen') calcLumen();
}

/* ── KELVIN ── */
var kvData = [
  { k: 1000, color: '#ff4500', name: 'Kor ışığı · Çok sıcak, dekoratif' },
  { k: 1800, color: '#ff7000', name: 'Mum ışığı · Romantik ortam' },
  { k: 2200, color: '#ff9329', name: 'Çok sıcak beyaz · Lounge, bar' },
  { k: 2700, color: '#ffb347', name: 'Sıcak beyaz · Yatak odası, oturma' },
  { k: 3000, color: '#ffd27f', name: 'Sıcak beyaz · Oturma odası, vitrin' },
  { k: 3500, color: '#ffe4a0', name: 'Oturma ile mutfak arası' },
  { k: 4000, color: '#f0f4ff', name: 'Soğuk beyaz · Mutfak, banyo' },
  { k: 4500, color: '#e8f0ff', name: 'Nötr beyaz · Ofis, çalışma' },
  { k: 5000, color: '#e0eaff', name: 'Gün ışığı · Çalışma odası, ofis' },
  { k: 5500, color: '#d0e0ff', name: 'Soğuk gün ışığı · Atölye, stüdyo' },
  { k: 6000, color: '#c0d5ff', name: 'Soğuk beyaz · Garaj, depo' },
  { k: 6500, color: '#bbd0ff', name: 'Gün ışığı · Tıbbi, endüstriyel' },
  { k: 7000, color: '#aac0ff', name: 'Çok soğuk · Özel teknik alanlar' }
];
function setKelvin(k) {
  var tr = document.getElementById('kv-track'), kn = document.getElementById('kv-knob');
  if (!tr || !kn) return;
  var d = kvData.reduce(function (a, b) { return Math.abs(b.k - k) < Math.abs(a.k - k) ? b : a; });
  kn.style.left = ((k - 1000) / 6000 * tr.offsetWidth) + 'px';
  var ve = document.getElementById('kv-val'), ne = document.getElementById('kv-name'), sw = document.getElementById('kv-swatch');
  if (ve) { ve.textContent = k + 'K'; ve.style.color = k < 3500 ? '#b8963e' : k < 5000 ? '#333' : '#3355cc'; }
  if (ne) ne.textContent = d.name;
  if (sw) { sw.style.background = d.color; sw.style.boxShadow = '0 4px 24px ' + d.color + '88'; }
}
(function () {
  var drag = false;
  function initKv() {
    var tr = document.getElementById('kv-track'); if (!tr || tr._kv) return; tr._kv = true;
    function gk(e) { var r = tr.getBoundingClientRect(); return Math.round(1000 + (Math.max(0, Math.min((e.touches ? e.touches[0].clientX : e.clientX) - r.left, r.width)) / r.width) * 6000); }
    tr.addEventListener('mousedown', function (e) { drag = true; setKelvin(gk(e)); });
    tr.addEventListener('touchstart', function (e) { drag = true; setKelvin(gk(e)); }, { passive: true });
    document.addEventListener('mousemove', function (e) { if (drag) setKelvin(gk(e)); });
    document.addEventListener('touchmove', function (e) { if (drag) setKelvin(gk(e)); }, { passive: true });
    document.addEventListener('mouseup', function () { drag = false; });
    document.addEventListener('touchend', function () { drag = false; });
  }
  document.addEventListener('DOMContentLoaded', initKv);
})();

/* ── LÜMEN ── */
function calcLumen() {
  var a = document.getElementById('lm-area'), t = document.getElementById('lm-type'), e = document.getElementById('lm-eff');
  if (!a || !t || !e) return;
  var l = Math.round(parseFloat(a.value) * parseFloat(t.value));
  var r = document.getElementById('lm-result'), w = document.getElementById('lm-watt'), c = document.getElementById('lm-count');
  if (r) r.textContent = l.toLocaleString('tr-TR');
  if (w) w.textContent = Math.round(l / parseFloat(e.value));
  if (c) c.textContent = Math.ceil(l / 900);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () { showAydTab(this.getAttribute('data-tab'), this); });
  });
  document.querySelectorAll('[data-kelvin]').forEach(function (el) {
    el.addEventListener('click', function () { setKelvin(parseInt(this.getAttribute('data-kelvin'))); });
  });
  var lmArea = document.getElementById('lm-area');
  if (lmArea) {
    lmArea.addEventListener('input', calcLumen);
    document.getElementById('lm-type').addEventListener('change', calcLumen);
    document.getElementById('lm-eff').addEventListener('change', calcLumen);
    calcLumen();
  }
  setKelvin(3000);
});
