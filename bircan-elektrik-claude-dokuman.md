# Bircan Elektrik — Claude Teknik Yol Haritası
**Son Güncelleme:** 28 Mart 2026  
**Site:** bircanelektrik.com.tr  
**Repo:** bircanelektrik/bircan-elektrik  
**Cloudflare Worker:** https://yakit-proxy.bircannelektrik.workers.dev

---

## DOSYA HARİTASI

```
bircan-elektrik/
├── index.html       → Tüm HTML yapısı (904 satır)
├── style.css        → Tüm stiller (489 satır)
├── bircan.js        → Tüm JavaScript (551 satır)
├── sitemap.xml      → SEO sitemap (7 URL)
└── netlify.toml     → Netlify config (functions artık kullanılmıyor)
```

**ÖNEMLİ:** `index.html` Cloudflare'in email obfuscation sistemi nedeniyle
upload edildiğinde `</footer></body></html>` kapanış tagları kesilmiş görünür.
Gerçek sitede dosya tamdır. Paniklemeden, sadece upload artefaktıdır.

---

## MİMARİ ÖZET

### index.html — Section Sırası
1. `<nav>` — Sabit üst nav, scroll'da aktif link highlight (9 link: Vizyon, Hizmetler, Rehber, Teknik, Yorumlar, Hizmet Alanı, Referanslar, Teklif Al, İletişim)
2. `<section class="hero">` — İki sütun grid, sol: başlık+stat, sağ: butonlar+Instagram
3. `#vizyon` — Siyah arka plan, 4 pillar grid
4. `#hizmetler` — 8 servis kartı, tıklanınca detay kutusu açılır (JS)
5. `#rehber` — Filtreli rehber kartları (JS render eder, 10 kart)
6. `#teknik` — Accordion + Tab yapısı (2 kategori: Aydınlatma, Şalt)
7. `#yorumlar` — Statik Google yorum kartları (8 yorum)
8. `#hizmet-alani` — Leaflet harita (hizmet bölgesi) + Yol maliyeti hesaplayıcı (OSRM rota)
9. `#referanslar` — **YENİ** — Filtreli referans proje galerisi (JS render, 10 proje)
10. `#teklif` — **YENİ** — Teklif formu (WhatsApp'a yönlendirme, sunucuya veri gönderilmez)
11. `#ekip` — Ekip kartları (Cuma Bircan, Burak Bircan)
12. `<footer>` — Telif + email

### bircan.js — Modül Sırası
| Satır | Modül | Ne Yapar |
|-------|-------|----------|
| 1–14 | ACCORDION | `toggleCat()` — Teknik Rehber accordion |
| 16–27 | TAB | `showTab()` — Accordion içi tab geçişi |
| 29–68 | KELVIN | Kelvin seçici slider (drag + touch) |
| 70–85 | LUMEN | Lümen hesaplayıcı |
| 87–121 | MCB + RCD | MCB/RCD hesaplayıcı |
| 123–143 | GERİLİM DÜŞÜMÜ | Gerilim düşümü hesaplayıcı |
| 145–175 | REHBER | `rehberData[]` (10 kart) + render/filtre |
| 177–180 | POPUP | Telefon popup |
| 182–193 | SERVICES | `services[]` (8 kart) — servis kartı detayları |
| 195–199 | NAV SCROLL | Scroll'da nav link aktif highlight |
| 206–215 | SABİTLER | Yakıt/maliyet sabitleri (SFUEL, SCONS, SBASE...) |
| 217–240 | YAKIT API | `getFuelPrice()` — Cloudflare Worker fetch + localStorage 24h cache |
| 242–270 | ROTA | `getRouteDistance()` — OSRM → ORS → hvFallback zinciri |
| 274–278 | HAVERSINE | `haversineKm()` — Kuş uçuşu mesafe (fallback) |
| 280–284 | KM→FİYAT | `kmToFiyat()` — Maliyet formülü: SBASE + (2×km×kmMaliyet) |
| 286–307 | HARİTA YARDIMCI | `leafletTile()`, `mkIcon()`, `initHizmetHarita()` |
| 309–375 | ÜCRET HARİTASI | `initUcretHarita()` — Tıkla→rota hesapla→polyline çiz→fiyat göster |
| 376–420 | SHOW ÜCRET | `showUcret()` — Detaylı maliyet sonuç paneli |
| 422–457 | REFERANS | **YENİ** — `refData[]` (10 proje) + `filterRef()` + `renderRef()` |
| 459–502 | TEKLİF | **YENİ** — `submitTeklif()` — Form → WhatsApp mesajı |
| 504–540 | DOMContentLoaded | Event listener bağlamaları |
| 542–551 | window.onload | Harita başlatma (KRİTİK: DOMContentLoaded değil) |

### style.css — Bölüm Sırası
1. Reset & CSS tokens
2. Body + grid arka plan
3. Nav
4. Hero
5. Instagram section
6. Section divider
7. Vizyon
8. Hizmetler
9. Rehber
10. Ekip
11. İletişim
12. Footer
13. Popup animasyonları
14. Teknik Rehber (accordion, tab, lumen, kelvin, armatür)
15. Hizmet Alanı + Servis ücreti
16. **YENİ** — Referanslar (`.ref-grid`, `.ref-card`, `.ref-spec`)
17. **YENİ** — Teklif Formu (`.teklif-wrapper`, `.teklif-input`, `.teklif-btn`)
18. Mobile `@media (max-width: 768px)` — tüm section'lar dahil

### SEO — head bölümü
- `<meta name="description">` — Anahtar kelimeli açıklama
- `<meta name="keywords">` — Hedef anahtar kelimeler
- `<meta name="robots">` — index, follow
- `<link rel="canonical">` — bircanelektrik.com.tr
- `<link rel="preconnect">` — Google Fonts
- OpenGraph: type, title, description, url, image, locale
- Twitter Card: summary_large_image
- Schema.org JSON-LD: ElectricalContractor + geo + openingHours + hasOfferCatalog (5 hizmet) + sameAs + priceRange

---

## KRİTİK KURALLAR — DEĞİŞİKLİK YAPARKEN

### 1. bircan.js'e dokunurken

**Harita:** Harita başlatma mutlaka `window.addEventListener('load', ...)` içinde
olmalı. `DOMContentLoaded` kullanma — Leaflet CSS yüklenmiş olmayabilir.

```javascript
// ✅ DOĞRU
window.addEventListener('load', function() {
  if (typeof L === 'undefined') return;
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      initHizmetHarita();
      initUcretHarita();
    });
  });
});
```

**Yakıt API:** `https://yakit-proxy.bircannelektrik.workers.dev` adresine dokunma.
Cloudflare Worker çalışıyor. Sabitleri değiştirmek istersen:
```javascript
var SFUEL = 73;      // Varsayılan motorin fiyatı (TL/lt)
var SCONS = 9;       // Araç yakıt tüketimi (L/100km)
var SBASE = 350;     // Taban servis ücreti (TL)
var SDMAX = 55;      // Maksimum hizmet mesafesi (km)
var SPMAX = 5000;    // Maksimum servis ücreti tavanı (TL)
var SLABOR = 1500;   // İşçilik ücreti (TL/saat)
var SKMR = 8;        // Km başı amortisman (TL/km)
```

**Maliyet formülü:**
```
kmMaliyet = (fuelPrice × SCONS) / 100 + SKMR
toplam = SBASE + (2 × km × kmMaliyet)
sonuç = round(min(max(toplam, 500), SPMAX) / 50) × 50
```

**Yeni rehber kartı eklemek:**
`rehberData[]` dizisine şu yapıda nesne ekle:
```javascript
{
  cat: 'saha',           // saha | ariza | aydinlatma | proje | temel
  icon: '🔧',
  iconClass: '',         // '' | 'gold' | 'dark'
  meta: 'Saha Uygulaması',
  title: 'Kart Başlığı',
  audience: '👷 Usta & Teknisyen',
  audienceBg: '#f0f0f0',
  audienceColor: '#333',
  desc: 'Kısa açıklama.',
  steps: ['Adım 1', 'Adım 2'],
  tip: 'İpucu metni veya null',
  warn: 'Uyarı metni veya null'
}
```

**Yeni referans projesi eklemek:**
`refData[]` dizisine şu yapıda nesne ekle:
```javascript
{
  cat: 'konut',          // konut | ticari | endustriyel | altyapi
  tag: 'Konut',
  title: 'Proje Adı',
  loc: '📍 Şehir, İl',
  desc: 'Proje açıklaması.',
  specs: ['Spec 1', 'Spec 2', 'Spec 3']
}
```

**Yeni servis kartı eklemek:**
`services[]` dizisine ekle, `index.html`'de de `#grid` içine `.svc-card` div ekle.
Sıra önemli — JS index'e göre eşleşiyor.

### 2. style.css'e dokunurken

**Asla dokunma:**
- `.kelvin-track` background gradyanı (manuel hesaplanmış renk sırası)
- `.cat-panel.open` ve `.tab-panel.active` display logic'i
- `body::before` grid arka plan

**Güvenli değiştirilebilir:**
- `--gold: #b8963e` → Marka rengi
- `--radius: 12px` → Köşe yarıçapı
- Section padding'ler (`5rem 4rem` = masaüstü standart)

**Yeni section eklersen** mutlaka mobile media query'e de ekle:
```css
@media (max-width: 768px) {
  #yeni-section { padding: 3rem 1.5rem; }
}
```

**Mobile'da grid varsa** `repeat(N, 1fr)` sabit sütun kullanma,
`repeat(auto-fill, minmax(X, 1fr))` kullan.

### 3. index.html'e dokunurken

**Section ekleme şablonu:**
```html
<div class="section-divider"><hr><span>Bölüm Adı</span><hr></div>
<section id="yeni-section">
  <h2>Başlık</h2>
  <p>Alt başlık</p>
  <!-- içerik -->
</section>
```

**Tekrar section-divider ekleme!** Geçmişte iki kez yazıldı. Dikkat et.

**Email adresleri:** Cloudflare obfuscation yapıyor. bircan.js'teki email fix kodu
bunları otomatik düzeltiyor.

---

## BİLİNEN SORUNLAR (AÇIK)

### 🔴 Harita rota polyline birikme sorunu
**Durum:** initUcretHarita'da her tıklamada OSRM rota polyline'ı çiziliyor ama
async fetch tamamlanmadan yeni tıklama yapılırsa eski `routeLayer` referansı
kaybolabiliyor ve eski çizgiler haritada kalıyor.
**Çözüm:** `routeLayer`'ı array olarak tut veya fetch öncesinde tüm polyline
layer'ları temizle:
```javascript
// map.on('click') handler'ının başına ekle:
map.eachLayer(function(layer) {
  if (layer instanceof L.GeoJSON) map.removeLayer(layer);
});
```
**Öncelik:** Orta — Fonksiyonel sorun değil, görsel.

---

## BOZUK GÖRÜNEN AMA BOZUK OLMAYAN ŞEYLER

| Durum | Gerçek Sebep | Yapılacak |
|-------|-------------|-----------|
| index.html `</footer>` yok gibi görünür | Cloudflare upload artefaktı | Asıl dosyada tam, dokunma |
| Email adresleri `[email protected]` | Cloudflare obfuscation | bircan.js otomatik düzeltiyor |
| Yakıt fiyatı "varsayılan" görünüyor | API zaman aşımı veya 24h cache | Normaldir, Worker çalışıyor |
| Harita boş başlıyor | Leaflet doğal davranış | `window.load` çağrısı çözüyor |

---

## YAPILACAKLAR LİSTESİ (öncelik sırasıyla)

### ✅ Tamamlandı
- Cloudflare Worker kurulumu (`yakit-proxy.bircannelektrik.workers.dev`)
- CollectAPI entegrasyonu (Kayseri motorin + benzin95)
- localStorage 24 saatlik cache
- OSRM → ORS → hvFallback rota zinciri
- Tüm teknik hesaplayıcılar (Lümen, Kelvin, MCB, RCD, Gerilim düşümü)
- Google Analytics entegrasyonu (G-BE948H2H4R)
- Schema.org structured data (genişletilmiş: geo, openingHours, hasOfferCatalog, sameAs)
- sitemap.xml (7 URL)
- Mobile ölçekleme düzeltmeleri (style.css)
- `vizyon-pillars` mobil: `repeat(2,1fr)` ✅
- `arma-grid` mobil: `1fr` ✅
- `cat-btn` mobil padding küçültme ✅
- MCB hesaplayıcı grid mobilde tek sütun ✅
- Referans proje galerisi (#referanslar) ✅
- Teklif formu (#teklif) — WhatsApp yönlendirme ✅
- SEO meta tagları (description, keywords, canonical, OG, Twitter Card) ✅
- Leaflet JS script tagı eklendi ✅
- CSS dosya yolu düzeltildi (css/style.css → style.css) ✅
- Çift section-divider silindi ✅
- tab-mcb / tab-tesisat yapısal bozukluk düzeltildi ✅
- Duplicate RCD bilgi kutuları kaldırıldı ✅
- Footer kapanış tagları düzeltildi ✅

### 🔴 Açık Sorunlar
- Harita rota polyline birikme sorunu (yukarıdaki çözüm bekliyor)

### 🔲 Yapılacak
- Yeni müşteri yorumu ekleme (statik HTML, #yorumlar section)
- GitHub Pages'e taşıma (Netlify yerine):
  - Settings → Pages → Branch: main → Save
  - Yeni URL: `https://bircanelektrik.github.io/bircan-elektrik`
- Netlify'dan `netlify/functions/yakit.js` silme (artık kullanılmıyor)
- og-image.jpg oluşturma (OG meta'da referans var ama dosya yok)
- Kelvin slider mobilde touch-action: none eklenmesi gerekebilir

---

## SIK YAPILAN HATALAR VE ÇÖZÜMLER

### Harita çalışmıyor
**Sebep:** Leaflet `DOMContentLoaded` ile başlatılmış VEYA leaflet.min.js script tagı eksik.
**Çözüm:** `window.addEventListener('load', ...)` kullan. `<script src="leaflet.min.js">` var mı kontrol et.

### Accordion açılıyor ama hesaplayıcı çalışmıyor
**Sebep:** `initMCB()` / `initLumen()` / `initGD()` birden fazla kez çağrılıyor,
`_b` flag'i ile önleniyor.
**Çözüm:** Accordion'u kapatıp tekrar açarsan init tekrar çalışmaz — bu bilerek
yapılmış bir optimizasyon.

### Yeni eklenen section mobile'da taşıyor
**Sebep:** `@media (max-width: 768px)` bloğuna eklenmemiş.
**Çözüm:** style.css'in mobile bloğuna padding ekle.

### CSS dosya yolu
**Geçmiş hata:** `href="css/style.css"` yazılmıştı, doğrusu `href="style.css"`.
**Durum:** Düzeltildi.

### Çift section-divider
**Geçmiş hata:** "Teknik Odak" divider'ı iki kez yazılmıştı.
**Durum:** Düzeltildi.

---

## CLOUDFLARE WORKER BİLGİSİ

**URL:** `https://yakit-proxy.bircannelektrik.workers.dev`
**Dashboard:** dash.cloudflare.com → Workers & Pages → yakit-proxy
**Kapasite:** Günlük 100.000 istek (ücretsiz)
**CollectAPI:** Aylık 100 istek (ücretsiz) — localStorage cache sayesinde sorun değil

**Worker dönen format:**
```json
{
  "success": true,
  "sehir": "Kayseri",
  "tarih": "28.03.2026",
  "motorin": 74.08,
  "benzin95": 62.52,
  "ham": [...]
}
```

---

## DEPLOY AKIŞI

```
Kod değişikliği (index.html / style.css / bircan.js)
    ↓
git add . && git commit -m "açıklama"
    ↓
git push origin main
    ↓
Netlify otomatik deploy (bircan-elektrik.netlify.app)
    VEYA
GitHub Pages otomatik deploy (bircanelektrik.github.io/bircan-elektrik)
```

---

## HIZLI REFERANS — CSS TOKEN'LARI

```css
--black: #0f0f0f        /* Ana siyah */
--white: #f8f7f4        /* Kırık beyaz */
--gold: #b8963e         /* Marka altın */
--gray: #6b6b6b         /* Gri metin */
--gray-light: #e8e7e3   /* Açık gri (border, bg) */
--radius: 12px          /* Standart köşe */
```

**Standart padding'ler:**
- Masaüstü section: `5rem 4rem`
- Mobile section: `3rem 1.5rem`
- Section divider masaüstü: `padding: 0 4rem`
- Section divider mobile: `padding: 0 1.5rem`

---

## SONRAKI OTURUM — MALZEME PLANLAMA ARACI PLANI

### Genel Bakış
Teknik Rehber'e 3. accordion kategorisi olarak eklenecek.
Tek akışlı, parçalanmaz kullanıcı deneyimi. Yaşlı biri bile kullanabilmeli.
Basit sorular → arka planda mühendislik → komple malzeme listesi çıkar.
Fiyat yok, sadece malzeme.

### Accordion Butonu
```
💡 Aydınlatma Rehberi        ← mevcut
⚡ Şalt & Koruma Sistemleri   ← mevcut
🏗️ Malzeme Planlama Aracı    ← YENİ
```

### Soru Akışı (Kullanıcı Görür)

**S1: "Eviniz kaç oda?"**
Hazır: 1+1, 2+1, 3+1, 4+1, 5+1, Özel
Seçince oda kartları varsayılan değerlerle oluşur.

**S2: "Her oda için priz ve lamba sayısı"**
Oda kartları varsayılanlarla gelir, kullanıcı +/- ile değiştirir.
Varsayılanlar: Mutfak 6 priz 2 lamba, Salon 6 priz 2 lamba, Yatak 4 priz 1 lamba, Banyo 2 priz 2 lamba, Koridor 1 priz 1 lamba, Balkon 1 priz 1 lamba.

**S3: "Elektrik direğine mesafe?"**
Metre girişi, varsayılan 10m. Havai / Yeraltı iki buton.

**S4: "Güçlü cihaz var mı?"**
Evet → hazır liste: Fırın 2500W, Klima 3500W, Şofben 4000W, Kombi 2500W, Bulaşık 1800W, Çamaşır 2500W. Tıkla ekle.
Hayır → geç.

**S5: "Kapı zili / diyafon"**
🔔 Basit Zil → NYM 2×0.75 + zil + buton
📞 Sesli Ahize → DT8 + dış ünite + iç ünite + light buton
📹 Kameralı Panel → DT8 + CAT6 + video panel + monitor + light buton

**S6: "Güvenlik kamerası?"**
Evet → kaç adet? → CAT6 25m/kamera + 2 konnektör + 1 buat/kamera
Hayır → geç. NVR/HDD listeye dahil edilmez, uyarı yazılır.

**>> "Malzeme Listemi Oluştur" butonu**

### Arka Plan Hesaplama (CONFIG Sabitleri)

```javascript
var MALZEME_CONFIG = {
  // Güç varsayılanları
  watt_priz: 300,              // W/priz
  watt_lamba: 100,             // W/lamba
  mustakil_esik: 3200,         // W — bunun üstü 4mm² kablo

  // Kablo metrajı
  kablo_priz_basina: 8,        // metre (NYM 3×2.5mm²)
  kablo_lamba_basina: 7,       // metre (NYM 3×1.5mm²)
  kablo_mustakil_min: 12,      // metre (NYM 3×2.5mm², >3200W ise 3×4mm²)
  kablo_kolon_min_kesit: 6,    // mm² minimum kolon kesiti
  kablo_ic_kolon: 10,          // metre (iç kolon sabit)

  // Hat kuralları
  max_priz_hat: 7,             // hat başına max priz (16A MCB)
  max_lamba_hat: 9,            // hat başına max lamba (10A MCB)

  // Borulama
  boru_katsayisi: 1.2,         // kablo metresi × bu = boru metresi
  buat_oda_basina: 1,

  // Eş zamanlı güç faktörü
  esz_8kw_alti: 0.6,
  esz_8kw_ustu: 0.4,
  esz_sinir: 8000,             // W

  // Sistem tipi eşiği
  trifaze_esik: 5000,          // W — üstü 3 faz zorunlu

  // Genel katsayı
  genel_emniyet: 1.15,         // %15 emniyet payı

  // Kamera
  kamera_kablo: 25,            // metre CAT6/kamera
  kamera_konnektor: 2,         // adet/kamera
  kamera_buat: 1               // adet/kamera
};
```

### Hesaplama Adımları
1. Toplam güç = Σ(priz×300W) + Σ(lamba×100W) + Σ(müstakil cihazlar)
2. Eş zamanlı güç = 8kW'a kadar ×0.6 + üstü ×0.4
3. Sistem: >5kW → 3 faz 380V, değilse monofaze 220V
4. Akım: Mono I=P/220, Tri I=P/(√3×380)
5. Hat sayısı: priz toplam/7 (yuvarla), lamba toplam/9 (yuvarla)
6. MCB'ler: 10A×lamba_hat_sayısı + 16A×priz_hat_sayısı + 20/25A×müstakil
7. Pano yapısı otomatik:
   - 3 faz → Kofre + 3 bıçaklı sigorta + 4P RCD 40A 300mA + 4P MCB 32A + 3 faz sayaç
   - Mono → 2P RCD 40A 300mA + 2P MCB 32A + mono sayaç
   - İç pano: 2P/4P 30mA RCD 25A + hat MCB'leri
8. Kablo: priz×8m(2.5mm²) + lamba×7m(1.5mm²) + müstakil×12m(2.5mm², >3200W→4mm²) + kolon(6mm²) + direk mesafesi
9. Boru: toplam kablo × 1.2
10. Buat: oda sayısı × 1
11. Zayıf akım: diyafon/kamera seçimlerine göre

### Çıktı Tablosu Grupları
| Grup | İçerik |
|------|--------|
| Ana Dağıtım Panosu | Kofre, bıçaklı sigorta, RCD, MCB, sayaç |
| Daire Panosu | Pano boyutu, RCD 30mA, tüm MCB'ler |
| Kablolar | NYM 3×1.5 Xm, NYM 3×2.5 Xm, NYM 3×4 Xm, kolon 6mm² Xm |
| Borulama | Boru Xm, buat X adet |
| Priz & Anahtar | Priz X, anahtar X |
| Aydınlatma | Lamba noktası X adet |
| Zayıf Akım | CAT6, RG6, DT8 metrajları |
| Diyafon/Zil | Seçime göre malzemeler |
| Kamera | CAT6, konnektör, buat (NVR/HDD hariç) |

### Alt Uyarı
⚠️ Bu malzeme listesi tahminidir. Kesin liste için sahada keşif gereklidir.
📞 Detaylı planlama: 0534 014 09 49
+ "Teklif Al" butonu → WhatsApp'a malzeme özetiyle yönlendirir.

### Dosya Etkileri
- index.html → #teknik'e 3. accordion + panel HTML
- style.css → Oda kartı, soru adımları, malzeme tablosu + mobile
- bircan.js → MALZEME_CONFIG, soru akışı, hesaplama, tablo render
