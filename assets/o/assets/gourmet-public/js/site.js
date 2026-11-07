const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setPageLocked(locked) {
    document.documentElement.style.overflow = locked ? 'hidden' : '';
}

function focusableElements(container) {
    return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.offsetWidth > 0 || element.offsetHeight > 0);
}

function createDialogController(dialog, overlay, closeButtons = []) {
    if (!dialog || !overlay) {
        return null;
    }

    let previouslyFocused = null;

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            close();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const elements = focusableElements(dialog);

        if (elements.length === 0) {
            return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const open = () => {
        previouslyFocused = document.activeElement;
        dialog.removeAttribute('inert');
        dialog.classList.add('show');
        overlay.classList.add('show');
        setPageLocked(true);
        document.addEventListener('keydown', handleKeydown);
        window.setTimeout(() => focusableElements(dialog)[0]?.focus(), 80);
    };

    const close = () => {
        dialog.classList.remove('show');
        overlay.classList.remove('show');
        dialog.setAttribute('inert', '');
        setPageLocked(false);
        document.removeEventListener('keydown', handleKeydown);
        previouslyFocused?.focus?.();
    };

    overlay.addEventListener('click', close);
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            close();
        }
    });
    closeButtons.filter(Boolean).forEach((button) => button.addEventListener('click', close));

    return { open, close };
}

const header = document.querySelector('.header[data-hero="1"]');

function updateHeader() {
    header?.classList.toggle('at-top', window.scrollY < 60);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.querySelectorAll('.acct-item').forEach((account) => {
    const trigger = account.querySelector('.acct-btn');

    trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = account.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(open));
    });
});

document.querySelectorAll('[data-lang-dropdown]').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.tb-lang-btn');

    trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(open));
    });
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.acct-item')) {
        document.querySelectorAll('.acct-item.open').forEach((account) => {
            account.classList.remove('open');
            account.querySelector('.acct-btn')?.setAttribute('aria-expanded', 'false');
        });
    }

    if (!event.target.closest('[data-lang-dropdown]')) {
        document.querySelectorAll('[data-lang-dropdown].open').forEach((dropdown) => {
            dropdown.classList.remove('open');
            dropdown.querySelector('.tb-lang-btn')?.setAttribute('aria-expanded', 'false');
        });
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
        return;
    }

    document.querySelectorAll('.acct-item.open, [data-lang-dropdown].open').forEach((element) => {
        element.classList.remove('open');
        element.querySelector('button')?.setAttribute('aria-expanded', 'false');
        element.querySelector('button')?.focus();
    });
});

const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const hamburger = document.getElementById('hamburger');
const drawerClose = document.getElementById('drawerClose');

function openDrawer() {
    drawer?.removeAttribute('inert');
    drawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    setPageLocked(true);
    drawerClose?.focus();
}

function closeDrawer() {
    drawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    drawer?.setAttribute('inert', '');
    hamburger?.setAttribute('aria-expanded', 'false');
    setPageLocked(false);
    hamburger?.focus();
}

hamburger?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerOverlay?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer?.classList.contains('open')) {
        closeDrawer();
    }
});

const footerColumns = document.querySelectorAll('.foot-col[data-facc]');
const mobileFooter = window.matchMedia('(max-width: 640px)');

function updateFooterColumns() {
    footerColumns.forEach((column) => {
        const trigger = column.querySelector('.fc-h');
        column.classList.toggle('facc-on', mobileFooter.matches);
        column.classList.remove('is-open');

        if (mobileFooter.matches) {
            trigger?.setAttribute('aria-expanded', 'false');
        } else {
            trigger?.removeAttribute('aria-expanded');
        }
    });
}

footerColumns.forEach((column) => {
    column.querySelector('.fc-h')?.addEventListener('click', () => {
        if (!column.classList.contains('facc-on')) {
            return;
        }

        const open = column.classList.toggle('is-open');
        column.querySelector('.fc-h')?.setAttribute('aria-expanded', String(open));
    });
});

updateFooterColumns();
mobileFooter.addEventListener('change', updateFooterColumns);

function wireTrack(trackId, previousId, nextId, distance) {
    const track = document.getElementById(trackId);

    if (!track) {
        return;
    }

    document.getElementById(previousId)?.addEventListener('click', () => track.scrollBy({ left: -distance, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
    document.getElementById(nextId)?.addEventListener('click', () => track.scrollBy({ left: distance, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
}

wireTrack('conceptTrack', 'conceptPrev', 'conceptNext', 500);
wireTrack('gmModTrack', 'modPrev', 'modNext', 460);
wireTrack('evTrack', 'evPrev', 'evNext', 400);

function openIfServerRequested(dialog, controller, triggerSelector) {
    if (!dialog?.hasAttribute('data-acilis') || !controller) {
        return;
    }

    // Odak dönüşü tetikleyiciye gitsin diye önce onu odaklıyoruz: controller.open() açılış
    // anındaki document.activeElement'i saklıyor ve kapanışta oraya dönüyor. Tetikleyici
    // gizliyse (mobilde akordeon içindeki "Mekân Öner") focus() sessizce başarısız olur ve
    // odak body'de kalır — kabul edilebilir yedek davranış.
    document.querySelector(triggerSelector)?.focus?.();
    controller.open();
}

const feedbackDialog = createDialogController(
    document.getElementById('fbModal'),
    document.getElementById('fbOverlay'),
    [document.getElementById('fbClose')],
);

document.querySelectorAll('[data-feedback-open]').forEach((button) => button.addEventListener('click', () => feedbackDialog?.open()));

// donör: https://gaviaworks-dev.github.io/DadaMentor/Gourmet/kunye.html (varliklar/build/assets/gourmet-BB1JjHfF.js)
// AK-16 kapandı: backend artık kanonun beş konusunu da kabul ediyor ve panellerin
// `disabled` öznitelikleri kaldırıldı, yani kullanıcı hangi paneli doldurursa doldursun
// kaydı gerçekten oluşuyor. Donörün u() fonksiyonu (aktif panelin alanlarını etkinleştirir,
// diğerlerini devre dışı bırakır) artık güvenle portlanabilir — S-04'ün sıralama gerekçesi
// ortadan kalktı.
const feedbackTopicInput = document.getElementById('fbTopicInput');

// donör: varliklar/build/assets/gourmet-BB1JjHfF.js — u()
//
// Beş konu panelinin her birinde `message` ve `email` adlı alanlar var. Panelleri yalnız
// CSS ile gizlemek yetmez: gizli alanlar da gönderilir ve PHP aynı adlı son değeri alır, yani
// kullanıcının doldurduğu panel boş bir panel tarafından ezilir. Donör bunu aktif panelin
// alanlarını etkinleştirip diğerlerini devre dışı bırakarak çözüyor — devre dışı alan
// gönderilmez. Sekme her değiştiğinde ve bir kez açılışta çalışır.
function fbAktifPaneliEtkinlestir() {
    document.querySelectorAll('#fbForm .fb-fields').forEach((panel) => {
        const aktif = panel.classList.contains('active');

        panel.querySelectorAll('input, select, textarea').forEach((alan) => {
            alan.disabled = !aktif;
        });
    });
}

document.querySelectorAll('#fbForm .fb-topic').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#fbForm .fb-topic').forEach((other) => other.classList.remove('active'));
        tab.classList.add('active');

        const topic = tab.getAttribute('data-topic');

        if (feedbackTopicInput) {
            feedbackTopicInput.value = topic;
        }

        document.querySelectorAll('#fbForm .fb-fields').forEach((panel) => {
            panel.classList.toggle('active', panel.getAttribute('data-for') === topic);
        });

        fbAktifPaneliEtkinlestir();
    });
});

fbAktifPaneliEtkinlestir();

const feedbackAlanInput = document.getElementById('fbAlanInput');

document.querySelectorAll('#fbForm .fb-chiprow .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('#fbForm .fb-chiprow .chip').forEach((other) => other.classList.remove('active'));
        chip.classList.add('active');

        if (feedbackAlanInput) {
            feedbackAlanInput.value = chip.getAttribute('data-alan');
        }
    });
});

const suggestionDialog = createDialogController(
    document.getElementById('moModal'),
    document.getElementById('moOverlay'),
    [document.getElementById('moClose'), document.getElementById('moCancel')],
);

document.querySelectorAll('[data-mo-open]').forEach((button) => button.addEventListener('click', () => suggestionDialog?.open()));
document.getElementById('mekanOnerBtn')?.addEventListener('click', () => suggestionDialog?.open());

// AK-11: gönderim POST-Redirect-GET ile geri döndüğünde başarı bloğu ve hata bandı modalın
// İÇİNDE render ediliyor ama modal `inert` kapalı geliyordu — kullanıcı ne referansını ne
// hatasını görüyordu. Sunucu sonucu olan modali `data-acilis` ile işaretler
// (layouts/site.blade.php), burada açıyoruz. Her modal kendi error bag'ine bakar, o yüzden
// bir formun hatası diğerinin modalini açmaz.
openIfServerRequested(document.getElementById('fbModal'), feedbackDialog, '[data-feedback-open]');
openIfServerRequested(document.getElementById('moModal'), suggestionDialog, '[data-mo-open]');

// donör: https://gaviaworks-dev.github.io/DadaMentor/Gourmet/kunye.html (varliklar/build/assets/gourmet-BB1JjHfF.js)
const suggestionFileInput = document.getElementById('moFile');
const suggestionFileLabel = document.getElementById('moUpLabel');
const suggestionFileWrapper = document.getElementById('moUp');
const suggestionFileDefaultLabel = suggestionFileLabel
    ? suggestionFileLabel.getAttribute('data-default') || suggestionFileLabel.textContent
    : '';

suggestionFileInput?.addEventListener('change', () => {
    if (suggestionFileInput.files?.length) {
        suggestionFileLabel.textContent = suggestionFileInput.files[0].name;
        suggestionFileWrapper?.classList.add('has-file');
    } else {
        suggestionFileLabel.textContent = suggestionFileDefaultLabel;
        suggestionFileWrapper?.classList.remove('has-file');
    }
});

const locationDialog = createDialogController(
    document.getElementById('lkModal'),
    document.getElementById('lkOverlay'),
    [document.getElementById('lkClose'), document.getElementById('lkSkip')],
);

document.querySelectorAll('[data-location-trigger]').forEach((button) => button.addEventListener('click', () => locationDialog?.open()));
// Seçim sunucuya yazılır: donörün `data-set-url` / `data-dismiss-url` sözleşmesi. Eskiden
// satıra tıklamak yalnız modali kapatıyordu — kabuğun her sayfasında duran ölü bir kontroldü.
// Çerez bandı da aynı sözleşmeyi kullandığı için ad konuma özel olmaktan çıkarıldı: her ikisi de
// "tercihi POST et, denetleyici `back()` (302) dönsün" kalıbı.
function tercihGonder(url, govde) {
    if (!url) {
        return Promise.resolve(false);
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    return fetch(url, {
        method: 'POST',
        redirect: 'manual',
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: govde,
        // `keepalive`: seçimden hemen sonra bağlantıya tıklayan ziyaretçide istek belgeyle birlikte
        // iptal edilmesin. Ölçüldü 2026-09-15 (@390, POST yanıtı BEKLENMEDEN gezilince): tercih
        // çerezi bir sonraki sayfaya yetişmiyor ve bant orada bir kez daha basılıyordu — "Reddet
        // kaydedilmiyor" bulgusu buydu, ret ile kabul arasında fark yoktu (ikisi de aynı yarışı
        // kaybediyor). Donörün canlı kopyası da bu POST'u `keepalive: true` ile atıyor.
        keepalive: true,
    })
        // Denetleyici `back()` (302) döner, JSON değil; kaydet düğmesindeki ile aynı okuma.
        .then((yanit) => yanit.type === 'opaqueredirect')
        .catch(() => false);
}

const konumModali = document.getElementById('lkModal');

document.querySelectorAll('#lkList .lk-row').forEach((satir) => {
    satir.addEventListener('click', () => {
        const ulke = satir.dataset.country;

        tercihGonder(konumModali?.dataset.setUrl, `ulke=${encodeURIComponent(ulke ?? '')}`).then((tamam) => {
            if (!tamam) {
                toastGoster('Konum tercihin kaydedilemedi. Lütfen tekrar dene.');

                return;
            }

            document.querySelectorAll('#lkList .lk-row').forEach((digeri) => {
                const secili = digeri === satir;
                digeri.classList.toggle('is-selected', secili);
                digeri.setAttribute('aria-selected', String(secili));
            });

            const ad = satir.querySelector('.lk-name')?.textContent?.trim() ?? '';
            toastGoster(`${ad} ${konumModali?.dataset.msgSelectedSuffix ?? ''}`.trim());
        });

        locationDialog?.close();
    });
});

document.getElementById('lkSkip')?.addEventListener('click', () => {
    tercihGonder(konumModali?.dataset.dismissUrl, '');
});
document.getElementById('lkSearchInput')?.addEventListener('input', (event) => {
    const query = event.currentTarget.value.toLocaleLowerCase('tr').trim();
    const row = document.getElementById('lkRow-tr');
    const matches = !query || row?.dataset.search?.includes(query);

    if (row) {
        row.hidden = !matches;
    }

    const empty = document.getElementById('lkEmpty');

    if (empty) {
        empty.hidden = Boolean(matches);
    }
});
// Donörün kabuğu her sayfada paylaşılan bir `#keToast` taşıyor; `.ke-toast` CSS'i zaten
// vendor edilmişti (`--bc-lift` ile çerez bandının üstüne kalkıyor) ama markup da, onu
// gösteren tek bir satır da yoktu. Sonuç: sayfa yenilemeden çalışan her eylem sessizdi —
// `data-save-toggle` kalbi çeviriyor, konum düğmesi izin reddedilince yalnız TR satırına
// focus atıyordu. Kullanıcı ne olduğunu hiçbir yerden öğrenemiyordu.
const toastEl = document.getElementById('keToast');
const toastMsgEl = document.getElementById('keToastMsg');
let toastZamanlayici = null;

function toastGoster(mesaj, { yumusak = false } = {}) {
    if (!toastEl || !toastMsgEl || !mesaj) {
        return;
    }

    const cerezBandi = document.getElementById('cookieBanner');
    const kalkis = cerezBandi?.classList.contains('show') ? cerezBandi.offsetHeight + 16 : 0;
    toastEl.style.setProperty('--bc-lift', `${kalkis}px`);

    toastMsgEl.textContent = mesaj;
    toastEl.classList.toggle('soft', yumusak);
    toastEl.classList.add('show');

    window.clearTimeout(toastZamanlayici);
    toastZamanlayici = window.setTimeout(() => toastEl.classList.remove('show'), 4000);
}

// Mağaza düğmeleri: donörün paketi `.app-btn[data-app-soon]` düğümlerine tıklama bağlayıp
// mesajı `#keToast`ta gösteriyor (kaynak okundu, kip birebir aynı). Bizde düğmeler `disabled`
// duruyordu — tıklayınca hiçbir şey olmuyordu, yani ölü düğme. Metin markup'tan gelir,
// burada uydurulmaz; sözleşme donörün `data-app-soon` özniteliği.
document.querySelectorAll('.app-btn[data-app-soon]').forEach((dugme) => {
    dugme.addEventListener('click', () => toastGoster(dugme.dataset.appSoon));
});

/** Mesaj metinleri donörün `#lkModal` üzerindeki `data-msg-*` sözleşmesinden okunur. */
function konumMesaji(anahtar) {
    return document.getElementById('lkModal')?.dataset[anahtar] ?? '';
}

document.getElementById('lkGeoBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
        toastGoster(konumMesaji('msgGeoUnsupported'));

        return;
    }

    navigator.geolocation.getCurrentPosition(
        () => {
            toastGoster(konumMesaji('msgGeoSuccess'));
            locationDialog?.close();
        },
        (hata) => {
            const anahtar = hata?.code === hata?.PERMISSION_DENIED
                ? 'msgGeoDenied'
                : hata?.code === hata?.TIMEOUT ? 'msgGeoTimeout' : 'msgGeoGeneric';
            toastGoster(konumMesaji(anahtar));
            document.getElementById('lkRow-tr')?.focus();
        },
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    );
});

const loginDialog = createDialogController(
    document.getElementById('lgGate'),
    document.getElementById('lgOverlay'),
    [document.getElementById('lgClose')],
);

// Donörde giriş kapısı tetikleyen eyleme göre kişiselleşiyor: düğme `data-lg-title` /
// `data-lg-desc` taşıyor ve modal onu basıyor. Markup bizde zaten vardı (ör.
// `site/anasayfa.blade.php:208`) ama hiçbir yerde okunmuyordu — kapı her seferinde jenerik
// "Bu işlem için giriş yap" metnini gösteriyordu.
const lgBaslikEl = document.getElementById('lgGateTitle');
const lgAciklamaEl = lgBaslikEl?.nextElementSibling?.tagName === 'P' ? lgBaslikEl.nextElementSibling : null;
const lgVarsayilanBaslik = lgBaslikEl?.textContent ?? '';
const lgVarsayilanAciklama = lgAciklamaEl?.textContent ?? '';

document.querySelectorAll('[data-lg-gate]').forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();

        if (body.classList.contains('is-auth')) {
            return;
        }

        if (lgBaslikEl) {
            lgBaslikEl.textContent = button.dataset.lgTitle || lgVarsayilanBaslik;
        }

        if (lgAciklamaEl) {
            lgAciklamaEl.textContent = button.dataset.lgDesc || lgVarsayilanAciklama;
        }

        loginDialog?.open();
    });
});

document.querySelectorAll('[data-future-link], [data-future-button]').forEach((element) => {
    element.addEventListener('click', (event) => event.preventDefault());
});

// Ölü kontrol envanteri A#1: "Kaydet" (kalp) düğmesi `data-save-toggle` taşıyordu ama hiçbir
// dinleyicisi yoktu — `[data-lg-gate]` yalnız girişsiz kullanıcıda modalı açıyor, girişliyken
// hiçbir şey yapmıyordu (yukarıdaki blok). Backend hazır: POST/DELETE /mekan/{mekan}/kaydet
// (`hesap.kayit.kaydet`/`hesap.kayit.kaldir`) ve artık /etkinlik/{etkinlik}/kaydet
// (`hesap.etkinlik-kayit.kaydet`/`.kaldir`) — ikisi de auth + yetenek middleware'li.
// Denetleyiciler `back()` (302) döner, JSON değil — bu yüzden `redirect: 'manual'` ile 3xx'i
// "opaqueredirect" olarak yakalayıp başarı sayıyoruz; okunabilir bir hata (403/404) geldiyse
// görünen durumu değiştirmiyoruz. Konu türü kartın (ya da düğmenin kendisinin) taşıdığı
// kimlik özniteliğine göre seçilir: anasayfadaki etkinlik kartları `data-etkinlik-id`
// taşıyor (AK-26); mekân kartları henüz taşımıyor — `data-mekan-id` bekleniyor, o alan
// gelene kadar mekân için bu blok kimlik bulamayıp sessizce no-op kalır, KASITLI.
document.querySelectorAll('[data-save-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
        if (!body.classList.contains('is-auth')) {
            return;
        }

        const mekanId = button.dataset.mekanId || button.closest('[data-mekan-id]')?.dataset.mekanId;
        const etkinlikId = button.dataset.etkinlikId || button.closest('[data-etkinlik-id]')?.dataset.etkinlikId;
        const hedefUrl = mekanId ? `/mekan/${mekanId}/kaydet` : etkinlikId ? `/etkinlik/${etkinlikId}/kaydet` : null;

        if (!hedefUrl) {
            return;
        }

        const kaydedildi = button.classList.contains('saved');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        fetch(hedefUrl, {
            method: kaydedildi ? 'DELETE' : 'POST',
            redirect: 'manual',
            headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
        })
            .then((response) => {
                if (response.type !== 'opaqueredirect') {
                    toastGoster('İşlem tamamlanamadı. Lütfen tekrar dene.');

                    return;
                }

                button.classList.toggle('saved', !kaydedildi);
                button.setAttribute('aria-pressed', String(!kaydedildi));

                const kalp = button.querySelector('i');
                kalp?.classList.toggle('fa-solid', !kaydedildi);
                kalp?.classList.toggle('fa-regular', kaydedildi);

                toastGoster(kaydedildi ? 'Kaydettiklerinden çıkarıldı.' : 'Kaydettiklerine eklendi.');
            })
            .catch(() => toastGoster('İşlem tamamlanamadı. Lütfen tekrar dene.'));
    });
});

// Ölü kontrol envanteri A#2: `data-locale-tab`/`data-locale-panel` yalnız admin
// `public/assets/gourmet-admin/yonetim.js`'te dinleniyordu; `hesap/kesif-tercihleri.blade.php`
// (bu dosyayı yükleyen layouts.site) sekmesi bu yüzden tıklanıyor, panel değişmiyordu. Aynı
// sınıf/aria davranışı `yonetim.js`'in `data-locale-tab` bloğundan birebir taşındı —
// `yonetim.js`'e dokunulmadı.
document.querySelectorAll('[data-locale-tab]').forEach((sekme) => {
    sekme.addEventListener('click', () => {
        const dil = sekme.dataset.localeTab;

        document.querySelectorAll('[data-locale-tab]').forEach((digerSekme) => {
            const secili = digerSekme === sekme;
            digerSekme.classList.toggle('aktif', secili);
            digerSekme.setAttribute('aria-selected', String(secili));
        });

        document.querySelectorAll('[data-locale-panel]').forEach((panel) => {
            panel.hidden = panel.dataset.localePanel !== dil;
        });
    });
});

// Ölü kontrol envanteri A#3: Mekân/Şehir alt süzgeç <select>'i (`data-cip-suzgec`) ve Fiyat
// aralık kaydırıcısı (`data-cip-aralik`) — donörde de bu özniteliklere bağlı sıfır dinleyici
// bulundu (donörün derlenmiş paketi + sayfa içi script'i kontrol edildi), yani bu blok
// donörden PORTLANMIŞ değil, bu projenin kendi filtre mantığı. Süzgeç aynı `.kart-govde`
// içindeki `.cipler[data-alan]` grubunu `data-grup`'a göre daraltır ve `aria-describedby`
// hedefindeki `[data-suzgec-sayac]`'ı "görünen / toplam" ile günceller. Gizlenen çipler
// mevcut işaretli durumunu KAYBETMEZ (`hidden`, `checked`'ı sıfırlamaz) — süzgeç yalnız
// aramayı kolaylaştırır, önceki seçimi silmez.
document.querySelectorAll('[data-cip-suzgec]').forEach((suzgec) => {
    const cipGrubu = document.querySelector(`.cipler[data-alan="${suzgec.dataset.cipSuzgec}"]`);

    if (!cipGrubu) {
        return;
    }

    const cipler = [...cipGrubu.querySelectorAll('.cip')];
    const toplam = cipler.length;
    const sayacHedefi = suzgec.getAttribute('aria-describedby');
    const sayac = sayacHedefi ? document.getElementById(sayacHedefi)?.querySelector('[data-suzgec-sayac]') : null;

    suzgec.addEventListener('change', () => {
        const secim = suzgec.value;
        let gorunen = 0;

        cipler.forEach((cip) => {
            const eslesiyor = !secim || cip.dataset.grup === secim;
            cip.hidden = !eslesiyor;

            if (eslesiyor) {
                gorunen += 1;
            }
        });

        if (sayac) {
            sayac.textContent = `${gorunen} / ${toplam}`;
        }
    });
});

// Fiyat kaydırıcısı donörde forma veri göndermiyor (`name` yok) — bu KASITLI, kaydırıcıya
// isim eklenip veri gönderiyormuş gibi yapılmadı. Yalnız kendi etiketini
// (`data-aralik-etiket`) ve `aria-valuetext`'i, kendi `<datalist>`'indeki seçenek
// etiketleriyle günceller; etiket metinleri markup'tan okunur, burada tekrar yazılmaz.
document.querySelectorAll('[data-cip-aralik]').forEach((kaydirici) => {
    const liste = kaydirici.list;

    if (!liste) {
        return;
    }

    const etiketler = new Map([...liste.options].map((secenek) => [secenek.value, secenek.label]));
    const etiketHedefi = kaydirici.getAttribute('aria-describedby');
    const etiket = etiketHedefi ? document.getElementById(etiketHedefi)?.querySelector('[data-aralik-etiket]') : null;

    kaydirici.addEventListener('input', () => {
        const metin = etiketler.get(kaydirici.value) ?? '';

        if (etiket) {
            etiket.textContent = metin;
        }

        kaydirici.setAttribute('aria-valuetext', metin);
    });
});

// Tercih artık SUNUCUDA yazılıyor ve kabuk bandı basıp basmayacağına render anında karar
// veriyor (CerezTercihiDenetleyicisi + layouts/site.blade.php). Bu blok eskiden çerezi
// `document.cookie` ile yazıp okuyordu; sunucu o çerezi hiç görmediği için bant HER sayfada
// basılıp ilk kareden sonra burada gizleniyordu — yanıp sönmenin kaynağı buydu. Artık tercihi
// olan ziyaretçide `#cookieBanner` DOM'da HİÇ yok, aşağıdaki isteğe bağlı zincir sessizce boşa
// düşer.
const cookieBanner = document.getElementById('cookieBanner');

const cookieTercihiniKaydet = (tercih) => {
    // Bandı iyimser kapatıyoruz (donörde de seçim anında kapanıyor); POST düşerse geri açıp
    // haber veriyoruz, yoksa kullanıcı kaydedildiğini sanır ve bir sonraki sayfada tekrar görür.
    cookieBanner?.classList.remove('show');
    updateBottomNavigation();

    tercihGonder(cookieBanner?.dataset.kaydetUrl, `tercih=${encodeURIComponent(tercih)}`).then((tamam) => {
        if (tamam) {
            return;
        }

        cookieBanner?.classList.add('show');
        updateBottomNavigation();
        toastGoster('Çerez tercihin kaydedilemedi. Lütfen tekrar dene.');
    });
};

document.getElementById('cookieAccept')?.addEventListener('click', () => cookieTercihiniKaydet('kabul'));
document.getElementById('cookieReject')?.addEventListener('click', () => cookieTercihiniKaydet('ret'));

const bottomNavigation = document.querySelector('.bottom-nav');
let lastScrollPosition = window.scrollY;

function updateBottomNavigation() {
    if (!bottomNavigation) {
        return;
    }

    const currentPosition = window.scrollY;
    const cookieVisible = cookieBanner?.classList.contains('show');
    const shouldHide = cookieVisible || (currentPosition > 80 && currentPosition > lastScrollPosition + 12);
    bottomNavigation.classList.toggle('bn-hidden', shouldHide);
    bottomNavigation.classList.toggle('show', !shouldHide);
    lastScrollPosition = currentPosition;
}

window.addEventListener('scroll', updateBottomNavigation, { passive: true });
updateBottomNavigation();

const toTop = document.getElementById('toTop');

function updateToTop() {
    const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    toTop?.classList.toggle('show', window.scrollY > 620 && remaining > 120);
}

toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
window.addEventListener('scroll', updateToTop, { passive: true });
updateToTop();

const pageMain = document.getElementById('pageMain');
const footer = document.querySelector('.footer');

function updateDesktopFooterClearance() {
    if (!pageMain || !footer) {
        return;
    }

    pageMain.style.marginBottom = window.matchMedia('(min-width: 1025px)').matches ? `${footer.offsetHeight}px` : '';
}

updateDesktopFooterClearance();
window.addEventListener('load', updateDesktopFooterClearance);
window.addEventListener('resize', updateDesktopFooterClearance);
document.fonts?.ready?.then(updateDesktopFooterClearance);
