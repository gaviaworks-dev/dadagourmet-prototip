/* Hesabım sekme geçişi (H8, Beyar 11 Kas): sekme rayındaki bağa basınca yalnız rayın altındaki içerik değişir.
   - Her sekme yine ayrı derlenmiş sayfa ve düz bağ; betik yoksa ya da bir şey ters giderse tam sayfa gezinmesi olur.
   - İçerik hedef sekmenin derlenmiş sayfasından gelir (XHR; `prototip.js` yerel GET `fetch`ini sahte yanıtla karşılıyor).
     Sekme yalnız ona yönelince (fare, odak, dokunuş) önden alınır; açılışta komşu sekmeler indirilmez (Beyar kararı A5, 12 Kas).
   - Adres `pushState` ile sekmenin gerçek yoluna geçer; geri/ileri `popstate` ile aynı yoldan döner.
   - Sayfa betikleri `dg:sekme` olayıyla yeni içeriği yeniden kurar (`panel.js`, `listeler.js`, `uye-alan.js`).
   Kapsam: `nav.sekmeler[data-sekme-gecis]` rayı (Gurme Panelim, Listelerim, Etkinliklerim) ve rayın hemen ardındaki
   `.modul-govde`. Yalnız rayın kök yolu altındaki sekmeler yerinde açılır (Etkinliklerim'den Gurme Panelim'e giden sekme
   normal gezinir); bulunulan adres raydaki bir sekme değilse (liste detayı) hiçbir şey yapılmaz. */
(function () {
  'use strict';
  if (!window.history || !history.pushState || !window.XMLHttpRequest || !window.URL) { return; }
  var nav = document.querySelector('nav.sekmeler[data-sekme-gecis]'); if (!nav) { return; }
  var ray = nav.closest('.pf-tabbar') || nav.parentNode;
  var alan = ray.nextElementSibling;
  if (!alan || !alan.classList.contains('modul-govde')) { return; }

  var ilkAdres = location.href.split('#')[0];
  /* Bağların `href` özelliği belge temeline göre çözülür (aşağıdaki `<base>` notu); yol karşılaştırması o mutlak adresle */
  var yolu = function (u) { return new URL(u, document.baseURI).pathname.replace(/index\.html$/, ''); };
  var bagYolu = function (a) { return yolu(a.href); };
  var sekmeler = [].slice.call(nav.querySelectorAll('a.sekme[href]'));
  if (!sekmeler.length) { return; }
  var taban = bagYolu(sekmeler[0]);
  var yerinde = sekmeler.filter(function (a) { return new URL(a.href).origin === location.origin && bagYolu(a).indexOf(taban) === 0; });
  var bul = function (yol) { return yerinde.filter(function (a) { return bagYolu(a) === yol; })[0] || null; };
  var gosterilen = yolu(location.href);
  if (!bul(gosterilen)) { return; }

  /* ---- İçerik kaynağı: derlenmiş sayfa, yol başına bir kez alınır ---- */
  var depo = {};
  var al = function (adres) {
    var yol = yolu(adres);
    if (!depo[yol]) {
      depo[yol] = new Promise(function (tamam, red) {
        var x = new XMLHttpRequest();
        x.open('GET', new URL(adres, document.baseURI).href.split('#')[0]);
        x.responseType = 'document';
        x.onload = function () { if (x.status >= 200 && x.status < 300 && x.responseXML) { tamam(x.responseXML); } else { red(new Error('durum ' + x.status)); } };
        x.onerror = x.ontimeout = function () { red(new Error('ağ')); };
        x.timeout = 8000;
        x.send();
      });
      depo[yol].catch(function () { delete depo[yol]; });
    }
    return depo[yol];
  };

  /* Alınan sayfanın göreli adresleri (`{{kok}}` o sayfanın derinliğine göre basılı) mutlak adrese çevrilir */
  var GORELI = /^(?![a-z][a-z0-9+.-]*:|\/\/|#|\{)/i;
  var mutlak = function (kapsam, kaynak) {
    var duzelt = function (el, ad) {
      var v = el.getAttribute(ad); if (v === null || !GORELI.test(v)) { return; }
      try { el.setAttribute(ad, new URL(v, kaynak).href); } catch (e) { /* bozuk adres olduğu gibi kalır */ }
    };
    [].forEach.call(kapsam.querySelectorAll('[href],[src],[action],[poster],[srcset],[style*="url("]'), function (el) {
      duzelt(el, 'href'); duzelt(el, 'src'); duzelt(el, 'action'); duzelt(el, 'poster');
      var ss = el.getAttribute('srcset');
      if (ss) { el.setAttribute('srcset', ss.split(',').map(function (p) { var q = p.trim().split(/\s+/); if (GORELI.test(q[0])) { q[0] = new URL(q[0], kaynak).href; } return q.join(' '); }).join(', ')); }
      var st = el.getAttribute('style');
      if (st && st.indexOf('url(') > -1) { el.setAttribute('style', st.replace(/url\((['"]?)([^'")]+)\1\)/g, function (m, t, u) { return GORELI.test(u) ? 'url(' + t + new URL(u, kaynak).href + t + ')' : m; })); }
    });
  };

  /* Kabuk ve sayfa betikleri ilk adresin derinliğine göre göreli adres (`data-kok`, `{{kok}}`) kullanır. Adres başka derinliğe
     geçince (ör. `gurme-panelim/` → `gurme-panelim/ziyaret-gecmisim/`) bunlar yanlış yere çözülmesin diye belge temeli
     baştan ilk adrese sabitlenir (`<base>`; ilk adresle aynı olduğu için açılışta hiçbir bağ değişmez). `popstate`te adres
     betikten önce değiştiği için temel geçişte değil açılışta konur */
  var temel = document.createElement('base');
  temel.setAttribute('href', ilkAdres); temel.setAttribute('data-sekme-gecis', '');
  document.head.insertBefore(temel, document.head.firstChild);
  /* Adres ilk adresten farklıyken yalnız `#` ile başlayan bağ ilk sekmeye gitmesin: aynı belgede kalır */
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || location.href.split('#')[0] === ilkAdres) { return; }
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) { return; }
    e.preventDefault();
    var h = a.getAttribute('href'); if (h.length > 1) { location.hash = h; }
  });

  /* ---- Ray: etkin sekme işareti ve kayan rayda görünür alana alma ---- */
  var isaretle = function (yeniNav) {
    var yeni = yeniNav ? [].slice.call(yeniNav.querySelectorAll('a.sekme[href]')) : [];
    sekmeler.forEach(function (a, i) {
      var y = yeni[i], on = bagYolu(a) === gosterilen;
      a.classList.toggle('aktif', on);
      if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
      if (y && y.textContent.replace(/\s+/g, ' ') !== a.textContent.replace(/\s+/g, ' ')) { a.innerHTML = y.innerHTML; } /* sekmede sayaç varsa güncel */
    });
    var s = bul(gosterilen);
    if (s && nav.scrollWidth > nav.clientWidth) { nav.scrollLeft += s.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - s.offsetWidth) / 2; }
  };

  /* Ekran okuyucu yeni bölümün başlığını duyar; odak basılan sekmede kalır */
  var durum = document.createElement('p');
  durum.className = 'sr-only'; durum.setAttribute('role', 'status'); durum.setAttribute('aria-live', 'polite');
  ray.appendChild(durum);

  /* İçerik ray altına kaymışsa ya da ray görünür alanın üstünde kaldıysa ray görünür alana gelir; yoksa kaydırma aynen kalır */
  var ustBosluk = function () {
    var h = document.querySelector('.kabuk-basi,header.header'); if (!h) { return 0; }
    var p = getComputedStyle(h).position; return p === 'fixed' || p === 'sticky' ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  };
  var gorunurYap = function () {
    var r = ray.getBoundingClientRect(), g = alan.getBoundingClientRect(), u = ustBosluk();
    if (g.top < r.bottom - 1) { window.scrollBy(0, g.top - r.bottom); }
    else if (r.top < u) { window.scrollBy(0, r.top - u); }
  };

  var sira = 0;
  var gec = function (adres, itme) {
    var no = ++sira, t0 = (window.performance && performance.now()) || 0;
    var hedefYol = yolu(adres);
    alan.setAttribute('aria-busy', 'true'); /* içerik gelene kadar eski içerik yerinde durur; iskelet yok */
    return al(adres).then(function (doc) {
      if (no !== sira) { return; } /* arada başka sekmeye basıldı */
      alan.removeAttribute('aria-busy');
      var yNav = doc.querySelector('nav.sekmeler[data-sekme-gecis]');
      var yRay = yNav && (yNav.closest('.pf-tabbar') || yNav.parentNode);
      var yAlan = yRay && yRay.nextElementSibling;
      if (!yNav || yNav.getAttribute('aria-label') !== nav.getAttribute('aria-label') || !yAlan || !yAlan.classList.contains('modul-govde')) { throw new Error('ray yok'); }
      var hedefAdres = new URL(adres, document.baseURI).href;
      var icerik = document.importNode(yAlan, true);
      mutlak(icerik, hedefAdres);
      /* Sayfa dışı pencereler (ör. Yeni liste) bu belgede yoksa eklenir */
      var ekler = [];
      [].forEach.call(doc.querySelectorAll('body > .fb-modal[id], body > [data-dm-ortu]'), function (el) {
        if (el.id ? document.getElementById(el.id) : document.querySelector('[data-dm-ortu]')) { return; }
        var k = document.importNode(el, true); mutlak(k, hedefAdres); ekler.push(k);
      });

      var y = window.scrollY;
      if (itme) { history.pushState({ dgSekme: hedefYol }, '', hedefAdres); }
      gosterilen = hedefYol;
      while (alan.firstChild) { alan.removeChild(alan.firstChild); }
      while (icerik.firstChild) { alan.appendChild(icerik.firstChild); }
      ekler.forEach(function (k) { document.body.appendChild(k); });
      document.title = doc.title;
      var dy = doc.documentElement.getAttribute('data-yol'); if (dy) { document.documentElement.setAttribute('data-yol', dy); }
      isaretle(yNav);
      document.dispatchEvent(new CustomEvent('dg:sekme', { detail: { alan: alan, yol: hedefYol, sure: Math.round(((window.performance && performance.now()) || 0) - t0) } }));
      if (Math.abs(window.scrollY - y) > 1) { window.scrollTo({ top: y, behavior: 'instant' }); }
      gorunurYap();
      var b = alan.querySelector('h2'); durum.textContent = b ? b.textContent.trim() : document.title;
      /* Geri dönüş için ayrıldığımız sekme de hazır olsun */
      yerinde.forEach(function (a) { if (bagYolu(a) !== hedefYol) { al(a.href); } });
    });
  };

  nav.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
    var a = e.target.closest('a.sekme[href]'); if (!a || yerinde.indexOf(a) < 0 || (a.target && a.target !== '_self')) { return; }
    e.preventDefault();
    var adres = a.href; /* prototip.js depo kapalıyken `?auth=1` ekledi; o da korunur */
    if (bagYolu(a) === gosterilen) { return; }
    gec(adres, true).catch(function () { location.href = adres; });
  });

  window.addEventListener('popstate', function () {
    var yol = yolu(location.href); if (yol === gosterilen) { return; }
    var a = bul(yol);
    if (!a) { location.reload(); return; }
    gec(location.href, false).catch(function () { location.reload(); });
  });

  /* Önden alma: yalnız sekmeye yönelince (A5, 12 Kas: açılışta bütün komşuları boşta almak ~67 KB gzip ek yük getiriyordu) */
  var yonel = function (e) { var a = e.target.closest && e.target.closest('a.sekme[href]'); if (a && yerinde.indexOf(a) > -1) { al(a.href); } };
  nav.addEventListener('pointerover', yonel); nav.addEventListener('focusin', yonel); nav.addEventListener('touchstart', yonel, { passive: true });
})();
