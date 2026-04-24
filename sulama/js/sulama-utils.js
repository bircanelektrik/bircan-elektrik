/* sulama-utils.js — Yardımcı fonksiyonlar: clamp, round1, readNumericInput, getProductionTypeMeta vb. */

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function round1(v){ return Math.round((v||0)*10)/10; }
function hasPositive(v){ return Number(v) > 0; }
function firstPositive(){
  for(let i=0;i<arguments.length;i++){
    const num = Number(arguments[i]) || 0;
    if(num>0) return num;
  }
  return 0;
}
function estimateFitCount(span, spacing){
  if(!(span>0) || !(spacing>0)) return 1;
  return Math.max(1, Math.floor(span / spacing));
}
function getIrrigationMethodName(method){
  const map = {damla:'Damla', yagmurlama:'Yagmurlama', salma:'Salma'};
  return map[method || S.sulamaYontem] || 'Sulama';
}
function getFormContext(type, method){
  const production = type || S.uretimTipi || PRODUCT_LIBRARY[S.urunTip]?.type || '';
  const irrigation = method || S.sulamaYontem;
  return {
    production,
    method:irrigation,
    isTree:isTreeBasedProduction(production),
    isSprinkler:irrigation==='yagmurlama',
    isDrip:irrigation==='damla',
    isSalma:irrigation==='salma',
    isFieldLike:['tarla','sebze'].includes(production),
    isCustom:production==='ozel',
    isLandscape:production==='peyzaj'
  };
}
function getProductionTypeMeta(type){
  const resolved = type || S.uretimTipi || PRODUCT_LIBRARY[S.urunTip]?.type;
  return URETIM_TIPLERI[resolved] || null;
}
function getProductionTypeName(type){
  return getProductionTypeMeta(type)?.ad || 'Üretim tipi';
}
function getSelectedProduct(){
  return PRODUCT_LIBRARY[S.urunTip] || BITKI[S.urunTip] || null;
}
function getProductListForType(type){
  const meta = getProductionTypeMeta(type);
  if(!meta) return [];
  return meta.products.map(key=>({key, ...PRODUCT_LIBRARY[key]})).filter(item=>!!item.ad);
}
function getBaseProductLayoutDefaults(productKey, productionType){
  const key = productKey || S.urunTip;
  const defaults = {
    misir:{rowSpace:0.7, emitterSpacing:0.3, emitterFlow:1.6},
    bugday:{rowSpace:0.2, emitterSpacing:0.2, emitterFlow:1.2},
    arpa:{rowSpace:0.2, emitterSpacing:0.2, emitterFlow:1.2},
    pancar:{rowSpace:0.45, emitterSpacing:0.3, emitterFlow:1.6},
    aycicegi:{rowSpace:0.7, emitterSpacing:0.4, emitterFlow:1.6},
    yonca:{rowSpace:0.3, emitterSpacing:0.25, emitterFlow:1.4},
    pamuk:{rowSpace:0.9, emitterSpacing:0.3, emitterFlow:1.6},
    domates:{rowSpace:1.4, plantSpace:0.35, emitterSpacing:0.3, emitterFlow:1.6},
    biber:{rowSpace:1.2, plantSpace:0.35, emitterSpacing:0.2, emitterFlow:1.6},
    patlican:{rowSpace:1.3, plantSpace:0.45, emitterSpacing:0.3, emitterFlow:1.6},
    salatalik:{rowSpace:1.5, plantSpace:0.4, emitterSpacing:0.2, emitterFlow:1.2},
    kabak:{rowSpace:2.0, plantSpace:0.6, emitterSpacing:0.3, emitterFlow:1.6},
    patates:{rowSpace:0.75, plantSpace:0.25, emitterSpacing:0.3, emitterFlow:1.6},
    sogan:{rowSpace:0.3, plantSpace:0.1, emitterSpacing:0.2, emitterFlow:1.2},
    kavun:{rowSpace:2.2, plantSpace:0.7, emitterSpacing:0.3, emitterFlow:1.6},
    karpuz:{rowSpace:2.5, plantSpace:0.8, emitterSpacing:0.3, emitterFlow:1.6},
    elma:{rowSpace:4.5, plantSpace:3.5, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:4},
    armut:{rowSpace:4.5, plantSpace:3.5, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:4},
    kiraz:{rowSpace:5, plantSpace:4, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:4},
    seftali:{rowSpace:4.5, plantSpace:3.5, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:4},
    kayisi:{rowSpace:5, plantSpace:4, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:4},
    nar:{rowSpace:4, plantSpace:3, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:4},
    ceviz:{rowSpace:7, plantSpace:7, emittersPerPlant:8, emitterSpacing:0.75, emitterFlow:4},
    uzum:{rowSpace:3, plantSpace:2.2, emittersPerPlant:4, emitterSpacing:0.5, emitterFlow:2},
    zeytin:{rowSpace:6, plantSpace:6, emittersPerPlant:4, emitterSpacing:1.0, emitterFlow:8}
  };
  const fallbackKey = Object.keys(defaults).find(k=>PRODUCT_LIBRARY[k]?.type===productionType);
  return defaults[key] || defaults[fallbackKey] || {
    rowSpace:1.5,
    plantSpace:0.4,
    emittersPerPlant:2,
    emitterSpacing:0.5,
    emitterFlow:2
  };
}
function getLineSplitPlan(lineLength, maxLength){
  const totalLength = Math.max(0, Number(lineLength) || 0);
  const maxLen = Math.max(1, Number(maxLength) || 150);
  const segments = Math.max(1, Math.ceil(totalLength / maxLen));
  return {
    totalLength,
    maxLength:maxLen,
    segments,
    split:segments>1,
    segmentLength:segments>1 ? round1(totalLength / segments) : totalLength
  };
}
function getCropMethodProfile(method, type, product){
  const irrigation = method || S.sulamaYontem;
  const production = type || S.uretimTipi || PRODUCT_LIBRARY[S.urunTip]?.type || '';
  const productKey = product || S.urunTip || '';
  const base = getBaseProductLayoutDefaults(productKey, production);
  const preset = S.tipSprinklerPreset || 'standart';
  const profile = {
    method:irrigation,
    production,
    product:productKey,
    rowSpace:base.rowSpace || 0,
    plantSpace:base.plantSpace || 0,
    emitterSpacing:base.emitterSpacing || 0,
    emitterFlow:base.emitterFlow || 0,
    emittersPerPlant:base.emittersPerPlant || 0,
    lineMaxLength:150,
    lateralType:'tek',
    systemLabel:'Standart sulama',
    materialLabel:'Standart dagitim',
    farmerNote:'Sistem urun ve yonteme gore standart karar motoru kullanir.',
    engineeringNote:'',
    pipeLabel:'',
    emitterLabel:'Damlatici',
    lateralsLabel:'Lateral',
    headLabel:'Sprinkler',
    headFlow:0,
    headPressure:0,
    spacingX:0,
    spacingY:0,
    irrigationPressure:null,
    waterMultiplier:1,
    tape:false,
    blindPipe:false,
    onlineButton:false,
    microSprinkler:false,
    popup:false,
    bigGun:false,
    tallCrop:false,
    seasonal:false,
    resultNote:'',
    warnings:[]
  };

  if(irrigation==='salma'){
    profile.systemLabel = 'Salma / karik sulama';
    profile.materialLabel = 'Ana boru + saha vanasi';
    profile.farmerNote = 'Ilk yatirim hafifler; ancak su kaybi yuksek oldugu icin gunluk tonaj arttirilir.';
    profile.engineeringNote = 'Dagitim listesinde damla ve sprinkler ekipmanlari yerine yuzey dagitim hattina agirlik verilir.';
    profile.irrigationPressure = 0.5;
    profile.waterMultiplier = 1.45;
    profile.resultNote = 'Salma verimi dusuk oldugu icin su ihtiyaci yaklasik %45 artisla yorumlandi.';
    return profile;
  }

  if(irrigation==='yagmurlama'){
    if(production==='peyzaj'){
      profile.systemLabel = 'Pop-up peyzaj yagmurlama';
      profile.materialLabel = 'Pop-up rotor / sprey baslik';
      profile.headLabel = 'Pop-up baslik';
      profile.spacingX = 8;
      profile.spacingY = 8;
      profile.headFlow = 0.8;
      profile.headPressure = 3.0;
      profile.popup = true;
      profile.farmerNote = 'Cim ve peyzajda gizli baslik mantigi kullanilir.';
      profile.engineeringNote = 'Toprak alti ana hat ve zonlu pop-up baslik yerlesimi varsayilir.';
      return profile;
    }
    if(['meyve','bag','zeytinlik'].includes(production)){
      profile.systemLabel = 'Agac alti mikro yagmurlama';
      profile.materialLabel = 'Mikro sprinkler';
      profile.headLabel = 'Mikro sprinkler';
      profile.headFlow = productKey==='ceviz' ? 0.07 : 0.05;
      profile.headPressure = 2.5;
      profile.microSprinkler = true;
      profile.farmerNote = 'Agacli alanda klasik tarla basligi yerine agac alti mikro yagmurlama kullanilir.';
      profile.engineeringNote = 'Su tac iz dusumune verilir; baslik sayisi agac sayisindan turetilir.';
      profile.resultNote = 'Meyve ve bag alaninda yagmurlama secildigi icin sistem mikro yagmurlama mantigina gecti.';
      return profile;
    }
    if(['misir','aycicegi'].includes(productKey) || preset==='tabanca'){
      profile.systemLabel = 'Buyuk tabanca yagmurlama';
      profile.materialLabel = 'Sanzimanli buyuk tabanca';
      profile.headLabel = 'Buyuk tabanca';
      profile.spacingX = 30;
      profile.spacingY = 30;
      profile.headFlow = 10;
      profile.headPressure = 4.0;
      profile.bigGun = true;
      profile.tallCrop = ['misir','aycicegi'].includes(productKey);
      profile.farmerNote = profile.tallCrop
        ? 'Boylanan bitkide standart tarla basligi yerine buyuk tabanca daha gercekci kabul edildi.'
        : 'Uzun mesafe ve daha az iscilik icin buyuk tabanca varsayildi.';
      profile.engineeringNote = '30x30 m grid ve yuksek debili baslik standardi uygulanir.';
      if(profile.tallCrop) profile.warnings.push('Boylanan bitkide standart tarla basligi yerine buyuk tabanca varsayildi.');
      return profile;
    }
    profile.systemLabel = 'Standart tarla yagmurlama';
    profile.materialLabel = 'Carpmali tarla basligi';
    profile.headLabel = 'Tarla basligi';
    profile.spacingX = 12;
    profile.spacingY = 12;
    profile.headFlow = 1.5;
    profile.headPressure = 2.5;
    profile.farmerNote = 'Tahillarda homojen islatma icin standart tarla yerlesimi kullanilir.';
    profile.engineeringNote = '12x12 m grid, 1.5 m3/h baslik debisi ve 2.5 bar calisma basinci esas alinir.';
    return profile;
  }

  if(production==='zeytinlik'){
    profile.systemLabel = 'Kor boru + buton damlatici';
    profile.materialLabel = 'Deliksiz PE hat + basinç ayarli buton damlatici';
    profile.pipeLabel = 'Kor PE boru';
    profile.emitterLabel = 'Buton damlatici';
    profile.onlineButton = true;
    profile.blindPipe = true;
    profile.emittersPerPlant = S.tipBahceYasi==='genc' ? 4 : 6;
    profile.emitterFlow = 8;
    profile.emitterSpacing = 1.0;
    profile.farmerNote = 'Bos topragi sulamamak icin sadece agac diplerine su verilir.';
    profile.engineeringNote = 'Seyrek bahcede kor boru ve agac basi 4-6 adet 8 L/h buton damlatici standardi kullanilir.';
    profile.resultNote = 'Zeytinlikte bos araziyi sulamamak icin kor boru + buton damlatici mantigi secildi.';
    return profile;
  }
  if(production==='meyve'){
    profile.systemLabel = productKey==='ceviz' ? 'Ceviz yuksek debili damla' : 'Meyve bahcesi buton damla';
    profile.materialLabel = productKey==='ceviz' ? 'Kalin PE hat + yuksek kapasiteli damlatici' : 'Kalin PE hat + buton damlatici';
    profile.pipeLabel = 'Bahce PE boru';
    profile.emitterLabel = productKey==='ceviz' ? 'Yuksek debili damlatici' : 'Buton damlatici';
    profile.onlineButton = true;
    profile.blindPipe = true;
    profile.emittersPerPlant = productKey==='ceviz' ? 8 : 4;
    profile.emitterFlow = 4;
    profile.emitterSpacing = productKey==='ceviz' ? 0.75 : 0.5;
    profile.farmerNote = productKey==='ceviz'
      ? 'Cevizde daha genis tac nedeniyle agac basi damlatici adedi yukseltildi.'
      : 'Meyve agacinda standart olarak agac basi 4 adet buton damlatici kabul edilir.';
    profile.engineeringNote = productKey==='ceviz'
      ? 'Ceviz icin 8 adet 4 L/h damlatici ile yuksek agac basi kapasite kullanilir.'
      : 'Agac sayisi ve dikim araligina gore agac basi 4 x 4 L/h buton damlatici hesaplanir.';
    if(productKey==='ceviz') profile.warnings.push('Ceviz secildigi icin agac basi damlatici kapasitesi yukseltilmistir.');
    return profile;
  }
  if(production==='bag'){
    profile.systemLabel = 'Tek hat bag damla';
    profile.materialLabel = 'Askiya alinmis bag laterali';
    profile.pipeLabel = 'Bag laterali';
    profile.emitterLabel = 'Inline damlatici';
    profile.lateralsLabel = 'Sira laterali';
    profile.emittersPerPlant = 4;
    profile.emitterFlow = 2.0;
    profile.emitterSpacing = 0.5;
    profile.lateralType = 'tek';
    profile.farmerNote = 'Asma sirasinda tek hat, tel boyunca asili damla laterali varsayilir.';
    profile.engineeringNote = 'Dar omca araliginda 0.50 m damlatici araligi ve 2.0 L/h inline damla kullanilir.';
    return profile;
  }
  if(production==='sebze'){
    profile.systemLabel = 'Yogun yassi damla';
    profile.materialLabel = 'Tek sezonluk ince etli tape';
    profile.pipeLabel = 'Sebze tape damla borusu';
    profile.emitterLabel = 'Tape damlatici';
    profile.lateralsLabel = 'Sebze laterali';
    profile.tape = true;
    profile.seasonal = true;
    profile.emitterFlow = base.emitterFlow || 1.6;
    profile.emitterSpacing = base.emitterSpacing || 0.3;
    profile.farmerNote = 'Sebzede maliyeti lateral metraji belirler; bu nedenle ince etli tape standardi kullanilir.';
    profile.engineeringNote = 'Sebze uretiminde 0.20-0.30 m damlatici araligi ve sezonluk tape mantigi uygulanir.';
    return profile;
  }
  if(['misir','pamuk','pancar'].includes(productKey)){
    profile.systemLabel = 'Tarla tape damla';
    profile.materialLabel = 'Yassi damla borusu (tape)';
    profile.pipeLabel = 'Tarla tape damla borusu';
    profile.emitterLabel = 'Tape damlatici';
    profile.tape = true;
    profile.seasonal = true;
    profile.emitterFlow = 1.6;
    profile.emitterSpacing = 0.3;
    profile.rowSpace = productKey==='pamuk' ? 0.9 : productKey==='pancar' ? 0.45 : 0.7;
    profile.farmerNote = 'Misir, pamuk ve pancarda modern standart olarak yassi damla boru kabul edildi.';
    profile.engineeringNote = 'Yogun sira bitkilerinde 1.6 L/h tape ve dar damlatici araligi kullanilir.';
    profile.warnings.push('Bu urunde kalin etli damla yerine yassi tape maliyet ve hidrolik olarak daha gercekci kabul edildi.');
    return profile;
  }

  profile.systemLabel = 'Tarla damla';
  profile.materialLabel = 'Standart damla laterali';
  profile.pipeLabel = 'Tarla damla borusu';
  profile.emitterLabel = 'Inline damlatici';
  profile.emitterFlow = base.emitterFlow || 1.6;
  profile.emitterSpacing = base.emitterSpacing || 0.3;
  profile.farmerNote = 'Secilen urun icin standart tarla damla yerlesimi kullanilir.';
  profile.engineeringNote = 'Sira arasi ve damlatici araligi urun kutuphanesinden otomatik alinmistir.';
  return profile;
}
function getProductLayoutDefaults(method, type, product){
  const irrigation = method || S.sulamaYontem;
  const production = type || S.uretimTipi || PRODUCT_LIBRARY[S.urunTip]?.type || '';
  const productKey = product || S.urunTip || '';
  const base = getBaseProductLayoutDefaults(productKey, production);
  const profile = getCropMethodProfile(irrigation, production, productKey);
  return {
    rowSpace:profile.rowSpace || base.rowSpace || 1.5,
    plantSpace:profile.plantSpace || base.plantSpace || 0.4,
    emittersPerPlant:profile.emittersPerPlant || base.emittersPerPlant || 2,
    emitterSpacing:profile.emitterSpacing || base.emitterSpacing || 0.5,
    emitterFlow:profile.emitterFlow || base.emitterFlow || 2
  };
}
function getMethodPanelNotes(method, type, product){
  const profile = getCropMethodProfile(method, type, product);
  const notes = [];
  if(profile.farmerNote) notes.push(profile.farmerNote);
  if(profile.resultNote) notes.push(profile.resultNote);
  (profile.warnings || []).forEach(function(item){
    if(notes.indexOf(item)===-1) notes.push(item);
  });
  return notes;
}
function isTreeBasedProduction(type){
  const resolved = type || S.uretimTipi || PRODUCT_LIBRARY[S.urunTip]?.type;
  return ['meyve','bag','zeytinlik'].includes(resolved);
}
function isLandscapeProduction(type){
  return (type || S.uretimTipi || PRODUCT_LIBRARY[S.urunTip]?.type)==='peyzaj';
}
function readNumericInput(id){
  const el=document.getElementById(id);
  return el ? (parseFloat(el.value)||0) : 0;
}
function readTextInput(id, fallback=''){
  const el=document.getElementById(id);
  return el ? (el.value || fallback) : fallback;
}
function getEquipmentPressureDefault(){
  const BP = YB[S.sulamaYontem];
  const profile = getCropMethodProfile();
  // Kullanıcı hassas ayar girişiyle kendi basıncını dayatmışsa, ona saygı göster (yagmurlama durumunda).
  if(S.sulamaYontem==='yagmurlama' && (S.tipBasinc>0 || S.spBasinc>0)) return S.tipBasinc || S.spBasinc;
  // Akıllı karar motoru — override uygulandıysa onun önerdiği basıncı kullan
  if(typeof getSmartOverride==='function'){
    const ov = getSmartOverride();
    if(ov.applied && typeof ov.pressureNumeric==='number' && ov.pressureNumeric>0){
      return ov.pressureNumeric;
    }
  }
  if(S.sulamaYontem==='yagmurlama' && profile.headPressure>0) return profile.headPressure;
  if(S.sulamaYontem==='salma' && profile.irrigationPressure!==null) return profile.irrigationPressure;
  return BP.opt;
}
function getScenarioDisplayName(senaryo){
  const map = {
    tek:'Tek kuyu sistem',
    zonlu:'Bölünmüş sulama',
    depolu:'Depolu tampon çözüm'
  };
  return senaryo.label || map[senaryo.tipi] || 'Sistem';
}
function getWellLayoutText(senaryo){
  if(senaryo.tipi==='depolu') return '1 kuyu + depo';
  if(senaryo.tipi==='zonlu') return '1 kuyu + bolumlu hat';
  return '1 kuyu';
}
function getOperationText(senaryo){
  if(senaryo.tipi==='depolu') return senaryo.sSure+' saat/gün + depo dolumu';
  if(senaryo.tipi==='zonlu') return senaryo.sSure+' saat/gün bölümlü';
  return senaryo.sSure+' saat/gün';
}
function uniqueScenarioRefs(list){
  return list.filter((item,idx)=>item && list.indexOf(item)===idx);
}
function formatBomQty(value, unit){
  if(typeof value==='number'){
    const n = value >= 20 ? Math.round(value) : round1(value);
    return n + (unit ? ' ' + unit : '');
  }
  return String(value) + (unit ? ' ' + unit : '');
}
function normalizeBomTag(meta={}){
  if(meta.tag) return meta.tag;
  if(meta.survey) return 'survey';
  if(meta.optional) return 'optional';
  if(meta.approx) return 'approx';
  return 'exact';
}
function addBomItem(items, category, material, value, unit, note, meta={}){
  const tag = normalizeBomTag(meta);
  items.push({
    category,
    material,
    quantity:formatBomQty(value, unit),
    note,
    approx:tag==='approx',
    optional:tag==='optional',
    survey:tag==='survey',
    tag,
    approxHint:meta.approxHint || meta.tagNote || ''
  });
}
function groupBomItems(items){
  const order = [
    'Pompa ve kuyu ekipmanları',
    'Ana boru hattı',
    'Sulama dağıtım sistemi',
    'Filtrasyon ve kontrol',
    'Elektrik ve enerji',
    'Opsiyonel ekipmanlar'
  ];
  const groups = {};
  items.forEach(item=>{
    const category = item.category && item.category.indexOf('Elektrik ve enerji')===0
      ? 'Elektrik ve enerji'
      : item.category;
    if(!groups[category]) groups[category]=[];
    groups[category].push(category===item.category ? item : { ...item, category });
  });
  return order.filter(key=>groups[key]?.length).map(key=>({title:key, items:groups[key]}));
}

/* ─────────────────────────────────────────────────────────────────
   AKILLI KARAR MOTORU — Override tespiti
   Kullanıcının yöntem + üretim tipi + ürün kombinasyonunu inceler,
   mühendislik standartlarına uymuyorsa sistemi zorla değiştirir ve
   raporda belirgin "Akıllı Uyarı" paneli oluşturmak için meta üretir.

   Geri dönen obje:
   {
     applied: bool,                   // override uygulandı mı
     originalMethod: 'Yağmurlama',    // kullanıcı ne istedi
     newStandard: 'Ağaç Altı...',     // sistem neye geçirdi
     reason: kısa açıklama,
     pressureBar: 'min-max bar',
     pressureNumeric: 1.75,           // hidrolik motor için tek değer
     equipmentChanges: [...],         // kullanıcıya listeleme için
     uyariMetni: uzun açıklama,
     kuralNo: 1|2|3|4                 // brief'teki kural numarası
   }
─────────────────────────────────────────────────────────────────── */
function getSmartOverride(){
  const method = S.sulamaYontem || '';
  const production = S.uretimTipi || '';
  const productKey = S.urunTip || '';
  if(!method || !production){
    return { applied:false };
  }
  const methodName = getIrrigationMethodName(method);

  // KURAL 4: Salma / Karık — en geniş kapsamlı override
  // Akademik kaynak (DSİ/TAGEM): salma uygulama randımanı %40-60 bandında.
  // Standart salma için +%100 israf payı (1/0.5-1 = +100%).
  if(method==='salma'){
    return {
      applied:true,
      kuralNo:4,
      originalMethod:'Salma / Karık',
      newStandard:'Yüzey Dağıtım (sadece ana hat)',
      reason:'Salma sulamada tarla içi dağıtım ekipmanları kullanılmaz.',
      pressureBar:'0.5 bar (sadece sürtünme payı)',
      pressureNumeric:0.5,
      equipmentChanges:[
        { tip:'cikarildi', metin:'Lateral damla boru, damlatıcı ve sprinkler başlığı listeden çıkarıldı.' },
        { tip:'cikarildi', metin:'İnce filtre (disk/kum) grupları isteğe bağlı hale getirildi.' },
        { tip:'korundu',   metin:'Kuyu pompası, pano ve ana HDPE boru listede tutuldu.' },
        { tip:'artis',     metin:'Günlük su tahmini buharlaşma/sızma kaybı için akademik standarda göre %100 artırıldı (standart salma randımanı ~%50).' }
      ],
      uyariMetni:'Salma sulama seçildiği için tarla içi dağıtım ekipmanları (lateral, başlık) listeden çıkarılmış, basınç ihtiyacı düşürülmüş, günlük su tahmini ise akademik salma randımanı (%50) esas alınarak %100 israf payıyla artırılmıştır.'
    };
  }

  // KURAL 1: Meyve Bahçesi + Yağmurlama
  if(method==='yagmurlama' && production==='meyve'){
    return {
      applied:true,
      kuralNo:1,
      originalMethod:'Standart Tarla Yağmurlama',
      newStandard:'Ağaç Altı Mikro-Yağmurlama',
      reason:'Meyve ağacının tacı, standart tarla başlığının atış çapına sığmaz; su yapraklara değil ağaç dibine verilmelidir.',
      pressureBar:'1.5 – 2.0 bar',
      pressureNumeric:1.75,
      equipmentChanges:[
        { tip:'cikarildi', metin:'Rotor / çarpmalı standart tarla başlığı iptal edildi.' },
        { tip:'eklendi',   metin:'Ağaç başına 1 adet (35–70 L/h) mini mikro-yağmurlama başlığı atandı.' },
        { tip:'eklendi',   metin:'Lateral olarak ağaç diplerinden geçen deliksiz (kör) PE boru seçildi.' },
        { tip:'dusuruldu', metin:'Çalışma basıncı 2.5 bar yerine 1.5–2.0 bar aralığına düşürüldü.' }
      ],
      uyariMetni:'Meyve bahçesinde standart tarla yağmurlaması verimsizdir. Sistem otomatik olarak "Ağaç Altı Mikro-Yağmurlama" standartlarına göre revize edilmiştir.'
    };
  }

  // KURAL 1 benzeri: Bağ + Yağmurlama
  if(method==='yagmurlama' && production==='bag'){
    return {
      applied:true,
      kuralNo:1,
      originalMethod:'Standart Tarla Yağmurlama',
      newStandard:'Ağaç Altı Mikro-Yağmurlama (Bağ düzeni)',
      reason:'Asma sıraları arası boşlukta standart yağmurlama büyük oranda toprağa gider, ürün kalitesini düşürür.',
      pressureBar:'1.5 – 2.0 bar',
      pressureNumeric:1.75,
      equipmentChanges:[
        { tip:'cikarildi', metin:'Standart tarla sprinkler başlığı iptal edildi.' },
        { tip:'eklendi',   metin:'Asma altı mini mikro-yağmurlama başlığı atandı.' },
        { tip:'dusuruldu', metin:'Çalışma basıncı düşük basınç bandına çekildi.' }
      ],
      uyariMetni:'Bağda standart tarla yağmurlaması önerilmez. Sistem "Ağaç Altı Mikro-Yağmurlama" standartlarına göre revize edilmiştir.'
    };
  }

  // KURAL 1 benzeri: Zeytinlik + Yağmurlama
  if(method==='yagmurlama' && production==='zeytinlik'){
    return {
      applied:true,
      kuralNo:1,
      originalMethod:'Standart Tarla Yağmurlama',
      newStandard:'Ağaç Altı Mikro-Yağmurlama (Seyrek bahçe)',
      reason:'Seyrek dikilmiş zeytin ağaçları arasında standart yağmurlama büyük oranda boş araziyi ıslatır.',
      pressureBar:'1.5 – 2.0 bar',
      pressureNumeric:1.75,
      equipmentChanges:[
        { tip:'cikarildi', metin:'Standart tarla sprinkler başlığı iptal edildi.' },
        { tip:'eklendi',   metin:'Ağaç başına mini mikro-yağmurlama başlığı atandı.' },
        { tip:'dusuruldu', metin:'Çalışma basıncı düşük basınç bandına çekildi.' }
      ],
      uyariMetni:'Zeytinlikte standart tarla yağmurlaması su israfına yol açar. Sistem "Ağaç Altı Mikro-Yağmurlama" standartlarına geçirilmiştir.'
    };
  }

  // KURAL 2: Boylu Bitki (Mısır / Ayçiçeği) + Yağmurlama
  if(method==='yagmurlama' && ['misir','aycicegi'].includes(productKey)){
    const bitkiAd = productKey==='misir' ? 'Mısır' : 'Ayçiçeği';
    return {
      applied:true,
      kuralNo:2,
      originalMethod:'Standart Tarla Yağmurlama (kısa başlık)',
      newStandard:'Şanzımanlı Büyük Tabanca Yağmurlama',
      reason:bitkiAd+' boylanan bir bitkidir; kısa başlıklar olgunluk dönemine girince bitki üzerinden atış yapamaz.',
      pressureBar:'3.5 – 4.5 bar',
      pressureNumeric:4.0,
      equipmentChanges:[
        { tip:'cikarildi', metin:'Kısa boylu çarpmalı tarla başlığı iptal edildi.' },
        { tip:'eklendi',   metin:'Şanzımanlı büyük tabanca (≈10 m³/h, 30×30 m grid) atandı.' },
        { tip:'arttirildi', metin:'Çalışma basıncı 2.5 bar yerine minimum 3.5–4.5 bar bandına yükseltildi.' }
      ],
      uyariMetni:bitkiAd+' boylanan bir bitkidir. Kısa başlıklar iptal edilip, sistem yüksek basınçlı büyük tabanca standartlarına geçirilmiştir.'
    };
  }

  // KURAL 3: Zeytinlik + Damla
  if(method==='damla' && production==='zeytinlik'){
    return {
      applied:true,
      kuralNo:3,
      originalMethod:'Standart İnline (Kendinden Delikli) Damla',
      newStandard:'Kör Boru + Basınç Ayarlı Buton Damlatıcı (Online)',
      reason:'Zeytin ağaçları aralıklı dikildiğinden, kendinden delikli lateral ağaç olmayan bölgeye de su verir ve israfa yol açar.',
      pressureBar:'1.5 – 2.0 bar',
      pressureNumeric:1.75,
      equipmentChanges:[
        { tip:'cikarildi', metin:'Kendinden delikli inline damla borusu iptal edildi.' },
        { tip:'eklendi',   metin:'Ana hatlara kör (deliksiz) PE boru seçildi.' },
        { tip:'eklendi',   metin:'Ağaç başına 4–6 adet, 8 L/h basınç ayarlı buton damlatıcı (online) atandı.' }
      ],
      uyariMetni:'Zeytin ağaçları aralıklı dikildiği için boşluklardaki su israfını önlemek adına sistem "Kör Boru + Buton Damlatıcı" standartlarına revize edilmiştir.'
    };
  }

  return { applied:false };
}
