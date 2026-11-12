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
  /* ==== Reklam önizlemesi (reklam-onizleme, Beyar 11 Kas) ====
     Prototipte reklam alanlarını göster/gizle. Seçim localStorage `dg-reklam` ('1' açık, '0' kapalı); depo kapalıysa bu sayfanın
     değişkeninde. `?reklam=1` / `?reklam=0` seçimi yazar (patrona bağ); yazılabildiyse parametre adresten düşer. Varsayılan KAPALI.
     Durum burada, <head>'de, boyamadan önce okunur: açıkken köke `rk-acik` yazılır, anahtar ilk karede doğru görünür.
     Anahtarları bağlayan, şeridi ve yerleşimleri basan betik `assets/js/reklam/reklam.js` (yalnız public ve üye kabuğunda) */
  (function () {
    var A = 'dg-reklam', bellek = null;
    var oku = function () { try { var v = localStorage.getItem(A); return v === null ? bellek : v; } catch (e) { return bellek; } };
    var yaz = function (v) { bellek = v; try { localStorage.setItem(A, v); return true; } catch (e) { return false; } };
    var p = adres.get('reklam');
    if ((p === '1' || p === '0') && yaz(p) && window.history && history.replaceState) {
      var u = new URL(location.href); u.searchParams.delete('reklam');
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    }
    window.dgReklam = {
      acik: function () { return oku() === '1'; },
      ayarla: function (on) {
        yaz(on ? '1' : '0');
        document.documentElement.classList.toggle('rk-acik', !!on);
        document.dispatchEvent(new CustomEvent('dg-reklam', { detail: !!on }));
      }
    };
    if (window.dgReklam.acik()) { document.documentElement.classList.add('rk-acik'); }
  })();
  /* ==== /Reklam önizlemesi ==== */
  /* İşletme Paneli (`data-panel="isletme"`) girişi mekân sahibi rolü seçili açılır */
  if (document.documentElement.dataset.uyeSayfa && !uye) { location.replace(kok + 'giris/?' + (document.documentElement.dataset.panel === 'isletme' ? 'rol=isletme&' : '') + 'donus=' + encodeURIComponent(document.documentElement.dataset.yol + '/')); }
  /* Demo rolleri (canlı giriş: Kullanıcı | İşletme): üye Gurme Panelim'e, mekân sahibi İşletme Paneli'ne iner. Yönetici rolü yok (Beyar, 11 Kas); eski oturumdaki `yonetici` üyeye düşer */
  var ROL_EV = { uye: 'hesabim/gurme-panelim/', isletme: 'isletme/' };
  var rolOku = function () { try { var r = localStorage.getItem('dg-rol'); return ROL_EV[r] ? r : 'uye'; } catch (e) { return 'uye'; } };
  window.dgRol = rolOku;
  /* Canlıda giriş ve kayıt ekranı oturumluya açılmaz, kendi alanına yönlenir */
  /* `?rol=` ile gelen (panel girişi) oturumluyu da rol değiştirmek için ekranda tutar */
  if (uye && !ROL_EV[adres.get('rol')] && /^(giris|kayit)$/.test(document.documentElement.dataset.yol || '')) { location.replace(kok + ROL_EV[rolOku()]); }
  var uyeOl = function (rol) {
    rol = ROL_EV[rol] ? rol : 'uye';
    var kaydedildi = oturumYaz(true), d = adres.get('donus') || '';
    /* MD-12 (mekan-sekme, 11 Kas): dönüşte baştaki `/` düşer, sayfa sekmesi (`?tab=<ad>`) korunur; mekân Yorumlar sekmesinden girişe giden aynı sekmeye döner (canlı bağ `donus=%2Fmekan%2Fmikla%3Ftab%3Dyorumlar`) */
    var sekme = (d.match(/\?tab=[a-z-]+$/) || [''])[0]; d = d.slice(0, d.length - sekme.length).replace(/^\//, ''); if (sekme && d && !/\/$/.test(d)) { d += '/'; }
    try { localStorage.setItem('dg-rol', rol); } catch (e) { /* depo kapalı */ }
    var hedef = /^[a-z0-9/-]+$/.test(d) && (rol === 'uye' ? !/^(isletme|yonetim)(\/|$)/.test(d) : d.indexOf(ROL_EV[rol]) === 0) ? d : ROL_EV[rol];
    var ek = hedef === d ? sekme : '';
    location.href = kok + hedef + ek + (kaydedildi ? '' : (ek ? '&' : '?') + 'auth=1');
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
  /* Bildirim: `bildir(metin, 'uyari')` uyarı/hata kipinde (Dalga 2 mobil · genel, 11 Kas). Kanon `#keToast` tek kipli: ikon hep yeşil onay,
     "Devam etmek için en az bir ortam seç." gibi uyarılar da onayla çıkıyordu. Uyarıda ikon kanonun hata ikonu (`fa-circle-exclamation`,
     telefon alanı hata satırıyla aynı) ve rengi koyu zeminde okunan kanon sarısı (`--yellow`; kural prototip.css); kapanınca onay ikonuna döner */
  var bildir = function (metin, tur) {
    var t = document.getElementById('keToast'), m = document.getElementById('keToastMsg');
    if (!t || !m) { return; }
    var uyari = tur === 'uyari', i = t.querySelector('i');
    t.classList.toggle('uyari', uyari); t.setAttribute('role', uyari ? 'alert' : 'status');
    if (i) { i.classList.toggle('fa-circle-exclamation', uyari); i.classList.toggle('fa-circle-check', !uyari); }
    m.textContent = metin; t.classList.add('show', 'on');
    clearTimeout(bildir.z); bildir.z = setTimeout(function () { t.classList.remove('show', 'on'); setTimeout(function () { if (!t.classList.contains('show')) { t.classList.remove('uyari'); t.setAttribute('role', 'status'); if (i) { i.classList.remove('fa-circle-exclamation'); i.classList.add('fa-circle-check'); } } }, 350); }, 2800);
  };
  /* Altbilgi perdesi (H4, Beyar 11 Kas; 10 Kas'taki normal akış kararı geri alındı). Canlı Gastro portal betiğinin ve `gastro/altbilgi-perde.js`in
     işi tek yerde, her zincirde (üye zinciri ikisini de yüklemiyor): ≥641'de altbilgi sabitse `#pageMain` alt boşluğu altbilgi boyu, altbilgi
     pencereden uzunsa köke `altbilgi-akista` (altbilgi akışa döner). Kurallar prototip.css'te. Altbilgi boyu sonradan değişince (yazı tipi,
     pencere, çerez bandı) ResizeObserver yeniden ölçer: boşluk eski boyda kalırsa sayfa sonunda altbilginin üstü içeriğin altında kalıyordu */
  var perdeAyarla = function () {
    var f = document.querySelector('.footer.orange'), m = document.getElementById('pageMain'); if (!f || !m) { return; }
    var genis = window.matchMedia('(min-width:641px)').matches;
    document.documentElement.classList.toggle('altbilgi-akista', genis && f.offsetHeight > window.innerHeight);
    var bosluk = genis && getComputedStyle(f).position === 'fixed' ? f.offsetHeight + 'px' : '';
    if (m.style.marginBottom !== bosluk) { m.style.marginBottom = bosluk; }
  };
  document.addEventListener('DOMContentLoaded', function () {
    perdeAyarla();
    var f = document.querySelector('.footer.orange'); if (!f) { return; }
    if (window.ResizeObserver) { new ResizeObserver(perdeAyarla).observe(f); }
    /* Klavye odağı perde hâlindeki altbilgiye girince sayfa sona iner, yoksa odaklanan bağ içeriğin altında kalır (Diet prototipi `ortak.js`) */
    f.addEventListener('focusin', function () { if (getComputedStyle(f).position === 'fixed') { window.scrollTo(0, document.documentElement.scrollHeight); } });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(perdeAyarla); }
  });
  window.addEventListener('load', perdeAyarla); window.addEventListener('resize', perdeAyarla);
  /* ==== Altbilgi akordeonu (Beyar 11 Kas, bilinçli kanon sapması: Gastro ve Diet'te bağ grupları telefonda da açık) ====
     Yalnız ≤640: üç bağ grubunun (`.foot-col`) başlığı akordeon tetiği olur (başlığın içinde düğme, `aria-expanded`, `aria-controls`),
     bağlar varsayılan kapalı. Çoklu açılır (kanon §21'in tek açık kalem kuralı burada uygulanmaz; karar notu raporda): altbilgi bir gezinme
     haritası, kullanıcı birkaç grubu birlikte açıp karşılaştırabilir. Aşamalı: kapalı hâl yalnız betiğin koyduğu `.dip-akordeon` sınıfıyla,
     betik yoksa bağlar açık. ≥641'e geçince düğme sökülür, başlık düz metne döner (sütunlar bugünkü gibi). Yükseklik değişimini perde
     ResizeObserver'ı ölçer (≤640'ta altbilgi zaten akışta). Kurallar prototip.css "Altbilgi akordeonu" bloğunda */
  var dipAkordeon = function () {
    var f = document.querySelector('.footer.orange'); if (!f || !window.matchMedia) { return; }
    var dar = window.matchMedia('(max-width:640px)');
    var gruplar = [].slice.call(f.querySelectorAll('.foot-col')).filter(function (c) { return c.querySelector(':scope > h5') && c.querySelector(':scope > .foot-col-baglar[id]'); });
    if (!gruplar.length) { return; }
    var uygula = function () {
      gruplar.forEach(function (c) {
        var h = c.querySelector(':scope > h5'), g = c.querySelector(':scope > .foot-col-baglar'), b = h.querySelector('.foot-acc');
        if (dar.matches && !b) {
          b = document.createElement('button'); b.type = 'button'; b.className = 'foot-acc';
          b.setAttribute('aria-controls', g.id); b.setAttribute('aria-expanded', c.classList.contains('acik') ? 'true' : 'false');
          var t = document.createElement('span'); t.textContent = h.textContent.trim(); b.appendChild(t);
          b.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>');
          h.textContent = ''; h.appendChild(b);
        } else if (!dar.matches && b) { h.textContent = b.textContent.trim(); }
      });
      f.classList.toggle('dip-akordeon', dar.matches);
    };
    f.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.foot-acc'); if (!b || !f.contains(b)) { return; }
      var c = b.closest('.foot-col'), acik = c.classList.toggle('acik');
      b.setAttribute('aria-expanded', acik ? 'true' : 'false');
    });
    uygula();
    if (dar.addEventListener) { dar.addEventListener('change', uygula); } else if (dar.addListener) { dar.addListener(uygula); }
  };
  document.addEventListener('DOMContentLoaded', dipAkordeon);
  /* ==== /Altbilgi akordeonu ==== */
  /* ==== Programatik odak halkası (Beyar 11 Kas, Mekân Bul adım başlığı) ====
     Betik odağı başlığa, sonuç özetine ya da pencerenin ilk öğesine taşıyınca iOS Safari (ve masaüstü Safari) dokunulan/tıklanan düğmeye odak
     vermediği için önceki odak gövdede kalır; WebKit bu durumda betikle verilen odağı `:focus-visible` sayar ve klavye halkası çizilir. Son
     etkileşim işaretçiyse (dokunma, fare, kalem) köke `dg-isaretci`; gezinme tuşu (Tab, oklar, Enter, Boşluk, Esc, Home/End, PageUp/Down)
     sınıfı kaldırır. Kural prototip.css "Programatik odak halkası" bloğunda. Betik yoksa sınıf yok, halka klavye kuralıyla kalır */
  var GEZINME_TUSU = /^(Tab|Arrow(Up|Down|Left|Right)|Enter| |Spacebar|Escape|Esc|Home|End|PageUp|PageDown)$/;
  document.addEventListener('pointerdown', function () { document.documentElement.classList.add('dg-isaretci'); }, true);
  document.addEventListener('keydown', function (e) { if (GEZINME_TUSU.test(e.key)) { document.documentElement.classList.remove('dg-isaretci'); } }, true);
  /* ==== /Programatik odak halkası ==== */
  /* Başlığın saydam (tepede) kipi (K-KIRINTI, 11 Kas). Gastro kopyası `dm-kabuk.js`, `app` ve `parallax` betikleri hero'lu sayfada başlığı
     scrollY < 60 boyunca saydam tutuyor; kırıntı 15px kaydırmada saydam başlığın altına girip logonun üstünden geçiyordu (60px'e kadar).
     Canlı Gastro'nun yeni kuralı (`/tarifler` <head> satır içi betiği, ölçüldü 11 Kas): başlık yalnız scrollY <= 0'da saydam, eski üç bağlayıcı
     devre dışı (`__dmKabuk`, `data-at-top-bound`). İşaret ertelenmiş betiklerden önce (`interactive`) konur, kural tek yerde kalır.
     Yalnız `at-top`: `tepede` kanon başlığının (`.ikon-dugme`, `.ana-menu`) kipi, prototip başlığında hiç basılmıyordu, görünüm aynı kalır */
  window.__dmKabuk = true;
  var baslikTepede = function () {
    var h = document.querySelector('.header'); if (!h) { return; }
    h.dataset.atTopBound = '1';
    /* Hero ölçütü üç eski bağlayıcının birleşimi: `data-hero` (dm-kabuk, parallax), `data-fit-over`, `has-dark-hero` (app; doğrulama bandı yoksa) */
    var b = document.body;
    var hero = h.getAttribute('data-hero') === '1' || (b && (b.getAttribute('data-fit-over') === '1' || (b.classList.contains('has-dark-hero') && !document.querySelector('[data-verify-banner]'))));
    var tepede = hero && window.scrollY <= 0 && location.search.indexOf('hdr=solid') === -1;
    h.classList.toggle('at-top', tepede);
  };
  document.addEventListener('readystatechange', function () { var h = document.readyState !== 'loading' && document.querySelector('.header'); if (h) { h.dataset.atTopBound = '1'; } });
  window.addEventListener('scroll', baslikTepede, { passive: true }); window.addEventListener('pageshow', baslikTepede);
  document.addEventListener('DOMContentLoaded', baslikTepede); window.addEventListener('load', baslikTepede);
  /* Telefon maskesi (K8, 11 Kas): ortak Gastro maskesi (`f6/telefon-maskesi.js`, `gastro/telefon-alani.js`) yalnız 5 ile başlayan cep
     numarası kabul ediyordu. Canlı Gourmet sunucusu sabit hattı da alıyor (`KayitIstegi`, `ProfilIstegi`: 7-15 rakam; iletişim ve işletme
     başvurusu `[0-9+() .-]{7,40}`) ve canlı `kimlik.js` maskesi ilk haneye bakmıyor. Kural: TR cep (5xx), alan kodlu sabit hat (2xx, 3xx, 4xx),
     0850 / 0800 ve 444 numaraları; hepsi canlı kuralın alt kümesi. Biçim 3-3-2-2, 444 numarası 444 X XXX. Ülke seçici Gastro'daki gibi TR'ye kilitli.
     Gastro dosyaları donör kopyası olduğu için değişmedi: `f6` maskesi alana `data-telefon-maskesi` görünce bağlanmaz (alanlar betikten önce,
     `interactive` anında işaretlenir), `GastroTelefonAlani` sarılır. +90 öneki olmayan alanda (rezervasyon) numara 0 ile yazılır.
     İşletme paneli alanları (`inputmode="tel"`, canlıda serbest metin) yalnız denetlenir, biçimlenmez: panel değişikliği metinden kıyaslıyor */
  var TEL_SECICI = 'input[type="tel"], input[data-tel-mask], input[inputmode="tel"]';
  var TEL_BICIM = 'Geçerli bir telefon numarası gir (cep, sabit hat, 0850 ya da 444 numarası).';
  var TEL_EKSIK = 'Telefon numarası 10 hane olmalı (444 numarası 7 hane).';
  var TEL_KILIT = 'Şu an yalnız Türkiye (+90) numaraları kaydedilebiliyor.';
  var telHane = function (ham) {
    var d = String(ham == null ? '' : ham).replace(/\D+/g, '');
    while (d.charAt(0) === '0') { d = d.slice(1); }
    if (d.slice(0, 2) === '90' && d.length > 10) { d = d.slice(2); }
    return d.slice(0, d.slice(0, 3) === '444' ? 7 : 10);
  };
  var telBicim = function (d) {
    if (d.slice(0, 3) === '444') { return [d.slice(0, 3), d.slice(3, 4), d.slice(4, 7)].filter(Boolean).join(' '); }
    return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean).join(' ');
  };
  /* Önek: 2-5 ile başlayan alan kodu ya da cep; 8 ile yalnız 800 ve 850 */
  var telOnek = function (d) { return /^[2-5]/.test(d) || /^8(?:$|[05](?:$|0))/.test(d); };
  var telMesaj = function (d, odakGitti) {
    if (!d) { return ''; }
    if (!telOnek(d)) { return TEL_BICIM; }
    return odakGitti && d.length < (d.slice(0, 3) === '444' ? 7 : 10) ? TEL_EKSIK : '';
  };
  window.dgTelefon = { hane: telHane, bicim: telBicim, mesaj: telMesaj };
  /* İmleç: yeniden biçimlemeden sonra imleçten SONRAKİ hane sayısı korunur (başa 0 eklense de imleç kaymaz) */
  var telYaz = function (g, metin, imlec) {
    var sonra = imlec && g.selectionStart != null ? g.value.slice(g.selectionStart).replace(/\D+/g, '').length : -1;
    if (g.value === metin) { return; }
    g.value = metin;
    if (sonra < 0 || document.activeElement !== g) { return; }
    var y = metin.length; for (var n = 0; y > 0 && n < sonra; y--) { if (/\d/.test(metin.charAt(y - 1))) { n++; } }
    try { g.setSelectionRange(y, y); } catch (e) { /* type=tel seçim taşımayabilir */ }
  };
  /* Hata satırı: alanın kendi düğümü (`aria-describedby`), yoksa sayfanın hata sınıfından üretilir ve hata bitince sökülür (f6 düzeni) */
  var TEL_HATA = { 'giris-hata': 'acik', 'alan-hata': 'goster', 'fk-hata': 'show', 'fk-error': null, 'fk-err': null };
  var telHataSinif = function (e) { return (e.className || '').split(/\s+/).filter(function (s) { return Object.prototype.hasOwnProperty.call(TEL_HATA, s); })[0] || null; };
  var telHata = function (g, metin) {
    var sarmal = g.closest('.alan-telefon'), d = null;
    (g.getAttribute('aria-describedby') || '').split(/\s+/).forEach(function (id) { var x = id && document.getElementById(id); if (!d && x && telHataSinif(x)) { d = x; } });
    if (!d && g._dgTelHata && g._dgTelHata.parentNode) { d = g._dgTelHata; }
    if (metin) {
      if (!d) {
        var ornek = (g.closest('form') || document).querySelector('.giris-hata,.alan-hata,.fk-hata,.fk-error,.fk-err');
        d = document.createElement('p'); d.className = (ornek && telHataSinif(ornek)) || (g.classList.contains('alan-girdi') ? 'alan-hata' : 'fk-error');
        d.setAttribute('role', 'alert'); d.setAttribute('data-telefon-hatasi', ''); d.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span></span>';
        (sarmal || g).insertAdjacentElement('afterend', d); g._dgTelHata = d;
      }
      if (d.hasAttribute('hidden') && !d.hasAttribute('data-telefon-hatasi')) { d.setAttribute('data-telefon-gizle', ''); }
      var s = d.querySelector('span'); if (s) { s.textContent = metin; } else { d.textContent = ' ' + metin; }
      if (TEL_HATA[telHataSinif(d)]) { d.classList.add(TEL_HATA[telHataSinif(d)]); }
      d.removeAttribute('hidden'); g.setAttribute('aria-invalid', 'true');
      if (sarmal) { sarmal.classList.add('has-error'); } if (g.classList.contains('alan-girdi')) { g.classList.add('hatali'); }
      return;
    }
    if (d && d.hasAttribute('data-telefon-hatasi')) { d.parentNode.removeChild(d); g._dgTelHata = null; }
    else if (d) { if (TEL_HATA[telHataSinif(d)]) { d.classList.remove(TEL_HATA[telHataSinif(d)]); } if (d.hasAttribute('data-telefon-gizle')) { d.setAttribute('hidden', ''); } }
    g.removeAttribute('aria-invalid'); if (sarmal) { sarmal.classList.remove('has-error'); } g.classList.remove('hatali');
  };
  var telBagla = function (g) {
    if (g.dataset.dgTel || g.dataset.telefonMaskesi) { return; }
    g.dataset.dgTel = '1'; g.dataset.telefonMaskesi = '1';
    var sarmal = g.closest('.alan-telefon'), sifirli = !sarmal, bicimli = g.type === 'tel' || g.hasAttribute('data-tel-mask');
    if (sarmal) {
      [].forEach.call(sarmal.querySelectorAll('.alan-ulke'), function (b) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); b.setAttribute('aria-expanded', 'false'); b.title = TEL_KILIT; });
      var k = sarmal.querySelector('.alan-ulke-katman'); if (k) { k.setAttribute('hidden', ''); }
      var u = sarmal.querySelector('input[type="hidden"][name="telefon_ulke"],input[type="hidden"][name="telefonUlke"],input[type="hidden"][name="ulke"]'); if (u) { u.value = 'TR'; }
    }
    var gizli = sarmal && sarmal.querySelector('input[type="hidden"][name="telefon"]');
    if (!g.getAttribute('inputmode')) { g.setAttribute('inputmode', 'numeric'); }
    if (bicimli && !g.getAttribute('autocomplete')) { g.setAttribute('autocomplete', 'tel-national'); }
    var uygula = function (imlec) {
      var d = telHane(g.value); if (!bicimli) { return; }
      telYaz(g, d ? (sifirli && d.slice(0, 3) !== '444' ? '0' : '') + telBicim(d) : (sifirli && /^\s*0/.test(g.value) ? '0' : ''), imlec);
      if (gizli) { gizli.value = d; }
    };
    var denetle = function (odak) { telHata(g, telMesaj(telHane(g.value), odak)); };
    uygula(false); denetle(false);
    g.addEventListener('input', function () { uygula(true); denetle(false); });
    g.addEventListener('blur', function () { uygula(false); denetle(true); });
    g.addEventListener('change', function () { uygula(false); denetle(false); });
  };
  var telTara = function () { [].forEach.call(document.querySelectorAll(TEL_SECICI), telBagla); };
  /* `interactive` ertelenmiş betiklerden önce gelir: f6 maskesi işaretli alana bağlanmaz */
  document.addEventListener('readystatechange', function () { if (document.readyState !== 'loading') { telTara(); } });
  document.addEventListener('focusin', function (e) { if (e.target && e.target.matches && e.target.matches(TEL_SECICI)) { telBagla(e.target); } }, true);
  /* İletişim sayfası ülke seçicili ortak bileşeni (`GastroTelefonAlani`) kullanıyor: Türkiye seçiliyken biçim ve denetim yukarıdaki kuraldan,
     başka ülkede bileşenin kendi kuralı. Bileşenin dinleyicileri önce bağlanır, bunlar sonra koşar */
  var telAlaniSar = function (asil) {
    return { dgSarili: true, bagla: function (s) {
      var g = s.tel, tr = s.trMi;
      var ic = asil.bagla({ tel: g, trMi: tr, kod: s.kod, hata: function (m) { if (!tr()) { s.hata(m); } } });
      var uygula = function (imlec) { if (tr()) { telYaz(g, telBicim(telHane(g.value)), imlec); } };
      var denetle = function (odak) { if (tr()) { s.hata(telMesaj(telHane(g.value), odak)); } };
      g.addEventListener('input', function () { uygula(true); denetle(false); });
      g.addEventListener('blur', function () { uygula(false); denetle(true); });
      g.addEventListener('change', function () { uygula(false); denetle(false); });
      uygula(false);
      return { uygula: function (k) { ic.uygula(k); uygula(k); }, denetle: function (o) { ic.denetle(o); denetle(o); } };
    } };
  };
  var telAlani;
  try { Object.defineProperty(window, 'GastroTelefonAlani', { configurable: true, get: function () { return telAlani; }, set: function (v) { telAlani = v && v.bagla && !v.dgSarili ? telAlaniSar(v) : v; } }); } catch (e) { /* tanımlanamazsa bileşen kendi kuralıyla kalır */ }
  /* Taşan sekme rayında etkin sekme görünür alana alınır (yalnız rayın kendisi kayar, sayfa kaymaz); sekme değişince de */
  var rayOrtala = function (s) {
    var r = s && s.closest('.sekmeler[data-scroll-fade]'); if (!r || r.scrollWidth <= r.clientWidth) { return; }
    r.scrollLeft += s.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - s.offsetWidth) / 2;
  };
  document.addEventListener('DOMContentLoaded', function () { [].forEach.call(document.querySelectorAll('.sekmeler[data-scroll-fade] .sekme.aktif'), rayOrtala); });
  document.addEventListener('click', function (e) { var s = e.target.closest && e.target.closest('.sekmeler[data-scroll-fade] .sekme'); if (s) { setTimeout(function () { rayOrtala(s); }, 0); } });
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
  /* ==== Dalga 2 mobil · kabuk katmanları (11 Kas) ====
     Arka plan kilidi: Gastro/Gourmet kabuğu `html,body{overflow-x:clip}` kullandığı için gövdeye yazılan `overflow:hidden` görüntü alanına
     geçmiyor; çekmece, süzgeç sayfası, Görüş Bildir ve giriş kapısı açıkken sayfa arkada kayıyordu (390'da 600 → 1794). Kilit köke sınıfla
     (`html.dg-kilit`, kural prototip.css). Çekmece ve iki pencere için odak: açılınca içeri (kapat düğmesi), Tab içeride döner, kapanınca açan
     öğeye döner; kapalı çekmece `inert` (ekran dışındaki bağlar Tab sırasından çıkar). Süzgeç sayfasının odağı kendi denetleyicisinde (`suzgec`).
     Hangi betik açarsa açsın (portal, üye zinciri, dm-gorus) sınıf değişimi izlenir, tek yer */
  var KATMAN = [
    { s: '#drawer', c: 'open', odak: true, ac: '#hamburger' },
    { s: '#lstSide', c: 'open', odak: false },
    { s: '#fbModal', c: 'show', odak: true },
    { s: '#lgGate', c: 'show', odak: true }
  ];
  var katmanAcik = function (k) { var e = document.querySelector(k.s); return !!(e && e.classList.contains(k.c)); };
  var katmanOnce = {};
  var katmanGuncelle = function () {
    var herhangi = false;
    KATMAN.forEach(function (k) {
      var e = document.querySelector(k.s); if (!e) { return; }
      var acik = e.classList.contains(k.c); herhangi = herhangi || acik;
      if (k.s === '#drawer') { if (acik) { e.removeAttribute('inert'); } else { e.setAttribute('inert', ''); } }
      if (!k.odak || !!katmanOnce[k.s] === acik) { return; }
      if (acik) {
        katmanOnce[k.s] = document.activeElement && document.activeElement !== document.body ? document.activeElement : (k.ac && document.querySelector(k.ac)) || true;
        setTimeout(function () { if (!e.contains(document.activeElement)) { var l = odaklanir(e), x = e.querySelector('#drawerClose, #fbClose, [data-lg-close]'); x = x && l.indexOf(x) >= 0 ? x : l[0]; if (x) { x.focus({ preventScroll: true }); } } }, 60);
      } else {
        var don = katmanOnce[k.s]; katmanOnce[k.s] = null;
        if (don && don.focus && document.contains(don) && (e.contains(document.activeElement) || document.activeElement === document.body)) { don.focus({ preventScroll: true }); }
      }
    });
    document.documentElement.classList.toggle('dg-kilit', herhangi);
  };
  document.addEventListener('DOMContentLoaded', function () {
    var gozcu = window.MutationObserver ? new MutationObserver(katmanGuncelle) : null;
    KATMAN.forEach(function (k) { var e = document.querySelector(k.s); if (e && gozcu) { gozcu.observe(e, { attributes: true, attributeFilter: ['class'] }); } });
    katmanGuncelle();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') { return; }
    var k = KATMAN.filter(function (x) { return x.odak && katmanAcik(x); })[0]; if (!k) { return; }
    var p = document.querySelector(k.s), l = odaklanir(p), a = document.activeElement; if (!l.length) { return; }
    if (!p.contains(a)) { e.preventDefault(); l[0].focus(); } else if (e.shiftKey && a === l[0]) { e.preventDefault(); l[l.length - 1].focus(); } else if (!e.shiftKey && a === l[l.length - 1]) { e.preventDefault(); l[0].focus(); }
  });
  /* Yazım kipi (sanal klavye): telefonda ve dokunmatik tablette (≤1024) form alanı odaktayken ya da görsel görüntü alanı klavye yüzünden
     belirgin küçüldüğünde (`visualViewport.height` < `innerHeight` × 0,75) alt çubuk, Mentör düğmesi, Route düğmesi ve başa dön çekilir
     (kural prototip.css). Klavye görüntü alanını daralttığında sabit alt öğeler odaktaki alanı, hata satırını ve açık tarih seçicinin günlerini
     örtüyordu (İletişim, Kayıt, Hesap Ayarları, Çözüm Merkezi). Odak alanlar arasında gezerken titremesin diye çıkış bir tık ertelenir; masaüstü etkilenmez */
  var YAZIM = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=file]):not([type=range]):not([type=color]):not([type=hidden]),textarea,select,[contenteditable="true"],[contenteditable=""]';
  var yazimKapsam = window.matchMedia('(max-width:640px), (pointer:coarse) and (max-width:1024px)');
  /* Açık tarih seçici ve açılır liste içindeki düğmeler de yazım sayılır: gün seçerken Mentör düğmesi geri gelip günleri örtmesin */
  var ACILIR = '.alan-tarih-katman,.acilir-yuzey,[role=listbox],[role=grid]';
  var yazimMi = function (e) { return !!(e && e.matches && ((e.matches(YAZIM) && !e.readOnly && !e.disabled) || e.closest(ACILIR))); };
  var yazimOdak = false, yazimKlavye = false;
  var yazimYaz = function () { document.documentElement.classList.toggle('dg-yazim', yazimKapsam.matches && (yazimOdak || yazimKlavye)); };
  document.addEventListener('focusin', function (e) { if (yazimMi(e.target)) { yazimOdak = true; yazimYaz(); } });
  document.addEventListener('focusout', function () { setTimeout(function () { yazimOdak = yazimMi(document.activeElement); yazimYaz(); }, 120); });
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', function () { yazimKlavye = window.visualViewport.height < window.innerHeight * 0.75; yazimYaz(); }); }
  /* Sayfa sonu: 641–1024'te Dada Route düğmesi (sağ alt, 54px) altbilginin son satırını (imza) örtüyordu (768'de 54×32 kesişim). Başa dön
     düğmesinin kanon kuralı (`site.js` `updateToTop`: sona 120px kala gizlenir) Route düğmesine de uygulanır; sınıf köke, kural prototip.css */
  var sonda = function () { document.documentElement.classList.toggle('dg-sonda', document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 120); };
  window.addEventListener('scroll', sonda, { passive: true }); window.addEventListener('resize', sonda); window.addEventListener('load', sonda);
  /* Harita denetimleri (11 Kas, mobil-rota bulgusu): yüzen düğmeler (başa dön, Route, küçük Mentör) `bottom-clearance.js` ile çerez bandının ya da
     alt çubuğun üstüne kalkınca harita yakınlaştırma ve bilgi düğmelerinin üstüne biniyordu (Mekânlar harita görünümü 390, çerez bandı açık:
     başa dön "−" düğmesini 37×16 örtüyor; 768'de başa dön / Route bilgi düğmesini). Yüzen düğme görünür bir harita denetimiyle kesişirken
     çekilir (`.dg-harita-ortusu`, kural prototip.css); kesişme bitince geri gelir. Ölçüm yalnız sayfada harita denetimi varken koşar */
  var YUZEN = ['.to-top', '.yg-fab', '#dadaMentor'];
  var HARITA_DENETIM = '.maplibregl-ctrl-group,.maplibregl-ctrl-attrib,.leaflet-control-zoom,.leaflet-control-attribution';
  var haritaKare = 0;
  var haritaBak = function () {
    haritaKare = 0;
    var d = [].filter.call(document.querySelectorAll(HARITA_DENETIM), function (c) { var r = c.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && c.offsetParent !== null; });
    YUZEN.forEach(function (s) {
      var e = document.querySelector(s); if (!e) { return; }
      var a = e.getBoundingClientRect(), kes = a.width > 0 && (e.id !== 'dadaMentor' || e.classList.contains('mini')) && d.some(function (c) { var r = c.getBoundingClientRect(); return a.left < r.right + 4 && a.right > r.left - 4 && a.top < r.bottom + 4 && a.bottom > r.top - 4; });
      e.classList.toggle('dg-harita-ortusu', kes);
    });
  };
  var haritaIste = function () { if (!haritaKare && document.querySelector(HARITA_DENETIM)) { haritaKare = window.requestAnimationFrame(haritaBak); } };
  window.addEventListener('scroll', haritaIste, { passive: true }); window.addEventListener('resize', haritaIste);
  document.addEventListener('click', function () { setTimeout(haritaIste, 350); });
  /* Görünüm değişimi, çerez bandının açılıp kapanması ve `--bc-lift` geçişi kaydırmasız olur: harita varken yarım saniyede bir yeniden bakılır */
  setInterval(haritaIste, 500);
  /* ==== Yüzen düğme × reklam çağrısı (reklam-duzeltici, 11 Kas; doğrulama #25) ====
     Harita kuralının eşi, kabukta tek yer: yüzen düğme (başa dön, Route, küçük Mentör) görünür bir reklam bağı ya da düğmesiyle
     (`[data-rk-birim]` içindeki a/button: şerit çağrısı, noktalı kartın ürün satırı, native kart düğmesi) kesişirken çekilir
     (`.dg-reklam-ortusu`, kural prototip.css); kaydırınca kesişme bitince geri gelir. Yalnız reklam önizlemesi açıkken ve sayfada reklam varken koşar */
  var REKLAM_HEDEF = '[data-rk-birim] a[href], [data-rk-birim] button, a[data-rk-birim][href]';
  var reklamKare = 0;
  var reklamBak = function () {
    reklamKare = 0;
    var H = window.innerHeight, acikMi = document.documentElement.classList.contains('rk-acik');
    var d = acikMi ? [].filter.call(document.querySelectorAll(REKLAM_HEDEF), function (c) { if (c.closest('.rk-std-popup')) { return false; } var r = c.getBoundingClientRect(); return r.width > 0 && r.bottom > H - 260 && r.top < H && (!c.checkVisibility || c.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })); }) : [];
    YUZEN.forEach(function (s) {
      var e = document.querySelector(s); if (!e) { return; }
      var a = e.getBoundingClientRect(), kes = a.width > 0 && (e.id !== 'dadaMentor' || e.classList.contains('mini')) && d.some(function (c) { var r = c.getBoundingClientRect(); return a.left < r.right + 4 && a.right > r.left - 4 && a.top < r.bottom + 4 && a.bottom > r.top - 4; });
      e.classList.toggle('dg-reklam-ortusu', kes);
    });
  };
  var reklamIste = function () { if (!reklamKare && (document.querySelector('[data-rk-birim]') || document.querySelector('.dg-reklam-ortusu'))) { reklamKare = window.requestAnimationFrame(reklamBak); } };
  window.addEventListener('scroll', reklamIste, { passive: true }); window.addEventListener('resize', reklamIste);
  document.addEventListener('dg-reklam-degisti', reklamIste);
  document.addEventListener('click', function () { setTimeout(reklamIste, 350); });
  /* Kaydırmasız değişimler (Mentör'ün küçülmesi, şeridin açılıp kapanması, `--bc-lift`): reklamlı sayfada yarım saniyede bir yeniden bakılır */
  setInterval(reklamIste, 500);
  /* ==== /Yüzen düğme × reklam çağrısı ==== */
  /* ==== /Dalga 2 mobil · kabuk katmanları ==== */
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
  /* MD-11 (mekan-detay, 11 Kas): mekân değerlendirmesi tek puan (Gastro formu, canlı `degerlendirmeler.puan`). Eski üç kriterli kayıt
     (lezzet, servis, ambiyans) bozulmadan okunur: ortalaması, bir ondalık. `dgDegPuan.metin` satır özeti: "Puan 4/5" ya da "Puan 4,3/5" */
  window.dgDegPuan = function (k) {
    if (k && +k.puan) { return +k.puan; }
    var l = k ? [k.lezzet, k.servis, k.ambiyans].map(Number).filter(function (n) { return n > 0; }) : [];
    return l.length ? Math.round(l.reduce(function (t, n) { return t + n; }, 0) / l.length * 10) / 10 : 0;
  };
  window.dgDegPuan.metin = function (k) { return 'Puan ' + String(window.dgDegPuan(k)).replace('.', ',') + '/5'; };
  /* Kayıtlı güzergâhlar: Listelerim › Gastronomi Rotalarım ve Dada Route › Güzergâhlarım için TEK depo (H5, 10 Kas).
     Biçim canlı `GET dada-route/api/guzergahlarim` yanıtının `guzergahlar[]` kalemi (dada-route.js `planToRec` bunu okur).
     Örnekler sabit, `ornek:true`; kullanıcının kaydettikleri `dgKayit('rota')`ya yazılır ve örneklerin önünde durur.
     Mekân durakları DG_MEKANLAR kayıtlarından (ad, il, koordinat); mesafe ve süre örnek değerdir */
  var mekanDurak = function (id, ad, il, lat, lng, molaDk) { return { rol: 'venue', mekan_id: id, ad: ad, il: il, lat: lat, lng: lng, mola_dk: molaDk, sapma_dk: null, sapma_km: null, ziyaret: false, id: id }; };
  var ROTA_ORNEK = [
    { id: 'ornek-istanbul-izmir', ornek: true, ad: 'İstanbul – İzmir lezzet rotası', favori: true, yolculuk_tarihi: null, guncellendi: '2026-11-02T10:00:00+03:00',
      kalkis: { ad: 'İstanbul', il: 'İstanbul', lat: 41.0082, lng: 28.9784 }, varis: { ad: 'İzmir', il: 'İzmir', lat: 38.4237, lng: 27.1428 },
      tolerans_dk: 15, tolerans_km: null, mesafe_m: 478000, sure_sn: 19800, geometri: null, alternatif: 0, filtreler: null, saglayici: null,
      duraklar: [mekanDurak('kitap-evi-hotel-restaurant-bursa', 'Kitap Evi Hotel Restaurant', 'Bursa', 40.18496, 29.05808, 60), mekanDurak('esca-restaurant-izmir', 'ESCA Restaurant', 'İzmir', 38.40006, 27.06842, 90)] },
    { id: 'ornek-urla-bag-yolu', ornek: true, ad: 'Urla bağ yolu', favori: false, yolculuk_tarihi: null, guncellendi: '2026-10-26T10:00:00+03:00',
      kalkis: { ad: 'İzmir, Konak', il: 'İzmir', lat: 38.4189, lng: 27.1287 }, varis: { ad: 'Urla', il: 'İzmir', lat: 38.3227, lng: 26.7642 },
      tolerans_dk: 10, tolerans_km: null, mesafe_m: 52000, sure_sn: 3300, geometri: null, alternatif: 0, filtreler: null, saglayici: null,
      duraklar: [mekanDurak('hus-sarapcilik', 'HUS Şarapçılık', 'İzmir', 38.27442, 26.73343, 60), mekanDurak('od-urla', 'OD Urla', 'İzmir', 38.34473, 26.76101, 90), mekanDurak('levan-urla', 'Levan', 'İzmir', 38.30094, 26.75114, 90)] },
    { id: 'ornek-ankara-kapadokya', ornek: true, ad: 'Ankara – Kapadokya hafta sonu', favori: false, yolculuk_tarihi: null, guncellendi: '2026-10-12T10:00:00+03:00',
      kalkis: { ad: 'Ankara', il: 'Ankara', lat: 39.9334, lng: 32.8597 }, varis: { ad: 'Ürgüp', il: 'Nevşehir', lat: 38.6318, lng: 34.9128 },
      tolerans_dk: 15, tolerans_km: null, mesafe_m: 296000, sure_sn: 12300, geometri: null, alternatif: 0, filtreler: null, saglayici: null,
      duraklar: [mekanDurak('alma-table', 'alma table', 'Ankara', 39.81054, 32.70608, 60), mekanDurak('prokopi-restaurant', 'Prokopi Restaurant', 'Nevşehir', 38.63312, 34.90486, 90), mekanDurak('revithia', 'Revithia', 'Nevşehir', 38.63629, 34.90602, 90)] }
  ];
  window.dgRota = {
    ORNEK: ROTA_ORNEK,
    /* Güzergâhlarım listesi: önce kullanıcının kayıtları, sonra örnekler (silinen örnek `rota-silinen`de tutulur) */
    oku: function () {
      var silinen = window.dgKayit.oku('rota-silinen').map(function (k) { return k.id; });
      return window.dgKayit.oku('rota').concat(ROTA_ORNEK).filter(function (r) { return silinen.indexOf(r.id) < 0; });
    },
    kaydet: function (plan) {
      plan = JSON.parse(JSON.stringify(plan)); plan.id = plan.id || ('rota-' + Date.now()); plan.guncellendi = new Date().toISOString();
      if (window.dgKayit.var('rota', plan.id)) { window.dgKayit.sil('rota', plan.id); }
      return window.dgKayit.ekle('rota', plan);
    },
    sil: function (id) { if (window.dgKayit.var('rota', id)) { window.dgKayit.sil('rota', id); } else { window.dgKayit.ekle('rota-silinen', { id: id }); } }
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
  /* Gurme Favorilerim örnekleri (favori ajanı, 11 Kas): eski sabit iki satırın yerine depoda iki `ornek` kayıt, bir kez yazılır; çıkarılan örnek
     geri gelmez. Kimlikler mekân kartı, mekân detayı ve Ne Yenir düğmelerinin yazdığı kimliklerle aynı (`mekan-<slug>`, `tabak-<tabak>`): tek depo */
  (function () {
    var v = hepsi(); if (v.favoriTohum) { return; }
    var l = v.favori = v.favori || [], yok = function (id) { return !l.some(function (k) { return k.id === id; }); };
    if (yok('mekan-mikla')) { l.push({ id: 'mekan-mikla', tur: 'Mekân', ad: 'Mikla', mekan: 'Beyoğlu, İstanbul', ornek: true }); }
    if (yok('tabak-otlu-kuzu')) { l.push({ id: 'tabak-otlu-kuzu', tur: 'Tabak', ad: 'Otlu kuzu', mekan: 'Mikla', ornek: true }); }
    v.favoriTohum = 1; sakla(v);
  })();
  /* Giriş isteyen eylem: misafiri girişe götürür, sonra aynı sayfaya döner */
  window.dgUye = function () { if (uye) { return true; } location.href = kok + 'giris/?donus=' + encodeURIComponent((document.documentElement.dataset.yol || '') + '/' + (location.search.match(/^\?tab=[a-z-]+$/) || [''])[0]); return false; };
  document.addEventListener('DOMContentLoaded', function () {
    if (uye) { document.body.classList.add('is-auth'); document.body.setAttribute('data-roles', 'kullanici'); }
    /* Giriş ekranı `?rol=isletme`: rol seçici o hesapla açılır (e-posta ve şifre örnekle dolu) */
    var rs = ROL_EV[adres.get('rol')] && document.querySelector('#giRol button[data-rol="' + adres.get('rol') + '"]'); if (rs) { rs.click(); }
    /* Hesap menüsündeki İşletmelerim canlıdaki gibi yalnız işletme yetkisinde (demo rolü isletme) görünür */
    if (rolOku() !== 'isletme') { [].forEach.call(document.querySelectorAll('.acct-menu a[data-rol="isletme"],.d-acct-sub a[data-rol="isletme"]'), function (a) { a.parentNode.removeChild(a); }); }
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
      /* Mekân kipinde yer il + ilçeden (il-ilce ajanı, 11 Kas; sitenin "ilçe, il" sırası), etkinlik kipinde serbest metin */
      var il = kip === 'mekan' && f.elements.il ? f.elements.il.value : '', ilce = il && f.elements.ilce ? f.elements.ilce.value : '';
      window.dgKayit.ekle('oneri', { id: id, tur: kip, ad: ad, yer: il ? [ilce, il].filter(Boolean).join(', ') : f.elements.location.value.trim(), il: il, ilce: ilce, gun: kip === 'etkinlik' && f.elements.tarih ? f.elements.tarih.value : '', durum: 'inceleniyor' });
      window.dgPuan.ekle(id, ad + ' önerisi', window.dgPuan.KURAL.oneri);
      f.reset(); var mf = document.getElementById('moFile'); if (mf) { mf.dispatchEvent(new Event('change', { bubbles: true })); } document.getElementById('moClose').click();
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
    /* İl ve ilçe (il-ilce ajanı, 11 Kas; Beyar): mekân kipinde "Şehir / konum" serbest metni yerine aranabilir, bağımlı il + ilçe seçimi
       (`assets/js/il-ilce.js`, liste `il-ilce-veri.js`; ilk açılışta yüklenir). Etkinlik kipinde "Şehir / yer" serbest metin kalır: etkinlikler
       çok ülkeli (`ulke.js`). Gizli kipin alanları `disabled`: zorunlu sayılmaz, gönderilmez. Mekân kipinde Mekân tipi satırda tek kalır, tam genişlik */
    var sehir = mo.querySelector('#moCity'), adres = mo.querySelector('#moIlIlce');
    if (!adres) {
      sehir.closest('.mo-row').insertAdjacentHTML('beforebegin', '<div class="mo-row" id="moIlIlce"><div class="mo-field"><label for="moIl">İl</label><select name="il" id="moIl" required data-ara-secim data-il-secim><option value="">İl seç</option></select></div><div class="mo-field"><label for="moIlce">İlçe</label><select name="ilce" id="moIlce" required data-ara-secim data-ilce-icin="moIl"><option value="">Önce il seç</option></select><p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>İl seçilince açılır.</span></p></div></div>');
      adres = mo.querySelector('#moIlIlce'); ilIlceYukle(adres);
    }
    adres.hidden = etk; [].forEach.call(adres.querySelectorAll('select'), function (s) { s.disabled = etk; });
    sehir.closest('.mo-field').hidden = !etk; sehir.disabled = !etk; sehir.closest('.mo-row').classList.toggle('tek', !etk);
  };
  /* Aranabilir il / ilçe bileşenini (CSS, liste, betik) bir kez yükler, sonra verilen kabı kurar */
  var ilIlceYukle = function (kap) {
    var kur = function () { if (window.dgAraSecim) { window.dgAraSecim.kur(kap); } };
    if (window.dgAraSecim && window.DG_IL_ILCE) { kur(); return; }
    if (!document.querySelector('link[href$="assets/css/il-ilce.css"]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = kok + 'assets/css/il-ilce.css'; document.head.appendChild(l); }
    var yukle = function (y, sonra) { var b = document.createElement('script'); b.src = kok + y; b.onload = sonra; document.head.appendChild(b); };
    yukle('assets/js/il-ilce-veri.js', function () { yukle('assets/js/il-ilce.js', kur); });
  };
  /* Pencere denetleyicisi (K6, 11 Kas): canlı `site.js` `createDialogController`. Açılınca ilk öğeye odak, Esc kapatır, Tab pencerede döner,
     sayfa kaymaz, kapanınca odak açan öğeye döner. Öneri (`#moModal`, Mekân/Etkinlik Öner) ve konum (`#lkModal`) pencereleri kullanır */
  function odaklanir(k) { return [].filter.call(k.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'), function (x) { return x.offsetWidth > 0 || x.offsetHeight > 0; }); };
  var pencere = function (pid, oid) {
    var d = { acik: false }, once = null;
    var tus = function (e) {
      var p = document.getElementById(pid);
      if (e.key === 'Escape') { d.kapa(); return; }
      if (e.key !== 'Tab') { return; }
      var l = odaklanir(p), a = document.activeElement; if (!l.length) { return; }
      if (!p.contains(a)) { e.preventDefault(); l[0].focus(); } else if (e.shiftKey && a === l[0]) { e.preventDefault(); l[l.length - 1].focus(); } else if (!e.shiftKey && a === l[l.length - 1]) { e.preventDefault(); l[0].focus(); }
    };
    d.ac = function () {
      var p = document.getElementById(pid), o = document.getElementById(oid); if (!p || !o) { return; }
      if (!d.acik) { once = document.activeElement; document.addEventListener('keydown', tus); }
      d.acik = true; p.removeAttribute('inert'); p.classList.add('show', 'open'); o.classList.add('show', 'open'); document.documentElement.style.overflow = 'hidden';
      setTimeout(function () { var l = odaklanir(p); if (l[0] && !p.contains(document.activeElement)) { l[0].focus(); } }, 80);
    };
    d.kapa = function () {
      var p = document.getElementById(pid), o = document.getElementById(oid); if (!p || !d.acik) { return; }
      d.acik = false; p.classList.remove('show', 'open'); o.classList.remove('show', 'open'); p.setAttribute('inert', ''); document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', tus); if (once && once.focus && document.contains(once)) { once.focus(); } once = null;
    };
    return d;
  };
  var moP = pencere('moModal', 'moOverlay');
  /* Aynı denetleyici sayfa betiklerine açık (favori ajanı, 11 Kas): Gurme Favorilerim › Favori ekle penceresi `dgDiyalog(pencereId, örtüId)` ile kurulur */
  window.dgDiyalog = pencere;
  /* Fotoğraf seçilince etiket dosya adını gösterir (canlı `site.js` `moFile` dinleyicisi) */
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'moFile') { return; }
    var l = document.getElementById('moUpLabel'), w = document.getElementById('moUp'), f = e.target.files && e.target.files[0];
    if (l) { l.textContent = f ? f.name : (l.getAttribute('data-default') || l.textContent); } if (w) { w.classList.toggle('has-file', !!f); }
  });
  /* Konum (E2, Beyar 11 Kas): canlı `#lkModal` "Neredesin?" ve `site.js` akışı. "Konumumu Kullan" tarayıcı konumunu canlının seçenekleriyle ister;
     başarıda pencere kapanır, canlı başarı metni çıkar. Ret, zaman aşımı ve desteklenmeyen tarayıcı canlı metinleriyle bildirilir, odak Türkiye satırına
     geçer (canlıda da), ülke sessizce Türkiye kalır. Canlı koordinatı kullanmaz (ters kodlama yok); prototip koordinatı yalnız bu tarayıcıda tutar
     (`dg-konum`), ülkeyi `ulke.js` gömülü tablodan bulur, dışarı istek yok. Listeden seçim ve "Şimdi değil" canlıda `/konum/sec`, `/konum/atla` ile
     `dadagourmet_konum` çerezine yazılır; burada aynı değerler (`tr`, `atlandi`) `dg-konum-tercihi`ne. İlk giriş: canlı kabuğun donörü (`gourmet-konum.js`, A5)
     pencereyi ilk ziyarette çerez bandı kapandıktan sonra açar; burada da öyle, tarayıcıda bir kez. İzin zaten verilmişse pencere açılmadan konum alınır.
     `?ulke=` (test) varken izin istenmez */
  var lk = pencere('lkModal', 'lkOverlay');
  var konumAc = function (ac) { if (ac) { lk.ac(); } else { lk.kapa(); } };
  window.dgKonumAc = konumAc;
  var depoOku = function (k) { try { return localStorage.getItem(k); } catch (x) { return null; } };
  var depoYaz = function (k, v) { try { if (v === null) { localStorage.removeItem(k); } else { localStorage.setItem(k, v); } } catch (x) { /* depo kapalı */ } };
  var konumYay = function (d) { document.dispatchEvent(new CustomEvent('dg-konum', { detail: d })); };
  var satirIsaretle = function () { var r = document.getElementById('lkRow-tr'), s = depoOku('dg-konum-tercihi') === 'tr'; if (r) { r.classList.toggle('is-selected', s); r.setAttribute('aria-selected', s ? 'true' : 'false'); } };
  var konumIste = function (sessiz) {
    var m = document.getElementById('lkModal'), metin = function (k) { return m ? m.dataset[k] : ''; };
    if (!navigator.geolocation) { if (!sessiz) { bildir(metin('msgGeoUnsupported'), 'uyari'); } return; }
    navigator.geolocation.getCurrentPosition(function (k) {
      var d = { lat: k.coords.latitude, lng: k.coords.longitude };
      depoYaz('dg-konum', JSON.stringify(d)); depoYaz('dg-konum-tercihi', null); satirIsaretle();
      konumAc(false); bildir(metin('msgGeoSuccess')); konumYay(d);
    }, function (h) {
      if (sessiz) { return; }
      bildir(metin(h.code === 1 ? 'msgGeoDenied' : h.code === 3 ? 'msgGeoTimeout' : 'msgGeoGeneric'), 'uyari');
      var tr = document.getElementById('lkRow-tr'); if (tr) { tr.focus(); }
    }, { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 });
  };
  var konumOlay = function (e) {
    var t = e.target; if (!t.closest) { return false; }
    if (t.closest('[data-location-trigger]')) { e.preventDefault(); konumAc(true); return true; }
    if (t.closest('#lkSkip')) { depoYaz('dg-konum-tercihi', 'atlandi'); satirIsaretle(); konumAc(false); konumYay(null); return true; }
    if (t.closest('#lkClose') || t.id === 'lkOverlay' || t.id === 'lkModal') { konumAc(false); return true; }
    var m = document.getElementById('lkModal');
    if (t.closest('#lkRow-tr')) { depoYaz('dg-konum-tercihi', 'tr'); satirIsaretle(); konumAc(false); bildir('Türkiye ' + m.dataset.msgSelectedSuffix); konumYay(null); return true; }
    if (t.closest('#lkGeoBtn')) { konumIste(false); return true; }
    return false;
  };
  /* Ülke arama (canlı `site.js` `lkSearchInput`): listede yalnız Türkiye var, eşleşmezse canlı boş durum metni */
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'lkSearchInput') { return; }
    var q = e.target.value.toLocaleLowerCase('tr').trim(), r = document.getElementById('lkRow-tr'), b = document.getElementById('lkEmpty'), uyan = !q || !!(r && (r.dataset.search || '').indexOf(q) >= 0);
    if (r) { r.hidden = !uyan; } if (b) { b.hidden = uyan; }
  });
  document.addEventListener('DOMContentLoaded', function () {
    satirIsaretle();
    if (adres.get('ulke') || !document.getElementById('lkModal') || depoOku('dg-konum-ilk') || depoOku('dg-konum-tercihi') || depoOku('dg-konum')) { return; }
    var bant = document.getElementById('cookieBanner'), bitti = false, goruldu = false, zaman = null, gozcu = null;
    var basla = function () {
      if (bitti) { return; } bitti = true; if (gozcu) { gozcu.disconnect(); } clearTimeout(zaman);
      depoYaz('dg-konum-ilk', '1');
      var izin = navigator.permissions && navigator.permissions.query ? navigator.permissions.query({ name: 'geolocation' }) : Promise.reject(new Error('izin sorgusu yok'));
      izin.then(function (s) { if (s.state === 'granted') { konumIste(true); } else { konumAc(true); } }, function () { konumAc(true); });
    };
    if (!bant) { setTimeout(basla, 700); return; }
    /* Çerez bandı açılırsa kapanmasını bekler (donör B13-6: iki pencere üst üste binmez); bant `load`dan sonra 900 ms içinde gelmezse hemen açılır */
    var bak = function () { if (bant.classList.contains('show')) { goruldu = true; clearTimeout(zaman); } else if (goruldu) { setTimeout(basla, 300); } };
    gozcu = new MutationObserver(bak); gozcu.observe(bant, { attributes: true, attributeFilter: ['class'] }); bak();
    if (!goruldu) { var sure = function () { zaman = setTimeout(function () { if (!goruldu) { basla(); } }, 900); }; if (document.readyState === 'complete') { sure(); } else { window.addEventListener('load', sure, { once: true }); } }
  });
  /* Giriş kapısı: canlı `#lgGate` penceresi. Üyede eylem kendi betiğine düşer */
  var kapiAc = function (on, t) {
    var g = document.getElementById('lgGate'), o = document.getElementById('lgOverlay'); if (!g) { return; }
    [g, o].forEach(function (x) { x.classList.toggle('show', on); x.classList.toggle('open', on); });
    if (on) { document.getElementById('lgGateTitle').textContent = t.dataset.lgTitle || g.dataset.defTitle; document.getElementById('lgGateDesc').textContent = t.dataset.lgDesc || g.dataset.defDesc; }
  };
  /* Açık iş B-A1 (12 Kas): kapı Esc ile de kapanır (Favori ekle ve öneri penceresi gibi). Odak tuzağı ve açan öğeye dönüş `KATMAN` gözcüsünde */
  document.addEventListener('keydown', function (e) { var g = document.getElementById('lgGate'); if (e.key === 'Escape' && g && g.classList.contains('show')) { kapiAc(false); } });
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
    if ((oner || etk) && mo) { e.preventDefault(); e.stopImmediatePropagation(); oneriKipi(mo, etk ? 'etkinlik' : 'mekan'); if (!mo.querySelector('.mo-puan')) { mo.querySelector('.mo-foot').insertAdjacentHTML('beforebegin', '<p class="mo-puan"><i class="fa-solid fa-award" aria-hidden="true"></i> Editör onayında +' + window.dgPuan.KURAL.oneri + ' Dada Puan kesinleşir. Onaya kadar bekleyen puan olarak görünür.</p>'); } moP.ac(); return; }
    if (mo && (e.target === moO || e.target === mo || (e.target.closest && e.target.closest('#moModal .fb-close,#moCancel')))) { moP.kapa(); return; }
    if (kapiOlay(e)) { return; }
    var git = e.target.closest && e.target.closest('[data-git]');
    /* Kart içindeki düğme ve bağ kendi işini yapar; kart tıklaması onu ezmez. data-git'i kendisi taşıyan düğme (Giriş Yap, Ara) gezinir */
    var gitIc = git && e.target.closest('a,button');
    if (git && (!gitIc || gitIc === git || !git.contains(gitIc))) { location.href = git.getAttribute('data-git'); }
  }, true);
  /* Sekme şeridi kaydırılabilir: seçili sekme açılışta görünür alana gelir. Sayfa kaymaz, yalnız şerit */
  window.addEventListener('load', function () {
    [].forEach.call(document.querySelectorAll('.sekmeler,.lg-menu'), function (s) {
      var a = s.querySelector('.aktif,.active'); if (!a || s.scrollWidth <= s.clientWidth) { return; }
      s.scrollLeft = a.offsetLeft - s.offsetLeft - (s.clientWidth - a.offsetWidth) / 2;
    });
  });
})();
