/* sulama-price-data.js - 2026 on yatirim maliyeti modeli */

const YATIRIM_REFERANS_2026 = {
  updatedAt: '2026-04-23',
  usdTry: 44.92,
  electricTariffTlKwh: 4.37,
  tariffDate: '2026-04-04',
  tariffNote: 'Tarimsal sulama AG tek zamanli ortalama birim maliyet kabuludur.',
  globalNote: 'Fiyatlar 2025-2026 Turkiye saha piyasasi ortalamasi uzerinden kurgulanmistir.'
};

const YATIRIM_PROFILLERI = {
  maliyet: {
    id: 'maliyet',
    label: 'Maliyet Odakli',
    badge: 'Butce sinifi',
    brandText: 'Pompa: Impo/Coverco/Alarko giris, panel-surucu: Lexron/Tommatech/Mexxsun, altyapi: Plas/Poelsan/Erhas.',
    note: 'Ekonomik giris sinifi malzemeler baz alinir; otomasyon ve premium koruma setleri sadece gerekliyse dahil edilir.'
  },
  uzunomur: {
    id: 'uzunomur',
    label: 'Uzun Omurlu',
    badge: 'Fiyat / performans',
    brandText: 'Pompa: Vansan/Standart/Franklin, panel-surucu: HT Solar/CW/Tommatech-INVT, altyapi: Kuzeyboru/Firat/Armas.',
    note: 'Uzun omur, servis bulunurlugu ve saha dayanimi onceliklendirilir.'
  },
  verimli: {
    id: 'verimli',
    label: 'Yuksek Verimli',
    badge: 'Premium akilli',
    brandText: 'Pompa: Grundfos/Wilo/Caprari, panel-surucu: Jinko/Trina/Huawei-SMA-ABB, sulama: Netafim/Amiad/Bermad.',
    note: 'Enerji verimi, otomasyon ve premium sulama ekipmani baz alinir.'
  },
  karma: {
    id: 'karma',
    label: 'Uzun Omurlu + Yuksek Verimli',
    badge: 'Karma premium',
    brandText: 'Ana hidrolik ve pompa grubunda uzun omurlu; enerji, otomasyon ve dagitim tarafinda premium segment baz alinir.',
    note: 'Boru, vana ve ana mekanikte uzun omur; panel, surucu, otomasyon ve dagitim veriminde premium secim uygulanir.'
  }
};

const YATIRIM_EK_GIDER_CARPANI = 0.85;

function makeTierSpec(price, brand, feature){
  return { fiyat: price, marka: brand, ozellik: feature };
}

function makePriceRecord(unit, volatility, maliyet, uzunomur, verimli){
  return {
    birim: unit,
    volatility: volatility || 'medium',
    maliyet: makeTierSpec(maliyet[0], maliyet[1], maliyet[2]),
    uzunomur: makeTierSpec(uzunomur[0], uzunomur[1], uzunomur[2]),
    verimli: makeTierSpec(verimli[0], verimli[1], verimli[2])
  };
}

const FIYAT_DATA_DETAYLI = {
  'Dalgic pompa': makePriceRecord(
    'kW',
    'high',
    [9500, 'Impo/Coverco/Alarko', 'Ekonomik 4-6 inc giris sinifi, IE2'],
    [13500, 'Vansan/Standart/Franklin', 'Paslanmaz govde, IE3'],
    [20500, 'Grundfos/Wilo/Caprari', 'Yuksek verimli alaSim, IE4/IE5']
  ),
  'Check valve (cekvalf)': makePriceRecord(
    'adet',
    'medium',
    [950, 'Yerli / genel marka', 'Pirincl veya kaplamali cekvalf'],
    [1800, 'Armas / ECA / Ayvaz', 'Metal govde agir hizmet'],
    [3200, 'Bermad / AYVAZ ust seri', 'Paslanmaz veya premium disk']
  ),
  'Kuru calisma koruma': makePriceRecord(
    'adet',
    'medium',
    [850, 'Genel yerli', 'Temel koruma rolesi'],
    [1900, 'Entes / Kael', 'Gerilim ve seviye takipli'],
    [3800, 'Lovato / Schneider / ABB', 'Akilli motor koruma modulu']
  ),
  'Seviye elektrodu': makePriceRecord(
    'adet',
    'low',
    [350, 'Genel yerli', 'Standart paslanmaz prob'],
    [850, 'Entes / Kael', 'Daha uzun omurlu seviye probu'],
    [1800, 'IFM / Finder / premium', 'Sanayi tipi sensor/prob']
  ),
  'Dirsek': makePriceRecord(
    'adet',
    'medium',
    [180, 'Erhas / Poelsan', 'Standart PE ek parca'],
    [360, 'Firat / Kuzeyboru', 'Kaliteli enjeksiyon ve sızdirmazlik'],
    [640, 'Wavin / GF', 'Premium PE100 RC uyumlu fitting']
  ),
  'T parcasi': makePriceRecord(
    'adet',
    'medium',
    [230, 'Erhas / Poelsan', 'Standart PE tee'],
    [450, 'Firat / Dizayn', 'Kaliteli PE ek parca'],
    [800, 'Wavin / GF', 'Premium endustriyel tee']
  ),
  'Reduksiyon': makePriceRecord(
    'adet',
    'medium',
    [140, 'Erhas / Poelsan', 'Standart cap gecisi'],
    [280, 'Firat / Kuzeyboru', 'Kaliteli PE redüksiyon'],
    [520, 'Wavin / GF', 'PE100 RC / premium gecis parcasi']
  ),
  'Rakor': makePriceRecord(
    'adet',
    'medium',
    [120, 'Poelsan / Plas', 'Standart servis rakoru'],
    [240, 'Firat / Dizayn', 'Metal destekli veya yuksek kalite'],
    [460, 'GF / Wavin', 'Premium servis baglantisi']
  ),
  'Flans': makePriceRecord(
    'adet',
    'medium',
    [260, 'Genel yerli', 'Standart flans adaptoru'],
    [520, 'Firat / Kuzeyboru', 'Metal destekli flans baglantisi'],
    [980, 'GF / Wavin', 'Premium flans seti']
  ),
  'Sprinkler basligi': makePriceRecord(
    'adet',
    'medium',
    [220, 'Yuzeyak / genel saha markasi', 'Standart tarla sprinkler basligi'],
    [520, 'Rain Bird / Hunter giris', 'Daha dengeli dagitim'],
    [1200, 'Rain Bird / Hunter premium', 'Uzun omurlu nozul ve govde']
  ),
  'Lateral boru': makePriceRecord(
    'm',
    'medium',
    [18, 'Yerli PE', 'Standart yagmurlama lateral hattı'],
    [30, 'Firat / Dizayn', 'Kalın etli lateral'],
    [48, 'Wavin / GF / premium', 'Daha yuksek basinc sinifi']
  ),
  'Sprinkler baglanti aparati': makePriceRecord(
    'adet',
    'low',
    [80, 'Genel yerli', 'Dirsek-nipel baglanti seti'],
    [180, 'Firat / Poelsan', 'Daha saglam baglanti seti'],
    [320, 'Premium ithal', 'Paslanmaz / agir hizmet baglanti']
  ),
  'Vana kutusu': makePriceRecord(
    'adet',
    'low',
    [240, 'Genel yerli', 'Standart plastik kutu'],
    [560, 'Rain Bird / Hunter giris', 'UV dayanimli kutu'],
    [1180, 'Rain Bird / Hunter premium', 'Agir hizmet kutu']
  ),
  'Solenoid vana': makePriceRecord(
    'adet',
    'high',
    [3200, 'Yerli / genel marka', '24VAC temel solenoid vana'],
    [6200, 'Hunter / Rain Bird / Bermad giris', 'Dayanikli selenoid kontrol'],
    [11000, 'Bermad / Netafim premium', 'Akilli veya premium sulama vanasi']
  ),
  'Damla boru': makePriceRecord(
    'm',
    'medium',
    [3.2, 'Panplast / Tarimsan', 'Standart inline damla'],
    [5.6, 'Jain / Rivulis giris', 'Daha kalin etli damla'],
    [8.8, 'Netafim / Rivulis premium', 'Daha stabil akış ve UV dayanimi']
  ),
  'Sebze damla boru': makePriceRecord(
    'm',
    'medium',
    [2.4, 'Panplast / Tarimsan', 'Tek sezon veya ince etli tape'],
    [3.8, 'Jain / Rivulis', 'Orta et kalinligi'],
    [6.2, 'Netafim / premium tape', 'Agir saha sartlarina uygun']
  ),
  'Bahce damla boru': makePriceRecord(
    'm',
    'medium',
    [4.2, 'Panplast / Eurodrip giris', 'Standart cok yillik inline'],
    [8.2, 'Jain / Rivulis', 'PC veya kalin etli cok yillik'],
    [15.8, 'Netafim / premium', 'PC+AS / cok yillik ust segment']
  ),
  'Bag damla laterali': makePriceRecord(
    'm',
    'medium',
    [4.0, 'Panplast / Eurodrip giris', 'Bag icin ekonomik latera'],
    [7.8, 'Jain / Rivulis', 'Daha saglam cok yillik latera'],
    [14.9, 'Netafim premium', 'PC / premium bag laterali']
  ),
  'Kor (deliksiz) PE lateral': makePriceRecord(
    'm',
    'medium',
    [5.0, 'Genel yerli', 'Deliksiz PE lateral'],
    [8.8, 'Firat / Kuzeyboru', 'Kalın etli PE lateral'],
    [16.5, 'Premium PE100 RC', 'Uzun omurlu premium lateral']
  ),
  'Buton damlatici': makePriceRecord(
    'adet',
    'low',
    [4.0, 'Yerli / genel marka', 'Standart online damlatici'],
    [9.0, 'Netafim / Rivulis giris', 'Daha dengeli debi'],
    [18.0, 'Netafim / premium PC', 'Basinç ayarli premium buton']
  ),
  'Mikro-yagmurlama fiskiyesi': makePriceRecord(
    'adet',
    'medium',
    [18, 'Yerli / genel marka', 'Standart mikro sprinkler'],
    [45, 'Jain / Rivulis', 'Daha stabil dagitim'],
    [95, 'Netafim / Senninger', 'Reguleli premium mikro sprinkler']
  ),
  'Sanzimanli buyuk tabanca': makePriceRecord(
    'adet',
    'high',
    [4200, 'Yuzeyak / yerli', 'Giris sinifi tabanca'],
    [8200, 'DuCaR / orta-ust', 'Dayanikli sahada kullanilan orta sinif'],
    [18500, 'Nelson / Sime', 'Premium ithal tabanca']
  ),
  'Fiskiye baglanti aparati': makePriceRecord(
    'adet',
    'low',
    [70, 'Genel yerli', 'Basit baglanti seti'],
    [150, 'Firat / yerli premium', 'Saglam baglanti seti'],
    [280, 'Premium ithal', 'Daha uzun omurlu aparat']
  ),
  'Yuzey dagitim hatti': makePriceRecord(
    'm',
    'medium',
    [18, 'Yerli boru/hortum', 'Salma sulama dagitim hattı'],
    [32, 'Firat / dayanıklı PE', 'Daha kalin etli dagitim hatti'],
    [48, 'Premium saha hortumu', 'Agir hizmet dagitim hatti']
  ),
  'Yuzey kontrol vanasi': makePriceRecord(
    'adet',
    'medium',
    [700, 'Genel yerli', 'Manuel hat vanasi'],
    [1500, 'Armas / Dogus', 'Metal govde hat vanasi'],
    [2800, 'Bermad / premium', 'Dayanikli kontrol vanasi']
  ),
  'Manifold / kollektor': makePriceRecord(
    'adet',
    'medium',
    [1600, 'Yerli imalat', 'Standart dagitim kollektoru'],
    [3500, 'Firat / atelye premium', 'Daha saglam kollektor seti'],
    [7200, 'Paslanmaz / premium', 'Akis ve servis kolayligi yuksek kollektor']
  ),
  'Gubre tanki / venturi': makePriceRecord(
    'set',
    'medium',
    [2800, 'Yerli venturi set', 'Manuel venturi / tank'],
    [6500, 'Armas / Netafim giris', 'Daha duzenli gubreleme seti'],
    [17000, 'Netafim / Dosatron giris', 'Yuksek hassasiyetli set']
  ),
  'Servis vana grubu': makePriceRecord(
    'adet',
    'medium',
    [850, 'Yerli set', 'Servis vana + rakor seti'],
    [1800, 'Armas / Dogus', 'Metal destekli servis grubu'],
    [3200, 'Premium set', 'Dayanikli servis grubu']
  ),
  'Gubreleme unitesi': makePriceRecord(
    'set',
    'high',
    [4500, 'Venturi / yerli set', 'Temel manuel gubreleme'],
    [12000, 'Armas / Netafim giris', 'Yari otomatik gubreleme'],
    [45000, 'Netafim / Dosatron / premium', 'Akilli dozajlama ve sensorlu set']
  ),
  'Sira vanasi': makePriceRecord(
    'adet',
    'medium',
    [900, 'Yerli set', 'Standart sira vanasi'],
    [2000, 'Armas / Dogus', 'Daha saglam vana seti'],
    [3800, 'Premium vana', 'Uzaktan kontrole uygun vana']
  ),
  'Basinc regulasyon grubu': makePriceRecord(
    'set',
    'medium',
    [3500, 'Yerli set', 'Regulator + manometre seti'],
    [8500, 'Netafim / Senninger', 'Daha stabil basinc grubu'],
    [18000, 'Premium set', 'Yuksek hassasiyetli regülasyon']
  ),
  'Blok vana grubu': makePriceRecord(
    'adet',
    'medium',
    [1100, 'Yerli set', 'Blok ayirma seti'],
    [2400, 'Armas / Dogus', 'Metal govde grup'],
    [4500, 'Premium set', 'Uzun omurlu blok vanasi']
  ),
  'Kum filtre': makePriceRecord(
    'set',
    'high',
    [6500, 'Plas / yerli manuel', 'Manuel kum filtre seti'],
    [16000, 'Armas / metal govde', 'Metal govde yuksek debi seti'],
    [48000, 'Amiad / Azud / premium', 'Tam otomatik ters yikamali sistem baz']
  ),
  'Disk filtre': makePriceRecord(
    'set',
    'high',
    [3200, 'Yerli plastik', 'Manuel disk filtre'],
    [7200, 'Armas / yerli metal/plastik premium', 'Yari otomatik disk filtre'],
    [18000, 'Amiad / Azud', 'Premium disk filtre sistemi']
  ),
  'Kuresel vana': makePriceRecord(
    'adet',
    'medium',
    [450, 'Plastik / yerli', 'Standart manuel kuresel vana'],
    [950, 'Armas / Dogus', 'Daha saglam metal destekli vana'],
    [1800, 'Premium', 'Premium servis vanasi']
  ),
  'Kelebek vana': makePriceRecord(
    'adet',
    'medium',
    [1200, 'Yerli giris', 'Giris segment kelebek vana'],
    [3200, 'Armas / Dogus Vana', 'Pik dokum kelebek vana'],
    [6500, 'Bermad / premium', 'Paslanmaz disk premium vana']
  ),
  'Manometre': makePriceRecord(
    'adet',
    'low',
    [220, 'Genel yerli', 'Temel gliserinli manometre'],
    [480, 'Wika / Kael giris', 'Daha saglam manometre'],
    [900, 'Wika / premium', 'Paslanmaz premium manometre']
  ),
  'Basinc regulatoru': makePriceRecord(
    'adet',
    'medium',
    [1800, 'Genel yerli', 'Temel basinc dusurucu'],
    [4200, 'Netafim / Senninger', 'Daha stabil basinç regulasyonu'],
    [9800, 'Bermad / premium', 'Yuksek hassasiyetli PRV']
  ),
  'Debimetre': makePriceRecord(
    'adet',
    'high',
    [2500, 'Mekanik sayaç', 'Pervaneli mekanik sayaç'],
    [6500, 'Woltman / yerli premium', 'Woltman tip mekanik sayaç'],
    [18000, 'Ultrasonik premium', 'Dijital cikisli ultrasonik debimetre']
  ),
  'Ana salter / giris izolasyonu': makePriceRecord(
    'adet',
    'medium',
    [1800, 'Chint / Sigma', 'Temel ana salter'],
    [3200, 'Siemens / Schneider Easy', 'Daha uzun omurlu salter'],
    [6200, 'ABB / Schneider TeSys', 'Premium giris izolasyonu']
  ),
  'Motor koruma salteri (tms)': makePriceRecord(
    'adet',
    'medium',
    [1300, 'Chint / Sigma', 'Temel TMS'],
    [2400, 'Siemens / Schneider', 'Daha kararlı TMS'],
    [4500, 'ABB / Eaton', 'Premium motor koruma']
  ),
  'Faz koruma rolesi': makePriceRecord(
    'adet',
    'medium',
    [900, 'Genel yerli', 'Temel faz koruma'],
    [1800, 'Entes / Kael', 'Daha guvenli faz koruma'],
    [3200, 'Lovato / ABB', 'Premium faz ve gerilim koruma']
  ),
  'Kacak akim koruma rolesi (rcd/rccb)': makePriceRecord(
    'adet',
    'medium',
    [1200, 'Sigma / Chint', 'Temel RCD'],
    [2200, 'Siemens / Schneider', 'Daha iyi kesme kapasitesi'],
    [4200, 'ABB / Eaton', 'Premium RCCB']
  ),
  'Klemens / kablo pabucu seti': makePriceRecord(
    'set',
    'low',
    [350, 'Genel yerli', 'Temel baglanti sarfi'],
    [900, 'Weidmuller / Klemsan', 'Daha kaliteli terminal seti'],
    [1800, 'Premium', 'Premium baglanti sarfi']
  ),
  'Topraklama paketi': makePriceRecord(
    'set',
    'medium',
    [3500, 'Yerli set', 'Bakir kapli cubuk + bar seti'],
    [6500, 'OBO / nitelikli yerli', 'Daha guvenli topraklama seti'],
    [12000, 'OBO / DEHN / premium', 'Premium topraklama ve SPD uyumlu set']
  ),
  'Solar panel': makePriceRecord(
    'W',
    'high',
    [9.8, 'Lexron / Tommatech / giris', 'Mono-PERC giris sinifi panel'],
    [11.8, 'HT Solar / CW Enerji / Smart Solar', 'Tier-1 mono half-cut / TOPCon giris'],
    [14.5, 'Jinko / Trina / Panasonic', 'N-Type TOPCon bifacial premium']
  ),
  'Solar pompa inverteri': makePriceRecord(
    'kW',
    'high',
    [2200, 'Mexxsun / Frecon / Tescom', 'Ekonomik solar pompa surucusu'],
    [3400, 'INVT / Tommatech', 'Daha yuksek MPPT verimi'],
    [5900, 'Huawei / SMA / ABB', 'Premium uzaktan izlenebilir surucu']
  ),
  'Solar DC kablo': makePriceRecord(
    'm',
    'medium',
    [35, 'Genel PV1-F', 'Standart UV dayanimli DC kablo'],
    [55, 'H1Z2Z2-K / orta segment', 'Daha yuksek UV ve sicaklik dayanimli'],
    [85, 'Premium PV kablo', 'Uzun omurlu premium kablo']
  ),
  'DC koruma ekipmanlari': makePriceRecord(
    'set',
    'medium',
    [2200, 'Genel yerli', 'String sigorta + SPD temel set'],
    [4500, 'Noark / Tomzn / orta segment', 'Daha guvenli DC koruma'],
    [8500, 'Phoenix / Citel / ABB', 'Premium DC koruma seti']
  ),
  'Panel tasiyici konstruksiyon': makePriceRecord(
    'kWp',
    'medium',
    [3800, 'Standart galvaniz', '1.5-2.0 mm saha konstruksiyonu'],
    [5500, 'Sicak daldirma galvaniz', '2.5 mm dayanikli konstruksiyon'],
    [8200, 'Aluminyum + premium celik', 'Premium korozyon dayanimli konstruksiyon']
  ),
  'Hibrit kontrol unitesi': makePriceRecord(
    'adet',
    'high',
    [12000, 'Genel hibrit kontrol', 'Temel grid-solar transfer unitesi'],
    [22000, 'Tommatech / INVT uyumlu', 'Daha stabil hibrit kontrol'],
    [42000, 'Huawei / premium', 'Premium akilli hibrit kontrol']
  ),
  'Enerji izleme modulu': makePriceRecord(
    'adet',
    'medium',
    [3500, 'Genel yerli', 'Temel enerji izleme modulu'],
    [7500, 'Tommatech / INVT', 'Bulut izleme destekli'],
    [15000, 'Huawei / SMA', 'Premium uzaktan izleme']
  ),
  'Ana Dagitim Panosu (ADP)': makePriceRecord(
    'adet',
    'high',
    [12000, 'Yerli pano + Chint/Sigma', 'Temel ADP'],
    [22000, 'Siemens / Schneider tabanli', 'Daha guvenli saha panosu'],
    [42000, 'ABB / Schneider premium', 'Premium haberlesmeli ADP']
  ),
  'Pompa panosu': makePriceRecord(
    'adet',
    'high',
    [8500, 'Yerli pano', 'Temel motor kontrol panosu'],
    [14000, 'Siemens / Schneider giris', 'Daha uzun omurlu pano'],
    [26000, 'ABB / premium', 'Premium korumali pano']
  ),
  'Kontaktor': makePriceRecord(
    'adet',
    'medium',
    [850, 'Chint / Sigma', 'Temel kontaktor'],
    [1800, 'Siemens / Schneider', 'Daha iyi kontaktor'],
    [3400, 'ABB / Eaton', 'Premium kontaktor']
  ),
  'Termik role': makePriceRecord(
    'adet',
    'medium',
    [650, 'Chint / Sigma', 'Temel termik role'],
    [1400, 'Siemens / Schneider', 'Daha uzun omurlu role'],
    [2600, 'ABB / Eaton', 'Premium termik role']
  ),
  'NH sigorta seti': makePriceRecord(
    'set',
    'medium',
    [2200, 'Genel yerli', 'Temel NH sigorta seti'],
    [4200, 'Siemens / Schneider', 'Daha guvenli sigorta seti'],
    [7800, 'ABB / Mersen', 'Premium NH set']
  ),
  'Kablo kanali / boru korumasi': makePriceRecord(
    'm',
    'medium',
    [80, 'Yerli HDPE / kanal', 'Standart kablo koruma'],
    [140, 'Galvaniz / kalin etli HDPE', 'Daha dayanikli koruma'],
    [240, 'Premium kanal / boru', 'Agir hizmet koruma']
  ),
  'Sebeke baglanti sigortasi': makePriceRecord(
    'set',
    'medium',
    [1500, 'Genel yerli', 'Temel grid koruma seti'],
    [3000, 'Siemens / Schneider', 'Daha guvenli giris koruma'],
    [5600, 'ABB / Eaton', 'Premium grid giris koruma']
  ),
  'Depo': makePriceRecord(
    'm3',
    'high',
    [4000, 'Plastik / polyester', 'Ekonomik yatay-dikey depo'],
    [6500, 'Galvaniz moduler', 'Daha uzun omurlu moduler depo'],
    [12000, 'Paslanmaz moduler', 'Premium paslanmaz hijyenik depo']
  ),
  'Samandira': makePriceRecord(
    'adet',
    'low',
    [450, 'Genel yerli', 'Mekanik samandira'],
    [900, 'Itimat / orta segment', 'Daha dayanikli samandira'],
    [1800, 'Premium', 'Paslanmaz veya premium set']
  ),
  'Seviye sensoru': makePriceRecord(
    'adet',
    'medium',
    [1200, 'Genel yerli', 'Temel seviye sensoru'],
    [2500, 'Kael / Entes / orta segment', 'Daha guvenli depo sensoru'],
    [5600, 'IFM / premium', 'Premium izleme sensoru']
  ),
  'Otomasyon': makePriceRecord(
    'set',
    'high',
    [8500, 'Zaman roleli temel set', 'Temel otomasyon'],
    [18000, 'Zamanlayici + vana kontrol', 'Yari otomatik sistem'],
    [65000, 'Akilli dozajlama + sensor + uzaktan izleme', 'Tam otomasyonlu premium set']
  ),
  'Zon vanasi': makePriceRecord(
    'adet',
    'high',
    [450, 'Manuel vana', 'Ekonomik zon ayirma vanasi'],
    [1200, 'Metal govde vana', 'Daha uzun omurlu zon vanasi'],
    [3500, 'Solenoid vana', '24VAC otomasyonlu zon vanasi']
  ),
  'Zon kollektoru': makePriceRecord(
    'set',
    'medium',
    [2800, 'Yerli imalat', 'Temel zon kollektoru'],
    [5500, 'Daha saglam manifold seti', 'Metal destekli zon kollektoru'],
    [9800, 'Premium set', 'Paslanmaz / premium kollektoru']
  )
};

(function addDynamicPriceData(){
  const hdpeTable = {
    32:[12,20,32],
    40:[15,24,38],
    50:[22,34,50],
    63:[30,48,72],
    75:[40,67,100],
    90:[58,95,145],
    110:[80,130,200],
    125:[108,170,255],
    140:[138,215,320],
    160:[175,275,410],
    180:[220,340,500],
    200:[270,410,610],
    225:[338,510,750]
  };
  const pvcTable = {
    32:[10,16,24],
    40:[12,18,28],
    50:[18,28,42],
    63:[26,40,60],
    75:[34,52,78],
    90:[45,68,102],
    110:[60,92,138],
    125:[78,118,176],
    140:[98,148,220],
    160:[130,190,285],
    180:[165,235,350],
    200:[210,295,430],
    225:[265,365,520]
  };
  const mainCableTable = {
    '4x6':[70,108,138],
    '4x10':[112,138,192],
    '4x16':[131,156,282],
    '4x25':[203,239,444],
    '4x35':[245,279,547],
    '4x50':[332,380,734]
  };
  const pumpCableTable = {
    '3x2.5':[35,50,75],
    '3x4':[50,72,107],
    '3x6':[62,89,138],
    '3x10':[90,128,192],
    '3x16':[132,156,283],
    '3x25':[203,239,444]
  };

  Object.keys(hdpeTable).forEach(function(size){
    const row = hdpeTable[size];
    FIYAT_DATA_DETAYLI['HDPE ana boru DN'+size] = makePriceRecord(
      'm',
      'medium',
      [row[0], 'Poelsan/Erhas/Plas', 'PE100 giris / PN6-8'],
      [row[1], 'Kuzeyboru/Firat/Dizayn', 'Orijinal PE100 / PN10'],
      [row[2], 'Wavin/Pipelife/GF', 'PE100 RC / PN16']
    );
  });

  Object.keys(pvcTable).forEach(function(size){
    const row = pvcTable[size];
    FIYAT_DATA_DETAYLI['PVC alternatif DN'+size] = makePriceRecord(
      'm',
      'medium',
      [row[0], 'Yerli PVC giris', 'Standart saha tipi PVC'],
      [row[1], 'Firat / Dizayn', 'Kaliteli PVC basinc borusu'],
      [row[2], 'Premium PVC / ithal', 'Daha yuksek basinç sinifi']
    );
  });

  Object.keys(mainCableTable).forEach(function(size){
    const row = mainCableTable[size];
    FIYAT_DATA_DETAYLI['Ana kolon kablosu '+size] = makePriceRecord(
      'm',
      'high',
      [row[0], 'Oznur / HES', 'NYY / NAYY saha kablosu'],
      [row[1], 'HES / Oznur premium', 'Daha dengeli iletken kalite'],
      [row[2], 'Prysmian / LSZH premium', 'N2XH / premium iletken']
    );
  });

  Object.keys(pumpCableTable).forEach(function(size){
    const row = pumpCableTable[size];
    FIYAT_DATA_DETAYLI['Dalgic pompa kolon kablosu '+size] = makePriceRecord(
      'm',
      'high',
      [row[0], 'TTR / yerli standart', 'Temel kuyu ici kablo'],
      [row[1], 'Oznur / HES / Nexans', 'Daha saglam kolon kablosu'],
      [row[2], 'Prysmian / H07RN-F', 'Kauçuk / premium dalgic kablo']
    );
  });
})();

const YATIRIM_INFO_ONLY_PATTERNS = [
  /^nozul capi$/,
  /^damlatici araligi$/,
  /^bitki basina damlatici$/,
  /^lateral sayisi$/,
  /^damlatici sayisi$/,
  /^pompa dis payi$/,
  /^bitki basina buton damlatici$/
];

function normalizePriceText(value){
  return String(value == null ? '' : value)
    .toLowerCase()
    .replace(/[ç]/g,'c')
    .replace(/[ğ]/g,'g')
    .replace(/[ı]/g,'i')
    .replace(/[ö]/g,'o')
    .replace(/[ş]/g,'s')
    .replace(/[ü]/g,'u')
    .replace(/[â]/g,'a')
    .replace(/[î]/g,'i')
    .replace(/[û]/g,'u')
    .replace(/[×]/g,'x')
    .replace(/[–—]/g,'-')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function parseBomQuantity(raw){
  const text = String(raw == null ? '' : raw).replace(/\s+/g,' ').trim();
  const match = text.match(/-?\d+(?:[.,]\d+)?/);
  if(!match) return 0;
  return parseFloat(match[0].replace(',','.')) || 0;
}

function getInvestmentProfile(){
  const hasCost = typeof isMaliyetMode === 'function' && isMaliyetMode();
  const hasLong = typeof isUzunOmurMode === 'function' && isUzunOmurMode();
  const hasEff = typeof isVerimliMode === 'function' && isVerimliMode();
  if(hasCost) return YATIRIM_PROFILLERI.maliyet;
  if(hasLong && hasEff) return YATIRIM_PROFILLERI.karma;
  if(hasEff) return YATIRIM_PROFILLERI.verimli;
  return YATIRIM_PROFILLERI.uzunomur;
}

function resolveInvestmentSegment(item, profile){
  if(!profile || profile.id === 'maliyet' || profile.id === 'uzunomur' || profile.id === 'verimli'){
    return profile ? profile.id : 'uzunomur';
  }
  const cat = normalizePriceText(item && item.category);
  if(cat === 'elektrik ve enerji' || cat === 'sulama dagitim sistemi' || cat === 'opsiyonel ekipmanlar'){
    return 'verimli';
  }
  return 'uzunomur';
}

function parseCableSectionToken(source, coreCount){
  const text = normalizePriceText(source);
  const regex = new RegExp(coreCount + '\\s*x\\s*(\\d+)', 'i');
  const match = text.match(regex);
  if(!match) return '';
  return coreCount + 'x' + match[1];
}

function isInfoOnlyMaterial(material){
  const normalized = normalizePriceText(material);
  return YATIRIM_INFO_ONLY_PATTERNS.some(function(pattern){ return pattern.test(normalized); });
}

function resolveInvestmentKey(item){
  const materialRaw = String(item && item.material || '');
  const noteRaw = String(item && item.note || '');
  const material = normalizePriceText(materialRaw);

  if(!material || isInfoOnlyMaterial(materialRaw)) return null;

  let match = material.match(/^hdpe ana boru(?: dn)? (\d+)/);
  if(match) return 'HDPE ana boru DN' + match[1];

  match = material.match(/^pvc alternatif(?: dn)? (\d+)/);
  if(match) return 'PVC alternatif DN' + match[1];

  if(material.indexOf('ana kolon kablosu') === 0){
    const mainSection = parseCableSectionToken(materialRaw, 4);
    return mainSection ? 'Ana kolon kablosu ' + mainSection : 'Ana kolon kablosu 4x16';
  }

  if(material.indexOf('kolon enerji kablosu') === 0){
    const section = parseCableSectionToken(noteRaw || materialRaw, 4) || parseCableSectionToken(materialRaw, 4);
    return section ? 'Ana kolon kablosu ' + section : 'Ana kolon kablosu 4x10';
  }

  if(material === 'dalgic pompa kolon kablosu'){
    const section = parseCableSectionToken(noteRaw || materialRaw, 3);
    return section ? 'Dalgic pompa kolon kablosu ' + section : 'Dalgic pompa kolon kablosu 3x6';
  }

  const aliasMap = [
    ['dalgic pompa','Dalgic pompa'],
    ['check valve cekvalf','Check valve (cekvalf)'],
    ['kuru calisma koruma','Kuru calisma koruma'],
    ['seviye elektrodu','Seviye elektrodu'],
    ['dirsek','Dirsek'],
    ['t parcasi','T parcasi'],
    ['reduksiyon','Reduksiyon'],
    ['rakor','Rakor'],
    ['flans','Flans'],
    ['sprinkler baglanti aparati','Sprinkler baglanti aparati'],
    ['fiskiye baglanti aparati','Fiskiye baglanti aparati'],
    ['peyzaj sprinkler basligi','Sprinkler basligi'],
    ['sprinkler','Sprinkler basligi'],
    ['lateral boru','Lateral boru'],
    ['vana kutusu','Vana kutusu'],
    ['solenoid vana','Solenoid vana'],
    ['bahce damla boru','Bahce damla boru'],
    ['bag damla laterali','Bag damla laterali'],
    ['sebze damla boru','Sebze damla boru'],
    ['ozel duzen damla hatti','Damla boru'],
    ['damla boru','Damla boru'],
    ['kor deliksiz pe lateral','Kor (deliksiz) PE lateral'],
    ['buton damlatici online basinc ayarli','Buton damlatici'],
    ['buton damlatici','Buton damlatici'],
    ['agac alti mikro yagmurlama fiskiyesi','Mikro-yagmurlama fiskiyesi'],
    ['asma alti mikro yagmurlama fiskiyesi','Mikro-yagmurlama fiskiyesi'],
    ['seyrek bahce mikro yagmurlama fiskiyesi','Mikro-yagmurlama fiskiyesi'],
    ['mikro yagmurlama','Mikro-yagmurlama fiskiyesi'],
    ['sanzimanli buyuk tabanca','Sanzimanli buyuk tabanca'],
    ['yuzey dagitim hatti','Yuzey dagitim hatti'],
    ['yuzey kontrol vanasi','Yuzey kontrol vanasi'],
    ['manifold kollektor','Manifold / kollektor'],
    ['gubre tanki venturi','Gubre tanki / venturi'],
    ['servis vana grubu','Servis vana grubu'],
    ['gubreleme unitesi','Gubreleme unitesi'],
    ['sira vanasi','Sira vanasi'],
    ['basinc regulasyon grubu','Basinc regulasyon grubu'],
    ['blok vana grubu','Blok vana grubu'],
    ['kum filtre','Kum filtre'],
    ['disk filtre','Disk filtre'],
    ['kuresel vana','Kuresel vana'],
    ['kelebek vana','Kelebek vana'],
    ['manometre','Manometre'],
    ['basinc regulatoru','Basinc regulatoru'],
    ['debimetre','Debimetre'],
    ['ana salter giris izolasyonu','Ana salter / giris izolasyonu'],
    ['motor koruma salteri tms','Motor koruma salteri (tms)'],
    ['faz koruma rolesi','Faz koruma rolesi'],
    ['kacak akim koruma rolesi rcd rccb','Kacak akim koruma rolesi (rcd/rccb)'],
    ['klemens kablo pabucu seti','Klemens / kablo pabucu seti'],
    ['topraklama paketi zorunlu','Topraklama paketi'],
    ['solar panel','Solar panel'],
    ['solar pompa inverteri','Solar pompa inverteri'],
    ['solar dc kablo','Solar DC kablo'],
    ['dc koruma ekipmanlari string sigorta parafudr','DC koruma ekipmanlari'],
    ['panel tasiyici konstruksiyon','Panel tasiyici konstruksiyon'],
    ['hibrit kontrol unitesi','Hibrit kontrol unitesi'],
    ['enerji izleme modulu','Enerji izleme modulu'],
    ['ana dagitim panosu adp','Ana Dagitim Panosu (ADP)'],
    ['pompa panosu','Pompa panosu'],
    ['kontaktor','Kontaktor'],
    ['termik role','Termik role'],
    ['nh sigorta seti giris motor','NH sigorta seti'],
    ['kablo kanali boru korumasi','Kablo kanali / boru korumasi'],
    ['sebeke baglanti sigortasi','Sebeke baglanti sigortasi'],
    ['depo','Depo'],
    ['samandira','Samandira'],
    ['seviye sensoru','Seviye sensoru'],
    ['otomasyon','Otomasyon'],
    ['zon vanasi','Zon vanasi'],
    ['zon kollektoru','Zon kollektoru']
  ];

  for(let i=0;i<aliasMap.length;i++){
    const alias = aliasMap[i][0];
    const key = aliasMap[i][1];
    if(material.indexOf(alias) !== -1) return key;
  }

  return null;
}

function resolveInvestmentQuantity(key, item, scenario){
  const count = parseBomQuantity(item && item.quantity);
  if(!(count > 0)) return 0;
  if(key === 'Dalgic pompa'){
    return Math.max(1, Number(scenario && scenario.secPompGuc) || 0) * count;
  }
  if(key === 'Solar panel'){
    return Math.max(0, Math.round((Number(scenario && scenario.totKwp) || 0) * 1000));
  }
  if(key === 'Solar pompa inverteri'){
    return (Number(scenario && scenario.invKW) || Number(scenario && scenario.secPompGuc) || 0) * count;
  }
  if(key === 'Panel tasiyici konstruksiyon'){
    return (Number(scenario && scenario.totKwp) || 0) * count;
  }
  if(key === 'Depo'){
    return count;
  }
  return count;
}

function resolveInvestmentMultiplier(key, item, scenario){
  const flow = Number(scenario && scenario.saatlikSis) || 0;
  const pumpKw = Number(scenario && scenario.secPompGuc) || 0;
  const boreMm = Number(scenario && scenario.boru && scenario.boru.d_mm) || 0;

  if(key === 'Kum filtre' || key === 'Disk filtre' || key === 'Debimetre'){
    return Math.min(2.4, Math.max(0.75, flow / 22 || 1));
  }
  if(key === 'Basinc regulatoru' || key === 'Basinc regulasyon grubu'){
    return Math.min(1.8, Math.max(0.9, (Number(scenario && scenario.hatBasiBar) || 3) / 3));
  }
  if(key === 'Kelebek vana'){
    if(boreMm >= 160) return 1.45;
    if(boreMm >= 110) return 1.15;
    return 0.9;
  }
  if(key === 'Kuresel vana'){
    if(boreMm >= 110) return 1.2;
  }
  if(key === 'Ana Dagitim Panosu (ADP)' || key === 'Pompa panosu' || key === 'Motor koruma salteri (tms)' || key === 'Kontaktor' || key === 'Termik role' || key === 'NH sigorta seti'){
    return Math.min(2.6, Math.max(0.85, pumpKw / 7.5 || 1));
  }
  return 1;
}

function resolveVolatilityRange(record, item){
  const base = {
    low: { low: 0.95, high: 1.07 },
    medium: { low: 0.92, high: 1.11 },
    high: { low: 0.88, high: 1.18 }
  }[record && record.volatility || 'medium'] || { low: 0.92, high: 1.11 };
  let low = base.low;
  let high = base.high;
  if(item && item.approx){
    low -= 0.02;
    high += 0.04;
  }
  if(item && item.survey){
    low -= 0.04;
    high += 0.08;
  }
  return {
    low: Math.max(0.72, low),
    high: Math.max(1.02, high)
  };
}

function roundInvestmentValue(value){
  const amount = Number(value) || 0;
  if(amount >= 1000000) return Math.round(amount / 10000) * 10000;
  if(amount >= 250000) return Math.round(amount / 5000) * 5000;
  if(amount >= 50000) return Math.round(amount / 2500) * 2500;
  return Math.round(amount / 1000) * 1000;
}

function roundDisplayInvestmentValue(value){
  const amount = Number(value) || 0;
  if(amount >= 200000) return Math.round(amount / 10000) * 10000;
  if(amount >= 50000) return Math.round(amount / 5000) * 5000;
  return Math.round(amount / 1000) * 1000;
}

function formatInvestmentTl(value){
  return Math.round(Number(value) || 0).toLocaleString('tr-TR') + ' TL';
}

function formatInvestmentRange(low, high){
  const lo = roundInvestmentValue(low);
  const hi = roundInvestmentValue(Math.max(high, low));
  if(!(lo > 0) && !(hi > 0)) return 'Kesif sonrasi netlesir';
  if(Math.abs(hi - lo) <= Math.max(5000, lo * 0.04)){
    return '~ ' + formatInvestmentTl((lo + hi) / 2);
  }
  return formatInvestmentTl(lo) + ' - ' + formatInvestmentTl(hi);
}

function getSeasonMonthsForInvestment(){
  const selected = (typeof getSelectedProduct === 'function' ? getSelectedProduct() : null) || PRODUCT_LIBRARY[S.urunTip] || BITKI[S.urunTip];
  const sezon = Number(selected && selected.sezon) || 4;
  return Math.max(2.5, sezon);
}

function isPaybackEnergyItem(item){
  const material = normalizePriceText(item && item.material);
  if(!material) return false;
  return material === 'solar panel' ||
    material === 'solar pompa inverteri' ||
    material === 'solar dc kablo' ||
    material.indexOf('dc koruma ekipmanlari') === 0 ||
    material === 'panel tasiyici konstruksiyon' ||
    material === 'hibrit kontrol unitesi' ||
    material === 'enerji izleme modulu';
}

function buildPaybackModel(scenario, energyLow, energyHigh){
  const systemPref = String(S.sistemTercih || '').toLowerCase();
  if(systemPref === 'sebeke'){
    return {
      available: false,
      title: 'Enerji yatiriminin geri donusu',
      body: 'Sadece sebeke senaryosunda sahada enerji uretimi olmadigi icin geri donus suresi hesaplanmadi.'
    };
  }
  if(!(energyLow > 0) || !(energyHigh > 0)){
    return {
      available: false,
      title: 'Enerji yatiriminin geri donusu',
      body: 'Geri donus hesabi icin ayristirilabilir gunes / hibrit enerji paketi bulunamadi.'
    };
  }

  const seasonMonths = getSeasonMonthsForInvestment();
  const seasonDays = Math.max(75, Math.round(seasonMonths * 30));
  const pumpKw = Math.max(0, Number(scenario && scenario.secPompGuc) || 0) * Math.max(1, Number(scenario && scenario.nKuyu) || 1);
  const hoursPerDay = Math.max(1, Number(scenario && scenario.sSure) || Number(S.calismaSure) || 8);
  const annualKwh = pumpKw * hoursPerDay * seasonDays;
  if(!(annualKwh > 0)){
    return {
      available: false,
      title: 'Enerji yatiriminin geri donusu',
      body: 'Yillik enerji tuketimi yeterli olcumde hesaplanamadigi icin amortisman suresi olusturulamadi.'
    };
  }

  let solarShareLow = 0.45;
  let solarShareHigh = 0.72;
  let shareNote = 'Hibrit sistemde gun ici yuk paylasimi icin yaklasik %45-%72 gunes karsilama payi kabul edildi.';
  if(systemPref === 'solar' || systemPref === 'gunes'){
    solarShareLow = 0.82;
    solarShareHigh = 0.97;
    shareNote = 'Sadece gunes senaryosunda saha ve hava kosullarina gore yaklasik %82-%97 net enerji karsilama payi kabul edildi.';
  }

  const annualSaveLow = annualKwh * YATIRIM_REFERANS_2026.electricTariffTlKwh * solarShareLow;
  const annualSaveHigh = annualKwh * YATIRIM_REFERANS_2026.electricTariffTlKwh * solarShareHigh;
  if(!(annualSaveLow > 0) || !(annualSaveHigh > 0)){
    return {
      available: false,
      title: 'Enerji yatiriminin geri donusu',
      body: 'Enerji tasarrufu bandi olusturulamadi.'
    };
  }

  const yearsLow = energyLow / annualSaveHigh;
  const yearsHigh = energyHigh / annualSaveLow;
  const seasonLow = yearsLow * 12 / seasonMonths;
  const seasonHigh = yearsHigh * 12 / seasonMonths;
  const basisText = formatInvestmentRange(energyLow, energyHigh);

  return {
    available: true,
    title: 'Enerji yatiriminin geri donusu',
    yearsLow: Math.max(0.6, yearsLow),
    yearsHigh: Math.max(yearsLow, yearsHigh),
    seasonLow: Math.max(1, seasonLow),
    seasonHigh: Math.max(seasonLow, seasonHigh),
    annualSaveLow: annualSaveLow,
    annualSaveHigh: annualSaveHigh,
    annualKwh: annualKwh,
    basisLow: roundInvestmentValue(energyLow),
    basisHigh: roundInvestmentValue(energyHigh),
    basisText: basisText,
    note: 'Bu sure toplam sulama altyapisinin degil, yalniz gunes / hibrit enerji paketinin yaklasik geri donusudur. ' + shareNote + ' Elektrik birim maliyeti icin 04 Nisan 2026 donemi tarimsal sulama tarifesi (~4,37 TL/kWh, vergi haric) referans alindi.'
  };
}

function buildInvestmentConfidence(summary, coverage){
  let level = 'medium';
  let badge = 'On kesif seviyesi';
  let text = 'BOM kalemlerinin buyuk kismi fiyatlandi; marka tercihi ve saha kosullari ust bandi etkiler.';

  if(coverage >= 0.92 && !summary.unpricedCore.length){
    level = 'high';
    badge = '2026 piyasa ortalamasi';
    text = 'Ana sistem kalemleri fiyatlandigi icin son kullaniciya guvenli bir aralik verilebilir.';
  } else if(coverage < 0.8 || summary.unpricedCore.length >= 3){
    level = 'low';
    badge = 'Saha teyidi agirlikli';
    text = 'Bir kisim temel kalem marka veya cap secimine gore genis bandda kaldigi icin aralik korumali tutuldu.';
  }

  return {
    level: level,
    badge: badge,
    text: text,
    coveragePct: Math.round((coverage || 0) * 100)
  };
}

function calculateInvestmentLine(item, scenario, profile){
  if(!item || isInfoOnlyMaterial(item.material)) return { status:'info' };

  const key = resolveInvestmentKey(item);
  if(!key) return { status:'info' };

  const record = FIYAT_DATA_DETAYLI[key];
  if(!record) return {
    status:'unpriced',
    key:key,
    optional:!!item.optional
  };

  const segment = resolveInvestmentSegment(item, profile);
  const tier = record[segment];
  if(!tier || !(tier.fiyat > 0)) return {
    status:'unpriced',
    key:key,
    optional:!!item.optional
  };

  const quantity = resolveInvestmentQuantity(key, item, scenario);
  if(!(quantity > 0)) return { status:'info' };

  const multiplier = resolveInvestmentMultiplier(key, item, scenario);
  const baseTotal = tier.fiyat * quantity * multiplier;
  const band = resolveVolatilityRange(record, item);

  return {
    status:'priced',
    key:key,
    record:record,
    segment:segment,
    optional:!!item.optional,
    quantity:quantity,
    total:baseTotal,
    low:baseTotal * band.low,
    high:baseTotal * band.high
  };
}

function buildInvestmentModel(selectedBom, selectedScenario){
  const profile = getInvestmentProfile();
  if(!selectedBom || !selectedScenario || !selectedBom.groups){
    return {
      available: false,
      profile: profile,
      title: 'Yaklasik toplam yatirim bedeli',
      rangeText: 'Kesif sonrasi netlesir',
      centerText: 'Hesap icin secili senaryo bulunamadi.',
      totalInvestmentText: 'Kesif sonrasi netlesir',
      disclaimer: 'Tahmini maliyet icin secili BOM olusmadi.'
    };
  }

  const summary = {
    coreNet: 0,
    coreLow: 0,
    coreHigh: 0,
    optionalNet: 0,
    optionalLow: 0,
    optionalHigh: 0,
    paybackNet: 0,
    paybackLow: 0,
    paybackHigh: 0,
    priceable: 0,
    priced: 0,
    infoOnly: 0,
    unpricedCore: [],
    unpricedOptional: []
  };

  selectedBom.groups.forEach(function(group){
    (group.items || []).forEach(function(item){
      const line = calculateInvestmentLine(item, selectedScenario, profile);
      if(line.status === 'info'){
        summary.infoOnly++;
        return;
      }
      summary.priceable++;
      if(line.status !== 'priced'){
        if(line.optional) summary.unpricedOptional.push(item.material);
        else summary.unpricedCore.push(item.material);
        return;
      }
      summary.priced++;
      if(line.optional){
        summary.optionalNet += line.total;
        summary.optionalLow += line.low;
        summary.optionalHigh += line.high;
      } else {
        summary.coreNet += line.total;
        summary.coreLow += line.low;
        summary.coreHigh += line.high;
        if(isPaybackEnergyItem(item)){
          summary.paybackNet += line.total;
          summary.paybackLow += line.low;
          summary.paybackHigh += line.high;
        }
      }
    });
  });

  const coverage = summary.priceable ? (summary.priced / summary.priceable) : 0;
  const confidence = buildInvestmentConfidence(summary, coverage);
  // FIX: Maliyet motoru — band ve merkez tutarlı olmalı
  // displayLow/High: zorunlu malzeme bandı (opsiyonel dahil değil — kullanıcı seçmeyebilir)
  const displayLow  = roundInvestmentValue(summary.coreLow);
  const displayHigh = roundInvestmentValue(summary.coreHigh);
  // displayCenter: gerçek hesaplama merkezi (coreNet) + opsiyonelin küçük payı (%15)
  // Eski mantık optionalHigh'ı banda, optionalNet*0.35'i merkeze katıyordu → tutarsızlık ve şişme
  const displayCenter = roundInvestmentValue(summary.coreNet + (summary.optionalNet * 0.15));
  const payback = buildPaybackModel(selectedScenario, summary.paybackLow, summary.paybackHigh);
  const optionalUpper = summary.optionalHigh > 0;
  const rangeText = formatInvestmentRange(displayLow, displayHigh);
  // totalInvestment: coreNet merkez bazlı — band ortalaması değil, gerçek hesaplama değeri
  const materialRangeCenter = roundDisplayInvestmentValue(displayCenter);
  const totalInvestment = roundDisplayInvestmentValue(materialRangeCenter * (1 + YATIRIM_EK_GIDER_CARPANI));

  return {
    available: true,
    profile: profile,
    confidence: confidence,
    coreLow: displayLow,
    coreHigh: roundInvestmentValue(summary.coreHigh),
    optionalHigh: roundInvestmentValue(summary.optionalHigh),
    totalLow: displayLow,
    totalHigh: displayHigh,
    totalCenter: displayCenter,
    rangeText: rangeText,
    centerText: '~ ' + formatInvestmentTl(displayCenter),
    shortText: formatInvestmentTl(totalInvestment),
    materialRangeText: rangeText,
    materialCenter: materialRangeCenter,
    materialCenterText: '~ ' + formatInvestmentTl(materialRangeCenter),
    supplementaryCostFactor: YATIRIM_EK_GIDER_CARPANI,
    totalInvestment: totalInvestment,
    totalInvestmentText: formatInvestmentTl(totalInvestment),
    totalNote: 'Toplam yatirim, merkez malzeme maliyetine ek olarak kurulum, iscilik, montaj, kucuk nakliye, baglanti ve benzeri saha giderleri icin varsayilan %85 tamamlayici gider etkisi ile olusturuldu.',
    coverageText: confidence.coveragePct + '% fiyat kapsami',
    matchedText: summary.priced + '/' + summary.priceable + ' fiyatli kalem',
    optionalUpper: optionalUpper,
    optionalText: optionalUpper
      ? 'Merkez malzeme bazina, sahada secilebilecek opsiyonel otomasyon, gubreleme ve ek kontrol kalemlerinin piyasa etkisi de yedirildi.'
      : 'Toplam tutar, secili sistemin zorunlu ve tavsiye edilen ana kalemleri uzerinden olusturuldu.',
    payback: payback,
    paybackBasisText: payback && payback.basisText ? payback.basisText : '',
    unpricedCore: summary.unpricedCore.slice(0,6),
    disclaimer: 'Tahmini maliyet sadece sistem kurulumu ve icerdigi malzemelerin 2026 ortalama piyasa maliyetidir; herhangi bir fiyat taahhudu veya soz verme niteliginde degildir. Bolgeden bolgeye, marka secimine, doviz kuruna ve saha montaj kosullarina gore ciddi fark olusabilir.',
    excludeText: 'Sondaj, resmi izinler, trafo kurulus bedeli, saha beton/insaat imalatlari ve beklenmeyen altyapi giderleri bu hesapta ayrica degisken kabul edilmistir. Kurulum, iscilik, baglanti ve kucuk lojistik etkisi toplam tutara yaklasik katsayi ile yedirilmistir.'
  };
}
