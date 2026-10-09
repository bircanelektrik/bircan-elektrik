// Bircan Elektrik — tasarım dosyasından (Main.dc.html) gerçek site dosyalarını üretir.
const fs = require('fs');
const path = require('path');
const [,, MAIN, MARKD, SRCDIR, OUT] = process.argv;
const src = fs.readFileSync(MAIN, 'utf8');
const D_MARK = fs.readFileSync(MARKD, 'utf8').trim();
fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'images'), { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = (s) => esc(s).replace(/"/g, '&quot;');
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

// ── 1. Veri: tasarımdaki data() fonksiyonunu çalıştır
const sStart = src.indexOf("data-dc-script data-props=");
const code = src.slice(src.indexOf('>', sStart) + 1, src.indexOf('</script>', sStart));
class DCLogic { constructor() { this.state = {}; } setState() {} }
const Component = new Function('DCLogic', code + '\nreturn Component;')(DCLogic);
const D = new Component().data();
D.topics.sort((x, y) => x.lv - y.lv); // konu numaraları seviye sırasını izlesin
must(D.topics.length === 13 && D.services.length === 8 && D.tools.length === 4, 'veri eksik');

// ── 2. Tasarım gövdesi ve parça çıkarma
const body = src.slice(src.indexOf('<div class="bp"'), src.indexOf('</x-dc>'));
const chunk = (a, b) => { const i = body.indexOf(a), j = body.indexOf(b, i + 1); must(i >= 0 && j > i, 'parça yok: ' + a); return body.slice(i, j); };
const mod = (name) => {
  const tag = `<sc-if value="{{m.${name}}}"`; const i = body.indexOf(tag); must(i >= 0, 'modül yok ' + name);
  const a = body.indexOf('>', i) + 1; const b = body.indexOf('\n</sc-if>', a); return body.slice(a, b).trim();
};
const helmetCss = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>'));

// ── 3. Logo işareti
const markSvg = (w, h, id) => `<svg width="${w}" height="${h}" viewBox="34 87 420 341" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#f1d7ad"/><stop offset=".55" stop-color="#d2a56f"/><stop offset="1" stop-color="#9a6a3c"/></linearGradient></defs><path fill="url(#${id})" fill-rule="evenodd" d="${D_MARK}"/></svg>`;
fs.writeFileSync(path.join(OUT, 'images/logo-mark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="34 87 420 341" width="420" height="341"><defs><linearGradient id="g" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#f1d7ad"/><stop offset=".55" stop-color="#d2a56f"/><stop offset="1" stop-color="#9a6a3c"/></linearGradient></defs><path fill="url(#g)" fill-rule="evenodd" d="${D_MARK}"/></svg>\n`);
fs.writeFileSync(path.join(OUT, 'images/logo-mark-koyu.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="34 87 420 341" width="420" height="341"><path fill="#16181a" fill-rule="evenodd" d="${D_MARK}"/></svg>\n`);
fs.writeFileSync(path.join(OUT, 'images/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 47 460 460"><rect x="14" y="47" width="460" height="460" rx="92" fill="#0e1012"/><path fill="#d9b07a" fill-rule="evenodd" d="${D_MARK}"/></svg>\n`);

// ── 4. Ortak parçalar
const WA = 'https://wa.me/905340140949?text=';
const svcIcons = [
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7v4M12 7v4M16 7v4M8 15h8"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-6"/><path d="M4 21h16"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h12v10H3z"/><path d="m15 10 6-3v10l-6-3"/></svg>',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4l16 16z"/><path d="M8 16v-4l4 4z"/></svg>'
];

// NAV
const navItems = [['/hakkimizda/', 'Hakkımızda', ''], ['#hizmetler', 'Hizmetler', 'hizmetler'], ['#teknik', 'Teknik', 'teknik'], ['#rehber', 'Rehber', 'rehber'], ['#yorumlar', 'Yorumlar', 'yorumlar'], ['#hizmet-alani', 'Hizmet Alanı', 'hizmet-alani'], ['#referanslar', 'Referanslar', 'referanslar'], ['#teklif', 'İletişim', 'teklif']];
const nav = `<nav class="topnav" aria-label="Ana menü">
<div class="wrap-w nav-inner">
<a class="nav-logo" href="#hero" aria-label="Bircan Elektrik Mühendislik — ana sayfa">
${markSvg(64, 52, 'lgNav')}
<span class="cinzel nav-word"><span class="nw1">BİRCAN</span><span class="nw2">ELEKTRİK</span><span class="nw3">MÜHENDİSLİK</span></span>
</a>
<div class="nav-links only-d">
${navItems.map(([h, t, s]) => `<a class="navl" href="${h}"${s ? ` data-section="${s}"` : ''}>${t}</a>`).join('\n')}
</div>
<div class="nav-actions">
<button type="button" class="btn btn-gold nav-cta hide-m" data-action="callpopup">Hemen Ara</button>
<button type="button" class="nav-burger only-m" id="nav-burger" aria-label="Menüyü aç/kapat" aria-expanded="false" aria-controls="mnav"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h12"/></svg></button>
</div>
</div>
<div class="mnav" id="mnav" hidden>
${navItems.map(([h, t]) => `<a class="navl" href="${h}">${t}</a>`).join('\n')}
<a class="btn btn-gold" href="#teklif">Teklif Al</a>
</div>
</nav>`;

// HERO
let hero = chunk('<!-- HERO -->', '<!-- HAKKIMIZDA -->')
  .replace('<section id="hero" style=', '<section id="hero" class="hero" style=')
  .replace('class="badge in in1"', 'class="badge hero-badge"')
  .replace(/ class="in in[0-9]"/g, '')
  .replace('class="inR"', 'class="hero-right"')
  .replace('<div style="display: flex; flex-wrap: wrap; gap: 8px">\n<span class="chip">Yetkili Elektrikçi', '<div class="hero-chips" style="display: flex; flex-wrap: wrap; gap: 8px">\n<span class="chip">Yetkili Elektrikçi')
  .replace('onClick="{{openMalzeme}}"', `onclick="setTimeout(function(){var b=document.getElementById('catbtn-malzeme');if(b&&!b.classList.contains('open')&&typeof toggleCat==='function'){toggleCat('malzeme',b);}},400);"`);

// HİZMETLER (bircan.js kartları doldurur)
const services = `<div class="section-divider"><hr><span>Hizmetler</span><hr></div>
<section id="hizmetler" class="sec" style="padding: 56px 0 104px; background: linear-gradient(180deg, rgba(19,21,23,.97) 0%, rgba(14,16,18,.99) 100%)">
<div class="wrap-w" style="display: flex; flex-direction: column; gap: 14px">
<span class="kick">Çözüm Portföyü</span>
<h2 class="h2">Mühendislik Temelli Elektrik Çözümleri</h2>
<p class="lead" style="margin-bottom: 30px">Standartlara uygun tasarım, uygulama ve devreye alma. Kapsamı görmek için bir başlığa tıklayın.</p>
<div class="services-grid" id="grid">
${D.services.map((s, i) => `<div class="svc-card" role="button" tabindex="0" aria-controls="detail">
<span class="svc-icon">${svcIcons[i]}</span>
<div class="svc-title">${esc(s.title)}</div>
<div class="svc-desc">${esc(s.desc)}</div>
<div class="svc-footer"><span class="svc-tag">${esc(s.tag)}</span><span class="svc-cta">${esc(s.cta)}</span></div>
</div>`).join('\n')}
</div>
<div class="detail-box" id="detail" aria-live="polite"></div>
</div>
</section>`;

// TEKNİK ODAK (bircan.js toggleCat ile)
const toolIcon = {
  aydinlatma: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  salt: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  sulama: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/></svg>',
  malzeme: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6M9 19h3"/></svg>'
};
const toolPreview = {
  aydinlatma: '<span class="tp-kelvin"><span class="tp-kelvin-bar"></span><span class="mono tp-kelvin-lbl"><span>1000K</span><span>4000K</span><span>7000K</span></span></span>',
  salt: '<span class="mono tp-salt"><span class="tp-on">C16</span><span>2,5 mm²</span><span>ΔU %</span></span>',
  sulama: '<svg viewBox="0 0 200 64" width="100%" height="64" aria-hidden="true"><path d="M6 58 H196 M6 4 V58" stroke="rgba(236,233,228,.25)" fill="none"/><path d="M8 10 C70 12 130 26 192 56" stroke="#d2a56f" stroke-width="2" fill="none"/><path d="M8 52 C70 46 130 30 192 14" stroke="rgba(236,233,228,.5)" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/><circle class="pulse" cx="118" cy="30" r="4" fill="#e5c38f"/></svg>',
  malzeme: '<span class="tp-list"><span><span>ADP + daire panosu</span><b>✓</b></span><span><span>Kolon · NYY / NYM</span><b>✓</b></span><span><span>Topraklama</span><b>✓</b></span></span>'
};
const teknik = `<div class="section-divider" style="padding-top: 8px"><hr><span>Teknik Odak</span><hr></div>
<section id="teknik" class="sec" style="padding: 56px 0 112px; position: relative; overflow: hidden">
<div aria-hidden="true" class="teknik-grid-bg"></div>
<div class="wrap-w" style="position: relative; display: flex; flex-direction: column; gap: 32px">
<div class="teknik-head">
<div style="display: flex; flex-direction: column; gap: 14px">
<span class="kick teknik-kicker">Hesap ve Planlama Modülleri</span>
<h2 class="teknik-title">Teknik Odak</h2>
<p class="lead" style="font-size: 17px">Kendi işlerimizde kullandığımız hesap modülleri herkese açık. Ön hesabınızı yapın, sonucu bize gönderin.</p>
</div>
</div>
<div class="tools-grid">
${D.tools.map((t) => `<button type="button" class="cat-btn tool" id="catbtn-${t.id}" data-cat="${t.id}" aria-controls="cat-${t.id}" aria-expanded="false">
<span class="cat-btn-top"><span class="cat-icon tool-ic">${toolIcon[t.id]}</span><span class="cat-badge tool-badge">${esc(t.badge)}</span></span>
<span class="tool-preview">${toolPreview[t.id]}</span>
<span class="cat-btn-body"><span class="cat-title">${esc(t.title)}</span><span class="cat-sub">${esc(t.sub)}</span></span>
<span class="cat-btn-foot"><span class="cat-meta">${esc(t.meta)}</span><span class="cat-arrow tool-arrow" aria-hidden="true">▼</span></span>
</button>
<div class="cat-panel" id="cat-${t.id}" role="region" aria-labelledby="catbtn-${t.id}">
<div class="cat-inner">
<div class="sulama-entry">
<div class="sulama-entry__head">
<span class="sulama-entry__badge">${esc(t.pBadge)}</span>
<h3 class="sulama-entry__title">${esc(t.pTitle)}</h3>
<p class="sulama-entry__desc">${esc(t.pDesc)}</p>
</div>
<div class="sulama-entry__grid">
${t.items.map((it) => `<article class="sulama-entry__item"><div class="sulama-entry__item-title">${esc(it.t)}</div><p>${esc(it.d)}</p></article>`).join('\n')}
</div>
<div class="sulama-entry__actions">
<a class="sulama-entry__cta sulama-entry__cta--primary btn btn-gold" href="${t.href}" target="_blank" rel="noopener">Aracı Aç ↗</a>
<a class="sulama-entry__cta sulama-entry__cta--secondary btn btn-line" href="${escA(t.wa)}" target="_blank" rel="noopener">Uzman değerlendirmesi için bize ulaşın</a>
</div>
${t.trust ? `<p class="sulama-entry__trust">${esc(t.trust)}</p>` : ''}
</div>
</div>
</div>`).join('\n')}
</div>
</div>
</section>`;

// REHBER
const lvlName = { 1: 'Temel', 2: 'Orta', 3: 'İleri' };
const pole0 = D.poles.find((p) => p.id === '1PN');
const noteFor = { kes: 'ayrılır', gec: 'bağlı kalır', yok: 'yok' };
const poleRowsHtml = (p) => ['L1', 'L2', 'L3', 'N'].map((k) => {
  const st = p.L[k];
  const mid = st === 'kes'
    ? '<div class="brk"><svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true"><path d="M2 12 L22 2" stroke="#86562b" stroke-width="2.2"/></svg></div>'
    : `<div class="brk-pass"><div class="cond cond-${st}"></div></div>`;
  return `<div class="pole-row"><span class="mono pole-lbl">${k}</span><div class="cond cond-${st}"></div>${mid}<div class="cond cond-${st}"></div><span class="mono pole-note">${noteFor[st]}</span></div>`;
}).join('');
const modules = {
  proje: `<div class="mod"><span class="mod-cap mono">BİR PROJEDE HESAPLANANLAR</span><div class="proje-grid">${D.projeItems.map((p) => `<div><span class="mono">${p.n}</span><strong>${esc(p.t)}</strong></div>`).join('')}</div><p class="mod-note">Bunlar sahaya çıkmadan çözülür; çözülmeyen her başlık sahada sorun olarak döner.</p></div>`,
  katman: mod('katman'), urun: mod('urun'), maliyet: mod('maliyet'), kesit: mod('kesit'), grup: mod('grup'), kisa: mod('kisa'), ttip: mod('ttip'), bakim: mod('bakim'),
  kutup: `<div class="mod rh-picker" data-set="poles">
<div class="pick-row" role="group" aria-label="Kutup sayısı seçin">${D.poles.map((p) => `<button type="button" class="pick${p.id === '1PN' ? ' is-on' : ''}" data-key="${p.id}" aria-pressed="${p.id === '1PN'}" style="min-width: 72px">${esc(p.name)}</button>`).join('')}</div>
<div class="pole-wrap">
<div class="pole-rows">${poleRowsHtml(pole0)}</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="pole-name"><span data-f="name">${esc(pole0.name)}</span> <small>· <span data-f="sub">${esc(pole0.sub)}</span></small></span>
<p style="font-size: 15.5px; font-weight: 600" data-f="note">${esc(pole0.note)}</p>
<p style="font-size: 15px; color: #43474b"><span class="mono mod-k">NEREDE · </span><span data-f="where">${esc(pole0.where)}</span></p>
</div>
</div>
</div>`,
  tip: (() => {
    let m = mod('tip');
    const f0 = D.fuses[0];
    m = m.replace(/<sc-for list="\{\{fuses\}\}"[\s\S]*?<\/sc-for>/, D.fuses.map((f, i) => `<button type="button" class="pick ftype${i === 0 ? ' is-on' : ''}" data-key="${escA(f.code)}" aria-pressed="${i === 0}"><span class="ft-code">${esc(f.code)}</span><span class="mono ft-kind">${esc(f.kind)}</span></button>`).join(''));
    m = m.replace('<div class="mod">', '<div class="mod rh-picker" data-set="fuses">');
    ['trip', 'name', 'where', 'why', 'wrong'].forEach((k) => { m = m.replace(`{{fuse.${k}}}`, `<span data-f="${k}">${esc(f0[k])}</span>`); });
    return m;
  })(),
  rcd: (() => {
    let m = mod('rcd');
    const r0 = D.rcds[1];
    m = m.replace(/<sc-for list="\{\{rcds\}\}"[\s\S]*?<\/sc-for>/, D.rcds.map((r) => `<button type="button" class="pick${r.code === 'A' ? ' is-on' : ''}" data-key="${r.code}" aria-pressed="${r.code === 'A'}" style="min-width: 64px">${r.code}</button>`).join(''));
    m = m.replace('<div class="mod">', '<div class="mod rh-picker" data-set="rcds">');
    ['detects', 'where', 'note'].forEach((k) => { m = m.replace(`{{rcd.${k}}}`, `<span data-f="${k}">${esc(r0[k])}</span>`); });
    return m;
  })(),
  toprak: (() => {
    const i = body.indexOf('<sc-if value="{{m.toprak}}"'); const a = body.indexOf('>', i) + 1;
    const j = body.indexOf('<sc-if value="{{m.ttip}}"', a); must(j > a, 'toprak sonu');
    let m = body.slice(a, j).trim(); m = m.slice(0, m.lastIndexOf('</sc-if>')).trim();
    const key = { Ok: 'ok', Rcd: 'rcd', None: 'none' };
    m = m.replace(/<button type="button" class="seg \{\{earth(Ok|Rcd|None)Cls\}\}" onClick="\{\{setEarth\w+\}\}"/g, (_, k) => `<button type="button" class="seg${k === 'Ok' ? ' is-on' : ''}" data-earth="${key[k]}" aria-pressed="${k === 'Ok'}"`)
      .replace(/<sc-if value="\{\{earth(Ok|Rcd|None)\}\}" hint-placeholder-val="\{\{ (true|false) \}\}">/g, (_, k) => `<div class="earth-view" data-view="${key[k]}"${k === 'Ok' ? '' : ' hidden'}>`)
      .replace(/<\/sc-if>/g, '</div>');
    must((m.match(/data-earth=/g) || []).length === 3 && (m.match(/earth-view/g) || []).length === 3, 'topraklama 3 senaryo');
    return m.replace('<div style="background: #16181a; color: #ece9e4; padding: 28px;', '<div class="earth-mod" style="background: #16181a; color: #ece9e4; padding: 28px;');
  })()
};
Object.entries(modules).forEach(([k, v]) => must(!/\{\{|<sc-/.test(v), 'modülde şablon kaldı: ' + k));
const rehberTabs = [1, 2, 3].map((lv) => `<div class="rh-group"><span class="mono rh-group-lbl">${lvlName[lv].toLocaleUpperCase('tr-TR')}</span>
${D.topics.map((t, i) => [t, i]).filter(([t]) => t.lv === lv).map(([t, i]) => `<button type="button" role="tab" class="tab rh-tab${i === 0 ? ' is-on' : ''}" id="rh-tab-${i}" aria-controls="rh-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-topic="${i}"><span class="rh-tab-in"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(t.name)}</span></button>`).join('\n')}
</div>`).join('\n');
const rehberPanels = D.topics.map((t, i) => `<div class="rh-panel" id="rh-panel-${i}" role="tabpanel" aria-labelledby="rh-tab-${i}"${i ? ' hidden' : ''}>
<div class="rh-head"><div class="rh-meta"><span class="lvl lvl-${t.lv}">${lvlName[t.lv]}</span><span class="mono">Konu ${String(i + 1).padStart(2, '0')} / 13</span></div><h3>${esc(t.headline)}</h3></div>
${modules[t.mod]}
<div class="qa-list">
${t.qs.map((q, j) => `<details class="qa"${j === 0 ? ' open' : ''}><summary class="qa-btn"><span>${esc(q[0])}</span><span class="qa-ic" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6"/></svg></span></summary><div class="qa-body"><p class="qa-a">${esc(q[1])}</p><p class="qa-b"><span class="mono">SAHADA</span>${esc(q[2])}</p></div></details>`).join('\n')}
</div>
<div class="rh-cta"><button type="button" class="btn rh-next" data-next="${(i + 1) % D.topics.length}">Sonraki konu →</button></div>
</div>`).join('\n');
const rehber = `<section id="rehber" class="sec rehber">
<div class="wrap" style="display: flex; flex-direction: column; gap: 48px">
<div class="rh-top">
<div style="display: flex; flex-direction: column; gap: 14px; max-width: 780px">
<span class="kick" style="color: #86562b">Teknik Rehber · Temelden profesyonele</span>
<h2 class="h2" style="color: #16181a">Elektrikte doğru sistem nasıl kurulur?</h2>
<p style="font-size: 17px; color: #43474b; max-width: 680px">Projeden topraklamaya 13 başlık; her cevabın altında sahada nasıl uyguladığımız.</p>
</div>
<div class="rh-levels"><span class="lvl lvl-1">Temel</span><span>→</span><span class="lvl lvl-2">Orta</span><span>→</span><span class="lvl lvl-3">İleri</span></div>
</div>
<div class="qa-grid">
<div class="rh-tabs" role="tablist" aria-label="Konular">
${rehberTabs}
</div>
<div class="rh-panels">
${rehberPanels}
</div>
</div>
</div>
</section>`;

// SÜREÇ
const st0 = D.steps[0];
const surec = `<div class="section-divider" style="padding-top: 72px"><hr><span>Çalışma Süreci</span><hr></div>
<section id="surec" class="sec" style="padding: 56px 0 104px">
<div class="wrap" style="display: flex; flex-direction: column; gap: 44px">
<div class="sec-head">
<div style="display: flex; flex-direction: column; gap: 14px"><span class="kick">Kurulum ve uygulama</span><h2 class="h2">Bir işi nasıl yürütüyoruz?</h2></div>
<p class="lead" style="max-width: 420px; font-size: 15.5px">Keşiften devreye almaya altı adım; her adımın bir çıktısı var.</p>
</div>
<div class="surec-track"><div class="surec-bar" id="surec-bar" style="width: 17%"></div></div>
<div class="steps6" role="tablist" aria-label="Süreç adımları">
${D.steps.map((s, i) => `<button type="button" class="step${i === 0 ? ' is-on' : ''}" data-step="${i}" role="tab" aria-selected="${i === 0}"><span class="mono">${String(i + 1).padStart(2, '0')}</span><span class="step-t">${esc(s.title)}</span></button>`).join('')}
</div>
<div class="surec-detail" aria-live="polite">
<div style="display: flex; flex-direction: column; gap: 14px"><span class="mono surec-k">AŞAMA <span id="surec-num">01</span> / 06</span><h3 id="surec-title">${esc(st0.title)}</h3><p id="surec-desc">${esc(st0.desc)}</p></div>
<div style="display: flex; flex-direction: column; gap: 14px; justify-content: center"><span class="mono surec-k2">KONTROL EDİLENLER</span><div class="chips" id="surec-checks">${st0.checks.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div><div class="surec-out"><span class="mono">ÇIKTI</span><span id="surec-out">${esc(st0.out)}</span></div></div>
</div>
</div>
</section>`;

// HİZMET ALANI
let alan = chunk('<!-- HİZMET ALANI -->', '<!-- REFERANSLAR -->')
  .replace(/<div class="ph" style="height: 440px[^>]*>[\s\S]*?<\/span><\/div>/, '<div id="hizmet-harita" class="map-canvas" style="height: 440px"></div>')
  .replace(/<div class="ph" style="height: 400px[^>]*>[\s\S]*?<\/span><\/div>/, '<div id="ucret-harita" class="map-canvas map-canvas-interactive" style="height: 400px; cursor: crosshair"></div>\n<div id="ucret-sonuc"></div>')
  .replace('<div style="display: flex; flex-wrap: wrap; gap: 8px">\n<span style="background: #ece9e4', '<div class="sehir-etiketler" style="display: flex; flex-wrap: wrap; gap: 8px">\n<span style="background: #ece9e4')
  .replace('<div style="padding: 14px 18px; border-radius: 12px; background: rgba(210,165,111,.08)', '<div class="servis-hint" style="padding: 14px 18px; border-radius: 12px; background: rgba(210,165,111,.08)');
must(alan.includes('id="hizmet-harita"') && alan.includes('id="ucret-sonuc"') && alan.includes('sehir-etiketler'), 'harita dönüşümü');

// REFERANSLAR (bircan.js renderRef + images.js)
const referanslar = `<div class="section-divider"><hr><span>Referanslar</span><hr></div>
<section id="referanslar" class="sec" style="padding: 56px 0 96px">
<div class="wrap" style="display: flex; flex-direction: column; gap: 22px">
<h2 class="h2">Tamamlanan Projeler</h2>
<p class="lead" style="font-size: 15.5px">Konut, ticari ve endüstriyel işlerimizden bazıları.</p>
<div class="ref-filter" role="group" aria-label="Proje filtresi">
<button type="button" class="rfbtn active" data-ref-filter="all">Tümü</button>
<button type="button" class="rfbtn" data-ref-filter="konut">Konut</button>
<button type="button" class="rfbtn" data-ref-filter="ticari">Ticari</button>
<button type="button" class="rfbtn" data-ref-filter="endustriyel">Endüstriyel</button>
<button type="button" class="rfbtn" data-ref-filter="altyapi">Altyapı</button>
</div>
<div class="ref-grid" id="ref-grid"></div>
</div>
</section>`;

// Statik bölümler
const plain = (a, b) => chunk(a, b);
const hakkimizda = plain('<!-- HAKKIMIZDA -->', '<!-- NEDEN BİRCAN -->');
const olcut = plain('<!-- 4 ÖLÇÜT -->', '<!-- TEKNİK REHBER -->');
const neden = plain('<!-- NEDEN BİRCAN -->', '<!-- MALİYET -->');
const maliyet = plain('<!-- MALİYET -->', '<!-- HİZMETLER');
const isletme = plain('<!-- İŞLETME -->', '<!-- YORUMLAR -->');
const yorumlar = plain('<!-- YORUMLAR -->', '<!-- HİZMET ALANI -->');
let teklif = plain('<!-- TEKLİF -->', '<!-- FOOTER -->')
  .replace('<div class="wrap form-grid">\n<div id="ekip" style=', '<div class="wrap form-grid">\n<div class="teklif-info" id="ekip" style=')
  .replace(/<form onSubmit="\{\{noSubmit\}\}" style=/, '<div class="teklif-form-box" style=')
  .replace('</form>', '</div>')
  .replace('type="submit" class="btn btn-gold" id="tf-submit"', 'type="button" class="btn btn-gold teklif-btn" id="tf-submit"')
  .replace('<p style="grid-column: 1 / -1; font-size: 12px; color: #8f959b; text-align: center">Formu', '<div id="tf-status" role="status" style="display: none; grid-column: 1 / -1; padding: 10px 14px; border-radius: 8px; font-size: 13px"></div>\n<p style="grid-column: 1 / -1; font-size: 12px; color: #8f959b; text-align: center">Formu');
must(teklif.includes('id="tf-status"') && teklif.includes('teklif-form-box') && !teklif.includes('<form'), 'teklif dönüşümü');
must((teklif.match(/contact-person-card/g) || []).length === 2 && teklif.includes('teklif-info" id="ekip"'), 'iletişim dönüşümü');
const footer = plain('<!-- FOOTER -->', '<div class="mbar"');
const mbar = body.slice(body.indexOf('<div class="mbar"'), body.indexOf('<sc-if value="{{callOpen}}"')).trim();

const popup = `<div id="call-overlay" data-action="hidepopup" style="display:none"></div>
<div id="call-popup" role="dialog" aria-modal="true" aria-labelledby="call-popup-title" style="display:none">
<div class="cp-head"><span id="call-popup-title">Hemen İletişime Geçin</span><button type="button" class="cp-close" onclick="hideCallPopup()" aria-label="Kapat">✕</button></div>
<a class="cp-row" href="tel:+905340140949"><span class="cp-l">Burak Bircan — Mühendis</span><span class="cp-n">0534 014 09 49</span></a>
<a class="cp-row" href="tel:+905378754414"><span class="cp-l">Cuma Bircan — Yetkili Elektrikçi</span><span class="cp-n">0537 875 44 14</span></a>
<a class="cp-wa" href="https://wa.me/905340140949?text=Merhaba%2C%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener">WhatsApp ile Yaz</a>
</div>`;

// ── 5. HEAD (SEO korunur)
const oldIndex = fs.readFileSync(path.join(SRCDIR, 'index.html'), 'utf8');
let head = oldIndex.slice(oldIndex.indexOf('<head>') + 6, oldIndex.indexOf('</head>'));
head = head.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/, '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Cinzel:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">')
  .replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="css/home.css">\n<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">\n<meta name="theme-color" content="#0e1012">');
must(head.includes('css/home.css') && head.includes('Cinzel'), 'head dönüşümü');
head = head.split(' 30+ yıl deneyim, 7/24 teknik destek.').join(' 7/24 teknik destek.');
must(!head.includes('30+'), 'meta vurgu temizliği');
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: D.topics.flatMap((t) => t.qs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } }))) };
head += `<script type="application/ld+json">\n${JSON.stringify(faq)}\n</script>\n`;

// ── 6. index.html
const strip = (h) => h.replace(/<!-- [^>]*-->\n?/g, '').replace(/class="sdiv"/g, 'class="section-divider"');
let html = `<!DOCTYPE html>
<html lang="tr">
<head>${head}</head>
<body class="bp">
<a class="skip" href="#hizmetler">İçeriğe geç</a>
${nav}
${popup}
<main>
${strip(hero)}
${strip(hakkimizda)}
${strip(neden)}
${strip(maliyet)}
${services}
${teknik}
${strip(olcut)}
${rehber}
${surec}
${strip(isletme)}
${strip(yorumlar)}
${strip(alan)}
${referanslar}
${strip(teklif)}
</main>
${strip(footer)}
${mbar}
<script src="js/bircan.js"></script>
<script src="js/images.js"></script>
<script src="js/animations.js"></script>
<script src="js/home.js"></script>
</body>
</html>
`;
html = html.replace(/<sc-if[\s\S]*?<\/sc-if>/g, (m) => { throw new Error('sc-if kaldı: ' + m.slice(0, 80)); });
must(!/\{\{|<sc-|onClick=|hint-placeholder/.test(html), 'şablon izi kaldı');
const needIds = ['call-overlay', 'call-popup', 'grid', 'detail', 'catbtn-aydinlatma', 'catbtn-salt', 'catbtn-sulama', 'catbtn-malzeme', 'cat-aydinlatma', 'cat-salt', 'cat-sulama', 'cat-malzeme', 'hizmet-harita', 'ucret-harita', 'ucret-sonuc', 'ref-grid', 'tf-name', 'tf-phone', 'tf-email', 'tf-location', 'tf-service', 'tf-detail', 'tf-submit', 'tf-status', 'hero', 'hizmetler', 'teknik', 'rehber', 'yorumlar', 'hizmet-alani', 'referanslar', 'teklif', 'ekip'];
needIds.forEach((id) => must((html.match(new RegExp(`id="${id}"`, 'g')) || []).length === 1, 'id eksik/çift: ' + id));
fs.writeFileSync(path.join(OUT, 'index.html'), html);

// ── 7. home.css
let css = helmetCss
  .replace(/\.sdiv/g, '.section-divider')
  .replace(';transform-origin:left;animation:hrIn 1.2s cubic-bezier(.3,.7,.2,1) both', '')
  .replace('body{margin:0;background:#0e1012}', '')
  .replace(/,\.section-divider hr\{animation/, '{animation');
css = `/* ══════════════════════════════════════════
   home.css — Bircan Elektrik ana sayfa (yeni tasarım)
   Yalnızca index.html kullanır. Alt sayfalar css/style.css ile devam eder.
   ══════════════════════════════════════════ */
:root{--gray:#b9bdc1;--gray-light:rgba(232,230,227,.12);--black:#ece9e4;--white:#141618;--gold:#d2a56f;--radius:12px}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body.bp{margin:0;font-family:'Archivo',system-ui,sans-serif;color:#ece9e4;background:#0e1012;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%}
section[id]{scroll-margin-top:90px}
main{overflow-x:clip}
::selection{background:rgba(210,165,111,.3)}
:focus-visible{outline:2px solid #e5c38f;outline-offset:3px}
.skip{position:absolute;left:-9999px;top:8px;z-index:999;background:#d2a56f;color:#1d140a;padding:10px 14px;border-radius:8px}
.skip:focus{left:8px}
${css}
/* ── Üst menü ── */
.topnav{position:sticky;top:0;z-index:200;background:rgba(18,20,23,.97);border-bottom:1px solid rgba(255,255,255,.05)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:80px}
.nav-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
.nav-word{display:flex;flex-direction:column;line-height:1.02;color:#d9b07a}
.nw1{font-size:21px;font-weight:600;letter-spacing:.05em}.nw2{font-size:14.5px;font-weight:600;letter-spacing:.06em}.nw3{font-size:9.5px;font-weight:600;letter-spacing:.2em;margin-top:2px}
.nav-links{display:flex;align-items:center}
.navl.active{color:#e5c38f}.navl.active::after{transform:scaleX(1)}
.nav-actions{display:flex;align-items:center;gap:10px}
.nav-cta{min-height:44px;padding:0 22px;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:700}
.nav-burger{width:48px;height:48px;align-items:center;justify-content:center;background:transparent;border:1px solid rgba(236,233,228,.2);border-radius:10px;color:#ece9e4;cursor:pointer}
.mnav{border-top:1px solid rgba(236,233,228,.08);background:#0e1012;padding:12px 20px 24px;display:flex;flex-direction:column}
.mnav[hidden]{display:none}
.mnav .navl{font-size:15px;padding:14px 0}
.mnav .btn{margin-top:16px}
/* ── Hizmet kartları (bircan.js doldurur) ── */
.svc-card{outline-offset:-2px}
.svc-icon svg{display:block}
.svc-title{display:block}.svc-desc{display:block}
.svc-footer{margin-top:18px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.svc-cta::after{content:'›';color:#d2a56f;font-size:15px;line-height:1}
.detail-box{display:none;margin-top:8px;padding:44px;border-radius:16px;background:linear-gradient(180deg,rgba(29,33,37,.95) 0%,rgba(15,17,19,.98) 100%);box-shadow:0 34px 72px rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,255,255,.05)}
.detail-box.visible{display:block}
.detail-kicker{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#d2a56f}
.detail-code{min-width:44px;height:36px;padding:0 12px;border-radius:10px;background:rgba(210,165,111,.12);display:inline-flex;align-items:center;justify-content:center;color:#e5c38f}
.detail-code svg{width:18px;height:18px}
.detail-box h3{font-size:clamp(28px,2.8vw,38px);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:0 0 14px}
.detail-box>p{color:rgba(232,230,227,.82);font-size:15.5px;line-height:1.8;max-width:900px;margin:0 0 18px}
.detail-note{padding:16px 18px;border-radius:14px;background:linear-gradient(180deg,rgba(210,165,111,.12) 0%,rgba(31,25,19,.72) 100%);box-shadow:inset 0 0 0 1px rgba(229,195,143,.14);max-width:900px;margin-bottom:18px}
.detail-note-label{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#d2a56f;margin-bottom:6px}
.detail-note p{font-size:14px;color:#ece9e4;margin:0}
.features-wrap{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
.detail-actions{display:flex;flex-wrap:wrap;gap:10px}
/* ── Teknik Odak ── */
.teknik-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(210,165,111,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(210,165,111,.05) 1px,transparent 1px);background-size:64px 64px;pointer-events:none}
.teknik-head{display:grid;grid-template-columns:minmax(0,1fr);gap:48px;max-width:860px}
.teknik-title{font-size:clamp(40px,5vw,68px);line-height:.98;letter-spacing:-.04em;font-weight:900;margin:0}
.teknik-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:rgba(210,165,111,.25);border-radius:14px;overflow:hidden}
.teknik-stats div{background:#121417;padding:18px;display:flex;flex-direction:column}
.teknik-stats b{font-size:30px;font-weight:900;color:#d2a56f;line-height:1}.teknik-stats span{font-size:12px;color:#c9cdd1}
.tools-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.tools-grid .cat-btn{order:1}
.tools-grid .cat-panel{order:2;grid-column:1/-1;display:none}
.tools-grid .cat-panel.open{display:block;animation:qaIn .35s ease both}
.cat-btn-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.tool-preview{height:70px;display:flex;align-items:center}
.cat-btn-body{display:flex;flex-direction:column;gap:8px}
.cat-title{font-size:22px;font-weight:800;letter-spacing:-.02em}
.cat-sub{font-size:14px;color:rgba(232,230,227,.78);line-height:1.6}
.cat-btn-foot{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}
.cat-meta{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#d2a56f}
.cat-arrow{color:#d2a56f}
.cat-btn.open .tool-arrow{transform:rotate(180deg)}
.tp-kelvin{display:flex;flex-direction:column;gap:6px;width:100%}
.tp-kelvin-bar{height:12px;border-radius:6px;background:linear-gradient(90deg,#ff8a2b,#ffb35c,#ffe2b8,#fff6ec,#e6efff,#bcd4ff)}
.tp-kelvin-lbl{display:flex;justify-content:space-between;font-size:10px;color:#8f959b}
.tp-salt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;width:100%;font-size:11px}
.tp-salt span{padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;text-align:center}
.tp-salt .tp-on{border-color:rgba(210,165,111,.35);color:#e5c38f}
.tp-list{display:flex;flex-direction:column;gap:6px;width:100%;font-size:12px;color:#c9cdd1}
.tp-list>span{display:flex;justify-content:space-between;border-bottom:1px dashed rgba(255,255,255,.12);padding-bottom:4px}
.tp-list>span:last-child{border-bottom:0}.tp-list b{color:#d2a56f;font-weight:600}
.cat-inner{padding:36px;border-radius:22px;background:linear-gradient(180deg,#1b1e22 0%,#111316 100%);border:1px solid rgba(210,165,111,.3)}
.sulama-entry{display:flex;flex-direction:column;gap:22px}
.sulama-entry__head{display:flex;flex-direction:column;gap:10px;max-width:820px}
.sulama-entry__badge{align-self:flex-start;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#1d140a;background:#d2a56f;padding:5px 11px;border-radius:99px;font-weight:700}
.sulama-entry__title{font-size:30px;font-weight:800;letter-spacing:-.03em;margin:0}
.sulama-entry__desc{color:#c9cdd1;font-size:15.5px;line-height:1.75;margin:0}
.sulama-entry__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.sulama-entry__item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px}
.sulama-entry__item-title{font-weight:700;font-size:15px;margin-bottom:6px}
.sulama-entry__item p{font-size:13.5px;color:rgba(232,230,227,.74);line-height:1.6;margin:0}
.sulama-entry__actions{display:flex;gap:10px;flex-wrap:wrap}
.sulama-entry__actions .btn-gold{min-height:54px;padding:0 28px;font-size:15px}
.sulama-entry__trust{font-size:12.5px;color:#8f959b;margin:0}
/* ── Teknik Rehber ── */
.rehber{padding:112px 0;background-color:#efebe4;background-image:linear-gradient(rgba(22,24,26,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(22,24,26,.045) 1px,transparent 1px);background-size:32px 32px;color:#16181a}
.rh-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:28px}
.rh-levels{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:#6b7075}
.rh-tabs{display:flex;flex-direction:column;gap:18px;position:sticky;top:100px}
.rh-group{display:flex;flex-direction:column;gap:2px}
.rh-group-lbl{font-size:10.5px;letter-spacing:.14em;color:#6b7075;padding:0 0 6px 16px}
.rh-tab-in{display:flex;gap:10px;align-items:baseline}.rh-tab-in .mono{font-size:11px;color:#6b7075}
.rh-panel{display:flex;flex-direction:column;gap:30px;min-width:0}
.rh-panel[hidden]{display:none}
.rh-head{display:flex;flex-direction:column;gap:10px}
.rh-meta{display:flex;gap:10px;align-items:center}.rh-meta .mono{font-size:12px;color:#6b7075}
.rh-head h3{font-size:clamp(28px,3vw,40px);font-weight:800;letter-spacing:-.025em;line-height:1.08;margin:0}
.mod-cap{font-size:12px;letter-spacing:.08em;color:#6b7075}
.mod-note{font-size:14.5px;color:#43474b;margin:0}
.mod-k{font-size:11.5px;color:#86562b;letter-spacing:.08em}
.proje-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.proje-grid>div{background:#efebe4;border:1px solid rgba(22,24,26,.12);padding:14px 12px;display:flex;flex-direction:column;gap:6px}
.proje-grid .mono{font-size:11px;color:#86562b}.proje-grid strong{font-size:14px;line-height:1.25}
.pick-row{display:flex;flex-wrap:wrap;gap:8px}
.pole-wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;align-items:center}
.pole-rows{display:flex;flex-direction:column;gap:16px;padding:8px 0}
.pole-row{display:flex;align-items:center;gap:12px}
.pole-lbl{width:26px;font-size:13px;font-weight:600}.pole-note{width:76px;font-size:11px;color:#6b7075}
.brk{width:46px;height:26px;border:2px solid #16181a;background:#efebe4;display:flex;align-items:center;justify-content:center}
.brk-pass{width:46px;height:26px;display:flex;align-items:center}
.pole-name{font-size:26px;font-weight:800;letter-spacing:-.02em}.pole-name small{font-size:15px;font-weight:500;color:#6b7075}
.ftype{min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-family:'Archivo',sans-serif}
.ft-code{font-size:22px;font-weight:800;line-height:1}.ft-kind{font-size:10px;opacity:.75}
.qa-list{border-bottom:1px solid rgba(22,24,26,.14)}
details.qa>summary{list-style:none}
details.qa>summary::-webkit-details-marker{display:none}
details.qa[open] .qa-ic{transform:rotate(45deg);background:#16181a;color:#efebe4;border-color:#16181a}
details.qa[open] .qa-body{animation:qaIn .35s ease both}
.qa-body{display:flex;flex-direction:column;gap:14px;max-width:780px;padding-bottom:24px}
.qa-a{font-size:16px;color:#43474b;line-height:1.75;margin:0}
.qa-b{font-size:15px;color:#16181a;background:#e5dfd4;padding:14px 16px;border-left:3px solid #86562b;margin:0}
.qa-b .mono{font-size:11px;letter-spacing:.1em;color:#86562b;display:block;margin-bottom:4px}
.rh-cta{display:flex;justify-content:flex-end}
.rh-next{background:#16181a;color:#ece9e4}
.rh-next:hover{background:#2a2e32}
.rh-cta>span{font-size:16.5px;font-weight:600}
.rh-cta-btns{display:flex;gap:10px;flex-wrap:wrap}
/* ── Süreç ── */
.sec-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:24px}
.surec-track{position:relative;height:2px;background:rgba(236,233,228,.1)}
.surec-bar{position:absolute;inset:0 auto 0 0;background:#d2a56f;transition:width .6s cubic-bezier(.6,.1,.2,1)}
.step .mono{font-size:12px}.step-t{font-size:18px;font-weight:700}
.surec-detail{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:40px;padding:40px;border:1px solid rgba(236,233,228,.12);border-radius:16px;background:#121518}
.surec-k{font-size:12px;color:#d2a56f;letter-spacing:.1em}.surec-k2{font-size:11.5px;color:#8f959b;letter-spacing:.1em}
#surec-title{font-size:36px;font-weight:800;letter-spacing:-.025em;line-height:1.05;margin:0}
#surec-desc{font-size:16.5px;color:#c9cdd1;margin:0}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.surec-out{display:flex;gap:12px;align-items:center;padding-top:10px;border-top:1px solid rgba(236,233,228,.1)}
.surec-out .mono{font-size:11.5px;color:#d2a56f;letter-spacing:.1em}#surec-out{font-weight:600}
/* ── Referanslar (bircan.js + images.js) ── */
.ref-filter{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}
.ref-grid{display:block;columns:3;column-gap:14px}
.ref-grid .ref-card{break-inside:avoid;-webkit-column-break-inside:avoid;margin:0 0 14px;border:1px solid rgba(210,165,111,.16);border-radius:12px}
.ref-card{cursor:default}
.ref-card-header{padding:20px 20px 8px;display:flex;flex-direction:column-reverse;align-items:flex-start;gap:10px}
.ref-title{font-size:15px;font-weight:600;line-height:1.3}
.ref-tag{font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#d2a56f;background:rgba(196,112,62,.12);padding:3px 9px;border-radius:99px;height:fit-content;white-space:normal;max-width:100%;line-height:1.5}
.ref-card-body{padding:0 20px 22px;display:flex;flex-direction:column;gap:10px;flex:1}
.ref-loc{font-size:11.5px;color:rgba(232,230,227,.66)}
.ref-desc{font-size:13.5px;color:rgba(232,230,227,.78);line-height:1.65;flex:1}
.ref-specs{display:flex;flex-wrap:wrap;gap:5px}
.ref-spec{font-size:10px;padding:3px 10px;background:#23282d;color:#d4cec6;border-radius:99px;letter-spacing:.04em}
.ref-img-wrap{width:100%;aspect-ratio:1/1;height:auto;background:#0f1113;transition:aspect-ratio .3s;overflow:hidden;display:block;flex-shrink:0}
.ref-img-wrap img{width:100%;height:100%;object-fit:cover;display:block}
.ref-img-wrap{position:relative}
.ref-img-wrap .rc-track{display:flex;width:100%;height:100%;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain}
.ref-img-wrap .rc-track::-webkit-scrollbar{display:none}
.ref-img-wrap .rc-track img{flex:0 0 100%;min-width:100%;object-fit:contain;scroll-snap-align:start;scroll-snap-stop:always;user-select:none;-webkit-user-drag:none}
.rc-count{position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:99px;background:rgba(14,16,18,.72);color:#ece9e4;font:600 12px 'IBM Plex Mono',monospace;pointer-events:none}
.rc-dots{position:absolute;left:0;right:0;bottom:9px;display:flex;justify-content:center;gap:5px;pointer-events:none}
.rc-dot{width:6px;height:6px;border-radius:50%;background:rgba(236,233,228,.45);transition:background .2s,transform .2s}
.rc-dot.is-on{background:#ece9e4;transform:scale(1.3)}
.rc-btn{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;padding:0;border:0;border-radius:50%;background:rgba(236,233,228,.9);color:#16181a;font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s}
.rc-prev{left:8px}.rc-next{right:8px}
.ref-carousel:hover .rc-btn,.rc-btn:focus-visible{opacity:1}
.rc-btn:disabled{visibility:hidden}
.ref-img-bad{aspect-ratio:1/1;display:flex;align-items:flex-end;padding:12px;font:12px 'IBM Plex Mono',monospace;color:#e5a24a;background:repeating-linear-gradient(135deg,#2a2218 0 14px,#231d15 14px 28px)}
.ref-data-warn{column-span:all;margin:0 0 14px;padding:12px 16px;border-radius:10px;background:rgba(229,162,74,.12);border:1px solid rgba(229,162,74,.5);color:#f0c27a;font-size:14px}
.ref-card .ref-desc{display:-webkit-box;-webkit-line-clamp:4;line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.ref-more{align-self:flex-start;margin-top:4px;min-height:44px;padding:0 18px;border-radius:99px;border:1px solid rgba(210,165,111,.45);background:transparent;color:#e5c38f;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s}
.ref-more:hover,.ref-more:focus-visible{background:rgba(210,165,111,.14)}
.rd-overlay{position:fixed;inset:0;z-index:3000;background:rgba(8,9,10,.8);display:flex;align-items:center;justify-content:center;padding:16px}
.rd-overlay[hidden]{display:none}
.rd-box{position:relative;width:min(560px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#16191c;border:1px solid rgba(210,165,111,.25);border-radius:16px;color:#ece9e4;box-shadow:0 30px 80px rgba(0,0,0,.5)}
.rd-box .ref-img-wrap{aspect-ratio:auto;height:min(60vh,440px);border-radius:16px 16px 0 0}
.rd-box .rc-btn{opacity:1}
.rd-box .rc-count{left:12px;right:auto}
.rd-body{padding:20px 22px 24px;display:flex;flex-direction:column;gap:10px}
.rd-title{margin:0;padding-right:36px;font-size:20px;font-weight:800;line-height:1.25;letter-spacing:-.01em}
.rd-meta{font-size:13px;color:#d2a56f}
.rd-text{margin:0;font-size:15px;line-height:1.7;color:#c9cdd1;white-space:pre-line}
.rd-specs{display:flex;flex-wrap:wrap;gap:6px}
.rd-specs span{font-size:12px;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,.06);color:#c9cdd1}
.rd-close{position:absolute;top:10px;right:10px;z-index:3;width:40px;height:40px;border-radius:50%;border:0;background:rgba(14,16,18,.82);color:#ece9e4;font-size:16px;cursor:pointer}
.rd-close:hover{background:#2a2e32}
@media (hover:none){.rc-btn{display:none}}
.ref-card:not(:has(.ref-img-wrap))::after{content:'Saha fotoğrafı eklenecek';order:-1;aspect-ratio:1/1;display:flex;align-items:flex-end;padding:12px;font:11px 'IBM Plex Mono',monospace;color:#8f959b;background:repeating-linear-gradient(135deg,#1a1e22 0 14px,#16191c 14px 28px)}
.exp-badge{display:inline-flex;flex-direction:column;align-items:flex-start;background:rgba(184,150,62,.08);border:1px solid rgba(184,150,62,.22);border-radius:12px;padding:16px 28px;text-align:left}
.experience-metric-line{font-size:15px;font-weight:600}
.img-gsap-wrap{overflow:hidden;display:block;position:relative}
.img-gsap-wrap img{display:block;width:100%;height:100%;object-fit:cover}
/* ── Harita ── */
.map-canvas{width:100%;border-radius:12px;overflow:hidden;border:1px solid rgba(236,233,228,.1);background:#16191c}
.leaflet-container{font-family:'Archivo',system-ui,sans-serif}
#ucret-sonuc{display:none;padding:24px;border-radius:14px;background:#141618;border:1px solid rgba(210,165,111,.25);color:#ece9e4}
/* ── Ekip ── */
.team-img-wrap{border-bottom:1px solid rgba(210,165,111,.25)}
/* ── Hemen Ara penceresi ── */
#call-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300}
#call-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:301;width:min(420px,90vw);background:#1c2024;border:1px solid rgba(210,165,111,.3);border-radius:16px;padding:28px;flex-direction:column;gap:10px}
#call-popup[style*="block"]{display:flex!important}
.cp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:18px;font-weight:700}
.cp-close{width:44px;height:44px;background:transparent;border:0;color:#c9cdd1;cursor:pointer;font-size:18px}
.cp-row{display:flex;flex-direction:column;padding:16px 18px;background:#141618;border-radius:12px;text-decoration:none;color:#ece9e4}
.cp-row:hover{background:#0e1012;color:#ece9e4}
.cp-l{font-size:11px;opacity:.6}.cp-n{font-size:16px;font-weight:600}
.cp-wa{display:flex;align-items:center;justify-content:center;min-height:52px;background:rgba(37,211,102,.12);color:#4ade80;border:1px solid rgba(37,211,102,.28);border-radius:12px;text-decoration:none;font-size:14px;font-weight:600}
.cp-wa:hover{color:#4ade80;background:rgba(37,211,102,.2)}
/* ── Duyarlı ── */
@media (max-width:1280px){.nav-links .navl{padding:10px 7px 13px;font-size:10px}}
@media (max-width:1080px){
.teknik-head{grid-template-columns:minmax(0,1fr);gap:24px}
.tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.sulama-entry__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.rh-tabs{position:static;flex-direction:row;overflow-x:auto;gap:6px;padding-bottom:6px}
.rh-group{flex-direction:row;gap:6px;align-items:center}
.rh-group-lbl{padding:0 6px 0 0}
.rh-tabs .tab{min-width:max-content;border-left:0;border-bottom:2px solid rgba(22,24,26,.12)}
.rh-tabs .tab.is-on{border-bottom-color:#86562b}
.proje-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
.ref-grid{columns:2}
}
@media (max-width:760px){
body.bp{padding-bottom:62px}
.tools-grid,.sulama-entry__grid{grid-template-columns:minmax(0,1fr)}
.ref-grid{columns:1}
.proje-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.rehber{padding:72px 0}
.detail-box,.cat-inner,.surec-detail{padding:24px}
.mod{padding:18px}
.hero-right{padding:16px}
.steps6{grid-template-columns:repeat(2,minmax(0,1fr))}
.step-t{font-size:15px}
}
`;
{ const k = css.indexOf('/* ── Üst menü ── */'); must(k > 0, 'css bölücü');
  css = css.slice(0, k) + css.slice(k).replace(/(font-size:\s?)(\d+(?:\.\d+)?)px/g, (m, a, v) => { v = parseFloat(v); return a + (v < 12 ? Math.min(12, v + 1) : v) + 'px'; }).replace("font:11px 'IBM Plex Mono'", "font:12px 'IBM Plex Mono'"); }
fs.writeFileSync(path.join(OUT, 'css/home.css'), css);

// ── 8. home.js
const HOME_DATA = { poles: D.poles, fuses: D.fuses, rcds: D.rcds, steps: D.steps };
const homeJs = `/* ══════════════════════════════════════════
   home.js — Bircan Elektrik ana sayfa etkileşimleri
   (mobil menü, Teknik Rehber, seçiciler, süreç adımları)
   bircan.js / animations.js / images.js'e dokunmaz.
   ══════════════════════════════════════════ */
(function () {
  'use strict';
  var DATA = ${JSON.stringify(HOME_DATA)};
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
`;
fs.writeFileSync(path.join(OUT, 'js/home.js'), homeJs);

// ── 9. bircan.js / images.js / animations.js yamaları
const patch = (file, pairs) => {
  let t = fs.readFileSync(path.join(SRCDIR, file), 'utf8');
  pairs.forEach(([a, b, label]) => { must(typeof a === 'string' ? t.includes(a) : a.test(t), `${file}: bulunamadı → ${label}`); t = t.replace(a, b); });
  fs.writeFileSync(path.join(OUT, file), t);
};
const waLabels = D.services.map((s) => s.waLabel);
patch('js/bircan.js', [
  ["  }).join('');\n}\n\n/* ── TEKLİF FORMU ── */", "  }).join('');\n  /* images.js okunamadıysa (yazım hatası) görünür uyarı */\n  if (!(window.BIRCAN_IMAGES && window.BIRCAN_IMAGES.projeler)) {\n    var w = document.createElement('div');\n    w.className = 'ref-data-warn';\n    w.textContent = '⚠ js/images.js dosyasında yazım hatası var' + (window.__imgErrLine ? ' (satır ' + window.__imgErrLine + ')' : '') + '. Referanslar eski yedek listeden gösteriliyor.';\n    el.insertBefore(w, el.firstChild);\n  }\n}\n\n/* ── TEKLİF FORMU ── */", 'images.js hata uyarısı'],
  ['var refData = [', '/* YEDEK: Referans kartları js/images.js → projeler listesinden okunur. Burayı düzenlemeyin;\n   images.js yüklenemezse bu liste gösterilir. */\nvar refData = [', 'refData yedek notu'],
  ["];\n\nvar activeRefFilter = 'all';", "];\n\n/* Kartlar tek yerden: window.BIRCAN_IMAGES.projeler (js/images.js) */\n/* images.js'te yazım hatası olursa satırını yakala (uyarıda gösterilir) */\nwindow.addEventListener('error', function (e) { if (e && e.filename && /images\\.js/.test(e.filename)) window.__imgErrLine = e.lineno; });\nfunction getRefData() {\n  var P = window.BIRCAN_IMAGES && window.BIRCAN_IMAGES.projeler;\n  if (!P || !P.length) return refData;\n  var norm = function (s) { return String(s || '').toLowerCase().replace(/ı/g, 'i').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/[^a-z]/g, ''); };\n  return P.filter(function (p) { return p && p.baslik; }).map(function (p) {\n    return { cat: norm(p.kategori), tag: p.etiket || '', title: p.baslik, loc: p.yer ? '📍 ' + p.yer : '', desc: p.aciklama || '', specs: p.ozellikler || [] };\n  });\n}\n\nvar activeRefFilter = 'all';", 'getRefData'],
  ['var filtered = refData.filter(', 'var filtered = getRefData().filter(', 'renderRef → getRefData'],
  [/    \.catch\(function\(\) \{\n      \/\/ 2\) ORS fallback\n[\s\S]*?\n          cb\(\{ km: hv \* 1\.35, dk: Math\.round\(hv \* 1\.35 \* 1\.2\), src: 'hvFallback' \}\);\n        \}\);\n    \}\);\n/, "    .catch(function() {\n      // 2) Yol servisine ulaşılamazsa: kuş uçuşu × 1,45 (bölgedeki dağ yolları için ortalama dolambaç)\n      var hv = haversineKm(lat1, lng1, lat2, lng2);\n      cb({ km: hv * 1.45, dk: Math.round(hv * 1.45 * 1.2), src: 'hvFallback' });\n    });\n", 'ORS (anahtarsız, çalışmıyordu) kaldırıldı'],
  ['/* ── ROTA — OSRM → ORS → haversine fallback ── */', '/* ── ROTA — OSRM → kuş uçuşu tahmini ── */', 'rota başlığı'],
  [`<div style="font-size:11px;color:var(--gray);margin-bottom:4px;">Yol Mesafesi</div>';`, `<div style="font-size:11px;color:var(--gray);margin-bottom:4px;">'+(src==='hvFallback'?'Yaklaşık Mesafe':'Yol Mesafesi')+'</div>';`, 'mesafe etiketi'],
  ["  if(dk) html += '<div style=\"font-size:12px;color:var(--gray);\">≈'+dk+' dk</div>';\n", "  if(dk) html += '<div style=\"font-size:12px;color:var(--gray);\">≈'+dk+' dk</div>';\n  if(src==='hvFallback') html += '<div style=\"font-size:11px;color:var(--gray);\">yol servisine ulaşılamadı · kuş uçuşundan tahmin</div>';\n", 'tahmin notu'],
  ...JSON.parse(fs.readFileSync(path.join(__dirname, 'copy_bircan.json'), 'utf8')).map(([a, b]) => [a, b, 'metin: ' + a.slice(0, 30)]),
  ["];\n\nfunction renderServicesGrid", `];\n\n/* Yeni tasarım: emoji yerine çizgi ikon + hizmete özel çağrı metni */\nvar SVC_ICONS=${JSON.stringify(svcIcons)};\nvar SVC_WA_LABELS=${JSON.stringify(waLabels)};\nservices.forEach(function(s,i){ if(SVC_ICONS[i]) s.icon=SVC_ICONS[i]; s.waLabel=SVC_WA_LABELS[i]||'WhatsApp ile Sorun'; });\n\nfunction renderServicesGrid`, 'services array end'],
  ["'<div class=\"features-wrap\">'+s.features.map(function(f){return'<span class=\"feat-pill\">'+f+'</span>';}).join('')+'</div>';", "'<div class=\"features-wrap\">'+s.features.map(function(f){return'<span class=\"feat-pill\">'+f+'</span>';}).join('')+'</div>'+\n    '<div class=\"detail-actions\"><a class=\"btn btn-gold\" href=\"https://wa.me/905340140949?text='+encodeURIComponent('Merhaba, '+s.title+' hakkında bilgi almak istiyorum.')+'\" target=\"_blank\" rel=\"noopener\">'+s.waLabel+'</a><a class=\"btn btn-line\" href=\"#teklif\">Teklif Formu</a></div>';", 'detail features'],
  ['World_Light_Gray_Base', 'World_Dark_Gray_Base', 'dark tiles'],
  ['map.fitBounds(L.circle([DUKKAN.lat,DUKKAN.lng],{radius:155000}).getBounds(),{padding:[20,20]})', 'map.fitBounds(L.latLng(DUKKAN.lat,DUKKAN.lng).toBounds(310000),{padding:[20,20]})', 'hizmet bounds (haritaya eklenmemiş dairede getBounds hata veriyordu)'],
  ['map.fitBounds(L.circle([DUKKAN.lat,DUKKAN.lng],{radius:57000}).getBounds(),{padding:[30,30]})', 'map.fitBounds(L.latLng(DUKKAN.lat,DUKKAN.lng).toBounds(SACIL*2000+4000),{padding:[30,30]})', 'ucret bounds'],
  ['var SDMAX = 55;      // Maksimum hizmet mesafesi (km)', 'var SDMAX = 55;      // (eski) yol mesafesi sınırı — artık kullanılmıyor\nvar SACIL = 45;      // Acil müdahale yarıçapı (km, kuş uçuşu). Çemberin içi her zaman hizmet alanıdır; yol km yalnızca ücret için kullanılır.', 'SACIL'],
  ["L.circle([DUKKAN.lat,DUKKAN.lng],{radius:55000,color:'#b8963e',weight:1.5,fillColor:'#b8963e',fillOpacity:0.07,dashArray:'6 4'}).addTo(map);", "L.circle([DUKKAN.lat,DUKKAN.lng],{radius:SACIL*1000,color:'#b8963e',weight:1.5,fillColor:'#b8963e',fillOpacity:0.07,dashArray:'6 4'}).addTo(map).bindTooltip('Acil müdahale alanı · ~'+SACIL+' km',{direction:'top',sticky:true});", 'circle'],
  [/    if\(hvKm > SDMAX \* 1\.2\) \{\n[\s\S]*?\n      return;\n    \}\n/, "    if(hvKm > SACIL) {\n      var p=document.getElementById('ucret-sonuc');\n      if(p){p.innerHTML='<div style=\"padding:14px 16px;background:rgba(210,165,111,0.1);border:1px solid rgba(210,165,111,0.35);border-radius:8px;color:#e5c38f;font-weight:600;line-height:1.6;\">Bu nokta acil müdahale alanımızın (~'+SACIL+' km) dışında — kuş uçuşu ~'+Math.round(hvKm)+' km. Planlı işler için bizi arayın: <a href=\"tel:+905340140949\" style=\"color:inherit;text-decoration:underline;\">0534 014 09 49</a></div>';p.style.display='block';}\n      return;\n    }\n", 'precheck'],
  [/      if\(km > SDMAX\) \{\n[\s\S]*?\n        return;\n      \}\n/, "      /* Çemberin içindeki her nokta hizmet alanıdır; yol mesafesi yalnızca ücret hesabı içindir. */\n", 'road check'],
  ["km<=SDMAX?'🟠 Orta mesafe':'🔴 Uzak bölge'", "'🟠 Acil müdahale alanı içinde'", 'band']
]);
patch('js/images.js', [
  [/hero: 'data:image\/jpeg;base64,[A-Za-z0-9+\/=]+',/, "hero: '', /* Eski arka plan kaldırıldı (kablo demeti — gruplama hatası). Yeni girişte tek hat şeması var. */", 'hero'],
  [/vizyon:\s+'https:\/\/images\.unsplash[^']*',/, "vizyon:    '',", 'vizyon'],
  [/hizmetler: 'https:\/\/images\.unsplash[^']*',/, "hizmetler: '',", 'hizmetler'],
  [/teknik:\s+'https:\/\/images\.unsplash[^']*',/, "teknik:    '',", 'teknik'],
  [/ekip:\s+'https:\/\/images\.unsplash[^']*'/, "ekip:      ''", 'ekip'],
  ["'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',", "[], /* YENİ FOTO: YİBO saha fotoğrafı eklenecek (stok görsel kaldırıldı) */", 'yibo'],
  ["'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',", "[], /* YENİ FOTO: GES saha fotoğrafı eklenecek (stok görsel kaldırıldı) */", 'ges'],
  [/  \/\* ── LOGO ── \*\/\n  logo: 'data:image\/png;base64,[A-Za-z0-9+\/=]+',[^\n]*\n/, '', 'eski logo verisi (kullanılmıyor)'],
  ["  /* ── LOGO ── */\n  var logoImg = document.querySelector('#nav-logo-img');\n  if (logoImg && IMG.logo) {\n    logoImg.src = IMG.logo;\n    logoImg.style.display = 'block';\n  }\n\n", '', 'eski logo kodu'],
  [/      \/\* Kart başlığına göre sabit görsel eşleştir \*\/[\s\S]*?\n      \}\n    \}\);\n/, "      /* Kart başlığına göre proje bilgisi ve fotoğraflar (images.js → projeler) */\n      var proje = projectBySlug[slugifyProjectTitle(title.textContent)] || { fotolar: projectImageMap[slugifyProjectTitle(title.textContent)] };\n\n      /* Detay butonu → küçük açıklama penceresi */\n      if (!card.querySelector('.ref-more')) {\n        var more = document.createElement('button');\n        more.type = 'button';\n        more.className = 'ref-more';\n        more.setAttribute('aria-haspopup', 'dialog');\n        more.textContent = 'Detay';\n        more.addEventListener('click', function () { openRefDetail(proje, title.textContent, more); });\n        (card.querySelector('.ref-card-body') || card).appendChild(more);\n      }\n\n      var cu = cleanUrls(proje.fotolar);\n      var urls = cu.ok, bad = cu.bad;\n      if (bad.length && window.console) console.warn('Referans \"' + title.textContent + '\": i.ibb.co doğrudan linki gerekli, sayfa linki yazılmış:', bad);\n      if (!urls.length) {\n        if (!bad.length) return;\n        var warn = document.createElement('div');\n        warn.className = 'ref-img-wrap ref-img-bad';\n        warn.textContent = 'Fotoğraf linki hatalı: i.ibb.co ile başlayan doğrudan link gerekli';\n        card.insertBefore(warn, card.firstChild);\n        changed = true;\n        return;\n      }\n\n      var g = buildGallery(urls, title.textContent, true);\n      var wrap = g.wrap, imgs = g.imgs, many = g.many;\n      card.insertBefore(wrap, card.firstChild);\n      changed = true;\n\n      /* GSAP varsa siyah-beyaz → renk efekti (dizide büyütme yok, yan fotoğraf görünmesin) */\n      if (typeof gsap !== 'undefined') {\n        gsap.set(imgs, { filter: 'grayscale(100%) brightness(0.55)', scale: 1 });\n        wrap.addEventListener('mouseenter', function () {\n          gsap.to(imgs, { filter: 'grayscale(0%) brightness(0.88)', scale: many ? 1 : 1.05, duration: 1.2, ease: 'power3.out' });\n        });\n        wrap.addEventListener('mouseleave', function () {\n          gsap.to(imgs, { filter: 'grayscale(100%) brightness(0.55)', scale: 1, duration: 1.5, ease: 'power3.out' });\n        });\n      }\n    });\n", 'referans fotoğraf dizisi'],
  [/^(    )('https:\/\/i\.ibb\.co\/[^']+')(,?)$/gm, '$1[$2]$3', 'fotoğraf linkleri liste biçimine'],
  ["     Gerçek fotoğraf eklemek için: '/images/proje.jpg' yazın.    */", "     Her proje bir liste: ['link1', 'link2', 'link3'].\n     Birden fazla link yazılırsa kartta Instagram gibi kaydırılan fotoğraf dizisi çıkar;\n     tek link yazılırsa tek fotoğraf görünür. Sıra = kartta görünme sırası.   */", 'kullanım notu'],
  [/  \/\* ── REFERANS PROJELERİ[\s\S]*?\n  \],\n/, () => fs.readFileSync(path.join(__dirname, 'projeler_block.txt'), 'utf8'), 'referanslar tek liste (projeler)'],
  [/  var projectImageMap = \{[\s\S]*?\n  \};\n/, () => "  /* Kart başlığı → fotoğraf listesi (projeler listesinden) */\n  var projectImageMap = {};\n  var projectBySlug = {};\n  (IMG.projeler || []).forEach(function (p) { if (p && p.baslik) { projectImageMap[slugifyProjectTitle(p.baslik)] = p.fotolar || []; projectBySlug[slugifyProjectTitle(p.baslik)] = p; } });\n", 'foto eşlemesi projeler listesinden'],
  ["   4. Kopyaladığın URL'yi yukarıdaki projects[] dizisine yapıştır", "   4. Kopyaladığın URL'yi yukarıdaki projeler listesinde ilgili kartın fotolar: [ ] kısmına yapıştır", 'yardım notu'],
  ['  /* ── REFERANS PROJELERİ ── */\n', () => "  /* ── Fotoğraf dizisi (kartta ve detay penceresinde ortak) ──\n     urls: fotoğraf linkleri · label: erişilebilir ad · fit: alan ilk fotoğrafın oranını alsın mı\n     Açılmayan link ya da i.ibb.co'nun \"image not found\" kutusu (180×180) kendiliğinden çıkarılır. */\n  function buildGallery(urls, label, fit) {\n    var wrap = document.createElement('div');\n    wrap.className = 'ref-img-wrap';\n    /* img-gsap-wrap: animations.js fotoğrafları ikinci kez sarmasın */\n    var track = document.createElement('div');\n    track.className = 'rc-track img-gsap-wrap';\n    wrap.appendChild(track);\n    var imgs = urls.map(function (u) {\n      var img = document.createElement('img');\n      img.src = u;\n      img.alt = label;\n      img.loading = 'lazy';\n      img.decoding = 'async';\n      img.draggable = false;\n      track.appendChild(img);\n      return img;\n    });\n\n    var count, dots, prev, next, cur = 0, ctrl = false;\n    var total = function () { return imgs.length; };\n    var show = function (k) {\n      k = Math.max(0, Math.min(total() - 1, k));\n      cur = k;\n      if (!ctrl) return;\n      count.textContent = (k + 1) + '/' + total();\n      Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('is-on', j === k); });\n      prev.disabled = k === 0;\n      next.disabled = k === total() - 1;\n    };\n    var go = function (k) {\n      k = Math.max(0, Math.min(total() - 1, k));\n      track.scrollTo({ left: k * track.clientWidth, behavior: 'smooth' });\n    };\n    var controlsOn = function () {\n      if (ctrl) return;\n      ctrl = true;\n      wrap.classList.add('ref-carousel');\n      wrap.setAttribute('role', 'group');\n      wrap.setAttribute('aria-roledescription', 'fotoğraf dizisi');\n      wrap.setAttribute('aria-label', label);\n      count = document.createElement('span'); count.className = 'rc-count';\n      dots = document.createElement('div'); dots.className = 'rc-dots'; dots.setAttribute('aria-hidden', 'true');\n      prev = document.createElement('button');\n      prev.type = 'button'; prev.className = 'rc-btn rc-prev'; prev.setAttribute('aria-label', 'Önceki fotoğraf'); prev.innerHTML = '&#8249;';\n      next = document.createElement('button');\n      next.type = 'button'; next.className = 'rc-btn rc-next'; next.setAttribute('aria-label', 'Sonraki fotoğraf'); next.innerHTML = '&#8250;';\n      prev.addEventListener('click', function () { go(cur - 1); });\n      next.addEventListener('click', function () { go(cur + 1); });\n      wrap.appendChild(count); wrap.appendChild(dots); wrap.appendChild(prev); wrap.appendChild(next);\n    };\n    var controlsOff = function () {\n      if (!ctrl) return;\n      ctrl = false;\n      [count, dots, prev, next].forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });\n      wrap.classList.remove('ref-carousel');\n      wrap.removeAttribute('role'); wrap.removeAttribute('aria-roledescription'); wrap.removeAttribute('aria-label');\n    };\n    var sync = function () {\n      if (total() > 1) {\n        controlsOn();\n        dots.innerHTML = '';\n        imgs.forEach(function () { var d = document.createElement('span'); d.className = 'rc-dot'; dots.appendChild(d); });\n      } else controlsOff();\n      imgs.forEach(function (im, k) { im.alt = label + (total() > 1 ? ' — fotoğraf ' + (k + 1) + '/' + total() : ''); });\n      show(Math.min(cur, Math.max(0, total() - 1)));\n    };\n\n    /* Alan, ilk fotoğrafın en-boy oranını alır (en dikey 4:5, en yatay 16:9);\n       diğer fotoğraflar kesilmeden alana sığdırılır */\n    var doFit = function () {\n      if (!fit || !imgs.length) return;\n      var im = imgs[0];\n      if (!im.naturalWidth || !im.naturalHeight) return;\n      var r = Math.max(0.8, Math.min(1.78, im.naturalWidth / im.naturalHeight));\n      wrap.style.aspectRatio = r.toFixed(3);\n      if (typeof ScrollTrigger !== 'undefined') {\n        clearTimeout(window.__refFitT);\n        window.__refFitT = setTimeout(function () { ScrollTrigger.refresh(); }, 250);\n      }\n    };\n    var drop = function (im) {\n      var i = imgs.indexOf(im);\n      if (i < 0) return;\n      imgs.splice(i, 1);\n      if (im.parentNode) im.parentNode.removeChild(im);\n      if (window.console) console.warn('Referans \"' + label + '\": açılmayan fotoğraf gizlendi →', im.src);\n      if (!imgs.length) { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); return; }\n      sync();\n      if (i === 0) doFit();\n    };\n    var check = function (im) {\n      if (im.naturalWidth === 180 && im.naturalHeight === 180) drop(im); /* i.ibb.co \"image not found\" */\n      else if (imgs[0] === im) doFit();\n    };\n    imgs.slice().forEach(function (im) {\n      im.addEventListener('error', function () { drop(im); });\n      if (im.complete && im.naturalWidth) check(im);\n      else im.addEventListener('load', function () { check(im); });\n    });\n\n    track.addEventListener('scroll', function () {\n      if (track.clientWidth) show(Math.round(track.scrollLeft / track.clientWidth));\n    }, { passive: true });\n    wrap.addEventListener('keydown', function (e) {\n      if (!ctrl) return;\n      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }\n      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }\n    });\n    sync();\n    return { wrap: wrap, imgs: imgs, many: urls.length > 1 };\n  }\n\n  /* Fotoğraf linklerini temizle: \"link1,link2\" yazımını ayırır, ibb.co sayfa linklerini ayıklar */\n  function cleanUrls(list) {\n    var urls = [];\n    (Array.isArray(list) ? list : [list]).forEach(function (u) {\n      String(u || '').split(/[\\s,;]+/).forEach(function (x) { if (x) urls.push(x); });\n    });\n    var isPage = function (u) { return /^https?:\\/\\/(www\\.)?ibb\\.co\\//i.test(u); };\n    return { ok: urls.filter(function (u) { return !isPage(u); }), bad: urls.filter(isPage) };\n  }\n\n  /* ── Referans detay penceresi ── */\n  var rdLast = null;\n  function closeRefDetail() {\n    var o = document.getElementById('ref-dialog');\n    if (!o || o.hidden) return;\n    o.hidden = true;\n    document.body.style.overflow = '';\n    if (rdLast && rdLast.focus) rdLast.focus();\n  }\n  function openRefDetail(p, titleText, opener) {\n    var o = document.getElementById('ref-dialog');\n    if (!o) {\n      o = document.createElement('div');\n      o.id = 'ref-dialog';\n      o.className = 'rd-overlay';\n      o.hidden = true;\n      o.innerHTML = '<div class=\"rd-box\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"rd-title\"></div>';\n      o.addEventListener('click', function (e) { if (e.target === o) closeRefDetail(); });\n      document.addEventListener('keydown', function (e) {\n        if (o.hidden) return;\n        if (e.key === 'Escape') { e.preventDefault(); closeRefDetail(); }\n        if (e.key === 'Tab') {\n          /* Odak pencerenin içinde kalsın (yalnızca görünür butonlar arasında dolaş) */\n          var f = Array.prototype.filter.call(o.querySelectorAll('button:not([disabled]), a[href]'), function (el) {\n            return el.offsetWidth > 0 && getComputedStyle(el).visibility !== 'hidden';\n          });\n          if (!f.length) return;\n          var i = f.indexOf(document.activeElement);\n          e.preventDefault();\n          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();\n        }\n      });\n      document.body.appendChild(o);\n    }\n    var box = o.querySelector('.rd-box');\n    box.innerHTML = '';\n    var close = document.createElement('button');\n    close.type = 'button'; close.className = 'rd-close'; close.setAttribute('aria-label', 'Kapat'); close.innerHTML = '&#10005;';\n    close.addEventListener('click', closeRefDetail);\n    box.appendChild(close);\n\n    var urls = cleanUrls(p.fotolar).ok;\n    if (urls.length) box.appendChild(buildGallery(urls, titleText, false).wrap);\n\n    var body = document.createElement('div');\n    body.className = 'rd-body';\n    var h = document.createElement('h3'); h.id = 'rd-title'; h.className = 'rd-title'; h.textContent = p.baslik || titleText;\n    body.appendChild(h);\n    var metaTxt = [p.etiket, p.yer ? '📍 ' + p.yer : ''].filter(Boolean).join('  ·  ');\n    if (metaTxt) { var m = document.createElement('div'); m.className = 'rd-meta'; m.textContent = metaTxt; body.appendChild(m); }\n    /* detay: [\"1. paragraf\", \"2. paragraf\"] ya da tek yazı; boşsa kısa açıklama */\n    var dt = Array.isArray(p.detay) ? p.detay.filter(Boolean).join('\\n\\n') : String(p.detay || '');\n    var txt = dt.replace(/\\\\n/g, '\\n').trim() || p.aciklama || '';\n    if (txt) { var t = document.createElement('p'); t.className = 'rd-text'; t.textContent = txt; body.appendChild(t); }\n    if (p.ozellikler && p.ozellikler.length) {\n      var s = document.createElement('div'); s.className = 'rd-specs';\n      p.ozellikler.forEach(function (x) { var sp = document.createElement('span'); sp.textContent = x; s.appendChild(sp); });\n      body.appendChild(s);\n    }\n    box.appendChild(body);\n\n    rdLast = opener || null;\n    o.hidden = false;\n    box.scrollTop = 0;\n    document.body.style.overflow = 'hidden';\n    close.focus();\n  }\n\n" + '  /* ── REFERANS PROJELERİ ── */\n', 'galeri + detay penceresi'],
  ["/* ══════════════════════════════════════════\n   UYGULAMA — DOM hazır olunca", () => "/* ══════════════════════════════════════════\n   REFERANSLAR: projelerMetni (düz yazı) → projeler listesi\n   Yazım hatası siteyi bozmasın diye satır satır, hoşgörülü okunur.\n   ══════════════════════════════════════════ */\n(function () {\n  var IMG = window.BIRCAN_IMAGES;\n  if (!IMG || typeof IMG.projelerMetni !== 'string') return;\n  var norm = function (s) {\n    return String(s || '').replace(/İ/g, 'i').toLowerCase().replace(/ı/g, 'i')\n      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');\n  };\n  var KEYS = {\n    kategori: 'kategori', etiket: 'etiket', yer: 'yer', konum: 'yer',\n    aciklama: 'aciklama', detay: 'detay',\n    ozellikler: 'ozellikler', ozellik: 'ozellikler',\n    foto: 'fotolar', fotolar: 'fotolar', fotograf: 'fotolar', fotograflar: 'fotolar', resim: 'fotolar',\n    gizli: 'gizli'\n  };\n  var list = function (v) { return v.split(',').map(function (x) { return x.trim(); }).filter(Boolean); };\n  /* Yalnızca http ile başlayan parçalar link sayılır (tırnak, köşeli parantez, virgül temizlenir) */\n  var links = function (v) { return v.split(/[\\s,;]+/).map(function (x) { return x.replace(/^[\"'\\[]+|[\"'\\],]+$/g, ''); }).filter(function (x) { return /^https?:\\/\\//i.test(x); }); };\n  var cards = [], c = null, last = null, gap = false;\n\n  IMG.projelerMetni.split(/\\r?\\n/).forEach(function (raw) {\n    var line = raw.trim();\n    if (!line) { gap = true; return; }\n    if (line.indexOf('//') === 0) return;\n    if (/^#{2,}/.test(line)) {\n      c = { baslik: line.replace(/^#+\\s*/, ''), kategori: '', etiket: '', yer: '', aciklama: '', detay: [], ozellikler: [], fotolar: [], gizli: false };\n      cards.push(c); last = null; gap = false;\n      return;\n    }\n    if (!c) return;\n    var m = line.match(/^([^:]{1,24}):\\s*(.*)$/);\n    var k = m && !/^https?$/i.test(m[1].trim()) ? KEYS[norm(m[1])] : null;\n    if (k) {\n      var v = m[2].trim();\n      if (k === 'fotolar') { c.fotolar = c.fotolar.concat(links(v)); last = 'fotolar'; }\n      else if (k === 'ozellikler') { c.ozellikler = c.ozellikler.concat(list(v)); last = 'ozellikler'; }\n      else if (k === 'detay') { if (v) c.detay.push(v); last = 'detay'; }\n      else if (k === 'gizli') { c.gizli = /^(evet|e|1|true|yes|var)$/i.test(v); last = null; }\n      else { c[k] = v; last = k; }\n      gap = false;\n      return;\n    }\n    /* Anahtarsız satır: link ise fotoğraf, değilse bir önceki bilginin devamı */\n    if (/https?:\\/\\//i.test(line) && !/\\s/.test(line.replace(/^\\S+\\s+(?=https?:)/i, ''))) c.fotolar = c.fotolar.concat(links(line));\n    else if (last === 'detay') { if (gap || !c.detay.length) c.detay.push(line); else c.detay[c.detay.length - 1] += ' ' + line; }\n    else if (last === 'ozellikler') c.ozellikler = c.ozellikler.concat(list(line));\n    else if (last === 'fotolar') c.fotolar = c.fotolar.concat(links(line));\n    else if (last) c[last] = (c[last] ? c[last] + (gap ? '\\n\\n' : ' ') : '') + line;\n    gap = false;\n  });\n\n  IMG.projeler = cards.filter(function (x) { return x.baslik && !x.gizli; });\n})();\n\n" + "/* ══════════════════════════════════════════\n   UYGULAMA — DOM hazır olunca", 'referans düz yazı okuyucu'],
  ["document.querySelectorAll('#ekip [style*=\"padding:1.75rem\"]')", "document.querySelectorAll('#ekip .contact-person-card')", 'team selector']
]);
patch('js/animations.js', [
  [".from('.hero-stats-inline',", ".from('.hero-chips',", 'hero stats → chips'],
  ["gsap.to('nav', { paddingTop: '0.7rem', paddingBottom: '0.7rem',\n        backgroundColor: 'rgba(18,20,23,0.94)', duration: 0.4, ease: 'power2.out' });", "/* Yeni menü sticky (akış içinde): padding değişirse sayfa zıplar — yalnızca zemin ve gölge değişir */\n      gsap.to('nav', { backgroundColor: 'rgba(14,16,18,0.97)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', duration: 0.4, ease: 'power2.out' });", 'nav onEnter'],
  ["gsap.to('nav', { paddingTop: '1.1rem', paddingBottom: '1.1rem',\n        backgroundColor: 'rgba(24,27,31,0.82)', duration: 0.4, ease: 'power2.out' });", "gsap.to('nav', { backgroundColor: 'rgba(18,20,23,0.92)', boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.4, ease: 'power2.out' });", 'nav onLeaveBack'],
  ["document.querySelectorAll('#yorumlar [style*=\"padding:1.5rem\"]')", "document.querySelectorAll('#yorumlar .rev')", 'yorum selector'],
  ["document.querySelectorAll('#ekip [style*=\"border-radius:var(--radius)\"], #ekip [style*=\"background:rgba(255,255,255,0.06)\"]')", "document.querySelectorAll('#ekip .contact-person-card')", 'team cards']
]);
console.log('OK', fs.readdirSync(OUT, { recursive: true }).join(', '));
console.log('index.html', html.length, 'home.css', css.length, 'home.js', homeJs.length);
