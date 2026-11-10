// Ödemelerim: canlı /hesabim/odemelerim (DadaGourmet-acil resources/views/hesap/odemeler.blade.php, belge:
// odemeler-belge.blade.php). Dört sekme; canlıda `?sekme=` panoları, prototipte her sekme ayrı adres.
// Örnek üye bugün Ücretsiz: Abonelik sekmesi canlının Ücretsiz dalını basar. Defterde geçmiş iki Pro alımı var
// (biri cayma ile iade edildi, öteki 30 günlük dönemi bitti; alımlar tek seferlik, kendiliğinden yenilenmez) —
// bu yüzden Ücretsiz durumla çelişmez. Kayıtlı Kartlar canlıda her hesapta boş (kart kasası yok), aynen basılır.
import { bant, gourmetSayac, panelDugme, sayfa, et } from './_kalip.mjs';
import { gastroRay, gastroPano, SEKME_CSS, SEKME_JS } from './_gastro-sekme.mjs';

const O = 'hesabim/odemelerim/';
const KDV = 20; // FaturaServisi::KDV_ORANI
const tl = (k) => '₺' + (k / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tlKod = (k) => (k / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TRY';
// HesapTicaretDenetleyicisi::odemeDurumu · IadeTalebi::durumBilgisi
const DURUM = { odendi: ['Ödendi', 'ok', 'circle-check'], iade: ['İade edildi', 'off', 'rotate-left'] };
const IADE_DURUM = { onaylandi: ['İade edildi', 'ok', 'circle-check'], inceleniyor: ['İnceleniyor', 'wait', 'hourglass-half'], reddedildi: ['Reddedildi', 'off', 'circle-xmark'] };
// Canlının `od-pill ok|wait|off`ı; prototip kanonunda kuralı `.durum-hapi.ikonlu` (bilesenler.css §45) taşıyor
const KANON_HAP = { ok: 'cozulen', wait: 'bekleyen', off: 'kapali' };
const pill = ([e, s, i]) => `<span class="od-pill ${s} durum-hapi ikonlu ${KANON_HAP[s]}"><i class="fa-solid fa-${i}" aria-hidden="true"></i> ${e}</span>`;

// Örnek defter (FaturaServisi: DGO-<yıl>-<alım no 6 hane>; KDV ara toplamdan ayrıştırılır)
const PAKET = { ad: 'Pro', aciklama: 'Dada Gourmet Pro · 30 günlük dönem', sure: 30 };
const F = [
  { no: 'DGO-2026-000014', id: '000014', tarih: '12 Ağu 2026', uzun: '12 Ağustos 2026', tahsilat: '12 Ağustos 2026, 20:41', toplam: 9900, durum: 'odendi', tur: 'uyelik' },
  { no: 'DGO-2026-000009', id: '000009', tarih: '02 Tem 2026', uzun: '02 Temmuz 2026', tahsilat: '02 Temmuz 2026, 14:12', toplam: 9900, durum: 'iade', tur: 'uyelik' },
].map((f) => ({ ...f, ara: Math.round(f.toplam * 100 / (100 + KDV)), vergi: f.toplam - Math.round(f.toplam * 100 / (100 + KDV)) }));
// İade defteri (IAD-<yıl>-<4 hane>)
const IADE = [{ ref: 'IAD-2026-0003', fatura: F[1], neden: 'Cayma hakkı (14 gün)', tarih: '05 Tem 2026', durum: 'onaylandi' }];
// İade açılabilecek tahsilatlar: iade edilmemiş ve bekleyen talebi olmayanlar
const IADEYE_ACIK = F.filter((f) => f.durum === 'odendi' && !IADE.some((t) => t.fatura === f && t.durum === 'inceleniyor'));

const sekmeBas = (ikon, etiket, baslik, lead, ek = '') => `<div class="sec-head"><div>
          <span class="ust-etiket"><i class="${ikon}" aria-hidden="true"></i> ${etiket}</span>
          <h2>${baslik}</h2>
          <p class="lead">${lead}</p>${ek}
        </div></div>`;

// ── ABONELİK ÖDEMELERİ ── Gastro `#odAbone`: yalnız paket kartı. Gastro'nun Ücretsiz dalı (`$aktifKod === 'ucretsiz'`)
// yenileme, kampanya kodu ve iptal kartı basmaz; hesabı dondurma Hesap Ayarları › Dondurma sekmesindedir.
// Kartın özeti Paketlerim'deki Ücretsiz kademe özeti ve açık özellik sayısı (PaketOzellikMatrisi, 30).
const abonelik = `${sekmeBas('fa-solid fa-crown', 'Paket aboneliği', 'Aktif aboneliğin', 'Kademen, dönem tarihlerin, yenileme durumu ve iptal. Kademelerin içeriği Paketlerim\'de.')}
        <div id="odAbone">
<div class="paket-karti"><div class="paket-bas"><span class="paket-rozet"><i class="fa-solid fa-user" aria-hidden="true"></i> Ücretsiz</span><div class="paket-bilgi"><b>Dada Gourmet Ücretsiz <span class="durum-hapi acik"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Etkin</span></b><span class="paket-yenileme"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i>
 Ücretsiz kademe süresizdir, tahsilat alınmaz.
</span></div><div class="paket-fiyat"><b>₺0</b><span>/ ay</span></div></div><div class="paket-govde"><p class="durum-satir"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Gourmet'i keşfetmeye bugün başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz. Bu kademede toplam 30 özellik açık. Tam döküm <a href="{{kok}}hesabim/paketlerim/karsilastir/">Paketlerim</a>'de.</span></p></div><div class="paket-eylemler"><a class="dugme birincil" href="{{kok}}hesabim/paketlerim/kademeler/"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Kademeleri İncele</a><a class="dugme hayalet" href="{{kok}}hesabim/paketlerim/karsilastir/"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Kademeleri Karşılaştır</a></div></div></div>`;

// ── FATURALAR ── süzgeç: canlıda GET ile sunucuda; prototipte her tür ayrı adres
const TURLER = [['tumu', 'fa-list', 'Tümü'], ['uyelik', 'fa-crown', 'Üyelik'], ['rehber', 'fa-user-tie', 'Rehber'], ['iade', 'fa-rotate-left', 'İade']];
const turSec = { tumu: () => true, uyelik: (f) => f.tur === 'uyelik', rehber: () => false, iade: (f) => f.durum === 'iade' };
const faturaSatir = (f) => `<tr>
                      <td><span class="no">${f.no}<small>${PAKET.ad}</small></span></td>
                      <td class="tarih">${f.tarih}</td>
                      <td class="tutar">${tl(f.toplam)}</td>
                      <td>${pill(DURUM[f.durum])}</td>
                      <td>${panelDugme('odFt' + f.id, 'fa-solid fa-file-invoice', 'Detay', 'dugme satir')}</td>
                    </tr>`;
const faturalar = (tur) => {
  const l = F.filter(turSec[tur]);
  const bos = tur === 'tumu'
    ? `<div class="bos-durum">
                  <span class="bos-ikon"><i class="fa-solid fa-file-circle-question" aria-hidden="true"></i></span>
                  <h4>Henüz faturan yok</h4>
                  <p>Bir paket alımı tamamlandığında faturası burada listelenir ve belgesini indirebilirsin.</p>
                  <a class="dugme birincil" href="{{kok}}hesabim/paketlerim/">Paketlere göz at</a>
                </div>`
    : `<div class="bos-durum" id="odFtBos">
                  <span class="bos-ikon"><i class="fa-solid fa-file-circle-question" aria-hidden="true"></i></span>
                  <h4>Bu türde fatura yok</h4>
                  <p>${tur === 'rehber' ? 'Rehber tahsilatı bu markada henüz yok; rehber ödemeleri açıldığında belgeleri burada listelenir.' : 'Seçtiğin türde henüz bir belge kesilmemiş. Süzgeci "Tümü"ne alırsan defterin tamamını görürsün.'}</p>
                  <a class="dugme birincil" href="{{kok}}${O}faturalar/" id="odFtSifirla">Süzgeci temizle</a>
                </div>`;
  return `${sekmeBas('fa-solid fa-file-invoice', 'Belgeler', 'Faturaların', 'Paket alımlarının ve iadelerin tamamı tek defterde. Bir türe tıklayınca liste süzülür, sayfa yeniden yüklenir.')}
        <div class="kart odeme" id="fatura-bilgilerim">
          <div class="kart-bas">
            <div>
              <h3><i class="fa-solid fa-receipt" aria-hidden="true"></i> Fatura defteri ${et}</h3>
              <p>Fatura numarası, tarih, tutar, durum ve belge. Her satırın hangi pakete ait olduğu numaranın altında yazar.</p>
            </div>
          </div>
          <div class="kart-suzgec">
            <div class="cipler" role="group" aria-label="Fatura türü süzgeci" id="odFtChips">
              <span class="cipler-basligi">Tür</span>
${TURLER.map(([a, i, e]) => `              <a class="cip suzgec${a === tur ? ' on' : ''}" href="{{kok}}${O}faturalar/${a === 'tumu' ? '' : a + '/'}"${a === tur ? ' aria-current="page"' : ''}><i class="fa-solid ${i}" aria-hidden="true"></i> ${e}</a>`).join('\n')}
            </div>
          </div>
          <p class="kart-sayac" id="odFtCount" role="status">${l.length} faturadan <b>${l.length}</b> tanesi gösteriliyor.</p>
          <div class="kart-govde bosluksuz">
            ${l.length ? `<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Fatura listesi">
                <table class="tablo">
                  <thead>
                    <tr>
                      <th scope="col">Fatura no</th>
                      <th scope="col">Tarih</th>
                      <th scope="col">Tutar</th>
                      <th scope="col">Durum</th>
                      <th scope="col">Belge</th>
                    </tr>
                  </thead>
                  <tbody id="odFtBody">
                    ${l.map(faturaSatir).join('\n                    ')}
                  </tbody>
                </table>
              </div>` : bos}
          </div>
          <div class="kart-govde" style="padding-top:0">
            <div class="alt-not" style="border-top:none;padding-top:0;margin-top:14px"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span><b>Belge indirilebilir, PDF üretilmez.</b> "Detay" faturanın dökümünü, vergi ayrımını ve tahsilat bilgisini gösterir; oradan belgeyi HTML dosyası olarak indirebilir ya da yazdırabilirsin. PDF'i yazdırma penceresinden sen kaydedersin. Faturalar aynı zamanda e-posta adresine gönderilir.</span></div>
          </div>
        </div>`;
};

// İndirilen belge: odemeler-belge.blade.php'nin markup'ı, dosya tarayıcıda data: adresinden iner (sunucu yok).
const belge = (f) => {
  const d = DURUM[f.durum][0];
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${f.no} — Fatura belgesi — Dada Gourmet</title></head><body><div class="k"><div class="ust"><h1>${f.no}</h1><div>${PAKET.ad}</div><div><small>Düzenleme tarihi ${f.uzun}</small></div><div><b>${d}</b></div></div><div class="iki"><div><h2>Satıcı</h2><b>Dada Gourmet</b><br><small>Ticari unvan, vergi dairesi ve vergi numarası satışa açılmadan önce yazılacak.</small></div><div><h2>Alıcı</h2><b>{{uye.ad}}</b><br><small>{{uye.eposta}}</small></div></div><h2>Kalemler</h2><table><thead><tr><th>Açıklama</th><th class="s">Adet</th><th class="s">Birim</th><th class="s">KDV</th><th class="s">Tutar</th></tr></thead><tbody><tr><td><b>${PAKET.ad}</b><br><small>${PAKET.aciklama}</small></td><td class="s">1</td><td class="s">${tlKod(f.toplam)}</td><td class="s">%${KDV}<br><small>${tlKod(f.vergi)}</small></td><td class="s"><b>${tlKod(f.toplam)}</b></td></tr></tbody></table><table class="top"><tr><td>Ara toplam</td><td class="s">${tlKod(f.ara)}</td></tr><tr><td>KDV (%${KDV})</td><td class="s">${tlKod(f.vergi)}</td></tr><tr><td>Genel toplam</td><td class="s">${tlKod(f.toplam)}</td></tr></table><h2>Tahsilat</h2><div>${f.tahsilat} · ${d}</div><div class="not"><b>Dada Gourmet'in ticari unvanı, vergi dairesi ve vergi numarası satışa açılmadan önce yazılacak;</b> bu dosya yasal bir e-Arşiv faturası değildir. Tarayıcından yazdırıp PDF olarak kaydedebilirsin.</div><p><small>Prototip örneği: bu belge gerçek bir tahsilata ait değildir.</small></p></div></body></html>`;
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html).replace(/%7B%7Buye\.(\w+)%7D%7D/g, '{{uye.$1}}');
};
// Canlıdaki `#fatura-belgesi` kartının içi (fd-kunye · fd-taraf · kalem tablosu · fd-toplam · fd-ode · ft-foot), pencerede.
// `fd-*` kuralları prototipte yok; her parçanın yanında kanonun belge karşılığı (bilesenler.css: belge-toplam ·
// belge-taraflar · tablo belge · belge-odeme · belge-ayak · belge-pencere) basılı. Künye canlıda `dl` üç sütun; kanonun
// `.kunye.belge`i 520px pencerede ve 390'da hücreleri ezdiği için künye satırları `belge-toplam` listesinde.
const faturaPnl = (f) => {
  const d = DURUM[f.durum], id = 'odFt' + f.id;
  return `<div class="fb-modal" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-bas" inert="">
  <div class="fb-panel belge-pencere">
    <div class="fb-head">
      <div>
        <h3 id="${id}-bas">${f.no}</h3>
        <p>${PAKET.ad} — belgenin dökümü, vergi ayrımı ve tahsilat bilgisi.</p>
      </div>
      <button class="fb-close" type="button" data-dm-kapat="" aria-label="Kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    </div>
    <div class="fb-body">
      <ul class="fd-kunye belge-toplam">
        <li><span>Fatura no</span><span>${f.no}</span></li>
        <li><span>Düzenleme tarihi</span><span>${f.uzun} · ${PAKET.sure} günlük dönem</span></li>
        <li><span>Durum</span><span>${pill(d)}</span></li>
      </ul>
      <div class="fd-taraf belge-taraflar">
        <section>
          <h4>Satıcı</h4>
          <div><b>Dada Gourmet</b><p>Ticari unvan, vergi dairesi ve vergi numarası satışa açılmadan önce yazılacak.</p></div>
        </section>
        <section>
          <h4>Alıcı</h4>
          <div><b>{{uye.ad}}</b><p><span>{{uye.eposta}}</span></p></div>
        </section>
      </div>
      <div class="tablo-kap" tabindex="0" role="region" aria-label="Fatura kalemleri">
        <table class="tablo belge">
          <thead>
            <tr>
              <th scope="col">Açıklama</th>
              <th scope="col" class="sag">Miktar</th>
              <th scope="col" class="sag">Birim fiyat</th>
              <th scope="col" class="sag">KDV</th>
              <th scope="col" class="sag">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>${PAKET.ad}</b><small>${PAKET.aciklama}</small></td>
              <td class="sag">1</td>
              <td class="sag">${tl(f.toplam)}</td>
              <td class="sag">%${KDV}<small>${tl(f.vergi)}</small></td>
              <td class="sag"><b>${tl(f.toplam)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="fd-toplam belge-toplam">
        <li><span>Ara toplam</span><span>${tl(f.ara)}</span></li>
        <li><span>KDV (%${KDV} · dijital hizmet)</span><span>${tl(f.vergi)}</span></li>
        <li class="genel"><span>Genel toplam</span><span>${tl(f.toplam)}</span></li>
      </ul>
      <div class="fd-ode belge-odeme">
        <span class="fd-ode-txt belge-odeme-metin"><b>Tahsilat</b><span>${f.tahsilat} · ${d[0]}</span></span>
      </div>
      <div class="ft-foot belge-ayak">
        <p class="not">Kesilmiş belgeler geriye dönük düzenlenmez.</p>
        <a class="dugme birincil" href="${belge(f)}" download="${f.no}.html"><i class="fa-solid fa-download" aria-hidden="true"></i> Belgeyi İndir</a>
      </div>
    </div>
  </div>
</div>`;
};

// Fatura Bilgilerim düğmesi ve penceresi Gastro'da kapalı (`@if(false)`); prototipte de basılmaz.

// ── KAYITLI KARTLAR ── Gastro `#od-pane-kartlar`: boş liste, kart ekleme formu yok (kart numarası toplanmaz)
const kartlar = `${sekmeBas('fa-solid fa-credit-card', 'Ödeme yöntemleri', 'Kayıtlı kartların', 'Yenilemede kullanılacak kartı buradan seçer, yeni kart ekler veya kaldırırsın. Bu bölüm Hesap Ayarları\'ndan buraya taşındı.')}
        <div class="kart odeme">
          <div class="kart-bas">
            <div>
              <h3><i class="fa-solid fa-credit-card" aria-hidden="true"></i> Kartların</h3>
              <p>Varsayılan kart yenilemede ve yeni satın almalarda ilk sırada denenir. Reddedilirse diğer kart denenir; ikisi de reddedilirse tahsilat başarısız olur ve sana bildirilir.</p>
            </div>
            <span class="durum-hapi kapali" id="odKartSay">0 kart</span>
          </div>
          <div class="kart-govde">
            <div class="odeme-liste">
              <div class="bos-durum kart-ici">
                <span class="bos-ikon"><i class="fa-solid fa-credit-card" aria-hidden="true"></i></span>
                <h4>Kayıtlı kartın yok</h4>
                <p>Bir tahsilat yapıldığında kullandığın kart bu listeye düşer ve yenilemelerde tekrar kullanılır.</p>
              </div>
            </div>
            <p class="od-sonuc" id="odKartSonuc" role="status">
              <i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i>
              <span class="od-sonuc-txt"></span>
            </p>
            <div class="alt-not"><i class="fa-solid fa-lock" aria-hidden="true"></i> <span><b>Tam kart numarası Dada Gourmet'te tutulmaz.</b> Kart kayıtları ödeme sağlayıcısında saklanır; burada yalnız marka, son dört hane ve son kullanma tarihi görünür. Yenilemede ve yeni satın almalarda <b>varsayılan</b> işaretli kart kullanılır.</span></div>
          </div>
        </div>`;

// ── İADE TALEPLERİ ──
const iade = `${sekmeBas('fa-solid fa-rotate-left', 'İade', 'İade talepleri', 'Yanlış tahsilat, kullanılmayan tur hakkı veya cayma hakkı için talep açarsın. Açtığın talepler burada durumuyla listelenir.')}
        <div class="kart odeme">
          <div class="kart-bas">
            <div>
              <h3><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Taleplerin ${et}</h3>
              <p>Her talep bir tahsilata bağlıdır. Durum değiştiğinde e-posta ve bildirim alırsın.</p>
            </div>
            <span class="durum-hapi kapali" id="odIadeSay">${IADE.length} talep</span>
          </div>
          <div class="kart-govde bosluksuz">
            <div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="İade talepleri">
              <table class="tablo">
                <thead>
                  <tr><th scope="col">Talep ve tahsilat</th><th scope="col">Tarih</th><th scope="col">Tutar</th><th scope="col">Durum</th><th scope="col">Belge</th></tr>
                </thead>
                <tbody id="odIadeBody">
${IADE.map((t) => `                  <tr>
                    <td><span class="no">${t.ref}<small>${PAKET.ad} · ${t.neden}</small></span></td>
                    <td class="tarih">${t.tarih}</td>
                    <td class="tutar">${tl(t.fatura.toplam)}</td>
                    <td>${pill(IADE_DURUM[t.durum])}</td>
                    <td>${panelDugme('odFt' + t.fatura.id, 'fa-solid fa-file-invoice', 'Tahsilat', 'dugme satir')}</td>
                  </tr>`).join('\n')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="kart odeme">
          <div class="kart-bas"><div>
            <h3><i class="fa-solid fa-file-circle-plus" aria-hidden="true"></i> Yeni iade talebi</h3>
            <p>Hangi tahsilat için, neden. Tutar seçtiğin tahsilattan gelir; elle girilmez.</p>
          </div></div>
          <div class="kart-govde">
            <form id="odIadeForm" autocomplete="off" data-dm-form="odIade" data-dm-mesaj="İade talebin bu tarayıcıda not edildi. Prototipte yönetime iletilmez, tahsilat değişmez.">
              <div class="alan">
                <label class="alan-etiket" for="odIadeTahsilat">İade istediğin tahsilat <span class="zorunlu" aria-hidden="true">*</span></label>
                <select class="alan-secim" id="odIadeTahsilat" name="alim" required>
                  <option value="">Bir tahsilat seç</option>
${IADEYE_ACIK.map((f) => `                  <option value="${f.id}" data-tutar="${tl(f.toplam)}">${f.no} — ${PAKET.ad} · ${tl(f.toplam)}</option>`).join('\n')}
                </select>
                <p class="alan-yardim" id="odIadeTutar"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> İade tutarı seçtiğin tahsilattan okunur.</p>
              </div>
              <div class="alan">
                <label class="alan-etiket" for="odIadeNeden">İade nedeni <span class="zorunlu" aria-hidden="true">*</span></label>
                <select class="alan-secim" id="odIadeNeden" name="neden" required>
                  <option value="">Bir neden seç</option>
                  <option value="yanlis">Yanlış veya mükerrer tahsilat</option>
                  <option value="kullanilmadi">Kullanılmayan tur hakkı</option>
                  <option value="cayma">Cayma hakkı (14 gün)</option>
                  <option value="hizmet">Hizmet alınamadı</option>
                  <option value="baska">Başka bir neden</option>
                </select>
              </div>
              <div class="alan">
                <label class="alan-etiket" for="odIadeAciklama">Açıklama <span class="zorunlu" aria-hidden="true">*</span><span class="alan-sayac" id="odIadeSayac">0 / 600</span></label>
                <textarea class="alan-metin" id="odIadeAciklama" name="aciklama" maxlength="600" minlength="20" placeholder="Ne oldu? Tarih, tutar ve varsa işlem numarasını yazarsan talep daha hızlı sonuçlanır." required></textarea>
              </div>
              <div class="onay-eylemler">
                <button class="dugme birincil" type="submit"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Talebi Gönder</button>
                <p class="durum-satir" role="status"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> <span>Cayma ve iade koşulları <a href="{{kok}}yasal/iade-kosullari/">yasal metinde</a> yazılı.</span></p>
              </div>
            </form>
            <div class="alt-not"><i class="fa-solid fa-headset" aria-hidden="true"></i> <span>Rehber turu iadeleri rehberle anlaştığın koşullara bağlıdır; anlaşmazlık olursa <a href="{{kok}}hesabim/cozum-merkezi/#taleplerim">destek talebi</a> açarsın. Abonelik iadesi komisyon ve dönem kurallarına tabidir.</span></div>
          </div>
        </div>`;

// Gastro sırası; "Hizmet / Uzman Ödemeleri" (şef üyelikleri) Gourmet'te yok, basılmaz
const SEKME = [
  ['abonelik', 'fa-solid fa-crown', 'Abonelik Ödemeleri'],
  ['faturalar', 'fa-solid fa-file-invoice', 'Faturalar'],
  ['kartlar', 'fa-solid fa-credit-card', 'Kayıtlı Kartlar'],
  ['iade', 'fa-solid fa-rotate-left', 'İade Talepleri'],
];
// Alt yol → [etkin pano, fatura türü]
const SAYFALAR = [
  [O.slice(0, -1), 'abonelik', 'tumu'],
  [O + 'faturalar', 'faturalar', 'tumu'],
  ...['uyelik', 'rehber', 'iade'].map((t) => [O + 'faturalar/' + t, 'faturalar', t]),
  [O + 'kartlar', 'kartlar', 'tumu'],
  [O + 'iade', 'iade', 'tumu'],
];
const kabuk = (icerik) => `<section class="bolum">
  <div class="wrap kap">
    <div class="okuma-kolonu">
      <div class="od-sec">
        ${icerik}
      </div>
    </div>
  </div>
</section>`;

export default function () {
  return SAYFALAR.map(([yol, k, tur]) => {
    const pano = { abonelik, faturalar: faturalar(tur), kartlar, iade };
    const govde = bant({ cur: 'Ödemelerim', ikon: 'fa-solid fa-utensils', giris: 'Abonelik, faturalar, kayıtlı kartlar ve iade talepleri tek adreste. Sekme değişir, kimlik kartın yerinde kalır.', serit: gourmetSayac() })
      + gastroRay('od', 'Ödemelerim bölümleri', SEKME, k)
      + `<div class="modul-govde">
${SEKME.map(([a]) => gastroPano('od', a, k, kabuk(pano[a]))).join('\n')}
</div>`;
    const disi = F.map(faturaPnl).join('\n');
    const s = sayfa(yol, 'Ödemelerim', govde, { disi, js: SEKME_JS, donor: 'yerel Gastro /hesabim/odemelerim (resources/views/turetilmis/uye/g-odemelerim.blade.php, demo tohum render); içerik canlı dadagourmet.com/hesabim/odemelerim, DadaGourmet-acil 4eb638c resources/views/hesap/odemeler.blade.php' });
    s.meta.css = ['assets/g/kanon/gomulu/odemelerim-fark.css', ...SEKME_CSS, ...s.meta.css];
    return s;
  });
}
