/* Üye alanı ortak davranışı (canlı hesap ekranları):
   - `data-dm-panel` düğmesi aynı sayfadaki `.fb-modal` penceresini açar, `data-dm-kapat` ve örtü kapatır.
   - Pencere formu prototipte sunucuya gitmez; bu tarayıcıya yazar, satırı listenin başına ekler.
   - `[data-puan="toplam"]` demo kayıtlarındaki kesinleşen puanla dolar.
   - Sekme yerinde değişince (`dg:sekme`, H8) yalnız yeni içerikteki listeler bu tarayıcının kayıtlarıyla dolar; dinleyiciler bir kez bağlıdır. */
(function () {
  'use strict';
  var ortu = document.querySelector('[data-dm-ortu]');
  var acik = null, tetik = null;
  var kapat = function () {
    if (!acik) { return; }
    acik.classList.remove('show', 'open'); acik.setAttribute('inert', '');
    if (ortu) { ortu.classList.remove('show', 'open'); }
    if (tetik) { tetik.setAttribute('aria-expanded', 'false'); tetik.focus(); }
    acik = null; tetik = null;
  };
  var ac = function (p, d) {
    kapat(); acik = p; tetik = d || null;
    p.removeAttribute('inert'); p.classList.add('show', 'open');
    if (ortu) { ortu.classList.add('show', 'open'); }
    if (d) { d.setAttribute('aria-expanded', 'true'); }
    var ilk = p.querySelector('input:not([type=hidden]),select,textarea'); if (ilk) { ilk.focus(); }
  };
  window.dgPencere = { ac: function (id) { var p = document.getElementById(id); if (p) { ac(p); } }, kapat: kapat };
  document.addEventListener('click', function (e) {
    var d = e.target.closest && e.target.closest('[data-dm-panel]');
    if (d) { var p = document.getElementById(d.getAttribute('data-dm-panel')); if (p) { e.preventDefault(); ac(p, d); } return; }
    if (acik && (e.target === ortu || (e.target.closest && e.target.closest('[data-dm-kapat]')))) { e.preventDefault(); kapat(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && acik) { kapat(); } });

  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var bildir = window.prototipBildir || function () {};
  /* Kaydedilen satır `data-dm-hedef` listesinin başına gelir; satırın ikonu, alt metni ve rozeti formun özniteliklerinden */
  var yerlestir = function (f, veri) {
    var hedef = document.querySelector('[data-dm-hedef="' + f.getAttribute('data-dm-form') + '"]'); if (!hedef) { return; }
    var bos = hedef.querySelector('.bos-durum'); if (bos) { bos.remove(); }
    var ad = veri.ad || veri.konu || veri.baslik || 'Yeni kayıt';
    var sablon = function (t) {
      return t.replace(/\{(\w+)\}/g, function (m, k) {
        var el = f.elements[k], o = el && el.options ? [].filter.call(el.options, function (x) { return x.value === veri[k]; })[0] : null;
        return o ? o.text.split(' — ')[0] : (veri[k] || '');
      });
    };
    var alt = sablon(f.getAttribute('data-dm-alt') || 'Bu tarayıcıda kaydedildi');
    /* `data-dm-bag` varsa satırın tamamı kaydın detayına açılır (A8: yeni liste → hesabim/listeler/yeni/?liste=<kimlik>); örnek satırlarla aynı `.tiklanir` + ok */
    var bag = f.getAttribute('data-dm-bag'), kok = document.documentElement.dataset.kok || './';
    var adHtml = bag ? '<a href="' + kac(kok + sablon(bag)) + '">' + kac(ad) + '</a>' : kac(ad);
    hedef.insertAdjacentHTML('afterbegin', '<div class="kalem-satiri' + (bag ? ' tiklanir' : '') + '"' + (veri.id ? ' data-dm-kayit="' + kac(veri.id) + '"' : '') + '><span class="ks-ikon"><i class="' + (f.getAttribute('data-dm-ikon') || 'fa-solid fa-list') + '" aria-hidden="true"></i></span><span class="ks-metin"><b>' + adHtml + '</b><small>' + kac(alt) + '</small></span><span class="ks-uc"><span class="rozet bekleme">' + kac(sablon(f.getAttribute('data-dm-rozet') || 'Yeni')) + '</span>' + (bag ? '<i class="fa-solid fa-chevron-right ks-ok" aria-hidden="true"></i>' : '') + '</span></div>');
  };
  var doldur = function (kapsam) {
    if (!window.dgKayit) { return; }
    [].forEach.call(document.querySelectorAll('form[data-dm-form]'), function (f) {
      var h = document.querySelector('[data-dm-hedef="' + f.getAttribute('data-dm-form') + '"]'); if (!h || (kapsam && !kapsam.contains(h))) { return; }
      window.dgKayit.oku(f.getAttribute('data-dm-form')).slice().reverse().forEach(function (v) { yerlestir(f, v); });
    });
  };
  doldur(null);
  document.addEventListener('dg:sekme', function (e) { ortu = document.querySelector('[data-dm-ortu]'); doldur(e.detail && e.detail.alan); });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('form[data-dm-form]'); if (!f) { return; }
    e.preventDefault();
    if (!f.reportValidity()) { return; }
    var veri = {}; [].forEach.call(f.elements, function (el) { if (el.name) { veri[el.name] = el.type === 'checkbox' ? el.checked : el.value; } });
    var tur = f.getAttribute('data-dm-form');
    veri.id = tur + '-' + Date.now();
    if (window.dgKayit) { window.dgKayit.ekle(tur, veri); }
    yerlestir(f, veri);
    bildir(f.getAttribute('data-dm-mesaj') || 'Kaydedildi. Prototipte yalnız bu tarayıcıda tutulur.');
    f.reset(); kapat();
  });

  if (window.dgPuan) {
    [].forEach.call(document.querySelectorAll('[data-puan="toplam"]'), function (b) { b.textContent = window.dgPuan.toplam('kesin'); });
  }
})();
