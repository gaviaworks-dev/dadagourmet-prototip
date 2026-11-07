/* Aşama 2 · B · arayüz çevirisi (ajan-b1). Sayfa kaynak dilin DIŞINDAYSA Blade <main data-l-js='{ad: metin}'> basar (ad = sözlük
   anahtarının 'arayuz_' öneksiz hâli); öznitelik yoksa (TR) her çağrı TR yedeğini AYNEN döndürür — TR davranışı ve metni değişmez. */
/* `window`suz bağlamda da (betiği vm'de koşan tests/js) tanımlı kalır ve sözlük okunamazsa TR yedeğini döndürür (ajan-b1b). */
var dmL = (typeof window !== 'undefined' && window.dmL) || function (k, tr, p) {
  var s = null;
  try { var el = document.querySelector('[data-l-js]'); s = el ? JSON.parse(el.getAttribute('data-l-js'))[k] : null; } catch (e) { s = null; }
  if (typeof s !== 'string') return tr;
  /* Çoğul (EN): 'tekil|çoğul' — sayı p.sayi, yoksa p.toplam, yoksa p.n; 1 → ilk biçim, gerisi son biçim; RU (üç kategorili dil, 20 Eki): 'bir|az|çok', kesir → az. Kırpma yok (baştaki boşluk anlamlı). */
  if (s.indexOf('|') >= 0) { var n = p ? [p.sayi, p.toplam, p.n].filter(function (x) { return x !== undefined && x !== null && x !== ''; })[0] : undefined; var b = s.split('|'); var bi = (function (x) { if (b.length < 3 || typeof document === 'undefined' || typeof Intl === 'undefined') return -1; var pr = new Intl.PluralRules(document.documentElement.lang || 'tr'); if (pr.resolvedOptions().pluralCategories.indexOf('few') < 0) return -1; x = Math.abs(Number(x)) || 0; if (x !== Math.floor(x)) return 1; var k = pr.select(x); return k === 'one' ? 0 : (k === 'few' ? 1 : 2); })(n); s = bi >= 0 ? b[bi] : (Number(n) === 1 ? b[0] : b[b.length - 1]); }
  return s.replace(/:([a-z_]+)/g, function (m, a) { return p && Object.prototype.hasOwnProperty.call(p, a) ? String(p[a]) : m; });
};
if (typeof window !== 'undefined') window.dmL = dmL;
/* F4 · U5 — `/hesabim/ayarlar` yazma uçları.
 *
 * Kanonun kendi `hsYaz()`si (`j-18ba956a5fcd.js`, değiştirilemez) her
 * `form[data-savecard]`ı ve `#gv2fa`yı localStorage'a yazacak biçimde
 * kurulu; o çağrı kabuğun `public/kabuk/depo-kapisi.js` korumasıyla
 * sessizce engelleniyor (bkz. `docs/f4-ajan-u5-rapor.md §4·6`). Ama
 * kanonun submit dinleyicisi (dosyada BENDEN önce çalışır — bu betik
 * `defer`, kanon senkron/gömülü) bazı formlarda ALANLARI DA sıfırlıyor
 * (`guvenlik-sifre` → `f.reset()`, "Hesabı Dondurma" → `box.checked=false`,
 * §20 onay kapısı). O sıfırlama benden ÖNCE olursa `new FormData(f)` boş
 * gelir. Çözüm: `document` üzerinde CAPTURE evresinde dinle — capture,
 * formun kendi (bubble/target) dinleyicilerinden HER ZAMAN önce çalışır,
 * betik sırası (defer/senkron) fark etmez.
 */
(function () {
  'use strict';

  function csrf() {
    var m = document.querySelector('meta[name="dada-kimlik"]');
    try { return JSON.parse(m.getAttribute('content')).csrf; } catch (e) { return null; }
  }

  function gonder(url, formData) {
    return fetch(url, {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
      body: formData, credentials: 'same-origin',
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j && j.ok === true, durum: r.status, govde: j }; }); });
  }

  /* Mutlak yola GİT — `location.reload()` DEĞİL: kanonun sekme betiği
     (`j-b11cff639f21.js`, `history.replaceState(null,'','#'+k)`)
     `<base href="/">` ile birleşince adres çubuğunu KÖKE düşürüyor
     (ölçüldü: bir sekmeye tıklamak `/hesabim/ayarlar`ı sessizce `/#dondur`a
     çeviriyor). Kanon değiştirilemez; mutlak yola GİT — ama adres çubuğu
     ZATEN o mutlak yoldaysa (`location.href` AYNI değere atanınca tarayıcı
     yeniden yüklemez, sessiz no-op) sorgu dizesiyle her seferinde FARKLI
     bir URL üretilir, gerçek bir yeniden yükleme garanti edilir. */
  function dondurSayfasinaGit() {
    location.href = (window.dmYol || String)('/hesabim/ayarlar') + '?t=' + Date.now() + '#dondur';
  }

  function kaydedildiGoster(form) {
    /* 🔴 `.show` DEĞİL `.gorunur` — kanonun `hsYaz()`si hâlâ donörün eski
       sınıf adını (`.hs-saved.show`) kullanıyor; CSS yeniden adlandırılırken
       (`bilesenler.css:3427`) o çağrı güncellenmemiş — kanonun kendi ölü
       kod satırı. Gerçek kural `.kaydedildi.gorunur{display:inline-flex}`. */
    var ok = form.querySelector('.kaydedildi');
    if (!ok) return;
    ok.classList.add('gorunur');
    clearTimeout(ok._t);
    ok._t = setTimeout(function () { ok.classList.remove('gorunur'); }, 2500);
  }

  function hataGoster(form, mesaj) {
    var kutu = form.querySelector('[data-u5-hata]');
    if (!kutu) {
      kutu = document.createElement('p');
      kutu.setAttribute('data-u5-hata', '');
      kutu.className = 'fk-hata';
      kutu.setAttribute('role', 'alert');
      kutu.style.marginTop = '8px';
      form.insertBefore(kutu, form.firstChild);
    }
    kutu.textContent = mesaj;
    kutu.hidden = false;
  }

  /* ── form[data-savecard] — profil · bildirim · guvenlik-sifre · dil ── */
  var UÇLAR = {
    profil: '/hesabim/ayarlar/profil',
    bildirim: '/hesabim/ayarlar/bildirim-tercihleri',
    'guvenlik-sifre': '/hesabim/ayarlar/sifre',
    dil: '/hesabim/ayarlar/dil-bolge',
  };

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.matches) return;

    /* data-savecard formları — kanonun sıfırlamasından ÖNCE FormData al */
    if (f.matches('form[data-savecard]')) {
      var kart = f.getAttribute('data-savecard');
      var uc = UÇLAR[kart];
      if (!uc) return; // "gorunurluk" ve "2fa" burada değil — bilerek atlanır (bkz. rapor §5/§4)

      e.preventDefault(); e.stopImmediatePropagation();
      if (f._kaydediliyor) return;
      var gecti = false;
      try { gecti = f.reportValidity(); } catch (hata) { gecti = false; }
      if (!gecti) return;

      if (kart === 'guvenlik-sifre') {
        var yeni = f.querySelector('#pwNew'), tekrar = f.querySelector('#pwNew2');
        if (yeni && tekrar && yeni.value !== tekrar.value) { tekrar.focus(); hataGoster(f, dmL('uye_hesap.js.ayarlar.sifreler_eslesmiyor', 'Yeni şifreler eşleşmiyor.')); return; }
      }

      f._kaydediliyor = true;
      var eskiHata = f.querySelector('[data-u5-hata]');
      if (eskiHata) eskiHata.hidden = true;
      var eskiOnay = f.querySelector('.kaydedildi');
      if (eskiOnay) eskiOnay.classList.remove('gorunur');
      var veri = new FormData(f); // kanonun `f.reset()`inden ÖNCE alınır (capture)
      gonder(uc, veri).then(function (r) {
        if (!r.ok) {
          var ilkHata = r.govde && r.govde.errors ? Object.values(r.govde.errors)[0] : null;
          hataGoster(f, (ilkHata && ilkHata[0]) || (r.govde && r.govde.message) || dmL('uye_hesap.js.ayarlar.kaydedilemedi', 'Kaydedilemedi.'));
          return;
        }
        if (kart === 'guvenlik-sifre') f.reset();
        kaydedildiGoster(f);
      }).catch(function () { hataGoster(f, dmL('uye_hesap.js.ayarlar.baglanti_sorunu', 'Bağlantı sorunu — tekrar dene.')); }).finally(function () { f._kaydediliyor = false; });
      return;
    }

    /* ── HESABI DONDURMA — kanonun §20 onay kapısı submit'te
       `box.checked = false` yapıyor; checkbox'ı ondan ÖNCE oku.

       🔴 ÖLÇÜLEN KUSUR (F6·B54): bu blok kanonun kendi `submit` dinleyicisini
       (`j-18ba956a5fcd.js`, §20 onay kapısı, BUBBLE evresinde `f`nin
       kendisine bağlı) DURDURMUYORDU — yalnız `gonder()`i tetikleyip olayı
       serbest bırakıyordu. Gerçek istek gidiyordu AMA olay sonra kanonun
       kendi dinleyicisine de ulaşıyor, o da "Bu makette işlem gerçekten
       uygulanmadı…" metnini basıp kutuyu/ifadeyi sıfırlıyordu — GERÇEK
       dondurmadan SONRA sahte maket cümlesi görünüyordu. `stopImmediatePropagation`
       bu dosya CAPTURE evresinde çalıştığı için (satır 77) kanonun bubble
       dinleyicisine ulaşmadan olayı keser; `preventDefault` de native
       gönderimi durdurur — ikisi birlikte gerekli. ── */
    if (f.matches('#dondur form.onay-kapisi')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var onay = f.querySelector('#dondurOnay');
      if (!onay || !onay.checked) return; // kanonun kendi kilidi zaten kapalı tutar
      gonder('/hesabim/ayarlar/dondur', new FormData(f)).then(function (r) {
        if (!r.ok) { hataGoster(f, (r.govde && r.govde.message) || dmL('uye_hesap.js.ayarlar.dondurulamadi', 'Dondurulamadı.')); return; }
        dondurSayfasinaGit();
      }).catch(function () { hataGoster(f, dmL('uye_hesap.js.ayarlar.islem_dogrulanamadi', 'İşlem doğrulanamadı. Sayfayı yenileyip durumunu kontrol et.')); });
      return;
    }

    /* ── HESABIMI SİL — aynı §20 onay kapısı, aynı çift dinleyici sorunu.
       Kanon kutu/ifadeyi doğrulayıp düğmeyi AÇIYOR (`why()` — sync()`), bu
       yüzden bu dinleyiciye submit hiç ulaşmadan önce onay ZATEN tamamdır;
       burada yeniden sorulmaz. Gerçek istek `/hesabim/ayarlar/hesap-sil`e
       gider; kanonun maket cümlesi `stopImmediatePropagation` ile hiç
       çalışmaz. ── */
    if (f.matches('#sil form.onay-kapisi')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var silBtn = f.querySelector('[data-confirm-btn]');
      var silDurum = f.querySelector('[data-confirm-state] span, #silDurum span');
      var neden = f.querySelector('#silNeden');
      var onayKutu = f.querySelector('#silOnay');
      var ifadeAlan = f.querySelector('#silIfade');
      /* İstemci kanonun §20 kapısıyla zaten doğruladı (düğme onaysız
         disabled kalır) — ama SUNUCU aynı iki alanı kendi başına da ister
         (`HesapSilmeIstegi`), o yüzden `onay`/`ifade` burada da gönderilir. */
      var veri = new FormData();
      veri.append('onay', onayKutu && onayKutu.checked ? '1' : '0');
      veri.append('ifade', ifadeAlan ? ifadeAlan.value : '');
      if (neden && neden.value && neden.value !== 'Belirtmek istemiyorum') veri.append('neden', neden.value);
      if (silBtn) silBtn.disabled = true;
      gonder('/hesabim/ayarlar/hesap-sil', veri).then(function (r) {
        if (!r.ok) {
          if (silBtn) silBtn.disabled = false;
          var ilkHata = r.govde && r.govde.errors ? Object.values(r.govde.errors)[0] : null;
          hataGoster(f, (ilkHata && ilkHata[0]) || (r.govde && r.govde.message) || dmL('uye_hesap.js.ayarlar.hesap_silinemedi', 'Hesap silinemedi — tekrar dene.'));
          return;
        }
        if (silDurum) silDurum.textContent = (r.govde && r.govde.mesaj) || dmL('uye_hesap.js.ayarlar.silme_alindi', 'Silme talebin alındı. Çıkış yapılıyor…');
        setTimeout(function () { location.href = (window.dmYol || String)('/giris'); }, 1500);
      }).catch(function () {
        if (silBtn) silBtn.disabled = false;
        hataGoster(f, dmL('uye_hesap.js.ayarlar.silme_dogrulanamadi', 'Silme talebi doğrulanamadı. Sayfayı yenileyip durumunu kontrol et.'));
      });
    }
  }, true);

  /* İki adımlı doğrulama anahtarı kaldırıldı (19 Eki, Beyar: 2FA bizde yok; bayrak girişte okunmuyordu). */

  var aktifBtn = document.getElementById('dondurAktifBtn');
  if (aktifBtn) {
    aktifBtn.addEventListener('click', function () {
      if (aktifBtn.disabled) return;
      aktifBtn.disabled = true;
      gonder('/hesabim/ayarlar/aktiflestir', new FormData()).then(function (r) {
        if (!r.ok) throw new Error('aktiflestir');
        dondurSayfasinaGit();
      }).catch(function () { hataGoster(aktifBtn.parentElement, dmL('uye_hesap.js.ayarlar.etkinlestirilemedi', 'Hesabın etkinleştirilemedi. Yeniden dene.')); })
        .finally(function () { aktifBtn.disabled = false; });
    });
  }

  /* ── BAĞLI SİSTEMLER — izin anahtarı ve "Şimdi senkronize et".
     Kartların "Bağlantıyı kes/Yeniden bağlan" için gerçek bir <button>ü YOK
     (yalnız data-cut-on/off ETİKETLERİ render'a hiç dönmemiş, ölçüldü) —
     o yüzden yalnız gerçekten basılan iki yüzey bağlanır.

     🔴 ÖLÇÜLEN KUSUR (F6·B54): `.then(function(r){ if(!r.ok) return; ... })`
     — ne `catch` vardı ne başarısız yanıtta bir mesaj. Satırı olmayan
     hesap ilk tıklamada 404/422 alıyordu (`BagliSistemServisi::izinDegistir`
     eskiden `firstOrFail()`), anahtar da görsel olarak HİÇ değişmiyordu;
     kullanıcı düğmeye basıp hiçbir şey olmadığını görüyordu — "tıklayınca
     hiçbir şey olmayan düğme". Şimdi (a) yazma tarafı satırı kendisi
     doğuruyor (bkz. servis) ve (b) başarısız yanıt burada GÖRÜNÜR hata
     basıyor, sessizce yutulmuyor. ── */
  function izinHata(sw, mesaj) {
    var kart = sw.closest('.fp-card');
    var yuva = kart ? kart.querySelector('.ba-perms') || kart : sw.closest('.fp-toggle');
    if (!yuva) return;
    var kutu = yuva.querySelector('[data-izin-hata="bagli"]');
    if (!mesaj) { if (kutu) kutu.remove(); return; }
    if (!kutu) {
      kutu = document.createElement('p');
      kutu.className = 'fk-hata';
      kutu.setAttribute('role', 'alert');
      kutu.setAttribute('data-izin-hata', 'bagli');
      yuva.appendChild(kutu);
    }
    kutu.textContent = mesaj;
  }
  document.querySelectorAll('#hs-pane-bagli .fp-sw[data-perm]').forEach(function (sw) {
    sw.addEventListener('click', function () {
      if (sw.disabled) return;
      var kart = sw.closest('.ba-card');
      if (!kart) return;
      var yeni = sw.getAttribute('aria-checked') !== 'true';
      var f = new FormData();
      f.append('saglayici', kart.dataset.app);
      f.append('izin_anahtari', sw.dataset.perm);
      f.append('etkin', yeni ? '1' : '0');
      sw.disabled = true;
      izinHata(sw, '');
      gonder('/hesabim/ayarlar/bagli/izin', f)
        .then(function (r) {
          if (!r.ok || !r.govde || r.govde.ok !== true) {
            izinHata(sw, (r.govde && (r.govde.message || (r.govde.errors && Object.values(r.govde.errors)[0][0]))) || dmL('uye_hesap.js.ayarlar.izin_kaydedilemedi', 'İzin kaydedilemedi — tekrar dene.'));
            return;
          }
          sw.setAttribute('aria-checked', yeni ? 'true' : 'false');
          var etiket = sw.previousElementSibling;
          if (etiket && etiket.classList.contains('fp-sw-lbl')) etiket.textContent = yeni ? dmL('uye_hesap.js.ayarlar.acik', 'Açık') : dmL('uye_hesap.js.ayarlar.kapali', 'Kapalı');
        })
        .catch(function () { izinHata(sw, dmL('uye_hesap.js.ayarlar.baglanti_sorunu', 'Bağlantı sorunu — tekrar dene.')); })
        .finally(function () { sw.disabled = false; });
    });
  });
  /* ── BİLDİRİM KATEGORİLERİ — dört ölü anahtar bağlandı (F6·B24).
     Ölçülen kusur: dördü de sabit `aria-checked="true"` ve sabit "Açık"
     basıyordu; durum hiçbir yerden gelmiyordu ve tıklamak hiçbir şey
     yazmıyordu — ekran bir izin durumu ilan ediyor, arkası boştu.

     🔴 GÖRSEL DURUM `aria-checked`TEN GELİYOR, SINIFTAN DEĞİL. Kanon
     `.fp-sw[aria-checked="true"]` ile stilliyor (ölçüldü, gömülü CSS);
     bu yüzden ne yeni sınıf uyduruluyor ne de satır içi stil yazılıyor —
     yalnız öznitelik çevriliyor. Kardeşi `#hs-pane-bagli .fp-sw[data-perm]`
     tam olarak böyle çalışıyor, desen oradan alındı.

     🔴 SUNUCU SÖYLER, EKRAN UYAR. Yeni durum istekten DEĞİL yanıttan
     okunuyor: kategori birden çok (olay, kanal) çiftini kapsıyor ve
     sunucudaki karar tek doğru kaynak. Yanıt dört anahtarın durumunu birden
     döndürüyor, çünkü hepsi AYNI depoyu paylaşıyor.

     🔴 SESSİZ BAŞARISIZLIK YOK: uç hata verirse anahtar OYNAMAZ ve satır
     `role="alert"` ile sebebi söyler. Kapandığını sanıp bildirim almaya
     devam etmek, kapatılan kusurun daha kötüsü olurdu. ── */
  (function () {
    var anahtarlar = document.querySelectorAll('.fp-sw[data-izin-key][data-izin-uc]');
    if (!anahtarlar.length) return;

    var uyari = null;

    function bildir(mesaj) {
      if (!mesaj) { if (uyari) { uyari.remove(); uyari = null; } return; }
      if (!uyari) {
        uyari = document.createElement('p');
        uyari.className = 'alan-yardim';
        uyari.setAttribute('role', 'alert');
        uyari.setAttribute('data-izin-hata', '');
        anahtarlar[0].closest('.fp-card').appendChild(uyari);
      }
      uyari.textContent = mesaj;
    }

    function ciz(sw, acik) {
      sw.setAttribute('aria-checked', acik ? 'true' : 'false');
      var etiket = sw.previousElementSibling;
      if (etiket && etiket.classList.contains('fp-sw-lbl')) {
        etiket.textContent = acik ? dmL('uye_hesap.js.ayarlar.acik', 'Açık') : dmL('uye_hesap.js.ayarlar.kapali', 'Kapalı');
      }
    }

    function hepsiniCiz(durumlar) {
      if (!durumlar || typeof durumlar !== 'object') return;
      anahtarlar.forEach(function (sw) {
        var k = sw.getAttribute('data-izin-key');
        if (Object.prototype.hasOwnProperty.call(durumlar, k)) ciz(sw, !!durumlar[k]);
      });
    }

    anahtarlar.forEach(function (sw) {
      sw.addEventListener('click', function () {
        if (sw.disabled) return;
        sw.disabled = true;
        bildir('');
        gonder(sw.getAttribute('data-izin-uc'), new FormData())
          .then(function (r) {
            if (!r.ok || !r.govde || r.govde.ok !== true) {
              bildir(dmL('uye_hesap.js.ayarlar.bildirim_kaydedilemedi', 'Bildirim tercihi kaydedilemedi — yeniden dene.'));

              return;
            }
            hepsiniCiz(r.govde.kategoriler);
          })
          .catch(function () { bildir(dmL('uye_hesap.js.ayarlar.bildirim_kaydedilemedi', 'Bildirim tercihi kaydedilemedi — yeniden dene.')); })
          .finally(function () { sw.disabled = false; });
      });
    });
  })();

  var syncBtn = document.getElementById('baSyncNow');
  if (syncBtn) {
    syncBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (syncBtn.disabled) return;
      var kart = syncBtn.closest('.ba-card') || document.querySelector('#hs-pane-bagli .ba-card[data-durum="on"]');
      var saglayici = kart ? kart.dataset.app : null;
      if (!saglayici) { hataGoster(syncBtn.parentElement, dmL('uye_hesap.js.ayarlar.senkron_uygulama_yok', 'Senkronize edilecek bağlı uygulama bulunamadı.')); return; }
      syncBtn.disabled = true;
      var f = new FormData();
      f.append('saglayici', saglayici);
      gonder('/hesabim/ayarlar/bagli/senkron', f).then(function (r) {
        var canli = document.getElementById('baLive');
        if (!r.ok) throw new Error('senkron');
        if (canli) canli.textContent = dmL('uye_hesap.js.ayarlar.senkronize_edildi', 'Senkronize edildi.');
      }).catch(function () { hataGoster(syncBtn.parentElement, dmL('uye_hesap.js.ayarlar.senkron_dogrulanamadi', 'Senkronizasyon doğrulanamadı. Yeniden dene.')); })
        .finally(function () { syncBtn.disabled = false; });
    }, true);
  }

  /* ── VERİ VE HESAP YÖNETİMİ ── */
  var vzListele = document.getElementById('vzListele');
  var vzListe = document.getElementById('vzListe');
  if (vzListele && vzListe) {
    vzListele.addEventListener('click', function () {
      vzListe.hidden = !vzListe.hidden;
      vzListele.setAttribute('aria-expanded', String(!vzListe.hidden));
    });
  }
  var vzIndir = document.getElementById('vzIndir');
  var vzIndirDurum = document.getElementById('vzIndirDurum');
  var vzDosyaUrl = null;
  if (vzIndir && vzIndirDurum) {
    vzIndir.addEventListener('click', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (vzIndir.disabled) return;
      vzIndir.disabled = true; vzIndirDurum.hidden = true;
      gonder('/hesabim/ayarlar/veri-indir', new FormData()).then(function (r) {
        if (!r.ok || !r.govde || !r.govde.paket || !r.govde.dosya_adi) throw new Error('veri');
        var link = document.getElementById('vzTekrarIndir');
        if (!link) throw new Error('veri');
        var yeniUrl = URL.createObjectURL(new Blob([JSON.stringify(r.govde.paket, null, 2)], { type: 'application/json;charset=utf-8' }));
        if (vzDosyaUrl) URL.revokeObjectURL(vzDosyaUrl);
        vzDosyaUrl = yeniUrl;
        link.href = yeniUrl; link.download = r.govde.dosya_adi;
        vzIndirDurum.hidden = false;
        link.click();
        vzIndirDurum.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }).catch(function () { hataGoster(vzIndir.parentElement, dmL('uye_hesap.js.ayarlar.dosya_hazirlanamadi', 'Dosyan hazırlanamadı. Yeniden dene.')); })
        .finally(function () { vzIndir.disabled = false; });
    }, true);
  }
})();
