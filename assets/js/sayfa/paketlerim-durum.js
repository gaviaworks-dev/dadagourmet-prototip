/* Paketlerim test durumu: `?paket=pro` Gastro'da etkin Pro abonelikli üyenin gördüğü ekranı açar (kıyas için).
   Varsayılan örnek üyenin durumu Ücretsiz. Değişen parçalar sayfada `<template data-pk-pro="seçici">`; `data-dis` olan
   şablon hedefin kendisinin yerine geçer, öbürü içini değiştirir. Ödeme bağlı değil, hiçbir şey kaydedilmez. */
(function () {
  'use strict';
  var paket = '';
  try { paket = new URLSearchParams(location.search).get('paket') || ''; } catch (e) { return; }
  if (paket !== 'pro') { return; }
  [].forEach.call(document.querySelectorAll('template[data-pk-pro]'), function (t) {
    var hedef = document.querySelector(t.getAttribute('data-pk-pro'));
    if (!hedef) { return; }
    if (t.hasAttribute('data-dis')) { hedef.outerHTML = t.innerHTML; } else { hedef.innerHTML = t.innerHTML; }
  });
})();
