
/* ══ TOHUM · KAYNAĞIN KENDİ VERİSİ · YAZILMADI, ÇIKARILDI ══
   Kaynak: scripts/olcum/s2v3-render-tohum.mjs · addInitScript
   gövdesi. Beyar kararı 2026-09-03: kaynağın kendi verisi
   uydurma sayı değildir; besteci onu ölçüm tarafında zaten
   meşru sayıyordu (`tohum: true`).
   ⚠ İLK betik olmak ZORUNDA: depoyu YAZAN kod, depoyu OKUYAN
     sürücülerden (FIT_PLAN · FIT_SHELL.state) önce koşmalı.
   ⚠ Maket şerhi sayfada duruyor; bu veri gerçek kullanıcı
     verisi değil, kaynağın kendi örnek sahnesi. */
(function(){

  const iki = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + iki(d.getMonth() + 1) + '-' + iki(d.getDate());
  const bugun = new Date();
  const gecmis = [];
  for (let i = 0; i < 30; i++) {           /* son 30 günün 12'sinde antrenman */
    if (i % 2 === 1) continue;
    const d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - i);
    gecmis.push({ ad: 'Antrenman', dk: 20 + (i % 5) * 6, kcal: 180 + (i % 4) * 40,
                  tarihISO: d.toISOString(), kaynak: 'olculdu' });
  }
  const bas = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - 26);
  localStorage.setItem('dm_fit', JSON.stringify({
    surum: 2,
    program: { slug: '4-hafta-ev-antrenmani', ad: '4 Hafta Ev Antrenmanı', durum: 'devam',
               hafta: 2, gun: 3, toplam: 18, biten: 7, kacan: 1,
               baslangic: ymd(bas), gunler: [1, 3, 5], saat: '19:00',
               tasimalar: {}, dinlenmeler: [] },
    arsiv: [{ slug: 'baslangic-4-hafta', ad: 'Başlangıç · 4 Hafta', durum: 'tamamlandi',
              biten: 12, toplam: 12, bitis: ymd(new Date(bugun.getFullYear(), bugun.getMonth() - 2, 4)) }],
    bildirimler: [], challenge: null,
    /* ── SOHBET KİPİ · TOHUMLU — Beyar kararı, 2026-09-03 ──────────────
       Kanonun eski kipi TOHUMSUZ'du: `randevular: []` → `API.antrenorler()`
       boş → `fabBas()` `is-bos` dalına giriyor → FAB <a>, panel HİÇ DOĞMUYOR.
       (Kaynağın kendi kaydı: fit-shell.js:2879 `BOS.randevular:[]`;
        s3v3-rol-kapisi.mjs:4 bunu "auth=1'de bile FAB .is-bos" diye yazmış.)
       Beyar: "Bu bir maket, kullanıcı paneli görebilmeli."
       🔴 DEĞER UYDURULMADI — lead'in iki kipi ölçtüğü betikten BİREBİR
       alındı: scripts/olcum/lead-sohbet-kip.mjs:13-14 (TOHUM sabiti).
       Maketle de tutarlı: bildirimler ekranı aynı kişiyi anıyor
       ("Canan Yücel randevu isteğini onayladı"). */
    randevular: [
      /* 🔴 DURUM ANAHTARI DÜZELTİLDİ — 'onayli' → 'onaylandi', 2026-09-03.
         Kabuğun kendi tablosu (fit-shell.js:3348 `randevuEtiket` ·
         :3352 `randevuRozet`) şu altı anahtarı tanıyor:
             onay-bekliyor · onaylandi · tamamlandi · iptal · ertelendi · gelmedi
         Tohum 'onayli' yazıyordu; tabloda YOK → `[d]||d` dalına düşüp
         etiketi HAM basıyor ve rozeti nötr `off` bırakıyordu. Ölçüldü:
         rozet metni "onayli", sınıfı "off" — hem kanon panosunda hem
         referans `mesajlarim-v1`de. Tablo kazandı (Beyar kararı):
         anahtarlar kaynağın kendi dosyasında, tohum ona uyar.

         ÇOK ANTRENÖRLÜ KADRO — adlar ve uzmanlıklar UYDURULMADI,
         kaynağın kendi antrenör kartlarından alındı:
             Canan Yücel   119 geçiş · "Güç & Kondisyon · Evde Antrenman"
             Elif Şahin     39 geçiş · "Mobilite & Pilates · Esneklik"
             Burak Demir    20 geçiş · "Güç & Kondisyon · Dayanıklılık"
             Ayşe Kaplan    17 geçiş · "Kilo Yönetimi · Başlangıç"
         ⚠ Selin'in `hizmet`i 'Online Koçluk' olarak KORUNDU — kaynağın
           tek gerçek `hizmet` değeri o (42 geçiş) ve tohumda ölçülmüş
           bir değer; churn edilmedi. Diğer üçünde kaynağın kendi
           uzmanlık etiketi kullanıldı.
         ⚠ Dört FARKLI durum bilerek: rozet ailesinin dördü de ekranda
           görünsün (ok · wait · ok · wait). */
      { sef: 'Canan Yücel', slug: 'selin-aksoy', hizmet: 'Online Koçluk',
        fiyat: 1200, tarih: '2026-09-10', saat: '18:00', durum: 'onaylandi' },
      { sef: 'Elif Şahin', slug: 'elif-sahin', hizmet: 'Mobilite & Pilates · Esneklik',
        fiyat: 900, tarih: '2026-09-12', saat: '10:30', durum: 'onay-bekliyor' },
      { sef: 'Burak Demir', slug: 'burak-demir', hizmet: 'Güç & Kondisyon · Dayanıklılık',
        fiyat: 1500, tarih: '2026-08-28', saat: '19:00', durum: 'tamamlandi' },
      { sef: 'Ayşe Kaplan', slug: 'ayse-kaplan', hizmet: 'Kilo Yönetimi · Başlangıç',
        fiyat: 1100, tarih: '2026-09-15', saat: '08:00', durum: 'ertelendi' }
    ],
    bugun: { tarih: ymd(bugun), dk: 24, kcal: 310, tamam: false, su: 3, gunSonu: null },
    gecmis
  }));
  /* ── SOHBET DEPOSU · TOHUMLU ────────────────────────────────────────
     Neden gerekli: `fit-mesaj.js`in `DEMO` sabiti YALNIZ listedeki İLK
     antrenöre bağlanıyor (`mesajlar()`: `ilk.slug === slug ? DEMO : []`).
     Dört antrenörlü kadroda diğer üçü BOŞ açılır ve sol kolon "farklı
     son mesaj / farklı zaman" göstermez. Depo burada tohumlanıyor.
     🔴 UYDURMA DEĞİL, SAHNE KURULUMU — kaynağın kendi şeması
        (`ANAHTAR='dm_fit_mesaj_v1'`, `{surum, sohbetler:{slug:{slug,
        antrenor, okundu, mesajlar:[{id,yon,demo,tarih,metin}]}}}`).
        Kalemler `demo:true` taşır → akışta "Örnek" rozetiyle basılır;
        maket olduğu ekranda GÖRÜNÜR kalır, gerçek yazışma taklidi yapmaz.
     Gün ayraçları TARİHTEN doğar (`akisHtml` gün değişince `.msj-gun`
     basıyor) — Selin'in sohbeti beş güne yayıldı ki kaydırma anlamlı olsun.
     Okunmamış kipi: Elif'in `okundu`su son antrenör mesajından ESKİ →
     `okunmamisSayi` 1 döner, sol kolonda sayaç rozeti çıkar. */
  const msj = (id, yon, tarih, metin) => ({ id, yon, demo: true, tarih, metin });
  localStorage.setItem('dm_fit_mesaj_v1', JSON.stringify({
    surum: 1,
    sohbetler: {
      /* DEMO'nun 3 kalemi (27 Ağustos) bunun ÜSTÜNE biner → 12 mesaj. */
      'selin-aksoy': { slug: 'selin-aksoy', sef: 'Canan Yücel',
        okundu: '2026-09-03T23:59:00.000Z', mesajlar: [
        msj('t-s1', 'uye',      '2026-08-30T07:20:00.000Z', 'İlk ay bitti. Squat’ta dizim biraz zorlandı ama ağrı yok.'),
        msj('t-s2', 'sef', '2026-08-30T08:02:00.000Z', 'Normal. Derinliği azaltıp tempoyu yavaşlatalım; bir sonraki ayta kalça hareketliliğine on dakika ayıracağız.'),
        msj('t-s3', 'sef', '2026-09-01T06:15:00.000Z', 'Bu haftanın programını yükledim: üç gün, ikisi kuvvet biri hareketlilik.'),
        msj('t-s4', 'uye',      '2026-09-01T07:30:00.000Z', 'Gördüm. Çarşamba akşamı işim var, salıya alabilir miyiz?'),
        msj('t-s5', 'sef', '2026-09-01T08:10:00.000Z', 'Aldım. Salı 19:00 olarak güncelledim, çarşamba dinlenme günün.'),
        msj('t-s6', 'uye',      '2026-09-02T05:50:00.000Z', 'Isınmayı kısaltabilir miyim? Sabahları on beş dakikadan fazlası zor oluyor.'),
        msj('t-s7', 'sef', '2026-09-02T06:25:00.000Z', 'Sekiz dakikaya indirebilirsin ama kalça ve omuz çevirmeyi bırakma; ısınmanın işi orada.'),
        msj('t-s8', 'uye',      '2026-09-02T17:40:00.000Z', 'Bugünkü ayı tamamladım, ağırlıkları bir kademe artırdım.'),
        msj('t-s9', 'sef', '2026-09-03T06:05:00.000Z', 'Güzel. Bu tempoyu iki hafta koru, sonra tekrar bakarız.')
      ] },
      /* 🔴 OKUNMAMIŞ OLAN BU — son mesaj antrenörden ve `okundu`dan yeni. */
      'elif-sahin': { slug: 'elif-sahin', sef: 'Elif Şahin',
        okundu: '2026-09-02T12:00:00.000Z', mesajlar: [
        msj('t-e1', 'uye',      '2026-09-02T09:10:00.000Z', 'Mobilite ayı için randevu isteği gönderdim, uygun musunuz?'),
        msj('t-e2', 'sef', '2026-09-03T07:45:00.000Z', 'Perşembe 10:30 bende uygun. Onaylamadan önce bir sorum var: masa başı çalışıyorsun değil mi?')
      ] },
      'burak-demir': { slug: 'burak-demir', sef: 'Burak Demir',
        okundu: '2026-08-29T00:00:00.000Z', mesajlar: [
        msj('t-b1', 'sef', '2026-08-26T15:00:00.000Z', 'Dayanıklılık bloğunun son ayı yarın. Ölçümleri ay sonunda alacağız.'),
        msj('t-b2', 'uye',      '2026-08-28T20:15:00.000Z', 'Paket bitti, teşekkürler. Sonuçları çok beğendim.')
      ] },
      'ayse-kaplan': { slug: 'ayse-kaplan', sef: 'Ayşe Kaplan',
        okundu: '2026-09-01T12:00:00.000Z', mesajlar: [
        msj('t-a1', 'sef', '2026-09-01T11:20:00.000Z', 'Başlangıç değerlendirmen için üç günlük beslenme kaydı tutmanı istiyorum.')
      ] }
    }
  }));

  const gun = (no, odak, hs) => ({ no, ad: 'Gün ' + no, odak,
    isinma: '5 dk hafif tempo + omuz çevirme', hareketler: hs });
  const h = (slug, ad, set, tekrar) => ({ slug, ad, set, tekrar, dinlenme: 60,
    ekipman: ['dambıl'], video: slug, uyari: 'Beli çukurlaştırma.',
    alternatif: 'sinav', alternatifAd: 'Şınav (Push-up)' });
  localStorage.setItem('dm_fit_planlar_v1', JSON.stringify({
    aktifId: 'plan_tohum_1',
    planlar: [{
      id: 'plan_tohum_1', ad: 'Ev · 3 gün · Başlangıç',
      olusturma: new Date(bugun.getTime() - 26 * 864e5).toISOString(),
      kaynak: 'antrenman-olusturucu',
      secimler: { gunSayisi: 3, seviye: 'baslangic', hedef: 'form', mekan: 'ev',
                  ekipman: ['dambıl'], sure: 25, cinsiyet: 'kadin' },
      gunler: [gun(1, 'İtiş', [h('sinav', 'Şınav', 3, 10), h('omuz-pres', 'Omuz Pres', 3, 12)]),
               gun(2, 'Çekiş', [h('kurek-cekis', 'Kürek Çekiş', 3, 12), h('biceps-curl', 'Biceps Curl', 3, 12)]),
               gun(3, 'Bacak', [h('squat', 'Squat', 4, 12), h('hamstring', 'Hamstring', 3, 12)])],
      ilerleme: { 'g1-h0': { yapildi: true, seviye: 'tam', tarih: new Date().toISOString(), agirlik: 12, tekrarYapilan: 10, efor: 7 },
                  'g1-h1': { yapildi: true, seviye: 'tam', tarih: new Date().toISOString(), agirlik: 8, tekrarYapilan: 12, efor: 6 },
                  'g2-h0': { yapildi: true, seviye: 'yarim', tarih: new Date().toISOString() } },
      gunDurum: { g1: { durum: 'tamamlandi', tarih: new Date().toISOString(), kayit: true } },
      durum: 'devam', bitis: null, arsivlendi: false, tur: 1, bitisKartKapali: null
    }]
  }));
})();
