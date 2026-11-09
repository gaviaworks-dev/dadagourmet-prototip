/* Prototip çalışma katmanı: hiçbir yere veri gönderilmez, canlı uç çağrılmaz. */
(function () {
  'use strict';
  /* Demo oturum: gerçek hesap yok. Durum localStorage'da; depo kapalıysa `?auth=1` bağlarda taşınır. Bütün yollar göreli. */
  var kok = document.documentElement.dataset.kok || './', ANAHTAR = 'dg-oturum', depo = true;
  var oturumOku = function () { try { return localStorage.getItem(ANAHTAR) === '1'; } catch (e) { depo = false; return false; } };
  var oturumYaz = function (acik) { try { if (acik) { localStorage.setItem(ANAHTAR, '1'); } else { localStorage.removeItem(ANAHTAR); } return true; } catch (e) { depo = false; return false; } };
  var adres = new URLSearchParams(location.search), authParam = adres.get('auth') === '1';
  if (authParam) { oturumYaz(true); }
  var uye = oturumOku() || authParam;
  var kimlik = document.createElement('meta'); kimlik.name = 'dada-kimlik';
  /* Örnek üye değerleri derleyiciden gelir: _src/kabuk/ornek-uye.json */
  var ornek = (document.querySelector('meta[name="dg-ornek-uye"]') || { content: '|' }).content.split('|');
  kimlik.content = JSON.stringify(uye ? { auth: true, roles: ['kullanici'], ad: ornek[0], kullaniciAdi: ornek[1] } : { auth: false });
  document.head.appendChild(kimlik);
  if (document.documentElement.dataset.uyeSayfa && !uye) { location.replace(kok + 'giris/?donus=' + encodeURIComponent(document.documentElement.dataset.yol + '/')); }
  /* Demo rolleri (Diet prototipindeki düzen): üye Gurme Panelim'e, mekân sahibi İşletme Paneli'ne, yönetici Yönetim'e iner */
  var ROL_EV = { uye: 'hesabim/gurme-panelim/', isletme: 'isletme/', yonetici: 'yonetim/' };
  var rolOku = function () { try { var r = localStorage.getItem('dg-rol'); return ROL_EV[r] ? r : 'uye'; } catch (e) { return 'uye'; } };
  window.dgRol = rolOku;
  /* Canlıda giriş ve kayıt ekranı oturumluya açılmaz, kendi alanına yönlenir */
  if (uye && /^(giris|kayit)$/.test(document.documentElement.dataset.yol || '')) { location.replace(kok + ROL_EV[rolOku()]); }
  var uyeOl = function (rol) {
    rol = ROL_EV[rol] ? rol : 'uye';
    var kaydedildi = oturumYaz(true), d = adres.get('donus') || '';
    try { localStorage.setItem('dg-rol', rol); } catch (e) { /* depo kapalı */ }
    var hedef = rol === 'uye' && /^[a-z0-9/-]+$/.test(d) ? d : ROL_EV[rol];
    location.href = kok + hedef + (kaydedildi ? '' : '?auth=1');
  };
  /* Rol seçici: rol değişince o hesabın demo e-postası dolar; şifre aynı kalır */
  document.addEventListener('click', function (e) {
    /* Nasıl giriş yapmak istersin? E-posta ya da Telefon (canlı `giris` düzeni): seçilen alan açılır, öbürü kapanıp gönderime girmez */
    var gm = e.target.closest('#giSeg [data-gimode]');
    if (gm) {
      [].forEach.call(gm.parentNode.querySelectorAll('button'), function (b) { var a = b === gm; b.classList.toggle('aktif', a); b.setAttribute('aria-pressed', a ? 'true' : 'false'); });
      var tel = gm.dataset.gimode === 'tel', ef = document.getElementById('giEmailField'), tf = document.getElementById('giTelField');
      if (ef && tf) { ef.hidden = tel; tf.hidden = !tel; [].forEach.call(ef.querySelectorAll('input'), function (i) { i.disabled = tel; }); [].forEach.call(tf.querySelectorAll('input'), function (i) { i.disabled = !tel; }); }
      var gy = document.querySelector('input[name="giris_yontemi"]'); if (gy) { gy.value = tel ? 'telefon' : 'eposta'; }
      return;
    }
    var r = e.target.closest('#giRol button'); if (!r) { return; }
    [].forEach.call(r.parentNode.querySelectorAll('button'), function (b) { var a = b === r; b.classList.toggle('aktif', a); b.setAttribute('aria-pressed', a ? 'true' : 'false'); });
    var g = document.getElementById('giEmail'); if (g) { g.value = r.dataset.eposta; g.classList.remove('hatali'); }
  });
  var yerel = function (u) { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } };
  var yanit = function () { return new Response('{"ok":true,"prototip":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }); };
  var ozFetch = window.fetch.bind(window);
  window.fetch = function (girdi, ayar) {
    var yontem = ((ayar && ayar.method) || (girdi && girdi.method) || 'GET').toUpperCase();
    var adres = typeof girdi === 'string' ? girdi : (girdi && girdi.url) || '';
    if (yontem !== 'GET') { return Promise.resolve(yanit()); }
    if (yerel(adres) && !/\/assets\//.test(adres)) { return Promise.resolve(yanit()); }
    return ozFetch(girdi, ayar);
  };
  var bildir = function (metin) {
    var t = document.getElementById('keToast'), m = document.getElementById('keToastMsg');
    if (!t || !m) { return; }
    m.textContent = metin; t.classList.add('show', 'on');
    clearTimeout(bildir.z); bildir.z = setTimeout(function () { t.classList.remove('show', 'on'); }, 2800);
  };
  /* Altbilgi perdesi: portal betiği yüklenmeyen üye zincirinde de ana içeriğin alt boşluğu altbilgi boyuna eşitlenir,
     yoksa sabit altbilgi ana içeriğin altında kalır ve hiç açılmaz (ölçüldü: 7 üye sayfası, margin-bottom 0). */
  var perdeAyarla = function () {
    var f = document.querySelector('.footer.orange'), m = document.getElementById('pageMain'); if (!f || !m) { return; }
    var sigmaz = window.matchMedia('(min-width:641px)').matches && f.offsetHeight > window.innerHeight;
    document.documentElement.classList.toggle('altbilgi-akista', sigmaz);
    m.style.marginBottom = !sigmaz && getComputedStyle(f).position === 'fixed' ? f.offsetHeight + 'px' : '';
  };
  window.addEventListener('load', perdeAyarla); window.addEventListener('resize', perdeAyarla); document.addEventListener('DOMContentLoaded', perdeAyarla);
  /* Mobil menü: üye zincirinde `portal` yüklenmez, çekmeceyi açan kod da onunla gider. Davranış aynen burada */
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.documentElement.dataset.uyeSayfa) { return; }
    var d = document.getElementById('drawer'), o = document.getElementById('drawerOverlay'), h = document.getElementById('hamburger'), x = document.getElementById('drawerClose');
    if (!d || !o || !h || !x) { return; }
    var cekmece = function (on) { d.classList.toggle('open', on); o.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : ''; };
    h.addEventListener('click', function () { cekmece(true); });
    [x, o].forEach(function (e) { e.addEventListener('click', function () { cekmece(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cekmece(false); } });
    [].forEach.call(d.querySelectorAll('.d-sub a,.d-item > a.d-link,.drawer-foot a,.drawer-foot > button'), function (e) { e.addEventListener('click', function () { cekmece(false); }); });
  });
  /* Süzgeç sayfası (≤1024 alt sayfa, Mekânlar ve Etkinlikler): Gastro `liste.js` davranışı tek yerde.
     Aç: #btnFilter. Kapa: #sheetClose, #sheetApply, örtü, Esc. Açıkken gövde kaymaz, odak sayfaya geçer; kapanınca açan düğmeye döner */
  var suzgecDon = null;
  var suzgec = function (ac) {
    var s = document.getElementById('lstSide'); if (!s || s.classList.contains('open') === !!ac) { return; }
    var o = document.getElementById('sheetOverlay'), t = document.getElementById('btnFilter'), k = document.getElementById('sheetClose');
    s.classList.toggle('open', !!ac); if (o) { o.classList.toggle('open', !!ac); }
    document.body.style.overflow = ac ? 'hidden' : '';
    if (t) { t.setAttribute('aria-expanded', ac ? 'true' : 'false'); }
    if (ac) { suzgecDon = document.activeElement; if (k) { k.focus({ preventScroll: true }); } }
    else { if (suzgecDon && suzgecDon.focus) { suzgecDon.focus({ preventScroll: true }); } suzgecDon = null; }
  };
  window.dgSuzgec = suzgec;
  /* Detay eylem çubuğu (mekân, etkinlik) Gastro tarif çubuğu gibi sabit engel sayılır: canlı Gourmet işaretindeki `data-bc-clear` çubuğu
     "kayan" sınıfına koyuyor ve başa dön düğmesi çubuğu hiç hesaba katmıyordu. Engel sayılınca çubuk düğmeyle kesiştiğinde
     (çubuk iki satıra uzarsa) bottom-clearance.js düğmeyi çubuğun 12px üstüne kaldırır */
  document.addEventListener('DOMContentLoaded', function () { [].forEach.call(document.querySelectorAll('.vd-actbar[data-bc-bar],.evd-actbar[data-bc-bar]'), function (b) { b.removeAttribute('data-bc-clear'); }); });
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) { return; }
    if (t.closest('#btnFilter')) { suzgec(true); return; }
    if (t.closest('#sheetClose,#sheetApply') || t.id === 'sheetOverlay') { e.preventDefault(); suzgec(false); }
  });
  document.addEventListener('keydown', function (e) { var s = document.getElementById('lstSide'); if (e.key === 'Escape' && s && s.classList.contains('open')) { suzgec(false); } });
  window.prototipBildir = bildir;
  /* Demo kayıtları: rezervasyon, favori, değerlendirme gibi işlemler yalnız bu tarayıcıda durur, hiçbir yere gitmez. Gurme Panelim buradan okur. */
  var KAYIT = 'dg-kayit', bellek = {};
  var hepsi = function () { try { return JSON.parse(localStorage.getItem(KAYIT)) || {}; } catch (e) { return bellek; } };
  var sakla = function (v) { bellek = v; try { localStorage.setItem(KAYIT, JSON.stringify(v)); } catch (e) { /* depo kapalı: sayfa içinde kalır */ } };
  window.dgKayit = {
    oku: function (tur) { return hepsi()[tur] || []; },
    ekle: function (tur, k) { var v = hepsi(); (v[tur] = v[tur] || []).unshift(k); sakla(v); return k; },
    sil: function (tur, id) { var v = hepsi(); v[tur] = (v[tur] || []).filter(function (k) { return k.id !== id; }); sakla(v); },
    var: function (tur, id) { return (hepsi()[tur] || []).some(function (k) { return k.id === id; }); },
    /* Karar ekranları (İşletme Paneli, Yönetim) durumu buradan değiştirir; üye aynı kaydı Gurme Panelim'de görür */
    guncelle: function (tur, id, alan) { var v = hepsi(); (v[tur] || []).forEach(function (k) { if (k.id === id) { Object.keys(alan).forEach(function (a) { k[a] = alan[a]; }); } }); sakla(v); }
  };
  /* Dada Puan: şartname değerleri. Gönderimde bekler, onayda kesinleşir (§8 #6, #18); reddedilen kayıt puanı düşer */
  window.dgPuan = {
    KURAL: { yorum: 15, oneri: 50, puanlama: 2, rezervasyon: 25 },
    ekle: function (id, ad, tutar) { window.dgKayit.ekle('puan', { id: id, ad: ad, tutar: tutar, durum: 'bekliyor' }); },
    kesinlestir: function (id) { window.dgKayit.guncelle('puan', id, { durum: 'kesin' }); },
    dusur: function (id) { window.dgKayit.guncelle('puan', id, { durum: 'dustu' }); },
    toplam: function (durum) { return window.dgKayit.oku('puan').reduce(function (t, k) { return t + ((k.durum || 'bekliyor') === durum ? k.tutar : 0); }, 0); }
  };
  /* Örnek kayıtlar: döngü ilk açılışta görünsün diye bir kez yazılır, hepsi `ornek` işaretli. Tarih bugüne göre kurulur */
  (function () {
    var v = hepsi(); if (v.tohum === 2) { return; }
    var gun = function (n) { var d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
    var koy = function (tur, k) { (v[tur] = v[tur] || []).push(k); };
    var yok = function (tur, id) { return !(v[tur] || []).some(function (k) { return k.id === id; }); };
    if (yok('rezervasyon', 'ornek-rez')) { koy('rezervasyon', { id: 'ornek-rez', mekan: 'Mikla', yer: 'Beyoğlu, İstanbul', gun: gun(3), saat: '20:00', kisi: 2, alerjen: '', durum: 'talep', ornek: true }); }
    if (yok('rezervasyon', 'ornek-rez-gecmis')) { koy('rezervasyon', { id: 'ornek-rez-gecmis', mekan: 'Mikla', yer: 'Beyoğlu, İstanbul', gun: gun(-2), saat: '19:30', kisi: 2, alerjen: 'Fıstık alerjisi', durum: 'onaylandi', ornek: true }); koy('puan', { id: 'ornek-rez-gecmis', ad: 'Mikla rezervasyonu', tutar: 25, durum: 'bekliyor', ornek: true }); }
    if (yok('oneri', 'ornek-oneri-m')) { koy('oneri', { id: 'ornek-oneri-m', tur: 'mekan', ad: 'Örnek mekân önerisi', yer: 'Kadıköy, İstanbul', durum: 'inceleniyor', ornek: true }); koy('puan', { id: 'ornek-oneri-m', ad: 'Örnek mekân önerisi', tutar: 50, durum: 'bekliyor', ornek: true }); }
    if (yok('oneri', 'ornek-oneri-e')) { koy('oneri', { id: 'ornek-oneri-e', tur: 'etkinlik', ad: 'Örnek etkinlik önerisi', yer: 'Urla, İzmir', durum: 'yayinda', ornek: true }); koy('puan', { id: 'ornek-oneri-e', ad: 'Örnek etkinlik önerisi', tutar: 50, durum: 'kesin', ornek: true }); }
    v.tohum = 2; sakla(v);
  })();
  /* Giriş isteyen eylem: misafiri girişe götürür, sonra aynı sayfaya döner */
  window.dgUye = function () { if (uye) { return true; } location.href = kok + 'giris/?donus=' + encodeURIComponent((document.documentElement.dataset.yol || '') + '/'); return false; };
  document.addEventListener('DOMContentLoaded', function () {
    if (uye) { document.body.classList.add('is-auth'); document.body.setAttribute('data-roles', 'kullanici'); }
    /* Canlıda alt çubuk Profil üyede Hesabım'a gider */
    if (uye) { [].forEach.call(document.querySelectorAll('.bn-item[href$="giris/"]'), function (a) { a.setAttribute('href', kok + 'hesabim/ayarlar/'); }); }
  });
  window.addEventListener('load', function () {
    ['ysYeni', 'ysTekrar'].forEach(function (id) { var a = document.getElementById(id); if (a && a.value) { a.dispatchEvent(new Event('input', { bubbles: true })); } });
    if (adres.get('yenilendi')) { bildir('Şifren yenilendi. Giriş yapabilirsin.'); }
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    if (f.hasAttribute('data-yerel')) { return; }
    if (f.id === 'formGiris' || f.id === 'formKayit') { e.stopImmediatePropagation(); var ra = f.querySelector('#giRol .aktif'); uyeOl(ra ? ra.dataset.rol : 'uye'); return; }
    if (f.id === 'formSifre') {
      e.stopImmediatePropagation();
      var ok = document.getElementById('sifreOk');
      if (ok) {
        f.hidden = true; ok.hidden = false; ok.classList.add('acik');
        var b = ok.querySelector('h4'); if (b) { b.textContent = 'Sıfırlama bağlantısı gönderildi'; }
        if (!ok.querySelector('a')) { ok.insertAdjacentHTML('beforeend', '<a class="dugme birincil giris-gonder" href="' + kok + 'sifre-yenile/">Yeni şifreni belirle</a>'); }
      }
      return;
    }
    if (f.id === 'formYeniSifre') { e.stopImmediatePropagation(); location.href = kok + 'giris/?yenilendi=1'; return; }
    if (f.id === 'moForm') {
      e.stopImmediatePropagation();
      if (!uye) { window.dgUye(); return; }
      var kip = f.dataset.kip === 'etkinlik' ? 'etkinlik' : 'mekan';
      var ad = f.elements.name.value.trim() || (kip === 'etkinlik' ? 'Etkinlik önerisi' : 'Mekân önerisi'), id = 'oneri-' + Date.now();
      window.dgKayit.ekle('oneri', { id: id, tur: kip, ad: ad, yer: f.elements.location.value.trim(), gun: kip === 'etkinlik' && f.elements.tarih ? f.elements.tarih.value : '', durum: 'inceleniyor' });
      window.dgPuan.ekle(id, ad + ' önerisi', window.dgPuan.KURAL.oneri);
      f.reset(); document.getElementById('moClose').click();
      bildir('Önerin Topluluk Katkılarım\'a işlendi. +' + window.dgPuan.KURAL.oneri + ' bekleyen puan.');
      return;
    }
    bildir('Prototip: form gönderilmedi.');
  }, true);
  /* Öneri penceresi iki kipte: mekân (canlı metin) ve etkinlik. Metinler ilk açılışta saklanır, kip değişince geri yazılır */
  var oneriKipi = function (mo, kip) {
    var f = mo.querySelector('#moForm'); if (!f) { return; }
    var alanlar = { '#moTitle': 'Etkinlik Öner', '#moTitle + p': 'Bildiğin bir hasat günü, festival ya da atölyeyi öner — editör onayıyla takvime eklenir.', 'label[for="moName"]': 'Etkinlik adı', 'label[for="moCity"]': 'Şehir / yer', 'label[for="moWhy"]': 'Etkinliği kısaca anlat', '#moUp > span > span': 'Etkinliğin bir karesi önerini güçlendirir' };
    var yer = { '#moName': 'Örn. Urla Bağ Bozumu Şenliği', '#moCity': 'Örn. İzmir, Urla', '#moWhy': 'Ne zaman, kimler katılabilir, öne çıkan lezzetler…' };
    if (!f.dataset.asil) { var asil = {}; Object.keys(alanlar).concat(Object.keys(yer)).forEach(function (k) { var e = mo.querySelector(k); if (e) { asil[k] = yer[k] ? e.placeholder : e.textContent; } }); f.dataset.asil = JSON.stringify(asil); }
    var a = JSON.parse(f.dataset.asil), etk = kip === 'etkinlik';
    Object.keys(alanlar).forEach(function (k) { var e = mo.querySelector(k); if (e) { e.textContent = etk ? alanlar[k] : a[k]; } });
    Object.keys(yer).forEach(function (k) { var e = mo.querySelector(k); if (e) { e.placeholder = etk ? yer[k] : a[k]; } });
    var tip = mo.querySelector('#moType'); if (tip) { tip.closest('.mo-field').hidden = etk; }
    var tarih = mo.querySelector('#moTarih');
    /* Tarih alanı satırda Mekân tipinin yerini alır: Şehir / yer ile yan yana */
    if (!tarih) { mo.querySelector('#moCity').closest('.mo-field').insertAdjacentHTML('afterend', '<div class="mo-field" id="moTarihAlan"><label for="moTarih">Tarih</label><input type="date" name="tarih" id="moTarih"></div>'); tarih = mo.querySelector('#moTarih'); }
    mo.querySelector('#moTarihAlan').hidden = !etk; tarih.required = etk; f.dataset.kip = kip;
  };
  /* Konum penceresi: canlı `#lkModal` DOM'u. Seçim bu tarayıcıda kalır, sunucuya gitmez. Tarayıcı izni yalnız düğmeye basınca istenir. */
  var konumAc = function (ac) { var m = document.getElementById('lkModal'), o = document.getElementById('lkOverlay'); if (!m) { return; } m.classList.toggle('show', ac); m.classList.toggle('open', ac); o.classList.toggle('show', ac); o.classList.toggle('open', ac); m.toggleAttribute('inert', !ac); };
  window.dgKonumAc = konumAc;
  var konumOlay = function (e) {
    var t = e.target; if (!t.closest) { return false; }
    if (t.closest('[data-location-trigger]')) { e.preventDefault(); konumAc(true); return true; }
    if (t.closest('#lkClose,#lkSkip') || t.id === 'lkOverlay') { konumAc(false); return true; }
    var m = document.getElementById('lkModal');
    if (t.closest('#lkRow-tr')) { konumAc(false); bildir('Türkiye ' + m.dataset.msgSelectedSuffix); return true; }
    if (t.closest('#lkGeoBtn')) {
      if (!navigator.geolocation) { bildir(m.dataset.msgGeoUnsupported); return true; }
      navigator.geolocation.getCurrentPosition(function (k) { konumAc(false); bildir(m.dataset.msgGeoSuccess); try { localStorage.setItem('dg-konum', JSON.stringify({ lat: k.coords.latitude, lng: k.coords.longitude })); } catch (x) { /* depo kapalı */ } document.dispatchEvent(new CustomEvent('dg-konum', { detail: { lat: k.coords.latitude, lng: k.coords.longitude } })); }, function (h) { bildir(h.code === 1 ? m.dataset.msgGeoDenied : h.code === 3 ? m.dataset.msgGeoTimeout : m.dataset.msgGeoGeneric); }, { timeout: 8000 });
      return true;
    }
    return false;
  };
  /* Giriş kapısı: canlı `#lgGate` penceresi. Üyede eylem kendi betiğine düşer */
  var kapiAc = function (on, t) {
    var g = document.getElementById('lgGate'), o = document.getElementById('lgOverlay'); if (!g) { return; }
    [g, o].forEach(function (x) { x.classList.toggle('show', on); x.classList.toggle('open', on); });
    if (on) { document.getElementById('lgGateTitle').textContent = t.dataset.lgTitle || g.dataset.defTitle; document.getElementById('lgGateDesc').textContent = t.dataset.lgDesc || g.dataset.defDesc; }
  };
  var kapiOlay = function (e) {
    var t = e.target; if (!t.closest) { return false; }
    if (t.closest('[data-lg-close]') || t.id === 'lgOverlay') { kapiAc(false); return true; }
    var k = t.closest('[data-lg-gate]'); if (k && !uye) { e.preventDefault(); e.stopImmediatePropagation(); kapiAc(true, k); return true; }
    return false;
  };
  document.addEventListener('click', function (e) {
    var cikis = e.target.closest && e.target.closest('[data-cikis]');
    if (cikis) { e.preventDefault(); e.stopImmediatePropagation(); oturumYaz(false); location.href = kok; return; }
    var bag = e.target.closest && e.target.closest('a[href]');
    if (bag && uye && !depo && bag.origin === location.origin && bag.getAttribute('href') !== '#') { var u = new URL(bag.href); u.searchParams.set('auth', '1'); bag.href = u.href; }
    if (konumOlay(e)) { return; }
    var oner = e.target.closest && e.target.closest('[data-mo-open],#mekanOnerBtn');
    /* Etkinlik Öner (W2.4b, akış 6): aynı öneri penceresi etkinlik kipinde açılır. Altbilgideki düğme canlıda Görüş Bildir'i açıyor; burada öneri formuna gider */
    var etk = e.target.closest && (e.target.closest('[data-etkinlik-oner]') || (e.target.closest('[data-feedback-open]') && /Etkinlik Öner/.test(e.target.closest('[data-feedback-open]').textContent) ? e.target.closest('[data-feedback-open]') : null));
    /* Altbilgideki Öneri ve Şikâyet: canlıdaki gibi Görüş Bildir penceresini açar (sekmenin kendi açılış yolu) */
    var gorus = !etk && e.target.closest && e.target.closest('[data-feedback-open]'), fbSekme = document.getElementById('fbTab');
    if (gorus && fbSekme) { e.preventDefault(); e.stopImmediatePropagation(); fbSekme.click(); return; }
    var mo = document.getElementById('moModal'), moO = document.getElementById('moOverlay');
    if ((oner || etk) && mo) { e.preventDefault(); e.stopImmediatePropagation(); oneriKipi(mo, etk ? 'etkinlik' : 'mekan'); mo.classList.add('show', 'open'); moO.classList.add('show', 'open'); mo.removeAttribute('inert'); if (!mo.querySelector('.mo-puan')) { mo.querySelector('.mo-foot').insertAdjacentHTML('beforebegin', '<p class="mo-puan"><i class="fa-solid fa-award" aria-hidden="true"></i> Editör onayında +' + window.dgPuan.KURAL.oneri + ' Dada Puan kesinleşir. Onaya kadar bekleyen puan olarak görünür.</p>'); } return; }
    if (mo && (e.target === moO || (e.target.closest && e.target.closest('#moModal .fb-close,#moCancel')))) { mo.classList.remove('show', 'open'); moO.classList.remove('show', 'open'); mo.setAttribute('inert', ''); return; }
    if (kapiOlay(e)) { return; }
    var git = e.target.closest && e.target.closest('[data-git]');
    /* Kart içindeki düğme ve bağ kendi işini yapar; kart tıklaması onu ezmez */
    if (git && !e.target.closest('a,button')) { location.href = git.getAttribute('data-git'); }
  }, true);
  /* Sekme şeridi kaydırılabilir: seçili sekme açılışta görünür alana gelir. Sayfa kaymaz, yalnız şerit */
  window.addEventListener('load', function () {
    [].forEach.call(document.querySelectorAll('.sekmeler,.lg-menu'), function (s) {
      var a = s.querySelector('.aktif,.active'); if (!a || s.scrollWidth <= s.clientWidth) { return; }
      s.scrollLeft = a.offsetLeft - s.offsetLeft - (s.clientWidth - a.offsetWidth) / 2;
    });
  });
})();
