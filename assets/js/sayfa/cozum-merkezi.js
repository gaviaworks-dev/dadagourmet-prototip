/* Çözüm Merkezi (canlı hesap/cozum-merkezi.blade.php sayfa betiğinin prototip karşılığı).
   Canlıda formlar sunucuya gider; prototipte HİÇBİR YERE gitmez, yalnız bu tarayıcıya yazar (window.dgKayit):
     destek-talep    Yeni Destek Talebi ile açılan talepler
     destek-hareket  talebe yazılan yanıt ya da talebi kapatma (örnek talepler dahil)
     oneri-sikayet   Öneri ve Şikâyet formu
   Ayrıca: `?durum=` süzgeci, `?talep=` (bu tarayıcıda açılan talebin kartı), SSS arama/konu süzgeci (canlıdan
   port), akordeon (kanon sözleşmesi: `.acik` + aria-expanded), karakter sayaçları, ek dosya adı,
   `data-feedback-open` → kabuğun Görüş Bildir sekmesi. */
(function () {
  'use strict';
  var d = document, $ = function (id) { return d.getElementById(id); };
  var K = window.dgKayit || { oku: function () { return []; }, ekle: function (t, k) { return k; } };
  var kok = d.documentElement.getAttribute('data-kok') || './';
  var MERKEZ = kok + 'hesabim/cozum-merkezi/';
  var kac = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  var DURUM = {
    acik: { etiket: 'Açık talep', ikon: 'fa-solid fa-inbox', sinif: 'wait' },
    'yanit-bekleyen': { etiket: 'Yanıt bekleyen', ikon: 'fa-solid fa-reply', sinif: 'durum-hapi bekleyen' },
    cozulen: { etiket: 'Çözülen', ikon: 'fa-solid fa-circle-check', sinif: 'ok' },
    kapatilan: { etiket: 'Kapatılan', ikon: 'fa-solid fa-lock', sinif: 'kapali' }
  };
  var SUZGEC = { tumu: 'Tümü', acik: 'Açık talep', 'yanit-bekleyen': 'Yanıt bekleyen', cozulen: 'Çözülen', kapatilan: 'Kapatılan' };
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var iki = function (n) { return (n < 10 ? '0' : '') + n; };
  var simdi = function () { var t = new Date(); return t.getFullYear() + '-' + iki(t.getMonth() + 1) + '-' + iki(t.getDate()) + 'T' + iki(t.getHours()) + ':' + iki(t.getMinutes()); };
  var gun = function (iso) { var p = iso.slice(0, 10).split('-'); return +p[2] + ' ' + AY[+p[1] - 1] + ' ' + p[0]; };
  var saatli = function (iso) { return gun(iso) + ' · ' + iso.slice(11, 16); };
  var uuid = function () {
    if (window.crypto && crypto.randomUUID) { return crypto.randomUUID(); }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  };
  var kisa = function (ref) { return ref.slice(0, 8).toUpperCase(); };
  var hareketler = function (ref) { return K.oku('destek-hareket').filter(function (h) { return h.ref === ref; }).reverse(); };

  /* ---- akordeon: aynı gruptaki diğerleri kapanır, açık kaleme basmak onu kapatır ---- */
  var kalemAc = function (k, ac) {
    var b = k.querySelector('.akordeon-bas'), g = k.querySelector('.akordeon-govde');
    k.classList.toggle('acik', ac);
    if (b) { b.setAttribute('aria-expanded', ac ? 'true' : 'false'); }
    if (g) { g.style.maxHeight = ac ? g.scrollHeight + 'px' : ''; }
  };
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.akordeon-bas'); if (!b) { return; }
    var k = b.closest('.akordeon-kalem'), grup = k.parentNode, acikMiydi = k.classList.contains('acik');
    [].forEach.call(grup.querySelectorAll(':scope > .akordeon-kalem.acik'), function (x) { kalemAc(x, false); });
    if (!acikMiydi) { kalemAc(k, true); }
  });

  /* ---- Görüş Bildir: kabuğun sağ kenar sekmesi pencereyi açar (gorus-girisleri.js ile aynı yol) ---- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#pageMain [data-feedback-open]'); if (!b) { return; }
    var sekme = $('fbTab'); if (!sekme) { return; }
    e.preventDefault(); sekme.click();
  });
  [].forEach.call(d.querySelectorAll('[data-gonderme-yok]'), function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); }); });

  /* ---- karakter sayaçları, ek dosya adı (canlı betiğin 4 · 4b bölümleri) ---- */
  [['tkMesaj', 'tkMsgCount'], ['msgText', 'msgCount']].forEach(function (c) {
    var m = $(c[0]), s = $(c[1]);
    if (m && s) { var yaz = function () { s.textContent = m.value.length; }; m.addEventListener('input', yaz); m.form && m.form.addEventListener('reset', function () { setTimeout(yaz); }); }
  });
  var ekBagla = function (on) {
    var g = $(on), ad = $(on + 'Name'), sil = $(on + 'Clear'); if (!g || !ad) { return; }
    var yaz = function () { var f = g.files && g.files[0]; ad.textContent = f ? f.name : 'Dosya seçilmedi'; if (sil) { sil.hidden = !f; } };
    g.addEventListener('change', yaz);
    if (g.form) { g.form.addEventListener('reset', function () { setTimeout(yaz); }); }
    if (sil) { sil.addEventListener('click', function () { g.value = ''; yaz(); g.focus(); }); }
  };
  ekBagla('tkEk');

  /* ---- alan doğrulaması: canlı sunucunun hata metinleri alanın data-hata* özniteliğinde ---- */
  var hataKutusu = function (el) {
    var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/);
    for (var i = 0; i < ids.length; i++) { var h = $(ids[i]); if (h && h.classList.contains('alan-hata')) { return h; } }
    return null;
  };
  var dogrula = function (f, ozet) {
    var ilk = null;
    [].forEach.call(f.querySelectorAll('[data-hata]'), function (el) {
      var v = el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value.trim(), m = '';
      if (!v) { m = el.getAttribute('data-hata'); }
      else if (el.minLength > 0 && v.length < el.minLength) { m = el.getAttribute('data-hata-kisa') || el.getAttribute('data-hata'); }
      else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { m = el.getAttribute('data-hata-bicim'); }
      var h = hataKutusu(el);
      if (h) { h.hidden = !m; h.querySelector('span').textContent = m || ''; }
      if (m) { el.setAttribute('aria-invalid', 'true'); ilk = ilk || el; } else { el.removeAttribute('aria-invalid'); }
    });
    if (ozet) { ozet.hidden = !ilk; }
    if (ilk) { ilk.focus(); }
    return !ilk;
  };

  /* ---- talep satırı (hesap/_parcalar/destek-talep-satiri) ---- */
  var satirHtml = function (t, durum, sayi, son) {
    var dd = DURUM[durum];
    return '<a class="ayar-satir" data-durum="' + durum + '" data-no="' + t.id + '" href="' + talepAdresi(t.id) + '" data-talep="' + t.id + '">' +
      '<span class="as-ikon"><i class="' + dd.ikon + '" aria-hidden="true"></i></span>' +
      '<span class="as-metin"><b>' + kac(t.baslik) + '</b><span><i class="fa-solid fa-hashtag" aria-hidden="true"></i> ' + kisa(t.id) + ' · ' + kac(t.konu) + ' · son hareket <time datetime="' + son.slice(0, 10) + '">' + gun(son) + '</time> · ' + sayi + ' mesaj</span></span>' +
      '<span class="as-eylem"><span class="pstat ' + dd.sinif + '">' + dd.etiket + '</span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></span></a>';
  };
  function talepAdresi(id) { return MERKEZ + '?talep=' + encodeURIComponent(id); }
  var durumYaz = function (kap, durum) {
    var satir = kap.hasAttribute('data-durum'), dd = DURUM[durum], p = kap.querySelector('.pstat:not(time)'), ik = satir && kap.querySelector('.as-ikon i');
    if (satir) { kap.setAttribute('data-durum', durum); }
    if (p) { p.className = 'pstat ' + dd.sinif; p.textContent = dd.etiket; }
    if (ik) { ik.className = dd.ikon; }
  };
  /* Bu tarayıcıdaki hareketler satıra ve karta işlenir: mesaj sayısı, son hareket, kapatma */
  var hareketIsle = function (kap, ref) {
    var hs = hareketler(ref); if (!hs.length) { return; }
    var meta = kap.querySelector('.as-metin > span, .kart-bas p'), zaman = meta && meta.querySelector('time');
    if (zaman) {
      var son = hs[hs.length - 1].zaman;
      zaman.setAttribute('datetime', son.slice(0, 10)); zaman.textContent = gun(son);
      var n = zaman.nextSibling, eski = n && /(\d+) mesaj/.exec(n.textContent);
      if (eski) { n.textContent = ' · ' + (+eski[1] + hs.filter(function (h) { return h.tur === 'mesaj'; }).length) + ' mesaj'; }
    }
    if (hs.some(function (h) { return h.tur === 'kapat'; })) { durumYaz(kap, 'kapatilan'); }
  };

  /* ---- Destek Taleplerim: bu tarayıcıda açılan talepler, hareketler, `?durum=` süzgeci ---- */
  var liste = $('tkList'), akis = $('tkAkis'), q = new URLSearchParams(location.search);
  if (liste) {
    K.oku('destek-talep').slice().reverse().forEach(function (t) {
      var son = t.zaman; var h = satirHtml(t, 'acik', 1, son);
      liste.insertAdjacentHTML('afterbegin', h);
      if (akis) { akis.insertAdjacentHTML('afterbegin', h); }
    });
    [].forEach.call(d.querySelectorAll('#tkList [data-talep], #tkAkis [data-talep]'), function (s) { hareketIsle(s, s.getAttribute('data-talep')); });
    if (akis) {
      [].forEach.call(akis.querySelectorAll('[data-durum]'), function (s) { var x = s.getAttribute('data-durum'); if (x !== 'acik' && x !== 'yanit-bekleyen') { s.remove(); } });
      $('tkOzetBolum').hidden = !akis.querySelector('[data-durum]');
    }
    var satirlar = [].slice.call(liste.querySelectorAll('[data-durum]'));
    var say = { tumu: satirlar.length };
    satirlar.forEach(function (s) { var x = s.getAttribute('data-durum'); say[x] = (say[x] || 0) + 1; });
    [].forEach.call(d.querySelectorAll('#tkFilter [data-c]'), function (c) { c.textContent = say[c.getAttribute('data-c')] || 0; });
    var durum = SUZGEC[q.get('durum')] ? q.get('durum') : 'tumu';
    [].forEach.call(d.querySelectorAll('#tkFilter .sekme'), function (a) {
      var on = a.getAttribute('data-f') === durum;
      a.classList.toggle('aktif', on);
      if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });
    var gorunen = 0;
    satirlar.forEach(function (s) { var on = durum === 'tumu' || s.getAttribute('data-durum') === durum; s.hidden = !on; if (on) { gorunen++; } });
    var sayac = $('tkCount');
    if (sayac) { sayac.innerHTML = '<b>' + gorunen + '</b> talep gösteriliyor — süzgeç: ' + SUZGEC[durum].toLocaleLowerCase('tr') + '.'; }
    liste.hidden = !gorunen;
    $('tkEmptySuzgec').hidden = !(gorunen === 0 && durum !== 'tumu');
    $('tkEmptyHic').hidden = !(gorunen === 0 && durum === 'tumu');
  }

  /* ---- talep kartı: bu tarayıcıda açılan talep `?talep=` ile aynı ekranda açılır ---- */
  var yazismaHtml = function (kim, zaman, metin, ek) {
    return '<div class="ayar-satir"><span class="as-ikon"><i class="' + (kim === 'ekip' ? 'fa-solid fa-headset' : 'fa-regular fa-user') + '" aria-hidden="true"></i></span>' +
      '<span class="as-metin"><b>' + (kim === 'ekip' ? 'Destek ekibi' : 'Sen') + '</b><span>' + kac(metin) + '</span>' +
      (ek ? '<span><i class="fa-solid fa-paperclip" aria-hidden="true"></i> <b>' + kac(ek) + '</b></span>' : '') + '</span>' +
      '<span class="as-eylem"><time class="pstat" datetime="' + zaman + '">' + saatli(zaman) + '</time></span></div>';
  };
  var yuva = $('tkDetayYuva'), istenen = q.get('talep');
  if (yuva && istenen) {
    var t = K.oku('destek-talep').filter(function (x) { return x.id === istenen; })[0];
    var ornek = !t && d.querySelector('#tkList [data-talep="' + istenen.replace(/"/g, '') + '"]');
    if (ornek) { location.replace(ornek.getAttribute('href')); return; }
    if (t) {
      yuva.outerHTML = '<section class="bolum"><div class="wrap kap"><div class="hesap-kolonu"><div class="kart panel" id="tkDetay" data-talep="' + t.id + '">' +
        '<div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-comments"></i> ' + kac(t.baslik) + '</h2>' +
        '<p><i class="fa-solid fa-hashtag" aria-hidden="true"></i> ' + kisa(t.id) + ' · ' + kac(t.konu) + ' · son hareket <time datetime="' + t.zaman.slice(0, 10) + '">' + gun(t.zaman) + '</time> · 1 mesaj</p></div>' +
        '<span class="pstat wait">Açık talep</span></div>' +
        '<div class="kart-govde" id="tkDetayOk" hidden=""><p class="tk-ok" role="status"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span></span></p></div>' +
        '<div class="kart-govde bosluksuz"><div class="ayar-liste" role="log" aria-label="' + kisa(t.id) + ' yazışması" id="tkYazisma">' + yazismaHtml('sen', t.zaman, t.mesaj, t.ek) + '</div></div>' +
        '<div class="kart-govde"><p class="alan-yardim" id="tkKapaliNot" hidden=""><i class="fa-solid fa-lock" aria-hidden="true"></i> <span>Bu talep kapatıldı, yazışma sürdürülemiyor. Konu yeniden açılırsa <b>Yeni Destek Talebi</b> sekmesinden yeni bir talep aç.</span></p>' +
        '<form id="tkYanitForm" novalidate=""><div class="alan"><label class="alan-etiket" for="tkYanit">Yanıtın <span class="zorunlu" aria-hidden="true">*</span></label>' +
        '<textarea class="alan-metin" id="tkYanit" name="mesaj" minlength="2" maxlength="5000" required aria-required="true" placeholder="Destek ekibine yazmak istediğin şeyi buraya yaz." aria-describedby="tkYanitErr" data-hata="Mesaj alanı zorunludur." data-hata-kisa="Mesaj en az 2 karakter olmalıdır."></textarea>' +
        '<p class="alan-hata" id="tkYanitErr" hidden=""><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span></span></p></div>' +
        '<div class="alan"><label class="alan-etiket" for="tkYanitEk">Ek dosya <span class="istege-bagli">(isteğe bağlı)</span></label><div class="alan-dosya">' +
        '<input class="sr-only" type="file" id="tkYanitEk" name="ek" accept="image/jpeg,image/png,image/webp,application/pdf" aria-describedby="tkYanitEkHelp tkYanitEkErr">' +
        '<label class="alan-dosya-dugme" for="tkYanitEk"><i class="fa-solid fa-paperclip" aria-hidden="true"></i> Dosya seç</label><span class="alan-dosya-ad" id="tkYanitEkName">Dosya seçilmedi</span><button type="button" class="alan-dosya-sil" id="tkYanitEkClear" hidden="">Kaldır</button></div>' +
        '<p class="alan-yardim" id="tkYanitEkHelp"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Ekran görüntüsü ya da belge: JPG, PNG, WebP veya PDF · en çok 5 MB · mesaj başına tek dosya.</p>' +
        '<p class="alan-hata" id="tkYanitEkErr" hidden=""><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span></span></p></div>' +
        '<div class="alan-gonder"><p class="not">Destek ekibi hafta içi 09:00–18:00 arasında bakıyor.</p><button class="dugme btn-fit" type="submit"><i class="fa-solid fa-paper-plane"></i> Yanıtı gönder</button></div></form></div>' +
        '<div class="kart-alt"><a class="dugme btn-fit kucuk" href="' + MERKEZ + '"><i class="fa-solid fa-arrow-left"></i> Taleplerime dön</a>' +
        '<form id="tkKapatForm"><button class="dugme btn-fit kucuk" type="submit"><i class="fa-solid fa-lock"></i> Talebi kapat</button></form></div>' +
        '</div></div></div></section>';
    }
  }

  var kart = $('tkDetay');
  if (kart) {
    var ref = kart.getAttribute('data-talep'), log = $('tkYazisma'), okKutu = $('tkDetayOk');
    var basari = function (m) { if (okKutu) { okKutu.querySelector('span').textContent = m; okKutu.hidden = false; } };
    var kapandi = function () {
      durumYaz(kart, 'kapatilan');
      var f = $('tkYanitForm'), k = $('tkKapatForm'); if (f) { f.remove(); } if (k) { k.remove(); }
      $('tkKapaliNot').hidden = false;
    };
    hareketler(ref).forEach(function (h) { if (h.tur === 'mesaj') { log.insertAdjacentHTML('beforeend', yazismaHtml('sen', h.zaman, h.mesaj, h.ek)); } });
    hareketIsle(kart, ref);
    if (hareketler(ref).some(function (h) { return h.tur === 'kapat'; })) { kapandi(); }
    if (q.get('ok') === '1' && K.oku('destek-talep').some(function (x) { return x.id === ref; })) { basari('Talebin alındı. Referans: ' + ref); }
    ekBagla('tkYanitEk');
    var yanit = $('tkYanitForm');
    if (yanit) {
      yanit.addEventListener('submit', function (e) {
        e.preventDefault(); if (!dogrula(yanit)) { return; }
        var ekG = $('tkYanitEk'), h = { id: 'h-' + Date.now(), ref: ref, tur: 'mesaj', mesaj: $('tkYanit').value.trim(), ek: ekG.files && ekG.files[0] ? ekG.files[0].name : '', zaman: simdi() };
        K.ekle('destek-hareket', h);
        log.insertAdjacentHTML('beforeend', yazismaHtml('sen', h.zaman, h.mesaj, h.ek));
        var meta = kart.querySelector('.kart-bas p'), z = meta.querySelector('time'), n = z.nextSibling, m = /(\d+) mesaj/.exec(n.textContent);
        z.setAttribute('datetime', h.zaman.slice(0, 10)); z.textContent = gun(h.zaman); if (m) { n.textContent = ' · ' + (+m[1] + 1) + ' mesaj'; }
        yanit.reset(); basari('Mesajın talebe eklendi.');
      });
    }
    var kapat = $('tkKapatForm');
    if (kapat) {
      kapat.addEventListener('submit', function (e) {
        e.preventDefault();
        K.ekle('destek-hareket', { id: 'h-' + Date.now(), ref: ref, tur: 'kapat', zaman: simdi() });
        kapandi(); basari('Talep kapatıldı. Satır "Kapatılan" süzgecinde kalır.');
      });
    }
  }

  /* ---- Yeni Destek Talebi: kaydedip talebin kartına döner (canlı: hesap.cozum-merkezi.talep + flaş) ---- */
  var tk = $('tkForm');
  if (tk) {
    tk.addEventListener('submit', function (e) {
      e.preventDefault(); if (!dogrula(tk, $('tkErrSum'))) { return; }
      var s = $('tkKategori'), ekG = $('tkEk');
      var t = { id: uuid(), konuDeger: s.value, konu: s.options[s.selectedIndex].text, baslik: $('tkBaslik').value.trim(), mesaj: $('tkMesaj').value.trim(), ek: ekG.files && ekG.files[0] ? ekG.files[0].name : '', zaman: simdi() };
      K.ekle('destek-talep', t);
      location.href = MERKEZ + '?talep=' + encodeURIComponent(t.id) + '&ok=1';
    });
  }

  /* ---- Öneri ve Şikâyet: kaydeder, şeridi açar (canlı: back() + "Mesajın alındı. Referans: …") ---- */
  var con = $('conForm');
  if (con) {
    con.addEventListener('submit', function (e) {
      e.preventDefault(); if (!dogrula(con, $('conErrSum'))) { return; }
      var v = {}; [].forEach.call(con.elements, function (el) { if (el.name) { v[el.name] = el.type === 'checkbox' ? el.checked : el.value; } });
      v.id = uuid(); v.zaman = simdi();
      K.ekle('oneri-sikayet', v);
      var ok = $('conOk'); ok.querySelector('span').textContent = 'Referans: ' + v.id; ok.hidden = false;
      con.reset(); ok.scrollIntoView({ block: 'center' });
      if (window.prototipBildir) { window.prototipBildir('Mesajın alındı. Prototipte yalnız bu tarayıcıda tutulur.'); }
    });
  }

  /* ---- SSS: konu süzgeci + arama (canlı betiğin 3. bölümü, birebir) ---- */
  var faq = $('faqList'), cipKap = $('faqTabs');
  if (faq && cipKap) {
    var kalemler = [].slice.call(faq.querySelectorAll('.akordeon-kalem'));
    var cipler = [].slice.call(cipKap.querySelectorAll('.sekme[data-kat]'));
    var not = $('faqNote'), bos = $('faqNone'), ara = $('faqSearch'), sil = $('faqClear');
    var kat = cipler.length ? cipler[0].getAttribute('data-kat') : '';
    var ciz = function () {
      var aranan = (ara && ara.value ? ara.value : '').trim().toLocaleLowerCase('tr'), gorunen = 0;
      kalemler.forEach(function (k) {
        var uyar = aranan ? (k.textContent || '').toLocaleLowerCase('tr').indexOf(aranan) > -1 : k.getAttribute('data-kat') === kat;
        k.hidden = !uyar; if (!uyar) { kalemAc(k, false); } else { gorunen++; }
      });
      cipler.forEach(function (c) { var on = !aranan && c.getAttribute('data-kat') === kat; c.classList.toggle('aktif', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (not) {
        var ad = ''; cipler.forEach(function (c) { if (c.getAttribute('data-kat') === kat) { ad = c.textContent.replace(/\s+/g, ' ').replace(/\s*\d+\s*$/, '').trim(); } });
        var b = d.createElement('b'); b.textContent = aranan ? '"' + aranan + '"' : ad;
        not.replaceChildren(b, d.createTextNode(' — ' + gorunen + ' soru'));
      }
      if (bos) { bos.hidden = gorunen > 0; bos.classList.toggle('show', gorunen === 0); }
      if (sil) { sil.classList.toggle('show', !!aranan); sil.classList.toggle('gorunur', !!aranan); }
      faq.hidden = gorunen === 0;
    };
    cipler.forEach(function (c) { c.addEventListener('click', function () { kat = c.getAttribute('data-kat'); if (ara) { ara.value = ''; } ciz(); }); });
    if (ara) { ara.addEventListener('input', ciz); }
    if (sil) { sil.addEventListener('click', function () { if (ara) { ara.value = ''; ara.focus(); } ciz(); }); }
    ciz();
  }
})();
