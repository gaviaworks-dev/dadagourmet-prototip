/* Ana sayfa: kaydırma rayı (donör `kesfet.js` davranışı yerine dar kopya) */
(function () { 'use strict'; document.querySelectorAll('[data-scroll-to]').forEach(function (b) { b.addEventListener('click', function () { var h = document.querySelector(b.getAttribute('data-scroll-to')); if (h) { h.scrollIntoView({ behavior: 'smooth' }); } }); }); })();
