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
  kimlik.content = JSON.stringify(uye ? { auth: true, roles: ['kullanici'], ad: 'Örnek Üye', kullaniciAdi: 'ornekuye' } : { auth: false });
  document.head.appendChild(kimlik);
  if (document.documentElement.dataset.uyeSayfa && !uye) { location.replace(kok + 'giris/?donus=' + encodeURIComponent(document.documentElement.dataset.yol + '/')); }
  var uyeOl = function () {
    var kaydedildi = oturumYaz(true), d = adres.get('donus') || '';
    var hedef = /^[a-z0-9/-]+$/.test(d) ? d : 'hesabim/ayarlar/';
    location.href = kok + hedef + (kaydedildi ? '' : '?auth=1');
  };
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
  window.prototipBildir = bildir;
  document.addEventListener('DOMContentLoaded', function () {
    if (uye) { document.body.classList.add('is-auth'); document.body.setAttribute('data-roles', 'kullanici'); }
  });
  window.addEventListener('load', function () {
    ['ysYeni', 'ysTekrar'].forEach(function (id) { var a = document.getElementById(id); if (a && a.value) { a.dispatchEvent(new Event('input', { bubbles: true })); } });
    if (adres.get('yenilendi')) { bildir('Şifren yenilendi. Giriş yapabilirsin.'); }
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    if (f.hasAttribute('data-yerel')) { return; }
    if (f.id === 'formGiris' || f.id === 'formKayit') { e.stopImmediatePropagation(); uyeOl(); return; }
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
    bildir('Prototip: form gönderilmedi.');
  }, true);
  document.addEventListener('click', function (e) {
    var cikis = e.target.closest && e.target.closest('[data-cikis]');
    if (cikis) { e.preventDefault(); e.stopImmediatePropagation(); oturumYaz(false); location.href = kok; return; }
    var bag = e.target.closest && e.target.closest('a[href]');
    if (bag && uye && !depo && bag.origin === location.origin && !bag.hasAttribute('data-yakinda') && bag.getAttribute('href') !== '#') { var u = new URL(bag.href); u.searchParams.set('auth', '1'); bag.href = u.href; }
    var yakinda = e.target.closest && e.target.closest('[data-yakinda]');
    if (yakinda) { e.preventDefault(); bildir('Bu ekran sonraki turda: /' + yakinda.getAttribute('data-yakinda')); return; }
    var konum = e.target.closest && e.target.closest('[data-location-trigger]');
    if (konum) { e.preventDefault(); bildir('Konum seçimi sonraki turda.'); return; }
    var oner = e.target.closest && e.target.closest('[data-mo-open],#mekanOnerBtn');
    var mo = document.getElementById('moModal'), moO = document.getElementById('moOverlay');
    if (oner && mo) { e.preventDefault(); mo.classList.add('show', 'open'); moO.classList.add('show', 'open'); return; }
    if (mo && (e.target === moO || (e.target.closest && e.target.closest('#moModal .fb-close')))) { mo.classList.remove('show', 'open'); moO.classList.remove('show', 'open'); return; }
    var git = e.target.closest && e.target.closest('[data-git]');
    if (git) { location.href = git.getAttribute('data-git'); }
  }, true);
})();
