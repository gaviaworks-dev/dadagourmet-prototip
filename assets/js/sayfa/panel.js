/* Gurme Panelim: bu tarayıcıdaki demo kayıtlarını ilgili sekmenin başına ekler.
   Durumu İşletme Paneli (rezervasyon) ve Yönetim (öneri, değerlendirme) değiştirir; puan onayda kesinleşir. */
(function () {
  'use strict';
  var K = window.dgKayit, P = window.dgPuan, kok = document.documentElement.dataset.kok || './';
  var liste = document.querySelector('.fp-list'), sekme = document.documentElement.dataset.yol.split('/').pop(); if (!K || !liste) { return; }
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var et = '<span class="ornek-etiket">prototip örneği</span> ';
  var satir = function (ikon, ad, alt, rozet, sinif, uc) { return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><span class="ks-metin"><b>' + ad + '</b><small>' + kac(alt) + '</small></span><span class="ks-uc">' + (uc || '') + '<span class="rozet ' + (sinif || 'pasif') + '">' + kac(rozet) + '</span></span></div>'; };
  var ad = function (k, metin) { return (k.ornek ? et : '') + kac(metin); };
  var tarih = function (g) { return String(g || '').split('-').reverse().join('.'); };
  var gecti = function (k) { return new Date(k.gun + 'T' + (k.saat || '23:59')) < new Date(); };
  var REZ = { talep: ['Mekân sahibi onayı bekleniyor', 'bekleme'], onaylandi: ['Onaylandı', 'olumlu'], reddedildi: ['Onaylanmadı', 'durdu'], iptal: ['İptal edildi', 'pasif'], gerceklesti: ['Gerçekleşti · +25 kesinleşti', 'olumlu'], gelmedi: ['Gelinmedi', 'pasif'] };
  var ONERI = { inceleniyor: ['İnceleniyor · +50 bekleyen', 'bekleme'], yayinda: ['Yayında · +50 kesinleşti', 'olumlu'], reddedildi: ['Yayınlanmadı', 'durdu'] };
  var degerlendirdi = function (mekan) { return K.oku('degerlendirme').some(function (d) { return d.mekan === mekan; }); };
  var yazicilar = {
    'degerlendirmelerim': function () { return K.oku('degerlendirme').map(function (k) { var y = k.durum === 'yayinda'; return satir('fa-star', ad(k, k.mekan), 'Lezzet ' + k.lezzet + ' · Servis ' + k.servis + ' · Ambiyans ' + k.ambiyans + (k.foto ? ' · Fotoğraflı' : ''), y ? 'Yayında · +' + k.tutar + ' kesinleşti' : 'İnceleniyor · +' + k.tutar + ' bekleyen', y ? 'olumlu' : 'bekleme'); }).join(''); },
    'ziyaret-gecmisim': function () { return K.oku('ziyaret').map(function (k) { return satir('fa-circle-check', ad(k, k.mekan), k.yer + ' · ' + k.gun, 'Ziyaret edildi'); }).join(''); },
    'topluluk-katkilarim': function () { return K.oku('oneri').map(function (k) { var d = ONERI[k.durum] || ONERI.inceleniyor; return satir(k.tur === 'etkinlik' ? 'fa-calendar-days' : 'fa-location-dot', ad(k, k.ad), (k.tur === 'etkinlik' ? 'Etkinlik önerisi' : 'Mekân önerisi') + (k.yer ? ' · ' + k.yer : '') + (k.gun ? ' · ' + tarih(k.gun) : ''), d[0], d[1]); }).join(''); },
    'gurme-panelim': function () {
      /* Ziyaret saati geçen onaylı rezervasyon değerlendirmeye çağırır (şartname akış 5) */
      var cagri = K.oku('rezervasyon').filter(function (k) { return (k.durum === 'onaylandi' || k.durum === 'gerceklesti') && gecti(k) && !degerlendirdi(k.mekan); }).map(function (k) {
        return '<div class="bilgi-notu"><i class="fa-solid fa-star" aria-hidden="true"></i><p><b>' + kac(k.mekan) + ' ziyaretin nasıldı?</b> ' + tarih(k.gun) + ' tarihli rezervasyonun geçti. Lezzet, servis ve ambiyansı puanla; tabak fotoğrafı eklersen +' + (P.KURAL.yorum + P.KURAL.puanlama) + ' bekleyen puan kazanırsın. <a href="' + kok + 'mekan/mikla/#yorumlar">Değerlendir</a></p></div>';
      }).join('');
      if (cagri) { var bas = document.querySelector('.bolum-bas'); if (bas) { bas.insertAdjacentHTML('afterend', cagri); } }
      return K.oku('rezervasyon').map(function (k) { var d = REZ[k.durum] || REZ.talep; return satir('fa-utensils', ad(k, k.mekan), k.yer + ' · ' + k.kisi + ' kişi · ' + tarih(k.gun) + ' ' + k.saat + (k.alerjen ? ' · Alerjen notu var' : ''), d[0], d[1]); }).join('') +
        K.oku('randevu').map(function (k) { return satir('fa-calendar-days', ad(k, k.ad), k.yer + ' · ' + k.kisi + ' kişi · ' + tarih(k.gun), 'Etkinlik randevusu'); }).join('');
    },
    'gurme-favorilerim': function () { return K.oku('favori').map(function (k) { return satir(k.tur === 'Etkinlik' ? 'fa-calendar-days' : 'fa-bowl-food', ad(k, k.ad), k.tur + ' · ' + k.mekan, k.tur); }).join(''); }
  };
  if (yazicilar[sekme]) { var h = yazicilar[sekme](); if (h) { var b = liste.querySelector('.bos-durum'); if (b) { b.parentNode.removeChild(b); } liste.insertAdjacentHTML('afterbegin', h); } }
  /* Puan: kesinleşen ve bekleyen tutar kayıtlardan; düşen (reddedilen) sayılmaz */
  var kesin = P.toplam('kesin'), bekleyen = P.toplam('bekliyor');
  var bant = document.querySelector('.kimlik-meta');
  if (bant) { bant.insertAdjacentHTML('afterend', '<p class="kimlik-puan"><i class="fa-solid fa-award" aria-hidden="true"></i> <b>' + kesin + '</b> kesinleşen · <b>' + bekleyen + '</b> bekleyen puan</p>'); }
  var yaz = function (s, v) { var e = document.querySelector(s); if (e) { e.textContent = v; } };
  yaz('[data-puan="kesin"]', kesin); yaz('[data-puan="bekleyen"]', bekleyen);
  var defter = document.getElementById('puanDefter');
  var PD = { kesin: ['kesinleşti', 'olumlu'], bekliyor: ['bekliyor', 'bekleme'], dustu: ['düştü', 'durdu'] };
  if (defter) { defter.innerHTML = K.oku('puan').map(function (k) { var d = PD[k.durum || 'bekliyor']; return satir('fa-clock-rotate-left', ad(k, k.ad), k.durum === 'kesin' ? 'Onaylandı' : k.durum === 'dustu' ? 'Onaylanmadı' : 'Onay bekliyor', '+' + k.tutar + ' ' + d[0], d[1]); }).join('') || '<div class="bos-durum"><h4>Henüz puan hareketin yok</h4></div>'; }
  if (window.dgRozet) { window.dgRozet(kesin); }
})();
