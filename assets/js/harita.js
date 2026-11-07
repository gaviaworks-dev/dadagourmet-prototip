/* MapLibre yardımcıları (K7). Altlık OSM verisinden üretilmiş açık stil; erişilemezse düz zemin. Google yok. */
window.dgHarita = (function () {
  'use strict';
  var STIL = 'https://tiles.openfreemap.org/styles/positron';
  var YEDEK = { version: 8, sources: {}, layers: [{ id: 'zemin', type: 'background', paint: { 'background-color': '#efedf2' } }] };
  function kur(kap, secenek) {
    var harita = new maplibregl.Map(Object.assign({ container: kap, style: STIL, attributionControl: false, cooperativeGestures: false }, secenek || {}));
    harita.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '© OpenStreetMap' }));
    harita.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    var yedekte = false;
    harita.on('error', function (e) { if (!yedekte && e && e.error && /style|fetch|Failed/i.test(String(e.error.message))) { yedekte = true; harita.setStyle(YEDEK); } });
    return harita;
  }
  function pin(harita, lng, lat, renk, baslik, sinif) {
    var el = document.createElement('button');
    el.type = 'button'; el.className = 'dg-pin ' + (sinif || ''); el.style.background = renk || 'var(--marka,#742982)'; el.setAttribute('aria-label', baslik || 'Konum');
    var p = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]);
    if (baslik) { p.setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setText(baslik)); }
    return p.addTo(harita);
  }
  return { kur: kur, pin: pin };
})();
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.map-mock[data-lat][data-lng]').forEach(function (el) {
    var lat = parseFloat(el.getAttribute('data-lat')), lng = parseFloat(el.getAttribute('data-lng'));
    if (isNaN(lat) || isNaN(lng)) { return; }
    var h = window.dgHarita.kur(el, { center: [lng, lat], zoom: 14 });
    h.on('load', function () { window.dgHarita.pin(h, lng, lat, null, el.getAttribute('data-name')); });
  });
});
