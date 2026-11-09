/* İşletme portalı (canlı /isletme): başvuru, doğrulama belgesi, değişiklik talebi ve değerlendirme yanıtı.
   Prototipte hiçbir şey sunucuya gitmez; kayıtlar bu tarayıcıda durur (window.dgKayit). İletiler canlı denetleyicilerin metni.
   Rezervasyon talepleri bölümünü karar.js yönetir; bu dosya ona dokunmaz. */
(function () {
  'use strict';
  var K = window.dgKayit, bildir = window.prototipBildir || function () {};
  if (!K) { return; }
  var kok = document.documentElement.dataset.kok || './';
  var adres = new URLSearchParams(location.search);
  var kac = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var iki = function (n) { return (n < 10 ? '0' : '') + n; };
  var bugun = function () { var d = new Date(); return iki(d.getDate()) + '.' + iki(d.getMonth() + 1) + '.' + d.getFullYear(); };
  var saat = function () { var d = new Date(); return iki(d.getHours()) + ':' + iki(d.getMinutes()); };
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var satir = function (ikon, ad, alt, uc) { return '<div class="kalem-satiri"><span class="ks-ikon"><i class="' + ikon + '" aria-hidden="true"></i></span><span class="ks-metin"><b>' + ad + '</b><small>' + alt + '</small></span><span class="ks-uc">' + (uc || '') + '</span></div>'; };
  var rozet = function (r) { return '<span class="rozet ' + r[1] + '">' + r[0] + '</span>'; };
  var bag = function (yol, metin) { return '<a class="dugme hayalet kucuk" href="' + kok + yol + '">' + metin + '</a>'; };
  var BASVURU = { taslak: ['Taslak', 'pasif'], gonderildi: ['Gönderildi', 'bekleme'], incelemede: ['İncelemede', 'bekleme'], bilgi_istendi: ['Bilgi istendi', 'bekleme'], onaylandi: ['Onaylandı', 'olumlu'], reddedildi: ['Reddedildi', 'durdu'] };
  var TALEP = { taslak: ['Taslak', 'pasif'], gonderildi: ['Gönderildi', 'bekleme'], incelemede: ['İncelemede', 'bekleme'], onaylandi: ['Onaylandı', 'olumlu'], reddedildi: ['Reddedildi', 'durdu'], uygulandi: ['Uygulandı', 'olumlu'] };
  var DEG = { inceleniyor: ['İnceleniyor', 'bekleme'], yayinda: ['Yayında', 'olumlu'], reddedildi: ['Yayınlanmadı', 'durdu'] };
  var BELGE = { vergi_levhasi: 'Vergi levhası', faaliyet_belgesi: 'Faaliyet belgesi', isletme_ruhsati: 'İşletme ruhsatı', diger: 'Diğer' };
  var TALEP_ALAN = { ad: 'İşletme adı', adres: 'Adres', telefon: 'Telefon', calisma_saatleri: 'Çalışma saatleri', not: 'Not' };

  /* Rol notu: ekran mekân sahibi hesabına açık; başka demo rolünde not görünür */
  if (window.dgRol && window.dgRol() !== 'isletme') { $$('[data-rol-notu]').forEach(function (n) { n.hidden = false; }); }
  /* Yönlendirmeden sonraki ileti (canlıda session('basari')) */
  var FLASH = 'dg-isletme-ileti';
  var sonraBildir = function (m) { try { sessionStorage.setItem(FLASH, m); } catch (e) { /* depo kapalı */ } };
  try { var ileti = sessionStorage.getItem(FLASH); if (ileti) { sessionStorage.removeItem(FLASH); setTimeout(function () { bildir(ileti); }, 250); } } catch (e) { /* depo kapalı */ }

  /* ---------- İşletmeni yönet: bu tarayıcıda açılan başvurular listenin başına ---------- */
  var basvuruListe = $('[data-basvuru-liste]');
  if (basvuruListe) {
    K.oku('isletme-basvuru').slice().reverse().forEach(function (b) {
      basvuruListe.insertAdjacentHTML('afterbegin', satir('fa-solid fa-file-signature', kac(b.gorunen_ad) + ' ' + rozet(BASVURU[b.durum] || BASVURU.taslak), 'Başvuru #' + b.no + ' · ' + kac(b.ticari_unvan), bag('isletme/basvurular/yeni/?b=' + encodeURIComponent(b.id), 'Başvuruyu görüntüle')));
    });
  }

  /* ---------- Değişiklik talepleri ---------- */
  var talepListe = $('[data-talep-liste]');
  if (talepListe) {
    var kayitli = K.oku('isletme-talep');
    kayitli.slice().reverse().forEach(function (t) {
      talepListe.insertAdjacentHTML('afterbegin', satir('fa-solid fa-pen-to-square', kac(t.mekan) + ' ' + rozet(TALEP[t.durum] || TALEP.gonderildi), 'Gönderildi ' + t.gonderildi, bag('isletme/degisiklik-talepleri/gonderilen/?t=' + encodeURIComponent(t.id), 'Talebi gör')));
    });
    $$('[data-talep-sayi]').forEach(function (r) { r.textContent = (talepListe.querySelectorAll('.kalem-satiri').length) + ' talep'; });
  }
  var talepForm = $('[data-talep-form]');
  if (talepForm) {
    talepForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!talepForm.reportValidity()) { return; }
      var el = talepForm.elements, mekan = el.mekan_id.value;
      /* DegisiklikTalebiServisi: gönderildi ya da incelemedeki talep varken aynı mekâna yenisi açılmaz */
      var bekleyen = K.oku('isletme-talep').some(function (t) { return t.mekan === mekan && (t.durum === 'gonderildi' || t.durum === 'incelemede'); });
      if (bekleyen) { bildir('Bu mekân için bekleyen bir değişiklik talebin zaten var.'); return; }
      var degisiklikler = {};
      ['ad', 'adres', 'telefon', 'calisma_saatleri', 'not'].forEach(function (k) { var v = el[k].value.trim(); if (v) { degisiklikler[k] = v; } });
      var t = { id: 'talep-' + Date.now(), no: 348 + K.oku('isletme-talep').length, mekan: mekan, degisiklikler: degisiklikler, durum: 'gonderildi', gonderildi: bugun(), saat: saat() };
      K.ekle('isletme-talep', t);
      sonraBildir('Değişiklik talebin gönderildi.');
      location.href = kok + 'isletme/degisiklik-talepleri/gonderilen/?t=' + encodeURIComponent(t.id);
    });
  }
  var talepGoster = $('[data-talep-goster]');
  if (talepGoster) {
    var tid = adres.get('t'), t = K.oku('isletme-talep').filter(function (x) { return x.id === tid; })[0] || K.oku('isletme-talep')[0];
    if (t) {
      $('.bolum-bas h2', talepGoster).textContent = 'Değişiklik talebi #' + t.no;
      $('.bolum-bas .giris-metni', talepGoster).textContent = t.mekan + ' için gönderdiğin talebin durumu.';
      var dr = TALEP[t.durum] || TALEP.gonderildi, rz = $('[data-talep-durum]', talepGoster); rz.textContent = dr[0]; rz.className = 'rozet ' + dr[1];
      $('[data-talep-tarih]', talepGoster).textContent = 'Gönderildi ' + t.gonderildi + ' ' + t.saat;
      var alanlar = Object.keys(t.degisiklikler).map(function (k) { return satir('fa-solid fa-circle-dot', TALEP_ALAN[k] || kac(k), kac(t.degisiklikler[k])); }).join('');
      if (alanlar) { $('[data-talep-alanlar]', talepGoster).innerHTML = alanlar; }
    }
  }

  /* ---------- İşletme ekle: başvuru formu, belge, incelemeye gönder ---------- */
  var bForm = $('[data-basvuru-form]');
  if (bForm) {
    var hata = $('[data-basvuru-hata]'), belgeKart = $('[data-belge-kart]'), belgeListe = $('[data-belge-liste]'), gonder = $('[data-basvuru-gonder]');
    var ornekNo = bForm.dataset.basvuruNo || '';
    var kayit = function () { var id = adres.get('b'); return id ? K.oku('isletme-basvuru').filter(function (x) { return x.id === id; })[0] : null; };
    var anahtar = function () { var k = kayit(); return ornekNo || (k ? k.id : ''); };
    var durum = function () { var k = kayit(); return ornekNo ? bForm.dataset.basvuruDurum : (k ? k.durum : ''); };
    var duzenlenir = function () { return ['taslak', 'bilgi_istendi'].indexOf(durum()) > -1; };
    var hataGoster = function (m) { if (!hata) { return; } hata.lastElementChild.textContent = m; hata.classList.add('goster'); hata.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    var hataGizle = function () { if (hata) { hata.classList.remove('goster'); } };
    var hizmetSayac = function () { var n = $$('[name="hizmetler"]:checked', bForm).length, s = $('[data-hizmet-sayac]', bForm); if (s) { s.textContent = n + '/5 seçildi'; } return n; };
    bForm.addEventListener('change', function (e) {
      if (e.target.name === 'hizmetler' && e.target.checked && hizmetSayac() > 5) { e.target.checked = false; bildir('En fazla 5 hizmet seçebilirsiniz.'); }
      hizmetSayac();
    });
    $$('[data-sayac-icin]', bForm).forEach(function (s) {
      var a = document.getElementById(s.getAttribute('data-sayac-icin')), yaz = function () { s.textContent = a.value.length + '/' + a.maxLength; };
      a.addEventListener('input', yaz); yaz();
    });
    var oku = function () {
      var v = {}, el = bForm.elements;
      ['gorunen_ad', 'ticari_unvan', 'mekan_turu', 'fiyat_seviyesi', 'il', 'ilce', 'acik_adres', 'yetkili_ad', 'yetkili_telefon', 'isletme_eposta', 'isletme_telefon', 'web_sitesi', 'instagram', 'vergi_veya_ruhsat_no', 'calisma_saatleri_ozeti', 'tanitim', 'rezervasyon_araliklari', 'rezervasyon_notu', 'notlar'].forEach(function (k) { v[k] = (el[k].value || '').trim(); });
      v.hizmetler = $$('[name="hizmetler"]:checked', bForm).map(function (x) { return x.value; });
      v.hizmet_turleri = $$('[name="hizmet_turleri"]:checked', bForm).map(function (x) { return x.value; });
      v.dogrulama_onayi = el.dogrulama_onayi.checked; v.kosullar_onayi = el.kosullar_onayi.checked;
      return v;
    };
    var doldur = function (k) {
      var el = bForm.elements;
      Object.keys(k).forEach(function (a) { if (el[a] && el[a].tagName && typeof k[a] === 'string') { el[a].value = k[a]; } });
      $$('[name="hizmetler"],[name="hizmet_turleri"]', bForm).forEach(function (x) { x.checked = (k[x.name] || []).indexOf(x.value) > -1; });
      el.dogrulama_onayi.checked = !!k.dogrulama_onayi; el.kosullar_onayi.checked = !!k.kosullar_onayi;
      hizmetSayac(); $$('[data-sayac-icin]', bForm).forEach(function (s) { var a = document.getElementById(s.getAttribute('data-sayac-icin')); s.textContent = a.value.length + '/' + a.maxLength; });
    };
    /* Düzenleme kipi: canlıda taslak kaydı `basvurular/{id}/duzenle` ekranına döner; prototipte aynı sayfa ?b= ile düzenleme kipine geçer */
    var duzenlemeKipi = function () {
      var b = $('[data-basvuru-baslik]'); if (b) { b.textContent = 'Başvuruyu düzenle'; }
      var r = $('[data-basvuru-durum-rozet]'); if (r) { r.innerHTML = rozet(BASVURU[durum()] || BASVURU.taslak); }
      var c = document.querySelector('.kirinti .cur'), k = kayit(); if (c && k) { c.textContent = 'Başvuru #' + k.no; }
      document.title = document.title.replace('İşletme ekle', 'Başvuruyu düzenle');
      if (belgeKart) { belgeKart.hidden = false; }
      if (gonder) { gonder.disabled = !duzenlenir(); }
    };
    var belgeSatir = function (x) { return satir('fa-solid fa-file-lines', BELGE[x.tur] || kac(x.tur), kac(x.ad) + ' · ' + x.kb.toLocaleString('tr-TR') + ' KB · bağlantı 5 dk geçerli'); };
    var belgeleriYaz = function () { if (!belgeListe) { return; } K.oku('isletme-belge').filter(function (x) { return x.basvuru === anahtar(); }).slice().reverse().forEach(function (x) { belgeListe.insertAdjacentHTML('beforeend', belgeSatir(x)); }); };
    var ilk = kayit();
    if (ilk) { doldur(ilk); duzenlemeKipi(); }
    if (ilk || ornekNo) { belgeleriYaz(); }

    bForm.addEventListener('submit', function (e) {
      e.preventDefault(); hataGizle();
      if (!bForm.reportValidity()) { return; }
      var k = kayit();
      if ((ornekNo || k) && !duzenlenir()) { hataGoster('Başvuru güncel değil veya düzenlenebilir durumda değil.'); return; }
      var v = oku();
      if (k) { K.guncelle('isletme-basvuru', k.id, v); bildir('Başvuru güncellendi.'); return; }
      v.id = 'basvuru-' + Date.now(); v.no = 1043 + K.oku('isletme-basvuru').length; v.durum = 'taslak';
      K.ekle('isletme-basvuru', v);
      history.replaceState(null, '', location.pathname + '?b=' + encodeURIComponent(v.id));
      adres = new URLSearchParams(location.search);
      duzenlemeKipi();
      bildir('Başvuru taslağı oluşturuldu.');
    });

    var belgeForm = $('[data-belge-form]');
    if (belgeForm) {
      var dosya = belgeForm.elements.dosya, dosyaAd = $('[data-dosya-ad]', belgeForm), dosyaVarsayilan = dosyaAd.textContent;
      dosya.addEventListener('change', function () { dosyaAd.textContent = dosya.files.length ? dosya.files[0].name : dosyaVarsayilan; });
      belgeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!dosya.files.length) { bildir('Belge alanı zorunludur.'); return; }
        var f = dosya.files[0];
        if (['application/pdf', 'image/jpeg', 'image/png'].indexOf(f.type) < 0 || f.size > 10 * 1024 * 1024) { bildir('Belge PDF, JPG veya PNG olmalı ve 10 MB sınırını aşmamalıdır.'); return; }
        var kb = Math.max(1, Math.round(f.size / 1024));
        if (K.oku('isletme-belge').some(function (x) { return x.basvuru === anahtar() && x.ad === f.name && x.kb === kb; })) { bildir('Bu belge zaten yüklendi.'); return; }
        var x = { id: 'belge-' + Date.now(), basvuru: anahtar(), tur: belgeForm.elements.tur.value, ad: f.name, kb: kb };
        K.ekle('isletme-belge', x);
        belgeListe.insertAdjacentHTML('beforeend', belgeSatir(x));
        belgeForm.reset(); dosyaAd.textContent = dosyaVarsayilan;
        bildir('Belge yüklendi.');
      });
    }

    /* İncelemeye gönder: canlı IsletmeBasvuruServisi::doluluguDogrula — kayıtlı taslağın zorunlu alanları */
    var ZORUNLU = [['mekan_turu', 'İşletme Türü'], ['fiyat_seviyesi', 'Fiyat Aralığı'], ['il', 'İl'], ['ilce', 'İlçe'], ['acik_adres', 'Açık Adres'], ['yetkili_ad', 'Yetkili Ad Soyad'], ['yetkili_telefon', 'Yetkili Telefon'], ['isletme_eposta', 'E-posta'], ['isletme_telefon', 'İşletme Telefonu'], ['vergi_veya_ruhsat_no', 'Vergi No / İşletme Belgesi No'], ['tanitim', 'Kısa Tanıtım'], ['hizmetler', 'Sunulan Hizmetler'], ['hizmet_turleri', 'Servis Türü'], ['dogrulama_onayi', 'Bilgilerin doğrulanması için açık rıza'], ['kosullar_onayi', 'Aydınlatma Metni ve KVKK onayı']];
    if (gonder) {
      gonder.addEventListener('click', function () {
        hataGizle();
        var k = kayit();
        if (!k || !duzenlenir()) { hataGoster('Başvuru güncel değil veya gönderilemez durumda.'); return; }
        var eksik = ZORUNLU.filter(function (z) { var d = k[z[0]]; return !d || (d.length === 0); }).map(function (z) { return z[1]; });
        if (eksik.length) { hataGoster('Başvuru incelemeye gönderilemez, eksik alanlar var: ' + eksik.join(', ') + '.'); return; }
        K.guncelle('isletme-basvuru', k.id, { durum: 'gonderildi', gonderildi: bugun() });
        sonraBildir('Başvurun incelemeye gönderildi.');
        location.href = kok + 'isletme/';
      });
    }
  }

  /* ---------- Değerlendirmeler: yanıt (canlı DegerlendirmeYanitIstegi: 5–2000 karakter, bir kez) ---------- */
  var degListe = $('[data-deg-liste]');
  if (degListe) {
    var yanitNotu = function (m) { return '<div class="bilgi-notu"><i class="fa-solid fa-reply" aria-hidden="true"></i><p><b>İşletme yanıtın:</b> ' + kac(m) + '</p></div>'; };
    var yanitFormu = function (id) { return '<form data-yanit-form="' + id + '"><div class="alan"><label class="alan-etiket" for="yanit-metin-' + id + '">Cevap metni</label><textarea class="alan-metin" id="yanit-metin-' + id + '" name="metin" minlength="5" maxlength="2000" placeholder="Kısa, somut ve nazik yaz." required></textarea></div><button class="dugme birincil" type="submit"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Yanıtla</button></form>'; };
    /* Üyenin Mikla sayfasından gönderdiği değerlendirme de mekân sahibine düşer (yalnız bu tarayıcıda) */
    K.oku('degerlendirme').filter(function (d) { return d.mekan === 'Mikla'; }).slice().reverse().forEach(function (d) {
      var dr = DEG[d.durum] || DEG.inceleniyor, alt = d.durum === 'yayinda' ? yanitFormu(d.id) : '<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Yalnızca yayınlanmış (onaylanmış) değerlendirmelere yanıt yazılabilir.</span></p>';
      degListe.insertAdjacentHTML('afterbegin', '<article class="kart panel" id="' + kac(d.id) + '" data-degerlendirme="' + kac(d.id) + '"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-star" aria-hidden="true"></i> Mikla</h3><p>Lezzet ' + d.lezzet + ' · Servis ' + d.servis + ' · Ambiyans ' + d.ambiyans + (d.foto ? ' · Fotoğraflı' : '') + '</p></div><div class="bolum-araclar">' + rozet(dr) + '</div></div>' + '<div class="kart-govde">' + (d.metin ? '<p class="okuma-notu">' + kac(d.metin) + '</p>' : '') + alt + '</div></article>');
    });
    var n = degListe.querySelectorAll('[data-degerlendirme]').length;
    $$('[data-deg-sayi]').forEach(function (s) { s.textContent = n + ' değerlendirme'; });
    var yanitla = function (f, metin) { f.outerHTML = yanitNotu(metin); };
    K.oku('isletme-yanit').forEach(function (y) { var f = degListe.querySelector('[data-yanit-form="' + y.id + '"]'); if (f) { yanitla(f, y.metin); } });
    degListe.addEventListener('submit', function (e) {
      var f = e.target.closest('[data-yanit-form]'); if (!f) { return; }
      e.preventDefault();
      var a = f.elements.metin, m = a.value.trim();
      if (m.length < 5) { a.setCustomValidity('Yorum metni en az 5 karakter olmalıdır.'); a.reportValidity(); a.addEventListener('input', function () { a.setCustomValidity(''); }, { once: true }); return; }
      if (!f.reportValidity()) { return; }
      K.ekle('isletme-yanit', { id: f.getAttribute('data-yanit-form'), metin: m });
      yanitla(f, m);
      bildir('Yanıtın yayınlandı.');
    });
  }
})();
