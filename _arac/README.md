# _arac — Ana sayfayı üreten araç (yedek)

Bu klasör internette yayınlanmaz (adı alt çizgiyle başladığı için GitHub Pages onu atlar).
Sitenin çalışması için gerekli değildir; yalnızca yedektir.

## Ne işe yarar?

Yeni ana sayfa (index.html, css/home.css, js/home.js ve bircan.js / images.js / animations.js
içindeki değişiklikler) bu klasördeki `gen.js` programıyla, tasarım dosyasından üretildi.

Günlük düzeltmeler için bu araca gerek yok: metni doğrudan `index.html` ya da ilgili dosyada değiştirin.
Bu araç yalnızca ana sayfayı tasarımdan baştan üretmek gerektiğinde kullanılır.

## İçindekiler

| Klasör / dosya | Ne |
| --- | --- |
| `gen.js` | Tasarımı siteye çeviren program (Node.js ile çalışır) |
| `copy_bircan.json` | bircan.js içindeki referans/hizmet metni kısaltmaları |
| `tasarim/` | Tasarım dosyaları: Main (masaüstü), Mobile, Logo |
| `logo/mark_d.txt` | Orijinal logonuzun vektör çizgisi (menü, alt kısım, sekme simgesi bunu kullanır) |
| `orijinal/` | Yeniden tasarımdan önceki dosyalar; program değişiklikleri bunların üzerine uygular |
| `faq-kontrol.js` | Rehber soru-cevapları ile Google'ın okuduğu FAQ verisini karşılaştırır: `node faq-kontrol.js` |
| `test/` | Sayfadaki butonların, haritanın ve formun çalıştığını kontrol eden testler (isteğe bağlı) |

## Yeniden üretmek için

Bilgisayarda Node.js kurulu olmalı. Bu klasörde bir terminal açıp:

```
node gen.js tasarim/Main.dc.html logo/mark_d.txt orijinal ../_cikti
```

Sonuç `_cikti` klasörüne yazılır. Site dosyalarının üzerine doğrudan yazmaz; kontrol edip elle kopyalayın.
`js/protect.js` üretilmez, mevcut dosya kalır.

Dikkat: Ana sayfada elle yaptığınız düzeltmeler bu yolla üretilen dosyada olmaz.
Yeniden üretmeden önce o düzeltmeleri tasarım dosyasına da işleyin.

Tarih: 8 Ekim 2026
