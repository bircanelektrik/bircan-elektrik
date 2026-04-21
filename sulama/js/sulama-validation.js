/* sulama-validation.js — Validation ve sonuç render: buildCalculationValidation, renderSuPanel, renderBasincPanel */

/* ─────────────────────────────────────────────────────────────────
   SANITY CHECK KATMANI — Agronomik ve hidrolik anomali tespiti
   "Matematiksel olarak doğru ama pratikte anlamsız" girdileri yakalar.
   Gemini'nin geri bildirimi doğrultusunda: 1m sıra arası, 20 dönüm
   için 500m mesafe gibi değerler sessizce işlenmemeli.

   Her uyarı { tip:'warn'|'krit'|'info', anchor:'...', mesaj:'...' }
   döner. Anchor değerleri:
     'layout'  → üretim düzeni / agronomik uyarılar
     'pipe'    → boru metrajı / uzaklık / sürtünme
     'water'   → günlük su tutarlılığı
     'well'    → kuyu geometrisi
     'zone'    → zon / hat planı
     'general' → bir panele bağlamadık
───────────────────────────────────────────────────────────────── */
function buildLayoutSanityWarnings(){
  const out = [];
  const don = Number(S.araziDonum) || 0;
  const production = S.uretimTipi || '';
  const product = S.urunTip || '';
  const method = S.sulamaYontem || '';

  // ── 1. Sıra arası × üretim tipi mantığı ─────────────────────────
  const rowSpace = Number(S.tipSiraArasi) || 0;
  if(rowSpace > 0){
    if(['meyve','zeytinlik'].includes(production)){
      if(rowSpace < 2){
        out.push({
          tip:'warn', anchor:'layout',
          mesaj:'Meyve/zeytin bahçesi için sıra arası '+rowSpace+' m oldukça dar. Yüksek yoğunluklu (bodur) dikim yapmıyorsanız bu değeri kontrol edin — tipik aralık 4–6 m arasıdır.'
        });
      } else if(rowSpace > 9){
        out.push({
          tip:'info', anchor:'layout',
          mesaj:'Sıra arası '+rowSpace+' m — seyrek bir düzen. Ağaç başına damlatıcı sayısını yeterli seçtiğinizden emin olun.'
        });
      }
    } else if(production==='bag'){
      if(rowSpace < 1.5){
        out.push({
          tip:'warn', anchor:'layout',
          mesaj:'Bağ için sıra arası '+rowSpace+' m alışılmadık ölçüde dar. Tipik değer 2.5–3.5 m aralığıdır.'
        });
      } else if(rowSpace > 5){
        out.push({
          tip:'info', anchor:'layout',
          mesaj:'Bağda '+rowSpace+' m sıra arası geniş — değeri teyit edin.'
        });
      }
    } else if(production==='tarla' && rowSpace > 2){
      out.push({
        tip:'info', anchor:'layout',
        mesaj:'Tarla bitkisi için sıra arası '+rowSpace+' m yüksek — değeri teyit edin.'
      });
    }
  }

  // ── 2. Bitki/ağaç arası mantığı ────────────────────────────────
  const plantSpace = Number(S.tipBitkiArasi) || 0;
  if(plantSpace > 0 && ['meyve','zeytinlik'].includes(production) && plantSpace < 1.5){
    out.push({
      tip:'warn', anchor:'layout',
      mesaj:'Ağaç arası '+plantSpace+' m çok dar. Olgun taçlı ağaçlar için genel aralık 3–6 m olur; değeri kontrol edin.'
    });
  }

  // ── 3. Ağaç yoğunluğu / dönüm başı ağaç sayısı ────────────────
  const toplamAgac = Number(S.tipToplamAgac) || 0;
  if(don > 0 && toplamAgac > 0 && ['meyve','zeytinlik','bag'].includes(production)){
    const perDonum = toplamAgac / don;
    const limitler = {meyve:{min:10,max:120}, zeytinlik:{min:6,max:40}, bag:{min:80,max:400}};
    const L = limitler[production];
    if(L){
      if(perDonum > L.max){
        out.push({
          tip:'warn', anchor:'layout',
          mesaj:'Dönüm başına '+Math.round(perDonum)+' ağaç/omca çok yüksek. '+getProductionTypeName()+' için tipik aralık '+L.min+'–'+L.max+' arasıdır — ağaç sayısını kontrol edin.'
        });
      } else if(perDonum < L.min && don >= 3){
        out.push({
          tip:'info', anchor:'layout',
          mesaj:'Dönüm başına '+Math.round(perDonum)+' ağaç/omca düşük — seyrek dikim gibi görünüyor. Doğruysa not olarak saklayın.'
        });
      }
    }
  }

  // ── 4. Ağaç yoğunluğu — sıra × bitki geometrisinden türetilmiş ─
  if(rowSpace > 0 && plantSpace > 0 && don > 0 && ['meyve','zeytinlik','bag'].includes(production) && !toplamAgac){
    const hektarBasiAgac = 10000 / (rowSpace * plantSpace);
    if(production==='meyve' && hektarBasiAgac > 2500){
      out.push({
        tip:'warn', anchor:'layout',
        mesaj:'Girilen '+rowSpace+' × '+plantSpace+' m düzeni hektar başına '+Math.round(hektarBasiAgac)+' ağaç çıkarıyor — bu bodur/süper yoğun dikim seviyesidir. Standart bahçe için değerleri kontrol edin.'
      });
    } else if(production==='zeytinlik' && hektarBasiAgac > 500){
      out.push({
        tip:'warn', anchor:'layout',
        mesaj:'Zeytinlik için '+Math.round(hektarBasiAgac)+' ağaç/hektar yoğunluğu yüksek — geleneksel aralık çok daha seyrektir.'
      });
    }
  }

  // ── 5. En uzak nokta / arazi oranı ─────────────────────────────
  const uzak = Number(S.uzakNokta) || 0;
  if(uzak > 0 && don > 0){
    // Kare bir arazi varsayımı: 1 dönüm = 1000 m² → kenar ≈ √(1000×don) m
    const approxSide = Math.sqrt(don * 1000);
    const diagonal = approxSide * 1.42;
    if(uzak > diagonal * 1.5){
      out.push({
        tip:'warn', anchor:'pipe',
        mesaj:'Arazinin yaklaşık boyutu '+Math.round(approxSide)+' m iken en uzak nokta '+uzak+' m — arazi boyutuna göre çok yüksek. Hattı ortadan ikiye bölmeyi veya mesafeyi kontrol etmeyi düşünün; sürtünme kaybı azalır.'
      });
    } else if(uzak > approxSide * 2){
      out.push({
        tip:'info', anchor:'pipe',
        mesaj:'En uzak nokta '+uzak+' m — kuyu arazinin kenarında olabilir. Kuyuyu merkeze almak boru metrajını ciddi ölçüde düşürür.'
      });
    }
  }

  // ── 6. Günlük su × arazi tutarlılığı ───────────────────────────
  // Tipik pik dönem: damla 4-6 mm, yagmurlama 6-9 mm, salma 12-18 mm (dönüm başı ton = mm)
  if(don > 0 && Number(S.gunlukSu) > 0){
    const gsd = S.gunlukSu / don; // ton/dönüm/gün ≈ mm/gün net
    const limitler = {
      damla:       {low:1.5, high:12, lowMsg:'çok düşük', highMsg:'çok yüksek'},
      yagmurlama:  {low:2,   high:16, lowMsg:'çok düşük', highMsg:'çok yüksek'},
      salma:       {low:4,   high:30, lowMsg:'çok düşük', highMsg:'çok yüksek'}
    };
    const L = limitler[method];
    if(L){
      if(gsd < L.low){
        out.push({
          tip:'warn', anchor:'water',
          mesaj:'Günlük su '+S.gunlukSu+' ton / '+don+' dönüm = '+gsd.toFixed(1)+' ton/dönüm/gün — '+L.lowMsg+' görünüyor. Verim kaybı riski; değerleri teyit edin.'
        });
      } else if(gsd > L.high){
        out.push({
          tip:'warn', anchor:'water',
          mesaj:'Günlük su '+S.gunlukSu+' ton / '+don+' dönüm = '+gsd.toFixed(1)+' ton/dönüm/gün — '+L.highMsg+' görünüyor. Aşırı sulama kök çürümesine yol açabilir; değerleri teyit edin.'
        });
      }
    }
  }

  // ── 7. Kuyu derinliği × dinamik su — çok sığ kuyu ──────────────
  const derinlik = Number(S.kuyuDerinlik) || 0;
  const ds = (typeof getDin==='function') ? getDin() : 0;
  if(derinlik > 0 && ds > 0){
    const pay = derinlik - ds;
    if(pay < 3){
      out.push({
        tip:'krit', anchor:'well',
        mesaj:'Pompa dalış payı sadece '+pay.toFixed(1)+' m — pompa birkaç dakika içinde hava çekebilir. Kuyu derinleştirme veya debi kısıtlama zorunlu.'
      });
    } else if(pay < 8){
      // Zaten kuyuTabanSinir uyarısı var; burası sessiz geçsin
    }
  }

  // ── 8. Çalışma süresi extrem değerler ──────────────────────────
  const sure = Number(S.calismaSure) || 8;
  if(sure < 3){
    out.push({
      tip:'warn', anchor:'water',
      mesaj:'Çalışma süresi '+sure+' saat çok kısa — debi ve pompa gücü gereksiz yükselir. Süreyi 6–10 saate çıkarmak sistemi ekonomikleştirir.'
    });
  } else if(sure > 16){
    out.push({
      tip:'info', anchor:'water',
      mesaj:'Çalışma süresi '+sure+' saat uzun — solar sistemlerde ışık saati ile uyumsuz olabilir; gün içi net çalışma süresini kontrol edin.'
    });
  }

  // ── 9. Damlatıcı debi × sıra geometrisi uyumu ──────────────────
  const dmDebi = Number(S.tipDamlaticiDebi) || 0;
  if(dmDebi > 0){
    if(production==='meyve' && dmDebi < 2){
      out.push({
        tip:'info', anchor:'layout',
        mesaj:'Meyve bahçesinde damlatıcı debisi '+dmDebi+' L/h düşük — olgun ağaçlar için tipik değer 4–8 L/h olur.'
      });
    } else if(production==='sebze' && dmDebi > 4){
      out.push({
        tip:'info', anchor:'layout',
        mesaj:'Sebze için damlatıcı debisi '+dmDebi+' L/h yüksek — 1.2–2.0 L/h tipiktir.'
      });
    }
  }

  return out;
}

function buildCalculationValidation(){
  const ctx = getFormContext();
  const blockers = [];
  const warnings = [];
  const checks = [];
  let hardWarningCount = 0;
  const add = (list, msg) => { if(msg && list.indexOf(msg)===-1) list.push(msg); };
  const addWarning = (msg, hard=false) => {
    add(warnings, msg);
    if(hard) hardWarningCount++;
  };
  if(!S.kuyuDerinlik) add(blockers,'Kuyu derinligi gerekli.');
  if(!S.gunlukSu) add(blockers,'Gunluk su ihtiyaci gerekli.');
  if(!S.araziDonum) add(blockers,'Arazi buyuklugu (donum) gerekli.');
  if(!S.uretimTipi) add(blockers,'Uretim tipi gerekli.');
  if(S.uretimTipi && !S.urunTip) addWarning('Urun secilmedi. Su tahmini urun bilgisi olmadan zayif kalir.');

  const missingCritical = [];
  if(ctx.isSprinkler){
    if(!hasPositive(S.tipBaslikAralikX || S.spAralikX)) missingCritical.push('Sprinkler araligi X');
    if(!hasPositive(S.tipBaslikAralikY || S.spAralikY)) missingCritical.push('Sprinkler araligi Y');
    if(!hasPositive(S.tipBaslikDebi || S.spDebi)) missingCritical.push('Sprinkler debisi');
  } else if(ctx.isDrip){
    if(ctx.isTree){
      if(!hasPositive(S.tipSiraArasi)) missingCritical.push('Sira arasi');
      if(!hasPositive(S.tipBitkiArasi)) missingCritical.push('Agac / omca araligi');
      if(!hasPositive(S.tipAgacDamlaAdet)) missingCritical.push('Bitki basina damlatici adedi');
      if(!hasPositive(S.tipDamlaticiDebi)) missingCritical.push('Damlatici debisi');
    } else if(S.uretimTipi==='sebze'){
      if(!hasPositive(S.tipSiraArasi || S.dmlSiraArasi)) missingCritical.push('Sira arasi');
      if(!hasPositive(S.tipBitkiArasi)) missingCritical.push('Bitki arasi');
      if(!hasPositive(S.tipDamlaticiAralik || S.dmlDamlAralik)) missingCritical.push('Damlatici araligi');
      if(!hasPositive(S.tipDamlaticiDebi || S.dmlDamlDebi)) missingCritical.push('Damlatici debisi');
    } else if(S.uretimTipi==='tarla'){
      if(!hasPositive(S.tipSiraArasi || S.dmlSiraArasi)) missingCritical.push('Sira arasi');
      if(!hasPositive(S.tipDamlaticiAralik || S.dmlDamlAralik)) missingCritical.push('Damlatici araligi');
      if(!hasPositive(S.tipDamlaticiDebi || S.dmlDamlDebi)) missingCritical.push('Damlatici debisi');
    } else if(S.uretimTipi==='peyzaj'){
      if(!hasPositive(S.tipTarlaEn) || !hasPositive(S.tipTarlaBoy)) missingCritical.push('Alan olculeri');
      if(!hasPositive(S.tipSiraArasi)) missingCritical.push('Hat araligi');
      if(!hasPositive(S.tipDamlaticiAralik || S.dmlDamlAralik)) missingCritical.push('Damlatici araligi');
      if(!hasPositive(S.tipDamlaticiDebi || S.dmlDamlDebi)) missingCritical.push('Damlatici debisi');
    } else if(S.uretimTipi==='ozel'){
      if(!hasPositive(S.tipManualSira) && !hasPositive(S.tipManualLateralM)) missingCritical.push('Manuel hat / lateral bilgisi');
    }
  }
  missingCritical.forEach(label=>addWarning(label+' eksik. Sonuc on kabul seviyesinde kalir.', true));

  [
    {label:'Sprinkler araligi X', primary:S.tipBaslikAralikX, secondary:S.spAralikX, relevant:ctx.isSprinkler},
    {label:'Sprinkler araligi Y', primary:S.tipBaslikAralikY, secondary:S.spAralikY, relevant:ctx.isSprinkler},
    {label:'Sprinkler debisi', primary:S.tipBaslikDebi, secondary:S.spDebi, relevant:ctx.isSprinkler},
    {label:'Sprinkler basinci', primary:S.tipBasinc, secondary:S.spBasinc, relevant:ctx.isSprinkler},
    {label:'Sira arasi', primary:S.tipSiraArasi, secondary:S.dmlSiraArasi, relevant:ctx.isDrip && ctx.isFieldLike},
    {label:'Damlatici araligi', primary:S.tipDamlaticiAralik, secondary:S.dmlDamlAralik, relevant:ctx.isDrip && ctx.isFieldLike},
    {label:'Damlatici debisi', primary:S.tipDamlaticiDebi, secondary:S.dmlDamlDebi, relevant:ctx.isDrip && ctx.isFieldLike}
  ].forEach(item=>{
    if(item.relevant && hasPositive(item.primary) && hasPositive(item.secondary) && Math.abs(item.primary-item.secondary)>0.001){
      addWarning(item.label+' hem uretim kartinda hem hassas ayarda dolu. Uretim kartindaki deger kullanilacak.', true);
    }
  });

  if(ctx.isSprinkler && (
    hasPositive(S.tipDamlaticiDebi) || hasPositive(S.tipDamlaticiAralik) || hasPositive(S.tipAgacDamlaAdet) ||
    hasPositive(S.dmlSiraArasi) || hasPositive(S.dmlDamlAralik) || hasPositive(S.dmlDamlDebi) || hasPositive(S.dmlAgacDamlaAdet)
  )){
    addWarning('Damla alanlarinda dolu veri var; yagmurlama hesabinda bunlar kullanilmayacak.');
  }
  if(ctx.isDrip && (
    hasPositive(S.tipBaslikAralikX) || hasPositive(S.tipBaslikAralikY) || hasPositive(S.tipBaslikDebi) ||
    hasPositive(S.spAralikX) || hasPositive(S.spAralikY) || hasPositive(S.spDebi)
  )){
    addWarning('Sprinkler alanlarinda dolu veri var; damla hesabinda bunlar kullanilmayacak.');
  }
  if(ctx.isTree && (
    hasPositive(S.dmlBitkiArasi) || hasPositive(S.dmlToplamSira) || hasPositive(S.dmlTarlaEn) ||
    hasPositive(S.dmlTarlaBoy) || hasPositive(S.dmlAgacDamlaAdet) || S.dmlLateralTip==='cift'
  )){
    addWarning('Bahce tipi damlada eski gelismis bahce alanlari dolu. Sistem yalnizca uretim kartini kullanacak.');
  }

  const declaredAreaM2 = (S.araziDonum||0) * 1000;
  if(declaredAreaM2>0 && hasPositive(S.tipTarlaEn) && hasPositive(S.tipTarlaBoy)){
    const measuredAreaM2 = S.tipTarlaEn * S.tipTarlaBoy;
    const diff = Math.abs(measuredAreaM2 - declaredAreaM2) / declaredAreaM2;
    if(diff>0.2){
      addWarning('Donum bilgisi ile en-boy carpimi arasinda %'+Math.round(diff*100)+' fark var. Su ihtiyaci donume, yerlesim hesabı en-boy verisine gore yapiliyor.', true);
    }
  }
  if(ctx.isTree && hasPositive(S.tipToplamAgac) && hasPositive(S.tipSiraArasi) && hasPositive(S.tipBitkiArasi) && hasPositive(S.tipTarlaEn) && hasPositive(S.tipTarlaBoy)){
    const derivedTreeCount = estimateFitCount(S.tipTarlaEn, S.tipSiraArasi) * estimateFitCount(S.tipTarlaBoy, S.tipBitkiArasi);
    const diff = Math.abs(derivedTreeCount - S.tipToplamAgac) / Math.max(1, S.tipToplamAgac);
    if(diff>0.15){
      addWarning('Toplam agac sayisi ile sira planindan tureyen sayi uyusmuyor. Manuel agac sayisi kullanilacak.', true);
    }
  }
  if(!blockers.length && S.gunlukSu>0 && S.calismaSure>0 && (ctx.isSprinkler || ctx.isDrip)){
    const zonePreview = getHydraulicZoneDemand(S.gunlukSu / S.calismaSure, S.hatSayisi || 1);
    if(zonePreview && zonePreview.autoAdjusted){
      addWarning('Girilen zon/hat degeri hidrolik olarak yetmiyor. Yerlesim ve pompa debisine gore en az ' + zonePreview.minZones + ' zon gerekli; sistem bunu otomatik revize edecek.', true);
    }
  }

  checks.push(S.uretimTipi ? 'Uretim tipi secildi.' : 'Uretim tipi eksik.');
  checks.push(ctx.isSprinkler ? 'Yontem: yagmurlama. Sprinkler alani aktif.' : ctx.isDrip ? 'Yontem: damla. Damla yerlesimi aktif.' : 'Yontem: salma.');
  checks.push(missingCritical.length ? 'Kritik yerlesim alanlari eksik.' : 'Gerekli yerlesim alanlari mevcut.');
  checks.push(warnings.length ? 'Sessiz cakismanin onune gecildi; uyarilar listelendi.' : 'Cakisan veri gorunmuyor.');

  const level = blockers.length ? 'blocked' : hardWarningCount>0 ? 'provisional' : 'ready';
  const _vres = {
    level,
    blockers,
    warnings,
    checks,
    canAnalyze:blockers.length===0,
    badgeLabel:{ready:'Hesap hazir', provisional:'On kabul', blocked:'Eksik kritik veri'}[level],
    title:{ready:'Hesap dogrulamasi guclu', provisional:'Hesap on kabul seviyesinde', blocked:'Hesap icin kritik eksik var'}[level],
    summary:{ready:'Gorunen alanlar secilen yontemle uyumlu ve ana veri kaynagi net.',
      provisional:'Sonuc uretilebilir; ancak bazi yerlesim alanlari veya cakismlar nedeniyle on kabul etiketi gerekir.',
      blocked:'Sonuc uretmeden once temel eksikler tamamlanmali.'}[level]
  };
  if(typeof dbg!=="undefined") dbg.validation(_vres);
  return _vres;
}
function renderValidationPanel(validation){
  const panel=document.getElementById('calcValidationPanel');
  if(!panel) return;
  const hasContext = !!(S.kuyuDerinlik || S.gunlukSu || S.uretimTipi || S.araziDonum);
  if(!hasContext){
    panel.style.display='none';
    return;
  }
  const v = validation || buildCalculationValidation();
  S._validation = v;
  panel.style.display='block';
  panel.className='validation-panel is-'+v.level;
  const badgeCls = v.level==='ready' ? 'ready' : v.level==='blocked' ? 'blocked' : 'provisional';
  const items = []
    .concat(v.blockers.map(msg=>`<div class="validation-item bad"><strong>Kritik:</strong> ${msg}</div>`))
    .concat(v.warnings.slice(0,5).map(msg=>`<div class="validation-item warn"><strong>Uyari:</strong> ${msg}</div>`))
    .concat(!v.blockers.length && !v.warnings.length ? ['<div class="validation-item ok"><strong>Kontrol:</strong> Sessiz cakisma bulunmadi.</div>'] : []);
  panel.innerHTML = `
    <div class="validation-head">
      <div>
        <div class="validation-title">${v.title}</div>
        <div class="validation-sub">${v.summary}</div>
      </div>
      <span class="validation-badge ${badgeCls}">${v.badgeLabel}</span>
    </div>
    <div class="validation-list">${items.join('')}</div>
    <div class="validation-sub" style="margin-top:10px">Veri onceligi: uretim karti > hassas ayar > varsayimlar</div>`;
}
function validateKuyu(){
  S.kuyuDerinlik=parseFloat(document.getElementById('kuyuDerinlik').value)||0;
  S.statikSu=parseFloat(document.getElementById('statikSu').value)||0;
  S.dinamikSu=parseFloat(document.getElementById('dinamikSu').value)||0;
  const ds=getDin(), kd=S.kuyuDerinlik, ss=S.statikSu;

  // Tüm kuyu input'larındaki uyarı stilini sıfırla
  ['kuyuDerinlik','statikSu','dinamikSu'].forEach(function(id){
    const el = document.getElementById(id);
    const fn = document.getElementById('fn_'+id);
    if(el) el.classList.remove('err');
    if(fn){ fn.className = 'field-note'; fn.style.color=''; fn.textContent=''; }
  });

  const fnDerin = document.getElementById('fn_kuyuDerinlik');
  const fnStatik = document.getElementById('fn_statikSu');
  const fnDinamik = document.getElementById('fn_dinamikSu');
  const elDerin = document.getElementById('kuyuDerinlik');
  const elStatik = document.getElementById('statikSu');
  const elDinamik = document.getElementById('dinamikSu');

  // 1. Statik su >= kuyu derinliği → mantıksız
  if(kd>0 && ss>0 && ss>=kd){
    if(elStatik){ elStatik.classList.add('err'); }
    if(fnStatik){ fnStatik.className='field-note err'; fnStatik.textContent='⚠ Statik su seviyesi ('+ss+' m) kuyu derinliğine ('+kd+' m) eşit veya büyük — geçersiz.'; }
    if(elDerin){ elDerin.classList.add('err'); }
    if(fnDerin){ fnDerin.className='field-note err'; fnDerin.textContent='⚠ Kuyu derinliği statik sudan büyük olmalı.'; }
    return;
  }

  // 2. Dinamik su değerlendirmesi — hem "biliyorum" hem tahmin modunda
  if(ds > 0 && kd > 0){
    const pay = kd - ds;
    const gorunen = Math.round(ds);
    const kaynak = (S.dmod==='biliyorum') ? 'Girilen dinamik su' : 'Tahmini dinamik su (statik × 1.3)';

    // 2a. Dinamik su >= kuyu derinliği → imkansız
    if(ds >= kd){
      if(S.dmod==='biliyorum'){
        if(elDinamik){ elDinamik.classList.add('err'); }
        if(fnDinamik){ fnDinamik.className='field-note err'; fnDinamik.textContent='⚠ Dinamik su ('+gorunen+' m) kuyu derinliğinden ('+kd+' m) büyük olamaz.'; }
      } else {
        if(elStatik){ elStatik.classList.add('err'); }
        if(fnStatik){ fnStatik.className='field-note err'; fnStatik.textContent='⚠ Statik su × 1.3 tahmini = '+gorunen+' m, kuyu derinliğinden ('+kd+' m) büyük. Kuyu derinliğini veya statik suyu kontrol edin.'; }
      }
      if(elDerin){ elDerin.classList.add('err'); }
      if(fnDerin){ fnDerin.className='field-note err'; fnDerin.textContent='⚠ '+kaynak+' bu derinlikte pompa hava çeker — sistem çalışamaz.'; }
      return;
    }

    // 2b. Dinamik su statik sudan küçük (sadece biliyorum modunda)
    if(S.dmod==='biliyorum' && ss>0 && ds<=ss){
      if(elDinamik){ elDinamik.classList.add('err'); }
      if(fnDinamik){ fnDinamik.className='field-note err'; fnDinamik.textContent='⚠ Dinamik su statik sudan büyük olmalı — kontrol edin.'; }
      return;
    }

    // 2c. Pompa dalış payı kontrolleri
    if(pay < 3){
      if(elDerin){ elDerin.classList.add('err'); }
      if(fnDerin){ fnDerin.className='field-note err'; fnDerin.textContent='⚠ KRİTİK: Pompa dalış payı sadece '+pay.toFixed(1)+' m. Pompa birkaç dakikada hava çeker. Kuyu derinleştirme veya debi kısıtlama zorunlu.'; }
      if(fnDinamik){ fnDinamik.className='field-note'; fnDinamik.style.color='var(--re)'; fnDinamik.textContent=kaynak+': '+gorunen+' m — kuyu dibine çok yakın!'; }
    } else if(pay < 8){
      if(fnDerin){ fnDerin.className='field-note'; fnDerin.style.color='var(--or)'; fnDerin.textContent='⚠ Sınırda: Pompa dalış payı '+pay.toFixed(1)+' m — güvenlik payı az, izleme şart.'; }
      if(fnDinamik){ fnDinamik.className='field-note'; fnDinamik.style.color='var(--or)'; fnDinamik.textContent=kaynak+': '+gorunen+' m (pompa önerisi '+Math.round(ds+5)+' m).'; }
    } else {
      if(fnDerin){ fnDerin.className='field-note st-manual'; fnDerin.textContent='✓ Pompa dalış payı '+pay.toFixed(1)+' m — güvenli aralık.'; }
      if(fnDinamik){ fnDinamik.className='field-note st-manual'; fnDinamik.textContent='✓ '+kaynak+': '+gorunen+' m. Pompa önerisi: '+Math.round(ds+5)+' m.'; }
    }
  } else if(S.dmod==='biliyorum' && S.dinamikSu>0 && kd===0){
    if(fnDinamik){ fnDinamik.className='field-note st-auto'; fnDinamik.textContent='Kuyu derinliği girince uyum kontrol edilir.'; }
  }
}
function setDmod(m){
  S.dmod=m;
  document.getElementById('dt_bil').className='dtab'+(m==='biliyorum'?' sel':'');
  document.getElementById('dt_bil2').className='dtab'+(m==='bilinmiyor'?' sel':'');
  document.getElementById('dm_bil').className='dia'+(m==='biliyorum'?' act':'');
  document.getElementById('dm_bil2').className='dia'+(m==='bilinmiyor'?' act':'');
  // Mod değişince uyum kontrolü yeniden yapılsın — tahmin moduna geçerken ds değişir
  if(typeof validateKuyu==='function') validateKuyu();
}

/* ─────────────────────────────────────────────────────────────────
   GÜNLÜK SU İHTİYACI HESAP MOTORU
   Saf fonksiyon — DOM okumaz, DOM yazmaz.
   Çıktı: { damla, yagmurlama, salma, aktif, sezonTon,
            not, guven, hesapTipi, agacBaziMi,
            agacSayisi, litreAgac, etkiliDon }
───────────────────────────────────────────────────────────────── */
/* ─── SU TAHMİN MOTORU ────────────────────────────────────────────
   Referans: kullanıcının çalışan orijinal kodu temel alınmıştır.
   calcDailyWaterNeed: saf fonksiyon, DOM okumaz.
   hesapSu: S state'ini kullanarak calcDailyWaterNeed'i çağırır.
   renderSuPanel: orijinal subox/su3/sui HTML yapısını yazar.
──────────────────────────────────────────────────────────────── */

function calcDailyWaterNeed(urunTip, araziDonum, sulamaYontem, uretimTipi, agacParams){
  // PRODUCT_LIBRARY veya BITKI'den ürün al
  const B = PRODUCT_LIBRARY[urunTip] || BITKI[urunTip] || null;
  const don = parseFloat(araziDonum) || 0;
  const yontem = sulamaYontem || 'damla';
  const tip = uretimTipi || '';

  if(!B || !don) return null;

  const EMNIYET = 1.10;

  // Ağaç bazlı hesap: üretim tipi VEYA ürünün kendi type'ı meyve/bağ/zeytinlik ise
  const bTip = B.type || '';
  const isTree = (tip==='meyve'||tip==='bag'||tip==='zeytinlik') ||
                 (bTip==='meyve'||bTip==='bag'||bTip==='zeytinlik');
  if(isTree){
    const AGAC_OPT = {
      elma:100, armut:90, kiraz:75, seftali:95, kayisi:85,
      nar:75, ceviz:125, incir:65,
      uzum:45, bagDiger:45,
      zeytin:60, zeytinDiger:55, meyveDiger:90
    };
    const litreOpt = AGAC_OPT[urunTip] || 90;
    const ag = agacParams || {};
    let agacSayisi = parseFloat(ag.tipToplamAgac) || 0;
    let guven = 'on-kabul';

    if(!agacSayisi && parseFloat(ag.tipSiraArasi)>0 && parseFloat(ag.tipBitkiArasi)>0){
      const en  = parseFloat(ag.tipTarlaEn)  || Math.sqrt(don*1000)*1.3;
      const boy = parseFloat(ag.tipTarlaBoy) || Math.sqrt(don*1000)*0.77;
      agacSayisi = estimateFitCount(en, parseFloat(ag.tipSiraArasi)) *
                   estimateFitCount(boy, parseFloat(ag.tipBitkiArasi));
      guven = 'iyi';
    }
    if(!agacSayisi){
      const perDonum = tip==='zeytinlik' ? 18 : tip==='bag' ? 30 : 50;
      agacSayisi = Math.round(don * perDonum);
    }
    if(parseFloat(ag.tipToplamAgac)>0){
      agacSayisi = parseFloat(ag.tipToplamAgac);
      guven = 'gercek';
    }

    const gunlukTon = (agacSayisi * litreOpt * EMNIYET) / 1000;
    const damla      = round1(gunlukTon);
    const yagmurlama = round1(gunlukTon * 1.20);           // +%20 buharlaşma + rüzgar
    // Salma: akademik standart randıman %50 → +%100 israf payı
    const salma      = round1(gunlukTon * 2.00);
    const aktif = yontem==='damla' ? damla : yontem==='yagmurlama' ? yagmurlama : salma;

    return {
      bitki: B,
      damla, yagmurlama, salma, aktif,
      sezonlukToplam: Math.round(gunlukTon * (B.sezon||4) * 30),
      agacBazi: true, agacSayisi: Math.round(agacSayisi), litreAgac: litreOpt,
      guven,
      not: B.ad + ' · ' + Math.round(agacSayisi) + ' ağaç · ' + litreOpt + ' L/ağaç/gün'
    };
  }

  // Dönüm bazlı hesap (tarla / sebze / peyzaj / ozel)
  // pikMM × dönüm = net ton/gün (1 mm × 1000 m² = 1 ton)
  const alanKatsayi = (tip==='tarla') ? clamp((parseFloat((agacParams||{}).tipEkiliOran)||100)/100, 0.1, 1) : 1;
  const etkiliDon   = round1(don * alanKatsayi);
  const netTonGun   = B.pikMM * etkiliDon;  // ton/gün net

  const damla      = Math.round(netTonGun / VERIM.damla      * EMNIYET);
  const yagmurlama = Math.round(netTonGun / VERIM.yagmurlama * EMNIYET);
  const salma      = Math.round(netTonGun / VERIM.salma      * EMNIYET);
  const aktif = yontem==='damla' ? damla : yontem==='yagmurlama' ? yagmurlama : salma;

  return {
    bitki: B,
    damla, yagmurlama, salma, aktif,
    sezonlukToplam: Math.round(B.sezon * 30 * netTonGun),
    agacBazi: false, guven: 'iyi',
    not: B.ad + ' · ' + don + ' dönüm' +
         (alanKatsayi<1 ? ' · etkili ' + etkiliDon + ' dönüm' : '')
  };
}

/* hesapSu — S state'ini calcDailyWaterNeed'e bağlar */
function hesapSu(){
  return calcDailyWaterNeed(
    S.urunTip,
    S.araziDonum,
    S.sulamaYontem,
    S.uretimTipi,
    {
      tipToplamAgac: S.tipToplamAgac,
      tipSiraArasi:  S.tipSiraArasi,
      tipBitkiArasi: S.tipBitkiArasi,
      tipTarlaEn:    S.tipTarlaEn,
      tipTarlaBoy:   S.tipTarlaBoy,
      tipEkiliOran:  S.tipEkiliOran
    }
  );
}

/* renderSuPanel — orijinal subox HTML yapısını kullanır */
function renderSuPanel(){
  const panel = document.getElementById('suPanel');
  const grid  = document.getElementById('su3grid');
  const note  = document.getElementById('suNot');
  const btn   = document.getElementById('suApplyBtn');
  if(!panel) return;

  const su = hesapSu();

  if(!su){
    panel.style.display = 'block';
    // Eksik veri — hangi alan eksik olduğunu göster
    const msg = !S.araziDonum ? 'Arazi büyüklüğü girilince tahmin hesaplanır.' :
                !S.urunTip    ? 'Ürün seçilince tahmin hesaplanır.'            :
                'Ürün ve arazi bilgisi gerekli.';
    panel.innerHTML =
      '<div class="subox"><div class="subox-head">' +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-5-6-11-6-11z"/></svg>' +
      ' Otomatik Su Tahmini</div>' +
      '<div style="font-size:10px;color:var(--tx3);padding:4px 0">' + msg + '</div></div>';
    return;
  }

  panel.style.display = 'block';
  panel.style.opacity = S.gunlukSuState==='manual' ? '0.55' : '1';

  // Güven etiketi
  const guvenRenk   = su.guven==='gercek' ? 'var(--gr)' : su.guven==='iyi' ? 'var(--cy)' : 'var(--or)';
  const guvenEtiket = su.guven==='gercek' ? 'Gerçek hesap' : su.guven==='iyi' ? 'İyi tahmin' : 'Ön kabul';
  const Y = S.sulamaYontem || 'yagmurlama';

  // Kullanıcı giriş uyarısı
  let uyariHtml = '';
  if(S.gunlukSu > 0 && su.aktif > 0){
    const oran = S.gunlukSu / su.aktif;
    if(oran < 0.6)
      uyariHtml = '<div style="margin-top:6px;font-size:10px;color:var(--or)">⚠ Girilen değer tahminden düşük — verim kaybı riski.</div>';
    else if(oran > 1.6)
      uyariHtml = '<div style="margin-top:6px;font-size:10px;color:var(--or)">⚠ Girilen değer tahminden yüksek — kök çürümesi riski.</div>';
  }

  const agacSatir = su.agacBazi
    ? '<span style="color:var(--pu-l)">' + su.agacSayisi + ' ağaç · ' + su.litreAgac + ' L/ağaç/gün</span> · '
    : '';

  // HTML'deki mevcut subox yapısını güncelle (innerHTML replace)
  panel.innerHTML =
    '<div class="subox">' +
    '<div class="subox-head">' +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-5-6-11-6-11z"/></svg>' +
      ' Otomatik Su Tahmini — Pik Dönem' +
      '<span style="margin-left:auto;font-size:9px;color:' + guvenRenk + ';border:1px solid ' + guvenRenk +
        ';border-radius:10px;padding:1px 7px;font-weight:400;text-transform:none">' + guvenEtiket + '</span>' +
    '</div>' +
    '<div class="su3" id="su3grid">' +
      ['damla','yagmurlama','salma'].map(function(y){
        var label = y==='damla'?'Damla':y==='yagmurlama'?'Yağmurlama':'Salma';
        var verim = y==='damla'?'%92':y==='yagmurlama'?'%77':'%55';
        var val   = y==='damla'?su.damla:y==='yagmurlama'?su.yagmurlama:su.salma;
        var isCur = y===Y;
        return '<div class="sui' + (isCur?' cur':'') + '">' +
          '<div class="sul">' + label + '</div>' +
          '<div class="suv' + (isCur?' cur':'') + '">' + val + ' T/g</div>' +
          '<div style="font-size:9px;color:' + (isCur?'var(--gold)':'var(--tx3)') + '">verim ' + verim + '</div>' +
          '</div>';
      }).join('') +
    '</div>' +
    '<div id="suNot" style="font-size:10px;color:var(--tx3);line-height:1.5;margin-bottom:8px">' +
      agacSatir +
      '<b style="color:var(--cy)">' + su.bitki.ad + '</b> — ' +
      S.araziDonum + ' dönüm | Seçili yöntem için ' +
      '<b style="color:var(--gold)">' + su.aktif + ' ton/gün</b> | ' +
      'Sezonluk ~<b>' + su.sezonlukToplam + ' ton</b><br>' +
      '<em>' + (su.bitki.not||'') + '</em>' +
    '</div>' +
    uyariHtml +
    '<button class="apply-btn" id="suApplyBtn" onclick="suUygula()">' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<polyline points="20 6 9 17 4 12"/></svg>' +
      ' ' + (Y==='damla'?'Damla':Y==='yagmurlama'?'Yağmurlama':'Salma') +
      ' için ' + su.aktif + ' ton/gün uygula' +
    '</button>' +
    (S.gunlukSuState==='applied'||S.gunlukSuState==='manual'
      ? ' <button onclick="suSifirla()" style="background:transparent;border:1px solid var(--bdr);' +
        'color:var(--tx3);border-radius:6px;padding:5px 10px;font-size:10px;cursor:pointer;' +
        'font-family:inherit;margin-left:6px">Sıfırla</button>'
      : '') +
    '</div>';
}

function suUygula(){
  var su = hesapSu(); if(!su) return;
  document.getElementById('gunlukSu').value = su.aktif;
  S.gunlukSu = su.aktif; S.gunlukSuState = 'applied';
  setFieldState('gunlukSu','applied','✓ Tahmin uygulandı (' + su.aktif + ' ton/gün).');
  renderSuPanel(); renderBasincPanel();
}

function suSifirla(){
  document.getElementById('gunlukSu').value = '';
  S.gunlukSu = 0; S.gunlukSuState = 'empty';
  setFieldState('gunlukSu','','');
  renderSuPanel(); renderBasincPanel();
}


/* Eski netGunlukM3 uyumluluk */
function netGunlukM3(){
  const su = hesapSu();
  return su ? su.aktif : 0;
}

/* "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•
   UI RENDER KATMANI – Çiftçi odaklı görünüm
   "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"• */

/* –– BASINÇ PANELİ – 3 PARÇA DAĞILIM (yeni tasarım) ––––––––––––––– */
function renderBasincPanel(){
  const mesafe = S.uzakNokta||0;
  const kotF   = S.egimDurum==='egimli'?(S.kotFarki||0):0;
  const isFinal = mesafe>0;
  const mKullan = mesafe>0?mesafe:150;
  const BP  = YB[S.sulamaYontem];
  const gs  = S.gunlukSu||0, sure = S.calismaSure||8;

  // Günlük su yoksa panel boş göster
  const Q_m3s = gs>0 ? gs/sure/3600 : 0.0005;   // min debi tahmini
  const boru  = secBoruCap(Q_m3s);
  const kayip = hatKayipHW(Q_m3s, boru.d_m, mKullan);
  const kotBar = kotF*0.0981;
  const pompaDer = getDin() + 5;
  const pompaDerBar = pompaDer / 10.2;

  // Ekipman basıncı: manuel girildi mi kontrol et
  const ekipmanBar = S.basincState==='manual' && S.basinc>0 ? S.basinc : getEquipmentPressureDefault();
  const yuzeyBar = +(ekipmanBar + kayip + kotBar).toFixed(2);
  const toplam = yuzeyBar;
  const toplamManometrikM = round1(pompaDer + (yuzeyBar * 10.2));
  const toplamManometrikBar = round1(toplamManometrikM / 10.2);
  const ventil = yuzeyBar > BP.guvenliMax;

  S._basincHesap = { ekipmanBar, kayip:+kayip.toFixed(2), kotBar:+kotBar.toFixed(2),
    yuzeyBar, toplam:yuzeyBar, pompaDer, pompaDerBar:+pompaDerBar.toFixed(2), toplamManometrikM, toplamManometrikBar,
    mesafe:mKullan, kotFarki:kotF, boru, ventilGerekli:ventil, guvenliMax:BP.guvenliMax };

  // Başlık + stage
  const stageEl=document.getElementById('bStage');
  if(stageEl){
    stageEl.className='bpanel-stage '+(isFinal?'final':'pre');
    stageEl.textContent=isFinal?'Nihai Hesap':'Ön Tahmin';
  }
  const modEl=document.getElementById('bPanelMod');
  if(modEl) modEl.textContent = S.basincState==='manual'
    ? 'Elle Girilen Basınç Kullanılıyor'
    : 'Pompanın Üretmesi Gereken Basınç';

  // Varsayım notu
  if(modEl){
    modEl.textContent = S.basincState==='manual'
      ? 'Elle Girilen Basinc Kullaniliyor'
      : 'Yuzey Basinc Ihtiyaci + Toplam Manometrik Yuk';
  }
  const assEl=document.getElementById('bAssumNote');
  if(assEl) assEl.innerHTML=(!mesafe
    ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg><span>En uzak nokta girilmediği için <b style="color:var(--or)">150 m</b> kabul edildi. Gerçek mesafe yazılırsa sonuç daha net olur.</span>'
    : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span style="color:var(--gr)">Mesafe girildi. Hesap gerçek saha verisine yaklaştı.</span>');

  // –– YENİ: 3-parça dağılım tablosu –––––––––––––––––––––––––––––––
  const ekIhtiyac = kayip + kotBar;
  const rows = [
    { cls:'', label:'Sulama ekipmanının ihtiyacı', sub:YB[S.sulamaYontem].ad+' sistemi çalışma basıncı', val:ekipmanBar.toFixed(2)+' bar' },
    { cls:'add', label:'Arazi ve boru nedeniyle ek ihtiyaç', sub:kotF>0 ? (mKullan+' m hat + '+kotF+' m kot farkı') : (mKullan+' m hat yükü'), val:'+ '+ekIhtiyac.toFixed(2)+' bar' }
  ];
  rows.push({ cls:'total', label:'Pompanın üretmesi gereken toplam', sub:'Pompa çıkışında bu basınç olmalı', val:toplam.toFixed(2)+' bar' });

  rows.length = 0;
  rows.push(
    { cls:'', label:'Sulama ekipmaninin ihtiyaci', sub:YB[S.sulamaYontem].ad+' sistemi calisma basinci', val:ekipmanBar.toFixed(2)+' bar' },
    { cls:'add', label:'Arazi ve boru nedeniyle ek ihtiyac', sub:kotF>0 ? (mKullan+' m hat + '+kotF+' m kot farki') : (mKullan+' m hat yuku'), val:'+ '+ekIhtiyac.toFixed(2)+' bar' },
    { cls:'total', label:'Yuzey basinc ihtiyaci', sub:'Kuyudan ciktiktan sonra arazide gerekli basinc', val:yuzeyBar.toFixed(2)+' bar' },
    { cls:'add', label:'Kuyu kaldirma yuksekligi', sub:'Dinamik su ' + Math.round(getDin()) + ' m + 5 m guvenlik', val:'+ '+pompaDerBar.toFixed(2)+' bar' },
    { cls:'total', label:'Toplam manometrik ihtiyac', sub:'Yaklasik ' + toplamManometrikM + ' mSS', val:toplamManometrikBar.toFixed(2)+' bar' }
  );
  const tblEl = document.getElementById('pressTable');
  if(tblEl) tblEl.innerHTML = rows.map(r=>`
    <div class="press-row ${r.cls}">
      <div class="press-label">
        <div>${r.label}<span class="press-sub">${r.sub}</span></div>
      </div>
      <div class="press-val">${r.val}</div>
    </div>`).join('');

  // –– YENİ: Çiftçi dilinde basınç yorumu –––––––––––––––––––––––––
  const pcEl = document.getElementById('pressComment');
  let pcCls='ok', pcIcon='✓', pcMsg='Basınç güvenli aralıkta – sistem rahat çalışır.';
  if(toplam > BP.guvenliMax * 1.2){
    pcCls='bad'; pcIcon='✗'; pcMsg='Basınç çok yüksek – sulama ekipmanları zarar görebilir. Önerilen çözüm: sistem 2 parçaya bölünsün veya basınç düşürücü regülatör takılsın.';
  } else if(toplam > BP.guvenliMax){
    pcCls='bad'; pcIcon='⚠ '; pcMsg='Basınç yüksek – basınç düşürücü regülatör (PRV) gerekir. Alternatif: 2 paralel kuyu sistemi.';
  } else if(toplam > BP.max){
    pcCls='warn'; pcIcon='⚠ '; pcMsg='Basınç sınırda. Sistem çalışır ama 2 parçaya bölünürse daha rahat çalışır ve ekipman ömrü uzar.';
  } else if(toplam < BP.min){
    pcCls='warn'; pcIcon='⚠ '; pcMsg='Basınç düşük – sulama başlıkları yeterli verim vermeyebilir. Pompa seçimi veya hat düzeni gözden geçirilmeli.';
  }
  if(yuzeyBar > BP.guvenliMax * 1.2){
    pcCls='bad'; pcIcon='x'; pcMsg='Yuzey basinc ihtiyaci cok yuksek - sulama ekipmanlari zarar gorebilir. Sistem bolunmeli veya basinc dusurucu eklenmeli.';
  } else if(yuzeyBar > BP.guvenliMax){
    pcCls='bad'; pcIcon='!'; pcMsg='Yuzey basinc ihtiyaci yuksek - basinc dusurucu (PRV) veya zonlama gerekir.';
  } else if(yuzeyBar > BP.max){
    pcCls='warn'; pcIcon='!'; pcMsg='Yuzey basinc ihtiyaci sinirda. Zonlama veya daha rahat bir hat duzeni omru uzatir.';
  } else if(yuzeyBar < BP.min){
    pcCls='warn'; pcIcon='!'; pcMsg='Yuzey basinc ihtiyaci dusuk - sulama basliklari yeterli verim vermeyebilir.';
  }
  if(pcEl) pcEl.innerHTML = `<div class="press-comment ${pcCls}"><span class="pc-icon">${pcIcon}</span><span>${pcMsg}</span></div>`;

  // Ventil uyarı (ekstra vurgu)
  const bvEl=document.getElementById('bVentilWarn');
  if(bvEl){
    bvEl.innerHTML = ventil
      ? `<div class="box err" style="margin-bottom:10px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg><span>Hat basıncı (${toplam} bar) bu sulama yönteminin güvenli limitinin (${BP.guvenliMax} bar) üstünde. Çözüm gerekli – sistem analizinde detay görülecek.</span></div>`
      : '';
    if(ventil){
      bvEl.innerHTML = `<div class="box err" style="margin-bottom:10px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg><span>Yuzey basinc ihtiyaci (${yuzeyBar} bar) bu sulama yonteminin guvenli limitinin (${BP.guvenliMax} bar) ustunde. Toplam manometrik ihtiyac yaklasik ${toplamManometrikBar} bar (${toplamManometrikM} mSS).</span></div>`;
    }
  }

  // Manuel mod: panel pasif
  const panelEl=document.getElementById('bpanel');
  if(panelEl){
    if(S.basincState==='manual'){ panelEl.style.opacity='0.45'; }
    else { panelEl.style.opacity='1'; }
  }
  const anEl=document.getElementById('bActiveNote');
  if(anEl){
    anEl.style.color = S.basincState==='manual' ? 'var(--tx3)' : 'var(--gr)';
    anEl.textContent = S.basincState==='manual'
      ? 'Elle girilen değer kullanılıyor. Otomatik hesap şu an pasif.'
      : '✓ Bu değer otomatik olarak kullanılıyor. İsterseniz üstteki alandan kendi değerinizi girebilirsiniz.';
  }
}
function basincUygula(){
  const b=S._basincHesap; if(!b) return;
  document.getElementById('basinc').value=b.toplam.toFixed(2);
  S.basinc=b.toplam; S.basincState='applied';
  setFieldState('basinc','applied','✓ '+b.toplam.toFixed(2)+' bar uygulandı.');
  renderBasincPanel();
}

/* "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•
   SONUÇ SAYFASI – 6 BLOK (hero / trafik / 3 seçenek / detay / mühendis / fiyat)
   "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"• */
function renderSonucLegacy(senaryolar, uyarilar, su, ds){
  const adSoyad = document.getElementById('adSoyad').value || '';
  const tarih   = new Date().toLocaleDateString('tr-TR');
  const isSolar = S.sistemTercih !== 'sebeke';
  const costConf = calcCostConfidence();   // "†’ 'low'

  // Filtrelenmiş seçenekler (mantıksız olanı gizle)
  const gösterilecek = mantikliSenaryolar(senaryolar);

  // Önerilen = en yüksek skor (tüm senaryolar içinden)
  const onerilen = senaryolar.find(s=>s.onerilen) || senaryolar[0];

  // Daha ekonomik: En az toplam kW (pompa × kuyu) "†’ düşük ilk yatırım
  const enEkonomik = gösterilecek.slice().sort((a,b)=>
    (a.secPompGuc*a.nKuyu) - (b.secPompGuc*b.nKuyu) || a.nKuyu - b.nKuyu
  )[0];

  // Daha güvenli: En çok kuyu + skor
  const enGuvenli = gösterilecek.slice().sort((a,b)=>
    (b.nKuyu*10 + b.skor) - (a.nKuyu*10 + a.skor)
  )[0];

  const tl = getTrafficLight(önerilen);
  const zon = hesapZon(önerilen);

  /* –– BLOK 1 – HERO ––––––––––––––––––––––––––––––––––––––––––––––– */
  const heroHtml = `
    <div class="hero-block">
      <div class="hero-badge">✓ Sana Önerilen Sistem</div>
      <div class="hero-lead">Bu arazi için en dengeli çözüm:</div>
      <div class="hero-title">${önerilen.label}</div>
      <div class="hero-why">${farmerWhy(önerilen)}</div>
      <div class="hero-benefit">Fayda: ${farmerBenefit(önerilen)}</div>
    </div>`;

  /* –– BLOK 2 – TRAFİK IŞIĞI ––––––––––––––––––––––––––––––––––––––– */
  const tlHtml = `
    <div class="tl-block ${tl.cls}">
      <div class="tl-icon">${tl.icon}</div>
      <div class="tl-content">
        <div class="tl-status">${tl.status}</div>
        <div class="tl-desc">${tl.desc}</div>
      </div>
    </div>`;

  /* –– UYARILAR (kritik + warn olanları göster) ––––––––––––––––––– */
  const ikon = {krit:'✗', warn:'⚠ ', info:'ℹ', ok:'✓'};
  const uyariHtml = uyarilar.length ? `
    <div class="warn-list">
      ${uyarilar.map(u=>`<div class="warn-item ${u.tip}"><span class="wi-ico">${ikon[u.tip]||'–'}</span><span>${u.mesaj}</span></div>`).join('')}
    </div>` : '';

  /* –– BLOK 3 – 3 SEÇENEK –––––––––––––––––––––––––––––––––––––––––– */
  function optKart(s, rol){
    const isRec = s === onerilen;
    const isEco = s === enEkonomik && rol==='eco';
    const isSafe = s === enGuvenli && rol==='safe';
    const t = getTrafficLight(s);

    let badgeCls='rec', badgeText='"… Önerilen';
    if(rol==='eco'){ badgeCls='eco'; badgeText='"¬ Daha Ekonomik'; }
    if(rol==='safe'){ badgeCls='safe'; badgeText='🛡 Daha Güvenli'; }
    if(rol!=='rec' && isRec){ badgeCls='same'; badgeText='= Aynı zamanda önerilen'; }

    const kuyuText = s.nKuyu===1 ? '1 kuyu · tek pompa' : s.nKuyu+' kuyu · paralel';
    const sureText = s.sSure+' saat/gün';

    let yorum = '';
    if(rol==='rec')  yorum = 'En dengeli seçim – hem güvenli hem makul.';
    if(rol==='eco')  yorum = s.nKuyu===1 ? 'Tek sistem – en düşük ilk yatırım, ancak tek noktaya bağımlı.' : 'Görece düşük ekipman maliyeti.';
    if(rol==='safe') yorum = s.nKuyu>1 ? 'Paralel kuyu – bir pompa arızalansa sulama durmaz.' : 'Zonlu/depolu yaklaşım ile sistem rahatlar.';

    return `
      <div class="opt-card ${isRec?'is-rec':''}">
        <span class="opt-badge ${badgeCls}">${badgeText}</span>
        <div class="opt-title">${s.label}</div>
        <div class="opt-row"><span class="orl">Pompa</span><span class="orv">${s.secPompGuc} kW${s.nKuyu>1?' × '+s.nKuyu:''}</span></div>
        <div class="opt-row"><span class="orl">Kuyu</span><span class="orv">${kuyuText}</span></div>
        <div class="opt-row"><span class="orl">Çalışma</span><span class="orv">${sureText}</span></div>
        ${isSolar?`<div class="opt-row"><span class="orl">Solar</span><span class="orv">${s.totKwp} kWp</span></div>`:''}
        <div class="opt-status ${t.cls}">${t.icon} ${t.status}</div>
        <div class="opt-comment">${yorum}</div>
      </div>`;
  }

  const optsHtml = `
    <div class="opts-wrap">
      <div class="opts-head">3 Seçenek</div>
      <div class="opts-sub">Önerilen · Daha ekonomik · Daha güvenli</div>
      <div class="opts-grid">
        ${optKart(önerilen, 'rec')}
        ${optKart(enEkonomik, 'eco')}
        ${optKart(enGuvenli, 'safe')}
      </div>
    </div>`;

  /* –– BLOK 4 – TEKNİK DETAYLARI GÖR (akordeon) ––––––––––––––––––– */
  const b = S._basincHesap || {};
  const pompaDerOn = onerilen.pompaDer;
  const detayIcerik = `
    <h4>Basınç Dağılımı (Önerilen Sistem)</h4>
    <div class="press-table" style="margin:0 0 8px 0;background:#040210">
      <div class="press-row"><div class="press-label"><div>Sulama ekipmanı ihtiyacı<span class="press-sub">${YB[S.sulamaYontem].ad} çalışma basıncı</span></div></div><div class="press-val">${önerilen.sistBasinc.toFixed(2)} bar</div></div>
      <div class="press-row add"><div class="press-label"><div>Boru hattı kayıpları<span class="press-sub">${S.uzakNokta||150} m hat</span></div></div><div class="press-val">+ ${önerilen.kayip.toFixed(2)} bar</div></div>
      ${önerilen.kotBar>0?`<div class="press-row add"><div class="press-label"><div>Arazi yükseklik farkı<span class="press-sub">${S.kotFarki} m kot</span></div></div><div class="press-val">+ ${önerilen.kotBar.toFixed(2)} bar</div></div>`:''}
      <div class="press-row total"><div class="press-label"><div>Pompa çıkış basıncı</div></div><div class="press-val">${önerilen.hatBasiBar.toFixed(2)} bar</div></div>
    </div>
    <p style="font-style:italic;color:${önerilen.basincDurum==='ok'?'var(--gr)':önerilen.basincDurum==='kritik'?'var(--re)':'var(--or)'}">${önerilen.basincYorumFarmer}</p>

    <h4>Debi Durumu</h4>
    ${önerilen.debiDurum==='unknown'
      ? '<p>Kuyu debisi girilmedi. Sondaj raporu paylaşılırsa sistem yeterlilik kontrolü yapar.</p>'
      : `<p><b style="color:${önerilen.debiDurum==='ok'?'var(--gr)':önerilen.debiDurum==='border'?'var(--or)':'var(--re)'}">${önerilen.debiDurum==='ok'?'✓ Uygun':önerilen.debiDurum==='border'?'⚠  Sınırda':'✓— Yetersiz'}</b> – ${önerilen.debiMesaj}</p>
         ${önerilen.debiOneriler.length?`<p><b style="color:var(--gold-l)">Çözüm önerileri:</b> ${önerilen.debiOneriler.join(' · ')}</p>`:''}`}

    <h4>Zon / Hat Önerisi</h4>
    <p>${zon.yorum}${zon.tip==='tahmini'?' <span style="color:var(--or);font-weight:700">(ön öneri – detaylı proje gerektirir)</span>':' <span style="color:var(--gr);font-weight:700">(gerçek hesap)</span>'}</p>

    <h4>Alternatif Sistemler Özeti</h4>
    <p>Arka planda ${senaryolar.length} senaryo test edildi, bunlardan ${gösterilecek.length} tanesi anlamlı çıktı:</p>
    <ul style="font-size:12px;color:var(--tx2);padding-left:18px;line-height:1.7">
      ${gösterilecek.map(s=>{
        const t=getTrafficLight(s);
        return `<li>${t.icon} <b style="color:${s===önerilen?'var(--gold-l)':'var(--tx)'}">${s.label}</b> – ${s.secPompGuc} kW${s.nKuyu>1?' × '+s.nKuyu:''} · ${s.sSure}s/gün · ${t.status}</li>`;
      }).join('')}
    </ul>

    <h4>Pompa Derinliği & Boru</h4>
    <p>Pompa dalış derinliği: <b>${pompaDerOn} m</b> (dinamik su ${Math.round(ds)} m + 5 m güvenlik)<br>
    Ana hat boru çapı: <b>DN${önerilen.boru.d_mm}</b> · Tipi: ${S.boruTip.toUpperCase()}</p>
  `;

  /* –– BLOK 5 – MÜHENDİS DETAYI (akordeon) ––––––––––––––––––––––– */
  const muhIcerik = `
    <h4>Tüm Senaryoların Karşılaştırması</h4>
    <div style="overflow-x:auto">
      <table class="cmp-tbl">
        <thead><tr>
          <th>Senaryo</th><th>Kuyu</th><th>Pompa</th><th>Top kW</th><th>Basınç</th><th>Debi</th><th>Skor</th>
        </tr></thead>
        <tbody>
          ${senaryolar.map(s=>{
            const t=getTrafficLight(s);
            return `<tr class="${s===önerilen?'is-rec':''}">
              <td>${s.label}${s===önerilen?' "…':''}</td>
              <td style="text-align:center">${s.nKuyu}</td>
              <td style="text-align:center">${s.secPompGuc}kW</td>
              <td style="text-align:center;color:var(--gold-l)">${s.toplamKW}</td>
              <td style="text-align:center;color:${s.ventilGer?'var(--re)':'var(--gr)'}">${s.hatBasiBar.toFixed(2)}${s.ventilGer?' ⚠ ':''}</td>
              <td style="text-align:center;color:${s.debiDurum==='ok'?'var(--gr)':s.debiDurum==='border'?'var(--or)':s.debiDurum==='bad'?'var(--re)':'var(--tx3)'}">${s.debiDurum==='ok'?'✓':s.debiDurum==='border'?'⚠ ':s.debiDurum==='bad'?'✗':'–'}</td>
              <td style="text-align:center">${t.icon} ${s.skor}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <h4>Hesap Prensipleri</h4>
    <p>"¢ <b>Hat kaybı:</b> Hazen-Williams formülü (C=140, HDPE)<br>
    "¢ <b>Pompa verimi:</b> η = 0.65 (submersible ortalama)<br>
    "¢ <b>Emniyet payı:</b> ×1.25 (hız önceliğinde ×1.25 ek)<br>
    "¢ <b>Panel gücü:</b> ${önerilen.pW}W (${S.oncelik} önceliğine göre)<br>
    "¢ <b>PSH (Güneş):</b> ${GP[S.ilSecim]} kWh/m²/gün (${S.ilSecim})</p>

    <h4>Skor Formülü (Çok Kriterli)</h4>
    <p>Taban: 50 puan. Eklenen: +basınç uygunluğu, +debi uygunluğu, +çoklu kuyu & kuruma riski, +öncelik bonusları.<br>
    Düşen: –basınç aşımı, –debi yetersizliği, –interferans, –kuyu dibi yakın, –tek nokta bağımlılığı.</p>

    <h4>Göreli Maliyet Karşılaştırması</h4>
    <p style="color:var(--or);font-weight:600">Fiyat güven skoru: düşük "†’ Spesifik TL gösterilmiyor.</p>
    <p>Göreceli sıralama (en düşük ilk yatırım "†’ en yüksek):<br>
    ${gösterilecek.slice().sort((a,b)=>(a.secPompGuc*a.nKuyu)-(b.secPompGuc*b.nKuyu)).map((s,i)=>`<b style="color:var(--tx)">${i+1}.</b> ${s.label} (${s.toplamKW} kW toplam)`).join('<br>')}
    </p>
    <p style="font-size:11px;color:var(--tx3);font-style:italic">Kesin rakam için: malzeme seçimi + saha keşfi + güncel piyasa fiyatları gerekir.</p>

    <h4>İnterferans Analizi</h4>
    <p>Kuyular arası: <b>${S.kuyuMesafe} m</b> "†’ ${önerilen.interferans==='kritik'?'<span style="color:var(--re)">Kritik (&lt;100m)</span>':önerilen.interferans==='orta'?'<span style="color:var(--or)">Orta (100–150m)</span>':'<span style="color:var(--gr)">Güvenli (&ge;150m)</span>'}</p>
  `;

  /* –– BLOK 6 – FİYAT BLOĞU (her zaman "keşif gerekir") ––––––––––– */
  const fiyatHtml = `
    <div class="price-block">
      <div class="price-icon">📋</div>
      <div>
        <div class="price-title">Fiyat / Teklif Bilgisi</div>
        <div class="price-body">
          <b>Kesin fiyat için saha keşfi gerekir.</b>
          Bu aşamada sadece teknik uygunluk ve çözüm önerisi verilebilir.
          Keşif sonrası malzeme listesi + işçilik + sondaj/izin bedelleri çıkarılarak
          net teklif hazırlanır.
        </div>
      </div>
    </div>`;

  /* –– WhatsApp mesajı (fiyat yok) –––––––––––––––––––––––––––––––– */
  const waParts = [
    'Merhaba Bircan Elektrik,', '',
    'Sulama Analiz Talebi:',
    'Musteri: ' + (adSoyad || 'Belirtilmedi'),
    'Arazi: ' + S.araziDonum + ' donum · ' + (S.sulamaYontem),
    'Kuyu: ' + S.kuyuDerinlik + 'm derinlik · dinamik ' + Math.round(ds) + 'm',
    'Gunluk su: ' + S.gunlukSu + ' ton',
    '',
    'Onerilen sistem: ' + önerilen.label,
    'Pompa: ' + önerilen.secPompGuc + 'kW x ' + önerilen.nKuyu,
    'Pompa cikis basinci: ' + önerilen.hatBasiBar.toFixed(2) + ' bar',
    (isSolar ? 'Solar: ' + önerilen.totKwp + ' kWp' : 'Enerji: sebeke'),
    'Durum: ' + tl.status,
    '',
    'Kesif tarihi icin iletisime gecmek istiyorum.'
  ];
  const waMsg = encodeURIComponent(waParts.join('\n'));

  /* –– HTML'i sonuç div'ine bas ––––––––––––––––––––––––––––––––––– */
  document.getElementById('resultContent').innerHTML = `
    <div style="margin-bottom:14px">
      <div class="stitle">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Sulama Analiz Raporu
      </div>
      <div class="ssub">${adSoyad?adSoyad+' – ':''}${tarih} – Mühendislik ön analizi</div>
    </div>

    ${heroHtml}
    ${tlHtml}
    ${uyariHtml}
    ${optsHtml}

    <button class="acc-btn" onclick="toggleAcc(this)">
      <span>🔍 Teknik Detayları Gör</span>
      <span class="acc-caret">"▶</span>
    </button>
    <div class="acc-content">${detayIcerik}</div>

    <button class="acc-btn" onclick="toggleAcc(this)">
      <span>🔬 Mühendis Detayı (Skor · Senaryolar · Göreli Maliyet)</span>
      <span class="acc-caret">"▶</span>
    </button>
    <div class="acc-content">${muhIcerik}</div>

    ${fiyatHtml}

    <div class="legal">
      <b>⚠– Uyarı ve Sorumluluk Reddi</b>
      Bu rapor bir <b>ön mühendislik analizidir</b>. Fiyat tahmini yapılmamıştır;
      kesin teklif için saha keşfi zorunludur. Çoklu kuyu senaryolarında DSİ ruhsatı,
      sondaj izni ve hidrojeolojik etüt gerekir. Bircan Elektrik bu hesaplamadan
      hukuki sorumluluk kabul etmez.
    </div>

    <button class="wa-btn" id="waBtnResult">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp – Keşif Randevusu İste
    </button>

    <div class="print-hide" style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button onclick="duzenle()" style="background:transparent;border:1px solid var(--gold);color:var(--gold);border-radius:8px;padding:10px;font-family:'Barlow',sans-serif;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:6px">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Düzenle
      </button>
      <button onclick="yeniHesap()" style="background:transparent;border:1px solid var(--bdr);color:var(--tx2);border-radius:8px;padding:10px;font-family:'Barlow',sans-serif;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:6px">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
        Yeni Hesaplama
      </button>
    </div>`;

  setTimeout(function(){
    var btn=document.getElementById('waBtnResult');
    if(btn) btn.onclick=function(){window.open('https://wa.me/905XXXXXXXXX?text='+waMsg,'_blank');};
  },50);
}

function salesHeadline(rec){
  const map = {
    tek:'Bu arazi için en dengeli çözüm tek sistemdir.',
    paralel2:'Bu arazi için en dengeli çözüm 2 kuyulu sistemdir.',
    paralel3:'Bu arazi için en güçlü çözüm 3 kuyulu sistemdir.',
    zonlu:'Bu arazi için en dengeli çözüm sulamayı bölerek yapmaktır.',
    depolu:'Bu arazi için en dengeli çözüm depolu sistemdir.'
  };
  return map[rec.tipi] || 'Bu arazi için en uygun çözüm bu sistemdir.';
}
function salesWhyLead(rec){
  const nedenler = [];
  if(rec.nKuyu>1) nedenler.push('yük tek kuyuda toplanmıyor');
  else if(rec.tipi==='zonlu') nedenler.push('sulama sırayla yapılıyor');
  if(rec.basincDurum==='ok') nedenler.push('basınç güvenli aralıkta kalıyor');
  else if(rec.basincDurum==='sinir') nedenler.push('bölünmüş çalışma basıncı rahatlatıyor');
  if(rec.debiDurum==='ok') nedenler.push('kuyu suyu bu düzeni taşıyor');
  else if(rec.teslim==='depo') nedenler.push('depo düşük debiyi tamponluyor');
  if(!nedenler.length) nedenler.push('hesaplar bu düzenin daha dengeli olduğunu gösteriyor');
  return 'Sebep: '+nedenler.slice(0,3).join(', ')+'.';
}
function salesShortComment(rec){
  const notlar = [];
  if(S.egimDurum==='egimli' && S.kotFarki>0) notlar.push('Arazi eğimi hesaba katıldı.');
  if(rec.nKuyu>1) notlar.push('Bir pompa dursa bile sulamanın tamamı bir anda durmaz.');
  else if(rec.teslim==='depo') notlar.push('Kuyu düşük debide kalsa da depo kullanım rahatlığı sağlar.');
  if(rec.kuyuTabanSinir || S.kurumaRisk==='var') notlar.push('Kuru çalışma koruması şart.');
  return notlar.slice(0,2).join(' ') || farmerBenefit(rec);
}
function salesWhyCards(rec){
  const kartlar = [];
  if(rec.nKuyu>1){
    kartlar.push({title:'Kuyu yükü', body:'Su ihtiyacı tek kuyuda toplanmıyor. Sistem daha rahat çalışıyor.'});
  } else if(rec.tipi==='zonlu'){
    kartlar.push({title:'Çalışma düzeni', body:'Aynı anda tüm hatlar açılmadığı için pompa daha rahat çalışıyor.'});
  } else {
    kartlar.push({title:'Kurulum sadeliği', body:'Sistem daha sade kurulur ve günlük kullanım daha anlaşılır olur.'});
  }
  if(rec.debiDurum==='ok'){
    kartlar.push({title:'Su kapasitesi', body:'Kuyu debisi bu çalışma düzenini taşıyabilecek seviyede görünüyor.'});
  } else if(rec.debiDurum==='border'){
    kartlar.push({title:'Su kapasitesi', body:'Sistem çalışır; ama çalışma süresi biraz uzatılırsa daha rahat olur.'});
  } else if(rec.teslim==='depo'){
    kartlar.push({title:'Su kapasitesi', body:'Kuyu düşük debide kalsa bile depo tamponu sistemi rahatlatır.'});
  }
  if(rec.basincDurum==='ok'){
    kartlar.push({title:'Basınç rahatlığı', body:'Pompanın üretmesi gereken basınç güvenli aralıkta kalıyor.'});
  } else {
    kartlar.push({title:'Basınç yönetimi', body:'Seçilen düzen basıncı daha kontrollü tutmak için tercih edildi.'});
  }
  if(S.egimDurum==='egimli' && S.kotFarki>0){
    kartlar.push({title:'Arazi şartı', body:'Arazi eğimli olduğu için pompanın ekstra basınç ihtiyacı hesaba katıldı.'});
  }
  if(rec.kuyuTabanSinir || S.kurumaRisk==='var'){
    kartlar.push({title:'Koruma', body:'Kuyu sınırda çalışıyorsa kuru çalışma koruması ve izleme çok önemlidir.'});
  }
  return kartlar.slice(0,3);
}
function salesOptionComment(s, role, model){
  if(role==='rec') return 'En dengeli seçim. Uygunluk, güven ve kullanım rahatlığı birlikte iyi.';
  if(role==='eco'){
    if(s===model.recommended) return 'Önerilen çözüm aynı zamanda ilk yatırım tarafında da dengeli.';
    if(s.tipi==='zonlu') return 'Sulamayı bölmek ilk yatırımı hafifletebilir, yine de keşif gerekir.';
    if(s.nKuyu===1) return 'İlk yatırım hafifleyebilir; ancak tüm yük tek kuyuda toplanır.';
    return 'İlk yatırım tarafında daha hafif olabilir. Kesin fiyat için keşif gerekir.';
  }
  if(role==='safe'){
    if(s===model.recommended) return 'Önerilen çözüm güvenlik tarafında da güçlü görünüyor.';
    if(s.nKuyu>1) return 'Yük dağıldığı için arıza anında tüm sulama bir anda durmaz.';
    if(s.teslim==='depo') return 'Depo tamponu düşük debi günlerinde sistemi daha güvenli hale getirir.';
    return 'Kullanım güvenliği için daha korumalı bir çözüm olabilir.';
  }
  return '';
}
function buildSalesModel(engine){
  const recommended = engine.recommended;
  const tl = getTrafficLight(recommended);
  const recommendedBom = engine.recommendedBom || (engine.bomByScenario ? engine.bomByScenario[recommended.tipi] : null);
  const allAlerts = (engine.warnings || []).filter(u=>u.tip!=='ok');
  // Anchor'a göre gruplandır; anchor'u olmayan veya 'general' olan uyarılar alt panelde toplu gösterilecek.
  const alertsByAnchor = {};
  allAlerts.forEach(u=>{
    const a = u.anchor || 'general';
    if(!alertsByAnchor[a]) alertsByAnchor[a] = [];
    alertsByAnchor[a].push(u);
  });
  return {
    recommended,
    economic:engine.economic || recommended,
    safer:engine.safer || recommended,
    visibleScenarios:engine.visibleScenarios,
    scenarios:engine.scenarios,
    zon:engine.zon,
    zonByScenario:engine.zonByScenario,
    bomByScenario:engine.bomByScenario,
    recommendedBom,
    assumptions:engine.assumptions,
    cost:engine.cost,
    validation:engine.validation || S._validation || null,
    su:engine.su,
    ds:engine.ds,
    tl,
    alerts:allAlerts.slice(0,3),          // geri uyumluluk (eski kod referansı)
    alertsAll:allAlerts,
    alertsByAnchor,
    headline:salesHeadline(recommended),
    whyLead:salesWhyLead(recommended),
    shortComment:salesShortComment(recommended),
    whyCards:salesWhyCards(recommended),
    stats:[
      {
        label:'Günlük su ihtiyacı',
        value:S.gunlukSu+' ton/gün',
        note:engine.su ? (getProductionTypeName()+' · '+engine.su.bitki.ad+' için hesaplandı') : 'Girilen su ihtiyacı kullanıldı'
      },
      {
        label:'Gerekli pompa gücü',
        value:recommended.secPompGuc+' kW'+(recommended.nKuyu>1?' x '+recommended.nKuyu:''),
        note:S.sistemTercih!=='sebeke' ? (recommended.totKwp+' kWp solar ön boyut') : 'Şebeke ile çalışabilir'
      },
      {
        label:'Uygun kuyu düzeni',
        value:getWellLayoutText(recommended),
        note:recommended.nKuyu>1 ? 'Yük paylaşılır' : recommended.teslim==='depo' ? 'Depo tampon görevi görür' : 'Sade kurulum'
      },
      {
        label:'Çalışma düzeni',
        value:getOperationText(recommended),
        note:tl.status==='Uygun' ? 'İşletme daha rahat' : 'Takip önerilir'
      },
      {
        label:'Toplam boru',
        value:(recommendedBom?.summary.totalPipe || 0)+' m',
        note:recommendedBom?.summary.approxCount ? 'Bazı boru kalemleri yaklaşık.' : 'Boru metrajı bu senaryodan türetildi'
      }
    ]
  };
}
