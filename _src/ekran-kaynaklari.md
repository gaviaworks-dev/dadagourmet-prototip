# Ekran kaynakları

Canlı Gastro sürümü: release 20261107-mentor-6700538df4. Çekim 7 Kas 2026, yalnız GET, User-Agent `DadaGourmetKanonBot/1.0`.

Girişli üye render'ı canlıda alınmadı: yerel Gastro kopyası (`6700538df4`, demo tohum) tohum hesabıyla açıldı. Tohum kişi ve hesap bilgisi depoya girmez.

Kısaltma: G = dadagastro.com canlı render, O = dadagourmet.com canlı render, P = `gaviaworks-dev.github.io/DadaMentor/Gourmet` prototipi, R = `Backend Projects/dadagourmet/docs/referans-mekan-detay/sayfa-dom.html`.

## Ekranlar

| Ekran | Yol | Donör | Sapma | Gerekçe |
|---|---|---|---|---|
| Kabuk: üst bant | tüm sayfalar | G `/giris` | Sol tarafta 203 mekân; sosyal blok yok; dil TR ve EN; Akademi ve Store yok | Mekân sayısı canlıdan. Gourmet'te doğrulanmış sosyal hesap yok. K17. Beyar kuralı |
| Kabuk: başlık | tüm sayfalar | G `/giris` | Mega menü yerine O'nun 5 kalemi; konum düğmesi eklendi; hesap menüsü Gourmet kalemleri ve Gurme Panelim; İşletmelerim yok, canlıda yalnız işletme yetkisi olana görünür ve örnek üye `kullanici`; zil rozeti yok | Menü içeriği markaya özel (kanon §5.1). K3 |
| Kabuk: çekmece | tüm sayfalar | G `/giris` | Kalemler Gourmet; "DadaGastro'ya Dön" yok; dil TR ve EN | Kanon soru 11 önerisi; K17 |
| Kabuk: altbilgi | tüm sayfalar | G `/giris` | Sütunlar, kurumsal ve yasal şerit O'dan; sosyal blok yok; mağaza düğmeleri pasif; telif satırında şirket unvanı | Kanon: sütun içerikleri Gourmet'e özel. Uygulama yayında değil. K5 |
| Kabuk: alt çubuk | tüm sayfalar | O `/` | 5 kalem Gourmet | Web için karar kanon soru 10'da açık; bugünkü hâl korundu |
| Çerez bandı | tüm sayfalar | G `/giris` | Yok | |
| Görüş Bildir | tüm sayfalar | G `/giris` | İlgili alan ve konu seçenekleri O'dan | Kanon §5.4: Gourmet listesi kalır |
| Mekân Öner penceresi | tüm sayfalar | O `/` | Yok | Altbilgi ve Mekânlar çağırıyor |
| Mentör düğmesi ve paneli | kabuklu tüm sayfalar; kimlik sayfaları, `yonetim`, `404` ve tam ekran (Dada Route) hariç | G `#dadaMentor` render'ı ve `/kabuk/mentor.css`, `/kabuk/mentor.js` (9 Kas); kapatma davranışı Diet prototipi `assets/js/mentor.js` | Renk Gourmet kanonu; balon ve açıklama Gourmet'e uyarlandı; üye çağrısı `/pro` yerine Paketlerim; kökte `mentor-panel floating` sınıfı yok; dış tıklama ve odak panelden çıkınca küçülür; altbilgi perdesi `#pageMain`in alt kenarıyla ölçülür | O'da düğme yok. Gourmet'te `/pro` yok, Pro kademesi Paketlerim'de. O gövde CSS'i (`gourmet.css`) eski `.mentor-panel` kurallarını `!important` genişlikle taşır. Hariç sayfalar G `config/mentor.php` kuralı. Dosyalar `_src/parcalar/mentor.html`, `assets/css/mentor-fab.css`, `assets/js/mentor-fab.js`, `assets/video/mentor-panel.mp4` |
| Ana sayfa | `/` | O `/`, kabuk G | Slogan ve konsept açıklaması değişti (K6); 0 mekânlı konsept gizli (K8); konsept sırası yerel ve tarihi önce; etkinlik kartları Türkiye önce. Vitrin bölümü (W1.2: Lüks, Esnaf, Üretici) Beyar 10 Kas kararıyla kalktı. Etkinliklerden sonra Gurme Lezzetler rayı (A1, Beyar 10 Kas): kap canlı `anasayfa.css` §4 `.gm-concept-teaser` / `.gl-teaser-grid` / `glTrack` (canlıda tanımlı, veri yokken basılmıyor), başlık kalıbı Etkinlikler bölümünün aynısı, kart Gurme Lezzetler liste kartı | W1.3a. Beyar talimatı K6'nın önüne geçer, slogan aynen kalır. Nasıl keşfetmek istersin? bölümüne Gurme Lezzetler kartı eklendi (canlıda yok, Beyar 9 Kas), dört kart 2×2 ızgara. Lezzet rayı `lezzetler.js` ile canlı "En Yeni" sırasından kendi kapağı olan ilk 8 yazıyı basar (canlıda kapaksız 193 yazı ortak yedek görseli taşır). Ray okları donör `kesfet.js` `wireTrackNav` (ana.js); önceden oklar bağlı değildi |
| Giriş | `/giris` | G `/giris` | Pano metni O'dan; sosyal düğme yok; pano görseli O `about-dining` | K4 notu: bağlı olmayan sağlayıcı gösterilmez. Canlı Gourmet'teki düğmeler `aria-disabled` |
| Kayıt | `/kayit` | G `/kayit` | Gastro alan seti; sosyal düğme yok; `hesap_turu` yok | Kanon soru 3 önerisi. Karar bekliyor sayılır |
| Şifre unuttum | `/sifremi-unuttum` | G `/giris` sifre panosu | Açık pano başlangıç hâli | Gastro'da aynı sayfada pano; Gourmet adresi korundu |
| Yeni şifre | `/sifre-yenile` | G `/giris` yeni-sifre panosu | Örnek e-posta; beş kural canlı | Token olmadığı için pano doğrudan açık |
| Hesabım | `/hesabim/ayarlar` | Yerel Gastro `6700538df4`, demo tohum üye render'ı; sekme rayı ve giriş cümlesi O `/hesabim/ayarlar` (9 Kas, kıyas hesabı) | Canlıdaki 7 sekme; Keşif tercihleri ayrı sayfaya taşındı; giriş cümlesinde Paketlerim ve Ödemelerim bağları. Profil panelinin canlıdan farkları (telefon, cinsiyet, e-posta düzenleme, görünürlük kartı) karar bekliyor | Beyar 9 Kas: dayanağı olmayan fark canlıya döner; kimlik kartında @kullanıcıadı kalır (Gastro kanonu) |
| Gurme Panelim | `/hesabim/gurme-panelim/` ve 5 alt yol | P `go-mekanlarim.html?auth=1` kabuğu ve `kalem-satiri`; CSS zinciri yerel Gastro Hesabım | 6 sekme bağlantılı; satırlar örnek etiketli; Değerlendirmelerim boş durum, gönderilen değerlendirme buraya düşer; Puan Durumu kural, sayaç ve hareket listesi | K3, W2.5, W2.4. Sahte değerlendirme yok. Puan değerleri şartnameden: yorum veya fotoğraf +15, öneri +50, puanlama +2, gerçekleşen rezervasyon +25; bekleyen puan onayda kesinleşir (§8 #6). Tutar örnekleri etiketli, işlemler bu tarayıcıda kalır |
| Üye alanı sayfaları | `/hesabim/listeler`, `/etkinlikler`, `/kesif-tercihleri`, `/paketlerim`, `/odemelerim`, `/cozum-merkezi`, `/bildirimler` ve sekme alt yolları | O, 9 Kas geçici yönetici hesabıyla ilk sekme render'ı; öbür sekmeler `DadaGourmet-acil` `4eb638c` `resources/views/hesap/*.blade.php` | Canlıda sekme `?sekme=`, burada alt yol; satırlar örnek etiketli; formlar bu tarayıcıya yazar. Ortak kalıp `_src/sayfalar/hesabim/_kalip.mjs` | Beyar 9 Kas. Etkinliklerim'in Rezervasyonlarım, Etkinlik Değerlendirmelerim, Etkinlik Önerilerim sekmeleri Gurme Panelim'e bağlanır; Mekânlarım Gurme Favorilerim'e gider |
| İşletme portalı | `/isletme/`, `/isletme/basvurular/yeni`, `/isletme/degisiklik-talepleri/…`, `/isletme/degerlendirmeler` | `DadaGourmet-acil` `4eb638c` `resources/views/isletme/**`, O `/isletme` | Canlı metin, alan ve durumlar prototip bileşenleriyle; Rezervasyon talepleri bölümü kalır | Beyar 9 Kas. Mekân sahipliği canlıda açılmadı |
| Mekânlar | `/mekanlar` | O `/mekanlar`, `?il[]=istanbul`, `?il[]=istanbul&ilce[]=beyoglu` | Grup adları doküman §16 adlarına çekildi; Enerji ve Araç Şarj grubu eklendi; sıfır sonuçlu seçenek gizli; canlı düzen: sol süzgeç, üç sütunlu ızgara, sayfa başına 12 kart, harita görünüm düğmesiyle açılır; kartta 4 eylem; Leaflet yerine MapLibre; canlı menünün 8 sıralaması çalışır; dört kartta örnek doğrulanmış nitelik (otopark/vale, glütensiz, evcil hayvan, çocuk alanı), "doğrulandı · prototip örneği" etiketli, süzgece girmez (Beyar, 9 Kas) | F1-F13, FH.1, FK.10-13, K7, K8. Şarj grubunun canlı sayacı yok; sayı basılmadı, örnek etiketli. Kart nitelik ikonları (W1.4) canlı süzgeç üyeliğinden: otopark ya da vale, glütensiz, evcil hayvan, bebek sandalyesi. Veride "çocuk alanı" yok, en yakın kayıt kendi adıyla yazılır; kaydı olmayan nitelikte ikon yok. Sıralama yerel veriden: Fiyat ve En Yakın (tarayıcı konumu) sıralar; Şimdi Açık ve Rezervasyon Uygunluğu canlı etkinlik listesindeki gibi süzer, açıklık çekim anına aittir; En Yüksek Puan ve En Çok Yorumlanan için değerlendirilmiş mekân yok, En Yeni için eklenme tarihi kopyada yok: liste Önerilen sırasında kalır ve bant bunu söyler. Canlı `gourmet-mekan-liste.js` yüklenmediği için aç, kapa ve Escape `mekanlar.js`te |
| Mekân detayı | `/mekan/mikla` | O `/mekan/mikla`, rezervasyon penceresi R | Rezervasyon düğmesi ve penceresi geri geldi; Dada Route bandı geri geldi; Ne Yenir ve Ne Alınır Genel Bakış içinde bölüm, sekme düğmesi bölüme kaydırır; tabak favorisi Gurme Favorilerim'e yazar; kapak 480 px; künye düğmeleri yok; harita MapLibre; takvim örnek | K2, W2.2, W3.3, K7. Metin talep dili (§8 #17). Pencerede ayrı alerjen notu; gönderim bu tarayıcıya yazılır, Rezervasyonlarım'da "Mekân sahibi onayı bekleniyor" satırı olur. Ne Alınır'da satış yok, "tescilli" sözü yok (§8 #10). Bilgi Hatası Bildir tetiği eklenmedi: A4 kararı açık. Yorumlar sekmesinde canlı `.rev-form` üç kritere çoğaltıldı; misafirde giriş kutusu |
| Mekân Bul | `/mekan-bul` | O `/mekan-bul` adım 1 render'ı; seçenek kümeleri O `/mekanlar` süzgeci (GET 10 Kas: konsept 19, mutfak 18, hizmet 18, beslenme 7, ulaşım 10); mutfak sekmesi kalıbı R eski repo `gourmet/mekan-bul/step3.blade.php` (`.mb-tabs`, sınıfları canlı `mekan-bul.css`'te); nitelik akordiyonu canlı adım 5 (`.mb-acc` + `.fct`); sonuç ekranı POST ile açıldığı için `sonuclar.blade.php`, `_sonuc-karti.blade.php` sınıf kümesi | Canlı 5 adım yerine 4 (Beyar revizesi 10 Kas, B1–B5): 1 Konum + Bütçe; 2 "Ne İçin?" konsept listesi "Ortam ve atmosfer" başlığıyla çoklu seçim, her seçenek ayrı ikon; 3 mutfak 3 sekme (Öğün ve Lezzet, Türk ve Yöresel, Dünya Mutfakları), yeni kalem yok; "Fark Etmez", "Yeni Bir Şey Denemek" ve serbest lezzet metni yok; 4 nitelikler 35 canlı etiketten 19 kısa kutu (birleşik etikette kodlardan biri yeter, ör. Otopark / Vale = otopark, özel otopark, vale) + canlı "Ne zaman gideceksin?" (şimdi açık, rezervasyon). Amaç adımı (Hızlı esnaf, Şef masası, Pazar kahvaltısı, Yol üstü) kalktı. Eşik %85 ve iki grup kalır (canlı %80 ve üç grup) | Beyar listesi patron dokümanının "3 adımlı karar akışı: deneyim amacı, konum & bütçe, nitelik" ifadesinden yenidir ve bağlayıcıdır. Oran `mekan-bul.js`: yalnız cevaplanan kriterler paydada; ağırlık canlı `MekanBulEslestirmeServisi::AGIRLIKLAR` (ortam 40, bütçe 20, mutfak 15, nitelik 15, şimdi açık 15, rezervasyon 10); canlı tüm hizmetleri tek 15'lik kriter sayar, prototip her nitelik kutusunu ayrı sayar. Araç `sayfa-mekan-bul.mjs` güncel: canlı adım 1 render'ından aynı sihirbazı üretir (10 Kas canlı kopyasıyla denendi, `#paneMekanBul` birebir); hero parallax katmanı eski çekimden kalma, araç üretmez. ₺, ₺₺ ve veri olmayan konsept, mutfak, nitelik kalemleri: boş sonuç ve öneri |
| Etkinlikler | `/etkinlikler` | O `/etkinlikler`, `?gorunum=takvim`, `?gorunum=harita`; veri 126 kayıt (`etkinlik-veri.mjs`, `etkinlik-gorunum.mjs`, yalnız GET) | Türkiye ve Uluslararası sekmesi, açılış Türkiye; önerilen sırada yaklaşan festival ve hasat önde; kart dibinde Randevu Oluştur; Liste, Takvim, Harita canlıdaki gibi, geçiş sayfa içinde; üç görünüm aynı süzgeci ve bölge sekmesini okur; beş sıralama kalemi canlı listelerin çekim anı kopyası; harita MapLibre; sıfır sonuçlu seçenek gizli | W1.3a, W1.3b, W3.4c, K7. Randevu yalnız bu tarayıcıda kalır, Rezervasyonlarım'a işlenir. Takvimde 390'da taşan son sütun `minmax(0,1fr)` ile düzeltildi |
| Etkinlik detayı | `/etkinlik-detay/?e=<slug>` | O `/etkinlikler/mff-orta-dogu-gida-fuari-2026` | Tek kalıp; başlık, tarih, yer, özet, görsel adresteki etkinlikten dolar; görüntülenme, organizatör, katılımcı satırı yok; yan sütunda Randevu Oluştur | 126 ayrı sayfa çekilmedi; veride olmayan alan basılmaz |
| Gurme Lezzetler | `/gurme-lezzetler` | O `/gurme-lezzetler`, `?kategori=`, `?siralama=populer`, `?sayfa=`; veri 440 kayıt (`lezzet-veri.mjs`, yalnız GET) | Kategori, En Yeni ve En Çok Okunan canlıdaki gibi sayfa yenilemeden; süzgeç ve sayfalama tarayıcıda çalışır; 24 kartlık sayfa. Arama `?q=` canlı parametresi (çip, sıralama ve sayfa bağları taşır); prototip başlık, özet, kategori ve etikette arar; boş sonuçta canlı `.lst-empty` bloğu. Etkin arama satırı (“…” için N içerik · Aramayı temizle) canlıda yok, sapma (C1, Beyar 10 Kas) | Kart DOM'u canlıdan tek kalıp (`parcalar/lezzet-kart.html`). Kart görselleri canlının 400 px sürümü. Canlı kapağı her istekte üç görselden biri; prototip `gurme-lezzetler/banner-g3-pilot.webp` görselinde sabit |
| Gurme Lezzet detayı | `/gurme-lezzet-detay/?l=<slug>` | O `/gurme-lezzetler/nohut-nasil-pisirilir` | Tek kalıp; başlık, kategori, tarih, süre, görsel adresteki yazıdan dolar; tam metin, güncelleme tarihi ve görüntülenme yalnız örnek yazıda; kalan yazılarda canlı kart özeti ve "prototip örneği" notu. Etiketler ve Paylaş her yazıda canlıdaki yerinde (C1, Beyar 10 Kas): etiketler 440 yazının canlı detayından (`lezzet-veri.mjs etiket`, 1404 etiket); etiket bağı canlıda süzgeçsiz `/gurme-lezzetler`, prototipte `gurme-lezzetler/?q=<etiket>`. Paylaş: Web Share varsa cihaz penceresi, yoksa canlı menü (X, WhatsApp, e-posta, kopyala); kopyalama bildirim verir, paylaşılan adres prototipteki yazı | 440 ayrı sayfa çekilmedi; veride olmayan alan uydurulmadı. İlgili Keşifler örnekte canlı seçim, kalanda aynı kategorinin ilk üç yazısı. Örnek dışı kapak 400 px |
| Şehir Rehberleri | `/sehir-rehberleri` | O `/sehir-rehberleri` | Yok | Sayaçlar ve kartlar canlı değerleridir; canlıda yayında tek rehber var, süzgeç yok |
| Şehir Rehberi detayı | `/sehir-rehberi-detay/?s=<slug>` | O `/sehir-rehberleri/istanbul` | Yok | Tek rehber olduğu için kalıp bu rehberin DOM'udur; sayaç satırı canlıdaki gibi `TR` ve `istanbul` yazar |
| Dada Route | `/dada-route` | O `/dada-route` ham HTML, `dada-route.js`, `dada-route.css`, Leaflet | Canlı betik değişmeden çalışır; sunucu uçlarını `rota-sahte.js` statik karşılar. Üstüne katmanlar, il kartları, örnek etiketleri eklendi. Katmanlar süzer: yalnız çizili rotaya 15 km içindeki noktalar pin ve liste olur, şarjda 20 km; Gastronomi kapanınca mekân pinleri ve alt liste gizlenir. Şarj noktasına 1 km içindeki mekân gerçek konumdan hesaplanır; nokta adları örnek. Ne Yenir, Ne Alınır çipi ve katman listesindeki Durak Yap tek tıkla ara durak ekler, canlı `mekaniDurakYap` yolunu kullanır; bunun için derleyici `dada-route.js`'e tek satırlık `window.dgRotaApi` açımı ekler. Ara durak sınırı 3'ten 9'a çekildi (canlı `config/dadaroute.php` 3). Rotayı telefona gönder örnek akışı aktarım düğmelerinin yanındadır. Navigasyona Aktar Google, Apple ve Yandex için duraklar ve seçilen mekânlardan koordinatlı gerçek adres üretir; Google 9, mobil tarayıcıda 3 ara durak, aşılırsa etap; Apple ve Yandex sınırı notla yazılır (`mobil-arastirma.md` §4.1). Hızlı filtre radius'u `--yuvarlak-cip`. Açılış canlıdaki gibi boş karşılama (Beyar, 9 Kas); `?ornek=1` İstanbul–İzmir örnek güzergâhını yükler | Beyar: altyapı kullanılacak. MapLibre geçişi K7 ile Faz 4'te. Panel solda. "Güvenli", "tescilli" yok |
| Dada Route · başlık, rota, yakıt verisi (10 Kas, D1 D2 D3) | `/dada-route` | Kilit: G `/kids` ve `/health` başlığı (`.pg-kids .header .brand::after`: GilroyXB 800, 16px, 640 altı 15px, mutlak konum). Rota: OSRM açık demo sunucusu (`router.project-osrm.org`, GET). Yakıt: OSM `amenity=fuel` (Overpass, ODbL) | Başlıkta ayraç ve "Dada Route" yazısı yerine alt marka kilidi: Gourmet logosu ve sağ üst çaprazında "Route" (Kids/Health'te alt kelime logonun altındadır; konum Beyar isteği). Rota çizgisi yolu izler: `rota-sahte.js` önce gömülü rotaya (`rota-osrm-gomulu.js`, beş pilot ve Ankara – Trabzon), sonra OSRM'e bakar; 7 sn'de yanıt yoksa yol ağı koridoruna düşer, o zaman "Örnek koridor" etiketi ve özet "Yaklaşık" satırı görünür. Dışarı giden tek istek bu: yalnız durak koordinatları. Mesafe ve süre OSRM'in (trafiksiz). İl kartları çizginin geçtiği iller: çizgi 2 km'de bir örneklenir, en yakın il ya da ilçe merkezinin ili. Yakıt: `rota-yakit-veri.js` 1358 noktalık koridor örneklemi, `DG_YAKIT` ve `DG_YAKIT_KAYNAK` | Canlıda rota sunucuda hesaplanır (`/dada-route/rota`, POST); prototipte POST yok, demo sunucu üretim için değildir. Faz 4 önerisi `tasks/rota-istasyon-api-notu.md` |
| Dada Route paneli (Beyar 10 Kas, D3–D9) | `/dada-route` | O canlı şarj kartı (`.yg-sarj`, `dada-route-sarj.css`), canlı alt kadran kartı (`.yg-dcard`, `proxLabel`, `sapmaMetni`); kanon §11 `.sekmeler.esit`, `.dugme.satir` köşesi, `--uyari` | Araç kanon segmenti (Yakıtlı / Elektrikli) tam genişlik; Elektrikli canlı "Şarj istasyonları" kartını, Yakıtlı aynı kalıpta "Yakıt istasyonları" kartını gösterir (`window.DG_YAKIT`, rota geometrisine 5 km, ülkeden bağımsız metin). Katmanlar'da yalnız haritada göster/gizle çipleri; ihtiyaç listesi alt şeritte Mekânlar'ın yanındaki İhtiyaçlar sekmesinde (İbadethane: cami, mescit, kilise, sinagog, cemevi, manastır; Dinlenme alanı; Karavan parkları), kart canlı `.yg-dcard` kalıbında, Rotaya ekle ara durak yolunu kullanır. "Güzergâhtaki noktalar" listesi ve "Enerji ve şarj", "Tarihi inanç yapıları" çipleri kalktı; şarj + yemek eşi canlı şarj kartının "Yakındaki mekânlar" satırında. Meşhurlar kartı: Ne Yenir? ve Ne Alınır? alt alta, en çok 5 satır, fazlası kart içinde kayar. Satır düğmesi köşesi `--yuvarlak-sm`; "Yola yakın" `--uyari`. Sapma toleransı tek satır segment (kısa ad, tam ad `title`), hızlı filtreler tek satır kayan şerit | 9 Kas "sapma çipleri sarar" kararı D9 ile kalktı. Şarj ve ihtiyaç noktaları örnek; yakıt verisi rota-harita dalında |
| Hakkımızda | `/hakkimizda` | O gövde, G zinciri | "81 il" yerine 15; "esnaf lokantası" cümlesi "mekân" oldu | Sabit sayı kuralı; K6 |
| Künye | `/kunye` | G `/kunye` | Unvan, Adres, E-posta Gastro değerleri; marka adı Gourmet | K5 güncellemesi: Gastro'da nasılsa öyle |
| İletişim | `/iletisim` | G `/iletisim` | Marka ve bağlam metni Gourmet; destek adresi yerine şirket e-postası; sosyal bağ yok | Canlı Gourmet sayfası eksik (MB 0.20). Gourmet destek adresi ölçülmedi |
| Hukuki örnek | `/yasal/kvkk` | O gövde, G zinciri | Unvan, Adres, E-posta Gastro değerleri; MERSİS, vergi ve KEP satırları ile taslak bandı yok | K5 güncellemesi: yer tutucu basılmaz |
| Ekran haritası | `/ekranlar` | Yok, derleyici çıktısı | Yeni | Onay turu için liste |

## Responsive turu

Kırılma noktaları `dadadiet-prototip` ile aynı: 640, 860, 1024. Kanon dosyaları değişmedi; düzeltmeler `assets/css/gourmet-sapma.css`, `prototip.css` üstünde. Şeritler kanon kalıbıyla kayar (`overflow-x:auto`, tek satır, gizli çubuk).

- Dada Route: 860 ve altında panel alttan açılan sayfa, canlı `Haritayı Gör / Listeyi Gör` yapısı; yarım hâlde son öğeye erişim payı eklendi. 1024 ve üstünde panel solda.
- Mekân detayı: 1024 ve altında özellik çipleri kaymaz, kopyalar gizlenir, sarılır.
- Mekânlar: ızgara canlıdaki kırılmalarla gider; kart adı, süzgeç satırı, etkinlik konumu kesilmez.
- Üye sayfaları: `gourmet.css` yüklenmediği için Route düğmesi ve başa dön kuralları `prototip.css`'e aynen alındı; seçili sekme açılışta görünür alana gelir.
- Süzgeç sayfası açıkken yüzen düğmeler gizlenir.
- Yasal menü 1024 ve altında tek satır kayan şerit; seçili kalem açılışta görünür. Kural `prototip.css`'te, çünkü kurumsal zincir `gourmet-sapma.css` yüklemiyor.
- Mekân Bul düğmeleri 640 ve altında tek satır. Ekran haritası başlığı sabit başlığın altında kalmaz.

## Rotayı telefona gönder

Donörü yok; yazılı sapma. Düğme Navigasyona Aktar kalıbında, pencere canlı `.yg-gate`. Örnek QR veri taşımaz ve okutulamaz; kısa bağ ayrılmış `.example` alan adında, metin olarak durur. Gerçek gönderim, numara, bağ, ağ isteği yok. Görünür `prototip örneği` etiketi taşır.

## Mobil uygulamaya taşınabilir parçalar

Native uygulama ayrı iştir, bu turda yapılmadı. Taşınırken ilk bakılacak parçalar:

| Parça | Dosya | Taşınan |
|---|---|---|
| Telefona gönder metni | `assets/js/rota-telefon-veri.js` | Adım metinleri, örnek kısa bağ |
| Telefona gönder akışı | `assets/js/sayfa/rota-telefon.js` | `rotaOzeti`, `goster`, `qrMatris`, `qrSvg`; gerçek QR gelince son ikisi değişir |
| Telefona gönder kabuğu | `_src/parcalar/rota-telefon.html` | Pencere iskeleti |
| Rota örnek verisi | `assets/js/rota-veri.js` | Güzergâh, katman noktaları, il kartları |
| Navigasyon bağları | `assets/js/sayfa/rota-katman.js` | `googleBag`, `appleBag`, `yandexBag`, `etaplar`: durak listesinden adres üretir |
| Mekân ve etkinlik verisi | `assets/js/mekan-veri.js`, `mekan-liste-veri.js`, `etkinlik-veri.js` | Liste ve süzgeç verisi |
| Dada Puan kuralı | `assets/js/prototip.js` `dgPuan` | Puan değerleri |
| Renk ve radius | `assets/g/kanon/tokenlar.css`, `kanon/markalar/gourmet.css` | Kanon token'ları |

## Puansız kart

Canlıda 203 mekânın değerlendirmesi yok. Kartta `★ –` basılmaz; derleyici `r-rate r-yok` parçasını siler, görüntülenme sayısı kalır. Puan gelen kartta `r-rate` olduğu gibi durur.

## Sıfır sonuç

Konsept kartları, konsept şeridi ve süzgeç seçeneklerinde 0 sonuçlu kalem gizlidir (W1.1, K8). Derleyici `/`, `/mekanlar`, `/etkinlikler` için denetler, kalırsa hata verir. Mekân Bul bilerek ayrıdır: Beyar talimatıyla veri olmayan seçenek görünür, boş sonuç ve öneri verir.

## Bağlar

Prototipte karşılığı olmayan iç bağ uyarı vermez, en yakın gerçek ekrana gider. Tablo `_src/build.mjs` `YEDEK`: mekân detayı Mikla'ya; `hesabim/*` Gurme Panelim sekmelerine ya da Ayarlar'a; `yasal/*` KVKK örneğine; işletme ve SSS İletişim'e; basın Hakkımızda'ya; Gurme Lezzetler, Şehir Rehberleri ve arama Mekânlar'a. Konum düğmesi canlı `#lkModal` penceresini açar, seçim sunucuya gitmez.

## Örnek üye

Ad, kullanıcı adı, e-posta, avatar harfi, üyelik başlangıcı ve paket tek yerden gelir: `_src/kabuk/ornek-uye.json`. Sayfada `{{uye.alan}}` yazılır, derleyici doldurur; `prototip.js` aynı değeri `dg-ornek-uye` etiketinden okur. Kimlik kartı Hesabım ve Gurme Panelim'de aynıdır: Gastro sırası, ad ve paket rozeti, `@kullanıcı`, giriş cümlesi, üyelik ve rozet. Kapak ve avatar düzenleme yalnız Hesabım'da, canlı modül bantlarında da yoktur.

## Demo oturum

Giriş, kayıt ve şifre ekranları sahte değerlerle dolu gelir; gönderim yapılmaz. Giriş ve kayıt üye durumuna geçirip Hesabım'a yönlendirir, şifre akışı ekranda ilerler, çıkış misafire döner. Durum `localStorage` `dg-oturum`; depo kapalıysa `?auth=1` bağlarda taşınır. Üye sayfası misafire açılırsa girişe yönlenir, girişten sonra aynı sayfaya döner.

## Mekânlar süzgeci

Veri `_src/araclar/mekan-veri.mjs` ile canlı `/mekanlar` ve `/mekanlar/harita-verisi` uçlarından, yalnız GET ile alındı. Her seçenek canlı süzgeçten soruldu; sayaç ve harita sayısı 12 grupta birebir tuttu. 203 mekân, 15 il, 41 ilçe, 128 semt. Semt 197 mekânda dolu, 6 mekânda boş; boş olan uydurulmadı. Açık Olma sayaçları çekim anına aittir, statik kopyadır.

Enerji ve Araç Şarj grubu süzmez: kamuya açık uçlarda mekân başına şarj verisi yok. Seçenekler pasif, örnek etiketli. Sıralama menüsü prototipte çalışmaz. Yalnız Mikla'nın detay sayfası var; diğer kartlar Mikla örnek detayına gider.

## Altbilgi perdesi

Gastro kanonu: 641 px ve üstünde altbilgi `position:fixed`, `#pageMain` alt boşluğu altbilgi boyuna eşit; içerik kaydıkça altından açılır. Tam sayfa görüntüde bu boşluk boş görünür, altbilgi görünmez. Altbilgi pencereden uzunsa `altbilgi-akista` ile akışa döner; 640 ve altı zaten akıştadır.

Üye zincirinde `portal` ve `altbilgi-perde` yüklenmediği için 7 üye sayfasında alt boşluk 0 kalıyor, altbilgi hiç açılmıyordu. Davranış `assets/js/prototip.js` ve `prototip.css` ile tamamlandı.

## Lead kararları (7 Kas)

Hesabım 8 sekme ve Keşif tercihlerim kalır. Kayıt Gastro alan setinde kalır. Bilgi Hatası Bildir tetiği eklenmez (A4). Mekân Öner örneği kalır. Görünen metinde yazım her yerde "Mekân"; derleyici tek noktada düzeltir, bağ ve sınıf adlarına dokunmaz.

## K2 ölçümü: sekme şeridi ve kapak boyu

Canlı render, `getBoundingClientRect` ve `position:sticky` taraması, 7 Kas.

| Sayfa | Kapak (`.rd-stage`) 1440 / 1024 / 390 | Sekme şeridi | Yapışkan öğe |
|---|---|---|---|
| Gastro tarif detayı | 480 / 480 / 480 | Yok (`.pf-tabbar` 0) | Yalnız malzeme paneli (`.ing-panel`, top 132) |
| Diet tarif detayı | 560 / 480 / 480 | Yok | Yalnız malzeme paneli |
| Gourmet canlı Mikla | 400 / 340 / 230 | Var, 56 px, yapışkan değil | Yan sütun (`.md-side`, top 130) |
| 16 Eylül öncesi eski hâl | 440 / 380 / 300 | Yapışkan, tam genişlik | |

Sonuç:

- Sekme şeridi: kanonda yapışkan sekme karşılığı yok. 16 Eylül hâli (yapışkan değil) kaldı.
- Kapak: kanon `.rd-stage` için konuşuyor; Gastro üç genişlikte 480, `kanon/hero.css` şerhi de aynı değeri yazıyor. Gastro baz alındı: 480 / 480 / 480. Diet'in 560'ı alınmadı.

## Karar dili (§8 kararlandı)

| Konu | Ekranda |
|---|---|
| Rezervasyon | "Rezervasyon talebi" ve mekân sahibi onayı; garanti dili yok |
| Puan | "Bekleyen puan", onayda kesinleşir; tutar örneği `prototip örneği` etiketli |
| Dinlenme, tescil | "Dinlenme alanı"; "güvenli" ve "tescilli" yok |
| Route paneli | Solda |
| Slogan | K6 metni onaylı |
| Keşif tercihleri | Ayrı ekran bu prototipte yok |
