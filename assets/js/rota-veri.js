/* Dada Route statik örnek veri. Rota çizgisi yaklaşık; hesaplanmış güzergâh değildir. "prototip örneği" etiketiyle gösterilir.
   Katman noktaları üç pilot güzergâh üstündedir: [boylam, enlem, ad, nitelik]. Gerçek tesis değildir; §8 #9 dili: "Dinlenme alanı", "güvenli" yok. */
window.DG_ROTA = {
  ad: 'İstanbul – İzmir', kalkis: 'İstanbul', varis: 'İzmir', km: 480, sure: '5 sa 40 dk',
  cizgi: [[28.98, 41.03], [29.28, 40.87], [29.52, 40.76], [29.1, 40.5], [29.06, 40.2], [28.7, 40.05], [28.3, 39.95], [27.9, 39.65], [27.8, 39.2], [27.6, 38.95], [27.43, 38.62], [27.3, 38.5], [27.14, 38.42]],
  katman: {
    sarj: [[29.3, 40.84, 'Örnek DC hızlı şarj'], [29.0625, 40.1835, 'Örnek DC hızlı şarj'], [28.72, 40.06, 'Örnek DC hızlı şarj'], [27.85, 39.4, 'Örnek AC şarj'], [31.47, 40.1, 'Örnek DC hızlı şarj'], [31.6, 38.54, 'Örnek DC hızlı şarj']],
    ibadet: [[29.08, 40.3, 'Örnek cami', 'Cami'], [27.85, 39.6, 'Örnek mescit', 'Mescit'], [30.2, 40.45, 'Örnek cami', 'Cami'], [31.98, 39.04, 'Örnek mescit', 'Mescit']],
    dinlenme: [[29.05, 40.45, 'Örnek dinlenme alanı', 'Aydınlatma, tuvalet'], [27.7, 39.05, 'Örnek dinlenme alanı', 'Aydınlatma, kafeterya'], [30.85, 40.24, 'Örnek dinlenme alanı', 'Aydınlatma, tuvalet'], [31.27, 38.04, 'Örnek dinlenme alanı', 'Tuvalet, kafeterya'], [28.95, 40.33, 'Örnek bağ evi', 'Konaklamalı · bağ evi lokantası, 6 oda'], [27.98, 39.42, 'Örnek yeme-içme çiftliği', 'Konaklamalı · bungalov, çiftlik kahvaltısı'], [27.55, 38.72, 'Örnek köy lokantası', 'Konaklamalı · köy evi, akşam yemeği'], [32.4, 39.5, 'Örnek yeme-içme çiftliği', 'Konaklamalı · bungalov']]
  },
  iller: [
    { il: 'Bursa', lng: 29.06, lat: 40.2, neYenir: ['İskender', 'Pideli köfte'], neAlinir: ['Kestane şekeri'] },
    { il: 'Balıkesir', lng: 27.89, lat: 39.65, neYenir: ['Höşmerim'], neAlinir: ['Zeytinyağı'] },
    { il: 'Manisa', lng: 27.43, lat: 38.62, neYenir: ['Manisa kebabı'], neAlinir: ['Mesir macunu'] },
    { il: 'İzmir', lng: 27.14, lat: 38.42, neYenir: ['Boyoz', 'Kumru'], neAlinir: ['Kuru incir'] }
  ]
};
