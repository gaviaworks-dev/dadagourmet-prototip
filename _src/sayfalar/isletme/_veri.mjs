// İşletme Paneli örnek verisi: Mikla'nın sahibi ({{uye.ad}}). Alan adları ve durum değerleri arka uç modelinden:
// DadaGourmet-acil app/Katalog (Mekan, MekanCevirisi, Sube, SubeAdresi, CalismaSaati, CalismaSaatiIstisnasi, Medya, MenuKategorisi, MenuKalemi),
// app/Rezervasyon (Rezervasyon, RezervasyonAyari, RezervasyonPenceresi), app/Degerlendirme, app/Isletme (IsletmeBasvurusu, DegisiklikTalebi),
// app/Icerik/Etkinlik (Etkinlik.tur, YayinDurumu); DadaGourmet-panel-analitik mekan_gunluk_metrikleri (goruntulenme, kaydetme).
// Ne Yenir / Ne Alınır arka uçta modellenmedi: alanlar Mikla sayfasındaki ny-bolum kopyasından (dadagourmet-panel-donor) ve şartnameden (W2, İmza Tabak & Paket Ürün).
// Mekânın kamuya açık bilgileri (ad, adres, telefon, saat, tanıtım, nitelik) prototipteki Mikla sayfasıyla aynıdır. Geri kalan her kayıt `prototip örneği`.

export const MEKAN = {
  ad: 'Mikla', kod: 'mikla', kategori: 'fine-dining-restorani', fiyat: 4, operasyon: 'acik',
  kisa: 'The Marmara Pera\'nın üst katlarında, İstanbul manzarasına karşı Yeni Anadolu Mutfağı.',
  aciklama: '2005 yılında açılan Mikla, The Marmara Pera’nın üst katlarında İstanbul manzarasına karşı hizmet verir. Restoran, 2012’den bu yana “Yeni Anadolu Mutfağı” yaklaşımıyla yerel ürünleri ve üreticileri öne çıkarır.\n\nKonuklar üç aşamalı à la carte ya da tadım menüsü arasında seçim yapabilir. Menü günlük tedarike göre değişir; güncel seçenekler rezervasyon sırasında doğrulanmalıdır.',
  rezervasyonNotu: 'Teras masaları hava durumuna göre açılır. 8 kişiden büyük gruplar için bir gün önceden haber verilmesini rica ediyoruz.',
  mutfak: ['anadolu-mutfagi'], konsept: ['sef-restorani'], vesile: ['aksam-yemegi'],
  hizmet: ['rezervasyon-aliyor', 'teras', 'kredi-karti'], beslenme: ['vejetaryen', 'alerjen-bilgisi'], ulasim: ['vale'],
  il: 'İstanbul', ilce: 'Beyoğlu', mahalle: 'Asmalı Mescit', acikAdres: 'The Marmara Pera, Meşrutiyet Caddesi No:15', postaKodu: '34430', enlem: '41.0310866', boylam: '28.9740165',
  telefon: '+90 (212) 293 5656', disUrl: '',
};

// Seçenek listeleri: KatalogKategorileri/Mutfakları/Konseptleri/Vesileleri seeder'larından Mikla'ya yakın alt küme; nitelikler KatalogHizmetleriSeeder'ın tamamı
export const KATEGORI = { 'fine-dining-restorani': 'Fine Dining Restoranı', 'restoran': 'Restoran', 'meyhane': 'Meyhane', 'esnaf-lokantasi': 'Esnaf Lokantası', 'kahvalti-mekani': 'Kahvaltı Mekânı', 'kafe': 'Kafe' };
export const MUTFAK = { 'anadolu-mutfagi': 'Anadolu Mutfağı', 'turk-mutfagi': 'Türk Mutfağı', 'ege-mutfagi': 'Ege Mutfağı', 'akdeniz-mutfagi': 'Akdeniz Mutfağı', 'dunya-mutfagi': 'Dünya Mutfağı', 'deniz-urunleri': 'Deniz Ürünleri' };
export const KONSEPT = { 'sef-restorani': 'Şef Restoranı', 'manzarali': 'Manzaralı', 'tadim-menusu': 'Tadım Menüsü', 'romantik': 'Romantik', 'tarihi-mekan': 'Tarihi Mekân' };
export const VESILE = { 'aksam-yemegi': 'Akşam Yemeği', 'ozel-gun': 'Özel Gün', 'is-yemegi': 'İş Yemeği', 'aile-yemegi': 'Aile Yemeği', 'arkadas-bulusmasi': 'Arkadaş Buluşması' };
export const NITELIK = {
  hizmet: ['Hizmet ve Özellikler', { 'rezervasyon-aliyor': 'Rezervasyon alıyor', 'online-rezervasyon': 'Online rezervasyon', 'paket-servis': 'Paket servis', 'gel-al': 'Gel al', 'acik-alan': 'Açık alan', 'bahce': 'Bahçe', 'teras': 'Teras', 'wifi': 'Wi-Fi', 'calismaya-uygun': 'Çalışmaya uygun', 'bebek-sandalyesi': 'Bebek sandalyesi', 'bebek-bakim-alani': 'Bebek bakım alanı', 'evcil-hayvan-dostu': 'Evcil hayvan dostu', 'canli-muzik': 'Canlı müzik', 'klima-isitma': 'Klima / ısıtma', 'cocuk-dostu': 'Çocuk dostu', 'kredi-karti': 'Kredi kartı', 'ozel-gun': 'Özel gün', 'grup-rezervasyonu': 'Grup rezervasyonu' }],
  beslenme: ['Beslenme Tercihleri', { vegan: 'Vegan', vejetaryen: 'Vejetaryen', glutensiz: 'Glütensiz', sekersiz: 'Şekersiz', 'saglikli-beslenme': 'Sağlıklı beslenme', 'organik-urun-odakli': 'Organik ürün odaklı', 'alerjen-bilgisi': 'Alerjen bilgisi' }],
  ulasim: ['Ulaşım ve Erişilebilirlik', { otopark: 'Otopark', 'ozel-otopark': 'Özel otopark', vale: 'Vale', 'toplu-tasimaya-yakin': 'Toplu taşımaya yakın', 'metroya-yakin': 'Metroya yakın', 'engelli-erisimi': 'Engelli erişimi', 'tekerlekli-sandalye-erisimi': 'Tekerlekli sandalye erişimi', 'giris-rampasi': 'Giriş rampası', asansor: 'Asansör', 'bebek-arabasiyla-erisim': 'Bebek arabasıyla erişim' }],
};
// Doğrulanmış nitelik rozetleri (şartname W1.4): mekân kartında mikro ikon. Mekân sahibi beyan eder, editör yerinde ya da belgeyle doğrular (son_dogrulama_at)
export const ROZET = [
  ['otopark', 'fa-square-parking', 'Otopark / vale', 'Misafirin aracını bırakabileceği otopark ya da vale hizmeti.'],
  ['glutensiz', 'fa-wheat-awn-circle-exclamation', 'Glütensiz seçenek', 'Menüde glütensiz hazırlanan en az bir ana tabak.'],
  ['evcil', 'fa-paw', 'Evcil hayvan kabul edilir', 'İç ya da dış alanda evcil hayvanla gelinebilir.'],
  ['cocuk', 'fa-children', 'Çocuk alanı', 'Çocukların oynayabileceği ayrılmış alan.'],
];
// Mikla: vale beyan edildi, doğrulama bekliyor (public kartta henüz ikon yok; build.mjs ORNEK_DOGRULAMA'da Mikla yok)
export const ROZET_DURUM = { otopark: 'bekliyor', glutensiz: 'kapali', evcil: 'kapali', cocuk: 'kapali' };

// Ne Yenir: en fazla 3 imza tabak (Mikla sayfasındaki örnek tabaklar). Tür kopyası panel donörünün "imza / yöresel / mevsim" ayrımı
export const NE_YENIR = [
  { id: 'ny-otlu-kuzu', ad: 'Otlu kuzu', tur: 'imza', aciklama: 'Ağır ateşte pişmiş kuzu, mevsim otları ve köz patlıcanla.', fiyat: '1.450', favori: 46 },
  { id: 'ny-zeytinyagli', ad: 'Mevsim zeytinyağlısı', tur: 'mevsim', aciklama: 'Günün tedarikine göre değişen Ege usulü zeytinyağlı tabak.', fiyat: '380', favori: 21 },
  { id: 'ny-levrek', ad: 'Ege levreği', tur: 'yoresel', aciklama: 'Izgara levrek, deniz börülcesi ve limonlu tereyağı sosu.', fiyat: '1.280', favori: 33 },
];
export const NY_TUR = { imza: 'İmza tabak', yoresel: 'Yöresel lezzet', mevsim: 'Mevsim tabağı' };
// Ne Alınır: paketli yerel ürün (satış yok, bilgi ve yönlendirme). Üretici/kooperatif, kaynak ve doğrulama tarihi panel donöründen
export const NE_ALINIR = [
  { id: 'na-zeytinyagi', ad: 'Zeytinyağı, 500 ml', uretici: 'Örnek kooperatif', kaynak: 'Ayvalık, Balıkesir', paket: 'Cam şişe, 500 ml', dogrulama: '28.10.2026', rota: 12 },
  { id: 'na-nar-eksisi', ad: 'Nar ekşisi, 250 ml', uretici: 'Örnek üretici', kaynak: 'Silifke, Mersin', paket: 'Cam şişe, 250 ml', dogrulama: '28.10.2026', rota: 7 },
];
// Menü (MenuKategorisi + MenuKalemi: ad, aciklama, fiyat, rozetler[], alerjenler[])
export const MENU_KAT = ['Başlangıçlar', 'Ana Yemekler', 'Tatlılar'];
export const ALERJEN = ['Gluten', 'Süt', 'Yumurta', 'Kabuklu yemiş', 'Yer fıstığı', 'Balık', 'Kabuklu deniz ürünü', 'Susam', 'Soya', 'Kereviz', 'Hardal', 'Sülfit'];
export const MENU = [
  { id: 'mk-1', kat: 'Başlangıçlar', ad: 'Ekşi mayalı ekmek ve tereyağı', aciklama: 'Ev yapımı ekşi mayalı ekmek, köy tereyağı.', fiyat: '240', alerjen: ['Gluten', 'Süt'] },
  { id: 'mk-2', kat: 'Başlangıçlar', ad: 'Hamsi', aciklama: 'Marine hamsi, közlenmiş biber, mısır ekmeği kırıntısı.', fiyat: '520', alerjen: ['Balık', 'Gluten'] },
  { id: 'mk-3', kat: 'Ana Yemekler', ad: 'Otlu kuzu', aciklama: 'Ağır ateşte kuzu, mevsim otları, köz patlıcan.', fiyat: '1.450', alerjen: ['Süt'] },
  { id: 'mk-4', kat: 'Ana Yemekler', ad: 'Ege levreği', aciklama: 'Izgara levrek, deniz börülcesi, limonlu tereyağı.', fiyat: '1.280', alerjen: ['Balık', 'Süt'] },
  { id: 'mk-5', kat: 'Tatlılar', ad: 'Dut ve tahin', aciklama: 'Dut pekmezli dondurma, tahinli kırıntı.', fiyat: '420', alerjen: ['Susam', 'Süt'] },
];

// Fotoğraflar (Medya: rol cover|galeri, sira). Mikla'nın prototipteki iki görseli; yeni yüklenen görsel bu tarayıcıda kalır
export const FOTO = [
  { id: 'f-252', src: 'assets/o/medya/252-1600.webp', kucuk: 'assets/o/medya/252-400.webp', ad: 'Teras ve şehir manzarası', rol: 'cover' },
  { id: 'f-253', src: 'assets/o/medya/253-1600.webp', kucuk: 'assets/o/medya/253-400.webp', ad: 'Tadım menüsünden bir tabak', rol: 'galeri' },
];

// Çalışma saatleri (CalismaSaati: haftanin_gunu 1=Pzt … 7=Paz, birden çok aralık). Mikla sayfasıyla aynı: Pzt–Cmt 18.00–00.00, Pazar kapalı
export const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const SAAT = [1, 2, 3, 4, 5, 6].map((g) => ({ gun: g, araliklar: [['18:00', '00:00']] })).concat([{ gun: 7, araliklar: [] }]);
// CalismaSaatiIstisnasi: tarih, tur (kapali | ozel_saatler), aciklama, aralıklar
export const OZEL_GUN = [
  { id: 'og-yilbasi', tarih: '2026-12-31', tur: 'ozel_saatler', aciklama: 'Yılbaşı gecesi menüsü', araliklar: [['19:00', '02:00']] },
  { id: 'og-yeniyil', tarih: '2027-01-01', tur: 'kapali', aciklama: 'Yeni yıl tatili', araliklar: [] },
];

// RezervasyonAyari + RezervasyonPenceresi
export const REZ_AYAR = { etkin: true, kapasite: 40, asgari: 1, azami: 8, slot: 30, onceden: 120, iptal: 240 };
export const REZ_PENCERE = [1, 2, 3, 4, 5, 6].map((g) => ({ gun: g, bas: '18:00', bit: '22:30', kapasite: g >= 5 ? 48 : 40, etkin: true }));
// Rezervasyon (misafir_ad, kisi_sayisi, cocuk_sayisi, ozel_durum, masa_tercihi, notlar, durum). Alerjen notu şartnameden (W2.3); arka uçta notlar alanında taşınır.
// gun: bugünden gün farkı. Durum anahtarları prototipin ortak sözlüğü (dgKayit): talep, onaylandi, reddedildi, iptal, gerceklesti, gelmedi
export const REZ = [
  { id: 'pr-1', misafir: 'Selin A.', kisi: 2, cocuk: 0, gun: 0, saat: '19:30', ozel: 'yildonumu', masa: 'Teras', alerjen: '', not: 'Mümkünse manzaralı masa.', durum: 'onaylandi', kod: 'MK-4821' },
  { id: 'pr-2', misafir: 'Mert K.', kisi: 4, cocuk: 1, gun: 0, saat: '20:30', ozel: 'standart', masa: 'Salon', alerjen: 'Yer fıstığı alerjisi (çocuk)', not: '', durum: 'onaylandi', kod: 'MK-4822' },
  { id: 'pr-3', misafir: 'Deniz Y.', kisi: 2, cocuk: 0, gun: 1, saat: '20:00', ozel: 'dogum_gunu', masa: 'Teras', alerjen: 'Glütensiz', not: 'Tatlıya mum rica ediyoruz.', durum: 'talep', kod: 'MK-4830' },
  { id: 'pr-4', misafir: 'Ozan T.', kisi: 6, cocuk: 0, gun: 2, saat: '19:00', ozel: 'is_yemegi', masa: 'Salon', alerjen: '', not: 'Fatura şirket adına.', durum: 'talep', kod: 'MK-4833' },
  { id: 'pr-5', misafir: 'Ece B.', kisi: 3, cocuk: 0, gun: 3, saat: '21:00', ozel: 'standart', masa: '', alerjen: 'Kabuklu deniz ürünü', not: '', durum: 'talep', kod: 'MK-4835' },
  { id: 'pr-6', misafir: 'Can D.', kisi: 2, cocuk: 0, gun: 4, saat: '19:30', ozel: 'standart', masa: 'Teras', alerjen: '', not: '', durum: 'onaylandi', kod: 'MK-4838' },
  { id: 'pr-7', misafir: 'Aylin S.', kisi: 5, cocuk: 2, gun: 6, saat: '18:30', ozel: 'standart', masa: 'Salon', alerjen: 'Süt ürünleri', not: 'Bebek sandalyesi gerekiyor.', durum: 'onaylandi', kod: 'MK-4841' },
  { id: 'pr-8', misafir: 'Burak E.', kisi: 2, cocuk: 0, gun: -1, saat: '20:00', ozel: 'standart', masa: 'Teras', alerjen: '', not: '', durum: 'gerceklesti', kod: 'MK-4790' },
  { id: 'pr-9', misafir: 'Zeynep O.', kisi: 4, cocuk: 0, gun: -2, saat: '19:00', ozel: 'dogum_gunu', masa: 'Salon', alerjen: 'Susam', not: '', durum: 'onaylandi', kod: 'MK-4781' },
  { id: 'pr-10', misafir: 'Kaan V.', kisi: 2, cocuk: 0, gun: -3, saat: '21:30', ozel: 'standart', masa: '', alerjen: '', not: '', durum: 'gelmedi', kod: 'MK-4772' },
  { id: 'pr-11', misafir: 'Nil R.', kisi: 2, cocuk: 0, gun: -5, saat: '20:00', ozel: 'standart', masa: 'Teras', alerjen: '', not: 'Rezervasyonu iptal ettik, teşekkürler.', durum: 'iptal', kod: 'MK-4760' },
];
export const OZEL_DURUM = { standart: 'Standart', dogum_gunu: 'Doğum günü', yildonumu: 'Yıldönümü', is_yemegi: 'İş yemeği' };

// Etkinlik (Etkinlik.tur, YayinDurumu). Etkinlik modelinde mekan_id yok, mekân adı serbest metin; sahip önerir, editör yayına alır
export const ETKINLIK_TUR = { festival: 'Festival', fuar: 'Fuar', tadim: 'Tadım', atolye: 'Atölye', 'sef-bulusmasi': 'Şef buluşması', 'soylesi-ve-panel': 'Söyleşi ve panel', 'ozel-menu-ve-tema-gecesi': 'Özel menü ve tema gecesi', 'pop-up-ve-konuk-sef': 'Pop-up ve konuk şef', 'uretim-ve-hasat-deneyimi': 'Üretim ve hasat deneyimi', 'gastronomi-turu': 'Gastronomi turu', yarisma: 'Yarışma' };
export const YAYIN = { taslak: ['Taslak', 'kapali'], incelemede: ['İncelemede', 'bekleyen'], yayinda: ['Yayında', 'cozulen'], pasif: ['Pasif', 'kapali'], arsivlendi: ['Arşivlendi', 'kapali'] };
export const ETKINLIK = [
  { id: 'et-1', ad: 'Yeni Anadolu Mutfağı Tadım Gecesi', tur: 'tadim', gun: 9, saat: '19:30', bitis: '23:00', ucretsiz: false, ucret: '4.500 ₺ kişi başı', kapasite: 24, kayit: 18, aciklama: 'Şefin mevsim menüsünden yedi tabaklık tadım; yerel üretici şarap eşleşmesiyle.', durum: 'yayinda' },
  { id: 'et-2', ad: 'Hasat Sonu Şef Masası', tur: 'sef-bulusmasi', gun: 23, saat: '20:00', bitis: '23:30', ucretsiz: false, ucret: '6.000 ₺ kişi başı', kapasite: 12, kayit: 0, aciklama: 'Mutfak ekibiyle aynı masada, Anadolu üreticilerinin hasat ürünleriyle kurulan menü.', durum: 'incelemede' },
  { id: 'et-3', ad: 'Zeytinyağı Atölyesi', tur: 'atolye', gun: 37, saat: '14:00', bitis: '16:00', ucretsiz: true, ucret: '', kapasite: 16, kayit: 0, aciklama: 'Ayvalık kooperatifinden üreticiyle zeytinyağı tadımı ve eşleştirme.', durum: 'taslak' },
];

// Değerlendirme (lezzet / servis / ambiyans şartnamenin üç kriteri; arka uçta tek puan alanı var). Yanıt: isletme_yaniti, yalnız onaylanmış değerlendirmeye
export const DEG_DURUM = { inceleniyor: ['İnceleniyor', 'bekleyen'], yayinda: ['Yayında', 'cozulen'], reddedildi: ['Yayınlanmadı', 'kapali'] };
export const DEGERLENDIRME = [
  { id: 'ornek-deg-4', yazar: 'Gurme üye', durum: 'inceleniyor', lezzet: 3, servis: 4, ambiyans: 4, tarih: '07.11.2026', metin: 'Porsiyonlar fiyatına göre küçük geldi; tatlı ise çok başarılıydı.', foto: false },
  { id: 'ornek-deg-1', yazar: 'Gurme üye', durum: 'yayinda', lezzet: 5, servis: 5, ambiyans: 5, tarih: '03.11.2026', metin: 'Tadım menüsündeki hamsi ve kuzu tabağı unutulmazdı. Servis ekibi her tabağı anlatarak getirdi; manzarayla birlikte özel bir akşam oldu.', foto: true, yanit: 'Güzel sözlerin için teşekkür ederiz. Tadım menüsünü mevsime göre yeniliyoruz; bir sonraki ziyaretinde yeni tabaklarımızı da tatmanı isteriz.' },
  { id: 'ornek-deg-2', yazar: 'Gurme üye', durum: 'yayinda', lezzet: 4, servis: 3, ambiyans: 5, tarih: '28.10.2026', metin: 'Yemekler iddialı ve lezzetliydi ama ana yemek için epey bekledik. Rezervasyonda teras istememize rağmen içeride oturduk.', foto: false },
  { id: 'ornek-deg-3', yazar: 'Gurme üye', durum: 'yayinda', lezzet: 5, servis: 4, ambiyans: 4, tarih: '19.10.2026', metin: 'Ekşi mayalı ekmek ve tereyağı servisi başlı başına gitme sebebi. Şarap eşleştirmesinde yapılan öneriler isabetliydi.', foto: true },
];

// İstatistik (mekan_gunluk_metrikleri: goruntulenme, kaydetme; rezervasyon sayımı rezervasyonlar tablosundan). Rota durağı eklenme ölçülmüyor: örnek
const dalga = (taban, oynak, n, tohum) => Array.from({ length: n }, (_, i) => Math.round(taban + oynak * Math.sin((i + tohum) / 2.3) + (i % 7 >= 4 ? oynak * 0.8 : 0) + i * taban * 0.006));
export const ISTATISTIK = {
  gun: 30,
  goruntulenme: dalga(118, 26, 30, 1),
  kaydetme: dalga(6, 3, 30, 3),
  rota: dalga(3, 2, 30, 5),
  rezervasyon: dalga(4, 2, 30, 2),
  kaynak: [['Mekânlar listesi', 41], ['Mekân Bul sihirbazı', 23], ['Dada Route', 17], ['Arama', 12], ['Gurme Lezzetler', 7]],
  gunler: [['Pazartesi', 9], ['Salı', 11], ['Çarşamba', 14], ['Perşembe', 18], ['Cuma', 27], ['Cumartesi', 31], ['Pazar', 0]],
};

// Portaldan taşınan kayıtlar (canlı /isletme): başvurular ve değişiklik talepleri
export const BASVURU_DURUM = { taslak: ['Taslak', 'kapali'], gonderildi: ['Gönderildi', 'bekleyen'], incelemede: ['İncelemede', 'bekleyen'], bilgi_istendi: ['Bilgi istendi', 'bekleyen'], onaylandi: ['Onaylandı', 'cozulen'], reddedildi: ['Reddedildi', 'kapali'] };
export const TALEP_DURUM = { taslak: ['Taslak', 'kapali'], gonderildi: ['Gönderildi', 'bekleyen'], incelemede: ['İncelemede', 'bekleyen'], onaylandi: ['Onaylandı', 'cozulen'], reddedildi: ['Reddedildi', 'kapali'], uygulandi: ['Uygulandı', 'cozulen'] };
export const MEKAN_TURU = { restoran: 'Restoran', kafe: 'Kafe', kahvalti_mekani: 'Kahvaltı Mekânı', kahve_dukkani: 'Kahve Dükkânı', pastane_tatlici: 'Pastane & Tatlıcı', sokak_lezzeti: 'Sokak Lezzeti', fine_dining: 'Fine Dining', firin_unlu_mamuller: 'Fırın & Unlu Mamuller' };
export const FIYAT_BASVURU = { economy: '₺ · Ekonomik', mid: '₺₺ · Orta', upper: '₺₺₺ · Üst Segment' };
export const HIZMET_BASVURU = { masada_servis: 'Masada Servis', rezervasyon: 'Rezervasyon', kahvalti_servisi: 'Kahvaltı Servisi', bahce_teras: 'Bahçe / Teras', aile_dostu: 'Aile Dostu', otopark: 'Otopark', kart_gecerli: 'Kart Geçerli', engelli_erisimi: 'Engelli Erişimi', paket_servis: 'Paket Servis', ucretsiz_wifi: 'Ücretsiz Wi-Fi', canli_muzik: 'Canlı Müzik' };
export const HIZMET_TURU = { masada_servis: 'Masada Servis', paket_gel_al: 'Paket / Gel-Al' };
export const BELGE_TURU = { vergi_levhasi: 'Vergi levhası', faaliyet_belgesi: 'Faaliyet belgesi', isletme_ruhsati: 'İşletme ruhsatı', diger: 'Diğer' };
export const BASVURULAR = [
  { no: 1042, durum: 'incelemede', gonderildi: '05.11.2026', gorunen_ad: 'Nalia Karadeniz Mutfağı', ticari_unvan: 'Nalia Gıda Turizm Ltd. Şti.', mekan_turu: 'restoran', fiyat_seviyesi: 'mid', il: 'İstanbul', ilce: 'Kadıköy', acik_adres: 'Caferağa Mah. Moda Cad. No:42', yetkili_ad: '{{uye.ad}}', yetkili_telefon: '0532 000 00 00', isletme_eposta: 'rezervasyon@ornek-isletme.com', isletme_telefon: '0216 000 00 00', web_sitesi: 'ornek-isletme.com', instagram: '@ornekisletme', hizmetler: ['masada_servis', 'rezervasyon', 'kahvalti_servisi', 'aile_dostu'], hizmet_turleri: ['masada_servis', 'paket_gel_al'], calisma_saatleri_ozeti: 'Her gün 09.00 – 22.00', tanitim: 'Karadeniz yayla mutfağını Moda\'ya taşıyan aile işletmesi: kuymak, hamsili pilav ve taş fırında mısır ekmeği.', rezervasyon_araliklari: 'Öğle 12.00–15.00, Akşam 18.30–22.00', rezervasyon_notu: '8 kişiden büyük gruplar için bir gün önceden haber verilmesini rica ediyoruz.', notlar: '', belgeler: [['vergi_levhasi', 'nalia-vergi-levhasi.pdf', 312], ['isletme_ruhsati', 'nalia-isletme-ruhsati.jpg', 1204]] },
  { no: 987, durum: 'onaylandi', gonderildi: '22.08.2026', gorunen_ad: 'Mikla', ticari_unvan: 'Örnek Gıda ve Turizm A.Ş.', mekan_turu: 'fine_dining', fiyat_seviyesi: 'upper', il: 'İstanbul', ilce: 'Beyoğlu', acik_adres: 'Meşrutiyet Caddesi No:15, 34430', yetkili_ad: '{{uye.ad}}', yetkili_telefon: '0532 000 00 01', isletme_eposta: 'rezervasyon@ornek-isletme.com', isletme_telefon: '0212 000 00 01', web_sitesi: '', instagram: '', hizmetler: ['masada_servis', 'rezervasyon', 'bahce_teras', 'kart_gecerli', 'engelli_erisimi'], hizmet_turleri: ['masada_servis'], calisma_saatleri_ozeti: 'Pazartesi – Cumartesi 18.00 – 00.00', tanitim: 'Anadolu\'nun mevsim ürünlerini çağdaş tekniklerle yorumlayan tadım menüsü; Beyoğlu çatısında şehir manzarası eşliğinde.', rezervasyon_araliklari: 'Akşam 18.00–22.30', rezervasyon_notu: 'Teras masaları hava durumuna göre açılır.', notlar: '', belgeler: [['vergi_levhasi', 'mikla-vergi-levhasi.pdf', 286], ['faaliyet_belgesi', 'mikla-faaliyet-belgesi.pdf', 431]] },
];
export const TALEPLER = [
  { no: 347, durum: 'onaylandi', gonderildi: '30.10.2026', saat: '14:12', degisiklikler: { ad: 'Mikla', adres: 'The Marmara Pera, Meşrutiyet Caddesi No:15, Beyoğlu', not: 'Misafirler girişi bulmakta zorlanıyor; otel adının adres satırında görünmesini istiyoruz.' }, karar_notu: 'Adres güncellemesi onaylandı; mekân sayfasına bu hafta içinde yansır.' },
  { no: 331, durum: 'reddedildi', gonderildi: '02.10.2026', saat: '11:40', degisiklikler: { ad: 'Mikla', telefon: '0212 000 00 02' }, karar_notu: 'Numara işletme ruhsatındaki telefonla eşleşmedi. Ruhsattaki numarayla yeni talep açabilirsin.' },
  { no: 318, durum: 'uygulandi', gonderildi: '14.09.2026', saat: '09:05', degisiklikler: { ad: 'Mikla', calisma_saatleri: 'Pazartesi – Cumartesi 18.00 – 00.00, Pazar kapalı' }, karar_notu: '' },
];
export const TALEP_ALAN = { ad: 'İşletme adı', adres: 'Adres', telefon: 'Telefon', calisma_saatleri: 'Çalışma saatleri', not: 'Not' };

// İstemci tohumu: betik ilk açılışta bu tarayıcıya yazar (sürüm değişince yeniden)
export const TOHUM = { surum: 2, mekan: MEKAN, rozet: ROZET_DURUM, neYenir: NE_YENIR, neAlinir: NE_ALINIR, menu: MENU, alerjenVerildi: true, foto: FOTO, saat: SAAT, ozelGun: OZEL_GUN, rezAyar: REZ_AYAR, rezPencere: REZ_PENCERE, rez: REZ, etkinlik: ETKINLIK, degerlendirme: DEGERLENDIRME, istatistik: ISTATISTIK };
