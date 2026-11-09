/* Dada Route örnek kara yolu ağı: il merkezleri arası ana karayolu bağları. Rota çizgisi bu ağ üstünden çizilir, denizden düz geçmez
   (Beyar, 9 Kas: İstanbul–Balıkesir Marmara'nın üstünden düz geçiyordu). Köprüler ağdadır: Osmangazi (İzmit Körfezi), 1915 Çanakkale.
   Biçim: [il A, il B, ara noktalar [[enlem, boylam], ...], içinden geçilen iller]. Ara noktalar yaklaşık; hesaplanmış yol değildir, "prototip örneği". */
window.DG_YOL_AGI = {
  bag: [
    ['Edirne', 'Kırklareli'], ['Edirne', 'Tekirdağ', [[40.856, 26.63]]], ['Kırklareli', 'Tekirdağ', [[41.4, 27.36]]],
    ['Edirne', 'İstanbul', [[41.4, 27.36], [41.16, 27.8], [41.1, 28.25], [41.04, 28.6]], ['Kırklareli', 'Tekirdağ']],
    ['Tekirdağ', 'İstanbul', [[41.16, 27.8], [41.1, 28.25], [41.04, 28.6]]],
    ['Tekirdağ', 'Çanakkale', [[40.89, 26.9], [40.53, 26.77], [40.41, 26.67], [40.34, 26.69]]],
    ['Edirne', 'Çanakkale', [[40.856, 26.63], [40.53, 26.77], [40.41, 26.67], [40.34, 26.69]]],
    ['İstanbul', 'Kocaeli', [[41.0, 29.06], [40.9, 29.28], [40.8, 29.5]]],
    ['İstanbul', 'Yalova', [[41.0, 29.06], [40.9, 29.28], [40.79, 29.47], [40.71, 29.51], [40.68, 29.4]], ['Kocaeli']],
    ['Kocaeli', 'Yalova', [[40.717, 29.82], [40.69, 29.61], [40.68, 29.4]]],
    ['Yalova', 'Bursa', [[40.49, 29.31], [40.3, 29.12]]],
    ['Kocaeli', 'Sakarya'], ['Sakarya', 'Düzce'], ['Düzce', 'Bolu'], ['Sakarya', 'Bilecik', [[40.4, 30.15]]],
    ['Bolu', 'Ankara', [[40.8, 32.2], [40.47, 32.65]]], ['Düzce', 'Zonguldak', [[41.06, 31.2], [41.28, 31.42]]],
    ['Zonguldak', 'Bartın', [[41.5, 32.05]]], ['Zonguldak', 'Karabük'], ['Bartın', 'Karabük'], ['Karabük', 'Kastamonu'], ['Zonguldak', 'Bolu', [[41.17, 31.95], [40.94, 32.07]]],
    ['Bolu', 'Karabük', [[40.8, 32.2], [41.0, 32.5]]],
    ['Bolu', 'Çorum', [[40.8, 32.2], [40.92, 33.63], [41.02, 34.04], [40.98, 34.8]], ['Çankırı', 'Kastamonu']],
    ['Çorum', 'Amasya'], ['Amasya', 'Samsun', [[40.97, 35.66]]], ['Çorum', 'Samsun', [[40.87, 35.46], [40.97, 35.66]], ['Amasya']],
    ['Kastamonu', 'Sinop', [[41.47, 34.77]]], ['Sinop', 'Samsun', [[41.8, 35.2], [41.66, 35.27], [41.58, 35.55], [41.57, 35.91]]],
    ['Kastamonu', 'Çankırı'], ['Çankırı', 'Ankara'], ['Çankırı', 'Çorum', [[40.92, 33.63], [40.6, 34.3]]],
    ['Samsun', 'Ordu', [[41.2, 36.73], [41.12, 37.29]]], ['Ordu', 'Giresun'], ['Giresun', 'Trabzon'], ['Trabzon', 'Rize'], ['Rize', 'Artvin', [[41.39, 41.42]]],
    ['Trabzon', 'Gümüşhane', [[40.81, 39.61]]], ['Gümüşhane', 'Bayburt'], ['Bayburt', 'Erzurum'], ['Artvin', 'Ardahan'], ['Ardahan', 'Kars'], ['Kars', 'Erzurum', [[40.33, 42.59]]],
    ['Kars', 'Iğdır'], ['Iğdır', 'Ağrı'], ['Ağrı', 'Erzurum'], ['Ağrı', 'Van', [[39.03, 43.36]]], ['Van', 'Bitlis', [[38.29, 43.1], [38.33, 42.75], [38.5, 42.28]]],
    ['Van', 'Hakkâri'], ['Hakkâri', 'Şırnak'], ['Şırnak', 'Siirt'], ['Siirt', 'Batman'], ['Batman', 'Diyarbakır'], ['Bitlis', 'Muş'], ['Bitlis', 'Siirt'],
    ['Muş', 'Bingöl'], ['Bingöl', 'Elazığ'], ['Bingöl', 'Erzurum'], ['Erzurum', 'Erzincan'], ['Erzincan', 'Sivas'], ['Erzincan', 'Tunceli'], ['Tunceli', 'Elazığ'],
    ['Elazığ', 'Malatya'], ['Elazığ', 'Diyarbakır'], ['Malatya', 'Adıyaman', [[38.09, 37.88], [37.78, 37.64]]], ['Malatya', 'Kahramanmaraş'], ['Malatya', 'Sivas'],
    ['Adıyaman', 'Şanlıurfa', [[37.79, 38.62], [37.48, 38.32]]], ['Gaziantep', 'Şanlıurfa', [[37.03, 37.98]]], ['Şanlıurfa', 'Diyarbakır', [[37.75, 39.33]]],
    ['Şanlıurfa', 'Mardin'], ['Mardin', 'Diyarbakır'], ['Mardin', 'Şırnak', [[37.42, 41.34], [37.33, 42.19]]], ['Gaziantep', 'Kilis'], ['Gaziantep', 'Osmaniye'],
    ['Gaziantep', 'Kahramanmaraş'], ['Kahramanmaraş', 'Adıyaman'], ['Kahramanmaraş', 'Osmaniye'],
    ['Hatay', 'Osmaniye', [[36.59, 36.17], [36.84, 36.24]]], ['Hatay', 'Gaziantep', [[36.5, 36.36], [37.03, 36.63]]], ['Osmaniye', 'Adana'], ['Adana', 'Mersin', [[36.92, 34.89]]],
    ['Mersin', 'Antalya', [[36.63, 34.3], [36.38, 33.93], [36.08, 32.84], [36.27, 32.31], [36.54, 32.0], [36.79, 31.44]]],
    ['Adana', 'Niğde', [[37.4, 34.87]]], ['Niğde', 'Nevşehir'], ['Niğde', 'Aksaray'], ['Niğde', 'Kayseri'], ['Nevşehir', 'Kayseri'], ['Nevşehir', 'Aksaray'], ['Nevşehir', 'Kırşehir'],
    ['Kayseri', 'Sivas'], ['Kayseri', 'Kahramanmaraş'], ['Kayseri', 'Yozgat'], ['Yozgat', 'Sivas'], ['Yozgat', 'Kırıkkale'], ['Yozgat', 'Çorum'], ['Kırıkkale', 'Ankara'],
    ['Kırıkkale', 'Kırşehir'], ['Kırıkkale', 'Çorum', [[40.17, 34.37]]], ['Kırşehir', 'Aksaray'], ['Sivas', 'Tokat'], ['Tokat', 'Amasya'], ['Tokat', 'Ordu', [[40.59, 36.95]]],
    ['Sivas', 'Giresun', [[40.29, 38.42]]], ['Ankara', 'Aksaray'], ['Aksaray', 'Konya'], ['Ankara', 'Konya'], ['Ankara', 'Eskişehir', [[39.58, 32.15], [39.45, 31.54]]],
    ['Konya', 'Karaman'], ['Karaman', 'Mersin', [[36.38, 33.93]]], ['Konya', 'Antalya', [[37.42, 31.85], [36.79, 31.44]]], ['Konya', 'Afyonkarahisar', [[38.36, 31.42]]],
    ['Afyonkarahisar', 'Eskişehir'], ['Afyonkarahisar', 'Kütahya'], ['Afyonkarahisar', 'Isparta'], ['Afyonkarahisar', 'Uşak'], ['Afyonkarahisar', 'Denizli', [[38.07, 30.17]]],
    ['Isparta', 'Burdur'], ['Isparta', 'Antalya'], ['Burdur', 'Antalya'], ['Burdur', 'Denizli'], ['Denizli', 'Aydın', [[37.91, 28.32]]], ['Denizli', 'Muğla'], ['Denizli', 'Uşak'],
    ['Uşak', 'Manisa', [[38.55, 28.65], [38.48, 28.14]]], ['Kütahya', 'Uşak'], ['Kütahya', 'Bursa', [[39.54, 29.49]]], ['Kütahya', 'Eskişehir'], ['Eskişehir', 'Bilecik'],
    ['Bilecik', 'Bursa', [[40.08, 29.51]]], ['Bursa', 'Balıkesir', [[40.06, 28.72]]], ['Balıkesir', 'Manisa', [[39.4, 27.85]]], ['Balıkesir', 'Çanakkale', [[40.05, 27.05]]],
    ['Çanakkale', 'İzmir', [[39.79, 26.33], [39.6, 26.4], [39.56, 26.62], [39.6, 27.02], [39.5, 26.97], [39.39, 26.86], [39.12, 27.18], [38.61, 27.07]], ['Balıkesir']],
    ['Manisa', 'İzmir'], ['İzmir', 'Aydın', [[38.16, 27.36]]], ['Aydın', 'Muğla'], ['Muğla', 'Antalya', [[36.97, 28.69], [36.62, 29.12], [36.2, 29.64], [36.3, 30.15], [36.6, 30.56]]]
  ],
  /* İlçe ve semtin il ağına bağlanışı, kıyıdan dolanan yerlerde ara noktayla: [il, ara noktalar] */
  /* sıra il → ilçe */
  ilce: {
    'Çeşme': [['İzmir', [[38.32, 26.77]]]],
    'Alaçatı': [['İzmir', [[38.32, 26.77]]]],
    'Urla': [['İzmir', []]],
    'Bodrum': [['Muğla', [[37.32, 27.78], [37.22, 27.7], [37.14, 27.58]]], ['Aydın', [[37.32, 27.78], [37.22, 27.7], [37.14, 27.58]]]],
    'Ayvalık': [['Balıkesir', [[39.5, 26.97], [39.39, 26.86]]], ['İzmir', [[38.61, 27.07], [39.12, 27.18]]]]
  }
};
