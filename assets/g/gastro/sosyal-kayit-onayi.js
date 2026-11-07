/* Revize 5 · madde 51 — /kayit'teki Google/Facebook düğmesi iki onay kutusu
   (Üyelik Sözleşmesi + KVKK aydınlatma) işaretlenmeden sağlayıcıya gitmez.
   Eksikse onay satırlarının hemen altındaki `#kayitFormErr` (donörün kendi hata
   satırı) dil dosyasındaki cümleyle açılır ve ilk boş kutu odaklanır. İşaretliyse
   onay CSRF'li bir POST ile `kimlik.sosyal.kayit`e taşınır (DadaFit portu).
   Asıl kapı sunucuda: onaysız gelen istekle yeni hesap açılmaz, onay ekranı çıkar. */
(function () {
  'use strict';
  var form = document.getElementById('formKayit');
  var satir = document.getElementById('kayitFormErr');
  if (!form || !satir) { return; }
  var kutular = [document.getElementById('cbUyelik'), document.getElementById('cbKvkk')];
  var uyari = satir.getAttribute('data-sosyal-onay-uyari') || '';
  var metin = satir.querySelector('span');

  function eksikler() {
    return kutular.filter(function (k) { return !k || !k.checked; });
  }

  form.querySelectorAll('.sosyal-dugme[data-kayit-url]').forEach(function (dugme) {
    dugme.addEventListener('click', function (e) {
      e.preventDefault();
      var eksik = eksikler();
      if (eksik.length) {
        metin.textContent = uyari;
        satir.classList.add('acik');
        /* Düğme formun başında, kutular sonunda: odak tek başına kutuyu görünür kılar ama
           cümle ekranın altında (1440'ta) ya da çerez şeridinin altında (390'da) kalıyordu
           (ölçüldü). Cümle ortaya getirilir; kutular hemen üstünde görünür. */
        if (eksik[0]) { eksik[0].focus({ preventScroll: true }); }
        satir.scrollIntoView({ block: 'center' });
        return;
      }
      var token = form.querySelector('input[name="_token"]');
      var gonder = document.createElement('form');
      gonder.method = 'POST';
      gonder.action = dugme.getAttribute('data-kayit-url');
      gonder.hidden = true;
      [['_token', token ? token.value : ''], ['sozlesme', '1'], ['aydinlatma', '1']].forEach(function (alan) {
        var girdi = document.createElement('input');
        girdi.type = 'hidden';
        girdi.name = alan[0];
        girdi.value = alan[1];
        gonder.appendChild(girdi);
      });
      document.body.appendChild(gonder);
      gonder.submit();
    });
  });

  /* Kutular tamamlanınca bu uyarı düşer; sunucunun başka bir hatası yerinde kalır. */
  kutular.forEach(function (k) {
    if (!k) { return; }
    k.addEventListener('change', function () {
      if (metin.textContent === uyari && !eksikler().length) {
        metin.textContent = '';
        satir.classList.remove('acik');
      }
    });
  });
})();
