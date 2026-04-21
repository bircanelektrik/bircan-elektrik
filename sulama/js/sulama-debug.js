/* sulama-debug.js — Geliştirici debug modu
   Kullanım: URL'e ?debug=1 ekle veya console'da SULAMA_DEBUG=true yaz */

(function(){
  'use strict';

  const DEBUG = (
    window.SULAMA_DEBUG === true ||
    new URLSearchParams(window.location.search).get('debug') === '1'
  );

  if (!DEBUG) {
    // Production: tüm debug fonksiyonları no-op
    var noop = function(){};
    window.dbg = {
      log: noop, warn: noop, group: noop, groupEnd: noop,
      state: noop, formula: noop, bom: noop, validation: noop
    };
    return;
  }

  // Debug panelini DOM'a ekle
  const panel = document.createElement('div');
  panel.className = 'sulama-debug-panel';
  panel.id = 'sulamaDebugPanel';
  panel.innerHTML = '<b>DEBUG MODE</b><br>sulama-debug.js aktif';
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(panel); });

  function updatePanel(html){
    const p = document.getElementById('sulamaDebugPanel');
    if (p) p.innerHTML = '<b>DEBUG</b> ' + new Date().toLocaleTimeString('tr-TR') + '<br>' + html;
  }

  window.dbg = {
    log: function(tag, data){
      console.log('%c[SULAMA:' + tag + ']', 'color:#C9A84C;font-weight:bold', data);
    },
    warn: function(tag, data){
      console.warn('%c[SULAMA:' + tag + ']', 'color:#E67E22;font-weight:bold', data);
    },
    group: function(label){
      console.group('%c[SULAMA] ' + label, 'color:#C9A84C');
    },
    groupEnd: function(){
      console.groupEnd();
    },
    state: function(S){
      dbg.group('STATE SNAPSHOT');
      dbg.log('kuyu', {
        derinlik: S.kuyuDerinlik, statik: S.statikSu,
        dinamik: S.dinamikSu, debi: S.kuyuDebi, sayi: S.kuyuSayisi
      });
      dbg.log('arazi', {
        donum: S.araziDonum, uretimTipi: S.uretimTipi,
        urun: S.urunTip, yontem: S.sulamaYontem
      });
      dbg.log('senaryo', {
        selectedId: S.selectedScenarioId,
        selectedType: S.selectedScenarioType
      });
      dbg.log('validation', S._validation || 'henuz calistirilmadi');
      dbg.groupEnd();
      updatePanel(
        'uretim: <b>' + (S.uretimTipi||'-') + '</b><br>' +
        'yontem: <b>' + (S.sulamaYontem||'-') + '</b><br>' +
        'donum: <b>' + (S.araziDonum||0) + '</b><br>' +
        'secili: <b>' + (S.selectedScenarioType||'yok') + '</b>'
      );
    },
    formula: function(name, inputs, result){
      dbg.group('FORMULA: ' + name);
      dbg.log('girisler', inputs);
      dbg.log('sonuc', result);
      dbg.groupEnd();
    },
    bom: function(scenarioType, bomData){
      dbg.log('BOM:' + scenarioType, {
        groups: bomData ? bomData.groups.map(function(g){ return g.title + ' (' + g.items.length + ' kalem)'; }) : 'null',
        summary: bomData ? bomData.summary : 'null'
      });
    },
    validation: function(v){
      dbg.group('VALIDATION');
      dbg.log('seviye', v.level);
      if (v.blockers.length) dbg.warn('blokerler', v.blockers);
      if (v.warnings.length) dbg.log('uyarilar', v.warnings);
      dbg.log('checks', v.checks);
      dbg.groupEnd();
    }
  };

  console.log('%c[SULAMA DEBUG] Aktif — window.dbg kullanilabilir', 'color:#C9A84C;font-size:13px;font-weight:bold');
})();
