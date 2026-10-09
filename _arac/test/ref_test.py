import sys, asyncio, re
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'; MODE=sys.argv[2] if len(sys.argv)>2 else 'normal'
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
async def route(r):
    u=r.request.url
    if u.endswith('/js/images.js') and MODE!='normal':
        body=open('/mnt/user-data/outputs/site/js/images.js').read()
        if MODE=='bad':   # kullanıcı hatası: sayfa linki + yeni kart + Türkçe kategori
            body=body.replace('fotolar:    ["https://i.ibb.co/R4zrhxYQ/IMG-20261005-WA0009.jpg"]','fotolar:    ["https://ibb.co/x8J9mpXz"]',1)
            body=body.replace('  projeler: [\n','  projeler: [\n    { baslik: "Yeni Deneme Kartı", kategori: "Endüstriyel", etiket: "Deneme", yer: "Develi", aciklama: "Deneme açıklaması.", ozellikler: ["A", "B"], fotolar: ["https://i.ibb.co/a/1.jpg", "https://i.ibb.co/a/2.jpg"] },\n',1)
        if MODE=='noimg': return await r.abort()
        return await r.fulfill(body=body, content_type='application/javascript')
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if 'i.ibb.co' in u: return await r.fulfill(path=S+'/shots/c_teklif.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
        await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1500)
        cards=await pg.evaluate('[...document.querySelectorAll(".ref-card")].map(c=>[c.querySelector(".ref-title").textContent.slice(0,28), c.querySelectorAll(".rc-track img").length, !!c.querySelector(".ref-img-bad")])')
        print(MODE,'kart sayısı',len(cards)); [print('  ',c) for c in cards[:6]]
        for f in ['endustriyel','altyapi']:
            await pg.click(f'.rfbtn[data-ref-filter="{f}"]'); await pg.wait_for_timeout(300)
            print('  filtre',f, await pg.evaluate('[...document.querySelectorAll(".ref-card .ref-title")].map(t=>t.textContent.slice(0,20))'))
        print('  konsol:', errs[:4]); await b.close()
asyncio.run(main())
