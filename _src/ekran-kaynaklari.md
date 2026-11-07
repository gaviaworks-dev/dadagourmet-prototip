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
| Kabuk: altbilgi | tüm sayfalar | G `/giris` | Sütunlar, kurumsal ve yasal şerit O'dan; sosyal blok yok; mağaza düğmeleri pasif; telif satırında unvan yer tutucu | Kanon: sütun içerikleri Gourmet'e özel. Uygulama yayında değil. K5 |
| Kabuk: alt çubuk | tüm sayfalar | O `/` | 5 kalem Gourmet | Web için karar kanon soru 10'da açık; bugünkü hâl korundu |
| Çerez bandı | tüm sayfalar | G `/giris` | Yok | |
| Görüş Bildir | tüm sayfalar | G `/giris` | İlgili alan ve konu seçenekleri O'dan | Kanon §5.4: Gourmet listesi kalır |
| Mekân Öner penceresi | tüm sayfalar | O `/` | Yok | Altbilgi ve Mekânlar çağırıyor |
| Ana sayfa | `/` | O `/`, kabuk G | Slogan ve konsept açıklaması değişti (K6); 0 mekânlı konsept gizli (K8); konsept sırası yerel ve tarihi önce; etkinlik kartları Türkiye önce | W1.2, W1.3a. Vitrin eşit ağırlığı içerik olmadan kurulamaz: Esnaf 0, üretici modeli yok |
| Giriş | `/giris` | G `/giris` | Pano metni O'dan; sosyal düğme yok; pano görseli O `about-dining` | K4 notu: bağlı olmayan sağlayıcı gösterilmez. Canlı Gourmet'teki düğmeler `aria-disabled` |
| Kayıt | `/kayit` | G `/kayit` | Gastro alan seti; sosyal düğme yok; `hesap_turu` yok | Kanon soru 3 önerisi. Karar bekliyor sayılır |
| Şifre unuttum | `/sifremi-unuttum` | G `/giris` sifre panosu | Açık pano başlangıç hâli | Gastro'da aynı sayfada pano; Gourmet adresi korundu |
| Yeni şifre | `/sifre-yenile` | G `/giris` yeni-sifre panosu | Örnek e-posta; beş kural canlı | Token olmadığı için pano doğrudan açık |
| Hesabım | `/hesabim/ayarlar` | Yerel Gastro `6700538df4`, demo tohum üye render'ı, `/hesabim/ayarlar`. Kabuk, kimlik bandı, sekmeler, Profil, Keşif, Güvenlik bu render'dan | Sekmeler Gastro'nun 8'lisi. "Mutfak tercihlerim" yuvası "Keşif tercihlerim" oldu, Gastro DOM'u korundu, malzeme alanı çıktı. Bildirim, Dil, Bağlı, Veri, Dondurma panellerinin yapısı P `go-hesabim.html?auth=1`, metni Gourmet bağlamına uyarlandı. Profil'de Uzmanlık alanım yok. Güvenlik'te bağlı olmayan sosyal satırlar yok. Kimlik örnek, tohum kişi temizlendi, kapak görseli Gourmet | K3, K4. Gastro'nun bu beş paneli tarif, menü ve şef verisi taşıyor; sınıf kümesi ortak olduğu için içerik Gourmet donöründen kondu. `#tfaModal` alınmadı. Keşif'in 8 alt grubu (P `go-kesif-tercihlerim`) ayrı ekranda, sonraki tur |
| Gurme Panelim | `/hesabim/gurme-panelim/` ve 5 alt yol | P `go-mekanlarim.html?auth=1` kabuğu ve `kalem-satiri`; CSS zinciri yerel Gastro Hesabım | 6 sekme bağlantılı; satırlar örnek etiketli; Değerlendirmelerim boş durum; Puan Durumu yalnız yapı | K3, W2.5. Sahte değerlendirme yok. Puan kuralı açık (§8 #6, #13, #18) |
| Mekânlar | `/mekanlar` | O `/mekanlar`, `?il[]=istanbul`, `?il[]=istanbul&ilce[]=beyoglu` | Grup adları doküman §16 adlarına çekildi; Enerji ve Araç Şarj grubu eklendi; sıfır sonuçlu seçenek gizli; üç sütun; kartta 4 eylem; Leaflet yerine MapLibre | F1-F13, FH.1, FK.10-13, K7, K8. Şarj grubunun canlı sayacı yok; sayı basılmadı, örnek etiketli. Kart mikro ikonları (W1.4) mekân başına veri ister, bu turda yok |
| Mekân detayı | `/mekan/mikla` | O `/mekan/mikla`, rezervasyon penceresi R | Rezervasyon düğmesi ve penceresi geri geldi; Dada Route bandı geri geldi; Ne Yenir ve Ne Alınır sekmeleri eklendi; kapak 480 px; künye düğmeleri yok; harita MapLibre; takvim örnek | K2, W2.2, W3.3, K7. Metin talep dili (§8 #17). Ne Alınır'da satış yok, "tescilli" sözü yok (§8 #10). Bilgi Hatası Bildir tetiği eklenmedi: A4 kararı açık |
| Dada Route | `/dada-route` | O `/dada-route` | DOM aynı; Leaflet yerine MapLibre; statik örnek rota; katman paneli solda; il kartları; Google, Apple, Yandex aktarımı; `dada-route.js` yerine dar betik | K7. Panel solda kaldı (§8 #11 açık). Dinlenme katmanı "güvenli" demez (§8 #9). Canlı betik sunucu uçlarına bağlı |
| Hakkımızda | `/hakkimizda` | O gövde, G zinciri | "81 il" yerine 15; "esnaf lokantası" cümlesi "mekân" oldu | Sabit sayı kuralı; K6 |
| Künye | `/kunye` | G `/kunye` | Unvan, MERSİS, Adres, E-posta yer tutucu, görünür etiket | K5 |
| İletişim | `/iletisim` | G `/iletisim` | Marka ve bağlam metni Gourmet; e-posta yer tutucu; sosyal bağ yok | Canlı Gourmet sayfası eksik (MB 0.20). K5 |
| Hukuki örnek | `/yasal/kvkk` | O gövde, G zinciri | Yer tutuculara görünür etiket | K5 |
| Ekran haritası | `/ekranlar` | Yok, derleyici çıktısı | Yeni | Onay turu için liste |

## Mekânlar süzgeci

Veri `_src/araclar/mekan-veri.mjs` ile canlı `/mekanlar` ve `/mekanlar/harita-verisi` uçlarından, yalnız GET ile alındı. Her seçenek canlı süzgeçten soruldu; sayaç ve harita sayısı 12 grupta birebir tuttu. 203 mekân, 15 il, 41 ilçe, 128 semt. Semt 197 mekânda dolu, 6 mekânda boş; boş olan uydurulmadı. Açık Olma sayaçları çekim anına aittir, statik kopyadır.

Enerji ve Araç Şarj grubu süzmez: kamuya açık uçlarda mekân başına şarj verisi yok. Seçenekler pasif, örnek etiketli. Sıralama menüsü prototipte çalışmaz. Yalnız Mikla'nın detay sayfası var, diğer kartlar "sonraki tur" uyarısı verir.

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
| Puan | "Bekleyen puan", onayda kesinleşir; tutar yazılmaz |
| Dinlenme, tescil | "Dinlenme alanı"; "güvenli" ve "tescilli" yok |
| Route paneli | Solda |
| Slogan | K6 metni onaylı |
| Keşif tercihleri | Ayrı ekran sonraki tura kaldı |
