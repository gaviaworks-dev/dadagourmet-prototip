// Paket kademeleri ve özellik matrisi: TEK KAYNAK. Paketlerim (`_src/sayfalar/hesabim/paketlerim.mjs`) ve herkese açık
// Pro sayfası (`_src/sayfalar/pro/index.mjs`) buradan okur; iki yerde iki ayrı liste tutulmaz.
// Kaynak canlı dadagourmet.com: DadaGourmet-acil 4eb638c app/Ticaret/Enums/PaketKademesi.php (merdiven, ad, ikon, kart sınıfı,
// özet, tutar) ve app/Ticaret/Servisler/PaketOzellikMatrisi.php (8 başlık, 34 satır). `derleyici _src/veri` altında yalnız
// .json okur; bu modül içe aktarılarak kullanılır.

// PaketKademesi::merdiven(); `kartIkon` Gastro PaketServisi::KART_IKON, `sinif` ::SINIF
export const KADEME = [
  { k: 'ucretsiz', ad: 'Ücretsiz', kartIkon: 'user', sinif: 't0', tutar: 0, ozet: 'Gourmet\'i keşfetmeye bugün başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz.' },
  { k: 'pro', ad: 'Pro', kartIkon: 'bolt', sinif: 't2', tutar: 9900, one: true, yukle: 'Pro\'yu İncele', ozet: 'Mekân keşfinin, listelerin ve Dada Route\'un tamamı — düzenli dışarıda yiyen biri için.' },
  { k: 'pro-max', ad: 'Pro Max', kartIkon: 'gem', sinif: 't3', tutar: null, not: 'Fiyat onay bekliyor', yukle: 'Pro Max\'ı İncele', ozet: 'Pro\'nun tamamı, üstüne sınırsız liste, sınırsız rota ve rotanı herkese açık yayınlama.' },
];

// PaketOzellikMatrisi::gruplar() — [ad, ücretsiz, pro, proMax]; false = kapalı, metin = değerli satır (açık)
export const GRUPLAR = [
  ['Mekân keşfi', 'location-dot', [
    ['Mekân dizini ve detay sayfaları', true, true, true],
    ['Mutfak, semt, fiyat ve konsept süzgeçleri', true, true, true],
    ['Harita görünümü, mesafe yarıçapı ve yakınımdakiler', true, true, true],
    ['Mekân Bul sihirbazı', 'Günde 3 tur', 'Günde 25 tur', 'Sınırsız'],
    ['Şube, menü ve çalışma saati bilgisi', true, true, true],
  ]],
  ['Kaydedilenler ve listeler', 'bookmark', [
    ['Mekân, etkinlik ve gurme lezzet kaydetme', true, true, true],
    ['Listelerim', '3 liste', '25 liste', 'Sınırsız'],
    ['Ziyaret Ettiklerim defteri', 'Son 30 gün', 'Son 12 ay', 'Sınırsız'],
    ['Keşif tercihleri', 'Temel', 'Gelişmiş', 'Gelişmiş'],
  ]],
  ['Değerlendirme ve katkı', 'star', [
    ['Değerlendirme yazma ve puanlama', true, true, true],
    ['Değerlendirmeye fotoğraf ekleme', true, true, true],
    ['Mekân önerme ve bilgi hatası bildirme', true, true, true],
    ['Rozetler', 'Temel', 'Gelişmiş', 'Gelişmiş'],
  ]],
  ['Gurme Lezzetler ve şehir rehberleri', 'book-open', [
    ['Gurme Lezzetler yazıları', true, true, true],
    ['Gurme lezzet kaydetme ve kategori süzgeçleri', true, true, true],
    ['Şehir rehberleri', true, true, true],
  ]],
  ['Etkinlikler ve rezervasyon', 'calendar-days', [
    ['Etkinlik takvimi, haritası ve süzgeçleri', true, true, true],
    ['Etkinliğe kayıt ve katılım işareti', true, true, true],
    ['Etkinlik değerlendirme', true, true, true],
    ['Etkinlik önerme', true, true, true],
    ['Masa rezervasyonu', true, true, true],
  ]],
  ['Dada Route', 'route', [
    ['Hazır rotalar ve durak listeleri', true, true, true],
    ['En yakın rota', true, true, true],
    ['Kendi rotanı oluşturma', false, '5 rota', 'Sınırsız'],
    ['Durak ziyaret işaretleme ve ilerleme', false, true, true],
    ['Rotanı bağlantıyla paylaşma', false, true, true],
    ['Rotanı herkese açık yayınlama', false, false, true],
  ]],
  ['Bağlantılar', 'arrows-rotate', [
    ['DadaGastro tarif bağlantıları', true, true, true],
    ['DadaDiet ve DadaFit geçişi', true, true, true],
    ['Hesap verilerini dışa aktarma', true, true, true],
  ]],
  ['Deneyim ve destek', 'headset', [
    ['Reklam', 'Reklam var', 'Reklamsız', 'Reklamsız'],
    ['Destek', 'Standart', 'Öncelikli', 'Öncelikli'],
    ['Çözüm merkezi talepleri', true, true, true],
    ['İki adımlı doğrulama ve oturum yönetimi', true, true, true],
  ]],
];
export const SATIRLAR = GRUPLAR.flatMap(([, , s]) => s);
// Satırı adıyla bulur; ad yoksa derleme durur (sessizce boş basmaz)
export const satir = (ad) => { const s = SATIRLAR.find((r) => r[0] === ad); if (!s) throw new Error('paket-kademeleri: satır yok: ' + ad); return s; };
export const para = (kurus) => '₺' + (kurus / 100).toLocaleString('tr-TR', { minimumFractionDigits: kurus % 100 ? 2 : 0, maximumFractionDigits: 2 });
