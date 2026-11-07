/* `uye.ayarlar` ekranının ERKEN yuvası — tek işi `uye-avatar.js`i yüklemek.
 *
 * Kabuk ekran betiğini ROTA ADINDAN türetiyor (`KabukKimligi::ekranBetigi`),
 * yani `/f4/uye-avatar.js` kendi başına hiçbir sayfaya girmez. Geç yuva
 * (`uye-ayarlar.js`) başka bir yazarın; kesişimsizlik için mantık ayrı dosyada
 * duruyor ve buradan çağrılıyor.
 *
 * `async = false` — sıra korunur; `<head>`te koştuğu için dinleyiciler kanonun
 * gömülü betiklerinden önce kurulur. */
(function () {
  var s = document.createElement('script');
  s.src = (document.documentElement.dataset.kok || '/') + 'assets/g/f4/uye-avatar.js';
  s.async = false;
  (document.head || document.documentElement).appendChild(s);
})();
