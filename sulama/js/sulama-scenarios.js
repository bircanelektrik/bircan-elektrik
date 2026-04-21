/* sulama-scenarios.js — Senaryo üretimi: hesapSenaryo, uretSenaryolar, hesapZon */

function hesapSenaryo(cfg){
  const {nKuyu=1, nHat=S.hatSayisi||1, sSure=S.calismaSure||8,
         teslim=S.teslimNokta, basincOvrd=null, label, desc, tipi} = cfg;

  const BP   = YB[S.sulamaYontem];
  const ds   = getDin();
  const gs   = S.gunlukSu;
  const uzakRaw = S.uzakNokta||150;
  // Geometri override — kullanıcı mantıksız büyük uzak nokta girmişse fiziksel max'a çek
  const _areaM2 = Math.max(1000, (S.araziDonum||1)*1000);
  const _kenar = Math.sqrt(_areaM2);
  const _fizikselMax = Math.round(2.0 * _kenar);    // ana hat kenar + lateral kenar
  const uzak = (S.uzakNokta && S.uzakNokta > _fizikselMax * 1.2)
    ? _fizikselMax
    : uzakRaw;
  const uzakRevised = uzak !== uzakRaw;
  const kotF = S.egimDurum==='egimli'?(S.kotFarki||0):0;
  const PSH  = GP[S.ilSecim]||5.2;
  const pW   = S.oncelik==='uzunomur'?600:S.oncelik==='maliyet'?460:540;

  // Sistem başına debi – nKuyu ile bölüm
  const saatlikSis = gs / sSure;
  const pompaBasiDebi = saatlikSis / nKuyu;
  const gunlukPompaDebi = gs / nKuyu;
  const suSistem = gunlukPompaDebi;
  const Q_ana = saatlikSis / 3600;

  // Boru & basınç
  const boru       = secBoruCap(Q_ana);
  const anaHatKayip = hatKayipHW(Q_ana, boru.d_m, uzak);
  // Lateral hat kaybı — damla/sprinkler lateralinin ince borusundaki sürtünme
  // Debiyi gerçek yerleşim modelinden (damlatıcı × debi veya başlık × debi) türet.
  let lateralKayip = 0;
  let lateralDebiTekHat_m3h = 0;
  let lateralUzunluk_m = 0;
  if(S.sulamaYontem==='damla' || S.sulamaYontem==='yagmurlama'){
    const d_lat = getLateralInnerDiameter(S.sulamaYontem);
    if(d_lat > 0){
      try {
        if(S.sulamaYontem==='damla' && typeof getDripLayoutModel==='function'){
          const m = getDripLayoutModel();
          // Bir laterale düşen damlatıcı sayısı × damlatıcı debisi (L/h → m³/h)
          const emittersPerRow = m.lateralCount > 0 ? Math.ceil(m.emitterCount / m.lateralCount) : 0;
          const dripFlow_lh = m.emitterFlow || S.tipDamlaticiDebi || 2;  // L/h
          lateralDebiTekHat_m3h = (emittersPerRow * dripFlow_lh) / 1000;  // m³/h
          lateralUzunluk_m = Math.min(150, m.lateralLength || 0);
        } else if(S.sulamaYontem==='yagmurlama' && typeof getSprinklerLayoutModel==='function'){
          const m = getSprinklerLayoutModel();
          // Bir laterale düşen başlık sayısı × başlık debisi
          const sprinklersPerRow = m.lateralCount > 0 ? Math.ceil(m.sprinklerCount / m.lateralCount) : 0;
          const headFlow_m3h = m.headFlow || 1;
          lateralDebiTekHat_m3h = sprinklersPerRow * headFlow_m3h;
          lateralUzunluk_m = Math.min(150, m.lateralM / Math.max(1, m.lateralCount) || 0);
        }
      } catch(e){ /* layout model hazır değil, lateralKayip=0 kalır */ }
      if(lateralDebiTekHat_m3h > 0 && lateralUzunluk_m > 0){
        lateralKayip = hatKayipLateralHW(lateralDebiTekHat_m3h, d_lat, lateralUzunluk_m);
      }
    }
  }
  const kayip      = round1(anaHatKayip + lateralKayip);
  const kotBar     = kotF * 0.0981;
  const sistBasinc = basincOvrd !== null ? basincOvrd : (S.basincState==='manual' && S.basinc>0 ? S.basinc : getEquipmentPressureDefault());
  const hatBasiBar = sistBasinc + kayip + kotBar;
  const ventilGer  = hatBasiBar > BP.guvenliMax;

  // Basma yüksekliği & pompa
  const pompaDer = ds + 5;
  const basmaYuk = Math.round(pompaDer + (sistBasinc * 10.2) + (kayip * 10.2) + kotF);
  const toplamManometrikM = round1(pompaDer + (hatBasiBar * 10.2));
  const toplamManometrikBar = round1(toplamManometrikM / 10.2);
  // Dinamik pompa verimi — pompa güç sınıfına göre (akademik kaynak 1 ve 3)
  // İlk tahmin basma yüksekliğine göre (gücü daha seçmedik).
  // Yaklaşım: küçük pompalar 4", büyük pompalar 6" gövde kullanır.
  // 4" (≤4 kW): η_pompa × η_motor ≈ 0.55 × 0.88 = 0.48 (toplam)
  // 6" (>4 kW): η_pompa × η_motor ≈ 0.68 × 0.90 = 0.61 (toplam)
  // Bu kademeyi basmaYuk yerine basit kW tahminine bakarak seçeceğiz (iki pass).
  // İlk pass: 0.55 ortalama ile ön kW tahmini yap.
  function estimateEta(guessKW){
    if(guessKW <= 4) return 0.48;   // küçük 4" dalgıç — total (pompa × motor)
    return 0.61;                     // 6" ve üstü
  }
  // İlk tahmin (ortalama η=0.55 ile)
  const preKW = (pompaBasiDebi / 3.6 * basmaYuk * 9.81) / (1000 * 0.55);
  const pompEta  = estimateEta(preKW);
  const kWGer    = (pompaBasiDebi / 3.6 * basmaYuk * 9.81) / (1000 * pompEta);
  // Emniyet çarpanı: akademik kaynakların ortak önerisi ×1.15 (eski ×1.25 overshoot yaratıyordu)
  // Voltaj dalgalanması, kademe aşınması, debi sapmaları için yeterli pay.
  let   pompGucu = kWGer * 1.15;
  if(S.oncelik==='hiz') pompGucu *= 1.20;        // hız önceliğinde ekstra pay
  if(S.oncelik==='uzunomur') pompGucu *= 1.10;   // uzun ömür için küçük ek pay
  const secPompGuc = secPomp(pompGucu, basmaYuk);
  const pompHP     = (secPompGuc * 1.36).toFixed(1);
  const toplamKW   = +(secPompGuc * nKuyu).toFixed(2);

  // Solar
  const gunlukE  = secPompGuc * sSure;
  const pSay     = Math.ceil(gunlukE / (PSH * 0.85) * 1000 / pW);
  const toplamP  = pSay * nKuyu;
  const totKwp   = +((toplamP * pW / 1000).toFixed(1));
  const invKW    = secInv(secPompGuc * 1.1);

  // Debi kontrolü + öneri
  const kDebi = S.kuyuDebi || 0;
  let debiDurum='unknown', debiMesaj='', debiOneriler=[], debiOran=0;
  if(kDebi>0){
    debiOran = pompaBasiDebi / kDebi;
    if(debiOran<=0.85){
      debiDurum='ok';
      debiMesaj = nKuyu>1
        ? 'Kuyu debisi yeterli. Kuyu basina gerekli ' + pompaBasiDebi.toFixed(1) + ' T/s, mevcut ' + kDebi + ' T/s.'
        : 'Kuyu debisi yeterli. Gerekli ' + pompaBasiDebi.toFixed(1) + ' T/s, mevcut ' + kDebi + ' T/s.';
    } else if(debiOran<=1.05){
      debiDurum='border';
      debiMesaj = nKuyu>1
        ? 'Kuyu basina debi sinirda. Gerekli debi mevcut kuyu debisine cok yakin.'
        : 'Sinirda calisma. Gerekli debi mevcut kuyu debisine cok yakin.';
      debiMesaj='Sınırda çalışma. Gerekli "‰ˆ mevcut debi.';
      debiOneriler=['Çalışma süresini artırın','Depo sistemi ekleyin','Hat sayısını azaltın'];
      debiMesaj = nKuyu>1
        ? 'Kuyu basina debi sinirda. Gerekli debi mevcut kuyu debisine cok yakin.'
        : 'Sinirda calisma. Gerekli debi mevcut kuyu debisine cok yakin.';
    } else {
      debiDurum='bad';
      debiMesaj='Kuyu debisi yetersiz. Gerekli '+saatlikSis.toFixed(1)+' T/s > mevcut '+kDebi+' T/s.';
      debiOneriler=['Süreyi '+Math.ceil(suSistem/kDebi*1.05).toFixed(0)+' saate çıkarın','Depo tamponu kullanın','Kuyu sayısını artırın'];
      if(debiDurum==='bad'){
        debiMesaj = nKuyu>1
          ? 'Kuyu debisi yetersiz. Kuyu basina gerekli ' + pompaBasiDebi.toFixed(1) + ' T/s > mevcut ' + kDebi + ' T/s.'
          : 'Kuyu debisi yetersiz. Gerekli ' + pompaBasiDebi.toFixed(1) + ' T/s > mevcut ' + kDebi + ' T/s.';
        debiOneriler=['Sureyi '+Math.ceil(gunlukPompaDebi/kDebi*1.05).toFixed(0)+' saate cikarÄ±n','Depo tamponu kullanÄ±n','Kuyu sayÄ±sÄ±nÄ± artÄ±rÄ±n'];
      }
    }
  }

  // Basınç durumu (çiftçi dili)
  let basincDurum='ok', basincYorumFarmer='';
  if(hatBasiBar > BP.guvenliMax * 1.2){
    basincDurum='kritik';
    basincYorumFarmer='Basınç çok yüksek – ekipman ömrü düşer, patlama riski var. Sistem 2 parçaya bölünmeli veya regülatör konulmalı.';
  } else if(hatBasiBar > BP.guvenliMax){
    basincDurum='yuksek';
    basincYorumFarmer='Basınç yüksek – basınç düşürücü (PRV) regülatör gerekebilir.';
  } else if(hatBasiBar > BP.max){
    basincDurum='sinir';
    basincYorumFarmer='Basınç sınırda. Sistem çalışır ama 2 parçaya bölünürse daha rahat çalışır.';
  } else if(hatBasiBar < BP.min){
    basincDurum='dusuk';
    basincYorumFarmer='Basınç düşük – sulama başlıkları yeterli verim vermeyebilir.';
  } else {
    basincDurum='ok';
    basincYorumFarmer='Basınç güvenli aralıkta – sistem rahat çalışır.';
  }

  // Kuyular arası interferans (sadece çoklu kuyu için anlamlı)
  const interferans = S.kuyuMesafe < 100 ? 'kritik' : S.kuyuMesafe < 150 ? 'orta' : 'dusuk';

  // Dinamik su seviyesi uyarısı
  const kuyuTabanYakin = S.kuyuDerinlik > 0 && ds > 0 && (S.kuyuDerinlik - ds) < 5;
  const kuyuTabanSinir = S.kuyuDerinlik > 0 && ds > 0 && (S.kuyuDerinlik - ds) < 10;

  // Skor (0-100) – çok kriterli
  let skor=50;
  if(basincDurum==='ok')       skor+=18;
  else if(basincDurum==='kritik') skor-=28;
  else if(basincDurum==='yuksek') skor-=14;
  else if(basincDurum==='sinir')  skor-=6;
  else if(basincDurum==='dusuk')  skor-=10;

  if(debiDurum==='ok')     skor+=16;
  else if(debiDurum==='bad') skor-=22;
  else if(debiDurum==='border') skor-=9;
  else if(debiDurum==='unknown') skor-=6;  // Kör gidiyoruz — sessizce 'uygun' deme

  if(ventilGer) skor-=8;
  if(nKuyu>1 && S.kurumaRisk==='var') skor+=12;
  if(nKuyu>1 && kotF>20) skor+=6;
  if(interferans==='kritik' && nKuyu>1) skor-=20;
  if(interferans==='orta' && nKuyu>1)   skor-=7;
  if(kuyuTabanYakin) skor-=18;
  else if(kuyuTabanSinir) skor-=8;
  if(teslim==='depo' && (debiDurum==='bad'||debiDurum==='border')) skor+=14;
  // Tek kuyuda arıza = sistem durur "†’ güvenlik dezavantajı
  if(nKuyu===1) skor-=3;
  // Öncelik ayarı
  if(S.oncelik==='guvenlik' && nKuyu>1) skor+=6;
  if(S.oncelik==='maliyet' && nKuyu===1) skor+=4;

  skor=Math.max(0,Math.min(100,skor));

  const uygunlukSkoru = clamp(Math.round(
    52 +
    (basincDurum==='ok'?20:basincDurum==='sinir'?-4:basincDurum==='yuksek'?-14:basincDurum==='kritik'?-28:-12) +
    (debiDurum==='ok'?18:debiDurum==='border'?-9:debiDurum==='bad'?-22:debiDurum==='unknown'?-5:0) +
    (teslim==='depo' && (debiDurum==='bad'||debiDurum==='border') ? 10 : 0) +
    (!ventilGer ? 4 : -8)
  ),0,100);
  const guvenSkoru = clamp(Math.round(
    58 +
    (nKuyu===2?14:nKuyu>=3?18:0) +
    (teslim==='depo'?8:0) +
    (tipi==='zonlu'?6:0) +
    ((interferans==='kritik' && nKuyu>1)?-22:(interferans==='orta' && nKuyu>1)?-8:0) +
    (kuyuTabanYakin?-20:kuyuTabanSinir?-10:0) +
    (S.kurumaRisk==='var' ? (nKuyu===1?-14:-5) : 4) +
    (debiDurum==='bad'?-12:debiDurum==='border'?-5:3)
  ),0,100);
  const isletmeSkoru = clamp(Math.round(
    60 +
    (sSure<=10?10:sSure<=12?4:-8) +
    (tipi==='zonlu'?12:0) +
    (teslim==='depo'?10:0) +
    (nKuyu===2?6:nKuyu>=3?-4:0) +
    ((S.egimDurum==='egimli' && kotF>20)?-8:0) +
    (debiDurum==='bad'?-12:debiDurum==='border'?-4:0)
  ),0,100);
  const ekonomiSkoru = clamp(Math.round(
    78 -
    (toplamKW*1.2) -
    ((nKuyu-1)*9) -
    (teslim==='depo'?12:0) -
    (tipi==='paralel3'?8:0) +
    (tipi==='zonlu'?12:0) +
    (nKuyu===1?6:0) +
    (sSure>12?-6:0)
  ),0,100);
  const kararPuani = clamp(Math.round(
    uygunlukSkoru*0.42 +
    guvenSkoru*0.32 +
    isletmeSkoru*0.18 +
    ekonomiSkoru*0.08
  ),0,100);
  const hydraulicPreview = getHydraulicZoneDemand(saatlikSis, nHat);
  const kurumaPayi = S.kuyuDerinlik>0 && ds>0 ? round1(S.kuyuDerinlik-ds) : null;
  const debiGuvenPayi = kDebi>0 ? Math.round((1-debiOran)*100) : null;
  const yedeklilik = nKuyu===1 ? 'dusuk' : nKuyu===2 ? 'iyi' : 'cokiyi';
  const izinZorlugu = nKuyu===1 ? 'dusuk' : nKuyu===2 ? 'orta' : 'yuksek';

  return {
    label, desc, tipi, nKuyu, nHat, sSure, teslim,
    saatlikSis, pompaBasiDebi, gunlukPompaDebi, Q_ana, boru, kayip, kotBar,
    uzakRevised, uzakRaw, uzakKullanilan: uzak, anaHatKayip, lateralKayip,
    sistBasinc, hatBasiBar, ventilGer,
    basincDurum, basincYorumFarmer,
    pompaDer, basmaYuk, toplamManometrikM, toplamManometrikBar, secPompGuc, pompHP, toplamKW,
    kWGer, pSay, toplamP, totKwp, invKW, pW,
    debiDurum, debiMesaj, debiOneriler, debiOran,
    interferans, kuyuTabanYakin, kuyuTabanSinir,
    skor, uygunlukSkoru, guvenSkoru, isletmeSkoru, ekonomiSkoru, kararPuani,
    kurumaPayi, debiGuvenPayi, yedeklilik, izinZorlugu,
    hidrolikMinZon:hydraulicPreview ? hydraulicPreview.minZones : Math.max(1, nHat),
    hidrolikAutoZon:hydraulicPreview ? hydraulicPreview.effectiveZones : Math.max(1, nHat),
    hidrolikTalepDebi:hydraulicPreview ? hydraulicPreview.layoutDemandM3h : 0,
    hidrolikAktifBirim:hydraulicPreview ? hydraulicPreview.activeUnits : 0,
    hidrolikRevize:!!(hydraulicPreview && hydraulicPreview.autoAdjusted)
  };
}

/* –– COST CONFIDENCE ––––––––––––––––––––––––––––––––––––––––––––––
   Piyasa verisi yok "†’ her zaman 'low'. Sadece göreli yorum yapılabilir.
   Kullanıcıya KESİN TL asla gösterme kuralı bu fonksiyon üstünden uygulanır.
*/
function calcCostConfidence(engine){
  const visible = engine?.visibleScenarios || [];
  const recommended = engine?.recommended || visible[0] || null;
  const zon = engine?.zon || null;
  const blockers = [];
  const hasCurrentPriceList = false;
  const laborModelClear = false;
  const pipeLayoutNet = !!S.uzakNokta && (S.egimDurum==='duz' || !!S.kotFarki);
  const zonNet = zon ? zon.tip==='gercek' : false;
  const nearBest = recommended ? visible.filter(s=>Math.abs((s.kararPuani||0)-(recommended.kararPuani||0))<=5) : [];
  const systemStable = nearBest.length<=1;

  if(!hasCurrentPriceList) blockers.push('Güncel malzeme fiyat listesi yok.');
  if(!laborModelClear) blockers.push('İşçilik modeli net değil.');
  if(!pipeLayoutNet) blockers.push('Boru metrajı saha keşfi olmadan net değil.');
  if(!systemStable) blockers.push('Kuyu adedi ve sistem tipi h"l" alternatifli.');
  if(!zonNet && S.sulamaYontem!=='salma') blockers.push('Hat ve zon düzeni ön keşif seviyesinde.');
  if(S.sistemTercih!=='sebeke') blockers.push('Panel ve inverter markası/modeli seçilmedi.');
  if((recommended && recommended.nKuyu>1) || S.kuyuDurum!=='mevcut') blockers.push('Sondaj, izin ve proje bedelleri keşifle netleşir.');

  let level = blockers.length>=6 ? 'none' : blockers.length>=2 ? 'low' : blockers.length===1 ? 'medium' : 'high';
  if(!hasCurrentPriceList || !laborModelClear) level = blockers.length>=5 ? 'none' : 'low';

  let relativeComment = 'Bu aşamada sadece teknik uygunluk ve çözüm önerisi verilebilir.';
  if(engine?.economic){
    if(engine.economic===recommended){
      relativeComment = 'Önerilen çözüm aynı zamanda ilk yatırım tarafında da dengeli görünüyor.';
    } else if(engine.economic.tipi==='zonlu'){
      relativeComment = 'Bu aşamada en doğru yorum: bölünmüş sulama ilk yatırımda daha ekonomik olabilir.';
    } else if(engine.economic.tipi==='depolu'){
      relativeComment = 'Bu aşamada en doğru yorum: depolu çözüm düşük debili kuyularda daha rahat işletme sağlayabilir.';
    } else if(engine.economic.nKuyu===1){
      relativeComment = 'Bu aşamada en doğru yorum: tek kuyu çözüm ilk yatırımda daha ekonomik olabilir.';
    } else {
      relativeComment = 'Bu aşamada en doğru yorum: '+getScenarioDisplayName(engine.economic).toLowerCase()+' daha ekonomik olabilir.';
    }
  }

  return {
    level,
    blockers,
    allowNumber:level==='high',
    allowRange:level==='medium' || level==='high',
    badge:{none:'Keşif gerekli',low:'Keşif gerekli',medium:'Ön keşif',high:'Fiyat paylaşılabilir'}[level],
    salesText:level==='high'
      ? 'Güncel fiyat ve net metraj varsa teklif paylaşılabilir.'
      : level==='medium'
        ? 'Yaklaşık maliyet aralığı ancak ön keşif seviyesinde değerlendirilebilir.'
        : 'Kesin fiyat için saha keşfi gerekir.',
    secondaryText:level==='high'
      ? 'Yine de nihai teklif için saha doğrulaması önerilir.'
      : 'Bu aşamada sadece teknik uygunluk ve çözüm önerisi verilebilir.',
    relativeComment
  };
}

/* –– TRAFFIC LIGHT ––––––––––––––––––––––––––––––––––––––––––––––––– */
function getTrafficLight(senaryo){
  const s = senaryo.kararPuani ?? senaryo.skor;
  if(s >= 72) return { cls:'green', icon:'🟢', status:'Uygun', desc:'Mevcut verilerle bu sistem arazi için uygun ve rahat görünüyor.' };
  if(s >= 52) return { cls:'yellow', icon:'🟡', status:'Sınırda', desc:'Bu çözüm olur, ancak çalışma düzeni ve koruma ekipmanı dikkatli seçilmelidir.' };
  return { cls:'red', icon:'🔴', status:'Riskli', desc:'Bu haliyle kurulum riskli görünüyor. Bölmek, kuyu eklemek veya depo kullanmak daha doğru olabilir.' };
}

/* –– ÇİFTÇİ DİLİNDE "NEDEN" METNİ ––––––––––––––––––––––––––––––––––– */
function farmerWhy(senaryo){
  if(senaryo.tipi==='tek')      return '<b>En sade çözüm budur.</b> Kuyu rahat yetiyorsa kurulum ve bakım kolay olur.';
  if(senaryo.tipi==='paralel2') return '<b>Yük 2 kuyuya bölünür.</b> Sistem rahatlar, pompa zorlanmaz, tek kuyunun yükü azalır.';
  if(senaryo.tipi==='paralel3') return '<b>En yüksek yedekleme budur.</b> Arıza anında tüm sulama bir anda durmaz.';
  if(senaryo.tipi==='zonlu')    return '<b>Sulama sırayla yapılır.</b> Aynı anda tüm hatlar açılmadığı için pompa daha rahat çalışır.';
  if(senaryo.tipi==='depolu')   return '<b>Depo tampon görevi görür.</b> Kuyu yavaş dolsa bile sulama daha kontrollü yapılır.';
  return '';
}

/* –– ÇİFTÇİ DİLİNDE "FAYDA" METNİ ––––––––––––––––––––––––––––––––––– */
function farmerBenefit(senaryo){
  const parcalar=[];
  if(senaryo.basincDurum==='ok') parcalar.push('pompa rahat aralıkta çalışır');
  if(senaryo.debiDurum==='ok')   parcalar.push('kuyu suyu düzeni taşır');
  if(senaryo.nKuyu>1)            parcalar.push('sistem tek pompaya bağımlı kalmaz');
  if(senaryo.teslim==='depo')    parcalar.push('düşük debide kullanım rahatlar');
  if(senaryo.tipi==='zonlu')     parcalar.push('aynı anda tüm hatlar açılmadığı için yük azalır');
  if(parcalar.length===0)        parcalar.push('hesaplar bu düzenin çalışabileceğini gösteriyor');
  return parcalar.join(', ').replace(/, ([^,]*)$/,' ve $1')+'.';
}

/* –– 5 SENARYO ÜRETİMİ –––––––––––––––––––––––––––––––––––––––––––––– */
function uretSenaryolar(){
  const sure = S.calismaSure||8;
  // Solar sistemde güneş saati sınırlıdır — kullanıcının süresi AŞILMAMALI
  // (bataryasız solar 11 saat çalışamaz; güneş + batarya yoksa kullanıcının "8 saat" tercihi kilitlenmeli)
  const isSolar = S.sebekeDurum==='yok' || S.sistemTercih==='gunes';
  const zonluSure = isSolar ? sure : Math.min(14, sure+3);
  const depoluSure = isSolar ? sure : Math.min(16, sure+4);
  const senaryolar = [
    // S1 – Tek sistem
    hesapSenaryo({
      nKuyu:1, nHat:S.hatSayisi||1, sSure:sure,
      teslim:S.teslimNokta, tipi:'tek',
      label:'Tek Sistem', desc:'1 kuyu · 1 pompa · doğrudan'
    }),
    // S2 – 2 paralel
    hesapSenaryo({
      nKuyu:2, nHat:Math.max(1,Math.floor((S.hatSayisi||1))), sSure:sure,
      teslim:S.teslimNokta, tipi:'paralel2',
      label:'2 Paralel Sistem', desc:'2 kuyu · 2 küçük pompa'
    }),
    // S3 – 3 paralel
    hesapSenaryo({
      nKuyu:3, nHat:S.hatSayisi||1, sSure:sure,
      teslim:S.teslimNokta, tipi:'paralel3',
      label:'3 Paralel Sistem', desc:'3 kuyu · yedekleme'
    }),
    // S4 – Zonlanmış (solar ise süre aynı, şebekeyse +3 saat)
    hesapSenaryo({
      nKuyu:1, nHat:1, sSure:zonluSure,
      teslim:S.teslimNokta, tipi:'zonlu',
      label:'Zonlanmış Sulama',
      desc: isSolar ? '1 kuyu · tek hat · zon bölmeli' : '1 kuyu · tek hat · uzun süre'
    }),
    // S5 – Depolu (solar ise süre aynı, şebekeyse +4 saat)
    hesapSenaryo({
      nKuyu:1, nHat:S.hatSayisi||1, sSure:depoluSure,
      teslim:'depo', tipi:'depolu',
      label:'Depolu Tampon Sistem',
      desc: isSolar ? '1 kuyu · depo · gün içinde' : '1 kuyu · depo · gece sulama'
    })
  ];
  const maxS = Math.max(...senaryolar.map(s=>s.kararPuani));
  senaryolar.forEach(s=>{ s.onerilen = s.kararPuani===maxS; });
  return senaryolar;
}

/* –– FİLTRE: Gösterilmeye değer senaryolar –––––––––––––––––––––––– */
function mantikliSenaryolar(tümü){
  const tek = tümü.find(s=>s.tipi==='tek') || tümü[0];
  // Kullanıcı mevcut 2+ kuyu girmişse: tek kuyulu/bölünmüş senaryolar aktif öneri olmamalı
  // Çünkü kuyu zaten var — ekonomi için kullanılmayan kuyu mantıksız.
  const mevcutCokKuyu = (S.kuyuDurum==='mevcut') && (S.kuyuSayisi||1) >= 2;
  const filtreli = tümü.filter(s=>{
    if((s.kararPuani||0)<35) return false;
    // Mevcut çok kuyuda: tek, zonlu, depolu öneriler filtrelenir (alternatif listede kalabilir ama ana öneri olamaz)
    if(mevcutCokKuyu){
      if(s.tipi==='tek') return false;           // Tek kuyu — kullanılmayan kuyular olur, mantıksız
      if(s.tipi==='zonlu') return false;         // Bölünmüş sulama — kuyu sayısı 1'e düşürür
      // paralel2, paralel3, depolu: kullanıcının kuyu sayısıyla uyumlu olanlar kalsın
      if(s.tipi==='paralel3' && (S.kuyuSayisi||1) < 3) return false;
    }
    if(s.tipi==='paralel3'){
      return tek.debiDurum!=='ok' || S.kurumaRisk==='var' || S.araziDonum>60 || tek.kuyuTabanSinir || tek.basincDurum!=='ok' || mevcutCokKuyu;
    }
    if(s.tipi==='depolu'){
      return tek.debiDurum!=='ok' || S.teslimNokta==='depo' || S.kurumaRisk==='var';
    }
    if(s.tipi==='zonlu'){
      return S.hatSayisi>1 || tek.hidrolikMinZon>1 || tek.basincDurum!=='ok' || tek.debiDurum!=='ok' || S.advParamGirildi;
    }
    return true;
  });
  return filtreli.length ? filtreli : tümü.slice(0,3);
}

/* –– ZON HESABI (gerçek vs tahmini) –––––––––––––––––––––––––––––––– */
function getHydraulicZoneDemand(availableFlowM3h, requestedZones){
  const yontem = S.sulamaYontem;
  const talepEdilenZon = Math.max(1, parseInt(requestedZones || S.hatSayisi || 1, 10) || 1);
  const uygunDebi = Math.max(0.01, availableFlowM3h || 0);

  if(yontem==='yagmurlama'){
    const sp = getSprinklerLayoutModel();
    if(!(sp && sp.headFlow>0 && sp.sprinklerCount>0)) return null;
    const maxUnits = Math.max(1, Math.floor(uygunDebi / Math.max(0.01, sp.headFlow)));
    const minZones = Math.max(1, Math.ceil(sp.sprinklerCount / maxUnits));
    const effectiveZones = Math.max(minZones, talepEdilenZon);
    const activeUnits = Math.max(1, Math.min(maxUnits, Math.ceil(sp.sprinklerCount / effectiveZones)));
    return {
      tip:sp.exact ? 'gercek' : 'tahmini',
      kategori:'sprinkler',
      unitLabel:'sprinkler',
      unitFlow:sp.headFlow,
      totalUnits:sp.sprinklerCount,
      layoutDemandM3h:round1(sp.sprinklerCount * sp.headFlow),
      availableFlowM3h:round1(uygunDebi),
      maxUnits,
      activeUnits,
      minZones,
      requestedZones:talepEdilenZon,
      effectiveZones,
      autoAdjusted:talepEdilenZon < minZones,
      zoneFlowM3h:round1(activeUnits * sp.headFlow),
      exact:sp.exact
    };
  }

  if(yontem==='damla'){
    const drip = getDripLayoutModel();
    let totalUnits = 0;
    let unitFlow = 0;
    let unitLabel = 'hat';

    if(drip.orchard && drip.hasMeaningfulData){
      totalUnits = drip.rowCount;
      unitFlow = Math.max(0.01, drip.rowFlowM3h);
      unitLabel = 'sira';
    } else if(!drip.orchard && drip.hasMeaningfulData){
      totalUnits = drip.lateralCount;
      unitFlow = Math.max(0.01, drip.rowFlowM3h);
      unitLabel = 'lateral';
    } else if(S.uretimTipi==='ozel'){
      totalUnits = Math.max(1, drip.rowCount || S.tipManualSira || 1);
      unitFlow = Math.max(0.5, drip.rowFlowM3h || 0.5);
      unitLabel = 'blok';
    }

    if(!(totalUnits>0 && unitFlow>0)) return null;
    const maxUnits = Math.max(1, Math.floor(uygunDebi / Math.max(0.01, unitFlow)));
    const minZones = Math.max(1, Math.ceil(totalUnits / maxUnits));
    const effectiveZones = Math.max(minZones, talepEdilenZon);
    const activeUnits = Math.max(1, Math.min(maxUnits, Math.ceil(totalUnits / effectiveZones)));
    return {
      tip:drip.exact ? 'gercek' : 'tahmini',
      kategori:'damla',
      unitLabel,
      unitFlow,
      totalUnits,
      layoutDemandM3h:round1((drip.systemFlowM3h || (totalUnits * unitFlow))),
      availableFlowM3h:round1(uygunDebi),
      maxUnits,
      activeUnits,
      minZones,
      requestedZones:talepEdilenZon,
      effectiveZones,
      autoAdjusted:talepEdilenZon < minZones,
      zoneFlowM3h:round1(activeUnits * unitFlow),
      exact:drip.exact
    };
  }

  return null;
}
function hesapZonRevize(senaryo){
  const yontem = S.sulamaYontem;
  const approx = yontem==='yagmurlama'
    ? Math.max(1, Math.round(S.araziDonum*0.15))
    : yontem==='damla' ? Math.max(1, Math.round(S.araziDonum*0.1)) : 1;
  const plan = getHydraulicZoneDemand(senaryo.saatlikSis, senaryo.nHat);

  if(plan && yontem==='yagmurlama'){
    const yorum = plan.autoAdjusted
      ? `Yaklasik ${plan.totalUnits} sprinkler icin girilen ${plan.requestedZones} zon debiye yetmedigi icin sistem otomatik olarak en az ${plan.effectiveZones} zona revize edildi.`
      : plan.requestedZones>plan.minZones
        ? `Hidrolik olarak minimum ${plan.minZones} zon yeterliydi; kullanici tercihiyle ${plan.effectiveZones} zon uygulanabilir.`
        : `Yaklasik ${plan.totalUnits} sprinkler icin ayni anda ${plan.activeUnits} sprinkler acilabilir. Sistem ${plan.effectiveZones} zona ayrilabilir.`;
    return {
      tip:plan.tip,
      zon:plan.effectiveZones,
      minZon:plan.minZones,
      toplamSp:plan.totalUnits,
      esZamanli:plan.activeUnits,
      zonDebisi:plan.zoneFlowM3h,
      toplamTalepDebi:plan.layoutDemandM3h,
      mevcutDebi:plan.availableFlowM3h,
      autoAdjusted:plan.autoAdjusted,
      requestedZones:plan.requestedZones,
      yorum,
      teknik:`Sprinkler basina ${plan.unitFlow} m3/h, toplam yerlesim debisi ${plan.layoutDemandM3h} m3/h, sistemin ayni anda verebildigi debi ${plan.availableFlowM3h} m3/h, zon basina yaklasik ${plan.zoneFlowM3h} m3/h.`
    };
  }

  if(plan && yontem==='damla'){
    return {
      tip:plan.tip,
      zon:plan.effectiveZones,
      minZon:plan.minZones,
      toplamSira:plan.totalUnits,
      esZamanli:plan.activeUnits,
      zonDebisi:plan.zoneFlowM3h,
      toplamTalepDebi:plan.layoutDemandM3h,
      mevcutDebi:plan.availableFlowM3h,
      autoAdjusted:plan.autoAdjusted,
      requestedZones:plan.requestedZones,
      lateralDebi_lh:Math.round(plan.unitFlow * 1000),
      yorum:plan.autoAdjusted
        ? `Girilen ${plan.requestedZones} zon yeterli olmadigi icin sistem hidrolik olarak en az ${plan.effectiveZones} zona revize edildi. Ayni anda ${plan.activeUnits} ${plan.unitLabel} sulanabilir.`
        : `Yaklasik ${plan.totalUnits} ${plan.unitLabel} icin ayni anda ${plan.activeUnits} ${plan.unitLabel} acilabilir. Sistem ${plan.effectiveZones} blokta calistirilabilir.`,
      teknik:`Her ${plan.unitLabel} yaklasik ${round1(plan.unitFlow)} m3/h ceker. Toplam yerlesim debisi ${plan.layoutDemandM3h} m3/h, pompanin ayni anda verebildigi debi ${plan.availableFlowM3h} m3/h.`
    };
  }

  if(yontem==='damla' && isTreeBasedProduction()){
    return {
      tip:'tahmini',
      zon:approx,
      yorum:`On kabul ile yaklasik ${approx} blok oneriliyor. ${getProductionTypeName()} icin kesin zon plani yerlesim duzeniyle netlesir.`,
      teknik:'Sira arasi, bitki/agac arasi ve damlatici bilgisi girildiginde blok debisi netlesir.'
    };
  }
  return {
    tip:'tahmini',
    zon:approx,
    yorum:`Yaklasik ${approx} bolum oneriliyor. Detayli zon plani icin baslik veya damlatici verisi gerekir.`,
    teknik:'On oneridir, detayli proje ile netlesir.'
  };
}
function hesapZon(senaryo){
  return hesapZonRevize(senaryo);
  const yontem = S.sulamaYontem;
  const araziM2 = (S.araziDonum||10)*1000;
  const saatlikDebi_m3h = senaryo.saatlikSis;

  if(yontem==='yagmurlama'){
    const sp = getSprinklerLayoutModel();
    if(sp.exact){
      const toplamSp = sp.sprinklerCount;
      const esZamanli = Math.max(1, Math.floor(saatlikDebi_m3h/Math.max(0.1,sp.headFlow)));
      const zon = Math.ceil(toplamSp/esZamanli);
      const zonDebisi = round1(esZamanli*sp.headFlow);
      return {
        tip:'gercek', zon, toplamSp, esZamanli, zonDebisi,
        yorum:`Yaklaşık ${toplamSp} başlık için aynı anda ${esZamanli} başlık açılabilir. Sistem ${zon} bölüme ayrılabilir.`,
        teknik:`Başlık başına ${sp.headFlow} m³/h, zon başına yaklaşık ${zonDebisi} m³/h.`
      };
    }
  }
  if(yontem==='yagmurlama' && S.advParamGirildi && S.spAralikX>0 && S.spAralikY>0 && S.spDebi>0){
    const toplamSp = Math.floor(araziM2/(S.spAralikX*S.spAralikY));
    const esZamanli = Math.max(1, Math.floor(saatlikDebi_m3h/S.spDebi));
    const zon = Math.ceil(toplamSp/esZamanli);
    const zonDebisi = round1(esZamanli*S.spDebi);
    return {
      tip:'gercek', zon, toplamSp, esZamanli, zonDebisi,
      yorum:`Yaklaşık ${toplamSp} başlık için aynı anda ${esZamanli} başlık açılabilir. Sistem ${zon} bölüme ayrılabilir.`,
      teknik:`Başlık başına ${S.spDebi} m³/h, zon başına yaklaşık ${zonDebisi} m³/h.`
    };
  }
  if(yontem==='damla'){
    const drip = getDripLayoutModel();
    if(drip.orchard && drip.hasMeaningfulData){
      const rowFlow = Math.max(0.01, drip.rowFlowM3h);
      const esZamanli = Math.max(1, Math.floor(saatlikDebi_m3h / rowFlow));
      const aktifSira = Math.min(drip.rowCount, Math.max(1, esZamanli));
      const zon = Math.max(1, Math.ceil(drip.rowCount / aktifSira));
      const zonDebisi = round1(aktifSira * rowFlow);
      return {
        tip:drip.exact ? 'gercek' : 'tahmini',
        zon,
        toplamSira:drip.rowCount,
        esZamanli:aktifSira,
        zonDebisi,
        yorum:drip.exact
          ? `Yaklaşık ${drip.rowCount} sıra için aynı anda ${aktifSira} sıra sulanabilir. Sistem ${zon} blokta çalıştırılabilir.`
          : `Ön kabul ile ${drip.rowCount} sıra hesaplandı. Bahçe planı tamamlandığında zon sayısı netleşir.`,
        teknik:`Ağaç sayısı yaklaşık ${drip.plantCount}, blok debisi ${zonDebisi} m³/h, toplam sistem debisi ${drip.systemFlowM3h} m³/h.`
      };
    }
    if(S.uretimTipi==='ozel'){
      return {
        tip:'tahmini',
        zon:Math.max(1, S.tipManualBlok || Math.ceil(Math.max(1, drip.rowCount) / Math.max(1, Math.floor(saatlikDebi_m3h / Math.max(0.5, drip.rowFlowM3h || 0.5))))),
        toplamSira:drip.rowCount,
        esZamanli:Math.max(1, Math.floor(saatlikDebi_m3h / Math.max(0.5, drip.rowFlowM3h || 0.5))),
        zonDebisi:round1(Math.max(0.5, drip.rowFlowM3h || 0.5)),
        yorum:'Özel düzen için zon önerisi ön keşif seviyesinde üretildi. Manuel blok bilgisi girilirse netleşir.',
        teknik:'Manuel sıra, lateral ve blok verileriyle güncellenir.'
      };
    }
    if(!drip.orchard && drip.hasMeaningfulData){
      const rowFlow = Math.max(0.01, drip.rowFlowM3h);
      const esZamanli = Math.max(1, Math.floor(saatlikDebi_m3h / rowFlow));
      const aktifHat = Math.min(drip.lateralCount, Math.max(1, esZamanli));
      const zon = Math.max(1, Math.ceil(drip.lateralCount / aktifHat));
      return {
        tip:drip.exact ? 'gercek' : 'tahmini',
        zon,
        toplamSira:drip.lateralCount,
        esZamanli:aktifHat,
        lateralDebi_lh:Math.round(rowFlow*1000),
        zonDebisi:round1(aktifHat*rowFlow),
        yorum:`Yaklaşık ${drip.lateralCount} lateral hat için aynı anda ${aktifHat} hat açılabilir. Sistem ${zon} blokta çalıştırılabilir.`,
        teknik:`Bir lateral yaklaşık ${Math.round(rowFlow*1000)} l/h çeker.`
      };
    }
  }

  const approx = yontem==='yagmurlama'
    ? Math.max(1, Math.round(S.araziDonum*0.15))
    : yontem==='damla' ? Math.max(1, Math.round(S.araziDonum*0.1)) : 1;
  if(yontem==='damla' && isTreeBasedProduction()){
    return {
      tip:'tahmini', zon:approx,
      yorum:`Ön kabul ile yaklaşık ${approx} blok öneriliyor. ${getProductionTypeName()} için kesin zon planı yerleşim düzeniyle netleşir.`,
      teknik:'Sıra arası, bitki / ağaç arası ve damlatıcı bilgisi girildiğinde blok debisi netleşir.'
    };
  }
  return {
    tip:'tahmini', zon:approx,
    yorum:`Yaklaşık ${approx} bölüm öneriliyor. Detaylı zon planı için başlık veya damlatıcı verisi gerekir.`,
    teknik:'Ön öneri – detaylı proje ile netleşir.'
  };
}

/* –– MÜHENDİS UYARILARI (çiftçi diliyle) ––––––––––––––––––––––––––– */
function muhendisYorum(senaryolar, onerilen){
  const U = [];
  const s1 = senaryolar.find(s=>s.tipi==='tek') || senaryolar[0];
  const rec = onerilen || senaryolar.slice().sort((a,b)=>b.kararPuani-a.kararPuani)[0];
  const s2 = senaryolar.find(s=>s.tipi==='paralel2');
  const s3 = senaryolar.find(s=>s.tipi==='paralel3');
  const ds = getDin();
  const kotF = S.egimDurum==='egimli'?(S.kotFarki||0):0;

  // Basınç çok yüksek
  if(s1.basincDurum==='kritik')
    U.push({tip:'krit', anchor:'pressure', mesaj:'Basınç çok yüksek – sulama ekipmanları zarar görebilir. Sistem 2 parçaya bölünmeli veya regülatör konulmalı.'});
  else if(s1.basincDurum==='yuksek')
    U.push({tip:'warn', anchor:'pressure', mesaj:'Basınç yüksek – basınç düşürücü (PRV) takılmalı. 2 paralel kuyu çözüm olabilir.'});

  // Kot farkı
  if(kotF>20)
    U.push({tip:'warn', anchor:'pressure', mesaj:'Arazi eğimli ('+kotF+' m) – pompanın ekstra basınç üretmesi gerekir. Paralel sistem bu yükü dağıtır.'});

  // Debi yetersiz
  if(s1.debiDurum==='bad'){
    const alt = senaryolar.find(s=>s.debiDurum==='ok' && s.nKuyu>1);
    if(alt)
      U.push({tip:'krit', anchor:'flow', mesaj:'Tek kuyu bu debiye yetmiyor. '+alt.nKuyu+' kuyulu sistem debiyi böler ve rahatlar.'});
    else
      U.push({tip:'krit', anchor:'flow', mesaj:'Tek kuyu yetersiz. Çalışma süresini artırmak veya depolu sisteme geçmek gerekir.'});
  } else if(s1.debiDurum==='border')
    U.push({tip:'warn', anchor:'flow', mesaj:'Kuyu debisi sınırda – çalışma süresi uzatılmalı veya depo eklenmeli.'});
  else if(s1.debiDurum==='unknown')
    U.push({tip:'warn', anchor:'flow', mesaj:'Kuyu debisi girilmedi – sistem debi yeterliliğini doğrulayamıyor. Sondaj raporu paylaşılırsa kesin söz verilebilir; o zamana kadar kurulum önerisi "şartlı uygun"dur.'});

  // Uzak nokta geometri override uyarısı
  if(s1.uzakRevised){
    U.push({
      tip:'warn', anchor:'pipe',
      mesaj:'Girilen en uzak nokta ('+s1.uzakRaw+' m) arazi geometrisine göre fiziksel olarak mümkün değil. '+
            'Kare arazi kabulüyle '+s1.uzakKullanilan+' m\'ye revize edildi (ana hat + en uzun lateral). '+
            'Kesin ölçü için arazi en/boy girdisi daha net sonuç verir.'
    });
  }
  if(s1.hidrolikMinZon>1 && (S.hatSayisi||1)<s1.hidrolikMinZon)
    U.push({tip:'krit', anchor:'zone', mesaj:'Girilen '+(S.hatSayisi||1)+' zon degeri arazideki yerlesimi ayni anda calistirmaya yetmiyor. Debiye gore en az '+s1.hidrolikMinZon+' zon gerekir; sistem bunu otomatik bolmelidir.'});

  // Dinamik su seviyesi
  if(rec.kuyuTabanYakin)
    U.push({tip:'krit', anchor:'well', mesaj:'Dinamik su seviyesi ('+Math.round(ds)+' m) kuyu tabanına çok yakın. Pompa hava çekebilir – kuru çalışma koruması zorunlu.'});
  else if(rec.kuyuTabanSinir)
    U.push({tip:'warn', anchor:'well', mesaj:'Kuyu sınırda çalışıyor – güvenlik payı az. İzleme önerilir.'});

  // Kuruma riski
  if(S.kurumaRisk==='var')
    U.push({tip:'warn', anchor:'well', mesaj:'Kuyuda kuruma riski var – kuru çalışma şalteri zorunlu. 2 kuyu seçeneği riski büyük ölçüde azaltır.'});

  // İnterferans
  if(S.kuyuSayisi>1 && S.kuyuMesafe<100)
    U.push({tip:'krit', anchor:'well', mesaj:'Kuyular birbirine çok yakın ('+S.kuyuMesafe+' m) – birbirlerinin debisini etkileyebilir. Min 100 m önerilir.'});
  else if(S.kuyuSayisi>1 && S.kuyuMesafe<150)
    U.push({tip:'warn', anchor:'well', mesaj:'Kuyular arası mesafe sınırda – üretim kaybı olabilir, izleme önerilir.'});

  if(rec.tipi==='depolu')
    U.push({tip:'info', anchor:'general', mesaj:'Depolu çözüm, düşük debili kuyularda sulamayı daha rahat yönetmenizi sağlar.'});
  else if(rec.tipi==='zonlu')
    U.push({tip:'info', anchor:'zone', mesaj:'Sulamayı bölerek yapmak pompa yükünü düşürür ve basıncı rahatlatır.'});

  if(s2 && s3 && s3.kararPuani+4 < s2.kararPuani)
    U.push({tip:'info', anchor:'general', mesaj:'3 kuyu bu arazi için gereksiz olabilir. 2 kuyulu çözüm daha dengeli görünüyor.'});

  // Sanity check uyarılarını da entegre et — layoutSanity'den gelenler
  if(typeof buildLayoutSanityWarnings==='function'){
    try{
      const sanityList = buildLayoutSanityWarnings();
      sanityList.forEach(item=>U.push(item));
    }catch(e){ /* sessiz geç — sanity check kritik değil */ }
  }

  // Bütün iyiyse
  if(U.length===0)
    U.push({tip:'ok', anchor:'general', mesaj:'Girilen verilerle sistemin ana parametreleri uyumlu. Kesin teklif için saha keşfi önerilir.'});

  return U;
}

const ENGINE = {
  sortByDecision(list){
    return list.slice().sort((a,b)=>
      (b.kararPuani-a.kararPuani) ||
      (b.guvenSkoru-a.guvenSkoru) ||
      (b.uygunlukSkoru-a.uygunlukSkoru)
    );
  },
  selectDistinct(list, used, sorter){
    const adaylar = list.filter(s=>!used.includes(s));
    return adaylar.slice().sort(sorter)[0] || used[0] || list[0];
  },
  buildAssumptions(zon){
    const varsayimlar = [];
    if(!S.uzakNokta) varsayimlar.push('En uzak nokta girilmediği için 150 m hat kabul edildi.');
    if(S.dmod!=='biliyorum' && S.statikSu>0) varsayimlar.push('Dinamik su seviyesi, statik suyun yaklaşık %30 üzerinde varsayıldı.');
    if(!S.kuyuDebi) varsayimlar.push('Kuyu debisi girilmedi; debi uygunluğu sondaj raporuyla netleşir.');
    if(zon.autoAdjusted) varsayimlar.push('Girilen zon değeri hidrolik olarak yetersiz kaldı; sistem minimum gerekli zon sayısını otomatik artırdı.');
    if(zon.tip==='tahmini') varsayimlar.push('Zon önerisi hızlı ön tahmindir; detaylı proje ile netleşir.');
    if(S.sulamaYontem==='damla' && isTreeBasedProduction()) varsayimlar.push(getProductionTypeName() + ' için kesin damla planı sıra / ağaç yerleşimiyle netleşir.');
    if(S.uretimTipi==='ozel') varsayimlar.push('Karma / özel düzen seçildiği için malzeme listesi ön keşif seviyesinde üretildi.');
    if(S.uretimTipi==='tarla' && S.tipEkiliOran>0 && S.tipEkiliOran<100) varsayimlar.push('Tarla hesabında ekili alan oranı %' + S.tipEkiliOran + ' kabul edildi.');
    if(S.sulamaYontem==='yagmurlama' && S.spBasinc>0) varsayimlar.push('Sprinkler çalışma basıncı kullanıcı verisi olarak kullanıldı.');
    if(S.sistemTercih!=='sebeke') varsayimlar.push('Solar boyutlandırma tipik panel gücü ve il bazlı güneş verisi ile ön boyutlandırıldı.');
    return varsayimlar;
  },
  analyze(){
    const scenarios = uretSenaryolar();
    const visibleScenarios = mantikliSenaryolar(scenarios);
    const zonByScenario = {};
    const bomByScenario = {};
    scenarios.forEach(s=>{
      const zon = hesapZon(s);
      zonByScenario[s.tipi] = zon;
      bomByScenario[s.tipi] = buildBomForScenario(s, zon);
    });
    const recommended = this.sortByDecision(visibleScenarios)[0] || this.sortByDecision(scenarios)[0];
    let economic = this.selectDistinct(
      visibleScenarios,
      [recommended],
      (a,b)=>(b.ekonomiSkoru-a.ekonomiSkoru) || (b.kararPuani-a.kararPuani)
    );
    if(economic===recommended && visibleScenarios.length>1){
      economic = this.selectDistinct(
        visibleScenarios,
        [recommended],
        (a,b)=>(b.kararPuani-a.kararPuani) || (b.ekonomiSkoru-a.ekonomiSkoru)
      );
    }
    let safer = this.selectDistinct(
      visibleScenarios,
      uniqueScenarioRefs([recommended,economic]),
      (a,b)=>(b.guvenSkoru-a.guvenSkoru) || (b.kararPuani-a.kararPuani)
    );
    if(safer===economic && visibleScenarios.length>2){
      safer = this.selectDistinct(
        visibleScenarios,
        uniqueScenarioRefs([recommended,economic]),
        (a,b)=>(b.kararPuani-a.kararPuani) || (b.uygunlukSkoru-a.uygunlukSkoru)
      );
    }
    const zon = zonByScenario[recommended.tipi];
    const assumptions = this.buildAssumptions(zon);
    const warnings = muhendisYorum(scenarios, recommended);
    const cost = calcCostConfidence({scenarios, visibleScenarios, recommended, economic, safer, zon, assumptions});

    return {
      scenarios,
      visibleScenarios,
      recommended,
      economic,
      safer,
      zon,
      zonByScenario,
      bomByScenario,
      recommendedBom:bomByScenario[recommended.tipi],
      assumptions,
      warnings,
      cost,
      su:hesapSu(),
      ds:getDin()
    };
  }
};

/* "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•
   UI HANDLER KATMANI – Radio, alanlar, tahmin panelleri
   "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"• */

/* Radio setup */
document.querySelectorAll('[id^="rb_"]').forEach(grp=>{
  grp.querySelectorAll('.rb').forEach(btn=>{
    btn.addEventListener('click',()=>{
      grp.querySelectorAll('.rb').forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const key=grp.id.replace('rb_','');
      S[key]=btn.dataset.val;
      if(key==='egimDurum') document.getElementById('kotGrup').style.display=btn.dataset.val==='egimli'?'block':'none';
      if(key==='sistemTercih'||key==='sebekeDurum') chkSebeke();
      if(key==='sulamaYontem'){
        // Yöntem değişince su ve basınç resetleniyor
        S.gunlukSu=0; S.gunlukSuState='empty';
        S.basinc=0; S.basincState='empty';
        document.getElementById('gunlukSu').value='';
        document.getElementById('basinc').value='';
        setFieldState('gunlukSu','','Sulama yöntemi değişti – su tahmini güncellendi.');
        setFieldState('basinc','','Boş – otomatik hesap aktif.');
        renderProductionDetailFields();
        updateDripAdvancedUI();
        onAdv();
        renderSuPanel(); renderBasincPanel();
      }
      if(key==='teslimNokta') renderBasincPanel();
    });
  });
});

function chkSebeke(){
  const w=document.getElementById('sebeWarn');
  if(S.sistemTercih==='sebeke'){ w.style.display='flex'; document.getElementById('panelYerGrup').style.display='none'; }
  else { w.style.display='none'; document.getElementById('panelYerGrup').style.display='flex'; }
}

/* Field handlers */
function onField(id){
  const el=document.getElementById(id);
  if(id==='kuyuSayisi'){ S.kuyuSayisi=parseInt(el.value)||1; renderValidationPanel(); return; }
  const v=parseFloat(el.value)||0; S[id]=v;
  if(id==='dinamikSu'||id==='statikSu'||id==='kuyuDerinlik') validateKuyu();
  if(id==='kuyuMesafe'){
    const fn=document.getElementById('fn_kuyuMesafe');
    if(!fn) return;
    if(v>0 && v<100){ fn.className='field-note err'; fn.textContent='⚠  '+v+' m çok yakın – kuyular birbirini etkileyebilir (min 100 m).'; }
    else if(v>=100 && v<150){ fn.className='field-note'; fn.style.color='var(--or)'; fn.textContent='⚠  Orta mesafe – izleme önerilir.'; }
    else if(v>=150){ fn.className='field-note st-manual'; fn.textContent='✓ Güvenli mesafe.'; }
  }
  renderValidationPanel();
}
