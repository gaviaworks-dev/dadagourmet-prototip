/* Mekân detayı eylemleri. Sonuç yalnız bu tarayıcıda `dgKayit` ile tutulur ve Gurme Panelim'de görünür; hiçbir yere gönderilmez. */
(function () {
  'use strict';
  var K = window.dgKayit, bildir = window.prototipBildir, MEKAN = 'Mikla';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* Sekme rayı: Ne Yenir, Ne Alınır sekmeleri Genel Bakış içindeki bölüme kaydırır.
     MD-11 · 3b (lider bulgusu, 11 Kas): canlı `mekan-detay.js` `showPane` sekmeleri `data-pane` değerine göre boyuyor; Ne Yenir? ve
     Ne Alınır? de `data-pane="genel"` taşıdığı için Genel Bakış'a basınca üçü, Ne Yenir'e basınca ikisi birden etkin kalıyordu
     (eski düzeltme yalnız tıklananı siliyordu). Tek etkin sekme: tıklanan; Genel Bakış bölmesinde kaydırırken görünüm ortasındaki
     bölüm (Ne Yenir?, Ne Alınır?, değilse Genel Bakış). Canlı betik değişmedi; bu dinleyici ondan sonra koşar */
  var sekmeler = $$('#mdTabs .dt'), kilit = 0, kare = 0;
  var genelSekme = sekmeler.filter(function (t) { return t.dataset.pane === 'genel' && !t.dataset.kaydir; })[0];
  var boya = function (s) { sekmeler.forEach(function (t) { var on = t === s; t.classList.toggle('active', on); if (on) { t.setAttribute('aria-current', 'true'); } else { t.removeAttribute('aria-current'); } }); };
  var izle = function () {
    kare = 0; if (Date.now() < kilit || !genelSekme) { return; }
    var bolme = $('#pane-genel');
    if (!bolme || !bolme.classList.contains('active')) { var etkin = sekmeler.filter(function (t) { return t.classList.contains('active'); }); if (etkin.length > 1) { boya(etkin[0]); } return; }
    var cizgi = innerHeight / 2, sec = genelSekme;
    sekmeler.forEach(function (t) { var h = t.dataset.kaydir && document.getElementById(t.dataset.kaydir); if (!h) { return; } var r = h.getBoundingClientRect(); if (r.top <= cizgi && r.bottom >= cizgi) { sec = t; } });
    boya(sec);
  };
  if (sekmeler.length) {
    window.addEventListener('scroll', function () { if (!kare) { kare = requestAnimationFrame(izle); } }, { passive: true });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('#mdTabs .dt');
      if (!t) { if (e.target.closest && e.target.closest('[data-pane-link]')) { setTimeout(izle, 0); } return; }
      boya(t);
      if (t.dataset.kaydir) { kilit = Date.now() + 1200; setTimeout(function () { boya(t); document.getElementById(t.dataset.kaydir).scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 0); }
    });
    izle();
  }

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

  /* Mekânı kaydet (kapak üstündeki yer imi; canlıda `POST /mekan/{mekan}/kaydet`, tür favori): Gurme Favorilerim'le aynı kayıt (favori ajanı, 11 Kas).
     Misafirde `data-lg-gate` giriş kapısını açar (prototip.js); üyede aç/kapa. Favorilerim'den çıkarılınca burada boş görünür */
  var kaydet = $('.md-stage-acts button[data-lg-gate]'), MID = 'mekan-mikla';
  var kaydetBoya = function () {
    if (!kaydet) { return; }
    var on = K.var('favori', MID), i = $('i', kaydet);
    kaydet.setAttribute('aria-pressed', on ? 'true' : 'false'); if (i) { i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-bookmark'; }
  };
  window.addEventListener('pageshow', function (e) { if (e.persisted) { kaydetBoya(); $$('[data-favori-tabak]').forEach(tabakBoya); } });
  if (kaydet) {
    kaydetBoya();
    kaydet.addEventListener('click', function () {
      if (!window.dgUye()) { return; }
      if (K.var('favori', MID)) { K.sil('favori', MID); bildir('Favorilerinden çıkarıldı.'); } else { K.ekle('favori', { id: MID, tur: 'Mekân', ad: MEKAN, mekan: 'Beyoğlu, İstanbul' }); bildir('Gurme Favorilerim\'e eklendi.'); }
      kaydetBoya();
    });
  }

  /* Değerlendirme. MD-11 · 4 (Beyar 11 Kas, "Gastro'da nasılsa öyle olsun"): Gastro ve canlı Gourmet `#revForm` gibi tek yıldız
     satırı, metin, en fazla 3 fotoğraf; form kapalı başlar, yıldız ya da metin odağıyla açılır. Kayıt tek puanla yazılır (canlı
     `degerlendirmeler.puan`); eski üç kriterli kayıtları okuyan ekranlar `dgDegPuan` ile ortalamaya düşer (prototip.js).
     Moderasyona gider; Dada Puan bekler, onayda kesinleşir */
  var rev = $('#dgRev'), P = window.dgPuan.KURAL, foto = $('#dgRevFoto'), AZAMI = 3;
  if (rev) {
    var metin = $('#dgRevMetin'), yildiz = $('#dgRevYildiz'), ipucu = $('#dgRevIpucu'), onizleme = $('#dgRevFotolar'), puan = 0, dosyalar = [];
    var ac = function () { rev.classList.add('open'); };
    var yorumlu = function () { return !!(metin.value.trim() || dosyalar.length); };
    var kazanc = function () { return P.puanlama + (yorumlu() ? P.yorum : 0); };
    var puanYaz = function () { var y = yorumlu(); $('#dgRevPuan').innerHTML = '<i class="fa-solid fa-award" aria-hidden="true"></i> Puanlama +' + P.puanlama + (y ? ', yorum veya fotoğraf +' + P.yorum : '') + ' = <b>+' + kazanc() + ' bekleyen puan</b>' + (y ? '' : '. Yorum ya da fotoğraf eklersen +' + P.yorum); };
    var onizle = function () {
      [].forEach.call(onizleme.querySelectorAll('.rf-ph'), function (d) { URL.revokeObjectURL(d.dataset.url); });
      onizleme.innerHTML = '';
      dosyalar.forEach(function (f, i) {
        var d = document.createElement('div'), u = URL.createObjectURL(f); d.className = 'rf-ph'; d.dataset.url = u; d.style.backgroundImage = 'url("' + u + '")';
        d.innerHTML = '<button type="button" aria-label="Fotoğrafı kaldır"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
        d.querySelector('button').addEventListener('click', function () { dosyalar.splice(i, 1); onizle(); puanYaz(); });
        onizleme.appendChild(d);
      });
    };
    metin.addEventListener('focus', ac);
    yildiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-yildiz]'); if (!b) { return; }
      puan = +b.dataset.yildiz; ac();
      $$('[data-yildiz]', yildiz).forEach(function (y) { var on = +y.dataset.yildiz <= puan; y.classList.toggle('on', on); y.setAttribute('aria-checked', +y.dataset.yildiz === puan ? 'true' : 'false'); });
      ipucu.className = 'rf-hint ok'; ipucu.textContent = 'Puanın: ' + puan + '/5';
    });
    metin.addEventListener('input', puanYaz);
    foto.addEventListener('change', function () {
      var fazla = false;
      [].forEach.call(foto.files, function (f) { if (dosyalar.length < AZAMI) { dosyalar.push(f); } else { fazla = true; } });
      if (fazla) { bildir('En fazla ' + AZAMI + ' fotoğraf ekleyebilirsin.', 'uyari'); }
      foto.value = ''; ac(); onizle(); puanYaz();
    });
    rev.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!puan) { ac(); ipucu.className = 'rf-hint err'; ipucu.textContent = 'Puan vermeden yorum gönderilemez'; yildiz.classList.add('shake'); setTimeout(function () { yildiz.classList.remove('shake'); }, 450); return; }
      var tutar = kazanc(), id = 'deg-' + Date.now();
      K.ekle('degerlendirme', { id: id, mekan: MEKAN, puan: puan, metin: metin.value.trim(), foto: dosyalar.length > 0, fotoSayi: dosyalar.length, tutar: tutar, durum: 'inceleniyor' });
      window.dgPuan.ekle(id, MEKAN + ' değerlendirmesi', tutar);
      rev.classList.add('sent'); var t = $('#dgRevTamam'); t.hidden = false; $('span', t).textContent = 'Yorumun alındı, denetim sonrası yayınlanacak. Teşekkürler! +' + tutar + ' bekleyen puan onayda kesinleşir.';
    }, true);
    /* Eylem çubuğundaki Değerlendir ve Fotoğraf Ekle formu açar */
    $$('.vd-actbar__act[data-pane-link="yorumlar"]').forEach(function (b) { b.addEventListener('click', function () { if (document.body.classList.contains('is-auth')) { ac(); } }); });
    puanYaz();
  }
  /* Fotoğraf Ekle kısayolu formdaki fotoğraf alanına götürür */
  $$('.vd-actbar__act[data-pane-link="yorumlar"]').forEach(function (b) { if (/Fotoğraf/.test(b.textContent)) { b.addEventListener('click', function () { if (window.dgUye() && foto) { setTimeout(function () { foto.click(); }, 300); } }); } });

  /* Ziyaret Ettim, Listeye Ekle: üyede panele yazar */
  $$('.vd-actbar__act[data-lg-gate], #mdListBtn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (/Ziyaret/.test(b.textContent)) { if (!K.var('ziyaret', 'mikla')) { K.ekle('ziyaret', { id: 'mikla', mekan: MEKAN, yer: 'Beyoğlu, İstanbul', gun: new Date().toLocaleDateString('tr-TR') }); } bildir('Ziyaret Geçmişim\'e eklendi.'); return; }
      if (b.id === 'mdListBtn') { if (!K.var('favori', 'mekan-mikla')) { K.ekle('favori', { id: 'mekan-mikla', tur: 'Mekân', ad: MEKAN, mekan: 'Beyoğlu, İstanbul' }); } bildir('Gurme Favorilerim\'e eklendi.');  kaydetBoya(); }
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
      K.ekle('rezervasyon', { id: 'rez-' + gun + '-' + saat, mekan: MEKAN, yer: 'Beyoğlu, İstanbul', gun: gun, saat: saat, kisi: +kisi, alerjen: alerjen, not: deger('#rsvNote').trim(), durum: 'talep' });
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
