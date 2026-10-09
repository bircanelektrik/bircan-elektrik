/* ══════════════════════════════════════════
   images.js — Bircan Elektrik Görsel Yönetimi
   
   KULLANIM: Görseli değiştirmek için sadece
   URL'yi güncelleyin. Unsplash, kendi sunucu,
   Google Drive vb. çalışır.
   
   Format: 'https://...' veya '/images/dosya.jpg'
   ══════════════════════════════════════════ */

window.BIRCAN_IMAGES = {


  /* ── HERO ARKAPLAN ── */
  hero: '', /* Eski arka plan kaldırıldı (kablo demeti — gruplama hatası). Yeni girişte tek hat şeması var. */

  /* ── BÖLÜM ARKA PLAN GÖRSELLERİ ── */
  sections: {
    vizyon:    'https://i.ibb.co/pj99KZgy/t-o-k-i-atasehir.jpg',
    hizmetler: 'https://i.ibb.co/pj99KZgy/t-o-k-i-atasehir.jpg',
    teknik:    'https://i.ibb.co/wFKPBCZ7/Whats-App-mage-2026-07-07-at-13-18-32.jpg',
    ekip:      'https://i.ibb.co/ccXpqdZX/image.png'
    
  },

  /* ── REFERANS PROJELERİ ─────────────────────────────────────────
     Referans kartlarının TAMAMI aşağıdaki yazıdan okunur.
     Tırnak, köşeli parantez ya da virgül kuralı YOK; düz yazı gibi yazın.

     Her kart ### ile başlar, bilgiler alt alta yazılır:

       ### Kartın başlığı
       kategori: konut              (konut, ticari, endüstriyel ya da altyapı → filtre butonları)
       etiket: Konut / Topraklama
       yer: Yahyalı, Kayseri
       aciklama: Kartta görünen kısa açıklama.
       detay: "Detay" penceresinin ilk paragrafı.
       detay: İkinci paragraf. (Her paragraf için yeni bir detay: satırı)
       ozellikler: Kutucuk 1, Kutucuk 2, Kutucuk 3
       foto: https://i.ibb.co/.../1.jpg
       foto: https://i.ibb.co/.../2.jpg   (2. ve sonraki foto = kaydırılan fotoğraf dizisi)
       gizli: evet                    (kartı silmeden sitede gizler)

     • Sıra = sitede görünme sırası. Yeni kart için bir kartı kopyalayıp yapıştırın.
     • Uzun bir yazı alt satırdan devam edebilir; boş satır bırakırsanız yeni paragraf olur.
     • Fotoğraf linki i.ibb.co ile başlamalı (ibb.co'da "Doğrudan bağlantılar").
       https://ibb.co/... biçimindeki sayfa linki çalışmaz, kartta uyarı çıkar.
     • // ile başlayan satır not sayılır, sitede görünmez.
     • Tek yasak işaret: ` (ters tırnak). Bu yazının içinde kullanmayın.
     ───────────────────────────────────────────────────────────── */
  projelerMetni: `

### TOKİ 3. Etap — Ataşehir Altyapı
kategori: altyapi
etiket: Altyapı / TOKİ
yer: Ataşehir, İstanbul
aciklama: Çok katlı blok tesisatı ve trafo köşkü yerleşimi. 700 m 3×185+95 ve 1000 m 3×95+50 kablo; otopark ve çevre aydınlatması dahil.
ozellikler: Trafo köşkü, 1700 m kablo altyapısı, Çevre aydınlatması, Komple tesisat
foto: https://i.ibb.co/pj99KZgy/t-o-k-i-atasehir.jpg
foto:https://i.ibb.co/C5N1fcZp/image.png
foto:https://i.ibb.co/qLfmz2PJ/image.png
foto:https://i.ibb.co/B50VsYB4/image.png 
foto:https://i.ibb.co/rfQnt02t/image.png
foto:https://i.ibb.co/ccXpqdZX/image.png

### Tekstil Fabrikası Enerji Dengeleme
kategori: endustriyel
etiket: Endüstriyel / Analiz
yer: Yahyalı, Kayseri
aciklama: Dengesiz yük nedeniyle nötre binen fazla akım tespit edildi; üretim durmadan tek bir 16 mm² ek nötr hattıyla çözüldü.
ozellikler: Arıza tespiti, Faz dengeleme, Maliyet optimizasyonu, Sistem sürekliliği
foto: https://i.ibb.co/QF95RZCM/20250923094015-1.jpg


### Kompanzasyon Panosu Optimizasyonu
kategori: altyapi
etiket: Altyapı / Endüstriyel
yer: Ömer Emine Akın Anadolu Lisesi, Yahyalı
aciklama: Reaktif sınırı aşan kompanzasyon panosu tesisin ihtiyacına göre yeniden düzenlendi; ceza ödemeleri sona erdi.
ozellikler: Kompanzasyon, Reaktif ceza çözümü, Sistem kontrolü, Optimizasyon
foto: https://i.ibb.co/TMK6kNCP/20260410-153150.jpg


### İkinci El Araç Lifti — Sıfırdan Otomasyon
kategori: endustriyel
etiket: Endüstriyel / Otomasyon
yer: Sanayi, Kayseri
aciklama: Panosu sökülmüş ikinci el liftin kumanda devresi sıfırdan çizildi, lift tam kapasite çalışır hale getirildi.
detay: Panosu sökülmüş ikinci el liftin kumanda devresi sıfırdan çizildi; sınır anahtarları ve pano dizilimiyle tam kapasite çalışır hale getirildi.
ozellikler: Kumanda devresi, Pano dizilimi, Sınır anahtarı, Sistem devreye alma
foto: https://i.ibb.co/Mk6kWjJ0/Fotoram-io-1.jpg


### OGM Kayseri Şube — Patlayan Giriş ve Aydınlatma Besleme Kablosu Değişimi
kategori: Altyapı
etiket: Kamu / Kablo Yenileme
yer: Kayseri
aciklama: Arızalanan kapı girişi ve sokak aydınlatma hattına ait besleme kablolarında gerekli Ölçümler yapılmıştır. İlgili birimlere bilgi verilmesini müteakip, gelen talep doğrultusunda kablolar yenilenmiştir.
detay: Arızalanan kabloda yapılan testler sonucunda; L1 ve L2 fazlarında direkt faz-nötr kısa devresi, L3 fazında ise 30 mA üzerinde kaçak akım tespit edilmiştir. Durum, çözüm önerileriyle birlikte sorumlu amirlere iletilmiştir.
detay: Tercih edilen yöntem doğrultusunda; yeni kablo kesiti ile güzergahı belirlenmiş, ihtiyaca uygun kablo seçimi yapılarak ilgililere bilgi verilmiştir. Saha çalışmalarında tava montajı ve kazı işlemleri tamamlanmış; 0,50'lik kum ile yataklama ve kablo üstü kapatma işlemleri gerçekleştirilmiştir. Kablo üzerine kazı uyarı şeridi çekilmiş ve gelecekteki ihtiyaçlar için yedek borulama yapılmıştır.
detay: Tehlike levhaları ve etiketlemeleri tamamlanarak iki TMŞ arasında bağlantı sağlanmıştır. Son testleri başarıyla gerçekleştirilen kablo montajı tamamlanmış ve hat devreye alınarak teslim edilmiştir.
ozellikler: Arıza müdahalesi, Giriş kablosu, Aydınlatma beslemesi
foto: https://i.ibb.co/q3sJ3Tts/20261006-145445.jpg
foto: https://i.ibb.co/R4zrhxYQ/IMG-20261005-WA0009.jpg
foto: https://i.ibb.co/BVHcYLjJ/20261005-151410.jpg


### Fen Lisesi Kütüphanesi Dekoratif Aydınlatma
kategori: ticari
etiket: Ticari / Eğitim
yer: Kayseri
aciklama: Kütüphane elektrik tadilatı ve baffle tavanla entegre dekoratif aydınlatma.
ozellikler: Baffle tavan, Dekoratif aydınlatma, Elektrik tadilatı, Verimli dağılım
foto: https://i.ibb.co/XZJSn8Fq/20251128-165753.png
foto: https://i.ibb.co/PZyB7YkJ/20260819-123316.jpg


### Grobeton Altı ve Temel Topraklama Uygulamaları
kategori: konut
etiket: Konut / Topraklama
yer: Yahyalı, Kayseri
aciklama: Grobeton altı ve temel topraklama sistemlerinin projelendirilmesi ve uygulanması.
detay: Yapılarda elektriksel güvenliği sağlamak amacıyla grobeton altı topraklama ve temel topraklama sistemlerinin projelendirilmesi ve uygulanması.
ozellikler: Grobeton altı topraklama, Temel topraklama, Eşpotansiyel dengeleme, Elektriksel güvenlik
foto: https://i.ibb.co/bc1KHBn/Whats-App-mage-2026-07-07-at-13-18-35.jpg
foto: https://i.ibb.co/wFKPBCZ7/Whats-App-mage-2026-07-07-at-13-18-32.jpg
foto: https://i.ibb.co/p6LvvHfH/Whats-App-mage-2026-07-07-at-13-18-33-2.jpg


### Gerilim Koruma Rölesi Montajı
kategori: konut
etiket: Konut / Güvenlik
yer: Yahyalı, Kayseri
aciklama: Şebekedeki gerilim dalgalanmalarına ve faz-nötr arızalarına karşı cihazları koruyan gerilim koruma rölesi montajı.
detay: Elektrik şebekesinde her zaman sizin kontrolünüz dışında gelişebilecek durumlar yaşanabilir. Faz-nötr dengesizliği, nötr kopması, faz kopması, trafoda meydana gelebilecek arızalar, ani gerilim yükselmeleri veya düşük voltaj gibi sorunlar; klima, kombi, buzdolabı, televizyon, bilgisayar ve diğer elektronik cihazlarda ciddi hasarlara neden olabilir.
detay: Gerilim koruma rölesi, şebekeyi sürekli izleyerek güvenli olmayan gerilim değerlerini algılar ve tehlike anında enerjiyi otomatik olarak keser. Şebeke normale döndüğünde ise ayarlanan süre sonunda enerjiyi tekrar devreye alır. Böylece cihazlarınızı olası elektrik kaynaklı arızalara karşı korumaya yardımcı olur.
ozellikler: Gerilim Koruma Rölesi Neden Şart, Gerilim kontrolü, Mal güvenliği, Tesisat revizyonu
foto: https://i.ibb.co/DHDzyjFq/20260731-175330.jpg
foto: https://i.ibb.co/965XGQX/20260806-012733.jpg


### Kumsmall & Sivas Caddesi Mağaza Çözümleri
kategori: ticari
etiket: Ticari / Mağaza
yer: Kayseri Merkez
aciklama: Profilo ve Ergül Mobilya mağazalarında aydınlatma altyapısı ve uzaktan kumanda sistemleri; periyodik servis ve bakım sürüyor.
ozellikler: Aydınlatma altyapısı, Uzaktan kumanda, Servis & bakım, Tadilat
foto: https://i.ibb.co/5gMwk22S/image-Picsart-Ai-mage-Enhancer.png
foto: https://i.ibb.co/TqvD5Nzy/20260821-121931.jpg
foto: https://i.ibb.co/LX25BzgC/20260820-114036.jpg
foto: https://i.ibb.co/whtzrTDR/20260821-121936.jpg


### Sahadan Referanslar
kategori: Elekrik
etiket: Aydınlatma Dekorasyon Güvenlik
yer: Kayseri
aciklama: Aydınlatma Dekorasyon Güvenlik alanında yaptığımız çalışmalar
ozellikler: Dekoratif aydınlatma, Sağlık tesisatı, Modern tasarım, Konforlu atmosfer
foto: https://i.ibb.co/TqvD5Nzy/20260821-121931.jpg
foto: https://i.ibb.co/LD7fwDcB/20260123-184047.jpg
foto:https://i.ibb.co/QF0nP8pM/20260708-115454.jpg
foto:https://i.ibb.co/Z1wVLVJG/20251115-130726.jpg
foto:https://i.ibb.co/NMx0F4k/20260123-184035.jpg


### Yahyalı TOKİ Saha Altyapı & Vinç Beslemesi
kategori: konut
etiket: Konut / TOKİ
yer: Yahyalı, Kayseri
aciklama: Saha elektrik altyapısı, vinç beslemesi ve bağlantı aboneleri; uygulama projesi ve süreç takibi dahil.
ozellikler: Vinç beslemesi, Saha altyapısı, Bağlantı abonesi, Süreç takibi
foto: https://i.ibb.co/7N0KDCmZ/MG-20251124-WA0011.jpg


### Otomatik Garaj Kapısı Motor Değişimi
kategori: konut
etiket: Konut / Otomasyon
yer: Yahyalı, Kayseri
aciklama: Arızalı otomatik garaj kapısı motorunun değişimi, bağlantıları ve güvenlik testleri.
detay: Otomatik garaj kapılarında arızalı veya işlevini yitirmiş motorların sökülerek uygun yeni motor sistemiyle değiştirilmesi, elektrik bağlantılarının yapılması ve sistemin güvenli çalışmasının test edilmesi.
ozellikler: Garaj kapısı motoru, Motor değişimi, Elektrik bağlantıları, Otomatik kapı sistemleri, Fonksiyon ve güvenlik testleri
foto: https://i.ibb.co/mC0X0FFX/20260921-113451.jpg

`,

  /* ── EKİP ── */
  team: {
    cuma:  '', // örn: '/images/cuma-bircan.jpg'
    burak: ''  // örn: '/images/burak-bircan.jpg'
  }

};

/* ══════════════════════════════════════════
   REFERANSLAR: projelerMetni (düz yazı) → projeler listesi
   Yazım hatası siteyi bozmasın diye satır satır, hoşgörülü okunur.
   ══════════════════════════════════════════ */
(function () {
  var IMG = window.BIRCAN_IMAGES;
  if (!IMG || typeof IMG.projelerMetni !== 'string') return;
  var norm = function (s) {
    return String(s || '').replace(/İ/g, 'i').toLowerCase().replace(/ı/g, 'i')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  };
  var KEYS = {
    kategori: 'kategori', etiket: 'etiket', yer: 'yer', konum: 'yer',
    aciklama: 'aciklama', detay: 'detay',
    ozellikler: 'ozellikler', ozellik: 'ozellikler',
    foto: 'fotolar', fotolar: 'fotolar', fotograf: 'fotolar', fotograflar: 'fotolar', resim: 'fotolar',
    gizli: 'gizli'
  };
  var list = function (v) { return v.split(',').map(function (x) { return x.trim(); }).filter(Boolean); };
  /* Yalnızca http ile başlayan parçalar link sayılır (tırnak, köşeli parantez, virgül temizlenir) */
  var links = function (v) { return v.split(/[\s,;]+/).map(function (x) { return x.replace(/^["'\[]+|["'\],]+$/g, ''); }).filter(function (x) { return /^https?:\/\//i.test(x); }); };
  var cards = [], c = null, last = null, gap = false;

  IMG.projelerMetni.split(/\r?\n/).forEach(function (raw) {
    var line = raw.trim();
    if (!line) { gap = true; return; }
    if (line.indexOf('//') === 0) return;
    if (/^#{2,}/.test(line)) {
      c = { baslik: line.replace(/^#+\s*/, ''), kategori: '', etiket: '', yer: '', aciklama: '', detay: [], ozellikler: [], fotolar: [], gizli: false };
      cards.push(c); last = null; gap = false;
      return;
    }
    if (!c) return;
    var m = line.match(/^([^:]{1,24}):\s*(.*)$/);
    var k = m && !/^https?$/i.test(m[1].trim()) ? KEYS[norm(m[1])] : null;
    if (k) {
      var v = m[2].trim();
      if (k === 'fotolar') { c.fotolar = c.fotolar.concat(links(v)); last = 'fotolar'; }
      else if (k === 'ozellikler') { c.ozellikler = c.ozellikler.concat(list(v)); last = 'ozellikler'; }
      else if (k === 'detay') { if (v) c.detay.push(v); last = 'detay'; }
      else if (k === 'gizli') { c.gizli = /^(evet|e|1|true|yes|var)$/i.test(v); last = null; }
      else { c[k] = v; last = k; }
      gap = false;
      return;
    }
    /* Anahtarsız satır: link ise fotoğraf, değilse bir önceki bilginin devamı */
    if (/https?:\/\//i.test(line) && !/\s/.test(line.replace(/^\S+\s+(?=https?:)/i, ''))) c.fotolar = c.fotolar.concat(links(line));
    else if (last === 'detay') { if (gap || !c.detay.length) c.detay.push(line); else c.detay[c.detay.length - 1] += ' ' + line; }
    else if (last === 'ozellikler') c.ozellikler = c.ozellikler.concat(list(line));
    else if (last === 'fotolar') c.fotolar = c.fotolar.concat(links(line));
    else if (last) c[last] = (c[last] ? c[last] + (gap ? '\n\n' : ' ') : '') + line;
    gap = false;
  });

  IMG.projeler = cards.filter(function (x) { return x.baslik && !x.gizli; });
})();

/* ══════════════════════════════════════════
   UYGULAMA — DOM hazır olunca görselleri yerleştir
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  var IMG = window.BIRCAN_IMAGES;
  /* Kart başlığı → fotoğraf listesi (projeler listesinden) */
  var projectImageMap = {};
  var projectBySlug = {};
  (IMG.projeler || []).forEach(function (p) { if (p && p.baslik) { projectImageMap[slugifyProjectTitle(p.baslik)] = p.fotolar || []; projectBySlug[slugifyProjectTitle(p.baslik)] = p; } });

  function slugifyProjectTitle(text) {
    return (text || '')
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /* ── Fotoğraf dizisi (kartta ve detay penceresinde ortak) ──
     urls: fotoğraf linkleri · label: erişilebilir ad · fit: alan ilk fotoğrafın oranını alsın mı
     Açılmayan link ya da i.ibb.co'nun "image not found" kutusu (180×180) kendiliğinden çıkarılır. */
  function buildGallery(urls, label, fit) {
    var wrap = document.createElement('div');
    wrap.className = 'ref-img-wrap';
    /* img-gsap-wrap: animations.js fotoğrafları ikinci kez sarmasın */
    var track = document.createElement('div');
    track.className = 'rc-track img-gsap-wrap';
    wrap.appendChild(track);
    var imgs = urls.map(function (u) {
      var img = document.createElement('img');
      img.src = u;
      img.alt = label;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      track.appendChild(img);
      return img;
    });

    var count, dots, prev, next, cur = 0, ctrl = false;
    var total = function () { return imgs.length; };
    var show = function (k) {
      k = Math.max(0, Math.min(total() - 1, k));
      cur = k;
      if (!ctrl) return;
      count.textContent = (k + 1) + '/' + total();
      Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('is-on', j === k); });
      prev.disabled = k === 0;
      next.disabled = k === total() - 1;
    };
    var go = function (k) {
      k = Math.max(0, Math.min(total() - 1, k));
      track.scrollTo({ left: k * track.clientWidth, behavior: 'smooth' });
    };
    var controlsOn = function () {
      if (ctrl) return;
      ctrl = true;
      wrap.classList.add('ref-carousel');
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-roledescription', 'fotoğraf dizisi');
      wrap.setAttribute('aria-label', label);
      count = document.createElement('span'); count.className = 'rc-count';
      dots = document.createElement('div'); dots.className = 'rc-dots'; dots.setAttribute('aria-hidden', 'true');
      prev = document.createElement('button');
      prev.type = 'button'; prev.className = 'rc-btn rc-prev'; prev.setAttribute('aria-label', 'Önceki fotoğraf'); prev.innerHTML = '&#8249;';
      next = document.createElement('button');
      next.type = 'button'; next.className = 'rc-btn rc-next'; next.setAttribute('aria-label', 'Sonraki fotoğraf'); next.innerHTML = '&#8250;';
      prev.addEventListener('click', function () { go(cur - 1); });
      next.addEventListener('click', function () { go(cur + 1); });
      wrap.appendChild(count); wrap.appendChild(dots); wrap.appendChild(prev); wrap.appendChild(next);
    };
    var controlsOff = function () {
      if (!ctrl) return;
      ctrl = false;
      [count, dots, prev, next].forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });
      wrap.classList.remove('ref-carousel');
      wrap.removeAttribute('role'); wrap.removeAttribute('aria-roledescription'); wrap.removeAttribute('aria-label');
    };
    var sync = function () {
      if (total() > 1) {
        controlsOn();
        dots.innerHTML = '';
        imgs.forEach(function () { var d = document.createElement('span'); d.className = 'rc-dot'; dots.appendChild(d); });
      } else controlsOff();
      imgs.forEach(function (im, k) { im.alt = label + (total() > 1 ? ' — fotoğraf ' + (k + 1) + '/' + total() : ''); });
      show(Math.min(cur, Math.max(0, total() - 1)));
    };

    /* Alan, ilk fotoğrafın en-boy oranını alır (en dikey 4:5, en yatay 16:9);
       diğer fotoğraflar kesilmeden alana sığdırılır */
    var doFit = function () {
      if (!fit || !imgs.length) return;
      var im = imgs[0];
      if (!im.naturalWidth || !im.naturalHeight) return;
      var r = Math.max(0.8, Math.min(1.78, im.naturalWidth / im.naturalHeight));
      wrap.style.aspectRatio = r.toFixed(3);
      if (typeof ScrollTrigger !== 'undefined') {
        clearTimeout(window.__refFitT);
        window.__refFitT = setTimeout(function () { ScrollTrigger.refresh(); }, 250);
      }
    };
    var drop = function (im) {
      var i = imgs.indexOf(im);
      if (i < 0) return;
      imgs.splice(i, 1);
      if (im.parentNode) im.parentNode.removeChild(im);
      if (window.console) console.warn('Referans "' + label + '": açılmayan fotoğraf gizlendi →', im.src);
      if (!imgs.length) { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); return; }
      sync();
      if (i === 0) doFit();
    };
    var check = function (im) {
      if (im.naturalWidth === 180 && im.naturalHeight === 180) drop(im); /* i.ibb.co "image not found" */
      else if (imgs[0] === im) doFit();
    };
    imgs.slice().forEach(function (im) {
      im.addEventListener('error', function () { drop(im); });
      if (im.complete && im.naturalWidth) check(im);
      else im.addEventListener('load', function () { check(im); });
    });

    track.addEventListener('scroll', function () {
      if (track.clientWidth) show(Math.round(track.scrollLeft / track.clientWidth));
    }, { passive: true });
    wrap.addEventListener('keydown', function (e) {
      if (!ctrl) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    });
    sync();
    return { wrap: wrap, imgs: imgs, many: urls.length > 1 };
  }

  /* Fotoğraf linklerini temizle: "link1,link2" yazımını ayırır, ibb.co sayfa linklerini ayıklar */
  function cleanUrls(list) {
    var urls = [];
    (Array.isArray(list) ? list : [list]).forEach(function (u) {
      String(u || '').split(/[\s,;]+/).forEach(function (x) { if (x) urls.push(x); });
    });
    var isPage = function (u) { return /^https?:\/\/(www\.)?ibb\.co\//i.test(u); };
    return { ok: urls.filter(function (u) { return !isPage(u); }), bad: urls.filter(isPage) };
  }

  /* ── Referans detay penceresi ── */
  var rdLast = null;
  function closeRefDetail() {
    var o = document.getElementById('ref-dialog');
    if (!o || o.hidden) return;
    o.hidden = true;
    document.body.style.overflow = '';
    if (rdLast && rdLast.focus) rdLast.focus();
  }
  function openRefDetail(p, titleText, opener) {
    var o = document.getElementById('ref-dialog');
    if (!o) {
      o = document.createElement('div');
      o.id = 'ref-dialog';
      o.className = 'rd-overlay';
      o.hidden = true;
      o.innerHTML = '<div class="rd-box" role="dialog" aria-modal="true" aria-labelledby="rd-title"></div>';
      o.addEventListener('click', function (e) { if (e.target === o) closeRefDetail(); });
      document.addEventListener('keydown', function (e) {
        if (o.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); closeRefDetail(); }
        if (e.key === 'Tab') {
          /* Odak pencerenin içinde kalsın (yalnızca görünür butonlar arasında dolaş) */
          var f = Array.prototype.filter.call(o.querySelectorAll('button:not([disabled]), a[href]'), function (el) {
            return el.offsetWidth > 0 && getComputedStyle(el).visibility !== 'hidden';
          });
          if (!f.length) return;
          var i = f.indexOf(document.activeElement);
          e.preventDefault();
          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      });
      document.body.appendChild(o);
    }
    var box = o.querySelector('.rd-box');
    box.innerHTML = '';
    var close = document.createElement('button');
    close.type = 'button'; close.className = 'rd-close'; close.setAttribute('aria-label', 'Kapat'); close.innerHTML = '&#10005;';
    close.addEventListener('click', closeRefDetail);
    box.appendChild(close);

    var urls = cleanUrls(p.fotolar).ok;
    if (urls.length) box.appendChild(buildGallery(urls, titleText, false).wrap);

    var body = document.createElement('div');
    body.className = 'rd-body';
    var h = document.createElement('h3'); h.id = 'rd-title'; h.className = 'rd-title'; h.textContent = p.baslik || titleText;
    body.appendChild(h);
    var metaTxt = [p.etiket, p.yer ? '📍 ' + p.yer : ''].filter(Boolean).join('  ·  ');
    if (metaTxt) { var m = document.createElement('div'); m.className = 'rd-meta'; m.textContent = metaTxt; body.appendChild(m); }
    /* detay: ["1. paragraf", "2. paragraf"] ya da tek yazı; boşsa kısa açıklama */
    var dt = Array.isArray(p.detay) ? p.detay.filter(Boolean).join('\n\n') : String(p.detay || '');
    var txt = dt.replace(/\\n/g, '\n').trim() || p.aciklama || '';
    if (txt) { var t = document.createElement('p'); t.className = 'rd-text'; t.textContent = txt; body.appendChild(t); }
    if (p.ozellikler && p.ozellikler.length) {
      var s = document.createElement('div'); s.className = 'rd-specs';
      p.ozellikler.forEach(function (x) { var sp = document.createElement('span'); sp.textContent = x; s.appendChild(sp); });
      body.appendChild(s);
    }
    box.appendChild(body);

    rdLast = opener || null;
    o.hidden = false;
    box.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  /* ── REFERANS PROJELERİ ── */
  /* bircan.js renderRef()'i çağırdıktan sonra çalıştır */
  function applyProjectImages() {
    var cards = document.querySelectorAll('.ref-card');
    if (!cards.length) return;
    var changed = false;

    cards.forEach(function (card, i) {
      /* Kaçıncı projeyi gösterdiğini title'dan bul */
      var title = card.querySelector('.ref-title');
      if (!title) return;

      /* Görsel wrapper zaten varsa atla */
      if (card.querySelector('.ref-img-wrap')) return;

      /* Kart başlığına göre proje bilgisi ve fotoğraflar (images.js → projeler) */
      var proje = projectBySlug[slugifyProjectTitle(title.textContent)] || { fotolar: projectImageMap[slugifyProjectTitle(title.textContent)] };

      /* Detay butonu → küçük açıklama penceresi */
      if (!card.querySelector('.ref-more')) {
        var more = document.createElement('button');
        more.type = 'button';
        more.className = 'ref-more';
        more.setAttribute('aria-haspopup', 'dialog');
        more.textContent = 'Detay';
        more.addEventListener('click', function () { openRefDetail(proje, title.textContent, more); });
        (card.querySelector('.ref-card-body') || card).appendChild(more);
      }

      var cu = cleanUrls(proje.fotolar);
      var urls = cu.ok, bad = cu.bad;
      if (bad.length && window.console) console.warn('Referans "' + title.textContent + '": i.ibb.co doğrudan linki gerekli, sayfa linki yazılmış:', bad);
      if (!urls.length) {
        if (!bad.length) return;
        var warn = document.createElement('div');
        warn.className = 'ref-img-wrap ref-img-bad';
        warn.textContent = 'Fotoğraf linki hatalı: i.ibb.co ile başlayan doğrudan link gerekli';
        card.insertBefore(warn, card.firstChild);
        changed = true;
        return;
      }

      var g = buildGallery(urls, title.textContent, true);
      var wrap = g.wrap, imgs = g.imgs, many = g.many;
      card.insertBefore(wrap, card.firstChild);
      changed = true;

      /* GSAP varsa siyah-beyaz → renk efekti (dizide büyütme yok, yan fotoğraf görünmesin) */
      if (typeof gsap !== 'undefined') {
        gsap.set(imgs, { filter: 'grayscale(100%) brightness(0.55)', scale: 1 });
        wrap.addEventListener('mouseenter', function () {
          gsap.to(imgs, { filter: 'grayscale(0%) brightness(0.88)', scale: many ? 1 : 1.05, duration: 1.2, ease: 'power3.out' });
        });
        wrap.addEventListener('mouseleave', function () {
          gsap.to(imgs, { filter: 'grayscale(100%) brightness(0.55)', scale: 1, duration: 1.5, ease: 'power3.out' });
        });
      }
    });

    if (changed && typeof ScrollTrigger !== 'undefined') {
      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });
    }
  }

  /* Referanslar yeniden render edildiğinde görselleri anında tekrar ekle */
  if (typeof window.renderRef === 'function') {
    var originalRenderRef = window.renderRef;
    window.renderRef = function () {
      originalRenderRef.apply(this, arguments);
      applyProjectImages();
    };
  }

  /* İlk render için gecikmesiz uygula */
  applyProjectImages();

  /* ── EKİP GÖRSELLERİ ── */
  if (IMG.team.cuma || IMG.team.burak) {
    var teamCards = document.querySelectorAll('#ekip .contact-person-card');
    var keys = ['cuma', 'burak'];
    teamCards.forEach(function (card, i) {
      var key = keys[i];
      if (!key || !IMG.team[key]) return;
      if (card.querySelector('.team-img-wrap')) return;

      var wrap = document.createElement('div');
      wrap.className = 'team-img-wrap img-gsap-wrap';
      wrap.style.cssText = 'width:100%;height:220px;overflow:hidden;display:block;margin-bottom:1.5rem;';

      var img = document.createElement('img');
      img.src = IMG.team[key];
      img.alt = key === 'cuma' ? 'Cuma Bircan' : 'Burak Bircan';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

      wrap.appendChild(img);
      card.insertBefore(wrap, card.firstChild);

      if (typeof gsap !== 'undefined') {
        gsap.set(img, { filter: 'grayscale(100%) brightness(0.55)' });
        wrap.addEventListener('mouseenter', function () {
          gsap.to(img, { filter: 'grayscale(0%) brightness(0.85)', duration: 1.2, ease: 'power3.out' });
        });
        wrap.addEventListener('mouseleave', function () {
          gsap.to(img, { filter: 'grayscale(100%) brightness(0.55)', duration: 1.5, ease: 'power3.out' });
        });
      }
    });
  }

  /* ── BÖLÜM ARKA PLAN GÖRSELLERİ ── */
  var sectionBgMap = {
    'vizyon':    IMG.sections && IMG.sections.vizyon,
    'hizmetler': IMG.sections && IMG.sections.hizmetler,
    'teknik':    IMG.sections && IMG.sections.teknik,
    'ekip':      IMG.sections && IMG.sections.ekip
  };

  Object.keys(sectionBgMap).forEach(function(id) {
    var url = sectionBgMap[id];
    if (!url) return;
    var el = document.getElementById(id);
    if (!el) return;

    /* Section'a relative position ver */
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    /* Arka plan görsel katmanı */
    var bg = document.createElement('div');
    bg.className = 'section-bg';
    bg.style.cssText = [
      'position:absolute', 'inset:0', 'z-index:0',
      'background-image:url(' + url + ')',
      'background-size:cover',
      'background-position:center',
      /* Çok koyu — sadece atmosfer, okunabilirlik bozulmasın */
      'filter:brightness(0.06) saturate(0.3)',
      'pointer-events:none',
      'transition:filter 0.8s ease'
    ].join(';');
    el.insertBefore(bg, el.firstChild);

    /* Section içeriğini üste al */
    Array.from(el.children).forEach(function(child) {
      if (child !== bg) {
        child.style.position = 'relative';
        child.style.zIndex = '1';
      }
    });

    /* Scroll ile hafif parallax */
    if (typeof gsap !== 'undefined') {
      gsap.to(bg, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  });

  /* ── HERO ARKAPLAN GÖRSELİ ── */
  if (IMG.hero) {
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
      var heroBg = document.createElement('div');
      heroBg.style.cssText = [
        'position:absolute', 'inset:0', 'z-index:0',
        'background-image:url(' + IMG.hero + ')',
        'background-size:cover', 'background-position:center',
        'filter:brightness(0.26) saturate(0.55) contrast(0.96)',
        'opacity:0.78',
        'pointer-events:none'
      ].join(';');
      heroEl.insertBefore(heroBg, heroEl.firstChild);
    }
  }

});

/* ══════════════════════════════════════════
   GOOGLE MAPS / GOOGLE İŞLETMEM GÖRSELLERİ

   1. Google İşletmem'e gir (business.google.com)
   2. Sol menü → Fotoğraflar
   3. Görsele sağ tık → "Resim adresini kopyala"
   4. Kopyaladığın URL'yi yukarıdaki projeler listesinde ilgili kartın fotolar: [ ] kısmına yapıştır

   ÖNEMLİ: Google Maps görselleri zaman zaman
   erişim kısıtlayabilir. Güvenilir yöntemler:
   • Görseli bilgisayara indir → sunucuna yükle → /images/proje.jpg
   • Cloudinary veya imgbb.com'a yükle (ücretsiz CDN)
   • Google Drive'a yükle → "Herkese açık" yap → doğrudan link al

   DRIVE LINK FORMAT:
   https://drive.google.com/file/d/DOSYA_ID/view
   → https://lh3.googleusercontent.com/d/DOSYA_ID şeklinde kullan
   ══════════════════════════════════════════ */
