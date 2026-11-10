// Kabuk parçalarını canlı Gastro render'ından üretir. `node kabuk-uret.mjs <cekim>/dom`
// Kural: görünüm ve davranış Gastro, renk ve marka Gourmet (kanon/ortak-bilesenler.md §7-8). Elle markup yazılmaz;
// menü kalemleri canlı Gourmet ile aynıdır, kalemin kabı Gastro'nun DOM'udur.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = process.argv[2]; const yaz = (a, s) => { const f = path.join(SRC, 'parcalar/kabuk', a + '.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s + '\n'); };

let p = await ac(path.join(D, 'o-home.html'));
const logo = await p.evaluate(() => document.querySelector('header .brand svg').outerHTML);
const go = await p.evaluate(() => { kok(document.body); return {
  moOverlay: document.querySelector('#moOverlay').outerHTML, moModal: document.querySelector('#moModal').outerHTML,
  fab: document.querySelector('a.yg-fab').outerHTML, bottom: document.querySelector('nav.bottom-nav').outerHTML,
  gorusAlan: [...document.querySelectorAll('#fbModal .fb-chiprow')].slice(0,1).map((e) => e.innerHTML)[0],
  kolonlar: [...document.querySelectorAll('footer .foot-col')].map((c) => ({ ad: c.querySelector('h5').textContent.trim(), hedef: c.querySelector('.fc-body')?.innerHTML ?? c.innerHTML })),
  corp: document.querySelector('footer nav.foot-corp').innerHTML, legal: document.querySelector('footer nav.foot-legal').innerHTML,
  tag: document.querySelector('footer .foot-tag').textContent, lead: document.querySelector('footer .foot-app-lead').textContent,
  appBtns: document.querySelector('footer .foot-app')?.innerHTML,
}; });
const logoSinifli = logo.replace('class="gourmet-word-mark"', 'class="gastro-word-mark gourmet-word-mark"');

p = await ac(path.join(D, 'g-giris.html'));
const k = await p.evaluate(({ go, logo }) => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const K = '{{kok}}';
  // 1. Siyah bant: Gourmet etkin, sosyal blok yok (doğrulanmış hesap yok), Akademi ve Store yok, dil TR ve EN (K17)
  const tb = $('.topbar');
  $('.tb-left', tb).innerHTML = `<a href="${K}mekanlar/"><i class="fa-solid fa-location-dot" style="color:var(--marka)"></i> 203 mekân</a>`;
  const sw = $('.brand-switch', tb); sw.setAttribute('aria-label', 'Dada dünyaları');
  const g = $('.bs-gastro', sw); g.classList.remove('is-active'); g.removeAttribute('aria-current'); g.href = 'https://dadagastro.com'; g.title = 'DadaGastro'; g.dataset.eco = 'gastro'; g.target = '_blank'; g.rel = 'noopener';
  const o = $('.bs-gourmet', sw); o.classList.add('is-active'); o.setAttribute('aria-current', 'page'); o.setAttribute('href', K); ['title', 'target', 'rel', 'data-eco'].forEach((a) => o.removeAttribute(a));
  $$('.tb-lang-menu [data-lang="de"],.tb-lang-menu [data-lang="ru"],.tb-lang-menu template[data-dil-yok="de"],.tb-lang-menu template[data-dil-yok="ru"]', tb).forEach((e) => e.remove());
  // 2. Başlık
  const h = $('header.header'); h.className = 'header kabuk-basi'; h.removeAttribute('data-at-top-bound'); h.removeAttribute('data-hero');
  const b = $('.brand', h); b.setAttribute('aria-label', 'Dada Gourmet ana sayfa'); b.setAttribute('href', K); $('.brand-word', b).innerHTML = logo;
  const nav = $('nav.nav', h); nav.setAttribute('aria-label', 'Dada Gourmet ana menü');
  nav.innerHTML = [['Mekânlar', 'mekanlar/'], ['Mekân Bul', 'mekan-bul/'], ['Gurme Lezzetler', 'gurme-lezzetler/'], ['<i class="fa-solid fa-route" aria-hidden="true"></i> Dada Route', 'dada-route/'], ['Etkinlikler', 'etkinlikler/']].map(([a, y]) => `<div class="nav-item"><a href="${K}${y}">${a}</a></div>`).join('');
  const aksiyon = $('.head-actions', h);
  aksiyon.querySelector('button.icon-btn').setAttribute('onclick', "location.href='/gourmet-ara'");
  const ara = aksiyon.querySelector('button.icon-btn');
  const konum = document.createElement('button'); konum.className = 'icon-btn ikon-dugme'; konum.type = 'button'; konum.setAttribute('data-location-trigger', ''); konum.setAttribute('aria-label', 'Konum seç'); konum.title = 'Konum seç'; konum.innerHTML = '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>'; ara.after(konum);
  // İşletmelerim: canlı layouts/site.blade.php, yalnız işletme yetkisinde (`data-rol="isletme"`; prototip.js başka rolde kaldırır)
  const isletmeKalem = `<a href="${K}isletme/" data-rol="isletme"><i class="fa-solid fa-store" aria-hidden="true"></i> <span>İşletmelerim</span></a>`;
  const isletmeDk = `<a href="${K}isletme/" data-rol="isletme"><i class="fa-solid fa-store" aria-hidden="true"></i> İşletmelerim</a>`;
  const kalem = (i, a, y) => `<a href="${K}${y}"><i class="fa-solid ${i}" aria-hidden="true"></i> <span>${a}</span></a>`;
  const dv = '<div class="acct-div"></div>';
  const menu = $('.acct-menu', h);
  $('.acct-id b', menu).textContent = '{{uye.ad}}'; $('.acct-id small', menu).textContent = '@{{uye.kullanici}}';
  $$('.acct-ava,.da-ava').forEach((e) => (e.textContent = '{{uye.harf}}'));
  // Okunmamış sayı tohumdan gelir. Canlıda rozet yalnız okunmamış varken basılır; zil ve çekmece canlıdaki gibi Bildirimler sayfasına gider
  $$('.hb-badge', h).forEach((e) => e.parentNode.removeChild(e));
  [...menu.children].filter((e) => !e.classList.contains('acct-id')).forEach((e) => e.remove());
  menu.insertAdjacentHTML('beforeend', dv + kalem('fa-utensils', 'Gurme Panelim', 'hesabim/gurme-panelim/') + kalem('fa-location-dot', 'Mekânlarım', 'hesabim/kaydedilenler/') + kalem('fa-calendar-days', 'Etkinliklerim', 'hesabim/etkinlikler/') + kalem('fa-list-ul', 'Listelerim', 'hesabim/listeler/') + kalem('fa-compass', 'Keşif Tercihlerim', 'hesabim/kesif-tercihleri/') + isletmeKalem + dv + kalem('fa-medal', 'Rozetlerim', 'hesabim/rozetlerim/') + dv + kalem('fa-crown', 'Paketlerim', 'hesabim/paketlerim/') + kalem('fa-receipt', 'Ödemelerim', 'hesabim/odemelerim/') + kalem('fa-sliders', 'Hesap Ayarları', 'hesabim/ayarlar/') + kalem('fa-headset', 'Çözüm Merkezi', 'hesabim/cozum-merkezi/') + dv + `<a href="${K}" class="acct-logout" data-cikis=""><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> <span>Çıkış</span></a>`);
  // 3. Çekmece
  const dr = $('#drawer'); $('.drawer-head svg', dr).outerHTML = logo; const db = $('.drawer-head a', dr); if (db) { db.setAttribute('href', K); db.setAttribute('aria-label', 'Dada Gourmet ana sayfa'); }
  const dn = $('nav.drawer-nav', dr); const hesapBlok = $('.d-acct-block', dn);
  const sat = (i, a, y) => `<div class="d-item"><a class="d-link" href="${K}${y}"><i class="fa-solid ${i}"></i> ${a}</a></div>`;
  const grup = (a) => `<div class="d-sub-group">${a}</div>`, dk = (i, a, y) => `<a href="${K}${y}"><i class="fa-solid ${i}"></i> ${a}</a>`;
  $('.d-acct-sub', hesapBlok).innerHTML = grup('Modüllerim') + dk('fa-utensils', 'Gurme Panelim', 'hesabim/gurme-panelim/') + dk('fa-location-dot', 'Mekânlarım', 'hesabim/kaydedilenler/') + dk('fa-calendar-days', 'Etkinliklerim', 'hesabim/etkinlikler/') + dk('fa-list-ul', 'Listelerim', 'hesabim/listeler/') + dk('fa-compass', 'Keşif Tercihlerim', 'hesabim/kesif-tercihleri/') + isletmeDk + grup('Gelişimim') + dk('fa-medal', 'Rozetlerim', 'hesabim/rozetlerim/') + grup('Hesabım') + dk('fa-crown', 'Paketlerim', 'hesabim/paketlerim/') + dk('fa-receipt', 'Ödemelerim', 'hesabim/odemelerim/') + dk('fa-sliders', 'Hesap Ayarları', 'hesabim/ayarlar/') + dk('fa-headset', 'Çözüm Merkezi', 'hesabim/cozum-merkezi/') + grup('Oturum') + `<a href="${K}" data-cikis=""><i class="fa-solid fa-right-from-bracket"></i> Çıkış</a>`;
  const dacct = hesapBlok.outerHTML;
  dn.innerHTML = sat('fa-compass', 'Mekânlar', 'mekanlar/') + sat('fa-wand-magic-sparkles', 'Mekân Bul', 'mekan-bul/') + sat('fa-book-open', 'Gurme Lezzetler', 'gurme-lezzetler/') + sat('fa-route', 'Dada Route', 'dada-route/') + sat('fa-calendar-days', 'Etkinlikler', 'etkinlikler/') + `<div class="d-item"><a class="d-link" href="${K}giris/?fb=1" data-gorus-giris="menu"><i class="fa-solid fa-comment-dots"></i> Görüş Bildir</a></div>` + dacct;
  $$('.drawer-lang-list [data-lang="de"],.drawer-lang-list [data-lang="ru"]', dr).forEach((e) => e.remove());
  // 4. Altbilgi: sütun içeriği Gourmet, şeritler Gourmet kanon listesi, kabuk Gastro
  const f = $('footer.footer'); $('.foot-lockup .fl-word', f).innerHTML = logo; $('.foot-tag', f).textContent = go.tag; $('.foot-soc', f)?.remove();
  const kols = $$('.foot-col', f); go.kolonlar.slice(0, kols.length).forEach((c, i) => { kols[i].innerHTML = `<h5>${c.ad}</h5>` + c.hedef; });
  const app = $('.foot-app', f); $('h5', app).textContent = "Dada Gourmet'i İndir"; $('.foot-app-lead', app).textContent = go.lead;
  $$('.app-btn', app).forEach((a) => { a.removeAttribute('href'); a.removeAttribute('target'); a.removeAttribute('rel'); a.setAttribute('role', 'link'); a.setAttribute('aria-disabled', 'true'); a.title = 'Uygulama yayında değil'; });
  $('nav.foot-corp', f).innerHTML = go.corp; $('nav.foot-legal', f).innerHTML = go.legal;
  $('.fb-left', f).innerHTML = '© 2026 <b><span class="bd">Dada</span><span class="sf">Gourmet</span></b> · Dada İst Ajans Hizmetleri Ticaret Limited Şirketi · Tüm hakları saklıdır.';
  // 5. Alt çubuk canlı Gourmet kalemleri; Görüş Bildir konuları Gourmet alan listesi
  const fbm = $('#fbModal'); $$('.fb-chiprow', fbm).slice(0, 1).forEach((e) => (e.innerHTML = go.gorusAlan));
  const q = $$('.fb-fields[data-for="soru"] select option', fbm); ['Üyelik & Hesap', 'Rezervasyon', 'Mekân bilgisi', 'İşletme başvurusu', 'Diğer'].forEach((t, i) => { if (q[i + 1]) q[i + 1].textContent = t; });
  const sel = $('.fb-fields[data-for="sorun"] select', fbm); sel.innerHTML = '<option value="" selected disabled>Sorunu nerede yaşadın? *</option>' + ['Anasayfa', 'Mekân sayfası', 'Mekân listesi / arama', 'Mekân Bul', 'Dada Route', 'Üyelik & Giriş'].map((t) => `<option>${t}</option>`).join('');
  kok(document.body);
  document.querySelectorAll('.fb-kvkk a').forEach((a) => a.setAttribute('href', a.getAttribute('href').replace('aydinlatma', 'kvkk')));
  const lg = $('#lgGate'); lg.dataset.defDesc = 'Kaydetmek, yorum yapmak ve takip etmek için Dada Gourmet hesabına giriş yapman gerekiyor.'; metin(lg, /DadaGastro/g, 'Dada Gourmet');
  metin(fbm, /DadaGastro/g, 'Dada Gourmet');
  const ck = $('#cookieBanner'); metin(ck, /DadaGastro/g, 'Dada Gourmet');
  ck.classList.remove('show');
  const dis = (s) => $(s)?.outerHTML ?? '';
  return { ust: dis('.topbar') + '\n' + dis('header.header') + '\n' + dis('#drawerOverlay') + '\n' + dis('#drawer'),
    dip: dis('footer.footer'),
    katman: [dis('span.fb-rail'), dis('#fbTab'), dis('#fbOverlay'), dis('#fbModal'), dis('#toTop'), dis('#cookieBanner'), dis('#lgOverlay'), dis('#lgGate')].join('\n') };
}, { go, logo: logoSinifli });
yaz('ust', k.ust); yaz('dip', k.dip); yaz('katman', k.katman + '\n' + go.fab + '\n' + go.moOverlay + '\n' + go.moModal + '\n<div class="ke-toast" id="keToast" role="status"><i class="fa-solid fa-circle-check"></i><span id="keToastMsg"></span></div>'); yaz('alt-cubuk', go.bottom);
fs.writeFileSync(path.join(SRC, 'kabuk/logo.svg'), logo);
await kapat();
console.log('kabuk tamam', k.ust.length, k.dip.length, k.katman.length);
