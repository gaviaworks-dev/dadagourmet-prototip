/* "Rotayı telefona gönder" örnek akışı: pencere, örnek QR ve kısa bağ, "Uygulamaya gönderildi" adımı. Ağ isteği yok. */
(function () {
  'use strict';
  var V = window.DG_ROTA_TELEFON, $ = function (s) { return document.querySelector(s); };
  var dugme = $('#ygTelefonGonder'), pencere = $('#ygTelefon'); if (!V || !dugme || !pencere) { return; }

  /* Örnek QR görünümü: üç konum karesi ve sabit desen. Veri taşımaz, okutulamaz. */
  var QR_BOY = 25;
  var konumKaresi = function (x, y) { var a = x >= 0 && x < 7 && y >= 0 && y < 7; return a && (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)); };
  var qrMatris = function (n) {
    var m = [], x, y, k = n - 7;
    for (y = 0; y < n; y++) { for (x = 0; x < n; x++) {
      var kose = (x < 8 && y < 8) || (x >= k - 1 && y < 8) || (x < 8 && y >= k - 1);
      var dolu = kose ? konumKaresi(x, y) || konumKaresi(x - k, y) || konumKaresi(x, y - k) : (x * 7 + y * 13 + x * y) % 3 === 0;
      if (dolu) { m.push([x, y]); }
    } }
    return m;
  };
  var qrSvg = function (m, n) { return '<svg viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" aria-hidden="true">' + m.map(function (k) { return '<rect x="' + k[0] + '" y="' + k[1] + '" width="1" height="1"/>'; }).join('') + '</svg>'; };

  var rotaOzeti = function () {
    var z = window.dgRotaApi ? window.dgRotaApi.zincir() : []; if (z.length < 2) { return ''; }
    var kisa = function (n) { return String(n.ad).split(',')[0]; };
    return kisa(z[0]) + ' → ' + kisa(z[z.length - 1]) + ' · ' + z.length + ' nokta';
  };

  var goster = function (ad) {
    var a = V.adim[ad], son = ad === 'gonderildi';
    $('#ygTelefonIkon').className = 'fa-solid ' + a.ikon;
    $('#ygTelefonBaslik').textContent = a.baslik;
    $('#ygTelefonMetin').textContent = a.metin;
    $('#ygTelefonRota').textContent = rotaOzeti();
    $('#ygTelefonBag').hidden = son;
    var b = $('#ygTelefonBirincil'); b.textContent = a.birincil; b.dataset.telefon = son ? 'kapat' : 'gonder';
    var i = $('#ygTelefonIkincil'); i.hidden = !a.ikincil; i.textContent = a.ikincil || '';
  };
  var ac = function () { goster('hazir'); pencere.hidden = false; $('#ygTelefonBirincil').focus(); };
  var kapat = function () { pencere.hidden = true; dugme.focus(); };

  $('#ygTelefonQr').innerHTML = qrSvg(qrMatris(QR_BOY), QR_BOY);
  $('#ygTelefonQr').setAttribute('aria-label', V.qrNot);
  $('#ygTelefonKisa').textContent = V.kisaBag;
  $('#ygTelefonNot').textContent = V.qrNot;
  $('#ygTelefonAd').textContent = V.dugme.ad;
  $('#ygTelefonAlt').textContent = V.dugme.alt;

  dugme.addEventListener('click', ac);
  pencere.addEventListener('click', function (e) {
    if (e.target === pencere || e.target.closest('[data-telefon="kapat"]')) { kapat(); return; }
    if (e.target.closest('[data-telefon="gonder"]')) { goster('gonderildi'); $('#ygTelefonBirincil').focus(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pencere.hidden) { kapat(); } });
})();
