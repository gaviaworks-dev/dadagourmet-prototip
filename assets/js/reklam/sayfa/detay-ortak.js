/* Detay ve içerik sayfalarının zengin reklam biçimleri (reklam-detay, 11 Kas · Reklam turu 2, AŞAMA 2/B).
   Yalnız reklam önizlemesi açıkken, sayfa betiği (sayfa/{ana,mekan-detay,etkinlik-detay,lezzet-detay,rehber-detay,hesabim}.js)
   yükler. Kuralları çekirdek uygular (bütçe, öncelik, marka tavanı, mobil %30); burada yalnız kreatifin DOM'u var.
   Kök sınıflar kanonla aynı (`rk-slot rk-serit rk-ince-banner`, `rk-slot rk-rectangle`, `rk-slot rk-pano rk-format-native_showcase`):
   kanonun boşluk, etiket ve gizleme kuralları geçerli kalır; iç düzen `assets/css/reklam/ek/detay.css`.
   Biçimler (kreatifin `sablon` alanı):
   - zengin  · ince şerit, kolon × 120 / 96 px: marka renginde zemin, sağda ürün/mekân fotoğrafı, logo levhası, teklif, çağrı
              (AS-T1, AS-M1, AS-B1, LD-SB1, SR-SB1, HS-SB1). Gerçek karşılığı IAB Leaderboard 728×90 / mobil 320×100.
   - kare    · kenar sütunu kutusu, 4:3 medya (ED-SB1). IAB Medium Rectangle 300×250.
   - kampanya· rezervasyon bağlamında ödeme kampanyası kartı (MD-SB1): "X ile ödeyene %Y", üç adım, çağrı rezervasyon
              penceresini açar (sayfanın kendi `#openRsv` düğmesi). Banka/kart programı restoran kampanyası, Resy × Amex.
   - son     · içerik sonu native öneri, görsel 4:3 + metin (MD-END). Outbrain/Taboola, OpenTable Promoted.
   Fotoğraflar yalnız prototipteki gerçek fotoğraflar (`assets/o/medya/*`); `gorselBaglam: mekan` mekânın kendi fotoğrafını kullanır.
   Bağlar: `B.bag` (bilesen.js): `hedef` iç bağ ya da tam adres; yoksa markanın gerçek sitesi, yeni sekmede (reklam-duzeltici, 11 Kas). */
(function () {
  'use strict';
  var R = window.dgReklam, B = window.dgReklamBilesen, V = window.DG_REKLAM_VERI;
  if (!R || !B || !V || window.dgReklamDetay) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var kac = B.kac;
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var bag = B.bag; /* reklam-duzeltici: tek kaynak bilesen.js (iç hedef, tam adres ya da marka sitesi) */

  /* Ek stil: kanondan SONRA (kanon bağları reklam.css bağından önce durur; ek dosya en sona) */
  if (!document.querySelector('link[data-rk-ek="detay"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = KOK + 'assets/css/reklam/ek/detay.css'; l.setAttribute('data-rk-ek', 'detay');
    document.head.appendChild(l);
  }

  /* Mekân bağlamı: adı ve kendi fotoğrafı (detay sayfasının başlığı ve küçük görselleri) */
  function mekan() {
    var h = document.querySelector('.md-top h1, .rd-stage-info h1');
    var ad = h ? h.textContent.trim() : '';
    var th = [].slice.call(document.querySelectorAll('.rd-thumb[data-img]')).map(function (t) { return t.getAttribute('data-img'); });
    var foto = th.length ? th[th.length > 1 ? 1 : 0].replace(/-1600\.webp$/, '-400.webp') : '';
    return { ad: ad, foto: foto };
  }
  /* Bulunma eki: Mikla'da, Nicole'de, Park Fora'da, Aşk Kahve'de, Sait'te (son ünlü ve sert ünsüz) */
  function bulunma(ad) {
    var k = ad.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü]/g, '');
    if (!k) { return ad; }
    var unlu = (k.match(/[aıoueiöü]/g) || ['a']).pop();
    var e = /[aıou]/.test(unlu) ? 'a' : 'e';
    return ad + "'" + (/[fstkçşhp]$/.test(k) ? 't' : 'd') + e;
  }
  var gorsel = function (k) {
    if (k.gorselBaglam === 'mekan') { var m = mekan(); if (m.foto) { return m.foto; } }
    return k.gorsel ? url(k.gorsel) : '';
  };
  var metin = function (k) {
    var t = k.metin || '';
    if (t.indexOf('{mekan}') >= 0) { var m = mekan(); t = t.replace('{mekan}', m.ad ? bulunma(m.ad) : 'Seçtiğin mekânda'); }
    return t;
  };
  var logo = function (k) { return '<span class="rk-dt-logo">' + B.logo(k) + '</span>'; };
  var teklif = function (k) { return k.teklif ? '<span class="rk-dt-teklif">' + ik('fa-gift') + '<span>' + kac(k.teklif) + '</span></span>' : ''; };
  var kok = function (el, kod, k, sinif) {
    var m = B.marka(k);
    el.className = sinif + ' rk-dt ' + m.renkSinif;
    el.setAttribute('data-rk-slot', kod);
    el.setAttribute('data-rk-kod', kod);
    el.setAttribute('data-rk-marka', k.marka);
    el.setAttribute('data-rk-dt', k.sablon || '');
    el.setAttribute('aria-label', 'Sponsorlu içerik · ' + m.ad);
  };

  var S = {};
  /* ── zengin şerit ── */
  S.zengin = function (el, k, o) {
    kok(el, o.kod, k, 'rk-slot rk-serit rk-ince-banner rk-dt-serit');
    var g = gorsel(k);
    el.innerHTML = '<span class="rk-etiket">Sponsorlu</span><a class="rk-dt-serit-bag" ' + bag(k) + '>' +
      (g ? '<span class="rk-dt-serit-foto" aria-hidden="true"><img src="' + g + '" alt="" width="400" height="300" loading="lazy" decoding="async"></span>' : '') +
      logo(k) + '<span class="rk-dt-serit-metin">' + (k.ust ? '<span class="rk-dt-ust">' + kac(k.ust) + '</span>' : '') +
      '<b>' + kac(k.baslik) + '</b>' + (k.metin ? '<span class="rk-dt-alt">' + kac(metin(k)) + '</span>' : '') + '</span>' + teklif(k) +
      '<span class="rk-dt-cta"><span class="rk-dt-cta-ad">' + kac(k.cta || 'Keşfet') + '</span>' + ik('fa-arrow-right') + '</span></a>';
  };
  /* ── kenar kutusu (4:3 medya) ── */
  S.kare = function (el, k, o) {
    kok(el, o.kod, k, 'rk-slot rk-rectangle rk-dt-kare');
    var g = gorsel(k);
    el.innerHTML = '<a class="rk-dt-kare-bag" ' + bag(k) + '><span class="rk-dt-kare-medya">' +
      (g ? '<img src="' + g + '" alt="" width="400" height="300" loading="lazy" decoding="async">' : '') + logo(k) +
      '<span class="rk-dt-etiket">Sponsorlu</span></span><span class="rk-dt-kare-govde">' +
      (k.ust ? '<span class="rk-dt-ust">' + kac(B.marka(k).ad) + ' · ' + kac(k.ust) + '</span>' : '') +
      '<b>' + kac(k.baslik) + '</b>' + (k.metin ? '<span class="rk-dt-alt">' + kac(metin(k)) + '</span>' : '') + teklif(k) +
      '<span class="rk-dt-cta"><span class="rk-dt-cta-ad">' + kac(k.cta || 'Keşfet') + '</span>' + ik('fa-arrow-right') + '</span></span></a>';
  };
  /* ── rezervasyon / ödeme kampanyası kartı ── */
  S.kampanya = function (el, k, o) {
    kok(el, o.kod, k, 'rk-slot rk-rectangle rk-dt-kampanya');
    var g = gorsel(k), m = mekan(), ad = B.marka(k).ad;
    var adim = (k.adimlar || []).map(function (a, i) { return '<li><span class="rk-dt-adim-no" aria-hidden="true">' + (i + 1) + '</span>' + kac(a) + '</li>'; }).join('');
    var rez = k.eylem === 'rezervasyon' && document.getElementById('openRsv');
    var cta = rez
      ? '<button type="button" class="rk-dt-cta" data-rk-rezervasyon aria-haspopup="dialog">' + ik('fa-calendar-check') + '<span class="rk-dt-cta-ad">' + kac(k.cta || 'Masanı ayır') + '</span></button>'
      : '<a class="rk-dt-cta" ' + bag(k) + '><span class="rk-dt-cta-ad">' + kac(k.cta || 'Keşfet') + '</span>' + ik('fa-arrow-right') + '</a>';
    el.innerHTML = '<div class="rk-dt-kampanya-kart"><div class="rk-dt-kampanya-medya">' +
      (g ? '<img src="' + g + '" alt="" width="400" height="300" loading="lazy" decoding="async">' : '') + logo(k) +
      '<span class="rk-dt-etiket">Sponsorlu</span>' +
      (k.rozet ? '<span class="rk-dt-rozet"><b>' + kac(k.rozet) + '</b><span>' + kac(k.rozetAlt || '') + '<small>' + kac(ad) + ' ile ödeyene</small></span></span>' : '') + '</div>' +
      '<div class="rk-dt-kampanya-govde"><span class="rk-dt-ust">' + kac(k.ust || 'Kampanya') + (m.ad ? ' · ' + kac(m.ad) : '') + '</span>' +
      '<b class="rk-dt-baslik">' + kac(k.baslik) + '</b>' + (k.metin ? '<p class="rk-dt-alt">' + kac(metin(k)) + '</p>' : '') +
      (adim ? '<ol class="rk-dt-adim" aria-label="Kampanya nasıl işler">' + adim + '</ol>' : '') + cta +
      (k.kosul ? '<a class="rk-dt-kosul" ' + bag({ marka: k.marka, hedef: k.kosulHedef }) + '>' + kac(k.kosul) + ' ' + ik('fa-arrow-up-right-from-square') + '</a>' : '') +
      '</div></div>';
    var d = el.querySelector('[data-rk-rezervasyon]');
    if (d && rez) {
      var f = function () { rez.click(); };
      d.addEventListener('click', f);
    }
  };
  /* ── içerik sonu native öneri ── */
  S.son = function (el, k, o) {
    kok(el, o.kod, k, 'rk-slot rk-pano rk-format-native_showcase rk-dt-son');
    var g = gorsel(k), m = B.marka(k);
    var meta = (k.meta || []).map(function (x) { return '<span>' + ik(x[0]) + kac(x[1]) + '</span>'; }).join('');
    el.innerHTML = '<span class="rk-etiket">Sponsorlu</span><a class="rk-dt-son-bag" ' + bag(k) + '>' +
      (g ? '<span class="rk-dt-son-medya"><img src="' + g + '" alt="" width="800" height="600" loading="lazy" decoding="async"></span>' : '') +
      '<span class="rk-dt-son-govde"><span class="rk-dt-son-kimlik">' + logo(k) + '<span>Sponsorlu · ' + kac(m.kisaAd || m.ad) + '</span></span>' +
      (k.ust ? '<span class="rk-dt-ust">' + kac(k.ust) + '</span>' : '') + '<b>' + kac(k.baslik) + '</b>' +
      (k.metin ? '<span class="rk-dt-alt">' + kac(metin(k)) + '</span>' : '') + (meta ? '<span class="rk-dt-meta">' + meta + '</span>' : '') +
      '<span class="rk-dt-son-alt">' + teklif(k) + '<span class="rk-dt-cta"><span class="rk-dt-cta-ad">' + kac(k.cta || 'Keşfet') + '</span>' + ik('fa-arrow-right') + '</span></span></span></a>';
  };

  window.dgReklamDetay = {
    sablon: S,
    /* Çekirdeğin yerleştirdiği kabı yerinde doldurur (kap çekirdeğin söküm listesinde: yerini değiştirmeyiz) */
    doldur: function (el, k, o) {
      var f = S[k.sablon];
      if (!f) { return false; }
      f(el, k, o);
      return true;
    }
  };
})();
