/* Aşama 2 · B · arayüz çevirisi (ajan-b1). Sayfa kaynak dilin DIŞINDAYSA Blade <main data-l-js='{ad: metin}'> basar (ad = sözlük
   anahtarının 'arayuz_' öneksiz hâli); öznitelik yoksa (TR) her çağrı TR yedeğini AYNEN döndürür — TR davranışı ve metni değişmez. */
/* `window`suz bağlamda da (betiği vm'de koşan tests/js) tanımlı kalır ve sözlük okunamazsa TR yedeğini döndürür (ajan-b1b). */
var dmL = (typeof window !== 'undefined' && window.dmL) || function (k, tr, p) {
  var s = null;
  try { var el = document.querySelector('[data-l-js]'); s = el ? JSON.parse(el.getAttribute('data-l-js'))[k] : null; } catch (e) { s = null; }
  if (typeof s !== 'string') return tr;
  /* Çoğul (EN): 'tekil|çoğul' — sayı p.sayi, yoksa p.toplam, yoksa p.n; 1 → ilk biçim, gerisi son biçim; RU (üç kategorili dil, 20 Eki): 'bir|az|çok', kesir → az. Kırpma yok (baştaki boşluk anlamlı). */
  if (s.indexOf('|') >= 0) { var n = p ? [p.sayi, p.toplam, p.n].filter(function (x) { return x !== undefined && x !== null && x !== ''; })[0] : undefined; var b = s.split('|'); var bi = (function (x) { if (b.length < 3 || typeof document === 'undefined' || typeof Intl === 'undefined') return -1; var pr = new Intl.PluralRules(document.documentElement.lang || 'tr'); if (pr.resolvedOptions().pluralCategories.indexOf('few') < 0) return -1; x = Math.abs(Number(x)) || 0; if (x !== Math.floor(x)) return 1; var k = pr.select(x); return k === 'one' ? 0 : (k === 'few' ? 1 : 2); })(n); s = bi >= 0 ? b[bi] : (Number(n) === 1 ? b[0] : b[b.length - 1]); }
  return s.replace(/:([a-z_]+)/g, function (m, a) { return p && Object.prototype.hasOwnProperty.call(p, a) ? String(p[a]) : m; });
};
if (typeof window !== 'undefined') window.dmL = dmL;
/* Hesap görselleri: kanon modalı korunur; maket olayları yakalama evresinde kesilir. */
(function () {
  'use strict';
  if (window.DADA_UYE_AVATAR) return;
  window.DADA_UYE_AVATAR = true;
  var hedef = 'avatar', modal, dosya = null, nesneUrl = null, secim = 0, mesgul = false;
  var en = 0, boy = 0, zoom = 1, merkezX = 0, merkezY = 0;
  var parmaklar = new Map();
  var olculer = { avatar: [400, 400], kapak: [1176, 240] };
  function $(id) { return document.getElementById(id); }
  function kes(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  function yaz(metin, hata) {
    $('fyDurum').classList.toggle('blocked', !!hata);
    $('fyDurum').querySelector('span').textContent = metin;
    $('fyDurum').querySelector('i').className = mesgul ? 'fa-solid fa-spinner fa-spin' : hata ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-info';
  }
  function kilitle(deger) {
    mesgul = deger;
    $('fotoModal').setAttribute('aria-busy', String(deger));
    ['fyUygula', 'fyKaldir', 'fyVazgec', 'fotoClose', 'fyFile', 'fyOlcek', 'fyDegistir'].forEach(function (id) {
      if ($(id)) $(id).disabled = deger || (id === 'fyUygula' && !dosya);
    });
  }
  function temizle() {
    ++secim;
    if (nesneUrl) URL.revokeObjectURL(nesneUrl);
    nesneUrl = null; dosya = null; en = 0; boy = 0; zoom = 1; parmaklar.clear();
    $('fyFile').value = ''; $('fyImg').removeAttribute('src');
    $('fyStage').hidden = true; $('fyDrop').hidden = false;
    $('fyOlcek').value = 100; $('fyImg').style.transform = '';
    kilitle(false); yaz(dmL('uye_hesap.js.avatar.henuz_dosya', 'Henüz dosya seçmedin.'), false);
  }
  function ac(dugme) {
    if (!modal) modal = window.FIT_MODAL.kur({kap: '#fotoModal', panel: '.fb-panel', ortu: '#fotoOverlay', kapat: '#fotoClose', kapaninca: temizle});
    hedef = dugme.dataset.photoEdit === 'kapak' ? 'kapak' : 'avatar';
    temizle();
    var o = olculer[hedef];
    $('fotoModalTitle').textContent = hedef === 'avatar' ? dmL('uye_hesap.js.avatar.profil_fotografi', 'Profil Fotoğrafı') : dmL('uye_hesap.js.avatar.kapak_fotografi', 'Kapak Fotoğrafı');
    $('fotoModalSub').textContent = dmL('uye_hesap.js.avatar.alt_baslik', 'JPG, PNG veya WebP · en az ' + o[0] + '×' + o[1] + ' px · en çok 5 MB.', {en: o[0], boy: o[1]});
    $('fyFrame').classList.toggle('kapak', hedef === 'kapak');
    $('fyKaldir').hidden = !$('fotoModal').dataset[hedef + 'Url'];
    $('fyKaldirEtiket').textContent = hedef === 'kapak' ? dmL('uye_hesap.js.avatar.kapagi_kaldir', 'Kapağı Kaldır') : dmL('uye_hesap.js.avatar.fotografi_kaldir', 'Fotoğrafı Kaldır');
    modal.ac(dugme);
  }
  async function al(f) {
    if (!f || mesgul) return;
    temizle(); var buSecim = secim;
    if (f.size > 5 * 1024 * 1024) { yaz(dmL('uye_hesap.js.avatar.cok_buyuk', 'Dosya çok büyük. En çok 5 MB olabilir.'), true); return; }
    var b = new Uint8Array(await f.slice(0, 12).arrayBuffer());
    if (buSecim !== secim) return;
    var tur = b[0] === 255 && b[1] === 216 && b[2] === 255 ? 'jpg'
      : b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71 ? 'png'
      : String.fromCharCode.apply(null, b.slice(0, 4)) === 'RIFF' && String.fromCharCode.apply(null, b.slice(8, 12)) === 'WEBP' ? 'webp' : '';
    var uzanti = f.name.split('.').pop().toLowerCase().replace('jpeg', 'jpg');
    if (!tur || tur !== uzanti) { yaz(dmL('uye_hesap.js.avatar.tur_uyusmali', 'Dosyanın gerçek türü ve uzantısı uyuşmalı: JPG, PNG veya WebP seç.'), true); return; }
    var url = URL.createObjectURL(f), resim = new Image();
    try { resim.src = url; await resim.decode(); }
    catch (_) { URL.revokeObjectURL(url); if (buSecim === secim) yaz(dmL('uye_hesap.js.avatar.gecersiz', 'Dosya geçerli bir görsel değil. Başka bir JPG, PNG veya WebP seç.'), true); return; }
    if (buSecim !== secim) { URL.revokeObjectURL(url); return; }
    var o = olculer[hedef];
    if (resim.naturalWidth < o[0] || resim.naturalHeight < o[1]) {
      URL.revokeObjectURL(url); yaz(dmL('uye_hesap.js.avatar.cok_kucuk', 'Görsel çok küçük. En az ' + o[0] + '×' + o[1] + ' px gerekiyor.', {en: o[0], boy: o[1]}), true); return;
    }
    dosya = f; nesneUrl = url; en = resim.naturalWidth; boy = resim.naturalHeight; merkezX = en / 2; merkezY = boy / 2;
    $('fyImg').src = url; $('fyAd').textContent = f.name;
    $('fyBoyut').textContent = Math.round(f.size / 1024) + ' KB';
    $('fyOlcu').textContent = en + '×' + boy + ' px';
    $('fyKirp').textContent = o[0] + '×' + o[1] + ' px';
    $('fyDrop').hidden = true; $('fyStage').hidden = false;
    $('fyOlcek').max = Math.floor(Math.min(en / o[0], boy / o[1]) * 100);
    $('fyUygula').disabled = false; ciz(); yaz(dmL('uye_hesap.js.avatar.hazir', 'Görsel hazır. Çerçevede kalan alan hesabına kaydedilecek.'), false);
  }
  function kirpma() {
    var o = olculer[hedef], w = Math.min(en, boy * o[0] / o[1]) / zoom;
    var h = w * o[1] / o[0];
    merkezX = Math.max(w / 2, Math.min(en - w / 2, merkezX));
    merkezY = Math.max(h / 2, Math.min(boy - h / 2, merkezY));
    return {x: Math.max(0, merkezX - w / 2), y: Math.max(0, merkezY - h / 2), genislik: w};
  }
  function ciz() {
    if (!dosya) return;
    var k = kirpma(), r = $('fyFrame').getBoundingClientRect(), oran = r.width / k.genislik;
    var img = $('fyImg');
    img.style.width = (en * oran) + 'px'; img.style.height = (boy * oran) + 'px';
    img.style.transform = 'translate(' + (-k.x * oran) + 'px,' + (-k.y * oran) + 'px)';
    $('fyOlcek').value = Math.round(zoom * 100);
    $('fyOlcek').setAttribute('aria-valuetext', dmL('uye_hesap.js.avatar.yuzde', 'Yüzde ' + Math.round(zoom * 100), {n: Math.round(zoom * 100)}));
  }
  function yakinlastir(deger, x, y) {
    if (!dosya || mesgul) return;
    var r = $('fyFrame').getBoundingClientRect(), k = kirpma(), once = r.width / k.genislik;
    var dx = x == null ? 0 : x - r.left - r.width / 2;
    var dy = y == null ? 0 : y - r.top - r.height / 2;
    zoom = Math.max(1, Math.min(Number($('fyOlcek').max) / 100, deger));
    var sonra = r.width / (Math.min(en, boy * olculer[hedef][0] / olculer[hedef][1]) / zoom);
    merkezX += dx / once - dx / sonra; merkezY += dy / once - dy / sonra;
    ciz();
  }
  function kaydir(dx, dy) {
    if (!dosya || mesgul) return;
    var oran = $('fyFrame').getBoundingClientRect().width / kirpma().genislik;
    merkezX -= dx / oran; merkezY -= dy / oran; ciz();
  }
  function ikiParmak() {
    var p = Array.from(parmaklar.values());
    return {x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2,
      uzaklik: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)};
  }
  function csrf() {
    try { return JSON.parse(document.querySelector('meta[name="dada-kimlik"]').content).csrf; } catch (_) { return ''; }
  }
  async function kaydet(sil) {
    if (mesgul || (!sil && !dosya)) return;
    var govde;
    if (!sil) {
      govde = new FormData(); govde.append('dosya', dosya);
      var k = kirpma(); Object.keys(k).forEach(function (ad) { govde.append('kirpma[' + ad + ']', k[ad].toFixed(6)); });
    }
    kilitle(true); yaz(sil ? dmL('uye_hesap.js.avatar.siliniyor', 'Görsel siliniyor… Lütfen bekle.') : dmL('uye_hesap.js.avatar.yukleniyor', 'Görsel yükleniyor ve kaydediliyor… Lütfen bekle.'), false);
    try {
      var yanit = await fetch('/hesabim/ayarlar/' + hedef, {method: sil ? 'DELETE' : 'POST', body: govde, credentials: 'same-origin',
        headers: {'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json'}});
      var veri = await yanit.json().catch(function () { return {}; });
      if (!yanit.ok) {
        var mesaj = yanit.status >= 500 ? dmL('uye_hesap.js.avatar.sunucu_hatasi', 'Sunucu hatası nedeniyle işlem tamamlanamadı. Lütfen yeniden dene.')
          : yanit.status === 413 ? dmL('uye_hesap.js.avatar.cok_buyuk', 'Dosya çok büyük. En çok 5 MB olabilir.')
          : yanit.status === 401 || yanit.status === 419 ? dmL('uye_hesap.js.avatar.oturum_bitti', 'Oturumun sona erdi. Sayfayı yenileyip yeniden giriş yap.')
          : veri.errors ? Object.values(veri.errors).flat()[0] : dmL('uye_hesap.js.avatar.tamamlanamadi', 'İşlem tamamlanamadı. Lütfen yeniden dene.');
        kilitle(false); yaz(mesaj, true); return;
      }
      if (veri.ok !== true) { kilitle(false); yaz(dmL('uye_hesap.js.avatar.gecersiz_sonuc', 'Sunucudan geçerli bir sonuç alınamadı. Lütfen yeniden dene.'), true); return; }
      yaz(sil ? dmL('uye_hesap.js.avatar.kaldirildi', 'Görsel kaldırıldı.') : dmL('uye_hesap.js.avatar.kaydedildi', 'Görsel kaydedildi.'), false);
      window.location.reload();
    } catch (_) {
      kilitle(false); yaz(dmL('uye_hesap.js.avatar.ag_kesildi', 'Ağ bağlantısı kesildi. Bağlantını kontrol edip yeniden dene.'), true);
    }
  }
  document.addEventListener('click', function (e) {
    var dugme = e.target.closest && e.target.closest('[data-photo-edit]');
    if (dugme) { kes(e); if (!mesgul) ac(dugme); return; }
    if (!$('fotoModal') || !$('fotoModal').classList.contains('show')) return;
    var b = e.target.closest && e.target.closest('#fyUygula,#fyKaldir,#fyVazgec,#fotoClose,#fyDegistir');
    if (mesgul && ($('fotoModal').contains(e.target) || e.target === $('fotoOverlay'))) { kes(e); return; }
    if (!b) return;
    kes(e);
    if (b.id === 'fyUygula') kaydet(false);
    else if (b.id === 'fyKaldir') kaydet(true);
    else if (b.id === 'fyDegistir') $('fyFile').click();
    else modal.kapat();
  }, true);
  document.addEventListener('change', function (e) { if (e.target.id === 'fyFile') { kes(e); al(e.target.files[0]); } }, true);
  document.addEventListener('input', function (e) {
    if (e.target.id === 'fyOlcek') { kes(e); if (!mesgul && dosya) { yakinlastir(Number(e.target.value) / 100); } }
  }, true);
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (tip) {
    document.addEventListener(tip, function (e) {
      if (!e.target.closest || !e.target.closest('#fyDrop')) return;
      kes(e); $('fyDrop').classList.toggle('is-over', tip === 'dragenter' || tip === 'dragover');
      if (tip === 'drop' && !mesgul) al(e.dataTransfer.files[0]);
    }, true);
  });
  document.addEventListener('keydown', function (e) {
    if (mesgul && e.key === 'Escape') { kes(e); return; }
    if (e.target.id !== 'fyFrame' || !dosya || mesgul) return;
    var yon = {ArrowLeft: [10, 0], ArrowRight: [-10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10]}[e.key];
    if (yon) { kes(e); kaydir(yon[0], yon[1]); }
  }, true);
  document.addEventListener('wheel', function (e) {
    if (!e.target.closest || !e.target.closest('#fyFrame') || !dosya) return;
    kes(e); yakinlastir(zoom * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY);
  }, {capture: true, passive: false});
  document.addEventListener('pointerdown', function (e) {
    if (!e.target.closest || !e.target.closest('#fyFrame') || !dosya || mesgul || (e.pointerType === 'mouse' && e.button !== 0)) return;
    kes(e); $('fyFrame').focus(); $('fyFrame').setPointerCapture(e.pointerId);
    parmaklar.set(e.pointerId, {x: e.clientX, y: e.clientY});
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!parmaklar.has(e.pointerId)) return;
    kes(e); var eski = parmaklar.get(e.pointerId), iki = parmaklar.size === 2 ? ikiParmak() : null;
    parmaklar.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (iki) {
      var yeni = ikiParmak();
      if (iki.uzaklik > 0) yakinlastir(zoom * yeni.uzaklik / iki.uzaklik, yeni.x, yeni.y);
      kaydir(yeni.x - iki.x, yeni.y - iki.y);
    } else if (parmaklar.size === 1) kaydir(e.clientX - eski.x, e.clientY - eski.y);
  }, true);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (tip) {
    document.addEventListener(tip, function (e) { parmaklar.delete(e.pointerId); }, true);
  });
  window.addEventListener('resize', ciz);
})();
