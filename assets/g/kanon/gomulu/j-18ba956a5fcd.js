
/* ═══════════════════════════════════════════════════════════════
   SAYFA JS · FIT HESABIM — KAYNAKTAN TAŞINDI, YAZILMADI
   üretim: python3 scripts/olcum/sayfa-js-tasi.py hesabim
   kaynak: dump/fit-prototip/hesabim-v1.html + assets/js/*
   🔴 ELLE DÜZENLENMEZ — yeniden üretilir.
   ═══════════════════════════════════════════════════════════════ */

/* ── MODÜL · fit-modal.js (birebir) ────────────────────────── */
/* =====================================================================
   FIT_MODAL — ORTAK MODAL İSKELETİ                      (R8 · AJAN-C)
   ---------------------------------------------------------------------
   Neden var. Prototipteki her modal kendi açma/kapama mantığını elle
   yazıyordu; her kopya bir şeyi unutuyordu. R8 · kalem 11'de ölçülen
   hâl (localhost, Playwright):

     profil-v1  #aptModal   → Esc ✅ · dışarı ⛔ · düğme ✅ · odak dönüşü ⛔
     antrenor-detay #aptModal → Esc ⛔ · dışarı ⛔ · düğme ✅ · odak dönüşü ⛔

   Kök neden. `.apt-modal{position:fixed;inset:0}` bütün pencereyi
   kaplıyor ve `#…Overlay`in ÜSTÜNDE duruyor; "dışarı" tıklaması
   overlay'e hiç ulaşmıyor. Playwright'ın kendi kaydı da bunu yazıyor:
   `<div id="aptModal"…> intercepts pointer events`. Dolayısıyla
   dışarı-tıklama dinleyicisi overlay'e DEĞİL, kabın kendisine bağlanır
   ve olay panelin dışına düştüğünde kapatır.

   Ne veriyor (bir modalın borcu olan altı şeyin hepsi, tek yerde):
     1. Esc                — yalnız EN ÜSTTEKİ açık modalı kapatır
     2. dışarı tıklama     — kaba VE overlay'e bağlı; panel içi sayılmaz
     3. kapat düğmesi      — [data-fm-close] ya da `kapat` seçicisi
     4. odak tuzağı        — Tab/Shift+Tab panel içinde sarmalanır
     5. odak dönüşü        — kapanınca TETİKLEYEN elemana geri
     6. scroll kilidi      — FIT_SHELL sayacına devredilir (çift kilit yok)

   Kullanım:
     var h = FIT_MODAL.kur({
       kap:     '#aptModal',        // .show alan dış kap (zorunlu)
       panel:   '.apt-panel',       // kap içindeki gerçek kutu (zorunlu)
       ortu:    '#aptOverlay',      // ayrı örtü düğümü (varsa)
       kapat:   '#aptClose',        // ek kapat düğmesi seçicisi (opsiyonel)
       sinif:   'show',             // açık sınıfı (varsayılan 'show')
       acilinca:  function(){},     // açıldıktan sonra (opsiyonel)
       kapaninca: function(){}      // kapandıktan sonra (opsiyonel)
     });
     h.ac(tetikleyiciEl);  h.kapat();  h.acikMi();

   `kap` ya da `panel` yoksa `kur` null döner — çağıran sayfa patlamaz.
   ===================================================================== */
(function (global) {
  'use strict';

  /* açık modallar — en son açılan dizinin sonunda (Esc onu kapatır) */
  var YIGIN = [];

  var ODAKLANABILIR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  /* Görünür ve gerçekten odaklanabilir olanlar. `hidden` alt ağaçlar
     (modalların success/body geçişi bunu kullanıyor) elenmeli — yoksa
     tuzak görünmeyen bir düğmeye odak verip kullanıcıyı kör bırakır. */
  function odaklar(panel) {
    return Array.prototype.filter.call(
      panel.querySelectorAll(ODAKLANABILIR),
      function (el) {
        if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
        if (el.closest('[hidden]')) return false;
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      }
    );
  }

  function kilitle() {
    if (global.FIT_SHELL && FIT_SHELL.lockScroll) FIT_SHELL.lockScroll();
    else document.body.style.overflow = 'hidden';
  }
  function coz() {
    if (global.FIT_SHELL && FIT_SHELL.unlockScroll) FIT_SHELL.unlockScroll();
    else document.body.style.overflow = '';
  }

  /* --- tek global dinleyici: Esc + Tab tuzağı ------------------------
     Her modal kendi keydown'ını bağlarsa N modal = N dinleyici ve Esc
     hepsini birden kapatır (profil-v1'in eski hâli tam olarak buydu:
     `closeApt(); closeMsg();`). Tek dinleyici yalnız yığının tepesine
     bakar. */
  document.addEventListener('keydown', function (e) {
    if (!YIGIN.length) return;
    var m = YIGIN[YIGIN.length - 1];

    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      m.kapat();
      return;
    }
    if (e.key !== 'Tab') return;

    var liste = odaklar(m.panel);
    if (!liste.length) { e.preventDefault(); m.panel.focus(); return; }

    var ilk = liste[0], son = liste[liste.length - 1], akt = document.activeElement;

    /* Odak panelin dışına düşmüşse (tarayıcı adres çubuğundan dönüş,
       programatik focus) sarmalamayı yine de biz yapalım. */
    if (!m.panel.contains(akt)) { e.preventDefault(); (e.shiftKey ? son : ilk).focus(); return; }

    if (e.shiftKey && akt === ilk) { e.preventDefault(); son.focus(); }
    else if (!e.shiftKey && akt === son) { e.preventDefault(); ilk.focus(); }
  }, true);

  function kur(o) {
    var kap = typeof o.kap === 'string' ? document.querySelector(o.kap) : o.kap;
    if (!kap) return null;
    var panel = typeof o.panel === 'string' ? kap.querySelector(o.panel) : o.panel;
    if (!panel) return null;

    var ortu  = o.ortu ? (typeof o.ortu === 'string' ? document.querySelector(o.ortu) : o.ortu) : null;
    var sinif = o.sinif || 'show';
    var acik  = false;
    var tetik = null;

    /* panelin kendisi de odak alabilsin — içinde hiç odaklanabilir yoksa
       ya da açılışta metnin başına konmak gerektiğinde */
    if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');

    var h = {
      kap: kap, panel: panel,
      acikMi: function () { return acik; },

      ac: function (tetikleyici) {
        if (acik) return;
        tetik = tetikleyici ||
                (document.activeElement && document.activeElement !== document.body
                  ? document.activeElement : null);
        kap.classList.add(sinif);
        if (ortu) ortu.classList.add(sinif);
        kap.removeAttribute('aria-hidden');
        acik = true;
        YIGIN.push(h);
        kilitle();
        /* --- 5 · AÇILIŞ ODAĞI ------------------------------------------
           ÖNCE tek `requestAnimationFrame` bekleniyordu. Yetmiyor: kap
           `visibility .25s` geçişi taşıdığında (`.apt-modal` — hem
           profil-v1 hem antrenor-detay) rAF-1 karesinde computed
           `visibility` HÂLÂ `hidden`, ve `visibility:hidden` bir alt
           ağaçtaki `.focus()` sessizce hiçbir şey yapmıyor. Modal açık,
           odak tetikleyicide kalıyor — ekran okuyucu kullanıcısı modalın
           açıldığını duymuyor. AJAN-G kare kare ölçüp bildirdi; ben
           antrenor-detay VE profil-v1'de yeniden ürettim.

           `transitionend` tek başına yetmez: `prefers-reduced-motion`da
           ya da geçişsiz bir modalda (anatomi diyaloğu) hiç ateşlenmez.
           Bu yüzden "odak İÇERİ DÜŞENE KADAR dene": ilk denemede oturursa
           tek karede biter, geçiş varsa birkaç kare sonra oturur.
           Odak zaten panelin içindeyse hiçbir şeye dokunulmaz — kullanıcı
           bu arada başka bir alana geçtiyse onu geri çekmeyiz. */
        var deneme = 0;
        (function odakVer() {
          if (!acik) return;                                  // bu arada kapandıysa bırak
          if (panel.contains(document.activeElement)) return; // zaten içeride
          var l = odaklar(panel);
          (l.length ? l[0] : panel).focus();
          if (!panel.contains(document.activeElement) && ++deneme < 20) requestAnimationFrame(odakVer);
        })();
        if (o.acilinca) o.acilinca(h);
      },

      kapat: function () {
        if (!acik) return;
        kap.classList.remove(sinif);
        if (ortu) ortu.classList.remove(sinif);
        acik = false;
        var i = YIGIN.indexOf(h); if (i > -1) YIGIN.splice(i, 1);
        coz();
        /* odak TETİKLEYENE döner — kapat düğmesinde kalmaz */
        if (tetik && document.contains(tetik) && tetik.focus) tetik.focus();
        tetik = null;
        if (o.kapaninca) o.kapaninca(h);
      }
    };

    /* --- 2 · dışarı tıklama -----------------------------------------
       Kaba bağlanıyor: kap tüm pencereyi kaplasa bile panelin dışına
       düşen tıklama yakalanır. `mousedown`+`click` ikilisi: kullanıcı
       panel içinde basıp dışarıda bırakırsa (metin seçimi) kapanmasın. */
    var basimIcerde = false;
    kap.addEventListener('mousedown', function (e) { basimIcerde = panel.contains(e.target); });
    kap.addEventListener('click', function (e) {
      if (e.target !== kap && panel.contains(e.target)) return;
      if (basimIcerde) { basimIcerde = false; return; }
      h.kapat();
    });
    if (ortu) ortu.addEventListener('click', function () { h.kapat(); });

    /* --- 3 · kapat düğmeleri ----------------------------------------
       DELEGE: panel içeriği sonradan innerHTML ile değişebiliyor
       (anatomi paneli her kas seçiminde yeniden basılıyor). Doğrudan
       bağlanan dinleyici o an ölürdü. */
    kap.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-fm-close]')) h.kapat();
    });
    if (o.kapat) {
      var kb = typeof o.kapat === 'string' ? document.querySelector(o.kapat) : o.kapat;
      if (kb) kb.addEventListener('click', function () { h.kapat(); });
    }

    return h;
  }

  /* tetikleyici → modal bağlamanın kısa yolu */
  function tetikle(sec, h, once) {
    if (!h) return;
    var el = typeof sec === 'string' ? document.querySelector(sec) : sec;
    if (!el) return;
    el.addEventListener('click', function () { if (once) once(h); h.ac(el); });
  }

  global.FIT_MODAL = { kur: kur, tetikle: tetikle, yigin: YIGIN };
})(window);


/* ── BLOK · DOĞUM TARİHİ TAKVİMİ ─────────────────────
   GEREKÇE: kapi-acilir: aria-controls=hsDogumPop açılmıyor. #hsDogumAc → #hsDogumPop (§53 tarih alanı) */
/* =====================================================================
 DOĞUM TARİHİ TAKVİMİ — .alan-tarih sürücüsü
 ---------------------------------------------------------------------
 Alan yine yazılabilir; takvim onun YERİNE değil, YANINA geliyor.
 Klavye: alan odaktayken ok-aşağı / Enter / boşluk takvimi açar,
 Escape kapatır ve odak alana döner (giris-v1'in ülke seçicisiyle aynı
 sözleşme). Dışarı tıklayınca kapanır.

 SINIRLAR TARİHTEN TÜRETİLİR — sabit yıl yazılmaz, bu yüzden bir yıl
 sonra da doğru çalışır:
   ustSinir = bugün − 13 yıl   → 13 yaş altı seçilemez. Gelecek tarihler
                                 zaten bu sınırın ötesinde kaldığı için
                                 ayrıca engellemeye gerek yok.
   altSinir = bugün − 100 yıl
 Sınır dışı gün `disabled` + `aria-disabled="true"` gelir; ay/yıl
 seçicileri de sınır dışına çıkamaz (oklar uçlarda kapanır).
 --------------------------------------------------------------------- */
(function(){
  var kok = document.querySelector('[data-tar-kok]');
  if(!kok) return;
  var $ = function(id){ return document.getElementById(id); };
  var alan=$('hsDogum'), btn=$('hsDogumAc'), pop=$('hsDogumPop'),
      selAy=$('hsDogumAy'), selYil=$('hsDogumYil'), grid=$('hsDogumGrid'),
      sinirNot=$('hsDogumSinir'), temizle=$('hsDogumTemizle'), hata=$('hsDogumHata');
  if(!alan||!btn||!pop||!grid) return;

  var AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
               'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  function gunBasi(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  var BUGUN    = gunBasi(new Date());
  var UST      = new Date(BUGUN.getFullYear()-13,  BUGUN.getMonth(), BUGUN.getDate());
  var ALT      = new Date(BUGUN.getFullYear()-100, BUGUN.getMonth(), BUGUN.getDate());

  function iki(n){ return (n<10?'0':'')+n; }
  function bicimle(d){ return iki(d.getDate())+'.'+iki(d.getMonth()+1)+'.'+d.getFullYear(); }
  function coz(metin){
    var m = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/.exec((metin||'').trim());
    if(!m) return null;
    var g=+m[1], a=+m[2], y=+m[3];
    var d = new Date(y, a-1, g);
    /* 31.02.1990 gibi taşan tarihi Date sessizce kaydırır — geri
       çevirerek yakalarız. */
    if(d.getFullYear()!==y || d.getMonth()!==a-1 || d.getDate()!==g) return null;
    return d;
  }
  function sinirDisi(d){ return d > UST || d < ALT; }

  var secili = coz(alan.value);
  var gorunen = new Date((secili || UST).getFullYear(), (secili || UST).getMonth(), 1);

  /* ---- ay ve yıl seçicileri ---- */
  selAy.innerHTML = AYLAR.map(function(a,i){ return '<option value="'+i+'">'+a+'</option>'; }).join('');
  var yilHtml = '';
  for(var y = UST.getFullYear(); y >= ALT.getFullYear(); y--) yilHtml += '<option value="'+y+'">'+y+'</option>';
  selYil.innerHTML = yilHtml;

  if(sinirNot){
    sinirNot.textContent = '13 yaşından küçük ya da ' + ALT.getFullYear() +
      ' öncesi bir tarih seçilemez. Seçilebilen en yeni tarih: ' + bicimle(UST) + '.';
  }

  function hataYaz(metin){
    alan.classList.toggle('is-err', !!metin);
    alan.setAttribute('aria-invalid', metin ? 'true' : 'false');
    if(hata){
      hata.classList.toggle('show', !!metin);
      hata.querySelector('span').textContent = metin || '';
    }
  }

  function ciz(){
    var yil = gorunen.getFullYear(), ay = gorunen.getMonth();
    selAy.value = ay; selYil.value = yil;

    /* Pazartesi başlangıçlı ızgara: JS'in 0=Pazar dizinini kaydırıyoruz. */
    var ilk = new Date(yil, ay, 1);
    var bosluk = (ilk.getDay() + 6) % 7;
    var gunSayisi = new Date(yil, ay+1, 0).getDate();

    var h = '';
    for(var i=0;i<bosluk;i++) h += '<span aria-hidden="true"></span>';
    for(var g=1; g<=gunSayisi; g++){
      var d = new Date(yil, ay, g);
      var kapali = sinirDisi(d);
      var secim = secili && d.getTime() === gunBasi(secili).getTime();
      h += '<button type="button" data-gun="'+g+'"'+
           (kapali ? ' disabled aria-disabled="true"' : '')+
           ' aria-selected="'+(secim?'true':'false')+'"'+
           (d.getTime()===BUGUN.getTime() ? ' class="bugun"' : '')+
           ' aria-label="'+g+' '+AYLAR[ay]+' '+yil+'">'+g+'</button>';
    }
    grid.innerHTML = h;

    /* uçlardaki oklar kapanır — sınır dışına gezinme yolu bırakılmaz */
    var geri = pop.querySelector('[data-ay="-1"]'), ileri = pop.querySelector('[data-ay="1"]');
    geri.disabled  = new Date(yil, ay, 1)   <= new Date(ALT.getFullYear(), ALT.getMonth(), 1);
    ileri.disabled = new Date(yil, ay+1, 1) >  new Date(UST.getFullYear(), UST.getMonth(), 1);
  }

  function ac(){
    pop.hidden = false;
    btn.setAttribute('aria-expanded','true');
    secili = coz(alan.value);
    gorunen = new Date((secili || UST).getFullYear(), (secili || UST).getMonth(), 1);
    ciz();
    selAy.focus();
  }
  function kapat(odakDon){
    pop.hidden = true;
    btn.setAttribute('aria-expanded','false');
    if(odakDon) alan.focus();
  }

  btn.addEventListener('click', function(){ pop.hidden ? ac() : kapat(true); });
  alan.addEventListener('keydown', function(e){
    if(e.key==='ArrowDown' && !e.altKey){ e.preventDefault(); ac(); }
  });

  selAy.addEventListener('change', function(){ gorunen.setMonth(+selAy.value); ciz(); });
  selYil.addEventListener('change', function(){ gorunen.setFullYear(+selYil.value); ciz(); });
  pop.addEventListener('click', function(e){
    var nav = e.target.closest('[data-ay]');
    if(nav && !nav.disabled){ gorunen.setMonth(gorunen.getMonth() + (+nav.getAttribute('data-ay'))); ciz(); return; }
    var g = e.target.closest('[data-gun]');
    if(g && !g.disabled){
      secili = new Date(gorunen.getFullYear(), gorunen.getMonth(), +g.getAttribute('data-gun'));
      alan.value = bicimle(secili);
      hataYaz('');
      kapat(true);
    }
  });
  pop.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ e.preventDefault(); kapat(true); }
  });
  if(temizle) temizle.addEventListener('click', function(){
    secili = null; alan.value = ''; hataYaz(''); ciz(); kapat(true);
  });
  document.addEventListener('click', function(e){
    if(!pop.hidden && !kok.contains(e.target)) kapat(false);
  });

  /* Elle yazılan değer de aynı sınırlardan geçer. */
  alan.addEventListener('blur', function(){
    var v = alan.value.trim();
    if(!v){ hataYaz(''); return; }                       /* alan opsiyonel */
    var d = coz(v);
    if(!d){ hataYaz('Tarihi gg.aa.yyyy biçiminde yaz — örneğin 14.03.1992.'); return; }
    if(d > UST){ hataYaz('DadaGastro 13 yaş ve üzeri içindir. En yeni seçilebilen tarih: '+bicimle(UST)+'.'); return; }
    if(d < ALT){ hataYaz(ALT.getFullYear()+' öncesi bir tarih seçilemez.'); return; }
    secili = d; alan.value = bicimle(d); hataYaz('');
  });
})();

/* ── BLOK · İKİ ADIMLI DOĞRULAMA KURULUMU ─────────────────────
   GEREKÇE: #gv2faKur → #tfaModal · üç adımlı akış */
/* ---------------------------------------------------------------------
 KALEM #2 · İKİ ADIMLI DOĞRULAMA KURULUMU — üç adımlı akış
 Sözleşme §1.2'nin üç kolonu bu akışta karşılanır. BACKEND YOK: kod
 gönderilmez, doğrulanmaz; 2. adım yalnız BİÇİM denetler (6 hane) ve
 ekranda bunun prototip olduğu açıkça yazılıdır. Sahte bir "kod doğru"
 iddiası basılmaz.
 --------------------------------------------------------------------- */
(function(){
  var kap = document.getElementById('tfaModal');
  if(!kap) return;
  var $ = function(id){ return document.getElementById(id); };
  var adim = 1, yontem = 'sms', kodlarUretildi = false;

  var tm = (window.FIT_MODAL && FIT_MODAL.kur({
    kap:'#tfaModal', panel:'.fb-panel', ortu:'#tfaOverlay', kapat:'#tfaClose'
  })) || null;

  var haneler = [].slice.call(kap.querySelectorAll('.tfa-hane'));

  function kodMetni(){ return haneler.map(function(h){ return h.value.trim(); }).join(''); }
  function kodTam(){ return /^[0-9]{6}$/.test(kodMetni()); }

  function boya(){
    kap.querySelectorAll('.tfa-pane').forEach(function(p){
      p.hidden = +p.getAttribute('data-pane') !== adim;
    });
    kap.querySelectorAll('.adim-serit li').forEach(function(li){
      var n = +li.getAttribute('data-adim');
      li.classList.toggle('acik', n === adim);
      li.classList.toggle('is-done', n < adim);
    });
    $('tfaNot').textContent = 'Adım ' + adim + ' / 3';
    $('tfaGeri').hidden = adim === 1;
    var ileri = $('tfaIleri');
    if(adim === 3){ ileri.innerHTML = '<i class="fa-solid fa-check"></i> Kurulumu Bitir'; }
    else { ileri.innerHTML = 'Devam <i class="fa-solid fa-arrow-right"></i>'; }
    ileri.disabled = (adim === 2 && !kodTam());
    if(adim === 2){
      $('tfaSir').hidden = yontem !== 'uygulama';
      $('tfaKodMetin').textContent = yontem === 'sms'
        ? 'Telefonuna gelen 6 haneli kodu yaz.'
        : 'Doğrulayıcı uygulamanın gösterdiği 6 haneli kodu yaz.';
    }
    if(adim === 3 && !kodlarUretildi) kodlariUret();
  }

  /* kurtarma kodları — 10 adet, karışan karakterler (0/O · 1/I/l) yok.
     Destek talep numarası kalıbının aynı ilkesi (sözleşme §1.7). */
  function kodlariUret(){
    var abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', liste = $('tfaKodlar');
    liste.innerHTML = '';
    for(var i=0;i<10;i++){
      var p = '';
      for(var j=0;j<9;j++){
        if(j===4) p += '-';
        else p += abc.charAt(Math.floor(Math.random()*abc.length));
      }
      var li = document.createElement('li'); li.textContent = p; liste.appendChild(li);
    }
    kodlarUretildi = true;
  }
  function kodMetinBlogu(){
    return [].slice.call($('tfaKodlar').children).map(function(li){ return li.textContent; }).join('\n');
  }

  kap.querySelectorAll('input[name="tfaYontem"]').forEach(function(r){
    r.addEventListener('change', function(){ yontem = r.value; });
  });

  /* hane hane giriş: yazınca ilerler, sil'de geri gider, yapıştırma dağıtılır */
  haneler.forEach(function(h, i){
    h.addEventListener('input', function(){
      h.value = h.value.replace(/[^0-9]/g,'').slice(0,1);
      if(h.value && haneler[i+1]) haneler[i+1].focus();
      $('tfaIleri').disabled = !kodTam();
    });
    h.addEventListener('keydown', function(e){
      if(e.key === 'Backspace' && !h.value && haneler[i-1]){ haneler[i-1].focus(); }
    });
    h.addEventListener('paste', function(e){
      var v = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g,'');
      if(!v) return;
      e.preventDefault();
      for(var k=0;k<haneler.length;k++) haneler[k].value = v.charAt(k) || '';
      (haneler[Math.min(v.length, haneler.length-1)] || h).focus();
      $('tfaIleri').disabled = !kodTam();
    });
  });

  $('tfaGeri').addEventListener('click', function(){ if(adim>1){ adim--; boya(); } });
  $('tfaIleri').addEventListener('click', function(){
    if(adim < 3){ adim++; boya(); if(adim===2 && haneler[0]) haneler[0].focus(); return; }
    /* bitiş: anahtar açık kalır, durum satırı yöntemi söyler */
    var d = $('gv2faDurum'), a = $('gv2fa');
    if(a) a.checked = true;
    if(d) d.innerHTML = 'Açık — girişte <b>' +
      (yontem==='sms' ? 'telefonuna gelen 6 haneli kod' : 'doğrulayıcı uygulamanın kodu') +
      '</b> isteniyor. Yöntemi değiştirmek için kurulumu yeniden çalıştır.';
    if(tm) tm.kapat();
  });

  $('tfaKopyala').addEventListener('click', function(){
    var b = $('tfaKopyala');
    var bitir = function(ok){
      b.innerHTML = ok ? '<i class="fa-solid fa-check"></i> Kopyalandı'
                       : '<i class="fa-solid fa-triangle-exclamation"></i> Kopyalanamadı';
      setTimeout(function(){ b.innerHTML = '<i class="fa-solid fa-copy"></i> Kopyala'; }, 2500);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(kodMetinBlogu()).then(function(){ bitir(true); }, function(){ bitir(false); });
    } else { bitir(false); }
  });
  $('tfaIndir').addEventListener('click', function(){
    var blob = new Blob(['DadaGastro — kurtarma kodların\n\n' + kodMetinBlogu() + '\n'], {type:'text/plain;charset=utf-8'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dadagastro-kurtarma-kodlari.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  });

  function ac(tetik, adimAdi){
    adim = adimAdi === 'kodlar' ? 3 : 1;
    if(adimAdi === 'kodlar' && tetik && tetik.getAttribute('data-2fa-yenile')) kodlarUretildi = false;
    haneler.forEach(function(h){ h.value=''; });
    var sak = $('tfaSakladim'); if(sak) sak.checked = false;
    boya();
    if(tm) tm.ac(tetik);
  }
  var kurBtn = $('gv2faKur');
  if(kurBtn) kurBtn.addEventListener('click', function(){ ac(kurBtn, 'yontem'); });
  document.querySelectorAll('[data-2fa-adim]').forEach(function(b){
    b.addEventListener('click', function(){ ac(b, b.getAttribute('data-2fa-adim')); });
  });
})();

/* ── BLOK · Ülke kodu seçicisini sür ─────────────────────
   GEREKÇE: Tek satır: FIT_ULKE.kur() — FIT_FATURA_FORM.kur() dersinin aynısı: modülü taşımak yetmez, KURAN çağrı da taşınır. */
/* Ülke kodu seçicisini sür — kap `[data-cc-kok]`, gerisi modülde. */
(function(){ if(window.FIT_ULKE) FIT_ULKE.kur(); })();

/* ── BLOK · YIKICI İŞLEM ONAY KAPISI ─────────────────────
   GEREKÇE: #dondurOnay · #silOnay → [data-confirm-btn] · §39 onay kapısı. Yıkıcı eylem onaysız kalırsa kapı değil kusurdur. */
/* ---------------------------------------------------------------------
 4 · YIKICI İŞLEM ONAY KAPISI (§20)
 Kural: "tehlikeli işlem onay istesin ve yalnız renkle uyarmasın".
 Uygulama: düğme onay sağlanana kadar gerçekten disabled; engelin
 SEBEBİ role="status" taşıyan metin satırında yazılı (ekran okuyucu da
 duyar), renk tek başına bilgi taşımıyor. Silme ayrıca doğrulama
 ifadesinin elle yazılmasını istiyor.
 --------------------------------------------------------------------- */
(function(){
  document.querySelectorAll('form[data-confirm]').forEach(function(f){
    var box    = f.querySelector('[data-confirm-check]');
    var input  = f.querySelector('[data-confirm-input]');
    var btn    = f.querySelector('[data-confirm-btn]');
    var state  = f.querySelector('[data-confirm-state]');
    var phrase = f.getAttribute('data-confirm-phrase') || '';
    if(!btn || !state) return;
    var txt = state.querySelector('span');
    var msgBlocked = txt ? txt.textContent : '';

    /* Türkçe i/İ/ı/I tuzağı: "hesabimi sil".toLocaleUpperCase('tr') "HESABİMİ SİL"
       veriyor (noktalı İ), ifade ise "HESABIMI SİL" (noktasız I) — ölçüldü,
       doğru yazan kullanıcının düğmesi açılmıyordu. Bu yüzden i ailesinin
       dördü de karşılaştırma öncesi tek harfe indirilir; kullanıcı ister
       "HESABIMI SİL", ister "hesabimi sil", ister "HESABIMI SIL" yazsın geçer. */
    function fold(s){
      return String(s).trim().replace(/[iıİI]/g,'I').toUpperCase().replace(/\s+/g,' ');
    }
    var want = fold(phrase);
    function why(){
      if(box && !box.checked) return 'kutu';
      if(phrase && (!input || fold(input.value) !== want)) return 'ifade';
      return null;
    }
    function sync(){
      var r = why();
      btn.disabled = !!r;
      state.classList.toggle('blocked', !!r);
      state.classList.toggle('tamam', !r);
      if(!txt) return;
      if(r === 'kutu')       txt.textContent = msgBlocked;
      else if(r === 'ifade') txt.textContent = 'Onay alındı. Düğme hâlâ kapalı: doğrulama ifadesini birebir yazman gerekiyor.';
      else                   txt.textContent = 'Onay tamam — düğme artık çalışıyor.';
      state.querySelector('i').className = r ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
    }
    if(box)   box.addEventListener('change', sync);
    if(input) input.addEventListener('input', sync);
    sync();

    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(why()) return;
      if(txt) txt.textContent = 'Bu makette işlem gerçekten uygulanmadı; canlıda burada e-posta ile son bir doğrulama adımı gelir.';
      state.classList.remove('blocked'); state.classList.add('tamam');
      state.querySelector('i').className = 'fa-solid fa-circle-info';
      btn.disabled = true;
      if(box) box.checked = false;
      if(input) input.value = '';
    });
  });
})();

/* ══ KAPSAYAN IIFE · kaynağın önsözü + taşınan bölümleri ══
   Bölümler kapsayanın bildirimlerine dayanıyor (ölçüldü:
   `form is not defined` · `FATURALAR is not defined`), bu
   yüzden önsöz de taşınır. Kardeş bölümler ALINMAZ. */
(function(){

  /* şifre göster/gizle */
  document.querySelectorAll('.alan-goz').forEach(function(btn){
    var base = btn.getAttribute('aria-label') || 'Şifreyi göster';
    btn.addEventListener('click', function(){
      var inp = document.getElementById(btn.getAttribute('data-eye'));
      if(!inp) return;
      var showing = inp.type === 'text';
      inp.type = showing ? 'password' : 'text';
      var i = btn.querySelector('i');
      i.classList.toggle('fa-eye', showing);
      i.classList.toggle('fa-eye-slash', !showing);
      btn.setAttribute('aria-pressed', showing ? 'false' : 'true');
      btn.setAttribute('aria-label', showing ? base : base.replace('göster','gizle'));
    });
    btn.setAttribute('aria-pressed','false');
  });

  /* "Hakkımda" sayacı — başlangıç değeri markup'a yazılmaz, ölçülür */
  var bio = document.getElementById('hsBio'), cnt = document.getElementById('bioCount');
  if(bio && cnt){
    var sync = function(){ cnt.textContent = bio.value.length + ' / 160'; };
    bio.addEventListener('input', sync); sync();
  }

  /* =====================================================================
   K1 · ALTI FORM GERÇEKTEN KAYDEDİYOR
   Eskiden bu işleyici yalnız `.hs-saved` rozetini gösteriyordu — 0
   `localStorage` yazması vardı, sayfa yenilenince "Kaydedildi" yalanı
   ortaya çıkıyordu. Şimdi doğrulama geçen her form kendi kartını
   `dm_fit_hesap_v1`e yazıyor ve sayfa açılışında GERİ OKUNUYOR.
   Şema: { surum:1, kartlar:{ "<kart>": {alanId:deger} }, guncelleme:ISO }
   `dm_user`a DOKUNULMAZ — tek anahtar `dm_fit_hesap_v1`.

   Şifre alanları (pwCur/pwNew/pwNew2) BİLEREK YAZILMAZ: düz metin şifreyi
   localStorage'a koymak, mock bile olsa, kendi başına bir güvenlik
   kusurudur. O kart için "kaydedildi" iddiası alan/değer eşleşmesi yerine
   gerçek bir davranışla karşılanıyor: eşleşme doğrulaması + "Son şifre
   değişikliği" notunun güncellenmesi + alanların temizlenmesi.

   Ülke kodu (`.fk-cc-pop`) ve doğum tarihi takvimi (`.fk-tar-pop`)
   popover'larının İÇİNDEKİ yardımcı alanlar (arama kutusu, ay/yıl seçici)
   kayıt kapsamı DIŞINDA tutulur — bunlar görünüm durumu, veri değil. */
  var HS_ANAHTAR = 'dm_fit_hesap_v1';
  function hsOku(){
    try{ var v = JSON.parse(localStorage.getItem(HS_ANAHTAR) || 'null'); return (v && v.kartlar) ? v.kartlar : {}; }
    catch(e){ return {}; }
  }
  function hsYaz(kart, alanlar){
    try{
      var kayit = JSON.parse(localStorage.getItem(HS_ANAHTAR) || 'null');
      if(!kayit || typeof kayit !== 'object') kayit = {surum:1, kartlar:{}};
      if(!kayit.kartlar) kayit.kartlar = {};
      kayit.kartlar[kart] = alanlar;
      kayit.guncelleme = new Date().toISOString();
      localStorage.setItem(HS_ANAHTAR, JSON.stringify(kayit));
    }catch(e){}
  }
  function hsAlanDeger(el){ return el.type === 'checkbox' ? el.checked : el.value; }
  function hsAlanUygula(el, deger){ if(el.type === 'checkbox') el.checked = !!deger; else el.value = deger; }

  var hsKayitli = hsOku();

  document.querySelectorAll('form[data-savecard]').forEach(function(f){
    var kart = f.getAttribute('data-savecard');
    if(!kart) return;

    function hsAlanlar(){
      var liste = [];
      f.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
        if(el.type === 'password') return;
        if(el.closest('.alan-ulke-katman, .alan-tarih-katman')) return;
        liste.push(el);
      });
      return liste;
    }

    /* GERİ OKUMA — sayfa açılışında kayıtlı değer varsa uygulanır. */
    var kayitliAlan = hsKayitli[kart];
    if(kayitliAlan){
      hsAlanlar().forEach(function(el){
        if(!Object.prototype.hasOwnProperty.call(kayitliAlan, el.id)) return;
        hsAlanUygula(el, kayitliAlan[el.id]);
        try{ el.dispatchEvent(new Event(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', {bubbles:true})); }catch(e){}
      });
    }

    f.addEventListener('submit', function(e){
      e.preventDefault();
      /* doğrulama — boş/geçersiz formda "Kaydedildi" YAZMAZ */
      var gecti = false;
      try{ gecti = f.reportValidity(); }catch(hata){ gecti = false; }
      if(!gecti) return;

      if(kart === 'guvenlik-sifre'){
        var yeni = f.querySelector('#pwNew'), tekrar = f.querySelector('#pwNew2');
        if(yeni && tekrar && yeni.value !== tekrar.value){
          tekrar.focus();
          return; /* eşleşmiyor — "Kaydedildi" gösterme */
        }
        var not = f.querySelector('.kart-alt .not');
        if(not) not.textContent = 'Son şifre değişikliği: az önce';
        f.reset();
      } else {
        var alanlar = {};
        hsAlanlar().forEach(function(el){ alanlar[el.id] = hsAlanDeger(el); });
        hsYaz(kart, alanlar);
      }

      var ok = f.querySelector('.kaydedildi');
      if(!ok) return;
      ok.classList.add('show');
      clearTimeout(ok._t);
      ok._t = setTimeout(function(){ ok.classList.remove('show'); }, 2500);
    });
  });

  /* İki Adımlı Doğrulama formunun kendi kaydet düğmesi/`.hs-saved`i yok
     (bkz. markup) — checkbox `submit` olayını tetiklemez. Bu kart o yüzden
     değişince ANINDA yazar; K19'daki izin anahtarlarıyla aynı desen. */
  var gv2fa = document.getElementById('gv2fa');
  if(gv2fa) gv2fa.addEventListener('change', function(){ hsYaz('2fa', {gv2fa: gv2fa.checked}); });

  /* ÖLÜ YORUM SÖKÜLDÜ — fatura bilgileri formunun tip davranışını
     anlatıyordu; form `odemelerim-v1.html`e taşındı ve orada segment
     denetimiyle yeniden kuruldu. */


  /* KALEM #5 · fatura yüzeyi bu sayfadan tamamen kalktı: defter ve belge
     penceresi `odemelerim-v1.html#faturalar`ta. Eski `[data-demo-dl]`
     işleyicisi çoktan sökülmüştü; artık tükettiği markup da yok. */

  /* R12 EK TUR · R22 — kapak/avatar düğmeleri (profil kartı) gerçek dosya
     yüklemez; sahte bir yükleme akışı taklit ETMEZ (Beyar'ın kararı) —
     `data-demo-dl`/fatura ile aynı dürüst-durum kalıbı: tek satır metin,
     birkaç saniye sonra varsayılana döner. */
  
/* ── BÖLÜM · KALEM #1 · FOTOĞRAF YÜKLEME YÜZEYİ ─────────────────────
   GEREKÇE: kapi-acilir: "Kapağı Değiştir" ve avatar (data-photo-edit) çıktıda AÇILMIYOR. .fp-ava-edit/.kapak-duzenle → #fotoModal · FIT_MODAL@14393 */
/* =====================================================================
   KALEM #1 · FOTOĞRAF YÜKLEME YÜZEYİ
   Eski hâl burada yalnız bir durum metni basıyordu. Şimdi gerçek bir
   seçim akışı var: dosya seç → önizle → çerçevele → uygula.
   ⚠ Dosya sunucuya GİTMEZ (Fit'te backend yok). Doğrulama tarayıcıda
   yapılır ve ölçüler Dalga 2'de TÜRETİLEN kurallardır (avatar 200×200 ·
   kapak 1176×240 = --wrap 1240 − 2×32 · ikisi de en çok 5 MB).
   ===================================================================== */
  var fotoDurum = document.getElementById('fotoDurum');
  var fotoVarsayilan = fotoDurum ? fotoDurum.querySelector('span').textContent : '';

  var KURAL = {
    avatar:{ad:'Profil Fotoğrafı', enAz:[200,200], oran:'kare',
            alt:'JPG, PNG veya WebP · en az 200×200 px · en çok 5 MB. Kare kırpılır.'},
    kapak :{ad:'Kapak Fotoğrafı',  enAz:[1176,240], oran:'şerit',
            alt:'JPG, PNG veya WebP · en az 1176×240 px · en çok 5 MB. Şerit olarak kırpılır.'}
  };
  var MB = 5 * 1024 * 1024;

  var fm = (window.FIT_MODAL && FIT_MODAL.kur({
    kap:'#fotoModal', panel:'.fb-panel', ortu:'#fotoOverlay', kapat:'#fotoClose',
    kapaninca: function(){ temizle(); }
  })) || null;

  var $ = function(id){ return document.getElementById(id); };
  var drop=$('fyDrop'), file=$('fyFile'), stage=$('fyStage'), frame=$('fyFrame'),
      img=$('fyImg'), durum=$('fyDurum'), uygula=$('fyUygula'), vazgec=$('fyVazgec'),
      olcek=$('fyOlcek'), kaldir=$('fyKaldir'), kaldirEtiket=$('fyKaldirEtiket');
  var hedef='avatar', nesneUrl=null, secili=null;

  function yaz(metin, hataMi){
    if(!durum) return;
    durum.classList.toggle('blocked', !!hataMi);
    durum.querySelector('span').textContent = metin;
    durum.querySelector('i').className = hataMi
      ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-info';
  }
  function temizle(){
    if(nesneUrl){ URL.revokeObjectURL(nesneUrl); nesneUrl=null; }
    secili=null; if(file) file.value='';
    if(stage) stage.hidden=true; if(drop) drop.hidden=false;
    if(uygula) uygula.disabled=true;
    if(olcek) olcek.value=100;
    if(img) img.style.transform='scale(1)';
    yaz('Henüz dosya seçmedin.', false);
  }
  function boyutMetni(b){
    return b < 1024*1024 ? Math.round(b/1024)+' KB' : (b/1024/1024).toFixed(1).replace('.',',')+' MB';
  }
  function al(dosya){
    if(!dosya) return;
    var k = KURAL[hedef];
    if(['image/jpeg','image/png','image/webp'].indexOf(dosya.type) < 0){
      yaz('Bu dosya türü kabul edilmiyor. JPG, PNG veya WebP seç.', true); return;
    }
    if(dosya.size > MB){
      yaz('Dosya çok büyük ('+boyutMetni(dosya.size)+'). En çok 5 MB olabilir.', true); return;
    }
    if(nesneUrl) URL.revokeObjectURL(nesneUrl);
    nesneUrl = URL.createObjectURL(dosya);
    var test = new Image();
    test.onload = function(){
      if(test.naturalWidth < k.enAz[0] || test.naturalHeight < k.enAz[1]){
        yaz('Görsel çok küçük ('+test.naturalWidth+'×'+test.naturalHeight+' px). '+
            k.ad.toLocaleLowerCase('tr')+' için en az '+k.enAz[0]+'×'+k.enAz[1]+' px gerekiyor.', true);
        URL.revokeObjectURL(nesneUrl); nesneUrl=null; return;
      }
      secili = dosya;
      img.src = nesneUrl;
      $('fyAd').textContent = dosya.name;
      $('fyBoyut').textContent = boyutMetni(dosya.size);
      $('fyOlcu').textContent = test.naturalWidth+'×'+test.naturalHeight+' px';
      $('fyKirp').textContent = k.oran;
      drop.hidden=true; stage.hidden=false; uygula.disabled=false;
      yaz('Görsel hazır. Çerçevede kalacak bölümü seçip uygulayabilirsin.', false);
    };
    test.onerror = function(){ yaz('Görsel okunamadı; başka bir dosya dene.', true); };
    test.src = nesneUrl;
  }

  if(drop){
    ['dragenter','dragover'].forEach(function(e){
      drop.addEventListener(e, function(ev){ ev.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave','drop'].forEach(function(e){
      drop.addEventListener(e, function(ev){ ev.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function(ev){
      if(ev.dataTransfer && ev.dataTransfer.files) al(ev.dataTransfer.files[0]);
    });
  }
  if(file) file.addEventListener('change', function(){ al(file.files[0]); });
  if(olcek && img) olcek.addEventListener('input', function(){
    img.style.transform = 'scale('+(olcek.value/100)+')';
  });
  if(vazgec && fm) vazgec.addEventListener('click', function(){ fm.kapat(); });

  /* Sayfa üstündeki durum satırı — uygula ve kaldır aynı yardımcıyı
     kullanır ki iki eylem iki farklı dille konuşmasın. */
  function sayfaDurumu(metin){
    if(!fotoDurum) return;
    fotoDurum.classList.add('tamam');
    fotoDurum.querySelector('span').textContent = metin;
    clearTimeout(fotoDurum._t);
    fotoDurum._t = setTimeout(function(){
      fotoDurum.classList.remove('tamam');
      fotoDurum.querySelector('span').textContent = fotoVarsayilan;
    }, 8000);
  }
  function hedefElemani(){
    return hedef==='kapak' ? document.querySelector('.kapak')
                           : document.querySelector('.kimlik-avatar');
  }
  /* Görsel şu an duruyor mu? "Kaldır" düğmesinin görünürlüğü buna bağlı. */
  function gorselVar(el){
    if(!el) return false;
    if(el.classList.contains('is-bos')) return false;
    return hedef==='kapak'
      ? (el.style.getPropertyValue('--px-img') || getComputedStyle(el).getPropertyValue('--px-img') || '').trim() !== ''
      : (el.style.backgroundImage || '') !== '' && el.style.backgroundImage !== 'none';
  }

  /* =====================================================================
   KALDIR — GERÇEKTEN kaldırır, ama HESABA KAYDETMEZ ve bunu söyler
   ---------------------------------------------------------------------
   🔴 DÜRÜSTLÜK KARARI (gerekçe raporda): kalıcı kaldırma bu depoda
   MÜMKÜN DEĞİL. Avatar ve kapak bu sayfada işaretlemede duruyor ama
   kabuğun üst çubuğu ile hesap menüsü kendi `AVA` sabitinden okuyor
   (fit-shell.js) ve o dosyaya yazmak bu ajana yasak. localStorage'a
   yazsaydım bu sayfada kalkan fotoğraf öteki 66 sayfada duruyor olurdu —
   yani kalıcılık YALANI, üstelik kullanıcının hata sanacağı bir çelişki.
   Bu yüzden: kaldırma EKRANDA gerçekten olur (görsel gider, yerine
   varsayılan gelir, düğme kaybolur), durum satırı da hesaba
   kaydedilMEDİĞİNİ ve yenileyince geri geleceğini açıkça yazar.
   "Yakında" YAZILMAZ; sahte bir başarı da basılmaz.
   ===================================================================== */
  if(kaldir) kaldir.addEventListener('click', function(){
    var el = hedefElemani();
    if(!el) return;
    if(hedef==='kapak'){ el.style.setProperty('--px-img','none'); }
    else { el.style.backgroundImage='none'; }
    el.classList.add('is-bos');
    kaldir.hidden = true;
    sayfaDurumu(KURAL[hedef].ad + ' bu ekranda kaldırıldı ve yerine varsayılan geldi. ' +
      'Hesabına KAYDEDİLMEDİ — makette sunucu yok; sayfayı yenilediğinde eski görsel geri gelir.');
    if(fm) fm.kapat();
  });

  if(uygula) uygula.addEventListener('click', function(){
    if(!secili || !nesneUrl) return;
    var hedefEl = hedefElemani();
    if(hedefEl){
      hedefEl.classList.remove('is-bos');
      if(hedef==='kapak') hedefEl.style.setProperty('--px-img', "url('"+nesneUrl+"')");
      else hedefEl.style.backgroundImage = "url('"+nesneUrl+"')";
    }
    nesneUrl = null;   /* görsel artık sayfada kullanılıyor, serbest bırakılmaz */
    sayfaDurumu(KURAL[hedef].ad + ' bu ekranda güncellendi. Makette dosya sunucuya ' +
      'gönderilmez ve hesabına kaydedilmez; sayfayı yenilediğinde eski görsel geri gelir.');
    if(fm) fm.kapat();
  });

  document.querySelectorAll('[data-photo-edit]').forEach(function(b){
    b.addEventListener('click', function(){
      hedef = b.getAttribute('data-photo-edit') === 'kapak' ? 'kapak' : 'avatar';
      var k = KURAL[hedef];
      $('fotoModalTitle').textContent = k.ad;
      $('fotoModalSub').textContent = k.alt;
      if(frame) frame.classList.toggle('kapak', hedef==='kapak');
      /* Kaldır düğmesi yalnız kaldırılacak bir görsel VARKEN basılır ve
         etiketi hedefe göre konuşur ("Fotoğrafı" / "Kapağı"). */
      if(kaldir){
        kaldir.hidden = !gorselVar(hedefElemani());
        if(kaldirEtiket) kaldirEtiket.textContent =
          hedef==='kapak' ? 'Kapağı Kaldır' : 'Fotoğrafı Kaldır';
      }
      temizle();
      if(fm) fm.ac(b);
    });
  });

})();

