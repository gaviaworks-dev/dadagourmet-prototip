# Reklam çekirdeği · AŞAMA 2 sözleşmesi

reklam-cekirdek, 11 Kas 2026. Bağlayıcı yerleşim kaynağı: `DadaGourmet-panel/tasks/REKLAM-YERLESIM.md` (alan kodları, bütçe,
öncelik, reklamsız sayfalar). Kanon: panel `public/reklam/*` ve `resources/views/components/reklam/*` (Gastro donörü).
Referans uygulama: **Mekânlar** (`/mekanlar/?reklam=1`).

## Açma / kapama (değişmedi, şerit YOK)

- Başlıktaki ve çekmecedeki **Reklamlar** anahtarı, `?reklam=1` / `?reklam=0`, `localStorage dg-reklam` (durum `assets/js/prototip.js`).
- Üstteki "Reklam önizlemesi açık" bilgi şeridi **Beyar kararıyla kalktı** (11 Kas). Şerit ya da benzeri bir not EKLEMEYİN.
  Reklamın kendi "Sponsorlu" etiketi kalır.
- Kapalıyken: hiçbir reklam dosyası yüklenmez, köke sınıf yazılmaz (anahtarın `rk-acik`ı hariç), işaretler `<template>` olduğu için boyanmaz ve yer tutmaz.

## Dosyalar

| Dosya | Ne |
|---|---|
| `_src/veri/reklam-markalar.json` | Markalar (grup ana/benzer, kategori, ad, renk, logo, sektör, dokümandaki rol/paket/pilot). Bir marka bir satır. |
| `_src/veri/reklam-kreatifler.json` | Alan kodu → kreatif ya da havuz (dizi). Bir alan bir satır. Bütün REKLAM-YERLESIM kodları hazır (RT-* hariç). |
| `_src/veri/reklam-yerlesim.json` | Sayfa → `yol` (data-yol düzenli ifadesi), `butce`, `oncelik`, `standart`, `betik`; `reklamsiz` listesi; `kurallar`. |
| `_src/araclar/reklam-veri.mjs` | Derlemede `assets/js/reklam/veri.js` üretir (MarkaRengi renk satırları dahil). Elle düzenlemeyin. |
| `assets/js/reklam/reklam.js` | Çekirdek: anahtar, yükleme, işaret doldurma, bütçe, marka tavanı, native liste, mobil %30, standart katman, pop-up. |
| `assets/js/reklam/bilesen.js` | Bileşen kütüphanesi (`window.dgReklamBilesen`), kanon DOM. |
| `assets/js/reklam/interaktif.js` | Kapatılabilir şerit + açılır pano davranışı (`window.dgReklamInteraktif`). |
| `assets/js/reklam/interaktif/*.js` | reklam-interaktif: kreatif içi ARAÇLAR (`window.dgReklamArac`). `ortak.js` kabuk (şerit → akıcı pano, 640 px altında `dialog.rk-foto-mobil.rk-ia-sayfa`, Escape, odak, ölçüm olayı `dg-reklam-olay`), `aksam-secici.js`, `tadim-menusu.js`, `kahve-ilham.js`. Yalnız sayfadaki kreatiflerde `arac` varsa yüklenir. |
| `assets/css/reklam/ek/interaktif.css` | Araçların ek stili (`.rk-ia*`; kanon dosyalarına dokunmaz). |
| `assets/js/reklam/nokta.js` | Noktalı görsel (hotspot) motoru (`window.dgReklamNokta`, bileşen `B.nokta`). |
| `assets/js/reklam/sayfa/<betik>.js` | Sayfaya özel çiziciler (yalnız reklam açıkken yüklenir). Örnek: `sayfa/mekanlar.js`. |
| `assets/css/reklam/{gourmet-tokenlar,reklam,standart,dugme}.css` | Kanon stil: panel `public/reklam/` kopyası (yalnız `@import` yolu göreli). DÜZENLEMEYİN. |
| `assets/css/reklam.css` | Anahtar + Gourmet uyarlamaları (kanonun üstüne). Ekleriniz buraya, etiketli blok olarak. |
| `assets/g/medya/reklam/marka/` | **Bütün marka logoları tek klasörde**; kaynak listesi `KAYNAKLAR.md`. Yeni logo eklerseniz oraya satır yazın. |

## Sayfaya reklam koymak (AŞAMA 2'nin tek işi)

1. Sayfa kaynağına (`_src/sayfalar/...`) işaret koyun; reklam işaretin **hemen önüne** basılır:
   ```html
   <template data-rk-yer="EL-T1"></template>
   ```
   - Native liste (FEED): `<template data-rk-yer="EL-FEED" data-rk-liste="#evGrid"></template>` (işaret listenin DIŞINDA durabilir;
     `data-rk-liste` kapsayıcının seçicisi). İsteğe bağlı `data-rk-sutun` (vars. 3), `data-rk-satir` (vars. 2).
     Liste kabı her çizimde yeniden basılıyorsa `data-rk-liste-kok="#sabitKok"` verin: kap kökün içinde `data-rk-liste` ile her seferinde
     yeniden bulunur (örnek Mekân Bul: `data-rk-liste-kok="#mbGruplar" data-rk-liste=".mb-res-group .mkl-grid"`). Sayfada kural KOPYALAMAYIN.
   - Bölümler arası şerit kendi bandında: `data-rk-sar` → `div.wrap.rk-sar[data-rk-yer]` sarmalayıcısı (kanon).
   - HERO (`bicim: eslik`): işareti hero'nun `h1`inden sonra koyun (panel Blade sırası); çekirdek hero'ya (`.below-header`) marka perdesini kendisi ekler.
2. Sayfa `_src/veri/reklam-yerlesim.json`da yoksa bir satır ekleyin (hepsi hazır; `yol` regex'ini sayfanın `data-yol`una göre kontrol edin).
3. Kreatif `_src/veri/reklam-kreatifler.json`da hazır; değiştirecekseniz yalnız kendi satırınızı düzenleyin.
4. Varsayılan çizici yetmiyorsa `assets/js/reklam/sayfa/<betik>.js` yazın ve sayfa satırına `"betik": "<betik>"` ekleyin:
   ```js
   window.dgReklam.ciz('EL-T1', function (k, o) { return window.dgReklamBilesen.t1(k, o); /* HTML dizgisi ya da düğüm */ });
   ```
   `o = { kod, isaret, sayfa, temizle(fn) }` (liste çizicisinde `{ kod, isaret, sira, liste }`). `o.temizle` ile gözcü/dinleyici kaydedin; kapanınca çalışır.
5. Tam derleme: `node _src/build.mjs`.

Organik kart DOM'unu reklam için değiştirmeyin. Native kart organik kartın aynısıdır + sponsor işaretleri (`B.susle`).

## Genel API (`window.dgReklam`)

| Üye | |
|---|---|
| `acik()`, `ayarla(bool)` | prototip.js (değişmedi). Olay: `dg-reklam` (detail: bool). |
| `ciz(kod, fn)` | Alan çizicisi kaydı (varsayılanı ezer). |
| `kreatif(kod)`, `veri()` | Veri erişimi. |
| `yenile()` | Söküp yeniden yerleştirir (sayfa kendi DOM'unu büyük ölçüde değiştirdiyse). |
| `yogunluk()` | Mobil %30 yoğunluğunu yeniden ölçtürür (açılır içerik değişince). |
| `durum()` | `{ sayfa, butce, basilan[], markalar[], dusen[], gizlenen[], yapiskan }`, ölçüm için. |
| olay `dg-reklam-degisti` | Yerleştirme ya da kapanma bitince (detail: `{ acik, durum }`). |

## Bileşenler (`window.dgReklamBilesen`, kreatifin `bicim` alanı varsayılan çiziciyi seçer)

| `bicim` | Kanon DOM | Nerede | Gerçek hayattaki karşılığı |
|---|---|---|---|
| `eslik` | `a.rk-slot.rk-eslik` + hero perdesi | *-HERO | Bölüm sponsorluğu, "presented by" |
| `t1` (`boyut` 1200x240 / 728x90) | `aside.rk-slot.rk-bant.rk-leaderboard.rk-t1` | *-T1 | IAB Billboard / Leaderboard 728×90, mobil 320×50 |
| `filtre` | `aside.fct.rk-slot.rk-filtre` | *-FILTER | Filtre panelinde sponsorlu öneri |
| `serit` | `aside.rk-slot.rk-serit.rk-ince-banner` | AS-T1/M1/B1, LD/SR/HS-SB1 | İnce banner (Leaderboard sınıfı) |
| `pano` | `aside.rk-slot.rk-pano.rk-format-native_showcase` | MD-END | İçerik sonu native (Outbrain/Taboola) |
| `rectangle` | `aside.rk-slot.rk-rectangle` | MD-SB1, ED-SB1 | IAB Medium Rectangle 300×250 |
| `interaktif` | `div[data-rk-interaktif] > aside.rk-pisirme + .rk-pano[data-rk-panel]` (pano kapalı başlar, `reklam.css`) | AS-INT, MD-INT | IAB Expandable, Google Lightbox |
| `interaktif` + `arac` | `section.rk-slot.rk-ia` (şerit `.rk-ia-serit` + pano `.rk-ia-pano`) | ML-T1 havuzu (`aksam-secici`, `tadim-menusu`), MD-INT havuzu (`kahve-ilham`) | Sponsored results + rich media expandable; product comparison / OpenTable Experiences; quiz / product finder + sponsorlu tarif |
| `native` + `kart` (mekan, konsept, secki, etkinlik, lezzet, rehber) | organik kart + `[data-native-sponsor]`, `.rk-native-hap`, `.rk-native-kimlik` | *-FEED | Native in-feed (Yelp/TripAdvisor/OpenTable sponsorlu sonuç) |
| `nokta` | `figure.rk-slot.rk-nk-sahne` + `.rk-nk-nokta` | interaktif formatlar | Shoppable image / Pinterest Product Pins |
| `side`, `altbar`, `popup` | `aside.rk-std.rk-std-*` | standart katman (çekirdek basar) | Sticky rail 160×600, Mobile adhesion, Interstitial |

`kart: sonuc` (Mekân Bul) ve `kart: arama` (AR-FEED) için sayfa çizicisi yazın (şimdilik mekân kartına düşer). Rota (RT-*) biçimleri
Dada Route ajanınındır; markalar (Shell, Opet, Petrol Ofisi, BP, Togg, Tesla, Tesla Supercharger, Trugo, ZES, Eşarj) logolarıyla hazır.

## Havuz rotasyonu ve araçlar (reklam-interaktif, 11 Kas)

- Liste DIŞI bir alanın kreatifi dizi ise (havuz) çekirdek TEK kreatif basar: `?rk-kreatif=<id>[,<id>]` önizleme seçimi, yoksa her sayfa
  açılışında sıradaki (oturum sayacı `dg-rk-rot-<kod>`; canlıda gösterim payına göre ağırlıklı rastgele). Seçim sayfa ömrünce sabit;
  marka tavanına yalnız basılanın markası yazılır. Havuzdaki her kreatifin `id`si olmalı.
- **Gösterim payı (reklam-marka, 11 Kas; REKLAM-YERLESIM "Rotasyon" %25–100):** kreatif `pay` (yoksa 100). Oturum sayacı pürüzsüz ağırlıklı
  sıraya çevrilir (`payliSira`): ilk açılış en yüksek paylı kreatif; ana marka 100 + benzer marka 25 ise beş açılışta bir benzer marka
  (ölçüm: ED-SB1, LD-SB1, SR-SB1, HS-SB1 10 açılışta 8/2; MD-SB1 12 açılışta 8/2/2). Paylar eşitse sıra eskisi gibi düz döner.

## Marka seti (reklam-marka, 11 Kas; ana kaynak Sponsorluk Dokümanı)

- **Ana markalar** (`grup: ana`): BigChefs (Restoran deneyimi · Rehber destekçisi), Divan (Premium gastronomi · Avantaj ortağı),
  Kahve Dünyası (Kahve ve atölye · Deneyim ortağı), The House Café (Şehir ve brunch · Avantaj ortağı), Türk Hava Yolları (Gastronomi
  seyahati · Rota destekçisi). Bütün hero'lar, ana sayfa şeritleri (AS-T1/M1/B1), detay ana alanları (MD-SB1, MD-END, ED-SB1, LD-SB1,
  SR-SB1, HS-SB1) ve RT-TANITIM/RT-DURAK bunlarda; havuzda ilk sırada ve pay 100. Mekân detayında yalnız restoran dışı ana markalar
  (Kahve Dünyası, THY): aşağıda "Rakip restoran yok".
- **Benzer markalar** (`grup: benzer`, `benzeri`: aynı kategorideki ana marka): ana markaların önüne geçmez. Havuzda sonda, pay 25;
  liste (FEED) havuzlarında ana markalardan sonra. Marka tavanı 3 öncelik sırasıyla dolduğu için benzer marka yalnız ana markaların
  boş bıraktığı yerde basılır. Yeni: Mado, Simit Sarayı, Starbucks, Pegasus, Visa; kalanlar: Mastercard, Biletix, yakıt/şarj/EV (Route).
- **Organik kartta sponsorluk** (`organikEk`): native'in kaydı listede organik basılıysa tekrar kuralı native'i düşürür; sayfa çizicisi
  `R.ciz('KOD:organik', fn)` kayıtlıysa çekirdek `fn(k, { kod, isaret, kart, liste })` çağırır, çizici şeridi kartın içine kendisi koyar ve
  öğeyi döndürür (çekirdek `data-rk-birim` + `data-rk-organik-ek` yazar, kapanınca söker). Örnek: Etkinlikler "Biletler Biletix ile".
- Kreatifte `arac: "<ad>"` varsa varsayılan çizici `dgReklamArac[<ad>].ciz`, yerleşince `kur(el, k, o)`. Sayfa çizicisi (R.ciz) havuzda
  araçlı varyant varsa `R.arac(k)` ile sorar (örnek `sayfa/mekanlar.js` ML-T1).

## Rakip restoran yok · Beyar kararı (reklam-son-duzelt, 11 Kas)

REKLAM-YERLESIM'de karşılığı yok; Beyar kararı olarak çekirdekte genel kural.

- **Kural:** sayfa satırında `rakipRestoranYok: true` olan sayfada (bugün yalnız mekân detayı, `mekan_detayi`: `/mekan/*`, `/sube/*`)
  restoran kreatifi basılmaz. Akış alanları (MD-SB1, MD-INT, MD-END), standart katman (yan, alt bar, pop-up), araç yüklemesi ve
  `R.kreatif` aynı süzgeçten geçer (`reklam.js` `alan()`). Süzülen havuz boşsa alan düşer: `durum().dusen` "rakip restoran yok".
- **Restoran kreatifi:** markası restoran (`reklam-markalar.json` `restoran: true`; çok markalı birimde `markalar`ın herhangi biri) ya da
  bir mekânı hedefliyor (`mekan` alanı). Kreatifte `restoran: true|false` açıkça verilirse o geçer.
- **Restoran = yemek servisi yapan mekân ya da restoran markası:** BigChefs, Divan (Maromi, Divan Pastanesi), The House Café
  (kafe-restoran), Mado, Simit Sarayı (yemek servisi yapan zincirler).
- **İzinli (restoran değil):** Kahve Dünyası ve Starbucks (kahve zinciri, yemek servisi ana ürün değil), Türk Hava Yolları, Pegasus
  (seyahat), Mastercard, Visa (ödeme), Biletix (bilet), yakıt/şarj/EV markaları. Yeni marka eklerken `restoran` alanını düşünün.
- **Derleme denetimi** (`_src/araclar/reklam-veri.mjs`): `restoran` yalnız boolean; `rakipRestoranYok` sayfasının öncelik listesindeki her
  alanda restoran olmayan en az bir kreatif olmalı.
- **Mekân detayı havuzları:** MD-SB1 Kahve Dünyası (pay 100) · Mastercard, Visa (pay 25); MD-INT Kahve Dünyası "Keşiften ilhama" ve
  kanon şerit · Biletix (Salon du Chocolat, pay 25); MD-END Türk Hava Yolları · Kahve Dünyası (yedek). Rotasyon sayfada basılmamış markayı
  önceler: MD-SB1 Kahve Dünyası iken MD-INT Biletix, MD-END THY (3 birim, 3 marka). MD-SB1 Mastercard/Visa'ya döndüğünde MD-INT
  Kahve Dünyası basılır. STD-SIDE-LEFT'e Kahve Dünyası eklendi (detayda sol yan boş kalmasın).
- **Divan tadım menüsü karşılaştırıcısı** (`arac: tadim-menusu`, kreatif `ml-t1-divan-tadim`) Mekânlar ML-T1 interaktif havuzuna taşındı
  (REKLAM-YERLESIM ML-T1 "Standart + İnteraktif", Beyar onaylı). Sıra: "Bu akşam ne yesek?" (varsayılan) → tadım menüsü → BigChefs T1.

**Dada Route (reklam-rota, 11 Kas).** Tam ekran kabuk çekirdeği yüklemez: `rota-katman.js` etiketli bloğu yükler. Route'ta işaret yok;
`sayfa/rota.js` (sayfa satırı `betik: rota`) RT-* öğelerini canlı Route DOM'una ve haritaya kendisi koyar, `durum().rota` = `{ ogeler, istasyon,
sinir, yaricapKm }`. Bütçe birimi rotada ÖĞE (kampanya/marka): en çok 3; `basilan` o anki RT kodlarıdır. Kreatifler `reklam-kreatifler.json`
RT-* satırları (`bicim: rota`), EV motoru `ev-sarj.js` + `ev-sarj-veri.js`, ek stil `assets/css/reklam/ek/rota.css`. AS-INT çizicisi `sayfa/anasayfa.js`.

## Ülke ve bölge (rota-global, 11 Kas; Beyar: "Gourmet global bir proje")

Dada Route hiçbir yerde Türkiye varsaymaz. Kaynak `assets/js/rota-ulke.js` (`window.dgRotaUlke`).

- **Rotanın ülkeleri:** rota geometrisi ~10 km'de bir örneklenir, her nokta `ulke.js` `dgUlke.konumdan` (yoksa kaydın kutuları) ile ISO 3166-1
  alfa-2 koda çevrilir. Rota yoksa konum ülkesi (`dgUlke.kod`; `?ulke=FR` önizlemesi dahil). Hedefleme sırası REKLAM-YERLESIM "Hedefleme" satırıyla:
  rota bölgesi (rotanın ülkeleri) → konum (ülke) → küresel (`ulkeler` alanı olmayan kreatif). Rota alanlarına ayrı önizleme seçimi yok.
- **Veri ülke bazlı dosyalarda, satır biçimi her ülkede aynı, her satır `ulke` + `bolge` taşır** (TR il, FR département):
  yakıt `assets/js/rota-yakit-veri.js` (TR, sayfayla), `assets/js/rota-yakit-veri-fr.js`; şarj `assets/js/reklam/ev-sarj-veri.js` (TR, yalnız reklam
  açıkken), `assets/js/rota-sarj-veri-fr.js`. Rota bir ülkeden geçince o ülkenin eksik dosyası yüklenir ve dizinin SONUNA eklenir.
  Karar notu: ayrı dosya, çünkü kullanıcı yalnız rotasının ülkelerini indirir ve bir ülkenin tazelenmesi ötekinin önbelleğini bozmaz;
  canlıda karşılığı ülke sütunlu tek tablo ve rota başına sunucu sorgusu.
- **Marka eşleşmesi ülkeden bağımsız:** `reklam-markalar.json` `osm` (OSM `brand`, markasızsa `operator`, birebir). Şarj ağı anahtarı veri
  satırında (`network | brand | operator | name`).
- **Hedefleme alanları:** marka `ulkeler` (faaliyet ülkeleri, `*` küresel), kreatif `ulkeler` (kampanyanın hedef ülkeleri; markanınkinin alt
  kümesi, derleme denetler; yoksa markanınki). Yakıt pini, mola kartı ve şarj ağı kreatifi **istasyonun** ülkesiyle; rota destekçisi
  (RT-TANITIM, RT-DURAK) ve araç kampanyası **rotanın** ülkeleriyle eşleşir.
- **Fiyat:** teklif metnindeki `{fiyat}` kreatifin `fiyat` tutarıyla, hedef ülkenin para birimiyle (`dgRotaUlke.fiyat`, tr-TR biçimi).
  Prototipte kesin fiyat uydurulmaz: hiçbir kreatif `{fiyat}` kullanmıyor, teklifler kampanya metni biçiminde (ör. "%20 indirimli").
- **Araç kampanyası (EV planlayıcı):** rotanın ülkesini hedefleyen ilk RT-SARJ araç kreatifi (önizleme `?rk-kreatif=<id>`). Planlayıcıda
  yalnız o kampanyanın `araclar` listesi ve nötr "Başka bir elektrikli araç" seçilebilir; rakip marka aracı çıkmaz.
- **Şarj + yemek:** durak, menzil penceresinde 1 km içinde Dada mekânı olan şarj noktasından seçilir (varsa). Yoksa "Bu durağın yakınında
  Dada Gourmet mekânı henüz yok"; uzak mekân "şarj + yemek" diye eklenmez.
- **Şarj ağı:** RT-SARJ ağ kreatiflerinde `herAraca: true` = her elektrikli araca açık sponsor adayı. Aracın kendi ağı o ülkede kampanyalı
  değilse (Fransa'da Trugo) ya da "başka araç" seçiliyse koridorda en çok noktası olan herAraca ağ (eşitlikte kreatif sırası).

| Marka | Ülkeler (`ulkeler`) | Prototipte kreatif hedefi |
|---|---|---|
| Opet, Petrol Ofisi, Trugo, ZES, Eşarj | TR | TR |
| Shell | TR, FR, DE, GB, NL, BE, CH, AT, IT | TR (kreatif `rt-pin-shell`), FR (`rt-pin-shell-fr`) |
| BP | TR, FR, GB, NL, ES, CH, AT | TR, FR |
| TotalEnergies (yakıt + şarj) | FR, BE, LU, NL, DE | FR |
| Esso | FR, DE, BE, NL, GB, IT | FR |
| Ionity, Electra, Fastned | FR + ağın öbür ülkeleri | FR |
| Tesla, Tesla Supercharger, Türk Hava Yolları | * | Tesla ve Supercharger TR + FR (FR'de EV kampanyası Tesla); THY TR |
| Togg | TR, DE (satışta olduğu ülkeler) | TR (Paris – Lyon'da Togg kreatifi ve aracı çıkmaz) |

## Yayın politikası ülke bazlı, panel modeli (rota-global, 11 Kas; Beyar onaylı, panel YayinPolitikasi teyitli)

`_src/veri/reklam-yerlesim.json` `politika` (derleme `DG_REKLAM_VERI.politika`):

```json
"politika": { "alkol": { "TR": "kapali", "FR": "kapali", "*": "kapali" }, "kilitli": ["TR"], "alkolKreatif": false }
```

- **Ülke başına yalnız iki durum: `serbest` ya da `kapali`.** Ara düzey yok.
  - TR kilitli `kapali` (değiştirilemez; derleme TR'yi serbest yapan veriyi reddeder).
  - Öbür ülkeler ülke ayarıyla açılır; varsayılan `kapali` (`*`). Fransa da varsayılan kapalı.
- **Kapalı ülkede engellenenler (panelle aynı kapsam):**
  - kreatifin alkol bayrağı: kreatif `alkol: true` ya da metinde kadeh, şişe, bar, alkollü teklif;
  - alkollü içki markası: marka `alkol: true` ya da sektörü "Alkollü içki";
  - alkol bayraklı lezzeti ya da etkinliği hedefleyen kreatif (hedef bağındaki kayıt).
- **Mekânın `alkol_servisi` bayrağı yayını ENGELLEMEZ** (bilgi ve hedefleme).
  - Sponsorlu kartta adı ya da türü alkol servisini öne çıkaran mekân (bar, lounge, meyhane, kokteyl, şarap…) kreatife bar/kadeh taşımak
    sayılır: kapalı ülkede o kart basılmaz (`ev-sarj.js` `uygun(m, ulke)`).
  - Serbest ülkede bu süzgeç yok. Organik liste etkilenmez.
- **Prototipte hiçbir ülkede alkol reklamı yok:** `alkolKreatif: false`; derleme (`_src/araclar/reklam-veri.mjs`) bütün engel türlerini
  denetler ve reddeder.

## Çekirdeğin uyguladığı kurallar (sayfaya kural yazmayın)

- Bütçe ve öncelik (`reklam-yerlesim.json`); öncelik listesinde olmayan alan düşer; FEED tek birim.
- Farklı marka tavanı 3 (öncelik sırasıyla; havuz tavana göre süzülür). Standart katman sayfadaki markalardan seçer.
- Native: en üst, her N=2 satır (N × 3 kart), en alt; aynı reklam tekrarlanmaz, havuz bitince yer boş kalır. Liste yeniden çizilince yeniden yerleşir.
  reklam-duzeltici (11 Kas): **G1** sayfada liste üstü şerit (*-T1, ML-T1 interaktif dahil) basılıysa en üst native ilk satırın SONUNA kayar
  (ızgaranın gerçek sütun sayısı; tek sütunda ilk organik karttan sonra; tam satır native satır sınırına oturur). **Tekrar**: kreatifin `kayit`
  ya da `mekan` kimliği listedeki organik kartın `data-slug`ıyla aynıysa o kreatif basılmaz, sıradakine geçilir. **Kısa liste**: en alt yer
  yalnız önceki yerden en az bir tam satır sonra; native sayısı organik kart sayısını geçmez.
- Aynı kayıt bir kez (liste dışı alanlar): basılan kreatifin `kayit`/`mekan` kimliği sayfada başka alanda tekrar basılmaz (havuzda sıradakine
  geçilir, tek kreatifse alan düşer). Rotasyon sayfada henüz basılmamış markayı önceler.
- Rakip restoran yok (Beyar kararı): sayfa satırında `rakipRestoranYok` → restoran markalı ya da mekân hedefli kreatif basılmaz (yukarıda).
- Aynı görünüm grubu: sayfa satırında `ardArda: [["MB-T1", "MB-FILTER"]]` gruptan yalnız önceliği yüksek olanı basar (ilk sonuçtan önce tek reklam).
- Mobil (≤767): reklam yükseklikleri toplamı `main`in %30'unu aşarsa sondan başa `data-rk-yogunluk-gizli`.
- Yapışkan en çok 1: ≥1600 px'te side çifti (hero ve altbilgide gizli, Görüş Bildir sekmesinden uzak), altında alt bar. Marka seçimi
  (reklam-duzeltici): tavan izin veriyorsa sayfada basılmamış marka, yoksa akışta en az birimi olan marka (hero rozeti sayılmaz; eşitlikte ilk
  birimi en aşağıda olan); side çiftinin iki yanı farklı marka
  (eylem çubuğu ya da telefon alt çubuğu varsa yok). Kapatılan yapışkan 24 saat gelmez.
- Pop-up: oturumun ilk reklamlı sayfasında yok, sonra 9 sn gecikmeyle, oturumda bir, 10 dakikada bir.
- Reklamsız sayfalar (`reklamsiz`): giriş, kayıt, şifre; Hesabım ayarlar/bildirimler/çözüm/ödemeler/paketler/keşif tercihleri; yasal,
  künye, hakkımızda, iletişim; yönetim, işletme, ekran haritası; Pro. Buralara işaret KOYMAYIN.
- Bağlar (reklam-duzeltici, 11 Kas; tek kaynak `B.bag`): `hedef` kökten göreli ise prototip içi bağ (ilgili mekân, seçki, etkinlik);
  tam adres ise (Dada Gastro tarifi) ya da `hedef` yoksa markanın resmi sitesi (`reklam-markalar.json` `site`) yeni sekmede,
  `rel="sponsored noopener"`. "Örnek yerleşim" bildirimi yalnız yedek (veride sitesi olmayan marka kalmadı, Route markaları hariç).
- Ölçüm olayları (`dg-reklam-olay`, REKLAM-YERLESIM adları): seçici → `secici_secimi` + `oge`; öneri aracı → `oneri_araci` + `oge`;
  noktalı görsel → `gorsel_nokta_tiklamasi` + `oge` (nokta kimliği, `nokta.js`); seçicinin rezervasyon adımı `etkilesim {tur:'rezervasyon'}`.
- Yüzen düğmeler (başa dön, Route, küçük Mentör) reklam bağıyla kesişince çekilir: kabukta tek yer, `prototip.js` "Yüzen düğme × reklam çağrısı".

## Doğrulama (her AŞAMA 2 sayfası için)

1440 ve 390, `?reklam=1` / `?reklam=0`: taşma 0, konsol 0; kapalıda reklam 0; `dgReklam.durum()`'da `basilan.length ≤ butce`,
`markalar.length ≤ 3`; reklam × sabit arayüz (başlık, alt çubuk, Mentör, Route, başa dön, Görüş Bildir) çakışması 0.
