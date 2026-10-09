import sys, asyncio
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
async def route(r):
    u=r.request.url
    if u.endswith('/js/images.js'):
        body=open('/mnt/user-data/outputs/site/js/images.js').read()
        body=body.replace('foto: https://i.ibb.co/pj99KZgy/t-o-k-i-atasehir.jpg','foto: https://i.ibb.co/a/1.png\nfoto: https://i.ibb.co/a/2.png\nfoto: https://i.ibb.co/a/3.png\nfoto: https://i.ibb.co/a/4.png',1)
        body=body.replace('foto: https://i.ibb.co/QF95RZCM/20250923094015-1.jpg','foto: https://i.ibb.co/a/2.png\nfoto: https://i.ibb.co/a/1.png',1)
        return await r.fulfill(body=body, content_type='application/javascript')
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if '/a/1.png' in u or '/a/4.png' in u: return await r.fulfill(path=S+'/shots/t_portre.png', content_type='image/png')
    if '/a/2.png' in u: return await r.fulfill(path=S+'/shots/t_notfound.png', content_type='image/png')
    if '/a/3.png' in u: return await r.fulfill(status=404, body='')
    if 'i.ibb.co' in u: return await r.fulfill(path=S+'/shots/t_yatay.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(800)
        await pg.evaluate('document.getElementById("ref-grid").scrollIntoView()'); await pg.wait_for_timeout(1200)
        await pg.evaluate('document.querySelectorAll(".rc-track").forEach(t=>t.querySelectorAll("img").forEach(i=>i.loading="eager"))'); await pg.wait_for_timeout(1500)
        r=await pg.evaluate('[...document.querySelectorAll(".ref-card")].slice(0,2).map(c=>{const w=c.querySelector(".ref-img-wrap");return [c.querySelector(".ref-title").textContent.slice(0,10), w?w.querySelectorAll("img").length:0, w&&w.querySelector(".rc-count")?w.querySelector(".rc-count").textContent:"sayaç yok", w?w.classList.contains("ref-carousel"):null, w?w.querySelectorAll(".rc-dot").length:0]})')
        print('kartlar:', r)
        desc=await pg.evaluate('(()=>{const d=[...document.querySelectorAll(".ref-card")].find(c=>c.textContent.includes("Gerilim")).querySelector(".ref-desc");return [d.textContent.length, Math.round(d.getBoundingClientRect().height)]})()')
        print('Gerilim kart açıklaması (karakter, yükseklik px):', desc, '| hatalar', errs); await b.close()
asyncio.run(main())
