import sys, asyncio, re
from playwright.async_api import async_playwright
S=sys.argv[1]; V=S+'/vendor'
LIBS={'gsap.min.js':V+'/gsap-3.12.5/package/dist/gsap.min.js','ScrollTrigger.min.js':V+'/gsap-3.12.5/package/dist/ScrollTrigger.min.js','leaflet.min.js':V+'/leaflet-1.9.4/package/dist/leaflet.js','leaflet.min.css':V+'/leaflet-1.9.4/package/dist/leaflet.css'}
PICS=[S+'/shots/c_hakk.png',S+'/shots/c_isletme.png',S+'/shots/c_teklif.png']
async def route(r):
    u=r.request.url
    if u.endswith('/js/images.js'):
        body=open('/mnt/user-data/outputs/site/js/images.js').read()
        body=body.replace('foto: https://i.ibb.co/pj99KZgy/t-o-k-i-atasehir.jpg','foto: https://i.ibb.co/a/1.png\nfoto: https://i.ibb.co/a/2.png\nfoto: https://i.ibb.co/a/3.png',1)
        return await r.fulfill(body=body, content_type='application/javascript')
    if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
    m=re.search(r'i\.ibb\.co/a/(\d)\.png',u)
    if m: return await r.fulfill(path=PICS[int(m.group(1))-1], content_type='image/png')
    if 'i.ibb.co' in u: return await r.fulfill(path=S+'/logo/mark.png', content_type='image/png')
    for k,p in LIBS.items():
        if u.endswith(k): return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
    return await r.fulfill(status=204, body='')
async def run(b, vp, touch):
    ctx=await b.new_context(viewport=vp, has_touch=touch, is_mobile=touch); pg=await ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
    await pg.route('**/*',route); await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1200)
    await pg.evaluate('document.getElementById("referanslar").scrollIntoView()'); await pg.wait_for_timeout(800)
    c='.ref-card:has(.ref-carousel)'
    info=await pg.evaluate(f'''(()=>{{const w=document.querySelector("{c} .ref-carousel");if(!w)return null;const t=w.querySelector(".rc-track");return {{slides:t.querySelectorAll("img").length,count:w.querySelector(".rc-count").textContent,wrapped:t.querySelectorAll(".img-gsap-wrap").length,w:t.clientWidth,sw:t.scrollWidth,btn:getComputedStyle(w.querySelector(".rc-next")).display}}}})()''')
    print(vp['width'],'dizi:',info)
    if not touch:
        await pg.hover(f'{c} .ref-carousel'); await pg.wait_for_timeout(1300)
        await pg.click(f'{c} .rc-next'); await pg.wait_for_timeout(700)
        print(' sonraki →', await pg.eval_on_selector(f'{c} .rc-count','e=>e.textContent'))
        await pg.click(f'{c} .rc-next'); await pg.wait_for_timeout(700)
        print(' sonraki →', await pg.eval_on_selector(f'{c} .rc-count','e=>e.textContent'), 'next gizli:', await pg.eval_on_selector(f'{c} .rc-next','e=>getComputedStyle(e).visibility'))
        card=await pg.query_selector(c); await card.screenshot(path=S+'/shots/carousel_d.png')
        await pg.focus(f'{c} .rc-prev'); await pg.keyboard.press('ArrowLeft'); await pg.wait_for_timeout(700)
        print(' ok tuşu ←', await pg.eval_on_selector(f'{c} .rc-count','e=>e.textContent'))
        await pg.click('.rfbtn[data-ref-filter="altyapi"]'); await pg.wait_for_timeout(500)
        print(' filtre sonrası dizi:', await pg.evaluate('document.querySelectorAll(".ref-carousel").length'), 'tek fotolu kart:', await pg.evaluate('document.querySelectorAll(".ref-img-wrap:not(.ref-carousel)").length'))
    else:
        await pg.evaluate(f'(()=>{{const t=document.querySelector("{c} .rc-track");t.scrollLeft=t.clientWidth;}})()'); await pg.wait_for_timeout(600)
        print(' kaydırma →', await pg.eval_on_selector(f'{c} .rc-count','e=>e.textContent'))
        print(' yatay taşma:', await pg.evaluate('document.documentElement.scrollWidth-innerWidth'))
        card=await pg.query_selector(c); await card.screenshot(path=S+'/shots/carousel_m.png')
    print(' hatalar:', errs); await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        await run(b,{'width':1440,'height':900},False); await run(b,{'width':390,'height':844},True); await b.close()
asyncio.run(main())
