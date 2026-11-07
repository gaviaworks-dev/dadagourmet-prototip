/* Gurme Panelim: bu tarayıcıdaki demo kayıtlarını ilgili sekmenin başına ekler. */
(function () {
  'use strict';
  var K = window.dgKayit, liste = document.querySelector('.fp-list'), sekme = document.documentElement.dataset.yol.split('/').pop(); if (!K || !liste) { return; }
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var satir = function (ikon, ad, alt, rozet) { return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><span class="ks-metin"><b>' + kac(ad) + '</b><small>' + kac(alt) + '</small></span><span class="ks-uc"><span class="rozet pasif">' + kac(rozet) + '</span></span></div>'; };
  var ekle = function (html) { if (!html) { return; } var b = liste.querySelector('.bos-durum'); if (b) { b.parentNode.removeChild(b); } liste.insertAdjacentHTML('afterbegin', html); };
  var yazicilar = {
    'degerlendirmelerim': function () { return K.oku('degerlendirme').map(function (k) { return satir('fa-star', k.mekan, 'Lezzet ' + k.lezzet + ' · Servis ' + k.servis + ' · Ambiyans ' + k.ambiyans + (k.foto ? ' · Fotoğraflı' : ''), 'İnceleniyor · +' + k.tutar + ' bekleyen'); }).join(''); },
    'ziyaret-gecmisim': function () { return K.oku('ziyaret').map(function (k) { return satir('fa-circle-check', k.mekan, k.yer + ' · ' + k.gun, 'Ziyaret edildi'); }).join(''); },
    'topluluk-katkilarim': function () { return K.oku('oneri').map(function (k) { return satir('fa-location-dot', k.ad, 'Mekân önerisi' + (k.yer ? ' · ' + k.yer : ''), 'İnceleniyor · +50 bekleyen'); }).join(''); },
    'gurme-panelim': function () { return K.oku('rezervasyon').map(function (k) { return satir('fa-utensils', k.mekan, k.yer + ' · ' + k.kisi + ' kişi · ' + k.gun.split('-').reverse().join('.') + ' ' + k.saat + (k.alerjen ? ' · Alerjen notu var' : ''), 'Mekân sahibi onayı bekleniyor'); }).join('') + K.oku('randevu').map(function (k) { return satir('fa-calendar-days', k.ad, k.yer + ' · ' + k.kisi + ' kişi · ' + k.gun.split('-').reverse().join('.'), 'Etkinlik randevusu'); }).join(''); },
    'gurme-favorilerim': function () { return K.oku('favori').map(function (k) { return satir(k.tur === 'Etkinlik' ? 'fa-calendar-days' : 'fa-bowl-food', k.ad, k.tur + ' · ' + k.mekan, k.tur); }).join(''); }
  };
  if (yazicilar[sekme]) { ekle(yazicilar[sekme]()); }
  /* Puan: Topluluk Katkılarım'daki iki örnek satırın tutarı artı bu tarayıcıdaki kayıtlar */
  var kesin = 50, bekleyen = 50 + K.oku('puan').reduce(function (t, k) { return t + k.tutar; }, 0);
  var bant = document.querySelector('.kimlik-giris');
  if (bant) { bant.insertAdjacentHTML('afterend', '<p class="kimlik-puan"><i class="fa-solid fa-award" aria-hidden="true"></i> <b>' + kesin + '</b> kesinleşen · <b>' + bekleyen + '</b> bekleyen puan <span class="ornek-etiket">prototip örneği</span></p>'); }
  var yaz = function (s, v) { var e = document.querySelector(s); if (e) { e.textContent = v; } };
  yaz('[data-puan="kesin"]', kesin); yaz('[data-puan="bekleyen"]', bekleyen);
  var defter = document.getElementById('puanDefter');
  if (defter) { defter.insertAdjacentHTML('afterbegin', K.oku('puan').map(function (k) { return satir('fa-clock-rotate-left', k.ad, 'Bu tarayıcıdaki işlem', '+' + k.tutar + ' bekliyor'); }).join('')); }
})();
