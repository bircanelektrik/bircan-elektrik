/* sulama-formulas.js — Hesap motorları: getFieldGeometry, getDripLayoutModel, getSprinklerLayoutModel, BOM builder'lar */

function getFieldGeometry(){
  const baseAreaM2 = Math.max(1000, (S.araziDonum||1) * 1000);
  const widthInput = S.tipTarlaEn || 0;
  const lengthInput = S.tipTarlaBoy || 0;
  let width = widthInput;
  let length = lengthInput;
  let areaM2 = baseAreaM2;
  if(width && length){
    areaM2 = width * length;
  } else if(width){
    length = areaM2 / width;
  } else if(length){
    width = areaM2 / length;
  } else {
    const side = Math.sqrt(areaM2);
    width = side;
    length = side;
  }
  return { areaM2, width, length };
}
function isOrchardCrop(){
  return isTreeBasedProduction();
}
function getOrchardDefaults(){
  const base = getProductLayoutDefaults();
  if(S.uretimTipi==='bag') return {rowSpace:base.rowSpace||3, plantSpace:base.plantSpace||2.2, emittersPerPlant:base.emittersPerPlant||2, emitterSpacing:base.emitterSpacing||0.5, emitterFlow:base.emitterFlow||2};
  if(S.uretimTipi==='zeytinlik') return {rowSpace:base.rowSpace||6, plantSpace:base.plantSpace||6, emittersPerPlant:base.emittersPerPlant||4, emitterSpacing:base.emitterSpacing||0.75, emitterFlow:base.emitterFlow||4};
  return {rowSpace:base.rowSpace||4.5, plantSpace:base.plantSpace||3.5, emittersPerPlant:base.emittersPerPlant||4, emitterSpacing:base.emitterSpacing||0.5, emitterFlow:base.emitterFlow||4};
}
function getScenarioSelectionId(role, senaryo){
  return role + ':' + (senaryo ? senaryo.tipi : '');
}
function getTreeLayoutModel(kind){
  const geom = getFieldGeometry();
  const defs = getOrchardDefaults();
  const areaWidth = S.tipTarlaEn || geom.width;
  const areaLength = S.tipTarlaBoy || geom.length;
  const areaM2 = Math.max(1, areaWidth * areaLength);
  const lateralLength = firstPositive(S.dmlLateralLen, areaLength);
  const lateralTip = (S.tipLateralTip || 'tek')==='cift' ? 'cift' : 'tek';
  const lateralFactor = lateralTip==='cift' ? 2 : 1;
  const plantAreaM2 = firstPositive(S.tipAgacAralikM2);
  const rowSpace = firstPositive(S.tipSiraArasi, defs.rowSpace);
  const plantSpace = firstPositive(S.tipBitkiArasi, defs.plantSpace);
  const emitterSpacing = firstPositive(S.tipDamlaticiAralik, defs.emitterSpacing);
  const emitterFlow = firstPositive(S.tipDamlaticiDebi, defs.emitterFlow);
  const rowCountDerived = estimateFitCount(areaWidth, rowSpace);
  const plantsPerRowDerived = estimateFitCount(areaLength, plantSpace);
  const derivedPlantCountBySpacing = Math.max(1, rowCountDerived * plantsPerRowDerived);
  const derivedPlantCountByArea = plantAreaM2>0 ? Math.max(1, Math.round(areaM2 / plantAreaM2)) : 0;
  const rowCountRaw = Math.max(1, firstPositive(S.tipToplamSira, rowCountDerived));
  const manualPlantCount = S.tipToplamAgac || 0;
  const derivedPlantCount = Math.max(1, derivedPlantCountByArea || derivedPlantCountBySpacing);
  const plantCount = Math.max(1, manualPlantCount || derivedPlantCount);
  const rowCount = Math.max(1, Math.min(rowCountRaw, plantCount));
  const baseEmitterCount = (S.tipBahceYasi==='genc' && S.uretimTipi==='meyve') ? Math.max(2, defs.emittersPerPlant-1) : defs.emittersPerPlant;
  const emittersPerPlant = Math.max(1, firstPositive(S.tipAgacDamlaAdet, (baseEmitterCount * lateralFactor)));
  const emitterCount = Math.max(1, plantCount * emittersPerPlant);
  const lateralCount = Math.max(1, rowCount * lateralFactor);
  const totalLateralM = round1(lateralCount * lateralLength * 1.05);
  const hasUserRowSpace = hasPositive(S.tipSiraArasi);
  const hasUserPlantSpace = hasPositive(S.tipBitkiArasi);
  const hasUserPlantDensity = hasPositive(S.tipAgacAralikM2) || (hasUserRowSpace && hasUserPlantSpace);
  const hasUserEmitterFlow = hasPositive(S.tipDamlaticiDebi);
  const hasUserEmitterCount = hasPositive(S.tipAgacDamlaAdet);
  const hasTreeCountContext = manualPlantCount>0 || hasPositive(S.tipToplamSira) || hasPositive(S.tipAgacAralikM2) || hasPositive(S.araziDonum) || (hasPositive(S.tipTarlaEn) && hasPositive(S.tipTarlaBoy));
  const exact = hasUserPlantDensity && hasUserEmitterFlow && hasUserEmitterCount && hasTreeCountContext;
  const hasMeaningfulData = (plantAreaM2>0 || (rowSpace>0 && plantSpace>0)) && emitterFlow>0;
  const systemFlowM3h = round1((emitterCount * emitterFlow) / 1000);
  const plantsPerRow = Math.max(1, Math.ceil(plantCount / rowCount));
  const rowFlowM3h = round1((plantsPerRow * emittersPerPlant * emitterFlow) / 1000);
  const notes = [];
  if(!exact){
    notes.push('Ön kabul ile oluşturuldu.');
    notes.push(kind==='bag'
      ? 'Bağ sistemi için kesin liste omca ve sıra planına göre netleşir.'
      : kind==='zeytinlik'
        ? 'Seyrek ağaçlı bahçe için kesin liste ağaç düzenine göre netleşir.'
        : 'Meyve bahçesi için kesin liste sıra planına göre netleşir.'
    );
  }
  return {
    orchard:true,
    productionType:kind,
    exact,
    hasMeaningfulData,
    rowSpace,
    plantSpace,
    plantAreaM2,
    emitterSpacing,
    emitterFlow,
    rowCount,
    plantsPerRow,
    derivedPlantCount,
    plantCount,
    emittersPerPlant,
    emitterCount,
    lateralCount,
    lateralLength,
    totalLateralM,
    lateralTip,
    systemFlowM3h,
    rowFlowM3h,
    notes
  };
}
function getFieldCropLayout(){
  const geom = getFieldGeometry();
  const defs = getProductLayoutDefaults();
  const rowSpace = firstPositive(S.tipSiraArasi, S.dmlSiraArasi, defs.rowSpace, 1.5);
  const emitterSpacing = firstPositive(S.tipDamlaticiAralik, S.dmlDamlAralik, defs.emitterSpacing, 0.5);
  const emitterFlow = firstPositive(S.tipDamlaticiDebi, S.dmlDamlDebi, defs.emitterFlow);
  const useLongSide = (S.tipLateralYon || 'uzun')!=='kisa';
  const lateralLength = firstPositive(S.dmlLateralLen, (useLongSide ? geom.length : geom.width));
  const plantedFactor = clamp((S.tipEkiliOran||100)/100, 0.1, 1);
  const lateralSpan = (useLongSide ? geom.width : geom.length) * plantedFactor;
  const lateralCount = estimateFitCount(lateralSpan, Math.max(0.2,rowSpace));
  const totalLateralM = round1(lateralCount * lateralLength * 1.05);
  const emittersPerRow = Math.max(1, Math.ceil(lateralLength / Math.max(0.1, emitterSpacing)));
  const emitterCount = Math.max(1, lateralCount * emittersPerRow);
  const exact = hasPositive(S.tipSiraArasi || S.dmlSiraArasi) &&
    hasPositive(S.tipDamlaticiAralik || S.dmlDamlAralik) &&
    hasPositive(S.tipDamlaticiDebi || S.dmlDamlDebi);
  return {
    orchard:false,
    productionType:'tarla',
    exact,
    hasMeaningfulData:exact,
    rowSpace,
    emitterSpacing,
    emitterFlow,
    rowCount:lateralCount,
    plantsPerRow:emittersPerRow,
    plantCount:0,
    emittersPerPlant:0,
    emitterCount,
    lateralCount,
    lateralLength,
    totalLateralM,
    lateralTip:'tek',
    systemFlowM3h:round1((emitterCount * emitterFlow) / 1000),
    rowFlowM3h:round1((emittersPerRow * emitterFlow) / 1000),
    notes:exact ? [] : ['Standart tarla varsayımı kullanıldı.']
  };
}
function getVegetableLayout(){
  const geom = getFieldGeometry();
  const defs = getProductLayoutDefaults();
  const areaWidth = S.tipTarlaEn || geom.width;
  const areaLength = S.tipTarlaBoy || geom.length;
  const rowSpace = firstPositive(S.tipSiraArasi, S.dmlSiraArasi, defs.rowSpace, 1.4);
  const plantSpace = firstPositive(S.tipBitkiArasi, defs.plantSpace, 0.4);
  const emitterSpacing = firstPositive(S.tipDamlaticiAralik, S.dmlDamlAralik, defs.emitterSpacing, 0.3);
  const emitterFlow = firstPositive(S.tipDamlaticiDebi, S.dmlDamlDebi, defs.emitterFlow);
  const useLongSide = (S.tipLateralYon || 'uzun')!=='kisa';
  const lateralLength = firstPositive(S.dmlLateralLen, (useLongSide ? areaLength : areaWidth));
  const lateralSpan = useLongSide ? areaWidth : areaLength;
  const rowCountBase = Math.max(1, firstPositive(S.tipToplamSira, estimateFitCount(lateralSpan, rowSpace)));
  const lateralFactor = (S.tipDikimTip || 'tek')==='cift' ? 2 : 1;
  const lateralCount = rowCountBase * lateralFactor;
  const totalLateralM = round1(lateralCount * lateralLength * 1.05);
  const plantsPerRow = estimateFitCount(lateralLength, plantSpace);
  const plantCount = Math.max(1, rowCountBase * plantsPerRow * lateralFactor);
  const emittersPerLateral = Math.max(1, Math.ceil(lateralLength / Math.max(0.1, emitterSpacing)));
  const emitterCount = Math.max(1, lateralCount * emittersPerLateral);
  const exact = hasPositive(S.tipSiraArasi || S.dmlSiraArasi) &&
    hasPositive(S.tipBitkiArasi) &&
    hasPositive(S.tipDamlaticiAralik || S.dmlDamlAralik) &&
    hasPositive(S.tipDamlaticiDebi || S.dmlDamlDebi) &&
    (S.tipToplamSira>0 || (S.tipTarlaEn>0 && S.tipTarlaBoy>0));
  const notes = [];
  if(!exact) notes.push('Sebze tarlası için ön kabul ile oluşturuldu. Kesin liste sıra planı ile netleşir.');
  return {
    orchard:false,
    productionType:'sebze',
    exact,
    hasMeaningfulData:rowSpace>0 && emitterFlow>0,
    rowSpace,
    plantSpace,
    emitterSpacing,
    emitterFlow,
    rowCount:rowCountBase,
    plantsPerRow,
    plantCount,
    emittersPerPlant:0,
    emitterCount,
    lateralCount,
    lateralLength,
    totalLateralM,
    lateralTip:lateralFactor===2?'cift':'tek',
    systemFlowM3h:round1((emitterCount * emitterFlow) / 1000),
    rowFlowM3h:round1((emittersPerLateral * emitterFlow) / 1000),
    notes
  };
}
function getCustomLayout(){
  const geom = getFieldGeometry();
  const manualRows = Math.max(1, S.tipManualSira || S.tipToplamSira || 1);
  const manualLateralM = round1(S.tipManualLateralM || (manualRows * geom.length * 1.05));
  const plantCount = Math.max(0, S.tipManualAgac || S.tipToplamAgac || 0);
  return {
    orchard:false,
    productionType:'ozel',
    exact:false,
    hasMeaningfulData:manualRows>0 || manualLateralM>0 || plantCount>0,
    rowSpace:0,
    emitterSpacing:firstPositive(S.tipDamlaticiAralik, S.dmlDamlAralik),
    emitterFlow:firstPositive(S.tipDamlaticiDebi, S.dmlDamlDebi),
    rowCount:manualRows,
    plantsPerRow:0,
    plantCount,
    emittersPerPlant:S.tipAgacDamlaAdet || 0,
    emitterCount:Math.max(0, plantCount * Math.max(1, S.tipAgacDamlaAdet || 1)),
    lateralCount:manualRows,
    lateralLength:geom.length,
    totalLateralM:manualLateralM,
    lateralTip:S.tipLateralTip || 'tek',
    systemFlowM3h:round1((firstPositive(S.tipDamlaticiDebi, S.dmlDamlDebi) * Math.max(0, plantCount * Math.max(1, S.tipAgacDamlaAdet || 1))) / 1000),
    rowFlowM3h:0,
    notes:['Özel düzen olarak ön keşif seviyesinde hesaplandı.', 'Kesin liste saha yerleşimi ve blok planı ile netleşir.']
  };
}
function getDripLayoutModel(){
  if(S.uretimTipi==='meyve') return getTreeLayoutModel('meyve');
  if(S.uretimTipi==='bag') return getTreeLayoutModel('bag');
  if(S.uretimTipi==='zeytinlik') return getTreeLayoutModel('zeytinlik');
  if(S.uretimTipi==='sebze') return getVegetableLayout();
  if(S.uretimTipi==='ozel') return getCustomLayout();
  return getFieldCropLayout();
}
function getSprinklerLayoutModel(overrides){
  const geom = getFieldGeometry();
  const ovr = overrides || {};
  // Öncelik: (1) kullanıcı hassas ayarı, (2) override (profile'dan gelen — ör. büyük tabanca 30×30),
  //         (3) headFlow büyükse otomatik geniş aralık, (4) varsayılan 12.
  const headFlow = firstPositive(S.tipBaslikDebi, S.spDebi, ovr.headFlow);
  // Kullanıcı aralık girmemişse debiye göre uygun aralık seç.
  // headFlow girilmemişse üretim tipine göre makul saha aralığı (tarla ≥18m, peyzaj 10-12m).
  // headFlow girilmişse debiden aralık türet.
  // NOT: 12m aralık standart tarla sprinkleri için KÜÇÜK; gerçek tarla rotoru 18-24m aralıklı çalışır.
  // Peyzaj/çim: küçük popup/rotor 10-12m, ~1.0-1.5 m3/h
  // Tarla/sebze: orta rotor 18m, ~2.5 m3/h; büyük tabanca 24-30m, ~3.5-6 m3/h
  const _isLandscape = (typeof isLandscapeProduction === 'function') ? isLandscapeProduction() : (S.uretimTipi === 'peyzaj');
  const _autoSpacing = headFlow
    ? (headFlow > 3.5 ? 30 : headFlow > 2.0 ? 18 : headFlow > 1.5 ? 15 : 12)
    : (_isLandscape ? 12 : 18);  // tarla default 18m (peyzaj 12m)
  const spacingX = firstPositive(S.tipBaslikAralikX, S.spAralikX, ovr.spacingX, _autoSpacing);
  const spacingY = firstPositive(S.tipBaslikAralikY, S.spAralikY, ovr.spacingY, _autoSpacing);
  const headPressure = firstPositive(S.tipBasinc, S.spBasinc, ovr.headPressure, getEquipmentPressureDefault());
  const sprinklerCount = Math.max(1, Math.ceil(geom.areaM2 / Math.max(1, spacingX*spacingY)));
  const lateralCount = Math.max(1, Math.ceil(geom.width / Math.max(1, spacingY)));
  const lateralM = round1(lateralCount * geom.length * 1.05);
  const exact = hasPositive(S.tipBaslikAralikX || S.spAralikX) &&
    hasPositive(S.tipBaslikAralikY || S.spAralikY) &&
    hasPositive(S.tipBaslikDebi || S.spDebi);
  const notes = [];
  if(!exact){
    if(ovr.spacingX || ovr.spacingY){
      notes.push('Yerleşim '+spacingX+'×'+spacingY+' m grid kabul ile oluşturuldu; saha planıyla netleşir.');
    } else {
      notes.push(isLandscapeProduction() ? 'Peyzaj yerleşimi için ön kabul ile başlık sayısı üretildi.' : 'Sprinkler hesabında standart saha yerleşimi kullanıldı.');
    }
  }
  return {
    exact,
    spacingX,
    spacingY,
    headFlow,
    headPressure,
    sprinklerCount,
    lateralCount,
    lateralM,
    notes
  };
}
function choosePumpDiameter(senaryo){
  if(S.kuyuCap) return {value:S.kuyuCap + '"', approx:false, note:'Kuyu çapına göre seçildi.'};
  if(senaryo.secPompGuc<=7.5) return {value:'4"', approx:true, note:'Kuyu çapı girilmedi; güçten türetilmiş ön seçim.'};
  if(senaryo.secPompGuc<=22) return {value:'6"', approx:true, note:'Kuyu çapı girilmedi; güçten türetilmiş ön seçim.'};
  return {value:'8"', approx:true, note:'Kuyu çapı girilmedi; yüksek güç için ön seçim yapıldı.'};
}
function chooseCableSection(kW){
  if(kW<=1.5) return '3 x 2.5 mm²';
  if(kW<=4) return '3 x 4 mm²';
  if(kW<=7.5) return '3 x 6 mm²';
  if(kW<=15) return '3 x 10 mm²';
  if(kW<=22) return '3 x 16 mm²';
  return '3 x 25 mm²';
}
function estimateNozzleDiameter(flowM3h){
  if(flowM3h<=0.9) return '4.0 mm';
  if(flowM3h<=1.4) return '4.5 mm';
  if(flowM3h<=2.1) return '5.0 mm';
  return '5.5 mm';
}
function estimateTankVolume(senaryo){
  const kDebi = S.kuyuDebi || 0;
  const twoHourNeed = senaryo.saatlikSis * 2;
  const debiAcik = kDebi>0 ? Math.max(0, senaryo.saatlikSis - kDebi) * Math.min(6, senaryo.sSure) : 0;
  return Math.max(20, Math.ceil(Math.max(twoHourNeed, debiAcik, S.gunlukSu*0.15)/5)*5);
}
function addSprinklerDistribution(ctx, extra={}){
  // Profile'dan gelen spacing/debi'yi override olarak getSprinklerLayoutModel'e ilet.
  // Büyük tabanca için 30×30 / peyzaj için 8×8 / standart tarla için 12×12 — profile zaten biliyor.
  const profile = (typeof getCropMethodProfile==='function') ? getCropMethodProfile() : null;
  const overrides = extra.layoutOverrides || {};
  if(profile){
    if(!overrides.spacingX && profile.spacingX>0) overrides.spacingX = profile.spacingX;
    if(!overrides.spacingY && profile.spacingY>0) overrides.spacingY = profile.spacingY;
    if(!overrides.headFlow && profile.headFlow>0) overrides.headFlow = profile.headFlow;
    if(!overrides.headPressure && profile.headPressure>0) overrides.headPressure = profile.headPressure;
  }
  const layout = getSprinklerLayoutModel(overrides);
  const approxHint = extra.approxHint || (isLandscapeProduction() ? 'Başlık yerleşimi ve vana kutuları proje ile netleşir.' : 'Başlık yerleşimi ve saha ölçüsü netleşince revize edilir.');
  const spFlow = layout.headFlow || Math.max(0.6, round1(ctx.senaryo.saatlikSis / Math.max(1, ctx.zon.esZamanli||layout.sprinklerCount)));
  ctx.totalPipeM.irrigation += layout.lateralM;
  addBomItem(ctx.items,'Sulama dağıtım sistemi',extra.headLabel || 'Sprinkler',layout.sprinklerCount,'adet',
    (layout.exact ? layout.spacingX+' x '+layout.spacingY+' m yerleşim.' : (isLandscapeProduction() ? 'Peyzaj için ön kabul yerleşimi.' : layout.spacingX+' x '+layout.spacingY+' m yerleşim kabul edildi.')) + ' Çalışma basıncı ' + layout.headPressure.toFixed(1) + ' bar.',
    layout.exact ? {tag:'exact'} : {tag:'approx',approxHint});
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Nozul çapı',estimateNozzleDiameter(spFlow),'','Yaklaşık sprinkler debisine göre ön seçim.',{tag:'survey',approxHint:'Kesin nozul seçimi marka ve meme tablosuna göre yapılır.'});
  addBomItem(ctx.items,'Sulama dağıtım sistemi',extra.lateralLabel || 'Lateral boru',layout.lateralM,'m',
    layout.lateralCount+' hat üzerinden hesaplandı.', layout.exact ? {tag:'exact'} : {tag:'approx',approxHint});
  addBomItem(ctx.items,'Sulama dağıtım sistemi',extra.connectorLabel || 'Sprinkler bağlantı aparatı',layout.sprinklerCount,'adet','Her başlık için bağlantı seti.');
  if(isLandscapeProduction()){
    addBomItem(ctx.items,'Sulama dağıtım sistemi','Vana kutusu',Math.max(1, ctx.zon.zon || 1),'adet','Peyzaj zon kontrolü için.', layout.exact ? {tag:'exact'} : {tag:'approx',approxHint});
    addBomItem(ctx.items,'Opsiyonel ekipmanlar','Solenoid vana',Math.max(1, ctx.zon.zon || 1),'adet','Otomasyon istenirse kullanılır.',{tag:'optional'});
  }
  if(!layout.exact) layout.notes.forEach(note=>ctx.assumptions.push(note));
  ctx.mainEquipment.push((extra.headLabel || 'sprinkler') + ' x ' + layout.sprinklerCount);
}
function addDripDistribution(ctx, drip, config={}){
  const approxHint = config.approxHint || (drip.orchard ? 'Sıra planı tamamlanınca kesin liste çıkar.' : 'Yerleşim planı netleşince revize edilir.');
  const pipeLabel = config.pipeLabel || 'Damla boru';
  const lateralLabel = config.lateralLabel || 'Lateral sayısı';
  ctx.totalPipeM.irrigation += drip.totalLateralM;
  addBomItem(ctx.items,'Sulama dağıtım sistemi',pipeLabel,drip.totalLateralM,'m',config.pipeNote ? config.pipeNote(drip) :
    ((drip.exact ? 'Girilen yerleşime göre hesaplandı.' : 'Ön kabul ile oluşturuldu.') + ' Damlatıcı aralığı ' + (drip.emitterSpacing||0) + ' m.'),
    drip.exact ? {tag:'exact'} : {tag:config.surveyOnInexact ? 'survey' : 'approx',approxHint});
  addBomItem(ctx.items,'Sulama dağıtım sistemi',lateralLabel,drip.lateralCount,'adet',config.lateralNote ? config.lateralNote(drip) : 'Toplam damla hat sayısı.',
    drip.exact ? {tag:'exact'} : {tag:config.surveyOnInexact ? 'survey' : 'approx',approxHint});
  if(drip.emitterCount){
    addBomItem(ctx.items,'Sulama dağıtım sistemi',config.emitterLabel || 'Damlatıcı sayısı',drip.emitterCount,'adet',
      config.emitterNote ? config.emitterNote(drip) : 'Yaklaşık toplam damlatıcı.', drip.exact ? {tag:'exact'} : {tag:config.surveyOnInexact ? 'survey' : 'approx',approxHint});
  }
  if(drip.emittersPerPlant){
    addBomItem(ctx.items,'Sulama dağıtım sistemi',config.perPlantLabel || 'Bitki başına damlatıcı',drip.emittersPerPlant,'adet',
      drip.exact ? 'Girilen değer kullanıldı.' : 'Tipik yerleşim kullanıldı.', drip.exact ? {tag:'exact'} : {tag:config.surveyOnInexact ? 'survey' : 'approx',approxHint});
  }
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Damlatıcı aralığı',drip.emitterSpacing || 0,'m',
    drip.exact ? 'Girilen değer kullanıldı.' : 'Ön kabul ile hesaplandı.', drip.exact ? {tag:'exact'} : {tag:config.surveyOnInexact ? 'survey' : 'approx',approxHint});
  ctx.assumptions.push(config.summaryText ? config.summaryText(drip) : ((drip.lateralCount+' hat') + ', ' + drip.emitterCount + ' damlatıcı ve ' + drip.totalLateralM + ' m damla boru üzerinden hesaplandı.'));
  if(!drip.exact) drip.notes.forEach(note=>ctx.assumptions.push(note));
  if(config.extraItems) config.extraItems(drip);
  ctx.mainEquipment.push(pipeLabel.toLowerCase());
}
function buildFieldCropBOM(ctx){
  if(S.sulamaYontem==='yagmurlama'){
    // KURAL 2: Mısır/Ayçiçeği + Yağmurlama → Büyük Tabanca
    // getCropMethodProfile profile.bigGun=true ise başlık etiketi ve debisi değişir.
    const profile = (typeof getCropMethodProfile==='function') ? getCropMethodProfile() : null;
    if(profile && profile.bigGun){
      addSprinklerDistribution(ctx, {
        headLabel:'Şanzımanlı büyük tabanca',
        connectorLabel:'Tabanca bağlantı aparatı',
        approxHint:'Boylu bitki için 30×30 m grid ve yüksek debi kabul edildi; kesin yerleşim saha keşfiyle netleşir.'
      });
      return;
    }
    addSprinklerDistribution(ctx);
    return;
  }
  if(S.sulamaYontem==='damla'){
    const drip = getFieldCropLayout();
    addDripDistribution(ctx, drip, {
      summaryText:layout=>layout.lateralCount+' lateral, '+layout.emitterCount+' damlatıcı ve '+layout.totalLateralM+' m damla boru üzerinden hesaplandı.'
    });
    return;
  }
  const dagitimM = round1(ctx.geom.length * Math.max(1, S.hatSayisi||1) * 1.05);
  ctx.totalPipeM.irrigation += dagitimM;
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Yüzey dağıtım hattı',dagitimM,'m','Salma sulama için dağıtım kanalı/borusu.',{tag:'approx',approxHint:'Yüzey dağıtım planı saha kotlarına göre netleşir.'});
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Yüzey kontrol vanası',Math.max(1, S.hatSayisi||1),'adet','Hat açma-kapama için.',{tag:'approx',approxHint:'Hat ayrımları projede kesinleşir.'});
}
function buildVegetableBOM(ctx){
  if(S.sulamaYontem==='yagmurlama'){
    addSprinklerDistribution(ctx, {headLabel:'Sebze sprinkler başlığı'});
    return;
  }
  if(S.sulamaYontem==='damla'){
    const drip = getVegetableLayout();
    addDripDistribution(ctx, drip, {
      pipeLabel:'Sebze damla boru',
      lateralLabel:'Lateral sayısı',
      emitterNote:layout=>layout.plantCount+' bitki yerleşimine göre hesaplandı.',
      summaryText:layout=>layout.rowCount+' sıra, '+layout.plantCount+' bitki ve '+layout.totalLateralM+' m damla hat üzerinden hesaplandı.'
    });
    addBomItem(ctx.items,'Sulama dağıtım sistemi','Manifold / kollektör',Math.max(1, drip.rowCount>12 ? Math.ceil(drip.rowCount/12) : 1),'adet','Sebze sıralarını bloklara ayırmak için.', drip.exact ? {tag:'exact'} : {tag:'approx',approxHint:'Kesin manifold adedi saha blok planıyla netleşir.'});
    addBomItem(ctx.items,'Opsiyonel ekipmanlar','Gübre tankı / venturi',1,'set','Sebze üretiminde gübreleme için sık tercih edilir.',{tag:'optional'});
    return;
  }
  buildFieldCropBOM(ctx);
}
function addOrchardMicroSprinklerDistribution(ctx, opts){
  // Meyve / bağ / zeytinlik + yağmurlama override sonucu kullanılır.
  // Grid-bazlı başlık hesabı yerine ağaç sayısı × 1 fıskiye.
  const tree = getTreeLayoutModel(opts.kind || 'meyve');
  const plantCount = Math.max(1, tree.plantCount);
  // Lateral boru — ağaç sıraları boyunca kör (deliksiz) PE boru
  const lateralCount = Math.max(1, tree.rowCount);
  const lateralLength = tree.lateralLength || 0;
  const totalLateralM = round1(lateralCount * lateralLength * 1.05);
  const exact = tree.exact;
  const approxHint = 'Kesin fıskiye ve lateral metrajı ağaç düzeni planıyla netleşir.';
  const headLabel = opts.headLabel || 'Mikro-yağmurlama fıskiyesi';
  const pipeLabel = opts.pipeLabel || 'Kör (deliksiz) PE lateral';
  ctx.totalPipeM.irrigation += totalLateralM;
  addBomItem(ctx.items,'Sulama dağıtım sistemi',headLabel, plantCount,'adet',
    'Ağaç başına 1 adet, 35–70 L/h arası mini mikro-yağmurlama. Çalışma basıncı ~1.75 bar.',
    exact ? {tag:'exact'} : {tag:'survey',approxHint});
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Fıskiye bağlantı aparatı',plantCount,'adet','Her fıskiye için tek bağlantı seti.', exact ? {tag:'exact'} : {tag:'approx',approxHint});
  addBomItem(ctx.items,'Sulama dağıtım sistemi',pipeLabel, totalLateralM,'m',
    lateralCount+' hat × '+round1(lateralLength)+' m. Ağaç diplerinden geçen deliksiz lateral.',
    exact ? {tag:'exact'} : {tag:'approx',approxHint});
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Lateral sayısı', lateralCount,'adet','Sıra başına 1 lateral.',
    exact ? {tag:'exact'} : {tag:'approx',approxHint});
  ctx.assumptions.push(plantCount+' ağaç üzerinden ağaç başına 1 adet mikro-yağmurlama fıskiyesi hesaplandı; toplam '+totalLateralM+' m kör lateral.');
  if(!exact) tree.notes.forEach(n=>ctx.assumptions.push(n));
  ctx.mainEquipment.push('mikro-yağmurlama × '+plantCount);
}

function buildOrchardBOM(ctx){
  if(S.sulamaYontem==='yagmurlama'){
    // KURAL 1 (Akıllı Karar): Meyve + Yağmurlama → Ağaç Altı Mikro-Yağmurlama
    // Grid-bazlı sprinkler adedi yerine ağaç sayısı kadar fıskiye kullanılır.
    addOrchardMicroSprinklerDistribution(ctx, {kind:'meyve', headLabel:'Ağaç altı mikro-yağmurlama fıskiyesi'});
    return;
  }
  if(S.sulamaYontem==='salma'){
    buildFieldCropBOM(ctx);
    ctx.assumptions.push('Meyve bahçesinde salma yöntem seçildiği için dağıtım listesi yüzey sulama mantığıyla oluşturuldu.');
    return;
  }
  const drip = getTreeLayoutModel('meyve');
  addDripDistribution(ctx, drip, {
    pipeLabel:'Bahçe damla boru',
    lateralLabel:'Lateral sayısı',
    perPlantLabel:'Ağaç başına damlatıcı',
    emitterNote:layout=>layout.plantCount+' ağaç üzerinden hesaplandı.',
    surveyOnInexact:true,
    summaryText:layout=>layout.plantCount+' ağaç, '+layout.emitterCount+' damlatıcı ve '+layout.totalLateralM+' m bahçe damla hattı üzerinden hesaplandı.'
  });
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Servis vana grubu',Math.max(1, Math.ceil(drip.rowCount/4)),'adet','Bahçe bloklarını ayırmak için servis vanaları.', drip.exact ? {tag:'exact'} : {tag:'survey',approxHint:'Kesin servis vana adedi sıra blok planı ile netleşir.'});
  addBomItem(ctx.items,'Opsiyonel ekipmanlar','Gübreleme ünitesi',1,'set','Meyve bahçesinde gübre enjeksiyonu için tercih edilir.',{tag:'optional'});
}
function buildVineyardBOM(ctx){
  if(S.sulamaYontem==='yagmurlama'){
    // KURAL 1: Bağ + Yağmurlama → Asma altı Mikro-Yağmurlama
    addOrchardMicroSprinklerDistribution(ctx, {kind:'bag', headLabel:'Asma altı mikro-yağmurlama fıskiyesi'});
    return;
  }
  if(S.sulamaYontem==='salma'){
    buildFieldCropBOM(ctx);
    ctx.assumptions.push('Bağ alanında salma yöntem seçildiği için liste yüzey sulama mantığıyla oluşturuldu.');
    return;
  }
  const drip = getTreeLayoutModel('bag');
  addDripDistribution(ctx, drip, {
    pipeLabel:'Bağ damla laterali',
    lateralLabel:'Sıra lateral sayısı',
    perPlantLabel:'Omca başına damlatıcı',
    emitterNote:layout=>layout.plantCount+' omca üzerinden hesaplandı.',
    surveyOnInexact:true,
    summaryText:layout=>layout.rowCount+' bağ sırası, '+layout.plantCount+' omca ve '+layout.totalLateralM+' m bağ laterali üzerinden hesaplandı.'
  });
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Sıra vanası',Math.max(1, Math.ceil(drip.rowCount/4)),'adet','Bağ sıralarını bloklamak için.', drip.exact ? {tag:'exact'} : {tag:'survey',approxHint:'Kesin vana adedi sıra planıyla netleşir.'});
  addBomItem(ctx.items,'Filtrasyon ve kontrol','Basınç regülasyon grubu',1,'set','Bağ sisteminde eşit dağılım için önerilir.',{tag:'optional'});
}
function buildOliveBOM(ctx){
  if(S.sulamaYontem==='yagmurlama'){
    // KURAL 1: Zeytinlik + Yağmurlama → Seyrek bahçe Mikro-Yağmurlama
    addOrchardMicroSprinklerDistribution(ctx, {kind:'zeytinlik', headLabel:'Seyrek bahçe mikro-yağmurlama fıskiyesi'});
    return;
  }
  if(S.sulamaYontem==='salma'){
    buildFieldCropBOM(ctx);
    ctx.assumptions.push('Zeytinlikte salma yöntem seçildiği için liste yüzey sulama mantığıyla oluşturuldu.');
    return;
  }
  const drip = getTreeLayoutModel('zeytinlik');
  // KURAL 3: Zeytinlik + Damla → Kör (deliksiz) PE boru + Buton damlatıcı (online)
  // Kendinden delikli inline hat yerine açıkça kör boru + ağaç dibi online damlatıcı.
  addDripDistribution(ctx, drip, {
    pipeLabel:'Kör (deliksiz) PE lateral',
    lateralLabel:'Ağaç sırası laterali',
    emitterLabel:'Buton damlatıcı (online, basınç ayarlı)',
    perPlantLabel:'Ağaç başına buton damlatıcı',
    emitterNote:layout=>layout.plantCount+' ağaç × '+layout.emittersPerPlant+' adet 8 L/h buton damlatıcı.',
    pipeNote:layout=>'Deliksiz PE boru — ağaç diplerinde buton damlatıcı bağlanır. Damlatıcı aralığı 1.0 m.',
    surveyOnInexact:true,
    summaryText:layout=>layout.plantCount+' ağaç ve '+layout.totalLateralM+' m kör PE hattı üzerinden hesaplandı (ağaç başı '+layout.emittersPerPlant+' × 8 L/h buton damlatıcı).'
  });
  addBomItem(ctx.items,'Sulama dağıtım sistemi','Blok vana grubu',Math.max(1, Math.ceil(drip.rowCount/3)),'adet','Seyrek ağaçlı blokları ayırmak için.', drip.exact ? {tag:'exact'} : {tag:'survey',approxHint:'Kesin blok vana adedi ağaç gruplamasına göre netleşir.'});
}
function buildLandscapeBOM(ctx){
  if(S.sulamaYontem==='damla'){
    buildFieldCropBOM(ctx);
    ctx.assumptions.push('Peyzaj alanında damla yöntemi seçildiği için dağıtım listesi damla mantığıyla üretildi.');
    return;
  }
  addSprinklerDistribution(ctx, {
    headLabel:'Peyzaj sprinkler başlığı',
    connectorLabel:'Başlık bağlantı aparatı',
    approxHint:'Başlık açısı, kör alanlar ve vana kutuları saha planına göre netleşir.'
  });
}
function buildCustomBOM(ctx){
  if(S.sulamaYontem==='yagmurlama'){
    addSprinklerDistribution(ctx, {approxHint:'Özel düzende başlık yerleşimi saha keşfi ile netleşir.'});
    return;
  }
  if(S.sulamaYontem==='damla'){
    const drip = getCustomLayout();
    addDripDistribution(ctx, drip, {
      pipeLabel:'Özel düzen damla hattı',
      lateralLabel:'Manuel lateral sayısı',
      surveyOnInexact:true,
      summaryText:layout=>layout.rowCount+' manuel hat ve '+layout.totalLateralM+' m damla hattı üzerinden ön keşif listesi oluşturuldu.'
    });
    return;
  }
  buildFieldCropBOM(ctx);
}
function buildProductionSpecificBom(ctx){
  const map = {
    tarla:buildFieldCropBOM,
    sebze:buildVegetableBOM,
    meyve:buildOrchardBOM,
    bag:buildVineyardBOM,
    zeytinlik:buildOliveBOM,
    peyzaj:buildLandscapeBOM,
    ozel:buildCustomBOM
  };
  const fn = map[S.uretimTipi] || buildFieldCropBOM;
  fn(ctx);
}
function buildBomForScenario(senaryo, zon){
  const geom = getFieldGeometry();
  const items = [];
  const warnings = [];
  const assumptions = [];
  const pumpDia = choosePumpDiameter(senaryo);
  const anaHatBase = (S.uzakNokta || 150);
  let anaHatM = anaHatBase * (senaryo.nKuyu===1 ? 1 : senaryo.nKuyu===2 ? 1.5 : 2.0) * 1.1;
  if(senaryo.tipi==='depolu') anaHatM += 20;
  if(senaryo.tipi==='zonlu') anaHatM *= 1.08;
  anaHatM = round1(anaHatM);
  const isSolarEnergy = S.sistemTercih === 'solar' || S.sistemTercih === 'gunes';
  const isSebequeOnly = S.sistemTercih === 'sebeke';
  const isHibrit = S.sistemTercih === 'hibrit';
  // chkSebeke() ile tutarlı: hibrit/sebeke tercihinde sebekeDurum'dan bağımsız şebeke var kabul edilir
  const hasGridLine = isSebequeOnly || isHibrit;
  const trafoInputM = Number(S.trafoMesafe) || 0;
  const effectiveTrafoM = hasGridLine ? (trafoInputM > 0 ? trafoInputM : 25) : 0;
  const panoMesafe = hasGridLine ? effectiveTrafoM : (S.panelYer==='yer' ? 25 : 12);
  const kabloEach = round1((senaryo.pompaDer + 5) * 1.08);
  const toplamPompaKablosu = round1(kabloEach * senaryo.nKuyu);
  const kabloKesit = chooseCableSection(senaryo.secPompGuc);
  const effectiveZones = Math.max(1, zon?.zon || S.hatSayisi || 1);
  const needsZoning = effectiveZones>1;
  const pipeDisplay = senaryo.boru.d_mm + ' mm';
  const pipeTechNote = senaryo.boru.ic_mm ? ' (ic cap ~' + senaryo.boru.ic_mm + ' mm)' : '';
  const kolektorEk = needsZoning ? effectiveZones : Math.max(1, S.hatSayisi||1);
  const elbow = Math.max(2, senaryo.nKuyu*2 + (senaryo.tipi==='depolu'?2:0));
  const tee = Math.max(1, (senaryo.nKuyu-1) + (needsZoning?Math.max(1, effectiveZones-1):0) + (senaryo.teslim==='depo'?1:0));
  const reducer = Math.max(1, senaryo.nKuyu + (needsZoning?1:0));
  const rakor = Math.max(2, senaryo.nKuyu*2 + kolektorEk);
  const flans = senaryo.boru.d_mm>=100 || senaryo.secPompGuc>=11 ? Math.max(2, senaryo.nKuyu*2) : senaryo.nKuyu;
  const elektrikKategori = 'Elektrik ve enerji';
  const totalPipeM = {main:anaHatM, irrigation:0};
  let kolonSema = null;
  let mainEquipment = [
    senaryo.nKuyu + ' adet pompa',
    pipeDisplay + ' ana hat',
    (S.sulamaYontem==='yagmurlama' ? 'sprinkler ekipmanı' : S.sulamaYontem==='damla' ? 'damla boru sistemi' : 'yüzey dağıtım ekipmanı')
  ];
  const ctx = {senaryo, zon, geom, items, warnings, assumptions, totalPipeM, mainEquipment};

  // Premium mod notları — Uzun Ömürlü veya Yüksek Verimli seçiliyse ekipman kalitesi vurgulanır
  const _isPremium   = (typeof isPremiumMode==='function')  ? isPremiumMode()   : false;
  const _isUzunOmur  = (typeof isUzunOmurMode==='function') ? isUzunOmurMode()  : false;
  const _isVerimli   = (typeof isVerimliMode==='function')  ? isVerimliMode()   : false;
  const _isMaliyet   = (typeof isMaliyetMode==='function')  ? isMaliyetMode()   : false;
  const pompaNot = senaryo.secPompGuc+' kW / '+senaryo.pompHP+' HP · '+pumpDia.value +
    (_isVerimli  ? ' · Yüksek verimli sınıf pompa (η≥70%) tercih edilmelidir.'  : '') +
    (_isUzunOmur ? ' · Paslanmaz gövde ve IE3 motor sınıfı önerilir.'           : '') +
    (_isMaliyet  ? ' · Standart ekonomik sınıf pompa.'                          : '');
  addBomItem(items,'Pompa ve kuyu ekipmanları','Dalgıç pompa',senaryo.nKuyu,'adet',pompaNot,pumpDia.approx?{approx:true}:{});
  addBomItem(items,'Pompa ve kuyu ekipmanları','Check valve (çekvalf)',senaryo.nKuyu,'adet','Her pompa çıkışına 1 adet.');
  addBomItem(items,'Pompa ve kuyu ekipmanları','Kuru çalışma koruma',senaryo.nKuyu,'adet',S.kurumaRisk==='var' || senaryo.kuyuTabanSinir ? 'Zorunlu öneri.' : 'Pompa güvenliği için önerilir.', (S.kurumaRisk==='var'||senaryo.kuyuTabanSinir)?{}:{optional:true});
  addBomItem(items,'Pompa ve kuyu ekipmanları','Seviye elektrodu',senaryo.teslim==='depo' ? Math.max(1, senaryo.nKuyu) : senaryo.nKuyu,'adet',senaryo.teslim==='depo' ? 'Depo ve kuyu seviyesini izlemek için.' : 'Kuyu izleme için opsiyonel.', senaryo.teslim==='depo'?{}:{optional:true});
  addBomItem(items,'Pompa ve kuyu ekipmanları','Dalgıç pompa kolon kablosu',toplamPompaKablosu,'m',kabloKesit+' · kuyu içi derinlik + servis payına göre hesaplandı.');

  addBomItem(items,'Ana boru hattı','HDPE ana boru DN'+senaryo.boru.d_mm,anaHatM,'m','Ana hat uzunluğu + %10 fire.');
  addBomItem(items,'Ana boru hattı','PVC alternatif DN'+senaryo.boru.d_mm,anaHatM,'m','Saha ve montaj koşuluna göre opsiyon.',{optional:true,approx:true,approxHint:'Boru tipi saha ve fiyat tercihine göre netleşir.'});
  addBomItem(items,'Ana boru hattı','Dirsek',elbow,'adet','Ana hat dönüş ve kuyu çıkışları için yaklaşık adet.',{approx:true,approxHint:'Fitting sayısı saha yerleşimine göre netleşir.'});
  addBomItem(items,'Ana boru hattı','T parçası',tee,'adet','Kolektör ve hat ayrımları için yaklaşık adet.',{approx:true,approxHint:'Kolektör yerleşimi netleşince adet revize edilir.'});
  addBomItem(items,'Ana boru hattı','Redüksiyon',reducer,'adet','Pompa çıkışı ve vana geçişleri için.',{approx:true,approxHint:'Çap geçişleri saha bağlantısına göre kesinleşir.'});
  addBomItem(items,'Ana boru hattı','Rakor',rakor,'adet','Servis bağlantıları için.',{approx:true,approxHint:'Servis bağlantı noktaları projede netleşir.'});
  addBomItem(items,'Ana boru hattı','Flanş',flans,'adet','Sökülebilir bağlantı noktaları için.',{approx:true,approxHint:'Montaj detayına göre flanş adedi değişebilir.'});

  const hdpeMainItem = items.find(item=>item.category==='Ana boru hattÄ±' && item.material.indexOf('HDPE ana boru')===0);
  const pvcMainItem = items.find(item=>item.category==='Ana boru hattÄ±' && item.material.indexOf('PVC alternatif')===0);
  const hdpePipeItem = items.find(item=>item.material.indexOf('HDPE ana boru')===0);
  const pvcPipeItem = items.find(item=>item.material.indexOf('PVC alternatif')===0);
  if(hdpePipeItem){
    hdpePipeItem.material = 'HDPE ana boru ' + pipeDisplay;
    hdpePipeItem.note += pipeTechNote;
  }
  if(pvcPipeItem){
    pvcPipeItem.material = 'PVC alternatif ' + pipeDisplay;
    pvcPipeItem.note += pipeTechNote;
  }
  buildProductionSpecificBom(ctx);

  const reguGerekli = ['sinir','yuksek','kritik'].includes(senaryo.basincDurum);
  // KURAL 4: Salma sulamada tarla içi ince filtre grupları listeden çıkarılır.
  // (Disk/Kum filtre kalemleri salma seçildiğinde listede HİÇ görünmez —
  //  kullanıcı daha sonra damla/yağmurlamaya geçerse BOM yeniden üretilir.)
  if(S.sulamaYontem !== 'salma'){
    addBomItem(items,'Filtrasyon ve kontrol','Kum filtre',1,'set',
      S.sulamaYontem==='damla' ? 'Damla sistemde önerilir.' : 'Su kalitesi yüksek değilse eklenir.',
      S.sulamaYontem==='damla'?{}:{optional:true});
    addBomItem(items,'Filtrasyon ve kontrol','Disk filtre',1,'set','Ana filtrasyon hattı.',{});
  }
  addBomItem(items,'Filtrasyon ve kontrol','Küresel vana',Math.max(2, senaryo.nKuyu + kolektorEk + (senaryo.teslim==='depo'?2:0)),'adet','Kuyu, kolektör ve servis ayırma vanaları.',{approx:true,approxHint:'Vana adedi saha kolektör planına göre netleşir.'});
  addBomItem(items,'Filtrasyon ve kontrol','Kelebek vana',senaryo.boru.d_mm>=110 ? Math.max(1, senaryo.nKuyu) : 1,'adet',senaryo.boru.d_mm>=110 ? 'Ana hat izolasyonu için.' : 'İsteğe bağlı büyük çap vana.', senaryo.boru.d_mm>=110?{}:{optional:true});
  addBomItem(items,'Filtrasyon ve kontrol','Manometre',Math.max(2, senaryo.nKuyu),'adet','Pompa çıkışı ve filtre sonrası ölçüm.');
  addBomItem(items,'Filtrasyon ve kontrol','Basınç regülatörü',reguGerekli ? Math.max(1, senaryo.nKuyu) : 1,'adet',reguGerekli ? 'Basınç yüksek/sınırda olduğu için önerilir.' : 'Gerekirse eklenir.', reguGerekli?{}:{optional:true});
  addBomItem(items,'Filtrasyon ve kontrol','Debimetre',senaryo.nKuyu>1 || S.araziDonum>30 ? 1 : 1,'adet',senaryo.nKuyu>1 || S.araziDonum>30 ? 'İzleme için önerilir.' : 'Opsiyonel ölçüm ekipmanı.', senaryo.nKuyu>1 || S.araziDonum>30 ? {} : {optional:true});

  // ── ENERJİ MALZEMELERİ ─────────────────────────────────────────────────────────────────────────
  // Durum 1: Sadece güneş (solar/gunes + sebekeDurum=yok)
  // Durum 2: Sadece şebeke (sistemTercih=sebeke) → ADP + trafo kablosu
  // Durum 3: Hibrit → her iki grubun malzemeleri + hibrit kontrol
  // Durum 4: Yerel şebeke var + solar → Durum 1 + 2 birlikte

  // ── Ortak yardımcı hesaplar ──
  const sahaEnerjiKablosuM = round1(Math.max(
    18,
    ((panoMesafe + 8) * Math.max(1, senaryo.nKuyu)) + (senaryo.nKuyu>1 ? ((S.kuyuMesafe||0) * 0.35) : 0)
  ));

  // ─── KOLON KABLO KESİT HESABI ─────────────────────────────────────────────
  // Hat tipi ve malzeme S state'inden alınır (chkSebeke + hesapla() ile set edilir)
  const hatTip       = S.hatTip       || 'yeralti';   // 'yeralti' | 'havai'
  const kabloMalzeme = S.kabloMalzeme || 'bakir';     // 'bakir' | 'aluminyum'
  const isAl         = kabloMalzeme === 'aluminyum';
  const isHavai      = hatTip === 'havai';

  // Kablo tip adı (rapor için)
  // Yeraltı Cu: NYY | Yeraltı Al: NAYY | Havai Cu: NYM/NYA | Havai Al: ALPEK/NAYY-J
  const kabloTipAdi = isHavai
    ? (isAl ? 'NAYY-J (havai, Al)' : 'NYY-J / NYA (havai, Cu)')
    : (isAl ? 'NAYY (yeraltı, Al)' : 'NYY (yeraltı, Cu)');

  // Özdirenç: Cu=0.0175, Al=0.028 Ω·mm²/m (20°C)
  const rho = isAl ? 0.028 : 0.0175;

  // Akım taşıma kapasitesi tablosu (IEC 60364-5-52, PVC izolasyon)
  // Yeraltı döşeme (toprak içi, 20°C, tek devre): Cu ve Al için
  // Havai hatta akım kapasitesi ~%15-20 daha yüksektir (hava soğutma)
  const havaiFaktor = isHavai ? 1.15 : 1.0;
  // 6 mm² Cu eklendi (IEC 60364-5-52: toprak içi 41 A, havai ~47 A)
  const izTablosu_Cu = {6:41, 10:52, 16:68, 25:89, 35:110, 50:134, 70:170, 95:207, 120:239, 150:275, 185:314, 240:368};
  const izTablosu_Al = {16:52, 25:68, 35:84, 50:103, 70:131, 95:162, 120:188, 150:216, 185:245, 240:287};
  const izTablosu = isAl ? izTablosu_Al : izTablosu_Cu;
  // 6 mm² Cu listede mevcut (şebeke kolon hattı için minimum pratik kesit)
  const stdKesitler = isAl ? [16,25,35,50,70,95,120,150,185,240] : [6,10,16,25,35,50,70,95,120,150,185,240];

  function secKolonKesit(kW, mesafeM){
    if(kW <= 0 || mesafeM <= 0) return {kesit: stdKesitler[0], akim:0, amin:0, kabloTip:kabloTipAdi};
    // 3-fazlı akım: I = P / (√3 × U × cosφ)
    // Basitleştirilmiş: I = kW×1000 / (√3×380×0.9) ≈ kW×1000 / 592
    const cosfi = 0.9;
    const I = (kW * 1000) / (Math.sqrt(3) * 380 * cosfi);  // A (ondalıklı, yuvarlama sonra)
    const I_ceil = Math.ceil(I);

    // Gerilim düşümü hesabı: ΔU = (√3 × I × L × ρ) / A
    // Hedef: %3 → ΔU_izin = 380 × 0.03 = 11.4 V
    const deltaU_izin = 380 * 0.03;
    const A_min = (Math.sqrt(3) * I * mesafeM * rho) / deltaU_izin;

    // Gerilim düşümü limitinden minimum kesit
    let secilenA = stdKesitler.find(a => a >= A_min) || stdKesitler[stdKesitler.length-1];

    // Akım taşıma kapasitesi kontrolü: Iz × havaiFaktor ≥ I × 1.15 (termik koruma ile IEC standart emniyet)
    let finalKesit = secilenA;
    while(true){
      const Iz = (izTablosu[finalKesit]||0) * havaiFaktor;
      if(Iz >= I_ceil * 1.15) break;
      const idx = stdKesitler.indexOf(finalKesit);
      if(idx < 0 || idx >= stdKesitler.length-1){ finalKesit=stdKesitler[stdKesitler.length-1]; break; }
      finalKesit = stdKesitler[idx+1];
    }

    // Gerçek gerilim düşümü doğrulama
    const deltaU_gercek = (Math.sqrt(3) * I * mesafeM * rho) / finalKesit;
    const deltaU_yuzde  = Math.round(deltaU_gercek / 380 * 100 * 10) / 10;

    return {
      kesit: finalKesit,
      akim:  Math.round(I * 10) / 10,
      amin:  Math.round(A_min * 10) / 10,
      deltaU_v:    Math.round(deltaU_gercek * 10) / 10,
      deltaU_yuzde,
      kabloTip: kabloTipAdi
    };
  }

  // 3 fazlı akım hesabı (şebeke için)
  const sebekePompKW  = senaryo.secPompGuc || 0;
  const sebekeSolarKW = (isSolarEnergy||isHibrit) ? (senaryo.totKwp||0) : 0;
  const sebekeToplKW  = sebekePompKW + sebekeSolarKW;
  const kolonHesap    = hasGridLine ? secKolonKesit(sebekeToplKW, effectiveTrafoM) : null;
  const kolonKesitStr = kolonHesap
    ? kolonHesap.kesit + ' mm² ' + (isAl?'Al':'Cu') + ' · ' + kabloTipAdi +
      (kolonHesap.deltaU_yuzde ? ' · ΔU%=' + kolonHesap.deltaU_yuzde + '%' : '')
    : '';
  const sebekeAkim    = kolonHesap ? kolonHesap.akim : 0;

  // ── Ortak pano ekipmanları (tüm senaryolarda) ──
  addBomItem(items, elektrikKategori,'Ana şalter / giriş izolasyonu',1,'adet','AC taraf enerji giriş izolasyonu. Tüm senaryolarda zorunlu.');
  addBomItem(items, elektrikKategori,'Motor koruma şalteri (TMŞ)',senaryo.nKuyu,'adet',
    'Her pompa çıkışında termik-manyetik şalter. Kısa devre ve aşırı akım koruması için.');
  addBomItem(items, elektrikKategori,'Faz koruma rölesi',1,'adet',
    'Faz sırası, eksik faz ve gerilim dengesizliğine karşı koruma.');
  addBomItem(items, elektrikKategori,'Kaçak akım koruma rölesi (RCD/RCCB)',1,'adet',
    '30 mA hassasiyetli, ıslak ortam (sulama sahası) için zorunlu koruma.');
  addBomItem(items, elektrikKategori,'Klemens / kablo pabucu seti',senaryo.nKuyu,'set',
    'Pano içi sonlandırma ve servis bağlantıları.',{approx:true,approxHint:'Pano yerleşimine göre revize edilir.'});
  // Uzun Ömürlü modda kablo kesiti bir üst standart değere yükselt (ısınma payı)
  var _kabloKesitFinal = kabloKesit;
  if(_isUzunOmur){
    var _std = ['3 x 2.5 mm²','3 x 4 mm²','3 x 6 mm²','3 x 10 mm²','3 x 16 mm²','3 x 25 mm²'];
    var _idx = _std.indexOf(kabloKesit);
    if(_idx >= 0 && _idx < _std.length-1) _kabloKesitFinal = _std[_idx+1];
  }
  var _kabloNot = _kabloKesitFinal + ' · pano ile kuyu başı arası saha dağıtımı.' +
    (_isUzunOmur ? ' Premium mod: kesit bir üst standarta yükseltildi (daha az ısınma, uzun ömür).' : '') +
    (_isMaliyet  ? ' Standart kesit kullanıldı.' : '');
  addBomItem(items, elektrikKategori,'Kolon / enerji kablosu (pano → kuyu başı)',sahaEnerjiKablosuM,'m',
    _kabloNot,{approx:true,approxHint:'Gerçek güzergaha göre revize edilir.'});

  // ── TOPRAKLAMA PAKETİ (zorunlu uyarı) ──
  addBomItem(items, elektrikKategori,'⚠ Topraklama paketi (ZORUNLU)',1,'set',
    '16 mm² bakır topraklama kablosu · Bakır veya galvaniz topraklama çubuğu (min. 1.5 m) · ' +
    'Toprak ek klemens ve bağlantı elemanları. IEC 60364-4-41 ve IEC 62305 gereği zorunludur. ' +
    'Islak ortam ve yıldırım riski nedeniyle ihmal edilmemelidir.');

  // ── GÜNEŞ ENERJİSİ BÖLÜMÜ ──
  if(isSolarEnergy || isHibrit){
    const dcCable = round1((senaryo.toplamP * (S.panelYer==='yer' ? 2.6 : 1.7)) + (senaryo.nKuyu*12));
    const panelAlan = senaryo.panelAlanM2 || Math.round(senaryo.toplamP * 2.0 * 1.5);
    const egim     = senaryo.optimalEgim  || 33;
    const _panelKalite = _isVerimli ? ' Yüksek verimli monokristal (≥%21 verim) panel seçilmelidir.' :
                         _isUzunOmur ? ' Cam-cam veya uzun garantili (≥25 yıl) panel tercih edilmelidir.' :
                         _isMaliyet ? ' Standart polikristal veya ekonomik monokristal panel kullanılabilir.' : '';
    // Enerji boyutlandirma katsayisi dogrudan minimum hedef gucu belirler.
    const kwpNot   = 'Kurulu güç: pompa ' + senaryo.secPompGuc + ' kW, panel toplam ' +
                     senaryo.totKwp + ' kWp. Enerji boyutlandırma katsayısı ×' + (senaryo.solarSizingFactor || ((S.sistemTercih === 'solar' || S.sistemTercih === 'gunes') ? 2.2 : 1.7)) +
                     ' esas alındı. Bu pompa için minimum kurulu güç ~' + (senaryo.solarMinKwp || 9) + ' kWp olmalı. Panel: ' + senaryo.pW + ' W/adet.' + _panelKalite +
                     ' Solar sınıf: ' + (senaryo.solarSizingLabel || 'Dengeli kurulum') + '. ' +
                     (senaryo.solarSizingText || 'Güneş tarafı için tipik saha kayıpları dahil ön boyutlandırma uygulanmıştır.') +
                     ' Daha rahat çalışma için dengeli / rezervli bant yaklaşık ' + (senaryo.solarBalancedKwp || senaryo.totKwp) + '-' + (senaryo.solarReserveKwp || senaryo.totKwp) + ' kWp aralığına çıkar.';



    addBomItem(items, elektrikKategori,'Solar panel',senaryo.toplamP,'adet',
      kwpNot + ' Tahmini panel alanı: ~' + panelAlan + ' m². ' +
      'Optimal montaj eğimi (' + (S.ilSecim||'orta') + ' ili): ' + egim + '°.');
    addBomItem(items, elektrikKategori,'Solar pompa inverteri',senaryo.nKuyu,'adet',
      senaryo.invKW+' kW pompa inverteri. MPPT denetimli, dalgıç pompa sürücüsü.');
    addBomItem(items, elektrikKategori,'Solar DC kablo',dcCable,'m',
      'Panel → inverter arası DC hat. Ön keşif metrajı.',{approx:true,approxHint:'Panel dizilimi netleşince revize edilir.'});
    addBomItem(items, elektrikKategori,'DC koruma ekipmanları (string sigorta + parafudr)',Math.max(1,senaryo.nKuyu),'set',
      'String sigorta, DC parafudr ve DC ayırıcı seti. Her inverter girişine.');
    addBomItem(items, elektrikKategori,'Panel taşıyıcı konstrüksiyon',Math.max(1,senaryo.nKuyu),'set',
      S.panelYer==='yer'
        ? 'Sabit eğimli yer montaj çelik konstrüksiyonu. Optimal eğim: '+egim+'°.'
        : 'Çatı/yapı üstü montaj konstrüksiyonu. Eğim yapıya göre netleşir.',
      {approx:true,approxHint:'Panel dizilimi ve montaj sahası netleşince kesinleşir.'});
    if(isHibrit){
      addBomItem(items, elektrikKategori,'Hibrit kontrol ünitesi',1,'adet',
        'Güneş ve şebeke geçişini otomatik yöneten kontrol ünitesi.');
      addBomItem(items, elektrikKategori,'Enerji izleme modülü',1,'adet',
        'Güneş / şebeke enerji payını izlemek için.',{tag:'optional'});
    }
    mainEquipment.push('solar panel ' + senaryo.toplamP + ' adet (' + senaryo.totKwp + ' kWp)');
  }

  // ── ŞEBEKE / AC ALTYAPI BÖLÜMÜ ──
  if(hasGridLine){
    const enerjiKablosuM = round1(effectiveTrafoM * 1.1 * Math.max(1, senaryo.nKuyu));
    const trafoNot = trafoInputM > 0
      ? 'Trafo mesafesi ' + trafoInputM + ' m. Gerilim düşümü hesabına göre kesit: ' + kolonKesitStr + '.'
      : 'Trafo mesafesi girilmedi; 25 m varsayıldı. Kesit: ' + kolonKesitStr + '.';
    const trafoApprox = trafoInputM > 0 ? {} : {approx:true,approxHint:'Trafo ve pano konumu netleşince kablo revize edilir.'};

    // Ana Dağıtım Panosu (ADP) — şebeke varsa zorunlu
    addBomItem(items, elektrikKategori,'Ana Dağıtım Panosu (ADP)',1,'adet',
      'Şebeke girişi, sigorta grubu ve pompanın tüm AC kontrolü bu panoda toplanır. ' +
      'Pompalar icin toplam yuk: ~' + sebekeToplKW.toFixed(1) + ' kW.');
    addBomItem(items, elektrikKategori,'Pompa panosu',senaryo.nKuyu,'adet','Şebeke + motor kontrol ünitesi.');
    addBomItem(items, elektrikKategori,'Kontaktör',senaryo.nKuyu,'adet','Motor kumandası için AC kontaktör.');
    addBomItem(items, elektrikKategori,'Termik röle',senaryo.nKuyu,'adet','Motor aşırı akım koruması için termik röle.');
    addBomItem(items, elektrikKategori,'NH sigorta seti (giriş + motor)',senaryo.nKuyu,'set',
      'Giriş bıçaklı sigorta grubu ve motor koruma sigortaları.');

    // 3 fazlı akım bilgisi raporla
    const sebekeI = sebekeToplKW > 0 ? Math.round(sebekeToplKW*1000/(Math.sqrt(3)*380*0.9)) : 0;
    const akimNot = sebekeToplKW > 0 ? '3 fazli (trifaze) sistem akimi: ~'+sebekeToplKW.toFixed(1)+' kW, ~'+sebekeI+' A (cos fi=0.9). ' : '';

    // Trafo kolon kablosu — 4 iletken (3 faz + nötr), Cu
    const _kolonKesit  = kolonHesap ? kolonHesap.kesit : (isAl ? 25 : 16);
    const _kabloMalzAd = isAl ? 'Al' : 'Cu';
    const _dusuNot     = kolonHesap && kolonHesap.deltaU_yuzde
      ? ' Hesaplanan ΔU%=' + kolonHesap.deltaU_yuzde + '% (limit %3). I≈' + (kolonHesap.akim||0).toFixed(1) + ' A.'
      : ' Gerilim düşümü %3 limiti esas alındı.';
    const _hatNot      = isHavai ? ' Havai hat döşeme.' : ' Yeraltı döşeme (toprak içi, beton koruma önerilir).';
    addBomItem(items, elektrikKategori,
      'Ana kolon kablosu (trafo → ADP) — 4×' + _kolonKesit + ' mm² ' + _kabloMalzAd + ' ' + kabloTipAdi,
      enerjiKablosuM,'m',
      trafoNot + ' 4 iletken (3 faz + nötr).' + _dusuNot + _hatNot,
      trafoApprox);
    if(effectiveTrafoM > 50){
      addBomItem(items, elektrikKategori,'Kablo kanalı / boru koruması',round1(effectiveTrafoM * 1.05),'m',
        'Trafo hattı boyunca kablo koruması (HDPE boru veya galvaniz kanal).',
        {approx:true,approxHint:'Kablo güzergahına göre saha keşfiyle netleşir.'});
    }
    if(isHibrit){
      addBomItem(items, elektrikKategori,'Şebeke bağlantı sigortası',1,'set','Hibrit sistemde şebeke giriş koruması.');
    }
    mainEquipment.push('ADP + ' + enerjiKablosuM + ' m kolon kablosu');
  }

  // ── KOLON ŞEMASI / TEK HAT ÖZETI ──────────────────────────────────────────────────────────────
  (function buildKolonSema(){
    const hasGrid  = hasGridLine;
    const hasSolar = isSolarEnergy || isHibrit;
    const yontem   = S.sulamaYontem === 'yagmurlama' ? 'Sprinkler başlıkları' : S.sulamaYontem === 'damla' ? 'Damla lateralleri' : 'Yüzey dağıtım hattı';
    const mode = hasSolar && hasGrid ? 'hibrit' : hasSolar ? 'solar' : 'sebeke';
    const cableText = hasGrid
      ? '4×' + (kolonHesap ? kolonHesap.kesit : 95) + ' mm² ' + (isAl ? 'Al' : 'Cu') + ' ' + kabloTipAdi
      : '';
    const energySources = [];
    let mergeNode = null;
    let energyFlow = [];

    if(mode === 'hibrit'){
      energySources.push(
        { label:'Trafo / Şebeke', meta:cableText + ' · ADP girişi' },
        { label:'Solar Panel Dizisi', meta:senaryo.totKwp + ' kWp · ' + senaryo.toplamP + ' adet' }
      );
      mergeNode = { label:'Ana Dağıtım Panosu (ADP)', meta:'Şebeke + solar AC toplama ve ana koruma' };
      energyFlow = [
        { label:'Pompa Panosu', meta:'TMŞ + faz koruma + RCD' },
        { label:'Dalgıç Pompa', meta:senaryo.secPompGuc + ' kW' }
      ];
    } else if(mode === 'solar'){
      energyFlow = [
        { label:'Solar Panel Dizisi', meta:senaryo.totKwp + ' kWp · ' + senaryo.toplamP + ' adet' },
        { label:'DC Koruma', meta:'String sigorta + parafudr' },
        { label:'Pompa İnverteri', meta:senaryo.invKW + ' kW · MPPT sürücü' },
        { label:'Pompa Panosu', meta:'TMŞ + faz koruma + RCD' },
        { label:'Dalgıç Pompa', meta:senaryo.secPompGuc + ' kW' }
      ];
    } else {
      energyFlow = [
        { label:'Trafo / Şebeke', meta:cableText || 'AC giriş hattı' },
        { label:'Ana Dağıtım Panosu (ADP)', meta:'Giriş izolasyonu + ana koruma' },
        { label:'Pompa Panosu', meta:'TMŞ + kontaktör + termik + RCD' },
        { label:'Dalgıç Pompa', meta:senaryo.secPompGuc + ' kW' }
      ];
    }

    const waterFlow = [
      { label:'Kuyu', meta:'Su kaynağı' },
      { label:'Dalgıç Pompa', meta:senaryo.secPompGuc + ' kW' },
      { label:'Çekvalf', meta:'Geri kaçışı önler' },
      { label:'Ana Hat', meta:'HDPE DN' + senaryo.boru.d_mm + pipeTechNote },
      { label:'Filtre Grubu', meta:'Kum + disk filtrasyon' }
    ];
    if(senaryo.tipi==='depolu' || senaryo.teslim==='depo'){
      waterFlow.push({ label:'Depo', meta:'Tampon hacim / ara depolama' });
    }
    if(senaryo.tipi==='zonlu' || (zon && zon.zon > 1)){
      waterFlow.push({ label:'Zon Vanaları', meta:(zon?.zon || 1) + ' zon' });
    }
    waterFlow.push({ label:yontem, meta:'Saha dağıtım sonu' });

    kolonSema = {
      mode,
      modeLabel: mode === 'hibrit' ? 'Hibrit kolon şeması' : mode === 'solar' ? 'Solar kolon şeması' : 'Şebeke kolon şeması',
      modeNote: mode === 'hibrit'
        ? 'Şebeke ve güneş aynı ana dağıtım panosunda birleşir.'
        : mode === 'solar'
          ? 'Enerji akışı DC taraftan inverter üzerinden pompaya iner.'
          : 'Enerji akışı şebekeden doğrudan pano ve pompa hattına ilerler.',
      energySources,
      mergeNode,
      energyFlow,
      waterFlow,
      grounding: {
        title:'Topraklama ve koruma',
        note:'Islak ortam, kaçak akım ve yıldırım etkileri için topraklama ihmal edilmez.',
        tags:[
          '16 mm² bakır topraklama kablosu',
          'Bakır / galvaniz çubuk (min 1.5 m)',
          'IEC 60364-4-41',
          'IEC 62305'
        ]
      }
    };
    assumptions.push('Kolon / tek hat şeması seçili çözüm için ayrı panelde ön keşif seviyesinde gösterildi.');
  })();
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  if(senaryo.tipi==='depolu' || senaryo.teslim==='depo'){
    const tankM3 = estimateTankVolume(senaryo);
    addBomItem(items,'Opsiyonel ekipmanlar','Depo',tankM3,'m³','Tampon hacim için önerilen ön boyut.',{tag:'survey',approxHint:'Kesin depo hacmi kullanım senaryosu ve saha yerleşimiyle netleşir.'});
    addBomItem(items,'Opsiyonel ekipmanlar','Şamandıra',1,'adet','Depo dolum kontrolü.');
    addBomItem(items,'Opsiyonel ekipmanlar','Seviye sensörü',1,'adet','Depo izleme için.');
    addBomItem(items,'Opsiyonel ekipmanlar','Otomasyon',1,'set','Pompa ve depo senkronu için.',{tag:'optional'});
    warnings.push('Kuyu debisi düşükse depolu çözüm, günlük kullanımı daha rahat hale getirir.');
    mainEquipment.push('depo ve seviye kontrolü');
  }
  if(needsZoning){
    const zonMeta = zon.tip==='tahmini' ? {approx:true,approxHint:'Zon adedi detaylı proje ile netleşir.'} : {};
    addBomItem(items,'Opsiyonel ekipmanlar','Zon vanası',Math.max(2, zon.zon),'adet','Her bölüm için kontrol vanası.',zonMeta);
    addBomItem(items,'Opsiyonel ekipmanlar','Zon kolektörü',1,'set','Bölümlü sulama için manifold.',zonMeta);
    addBomItem(items,'Opsiyonel ekipmanlar','Otomasyon',1,'set','Zon sıralaması için önerilir.',{tag:'optional'});
    warnings.push('Zonlu sistemde vana sayısı artar; fakat pompa daha rahat çalışır.');
    mainEquipment.push(zon.zon+' adet zon vanası');
  }
  if(zon.autoAdjusted){
    assumptions.push('Girilen zon degeri yerine hidrolik olarak minimum ' + zon.zon + ' zon esas alindi.');
  }
  if(senaryo.nKuyu>1){
    warnings.push(senaryo.nKuyu+' kuyu sisteminde pompa, pano ve kablo adedi artar.');
  }
  if(reguGerekli){
    warnings.push('Bu sistemde basınç yüksek olduğu için regülatör önerilir.');
  }
  if(!S.kuyuDebi){
    assumptions.push('Kuyu debisi bilinmediği için su verme güveni saha verisiyle netleşir.');
  }
  // Hedef seçimi rapor notu
  if(_isPremium){
    var _hedefAd = [];
    if(_isUzunOmur) _hedefAd.push('Uzun Ömürlü');
    if(_isVerimli)  _hedefAd.push('Yüksek Verimli');
    assumptions.push('Sistem hedefi: '+_hedefAd.join(' + ')+'. Kablo kesitleri, pompa ve panel sınıfı premium standarda göre seçilmiştir. Malzeme listesindeki notlar incelenmelidir.');
  } else if(_isMaliyet){
    assumptions.push('Sistem hedefi: Maliyet Odaklı. Standart ekipman seçilmiştir; uzun vadeli işletme maliyetleri değerlendirilmelidir.');
  }
  if(S.sulamaYontem==='yagmurlama' && !getSprinklerLayoutModel().exact){
    assumptions.push(isLandscapeProduction() ? 'Peyzaj başlık hesabı ön kabul ile üretildi.' : 'Sprinkler hesabında standart grid varsayıldı.');
  }
  if(S.sulamaYontem==='damla' && !getDripLayoutModel().exact){
    assumptions.push(isTreeBasedProduction()
      ? getProductionTypeName() + ' için damla listesi ön kabul ile üretildi.'
      : S.uretimTipi==='ozel'
        ? 'Özel düzen ön keşif seviyesiyle listelendi.'
        : 'Damla sistem hesabında standart yerleşim varsayımı kullanıldı.'
    );
  }
  if(!S.trafoMesafe && hasGridLine){
    assumptions.push('Trafo/pano mesafesi girilmediği için 25 m enerji kablosu varsayıldı.');
  }

  const approxCount = items.filter(i=>i.tag==='approx' || i.tag==='survey').length;
  const totalPipe = round1(totalPipeM.main + totalPipeM.irrigation);
  const smartOverride = (typeof getSmartOverride==='function') ? getSmartOverride() : { applied:false };
  if(smartOverride.applied){
    // Override uygulandığında varsayımlara da kısa bir not düş (ama uzun metin UI panelinde gösterilecek)
    assumptions.unshift('Akıllı karar motoru: "'+smartOverride.originalMethod+'" → "'+smartOverride.newStandard+'" olarak revize edildi.');
  }
  return {
    scenario:senaryo,
    zon,
    items,
    groups:groupBomItems(items),
    warnings:uniqueScenarioRefs(warnings),
    assumptions:uniqueScenarioRefs(assumptions),
    kolonSema,
    override:smartOverride,
    summary:{
      pumpText:senaryo.nKuyu+' pompa · '+senaryo.secPompGuc+' kW/pompa'+(senaryo.nKuyu>1?' · toplam '+senaryo.toplamKW+' kW':''),
      pipeText:totalPipe+' m toplam boru',
      mainEquipment:mainEquipment.slice(0,4),
      mainPipe:anaHatM,
      totalPipe,
      approxCount,
      statusText:isTreeBasedProduction() && S.sulamaYontem==='damla' && approxCount>0
        ? 'Malzeme listesi ön kabul ile oluşturuldu. Ağaç / sıra planı ile kesinleşir.'
        : S.uretimTipi==='ozel'
          ? 'Malzeme listesi ön keşif seviyesinde oluşturuldu.'
          : approxCount>0 ? 'Malzeme listesi oluşturuldu. Bazı kalemler yaklaşık veya keşifle netleşir etiketi taşıyor.' : 'Malzeme listesi oluşturuldu.'
    }
  };
}

/* –– TEMEL HESAP FONKSİYONLARI –––––––––––––––––––––––––––––––––––––– */
function secBoruCap(Q_m3s){
  const stdCaps = Object.keys(BORU_IC).map(v=>parseInt(v,10)).sort((a,b)=>a-b);
  if(S.boruCap){
    const disCap = parseInt(S.boruCap,10);
    const icCap = BORU_IC[disCap] || disCap;
    return {d_mm:disCap, ic_mm:icCap, d_m:icCap/1000};
  }
  // Akademik hız kuralı: Vmax=1.5 m/s, hedef hız %80 kapasite = 1.2 m/s
  const r=Math.sqrt(Q_m3s/(Math.PI*1.2));
  const ihtiyacIcCap = r*2*1000;
  let disCap = stdCaps.find(cap=>(BORU_IC[cap]||cap)>=ihtiyacIcCap) || stdCaps[stdCaps.length-1];
  let icCap = BORU_IC[disCap] || disCap;
  // Akademik ek kural: seçilen çapla 100m'deki hat kaybı >3 mSS ise bir üst çap seç
  // (pompa boğulmasın, enerji verimi korunsun)
  if(Q_m3s > 0){
    const d_m = icCap/1000;
    const kayip100m = (10.67 * 100 * Math.pow(Q_m3s,1.852)) /
                      (Math.pow(140, 1.852) * Math.pow(d_m, 4.87));  // mSS/100m
    if(kayip100m > 3.0){
      const idx = stdCaps.indexOf(disCap);
      if(idx >= 0 && idx < stdCaps.length-1){
        disCap = stdCaps[idx+1];
        icCap = BORU_IC[disCap] || disCap;
      }
    }
  }
  return {d_mm:disCap, ic_mm:icCap, d_m:icCap/1000};
}
function hatKayipHW(Q_m3s,d_m,L){
  if(!Q_m3s||!d_m||!L) return 0;
  const hazenC = {hdpe:140,pvc:150,galvaniz:120}[S.boruTip] || 140;
  const eqLen = L * 1.15;
  const majorBar = (10.67*eqLen*Math.pow(Q_m3s,1.852))/(Math.pow(hazenC,1.852)*Math.pow(d_m,4.87))/10.2;
  const velocity = (4 * Q_m3s) / (Math.PI * Math.pow(d_m,2));
  const minorBar = ((2.5 * Math.pow(velocity,2)) / (2 * 9.81)) / 10.2;
  return round1(majorBar + minorBar);
}

// Lateral hat kaybı — damla/yağmurlama laterali boyunca sürtünme
// Lateral boyunca akış ucra doğru azaldığı için "eşdeğer" debi girişin yaklaşık 0.37'sidir (Christiansen F faktörü).
// Basit yaklaşım: Q_input × 0.4 ile HW hesabı.
function hatKayipLateralHW(Q_input_m3h, d_inner_mm, L_m){
  if(!Q_input_m3h || !d_inner_mm || !L_m) return 0;
  const Q_eff_m3s = (Q_input_m3h * 0.4) / 3600;       // Christiansen yaklaşımı
  const d_m = d_inner_mm / 1000;
  const hazenC = 140;                                  // damla boruları HDPE
  const majorBar = (10.67 * L_m * Math.pow(Q_eff_m3s, 1.852)) /
                   (Math.pow(hazenC, 1.852) * Math.pow(d_m, 4.87)) / 10.2;
  return round1(majorBar);
}

// Lateral boru iç çap tablosu (mm) — yaygın damla/sprinkler lateral boyutları
function getLateralInnerDiameter(yontem){
  // Damla inline/online: genelde DN16 (iç ~13.6mm) veya DN20 (iç ~16mm)
  // Yağmurlama lateral: DN32-50 arası; mikro-sprinkler DN20-25
  if(yontem==='damla') return 13.6;         // DN16
  if(yontem==='yagmurlama') return 27.4;    // DN32 (sık kullanılan tarla lateral)
  return 0;
}
function secPomp(kW, basmaYukM){
  // İki koşullu seçim: (1) motor gücü yeterli olsun, (2) pompanın o TDH'ye çıkma kapasitesi olsun.
  // basmaYukM undefined ise eski davranış (sadece kW).
  const tdhTable = (typeof STD_POMP_TDH!=='undefined') ? STD_POMP_TDH : null;
  for(const g of STD_POMP){
    if(g < kW) continue;                           // motor gücü yetmiyor
    if(basmaYukM && tdhTable && tdhTable[g]){
      // %10 güvenlik payı — pompa BOP'a yakın çalışsın (eski %15 fazla overshoot yaratıyordu)
      if(tdhTable[g] * 0.90 < basmaYukM) continue;
    }
    return g;
  }
  return 75;
}
function secInv(kW){ return STD_INV.find(g=>g>=kW)||110; }
function getDin(){
  if(S.dmod==='biliyorum') return S.dinamikSu;
  return S.statikSu>0 ? +(S.statikSu*1.3).toFixed(1) : 0;
}

/* –– ANA SENARYO HESAP MOTORU ––––––––––––––––––––––––––––––––––––– */
