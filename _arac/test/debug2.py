import sys, asyncio, json
from playwright.async_api import async_playwright
S = sys.argv[1]; V = S + '/vendor'
IMG = S + '/logo/mark.png'
LIBS = {'gsap.min.js': V + '/gsap-3.12.5/package/dist/gsap.min.js', 'ScrollTrigger.min.js': V + '/gsap-3.12.5/package/dist/ScrollTrigger.min.js',
        'leaflet.min.js': V + '/leaflet-1.9.4/package/dist/leaflet.js', 'leaflet.min.css': V + '/leaflet-1.9.4/package/dist/leaflet.css'}
R = {}
def log(k, v): R[k] = v; print(f'{k} → {v}')

def make_route(block_gsap=False):
    async def route(r):
        u = r.request.url
        if u.startswith('http://127.0.0.1:8765'): return await r.continue_()
        if 'i.ibb.co' in u: return await r.fulfill(path=IMG, content_type='image/png')
        for k, p in LIBS.items():
            if u.endswith(k):
                if block_gsap and 'gsap' in p: return await r.abort()
                return await r.fulfill(path=p, content_type='text/css' if k.endswith('css') else 'application/javascript')
        return await r.fulfill(status=204, body='')
    return route

async def open_page(b, vp=(1440, 900), block_gsap=False, reduced=False):
    ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, reduced_motion='reduce' if reduced else 'no-preference')
    page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
    await page.route('**/*', make_route(block_gsap))
    await page.goto('http://127.0.0.1:8765/index.html', wait_until='load')
    await page.wait_for_timeout(1200)
    return ctx, page, errs

async def scroll_through(page):
    h = await page.evaluate('document.documentElement.scrollHeight')
    for y in range(0, h, 500):
        await page.evaluate(f'window.scrollTo(0,{y})'); await page.wait_for_timeout(60)
    await page.wait_for_timeout(1500)

INVISIBLE_JS = '''(()=>{const out=[];for(const e of document.querySelectorAll("main *, footer *")){if(e.closest("[hidden], .cat-panel:not(.open), .detail-box:not(.visible), details:not([open]) > .qa-body, #ucret-sonuc"))continue;const cs=getComputedStyle(e);if(cs.display==="none"||cs.visibility==="hidden")continue;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;if(parseFloat(cs.opacity)<0.05&&!e.closest(".leaflet-container"))out.push(e.tagName+"."+String(e.className.baseVal??e.className).slice(0,40))}return out.slice(0,12)})()'''

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        # 1. Menü yüksekliği kaydırmada sabit mi?
        ctx, page, errs = await open_page(b)
        h0 = await page.eval_on_selector('.topnav', 'e=>e.getBoundingClientRect().height')
        await page.evaluate('window.scrollTo(0,400)'); await page.wait_for_timeout(700)
        h1 = await page.eval_on_selector('.topnav', 'e=>e.getBoundingClientRect().height')
        await page.evaluate('window.scrollTo(0,0)'); await page.wait_for_timeout(700)
        h2 = await page.eval_on_selector('.topnav', 'e=>e.getBoundingClientRect().height')
        log('menü yüksekliği üst/kaydırılmış/tekrar üst', [h0, h1, h2])
        # 2. Aktif menü bağlantısı bölümlere göre
        act = {}
        for sid in ['hizmetler', 'teknik', 'rehber', 'yorumlar', 'hizmet-alani', 'referanslar', 'teklif']:
            await page.evaluate(f'document.getElementById("{sid}").scrollIntoView({{behavior:"instant",block:"start"}})'); await page.wait_for_timeout(250)
            act[sid] = await page.evaluate('[...document.querySelectorAll(".nav-links a.active")].map(a=>a.dataset.section).join(",")')
        log('aktif menü (bölüm→aktif)', act)
        # 3. Fotoğraflı referanslar + filtre sonrası fotoğraflar korunuyor mu
        await page.evaluate('document.getElementById("referanslar").scrollIntoView()'); await page.wait_for_timeout(600)
        log('referans foto sayısı (12 kart, 10 foto bekleniyor)', await page.evaluate('[document.querySelectorAll(".ref-card").length, document.querySelectorAll(".ref-card .ref-img-wrap img").length]'))
        await page.click('.rfbtn[data-ref-filter="konut"]'); await page.wait_for_timeout(300)
        log('konut filtresi kart/foto', await page.evaluate('[document.querySelectorAll(".ref-card").length, document.querySelectorAll(".ref-card .ref-img-wrap img").length]'))
        log('foto eşleşmesi doğru mu (ilk kart başlık→alt)', await page.evaluate('[...document.querySelectorAll(".ref-card")].slice(0,3).map(c=>c.querySelector(".ref-title").textContent.slice(0,20)+" | "+(c.querySelector("img")||{}).alt?.slice(0,20))'))
        # 4. Geçerli form → WhatsApp penceresi
        await page.fill('#tf-name', 'Test Kişi'); await page.fill('#tf-phone', '05000000000'); await page.fill('#tf-location', 'Yahyalı')
        await page.select_option('#tf-service', 'proje'); await page.fill('#tf-detail', 'Deneme <b>&</b> "tırnak"')
        reqs=[]
        ctx.on('request', lambda r: reqs.append(r.url) if 'wa.me' in r.url else None)
        async with ctx.expect_page() as newp:
            await page.click('#tf-submit')
        np = await newp.value; await page.wait_for_timeout(300)
        from urllib.parse import unquote
        log('form → WhatsApp mesajı', unquote(reqs[0]).replace('\n',' / ')[:260] if reqs else None); await np.close()
        log('form durum mesajı', await page.eval_on_selector('#tf-status', 'e=>e.textContent'))
        # 5. Popup: Escape ile kapanma, odak
        await page.evaluate('window.scrollTo(0,0)'); await page.click('.nav-cta'); await page.wait_for_timeout(400)
        log('popup açıkken odak nerede', await page.evaluate('document.activeElement.className||document.activeElement.tagName'))
        for _ in range(4): await page.keyboard.press('Tab')
        log('4×Tab sonrası odak hâlâ pencerede mi', await page.evaluate('!!document.activeElement.closest("#call-popup")'))
        await page.keyboard.press('Escape'); await page.wait_for_timeout(200)
        log('kapanınca odak geri döndü mü', await page.evaluate('document.activeElement.className'))
        log('Escape sonrası popup', await page.eval_on_selector('#call-popup', 'e=>getComputedStyle(e).display'))
        # 6. Hero "Malzemenizi Listeleyin"
        await page.click('.hcta-g'); await page.wait_for_timeout(900)
        log('hero → malzeme paneli', await page.eval_on_selector('#cat-malzeme', 'e=>e.classList.contains("open")'))
        await page.click('.hcta-g'); await page.wait_for_timeout(900)
        log('ikinci tık → hâlâ açık (kapatmamalı)', await page.eval_on_selector('#cat-malzeme', 'e=>e.classList.contains("open")'))
        # 7. Klavye: hizmet kartı Enter, tab ok tuşları
        await page.focus('.svc-card >> nth=2'); await page.keyboard.press('Enter'); await page.wait_for_timeout(300)
        log('klavye ile hizmet detayı', await page.eval_on_selector('#detail', 'e=>e.classList.contains("visible") && e.querySelector("h3").textContent'))
        await page.focus('#rh-tab-0'); await page.keyboard.press('ArrowDown'); await page.wait_for_timeout(150)
        log('ok tuşu ile sekme', await page.evaluate('[document.activeElement.id, [...document.querySelectorAll(".rh-panel")].filter(p=>!p.hidden).map(p=>p.id)[0]]'))
        # 8. Kaydırma sonrası görünmez kalan öğe var mı
        await scroll_through(page)
        log('tam kaydırma sonrası opacity≈0 kalan öğeler', await page.evaluate(INVISIBLE_JS))
        # 9. Tekrarlayan id
        log('tekrarlanan id', await page.evaluate('(()=>{const m={};document.querySelectorAll("[id]").forEach(e=>m[e.id]=(m[e.id]||0)+1);return Object.entries(m).filter(([k,v])=>v>1)})()'))
        log('hata (masaüstü)', errs)
        await ctx.close()
        # 10. GSAP yüklenemezse
        ctx, page, errs = await open_page(b, block_gsap=True)
        await scroll_through(page)
        log('GSAP yokken görünmez öğeler', await page.evaluate(INVISIBLE_JS))
        await page.click('.svc-card >> nth=0'); await page.wait_for_timeout(200)
        await page.click('#catbtn-sulama')
        log('GSAP yokken hizmet+araç', await page.evaluate('[document.getElementById("detail").classList.contains("visible"), document.getElementById("cat-sulama").classList.contains("open")]'))
        log('hata (GSAP yok)', [e for e in errs if 'gsap' not in e.lower()][:5])
        await ctx.close()
        # 11. Azaltılmış hareket
        ctx, page, errs = await open_page(b, reduced=True)
        await page.wait_for_timeout(5000)
        log('azaltılmış hareket: süreç otomatik ilerlemedi mi', await page.eval_on_selector('#surec-title', 'e=>e.textContent'))
        log('azaltılmış hareket: akış animasyonu', await page.eval_on_selector('.flow', 'e=>getComputedStyle(e).animationName'))
        await ctx.close()
        # 12. Mobil: menü açıkken kaydırma ve alt bar footer'ı örtüyor mu
        ctx, page, errs = await open_page(b, vp=(390, 844))
        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await page.wait_for_timeout(800)
        log('mobil: footer son satırı alt barın üstünde mi', await page.evaluate('(()=>{const f=document.querySelector("footer .wrap > div:last-child").getBoundingClientRect();const m=document.querySelector(".mbar").getBoundingClientRect();return [Math.round(f.bottom),Math.round(m.top)]})()'))
        log('mobil: dokunma hedefi <44px olan butonlar', await page.evaluate('[...document.querySelectorAll("main button, main a.btn, .mbar a")].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.height<40}).map(e=>e.className+" "+Math.round(e.getBoundingClientRect().height)).slice(0,8)'))
        log('hata (mobil)', errs)
        await ctx.close()
        await b.close()
    json.dump(R, open(S + '/shots/debug2.json', 'w'), ensure_ascii=False, indent=1)
asyncio.run(main())
