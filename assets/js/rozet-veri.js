/* Rozet ve rütbe seti: tek kaynak (K3, 11 Kas). Beyar onaylı örnek set (8 rozet, 5 rütbe; `c65f775`, onay 9 Kas).
   Okuyanlar: Gurme Panelim (`assets/js/sayfa/panel.js`), Rozetlerim (`assets/js/sayfa/rozetlerim.js`) ve derlemede
   `_src/sayfalar/hesabim/_rozet.mjs` (Rozetlerim kartları ve merdiveni, Gurme Panelim kural satırları).
   Puan değerleri burada yok: tek yerleri `prototip.js` `dgPuan.KURAL`; metindeki `{yorum}` gibi yer tutucular oradan dolar.
   Rozet yalnız onaylanmış eylemden kazanılır (`olcu`: aşağıdaki `olcumler` anahtarı); rütbe kesinleşen puandan.
   `durum`: Gurme Panelim satırındaki onaylı kısa metin. `nasil`: Rozetlerim kartının ipucu metni. */
window.DG_ROZET = {
  /* Rozetlerim aileleri; galeri bu sırayla gruplanır */
  aileler: [
    { k: 'degerlendirme', ikon: 'fa-star', ad: 'Değerlendirme', not: 'Ölçü: yayına giren değerlendirmelerin ve onlara eklediğin tabak fotoğrafları.' },
    { k: 'katki', ikon: 'fa-location-dot', ad: 'Topluluk Katkısı', not: 'Ölçü: editör onayından geçip yayına giren mekân ve etkinlik önerilerin.' },
    { k: 'masa', ikon: 'fa-calendar-check', ad: 'Rezervasyon ve Etkinlik', not: 'Ölçü: gerçekleşen rezervasyonların ve oluşturduğun etkinlik randevuları.' },
    { k: 'ziyaret', ikon: 'fa-circle-check', ad: 'Ziyaret', not: 'Ölçü: mekân sayfasında Ziyaret Ettim ile işaretlediğin mekânlar.' }
  ],
  /* Onaylı sıra (Gurme Panelim listesi bu sırayı izler) */
  rozetler: [
    { k: 'ilk-tadim', ikon: 'fa-star', ad: 'İlk Tadım', aile: 'degerlendirme', olcu: 'degerlendirme', esik: 1, durum: 'İlk değerlendirmen yayına girdi', nasil: 'İlk değerlendirmen yayına girsin. Mekânı puanlaman yeter.' },
    { k: 'gurme-kalem', ikon: 'fa-pen-nib', ad: 'Gurme Kalem', aile: 'degerlendirme', olcu: 'degerlendirme', esik: 5, durum: '5 değerlendirmen yayına girdi', nasil: 'Beş değerlendirmen yayına girsin.' },
    { k: 'tabak-avcisi', ikon: 'fa-camera', ad: 'Tabak Avcısı', aile: 'degerlendirme', olcu: 'foto', esik: 3, durum: 'Fotoğraflı 3 değerlendirmen yayına girdi', nasil: 'Fotoğraflı üç değerlendirmen yayına girsin.' },
    { k: 'kasif', ikon: 'fa-location-dot', ad: 'Kâşif', aile: 'katki', olcu: 'oneriMekan', esik: 1, durum: 'İlk mekân önerin yayına girdi', nasil: 'İlk mekân önerin yayına girsin.' },
    { k: 'hasat-habercisi', ikon: 'fa-calendar-plus', ad: 'Hasat Habercisi', aile: 'katki', olcu: 'oneriEtkinlik', esik: 1, durum: 'İlk etkinlik önerin yayına girdi', nasil: 'İlk etkinlik önerin yayına girsin.' },
    { k: 'masa-mudavimi', ikon: 'fa-utensils', ad: 'Masa Müdavimi', aile: 'masa', olcu: 'rezervasyon', esik: 1, durum: 'İlk rezervasyonun gerçekleşti', nasil: 'İlk rezervasyonun gerçekleşsin: mekân sahibi onaylar, sen gidersin.' },
    { k: 'yol-arkadasi', ikon: 'fa-circle-check', ad: 'Yol Arkadaşı', aile: 'ziyaret', olcu: 'ziyaret', esik: 3, durum: '3 mekânı Ziyaret Ettim ile işaretledin', nasil: 'Üç mekânı Ziyaret Ettim ile işaretle.' },
    { k: 'etkinlik-dostu', ikon: 'fa-ticket', ad: 'Etkinlik Dostu', aile: 'masa', olcu: 'randevu', esik: 1, durum: 'İlk etkinlik randevunu oluşturdun', nasil: 'Lezzet Takvimi\'nden ilk etkinlik randevunu oluştur.' }
  ],
  /* Rütbe merdiveni: kesinleşen puan eşiği. İkon Rozetlerim merdiveninde ve kademe rozetinde görünür */
  rutbeler: [
    { k: 'merakli', ikon: 'fa-heart', ad: 'Meraklı', esik: 0 },
    { k: 'lezzet-avcisi', ikon: 'fa-utensils', ad: 'Lezzet Avcısı', esik: 100 },
    { k: 'gurme', ikon: 'fa-bowl-food', ad: 'Gurme', esik: 300 },
    { k: 'usta-gurme', ikon: 'fa-user-tie', ad: 'Usta Gurme', esik: 700 },
    { k: 'sef-masasi', ikon: 'fa-gem', ad: 'Şef Masası', esik: 1500 }
  ],
  /* Dada Puan kuralları (şartname): `k` = `dgPuan.KURAL` anahtarı. Gurme Panelim › Puan nasıl kazanılır? */
  puanKurallari: [
    { k: 'yorum', ikon: 'fa-comment-dots', ad: 'Yorum veya fotoğraf', onay: 'Moderasyon onayında kesinleşir' },
    { k: 'oneri', ikon: 'fa-location-dot', ad: 'Mekân veya etkinlik önerisi', onay: 'Editör onayında kesinleşir' },
    { k: 'puanlama', ikon: 'fa-star', ad: 'Puanlama', onay: 'Moderasyon onayında kesinleşir' },
    { k: 'rezervasyon', ikon: 'fa-calendar-check', ad: 'Gerçekleşen rezervasyon', onay: 'Mekân sahibi onayı ve ziyaretten sonra kesinleşir' }
  ],
  /* Rozetlerim › Puan Defteri kartları: puan hareketleri bu üç kümeye ayrılır */
  puanAileleri: [
    { k: 'degerlendirme', ikon: 'fa-comment-dots', ad: 'Değerlendirme', kisa: 'Değerlendirme', alt: 'yorum veya fotoğraf +{yorum} · puanlama +{puanlama}' },
    { k: 'oneri', ikon: 'fa-location-dot', ad: 'Mekân ve etkinlik önerisi', kisa: 'Öneri', alt: 'öneri başına +{oneri}' },
    { k: 'rezervasyon', ikon: 'fa-calendar-check', ad: 'Gerçekleşen rezervasyon', kisa: 'Rezervasyon', alt: 'rezervasyon başına +{rezervasyon}' }
  ],
  /* Rozet ölçüleri: bu tarayıcıdaki demo kayıtlarından (`dgKayit`) */
  olcumler: function (K) {
    var say = function (tur, kosul) { return K.oku(tur).filter(kosul || function () { return true; }).length; };
    var yayinda = function (k) { return k.durum === 'yayinda'; };
    return {
      degerlendirme: say('degerlendirme', yayinda),
      foto: say('degerlendirme', function (k) { return yayinda(k) && k.foto; }),
      oneri: say('oneri', yayinda),
      oneriMekan: say('oneri', function (k) { return yayinda(k) && k.tur !== 'etkinlik'; }),
      oneriEtkinlik: say('oneri', function (k) { return yayinda(k) && k.tur === 'etkinlik'; }),
      rezervasyon: say('rezervasyon', function (k) { return k.durum === 'gerceklesti'; }),
      ziyaret: say('ziyaret'),
      randevu: say('randevu')
    };
  },
  /* `{anahtar}` yer tutucularını puan değeriyle doldurur */
  yerles: function (metin, kural) { return String(metin).replace(/\{(\w+)\}/g, function (t, a) { return a in kural ? kural[a] : t; }); }
};
