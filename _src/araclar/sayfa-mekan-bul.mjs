// Mekân Bul: `node sayfa-mekan-bul.mjs <cekim>/dom`. Gövde canlı `/mekan-bul` adım 1 render'ı (`o-mekan-bul.html`).
// Canlı sihirbaz 5 adım ve POST ile ilerler (Nerede · Ne İçin · Ne Yemek · Bütçe · Son Detaylar). Beyar revizesi (10 Kas) 4 adım:
// 1 Konum + Bütçe · 2 Ortam & Atmosfer (canlı "Ne İçin?" konsept listesi, çoklu) · 3 Mutfak (canlı liste, aile sekmeleri) · 4 Nitelikler + zaman.
// Seçenek kümeleri canlı `/mekanlar` süzgecinin kodları ve adlarıdır (GET, 10 Kas): konsept 19, mutfak 18, hizmet 18 + beslenme 7 + ulaşım 10.
// Mutfak sekmeleri donörün `.mb-tabs` / `.mb-tabpanel` kalıbı (eski repo step3, sınıfları canlı `mekan-bul.css`'te duruyor); nitelik grupları
// canlı adım 5'in `.mb-acc` + `.fct` akordiyonu. Sonuç ekranı POST ile açıldığı için çekilemez; sınıf kümesi `sonuclar.blade.php`, `_sonuc-karti.blade.php`.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const p = await ac(path.join(D, 'o-mekan-bul.html'));
const govde = await p.evaluate(() => { kok(document.body); const m = document.querySelector('main'); m.removeAttribute('style');
  const $ = (s, r = m) => r.querySelector(s), $$ = (s, r = m) => [...r.querySelectorAll(s)];
  const N = 4;
  $('.lead').textContent = '4 kısa adım: konum ve bütçe, ortam, mutfak, senin için önemli olanlar. Sonunda mekânları seçimlerine uyma oranıyla sıralayalım.';
  // Stepper: canlı .stp ve .stp-line kalıbı, 4 adım
  const st = $('#mbStepper'), stp = $('.stp', st).cloneNode(true), cizgi = $('.stp-line', st).cloneNode(true); stp.classList.remove('active'); st.innerHTML = '';
  [['Konum ve Bütçe', 'Nerede, ne kadar?'], ['Ortam', 'Atmosfer'], ['Ne Yemek', 'Mutfak'], ['Nitelikler', 'Tercih ve zaman']].forEach(([a, b], i) => { const e = stp.cloneNode(true); e.dataset.adim = i + 1; $('.stp-num span', e).textContent = i + 1; $('.stp-lbl b', e).textContent = a; $('.stp-lbl small', e).textContent = b; if (i === 0) e.classList.add('active'); st.appendChild(e); if (i < N - 1) st.appendChild(cizgi.cloneNode(true)); });
  // Seçim kutusu: canlı .pick kalıbı. `ek` girdiye öznitelik ekler (süzme alanı ve kodları)
  const kalip = $('.pick');
  const sec = (tur, ad, deger, ikon, baslik, alt, ek = {}) => { const e = kalip.cloneNode(true); const i = $('input', e); i.type = tur; i.name = ad; i.value = deger; i.removeAttribute('required'); i.removeAttribute('data-toggle-sub'); Object.entries(ek).forEach(([k, v]) => i.setAttribute(k, v)); if (ikon.startsWith('bayrak-')) $('.pk-ico', e).innerHTML = `<img class="mb-bayrak" src="{{kok}}assets/g/varliklar/flags/${ikon.slice(7)}.svg" alt="" width="28" height="21" decoding="async">`; else $('.pk-ico i', e).className = `fa-solid ${ikon}`; $('.pk-txt b', e).textContent = baslik; const s = $('.pk-txt small', e); if (alt) s.textContent = alt; else s.remove(); return e.outerHTML; };
  const not = (t) => { const e = $('.pick-note').cloneNode(true); e.removeAttribute('id'); [...e.childNodes].forEach((n) => { if (n.nodeType === 3) n.remove(); }); e.append(' ' + t); return e.outerHTML; };
  metin($('[data-sub="harita"]'), / — /g, '; '); // ortak kural: uzun tire yok
  const bolge = $('[data-sub="bolge"]'), geo = $('[data-sub="mevcut"]'), mesafe = $('#mbDistBar'); const il = $('#mbCascade'); il.removeAttribute('data-region-tree');
  $('#mbSehir', il).innerHTML = '<option value="">İl seç</option>'; const geoNot = $('#mbGeoStatus', geo); geoNot.lastChild.nodeValue = ' Tarayıcı konum izni isteyecek. Vermezsen Bölge Seç ile devam edebilirsin.';
  const adim = (n, ikon, baslik, icerik) => { const k = $('.wstep').cloneNode(false); k.classList.toggle('active', n === 1); k.dataset.adim = n; const h = $('.fc-head').cloneNode(true); h.querySelector('h2').innerHTML = `<i class="fa-solid ${ikon}" aria-hidden="true"></i> ${baslik}`; $('.fc-step', h).textContent = `Adım ${n} / ${N}`; const d = $('.wiz-foot').cloneNode(true); $('.wf-note', d).lastChild.nodeValue = ` ${n} / ${N} adım: istediğin an geri dönebilirsin.`; const eylem = $('.wf-actions', d); eylem.innerHTML = `${n > 1 ? '<button class="btn btn-ghost" type="button" data-geri=""><i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Geri</button>' : `<a class="wf-skip" href="{{kok}}mekanlar/">İçeriklere geç</a>`}<button class="btn btn-primary" type="button" data-ileri="">${n === N ? 'Sonuçları Gör' : 'Devam'} <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>`; return `<div class="${k.className}" data-adim="${n}">${h.outerHTML}${icerik}${d.outerHTML}</div>`; };
  const izgara = (q, sinif, ic) => `<div class="pick-grid ${sinif}" data-q="${q}">${ic}</div>`;
  const coklu = (ad, alan, l) => l.map(([deger, ikon, baslik, kodlar]) => sec('checkbox', ad, deger, ikon, baslik, '', { 'data-f': alan, 'data-kod': kodlar || deger })).join('');

  // Adım 1: Konum + Bütçe (canlı adım 1 ve adım 4). Bütçe etiket, ipucu ve ikonları canlı `MekanBulSecenekleriServisi::butceSecenekleri()`
  const a1 = `<h3 class="mb-alt-baslik">Nerede?</h3>` + izgara('yontem', 'mb-grid-4', sec('radio', 'yontem', 'hepsi', 'fa-earth-europe', 'Fark Etmez', 'Tüm Türkiye') + sec('radio', 'yontem', 'bolge', 'fa-city', 'Bölge Seç', 'Şehir, ilçe') + sec('radio', 'yontem', 'mevcut', 'fa-location-crosshairs', 'Konumumu Kullan', 'Yakınımdakiler') + sec('radio', 'yontem', 'harita', 'fa-map-location-dot', 'Haritadan Seç', 'Bölgeyi tarif et')) + bolge.outerHTML + geo.outerHTML + $('[data-sub="harita"]').outerHTML + mesafe.outerHTML /* Haritadan Seç canlıdaki gibi (Beyar 9 Kas) */
    + `<h3 class="mb-alt-baslik">Bütçen ne?</h3>` + izgara('butce', 'mb-grid-3', sec('radio', 'butce', '1', 'fa-coins', 'Ekonomik', '₺') + sec('radio', 'butce', '2', 'fa-wallet', 'Orta', '₺₺') + sec('radio', 'butce', '3', 'fa-gem', 'Üst Orta', '₺₺₺') + sec('radio', 'butce', '4', 'fa-crown', 'Lüks', '₺₺₺₺') + sec('radio', 'butce', '', 'fa-shuffle', 'Bütçe Önemli Değil', 'Hepsini göster')) + not('Fiyatlar değişebileceği için tahmini fiyat seviyesi (₺) gösterilir.');

  // Adım 2: Ortam & Atmosfer. Canlı "Ne İçin?" adımının konsept listesi (19), çoklu seçim, her seçeneğe ayrı ikon (FA 6.5.2 Free)
  const a2 = izgara('ortam', 'mb-grid-4', coklu('ortam', 'konsept', [
    ['butik-restoran', 'fa-gem', 'Butik'], ['tarihi', 'fa-landmark', 'Tarihi'], ['modern', 'fa-cube', 'Modern'], ['geleneksel', 'fa-scroll', 'Geleneksel'],
    ['minimalist', 'fa-feather', 'Minimalist'], ['luks', 'fa-champagne-glasses', 'Lüks'], ['doga-icinde', 'fa-leaf', 'Doğa İçinde'], ['bahceli-restoran', 'fa-tree', 'Bahçeli'],
    ['terasli', 'fa-sun', 'Teraslı'], ['manzarali', 'fa-binoculars', 'Manzaralı'], ['deniz-kenari', 'fa-anchor', 'Deniz Kenarı'], ['gol-kenari', 'fa-water', 'Göl Kenarı'],
    ['dag-yayla', 'fa-mountain', 'Dağ / Yayla'], ['ciftlikten-sofraya-restoran', 'fa-tractor', 'Çiftlik / Köy'], ['tas-konak', 'fa-archway', 'Taş Konak'], ['endustriyel', 'fa-industry', 'Endüstriyel'],
    ['sanat-ve-kultur', 'fa-palette', 'Sanat ve Kültür'], ['yoresel-lezzet-noktasi', 'fa-store', 'Yerel Lezzet Noktası'], ['sef-restorani', 'fa-star', 'Şef Restoranı']]) + sec('checkbox', 'ortam', 'fark-etmez', 'fa-shuffle', 'Fark Etmez', 'Hepsini tara', { 'data-fark': '' }))
    + not('Birden çok seçebilirsin. Seçtiklerinden en az birini taşıyan mekân bu kriteri karşılar; Fark Etmez ortamı kriter dışı bırakır.');
  // B6 (Beyar 11 Kas): 19 konseptin ardından 20. kart "Fark Etmez" (canlı adım 3 `yemek_mod=fark_etmez` kartının etiketi, ipucu ve ikonu);
  // seçilince öbür ortamlar kalkar, ortam kriter sayılmaz. 4 sütunda 5 tam satır, 2 sütunda 10 tam satır

  // Adım 3: Mutfak. Canlı 18 mutfak, yeni kalem yok; yalnız aile sekmelerine ayrıldı (donör step3 `.mb-tabs` kalıbı)
  const SEKME = [
    ['ogun', 'fa-mug-saucer', 'Öğün ve Lezzet', [['kahvalti-serpme', 'fa-egg', 'Kahvaltı / Serpme'], ['kebap-ocakbasi', 'fa-fire', 'Kebap / Ocakbaşı'], ['deniz-urunleri', 'fa-fish', 'Deniz Ürünleri']]],
    ['turk', 'fa-map-location-dot', 'Türk ve Yöresel', [['turk-mutfagi', 'bayrak-tr', 'Türk Mutfağı'], ['anadolu-mutfagi', 'fa-wheat-awn', 'Anadolu Mutfağı'], ['ege-mutfagi', 'fa-leaf', 'Ege Mutfağı'], ['akdeniz-mutfagi', 'fa-lemon', 'Akdeniz Mutfağı'], ['karadeniz-mutfagi', 'fa-fish-fins', 'Karadeniz Mutfağı'], ['guneydogu-mutfagi', 'fa-mug-hot', 'Güneydoğu Mutfağı'], ['dogu-anadolu-mutfagi', 'fa-cheese', 'Doğu Anadolu Mutfağı'], ['ic-anadolu-mutfagi', 'fa-bread-slice', 'İç Anadolu Mutfağı']]],
    ['dunya', 'fa-earth-americas', 'Dünya Mutfakları', [['italyan-mutfagi', 'bayrak-it', 'İtalyan Mutfağı'], ['fransiz-mutfagi', 'bayrak-fr', 'Fransız Mutfağı'], ['japon-mutfagi', 'bayrak-jp', 'Japon Mutfağı'], ['cin-mutfagi', 'bayrak-cn', 'Çin Mutfağı'], ['kore-mutfagi', 'bayrak-kr', 'Kore Mutfağı'], ['hint-mutfagi', 'bayrak-in', 'Hint Mutfağı'], ['meksika-mutfagi', 'bayrak-mx', 'Meksika Mutfağı']]]];
  // B7 (Beyar 11 Kas): sekmeler kanon §11 `.sekmeler.esit` segmenti, satıra eşit yayılır; telefonda kısa ad (ilk sözcük), iki satır yok.
  // B8: Dünya Mutfakları ve Türk Mutfağı kartında Gastro bayrağı (`assets/g/varliklar/flags/<iso>.svg`, Gastro tercih sihirbazının `.tercih-bayrak` ölçüsü);
  // yöre kartları ikonlu kalır. Üstte bütün sekmelerde arayan tek kutu (Keşif Tercihlerim `.tercih-ara` kalıbı); aramada şerit söner, eşleşen kartlar grup başlığıyla
  const sekmeAd = (ad) => { const [ilk, ...kalan] = ad.split(' '); return kalan.length ? `${ilk}<span class="mb-tab-uzun"> ${kalan.join(' ')}</span>` : ad; };
  const a3 = `<div class="mb-ara" role="search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input class="alan-girdi" type="search" id="mbMutfakAra" placeholder="Mutfak ara…" aria-label="Mutfak ara" autocomplete="off" enterkeyhint="search"><button class="mb-ara-temizle" type="button" id="mbAraTemizle" aria-label="Aramayı temizle" hidden=""><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>`
    + `<div class="mb-tabs sekmeler esit" id="mbMutfakSekme" role="tablist" aria-label="Mutfak ailesi">${SEKME.map(([k, ikon, ad], i) => `<button type="button" class="sekme mb-tab${i ? '' : ' active'}" data-tab="${k}" role="tab" aria-selected="${i ? 'false' : 'true'}" aria-controls="mbMutfak-${k}" id="mbSekme-${k}"><i class="fa-solid ${ikon}" aria-hidden="true"></i> <span class="mb-tab-ad">${sekmeAd(ad)}</span> <span class="mb-tab-dot" data-tab-count="${k}" hidden="">0</span></button>`).join('')}</div>`
    + SEKME.map(([k, ikon, ad, l], i) => `<div class="mb-tabpanel${i ? '' : ' active'}" data-panel="${k}" id="mbMutfak-${k}" role="tabpanel" aria-labelledby="mbSekme-${k}"><h3 class="mb-panel-bas"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${ad} <span class="mb-panel-sayi" data-panel-sayi=""></span></h3>${izgara('mutfak-' + k, 'mb-grid-3', coklu('mutfak', 'mutfak', l))}</div>`).join('')
    + `<p class="mb-ara-yok" id="mbAraYok" hidden="">Aramana uyan mutfak yok.</p><p class="sr-only" id="mbAraDurum" aria-live="polite"></p>`
    + not('Birden çok seçebilirsin; sekme değiştirmek seçimini silmez. Hiçbirini seçmezsen mutfak kriter olmaz.');

  // Adım 4: Nitelikler. B9 (Beyar 11 Kas): tek açık grup (kanon §21); kapalı başlık seçim sayısını ve kısa ad özetini taşır. Canlı hizmet, beslenme, ulaşım etiketleri (35); kısa ad, ilgili olanlar tek kutuda (kodlardan biri yeter)
  const grup = (ikon, baslik, ic, acik) => `<div class="fct${acik ? ' open' : ''}" data-acc=""><button class="fct-head" type="button" aria-expanded="${acik ? 'true' : 'false'}"><i class="fa-solid ${ikon} mb-acc-ico" aria-hidden="true"></i> ${baslik} <span class="fct-dot">0</span><span class="mb-acc-ozet" data-acc-ozet=""></span><i class="fa-solid fa-chevron-down fct-car" aria-hidden="true"></i></button><div class="fct-body">${ic}</div></div>`;
  const satir = (ad, metin, ek) => `<label class="fct-row"><input type="checkbox" name="${ad}" value="1"${Object.entries(ek).map(([k, v]) => ` ${k}="${v}"`).join('')}><span class="cbx"></span><span class="ft">${metin}</span></label>`;
  const a4 = `<div class="mb-acc">`
    + grup('fa-bell-concierge', 'Hizmetler', izgara('nitelik-hizmet', 'mb-grid-3', coklu('nitelik', 'hizmet', [
      ['acik-alan', 'fa-umbrella-beach', 'Açık alan / Teras', 'acik-alan bahce teras'], ['cocuk', 'fa-children', 'Çocuk dostu', 'cocuk-dostu bebek-sandalyesi bebek-bakim-alani'], ['evcil', 'fa-paw', 'Evcil hayvan', 'evcil-hayvan-dostu'],
      ['wifi', 'fa-wifi', 'Wi-Fi / Çalışma', 'wifi calismaya-uygun'], ['muzik', 'fa-music', 'Canlı müzik', 'canli-muzik'], ['kart', 'fa-credit-card', 'Kredi kartı', 'kredi-karti'],
      ['paket', 'fa-bag-shopping', 'Paket / Gel-al', 'paket-servis gel-al'], ['klima', 'fa-temperature-half', 'Klima / Isıtma', 'klima-isitma'], ['grup', 'fa-people-group', 'Grup / Özel gün', 'grup-rezervasyonu ozel-gun']])), true)
    + grup('fa-leaf', 'Beslenme', izgara('nitelik-beslenme', 'mb-grid-3', coklu('nitelik', 'beslenme', [
      ['vegan', 'fa-seedling', 'Vegan', 'vegan'], ['vejetaryen', 'fa-carrot', 'Vejetaryen', 'vejetaryen'], ['glutensiz', 'fa-wheat-awn-circle-exclamation', 'Glütensiz', 'glutensiz'],
      ['sekersiz', 'fa-cubes-stacked', 'Şekersiz', 'sekersiz'], ['saglikli', 'fa-apple-whole', 'Sağlıklı / Organik', 'saglikli-beslenme organik-urun-odakli'], ['alerjen', 'fa-triangle-exclamation', 'Alerjen bilgisi', 'alerjen-bilgisi']])))
    + grup('fa-wheelchair', 'Ulaşım ve erişim', izgara('nitelik-ulasim', 'mb-grid-4', coklu('nitelik', 'ulasim', [
      ['otopark', 'fa-square-parking', 'Otopark / Vale', 'otopark ozel-otopark vale'], ['toplu', 'fa-train-subway', 'Toplu taşıma', 'toplu-tasimaya-yakin metroya-yakin'],
      ['engelli', 'fa-wheelchair-move', 'Engelli erişimi', 'engelli-erisimi tekerlekli-sandalye-erisimi giris-rampasi asansor'], ['bebek-arabasi', 'fa-baby-carriage', 'Bebek arabası', 'bebek-arabasiyla-erisim']])))
    + grup('fa-calendar-check', 'Ne zaman gideceksin?', `${satir('simdi', 'Şimdi açık olmalı', { 'data-f': 'acik', 'data-kod': 'simdi' })}${satir('rez', 'Rezervasyon alıyor olmalı', { 'data-f': 'hizmet', 'data-kod': 'rezervasyon-aliyor online-rezervasyon' })}`)
    + `</div>` + not('Hiçbirini seçmeden de devam edebilirsin. Seçtiğin her nitelik eşleşme oranına girer; birleşik etiketlerde biri yeter.');

  $('#mbCard').innerHTML = adim(1, 'fa-location-dot', 'Konum ve bütçe', a1) + adim(2, 'fa-layer-group', 'Ortam ve atmosfer', a2) + adim(3, 'fa-utensils', 'Ne yemek istersin?', a3) + adim(4, 'fa-sliders', 'Senin için önemli olan', a4);
  // Sonuç: sonuclar.blade.php sınıf kümesi. İçeriği `mekan-bul.js` doldurur
  $('.wiz-solo').insertAdjacentHTML('afterend', `<div class="mb-sonuc" id="mbSonuc" hidden><p class="sr-only" id="mbDuyuru" role="status" aria-live="polite"></p><div class="res-summary" tabindex="-1"><span class="rs-lbl"><i class="fa-solid fa-sliders" aria-hidden="true"></i> Seçimlerin:</span><span id="mbCipler"></span><button class="res-edit" type="button" id="mbDuzenle">Düzenle</button></div><p class="mb-hesap" id="mbHesap"></p><div id="mbGruplar"></div><div class="wiz-foot"><span class="wf-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Oran yalnız senin seçtiğin kriterlerden hesaplanır; mekân verisi canlı kayıtların kopyasıdır.</span><div class="wf-actions"><button class="btn btn-ghost" type="button" id="mbYeni"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Yeni Arama</button></div></div></div>`);
  $$('[hidden]').forEach((e) => e.setAttribute('hidden', ''));
  return m.innerHTML; });
fs.mkdirSync(path.join(SRC, 'sayfalar/mekan-bul'), { recursive: true });
fs.writeFileSync(path.join(SRC, 'sayfalar/mekan-bul/index.html'), `<!--${JSON.stringify({ yol: 'mekan-bul', baslik: 'Mekân Bul', aktif: 'mekan-bul', zincir: 'hakkimizda', gourmet: true, css: ['mekan-bul.css', 'banner-uyarlama.css', 'mekan-karti-uyarlama.css', 'gourmet-sapma'], js: ['assets/js/mekan-liste-veri.js', 'assets/js/sayfa/mekan-bul.js'], govdeSinif: 'pg-mekan-bul has-dark-hero', donor: 'https://dadagourmet.com/mekan-bul + resources/views/site/mekan-bul/sonuclar.blade.php' })}-->\n${govde}\n`);
await kapat(); console.log('mekan bul tamam');
