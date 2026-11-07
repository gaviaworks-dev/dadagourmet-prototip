# Ekran kaynakları

Canlı Gastro sürümü: release 20261107-mentor-6700538df4. Çekim 7 Kas 2026, yalnız GET, User-Agent `DadaGourmetKanonBot/1.0`.

Girişli üye render'ı canlıda alınmadı: yerel Gastro kopyası (`6700538df4`, demo tohum) tohum hesabıyla açıldı. Tohum kişi ve hesap bilgisi depoya girmez.

Kısaltma: G = dadagastro.com canlı render, O = dadagourmet.com canlı render, P = `gaviaworks-dev.github.io/DadaMentor/Gourmet` prototipi, R = `Backend Projects/dadagourmet/docs/referans-mekan-detay/sayfa-dom.html`.

## Ekranlar

| Ekran | Yol | Donör | Sapma | Gerekçe |
|---|---|---|---|---|
| Kabuk: üst bant | tüm sayfalar | G `/giris` | Sol tarafta 203 mekân; sosyal blok yok; dil TR ve EN; Akademi ve Store yok | Mekân sayısı canlıdan. Gourmet'te doğrulanmış sosyal hesap yok. K17. Beyar kuralı |
| Kabuk: başlık | tüm sayfalar | G `/giris` | Mega menü yerine O'nun 5 kalemi; konum düğmesi eklendi; hesap menüsü Gourmet kalemleri ve Gurme Panelim | Menü içeriği markaya özel (kanon §5.1). K3 |
| Kabuk: çekmece | tüm sayfalar | G `/giris` | Kalemler Gourmet; "DadaGastro'ya Dön" yok; dil TR ve EN | Kanon soru 11 önerisi; K17 |
| Kabuk: altbilgi | tüm sayfalar | G `/giris` | Sütunlar, kurumsal ve yasal şerit O'dan; sosyal blok yok; mağaza düğmeleri pasif; telif satırında şirket unvanı | Kanon: sütun içerikleri Gourmet'e özel. Uygulama yayında değil. K5 |
| Kabuk: alt çubuk | tüm sayfalar | O `/` | 5 kalem Gourmet | Web için karar kanon soru 10'da açık; bugünkü hâl korundu |
| Çerez bandı | tüm sayfalar | G `/giris` | Yok | |
| Görüş Bildir | tüm sayfalar | G `/giris` | İlgili alan ve konu seçenekleri O'dan | Kanon §5.4: Gourmet listesi kalır |
| Mekân Öner penceresi | tüm sayfalar | O `/` | Yok | Altbilgi ve Mekânlar çağırıyor |
| Ana sayfa | `/` | O `/`, kabuk G | Slogan ve konsept açıklaması değişti (K6); 0 mekânlı konsept gizli (K8); konsept sırası yerel ve tarihi önce; etkinlik kartları Türkiye önce Vitrin bölümü eklendi: Lüks Restoranlar, Tarihi Esnaf Durakları, Yerel Üreticiler, sütun başına iki kart | W1.2, W1.3a. Beyar talimatı K6'nın önüne geçer, slogan aynen kalır. Lüks canlı kayıt; Esnaf ve üretici verisi canlıda yok: kart `prototip örneği` etiketli, görsel canlı konsept görselleri |
| Giriş | `/giris` | G `/giris` | Pano metni O'dan; sosyal düğme yok; pano görseli O `about-dining` | K4 notu: bağlı olmayan sağlayıcı gösterilmez. Canlı Gourmet'teki düğmeler `aria-disabled` |
| Kayıt | `/kayit` | G `/kayit` | Gastro alan seti; sosyal düğme yok; `hesap_turu` yok | Kanon soru 3 önerisi. Karar bekliyor sayılır |
| Şifre unuttum | `/sifremi-unuttum` | G `/giris` sifre panosu | Açık pano başlangıç hâli | Gastro'da aynı sayfada pano; Gourmet adresi korundu |
| Yeni şifre | `/sifre-yenile` | G `/giris` yeni-sifre panosu | Örnek e-posta; beş kural canlı | Token olmadığı için pano doğrudan açık |
| Hesabım | `/hesabim/ayarlar` | Yerel Gastro `6700538df4`, demo tohum üye render'ı, `/hesabim/ayarlar`. Kabuk, kimlik bandı, sekmeler, Profil, Keşif, Güvenlik bu render'dan | Sekmeler Gastro'nun 8'lisi. "Mutfak tercihlerim" yuvası "Keşif tercihlerim" oldu, Gastro DOM'u korundu, malzeme alanı çıktı. Bildirim, Dil, Bağlı, Veri, Dondurma panellerinin yapısı P `go-hesabim.html?auth=1`, metni Gourmet bağlamına uyarlandı. Profil'de Uzmanlık alanım yok. Güvenlik'te bağlı olmayan sosyal satırlar yok. Kimlik örnek, tohum kişi temizlendi, kapak görseli Gourmet | K3, K4. Gastro'nun bu beş paneli tarif, menü ve şef verisi taşıyor; sınıf kümesi ortak olduğu için içerik Gourmet donöründen kondu. `#tfaModal` alınmadı. Keşif'in 8 alt grubu (P `go-kesif-tercihlerim`) bu prototipte yok |
| Gurme Panelim | `/hesabim/gurme-panelim/` ve 5 alt yol | P `go-mekanlarim.html?auth=1` kabuğu ve `kalem-satiri`; CSS zinciri yerel Gastro Hesabım | 6 sekme bağlantılı; satırlar örnek etiketli; Değerlendirmelerim boş durum, gönderilen değerlendirme buraya düşer; Puan Durumu kural, sayaç ve hareket listesi | K3, W2.5, W2.4. Sahte değerlendirme yok. Puan değerleri şartnameden: yorum veya fotoğraf +15, öneri +50, puanlama +2, gerçekleşen rezervasyon +25; bekleyen puan onayda kesinleşir (§8 #6). Tutar örnekleri etiketli, işlemler bu tarayıcıda kalır |
| Mekânlar | `/mekanlar` | O `/mekanlar`, `?il[]=istanbul`, `?il[]=istanbul&ilce[]=beyoglu` | Grup adları doküman §16 adlarına çekildi; Enerji ve Araç Şarj grubu eklendi; sıfır sonuçlu seçenek gizli; üç sütun; kartta 4 eylem; Leaflet yerine MapLibre | F1-F13, FH.1, FK.10-13, K7, K8. Şarj grubunun canlı sayacı yok; sayı basılmadı, örnek etiketli. Kart nitelik ikonları (W1.4) canlı süzgeç üyeliğinden: otopark ya da vale, glütensiz, evcil hayvan, bebek sandalyesi. Veride "çocuk alanı" yok, en yakın kayıt kendi adıyla yazılır; kaydı olmayan nitelikte ikon yok |
| Mekân detayı | `/mekan/mikla` | O `/mekan/mikla`, rezervasyon penceresi R | Rezervasyon düğmesi ve penceresi geri geldi; Dada Route bandı geri geldi; Ne Yenir ve Ne Alınır Genel Bakış içinde bölüm, sekme düğmesi bölüme kaydırır; tabak favorisi Gurme Favorilerim'e yazar; kapak 480 px; künye düğmeleri yok; harita MapLibre; takvim örnek | K2, W2.2, W3.3, K7. Metin talep dili (§8 #17). Pencerede ayrı alerjen notu; gönderim bu tarayıcıya yazılır, Rezervasyonlarım'da "Mekân sahibi onayı bekleniyor" satırı olur. Ne Alınır'da satış yok, "tescilli" sözü yok (§8 #10). Bilgi Hatası Bildir tetiği eklenmedi: A4 kararı açık. Yorumlar sekmesinde canlı `.rev-form` üç kritere çoğaltıldı; misafirde giriş kutusu |
| Mekân Bul | `/mekan-bul` | O `/mekan-bul` adım 1 render'ı; sonuç ekranı POST ile açıldığı için `resources/views/site/mekan-bul/sonuclar.blade.php`, `_sonuc-karti.blade.php` sınıf kümesi | 5 adım yerine 3; amaç listesi Hızlı esnaf, Şef masası, Pazar kahvaltısı, Yol üstü; konum süzgeç, bütçe ₺-₺₺₺₺, 5 nitelik; yüzde kalır; Haritadan Seç yok | Beyar talimatı K9'un önüne geçer. Oran `mekan-bul.js`: yalnız cevaplanan kriterler paydada, ağırlık canlı servisle aynı (amaç 40, bütçe 20, nitelik 15). Yol üstü: İstanbul–İzmir örnek güzergâhına 10 km. Esnaf, ₺, ₺₺, çocuk alanı verisi yok: boş sonuç ve öneri |
| Etkinlikler | `/etkinlikler` | O `/etkinlikler`, veri 126 kayıt (`etkinlik-veri.mjs`, yalnız GET) | Türkiye ve Uluslararası sekmesi, açılış Türkiye; önerilen sırada yaklaşan festival ve hasat önde; kart dibinde Randevu Oluştur; Takvim ve Harita görünümü yok; sıralama iki kalem; sıfır sonuçlu seçenek gizli | W1.3a, W1.3b, W3.4c. Takvim ve Harita bu turun kapsamı değil, ölü düğme bırakılmadı. Randevu yalnız bu tarayıcıda kalır, Rezervasyonlarım'a işlenir |
| Etkinlik detayı | `/etkinlik-detay/?e=<slug>` | O `/etkinlikler/mff-orta-dogu-gida-fuari-2026` | Tek kalıp; başlık, tarih, yer, özet, görsel adresteki etkinlikten dolar; görüntülenme, organizatör, katılımcı satırı yok; yan sütunda Randevu Oluştur | 126 ayrı sayfa çekilmedi; veride olmayan alan basılmaz |
| Dada Route | `/dada-route` | O `/dada-route` ham HTML, `dada-route.js`, `dada-route.css`, Leaflet | Canlı betik değişmeden çalışır; sunucu uçlarını `rota-sahte.js` statik karşılar. Üstüne katmanlar, il kartları, örnek etiketleri eklendi. Hızlı filtre radius'u `--yuvarlak-cip` | Beyar: altyapı kullanılacak. MapLibre geçişi K7 ile Faz 4'te. Panel solda. "Güvenli", "tescilli" yok |
| Hakkımızda | `/hakkimizda` | O gövde, G zinciri | "81 il" yerine 15; "esnaf lokantası" cümlesi "mekân" oldu | Sabit sayı kuralı; K6 |
| Künye | `/kunye` | G `/kunye` | Unvan, Adres, E-posta Gastro değerleri; marka adı Gourmet | K5 güncellemesi: Gastro'da nasılsa öyle |
| İletişim | `/iletisim` | G `/iletisim` | Marka ve bağlam metni Gourmet; destek adresi yerine şirket e-postası; sosyal bağ yok | Canlı Gourmet sayfası eksik (MB 0.20). Gourmet destek adresi ölçülmedi |
| Hukuki örnek | `/yasal/kvkk` | O gövde, G zinciri | Unvan, Adres, E-posta Gastro değerleri; MERSİS, vergi ve KEP satırları ile taslak bandı yok | K5 güncellemesi: yer tutucu basılmaz |
| Ekran haritası | `/ekranlar` | Yok, derleyici çıktısı | Yeni | Onay turu için liste |

## Sıfır sonuç

Konsept kartları, konsept şeridi ve süzgeç seçeneklerinde 0 sonuçlu kalem gizlidir (W1.1, K8). Derleyici `/`, `/mekanlar`, `/etkinlikler` için denetler, kalırsa hata verir. Mekân Bul bilerek ayrıdır: Beyar talimatıyla veri olmayan seçenek görünür, boş sonuç ve öneri verir.

## Bağlar

Prototipte karşılığı olmayan iç bağ uyarı vermez, en yakın gerçek ekrana gider. Tablo `_src/build.mjs` `YEDEK`: mekân detayı Mikla'ya; `hesabim/*` Gurme Panelim sekmelerine ya da Ayarlar'a; `yasal/*` KVKK örneğine; işletme ve SSS İletişim'e; basın Hakkımızda'ya; Gurme Lezzetler, Şehir Rehberleri ve arama Mekânlar'a. Konum düğmesi canlı `#lkModal` penceresini açar, seçim sunucuya gitmez.

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
