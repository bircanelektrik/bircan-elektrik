/* sulama-data.js - Sabit veri tablolari: BITKI, URETIM_TIPLERI, VERIM, boru/pompa tablolari */
/* ENGINE LAYER - MUHENDISLIK HESAP MOTORU v7
   Arka planda: senaryo uretimi, risk skorlari, costConfidence
   On yuzde: ciftci dili, trafik isigi, sade yorum */

/* STATE */
const S = {
  // Kuyu
  kuyuDurum:'mevcut', kurumaRisk:'yok',
  kuyuDerinlik:0, statikSu:0, dmod:'biliyorum', dinamikSu:0,
  kuyuCap:'', kuyuDebi:0, kuyuSayisi:1, kuyuMesafe:150,
  // Sulama + arazi
  sulamaYontem:'yagmurlama', araziDonum:0, uretimTipi:'', urunTip:'',
  uzakNokta:0, egimDurum:'duz', kotFarki:0,
  boruCap:'', boruTip:'hdpe', hatSayisi:1, calismaSure:8, teslimNokta:'direkt',
  gunlukSu:0, gunlukSuState:'empty',
  basinc:0, basincState:'empty',
  tipSiraArasi:0, tipBitkiArasi:0, tipAgacAralikM2:0, tipToplamSira:0, tipTarlaEn:0, tipTarlaBoy:0,
  tipToplamAgac:0, tipAgacDamlaAdet:0, tipLateralTip:'tek', tipDamlaticiDebi:0,
  tipDamlaticiAralik:0, tipEkiliOran:100, tipLateralYon:'uzun', tipDikimTip:'tek',
  tipBahceYasi:'olgun', tipDirekArasi:0, tipSprinklerPreset:'standart', tipBaslikAralikX:0, tipBaslikAralikY:0,
  tipBaslikDebi:0, tipBaslikTip:'rotor', tipSulamaAcisi:'tam', tipBasinc:0,
  tipManualSira:0, tipManualLateralM:0, tipManualAgac:0, tipManualBlok:0,
  // YENİ: Gelişmiş sulama parametreleri
  spAralikX:0, spAralikY:0, spDebi:0, spBasinc:0,
  dmlSiraArasi:0, dmlDamlAralik:0, dmlDamlDebi:0, dmlLateralLen:0,
  dmlBitkiArasi:0, dmlToplamSira:0, dmlTarlaEn:0, dmlTarlaBoy:0, dmlAgacDamlaAdet:0, dmlLateralTip:'tek',
  advParamGirildi:false,
  // Enerji
  sebekeDurum:'yok', sistemTercih:'solar', panelYer:'yer', ilSecim:'orta', trafoMesafe:0, panelGuc:0,
  // Hedef (default artık 'guvenlik' – maliyeti baskın yapma kuralı)
  oncelik:'guvenlik', kullanci:'kendisi',
  // Internal
  _basincHesap:null, _duzenlemeModu:false, _sonSenaryolar:null, _lastEngineResult:null, _validation:null,
  selectedScenarioId:'', selectedScenarioType:'', bomAccordionOpen:false
};

/* "-"-" VER-TABANLARI "-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-" */
// BITKI tablosu — Temmuz pik dönemi ETc (mm/gün), İç Anadolu/Ege koşulları
// Kaynaklar: TAGEM, DSİ, FAO Kc tabloları + 3 bağımsız akademik uzman raporu sentezi (v7.7)
// 1 mm/gün = 1 ton/gün/dönüm (1000 m²)
const BITKI = {
  misir:{ad:"Mısır/Silaj",pikMM:8.2,sezon:5,not:"Pik dönem (Temmuz-Ağustos) koçan dolumunda su kritik. Damla önerilir."},
  bugday:{ad:"Buğday/Arpa",pikMM:3.0,sezon:3,not:"Temmuz'da çoğu bölgede hasada yakın. Başaklanma pik su talep dönemidir (Mayıs)."},
  pancar:{ad:"Şeker Pancarı",pikMM:8.0,sezon:4.5,not:"Sürekli yoğun sulama gerektirir. Damla uniformite için avantajlı."},
  ayciçegi:{ad:"Ayçiçeği",pikMM:6.0,sezon:3,not:"Çiçeklenme döneminde kritik. Yarı-damla veya salma geleneksel."},
  pamuk:{ad:"Pamuk",pikMM:7.5,sezon:5,not:"Koza oluşumunda su kritik. Karık veya damla yaygın."},
  domates:{ad:"Domates/Biber",pikMM:7.8,sezon:4,not:"Damla ana yöntem — yaprak ıslanması hastalık riski yaratır."},
  salatalik:{ad:"Salatalık/Kabak",pikMM:7.5,sezon:3,not:"Sık ve düzenli sulama. Damla önerilir."},
  patates:{ad:"Patates/Soğan",pikMM:6.0,sezon:3.5,not:"Yumru oluşumunda nem şart. Yağmurlama veya damla."},
  kavun:{ad:"Kavun/Karpuz",pikMM:6.5,sezon:3,not:"Meyve tutumundan sonra su azalt. Damla tercih edilir."},
  meyve:{ad:"Meyve Bahçesi",pikMM:6.5,sezon:4,not:"Elma/armut için akademik değer. Ceviz için daha yüksek (7.5)."},
  bag:{ad:"Bağ/Üzüm",pikMM:6.0,sezon:3.5,not:"Damla ana yöntem. Sofralık bağda üst sınıra yakın."},
  zeytin:{ad:"Zeytin",pikMM:5.0,sezon:3,not:"Kuraklığa dayanıklı ama yağ verimi için kritik dönemlerde su ister. Damla tercih."},
  cim:{ad:"Çim/Yeşil Alan",pikMM:7,sezon:5,not:"Nisan-Ekim boyunca düzenli sulama. Sprinkler standart."},
  yonca:{ad:"Yonca/Korunga",pikMM:9,sezon:6,not:"En fazla su isteyen yem bitkisi. Yağmurlama veya salma."},
  diger:{ad:"Diğer/Karma",pikMM:6,sezon:3.5,not:"Ortalama değer. Detaylı bitki için üretim tipi seçin."}
};
const URETIM_TIPLERI = {
  tarla:{
    ad:'Tarla Bitkisi',
    desc:'Blok ve hat yoğunluğu üzerinden hesap yapılır. Ekili alan yüzdesi ve sıra aralığı girilirse dağıtım daha doğru çıkar.',
    chips:['Ana hat','Lateral / damla','Vana ve filtre'],
    products:['misir','bugday','arpa','pancar','aycicegi','yonca','pamuk','tarlaDiger']
  },
  sebze:{
    ad:'Sebze Tarlası',
    desc:'Sıra düzeni, dikim tipi ve damlatıcı yerleşimi öne çıkar. Manifold ve gübreleme opsiyonları buna göre türetilir.',
    chips:['Sıra bazlı damla','Manifold','Gübreleme opsiyonu'],
    products:['domates','biber','patlican','salatalik','kabak','patates','sogan','kavun','karpuz','sebzeDiger']
  },
  meyve:{
    ad:'Meyve Bahçesi',
    desc:'Ağaç düzeni, sıra arası ve ağaç başına damlatıcı adedi zorunlu mantıktır. Tarla varsayımı kullanılmaz.',
    chips:['Ağaç bazlı damla','Servis vanaları','Çift lateral opsiyonu'],
    products:['elma','armut','kiraz','seftali','kayisi','nar','ceviz','meyveDiger']
  },
  bag:{
    ad:'Bağ / Asma Sistemi',
    desc:'Omca düzeni ve sıra geometrisi belirleyicidir. Tek/çift hat sulama buna göre türetilir.',
    chips:['Omca bazlı hat','Sıra vanaları','Regülasyon'],
    products:['uzum','bagDiger']
  },
  zeytinlik:{
    ad:'Zeytinlik / Seyrek Ağaçlı Bahçe',
    desc:'Seyrek ağaç düzeninde damlatıcı yoğunluğu ve bloklama ayrı ele alınır.',
    chips:['Seyrek ağaç damla','Blok vanaları','Filtrasyon'],
    products:['zeytin','zeytinDiger']
  },
  peyzaj:{
    ad:'Çim / Peyzaj Alanı',
    desc:'Sprinkler başlık geometrisi, eş zamanlı çalışma ve otomasyon altyapısı önemlidir.',
    chips:['Sprinkler başlıkları','Solenoid vana','Otomasyon'],
    products:['cim','peyzajDiger']
  },
  ozel:{
    ad:'Karma / Özel Düzen',
    desc:'Standart düzene uymayan alanlar için serbest değerlerle ön keşif seviyesi liste üretilir.',
    chips:['Manuel hatlar','Ön keşif etiketi','Esnek blok sayısı'],
    products:['karma']
  }
};
// PRODUCT_LIBRARY — Temmuz pik dönemi ETc + akademik mühendislik notları (v7.7)
// Kaynaklar: TAGEM/DSİ standart + 3 bağımsız uzman raporu (FAO Kc × ET₀ İç Anadolu/Ege)
const PRODUCT_LIBRARY = {
  // TARLA BİTKİLERİ
  misir:{type:'tarla',ad:'Mısır / Silaj Mısır',pikMM:8.2,sezon:5,not:'Koçan dolumunda su kritik. Damla default (ETc=8.2 akademik).'},
  bugday:{type:'tarla',ad:'Buğday',pikMM:3.0,sezon:3,not:'Temmuz\'da hasada yakın. Pik dönem Mayıs. Yağmurlama default.'},
  arpa:{type:'tarla',ad:'Arpa',pikMM:2.8,sezon:3,not:'Buğdaya benzer. Yağmurlama uygun.'},
  pancar:{type:'tarla',ad:'Şeker Pancarı',pikMM:8.0,sezon:4.5,not:'Damla uniformite için avantajlı. Yaprak hastalığı riski düşer.'},
  aycicegi:{type:'tarla',ad:'Ayçiçeği',pikMM:6.0,sezon:3,not:'Çiçeklenmede kritik. Karık veya damla.'},
  yonca:{type:'tarla',ad:'Yonca / Korunga',pikMM:9,sezon:6,not:'En yüksek su ihtiyaçlı yem. Yağmurlama yaygın.'},
  pamuk:{type:'tarla',ad:'Pamuk',pikMM:7.5,sezon:5,not:'Koza oluşumunda kritik. Karık veya damla.'},
  tarlaDiger:{type:'tarla',ad:'Diğer tarla bitkisi',pikMM:6,sezon:3.5,not:'Ortalama tarla bitkisi değeri.'},
  // SEBZE
  domates:{type:'sebze',ad:'Domates',pikMM:7.8,sezon:4,not:'Damla zorunlu — yaprak ıslanması erken/geç yanıklık riski.'},
  biber:{type:'sebze',ad:'Biber',pikMM:7.0,sezon:4,not:'Damla + kısa çevrimli sulama.'},
  patlican:{type:'sebze',ad:'Patlıcan',pikMM:7.0,sezon:4,not:'Damla default. Düzenli sulama ister.'},
  salatalik:{type:'sebze',ad:'Salatalık',pikMM:7.5,sezon:3,not:'Sık ve düzenli damla sulama.'},
  kabak:{type:'sebze',ad:'Kabak',pikMM:7.2,sezon:3,not:'Damla uygun, yaprak ıslatmamak tercih edilir.'},
  patates:{type:'sebze',ad:'Patates',pikMM:6.0,sezon:3.5,not:'Yumru oluşumunda nem şart. Yağmurlama veya damla.'},
  sogan:{type:'sebze',ad:'Soğan',pikMM:5.5,sezon:3.2,not:'Düzenli kontrollü sulama. Damla tercih.'},
  kavun:{type:'sebze',ad:'Kavun',pikMM:6.5,sezon:3,not:'Meyve tutumundan sonra azalt. Damla uygun.'},
  karpuz:{type:'sebze',ad:'Karpuz',pikMM:7.0,sezon:3.2,not:'Hat düzeni ve damlatıcı aralığı önemli.'},
  sebzeDiger:{type:'sebze',ad:'Diğer sebze',pikMM:6.8,sezon:3.5,not:'Ortalama sebze değeri.'},
  // MEYVE (damla default, ağaç altı mikro-sprink opsiyon)
  elma:{type:'meyve',ad:'Elma Bahçesi',pikMM:6.5,sezon:4,not:'Damla default 4×3m. Gençte 2 damlatıcı, tam verimde 4-8 (2-4 L/h). ETc=6.5.'},
  armut:{type:'meyve',ad:'Armut Bahçesi',pikMM:6.5,sezon:4,not:'Elmaya benzer. 4×3m, 4 damlatıcı/ağaç, 2-4 L/h.'},
  kiraz:{type:'meyve',ad:'Kiraz Bahçesi',pikMM:5.5,sezon:3.8,not:'Dengeli kontrollü sulama. Damla default.'},
  seftali:{type:'meyve',ad:'Şeftali Bahçesi',pikMM:6.0,sezon:4,not:'Meyve irileşmesinde su önemli. Damla.'},
  kayisi:{type:'meyve',ad:'Kayısı Bahçesi',pikMM:5.5,sezon:3.8,not:'Bahçe düzeni damla metrajını belirler.'},
  nar:{type:'meyve',ad:'Nar Bahçesi',pikMM:5.5,sezon:3.7,not:'Damla tercih. Ağaç yaşına göre damlatıcı sayısı artar.'},
  ceviz:{type:'meyve',ad:'Ceviz Bahçesi',pikMM:7.5,sezon:4.5,not:'8×8m dikim. Mikro fıskiye (30-50 L/h) veya çift-hat damla (8 L/h × 6-10 damlatıcı). ETc=7.5.'},
  meyveDiger:{type:'meyve',ad:'Diğer meyve bahçesi',pikMM:6.5,sezon:4,not:'Tipik meyve bahçesi akademik değeri.'},
  // BAĞ
  uzum:{type:'bag',ad:'Üzüm / Bağ',pikMM:6.0,sezon:3.5,not:'Damla zorunlu 3×2m — üstten yağmurlama mantari hastalık ve tane çatlama riski. ETc=6.0.'},
  bagDiger:{type:'bag',ad:'Diğer bağ / asma',pikMM:6.0,sezon:3.5,not:'Sofralık/şaraplık bağ değeri.'},
  // ZEYTİN
  zeytin:{type:'zeytinlik',ad:'Zeytinlik',pikMM:5.0,sezon:3,not:'Damla 6×6m. 4-6 damlatıcı/ağaç (2-4 L/h). Yağ verimi için kritik dönemde sulama şart. ETc=5.0.'},
  zeytinDiger:{type:'zeytinlik',ad:'Diğer seyrek ağaçlı bahçe',pikMM:5.0,sezon:3,not:'Seyrek ağaçlı akademik değer.'},
  // PEYZAJ
  cim:{type:'peyzaj',ad:'Çim Alan',pikMM:7,sezon:5,not:'Sprinkler standart. Nisan-Ekim düzenli.'},
  peyzajDiger:{type:'peyzaj',ad:'Peyzaj Alanı',pikMM:6.5,sezon:4.5,not:'Başlık yerleşimi ve açı önemli.'},
  karma:{type:'ozel',ad:'Karma / Özel Düzen',pikMM:6,sezon:3.5,not:'Ön keşif ortalama değeri.'}
};
const VERIM={damla:0.92,yagmurlama:0.77,salma:0.50};   // akademik: damla 92%, yağmurlama 77%, salma 50% (TAGEM/DSİ)
const YB={
  damla:{min:1.0,opt:1.8,max:3.0,guvenliMax:4.0,altTip:"Damlatıcı: 1.5–2.5 bar",ad:"Damla"},
  yagmurlama:{min:2.5,opt:3.5,max:5.0,guvenliMax:6.0,altTip:"Tam daire: 3–5 bar",ad:"Yağmurlama"},
  salma:{min:0.3,opt:0.5,max:1.0,guvenliMax:2.0,altTip:"Düz arazi: 0.3–0.8 bar",ad:"Salma"}
};
const BORU_IC={63:56,75:68,90:82,110:100,125:114,160:147,200:184};
const GP={orta:5.2,ege:5.8,akdeniz:6.0,gdo:6.2,ic:5.0,marmara:4.5,karadeniz:3.8};
const STD_POMP=[0.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75];
// Pompa gücü (kW) → tipik ulaşılabilir basma yüksekliği (mSS)
// Revize: Nisan 2026 saha katalog kontrolü (Impo / WNP / Pedrollo örnek eğrileri) ile
// küçük-orta güç pompaların eski tablodan fazla düşük kaldığı görüldü.
// Bu tablo artık "mutlak max" değil, pratikte seçime esas alınabilecek tipik başlık bandıdır.
// Özellikle 5.5–11 kW sınıfı daha gerçekçi hale getirildi; böylece 150–200 mSS bandında
// gereksiz 22–37 kW sıçramaları önlenir.
const STD_POMP_TDH={
  0.75:35, 1.1:48, 1.5:62, 2.2:82, 3:105, 4:140, 5.5:195, 7.5:235,
  11:295, 15:355, 18.5:415, 22:470, 30:560, 37:650, 45:730, 55:810, 75:930
};
const STD_INV=[1.5,2.2,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110];
