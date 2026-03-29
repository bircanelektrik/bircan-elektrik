/* ══════════════════════════════════════════
   bircan.js — Bircan Elektrik Mühendislik
   ══════════════════════════════════════════ */

/* ── ACCORDION ── */
function toggleCat(id,btn){
  var p=document.getElementById('cat-'+id);if(!p)return;
  var o=p.classList.contains('open');
  document.querySelectorAll('.cat-panel').forEach(function(x){x.classList.remove('open');});
  document.querySelectorAll('.cat-btn').forEach(function(x){x.classList.remove('open');});
  if(!o){p.classList.add('open');btn.classList.add('open');
    if(id==='aydinlatma')setTimeout(function(){setKelvin(3000);initLumen();},100);
    if(id==='salt')setTimeout(function(){initMCB();initGD();},100);}
}

/* ── TAB ── */
function showTab(id,btn,group){
  var inner=document.getElementById('cat-'+group);if(!inner)return;
  inner.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
  inner.querySelectorAll('.tkbtn').forEach(function(b){b.classList.remove('active');});
  var p=document.getElementById('tab-'+id);if(p)p.classList.add('active');
  btn.classList.add('active');
  if(id==='kelvin')setTimeout(function(){setKelvin(3000);},50);
  if(id==='lumen')setTimeout(function(){initLumen();},50);
  if(id==='mcb')setTimeout(function(){initMCB();},50);
  if(id==='tesisat')setTimeout(function(){initGD();},50);
}

/* ── KELVIN ── */
var kvData=[
  {k:1000,color:'#ff4500',name:'Kor ışığı · Çok sıcak, dekoratif'},
  {k:1800,color:'#ff7000',name:'Mum ışığı · Romantik ortam'},
  {k:2200,color:'#ff9329',name:'Çok sıcak beyaz · Lounge, bar'},
  {k:2700,color:'#ffb347',name:'Sıcak beyaz · Yatak odası, oturma'},
  {k:3000,color:'#ffd27f',name:'Sıcak beyaz · Oturma odası, vitrin'},
  {k:3500,color:'#ffe4a0',name:'Oturma ile mutfak arası'},
  {k:4000,color:'#f0f4ff',name:'Soğuk beyaz · Mutfak, banyo'},
  {k:4500,color:'#e8f0ff',name:'Nötr beyaz · Ofis, çalışma'},
  {k:5000,color:'#e0eaff',name:'Gün ışığı · Çalışma odası, ofis'},
  {k:5500,color:'#d0e0ff',name:'Soğuk gün ışığı · Atölye, stüdyo'},
  {k:6000,color:'#c0d5ff',name:'Soğuk beyaz · Garaj, depo'},
  {k:6500,color:'#bbd0ff',name:'Gün ışığı · Tıbbi, endüstriyel'},
  {k:7000,color:'#aac0ff',name:'Çok soğuk · Özel teknik alanlar'}
];
function setKelvin(k){
  var tr=document.getElementById('kv-track'),kn=document.getElementById('kv-knob');if(!tr||!kn)return;
  var d=kvData.reduce(function(a,b){return Math.abs(b.k-k)<Math.abs(a.k-k)?b:a;});
  kn.style.left=((k-1000)/6000*tr.offsetWidth)+'px';
  var ve=document.getElementById('kv-val'),ne=document.getElementById('kv-name'),sw=document.getElementById('kv-swatch');
  if(ve){ve.textContent=k+'K';ve.style.color=k<3500?'#b8963e':k<5000?'#333':'#3355cc';}
  if(ne)ne.textContent=d.name;
  if(sw){sw.style.background=d.color;sw.style.boxShadow='0 4px 24px '+d.color+'88';}
}
(function(){
  var drag=false;
  function initKv(){
    var tr=document.getElementById('kv-track');if(!tr||tr._kv)return;tr._kv=true;
    function gk(e){var r=tr.getBoundingClientRect();return Math.round(1000+(Math.max(0,Math.min((e.touches?e.touches[0].clientX:e.clientX)-r.left,r.width))/r.width)*6000);}
    tr.addEventListener('mousedown',function(e){drag=true;setKelvin(gk(e));});
    tr.addEventListener('touchstart',function(e){drag=true;setKelvin(gk(e));},{passive:true});
    document.addEventListener('mousemove',function(e){if(drag)setKelvin(gk(e));});
    document.addEventListener('touchmove',function(e){if(drag)setKelvin(gk(e));},{passive:true});
    document.addEventListener('mouseup',function(){drag=false;});
    document.addEventListener('touchend',function(){drag=false;});
  }
  document.addEventListener('DOMContentLoaded',initKv);
  setTimeout(initKv,500);
})();

/* ── LUMEN ── */
function calcLumen(){
  var a=document.getElementById('lm-area'),t=document.getElementById('lm-type'),e=document.getElementById('lm-eff');if(!a||!t||!e)return;
  var l=Math.round(parseFloat(a.value)*parseFloat(t.value));
  var r=document.getElementById('lm-result'),w=document.getElementById('lm-watt'),c=document.getElementById('lm-count');
  if(r)r.textContent=l.toLocaleString('tr-TR');
  if(w)w.textContent=Math.round(l/parseFloat(e.value));
  if(c)c.textContent=Math.ceil(l/900);
}
function initLumen(){
  var a=document.getElementById('lm-area');if(!a||a._b)return;a._b=true;
  a.addEventListener('input',calcLumen);
  document.getElementById('lm-type').addEventListener('change',calcLumen);
  document.getElementById('lm-eff').addEventListener('change',calcLumen);
  calcLumen();
}

/* ── MCB ── */
var mcbFaz='mono',mcbRcd=40,rcdAlani='ev';
function setFaz(faz){
  mcbFaz=faz;
  var m=document.getElementById('btn-mono'),t=document.getElementById('btn-tri');if(!m||!t)return;
  var on='flex:1;padding:9px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:var(--white);color:var(--black);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;';
  var off='flex:1;padding:9px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;';
  m.style.cssText=faz==='mono'?on:off;t.style.cssText=faz==='tri'?on:off;calcMCB();
}
function calcMCB(){
  var p=document.getElementById('mcb-power'),u=document.getElementById('mcb-unit'),f=document.getElementById('mcb-pf');if(!p||!u||!f)return;
  var pw=parseFloat(p.value)*parseFloat(u.value),pf=parseFloat(f.value),pv=document.getElementById('mcb-pf-val');
  if(pv)pv.textContent=pf.toFixed(2);
  var U=mcbFaz==='mono'?220:380,sq=mcbFaz==='mono'?1:1.732,I=pw/(sq*U*pf);
  var std=[6,10,16,20,25,32,40,50,63,80,100,125,160,200],rec=std.find(function(x){return x>I;})||200,tip=(pw>5000||mcbFaz==='tri')?'C':'B';
  var ae=document.getElementById('mcb-amp'),re=document.getElementById('mcb-rec'),fe=document.getElementById('mcb-formula');
  if(ae)ae.textContent=I.toFixed(1)+'A';
  if(re)re.textContent=rec+'A '+tip+' tipi';
  if(fe)fe.textContent=mcbFaz==='mono'?'I=P/(U×cosf)='+pw+'W/('+U+'V×'+pf+')='+I.toFixed(1)+'A':'I=P/(√3×U×cosf)='+pw+'W/(1.73×'+U+'V×'+pf+')='+I.toFixed(1)+'A';
  mcbRcd=rec;updateRcdResult();
}
function updateRcdResult(){
  var ma=document.getElementById('rcd-ma'),amp=document.getElementById('rcd-amp'),tip=document.getElementById('rcd-tip'),ac=document.getElementById('rcd-aciklama');if(!ma)return;
  var stds=[25,40,63,80,100,125,160,200],ra=stds.find(function(s){return s>=mcbRcd;})||200,m=rcdAlani==='sanayi'?'300mA':'30mA',ti=rcdAlani==='sanayi'?'Tip B':'Tip A',acl;
  if(ra>80){acl=mcbRcd+'A MCB için '+ra+'A kapasite gerekli. Bobinli TMŞ+toroid. '+m+'.';if(tip)tip.textContent='Bobinli TMŞ+Toroid';}
  else{acl=mcbRcd+'A MCB için min. '+ra+'A RCD.'+(rcdAlani==='ev'?' Konut: 30mA zorunlu.':rcdAlani==='isyeri'?' Islak alan: 30mA RCD.':" Sanayi: 300mA yangın, grup: 30mA.");if(tip)tip.textContent=ti;}
  if(ma)ma.textContent=m;if(amp)amp.textContent=ra+'A';if(ac)ac.textContent=acl;
}
function initMCB(){
  var p=document.getElementById('mcb-power');if(!p||p._b)return;p._b=true;
  p.addEventListener('input',calcMCB);
  document.getElementById('mcb-unit').addEventListener('change',calcMCB);
  document.getElementById('mcb-pf').addEventListener('input',calcMCB);
  calcMCB();updateRcdResult();
}

/* ── GERİLİM DÜŞÜMÜ ── */
function calcGD(){
  var I=parseFloat(document.getElementById('gd-I').value)||0,L=parseFloat(document.getElementById('gd-L').value)||0;
  var S=parseFloat(document.getElementById('gd-S').value)||4,faz=document.getElementById('gd-faz').value;
  var pf=parseFloat(document.getElementById('gd-pf').value)||0.9,mat=document.getElementById('gd-mat'),k=mat?parseFloat(mat.value):56;
  var pv=document.getElementById('gd-pf-val');if(pv)pv.textContent=pf.toFixed(2);
  var U=faz==='mono'?220:380,co=faz==='mono'?2:Math.sqrt(3),dv=(co*I*L*pf)/(S*k),dp=(dv/U)*100;
  var pe=document.getElementById('gd-pct'),vo=document.getElementById('gd-volt'),st=document.getElementById('gd-status');if(!pe)return;
  pe.textContent=dp.toFixed(2)+'%';vo.textContent=dv.toFixed(2)+'V';
  var lim=(I>32||S>=16)?5:3;
  if(dp<=lim){st.style.cssText='background:rgba(74,222,128,0.15);color:#4ade80;font-size:11px;padding:6px 10px;border-radius:6px;text-align:center;';st.textContent='✓ Uygun — '+(lim===3?'Konut (%3)':'Sanayi (%5)');pe.style.color='#4ade80';}
  else if(dp<=5){st.style.cssText='background:rgba(250,204,21,0.15);color:#facc15;font-size:11px;padding:6px 10px;border-radius:6px;text-align:center;';st.textContent='⚠ Konut sınırı aşıldı (%5 sanayi ok)';pe.style.color='#facc15';}
  else{st.style.cssText='background:rgba(239,68,68,0.15);color:#ef4444;font-size:11px;padding:6px 10px;border-radius:6px;text-align:center;';st.textContent='✗ Limit aşıldı — Kesiti büyüt!';pe.style.color='#ef4444';}
}
function initGD(){
  var el=document.getElementById('gd-I');if(!el||el._b)return;el._b=true;
  ['gd-I','gd-L'].forEach(function(id){var x=document.getElementById(id);if(x)x.addEventListener('input',calcGD);});
  ['gd-S','gd-faz','gd-mat'].forEach(function(id){var x=document.getElementById(id);if(x)x.addEventListener('change',calcGD);});
  var pf=document.getElementById('gd-pf');if(pf)pf.addEventListener('input',calcGD);
  calcGD();
}

/* ── REHBER ── */
var rehberData=[
  {cat:'saha',icon:'🏗️',iconClass:'dark',meta:'Saha Uygulaması',title:'Hidrolik Lift Sıfırdan Kurulum',audience:'👷 Usta & Teknisyen',audienceBg:'#f0f0f0',audienceColor:'#333',desc:'Eski sanayi liftinin komple elektrik altyapısının yenilenmesi.',steps:['Mevcut tesisatın ölçümü ve harita çıkarımı','Motor gücü: P=√3 × U × I × cosφ ile kablo kesiti belirlenir','NYY 4x10 güç hattı, topraklama ayrı döşenir','Kontaktör + termik röle + acil stop ile kumanda panosu','Limit switch ayarları mekanikle koordineli','Test: boş çalışma, yarı yük, tam yük sırasıyla','Termik röle: motor plaket akımının %110 üstüne ayarla'],tip:'Limit switchleri ayarlarken lifi yavaş çalıştır.',warn:'Eski binalarda topraklama yoksa kesinlikle çek.'},
  {cat:'saha',icon:'📏',iconClass:'gold',meta:'Saha Uygulaması',title:'Kablo Tava: Güzergah & Teraziye Alma',audience:'👷 Usta & Teknisyen',audienceBg:'#f0f0f0',audienceColor:'#333',desc:'Projede çizilen güzergahın sahaya uygulanması.',steps:['Projedeki güzergahı sahaya aktar, engelleri tespit et','Tij aralığı: düz güzergahta max 1.5m','Tij derinliği: betonda min 6cm','İlk ve son tavaları hizala, gergi ipi çek','Su terazisi ile kontrol et: max 2mm sapma','Köşelerde orijinal köşe elemanı kullan','Kapak takarken doluluk oranı max %40'],tip:'Uzun güzergahlarda genleşme boşluğu bırak.',warn:'Projeden sapma varsa mühendise bildir.'},
  {cat:'ariza',icon:'🔍',iconClass:'',meta:'Arıza Rehberi',title:'3 Fazlı Motor Arıza Arama',audience:'👷 Usta & Teknisyen',audienceBg:'#f0f0f0',audienceColor:'#333',desc:'Motor çalışmıyor, titreşiyor veya ısınıyorsa bu sırayla kontrol et.',steps:['Şebeke gerilimi: 3 fazda 380-400V var mı?','Termik röle atık mı? Sıfırla ve akım ölç','Motor uçlarında gerilim var mı?','Bobin dirençleri 3 fazda eşit mi?','İzolasyon testi: faz-gövde min 1MΩ','Yüksüz çalıştır: titreşim ve ses kontrolü','3 fazı da ölç, plaket değerini geçiyor mu?'],tip:'Y-D motorlarda önce yıldız konumunda test et.',warn:'Termik sıfırlamadan önce neden attığını anla.'},
  {cat:'ariza',icon:'⚡',iconClass:'',meta:'Arıza Rehberi',title:'Sigortalar Sürekli Atıyor',audience:'🏠 Müşteri & Usta',audienceBg:'#e8f0fe',audienceColor:'#1a56c4',desc:'Evde veya işyerinde sigortalar ısrarla atıyorsa bu adımları takip et.',steps:['Hangi sigorta atıyor? Sorunu daralt','O devreye bağlı cihazları çıkar, sigortayı kapat-aç','Hat arızasında: izolasyon testi yap','Cihazları tek tek tak, hangisinde atıyor?','Kaçak akım atıyorsa uzman çağır','Sigorta değeri doğru mu? Priz max 16A'],tip:'Mutfak ve banyoda ayrı RCD olmalı.',warn:'Sigorta yerine büyük sigorta takma.'},
  {cat:'aydinlatma',icon:'💡',iconClass:'gold',meta:'Akıllı Aydınlatma',title:'Manken Önünde PIR+Dimmer Spot',audience:'🏪 Mağaza Sahibi',audienceBg:'#e8f5e9',audienceColor:'#1b7a2f',desc:'Manken vitrininin önüne müşteri gelince yumuşak aydınlanan spot.',steps:['PIR sensörü: 180°, 3-5m mesafe, 1-10sn gecikme','Trailing-edge dimmer, LED uyumlu','Sensör çıkışını dimmer girişine doğrudan bağlama','Soft start 1.5-2sn ayarla','Lux sensörü ekle: aydınlıksa devre çalışmasın','Spot açısı: manken üst noktasından 30-45°','5 kez geçişte tutarlı açılış-kapanış test et'],tip:'Birden fazla manken için sensörleri paralel bağla.',warn:'Ucuz TRIAC dimmer LED ile flicker yapar.'},
  {cat:'aydinlatma',icon:'🌆',iconClass:'gold',meta:'Aydınlatma Tasarımı',title:'Mağaza Aydınlatması: Müşteri Gözü',audience:'🏪 Mağaza Sahibi',audienceBg:'#e8f5e9',audienceColor:'#1b7a2f',desc:'Doğru aydınlatma satışı artırır.',steps:['Genel: 500-750 lux, 4000K','Vitrin spotları: 1500-3000 lux, 3000K sıcak ton','Kasa: 750 lux, 4000K nötr','CRI min 90: düşük CRI renk bozar','Fitting odası: yandan aydınlatma, 3000K','Giriş en aydınlık yer olmalı'],tip:'Aydınlatma bütçesi ürün fiyatının %1-2si.',warn:null},
  {cat:'proje',icon:'📐',iconClass:'',meta:'Proje & Hesap',title:'Kablo Kesiti Seçimi',audience:'🎓 Öğrenci & Teknisyen',audienceBg:'#fce4ec',audienceColor:'#b71c1c',desc:'Yanlış kesit yangın veya ekipman arızası demek.',steps:['Yük akımı: I = P / (√3 × U × cosf)','Kesit tablosuna bak, düzeltme faktörü uygula','Gerilim düşümü: max %3 konut, %5 sanayi','İki hesaptan büyük olanı seç','Kısa devre akımını sigortayla karşılaştır','Topraklama: faz kesitiyle aynı (16mm² altı)'],tip:'Uzun hatlarda gerilim düşümü kesiti belirler.',warn:'Birden fazla kablo aynı kanalda ise azaltma faktörü uygula.'},
  {cat:'temel',icon:'🎓',iconClass:'',meta:'Temel Bilgi',title:'Ustaların En Sık Yaptığı 7 Hata',audience:'🎓 Meslek Lisesi & Çırak',audienceBg:'#fce4ec',audienceColor:'#b71c1c',desc:'Sahada gördüğümüz hatalar.',steps:['PE ve N ayrı olmalı, birleştirme','Bağlantıyı izole etmeden bırakma','Sigorta değerini büyük seçme','Buat kapağını kapatmama','Faz-nötr karıştırma, anahtar faz kesmeli','Kablo kesitini göz kararı seçme','Topraklama testini atlama'],tip:'Doğru yap, geri dönme.',warn:null},
  {cat:'temel',icon:'⚙️',iconClass:'',meta:'Temel Bilgi',title:'Ohm Yasası ve Güç Formülleri',audience:'🎓 Meslek Lisesi & Çırak',audienceBg:'#fce4ec',audienceColor:'#b71c1c',desc:'Sahadaki her ölçüm bu formüllere dayanır.',steps:['V = I x R: Gerilim = Akım x Direnç','P = V x I: 2200W kettle, 220V de 10A','3 faz: P = √3 x V x I x cosf','Enerji: E = P x t, 1kWh = 1 birim','Paralel: akım bölünür, gerilim aynı','Seri: akım aynı, gerilim bölünür'],tip:"cosf bilinmiyorsa endüstriyelde 0.8, aydınlatmada 0.95 varsay.",warn:null}
];
var activeRehber=null,activeFilter='all';
function filterRehber(cat,btn){activeFilter=cat;activeRehber=null;document.querySelectorAll('.rfbtn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderRehber();}
function toggleRehber(i){activeRehber=activeRehber===i?null:i;renderRehber();}
function renderRehber(){
  var el=document.getElementById('rehber-grid');if(!el)return;
  var filtered=rehberData.map(function(r,i){return Object.assign({},r,{origIdx:i});}).filter(function(r){return activeFilter==='all'||r.cat===activeFilter;});
  el.innerHTML=filtered.map(function(r){
    var i=r.origIdx,open=activeRehber===i;
    return '<div class="rcard'+(open?' ropen':'')+'" onclick="toggleRehber('+i+')">'+
      '<div class="rcard-head"><div class="rcard-icon '+r.iconClass+'">'+r.icon+'</div>'+
      '<div><div class="rcard-meta">'+r.meta+'</div><div class="rcard-title">'+r.title+'</div></div></div>'+
      '<span class="rcard-audience" style="background:'+r.audienceBg+';color:'+r.audienceColor+'">'+r.audience+'</span>'+
      '<div class="rcard-body'+(open?' open':'')+'"><p>'+r.desc+'</p>'+
      '<ol class="rcard-steps">'+r.steps.map(function(s,n){return'<li data-n="'+(n+1)+'">'+s+'</li>';}).join('')+'</ol>'+
      (r.tip?'<div class="rcard-tip">'+r.tip+'</div>':'')+
      (r.warn?'<div class="rcard-warn">'+r.warn+'</div>':'')+
      '</div></div>';
  }).join('');
}

/* ── POPUP ── */
function showCallPopup(){var o=document.getElementById('call-overlay'),p=document.getElementById('call-popup');if(o)o.style.display='block';if(p)p.style.display='block';}
function hideCallPopup(){var o=document.getElementById('call-overlay'),p=document.getElementById('call-popup');if(o)o.style.display='none';if(p)p.style.display='none';}
document.addEventListener('keydown',function(e){if(e.key==='Escape')hideCallPopup();});

/* ── SERVICES ── */
var activeSvc=null;
var services=[
  {icon:'⚡',title:'Arıza Tespit & Acil Servis',full:'Anlık arıza tespiti, yedek parça teminati ve garanti belgeli onarım.',features:['Uzaktan teşhis','Saha müdahalesi','Yedek parça','Onarım raporu','Garanti']},
  {icon:'📦',title:'Malzeme Tedariği',full:'Sertifikalı elektrik malzemeleri toptan ve perakende satışı.',features:['Kablo & kanallar','Sigorta & şalterler','Priz & aydınlatma','Toplu indirim','Hızlı teslimat']},
  {icon:'🔌',title:'Altyapı & Tesisat',full:'TSE ve IEC standartlarına uygun yenileme, kuvvetli ve zayıf akım.',features:['Tesisat projesi','Kuvvetli akım','Zayıf akım','Topraklama','Keşif & hakediş']},
  {icon:'📷',title:'Güvenlik & Kamera',full:'IP kamera, erişim kontrol ve network altyapısı kurulumu.',features:['IP kamera','Erişim kontrolü','Alarm sistemi','Network','Uzaktan izleme']},
  {icon:'🖥️',title:'Endüstriyel Otomasyon',full:'PLC programlama, SCADA tasarımı ve HMI entegrasyonu.',features:['PLC programlama','SCADA tasarımı','HMI paneller','Sürücü sistemleri','Enerji izleme']},
  {icon:'🏠',title:'Akıllı Ev & Bina',full:'Aydınlatma, ısıtma ve güvenlik sistemlerinin entegre kontrolü.',features:['Aydınlatma kontrolü','Isıtma & soğutma','Enerji yönetimi','Mobil uygulama','Ses sistemi']},
  {icon:'⚙️',title:'Elektrik Panosu',full:'AG/OG pano imalatı, enerji analizi ve kompanzasyon sistemleri.',features:['Pano imalatı','Kompanzasyon','Harmonik filtre','Enerji analizi','Devreye alma']},
  {icon:'📐',title:'Proje & Danışmanlık',full:'1 kV altı ve üstü projelendirme, güç analizi, kısa devre hesabı.',features:['1 kV altı proje','1 kV üstü proje','Güç analizi','Kısa devre','Mühendis imzası','Resmi onaylar']}
];

/* ── NAV SCROLL ── */
(function(){
  var secs=document.querySelectorAll('section[id]'),links=document.querySelectorAll('.nav-links a[data-section]');
  window.addEventListener('scroll',function(){var cur='',mid=window.scrollY+window.innerHeight/2;secs.forEach(function(s){if(mid>=s.offsetTop)cur=s.id;});links.forEach(function(a){a.classList.toggle('active',a.dataset.section===cur);});});
})();

/* ══════════════════════════════════════════
   HARİTA — Leaflet.js
   ÖNEMLI: window.load kullan, DOMContentLoaded değil.
   Böylece Leaflet JS ve CSS kesin yüklenmiş olur.
   ══════════════════════════════════════════ */
var DUKKAN={lat:38.09727312927777,lng:35.359152300000005};

/* ── SABİTLER ── */
var SFUEL = 73;      // Varsayılan motorin fiyatı (TL/lt)
var SCONS = 9;       // Araç yakıt tüketimi (L/100km)
var SBASE = 350;     // Taban servis ücreti (TL)
var SDMAX = 55;      // Maksimum hizmet mesafesi (km)
var SPMAX = 5000;    // Maksimum servis ücreti tavanı (TL)
var SLABOR = 1500;   // İşçilik ücreti (TL/saat)
var SKMR = 8;        // Km başı amortisman (TL/km)

/* ── YAKIT API ── */
var cachedFuel = null;
function getFuelPrice(cb) {
  // localStorage cache — 24 saat
  try {
    var c = localStorage.getItem('bircan_fuel');
    if (c) {
      var d = JSON.parse(c);
      if (Date.now() - d.ts < 86400000) { cachedFuel = d; cb(d); return; }
    }
  } catch(e) {}

  fetch('https://yakit-proxy.bircannelektrik.workers.dev/')
    .then(function(r) { return r.json(); })
    .then(function(j) {
      if (j && j.success) {
        var data = { motorin: j.motorin || SFUEL, benzin95: j.benzin95 || null, sehir: j.sehir || 'Kayseri', tarih: j.tarih || '', ts: Date.now(), canli: true };
        try { localStorage.setItem('bircan_fuel', JSON.stringify(data)); } catch(e) {}
        cachedFuel = data;
        cb(data);
      } else { cb({ motorin: SFUEL, canli: false, ts: Date.now() }); }
    })
    .catch(function() { cb({ motorin: SFUEL, canli: false, ts: Date.now() }); });
}

/* ── ROTA — OSRM → ORS → haversine fallback ── */
function getRouteDistance(lat1, lng1, lat2, lng2, cb) {
  // 1) OSRM
  var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + lng1 + ',' + lat1 + ';' + lng2 + ',' + lat2 + '?overview=false';
  fetch(osrmUrl)
    .then(function(r) { return r.json(); })
    .then(function(j) {
      if (j && j.routes && j.routes.length > 0) {
        var km = j.routes[0].distance / 1000;
        var dk = Math.round(j.routes[0].duration / 60);
        cb({ km: km, dk: dk, src: 'OSRM' });
      } else { throw new Error('OSRM boş'); }
    })
    .catch(function() {
      // 2) ORS fallback
      var orsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car?start=' + lng1 + ',' + lat1 + '&end=' + lng2 + ',' + lat2;
      fetch(orsUrl, { headers: { 'Accept': 'application/json' } })
        .then(function(r) { return r.json(); })
        .then(function(j) {
          if (j && j.features && j.features.length > 0) {
            var seg = j.features[0].properties.segments[0];
            cb({ km: seg.distance / 1000, dk: Math.round(seg.duration / 60), src: 'ORS' });
          } else { throw new Error('ORS boş'); }
        })
        .catch(function() {
          // 3) Haversine fallback
          var hv = haversineKm(lat1, lng1, lat2, lng2);
          cb({ km: hv * 1.35, dk: Math.round(hv * 1.35 * 1.2), src: 'hvFallback' });
        });
    });
}

function haversineKm(a,b,c,d){
  var R=6371,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;
  var x=Math.sin(dL/2)*Math.sin(dL/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)*Math.sin(dl/2);
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

function kmToFiyat(km, fuelPrice) {
  var fp = fuelPrice || SFUEL;
  var kmMaliyet = (fp * SCONS) / 100 + SKMR;
  var toplam = SBASE + (2 * km * kmMaliyet);
  return Math.round(Math.min(Math.max(toplam, 500), SPMAX) / 50) * 50;
}
function leafletTile(map){
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
    subdomains:'abcd',maxZoom:18
  }).addTo(map);
}
function mkIcon(emoji,bg,size){
  return L.divIcon({html:'<div style="background:'+bg+';color:#fff;border-radius:50%;width:'+size+'px;height:'+size+'px;display:flex;align-items:center;justify-content:center;font-size:'+(size*0.47|0)+'px;box-shadow:0 2px 10px rgba(0,0,0,0.35);">'+emoji+'</div>',className:'',iconSize:[size,size],iconAnchor:[size/2,size/2]});
}

function initHizmetHarita(){
  var el=document.getElementById('hizmet-harita');
  if(!el||el._done)return;el._done=true;
  var map=L.map(el,{center:[DUKKAN.lat,DUKKAN.lng],zoom:8,scrollWheelZoom:false});
  leafletTile(map);
  L.circle([DUKKAN.lat,DUKKAN.lng],{radius:150000,color:'#b8963e',weight:2,fillColor:'#b8963e',fillOpacity:0.09,dashArray:'6 4'}).addTo(map);
  L.marker([DUKKAN.lat,DUKKAN.lng],{icon:mkIcon('📍','#0f0f0f',34)}).addTo(map).bindPopup('<strong>Bircan Elektrik</strong><br>Yahyalı / Kayseri').openPopup();
  var dot=L.divIcon({html:'<div style="background:#b8963e;border-radius:50%;width:9px;height:9px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);"></div>',className:'',iconSize:[9,9],iconAnchor:[4,4]});
  [{n:'Kayseri',lat:38.7225,lng:35.4875,km:84},{n:'Develi',lat:38.3897,lng:35.4897,km:46},{n:'Niğde',lat:37.9667,lng:34.6833,km:72},{n:'Tomarza',lat:38.4483,lng:36.0836,km:76},{n:'Pınarbaşı',lat:38.725,lng:36.3833,km:112},{n:'Aksaray',lat:38.3687,lng:34.037,km:138},{n:'Adana',lat:37.0,lng:35.3213,km:148},{n:'Sivas',lat:39.7477,lng:37.0179,km:142}
  ].forEach(function(c){L.marker([c.lat,c.lng],{icon:dot}).addTo(map).bindTooltip('<strong>'+c.n+'</strong><br>~'+c.km+' km',{direction:'top',offset:[0,-5]});});
  setTimeout(function(){map.invalidateSize();map.fitBounds(L.circle([DUKKAN.lat,DUKKAN.lng],{radius:155000}).getBounds(),{padding:[20,20]});},300);
}

function initUcretHarita(){
  var el=document.getElementById('ucret-harita');
  if(!el||el._done)return;el._done=true;
  var map=L.map(el,{center:[DUKKAN.lat,DUKKAN.lng],zoom:10,scrollWheelZoom:false});
  leafletTile(map);
  L.marker([DUKKAN.lat,DUKKAN.lng],{icon:mkIcon('⚡','#0f0f0f',34)}).addTo(map).bindPopup('<strong>Bircan Elektrik</strong><br>Gazibeyli, Yahyalı / Kayseri').openPopup();
  L.circle([DUKKAN.lat,DUKKAN.lng],{radius:55000,color:'#b8963e',weight:1.5,fillColor:'#b8963e',fillOpacity:0.07,dashArray:'6 4'}).addTo(map);
  var sel=null, routeLayer=null;

  // Yakıt fiyatını ön yükle
  getFuelPrice(function(f) { cachedFuel = f; });

  map.on('click',function(e){
    if(sel)map.removeLayer(sel);
    if(routeLayer)map.removeLayer(routeLayer);
    var lat=e.latlng.lat,lng=e.latlng.lng;

    // Önce kuş uçuşu ile ön kontrol
    var hvKm = haversineKm(DUKKAN.lat,DUKKAN.lng,lat,lng);
    if(hvKm > SDMAX * 1.2) {
      var p=document.getElementById('ucret-sonuc');
      if(p){p.innerHTML='<div style="padding:12px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-weight:600;">🚫 Hizmet alanı dışı — ~'+Math.round(hvKm)+' km (azami '+SDMAX+' km)</div>';p.style.display='block';}
      return;
    }

    // Geçici marker koy
    sel=L.marker([lat,lng],{icon:mkIcon('📍','#b8963e',30)}).addTo(map).bindPopup('<strong>Hesaplanıyor...</strong>').openPopup();

    // Rota bazlı mesafe hesapla
    getRouteDistance(DUKKAN.lat, DUKKAN.lng, lat, lng, function(route) {
      var km = Math.round(route.km * 10) / 10;
      var dk = route.dk;

      if(km > SDMAX) {
        if(sel)map.removeLayer(sel);
        var p=document.getElementById('ucret-sonuc');
        if(p){p.innerHTML='<div style="padding:12px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-weight:600;">🚫 Hizmet alanı dışı — '+km+' km yol mesafesi (azami '+SDMAX+' km)</div>';p.style.display='block';}
        return;
      }

      var fp = cachedFuel ? cachedFuel.motorin : SFUEL;
      var fiyat = kmToFiyat(km, fp);

      // Marker güncelle
      if(sel) {
        sel.setPopupContent('<strong>Seçilen Konum</strong><br>'+km+' km'+(dk?' · ~'+dk+' dk':'')+'<br><strong style="color:#b8963e;">'+fiyat.toLocaleString('tr-TR')+' TL</strong>');
        sel.openPopup();
      }

      // OSRM'den rota polyline çiz
      if(route.src === 'OSRM') {
        var routeUrl = 'https://router.project-osrm.org/route/v1/driving/' + DUKKAN.lng + ',' + DUKKAN.lat + ';' + lng + ',' + lat + '?overview=full&geometries=geojson';
        fetch(routeUrl)
          .then(function(r){return r.json();})
          .then(function(j){
            if(j && j.routes && j.routes[0] && j.routes[0].geometry) {
              routeLayer = L.geoJSON(j.routes[0].geometry, {style:{color:'#b8963e',weight:4,opacity:0.7}}).addTo(map);
            }
          }).catch(function(){});
      }

      showUcret(km, fiyat, dk, route.src, fp);
    });
  });
  setTimeout(function(){map.invalidateSize();map.fitBounds(L.circle([DUKKAN.lat,DUKKAN.lng],{radius:57000}).getBounds(),{padding:[30,30]});},300);
}

function showUcret(km, fiyat, dk, src, fuelPrice) {
  var p=document.getElementById('ucret-sonuc');if(!p)return;
  var fp = fuelPrice || SFUEL;
  var canli = cachedFuel && cachedFuel.canli;
  var kmMaliyet = Math.round(((fp * SCONS) / 100 + SKMR) * 10) / 10;
  var b=km<=10?'🟢 Yakın çevre':km<=30?'🟡 Yakın ilçe':km<=SDMAX?'🟠 Orta mesafe':'🔴 Uzak bölge';

  var html = '';
  // Üst: fiyat ve mesafe
  html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px;">';
  html += '<div><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:4px;">Tahmini Yol Maliyeti</div>';
  html += '<div style="font-size:2rem;font-weight:800;">'+fiyat.toLocaleString('tr-TR')+' <span style="font-size:1rem;font-weight:600;">TL</span></div></div>';
  html += '<div style="text-align:right;"><div style="font-size:11px;color:var(--gray);margin-bottom:4px;">Yol Mesafesi</div>';
  html += '<div style="font-size:1.4rem;font-weight:700;">'+km+' km</div>';
  if(dk) html += '<div style="font-size:12px;color:var(--gray);">≈'+dk+' dk</div>';
  html += '</div></div>';

  // Hesap formülü
  html += '<div style="background:rgba(0,0,0,0.04);border:1px solid var(--gray-light);border-radius:8px;padding:12px 16px;margin-bottom:10px;">';
  html += '<div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:6px;">🧮 Hesap (Gidiş-Dönüş)</div>';
  html += '<div style="font-size:13px;color:var(--black);font-family:monospace;">'+SBASE+' ₺ + (2 × '+km+' km × '+kmMaliyet+' ₺/km) = '+fiyat+' ₺ | '+kmMaliyet+' ₺/km = ('+fp+' × '+SCONS+'L) / 100 + '+SKMR+'</div>';
  html += '</div>';

  // Yakıt bilgisi
  html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:rgba(0,0,0,0.02);border-radius:6px;margin-bottom:6px;font-size:13px;">';
  html += '<span>⛽ Motorin (Eco Force) — hesapta kullanılan</span>';
  html += '<span style="font-weight:600;'+(canli?'color:var(--gold);':'')+'">'+fp.toFixed(2)+' ₺/lt'+(canli?' (EPDK canlı ✓)':' (varsayılan)')+'</span>';
  html += '</div>';

  if(cachedFuel && cachedFuel.benzin95) {
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:rgba(0,0,0,0.02);border-radius:6px;margin-bottom:10px;font-size:13px;">';
    html += '<span>⛽ Kurşunsuz Benzin 95 (bilgi)</span>';
    html += '<span style="font-weight:600;">'+cachedFuel.benzin95.toFixed(2)+' ₺/lt (EPDK)</span>';
    html += '</div>';
  }

  // Bölge etiketi
  html += '<div style="font-size:13px;color:var(--gray);padding:10px 14px;background:rgba(0,0,0,0.04);border-radius:8px;border-left:3px solid var(--gold);margin-bottom:10px;">'+b+'</div>';

  // Uyarı
  html += '<div style="font-size:12px;color:var(--gray);line-height:1.6;">⚠ Bu ücret <strong>yalnızca ulaşım</strong> tahminidir. Malzeme, işçilik ve proje bedeli ayrıca belirlenir. Kesin fiyat: <a href="tel:+905340140949" style="color:var(--black);font-weight:600;">0534 014 09 49</a></div>';

  p.innerHTML = html;
  p.style.display='block';
}


/* ══════════════════════════════════════════
   MALZEME PLANLAMA ARACI — v2 (Kapsamlı)
   ══════════════════════════════════════════ */

var MLZ = {
  watt_priz:300, watt_lamba:100, mustakil_esik:3200,
  kablo_priz:13, kablo_lamba:10, kablo_mustakil:18,
  aydinlatma_linye:10,  // her aydınlatma linyesi başına 10m ek 2.5mm² kablo
  kolon_min:6, ic_kolon:10, kat_h:3.5, kolon_ek:5,
  max_priz_hat:7, max_lamba_hat:9,
  boru_k:1.2, buat_oda:1, emniyet:1.15,
  ortak_lamba_kat:2, ortak_giris:2, ortak_kablo_kat:12,
  asansor_kw_kat:1.35, asansor_min_kesit:6,
  kam_kablo:25, kam_kon:2, kam_buat:1,
  // Zayıf akım — buat yok, müstakil ilerler
  zayif_baz:32,        // tek kat daire baz metraj (m/linye) — sorti yok, müstakil
  // Kablo akım kapasiteleri — minimum maliyet prensibi
  nyy_kapasite:[{mm:6,a:34},{mm:10,a:46},{mm:16,a:61},{mm:25,a:80},{mm:35,a:99},{mm:50,a:119}],
  nayy_kapasite:[{mm:10,a:28},{mm:16,a:39},{mm:25,a:53},{mm:35,a:67},{mm:50,a:84},{mm:70,a:107}],
  // NYM havai bakır — tek faz 2 damar, üç faz 4 damar
  nym_kapasite:[{mm:6,a:34},{mm:10,a:46},{mm:16,a:61},{mm:25,a:80},{mm:35,a:99}],
  // AER (Alpek) alüminyum havai hat
  aer_kapasite:[{mm:'3x16+10',a:63},{mm:'3x25+16',a:80},{mm:'3x50+25',a:125}],
  tms_std:[25,32,40,50,63,80,100,125,160,200],
  mcb_std:[6,10,16,20,25,32,40,50,63]
};

var MLZ_ESZ = [
  {min:1,max:2,k:0.60},{min:3,max:5,k:0.45},{min:5,max:10,k:0.43},{min:11,max:15,k:0.41},
  {min:16,max:20,k:0.39},{min:21,max:25,k:0.36},{min:26,max:30,k:0.34},{min:31,max:35,k:0.31},
  {min:36,max:40,k:0.29},{min:41,max:45,k:0.27},{min:46,max:50,k:0.26},{min:51,max:55,k:0.25},
  {min:56,max:61,k:0.24},{min:62,max:999,k:0.23}
];

var MLZ_ODA_VARS = {
  'Salon':{icon:'🛋️',priz:6,lamba:2,islak:false},
  'Mutfak':{icon:'🍳',priz:6,lamba:2,islak:false},
  'Banyo':{icon:'🚿',priz:2,lamba:2,islak:true},
  'WC':{icon:'🚽',priz:1,lamba:1,islak:true},
  'Yatak':{icon:'🛏️',priz:4,lamba:1,islak:false},
  'Koridor':{icon:'🚪',priz:1,lamba:1,islak:false},
  'Balkon':{icon:'☀️',priz:1,lamba:1,islak:false}
};

/* ── DURUM ── */
var mlzState = {
  binaTip:'', katSay:1, hatTip:'havai', kolonMat:'bakir',
  daireTipleri:[], cihazlar:[], diyafon:'zil', kamera:0, kameraGun:15, asansor:false,
  toprakYontem:'kazik', toprakKazik:1, binaA:10, binaB:10
};

/* Oda listesi oluştur */
function mlzOdaListesi(tip) {
  var y=parseInt(tip); if(isNaN(y))y=3;
  var o=[
    {ad:'Salon',priz:6,lamba:2,tv:1,data:1,islak:false},
    {ad:'Mutfak',priz:6,lamba:2,tv:0,data:0,islak:false},
    {ad:'Banyo',priz:2,lamba:2,tv:0,data:0,islak:true},
    {ad:'WC',priz:1,lamba:1,tv:0,data:0,islak:true},
    {ad:'Koridor',priz:1,lamba:1,tv:0,data:0,islak:false},
    {ad:'Balkon',priz:1,lamba:1,tv:0,data:0,islak:false}
  ];
  for(var i=0;i<y;i++) o.push({ad:'Yatak Odası '+(i+1),priz:4,lamba:1,tv:1,data:1,islak:false});
  if(y>=3) o.push({ad:'2. Banyo',priz:2,lamba:2,tv:0,data:0,islak:true});
  return o;
}

/* Oda kartı HTML — TV/Data dahil */
function mlzOdaKartHTML(oda, gIdx, oIdx) {
  var id='d'+gIdx+'o'+oIdx;
  var islakLbl=oda.islak?' <span style="color:var(--gold);font-size:10px;">(Etanj IP44)</span>':'';
  var h='<div class="mlz-oda-card" style="position:relative;">';
  h+='<button onclick="mlzOdaSil('+gIdx+','+oIdx+')" style="position:absolute;top:6px;right:6px;width:22px;height:22px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:4px;cursor:pointer;font-size:12px;line-height:1;">✕</button>';
  h+='<div class="mlz-oda-card-title">'+(MLZ_ODA_VARS[oda.ad.split(' ')[0]]||{icon:'🏠'}).icon+' '+oda.ad+'</div>';
  h+='<div class="mlz-oda-row"><span class="mlz-oda-label">Priz'+islakLbl+'</span><div class="mlz-pm">';
  h+='<button onclick="mlzPM(\''+id+'\',\'priz\',-1)">−</button>';
  h+='<span id="mlz-p-'+id+'">'+oda.priz+'</span>';
  h+='<button onclick="mlzPM(\''+id+'\',\'priz\',1)">+</button></div></div>';
  h+='<div class="mlz-oda-row"><span class="mlz-oda-label">Lamba</span><div class="mlz-pm">';
  h+='<button onclick="mlzPM(\''+id+'\',\'lamba\',-1)">−</button>';
  h+='<span id="mlz-l-'+id+'">'+oda.lamba+'</span>';
  h+='<button onclick="mlzPM(\''+id+'\',\'lamba\',1)">+</button></div></div>';
  h+='<div class="mlz-oda-row"><span class="mlz-oda-label">📺 TV/Uydu</span><div class="mlz-pm">';
  h+='<button onclick="mlzPM(\''+id+'\',\'tv\',-1)">−</button>';
  h+='<span id="mlz-t-'+id+'">'+oda.tv+'</span>';
  h+='<button onclick="mlzPM(\''+id+'\',\'tv\',1)">+</button></div></div>';
  h+='<div class="mlz-oda-row"><span class="mlz-oda-label">🌐 Data</span><div class="mlz-pm">';
  h+='<button onclick="mlzPM(\''+id+'\',\'data\',-1)">−</button>';
  h+='<span id="mlz-da-'+id+'">'+oda.data+'</span>';
  h+='<button onclick="mlzPM(\''+id+'\',\'data\',1)">+</button></div></div>';
  h+='</div>';
  return h;
}

function mlzPM(id, key, dir) {
  var parts=id.replace('d','').split('o'), gi=parseInt(parts[0]), oi=parseInt(parts[1]);
  var dt=mlzState.daireTipleri[gi]; if(!dt||!dt.odalar[oi]) return;
  dt.odalar[oi][key]=Math.max(0,dt.odalar[oi][key]+dir);
  var prefix=key==='priz'?'p':key==='lamba'?'l':key==='tv'?'t':'da';
  var el=document.getElementById('mlz-'+prefix+'-'+id);
  if(el)el.textContent=dt.odalar[oi][key];
}

/* Adımları göster/gizle */
function mlzGoster(ids){ids.forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='block';});}
function mlzGizle(ids){ids.forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='none';});}

/* ── BİNA TİPİ SEÇİMİ ── */
function mlzBinaSec(tip, btn) {
  mlzState.binaTip=tip;
  document.querySelectorAll('[data-bina]').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  mlzGizle(['mlz-villa-kat','mlz-apt-detay','mlz-s2','mlz-s5']);
  mlzState.daireTipleri=[];

  if(tip==='villa') {
    document.getElementById('mlz-villa-kat').style.display='block';
    mlzState.katSay=2;
  } else if(tip==='apartman') {
    document.getElementById('mlz-apt-detay').style.display='block';
    mlzState.katSay=parseInt(document.getElementById('mlz-apt-kat').value)||5;
    mlzGoster(['mlz-s2','mlz-s5']);
    mlzDaireEkle();
  } else {
    mlzState.katSay=1;
  }

  if(tip!=='apartman') {
    mlzState.daireTipleri=[{tip:'3+1',adet:1,odalar:mlzOdaListesi(3)}];
    mlzOdaRender();
    mlzGoster(['mlz-s2b']);
  }
  mlzGoster(['mlz-s3','mlz-s4','mlz-s4b','mlz-s6','mlz-s7','mlz-hesapla-wrap']);
  mlzGizle(['mlz-sonuc']);
}

/* Oda ekle (müstakil/villa) */
function mlzOdaEkle() {
  var isim=prompt('Oda adını girin (örn: Çalışma Odası, Kiler, Giyinme):');
  if(!isim||!isim.trim()) return;
  var dt=mlzState.daireTipleri[0]; if(!dt) return;
  dt.odalar.push({ad:isim.trim(),priz:2,lamba:1,tv:0,data:0,islak:false});
  mlzOdaRender();
}

/* Oda sil */
function mlzOdaSil(gIdx, oIdx) {
  var dt=mlzState.daireTipleri[gIdx]; if(!dt) return;
  if(dt.odalar.length<=1) return; // en az 1 oda kalmalı
  dt.odalar.splice(oIdx, 1);
  mlzOdaRender();
}

/* ── DAİRE YÖNETİMİ (Apartman) ── */
function mlzDaireEkle() {
  mlzState.daireTipleri.push({tip:'3+1',adet:1,odalar:mlzOdaListesi(3)});
  mlzDaireRender();
}

function mlzDaireSil(idx) {
  if(mlzState.daireTipleri.length<=1) return;
  mlzState.daireTipleri.splice(idx,1);
  mlzDaireRender();
  mlzOdaRender();
}

function mlzDaireTipDegis(idx, tip) {
  var y=parseInt(tip); if(isNaN(y))y=3;
  mlzState.daireTipleri[idx].tip=tip;
  mlzState.daireTipleri[idx].odalar=mlzOdaListesi(y);
  mlzOdaRender();
}

function mlzDaireAdetDegis(idx, val) {
  mlzState.daireTipleri[idx].adet=Math.max(1,parseInt(val)||1);
}

function mlzDaireRender() {
  var el=document.getElementById('mlz-daire-listesi'); if(!el) return;
  el.innerHTML=mlzState.daireTipleri.map(function(d,i){
    return '<div class="mlz-daire-blok"><div class="mlz-daire-head">'+
      '<div style="display:flex;align-items:center;gap:10px;">'+
      '<span style="font-weight:600;font-size:13px;">Daire Tipi '+(i+1)+'</span>'+
      '<select onchange="mlzDaireTipDegis('+i+',this.value)">'+
      ['1+1','2+1','3+1','4+1','5+1'].map(function(t){return '<option value="'+t+'"'+(d.tip===t?' selected':'')+'>'+t+'</option>';}).join('')+
      '</select>'+
      '<label style="font-size:12px;color:var(--gray);margin-left:8px;">Adet:</label>'+
      '<input type="number" value="'+d.adet+'" min="1" max="50" class="mlz-input-sm" style="width:60px;" onchange="mlzDaireAdetDegis('+i+',this.value)">'+
      '</div>'+
      (mlzState.daireTipleri.length>1?'<button class="mlz-daire-sil" onclick="mlzDaireSil('+i+')">✕</button>':'')+
      '</div></div>';
  }).join('');
  mlzOdaRender();
  mlzGoster(['mlz-s2b']);
}

/* ── ODA KARTLARI RENDER ── */
function mlzOdaRender() {
  var el=document.getElementById('mlz-oda-konteyner'); if(!el) return;
  var html='';
  mlzState.daireTipleri.forEach(function(d,gi){
    var baslik=mlzState.binaTip==='apartman'?'<div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--gold);">'+d.tip+' Daire ('+d.adet+' adet)</div>':'';
    html+=baslik+'<div class="mlz-oda-grid">'+d.odalar.map(function(o,oi){return mlzOdaKartHTML(o,gi,oi);}).join('')+'</div>';
    if(gi<mlzState.daireTipleri.length-1) html+='<hr style="margin:12px 0;border:none;border-top:1px solid var(--gray-light);">';
  });
  if(mlzState.binaTip!=='apartman') {
    html+='<button class="mlz-ekle-btn" style="margin-top:10px;" onclick="mlzOdaEkle()">+ Oda Ekle</button>';
  }
  el.innerHTML=html;
}

/* ── KABLO KESİT SEÇİCİ ── */
function mlzKesitSec(akim, malzeme) {
  var tablo=malzeme==='bakir'?MLZ.nyy_kapasite:MLZ.nayy_kapasite;
  for(var i=0;i<tablo.length;i++){if(tablo[i].a>=akim)return tablo[i];}
  return tablo[tablo.length-1];
}
function mlzNymSec(akim) {
  for(var i=0;i<MLZ.nym_kapasite.length;i++){if(MLZ.nym_kapasite[i].a>=akim)return MLZ.nym_kapasite[i];}
  return MLZ.nym_kapasite[MLZ.nym_kapasite.length-1];
}
function mlzAerSec(akim) {
  for(var i=0;i<MLZ.aer_kapasite.length;i++){if(MLZ.aer_kapasite[i].a>=akim)return MLZ.aer_kapasite[i];}
  return MLZ.aer_kapasite[MLZ.aer_kapasite.length-1];
}
/* Besleme hattı kablo seçimi — 4 kombinasyon */
function mlzBeslemeSec(akim, hatTip, kolonMat, trifaze) {
  var damar=trifaze?'4':'2';
  if(hatTip==='havai' && kolonMat==='aluminyum') {
    var k=mlzAerSec(akim); return {label:'AER '+k.mm+' (havai alüminyum)',mm:k.mm,a:k.a};
  }
  if(hatTip==='havai' && kolonMat==='bakir') {
    var k=mlzNymSec(akim); return {label:'NYM '+damar+'×'+k.mm+'mm² (havai bakır)',mm:k.mm,a:k.a};
  }
  if(hatTip==='yeralti' && kolonMat==='bakir') {
    var k=mlzKesitSec(akim,'bakir'); return {label:'NYY '+damar+'×'+k.mm+'mm² (yeraltı bakır)',mm:k.mm,a:k.a};
  }
  // yeralti + aluminyum
  var k=mlzKesitSec(akim,'aluminyum'); return {label:'NAYY '+damar+'×'+k.mm+'mm² (yeraltı alüminyum)',mm:k.mm,a:k.a};
}
function mlzTmsSec(akim){
  for(var i=0;i<MLZ.tms_std.length;i++){if(MLZ.tms_std[i]>=akim)return MLZ.tms_std[i];}
  return MLZ.tms_std[MLZ.tms_std.length-1];
}

/* ── EŞ ZAMANLILIK ── */
function mlzEszKatsayi(daireSay) {
  if(daireSay<=2) return 0.60;
  for(var i=0;i<MLZ_ESZ.length;i++){if(daireSay>=MLZ_ESZ[i].min&&daireSay<=MLZ_ESZ[i].max)return MLZ_ESZ[i].k;}
  return 0.23;
}
function mlzEszMustakil(gucW) {
  if(gucW<=8000) return gucW*0.6;
  return 8000*0.6+(gucW-8000)*0.4;
}

/* ══════════════════════════════════════════
   ANA HESAPLAMA MOTORU
   ══════════════════════════════════════════ */
function mlzHesapla() {
  var S=mlzState, isBina=S.binaTip==='apartman';
  var katSay=S.katSay, direkM=parseInt(document.getElementById('mlz-direk').value)||10;

  // Cihazları topla (zorunlu dahil — disabled+checked olanlar da sayılır)
  var cihazlar=[];
  document.querySelectorAll('#mlz-cihaz-grid input[type="checkbox"]').forEach(function(c){
    if(c.checked || c.dataset.zorunlu==='1'){
      cihazlar.push({ad:c.dataset.name,watt:parseInt(c.dataset.watt)});
    }
  });

  // ── DAİRE BAZLI HESAPLAR ──
  var topDaire=0, daireSonuclar=[];
  S.daireTipleri.forEach(function(dt){
    var tPriz=0,tLamba=0,tIslakPriz=0,tTV=0,tData=0;
    dt.odalar.forEach(function(o){
      if(o.islak){tIslakPriz+=o.priz;} else {tPriz+=o.priz;}
      tLamba+=o.lamba;
      tTV+=(o.tv||0);
      tData+=(o.data||0);
    });
    var prizGuc=(tPriz+tIslakPriz)*MLZ.watt_priz, lambaGuc=tLamba*MLZ.watt_lamba;
    var cihazGuc=cihazlar.reduce(function(s,c){return s+c.watt;},0);
    var daireGuc=Math.round((prizGuc+lambaGuc+cihazGuc)*MLZ.emniyet);

    // Hat sayıları
    var prizHat=Math.ceil((tPriz+tIslakPriz)/MLZ.max_priz_hat);
    var lambaHat=Math.ceil(tLamba/MLZ.max_lamba_hat);

    // MCB listesi
    var mcbs=[];
    for(var i=0;i<lambaHat;i++) mcbs.push({tip:'1P',a:'10A',acl:'Aydınlatma '+(i+1)});
    for(var i=0;i<prizHat;i++) mcbs.push({tip:'1P',a:'16A',acl:'Priz '+(i+1)});
    cihazlar.forEach(function(c){
      var mcbA=c.watt>MLZ.mustakil_esik?'25A':'16A';
      mcbs.push({tip:'1P',a:mcbA,acl:c.ad});
    });

    // Kablo daire içi (tek daire)
    var katKatsayi=S.binaTip==='villa'?(S.katSay===2?1.4:1.7):1.0;
    // 1.5mm² — aydınlatma sorti kablosu
    var k15=Math.round(tLamba*MLZ.kablo_lamba*MLZ.emniyet*katKatsayi);
    // 2.5mm² — priz kablosu + aydınlatma linye kablosu (her linye 10m)
    var k25=Math.round((tPriz+tIslakPriz)*MLZ.kablo_priz*MLZ.emniyet*katKatsayi);
    k25+=Math.round(lambaHat*MLZ.aydinlatma_linye*katKatsayi); // aydınlatma linyesi 2.5mm²
    var k4=0;
    cihazlar.forEach(function(c){
      if(c.watt>MLZ.mustakil_esik){k4+=MLZ.kablo_mustakil;}else{k25+=MLZ.kablo_mustakil;}
    });

    // Eş zamanlı güç (daire bazlı — müstakil formül)
    var eszGuc=mlzEszMustakil(daireGuc);
    var daireAkim=eszGuc/220; // daire içi monofaze baz

    // Pano modül
    var topMcb=mcbs.length+2; // +RCD+boşluk
    var panoMod=topMcb<=12?12:topMcb<=18?18:topMcb<=24?24:36;

    var boru=Math.round((k15+k25+k4)*MLZ.boru_k);
    var buat=dt.odalar.length*MLZ.buat_oda;

    daireSonuclar.push({
      tip:dt.tip, adet:dt.adet,
      priz:tPriz, islakPriz:tIslakPriz, lamba:tLamba, tv:tTV, data:tData,
      guc:daireGuc, eszGuc:Math.round(eszGuc), akim:Math.round(daireAkim*10)/10,
      mcbs:mcbs, panoMod:panoMod,
      k15:k15, k25:k25, k4:k4, boru:boru, buat:buat
    });
    topDaire+=dt.adet;
  });

  // ── BİNA GENELİ ──
  var topKuruluGuc=0, topEszGuc=0;
  daireSonuclar.forEach(function(d){topKuruluGuc+=d.guc*d.adet;});

  if(isBina) {
    var eszK=mlzEszKatsayi(topDaire);
    topEszGuc=Math.round(topKuruluGuc*eszK);
  } else {
    topEszGuc=daireSonuclar[0]?daireSonuclar[0].eszGuc:0;
  }

  // Asansör
  var asansorGuc=0, asansorAkim=0;
  if(S.asansor && isBina) {
    asansorGuc=Math.round(katSay*MLZ.asansor_kw_kat*1000);
    asansorAkim=Math.round(asansorGuc/(1.732*380)*10)/10;
    topEszGuc+=asansorGuc; // Asansör tam yükte eklenir
  }

  // Sistem tipi
  var trifaze=topEszGuc>5000;
  var voltaj=trifaze?380:220;
  var binaAkim;
  if(trifaze){binaAkim=topEszGuc/(1.732*380);}else{binaAkim=topEszGuc/220;}
  binaAkim=Math.round(binaAkim*10)/10;

  // TMŞ
  var tms=mlzTmsSec(binaAkim);

  // 1) Önce İÇ KOLON hesapla (her zaman bakır NYY, min 6mm²)
  var kolonDamar=trifaze?'4':'2';
  var kolonSonuclar=[];
  var maxKolonKesit=MLZ.kolon_min; // en büyük kolon kesitini takip et
  if(isBina) {
    daireSonuclar.forEach(function(d){
      var dAkim=trifaze?d.eszGuc/(1.732*380):d.eszGuc/220;
      dAkim=Math.round(dAkim*10)/10;
      var kKesit=mlzKesitSec(dAkim,'bakir');
      if(kKesit.mm<MLZ.kolon_min) kKesit={mm:MLZ.kolon_min,a:34};
      if(kKesit.mm>maxKolonKesit) maxKolonKesit=kKesit.mm;
      var ortaKat=Math.ceil(katSay/2);
      var kM=Math.round((ortaKat*MLZ.kat_h+MLZ.kolon_ek)*d.adet);
      kolonSonuclar.push({tip:d.tip,adet:d.adet,kesit:kKesit.mm,damar:kolonDamar,metre:kM,akim:dAkim});
    });
  } else {
    // Müstakil/villa — kolon akımı eş zamanlı güçten ve sistem voltajından hesaplanır
    var dAkim=trifaze?topEszGuc/(1.732*380):topEszGuc/220;
    dAkim=Math.round(dAkim*10)/10;
    var kKesit=mlzKesitSec(dAkim,'bakir');
    if(kKesit.mm<MLZ.kolon_min) kKesit={mm:MLZ.kolon_min,a:34};
    if(kKesit.mm>maxKolonKesit) maxKolonKesit=kKesit.mm;
    var kM=MLZ.ic_kolon+(S.binaTip==='villa'?(S.katSay*MLZ.kat_h):0);
    kolonSonuclar.push({tip:'Kolon',adet:1,kesit:kKesit.mm,damar:kolonDamar,metre:Math.round(kM),akim:dAkim});
  }

  // 2) BESLEME kablosu hesapla — 4 kombinasyon
  //    KURAL: Besleme akım kapasitesi >= en büyük kolon akım kapasitesi olmalı
  var maxKolonAkimKap=0; // kolon kablolarının en büyük akım kapasitesi
  kolonSonuclar.forEach(function(k){
    // Kolon her zaman bakır NYY — kapasitesini bul
    for(var i=0;i<MLZ.nyy_kapasite.length;i++){
      if(MLZ.nyy_kapasite[i].mm===k.kesit){
        if(MLZ.nyy_kapasite[i].a>maxKolonAkimKap) maxKolonAkimKap=MLZ.nyy_kapasite[i].a;
        break;
      }
    }
  });
  // Besleme en az kolon akım kapasitesi kadar olmalı
  var besMinAkim=Math.max(binaAkim, maxKolonAkimKap);
  var besleme=mlzBeslemeSec(besMinAkim, S.hatTip, S.kolonMat, trifaze);
  var besM=direkM+5;

  // Ortak alan — SADECE bina/apartman, müstakil/villa'da YOK
  var ortakK15=0,ortakLamba=0,ortakAnahtar=0;
  if(isBina) {
    ortakLamba=katSay*MLZ.ortak_lamba_kat+MLZ.ortak_giris;
    ortakK15=katSay*MLZ.ortak_kablo_kat;
    ortakAnahtar=1;
  }

  // Asansör kuyu tesisat — sadece bina
  var asanKuyu={lamba:0,buton:0,priz:0,darbeli:0,kablo:0};
  if(S.asansor && isBina) {
    asanKuyu.lamba=katSay;
    asanKuyu.buton=katSay;
    asanKuyu.darbeli=1;
    asanKuyu.priz=2+Math.floor(katSay/3);
    asanKuyu.kablo=Math.round(katSay*MLZ.kat_h+5);
  }

  // Diyafon — kameralı sistemde DT8 YOK, CAT6 + 2x0.75 besleme
  var diyMalz=[];
  var saftKabloM=isBina?Math.round(katSay*MLZ.kat_h+5):5;
  var daireyeKabloM=isBina?Math.round(topDaire*4):4;
  if(S.diyafon==='zil'){
    diyMalz.push(
      {m:'Kapı zili',a:isBina?topDaire:1},
      {m:'Zil butonu',a:isBina?topDaire:1},
      {m:'NYM 2×0.75 kablo',a:(isBina?(topDaire*5+katSay*3):5)+' m'}
    );
  } else if(S.diyafon==='ahize'){
    diyMalz.push(
      {m:'Dış panel / giriş ünitesi',a:1},
      {m:'Güç kaynağı / PSU',a:1},
      {m:'İç ünite ahize',a:isBina?topDaire:1},
      {m:'Light buton (daire başı)',a:isBina?topDaire:1},
      {m:'DT8 şaft kablo',a:saftKabloM+' m'},
      {m:'DT8 şaftan daireye kablo',a:daireyeKabloM+' m'}
    );
  } else {
    // Kameralı — DT8 yok, CAT6 + 2x0.75 besleme
    diyMalz.push(
      {m:'Dış panel (kameralı)',a:1},
      {m:'Güç kaynağı / PSU',a:1},
      {m:'İç ünite monitor',a:isBina?topDaire:1},
      {m:'Light buton (daire başı)',a:isBina?topDaire:1},
      {m:'CAT6 şaft kablo (sinyal)',a:saftKabloM+' m'},
      {m:'CAT6 şaftan daireye kablo',a:daireyeKabloM+' m'},
      {m:'NYM 2×0.75 besleme kablosu',a:saftKabloM+' m'}
    );
  }

  // Kamera — buat yok (zayıf akım müstakil ilerler)
  var kamMalz=[];
  if(S.kamera>0){
    kamMalz.push(
      {m:'IP Kamera',a:S.kamera},
      {m:'Talep edilen kayıt süresi',a:S.kameraGun+' gün'}
    );
  }

  // Max iç tesisat akımı
  var maxIcAkim=0, maxIcCihaz='Priz hattı (16A)';
  cihazlar.forEach(function(c){var ca=c.watt/220;if(ca>maxIcAkim){maxIcAkim=ca;maxIcCihaz=c.ad;}});
  if(maxIcAkim<16){maxIcAkim=16;maxIcCihaz='Priz hattı';}
  maxIcAkim=Math.round(maxIcAkim*10)/10;

  // ═══ SONUÇ HTML ═══
  var html='';
  function tbl(baslik,rows){
    var t='<div class="mlz-sonuc-grup"><div class="mlz-sonuc-baslik">'+baslik+'</div><table class="mlz-sonuc-tablo"><tbody>';
    rows.forEach(function(r){t+='<tr><td>'+r[0]+'</td><td style="text-align:right;font-weight:600;">'+r[1]+'</td></tr>';});
    return t+'</tbody></table></div>';
  }

  // Özet
  html+='<div class="mlz-ozet-kutu">';
  html+='<div class="mlz-ozet-item"><div class="mlz-ozet-val">'+(topKuruluGuc/1000).toFixed(1)+'</div><div class="mlz-ozet-lbl">Kurulu Güç (kW)</div></div>';
  html+='<div class="mlz-ozet-item"><div class="mlz-ozet-val">'+(topEszGuc/1000).toFixed(1)+'</div><div class="mlz-ozet-lbl">Eş Zamanlı (kW)</div></div>';
  html+='<div class="mlz-ozet-item"><div class="mlz-ozet-val">'+(trifaze?'3 Faz':'Mono')+'</div><div class="mlz-ozet-lbl">Sistem ('+voltaj+'V)</div></div>';
  html+='<div class="mlz-ozet-item"><div class="mlz-ozet-val">'+binaAkim+'A</div><div class="mlz-ozet-lbl">Besleme Akımı</div></div>';
  if(isBina) html+='<div class="mlz-ozet-item"><div class="mlz-ozet-val">'+topDaire+'</div><div class="mlz-ozet-lbl">Toplam Daire</div></div>';
  html+='<div class="mlz-ozet-item"><div class="mlz-ozet-val">'+maxIcAkim+'A</div><div class="mlz-ozet-lbl">Max İç Tesisat</div></div>';
  html+='</div>';

  // ADP
  var adpRows=[['Kofre','1 adet']];
  if(tms>50) adpRows.push(['TMŞ '+tms+'A','1 adet']);
  adpRows.push(['Sayaç ('+(trifaze?'3 Faz':'Monofaze')+')',topDaire+' adet']);
  // ADP RCD: min 40A, 300mA
  adpRows.push([(trifaze?'4P':'2P')+' RCD 40A 300mA (daire başı)',topDaire+' adet']);
  // ADP MCB: min 32A per daire — her daire tipi kendi eş zamanlı akımına göre
  daireSonuclar.forEach(function(d){
    // Daire kolon akımı — eş zamanlı güçten
    var dKolonAkim=trifaze?d.eszGuc/(1.732*380):d.eszGuc/220;
    dKolonAkim=Math.round(dKolonAkim*10)/10;
    var mcbA=MLZ.mcb_std.find(function(v){return v>=dKolonAkim;})||32;
    if(mcbA<32) mcbA=32; // ADP MCB min 32A
    adpRows.push([(trifaze?'4P':'2P')+' MCB '+mcbA+'A — '+d.tip,d.adet+' adet']);
  });
  if(isBina) {
    adpRows.push(['Ortak alan '+(trifaze?'4P':'2P')+' RCD 40A 300mA','1 adet']);
    adpRows.push(['Ortak alan MCB 10A','1 adet']);
  }
  if(S.asansor && isBina){
    adpRows.push(['Asansör 4P RCD 40A 300mA','1 adet']);
    var asanMcb=MLZ.mcb_std.find(function(v){return v>=asansorAkim;})||32;
    if(asanMcb<32) asanMcb=32;
    adpRows.push(['Asansör 4P MCB '+asanMcb+'A','1 adet']);
  }
  html+=tbl('⚡ Ana Dağıtım Panosu (ADP)',adpRows);

  // Daire panoları — MCB max 25A kısıtı (1P, 2P, 4P)
  daireSonuclar.forEach(function(d){
    var pRows=[];
    pRows.push(['Pano boyutu',d.panoMod+' modül']);
    pRows.push([(trifaze?'4P':'2P')+' RCD 30mA 25A','1 adet']);
    // MCB'leri amper değerine göre grupla — max 25A kısıtı
    var mcbGrup={};
    d.mcbs.forEach(function(m){
      // Daire içi MCB max 25A kısıtı
      var ampVal=parseInt(m.a);
      var key=(ampVal>25?'25A':m.a);
      if(!mcbGrup[key]) mcbGrup[key]={a:key,adet:0,acl:[]};
      mcbGrup[key].adet++;
      if(mcbGrup[key].acl.indexOf(m.acl)===-1) mcbGrup[key].acl.push(m.acl);
    });
    Object.keys(mcbGrup).forEach(function(k){
      var g=mcbGrup[k];
      var acl=g.acl.length<=2?g.acl.join(', '):(g.acl.slice(0,2).join(', ')+' vb.');
      pRows.push(['1P MCB '+g.a+' — '+acl, g.adet+' adet']);
    });
    html+=tbl('🏠 Daire Panosu — '+d.tip+' ('+d.adet+' adet)',pRows);
  });

  // Kablolar — besleme & kolon
  var kabloRows=[];
  kabloRows.push([besleme.label, besM+' m']);
  kolonSonuclar.forEach(function(k){
    kabloRows.push(['NYY '+k.damar+'×'+k.kesit+'mm² (iç kolon — '+k.tip+')',k.metre+' m']);
  });
  html+=tbl('🔌 Kablolar — Besleme & Kolon',kabloRows);

  // Kablolar — daire içi
  var dicRows=[];
  var topK15=0,topK25=0,topK4=0,topBoru=0,topBuat=0,topPriz=0,topIslak=0,topLamba=0,topAnahtar=0,topTV=0,topData=0;
  daireSonuclar.forEach(function(d){
    topK15+=d.k15*d.adet; topK25+=d.k25*d.adet; topK4+=d.k4*d.adet;
    topBoru+=d.boru*d.adet; topBuat+=d.buat*d.adet;
    topPriz+=d.priz*d.adet; topIslak+=d.islakPriz*d.adet;
    topLamba+=d.lamba*d.adet; topAnahtar+=d.lamba*d.adet;
    topTV+=(d.tv||0)*d.adet; topData+=(d.data||0)*d.adet;
  });
  if(topK15>0) dicRows.push(['NYM 3×1.5mm² (aydınlatma sorti)',topK15+' m']);
  if(topK25>0) dicRows.push(['NYM 3×2.5mm² (priz + linye + müstakil)',topK25+' m']);
  if(topK4>0) dicRows.push(['NYM 3×4mm² (yüksek güç >3200W)',topK4+' m']);
  // Zayıf akım — müstakil ilerler, buat yok
  // Baz: 20m/nokta + villa/bina'da kat metrajı eklenir
  var katEk=0;
  if(S.binaTip==='villa') katEk=S.katSay*MLZ.kat_h;
  else if(isBina) katEk=Math.ceil(katSay/2)*MLZ.kat_h; // ortalama kat
  var tvMetraj=topTV>0?Math.round(topTV*(MLZ.zayif_baz+katEk)):0;
  var dataMetraj=topData>0?Math.round(topData*(MLZ.zayif_baz+katEk)):0;
  if(tvMetraj>0) dicRows.push(['RG6 kablo (TV/Uydu) — buat yok, müstakil',tvMetraj+' m']);
  if(dataMetraj>0) dicRows.push(['CAT6 kablo (Data) — buat yok, müstakil',dataMetraj+' m']);
  html+=tbl('🔌 Kablolar — Daire İçi (toplam ×'+topDaire+' daire)',dicRows);

  // Ortak alan (bina)
  if(isBina){
    var ortRows=[['NYM 3×1.5mm² (ortak alan aydınlatma)',ortakK15+' m'],['Lamba noktası (merdiven+giriş)',ortakLamba+' adet'],['Dakik anahtar (zaman rölesi)',ortakAnahtar+' adet']];
    html+=tbl('🏢 Ortak Alan Tesisatı',ortRows);
  }

  // Asansör
  if(S.asansor && isBina){
    var asRows=[];
    asRows.push(['HFFR '+MLZ.asansor_min_kesit+'mm² 5P (besleme)',asanKuyu.kablo+' m']);
    asRows.push(['Kuyu aydınlatma noktası',asanKuyu.lamba+' adet']);
    asRows.push(['Light buton',asanKuyu.buton+' adet']);
    asRows.push(['Darbeli akım anahtarı','1 adet']);
    asRows.push(['Priz (kuyu)',asanKuyu.priz+' adet']);
    asRows.push(['Asansör motor gücü',(asansorGuc/1000).toFixed(1)+' kW / '+asansorAkim+'A']);
    html+=tbl('🛗 Asansör Kuyu Tesisatı',asRows);
    html+='<div style="font-size:11px;color:var(--gray);padding:6px 12px;background:rgba(0,0,0,0.03);border-radius:6px;margin-bottom:12px;">ℹ️ Asansör kumanda panosu ve asansör malzemeleri ilgili firma tarafından temin edilir, burada listelenmez.</div>';
  }

  // Borulama
  if(isBina) topBoru+=Math.round(ortakK15*MLZ.boru_k);
  html+=tbl('🔧 Borulama & Buat',[['Boru / kanal',topBoru+' m'],['Buat',topBuat+' adet']]);

  // Priz & anahtar
  var paRows=[['Normal priz',topPriz+' adet']];
  if(topIslak>0) paRows.push(['Etanj priz (IP44 — ıslak hacim)',topIslak+' adet']);
  paRows.push(['Anahtar',topAnahtar+' adet'],['Aydınlatma noktası',topLamba+' adet']);
  if(topTV>0) paRows.push(['TV/Uydu prizi',topTV+' adet']);
  if(topData>0) paRows.push(['Data prizi (RJ45)',topData+' adet']);
  // Anahtar/priz kasası — her priz ve anahtar noktası için 1 kasa
  var topKasa=(topPriz+topIslak+topAnahtar)*topDaire;
  paRows.push(['Anahtar/Priz kasası (sıva altı)',topKasa+' adet']);
  html+=tbl('🔲 Priz & Anahtar',paRows);

  // Topraklama sistemi — daire başına hesapla
  // Topraklama sistemi — kazık veya galvaniz şerit
  var toprakRows=[];
  var tA=parseInt(document.getElementById('mlz-bina-a').value)||10;
  var tB=parseInt(document.getElementById('mlz-bina-b').value)||10;
  var cevre=2*(tA+tB); // bina çevresi
  var katEkToprak=S.katSay>1?(S.katSay-1)*8:0; // ek kat başına 8m kablo

  if(S.toprakYontem==='kazik') {
    var kazikAdet=parseInt(document.getElementById('mlz-toprak-kazik').value)||1;
    var toprakKabloM=cevre + (kazikAdet*8) + katEkToprak; // çevre + kazık başına 8m bağlantı + kat eki
    toprakRows.push(['Topraklama çubuğu (bakır kaplı, 1.5m)',kazikAdet+' adet']);
    toprakRows.push(['Topraklama kablosu NYA 1×16mm² (sarı-yeşil)',toprakKabloM+' m']);
    toprakRows.push(['Topraklama klemensi',kazikAdet+' adet']);
  } else {
    // Galvaniz şerit: çevre + 4 köşe × 1.5m bağlantı payı
    var seritM=cevre+6; // +6m sabit (4 köşe × 1.5m)
    var baglKabloM=Math.round(cevre*0.2)+katEkToprak+8; // şeritten panoya bağlantı kablosu
    toprakRows.push(['Galvaniz şerit 40×4mm',seritM+' m']);
    toprakRows.push(['Bağlantı kablosu NYA 1×16mm² (sarı-yeşil)',baglKabloM+' m']);
    toprakRows.push(['Şerit bağlantı klemensi','4 adet']);
  }
  toprakRows.push(['Eşpotansiyel bara (pano içi)',topDaire+' adet']);
  if(isBina) toprakRows.push(['Ana topraklama barası (ADP)','1 adet']);
  html+=tbl('🛡️ Topraklama Sistemi',toprakRows);

  // Diyafon
  var diyRows=diyMalz.map(function(d){return [d.m,d.a+(typeof d.a==='number'?' adet':'')];});
  html+=tbl('🔔 Diyafon / Zil',diyRows);

  // Kamera
  if(kamMalz.length>0){
    html+=tbl('📹 Güvenlik Kamerası',kamMalz.map(function(k){return [k.m,k.a+(typeof k.a==='number'?' adet':'')];}));
    html+='<div style="font-size:11px;color:var(--gray);padding:6px 12px;background:rgba(0,0,0,0.03);border-radius:6px;margin-bottom:12px;">ℹ️ Kayıt cihazı (NVR) ve harddisk bu listeye dahil değildir.</div>';
  }

  // Uyarı
  html+='<div class="mlz-uyari">🖼️ <strong>Çerçeveler:</strong> Montaj için gerekli tekli, ikili, üçlü ve dörtlü çerçeveler son aşamada priz/anahtar yerleşimine göre listeye eklenecektir.</div>';
  html+='<div class="mlz-uyari">⚠️ <strong>Bu malzeme listesi tahminidir</strong> ve genel mühendislik katsayılarına dayanır. Kesin malzeme listesi için sahada keşif gereklidir.<br>📞 Detaylı planlama: <a href="tel:+905340140949" style="color:var(--black);font-weight:700;">0534 014 09 49</a></div>';
  html+='<div style="margin-top:10px;padding:1rem 1.25rem;background:var(--black);border-radius:var(--radius);font-size:11px;color:rgba(255,255,255,0.5);line-height:1.8;"><strong style="color:rgba(255,255,255,0.7);">⚖️ Yasal Bilgilendirme</strong><br>Bu hesaplama aracı, T.S.E. (Türk Standartları Enstitüsü) Elektrik İç Tesisleri Yönetmeliği ve KCETAŞ bölgesel kabul kriterleri esas alınarak hazırlanmıştır. Araç yalnızca bilgilendirme amaçlıdır; kesin proje ve uygulama için yetkili elektrik mühendisi onayı gereklidir. Hesaplama sonuçlarının kullanımından doğabilecek her türlü sorumluluk kullanıcıya aittir. <strong style="color:rgba(255,255,255,0.7);">Bircan Elektrik Mühendislik</strong> bu aracın çıktılarına dayalı olarak gerçekleştirilen uygulamalardan hukuki sorumluluk kabul etmez.</div>';

  // WhatsApp — tam detaylı malzeme listesi
  var waMsg='🏗️ *Malzeme Planlama — Detaylı Liste*\n\n';
  waMsg+='📊 *Genel Bilgi*\n';
  waMsg+='Kurulu güç: '+(topKuruluGuc/1000).toFixed(1)+' kW\n';
  waMsg+='Eş zamanlı: '+(topEszGuc/1000).toFixed(1)+' kW\n';
  waMsg+='Sistem: '+(trifaze?'3 Faz 380V':'Monofaze 220V')+'\n';
  waMsg+='Besleme akımı: '+binaAkim+'A\n';
  waMsg+='Bina tipi: '+S.binaTip+' ('+topDaire+' daire)\n\n';

  waMsg+='⚡ *ADP (Ana Dağıtım Panosu)*\n';
  waMsg+='Kofre: 1 adet\n';
  if(tms>50) waMsg+='TMŞ: '+tms+'A\n';
  waMsg+='Sayaç: '+topDaire+' adet\n';
  waMsg+='RCD 300mA: '+topDaire+' adet\n';
  daireSonuclar.forEach(function(d){
    var dKolonAkim=trifaze?d.eszGuc/(1.732*380):d.eszGuc/220;
    var mcbA=MLZ.mcb_std.find(function(v){return v>=dKolonAkim;})||32;
    if(mcbA<32) mcbA=32;
    waMsg+='MCB '+mcbA+'A ('+d.tip+'): '+d.adet+' adet\n';
  });
  waMsg+='\n';

  waMsg+='🏠 *Daire Panosu*\n';
  daireSonuclar.forEach(function(d){
    waMsg+=d.tip+' ('+d.adet+' adet): '+d.panoMod+' modül\n';
    waMsg+=(trifaze?'4P':'2P')+' RCD 30mA 25A: 1 adet\n';
    var mcbGrup={};
    d.mcbs.forEach(function(m){var k=parseInt(m.a)>25?'25A':m.a;if(!mcbGrup[k])mcbGrup[k]=0;mcbGrup[k]++;});
    Object.keys(mcbGrup).forEach(function(k){waMsg+='1P MCB '+k+': '+mcbGrup[k]+' adet\n';});
  });
  waMsg+='\n';

  waMsg+='🔌 *Kablolar*\n';
  waMsg+=besleme.label+': '+besM+' m\n';
  kolonSonuclar.forEach(function(k){waMsg+='NYY '+k.damar+'×'+k.kesit+'mm² (kolon '+k.tip+'): '+k.metre+' m\n';});
  if(topK15>0) waMsg+='NYM 3×1.5mm² (sorti): '+topK15+' m\n';
  if(topK25>0) waMsg+='NYM 3×2.5mm² (priz+linye): '+topK25+' m\n';
  if(topK4>0) waMsg+='NYM 3×4mm²: '+topK4+' m\n';
  if(tvMetraj>0) waMsg+='RG6 (TV): '+tvMetraj+' m\n';
  if(dataMetraj>0) waMsg+='CAT6 (Data): '+dataMetraj+' m\n';
  waMsg+='\n';

  waMsg+='🔲 *Priz & Anahtar*\n';
  waMsg+='Priz: '+topPriz+' adet\n';
  if(topIslak>0) waMsg+='Etanj priz (IP44): '+topIslak+' adet\n';
  waMsg+='Anahtar: '+topAnahtar+' adet\n';
  waMsg+='Aydınlatma: '+topLamba+' adet\n';
  if(topTV>0) waMsg+='TV prizi: '+topTV+' adet\n';
  if(topData>0) waMsg+='Data prizi: '+topData+' adet\n';
  waMsg+='Anahtar/Priz kasası: '+topKasa+' adet\n';
  waMsg+='\n';

  waMsg+='🛡️ *Topraklama*\n';
  if(S.toprakYontem==='kazik'){
    var wKazik=parseInt(document.getElementById('mlz-toprak-kazik').value)||1;
    var wCevre=2*(tA+tB);
    var wKabloM=wCevre+(wKazik*8)+katEkToprak;
    waMsg+='Yöntem: Kazık (çubuk)\n';
    waMsg+='Topraklama çubuğu: '+wKazik+' adet\n';
    waMsg+='NYA 1×16mm²: '+wKabloM+' m\n';
    waMsg+='Klemensi: '+wKazik+' adet\n';
  } else {
    var wSerit=2*(tA+tB)+6;
    waMsg+='Yöntem: Galvaniz şerit\n';
    waMsg+='Galvaniz şerit 40×4mm: '+wSerit+' m\n';
    waMsg+='NYA 1×16mm² (bağlantı): '+(Math.round(wSerit*0.2)+katEkToprak+8)+' m\n';
  }
  waMsg+='Eşpotansiyel bara: '+topDaire+' adet\n';
  waMsg+='\n';

  waMsg+='🔔 *Diyafon*\n';
  diyMalz.forEach(function(d){waMsg+=d.m+': '+d.a+(typeof d.a==='number'?' adet':'')+'\n';});
  waMsg+='\n';

  if(kamMalz.length>0){
    waMsg+='📹 *Kamera*\n';
    kamMalz.forEach(function(k){waMsg+=k.m+': '+k.a+(typeof k.a==='number'?' adet':'')+'\n';});
    waMsg+='ℹ️ NVR ve HDD dahil değil\n\n';
  }

  if(S.asansor && isBina){
    waMsg+='🛗 *Asansör Kuyu*\n';
    waMsg+='HFFR '+MLZ.asansor_min_kesit+'mm² 5P: '+asanKuyu.kablo+' m\n';
    waMsg+='Kuyu lamba: '+asanKuyu.lamba+', buton: '+asanKuyu.buton+', priz: '+asanKuyu.priz+'\n\n';
  }

  waMsg+='⚠️ _Bu liste tahminidir. Keşif için arayın: 0534 014 09 49_';

  html+='<button class="mlz-teklif-btn" onclick="window.open(\'https://wa.me/905340140949?text='+encodeURIComponent(waMsg)+'\',\'_blank\')">📩 Bu Liste İçin Teklif Al (WhatsApp)</button>';

  var el=document.getElementById('mlz-sonuc');
  if(el){el.innerHTML=html;el.style.display='block';el.scrollIntoView({behavior:'smooth',block:'start'});}
}

/* ── REFERANS PROJELERİ ── */
var refData = [
  { cat:'konut', tag:'Konut', title:'Villa Komple Elektrik Tesisatı', loc:'📍 Yahyalı, Kayseri', desc:'350 m² villanın sıfırdan elektrik altyapısı. Kuvvetli ve zayıf akım tesisatı, pano imalatı, aydınlatma otomasyonu.', specs:['350 m²','Komple tesisat','Pano imalatı','Aydınlatma otomasyon'] },
  { cat:'konut', tag:'Konut', title:'Apartman Genel Tesisat Yenileme', loc:'📍 Develi, Kayseri', desc:'24 daireli apartmanın ortak alan ve daire içi elektrik tesisatının modernizasyonu. Yangın algılama entegrasyonu.', specs:['24 daire','Tesisat yenileme','Yangın algılama','Ortak alan'] },
  { cat:'ticari', tag:'Ticari', title:'Mağaza Aydınlatma Projesi', loc:'📍 Kayseri Merkez', desc:'250 m² perakende mağaza için LED aydınlatma senaryosu, PIR sensör entegrasyonu ve vitrin spot aydınlatması.', specs:['250 m²','LED tasarım','PIR sensör','Vitrin spot'] },
  { cat:'ticari', tag:'Ticari', title:'Otel Elektrik & Otomasyon', loc:'📍 Kayseri', desc:'60 odalı otel projesinde kat panoları, jeneratör bağlantısı, kartlı geçiş ve oda otomasyon sistemi.', specs:['60 oda','Kat panoları','Jeneratör','Kartlı geçiş'] },
  { cat:'endustriyel', tag:'Endüstriyel', title:'Fabrika PLC & SCADA Sistemi', loc:'📍 Kayseri OSB', desc:'Üretim hattı otomasyon sistemi. Siemens S7-1200 PLC, HMI panel ve SCADA ile üretim izleme ve kontrol.', specs:['PLC S7-1200','SCADA','HMI panel','Üretim hattı'] },
  { cat:'endustriyel', tag:'Endüstriyel', title:'Soğuk Hava Deposu Elektrik', loc:'📍 Develi, Kayseri', desc:'1500 m² soğuk hava deposu için kompresör kumanda panoları, enerji izleme ve alarm sistemi kurulumu.', specs:['1500 m²','Kompresör pano','Enerji izleme','Alarm sistemi'] },
  { cat:'altyapi', tag:'Altyapı', title:'Tarımsal Sulama Otomasyon', loc:'📍 Yahyalı, Kayseri', desc:'120 dönüm tarımsal alanda pompa istasyonu otomasyon, frekans konvertör ve uzaktan kontrol sistemi.', specs:['120 dönüm','Pompa otomasyon','Frekans konvertör','Uzaktan kontrol'] },
  { cat:'altyapi', tag:'Altyapı', title:'Trafo Merkezi & AG Dağıtım', loc:'📍 Tomarza, Kayseri', desc:'1000 kVA trafo merkezi AG pano imalatı, kompanzasyon sistemi ve enerji analizi.', specs:['1000 kVA','AG pano','Kompanzasyon','Enerji analizi'] },
  { cat:'konut', tag:'Konut', title:'Akıllı Ev Sistemi Kurulumu', loc:'📍 Kayseri Merkez', desc:'KNX tabanlı akıllı ev sistemi: aydınlatma senaryoları, perde kontrolü, ısıtma otomasyonu ve mobil uygulama.', specs:['KNX','Aydınlatma senaryo','Perde kontrol','Mobil uygulama'] },
  { cat:'ticari', tag:'Ticari', title:'Restaurant Komple Elektrik', loc:'📍 Yahyalı, Kayseri', desc:'180 m² restaurant projesi: mutfak güç hatları, salon aydınlatma, dış mekan IP65 armatürler ve güvenlik kamerası.', specs:['180 m²','Mutfak güç','IP65 dış mekan','Güvenlik kamera'] }
];

var activeRefFilter = 'all';

function filterRef(cat, btn) {
  activeRefFilter = cat;
  document.querySelectorAll('.ref-filter .rfbtn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderRef();
}

function renderRef() {
  var el = document.getElementById('ref-grid'); if (!el) return;
  var filtered = refData.filter(function(r) { return activeRefFilter === 'all' || r.cat === activeRefFilter; });
  el.innerHTML = filtered.map(function(r) {
    return '<div class="ref-card">' +
      '<div class="ref-card-header"><span class="ref-title">' + r.title + '</span><span class="ref-tag">' + r.tag + '</span></div>' +
      '<div class="ref-card-body">' +
        '<div class="ref-loc">' + r.loc + '</div>' +
        '<div class="ref-desc">' + r.desc + '</div>' +
        '<div class="ref-specs">' + r.specs.map(function(s) { return '<span class="ref-spec">' + s + '</span>'; }).join('') + '</div>' +
      '</div></div>';
  }).join('');
}

/* ── TEKLİF FORMU ── */
function submitTeklif() {
  var name = document.getElementById('tf-name').value.trim();
  var phone = document.getElementById('tf-phone').value.trim();
  var email = document.getElementById('tf-email').value.trim();
  var location = document.getElementById('tf-location').value.trim();
  var service = document.getElementById('tf-service');
  var serviceText = service.options[service.selectedIndex] ? service.options[service.selectedIndex].text : '';
  var detail = document.getElementById('tf-detail').value.trim();
  var status = document.getElementById('tf-status');

  // Validasyon
  if (!name || !phone || !location || !service.value) {
    if (status) {
      status.style.display = 'block';
      status.style.background = 'rgba(239,68,68,0.08)';
      status.style.color = '#ef4444';
      status.style.border = '1px solid rgba(239,68,68,0.2)';
      status.textContent = '⚠ Lütfen yıldızlı (*) alanları doldurun.';
    }
    return;
  }

  // WhatsApp mesajı oluştur
  var msg = '📩 *Yeni Teklif Talebi*\n\n';
  msg += '👤 *Ad Soyad:* ' + name + '\n';
  msg += '📞 *Telefon:* ' + phone + '\n';
  if (email) msg += '✉️ *E-posta:* ' + email + '\n';
  msg += '📍 *Konum:* ' + location + '\n';
  msg += '🔧 *Hizmet:* ' + serviceText + '\n';
  if (detail) msg += '\n📝 *Detay:*\n' + detail + '\n';
  msg += '\n_bircanelektrik.com.tr üzerinden gönderildi_';

  var waUrl = 'https://wa.me/905340140949?text=' + encodeURIComponent(msg);
  window.open(waUrl, '_blank');

  if (status) {
    status.style.display = 'block';
    status.style.background = 'rgba(74,222,128,0.1)';
    status.style.color = '#16a34a';
    status.style.border = '1px solid rgba(74,222,128,0.3)';
    status.textContent = '✓ WhatsApp açıldı — mesajı gönderin.';
  }
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded',function(){
  /* Servis kartları */
  document.querySelectorAll('.svc-card').forEach(function(c,i){
    c.addEventListener('click',function(){
      var p=document.getElementById('detail');if(!p)return;
      if(activeSvc===i){activeSvc=null;p.classList.remove('visible');document.querySelectorAll('.svc-card').forEach(function(x){x.classList.remove('active');});return;}
      activeSvc=i;document.querySelectorAll('.svc-card').forEach(function(x){x.classList.remove('active');});c.classList.add('active');
      var s=services[i];p.classList.add('visible');
      p.innerHTML='<h3>'+s.icon+' '+s.title+'</h3><p>'+s.full+'</p><div class="features-wrap">'+s.features.map(function(f){return'<span class="feat-pill">'+f+'</span>';}).join('')+'</div>';
      setTimeout(function(){p.scrollIntoView({behavior:'smooth',block:'nearest'});},50);
    });
  });
  /* Accordion */
  document.querySelectorAll('.cat-btn').forEach(function(b){b.addEventListener('click',function(){toggleCat(this.getAttribute('data-cat'),this);});});
  /* Tab */
  document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){showTab(this.getAttribute('data-tab'),this,this.getAttribute('data-group'));});});
  /* Kelvin */
  document.querySelectorAll('[data-kelvin]').forEach(function(e){e.addEventListener('click',function(){setKelvin(parseInt(this.getAttribute('data-kelvin')));});});
  /* Faz */
  document.querySelectorAll('[data-faz]').forEach(function(b){b.addEventListener('click',function(){setFaz(this.getAttribute('data-faz'));});});
  /* Popup */
  document.querySelectorAll('[data-action="callpopup"]').forEach(function(b){b.addEventListener('click',showCallPopup);});
  var ov=document.getElementById('call-overlay');if(ov)ov.addEventListener('click',function(){if(this.getAttribute('data-action')==='hidepopup')hideCallPopup();});
  /* Rehber filtre butonları */
  document.querySelectorAll('.rfbtn').forEach(function(b){b.addEventListener('click',function(){filterRehber(this.getAttribute('data-filter'),this);});});
  /* Rehber render */
  renderRehber();
  /* Referans render */
  renderRef();
  document.querySelectorAll('.ref-filter .rfbtn').forEach(function(b) { b.addEventListener('click', function() { filterRef(this.getAttribute('data-ref-filter'), this); }); });
  /* Teklif formu */
  var tfBtn = document.getElementById('tf-submit'); if (tfBtn) tfBtn.addEventListener('click', submitTeklif);

  /* ── MALZEME PLANLAMA ARACI v2 ── */
  // Bina tipi
  document.querySelectorAll('[data-bina]').forEach(function(b){
    b.addEventListener('click',function(){ mlzBinaSec(this.dataset.bina, this); });
  });
  // Villa kat seçimi
  document.querySelectorAll('.mlz-kat-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-kat-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active');
      mlzState.katSay=parseInt(this.dataset.kat)||2;
      // Villa: oda kartlarını kat sayısıyla yeniden oluştur
      if(mlzState.binaTip==='villa'){
        mlzState.daireTipleri=[{tip:'3+1',adet:1,odalar:mlzOdaListesi(3)}];
        mlzOdaRender();
      }
    });
  });
  // Apartman kat sayısı
  var aptKat=document.getElementById('mlz-apt-kat');
  if(aptKat) aptKat.addEventListener('change',function(){mlzState.katSay=parseInt(this.value)||5;});
  // Daire ekle butonu
  var daireEkle=document.getElementById('mlz-daire-ekle');
  if(daireEkle) daireEkle.addEventListener('click',mlzDaireEkle);
  // Hat tipi
  document.querySelectorAll('.mlz-hat-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-hat-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active'); mlzState.hatTip=this.dataset.hat;
    });
  });
  // Kolon malzemesi
  document.querySelectorAll('.mlz-kolon-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-kolon-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active'); mlzState.kolonMat=this.dataset.kolon;
    });
  });
  // Topraklama yöntemi
  document.querySelectorAll('.mlz-toprak-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-toprak-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active');
      mlzState.toprakYontem=this.dataset.toprak;
      var kazikDiv=document.getElementById('mlz-kazik-adet');
      if(kazikDiv) kazikDiv.style.display=this.dataset.toprak==='kazik'?'block':'none';
    });
  });
  var toprakKazikEl=document.getElementById('mlz-toprak-kazik');
  if(toprakKazikEl) toprakKazikEl.addEventListener('change',function(){mlzState.toprakKazik=parseInt(this.value)||1;});
  var binaAEl=document.getElementById('mlz-bina-a');
  if(binaAEl) binaAEl.addEventListener('change',function(){mlzState.binaA=parseInt(this.value)||10;});
  var binaBEl=document.getElementById('mlz-bina-b');
  if(binaBEl) binaBEl.addEventListener('change',function(){mlzState.binaB=parseInt(this.value)||10;});
  // Asansör
  document.querySelectorAll('.mlz-asan-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-asan-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active'); mlzState.asansor=this.dataset.asan==='var';
    });
  });
  // Diyafon
  document.querySelectorAll('.mlz-diyafon-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-diyafon-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active'); mlzState.diyafon=this.dataset.diyafon;
    });
  });
  // Kamera
  document.querySelectorAll('.mlz-kam-btn').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.mlz-kam-btn').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active');
      var ka=document.getElementById('mlz-kam-adet');
      var kg=document.getElementById('mlz-kam-gun');
      if(this.dataset.kam==='var'){
        ka.style.display='block'; kg.style.display='block';
        mlzState.kamera=parseInt(document.getElementById('mlz-kamera-sayi').value)||2;
        mlzState.kameraGun=parseInt(document.getElementById('mlz-kamera-gun').value)||15;
      } else {
        ka.style.display='none'; kg.style.display='none'; mlzState.kamera=0;
      }
    });
  });
  var kamSayi=document.getElementById('mlz-kamera-sayi');
  if(kamSayi) kamSayi.addEventListener('change',function(){mlzState.kamera=parseInt(this.value)||0;});
  var kamGun=document.getElementById('mlz-kamera-gun');
  if(kamGun) kamGun.addEventListener('change',function(){mlzState.kameraGun=parseInt(this.value)||15;});
  // Hesapla
  var mlzBtn=document.getElementById('mlz-hesapla-btn');
  if(mlzBtn) mlzBtn.addEventListener('click',mlzHesapla);

  /* Email fix */
  document.querySelectorAll('a[href*="email-protection"]').forEach(function(a){a.href='mailto:bircannelektrik@gmail.com';});
  document.querySelectorAll('.__cf_email__,[data-cfemail]').forEach(function(e){e.textContent='bircannelektrik@gmail.com';e.removeAttribute('data-cfemail');e.className='';});
});

/* ── HARİTA — window.onload (KRİTİK) ── */
window.addEventListener('load',function(){
  if(typeof L==='undefined'){console.warn('Leaflet yüklenemedi');return;}
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      initHizmetHarita();
      initUcretHarita();
    });
  });
});
