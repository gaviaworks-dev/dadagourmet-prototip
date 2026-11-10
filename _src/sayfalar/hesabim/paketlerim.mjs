// Paketlerim: Dada Gastro /hesabim/paketlerim karşılığı, birebir (Beyar 10 Kas H7, 11 Kas parite denetimi). Donör yerel
// Gastro resources/views/turetilmis/uye/g-paketlerim.blade.php, PaketlerimDenetleyicisi demo tohum üyeyle iki durumda render
// edildi: Ücretsiz üye (varsayılan) ve etkin Pro abonelikli üye (`?paket=pro`). Canlı hat dalındaki (fix/*-20261110) Blade
// aynı iskeleti çeviri anahtarlarıyla basar; sayfa CSS'i iki dalda bayt bayt aynı.
// Gourmet uyarlaması yalnız içerik: kademe adı, özet, tutar ve özellik matrisi canlı dadagourmet.com'un tek kaynağından
// (DadaGourmet-acil 4eb638c app/Ticaret/Enums/PaketKademesi.php, app/Ticaret/Servisler/PaketOzellikMatrisi.php: 8 başlık,
// 34 satır). Gastro'ya özel şef aboneliği kutuları (`ayrim-kutusu`, karşılaştırma altındaki şef notu) Gourmet'te karşılığı
// olmadığı için basılmaz. "İncele" düğmeleri Gastro'daki gibi herkese açık Pro sayfasına (`/pro`) gider (Beyar 11 Kas).
// Kademe ve özellik verisi `_src/veri/paket-kademeleri.mjs`te; Pro sayfası aynı modülü okur.
import { bant, gourmetSayac, sayfa } from './_kalip.mjs';
import { KADEME, GRUPLAR, SATIRLAR, para } from '../../veri/paket-kademeleri.mjs';
import { gastroRay, gastroPano, gastroKimlik, PAKET_IKON, SEKME_CSS, SEKME_JS } from './_gastro-sekme.mjs';

// Örnek üye Ücretsiz ({{uye.paket}}); `?paket=pro` test durumu Pro. Pro'nun dönemi örnek tarih (ödeme bağlı değil)
const DURUM = { ucretsiz: { i: 0, yenileme: 'Ücretsiz kademe süresizdir, tahsilat alınmaz.' }, pro: { i: 1, yenileme: 'Dönem 1 Kasım 2026 – 1 Aralık 2026. Sonraki tahsilat 1 Aralık 2026.' } };

const G = GRUPLAR;
// Gastro kart ve çiplerde yalnız özellik adı basar (değerli satırın değeri yalnız tabloda)
const acik = (i) => SATIRLAR.filter((s) => s[i + 1] !== false).map((s) => s[0]);
const kapali = (i) => SATIRLAR.filter((s) => s[i + 1] === false).map((s) => s[0]);
// Gastro tablo girişini yazıyla basar ("Otuz satır, yedi başlık")
const YAZI = { 8: 'sekiz', 34: 'Otuz dört' };
if (!YAZI[SATIRLAR.length] || !YAZI[G.length]) throw new Error('paketlerim: satır/başlık sayısının yazısı eksik');

// Gastro `#pkAktif` paket kartı
const paketKarti = (d) => {
  const A = KADEME[d.i], ac = acik(d.i);
  return `<div class="paket-karti"><div class="paket-bas"><span class="paket-rozet"><i class="fa-solid fa-${PAKET_IKON[A.ad]}" aria-hidden="true"></i> ${A.ad}</span><div class="paket-bilgi"><b>Dada Gourmet ${A.ad} <span class="durum-hapi acik"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Etkin</span></b><span class="paket-yenileme"><i class="fa-solid fa-rotate" aria-hidden="true"></i> ${d.yenileme}</span></div><div class="paket-fiyat"><b>${A.tutar !== null ? para(A.tutar) : '—'}</b><span>/ ay</span></div></div><div class="paket-govde"><p class="durum-satir"><i class="fa-solid fa-tag" aria-hidden="true"></i> <span>Şu an <b>${A.ad}</b> kademesindesin. Kademeler arası fiyat ve kapsam farkının tamamı Paket Kademeleri sekmesinde.</span></p><div class="paket-ozellikler">
${ac.map((o) => `<span><i class="fa-solid fa-check" aria-hidden="true"></i> ${o}</span>`).join('')}
</div><p class="durum-satir" style="margin-top:12px"><i class="fa-solid fa-list" aria-hidden="true"></i> <span>Bu kademede toplam <b>${ac.length} özellik</b> açık. Tam döküm <a href="#karsilastir" style="color:var(--fit-deep);font-weight:700">Karşılaştırma</a> sekmesinde.</span></p></div><div class="paket-eylemler"><a class="dugme birincil" href="{{kok}}pro/"><i class="fa-solid fa-gem" aria-hidden="true"></i> ${KADEME[2].yukle}</a><a class="dugme hayalet" href="#karsilastir"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Kademeleri Karşılaştır</a></div></div>`;
};

// Gastro `.kademe-karti`: sınıf yalnız `featured` (öne çıkan) ve `is-aktif`; bayrak yalnız etkin kartta ve (etkin değilse)
// Ücretsiz'de; düğme: etkin → kapalı "Mevcut paketin", Ücretsiz → kayıt bağı, öbürleri → "İncele" (`/pro`)
const kademeKart = (aktif) => (k, i) => {
  const ac = acik(i), kap = kapali(i), simdi = i === aktif;
  const bayrak = simdi ? '<span class="pro-flag kademe-bayrak simdi"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Mevcut paketin</span>' : k.k === 'ucretsiz' ? '<span class="pro-flag free">Herkese açık</span>' : '';
  const fiyat = k.tutar === null ? `<b aria-hidden="true">—</b><span>${k.not}</span>` : k.tutar === 0 ? '<b>₺0</b><span>/ her zaman</span>' : `<b>${para(k.tutar)}</b><span>/ ay</span>`;
  const dugme = simdi ? '<button class="dugme hayalet" type="button" disabled>Mevcut paketin</button>' : k.k === 'ucretsiz' ? '<a class="dugme hayalet" href="{{kok}}kayit/">Ücretsiz Kayıt Ol</a>' : `<a class="dugme birincil" href="{{kok}}pro/">${k.yukle}</a>`;
  return `<div class="pro-card kademe-karti ${k.sinif}${k.one ? ' featured' : ''}${simdi ? ' is-aktif' : ''}">
${bayrak}
<div class="kademe-bas"><i class="fa-solid fa-${k.kartIkon}" aria-hidden="true"></i><b>${k.ad}</b></div>
<p class="kademe-ozet">${k.ozet}</p>
<div class="kademe-fiyat">
${fiyat}
</div>
<ul class="kademe-ozellikler">
${ac.map((o) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i> ${o}</li>`).join('')}
</ul>
${kap.length ? `<details class="kademe-kapali"><summary>${kap.length} özellik bu kademede kapalı</summary><ul class="kademe-ozellikler">
${kap.map((o) => `<li class="no"><i class="fa-solid fa-xmark" aria-hidden="true"></i> ${o}</li>`).join('')}
</ul></details>` : ''}
${dugme}
</div>`;
};
const kartlar = (d) => KADEME.map(kademeKart(d.i)).join('\n');

const U = DURUM.ucretsiz;
const paketim = `<div class="pk-sec" id="pkAktifSec">
        <div class="sec-head"><div>
          <span class="ust-etiket"><i class="fa-solid fa-crown" aria-hidden="true"></i> Aktif kademe</span>
          <h2>Bugün hangi paketteysen</h2>
          <p class="lead">Kademen, dönem tarihlerin ve yenileme durumun. Yükseltme, düşürme ve iptal buradan başlar.</p>
        </div></div>

        <div id="pkAktif">
${paketKarti(U)}
        </div>

        <div class="alt-not">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          <span>Tahsilatların, faturaların ve kayıtlı kartların <a href="{{kok}}hesabim/odemelerim/">Ödemelerim</a> sayfasında. Üyelik ve iptal koşullarının tamamı <a href="{{kok}}yasal/kullanim-kosullari/">Kullanım Koşulları</a>'nda; bir sorun için <a href="{{kok}}hesabim/cozum-merkezi/#taleplerim">destek talebi</a> açabilirsin.</span>
        </div>
      </div>`;

const pro = KADEME.find((k) => k.k === 'pro');
const fiyatsiz = KADEME.filter((k) => k.tutar === null).map((k) => `${k.ad} için bir tutar henüz belirlenmedi, o yüzden sayı yerine durumu yazıyor.`).join(' ');
const kademeler = `<div class="pk-sec">
        <div class="sec-head"><div>
          <span class="ust-etiket"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> Üç kademe</span>
          <h2>Ücretsiz, Pro ve Pro Max</h2>
          <p class="lead">Ücretsiz kalıcıdır, süresi dolmaz. Pro aylık aboneliktir; istediğin an yükseltir, düşürür ya da bırakırsın. Pro Max henüz satışa açılmadı.</p>
        </div></div>

        <div class="kademe-izgara" id="pkKartlar">
${kartlar(U)}
</div>

        <div class="alt-not">
          <i class="fa-solid fa-credit-card" aria-hidden="true"></i>
          <span><b>${pro.ad} ${para(pro.tutar)} / ay</b>. ${fiyatsiz} Fiyatlar onay bekliyor; tutarlar tek bir yerden (kademe verisi) okunur.</span>
        </div>
      </div>`;

// Gastro tablosu: öne çıkan sütun sınıfı Blade'de kaçışlı basıldığı için (`class=&quot;one-cikan&quot;`) hiçbir hücre
// boyanmaz; görünür sonuç birebir alındı: sütun vurgusu yok
const hucre = (d) => `<td>${typeof d === 'string' ? d : d ? '<i class="fa-solid fa-check var" aria-hidden="true"></i><span class="sr-only">var</span>' : '<i class="fa-solid fa-xmark yok" aria-hidden="true"></i><span class="sr-only">yok</span>'}</td>`;
const karsilastir = `<div class="pk-sec">
        <div class="sec-head"><div>
          <span class="ust-etiket"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Satır satır</span>
          <h2>Hangi modül hangi kademede açık</h2>
          <p class="lead">Tablo, kademe kartlarıyla aynı veriden üretilir; iki yerde iki farklı liste olmaz. ${YAZI[SATIRLAR.length]} satır, ${YAZI[G.length]} başlık.</p>
        </div></div>

        <div class="tablo-kap cerceveli" role="region" aria-label="Paket karşılaştırma tablosu" tabindex="0" id="pkTablo"><table class="tablo karsilastirma"><caption class="sr-only">Ücretsiz, Pro ve Pro Max kademelerinin özellik karşılaştırması</caption><thead><tr><th scope="col">Özellik</th>
${KADEME.map((k) => `<th scope="col"><span class="kademe-ad"><i class="fa-solid fa-${k.kartIkon}" aria-hidden="true"></i> ${k.ad}</span><span class="kademe-fiyat-not">${k.tutar === null ? k.not : k.tutar === 0 ? '₺0 / her zaman' : para(k.tutar) + ' / ay'}</span></th>`).join('')}
</tr></thead><tbody>
${G.map(([b, i, s]) => `<tr class="tablo-grup"><th colspan="${KADEME.length + 1}" scope="colgroup"><i class="fa-solid fa-${i}" aria-hidden="true"></i> ${b}</th></tr>\n` + s.map((r) => `<tr><th scope="row">${r[0]}</th>\n${KADEME.map((k, j) => hucre(r[j + 1])).join('\n')}\n</tr>`).join('\n')).join('\n')}
</tbody></table></div>
        <p class="tablo-ipucu"><i class="fa-solid fa-arrows-left-right" aria-hidden="true"></i> Dar ekranda tabloyu yana kaydırarak üç kademeyi karşılaştırabilirsin.</p>
      </div>`;

// `?paket=pro` test durumu: değişen üç parça (kimlik rozeti, paket kartı, kademe kartları); paketlerim-durum.js uygular
const PR = DURUM.pro;
const proDurum = `<template data-pk-pro=".kimlik h1 [data-paket]" data-dis=""><span class="rozet dolu" data-paket=""><i class="fa-solid fa-${PAKET_IKON[KADEME[PR.i].ad]}" aria-hidden="true"></i> ${KADEME[PR.i].ad}</span></template>
<template data-pk-pro="#pkAktif">${paketKarti(PR)}</template>
<template data-pk-pro="#pkKartlar">${kartlar(PR)}</template>`;

// Gastro sırası; her alt yol aynı belgeyi o panosu açık basar
const SEKMELER = [
  ['paketim', 'fa-solid fa-crown', 'Mevcut Paketim'],
  ['kademeler', 'fa-solid fa-layer-group', 'Paket Kademeleri'],
  ['karsilastir', 'fa-solid fa-table-list', 'Paket Karşılaştırma'],
];
const P = 'hesabim/paketlerim/';
const SEKME = { paketim: [P.slice(0, -1), paketim], kademeler: [P + 'kademeler', kademeler], karsilastir: [P + 'karsilastir', karsilastir] };

const kabuk = (icerik) => `<section class="bolum">
  <div class="wrap kap">
    <div class="okuma-kolonu">

      ${icerik}

    </div>
  </div>
</section>`;

export default function () {
  return SEKMELER.map(([k]) => {
    const [yol] = SEKME[k];
    const govde = gastroKimlik(bant({ cur: 'Paketlerim', ikon: 'fa-solid fa-utensils', giris: 'Hangi Pro kademesindesin, üç kademe neyi açıyor, nasıl yükseltir ya da düşürürsün. Sekme değişir, kimlik kartın yerinde kalır.', serit: gourmetSayac() }), { ikon: PAKET_IKON[KADEME[U.i].ad], rutbe: true })
      + gastroRay('pk', 'Paketlerim bölümleri', SEKMELER, k)
      + `<div class="modul-govde">
${SEKMELER.map(([a]) => gastroPano('pk', a, k, kabuk(SEKME[a][1]))).join('\n')}
</div>
${proDurum}`;
    const s = sayfa(yol, 'Paketlerim', govde, { js: [...SEKME_JS, 'assets/js/sayfa/paketlerim-durum.js'], donor: 'yerel Gastro /hesabim/paketlerim (resources/views/turetilmis/uye/g-paketlerim.blade.php, demo tohum üye Ücretsiz ve etkin Pro render, 11 Kas); kademe ve özellik verisi canlı dadagourmet.com, DadaGourmet-acil 4eb638c app/Ticaret/Enums/PaketKademesi.php · app/Ticaret/Servisler/PaketOzellikMatrisi.php' });
    s.meta.css = ['assets/g/kanon/gomulu/paketlerim-fark.css', ...SEKME_CSS, ...s.meta.css];
    return s;
  });
}
