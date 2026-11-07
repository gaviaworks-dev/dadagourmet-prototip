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

  /* Değerlendirme: lezzet, servis, ambiyans ve fotoğraf. Moderasyona gider; puan bekler, onayda kesinleşir */
  var rev = $('#dgRev'), P = window.dgPuan.KURAL, oy = {};
  if (rev) {
    var foto = $('#dgRevFoto'), metin = $('#dgRevMetin');
    var kazanc = function () { return P.puanlama + (metin.value.trim() || foto.files.length ? P.yorum : 0); };
    var puanYaz = function () { var yorumlu = metin.value.trim() || foto.files.length; $('#dgRevPuan').innerHTML = '<i class="fa-solid fa-award" aria-hidden="true"></i> Puanlama +' + P.puanlama + (yorumlu ? ', yorum veya fotoğraf +' + P.yorum : '') + ' = <b>+' + kazanc() + ' bekleyen puan</b>' + (yorumlu ? '' : '. Yorum ya da fotoğraf eklersen +' + P.yorum); };
    rev.addEventListener('click', function (e) {
      var b = e.target.closest('[data-yildiz]'); if (!b) { return; }
      var k = b.closest('[data-kriter]'), n = +b.dataset.yildiz; oy[k.dataset.kriter] = n;
      $$('[data-yildiz]', k).forEach(function (y) { y.classList.toggle('on', +y.dataset.yildiz <= n); });
    });
    metin.addEventListener('input', puanYaz);
    foto.addEventListener('change', function () { $('#dgRevFotoAd').textContent = foto.files.length ? foto.files[0].name : 'Fotoğraf Ekle'; puanYaz(); });
    rev.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      var ipucu = $('#dgRevIpucu');
      if (!oy.lezzet || !oy.servis || !oy.ambiyans) { ipucu.className = 'rf-hint err'; ipucu.textContent = 'Lezzet, servis ve ambiyansı puanla'; return; }
      var tutar = kazanc(), id = 'deg-' + Date.now();
      K.ekle('degerlendirme', { id: id, mekan: MEKAN, lezzet: oy.lezzet, servis: oy.servis, ambiyans: oy.ambiyans, metin: metin.value.trim(), foto: foto.files.length > 0, tutar: tutar });
      window.dgPuan.ekle(id, MEKAN + ' değerlendirmesi', tutar);
      rev.classList.add('sent'); var t = $('#dgRevTamam'); t.hidden = false; $('span', t).textContent = 'Değerlendirmen alındı. Denetim sonrası yayınlanır; +' + tutar + ' bekleyen puan onayda kesinleşir.';
    }, true);
    puanYaz();
  }
  /* Fotoğraf Ekle kısayolu formdaki fotoğraf alanına götürür */
  $$('.vd-actbar__act[data-pane-link="yorumlar"]').forEach(function (b) { if (/Fotoğraf/.test(b.textContent)) { b.addEventListener('click', function () { if (window.dgUye() && foto) { setTimeout(function () { foto.click(); }, 300); } }); } });

  /* Ziyaret Ettim, Listeye Ekle: üyede panele yazar */
  $$('.vd-actbar__act[data-lg-gate], #mdListBtn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (/Ziyaret/.test(b.textContent)) { if (!K.var('ziyaret', 'mikla')) { K.ekle('ziyaret', { id: 'mikla', mekan: MEKAN, yer: 'Beyoğlu, İstanbul', gun: new Date().toLocaleDateString('tr-TR') }); } bildir('Ziyaret Geçmişim\'e eklendi.'); return; }
      if (b.id === 'mdListBtn') { if (!K.var('favori', 'mekan-mikla')) { K.ekle('favori', { id: 'mekan-mikla', tur: 'Mekân', ad: MEKAN, mekan: 'Beyoğlu, İstanbul' }); } bildir('Gurme Favorilerim\'e eklendi.'); }
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
      window.dgPuan.ekle('rez-' + gun + '-' + saat, MEKAN + ' rezervasyonu', P.rezervasyon);
      var tarih = gun.split('-').reverse().join('.');
      $('#rsvRecap').innerHTML = '<span><i class="fa-solid fa-user-group" aria-hidden="true"></i> ' + kisi + ' kişi</span><span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + tarih + '</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + saat + '</span>' + (alerjen ? '<span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Alerjen notu var</span>' : '');
      $('#rsvSuccessText').textContent = 'Talebin mekân sahibine iletildi. Onaylanınca kesinleşir; durumu Rezervasyonlarım sekmesinde görürsün. Rezervasyon gerçekleşince +' + P.rezervasyon + ' puan kesinleşir.';
      $$('.rsv-step', form).forEach(function (a) { a.classList.toggle('active', a.dataset.pane === '3'); });
      $$('#rsvProg .pstep').forEach(function (a) { var n = +a.dataset.step; a.classList.toggle('cur', n === 3); a.classList.toggle('done', n < 3); });
      $$('#rsvProg .pline').forEach(function (a) { a.classList.add('done'); });
    };
  }
})();
