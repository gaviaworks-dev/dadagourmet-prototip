// Herkese açık Pro sayfası: Dada Gastro /pro karşılığı (Beyar 11 Kas: "Gastro'nun /pro kalıbını Gourmet içeriği ve ₺99
// fiyatla uygula; Pro'yu İncele düğmeleri oraya gitsin"). Donör canlı https://dadagastro.com/pro (GET 11 Kas) ve canlı hat
// dalındaki resources/views/turetilmis/public/pro.blade.php; sayfa CSS'i ve betiği Gastro `varliklar/reference/pro/pro.{css,js}`
// (canlı, yerel ve dal bayt bayt aynı), zincir `_src/kabuk/zincir.json` "pro". Sayfa CSS'i zincirde olduğu için fark dosyası yok.
// İçerik tek kaynaktan: kademe ve özellik matrisi `_src/veri/paket-kademeleri.mjs` (Paketlerim de oradan okur).
// Gastro'nun vitrin kuralı (PaketVitrini): kart ve tablo matrisin tamamını değil, kademeleri ayıran satırları basar; fiyatı
// olmayan kademe fiyat satırı basmaz; yıllık fiyat yoksa aylık/yıllık anahtarı basılmaz. Gourmet'te yıllık fiyat yok.
// Basılmayan Gastro bölümleri: "İki ayrı katman" gösterimi (şef takibi ve Pro kilitli video, Gourmet'te karşılığı yok),
// içerik üretici kotası satırı, SSS (Gourmet'te Pro/ödeme SSS konusu yok; Gastro'nun cevapları Gourmet için doğru değil).
import { KADEME, GRUPLAR, SATIRLAR, satir, para } from '../../veri/paket-kademeleri.mjs';

const [UCRETSIZ, PRO, PROMAX] = KADEME;
const sutun = (k) => KADEME.indexOf(k) + 1;

// Gastro VITRIN'in "Reklam" eşlemesi: matriste değerli satır ("Reklam var" / "Reklamsız"), vitrinde "Reklamsız deneyim" adıyla
// ve ölçüte eşitlikle açık/kapalı. Kalan vitrin satırları matris sırasıyla, kademeler arasında değeri değişen satırlar.
const REKLAM = { ad: 'Reklam', etiket: 'Reklamsız deneyim', olcut: 'Reklamsız' };
const degisen = SATIRLAR.filter((r) => r[0] !== REKLAM.ad && new Set(r.slice(1).map(String)).size > 1);
const VITRIN = [REKLAM, ...degisen.map((r) => ({ ad: r[0], etiket: r[0] }))];
const deger = (v, k) => satir(v.ad)[sutun(k)];
const dahil = (v, k) => { const d = deger(v, k); return v.olcut ? d === v.olcut : d !== false; };
// Gastro kart maddesi: işaret + etiket; ölçülü satırda değer düz metin (Gastro kota maddesi "1 içerik üretici kotası" gibi)
const madde = (v, k) => {
  const d = deger(v, k), ac = dahil(v, k), olcu = !v.olcut && typeof d === 'string' ? `: ${d}` : '';
  return `<li class="${ac ? '' : 'no'}"><i class="fa-solid ${ac ? 'fa-check' : 'fa-xmark'}" aria-hidden="true"></i> ${v.etiket}${olcu}</li>`;
};
// Gastro UCRETSIZ_VITRIN: Ücretsiz'de açık iki temel satır (kaydetme, değerlendirme) + vitrinin Ücretsiz'de kapalı ilk iki satırı
const UCRETSIZ_VITRIN = [{ ad: 'Mekân, etkinlik ve gurme lezzet kaydetme', etiket: 'Mekân, etkinlik ve gurme lezzet kaydetme' }, { ad: 'Değerlendirme yazma ve puanlama', etiket: 'Değerlendirme yazma ve puanlama' }, ...VITRIN.filter((v) => !dahil(v, UCRETSIZ)).slice(0, 2)];

// Satın alma ucu yok (ödeme bağlı değil). Misafir Gastro'nun giriş kapısını (`#lgGate`) görür; üye Paketlerim'in kademe panosuna gider
const KAPI = 'data-lg-gate="" data-lg-title="Pro’ya geçmek için giriş yap" data-lg-desc="Pro’ya geçmek için Dada Gourmet hesabına giriş yapman gerekiyor."';
const yukselt = (ek = '') => `<a class="btn btn-primary" href="{{kok}}hesabim/paketlerim/kademeler/" ${KAPI}>${ek}Pro’ya Yükselt</a>`;

const kart = (k) => {
  if (k === UCRETSIZ) return `<div class="pro-card pro-card--free">
                    <div class="pro-tier"><i class="fa-solid fa-user" aria-hidden="true"></i><b>${k.ad}</b></div>
                    <p class="pro-desc">${k.ozet}</p>
                    <p class="pro-price"><b>${para(k.tutar)}</b><span>/ her zaman</span></p>
                    <ul class="pro-feats">
                        ${UCRETSIZ_VITRIN.map((v) => madde(v, k)).join('\n                        ')}
                    </ul>
                    <a class="btn btn--ghost" href="{{kok}}kayit/">Ücretsiz Kayıt Ol</a>
                </div>`;
  // Gastro: öne çıkan kademe `fa-star` + "Öne çıkan" bayrağı, öbürleri `fa-gem`; satışa açık olmayan kademe kapalı düğme basar
  return `<div class="pro-card${k.one ? ' pro-card--featured' : ''}">
                    ${k.one ? '<span class="pro-flag">Öne çıkan</span>' : ''}<div class="pro-tier">
                        <i class="fa-solid ${k.one ? 'fa-star' : 'fa-gem'}" aria-hidden="true"></i>
                        <b>${k.ad}</b>
                    </div>
                    <div class="pro-desc">${k.ozet}</div>
${k.tutar !== null ? `                    <p class="pro-price">
                        <b data-price="monthly">${para(k.tutar)}</b>
                        <span>/ ay</span>
                    </p>\n` : ''}                    <ul class="pro-feats">
                        ${VITRIN.map((v) => madde(v, k)).join('\n                        ')}
                    </ul>
                    ${k.tutar !== null ? yukselt() : '<span class="btn btn--ghost" aria-disabled="true" data-plan-cta-closed="">Satışa Açılmadı</span>'}
                </div>`;
};

const hucre = (v, k) => {
  const d = deger(v, k), pop = k.one ? 'col-pop' : '';
  if (!v.olcut && typeof d === 'string') return `<td class="${pop}">${d}</td>`;
  return `<td class="${pop}"><i class="fa-solid ${dahil(v, k) ? 'fa-check yes' : 'fa-xmark nope'}" aria-hidden="true"></i></td>`;
};

// Gastro "pro-perks" üç kutusu: Gourmet'in Pro'da açılan başlıkları, metindeki değerler matristen okunur
const pd = (ad) => satir(ad)[sutun(PRO)], md = (ad) => satir(ad)[sutun(PROMAX)];
const PERKS = [
  ['fa-ban', 'Reklamsız deneyim', `Tüm Pro planlarda reklam yok.`],
  ['fa-route', 'Kendi rotan', `Dada Route’ta kendi rotanı oluşturursun (Pro’da ${pd('Kendi rotanı oluşturma')}, ${PROMAX.ad}’ta ${md('Kendi rotanı oluşturma').toLocaleLowerCase('tr')}); durak ziyaretlerini işaretler, rotanı bağlantıyla paylaşırsın.`],
  ['fa-bookmark', 'Liste ve keşif sınırları', `Listelerim’de ${pd('Listelerim')}, Mekân Bul sihirbazında ${pd('Mekân Bul sihirbazı').toLocaleLowerCase('tr')}, Ziyaret Ettiklerim defterinde ${pd('Ziyaret Ettiklerim defteri').toLocaleLowerCase('tr')}.`],
];
if (pd('Reklam') !== 'Reklamsız' || pd('Durak ziyaret işaretleme ve ilerleme') !== true || pd('Rotanı bağlantıyla paylaşma') !== true) throw new Error('pro: tanıtım metni matrisle uyuşmuyor');

const govde = `
    <section class="below-header tb-top px-band" aria-label="Sayfa başlığı" data-px-band="1" data-hero-band=""><div class="px-clip" style="--px-x: 50%; --px-y: 50%; background-color: rgb(58, 53, 44); --px-r: 0px;"><div class="px-media" style="background-image:url('{{kok}}assets/o/assets/gourmet-public/medya/konsept-tas-konak.webp')"></div></div>
        <div class="tb-hero-img" aria-hidden="true" style="background-image: none; background-color: transparent;"></div>
        <div class="wrap">
            <nav class="rd-crumb" aria-label="Sayfa yolu">
                <a href="{{kok}}"><i class="fa-solid fa-house" aria-hidden="true"></i></a>
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                <b>Pro</b>
            </nav>
            <div class="tb-hero-main">
                <span class="eyebrow"><i class="fa-solid fa-crown" aria-hidden="true"></i> Dada Gourmet Pro</span>
                <h1>Pro, keşfinin tamamını açar</h1>
                <p class="lead">${PRO.ozet}</p>
            </div>
        </div>
    </section>

    <section class="pro-intro">
        <div class="wrap">
            <div class="lead-wrap">
                <p>Dada Gourmet Pro tek üyeliktir. Pro’da reklamlar kalkar, kendi rotanı oluşturur, durak ziyaretlerini işaretler ve rotanı bağlantıyla paylaşırsın.</p>
                <p>Pro aylık aboneliktir; istediğin an yükseltir, düşürür ya da bırakırsın. ${PROMAX.ad} henüz satışa açılmadı.</p>
            </div>
            <div class="pro-perks">
${PERKS.map(([i, b, p]) => `                <div class="pro-perk">
                    <span class="pp-ico"><i class="fa-solid ${i}" aria-hidden="true"></i></span>
                    <b>${b}</b>
                    <p>${p}</p>
                </div>`).join('\n')}
            </div>
        </div>
    </section>

    <section class="pro-tiers">
        <div class="wrap">
            <div class="sec-head"><div>
                <span class="eyebrow" style="color:var(--tomato)"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> Planlar</span>
                <h2>Sana uygun Pro’yu seç</h2>
                <p class="lead">Kademelerin kapsamı ve fiyatı aşağıda.</p>
            </div></div>
            <div class="pro-grid" data-interval="monthly">
                ${KADEME.map(kart).join('\n                ')}
            </div>
        </div>
    </section>

    <section class="pro-compare">
        <div class="wrap">
            <div class="sec-head"><div>
                <span class="eyebrow" style="color:var(--tomato)"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Karşılaştırma</span>
                <h2>Planları yan yana gör</h2>
            </div></div>
            <div class="cmp-wrap">
                <table class="cmp-table">
                    <thead>
                        <tr>
                            <th>Özellik</th>
                            ${KADEME.map((k) => `<th class="${k.one ? 'col-pop' : ''}">${k.ad}</th>`).join('\n                            ')}
                        </tr>
                    </thead>
                    <tbody>
${VITRIN.map((v) => `                        <tr>
                            <td>${v.etiket}</td>
                            ${KADEME.map((k) => hucre(v, k)).join('\n                            ')}
                        </tr>`).join('\n')}
                        <tr class="cmp-pricerow">
                            <td>Aylık fiyat</td>
                            ${KADEME.map((k) => `<td class="${k.one ? 'col-pop' : ''}">${k.tutar === null ? '' : para(k.tutar)}</td>`).join('\n                            ')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <section class="pro-cta">
        <div class="wrap">
            <h2>Keşfinin tamamını açmaya hazır mısın?</h2>
            <p>Reklamsız deneyim, kendi rotan ve daha geniş liste sınırlarıyla Dada Gourmet Pro seni bekliyor.</p>
            ${yukselt('<i class="fa-solid fa-crown" aria-hidden="true"></i> ')}
        </div>
    </section>
`;

export default function () {
  return [{ yol: 'pro', meta: { baslik: 'Dada Gourmet Pro', zincir: 'pro', donor: 'https://dadagastro.com/pro (GET 11 Kas) + yerel DadaGastro turetilmis/public/pro.blade.php; kademe ve özellik verisi canlı dadagourmet.com, DadaGourmet-acil 4eb638c PaketKademesi · PaketOzellikMatrisi' }, govde }];
}
