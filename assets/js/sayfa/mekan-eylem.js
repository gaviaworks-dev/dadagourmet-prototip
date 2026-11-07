/* Mekân detayı eylemleri. Sonuç yalnız bu tarayıcıda `dgKayit` ile tutulur ve Gurme Panelim'de görünür; hiçbir yere gönderilmez. */
(function () {
  'use strict';
  var K = window.dgKayit, bildir = window.prototipBildir, MEKAN = 'Mikla';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* Ne Yenir, Ne Alınır sekmeleri Genel Bakış içindeki bölüme kaydırır */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-kaydir]'); if (!t) { return; }
    var hedef = document.getElementById(t.dataset.kaydir), genel = $('#mdTabs .dt[data-pane="genel"]:not([data-kaydir])');
    setTimeout(function () { t.classList.remove('active'); if (genel) { genel.classList.add('active'); } hedef.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 0);
  });

  /* Tabak favorisi */
  var tabakBoya = function (b) {
    var on = K.var('favori', 'tabak-' + b.dataset.favoriTabak), i = $('i', b);
    b.setAttribute('aria-pressed', on ? 'true' : 'false'); i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart'; $('span', b).textContent = on ? 'Favorilerinde' : 'Favoriye Ekle';
  };
  $$('[data-favori-tabak]').forEach(function (b) {
    tabakBoya(b);
    b.addEventListener('click', function () {
      if (!window.dgUye()) { return; }
      var id = 'tabak-' + b.dataset.favoriTabak;
      if (K.var('favori', id)) { K.sil('favori', id); bildir('Favorilerinden çıkarıldı.'); } else { K.ekle('favori', { id: id, tur: 'Tabak', ad: b.dataset.ad.replace(/^Örnek tabak: /, ''), mekan: MEKAN }); bildir('Gurme Favorilerim\'e eklendi.'); }
      tabakBoya(b);
    });
  });

  /* Rezervasyon talebi: canlı betik formu `form.submit()` ile gönderir; prototipte sunucu yok. Talep bu tarayıcıya yazılır, onayı mekân sahibi verir (§8 #17) */
  var form = $('#rsvForm');
  if (form) {
    var deger = function (id) { return ($(id) || {}).value || ''; };
    var doldur = function (ad, v) { var i = $('[name="' + ad + '"]', form); if (i && !i.value) { i.value = v; } };
    doldur('guest_name', 'Örnek Üye'); doldur('guest_phone', '0500 000 00 00'); doldur('guest_email', 'ornek@eposta.com');
    form.submit = function () {
      var gun = deger('#rsvDateInput'), saat = deger('#rsvSlotInput'), kisi = deger('#rsvPartySizeInput'), alerjen = deger('#rsvAlerjen').trim();
      K.ekle('rezervasyon', { id: 'rez-' + gun + '-' + saat, mekan: MEKAN, yer: 'Beyoğlu, İstanbul', gun: gun, saat: saat, kisi: +kisi, alerjen: alerjen, not: deger('#rsvNote').trim() });
      var tarih = gun.split('-').reverse().join('.');
      $('#rsvRecap').innerHTML = '<span><i class="fa-solid fa-user-group" aria-hidden="true"></i> ' + kisi + ' kişi</span><span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + tarih + '</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + saat + '</span>' + (alerjen ? '<span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Alerjen notu var</span>' : '');
      $('#rsvSuccessText').textContent = 'Talebin mekân sahibine iletildi. Onaylanınca kesinleşir; durumu Rezervasyonlarım sekmesinde görürsün.';
      $$('.rsv-step', form).forEach(function (a) { a.classList.toggle('active', a.dataset.pane === '3'); });
      $$('#rsvProg .pstep').forEach(function (a) { var n = +a.dataset.step; a.classList.toggle('cur', n === 3); a.classList.toggle('done', n < 3); });
      $$('#rsvProg .pline').forEach(function (a) { a.classList.add('done'); });
    };
  }
})();
