/* sulama-ui-results.js — Sonuç ekranı: renderSonuc, renderBomGroups, renderBomScenario, selectScenarioBom */

function escapeReportHtml(value){
  return String(value==null ? '' : value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function cleanReportText(value){
  return String(value==null ? '' : value).replace(/\s+/g,' ').trim();
}
function extractReportLabel(labelEl){
  if(!labelEl) return '';
  const clone = labelEl.cloneNode(true);
  clone.querySelectorAll('.tip,.req').forEach(function(node){ node.remove(); });
  return cleanReportText(clone.textContent);
}
function isFieldHiddenFromReport(el, section){
  let node = el ? el.parentElement : null;
  while(node && node!==section){
    if(node.hidden) return true;
    if(node.style && node.style.display==='none') return true;
    if(node.classList && node.classList.contains('dia') && !node.classList.contains('act')) return true;
    node = node.parentElement;
  }
  return false;
}
function findReportFieldLabel(el){
  const fg = el.closest('.fg');
  if(fg){
    const label = fg.querySelector('label');
    if(label) return extractReportLabel(label);
  }
  let prev = el.previousElementSibling;
  while(prev){
    if(prev.tagName==='LABEL') return extractReportLabel(prev);
    prev = prev.previousElementSibling;
  }
  return cleanReportText(el.getAttribute('aria-label') || el.name || el.id || 'Alan');
}
function readReportFieldValue(el){
  if(!el) return '';
  if(el.tagName==='SELECT'){
    const opt = el.options && el.selectedIndex>=0 ? el.options[el.selectedIndex] : null;
    const raw = opt ? opt.textContent : el.value;
    return cleanReportText(raw);
  }
  if(el.type==='checkbox') return el.checked ? 'Evet' : 'Hayir';
  if(el.type==='radio') return el.checked ? cleanReportText(el.value) : '';
  return cleanReportText(el.value);
}
function collectSectionInputs(sectionId, title){
  const section = document.getElementById(sectionId);
  if(!section) return null;
  const rows = [];
  const seen = new Set();
  function pushRow(label, value){
    const cleanLabel = cleanReportText(label);
    const cleanValue = cleanReportText(value);
    if(!cleanLabel || !cleanValue) return;
    const key = cleanLabel+'::'+cleanValue;
    if(seen.has(key)) return;
    seen.add(key);
    rows.push({ label:cleanLabel, value:cleanValue });
  }

  section.querySelectorAll('.rbg').forEach(function(group){
    if(isFieldHiddenFromReport(group, section)) return;
    const selected = group.querySelector('.rb.sel');
    if(!selected) return;
    const fg = group.closest('.fg');
    const label = fg ? extractReportLabel(fg.querySelector('label')) : '';
    pushRow(label || group.id || 'Secim', selected.textContent);
  });

  if(sectionId==='step1'){
    const dynMode = section.querySelector('.dtabs .dtab.sel');
    if(dynMode) pushRow('Dinamik su seviyesi modu', dynMode.textContent);
  }

  section.querySelectorAll('input, select, textarea').forEach(function(field){
    if(isFieldHiddenFromReport(field, section)) return;
    if(field.type==='button' || field.type==='submit' || field.type==='hidden') return;
    const value = readReportFieldValue(field);
    if(!value) return;
    pushRow(findReportFieldLabel(field), value);
  });

  return rows.length ? { title:title, rows:rows } : null;
}
function buildReportInputSummary(){
  const sections = [
    collectSectionInputs('step1','1. Kuyu Bilgileri'),
    collectSectionInputs('step2','2. Sulama ve Arazi'),
    collectSectionInputs('step3','3. Enerji ve Altyapi'),
    collectSectionInputs('step4','4. Sistem Hedefi')
  ].filter(Boolean);
  if(!sections.length) return '';
  return `
    <div class="bom-block">
      <div class="block-title">Proje girdi ozeti</div>
      <div class="block-sub">Yazdirma raporuna, formda aktif olan ve doldurulan tum giris alanlari otomatik eklenir.</div>
      ${sections.map(function(section){
        return `
          <div class="bom-scenario">
            <div class="bom-scenario-title">${escapeReportHtml(section.title)}</div>
            <div style="overflow-x:auto">
              <table class="cmp-tbl">
                <thead><tr><th>Girdi</th><th>Deger</th></tr></thead>
                <tbody>
                  ${section.rows.map(function(row){
                    return `<tr><td>${escapeReportHtml(row.label)}</td><td>${escapeReportHtml(row.value)}</td></tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}
function buildReportOutputSummary(model, recommended, selectedScenario, selectedBom){
  const activeScenario = selectedScenario || recommended;
  if(!activeScenario) return '';
  const enerjiMap = {
    solar:'Sadece gunes',
    hibrit:'Gunes + sebeke',
    sebeke:'Sadece sebeke'
  };
  const boruText = activeScenario.boru
    ? activeScenario.boru.d_mm+' mm'+(activeScenario.boru.ic_mm ? ' (ic ~'+activeScenario.boru.ic_mm+' mm)' : '')+' '+String(S.boruTip || '').toUpperCase()
    : '-';
  const rows = [
    ['Onerilen cozum', getScenarioDisplayName(recommended)],
    ['Yazdirilan senaryo', getScenarioDisplayName(activeScenario)],
    ['Durum', getTrafficLight(activeScenario).status],
    ['Gunluk su ihtiyaci', (S.gunlukSu || 0)+' ton/gun'],
    ['Saatlik hedef debi', (activeScenario.saatlikSis || 0).toFixed(1)+' m3/saat'],
    ['Giris zon/hat sayisi', (S.hatSayisi || 1)+' adet'],
    ['Hidrolik minimum zon', (activeScenario.hidrolikMinZon || 1)+' adet'],
    ['Uygulanan zon', (activeScenario.hidrolikAutoZon || activeScenario.nHat || 1)+' adet'],
    ['Pompa secimi', activeScenario.secPompGuc+' kW'+(activeScenario.nKuyu>1 ? ' x '+activeScenario.nKuyu : '')],
    ['Yuzey basinc ihtiyaci', activeScenario.hatBasiBar.toFixed(2)+' bar'],
    ['Toplam manometrik ihtiyac', activeScenario.toplamManometrikBar.toFixed(2)+' bar (~'+activeScenario.toplamManometrikM+' mSS)'],
    ['Ana boru', boruText],
    ['Enerji kurgusu', enerjiMap[S.sistemTercih] || cleanReportText(S.sistemTercih) || '-']
  ];
  if(selectedBom){
    rows.push(['Toplam boru', selectedBom.summary.totalPipe+' m']);
    rows.push(['Ana ekipman', selectedBom.summary.mainEquipment.join(', ')]);
  }
  return `
    <div class="bom-block">
      <div class="block-title">Hesap cikti ozeti</div>
      <div class="block-sub">Bu tabloda yazdirilan raporun ana hidrolik ve ekipman ciktilari tek yerde toplanir.</div>
      <div class="bom-scenario">
        <div class="bom-scenario-title">${escapeReportHtml(getScenarioDisplayName(activeScenario))}</div>
        <div style="overflow-x:auto">
          <table class="cmp-tbl">
            <thead><tr><th>Cikti</th><th>Deger</th></tr></thead>
            <tbody>
              ${rows.map(function(row){
                return `<tr><td>${escapeReportHtml(row[0])}</td><td>${escapeReportHtml(row[1])}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${(activeScenario.hidrolikAutoZon || 1)>(S.hatSayisi || 1)
          ? `<div class="assist-note" style="margin-top:10px"><div class="assist-note-title">Otomatik zon duzeltmesi</div><div class="assist-note-body">Girilen ${S.hatSayisi || 1} zon degeri hidrolik olarak yetmedigi icin rapor ${activeScenario.hidrolikAutoZon || 1} zon uzerinden yorumlanmistir.</div></div>`
          : ''}
      </div>
    </div>`;
}

function renderSonuc(engineResult){
  const adSoyad = document.getElementById('adSoyad').value || '';
  const tarih = new Date().toLocaleDateString('tr-TR');
  const isSolar = S.sistemTercih !== 'sebeke';
  const model = buildSalesModel(engineResult);
  const onerilen = model.recommended;
  const validation = model.validation;
  const ikon = {krit:'✗', warn:'⚠ ', info:'ℹ', ok:'✓'};
  const recBom = model.recommendedBom;
  const _explicitSel = model.visibleScenarios.find(s=>s.tipi===S.selectedScenarioType) || null;
  const selectedScenario = _explicitSel || onerilen;  // Varsayılan: önerilen senaryo
  const _isExplicitSelection = !!_explicitSel;
  const selectedBom = selectedScenario && model.bomByScenario ? model.bomByScenario[selectedScenario.tipi] : null;
  const shareScenario = selectedScenario || onerilen;
  const shareBom = selectedBom || recBom;
  const bomBtnClass = S.bomAccordionOpen ? 'acc-btn open' : 'acc-btn';
  const bomContentClass = S.bomAccordionOpen ? 'acc-content open' : 'acc-content';
  const reportToolsHtml = `
    <div class="bom-tools print-hide" style="margin:0 0 14px 0">
      <button class="tool-btn pri" type="button" onclick="window.print()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Tam raporu yazdir / PDF al
      </button>
      <div class="tool-btn" style="cursor:default">
        Girdiler + hesap ciktilari + malzeme listesi birlikte yazdirilir
      </div>
    </div>`;
  const inputSummaryHtml = buildReportInputSummary();
  const outputSummaryHtml = buildReportOutputSummary(model, onerilen, selectedScenario, selectedBom);

  function renderBomGroups(groups){
    const tagHtml = item => {
      const map = {
        exact:{cls:'exact',label:'kesin'},
        approx:{cls:'approx',label:'yaklaşık'},
        optional:{cls:'opt',label:'opsiyon'},
        survey:{cls:'survey',label:'keşifle netleşir'}
      };
      const meta = map[item.tag || 'exact'] || map.exact;
      return `<span class="bom-tag ${meta.cls}">${meta.label}</span>`;
    };
    return groups.map(group=>`
      <div class="bom-cat-title">${group.title}</div>
      <div style="overflow-x:auto">
        <table class="cmp-tbl">
          <thead><tr><th>Malzeme</th><th>Miktar</th><th>Açıklama</th></tr></thead>
          <tbody>
            ${group.items.map(item=>`
              <tr>
                <td>${item.material}${tagHtml(item)}</td>
                <td style="white-space:nowrap">${item.quantity}</td>
                <td>${item.note}${(item.approx || item.survey)?`<div class="bom-note">${item.approxHint || (item.survey ? 'Keşif ve yerleşim planı ile netleşir.' : 'Ön kabul ile hesaplandı, detay proje ile netleşir.')}</div>`:''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');
  }
  function renderBomScenario(bom, title){
    const traffic = getTrafficLight(bom.scenario);
    return `
      <div class="bom-scenario">
        <div class="bom-scenario-title">${title}</div>
        <div class="bom-scenario-sub">${traffic.icon} ${traffic.status} · ${bom.summary.pumpText} · ${bom.summary.totalPipe} m toplam boru</div>
        ${renderBomGroups(bom.groups)}
        ${bom.warnings.length ? `<div class="assist-note" style="margin-top:10px"><div class="assist-note-title">Akıllı uyarılar</div><div class="assist-note-body">${bom.warnings.join(' ')}</div></div>` : ''}
        ${bom.assumptions.length ? `<div class="bom-caption"><b>Varsayımlar / açıklamalar:</b> ${bom.assumptions.join(' ')}</div>` : ''}
      </div>`;
  }

  const heroHtml = `
    <div class="hero-block">
      <div class="hero-badge">Sana en uygun önerilen sistem</div>
      <div class="hero-lead">Çiftçi özeti</div>
      <div class="hero-title">${getScenarioDisplayName(onerilen)}</div>
      <div class="hero-why"><b>${model.headline}</b></div>
      <div class="hero-benefit">${model.whyLead} ${model.shortComment}</div>
      <div class="hero-grid">
        ${model.stats.map(item=>`
          <div class="hero-stat">
            <div class="hero-stat-label">${item.label}</div>
            <div class="hero-stat-value">${item.value}</div>
            <div class="hero-stat-note">${item.note}</div>
          </div>
        `).join('')}
      </div>
    </div>`;

  // ── AKILLI KARAR / OVERRIDE PANELİ ───────────────────────────────
  const overrideData = (selectedBom && selectedBom.override && selectedBom.override.applied)
    ? selectedBom.override
    : (recBom && recBom.override && recBom.override.applied ? recBom.override : null);
  const overrideHtml = overrideData ? (function(){
    const changeIcon = {
      cikarildi:'✗',
      eklendi:'+',
      korundu:'●',
      dusuruldu:'▼',
      arttirildi:'▲',
      artis:'▲'
    };
    const changeCls = {
      cikarildi:'rm',
      eklendi:'add',
      korundu:'keep',
      dusuruldu:'down',
      arttirildi:'up',
      artis:'up'
    };
    return `
    <div class="override-block" role="region" aria-label="Akıllı sistem uyarısı">
      <div class="override-head">
        <div class="override-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div class="override-head-text">
          <div class="override-badge">Akıllı Karar Motoru · Kural ${overrideData.kuralNo}</div>
          <div class="override-title">Sistem Otomatik Revize Edildi</div>
          <div class="override-sub">Girdiğin yöntem ile bitki/arazi uyuşmadığı için mühendislik standartları devreye girdi.</div>
        </div>
      </div>

      <div class="override-flow">
        <div class="override-flow-item was">
          <div class="override-flow-label">Senin seçimin</div>
          <div class="override-flow-value">${overrideData.originalMethod}</div>
        </div>
        <div class="override-flow-arrow">→</div>
        <div class="override-flow-item now">
          <div class="override-flow-label">Uygulanan standart</div>
          <div class="override-flow-value">${overrideData.newStandard}</div>
        </div>
      </div>

      <div class="override-reason">
        <b>Neden:</b> ${overrideData.reason}
      </div>

      <div class="override-changes-title">Sistemde yapılan değişiklikler</div>
      <div class="override-changes">
        ${overrideData.equipmentChanges.map(c=>`
          <div class="override-change ${changeCls[c.tip]||'keep'}">
            <span class="ov-ico">${changeIcon[c.tip]||'•'}</span>
            <span class="ov-txt">${c.metin}</span>
          </div>
        `).join('')}
      </div>

      <div class="override-pressure">
        <span class="override-pressure-label">Yeni çalışma basıncı:</span>
        <span class="override-pressure-value">${overrideData.pressureBar}</span>
      </div>

      <div class="override-note">${overrideData.uyariMetni}</div>
    </div>`;
  })() : '';
  const validationHtml = validation ? `
    <div class="validation-panel is-${validation.level}">
      <div class="validation-head">
        <div>
          <div class="validation-title">${validation.title}</div>
          <div class="validation-sub">${validation.summary}</div>
        </div>
        <span class="validation-badge ${validation.level==='ready' ? 'ready' : validation.level==='blocked' ? 'blocked' : 'provisional'}">${validation.badgeLabel}</span>
      </div>
      <div class="validation-list">
        ${validation.blockers.map(msg=>`<div class="validation-item bad"><strong>Kritik:</strong> ${msg}</div>`).join('')}
        ${validation.warnings.slice(0,5).map(msg=>`<div class="validation-item warn"><strong>Uyari:</strong> ${msg}</div>`).join('')}
        ${!validation.blockers.length && !validation.warnings.length ? '<div class="validation-item ok"><strong>Kontrol:</strong> Cakisan veri tespit edilmedi.</div>' : ''}
      </div>
      <div class="validation-sub" style="margin-top:10px">Veri onceligi: uretim karti > hassas ayar > varsayimlar</div>
    </div>` : '';

  const bomSummaryHtml = `
    <div id="bomAnchor" class="bom-block">
      <div class="block-title">Detaylı malzeme listesi</div>
      <div class="block-sub">${selectedBom ? selectedBom.summary.statusText : 'Önerilen sistem için malzeme listesi aşağıda. Farklı bir kart seçin.'} Fiyat için keşif gereklidir.</div>
      ${selectedBom ? `
        <div class="bom-summary-grid">
          <div class="bom-summary-item">
            <div class="bom-summary-label">Aktif çözüm</div>
            <div class="bom-summary-value">${getScenarioDisplayName(selectedScenario)}</div>
            <div class="bom-summary-note">${getWellLayoutText(selectedScenario)} · ${getOperationText(selectedScenario)}</div>
          </div>
          <div class="bom-summary-item">
            <div class="bom-summary-label">Toplam pompa</div>
            <div class="bom-summary-value">${selectedBom.summary.pumpText}</div>
            <div class="bom-summary-note">Pompa, koruma ve kuyu ekipmanları dahil.</div>
          </div>
          <div class="bom-summary-item">
            <div class="bom-summary-label">Toplam boru</div>
            <div class="bom-summary-value">${selectedBom.summary.totalPipe} m</div>
            <div class="bom-summary-note">Ana hat + sulama hattı toplamı.</div>
          </div>
        </div>
        <div class="bom-equip-list">
          ${selectedBom.summary.mainEquipment.map(item=>`<span class="bom-chip">${item}</span>`).join('')}
        </div>
      ` : '<div class="bom-empty">Onerilen rozet secili anlamina gelmez. Malzeme listesini acmak icin bir kart secin; her seferinde yalnizca secili senaryonun listesi gosterilir.</div>'}
      <div class="bom-caption">${model.cost.salesText} ${model.cost.relativeComment}</div>
    </div>`;

  const whyHtml = `
    <div class="why-block">
      <div class="block-title">Bu sistem neden uygun</div>
      <div class="block-sub">${farmerWhy(onerilen)}</div>
      <div class="why-grid">
        ${model.whyCards.map(item=>`
          <div class="why-card">
            <div class="why-card-title">${item.title}</div>
            <div class="why-card-body">${item.body}</div>
          </div>
        `).join('')}
      </div>
    </div>`;

  const tlHtml = `
    <div class="tl-block ${model.tl.cls}">
      <div class="tl-icon">${model.tl.icon}</div>
      <div class="tl-content">
        <div class="tl-status">${model.tl.status}</div>
        <div class="tl-desc">${model.tl.desc} Bu sistem ${model.tl.status==='Uygun'?'uygundur':model.tl.status==='Sınırda'?'sınırdadır':'risklidir'}.</div>
      </div>
    </div>`;

  // Anchor-bilinçli uyarı render yardımcısı
  // Belirli bir anchor'a ait uyarıları inline panel olarak render eder.
  const usedAnchors = new Set();
  function renderAnchoredAlerts(anchor, opts){
    const list = (model.alertsByAnchor && model.alertsByAnchor[anchor]) || [];
    const filtered = opts && opts.filterTip ? list.filter(u=>u.tip===opts.filterTip) : list;
    if(!filtered.length) return '';
    filtered.forEach(u=>{ usedAnchors.add(u); });
    const headline = opts && opts.headline;
    return `
      <div class="anchor-alerts ${opts && opts.compact ? 'compact' : ''}">
        ${headline ? `<div class="anchor-alerts-head">${headline}</div>` : ''}
        ${filtered.map(u=>`
          <div class="anchor-alert ${u.tip}">
            <span class="aa-ico">${ikon[u.tip]||'•'}</span>
            <span class="aa-txt">${u.mesaj}</span>
          </div>
        `).join('')}
      </div>`;
  }

  // ── KRİTİK UYARILAR — hero'dan hemen sonra, ana akışta (accordion dışında) ──
  // Çiftçi zon/kuyu/debi/basınç'a dair KRİTİK (krit) uyarıları yukarıda görmeli.
  // warn/info uyarıları detay accordion içinde ilgili bölüm altına gider.
  const criticalAlerts = (model.alertsAll || []).filter(u=>u.tip==='krit');
  criticalAlerts.forEach(u=>usedAnchors.add(u));
  const criticalHtml = criticalAlerts.length ? `
    <div class="critical-alerts">
      <div class="critical-alerts-head">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Acil dikkat edilmesi gerekenler</span>
      </div>
      ${criticalAlerts.map(u=>{
        const loc = {well:'Kuyu', flow:'Debi', zone:'Zon', pressure:'Basınç', layout:'Yerleşim', pipe:'Boru', water:'Su'}[u.anchor||''] || 'Genel';
        return `
          <div class="critical-alert">
            <span class="ca-badge">${loc}</span>
            <span class="ca-txt">${u.mesaj}</span>
          </div>
        `;
      }).join('')}
    </div>` : '';

  // Detay accordion içine yerleştirilecek ANCHOR uyarıları (warn + info)
  const wellAlertsHtml     = renderAnchoredAlerts('well',     {headline:'Kuyu ile ilgili notlar', compact:true});
  const flowAlertsHtml     = renderAnchoredAlerts('flow',     {headline:'Su verme / debi notları', compact:true});
  const zoneAlertsHtml     = renderAnchoredAlerts('zone',     {headline:'Zon / hat planı notları', compact:true});
  const pressureAlertsHtml = renderAnchoredAlerts('pressure', {headline:'Basınç notları', compact:true});
  const pipeAlertsHtml     = renderAnchoredAlerts('pipe',     {headline:'Boru metrajı notları', compact:true});
  const waterAlertsHtml    = renderAnchoredAlerts('water',    {headline:'Günlük su / süre notları', compact:true});
  // Layout (agronomik) ana akışta kalsın — kullanıcı "1m sıra arası" gibi girdiyi hemen görmeli
  const layoutAlertsHtml   = renderAnchoredAlerts('layout',   {headline:'Yerleşim ve agronomik kontrol'});

  // Geri kalan (anchor'suz veya 'general') uyarılar → en sondaki toplu panel
  const remainingAlerts = (model.alertsAll || []).filter(u=>!usedAnchors.has(u));
  const uyariHtml = remainingAlerts.length ? `
    <div class="assist-note">
      <div class="assist-note-title">Genel kurulum notları</div>
      <div class="assist-note-body">Aşağıdaki notlar sistemi daha güvenli ve daha uzun ömürlü kurmanıza yardım eder.</div>
    </div>
    <div class="warn-list">
      ${remainingAlerts.map(u=>`<div class="warn-item ${u.tip}"><span class="wi-ico">${ikon[u.tip]||'–'}</span><span>${u.mesaj}</span></div>`).join('')}
    </div>` : '';

  const optionEntryMap = new Map();
  function addOptionEntry(scenario, role){
    if(!scenario) return;
    const id = scenario.tipi;
    if(!optionEntryMap.has(id)) optionEntryMap.set(id,{scenario, id, roles:[], badges:[]});
    const entry = optionEntryMap.get(id);
    if(entry.roles.indexOf(role)===-1) entry.roles.push(role);
    let badge = {cls:'rec', text:'Onerilen'};
    if(role==='eco') badge = {cls:scenario===onerilen ? 'same' : 'eco', text:scenario===onerilen ? 'Ekonomik avantaj da burada' : 'Daha ekonomik'};
    if(role==='safe') badge = {cls:scenario===onerilen ? 'same' : 'safe', text:scenario===onerilen ? 'Guven avantaji da burada' : 'Daha guvenli'};
    if(!entry.badges.some(item=>item.text===badge.text)) entry.badges.push(badge);
  }
  addOptionEntry(onerilen,'rec');
  addOptionEntry(model.economic,'eco');
  addOptionEntry(model.safer,'safe');
  const optionEntries = Array.from(optionEntryMap.values());
  const optsHtml = `
    <div class="opts-wrap">
      <div class="opts-head">Alternatif çözümler</div>
      <div class="opts-sub">Önce bir çözüm seçin. Detaylı malzeme listesi sadece seçilen kart için gösterilir.</div>
      <div class="opts-grid">
        ${optionEntries.map(entry=>{
          const s = entry.scenario;
          const t = getTrafficLight(s);
          const bom = model.bomByScenario ? model.bomByScenario[s.tipi] : null;
          const isActive = S.selectedScenarioType===s.tipi || S.selectedScenarioId===entry.id
            || (!_isExplicitSelection && s===onerilen);  // Secim yoksa onerilen aktif
          const isRecommended = entry.roles.indexOf('rec')!==-1;
          const commentRole = isRecommended ? 'rec' : entry.roles.indexOf('eco')!==-1 ? 'eco' : 'safe';
          return `
            <button type="button" class="opt-card ${isRecommended?'is-rec':''} ${isActive?'is-active':''}" onclick="selectScenarioBom('${entry.id}','${s.tipi}')">
              ${entry.badges.map(badge=>`<span class="opt-badge ${badge.cls}">${badge.text}</span>`).join('')}
              ${isActive?'<span class="opt-badge active">aktif liste</span>':''}
              <div class="opt-title">${getScenarioDisplayName(s)}</div>
              <div class="opt-row"><span class="orl">Pompa</span><span class="orv">${s.secPompGuc} kW${s.nKuyu>1?' x '+s.nKuyu:''}</span></div>
              <div class="opt-row"><span class="orl">Kuyu düzeni</span><span class="orv">${getWellLayoutText(s)}</span></div>
              <div class="opt-row"><span class="orl">Çalışma</span><span class="orv">${getOperationText(s)}</span></div>
              <div class="opt-row"><span class="orl">Ana boru</span><span class="orv">${bom ? bom.summary.mainPipe : 0} m</span></div>
              <div class="opt-mini">
                ${bom ? `<span class="opt-chip">${bom.summary.pumpText}</span>` : ''}
                ${bom ? `<span class="opt-chip">${bom.summary.totalPipe} m boru</span>` : ''}
                ${bom && bom.summary.approxCount ? '<span class="opt-chip">Ön kabul var</span>' : ''}
              </div>
              <div class="opt-status ${t.cls}">${t.icon} ${t.status}</div>
              <div class="opt-comment">${salesOptionComment(s, commentRole, model)}</div>
              <div class="opt-action">${isActive ? 'Bu çözüme ait malzeme listesi aşağıda açık.' : 'Bu çözümü seç ve malzeme listesini gör'}</div>
            </button>`;
        }).join('')}
      </div>
    </div>`;

  const bomDetayHtml = selectedBom ? `
    <div class="bom-tools print-hide">
      <button class="tool-btn pri" type="button" onclick="window.print()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Yazdır / PDF al
      </button>
      <button class="tool-btn" type="button" id="waBtnBom">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
        WhatsApp özeti gönder
      </button>
    </div>
    ${renderBomScenario(selectedBom,getScenarioDisplayName(selectedScenario)+' için malzeme listesi')}
  ` : '<div class="bom-empty">Bir çözüm seçildiğinde malzeme listesi burada gösterilir.</div>';

  const detayIcerik = `
    <h4>Basit Basınç Özeti</h4>
    <div class="press-table" style="margin:0 0 8px 0;background:#040210">
      <div class="press-row"><div class="press-label"><div>Sulama ekipmanının ihtiyacı<span class="press-sub">${YB[S.sulamaYontem].ad} sistemi çalışma basıncı</span></div></div><div class="press-val">${onerilen.sistBasinc.toFixed(2)} bar</div></div>
      <div class="press-row add"><div class="press-label"><div>Arazi ve boru nedeniyle ek ihtiyaç<span class="press-sub">${onerilen.uzakKullanilan||S.uzakNokta||150} m hat${onerilen.uzakRevised?' <b style="color:var(--or)">(girilen '+onerilen.uzakRaw+'m geometri nedeniyle revize edildi)</b>':''}${onerilen.kotBar>0?' + '+S.kotFarki+' m kot farkı':''}</span></div></div><div class="press-val">+ ${(onerilen.kayip+onerilen.kotBar).toFixed(2)} bar</div></div>
      <div class="press-row total"><div class="press-label"><div>Pompanın üretmesi gereken toplam</div></div><div class="press-val">${onerilen.hatBasiBar.toFixed(2)} bar</div></div>
      <div class="press-row total"><div class="press-label"><div>Yuzey basinc ihtiyaci</div></div><div class="press-val">${onerilen.hatBasiBar.toFixed(2)} bar</div></div>
      <div class="press-row add"><div class="press-label"><div>Kuyu kaldirma yuksekligi<span class="press-sub">Dinamik su ${Math.round(model.ds)} m + 5 m guvenlik</span></div></div><div class="press-val">+ ${(onerilen.pompaDer/10.2).toFixed(2)} bar</div></div>
      <div class="press-row total"><div class="press-label"><div>Toplam manometrik ihtiyac<span class="press-sub">Yaklasik ${onerilen.toplamManometrikM} mSS</span></div></div><div class="press-val">${onerilen.toplamManometrikBar.toFixed(2)} bar</div></div>
    </div>
    <p style="font-style:italic;color:${onerilen.basincDurum==='ok'?'var(--gr)':onerilen.basincDurum==='kritik'?'var(--re)':'var(--or)'}">${onerilen.basincYorumFarmer}</p>
    ${pressureAlertsHtml}

    <h4>Su Verme Durumu</h4>
    ${onerilen.debiDurum==='unknown'
      ? '<p>Kuyu debisi girilmedi. Sondaj raporu paylaşılırsa sistem su verme yeterliliğini daha net kontrol eder.</p>'
      : `<p><b style="color:${onerilen.debiDurum==='ok'?'var(--gr)':onerilen.debiDurum==='border'?'var(--or)':'var(--re)'}">${onerilen.debiDurum==='ok'?'Uygun':'Sınırda / dikkatli takip'}</b> – ${onerilen.debiMesaj}</p>
         ${onerilen.debiOneriler.length?`<p><b style="color:var(--gold-l)">Öneri:</b> ${onerilen.debiOneriler.join(' · ')}</p>`:''}` }
    ${flowAlertsHtml}
    ${waterAlertsHtml}

    <h4>Bölüm / Zon Önerisi</h4>
    <p>${model.zon.yorum} ${model.zon.tip==='tahmini'
      ? '<span style="color:var(--or);font-weight:700">(ön öneri)</span>'
      : '<span style="color:var(--gr);font-weight:700">(gelişmiş hesap)</span>'}</p>
    <p>${model.zon.teknik}</p>
    ${zoneAlertsHtml}

    <h4>Alternatif Çözümler Özeti</h4>
    <p>Arka planda ${model.scenarios.length} farklı kurulum denendi. Kullanıcıya gösterilen mantıklı seçenekler şunlar:</p>
    <ul style="font-size:12px;color:var(--tx2);padding-left:18px;line-height:1.7">
      ${model.visibleScenarios.map(s=>{
        const t=getTrafficLight(s);
        return `<li>${t.icon} <b style="color:${s===onerilen?'var(--gold-l)':'var(--tx)'}">${getScenarioDisplayName(s)}</b> – ${getWellLayoutText(s)} · ${getOperationText(s)} · ${t.status}</li>`;
      }).join('')}
    </ul>

    <h4>Kuyu ve Pompa Notu</h4>
    <p>Pompa dalış derinliği: <b>${onerilen.pompaDer} m</b> (dinamik su ${Math.round(model.ds)} m + 5 m güvenlik)<br>
    Ana hat boru çapı: <b>DN${onerilen.boru.d_mm}</b> · Boru tipi: ${S.boruTip.toUpperCase()}</p>
    ${wellAlertsHtml}
    ${pipeAlertsHtml}`;

  const detayIcerikFinal = detayIcerik
    .replace(`<div class="press-row total"><div class="press-label"><div>PompanÄ±n Ã¼retmesi gereken toplam</div></div><div class="press-val">${onerilen.hatBasiBar.toFixed(2)} bar</div></div>`, '')
    .replace('DN'+onerilen.boru.d_mm, onerilen.boru.d_mm + ' mm' + (onerilen.boru.ic_mm ? ' (ic ~'+onerilen.boru.ic_mm+' mm)' : ''))
    + `<p><b>Yuzey basinc ihtiyaci:</b> ${onerilen.hatBasiBar.toFixed(2)} bar<br><b>Toplam manometrik ihtiyac:</b> ${onerilen.toplamManometrikBar.toFixed(2)} bar (${onerilen.toplamManometrikM} mSS)</p>`;

  const muhIcerik = `
    <h4>Senaryo Karşılaştırması</h4>
    <div style="overflow-x:auto">
      <table class="cmp-tbl">
        <thead><tr><th>Senaryo</th><th>Karar</th><th>Güven</th><th>Pompa</th><th>Basınç</th><th>Debi</th></tr></thead>
        <tbody>
          ${model.scenarios.map(s=>`<tr class="${s===onerilen?'is-rec':''}">
            <td>${getScenarioDisplayName(s)}${s===onerilen?' "…':''}</td>
            <td style="text-align:center">${s.kararPuani}</td>
            <td style="text-align:center">${s.guvenSkoru}</td>
            <td style="text-align:center">${s.secPompGuc} kW${s.nKuyu>1?' x '+s.nKuyu:''}</td>
            <td style="text-align:center;color:${s.ventilGer?'var(--re)':'var(--gr)'}">${s.hatBasiBar.toFixed(2)}</td>
            <td style="text-align:center;color:${s.debiDurum==='ok'?'var(--gr)':s.debiDurum==='border'?'var(--or)':s.debiDurum==='bad'?'var(--re)':'var(--tx3)'}">${s.debiDurum==='ok'?'✓':s.debiDurum==='border'?'⚠ ':s.debiDurum==='bad'?'✗':'–'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <h4>Karar Motoru</h4>
    <p>Karar puanı; teknik uygunluk, güven, işletme rahatlığı ve ekonomi dengesine göre ağırlıklı hesaplandı. Maliyet etkisi özellikle düşük tutuldu.</p>
    <h4>Hesap Prensipleri</h4>
    <p>"¢ <b>Hat kaybı:</b> Hazen-Williams formülü (C=140, HDPE)<br>
    "¢ <b>Pompa verimi:</b> η = 0.65 (submersible ortalama)<br>
    "¢ <b>Emniyet payı:</b> x1.25<br>
    "¢ <b>Panel gücü:</b> ${onerilen.pW} W (${S.oncelik} önceliği)<br>
    "¢ <b>Güneş verisi:</b> ${GP[S.ilSecim]} kWh/m²/gün (${S.ilSecim})</p>
    <h4>Risk Değerlendirmesi</h4>
    <p>Kuyular arası mesafe: <b>${S.kuyuMesafe} m</b> "†’ ${onerilen.interferans==='kritik'?'<span style="color:var(--re)">kritik</span>':onerilen.interferans==='orta'?'<span style="color:var(--or)">sınırda</span>':'<span style="color:var(--gr)">uygun</span>'}</p>
    <p>Kuru çalışma payı: <b>${onerilen.kurumaPayi!==null?onerilen.kurumaPayi+' m':'hesaplanamadı'}</b></p>
    <h4>Maliyet Güven Seviyesi</h4>
    <p><b>${model.cost.badge}</b> – ${model.cost.salesText}</p>
    <ul style="font-size:12px;color:var(--tx2);padding-left:18px;line-height:1.7">
      ${model.cost.blockers.map(item=>`<li>${item}</li>`).join('')}
    </ul>
    <p style="font-size:11px;color:var(--tx3);font-style:italic">${model.cost.relativeComment}</p>
    <h4>Kullanılan Varsayımlar</h4>
    <ul style="font-size:12px;color:var(--tx2);padding-left:18px;line-height:1.7">
      ${(model.assumptions.length?model.assumptions:['Ek varsayım yok.']).map(item=>`<li>${item}</li>`).join('')}
    </ul>`;

  const fiyatHtml = `
    <div class="price-block">
      <div class="price-icon">📋</div>
      <div>
        <span class="price-badge ${model.cost.level}">${model.cost.badge}</span>
        <div class="price-title">Fiyat / Teklif Bilgisi</div>
        <div class="price-body"><b>${model.cost.salesText}</b> ${model.cost.secondaryText} ${model.cost.relativeComment}</div>
      </div>
    </div>`;

  const waParts = [
    'Merhaba Bircan Elektrik,', '',
    'Sulama analiz talebi:',
    'Müşteri: ' + (adSoyad || 'Belirtilmedi'),
    'Arazi: ' + S.araziDonum + ' dönüm · ' + S.sulamaYontem,
    'Kuyu: ' + S.kuyuDerinlik + ' m derinlik · dinamik ' + Math.round(model.ds) + ' m',
    'Günlük su: ' + S.gunlukSu + ' ton',
    '',
    'Seçili çözüm: ' + getScenarioDisplayName(shareScenario),
    'Pompa: ' + shareScenario.secPompGuc + ' kW' + (shareScenario.nKuyu>1 ? ' x ' + shareScenario.nKuyu : ''),
    'Toplam basınç: ' + shareScenario.hatBasiBar.toFixed(2) + ' bar',
    (shareBom ? 'Malzeme özeti: ' + shareBom.summary.pumpText + ' · ' + shareBom.summary.totalPipe + ' m boru' : ''),
    (shareBom ? 'Ana ekipman: ' + shareBom.summary.mainEquipment.join(', ') : ''),
    (isSolar ? 'Solar: ' + shareScenario.totKwp + ' kWp' : 'Enerji: şebeke'),
    'Durum: ' + (selectedScenario ? getTrafficLight(selectedScenario).status : model.tl.status),
    'Fiyat: ' + model.cost.salesText,
    '',
    'Keşif tarihi için iletişime geçmek istiyorum.'
  ];
  const waMsg = encodeURIComponent(waParts.join('\n'));

  document.getElementById('resultContent').innerHTML = `
    <div style="margin-bottom:14px">
      <div class="stitle">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Sulama Analiz Raporu
      </div>
      <div class="ssub">${adSoyad?adSoyad+' – ':''}${tarih} – Çiftçi özeti + mühendislik arka planı</div>
    </div>
    ${reportToolsHtml}
    ${inputSummaryHtml}
    ${outputSummaryHtml}
    ${heroHtml}
    ${overrideHtml}
    ${validationHtml}
    ${whyHtml}
    ${tlHtml}
    ${criticalHtml}
    ${layoutAlertsHtml}
    ${uyariHtml}
    ${optsHtml}
    ${bomSummaryHtml}
    <button class="${bomBtnClass}" onclick="toggleAcc(this)"><span>Detaylı malzeme listesi</span><span class="acc-caret">"▶</span></button>
    <div class="${bomContentClass}">${bomDetayHtml}</div>
    <button class="acc-btn" onclick="toggleAcc(this)"><span>Detayı Gör</span><span class="acc-caret">"▶</span></button>
    <div class="acc-content">${detayIcerikFinal}</div>
    <button class="acc-btn" onclick="toggleAcc(this)"><span>Teknik Detaylar</span><span class="acc-caret">"▶</span></button>
    <div class="acc-content">${muhIcerik}</div>
    ${fiyatHtml}
    <div class="legal">
      <b>⚠– Uyarı ve Sorumluluk Reddi</b>
      Bu rapor bir <b>ön mühendislik analizidir</b>. Fiyat ancak yeterli veri ve saha keşfi ile netleşir.
      Çoklu kuyu, depo ve yeni sondaj senaryolarında izin, etüt ve saha teyidi gerekir.
      Bircan Elektrik bu ön analizden doğrudan hukuki sorumluluk kabul etmez.
    </div>
    <button class="wa-btn" id="waBtnResult">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp – Özet + Malzeme Gönder
    </button>
    <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
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
    if(btn) btn.onclick=function(){window.open('https://api.whatsapp.com/send?phone=905340140949&text='+waMsg,'_blank');};
    var bomBtn=document.getElementById('waBtnBom');
    if(bomBtn) bomBtn.onclick=function(){window.open('https://api.whatsapp.com/send?phone=905340140949&text='+waMsg,'_blank');};
  },50);
}

function selectScenarioBom(cardId, scenarioType){
  S.selectedScenarioId = cardId || '';
  S.selectedScenarioType = scenarioType || '';
  S.bomAccordionOpen = true;
  if(S._lastEngineResult) renderSonuc(S._lastEngineResult);
  setTimeout(function(){
    var anchor=document.getElementById('bomAnchor');
    if(anchor) anchor.scrollIntoView({behavior:'smooth', block:'start'});
  },40);
}

/* Akordeon toggle */
function toggleAcc(btn){
  btn.classList.toggle('open');
  const content=btn.nextElementSibling;
  if(content && content.classList.contains('acc-content')) content.classList.toggle('open');
  if(btn.textContent && btn.textContent.indexOf('Detaylı malzeme listesi')!==-1){
    S.bomAccordionOpen = btn.classList.contains('open');
  }
}

/* "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•
   PARÇA 5 – NAVİGASYON + ANALİZ + DÜZENLE + INIT
   "•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"•"• */

/* Navigasyon */
function goTo(n){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('act'));
  document.getElementById('step'+n).classList.add('act');
  for(let i=1;i<=5;i++){
    const sc=document.getElementById('sc'+i), sl=document.getElementById('sl'+i); if(!sc) continue;
    const dn = n===5?6:n;
    sc.className='sc '+(i<dn?'done':i===dn?'act':'off');
    sl.className='sl '+(i<dn?'done':i===dn?'act':'off');
    if(i<dn) sc.textContent='✓';
    else if(i===5) sc.textContent='✓';
    else sc.textContent=i;
  }
  window.scrollTo({top:0,behavior:'smooth'});
}
function step1To2(){
  S.kuyuDerinlik=parseFloat(document.getElementById('kuyuDerinlik').value)||0;
  S.statikSu=parseFloat(document.getElementById('statikSu').value)||0;
  S.dinamikSu=parseFloat(document.getElementById('dinamikSu').value)||0;
  S.kuyuDebi=parseFloat(document.getElementById('kuyuDebi').value)||0;
  S.kuyuSayisi=parseInt(document.getElementById('kuyuSayisi').value)||1;
  S.kuyuMesafe=parseFloat(document.getElementById('kuyuMesafe').value)||150;
  const kd=S.kuyuDerinlik, ds=getDin();
  if(!kd){ alert('Lütfen kuyu derinliğini giriniz.'); return; }
  if(S.dmod==='biliyorum' && !ds){ alert('Lütfen dinamik su seviyesini giriniz veya "Bilmiyorum" seçiniz.'); return; }
  if(S.dmod==='biliyorum' && ds>=kd){ alert('Dinamik su ('+ds+'m) kuyu derinliğinden ('+kd+'m) büyük olamaz!'); return; }
  if(S.dmod==='biliyorum' && S.statikSu>0 && ds<=S.statikSu){ alert('Dinamik su statik sudan büyük olmalıdır. Lütfen veriyi kontrol edin.'); return; }
  goTo(2); renderSuPanel(); renderBasincPanel();
}
function step2To3(){
  const gs=parseFloat(document.getElementById('gunlukSu').value)||0;
  if(!gs){ alert('Lütfen günlük su ihtiyacını giriniz veya tahmini uygulayın.'); return; }
  S.gunlukSu=gs;
  S.araziDonum=parseFloat(document.getElementById('araziDonum').value)||0;
  S.uretimTipi=document.getElementById('uretimTipi')?.value || S.uretimTipi || '';
  if(!S.araziDonum){ alert('Lütfen arazi büyüklüğünü (dönüm) giriniz.'); return; }
  if(!S.uretimTipi){ alert('Lütfen üretim / arazi düzeni tipini seçiniz.'); return; }
  goTo(3);
}

/* ANA ANALİZ – tüm state'i senkronlayıp senaryoları üretir */
