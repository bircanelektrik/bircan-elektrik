/* ══════════════════════════════════════════
   home.js — Bircan Elektrik ana sayfa etkileşimleri
   (mobil menü, Teknik Rehber, seçiciler, süreç adımları)
   bircan.js / animations.js / images.js'e dokunmaz.
   ══════════════════════════════════════════ */
(function () {
  'use strict';
  var DATA = {"poles":[{"id":"1P","name":"1P","sub":"tek kutup","L":{"L1":"kes","L2":"yok","L3":"yok","N":"gec"},"note":"Yalnızca fazı keser; nötr bağlı kalır.","where":"TN-S sistemlerde tek fazlı aydınlatma ve priz son devreleri."},{"id":"1PN","name":"1P+N","sub":"faz + nötr","L":{"L1":"kes","L2":"yok","L3":"yok","N":"kes"},"note":"Fazı korur, nötrü de birlikte ayırır.","where":"Tek fazlı son devreler; bakımda nötrün de ayrılması gereken yerler."},{"id":"2P","name":"2P","sub":"iki kutup","L":{"L1":"kes","L2":"yok","L3":"yok","N":"kes"},"note":"Faz ve nötr birlikte korunur ve ayrılır.","where":"Tek fazlı ana besleme, TT sistemler, ıslak hacimler ve dış mekân."},{"id":"3P","name":"3P","sub":"üç faz","L":{"L1":"kes","L2":"kes","L3":"kes","N":"yok"},"note":"Üç faz aynı anda açılır; faz kaybı oluşmaz.","where":"Trifaze motorlar, pompalar ve nötr kullanmayan dengeli yükler."},{"id":"4P","name":"4P","sub":"üç faz + nötr","L":{"L1":"kes","L2":"kes","L3":"kes","N":"kes"},"note":"Üç faz ve nötr birlikte ayrılır.","where":"Trifaze ana dağıtım, ADP girişleri, nötrün de ayrılması gereken ana hatlar."}],"fuses":[{"code":"B","kind":"MCB","trip":"3–5 × In","name":"B karakteristik minyatür devre kesici","where":"Konut aydınlatma ve priz devreleri, uzun hatlar, rezistif yükler.","why":"Düşük arıza akımlarında bile hızlı açar; uzun hatları güvenle korur.","wrong":"Motor, trafo gibi yüksek kalkış akımlı yüklerde gereksiz açmalar."},{"code":"C","kind":"MCB","trip":"5–10 × In","name":"C karakteristik minyatür devre kesici","where":"Ticari ve genel amaçlı devreler, klima, küçük motorlar, LED sürücü grupları.","why":"Orta seviye kalkış akımlarını açmadan tolere eder.","wrong":"Uzun ve ince kesitli hatlarda arıza akımı açma eşiğine ulaşmayabilir; koruma gecikir."},{"code":"D","kind":"MCB","trip":"10–20 × In","name":"D karakteristik minyatür devre kesici","where":"Trafolar, büyük motorlar, kaynak makineleri, yüksek ani akımlı yükler.","why":"Yüksek kalkış akımında gereksiz açma yapmaz.","wrong":"Konut devresinde kullanılırsa arızada zamanında açmayabilir; yangın riski."},{"code":"K","kind":"MCB","trip":"8–14 × In","name":"K karakteristik (IEC 60947-2)","where":"Motorlar, trafolar ve endüktif yükler.","why":"Yüksek kalkışa dayanır, aşırı yükte hassas korur.","wrong":"Elektronik ve hassas yüklerde gerekenden geç açabilir."},{"code":"Z","kind":"MCB","trip":"2–3 × In","name":"Z karakteristik","where":"Elektronik devreler, ölçü ve kontrol devreleri, yarı iletkenler.","why":"Küçük aşırı akımlarda bile çok hızlı açar.","wrong":"Kalkış akımı olan her yükte sürekli açma yapar."},{"code":"gG","kind":"NH / buşon","trip":"tam aralık","name":"Genel amaçlı eriyen sigorta","where":"Ana dağıtım, kolon hatları ve kablo koruması.","why":"Hem aşırı yükü hem kısa devreyi keser; çok yüksek kesme kapasitesi.","wrong":"Yanlış boy seçilirse seçicilik bozulur; üst sigorta önce atar, tüm bina karanlıkta kalır."},{"code":"aM","kind":"NH","trip":"kısmi aralık","name":"Motor devresi eriyen sigortası","where":"Motor devreleri; termik röle veya motor koruma şalteriyle birlikte.","why":"Kalkışa dayanır, kısa devreyi keser.","wrong":"Tek başına kullanılırsa motor aşırı yüke karşı korunmaz."}],"rcds":[{"code":"AC","detects":"Yalnızca sinüs biçimli AC kaçak akım.","where":"Isıtıcı, akkor lamba gibi basit rezistif yükler.","note":"Modern cihazların ürettiği kaçak akımları kaçırabilir; yeni tesislerde tek başına önermiyoruz."},{"code":"A","detects":"AC + darbeli DC kaçak akım.","where":"Çamaşır ve bulaşık makinesi, LED sürücü, inverterli klima; konut ve ofislerde temel seçim.","note":"Günümüz konutları için asgari tercih."},{"code":"F","detects":"A tipinin algıladıkları + karışık frekanslı kaçak akım.","where":"Tek fazlı frekans konvertörlü cihazlar: inverterli pompa, ısı pompası.","note":"İnverterli tek fazlı yüklerde istenmeyen açmaları ve kör noktaları azaltır."},{"code":"B","detects":"Tüm biçimler, düz DC kaçak akım dahil.","where":"Trifaze sürücüler, bazı elektrikli araç şarj ve GES uygulamaları.","note":"Düz DC kaçak akım A tipi röleyi kör edebilir; bu yüklerde B tipi gerekir."}],"steps":[{"title":"Keşif","desc":"Sahayı, mevcut tesisatı, yükleri ve kullanım alışkanlıklarınızı yerinde inceliyoruz.","checks":["Mevcut tesisat","Yük listesi","Sistem tipi","Genişleme planı"],"out":"İhtiyaç ve risk listesi"},{"title":"Projelendirme","desc":"Yük analizi, kesit, gerilim düşümü, kısa devre ve seçicilik hesapları yapılır.","checks":["Yük analizi","Kesit & ΔU","Kısa devre","Seçicilik"],"out":"Onaya hazır proje"},{"title":"Ürün Seçimi","desc":"Kesme kapasitesi, kutup sayısı, karakteristik ve belgeye göre malzeme belirlenir.","checks":["Icu ≥ Ik","Kutup & karakteristik","Belge","Stok & termin"],"out":"Gerekçeli malzeme listesi"},{"title":"Uygulama","desc":"Projeye sadık montaj; kablo gruplaması, bağlantı torku ve pano yerleşimi kurala göre yapılır.","checks":["Gruplama","Bağlantı torku","Etiketleme","Pano yerleşimi"],"out":"Projeye uygun montaj"},{"title":"Kontrol","desc":"Devreye almadan önce bağlantılar ve koruma elemanları gözden geçirilir. Ölçüm ve raporlama talep halinde ayrı bir hizmet olarak yapılır.","checks":["Bağlantılar","Koruma elemanları","RCD test butonu","Ölçüm (talebe bağlı)"],"out":"Devreye almaya hazır sistem"},{"title":"Devreye Alma","desc":"Kontrollü enerjilendirme, abonelik süreçleri ve kullanıcıya teslim bilgilendirmesi.","checks":["Kontrollü enerji","Abonelik","Kullanıcı bilgilendirme","Bakım önerisi"],"out":"Kullanıma hazır sistem"}]};
  var NOTE = { kes: 'ayrılır', gec: 'bağlı kalır', yok: 'yok' };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function refreshST() { if (window.ScrollTrigger) { requestAnimationFrame(function () { window.ScrollTrigger.refresh(); }); } }

  /* ── Mobil menü ── */
  var burger = document.getElementById('nav-burger'), mnav = document.getElementById('mnav');
  function closeMenu() { if (!mnav) return; mnav.setAttribute('hidden', ''); if (burger) burger.setAttribute('aria-expanded', 'false'); }
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var willOpen = mnav.hasAttribute('hidden');
      if (willOpen) mnav.removeAttribute('hidden'); else mnav.setAttribute('hidden', '');
      burger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ── "Hemen Ara" penceresi: odak içeri girsin, Tab içeride dönsün, kapanınca geri dönsün ── */
  var popup = document.getElementById('call-popup'), lastFocus = null;
  if (popup && typeof window.showCallPopup === 'function' && typeof window.hideCallPopup === 'function') {
    var baseShow = window.showCallPopup, baseHide = window.hideCallPopup;
    window.showCallPopup = function () {
      lastFocus = document.activeElement;
      baseShow.apply(this, arguments);
      var first = popup.querySelector('.cp-close'); if (first) setTimeout(function () { first.focus(); }, 30);
    };
    window.hideCallPopup = function () {
      var wasOpen = popup.style.display !== 'none';
      baseHide.apply(this, arguments);
      if (wasOpen && lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    };
    popup.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button', popup); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }

  /* ── Hizmet kartları: klavye ile açılabilsin ── */
  $$('.svc-card').forEach(function (c) {
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } });
  });

  /* ── Teknik Rehber sekmeleri ── */
  /* Sekmeler seviyeye göre gruplu; DOM sırası ≠ konu sırası. Konu numarası data-topic'ten okunur. */
  var tabs = $$('.rh-tab'), panels = $$('.rh-panel');
  function topicOf(t) { return parseInt(t.getAttribute('data-topic'), 10); }
  function showTopic(n, scroll) {
    tabs.forEach(function (t) { var on = topicOf(t) === n; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
    var panel = document.getElementById('rh-panel-' + n);
    panels.forEach(function (p) { if (p === panel) p.removeAttribute('hidden'); else p.setAttribute('hidden', ''); });
    if (scroll && panel) panel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    refreshST();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTopic(topicOf(t)); });
    t.addEventListener('keydown', function (e) {
      var k = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') k = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') k = (i - 1 + tabs.length) % tabs.length;
      if (k !== null) { e.preventDefault(); showTopic(topicOf(tabs[k])); tabs[k].focus(); }
    });
  });
  $$('.rh-next').forEach(function (b) {
    b.addEventListener('click', function () { showTopic(parseInt(b.getAttribute('data-next'), 10) || 0, true); });
  });
  $$('details.qa').forEach(function (d) { d.addEventListener('toggle', refreshST); });

  /* ── Seçiciler (kutup, sigorta tipi, RCD) ── */
  function poleRows(p) {
    return ['L1', 'L2', 'L3', 'N'].map(function (k) {
      var st = p.L[k];
      var mid = st === 'kes'
        ? '<div class="brk"><svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true"><path d="M2 12 L22 2" stroke="#86562b" stroke-width="2.2"/></svg></div>'
        : '<div class="brk-pass"><div class="cond cond-' + st + '"></div></div>';
      return '<div class="pole-row"><span class="mono pole-lbl">' + k + '</span><div class="cond cond-' + st + '"></div>' + mid + '<div class="cond cond-' + st + '"></div><span class="mono pole-note">' + NOTE[st] + '</span></div>';
    }).join('');
  }
  $$('.rh-picker').forEach(function (box) {
    var set = box.getAttribute('data-set'), list = DATA[set] || [];
    var keyOf = function (it) { return it.id || it.code; };
    $$('.pick[data-key]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key');
        var item = list.filter(function (it) { return keyOf(it) === key; })[0];
        if (!item) return;
        $$('.pick[data-key]', box).forEach(function (b) { var on = b === btn; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        $$('[data-f]', box).forEach(function (el) { var f = el.getAttribute('data-f'); if (item[f] != null) el.textContent = item[f]; });
        if (set === 'poles') { var rows = $('.pole-rows', box); if (rows) rows.innerHTML = poleRows(item); }
      });
    });
  });

  /* ── Topraklama senaryosu ── */
  $$('.earth-mod').forEach(function (box) {
    var btns = $$('[data-earth]', box), views = $$('.earth-view', box);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-earth');
        btns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        views.forEach(function (el) { if (el.getAttribute('data-view') === v) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); });
      });
    });
  });

  /* ── Süreç adımları (görünürken kendiliğinden ilerler) ── */
  var steps = $$('#surec .step'), cur = 0, auto = !reduced, timer = null, visible = false;
  function showStep(i) {
    cur = i; var s = DATA.steps[i]; if (!s) return;
    steps.forEach(function (b, j) { b.classList.toggle('is-on', j === i); b.classList.toggle('is-done', j < i); b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    set('surec-num', ('0' + (i + 1)).slice(-2)); set('surec-title', s.title); set('surec-desc', s.desc); set('surec-out', s.out);
    var ch = document.getElementById('surec-checks'); if (ch) ch.innerHTML = s.checks.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('');
    var bar = document.getElementById('surec-bar'); if (bar) bar.style.width = Math.round(((i + 1) / DATA.steps.length) * 100) + '%';
  }
  steps.forEach(function (b, i) { b.addEventListener('click', function () { auto = false; showStep(i); }); });
  function tick() { if (auto && visible && !document.hidden) showStep((cur + 1) % DATA.steps.length); }
  if (steps.length) {
    timer = setInterval(tick, 4200);
    var sec = document.getElementById('surec');
    if (sec && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.3 }).observe(sec);
    } else { visible = true; }
  }
})();

/* ── GOOGLE YORUMLARI ──
   Veri: js/yorumlar.js (düz yazı). Burada yalnızca okunup çizilir. */
(function () {
  'use strict';
  var errLine = 0;
  window.addEventListener('error', function (e) { if (e && e.filename && /yorumlar\.js/.test(e.filename)) errLine = e.lineno; });

  var PAL = ['#8c5b36', '#3d5a6c', '#2d6a4f', '#6b4f7a', '#7a3e3e', '#4a5560', '#5e6b2f', '#285d7a'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initials(n) { var p = n.trim().split(/\s+/); return ((p[0] || '').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toLocaleUpperCase('tr'); }
  function color(n) { var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0; return PAL[h % PAL.length]; }
  function stars(k) { return '★★★★★'.slice(0, k) + '<span class="off">' + '★★★★★'.slice(0, 5 - k) + '</span>'; }
  function av(n, cls) { return '<span class="av' + (cls ? ' ' + cls : '') + '" style="background:' + color(n) + '" aria-hidden="true">' + esc(initials(n)) + '</span>'; }

  function parse(txt) {
    var out = [], cur = null;
    String(txt || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line || line.indexOf('//') === 0) return;
      if (line.indexOf('###') === 0) { cur = { ad: line.replace(/^#+\s*/, ''), yildiz: 5, tarih: '', yorum: '', kart: null }; if (cur.ad) out.push(cur); return; }
      if (!cur) return;
      var m = line.match(/^(yildiz|yıldız|tarih|yorum|kart)\s*:\s*(.*)$/i);
      if (m) {
        var k = m[1].toLowerCase().replace('ı', 'i');
        if (k === 'yildiz') { var n = parseInt((m[2].match(/\d/) || [])[0], 10) || (m[2].match(/★/g) || []).length; cur.yildiz = Math.min(5, Math.max(1, n || 5)); }
        else if (k === 'tarih') cur.tarih = m[2];
        else if (k === 'kart') { var v = m[2].trim().toLocaleLowerCase('tr'); cur.kart = /^(evet|e|1|true)/.test(v) ? true : /^(hay|h|0|false)/.test(v) ? false : null; }
        else cur.yorum += (cur.yorum ? ' ' : '') + m[2];
      } else cur.yorum += (cur.yorum ? ' ' : '') + line;
    });
    return out;
  }

  function start() {
    var track = document.getElementById('yr-track');
    if (!track) return;
    var D = window.BIRCAN_YORUMLAR;
    var list = D ? parse(D.yorumlarMetni) : [];
    if (!list.length) {
      track.outerHTML = '<p class="ref-data-warn">⚠ js/yorumlar.js okunamadı' + (errLine ? ' (satır ' + errLine + ')' : '') + '. Yorumlar Google sayfasında görülebilir.</p>';
      var nv = document.querySelector('#yorumlar .yr-navs'); if (nv) nv.style.display = 'none';
      return;
    }
    if (D.googleLink) document.querySelectorAll('#yorumlar .yr-sum').forEach(function (a) { a.href = D.googleLink; });
    if (D.yorumYazLink) document.querySelectorAll('#yorumlar .yr-write').forEach(function (a) { a.href = D.yorumYazLink; });

    var yazili = list.filter(function (r) { return r.kart === true || (r.kart !== false && !!r.yorum); });
    var puan = list.filter(function (r) { return !(r.kart === true || (r.kart !== false && !!r.yorum)); });
    var cnt = document.getElementById('yr-count');
    if (cnt) cnt.textContent = list.length + ' Google yorumu';

    track.innerHTML = yazili.map(function (r) {
      return '<article class="rev" role="listitem">' +
        '<div class="rev-h">' + av(r.ad) + '<div class="rev-who"><strong>' + esc(r.ad) + '</strong>' +
        '<span><span class="rev-s" role="img" aria-label="' + r.yildiz + ' yıldız">' + stars(r.yildiz) + '</span>' + (r.tarih ? ' · ' + esc(r.tarih) : '') + '</span></div></div>' +
        (r.yorum ? '<p class="rev-t">' + esc(r.yorum) + '</p>' : '<p class="rev-t rev-nt">Yorum yazmadan ' + r.yildiz + ' yıldız verdi.</p>') + '</article>';
    }).join('');

    // Uzun metne "Devamı"
    Array.prototype.forEach.call(track.querySelectorAll('.rev-t'), function (p) {
      if (p.scrollHeight > p.clientHeight + 2) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'rev-more'; b.textContent = 'Devamı'; b.setAttribute('aria-expanded', 'false');
        b.addEventListener('click', function () {
          var open = p.classList.toggle('open');
          b.textContent = open ? 'Kısalt' : 'Devamı'; b.setAttribute('aria-expanded', String(open));
        });
        p.parentNode.appendChild(b);
      }
    });

    // Kaydırma düğmeleri
    var prev = document.getElementById('yr-prev'), next = document.getElementById('yr-next');
    function upd() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      var nv = document.querySelector('#yorumlar .yr-navs'); if (nv) nv.style.visibility = max <= 0 ? 'hidden' : '';
    }
    function step(d) {
      var card = track.querySelector('.rev'); var w = card ? card.getBoundingClientRect().width + 12 : track.clientWidth;
      var n = Math.max(1, Math.floor((track.clientWidth + 12) / w));
      track.scrollBy({ left: d * n * w, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    upd();

    // Yorum yazmadan puan verenler
    var ex = document.getElementById('yr-extra');
    if (ex && puan.length) {
      var shown = puan.slice(0, 6);
      ex.innerHTML = '<button type="button" class="yr-quiet" aria-expanded="false" aria-controls="yr-quiet-list">' +
        '<span class="yr-stack">' + shown.map(function (r) { return av(r.ad, 'sm'); }).join('') +
        (puan.length > shown.length ? '<span class="av sm more">+' + (puan.length - shown.length) + '</span>' : '') + '</span>' +
        '<span>' + puan.length + ' kişi daha puan verdi</span><span class="yr-chev" aria-hidden="true">›</span></button>' +
        '<ul class="yr-quiet-list" id="yr-quiet-list" hidden>' + puan.map(function (r) {
          return '<li>' + av(r.ad, 'sm') + '<span>' + esc(r.ad) + '</span><span class="rev-s" role="img" aria-label="' + r.yildiz + ' yıldız">' + r.yildiz + '★</span></li>';
        }).join('') + '</ul>';
      var qb = ex.querySelector('.yr-quiet'), ql = ex.querySelector('.yr-quiet-list');
      qb.addEventListener('click', function () {
        var open = ql.hidden; ql.hidden = !open; qb.setAttribute('aria-expanded', String(open));
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* ── ÇİZİM ANİMASYONLARI DÖNGÜSÜ ──
   .draw / .dfade içeren her SVG görünür olunca baştan oynar,
   bittikten sonra kısa bir bekleme ile tekrar eder. Ekran dışındayken durur. */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var HOLD = 5000, FADE = 550;
  var svgs = [];
  document.querySelectorAll('svg').forEach(function (svg) { if (svg.querySelector('.draw, .dfade')) svgs.push(svg); });
  if (!svgs.length || !('IntersectionObserver' in window)) return;

  function length(svg) {
    var max = 0;
    svg.querySelectorAll('.draw, .dfade').forEach(function (el) {
      var cs = getComputedStyle(el);
      var t = (parseFloat(cs.animationDuration) || 0) + (parseFloat(cs.animationDelay) || 0);
      if (t > max) max = t;
    });
    return Math.max(1500, max * 1000);
  }
  svgs.forEach(function (svg) {
    var st = { timer: 0, on: false, dur: length(svg) };
    svg.classList.add('loop-anim', 'reset');
    function clear() { clearTimeout(st.timer); st.timer = 0; }
    function start() {
      clear();
      svg.classList.remove('fading', 'play');
      svg.classList.add('reset');
      void svg.getBoundingClientRect();
      svg.classList.remove('reset');
      svg.classList.add('play');
      st.timer = setTimeout(function () {
        svg.classList.add('fading');
        st.timer = setTimeout(function () { st.timer = 0; if (st.on && !document.hidden) start(); }, FADE);
      }, st.dur + HOLD);
    }
    new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis && !st.on) { st.on = true; start(); }
      else if (!vis && st.on) { st.on = false; clear(); }
    }, { threshold: 0.35 }).observe(svg);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && st.on && !st.timer) start(); });
  });
})();
