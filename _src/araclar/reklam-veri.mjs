// Reklam verisi (reklam-cekirdek, 11 Kas): _src/veri/reklam-{markalar,kreatifler,yerlesim}.json → assets/js/reklam/veri.js.
// Marka renk satırları canlı `MarkaRengi::css` hesabının birebir JS karşılığıdır (DadaGourmet-panel
// app/Reklam/Servisler/MarkaRengi.php; kaynak DadaGastro@1ffcfda79b): WCAG kontrastıyla --rk-marka, --rk-dugme (beyaz yazıya AA),
// --rk-marka-metin, --rk-katman (fotoğraf üstü %80 marka katmanı, AA) ve --rk-yazi. Canlıda her kreatif satır içi <style> basar;
// prototipte satırlar derlemede bir kez üretilir. Çıktı yalnız reklam önizlemesi açıkken yüklenir (assets/js/reklam/reklam.js).

const hex2 = (v) => Math.round(v).toString(16).padStart(2, '0');
const parca = (kod) => [0, 2, 4].map((i) => parseInt(kod.slice(i, i + 2), 16));
export const renkKodu = (renk) => (/^#[0-9a-f]{6}$/i.test(String(renk)) ? String(renk).slice(1).toLowerCase() : 'e14827');

function kontrast(kod) {
  const [r, g, b] = parca(kod).map((x) => { const v = x / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const siyah = (l + 0.05) / 0.05, beyaz = 1.05 / (l + 0.05);
  return siyah >= beyaz ? ['#000000', siyah] : ['#ffffff', beyaz];
}
function beyazIcin(kod) {
  const rgb = parca(kod);
  for (let adim = 0; adim <= 100; adim++) {
    const ton = rgb.map((v) => hex2(Math.round(v * (1 - adim / 100)))).join('');
    const [metin, oran] = kontrast(ton);
    if (metin === '#ffffff' && oran >= 4.5) return '#' + ton;
  }
  return '#000000';
}
function katman(kod) {
  const [metin] = kontrast(kod);
  const rgb = parca(kod), hedef = metin === '#ffffff' ? 0 : 255, zemin = 255 - hedef;
  for (let adim = 0; adim <= 100; adim++) {
    const ton = rgb.map((v) => Math.round(v + (hedef - v) * adim / 100));
    const bilesik = ton.map((v) => hex2(Math.round(v * 0.8 + zemin * 0.2))).join('');
    const [enIyi, oran] = kontrast(bilesik);
    if (enIyi === metin && oran >= 4.5) return ['#' + ton.map(hex2).join(''), metin];
  }
  throw new Error('AA marka katmanı üretilemedi: ' + kod);
}
export function renkCss(renk) {
  const kod = renkKodu(renk), [metin] = kontrast(kod), [kat, yazi] = katman(kod);
  return `.rk-renk-${kod}{--rk-marka:#${kod};--rk-dugme:${beyazIcin(kod)};--rk-marka-metin:${metin};--rk-katman:${kat};--rk-yazi:${yazi}}`;
}

export function reklamVerisi(veri) {
  const M = veri['reklam-markalar']?.markalar, K = veri['reklam-kreatifler']?.alanlar, Y = veri['reklam-yerlesim'];
  if (!M || !K || !Y) return null;
  const markalar = {};
  for (const [id, m] of Object.entries(M)) markalar[id] = { ...m, id, renkSinif: 'rk-renk-' + renkKodu(m.renk) };
  const hata = [];
  for (const [kod, k] of Object.entries(K)) for (const x of [].concat(k)) if (!markalar[x.marka]) hata.push(kod + ': marka yok (' + x.marka + ')');
  /* Ülke ve yayın politikası (rota-global, 11 Kas; panel modeli YayinPolitikasi): ülke kodu ISO 3166-1 alfa-2 ya da '*'; kreatifin hedef
     ülkeleri markanın ülkelerinin alt kümesi. politika.alkol ülke → serbest | kapali (ara düzey yok); kilitli ülke (TR) kapali olmalı.
     Kapalı ülkeyi hedefleyen kreatifte engel: kreatif alkol bayrağı (alan ya da metin), alkollü içki markası (marka alkol bayrağı ya da
     sektörü), alkol bayraklı lezzet/etkinliği hedefleme. Mekânın alkol servisi engel değil. alkolKreatif false: hiçbir ülkede alkol kreatifi yok */
  const ulkeKodu = (u) => u === '*' || /^[A-Z]{2}$/.test(u);
  for (const [id, m] of Object.entries(M)) for (const u of m.ulkeler || []) if (!ulkeKodu(u)) hata.push('marka ' + id + ': ülke kodu ' + u);
  const P = Y.politika || {}, PA = P.alkol || {};
  const ALKOL = /alkollü|alkol(?!süz)|\bbira|şarap|sarap|rakı|viski|vodka|likör|\bbeer\b|\bwine\b|spirits|cocktail|kokteyl(?!.*alkolsüz)|kadeh/i;
  for (const [u, v] of Object.entries(PA)) if (!ulkeKodu(u) || !['serbest', 'kapali'].includes(v)) hata.push('politika.alkol: ' + u + '=' + v + ' (yalnız serbest | kapali)');
  for (const u of P.kilitli || []) if (PA[u] !== 'kapali') hata.push('politika.alkol: ' + u + ' kilitli, kapali olmalı');
  const durum = (u) => (u === '*' ? PA['*'] : PA[u] || PA['*']) || 'kapali';
  /* Hedeflenen lezzet/etkinlik kaydı (hedef bağının slug'ı): alkol alanı ya da adında/özetinde alkollü içki */
  const kayit = (slug) => { let bul = null; const gez = (o) => { if (bul || !o || typeof o !== 'object') return; if (o.slug === slug && (o.ad || o.baslik)) { bul = o; return; } Object.values(o).forEach(gez); }; gez(veri.etkinlik); gez(veri.lezzet); return bul; };
  for (const [kod, k] of Object.entries(K)) for (const x of [].concat(k)) {
    const mk = M[x.marka] || {}, mu = mk.ulkeler;
    for (const u of x.ulkeler || []) { if (!ulkeKodu(u)) hata.push(kod + ': ülke kodu ' + u); else if (mu && !mu.includes('*') && !mu.includes(u)) hata.push(kod + ' ' + (x.id || x.marka) + ': ' + u + ' markanın ülkelerinde yok'); }
    const hedefUlke = x.ulkeler || mu || ['*'], kapali = P.alkolKreatif === false || hedefUlke.some((u) => durum(u) === 'kapali');
    if (!kapali) continue;
    const slug = (/[?&][elsa]=([a-z0-9-]+)/.exec(x.hedef || '') || [])[1], hk = slug ? kayit(slug) : null;
    const neden = x.alkol ? 'kreatif alkol bayrağı' : ALKOL.test([x.baslik, x.metin, x.teklif].filter(Boolean).join(' ')) ? 'kreatif metninde alkol' : mk.alkol || /alkollü içki/i.test(mk.sektor || '') ? 'alkollü içki markası'
      : hk && (hk.alkol || ALKOL.test([hk.ad, hk.baslik, hk.ozet].filter(Boolean).join(' '))) ? 'alkol bayraklı hedef (' + slug + ')' : null;
    if (neden) hata.push(kod + ' ' + (x.id || x.marka) + ': ' + neden + ' (politika.alkol kapali)');
  }
  /* Rakip restoran yok (reklam-son-duzelt, Beyar kararı 11 Kas): marka `restoran` yalnız boolean; `rakipRestoranYok` sayfasında öncelik
     listesindeki her alanın restoran olmayan en az bir kreatifi olmalı (çekirdek `alan()` ile aynı tanım: restoran markası ya da `mekan` hedefi) */
  for (const [id, m] of Object.entries(M)) if ('restoran' in m && typeof m.restoran !== 'boolean') hata.push('marka ' + id + ': restoran yalnız true | false');
  const restoranMi = (x) => (typeof x.restoran === 'boolean' ? x.restoran : !!x.mekan || [x.marka, ...(x.markalar || [])].some((m) => M[m]?.restoran === true));
  for (const s of Y.sayfalar || []) if (s.rakipRestoranYok) for (const kod of s.oncelik || []) {
    if (K[kod] && ![].concat(K[kod]).some((x) => !restoranMi(x))) hata.push(s.ad + ' ' + kod + ': rakipRestoranYok sayfasında restoran dışı kreatif yok');
  }
  if (hata.length) throw new Error('reklam-kreatifler.json: ' + hata.join('; '));
  const css = [...new Set(Object.values(M).map((m) => renkCss(m.renk)))].join('\n');
  return 'window.DG_REKLAM_VERI=' + JSON.stringify({ markalar, alanlar: K, kurallar: Y.kurallar, politika: Y.politika || null, sayfalar: Y.sayfalar, reklamsiz: Y.reklamsiz, renkCss: css }) + ';\n';
}
