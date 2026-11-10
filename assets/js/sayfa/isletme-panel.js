/* İşletme Paneli: mekân sahibinin demo durumu. Hiçbir veri gönderilmez; her şey bu tarayıcıda kalır.
   Panelin kendi kayıtları `dg-isletme-panel` anahtarında (ilk açılışta sayfadaki #isletmeTohum'dan kurulur).
   Üyeyle paylaşılan kayıtlar `window.dgKayit` (prototip.js): üyenin Mikla rezervasyonu, değerlendirmesi; başvuru, belge,
   değişiklik talebi ve değerlendirme yanıtı eski portalın anahtarlarıyla (isletme-basvuru, isletme-belge, isletme-talep, isletme-yanit).
   Bildirim ve silme onayı kanon kitinden (kanon/admin-kit.js: DM_TOAST, DM_ONAY). */
(function () {
  'use strict';
  const kok = document.documentElement.dataset.kok || './';
  const yol = document.documentElement.dataset.yol || '';
  const $ = (s, k) => (k || document).querySelector(s);
  const $$ = (s, k) => [].slice.call((k || document).querySelectorAll(s));
  const kac = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const ik = (i) => '<i class="fa-solid ' + i + '" aria-hidden="true"></i>';
  const ET = '<span class="ornek-etiket satir-ici">prototip örneği</span>';
  const KD = window.dgKayit, PU = window.dgPuan;
  const bildir = (m, tur) => { if (window.DM_TOAST) { window.DM_TOAST(m, tur); } };
  window.prototipBildir = bildir;
  /* Dalga 2 mobil · panel: alttaki sabit kaydet çubuğu (`.form-eylem.cubuk-sabit`) odaklanan alanın üstüne biniyordu (klavye açıkken
     tarayıcı alanı görünür alanın dibine kaydırır). Belgenin alt kaydırma payı çubuğun boyu kadar; çubuk yoksa pay yok */
  const cubukPay = () => { const c = $('.form-eylem.cubuk-sabit'); document.documentElement.style.scrollPaddingBottom = c && c.offsetHeight ? (c.offsetHeight + 8) + 'px' : ''; };
  document.addEventListener('DOMContentLoaded', cubukPay); window.addEventListener('resize', cubukPay);
  const onay = (bas, metin, dugme, cb) => { if (window.DM_ONAY) { window.DM_ONAY(bas, metin, dugme, (e) => { if (e) { cb(); } }); } else if (window.confirm(metin)) { cb(); } };

  /* ── Durum deposu ─────────────────────────────────────────────────── */
  const ANAHTAR = 'dg-isletme-panel';
  let bellek = null;
  const tohumEl = $('#isletmeTohum');
  const TOHUM = tohumEl ? JSON.parse(tohumEl.textContent) : null;
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const gunEkle = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const kur = () => {
    const t = JSON.parse(JSON.stringify(TOHUM));
    /* Tarihler bugüne göre: rezervasyon ve etkinlik tohumu gün farkıyla gelir */
    t.rez.forEach((r) => { r.gun = gunEkle(r.gun); });
    t.etkinlik.forEach((e) => { e.tarih = gunEkle(e.gun); delete e.gun; });
    return t;
  };
  const oku = () => {
    if (bellek) { return bellek; }
    try { const v = JSON.parse(localStorage.getItem(ANAHTAR)); if (v && TOHUM && v.surum === TOHUM.surum) { bellek = v; return v; } } catch (e) { /* depo kapalı */ }
    bellek = TOHUM ? kur() : {};
    yaz();
    return bellek;
  };
  const yaz = () => { try { localStorage.setItem(ANAHTAR, JSON.stringify(bellek)); return true; } catch (e) { return false; } };
  const D = oku();
  const yeniId = (on) => on + '-' + Date.now().toString(36);

  /* ── Tarih ve biçim ───────────────────────────────────────────────── */
  const GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const GUN_K = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const tarihTR = (s) => String(s || '').split('-').reverse().join('.');
  const nokta = (s) => String(s || '').replace(':', '.');
  const bugunIso = iso(new Date());
  const gunFark = (s) => Math.round((new Date(s + 'T00:00') - new Date(bugunIso + 'T00:00')) / 864e5);
  const gunAdi = (s) => { const f = gunFark(s); return f === 0 ? 'Bugün' : f === 1 ? 'Yarın' : f === -1 ? 'Dün' : GUN_K[new Date(s + 'T00:00').getDay()] + ' ' + tarihTR(s).slice(0, 5); };
  const gecti = (r) => new Date(r.gun + 'T' + (r.saat || '23:59')) < new Date();
  const hap = (m, s) => '<span class="durum-hapi ' + s + '">' + m + '</span>';
  const yildiz = (n) => '<span class="yildiz-sira" aria-label="' + n + ' / 5">' + [1, 2, 3, 4, 5].map((i) => ik(i <= n ? 'fa-star' : 'fa-star yildiz-bos')).join('') + '</span>';

  /* ── Ortak kabuk davranışı ───────────────────────────────────────── */
  if (window.dgRol && window.dgRol() !== 'isletme') { $$('[data-rol-notu]').forEach((n) => { n.hidden = false; }); }
  const FLASH = 'dg-isletme-ileti';
  const sonraBildir = (m) => { try { sessionStorage.setItem(FLASH, m); } catch (e) { /* depo kapalı */ } };
  try { const ileti = sessionStorage.getItem(FLASH); if (ileti) { sessionStorage.removeItem(FLASH); setTimeout(() => bildir(ileti), 300); } } catch (e) { /* depo kapalı */ }
  /* Üst çubuk araması rezervasyon listesinde arar */
  const ustAra = $('#panelAra');
  if (ustAra) {
    const q = new URLSearchParams(location.search).get('ara'); if (q && yol === 'isletme/rezervasyonlar') { ustAra.value = q; }
    ustAra.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); location.href = kok + 'isletme/rezervasyonlar/?sekme=tumu&ara=' + encodeURIComponent(ustAra.value.trim()); } });
  }
  /* Yan panel (Diet kanonu `data-ac` / `data-kapat`): Esc, örtü tıklaması, odak, gövde kilidi */
  let acikPanel = null, donOdak = null;
  const panelAc = (sec) => {
    const o = $(sec); if (!o) { return; }
    acikPanel = o; donOdak = document.activeElement; o.hidden = false; document.body.style.overflow = 'hidden';
    const g = $('input:not([type=hidden]),select,textarea', o); if (g) { setTimeout(() => g.focus(), 30); }
  };
  const panelKapat = () => { if (!acikPanel) { return; } acikPanel.hidden = true; acikPanel = null; document.body.style.overflow = ''; if (donOdak && donOdak.focus) { donOdak.focus(); } };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-ac]'); if (a) { e.preventDefault(); panelAc(a.getAttribute('data-ac')); return; }
    if (e.target.closest('[data-kapat]') || (e.target.classList && e.target.classList.contains('yan-panel-ortu'))) { panelKapat(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && acikPanel) { panelKapat(); } });
  /* Segment ve çip: aria-pressed */
  document.addEventListener('click', (e) => {
    const s = e.target.closest('.segment button'); if (s) {
      $$('button', s.parentNode).forEach((b) => b.setAttribute('aria-pressed', String(b === s)));
      s.parentNode.dispatchEvent(new CustomEvent('ip:segment', { bubbles: true, detail: s.dataset.deger }));
      return;
    }
    const c = e.target.closest('[data-cip-grup] .cip'); if (c) { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); c.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  const segmentDeger = (id) => { const b = $('#' + id + ' [aria-pressed="true"]'); return b ? b.dataset.deger : ''; };
  const segmentYaz = (id, v) => $$('#' + id + ' button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === String(v))));
  const cipOku = (g) => $$('[data-cip-grup="' + g + '"] .cip[aria-pressed="true"]').map((c) => c.dataset.deger);
  const cipYaz = (g, l) => $$('[data-cip-grup="' + g + '"] .cip').forEach((c) => c.setAttribute('aria-pressed', String((l || []).indexOf(c.dataset.deger) > -1)));
  /* Karakter sayacı */
  const sayacTazele = () => $$('[data-sayac-icin]').forEach((s) => { const a = document.getElementById(s.dataset.sayacIcin); if (a) { s.textContent = a.value.length + ' / ' + a.maxLength; } });
  document.addEventListener('input', (e) => { if (e.target.matches && e.target.matches('textarea[maxlength]')) { sayacTazele(); } });
  /* Kayıt çubuğu notu */
  const notYaz = (m) => { const n = $('[data-kayit-not]'); if (n) { n.textContent = m; } };
  const saatNow = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); };
  const kirli = (kap) => { if (kap) { kap.addEventListener('input', () => notYaz('Kaydedilmemiş değişiklik var')); kap.addEventListener('click', (e) => { if (e.target.closest('.cip,.segment button')) { notYaz('Kaydedilmemiş değişiklik var'); } }); } };
  /* Form alanı oku/yaz (name ile) */
  const formOku = (f) => { const v = {}; $$('[name]', f).forEach((el) => { if (el.type === 'checkbox') { v[el.name] = el.checked; } else if (el.type !== 'file') { v[el.name] = el.value.trim(); } }); return v; };
  const formYaz = (f, v) => { $$('[name]', f).forEach((el) => { if (!(el.name in v)) { return; } if (el.type === 'checkbox') { el.checked = !!v[el.name]; } else { el.value = v[el.name] == null ? '' : v[el.name]; } }); sayacTazele(); };
  const gecerli = (f) => { const bos = $$('[required]', f).filter((el) => !el.value.trim()); if (bos.length) { bos[0].focus(); bildir('Kaydedilmedi: doldurulması gereken alanlar var.', 'hata'); return false; } return f.reportValidity ? f.reportValidity() : true; };

  /* ── Rezervasyonlar: panelin misafirleri + üyenin Mikla rezervasyonları ── */
  const REZ = { talep: ['Beklemede', 'bekleyen'], onaylandi: ['Onaylandı', 'cozulen'], reddedildi: ['Reddedildi', 'hata'], iptal: ['İptal edildi', 'kapali'], gerceklesti: ['Gerçekleşti', 'acik'], gelmedi: ['Gelinmedi', 'kapali'] };
  const OZEL = { standart: '', dogum_gunu: 'Doğum günü', yildonumu: 'Yıldönümü', is_yemegi: 'İş yemeği' };
  const uyeRez = () => (KD ? KD.oku('rezervasyon') : []).filter((k) => k.mekan === 'Mikla').map((k) => ({ id: k.id, misafir: k.ornek ? 'Prototip örneği misafir' : (document.querySelector('meta[name="dg-ornek-uye"]') || { content: 'Örnek Üye|' }).content.split('|')[0], kisi: k.kisi, cocuk: 0, gun: k.gun, saat: k.saat, ozel: 'standart', masa: '', alerjen: k.alerjen || '', not: k.not || '', durum: k.durum || 'talep', kod: 'MK-' + String(k.id).replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase(), uye: true }));
  const tumRez = () => D.rez.concat(uyeRez()).sort((a, b) => (a.gun + a.saat).localeCompare(b.gun + b.saat));
  const bekleyenRez = () => tumRez().filter((r) => r.durum === 'talep');
  const PUAN = { gerceklesti: 'kesinlestir', gelmedi: 'dusur', reddedildi: 'dusur', iptal: 'dusur' };
  const ILETI = { onaylandi: 'Talep onaylandı; misafirin Rezervasyonlarım ekranına düştü.', reddedildi: 'Talep reddedildi; misafire Onaylanmadı olarak görünür.', gerceklesti: 'Ziyaret işaretlendi; misafirin +25 Dada Puanı kesinleşti.', gelmedi: 'Gelinmedi olarak işaretlendi; bekleyen puan düştü.' };
  const rezKarar = (id, karar, ek) => {
    const r = tumRez().filter((x) => x.id === id)[0]; if (!r) { return; }
    if (r.uye && KD) { KD.guncelle('rezervasyon', id, Object.assign({ durum: karar }, ek || {})); if (PU && PUAN[karar]) { PU[PUAN[karar]](id); } }
    else { D.rez.forEach((x) => { if (x.id === id) { x.durum = karar; Object.assign(x, ek || {}); } }); yaz(); }
    bildir(ILETI[karar] || 'Kaydedildi.');
    sayaclariTazele(); document.dispatchEvent(new CustomEvent('ip:rez'));
  };
  const rezEylem = (r, kucuk) => {
    const d = (k, m, t) => '<button class="dugme ' + t + ' kucuk" type="button" data-rez="' + k + '" data-id="' + kac(r.id) + '">' + m + '</button>';
    if (r.durum === 'talep') { return d('ret', 'Reddet', 'hayalet tehlike') + d('onaylandi', 'Onayla', 'birincil'); }
    if (r.durum === 'onaylandi' && gecti(r)) { return d('gelmedi', 'Gelinmedi', 'hayalet') + d('gerceklesti', 'Gerçekleşti', 'birincil'); }
    return kucuk ? '' : '<span class="alan-yardim">' + (r.durum === 'onaylandi' ? 'Ziyaret saatinden sonra işaretlenir' : 'İşlem yok') + '</span>';
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rez]'); if (!b) { return; }
    const id = b.dataset.id, k = b.dataset.rez;
    if (k === 'ret') {
      const r = tumRez().filter((x) => x.id === id)[0], f = $('#retForm');
      if (f && r) { f.elements.id.value = id; $('#retKim').textContent = r.misafir + ' · ' + r.kisi + ' kişi · ' + tarihTR(r.gun) + ' ' + nokta(r.saat); panelAc('#retPanel'); return; }
      onay('Talebi reddet', 'Bu rezervasyon talebi reddedilecek; misafire Onaylanmadı olarak görünür.', 'Reddet', () => rezKarar(id, 'reddedildi'));
      return;
    }
    rezKarar(id, k);
  });

  /* Sol menü sayaçları ve zil */
  const yanitsiz = () => tumDeg().filter((d) => d.durum === 'yayinda' && !yanitBul(d.id));
  function sayaclariTazele() {
    const s = { rez: bekleyenRez().length, yanit: yanitsiz().length };
    $$('[data-menu-sayac]').forEach((e) => { const n = s[e.dataset.menuSayac] || 0; e.textContent = n; e.hidden = !n; });
    const z = $('[data-zil] .benek'); if (z) { z.hidden = !s.rez; }
  }
  /* Değerlendirmeler: örnek + üyenin Mikla değerlendirmesi; yanıt `isletme-yanit` */
  const yanitBul = (id) => { const y = (KD ? KD.oku('isletme-yanit') : []).filter((x) => x.id === id)[0]; if (y) { return y.metin; } const d = D.degerlendirme.filter((x) => x.id === id)[0]; return d && d.yanit; };
  const tumDeg = () => (KD ? KD.oku('degerlendirme') : []).filter((d) => d.mekan === 'Mikla').map((d) => ({ id: d.id, yazar: 'Örnek Üye', durum: d.durum || 'inceleniyor', lezzet: d.lezzet, servis: d.servis, ambiyans: d.ambiyans, tarih: d.tarih || 'Bu tarayıcıda', metin: d.metin || '', foto: !!d.foto, uye: true })).concat(D.degerlendirme || []);
  sayaclariTazele();

  /* ── Sayfalar ─────────────────────────────────────────────────────── */
  const SAYFA = {};

  /* 1 · Genel Bakış */
  SAYFA['isletme'] = function () {
    const ad = ((document.querySelector('meta[name="dg-ornek-uye"]') || { content: 'Örnek|' }).content.split('|')[0] || '').split(' ')[0];
    const ciz = () => {
      const tum = tumRez(), bugun = tum.filter((r) => r.gun === bugunIso && (r.durum === 'onaylandi' || r.durum === 'gerceklesti'));
      const bek = bekleyenRez(), yan = yanitsiz();
      const s = new Date().getHours(), selam = s < 12 ? 'Günaydın' : s < 18 ? 'İyi günler' : 'İyi akşamlar';
      $('#gunOzeti').textContent = selam + ' ' + ad + '. ' + GUN[new Date().getDay()] + ', ' + tarihTR(bugunIso) + '. Bugün ' + bugun.length + ' onaylı masa, ' + bek.length + ' bekleyen talep var.';
      const kpi = (id, sayi, alt) => { const k = $('[data-kpi="' + id + '"]'); if (k) { $('.sayi', k).textContent = sayi; if (alt) { $('.kpi-degisim span', k).textContent = alt; } } };
      kpi('bekleyen', bek.length, bek.length ? 'En yakını ' + gunAdi(bek[0].gun) + ' ' + nokta(bek[0].saat) : 'Onayını bekleyen talep yok');
      kpi('bugun', bugun.length, bugun.reduce((t, r) => t + r.kisi, 0) + ' kişi · ' + bugun.filter((r) => r.alerjen).length + ' alerjen notu');
      kpi('yanit', yan.length, yan.length ? 'Yayındaki değerlendirme' : 'Hepsi yanıtlandı');
      const isler = bek.map((r) => '<div class="ayar-satir"><span class="as-ikon">' + ik('fa-calendar-plus') + '</span><span class="as-metin"><b>' + kac(r.misafir) + ' · ' + r.kisi + ' kişi · ' + gunAdi(r.gun) + ' ' + nokta(r.saat) + '</b><span>Rezervasyon talebi' + (r.alerjen ? ' · Alerjen: ' + kac(r.alerjen) : '') + (r.not ? ' · ' + kac(r.not) : '') + '</span></span><span class="as-eylem">' + rezEylem(r, true) + '</span></div>')
        .concat(yan.map((d) => '<a class="ayar-satir" href="' + kok + 'isletme/degerlendirmeler/#' + kac(d.id) + '"><span class="as-ikon">' + ik('fa-reply') + '</span><span class="as-metin"><b>Değerlendirmeyi yanıtla · ' + kac(d.tarih) + '</b><span>' + kac(d.metin.slice(0, 90)) + (d.metin.length > 90 ? '…' : '') + '</span></span><span class="as-eylem">' + hap('Yanıt bekliyor', 'bekleyen') + '</span></a>'))
        .concat(Object.keys(D.rozet).filter((k) => D.rozet[k] === 'bekliyor').map((k) => '<a class="ayar-satir" href="' + kok + 'isletme/profil/?sekme=nitelik"><span class="as-ikon">' + ik('fa-shield-halved') + '</span><span class="as-metin"><b>Nitelik rozeti doğrulamada · ' + ({ otopark: 'Otopark / vale', glutensiz: 'Glütensiz seçenek', evcil: 'Evcil hayvan', cocuk: 'Çocuk alanı' }[k]) + '</b><span>Editör doğrulayınca mekân kartında görünür.</span></span><span class="as-eylem">' + hap('Doğrulama bekliyor', 'bekleyen') + '</span></a>'))
        .concat(D.etkinlik.filter((x) => x.durum === 'incelemede').map((x) => '<a class="ayar-satir" href="' + kok + 'isletme/etkinlikler/"><span class="as-ikon">' + ik('fa-calendar-days') + '</span><span class="as-metin"><b>Etkinlik incelemede · ' + kac(x.ad) + '</b><span>' + tarihTR(x.tarih) + ' · editör onayı bekleniyor</span></span><span class="as-eylem">' + hap('İncelemede', 'bekleyen') + '</span></a>'));
      $('#isListe').innerHTML = isler.join('');
      $('#isBos').hidden = isler.length > 0;
      $('#isOzet').innerHTML = (isler.length ? isler.length + ' iş bekliyor, en acil olan üstte. ' : 'Bekleyen iş yok. ') + ET;
      $('#bugunListe').innerHTML = bugun.map((r) => '<div class="ayar-satir"><span class="as-ikon saat-ikon"><b>' + nokta(r.saat) + '</b></span><span class="as-metin"><b>' + kac(r.misafir) + ' · ' + r.kisi + ' kişi' + (r.cocuk ? ' (' + r.cocuk + ' çocuk)' : '') + '</b><span>' + [r.masa, OZEL[r.ozel], r.not].filter(Boolean).map(kac).join(' · ') + '</span></span><span class="as-eylem">' + (r.alerjen ? '<span class="rozet durdu">' + ik('fa-triangle-exclamation') + ' ' + kac(r.alerjen) + '</span>' : '') + hap(REZ[r.durum][0], REZ[r.durum][1]) + '</span></div>').join('');
      $('#bugunBos').hidden = bugun.length > 0;
      sayaclariTazele();
    };
    const son = tumDeg().filter((d) => d.durum === 'yayinda').sort((a, b) => (yanitBul(a.id) ? 1 : 0) - (yanitBul(b.id) ? 1 : 0)).slice(0, 3);
    $('#sonDegListe').innerHTML = son.map((d) => '<a class="ayar-satir" href="' + kok + 'isletme/degerlendirmeler/#' + kac(d.id) + '"><span class="as-ikon">' + ik('fa-star') + '</span><span class="as-metin"><b>Lezzet ' + d.lezzet + ' · Servis ' + d.servis + ' · Ambiyans ' + d.ambiyans + '</b><span>' + kac(d.metin.slice(0, 100)) + (d.metin.length > 100 ? '…' : '') + '</span></span><span class="as-eylem">' + (yanitBul(d.id) ? hap('Yanıtlandı', 'cozulen') : hap('Yanıt bekliyor', 'bekleyen')) + '</span></a>').join('');
    const fotoN = D.foto.length;
    const dol = [['fa-utensils', 'Ne Yenir', D.neYenir.length + ' / 3 imza tabak', Math.round(D.neYenir.length / 3 * 100), 'isletme/menu/'], ['fa-basket-shopping', 'Ne Alınır', D.neAlinir.length + ' paketli ürün', Math.min(100, D.neAlinir.length * 50), 'isletme/menu/?sekme=na'], ['fa-images', 'Fotoğraf', fotoN + ' fotoğraf · en az 5 önerilir', Math.min(100, fotoN * 20), 'isletme/fotograflar/'], ['fa-book-open', 'Tam Menü', D.menu.length + ' kalem' + (D.alerjenVerildi ? ' · alerjenli' : ''), Math.min(100, D.menu.length * 10), 'isletme/menu/?sekme=mk']];
    $('#dolulukListe').innerHTML = dol.map(([i, b, a, o, h]) => '<a class="ayar-satir" href="' + kok + h + '"><span class="as-ikon">' + ik(i) + '</span><span class="as-metin"><b>' + b + '</b><span>' + a + '</span><div class="olcer hap" role="img" aria-label="Yüzde ' + o + '"><span data-oran="' + o + '" style="--oran:' + o + '"></span></div></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></a>').join('');
    const dr = $('#durumRez'); if (dr) { dr.textContent = D.rezAyar.etkin ? 'Açık' : 'Kapalı'; }
    document.addEventListener('ip:rez', ciz);
    ciz();
  };

  /* 2 · Mekân Profili */
  SAYFA['isletme/profil'] = function () {
    const f = $('#profilForm');
    const ROZ = { otopark: ['fa-square-parking', 'Otopark / vale'], glutensiz: ['fa-wheat-awn-circle-exclamation', 'Glütensiz seçenek'], evcil: ['fa-paw', 'Evcil hayvan kabul edilir'], cocuk: ['fa-children', 'Çocuk alanı'] };
    const RD = { dogrulandi: ['Doğrulandı', 'cozulen'], bekliyor: ['Doğrulama bekliyor', 'bekleyen'], kapali: ['Beyan edilmedi', 'kapali'] };
    let rozet = Object.assign({}, D.rozet);
    const rozetCiz = () => {
      $$('[data-rozet]').forEach((s) => { const k = s.dataset.rozet, h = $('[data-rozet-durum]', s); h.textContent = RD[rozet[k]][0]; h.className = 'durum-hapi ' + RD[rozet[k]][1]; $('[data-rozet-anahtar]', s).checked = rozet[k] !== 'kapali'; });
      $('#onRozet').innerHTML = Object.keys(rozet).filter((k) => rozet[k] !== 'kapali').map((k) => '<span class="rozet pasif" title="' + ROZ[k][1] + '">' + ik(ROZ[k][0]) + ' ' + ROZ[k][1] + (rozet[k] === 'bekliyor' ? ' · doğrulamada' : '') + '</span>').join(' ');
    };
    const KAT = {}; $$('#pKategori option').forEach((o) => { KAT[o.value] = o.textContent; });
    const onizle = () => {
      $('#onAd').textContent = f.elements.ad.value || 'Mekân adı'; $('#onKisa').textContent = f.elements.kisa.value; $('#onKategori').textContent = KAT[f.elements.kategori.value];
      $('#onFiyat').textContent = '₺'.repeat(+segmentDeger('pFiyat') || 1); $('#onYer').firstChild.nodeValue = f.elements.ilce.value + ', ' + f.elements.il.value + ' · ';
      const kapak = D.foto.filter((x) => x.rol === 'cover')[0]; if (kapak) { $('#onKapak').src = kapak.veri || kok + kapak.kucuk; }
    };
    const GRUP = ['mutfak', 'konsept', 'vesile', 'hizmet', 'beslenme', 'ulasim'];
    const doldur = () => {
      formYaz(f, D.mekan); segmentYaz('pFiyat', D.mekan.fiyat); GRUP.forEach((g) => cipYaz(g, D.mekan[g]));
      rozet = Object.assign({}, D.rozet); rozetCiz(); onizle();
      const bek = (KD ? KD.oku('isletme-talep') : []).filter((t) => t.kaynak === 'profil' && (t.durum === 'gonderildi' || t.durum === 'incelemede'))[0];
      $('#profilBekleyen').innerHTML = bek ? '<a href="' + kok + 'isletme/degisiklik-talepleri/gonderilen/?t=' + encodeURIComponent(bek.id) + '">Talep #' + bek.no + '</a>' : 'Yok';
    };
    f.addEventListener('input', onizle); f.addEventListener('ip:segment', onizle);
    f.addEventListener('change', (e) => { const a = e.target.closest('[data-rozet-anahtar]'); if (!a) { return; } const k = a.dataset.rozetAnahtar; rozet[k] = a.checked ? (D.rozet[k] === 'dogrulandi' ? 'dogrulandi' : 'bekliyor') : 'kapali'; rozetCiz(); });
    kirli(f);
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-profil]'); if (!b) { return; }
      if (b.dataset.profil === 'vazgec') { doldur(); notYaz('Kaydedilmiş bilgiler'); bildir('Değişiklikler geri alındı.'); return; }
      if (!gecerli(f)) { return; }
      const v = formOku(f); v.fiyat = +segmentDeger('pFiyat'); GRUP.forEach((g) => { v[g] = cipOku(g); });
      /* Ad, adres ve telefon editör onayıyla değişir (canlı DegisiklikTalebi): fark varsa talep açılır, alan yayındaki değerde kalır */
      const TAL = { ad: 'ad', acikAdres: 'adres', telefon: 'telefon', il: 'adres', ilce: 'adres', mahalle: 'adres', postaKodu: 'adres', enlem: 'adres', boylam: 'adres' };
      const fark = Object.keys(TAL).filter((k) => (v[k] || '') !== (D.mekan[k] || ''));
      let talepNo = 0;
      if (fark.length && KD) {
        const bekleyen = KD.oku('isletme-talep').some((t) => t.mekan === 'Mikla' && (t.durum === 'gonderildi' || t.durum === 'incelemede'));
        if (bekleyen) { bildir('Mikla için incelemede bir değişiklik talebin var; ad, adres ve telefon şimdilik değişmedi.', 'hata'); }
        else {
          const deg = {}; if (fark.indexOf('ad') > -1) { deg.ad = v.ad; } if (fark.some((k) => TAL[k] === 'adres')) { deg.adres = [v.mahalle, v.acikAdres, v.postaKodu, v.ilce, v.il].filter(Boolean).join(', '); } if (fark.indexOf('telefon') > -1) { deg.telefon = v.telefon; }
          talepNo = 348 + KD.oku('isletme-talep').length;
          const d = new Date();
          KD.ekle('isletme-talep', { id: 'talep-' + Date.now(), no: talepNo, mekan: 'Mikla', kaynak: 'profil', degisiklikler: deg, durum: 'gonderildi', gonderildi: tarihTR(bugunIso), saat: saatNow().replace('.', ':') });
        }
        fark.forEach((k) => { v[k] = D.mekan[k]; });
      }
      D.mekan = Object.assign({}, D.mekan, v); D.rozet = Object.assign({}, rozet); yaz();
      doldur(); notYaz('Kaydedildi · ' + saatNow());
      bildir(talepNo ? 'Kaydedildi. Ad, adres ve telefon değişikliği talep #' + talepNo + ' olarak editöre gönderildi.' : 'Mekân profili kaydedildi.');
    });
    doldur();
    const q = new URLSearchParams(location.search).get('sekme'); const t = q && $('#t-' + q); if (t) { t.click(); }
  };

  /* 3 · Menü */
  SAYFA['isletme/menu'] = function () {
    const NYT = {}; $$('#nyTur option').forEach((o) => { NYT[o.value] = o.textContent; });
    const eylem = (tur, x) => '<span class="satir-eylem"><button class="ikon-dugme" type="button" data-menu-duzenle="' + tur + '" data-id="' + kac(x.id) + '" aria-label="' + kac(x.ad) + ' düzenle">' + ik('fa-pen') + '</button><button class="ikon-dugme yikici" type="button" data-menu-sil="' + tur + '" data-id="' + kac(x.id) + '" aria-label="' + kac(x.ad) + ' sil">' + ik('fa-trash') + '</button></span>';
    const AD = { ny: 'neYenir', na: 'neAlinir', mk: 'menu' };
    const ciz = () => {
      $('#nyTablo').innerHTML = D.neYenir.map((x) => '<tr><td><b>' + kac(x.ad) + '</b><small>' + kac(x.aciklama) + '</small></td><td data-etiket="Tür"><span class="rozet pasif">' + (NYT[x.tur] || '') + '</span></td><td class="num" data-etiket="Fiyat">' + (x.fiyat ? '₺' + kac(x.fiyat) : '–') + '</td><td class="num" data-etiket="Favori">' + (x.favori || 0) + '</td><td class="eylem">' + eylem('ny', x) + '</td></tr>').join('');
      $('#nyBos').hidden = D.neYenir.length > 0; $('#nyKota').textContent = D.neYenir.length + ' / 3';
      $('#naTablo').innerHTML = D.neAlinir.map((x) => '<tr><td><b>' + kac(x.ad) + '</b><small>' + kac(x.uretici) + (x.paket ? ' · ' + kac(x.paket) : '') + '</small></td><td data-etiket="Kaynak">' + kac(x.kaynak) + '</td><td data-etiket="Doğrulama">' + (x.dogrulama ? hap('Doğrulandı · ' + kac(x.dogrulama), 'cozulen') : hap('Doğrulama bekliyor', 'bekleyen')) + '</td><td class="num" data-etiket="Rotaya ekleme">' + (x.rota || 0) + '</td><td class="eylem">' + eylem('na', x) + '</td></tr>').join('');
      $('#naBos').hidden = D.neAlinir.length > 0;
      const q = ($('#mkAra').value || '').toLocaleLowerCase('tr');
      const l = D.menu.filter((x) => !q || (x.ad + ' ' + x.kat + ' ' + (x.alerjen || []).join(' ')).toLocaleLowerCase('tr').indexOf(q) > -1);
      $('#mkTablo').innerHTML = l.map((x) => '<tr><td><b>' + kac(x.ad) + '</b><small>' + kac(x.aciklama) + '</small></td><td data-etiket="Kategori">' + kac(x.kat) + '</td><td data-etiket="Alerjen">' + ((x.alerjen || []).map((a) => '<span class="rozet pasif">' + kac(a) + '</span>').join(' ') || '–') + '</td><td class="num" data-etiket="Fiyat">₺' + kac(x.fiyat) + '</td><td class="eylem">' + eylem('mk', x) + '</td></tr>').join('');
      $('#mkBos').hidden = l.length > 0; $('#mkSayac').textContent = l.length;
      ['ny', 'na', 'mk'].forEach((k) => { $('[data-sayi="' + k + '"]').textContent = D[AD[k]].length; });
    };
    const aktifSekme = () => { const s = $('#menuSekme [aria-selected="true"]'); return s ? s.dataset.sekme : 'ny'; };
    const ac = (tur, x) => {
      const f = $('#' + tur + 'Form'); f.reset(); f.elements.id.value = '';
      if (tur === 'mk') { cipYaz('alerjen', []); }
      if (x) { formYaz(f, x); if (tur === 'mk') { cipYaz('alerjen', x.alerjen); } }
      $('#' + tur + 'PanelBas').textContent = (x ? 'Düzenle: ' : 'Yeni ') + ({ ny: 'imza tabak', na: 'paketli ürün', mk: 'menü kalemi' }[tur]);
      sayacTazele(); panelAc('#' + tur + 'Panel');
    };
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-menu-ekle]') || (e.target.closest('[data-ac="#nyPanel"],[data-ac="#naPanel"]'))) {
        e.preventDefault(); e.stopPropagation();
        const tur = e.target.closest('[data-ac]') ? e.target.closest('[data-ac]').getAttribute('data-ac').slice(1, 3) : aktifSekme();
        if (tur === 'ny' && D.neYenir.length >= 3) { bildir('En fazla üç imza tabak eklenir; yenisi için birini sil.', 'hata'); return; }
        ac(tur); return;
      }
      const d = e.target.closest('[data-menu-duzenle]'); if (d) { const t = d.dataset.menuDuzenle; ac(t, D[AD[t]].filter((x) => x.id === d.dataset.id)[0]); return; }
      const s = e.target.closest('[data-menu-sil]'); if (s) {
        const t = s.dataset.menuSil, x = D[AD[t]].filter((y) => y.id === s.dataset.id)[0];
        onay('Silinsin mi?', '“' + x.ad + '” mekân sayfasından kalkacak.', 'Sil', () => { D[AD[t]] = D[AD[t]].filter((y) => y.id !== x.id); yaz(); ciz(); bildir('“' + x.ad + '” silindi.'); });
      }
    }, true);
    document.addEventListener('submit', (e) => {
      const f = e.target; const tur = { nyForm: 'ny', naForm: 'na', mkForm: 'mk' }[f.getAttribute('id')]; if (!tur) { return; }
      e.preventDefault(); if (!gecerli(f)) { return; }
      const v = formOku(f); if (tur === 'mk') { v.alerjen = cipOku('alerjen'); }
      const l = D[AD[tur]];
      if (v.id) { l.forEach((x) => { if (x.id === v.id) { Object.assign(x, v); } }); }
      else {
        if (tur === 'ny' && l.length >= 3) { bildir('En fazla üç imza tabak eklenir.', 'hata'); return; }
        v.id = yeniId(tur); if (tur === 'ny') { v.favori = 0; } if (tur === 'na') { v.rota = 0; v.dogrulama = ''; } l.push(v);
      }
      yaz(); ciz(); panelKapat();
      bildir(({ ny: 'İmza tabak', na: 'Ürün', mk: 'Menü kalemi' }[tur]) + (f.elements.id.value ? ' güncellendi.' : ' eklendi; mekân sayfasında yayında.'));
    });
    $('#mkAra').addEventListener('input', ciz);
    const al = $('#alerjenVerildi'); al.checked = D.alerjenVerildi !== false;
    al.addEventListener('change', () => { D.alerjenVerildi = al.checked; yaz(); bildir(al.checked ? 'Alerjen bilgisi mekân sayfasında gösterilecek.' : 'Alerjen bilgisi gizlendi; mekân sayfasında "alerjen bilgisi paylaşılmadı" uyarısı görünür.'); });
    ciz();
    const q = new URLSearchParams(location.search).get('sekme'); const t = q && $('#t-' + q); if (t) { t.click(); }
  };

  /* 4 · Fotoğraflar */
  SAYFA['isletme/fotograflar'] = function () {
    const iz = $('#fotoIzgara');
    const ciz = () => {
      iz.innerHTML = D.foto.map((x, i) => '<div class="medya-kart foto-kart" data-foto="' + kac(x.id) + '"><div class="medya-kart-gorsel"><img src="' + kac(x.veri || kok + x.kucuk) + '" alt="' + kac(x.ad) + '" loading="lazy">' + (x.rol === 'cover' ? '<span class="medya-kart-kategori">' + ik('fa-star') + ' Kapak</span>' : '') + '<span class="medya-kart-etiket">' + (i + 1) + '. sıra</span></div><div class="medya-kart-govde"><label class="yalniz-okuyucu" for="fa-' + kac(x.id) + '">Fotoğraf açıklaması</label><input class="alan-girdi" id="fa-' + kac(x.id) + '" value="' + kac(x.ad) + '" maxlength="80" data-foto-ad placeholder="Kısa açıklama"><div class="eylem-satiri foto-eylem">' + (x.rol === 'cover' ? '<span class="durum-hapi cozulen">Kapak fotoğrafı</span>' : '<button class="dugme hayalet kucuk" type="button" data-foto-eylem="kapak">' + ik('fa-star') + ' Kapak yap</button>') + '<span class="satir-eylem"><button class="ikon-dugme" type="button" data-foto-eylem="sol" aria-label="Öne al"' + (i ? '' : ' disabled') + '>' + ik('fa-arrow-left') + '</button><button class="ikon-dugme" type="button" data-foto-eylem="sag" aria-label="Geriye al"' + (i < D.foto.length - 1 ? '' : ' disabled') + '>' + ik('fa-arrow-right') + '</button><button class="ikon-dugme yikici" type="button" data-foto-eylem="sil" aria-label="Fotoğrafı sil">' + ik('fa-trash') + '</button></span></div></div></div>').join('');
      $('#fotoBos').hidden = D.foto.length > 0; $('#fotoSayac').textContent = D.foto.length;
    };
    iz.addEventListener('click', (e) => {
      const b = e.target.closest('[data-foto-eylem]'); if (!b) { return; }
      const id = b.closest('[data-foto]').dataset.foto, i = D.foto.findIndex((x) => x.id === id), x = D.foto[i];
      const k = b.dataset.fotoEylem;
      if (k === 'kapak') { D.foto.forEach((y) => { y.rol = y.id === id ? 'cover' : 'galeri'; }); yaz(); ciz(); bildir('Kapak fotoğrafı değişti; mekân kartında ve sayfa başında bu görünür.'); return; }
      if (k === 'sol' || k === 'sag') { const j = k === 'sol' ? i - 1 : i + 1; D.foto.splice(j, 0, D.foto.splice(i, 1)[0]); yaz(); ciz(); bildir('Sıra güncellendi.'); return; }
      if (k === 'sil') { onay('Fotoğraf silinsin mi?', '“' + (x.ad || 'Fotoğraf') + '” galeriden kalkacak.', 'Sil', () => { D.foto.splice(i, 1); if (x.rol === 'cover' && D.foto[0]) { D.foto[0].rol = 'cover'; } yaz(); ciz(); bildir('Fotoğraf silindi.' + (x.rol === 'cover' && D.foto[0] ? ' Yeni kapak: ilk sıradaki fotoğraf.' : '')); }); }
    });
    iz.addEventListener('change', (e) => { const a = e.target.closest('[data-foto-ad]'); if (!a) { return; } const id = a.closest('[data-foto]').dataset.foto; D.foto.forEach((x) => { if (x.id === id) { x.ad = a.value.trim(); } }); yaz(); bildir('Açıklama kaydedildi.'); });
    /* Yükleme: tarayıcıda küçültülür (en çok 1200 px), bu tarayıcıya yazılır; hiçbir yere gönderilmez */
    const kucult = (dosya) => new Promise((ok, red) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const o = Math.min(1, 1200 / im.width); const c = document.createElement('canvas'); c.width = Math.round(im.width * o); c.height = Math.round(im.height * o); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.8)); }; im.onerror = red; im.src = r.result; }; r.onerror = red; r.readAsDataURL(dosya); });
    $('#fotoDosya').addEventListener('change', async (e) => {
      const l = [].slice.call(e.target.files || []); let n = 0;
      for (const f of l) {
        if (D.foto.length >= 20) { bildir('Galeri en çok 20 fotoğraf alır.', 'hata'); break; }
        if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 8 * 1024 * 1024) { bildir(f.name + ': JPG, PNG ya da WebP olmalı ve 8 MB\'ı aşmamalı.', 'hata'); continue; }
        try { const veri = await kucult(f); D.foto.push({ id: yeniId('f'), veri: veri, ad: f.name.replace(/\.[^.]+$/, ''), rol: D.foto.length ? 'galeri' : 'cover' }); n++; } catch (x) { bildir(f.name + ' okunamadı.', 'hata'); }
      }
      if (n && !yaz()) { D.foto.splice(D.foto.length - n, n); bildir('Tarayıcı deposu doldu; fotoğraf eklenemedi.', 'hata'); n = 0; }
      e.target.value = ''; ciz(); if (n) { bildir(n + ' fotoğraf eklendi.'); }
    });
    ciz();
  };

  /* 5 · Çalışma Saatleri */
  SAYFA['isletme/calisma-saatleri'] = function () {
    const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    let saat = JSON.parse(JSON.stringify(D.saat));
    const ozet = (g) => g.araliklar.length ? g.araliklar.map((a) => nokta(a[0]) + ' – ' + nokta(a[1])).join(', ') : 'Kapalı';
    const ciz = () => {
      $('#saatListe').innerHTML = saat.map((g, i) => '<div class="ayar-satir saat-satir" data-gun="' + i + '"><span class="as-metin"><b>' + GUNLER[i] + '</b><span>' + ozet(g) + '</span></span><span class="as-eylem saat-eylem"><span class="saat-araliklar">' + g.araliklar.map((a, j) => '<span class="saat-aralik" data-j="' + j + '"><input class="alan-girdi" type="time" value="' + a[0] + '" aria-label="' + GUNLER[i] + ' açılış" data-saat-alan="0"><span aria-hidden="true">–</span><input class="alan-girdi" type="time" value="' + a[1] + '" aria-label="' + GUNLER[i] + ' kapanış" data-saat-alan="1">' + (g.araliklar.length > 1 ? '<button class="ikon-dugme" type="button" data-saat-eylem="cikar" aria-label="Aralığı kaldır">' + ik('fa-xmark') + '</button>' : '') + '</span>').join('') + '</span>' + (g.araliklar.length && g.araliklar.length < 2 ? '<button class="dugme hayalet kucuk" type="button" data-saat-eylem="ekle">' + ik('fa-plus') + ' Aralık</button>' : '') + '<label class="anahtar-etiketli">' + '<span class="anahtar"><input type="checkbox" data-saat-eylem="acik"' + (g.araliklar.length ? ' checked' : '') + ' aria-label="' + GUNLER[i] + ' açık"><span class="anahtar-ray"></span></span><span>' + (g.araliklar.length ? 'Açık' : 'Kapalı') + '</span></label></span></div>').join('');
      onizle();
    };
    const onizle = (kayitli) => {
      const s = kayitli || D.saat;
      $('#saatOnizleme').innerHTML = s.map((g, i) => '<div class="deger-satir"><span>' + GUNLER[i] + '</span><b>' + ozet(g) + '</b></div>').join('') + D.ozelGun.slice().sort((a, b) => a.tarih.localeCompare(b.tarih)).map((o) => '<div class="deger-satir"><span>' + tarihTR(o.tarih) + '</span><b>' + (o.tur === 'kapali' ? 'Kapalı' : o.araliklar.map((a) => nokta(a[0]) + ' – ' + nokta(a[1])).join(', ')) + '</b></div>').join('');
    };
    const liste = $('#saatListe');
    liste.addEventListener('change', (e) => {
      const r = e.target.closest('[data-gun]'); if (!r) { return; } const g = saat[+r.dataset.gun];
      if (e.target.matches('[data-saat-eylem="acik"]')) { g.araliklar = e.target.checked ? [['18:00', '00:00']] : []; ciz(); }
      else if (e.target.matches('[data-saat-alan]')) { g.araliklar[+e.target.closest('[data-j]').dataset.j][+e.target.dataset.saatAlan] = e.target.value; $('.as-metin span', r).textContent = ozet(g); }
      notYaz('Kaydedilmemiş değişiklik var');
    });
    liste.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-saat-eylem]'); if (!b) { return; } const g = saat[+b.closest('[data-gun]').dataset.gun];
      if (b.dataset.saatEylem === 'ekle') { g.araliklar.unshift(['12:00', '15:00']); }
      if (b.dataset.saatEylem === 'cikar') { g.araliklar.splice(+b.closest('[data-j]').dataset.j, 1); }
      ciz(); notYaz('Kaydedilmemiş değişiklik var');
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-saat]'); if (!b) { return; }
      const k = b.dataset.saat;
      if (k === 'kopyala') { const p = JSON.stringify(saat[0].araliklar); saat.forEach((g, i) => { if (i && g.araliklar.length) { g.araliklar = JSON.parse(p); } }); ciz(); notYaz('Kaydedilmemiş değişiklik var'); bildir('Pazartesi saatleri açık günlere kopyalandı.'); }
      if (k === 'vazgec') { saat = JSON.parse(JSON.stringify(D.saat)); ciz(); notYaz('Kaydedilmiş saatler'); bildir('Değişiklikler geri alındı.'); }
      if (k === 'kaydet') {
        const hata = saat.some((g) => g.araliklar.some((a) => !a[0] || !a[1] || a[0] === a[1]));
        if (hata) { bildir('Kaydedilmedi: açılış ve kapanış saati aynı ya da boş olamaz.', 'hata'); return; }
        D.saat = JSON.parse(JSON.stringify(saat)); yaz(); onizle(); notYaz('Kaydedildi · ' + saatNow()); bildir('Çalışma saatleri kaydedildi; mekân sayfasına yansıdı.');
      }
    });
    /* Özel günler */
    const ogCiz = () => {
      const l = D.ozelGun.slice().sort((a, b) => a.tarih.localeCompare(b.tarih));
      $('#ogTablo').innerHTML = l.map((o) => '<tr><td><b>' + tarihTR(o.tarih) + '</b><small>' + GUN[new Date(o.tarih + 'T00:00').getDay()] + '</small></td><td data-etiket="Durum">' + (o.tur === 'kapali' ? hap('Kapalı', 'kapali') : hap('Özel saatler', 'acik')) + '</td><td data-etiket="Saat">' + (o.tur === 'kapali' ? '–' : o.araliklar.map((a) => nokta(a[0]) + ' – ' + nokta(a[1])).join(', ')) + '</td><td data-etiket="Açıklama">' + (kac(o.aciklama) || '–') + '</td><td class="eylem"><span class="satir-eylem"><button class="ikon-dugme yikici" type="button" data-og-sil="' + kac(o.id) + '" aria-label="' + tarihTR(o.tarih) + ' özel gününü sil">' + ik('fa-trash') + '</button></span></td></tr>').join('');
      $('#ogBos').hidden = l.length > 0; onizle();
    };
    const of = $('#ogForm'), saatAlan = $('[data-og-saat]');
    of.elements.tur.addEventListener('change', () => { saatAlan.hidden = of.elements.tur.value !== 'ozel_saatler'; });
    of.addEventListener('submit', (e) => {
      e.preventDefault(); if (!gecerli(of)) { return; }
      const v = formOku(of);
      if (D.ozelGun.some((o) => o.tarih === v.tarih)) { bildir(tarihTR(v.tarih) + ' için özel gün zaten var.', 'hata'); return; }
      D.ozelGun.push({ id: yeniId('og'), tarih: v.tarih, tur: v.tur, aciklama: v.aciklama, araliklar: v.tur === 'kapali' ? [] : [[v.bas, v.bit]] }); yaz(); ogCiz(); panelKapat(); of.reset(); saatAlan.hidden = true;
      bildir('Özel gün eklendi: ' + tarihTR(v.tarih) + '.');
    });
    $('#ogTablo').addEventListener('click', (e) => { const b = e.target.closest('[data-og-sil]'); if (!b) { return; } const o = D.ozelGun.filter((x) => x.id === b.dataset.ogSil)[0]; onay('Özel gün silinsin mi?', tarihTR(o.tarih) + ' için haftalık saatler geçerli olacak.', 'Sil', () => { D.ozelGun = D.ozelGun.filter((x) => x.id !== o.id); yaz(); ogCiz(); bildir('Özel gün silindi.'); }); });
    ciz(); ogCiz();
  };

  /* 6 · Rezervasyonlar */
  SAYFA['isletme/rezervasyonlar'] = function () {
    const adres = new URLSearchParams(location.search);
    const S = { sekme: adres.get('sekme') || 'bekleyen', ara: adres.get('ara') || '', gun: '', slot: '', slotGun: bugunIso };
    const ara = $('#rezAra'); ara.value = S.ara;
    const SEK = { bekleyen: (r) => r.durum === 'talep', yaklasan: (r) => r.durum === 'onaylandi' && !gecti(r), gecmis: (r) => gecti(r) || ['reddedildi', 'iptal', 'gerceklesti', 'gelmedi'].indexOf(r.durum) > -1, tumu: () => true };
    const sekmeSec = (k) => { S.sekme = k; $$('#rezSekme .sekme').forEach((s) => { const a = s.dataset.sekme === k; s.classList.toggle('aktif', a); s.setAttribute('aria-selected', String(a)); s.tabIndex = a ? 0 : -1; }); $('#rezListe').setAttribute('aria-labelledby', 'rs-' + k); };
    const pencere = (iso) => { const g = new Date(iso + 'T00:00').getDay(), gun = g === 0 ? 7 : g; return D.rezPencere.filter((p) => p.gun === gun && p.etkin)[0]; };
    const kapaliGun = (iso) => { const o = D.ozelGun.filter((x) => x.tarih === iso)[0]; return (o && o.tur === 'kapali') || !pencere(iso); };
    const slotlar = (iso) => { const p = pencere(iso); if (!p || kapaliGun(iso)) { return []; } const l = [], dk = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; }; for (let t = dk(p.bas); t <= dk(p.bit); t += +D.rezAyar.slot || 30) { l.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0')); } return l; };
    const ciz = () => {
      const tum = tumRez();
      /* KPI */
      const bek = tum.filter(SEK.bekleyen), bug = tum.filter((r) => r.gun === bugunIso && r.durum === 'onaylandi'), hafta = tum.filter((r) => r.durum === 'onaylandi' && gunFark(r.gun) >= 0 && gunFark(r.gun) < 7), alj = tum.filter((r) => r.alerjen && !gecti(r) && (r.durum === 'onaylandi' || r.durum === 'talep'));
      const kpi = (i, e, s, a, t) => '<div class="kart kpi"><span class="ikon">' + ik(i) + '</span><div class="govde"><span class="etiket">' + e + '</span><span class="sayi">' + s + '</span><span class="kpi-degisim ' + (t || '') + '">' + ik('fa-minus') + ' ' + a + '</span></div></div>';
      $('#rezKpi').innerHTML = kpi('fa-hourglass-half', 'Bekleyen talep', bek.length, bek.length ? 'Yanıt bekleyen misafir' : 'Hepsi yanıtlandı', bek.length ? 'kotu' : 'iyi') + kpi('fa-calendar-day', 'Bugün', bug.length + ' masa', bug.reduce((t, r) => t + r.kisi, 0) + ' kişi onaylı') + kpi('fa-calendar-week', 'Önümüzdeki 7 gün', hafta.reduce((t, r) => t + r.kisi, 0) + ' kişi', hafta.length + ' onaylı rezervasyon') + kpi('fa-triangle-exclamation', 'Alerjen notu', alj.length, 'Yaklaşan rezervasyonlarda');
      /* Gün ve slot */
      $('#gunSec').innerHTML = [0, 1, 2, 3, 4, 5, 6].map((n) => { const d = gunEkle(n), say = tum.filter((r) => r.gun === d && (r.durum === 'onaylandi' || r.durum === 'talep')).length; return '<button class="cip" type="button" data-gun="' + d + '" aria-pressed="' + (S.slotGun === d) + '">' + gunAdi(d) + (kapaliGun(d) ? ' · kapalı' : say ? ' · ' + say : '') + '</button>'; }).join('');
      const sl = slotlar(S.slotGun), kap = (D.rezPencere.filter((p) => p === pencere(S.slotGun))[0] || {}).kapasite || D.rezAyar.kapasite;
      $('#slotIzgara').innerHTML = sl.length ? sl.map((s) => { const l = tum.filter((r) => r.gun === S.slotGun && r.saat === s && (r.durum === 'onaylandi' || r.durum === 'talep')), k = l.reduce((t, r) => t + r.kisi, 0), b = l.filter((r) => r.durum === 'talep').length, o = Math.min(100, Math.round(k / kap * 100)); return '<button class="slot-kutu" type="button" data-slot="' + s + '" aria-pressed="' + (S.slot === s && S.gun === S.slotGun) + '"><b>' + nokta(s) + '</b><span>' + k + ' / ' + kap + ' kişi' + (b ? ' · ' + b + ' bekleyen' : '') + '</span><span class="olcer hap" role="img" aria-label="Doluluk yüzde ' + o + '"><span data-oran="' + o + '" style="--oran:' + o + '"></span></span></button>'; }).join('') : '<p class="alan-yardim">' + ik('fa-circle-info') + '<span>' + gunAdi(S.slotGun) + ' rezervasyon kapalı (çalışma saatleri ya da özel gün).</span></p>';
      /* Liste */
      const q = S.ara.toLocaleLowerCase('tr');
      const l = tum.filter(SEK[S.sekme]).filter((r) => (!S.gun || r.gun === S.gun) && (!S.slot || r.saat === S.slot) && (!q || [r.misafir, r.kod, r.alerjen, r.not, r.masa, tarihTR(r.gun)].join(' ').toLocaleLowerCase('tr').indexOf(q) > -1));
      if (S.sekme === 'gecmis') { l.reverse(); }
      $('#rezTablo').innerHTML = l.map((r) => '<tr data-id="' + kac(r.id) + '"><td><b>' + kac(r.misafir) + '</b><small>' + kac(r.kod) + (OZEL[r.ozel] ? ' · ' + OZEL[r.ozel] : '') + (r.uye ? ' · bu tarayıcıdan' : '') + '</small></td><td data-etiket="Tarih ve saat"><b>' + gunAdi(r.gun) + ' · ' + nokta(r.saat) + '</b><small>' + tarihTR(r.gun) + ' ' + GUN[new Date(r.gun + 'T00:00').getDay()] + '</small></td><td class="num" data-etiket="Kişi"><b>' + r.kisi + '</b>' + (r.cocuk ? '<small>' + r.cocuk + ' çocuk</small>' : '') + '</td><td data-etiket="Not ve alerjen">' + (r.alerjen ? '<span class="rozet durdu">' + ik('fa-triangle-exclamation') + ' ' + kac(r.alerjen) + '</span>' : '') + '<small>' + ([r.masa ? 'Masa: ' + r.masa : '', r.not].filter(Boolean).map(kac).join(' · ') || (r.alerjen ? '' : '–')) + '</small></td><td data-etiket="Durum">' + hap(REZ[r.durum][0], REZ[r.durum][1]) + (r.retNedeni ? '<small>' + kac(r.retNedeni) + '</small>' : '') + '</td><td class="eylem"><span class="satir-eylem rez-eylem">' + rezEylem(r) + '</span></td></tr>').join('');
      $('#rezBos').hidden = l.length > 0; $('#rezSayac').textContent = l.length;
      $$('[data-rez-temizle]').forEach((b) => { if (b.classList.contains('suzgec-temizle')) { b.hidden = !(S.ara || S.gun || S.slot); } });
      Object.keys(SEK).forEach((k) => { $('[data-sayi="' + k + '"]', $('#rezSekme')).textContent = tum.filter(SEK[k]).length; });
    };
    $('#rezSekme').addEventListener('click', (e) => { const s = e.target.closest('.sekme'); if (s) { sekmeSec(s.dataset.sekme); ciz(); } });
    ara.addEventListener('input', () => { S.ara = ara.value.trim(); ciz(); });
    $('#gunSec').addEventListener('click', (e) => { const b = e.target.closest('[data-gun]'); if (!b) { return; } S.slotGun = b.dataset.gun; S.gun = b.dataset.gun; S.slot = ''; sekmeSec('tumu'); ciz(); });
    $('#slotIzgara').addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (!b) { return; } const ayni = S.slot === b.dataset.slot && S.gun === S.slotGun; S.gun = S.slotGun; S.slot = ayni ? '' : b.dataset.slot; sekmeSec('tumu'); ciz(); $('#rezListe').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    document.addEventListener('click', (e) => { if (e.target.closest('[data-rez-temizle]')) { S.ara = ''; S.gun = ''; S.slot = ''; ara.value = ''; ciz(); } });
    $('#retForm').addEventListener('submit', (e) => { e.preventDefault(); const f = e.target, sec = f.elements.neden; const neden = sec.options[sec.selectedIndex].textContent + (f.elements.not.value.trim() ? ': ' + f.elements.not.value.trim() : ''); panelKapat(); rezKarar(f.elements.id.value, 'reddedildi', { retNedeni: neden }); f.reset(); });
    document.addEventListener('ip:rez', ciz);
    sekmeSec(SEK[S.sekme] ? S.sekme : 'bekleyen'); ciz();
  };

  /* 7 · Etkinlikler */
  SAYFA['isletme/etkinlikler'] = function () {
    const TUR = {}; $$('#etTur option').forEach((o) => { TUR[o.value] = o.textContent; });
    const YAY = { taslak: ['Taslak', 'kapali'], incelemede: ['İncelemede', 'bekleyen'], yayinda: ['Yayında', 'cozulen'], pasif: ['Pasif', 'kapali'] };
    const ciz = () => {
      const q = ($('#etAra').value || '').toLocaleLowerCase('tr'), s = segmentDeger('etSuzgec');
      const l = D.etkinlik.slice().sort((a, b) => a.tarih.localeCompare(b.tarih)).filter((x) => (s === 'hepsi' || x.durum === s) && (!q || (x.ad + ' ' + TUR[x.tur]).toLocaleLowerCase('tr').indexOf(q) > -1));
      $('#etTablo').innerHTML = l.map((x) => { const o = x.kapasite ? Math.round((x.kayit || 0) / x.kapasite * 100) : 0; return '<tr><td><b>' + kac(x.ad) + '</b><small>' + (TUR[x.tur] || '') + ' · ' + (x.ucret ? kac(x.ucret) : 'Ücretsiz') + '</small></td><td data-etiket="Tarih"><b>' + tarihTR(x.tarih) + '</b><small>' + nokta(x.saat) + (x.bitis ? ' – ' + nokta(x.bitis) : '') + '</small></td><td class="num" data-etiket="Kayıt"><b>' + (x.kayit || 0) + ' / ' + x.kapasite + '</b><span class="olcer hap" role="img" aria-label="Doluluk yüzde ' + o + '"><span data-oran="' + o + '" style="--oran:' + o + '"></span></span></td><td data-etiket="Durum">' + hap(YAY[x.durum][0], YAY[x.durum][1]) + '</td><td class="eylem"><span class="satir-eylem"><button class="ikon-dugme" type="button" data-et-duzenle="' + kac(x.id) + '" aria-label="' + kac(x.ad) + ' düzenle">' + ik('fa-pen') + '</button>' + (x.durum === 'yayinda' ? '<button class="ikon-dugme" type="button" data-et-pasif="' + kac(x.id) + '" aria-label="' + kac(x.ad) + ' yayından kaldır">' + ik('fa-eye-slash') + '</button>' : '') + '<button class="ikon-dugme yikici" type="button" data-et-sil="' + kac(x.id) + '" aria-label="' + kac(x.ad) + ' sil">' + ik('fa-trash') + '</button></span></td></tr>'; }).join('');
      $('#etBos').hidden = l.length > 0; $('#etSayac').textContent = l.length;
    };
    const f = $('#etForm');
    const ac = (x) => { f.reset(); f.elements.id.value = ''; if (x) { formYaz(f, { id: x.id, ad: x.ad, tur: x.tur, tarih: x.tarih, saat: x.saat, bitis: x.bitis, kapasite: x.kapasite, ucret: x.ucret, aciklama: x.aciklama }); } else { f.elements.tarih.value = gunEkle(14); } $('#etPanelBas').textContent = x ? 'Etkinliği düzenle' : 'Etkinlik öner'; sayacTazele(); panelAc('#etPanel'); };
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-ac="#etPanel"]')) { e.preventDefault(); e.stopPropagation(); ac(); return; }
      const d = e.target.closest('[data-et-duzenle]'); if (d) { ac(D.etkinlik.filter((x) => x.id === d.dataset.etDuzenle)[0]); return; }
      const p = e.target.closest('[data-et-pasif]'); if (p) { D.etkinlik.forEach((x) => { if (x.id === p.dataset.etPasif) { x.durum = 'pasif'; } }); yaz(); ciz(); bildir('Etkinlik yayından kaldırıldı; kayıtlı misafirler bilgilendirilir.'); return; }
      const s = e.target.closest('[data-et-sil]'); if (s) { const x = D.etkinlik.filter((y) => y.id === s.dataset.etSil)[0]; onay('Etkinlik silinsin mi?', '“' + x.ad + '” listeden kalkacak.', 'Sil', () => { D.etkinlik = D.etkinlik.filter((y) => y.id !== x.id); yaz(); ciz(); bildir('Etkinlik silindi.'); }); return; }
      if (e.target.closest('[data-et-taslak]')) { if (!f.elements.ad.value.trim()) { f.elements.ad.focus(); bildir('Taslak için en az etkinlik adı gerekli.', 'hata'); return; } kaydet('taslak'); }
    }, true);
    const kaydet = (durum) => {
      const v = formOku(f); v.kapasite = +v.kapasite || 0; v.durum = durum;
      if (v.id) { D.etkinlik.forEach((x) => { if (x.id === v.id) { Object.assign(x, v); } }); } else { v.id = yeniId('et'); v.kayit = 0; D.etkinlik.push(v); }
      yaz(); ciz(); panelKapat(); bildir(durum === 'taslak' ? 'Taslak kaydedildi.' : 'Etkinlik incelemeye gönderildi; editör onayıyla Etkinlikler sayfasında yayına girer.');
    };
    f.addEventListener('submit', (e) => { e.preventDefault(); if (!gecerli(f)) { return; } kaydet('incelemede'); });
    $('#etAra').addEventListener('input', ciz); $('#etSuzgec').addEventListener('ip:segment', ciz);
    ciz();
  };

  /* 8 · Değerlendirmeler */
  SAYFA['isletme/degerlendirmeler'] = function () {
    const DD = { inceleniyor: ['İncelemede', 'bekleyen'], yayinda: ['Yayında', 'cozulen'], reddedildi: ['Yayınlanmadı', 'kapali'] };
    let sekme = 'yanitsiz';
    const SEK = { yanitsiz: (d) => d.durum === 'yayinda' && !yanitBul(d.id), yanitli: (d) => !!yanitBul(d.id), inceleniyor: (d) => d.durum === 'inceleniyor', tumu: () => true };
    if (location.hash) { const h = decodeURIComponent(location.hash.slice(1)); const d = tumDeg().filter((x) => x.id === h)[0]; if (d) { sekme = Object.keys(SEK).filter((k) => k !== 'tumu' && SEK[k](d))[0] || 'tumu'; } }
    const kart = (d) => {
      const y = yanitBul(d.id);
      const alt = y ? '<div class="bilgi-notu yanit-notu">' + ik('fa-reply') + '<p><b>İşletme yanıtın:</b> ' + kac(y) + '</p></div>'
        : d.durum === 'yayinda' ? '<form class="yanit-form" data-yanit-form="' + kac(d.id) + '" novalidate data-yerel><div class="alan"><label class="alan-etiket" for="yt-' + kac(d.id) + '">Yanıtın</label><textarea class="alan-metin" id="yt-' + kac(d.id) + '" name="metin" rows="3" minlength="5" maxlength="2000" placeholder="Kısa, somut ve nazik yaz. Yanıt bir kez yazılır, mekân sayfasında görünür." required></textarea></div><div class="eylem-satiri"><button class="dugme birincil kucuk" type="submit">' + ik('fa-paper-plane') + ' Yanıtla</button></div></form>'
          : '<p class="alan-yardim">' + ik('fa-circle-info') + '<span>Editör onayından sonra yanıt yazabilirsin.</span></p>';
      return '<article class="kart panel deg-kart" id="' + kac(d.id) + '"><div class="kart-bas"><div><h2 class="kart-baslik">' + kac(d.yazar) + ' · ' + kac(d.tarih) + (d.uye ? '' : ' ' + ET) + '</h2><p class="kriter-sira"><span>Lezzet ' + yildiz(d.lezzet) + '</span><span>Servis ' + yildiz(d.servis) + '</span><span>Ambiyans ' + yildiz(d.ambiyans) + '</span>' + (d.foto ? '<span>' + ik('fa-camera') + ' Fotoğraflı</span>' : '') + '</p></div>' + hap(DD[d.durum][0], DD[d.durum][1]) + '</div><div class="kart-govde">' + (d.metin ? '<p class="deg-metin">' + kac(d.metin) + '</p>' : '') + alt + '</div></article>';
    };
    const ciz = () => {
      const tum = tumDeg(), yay = tum.filter((d) => d.durum === 'yayinda');
      const ort = yay.length ? (yay.reduce((t, d) => t + (d.lezzet + d.servis + d.ambiyans) / 3, 0) / yay.length) : 0;
      const yanitli = yay.filter((d) => yanitBul(d.id)).length;
      const kpi = (i, e, s, a) => '<div class="kart kpi"><span class="ikon">' + ik(i) + '</span><div class="govde"><span class="etiket">' + e + '</span><span class="sayi">' + s + '</span><span class="kpi-degisim">' + ik('fa-minus') + ' ' + a + '</span></div></div>';
      $('#degKpi').innerHTML = kpi('fa-star', 'Ortalama puan', ort.toFixed(1).replace('.', ','), 'Lezzet, servis, ambiyans · prototip örneği') + kpi('fa-comments', 'Yayında', yay.length, 'değerlendirme') + kpi('fa-reply', 'Yanıt oranı', '%' + (yay.length ? Math.round(yanitli / yay.length * 100) : 0), yanitli + ' yanıtlandı') + kpi('fa-hourglass-half', 'İncelemede', tum.filter((d) => d.durum === 'inceleniyor').length, 'Editör onayında');
      const l = tum.filter(SEK[sekme]);
      $('#degListe').innerHTML = l.map(kart).join(''); $('#degBosKart').hidden = l.length > 0;
      $$('#degSekme .sekme').forEach((s) => { const a = s.dataset.sekme === sekme; s.classList.toggle('aktif', a); s.setAttribute('aria-selected', String(a)); s.tabIndex = a ? 0 : -1; $('[data-sayi]', s).textContent = tum.filter(SEK[s.dataset.sekme]).length; });
      $('#degListe').setAttribute('aria-labelledby', 'ds-' + sekme);
      sayaclariTazele();
    };
    $('#degSekme').addEventListener('click', (e) => { const s = e.target.closest('.sekme'); if (s) { sekme = s.dataset.sekme; ciz(); } });
    $('#degListe').addEventListener('submit', (e) => {
      const f = e.target.closest('[data-yanit-form]'); if (!f) { return; } e.preventDefault();
      const a = f.elements.metin, m = a.value.trim();
      if (m.length < 5) { a.setCustomValidity('Yanıt en az 5 karakter olmalı.'); a.reportValidity(); a.addEventListener('input', () => a.setCustomValidity(''), { once: true }); return; }
      if (KD) { KD.ekle('isletme-yanit', { id: f.dataset.yanitForm, metin: m }); }
      const id = f.dataset.yanitForm; sekme = 'yanitli'; ciz(); const k = document.getElementById(id); if (k) { k.scrollIntoView({ block: 'center' }); }
      bildir('Yanıtın yayınlandı; mekân sayfasında yorumun altında görünür.');
    });
    ciz();
    if (location.hash) { const k = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (k) { setTimeout(() => k.scrollIntoView({ block: 'center' }), 100); } }
  };

  /* 9 · İstatistikler (grafik kalıbı: Diet `DD.grafik.cizgi`) */
  SAYFA['isletme/istatistikler'] = function () {
    const S = D.istatistik;
    const cizgi = (el, o) => {
      const G = 640, Y = 240, sol = 40, sag = 12, ust = 12, alt = 28, hepsi = o.degerler;
      const hamEn = Math.min.apply(null, hepsi), hamBu = Math.max.apply(null, hepsi), kaba = (hamBu - hamEn || 1) / 4, kuvvet = Math.pow(10, Math.floor(Math.log10(kaba)));
      const adim = [1, 2, 2.5, 5, 10].map((c) => c * kuvvet).filter((c) => c >= kaba)[0], en = Math.max(0, Math.floor(hamEn / adim) * adim), bu = Math.max(Math.ceil(hamBu / adim) * adim, en + adim), n = Math.round((bu - en) / adim);
      const x = (i) => sol + (i * (G - sol - sag)) / Math.max(1, o.etiketler.length - 1), y = (v) => ust + ((bu - v) * (Y - ust - alt)) / (bu - en);
      let s = '<svg class="grafik" viewBox="0 0 ' + G + ' ' + Y + '" role="img" aria-label="' + o.baslik + '">';
      for (let i = 0; i <= n; i++) { const v = en + adim * i; s += '<line class="kilavuz" x1="' + sol + '" x2="' + (G - sag) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="eksen" x="' + (sol - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v.toLocaleString('tr-TR') + '</text>'; }
      const her = Math.ceil(o.etiketler.length / 8);
      const son = o.etiketler.length - 1; o.etiketler.forEach((t, i) => { if ((i % her === 0 && son - i >= her / 2) || i === son) { s += '<text class="eksen" x="' + x(i) + '" y="' + (Y - 8) + '" text-anchor="middle">' + t + '</text>'; } });
      s += '<polyline class="seri" stroke="var(--grafik-1)" points="' + hepsi.map((v, i) => x(i) + ',' + y(v)).join(' ') + '"/>';
      hepsi.forEach((v, i) => { s += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" fill="var(--grafik-1)"><title>' + o.etiketler[i] + ': ' + v + '</title></circle>'; });
      el.innerHTML = s + '</svg>';
    };
    const AD = { goruntulenme: 'Görüntülenme', kaydetme: 'Favoriye ekleme', rota: 'Rota durağı eklenme', rezervasyon: 'Rezervasyon talebi' };
    const ciz = () => {
      const g = +segmentDeger('donem') || 30, seri = segmentDeger('grafikSeri') || 'goruntulenme';
      const etiket = S[seri].slice(-g).map((v, i, l) => tarihTR(gunEkle(i - l.length + 1)).slice(0, 5));
      cizgi($('#istGrafik'), { baslik: AD[seri] + ', son ' + g + ' gün', etiketler: etiket, degerler: S[seri].slice(-g) });
      $('#grafikNot').textContent = AD[seri] + ', günlük · son ' + g + ' gün · prototip örneği';
      Object.keys(AD).forEach((k) => { const e = $('[data-kpi="' + k + '"] .sayi'); if (e) { e.textContent = S[k].slice(-g).reduce((a, b) => a + b, 0).toLocaleString('tr-TR'); } });
    };
    document.addEventListener('ip:segment', ciz);
    ciz();
  };

  /* 10 · Başvurular (eski portal) */
  const BASVURU = { taslak: ['Taslak', 'kapali'], gonderildi: ['Gönderildi', 'bekleyen'], incelemede: ['İncelemede', 'bekleyen'], bilgi_istendi: ['Bilgi istendi', 'bekleyen'], onaylandi: ['Onaylandı', 'cozulen'], reddedildi: ['Reddedildi', 'kapali'] };
  const TALEP = { taslak: ['Taslak', 'kapali'], gonderildi: ['Gönderildi', 'bekleyen'], incelemede: ['İncelemede', 'bekleyen'], onaylandi: ['Onaylandı', 'cozulen'], reddedildi: ['Reddedildi', 'kapali'], uygulandi: ['Uygulandı', 'cozulen'] };
  const TALEP_ALAN = { ad: 'İşletme adı', adres: 'Adres', telefon: 'Telefon', calisma_saatleri: 'Çalışma saatleri', not: 'Not' };
  const BELGE = { vergi_levhasi: 'Vergi levhası', faaliyet_belgesi: 'Faaliyet belgesi', isletme_ruhsati: 'İşletme ruhsatı', diger: 'Diğer' };
  SAYFA['isletme/basvurular'] = function () {
    const t = $('#basvuruTablo'); if (!t || !KD) { return; }
    KD.oku('isletme-basvuru').slice().reverse().forEach((b) => { t.insertAdjacentHTML('afterbegin', '<tr><td><a href="' + kok + 'isletme/basvurular/yeni/?b=' + encodeURIComponent(b.id) + '"><b>' + kac(b.gorunen_ad) + '</b></a><small>Başvuru #' + b.no + ' · ' + kac(b.ticari_unvan) + ' · bu tarayıcıda</small></td><td data-etiket="Tür">' + kac(b.mekan_turu || '–') + '</td><td data-etiket="Gönderildi">' + (b.gonderildi || 'Gönderilmedi') + '</td><td data-etiket="Durum">' + hap((BASVURU[b.durum] || BASVURU.taslak)[0], (BASVURU[b.durum] || BASVURU.taslak)[1]) + '</td><td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="' + kok + 'isletme/basvurular/yeni/?b=' + encodeURIComponent(b.id) + '" aria-label="Başvuruyu aç">' + ik('fa-pen') + '</a></span></td></tr>'); });
  };
  const basvuruFormu = function () {
    const bForm = $('[data-basvuru-form]'); if (!bForm || !KD) { return; }
    let adres = new URLSearchParams(location.search);
    const hata = $('[data-basvuru-hata]'), belgeKart = $('[data-belge-kart]'), belgeListe = $('[data-belge-liste]'), gonder = $('[data-basvuru-gonder]'), kaydetD = $('[data-basvuru-kaydet]');
    const ornekNo = bForm.dataset.basvuruNo || '';
    const kayit = () => { const id = adres.get('b'); return id ? KD.oku('isletme-basvuru').filter((x) => x.id === id)[0] : null; };
    const anahtar = () => { const k = kayit(); return ornekNo || (k ? k.id : ''); };
    const durum = () => { const k = kayit(); return ornekNo ? bForm.dataset.basvuruDurum : (k ? k.durum : ''); };
    const duzenlenir = () => ['taslak', 'bilgi_istendi'].indexOf(durum()) > -1;
    const hataGoster = (m) => { $('p', hata).textContent = m; hata.hidden = false; hata.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    const hataGizle = () => { hata.hidden = true; };
    const hizmetSayac = () => { const n = $$('[name="hizmetler"]:checked', bForm).length, s = $('[data-hizmet-sayac]', bForm); if (s) { s.textContent = n + '/5 seçildi'; } return n; };
    bForm.addEventListener('change', (e) => { if (e.target.name === 'hizmetler' && e.target.checked && hizmetSayac() > 5) { e.target.checked = false; bildir('En fazla 5 hizmet seçebilirsin.', 'hata'); } hizmetSayac(); });
    const ALAN = ['gorunen_ad', 'ticari_unvan', 'mekan_turu', 'fiyat_seviyesi', 'il', 'ilce', 'acik_adres', 'yetkili_ad', 'yetkili_telefon', 'isletme_eposta', 'isletme_telefon', 'web_sitesi', 'instagram', 'vergi_veya_ruhsat_no', 'calisma_saatleri_ozeti', 'tanitim', 'rezervasyon_araliklari', 'rezervasyon_notu', 'notlar'];
    const okuF = () => { const v = {}, el = bForm.elements; ALAN.forEach((k) => { v[k] = (el[k].value || '').trim(); }); v.hizmetler = $$('[name="hizmetler"]:checked', bForm).map((x) => x.value); v.hizmet_turleri = $$('[name="hizmet_turleri"]:checked', bForm).map((x) => x.value); v.dogrulama_onayi = el.dogrulama_onayi.checked; v.kosullar_onayi = el.kosullar_onayi.checked; return v; };
    const doldurF = (k) => { const el = bForm.elements; ALAN.forEach((a) => { if (typeof k[a] === 'string') { el[a].value = k[a]; } }); $$('[name="hizmetler"],[name="hizmet_turleri"]', bForm).forEach((x) => { x.checked = (k[x.name] || []).indexOf(x.value) > -1; }); el.dogrulama_onayi.checked = !!k.dogrulama_onayi; el.kosullar_onayi.checked = !!k.kosullar_onayi; hizmetSayac(); sayacTazele(); };
    const durumYaz = () => { const r = $('[data-basvuru-durum-rozet]'), d = BASVURU[durum()] || BASVURU.taslak; if (r) { r.innerHTML = hap(d[0], d[1]); } };
    const kilit = () => {
      const ac = !ornekNo && !kayit() ? true : duzenlenir();
      $$('input,select,textarea', bForm).forEach((x) => { x.disabled = !ac; });
      $$('input,select,button', $('[data-belge-form]')).forEach((x) => { x.disabled = !ac; });
      if (kaydetD) { kaydetD.disabled = !ac; } if (gonder) { gonder.disabled = !(ac && (ornekNo || kayit())); }
      notYaz(ac ? (ornekNo || kayit() ? 'Düzenlenebilir · ' + (BASVURU[durum()] || BASVURU.taslak)[0] : 'Kaydedilmedi') : durum() === 'onaylandi' ? 'Onaylandı: bilgi değişikliği için değişiklik talebi aç' : durum() === 'reddedildi' ? 'Reddedildi: yeni başvuru açabilirsin' : (BASVURU[durum()] || BASVURU.taslak)[0] + ': incelemedeki başvuru düzenlenemez');
    };
    const duzenlemeKipi = () => { const b = $('[data-basvuru-baslik]'), k = kayit(); if (b && k) { b.textContent = 'Başvuru #' + k.no + ' · ' + k.gorunen_ad; } document.title = document.title.replace('İşletme ekle', 'Başvuruyu düzenle'); if (belgeKart) { belgeKart.hidden = false; } durumYaz(); kilit(); };
    const belgeSatir = (x) => '<div class="ayar-satir"><span class="as-ikon">' + ik('fa-file-lines') + '</span><span class="as-metin"><b>' + (BELGE[x.tur] || kac(x.tur)) + '</b><span>' + kac(x.ad) + ' · ' + x.kb.toLocaleString('tr-TR') + ' KB · bu tarayıcıda</span></span></div>';
    const ilk = kayit();
    if (ilk) { doldurF(ilk); duzenlemeKipi(); } else { kilit(); }
    if (ilk || ornekNo) { KD.oku('isletme-belge').filter((x) => x.basvuru === anahtar()).slice().reverse().forEach((x) => belgeListe.insertAdjacentHTML('beforeend', belgeSatir(x))); }
    bForm.addEventListener('submit', (e) => {
      e.preventDefault(); hataGizle();
      if (!gecerli(bForm)) { return; }
      const k = kayit();
      if ((ornekNo || k) && !duzenlenir()) { hataGoster('Başvuru güncel değil veya düzenlenebilir durumda değil.'); return; }
      const v = okuF();
      if (k) { KD.guncelle('isletme-basvuru', k.id, v); notYaz('Kaydedildi · ' + saatNow()); bildir('Başvuru güncellendi.'); return; }
      v.id = 'basvuru-' + Date.now(); v.no = 1043 + KD.oku('isletme-basvuru').length; v.durum = 'taslak';
      KD.ekle('isletme-basvuru', v);
      history.replaceState(null, '', location.pathname + '?b=' + encodeURIComponent(v.id)); adres = new URLSearchParams(location.search);
      duzenlemeKipi(); bildir('Başvuru taslağı oluşturuldu. Belgeni yükleyip incelemeye gönderebilirsin.');
    });
    const belgeForm = $('[data-belge-form]');
    if (belgeForm) {
      const dosya = belgeForm.elements.dosya, dosyaAd = $('[data-dosya-ad]', belgeForm), ilkAd = dosyaAd.textContent;
      dosya.addEventListener('change', () => { dosyaAd.textContent = dosya.files.length ? dosya.files[0].name : ilkAd; });
      belgeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!dosya.files.length) { bildir('Önce belge dosyasını seç.', 'hata'); return; }
        const f = dosya.files[0];
        if (['application/pdf', 'image/jpeg', 'image/png'].indexOf(f.type) < 0 || f.size > 10 * 1024 * 1024) { bildir('Belge PDF, JPG veya PNG olmalı ve 10 MB sınırını aşmamalı.', 'hata'); return; }
        const kb = Math.max(1, Math.round(f.size / 1024));
        if (KD.oku('isletme-belge').some((x) => x.basvuru === anahtar() && x.ad === f.name && x.kb === kb)) { bildir('Bu belge zaten yüklendi.', 'hata'); return; }
        const x = { id: 'belge-' + Date.now(), basvuru: anahtar(), tur: belgeForm.elements.tur.value, ad: f.name, kb: kb };
        KD.ekle('isletme-belge', x); belgeListe.insertAdjacentHTML('beforeend', belgeSatir(x)); belgeForm.reset(); dosyaAd.textContent = ilkAd;
        bildir('Belge yüklendi.');
      });
    }
    /* İncelemeye gönder: canlı IsletmeBasvuruServisi::doluluguDogrula */
    const ZORUNLU = [['mekan_turu', 'İşletme türü'], ['fiyat_seviyesi', 'Fiyat aralığı'], ['il', 'İl'], ['ilce', 'İlçe'], ['acik_adres', 'Açık adres'], ['yetkili_ad', 'Yetkili ad soyad'], ['yetkili_telefon', 'Yetkili telefon'], ['isletme_eposta', 'E-posta'], ['isletme_telefon', 'İşletme telefonu'], ['vergi_veya_ruhsat_no', 'Vergi no / işletme belgesi no'], ['tanitim', 'Kısa tanıtım'], ['hizmetler', 'Sunulan hizmetler'], ['hizmet_turleri', 'Servis türü'], ['dogrulama_onayi', 'Doğrulama için açık rıza'], ['kosullar_onayi', 'Aydınlatma Metni ve KVKK onayı']];
    if (gonder) {
      gonder.addEventListener('click', () => {
        hataGizle(); const k = kayit();
        if (!k || !duzenlenir()) { hataGoster('Önce taslağı kaydet; incelemedeki başvuru yeniden gönderilemez.'); return; }
        const eksik = ZORUNLU.filter((z) => { const d = k[z[0]]; return !d || d.length === 0; }).map((z) => z[1]);
        if (eksik.length) { hataGoster('Başvuru incelemeye gönderilemez, eksik alanlar var: ' + eksik.join(', ') + '.'); return; }
        KD.guncelle('isletme-basvuru', k.id, { durum: 'gonderildi', gonderildi: tarihTR(bugunIso) });
        sonraBildir('Başvurun incelemeye gönderildi.'); location.href = kok + 'isletme/basvurular/';
      });
    }
  };
  SAYFA['isletme/basvurular/yeni'] = basvuruFormu;
  /* 11 · Değişiklik talepleri (eski portal) */
  SAYFA['isletme/degisiklik-talepleri'] = function () {
    const t = $('#talepTablo'); if (!t || !KD) { return; }
    const kayitli = KD.oku('isletme-talep');
    kayitli.slice().reverse().forEach((x) => { const d = TALEP[x.durum] || TALEP.gonderildi; t.insertAdjacentHTML('afterbegin', '<tr><td><a href="' + kok + 'isletme/degisiklik-talepleri/gonderilen/?t=' + encodeURIComponent(x.id) + '"><b>Talep #' + x.no + '</b></a><small>' + Object.keys(x.degisiklikler).filter((k) => k !== 'not').map((k) => TALEP_ALAN[k] || k).join(', ') + (x.kaynak === 'profil' ? ' · Mekân Profili\'nden' : '') + '</small></td><td data-etiket="Mekân">' + kac(x.mekan) + '</td><td data-etiket="Gönderildi">' + x.gonderildi + ' ' + x.saat + '</td><td data-etiket="Durum">' + hap(d[0], d[1]) + '</td><td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="' + kok + 'isletme/degisiklik-talepleri/gonderilen/?t=' + encodeURIComponent(x.id) + '" aria-label="Talep #' + x.no + ' gör">' + ik('fa-eye') + '</a></span></td></tr>'); });
    $$('[data-talep-sayi]').forEach((r) => { r.textContent = t.rows.length + ' talep'; });
  };
  SAYFA['isletme/degisiklik-talepleri/yeni'] = function () {
    const f = $('[data-talep-form]'); if (!f || !KD) { return; }
    const ilk = formOku(f);
    f.addEventListener('submit', (e) => {
      e.preventDefault(); if (!gecerli(f)) { return; }
      const el = f.elements, mekan = el.mekan_id.value;
      if (KD.oku('isletme-talep').some((t) => t.mekan === mekan && (t.durum === 'gonderildi' || t.durum === 'incelemede'))) { bildir('Bu mekân için bekleyen bir değişiklik talebin zaten var.', 'hata'); return; }
      const deg = {}; ['ad', 'adres', 'telefon', 'calisma_saatleri', 'not'].forEach((k) => { const v = el[k].value.trim(); if (v && (v !== ilk[k] || k === 'ad')) { deg[k] = v; } });
      if (Object.keys(deg).filter((k) => k !== 'ad' && k !== 'not').length === 0 && deg.ad === ilk.ad) { bildir('Değişen alan yok; en az bir alanı güncelle.', 'hata'); return; }
      const t = { id: 'talep-' + Date.now(), no: 348 + KD.oku('isletme-talep').length, mekan: mekan, degisiklikler: deg, durum: 'gonderildi', gonderildi: tarihTR(bugunIso), saat: saatNow().replace('.', ':') };
      KD.ekle('isletme-talep', t); sonraBildir('Değişiklik talebin gönderildi.');
      location.href = kok + 'isletme/degisiklik-talepleri/gonderilen/?t=' + encodeURIComponent(t.id);
    });
  };
  SAYFA['isletme/degisiklik-talepleri/gonderilen'] = function () {
    const g = $('[data-talep-goster]'); if (!g || !KD) { return; }
    const tid = new URLSearchParams(location.search).get('t'), t = KD.oku('isletme-talep').filter((x) => x.id === tid)[0] || KD.oku('isletme-talep')[0];
    if (!t) { return; }
    $('[data-talep-baslik]').textContent = 'Değişiklik talebi #' + t.no; document.title = 'Değişiklik talebi #' + t.no + ' · İşletme Paneli · Dada Gourmet';
    const d = TALEP[t.durum] || TALEP.gonderildi; $('[data-talep-durum]').innerHTML = hap(d[0], d[1]);
    $('[data-talep-tarih]').textContent = 'Gönderildi ' + t.gonderildi + ' ' + t.saat + (t.kaynak === 'profil' ? ' · Mekân Profili kaydından' : '');
    $('[data-talep-alanlar]').innerHTML = Object.keys(t.degisiklikler).map((k) => '<div class="deger-satir"><span>' + (TALEP_ALAN[k] || kac(k)) + '</span><b>' + kac(t.degisiklikler[k]) + '</b></div>').join('');
  };

  /* 12 · Ayarlar */
  SAYFA['isletme/ayarlar'] = function () {
    const f = $('#ayarForm');
    const doldur = () => {
      formYaz(f, { kapasite: D.rezAyar.kapasite, asgari: D.rezAyar.asgari, azami: D.rezAyar.azami, slot: D.rezAyar.slot, onceden: D.rezAyar.onceden, iptal: D.rezAyar.iptal, etkin: D.rezAyar.etkin });
      $$('#pencereTablo tr').forEach((tr) => { const g = +tr.dataset.gun, p = D.rezPencere.filter((x) => x.gun === g)[0] || { etkin: false }; $('[data-rp="etkin"]', tr).checked = !!p.etkin; if (p.bas) { $('[data-rp="bas"]', tr).value = p.bas; $('[data-rp="bit"]', tr).value = p.bit; $('[data-rp="kapasite"]', tr).value = p.kapasite; } });
    };
    kirli(f);
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ayar]'); if (!b) { return; }
      if (b.dataset.ayar === 'vazgec') { doldur(); notYaz('Kaydedilmiş ayarlar'); bildir('Değişiklikler geri alındı.'); return; }
      const v = formOku(f);
      if (+v.asgari > +v.azami) { bildir('Kaydedilmedi: en az kişi en çok kişiden büyük olamaz.', 'hata'); f.elements.asgari.focus(); return; }
      D.rezAyar = { etkin: !!v.etkin, kapasite: +v.kapasite || 1, asgari: +v.asgari || 1, azami: +v.azami || 1, slot: +v.slot, onceden: +v.onceden, iptal: +v.iptal };
      D.rezPencere = $$('#pencereTablo tr').map((tr) => ({ gun: +tr.dataset.gun, bas: $('[data-rp="bas"]', tr).value, bit: $('[data-rp="bit"]', tr).value, kapasite: +$('[data-rp="kapasite"]', tr).value || 0, etkin: $('[data-rp="etkin"]', tr).checked }));
      yaz(); notYaz('Kaydedildi · ' + saatNow()); bildir(D.rezAyar.etkin ? 'Rezervasyon ayarları kaydedildi.' : 'Kaydedildi. Rezervasyon kapalı: mekân sayfasında rezervasyon düğmesi yerine telefon görünür.');
    });
    doldur();
  };

  /* Yol eşleme: başvuru düzenleme sayfaları ve talep ayrıntıları ortak işleyiciye düşer */
  const isle = SAYFA[yol] || (/^isletme\/basvurular\/\d+\/duzenle$/.test(yol) ? basvuruFormu : null);
  if (isle) { isle(); }
})();
