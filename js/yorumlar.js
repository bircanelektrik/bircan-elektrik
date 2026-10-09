/* ══════════════════════════════════════════
   yorumlar.js — Google yorumları (ana sayfadaki "Müşterilerimiz Ne Diyor?")

   Yorumlar bölümünün TAMAMI aşağıdaki yazıdan okunur. Düz yazı gibi yazın.

   Her kişi ### ile başlar:

     ### Ad Soyad
     yildiz: 5                 (yazmazsanız 5 sayılır)
     tarih: Ekim 2026
     yorum: Yorumun metni.

   Yorum yazmadan sadece puan verenler için yalnızca ### satırı yeterli
   (5 yıldız değilse altına yildiz: 4 yazın). Bunlar kartlarda değil,
   altta "… kişi daha puan verdi" listesinde görünür.
   Yazısız birini yine de kartlarda göstermek isterseniz altına
   kart: evet yazın.
   Yorumu olan birini kartlardan çıkarmak için kart: hayır yazın;
   o kişi alttaki listede görünür.

   Kartlar bu dosyadaki sırayla dizilir: en üstteki ilk görünür.
   Öne çıkarmak istediğinizi yukarı taşıyın.
   Yeni yorum gelince en üste ekleyin. Toplam sayı kendiliğinden hesaplanır.
   // ile başlayan satır not sayılır, sitede görünmez.
   Ters tırnak (`) KULLANMAYIN; dosyayı bozar.
   ══════════════════════════════════════════ */

window.BIRCAN_YORUMLAR = {

  /* Başlıktaki "… Google yorumu" bağlantısı (tüm yorumlar) */
  googleLink: 'https://maps.app.goo.gl/YwRZJt1DQknako1u6',

  /* "Yorum yaz" düğmesi (doğrudan Google yorum penceresi) */
  yorumYazLink: 'https://g.page/r/CRIgIs0Q5QMOEBM/review',

  yorumlarMetni: `

### Ayhan Ekiz
yildiz: 5
tarih: Eylül 2026
yorum: Bilgili usta... Ellerine sağlık, yaptığı işten çok memnunum.

### Eda Kırılmaz
yildiz: 5
tarih: Aralık 2025
yorum: İlgili, bilgili, deneyimli ve hızlı çalışma koşullarıyla tüm elektrik işlerimizi yaptırdığımız ve tavsiye ettiğimiz mühendis Burak Bey. Güvenle tercih edebilirsiniz.

### Japan Moto
yildiz: 5
tarih: Nisan 2026
yorum: Kalitenin adresi. İşçilik ve müşteri memnuniyetine önem veriyorlar.

### Yusuf Cevizci
yildiz: 5
tarih: Eylül 2026
kart: evet

### Bugateg Ayas
yildiz: 5
tarih: Ocak 2026
yorum: İşinin ehli ustadır. "İş kaliteli olsun, gözüm arkada kalmasın" diyen ve kaliteyi ön planda tutanlar gözü kapalı tercih edebilir!

### Gizem Culha
yildiz: 5
tarih: Ocak 2026
yorum: Elinize sağlık, çok memnun kaldık. Kusursuz, mükemmel iş çıkarıyorsunuz.

### Ahmet Torba
yildiz: 5
tarih: Ocak 2026
yorum: Usta başı çok tecrübeli ve yetenekli, tuttuğunu koparan cinsten. Memleketimizin insanı, elektrik onun işi.

### Hamdi Akyıl
yildiz: 5
tarih: Mayıs 2026
kart: evet

### Fatih Furkan Tutar
yildiz: 5
tarih: Aralık 2025
yorum: Gayet güzel ve tecrübeliler. Güler yüz, tatlı dil, iş teslimi zamanında ve kaliteli. Herkese tavsiye ederim.

### Abdullah Şen
yildiz: 5
tarih: Aralık 2025
yorum: Gayet başarılı ve tecrübeli, işinin hakkını vererek çalışıyorlar. Ellerine sağlık.

### Busra Gul Gulistan
yildiz: 5
tarih: Eylül 2026
yorum: Ellerine sağlık, çok ilgilendiler.

### Berat Sarıboğa
yildiz: 5
tarih: Mart 2026
yorum: Uygun fiyatlı.

// ── Kartlarda gösterilmeyenler (kart: hayır) ──

### Emine Kırılmaz
yildiz: 4
tarih: Ocak 2026
yorum: Başarılılar.
kart: hayır

// ── Yorum yazmadan puan verenler ──

### Seda Gümüş
yildiz: 4

### Göktuğ Recep Aydın
### Mustafa Demiral
### Harun Karaslan
### Medine Çukadar
### Büşra Sakarya
### Yunus Emre
### Mevlut Kırılmaz
### Mehmet
### Serkan İkinci
### Mehmet İkinci
### Betül
### Kemal Yıldırım
### Mustafa Kolukısa
### Kadir Aydoğdu
### Baran Oktay Uzunçelebi
### Ahmet Kaymaz
### Bensu Kara
### Funda Kabakçı
### Şeyda Kırılmaz
### Seyda Yondem
### Akiff
### İlknur Tan
### Aysenur Oktem
### İhsan Karagöz
### Sedat Bakir
### Miraysu Bircan
### Murat Köylü
### Ömer Özgan
### Baki

`
};
