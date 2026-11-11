/* Gurme Panelim › Gurme Favorilerim: ekle, çıkar, süz (favori ajanı, 11 Kas; Beyar: "buradan ekleyip çıkarabilelim").
   - TEK DEPO `dgKayit('favori')` (prototip.js, yalnız bu tarayıcıda). Aynı kayıtları mekân kartındaki kaydet (`mekanlar.js`), mekân detayındaki
     kaydet ve Ne Yenir tabak favorisi (`mekan-eylem.js`), etkinlik ve lezzet kalpleri yazar. Kimlik `mekan-<slug>`, `tabak-<tabak>`,
     `etkinlik-<slug>`, `lezzet-<slug>`; alanlar `tur`, `ad`, `mekan` (mevcut alanlar, yeni alan yok). Canlı karşılığı: mekân favorisi
     `kesif_kaydedilen_mekanlar` tür favori (`POST|DELETE /mekan/{mekan}/kaydet`); tabak favorisi doküman maddesi (Ne Yenir imza tabakları).
   - Çıkar: kanon `.satir-dugme` (Etkinliklerim "Kaldır" kalıbı). Satır kalkar, sayaçlar (bölüm rozeti, çip sayıları, kimlik kartı) güncellenir,
     kanon geri alma şeridi (`.geri-al`) çıkar; Geri al kaydı eski sırasına koyar. Son kayıt çıkınca kanon boş durum + "Mekânları keşfet".
   - Favori ekle: kanon pencere, denetleyici `dgDiyalog` (prototip.js: odak tuzağı, Esc, kaydırma kilidi, kapanınca odak düğmeye döner).
     Mekân adı aranır (`mekan-liste-veri.js` gerçek kayıtları, pencere ilk açılınca yüklenir). Ne Yenir verisi olan mekânda (prototipte yalnız
     Mikla) imza tabakları mekân sayfasının kendi düğmelerinden okunur; uydurma tabak adı yok.
   - Sekme yerinde değişince (`dg:sekme`, sekme-gecis.js) yalnız çizim yenilenir; dinleyiciler belgeye bir kez bağlıdır. */
(function () {
  'use strict';
  var K = window.dgKayit; if (!K) { return; }
  var kok = document.documentElement.dataset.kok || './';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var tr = function (t) { return String(t || '').toLocaleLowerCase('tr'); };
  var bildir = window.prototipBildir || function () {};
  var ET = '<span class="ornek-etiket">prototip örneği</span> ';
  var TUR = { 'Mekân': { ikon: 'fa-utensils', suzgec: 'mekan' }, 'Tabak': { ikon: 'fa-bowl-food', suzgec: 'tabak' }, 'Etkinlik': { ikon: 'fa-calendar-days' }, 'Lezzet': { ikon: 'fa-book-open' } };
  /* Ne Yenir imza tabağı olan mekânın sayfası. Prototipte yalnız Mikla'nın Ne Yenir örneği var; öbür mekânda tabak bölümü gösterilmez */
  var NE_YENIR = { mikla: 'mekan/mikla/' };
  var suzgec = 'tumu', son = null;

  /* ---- Liste ---- */
  var sonra = function (id, on) { return id.indexOf(on) === 0 ? id.slice(on.length) : ''; };
  /* Prototipte tek mekân detayı Mikla (mekân kartları da oraya açılır); tabak satırı detaydaki Ne Yenir sekmesini açar (MD-12) */
  var bag = function (k) {
    if (k.tur === 'Tabak') { return kok + 'mekan/mikla/?tab=ne-yenir'; }
    if (k.tur === 'Etkinlik') { return kok + 'etkinlik-detay/?e=' + encodeURIComponent(sonra(k.id, 'etkinlik-')); }
    if (k.tur === 'Lezzet') { return kok + 'gurme-lezzet-detay/?l=' + encodeURIComponent(sonra(k.id, 'lezzet-')); }
    return kok + 'mekan/mikla/';
  };
  var satir = function (k) {
    var t = TUR[k.tur] || TUR['Mekân'];
    /* Tabak adları Mikla Ne Yenir örneğinden: her zaman örnek etiketli */
    return '<div class="kalem-satiri tiklanir" data-favori="' + kac(k.id) + '"><span class="ks-ikon"><i class="fa-solid ' + t.ikon + '" aria-hidden="true"></i></span>' +
      '<span class="ks-metin"><b>' + (k.ornek || k.tur === 'Tabak' ? ET : '') + '<a href="' + bag(k) + '">' + kac(k.ad) + '</a></b><small>' + kac(k.tur + (k.mekan ? ' · ' + k.mekan : '')) + '</small></span>' +
      '<span class="ks-uc"><span class="rozet pasif">' + kac(k.tur) + '</span><button class="satir-dugme" type="button" data-favori-cikar="' + kac(k.id) + '" aria-label="' + kac(k.ad) + ': favorilerden çıkar"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Çıkar</button></span></div>';
  };
  var bos = function (hic) {
    var b = hic ? ['fa-regular fa-heart', 'Henüz favorin yok', 'Mekân kartındaki kaydet düğmesi, mekân sayfasındaki Ne Yenir tabakları ve yukarıdaki Favori ekle bu listeyi doldurur.']
      : suzgec === 'tabak' ? ['fa-solid fa-bowl-food', 'Henüz favori tabağın yok', 'Mekân sayfasındaki Ne Yenir bölümünden ya da Favori ekle ile imza tabak ekleyebilirsin.']
        : ['fa-solid fa-utensils', 'Henüz favori mekânın yok', 'Mekân kartındaki kaydet düğmesiyle ya da Favori ekle ile mekân ekleyebilirsin.'];
    return '<div class="bos-durum"><span class="bos-ikon"><i class="' + b[0] + '" aria-hidden="true"></i></span><h4>' + b[1] + '</h4><p>' + b[2] + '</p>' +
      '<a class="dugme birincil" href="' + kok + 'mekanlar/"><i class="fa-solid fa-compass" aria-hidden="true"></i> Mekânları keşfet</a></div>';
  };
  /* Sayaçlar: bölüm rozeti, çip sayıları, kimlik kartındaki "Favori N" (her Gurme Panelim sekmesinde) */
  var sayaclar = function (l) {
    var say = { tumu: l.length, mekan: 0, tabak: 0 };
    l.forEach(function (k) { var s = (TUR[k.tur] || {}).suzgec; if (s) { say[s]++; } });
    $$('[data-favori-sayac]').forEach(function (e) { e.textContent = l.length + ' favori'; });
    $$('[data-favori-cip-sayi]').forEach(function (e) { e.textContent = say[e.getAttribute('data-favori-cip-sayi')]; });
    $$('[data-favori-sayi]').forEach(function (e) { e.innerHTML = '<i class="fa-solid fa-heart" aria-hidden="true"></i> Favori ' + l.length; });
  };
  var ciz = function () {
    var l = K.oku('favori'), liste = $('[data-favori-liste]');
    sayaclar(l);
    if (!liste) { return; }
    $$('[data-favori-suzgec]').forEach(function (c) { var on = c.getAttribute('data-favori-suzgec') === suzgec; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var gor = l.filter(function (k) { return suzgec === 'tumu' || (TUR[k.tur] || {}).suzgec === suzgec; });
    liste.innerHTML = gor.length ? gor.map(satir).join('') : bos(!l.length);
  };

  /* ---- Çıkar ve geri al ---- */
  var serit = function (k) {
    var s = $('[data-favori-geri-serit]');
    if (!k) { if (s) { s.parentNode.removeChild(s); } return; }
    if (!s) { var kart = $('.favori-kart'); if (!kart) { return; } kart.insertAdjacentHTML('beforebegin', '<div class="geri-al favori-geri-al" data-favori-geri-serit="" role="status"></div>'); s = $('[data-favori-geri-serit]'); }
    s.innerHTML = '<span><b>' + kac(k.ad) + '</b> favorilerden çıkarıldı.</span><button type="button" data-favori-geri="">Geri al</button>';
  };
  var cikar = function (id) {
    var l = K.oku('favori'), i = -1;
    l.forEach(function (k, j) { if (k.id === id) { i = j; } }); if (i < 0) { return; }
    son = { k: l[i], i: i }; K.sil('favori', id);
    ciz(); serit(son.k);
    var g = $('[data-favori-geri]'); if (g) { g.focus(); }
  };
  /* Kayıt eski sırasına döner: depo yalnız başa ekler, önündeki kayıtlar çekilip yeniden konur */
  var geriAl = function () {
    if (!son) { return; } var k = son.k, i = son.i; son = null;
    if (!K.var('favori', k.id)) {
      var once = K.oku('favori').slice(0, i);
      once.forEach(function (x) { K.sil('favori', x.id); }); K.ekle('favori', k); once.reverse().forEach(function (x) { K.ekle('favori', x); });
    }
    serit(null); ciz();
    var b = $('[data-favori-cikar="' + kac(k.id) + '"]'); if (b) { b.focus(); }
    bildir('Favorilerine geri alındı.');
  };

  /* ---- Favori ekle penceresi ---- */
  var pen = null, V = null, ilAd = {}, secili = '', tabaklar = {};
  var yer = function (m) { return [m.ilce, ilAd[(m.f.il || [])[0]]].filter(Boolean).join(', '); };
  var kurPencere = function () {
    if (pen) { return; }
    document.body.insertAdjacentHTML('beforeend', '<div class="fb-overlay" id="fvOrtu"></div>' +
      '<div class="fb-modal favori-pencere" id="fvPencere" role="dialog" aria-modal="true" aria-labelledby="fvBaslik" aria-describedby="fvAlt" inert="">' +
      '<div class="fb-panel"><div class="fb-head"><div><h3 id="fvBaslik">Favori ekle</h3><p id="fvAlt">Mekân adını yaz, favorine ekle. Ne Yenir tabakları olan mekânda imza tabaklarını da buradan eklersin.</p></div>' +
      '<button class="fb-close" type="button" data-favori-kapat="" aria-label="Kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
      '<div class="fb-body"><div class="arama favori-ara" role="search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
      '<input class="arama-girdi" type="search" id="fvAra" placeholder="Mekân adı yaz…" aria-label="Mekân adı ara" aria-controls="fvSonuc" aria-describedby="fvDurum" autocomplete="off"></div>' +
      '<p class="kart-sayac favori-durum" id="fvDurum" role="status" aria-live="polite"></p><div class="fp-list favori-sonuc" id="fvSonuc"></div></div></div></div>');
    pen = window.dgDiyalog('fvPencere', 'fvOrtu');
  };
  var veriYukle = function (bitti) {
    var hazir = function () { V = window.DG_LISTE; V.secenek.il.forEach(function (o) { ilAd[o.deger] = o.ad; }); bitti(); };
    if (window.DG_LISTE) { hazir(); return; }
    var s = document.createElement('script'); s.src = kok + 'assets/js/mekan-liste-veri.js';
    s.onload = hazir; s.onerror = function () { var d = $('#fvDurum'); if (d) { d.textContent = 'Mekân listesi yüklenemedi. Pencereyi kapatıp yeniden dene.'; } };
    document.head.appendChild(s);
  };
  /* Tabak adları mekân sayfasındaki Ne Yenir düğmelerinden (`data-favori-tabak`, `data-ad`); mekan-eylem.js ile aynı kimlik ve ad */
  var tabakYukle = function (slug, bitti) {
    if (tabaklar[slug]) { bitti(); return; }
    var x = new XMLHttpRequest(); x.open('GET', new URL(kok + NE_YENIR[slug], document.baseURI).href); x.responseType = 'document';
    x.onload = function () {
      var d = x.status >= 200 && x.status < 300 ? x.responseXML : null;
      tabaklar[slug] = d ? $$('[data-favori-tabak]', d).map(function (b) { return { id: b.getAttribute('data-favori-tabak'), ad: (b.getAttribute('data-ad') || '').replace(/^Örnek tabak: /, '') }; }).filter(function (t) { return t.id && t.ad; }) : [];
      bitti();
    };
    x.onerror = function () { tabaklar[slug] = []; bitti(); };
    x.send();
  };
  var dugme = function (on, ek, ad) {
    return on ? '<button class="satir-dugme" type="button" disabled><i class="fa-solid fa-check" aria-hidden="true"></i> Favoride</button>'
      : '<button class="satir-dugme" type="button" ' + ek + ' aria-label="' + kac(ad) + ': favoriye ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Ekle</button>';
  };
  var tabakBlok = function (m) {
    var l = tabaklar[m.slug];
    if (!l) { return '<div class="favori-tabaklar" id="fvTabak-' + m.slug + '"><p class="favori-tabak-bas">Ne Yenir tabakları yükleniyor…</p></div>'; }
    if (!l.length) { return ''; }
    return '<div class="favori-tabaklar" id="fvTabak-' + m.slug + '" role="group" aria-label="' + kac(m.ad) + ' Ne Yenir imza tabakları"><p class="favori-tabak-bas"><i class="fa-solid fa-utensils" aria-hidden="true"></i> ' + kac(m.ad) + ' · Ne Yenir imza tabakları ' + ET + '</p>' +
      l.map(function (t) {
        return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid fa-bowl-food" aria-hidden="true"></i></span><span class="ks-metin"><b>' + kac(t.ad) + '</b><small>Tabak · ' + kac(m.ad) + '</small></span>' +
          '<span class="ks-uc">' + dugme(K.var('favori', 'tabak-' + t.id), 'data-favori-tabak-ekle="' + kac(t.id) + '" data-mekan="' + m.slug + '"', t.ad) + '</span></div>';
      }).join('') + '</div>';
  };
  var aday = function (m) {
    var ny = NE_YENIR[m.slug], ac = secili === m.slug, alt = kac(yer(m));
    var metin = ny ? '<button type="button" class="ks-metin favori-sec" data-favori-sec="' + m.slug + '" aria-expanded="' + (ac ? 'true' : 'false') + '" aria-controls="fvTabak-' + m.slug + '"><b>' + kac(m.ad) + '</b><small>' + alt + ' · Ne Yenir tabakları <i class="fa-solid fa-chevron-' + (ac ? 'up' : 'down') + '" aria-hidden="true"></i></small></button>'
      : '<span class="ks-metin"><b>' + kac(m.ad) + '</b><small>' + alt + '</small></span>';
    return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid fa-utensils" aria-hidden="true"></i></span>' + metin +
      '<span class="ks-uc">' + dugme(K.var('favori', 'mekan-' + m.slug), 'data-favori-mekan="' + m.slug + '"', m.ad) + '</span></div>' + (ny && ac ? tabakBlok(m) : '');
  };
  var EN_COK = 8;
  var bulunan = function () {
    var q = tr(($('#fvAra') || {}).value || '').trim(); if (!q || !V) { return { q: q, l: [] }; }
    var l = V.mekanlar.filter(function (m) { return tr(m.ad).indexOf(q) > -1; });
    l.sort(function (a, b) { return (tr(a.ad).indexOf(q) === 0 ? 0 : 1) - (tr(b.ad).indexOf(q) === 0 ? 0 : 1) || a.ad.localeCompare(b.ad, 'tr'); });
    return { q: q, l: l };
  };
  var ara = function (durum) {
    var d = $('#fvDurum'), s = $('#fvSonuc'); if (!d || !s) { return; }
    if (!V) { d.textContent = 'Mekânlar yükleniyor…'; s.innerHTML = ''; return; }
    var b = bulunan(), g = b.l.slice(0, EN_COK);
    if (secili && !g.some(function (m) { return m.slug === secili; })) { secili = ''; }
    d.textContent = durum || (!b.q ? V.mekanlar.length + ' mekân içinde ara. Mekân adının birkaç harfini yaz.'
      : !b.l.length ? 'Aramana uyan mekân yok. Başka bir ad dene.'
        : b.l.length > EN_COK ? b.l.length + ' mekân bulundu, ilk ' + EN_COK + ' tanesi gösteriliyor.' : b.l.length + ' mekân bulundu.');
    s.innerHTML = g.map(aday).join('');
  };
  var bul = function (slug) { return V ? V.mekanlar.filter(function (m) { return m.slug === slug; })[0] : null; };
  var sec = function (slug, odak) {
    secili = slug; ara();
    if (slug && NE_YENIR[slug] && !tabaklar[slug]) { tabakYukle(slug, function () { if (secili === slug) { ara(); var o = odak && odak(); if (o) { o.focus(); } } }); }
  };
  var ac = function () {
    kurPencere(); pen.ac();
    var g = $('#fvAra'); g.focus();
    if (!V) { ara(); veriYukle(function () { ara(); }); } else { ara(); }
  };

  /* ---- Dinleyiciler: belgeye bir kez ---- */
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) { return; }
    var c = t.closest('[data-favori-cikar]'); if (c) { e.preventDefault(); cikar(c.getAttribute('data-favori-cikar')); return; }
    if (t.closest('[data-favori-geri]')) { e.preventDefault(); geriAl(); return; }
    var z = t.closest('[data-favori-suzgec]'); if (z) { suzgec = z.getAttribute('data-favori-suzgec'); ciz(); return; }
    if (t.closest('[data-favori-ekle]')) { e.preventDefault(); ac(); return; }
    if (!pen) { return; }
    if (t.closest('[data-favori-kapat]') || t.id === 'fvOrtu' || t.id === 'fvPencere') { pen.kapa(); return; }
    var s = t.closest('[data-favori-sec]');
    if (s) { var sl = s.getAttribute('data-favori-sec'), yeni = secili === sl ? '' : sl; sec(yeni, function () { return $('[data-favori-sec="' + sl + '"]'); }); var sb = $('[data-favori-sec="' + sl + '"]'); if (sb) { sb.focus(); } return; }
    var mb = t.closest('[data-favori-mekan]');
    if (mb) {
      var m = bul(mb.getAttribute('data-favori-mekan')); if (!m) { return; }
      if (!K.var('favori', 'mekan-' + m.slug)) { K.ekle('favori', { id: 'mekan-' + m.slug, tur: 'Mekân', ad: m.ad, mekan: yer(m) }); }
      ciz();
      var ilkTabak = function () { return $('#fvTabak-' + m.slug + ' [data-favori-tabak-ekle]'); };
      if (NE_YENIR[m.slug]) { sec(m.slug, ilkTabak); } else { ara(); }
      ara(m.ad + ' favorilerine eklendi.');
      var o = ilkTabak() || $('#fvAra'); if (o) { o.focus(); }
      return;
    }
    var tb = t.closest('[data-favori-tabak-ekle]');
    if (tb) {
      var tm = bul(tb.getAttribute('data-mekan')), tid = tb.getAttribute('data-favori-tabak-ekle');
      var tt = tm && (tabaklar[tm.slug] || []).filter(function (x) { return x.id === tid; })[0]; if (!tt) { return; }
      if (!K.var('favori', 'tabak-' + tid)) { K.ekle('favori', { id: 'tabak-' + tid, tur: 'Tabak', ad: tt.ad, mekan: tm.ad }); }
      ciz(); ara(tt.ad + ' favorilerine eklendi.');
      var sira = $('#fvTabak-' + tm.slug + ' [data-favori-tabak-ekle]'); (sira || $('#fvAra')).focus();
    }
  });
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'fvAra') { ara(); } });
  /* Sekme yerinde değişti: yeni içerik süzgeçsiz çizilir, eski geri alma şeridi yeni içerikle birlikte gitti */
  document.addEventListener('dg:sekme', function () { suzgec = 'tumu'; son = null; ciz(); });
  /* Başka sekmede (ör. mekân kartında) değişen favori buraya da yansır; geri tuşuyla önbellekten dönülünce de */
  window.addEventListener('storage', function (e) { if (e.key === 'dg-kayit') { ciz(); } });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { ciz(); } });
  ciz();
})();
