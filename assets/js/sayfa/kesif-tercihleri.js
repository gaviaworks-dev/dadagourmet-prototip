/* Keşif Tercihlerim (profil turu H6; mutfak H6 Seçenek A ve bütün sekmeler H6b, kesif ajanı 11 Kas): tek bileşen ailesi ve tek kaydet akışı.
   - Sekme: tıklama, ← → Home End, `#kt-<alan>` derin bağ.
   - Kart düzeni `data-duzen`: `akordeon` (mutfak, mekân türü, şehir), `izgara` (etkinlik, beslenme, alerjen, ortam), `aralik` (fiyat).
   - Çip `aria-pressed`; "Fark etmez" (`data-tekil`) tek başına seçilir.
   - Akordeon: kanon §21 TEK AÇIK KALEM (bir grup açılınca öbürü kapanır, açık olana basmak kapatır), kapalı gövde `inert`, başlıkta
     ↑ ↓ Home End, kapalı başlıkta seçilenlerin adı, "Tümünü seç". Arama bütün gruplarda: akordeon gizlenir, eşleşenler grup başlıklı
     düz listede (aynı çipin kopyası); mutfakta ülke adıyla da bulur ("Japonya" → Japon Mutfağı); grup adıyla grubun hepsi; Esc temizler.
   - Fiyat aralığı: değer [en düşük, en yüksek] seviye ('1'-'4', sitenin fiyat ölçeği) ya da ['onemli-degil']. Kademe kartında ilk dokunuş
     alt ucu, ikinci dokunuş üst ucu seçer (aynı karta ikinci dokunuş tek seviye). İki `role=slider` tutamak: ← → ↑ ↓ Home End, sürükleme.
   - Değişiklik taslakta birikir; alttaki çubuk kaç alanın değiştiğini söyler, tek düğmeyle kaydeder ya da geri alır.
   - Kayıt yalnız bu tarayıcıda (`localStorage` dg-kesif-tercihleri-3); prototipte sunucuya gitmez. Eski kayıtlar açılışta taşınır:
     `-2` anahtarı; mutfak adı → kod (`DG_MUTFAK.eski`); fiyatın canlı 3 kademeli tek değeri → aynı alt ve üst uç
     (₺ Ekonomik → 1, ₺₺ Orta → 2, ₺₺₺ Üst Segment → 3 Üst Orta). */
(function () {
  'use strict';
  var form = document.querySelector('form[data-kesif-tercihleri]'); if (!form) { return; }
  var ANAHTAR = 'dg-kesif-tercihleri-3', ESKI_ANAHTAR = 'dg-kesif-tercihleri-2';
  var MUTFAK = window.DG_MUTFAK || { kalemler: [], eski: {} };
  var FIYAT_ESKI = { '₺ · Ekonomik': '1', '₺₺ · Orta': '2', '₺₺₺ · Üst Segment': '3' };
  var bildir = window.prototipBildir || function () {};
  var $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var ornek = {}; try { ornek = JSON.parse(document.getElementById('ktOrnek').textContent); } catch (e) { /* yok */ }
  var depoYaz = function (v) { try { localStorage.setItem(ANAHTAR, JSON.stringify(v)); } catch (e) { /* depo kapalı: sayfa içinde kalır */ } };
  var kopya = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---- Eski kayıt taşıma ---- */
  var mutfakKodlari = MUTFAK.kalemler.map(function (m) { return m.kod; });
  var mutfakKod = function (l) {
    var c = [];
    (l || []).forEach(function (v) { var kod = mutfakKodlari.indexOf(v) >= 0 ? v : MUTFAK.eski[v]; if (kod && c.indexOf(kod) < 0) { c.push(kod); } });
    return c;
  };
  var fiyatDuzelt = function (l) {
    l = l || [];
    if (l[0] === 'onemli-degil') { return ['onemli-degil']; }
    if (l.length === 1 && FIYAT_ESKI[l[0]]) { return [FIYAT_ESKI[l[0]], FIYAT_ESKI[l[0]]]; }
    if (l.length === 2 && /^[1-4]$/.test(l[0]) && /^[1-4]$/.test(l[1])) { return +l[0] <= +l[1] ? [l[0], l[1]] : [l[1], l[0]]; }
    return [];
  };
  var tasindi = false;
  var depoOku = function () {
    try {
      var v = JSON.parse(localStorage.getItem(ANAHTAR));
      if (!v) { v = JSON.parse(localStorage.getItem(ESKI_ANAHTAR)); tasindi = !!v; }
      if (!v) { return null; }
      var once = JSON.stringify(v);
      if (MUTFAK.kalemler.length) { v.mutfak = mutfakKod(v.mutfak); }
      v.fiyat = fiyatDuzelt(v.fiyat);
      if (JSON.stringify(v) !== once) { tasindi = true; }
      return v;
    } catch (e) { return null; }
  };
  var kartlar = $$('[data-tercih]', form);
  var alanlar = kartlar.map(function (k) { return k.getAttribute('data-tercih'); });
  var kart = function (a) { return form.querySelector('[data-tercih="' + a + '"]'); };
  var duzen = function (a) { return kart(a).getAttribute('data-duzen'); };
  var kayitli = depoOku() || kopya(ornek);
  alanlar.forEach(function (a) { kayitli[a] = kayitli[a] || []; });
  if (tasindi) { depoYaz(kayitli); } /* eski kayıt yeni biçime taşındı; eski anahtar silinmez */
  var taslak = kopya(kayitli);
  /* Sıra da önemli (fiyat [alt, üst]); çoklu seçimde küme eşitliği: iki yönlü içerme + aynı uzunluk */
  var esit = function (x, y) { return x.length === y.length && x.every(function (v) { return y.indexOf(v) >= 0; }) && y.every(function (v) { return x.indexOf(v) >= 0; }); };
  var esitAlan = function (a) { return duzen(a) === 'aralik' ? taslak[a].join() === kayitli[a].join() : esit(taslak[a], kayitli[a]); };

  /* Özet hapının etiketi: çipin `data-ad`ı (mutfakta değer kod, görünen ad başka) */
  var adlar = {};
  $$('.tercih-cip[data-ad]', form).forEach(function (c) { adlar[c.getAttribute('data-deger')] = c.getAttribute('data-ad'); });
  var etiket = function (v) { return adlar[v] || v; };
  var kademe = {};
  $$('[data-kademe]', form).forEach(function (c) { kademe[c.getAttribute('data-kademe')] = { ad: c.getAttribute('data-ad'), isaret: c.getAttribute('data-isaret') }; });
  var fiyatEtiket = function (d) {
    if (!d.length) { return ''; }
    if (d[0] === 'onemli-degil') { return 'Bütçe önemli değil'; }
    var x = kademe[d[0]], y = kademe[d[1]];
    return d[0] === d[1] ? x.isaret + ' · ' + x.ad : x.isaret + ' – ' + y.isaret + ' · ' + x.ad + ' – ' + y.ad;
  };
  var fiyatOzet = function (d) {
    if (!d.length) { return 'Henüz aralık seçmedin.'; }
    if (d[0] === 'onemli-degil') { return '<b>Bütçe önemli değil</b> · her fiyat seviyesini görürsün'; }
    var x = kademe[d[0]], y = kademe[d[1]];
    return d[0] === d[1] ? '<b>' + kac(x.isaret) + '</b> · yalnız ' + kac(x.ad) : '<b>' + kac(x.isaret) + ' – ' + kac(y.isaret) + '</b> · ' + kac(x.ad) + ' ile ' + kac(y.ad) + ' arası';
  };
  var haplar = function (a, d) { return duzen(a) === 'aralik' ? (d.length ? [['*', fiyatEtiket(d)]] : []) : d.map(function (x) { return [x, etiket(x)]; }); };
  var sayi = function (a, d) { return duzen(a) === 'aralik' ? (d.length ? 1 : 0) : d.length; };
  var ozetSayi = function (a, d) { return duzen(a) === 'aralik' ? (!d.length ? 'Seçim yok' : d[0] === 'onemli-degil' ? 'Bütçe önemli değil' : 'Aralık seçili') : d.length ? d.length + ' seçim' : 'Seçim yok'; };
  /* Odak: görünen ve `inert` olmayan ilk seçenek (kapalı akordeon gövdesi atlanır), yoksa kartın arama kutusu */
  var odakla = function (k) {
    var l = $$('.tercih-cip,[data-kademe],[data-akordeon-ara]', k).filter(function (c) { return c.offsetParent && !c.closest('[inert]'); });
    if (l[0]) { l[0].focus(); }
  };
  var akordeonCiz = {}; /* akordeon bloğu (aşağıda) alan başına doldurur */
  var fiyatCiz = null;

  /* ---- Sekmeler ---- */
  var sekmeler = $$('[role="tab"]', document.querySelector('nav[data-fit-tabs], nav.sekmeler[role="tablist"]'));
  var sekmeAc = function (b, odak) {
    sekmeler.forEach(function (x) {
      var on = x === b, p = document.getElementById(x.getAttribute('aria-controls'));
      x.classList.toggle('aktif', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
      if (p) { p.hidden = !on; p.classList.toggle('aktif', on); }
    });
    if (odak) { b.focus(); }
    b.scrollIntoView({ block: 'nearest', inline: 'center' });
    /* Gizli panelde ölçülemeyen akordeon yüksekliği ve fiyat rayı görünür olunca yeniden yazılır */
    Object.keys(akordeonCiz).forEach(function (a) { akordeonCiz[a](); });
    if (fiyatCiz) { fiyatCiz(); }
  };
  sekmeler.forEach(function (b, i) {
    b.addEventListener('click', function () { sekmeAc(b); history.replaceState(null, '', '#' + b.dataset.tab); });
    b.addEventListener('keydown', function (e) {
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: sekmeler.length - 1 }[e.key];
      if (j === undefined) { return; }
      e.preventDefault(); var h = sekmeler[(j + sekmeler.length) % sekmeler.length]; sekmeAc(h, true); history.replaceState(null, '', '#' + h.dataset.tab);
    });
  });

  /* ---- Durumu ekrana yaz ---- */
  var ciz = function (a) {
    var k = kart(a), d = taslak[a];
    $$('.tercih-cip', k).forEach(function (c) { c.setAttribute('aria-pressed', d.indexOf(c.getAttribute('data-deger')) >= 0 ? 'true' : 'false'); });
    $$('[data-grup]', k).forEach(function (g) {
      var n = $$('.tercih-cip[aria-pressed="true"]', g).length, s = g.querySelector('[data-grup-sayi]');
      if (s) { s.textContent = n ? n + ' seçili' : ''; }
    });
    var say = k.querySelector('[data-ozet-sayi]'); if (say) { say.textContent = ozetSayi(a, d); }
    var oc = k.querySelector('[data-ozet-cipler]');
    if (oc) { oc.innerHTML = haplar(a, d).map(function (h) { return '<button class="cip hap tercih-secili" type="button" data-kaldir="' + kac(h[0]) + '" aria-label="' + kac(h[1]) + ': seçimi kaldır">' + kac(h[1]) + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'; }).join(''); }
    var t = k.querySelector('[data-temizle]'); if (t) { t.hidden = !d.length; }
    var ss = document.querySelector('[data-sekme-sayi="' + a + '"]'); if (ss) { ss.textContent = sayi(a, d) || ''; }
    var sr = document.querySelector('[data-serit="' + a + '"]'); if (sr) { sr.textContent = sayi(a, d); }
    if (akordeonCiz[a]) { akordeonCiz[a](); }
    if (duzen(a) === 'aralik' && fiyatCiz) { fiyatCiz(); }
  };
  var payOlc = function () {
    var c = form.querySelector('[data-kaydet-cubugu]');
    if (c && c.classList.contains('kirli')) { document.documentElement.style.setProperty('--tercih-kaydet-pay', Math.ceil(c.offsetHeight + (parseFloat(getComputedStyle(c).bottom) || 0)) + 8 + 'px'); }
  };
  window.addEventListener('resize', payOlc);
  var durum = function () {
    var degisen = alanlar.filter(function (a) { return !esitAlan(a); });
    var dolu = document.querySelector('[data-serit="dolu"]'); if (dolu) { dolu.textContent = alanlar.filter(function (a) { return taslak[a].length; }).length + '/' + alanlar.length; }
    var cubuk = form.querySelector('[data-kaydet-cubugu]'), yazi = form.querySelector('[data-kaydet-durum]');
    var once = cubuk.classList.contains('kirli');
    cubuk.classList.toggle('kirli', !!degisen.length);
    /* Dalga 2 mobil · hesap: `show` ortak alt-engel sözleşmesinin (bottom-clearance.js) işareti; Dada Route düğmesi (768'de çubuğun
       "Kaydet" düğmesinin üstüne biniyordu) çubuğun üstüne kalkar. `--tercih-kaydet-pay`: çubuğun ekranın dibinden kapladığı yükseklik,
       altbilgi sonuna o kadar pay verilir (gourmet-sapma.css) */
    cubuk.classList.toggle('show', !!degisen.length);
    payOlc();
    /* Çubuk belirip kaybolunca yüzen Mentör düğmesi yeniden ölçsün (mentor-fab.js `resize` dinler) */
    if (once !== !!degisen.length) { setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 320); }
    form.querySelector('[data-kaydet]').disabled = !degisen.length; form.querySelector('[data-vazgec]').disabled = !degisen.length;
    var ad = function (a) { var b = document.querySelector('[data-tab="kt-' + a + '"]'); return b ? b.textContent.replace(/\d+\s*$/, '').trim() : a; };
    yazi.innerHTML = degisen.length
      ? '<i class="fa-solid fa-pen" aria-hidden="true"></i> <span><b>' + degisen.length + ' alanda</b> kaydedilmemiş değişiklik: ' + kac(degisen.map(ad).join(', ')) + '</span>'
      : '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Tercihlerin kayıtlı</span>';
  };
  var hepsiniCiz = function () { alanlar.forEach(ciz); durum(); };

  /* ---- Etkileşim ---- */
  var degistir = function (a, yeni) { taslak[a] = yeni; ciz(a); durum(); };
  var fiyatBekliyor = false; /* fiyat: ilk dokunuştan sonra üst uç bekleniyor */
  form.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || !form.contains(t)) { return; }
    var k = t.closest('[data-tercih]'), a = k && k.getAttribute('data-tercih');
    if (t.classList.contains('tercih-cip')) {
      var v = t.getAttribute('data-deger'), d = taslak[a].slice(), i = d.indexOf(v);
      if (i >= 0) { d.splice(i, 1); }
      else if (t.hasAttribute('data-tekil')) { d = [v]; }
      else { var tek = k.querySelector('[data-tekil]'); if (tek) { d = d.filter(function (x) { return x !== tek.getAttribute('data-deger'); }); } d.push(v); }
      degistir(a, d);
    } else if (t.hasAttribute('data-kademe')) {
      var n = t.getAttribute('data-kademe'), f = taslak[a];
      if (fiyatBekliyor && f.length === 2 && f[0] !== 'onemli-degil') { degistir(a, +n < +f[0] ? [n, f[0]] : [f[0], n]); fiyatBekliyor = false; }
      else { degistir(a, [n, n]); fiyatBekliyor = true; }
      fiyatCiz();
    } else if (t.hasAttribute('data-fiyat-fark')) {
      fiyatBekliyor = false; degistir(a, taslak[a][0] === 'onemli-degil' ? [] : ['onemli-degil']);
    } else if (t.hasAttribute('data-kaldir')) {
      var kv = t.getAttribute('data-kaldir');
      fiyatBekliyor = false;
      degistir(a, kv === '*' ? [] : taslak[a].filter(function (x) { return x !== kv; }));
      odakla(k);
    } else if (t.hasAttribute('data-temizle')) {
      fiyatBekliyor = false; degistir(a, []); odakla(k);
    } else if (t.hasAttribute('data-mgrup-tumu')) {
      /* Grubun hepsi seçiliyse grubu kaldırır, değilse eksikleri ekler */
      var gk = $$('.tercih-cip', t.closest('[data-mgrup]')).map(function (c) { return c.getAttribute('data-deger'); });
      var hepsi = gk.every(function (x) { return taslak[a].indexOf(x) >= 0; });
      degistir(a, hepsi ? taslak[a].filter(function (x) { return gk.indexOf(x) < 0; }) : taslak[a].concat(gk.filter(function (x) { return taslak[a].indexOf(x) < 0; })));
    } else if (t.hasAttribute('data-vazgec')) {
      fiyatBekliyor = false; taslak = kopya(kayitli); hepsiniCiz(); bildir('Değişiklikler geri alındı.');
    }
  });
  var norm = function (s) { return String(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i'); };

  /* ---- Akordeon (mutfak, mekân türü, şehir) ---- */
  $$('[data-akordeon]', form).forEach(function (ak) {
    var mk = ak.closest('[data-tercih]'), alan = mk.getAttribute('data-tercih'), birim = ak.getAttribute('data-birim');
    var kalemler = $$('.akordeon-kalem', ak);
    var govde = function (k) { return k.querySelector('.akordeon-govde'); };
    var bas = function (k) { return k.querySelector('.akordeon-bas'); };
    var ozetYaz = function (k) {
      var cipler = $$('.tercih-cip', govde(k)), sec = cipler.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; });
      k.querySelector('[data-mgrup-sayi]').textContent = sec.length ? sec.length + ' seçili' : '';
      k.querySelector('[data-mgrup-ozet]').innerHTML = cipler.length + ' ' + kac(birim) + (sec.length && !k.classList.contains('acik') ? ' · <b>' + kac(sec.map(function (c) { return c.getAttribute('data-ad'); }).join(', ')) + '</b>' : '');
      var t = k.querySelector('[data-mgrup-tumu]'), hepsi = sec.length === cipler.length;
      t.querySelector('span').textContent = hepsi ? 'Seçimi kaldır' : 'Tümünü seç';
      t.querySelector('i').className = 'fa-solid ' + (hepsi ? 'fa-minus' : 'fa-check-double');
    };
    var yukseklik = function () { kalemler.forEach(function (k) { if (k.classList.contains('acik')) { govde(k).style.maxHeight = govde(k).scrollHeight + 'px'; } }); };
    var ac = function (k, acik) {
      var g = govde(k);
      k.classList.toggle('acik', acik); bas(k).setAttribute('aria-expanded', acik ? 'true' : 'false');
      g.inert = !acik; g.style.maxHeight = acik ? g.scrollHeight + 'px' : '0px';
      ozetYaz(k);
    };
    kalemler.forEach(function (k, i) {
      ac(k, k.classList.contains('acik'));
      bas(k).addEventListener('click', function () {
        var acikMiydi = k.classList.contains('acik');
        kalemler.forEach(function (x) { if (x.classList.contains('acik')) { ac(x, false); } });
        if (!acikMiydi) { ac(k, true); }
      });
      bas(k).addEventListener('keydown', function (e) {
        var j = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: kalemler.length - 1 }[e.key];
        if (j === undefined) { return; }
        e.preventDefault(); bas(kalemler[(j + kalemler.length) % kalemler.length]).focus();
      });
    });
    window.addEventListener('resize', yukseklik);
    akordeonCiz[alan] = function () { kalemler.forEach(ozetYaz); yukseklik(); };

    var ara = mk.querySelector('[data-akordeon-ara]'), sonuc = mk.querySelector('[data-akordeon-sonuc]'), yok = mk.querySelector('[data-akordeon-yok]'), say = mk.querySelector('[data-akordeon-say]');
    /* Ülke adıyla arama yalnız mutfakta anlamlı ("Japonya" → Japon); şehirde "ankara" zaten içerir */
    var uyar = function (ad, grup, q) {
      var n = norm(ad), ilk = n.split(' ')[0];
      return n.indexOf(q) >= 0 || norm(grup).indexOf(q) >= 0 || (alan === 'mutfak' && q.length >= 4 && ilk.length >= 3 && q.indexOf(ilk) === 0);
    };
    var aramaYap = function () {
      var q = norm(ara.value.trim());
      if (!q) { sonuc.hidden = true; sonuc.innerHTML = ''; ak.hidden = false; yok.hidden = true; say.innerHTML = say.getAttribute('data-bos'); yukseklik(); return; }
      var toplamEs = 0, html = '';
      kalemler.forEach(function (k) {
        var grup = k.querySelector('.mt-grup-ad').textContent;
        var es = $$('.tercih-cip', govde(k)).filter(function (c) { return uyar(c.getAttribute('data-ad'), grup, q); });
        if (!es.length) { return; }
        toplamEs += es.length;
        var id = 'ak-' + alan + '-s-' + k.getAttribute('data-mgrup');
        html += '<section class="tercih-grup" aria-labelledby="' + id + '"><h3 class="tercih-grup-bas" id="' + id + '">' + k.querySelector('.akordeon-ikon').innerHTML + ' ' + kac(grup) + ' <span class="tercih-grup-sayi">' + es.length + ' eşleşme</span></h3><div class="tercih-cipler" role="group" aria-labelledby="' + id + '">' + es.map(function (c) { return c.outerHTML; }).join('') + '</div></section>';
      });
      ak.hidden = true; sonuc.innerHTML = html; sonuc.hidden = !toplamEs; yok.hidden = !!toplamEs;
      say.innerHTML = toplamEs ? '<b>' + toplamEs + ' ' + kac(birim) + '</b> bulundu' : 'Sonuç yok';
    };
    ara.addEventListener('input', aramaYap);
    ara.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ara.value) { e.preventDefault(); ara.value = ''; aramaYap(); } });
  });

  /* ---- Fiyat aralığı ---- */
  (function () {
    var kap = form.querySelector('[data-fiyat-aralik]'); if (!kap) { return; }
    var a = kap.closest('[data-tercih]').getAttribute('data-tercih');
    var kartlar2 = $$('[data-kademe]', kap), ray = kap.querySelector('[data-fiyat-ray]'), dolu = kap.querySelector('[data-fiyat-dolu]');
    var alt = kap.querySelector('[data-uc="alt"]'), ust = kap.querySelector('[data-uc="ust"]');
    var ozet = kap.querySelector('[data-fiyat-ozet] span'), fark = kap.querySelector('[data-fiyat-fark]'), ipucu = kap.querySelector('[data-fiyat-ipucu]');
    var IPUCU = ipucu.textContent;
    var konum = function (n) { return ((n - 1) / 3 * 100) + '%'; };
    var deger = function (el, n, secili) {
      el.style.left = konum(n);
      el.setAttribute('aria-valuenow', n);
      el.setAttribute('aria-valuetext', secili ? kademe[String(n)].isaret + ' ' + kademe[String(n)].ad : 'Seçilmedi');
    };
    fiyatCiz = function () {
      var d = taslak[a], ar = d.length === 2 ? [+d[0], +d[1]] : null;
      kap.classList.toggle('bos', !ar);
      kartlar2.forEach(function (c) {
        var n = +c.getAttribute('data-kademe'), ic = !!ar && n >= ar[0] && n <= ar[1];
        c.setAttribute('aria-pressed', ic ? 'true' : 'false');
        c.classList.toggle('arada', ic); c.classList.toggle('uc', ic && (n === ar[0] || n === ar[1]));
      });
      deger(alt, ar ? ar[0] : 1, !!ar); deger(ust, ar ? ar[1] : 4, !!ar);
      dolu.style.left = konum(ar ? ar[0] : 1); dolu.style.right = (100 - parseFloat(konum(ar ? ar[1] : 4))) + '%';
      ozet.innerHTML = fiyatOzet(d);
      fark.setAttribute('aria-pressed', d[0] === 'onemli-degil' ? 'true' : 'false');
      ipucu.textContent = fiyatBekliyor && ar ? 'Şimdi aralığın öbür ucuna dokun; aynı karta dokunursan yalnız ' + kademe[String(ar[0])].ad + ' kalır.' : IPUCU;
    };
    /* Tutamak: klavye ve sürükleme. Alt uç üst ucu geçemez, üst uç alt ucun altına inemez */
    var tasi = function (uc, n) {
      var d = taslak[a], ar = d.length === 2 ? [+d[0], +d[1]] : [1, 4];
      n = Math.max(1, Math.min(4, n));
      if (uc === 'alt') { ar[0] = Math.min(n, ar[1]); } else { ar[1] = Math.max(n, ar[0]); }
      fiyatBekliyor = false;
      if (d.join() !== ar.join()) { degistir(a, [String(ar[0]), String(ar[1])]); } else { fiyatCiz(); }
    };
    [alt, ust].forEach(function (el) {
      var uc = el.getAttribute('data-uc');
      el.addEventListener('keydown', function (e) {
        var n = +el.getAttribute('aria-valuenow');
        var y = { ArrowRight: n + 1, ArrowUp: n + 1, ArrowLeft: n - 1, ArrowDown: n - 1, Home: 1, End: 4, PageUp: 4, PageDown: 1 }[e.key];
        if (y === undefined) { return; }
        e.preventDefault(); tasi(uc, y);
      });
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault(); el.setPointerCapture(e.pointerId); el.focus();
        /* İki tutamak üst üsteyse (tek seviye) sürükleme yönü hangi ucun gideceğini belirler: sola alt uç, sağa üst uç */
        var aktif = uc;
        var hareket = function (ev) {
          var r = ray.getBoundingClientRect(), n = Math.round((ev.clientX - r.left) / r.width * 3) + 1, d = taslak[a];
          if (d.length === 2 && d[0] === d[1]) { aktif = n < +d[0] ? 'alt' : n > +d[1] ? 'ust' : aktif; }
          tasi(aktif, n);
        };
        var bitir = function () { el.removeEventListener('pointermove', hareket); el.removeEventListener('pointerup', bitir); el.removeEventListener('pointercancel', bitir); };
        el.addEventListener('pointermove', hareket); el.addEventListener('pointerup', bitir); el.addEventListener('pointercancel', bitir);
      });
    });
    /* Raya dokunmak en yakın ucu oraya taşır */
    ray.addEventListener('pointerdown', function (e) {
      if (e.target !== ray && e.target !== dolu) { return; }
      var r = ray.getBoundingClientRect(), n = Math.round((e.clientX - r.left) / r.width * 3) + 1;
      var d = taslak[a], ar = d.length === 2 ? [+d[0], +d[1]] : [1, 4];
      tasi(Math.abs(n - ar[0]) <= Math.abs(n - ar[1]) ? 'alt' : 'ust', n);
    });
  })();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    fiyatBekliyor = false;
    kayitli = kopya(taslak); depoYaz(kayitli); hepsiniCiz();
    bildir('Tercihlerin kaydedildi. Prototipte yalnız bu tarayıcıda tutulur.');
  });
  window.addEventListener('beforeunload', function (e) { if (alanlar.some(function (a) { return !esitAlan(a); })) { e.preventDefault(); e.returnValue = ''; } });
  var ilk = sekmeler.filter(function (b) { return b.dataset.tab === location.hash.replace('#', ''); })[0];
  if (ilk) { sekmeAc(ilk); }
  hepsiniCiz();
})();
