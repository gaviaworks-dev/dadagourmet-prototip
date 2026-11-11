/* Tadım menüsü karşılaştırıcı (reklam-interaktif, 11 Kas). Alan: ML-T1 (Mekânlar liste üstü, interaktif havuz; reklam-son-duzelt 11 Kas: MD-INT'ten taşındı, mekân detayında rakip restoran yok).
   Panel biçimi: İnteraktif · `etkilesim_turu=secici` (seçenek = menü, hedef = rezervasyon; REKLAM-YERLESIM "Yeni biçimler").
   Gerçek hayattaki karşılığı: rich media "product comparison" birimi (yan yana kıyas, seç, satın al) ve OpenTable Experiences /
   Resy deneyim rezervasyonu (deneyimi seç → kişi, gün, saat → masa). Akış: kapalı şerit → pano: 2–3 menü yan yana (tabak sayısı,
   süre, fiyat kademesi, oturma, kimler için, günler, kampanya avantajı) → "Bu menüyü seç" → "Rezervasyona geç" → kişi · gün · saat →
   "Masa ayır" (reklam verenin rezervasyon sayfası; prototipte çekirdeğin "Örnek yerleşim" bildirimi). Menü satırları reklam verenin
   KAMPANYA METNİDİR (kreatif verisi; puan ya da yorum yok) ve panoda öyle yazılır. Günler bugünden başlar (gerçek takvim);
   menünün `gunler` listesinde olmayan gün seçilemez (gerekçesiyle). Kreatif: mekanAdi, konum, gorsel, menuler[{id, ad, kurs, sure,
   fiyat, oturma, kimin, gunMetni, gunler[0-6], saatler[], kisiEnCok, aciklama, teklif}], kampanyaNotu, rezervasyonNotu. */
(function () {
  'use strict';
  var IA = window.dgReklamIA, B = window.dgReklamBilesen;
  if (!IA || !B) { return; }
  var kac = IA.kac, ik = IA.ik;
  var TL = function (n) { return new Array((+n || 0) + 1).join('₺'); };
  var GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var GUN_K = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  function ciz(k, o) {
    return IA.kabuk(k, o, { arac: 'tadim-menusu', govde: '<div class="rk-ia-govde rk-ia-tadim" data-ia-govde></div>', icSinif: 'rk-ia-ic-tadim' });
  }

  function gunler() {
    var bugun = new Date(), d = [];
    for (var i = 0; i < 7; i++) {
      var g = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + i);
      d.push({ i: i, tarih: g, hafta: g.getDay(), ad: i === 0 ? 'Bugün' : (i === 1 ? 'Yarın' : GUN_K[g.getDay()]), uzun: GUN[g.getDay()] + ', ' + g.getDate() + ' ' + AY[g.getMonth()], kisa: g.getDate() + ' ' + AY[g.getMonth()].slice(0, 3) });
    }
    return d;
  }

  function kur(el, k, o) {
    var secili = null, adim = 'kiyas', kisi = 2, gun = null, saat = null, takvim = gunler();
    var api = IA.bagla(el, k, o, { acildi: function (n, zaten) { if (!zaten) { goster(adim); } } });
    if (!api) { return; }
    var govde = api.ic.querySelector('[data-ia-govde]');
    var menu = function () { return k.menuler.filter(function (m) { return m.id === secili; })[0] || null; };
    var uygunMu = function (m, g) { return !m.gunler || m.gunler.indexOf(g.hafta) >= 0; };

    function kurslar(n, en) {
      var s = '';
      for (var i = 0; i < en; i++) { s += '<span class="' + (i < n ? 'dolu' : '') + '"></span>'; }
      return '<span class="rk-ia-kurs" aria-hidden="true">' + s + '</span>';
    }
    function kiyasHtml() {
      var en = Math.max.apply(null, k.menuler.map(function (m) { return m.kurs; }));
      var satir = function (etiket, deger) { return '<div class="rk-ia-kiyas-satir"><dt>' + kac(etiket) + '</dt><dd>' + deger + '</dd></div>'; };
      var m = menu();
      return '<div class="rk-ia-adim rk-ia-giris">' +
        '<div class="rk-ia-mekan">' +
          '<img class="rk-ia-mekan-foto" src="' + IA.url(k.gorsel) + '" alt="" loading="lazy" decoding="async" width="160" height="120">' +
          '<div><p class="rk-ia-ust-yazi">' + ik('fa-location-dot') + ' ' + kac(k.konum) + '</p>' +
          '<h3 class="rk-ia-soru" data-ia-baslik tabindex="-1">' + kac(k.mekanAdi) + ': ' + kac(k.menuler.length + ' akşam menüsünü karşılaştır') + '</h3>' +
          '<p class="rk-ia-alt-yazi">' + kac(k.altMetin || 'Yan yana bak, birini seç, masanı ayır.') + '</p></div></div>' +
        '<div class="rk-ia-kiyas" role="list" aria-label="Menü karşılaştırması">' +
          k.menuler.map(function (x) {
            var s = x.id === secili;
            return '<article class="rk-ia-menu' + (s ? ' rk-ia-menu-secili' : '') + '" role="listitem" data-ia-menu="' + kac(x.id) + '">' +
              '<header class="rk-ia-menu-bas"><h4>' + kac(x.ad) + '</h4><p>' + kac(x.aciklama) + '</p></header>' +
              '<dl class="rk-ia-kiyas-liste">' +
                satir('Tabak', kurslar(x.kurs, en) + '<b>' + x.kurs + ' tabak</b>') +
                satir('Süre', kac(x.sure)) +
                satir('Fiyat (kişi başı)', '<span class="rk-ia-fiyat-kap"><b class="rk-ia-fiyat">' + TL(x.fiyat) + '</b><span class="rk-ia-fiyat-sonuk" aria-hidden="true">' + TL(4 - x.fiyat) + '</span></span>') +
                satir('Oturma', kac(x.oturma)) +
                satir('Kimler için', kac(x.kimin)) +
                satir('Günler', kac(x.gunMetni)) +
                satir('Avantaj', x.teklif ? '<span class="rk-ia-teklif">' + ik('fa-gift') + ' ' + kac(x.teklif) + '</span>' : '<span class="rk-ia-yok">Yok</span>') +
              '</dl>' +
              '<button type="button" class="rk-ia-menu-sec" data-ia-menu-sec="' + kac(x.id) + '" aria-pressed="' + (s ? 'true' : 'false') + '">' + (s ? ik('fa-check') + ' Seçildi' : 'Bu menüyü seç') + '</button>' +
            '</article>';
          }).join('') + '</div>' +
        '<p class="rk-ia-not">' + kac(k.kampanyaNotu || 'Menü bilgileri reklam verenin kampanya metnidir.') + '</p>' +
        '<div class="rk-ia-karar' + (m ? ' rk-ia-karar-var' : '') + '">' +
          '<span class="rk-ia-karar-ozet">' + (m ? 'Seçimin: <b>' + kac(m.ad) + '</b> · ' + m.kurs + ' tabak · ' + TL(m.fiyat) : 'Karşılaştır, bir menü seç.') + '</span>' +
          '<button type="button" class="rk-ia-birincil" data-ia-rez' + (m ? '' : ' disabled') + '>Rezervasyona geç ' + ik('fa-arrow-right') + '</button></div>' +
      '</div>';
    }
    function rezHtml() {
      var m = menu(), en = m.kisiEnCok || 8;
      if (gun === null || !uygunMu(m, takvim[gun])) { gun = null; takvim.some(function (g) { if (uygunMu(m, g)) { gun = g.i; return true; } return false; }); }
      if (!saat || m.saatler.indexOf(saat) < 0) { saat = m.saatler[0]; }
      var g = takvim[gun];
      return '<div class="rk-ia-adim rk-ia-giris rk-ia-rez">' +
        '<div class="rk-ia-sonuc-bas"><div><p class="rk-ia-ust-yazi">' + kac(k.mekanAdi) + ' · ' + kac(m.ad) + ' · ' + m.kurs + ' tabak</p>' +
          '<h3 class="rk-ia-soru" data-ia-baslik tabindex="-1">Masanı ayır</h3></div>' +
          '<button type="button" class="rk-ia-geri" data-ia-kiyas>' + ik('fa-arrow-left') + ' Menüyü değiştir</button></div>' +
        '<div class="rk-ia-rez-izgara">' +
          '<fieldset class="rk-ia-alan"><legend>Kişi</legend><div class="rk-ia-sayac">' +
            '<button type="button" data-ia-kisi="-1" aria-label="Kişi azalt"' + (kisi <= 1 ? ' disabled' : '') + '>' + ik('fa-minus') + '</button>' +
            '<output aria-live="polite" tabindex="-1">' + kisi + ' kişi</output>' +
            '<button type="button" data-ia-kisi="1" aria-label="Kişi artır"' + (kisi >= en ? ' disabled' : '') + '>' + ik('fa-plus') + '</button></div>' +
            (m.kisiEnCok ? '<small class="rk-ia-alan-not">' + kac(m.ad) + ' için en çok ' + m.kisiEnCok + ' kişi</small>' : '') + '</fieldset>' +
          '<fieldset class="rk-ia-alan rk-ia-alan-genis"><legend>Gün</legend><div class="rk-ia-cipler rk-ia-gunler">' +
            takvim.map(function (t) {
              var u = uygunMu(m, t);
              return '<button type="button" class="rk-ia-cip" data-ia-gun="' + t.i + '" aria-pressed="' + (t.i === gun ? 'true' : 'false') + '"' + (u ? '' : ' disabled aria-describedby="rkIaGunNot"') + ' aria-label="' + kac(t.uzun) + (u ? '' : ', uygun değil') + '"><b>' + kac(t.ad) + '</b><small>' + kac(t.kisa) + '</small></button>';
            }).join('') + '</div>' +
            (takvim.some(function (t) { return !uygunMu(m, t); }) ? '<small class="rk-ia-alan-not" id="rkIaGunNot">' + kac(m.ad) + ': ' + kac(m.gunMetni) + '</small>' : '') + '</fieldset>' +
          '<fieldset class="rk-ia-alan"><legend>Saat</legend><div class="rk-ia-cipler">' +
            m.saatler.map(function (s) { return '<button type="button" class="rk-ia-cip" data-ia-saat="' + kac(s) + '" aria-pressed="' + (s === saat ? 'true' : 'false') + '"><b>' + kac(s) + '</b></button>'; }).join('') + '</div></fieldset>' +
        '</div>' +
        '<div class="rk-ia-karar rk-ia-karar-var">' +
          '<span class="rk-ia-karar-ozet"><b>' + kisi + ' kişi</b> · ' + kac(g ? g.uzun : '') + ' · ' + kac(saat) + '<br><small>' + kac(k.rezervasyonNotu || '') + '</small></span>' +
          '<a class="rk-ia-birincil" ' + IA.bag(k.hedef, null, k) + '>' + kac(k.ctaSon || 'Masa ayır') + ' ' + ik('fa-arrow-right') + '</a></div>' +
      '</div>';
    }
    function goster(a, odak) {
      adim = a;
      api.yeniden(function () { govde.innerHTML = adim === 'rez' ? rezHtml() : kiyasHtml(); });
      if (odak) { api.odakla('[data-ia-baslik]'); }
    }
    api.ic.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('[data-ia-menu-sec]'))) {
        secili = t.getAttribute('data-ia-menu-sec');
        api.olay('secici_secimi', { oge: secili, menu: secili });
        var y = govde.querySelector('.rk-ia-kiyas'), x = y ? y.scrollLeft : 0;
        goster('kiyas');
        var y2 = govde.querySelector('.rk-ia-kiyas');
        if (y2) { y2.scrollLeft = x; }
        var b = govde.querySelector('[data-ia-menu-sec="' + secili + '"]');
        if (b) { b.focus({ preventScroll: true }); }
        api.duyur(menu().ad + ' seçildi. Rezervasyona geçebilirsin.');
        return;
      }
      if (e.target.closest('[data-ia-rez]')) { api.olay('etkilesim', { tur: 'rezervasyon', menu: secili }); /* reklam-duzeltici: seçicinin rezervasyon adımı etkileşimdir (oneri_araci değil) */ goster('rez', true); return; }
      if (e.target.closest('[data-ia-kiyas]')) { goster('kiyas', true); return; }
      if ((t = e.target.closest('[data-ia-kisi]'))) {
        var m = menu();
        kisi = Math.max(1, Math.min(m.kisiEnCok || 8, kisi + (+t.getAttribute('data-ia-kisi'))));
        var yon = t.getAttribute('data-ia-kisi');
        goster('rez');
        var d = govde.querySelector('[data-ia-kisi="' + yon + '"]');
        (d && !d.disabled ? d : govde.querySelector('.rk-ia-sayac output')).focus({ preventScroll: true });
        return;
      }
      if ((t = e.target.closest('[data-ia-gun]'))) { gun = +t.getAttribute('data-ia-gun'); goster('rez'); var gd = govde.querySelector('[data-ia-gun="' + gun + '"]'); if (gd) { gd.focus({ preventScroll: true }); } return; }
      if ((t = e.target.closest('[data-ia-saat]'))) { saat = t.getAttribute('data-ia-saat'); goster('rez'); var sd = govde.querySelector('[data-ia-saat="' + saat + '"]'); if (sd) { sd.focus({ preventScroll: true }); } }
    });
    govde.innerHTML = kiyasHtml();
  }

  window.dgReklamArac['tadim-menusu'] = { ciz: ciz, kur: kur };
})();
