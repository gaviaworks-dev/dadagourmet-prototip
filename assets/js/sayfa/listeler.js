/* Listelerim (H5): Gastronomi Rotalarım satırları ve liste detayı.
   - Rotalar `window.dgRota` deposundan (prototip.js): Dada Route › Güzergâhlarım ile aynı kayıtlar.
   - Liste detayı: sıra (yukarı/aşağı), çıkarma, görünürlük ve paylaşım bağlantısı. Durum `dgKayit('liste-durum')`ta, yalnız bu tarayıcıda.
   - A8 (Beyar 12 Kas): mekân sayfasındaki Listeye Ekle'nin yazdığı kalemler (`dgKayit('liste-kalem')`, kimlik `<liste>|<mekân>`) detayda
     örnek kalemlerin ardına, sayfadaki `<template data-kalem-kalip>` satırıyla basılır. Yeni liste (`dgKayit('lstYeniPnl')`) tek detay
     ekranında açılır (`hesabim/listeler/yeni/?liste=<kimlik>`). Listelerim satırlarındaki "N mekân" sayısı bu kayıtlarla güncellenir. */
(function kur() {
  'use strict'; document.addEventListener('dg:sekme', kur); /* H8: sekme yerinde değişince Rotalarım satırları yeniden basılır */
  var K = window.dgKayit, R = window.dgRota, kok = document.documentElement.dataset.kok || './';
  var bildir = window.prototipBildir || function () {};
  var kac = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var et = '<span class="ornek-etiket">prototip örneği</span>';

  /* ---- Gastronomi Rotalarım ---- */
  var rotaSayisi = R ? R.oku().length : null;
  [].forEach.call(document.querySelectorAll('[data-rota-sayi]'), function (b) { if (rotaSayisi !== null) { b.textContent = rotaSayisi; } });
  var rl = document.getElementById('lstRotalar');
  if (rl && R) {
    var rotalar = R.oku();
    var rr = document.querySelector('[data-rota-rozet]'); if (rr) { rr.textContent = rotalar.length + ' rota'; }
    var sure = function (sn) { var d = Math.round((sn || 0) / 60), s = Math.floor(d / 60); return s ? s + ' sa ' + (d % 60 ? d % 60 + ' dk' : '') : d + ' dk'; };
    var tarih = function (t) { try { return new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };
    rl.innerHTML = rotalar.length ? rotalar.map(function (r) {
      var mekan = (r.duraklar || []).filter(function (d) { return d.rol === 'venue'; });
      var alt = [r.kalkis && r.varis ? r.kalkis.ad + ' → ' + r.varis.ad : '', r.mesafe_m ? Math.round(r.mesafe_m / 1000) + ' km' : '', r.sure_sn ? sure(r.sure_sn) : '', mekan.length + ' mekân durağı'].filter(Boolean).join(' · ');
      var mekanlar = mekan.map(function (d) { return d.ad; }).join(', ');
      return '<div class="kalem-satiri tiklanir" data-rota="' + kac(r.id) + '"><span class="ks-ikon"><i class="fa-solid fa-route" aria-hidden="true"></i></span>' +
        '<span class="ks-metin"><b>' + (r.ornek ? et + ' ' : '') + '<a href="' + kok + 'dada-route/">' + kac(r.ad) + '</a></b><small>' + kac(alt) + '</small>' + (mekanlar ? '<small>' + kac(mekanlar) + '</small>' : '') + '</span>' +
        '<span class="ks-uc">' + (r.favori ? '<span class="rozet olumlu"><i class="fa-solid fa-star" aria-hidden="true"></i> Favori</span>' : '<span class="rozet pasif">' + kac(tarih(r.guncellendi)) + '</span>') + '<i class="fa-solid fa-chevron-right ks-ok" aria-hidden="true"></i></span></div>';
    }).join('') : '<div class="bos-durum"><span class="bos-ikon"><i class="fa-solid fa-route" aria-hidden="true"></i></span><h4>Henüz kayıtlı rotan yok</h4><p>Dada Route’ta bir güzergâh kurup kaydettiğinde burada görünür.</p></div>';
  }

  /* ---- Listelerim satırlarında mekân sayısı: örnek kalemler + eklenenler, kayıtlı sıra varsa o ---- */
  var KATALOG = window.DG_LISTELER || [];
  var kalemSayisi = function (lid) {
    if (!K) { return null; }
    var d = K.oku('liste-durum').filter(function (k) { return k.id === lid; })[0]; if (d) { return d.sira.length; }
    var o = KATALOG.filter(function (l) { return l.id === lid; })[0], sl = o ? o.kalem.map(function (k) { return k[0]; }) : [];
    K.oku('liste-kalem').forEach(function (k) { if (k.liste === lid && sl.indexOf(k.slug) < 0) { sl.push(k.slug); } });
    return sl.length;
  };
  [].forEach.call(document.querySelectorAll('.kalem-satiri'), function (r) {
    var a = r.querySelector('.ks-metin a'), m = a && (a.getAttribute('href') || '').match(/hesabim\/listeler\/([a-z0-9-]+)\/(?:\?liste=([^&#]+))?$/);
    var lid = m ? (m[1] === 'yeni' ? decodeURIComponent(m[2] || '') : m[1]) : '', alt = r.querySelector('.ks-metin small');
    if (!lid || !alt || !/^\d+ mekân/.test(alt.textContent)) { return; }
    var n = kalemSayisi(lid); if (n !== null) { alt.textContent = alt.textContent.replace(/^\d+ mekân/, n + ' mekân'); }
  });

  /* ---- Favorilerim (A8 düzeltme): varsayılan ilk liste, içerik favori deposu; satırda sayı ve ilk üç ad ---- */
  if (K) {
    var fav = K.oku('favori'), fo = document.querySelector('[data-favori-ozet]');
    if (fo) { fo.textContent = fav.length ? fav.length + ' favori · ' + fav.slice(0, 3).map(function (k) { return k.ad; }).join(', ') + (fav.length > 3 ? '…' : '') : 'Henüz favorin yok · mekân sayfasındaki kalp ya da Listeye Ekle'; }
  }

  /* ---- Liste detayı ---- */
  var pane = document.querySelector('[data-liste]'); if (!pane || !K) { return; }
  var id = pane.getAttribute('data-liste'), liste = pane.querySelector('.fp-list[id^="lstKalem-"]');
  /* Yeni liste: kimlik ve bilgiler `?liste=` kaydından; kayıt yoksa boş durum */
  if (pane.hasAttribute('data-liste-kayit')) {
    var kid = new URLSearchParams(location.search).get('liste') || '', kayit = K.oku('lstYeniPnl').filter(function (k) { return k.id === kid; })[0];
    if (!kayit) {
      liste.innerHTML = '<div class="bos-durum"><span class="bos-ikon"><i class="fa-solid fa-list" aria-hidden="true"></i></span><h4>Liste bulunamadı</h4><p>Bu liste bu tarayıcıda kayıtlı değil. Listelerim’den bir liste aç ya da yeni liste oluştur.</p><a class="dugme birincil" href="' + kok + 'hesabim/listeler/"><i class="fa-solid fa-list-ul" aria-hidden="true"></i> Listelerim</a></div>';
      [].forEach.call(pane.querySelectorAll('[data-liste-paylasim], [data-kalem-sayi]'), function (e) { e.hidden = true; });
      return;
    }
    id = kayit.id;
    var adY = kayit.ad || 'Yeni liste', h2 = pane.querySelector('h2'), gm = pane.querySelector('.giris-metni'), cur = document.querySelector('.kirinti .cur');
    if (h2) { h2.textContent = adY; } if (cur) { cur.textContent = adY; } document.title = document.title.replace(/^Yeni liste/, adY);
    if (gm) { gm.textContent = kayit.aciklama || ''; gm.hidden = !kayit.aciklama; }
    var zaman = +(String(kayit.id).match(/-(\d{10,})$/) || [])[1], gun = pane.querySelector('[data-liste-guncel]');
    if (gun && zaman) { gun.textContent = new Date(zaman).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    var gr = pane.querySelector('input[name="gorunurluk"][value="' + (kayit.gorunurluk === 'paylasilabilir' ? 'paylasilabilir' : 'ozel') + '"]'); if (gr) { gr.checked = true; }
  }
  /* Mekân sayfasından eklenen kalemler: eklenme sırasıyla örneklerin ardına */
  var kalip = document.querySelector('template[data-kalem-kalip]');
  if (kalip && liste) {
    K.oku('liste-kalem').filter(function (k) { return k.liste === id; }).reverse().forEach(function (k) {
      if (liste.querySelector('[data-kalem="' + k.slug + '"]')) { return; }
      var b = liste.querySelector('.bos-durum'); if (b) { b.remove(); }
      var h = kalip.innerHTML.replace(/\{slug\}/g, kac(k.slug)).replace(/\{ad\}/g, kac(k.ad)).replace(/\{alt\}/g, kac(k.alt || '')).replace(/\{sira\}/g, '');
      liste.insertAdjacentHTML('beforeend', h);
    });
  }
  var durumOku = function () { return K.oku('liste-durum').filter(function (k) { return k.id === id; })[0] || null; };
  var durumYaz = function () {
    var v = { id: id, sira: [].map.call(liste.querySelectorAll('[data-kalem]'), function (s) { return s.getAttribute('data-kalem'); }), gorunurluk: (pane.querySelector('input[name="gorunurluk"]:checked') || {}).value || 'ozel' };
    if (durumOku()) { K.sil('liste-durum', id); } K.ekle('liste-durum', v);
  };
  var numarala = function () {
    var s = liste.querySelectorAll('[data-kalem]');
    [].forEach.call(s, function (x, i) {
      x.querySelector('.ks-sira').textContent = i + 1;
      x.querySelector('[data-sira="yukari"]').disabled = i === 0;
      x.querySelector('[data-sira="asagi"]').disabled = i === s.length - 1;
    });
    var n = pane.querySelector('[data-kalem-sayi]'); if (n) { n.textContent = s.length; }
    if (!s.length && !liste.querySelector('.bos-durum')) { liste.insertAdjacentHTML('beforeend', '<div class="bos-durum"><span class="bos-ikon"><i class="fa-solid fa-utensils" aria-hidden="true"></i></span><h4>Listede mekân kalmadı</h4><p>Bir mekânın sayfasındaki Listeye ekle ile yeniden doldurabilirsin.</p></div>'); }
  };
  var ETIKET = { ozel: '<i class="fa-solid fa-lock" aria-hidden="true"></i> Gizli', paylasilabilir: '<i class="fa-solid fa-link" aria-hidden="true"></i> Paylaşımda' };
  var gorunurlukUygula = function (g) {
    var r = pane.querySelector('[data-liste-rozet]'); if (r) { r.innerHTML = ETIKET[g]; }
    var b = pane.querySelector('[data-liste-bag]'); if (b) { b.hidden = g !== 'paylasilabilir'; }
  };
  /* Kayıtlı durum varsa sıra ve görünürlük ondan */
  var d = durumOku();
  if (d) {
    var var_ = {}; [].forEach.call(liste.querySelectorAll('[data-kalem]'), function (s) { var_[s.getAttribute('data-kalem')] = s; });
    Object.keys(var_).forEach(function (k) { if (d.sira.indexOf(k) < 0) { var_[k].remove(); } });
    d.sira.forEach(function (k) { if (var_[k]) { liste.appendChild(var_[k]); } });
    var r = pane.querySelector('input[name="gorunurluk"][value="' + d.gorunurluk + '"]'); if (r) { r.checked = true; gorunurlukUygula(d.gorunurluk); }
  }
  if (pane.hasAttribute('data-liste-kayit')) { var gs = pane.querySelector('input[name="gorunurluk"]:checked'); if (gs) { gorunurlukUygula(gs.value); } }
  numarala();

  pane.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) { return; }
    var satir = t.closest('[data-kalem]');
    if (t.hasAttribute('data-sira') && satir) {
      var yukari = t.getAttribute('data-sira') === 'yukari', komsu = yukari ? satir.previousElementSibling : satir.nextElementSibling;
      if (!komsu || !komsu.hasAttribute('data-kalem')) { return; }
      liste.insertBefore(satir, yukari ? komsu : komsu.nextElementSibling);
      numarala(); durumYaz();
      var odak = satir.querySelector('[data-sira="' + (yukari ? 'yukari' : 'asagi') + '"]'); if (odak && !odak.disabled) { odak.focus(); } else { t.focus(); }
      bildir('Sıra güncellendi. Prototipte yalnız bu tarayıcıda tutulur.');
    } else if (t.hasAttribute('data-kalem-cikar') && satir) {
      var ad = satir.querySelector('.ks-metin a').textContent;
      satir.remove(); numarala(); durumYaz();
      bildir('“' + ad + '” listeden çıkarıldı.');
    } else if (t.hasAttribute('data-bag-kopyala')) {
      var g = pane.querySelector('[data-liste-bag] input'); g.select();
      var tamam = function () { bildir('Bağlantı kopyalandı.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(g.value).then(tamam, tamam); } else { try { document.execCommand('copy'); } catch (x) { /* yok */ } tamam(); }
    }
  });
  pane.addEventListener('change', function (e) {
    if (e.target.name !== 'gorunurluk') { return; }
    var g = e.target.value, b = pane.querySelector('[data-liste-bag] input');
    /* Canlı `ListeServisi::paylas()` her paylaşımda yeni belirteç üretir; prototip örnek bir kod yazar */
    if (g === 'paylasilabilir' && b && /yeni-baglanti$/.test(b.value)) { b.value = b.getAttribute('data-bag-ornek') + Math.random().toString(36).slice(2, 8); }
    gorunurlukUygula(g); durumYaz();
    if (pane.hasAttribute('data-liste-kayit')) { K.guncelle('lstYeniPnl', id, { gorunurluk: g }); } /* Listelerim satırının rozeti aynı kayıttan */
    bildir(g === 'paylasilabilir' ? 'Liste paylaşıma açıldı; bağlantısı olan görebilir.' : 'Paylaşım kapatıldı; liste yalnız sana görünür.');
  });
})();
