# İçerik Koruma Modülü — `protect.js`

**Proje:** Bircan Elektrik Mühendislik Web Sitesi  
**Modül:** `protect.js` — Bağımsız İçerik Koruma Katmanı  
**Versiyon:** 1.0  
**Durum:** ✅ Aktif — `index.html` ile entegre edildi

---

## Genel Bakış

`protect.js`, Bircan Elektrik Mühendislik web sitesinin içeriğini izinsiz kopyalamaya, kaynak görüntülemeye ve geliştirici araçlarına karşı koruyan bağımsız bir JavaScript modülüdür.

**Tasarım ilkesi:** Mevcut hiçbir dosyanın yapısı bozulmamıştır. Koruma tamamen ayrı bir modül olarak eklenmiş; `index.html`'e yalnızca tek bir `<script>` satırı eklenmiştir.

---

## Entegrasyon

### `index.html` — Eklenen Satır

`protect.js`, GSAP ScrollTrigger'dan hemen sonra, `</head>` kapanmadan önce yüklenir:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="protect.js"></script>   ← EKLENEN SATIR (34. satır)
</head>
```

> Bu yerleşim, sayfanın DOM'u oluşturulmadan önce korumaların devreye girmesini sağlar.

---

## Aktif Korumalar

| # | Koruma | Tetikleyici | Yöntem |
|---|--------|-------------|--------|
| 1 | **Sağ tık engeli** | Mouse sağ tuşu | `contextmenu` → `preventDefault()` |
| 2 | **Metin seçimi engeli** | Fare ile sürükleme | `selectstart` → `preventDefault()` |
| 3 | **Çift/üçlü tık seçimi engeli** | 2+ tık | `mousedown` → `detail > 1` kontrolü |
| 4 | **CSS metin seçim engeli** | JS fallback | `user-select: none !important` (tüm prefix'ler) |
| 5 | **Sürükle-bırak engeli** | Eleman sürükleme | `dragstart` → `preventDefault()` |
| 6 | **F12 engeli** | F12 tuşu | `keydown` → `keyCode 123` |
| 7 | **Ctrl+U engeli** | Kaynak görüntüle | `keydown` → `ctrlKey + 'u'` |
| 8 | **Ctrl+C engeli** | Kopyala | `keydown` filtresi + `copy` eventi |
| 9 | **Ctrl+X engeli** | Kes | `keydown` filtresi + `cut` eventi |
| 10 | **Ctrl+S engeli** | Kaydet | `keydown` → `ctrlKey + 's'` |
| 11 | **Ctrl+Shift+I engeli** | DevTools (Inspect) | `keydown` → `ctrlKey + shiftKey + 'i'` |
| 12 | **Ctrl+Shift+J engeli** | Console | `keydown` → `ctrlKey + shiftKey + 'j'` |
| 13 | **Ctrl+Shift+C engeli** | Elements panel | `keydown` → `ctrlKey + shiftKey + 'c'` |
| 14 | **Ctrl+A engeli** | Tümünü seç | `keydown` → form dışında engellendi |

---

## Form Alanı İstisnası

Teklif formu ve teknik hesaplayıcıların düzgün çalışması için `input`, `textarea` ve `select` etiketlerinde metin seçimi **kasıtlı olarak açık bırakılmıştır**.

### CSS Kuralı

```css
/* Genel engel — tüm sayfa */
* {
  -webkit-user-select: none !important;
  -moz-user-select:    none !important;
  -ms-user-select:     none !important;
  user-select:         none !important;
}

/* Form alanı istisnası */
input, textarea, select {
  -webkit-user-select: text !important;
  -moz-user-select:    text !important;
  user-select:         text !important;
}
```

### Ctrl+A İstisnası

```javascript
if (ctrl && key === 'a') {
  var tag = (document.activeElement || {}).tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
    e.preventDefault(); // form dışında engelle
  }
}
```

---

## Teknik Detaylar

### IIFE Yapısı

Tüm kod bir **IIFE** (Immediately Invoked Function Expression) içinde çalışır. Bu sayede global scope kirlenmez ve diğer JS modülleriyle çakışma olmaz.

```javascript
(function () {
  'use strict';
  // ... tüm koruma kodları
})();
```

### macOS Uyumluluğu

`e.metaKey` (⌘ Command tuşu) `e.ctrlKey` ile birlikte kontrol edildiğinden tüm korumalar macOS'ta da geçerlidir:

```javascript
var ctrl = e.ctrlKey || e.metaKey;
```

### Copy/Cut Event Çift Güvencesi

Klavye kısayolları engellense de tarayıcının kendi menüsü veya başka yollarla tetiklenen `copy` ve `cut` eventleri de ayrıca engellenir:

```javascript
document.addEventListener('copy', function (e) { e.preventDefault(); });
document.addEventListener('cut',  function (e) { e.preventDefault(); });
```

---

## Dosya Yapısı

```
bircan-elektrik/
├── index.html        ← 1 satır eklendi: <script src="protect.js"> (34. satır)
├── style.css         ← değiştirilmedi
├── bircan.js         ← değiştirilmedi
├── images.js         ← değiştirilmedi
├── animations.js     ← değiştirilmedi
├── sitemap.xml       ← değiştirilmedi
└── protect.js        ← YENİ — içerik koruma modülü
```

---

## Yükleme Sırası

```
1. leaflet.min.js       (harita)
2. style.css            (stiller)
3. gsap.min.js          (animasyon motoru)
4. ScrollTrigger.min.js (scroll animasyonları)
5. protect.js           ← içerik koruması (DOM hazır olmadan önce devreye girer)
── </head> ──
6. <body> yüklenir
7. bircan.js            (ana uygulama mantığı)
8. images.js            (görsel yönetimi)
9. animations.js        (sayfa animasyonları)
```

---

## Önemli Notlar

- `protect.js` tamamen bağımsızdır; herhangi bir kütüphaneye bağımlılığı yoktur.
- Korumalar DOM içeriğine değil, **event sistemine** bağlıdır; bu nedenle dinamik olarak yüklenen içerikler de korunur.
- Cloudflare Workers proxy URL: `https://yakit-proxy.bircannelektrik.workers.dev/`
- Cloudflare Dashboard: `dash.cloudflare.com`

---

*Son güncelleme: Nisan 2026*
