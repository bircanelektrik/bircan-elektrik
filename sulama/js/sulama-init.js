/* sulama-init.js — Başlatma ve event handler'lar: hesapla, duzenle, gitAdim, yeniHesap, window onload */

function hesapla(){
  // State sync (DOM "†’ S)
  S.sebekeDurum  = document.querySelector('#rb_sebekeDurum .sel')?.dataset.val || 'yok';
  S.sistemTercih = document.querySelector('#rb_sistemTercih .sel')?.dataset.val || 'solar';
  S.panelYer     = document.querySelector('#rb_panelYer .sel')?.dataset.val || 'yer';
  S.ilSecim      = document.getElementById('ilSecim').value || 'orta';
  S.oncelik      = document.querySelector('#rb_oncelik .sel')?.dataset.val || 'guvenlik';
  S.kullanci     = document.querySelector('#rb_kullanci .sel')?.dataset.val || 'kendisi';
  S.sulamaYontem = document.querySelector('#rb_sulamaYontem .sel')?.dataset.val || 'yagmurlama';
  S.egimDurum    = document.querySelector('#rb_egimDurum .sel')?.dataset.val || 'duz';
  S.teslimNokta  = document.querySelector('#rb_teslimNokta .sel')?.dataset.val || 'direkt';
  S.boruTip      = document.querySelector('#rb_boruTip .sel')?.dataset.val || 'hdpe';
  S.trafoMesafe  = parseFloat(document.getElementById('trafoMesafe').value)||0;
  S.gunlukSu     = parseFloat(document.getElementById('gunlukSu').value)||0;
  S.calismaSure  = parseFloat(document.getElementById('calismaSure').value)||8;
  S.hatSayisi    = Math.max(1, parseInt(document.getElementById('hatSayisi').value)||1);
  S.uzakNokta    = parseFloat(document.getElementById('uzakNokta').value)||0;
  S.kotFarki     = parseFloat(document.getElementById('kotFarki').value)||0;
  S.araziDonum   = parseFloat(document.getElementById('araziDonum').value) || S.araziDonum || 0;
  S.uretimTipi   = document.getElementById('uretimTipi')?.value || S.uretimTipi || '';
  S.urunTip      = document.getElementById('urunTip').value || '';
  onAdv();

  if(typeof dbg !== "undefined") dbg.state(S);
  if(!S.kuyuDerinlik || !S.gunlukSu){ alert('Eksik veri: Kuyu derinliği ve günlük su ihtiyacı gerekli.'); return; }
  if(!S.uretimTipi){ alert('Eksik veri: üretim / arazi düzeni tipi gerekli.'); return; }

  // ── Hard blocker: dinamik su kuyu derinliğinden büyük/eşit ise sistem çalışamaz ──
  // Bu kombinasyon fiziksel olarak imkansız (dinamik su kuyunun İÇİNDE olmak zorunda).
  // Tahmin modunda statik×1.3 > derinlik ise yine aynı sorun.
  const _ds = (typeof getDin==='function') ? getDin() : (S.dmod==='biliyorum' ? S.dinamikSu : (S.statikSu*1.3));
  if(_ds > 0 && S.kuyuDerinlik > 0 && _ds >= S.kuyuDerinlik){
    const kaynak = (S.dmod==='biliyorum') ? 'Dinamik su ('+_ds+' m)' : 'Tahmini dinamik su ('+_ds.toFixed(1)+' m)';
    alert('⚠ HESAP YAPILAMAZ\n\n'+kaynak+' kuyu derinliğinden ('+S.kuyuDerinlik+' m) büyük.\n\nPompa bu derinlikte çalışamaz — hava çeker.\n\nLütfen Adım 1\'e dönün ve kuyu derinliği veya statik su değerini kontrol edin.');
    // Adım 1'e geri dön
    if(typeof goTo === 'function') goTo(1);
    if(typeof validateKuyu === 'function') validateKuyu();
    return;
  }
  // Dalış payı çok düşükse (< 3m) yine uyar ama devam etme kararını kullanıcıya sor
  if(_ds > 0 && S.kuyuDerinlik > 0 && (S.kuyuDerinlik - _ds) < 3){
    const pay = (S.kuyuDerinlik - _ds).toFixed(1);
    const onay = confirm('⚠ KRİTİK: Pompa dalış payı sadece '+pay+' m.\n\nPompa birkaç dakika içinde hava çekebilir. Bu sistem saha koşullarında çalışmayabilir.\n\nYine de rapor üretilsin mi? (İptal → Adım 1\'e dön)');
    if(!onay){
      if(typeof goTo === 'function') goTo(1);
      if(typeof validateKuyu === 'function') validateKuyu();
      return;
    }
  }

  const validation = buildCalculationValidation();
  renderValidationPanel(validation);
  if(!validation.canAnalyze){
    alert('Analiz oncesi kritik eksik var:\\n- ' + validation.blockers.join('\\n- '));
    return;
  }

  const engineResult = ENGINE.analyze();
  engineResult.validation = validation;
  S._sonSenaryolar = engineResult.scenarios;
  S._lastEngineResult = engineResult;
  S.selectedScenarioId = '';
  S.selectedScenarioType = '';
  S.bomAccordionOpen = false;

  if(typeof dbg !== "undefined") dbg.log("ENGINE_RESULT", {scenarios: engineResult.scenarios ? engineResult.scenarios.length : 0});
  renderSonuc(engineResult);
  goTo(5);
}

/* Düzenle modal */
function duzenle(){
  const overlay=document.createElement('div');
  overlay.id='duzenleOverlay';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML=`
    <div style="background:#1E1E1E;border:1px solid #3A2800;border-radius:12px;padding:22px;max-width:360px;width:90%">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Düzenle</div>
      <div style="font-size:11px;color:#A09880;margin-bottom:14px">Hangi bölümü düzenlemek istiyorsunuz?</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${[
          [1,'Kuyu Bilgileri','Derinlik, dinamik su, debi, kuyu sayısı'],
          [2,'Sulama, Arazi ve Basınç','Yöntem, dönüm, ürün, mesafe, su, basınç'],
          [3,'Enerji ve Altyapı','Şebeke, sistem tipi, il, panel'],
          [4,'Sistem Hedefi','Öncelik, kullanıcı']
        ].map(([n,t,d])=>`
          <button onclick="gitAdim(${n})" style="background:#161616;border:1px solid #2A2A2A;color:#F0EDE4;border-radius:7px;padding:10px 12px;text-align:left;cursor:pointer;font-family:'Barlow',sans-serif;font-size:12px;font-weight:500" onmouseover="this.style.borderColor='#C9A84C'" onmouseout="this.style.borderColor='#2A2A2A'">
            <div style="font-weight:600;margin-bottom:1px">${n}. ${t}</div>
            <div style="font-size:10px;opacity:0.5">${d}</div>
          </button>`).join('')}
      </div>
      <button onclick="kapatModal()" style="width:100%;margin-top:10px;background:transparent;border:1px solid #2A2A2A;color:#6B6555;border-radius:7px;padding:8px;font-family:'Barlow',sans-serif;font-size:11px;cursor:pointer;font-weight:600;text-transform:uppercase">İptal</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) kapatModal(); });
}
function gitAdim(n){
  kapatModal();
  S._duzenlemeModu = true;
  goTo(n);
  // "Yeniden Hesapla" butonu SADECE düzenleme modunda eklenir
  setTimeout(function(){
    const nav = document.querySelector('#step'+n+' .navbtns');
    if(!nav || nav.querySelector('.btn-yeniden')) return;
    const btn = document.createElement('button');
    btn.className = 'btn btnan btn-yeniden';
    btn.innerHTML = 'Yeniden Hesapla –¶';
    btn.onclick = function(){ hesapla(); };
    nav.appendChild(btn);
  }, 30);
}
function kapatModal(){ const ov=document.getElementById('duzenleOverlay'); if(ov) ov.remove(); }

/* Yeni hesaplama – formu sıfırla */
function yeniHesap(){
  ['kuyuDerinlik','statikSu','dinamikSu','kuyuDebi','araziDonum','uzakNokta','kotFarki','gunlukSu','basinc','hatSayisi','adSoyad',
   'spAralikX','spAralikY','spDebi','spBasinc','dmlSiraArasi','dmlDamlAralik','dmlDamlDebi','dmlLateralLen',
   'dmlBitkiArasi','dmlToplamSira','dmlTarlaEn','dmlTarlaBoy','dmlAgacDamlaAdet','mevcutPompa','trafoMesafe','uretimTipi'
  ].forEach(function(k){ const el=document.getElementById(k); if(el) el.value=''; });

  const el2=document.getElementById('calismaSure');  if(el2) el2.value='8';
  const el3=document.getElementById('hatSayisi');    if(el3) el3.value='1';
  const el4=document.getElementById('kuyuSayisi');   if(el4) el4.value='1';
  const el5=document.getElementById('kuyuMesafe');   if(el5) el5.value='150';
  const el6=document.getElementById('dmlLateralTip'); if(el6) el6.value='tek';

  S.gunlukSu=0; S.gunlukSuState='empty';
  S.basinc=0; S.basincState='empty';
  S.araziDonum=0; S.uretimTipi=''; S.urunTip=''; S.uzakNokta=0; S.kotFarki=0;
  S.kuyuDerinlik=0; S.dinamikSu=0; S.statikSu=0; S.kuyuDebi=0;
  S.kuyuSayisi=1; S.kuyuMesafe=150;
  S.trafoMesafe=0;
  clearProductionLayoutState();
  S.spAralikX=0; S.spAralikY=0; S.spDebi=0; S.spBasinc=0;
  S.dmlSiraArasi=0; S.dmlDamlAralik=0; S.dmlDamlDebi=0; S.dmlLateralLen=0;
  S.dmlBitkiArasi=0; S.dmlToplamSira=0; S.dmlTarlaEn=0; S.dmlTarlaBoy=0; S.dmlAgacDamlaAdet=0; S.dmlLateralTip='tek';
  S.advParamGirildi=false;
  S._duzenlemeModu=false;
  S._lastEngineResult=null;
  S._validation=null;
  S.selectedScenarioId='';
  S.selectedScenarioType='';
  S.bomAccordionOpen=false;

  setFieldState('basinc','','Boş – otomatik hesap aktif.');
  setFieldState('gunlukSu','','');
  document.getElementById('suPanel').style.display='none';
  document.getElementById('kotGrup').style.display='none';
  const validationPanel=document.getElementById('calcValidationPanel');
  if(validationPanel) validationPanel.style.display='none';
  document.getElementById('resultContent').innerHTML='';

  // Varsayılanları yeniden seç
  const defaults = { kuyuDurum:'mevcut', kurumaRisk:'yok', sulamaYontem:'yagmurlama',
    egimDurum:'duz', boruTip:'hdpe', teslimNokta:'direkt', sebekeDurum:'yok',
    sistemTercih:'solar', panelYer:'yer', oncelik:'guvenlik', kullanci:'kendisi' };
  Object.keys(defaults).forEach(k=>{
    const grp=document.getElementById('rb_'+k); if(!grp) return;
    grp.querySelectorAll('.rb').forEach(b=>b.classList.toggle('sel', b.dataset.val===defaults[k]));
    S[k]=defaults[k];
  });

  // Düzenleme modunda eklenmiş "Yeniden Hesapla" butonlarını temizle
  document.querySelectorAll('.btn-yeniden').forEach(b=>b.remove());

  renderProductOptions();
  renderProductionDetailFields();
  updateDripAdvancedUI();
  onAdv();
  renderBasincPanel();
  goTo(1);
}

/* INIT – ilk yüklemede panelleri render et */
setTimeout(function(){
  renderProductOptions();
  renderProductionDetailFields();
  renderBasincPanel();
  onAdv();
  chkSebeke();
}, 0);
