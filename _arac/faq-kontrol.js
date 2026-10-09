/* Rehber soru-cevapları ile Google'ın okuduğu FAQ verisi aynı mı?
   Kullanım (bu klasörde):  node faq-kontrol.js
   Rehber'de bir soruyu ya da cevabı değiştirdiyseniz çalıştırın; fark varsa listeler. */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// Sayfadaki soru-cevaplar
const sayfa = [];
const re = /<details class="qa"[^>]*><summary class="qa-btn"><span>([\s\S]*?)<\/span>[\s\S]*?<p class="qa-a">([\s\S]*?)<\/p>/g;
let m;
while ((m = re.exec(html))) sayfa.push({ q: decode(m[1]), a: decode(m[2]) });

// FAQ verisi (JSON-LD)
const blok = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((x) => { try { return JSON.parse(x[1]); } catch (e) { return null; } })
  .find((j) => j && j['@type'] === 'FAQPage');
if (!blok) { console.log('FAQ verisi bulunamadı.'); process.exit(1); }
const faq = blok.mainEntity.map((e) => ({ q: e.name.trim(), a: e.acceptedAnswer.text.trim() }));

let sorun = 0;
const faqMap = new Map(faq.map((f) => [f.q, f.a]));
const sayfaMap = new Map(sayfa.map((s) => [s.q, s.a]));
for (const s of sayfa) {
  if (!faqMap.has(s.q)) { sorun++; console.log('FAQ verisinde yok: ' + s.q); }
  else if (faqMap.get(s.q) !== s.a) { sorun++; console.log('Cevap farklı: ' + s.q); }
}
for (const f of faq) if (!sayfaMap.has(f.q)) { sorun++; console.log('Sayfada yok (FAQ verisinden silinmeli): ' + f.q); }

console.log(sorun ? `\n${sorun} fark var. index.html başındaki FAQPage verisini sayfayla eşitleyin.`
  : `Tamam: ${sayfa.length} soru-cevap, FAQ verisiyle aynı.`);
process.exit(sorun ? 1 : 0);
