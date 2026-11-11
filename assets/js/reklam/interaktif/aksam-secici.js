/* "Bu akşam ne yesek?" öneri aracı (reklam-interaktif, 11 Kas). Alan: ML-T1 havuzunda interaktif varyant (Mekânlar liste üstü).
   Panel biçimi: İnteraktif · `etkilesim_turu=oneri_araci` (REKLAM-YERLESIM "Yeni biçimler"; seçenek → sonuç cümlesi + hedef).
   Gerçek hayattaki karşılığı: Google Ads / Yelp "Sponsored results" mantığı (soruya göre sponsorlu sonuç) + interaktif display
   (rich media, IAB Expandable) birimi. Akış: kapalı şerit → (şeritteki hızlı seçim ya da çağrı) → pano: Kiminle? · Ne canın çekiyor? ·
   Bütçen? → yalnız SPONSORLU mekânlardan öneri: en uygun kart + "Bunlar da olabilir"; her kartta neden eşleştiği (seçilen tercihlerle
   birebir, puan ya da yorum yok), kampanya teklifi, "Masa ayır" ve "Mekânı gör". Öneri havuzu kreatif verisidir (reklam verenlerin
   gerçek mekânları: Divan · Maromi İstanbul mekân verisinde var; The House Café ve BigChefs marka konsepti, mekân sayfası yok).
   Kreatif alanları: sorular[{id, soru, secenekler[{id, etiket, alt, ikon}]}], oneriler[{id, marka, baslik, kategori, konum, fiyat,
   gorsel, metin, teklif, eslesme{soruId: [secenekId]}, cta, hedef, cta2, hedef2}]. Bütçe sorusu (`butce`) fiyat kademesiyle eşleşir:
   kademe ≤ seçim uyar, "4" fark etmez. */
(function () {
  'use strict';
  var IA = window.dgReklamIA, B = window.dgReklamBilesen;
  if (!IA || !B) { return; }
  var kac = IA.kac, ik = IA.ik;
  var TL = function (n) { return new Array((+n || 0) + 1).join('₺'); };

  function secenekHtml(s, sec) {
    return '<button type="button" class="rk-ia-secenek" data-ia-secenek="' + kac(s.id) + '" aria-pressed="' + (sec ? 'true' : 'false') + '">' +
      (s.ikon ? '<span class="rk-ia-secenek-ikon">' + ik(s.ikon) + '</span>' : '') +
      '<span class="rk-ia-secenek-yazi"><b>' + kac(s.etiket) + '</b>' + (s.alt ? '<small>' + kac(s.alt) + '</small>' : '') + '</span>' +
      '<span class="rk-ia-secenek-tik" aria-hidden="true">' + ik('fa-check') + '</span></button>';
  }

  function ciz(k, o) {
    var ilk = k.sorular[0];
    var hizli = '<span class="rk-ia-hizli" role="group" aria-label="' + kac(ilk.soru) + '"><span class="rk-ia-hizli-soru" aria-hidden="true">' + kac(ilk.soru) + '</span>' +
      ilk.secenekler.map(function (s) { return '<button type="button" class="rk-ia-hizli-cip" data-ia-hizli="' + kac(s.id) + '">' + (s.ikon ? ik(s.ikon) : '') + kac(s.etiket) + '</button>'; }).join('') + '</span>';
    var logolar = (k.markalar || [k.marka]).map(function (id) { return '<span class="rk-ia-logo-kutu">' + B.logo({ marka: id }) + '</span>'; }).join('');
    var govde = '<div class="rk-ia-govde rk-ia-aksam" data-ia-govde></div>';
    return IA.kabuk(k, o, { arac: 'aksam-secici', logolar: logolar, seritEk: hizli, govde: govde, icSinif: 'rk-ia-ic-aksam' });
  }

  function kur(el, k, o) {
    var cevap = {}, adim = 0, n = k.sorular.length;
    var api = IA.bagla(el, k, o, {
      acildi: function (neden, zatenAcik) { if (!zatenAcik && neden !== 'hizli') { goster(adim, true); } }
    });
    if (!api) { return; }
    var govde = api.ic.querySelector('[data-ia-govde]');

    function ilerleme() {
      return '<ol class="rk-ia-ilerleme" aria-label="Adımlar">' + k.sorular.map(function (s, i) {
        var durum = i < adim ? 'tamam' : (i === adim ? 'simdi' : '');
        var cv = cevap[s.id] && s.secenekler.filter(function (x) { return x.id === cevap[s.id]; })[0];
        var ic = '<span class="rk-ia-ilerleme-no">' + (i < adim || adim === n ? ik('fa-check') : (i + 1)) + '</span><span class="rk-ia-ilerleme-ad">' + kac(cv ? cv.etiket : s.soru) + '</span>';
        return '<li class="' + (adim === n ? 'tamam' : durum) + '"' + (i === adim ? ' aria-current="step"' : '') + '>' +
          (cevap[s.id] && i !== adim ? '<button type="button" data-ia-adim="' + i + '" aria-label="' + kac(s.soru) + ' sorusuna dön">' + ic + '</button>' : '<span class="rk-ia-ilerleme-kap">' + ic + '</span>') + '</li>';
      }).join('') + '</ol>';
    }
    function soruHtml() {
      var s = k.sorular[adim];
      return ilerleme() +
        '<div class="rk-ia-adim rk-ia-giris">' +
          '<p class="rk-ia-ust-yazi">' + kac('Adım ' + (adim + 1) + ' / ' + n) + '</p>' +
          '<h3 class="rk-ia-soru" data-ia-baslik tabindex="-1">' + kac(s.soru) + '</h3>' +
          '<div class="rk-ia-secenekler rk-ia-secenek-' + s.secenekler.length + '" role="group" aria-label="' + kac(s.soru) + '">' +
            s.secenekler.map(function (x) { return secenekHtml(x, cevap[s.id] === x.id); }).join('') + '</div>' +
          '<div class="rk-ia-alt-satir">' + (adim > 0 ? '<button type="button" class="rk-ia-geri" data-ia-geri>' + ik('fa-arrow-left') + ' Geri</button>' : '<span></span>') +
            '<span class="rk-ia-not">' + kac(k.not || 'Yalnız sponsorlu mekânlar önerilir.') + '</span></div>' +
        '</div>';
    }

    /* Eşleşme: her soruda seçilen seçenek önerinin listesindeyse uyar; bütçe fiyat kademesiyle */
    function uyumlar(x) {
      return k.sorular.map(function (s) {
        var c = cevap[s.id], sec = s.secenekler.filter(function (y) { return y.id === c; })[0] || {};
        if (s.id === 'butce') {
          var fark = (+x.fiyat || 0) - (+c || 0);
          if (c === '4' || fark <= 0) { return { uyar: true, metin: c === '4' ? TL(x.fiyat) + ' · bütçe fark etmez' : TL(x.fiyat) + ' · bütçene uygun' }; }
          return { uyar: false, metin: TL(x.fiyat) + ' · bütçenin ' + (fark === 1 ? 'bir kademe' : fark + ' kademe') + ' üstü' };
        }
        var e = (x.eslesme && x.eslesme[s.id]) || [], uy = e.indexOf(c) >= 0;
        return { uyar: uy, metin: uy ? (sec.sonuc || sec.etiket) : ((x.uygun && x.uygun[s.id]) || (sec.etiket + ' için daha az uygun')) };
      });
    }
    function sirala() {
      return k.oneriler.map(function (x, i) {
        var u = uyumlar(x);
        return { x: x, u: u, puan: u.filter(function (y) { return y.uyar; }).length, i: i };
      }).sort(function (a, b) { return b.puan - a.puan || a.i - b.i; });
    }
    function eylem(x, kucuk) {
      return '<div class="rk-ia-eylem">' +
        '<a class="rk-ia-birincil" ' + IA.bag(x.hedef, null, x) + '>' + kac(x.cta || 'Masa ayır') + (kucuk ? '' : ' ' + ik('fa-arrow-right')) + '</a>' +
        (x.cta2 ? '<a class="rk-ia-ikincil" ' + IA.bag(x.hedef2, null, x) + '>' + kac(x.cta2) + '</a>' : '') + '</div>';
    }
    function kimlik(x) {
      var m = B.marka(x);
      return '<span class="rk-ia-oneri-kimlik"><span class="rk-ia-logo-kutu">' + B.logo(x, '') + '</span><span><span class="rk-etiket">Sponsorlu</span> · ' + kac(m.ad) + '</span></span>';
    }
    function sonucHtml() {
      var s = sirala(), ana = s[0], diger = s.slice(1);
      var ozet = k.sorular.map(function (q) { var y = q.secenekler.filter(function (z) { return z.id === cevap[q.id]; })[0]; return y ? kac(y.etiket) : ''; }).join(' · ');
      var neden = function (u) { return '<ul class="rk-ia-nedenler">' + u.map(function (y) { return '<li class="' + (y.uyar ? 'rk-ia-uyar' : 'rk-ia-uymaz') + '">' + ik(y.uyar ? 'fa-check' : 'fa-minus') + ' ' + kac(y.metin) + '</li>'; }).join('') + '</ul>'; };
      var x = ana.x;
      return ilerleme() +
        '<div class="rk-ia-adim rk-ia-giris rk-ia-sonuc">' +
          '<div class="rk-ia-sonuc-bas"><div><p class="rk-ia-ust-yazi">' + ozet + '</p><h3 class="rk-ia-soru" data-ia-baslik tabindex="-1">' + kac(k.sonucBaslik || 'Bu akşam için önerimiz') + '</h3></div>' +
            '<button type="button" class="rk-ia-geri" data-ia-bastan>' + ik('fa-rotate-left') + ' Yeniden seç</button></div>' +
          '<div class="rk-ia-sonuclar">' +
            '<article class="rk-ia-oneri rk-ia-oneri-ana ' + B.marka(x).renkSinif + '" data-ia-oneri="' + kac(x.id) + '">' +
              '<div class="rk-ia-oneri-foto"><img src="' + IA.url(x.gorsel) + '" alt="" loading="lazy" decoding="async" width="400" height="300">' +
                '<span class="rk-ia-eslesme">' + ik('fa-wand-magic-sparkles') + ' ' + ana.puan + ' / ' + n + ' tercihine uyuyor</span></div>' +
              '<div class="rk-ia-oneri-govde">' + kimlik(x) +
                '<h4>' + kac(x.baslik) + '</h4>' +
                '<p class="rk-ia-oneri-meta">' + kac(x.kategori) + ' · ' + ik('fa-location-dot') + ' ' + kac(x.konum) + ' · <b>' + TL(x.fiyat) + '</b></p>' +
                '<p class="rk-ia-oneri-metin">' + kac(x.metin) + '</p>' + neden(ana.u) +
                (x.teklif ? '<p class="rk-ia-teklif">' + ik('fa-gift') + ' ' + kac(x.teklif) + '</p>' : '') + eylem(x) +
              '</div></article>' +
            '<div class="rk-ia-digerleri"><h4 class="rk-ia-ara-baslik">Bunlar da olabilir</h4>' +
              diger.map(function (d) {
                var y = d.x;
                return '<article class="rk-ia-oneri rk-ia-oneri-kucuk ' + B.marka(y).renkSinif + '" data-ia-oneri="' + kac(y.id) + '">' +
                  '<div class="rk-ia-oneri-foto"><img src="' + IA.url(y.gorsel) + '" alt="" loading="lazy" decoding="async" width="160" height="120"></div>' +
                  '<div class="rk-ia-oneri-govde">' + kimlik(y) + '<h4>' + kac(y.baslik) + '</h4>' +
                    '<p class="rk-ia-oneri-meta">' + kac(y.kategori) + ' · <b>' + TL(y.fiyat) + '</b></p>' +
                    '<p class="rk-ia-oneri-kisa">' + d.puan + ' / ' + n + ' tercihine uyuyor</p>' + eylem(y, true) + '</div></article>';
              }).join('') +
            '</div></div>' +
          '<p class="rk-ia-not rk-ia-not-alt">' + kac(k.not || 'Yalnız sponsorlu mekânlar önerilir.') + ' ' + kac(k.kampanyaNotu || '') + '</p>' +
        '</div>';
    }
    function goster(i, odak) {
      adim = i;
      api.yeniden(function () { govde.innerHTML = adim < n ? soruHtml() : sonucHtml(); });
      if (odak) { api.odakla('[data-ia-baslik]'); }
      if (adim === n) {
        var s = sirala();
        api.duyur(s.length + ' sponsorlu öneri. En uygun: ' + s[0].x.baslik + '.');
        api.olay('oneri_araci', { oge: s[0].x.id, cevap: JSON.parse(JSON.stringify(cevap)), oneri: s[0].x.id });
      }
    }
    var sec = function (id) {
      var s = k.sorular[adim];
      cevap[s.id] = id;
      api.olay('oneri_araci', { oge: id, soru: s.id, secenek: id }); /* reklam-duzeltici: öneri aracının seçimi `oneri_araci` + oge (REKLAM-YERLESIM) */
      [].forEach.call(govde.querySelectorAll('[data-ia-secenek]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ia-secenek') === id ? 'true' : 'false'); });
      /* Seçim görünsün diye kısa bekleme; sonra sonraki adım */
      setTimeout(function () { goster(adim + 1, true); }, IA.azHareket() ? 0 : 200);
    };
    api.ic.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ia-secenek]');
      if (b) { sec(b.getAttribute('data-ia-secenek')); return; }
      if (e.target.closest('[data-ia-geri]')) { goster(Math.max(0, adim - 1), true); return; }
      if (e.target.closest('[data-ia-bastan]')) { cevap = {}; goster(0, true); return; }
      var a = e.target.closest('[data-ia-adim]');
      if (a) { goster(+a.getAttribute('data-ia-adim'), true); }
    });
    /* Şeritteki hızlı seçim: ilk soruyu yanıtlar ve panoyu ikinci soruda açar */
    [].forEach.call(api.kok.querySelectorAll('[data-ia-hizli]'), function (b) {
      b.addEventListener('click', function () {
        cevap = {};
        cevap[k.sorular[0].id] = b.getAttribute('data-ia-hizli');
        api.olay('oneri_araci', { oge: cevap[k.sorular[0].id], soru: k.sorular[0].id, secenek: cevap[k.sorular[0].id], yer: 'serit' });
        adim = 1;
        govde.innerHTML = soruHtml();
        if (api.acik()) { goster(1, true); } else { api.ac('hizli', b); }
      });
    });
    govde.innerHTML = soruHtml();
  }

  window.dgReklamArac['aksam-secici'] = { ciz: ciz, kur: kur };
})();
