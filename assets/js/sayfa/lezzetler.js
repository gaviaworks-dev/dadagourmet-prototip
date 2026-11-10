/* Gurme Lezzetler, yazı detayı ve ana sayfadaki Gurme Lezzetler rayı. Veri `lezzet-veri.js`, canlı `/gurme-lezzetler` kayıtlarının kopyası.
   Kategori ve sıralama canlıdaki gibi sayfa yenilemeden değişir; sayfa numarası gerçek bağdır. Kart kaydı yalnız bu tarayıcıda durur. */
(function () {
  'use strict';
  var V = window.DG_LEZZET; if (!V) { return; }
  var kok = document.documentElement.dataset.kok || './', K = window.dgKayit, bildir = window.prototipBildir, SAYFA = 24;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var bul = function (slug) { return V.lezzetler.filter(function (e) { return e.slug === slug; })[0]; };
  var gorsel = function (e) { return (e.gorsel || '').split('{{kok}}').join(kok); };

  /* Kart: canlı DOM kalıbı */
  var kart = function (e) {
    var alan = { slug: e.slug, gorsel: gorsel(e), sure: kac(e.sure), kat: kac(e.katAd), ad: kac(e.ad), ozet: kac(e.ozet), yazar: kac(e.yazar), tarih: kac(e.tarih) };
    var h = V.kalip.split('{{kok}}').join(kok).replace(/%(\w+)%/g, function (m, k) { return k in alan ? alan[k] : m; });
    return K.var('favori', 'lezzet-' + e.slug) ? h.replace('fa-regular fa-heart', 'fa-solid fa-heart') : h;
  };
  var kalpBoya = function (b, on) { var i = $('i', b); if (i) { i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart'; } b.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  document.addEventListener('click', function (ev) {
    var s = ev.target.closest && ev.target.closest('.ke-stop[data-slug] .disc-save'); if (!s) { return; }
    ev.preventDefault(); ev.stopPropagation(); if (!window.dgUye()) { return; }
    var slug = s.closest('[data-slug]').dataset.slug, id = 'lezzet-' + slug, x = bul(slug);
    if (K.var('favori', id)) { K.sil('favori', id); kalpBoya(s, false); } else { K.ekle('favori', { id: id, tur: 'Lezzet', ad: x.ad, mekan: x.katAd }); kalpBoya(s, true); bildir('Gurme Favorilerim\'e eklendi.'); }
  }, true);

  /* Ana sayfa rayı: liste sayfasının kartı, canlı "En Yeni" sırası. Kendi kapağı olan yazılar: canlıda kapaksız yazılar ortak yedek görseli taşır, rayda yan yana tekrar etmesin */
  var ray = $('#glTrack');
  if (ray) {
    var say = {}; V.lezzetler.forEach(function (e) { say[e.gorsel] = (say[e.gorsel] || 0) + 1; });
    ray.innerHTML = V.lezzetler.filter(function (e) { return say[e.gorsel] === 1; }).slice(0, +ray.dataset.adet || 8).map(kart).join('');
    return;
  }

  /* Detay sayfası */
  var kolon = $('.art-col');
  if (kolon) {
    var ornek = kolon.dataset.ornek, e = bul(new URLSearchParams(location.search).get('l')) || bul(ornek);
    document.title = e.ad + ' · Dada Gourmet';
    if (e.slug !== ornek) {
      var hero = $('.art-hero'), kat = V.secenek.filter(function (s) { return s.deger === e.kat; })[0];
      var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'], t = e.tarih.split('.');
      /* Kaydırma katmanı kapağı kendi öğesine kopyalar: ikisi de yazılır */
      var kapak = function () { var u = 'url("' + gorsel(e) + '")', px = $('.px-media', hero); hero.style.backgroundImage = u; if (px) { px.style.backgroundImage = u; } };
      kapak(); window.addEventListener('load', kapak);
      $('.rd-crumb b').textContent = e.ad; $('.art-hero h1').textContent = e.ad;
      $('.art-cat').innerHTML = '<i class="' + (kat ? kat.ikon : 'fa-solid fa-pen-nib') + '" aria-hidden="true"></i>' + kac(e.katAd);
      var st = $$('.art-hstat'); st[0].lastChild.nodeValue = ' ' + t[0] + ' ' + AY[+t[1] - 1] + ' ' + t[2]; st[1].lastChild.nodeValue = ' ' + e.sure;
      /* Güncelleme tarihi ve görüntülenme yalnız örnek yazının canlı kaydında var */
      st.slice(2).forEach(function (x) { var ay = x.previousElementSibling; if (ay && ay.classList.contains('art-hsep')) { ay.parentNode.removeChild(ay); } x.parentNode.removeChild(x); });
      /* Tam metin yalnız örnek yazıda var: kalan yazılarda canlı kart özeti durur */
      $$(':scope > :not(.ptr)', kolon).forEach(function (x) { x.parentNode.removeChild(x); });
      $('.ptr', kolon).insertAdjacentHTML('beforebegin', '<p>' + kac(e.ozet) + '</p><p>Prototipte bu yazının yalnız özeti var. <span class="ornek-etiket">prototip örneği</span></p>');
    }
    /* Etiketler: canlı detayın `#tagTrack` satırı (`lezzet-veri.mjs` her yazı için çeker). Canlıda etiket listeye gider; prototipte listenin `?q=` aramasına (canlı liste de bu parametreyi tanır).
       Etiketi olmayan yazıda canlı gibi etiket satırı basılmaz, Paylaş yalnız kalır */
    var iz = $('#tagTrack');
    if ((e.etiket || []).length) { iz.innerHTML = e.etiket.map(function (x) { return '<a class="chip" href="' + kok + 'gurme-lezzetler/?q=' + encodeURIComponent(x) + '"><i class="fa-solid fa-tag" aria-hidden="true"></i> ' + kac(x) + '</a>'; }).join(''); }
    else { $$('.ptr-lbl, .ptr-rail', kolon).forEach(function (x) { x.parentNode.removeChild(x); }); }
    /* Paylaşılan adres bu prototipteki yazı; canlı bağ (dadagourmet.com/gurme-lezzetler/<slug>) Faz 4'te yerine geçer */
    var adres = location.origin + location.pathname + '?l=' + e.slug, ad = encodeURIComponent(e.ad), ua = encodeURIComponent(adres);
    $('.psh-pop .xx').href = 'https://twitter.com/intent/tweet?url=' + ua + '&text=' + ad; $('.psh-pop .wa').href = 'https://wa.me/?text=' + ad + '%20' + ua; $('.psh-pop .ml').href = 'mailto:?subject=' + ad + '&body=' + ua; $('#pshCopy').dataset.copy = adres;
    var yer = $('#lzIlgili'), ilgili = e.slug === ornek ? yer.dataset.ilgili.split(',').map(bul).filter(Boolean) : V.lezzetler.filter(function (x) { return x.kat === e.kat && x.slug !== e.slug; }).slice(0, 3);
    yer.innerHTML = ilgili.map(kart).join('');
    /* Etiket rayı ve paylaş: canlı sayfa betiği. Paylaş: cihazın paylaşım penceresi (Web Share) varsa o açılır; yoksa canlı menü (X, WhatsApp, e-posta, bağlantıyı kopyala) */
    $$('.ptr .row-nav button').forEach(function (b) { b.addEventListener('click', function () { var r = document.getElementById(b.getAttribute('data-track')); if (r) { r.scrollBy({ left: b.getAttribute('data-dir') === 'prev' ? -220 : 220, behavior: 'smooth' }); } }); });
    var sh = $('#ptrShare'), dugme = $('#pshBtn'), cp = $('#pshCopy');
    var menu = function (on) { sh.classList.toggle('open', on); dugme.setAttribute('aria-expanded', on ? 'true' : 'false'); };
    dugme.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (navigator.share) { navigator.share({ title: e.ad, url: adres }).catch(function () { /* kullanıcı vazgeçti */ }); return; }
      menu(!sh.classList.contains('open'));
    });
    document.addEventListener('click', function (ev) { if (!ev.target.closest('#ptrShare')) { menu(false); } });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && sh.classList.contains('open')) { menu(false); dugme.focus(); } });
    var olmadi = function () { bildir('Bağlantı kopyalanamadı; adres çubuğundan kopyalayabilirsin.'); };
    cp.addEventListener('click', function (ev) {
      ev.preventDefault();
      var tamam = function () { var i = $('i', cp); cp.classList.add('ok'); i.className = 'fa-solid fa-check'; bildir('Bağlantı kopyalandı.'); setTimeout(function () { cp.classList.remove('ok'); i.className = 'fa-solid fa-link'; }, 1500); };
      try { navigator.clipboard.writeText(cp.dataset.copy || location.href).then(tamam, olmadi); } catch (h) { olmadi(); }
    });
    return;
  }

  /* Liste */
  var grid = $('#lzGrid'); if (!grid) { return; }
  /* Arama `?q=`: canlı liste parametresi; çip, sıralama ve sayfa bağları onu taşır. Prototipte başlık, özet, kategori ve etiketlerde arar (etiket bağları buraya gelir) */
  var kategori = '', sira = 'yeni', sayfa = 1, aranan = '', taban = kok + 'gurme-lezzetler/';
  var kucuk = function (t) { return String(t).toLocaleLowerCase('tr'); };
  var adres = function (k, s, n) { var q = []; if (s !== 'yeni') { q.push('siralama=' + s); } if (k) { q.push('kategori=' + k); } if (aranan) { q.push('q=' + encodeURIComponent(aranan)); } if (n > 1) { q.push('sayfa=' + n); } return taban + (q.length ? '?' + q.join('&') : ''); };
  var oku = function () { var q = new URLSearchParams(location.search), k = q.get('kategori') || ''; kategori = V.secenek.some(function (s) { return s.deger === k; }) ? k : ''; sira = q.get('siralama') === 'populer' ? 'populer' : 'yeni'; sayfa = Math.max(1, parseInt(q.get('sayfa'), 10) || 1); aranan = (q.get('q') || '').trim(); };
  var uyar = function (e) { if (kategori && e.kat !== kategori) { return false; } if (!aranan) { return true; } var a = kucuk(aranan); return [e.ad, e.ozet, e.katAd].concat(e.etiket || []).some(function (x) { return kucuk(x).indexOf(a) >= 0; }); };
  var numaralar = function (top) { var l = []; for (var i = 1; i <= top; i++) { if (i <= 3 || i === top || Math.abs(i - sayfa) <= 1) { l.push(i); } } return l; };
  var sayfalama = function (n, top) {
    var yer = $('#pagi'); yer.hidden = top < 2; if (top < 2) { yer.innerHTML = ''; return; }
    var ok = function (yon, ad) { var i = sayfa + yon, kapali = i < 1 || i > top, ikon = '<i class="fa-solid fa-chevron-' + (yon < 0 ? 'left' : 'right') + '" aria-hidden="true"></i>'; return kapali ? '<button class="pg arrow" type="button" aria-label="' + ad + '" disabled>' + ikon + '</button>' : '<a class="pg arrow" href="' + adres(kategori, sira, i) + '" aria-label="' + ad + '">' + ikon + '</a>'; };
    var s = ok(-1, 'Önceki sayfa'), onceki = 0;
    numaralar(top).forEach(function (i) { if (i - onceki > 1) { s += '<span class="pg-dots">…</span>'; } s += i === sayfa ? '<button class="pg active" type="button" aria-current="page">' + i + '</button>' : '<a class="pg" href="' + adres(kategori, sira, i) + '">' + i + '</a>'; onceki = i; });
    yer.innerHTML = s + ok(1, 'Sonraki sayfa') + '<span class="pagi-note" id="pagiNote">' + n + ' içerik · sayfa ' + sayfa + ' / ' + top + '</span>';
  };
  var yenile = function () {
    var l = V.lezzetler.filter(uyar);
    /* Veri canlının "En Yeni" sırasında gelir; "En Çok Okunan" sırası `oku` alanındadır */
    if (sira === 'populer') { l = l.slice().sort(function (a, b) { return a.oku - b.oku; }); }
    var top = Math.max(1, Math.ceil(l.length / SAYFA)); sayfa = Math.min(sayfa, top);
    grid.innerHTML = l.slice((sayfa - 1) * SAYFA, sayfa * SAYFA).map(kart).join('');
    sayfalama(l.length, top);
    $('#lzBos').classList.toggle('show', !l.length);
    var ar = $('#lzArama'); ar.hidden = !aranan;
    if (aranan) { ar.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> <b>“' + kac(aranan) + '”</b> için ' + l.length + ' içerik <a href="' + taban + (kategori ? '?kategori=' + kategori : '') + '">Aramayı temizle</a>'; }
    $$('.ke-filter .chip').forEach(function (a) { var k = a.dataset.kategori, on = k === kategori; a.classList.toggle('active', on); a.href = adres(k, sira, 1); });
    $$('.disc-tabs .dt').forEach(function (a) { var s = a.dataset.sira; a.classList.toggle('active', s === sira); a.href = adres(kategori, s, 1); });
  };
  oku(); yenile();
  /* Kabuğun `.dt` sekme dinleyicisi öğede durur: geçiş yakalama evresinde alınır */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('#keListMain a.chip[href], #keListMain a.dt[href]'); if (!a) { return; }
    ev.preventDefault(); ev.stopPropagation(); if (a.classList.contains('active')) { return; }
    if (a.classList.contains('chip')) { kategori = a.dataset.kategori; } else { sira = a.dataset.sira; }
    sayfa = 1; history.pushState({ keSpa: true }, '', adres(kategori, sira, 1)); yenile();
  }, true);
  window.addEventListener('popstate', function () { oku(); yenile(); });

  /* Kategori şeridi: kenar gölgesi ve tekerlek, canlı sayfa betiği */
  $$('.ke-filter').forEach(function (r) {
    var guncel = function () { var en = r.scrollWidth - r.clientWidth; r.classList.toggle('can-scroll-left', r.scrollLeft > 4); r.classList.toggle('can-scroll-right', r.scrollLeft < en - 4); };
    guncel(); r.addEventListener('scroll', guncel, { passive: true }); window.addEventListener('resize', guncel);
    r.addEventListener('wheel', function (ev) { if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) { r.scrollLeft += ev.deltaY; ev.preventDefault(); } }, { passive: false });
    var a = $('.chip.active', r); if (a && a.dataset.kategori) { r.scrollLeft = a.offsetLeft - r.offsetLeft - 16; }
  });
})();
