/* İşletme Paneli ve Yönetim: demo kayıtlarına karar verir. Kayıt yalnız bu tarayıcıda durur; üye aynı kaydı Gurme Panelim'de görür.
   Mekân sahibi talebi onaylar, reddeder, ziyareti işaretler. Yönetim öneri ve değerlendirmeyi yayına alır, rezervasyonu yalnız iptal eder (§8 #17). */
(function () {
  'use strict';
  var K = window.dgKayit, P = window.dgPuan, bildir = window.prototipBildir || function () {};
  var ekran = document.querySelector('[data-karar-ekrani]'); if (!K || !ekran) { return; }
  var rol = ekran.dataset.kararEkrani;
  var not = ekran.querySelector('[data-rol-notu]'); if (not && window.dgRol && window.dgRol() !== rol) { not.hidden = false; }
  var kac = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var et = '<span class="ornek-etiket">prototip örneği</span> ';
  var tarih = function (g) { return String(g || '').split('-').reverse().join('.'); };
  var gecti = function (k) { return new Date(k.gun + 'T' + (k.saat || '23:59')) < new Date(); };
  var dugme = function (tur, id, karar, ad, birincil) { return '<button type="button" class="dugme kucuk ' + (birincil ? 'birincil' : 'ikincil') + '" data-tur="' + tur + '" data-id="' + kac(id) + '" data-karar="' + karar + '">' + ad + '</button>'; };
  var satir = function (ikon, ad, alt, rozet, sinif, uc) { return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><span class="ks-metin"><b>' + ad + '</b><small>' + kac(alt) + '</small></span><span class="ks-uc">' + uc + '<span class="rozet ' + sinif + '">' + kac(rozet) + '</span></span></div>'; };
  var bos = function (m) { return '<div class="bos-durum"><h4>' + m + '</h4></div>'; };
  var REZ = { talep: ['Beklemede', 'bekleme'], onaylandi: ['Onaylandı', 'olumlu'], reddedildi: ['Reddedildi', 'durdu'], iptal: ['İptal edildi', 'pasif'], gerceklesti: ['Gerçekleşti', 'olumlu'], gelmedi: ['Gelinmedi', 'pasif'] };
  var CIZ = {
    rezervasyon: function () {
      return K.oku('rezervasyon').map(function (k) {
        var d = k.durum || 'talep', r = REZ[d] || REZ.talep, uc = '';
        if (rol === 'isletme' && d === 'talep') { uc = dugme('rezervasyon', k.id, 'reddedildi', 'Reddet') + dugme('rezervasyon', k.id, 'onaylandi', 'Onayla', true); }
        if (rol === 'isletme' && d === 'onaylandi' && gecti(k)) { uc = dugme('rezervasyon', k.id, 'gelmedi', 'Gelinmedi') + dugme('rezervasyon', k.id, 'gerceklesti', 'Gerçekleşti', true); }
        if (rol === 'yonetici' && (d === 'talep' || (d === 'onaylandi' && !gecti(k)))) { uc = dugme('rezervasyon', k.id, 'iptal', 'İptal et'); }
        var misafir = k.ornek ? 'Prototip örneği misafir' : 'Örnek Üye';
        return satir('fa-calendar-check', (k.ornek ? et : '') + kac(misafir + ' · ' + k.kisi + ' kişi'), k.mekan + ' · ' + tarih(k.gun) + ' ' + k.saat + (k.alerjen ? ' · Alerjen: ' + k.alerjen : '') + (k.not ? ' · Not: ' + k.not : ''), r[0], r[1], uc);
      }).join('') || bos('Bekleyen talep yok');
    },
    oneri: function () {
      return K.oku('oneri').map(function (k) {
        var d = k.durum || 'inceleniyor', uc = d === 'inceleniyor' ? dugme('oneri', k.id, 'reddedildi', 'Reddet') + dugme('oneri', k.id, 'yayinda', 'Yayına al', true) : '';
        var r = { inceleniyor: ['İnceleniyor', 'bekleme'], yayinda: ['Yayında', 'olumlu'], reddedildi: ['Yayınlanmadı', 'durdu'] }[d];
        return satir(k.tur === 'etkinlik' ? 'fa-calendar-days' : 'fa-location-dot', (k.ornek ? et : '') + kac(k.ad), (k.tur === 'etkinlik' ? 'Etkinlik önerisi' : 'Mekân önerisi') + (k.yer ? ' · ' + k.yer : '') + (k.gun ? ' · ' + tarih(k.gun) : ''), r[0], r[1], uc);
      }).join('') || bos('Bekleyen öneri yok');
    },
    degerlendirme: function () {
      return K.oku('degerlendirme').map(function (k) {
        var d = k.durum || 'inceleniyor', uc = d === 'inceleniyor' ? dugme('degerlendirme', k.id, 'reddedildi', 'Reddet') + dugme('degerlendirme', k.id, 'yayinda', 'Yayına al', true) : '';
        var r = { inceleniyor: ['İnceleniyor', 'bekleme'], yayinda: ['Yayında', 'olumlu'], reddedildi: ['Yayınlanmadı', 'durdu'] }[d];
        return satir('fa-star', kac(k.mekan + ' · Örnek Üye'), 'Lezzet ' + k.lezzet + ' · Servis ' + k.servis + ' · Ambiyans ' + k.ambiyans + (k.foto ? ' · Fotoğraflı' : '') + (k.metin ? ' · ' + k.metin.slice(0, 80) : ''), r[0], r[1], uc);
      }).join('') || bos('Bekleyen değerlendirme yok');
    }
  };
  var ciz = function () { [].forEach.call(ekran.querySelectorAll('[data-liste]'), function (l) { l.innerHTML = CIZ[l.dataset.liste](); }); };
  /* Karar: kaydın durumu değişir; puan onayda kesinleşir, ret ve gelinmeyen ziyarette düşer */
  var PUAN = { onaylandi: null, gerceklesti: 'kesinlestir', gelmedi: 'dusur', reddedildi: 'dusur', iptal: 'dusur', yayinda: 'kesinlestir' };
  var ILETI = { onaylandi: 'Talep onaylandı; misafirin Rezervasyonlarım ekranına düştü.', reddedildi: 'Karar kaydedildi; misafire Onaylanmadı olarak görünür.', gerceklesti: 'Ziyaret işaretlendi; misafirin +25 puanı kesinleşti.', gelmedi: 'Gelinmedi olarak işaretlendi; bekleyen puan düştü.', iptal: 'Talep iptal edildi; misafire İptal edildi olarak görünür.', yayinda: 'Yayına alındı; üyenin bekleyen puanı kesinleşti.' };
  ekran.addEventListener('click', function (e) {
    var b = e.target.closest('[data-karar]'); if (!b) { return; }
    var karar = b.dataset.karar, id = b.dataset.id;
    K.guncelle(b.dataset.tur, id, { durum: karar });
    if (PUAN[karar]) { P[PUAN[karar]](id); }
    bildir(ILETI[karar]); ciz();
  });
  ciz();
})();
