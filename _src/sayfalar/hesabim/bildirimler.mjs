// Bildirimler: canlı /hesabim/bildirimler (DadaGourmet-acil resources/views/hesap/bildirimler.blade.php).
// Canlıda uygulama içi bildirim deposu henüz yok, ekran donörün boş senaryosunu basıyor. Prototip donörün dolu
// akışını örnek veriyle basar: gün grupları (`.gun-etiketi` + `.bildirim-liste`) ve `.bildirim-satir`; sınıflar canlı
// Blade şerhinde adı geçen donör yapısı, çizimleri gourmet-ekran.css'te (canlının yüklediği dosya).
// Okunmamış rozeti ve "Tümünü Okundu İşaretle" canlıdaki gibi yalnız okunmamış varken basılır; okundu bilgisi bu
// tarayıcıda tutulur (assets/js/sayfa/bildirimler.js). Satırlar bildirimin konusuna gider.
import { et } from './_kalip.mjs';

const ETK = '{{kok}}assets/o/assets/gourmet-public/img/etkinlikler/kapaklar/800/eurochocolate-perugia-2026.webp';
// [gün, kimlik, okunmamış, ikon, sistem mi, metin, tür ikonu, tür, zaman, hedef, görsel]
const B = [
  ['Bugün', 'nt-rez-bebek', true, 'fa-solid fa-utensils', false, '<b>Bebek Balıkçı</b> rezervasyon talebini onayladı — 12 Kasım, 20:00 · 4 kişi.', 'fa-solid fa-utensils', 'Rezervasyon', '2 saat önce', 'hesabim/gurme-panelim/'],
  ['Bugün', 'nt-deg-mikla', true, 'fa-solid fa-star', false, '<b>Mikla</b> değerlendirmen yayında · +15 Dada Puan kesinleşti.', 'fa-solid fa-star', 'Değerlendirme', '5 saat önce', 'hesabim/gurme-panelim/degerlendirmelerim/'],
  ['Dün', 'nt-destek-5e2b', true, 'fa-solid fa-headset', true, 'Destek ekibi <b>Rezervasyon saatini değiştirmek istiyorum</b> talebine yanıt yazdı.', 'fa-solid fa-gear', 'Sistem', 'Dün 10:15', 'hesabim/cozum-merkezi/5e2b8d41/'],
  ['Dün', 'nt-oneri-narimor', false, 'fa-solid fa-location-dot', false, 'Önerdiğin mekân <b>Narımor Urla</b> yayında · +50 Dada Puan kesinleşti.', 'fa-solid fa-compass', 'Keşif', 'Dün 16:40', 'hesabim/gurme-panelim/topluluk-katkilarim/'],
  ['Bu hafta', 'nt-etk-perugia', false, 'fa-solid fa-calendar-days', false, 'Katılacağın <b>Eurochocolate Perugia 2026</b> 13 Kasım’da başlıyor.', 'fa-solid fa-calendar-days', 'Etkinlik', '7 Kasım', 'etkinlik-detay/?e=eurochocolate-perugia-2026', ETK],
  ['Bu hafta', 'nt-liste-bogaz', false, 'fa-solid fa-list', false, '<b>Boğaz’da akşam yemeği</b> listen paylaşım bağlantısıyla 3 kez açıldı.', 'fa-solid fa-list', 'Liste', '6 Kasım', 'hesabim/listeler/'],
  ['Daha önce', 'nt-hosgeldin', false, 'fa-solid fa-utensils', true, '<b>Dada Gourmet</b>’e hoş geldin! Keşif tercihlerini seç, sana uygun mekânları öne çıkaralım.', 'fa-solid fa-gear', 'Sistem', '12 Mart', 'hesabim/kesif-tercihleri/'],
];
const okunmamis = B.filter((b) => b[2]).length;

const satir = ([, id, yeni, ikon, sistem, metin, turIkon, tur, zaman, hedef, gorsel]) => `<a class="bildirim-satir${yeni ? ' okunmadi' : ''}" href="{{kok}}${hedef}" data-nt="${id}">
          <span class="bs-ikon${sistem ? ' sistem' : ''}"><i class="${ikon}" aria-hidden="true"></i></span>
          <div class="bs-metin">
            <p>${metin}</p>
            <div class="bs-meta"><span class="tur"><i class="${turIkon}" aria-hidden="true"></i> ${tur}</span><span>${zaman}</span></div>
          </div>${gorsel ? `\n          <span class="bs-gorsel" style="background-image:url('${gorsel}')" aria-hidden="true"></span>` : ''}
          <span class="bs-benek" aria-hidden="true"></span>
        </a>`;

const gunler = [...new Set(B.map((b) => b[0]))];
const akis = gunler.map((g, i) => `<div class="gun-etiketi">${g}${i ? '' : ` ${et}`}</div>
      <div class="bildirim-liste" data-day-list="">
        ${B.filter((b) => b[0] === g).map(satir).join('\n        ')}
      </div>`).join('\n      ');

const govde = `<section class="bant nt-top">
  <div class="wrap kap">
    <nav class="kirinti" aria-label="Sayfa yolu">
      <a href="{{kok}}" class="kirinti-ev"><i class="fa-solid fa-house" aria-hidden="true"></i><span class="yalniz-okuyucu">Dada Gourmet ana sayfa</span></a>
      <i class="fa-solid fa-chevron-right"></i>
      <span class="kirinti-simdi">Bildirimler</span>
    </nav>
    <div class="bant-bas">
      <div>
        <h1>Bildirimler <span class="rozet sayac" id="ntBadge">${okunmamis} okunmamış</span></h1>
        <p class="bant-alt">Etkinlik, liste, değerlendirme ve keşif hareketlerin — hepsi tek akışta.</p>
      </div>
      <div class="bant-araclar">
        <button class="dugme orta cam" type="button" id="ntReadAll"><i class="fa-solid fa-check-double"></i> Tümünü Okundu İşaretle</button>
        <a class="dugme orta cam ikon" href="{{kok}}hesabim/ayarlar/#bildirim" aria-label="Bildirim ayarları" title="Bildirim ayarları"><i class="fa-solid fa-gear"></i></a>
      </div>
    </div>
  </div>
</section>

<section class="bolum bildirim-govde dikis bant-ustunde">
  <div class="wrap kap">
    <div class="bildirim-kolonu" id="ntCol">
      ${akis}

      <div class="alt-not ortali" id="ntFoot"><i class="fa-solid fa-gear" aria-hidden="true"></i> <span>Bildirim tercihlerini <a href="{{kok}}hesabim/ayarlar/#bildirim">Hesap Ayarları → Bildirimler</a>’den yönetebilirsin.</span></div>
    </div>
  </div>
</section>`;

export default function () {
  return [{
    yol: 'hesabim/bildirimler',
    meta: {
      baslik: 'Bildirimler', duzen: 'uye', zincir: 'yasal',
      css: ['gourmet-yasal.css', 'gourmet-ekran.css', 't5-a.css'],
      js: ['assets/js/sayfa/bildirimler.js'],
      donor: 'canlı dadagourmet.com/hesabim/bildirimler, DadaGourmet-acil 4eb638c resources/views/hesap/bildirimler.blade.php',
    },
    govde,
  }];
}
