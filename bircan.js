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

function haversineKm(a,b,c,d){
  var R=6371,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;
  var x=Math.sin(dL/2)*Math.sin(dL/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)*Math.sin(dl/2);
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

/* ── YOL MALİYETİ MOTORU ── */
var SFUEL=73,SCONS=9,SLABOR=1500,SKMR=8,SBASE=350,SPERKM=43,SDMAX=55,SPMAX=5000;
var SFUEL_SOURCE="yedek"; // "epdk" veya "yedek"
var SBENZIN=63.99; // benzin fiyatı varsayılan (API güncelleyecek)
/* Canlı yakıt fiyatı */
(function(){
  function parseFuelData(d){
    var arr=d.EPDK_Akaryakit_Fiyatlari||d.data||d;
    if(!Array.isArray(arr)||!arr.length)return;
    var entry=arr[0],price=null,benzinPrice=null;
    var keys=Object.keys(entry);
    // Motorin: önce Eco Force, sonra standart (Ultra ve Excellium hariç)
    var motorinKey=keys.find(function(k){return k.indexOf('Motorin')>-1&&k.indexOf('Eco')>-1;})||
                   keys.find(function(k){return k.indexOf('Motorin')>-1&&k.indexOf('Ultra')===-1&&k.indexOf('Excellium')===-1;});
    if(motorinKey)price=entry[motorinKey];
    // Benzin: Kurşunsuz 95 (Gazyağı, Fuel Oil, Motorin hariç)
    var benzinKey=keys.find(function(k){return k.indexOf('95')>-1&&k.indexOf('Gazyag')===-1&&k.indexOf('Fuel')===-1&&k.indexOf('Motorin')===-1;})||
                  keys.find(function(k){return (k.indexOf('Kursunsuz')>-1||k.indexOf('Benzin')>-1)&&k.indexOf('Motorin')===-1;});
    if(benzinKey)benzinPrice=entry[benzinKey];
    if(price&&parseFloat(price)>0){SFUEL=parseFloat(price);SFUEL_SOURCE='epdk';}
    if(benzinPrice&&parseFloat(benzinPrice)>0)SBENZIN=parseFloat(benzinPrice);
  }
  // Önce Netlify proxy (HTTPS), başarısız olursa direkt URL dene
  var urls=['/.netlify/functions/yakit','http://hasanadiguzel.com.tr/api/akaryakit/sehir=kayseri'];
  function tryUrl(i){
    if(i>=urls.length)return;
    fetch(urls[i])
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(d){parseFuelData(d);})
      .catch(function(){tryUrl(i+1);});
  }
  tryUrl(0);
})();
function servisHesapla(km,min){
  // Gidiş-dönüş: 2×km
  var total=Math.min(SBASE+2*km*SPERKM,SPMAX);
  var fuel=Math.round((2*km/100)*SCONS*SFUEL);
  var labor=Math.round((2*min/60)*SLABOR);
  var kmg=Math.round(2*km*SKMR);
  return{total:Math.round(total),fuel:fuel,labor:labor,kmg:kmg};
}
/* Fallback: Yahyalı dağlık arazi katsayıları */
function hvFallback(s){
  var f=s<3?1.4:s<6?1.7:s<10?2.2:1.8;
  return{km:parseFloat((s*f).toFixed(1)),min:(s*f/35)*60,isFallback:true};
}
function getRouteOSRM(oLat,oLng,dLat,dLng){
  return fetch('https://router.project-osrm.org/route/v1/driving/'+oLng+','+oLat+';'+dLng+','+dLat+'?overview=false')
    .then(function(r){if(!r.ok)throw 0;return r.json();})
    .then(function(d){if(!d.routes||!d.routes.length)throw 0;return{km:d.routes[0].distance/1000,min:d.routes[0].duration/60,isFallback:false};});
}
function getRouteORS(oLat,oLng,dLat,dLng){
  return fetch('https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248a355c4b6673e49e5b5f1e5c0cf6d44e8&start='+oLng+','+oLat+'&end='+dLng+','+dLat)
    .then(function(r){if(!r.ok)throw 0;return r.json();})
    .then(function(d){if(!d.features||!d.features.length)throw 0;var seg=d.features[0].properties.segments[0];return{km:seg.distance/1000,min:seg.duration/60,isFallback:false};});
}
function getRoute(oLat,oLng,dLat,dLng){
  return getRouteOSRM(oLat,oLng,dLat,dLng)
    .catch(function(){return getRouteORS(oLat,oLng,dLat,dLng);})
    .catch(function(){return hvFallback(haversineKm(oLat,oLng,dLat,dLng));});
}
/* Eski fonksiyon adı korunuyor (initHizmetHarita kullanıyor) */
function kmToFiyat(km){return Math.round(Math.min(SBASE+2*SPERKM*km,SPMAX)/50)*50;}

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
  L.marker([DUKKAN.lat,DUKKAN.lng],{icon:mkIcon('\u26a1','#0f0f0f',34)}).addTo(map).bindPopup('<strong>Bircan Elektrik</strong><br>Yahyal\u0131 / Kayseri').openPopup();
  var dot=L.divIcon({html:'<div style="background:#b8963e;border-radius:50%;width:9px;height:9px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);"></div>',className:'',iconSize:[9,9],iconAnchor:[4,4]});
  [{n:'Kayseri',lat:38.7225,lng:35.4875,km:84},{n:'Develi',lat:38.3897,lng:35.4897,km:46},{n:'Ni\u011fde',lat:37.9667,lng:34.6833,km:72},{n:'Tomarza',lat:38.4483,lng:36.0836,km:76},{n:'P\u0131narba\u015f\u0131',lat:38.725,lng:36.3833,km:112},{n:'Aksaray',lat:38.3687,lng:34.037,km:138},{n:'Adana',lat:37.0,lng:35.3213,km:148},{n:'Sivas',lat:39.7477,lng:37.0179,km:142}
  ].forEach(function(c){L.marker([c.lat,c.lng],{icon:dot}).addTo(map).bindTooltip('<strong>'+c.n+'</strong><br>~'+c.km+' km',{direction:'top',offset:[0,-5]});});
  setTimeout(function(){map.invalidateSize();map.fitBounds(L.circle([DUKKAN.lat,DUKKAN.lng],{radius:155000}).getBounds(),{padding:[20,20]});},300);
}

function initUcretHarita(){
  var el=document.getElementById('ucret-harita');
  if(!el||el._done)return;el._done=true;
  var map=L.map(el,{center:[DUKKAN.lat,DUKKAN.lng],zoom:11,scrollWheelZoom:false});
  leafletTile(map);
  L.marker([DUKKAN.lat,DUKKAN.lng],{icon:mkIcon('\u26a1','#0f0f0f',34)}).addTo(map).bindPopup('<strong>Bircan Elektrik</strong><br>Gazibeyli, Yahyal\u0131 / Kayseri').openPopup();
  L.circle([DUKKAN.lat,DUKKAN.lng],{radius:30000,color:'#b8963e',weight:1.5,fillColor:'#b8963e',fillOpacity:0.06,dashArray:'6 4'}).addTo(map);
  var sel=null;
  map.on('click',function(e){
    if(sel){map.removeLayer(sel);sel=null;}
    var lat=e.latlng.lat,lng=e.latlng.lng;
    sel=L.marker([lat,lng],{icon:mkIcon('\u{1f4cd}','#b8963e',30)}).addTo(map);
    var p=document.getElementById('ucret-sonuc');
    if(p){p.innerHTML='<div style="padding:12px 16px;background:rgba(0,0,0,0.04);border-radius:8px;font-size:13px;color:var(--gray);">\ud83d\udce1 Yol mesafesi hesaplan\u0131yor\u2026</div>';p.style.display='block';}
    getRoute(DUKKAN.lat,DUKKAN.lng,lat,lng).then(function(route){
      if(route.km>SDMAX){
        if(p){p.innerHTML='<div style="padding:12px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-weight:600;">\ud83d\udeab Hizmet alan\u0131 d\u0131\u015f\u0131 \u2014 '+route.km.toFixed(1)+' km (azami '+SDMAX+' km)</div>';}
        return;
      }
      var s=servisHesapla(route.km,route.min);
      var minTxt=Math.round(route.min)<60?Math.round(route.min)+' dk':Math.floor(Math.round(route.min)/60)+' sa '+(Math.round(route.min)%60)+' dk';
      sel.bindPopup('<strong>Se\u00e7ilen Konum</strong><br>'+route.km.toFixed(1)+' km'+(route.isFallback?' (tahmini)':'')+'<br><strong style="color:#b8963e;">'+s.total.toLocaleString('tr-TR')+' TL</strong>').openPopup();
      showUcret(route.km,route.min,s,route.isFallback);
    });
  });
  setTimeout(function(){map.invalidateSize();map.fitBounds(L.circle([DUKKAN.lat,DUKKAN.lng],{radius:32000}).getBounds(),{padding:[30,30]});},300);
}

function showUcret(km,min,s,isFallback){
  var p=document.getElementById('ucret-sonuc');if(!p)return;
  var b=km<=10?'🟢 Yakın çevre':km<=25?'🟡 Yakın bölge':'🟠 Uzak bölge';
  var minTxt=Math.round(min)<60?Math.round(min)+' dk':Math.floor(Math.round(min)/60)+' sa '+(Math.round(min)%60)+' dk';
  var fallNote=isFallback?'<div style="font-size:11px;color:#b8963e;margin-top:5px;">⚠ Tahmini mesafe (gerçek yol verisi alınamadı)</div>':'';
  // Formül: 500 + 2 × km × 43
  var formulTxt=SBASE+' ₺ + (2 × '+km.toFixed(1)+' km × '+SPERKM+' ₺/km) = '+s.total.toLocaleString('tr-TR')+' ₺';
  p.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:14px;">'+
      '<div>'+
        '<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:4px;">Tahmini Yol Maliyeti</div>'+
        '<div style="font-size:2rem;font-weight:800;">'+s.total.toLocaleString('tr-TR')+' <span style="font-size:1rem;font-weight:600;">TL</span></div>'+
        fallNote+
      '</div>'+
      '<div style="text-align:right;">'+
        '<div style="font-size:11px;color:var(--gray);margin-bottom:4px;">Yol Mesafesi</div>'+
        '<div style="font-size:1.4rem;font-weight:700;">'+km.toFixed(1)+' km</div>'+
        '<div style="font-size:12px;color:var(--gray);">≈ '+minTxt+'</div>'+
      '</div>'+
    '</div>'+
    '<div style="background:rgba(184,150,62,0.08);border:1px solid rgba(184,150,62,0.2);border-radius:8px;padding:10px 14px;margin-bottom:12px;">'+
      '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#7a6030;margin-bottom:5px;">🧮 Hesap (gidiş-dönüş)</div>'+
      '<div style="font-family:monospace;font-size:13px;color:#5C420A;font-weight:600;">'+formulTxt+'</div>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(0,0,0,0.03);border-radius:8px;margin-bottom:12px;font-size:12px;">'+
      '<span style="color:var(--gray);">⛽ Motorin (Eco Force) — hesapta kullanılan</span>'+
      '<span style="color:'+(SFUEL_SOURCE==="epdk"?"#1b7a2f":"#b8963e")+';font-weight:600;">'+SFUEL.toFixed(2)+' ₺/lt '+(SFUEL_SOURCE==="epdk"?"(EPDK canlı ✔)":"(varsayılan — API bağlanamadı)")+' </span>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(0,0,0,0.03);border-radius:8px;margin-bottom:12px;font-size:12px;">'+
      '<span style="color:var(--gray);">⛽ Kurşunsuz Benzin 95 (bilgi)</span>'+
      '<span style="color:var(--gray);font-weight:600;">'+SBENZIN.toFixed(2)+' ₺/lt'+(SFUEL_SOURCE==='epdk'?' (EPDK)':'')+' </span>'+
    '</div>'+
    '<div style="font-size:13px;color:var(--gray);padding:10px 14px;background:rgba(0,0,0,0.04);border-radius:8px;border-left:3px solid var(--gold);margin-bottom:10px;">'+b+'</div>'+
    '<div style="font-size:12px;color:var(--gray);line-height:1.6;">⚠ Bu ücret <strong>yalnızca ulaşım</strong> tahminidir. Malzeme, işçilik ve proje bedeli ayrıca belirlenir. Kesin fiyat: <a href="tel:+905340140949" style="color:var(--black);font-weight:600;">0534 014 09 49</a></div>';
  p.style.display='block';
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
