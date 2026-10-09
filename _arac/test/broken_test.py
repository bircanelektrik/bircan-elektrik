import sys, asyncio
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'; MODE=sys.argv[2]
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
async def route(r):
    u=r.request.url
    if u.endswith('/js/images.js') and MODE=='broken': return await r.fulfill(path='/tmp/user2_images.js', content_type='application/javascript')
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if 'i.ibb.co' in u: return await r.fulfill(path=S+'/shots/t_portre.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)[:80]))
        await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1300)
        print(MODE,'uyarı:', await pg.evaluate('(document.querySelector(".ref-data-warn")||{}).textContent||"yok"'), '| kart', await pg.evaluate('document.querySelectorAll(".ref-card").length'))
        if MODE=='ok':
            await pg.evaluate('document.querySelectorAll(".ref-card")[4].scrollIntoView({block:"center"})')
            card=await pg.evaluate('[...document.querySelectorAll(".ref-card")].findIndex(c=>c.textContent.includes("OGM"))')
            await pg.click(f'.ref-card:nth-child({card+1}) .ref-more'); await pg.wait_for_timeout(400)
            print(' pencere metni:', repr(await pg.eval_on_selector('#ref-dialog .rd-text','e=>e.innerText')))
            await pg.screenshot(path=S+'/shots/detail_ogm.png')
        print(' sayfa hataları:', errs); await b.close()
asyncio.run(main())
