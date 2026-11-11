/* Kahve Dünyası "Keşiften ilhama" seçicisi (reklam-interaktif, 11 Kas). Alan: MD-INT havuzunda (mekân detayı, içerik sonu).
   Kaynak fikir: Sponsor marka stratejisi slayt 07 "03 · GOURMET + GASTRO · Keşiften ilhama. Kahve deneyimi, evde hazırlanacak bir
   tarife dönüşür." Panel biçimi: İnteraktif · `etkilesim_turu=secici` (2–6 seçenek: metin, sonuç cümlesi, hedef = Dada Gastro tarifi).
   Gerçek hayattaki karşılığı: rich media "seçici" (quiz / product finder) birimi + sponsorlu içerik köprüsü (branded content, tarif
   ortaklığı: Tasty × marka, Allrecipes "Sponsored recipe"). Akış: kapalı şerit → pano: "Hangi kahve aklında kaldı?" (tarif görselli
   seçenekler) → sonuç: GERÇEK Dada Gastro tarifi (ad, süre, porsiyon, malzemeler, adımlar dokunarak gezilir) → "Tarifin tamamı Dada
   Gastro'da" (canlı tarif adresi, yeni sekme) ve "En yakın Kahve Dünyası" (reklam verenin şube sayfası; prototipte bildirim).
   Tarif verisi dadagastro.com tarif sayfalarının JSON-LD'sinden (GET 11 Kas 2026), görseller aynı sayfaların og:image'ı (640 px). */
(function () {
  'use strict';
  var IA = window.dgReklamIA, B = window.dgReklamBilesen;
  if (!IA || !B) { return; }
  var kac = IA.kac, ik = IA.ik;

  function ciz(k, o) {
    return IA.kabuk(k, o, { arac: 'kahve-ilham', govde: '<div class="rk-ia-govde rk-ia-kahve" data-ia-govde></div>', icSinif: 'rk-ia-ic-kahve' });
  }

  function kur(el, k, o) {
    var secim = null, adimNo = 0;
    var api = IA.bagla(el, k, o, { acildi: function (n, zaten) { if (!zaten) { ciz2(); } } });
    if (!api) { return; }
    var govde = api.ic.querySelector('[data-ia-govde]');
    var tarif = function () { return k.secenekler.filter(function (s) { return s.id === secim; })[0] || null; };

    function secenekler() {
      return '<div class="rk-ia-kahve-sol">' +
        '<p class="rk-ia-ust-yazi">' + kac(k.ustYazi || '') + '</p>' +
        '<h3 class="rk-ia-soru" data-ia-baslik tabindex="-1">' + kac(k.soru) + '</h3>' +
        '<div class="rk-ia-secenekler rk-ia-kahve-secenek" role="group" aria-label="' + kac(k.soru) + '">' +
          k.secenekler.map(function (s) {
            return '<button type="button" class="rk-ia-secenek rk-ia-secenek-foto" data-ia-kahve="' + kac(s.id) + '" aria-pressed="' + (s.id === secim ? 'true' : 'false') + '">' +
              '<img src="' + IA.url(s.gorsel) + '" alt="" loading="lazy" decoding="async" width="96" height="72">' +
              '<span class="rk-ia-secenek-yazi"><b>' + kac(s.etiket) + '</b><small>' + kac(s.alt) + '</small></span>' +
              '<span class="rk-ia-secenek-tik" aria-hidden="true">' + ik('fa-check') + '</span></button>';
          }).join('') + '</div></div>';
    }
    function bos() {
      return '<div class="rk-ia-kahve-sag rk-ia-kahve-bos"><img src="' + IA.url(k.gorsel) + '" alt="" loading="lazy" decoding="async" width="400" height="300">' +
        '<p>' + ik('fa-mug-hot') + ' ' + kac(k.bosMetin || '') + '</p></div>';
    }
    function sonuc() {
      var t = tarif(), n = t.adimlar.length, i = Math.min(adimNo, n - 1);
      return '<div class="rk-ia-kahve-sag rk-ia-giris" data-ia-sonuc>' +
        '<div class="rk-ia-tarif-foto"><img src="' + IA.url(t.gorsel) + '" alt="' + kac(t.tarif) + '" loading="lazy" decoding="async" width="640" height="430">' +
          '<span class="rk-ia-tarif-etiket">' + ik('fa-fire-burner') + ' Dada Gastro tarifi</span></div>' +
        '<p class="rk-ia-sonuc-cumle">' + kac(t.sonuc) + '</p>' +
        '<h4 class="rk-ia-tarif-ad" id="rkIaTarifAd" tabindex="-1">' + kac(t.tarif) + '</h4>' +
        '<p class="rk-ia-oneri-meta">' + ik('fa-clock') + ' ' + kac(t.sure) + ' · ' + ik('fa-mug-saucer') + ' ' + kac(t.porsiyon) + '</p>' +
        '<div class="rk-ia-tarif-govde">' +
          '<div class="rk-ia-malzeme"><h5>Malzemeler</h5><ul>' + t.malzemeler.map(function (m) { return '<li>' + kac(m) + '</li>'; }).join('') + '</ul></div>' +
          '<div class="rk-ia-adimci" aria-roledescription="adım gezgini"><h5>Adım <span>' + (i + 1) + '</span> / ' + n + '</h5>' +
            '<ol class="rk-ia-adim-nokta" aria-hidden="true">' + t.adimlar.map(function (_, j) { return '<li class="' + (j === i ? 'simdi' : (j < i ? 'tamam' : '')) + '"></li>'; }).join('') + '</ol>' +
            '<p class="rk-ia-adim-metin" aria-live="polite">' + kac(t.adimlar[i]) + '</p>' +
            '<div class="rk-ia-adim-dugme"><button type="button" class="rk-ia-geri" data-ia-adim-git="-1"' + (i === 0 ? ' disabled' : '') + '>' + ik('fa-arrow-left') + ' Önceki</button>' +
              '<button type="button" class="rk-ia-geri" data-ia-adim-git="1"' + (i === n - 1 ? ' disabled' : '') + '>Sonraki ' + ik('fa-arrow-right') + '</button></div></div>' +
        '</div>' +
        '<div class="rk-ia-eylem">' +
          '<a class="rk-ia-birincil" ' + IA.bag(null, t.url) + '>' + kac(k.ctaTarif || 'Tarifin tamamı Dada Gastro\'da') + ' ' + ik('fa-arrow-up-right-from-square') + '</a>' +
          '<a class="rk-ia-ikincil" ' + IA.bag(k.hedef, null, k) + '>' + kac(k.cta2 || 'En yakın Kahve Dünyası') + '</a></div>' +
      '</div>';
    }
    function ciz2() { govde.innerHTML = '<div class="rk-ia-kahve-izgara">' + secenekler() + (secim ? sonuc() : bos()) + '</div>'; }

    api.ic.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ia-kahve]');
      if (t) {
        secim = t.getAttribute('data-ia-kahve');
        adimNo = 0;
        api.olay('secici_secimi', { oge: secim, secenek: secim });
        api.yeniden(ciz2);
        var s = tarif();
        api.duyur(s.etiket + ': ' + s.tarif + ', ' + s.sure + '.');
        /* Telefonda sonuç seçeneklerin altında: sonuca kaydır, odak tarif adında */
        api.odakla('#rkIaTarifAd');
        return;
      }
      var a = e.target.closest('[data-ia-adim-git]');
      if (a) {
        adimNo = Math.max(0, Math.min(tarif().adimlar.length - 1, adimNo + (+a.getAttribute('data-ia-adim-git'))));
        var yon = a.getAttribute('data-ia-adim-git');
        api.yeniden(ciz2);
        var b = govde.querySelector('[data-ia-adim-git="' + yon + '"]');
        (b && !b.disabled ? b : govde.querySelector('[data-ia-adim-git]:not([disabled])')).focus({ preventScroll: true });
      }
    });
    ciz2();
  }

  window.dgReklamArac['kahve-ilham'] = { ciz: ciz, kur: kur };
})();
