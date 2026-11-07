/* DadaGastro: hesap menüsündeki alışveriş yolu, Menülerim bağlantısının anatomisini korur. */
(function () {
  var ADLAR = { tr: 'Alışveriş listelerim', en: 'My shopping lists' };
  function kur() {
    document.querySelectorAll('.acct-menu, .d-acct-sub').forEach(function (menu) {
      if (menu.querySelector('[data-alisveris-erisim]')) return;
      var mevcut = menu.querySelector('a[href="/hesabim/menulerim"], a[href="/en/account/my-menus"]');
      if (!mevcut) return;
      var bag = mevcut.cloneNode(false);
      bag.href = mevcut.getAttribute('href') + '#alisveris';
      bag.setAttribute('data-alisveris-erisim', '');
      var ikon = document.createElement('i'); ikon.className='fa-solid fa-basket-shopping'; ikon.setAttribute('aria-hidden','true');
      /* Aşama 2 · B (ajan-b3): üye alanının EN adresi var — bağ, kopyalanan Menülerim bağının kendi adresini (TR'de
         `/hesabim/menulerim`, EN'de `/en/account/my-menus`) izler; TR çıktısı aynı. */
      var ad = document.createElement('span'); ad.textContent = ADLAR[document.documentElement.lang] || ADLAR.tr;
      bag.append(ikon, document.createTextNode(' '), ad);
      mevcut.insertAdjacentElement('afterend', bag);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur);
  else kur();
})();
