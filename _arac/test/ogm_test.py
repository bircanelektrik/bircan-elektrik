import sys, asyncio
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
MERGED=len(sys.argv)>2
async def route(r):
    u=r.request.url
    if u.endswith('/js/images.js') and MERGED:
        body=open('/mnt/user-data/outputs/site/js/images.js').read().replace('"https://i.ibb.co/R4zrhxYQ/IMG-20261005-WA0009.jpg", "https://i.ibb.co/q3sJ3Tts/20261006-145445.jpg"','"https://i.ibb.co/R4zrhxYQ/IMG-20261005-WA0009.jpg,https://i.ibb.co/q3sJ3Tts/20261006-145445.jpg"')
        return await r.fulfill(body=body, content_type='application/javascript')
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if 'R4zrhxYQ' in u: return await r.fulfill(path=S+'/shots/c_hakk.png', content_type='image/png')
    if 'q3sJ3Tts' in u: return await r.fulfill(path=S+'/shots/c_isletme.png', content_type='image/png')
    if 'i.ibb.co' in u: return await r.fulfill(path=S+'/logo/mark.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vp,touch in [({'width':1440,'height':900},False),({'width':390,'height':844},True)]:
            ctx=await b.new_context(viewport=vp,has_touch=touch,is_mobile=touch); pg=await ctx.new_page(); errs=[]
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1300)
            c='.ref-card:has(.ref-carousel)'
            await pg.evaluate(f'document.querySelector("{c}").scrollIntoView({{block:"center"}})'); await pg.wait_for_timeout(600)
            info=await pg.evaluate(f'(()=>{{const w=document.querySelector("{c} .ref-img-wrap");const r=w.getBoundingClientRect();return [document.querySelector("{c} .ref-title").textContent.slice(0,14),Math.round(r.width),Math.round(r.height),w.querySelectorAll("img").length,w.querySelector(".rc-count").textContent]}})()')
            print(vp['width'],'MERGED' if MERGED else '', info)
            if touch:
                await pg.evaluate(f'(()=>{{const t=document.querySelector("{c} .rc-track");t.scrollLeft=t.clientWidth}})()')
            else:
                await pg.hover(f'{c} .ref-img-wrap'); await pg.wait_for_timeout(300); await pg.click(f'{c} .rc-next')
            await pg.wait_for_timeout(800)
            print('  geçiş sonrası', await pg.eval_on_selector(f'{c} .rc-count','e=>e.textContent'), 'hatalar', errs)
            await pg.evaluate('window.scrollBy(0,-90)'); await pg.wait_for_timeout(300)
            el=await pg.query_selector(c); await el.screenshot(path=f'{S}/shots/ogm_{vp["width"]}.png')
            await ctx.close()
        await b.close()
asyncio.run(main())
