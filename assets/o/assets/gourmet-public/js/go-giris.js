/* =====================================================================
   KİMLİK EKRANLARININ SAYFA JS'İ — go-giris.html grameri
   (/giris · /kayit · /sifremi-unuttum · /sifre-yenile)
   =====================================================================

   KAYNAK: https://gaviaworks-dev.github.io/DadaMentor/Gourmet/go-giris.html
   gövdesindeki SATIR İÇİ betik (18.523 B, ham HTML'den çıkarıldı 2026-09-15;
   sayfanın kendi md5'i af54918cf1ada21f781d1b778b00ec81). Donörde bu betiğin
   ayrı bir dosya adı YOK — bu yüzden vendor-denetim'in eşleşme tablosuna
   girmez; sadakat ölçütü satır içi kaynağın kendisidir.

   ---------------------------------------------------------------------
   NEDEN KANON `kimlik.js` / `ulke.js` KULLANILMIYOR
   ---------------------------------------------------------------------
   İkisi de bayt bayt vendor edilmiş kanon (`kimlik-v1.js` → `kimlik.js`,
   `ulke-v1.js` → `ulke.js`) ve DOKUNULMADI. Ama ikisi de `kimlik.css`in
   `.fk-*` grameri için yazılmış: `.fk-cc*`, `.fk-eye`, `.fk-pass`,
   `data-giris-yontem` radyo grubu. `go-giris.html` o CSS'i hiç yüklemiyor;
   gramer `gourmet-ekran.css` içindeki `.alan-*` ailesi. Kanon dosyalara
   ikinci gramer eklemek onları sahte vendor'a çevirirdi
   (.ai/rules/assets.md). İki gramer → iki dosya.
   `/yonetim/giris` hâlâ eski gramerde ve kanon ikiliyi olduğu gibi kullanıyor.

   ---------------------------------------------------------------------
   TAŞINAN — donörün gövdesiyle birebir
   ---------------------------------------------------------------------
   · `.alan-goz` şifre göster/gizle (aria-pressed dâhil)
   · `segSet` / `segGet` segment yardımcıları
   · `#giSeg` e-posta ↔ telefon geçişi
   · `#giAsSeg` / `#kaRoleSeg` rol segmentleri
   · `fmtTel` TR telefon maskesi
   · `clearError` / `markError` / `isBad` / `validate` alan doğrulaması
   · ülke kodu açılır listesi (aç/kapa · süz · seç)
   · `#ysKurallar` canlı şifre kuralı listesi

   ---------------------------------------------------------------------
   TAŞINMAYAN — hepsi MAKET; bizde gerçek Laravel akışı var
   ---------------------------------------------------------------------
   (.ai/rules/views.md: "donörde MAKET olan bizde GERÇEK çalışıyorsa
   donöre uymak işlevi bozar")
   · `show()` sekme/pano değiştirici + `[data-goto]` köprüleri — donörde
     beş pano tek belgede; bizde dördü AYRI ROTA, sekmeler gerçek `<a>`.
     Sunucu hangi ekranın açık olduğunu kendisi basar, JS'siz de çalışır.
   · `fGiris`/`fKayit`/`fSifre`/`formYeniSifre` submit yakalayıcıları —
     hepsi `e.preventDefault()` + `location.href` ile SAHTE oturum açıyor
     (`?auth=1` → `maket-auth.js`). Bizde form gerçekten POST ediyor,
     oturumu `Auth::login()` açıyor ve denetim kaydı yazılıyor.
   · `ROLE_DEST` / `withAuth()` / `returnDest()` / `?auth=1` sözleşmesi.
   · `.sosyal-dugme` yönlendirmeleri — sağlayıcı anahtarımız yok; düğmeler
     `aria-disabled` basılıyor, tıklanınca bir yere gitmiyor.
   · `?tab=` · `?err=1` · `?sent=1` · `?ok=1` · `?durum=` · `?hesap=` ·
     `?role=isletme` demo parametreleri — durumu sunucu basıyor.
   · `#sifreOk` / `#ysOk` / `#kayitOk` başarı panoları — bizde başarı
     yönlendirme + flash ile geliyor, JS ile açılan pano yok.
   · `#auPaneDogrula` (e-posta doğrulama) — bizde karşılığı olan bir rota yok.

   ---------------------------------------------------------------------
   İŞARETLİ UYARLAMALAR — her biri gerekçesiyle, bulunduğu blokta da yazılı
   ---------------------------------------------------------------------
   U1 · segment değeri gizli alana yazılır (donörde sunucu yok, değer
        hiçbir yere gitmiyordu).
   U2 · giriş yönteminde `disabled` de sürülür (iki kutu da `name="eposta"`;
        donörde name'ler ayrıydı ve sunucu yoktu).
   U3 · telefon maskesi yalnız TR iken koşar (numara gerçekten kolona
        yazılıyor; donörün ülkeden bağımsız maskesi yabancı numarayı bozardı).
   U4 · `markError` kanon CSS'in gerçekten tepki verdiği sınıfları da sürer
        (`.alan-girdi.hatali` + `.giris-hata.acik`); donörün tek başına
        bastığı `.has-error` sınıfının `gourmet-ekran.css`te KARŞILIĞI YOK
        — ölçüldü, 0 kural. Donör kusuru, taşınırken bağlandı.
   U5 · (8.7, 2026-09-15: KAPANDI) donörün beş kuralının BEŞİ de burada ve
        sunucuyla birebir: `KayitIstegi`/`SifreYenilemeIstegi` →
        `Password::min(8)->mixedCase()->numbers()->symbols()`. Eşik 8 (donörün
        kendi değeri), `ozel` kuralı da basılıyor.
   U6 · `#ysGonder` markup'ta `disabled` DOĞMAZ; JS bağlandıktan sonra
        kilitler. Donörde sunucu yok, JS'siz gönderim anlamsızdı; bizde
        `disabled` doğsa JS'siz tarayıcı şifresini hiç yenileyemezdi.
   U7 · doğrulama başarılıysa submit ENGELLENMEZ — gerçek POST geçer.
   ===================================================================== */
(function () {
  var kart = document.querySelector('.giris-kart');
  if (!kart) { return; }

  /* ---- şifre göster/gizle — aria-pressed durumu da taşır ---- */
  document.querySelectorAll('.alan-goz').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inp = document.getElementById(btn.getAttribute('data-eye'));
      if (!inp) { return; }
      var i = btn.querySelector('i');
      var showing = inp.type === 'text';
      inp.type = showing ? 'password' : 'text';
      if (i) {
        i.classList.toggle('fa-eye', showing);
        i.classList.toggle('fa-eye-slash', !showing);
      }
      btn.setAttribute('aria-label', showing ? 'Şifreyi göster' : 'Şifreyi gizle');
      btn.setAttribute('aria-pressed', showing ? 'false' : 'true');
    });
  });

  /* ---- segment yardımcıları: role="group" + aria-pressed (tablist DEĞİL) ---- */
  function segSet(seg, attr, val) {
    if (!seg) { return; }
    seg.querySelectorAll('button').forEach(function (x) {
      var on = x.getAttribute(attr) === val;
      x.classList.toggle('aktif', on);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function segGet(seg, attr, fallback) {
    var b = seg && seg.querySelector('button.aktif');
    return (b && b.getAttribute(attr)) || fallback;
  }

  /* U1 — segmentin seçimi sunucuya gizli alanla gider. Alanın adı segmentin
     `data-hedef`i; donörde böyle bir alan yoktu çünkü arka uç yoktu. */
  function gizliYaz(seg, ad, deger) {
    var form = seg && seg.closest('form');
    var gizli = form && form.querySelector('input[type="hidden"][name="' + ad + '"]');
    if (gizli) { gizli.value = deger; }
  }

  /* ---- ALAN DOĞRULAMA ----
     Hata YALNIZ renkle anlatılmıyor: metin + ikon + aria-invalid + odak. */
  function clearError(field) {
    if (!field) { return; }
    field.classList.remove('has-error');
    field.querySelectorAll('.alan-girdi').forEach(function (i) {
      i.removeAttribute('aria-invalid');
      i.classList.remove('hatali');           /* U4 */
    });
    field.querySelectorAll('.giris-hata').forEach(function (s) {
      s.classList.remove('acik');             /* U4 */
    });
  }
  function markError(field, bad) {
    if (!field) { return; }
    field.classList.toggle('has-error', bad);
    field.querySelectorAll('.alan-girdi').forEach(function (i) {
      if (bad) { i.setAttribute('aria-invalid', 'true'); } else { i.removeAttribute('aria-invalid'); }
      i.classList.toggle('hatali', bad);      /* U4 */
    });
    /* U4 — donör yalnız `.has-error` basıyor ama `gourmet-ekran.css`te o adla
       TEK BİR kural yok (ölçüldü). Mesajı gerçekten gösteren `.giris-hata.acik`,
       kutuyu kızartan `.alan-girdi.hatali`. Bağlanmasaydı donörün alan düzeyi
       hata yüzeyi bizde de ölü kalırdı. Sunucu hatası varken şerit zaten
       sunucudan `.acik` basılıyor; burada yalnız istemci kontrolü sürülür. */
    var mesaj = field.querySelector('.giris-hata');
    if (mesaj && !mesaj.hasAttribute('data-sunucu')) { mesaj.classList.toggle('acik', bad); }
  }
  function isBad(inp) {
    var v = inp.value.trim();
    if (!v) { return true; }
    if (inp.type === 'email') { return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    if (inp.type === 'tel') { return v.replace(/\D/g, '').length < 10; }
    /* U5 (8.7 ile KAPANDI) — eşik artık donörün kendi değeri (8) ve sunucu
       kuralı da öyle: Password::min(8). Sayı markup'tan okunur, buradaki
       ,10 parseInt'in TABANI (radix), eşik DEĞİL. */
    if (inp.getAttribute('data-sifre-esigi')) { return v.length < parseInt(inp.getAttribute('data-sifre-esigi'), 10); }
    return false;
  }
  function validate(form) {
    var first = null;
    /* `[data-tel-mask]` seçiciye 2026-09-16'da eklendi: kayıtta telefon İSTEĞE BAĞLI oldu,
       yani `required` taşımıyor ve eski seçici onu hiç görmüyordu. Boş bırakılan numara
       kapı DEĞİL (aşağıdaki erken dönüş), ama DOLU bir numara hatalıysa donörün alan düzeyi
       uyarısı sürsün — sunucu kuralı da doluyken biçimi denetliyor (`KayitIstegi`). */
    form.querySelectorAll('.alan-girdi[required], .alan-girdi[data-tel-mask]').forEach(function (inp) {
      var field = inp.closest('.alan');
      if (field && field.hidden) { return; }
      if (inp.disabled) { return; }
      /* isteğe bağlı ve boş → denetlenmez, hata da temizlenir */
      if (!inp.hasAttribute('required') && !inp.value.trim()) { clearError(field); return; }
      var bad = isBad(inp);
      markError(field, bad);
      if (bad && !first) { first = inp; }
    });
    var missed = [];
    form.querySelectorAll('.onay-kutusu input[type="checkbox"][required]').forEach(function (c) {
      if (!c.checked) { missed.push(c); }
    });
    var box = form.querySelector('.form');
    if (box) {
      var txt = box.querySelector('span');
      if (missed.length) {
        txt.textContent = missed.length > 1
          ? 'Devam etmek için zorunlu onayları işaretle (' + missed.length + ' onay eksik).'
          : 'Devam etmek için zorunlu onayı işaretle.';
        box.classList.add('acik');
      } else {
        txt.textContent = ''; box.classList.remove('acik');
      }
    }
    if (!first && missed.length) { first = missed[0]; }
    if (first) { try { first.focus(); } catch (e) { /* eski tarayıcı */ } return false; }
    return true;
  }
  document.querySelectorAll('.giris-kart .alan-girdi').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var f = inp.closest('.alan');
      if (f && f.classList.contains('has-error') && !isBad(inp)) { clearError(f); }
    });
  });
  document.querySelectorAll('.onay-kutusu input[type="checkbox"]').forEach(function (c) {
    c.addEventListener('change', function () {
      var form = c.closest('form'), box = form && form.querySelector('.form');
      if (!box || !box.classList.contains('acik')) { return; }
      var left = 0;
      form.querySelectorAll('.onay-kutusu input[type="checkbox"][required]').forEach(function (x) { if (!x.checked) { left++; } });
      if (!left) { box.classList.remove('acik'); box.querySelector('span').textContent = ''; }
    });
  });
  /* U7 — donör submit'i KESİP sahte oturum açıyordu. Bizde gerçek POST var:
     yalnız istemci hatası varsa durdurulur, temizse istek sunucuya gider. */
  kart.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!validate(form)) { e.preventDefault(); }
    });
  });

  /* ---- e-posta / telefon giriş geçişi — alanı değiştir, required'ı taşı ---- */
  var giSeg = document.getElementById('giSeg');
  if (giSeg) {
    var giEmailF = document.getElementById('giEmailField');
    var giTelF = document.getElementById('giTelField');
    var giEmail = document.getElementById('giEmail');
    var giTel = document.getElementById('giTel');
    /* Donörün radyo değerleri `email`/`tel`; sunucu alan sözleşmemiz Türkçe. */
    var YONTEM = { email: 'eposta', tel: 'telefon' };
    giSeg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-gimode');
        segSet(giSeg, 'data-gimode', mode);
        var tel = mode === 'tel';
        giEmailF.hidden = tel; giTelF.hidden = !tel;
        if (tel) { giEmail.removeAttribute('required'); giTel.setAttribute('required', ''); }
        else { giTel.removeAttribute('required'); giEmail.setAttribute('required', ''); }
        /* U2 — `disabled` ŞART: iki kutu da `name="eposta"` taşıyor (sunucu tek
           kimlik alanı bekliyor). `hidden` alanı gönderimden ÇIKARMAZ; gizli ama
           gönderilen boş kutu, dolu olanı EZERDİ. Donörde name'ler ayrıydı
           (giEmail/giTel) ve zaten hiçbir yere gönderilmiyordu. */
        giEmail.disabled = tel;
        giTel.disabled = !tel;
        giTelF.querySelectorAll('input[type="hidden"]').forEach(function (h) { h.disabled = !tel; });
        gizliYaz(giSeg, 'giris_yontemi', YONTEM[mode] || 'eposta');   /* U1 */
        clearError(giEmailF); clearError(giTelF);
      });
    });
  }

  /* ---- rol segmentleri ----
     Donörde `ROLE_DEST` haritası vardı ve seçim maket yönlendirmesini belirliyordu;
     o harita TAŞINMADI (maket). Segmentin kendisi kalıyor: seçim gizli alana yazılır. */
  var kaRoleSeg = document.getElementById('kaRoleSeg');
  if (kaRoleSeg) {
    kaRoleSeg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        segSet(kaRoleSeg, 'data-karole', b.getAttribute('data-karole'));
        gizliYaz(kaRoleSeg, 'hesap_turu', b.getAttribute('data-karole'));   /* U1 */
      });
    });
  }
  var giAsSeg = document.getElementById('giAsSeg');
  if (giAsSeg) {
    giAsSeg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        segSet(giAsSeg, 'data-as', b.getAttribute('data-as'));
        gizliYaz(giAsSeg, 'hesap_turu', b.getAttribute('data-as'));   /* U1 */
      });
    });
  }

  /* ---- TR telefon maskesi (5xx xxx xx xx) — [data-tel-mask] ---- */
  function fmtTel(v) {
    var d = v.replace(/\D/g, '');
    if (d.length && d[0] === '0') { d = d.slice(1); }
    if (d.length && d[0] === '9' && d.slice(0, 2) === '90') { d = d.slice(2); }
    d = d.slice(0, 10);
    var out = d.slice(0, 3);
    if (d.length > 3) { out += ' ' + d.slice(3, 6); }
    if (d.length > 6) { out += ' ' + d.slice(6, 8); }
    if (d.length > 8) { out += ' ' + d.slice(8, 10); }
    return out;
  }
  document.querySelectorAll('[data-tel-mask]').forEach(function (inp) {
    /* U3 — donör maskeyi ÜLKEDEN BAĞIMSIZ uyguluyor. Orada zararsızdı (prototip
       hiçbir şey saklamıyor); burada DEĞİL: numara `kimlik_hesaplar.telefon`
       kolonuna yazılıyor ve TR maskesi bir Fransız numarasını baştaki hanesini
       atıp 10 haneye kırparak BOZARDI. Kanon `ulke.js` de aynı sapmayı aynı
       gerekçeyle taşıyor. Görünen davranış varsayılan durumda (TR) donörle AYNI. */
    var kok = inp.closest('[data-cc-kok]');
    var gizli = kok && kok.querySelector('input[type="hidden"]');
    var trMi = function () { return !gizli || gizli.value === 'TR'; };
    if (trMi()) { inp.value = fmtTel(inp.value); }
    inp.addEventListener('input', function () {
      if (!trMi()) { return; }
      inp.value = fmtTel(inp.value);
      try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) { /* eski tarayıcı */ }
    });
  });

  /* ---- ÜLKE KODLU TELEFON — açılır liste davranışı ----
     🔴 LİSTE MARKUP'TA, BETİK ONU ÜRETMEZ — YALNIZ SÜZER.
     199 kalem gövdede statik duruyor (donörde de öyle; bizde sunucu basıyor,
     veri `App\Kimlik\Ulkeler`); bu blok yalnız aç/kapa, süz ve seç işini yapar. */
  document.querySelectorAll('[data-ulke-kok],[data-cc-kok]').forEach(function (kok) {
    var dugme = kok.querySelector('.alan-ulke,.fk-cc');
    var katman = kok.querySelector('.alan-ulke-katman,.fk-cc-pop');
    var liste = kok.querySelector('.alan-ulke-liste,.fk-cc-list');
    var ara = kok.querySelector('.alan-ulke-arama input,.fk-cc-search input');
    var bos = kok.querySelector('.alan-ulke-bos,.fk-cc-bos');
    if (!dugme || !katman || !liste) { return; }
    var kalemler = [].slice.call(liste.querySelectorAll('li'));
    function kapat() { katman.hidden = true; dugme.setAttribute('aria-expanded', 'false'); }
    function ciz(q) {
      q = (q || '').toLocaleLowerCase('tr'); var n = 0;
      kalemler.forEach(function (li) {
        var ad = (li.querySelector('.ad') || { textContent: '' }).textContent.toLocaleLowerCase('tr');
        var kod = (li.querySelector('.kod') || { textContent: '' }).textContent;
        var gor = !q || ad.indexOf(q) >= 0 || kod.indexOf(q) >= 0; li.hidden = !gor; if (gor) { n++; }
      });
      if (bos) { bos.hidden = n > 0; }
    }
    kalemler.forEach(function (li) {
      li.tabIndex = -1;
      li.addEventListener('click', function () {
        var bayrak = kok.querySelector('.alan-ulke-bayrak,.fk-cc-flag');
        var kodEl = kok.querySelector('.alan-ulke-kod,.fk-cc-dial');
        var b = li.querySelector('.bayrak,.bay'), k = li.querySelector('.kod');
        if (bayrak && b) { bayrak.textContent = b.textContent; }
        if (kodEl && k) { kodEl.textContent = k.textContent; }
        var hd = kok.querySelector('input[type=hidden]'); if (hd) { hd.value = li.getAttribute('data-iso'); }
        kalemler.forEach(function (x) {
          x.setAttribute('aria-selected', x === li ? 'true' : 'false');
          x.classList.toggle('secili', x === li);
        });
        /* Donörde yok: ülke değişince düğmenin erişilebilir adı eskide kalıyordu. */
        var ad = li.querySelector('.ad');
        if (ad && k) { dugme.setAttribute('aria-label', 'Ülke kodu — şu an ' + ad.textContent + ' ' + k.textContent); }
        kapat(); dugme.focus();
      });
    });
    dugme.addEventListener('click', function () {
      if (katman.hidden) {
        katman.hidden = false; dugme.setAttribute('aria-expanded', 'true');
        ciz(''); if (ara) { ara.value = ''; ara.focus(); }
      } else { kapat(); }
    });
    if (ara) { ara.addEventListener('input', function () { ciz(ara.value); }); }
    addEventListener('click', function (e) { if (!kok.contains(e.target)) { kapat(); } });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') { kapat(); } });
  });

  /* ---- YENİ ŞİFRE BELİRLEME — canlı kural listesi ---- */
  (function () {
    var yeni = document.getElementById('ysYeni'), tekrar = document.getElementById('ysTekrar'),
      gonder = document.getElementById('ysGonder'),
      err = document.getElementById('ysTekrarErr'),
      liste = document.getElementById('ysKurallar');
    if (!yeni || !tekrar || !gonder || !liste) { return; }
    /* U5 (8.7, 2026-09-15 — KAPANDI). Kural seti `SifreYenilemeIstegi` ile
       BİREBİR olmak ZORUNDA; ayrışırsa ekran ya sunucunun kabul etmeyeceği bir
       şifreyi "geçerli" gösterir ya da geçerli bir şifreyle aşağıdaki
       `gonder.disabled` kilidini hiç açmaz.

       Artık donörün BEŞ kuralının beşi de burada: sunucu
       `Password::min(8)->mixedCase()->numbers()->symbols()` (Beyar onayı).

       `ozel` düzeni Laravel'in `symbols()` tanımının aynısıdır — o kural
       `/\p{Z}|\p{S}|\p{P}/u` ile eşliyor (Unicode ayırıcı · sembol · noktalama),
       yani "!@#$" gibi elle yazılmış dar bir liste DEĞİL. Dar liste yazılsaydı
       sunucunun kabul ettiği bir şifre (ör. `Sifre123«`) ekranda geçersiz
       görünürdü. */
    var KURAL = {
      uzunluk: function (v) { return v.length >= 8; },
      buyuk: function (v) { return v !== v.toLocaleLowerCase('tr'); },
      kucuk: function (v) { return v !== v.toLocaleUpperCase('tr'); },
      rakam: function (v) { return /[0-9]/.test(v); },
      ozel: function (v) { return /[\p{Z}\p{S}\p{P}]/u.test(v); }
    };
    function boya() {
      var v = yeni.value, hepsi = true;
      liste.querySelectorAll('li').forEach(function (li) {
        var ad = li.getAttribute('data-kural');
        if (!KURAL[ad]) { return; }
        var gecti = KURAL[ad](v);
        if (!gecti) { hepsi = false; }
        li.classList.toggle('ok', gecti);
        li.querySelector('i').className = gecti
          ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle';
      });
      var esit = tekrar.value.length > 0 && tekrar.value === v;
      if (err) { err.classList.toggle('acik', tekrar.value.length > 0 && !esit); }
      /* U6 — düğme markup'ta `disabled` DOĞMAZ (JS'siz tarayıcı şifresini
         yenileyebilsin); kilit yalnız bu blok bağlandıktan sonra sürülür. */
      gonder.disabled = !(hepsi && esit);
    }
    yeni.addEventListener('input', boya);
    tekrar.addEventListener('input', boya);
    boya();
  })();
})();
