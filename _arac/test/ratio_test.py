import sys, asyncio
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
MAP={'R4zrhxYQ':'portre','q3sJ3Tts':'yatay','pj99KZgy':'yatay','QF95RZCM':'panorama','TMK6kNCP':'portre','Mk6kWjJ0':'yatay'}
async def route(r):
    u=r.request.url
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if 'i.ibb.co' in u:
        k=next((v for kk,v in MAP.items() if kk in u),'portre')
        return await r.fulfill(path=f'{S}/shots/t_{k}.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vp in [{'width':1440,'height':1000},{'width':390,'height':844}]:
            ctx=await b.new_context(viewport=vp); pg=await ctx.new_page(); errs=[]
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1000)
            await pg.evaluate('document.getElementById("ref-grid").scrollIntoView()'); await pg.wait_for_timeout(1500)
            info=await pg.evaluate('[...document.querySelectorAll(".ref-card")].slice(0,6).map(c=>{const w=c.querySelector(".ref-img-wrap");if(!w)return [c.querySelector(".ref-title").textContent.slice(0,12),"yok"];const r=w.getBoundingClientRect();return [c.querySelector(".ref-title").textContent.slice(0,12),Math.round(r.width)+"x"+Math.round(r.height),getComputedStyle(w.querySelector("img")).objectFit]})')
            print(vp['width'], info, errs)
            if vp['width']==1440:
                g=await pg.query_selector('#ref-grid'); 
                await pg.evaluate('window.scrollBy(0,-100)'); await pg.wait_for_timeout(300)
                await pg.screenshot(path=f'{S}/shots/ratio_d.png', clip={'x':0,'y':0,'width':1440,'height':1000})
            await ctx.close()
        await b.close()
asyncio.run(main())
