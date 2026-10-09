import sys, asyncio
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
async def route(r):
    u=r.request.url
    if u.endswith('/js/images.js'):
        body=open('/mnt/user-data/outputs/site/js/images.js').read().replace('etiket: Kamu / Arıza','etiket: Kamu / Kablo Yenileme',1)
        return await r.fulfill(body=body, content_type='application/javascript')
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if 'i.ibb.co' in u: return await r.fulfill(path=S+'/shots/t_portre.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w in [1440,390]:
            pg=await (await b.new_context(viewport={'width':w,'height':900})).new_page()
            await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1000)
            c='.ref-card:has-text("OGM")'
            await pg.evaluate('document.getElementById("ref-grid").scrollIntoView()'); await pg.wait_for_timeout(800)
            el=await pg.query_selector(c); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(600)
            ov=await pg.evaluate('[...document.querySelectorAll(".ref-card")].filter(c=>{const t=c.querySelector(".ref-title").getBoundingClientRect(),g=c.querySelector(".ref-tag").getBoundingClientRect();return !(t.bottom<=g.top||g.bottom<=t.top||t.right<=g.left||g.right<=t.left)}).length')
            print(w,'çakışan kart:',ov)
            hd=await pg.query_selector(c+' .ref-card-header'); await hd.screenshot(path=f'{S}/shots/hdr_{w}.png')
        await b.close()
asyncio.run(main())
