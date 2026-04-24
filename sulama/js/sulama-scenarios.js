/* sulama-scenarios.js — Senaryo üretimi: hesapSenaryo, uretSenaryolar, hesapZon */


function getSolarSizingProfile(){
  const systemPref = String(S.sistemTercih || 'solar').toLowerCase();
  const isSolarOnly = systemPref === 'solar' || systemPref === 'gunes';
  const band = isSolarOnly
    ? {
        minimum: 2.20,
        balanced: 2.35,
        reserve: 2.50,
        modeLabel: 'Sadece güneş'
      }
    : {
        minimum: 1.70,
        balanced: 1.85,
        reserve: 2.05,
        modeLabel: 'Güneş + şebeke'
      };
  const hasCost = typeof isMaliyetMode === 'function' && isMaliyetMode();
  const hasLong = typeof isUzunOmurMode === 'function' && isUzunOmurMode();
  const hasEff = typeof isVerimliMode === 'function' && isVerimliMode();
  if(hasCost){
    return {
      factor: band.minimum,
      tier: 'minimum',
      label: 'Minimum çalışır kurulum',
      note: band.modeLabel + ' modunda ilk yatırım alt bantta tutulur; düşük ışınım ve sıcak panel koşullarında rezerv sınırlıdır.'
    };
  }
  if(hasLong && hasEff){
    return {
      factor: band.reserve,
      tier: 'reserve',
      label: 'Güvenli rezervli kurulum',
      note: band.modeLabel + ' modunda sıcaklık, kirlenme ve zayıf ışınım için daha rahat güvenlik payı bırakılır.'
    };
  }
  if(hasEff){
    return {
      factor: band.reserve,
      tier: 'reserve',
      label: 'Güvenli rezervli kurulum',
      note: band.modeLabel + ' modunda premium verim hedefi için enerji paketi daha geniş rezerv ile seçilir.'
    };
  }
  return {
    factor: band.balanced,
    tier: 'balanced',
    label: 'Dengeli kurulum',
    note: band.modeLabel + ' modunda tipik saha kayıpları için dengeli ve savunulabilir bir ön boyutlandırma uygulanır.'
  };
}


function evaluateSolarSizing(secPompGuc, totKwp, psh, runtimeHours, profile){
  const systemPref = String(S.sistemTercih || 'solar').toLowerCase();
  const isSolarOnly = systemPref === 'solar' || systemPref === 'gunes';
  const band = isSolarOnly
    ? { assist:2.20, minimum:2.20, balanced:2.35, reserve:2.50 }
    : { assist:1.70, minimum:1.70, balanced:1.85, reserve:2.05 };
  const dcAcRatio = secPompGuc > 0 ? round1(totKwp / secPompGuc) : 0;
  const assistKwp = round1(secPompGuc * band.assist);
  const minKwp = round1(secPompGuc * band.minimum);
  const balancedKwp = Math.max(minKwp, round1(secPompGuc * band.balanced));
  const reserveKwp = Math.max(balancedKwp, round1(secPompGuc * band.reserve));
  const actualKwp = Math.max(0, Number(totKwp) || 0);
  let state = 'minimum';
  let label = 'Minimum calisir kurulum';
  let summary = 'Bu pompa gucu icin gunes paketi minimum calisir bantta tutuldu; rezerv sinirlidir.';

  if(actualKwp < assistKwp){
    state = 'assist';
    label = 'Sebeke destegi onerilir';
    summary = 'Bu pompa gucu icin kurulu guc minimum guven bandinin altinda kalir; destek gerekir.';
  } else if(actualKwp < balancedKwp){
    state = 'minimum';
    label = 'Minimum calisir kurulum';
    summary = 'Bu pompa icin minimum kurulu guc saglandi; ancak dusuk isinim ve sicak panel kosullarinda sinirdadir.';
  } else if(actualKwp < reserveKwp){
    state = 'balanced';
    label = 'Dengeli kurulum';
    summary = 'Bu pompa gucu icin dengeli guc bandi saglandi; tipik sezonda daha rahat calisir.';
  } else {
    state = 'reserve';
    label = 'Guvenli rezervli kurulum';
    summary = 'Bu pompa gucu icin rezervli kurulu guc saglandi; bulut, sicaklik ve yaslanma kayiplarina karsi daha rahat davranir.';
  }

  if(systemPref === 'hibrit' && (state === 'assist' || state === 'minimum')){
    summary += ' Hibrit kurguda sebeke gecisi guvenligini belirgin artirir.';
  } else if((systemPref === 'solar' || systemPref === 'gunes') && state !== 'reserve'){
    summary += ' Tam bagimsiz calisma iddiasi kurulmaz; sezon ve calisma disiplini onemlidir.';
  }

  return {
    factor: profile && profile.factor ? profile.factor : (isSolarOnly ? 2.20 : 1.70),
    profileLabel: profile && profile.label ? profile.label : label,
    profileNote: profile && profile.note ? profile.note : '',
    state,
    label,
    summary,
    dcAcRatio,
    psh,
    runtimeHours,
    assistKwp,
    minKwp,
    balancedKwp,
    reserveKwp,
    absoluteMinKwp: 0
  };
}

function hesapSenaryo(cfg){
  const {nKuyu:_inputKuyu=1, nHat=S.hatSayisi||1, sSure=S.calismaSure||8,
         teslim=S.teslimNokta, basincOvrd=null, label, desc, tipi} = cfg;
  const nKuyu = 1;

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
  // Panel gücü: Yüksek Verimli → 600W monokristal premium, Maliyet → 460W ekonomik, diğer → 540W
  const pW = (typeof isVerimliMode==='function'&&isVerimliMode()) ? 600
            : (typeof isMaliyetMode==='function'&&isMaliyetMode()) ? 460
            : 540;

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
  // Pompa güç katsayısı: Yüksek Verimli → %15 ekstra (yüksek verimli pompa kategorisi),
  // Uzun Ömürlü → %10 ekstra (konforlu çalışma noktası), Maliyet → değişiklik yok
  if(typeof isVerimliMode==='function'&&isVerimliMode()) pompGucu *= 1.15;
  if(typeof isUzunOmurMode==='function'&&isUzunOmurMode()) pompGucu *= 1.10;
  let secPompGuc = secPomp(pompGucu, basmaYuk);

  // Solar (ilk hesap — zon kontrolünden önce; aşağıda override sonrası yeniden hesaplanır)
  const solarProfile = getSolarSizingProfile();
  const SOLAR_PERF_FACTOR = 0.85;
  const SOLAR_SIZING_FACTOR = solarProfile.factor;

  // Debi kontrolü + öneri
  const kDebi = S.kuyuDebi || 0;
  let debiDurum='unknown', debiMesaj='Kuyu debisi girilmedi. Sondaj debi teyidi ile netlestirilmelidir.', debiOneriler=[], debiOran=0;
  if(kDebi>0){
    debiOran = pompaBasiDebi / kDebi;
    if(debiOran<=0.85){
      debiDurum='ok';
      debiMesaj = 'Kuyu debisi yeterli. Gerekli ' + pompaBasiDebi.toFixed(1) + ' T/s, mevcut ' + kDebi + ' T/s.';
    } else if(debiOran<=1.05){
      debiDurum='border';
      debiMesaj = 'Sinirda calisma. Gerekli debi mevcut kuyu debisine cok yakin.';
      debiOneriler=['Calisma suresini artirin','Depolu tampon kullanin','Sulamayi zonlara bolun'];
    } else {
      debiDurum='bad';
      debiMesaj = 'Kuyu debisi yetersiz. Gerekli ' + pompaBasiDebi.toFixed(1) + ' T/s > mevcut ' + kDebi + ' T/s.';
      debiOneriler=[
        'Sureyi '+Math.ceil(gunlukPompaDebi/kDebi*1.05).toFixed(0)+' saate cikar',
        'Depolu tampon sistemi sec',
        'Sulamayi zonlara bol'
      ];
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
  // Tek kuyuda arıza = sistem durur → güvenlik dezavantajı
  if(nKuyu===1) skor-=3;
  // Öncelik ayarı
  if((S.oncelik==='uzunomur'||S.oncelik2==='uzunomur') && nKuyu>1) skor+=6;
  if(S.oncelik==='maliyet' && nKuyu===1) skor+=4;
  if((S.sistemTercih||'solar') !== 'sebeke'){
    // solarSizing henüz hesaplanmadı (zon kontrolünden sonra yapılıyor).
    // Ön tahmin: totKwp bu noktada eski secPompGuc ile hesaplanmış olabilir;
    // skor tahmini olarak kabul et, kesin solarSizing aşağıda üretilecek.
    // Ön tahmin: totKwp henüz hesaplanmadı, PSH ve pW ile anlık tahmini yap
    const _preTargetKwp = Math.max(
      (secPompGuc * sSure) / (PSH * 0.85),
      secPompGuc * 2.2
    );
    const _sSt = _preTargetKwp >= secPompGuc * 2.2 ? 'reserve'
               : _preTargetKwp >= secPompGuc * 1.7 ? 'balanced'
               : _preTargetKwp >= secPompGuc * 1.3 ? 'assist'
               : 'minimum';
    if(_sSt === 'assist') skor -= 12;
    else if(_sSt === 'minimum') skor -= 6;
    else if(_sSt === 'reserve') skor += 4;
  }

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
    ((secPompGuc * nKuyu)*1.2) -
    ((nKuyu-1)*9) -
    (teslim==='depo'?12:0) -
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

  // ── ZON KALİTE KONTROLÜ (v7.9) ──────────────────────────────────────────────
  // Kural: Damla sisteminde 1 zon < 2 dönüme düşerse pompa yetersiz kalır;
  //        bir üst standart kademeye geç.
  // Koşullar:
  //   • Sadece damla (yağmurlama/salma farklı dinamik)
  //   • Arazi > 4 dönüm (çok küçük arazide gereksiz büyütmeyi engelle)
  //   • effectiveZones > 2 (1–2 zon zaten iyi bölünmüş demektir)
  //   • 1 zon başına dönüm < 2.0 eşiği
  let _zonKaliteYukseltildi = false;
  if(S.sulamaYontem === 'damla' && hydraulicPreview && (S.araziDonum || 0) > 4){
    const _effZon = hydraulicPreview.effectiveZones || 1;
    const _donumPerZon = S.araziDonum / _effZon;
    if(_donumPerZon < 2.0 && _effZon > 2){
      const _idx = STD_POMP.indexOf(secPompGuc);
      if(_idx >= 0 && _idx < STD_POMP.length - 1){
        secPompGuc = STD_POMP[_idx + 1];
        _zonKaliteYukseltildi = true;
      }
    }
  }

  // Bağımlı pompa/solar değerleri — secPompGuc artık kesin değerde ──────────────
  // (Zon kontrolü secPompGuc'u yükseltmiş olabilir; tüm türevleri buradan üretin)
  const pompHP     = (secPompGuc * 1.36).toFixed(1);
  const toplamKW   = +(secPompGuc * nKuyu).toFixed(2);

  // Solar — BUG FIX (v7.8): SOLAR_SIZING_FACTOR runtime formülünde iki kez uygulanıyordu.
  // Enerji dengesi yöntemi: ham ihtiyaç = gunlukE / (PSH × perfFactor) — faktörsüz.
  // Boyutlandırma faktörü YALNIZCA direct yöntemde (pompGuc × factor) uygulanır.
  const gunlukE  = secPompGuc * sSure;
  const solarRuntimeNeedKwp = gunlukE / (PSH * SOLAR_PERF_FACTOR);
  const solarDirectNeedKwp  = secPompGuc * SOLAR_SIZING_FACTOR;
  const solarTargetKwp      = Math.max(solarRuntimeNeedKwp, solarDirectNeedKwp);
  const pSay     = Math.ceil(solarTargetKwp * 1000 / pW);
  const toplamP  = pSay * nKuyu;
  const totKwp   = +((toplamP * pW / 1000).toFixed(1));
  const invKW    = secInv(secPompGuc * 1.1);
  const solarSizing = evaluateSolarSizing(secPompGuc, totKwp, PSH, sSure, solarProfile);
  // ─────────────────────────────────────────────────────────────────────────────

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
    kWGer, pSay, toplamP, totKwp, invKW, pW, zonKaliteYukseltildi:_zonKaliteYukseltildi,
    solarSizingFactor:SOLAR_SIZING_FACTOR,
    solarPerfFactor:SOLAR_PERF_FACTOR,
    solarSizingState:solarSizing.state,
    solarSizingLabel:solarSizing.label,
    solarSizingText:solarSizing.summary,
    solarSizingProfile:solarSizing.profileLabel,
    solarSizingProfileNote:solarSizing.profileNote,
    solarDcAcRatio:solarSizing.dcAcRatio,
    solarAssistKwp:solarSizing.assistKwp,
    solarMinKwp:solarSizing.minKwp,
    solarBalancedKwp:solarSizing.balancedKwp,
    solarReserveKwp:solarSizing.reserveKwp,
    solarAbsoluteMinKwp:solarSizing.absoluteMinKwp,
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
   Piyasa verisi yok → her zaman 'low'. Sadece göreli yorum yapılabilir.
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
  if(!systemStable) blockers.push('Sistem tipi hala alternatifli.');
  if(!zonNet && S.sulamaYontem!=='salma') blockers.push('Hat ve zon düzeni ön keşif seviyesinde.');
  if(S.sistemTercih!=='sebeke') blockers.push('Panel ve inverter markası/modeli seçilmedi.');
  if(S.kuyuDurum!=='mevcut') blockers.push('Sondaj, izin ve proje bedelleri keşifle netleşir.');

  let level = blockers.length>=6 ? 'none' : blockers.length>=2 ? 'low' : blockers.length===1 ? 'medium' : 'high';
  if(!hasCurrentPriceList || !laborModelClear) level = blockers.length>=5 ? 'none' : 'low';

  let relativeComment = 'Bu aşamada sadece teknik uygunluk ve çözüm önerisi verilebilir.';
  if(engine?.economic){
    if(engine.economic===recommended){
      relativeComment = 'Önerilen çözüm aynı zamanda ilk yatırım tarafında da dengeli görünüyor.';
    } else if(engine.economic.tipi==='zonlu'){
      relativeComment = 'Bu aşamada en doğru yorum: bölünmüş sulama ilk yatırım tarafında daha hafif olabilir.';
    } else if(engine.economic.tipi==='depolu'){
      relativeComment = 'Bu aşamada en doğru yorum: depolu çözüm düşük debili kuyularda daha rahat işletme sağlayabilir.';
    } else if(engine.economic.nKuyu===1){
      relativeComment = 'Bu aşamada en doğru yorum: tek kuyu çözüm ilk yatırım tarafında daha hafif olabilir.';
    } else {
      relativeComment = 'Bu aşamada en doğru yorum: '+getScenarioDisplayName(engine.economic).toLowerCase()+' ilk yatırım tarafında daha hafif olabilir.';
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
  const debiUnknown = senaryo.debiDurum === 'unknown';
  const solarTight = (String(S.sistemTercih || 'solar') !== 'sebeke') && (senaryo.solarSizingState === 'assist' || senaryo.solarSizingState === 'minimum');
  if(senaryo.debiDurum === 'bad' || senaryo.basincDurum === 'kritik'){
    return { cls:'red', icon:'🔴', status:'Önerilmez', desc:'Bu haliyle kurulum zorlanır. Debi, basınç veya çalışma düzeni revize edilmelidir.' };
  }
  if(debiUnknown){
    return { cls:'yellow', icon:'🟡', status:'Şartlı uygun', desc:'Kuyu debisi teyit edilmediği için sonuç ön keşif seviyesindedir; kesin uygunluk söylenmez.' };
  }
  if(s >= 78 && senaryo.debiDurum === 'ok' && senaryo.basincDurum === 'ok' && !solarTight){
    return { cls:'green', icon:'🟢', status:'Uygun', desc:'Mevcut verilerle bu sistem savunulabilir ve çalışma rezervi makul görünüyor.' };
  }
  if(s >= 60 || senaryo.debiDurum === 'border' || senaryo.basincDurum === 'sinir' || senaryo.basincDurum === 'yuksek' || solarTight){
    return { cls:'yellow', icon:'🟡', status:'Sınırda', desc:'Bu çözüm çalışabilir; ancak debi, enerji rezervi veya zon yönetimi dikkatle ele alınmalıdır.' };
  }
  return { cls:'red', icon:'🔴', status:'Önerilmez', desc:'Bu haliyle kurulum risklidir. Sulamayı zonlamak, depolu kurguya geçmek veya pompa/enerji boyutunu revize etmek gerekir.' };
}

/* –– ÇİFTÇİ DİLİNDE "NEDEN" METNİ ––––––––––––––––––––––––––––––––––– */
function farmerWhy(senaryo){
  if(senaryo.debiDurum==='unknown') return '<b>Bu sonuç şartlı uygundur.</b> Kuyu debisi bilinmediği için tasarım ancak ön keşif seviyesinde yorumlanır.';
  if(senaryo.tipi==='tek')      return '<b>En sade çözüm budur.</b> Kuyu debisi ve basınç rezervi uygunsa kurulum ve bakım kolay olur.';
  if(senaryo.tipi==='zonlu')    return '<b>Zonlama bu senaryoda gereklidir.</b> Aynı anda tüm hatlar açılamadığı için sulama sırayla yapılır.';
  if(senaryo.tipi==='depolu')   return '<b>Depo tamponu bu senaryoda gereklidir.</b> Kuyu yavaş dolsa bile sulama daha kontrollü ve dengeli yapılır.';
  return '';
}

/* –– ÇİFTÇİ DİLİNDE "FAYDA" METNİ ––––––––––––––––––––––––––––––––––– */
function farmerBenefit(senaryo){
  const parcalar=[];
  if(senaryo.basincDurum==='ok') parcalar.push('pompa rahat aralıkta çalışır');
  if(senaryo.debiDurum==='ok')   parcalar.push('kuyu suyu düzeni taşır');
  if(senaryo.teslim==='depo')    parcalar.push('düşük debide kullanım rahatlar');
  if(senaryo.tipi==='zonlu')     parcalar.push('aynı anda tüm hatlar açılmadığı için yük azalır');
  if(parcalar.length===0)        parcalar.push('hesaplar bu düzenin çalışabileceğini gösteriyor');
  return parcalar.join(', ').replace(/, ([^,]*)$/,' ve $1')+'.';
}

/* –– 5 SENARYO ÜRETİMİ –––––––––––––––––––––––––––––––––––––––––––––– */
function uretSenaryolar(){
  const sure = Math.max(1, Number(S.calismaSure) || 8);
  // Kullanıcının verdiği günlük çalışma süresi sabittir; senaryo üretimi süreyi zorla değiştirmez.
  const zonluSure = sure;
  const depoluSure = sure;
  const kuyuSayisi = 1;
  S.kuyuSayisi = 1;
  const baseType = 'tek';
  const baseLabel = 'Tek Kuyu Sistem';
  const baseDesc = '1 kuyu · 1 pompa · dogrudan';
  const zonluLabel = 'Bolunmus (Zonlu) Sulama';
  const zonluDesc = '1 kuyu · zon kontrollu';
  const depoluLabel = 'Depolu Tampon Sistem';
  const depoluDesc = '1 kuyu · depo tamponu';
  const senaryolar = [
    // S1 – Tek kuyu doğrudan sistem
    hesapSenaryo({
      nKuyu:kuyuSayisi, nHat:S.hatSayisi||1, sSure:sure,
      teslim:S.teslimNokta, tipi:baseType,
      label:baseLabel, desc:baseDesc
    }),
    // S2 – Zonlanmış (kullanıcının verdiği süre korunur)
    hesapSenaryo({
      nKuyu:kuyuSayisi, nHat:1, sSure:zonluSure,
      teslim:S.teslimNokta, tipi:'zonlu',
      label:zonluLabel,
      desc:zonluDesc
    }),
    // S3 – Depolu (kullanıcının verdiği süre korunur)
    hesapSenaryo({
      nKuyu:kuyuSayisi, nHat:S.hatSayisi||1, sSure:depoluSure,
      teslim:'depo', tipi:'depolu',
      label:depoluLabel,
      desc:depoluDesc
    })
  ];
  const maxS = Math.max(...senaryolar.map(s=>s.kararPuani));
  senaryolar.forEach(s=>{ s.onerilen = s.kararPuani===maxS; });
  return senaryolar;
}

/* –– FİLTRE: Gösterilmeye değer senaryolar –––––––––––––––––––––––– */
function mantikliSenaryolar(tümü){
  const baz = tümü.find(s=>s.tipi==='tek') || tümü[0];
  const zonlu = tümü.find(s=>s.tipi==='zonlu');
  const depolu = tümü.find(s=>s.tipi==='depolu');

  // Kritik kural: tek kuyu debi/basınç sınırda ya da kötü ise sadece zonlu + depolu göster.
  const tekKuyuSinirda = !!baz && (baz.debiDurum==='bad' || baz.debiDurum==='border' || baz.basincDurum==='kritik' || baz.basincDurum==='yuksek');
  if(tekKuyuSinirda){
    const kritikAlternatifler = [zonlu, depolu].filter(Boolean);
    return kritikAlternatifler.length ? kritikAlternatifler : tümü.filter(s=>s.tipi!=='tek');
  }

  const filtreli = tümü.filter(s=>{
    if((s.kararPuani||0)<35) return false;
    if(s.tipi==='depolu'){
      return baz.debiDurum!=='ok' || S.teslimNokta==='depo' || S.kurumaRisk==='var';
    }
    if(s.tipi==='zonlu'){
      return S.hatSayisi>1 || baz.hidrolikMinZon>1 || baz.basincDurum!=='ok' || baz.debiDurum!=='ok' || S.advParamGirildi;
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
    if(!(sp && sp.sprinklerCount>0)) return null;

    // BUG FIX (v7.8): Kullanıcı sprinkler parametresi (aralik+debi) girmemişse
    // hidrolik zon hesabı güvenilmez: 12x12m grid + 1.5 m3/h varsayımları tutarsız,
    // 10 dönüm tarla için 8-10 zon gibi şişirilmiş sonuç üretiyordu.
    // exact=false → parametreler tahmini → zon = hatSayisi (kullanıcı kontrolünde), uyarı göster.
    // exact=true  → kullanıcı gerçek aralık+debi girdi → hidrolik hesap yap.
    if(!sp.exact){
      const estimatedZones = Math.max(1, talepEdilenZon);
      return {
        tip:'tahmini',
        kategori:'sprinkler',
        unitLabel:'sprinkler',
        unitFlow: sp.headFlow > 0 ? sp.headFlow : null,
        totalUnits:sp.sprinklerCount,
        layoutDemandM3h:null,
        availableFlowM3h:round1(uygunDebi),
        maxUnits:null,
        activeUnits:sp.sprinklerCount,
        minZones:estimatedZones,
        rawMinZones:estimatedZones,
        zonCapped:false,
        requestedZones:talepEdilenZon,
        effectiveZones:estimatedZones,
        autoAdjusted:false,
        zoneFlowM3h:null,
        exact:false,
        uyariMesaj:'Başlık aralığı ve debisi girilmediğinden zon sayısı hidrolik hesaplanamadı. Doğru zon planı için sprinkler tipini ve aralığını girin.'
      };
    }

    // exact=true: kullanıcı aralık+debi girdi → gerçek hidrolik hesap
    const effectiveHeadFlow = sp.headFlow;
    const maxUnits = Math.max(1, Math.floor(uygunDebi / effectiveHeadFlow));
    const rawMinZones = Math.max(1, Math.ceil(sp.sprinklerCount / maxUnits));
    const zonCap = Math.max(4, Math.round((S.araziDonum||10) * 1.5));
    const minZones = Math.min(rawMinZones, zonCap);
    const effectiveZones = Math.max(minZones, talepEdilenZon);
    const activeUnits = Math.max(1, Math.min(maxUnits, Math.ceil(sp.sprinklerCount / effectiveZones)));
    return {
      tip:sp.exact ? 'gercek' : 'tahmini',
      kategori:'sprinkler',
      unitLabel:'sprinkler',
      unitFlow:effectiveHeadFlow,
      totalUnits:sp.sprinklerCount,
      layoutDemandM3h:round1(sp.sprinklerCount * effectiveHeadFlow),
      availableFlowM3h:round1(uygunDebi),
      maxUnits,
      activeUnits,
      minZones,
      rawMinZones,
      zonCapped: rawMinZones > zonCap,
      requestedZones:talepEdilenZon,
      effectiveZones,
      autoAdjusted:talepEdilenZon < minZones,
      zoneFlowM3h:round1(activeUnits * effectiveHeadFlow),
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
  const ds = getDin();
  const kotF = S.egimDurum==='egimli'?(S.kotFarki||0):0;

  // Basınç çok yüksek
  if(s1.basincDurum==='kritik')
    U.push({tip:'krit', anchor:'pressure', mesaj:'Basınç çok yüksek – sulama ekipmanları zarar görebilir. Sistem 2 parçaya bölünmeli veya regülatör konulmalı.'});
  else if(s1.basincDurum==='yuksek')
    U.push({tip:'warn', anchor:'pressure', mesaj:'Basınç yüksek – basınç düşürücü (PRV) ve zonlu çalışma önerilir.'});

  // Kot farkı
  if(kotF>20)
    U.push({tip:'warn', anchor:'pressure', mesaj:'Arazi eğimli ('+kotF+' m) – pompanın ekstra basınç üretmesi gerekir. Zonlu/depolu kurgu bu yükü rahatlatır.'});

  // Debi yetersiz
  if(s1.debiDurum==='bad'){
    U.push({tip:'krit', anchor:'flow', mesaj:'Tek kuyu bu debiye yetmiyor. Sulamayi zonlara bolmek veya depolu tampon sisteme gecmek gerekir.'});
  } else if(s1.debiDurum==='border')
    U.push({tip:'warn', anchor:'flow', mesaj:'Kuyu debisi sınırda – çalışma süresi uzatılmalı, zonlu veya depolu kurgu tercih edilmelidir.'});
  else if(s1.debiDurum==='unknown')
    U.push({tip:'krit', anchor:'flow', mesaj:'Kuyu debisi girilmedi – sistem debi yeterliliğini doğrulayamıyor. Bu nedenle sonuç sadece şartlı uygundur; sondaj raporu olmadan kesin uygunluk söylenmez.'});

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
  if(rec.hidrolikMinZon>1 || rec.tipi==='zonlu' || rec.teslim==='depo')
    U.push({tip:'krit', anchor:'zone', mesaj:'Bu senaryoda tum hatlar ayni anda acilmaz. Zonlu veya depolu calisma konfor degil, teknik gerekliliktir.'});

  // Dinamik su seviyesi
  if(rec.kuyuTabanYakin)
    U.push({tip:'krit', anchor:'well', mesaj:'Dinamik su seviyesi ('+Math.round(ds)+' m) kuyu tabanına çok yakın. Pompa hava çekebilir – kuru çalışma koruması zorunlu.'});
  else if(rec.kuyuTabanSinir)
    U.push({tip:'warn', anchor:'well', mesaj:'Kuyu sınırda çalışıyor – güvenlik payı az. İzleme önerilir.'});

  // Kuruma riski
  if(S.kurumaRisk==='var')
    U.push({tip:'warn', anchor:'well', mesaj:'Kuyuda kuruma riski var – kuru çalışma şalteri zorunlu. Zonlu veya depolu kurgu tercih edilmelidir.'});

  if((S.sistemTercih||'solar') !== 'sebeke'){
    if(rec.solarSizingState==='assist'){
      U.push({tip:'krit', anchor:'energy', mesaj:'Mevcut solar on boyut pompayi tek basina rahat tasimaz. Sebeke destegi veya en az '+rec.solarBalancedKwp+'-'+rec.solarReserveKwp+' kWp bandi degerlendirilmelidir.'});
    } else if(rec.solarSizingState==='minimum'){
      U.push({tip:'warn', anchor:'energy', mesaj:'Solar paket minimum calisir bantta. Daha rahat ve savunulabilir calisma icin yaklasik '+rec.solarBalancedKwp+'-'+rec.solarReserveKwp+' kWp bandi daha guvenlidir.'});
    } else if(rec.solarSizingState==='balanced'){
      U.push({tip:'info', anchor:'energy', mesaj:'Solar boyut dengeli gorunuyor; yine de mevsim, sicaklik ve panel kirlenmesi verimi etkiler.'});
    } else if(rec.solarSizingState==='reserve'){
      U.push({tip:'info', anchor:'energy', mesaj:'Solar boyut rezervli secildi; buna ragmen tam bagimsizlik yerine saha kosullu performans mantigi korunmalidir.'});
    }
  }

  if(rec.tipi==='depolu')
    U.push({tip:'info', anchor:'general', mesaj:'Depolu çözüm, düşük debili kuyularda sulamayı daha rahat yönetmenizi sağlar.'});
  else if(rec.tipi==='zonlu')
    U.push({tip:'info', anchor:'zone', mesaj:'Sulamayı bölerek yapmak pompa yükünü düşürür ve basıncı rahatlatır.'});

  if(s1.debiDurum==='bad' || s1.debiDurum==='border'){
    U.push({
      tip:'info',
      anchor:'general',
      mesaj:'Bilgi notu: Kuyu sayisini artirmak debi yukunu paylastirabilir; ancak sondaj, izin ve ilk yatirim maliyetini artirir. Bu raporda aktif cozumler tek kuyu + zon/depo yaklasimidir.'
    });
  }

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
  getInitialInvestmentScore(s, bomByScenario){
    const summary = (bomByScenario && bomByScenario[s.tipi] && bomByScenario[s.tipi].summary) || {};
    const toplamKW = Number(s.toplamKW || ((s.secPompGuc || 0) * (s.nKuyu || 1)) || 0);
    const mainPipe = Number(summary.mainPipe || 0);
    const totalPipe = Number(summary.totalPipe || 0);
    const approxCount = Number(summary.approxCount || 0);
    const extraRuntime = Math.max(0, Number(s.sSure || 0) - Number(S.calismaSure || 8));
    return (
      toplamKW * 5 +
      Math.max(0, Number(s.nKuyu || 1) - 1) * 16 +
      (s.teslim === 'depo' ? 18 : 0) +
      (s.tipi === 'zonlu' ? 12 : 0) +
      (mainPipe * 0.03) +
      (Math.max(0, totalPipe - mainPipe) * 0.006) +
      (approxCount * 0.75) +
      (extraRuntime * 1.5)
    );
  },
  sortByInitialInvestment(list, bomByScenario){
    return list.slice().sort((a,b)=>
      (this.getInitialInvestmentScore(a, bomByScenario) - this.getInitialInvestmentScore(b, bomByScenario)) ||
      (b.ekonomiSkoru-a.ekonomiSkoru) ||
      (b.kararPuani-a.kararPuani)
    );
  },
  sortBySafety(list){
    return list.slice().sort((a,b)=>
      (b.guvenSkoru-a.guvenSkoru) ||
      ((b.nKuyu || 1) - (a.nKuyu || 1)) ||
      ((b.teslim === 'depo' ? 1 : 0) - (a.teslim === 'depo' ? 1 : 0)) ||
      (b.kararPuani-a.kararPuani)
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
    if(S.sistemTercih!=='sebeke') varsayimlar.push('Solar boyutlandirma, il bazli gunes verisi ve secili enerji boyutlandirma katsayisi ile on boyutlandirildi; tam bagimsizlik iddiasi olarak okunmamalidir.');
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
    const economic = this.sortByInitialInvestment(visibleScenarios, bomByScenario)[0] || recommended;
    const safer = this.sortBySafety(visibleScenarios)[0] || recommended;
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
      if(grp.id==='rb_oncelik') return; // selectHedef() yönetiyor
      if(key==='sulamaYontem'){
        // Yöntem değişince su ve basınç resetleniyor
        S.gunlukSu=0; S.gunlukSuState='empty';
        S.basinc=0; S.basincState='empty';
        document.getElementById('gunlukSu').value='';
        document.getElementById('basinc').value='';
        // Yeni yöntem için hesaplanan su miktarını göster
        const _suTmp = (typeof hesapSu==='function') ? hesapSu() : null;
        const _yontemAd = btn.dataset.val==='damla' ? 'Damla (%92 verim)' : btn.dataset.val==='yagmurlama' ? 'Yağmurlama (%77 verim)' : 'Salma (%55 verim)';
        const _suMsg = _suTmp
          ? '⚠ Yöntem değişti → ' + _yontemAd + ': ' + (_suTmp.aktif||'-') + ' ton/gün (Damla: '+_suTmp.damla+' · Yağmurlama: '+_suTmp.yagmurlama+' ton/gün). Aşağıdan uygulayın.'
          : '⚠ Sulama yöntemi değişti – tahmini su miktarı aşağıda güncellendi.';
        setFieldState('gunlukSu','',_suMsg);
        setFieldState('basinc','','Boş – otomatik hesap aktif.');
        renderProductionDetailFields();
        updateDripAdvancedUI();
        onAdv();
        renderSuPanel(); renderBasincPanel();
        // Yöntem değişince validation'ı yeniden çalıştır (eski yöntemin uyarıları temizlensin)
        if(typeof renderValidationPanel==='function') renderValidationPanel();
      }
      if(key==='teslimNokta') renderBasincPanel();
      if(key==='hatTip' || key==='kabloMalzeme'){ S[key]=btn.dataset.val; }
    });
  });
});

function chkSebeke(){
  const w = document.getElementById('sebeWarn');
  const text = document.getElementById('sebeWarnText');
  const panelGrup = document.getElementById('panelYerGrup');
  const trafoGrup = document.getElementById('trafoGrup');
  const sistemTercih = S.sistemTercih || 'solar';
  const sebekeDurum  = S.sebekeDurum  || 'yok';

  // ── Şebeke yoksa hibrit/sebeke seçenekleri disable et ──
  // "Güneş + Şebeke" ve "Sadece Şebeke" fiziksel olarak şebeke bağlantısı gerektirir.
  const sebekeYok = sebekeDurum === 'yok';
  var sistemGrup = document.getElementById('rb_sistemTercih');
  if(sistemGrup){
    sistemGrup.querySelectorAll('.rb').forEach(function(btn){
      var isGridRequired = (btn.dataset.val === 'hibrit' || btn.dataset.val === 'sebeke');
      if(isGridRequired){
        if(sebekeYok){
          btn.style.opacity = '0.35';
          btn.style.pointerEvents = 'none';
          btn.title = 'Bu seçenek şebeke bağlantısı gerektirir';
          // Eğer şu an bu seçili ise solar'a sıfırla
          if(btn.classList.contains('sel')){
            btn.classList.remove('sel');
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            var solarBtn = sistemGrup.querySelector('[data-val="solar"]');
            if(solarBtn){
              solarBtn.classList.add('sel');
              solarBtn.style.background = '#1A1200';
              solarBtn.style.borderColor = 'var(--gold)';
              solarBtn.style.color = 'var(--gold)';
            }
            S.sistemTercih = 'solar';
          }
        } else {
          btn.style.opacity = '';
          btn.style.pointerEvents = '';
          btn.title = '';
        }
      }
    });
  }

  // Hibrit mod seçilmişse şebeke bağlantısı zorunlu olarak VAR kabul edilir.
  // "Şebeke Yok" seçimi + "Güneş+Şebeke" kombinasyonu çelişkili olduğundan
  // hibrit modda sebekeDurum'u zorla 'var' olarak davran (S state güncellemez, sadece mantık).
  // S.sistemTercih'i yeniden oku — yukarıdaki reset bloğu değiştirmiş olabilir
  const currentSistemTercih = S.sistemTercih || 'solar';
  const hasGridLine = currentSistemTercih === 'hibrit' || currentSistemTercih === 'sebeke';

  // Panel yeri: sadece şebeke modunda gizle
  if(panelGrup){
    panelGrup.style.display = (currentSistemTercih === 'sebeke') ? 'none' : 'flex';
  }
  // Trafo mesafe alanı: şebeke bağlantısı varsa (veya hibrit/sebeke tercihinde) göster
  if(trafoGrup){
    trafoGrup.style.display = hasGridLine ? 'flex' : 'none';
  }
  // Hat tipi ve malzeme seçimi — şebeke bağlantısı varsa göster
  var hatTipGrup     = document.getElementById('hatTipGrup');
  var kabloMalzGrup  = document.getElementById('kabloMalzemeGrup');
  if(hatTipGrup)     hatTipGrup.style.display     = hasGridLine ? 'flex' : 'none';
  if(kabloMalzGrup)  kabloMalzGrup.style.display  = hasGridLine ? 'flex' : 'none';

  // Uyarı bandı — tutarlı ve açık mesajlar
  if(w){
    if(currentSistemTercih === 'sebeke'){
      w.style.display = 'flex';
      if(text) text.textContent = '"Sadece Şebeke" seçildi – solar panel sistemi malzeme listesine dahil edilmeyecek. Trafo/pano mesafesini giriniz.';
    } else if(currentSistemTercih === 'hibrit'){
      w.style.display = 'flex';
      if(text) text.textContent = 'Hibrit mod aktif – güneş paneli ve şebeke malzemeleri birlikte listelenecek. Trafo/pano mesafesini giriniz.';
    } else {
      w.style.display = 'none';
      if(text && sebekeDurum === 'var') text.textContent = 'Yerel şebeke mevcut – trafo/pano mesafesini giriniz.';
    }
  }
}

/* ─────────────────────────────────────────────────────────────────
   HEDEF SEÇİM MOTORU — selectHedef(val, init)
   3 seçenek: 'maliyet' | 'uzunomur' | 'verimli'
   Çakışma kuralı: maliyet tek başına; uzunomur + verimli birlikte seçilebilir.
   S.oncelik  = aktif birincil hedef ('maliyet' | 'uzunomur' | 'verimli' | 'guvenlik')
   S.oncelik2 = ikincil hedef ('verimli' veya '' )
───────────────────────────────────────────────────────────────── */
function selectHedef(val, init){
  var vals = ['maliyet','uzunomur','verimli'];
  if(vals.indexOf(val) === -1) return;

  // Mevcut seçimler
  var curPrimary = S.oncelik  || 'uzunomur';
  var curSecond  = S.oncelik2 || '';

  if(val === 'maliyet'){
    // Maliyet tek başına — diğerlerini sıfırla
    S.oncelik  = 'maliyet';
    S.oncelik2 = '';
  } else {
    // uzunomur veya verimli
    if(S.oncelik === 'maliyet'){
      // Maliyet seçiliyken başka biri tıklandı → maliyeti bırak, yenisini seç
      S.oncelik  = val;
      S.oncelik2 = '';
    } else {
      // Çoklu seçim: uzunomur + verimli
      if(curPrimary === val){
        // Aynısına tıklandı → deseçilirse ikinciye düş; ama en az 1 seçili kalmalı
        if(curSecond){
          S.oncelik  = curSecond;
          S.oncelik2 = '';
        }
        // Tek seçiliyse değiştirme (en az 1 hedef zorunlu)
      } else if(curSecond === val){
        // İkinci seçim deseçiliyor
        S.oncelik2 = '';
      } else {
        // Yeni ekleme — birinciden farklı, mevcut ikinciden farklı
        if(!curSecond && curPrimary !== val){
          S.oncelik2 = val;  // ikinci hedef olarak ekle
        } else {
          // Birinci zaten başka biri → birinciye yaz
          S.oncelik  = val;
          S.oncelik2 = '';
        }
      }
    }
  }

  // UI güncelle
  vals.forEach(function(v){
    var el = document.getElementById('hdf_'+v);
    if(!el) return;
    var isSel = (v === S.oncelik || v === S.oncelik2);
    el.classList.toggle('sel', isSel);
    el.style.background  = isSel ? '#1A1200' : 'var(--dk3)';
    el.style.borderColor = isSel ? 'var(--gold)' : 'var(--bdr)';
    el.style.color       = isSel ? 'var(--gold)' : '';
  });

  // Hint güncelle
  var hint = document.getElementById('hedefHint');
  if(hint){
    if(S.oncelik === 'maliyet'){
      hint.textContent = '💰 Maliyet Odaklı seçildi — diğer hedefler devre dışı. BOM standart ekipman içerir.';
      hint.style.color = 'var(--or)';
    } else if(S.oncelik && S.oncelik2){
      hint.textContent = '✓ ' + (S.oncelik==='uzunomur'?'Uzun Ömürlü':'Yüksek Verimli') + ' + ' + (S.oncelik2==='verimli'?'Yüksek Verimli':'Uzun Ömürlü') + ' seçildi — premium ekipman aktif.';
      hint.style.color = 'var(--gold)';
    } else {
      hint.textContent = '💡 Uzun Ömürlü + Yüksek Verimli aynı anda seçilebilir. Maliyet Odaklı tek başına seçilir.';
      hint.style.color = 'var(--tx3)';
    }
  }
}

/* ─── Premium BOM yardımcıları ─────────────────────────────────── */
function isPremiumMode(){
  return S.oncelik === 'uzunomur' || S.oncelik === 'verimli' ||
         S.oncelik2 === 'uzunomur' || S.oncelik2 === 'verimli';
}
function isMaliyetMode(){ return S.oncelik === 'maliyet'; }
function isUzunOmurMode(){ return S.oncelik === 'uzunomur' || S.oncelik2 === 'uzunomur'; }
function isVerimliMode(){ return S.oncelik === 'verimli' || S.oncelik2 === 'verimli'; }

/* Field handlers */
function onField(id){
  const el=document.getElementById(id);
  if(id==='kuyuSayisi'){ S.kuyuSayisi=1; if(el) el.value='1'; renderValidationPanel(); return; }
  // Gercek zamanli max klamp — HTML max attribute form submit disinda calismaz
  const FIELD_MAX={kuyuDerinlik:150, araziDonum:25};
  if(el && FIELD_MAX[id]!==undefined){
    const raw=parseFloat(el.value);
    if(raw>FIELD_MAX[id]){ el.value=FIELD_MAX[id]; }
  }
  // Statik su kuyu derinliğinden büyük olamaz
  if(id==='statikSu' && el){
    const kd=parseFloat(document.getElementById('kuyuDerinlik')?.value)||0;
    if(kd>0 && parseFloat(el.value)>=kd){ el.value=Math.max(0,kd-1); }
  }
  // Dinamik su kuyu derinliğinden büyük olamaz
  if(id==='dinamikSu' && el){
    const kd=parseFloat(document.getElementById('kuyuDerinlik')?.value)||0;
    if(kd>0 && parseFloat(el.value)>=kd){ el.value=Math.max(0,kd-1); }
  }
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
