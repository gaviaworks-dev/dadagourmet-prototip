/* Mekân detayı eylemleri. Sonuç yalnız bu tarayıcıda `dgKayit` ile tutulur ve Gurme Panelim'de görünür; hiçbir yere gönderilmez. */
(function () {
  'use strict';
  var K = window.dgKayit, bildir = window.prototipBildir, MEKAN = 'Mikla';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* Sekme rayı. MD-12 (Beyar 11 Kas, "onepage gibi olmuş; tab tab, altı render olacak şekilde olsun"): her sekme kendi bölmesi
     (`#pane-<anahtar>`), rayın altında yalnız etkin bölme görünür. Eski karar (Ne Yenir, Ne Alınır Genel Bakış içinde bölüm, sekme
     bölüme kaydırır; MD-11 · 3b kaydırma izleyicisi) kalktı. Canlı `mekan-detay.js` `showPane` aynen çalışır (sınıf + `?tab=`); bu
     katman onun üstüne şunları ekler:
     - ARIA sekme kalıbı: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`, gezici `tabindex`; ok, Home, End tuşları.
     - Adres: `?tab=<anahtar>` `pushState` ile (Hesabım sekme geçişi H8 gibi); geri/ileri `popstate` ile önceki sekmeye döner,
       sayfa yeniden yüklenmez. Genel Bakış'ta `tab` silinir (canlı gibi). Eski `#mdNeYenir`, `#yorumlar` gibi çapalar da bölmeyi açar.
     - Kaydırma: ray yapışkan değil (R2, `mekan-detay-uyarlama.css`), sayfayla akar. Sekmeye basınca sayfa başa zıplamaz: ray tam
       görünürse kaydırma yok; sabit başlığın altında kalmışsa ray başlığın hemen altına gelir, içerik onun altından başlar.
       `data-pane-link` (eylem çubuğu Değerlendir, Fotoğraf Ekle) her durumda rayı başlığın altına, bölmenin başını görünüme getirir.
     Yakalama evresinde koşar: adres canlı dinleyicinin `replaceState`inden önce yazılır, yığına çift kayıt düşmez */
  var nav = $('#mdTabs'), sekmeler = $$('#mdTabs .dt'), ray = nav && nav.closest('.pf-tabbar');
  var anahtar = function (t) { return t.dataset.pane; };
  var bolme = function (k) { return document.getElementById('pane-' + k); };
  var sekme = function (k) { return sekmeler.filter(function (t) { return anahtar(t) === k; })[0]; };
  var adrestenAl = function () {
    var q = new URLSearchParams(location.search).get('tab');
    if (q && sekme(q) && bolme(q)) { return q; }
    var h = decodeURIComponent(location.hash.slice(1));
    if (h && sekme(h) && bolme(h)) { return h; }
    var e = h && document.getElementById(h), p = e && e.closest('.md-pane');
    return p ? p.id.replace(/^pane-/, '') : 'genel';
  };
  var adresYap = function (k) { var u = new URL(location.href); u.hash = ''; if (k === 'genel') { u.searchParams.delete('tab'); } else { u.searchParams.set('tab', k); } return u.href; };
  /* Sabit başlığın (üst bant + `header.header`) alt kenarı */
  var ustKenar = function () { return $$('header.header, .topbar').reduce(function (m, e) { var p = getComputedStyle(e).position, b = e.getBoundingClientRect().bottom; return (p === 'fixed' || p === 'sticky') && b > m && b < innerHeight / 2 ? b : m; }, 0); };
  /* Hedef: ray sabit başlığın hemen altında, içerik alanı rayın altından başlar */
  var hedefY = function () { return Math.max(0, Math.round(ray.getBoundingClientRect().top + scrollY - ustKenar())); };
  var rayGorunur = function () { var r = nav.getBoundingClientRect(); return r.top >= ustKenar() - 1 && r.bottom <= innerHeight; };
  /* Etkin sekme rayda görünür kalır (canlı satır içi betik gibi). Dar ekranda yatay kayan kutu `.pf-tabbar` (Gastro kiti `display:flex`), `nav` değil */
  var kaydiran = function () { for (var e = nav; e && e !== ray.parentElement; e = e.parentElement) { if (e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX)) { return e; } } return null; };
  var raydaGoster = function (t) { var k = kaydiran(); if (!k) { return; } var r = k.getBoundingClientRect(), b = t.getBoundingClientRect(); if (b.left < r.left || b.right > r.right) { k.scrollLeft += b.left - r.left - (r.width - b.width) / 2; } };
  var goster = function (k) {
    sekmeler.forEach(function (t) {
      var on = anahtar(t) === k, p = bolme(anahtar(t));
      t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (p) { p.classList.toggle('active', on); }
    });
    var s = sekme(k); if (s) { raydaGoster(s); }
  };
  if (nav && sekmeler.length && ray) {
    nav.setAttribute('role', 'tablist');
    sekmeler.forEach(function (t) {
      var k = anahtar(t), p = bolme(k);
      t.id = t.id || 'mdTab-' + k; t.setAttribute('role', 'tab'); t.removeAttribute('aria-current');
      if (p) { t.setAttribute('aria-controls', p.id); p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', t.id); p.tabIndex = 0; }
    });
    var sekmeAc = function (k, kaydir, gecmis) {
      if (!sekme(k)) { return; }
      var gorunur = rayGorunur();
      goster(k);
      if (gecmis) { var u = adresYap(k); if (u !== location.href) { history.pushState({ mdTab: k }, '', u); } }
      if (kaydir === 'her' || (kaydir && !gorunur)) { var y = hedefY(); if (Math.abs(y - scrollY) > 1) { setTimeout(function () { window.scrollTo({ top: y, behavior: kaydir === 'her' ? 'smooth' : 'instant' }); }, 0); } }
    };
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('#mdTabs .dt');
      if (t) { sekmeAc(anahtar(t), true, true); return; }
      var l = e.target.closest && e.target.closest('[data-pane-link]');
      if (l) { sekmeAc(l.getAttribute('data-pane-link'), 'her', true); }
    }, true);
    nav.addEventListener('keydown', function (e) {
      var i = sekmeler.indexOf(e.target), n = sekmeler.length, j;
      if (i < 0) { return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { j = (i + 1) % n; } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { j = (i - 1 + n) % n; } else if (e.key === 'Home') { j = 0; } else if (e.key === 'End') { j = n - 1; } else { return; }
      e.preventDefault(); sekmeler[j].focus(); sekmeler[j].click();
    });
    window.addEventListener('popstate', function () { goster(adrestenAl()); });
    /* Çapa (eski bağlar: `#mdNeYenir`, `#yorumlar`): bölmeyi açar, adresi `?tab=` biçimine çevirir, bölmenin başına götürür */
    var capa = function () {
      if (!location.hash || new URLSearchParams(location.search).get('tab')) { return; }
      var k = adrestenAl(); if (k === 'genel') { return; }
      goster(k); history.replaceState(history.state, '', adresYap(k));
      setTimeout(function () { window.scrollTo({ top: hedefY(), behavior: 'instant' }); }, 0);
    };
    window.addEventListener('hashchange', capa);
    goster(adrestenAl()); capa();
  }

  /* Tabak favorisi */
  var tabakBoya = function (b) {
    var on = K.var('favori', 'tabak-' + b.dataset.favoriTabak), i = $('i', b);
    b.setAttribute('aria-pressed', on ? 'true' : 'false'); i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart'; $('span', b).textContent = on ? 'Favorilerinde' : 'Favoriye Ekle';
  };
  $$('[data-favori-tabak]').forEach(function (b) {
    tabakBoya(b);
    b.addEventListener('click', function () {
      if (!window.dgUye()) { return; }
      var id = 'tabak-' + b.dataset.favoriTabak;
      if (K.var('favori', id)) { K.sil('favori', id); bildir('Favorilerinden çıkarıldı.'); } else { K.ekle('favori', { id: id, tur: 'Tabak', ad: b.dataset.ad.replace(/^Örnek tabak: /, ''), mekan: MEKAN }); bildir('Gurme Favorilerim\'e eklendi.'); }
      tabakBoya(b);
    });
  });

  /* Mekânı kaydet (kapak üstündeki yer imi; canlıda `POST /mekan/{mekan}/kaydet`, tür favori): Gurme Favorilerim'le aynı kayıt (favori ajanı, 11 Kas).
     Misafirde `data-lg-gate` giriş kapısını açar (prototip.js); üyede aç/kapa. Favorilerim'den çıkarılınca burada boş görünür */
  var kaydet = $('.md-stage-acts button[data-lg-gate]'), MID = 'mekan-mikla';
  var kaydetBoya = function () {
    if (!kaydet) { return; }
    var on = K.var('favori', MID), i = $('i', kaydet);
    kaydet.setAttribute('aria-pressed', on ? 'true' : 'false'); if (i) { i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-bookmark'; }
  };
  window.addEventListener('pageshow', function (e) { if (e.persisted) { kaydetBoya(); $$('[data-favori-tabak]').forEach(tabakBoya); } });
  if (kaydet) {
    kaydetBoya();
    kaydet.addEventListener('click', function () {
      if (!window.dgUye()) { return; }
      if (K.var('favori', MID)) { K.sil('favori', MID); bildir('Favorilerinden çıkarıldı.'); } else { K.ekle('favori', { id: MID, tur: 'Mekân', ad: MEKAN, mekan: 'Beyoğlu, İstanbul' }); bildir('Gurme Favorilerim\'e eklendi.'); }
      kaydetBoya();
    });
  }

  /* Değerlendirme. MD-11 · 4 (Beyar 11 Kas, "Gastro'da nasılsa öyle olsun"): Gastro ve canlı Gourmet `#revForm` gibi tek yıldız
     satırı, metin, en fazla 3 fotoğraf; form kapalı başlar, yıldız ya da metin odağıyla açılır. Kayıt tek puanla yazılır (canlı
     `degerlendirmeler.puan`); eski üç kriterli kayıtları okuyan ekranlar `dgDegPuan` ile ortalamaya düşer (prototip.js).
     Moderasyona gider; Dada Puan bekler, onayda kesinleşir */
  var rev = $('#dgRev'), P = window.dgPuan.KURAL, foto = $('#dgRevFoto'), AZAMI = 3;
  if (rev) {
    var metin = $('#dgRevMetin'), yildiz = $('#dgRevYildiz'), ipucu = $('#dgRevIpucu'), onizleme = $('#dgRevFotolar'), puan = 0, dosyalar = [];
    var ac = function () { rev.classList.add('open'); };
    var yorumlu = function () { return !!(metin.value.trim() || dosyalar.length); };
    var kazanc = function () { return P.puanlama + (yorumlu() ? P.yorum : 0); };
    var puanYaz = function () { var y = yorumlu(); $('#dgRevPuan').innerHTML = '<i class="fa-solid fa-award" aria-hidden="true"></i> Puanlama +' + P.puanlama + (y ? ', yorum veya fotoğraf +' + P.yorum : '') + ' = <b>+' + kazanc() + ' bekleyen puan</b>' + (y ? '' : '. Yorum ya da fotoğraf eklersen +' + P.yorum); };
    var onizle = function () {
      [].forEach.call(onizleme.querySelectorAll('.rf-ph'), function (d) { URL.revokeObjectURL(d.dataset.url); });
      onizleme.innerHTML = '';
      dosyalar.forEach(function (f, i) {
        var d = document.createElement('div'), u = URL.createObjectURL(f); d.className = 'rf-ph'; d.dataset.url = u; d.style.backgroundImage = 'url("' + u + '")';
        d.innerHTML = '<button type="button" aria-label="Fotoğrafı kaldır"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
        d.querySelector('button').addEventListener('click', function () { dosyalar.splice(i, 1); onizle(); puanYaz(); });
        onizleme.appendChild(d);
      });
    };
    metin.addEventListener('focus', ac);
    yildiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-yildiz]'); if (!b) { return; }
      puan = +b.dataset.yildiz; ac();
      $$('[data-yildiz]', yildiz).forEach(function (y) { var on = +y.dataset.yildiz <= puan; y.classList.toggle('on', on); y.setAttribute('aria-checked', +y.dataset.yildiz === puan ? 'true' : 'false'); });
      ipucu.className = 'rf-hint ok'; ipucu.textContent = 'Puanın: ' + puan + '/5';
    });
    metin.addEventListener('input', puanYaz);
    foto.addEventListener('change', function () {
      var fazla = false;
      [].forEach.call(foto.files, function (f) { if (dosyalar.length < AZAMI) { dosyalar.push(f); } else { fazla = true; } });
      if (fazla) { bildir('En fazla ' + AZAMI + ' fotoğraf ekleyebilirsin.', 'uyari'); }
      foto.value = ''; ac(); onizle(); puanYaz();
    });
    rev.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!puan) { ac(); ipucu.className = 'rf-hint err'; ipucu.textContent = 'Puan vermeden yorum gönderilemez'; yildiz.classList.add('shake'); setTimeout(function () { yildiz.classList.remove('shake'); }, 450); return; }
      var tutar = kazanc(), id = 'deg-' + Date.now();
      K.ekle('degerlendirme', { id: id, mekan: MEKAN, puan: puan, metin: metin.value.trim(), foto: dosyalar.length > 0, fotoSayi: dosyalar.length, tutar: tutar, durum: 'inceleniyor' });
      window.dgPuan.ekle(id, MEKAN + ' değerlendirmesi', tutar);
      rev.classList.add('sent'); var t = $('#dgRevTamam'); t.hidden = false; $('span', t).textContent = 'Yorumun alındı, denetim sonrası yayınlanacak. Teşekkürler! +' + tutar + ' bekleyen puan onayda kesinleşir.';
    }, true);
    /* Eylem çubuğundaki Değerlendir ve Fotoğraf Ekle formu açar */
    $$('.vd-actbar__act[data-pane-link="yorumlar"]').forEach(function (b) { b.addEventListener('click', function () { if (document.body.classList.contains('is-auth')) { ac(); } }); });
    puanYaz();
  }
  /* Fotoğraf Ekle kısayolu formdaki fotoğraf alanına götürür */
  $$('.vd-actbar__act[data-pane-link="yorumlar"]').forEach(function (b) { if (/Fotoğraf/.test(b.textContent)) { b.addEventListener('click', function () { if (window.dgUye() && foto) { setTimeout(function () { foto.click(); }, 300); } }); } });

  /* Ziyaret Ettim: üyede Ziyaret Geçmişim'e yazar */
  $$('.vd-actbar__act[data-lg-gate]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (/Ziyaret/.test(b.textContent)) { if (!K.var('ziyaret', 'mikla')) { K.ekle('ziyaret', { id: 'mikla', mekan: MEKAN, yer: 'Beyoğlu, İstanbul', gun: new Date().toLocaleDateString('tr-TR') }); } bildir('Ziyaret Geçmişim\'e eklendi.'); }
    });
  });

  /* Listeye Ekle (A8, Beyar 12 Kas): favori kalbinden ayrı akış; canlı `#mdListPop` (liste seç ya da yeni liste, canlı `ListeServisi::mekanaEkle`).
     Popover'ı canlı `mekan-detay.js` açar, konumlar ve dışarı tıklayınca kapatır; burada seçenekler, kayıt, Esc ve odak.
     Listeler: Listelerim örnekleri (`DG_LISTELER`, liste-veri.js) ve bu tarayıcıda kurulanlar (`dgKayit('lstYeniPnl')`, Listelerim'in Yeni liste deposu).
     Kalem `dgKayit('liste-kalem')` (`<liste>|<mekân>`); liste detayı ve Listelerim sayısı bunu okur. Liste detayında kayıtlı sıra varsa mekân sona eklenir.
     Misafirde düğme giriş kapısını açar (`data-lg-gate`, prototip.js yakalama evresi), popover açılmaz */
  var lBtn = $('#mdListBtn'), lPop = $('#mdListPop'), lForm = lPop && $('form', lPop);
  if (lBtn && lPop && lForm) {
    var KATALOG = window.DG_LISTELER || [], SLUG = 'mikla';
    var kac = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
    /* Mekânın satır bilgisi örnek listedeki kalemden (DG_MEKANLAR'dan aynen): tür · ilçe · fiyat */
    var ornekKalem = null; KATALOG.forEach(function (l) { l.kalem.forEach(function (k) { if (k[0] === SLUG) { ornekKalem = k; } }); });
    var ALT = ornekKalem ? [ornekKalem[3], ornekKalem[2], ornekKalem[4]].filter(Boolean).join(' · ') : 'Beyoğlu';
    var durum = function (lid) { return K.oku('liste-durum').filter(function (k) { return k.id === lid; })[0] || null; };
    var ornekte = function (lid) { var o = KATALOG.filter(function (l) { return l.id === lid; })[0]; return !!(o && o.kalem.some(function (k) { return k[0] === SLUG; })); };
    var listedeMi = function (lid) {
      var d = durum(lid); if (d) { return d.sira.indexOf(SLUG) > -1; }
      return ornekte(lid) || K.var('liste-kalem', lid + '|' + SLUG);
    };
    var listeler = function () {
      return K.oku('lstYeniPnl').map(function (k) { return { id: k.id, ad: k.ad || 'Yeni liste' }; }).concat(KATALOG.map(function (l) { return { id: l.id, ad: l.ad }; }));
    };
    var yeniRadyo = function () { return $('input[name="liste_id"][value=""]', lForm); };
    var adGirdi = $('input[name="liste_adi"]', lForm), yeniSecenek = yeniRadyo().closest('label');
    var secenekDoldur = function () {
      $$('[data-liste-secenek]', lForm).forEach(function (e) { e.parentNode.removeChild(e); });
      yeniSecenek.insertAdjacentHTML('beforebegin', listeler().map(function (l) {
        var icinde = listedeMi(l.id);
        return '<label class="kc-pop-radio" data-liste-secenek=""><input type="radio" name="liste_id" value="' + kac(l.id) + '"' + (icinde ? ' disabled' : '') + '> ' + kac(l.ad) + (icinde ? ' · listede' : '') + '</label>';
      }).join(''));
      yeniRadyo().checked = true; adGirdi.value = ''; adGirdi.required = true;
    };
    var kapat = function (odak) { if (lPop.hidden) { return; } lPop.hidden = true; lBtn.setAttribute('aria-expanded', 'false'); if (odak) { lBtn.focus(); } };
    /* Popover'ı canlı dinleyici açar (kayıt sırası sayfa yüklenişine bağlı); açıldığı an `hidden` gözcüsüyle yakalanır: seçenekler tazelenir,
       odak ilk seçilebilir seçeneğe */
    var acilinca = function () { if (lPop.hidden) { return; } secenekDoldur(); var ilk = $('input[name="liste_id"]:not([disabled])', lForm); if (ilk) { ilk.focus(); } };
    if (window.MutationObserver) { new MutationObserver(acilinca).observe(lPop, { attributes: true, attributeFilter: ['hidden'] }); } else { lBtn.addEventListener('click', function () { setTimeout(acilinca, 0); }); }
    lForm.addEventListener('change', function (e) { if (e.target.name === 'liste_id') { adGirdi.required = !e.target.value; } });
    adGirdi.addEventListener('focus', function () { yeniRadyo().checked = true; adGirdi.required = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lPop.hidden) { kapat(true); } });
    lForm.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      var secili = $('input[name="liste_id"]:checked', lForm), lid = secili ? secili.value : '', ad = adGirdi.value.trim();
      if (!lid && !ad) { adGirdi.value = ''; lForm.reportValidity(); return; }
      if (!lid) { lid = 'lstYeniPnl-' + Date.now(); K.ekle('lstYeniPnl', { ad: ad, gorunurluk: 'ozel', aciklama: '', id: lid }); }
      var listeAd = (listeler().filter(function (l) { return l.id === lid; })[0] || {}).ad || ad;
      if (listedeMi(lid)) { bildir(MEKAN + ' zaten “' + listeAd + '” listende.'); kapat(true); return; }
      if (!ornekte(lid) && !K.var('liste-kalem', lid + '|' + SLUG)) { K.ekle('liste-kalem', { id: lid + '|' + SLUG, liste: lid, slug: SLUG, ad: MEKAN, alt: ALT }); }
      var d = durum(lid); if (d) { K.guncelle('liste-durum', lid, { sira: d.sira.concat([SLUG]) }); }
      bildir(MEKAN + ' “' + listeAd + '” listene eklendi. Prototipte yalnız bu tarayıcıda tutulur.');
      kapat(true);
    }, true);
  }

  /* Rezervasyon talebi: canlı betik formu `form.submit()` ile gönderir; prototipte sunucu yok. Talep bu tarayıcıya yazılır, onayı mekân sahibi verir (§8 #17) */
  var form = $('#rsvForm');
  if (form) {
    var deger = function (id) { return ($(id) || {}).value || ''; };
    var doldur = function (ad, v) { var i = $('[name="' + ad + '"]', form); if (i && !i.value) { i.value = v; } };
    doldur('guest_name', 'Örnek Üye'); doldur('guest_phone', '0500 000 00 00'); doldur('guest_email', 'ornek@eposta.com');
    form.submit = function () {
      var gun = deger('#rsvDateInput'), saat = deger('#rsvSlotInput'), kisi = deger('#rsvPartySizeInput'), alerjen = deger('#rsvAlerjen').trim();
      K.ekle('rezervasyon', { id: 'rez-' + gun + '-' + saat, mekan: MEKAN, yer: 'Beyoğlu, İstanbul', gun: gun, saat: saat, kisi: +kisi, alerjen: alerjen, not: deger('#rsvNote').trim(), durum: 'talep' });
      window.dgPuan.ekle('rez-' + gun + '-' + saat, MEKAN + ' rezervasyonu', P.rezervasyon);
      var tarih = gun.split('-').reverse().join('.');
      $('#rsvRecap').innerHTML = '<span><i class="fa-solid fa-user-group" aria-hidden="true"></i> ' + kisi + ' kişi</span><span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + tarih + '</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + saat + '</span>' + (alerjen ? '<span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Alerjen notu var</span>' : '');
      $('#rsvSuccessText').textContent = 'Talebin mekân sahibine iletildi. Onaylanınca kesinleşir; durumu Rezervasyonlarım sekmesinde görürsün. Rezervasyon gerçekleşince +' + P.rezervasyon + ' puan kesinleşir.';
      $$('.rsv-step', form).forEach(function (a) { a.classList.toggle('active', a.dataset.pane === '3'); });
      $$('#rsvProg .pstep').forEach(function (a) { var n = +a.dataset.step; a.classList.toggle('cur', n === 3); a.classList.toggle('done', n < 3); });
      $$('#rsvProg .pline').forEach(function (a) { a.classList.add('done'); });
    };
  }
})();
