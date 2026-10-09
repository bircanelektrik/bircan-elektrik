import sys, asyncio, json, math
from playwright.async_api import async_playwright
S = sys.argv[1]; V = S + '/vendor'
LIBS = {'gsap.min.js': V + '/gsap-3.12.5/package/dist/gsap.min.js', 'ScrollTrigger.min.js': V + '/gsap-3.12.5/package/dist/ScrollTrigger.min.js',
        'leaflet.min.js': V + '/leaflet-1.9.4/package/dist/leaflet.js', 'leaflet.min.css': V + '/leaflet-1.9.4/package/dist/leaflet.css'}

async def route(r):
    u = r.request.url
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    if 'router.project-osrm.org' in u:
        return await r.abort()
        # Dolambaçlı dağ yolu: her nokta için 82,8 km yol mesafesi döndür
        return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'routes': [{'distance': 82800, 'duration': 4800, 'geometry': {'type': 'LineString', 'coordinates': []}}]}))
    for k, p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); ctx = await b.new_context(viewport={'width': 1440, 'height': 900}); page = await ctx.new_page()
        errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
        await page.route('**/*', route)
        await page.goto('http://127.0.0.1:8765/index.html', wait_until='load'); await page.wait_for_timeout(1500)
        await page.evaluate('document.getElementById("ucret-harita").scrollIntoView({block:"center"})'); await page.wait_for_timeout(800)
        box = await page.eval_on_selector('#ucret-harita', 'e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}')
        cx, cy = box['x'] + box['w'] / 2, box['y'] + box['h'] / 2
        # Çember yarıçapını pikselde ölç
        rpx = await page.evaluate('(()=>{const p=[...document.querySelectorAll("#ucret-harita path.leaflet-interactive")].map(e=>e.getBoundingClientRect()).filter(r=>r.width>50);return p.length?p[0].width/2:null})()')
        print('çember yarıçapı (px):', rpx)
        async def click_at(frac):
            await page.mouse.click(cx + rpx * frac, cy); await page.wait_for_timeout(900)
            return await page.eval_on_selector('#ucret-sonuc', 'e=>e.innerText.replace(/\\s+/g," ").slice(0,170)')
        print('çember içi (%70, yol 82,8 km) →', await click_at(0.70))
        print('çember içi kenar (%95)        →', await click_at(0.95))
        print('çember dışı (%130)            →', await click_at(1.30))
        print('tooltip →', await page.evaluate('document.querySelector(".leaflet-tooltip")?.textContent || "(hover ile görünür)"'))
        print('hatalar:', errs)
        await page.screenshot(path=S + '/shots/map.png', clip={'x': box['x'], 'y': box['y'] - 10, 'width': box['w'], 'height': box['h'] + 220})
        await b.close()
asyncio.run(main())
