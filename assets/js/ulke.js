/* Kullanıcının ülkesi (Beyar 10 Kas, E2): Etkinlikler'in ilk sekmesi ve ana sayfadaki Yaklaşan Etkinlikler bu ülkeyi öne alır.
   Sıra: `?ulke=DE` parametresi > tarayıcı dilinin bölge kodu (`navigator.languages`, ör. de-DE) > saat dilimi > Türkiye.
   Konum izni istenmez. Canlıda (Faz 4) sunucu tarafı ülke tespitiyle değişir. Ad Türkçe (`Intl.DisplayNames`); sekmeye sığması için birkaç kısa ad.
   Veri ülke adları canlı etkinlik kayıtlarındaki Türkçe adlardır; Türkiye canlıdaki gibi `tr` bayrağıyla eşleşir. */
(function () {
  'use strict';
  var KISA = { US: 'Amerika', AE: 'BAE', HK: 'Hong Kong', MO: 'Makao' };
  var VERI = { US: ['ABD'], GB: ['İngiltere', 'Galler (Birleşik Krallık)'], HK: ['Hong Kong'], MO: ['Makao'] };
  var SAAT = {
    'Europe/Istanbul': 'TR', 'Asia/Istanbul': 'TR', 'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE', 'Europe/Rome': 'IT', 'Europe/Paris': 'FR', 'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES',
    'Europe/Zurich': 'CH', 'Europe/London': 'GB', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Copenhagen': 'DK', 'Europe/Oslo': 'NO', 'Europe/Helsinki': 'FI',
    'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT', 'Europe/Budapest': 'HU', 'Europe/Ljubljana': 'SI', 'Europe/Chisinau': 'MD', 'Asia/Yerevan': 'AM', 'Asia/Qatar': 'QA', 'Asia/Dubai': 'AE',
    'Asia/Tokyo': 'JP', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Hong_Kong': 'HK', 'Asia/Macau': 'MO', 'Asia/Nicosia': 'CY', 'Europe/Nicosia': 'CY',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US', 'America/Detroit': 'US', 'America/Boise': 'US', 'Pacific/Honolulu': 'US',
    'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA', 'America/Montreal': 'CA',
    'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR', 'America/Buenos_Aires': 'AR', 'America/Santiago': 'CL'
  };
  var gecerli = function (k) { return /^[A-Z]{2}$/.test(k || '') ? k : ''; };
  var bolge = function (dil) { try { if (window.Intl && Intl.Locale) { return gecerli(new Intl.Locale(dil).region); } } catch (h) { /* geçersiz dil etiketi */ } var m = /^[a-z]{2,3}(?:-[a-z]{4})?-([a-z]{2})(?:-|$)/i.exec(dil || ''); return m ? m[1].toUpperCase() : ''; };
  var param = gecerli((new URLSearchParams(location.search).get('ulke') || '').toUpperCase());
  var kod = param, kaynak = 'parametre';
  if (!kod) { kaynak = 'dil'; (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).some(function (d) { kod = bolge(d); return !!kod; }); }
  if (!kod) { kaynak = 'saat'; try { var z = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; kod = SAAT[z] || (/^America\/(Indiana|Kentucky|North_Dakota)\//.test(z) ? 'US' : ''); } catch (h) { kod = ''; } }
  if (!kod) { kaynak = 'varsayilan'; kod = 'TR'; }
  var tam = kod; try { tam = new Intl.DisplayNames('tr', { type: 'region' }).of(kod) || kod; } catch (h) { /* Intl.DisplayNames yok */ }
  var adlar = VERI[kod] || [tam];
  window.dgUlke = {
    kod: kod, ad: KISA[kod] || tam, kaynak: kaynak,
    /* Etkinlik bu ülkede mi */
    yerel: function (e) { return kod === 'TR' ? !!e.tr : adlar.indexOf(e.ulke) >= 0; },
    /* Parametreyle denenirken iç bağlar ülkeyi taşır */
    bag: function (u) { return param ? u + (u.indexOf('?') < 0 ? '?' : '&') + 'ulke=' + param : u; }
  };
})();
