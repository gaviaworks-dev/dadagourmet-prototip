/* Etkinlikler reklam çizicileri (reklam-liste, 11 Kas · AŞAMA 2). Yalnız reklam önizlemesi açıkken yüklenir (reklam.js, sayfa satırı
   `betik: "etkinlikler"`). İşaretler _src/sayfalar/etkinlikler/index.html: EL-HERO (h1'in ardı), EL-FILTER (filtre panelinde Tarih
   grubunun ardı), EL-T1 ve EL-FEED (liste çubuğunun altı; FEED `data-rk-liste="#evGrid"`). Bütçe, öncelik, marka tavanı, native yerleri
   (üst, her 2 satır, alt) ve mobil %30 çekirdekte; burada yalnız çizim:
   - EL-T1 yalnız liste görünümünde (boş sonuçta da) basılır; takvim ve harita görünümünde saklanır (Mekânlar ML-T1 kalıbı).
   - EL-FEED native etkinlik kartı (koçan masaüstünde görselin altında; telefonda yatay kartın görseli dar, koçan kart dibinde ayrı şerit) = organik `disc-card ev-card` anatomisi + kanon sponsor işaretleri (B.susle) ve iki modül biçimi:
     BİLET SPONSORU (kreatif `bilet`): görselin altında bilet kocanı "Biletler <logo> ile" + ortak indirim kodu
       (gerçek hayatta Ticketmaster / Biletix sponsorlu satış ortaklığı, presale partner kodu).
     TAKVİME EKLE (kreatif `takvim`): kart dibinde menü; .ics dosyası istemcide üretilir (Blob, istek yok) ya da Google Takvim
       şablon bağı (yeni sekme). Saatler İstanbul saati (UTC+3, yaz saati yok) → .ics'te UTC.
   Ek stil: assets/css/reklam/ek/liste.css (Etkinlikler, Gurme Lezzetler, Şehir Rehberleri, Mekân Bul ortak). */
(function () {
  'use strict';
  var R = window.dgReklam, B = window.dgReklamBilesen;
  if (!R || !B) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };
  var kac = B.kac;
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var bag = B.bag; /* reklam-duzeltici: tek kaynak bilesen.js (iç hedef, tam adres ya da marka sitesi) */
  if (!document.querySelector('link[data-rk-ek="liste"]')) {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = KOK + 'assets/css/reklam/ek/liste.css'; l.setAttribute('data-rk-ek', 'liste'); document.head.appendChild(l);
  }

  /* ── EL-T1: liste üstü 728×90; takvim/harita görünümünde saklı ── */
  R.ciz('EL-T1', function (k, o) {
    var t = document.createElement('template');
    t.innerHTML = B.t1(k, o);
    var el = t.content.firstElementChild, grid = document.getElementById('evGrid'), bos = document.getElementById('evBos');
    if (!grid || !bos) { return el; }
    var esle = function () { el.hidden = grid.hidden && bos.hidden; };
    var g = new MutationObserver(esle);
    [grid, bos].forEach(function (n) { g.observe(n, { attributes: true, attributeFilter: ['hidden'] }); });
    o.temizle(function () { g.disconnect(); });
    esle();
    return el;
  });

  /* ── Takvim: .ics (RFC 5545) ve Google Takvim şablonu ── */
  var iki = function (n) { return (n < 10 ? '0' : '') + n; };
  function an(s) { /* "2026-11-14T14:00" İstanbul saati → Date (UTC+3) */
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(s);
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 3, +m[5]));
  }
  var utc = function (d) { return d.getUTCFullYear() + iki(d.getUTCMonth() + 1) + iki(d.getUTCDate()) + 'T' + iki(d.getUTCHours()) + iki(d.getUTCMinutes()) + '00Z'; };
  var gun = function (s) { return s.replace(/-/g, ''); };
  var sonrakiGun = function (s) { var d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); };
  var tumGun = function (t) { return t.bas.indexOf('T') < 0; };
  var yerel = function (s) { return s.replace(/[-:]/g, '') + '00'; };
  var icsKac = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); };
  function katla(satir) { /* 75 sekizli sınırı (UTF-8): devam satırı tek boşlukla başlar */
    var enc = new TextEncoder(), cik = [], cur = '', n = 0;
    Array.from(satir).forEach(function (c) {
      var b = enc.encode(c).length;
      if (n + b > (cik.length ? 74 : 75)) { cik.push(cur); cur = ''; n = 0; }
      cur += c; n += b;
    });
    cik.push(cur);
    return cik.join('\r\n ');
  }
  function aciklama(k) {
    var m = B.marka(k), b = k.bilet;
    return k.metin + (b ? ' Biletler ' + m.ad + ' ile; ' + b.kime + ' ' + b.indirim + ' indirim, kod ' + b.kod + '.' : '') + ' Sponsorlu · ' + m.ad + ' · Dada Gourmet';
  }
  function ics(k) {
    var t = k.takvim, s = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dada Gourmet//Etkinlik//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:' + (k.id || 'etkinlik') + '-' + gun(t.bas.slice(0, 10)) + '@dadagourmet.com', 'DTSTAMP:' + utc(new Date())
    ];
    if (tumGun(t)) { s.push('DTSTART;VALUE=DATE:' + gun(t.bas), 'DTEND;VALUE=DATE:' + sonrakiGun(t.bit || t.bas)); } else { s.push('DTSTART:' + utc(an(t.bas)), 'DTEND:' + utc(an(t.bit))); }
    if (t.tekrar) { s.push('RRULE:' + t.tekrar); }
    s.push('SUMMARY:' + icsKac(k.baslik), 'LOCATION:' + icsKac(t.yer || k.konum || ''), 'DESCRIPTION:' + icsKac(aciklama(k)));
    if (k.hedef) { s.push('URL:' + new URL(url(k.hedef), location.href).href); }
    s.push('END:VEVENT', 'END:VCALENDAR');
    return s.map(katla).join('\r\n') + '\r\n';
  }
  function google(k) {
    var t = k.takvim;
    var tarih = tumGun(t) ? gun(t.bas) + '/' + sonrakiGun(t.bit || t.bas) : yerel(t.bas) + '/' + yerel(t.bit);
    var q = 'action=TEMPLATE&text=' + encodeURIComponent(k.baslik) + '&dates=' + tarih + '&details=' + encodeURIComponent(aciklama(k)) +
      '&location=' + encodeURIComponent(t.yer || k.konum || '') + (tumGun(t) ? '' : '&ctz=Europe%2FIstanbul') + (t.tekrar ? '&recur=' + encodeURIComponent('RRULE:' + t.tekrar) : '');
    return 'https://calendar.google.com/calendar/render?' + q;
  }
  var dosyaAdi = function (k) { return (k.id || 'etkinlik').replace(/^el-feed-/, 'dada-gourmet-') + '.ics'; };

  /* Kreatifler kimlikle bulunur (menü tıklaması karttan kreatife döner) */
  var havuz = function () { return [].concat(R.kreatif('EL-FEED') || []); };
  var bulK = function (id) { return havuz().filter(function (x) { return x.id === id; })[0]; };

  /* ── EL-FEED: native etkinlik kartı ── */
  var sayac = 0;
  R.ciz('EL-FEED', function (k, o) {
    var m = B.marka(k), mid = 'rkTakvim' + (++sayac);
    var arka = k.gorsel ? ' style="background-image:url(\'' + url(k.gorsel) + '\')"' : '';
    var kocan = k.bilet ? '<div class="rk-bilet" aria-label="Biletler ' + kac(m.ad) + ' ile · ' + kac(k.bilet.kime) + ' ' + kac(k.bilet.indirim) + ' indirim, kod ' + kac(k.bilet.kod) + '">' +
      '<span class="rk-bilet-sol"><span class="rk-bilet-on">Biletler</span><span class="rk-bilet-logo">' + B.logo(k) + '</span><span class="rk-bilet-on">ile</span></span>' +
      '<span class="rk-bilet-sag"><b>' + kac(k.bilet.indirim) + ' indirim</b><span>Kod <code>' + kac(k.bilet.kod) + '</code></span></span></div>' : '';
    var takvim = k.takvim ? '<div class="rk-takvim"><button class="btn btn-sm btn-ghost rk-takvim-ac" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="' + mid + '">' + ik('fa-calendar-plus') + ' Takvime ekle</button>' +
      '<div class="rk-takvim-menu" id="' + mid + '" role="menu" aria-label="Takvime ekle" hidden>' +
      '<button type="button" role="menuitem" data-rk-ics>' + ik('fa-file-arrow-down') + ' <span>Apple, Outlook <small>.ics dosyası</small></span></button>' +
      '<a role="menuitem" href="' + kac(google(k)) + '" target="_blank" rel="noopener sponsored" data-rk-google>' + ik('fa-calendar-days') + ' <span>Google Takvim <small>yeni sekmede</small></span></a></div></div>' : '<a class="btn btn-sm btn-ghost" ' + bag(k) + '>Detayı incele</a>';
    var h = '<article class="disc-card ev-card rk-ev' + (k.bilet ? ' rk-ev-bilet' : '') + '" data-type="sponsorlu">' +
      '<a class="disc-card-link" ' + bag(k) + '><div class="disc-fig"><div class="bg"' + arka + '></div>' +
      (k.kategori ? '<div class="disc-badges"><span class="disc-badge" title="' + kac(k.kategori) + '">' + ik('fa-star') + ' ' + kac(k.kategori) + '</span></div>' : '') + kocan + '</div>' +
      '<span class="disc-cat">' + kac(k.kategori || '') + '</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
      '<div class="disc-meta ev-meta"><span class="disc-when ev-when">' + ik('fa-calendar') + ' <span class="dw-txt">' + kac(k.tarih || '') + '</span></span><span class="ev-meta-sep" aria-hidden="true">·</span>' +
      '<span class="disc-where">' + ik('fa-location-dot') + ' <span class="dw-txt">' + kac(k.konum || '') + '</span></span></div></a>' +
      (kocan ? kocan.replace('class="rk-bilet"', 'class="rk-bilet rk-bilet-alt"') : '') + '<div class="disc-card-foot">' + takvim + '<a class="btn btn-sm btn-primary" ' + (k.bilet ? bag({ marka: k.marka, hedef: k.bilet.hedef }) : bag(k)) + '>' + kac(k.cta || 'İncele') + (k.bilet ? ' ' + ik('fa-ticket') : '') + '</a></div></article>';
    var t = document.createElement('template');
    t.innerHTML = B.susle(h, k, o, '.disc-card-foot');
    return t.content.firstElementChild;
  });

  /* ── reklam-marka (11 Kas): BİLET SPONSORU ORGANİK KARTTA. Kaydın kendisi (Salon du Chocolat) listede organik basılıysa tekrar kuralı
     native'i düşürür; sponsorluk organik kartın gövdesiyle alt düğmeleri arasına "Sponsorlu · Bilet ortağı" etiketli koçan olarak girer
     (çekirdek reklam.js `KOD:organik`). Organik gövde, sıra ve sayı değişmez; koçan biletin gerçek satış sayfasına gider (yeni sekme) ── */
  R.ciz('EL-FEED:organik', function (k, o) {
    var m = B.marka(k), b = k.bilet;
    if (!b || !o.kart) { return null; }
    var t = document.createElement('template');
    t.innerHTML = '<div class="rk-bilet-ek ' + m.renkSinif + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '"' + (k.id ? ' data-rk-kreatif="' + kac(k.id) + '"' : '') + '>' +
      '<span class="rk-bilet-ek-etiket">Sponsorlu · Bilet ortağı</span>' +
      '<a class="rk-bilet" ' + bag({ marka: k.marka, hedef: b.hedef }) + ' aria-label="Sponsorlu · Biletler ' + kac(m.ad) + ' ile · ' + kac(b.kime) + ' ' + kac(b.indirim) + ' indirim, kod ' + kac(b.kod) + '">' +
      '<span class="rk-bilet-sol"><span class="rk-bilet-on">Biletler</span><span class="rk-bilet-logo">' + B.logo(k) + '</span><span class="rk-bilet-on">ile</span></span>' +
      '<span class="rk-bilet-sag"><b>' + kac(b.indirim) + ' indirim</b><span>Kod <code>' + kac(b.kod) + '</code></span></span></a></div>';
    var el = t.content.firstElementChild, ayak = o.kart.querySelector(':scope > .disc-card-foot');
    if (ayak) { o.kart.insertBefore(el, ayak); } else { o.kart.appendChild(el); }
    return el;
  });

  /* ── Takvim menüsü: aç/kapat, dışarı tık ve Escape kapatır (odak düğmeye döner), .ics indirme ── */
  var acik = null;
  function kapat(odak) {
    if (!acik) { return; }
    var d = acik.querySelector('.rk-takvim-ac');
    acik.querySelector('.rk-takvim-menu').hidden = true;
    d.setAttribute('aria-expanded', 'false');
    acik.classList.remove('rk-takvim-acik');
    if (odak) { d.focus(); }
    acik = null;
  }
  function indir(k) {
    var blob = new Blob([ics(k)], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = dosyaAdi(k); a.hidden = true;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    if (window.prototipBildir) { window.prototipBildir('Takvim dosyası indirildi: ' + a.download); }
  }
  var tik = function (e) {
    var ac = e.target.closest && e.target.closest('.rk-takvim-ac');
    if (ac) {
      e.preventDefault(); e.stopPropagation();
      var kap = ac.closest('.rk-takvim');
      if (acik === kap) { kapat(false); return; }
      kapat(false);
      kap.querySelector('.rk-takvim-menu').hidden = false; ac.setAttribute('aria-expanded', 'true'); kap.classList.add('rk-takvim-acik'); acik = kap;
      var ilk = kap.querySelector('[role="menuitem"]'); if (ilk) { ilk.focus(); }
      return;
    }
    var ic = e.target.closest && e.target.closest('[data-rk-ics]');
    if (ic) {
      e.preventDefault(); e.stopPropagation();
      var kart = ic.closest('[data-rk-kreatif]'), k = kart && bulK(kart.getAttribute('data-rk-kreatif'));
      if (k) { indir(k); }
      kapat(true);
      return;
    }
    if (e.target.closest && e.target.closest('[data-rk-google]')) { e.stopPropagation(); setTimeout(function () { kapat(false); }, 0); return; }
    if (acik && !acik.contains(e.target)) { kapat(false); }
  };
  var tus = function (e) {
    if (!acik) { return; }
    if (e.key === 'Escape') { e.preventDefault(); kapat(true); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var ogeler = [].slice.call(acik.querySelectorAll('[role="menuitem"]')), i = ogeler.indexOf(document.activeElement);
      e.preventDefault();
      ogeler[(i + (e.key === 'ArrowDown' ? 1 : -1) + ogeler.length) % ogeler.length].focus();
    }
  };
  document.addEventListener('click', tik, true);
  document.addEventListener('keydown', tus);
  /* Kapanınca (anahtar kapalı) dinleyiciler çekilir: çekirdeğin temizlik kancası çizicinin `o.temizle`'si; sayfa betiği bir kez yüklenir,
     bu yüzden dinleyiciler reklam kapalıyken de bağlı kalır ama kart olmadığından iş yapmaz */
  window.dgReklamTakvim = { ics: ics, google: google };
})();
