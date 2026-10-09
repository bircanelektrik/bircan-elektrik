import sys, json, asyncio
from playwright.async_api import async_playwright
S = sys.argv[1]
OUT = sys.argv[2]
V = S + '/vendor'
MAP = {
  'gsap.min.js': V + '/gsap-3.12.5/package/dist/gsap.min.js',
  'ScrollTrigger.min.js': V + '/gsap-3.12.5/package/dist/ScrollTrigger.min.js',
  'leaflet.min.js': V + '/leaflet-1.9.4/package/dist/leaflet.js',
  'leaflet.min.css': V + '/leaflet-1.9.4/package/dist/leaflet.css',
}
results = {}
def log(k, v): results[k] = v; print(k, '→', v)

async def route(r):
    url = r.request.url
    if url.startswith('http://127.0.0.1:8765'):
        return await r.continue_()
    for k, p in MAP.items():
        if url.endswith(k):
            ct = 'text/css' if k.endswith('.css') else 'application/javascript'
            return await r.fulfill(path=p, content_type=ct)
    return await r.fulfill(status=204, body='')

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for name, vp in [('desktop', {'width': 1440, 'height': 900}), ('mobile', {'width': 390, 'height': 844})]:
            ctx = await b.new_context(viewport=vp, device_scale_factor=1)
            page = await ctx.new_page()
            errs = []
            page.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
            page.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
            await page.route('**/*', route)
            await page.goto('http://127.0.0.1:8765/index.html', wait_until='load')
            await page.wait_for_timeout(1500)
            if name == 'desktop':
                await page.screenshot(path=f'{OUT}/shot-hero.png')
                # hizmet kartı
                await page.click('.svc-card >> nth=4')
                await page.wait_for_timeout(400)
                log('svc detay görünür', await page.eval_on_selector('#detail', 'e=>e.classList.contains("visible") && e.innerText.slice(0,60)'))
                log('svc ikon svg', await page.eval_on_selector('.svc-card .svc-icon', 'e=>!!e.querySelector("svg")'))
                await page.click('#catbtn-malzeme')
                await page.wait_for_timeout(300)
                log('teknik panel açık', await page.eval_on_selector('#cat-malzeme', 'e=>e.classList.contains("open") && getComputedStyle(e).display'))
                await page.click('#catbtn-salt')
                log('teknik tekil açık', await page.evaluate('[...document.querySelectorAll(".cat-panel.open")].map(e=>e.id)'))
                # rehber
                await page.click('#rh-tab-5')
                log('rehber sekme', await page.evaluate('[...document.querySelectorAll(".rh-panel")].filter(p=>!p.hidden).map(p=>p.id)'))
                await page.click('#rh-panel-5 .pick[data-key="4P"]')
                log('kutup 4P', await page.eval_on_selector('#rh-panel-5 [data-f="note"]', 'e=>e.textContent'))
                log('kutup satır kes sayısı', await page.evaluate('document.querySelectorAll("#rh-panel-5 .brk").length'))
                await page.click('#rh-tab-6'); await page.click('#rh-panel-6 .pick[data-key="D"]')
                log('sigorta D', await page.eval_on_selector('#rh-panel-6 [data-f="trip"]', 'e=>e.textContent'))
                await page.click('#rh-tab-7'); await page.click('#rh-panel-7 .pick[data-key="B"]')
                log('rcd B', await page.eval_on_selector('#rh-panel-7 [data-f="note"]', 'e=>e.textContent.slice(0,40)'))
                await page.click('#rh-tab-11'); await page.click('#rh-panel-11 [data-earth="rcd"]')
                log('toprak eksik görünüm', await page.evaluate('[...document.querySelectorAll("#rh-panel-11 .earth-view")].map(v=>v.dataset.view+":"+!v.hidden)'))
                await page.click('#rh-panel-11 .rh-next')
                log('sonraki konu', await page.evaluate('[...document.querySelectorAll(".rh-panel")].filter(p=>!p.hidden).map(p=>p.id)'))
                log('faq details sayısı', await page.evaluate('document.querySelectorAll("details.qa").length'))
                # süreç
                await page.click('#surec .step[data-step="3"]')
                log('süreç adım', await page.eval_on_selector('#surec-title', 'e=>e.textContent'))
                # referans
                await page.wait_for_timeout(300)
                log('referans kart', await page.evaluate('document.querySelectorAll("#ref-grid .ref-card").length'))
                await page.click('.rfbtn[data-ref-filter="ticari"]')
                log('referans ticari', await page.evaluate('document.querySelectorAll("#ref-grid .ref-card").length'))
                # popup
                await page.click('.nav-cta')
                await page.wait_for_timeout(400)
                log('popup açık', await page.eval_on_selector('#call-popup', 'e=>getComputedStyle(e).display'))
                await page.click('#call-overlay', position={'x': 10, 'y': 10})
                log('popup kapandı', await page.eval_on_selector('#call-popup', 'e=>getComputedStyle(e).display'))
                # form
                await page.click('#tf-submit')
                log('form uyarı', await page.eval_on_selector('#tf-status', 'e=>e.style.display+" "+e.textContent'))
                # harita
                log('leaflet harita', await page.evaluate('!!document.querySelector("#hizmet-harita.leaflet-container") && !!document.querySelector("#ucret-harita.leaflet-container")'))
                log('nav aktif link', await page.evaluate('[...document.querySelectorAll(".nav-links a.active")].map(a=>a.textContent)'))
                log('yatay taşma', await page.evaluate('document.documentElement.scrollWidth - innerWidth'))
                await page.evaluate('window.scrollTo(0,0)')
                await page.wait_for_timeout(600)
                await page.screenshot(path=f'{OUT}/shot-full.png', full_page=True)
            else:
                log('mobil taşma', await page.evaluate('document.documentElement.scrollWidth - innerWidth'))
                log('mobil bar', await page.eval_on_selector('.mbar', 'e=>getComputedStyle(e).display'))
                await page.click('#nav-burger')
                log('mobil menü', await page.eval_on_selector('#mnav', 'e=>!e.hidden'))
                await page.screenshot(path=f'{OUT}/shot-mobile-menu.png')
                await page.click('#mnav a[href="#rehber"]')
                log('menü kapandı', await page.eval_on_selector('#mnav', 'e=>e.hidden'))
                await page.evaluate('window.scrollTo(0,0)')
                await page.wait_for_timeout(500)
                await page.screenshot(path=f'{OUT}/shot-mobile-full.png', full_page=True)
                over = await page.evaluate('''[...document.querySelectorAll("body *")].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1 && r.width>0 && getComputedStyle(e).position!=="fixed"}).slice(0,8).map(e=>e.tagName+"."+e.className.toString().slice(0,30)+" "+Math.round(e.getBoundingClientRect().right))''')
                log('mobil taşan öğeler', over)
            log(name + ' konsol', errs[:20])
            await ctx.close()
        await b.close()
    json.dump(results, open(f'{OUT}/results.json', 'w'), ensure_ascii=False, indent=1)
asyncio.run(main())
