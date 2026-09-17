/* feedback-popup.js — Bircan Elektrik — WhatsApp yönlendirmeli beta popup v2 */
(function () {
  'use strict';
  var WP_TELEFON  = '905340140949';
  var WP_MESAJ    = 'Merhaba, Tarımsal Sulama Asistanı hakkında geri bildirimim var: ';
  var STORAGE_KEY = 'bircan_feedback_v2';
  var DELAY_MS    = 0;

  function wasDismissed(){ try{ return !!localStorage.getItem(STORAGE_KEY); }catch(e){ return false; } }
  function markDismissed(){ try{ localStorage.setItem(STORAGE_KEY,'1'); }catch(e){} }
  function wpUrl(){ return 'https://wa.me/'+WP_TELEFON+'?text='+encodeURIComponent(WP_MESAJ); }

  function closePopup(overlay){
    var chk=document.getElementById('fbNoMore');
    if(chk&&chk.checked) markDismissed();
    if(overlay&&overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function buildPopup(){
    var ov=document.createElement('div');
    ov.id='fbOverlay';
    ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.74);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
    var card=document.createElement('div');
    card.style.cssText='background:linear-gradient(155deg,#1C1400 0%,#100C00 100%);border:1px solid #C9A84C;border-radius:14px;padding:26px 22px 20px;max-width:390px;width:100%;box-shadow:0 10px 48px rgba(0,0,0,0.75);font-family:Barlow,sans-serif;position:relative';

    // Kapat butonu
    var btnX=document.createElement('button');
    btnX.id='fbX'; btnX.textContent='\u00D7';
    btnX.style.cssText='position:absolute;top:11px;right:13px;background:transparent;border:none;color:#5A5040;font-size:20px;cursor:pointer;line-height:1;padding:2px 7px';
    card.appendChild(btnX);

    // Rozet
    var badge=document.createElement('div');
    badge.style.cssText='display:inline-flex;align-items:center;gap:6px;background:#1A1000;border:1px solid #C9A84C;border-radius:20px;padding:3px 11px;font-size:10px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:14px';
    var dot=document.createElement('span');
    dot.id='fbDot';
    dot.style.cssText='width:7px;height:7px;border-radius:50%;background:#C9A84C;display:inline-block';
    badge.appendChild(dot);
    badge.appendChild(document.createTextNode(' Geli\u015ftirme A\u015famas\u0131nda'));
    card.appendChild(badge);

    // Başlık
    var h=document.createElement('div');
    h.style.cssText='font-family:"Barlow Condensed",sans-serif;font-size:21px;font-weight:700;color:#F0EDE4;line-height:1.2;margin-bottom:9px';
    h.textContent='Uygulama aktif olarak geli\u015ftiriliyor';
    card.appendChild(h);

    // Açıklama
    var p=document.createElement('div');
    p.style.cssText='font-size:12px;color:#9A8F78;line-height:1.75;margin-bottom:20px';
    p.innerHTML='Hesap motoru, malzeme listeleri ve fiyat verileri s\u00fcrekli iyile\u015ftiriliyor. Hata bildirimi ve \u00f6nerileriniz uygulamay\u0131 daha g\u00fcvenilir k\u0131l\u0131yor. <strong style="color:#C9A84C">Geri bildiriminiz i\u00e7in te\u015fekk\u00fcrler.</strong>';
    card.appendChild(p);

    // Buton grubu
    var row=document.createElement('div');
    row.style.cssText='display:flex;gap:8px;flex-wrap:wrap';

    // WhatsApp
    var wp=document.createElement('a');
    wp.id='fbWP'; wp.href='#';
    wp.onclick=function(e){ e.preventDefault(); window.open('https://wa.me/'+WP_TELEFON+'?text='+encodeURIComponent(WP_MESAJ),'_blank'); };
    wp.style.cssText='flex:1;min-width:130px;background:#075E54;border:1px solid #25D366;color:#fff;border-radius:8px;padding:11px 14px;font-family:Barlow,sans-serif;font-size:11px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:0.4px;display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none';
    wp.onmouseover=function(){ this.style.background='#128C7E'; };
    wp.onmouseout=function(){ this.style.background='#075E54'; };
    wp.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.117 1.515 5.845L.057 23.475a.75.75 0 00.918.918l5.63-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.71 9.71 0 01-4.953-1.354l-.355-.212-3.68.953.973-3.564-.232-.366A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg> Hata Bildir (WhatsApp)';
    row.appendChild(wp);

    // Devam Et
    var skip=document.createElement('button');
    skip.id='fbSkip'; skip.textContent='Devam Et';
    skip.style.cssText='flex:1;min-width:100px;background:transparent;border:1px solid #2A2000;color:#5A5040;border-radius:8px;padding:11px 14px;font-family:Barlow,sans-serif;font-size:11px;font-weight:600;cursor:pointer;text-transform:uppercase;letter-spacing:0.4px';
    skip.onmouseover=function(){ this.style.borderColor='#C9A84C'; this.style.color='#A09070'; };
    skip.onmouseout=function(){ this.style.borderColor='#2A2000'; this.style.color='#5A5040'; };
    row.appendChild(skip);
    card.appendChild(row);

    // Bir daha gösterme
    var noMore=document.createElement('div');
    noMore.style.cssText='margin-top:13px;text-align:center';
    noMore.innerHTML='<label style="display:inline-flex;align-items:center;gap:6px;font-size:10px;color:#4A4030;cursor:pointer"><input type="checkbox" id="fbNoMore" style="accent-color:#C9A84C;cursor:pointer"> Bir daha g\u00f6sterme</label>';
    card.appendChild(noMore);

    ov.appendChild(card);

    // Pulse CSS
    var sty=document.createElement('style');
    sty.textContent='@keyframes _fbp{0%,100%{opacity:1}50%{opacity:.3}}#fbDot{animation:_fbp 1.5s ease-in-out infinite}';
    ov.appendChild(sty);

    return ov;
  }

  function init(){
    if(wasDismissed()) return;
    setTimeout(function(){
      var ov=buildPopup();
      document.body.appendChild(ov);
      document.getElementById('fbX').addEventListener('click',function(){ closePopup(ov); });
      document.getElementById('fbSkip').addEventListener('click',function(){ closePopup(ov); });
      document.getElementById('fbWP').addEventListener('click',function(){ setTimeout(function(){ closePopup(ov); },300); });
      ov.addEventListener('click',function(e){ if(e.target===ov) closePopup(ov); });
    }, DELAY_MS);
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); }
  else{ init(); }
})();
