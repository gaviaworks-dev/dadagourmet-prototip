// Kimlik ve kurumsal ekranlar. `node sayfa-kurumsal.mjs <cekim>/dom`
// Kaynak sırası: kabuk ve akış canlı Gastro; metin canlı Gourmet. Şirket bilgisi K5 gereği yer tutucu kalır.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const yaz = (y, meta, govde) => { const f = path.join(SRC, 'sayfalar', y + '.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `<!--${JSON.stringify({ yol: y.replace(/\/?index$/, ''), ...meta })}-->\n${govde.replace(/(data-[a-z-]*betik=")\/([^"?]+)\?v=[^"]*"/g, '$1{{kok}}assets/g/$2"')}\n`); };
const dom = (f) => path.join(D, f + '.html');

// Giriş ailesi: pano metni canlı Gourmet'ten, form ve akış Gastro'dan
let p = await ac(dom('o-giris'));
const pano = await p.evaluate(() => document.querySelector('.giris-pano').innerHTML);
p = await ac(dom('g-kayit'));
const kayitPane = await p.evaluate(() => { kok(document.body); const k = document.querySelector('#auPaneKayit'); k.querySelector('.adim-liste')?.remove(); k.querySelector('.giris-ayrac')?.remove();
  k.querySelector('input[name="brand"]')?.setAttribute('value', 'gourmet');
  k.querySelector('.giris-bas p').textContent = '1 dakikada Dada Gourmet hesabını oluştur — beğendiğin yerleri kaydetmeye hemen başla.';
  metin(k, /DadaGastro/g, 'Dada Gourmet'); return k.outerHTML; });
p = await ac(dom('g-giris'));
const giris = await p.evaluate(({ pano, kayitPane }) => {
  kok(document.body);
  const m = document.querySelector('main'); const pn = m.querySelector('.giris-pano'); pn.innerHTML = pano; pn.removeAttribute('style'); pn.setAttribute('data-pano', 'gourmet');
  // Bağlı olmayan sağlayıcı görünmez (K4 notu, §1.5): Gourmet'te sosyal giriş kurulu değil
  m.querySelectorAll('.adim-liste,.giris-ayrac').forEach((e) => e.remove());
  m.querySelector('#auPaneGiris .giris-bas p').textContent = 'Kaldığın yerden devam et — listelerin ve rezervasyonların seni bekliyor.';
  m.querySelector('.kirinti-ev .yalniz-okuyucu').textContent = 'Dada Gourmet ana sayfa';
  m.querySelector('#auPaneGiris').insertAdjacentHTML('afterend', kayitPane);
  metin(m, /DadaGastro/g, 'Dada Gourmet');
  return m.innerHTML;
}, { pano, kayitPane });
const varyant = async (aktif, baslik, sekme) => {
  await p.setContent(`<main>${giris}</main>`);
  return p.evaluate(({ aktif, baslik, sekme, sifre }) => { const m = document.querySelector('main');
    const doldur = (id, v) => { const e = m.querySelector('#' + id); if (e) e.setAttribute('value', v); };
    doldur('giEmail', '{{uye.eposta}}'); doldur('giPass', sifre); doldur('kaAd', 'Örnek'); doldur('kaSoyad', 'Üye'); doldur('kaEmail', '{{uye.eposta}}'); doldur('kaPass', sifre); doldur('sfEmail', '{{uye.eposta}}'); doldur('ysYeni', sifre); doldur('ysTekrar', sifre);
    m.querySelectorAll('#cbUyelik,#cbKvkk').forEach((c) => c.setAttribute('checked', ''));
    m.querySelectorAll('[data-pane] .giris-bas').forEach((b) => { if (!b.querySelector('.ornek-etiket')) b.insertAdjacentHTML('beforeend', '<span class="ornek-etiket">prototip örneği</span>'); });
    m.querySelectorAll('[data-pane]').forEach((e) => { e.hidden = e.dataset.pane !== aktif; });
    if (aktif !== 'kayit') m.querySelector('#auPaneKayit').remove(); else ['giris', 'sifre', 'yeni-sifre'].forEach((a) => m.querySelector(`[data-pane="${a}"]`)?.remove());
    m.querySelector('#auCrumb').textContent = baslik;
    const g = m.querySelector('#auTabGiris'), k = m.querySelector('#auTabKayit');
    g.setAttribute('href', '{{kok}}giris/'); k.setAttribute('href', '{{kok}}kayit/');
    g.classList.toggle('aktif', sekme === 'giris'); k.classList.toggle('aktif', sekme === 'kayit'); g.setAttribute('aria-selected', sekme === 'giris'); k.setAttribute('aria-selected', sekme === 'kayit');
    if (aktif === 'yeni-sifre') { m.querySelector('#formYeniSifre')?.removeAttribute('hidden'); const b = m.querySelector('#auYsHesap'); if (b) b.textContent = '{{uye.eposta}}'; m.querySelectorAll('[data-pane="yeni-sifre"] [hidden]').forEach((e) => { if (e.id !== 'formYeniSifre' && e.querySelector?.('input,button')) e.removeAttribute('hidden'); }); }
    return m.innerHTML; }, { aktif, baslik, sekme, sifre: DEMO_SIFRE });
};
// Hazır demo: sahte değerler, gerçek hesap yok. Gönderim `assets/js/prototip.js` içinde kesilir.
const DEMO_SIFRE = 'Ornek-1234!';
const kimlik = { zincir: 'giris', duzen: 'public', govdeSinif: 'dg-auth', js: ['assets/js/sayfa/giris.js'] };
yaz('giris/index', { ...kimlik, baslik: 'Giriş Yap', donor: 'https://dadagastro.com/giris' }, await varyant('giris', 'Giriş Yap', 'giris'));
yaz('kayit/index', { ...kimlik, baslik: 'Kayıt Ol', donor: 'https://dadagastro.com/kayit' }, await varyant('kayit', 'Kayıt Ol', 'kayit'));
yaz('sifremi-unuttum/index', { ...kimlik, baslik: 'Şifremi Unuttum', donor: 'https://dadagastro.com/giris (sifre panosu)' }, await varyant('sifre', 'Şifremi Unuttum', 'giris'));
yaz('sifre-yenile/index', { ...kimlik, baslik: 'Yeni Şifre', donor: 'https://dadagastro.com/giris (yeni-sifre panosu)' }, await varyant('yeni-sifre', 'Yeni Şifre', 'giris'));

// Hakkımızda: canlı Gourmet gövdesi ve Gastro zinciri (sınıf kümesi aynı). "81 il" sabiti gerçek sayıyla değişir.
p = await ac(dom('o-hakkimizda'));
yaz('hakkimizda/index', { baslik: 'Hakkımızda', zincir: 'hakkimizda', donor: 'https://dadagourmet.com/hakkimizda + https://dadagastro.com/hakkimizda' }, await p.evaluate(() => { kok(document.body); const m = document.querySelector('main');
  m.querySelectorAll('.st b,.lst-stats b,.lst-stats strong,.st strong').forEach((b) => { if (b.textContent.trim() === '81') b.textContent = '15'; });
  metin(m, /\b81 il\b/g, '15 il'); /* "küçük bir esnaf lokantası" canlıdaki gibi kalır (Beyar 9 Kas) */
  /* reklam-son-duzelt (11 Kas, Beyar): canlıdaki about-* görselleri kadehli ya da barlı; yerine prototipin kadehsiz gerçek fotoğrafları
     (hero, galeri üç kare, istatistik bandı; kaynak sayfa _src/sayfalar/hakkimizda/index.html ile aynı) */
  const kadehsiz = (e) => e.closest('.below-header') ? 'assets/o/assets/gourmet-public/medya/konsept-doga-icinde.webp' : e.closest('.statband') ? 'assets/o/assets/gourmet-public/medya/9736.webp'
    : { 'about-restaurant': 'assets/o/medya/1077-800.webp', 'about-table': 'assets/o/medya/1074-800.webp', 'about-dining': 'assets/o/medya/1068-800.webp' }[/about-(restaurant|table|dining)/.exec(e.getAttribute('style'))[0]];
  m.querySelectorAll('[style*="about-"]').forEach((e) => { e.style.backgroundImage = 'url("{{kok}}' + kadehsiz(e) + '")'; });
  return m.innerHTML; }));
// Künye: satırlar Gastro'dan; değerler K5 yer tutucusu
p = await ac(dom('g-kunye'));
yaz('kunye/index', { baslik: 'Künye', zincir: 'kunye', donor: 'https://dadagastro.com/kunye' }, await p.evaluate(({ }) => { kok(document.body); const m = document.querySelector('main');
  metin(m, /DadaGastro/g, 'Dada Gourmet'); m.querySelectorAll('.px-media').forEach((e) => { e.setAttribute('style', "background-image:url('{{kok}}assets/o/assets/gourmet-public/medya/konsept-sanat-ve-kultur.webp')"); e.innerHTML = ''; }); /* reklam-son-duzelt: kadehsiz hero */ m.querySelectorAll('.lg-top').forEach((e) => e.setAttribute('style', "background-image:linear-gradient(90deg,rgba(28,25,18,.93),rgba(33,30,22,.72)),url('{{kok}}assets/o/assets/gourmet-public/medya/konsept-sanat-ve-kultur.webp')")); return m.innerHTML; }, {}));
// İletişim: canlı Gourmet sayfası eksik (MB 0.20), Gastro sayfası marka değiştirilerek alınır
p = await ac(dom('g-iletisim'));
yaz('iletisim/index', { baslik: 'İletişim', zincir: 'iletisim', donor: 'https://dadagastro.com/iletisim' }, await p.evaluate(() => { kok(document.body); const m = document.querySelector('main');
  metin(m, /DadaGastro|Dada Gastro/g, 'Dada Gourmet');
  metin(m, /tarif|Tarif/g, (x) => (x[0] === 'T' ? 'Mekân' : 'mekân'));
  m.querySelectorAll('.ci-row b').forEach((b) => { if (/@/.test(b.textContent)) b.textContent = 'dadamentorcom@gmail.com'; });
  m.querySelectorAll('a[href^="mailto:"]').forEach((a) => { a.setAttribute('href', 'mailto:dadamentorcom@gmail.com'); a.textContent = 'dadamentorcom@gmail.com'; });
  m.querySelectorAll('.px-media').forEach((e) => { e.setAttribute('style', "background-image:url('https://dadagourmet.com/assets/gourmet-public/img/contact-kitchen.avif')"); e.innerHTML = ''; });
  m.querySelectorAll('a[href*="instagram.com"],a[href*="facebook.com"],a[href*="x.com/"]').forEach((a) => a.remove());
  // Konu seçicisi çekimde betikle çizilmiş hâlde geliyor; `iletisim.js` aynısını yeniden kurunca sayfada iki "Konu seç" kutusu çıkıyordu
  // (ilki ölü, etiket ona bağlı). Seçici sökülür, etiket gizli `<select>`e bağlanır; betik kendi kutusunu ve sayacını kurar (Dalga 2 mobil, 11 Kas)
  m.querySelectorAll('select#konu ~ .gastro-secici').forEach((e) => e.remove());
  m.querySelectorAll('label[for="konuArama"]').forEach((l) => { l.setAttribute('for', 'konu'); l.classList.remove('gastro-secim-etiket'); l.querySelectorAll('.gastro-secim-sayac').forEach((e) => e.remove()); });
  return m.innerHTML; }));
// Hukuki örnek: canlı Gourmet KVKK metni; yer tutucular görünür etikete bağlanır
p = await ac(dom('o-kvkk'));
yaz('yasal/kvkk/index', { baslik: 'KVKK Aydınlatma Metni', zincir: 'kvkk', js: ['assets/o/assets/gourmet-public/js/shared/scroll-affordance.js'], donor: 'https://dadagourmet.com/yasal/kvkk + https://dadagastro.com/yasal/kvkk' }, await p.evaluate(() => { kok(document.body); const m = document.querySelector('main');
  const sil = (e) => e.parentNode?.removeChild(e);
  /* B-A3 (12 Kas): telefonda yatay kayan menü şeridi ortak kenar solmasını alır (`[data-scroll-fade]`, prototip.css) */ m.querySelectorAll('.lg-menu').forEach((e) => e.setAttribute('data-scroll-fade', ''));
  const yaprak = (re) => [...m.querySelectorAll('li,p,tr,dd,dt,div')].filter((e) => re.test(e.textContent) && ![...e.querySelectorAll('li,p,tr,dd,dt,div')].some((c) => re.test(c.textContent)));
  yaprak(/\[(MERSİS no|vergi dairesi \/ vergi no|KEP adresi)\]/).forEach(sil);
  yaprak(/Durum: Taslak/).forEach(sil); yaprak(/taslak olarak hazırl/).forEach(sil);
  metin(m, /\[unvan\]/g, 'Dada İst Ajans Hizmetleri Ticaret Limited Şirketi'); metin(m, /\[adres\]/g, 'Yavuz Sultan Selim Mah. No:52/B, Fatih/İstanbul 34083'); metin(m, /\[e-posta\]/g, 'dadamentorcom@gmail.com');
  /* reklam-son-duzelt (11 Kas, Beyar): kadehsiz hero (canlı legal-restaurant kadehli) */ m.querySelectorAll('.lg-top').forEach((e) => e.setAttribute('style', "background-image:linear-gradient(90deg,rgba(28,25,18,.93),rgba(33,30,22,.72)),url('{{kok}}assets/o/assets/gourmet-public/medya/konsept-sanat-ve-kultur.webp')")); m.querySelectorAll('.lg-top .px-media').forEach((e) => e.setAttribute('style', "background-image:url('{{kok}}assets/o/assets/gourmet-public/medya/konsept-sanat-ve-kultur.webp')"));
  return m.innerHTML; }));
await kapat(); console.log('kurumsal tamam');
