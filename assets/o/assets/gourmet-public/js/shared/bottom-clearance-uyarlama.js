/* ══════════════════════════════════════════════════════════════════════
   bottom-clearance-uyarlama.js — YEREL KATMAN (donörde yok)

   `bottom-clearance.js` artık donörle BAYT BAYT aynı (Beyar kararı
   2026-09-15: "5 vendor dosyası … kalanları prototiple bayt bayt aynı
   yap"). Önceki tur donör dosyanın İÇİNE `_bcEkrandaMi` denetimi eklemişti;
   o düzeltme buraya, dosyanın DIŞINA taşındı. Bu dosya donörden SONRA
   (`defer`, aynı sırada) yüklenir.

   NE: `data-bc-clear` taşıyan (bar olmayan) bir öğe DOĞAL konumunda
   viewport'un altındaysa — yani kapalı bir sheet — yerleştiriciden çekilir:
   lift'i 0'a indirilir ve `data-bc-clear` geçici olarak
   `data-bc-clear-uyarlama`ya çevrilir. Öğe ekrana girince öznitelik geri
   takılır ve donörün kendi `transitionend` dinleyicisi onu yerleştirir.

   NEDEN: donörün yerleştiricisi dönüşümsüz dikdörtgene bakıyor; `.lst-side`
   @≤1024'te `fixed` ama kapalıyken `translateY(105%)` ile ekranın altında.
   Donör onu `.bottom-nav` ile çakışıyor sanıp ~430px kaldırıyor. Ölçüldü
   2026-09-15 @390, gerçek akış (bandı kabul et → şifreli çerezle gez):
       donör dosya yalın  : /etkinlikler CLS 3.2259 · /mekanlar 1.8863
                            (kaynak `aside#lstSide y786→63`, `#advSide y778→221`)
       önceki iç düzeltme : /etkinlikler 0.0000   · /mekanlar 0.0088

   NASIL SIFIRLANIYOR: donör lift'i kendi kapalı `WeakMap`'inde tutar;
   `--bc-lift`i elle 0 yazmak o haritayı bayat bırakır ve öğe geri
   takıldığında donör doğal konumu yanlış hesaplar. Bu yüzden sıfırlamayı
   DONÖRÜN kendisine yaptırıyoruz: `_bcSabitMi` (`position === 'fixed'`)
   yanlış dönen öğenin lift'ini donör 0'a çeker. Öğe tek bir eşzamanlı
   adımda `position:absolute` yapılır, `BottomClearance.apply()` çağrılır,
   konum geri alınır — arada boyama olmadığı için görünür bir kayma yok.

   ⚠ Bu mantığı `bottom-clearance.js`e GERİ TAŞIMA: vendor-denetim.mjs
     dosyayı yeniden sahte vendor sayar.
   ⚠ `data-bc-clear`i markup'tan SÖKME: @≤1024 AÇIK sheet'in dayanağı o.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    if (!window.BottomClearance) { return; }

    var CEKILMIS = 'data-bc-clear-uyarlama';

    function lift(el) {
        return parseFloat(el.style.getPropertyValue('--bc-lift')) || 0;
    }

    function ekrandaMi(el) {
        return el.getBoundingClientRect().top + lift(el) < window.innerHeight;
    }

    function donoreSifirlat(el) {
        var eski = el.style.getPropertyValue('position');
        var oncelik = el.style.getPropertyPriority('position');
        el.style.setProperty('position', 'absolute', 'important');
        window.BottomClearance.apply();
        if (eski) { el.style.setProperty('position', eski, oncelik); } else { el.style.removeProperty('position'); }
    }

    function denetle() {
        document.querySelectorAll('[data-bc-clear]:not([data-bc-bar])').forEach(function (el) {
            if (ekrandaMi(el)) { return; }
            if (lift(el) !== 0) { donoreSifirlat(el); }
            el.removeAttribute('data-bc-clear');
            el.setAttribute(CEKILMIS, '');
        });
        document.querySelectorAll('[' + CEKILMIS + ']').forEach(function (el) {
            if (!ekrandaMi(el)) { return; }
            el.removeAttribute(CEKILMIS);
            el.setAttribute('data-bc-clear', '');
        });
    }

    denetle();
    /* Yakalama evresinde: donörün öğe üzerindeki `transitionend` dinleyicisinden
       ÖNCE koşar, yani donörün planladığı `apply()` güncel özniteliği görür. */
    document.addEventListener('transitionend', denetle, true);
    window.addEventListener('scroll', denetle, { passive: true });
    window.addEventListener('resize', denetle);
})();
