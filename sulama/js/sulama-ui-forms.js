/* sulama-ui-forms.js — Form render: renderTypeNumberField, renderProductionDetailFields, onArazi, onBasinc, onAdv vb. */

function renderTypeNumberField(id, label, placeholder, opts={}){
  const value = S[id] || '';
  return `<div class="fg${opts.span2?' s2':''}">
    <label>${label}${opts.required?' <span class="req">*</span>':''}</label>
    <input type="number" id="${id}" placeholder="${placeholder}" ${opts.min!==undefined?`min="${opts.min}"`:''} ${opts.max!==undefined?`max="${opts.max}"`:''} ${opts.step!==undefined?`step="${opts.step}"`:''} value="${value}" oninput="onProductionField()"/>
    <div class="field-note" id="fn_${id}">${opts.note||''}</div>
  </div>`;
}
function renderTypeSelectField(id, label, options, opts={}){
  const value = S[id] || opts.defaultValue || '';
  return `<div class="fg${opts.span2?' s2':''}">
    <label>${label}${opts.required?' <span class="req">*</span>':''}</label>
    <select id="${id}" onchange="onProductionField()">
      ${options.map(opt=>`<option value="${opt.value}" ${String(opt.value)===String(value)?'selected':''}>${opt.label}</option>`).join('')}
    </select>
    ${opts.note?`<div class="field-note">${opts.note}</div>`:''}
  </div>`;
}
function clearProductionLayoutState(){
  S.tipSiraArasi=0; S.tipBitkiArasi=0; S.tipToplamSira=0; S.tipTarlaEn=0; S.tipTarlaBoy=0;
  S.tipToplamAgac=0; S.tipAgacDamlaAdet=0; S.tipLateralTip='tek'; S.tipDamlaticiDebi=0; S.tipDamlaticiAralik=0;
  S.tipEkiliOran=100; S.tipLateralYon='uzun'; S.tipDikimTip='tek'; S.tipBahceYasi='olgun'; S.tipDirekArasi=0;
  S.tipSprinklerPreset='standart'; S.tipBaslikAralikX=0; S.tipBaslikAralikY=0; S.tipBaslikDebi=0; S.tipBaslikTip='rotor'; S.tipSulamaAcisi='tam'; S.tipBasinc=0;
  S.tipManualSira=0; S.tipManualLateralM=0; S.tipManualAgac=0; S.tipManualBlok=0;
}
function renderProductOptions(){
  const el=document.getElementById('urunTip');
  if(!el) return;
  const list=getProductListForType(S.uretimTipi);
  if(!S.uretimTipi){
    el.innerHTML='<option value="">Önce üretim tipi seçiniz</option>';
    S.urunTip='';
    return;
  }
  el.innerHTML=['<option value="">Ürün seçiniz</option>'].concat(
    list.map(item=>`<option value="${item.key}">${item.ad}</option>`)
  ).join('');
  if(list.some(item=>item.key===S.urunTip)) el.value=S.urunTip;
  else S.urunTip='';
}
function renderProductionDetailFields(){
  const wrap=document.getElementById('typeSpecificWrap');
  const meta=getProductionTypeMeta();
  if(!wrap) return;
  if(!meta){
    wrap.className='type-card empty';
    wrap.innerHTML=`
      <div class="type-card-title">Üretim tipine özel girişler</div>
      <div class="type-card-sub">Önce üretim tipini seçin. Sistem ardından bu arazi düzenine uygun yerleşim sorularını açacak.</div>`;
    return;
  }
  const defaults=getProductLayoutDefaults();
  const ctx=getFormContext();
  const methodLabel=getIrrigationMethodName();
  const methodSub = ctx.isSprinkler
    ? 'Bu yontemde yalnizca alan olcusu, sprinkler geometrisi ve basinc bilgisi kullanilir.'
    : ctx.isSalma
      ? 'Bu yontemde sistem alan olcusu ve genel saha bilgisiyle degerlendirilir.'
      : meta.desc;
  let fields='';
  const sprinklerFields = [
    renderTypeNumberField('tipTarlaEn',ctx.isLandscape ? 'Alan Eni (m)' : 'Alan / Bahçe Eni (m)','opsiyonel',{min:5,max:5000,step:1,note:'Girerseniz başlık ve lateral hesabı sahaya daha yakın çıkar.'}),
    renderTypeNumberField('tipTarlaBoy',ctx.isLandscape ? 'Alan Boyu (m)' : 'Alan / Bahçe Boyu (m)','opsiyonel',{min:5,max:5000,step:1}),
    renderTypeNumberField('tipBaslikAralikX','Sprinkler Aralığı X (m)','örn: 8',{min:1,max:30,step:0.5,required:true}),
    renderTypeNumberField('tipBaslikAralikY','Sprinkler Aralığı Y (m)','örn: 8',{min:1,max:30,step:0.5,required:true}),
    renderTypeNumberField('tipBaslikDebi','Başlık Debisi (m³/h)','örn: 1.1',{min:0.1,max:10,step:0.1,required:true}),
    renderTypeNumberField('tipBasinc','Çalışma Basıncı (bar)','örn: 3.5',{min:1,max:10,step:0.1}),
    renderTypeSelectField('tipBaslikTip','Başlık Tipi',[{value:'rotor',label:'Rotor'},{value:'spray',label:'Spray'},{value:'mp',label:'MP Rotator'}]),
    renderTypeSelectField('tipSulamaAcisi','Sulama Açısı',[{value:'tam',label:'Dairesel'},{value:'yarim',label:'Yarım daire'},{value:'sektor',label:'Sektör'}])
  ].join('');
  if(S.uretimTipi==='tarla'){
    fields = ctx.isSprinkler ? sprinklerFields : ctx.isDrip ? [
      renderTypeNumberField('tipSiraArasi','Sıra Arası Mesafe (m)','örn: 0.7',{min:0.15,max:5,step:0.05,required:true,note:'Damla hat yoğunluğu için ana kaynaktır.'}),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','örn: 0.3',{min:0.1,max:2,step:0.05,required:true}),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','örn: 1.6',{min:0.5,max:16,step:0.5,required:true}),
      renderTypeNumberField('tipEkiliOran','Ekili Alan Yüzdesi (%)','örn: 90',{min:10,max:100,step:1,note:'Boş alan varsa su ve dağıtım hesabı bunu dikkate alır.'}),
      renderTypeSelectField('tipLateralYon','Lateral Yönü',[{value:'uzun',label:'Uzun kenar boyunca'},{value:'kisa',label:'Kısa kenar boyunca'}],{note:'Metraj ve blok mantığını etkiler.'}),
      renderTypeNumberField('tipTarlaEn','Tarla Eni (m)','opsiyonel',{min:5,max:5000,step:1,note:'Girerseniz hat sayısı daha doğru çıkar.'}),
      renderTypeNumberField('tipTarlaBoy','Tarla Boyu (m)','opsiyonel',{min:5,max:5000,step:1,note:'Arazi ölçüsü bilinmiyorsa sistem dönümden türetir.'})
    ].join('') : [
      renderTypeNumberField('tipEkiliOran','Ekili Alan Yüzdesi (%)','örn: 90',{min:10,max:100,step:1}),
      renderTypeNumberField('tipTarlaEn','Tarla Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Tarla Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('');
  } else if(S.uretimTipi==='sebze'){
    fields = ctx.isSprinkler ? sprinklerFields : ctx.isDrip ? [
      renderTypeNumberField('tipSiraArasi','Sıra Arası Mesafe (m)','örn: 1.4',{min:0.2,max:5,step:0.05,required:true,note:'Sebze sıralarını belirler.'}),
      renderTypeNumberField('tipBitkiArasi','Bitki Arası Mesafe (m)','örn: 0.35',{min:0.05,max:2,step:0.05,required:true}),
      renderTypeNumberField('tipToplamSira','Toplam Sıra Sayısı','örn: 48',{min:1,max:5000,step:1,note:'Bilinmiyorsa en-boydan türetilebilir.'}),
      renderTypeSelectField('tipDikimTip','Dikim Düzeni',[{value:'tek',label:'Tek sıra dikim'},{value:'cift',label:'Çift sıra dikim'}],{note:'Lateral sayısını etkiler.'}),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','örn: 0.3',{min:0.1,max:2,step:0.05,required:true}),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','örn: 2',{min:0.5,max:16,step:0.5,required:true}),
      renderTypeNumberField('tipTarlaEn','Tarla Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Tarla Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('') : [
      renderTypeNumberField('tipTarlaEn','Tarla Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Tarla Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('');
  } else if(S.uretimTipi==='meyve'){
    fields = ctx.isSprinkler ? sprinklerFields : ctx.isDrip ? [
      renderTypeNumberField('tipSiraArasi','Ağaç Sıra Arası (m)','örn: 4.5',{min:1,max:20,step:0.1,required:true}),
      renderTypeNumberField('tipBitkiArasi','Ağaç Üzeri Mesafe (m)','örn: 3.5',{min:1,max:20,step:0.1,required:true}),
      renderTypeNumberField('tipToplamSira','Toplam Sıra Sayısı','örn: 18',{min:1,max:5000,step:1}),
      renderTypeNumberField('tipToplamAgac','Toplam Ağaç Sayısı','manuel girilebilir',{min:1,max:50000,step:1,note:'Bunu girerseniz ağaç hesabı doğrudan kullanılır.'}),
      renderTypeNumberField('tipTarlaEn','Bahçe Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Bahçe Boyu (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipAgacDamlaAdet','Ağaç Başına Damlatıcı','örn: 4',{min:1,max:20,step:1,required:true}),
      renderTypeSelectField('tipLateralTip','Lateral Düzeni',[{value:'tek',label:'Tek lateral'},{value:'cift',label:'Çift lateral'}],{note:'Ağaç altı çift hat istenirse seçin.'}),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','örn: 4',{min:0.5,max:16,step:0.5,required:true}),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','örn: 0.5',{min:0.1,max:3,step:0.05}),
      renderTypeSelectField('tipBahceYasi','Bahçe Durumu',[{value:'genc',label:'Genç bahçe'},{value:'olgun',label:'Olgun bahçe'}],{note:'Ağaç başı damlatıcı yorumunu etkiler.'})
    ].join('') : [
      renderTypeNumberField('tipTarlaEn','Bahçe Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Bahçe Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('');
  } else if(S.uretimTipi==='bag'){
    fields = ctx.isSprinkler ? sprinklerFields : ctx.isDrip ? [
      renderTypeNumberField('tipSiraArasi','Sıra Arası Mesafe (m)','örn: 3',{min:1,max:10,step:0.1,required:true}),
      renderTypeNumberField('tipBitkiArasi','Omca Aralığı (m)','örn: 2.2',{min:0.5,max:6,step:0.1,required:true}),
      renderTypeNumberField('tipDirekArasi','Direkler Arası (m)','örn: 6',{min:1,max:15,step:0.1,note:'Montaj planı için referans olur.'}),
      renderTypeNumberField('tipToplamSira','Toplam Sıra Sayısı','örn: 22',{min:1,max:5000,step:1}),
      renderTypeNumberField('tipTarlaEn','Bağ Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Bağ Boyu (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeSelectField('tipLateralTip','Hat Düzeni',[{value:'tek',label:'Tek hat sulama'},{value:'cift',label:'Çift hat sulama'}]),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','örn: 0.5',{min:0.1,max:3,step:0.05}),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','örn: 2',{min:0.5,max:16,step:0.5,required:true})
    ].join('') : [
      renderTypeNumberField('tipTarlaEn','Bağ Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Bağ Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('');
  } else if(S.uretimTipi==='zeytinlik'){
    fields = ctx.isSprinkler ? sprinklerFields : ctx.isDrip ? [
      renderTypeNumberField('tipSiraArasi','Sıra Arası Mesafe (m)','örn: 6',{min:1,max:20,step:0.1,required:true}),
      renderTypeNumberField('tipBitkiArasi','Ağaç Aralığı (m)','örn: 6',{min:1,max:20,step:0.1,required:true}),
      renderTypeNumberField('tipToplamAgac','Toplam Ağaç Sayısı','örn: 120',{min:1,max:50000,step:1}),
      renderTypeNumberField('tipToplamSira','Toplam Sıra Sayısı','opsiyonel',{min:1,max:5000,step:1}),
      renderTypeNumberField('tipAgacDamlaAdet','Ağaç Başına Damlatıcı','örn: 4',{min:1,max:20,step:1,required:true}),
      renderTypeSelectField('tipLateralTip','Lateral Düzeni',[{value:'tek',label:'Tek lateral'},{value:'cift',label:'Çift lateral'}]),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','örn: 4',{min:0.5,max:16,step:0.5,required:true}),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','örn: 0.75',{min:0.1,max:3,step:0.05}),
      renderTypeNumberField('tipTarlaEn','Bahçe Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Bahçe Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('') : [
      renderTypeNumberField('tipTarlaEn','Bahçe Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Bahçe Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('');
  } else if(S.uretimTipi==='peyzaj'){
    fields = ctx.isDrip ? [
      renderTypeNumberField('tipTarlaEn','Alan Eni (m)','örn: 40',{min:5,max:5000,step:1,required:true}),
      renderTypeNumberField('tipTarlaBoy','Alan Boyu (m)','örn: 60',{min:5,max:5000,step:1,required:true}),
      renderTypeNumberField('tipSiraArasi','Hat Aralığı (m)','örn: 1.2',{min:0.2,max:10,step:0.1,required:true}),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','örn: 0.4',{min:0.1,max:3,step:0.05,required:true}),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','örn: 2',{min:0.5,max:16,step:0.5,required:true}),
      renderTypeSelectField('tipLateralYon','Lateral Yönü',[{value:'uzun',label:'Uzun kenar boyunca'},{value:'kisa',label:'Kısa kenar boyunca'}])
    ].join('') : ctx.isSprinkler ? sprinklerFields : [
      renderTypeNumberField('tipTarlaEn','Alan Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Alan Boyu (m)','opsiyonel',{min:5,max:5000,step:1})
    ].join('');
  } else if(S.uretimTipi==='ozel'){
    fields = ctx.isSprinkler ? sprinklerFields : ctx.isDrip ? [
      renderTypeNumberField('tipManualSira','Manuel Sıra Sayısı','örn: 12',{min:1,max:5000,step:1}),
      renderTypeNumberField('tipManualLateralM','Manuel Lateral Toplamı (m)','örn: 850',{min:1,max:500000,step:1}),
      renderTypeNumberField('tipManualAgac','Manuel Ağaç / Bitki Sayısı','örn: 140',{min:0,max:500000,step:1}),
      renderTypeNumberField('tipManualBlok','Manuel Blok Sayısı','örn: 3',{min:1,max:1000,step:1}),
      renderTypeNumberField('tipTarlaEn','Alan Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Alan Boyu (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipDamlaticiDebi','Damlatıcı Debisi (L/h)','opsiyonel',{min:0.5,max:16,step:0.5}),
      renderTypeNumberField('tipDamlaticiAralik','Damlatıcı Aralığı (m)','opsiyonel',{min:0.1,max:3,step:0.05})
    ].join('') : [
      renderTypeNumberField('tipTarlaEn','Alan Eni (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipTarlaBoy','Alan Boyu (m)','opsiyonel',{min:5,max:5000,step:1}),
      renderTypeNumberField('tipManualBlok','Manuel Blok Sayısı','örn: 3',{min:1,max:1000,step:1})
    ].join('');
  }
  wrap.className='type-card';
  wrap.innerHTML=`
    <div class="type-card-head">
      <div>
        <div class="type-card-title">${meta.ad} · ${methodLabel} yerleşimi</div>
        <div class="type-card-sub">${methodSub}</div>
      </div>
      <div class="type-card-badge">${S.uretimTipi==='ozel' ? 'Ön keşif seviyesi' : 'Sahaya yakın yerleşim'}</div>
    </div>
    <div class="type-grid">${fields}</div>
    <div class="type-list">${meta.chips.map(chip=>`<span class="type-pill">${chip}</span>`).join('')}</div>
    <div class="type-footnote">Öncelik kuralı: bu karttaki veriler ana kaynaktır. Hassas ayar kutusu yalnızca ikinci kaynak olarak değerlendirilir. Varsayılan ürün ön kabulü: ${defaults.rowSpace || '-'} m sıra arası.</div>`;
  // Yeni field'lar DOM'a yerleşti — dönüm/en/boy türetmesini şimdi dene
  if(typeof deriveFieldDimensions==='function') deriveFieldDimensions();
  if(typeof renderZonHint==='function') renderZonHint();
  if(typeof renderStep2SanityAlerts==='function') renderStep2SanityAlerts();
}

// Adım 2 altında canlı sanity uyarıları — layout, water, pipe anchor'lı olanlar
function renderStep2SanityAlerts(){
  const el = document.getElementById('step2SanityAlerts');
  if(!el) return;
  if(typeof buildLayoutSanityWarnings!=='function'){ el.innerHTML=''; return; }
  let list = [];
  try { list = buildLayoutSanityWarnings(); } catch(e){ el.innerHTML=''; return; }
  // Sadece form-üstü uyarılar göster — layout, water, pipe
  const relevant = list.filter(u=>['layout','water','pipe'].indexOf(u.anchor)!==-1);
  if(!relevant.length){ el.innerHTML=''; return; }
  const icon = { krit:'✗', warn:'⚠', info:'ℹ' };
  el.innerHTML = `
    <div class="form-sanity-block">
      <div class="form-sanity-head">Değer kontrolü</div>
      ${relevant.map(u=>`
        <div class="form-sanity-item ${u.tip}">
          <span class="fs-ico">${icon[u.tip]||'•'}</span>
          <span class="fs-txt">${u.mesaj}</span>
        </div>`).join('')}
    </div>`;
}
function readProductionInputs(){
  S.uretimTipi = readTextInput('uretimTipi', S.uretimTipi);
  S.urunTip = readTextInput('urunTip', S.urunTip);
  S.tipSiraArasi = readNumericInput('tipSiraArasi');
  S.tipBitkiArasi = readNumericInput('tipBitkiArasi');
  S.tipToplamSira = readNumericInput('tipToplamSira');
  S.tipTarlaEn = readNumericInput('tipTarlaEn');
  S.tipTarlaBoy = readNumericInput('tipTarlaBoy');
  S.tipToplamAgac = readNumericInput('tipToplamAgac');
  S.tipAgacDamlaAdet = readNumericInput('tipAgacDamlaAdet');
  S.tipDamlaticiDebi = readNumericInput('tipDamlaticiDebi');
  S.tipDamlaticiAralik = readNumericInput('tipDamlaticiAralik');
  S.tipEkiliOran = readNumericInput('tipEkiliOran') || 100;
  S.tipDirekArasi = readNumericInput('tipDirekArasi');
  S.tipBaslikAralikX = readNumericInput('tipBaslikAralikX');
  S.tipBaslikAralikY = readNumericInput('tipBaslikAralikY');
  S.tipBaslikDebi = readNumericInput('tipBaslikDebi');
  S.tipBasinc = readNumericInput('tipBasinc');
  S.tipManualSira = readNumericInput('tipManualSira');
  S.tipManualLateralM = readNumericInput('tipManualLateralM');
  S.tipManualAgac = readNumericInput('tipManualAgac');
  S.tipManualBlok = readNumericInput('tipManualBlok');
  S.tipSprinklerPreset = readTextInput('tipSprinklerPreset', S.tipSprinklerPreset || 'standart');
  S.tipLateralTip = readTextInput('tipLateralTip', S.tipLateralTip || 'tek');
  S.tipLateralYon = readTextInput('tipLateralYon', S.tipLateralYon || 'uzun');
  S.tipDikimTip = readTextInput('tipDikimTip', S.tipDikimTip || 'tek');
  S.tipBahceYasi = readTextInput('tipBahceYasi', S.tipBahceYasi || 'olgun');
  S.tipBaslikTip = readTextInput('tipBaslikTip', S.tipBaslikTip || 'rotor');
  S.tipSulamaAcisi = readTextInput('tipSulamaAcisi', S.tipSulamaAcisi || 'tam');
}
function onProductionTypeChange(){
  const prev = S.uretimTipi;
  S.uretimTipi = readTextInput('uretimTipi', '');
  if(prev!==S.uretimTipi){
    clearProductionLayoutState();
    S.urunTip='';
  }
  renderProductOptions();
  renderProductionDetailFields();
  updateDripAdvancedUI();
  onArazi();
}
function onProductChange(){
  S.urunTip = readTextInput('urunTip', '');
  renderProductionDetailFields();
  onArazi();
}
function onProductionField(){
  // Kullanıcı tipTarlaEn veya tipTarlaBoy'a el ile yazmışsa derived işaretini kaldır
  // (böylece o değer artık kullanıcı-gerçek olur, diğerini türetir).
  // Event'in hangi alandan geldiğini document.activeElement ile kestiriyoruz.
  const act = document.activeElement;
  if(act && (act.id==='tipTarlaEn' || act.id==='tipTarlaBoy')){
    if(act.dataset.derived==='1'){
      delete act.dataset.derived;
      act.classList.remove('state-applied');
      const hint = document.getElementById('fn_'+act.id);
      if(hint && hint.dataset.derived==='1'){
        hint.textContent = '✓ Manuel değer.';
        hint.className = 'field-note st-manual';
        delete hint.dataset.derived;
      }
    }
  }
  readProductionInputs();
  deriveFieldDimensions();
  updateDripAdvancedUI();
  onAdv();
  renderSuPanel();
  renderBasincPanel();
  renderZonHint();
  renderValidationPanel();
}
function updateDripAdvancedUI(){
  const ctx = getFormContext();
  const info=document.getElementById('advDamlaBahceInfo');
  const yag=document.getElementById('advYag');
  const dml=document.getElementById('advDamla');
  const showDripFields = ctx.isDrip;
  const showFieldTune = ctx.isDrip && ctx.isFieldLike;
  const showOnlyLateral = ctx.isDrip && !ctx.isFieldLike;
  if(yag) yag.style.display=ctx.isSprinkler?'grid':'none';
  if(dml) dml.style.display=showDripFields?'grid':'none';
  ['advField_dmlSiraArasi','advField_dmlDamlAralik','advField_dmlDamlDebi'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display=showFieldTune?'flex':'none';
  });
  const lateralEl=document.getElementById('advField_dmlLateralLen');
  if(lateralEl) lateralEl.style.display=showDripFields?'flex':'none';
  // Agac / bahce modunda: gelismis alan grubu yalnizca lateral uzunlugu gosterir
  // Tarla damla alanlari (siraArasi, damlAralik, damlDebi) bahce kartindan geliyor
  const treeAdvancedHideIds = [
    'advField_dmlSiraArasi','advField_dmlDamlAralik','advField_dmlDamlDebi',
    'advField_dmlBitkiArasi','advField_dmlToplamSira',
    'advField_dmlTarlaEn','advField_dmlTarlaBoy',
    'advField_dmlAgacDamlaAdet'
  ];
  if(ctx.isTree){
    treeAdvancedHideIds.forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.style.display='none';
    });
  }
  if(info){
    if(ctx.isTree){
      info.innerHTML = (S.uretimTipi==='bag'
        ? 'Bağ sistemi için damla hesabı yalnızca omca ve sıra planından alınır.'
        : S.uretimTipi==='zeytinlik'
          ? 'Zeytinlikte damla hesabı yalnızca ağaç düzeni kartından alınır.'
          : 'Meyve bahçesinde damla hesabı yalnızca bahçe yerleşim kartından alınır.'
      ) + ' Hassas ayarda aynı veriler tekrar sorulmaz.';
    } else if(showOnlyLateral){
      info.innerHTML = 'Bu üretim tipinde hassas ayar yalnızca lateral uzunluğu gibi mühendislik düzeltmeleri için kullanılır.';
    } else if(showFieldTune){
      info.innerHTML = 'Tarla / sebze damlada ana kaynak üretim kartıdır. Buradaki değerler yalnızca eksik kalan yerleşimi tamamlamak veya lateral uzunluğunu düzeltmek için kullanılır.';
    }
    info.style.display=ctx.isDrip && (ctx.isTree || showOnlyLateral || showFieldTune)?'block':'none';
  }
}
function onArazi(){
  S.araziDonum=parseFloat(document.getElementById('araziDonum').value)||0;
  S.uretimTipi=readTextInput('uretimTipi', S.uretimTipi);
  S.urunTip=document.getElementById('urunTip').value||'';
  readProductionInputs();
  S.uzakNokta=parseFloat(document.getElementById('uzakNokta').value)||0;
  S.kotFarki=parseFloat(document.getElementById('kotFarki').value)||0;
  S.boruCap=document.getElementById('boruCap').value||'';
  S.hatSayisi=Math.max(1,parseInt(document.getElementById('hatSayisi').value)||1);
  S.calismaSure=parseFloat(document.getElementById('calismaSure').value)||8;
  // ── Dönüm ↔ En ↔ Boy otomatik türetme ──
  // Kural: 3'ten 2'si girilmişse, eksik olanı hesapla (sadece boş ise, kullanıcı değerini ezme).
  // 1 dönüm = 1000 m² · alan = en × boy
  deriveFieldDimensions();
  const fn=document.getElementById('fn_uzakNokta');
  if(fn){
    if(S.uzakNokta>0){ fn.className='field-note st-manual'; fn.textContent='✓ '+S.uzakNokta+' m girildi.'; }
    else{ fn.className='field-note st-auto'; fn.textContent='Girilmezse 150 m varsayılır.'; }
  }
  updateDripAdvancedUI();
  onAdv();
  renderSuPanel(); renderBasincPanel();
  renderZonHint();
  renderValidationPanel();
}

// Dönüm / En / Boy türetme — 2'si varsa 3'üncüyü doldur
function deriveFieldDimensions(){
  const donum = Number(S.araziDonum) || 0;
  const enEl = document.getElementById('tipTarlaEn');
  const boyEl = document.getElementById('tipTarlaBoy');
  if(!enEl || !boyEl) return;
  const enVal = Number(enEl.value) || 0;
  const boyVal = Number(boyEl.value) || 0;
  const alanM2 = donum * 1000;
  const hasDonum = donum > 0;
  const hasEn = enVal > 0;
  const hasBoy = boyVal > 0;
  const clearHint = id => {
    const hint = document.getElementById('fn_'+id);
    if(hint && hint.dataset.derived==='1'){
      hint.textContent = '';
      hint.className = 'field-note';
      delete hint.dataset.derived;
    }
  };
  const setDerived = (id, val, fromLabel) => {
    const el = document.getElementById(id);
    if(el){
      el.value = Math.round(val);
      el.dataset.derived = '1';
      el.classList.add('state-applied');
    }
    S[id] = Math.round(val);
    const hint = document.getElementById('fn_'+id);
    if(hint){
      hint.className = 'field-note st-applied';
      hint.textContent = '✓ '+Math.round(val)+' m olarak '+fromLabel+'\'dan türetildi.';
      hint.dataset.derived = '1';
    }
  };
  // Kullanıcı bir alana gerçek değer yazmışsa (derived flag'i yok), o değer kutsaldır.
  const enManual = hasEn && enEl.dataset.derived !== '1';
  const boyManual = hasBoy && boyEl.dataset.derived !== '1';

  if(hasDonum && enManual && !boyManual){
    // En + dönüm verilmiş → boy türet
    const boy = alanM2 / enVal;
    if(boy >= 5 && boy <= 5000) setDerived('tipTarlaBoy', boy, 'dönüm ve en');
  } else if(hasDonum && boyManual && !enManual){
    // Boy + dönüm verilmiş → en türet
    const en = alanM2 / boyVal;
    if(en >= 5 && en <= 5000) setDerived('tipTarlaEn', en, 'dönüm ve boy');
  } else if(!hasDonum && enManual && boyManual){
    // En + boy verilmiş → dönüm türet
    const derivedDonum = (enVal * boyVal) / 1000;
    const donumEl = document.getElementById('araziDonum');
    if(donumEl && !donumEl.value){
      donumEl.value = derivedDonum.toFixed(1);
      S.araziDonum = +derivedDonum.toFixed(1);
      const hint = document.getElementById('fn_araziDonum');
      if(hint){
        hint.className = 'field-note st-applied';
        hint.textContent = '✓ '+derivedDonum.toFixed(1)+' dönüm (en × boy\'dan türetildi).';
      }
    }
  } else if(hasDonum && !enManual && !boyManual){
    // Sadece dönüm var — eski derived değerleri temizle (kare kabul etmeyelim)
    clearHint('tipTarlaEn');
    clearHint('tipTarlaBoy');
  }
}

// Zon önerisi: debi × çalışma süresi ile min zon hesaplayıp placeholder/hint göster
function renderZonHint(){
  const el = document.getElementById('hatSayisi');
  if(!el) return;
  let hint = document.getElementById('fn_hatSayisi');
  if(!hint){
    hint = document.createElement('div');
    hint.id = 'fn_hatSayisi';
    hint.className = 'field-note';
    el.parentElement && el.parentElement.appendChild(hint);
  }
  // Su + süre + üretim tipi yoksa öneri veremeyiz
  const gs = Number(S.gunlukSu) || 0;
  const sSure = Number(S.calismaSure) || 8;
  if(!gs || !S.uretimTipi){
    hint.className = 'field-note st-auto';
    hint.textContent = 'Günlük su ve üretim tipi girince otomatik öneri çıkar.';
    el.placeholder = 'örn: 3';
    return;
  }
  // Sistemin saatlik debi ihtiyacı
  const saatlikIhtiyac = gs / sSure;      // m³/h
  // Yerleşim saatlik debisi (damla: ağaç × damlatıcı × L/h; tarla: sprinkler × debi)
  let yerlesimIhtiyac = 0;
  try {
    if(S.sulamaYontem==='damla' && typeof getDripLayoutModel==='function'){
      const m = getDripLayoutModel();
      yerlesimIhtiyac = m.systemFlowM3h || 0;
    } else if(S.sulamaYontem==='yagmurlama' && typeof getSprinklerLayoutModel==='function'){
      const m = getSprinklerLayoutModel();
      yerlesimIhtiyac = (m.sprinklerCount||0) * (m.headFlow||0);
    }
  } catch(e){ /* yerlesim henüz eksik */ }
  if(!yerlesimIhtiyac){
    hint.className = 'field-note st-auto';
    hint.textContent = 'Yerleşim bilgileri tamamlanınca otomatik zon önerisi çıkar.';
    return;
  }
  const minZon = Math.max(1, Math.ceil(yerlesimIhtiyac / saatlikIhtiyac));
  const girilen = Math.max(1, parseInt(el.value)||1);
  el.placeholder = 'önerilen: ' + minZon;
  if(girilen < minZon){
    hint.className = 'field-note err';
    hint.innerHTML = '⚠ <b>En az '+minZon+' zon gerekli.</b> Yerleşim debisi '+yerlesimIhtiyac.toFixed(1)+' m³/h, pompa aynı anda '+saatlikIhtiyac.toFixed(1)+' m³/h verebilir.';
  } else if(girilen > minZon + 2){
    hint.className = 'field-note';
    hint.style.color = 'var(--or)';
    hint.textContent = 'Önerilen '+minZon+' zon yeterli olurdu — '+girilen+' zon sulamayı gereksiz uzatır.';
  } else {
    hint.className = 'field-note st-manual';
    hint.textContent = '✓ '+girilen+' zon hidrolik olarak uygun (min '+minZon+').';
  }
}
function onGunlukSu(_src){
  const v=parseFloat(document.getElementById('gunlukSu').value)||0;
  S.gunlukSu=v;
  if(v>0){ S.gunlukSuState='manual'; setFieldState('gunlukSu','manual','✓ Manuel değer.'); }
  else { S.gunlukSuState='empty'; setFieldState('gunlukSu','',''); }
  renderSuPanel();
  renderBasincPanel();
  renderZonHint();
  renderValidationPanel();
}
function onBasinc(){
  const v=parseFloat(document.getElementById('basinc').value)||0;
  S.basinc=v;
  if(v>0){ S.basincState='manual'; setFieldState('basinc','manual','✓ Manuel basınç kullanılıyor.'); }
  else { S.basincState='empty'; setFieldState('basinc','','Boş – otomatik hesap aktif.'); }
  renderBasincPanel();
  renderValidationPanel();
}
function onAdv(){
  readProductionInputs();
  S.spAralikX=readNumericInput('spAralikX');
  S.spAralikY=readNumericInput('spAralikY');
  S.spDebi=readNumericInput('spDebi');
  S.spBasinc=readNumericInput('spBasinc');
  S.dmlSiraArasi=readNumericInput('dmlSiraArasi');
  S.dmlDamlAralik=readNumericInput('dmlDamlAralik');
  S.dmlDamlDebi=readNumericInput('dmlDamlDebi');
  S.dmlLateralLen=readNumericInput('dmlLateralLen');
  S.dmlBitkiArasi=readNumericInput('dmlBitkiArasi');
  S.dmlToplamSira=readNumericInput('dmlToplamSira');
  S.dmlTarlaEn=readNumericInput('dmlTarlaEn');
  S.dmlTarlaBoy=readNumericInput('dmlTarlaBoy');
  S.dmlAgacDamlaAdet=readNumericInput('dmlAgacDamlaAdet');
  S.dmlLateralTip=readTextInput('dmlLateralTip', S.dmlLateralTip || 'tek');
  updateDripAdvancedUI();
  const yag = S.sulamaYontem==='yagmurlama' && getSprinklerLayoutModel().exact;
  const drip = getDripLayoutModel();
  const dml = S.sulamaYontem==='damla' && drip.exact;
  S.advParamGirildi = yag || dml;
  const not=document.getElementById('advNotice');
  if(not){
    if(S.advParamGirildi){
      not.innerHTML='<b style="color:var(--gr)">hassas hesap modu</b> — yerleşim bilgisi yeterli, zon önerisi güçlü veriyle üretilecek.';
      not.style.borderColor='#1A8A47';
    } else if(S.sulamaYontem==='damla' && (drip.orchard || S.uretimTipi==='ozel')){
      not.innerHTML='<b style="color:var(--or)">ön kabul modu</b> — üretim düzeni eksik. Liste ve zon önerisi detay yerleşim tamamlanınca kesinleşir.';
      not.style.borderColor='#7A5A00';
    } else {
      not.innerHTML='<b style="color:var(--or)">ön tahmin modu</b> — hassas ayar girilmedi, sistem üretim kartı ve varsayımlarla çalışıyor.';
      not.style.borderColor='#3A2800';
    }
  }
  renderValidationPanel();
}
function setFieldState(id,state,msg){
  const el=document.getElementById(id); if(!el) return;
  const fn=document.getElementById('fn_'+id);
  el.classList.remove('state-auto','state-applied','state-manual');
  if(state==='manual') el.classList.add('state-manual');
  else if(state==='applied') el.classList.add('state-applied');
  if(fn){ fn.className='field-note'+(state?' st-'+state:''); fn.textContent=msg||''; }
}
