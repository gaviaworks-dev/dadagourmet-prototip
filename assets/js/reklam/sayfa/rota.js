/* Dada Route sponsorlu öğeleri (reklam-rota, 11 Kas). Yalnız reklam önizlemesi açıkken yüklenir (sayfa satırı `betik: rota`).
   Kaynak kurallar: DadaGourmet-panel tasks/REKLAM-YERLESIM.md (Dada Route: RT-TANITIM, RT-DURAK, RT-PIN, RT-SARJ, RT-OZET; standart
   katman yok; rotada en çok N = `reklam-yogunluk.butceler.dada_route` 3; yalnız koridordaki mekân ve istasyon) ve panelin
   `App\Reklam\Servisler\RotaReklamlari` + panel `dada-route.js` "SPONSORLU ÖĞELER" bloğu (tanıtım özetin üstünde, fırsat özetin
   altında Gastro `.rk-pisirme` şeridi; sponsorlu mekân canlı motorun kendi pin, vitrin ve detay yüzeylerinde; şarj satırında
   "Sponsorlu · marka" hapı). Canlı kopya `dada-route.js` değişmez; bağlantı `rota-sahte.js` (RT-DURAK koridor yanıtı) ve
   `rota-katman.js` (çekirdeğin yüklenmesi) etiketli bloklarından.
   Sınır: rotada aynı anda en çok 3 sponsorlu ÖĞE; öğe = bir kampanya (marka). Bir kampanyanın dokunma noktaları (pin, liste satırı,
   özet kartı) tek öğedir, panelin sponsorlu mekânının pin + vitrin kartı + detay paneli tek öğe sayması gibi. Marka tavanı 3.
   Bütün sponsorlu duraklar, pinler ve istasyonlar seçili sapma toleransının koridorunda kalır; tolerans değişince yeniden süzülür.
   Gösterim ya da tıklama sayılmaz, istek gitmez; dış bağ çekirdeğin "Örnek yerleşim" bildirimini verir. */
(function () {
  'use strict';
  var R = window.dgReklam, Bk = window.dgReklamBilesen, V = window.DG_REKLAM_VERI;
  if (!R || !Bk || !V || window.dgRotaReklam) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var $ = function (s, k) { return (k || document).querySelector(s); }, $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var kac = Bk.kac, L = window.L;
  var BOOT = {}; try { BOOT = JSON.parse($('#routeMap').getAttribute('data-boot')) || {}; } catch (e) { BOOT = {}; }
  var HIZ = BOOT.sapmaHiziKmS || 55, TAM_KM = BOOT.tamYolUstuKm || 1, SINIR = 3;
  var oturum = { oku: function (a) { try { return sessionStorage.getItem(a); } catch (e) { return null; } }, yaz: function (a, v) { try { sessionStorage.setItem(a, v); } catch (e) { /* depo kapalı */ } } };
  var kapali = function (kod) { return !!oturum.oku('dg-rk-rt-kapali-' + kod); };

  /* ── Varlıklar: ek stil + EV motoru ve verisi (yalnız reklam açıkken, bir kez) ── */
  var yukSoz = null;
  function yukle() {
    if (yukSoz) { return yukSoz; }
    var css = function (h) { return new Promise(function (t) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = KOK + h; l.setAttribute('data-rk-stil', ''); l.onload = l.onerror = function () { t(); }; document.head.appendChild(l); }); };
    var js = function (h) { return new Promise(function (t) { if (document.querySelector('script[src$="' + h + '"]')) { t(); return; } var s = document.createElement('script'); s.src = KOK + h; s.onload = s.onerror = function () { t(); }; document.body.appendChild(s); }); };
    /* Şarj verisi ülke bazlı (rota-global): rotanın geçtiği ülkelerinki `rota-ulke.js` kaydından (Türkiye: `reklam/ev-sarj-veri.js`) */
    yukSoz = Promise.all([css('assets/css/reklam/ek/rota.css'), js('assets/js/reklam/ev-sarj.js'), veriHazir()]);
    return yukSoz;
  }

  /* ── Rota durumu (rota-katman.js ile aynı kaynaklar) ── */
  var ozet = $('#ygSummary');
  var geoAl = function () { var g = window.dgRotaGeometri; if (g && g.length > 1) { return g; } return (window.dgRotaHat ? window.dgRotaHat() : []).map(function (c) { return [c[1], c[0]]; }); };
  var rotaVar = function () { return !!ozet && !ozet.hidden && geoAl().length > 1; };
  /* Seçili sapma toleransı → koridor yarıçapı (canlı `aktifKoridorKm`: dakika × 55 / 120; tam yol üstü 1 km; özel km kaydırıcısı) */
  var yaricap = function () {
    var c = $('#ygTolChips .yg-tol-chip.is-active'), id = c ? c.getAttribute('data-tol') : BOOT.varsayilanTolerans || 'dk10';
    var t = (BOOT.tolerans || []).filter(function (x) { return x.id === id; })[0] || { id: 'dk10', dk: 10 };
    if (t.id === 'ozel') { var s = $('#ygCorrSlider'); return s ? +s.value : 12; }
    if (t.id === 'tam' || !t.dk) { return TAM_KM; }
    return t.dk * HIZ / 120;
  };
  var sapmaDk = function (d) { return Math.max(0, Math.round(d * 2 / HIZ * 60)); };
  var mesafe = function (d) { return d < 1 ? Math.round(d * 100) * 10 + ' m' : (Math.round(d * 10) / 10).toString().replace('.', ',') + ' km'; };
  var sureMetni = function (d) { var dk = sapmaDk(d); return dk > 0 ? 'yaklaşık +' + dk + ' dk' : 'süre eklemez'; };
  var elektrikli = function () { var s = $('#ygSarjKart'); return !!s && !s.hidden; };
  var rotaAnahtar = function () { var z = window.dgRotaApi ? window.dgRotaApi.zincir() : []; return z.map(function (n) { return String(n.ad).split(',')[0]; }).join('|'); };
  var ozelAd = function (n) { return String(n).split(',')[0]; };
  /* Sabit seçim (rotasyonun prototip karşılığı): aynı rota aynı kreatifi görür, farklı rota farklısını */
  var sira = function (s, n) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return n ? h % n : 0; };
  var rotada = function (ad, lat, lng) { var l = window.dgRotaApi ? window.dgRotaApi.duraklar() : []; return l.some(function (d) { return d && d.ad === ad && (d.lat == null || Math.abs(d.lat - lat) + Math.abs(d.lng - lng) < 0.003); }); };
  var marka = function (k) { return V.markalar[k] || null; };
  var logo = function (k) { return Bk.logo({ marka: k }); };
  var kreatif = function (kod) { return R.kreatif(kod); };
  /* ══ Ülke hedeflemesi (rota-global, 11 Kas; REKLAM-YERLESIM "Hedefleme": rota alanlarında rota bölgesi). Rotanın ülkeleri geometriden
     (`rota-ulke.js`); rota yoksa konum ülkesi (`ulke.js`). Kreatif `ulkeler` (yoksa markanınki) bu ülkelerden birini hedeflemeli; istasyon
     kreatifinde (yakıt pini, mola kartı, şarj ağı) istasyonun kendi ülkesi. Türkiye varsayımı yok ══ */
  var RU = window.dgRotaUlke;
  var ulkeler = function () { var l = RU ? RU.rotaUlkeleri(geoAl()) : []; if (!l.length && window.dgUlke && window.dgUlke.kod) { l = [window.dgUlke.kod]; } return l; };
  var hedefte = function (x, ul) { if (!x) { return false; } var h = RU ? RU.hedefler : function () { return true; }; return h(x.ulkeler ? x : marka(x.marka), ul) && h(marka(x.marka), ul); };
  var havuz = function (kod, m, ul, tur) { ul = ul || ulkeler(); return [].concat(kreatif(kod) || []).filter(function (x) { return x.marka === m && (!tur || x.tur === tur) && hedefte(x, ul); })[0] || null; };
  var kreatifRota = function (kod) { var k = kreatif(kod); return k && !Array.isArray(k) && hedefte(k, ulkeler()) ? k : null; };
  /* Teklifte fiyat: `{fiyat}` hedef ülkenin para birimiyle (kreatif `fiyat`) */
  var teklif = function (k, ulke) { if (!k || !k.teklif) { return null; } return k.teklif.indexOf('{fiyat}') < 0 ? k.teklif : RU && k.fiyat != null ? k.teklif.replace('{fiyat}', RU.fiyat(k.fiyat, ulke)) : k.teklif.replace(/\s*·?\s*\{fiyat\}/, ''); };
  /* Rotanın ülkelerinin reklam verisi (şarj) hazır mı; değilse yükler. Yüklenecek yoksa null */
  var veriHazir = function () { return RU && geoAl().length > 1 ? RU.hazirla(geoAl(), { reklam: true }) : null; };

  var aktif = false, durumRota = { ogeler: [], istasyon: 0 }, sokum = [];
  var H = null, hatAnahtar = '';
  var hatAl = function () { var g = geoAl(), a = g.length + ':' + (g[0] || []).join(',') + ':' + (g[g.length - 1] || []).join(','); if (a !== hatAnahtar) { hatAnahtar = a; H = window.dgEvSarj ? window.dgEvSarj.hat(g) : null; } return H; };

  /* ══ RT-DURAK · koridor yanıtı (rota-sahte.js `mekanlar`): Turkish Airlines rota destekçisinin yol üstü durağı. Yalnız koridorda
     ZATEN olan mekân; organik sıra ve sayı değişmez (canlı betik sponsoru vitrinin ilk slotuna ayrı ve etiketli koyar). Aday yalnız
     kampanyanın hedef mekânları (kreatif `mekanlar`), seçim rotanın ortasına en yakın olan ══ */
  var durakSecili = null;
  function koridor(sonuc, sinir) {
    durakSecili = null;
    if (!aktif || kapali('RT-DURAK') || !sonuc || !sonuc.mekanlar || !sonuc.mekanlar.length) { return sonuc; }
    var k = kreatifRota('RT-DURAK'); if (!k) { return sonuc; }
    /* Yayın politikası: alkol/domuz bayraklı ya da adı alkol servisini öne çıkaran mekân sponsorlu durak olmaz (`dgEvSarj.uygun`) */
    var uy = window.dgEvSarj ? window.dgEvSarj.uygun : function () { return true; };
    var l = sonuc.mekanlar.filter(function (m) { return m.sapmaKm <= sinir && uy(m); });
    var HH = hatAl(); if (!l.length) { return sonuc; }
    var top = HH ? HH.toplam : 0;
    var olc = function (m) { return HH ? HH.olc(m.lat, m.lng, sinir + 2) : { s: 0, d: m.sapmaKm }; };
    /* Kampanyanın hedef mekânları (kreatif `mekanlar`; panelde her biri ayrı sunum, `cta_hedef_turu` mekan): yalnız koridordaki. Seçim
       rotanın ortasına en yakın olan. Hedef mekân koridorda yoksa RT-DURAK basılmaz (yapay ekleme yok) */
    var hedef = k.mekanlar || [];
    var aday = l.filter(function (m) { return hedef.indexOf(m.slug) >= 0; }).map(function (m) { var o = olc(m); return { m: m, s: o.s }; });
    if (!aday.length) { return sonuc; }
    var sec = aday.sort(function (a, b) { return Math.abs(a.s - top / 2) - Math.abs(b.s - top / 2); })[0].m;
    sec.sponsor = true; sec.sponsorCta = k.cta || 'Menüyü Gör';
    sec.rk = { kod: 'RT-DURAK', marka: marka(k.marka).kisaAd || marka(k.marka).ad, baslik: k.baslik };
    durakSecili = { slug: sec.slug, ad: sec.ad, marka: k.marka };
    cizSonra(200);
    return sonuc;
  }
  /* Canlı betik mekânları yalnız tolerans ya da rota değişince ister: açılış ve kapanışta etkin tolerans çipi yeniden seçilir
     (canlı `refreshThreshold` → `loadVenues`; seçim değişmez) */
  var mekanTazele = function () { var c = $('#ygTolChips .yg-tol-chip.is-active'); if (c && rotaVar()) { c.click(); } };
  /* Vitrin ve detay rozeti. Doğrulayıcı bulgu #23: vitrin kartının fotoğrafındaki hap tek satır "Sponsorlu" (canlı kopyadaki gibi);
     marka adı kartın gövdesinde ("Turkish Airlines destekli durak"). Detay panelinde "Sponsorlu · Turkish Airlines" (panel `m.rk.marka`) */
  function durakRozet() {
    if (!aktif || !durakSecili) { return; }
    var ad = marka(durakSecili.marka); var etk = 'Sponsorlu · ' + (ad.kisaAd || ad.ad);
    $$('#ygDashScroll .yg-dcard.sponsor').forEach(function (c) {
      if (c.querySelector('[data-rk-durak-marka]')) { return; }
      var n = c.querySelector('.yd-name'); if (n) { n.insertAdjacentHTML('afterend', '<span class="rk-rt-durak-marka" data-rk-durak-marka>' + kac((ad.kisaAd || ad.ad) + ' destekli durak') + '</span>'); }
    });
    var d = $('#ygDetail'), b = $('#ygDetailBadge');
    if (d && b && d.classList.contains('is-sponsor') && b.textContent.trim() === 'Sponsorlu') { b.innerHTML = '<i class="fa-solid fa-bullhorn" aria-hidden="true"></i> ' + kac(etk); }
  }

  /* ══ Ortak parçalar ══ */
  var sinifRenk = function (k) { var m = marka(k); return m ? m.renkSinif : 'rk-renk-yok'; };
  var etiketli = function (t) { return '<span class="rk-etiket">' + kac(t) + '</span>'; };
  var kapatDugme = function (kod, ne) { return '<button type="button" class="rk-rt-kapat" data-rk-rt-kapat="' + kod + '" aria-label="' + kac(ne || 'Sponsorlu öğeyi kapat') + '"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'; };
  var durakDugmesi = function (ad, lat, lng, metin, ek) {
    var on = rotada(ad, lat, lng);
    return '<button type="button" class="rk-rt-ekle" data-rk-durak="' + kac(ad) + '" data-lat="' + lat + '" data-lng="' + lng + '"' + (ek || '') + ' aria-pressed="' + on + '"><i class="fa-solid ' + (on ? 'fa-check' : 'fa-plus') + '" aria-hidden="true"></i><span>' + (on ? 'Rotada' : kac(metin || 'Rotaya ekle')) + '</span></button>';
  };

  /* ══ RT-TANITIM · rota başı kapatılabilir şerit (Gastro `.rk-pisirme`; panel `rkSerit`), özet kartının üstü ══ */
  function tanitim() {
    var k = kreatifRota('RT-TANITIM'); if (!k || kapali('RT-TANITIM')) { return null; }
    var z = window.dgRotaApi ? window.dgRotaApi.zincir() : [], varis = z.length ? ozelAd(z[z.length - 1].ad) : '';
    var m = marka(k.marka);
    return '<aside class="rk-slot rk-pisirme rk-rt-serit ' + sinifRenk(k.marka) + '" data-rk-rota="RT-TANITIM" data-rk-slot="RT-TANITIM" data-rk-marka="' + k.marka + '" aria-label="Sponsorlu · ' + kac(m.ad) + '">' +
      '<span class="rk-pisirme-logo">' + logo(k.marka) + '</span><span class="rk-pisirme-metin">' + etiketli('Sponsorlu · Rota destekçisi') +
      '<b>' + kac((k.metin || k.baslik).replace('{varis}', varis || 'Varış')) + '</b></span>' +
      '<a href="#" rel="sponsored nofollow noopener" data-rk-bag data-rk-ornek>' + kac(k.cta || 'Keşfet') + ' →</a>' + kapatDugme('RT-TANITIM', 'Rota destekçisi şeridini kapat') + '</aside>';
  }

  /* ══ Yakıt kampanyası (Yakıtlı): RT-PIN logolu pin + mini kart, RT-SARJ yakıt listesinde satır hapı, RT-OZET yol üstü yakıt molası.
     İstasyon gerçek OSM kaydı (`rota-yakit-veri.js`), marka OSM `brand` etiketiyle eşleşir; yalnız koridordaki (sapma toleransı) istasyon.
     Marka: koridorda istasyonu olan Shell, Opet, Petrol Ofisi ve BP arasından rotaya sabit seçim (marka tavanı: rotada tek akaryakıt
     markası). Pin en çok 3: rota üç dilime bölünür, her dilimde en az sapan ══ */
  function yakitPlan(r) {
    var D = window.DG_YAKIT || [], HH = hatAl(); if (!HH || !D.length) { return null; }
    /* Marka seçimi rotaya sabit: aday markalar kaydırıcının en geniş durağındaki (20 dk) koridordan; istasyonlar seçili toleransa göre.
       Seçili toleransta o markanın istasyonu yoksa bu toleransta istasyonu olan markalardan seçilir (kaydırıcıyla marka gereksiz değişmesin) */
    var dkMax = Math.max.apply(null, (BOOT.tolerans || []).map(function (t) { return t.dk || 0; }).concat([20])), R2 = Math.max(r, dkMax * HIZ / 120);
    var m = (R2 + 1) / 100, say = {}, sayR = {}, l = [], tum = yakitMarkalari(), osm = yakitOsm(tum), uygunK = {};
    D.forEach(function (v, i) {
      /* Marka OSM brand (markasızsa operator) ile, ülkeden bağımsız; kampanya istasyonun ülkesini hedeflemeli */
      var key = osm[v.marka] || (!v.marka && v.isletmeci ? osm[v.isletmeci] : null); if (!key || rakipAdli(v.ad, key, tum)) { return; }
      var uk = key + '|' + v.ulke; if (!(uk in uygunK)) { uygunK[uk] = !!havuz('RT-PIN', key, [v.ulke]); } if (!uygunK[uk]) { return; }
      if (v.lat < HH.kutu[0] - m || v.lat > HH.kutu[2] + m || v.lng < HH.kutu[1] - m * 1.4 || v.lng > HH.kutu[3] + m * 1.4) { return; }
      var o = HH.olc(v.lat, v.lng, R2 + 1); if (o.d > R2) { return; }
      say[key] = (say[key] || 0) + 1;
      if (o.d <= r) { l.push({ i: i, v: v, key: key, d: o.d, s: o.s }); sayR[key] = (sayR[key] || 0) + 1; }
    });
    var adaylar = tum.filter(function (a) { return say[a]; });
    if (!adaylar.length) { return { marka: null, say: say, istasyon: [] }; }
    var sec = adaylar[sira(rotaAnahtar(), adaylar.length)], top = HH.toplam;
    if (!sayR[sec]) { var simdi = tum.filter(function (a) { return sayR[a]; }); if (!simdi.length) { return { marka: null, say: sayR, istasyon: [] }; } sec = simdi[sira(rotaAnahtar(), simdi.length)]; }
    var ist = l.filter(function (x) { return x.key === sec; });
    var dilim = [[], [], []]; ist.forEach(function (x) { dilim[Math.min(2, Math.floor(x.s / Math.max(1, top) * 3))].push(x); });
    var pin = dilim.map(function (d) { return d.sort(function (a, b) { return a.d - b.d; })[0]; }).filter(Boolean).slice(0, SINIR);
    var mola = pin.slice().sort(function (a, b) { return Math.abs(a.s - top / 2) - Math.abs(b.s - top / 2) || a.d - b.d; })[0];
    return { marka: sec, say: say, istasyon: pin, mola: mola, toplam: ist.length };
  }
  /* Yakıt kampanyası markaları RT-PIN kreatif sırasıyla (Türkiye: Shell, Opet, Petrol Ofisi, BP; Fransa: TotalEnergies, Shell, BP, Esso) */
  var yakitMarkalari = function () { var l = []; [].concat(kreatif('RT-PIN') || []).forEach(function (x) { if (l.indexOf(x.marka) < 0) { l.push(x.marka); } }); return l; };
  var yakitOsm = function (tum) { var o = {}; tum.forEach(function (k) { ((marka(k) || {}).osm || []).forEach(function (a) { if (!(a in o)) { o[a] = k; } }); }); return o; };
  /* OSM etiket çelişkisi (rota-global): adı başka bir kampanya markasını taşıyan istasyon (ör. adı "ESSO", brand "BP") sponsorlu olmaz */
  var rakipRe = {};
  var rakipAdli = function (ad, key, tum) {
    if (!ad) { return false; }
    return tum.some(function (k) {
      if (k === key) { return false; }
      if (!rakipRe[k]) { rakipRe[k] = new RegExp('(^|[^a-zçğıöşüéèà])(' + ((marka(k) || {}).osm || [k]).map(function (a) { return a.toLocaleLowerCase('tr').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')([^a-zçğıöşüéèà]|$)'); }
      return rakipRe[k].test(String(ad).toLocaleLowerCase('tr'));
    });
  };
  var yakitAd = function (x) { return x.v.ad || x.v.marka; };
  function yakitOzet(p) {
    if (!p || !p.mola || kapali('RT-OZET')) { return null; }
    var x = p.mola, k = havuz('RT-PIN', p.marka, [x.v.ulke]) || {}, o = havuz('RT-OZET', p.marka, [x.v.ulke], 'yakit') || {}, mk = marka(p.marka), tk = teklif(k, x.v.ulke);
    return '<aside class="rk-slot rk-rt-ozet ' + sinifRenk(p.marka) + '" data-rk-rota="RT-OZET" data-rk-slot="RT-OZET" data-rk-marka="' + p.marka + '" aria-label="Yol üstü yakıt molası · Sponsorlu · ' + kac(mk.ad) + '">' +
      '<div class="rk-rt-ozet-bas">' + etiketli((o.baslik || 'Yol üstü yakıt molası') + ' · Sponsorlu') + kapatDugme('RT-OZET', 'Yol üstü yakıt molası kartını kapat') + '</div>' +
      '<div class="rk-rt-ozet-govde"><span class="rk-rt-logo">' + logo(p.marka) + '</span><span class="rk-rt-ozet-metin"><b>' + kac(yakitAd(x)) + '</b>' +
      '<span>Rotanın ' + Math.round(x.s) + '. km\'si · rotadan ' + mesafe(x.d) + ' · ' + sureMetni(x.d) + '</span>' +
      (tk ? '<span class="rk-rt-teklif"><i class="fa-solid fa-gift" aria-hidden="true"></i> ' + kac(tk) + '</span>' : '') + '</span></div>' +
      '<div class="rk-rt-eylem">' + durakDugmesi(yakitAd(x), x.v.lat, x.v.lng, 'Rotaya ekle') +
      '<button type="button" class="rk-rt-ikincil" data-rk-rt-goster="y' + x.i + '"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>Haritada gör</span></button></div></aside>';
  }
  /* RT-PIN mini kartı (Leaflet balonu): logo, "Sponsorlu · marka", istasyon, sapma, kampanya, Rotaya ekle */
  function miniKart(o) {
    return '<div class="rk-rt-mini ' + sinifRenk(o.marka) + '" data-rk-rota="RT-PIN" data-rk-marka="' + o.marka + '">' +
      '<div class="rk-rt-mini-bas"><span class="rk-rt-logo">' + logo(o.marka) + '</span>' + etiketli(o.etiket) +
      '<button type="button" class="rk-rt-kapat" data-rk-mini-kapat aria-label="Kartı kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
      '<b class="rk-rt-mini-ad">' + kac(o.ad) + '</b><span class="rk-rt-mini-olcu">' + kac(o.olcu) + '</span>' +
      (o.teklif ? '<span class="rk-rt-teklif"><i class="fa-solid fa-gift" aria-hidden="true"></i> ' + kac(o.teklif) + '</span>' : '') + (o.ek || '') +
      '<div class="rk-rt-eylem">' + durakDugmesi(o.ad, o.lat, o.lng, o.dugme || 'Rotaya ekle', o.cift ? ' data-rk-cift="' + kac(JSON.stringify(o.cift)) + '"' : '') + '</div></div>';
  }

  /* ══ Harita katmanı (pinler) ══ */
  var h = window.dgRotaHarita, katman = h && L ? L.layerGroup() : null;
  var telefon = function () { return window.matchMedia('(max-width:860px)').matches; };
  /* Sponsorlu pin sabit arayüzün altında kalmaz (D18 il rozeti kuralının reklam karşılığı): başlık, +/−, konum düğmesi, şerit tutamağı,
     görünür alt sayfa ya da şerit, atıf ile kesişen pin o görünümde gizlenir (görünüm değişince yeniden bakılır) */
  var ORTU = '.yg-top, .leaflet-control-zoom, #ygLocate, .yg-dash-handle, .leaflet-control-attribution, .rm-atif, .yg-geo-prompt, #ygDetail';
  var ortuBekle = 0;
  function pinOrtu() {
    ortuBekle = 0; if (!aktif || !h) { return; }
    var gor = function (e) { return e && !e.hidden && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'; };
    var kutu = $$(ORTU).filter(gor).map(function (e) { return e.getBoundingClientRect(); });
    var pn = $('.yg-panel'), sr = $('#ygDash'), harita = h.getContainer().getBoundingClientRect();
    [pn, sr].forEach(function (e) { if (gor(e)) { var r = e.getBoundingClientRect(); if (r.left < harita.right && r.right > harita.left && r.top < harita.bottom && r.bottom > harita.top) { kutu.push(r); } } });
    $$('.rk-rt-pin-kap').forEach(function (m) {
      m.classList.remove('rk-rt-pin-kap--ortu');
      var r = m.querySelector('.rk-rt-pin').getBoundingClientRect(), d = 2;
      var ic = r.left >= harita.left && r.right <= harita.right && r.top >= harita.top && r.bottom <= harita.bottom;
      var kes = kutu.some(function (k) { return Math.min(r.right + d, k.right) - Math.max(r.left - d, k.left) > 0 && Math.min(r.bottom + d, k.bottom) - Math.max(r.top - d, k.top) > 0; });
      if (!ic || kes) { m.classList.add('rk-rt-pin-kap--ortu'); }
    });
  }
  var ortuSonra = function (ms) { clearTimeout(ortuBekle); ortuBekle = setTimeout(function () { requestAnimationFrame(pinOrtu); }, ms == null ? 80 : ms); };
  /* Mini kart başlığın altında açılsın: üst dolgu başlığın harita kabına göre alt kenarı */
  var ustDolgu = function () { var u = $('.yg-top'), k = h.getContainer().getBoundingClientRect(); return Math.max(20, Math.round((u ? u.getBoundingClientRect().bottom : k.top) - k.top) + 10); };
  /* Görünür harita alanı: RM-11 tek dolgu kaynağı (`rota-sahte.js` `dgRotaDolgu`: başlık, alt sayfa, şerit, yan sütun paneli, detay);
     yoksa başlık + telefonda alt yığın (`--rm-alt`) */
  function gorunurDolgu() {
    var d = window.dgRotaDolgu ? window.dgRotaDolgu() : null;
    if (d && d.paddingTopLeft) { return { tl: [Math.max(20, d.paddingTopLeft[0]), Math.max(ustDolgu(), d.paddingTopLeft[1])], br: [Math.max(20, d.paddingBottomRight[0]), Math.max(20, d.paddingBottomRight[1])] }; }
    var alt = parseFloat(getComputedStyle($('.yg-app')).getPropertyValue('--rm-alt')) || 0;
    return { tl: [20, ustDolgu()], br: [20, (telefon() ? Math.round(alt) : 0) + 20] };
  }
  function pinEkle(lat, lng, html, sinif, baslik, kart, z) {
    var ik = L.divIcon({ className: 'rk-rt-pin-kap', html: '<span class="rk-rt-pin ' + sinif + '" aria-hidden="true">' + html + (/rk-renk-/.test(sinif) ? '<i class="fa-solid fa-bullhorn rk-rt-pin-spon"></i>' : '') + '</span>', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -20] });
    var mk = L.marker([lat, lng], { icon: ik, title: baslik, zIndexOffset: z || 700, riseOnHover: true });
    if (kart) {
      /* RM-11 Bulgu #13 kalıbı: telefonda dar balon ve görünür alt yığının (`--rm-alt`) üstünde kalacak dolgu, dokunuş anında ölçülür */
      /* Doğrulayıcı bulgu #8: dolgu balon AÇILMADAN önce yazılır (Leaflet balonu kendi tıklama dinleyicisinde açar; önceki sırada ilk açılış
         eski 74 px üst payını kullanıyordu, 844×390'da kartın başı Route başlığının altında kalıyordu). Üst pay en az başlığın alt kenarı */
      var dolguYaz = function () { var p = mk.getPopup(), d = gorunurDolgu(); if (!p) { return; } p.options.maxWidth = Math.min(280, window.innerWidth - 60); p.options.autoPanPaddingTopLeft = L.point(d.tl[0], Math.max(d.tl[1], ustDolgu() + 6)); p.options.autoPanPaddingBottomRight = L.point(d.br[0], d.br[1]); };
      mk.on('click', dolguYaz);
      mk.bindPopup(kart, { className: 'rk-rt-balon', closeButton: false, maxWidth: 280, minWidth: 220, autoPanPaddingTopLeft: L.point(20, 74) });
      /* Geç yüklenen logo balonu yukarı büyütüp başlığın altına itmesin: görsel gelince konum ve kaydırma yeniden */
      mk.on('popupopen', function () { var p = mk.getPopup(), el = p && p.getElement(); if (!el) { return; } [].forEach.call(el.querySelectorAll('img'), function (i) { if (!i.complete) { i.addEventListener('load', function () { if (p.isOpen()) { p.update(); } }, { once: true }); } }); });
    }
    katman.addLayer(mk); return mk;
  }

  /* ══ EV şarj planlayıcı (Elektrikli): RT-SARJ etkileşimli widget, şarj kartının başında; RT-PIN şarj durağı pinleri ve mini kart;
     RT-OZET yol üstü şarj molası. Araç markası (Togg / Tesla) kampanyanın sahibi, aracın ağı (Trugo / Tesla Supercharger) sponsorlu ağ;
     "başka araç" için koridorda en çok noktası olan ZES ya da Eşarj. Sponsorlu ağın durakları logolu, ötekiler OSM adıyla logosuz ══ */
  var aracId = oturum.oku('dg-rk-rt-arac') || null;
  /* Kampanya sahibi: seçili aracın markası; "başka araç"ta planın sponsorlu ağı (ZES ya da Eşarj); araç seçilmemişken Togg */
  /* Ülke (rota-global): aracın markası rotanın ülkesini hedeflemiyorsa planın ağı; araç seçilmemişken rotanın ülkesini hedefleyen ilk araç kampanyası */
  /* Doğrulayıcı bulgu #10 + lider (11 Kas): planlayıcı TEK araç kampanyasıdır. Kampanya: rotanın ülkesini hedefleyen ilk araç kreatifi
     (TR: Togg; FR: Tesla, Togg Fransa'yı hedeflemiyor); önizleme `?rk-kreatif=<id>` seçimi önce. Seçilebilen araçlar kampanyanın
     `araclar` listesi + nötr "Başka bir elektrikli araç"; rakip marka aracı çıkmaz. Kampanya değişince başka markanın seçili aracı düşer */
  var onizleme = (new URLSearchParams(location.search).get('rk-kreatif') || '').split(',');
  var aracKampanya = function () { var ul = ulkeler(), l = [].concat(kreatif('RT-SARJ') || []).filter(function (x) { return x.tur === 'arac' && hedefte(x, ul); }); return l.filter(function (x) { return onizleme.indexOf(x.id) >= 0; })[0] || l[0] || null; };
  var araclar = function () { var E = window.dgEvSarj, k = aracKampanya(), ids = (k && k.araclar) || []; return E ? E.ARACLAR.filter(function (a) { return ids.indexOf(a.id) >= 0 || !a.marka; }) : []; };
  var secili = function () { var l = araclar(); return aracId ? l.filter(function (a) { return a.id === aracId; })[0] || null : null; };
  var evKampanya = function (p) { var k = aracKampanya(); if (k) { return k.marka; } return p && p.ag && marka(p.ag) ? p.ag : null; };
  /* Sponsor şarj ağları: rotanın ülkelerini hedefleyen RT-SARJ ağ kreatifleri, kreatif sırasıyla */
  var aglar = function () { var ul = ulkeler(), l = []; [].concat(kreatif('RT-SARJ') || []).forEach(function (x) { if (x.tur === 'ag' && hedefte(x, ul) && !l.some(function (y) { return y.marka === x.marka; })) { l.push({ marka: x.marka, herAraca: !!x.herAraca }); } }); return l; };
  function evPlan(r) {
    var E = window.dgEvSarj, HH = hatAl(), a = secili(); if (!E || !HH || !a) { return null; }
    return E.planla({ hat: HH, arac: a, yaricap: r, hiz: HIZ, aglar: aglar() });
  }
  function evWidget(p) {
    var E = window.dgEvSarj; if (!E || kapali('RT-SARJ')) { return null; }
    var km = evKampanya(p), k = havuz('RT-SARJ', km) || {}, mk = marka(km) || { ad: '' };
    var arac = secili(), AL = araclar();
    var cip = AL.map(function (a) {
      var on = !!arac && a.id === arac.id;
      return '<button type="button" role="radio" class="rk-ev-arac" data-rk-arac="' + a.id + '" aria-checked="' + on + '" tabindex="' + (on || (!arac && a === AL[0]) ? 0 : -1) + '"><b>' + kac(a.ad) + '</b><small>' + (a.marka ? 'WLTP ' + a.wltp + ' km' : 'varsayılan ' + a.wltp + ' km') + '</small></button>';
    }).join('');
    var govde = '';
    if (!arac) { govde = '<p class="rk-ev-not">Aracını seç; menzile göre güzergâhtaki şarj duraklarını ve şarj olurken yiyebileceğin yakın Dada mekânlarını gösterelim.</p>'; }
    else if (!p) { govde = '<p class="rk-ev-not">Rota çizilince şarj durakları burada görünür.</p>'; }
    else {
      var bas = Math.round(p.toplam) + ' km · otoyolda yaklaşık ' + p.menzil + ' km menzil · ' + (p.yeter ? 'şarj molası gerekmez' : p.duraklar.length + ' şarj molası');
      var agM = marka(p.ag);
      var satirlar = evListe(p).map(function (x) {
        var sp = x.sponsor && agM, ekle = x.mekan[0] && x.mekan[0].yuru ? x.mekan[0] : null, cift = ekle ? [{ ad: ekle.m.name, lat: ekle.m.lat, lng: ekle.m.lng }] : null;
        var yemek = x.mekan.length && x.mekan[0].yuru
          ? '<div class="rk-ev-yemek"><span class="rk-ev-yemek-bas"><i class="fa-solid fa-utensils" aria-hidden="true"></i> Şarj olurken burada ye</span><ul>' + x.mekan.map(function (y) { return '<li><a href="' + KOK + 'mekan/mikla/" data-rk-ev-mekan>' + kac(y.m.name) + '</a><small>' + mesafe(y.km) + ' · yürüyerek ' + y.yuruDk + ' dk</small></li>'; }).join('') + '</ul></div>'
          : '<div class="rk-ev-yemek rk-ev-yemek--uzak"><span class="rk-ev-yemek-bas"><i class="fa-solid fa-utensils" aria-hidden="true"></i> Bu durağın yakınında Dada Gourmet mekânı henüz yok</span></div>';
        var sure = x.dc === false ? 'Yalnız AC soket · şarj uzun sürer' : (x.dc ? '' : 'Soket bilgisi OSM\'de yok · DC ise ') + '~' + String(x.sarjDk).replace('.', ',') + ' dk şarj (' + p.arac.sarjNot + ')';
        return '<li class="rk-ev-durak' + (sp ? ' is-sponsor' : '') + (x.alternatif ? ' is-alternatif' : '') + '" data-rk-ev-durak="' + x.id + '"><span class="rk-ev-no' + (sp ? ' ' + agM.renkSinif : '') + '"' + (x.alternatif ? ' aria-hidden="true"><i class="fa-solid fa-bolt"></i>' : '>' + x.no) + '</span><div class="rk-ev-durak-govde">' +
          (x.alternatif ? '<span class="rk-ev-alt-bas">Sponsorlu ağdan alternatif durak</span>' : '') +
          '<div class="rk-ev-durak-bas"><b>' + kac(x.ad) + '</b>' + (sp ? '<em class="yg-sarj-added rk-ev-hap"><i class="fa-solid fa-bullhorn" aria-hidden="true"></i> Sponsorlu · ' + kac(agM.ad) + '</em>' : '') + '</div>' +
          '<small>' + kac((x.agAd && x.agAd !== x.ad ? x.agAd + ' · ' : '') + (x.kw ? x.kw + ' kW · ' : x.dc ? 'DC · ' : '') + Math.round(x.s) + '. km · rotadan ' + mesafe(x.d) + ' · ' + sureMetni(x.d)) + '</small><small>' + kac(sure) + '</small>' + yemek +
          '<div class="rk-rt-eylem">' + durakDugmesi(x.ad, x.lat, x.lng, ekle ? 'Rotaya ekle · şarj + yemek' : 'Rotaya ekle', cift ? ' data-rk-cift="' + kac(JSON.stringify(cift)) + '"' : '') +
          '<button type="button" class="rk-rt-ikincil" data-rk-ev-goster="' + x.id + '"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>Haritada gör</span></button></div></div></li>';
      }).join('');
      govde = '<p class="rk-ev-ozet" role="status">' + kac(bas) + '</p>' + (p.sorun ? '<p class="rk-ev-not rk-ev-sorun"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ' + kac(p.sorun) + ' Sapma toleransını artırmayı dene.</p>' : '') +
        (satirlar ? '<ol class="rk-ev-liste">' + satirlar + '</ol>' : '');
    }
    return '<section class="rk-slot rk-ev ' + sinifRenk(km) + '" data-rk-rota="RT-SARJ" data-rk-slot="RT-SARJ" data-rk-marka="' + km + '" aria-label="Şarj planlayıcı · Sponsorlu · ' + kac(mk.ad) + '">' +
      '<header class="rk-ev-bas"><span class="rk-rt-logo">' + logo(km) + '</span><span class="rk-ev-bas-metin">' + etiketli('Şarj planlayıcı · Sponsorlu') + '<b>' + kac(!arac ? k.baslik || 'Şarj molalarını planla' : !p ? arac.ad + ' ile şarj planın' : p.yeter ? arac.ad + ' ile şarj molası gerekmez' : arac.ad + ' ile ' + p.duraklar.length + ' şarj molası') + '</b></span>' + kapatDugme('RT-SARJ', 'Şarj planlayıcıyı kapat') + '</header>' +
      '<div class="rk-ev-araclar" role="radiogroup" aria-label="Aracın">' + cip + '</div>' + govde +
      '<p class="rk-ev-kaynak">Şarj noktaları: OpenStreetMap katkıcıları (ODbL) · Menzil: ' + kac(arac ? arac.kaynak : 'markaların teknik sayfaları') + ' · Otoyol menzili WLTP\'nin %80\'i, %90 doluyla çıkış, %10 → %80 şarj (tahmin)</p></section>';
  }
  var evListe = function (p) { return p ? p.duraklar.concat(p.alternatif ? [p.alternatif] : []) : []; };
  function evOzet(p) {
    if (kapali('RT-OZET') || kapali('RT-SARJ')) { return null; }
    var km = evKampanya(p); if (!km) { return null; }
    var o = havuz('RT-OZET', km, null, 'sarj') || {}, k = havuz('RT-SARJ', km) || {}, arac = secili(), mk = marka(km);
    var b = !arac ? (k.baslik || 'Şarj molalarını planla') : p && p.yeter ? arac.ad + ' ile şarj molası gerekmez' : p && p.duraklar.length ? arac.ad + ' · ' + p.duraklar.length + ' şarj molası' : arac.ad + ' ile şarj planı';
    var alt = !arac ? (k.metin || 'Aracını seç, şarj olurken yiyebileceğin yerleri bulalım.') : p && p.duraklar.length ? 'İlk mola: ' + p.duraklar[0].ad + ' · ' + Math.round(p.duraklar[0].s) + '. km' : 'Menzil bu rotaya yetiyor.';
    return '<aside class="rk-slot rk-rt-ozet ' + sinifRenk(km) + '" data-rk-rota="RT-OZET" data-rk-slot="RT-OZET" data-rk-marka="' + km + '" aria-label="Yol üstü şarj molası · Sponsorlu · ' + kac(mk.ad) + '">' +
      '<div class="rk-rt-ozet-bas">' + etiketli((o.baslik || 'Yol üstü şarj molası') + ' · Sponsorlu') + kapatDugme('RT-OZET', 'Yol üstü şarj molası kartını kapat') + '</div>' +
      '<div class="rk-rt-ozet-govde"><span class="rk-rt-logo">' + logo(km) + '</span><span class="rk-rt-ozet-metin"><b>' + kac(b) + '</b><span>' + kac(alt) + '</span></span></div>' +
      '<div class="rk-rt-eylem"><button type="button" class="rk-rt-ekle" data-rk-ev-ac><i class="fa-solid fa-charging-station" aria-hidden="true"></i><span>' + (arac ? 'Şarj planını gör' : 'Aracını seç') + '</span></button></div></aside>';
  }

  /* ══ Çizim ══ */
  var cizBekle = 0;
  var cizSonra = function (ms) { clearTimeout(cizBekle); cizBekle = setTimeout(ciz, ms == null ? 120 : ms); };
  function temizleDom() { $$('[data-rk-rota]').forEach(function (n) { if (!n.closest('.leaflet-popup')) { n.remove(); } }); if (katman) { katman.clearLayers(); } $$('[data-rk-rt-hap]').forEach(function (n) { n.remove(); }); }
  var sonPlan = { yakit: null, ev: null };
  function ciz() {
    if (!aktif) { return; }
    var acikBalon = h && h._popup && h._popup.isOpen && h._popup.isOpen() && h._popup.getElement && h._popup.getElement() && h._popup.getElement().querySelector('[data-rk-rota]');
    temizleDom();
    durumRota = { ogeler: [], istasyon: 0, sinir: SINIR, yaricapKm: 0 };
    if (!rotaVar()) { bildir(); return; }
    /* Ülke (rota-global): rotanın ülkelerinin şarj verisi eksikse yüklenir; Elektrikli'de veri gelince çizilir (boş plan görünmesin) */
    var vb = veriHazir(); if (vb) { vb.then(function () { hatAnahtar = ''; cizSonra(0); }); if (elektrikli()) { bildir(); return; } }
    var r = yaricap(); durumRota.yaricapKm = Math.round(r * 10) / 10; durumRota.ulkeler = ulkeler();
    var ogeler = [], ekle = function (o) { if (ogeler.length < SINIR && !ogeler.some(function (x) { return x.marka === o.marka; })) { ogeler.push(o); return true; } return ogeler.some(function (x) { return x.marka === o.marka; }); };
    /* 1 · Rota destekçisi (THY): RT-TANITIM + RT-DURAK */
    var t = tanitim(), thy = (kreatif('RT-TANITIM') || {}).marka;
    var thyKod = []; if (t) { thyKod.push('RT-TANITIM'); } if (durakSecili) { thyKod.push('RT-DURAK'); }
    if (thyKod.length) { ekle({ marka: thy, kodlar: thyKod }); }
    var kart = $('.yg-sum-card', ozet);
    if (t && kart) { kart.insertAdjacentHTML('beforebegin', t); }
    if (!elektrikli()) {
      /* 2 · Yakıt kampanyası */
      var p = sonPlan.yakit = yakitPlan(r);
      if (p && p.marka && ekle({ marka: p.marka, kodlar: ['RT-PIN', 'RT-SARJ', 'RT-OZET'] })) {
        var oz = yakitOzet(p); if (oz) { ozet.insertAdjacentHTML('beforeend', oz); }
        var mk = marka(p.marka);
        p.istasyon.forEach(function (x) {
          var k = havuz('RT-PIN', p.marka, [x.v.ulke]);
          pinEkle(x.v.lat, x.v.lng, logo(p.marka), mk.renkSinif + ' rk-rt-pin--yakit', yakitAd(x) + ' · Sponsorlu · ' + mk.ad,
            miniKart({ marka: p.marka, etiket: 'Sponsorlu', ad: yakitAd(x), olcu: (yakitAd(x) !== mk.ad ? mk.ad + ' · ' : '') + 'Rotanın ' + Math.round(x.s) + '. km\'si · rotadan ' + mesafe(x.d) + ' · ' + sureMetni(x.d), teklif: teklif(k, x.v.ulke), lat: x.v.lat, lng: x.v.lng }));
        });
        durumRota.istasyon = p.istasyon.length;
        yakitHap(p);
      }
    } else {
      /* 2-3 · Elektrikli: araç markası (widget + özet) ve sponsorlu şarj ağı */
      var e = sonPlan.ev = evPlan(r), km = evKampanya(e);
      if (km && ekle({ marka: km, kodlar: ['RT-SARJ', 'RT-OZET'] })) {
        var w = evWidget(e), sk = $('#ygSarjKart');
        if (w && sk) { sk.insertAdjacentHTML('afterbegin', w); }
        var eo = evOzet(e); if (eo) { ozet.insertAdjacentHTML('beforeend', eo); }
        if (e && !kapali('RT-SARJ')) {
          var spAg = evListe(e).some(function (x) { return x.sponsor; }) && ekle({ marka: e.ag, kodlar: ['RT-SARJ', 'RT-PIN'] });
          var agM = marka(e.ag);
          evListe(e).forEach(function (x) {
            var sp = x.sponsor && spAg, y = x.mekan[0] && x.mekan[0].yuru ? x.mekan[0] : null, no = x.alternatif ? '' : '<span class="rk-rt-pin-no">' + x.no + '</span>';
            var ek = y ? '<span class="rk-rt-mini-yemek"><i class="fa-solid fa-utensils" aria-hidden="true"></i> ' + kac(y.m.name) + ' · ' + mesafe(y.km) + ' · yürüyerek ' + y.yuruDk + ' dk' + '</span>' : '';
            pinEkle(x.lat, x.lng, (sp ? logo(e.ag) : '<i class="fa-solid fa-bolt"></i>') + no, (sp ? agM.renkSinif + ' ' : '') + 'rk-rt-pin--sarj' + (sp ? '' : ' rk-rt-pin--organik'), x.ad + (x.alternatif ? ' · sponsorlu alternatif şarj durağı' : ' · şarj durağı ' + x.no),
              miniKart({ marka: sp ? e.ag : km, etiket: sp ? 'Sponsorlu' : 'Şarj durağı' + (x.no ? ' ' + x.no : ''), ad: x.ad, olcu: (sp ? agM.ad + ' · ' : x.agAd ? x.agAd + ' · ' : '') + Math.round(x.s) + '. km · rotadan ' + mesafe(x.d) + ' · ' + sureMetni(x.d) + (x.sarjDk ? ' · ~' + String(x.sarjDk).replace('.', ',') + ' dk şarj' : ''), teklif: sp ? teklif(havuz('RT-SARJ', e.ag, x.ulke ? [x.ulke] : null), x.ulke) : null, ek: ek, lat: x.lat, lng: x.lng, dugme: y ? 'Rotaya ekle · şarj + yemek' : 'Rotaya ekle', cift: y ? [{ ad: y.m.name, lat: y.m.lat, lng: y.m.lng }] : null }), sp ? 720 : 680);
            if (y && y.yuru) { pinEkle(y.m.lat, y.m.lng, '<i class="fa-solid fa-utensils"></i>', 'rk-rt-pin--yemek', y.m.name + ' · şarj olurken yemek', null, 660); }
          });
          durumRota.istasyon = evListe(e).filter(function (x) { return x.sponsor && spAg; }).length;
        }
      }
    }
    if (katman && h && !h.hasLayer(katman)) { katman.addTo(h); }
    ortuSonra(60);
    durumRota.ogeler = ogeler;
    if (acikBalon) { h.closePopup(); }
    bildir();
  }
  /* RT-SARJ (Yakıtlı): canlı yakıt listesinde sponsorlu istasyon satırına "Sponsorlu · marka" hapı (panel `sarjListeyiCiz` kalıbı) */
  function yakitHap(p) {
    var p2 = p || sonPlan.yakit; if (!aktif || !p2 || !p2.marka || elektrikli()) { return; }
    var mk = marka(p2.marka);
    p2.istasyon.forEach(function (x) {
      var b = $('#ygYakitList [data-yakit="y' + x.i + '"] span'); if (!b || b.querySelector('[data-rk-rt-hap]')) { return; }
      b.insertAdjacentHTML('beforeend', ' <em class="yg-sarj-added rk-ev-hap" data-rk-rt-hap><i class="fa-solid fa-bullhorn" aria-hidden="true"></i> Sponsorlu · ' + kac(mk.ad) + '</em>');
    });
  }
  function bildir() {
    var d = R.durum && R.durum(); if (!d) { return; }
    var kodlar = [], markalar = [];
    durumRota.ogeler.forEach(function (o) { o.kodlar.forEach(function (k) { if (kodlar.indexOf(k) < 0) { kodlar.push(k); } }); if (markalar.indexOf(o.marka) < 0) { markalar.push(o.marka); } });
    d.basilan = kodlar; d.markalar = markalar; d.rota = durumRota;
    document.dispatchEvent(new CustomEvent('dg-reklam-rota', { detail: durumRota }));
  }

  /* ══ Etkileşim ══ */
  function durakEkle(b) {
    var api = window.dgRotaApi; if (!api || b.getAttribute('aria-pressed') === 'true') { return; }
    var ana = { ad: b.dataset.rkDurak, lat: +b.dataset.lat, lng: +b.dataset.lng }, cift = [];
    try { cift = b.dataset.rkCift ? JSON.parse(b.dataset.rkCift) : []; } catch (e) { cift = []; }
    if (h) { h.closePopup(); }
    api.durakYap(ana);
    /* Şarj + yemek: mekân da durak (canlı `mekaniDurakYap` yolculuk sırasına yerleştirir, rota yeniden kurulur) */
    cift.forEach(function (c, i) { setTimeout(function () { api.durakYap({ ad: c.ad, lat: +c.lat, lng: +c.lng }); }, 60 * (i + 1)); });
    cizSonra(400);
  }
  function tikla(e) {
    if (!aktif) { return; }
    var t = e.target;
    var b = t.closest('[data-rk-durak]'); if (b) { e.preventDefault(); durakEkle(b); return; }
    var x = t.closest('[data-rk-rt-kapat]'); if (x) { var kod = x.dataset.rkRtKapat; oturum.yaz('dg-rk-rt-kapali-' + kod, '1'); if (kod === 'RT-DURAK') { mekanTazele(); } cizSonra(0); return; }
    if (t.closest('[data-rk-mini-kapat]')) { if (h) { h.closePopup(); } return; }
    var a = t.closest('[data-rk-arac]'); if (a) { aracId = a.dataset.rkArac; oturum.yaz('dg-rk-rt-arac', aracId); ciz(); var y = $('[data-rk-arac="' + aracId + '"]'); if (y) { y.focus({ preventScroll: true }); } return; }
    var g = t.closest('[data-rk-rt-goster]'), ge = t.closest('[data-rk-ev-goster]');
    if (g || ge) { var id = g ? g.dataset.rkRtGoster : ge.dataset.rkEvGoster; pinAc(id, g ? 'yakit' : 'ev'); return; }
    if (t.closest('[data-rk-ev-ac]')) { evAc(); return; }
  }
  function pinAc(id, tur) {
    if (!h || !katman) { return; }
    var p = tur === 'yakit' ? sonPlan.yakit : sonPlan.ev; if (!p) { return; }
    var x = tur === 'yakit' ? p.istasyon.filter(function (s) { return 'y' + s.i === id; })[0] : evListe(p).filter(function (s) { return s.id === id; })[0];
    if (!x) { return; }
    var lat = tur === 'yakit' ? x.v.lat : x.lat, lng = tur === 'yakit' ? x.v.lng : x.lng;
    /* Telefonda haritayı göster (Harita kipi), sonra pine uç ve mini kartı aç */
    if (telefon() && window.dgRotaKip) { window.dgRotaKip.ata('harita'); }
    setTimeout(function () {
      /* Pin görünür alanın ortasına (panelin ve alt yığının dışına) uçar, mini kart görünür alanda açılır */
      var z = Math.max(h.getZoom(), 12), d = gorunurDolgu(), q = h.project([lat, lng], z).subtract(L.point((d.tl[0] - d.br[0]) / 2, (d.tl[1] - d.br[1]) / 2 + Math.min(90, Math.max(0, (h.getSize().y - d.tl[1] - d.br[1]) / 2 - 40))));
      h.flyTo(h.unproject(q, z), z, { duration: 0.6 });
      h.once('moveend', function () { katman.eachLayer(function (m) { var q = m.getLatLng(); if (Math.abs(q.lat - lat) + Math.abs(q.lng - lng) < 1e-6 && m.getPopup()) { m.fire('click'); m.openPopup(); } }); });
    }, telefon() ? 420 : 0);
  }
  function evAc() {
    var w = $('.rk-ev'); if (!w) { return; }
    /* RM-11 alt sayfa: Plan (yarım) kipine çıkar, sonra planlayıcıya kaydır */
    if (telefon() && window.dgRotaKip && /^(harita|kesif)$/.test(window.dgRotaKip.oku())) { window.dgRotaKip.ata('yarim'); }
    setTimeout(function () {
      var v = $('#viewRoute'); if (!v) { return; }
      v.scrollTo({ top: v.scrollTop + w.getBoundingClientRect().top - v.getBoundingClientRect().top - 12, behavior: 'smooth' });
      var c = $('.rk-ev-arac[aria-checked="true"]') || $('.rk-ev-arac'); if (c) { c.focus({ preventScroll: true }); }
    }, telefon() ? 380 : 0);
  }
  /* Araç seçici klavyesi (radio grubu): oklar, Home, End */
  function tus(e) {
    var a = e.target.closest && e.target.closest('[data-rk-arac]'); if (!a) { return; }
    var l = $$('[data-rk-arac]'), n = l.indexOf(a), y = { ArrowRight: n + 1, ArrowDown: n + 1, ArrowLeft: n - 1, ArrowUp: n - 1, Home: 0, End: l.length - 1 }[e.key];
    if (y === undefined) { return; } e.preventDefault(); y = (y + l.length) % l.length; l[y].click();
  }
  /* Mini kart düğmesi Leaflet balonunda: balon tıklamayı belgeye iletmez, kendi dinleyicisi */
  function balonAcildi(ev) { var el = ev.popup.getElement(); if (el && !el.dataset.rkBag) { el.dataset.rkBag = '1'; el.addEventListener('click', tikla); } }

  /* ══ Ana sayfa AS-INT bağı: `?ev-rota=istanbul-izmir&arac=togg-t10x` → pilot rota kurulur, Elektrikli seçilir, araç seçilir ══ */
  function adresOku() {
    var q = new URLSearchParams(location.search), rt = q.get('ev-rota'), ar = q.get('arac'); if (!rt) { return; }
    if (ar && window.dgEvSarj && window.dgEvSarj.aracBul(ar)) { aracId = ar; oturum.yaz('dg-rk-rt-arac', ar); }
    q.delete('ev-rota'); q.delete('arac'); if (history.replaceState) { history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); }
    var tr = function (s) { return s.toLocaleLowerCase('tr').replace(/[ıi̇]/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''); };
    var dene = 0, kur = function () {
      var p = $$('#ygPilots button, #ygPilots a').filter(function (b) { return tr(b.textContent) === rt; })[0];
      if (!p) { if (dene++ < 20) { setTimeout(kur, 150); } return; }
      p.click();
      var ev = $('[data-arac="elektrikli"]'); if (ev && ev.getAttribute('aria-pressed') !== 'true') { ev.click(); }
      var bekle = 0, sonra = function () { if (rotaVar()) { ciz(); setTimeout(evAc, 300); } else if (bekle++ < 40) { setTimeout(sonra, 200); } }; sonra();
    };
    kur();
  }

  /* ══ Aç / kapat ══ */
  var gozcu = [], dinle = function (h2, t, f, o) { h2.addEventListener(t, f, o); sokum.push(function () { h2.removeEventListener(t, f, o); }); };
  function ac() {
    if (aktif) { return; }
    aktif = true;
    yukle().then(function () {
      if (!aktif) { return; }
      $$('link[href*="reklam/ek/rota.css"]').forEach(function (l) { l.disabled = false; });
      document.documentElement.classList.add('rk-rota-acik');
      hatAnahtar = '';
      var yeniden = function () { cizSonra(); };
      dinle(document, 'dg:rota', function () { hatAnahtar = ''; cizSonra(250); });
      dinle(window, 'dg-rota', function () { hatAnahtar = ''; cizSonra(250); });
      dinle(document, 'click', tikla); dinle(document, 'keydown', tus);
      var km = $('#ygCorrSlider'); if (km) { dinle(km, 'input', yeniden); }
      if (h) {
        var ortuF = function () { ortuSonra(); };
        h.on('popupopen', balonAcildi); h.on('moveend zoomend', ortuF);
        sokum.push(function () { h.off('popupopen', balonAcildi); h.off('moveend zoomend', ortuF); });
      }
      dinle(window, 'resize', function () { ortuSonra(300); });
      var izle = function (el, o, f) { if (!el) { return; } var g = new MutationObserver(f); g.observe(el, o); gozcu.push(g); };
      izle(ozet, { attributes: true, attributeFilter: ['hidden'] }, function () { hatAnahtar = ''; cizSonra(250); });
      izle($('#ygTolChips'), { childList: true }, yeniden);
      izle($('#ygSarjKart'), { attributes: true, attributeFilter: ['hidden'] }, yeniden);
      izle($('#ygStopList'), { childList: true, subtree: true }, function () { cizSonra(300); });
      izle($('#ygDashScroll'), { childList: true, subtree: true }, durakRozet);
      izle($('#ygDetail'), { attributes: true, attributeFilter: ['class', 'hidden'] }, function () { durakRozet(); ortuSonra(450); });
      izle($('.yg-panel'), { attributes: true, attributeFilter: ['class', 'style'] }, function () { ortuSonra(450); });
      izle($('#ygDash'), { attributes: true, attributeFilter: ['class', 'hidden'] }, function () { ortuSonra(450); });
      izle($('#ygYakitList'), { childList: true }, function () { yakitHap(); });
      mekanTazele();
      ciz();
      adresOku();
    });
  }
  function kapat() {
    if (!aktif) { return; }
    aktif = false; clearTimeout(cizBekle);
    gozcu.forEach(function (g) { g.disconnect(); }); gozcu = [];
    sokum.forEach(function (f) { f(); }); sokum = [];
    if (h) { h.closePopup(); }
    temizleDom(); if (katman && h) { h.removeLayer(katman); }
    /* Ek stil yüklü kalır (çekirdeğin kanon stili gibi): yalnız rk-* ve sponsorlu mekân sınıflarına bağlı; kapanırken sponsor kartı canlı
       betik yeniden çizene dek birkaç yüz ms DOM'da kalır ve canlı stilin eksik amblem görseli (404) istenmesin */
    durakSecili = null; document.documentElement.classList.remove('rk-rota-acik');
    mekanTazele();
  }
  window.dgRotaReklam = { koridor: koridor, durum: function () { return durumRota; }, ciz: ciz };
  document.addEventListener('dg-reklam-degisti', function (e) { if (e.detail && e.detail.acik) { ac(); } else { kapat(); } });
  /* Betik çekirdeğin yerleştirmesinden önce yüklenir; açık durum olayla gelir. Geç yüklenirse durumu kendisi okur */
  if (R.durum && R.durum().acik) { ac(); }
})();
