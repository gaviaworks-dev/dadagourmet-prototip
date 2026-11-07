/* donör: https://dadagastro.com/giris satır içi betik, değişmeden */
(function () {
            'use strict';
            var kart = document.querySelector('.giris-kart');
            if (!kart) { return; }

            /* şifre göster/gizle — donörün `.alan-goz`/`data-eye` deseni */
            kart.querySelectorAll('[data-eye]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var input = document.getElementById(btn.getAttribute('data-eye'));
                    if (!input) { return; }
                    var acik = input.type === 'password';
                    input.type = acik ? 'text' : 'password';
                    btn.setAttribute('aria-pressed', acik ? 'true' : 'false');
                    btn.querySelector('i').className = acik ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
                });
            });

            /* Kullanıcı/Şef seçici — K1: yalnız `hedef` alanını doldurur, rota değiştirmez */
            var asSeg = document.getElementById('giAsSeg');
            var hedef = document.getElementById('giHedef');
            if (asSeg && hedef) {
                asSeg.querySelectorAll('button[data-as]').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        asSeg.querySelectorAll('button[data-as]').forEach(function (b) {
                            b.classList.remove('aktif');
                            b.setAttribute('aria-pressed', 'false');
                        });
                        btn.classList.add('aktif');
                        btn.setAttribute('aria-pressed', 'true');
                        hedef.value = btn.getAttribute('data-as');
                    });
                });
            }

            /* K3 — "Şifremi unuttum" / "Girişe dön": paneller arası geçiş.
               Üçüncü pane (`yeni-sifre`) eklenince ikili `hedef/diger` mantığı yetmedi:
               açılan panenin DIŞINDAKİ HEPSİ kapanır, yoksa "Girişe Dön" düğmesi
               yeni-şifre panesini açık bırakıyordu. */
            var paneler = {};
            kart.querySelectorAll('[data-pane]').forEach(function (p) {
                paneler[p.getAttribute('data-pane')] = p;
            });
            kart.querySelectorAll('[data-goto]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var ad = btn.getAttribute('data-goto');
                    var hedefPane = paneler[ad] || paneler['giris'];
                    Object.keys(paneler).forEach(function (k) {
                        paneler[k].hidden = paneler[k] !== hedefPane;
                    });
                    if (hedefPane) {
                        var ilkAlan = hedefPane.querySelector('.alan-girdi');
                        if (ilkAlan) { ilkAlan.focus(); }
                    }
                });
            });

            /* ── YENİ ŞİFRE: beş kural canlı + tekrar eşleşmesi (Beyar, 2026-09-16) ──
               Desen Diet'ten (`kimlik-formu.js:287-326`); sınıf adı `ok`, Fit/Gourmet
               ile aynı. Dinlenme ikonu Gastro'nun kendi `fa-circle`ı, karşılanınca
               `fa-circle-check`.

               🔴 DÜZENLİ İFADELER SUNUCUNUNKİYLE BİREBİR. Ekran kuralı sunucudan
               GEVŞEK olursa düğme açılır ve gönderim 422 döner; SIKI olursa geçerli
               bir şifre reddedilir — ikisi de istemci/sunucu çelişkisi.
               `SifreYenilemeIstegi`: `Password::min(8)->mixedCase()->numbers()->symbols()`
               → Laravel'in kendi ifadeleri (`Rules/Password.php:358-370`):
                 mixedCase `(\p{Ll}+.*\p{Lu})|(\p{Lu}+.*\p{Ll})` — ekranda iki satıra
                 ayrıldığı için `\p{Lu}` ve `\p{Ll}` diye ayrı sorulur (aynı küme),
                 numbers `\pN` · symbols `\p{Z}|\p{S}|\p{P}` · min(8) `mb_strlen`
                 (JS'te `Array.from().length` — vekil çiftleri doğru sayar).

               🔴 DÜĞME MARKUP'TA AÇIK DOĞAR ve kilidi YALNIZ bu betik koyar. Kapalı
               doğsaydı JS'siz tarayıcıda form tümden ölürdü (yukarıdaki donör şerhi).
               Beş kural sunucuda zaten yeniden koşuyor; bu kilit kolaylıktır, kapı değil. */
            var KURALLAR = {
                uzunluk: function (v) { return Array.from(v).length >= 8; },
                buyuk: function (v) { return /\p{Lu}/u.test(v); },
                kucuk: function (v) { return /\p{Ll}/u.test(v); },
                rakam: function (v) { return /\p{N}/u.test(v); },
                ozel: function (v) { return /\p{Z}|\p{S}|\p{P}/u.test(v); }
            };

            var ysYeni = document.getElementById('ysYeni');
            var ysTekrar = document.getElementById('ysTekrar');
            var ysListe = document.getElementById('ysKurallar');
            var ysGonder = document.getElementById('ysGonder');

            if (ysYeni && ysListe) {
                var kurallariCiz = function () {
                    ysListe.querySelectorAll('li[data-kural]').forEach(function (li) {
                        var kural = KURALLAR[li.getAttribute('data-kural')];
                        var tamam = kural ? kural(ysYeni.value) : false;
                        li.classList.toggle('ok', tamam);
                        var ikon = li.querySelector('i');
                        if (ikon) { ikon.className = tamam ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle'; }
                    });
                };
                ysYeni.addEventListener('input', kurallariCiz);
                kurallariCiz();
            }

            if (ysYeni && ysTekrar) {
                var tekrarAlan = ysTekrar.closest('.alan');
                var tekrarHata = document.getElementById('ysTekrarErr');
                /* Sunucudan gelen hata ekrandaysa ilk tuşa kadar DURUR: kullanıcı
                   daha hiçbir şey yazmadan mesajı silmek, 422'nin sebebini gizler. */
                var sunucuHatasi = !!(tekrarHata && tekrarHata.classList.contains('acik'));

                var kurallarTamam = function () {
                    return Object.keys(KURALLAR).every(function (k) { return KURALLAR[k](ysYeni.value); });
                };

                var eslesmeDenetle = function (olay) {
                    if (olay && sunucuHatasi) { sunucuHatasi = false; }
                    var tutmuyor = ysTekrar.value !== '' && ysTekrar.value !== ysYeni.value;
                    if (!sunucuHatasi && tekrarHata) {
                        tekrarHata.classList.toggle('acik', tutmuyor);
                        if (tekrarAlan) { tekrarAlan.classList.toggle('has-error', tutmuyor); }
                    }
                    if (tutmuyor) {
                        ysTekrar.setAttribute('aria-invalid', 'true');
                    } else {
                        ysTekrar.removeAttribute('aria-invalid');
                    }
                    if (ysGonder) {
                        ysGonder.disabled = !(kurallarTamam() && ysTekrar.value !== '' && ysTekrar.value === ysYeni.value);
                    }
                };

                ysTekrar.addEventListener('input', eslesmeDenetle);
                ysYeni.addEventListener('input', eslesmeDenetle);
                eslesmeDenetle();
            }
        })();
