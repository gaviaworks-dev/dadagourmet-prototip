/* Rezervasyon takvimi: 14 günlük örnek. Mevcut 3 adımlı akışı (`mekan-detay.js`) besler; hiçbir yere gönderilmez. */
(function () {
  'use strict';
  var el = document.getElementById('mdCalendarData'); if (!el) { return; }
  var gun = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], t = {}, saatler = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
  for (var i = 1; i <= 14; i++) {
    var d = new Date(); d.setDate(d.getDate() + i);
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    t[iso] = { label: gun[d.getDay()] + ' ' + d.getDate(), day_number: d.getDate(), state: d.getDay() === 1 ? 'closed' : 'open', slots: saatler.map(function (s) { return { time: s, state: 'open', label: s }; }) };
  }
  el.textContent = JSON.stringify(t);
})();
