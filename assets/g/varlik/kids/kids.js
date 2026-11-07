/* =====================================================================
   DADA GASTRO KIDS — ortak davranış (bağımlılıksız; Laravel uyarlaması T-hesap, 3 Kas 2026)
   Sözleşme (sayfa kolları bunlara güvenebilir):
   · html.kd-js sınıfı · .kd-gir öğeleri görünür alana girince .kd-gorundu alır
   · window.DadaKids = { profil:{evre,c,ay}, EVRE, kova(), profilAyarla(p, secenek), dinle(fn), soz(), yol(), veriAdresi(),
       hesap:{ durum, hazir, istek(), tercih() }, girisKapisi(), dogum() }
   · Kids bağları (/kids…, /<dil>/kids…) profili taşır (?evre=…&c=…&ay=…) — `data-kd-bag-sabit` taşıyan bağ HARİÇ (adresi açık bir
     seçimdir, ör. Gastro ana sayfasındaki Kids bandının dönem çipleri `?evre=<kod>`: profil yokken `evre`yi silip çipi girişe,
     profil varken başka döneme götürüyordu — Beyar 5 Kas, karar 9; ölçüldü: çipe tık → `/kids`)
   · TARAYICI DEPOSU YOK (kural: kullanıcı verisi hesaba). Profil: adres > hesap profili (üye). Tema: adres ?c= > tercih
     (üyede hesap, misafirde sunucu oturumu — PATCH /kids/hesap/tercihler) > profil cinsiyeti. Üyenin profil değişikliği
     PUT /kids/hesap/profil ile hesaba yazılır; misafirin yalnız adreste kalır.
   · Misafirin üyeye özel yazması 401 {giris_url} alır → girisKapisi() Gastro giriş kapısını (#lgGate) açar; kaydedilmiş gibi yapılmaz
   · Metinler #kdSozluk'ten (kabuk · putur · hesap bölümleri); yollar #kdSozluk.yollar'dan (yoksa TR iç yol yedeği); hesap durumu #kdSozluk.durum'dan (yoksa GET /kids/hesap/durum)
   · S11: [data-kd-gecikme] → --kd-gecikme çalışma anında (markup'ta style yok)
   · --kd-ust-bosluk: görünen Gastro katmanının alt kenarı (üstte header altı; ana menü gizliyken siyah üst bandın altı, mobilde 0)
   · --kd-bar-alt (kids.css): Kids barının alt kenarı — sayfa yapışkan barları top: var(--kd-bar-alt)
   · Yapışkan Kids barı: aşağı kayınca html.kd-ust-gizli (yalnız Gastro ana menüsü transform ile gizlenir, siyah bant + bar kalır)
   · Tema rengi kontrolü Kids barında en sağda (Yardım ile); ≤600px Yardım panelinde (DadaKids.temaSecici)
   · Filtre paneli: .kd-filtre-ac[aria-controls=ID] → #ID.kd-filtre, kapat: .kd-filtre__kapat
   ===================================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('kd-js');

  /* ---------- Sözlük (#kdSozluk) ---------- */
  var SOZ = (function () { try { var e = document.getElementById('kdSozluk'); return e ? JSON.parse(e.textContent) || {} : {}; } catch (x) { return {}; } })();
  function soz(bolum, anahtar, yedek, p) {                 // soz('hesap', 'kova_6', '+6 Ay') · yer tutucu :ad
    var b = SOZ[bolum], v = b && Object.prototype.hasOwnProperty.call(b, anahtar) ? b[anahtar] : undefined;
    if (v === undefined || v === null) v = yedek;
    if (typeof v !== 'string') return v;
    return v.replace(/:([a-z_]+)/g, function (m, a) { return p && Object.prototype.hasOwnProperty.call(p, a) ? String(p[a]) : m; });
  }
  var H = function (k, y, p) { return soz('hesap', k, y, p); };
  /* Katalog metinleri T-tarif'in sözlüğünde: kdSozluk.tarif.katalog.* (lang/<dil>/arayuz_kids/tarif.php 'js' > 'katalog') */
  var K = function (k, y, p) { var t = SOZ.tarif && SOZ.tarif.katalog; var v = t && typeof t[k] === 'string' ? t[k] : y; return v.replace(/:([a-z_]+)/g, function (m, a) { return p && Object.prototype.hasOwnProperty.call(p, a) ? String(p[a]) : m; }); };
  var AYAR = SOZ.ayar || {};
  var SAYFA = SOZ.sayfa || {};                             // eski biçim {durum, yollar}; güncel biçim kök anahtarlar
  var YOLLAR = SOZ.yollar || SAYFA.yollar || null;

  var EVRE = {
    'hamilelik': { ad: H('evre_hamilelik', 'Hamilelik & Lohusalık'), renk: 'pembe', ikon: 'hamile', kova: null },
    '0-6-ay': { ad: H('evre_0_6_ay', '0–6 Ay'), renk: 'mavi', ikon: 'biberon', kova: null },
    '6-8-ay': { ad: H('evre_6_8_ay', '6–8 Ay'), renk: 'seftali', ikon: 'kasik', kova: 6 },
    '9-12-ay': { ad: H('evre_9_12_ay', '9–12 Ay'), renk: 'mint', ikon: 'tabak-bolmeli', kova: 9 },
    '1-3-yas': { ad: H('evre_1_3_yas', '1–3 Yaş'), renk: 'sari', ikon: 'yurumeye-baslayan', kova: 12 }
  };
  var CINSIYET = { kiz: H('cinsiyet_kiz', 'Kız'), erkek: H('cinsiyet_erkek', 'Erkek'), belirtilmedi: H('cinsiyet_belirtilmedi', 'Belirtilmedi'), bilinmiyor: H('cinsiyet_bilinmiyor', 'Henüz bilmiyoruz') };
  var KOVALAR = [6, 8, 9, 12, 18, 24];
  var KOVA_AD = { 6: H('kova_6', '+6 Ay'), 8: H('kova_8', '+8 Ay'), 9: H('kova_9', '+9 Ay'), 12: H('kova_12', '+12 Ay'), 18: H('kova_18', '+18 Ay'), 24: H('kova_24', '2–3 Yaş') };

  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var normal = function (s) { return String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/â/g, 'a'); };

  /* ---------- Yollar: sunucunun dil uyarlı yol sözlüğü (#kdSozluk.sayfa.yollar) > Kids barı bağları > TR iç yol ----------
     yol('donemler.detay', '6-8-ay') · yol('dolap') · yol('gastro.tarifler')
     TARİF DETAYI BURADA YOK (lead kararı): bağ veri ucundaki tarifin dil çözülmüş `url`inden kurulur; url yoksa bağ kurulmaz. */
  var YEDEK_YOL = { 'hub': '/kids', 'tarifler.dizin': '/kids/tarifler', 'dolap': '/kids/bebek-dolabi',
    'donemler.dizin': '/kids/donemler', 'donemler.detay': '/kids/donemler/{}', 'kesim': '/kids/guvenli-kesim', 'mevsim': '/kids/mevsim-takvimi',
    'rehber.dizin': '/kids/rehber', 'rehber.detay': '/kids/rehber/{}', 'araclar.dizin': '/kids/araclar', 'araclar.hazir-mi': '/kids/araclar/ek-gidaya-hazir-mi',
    'araclar.ogun-planlayici': '/kids/araclar/ogun-planlayici', 'gastro.tarifler': '/tarifler', 'hesabim.kids': '/hesabim/kids' };
  function yol(ad, param) {
    var y = YOLLAR ? YOLLAR[ad] : undefined;
    if (y === undefined) y = YEDEK_YOL[ad];
    if (!y) return null;                                    // rota kayıtlı değil (sunucu sözlüğünde null): bağ basılmaz
    return y.indexOf('{}') > -1 ? y.replace('{}', encodeURIComponent(param == null ? '' : param)) : y;
  }
  var VERI_AD = { 'kids-tarifler': 'tarifler', 'bebek-dolabi': 'riskli' };
  function veriAdresi(ad) { return '/kids/veri/' + (VERI_AD[ad] || ad) + '.json?dil=' + encodeURIComponent(document.documentElement.lang || 'tr'); }
  function kidsYoluMu(yolAdi) { return /^\/(?:[a-z]{2}\/)?kids(?:\/|$)/.test(yolAdi) && !/^\/(?:[a-z]{2}\/)?kids\/(?:hesap|veri)\//.test(yolAdi); }

  /* ---------- Hesap: durum + uçlar ---------- */
  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
  function girisKapisi(girisUrl, baslik, aciklama) {      // Gastro #lgGate kalıbı (app.js $t ile aynı sözleşme); yoksa giriş adresine git
    var g = document.getElementById('lgGate'), donus = location.pathname + location.search;
    if (!g) { location.href = girisUrl || ('/giris?return=' + encodeURIComponent(donus)); return; }
    var o = document.getElementById('lgOverlay'), b = g.querySelector('[data-lg-title]'), a = g.querySelector('[data-lg-desc]');
    if (b) b.textContent = baslik || g.getAttribute('data-def-title') || b.textContent;
    if (a) a.textContent = aciklama || g.getAttribute('data-def-desc') || a.textContent;
    var gu = null; try { gu = girisUrl ? new URL(girisUrl, location.origin) : null; } catch (e) { gu = null; }
    $$('[data-lg-login], [data-lg-register]', g).forEach(function (x) {
      var u = new URL(x.getAttribute('data-lg-login') !== null && gu ? gu.pathname : x.getAttribute('href'), location.origin);
      u.searchParams.set('return', donus); x.setAttribute('href', u.pathname + u.search);
    });
    g.classList.add('show'); if (o) o.classList.add('show');
    document.body.style.overflow = 'hidden';
    var l = g.querySelector('[data-lg-login]'); if (l) l.focus();
  }
  function istek(yontem, adres, govde) {                    // → Promise<{ok, kod, veri}>; 401'de giriş kapısı açılır
    var oz = { method: yontem, credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } };
    if (yontem !== 'GET') { oz.headers['X-CSRF-TOKEN'] = csrf(); }
    if (govde !== undefined) { oz.headers['Content-Type'] = 'application/json'; oz.body = JSON.stringify(govde); }
    return fetch(adres, oz).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (v) {
        if (r.status === 401) girisKapisi(v.giris_url || (hesap.durum && hesap.durum.giris_url));
        return { ok: r.ok, kod: r.status, veri: v };
      });
    }, function () { return { ok: false, kod: 0, veri: {} }; });
  }
  var hesap = { durum: SOZ.durum || SAYFA.durum || null, istek: istek };
  hesap.hazir = hesap.durum ? Promise.resolve(hesap.durum)
    : istek('GET', '/kids/hesap/durum').then(function (c) { if (c.ok) hesap.durum = c.veri; return hesap.durum; });
  hesap.girisli = function () { return !!(hesap.durum && hesap.durum.girisli); };
  /* PATCH /kids/hesap/tercihler (misafirde sunucu oturumu, S12). Yalnız GERÇEKTEN değişen anahtar gider (sunucunun bastığı
     #kdSozluk.durum.tercihler ile karşılaştırılır); değişen yoksa istek YOK. Yerel kopya yalnız başarıda güncellenir: 429 / ağ
     hatasında sessizce geçer (kullanıcıya hata yok, "kaydedildi" yok) ve bir sonraki eylem aynı değeri yeniden dener. */
  hesap.tercih = function (v) {
    var t = (hesap.durum && hesap.durum.tercihler) || null, fark = {};
    Object.keys(v).forEach(function (k) { if (!t || t[k] !== v[k]) fark[k] = v[k]; });
    if (!Object.keys(fark).length) return Promise.resolve({ ok: true, kod: 0, veri: { tercihler: t } });
    return istek('PATCH', '/kids/hesap/tercihler', fark).then(function (c) {
      if (c.ok && hesap.durum && c.veri && c.veri.tercihler) hesap.durum.tercihler = c.veri.tercihler;
      return c;
    }, function () { return { ok: false, kod: 0, veri: {} }; });
  };

  /* ---------- Profil (adres; üyede hesap) ---------- */
  var q = new URLSearchParams(location.search);
  var profil = {
    evre: EVRE[q.get('evre')] ? q.get('evre') : null,
    c: CINSIYET[q.get('c')] ? q.get('c') : null,
    ay: /^\d{1,2}$/.test(q.get('ay') || '') ? parseInt(q.get('ay'), 10) : null
  };
  if (profil.c === 'bilinmiyor' && profil.evre !== 'hamilelik') profil.c = 'belirtilmedi';
  var adresteProfil = q.has('evre') || q.has('ay'), adresteC = q.has('c') && !!profil.c;
  var dinleyiciler = [];
  var dogumKaydi = null;                                    // {y, m, mod} — üyede hesaptan; misafirde yalnız bu sayfada

  function evreAydan(ay) { return ay < 6 ? '0-6-ay' : ay < 9 ? '6-8-ay' : ay < 12 ? '9-12-ay' : '1-3-yas'; }
  function kova() {
    if (profil.ay !== null) { if (profil.ay < 6) return null; var k = null; KOVALAR.forEach(function (x) { if (x <= profil.ay) k = x; }); return k; }
    return profil.evre ? EVRE[profil.evre].kova : null;
  }
  function temaUygula() {
    var t = (profil.c === 'kiz' || profil.c === 'erkek') ? profil.c : null;
    if (t) document.documentElement.setAttribute('data-kd-tema', t); else document.documentElement.removeAttribute('data-kd-tema');
  }
  function profilParam(p) {
    if (profil.evre) p.set('evre', profil.evre); else p.delete('evre');
    if (profil.c && profil.c !== 'belirtilmedi') p.set('c', profil.c); else p.delete('c');
    if (profil.ay !== null) p.set('ay', String(profil.ay)); else p.delete('ay');
    return p;
  }
  function baglariGuncelle() {
    $$('a[href]').forEach(function (a) {
      var ham = a.getAttribute('href');
      if (a.hasAttribute('data-kd-bag-sabit')) return;
      if (!/^kids/.test(ham) && !(ham.charAt(0) === '/' && kidsYoluMu(ham.split(/[?#]/)[0]))) return;
      var parca = ham.split('#'), yol0 = parca[0].split('?');
      var s = profilParam(new URLSearchParams(yol0[1] || '')).toString();
      a.setAttribute('href', yol0[0] + (s ? '?' + s : '') + (parca[1] ? '#' + parca[1] : ''));
    });
  }
  function adresiGuncelle(ek) {
    var p = profilParam(new URLSearchParams(location.search));
    if (ek) Object.keys(ek).forEach(function (k) { if (ek[k] === null || ek[k] === '') p.delete(k); else p.set(k, ek[k]); });
    var s = p.toString();
    try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); } catch (e) { /* file:// vb. */ }
  }
  /* Üyenin profil değişikliği hesaba (kısmi PUT, 400 ms birleştirme). Misafir: yalnız adres — hiçbir şey "kaydedildi" denmez. */
  var bekleyen = null, kayitZaman = 0, kayitSoz = null, kayitCoz = null;
  function hesabaYaz(yeni) {                               // → Promise<bool> (true: hesaba yazıldı; misafirde false)
    if (!hesap.girisli()) return Promise.resolve(false);
    bekleyen = bekleyen || {};
    if ('evre' in yeni) bekleyen.evre_kod = yeni.evre || null;
    if ('c' in yeni) bekleyen.cinsiyet = yeni.c || 'belirtilmedi';
    if (yeni.dogum && yeni.dogum.y && yeni.dogum.m) bekleyen.dogum_yil_ay = yeni.dogum.y + '-' + ('0' + yeni.dogum.m).slice(-2);
    else if ('ay' in yeni && yeni.ay !== null && yeni.ay !== undefined) { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - yeni.ay); bekleyen.dogum_yil_ay = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
    clearTimeout(kayitZaman);
    if (!kayitSoz) kayitSoz = new Promise(function (coz) { kayitCoz = coz; });
    var soz0 = kayitSoz;
    kayitZaman = setTimeout(function () {
      var g = bekleyen, coz = kayitCoz; bekleyen = null; kayitSoz = null; kayitCoz = null;
      istek('PUT', '/kids/hesap/profil', g).then(function (c) { if (c.ok && hesap.durum) hesap.durum.profil = c.veri.profil; coz(!!c.ok); });
    }, 400);
    return soz0;
  }
  function profilAyarla(yeni, secenek) {
    secenek = secenek || {};
    if (yeni.dogum !== undefined) dogumKaydi = yeni.dogum;
    Object.keys(yeni).forEach(function (k) { if (k !== 'dogum') profil[k] = yeni[k]; });
    if ('c' in yeni && !secenek.yerel) temaYaz(yeni.c === 'kiz' || yeni.c === 'erkek' ? yeni.c : 'notr');
    var kayit = secenek.yerel ? Promise.resolve(false) : hesabaYaz(yeni);
    temaUygula(); adresiGuncelle(); baglariGuncelle();
    dinleyiciler.forEach(function (fn) { try { fn(profil); } catch (e) {} });
    return kayit;                                            // Promise<bool>: "kaydedildi" yalnız true iken denir
  }
  /* Tema tercihi: adresteki c önceliklidir; yoksa tercih (hesap/sunucu oturumu), o da yoksa üyenin profil cinsiyeti */
  function temaYaz(t) { hesap.tercih({ tema: t }); }        // aynı değerse istek gitmez (hesap.tercih farkı süzer)
  function durumuUygula(d) {
    if (!d) return;
    var p = d.profil, yeni = {};
    if (p) {
      if (p.dogum_yil_ay) { var yy = p.dogum_yil_ay.split('-'); dogumKaydi = { y: +yy[0], m: +yy[1], mod: p.evre_kod === 'hamilelik' ? 'gebelik' : 'dogum' }; }
      if (!adresteProfil) { if (p.evre_kod && EVRE[p.evre_kod]) yeni.evre = p.evre_kod; if (p.ay !== null && p.ay !== undefined) yeni.ay = p.ay; }
    }
    if (!adresteC) {
      var t = d.tercihler && d.tercihler.tema;
      var c = t === 'kiz' || t === 'erkek' ? t : t === 'notr' ? 'belirtilmedi' : (p && (p.cinsiyet === 'kiz' || p.cinsiyet === 'erkek') ? p.cinsiyet : null);
      if (c && c !== profil.c) yeni.c = c;
    }
    /* Misafirken "Hesabına kaydet" deyip giriş yapan üye (?kd_kaydet=1): adresteki profil hesaba bir kez yazılır */
    if (d.girisli && q.get('kd_kaydet') === '1') {
      var kay = {}; if (profil.evre) kay.evre = profil.evre; if (profil.c) kay.c = profil.c; if (profil.ay !== null) kay.ay = profil.ay;
      hesabaYaz(kay); adresiGuncelle({ kd_kaydet: null });
    }
    if (Object.keys(yeni).length) profilAyarla(yeni, { yerel: true });
  }
  /* Adresteki ?c= yalnız BU sayfayı boyar; açılışta tercih YAZILMAZ (yazma yalnız kullanıcının tema/profil eylemiyle). */
  temaUygula();
  hesap.hazir.then(durumuUygula);
  function dogum() {                                        // {y, m, mod} | null — hesaptaki doğum ayı, yoksa ?ay='dan yaklaşık
    if (dogumKaydi) return dogumKaydi;
    if (profil.ay === null) return null;
    var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - profil.ay);
    return { y: d.getFullYear(), m: d.getMonth() + 1, mod: 'dogum' };
  }
  /* Tema seçici (Ek revize E1): Kids barında en sağda, Yardım ile sağ grup. ≤600px'te bardan gizli;
     aynı kontrolün ikinci kopyası Yardım panelinin altında (yardim.js DadaKids.temaSecici() ile ister). Kopyalar eşzamanlı.
     Tema bir TERCİHTİR: profil cinsiyetini hesaba yazmaz (adreste ?c= ve tercih olarak taşınır). */
  function temaSecici(sinif) {
    var kutu = document.createElement('div'); kutu.className = 'kd-tema-sec ' + (sinif || ''); kutu.setAttribute('role', 'group'); kutu.setAttribute('aria-label', soz('kabuk', 'tema_rengi', 'Tema rengi'));
    [['notr', soz('kabuk', 'tema_notr', 'Nötr tema')], ['kiz', soz('kabuk', 'tema_pembe', 'Pembe tema')], ['erkek', soz('kabuk', 'tema_mavi', 'Mavi tema')]].forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.tema = x[0]; b.setAttribute('aria-label', x[1]); b.title = x[1];
      b.innerHTML = '<span aria-hidden="true"></span>'; kutu.appendChild(b);
    });
    var guncelle = function () { var t = (profil.c === 'kiz' || profil.c === 'erkek') ? profil.c : 'notr'; $$('button', kutu).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.tema === t)); }); };
    kutu.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var t = b.dataset.tema; temaYaz(t);
      profilAyarla({ c: t === 'notr' ? 'belirtilmedi' : t }, { yerel: true });   // dinleyiciler tüm kopyaları günceller
    });
    dinleyiciler.push(guncelle); guncelle();
    return kutu;
  }
  function temaSeciciKur() {
    var wrap = $('.kd-ust .wrap'); if (!wrap || $('.kd-tema-sec--bar')) return;
    var y = $('.kd-yardim-ac', wrap);
    wrap.insertBefore(temaSecici('kd-tema-sec--bar'), y || null);
  }
  window.DadaKids = { profil: profil, EVRE: EVRE, KOVA_AD: KOVA_AD, kova: kova, profilAyarla: profilAyarla, dinle: function (fn) { dinleyiciler.push(fn); }, normal: normal, adresiGuncelle: adresiGuncelle, temaSecici: temaSecici,
    soz: soz, ayar: AYAR, yol: yol, veriAdresi: veriAdresi, hesap: hesap, girisKapisi: girisKapisi, dogum: dogum, evreAydan: evreAydan, kidsYoluMu: kidsYoluMu };

  /* ---------- Kart girişi animasyonu ---------- */
  function girisKur() {
    var ogeler = $$('.kd-gir');
    if (!ogeler.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { ogeler.forEach(function (o) { o.classList.add('kd-gorundu'); }); return; }
    var io = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add('kd-gorundu'); io.unobserve(g.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .05 });
    ogeler.forEach(function (o) { io.observe(o); });
    // güvenlik ağı: 2 sn sonra hâlâ görünmeyen ekrandakiler açılsın
    setTimeout(function () { ogeler.forEach(function (o) { var r = o.getBoundingClientRect(); if (r.top < innerHeight) o.classList.add('kd-gorundu'); }); }, 2000);
  }

  /* ---------- Yapışkan tek katman: Gastro header'ı + Kids barı ----------
     Üstte: Gastro header'ı ve bar görünür. Aşağı kaydırınca Gastro header'ı (ve masaüstü üst bandı) yalnız
     sınıf + transform ile yukarı gizlenir, bar top=0'a yapışır, mini kilit görünür. Yukarı kaydırınca geri gelir.
     Mega menü / çekmece açıkken ya da header içinde odak varken gizlenmez. Gastro DOM'una öğe eklenmez. */
  function yapiskanKur() {
    var kok = document.documentElement, bar = $('.kd-ust');
    var gastro = $$('header.header, .topbar, .ust-bant').filter(function (e, i, d) { return d.indexOf(e) === i; });
    var kidsSayfa = document.body.classList.contains('pg-kids') && bar;
    var alt = 0, bant = 0, gizli = false, sonY = Math.max(0, scrollY), birikim = 0, bekliyor = false;
    function olc() {                                   // layout alt kenarı: transform'dan bağımsız (top + yükseklik)
      alt = 0; bant = 0;
      gastro.forEach(function (el) {
        var cs = getComputedStyle(el); if (cs.display === 'none' || !el.offsetHeight) return;
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          var a = (parseFloat(cs.top) || 0) + el.offsetHeight; alt = Math.max(alt, a);
          if (!el.matches('header.header')) bant = Math.max(bant, a);   // R3: üst siyah bant gizlenmez
        }
      });
      bant = Math.round(bant);
      alt = Math.round(alt); kok.style.setProperty('--kd-gastro-alt', alt + 'px'); uygula();
    }
    function uygula() { kok.style.setProperty('--kd-ust-bosluk', (gizli ? bant : alt) + 'px'); kok.classList.toggle('kd-ust-gizli', gizli); }
    function acikMi() { return !!document.querySelector('.has-mega:hover, .has-mega:focus-within, .drawer.open, header.header:focus-within, .topbar:focus-within'); }
    function ayarla(yeni) { if (yeni !== gizli) { gizli = yeni; birikim = 0; uygula(); } }
    function kaydir() {
      bekliyor = false;
      var y = Math.max(0, scrollY), dy = y - sonY; sonY = y;
      if (!kidsSayfa) return;
      if (y <= alt + 24 || acikMi()) { ayarla(false); return; }
      birikim = (dy > 0) === (birikim > 0) ? birikim + dy : dy;  // yön değişince sıfırdan say: titreme yok
      if (birikim > 10) ayarla(true); else if (birikim < -10) ayarla(false);
    }
    addEventListener('scroll', function () { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kaydir); } }, { passive: true });
    addEventListener('resize', olc);
    gastro.forEach(function (el) { el.addEventListener('focusin', function () { ayarla(false); }); });
    olc(); setTimeout(olc, 400);
    if (kidsSayfa) kaydir();
  }

  /* Bar mobilde yatay kayar: aktif kalem görünür alana (sayfa kaydırılmadan) */
  function menuAktifKur() {
    var m = $('.kd-ust__menu'); if (!m) return;
    function tasma() {                                 // kenar solması yalnız o yönde kaydırılacak içerik varken
      var sag = m.scrollLeft + m.clientWidth < m.scrollWidth - 2, sol = m.scrollLeft > 2;
      m.classList.toggle('kd-tasma-sag', sag); m.classList.toggle('kd-tasma-sol', sol);
    }
    m.addEventListener('scroll', tasma, { passive: true }); addEventListener('resize', tasma);
    var lg = $('.kd-ust__logo'); if (lg) lg.addEventListener('transitionend', tasma);
    new MutationObserver(tasma).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    tasma();
    var a = $('[aria-current="page"]:not(.kd-ust__ev)', m); if (!a) return;
    function goster() {
      var mr = m.getBoundingClientRect(), ar = a.getBoundingClientRect();
      if (ar.left < mr.left + 8 || ar.right > mr.right - 8) m.scrollLeft += (ar.left + ar.width / 2) - (mr.left + mr.width / 2);
    }
    goster(); addEventListener('resize', goster);
    m.addEventListener('transitionend', goster);
    var bar = $('.kd-ust__logo'); if (bar) bar.addEventListener('transitionend', function (e) { if (e.propertyName === 'max-width') goster(); });
  }

  /* ---------- Filtre paneli (mobil alt sayfa) ---------- */
  function filtrePaneliKur() {
    $$('.kd-filtre-ac[aria-controls]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls')); if (!panel) return;
      var perde = document.createElement('div'); perde.className = 'kd-perde'; document.body.appendChild(perde);
      function ac() { panel.classList.add('kd-acik'); perde.classList.add('kd-acik'); btn.setAttribute('aria-expanded', 'true'); var i = panel.querySelector('input, button'); if (i) i.focus(); }
      function kapat() { panel.classList.remove('kd-acik'); perde.classList.remove('kd-acik'); btn.setAttribute('aria-expanded', 'false'); }
      btn.addEventListener('click', ac); perde.addEventListener('click', kapat);
      $$('.kd-filtre__kapat', panel).forEach(function (k) { k.addEventListener('click', kapat); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') kapat(); });
    });
  }

  /* ---------- Kids Tarifleri: yaş şeridi + filtreler + arama + sıralama + boş durum ---------- */
  function katalogKur() {
    var iz = $('#kdTarifIzgara'); if (!iz) return;
    var kartlar = $$('.kd-tarif', iz), ilkSira = kartlar.slice();
    var form = $('#kdTarifFiltre'), ara = $('#kdTarifAra'), sirala = $('#kdSirala');
    var bas = q.get('yas');
    var d = { yas: KOVALAR.indexOf(+bas) > -1 ? +bas : (bas === 'tumu' ? 'tumu' : (kova() || 'tumu')), q: q.get('q') || '', kivam: [], icermez: [], ogun: [], sure: null };
    if (ara) ara.value = d.q;

    /* Patron 6 Kas (madde 7): yaş seçiliyken varsayılan sıra "Yaşa en yakın"; kullanıcı elle seçtiyse dokunulmaz. */
    var siraElle = false;
    function siraVarsayilan() { if (sirala && !siraElle) sirala.value = d.yas === 'tumu' ? 'onerilen' : 'yas'; }

    function aramaMetni(k) {               // başlık + olgular + kıvam + malzeme anahtarları (düğme metni hariç)
      if (k._kdAra === undefined) k._kdAra = normal($$('h3, .kd-tarif__olgu, .kd-tarif__meta, .kd-kivam', k).map(function (e) { return e.textContent; }).join(' ') + ' ' + (k.dataset.malzeme || ''));
      return k._kdAra;
    }
    function oku() {
      var f = function (n) { return $$('input[name="' + n + '"]:checked', form).map(function (i) { return i.value; }); };
      d.kivam = f('kivam'); d.icermez = f('icermez'); d.ogun = f('ogun');
      var s = $('input[name="sure"]:checked', form); d.sure = s && s.value ? +s.value : null;
    }
    function uyar(k, haric) {
      var ek = window.KdKatalogEk; if (ek && ek.filtre && !ek.filtre(k)) return false;   // kanca: kiler.js (Bebek Dolabı)
      if (haric !== 'yas' && d.yas !== 'tumu' && +k.dataset.yas > d.yas) return false;
      if (d.kivam.length && d.kivam.indexOf(k.dataset.kivam) < 0) return false;
      var al = k.dataset.alerjen ? k.dataset.alerjen.split(' ') : [];
      for (var i = 0; i < d.icermez.length; i++) {
        var x = d.icermez[i];
        if (al.indexOf(x) > -1) return false;
      }
      if (d.ogun.length) { var og = k.dataset.ogun.split(' '); if (!d.ogun.some(function (o) { return og.indexOf(o) > -1; })) return false; }
      if (d.sure && +k.dataset.sure > d.sure) return false;
      if (d.q) { var n = normal(d.q); if (normal(k.dataset.ad).indexOf(n) < 0 && aramaMetni(k).indexOf(n) < 0) return false; }
      return true;
    }
    function ciz() {
      var n = 0;
      kartlar.forEach(function (k) { var u = uyar(k); k.hidden = !u; if (u) { n++; k.classList.add('kd-gorundu'); } });
      var s = ilkSira.slice(), mod = sirala ? sirala.value : 'onerilen';
      if (mod === 'hizli') s.sort(function (a, b) { return a.dataset.sure - b.dataset.sure; });
      if (mod === 'yas') s.sort(function (a, b) { return (b.dataset.yas - a.dataset.yas) || (a.dataset.sira - b.dataset.sira); });
      if (mod === 'az') s.sort(function (a, b) { return a.dataset.ad.localeCompare(b.dataset.ad, document.documentElement.lang || 'tr'); });
      var ek2 = window.KdKatalogEk; if (ek2 && ek2.sira) s.sort(ek2.sira);               // kanca: kiler.js sıralaması
      s.forEach(function (k) { iz.appendChild(k); });
      $$('.kd-yas-chip').forEach(function (c) {
        var v = c.dataset.yas, sayi = kartlar.filter(function (k) { return uyar(k, 'yas') && (v === 'tumu' || +k.dataset.yas <= +v); }).length;
        var sm = c.querySelector('small'); if (sm) sm.textContent = sayi;
        c.setAttribute('aria-checked', String(String(d.yas) === v));
      });
      var sayac = $('#kdSonucSayi'); if (sayac) sayac.textContent = K('sayi', ':n tarif', { n: n }) + (d.yas === 'tumu' ? '' : K('kova', ' · :kova ve öncesi', { kova: KOVA_AD[d.yas] }));
      var fs = d.kivam.length + d.icermez.length + d.ogun.length + (d.sure ? 1 : 0);
      $$('[data-kd-filtre-sayi]').forEach(function (b) { b.textContent = fs ? '(' + fs + ')' : ''; });
      bos(n);
      adresiGuncelle({ yas: d.yas === 'tumu' ? null : String(d.yas), q: d.q || null });
    }
    window.DadaKids.katalogYenile = function () { oku(); ciz(); };                      // kanca: kiler.js dışarıdan yeniden çizer
    function bos(n) {
      var b = $('#kdBos'); if (!b) return; b.hidden = n > 0; if (n > 0) return;
      var on = $('.kd-bos__oneriler', b); on.innerHTML = '';
      var ekle = function (m, fn) { var x = document.createElement('button'); x.type = 'button'; x.className = 'kd-chip kd-chip--dolu'; x.textContent = m; x.addEventListener('click', fn); on.appendChild(x); };
      if (d.q) ekle(K('arama_temizle', '":q" aramasını temizle', { q: d.q }), function () { d.q = ''; ara.value = ''; ciz(); });
      if (d.yas !== 'tumu') {
        var sonraki = KOVALAR.filter(function (x) { return x > d.yas; }).filter(function (x) { var e = d.yas; d.yas = x; var v = kartlar.some(function (k) { return uyar(k); }); d.yas = e; return v; })[0];
        if (sonraki) ekle(K('kova_goster', ':kova tariflerini de göster', { kova: KOVA_AD[sonraki] }), function () { d.yas = sonraki; ciz(); });
      }
      $$('input:checked', form).forEach(function (i) { if (!i.value) return; ekle(K('filtre_kaldir', '":ad" filtresini kaldır', { ad: i.dataset.ad }), function () { i.checked = false; oku(); ciz(); }); });
    }
    $$('.kd-yas-chip').forEach(function (c) {
      c.addEventListener('click', function () { d.yas = c.dataset.yas === 'tumu' ? 'tumu' : +c.dataset.yas; siraVarsayilan(); ciz(); });
      c.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var cs = $$('.kd-yas-chip'), i = cs.indexOf(c), n = cs[(i + (e.key === 'ArrowRight' ? 1 : cs.length - 1)) % cs.length];
        n.focus(); n.click(); e.preventDefault();
      });
    });
    if (form) form.addEventListener('change', function () { oku(); ciz(); });
    if (ara) { var z; ara.addEventListener('input', function () { clearTimeout(z); z = setTimeout(function () { d.q = ara.value.trim(); ciz(); }, 120); }); }
    if (sirala) sirala.addEventListener('change', function () { siraElle = true; ciz(); });
    $$('[data-kd-temizle]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); $$('input', form).forEach(function (i) { i.checked = i.value === '' && i.name === 'sure'; }); d.yas = 'tumu'; d.q = ''; if (ara) ara.value = ''; oku(); ciz(); }); });
    siraVarsayilan(); oku(); ciz();
    var serit = $('#kdYasSerit'), sec = $('.kd-yas-chip[aria-checked="true"]');
    if (serit && sec) serit.scrollLeft = Math.max(0, sec.offsetLeft - serit.offsetLeft - 16);
  }

  /* ---------- Tarif listesi: seçili yaşın rehber şeridi (tarif/parcalar/yas-rehber) ---------- */
  function yasRehberKur() {
    var gruplar = $$('[data-kd-yas-rehber]'), serit = $('#kdYasSerit');
    if (!gruplar.length || !serit) return;
    function esitle() {
      var c = serit.querySelector('.kd-yas-chip[aria-checked="true"]'), y = c ? c.getAttribute('data-yas') : '';
      gruplar.forEach(function (g) { g.hidden = (' ' + g.getAttribute('data-kd-yas-rehber') + ' ').indexOf(' ' + y + ' ') < 0; });
    }
    new MutationObserver(esitle).observe(serit, { subtree: true, attributes: true, attributeFilter: ['aria-checked'] });
    esitle();
  }

  /* ---------- Tarif detayı: ?t=<slug> ---------- */
  function detayKur() {
    var hepsi = $$('.kd-detay[data-slug]'); if (!hepsi.length) return;
    var slug = q.get('t'), hedef = hepsi.filter(function (a) { return a.dataset.slug === slug; })[0] || hepsi[0];
    hepsi.forEach(function (a) { a.hidden = a !== hedef; });
    if (hedef.dataset.baslik) document.title = hedef.dataset.baslik;
    var bulunamadi = $('#kdDetayYok'); if (bulunamadi) bulunamadi.hidden = !slug || hedef.dataset.slug === slug;
    $$('.kd-gir', hedef).forEach(function (o) { o.classList.add('kd-gorundu'); });
  }

  function videoKur() {
    var vs = $$('video.kd-video'); if (!vs.length) return;
    var mq = matchMedia('(prefers-reduced-motion: reduce)');
    var uygula = function () { vs.forEach(function (v) { if (mq.matches) { v.removeAttribute('autoplay'); v.pause(); try { v.currentTime = 0; } catch (e) {} } else { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); } }); };
    uygula(); if (mq.addEventListener) mq.addEventListener('change', uygula);
  }
  function kademeKur() {
    var gruplar = new Map();
    /* S11: sunucu kademeyi [data-kd-gecikme="120ms"] ile basar (satır içi style yasak); değer CSSOM'a burada yazılır */
    $$('[data-kd-gecikme]').forEach(function (o) { var v = o.getAttribute('data-kd-gecikme'); if (/^\d+(?:\.\d+)?m?s$/.test(v)) o.style.setProperty('--kd-gecikme', v); });
    /* T-hub (/tarifler alt kategori ve Kids küçük resimleri): [data-kd-bg="<yol>"] → background-image çalışma anında. Yalnız bu sitenin
       göreli yolu ya da aynı köken kabul edilir; tırnak/ters bölü/parantez taşıyan değer yazılmaz. */
    $$('[data-kd-bg]').forEach(function (o) {
      var v = o.getAttribute('data-kd-bg') || ''; if (!v || /["'\\()\s]/.test(v)) return;
      try { var u = new URL(v, location.href); if (u.origin !== location.origin) return; o.style.backgroundImage = 'url("' + u.pathname + u.search + '")'; } catch (e) { /* geçersiz adres */ }
    });
    $$('.kd-gir').forEach(function (o) { if (o.style.getPropertyValue('--kd-gecikme')) return; var p = o.parentElement; var n = gruplar.get(p) || 0; gruplar.set(p, n + 1); o.style.setProperty('--kd-gecikme', Math.min(n, 6) * 60 + 'ms'); });
  }

  /* SSS — tek-açık akordeon (src/kids/sss.mjs): varsayılan hepsi kapalı; yenisi açılınca açık olan kapanır; #<soru-id> ile açılır */
  function sssKur() {
    var gruplar = document.querySelectorAll('[data-kd-sss]'); if (!gruplar.length) return;
    function ayarla(oge, acik) {
      var d = oge.querySelector('.kd-sss__dugme'); if (!d) return;
      d.setAttribute('aria-expanded', String(acik));
      if (acik) oge.setAttribute('data-acik', ''); else oge.removeAttribute('data-acik');
    }
    function ac(oge, kaydir) {
      var grup = oge.closest('[data-kd-sss]');
      grup.querySelectorAll('.kd-sss__oge[data-acik]').forEach(function (x) { if (x !== oge) ayarla(x, false); });
      ayarla(oge, true);
      if (kaydir) { try { oge.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (e) { oge.scrollIntoView(); } }
    }
    gruplar.forEach(function (g) {
      g.querySelectorAll('.kd-sss__oge').forEach(function (o) { ayarla(o, false); });
      g.addEventListener('click', function (e) {
        var d = e.target.closest('.kd-sss__dugme'); if (!d || !g.contains(d)) return;
        var oge = d.closest('.kd-sss__oge');
        if (oge.hasAttribute('data-acik')) ayarla(oge, false); else ac(oge, false);
      });
    });
    function hashAc() {
      var h = decodeURIComponent((location.hash || '').slice(1)); if (!h) return;
      var el = document.getElementById(h); if (!el) return;
      var oge = el.closest('.kd-sss__oge'); if (oge) ac(oge, true);
    }
    hashAc(); window.addEventListener('hashchange', hashAc);
  }

  /* S1 profil çipleri (<x-kids.profil-cipleri>, donör v1 #kdProfil): seçim profile; "Henüz bilmiyoruz" yalnız hamilelikte.
     Misafirin "Hesabına kaydet"i: adrese kd_kaydet=1 eklenir, giriş kapısı açılır; girişten dönünce durumuUygula hesaba yazar. */
  function profilCipleriKur() {
    var kutular = $$('[data-kd-profil-cip]'); if (!kutular.length) return;
    function esle() {
      kutular.forEach(function (k) {
        var bil = $('[data-kd-bilinmiyor]', k), hamile = profil.evre === 'hamilelik';
        if (bil) bil.hidden = !hamile;
        var c = profil.c || 'belirtilmedi'; if (c === 'bilinmiyor' && !hamile) c = 'belirtilmedi';
        var r = $('input[name="c"][value="' + c + '"]', k); if (r && !r.checked) r.checked = true;
      });
    }
    kutular.forEach(function (k) {
      k.addEventListener('change', function (e) {
        var t = e.target; if (!t || t.name !== 'c' || !t.checked) return;
        e.stopPropagation();                                 // hub formunun kendi change dinleyicisi evre içindir
        profilAyarla({ c: t.value });
      });
    });
    dinleyiciler.push(esle); esle();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-kd-hesaba-kaydet]'); if (!b) return;
    e.preventDefault();
    adresiGuncelle({ kd_kaydet: '1' });
    girisKapisi(hesap.durum && hesap.durum.giris_url);
    adresiGuncelle({ kd_kaydet: null });
  });

  function basla() { yasRehberKur(); profilCipleriKur(); temaSeciciKur(); sssKur(); videoKur(); kademeKur(); detayKur(); girisKur(); yapiskanKur(); menuAktifKur(); filtrePaneliKur(); katalogKur(); baglariGuncelle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
