// Etkinlikler: `node sayfa-etkinlik.mjs <cekim>/dom`. Gövde canlı `/etkinlikler` ve bir etkinlik detayı render'ı.
// Liste ve süzgeç `assets/js/sayfa/etkinlikler.js` ile çalışır; veri `etkinlik-veri.mjs` çıktısı. Takvim ve Harita aynı betikte; konum ve sıralama verisi `etkinlik-gorunum.mjs`.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const yaz = (y, meta, govde) => { const f = path.join(SRC, 'sayfalar', y, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `<!--${JSON.stringify({ yol: y, ...meta })}-->\n${govde}\n`); };
// Randevu penceresi: canlı `.fb-modal` ve `.mo-field` DOM'u. Kayıt talep dilinde; garanti yok
const randevu = `<div class="fb-overlay" id="evRandevuOverlay"></div><div class="fb-modal" id="evRandevu" role="dialog" aria-modal="true" aria-labelledby="evRandevuBaslik" inert=""><div class="fb-panel"><div class="fb-head"><div><h3 id="evRandevuBaslik">Randevu Oluştur</h3><p id="evRandevuAd"></p></div><button class="fb-close" id="evRandevuKapat" type="button" aria-label="Kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><div class="fb-body"><form id="evRandevuForm" data-yerel=""><div class="mo-row"><div class="mo-field"><label for="evGun">Gün</label><input type="date" id="evGun" name="gun" required=""></div><div class="mo-field"><label for="evKisi">Kişi sayısı</label><input type="number" id="evKisi" name="kisi" min="1" max="20" value="2" required=""></div></div><div class="mo-field"><label for="evNot">Not <span class="opt">(opsiyonel)</span></label><textarea id="evNot" name="not" placeholder="Erişim ihtiyacı, alerjen ya da düzenleyiciye iletmek istediğin bir not"></textarea></div><p class="ev-randevu-not">Kaydın Rezervasyonlarım sekmesine işlenir. Katılım koşullarını düzenleyici belirler. <span class="ornek-etiket">prototip örneği</span></p><div class="mo-foot"><button class="mo-submit" type="submit"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Randevu Oluştur</button><button class="mo-cancel" type="button" id="evRandevuVazgec">Vazgeç</button></div></form></div></div></div>`;

let p = await ac(path.join(D, 'o-etkinlikler-g.html'));
const liste = await p.evaluate(() => { kok(document.body); const m = document.querySelector('main'); m.removeAttribute('style'); const $ = (s, r = m) => r.querySelector(s), $$ = (s, r = m) => [...r.querySelectorAll(s)];
  $$('script').forEach((s) => s.parentNode.removeChild(s));
  // Türkiye önde, Uluslararası ayrı sekme (W1.3a, W1.3b)
  $('.ke-filter.ev-filter').insertAdjacentHTML('beforebegin', '<div class="ev-bolge" role="tablist" aria-label="Etkinlik bölgesi"><button class="ev-bolge-sekme aktif" type="button" role="tab" aria-selected="true" data-bolge="tr"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Türkiye <span id="evSayTr"></span></button><button class="ev-bolge-sekme" type="button" role="tab" aria-selected="false" data-bolge="dunya"><i class="fa-solid fa-earth-europe" aria-hidden="true"></i> Uluslararası <span id="evSayDunya"></span></button></div>');
  // Kategori çipi: süzgeç değeri bağdan okunur
  $$('.ke-filter .chip').forEach((a) => { const k = /kategori=([a-z0-9-]+)/.exec(a.getAttribute('href') || ''); a.setAttribute('href', '#'); if (k) a.dataset.kategori = k[1]; });
  // Görünüm: Liste, Takvim, Harita canlı `.vw-seg` DOM'u; geçiş sayfa içinde
  $$('.vw-seg .vs-btn').forEach((a) => { a.dataset.gorunum = /gorunum=(takvim|harita)/.exec(a.getAttribute('href') || '')?.[1] ?? 'liste'; a.setAttribute('href', '#'); });
  // Sıralama: canlı beş kalem; `sirala` değeri `etkinlik-gorunum.mjs` listesinin anahtarıdır
  $$('.sort-menu a').forEach((a) => { a.dataset.sira = /sirala=([a-z_]+)/.exec(a.getAttribute('href') || '')?.[1] ?? 'onerilen'; a.setAttribute('href', '#'); });
  // Sıfır sonuçlu seçenek gizli (K8)
  $$('label.fct-row').forEach((l) => { if ($('.fcnt', l)?.textContent.trim() === '0') l.parentNode.removeChild(l); });
  $('.btn-suggest').setAttribute('data-etkinlik-oner', '');
  $('.disc-grid').id = 'evGrid'; $('#evGrid').innerHTML = ''; $('#pagi').innerHTML = '';
  $('#filterForm').setAttribute('data-yerel', ''); $('.ke-hero-search').setAttribute('data-yerel', ''); $('.ke-hero-search').id = 'evArama';
  $('#evGrid').insertAdjacentHTML('afterend', '<div id="evTakvim" hidden></div><div id="evHarita" hidden><div class="mkl-map-wrap" id="evMapWrap"><div id="evMap" class="mkl-map"></div></div><p class="ev-empty" id="evHaritaBos" hidden>Bu filtrelerde haritada gösterilecek etkinlik yok.</p><p class="ev-map-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Çevrim içi etkinlikler ve tek bir konumu olmayan kayıtlar (ör. Türkiye geneli yarışmalar) haritada gösterilmez. Haritadaki işaretlerin bir kısmı şehir merkezine yerleştirilmiş yaklaşık konumlardır, etkinliğin tam adresi değildir.</p></div><div class="lst-empty" id="evBos" hidden><h3>Bu seçimle etkinlik bulunamadı</h3><p>Filtre azaltmayı dene ya da diğer sekmeye bak.</p></div>');
  return m.innerHTML; });
yaz('etkinlikler', { baslik: 'Etkinlikler', aktif: 'etkinlikler', zincir: 'hakkimizda', gourmet: true, css: ['etkinlikler.css', 'banner-uyarlama.css', 'etkinlikler-uyarlama.css', 'gourmet-sapma'], js: ['assets/vendor/maplibre/maplibre-gl.js', 'assets/js/etkinlik-veri.js', 'assets/js/harita.js', 'assets/js/sayfa/etkinlikler.js'], govdeSinif: 'pg-etkinlikler has-dark-hero', donor: 'https://dadagourmet.com/etkinlikler' }, liste + '\n<!--@main-disi-->\n' + randevu);

p = await ac(path.join(D, 'o-etkinlik-detay.html'));
const detay = await p.evaluate(() => { kok(document.body); const m = document.querySelector('main'); m.removeAttribute('style'); const $ = (s, r = m) => r.querySelector(s), $$ = (s, r = m) => [...r.querySelectorAll(s)];
  // Örnek detay DOM'u kalıp olur; alanları `etkinlik-detay.js` adresteki etkinlikten doldurur. Veride olmayan satırlar çıkar
  const st = $('.evd-stage'); st.removeAttribute('style'); st.removeAttribute('aria-label'); $('.px-media', st).removeAttribute('style');
  $$('.evd-chip').forEach((c, i) => { if (i === 2) c.parentNode.removeChild(c); });
  $$('.evd-about p').forEach((e, i) => { if (i) e.parentNode.removeChild(e); else e.textContent = ''; });
  $$('.evd-row').forEach((r) => { if (/Organizatör/.test(r.textContent)) r.parentNode.removeChild(r); });
  const kim = $$('.evd-program').find((e) => /Kimler Katılabilir/.test(e.textContent)); kim.parentNode.removeChild(kim);
  $$('.evd-program .evd-status').forEach((e) => { e.lastChild.nodeValue = ' Takvim bilgisi doğrulandı · Detaylı program henüz açıklanmadı'; });
  $('.evd-side').insertAdjacentHTML('beforeend', '<div class="evd-card ev-yan-eylem"><button class="btn btn-primary" type="button" id="evdRandevu" data-randevu=""><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Randevu Oluştur</button><a class="btn btn-ghost" id="evdBilet" target="_blank" rel="noopener" hidden>Bilet / Rezervasyon <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a></div>');
  $('.disc-grid', $('.evd-others')).innerHTML = ''; $('.disc-grid', $('.evd-others')).id = 'evdDiger';
  $$('.reveal').forEach((e) => e.classList.remove('reveal'));
  return m.innerHTML; });
yaz('etkinlik-detay', { baslik: 'Etkinlik', aktif: 'etkinlikler', zincir: 'hakkimizda', gourmet: true, css: ['etkinlik-detay.css', 'etkinlik-detay-uyarlama.css', 'gourmet-sapma'], js: ['assets/js/etkinlik-veri.js', 'assets/js/sayfa/etkinlikler.js'], govdeSinif: 'pg-etkinlik-detay', donor: 'https://dadagourmet.com/etkinlikler/mff-orta-dogu-gida-fuari-2026' }, detay + '\n<!--@main-disi-->\n' + randevu);
await kapat(); console.log('etkinlik tamam');
