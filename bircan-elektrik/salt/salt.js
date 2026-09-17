/* ══════════════════════════════════════════
   salt.js — Bircan Elektrik Mühendislik
   Şalt & Koruma: MCB/RCD Hesaplama · Kablo & Gerilim Düşümü
   (ana siteden ayrılmış bağımsız araç sayfası)
   ══════════════════════════════════════════ */

/* ── TAB ── */
function showSaltTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.tkbtn').forEach(function (b) { b.classList.remove('active'); });
  var p = document.getElementById('tab-' + id);
  if (p) p.classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'mcb') { initMCB(); }
  if (id === 'tesisat') { initGD(); }
}

/* ── MCB ── */
var mcbFaz = 'mono', mcbRcd = 40, rcdAlani = 'ev';
function setFaz(faz) {
  mcbFaz = faz;
  var m = document.getElementById('btn-mono'), t = document.getElementById('btn-tri'); if (!m || !t) return;
  var on = 'flex:1;padding:9px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:var(--white);color:var(--black);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;';
  var off = 'flex:1;padding:9px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;';
  m.style.cssText = faz === 'mono' ? on : off; t.style.cssText = faz === 'tri' ? on : off; calcMCB();
}
function calcMCB() {
  var p = document.getElementById('mcb-power'), u = document.getElementById('mcb-unit'), f = document.getElementById('mcb-pf'); if (!p || !u || !f) return;
  var pw = parseFloat(p.value) * parseFloat(u.value), pf = parseFloat(f.value), pv = document.getElementById('mcb-pf-val');
  if (pv) pv.textContent = pf.toFixed(2);
  var U = mcbFaz === 'mono' ? 220 : 380, sq = mcbFaz === 'mono' ? 1 : 1.732, I = pw / (sq * U * pf);
  var std = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200], rec = std.find(function (x) { return x > I; }) || 200, tip = (pw > 5000 || mcbFaz === 'tri') ? 'C' : 'B';
  var ae = document.getElementById('mcb-amp'), re = document.getElementById('mcb-rec'), fe = document.getElementById('mcb-formula');
  if (ae) ae.textContent = I.toFixed(1) + 'A';
  if (re) re.textContent = rec + 'A ' + tip + ' tipi';
  if (fe) fe.textContent = mcbFaz === 'mono' ? 'I=P/(U×cosf)=' + pw + 'W/(' + U + 'V×' + pf + ')=' + I.toFixed(1) + 'A' : 'I=P/(√3×U×cosf)=' + pw + 'W/(1.73×' + U + 'V×' + pf + ')=' + I.toFixed(1) + 'A';
  mcbRcd = rec; updateRcdResult();
}
function updateRcdResult() {
  var ma = document.getElementById('rcd-ma'), amp = document.getElementById('rcd-amp'), tip = document.getElementById('rcd-tip'), ac = document.getElementById('rcd-aciklama'); if (!ma) return;
  var stds = [25, 40, 63, 80, 100, 125, 160, 200], ra = stds.find(function (s) { return s >= mcbRcd; }) || 200, m = rcdAlani === 'sanayi' ? '300mA' : '30mA', ti = rcdAlani === 'sanayi' ? 'Tip B' : 'Tip A', acl;
  if (ra > 80) { acl = mcbRcd + 'A MCB için ' + ra + 'A kapasite gerekli. Bobinli TMŞ+toroid. ' + m + '.'; if (tip) tip.textContent = 'Bobinli TMŞ+Toroid'; }
  else { acl = mcbRcd + 'A MCB için min. ' + ra + 'A RCD.' + (rcdAlani === 'ev' ? ' Konut: 30mA zorunlu.' : rcdAlani === 'isyeri' ? ' Islak alan: 30mA RCD.' : " Sanayi: 300mA yangın, grup: 30mA."); if (tip) tip.textContent = ti; }
  if (ma) ma.textContent = m; if (amp) amp.textContent = ra + 'A'; if (ac) ac.textContent = acl;
}
function initMCB() {
  var p = document.getElementById('mcb-power'); if (!p || p._b) return; p._b = true;
  p.addEventListener('input', calcMCB);
  document.getElementById('mcb-unit').addEventListener('change', calcMCB);
  document.getElementById('mcb-pf').addEventListener('input', calcMCB);
  calcMCB(); updateRcdResult();
}

/* ── GERİLİM DÜŞÜMÜ ── */
function calcGD() {
  var I = parseFloat(document.getElementById('gd-I').value) || 0, L = parseFloat(document.getElementById('gd-L').value) || 0;
  var S = parseFloat(document.getElementById('gd-S').value) || 4, faz = document.getElementById('gd-faz').value;
  var pf = parseFloat(document.getElementById('gd-pf').value) || 0.9, mat = document.getElementById('gd-mat'), k = mat ? parseFloat(mat.value) : 56;
  var pv = document.getElementById('gd-pf-val'); if (pv) pv.textContent = pf.toFixed(2);
  var U = faz === 'mono' ? 220 : 380, co = faz === 'mono' ? 2 : Math.sqrt(3), dv = (co * I * L * pf) / (S * k), dp = (dv / U) * 100;
  var pe = document.getElementById('gd-pct'), vo = document.getElementById('gd-volt'), st = document.getElementById('gd-status'); if (!pe) return;
  pe.textContent = dp.toFixed(2) + '%'; vo.textContent = dv.toFixed(2) + 'V';
  var lim = (I > 32 || S >= 16) ? 5 : 3;
  if (dp <= lim) { st.style.cssText = 'background:rgba(74,222,128,0.15);color:#4ade80;font-size:11px;padding:6px 10px;border-radius:6px;text-align:center;'; st.textContent = '✓ Uygun — ' + (lim === 3 ? 'Konut (%3)' : 'Sanayi (%5)'); pe.style.color = '#4ade80'; }
  else if (dp <= 5) { st.style.cssText = 'background:rgba(250,204,21,0.15);color:#facc15;font-size:11px;padding:6px 10px;border-radius:6px;text-align:center;'; st.textContent = '⚠ Konut sınırı aşıldı (%5 sanayi ok)'; pe.style.color = '#facc15'; }
  else { st.style.cssText = 'background:rgba(239,68,68,0.15);color:#ef4444;font-size:11px;padding:6px 10px;border-radius:6px;text-align:center;'; st.textContent = '✗ Limit aşıldı — Kesiti büyüt!'; pe.style.color = '#ef4444'; }
}
function initGD() {
  var el = document.getElementById('gd-I'); if (!el || el._b) return; el._b = true;
  ['gd-I', 'gd-L'].forEach(function (id) { var x = document.getElementById(id); if (x) x.addEventListener('input', calcGD); });
  ['gd-S', 'gd-faz', 'gd-mat'].forEach(function (id) { var x = document.getElementById(id); if (x) x.addEventListener('change', calcGD); });
  var pf = document.getElementById('gd-pf'); if (pf) pf.addEventListener('input', calcGD);
  calcGD();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () { showSaltTab(this.getAttribute('data-tab'), this); });
  });
  document.querySelectorAll('[data-faz]').forEach(function (b) {
    b.addEventListener('click', function () { setFaz(this.getAttribute('data-faz')); });
  });
  initMCB();
  initGD();
});
