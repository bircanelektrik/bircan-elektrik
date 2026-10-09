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
        for vp,touch in [({'width':1440,'height':1000},False),({'width':390,'height':844},True)]:
            ctx=await b.new_context(viewport=vp,has_touch=touch,is_mobile=touch); pg=await ctx.new_page(); errs=[]
            pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
            await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1000)
            await pg.evaluate('document.getElementById("ref-grid").scrollIntoView()'); await pg.wait_for_timeout(1500)
            cols=await pg.evaluate('[...new Set([...document.querySelectorAll(".ref-card")].map(c=>Math.round(c.getBoundingClientRect().left)))].length')
            gaps=await pg.evaluate('(()=>{const cs=[...document.querySelectorAll(".ref-card")].map(c=>c.getBoundingClientRect());let m=0;cs.forEach(a=>{const below=cs.filter(b=>Math.abs(b.left-a.left)<2&&b.top>a.bottom-1).sort((x,y)=>x.top-y.top)[0];if(below)m=Math.max(m,below.top-a.bottom)});return Math.round(m)})()')
            print(vp['width'],'sütun',cols,'en büyük dikey boşluk',gaps,'Detay buton',await pg.evaluate('document.querySelectorAll(".ref-more").length'))
            c='.ref-card:has(.ref-carousel)'
            await pg.evaluate(f'document.querySelector("{c}").scrollIntoView({{block:"center"}})'); await pg.wait_for_timeout(400)
            await pg.click(f'{c} .ref-more'); await pg.wait_for_timeout(500)
            d=await pg.evaluate('(()=>{const o=document.getElementById("ref-dialog");const bx=o.querySelector(".rd-box").getBoundingClientRect();return {acik:!o.hidden,baslik:o.querySelector(".rd-title").textContent.slice(0,20),foto:o.querySelectorAll(".rc-track img").length,metin:o.querySelector(".rd-text").textContent.slice(0,40),odak:document.activeElement.className,kutu:[Math.round(bx.width),Math.round(bx.height)],scroll:getComputedStyle(document.body).overflow}})()')
            print('  pencere',d)
            if not touch:
                await pg.click('#ref-dialog .rc-next'); await pg.wait_for_timeout(700)
                print('  pencerede sonraki →', await pg.eval_on_selector('#ref-dialog .rc-count','e=>e.textContent'))
            await pg.screenshot(path=f'{S}/shots/detail_{vp["width"]}.png')
            for _ in range(5): await pg.keyboard.press('Tab')
            print('  Tab sonrası odak pencerede', await pg.evaluate('!!document.activeElement.closest("#ref-dialog")'))
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
            print('  Esc → kapalı', await pg.evaluate('document.getElementById("ref-dialog").hidden'), 'odak geri', await pg.evaluate('document.activeElement.className'), 'scroll', await pg.evaluate('document.body.style.overflow'))
            await pg.click('.ref-card .ref-more'); await pg.wait_for_timeout(300)
            await pg.mouse.click(5,5); await pg.wait_for_timeout(200)
            print('  dışarı tık → kapalı', await pg.evaluate('document.getElementById("ref-dialog").hidden'))
            await pg.click('.rfbtn[data-ref-filter="altyapi"]'); await pg.wait_for_timeout(400)
            print('  filtre sonrası Detay', await pg.evaluate('document.querySelectorAll(".ref-more").length'), 'taşma', await pg.evaluate('document.documentElement.scrollWidth-innerWidth'))
            if not touch:
                await pg.click('.rfbtn[data-ref-filter="all"]'); await pg.wait_for_timeout(1200)
                await pg.evaluate('document.getElementById("ref-grid").scrollIntoView()'); await pg.evaluate('window.scrollBy(0,-90)'); await pg.wait_for_timeout(600)
                await pg.screenshot(path=f'{S}/shots/masonry_d.png')
            print('  hatalar', errs); await ctx.close()
        await b.close()
asyncio.run(main())
